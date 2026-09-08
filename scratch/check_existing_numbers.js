const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- EXISTING RECORDS & SEQUENCES CHECK ---');
  
  const quotes = await prisma.quotation.findMany({
    select: { quotationNumber: true },
    orderBy: { quotationNumber: 'desc' },
    take: 10
  });
  console.log('Recent quotations:', quotes.map(q => q.quotationNumber));

  const orders = await prisma.salesOrder.findMany({
    select: { orderNumber: true },
    orderBy: { orderNumber: 'desc' },
    take: 10
  });
  console.log('Recent orders:', orders.map(o => o.orderNumber));

  const plans = await prisma.productionPlan.findMany({
    select: { planNumber: true },
    orderBy: { planNumber: 'desc' },
    take: 10
  });
  console.log('Recent plans:', plans.map(p => p.planNumber));

  const wos = await prisma.workOrder.findMany({
    select: { workOrderNumber: true },
    orderBy: { workOrderNumber: 'desc' },
    take: 10
  });
  console.log('Recent work orders:', wos.map(w => w.workOrderNumber));

  const seqs = await prisma.idSequence.findMany();
  console.log('ID Sequences:', seqs);

  await prisma.$disconnect();
}
run().catch(console.error);
