const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const start = new Date('2026-10-01T00:00:00.000Z');
  const end = new Date('2026-10-31T23:59:59.999Z');

  const octWos = await prisma.workOrder.findMany({
    where: {
      OR: [
        { createdAt: { gte: start, lte: end } },
        { workOrderNumber: { startsWith: 'WO-OCT-' } },
        { workOrderNumber: { in: ['WO-1042', 'WO-1043', 'WO-1045', 'WO-1046', 'WO-1047', 'WO-1048'] } }
      ]
    },
    include: {
      salesOrderItem: { include: { product: true } }
    }
  });

  console.log('October WOs total count:', octWos.length);

  const stageCounts = {
    incoming: 0,
    floorRuns: 0,
    qcTesting: 0,
    reworkScrap: 0,
    readyDispatch: 0,
    dispatched: 0
  };

  const stageWeights = {
    incoming: 0,
    floorRuns: 0,
    qcTesting: 0,
    reworkScrap: 0,
    readyDispatch: 0,
    dispatched: 0
  };

  for (const w of octWos) {
    const prod = w.salesOrderItem?.product;
    const wt = (Number(prod?.weight || prod?.unitWeightKg || 80) * Number(w.quantity || 1)) / 1000;

    if (w.workOrderNumber.startsWith('WO-OCT-INC-') || w.workOrderNumber === 'WO-1048') {
      stageCounts.incoming++;
      stageWeights.incoming += wt;
    } else if (w.workOrderNumber.startsWith('WO-OCT-FLR-') || ['WO-1042', 'WO-1046'].includes(w.workOrderNumber)) {
      stageCounts.floorRuns++;
      stageWeights.floorRuns += wt;
    } else if (w.workOrderNumber.startsWith('WO-OCT-QC-') || ['WO-1043', 'WO-1047'].includes(w.workOrderNumber)) {
      stageCounts.qcTesting++;
      stageWeights.qcTesting += wt;
    } else if (w.workOrderNumber.startsWith('WO-OCT-RWK-') || w.workOrderNumber === 'WO-1045') {
      stageCounts.reworkScrap++;
      stageWeights.reworkScrap += wt;
    } else if (w.workOrderNumber.startsWith('WO-OCT-RDY-')) {
      stageCounts.readyDispatch++;
      stageWeights.readyDispatch += wt;
    } else if (w.workOrderNumber.startsWith('WO-OCT-DSP-')) {
      stageCounts.dispatched++;
      stageWeights.dispatched += wt;
    }
  }

  console.log('Stage counts:', stageCounts);
  console.log('Stage weights MT:', {
    incoming: stageWeights.incoming.toFixed(1),
    floorRuns: stageWeights.floorRuns.toFixed(1),
    qcTesting: stageWeights.qcTesting.toFixed(1),
    reworkScrap: stageWeights.reworkScrap.toFixed(1),
    readyDispatch: stageWeights.readyDispatch.toFixed(1),
    dispatched: stageWeights.dispatched.toFixed(1),
  });
}
main().finally(() => prisma.$disconnect());
