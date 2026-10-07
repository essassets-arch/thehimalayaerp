const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function compareMayAndAug() {
  const aug = await prisma.workOrder.findMany({
    where: {
      OR: [
        { completedAt: { gte: new Date('2026-08-01T00:00:00.000+05:30'), lte: new Date('2026-08-31T23:59:59.999+05:30') } },
        { createdAt: { gte: new Date('2026-08-01T00:00:00.000+05:30'), lte: new Date('2026-08-31T23:59:59.999+05:30') } }
      ]
    },
    take: 3
  });

  const may = await prisma.workOrder.findMany({
    where: {
      OR: [
        { completedAt: { gte: new Date('2026-05-01T00:00:00.000+05:30'), lte: new Date('2026-05-31T23:59:59.999+05:30') } },
        { createdAt: { gte: new Date('2026-05-01T00:00:00.000+05:30'), lte: new Date('2026-05-31T23:59:59.999+05:30') } }
      ]
    },
    take: 3
  });

  console.log('Sample August WO:', JSON.stringify(aug[0], null, 2));
  console.log('Sample May WO:', JSON.stringify(may[0], null, 2));
}

compareMayAndAug().catch(console.error).finally(() => prisma.$disconnect());
