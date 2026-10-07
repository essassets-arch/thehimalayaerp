const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shiftEntries = await prisma.productionShiftEntry.count();
  const scrapEntries = await prisma.productionScrapEntry.count();
  const productionBatches = await prisma.productionBatch.count();
  const qcInspections = await prisma.qCInspection.count();
  const statusHistory = await prisma.productionStatusHistory.count();
  
  console.log({
    shiftEntries,
    scrapEntries,
    productionBatches,
    qcInspections,
    statusHistory
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
