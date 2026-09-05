const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
});

async function main() {
  const q = await prisma.quotation.findFirst({
    where: { quotationNumber: 'QT/2627/0001' },
    include: {
      workflowState: true,
      salesOrder: true,
      sourceSalesOrders: true
    }
  });

  console.log('Quotation 0001:');
  console.log('  id:', q.id);
  console.log('  quotationNumber:', q.quotationNumber);
  console.log('  workflowState:', q.workflowState?.name, `(${q.workflowState?.code})`);
  console.log('  salesOrder:', q.salesOrder ? q.salesOrder.orderNumber : 'null');
  console.log('  sourceSalesOrders:', q.sourceSalesOrders.map(s => s.orderNumber).join(', '));

  // Also check if any order has quotationId or sourceQuotationId pointing to q.id
  const orders = await prisma.salesOrder.findMany({
    where: { OR: [{ quotationId: q.id }, { sourceQuotationId: q.id }] }
  });
  console.log('  matched salesOrders by FK:', orders.map(o => o.orderNumber).join(', '));

  await prisma.$disconnect();
}

main().catch(console.error);
