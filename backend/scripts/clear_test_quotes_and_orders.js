const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearQuotesAndOrders() {
  console.log('=== CLEARING TEST QUOTATIONS AND SALES ORDERS ===\n');

  const tables = [
    'DispatchDailyReportItem',
    'DispatchDailyReport',
    'DispatchItem',
    'DispatchTracking',
    'Dispatch',
    'FinishedGoods',
    'WorkOrder',
    'ProductionPlan',
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
    'Quotation'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`✓ Truncated: ${table}`);
    } catch (e) {
      console.log(`- Skip/Not exists: ${table}`);
    }
  }

  // Reset Sequences to 1
  await prisma.idSequence.upsert({
    where: { key: 'quotation_number_2627' },
    update: { nextValue: 1 },
    create: { key: 'quotation_number_2627', nextValue: 1 }
  });
  await prisma.idSequence.upsert({
    where: { key: 'quotation_number' },
    update: { nextValue: 1 },
    create: { key: 'quotation_number', nextValue: 1 }
  });
  console.log('\n✓ Reset quotation sequences (quotation_number_2627 & quotation_number) to 1.');

  await prisma.idSequence.upsert({
    where: { key: 'sales_order_number_2627' },
    update: { nextValue: 1 },
    create: { key: 'sales_order_number_2627', nextValue: 1 }
  });
  await prisma.idSequence.upsert({
    where: { key: 'sales_order_number' },
    update: { nextValue: 1 },
    create: { key: 'sales_order_number', nextValue: 1 }
  });
  console.log('✓ Reset sales order sequences (sales_order_number_2627 & sales_order_number) to 1.');

  // Verify Counts
  const remainingQuotes = await prisma.quotation.count();
  const remainingOrders = await prisma.salesOrder.count();
  const remainingLeads = await prisma.lead.count();
  console.log(`\nRemaining Quotations: ${remainingQuotes} (Expected: 0)`);
  console.log(`Remaining Sales Orders: ${remainingOrders} (Expected: 0)`);
  console.log(`Remaining Leads: ${remainingLeads} (Preserved for SuperSales 1)`);
}

clearQuotesAndOrders().catch(console.error).finally(() => prisma.$disconnect());
