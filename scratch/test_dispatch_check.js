const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fgCount = await prisma.finishedGoods.count();
  const prodCount = await prisma.product.count({ where: { isActive: true } });
  const ddrCount = await prisma.dispatchDailyReport.count();
  const pdrCount = await prisma.productionDailyReport.count();
  console.log({ fgCount, prodCount, ddrCount, pdrCount });

  // Sample products with opening stock
  const sampleOpenings = await prisma.inventoryTransaction.findMany({
    where: { type: { in: ['OPENING_STOCK', 'OPENING', 'INITIAL_STOCK'] } },
    take: 5
  });
  console.log('Sample Openings:', sampleOpenings);

  // Check if FinishedGoods has rows for these products
  if (sampleOpenings.length > 0) {
    const prodIds = sampleOpenings.map(o => o.productId).filter(Boolean);
    const fgs = await prisma.finishedGoods.findMany({
      where: { productId: { in: prodIds } }
    });
    console.log('FinishedGoods for sample openings:', fgs);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
