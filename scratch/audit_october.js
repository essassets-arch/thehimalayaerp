const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditOctober() {
  const octStart = new Date('2026-09-30T18:30:00.000Z');
  const octEnd = new Date('2026-10-31T18:29:59.999Z');

  console.log('=== OCTOBER 2026 AUDIT ===');

  const workOrders = await prisma.workOrder.findMany({
    where: {
      OR: [
        { completedAt: { gte: octStart, lte: octEnd } },
        {
          AND: [
            { completedAt: null },
            { createdAt: { gte: octStart, lte: octEnd } },
          ],
        },
      ],
    },
    include: {
      salesOrderItem: {
        include: { product: true }
      },
      productionPlan: {
        include: { salesOrder: { include: { customer: true, items: { include: { product: true } } } } }
      }
    }
  });

  console.log(`Total October Work Orders in DB: ${workOrders.length}`);

  const dailyReports = await prisma.productionDailyReport.findMany({
    where: {
      reportDate: { gte: octStart, lte: octEnd },
      status: { notIn: ['CANCELLED', 'REJECTED'] }
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  console.log(`Total October Daily Production Reports: ${dailyReports.length}`);
  let totalReportItems = 0;
  let itemsWithWo = 0;
  let itemsWithoutWo = 0;
  let totalScaleWeight = 0;
  let totalCovers = 0;
  let totalFrames = 0;

  for (const r of dailyReports) {
    totalReportItems += r.items.length;
    for (const it of r.items) {
      if (it.workOrderId) itemsWithWo++;
      else itemsWithoutWo++;
      const actualCoverW = it.actualCoverWeight ? Number(it.actualCoverWeight) : 0;
      const actualFrameW = it.actualFrameWeight ? Number(it.actualFrameWeight) : 0;
      totalScaleWeight += actualCoverW + actualFrameW;
      totalCovers += Number(it.coverQty || 0);
      totalFrames += Number(it.frameQty || 0);
    }
  }
  console.log(`Daily Report Items: ${totalReportItems} (With WO: ${itemsWithWo}, Standalone: ${itemsWithoutWo})`);
  console.log(`Daily Report Total Covers: ${totalCovers}, Frames: ${totalFrames}, Total Pieces: ${totalCovers + totalFrames}`);
  console.log(`Floor Scale Weight in Reports: ${totalScaleWeight.toFixed(2)} KG`);

  // Count Trading vs Mfg in Work Orders
  let tradingCount = 0;
  let mfgCount = 0;
  const missingCapacityList = [];
  const missingSizeList = [];
  const missingTypeList = [];

  for (const wo of workOrders) {
    const p = wo.salesOrderItem?.product || wo.productionPlan?.salesOrder?.items?.[0]?.product;
    const name = p?.name || wo.salesOrderItem?.productNameSnapshot || '';
    const sku = p?.sku || '';
    const isTrading = /COVERBLOCK|WCB|PCB|HTCB|MOULDED|FRC COVER|RCC PIPE/i.test(name) || /WCB|PCB|HTCB|FRCCP/i.test(sku);
    if (isTrading) {
      tradingCount++;
    } else {
      mfgCount++;
      if (!p?.capacity) missingCapacityList.push({ id: p?.id, name, sku, cap: p?.capacity });
      if (!p?.size) missingSizeList.push({ id: p?.id, name, sku, size: p?.size });
      if (!p?.type) missingTypeList.push({ id: p?.id, name, sku, type: p?.type });
    }
  }

  console.log(`\nWork Orders breakdown: Mfg=${mfgCount}, Trading=${tradingCount}`);
  console.log(`Mfg Products with missing p.capacity in DB: ${missingCapacityList.length}`);
  console.log(`Mfg Products with missing p.size in DB: ${missingSizeList.length}`);
  console.log(`Mfg Products with missing p.type in DB: ${missingTypeList.length}`);

  // Unique names of mfg products with missing capacity
  const uniqueMissingCapNames = [...new Set(missingCapacityList.map(x => x.name))];
  console.log('\nSample Products with missing capacity in DB (First 10):');
  console.log(uniqueMissingCapNames.slice(0, 10));

  await prisma.$disconnect();
}

auditOctober().catch(console.error);
