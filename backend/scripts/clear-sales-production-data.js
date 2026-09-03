const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runCleanup() {
  console.log('================================================================');
  console.log(' STARTING DATA DELETION: Sales, Production, QC, Dispatch, Finance');
  console.log('================================================================');

  const targetTables = [
    // 1. Dispatch & Dispatch Reports
    'DispatchDailyReportItem',
    'DispatchDailyReport',
    'DispatchItem',
    'Dispatch',

    // 2. Production, Floor, Work Orders, QC, Finished Goods
    'FinishedGoods',
    'QCInspection',
    'ProductionTestingRecord',
    'ProductionScrapEntry',
    'ProductionShiftEntry',
    'ProductionBatch',
    'ProductionStatusHistory',
    'WorkOrder',
    'ProductionPlan',
    'ProductionDailyReportItem',
    'ProductionDailyReport',
    'production_targets',
    'MachineDailyStatus',

    // 3. Finance, Invoices, Customer Payments, Ledgers
    'InvoiceItem',
    'PaymentAllocation',
    'CustomerPaymentAllocation',
    'CustomerPayment',
    'CreditNote',
    'SalesInvoice',
    'CustomerLedger',

    // 4. Returns & Replacements
    'ReturnQcInspectionItem',
    'ReturnQcInspection',
    'ReturnGateEntry',
    'SalesReturnItem',
    'SalesReturn',
    'ReplacementOrderHistory',
    'ReplacementOrderItem',
    'ReplacementOrder',
    'ReplacementRequestItem',
    'ReplacementRequest',

    // 5. Sales Orders, Items, Reviews, Losses, Complaints
    'CustomerComplaintItem',
    'CustomerComplaint',
    'SalesOrderLoss',
    'OrderAmendment',
    'SalesOrderHistory',
    'SalesOrderAllocation',
    'SalesOrderCreditReview',
    'SalesOrderItem',
    'SalesOrder',

    // 6. Quotations & Quotation Items
    'QuotationTerm',
    'QuotationItem',
    'Quotation',

    // 7. Sample Management
    'SampleHistory',
    'SampleItem',
    'SampleRequest',

    // 8. Leads, Daily Tasks, CRM Activities, Targets, Brand Analysis
    'FollowUp',
    'LeadActivity',
    'Lead',
    'SalesTarget',
    'BackOfficeDailyReport',
    'BrandAnalysisHistory',
    'BrandAnalysisRequest',

    // 9. Customers Directory
    'Customer',
  ];

  // Fetch all existing table names in public schema
  const dbTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);
  const existingTableNames = new Set(dbTables.map(t => t.table_name));

  const validTables = [];
  for (const t of targetTables) {
    if (existingTableNames.has(t)) {
      validTables.push(t);
    } else {
      const found = [...existingTableNames].find(x => x.toLowerCase() === t.toLowerCase());
      if (found) validTables.push(found);
    }
  }

  console.log(`[INFO] Truncating ${validTables.length} tables with CASCADE...`);
  const truncateSql = `TRUNCATE TABLE ${validTables.map(t => `"${t}"`).join(', ')} CASCADE;`;
  await prisma.$executeRawUnsafe(truncateSql);
  console.log('✅ Successfully truncated all target tables.');

  // Delete sales/production/dispatch/finance related WorkflowHistory
  try {
    const wfResult = await prisma.$executeRawUnsafe(`
      DELETE FROM "WorkflowHistory" 
      WHERE "entityType" IN (
        'SalesOrder', 'Lead', 'Quotation', 'WorkOrder', 'ProductionPlan', 
        'Dispatch', 'SampleRequest', 'CustomerComplaint', 'CustomerPayment', 
        'SalesReturn', 'ReplacementRequest', 'SalesInvoice'
      );
    `);
    console.log(`✅ Cleaned WorkflowHistory records (${wfResult} removed).`);
  } catch (err) {
    console.warn(`[WARN] WorkflowHistory cleanup: ${err.message}`);
  }

  // Delete sales/production related notifications
  try {
    const notifResult = await prisma.$executeRawUnsafe(`
      DELETE FROM "Notification" 
      WHERE "type" LIKE 'SALES_%' 
         OR "type" LIKE 'PRODUCTION_%' 
         OR "type" LIKE 'DISPATCH_%'
         OR "type" LIKE 'ORDER_%'
         OR "type" LIKE 'QUOTATION_%'
         OR "type" LIKE 'LEAD_%'
         OR "type" LIKE 'CUSTOMER_%'
         OR "type" = 'GENERAL';
    `);
    console.log(`✅ Cleaned related Notifications (${notifResult} removed).`);
  } catch (err) {
    console.warn(`[WARN] Notification cleanup: ${err.message}`);
  }

  // Clean inventory transactions related to sales/dispatch
  try {
    const invResult = await prisma.$executeRawUnsafe(`
      DELETE FROM "InventoryTransaction" 
      WHERE "referenceType" IN ('SALES_ORDER', 'DISPATCH', 'WORK_ORDER', 'RETURN', 'REPLACEMENT');
    `);
    console.log(`✅ Cleaned sales/dispatch InventoryTransactions (${invResult} removed).`);
  } catch (err) {
    console.warn(`[WARN] InventoryTransaction cleanup: ${err.message}`);
  }

  // Reset Document Sequences back to 0
  try {
    const seqResult = await prisma.$executeRawUnsafe(`
      UPDATE "DocumentSequence" 
      SET "currentNumber" = 0 
      WHERE "documentType" IN ('SO', 'QT', 'WO', 'INV', 'DISP', 'PAY', 'RET', 'REPL', 'SAMP', 'PROD', 'LEAD', 'CUST', 'CR');
    `);
    console.log(`✅ Reset DocumentSequences to 0 (${seqResult} sequences reset).`);
  } catch (err) {
    console.warn(`[WARN] DocumentSequence reset: ${err.message}`);
  }

  console.log('================================================================');
  console.log(' DATA PURGE COMPLETE: All requested sales, production,');
  console.log(' dispatch, finance, and customer data have been deleted.');
  console.log('================================================================');
}

runCleanup()
  .catch((err) => {
    console.error('❌ Data cleanup error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
