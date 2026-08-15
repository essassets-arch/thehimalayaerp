const { PrismaClient } = require('@prisma/client');

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const dbs = isProd 
  ? [
      { name: 'Production DB', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@postgres:5432/himalaya_erp?schema=public' }
    ]
  : [
      { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
      { name: 'Standalone DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    ];

async function clearSalesForDb(db) {
  console.log(`\n=================================================`);
  console.log(` WIPING SALES DATA FOR: ${db.name}`);
  console.log(`=================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

  try {
    // 1. Ledgers and Financials
    await prisma.customerLedger.deleteMany({
      where: {
        OR: [
          { referenceType: 'SalesInvoice' },
          { referenceType: 'CustomerPayment' }
        ]
      }
    });
    console.log('Deleted Customer Ledgers for invoices/payments.');
    await prisma.paymentAllocation.deleteMany({});
    console.log('Deleted Payment Allocations.');
    await prisma.customerPaymentAllocation.deleteMany({});
    console.log('Deleted Customer Payment Allocations.');
    await prisma.customerPayment.deleteMany({});
    console.log('Deleted Customer Payments.');
    await prisma.invoiceItem.deleteMany({});
    console.log('Deleted Invoice Items.');
    await prisma.salesInvoice.deleteMany({});
    console.log('Deleted Sales Invoices.');

    // 2. Returns & Replacements
    await prisma.returnGateEntry.deleteMany({});
    console.log('Deleted Return Gate Entries.');
    await prisma.returnQcInspectionItem.deleteMany({});
    console.log('Deleted Return QC Inspection Items.');
    await prisma.returnQcInspection.deleteMany({});
    console.log('Deleted Return QC Inspections.');
    await prisma.salesReturnItem.deleteMany({});
    console.log('Deleted Sales Return Items.');
    await prisma.salesReturn.deleteMany({});
    console.log('Deleted Sales Returns.');
    await prisma.replacementOrderItem.deleteMany({});
    console.log('Deleted Replacement Order Items.');
    await prisma.replacementOrderHistory.deleteMany({});
    console.log('Deleted Replacement Order Histories.');
    await prisma.replacementOrder.deleteMany({});
    console.log('Deleted Replacement Orders.');
    await prisma.replacementRequestItem.deleteMany({});
    console.log('Deleted Replacement Request Items.');
    await prisma.replacementRequest.deleteMany({});
    console.log('Deleted Replacement Requests.');

    // 3. Dispatch
    await prisma.dispatchItem.deleteMany({});
    console.log('Deleted Dispatch Items.');
    await prisma.dispatch.deleteMany({});
    console.log('Deleted Dispatches.');

    // 4. Production
    await prisma.finishedGoods.deleteMany({});
    console.log('Deleted Finished Goods.');
    await prisma.productionBatch.deleteMany({});
    console.log('Deleted Production Batches.');
    await prisma.productionStatusHistory.deleteMany({});
    console.log('Deleted Production Status Histories.');
    await prisma.qCInspection.deleteMany({});
    console.log('Deleted QC Inspections.');
    await prisma.productionScrapEntry.deleteMany({});
    console.log('Deleted Production Scrap Entries.');
    await prisma.productionShiftEntry.deleteMany({});
    console.log('Deleted Production Shift Entries.');
    await prisma.workOrder.deleteMany({});
    console.log('Deleted Work Orders.');
    await prisma.productionPlan.deleteMany({});
    console.log('Deleted Production Plans.');

    // 5. Sales Orders
    await prisma.orderAmendment.deleteMany({});
    console.log('Deleted Order Amendments.');
    await prisma.salesOrderHistory.deleteMany({});
    console.log('Deleted Sales Order Histories.');
    await prisma.salesOrderCreditReview.deleteMany({});
    console.log('Deleted Sales Order Credit Reviews.');
    await prisma.salesOrderAllocation.deleteMany({});
    console.log('Deleted Sales Order Allocations.');
    await prisma.salesOrderItem.deleteMany({});
    console.log('Deleted Sales Order Items.');
    await prisma.salesOrder.deleteMany({});
    console.log('Deleted Sales Orders.');

    // 6. Pre-sales
    await prisma.quotationItem.deleteMany({});
    console.log('Deleted Quotation Items.');
    await prisma.quotation.deleteMany({});
    console.log('Deleted Quotations.');
    await prisma.sampleItem.deleteMany({});
    console.log('Deleted Sample Items.');
    await prisma.sampleRequest.deleteMany({});
    console.log('Deleted Sample Requests.');
    await prisma.leadActivity.deleteMany({});
    console.log('Deleted Lead Activities.');
    await prisma.followUp.deleteMany({});
    console.log('Deleted Follow Ups.');
    await prisma.lead.deleteMany({});
    console.log('Deleted Leads.');

    console.log(`✅ Successfully wiped all sales data for ${db.name}.`);
  } catch (err) {
    console.error(`❌ Error wiping data for ${db.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const db of dbs) {
    await clearSalesForDb(db);
  }
  console.log('\n🌟 ALL TARGET DATABASES WIPED SUCCESSFULLY');
}

main();
