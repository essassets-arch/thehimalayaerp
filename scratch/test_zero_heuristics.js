const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Centralized authoritative weight calculation function
function calculateProductionWeight(product, quantity) {
  const coversPerSet = Number(product?.coversPerSet || 1);
  const framesPerSet = Number(product?.framesPerSet || 1);
  const covers = quantity * coversPerSet;
  const frames = quantity * framesPerSet;
  const pieces = covers + frames;

  const coverUnitWeight = Number(product?.coverUnitWeight || 0);
  const frameUnitWeight = Number(product?.frameUnitWeight || 0);
  const unitWeight = Number(product?.weight || 0);

  let totalWeight = 0;
  let hasValidWeight = false;

  if (coverUnitWeight > 0 || frameUnitWeight > 0) {
    totalWeight = (covers * coverUnitWeight) + (frames * frameUnitWeight);
    hasValidWeight = true;
  } else if (unitWeight > 0) {
    totalWeight = quantity * unitWeight;
    hasValidWeight = true;
  }

  return {
    quantity,
    covers,
    frames,
    pieces,
    coversPerSet,
    framesPerSet,
    coverUnitWeight,
    frameUnitWeight,
    weight: Math.round(totalWeight * 100) / 100,
    hasValidWeight,
  };
}

async function testMonths() {
  console.log('Testing calculation with ZERO heuristics:');

  for (const ym of ['2026-08', '2026-09', '2026-05']) {
    const [yearStr, monthStr] = ym.split('-');
    const year = parseInt(yearStr, 10);
    const mIdx = parseInt(monthStr, 10) - 1;
    const lastDay = new Date(year, mIdx + 1, 0).getDate();
    const startDate = new Date(`${year}-${monthStr}-01T00:00:00.000+05:30`);
    const endDate = new Date(`${year}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+05:30`);

    const wos = await prisma.workOrder.findMany({
      where: {
        OR: [
          { completedAt: { gte: startDate, lte: endDate } },
          { createdAt: { gte: startDate, lte: endDate } }
        ]
      },
      include: {
        salesOrderItem: { include: { product: true } },
        productionPlan: {
          include: {
            salesOrder: {
              include: { items: { include: { product: true } } }
            }
          }
        }
      }
    });

    let totalWeight = 0;
    let totalCovers = 0;
    let totalFrames = 0;
    let totalPieces = 0;
    let unmappedCapacities = 0;
    let unmappedSizes = 0;
    let unmappedWeights = 0;

    for (const wo of wos) {
      const p = wo.salesOrderItem?.product || wo.productionPlan?.salesOrder?.items?.[0]?.product;
      const calc = calculateProductionWeight(p, Number(wo.quantity || 0));
      totalWeight += calc.weight;
      totalCovers += calc.covers;
      totalFrames += calc.frames;
      totalPieces += calc.pieces;

      if (!calc.hasValidWeight) unmappedWeights++;
      if (!p?.capacity) unmappedCapacities++;
      if (!p?.size) unmappedSizes++;
    }

    console.log(`\nMonth: ${ym}`);
    console.log(`- Work Orders: ${wos.length}`);
    console.log(`- Total Weight: ${Math.round(totalWeight * 100) / 100} KG`);
    console.log(`- Total Covers: ${totalCovers}`);
    console.log(`- Total Frames: ${totalFrames}`);
    console.log(`- Total Pieces: ${totalPieces}`);
    console.log(`- Unmapped Weights: ${unmappedWeights}`);
    console.log(`- Unmapped Capacities: ${unmappedCapacities}`);
    console.log(`- Unmapped Sizes: ${unmappedSizes}`);
  }
}

testMonths().catch(console.error).finally(() => prisma.$disconnect());
