const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.salesOrder.findMany({
    include: {
      customer: true,
      salesExecutive: true,
      dispatches: true
    }
  });
  console.log('Total orders:', orders.length);
  const withCustomer = orders.filter(o => o.customer);
  console.log('Orders with customer:', withCustomer.length);
  const withExecutive = orders.filter(o => o.salesExecutive);
  console.log('Orders with executive:', withExecutive.length);
  const withDispatches = orders.filter(o => o.dispatches?.length > 0);
  console.log('Orders with dispatches:', withDispatches.length);

  // Group by quarter
  const quarters = {};
  for (const o of orders) {
    const d = new Date(o.orderDate);
    const m = d.getMonth();
    const y = d.getFullYear();
    let q;
    if (m >= 3 && m <= 5) q = 'Q1-2026/27';
    else if (m >= 6 && m <= 8) q = 'Q2-2026/27';
    else if (m >= 9 && m <= 11) q = 'Q3-2026/27';
    else q = 'Q4-2026/27';
    quarters[q] = (quarters[q] || 0) + 1;
  }
  console.log('Orders by quarter:', quarters);
}

run().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
