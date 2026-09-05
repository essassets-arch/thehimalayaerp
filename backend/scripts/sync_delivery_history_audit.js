const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const targetDbs = [
  { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Docker DB 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
];

function parseDateIndian(dateStr) {
  if (!dateStr || dateStr === '—') return new Date();
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(am|pm)$/i);
  if (!match) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  let hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);
  const seconds = parseInt(match[6], 10);
  const ampm = match[7].toLowerCase();

  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;

  return new Date(year, month, day, hours, minutes, seconds);
}

function parseCSV(content) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || row[0] !== '') {
          result.push(row);
        }
        row = [];
        cell = '';
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        cell += char;
      }
    }
  }
  
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  
  return result;
}

async function syncDb(config, csvRows) {
  console.log(`\n======================================================================`);
  console.log(` SYNCING DELIVERY HISTORY AUDIT CSV INTO: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      console.error('No company found in database.');
      return;
    }

    const d1User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'ravikant.tiwari@himalayaerp.com' },
          { email: 'ravikant.t@himalayaerp.com' },
          { dispatchCategory: 'D1' },
          { dispatchCategory: 'Category 1' }
        ]
      }
    }) || await prisma.user.findFirst();

    const salesUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'sales1@himalayaerp.com' },
          { email: 'supersales1@himalayaerp.com' },
          { email: 'hussain.t@himalayaerp.com' }
        ]
      }
    }) || d1User;

    const defaultProduct = await prisma.product.findFirst({
      where: {
        dispatchCategory: 'D1'
      }
    }) || await prisma.product.findFirst();

    let createdSOs = 0;
    let syncedDispatches = 0;

    for (let i = 0; i < csvRows.length; i++) {
      const r = csvRows[i];
      const deliveredDate = parseDateIndian(r.deliveredTimestamp);
      const podUrl = r.podUrl !== '—' && r.podUrl ? r.podUrl : null;
      const transporter = r.transporter !== '—' && r.transporter ? r.transporter : null;
      const receiverMobile = r.receiverMobile !== '—' && r.receiverMobile ? r.receiverMobile : null;
      const receivedBy = r.receivedBy !== '—' && r.receivedBy ? r.receivedBy : null;
      const driver = r.driver !== '—' && r.driver ? r.driver : null;
      const vehicle = r.vehicle !== '—' && r.vehicle ? r.vehicle : null;
      const deliveryAddress = r.address !== '—' && r.address ? r.address : null;

      // 1. Ensure Customer exists
      let customer = await prisma.customer.findFirst({
        where: { companyName: { equals: r.customer.trim(), mode: 'insensitive' } }
      });

      if (!customer) {
        const custCount = await prisma.customer.count();
        customer = await prisma.customer.create({
          data: {
            companyName: r.customer.trim(),
            customerCode: `CUST-${String(custCount + 1).padStart(4, '0')}`,
            companyId: company.id,
            contactPerson: receivedBy || 'Store Manager',
            phone: receiverMobile || '9876543210',
            email: 'info@thehimalaya.co.in',
            billingAddress: deliveryAddress || 'Gujarat, India',
            shippingAddress: deliveryAddress || 'Gujarat, India',
            createdById: salesUser.id,
            status: 'ACTIVE'
          }
        });
      }

      // 2. Ensure Sales Order exists
      let salesOrder = await prisma.salesOrder.findFirst({
        where: { orderNumber: r.salesOrder.trim() },
        include: { items: true }
      });

      if (!salesOrder) {
        salesOrder = await prisma.salesOrder.create({
          data: {
            orderNumber: r.salesOrder.trim(),
            customerId: customer.id,
            salesExecutiveId: salesUser.id,
            createdById: salesUser.id,
            status: 'CONFIRMED',
            shippingAddress: deliveryAddress,
            requestedDeliveryDate: deliveredDate,
            subtotal: new Prisma.Decimal(25000),
            discountAmount: new Prisma.Decimal(0),
            taxableAmount: new Prisma.Decimal(25000),
            taxAmount: new Prisma.Decimal(4500),
            freightAmount: new Prisma.Decimal(0),
            totalAmount: new Prisma.Decimal(29500),
            createdAt: deliveredDate,
            items: {
              create: [
                {
                  productId: defaultProduct.id,
                  productNameSnapshot: defaultProduct.name,
                  orderedQuantity: new Prisma.Decimal(5),
                  unit: 'NOS',
                  unitPrice: new Prisma.Decimal(5000),
                  discountAmount: new Prisma.Decimal(0),
                  taxableAmount: new Prisma.Decimal(25000),
                  taxRate: new Prisma.Decimal(18),
                  taxAmount: new Prisma.Decimal(4500),
                  lineTotal: new Prisma.Decimal(29500)
                }
              ]
            }
          },
          include: { items: true }
        });
        createdSOs++;
      }

      // 3. Upsert Dispatch Record
      const existingDispatch = await prisma.dispatch.findFirst({
        where: { dispatchNo: r.dispatchNo.trim() }
      });

      const soItem = salesOrder.items[0];

      const dispatchPayload = {
        dispatchNo: r.dispatchNo.trim(),
        salesOrderId: salesOrder.id,
        dispatchCategory: 'D1',
        status: 'DELIVERED',
        isSubmitted: true,
        deliveryAddress: deliveryAddress,
        packageCount: salesOrder.items.length || 1,
        packageType: 'WOODEN_PALLET',
        totalWeight: new Prisma.Decimal(225),
        transporterName: transporter,
        vehicleNumber: vehicle,
        vehicleType: 'TRUCK',
        driverName: driver,
        driverPhone: receiverMobile || '9876543210',
        freightType: 'PAID',
        freightAmount: new Prisma.Decimal(0),
        loadingStartedAt: deliveredDate,
        loadingCompletedAt: deliveredDate,
        loadedQuantity: new Prisma.Decimal(5),
        vehicleClean: true,
        sealNumber: `SEAL-${r.dispatchNo.replace(/[^0-9]/g, '')}`,
        loadingSupervisor: 'Plant Supervisor',
        dispatchedAt: deliveredDate,
        dispatchedById: d1User.id,
        gateOutAt: deliveredDate,
        gatePassNumber: `GP-${r.dispatchNo.replace(/[^0-9]/g, '')}`,
        gateSecurityConfirmed: true,
        outForDeliveryAt: deliveredDate,
        deliveryContactPerson: receivedBy,
        deliveryContactPhone: receiverMobile,
        deliveredAt: deliveredDate,
        deliveredQuantity: new Prisma.Decimal(5),
        shortQuantity: new Prisma.Decimal(0),
        damagedQuantity: new Prisma.Decimal(0),
        receivedBy: receivedBy,
        receiverPhone: receiverMobile,
        receiverDesignation: 'Site Incharge',
        deliveryRemarks: 'Delivered in good condition with complete accessories',
        podUrl: podUrl,
        podStatus: 'APPROVED',
        podReceivedAt: deliveredDate,
        podApprovedAt: deliveredDate,
        podApprovedById: d1User.id,
        closedAt: deliveredDate,
        closedById: d1User.id,
        version: 1,
        createdById: d1User.id,
        createdAt: deliveredDate,
        updatedAt: deliveredDate
      };

      if (existingDispatch) {
        await prisma.dispatch.update({
          where: { id: existingDispatch.id },
          data: dispatchPayload
        });
      } else {
        await prisma.dispatch.create({
          data: {
            ...dispatchPayload,
            items: soItem ? {
              create: [
                {
                  salesOrderItemId: soItem.id,
                  quantity: soItem.orderedQuantity || new Prisma.Decimal(5)
                }
              ]
            } : undefined
          }
        });
      }

      syncedDispatches++;
    }

    console.log(`✅ [${config.name}] SUMMARY:`);
    console.log(`   - Sales Orders Synced/Created: ${createdSOs}`);
    console.log(`   - Dispatches Synced in D1    : ${syncedDispatches} (Status: DELIVERED, Category: D1)`);
    console.log(`   - Total D1 Dispatches in DB : ${await prisma.dispatch.count({ where: { dispatchCategory: 'D1' } })}`);
    console.log(`   - Total Delivered Dispatches : ${await prisma.dispatch.count({ where: { status: 'DELIVERED', dispatchCategory: 'D1' } })}`);
    console.log(`   - Total Dispatches with POD  : ${await prisma.dispatch.count({ where: { podUrl: { not: null }, dispatchCategory: 'D1' } })}`);

  } catch (err) {
    console.error(`❌ Error in ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const csvPath = 'D:/prototype-next-main/delivery_history_audit_2026-09-05 (2).csv';
  console.log(`Reading CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const dataRows = rows.slice(1).filter(r => r.length > 1 && r[0]);

  const csvRecords = dataRows.map(r => ({
    dispatchNo: r[0].trim(),
    salesOrder: r[1].trim(),
    customer: r[2].trim(),
    address: r[3].trim(),
    receivedBy: r[4].trim(),
    receiverMobile: r[5].trim(),
    driver: r[6].trim(),
    vehicle: r[7].trim(),
    transporter: r[8].trim(),
    deliveredTimestamp: r[9].trim(),
    podUrl: r[10].trim(),
    status: r[11].trim()
  }));

  console.log(`Parsed ${csvRecords.length} delivery history records.`);

  for (const dbConfig of targetDbs) {
    await syncDb(dbConfig, csvRecords);
  }
}

main().catch(console.error);
