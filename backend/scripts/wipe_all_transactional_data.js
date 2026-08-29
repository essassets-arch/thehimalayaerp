const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function clearTransactionalData() {
  console.log('=== WIPING ALL TRANSACTIONAL DATA (SALES, PRODUCTION, DISPATCH, STORE) ===\n');

  const tablesToWipe = [
    // Dispatch
    'DispatchDailyReportItem',
    'DispatchDailyReport',
    'DispatchItem',
    'DispatchTracking',
    'Dispatch',

    // Production & QC
    'ProductionDailyReportItem',
    'ProductionDailyReport',
    'ProductionTestingRecord',
    'QcInspectionItem',
    'QcInspection',
    'FinishedGoods',
    'WorkOrder',
    'ProductionPlan',
    'MachineDailyStatus',

    // Store & Procurement & Inventory
    'PurchaseOrderStatusHistory',
    'PurchaseOrderItem',
    'PurchaseOrder',
    'PurchaseIndentStatusHistory',
    'PurchaseIndentItem',
    'PurchaseIndent',
    'GrnItem',
    'GoodsReceiptNote',
    'VendorReturn',
    'SupplierPayable',
    'ProcurementDelivery',
    'MaterialRejection',
    'ProcurementReplacementRequest',
    'BrandAnalysisHistory',
    'BrandAnalysisRequest',
    'MaterialRequestItem',
    'MaterialRequest',
    'StockHistory',
    'InventoryTransaction',

    // Sales, CRM, Finance
    'PaymentAllocation',
    'InvoiceItem',
    'Invoice',
    'CustomerPayment',
    'CustomerLedger',
    'SalesReturnItem',
    'SalesReturn',
    'SalesReplacement',
    'CustomerComplaint',
    'SampleFeedback',
    'SampleRequest',
    'OrderHoldHistory',
    'OrderStatusHistory',
    'SalesOrderItem',
    'SalesOrder',
    'QuotationTerm',
    'QuotationItem',
    'Quotation',
    'LeadActivity',
    'SalesFollowUp',
    'SalesReminder',
    'Lead',
    'Customer',

    // Workflow & Audit History
    'WorkflowHistory',
    'AuditLog',
    'IdempotencyRecord',
    'Notification',
    'BackOfficeDailyReport'
  ];

  for (const table of tablesToWipe) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`✅ Truncated: ${table}`);
    } catch (err) {
      console.warn(`⚠️ Table ${table} not truncated (might not exist):`, err.message);
    }
  }

  // Reset Document sequences cleanly so numbering starts fresh from 0
  try {
    await prisma.$executeRawUnsafe(`UPDATE "DocumentSequence" SET "currentNumber" = 0;`);
    await prisma.$executeRawUnsafe(`UPDATE "IdSequence" SET "nextValue" = 1;`);
    console.log('✅ Reset DocumentSequence and IdSequence counters');
  } catch (err) {
    console.warn('⚠️ Sequence reset warning:', err.message);
  }

  console.log('\n=== DATA REMOVAL COMPLETE ===\n');
}

clearTransactionalData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
