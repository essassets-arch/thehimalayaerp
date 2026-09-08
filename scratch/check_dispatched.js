const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dispatched = await prisma.workOrder.findMany({
    where: {
      OR: [
        { productionStatus: 'DISPATCHED' },
        { status: 'DISPATCHED' }
      ]
    },
    select: { id: true, workOrderNumber: true, productionStatus: true, status: true, sentToDispatchAt: true }
  });
  console.log('Work orders with DISPATCHED status:', dispatched.length);
  if (dispatched.length > 0) {
    console.log('Sample:', dispatched.slice(0, 5));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
