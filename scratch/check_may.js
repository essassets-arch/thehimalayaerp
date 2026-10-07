const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMay() {
  const startDate = new Date('2026-05-01T00:00:00.000+05:30');
  const endDate = new Date('2026-05-31T23:59:59.999+05:30');

  const wos = await prisma.workOrder.findMany({
    where: {
      OR: [
        { completedAt: { gte: startDate, lte: endDate } },
        { createdAt: { gte: startDate, lte: endDate } }
      ]
    },
    select: {
      id: true,
      workOrderNumber: true,
      createdAt: true,
      completedAt: true,
      status: true
    }
  });

  console.log(`May 2026 WOs count: ${wos.length}`);
  wos.forEach(w => console.log(w.workOrderNumber, 'createdAt:', w.createdAt, 'completedAt:', w.completedAt));
}

checkMay().catch(console.error).finally(() => prisma.$disconnect());
