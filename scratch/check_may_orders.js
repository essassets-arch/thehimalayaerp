const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMayOrders() {
  const may = await prisma.workOrder.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-05-01T00:00:00.000+05:30'),
        lte: new Date('2026-05-31T23:59:59.999+05:30')
      }
    },
    include: {
      productionPlan: {
        include: {
          salesOrder: true
        }
      }
    }
  });

  console.log(`May count: ${may.length}`);
  for (const m of may) {
    console.log(m.workOrderNumber, m.productionPlan?.salesOrder?.orderNumber, m.productionPlan?.salesOrder?.orderDate);
  }
}

checkMayOrders().catch(console.error).finally(() => prisma.$disconnect());
