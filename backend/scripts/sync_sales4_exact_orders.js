const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isDocker = fs.existsSync('/.dockerenv') ||
  process.cwd() === '/app' ||
  __dirname.startsWith('/app') ||
  Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));

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
  if (!db.url || seen.has(db.url)) return false;
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
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pinStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/JAMNAGAR/i.test(line1)) city = 'Jamnagar';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/GUJARAT/i.test(line1)) state = 'Gujarat';
    else if (/MAHARASHTRA/i.test(line1)) state = 'Maharashtra';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Plot No. 12, Industrial Area',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380001'
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
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "sourceQuotationId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'INR';`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "freightAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paidAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "outstandingAmount" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "size" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "capacity" TEXT;`
  ];

  for (const query of statements) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (e) {}
  }
}

async function syncSales4ExactOrders(config) {
  console.log(`\n======================================================================`);
  console.log(`SYNCHRONIZING SALES 4 EXACT PIPELINE: ${config.name}`);
  console.log(`Target User: Sales 4 | Sales Executive | sales4@himalayaerp.com`);
  console.log(`Target Page: Lead -> Quotation -> Sales Order (STOP AT ORDERS PAGE)`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    await alignDatabaseColumns(prisma);

    // Read CSV file
    const candidatePaths = [
      path.resolve('gl.csv'),
      path.resolve('backend/scripts/gl.csv'),
      path.resolve('scripts/gl.csv'),
      path.join(__dirname, 'gl.csv')
    ];

    const csvPath = candidatePaths.find(p => fs.existsSync(p));
    if (!csvPath) {
      throw new Error('gl.csv not found!');
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent).slice(1).filter(r => r.length > 5 && (r[0] || r[1]));
    console.log(`Loaded ${rows.length} rows from gl.csv.`);

    // 1. Ensure Sales 4 User with exact name 'Sales 4' and role 'Sales Executive'
    let user = await prisma.user.findFirst({
      where: {
        email: { equals: 'sales4@himalayaerp.com', mode: 'insensitive' }
      },
      include: { role: true, company: true }
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { equals: 'Sales 4', mode: 'insensitive' } },
            { name: { equals: 'Sales Four', mode: 'insensitive' } },
            { name: { equals: 'Sales Executive 4', mode: 'insensitive' } }
          ]
        },
        include: { role: true, company: true }
      });
    }

    const company = (await prisma.company.findFirst()) || { id: null };
    let salesRole = await prisma.role.findFirst({
      where: { name: { equals: 'Sales Executive', mode: 'insensitive' } }
    });
    if (!salesRole) {
      salesRole = await prisma.role.findFirst({
        where: { name: { contains: 'Sales', mode: 'insensitive' } }
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'sales4@himalayaerp.com',
          name: 'Sales 4',
          roleId: salesRole?.id,
          companyId: company?.id,
          password: 'Himalaya@2026'
        },
        include: { role: true, company: true }
      });
      console.log(`Created user Sales 4 (${user.id})`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: 'Sales 4',
          ...(salesRole ? { roleId: salesRole.id } : {})
        },
        include: { role: true, company: true }
      });
      console.log(`Updated user ${user.id} -> name: Sales 4, email: ${user.email}, role: ${user.role?.name}`);
    }

    const userId = user.id;
    const companyId = user.companyId || company.id;

    // 2. Clean existing Sales 4 records safely (SuperSales 1 & 2, Sales 1, 2, 3 preserved intact)
    console.log('Cleaning existing Sales 4 records (SuperSales 1 & 2, Sales 1, 2, 3 preserved intact)...');

    const targetOrderNumbers = [];
    for (let i = 255; i <= 264; i++) {
      targetOrderNumbers.push(`HCPPL/2627/${String(i).padStart(4, '0')}`);
      targetOrderNumbers.push(`SO/2627/${String(i).padStart(4, '0')}`);
    }

    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { in: targetOrderNumbers } },
          { orderNumber: { gte: 'HCPPL/2627/0255', lte: 'HCPPL/2627/0264' } },
          { salesExecutiveId: userId },
          { createdById: userId }
        ]
      },
      select: { id: true }
    });
    const orderIds = existingOrders.map(o => o.id);

    if (orderIds.length > 0) {
      const idList = `'${orderIds.join("','")}'`;

      // 1. Invoices & Dispatches
      await prisma.$executeRawUnsafe(`DELETE FROM "InvoiceItem" WHERE "invoiceId" IN (SELECT id FROM "SalesInvoice" WHERE "salesOrderId" IN (${idList}))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesInvoice" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "DispatchItem" WHERE "dispatchId" IN (SELECT id FROM "Dispatch" WHERE "salesOrderId" IN (${idList}))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "Dispatch" WHERE "salesOrderId" IN (${idList})`).catch(() => {});

      // 2. Production Plans, Work Orders, QC, Batches, FinishedGoods
      await prisma.$executeRawUnsafe(`DELETE FROM "FinishedGoods" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "FinishedGoods" WHERE "workOrderId" IN (SELECT id FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN (${idList})))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "QCInspection" WHERE "workOrderId" IN (SELECT id FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN (${idList})))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ProductionBatch" WHERE "workOrderId" IN (SELECT id FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN (${idList})))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "WorkOrderItem" WHERE "workOrderId" IN (SELECT id FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN (${idList})))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "WorkOrder" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN (${idList}))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ProductionPlanItem" WHERE "productionPlanId" IN (SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN (${idList}))`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ProductionPlan" WHERE "salesOrderId" IN (${idList})`).catch(() => {});

      // 3. Other relations
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderAllocation" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderHistory" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderCreditReview" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "OrderAmendment" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderLoss" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "CustomerComplaint" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "CustomerPaymentAllocation" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "CustomerPayment" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesReturn" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ReplacementRequest" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "ReplacementOrder" WHERE "salesOrderId" IN (${idList})`).catch(() => {});

      // 4. Items & Orders
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderItem" WHERE "salesOrderId" IN (${idList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrder" WHERE id IN (${idList})`).catch(() => {});
      await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } }).catch(() => {});
    }

    // Direct wipe of any remaining by target order numbers
    const numList = `'${targetOrderNumbers.join("','")}'`;
    await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderItem" WHERE "salesOrderId" IN (SELECT id FROM "SalesOrder" WHERE "orderNumber" IN (${numList}))`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrder" WHERE "orderNumber" IN (${numList})`).catch(() => {});

    // Clean Quotations
    const targetQuoteNumbers = [];
    for (let i = 255; i <= 264; i++) {
      targetQuoteNumbers.push(`QT/2627/${String(i).padStart(4, '0')}`);
      targetQuoteNumbers.push(`QU/2627/${String(i).padStart(4, '0')}`);
    }
    const existingQuotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { quotationNumber: { in: targetQuoteNumbers } },
          { quotationNumber: { gte: 'QT/2627/0255', lte: 'QT/2627/0264' } },
          { quotationNumber: { gte: 'QU/2627/0255', lte: 'QU/2627/0264' } },
          { createdById: userId },
          { salesExecutiveId: userId }
        ]
      },
      select: { id: true }
    });
    const quoteIds = existingQuotes.map(q => q.id);
    if (quoteIds.length > 0) {
      const qIdList = `'${quoteIds.join("','")}'`;
      await prisma.$executeRawUnsafe(`UPDATE "SalesOrder" SET "quotationId" = NULL, "sourceQuotationId" = NULL WHERE "quotationId" IN (${qIdList}) OR "sourceQuotationId" IN (${qIdList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "QuotationItem" WHERE "quotationId" IN (${qIdList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "QuotationTerm" WHERE "quotationId" IN (${qIdList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "Quotation" WHERE id IN (${qIdList})`).catch(() => {});
      await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }).catch(() => {});
    }
    const qNumList = `'${targetQuoteNumbers.join("','")}'`;
    await prisma.$executeRawUnsafe(`DELETE FROM "QuotationItem" WHERE "quotationId" IN (SELECT id FROM "Quotation" WHERE "quotationNumber" IN (${qNumList}))`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Quotation" WHERE "quotationNumber" IN (${qNumList})`).catch(() => {});

    // Clean Leads
    const targetLeadNumbers = [];
    for (let i = 255; i <= 264; i++) {
      targetLeadNumbers.push(`LD/2627/${String(i).padStart(4, '0')}`);
      targetLeadNumbers.push(`LEAD/2627/${String(i).padStart(4, '0')}`);
    }
    const existingLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { leadNumber: { in: targetLeadNumbers } },
          { leadNumber: { gte: 'LD/2627/0255', lte: 'LD/2627/0264' } },
          { leadNumber: { gte: 'LEAD/2627/0255', lte: 'LEAD/2627/0264' } },
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId }
        ]
      },
      select: { id: true }
    });
    const leadIds = existingLeads.map(l => l.id);
    if (leadIds.length > 0) {
      const lIdList = `'${leadIds.join("','")}'`;
      await prisma.$executeRawUnsafe(`UPDATE "Quotation" SET "leadId" = NULL WHERE "leadId" IN (${lIdList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "FollowUp" WHERE "leadId" IN (${lIdList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "LeadActivity" WHERE "leadId" IN (${lIdList})`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "Lead" WHERE id IN (${lIdList})`).catch(() => {});
      await prisma.lead.deleteMany({ where: { id: { in: leadIds } } }).catch(() => {});
    }
    const lNumList = `'${targetLeadNumbers.join("','")}'`;
    await prisma.$executeRawUnsafe(`DELETE FROM "Lead" WHERE "leadNumber" IN (${lNumList})`).catch(() => {});

    console.log('Existing Sales 4 data cleaned cleanly.');

    // 3. Products & Workflow States
    const allProducts = await prisma.product.findMany();
    const defaultProduct = allProducts[0];

    const leadWonState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } } });
    const quoteApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } } });
    const orderConfirmedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } } });

    // 4. Group rows into distinct transactions
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      let date = (r[0] || '').trim();
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

    console.log(`Processing ${groups.length} distinct grouped transactions for Sales 4...`);

    // Sales 3 ended at 0254 -> Sales 4 starts at 0255
    const baseSeqOffset = 254;

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      const seqStr = String(baseSeqOffset + idx + 1).padStart(4, '0');
      const leadDateObj = parseCsvDate(g.date);
      const parsedAddr = parseAddressObj(g.addressStr, g.stateStr, g.cityStr, g.pincodeStr);

      const customerName = g.gstName || g.proj || g.grp || `Customer S4-${idx + 1}`;
      const gstinVal = (g.gstNo && g.gstNo !== 'URD') ? g.gstNo : null;

      // A. Upsert Customer: Match by companyName first
      let customer = await prisma.customer.findFirst({
        where: {
          companyId,
          companyName: { equals: customerName, mode: 'insensitive' }
        }
      });
      if (!customer && gstinVal) {
        const gstMatch = await prisma.customer.findFirst({
          where: { companyId, gstin: gstinVal }
        });
        if (gstMatch && gstMatch.companyName.toUpperCase() === customerName.toUpperCase()) {
          customer = gstMatch;
        }
      }

      if (!customer) {
        const existingGstinCust = gstinVal ? await prisma.customer.findFirst({ where: { companyId, gstin: gstinVal } }) : null;
        const gstinToSave = (!existingGstinCust && gstinVal) ? gstinVal : null;
        customer = await prisma.customer.create({
          data: {
            companyId,
            companyName: customerName,
            contactPerson: g.contactPerson || 'Site Incharge',
            phone: g.phone || '9876543210',
            email: g.email || 'customer@example.com',
            gstin: gstinToSave,
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

      // B. Create Lead (1:1) in exact sequence LD/2627/0255...
      const leadNumber = `LD/2627/${seqStr}`;
      await prisma.$executeRawUnsafe(`DELETE FROM "Lead" WHERE "leadNumber" = '${leadNumber}'`).catch(() => {});
      const createdLead = await prisma.lead.create({
        data: {
          leadNumber,
          leadDate: leadDateObj,
          companyName: customerName,
          groupName: g.grp || customerName,
          projectName: g.proj || customerName,
          contactPerson: g.contactPerson || customer.contactPerson,
          phone: g.phone || customer.phone,
          email: g.email || customer.email,
          gstName: g.gstName || customerName,
          gstNumber: (g.gstNo && g.gstNo !== 'URD') ? g.gstNo : null,
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
          remarks: 'Imported from Sales 4 CSV (gl)',
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

      // C. Create Quotation (1:1) in exact sequence QT/2627/0255...
      const quotationNumber = `QT/2627/${seqStr}`;
      await prisma.$executeRawUnsafe(`DELETE FROM "QuotationItem" WHERE "quotationId" IN (SELECT id FROM "Quotation" WHERE "quotationNumber" = '${quotationNumber}')`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "Quotation" WHERE "quotationNumber" = '${quotationNumber}'`).catch(() => {});
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
          remarks: 'Converted from Lead',
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

      // D. Create Sales Order (1:1) in exact sequence HCPPL/2627/0255...
      const orderNumber = `HCPPL/2627/${seqStr}`;
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderItem" WHERE "salesOrderId" IN (SELECT id FROM "SalesOrder" WHERE "orderNumber" = '${orderNumber}')`).catch(() => {});
      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrder" WHERE "orderNumber" = '${orderNumber}'`).catch(() => {});
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
          remarks: `Sales 4 Order - ${customerName}`,
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
      // NOTE: STOPPED HERE AT ORDER PAGE AS REQUESTED. NO PRODUCTION PLAN, NO WORK ORDER.
    }

    // 5. Update ID sequences
    const currentFY = '2627';
    const nextOrderNum = baseSeqOffset + groups.length + 1; // 265

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
      where: { key: `LEAD-${currentFY}` },
      update: { nextValue: nextOrderNum },
      create: { key: `LEAD-${currentFY}`, nextValue: nextOrderNum }
    });
    await prisma.idSequence.upsert({
      where: { key: `QU-${currentFY}` },
      update: { nextValue: nextOrderNum },
      create: { key: `QU-${currentFY}`, nextValue: nextOrderNum }
    });
    await prisma.idSequence.upsert({
      where: { key: `HCPPL-${currentFY}` },
      update: { nextValue: nextOrderNum },
      create: { key: `HCPPL-${currentFY}`, nextValue: nextOrderNum }
    });

    console.log(`\n======================================================================`);
    console.log(`SYNC SUCCESSFUL FOR Sales 4 (${config.name})`);
    console.log(`======================================================================`);
    console.log(`User Assigned                         : ${user.name} (${user.email})`);
    console.log(`Role                                  : ${user.role?.name}`);
    console.log(`Total Leads Created (WON)             : ${groups.length} (LD/2627/0255 - LD/2627/0264)`);
    console.log(`Total Quotations Created (APPROVED)   : ${groups.length} (QT/2627/0255 - QT/2627/0264)`);
    console.log(`Total Sales Orders Created (CONFIRMED): ${groups.length} (HCPPL/2627/0255 - HCPPL/2627/0264)`);
    console.log(`Downstream (Plant/QC/Dispatch/WorkOrd): STOPPED AT ORDERS PAGE AS REQUESTED`);
    console.log(`======================================================================\n`);

  } catch (err) {
    console.error(`Error syncing ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (uniqueTargetDbs.length === 0) {
    throw new Error('No target database configured! Please set DATABASE_URL.');
  }
  let successCount = 0;
  for (const cfg of uniqueTargetDbs) {
    try {
      await syncSales4ExactOrders(cfg);
      successCount++;
    } catch (err) {
      console.error(`❌ Error syncing ${cfg.name}:`, err.message || err);
      if (uniqueTargetDbs.length === 1) {
        throw err;
      }
    }
  }
  if (successCount === 0) {
    throw new Error('All target databases failed to sync.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
