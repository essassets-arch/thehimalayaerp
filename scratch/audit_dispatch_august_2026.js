const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAudit() {
  console.log('=== STARTING DISPATCH DATA AUDIT ===\n');

  // 1. Companies
  const companies = await prisma.company.findMany();
  console.log('Companies found:', companies.map(c => ({ id: c.id, name: c.name })));
  const defaultCompanyId = companies[0]?.id;

  // Check all dispatches in DB
  const totalDispatchesAllTime = await prisma.dispatch.count();
  console.log(`Total dispatches in database (all time): ${totalDispatchesAllTime}`);

  // Dispatches with dates
  const dispatchesSample = await prisma.dispatch.findMany({
    select: {
      id: true,
      dispatchNo: true,
      dispatchedAt: true,
      createdAt: true,
      totalWeight: true,
      status: true
    },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Sample dispatches:', dispatchesSample);

  // Date range for August 1 - 29, 2026
  // India Time (IST) is UTC + 5:30.
  // 2026-08-01 00:00:00 IST is 2026-07-31T18:30:00.000Z
  // 2026-08-29 23:59:59.999 IST is 2026-08-29T18:29:59.999Z (or up to 2026-08-30T00:00:00 IST = 2026-08-29T18:30:00.000Z)
  const aug1_start = new Date('2026-07-31T18:30:00.000Z');
  const aug29_end = new Date('2026-08-29T18:30:00.000Z'); // up to end of Aug 29
  const aug31_end = new Date('2026-08-31T18:30:00.000Z'); // full August

  console.log(`\nQuerying August 1 - August 29, 2026 (${aug1_start.toISOString()} to ${aug29_end.toISOString()})...`);
  
  const dispatchesAug29 = await prisma.dispatch.findMany({
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
          items: { include: { product: true } }
        }
      },
      items: {
        include: {
          salesOrderItem: { include: { product: true } }
        }
      }
    }
  });

  console.log(`Dispatches found in Aug 1 - Aug 29: ${dispatchesAug29.length}`);

  // Also check full August
  const dispatchesFullAug = await prisma.dispatch.findMany({
    where: {
      dispatchedAt: {
        gte: aug1_start,
        lt: aug31_end,
      }
    }
  });
  console.log(`Dispatches found in full August (Aug 1 - 31): ${dispatchesFullAug.length}`);

  // Also check dispatches across the entire year 2026
  const dispatches2026 = await prisma.dispatch.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log('Dispatch counts by status:', dispatches2026);

  // If dispatches found in Aug 1 - 29, analyze them!
  const targetDispatches = dispatchesAug29.length > 0 ? dispatchesAug29 : await prisma.dispatch.findMany({
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true,
          items: { include: { product: true } }
        }
      },
      items: {
        include: {
          salesOrderItem: { include: { product: true } }
        }
      }
    },
    take: 50
  });

  console.log(`\nAnalyzing ${dispatchesAug29.length} dispatches in Aug 1 - 29...`);

  let totalQty = 0;
  let totalWeight = 0;
  const customers = new Map();
  const dates = new Set();
  const products = new Map();
  const capacities = new Map();
  const sizes = new Map();
  const colours = new Map();
  const salesRefs = new Map();

  for (const d of dispatchesAug29) {
    const dWeight = Number(d.totalWeight) || 0;
    totalWeight += dWeight;

    const dDateStr = d.dispatchedAt ? d.dispatchedAt.toISOString().slice(0, 10) : 'NO_DATE';
    dates.add(dDateStr);

    const cName = d.salesOrder?.customer?.companyName || 'UNKNOWN_CUSTOMER';
    customers.set(cName, (customers.get(cName) || 0) + dWeight);

    const sRef = d.salesOrder?.salesExecutive?.name || 'UNKNOWN_SALES_REF';
    salesRefs.set(sRef, {
      weight: (salesRefs.get(sRef)?.weight || 0) + dWeight,
      qty: (salesRefs.get(sRef)?.qty || 0) + (d.items?.reduce((s, it) => s + (Number(it.quantity) || 0), 0) || 0)
    });

    let dispatchItemsQty = 0;
    for (const it of (d.items || [])) {
      const q = Number(it.quantity) || 0;
      dispatchItemsQty += q;
      totalQty += q;
    }
  }

  console.log('\n--- AUDIT SUMMARY FOR AUG 1 - 29, 2026 ---');
  console.log(`Total Weight: ${totalWeight} KG (Reference: 119,996.40 KG)`);
  console.log(`Total Quantity: ${totalQty} PCS (Reference: 2,688 PCS)`);
  console.log(`Avg Weight/Pc: ${totalQty > 0 ? (totalWeight / totalQty).toFixed(2) : 0} KG (Reference: 44.64 KG)`);
  console.log(`Unique Clients: ${customers.size} (Reference: 79 Clients)`);
  console.log(`Dispatch Days: ${dates.size} (Reference: 21 Days)`);

  console.log('\nTop 5 Customers by Weight:');
  const sortedCust = Array.from(customers.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [cust, w] of sortedCust) {
    console.log(`  ${cust}: ${w.toFixed(2)} KG (${((w / (totalWeight || 1)) * 100).toFixed(1)}%)`);
  }

  console.log('\nSales References:');
  for (const [ref, data] of salesRefs.entries()) {
    console.log(`  ${ref}: ${data.weight.toFixed(2)} KG, ${data.qty} PCS`);
  }

  // Also check date distribution
  console.log('\nDispatch Dates:');
  const sortedDates = Array.from(dates).sort();
  for (const dt of sortedDates) {
    const dayDispatches = dispatchesAug29.filter(d => d.dispatchedAt?.toISOString().slice(0, 10) === dt);
    const dayWeight = dayDispatches.reduce((s, d) => s + (Number(d.totalWeight) || 0), 0);
    console.log(`  ${dt}: ${dayDispatches.length} dispatches, ${dayWeight.toFixed(2)} KG`);
  }

  await prisma.$disconnect();
}

runAudit().catch(err => {
  console.error('Error running audit:', err);
  process.exit(1);
});
