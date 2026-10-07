const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectTestMarkers() {
  console.log('=== INVESTIGATING POTENTIAL TEST-DATA MARKERS IN DISPATCH RECORDS ===\n');

  const aug1_start = new Date('2026-07-31T18:30:00.000Z');
  const aug29_end = new Date('2026-08-29T18:30:00.000Z');

  const dispatches = await prisma.dispatch.findMany({
    where: {
      dispatchedAt: {
        gte: aug1_start,
        lt: aug29_end,
      }
    },
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true,
        }
      },
      items: {
        include: {
          salesOrderItem: { include: { product: true } }
        }
      }
    },
    orderBy: { dispatchedAt: 'asc' }
  });

  console.log(`Total dispatches in period: ${dispatches.length}`);

  // Let's examine dispatch fields
  const sample1 = dispatches[0];
  console.log('\nDispatch model keys:', Object.keys(sample1));
  console.log('SalesOrder model keys:', sample1.salesOrder ? Object.keys(sample1.salesOrder) : 'none');

  // Let's inspect dispatch numbers, createdBy, notes, special instructions, order numbers
  console.log('\nAll 50 Dispatches Summary:');
  const groupedByPattern = {};

  dispatches.forEach((d, idx) => {
    const dNum = d.dispatchNo || '';
    const soNum = d.salesOrder?.orderNumber || '';
    const cust = d.salesOrder?.customer?.companyName || '';
    const date = d.dispatchedAt ? d.dispatchedAt.toISOString().slice(0, 10) : '';
    const wt = Number(d.totalWeight) || 0;
    const itemsCount = d.items?.length || 0;
    const category = d.dispatchCategory || '';
    const status = d.status || '';
    const isSubmitted = d.isSubmitted;
    const driver = d.driverName || '';
    const remarks = d.loadingRemarks || d.specialInstructions || '';

    // Classify pattern
    let pattern = 'OTHER';
    if (dNum.startsWith('DISP-2026-AUG-')) {
      pattern = 'DISP-2026-AUG-XXX (Batch Seed)';
    } else if (dNum.startsWith('DISP-2026-')) {
      pattern = 'DISP-2026-XXXX (Sequential)';
    } else {
      pattern = `CUSTOM-${dNum.slice(0, 6)}`;
    }

    if (!groupedByPattern[pattern]) groupedByPattern[pattern] = { count: 0, totalWeight: 0, dispatches: [] };
    groupedByPattern[pattern].count++;
    groupedByPattern[pattern].totalWeight += wt;
    groupedByPattern[pattern].dispatches.push({
      idx: idx + 1,
      id: d.id,
      dispatchNo: dNum,
      orderNo: soNum,
      customer: cust,
      date,
      weight: wt,
      items: itemsCount,
      category,
      driver,
      remarks,
    });
  });

  console.log('\n--- GROUPED BY DISPATCH NUMBER PATTERN ---');
  for (const [pat, data] of Object.entries(groupedByPattern)) {
    console.log(`\nPattern: "${pat}" -> Count: ${data.count}, Total Weight: ${data.totalWeight.toFixed(2)} KG`);
    console.log('Sample dispatches in this pattern:');
    data.dispatches.slice(0, 5).forEach(d => {
      console.log(`  [${d.idx}] ${d.dispatchNo} | ${d.orderNo} | ${d.date} | ${d.weight} kg | Cust: ${d.customer} | Driver: ${d.driver}`);
    });
    if (data.dispatches.length > 5) {
      console.log(`  ... and ${data.dispatches.length - 5} more`);
    }
  }

  // Let's inspect differences between DISP-2026-AUG-XXX vs others:
  // Is there any isTest, testFlag, environment, or simulated flag in Prisma schema?
  const prismaModels = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log('\nAvailable Prisma models related to test or dispatch:');
  console.log(prismaModels.filter(m => m.toLowerCase().includes('disp') || m.toLowerCase().includes('test') || m.toLowerCase().includes('audit')));

  await prisma.$disconnect();
}

inspectTestMarkers().catch(console.error);
