const { PrismaClient } = require('@prisma/client');

async function wipeAllSalesDataFromDb(config) {
  console.log(`\n======================================================================`);
  console.log(` 🗑️  COMPREHENSIVE WIPE OF ALL SALES DATA (ALL USERS) FROM: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
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
    // Helper to safely execute query
    const safeExec = async (sql, desc) => {
      try {
        const res = await prisma.$executeRawUnsafe(sql);
        if (desc) console.log(`  ✓ ${desc}`);
        return res;
      } catch (e) {
        // Table or column may not exist, which is fine
      }
    };

    // Helper to truncate or delete from table
    const safeTruncateOrDelete = async (tableName, desc) => {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`);
        if (desc) console.log(`  ✓ Cleared ${tableName} (${desc})`);
      } catch (e) {
        // Ignored if table doesn't exist
      }
    };

    console.log('1. Clearing Approvals and Attachments related to Sales/Production/Dispatch/Invoices...');
    await safeExec(`
      DELETE FROM "Approval" 
      WHERE "entityType" IN (
        'SalesOrder', 'Lead', 'Quotation', 'WorkOrder', 'ProductionPlan', 
        'Dispatch', 'SampleRequest', 'CustomerComplaint', 'CustomerPayment', 
        'SalesReturn', 'ReplacementRequest', 'SalesInvoice', 'Payment'
      )
    `, 'Approvals cleared');

    await safeExec(`
      DELETE FROM "Attachment" 
      WHERE "entityType" IN (
        'SalesOrder', 'Lead', 'Quotation', 'WorkOrder', 'ProductionPlan', 
        'Dispatch', 'SampleRequest', 'CustomerComplaint', 'CustomerPayment', 
        'SalesReturn', 'ReplacementRequest', 'SalesInvoice', 'Payment'
      )
    `, 'Attachments cleared');

    console.log('2. Clearing Production, QC, Work Orders & Plant Head Data...');
    await safeTruncateOrDelete('FinishedGoods', 'Finished Goods');
    await safeTruncateOrDelete('ReturnQcInspectionItem', 'Return QC Inspection Items');
    await safeTruncateOrDelete('ReturnQcInspection', 'Return QC Inspections');
    await safeTruncateOrDelete('QCInspection', 'QC Inspections');
    await safeTruncateOrDelete('ProductionTestingRecord', 'Production Testing Records');
    await safeTruncateOrDelete('ProductionScrapEntry', 'Production Scrap Entries');
    await safeTruncateOrDelete('ProductionShiftEntry', 'Production Shift Entries');
    await safeTruncateOrDelete('ProductionBatch', 'Production Batches');
    await safeTruncateOrDelete('ProductionStatusHistory', 'Production Status Histories');
    await safeTruncateOrDelete('WorkOrderItem', 'Work Order Items');
    await safeTruncateOrDelete('WorkOrder', 'Work Orders');
    await safeTruncateOrDelete('ProductionPlanItem', 'Production Plan Items');
    await safeTruncateOrDelete('ProductionPlan', 'Production Plans');
    await safeTruncateOrDelete('ProductionDailyReportItem', 'Production Daily Report Items');
    await safeTruncateOrDelete('ProductionDailyReport', 'Production Daily Reports');
    await safeTruncateOrDelete('production_targets', 'Production Targets');
    await safeTruncateOrDelete('ProductionTarget', 'Production Targets');

    console.log('3. Clearing Dispatches, Invoices & Customer Payments...');
    await safeTruncateOrDelete('DispatchDailyReportItem', 'Dispatch Daily Report Items');
    await safeTruncateOrDelete('DispatchDailyReport', 'Dispatch Daily Reports');
    await safeTruncateOrDelete('PaymentAllocation', 'Payment Allocations');
    await safeTruncateOrDelete('CustomerPaymentAllocation', 'Customer Payment Allocations');
    await safeTruncateOrDelete('InvoiceItem', 'Invoice Items');
    await safeTruncateOrDelete('CustomerLedger', 'Customer Ledgers');
    await safeTruncateOrDelete('SalesInvoice', 'Sales Invoices');
    await safeTruncateOrDelete('DispatchItem', 'Dispatch Items');
    await safeTruncateOrDelete('Dispatch', 'Dispatches');

    console.log('4. Clearing Returns, Replacements & Customer Complaints...');
    await safeTruncateOrDelete('ReturnGateEntry', 'Return Gate Entries');
    await safeTruncateOrDelete('CreditNote', 'Credit Notes');
    await safeTruncateOrDelete('SalesReturnItem', 'Sales Return Items');
    await safeTruncateOrDelete('SalesReturn', 'Sales Returns');
    await safeTruncateOrDelete('ReplacementOrderHistory', 'Replacement Order Histories');
    await safeTruncateOrDelete('ReplacementOrderItem', 'Replacement Order Items');
    await safeTruncateOrDelete('ReplacementOrder', 'Replacement Orders');
    await safeTruncateOrDelete('ReplacementRequestItem', 'Replacement Request Items');
    await safeTruncateOrDelete('ReplacementRequest', 'Replacement Requests');
    await safeTruncateOrDelete('CustomerComplaintItem', 'Customer Complaint Items');
    await safeTruncateOrDelete('CustomerComplaint', 'Customer Complaints');

    console.log('5. Clearing Sales Orders & Amendments...');
    await safeTruncateOrDelete('CustomerPayment', 'Customer Payments');
    await safeTruncateOrDelete('Payment', 'Payments');
    await safeTruncateOrDelete('SalesOrderLoss', 'Sales Order Losses');
    await safeTruncateOrDelete('OrderAmendment', 'Order Amendments');
    await safeTruncateOrDelete('SalesOrderHistory', 'Sales Order Histories');
    await safeTruncateOrDelete('SalesOrderAllocation', 'Sales Order Allocations');
    await safeTruncateOrDelete('SalesOrderCreditReview', 'Sales Order Credit Reviews');
    await safeTruncateOrDelete('SalesOrderItem', 'Sales Order Items');
    await safeTruncateOrDelete('SalesOrder', 'Sales Orders');

    console.log('6. Clearing Quotations & Quotation Terms...');
    await safeTruncateOrDelete('QuotationRevision', 'Quotation Revisions');
    await safeTruncateOrDelete('QuotationTerm', 'Quotation Terms');
    await safeTruncateOrDelete('QuotationItem', 'Quotation Items');
    await safeTruncateOrDelete('Quotation', 'Quotations');

    console.log('7. Clearing Leads, Follow-ups, Activities, Reminders & Samples...');
    await safeTruncateOrDelete('SampleHistory', 'Sample Histories');
    await safeTruncateOrDelete('SampleItem', 'Sample Items');
    await safeTruncateOrDelete('SampleRequest', 'Sample Requests');
    await safeTruncateOrDelete('FollowUp', 'Follow Ups');
    await safeTruncateOrDelete('LeadActivity', 'Lead Activities');
    await safeTruncateOrDelete('Reminder', 'Reminders');
    await safeTruncateOrDelete('Lead', 'Leads');

    console.log('8. Clearing Customers created by Sales...');
    await safeTruncateOrDelete('Customer', 'Customers');

    console.log('9. Clearing Sales Targets & Sales Notifications...');
    await safeTruncateOrDelete('SalesTarget', 'Sales Targets');
    await safeExec(`
      DELETE FROM "Notification" 
      WHERE "type" LIKE 'SALES_%' 
         OR "type" LIKE 'PRODUCTION_%' 
         OR "type" LIKE 'DISPATCH_%'
         OR "type" LIKE 'ORDER_%'
         OR "type" LIKE 'QUOTATION_%'
         OR "type" LIKE 'LEAD_%'
         OR "type" LIKE 'CUSTOMER_%'
    `, 'Sales Notifications');

    console.log('10. Resetting Sequences...');
    await safeExec(`
      UPDATE "DocumentSequence" 
      SET "currentNumber" = 0 
      WHERE "documentType" IN ('SO', 'QT', 'WO', 'INV', 'DISP', 'PAY', 'RET', 'REPL', 'SAMP', 'PROD', 'LEAD', 'CUST', 'CR')
    `, 'Document Sequences Reset to 0');
    await safeExec(`UPDATE "IdSequence" SET "nextValue" = 1`, 'IdSequences Reset to 1');

    console.log(`\n🎉 [${config.name}] ALL SALES DATA FOR ALL SALES USERS HAS BEEN COMPLETELY WIPED!`);
  } catch (err) {
    console.error(`❌ Error wiping ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const isDocker = require('fs').existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));
  const targetDbs = [];

  if (process.env.DATABASE_URL) {
    targetDbs.push({ name: 'Configured DATABASE_URL', url: process.env.DATABASE_URL });
    if (process.env.DATABASE_URL.includes('@postgres:')) {
      targetDbs.push({
        name: 'Host Localhost Fallback (from @postgres:)',
        url: process.env.DATABASE_URL.replace('@postgres:', '@localhost:')
      });
      targetDbs.push({
        name: 'Host 127.0.0.1 Fallback (from @postgres:)',
        url: process.env.DATABASE_URL.replace('@postgres:', '@127.0.0.1:')
      });
    }
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
      { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
      { name: 'Local Dev DB (himalaya_erp_dev)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public' },
      { name: 'Local Test DB (himalaya_erp_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_test?schema=public' },
      { name: 'Docker Postgres 5433', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
      { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
    );
  }

  const seen = new Set();
  const uniqueDbs = targetDbs.filter(db => {
    if (seen.has(db.url)) return false;
    seen.add(db.url);
    return true;
  });

  for (const db of uniqueDbs) {
    await wipeAllSalesDataFromDb(db);
  }
}

main().catch(console.error);
