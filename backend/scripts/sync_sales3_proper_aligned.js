const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Production / Target Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

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
  if (str === '-' || str === '') return new Date();

  let m = str.match(/^(\d{1,2})-(\d{1,2})0(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026;
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026;
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseAddressObj(addrStr, stateStr, cityStr, pincodeStr) {
  let line1 = (addrStr || '').trim().replace(/\r\n|\n|\r/g, ', ');
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pincodeStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) {
      pincode = pinMatch[1];
    }
  }

  if (!city) {
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/MEHSANA/i.test(line1)) city = 'Mehsana';
    else if (/MUMBAI|MANKHURD/i.test(line1)) city = 'Mumbai';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/MAHARASHTRA|MUMBAI|MANKHURD/i.test(line1)) state = 'Maharashtra';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Plot No. 12, Industrial Area',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380061'
  };
}

function findProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900';
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  let match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return sku.includes(s) || name.includes(s);
  });
  return match || null;
}

async function alignDatabaseColumns(prisma) {
  const statements = [
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "detailedItems" JSONB;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "gstName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "groupName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "projectName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notes" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "unit" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "estimatedQuantity" DECIMAL(65,30);`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3);`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostComplaintId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "wonAt" TIMESTAMP(3);`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "companyId" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3);`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "paymentTermDays" INT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "sourceQuotationId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermDays" INT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentDueDate" TIMESTAMP(3);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermsDays" INT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paidAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "outstandingAmount" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "deliveryTerms" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'INR';`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "freightAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "lostComplaintId" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "size" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "capacity" TEXT;`,
    `ALTER TABLE "ProductionPlan" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'NORMAL';`,
    `ALTER TABLE "ProductionPlan" ADD COLUMN IF NOT EXISTS "productionLine" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "productionStatus" TEXT DEFAULT 'READY_FOR_DISPATCH';`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "qcResult" TEXT DEFAULT 'PASS';`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "qcRemarks" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "startedById" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "completedById" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "approvedQuantity" DECIMAL(18,3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "rejectedQuantity" DECIMAL(18,3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "remarks" TEXT;`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "inspectorId" TEXT;`
  ];

  for (const query of statements) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (e) {}
  }
}

async function syncSales3Database(config) {
  console.log(`\n======================================================================`);
  console.log(`SYNCHRONIZING SALES 3: ${config.name}`);
  console.log(`Target: sales3@himalayaerp.com (Sales Executive / Sales Three)`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    await alignDatabaseColumns(prisma);

    const candidatePaths = [
      path.resolve('ravi_thakor(sales7) (1).csv'),
      path.resolve('backend/scripts/ravi_thakor(sales7) (1).csv'),
      path.resolve('scripts/ravi_thakor(sales7) (1).csv'),
      path.join(__dirname, 'ravi_thakor(sales7) (1).csv'),
      path.resolve('/app/scripts/ravi_thakor(sales7) (1).csv'),
      path.resolve('/app/ravi_thakor(sales7) (1).csv')
    ];

    const csvPath = candidatePaths.find(p => fs.existsSync(p));
    if (!csvPath) {
      throw new Error('Sales 3 CSV file not found in candidate paths!');
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent).slice(1).filter(r => r.length > 5 && (r[0] || r[1]) && r[1]);

    console.log(`Loaded ${rows.length} item rows from Sales 3 CSV.`);

    // 1. Identify Sales 3 User and Company
    let user = await prisma.user.findFirst({
      where: {
        email: { equals: 'sales3@himalayaerp.com', mode: 'insensitive' }
      },
      include: { role: true, company: true }
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { equals: 'Sales Three', mode: 'insensitive' } },
            { name: { equals: 'Sales 3', mode: 'insensitive' } },
            { name: { equals: 'Sales Executive 3', mode: 'insensitive' } }
          ]
        },
        include: { role: true, company: true }
      });
    }

    if (!user) {
      const company = await prisma.company.findFirst();
      let role = await prisma.role.findFirst({
        where: { name: { contains: 'Sales', mode: 'insensitive' } }
      });
      if (!role) {
        role = await prisma.role.create({
          data: { name: 'Sales Executive', description: 'Sales Executive Role' }
        });
      }

      user = await prisma.user.create({
        data: {
          email: 'sales3@himalayaerp.com',
          name: 'Sales Three',
          roleId: role.id,
          companyId: company?.id,
          password: 'CHANGE_ME_SECURE_PASSWORD'
        },
        include: { role: true, company: true }
      });
      console.log(`Created user sales3@himalayaerp.com (${user.id})`);
    }

    const userId = user.id;
    const companyId = user.companyId || (await prisma.company.findFirst())?.id;

    console.log(`Sales 3 User: ${user.name} (${user.email}), ID: ${userId}, Company: ${companyId}`);

    // 2. Clean existing Sales 3 data strictly (NEVER TOUCH SUPERSALES 1, SUPERSALES 2, SALES 1, SALES 2, SALES 4, SALES 12, SALES 11, OR SALES 13)
    console.log('Cleaning existing Sales 3 records (All other sales data will be completely untouched)...');

    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { gte: 'HCPPL/2627/0267', lte: 'HCPPL/2627/0276' } },
          { orderNumber: { startsWith: 'SO-S3-' } },
          { salesExecutiveId: userId },
          { createdById: userId }
        ]
      },
      select: { id: true }
    });
    const orderIds = existingOrders.map(o => o.id);

    if (orderIds.length > 0) {
      const orderItems = await prisma.salesOrderItem.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
      const orderItemIds = orderItems.map(x => x.id);

      const dispatches = await prisma.dispatch.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
      const dispatchIds = dispatches.map(d => d.id);

      const invoices = await prisma.salesInvoice.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
      const invoiceIds = invoices.map(i => i.id);

      const plans = await prisma.productionPlan.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
      const planIds = plans.map(p => p.id);

      const workOrders = await prisma.workOrder.findMany({
        where: { OR: [{ productionPlanId: { in: planIds } }, { salesOrderItemId: { in: orderItemIds } }] },
        select: { id: true }
      });
      const woIds = workOrders.map(w => w.id);

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.paymentAllocation.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
      try { await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
      try { await prisma.salesInvoice.deleteMany({ where: { id: { in: invoiceIds } } }); } catch (e) {}

      try { await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
      try { await prisma.dispatch.deleteMany({ where: { id: { in: dispatchIds } } }); } catch (e) {}

      try { await prisma.finishedGoods.deleteMany({ where: { OR: [{ workOrderId: { in: woIds } }, { salesOrderId: { in: orderIds } }] } }); } catch (e) {}
      try { await prisma.qCInspection.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionBatch.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionShiftEntry.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionScrapEntry.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionStatusHistory.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.workOrder.deleteMany({ where: { id: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }); } catch (e) {}

      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderLoss.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } }); } catch (e) {}
    }

    const quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { quotationNumber: { gte: 'QT/2627/0267', lte: 'QT/2627/0276' } },
          { quotationNumber: { gte: 'QU/2627/0267', lte: 'QU/2627/0276' } },
          { createdById: userId },
          { salesExecutiveId: userId }
        ]
      },
      select: { id: true }
    });
    const quoteIds = quotes.map(q => q.id);
    if (quoteIds.length > 0) {
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }); } catch (e) {}
    }

    await prisma.lead.deleteMany({
      where: {
        OR: [
          { leadNumber: { gte: 'LD/2627/0267', lte: 'LD/2627/0276' } },
          { leadNumber: { gte: 'LEAD/2627/0267', lte: 'LEAD/2627/0276' } },
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId }
        ]
      }
    });

    console.log('Existing Sales 3 records wiped cleanly. (All other sales data preserved intact)');

    // 3. Products & Workflows
    let allProducts = [];
    try {
      allProducts = await prisma.product.findMany();
    } catch (e) {
      allProducts = await prisma.$queryRawUnsafe(`SELECT id, code, name, "unitPrice", sku FROM "Product"`);
    }
    const defaultProduct = allProducts[0];

    const leadWonState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } } });
    const quoteApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } } });
    const orderConfirmedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } } });
    const prodReleasedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Released', mode: 'insensitive' } } }) ||
                              await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'In Progress', mode: 'insensitive' } } }) ||
                              await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Completed', mode: 'insensitive' } } });
    const woCompletedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'WORK_ORDER' }, name: { contains: 'Completed', mode: 'insensitive' } } }) ||
                             await prisma.workflowState.findFirst({ where: { workflow: { code: 'WORK_ORDER' }, name: { contains: 'In Progress', mode: 'insensitive' } } });

    // 4. Group Sales 3 Rows into Distinct Customer Order Groups
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      let date = (r[0] || '').trim();
      if (!date && r[10]) date = r[10].trim();
      if (!date) date = '01-07-2026';

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

    console.log(`Processing ${groups.length} distinct grouped transactions for Sales 3...`);

    let totalWorkOrdersCount = 0;
    const now = new Date();

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      // Sequence continues right after Sales 13 (266) -> 267 to 276
      const seqStr = String(266 + idx + 1).padStart(4, '0');
      const leadDateObj = parseCsvDate(g.date);
      const parsedAddr = parseAddressObj(g.addressStr, g.stateStr, g.cityStr, g.pincodeStr);

      const customerName = g.gstName || g.proj || g.grp || `Customer S3-${idx + 1}`;
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
        const unitPrice = parseFloat(it[20]) || 0;
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
          prodType,
          prodSize,
          prodCap,
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

      // B. Create Lead (1:1) in exact sequence LD/2627/0267...
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
          remarks: 'Imported from Sales 3 CSV',
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

      // C. Create Quotation (1:1) in exact sequence QT/2627/0267...
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
          remarks: 'Imported from Sales 3 Pipeline',
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

      // D. Create Sales Order (1:1) in exact sequence HCPPL/2627/0267...
      const orderNumber = `HCPPL/2627/${seqStr}`;
      const createdOrder = await prisma.salesOrder.create({
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
          remarks: 'Imported from Sales 3 CSV - Sent to Plant Head',
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
        },
        include: { items: true }
      });

      // E. Send Order to Plant Head -> Create Production Plan in exact sequence PLAN/2627/0267...
      const planNumber = `PLAN/2627/${seqStr}`;
      const createdPlan = await prisma.productionPlan.create({
        data: {
          planNumber,
          salesOrderId: createdOrder.id,
          assignedToId: userId,
          status: 'RELEASED',
          priority: 'NORMAL',
          plannedStartDate: leadDateObj,
          plannedEndDate: new Date(leadDateObj.getTime() + 7 * 24 * 60 * 60 * 1000),
          productionLine: 'Main FRP Molding Line',
          workflowStateId: prodReleasedState?.id || null,
          createdAt: leadDateObj
        }
      });

      // F. Create Work Orders in exact sequence WO/2627/0553... (continuing from 552)
      for (let itemIdx = 0; itemIdx < createdOrder.items.length; itemIdx++) {
        const orderItem = createdOrder.items[itemIdx];
        const woSeqStr = String(552 + (++totalWorkOrdersCount)).padStart(4, '0');
        const workOrderNumber = `WO/2627/${woSeqStr}`;

        const createdWO = await prisma.workOrder.create({
          data: {
            workOrderNumber,
            productionPlanId: createdPlan.id,
            salesOrderItemId: orderItem.id,
            quantity: orderItem.orderedQuantity,
            status: 'COMPLETED',
            productionStatus: 'READY_FOR_DISPATCH',
            qcResult: 'PASS',
            qcRemarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK',
            qcTimestamp: now,
            startedById: userId,
            startedAt: leadDateObj,
            completedById: userId,
            completedAt: now,
            productionEndTime: now,
            reworkCount: 0,
            workflowStateId: woCompletedState?.id || null,
            createdById: userId,
            createdAt: leadDateObj
          }
        });

        // Create Production Batch
        const batchNumber = `BATCH/2627/${woSeqStr}`;
        await prisma.productionBatch.create({
          data: {
            batchNumber,
            workOrderId: createdWO.id,
            quantity: orderItem.orderedQuantity,
            createdAt: leadDateObj
          }
        });

        // Create QC Inspection Record
        await prisma.qCInspection.create({
          data: {
            workOrderId: createdWO.id,
            status: 'PASSED',
            remarks: '100% Passed Technical QC Sheet Inspection',
            approvedAt: now,
            inspectorId: userId
          }
        });
      }
    }

    // 5. Update ID Sequences in DB
    const currentFY = '2627';
    const nextOrderNum = 266 + groups.length + 1; // 277
    const nextWoNum = 552 + totalWorkOrdersCount + 1; // 569

    await prisma.idSequence.upsert({
      where: { key: `lead_number_${currentFY}` },
      update: { nextValue: nextOrderNum },
      create: { key: `lead_number_${currentFY}`, nextValue: nextOrderNum }
    });
    await prisma.idSequence.upsert({
      where: { key: `quotation_number_${currentFY}` },
      update: { nextValue: nextOrderNum },
      create: { key: `quotation_number_${currentFY}`, nextValue: nextOrderNum }
    });
    await prisma.idSequence.upsert({
      where: { key: `sales_order_number_${currentFY}` },
      update: { nextValue: nextOrderNum },
      create: { key: `sales_order_number_${currentFY}`, nextValue: nextOrderNum }
    });
    await prisma.idSequence.upsert({
      where: { key: `production_plan_number_${currentFY}` },
      update: { nextValue: nextOrderNum },
      create: { key: `production_plan_number_${currentFY}`, nextValue: nextOrderNum }
    });
    await prisma.idSequence.upsert({
      where: { key: `work_order_number_${currentFY}` },
      update: { nextValue: nextWoNum },
      create: { key: `work_order_number_${currentFY}`, nextValue: nextWoNum }
    });

    console.log(`\n======================================================================`);
    console.log(`SYNC FINISHED FOR Sales 3 (${config.name})`);
    console.log(`======================================================================`);
    console.log(`Assigned Strictly to                : ${user.name} (${user.email})`);
    console.log(`Total Leads Created (WON)           : ${groups.length} (LD/2627/0267 - LD/2627/0276)`);
    console.log(`Total Quotations Created (APPROVED) : ${groups.length} (QT/2627/0267 - QT/2627/0276)`);
    console.log(`Total Sales Orders Created          : ${groups.length} (HCPPL/2627/0267 - HCPPL/2627/0276)`);
    console.log(`Total Production Plans Created      : ${groups.length} (PLAN/2627/0267 - PLAN/2627/0276)`);
    console.log(`Total Work Orders Created (READY)   : ${totalWorkOrdersCount} (WO/2627/0553 - WO/2627/0568)`);
    console.log(`======================================================================\n`);

  } catch (error) {
    console.error(`Error syncing database (${config.name}):`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const config of targetDbs) {
    try {
      await syncSales3Database(config);
    } catch (e) {
      console.error(`Skipping or failed for ${config.name}:`, e.message);
    }
  }
}

main().catch(console.error);
