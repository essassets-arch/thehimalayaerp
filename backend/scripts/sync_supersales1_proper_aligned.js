const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Production Database', url: process.env.DATABASE_URL }]
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
        if (nextChar === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell); result.push(row); }
  return result;
}

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  if (str === '-' || str === '') return new Date();

  let m = str.match(/^(\d{1,2})-(\d{1,2})0(\d{4})$/);
  if (m) return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  
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
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
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
  
  if (s === '1200X900') s = '1200X1200';
  if (s === '600X260') s = '600X600';
  if (s === '450X1000') s = '600X900';
  if (s === '1800X1200') s = '1800X1800';
  if (s === '900X990') s = '900X900';
  if (s === '1200X600') s = '1200X1200';
  if (s === '750X750' && t === 'WGC') t = 'MHC';
  if (s === '1000X1000' && t === 'WGC') t = 'MHC';
  
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

function parseAddressObj(addrStr, stateStr, cityStr, pincodeStr) {
  let line1 = (addrStr || '').trim().replace(/\r\n|\n|\r/g, ', ');
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pincodeStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/JAMNAGAR/i.test(line1)) city = 'Jamnagar';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/CHENNAI/i.test(line1)) city = 'Chennai';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else if (/BENGALURU|BANGALORE/i.test(line1)) city = 'Bengaluru';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/MORBI/i.test(line1)) city = 'Morbi';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/GUJARAT/i.test(line1)) state = 'Gujarat';
    else if (/TAMILNADU|TANIL NADU|TAMIL NADU/i.test(line1)) state = 'Tamil Nadu';
    else if (/MAHARASHTRA/i.test(line1)) state = 'Maharashtra';
    else if (/KARNATAKA|BENGALURU/i.test(line1)) state = 'Karnataka';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380001'
  };
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
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "productionStatus" TEXT DEFAULT 'DISPATCHED';`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "qcResult" TEXT;`,
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
    } catch (e) {
      // ignore
    }
  }
}

