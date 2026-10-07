const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  // Test August 2026
  console.log('--- Checking August 2026 ---');
  const augStart = new Date('2026-07-31T18:30:00.000Z');
  const augEnd = new Date('2026-08-31T18:29:59.999Z');

  const augOrders = await prisma.workOrder.findMany({
    where: {
      createdAt: { gte: augStart, lte: augEnd }
    },
    include: {
      salesOrderItem: { include: { product: true } }
    }
  });

  console.log(`August Work Orders Count: ${augOrders.length}`);
  
  // Check products present in August
  const augProducts = new Set();
  const augSizes = new Set();
  const augCapacities = new Set();
  let augWeight = 0;
  let augCovers = 0;
  let augFrames = 0;

  for (const wo of augOrders) {
    const p = wo.salesOrderItem?.product;
    if (p?.name) augProducts.add(p.name);
    if (p?.size) augSizes.add(p.size);
    if (p?.capacity) augCapacities.add(p.capacity);
    const qty = Number(wo.quantity || 0);
    const cUnit = Number(p?.coverUnitWeight || 0);
    const fUnit = Number(p?.frameUnitWeight || 0);
    const cSet = Number(p?.coversPerSet || 1);
    const fSet = Number(p?.framesPerSet || 1);
    const cCount = qty * cSet;
    const fCount = qty * fSet;
    const wt = (cCount * cUnit) + (fCount * fUnit);
    augWeight += wt;
    augCovers += cCount;
    augFrames += fCount;
  }

  console.log(`August Total Weight: ${augWeight} KG`);
  console.log(`August Covers: ${augCovers}, Frames: ${augFrames}, Pieces: ${augCovers + augFrames}`);
  console.log(`Distinct Products: ${augProducts.size}`);
  console.log(`Distinct Sizes: ${augSizes.size}`);
  console.log(`Distinct Capacities: ${augCapacities.size}`);

  console.log('\n--- Checking September 2026 ---');
  const sepStart = new Date('2026-08-31T18:30:00.000Z');
  const sepEnd = new Date('2026-09-30T18:29:59.999Z');

  const sepOrders = await prisma.workOrder.findMany({
    where: {
      createdAt: { gte: sepStart, lte: sepEnd }
    },
    include: {
      salesOrderItem: { include: { product: true } }
    }
  });

  console.log(`September Work Orders Count: ${sepOrders.length}`);

  let sepWeight = 0;
  let sepCovers = 0;
  let sepFrames = 0;

  for (const wo of sepOrders) {
    const p = wo.salesOrderItem?.product;
    const qty = Number(wo.quantity || 0);
    const cUnit = Number(p?.coverUnitWeight || 0);
    const fUnit = Number(p?.frameUnitWeight || 0);
    const cSet = Number(p?.coversPerSet || 1);
    const fSet = Number(p?.framesPerSet || 1);
    const cCount = qty * cSet;
    const fCount = qty * fSet;
    const wt = (cCount * cUnit) + (fCount * fUnit);
    sepWeight += wt;
    sepCovers += cCount;
    sepFrames += fCount;
  }

  console.log(`September Total Weight: ${sepWeight} KG`);
  console.log(`September Covers: ${sepCovers}, Frames: ${sepFrames}, Pieces: ${sepCovers + sepFrames}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
