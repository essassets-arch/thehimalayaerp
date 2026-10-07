const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wos = await prisma.workOrder.findMany({
    select: {
      id: true,
      workOrderNumber: true,
      createdAt: true,
      completedAt: true,
      status: true,
    }
  });

  console.log(`Total WorkOrders: ${wos.length}`);
  
  let createdInAug = 0;
  let completedInAug = 0;
  let createdInSep = 0;
  let completedInSep = 0;

  for (const w of wos) {
    if (w.createdAt) {
      const c = new Date(w.createdAt.getTime() + 5.5 * 3600 * 1000).toISOString();
      if (c.startsWith('2026-08')) createdInAug++;
      if (c.startsWith('2026-09')) createdInSep++;
    }
    if (w.completedAt) {
      const comp = new Date(w.completedAt.getTime() + 5.5 * 3600 * 1000).toISOString();
      if (comp.startsWith('2026-08')) completedInAug++;
      if (comp.startsWith('2026-09')) completedInSep++;
    }
  }

  console.log({ createdInAug, completedInAug, createdInSep, completedInSep });

  // Let's test the exact query from plant-head.service.ts for August:
  const startDate = new Date('2026-08-01T00:00:00.000+05:30');
  const endDate = new Date('2026-08-31T23:59:59.999+05:30');
  const augResults = await prisma.workOrder.findMany({
    where: {
      OR: [
        { completedAt: { gte: startDate, lte: endDate } },
        { createdAt: { gte: startDate, lte: endDate } }
      ]
    },
    include: {
      salesOrderItem: { include: { product: true } }
    }
  });
  console.log(`Prisma OR query for August found: ${augResults.length} work orders`);
  if (augResults.length > 0) {
    console.log('Sample August WO:', {
      no: augResults[0].workOrderNumber,
      createdAt: augResults[0].createdAt,
      completedAt: augResults[0].completedAt,
      status: augResults[0].status
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
