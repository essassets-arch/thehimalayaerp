const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isDocker = require('fs').existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));
const targetDbs = [];

if (process.env.DATABASE_URL) {
  targetDbs.push({ name: 'Configured DATABASE_URL', url: process.env.DATABASE_URL });
}
if (process.env.LIVE_DATABASE_URL) {
  targetDbs.push({ name: 'Live Database', url: process.env.LIVE_DATABASE_URL });
}
if (process.env.PROD_DATABASE_URL) {
  targetDbs.push({ name: 'Production Database', url: process.env.PROD_DATABASE_URL });
}

if (!isDocker) {
  targetDbs.push(
    { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
  );
}

const seen = new Set();
const uniqueTargetDbs = targetDbs.filter(db => {
  if (seen.has(db.url)) return false;
  seen.add(db.url);
  return true;
});

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
        row.push(cell.trim());
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
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
    row.push(cell.trim());
    result.push(row);
  }
  
  return result;
}

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    let y = parseInt(parts[2], 10);
    if (y < 100) y += 2000;
    return new Date(Date.UTC(y, m, d, 6, 0, 0));
  }
  return new Date();
}

function parseAddressObj(addrStr, stateStr, cityStr, pinStr) {
  const line1 = (addrStr || 'Plot No. 12, Industrial Area').replace(/[\r\n]+/g, ' ').trim();
  const city = (cityStr || 'Ahmedabad').trim();
  const state = (stateStr || 'Gujarat').trim();
  const pincode = (pinStr || '380001').trim();
  return {
    line1,
    city,
    state,
    pincode,
    country: 'India'
  };
}

