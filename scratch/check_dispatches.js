const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dispatchesCount = await prisma.dispatch.count();
  const ordersCount = await prisma.salesOrder.count();
  const readyCount = await prisma.salesOrder.count({ where: { status: 'READY_FOR_DISPATCH' } });
  
  const dispatches = await prisma.dispatch.findMany({
    select: {
      id: true,
      dispatchNo: true,
      createdAt: true,
      dispatchedAt: true,
      totalWeight: true,
      packageCount: true,
      freightAmount: true,
      status: true,
      salesOrder: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true
        }
      }
    }
  });

  const ordersByStatus = await prisma.salesOrder.groupBy({
    by: ['status'],
    _count: true
  });

  console.log('Total Dispatches in DB:', dispatchesCount);
  console.log('Total Sales Orders in DB:', ordersCount);
  console.log('Ready for Dispatch Orders in DB:', readyCount);
  console.log('Orders by status:', ordersByStatus);
  console.log('Sample dispatches (up to 10):', dispatches.slice(0, 10));

  // Check month distribution of dispatches
  const months = {};
  for (const d of dispatches) {
    const date = d.dispatchedAt || d.createdAt;
    const m = date ? date.toISOString().slice(0, 7) : 'no-date';
    months[m] = (months[m] || 0) + 1;
  }
  console.log('Dispatches by month:', months);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
