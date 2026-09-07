const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));
const targetDbs = [];

if (process.env.DATABASE_URL) {
  targetDbs.push({
    name: 'Production / Configured Database',
    url: process.env.DATABASE_URL
  });
}
if (process.env.LIVE_DATABASE_URL) {
  targetDbs.push({
    name: 'Live Database',
    url: process.env.LIVE_DATABASE_URL
  });
}
if (process.env.PROD_DATABASE_URL) {
  targetDbs.push({
    name: 'Production Database',
    url: process.env.PROD_DATABASE_URL
  });
}

if (!isDocker) {
  targetDbs.push(
    {
      name: 'Active DB (himalaya_erp_browser_test)',
      url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public'
    },
    {
      name: 'Main DB (himalaya_erp)',
      url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public'
    }
  );
}

// Deduplicate targets by url
const seenUrls = new Set();
const uniqueTargetDbs = targetDbs.filter(db => {
  if (seenUrls.has(db.url)) return false;
  seenUrls.add(db.url);
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
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "sentToDispatchAt" TIMESTAMP(3);`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "sentToDispatchById" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "dispatchedAt" TIMESTAMP(3);`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "dispatchedById" TEXT;`,
    `ALTER TABLE "FinishedGoods" ADD COLUMN IF NOT EXISTS "reservedQuantity" DECIMAL(65,30) DEFAULT 0;`,
    `ALTER TABLE "FinishedGoods" ADD COLUMN IF NOT EXISTS "salesOrderId" TEXT;`,
    `ALTER TABLE "FinishedGoods" ADD COLUMN IF NOT EXISTS "availableQuantity" DECIMAL(65,30) DEFAULT 0;`,
    `ALTER TABLE "FinishedGoods" ADD COLUMN IF NOT EXISTS "receivedById" TEXT;`,
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

async function ensureMissingProductsExist(prisma, companyId, consolidatedLeads) {
  let allProducts = await prisma.product.findMany();

  // Extract all distinct items from the CSV
  const distinctItems = [];
  const seen = new Set();
  for (const lead of consolidatedLeads) {
    for (const item of (lead.items || [])) {
      const type = (item.product || '').trim().toUpperCase();
      const size = (item.size || '').trim().toUpperCase();
      const cap = (item.capacity || '').trim().toUpperCase();
      const key = `${type}|${size}|${cap}`;
      if (!seen.has(key)) {
        seen.add(key);
        distinctItems.push({
          type: (item.product || '').trim(),
          size: (item.size || '').trim(),
          capacity: (item.capacity || '').trim(),
          unitPrice: item.unit_price || 1000
        });
      }
    }
  }

  for (const p of distinctItems) {
    if (!p.type && !p.size && !p.capacity) continue;
    const match = findExactProduct(p.type, p.size, p.capacity, allProducts);
    if (!match) {
      const cleanType = (p.type || 'MHC').trim().toUpperCase();
      const cleanSize = (p.size || '').trim().toUpperCase().replace(/\s+/g, '');
      const cleanCap = (p.capacity || 'LD').trim().toUpperCase();
      const sku = `HIMALAYAFRP${cleanType}${cleanSize}${cleanCap}`.replace(/[^A-Z0-9]/g, '');
      const name = `HIMALAYA FRP ${cleanType} ${p.size} ${cleanCap}`.trim();
      const publicId = `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      try {
        const created = await prisma.product.create({
          data: {
            publicId,
            sku,
            name,
            description: `FRP Cover ${cleanType} ${p.size} ${cleanCap}`,
            category: 'FRP Covers',
            productType: 'MANUFACTURING',
            dispatchCategory: 'D1',
            hsnCode: '39259090',
            gstRate: 18,
            unit: 'NOS',
            unitPrice: p.unitPrice || 1000,
            isActive: true,
            companyId,
            size: p.size,
            type: cleanType,
            capacity: cleanCap
          }
        });
        console.log(`  + Auto-created missing accurate catalog product: ${name} (SKU: ${sku})`);
        allProducts.push(created);
      } catch (e) {
        const fallback = await prisma.product.findFirst({
          where: {
            OR: [
              { sku: { equals: sku, mode: 'insensitive' } },
              { name: { equals: name, mode: 'insensitive' } }
            ]
          }
        });
        if (fallback) allProducts.push(fallback);
      }
    }
  }

  return allProducts;
}

function findExactProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  let baseS = s;
  if (s.match(/^\d+X\d+X\d+$/)) {
    baseS = s.substring(0, s.lastIndexOf('X'));
  }

  let c = (capacity || '').trim().toUpperCase();

  // 1. Strict exact match on type + size + capacity
  let match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    const prodSize = (p.size || '').toUpperCase().replace(/\s+/g, '');
    const prodCap = (p.capacity || '').toUpperCase();

    const typeMatch = sku.includes(t) || name.includes(t);
    const sizeMatch = prodSize === s || prodSize === baseS || sku.includes(s) || sku.includes(baseS) || name.includes(s) || name.includes(baseS);
    const capMatch = prodCap === c || sku.includes(c) || name.includes(c);
    return typeMatch && sizeMatch && capMatch;
  });
  if (match) return match;

  // 2. Secondary fallback
  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) && (sku.includes(s) || name.includes(s));
  });
  return match || null;
}

async function syncSuperSales1ForDatabase(config, consolidatedLeads) {
  console.log(`\n======================================================================`);
  console.log(` SYNCING SUPERSALES 1 (ACCURATE & LIVE) INTO: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    await alignDatabaseColumns(prisma);

    // 1. Ensure SuperSales 1 User and Role
    let role = await prisma.role.findFirst({
      where: {
        OR: [
          { code: 'SUPER_SALES' },
          { name: { in: ['SuperSales', 'SuperSales Lead', 'Super Sales'] } }
        ]
      }
    });

    if (!role) {
      role = await prisma.role.findFirst();
    }

    let company = await prisma.company.findFirst();
    if (!company) {
      throw new Error(`No company found in database ${config.name}`);
    }
    const companyId = company.id;

    const passwordHash = await bcrypt.hash('supersales123', 10);

    let user = await prisma.user.findFirst({
      where: {
        email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' }
      }
    });

    if (!user) {
      const publicId = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      user = await prisma.user.create({
        data: {
          publicId,
          email: 'supersales1@himalayaerp.com',
          name: 'SuperSales 1',
          password: passwordHash,
          role: { connect: { id: role.id } },
          company: { connect: { id: companyId } },
          isActive: true
        }
      });
      console.log(`Created SuperSales 1 user: ${user.name} (${user.email}) [ID: ${user.id}]`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: 'SuperSales 1',
          role: { connect: { id: role.id } },
          company: { connect: { id: companyId } },
          password: passwordHash,
          isActive: true
        }
      });
      console.log(`Updated SuperSales 1 user: ${user.name} (${user.email}) [ID: ${user.id}]`);
    }

    const userId = user.id;

    // 2. Ensure missing products exist
    const allProducts = await ensureMissingProductsExist(prisma, companyId, consolidatedLeads);
    console.log(`Loaded ${allProducts.length} products from database.`);

    // 3. Clean up conflicting or outdated records
    console.log('Cleaning existing SuperSales 1 and conflicting FY 2627 records...');

    // Find all sales orders to wipe:
    // (a) created by or assigned to supersales1
    // (b) orderNumber starts with HCPPL/2627/
    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { startsWith: 'HCPPL/2627/' } },
          { orderNumber: { startsWith: 'SO/2627/' } },
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

      if (invoiceIds.length > 0) {
        try { await prisma.paymentAllocation.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
        try { await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
        try { await prisma.salesInvoice.deleteMany({ where: { id: { in: invoiceIds } } }); } catch (e) {}
      }

      if (dispatchIds.length > 0) {
        try { await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
        try { await prisma.dispatch.deleteMany({ where: { id: { in: dispatchIds } } }); } catch (e) {}
      }

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
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

    // Clean Quotations
    const existingQuotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { quotationNumber: { startsWith: 'QU/2627/' } },
          { quotationNumber: { startsWith: 'QT/2627/' } },
          { salesExecutiveId: userId },
          { createdById: userId }
        ]
      },
      select: { id: true }
    });
    const quoteIds = existingQuotes.map(q => q.id);
    if (quoteIds.length > 0) {
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }); } catch (e) {}
    }

    // Clean Leads
    try {
      await prisma.lead.deleteMany({
        where: {
          OR: [
            { leadNumber: { startsWith: 'LEAD/2627/' } },
            { leadNumber: { startsWith: 'LD/2627/' } },
            { salesExecutiveId: userId },
            { createdById: userId },
            { assignedToId: userId }
          ]
        }
      });
    } catch (e) {}

    console.log('Cleanup completed.');

    // 4. Resolve Workflow States
    const leadWonState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' } } });

    const quoteApprovedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' } } });

    const orderConfirmedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' } } });

    const prodCompletedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Completed', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' } } });

    const woCompletedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'WORK_ORDER' }, name: { contains: 'Completed', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'WORK_ORDER' } } });

    const qcPassedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QC_INSPECTION' }, name: { contains: 'Passed', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'QC_INSPECTION' } } });

    // 5. Ingestion Loop
    console.log(`\nImporting ${consolidatedLeads.length} consolidated orders for SuperSales 1...`);

    let woCounter = 1;
    let batchCounter = 1;

    for (let idx = 0; idx < consolidatedLeads.length; idx++) {
      const gl = consolidatedLeads[idx];
      const seqStr = String(idx + 1).padStart(4, '0');
      const leadDateObj = parseCsvDate(gl.lead_date);
      const parsedAddress = parseAddressObj(gl.address, gl.state, gl.city, gl.pincode);
      const companyName = (gl.project_name || gl.group_name || gl.gst_name || 'Himalaya Client').trim();
      const contactPerson = gl.site_incharge || 'Site Incharge';
      const phone = gl.site_incharge_mobile || gl.office_contact || 'N/A';
      const email = gl.email || 'info@thehimalaya.co.in';
      const gstNumber = gl.gst_no || null;
      const gstName = gl.gst_name || companyName;

      // Upsert Customer
      let customer = null;
      if (gstNumber && gstNumber !== 'URD') {
        customer = await prisma.customer.findFirst({
          where: { companyId, gstin: gstNumber }
        });
      }
      if (!customer) {
        customer = await prisma.customer.findFirst({
          where: { companyId, companyName: { equals: companyName, mode: 'insensitive' } }
        });
      }
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            companyName,
            contactPerson,
            email,
            phone,
            gstin: (gstNumber && gstNumber !== 'URD') ? gstNumber : null,
            billingAddress: parsedAddress,
            shippingAddress: parsedAddress,
            companyId,
            status: 'ACTIVE'
          }
        });
      }

      // Calculate totals
      let totalAmount = 0;
      let subTotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;
      let totalQty = 0;

      const preparedItems = [];
      for (const item of gl.items) {
        const prod = findExactProduct(item.product, item.size, item.capacity, allProducts);
        if (!prod) {
          throw new Error(`Critical: No matching product for ${item.product} ${item.size} ${item.capacity}`);
        }

        const qty = item.qty || 1;
        const rate = item.unit_price || Number(prod.unitPrice) || 1000;
        const lineSubTotal = item.sub_total || (qty * rate);
        const lineTax = item.gst_amount || (lineSubTotal * 0.18);
        const lineDiscount = item.discount || 0;
        const lineTotal = item.grand_total || (lineSubTotal + lineTax - lineDiscount);

        subTotal += lineSubTotal;
        taxAmount += lineTax;
        discountAmount += lineDiscount;
        totalAmount += lineTotal;
        totalQty += qty;

        preparedItems.push({
          raw: item,
          product: prod,
          qty,
          rate,
          lineSubTotal,
          lineTax,
          lineDiscount,
          lineTotal
        });
      }

      const productInterestSummary = preparedItems.map(p => `${p.product.name} (x${p.qty})`).join(', ');

      // A. Create Lead (WON)
      const lead = await prisma.lead.create({
        data: {
          leadNumber: `LEAD/2627/${seqStr}`,
          leadDate: leadDateObj,
          companyName,
          projectName: gl.project_name,
          groupName: gl.group_name,
          gstName,
          gstNumber: (gstNumber && gstNumber !== 'URD') ? gstNumber : null,
          contactPerson,
          email,
          phone,
          address: parsedAddress,
          source: 'OTHER',
          productInterest: productInterestSummary,
          detailedItems: gl.items,
          estimatedQuantity: totalQty,
          unit: 'PCS',
          workflowState: leadWonState ? { connect: { id: leadWonState.id } } : undefined,
          customerId: customer.id,
          salesExecutive: { connect: { id: userId } },
          createdById: userId,
          assignedToId: userId,
          Company: companyId ? { connect: { id: companyId } } : undefined
        }
      });

      // B. Create Quotation (APPROVED)
      const quotation = await prisma.quotation.create({
        data: {
          quotationNumber: `QU/2627/${seqStr}`,
          lead: { connect: { id: lead.id } },
          customerId: customer.id,
          workflowState: quoteApprovedState ? { connect: { id: quoteApprovedState.id } } : undefined,
          salesExecutive: { connect: { id: userId } },
          createdById: userId,
          companyId,
          subtotal: subTotal,
          tax: taxAmount,
          discount: discountAmount,
          total: totalAmount,
          validUntil: new Date(leadDateObj.getTime() + 30 * 24 * 60 * 60 * 1000),
          paymentTerms: '100% Advance Against Proforma Invoice',
          paymentTermDays: 0,
          createdAt: leadDateObj
        }
      });

      // Quotation Items
      const createdQuoteItems = [];
      for (let i = 0; i < preparedItems.length; i++) {
        const it = preparedItems[i];
        const qi = await prisma.quotationItem.create({
          data: {
            quotation: { connect: { id: quotation.id } },
            product: { connect: { id: it.product.id } },
            quantity: it.qty,
            unitPrice: it.rate,
            tax: it.lineTax,
            discount: it.lineDiscount,
            lineTotal: it.lineTotal,
            description: `${it.product.name} - ${it.raw.color || 'GREY'}`
          }
        });
        createdQuoteItems.push({ ...it, quoteItemId: qi.id });
      }

      // C. Create Sales Order (CONFIRMED)
      const salesOrder = await prisma.salesOrder.create({
        data: {
          orderNumber: `HCPPL/2627/${seqStr}`,
          sourceQuotation: { connect: { id: quotation.id } },
          customer: { connect: { id: customer.id } },
          orderDate: leadDateObj,
          status: 'CONFIRMED',
          workflowState: orderConfirmedState ? { connect: { id: orderConfirmedState.id } } : undefined,
          salesExecutive: { connect: { id: userId } },
          createdById: userId,
          currency: 'INR',
          subtotal: subTotal,
          taxableAmount: subTotal,
          taxAmount: taxAmount,
          discountAmount: discountAmount,
          totalAmount: totalAmount,
          paidAmount: 0,
          outstandingAmount: totalAmount,
          paymentStatus: 'PENDING',
          paymentTerms: '100% Advance Against Proforma Invoice',
          deliveryTerms: 'Ex-Works',
          shippingAddress: parsedAddress,
          billingAddress: parsedAddress,
          createdAt: leadDateObj,
          remarks: `SuperSales 1 Order - ${companyName}`
        }
      });

      // Sales Order Items
      const createdOrderItems = [];
      for (let i = 0; i < createdQuoteItems.length; i++) {
        const it = createdQuoteItems[i];
        const soi = await prisma.salesOrderItem.create({
          data: {
            salesOrder: { connect: { id: salesOrder.id } },
            product: { connect: { id: it.product.id } },
            productNameSnapshot: it.product.name,
            productCodeSnapshot: it.product.sku,
            specifications: { color: it.raw.color, size: it.raw.size, capacity: it.raw.capacity },
            orderedQuantity: it.qty,
            unit: 'NOS',
            unitPrice: it.rate,
            discountAmount: it.lineDiscount,
            taxableAmount: it.lineSubTotal,
            taxRate: 18,
            taxAmount: it.lineTax,
            lineTotal: it.lineTotal
          }
        });
        createdOrderItems.push({ ...it, orderItemId: soi.id });
      }

      // D. Create Production Plan (COMPLETED)
      const productionPlan = await prisma.productionPlan.create({
        data: {
          planNumber: `PP/2627/${seqStr}`,
          salesOrder: { connect: { id: salesOrder.id } },
          plannedStartDate: leadDateObj,
          plannedEndDate: leadDateObj,
          status: 'COMPLETED',
          workflowState: prodCompletedState ? { connect: { id: prodCompletedState.id } } : undefined,
          priority: 'NORMAL'
        }
      });

      // E. Work Orders, QC Inspections, Batches, Finished Goods (READY_FOR_DISPATCH)
      for (const it of createdOrderItems) {
        const woSeqStr = String(woCounter++).padStart(4, '0');
        const batchSeqStr = String(batchCounter++).padStart(4, '0');

        const workOrder = await prisma.workOrder.create({
          data: {
            workOrderNumber: `WO/2627/${woSeqStr}`,
            productionPlan: { connect: { id: productionPlan.id } },
            salesOrderItem: { connect: { id: it.orderItemId } },
            quantity: it.qty,
            status: 'COMPLETED',
            productionStatus: 'READY_FOR_DISPATCH',
            workflowState: woCompletedState ? { connect: { id: woCompletedState.id } } : undefined,
            qcResult: 'PASS',
            startedAt: leadDateObj,
            completedAt: leadDateObj
          }
        });

        await prisma.qCInspection.create({
          data: {
            workOrder: { connect: { id: workOrder.id } },
            status: 'PASSED',
            workflowState: qcPassedState ? { connect: { id: qcPassedState.id } } : undefined,
            approvedQuantity: it.qty,
            rejectedQuantity: 0,
            remarks: `QC Passed for ${workOrder.workOrderNumber}`
          }
        });

        await prisma.productionBatch.create({
          data: {
            batchNumber: `BATCH/2627/${batchSeqStr}`,
            workOrder: { connect: { id: workOrder.id } },
            quantity: it.qty
          }
        });

        await prisma.finishedGoods.create({
          data: {
            workOrder: { connect: { id: workOrder.id } },
            salesOrder: { connect: { id: salesOrder.id } },
            product: { connect: { id: it.product.id } },
            quantity: it.qty,
            availableQuantity: it.qty,
            reservedQuantity: 0,
            unit: 'NOS',
            status: 'READY_FOR_DISPATCH'
          }
        });
      }
    }

    // 6. Update IdSequence
    const sequences = [
      { key: 'LEAD-2627', nextValue: 146 },
      { key: 'QU-2627', nextValue: 146 },
      { key: 'HCPPL-2627', nextValue: 146 },
      { key: 'PP-2627', nextValue: 146 },
      { key: 'WO-2627', nextValue: 327 },
      { key: 'BATCH-2627', nextValue: 327 }
    ];

    for (const seq of sequences) {
      await prisma.idSequence.upsert({
        where: { key: seq.key },
        update: { nextValue: seq.nextValue, updatedAt: new Date() },
        create: { key: seq.key, nextValue: seq.nextValue }
      });
    }

    console.log(`✅ Completed synchronization for ${config.name}`);
  } catch (err) {
    console.error(`❌ Error synchronizing ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const csvPath = [
    path.join(__dirname, 'hussain-fresh.csv'),
    path.resolve('backend/scripts/hussain-fresh.csv'),
    path.resolve('scripts/hussain-fresh.csv'),
    path.resolve('hussain-fresh.csv')
  ].find(p => fs.existsSync(p));

  if (!csvPath) {
    throw new Error('CSV file not found!');
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  const dataRows = rows.slice(1);

  let lastLeadForCarry = null;
  const rawConsolidatedLeads = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj = {};
    rawHeaders.forEach((h, idx) => {
      const cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      obj[cleanKey] = r[idx] ? r[idx].trim() : '';
    });

    const leadDate = obj.lead_date || '';
    const projectName = obj.project_name || obj.group_name || obj.gst_name || '';
    const groupName = obj.group_name || projectName;
    const gstName = obj.gst_name || projectName;
    const gstNo = obj.gst_no || '';
    const siteIncharge = obj.site_incharge || 'Site Incharge';
    const siteInchargeMobile = obj.site_incharge_mobile || obj.office_contact || '';
    const officeContact = obj.office_contact || '';
    const email = obj.email || 'info@thehimalaya.co.in';
    const address = obj.address || '';
    const state = obj.state || 'Gujarat';
    const city = obj.city || '';
    const pincode = obj.pincode || '';

    const product = (r[15] || obj.product || '').trim();
    const size = (r[16] || obj.size || '').trim();
    const capacity = (r[17] || obj.capcity || obj.capacity || '').trim();
    const qty = parseFloat(r[18] || obj.qty) || 1;
    const color = (r[19] || obj.specification || obj.color || 'GREY').trim();
    const unitPrice = parseFloat(r[20] || obj.unit_pricew || obj.unit_price || 0) || 0;
    const subTotal = parseFloat(r[21] || obj.sub_total || 0) || 0;
    const gst = (r[22] || obj.gst || '18%').trim();
    const gstAmount = parseFloat(r[23] || obj.gst_amount || 0) || 0;
    const discount = parseFloat(r[24] || obj.discount || 0) || 0;
    const grandTotal = parseFloat(r[25] || obj.grand_total || 0) || 0;

    const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
    const hasProductInfo = Boolean(product || size || capacity);

    if (!hasLeadInfo && !hasProductInfo) continue;

    const itemObj = {
      product,
      size,
      capacity,
      qty,
      color,
      unit_price: unitPrice,
      sub_total: subTotal,
      gst,
      gst_amount: gstAmount,
      discount,
      grand_total: grandTotal,
      row_index: i + 2
    };

    const isSameAsLast = lastLeadForCarry &&
      (leadDate === lastLeadForCarry.lead_date || !leadDate) &&
      (projectName === lastLeadForCarry.project_name || (!projectName && gstName === lastLeadForCarry.gst_name)) &&
      (gstNo === lastLeadForCarry.gst_no || !gstNo) &&
      (siteInchargeMobile === lastLeadForCarry.site_incharge_mobile || !siteInchargeMobile);

    if (isSameAsLast && hasProductInfo) {
      lastLeadForCarry.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      lastLeadForCarry = {
        lead_date: leadDate,
        project_name: projectName || 'Unnamed Project',
        group_name: groupName || projectName || 'Unnamed Project',
        gst_name: gstName || projectName || 'Unnamed Project',
        gst_no: gstNo,
        site_incharge: siteIncharge,
        site_incharge_mobile: siteInchargeMobile,
        office_contact: officeContact,
        email: email,
        address: address,
        state: state,
        city: city,
        pincode: pincode,
        items: []
      };
      if (hasProductInfo) {
        lastLeadForCarry.items.push(itemObj);
      }
      rawConsolidatedLeads.push(lastLeadForCarry);
    } else if (hasProductInfo && lastLeadForCarry) {
      lastLeadForCarry.items.push(itemObj);
    }
  }

  const consolidatedLeads = rawConsolidatedLeads.filter(l => l.items && l.items.length > 0);
  console.log(`Parsed ${consolidatedLeads.length} valid consolidated leads (${consolidatedLeads.reduce((s, l) => s + l.items.length, 0)} items).`);

  for (const db of uniqueTargetDbs) {
    await syncSuperSales1ForDatabase(db, consolidatedLeads);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
