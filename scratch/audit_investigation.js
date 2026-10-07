const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITING DATABASE STRUCTURE & VALUES ---');

  // 1. Check Work Orders count by month
  const allWOs = await prisma.workOrder.findMany({
    include: {
      salesOrderItem: {
        include: {
          product: true
        }
      },
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              items: {
                include: { product: true }
              },
              customer: true,
              salesExecutive: true
            }
          }
        }
      }
    }
  });

  console.log('Total Work Orders in DB:', allWOs.length);

  const monthsMap = {};
  for (const wo of allWOs) {
    const d = wo.completedAt || wo.createdAt;
    const istDate = new Date(d.getTime() + (5.5 * 3600 * 1000));
    const ym = istDate.toISOString().slice(0, 7);
    if (!monthsMap[ym]) monthsMap[ym] = { count: 0, statuses: {}, totalQty: 0 };
    monthsMap[ym].count++;
    monthsMap[ym].totalQty += (wo.quantity || 0);
    const st = wo.status || 'UNKNOWN';
    monthsMap[ym].statuses[st] = (monthsMap[ym].statuses[st] || 0) + 1;
  }

  console.log('Work Orders by Month (IST):', JSON.stringify(monthsMap, null, 2));

  // 2. Examine August 2026 Work Orders in detail
  const augWOs = allWOs.filter(wo => {
    const d = wo.completedAt || wo.createdAt;
    const istDate = new Date(d.getTime() + (5.5 * 3600 * 1000));
    return istDate.toISOString().slice(0, 7) === '2026-08';
  });

  console.log(`\n--- AUGUST 2026 WORK ORDERS (${augWOs.length}) ---`);
  let augTotalWeight = 0;
  let augTotalCovers = 0;
  let augTotalFrames = 0;
  let augTotalPieces = 0;

  for (const wo of augWOs) {
    const p = wo.salesOrderItem?.product || wo.productionPlan?.salesOrder?.items?.[0]?.product;
    const name = p?.name || wo.salesOrderItem?.productNameSnapshot || 'Unknown';
    const qty = wo.quantity || 0;
    const coversPerSet = p?.coversPerSet || 1;
    const framesPerSet = p?.framesPerSet || 1;
    const cuw = Number(p?.coverUnitWeight || 0);
    const fuw = Number(p?.frameUnitWeight || 0);
    const covers = qty * coversPerSet;
    const frames = qty * framesPerSet;
    const pieces = covers + frames;
    const wt = (covers * cuw) + (frames * fuw);
    augTotalWeight += wt;
    augTotalCovers += covers;
    augTotalFrames += frames;
    augTotalPieces += pieces;
    console.log(`WO: ${wo.workOrderNumber} | Status: ${wo.status} | Qty: ${qty} | Product: ${name.slice(0, 35)} | Covers: ${covers} | Frames: ${frames} | Wt: ${wt} KG | Created: ${wo.createdAt.toISOString()}`);
  }
  console.log(`August Totals -> WOs: ${augWOs.length}, Weight: ${augTotalWeight} KG, Covers: ${augTotalCovers}, Frames: ${augTotalFrames}, Pieces: ${augTotalPieces}`);

  // 3. Examine September 2026 Work Orders
  const sepWOs = allWOs.filter(wo => {
    const d = wo.completedAt || wo.createdAt;
    const istDate = new Date(d.getTime() + (5.5 * 3600 * 1000));
    return istDate.toISOString().slice(0, 7) === '2026-09';
  });
  console.log(`\n--- SEPTEMBER 2026 WORK ORDERS (${sepWOs.length}) ---`);
  let sepTotalWeight = 0;
  let sepTotalCovers = 0;
  let sepTotalFrames = 0;
  let sepTotalPieces = 0;
  for (const wo of sepWOs) {
    const p = wo.salesOrderItem?.product || wo.productionPlan?.salesOrder?.items?.[0]?.product;
    const qty = wo.quantity || 0;
    const coversPerSet = p?.coversPerSet || 1;
    const framesPerSet = p?.framesPerSet || 1;
    const cuw = Number(p?.coverUnitWeight || 0);
    const fuw = Number(p?.frameUnitWeight || 0);
    const covers = qty * coversPerSet;
    const frames = qty * framesPerSet;
    const pieces = covers + frames;
    const wt = (covers * cuw) + (frames * fuw);
    sepTotalWeight += wt;
    sepTotalCovers += covers;
    sepTotalFrames += frames;
    sepTotalPieces += pieces;
  }
  console.log(`September Totals -> WOs: ${sepWOs.length}, Weight: ${sepTotalWeight} KG, Covers: ${sepTotalCovers}, Frames: ${sepTotalFrames}, Pieces: ${sepTotalPieces}`);

  // 4. Check telemetry / machine tables
  console.log('\n--- TELEMETRY / MACHINE TABLES ---');
  const machines = await prisma.machine.findMany();
  console.log('Machines count:', machines.length);
  if (machines.length > 0) {
    console.log('Machines sample:', machines.slice(0, 3).map(m => ({ id: m.id, name: m.machineName, code: m.machineId, status: m.status })));
  }

  // Check models related to production floor
  for (const m of ['pDRI', 'downtimeLog', 'shift', 'operator', 'workCenter', 'productionEvent', 'telemetry', 'dailyReportItem']) {
    if (prisma[m]) {
      const count = await prisma[m].count().catch(() => -1);
      console.log(`Model ${m} count:`, count);
    }
  }

  // Check WorkOrder statuses in DB
  const woStatuses = await prisma.workOrder.groupBy({
    by: ['status'],
    _count: true
  });
  console.log('Work Order Statuses in DB:', woStatuses);
}

main().catch(console.error).finally(() => prisma.$disconnect());
