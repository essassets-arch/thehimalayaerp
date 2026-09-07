const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const so277 = await prisma.salesOrder.findMany({
    where: { orderNumber: { contains: '277' } }
  });
  console.log('Sales orders with 277:', so277);

  const wo277 = await prisma.workOrder.findMany({
    where: { workOrderNumber: { contains: '277' } }
  });
  console.log('Work orders with 277:', wo277);

  const allSos = await prisma.salesOrder.findMany({
    select: { id: true, orderNumber: true, status: true },
    orderBy: { createdAt: 'desc' },
    take: 30
  });
  console.log('Recent 30 sales orders in DB:', allSos.map(s => `${s.orderNumber} (${s.status})`));

  await prisma.$disconnect();
}
run();
