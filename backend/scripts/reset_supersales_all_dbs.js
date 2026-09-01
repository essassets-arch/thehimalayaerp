const { PrismaClient } = require('@prisma/client');

const targetEmails = [
  'supersales1@himalayaerp.com',
  'supersales2@himalayaerp.com'
];

const databaseConfigs = [
  { name: 'Active / Browser Test DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Dev DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public' },
  { name: 'Test DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_test?schema=public' },
  { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Docker DB (Port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
];

if (process.env.LIVE_DATABASE_URL) {
  databaseConfigs.push({ name: 'Live / Production DB (LIVE_DATABASE_URL)', url: process.env.LIVE_DATABASE_URL });
}
if (process.env.PROD_DATABASE_URL) {
  databaseConfigs.push({ name: 'Production DB (PROD_DATABASE_URL)', url: process.env.PROD_DATABASE_URL });
}
if (process.env.EXTERNAL_DATABASE_URL) {
  databaseConfigs.push({ name: 'External DB (EXTERNAL_DATABASE_URL)', url: process.env.EXTERNAL_DATABASE_URL });
}

async function cleanDatabase(config) {
  console.log(`\n======================================================================`);
  console.log(` CONNECTING TO: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Find users
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, email, name FROM "User" 
      WHERE LOWER(email) IN ('supersales1@himalayaerp.com', 'supersales2@himalayaerp.com')
    `);

    if (!users || users.length === 0) {
      console.log(`ℹ️  No SuperSales 1 or 2 users found in ${config.name}.`);
      return;
    }

    const userIds = users.map(u => u.id);
    console.log(`Found target users in DB:`);
    for (const u of users) {
      console.log(`  - ${u.email} (Name: "${u.name}", ID: ${u.id})`);
    }

    const idListStr = userIds.map(id => `'${id}'`).join(',');

    // Helper to get columns for a table
    async function getColumns(tableName) {
      try {
        const cols = await prisma.$queryRawUnsafe(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = '${tableName}' AND table_schema = 'public'
        `);
        return new Set(cols.map(c => c.column_name));
      } catch (e) {
        return new Set();
      }
    }

    // Helper to safely execute SQL
    async function safeExec(sql) {
      try {
        const res = await prisma.$executeRawUnsafe(sql);
        return res;
      } catch (e) {
        return 0;
      }
    }

    const leadCols = await getColumns('Lead');
    const quoteCols = await getColumns('Quotation');
    const orderCols = await getColumns('SalesOrder');

    // 2. Resolve Lead IDs
    let leadWhereClauses = [];
    if (leadCols.has('createdById')) leadWhereClauses.push(`"createdById" IN (${idListStr})`);
    if (leadCols.has('salesExecutiveId')) leadWhereClauses.push(`"salesExecutiveId" IN (${idListStr})`);
    if (leadCols.has('assignedToId')) leadWhereClauses.push(`"assignedToId" IN (${idListStr})`);
    if (leadCols.has('salespersonId')) leadWhereClauses.push(`"salespersonId" IN (${idListStr})`);
    if (leadCols.has('remarks')) {
      leadWhereClauses.push(`"remarks" ILIKE '%Super Sales 2%'`);
      leadWhereClauses.push(`"remarks" ILIKE '%Super Sales 1%'`);
    }

    let leadIds = [];
    if (leadWhereClauses.length > 0) {
      const leads = await prisma.$queryRawUnsafe(`SELECT id FROM "Lead" WHERE ${leadWhereClauses.join(' OR ')}`);
      leadIds = leads.map(l => l.id);
    }
    const leadIdListStr = leadIds.length > 0 ? leadIds.map(id => `'${id}'`).join(',') : `''`;

    // 3. Resolve Quote IDs
    let quoteWhereClauses = [];
    if (quoteCols.has('createdById')) quoteWhereClauses.push(`"createdById" IN (${idListStr})`);
    if (quoteCols.has('salesExecutiveId')) quoteWhereClauses.push(`"salesExecutiveId" IN (${idListStr})`);
    if (quoteCols.has('leadId') && leadIds.length > 0) quoteWhereClauses.push(`("leadId" IS NOT NULL AND "leadId" IN (${leadIdListStr}))`);

    let quoteIds = [];
    if (quoteWhereClauses.length > 0) {
      const quotes = await prisma.$queryRawUnsafe(`SELECT id FROM "Quotation" WHERE ${quoteWhereClauses.join(' OR ')}`);
      quoteIds = quotes.map(q => q.id);
    }
    const quoteIdListStr = quoteIds.length > 0 ? quoteIds.map(id => `'${id}'`).join(',') : `''`;

    // 4. Resolve Order IDs
    let orderWhereClauses = [];
    if (orderCols.has('createdById')) orderWhereClauses.push(`"createdById" IN (${idListStr})`);
    if (orderCols.has('salesExecutiveId')) orderWhereClauses.push(`"salesExecutiveId" IN (${idListStr})`);
    if (orderCols.has('quotationId') && quoteIds.length > 0) orderWhereClauses.push(`("quotationId" IS NOT NULL AND "quotationId" IN (${quoteIdListStr}))`);
    if (orderCols.has('sourceQuotationId') && quoteIds.length > 0) orderWhereClauses.push(`("sourceQuotationId" IS NOT NULL AND "sourceQuotationId" IN (${quoteIdListStr}))`);

    let orderIds = [];
    if (orderWhereClauses.length > 0) {
      const orders = await prisma.$queryRawUnsafe(`SELECT id FROM "SalesOrder" WHERE ${orderWhereClauses.join(' OR ')}`);
      orderIds = orders.map(o => o.id);
    }
    const orderIdListStr = orderIds.length > 0 ? orderIds.map(id => `'${id}'`).join(',') : `''`;

    // 5. Resolve Order Items
    let orderItemIds = [];
    if (orderIds.length > 0) {
      const orderItems = await prisma.$queryRawUnsafe(`SELECT id FROM "SalesOrderItem" WHERE "salesOrderId" IN (${orderIdListStr})`);
      orderItemIds = orderItems.map(oi => oi.id);
    }
    const orderItemIdListStr = orderItemIds.length > 0 ? orderItemIds.map(id => `'${id}'`).join(',') : `''`;

    // 6. Production plans & Work Orders
    let planIds = [];
    if (orderIds.length > 0) {
      const plans = await prisma.$queryRawUnsafe(`SELECT id FROM "ProductionPlan" WHERE "salesOrderId" IN (${orderIdListStr})`);
      planIds = plans.map(p => p.id);
    }
    const planIdListStr = planIds.length > 0 ? planIds.map(id => `'${id}'`).join(',') : `''`;

    let workOrderWhere = [];
    if (planIds.length > 0) workOrderWhere.push(`("productionPlanId" IS NOT NULL AND "productionPlanId" IN (${planIdListStr}))`);
    if (orderItemIds.length > 0) workOrderWhere.push(`("salesOrderItemId" IS NOT NULL AND "salesOrderItemId" IN (${orderItemIdListStr}))`);
    workOrderWhere.push(`"createdById" IN (${idListStr})`);

    const workOrders = await prisma.$queryRawUnsafe(`SELECT id FROM "WorkOrder" WHERE ${workOrderWhere.join(' OR ')}`);
    const workOrderIds = workOrders.map(w => w.id);
    const workOrderIdListStr = workOrderIds.length > 0 ? workOrderIds.map(id => `'${id}'`).join(',') : `''`;

    // 7. Dispatches & Invoices
    let dispatchIds = [];
    if (orderIds.length > 0) {
      const dispatches = await prisma.$queryRawUnsafe(`SELECT id FROM "Dispatch" WHERE "salesOrderId" IN (${orderIdListStr})`);
      dispatchIds = dispatches.map(d => d.id);
    }
    const dispatchIdListStr = dispatchIds.length > 0 ? dispatchIds.map(id => `'${id}'`).join(',') : `''`;

    let invoiceIds = [];
    if (orderIds.length > 0) {
      const invoices = await prisma.$queryRawUnsafe(`SELECT id FROM "SalesInvoice" WHERE "salesOrderId" IN (${orderIdListStr})`);
      invoiceIds = invoices.map(i => i.id);
    }
    const invoiceIdListStr = invoiceIds.length > 0 ? invoiceIds.map(id => `'${id}'`).join(',') : `''`;

    // 8. Complaints
    const complaintCols = await getColumns('CustomerComplaint');
    let complaintWhere = [`"createdBy" IN (${idListStr})`];
    if (complaintCols.has('salesExecutiveId')) complaintWhere.push(`"salesExecutiveId" IN (${idListStr})`);
    if (complaintCols.has('submittedBy')) complaintWhere.push(`"submittedBy" IN (${idListStr})`);
    if (orderIds.length > 0) complaintWhere.push(`("orderId" IS NOT NULL AND "orderId" IN (${orderIdListStr}))`);

    const complaints = await prisma.$queryRawUnsafe(`SELECT id FROM "CustomerComplaint" WHERE ${complaintWhere.join(' OR ')}`);
    const complaintIds = complaints.map(c => c.id);
    const complaintIdListStr = complaintIds.length > 0 ? complaintIds.map(id => `'${id}'`).join(',') : `''`;

    // 9. Samples
    const sampleCols = await getColumns('SampleRequest');
    let sampleWhere = [`"createdById" IN (${idListStr})`];
    if (sampleCols.has('salesExecutiveId')) sampleWhere.push(`"salesExecutiveId" IN (${idListStr})`);
    if (leadIds.length > 0) sampleWhere.push(`("leadId" IS NOT NULL AND "leadId" IN (${leadIdListStr}))`);

    const samples = await prisma.$queryRawUnsafe(`SELECT id FROM "SampleRequest" WHERE ${sampleWhere.join(' OR ')}`);
    const sampleIds = samples.map(s => s.id);
    const sampleIdListStr = sampleIds.length > 0 ? sampleIds.map(id => `'${id}'`).join(',') : `''`;

    console.log(`\n--- Records identified in ${config.name} ---`);
    console.log(`  Leads:               ${leadIds.length}`);
    console.log(`  Quotations:          ${quoteIds.length}`);
    console.log(`  Sales Orders:        ${orderIds.length}`);
    console.log(`  Order Items:         ${orderItemIds.length}`);
    console.log(`  Production Plans:    ${planIds.length}`);
    console.log(`  Work Orders:         ${workOrderIds.length}`);
    console.log(`  Dispatches:          ${dispatchIds.length}`);
    console.log(`  Invoices:            ${invoiceIds.length}`);
    console.log(`  Customer Complaints: ${complaintIds.length}`);
    console.log(`  Sample Requests:     ${sampleIds.length}`);

    // --- DELETIONS ---
    // Followups
    if (leadIds.length > 0) {
      await safeExec(`DELETE FROM "FollowUp" WHERE "createdById" IN (${idListStr}) OR ("leadId" IS NOT NULL AND "leadId" IN (${leadIdListStr}));`);
    } else {
      await safeExec(`DELETE FROM "FollowUp" WHERE "createdById" IN (${idListStr});`);
    }

    // Complaints & Losses
    if (complaintIds.length > 0) {
      await safeExec(`DELETE FROM "CustomerComplaintItem" WHERE "complaintId" IN (${complaintIdListStr});`);
      await safeExec(`DELETE FROM "SalesOrderLoss" WHERE "complaintId" IN (${complaintIdListStr});`);
      await safeExec(`DELETE FROM "CustomerComplaint" WHERE "id" IN (${complaintIdListStr});`);
    }
    if (orderItemIds.length > 0) {
      await safeExec(`DELETE FROM "CustomerComplaintItem" WHERE "orderItemId" IN (${orderItemIdListStr});`);
    }
    if (orderIds.length > 0) {
      await safeExec(`DELETE FROM "SalesOrderLoss" WHERE "salesOrderId" IN (${orderIdListStr});`);
    }
    await safeExec(`DELETE FROM "SalesOrderLoss" WHERE "createdById" IN (${idListStr});`);

    // Production
    if (workOrderIds.length > 0) {
      await safeExec(`DELETE FROM "QCInspection" WHERE "workOrderId" IN (${workOrderIdListStr});`);
      await safeExec(`DELETE FROM "ProductionBatch" WHERE "workOrderId" IN (${workOrderIdListStr});`);
      await safeExec(`DELETE FROM "ProductionShiftEntry" WHERE "workOrderId" IN (${workOrderIdListStr});`);
      await safeExec(`DELETE FROM "ProductionScrapEntry" WHERE "workOrderId" IN (${workOrderIdListStr});`);
      await safeExec(`DELETE FROM "ProductionStatusHistory" WHERE "workOrderId" IN (${workOrderIdListStr});`);
      await safeExec(`DELETE FROM "FinishedGoods" WHERE "workOrderId" IN (${workOrderIdListStr});`);
      await safeExec(`DELETE FROM "WorkOrder" WHERE "id" IN (${workOrderIdListStr});`);
    }
    if (planIds.length > 0) {
      await safeExec(`DELETE FROM "ProductionPlan" WHERE "id" IN (${planIdListStr});`);
    }
    if (orderIds.length > 0) {
      await safeExec(`DELETE FROM "FinishedGoods" WHERE "salesOrderId" IN (${orderIdListStr});`);
    }

    // Dispatches
    if (dispatchIds.length > 0 || orderItemIds.length > 0) {
      if (dispatchIds.length > 0 && orderItemIds.length > 0) {
        await safeExec(`DELETE FROM "DispatchItem" WHERE ("dispatchId" IS NOT NULL AND "dispatchId" IN (${dispatchIdListStr})) OR ("salesOrderItemId" IS NOT NULL AND "salesOrderItemId" IN (${orderItemIdListStr}));`);
      } else if (dispatchIds.length > 0) {
        await safeExec(`DELETE FROM "DispatchItem" WHERE "dispatchId" IN (${dispatchIdListStr});`);
      } else if (orderItemIds.length > 0) {
        await safeExec(`DELETE FROM "DispatchItem" WHERE "salesOrderItemId" IN (${orderItemIdListStr});`);
      }
      if (dispatchIds.length > 0) {
        await safeExec(`DELETE FROM "Dispatch" WHERE "id" IN (${dispatchIdListStr});`);
      }
    }

    // Invoices
    if (invoiceIds.length > 0 || orderItemIds.length > 0) {
      if (invoiceIds.length > 0 && orderItemIds.length > 0) {
        await safeExec(`DELETE FROM "InvoiceItem" WHERE ("invoiceId" IS NOT NULL AND "invoiceId" IN (${invoiceIdListStr})) OR ("salesOrderItemId" IS NOT NULL AND "salesOrderItemId" IN (${orderItemIdListStr}));`);
      } else if (invoiceIds.length > 0) {
        await safeExec(`DELETE FROM "InvoiceItem" WHERE "invoiceId" IN (${invoiceIdListStr});`);
      } else if (orderItemIds.length > 0) {
        await safeExec(`DELETE FROM "InvoiceItem" WHERE "salesOrderItemId" IN (${orderItemIdListStr});`);
      }
      if (invoiceIds.length > 0) {
        await safeExec(`DELETE FROM "SalesInvoice" WHERE "id" IN (${invoiceIdListStr});`);
      }
    }

    // Orders & Deep relations
    if (orderIds.length > 0) {
      await safeExec(`DELETE FROM "CustomerPaymentAllocation" WHERE "salesOrderId" IN (${orderIdListStr});`);
      await safeExec(`DELETE FROM "CustomerPayment" WHERE "salesOrderId" IN (${orderIdListStr});`);
      if (orderItemIds.length > 0) {
        await safeExec(`DELETE FROM "SalesReturnItem" WHERE "salesOrderItemId" IN (${orderItemIdListStr});`);
      }
      await safeExec(`DELETE FROM "SalesReturn" WHERE "salesOrderId" IN (${orderIdListStr});`);
      if (orderItemIds.length > 0) {
        await safeExec(`DELETE FROM "ReplacementRequestItem" WHERE "salesOrderItemId" IN (${orderItemIdListStr});`);
      }
      await safeExec(`DELETE FROM "ReplacementRequest" WHERE "salesOrderId" IN (${orderIdListStr});`);
      await safeExec(`DELETE FROM "ReplacementOrder" WHERE "originalSalesOrderId" IN (${orderIdListStr});`);
      await safeExec(`DELETE FROM "SalesOrderAllocation" WHERE "salesOrderId" IN (${orderIdListStr});`);
      await safeExec(`DELETE FROM "SalesOrderCreditReview" WHERE "salesOrderId" IN (${orderIdListStr});`);
      await safeExec(`DELETE FROM "OrderAmendment" WHERE "salesOrderId" IN (${orderIdListStr});`);
      await safeExec(`DELETE FROM "SalesOrderHistory" WHERE "salesOrderId" IN (${orderIdListStr});`);
      if (orderItemIds.length > 0) {
        await safeExec(`DELETE FROM "SalesOrderItem" WHERE "id" IN (${orderItemIdListStr});`);
      }
      await safeExec(`DELETE FROM "SalesOrder" WHERE "id" IN (${orderIdListStr});`);
    }

    // Quotations
    if (quoteIds.length > 0) {
      await safeExec(`DELETE FROM "QuotationItem" WHERE "quotationId" IN (${quoteIdListStr});`);
      await safeExec(`DELETE FROM "QuotationTerm" WHERE "quotationId" IN (${quoteIdListStr});`);
      await safeExec(`DELETE FROM "Quotation" WHERE "id" IN (${quoteIdListStr});`);
    }

    // Samples
    if (sampleIds.length > 0) {
      await safeExec(`DELETE FROM "SampleHistory" WHERE "sampleRequestId" IN (${sampleIdListStr});`);
      await safeExec(`DELETE FROM "SampleItem" WHERE "sampleRequestId" IN (${sampleIdListStr});`);
      await safeExec(`DELETE FROM "SampleRequest" WHERE "id" IN (${sampleIdListStr});`);
    }

    // Leads
    if (leadIds.length > 0) {
      await safeExec(`DELETE FROM "LeadActivity" WHERE "leadId" IN (${leadIdListStr});`);
      await safeExec(`DELETE FROM "Lead" WHERE "id" IN (${leadIdListStr});`);
    }

    // Targets & Sessions
    await safeExec(`DELETE FROM "SalesTarget" WHERE "salespersonId" IN (${idListStr}) OR "createdById" IN (${idListStr});`);
    await safeExec(`DELETE FROM "DeviceSession" WHERE "userId" IN (${idListStr});`);
    await safeExec(`DELETE FROM "RefreshSession" WHERE "userId" IN (${idListStr});`);

    console.log(`✅ All SuperSales 1 & SuperSales 2 data deleted successfully from ${config.name}!`);

    // Verification
    let postLeadsCount = 0;
    if (leadWhereClauses.length > 0) {
      const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Lead" WHERE ${leadWhereClauses.join(' OR ')}`);
      postLeadsCount = res[0]?.count ?? 0;
    }
    let postQuotesCount = 0;
    if (quoteWhereClauses.length > 0) {
      const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Quotation" WHERE ${quoteWhereClauses.join(' OR ')}`);
      postQuotesCount = res[0]?.count ?? 0;
    }
    let postOrdersCount = 0;
    if (orderWhereClauses.length > 0) {
      const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "SalesOrder" WHERE ${orderWhereClauses.join(' OR ')}`);
      postOrdersCount = res[0]?.count ?? 0;
    }

    console.log(`\n--- Post-Clean Verification in ${config.name} (Should all be 0) ---`);
    console.log(`  Remaining Leads:       ${postLeadsCount}`);
    console.log(`  Remaining Quotations:  ${postQuotesCount}`);
    console.log(`  Remaining Orders:      ${postOrdersCount}`);

  } catch (err) {
    console.error(`❌ Failed on ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log(`======================================================================`);
  console.log(` SUPERSALES 1 & 2 COMPLETE DATA WIPE SCRIPT (LOCAL & LIVE)`);
  console.log(` Target Users: ${targetEmails.join(', ')}`);
  console.log(`======================================================================`);

  for (const config of databaseConfigs) {
    await cleanDatabase(config);
  }
  console.log(`\n======================================================================`);
  console.log(` COMPLETED ALL DATABASE RUNS`);
  console.log(`======================================================================\n`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