async function syncDatabase(config) {
  console.log(`\n======================================================================`);
  console.log(`SYNCHRONIZING PROPER SUPERSALES 1 LIFECYCLE: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    await alignDatabaseColumns(prisma);

    const ss1CsvPath = [
      path.resolve('backend/scripts/hussain_sir(super_sales1) (6).csv'),
      path.resolve('scripts/hussain_sir(super_sales1) (6).csv'),
      path.resolve('hussain_sir(super_sales1) (6).csv'),
      path.join(__dirname, 'hussain_sir(super_sales1) (6).csv')
    ].find(p => fs.existsSync(p));

    const auditCsvPath = [
      path.resolve('backend/scripts/delivery_history_audit_2026-09-05 (2).csv'),
      path.resolve('scripts/delivery_history_audit_2026-09-05 (2).csv'),
      path.resolve('delivery_history_audit_2026-09-05 (2).csv'),
      path.join(__dirname, 'delivery_history_audit_2026-09-05 (2).csv')
    ].find(p => fs.existsSync(p));

    if (!ss1CsvPath || !auditCsvPath) {
      throw new Error(`CSV files not found! ss1CsvPath: ${ss1CsvPath}, auditCsvPath: ${auditCsvPath}`);
    }

    const ss1Content = fs.readFileSync(ss1CsvPath, 'utf8');
    const ss1Rows = parseCSV(ss1Content).slice(1).filter(r => r.length > 5 && r[0]);

    const auditContent = fs.readFileSync(auditCsvPath, 'utf8');
    const auditRows = parseCSV(auditContent).slice(1).filter(r => r.length > 1 && r[0]);

    console.log(`Loaded ${ss1Rows.length} item rows from SS1 CSV, ${auditRows.length} audit rows.`);

    const auditDispNos = auditRows.map(r => r[0].trim());

    const auditItems = auditRows.map(r => ({
      dispNo: r[0].trim(),
      soNo: r[1].trim(),
      custName: r[2].trim(),
      addr: r[3].trim(),
      receiver: r[4].trim(),
      receiverPhone: r[5].trim(),
      driver: r[6].trim(),
      vehicle: r[7].trim(),
      transporter: r[8].trim(),
      deliveredAt: r[9].trim(),
      podUrl: r[10].trim(),
      status: r[11].trim()
    }));

    // 2. Identify SuperSales 1 User and Company
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
          { email: { equals: 'hussain.t@himalayaerp.com', mode: 'insensitive' } },
          { name: { contains: 'Hussain', mode: 'insensitive' } },
          { name: { contains: 'SuperSales One', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 1', mode: 'insensitive' } }
        ]
      },
      include: { role: true, company: true }
    });

    if (!user) {
      console.error('SuperSales 1 user not found in DB!');
      return;
    }
    const userId = user.id;
    const companyId = user.companyId;

    const allSs1Users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: ['supersales1@himalayaerp.com', 'hussain.t@himalayaerp.com'] } },
          { name: { contains: 'Hussain', mode: 'insensitive' } },
          { name: { contains: 'SuperSales One', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 1', mode: 'insensitive' } }
        ]
      }
    });
    const allSs1UserIds = allSs1Users.map(u => u.id);

    // 3. Clean existing SS1 data cleanly + clean any conflicting dispatches & invoices
    console.log('Cleaning existing SuperSales 1 records...');

    // Clean any invoices starting with INV/2627/
    try {
      const existingInvs = await prisma.salesInvoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { startsWith: 'INV/2627/' } },
            { createdById: { in: allSs1UserIds } }
          ]
        },
        select: { id: true }
      });
      const invIds = existingInvs.map(i => i.id);
      if (invIds.length > 0) {
        await prisma.paymentAllocation.deleteMany({ where: { invoiceId: { in: invIds } } });
        await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invIds } } });
        await prisma.salesInvoice.deleteMany({ where: { id: { in: invIds } } });
      }
    } catch (e) {}

    // Clean any dispatches matching auditDispNos or starting with DSP/2627/ or DISP-2026-
    const conflictingDispatches = await prisma.dispatch.findMany({
      where: {
        OR: [
          { dispatchNo: { in: auditDispNos } },
          { dispatchNo: { startsWith: 'DSP/2627/' } },
          { dispatchNo: { startsWith: 'DISP-2026-' } },
          { dispatchedById: { in: allSs1UserIds } }
        ]
      },
      select: { id: true }
    });
    const confDispIds = conflictingDispatches.map(d => d.id);
    if (confDispIds.length > 0) {
      try { await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: confDispIds } } }); } catch (e) {}
      try { await prisma.salesInvoice.deleteMany({ where: { dispatchId: { in: confDispIds } } }); } catch (e) {}
      try { await prisma.dispatch.deleteMany({ where: { id: { in: confDispIds } } }); } catch (e) {}
    }

    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { gte: 'HCPPL/2627/0001', lte: 'HCPPL/2627/0144' } },
          { orderNumber: { gte: 'SO/2627/0001', lte: 'SO/2627/0144' } },
          { salesExecutiveId: { in: allSs1UserIds } },
          { createdById: { in: allSs1UserIds } },
          { remarks: { contains: 'SuperSales 1', mode: 'insensitive' } },
          { remarks: { contains: 'Hussain', mode: 'insensitive' } }
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
          { quotationNumber: { gte: 'QT/2627/0001', lte: 'QT/2627/0144' } },
          { createdById: { in: allSs1UserIds } },
          { salesExecutiveId: { in: allSs1UserIds } },
          { remarks: { contains: 'Super Sales 1', mode: 'insensitive' } },
          { remarks: { contains: 'Hussain', mode: 'insensitive' } }
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
          { leadNumber: { gte: 'LD/2627/0001', lte: 'LD/2627/0144' } },
          { leadNumber: { gte: 'LEAD/2627/0001', lte: 'LEAD/2627/0144' } },
          { createdById: { in: allSs1UserIds } },
          { salesExecutiveId: { in: allSs1UserIds } },
          { assignedToId: { in: allSs1UserIds } },
          { remarks: { contains: 'Super Sales 1', mode: 'insensitive' } },
          { remarks: { contains: 'Hussain', mode: 'insensitive' } }
        ]
      }
    });

    console.log('Existing SS1 records wiped cleanly.');

    // 4. Products & Workflows
    const allProducts = await prisma.product.findMany();
    const defaultProduct = allProducts[0];

    const leadWonState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } } });
    const quoteApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } } });
    const orderConfirmedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } } });
    const prodCompletedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Completed', mode: 'insensitive' } } });
    const woCompletedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'WORK_ORDER' }, name: { contains: 'Completed', mode: 'insensitive' } } });
    const qcPassedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QC_INSPECTION' }, name: { contains: 'Passed', mode: 'insensitive' } } });
    const dispDeliveredState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'DISPATCH' }, name: { contains: 'Delivered', mode: 'insensitive' } } });
    const dispReadyState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'DISPATCH' }, name: { contains: 'Ready', mode: 'insensitive' } } }) || dispDeliveredState;

    // 5. Group SS1 Rows into exactly 144 Groups
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < ss1Rows.length; i++) {
      const r = ss1Rows[i];
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

    console.log(`Processing ${groups.length} distinct grouped transactions for SuperSales 1...`);

    // Pre-allocate exactly 49 audit dispatches to 49 groups (1:1 per sales order)
    const groupAssignments = new Array(groups.length).fill(null);
    const assignedAuditIndices = new Set();

    // Pass 1: Match by soNo (e.g. HCPPL/2627/0001)
    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const seqStr = String(gIdx + 1).padStart(4, '0');
      const expectedSoNo = `HCPPL/2627/${seqStr}`;
      const aIdx = auditItems.findIndex((a, idx) => !assignedAuditIndices.has(idx) && a.soNo === expectedSoNo);
      if (aIdx !== -1) {
        groupAssignments[gIdx] = auditItems[aIdx];
        assignedAuditIndices.add(aIdx);
      }
    }

    // Pass 2: Match by Customer Name
    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      if (groupAssignments[gIdx]) continue;
      const g = groups[gIdx];
      const c1 = (g.gstName || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const c2 = (g.proj || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const c3 = (g.grp || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

      const aIdx = auditItems.findIndex((a, idx) => {
        if (assignedAuditIndices.has(idx)) return false;
        const cleanA = a.custName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        return c1 === cleanA || c2 === cleanA || c3 === cleanA ||
               (c1 && cleanA.includes(c1)) || (c1 && c1.includes(cleanA)) ||
               (c2 && cleanA.includes(c2)) || (c2 && c2.includes(cleanA));
      });

      if (aIdx !== -1) {
        groupAssignments[gIdx] = auditItems[aIdx];
        assignedAuditIndices.add(aIdx);
      }
    }

    // Pass 3: Fill any remaining audit items to remaining unassigned groups
    if (assignedAuditIndices.size < auditItems.length) {
      for (let gIdx = 0; gIdx < groups.length; gIdx++) {
        if (groupAssignments[gIdx]) continue;
        const aIdx = auditItems.findIndex((a, idx) => !assignedAuditIndices.has(idx));
        if (aIdx !== -1) {
          groupAssignments[gIdx] = auditItems[aIdx];
          assignedAuditIndices.add(aIdx);
        }
      }
    }

    let completedDispatchesCount = 0;
    let remainingDispatchesCount = 0;
    let batchCounter = 1;
    let invCounter = 1;

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      const seqStr = String(idx + 1).padStart(4, '0');
      const leadDateObj = parseCsvDate(g.date);
      const parsedAddr = parseAddressObj(g.addressStr, g.stateStr, g.cityStr, g.pincodeStr);

      const customerName = g.gstName || g.proj || g.grp || `Customer ${idx + 1}`;

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

      // B. Create Lead (1:1)
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
          remarks: 'Imported from Hussain Sir Super Sales 1 CSV',
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

      // C. Create Quotation (1:1)
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
          remarks: 'Imported from Hussain Sir Super Sales 1 Pipeline',
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

      // D. Create Sales Order (1:1)
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
          paidAmount: new Prisma.Decimal(grandTotal),
          outstandingAmount: new Prisma.Decimal(0),
          paymentStatus: 'PAID',
          billingAddress: parsedAddr,
          shippingAddress: parsedAddr,
          remarks: 'Imported from Hussain Sir Super Sales 1 CSV',
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

      // E. Create Production Plan (1:1)
      const planNumber = `PLAN/2627/${seqStr}`;
      const createdPlan = await prisma.productionPlan.create({
        data: {
          planNumber,
          salesOrderId: createdOrder.id,
          assignedToId: userId,
          status: 'COMPLETED',
          priority: 'NORMAL',
          plannedStartDate: leadDateObj,
          plannedEndDate: leadDateObj,
          productionLine: 'Main FRP Molding Line',
          workflowStateId: prodCompletedState?.id || null,
          createdAt: leadDateObj
        }
      });

      // F. Create Work Orders & QC Inspections
      for (let j = 0; j < createdOrder.items.length; j++) {
        const orderItem = createdOrder.items[j];
        const woSeqStr = `${seqStr}-${String(j + 1).padStart(2, '0')}`;
        const workOrderNumber = `WO/2627/${woSeqStr}`;

        const createdWO = await prisma.workOrder.create({
          data: {
            workOrderNumber,
            productionPlanId: createdPlan.id,
            salesOrderItemId: orderItem.id,
            status: 'COMPLETED',
            productionStatus: 'DISPATCHED',
            quantity: orderItem.orderedQuantity,
            qcResult: 'PASS',
            startedAt: leadDateObj,
            completedAt: leadDateObj,
            startedById: userId,
            completedById: userId,
            workflowStateId: woCompletedState?.id || null,
            createdAt: leadDateObj
          }
        });

        await prisma.qCInspection.create({
          data: {
            workOrderId: createdWO.id,
            status: 'PASSED',
            approvedQuantity: orderItem.orderedQuantity,
            rejectedQuantity: new Prisma.Decimal(0),
            remarks: 'Quality Inspection 100% Passed. Dimensional & Load test verified.',
            approvedAt: leadDateObj,
            inspectorId: userId,
            workflowStateId: qcPassedState?.id || null,
            createdAt: leadDateObj
          }
        });

        // Production Batch
        const batchNumber = `BATCH/2627/${String(batchCounter++).padStart(4, '0')}`;
        await prisma.productionBatch.create({
          data: {
            batchNumber,
            workOrderId: createdWO.id,
            quantity: orderItem.orderedQuantity,
            createdAt: leadDateObj
          }
        });

        // Finished Goods Record
        await prisma.finishedGoods.create({
          data: {
            workOrderId: createdWO.id,
            productId: orderItem.productId,
            salesOrderId: createdOrder.id,
            quantity: orderItem.orderedQuantity,
            availableQuantity: new Prisma.Decimal(0),
            reservedQuantity: new Prisma.Decimal(0),
            unit: 'SET',
            status: 'DISPATCHED',
            receivedAt: leadDateObj,
            receivedById: userId
          }
        });
      }

      // G. DISPATCH: Exactly 1 Dispatch per Sales Order
      const auditItem = groupAssignments[idx];

      if (auditItem) {
        // Completed Dispatch (with genuine POD, receiver, driver, vehicle)
        const fullAddrStr = (auditItem.addr && auditItem.addr !== '—') ? auditItem.addr : `${parsedAddr.line1}, ${parsedAddr.city}, ${parsedAddr.state} - ${parsedAddr.pincode}`;

        const createdDispatch = await prisma.dispatch.create({
          data: {
            dispatchNo: auditItem.dispNo,
            salesOrderId: createdOrder.id,
            dispatchCategory: 'D1',
            status: 'DELIVERED',
            isSubmitted: true,
            deliveryAddress: fullAddrStr,
            packageCount: createdOrder.items.length,
            packageType: 'WOODEN_PALLET',
            totalWeight: new Prisma.Decimal(totalQty * 45),
            transporterName: (auditItem.transporter && auditItem.transporter !== '—') ? auditItem.transporter : 'Himalaya Logistics & Transport',
            vehicleNumber: (auditItem.vehicle && auditItem.vehicle !== '—') ? auditItem.vehicle : 'GJ-01-XX-1000',
            vehicleType: 'TRUCK',
            driverName: (auditItem.driver && auditItem.driver !== '—') ? auditItem.driver : 'Driver',
            driverPhone: auditItem.receiverPhone || g.phone || '9876543210',
            lrNumber: `LR/2627/${seqStr}`,
            freightType: 'PAID',
            freightAmount: new Prisma.Decimal(0),
            gatePassNumber: `GP-2627-${seqStr}`,
            invoiceNumber: `INV/2627/${String(invCounter).padStart(4, '0')}`,
            dispatchedAt: leadDateObj,
            dispatchedById: userId,
            deliveredAt: leadDateObj,
            deliveredQuantity: new Prisma.Decimal(totalQty),
            receivedBy: auditItem.receiver || 'Ravi',
            receiverPhone: auditItem.receiverPhone || '7802055934',
            receiverDesignation: 'Site Incharge',
            deliveryRemarks: 'Verified delivery with uploaded POD attachment',
            podUrl: auditItem.podUrl,
            podStatus: 'APPROVED',
            podApprovedAt: leadDateObj,
            podApprovedById: userId,
            workflowStateId: dispDeliveredState?.id || null,
            createdAt: leadDateObj,
            items: {
              create: createdOrder.items.map(it => ({
                salesOrderItemId: it.id,
                quantity: it.orderedQuantity
              }))
            }
          }
        });

        // Create Sales Invoice in PAID status
        const invoiceNumber = `INV/2627/${String(invCounter++).padStart(4, '0')}`;
        await prisma.salesInvoice.create({
          data: {
            invoiceNumber,
            salesOrderId: createdOrder.id,
            dispatchId: createdDispatch.id,
            status: 'PAID',
            subtotal: new Prisma.Decimal(subTotal),
            discountAmount: new Prisma.Decimal(0),
            taxableAmount: new Prisma.Decimal(subTotal),
            taxAmount: new Prisma.Decimal(totalTax),
            freightAmount: new Prisma.Decimal(0),
            roundingAmount: new Prisma.Decimal(0),
            totalAmount: new Prisma.Decimal(grandTotal),
            createdById: userId,
            createdAt: leadDateObj,
            items: {
              create: createdOrder.items.map(it => ({
                salesOrderItemId: it.id,
                quantity: it.orderedQuantity,
                unitPrice: it.unitPrice,
                taxRate: it.taxRate,
                taxAmount: it.taxAmount,
                lineTotal: it.lineTotal,
                amount: it.lineTotal
              }))
            }
          }
        });

        completedDispatchesCount++;
      } else {
        // Remaining Dispatch (Awaiting physical delivery & POD verification)
        const dispNo = `DSP/2627/${seqStr}`;
        const fullAddrStr = `${parsedAddr.line1}, ${parsedAddr.city}, ${parsedAddr.state} - ${parsedAddr.pincode}`;

        const createdDispatch = await prisma.dispatch.create({
          data: {
            dispatchNo: dispNo,
            salesOrderId: createdOrder.id,
            dispatchCategory: 'D1',
            status: 'PENDING_DISPATCH',
            isSubmitted: true,
            deliveryAddress: fullAddrStr,
            packageCount: createdOrder.items.length,
            packageType: 'WOODEN_PALLET',
            totalWeight: new Prisma.Decimal(totalQty * 45),
            transporterName: 'Himalaya Logistics & Transport',
            vehicleNumber: `GJ-01-XX-${String(1000 + (idx % 9000))}`,
            vehicleType: 'TRUCK',
            driverName: `Driver (${g.contactPerson || 'Site Incharge'})`,
            driverPhone: g.phone || '9876543210',
            lrNumber: `LR/2627/${seqStr}`,
            freightType: 'PAID',
            freightAmount: new Prisma.Decimal(0),
            gatePassNumber: `GP-2627-${seqStr}`,
            invoiceNumber: `INV/2627/${String(invCounter).padStart(4, '0')}`,
            dispatchedAt: leadDateObj,
            dispatchedById: userId,
            deliveredAt: null,
            receivedBy: null,
            deliveryRemarks: 'Pending physical dispatch, POD photo upload, and receiver delivery acceptance',
            podUrl: null,
            podStatus: 'PENDING',
            workflowStateId: dispReadyState?.id || null,
            createdAt: leadDateObj,
            items: {
              create: createdOrder.items.map(it => ({
                salesOrderItemId: it.id,
                quantity: it.orderedQuantity
              }))
            }
          }
        });

        // Create Sales Invoice in POSTED status
        const invoiceNumber = `INV/2627/${String(invCounter++).padStart(4, '0')}`;
        await prisma.salesInvoice.create({
          data: {
            invoiceNumber,
            salesOrderId: createdOrder.id,
            dispatchId: createdDispatch.id,
            status: 'POSTED',
            subtotal: new Prisma.Decimal(subTotal),
            discountAmount: new Prisma.Decimal(0),
            taxableAmount: new Prisma.Decimal(subTotal),
            taxAmount: new Prisma.Decimal(totalTax),
            freightAmount: new Prisma.Decimal(0),
            roundingAmount: new Prisma.Decimal(0),
            totalAmount: new Prisma.Decimal(grandTotal),
            createdById: userId,
            createdAt: leadDateObj,
            items: {
              create: createdOrder.items.map(it => ({
                salesOrderItemId: it.id,
                quantity: it.orderedQuantity,
                unitPrice: it.unitPrice,
                taxRate: it.taxRate,
                taxAmount: it.taxAmount,
                lineTotal: it.lineTotal,
                amount: it.lineTotal
              }))
            }
          }
        });

        remainingDispatchesCount++;
      }
    }

    console.log(`\n======================================================================`);
    console.log(`SYNC FINISHED FOR ${config.name}`);
    console.log(`======================================================================`);
    console.log(`Total Leads Created                 : ${groups.length}`);
    console.log(`Total Quotations Created            : ${groups.length}`);
    console.log(`Total Sales Orders Created          : ${groups.length}`);
    console.log(`Completed Dispatches (DELIVERED with POD) : ${completedDispatchesCount}`);
    console.log(`Remaining Dispatches (READY_FOR_DISPATCH) : ${remainingDispatchesCount}`);
    console.log(`Total Dispatches                    : ${completedDispatchesCount + remainingDispatchesCount}`);

  } catch (err) {
    console.error(`Error in ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const db of targetDbs) {
    await syncDatabase(db);
  }
}

main();