function findProduct(prodType, prodSize, prodCap, allProducts) {
  let t = (prodType || '').toUpperCase().trim();
  if (t === 'D MHC') t = 'MHC';

  let s = (prodSize || '').toUpperCase().trim().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900';
  
  let c = (prodCap || '').toUpperCase().trim();
  if (c === '3T') c = 'LD';

  let match = allProducts.find(p => {
    const name = (p.name || '').toUpperCase();
    const sku = (p.sku || '').toUpperCase();
    return (name.includes(t) || sku.includes(t)) &&
           (name.includes(s) || sku.includes(s)) &&
           (name.includes(c) || sku.includes(c));
  });

  if (!match) {
    // Fallback 1: match by size and capacity
    match = allProducts.find(p => {
      const name = (p.name || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      return (name.includes(s) || sku.includes(s)) &&
             (name.includes(c) || sku.includes(c));
    });
  }

  if (!match) {
    // Fallback 2: match by type and size
    match = allProducts.find(p => {
      const name = (p.name || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      return (name.includes(t) || sku.includes(t)) &&
             (name.includes(s) || sku.includes(s));
    });
  }

  if (!match) {
    // Fallback 3: match by size
    match = allProducts.find(p => {
      const name = (p.name || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      return name.includes(s) || sku.includes(s);
    });
  }

  return match || allProducts[0];
}

async function alignDatabaseColumns(prisma) {
  const statements = [
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "projectName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "groupName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "gstName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "gstNumber" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "contactPerson" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "detailedItems" JSONB;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "address" JSONB;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedCustomerId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedById" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "taxableAmount" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paidAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "outstandingAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'INR';`
  ];

  for (const query of statements) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (e) {}
  }
}

async function syncSales1Database(config) {
  console.log(`\n======================================================================`);
  console.log(`SYNCHRONIZING SALES 1 (sales1@himalayaerp.com): ${config.name}`);
  console.log(`======================================================================`);

  let prisma;
  try {
    prisma = new PrismaClient({ datasources: { db: { url: config.url } } });
    await prisma.$connect();
  } catch (err) {
    console.warn(`Could not connect to ${config.name}: ${err.message}. Skipping.`);
    return;
  }

  try {
    await alignDatabaseColumns(prisma);

    const s1CsvPath = [
      path.resolve('jesal.csv'),
      path.resolve('backend/scripts/jesal.csv'),
      path.resolve('scripts/jesal.csv'),
      path.resolve('d:/prototype-next-main/jesal.csv')
    ].find(p => fs.existsSync(p));

    if (!s1CsvPath) {
      throw new Error('Sales 1 (jesal.csv) file not found!');
    }

    console.log(`Reading CSV from: ${s1CsvPath}`);
    const s1Content = fs.readFileSync(s1CsvPath, 'utf8');
    const s1Rows = parseCSV(s1Content).slice(1).filter(r => r.length > 5 && r[0]);

    console.log(`Loaded ${s1Rows.length} item rows from Sales 1 CSV.`);

    // 1. Identify Sales 1 User and Company
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: 'sales1@himalayaerp.com', mode: 'insensitive' }
      },
      include: { role: true, company: true }
    });

    if (!user) {
      console.error('Sales 1 user (sales1@himalayaerp.com) not found in DB!');
      return;
    }
    const userId = user.id;
    const companyId = user.companyId;

    console.log(`Sales 1 User: ${user.name} (${user.email}), ID: ${userId}`);

    // 2. Clean existing Sales 1 data strictly (NEVER TOUCH SUPERSALES 1 OR SUPERSALES 2)
    console.log('Cleaning existing Sales 1 records (SuperSales 1 and 2 will be completely untouched)...');

    // Build list of order numbers from 0169 to 0230 to clean if any
    const seqNumbersToClean = [];
    for (let s = 169; s <= 230; s++) {
      seqNumbersToClean.push(String(s).padStart(4, '0'));
    }

    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { in: seqNumbersToClean.map(s => `HCPPL/2627/${s}`) } },
          { orderNumber: { in: seqNumbersToClean.map(s => `SO/2627/${s}`) } },
          { orderNumber: { startsWith: 'SO-S1-' } },
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Jesal', mode: 'insensitive' } },
          { remarks: { contains: 'Sales 1 Jesal', mode: 'insensitive' } }
        ]
      },
      select: { id: true, orderNumber: true }
    });

    const existingQuotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { quotationNumber: { in: seqNumbersToClean.map(s => `QT/2627/${s}`) } },
          { quotationNumber: { startsWith: 'QT-S1-' } },
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Jesal', mode: 'insensitive' } },
          { remarks: { contains: 'Sales 1 Jesal', mode: 'insensitive' } }
        ]
      },
      select: { id: true, quotationNumber: true }
    });

    const existingLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { leadNumber: { in: seqNumbersToClean.map(s => `LD/2627/${s}`) } },
          { leadNumber: { startsWith: 'LD-S1-' } },
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { remarks: { contains: 'Jesal', mode: 'insensitive' } },
          { remarks: { contains: 'Sales 1 Jesal', mode: 'insensitive' } }
        ]
      },
      select: { id: true, leadNumber: true }
    });

    const orderIdsToDel = existingOrders.map(o => o.id);
    const quoteIdsToDel = existingQuotes.map(q => q.id);
    const leadIdsToDel = existingLeads.map(l => l.id);

    if (orderIdsToDel.length > 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM "InvoiceItem" WHERE "invoiceId" IN (SELECT id FROM "SalesInvoice" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}'))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesInvoice" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "DispatchItem" WHERE "dispatchId" IN (SELECT id FROM "Dispatch" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}'))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "Dispatch" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "QCInspection" WHERE "workOrderId" IN (SELECT id FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ProductionBatch" WHERE "workOrderId" IN (SELECT id FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "FinishedGoods" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "WorkOrderItem" WHERE "workOrderId" IN (SELECT id FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}'))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ProductionPlanItem" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}'))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ProductionPlan" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderItem" WHERE "salesOrderId" IN ('${orderIdsToDel.join("','")}')`).catch(() => {});
      await prisma.salesOrder.deleteMany({ where: { id: { in: orderIdsToDel } } }).catch(() => {});
    }

    if (quoteIdsToDel.length > 0) {
      await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIdsToDel } } }).catch(() => {});
      await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIdsToDel } } }).catch(() => {});
      await prisma.quotation.deleteMany({ where: { id: { in: quoteIdsToDel } } }).catch(() => {});
    }

    if (leadIdsToDel.length > 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM "FollowUp" WHERE "leadId" IN ('${leadIdsToDel.join("','")}')`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "LeadActivity" WHERE "leadId" IN ('${leadIdsToDel.join("','")}')`).catch(() => {});
      await prisma.lead.deleteMany({ where: { id: { in: leadIdsToDel } } }).catch(() => {});
    }

    console.log('Existing Sales 1 records cleaned cleanly.');

    // 3. Products & Workflow States
    const allProducts = await prisma.product.findMany();
    const defaultProduct = allProducts[0];

    const leadWonState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } } });
    const quoteApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } } });
    const orderConfirmedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } } });

    // 4. Group Sales 1 Rows into distinct transactions
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < s1Rows.length; i++) {
      const r = s1Rows[i];
      const date = (r[0] || '').trim();
      const proj = (r[1] || '').trim();
      const grp = (r[2] || '').trim();
      const gstName = (r[3] || '').trim();
      const key = date + '|' + proj + '|' + grp + '|' + gstName;

      if (!currentGroup || currentGroup.key !== key) {
        currentGroup = {
          index: groups.length + 1,
          key,
          date,
          proj,
          grp,
          gstName,
          gstNo: (r[4] || '').trim(),
          contactPerson: (r[5] || '').trim(),
          phone: (r[6] || '').trim(),
          email: (r[8] || '').trim() || 'info@thehimalaya.co.in',
          addressStr: r[11],
          stateStr: r[12],
          cityStr: r[13],
          pincodeStr: r[14],
          items: [r]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.items.push(r);
      }
    }

    console.log(`Processing ${groups.length} distinct grouped transactions for Sales 1...`);

    // SuperSales 1 ends at 0145, SuperSales 2 ends at 0168 -> Sales 1 starts at 0169
    const baseSeqOffset = 168;

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      const seqStr = String(baseSeqOffset + idx + 1).padStart(4, '0');
      const leadDateObj = parseCsvDate(g.date);
      const parsedAddr = parseAddressObj(g.addressStr, g.stateStr, g.cityStr, g.pincodeStr);

      const customerName = g.gstName || g.proj || g.grp || `Customer S1-${idx + 1}`;
      const gstinVal = (g.gstNo && g.gstNo !== 'URD') ? g.gstNo : null;

      // A. Upsert Customer
      let customer = null;
      if (gstinVal) {
        customer = await prisma.customer.findFirst({
          where: { companyId, gstin: gstinVal }
        });
      }
      if (!customer) {
        customer = await prisma.customer.findFirst({
          where: {
            companyId,
            companyName: { equals: customerName, mode: 'insensitive' }
          }
        });
      }

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            companyId,
            companyName: customerName,
            contactPerson: g.contactPerson || 'Site Incharge',
            phone: g.phone || '9876543210',
            email: g.email || 'customer@example.com',
            gstin: gstinVal,
            status: 'ACTIVE',
            shippingAddress: parsedAddr,
            billingAddress: parsedAddr,
            createdById: userId
          }
        });
      }

      // Calculate totals
      let subTotal = 0;
      let totalTax = 0;
      let grandTotal = 0;
      let totalQty = 0;

      const groupItemsData = g.items.map(it => {
        const prodType = it[15];
        const prodSize = it[16];
        const prodCap = it[17];
        const qty = parseFloat(it[18]) || 1;
        const spec = it[19] || 'GREY';
        const unitPrice = parseFloat(it[20]) || 1000;
        const itemSubTotal = parseFloat(it[21]) || (qty * unitPrice);
        const itemGstAmt = parseFloat(it[23]) || (itemSubTotal * 0.18);
        const itemGrand = parseFloat(it[25]) || (itemSubTotal + itemGstAmt);

        totalQty += qty;
        subTotal += itemSubTotal;
        totalTax += itemGstAmt;
        grandTotal += itemGrand;

        const matchedProd = findProduct(prodType, prodSize, prodCap, allProducts) || defaultProduct;

        return {
          product: matchedProd,
          qty,
          spec,
          unitPrice,
          itemSubTotal,
          itemGstAmt,
          itemGrand
        };
      });

      const primaryProduct = groupItemsData[0]?.product;
      const productInterestStr = `${primaryProduct?.name || 'FRP Products'} (${totalQty} Qty)`;

      // B. Create Lead (1:1) in exact sequence LD/2627/0169...
      const leadNumber = `LD/2627/${seqStr}`;
      const createdLead = await prisma.lead.create({
        data: {
          leadNumber,
          leadDate: leadDateObj,
          companyName: customer.companyName,
          groupName: g.grp,
          projectName: g.proj,
          contactPerson: g.contactPerson || customer.contactPerson,
          phone: g.phone || customer.phone,
          email: g.email || customer.email,
          gstName: g.gstName || customer.companyName,
          gstNumber: (g.gstNo && g.gstNo !== 'URD') ? g.gstNo : customer.gstin,
          address: parsedAddr,
          source: 'OTHER',
          productInterest: productInterestStr,
          detailedItems: groupItemsData.map(gi => ({
            productName: gi.product.name,
            sku: gi.product.sku,
            quantity: gi.qty,
            rate: gi.unitPrice,
            amount: gi.itemSubTotal
          })),
          estimatedQuantity: new Prisma.Decimal(totalQty),
          unit: 'SET',
          remarks: 'Imported from Sales 1 Jesal CSV',
          workflowStateId: leadWonState?.id || null,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId,
          customerId: customer.id,
          convertedCustomerId: customer.id,
          convertedAt: leadDateObj,
          convertedById: userId
        }
      });

      // C. Create Quotation (1:1) in exact sequence QT/2627/0169...
      const quotationNumber = `QT/2627/${seqStr}`;
      const createdQuote = await prisma.quotation.create({
        data: {
          quotationNumber,
          companyId,
          customerId: customer.id,
          leadId: createdLead.id,
          salesExecutiveId: userId,
          createdById: userId,
          approvedById: userId,
          approvedAt: leadDateObj,
          subtotal: new Prisma.Decimal(subTotal),
          discount: new Prisma.Decimal(0),
          tax: new Prisma.Decimal(totalTax),
          total: new Prisma.Decimal(grandTotal),
          expectedTransportationCost: new Prisma.Decimal(0),
          workflowStateId: quoteApprovedState?.id || null,
          createdAt: leadDateObj,
          remarks: 'Imported from Sales 1 Jesal Pipeline',
          items: {
            create: groupItemsData.map(gi => ({
              productId: gi.product.id,
              description: gi.product.name,
              quantity: new Prisma.Decimal(gi.qty),
              unitPrice: new Prisma.Decimal(gi.unitPrice),
              tax: new Prisma.Decimal(18),
              discount: new Prisma.Decimal(0),
              lineTotal: new Prisma.Decimal(gi.itemGrand)
            }))
          }
        }
      });

      // D. Create Sales Order (1:1) in exact sequence HCPPL/2627/0169...
      const orderNumber = `HCPPL/2627/${seqStr}`;
      await prisma.salesOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          quotationId: createdQuote.id,
          sourceQuotationId: createdQuote.id,
          salesExecutiveId: userId,
          createdById: userId,
          orderDate: leadDateObj,
          status: 'CONFIRMED',
          workflowStateId: orderConfirmedState?.id || null,
          subtotal: new Prisma.Decimal(subTotal),
          taxableAmount: new Prisma.Decimal(subTotal),
          discountAmount: new Prisma.Decimal(0),
          taxAmount: new Prisma.Decimal(totalTax),
          freightAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(grandTotal),
          currency: 'INR',
          paidAmount: new Prisma.Decimal(0),
          outstandingAmount: new Prisma.Decimal(grandTotal),
          paymentStatus: 'PENDING',
          billingAddress: parsedAddr,
          shippingAddress: parsedAddr,
          remarks: 'Imported from Sales 1 Jesal CSV',
          version: 1,
          createdAt: leadDateObj,
          items: {
            create: groupItemsData.map(gi => ({
              productId: gi.product.id,
              productNameSnapshot: gi.product.name,
              productCodeSnapshot: gi.product.sku,
              orderedQuantity: new Prisma.Decimal(gi.qty),
              unitPrice: new Prisma.Decimal(gi.unitPrice),
              discountAmount: new Prisma.Decimal(0),
              taxableAmount: new Prisma.Decimal(gi.itemSubTotal),
              taxRate: new Prisma.Decimal(18),
              taxAmount: new Prisma.Decimal(gi.itemGstAmt),
              lineTotal: new Prisma.Decimal(gi.itemGrand),
              unit: 'SET'
            }))
          }
        }
      });
    }

    console.log(`\n======================================================================`);
    console.log(`SYNC FINISHED FOR Sales 1 (${config.name})`);
    console.log(`======================================================================`);
    console.log(`Total Leads Created (WON)             : ${groups.length}`);
    console.log(`Total Quotations Created (APPROVED)   : ${groups.length}`);
    console.log(`Total Sales Orders Created (CONFIRMED): ${groups.length}`);
    console.log(`Sequence Range                        : 0169 to ${String(baseSeqOffset + groups.length).padStart(4, '0')}`);
    console.log(`Orders Page Target                    : https://thehimalaya.cloud/sales/orders`);
    console.log(`Downstream (Plant/QC/Dispatch)        : STOPPED AT ORDERS AS REQUESTED`);

  } catch (err) {
    console.error(`Error in ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of uniqueTargetDbs) {
    await syncSales1Database(cfg);
  }
}

main();
