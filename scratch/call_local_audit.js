const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Let's import PlantHeadService or invoke our audit logic
const { dispatchAnalyticsPeriod, dispatchDay, standardizeProduct, standardizeCapacity, standardizeSize, standardizeColour } = require('../backend/dist/modules/plant-head/dispatch-analytics-period');

async function runLocalAudit() {
  console.log('=== RUNNING ERP DISPATCH DATA AUDIT DIRECTLY FROM LIVE DB ===');

  const effStart = '2026-08-01';
  const effEnd = '2026-08-29';
  const { startDate, endDate, periodLabel } = dispatchAnalyticsPeriod('Custom', effStart, effEnd);

  const company = await prisma.company.findFirst();
  const companyId = company.id;
  console.log(`Company: ${company.name} (${companyId})`);
  console.log(`Period: ${effStart} to ${effEnd} (${periodLabel})`);

  const dispatchScope = { salesOrder: { customer: { companyId } }, dispatchedAt: { not: null } };
  const totalAllTime = await prisma.dispatch.count({ where: dispatchScope });

  const dispatches = await prisma.dispatch.findMany({
    where: {
      ...dispatchScope,
      dispatchedAt: { gte: startDate, lt: endDate },
    },
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true,
          items: { include: { product: true } },
        },
      },
      items: {
        include: {
          salesOrderItem: { include: { product: true } },
        },
      },
    },
    orderBy: { dispatchedAt: 'asc' },
  });

  console.log(`\nRecords found in period: ${dispatches.length} (out of ${totalAllTime} all time)`);

  let totalQty = 0;
  let totalWeight = 0;
  const clientSet = new Set();
  const datesSet = new Set();
  const customerMap = {};
  const prodMap = {};
  const capMap = {};
  const sizeMap = {};
  const colMap = {};
  const salesMap = {};
  const dailyTrends = {};

  for (const d of dispatches) {
    const dDate = dispatchDay(d.dispatchedAt);
    datesSet.add(dDate);

    const dWeight = Number(d.totalWeight) || 0;
    totalWeight += dWeight;

    const items = d.items || [];
    const dPcs = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    totalQty += dPcs;

    if (!dailyTrends[dDate]) dailyTrends[dDate] = { weight: 0, pcs: 0 };
    dailyTrends[dDate].weight += dWeight;
    dailyTrends[dDate].pcs += dPcs;

    const cName = d.salesOrder?.customer?.companyName || 'Unknown Customer';
    clientSet.add(cName);
    if (!customerMap[cName]) customerMap[cName] = { weight: 0, qty: 0 };
    customerMap[cName].weight += dWeight;
    customerMap[cName].qty += dPcs;

    const sRef = d.salesOrder?.salesExecutive?.name || 'Unassigned';
    if (!salesMap[sRef]) salesMap[sRef] = { weight: 0, qty: 0 };
    salesMap[sRef].weight += dWeight;
    salesMap[sRef].qty += dPcs;

    for (const it of items) {
      const q = Number(it.quantity) || 0;
      const weightShare = dPcs > 0 ? (dWeight * (q / dPcs)) : 0;
      const spec = it.salesOrderItem?.specifications || {};
      const pName = it.salesOrderItem?.product?.name || '';

      const prod = standardizeProduct(spec.product, pName);
      const cap = standardizeCapacity(spec.capacity || pName);
      const sz = standardizeSize(spec.size || pName);
      const col = standardizeColour(spec.colour || spec.color);

      if (!prodMap[prod]) prodMap[prod] = { qty: 0, weight: 0 };
      prodMap[prod].qty += q;
      prodMap[prod].weight += weightShare;

      capMap[cap] = (capMap[cap] || 0) + weightShare;
      sizeMap[sz] = (sizeMap[sz] || 0) + weightShare;
      colMap[col] = (colMap[col] || 0) + weightShare;
    }
  }

  const avgWeight = totalQty > 0 ? (totalWeight / totalQty) : 0;
  const sortedCust = Object.entries(customerMap).sort((a, b) => b[1].weight - a[1].weight);

  console.log('\n--- KPI RECONCILIATION TABLE ---');
  console.log('Metric | Reference | Actual ERP | Difference | Status');
  console.log(`Quantity | 2,688 PCS | ${totalQty.toLocaleString()} PCS | ${totalQty - 2688} | ${totalQty === 2688 ? '✅' : '🔍'}`);
  console.log(`Weight | 119,996.40 KG | ${totalWeight.toFixed(2)} KG | ${(totalWeight - 119996.40).toFixed(2)} | ${Math.abs(totalWeight - 119996.40) < 1 ? '✅' : '🔍'}`);
  console.log(`Avg/Piece | 44.64 KG | ${avgWeight.toFixed(2)} KG | ${(avgWeight - 44.64).toFixed(2)} | ${Math.abs(avgWeight - 44.64) < 0.1 ? '✅' : '🔍'}`);
  console.log(`Dispatch Days | 21 DAYS | ${datesSet.size} DAYS | ${datesSet.size - 21} | ${datesSet.size === 21 ? '✅' : '🔍'}`);
  console.log(`Customers | 79 CLIENTS | ${clientSet.size} CLIENTS | ${clientSet.size - 79} | ${clientSet.size === 79 ? '✅' : '🔍'}`);
  console.log(`MHC Weight | 69,210.35 KG | ${(prodMap['MHC']?.weight || 0).toFixed(2)} KG | ${((prodMap['MHC']?.weight || 0) - 69210.35).toFixed(2)} | 🔍`);
  console.log(`LD Weight | 40,842.00 KG | ${(capMap['LD'] || 0).toFixed(2)} KG | ${((capMap['LD'] || 0) - 40842.00).toFixed(2)} | 🔍`);
  console.log(`C250 Weight | 36,106.00 KG | ${(capMap['C250'] || 0).toFixed(2)} KG | ${((capMap['C250'] || 0) - 36106.00).toFixed(2)} | 🔍`);
  console.log(`Top Customer | Larsen & Toubro | ${sortedCust[0]?.[0]} (${sortedCust[0]?.[1]?.weight?.toFixed(2)} KG) | N/A | ${sortedCust[0]?.[0]?.includes('LARSEN') ? '✅' : '🔍'}`);

  console.log('\n--- TOP 5 CUSTOMERS ---');
  sortedCust.slice(0, 5).forEach((c, i) => {
    console.log(`${i + 1}. ${c[0]}: ${c[1].weight.toFixed(2)} KG (${((c[1].weight / totalWeight) * 100).toFixed(1)}%) | ${c[1].qty} pcs`);
  });

  console.log('\n--- DAILY DISPATCH TREND PEAKS ---');
  Object.keys(dailyTrends).sort().forEach(dt => {
    if (dailyTrends[dt].weight > 7000) {
      console.log(`Peak: ${dt} -> ${dailyTrends[dt].weight.toFixed(2)} KG (${dailyTrends[dt].pcs} pcs)`);
    }
  });

  await prisma.$disconnect();
}

runLocalAudit().catch(console.error);
