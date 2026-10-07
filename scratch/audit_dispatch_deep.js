const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepAudit() {
  console.log('=== DEEP AUDIT OF DISPATCHES IN AUG 2026 ===\n');

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

  console.log(`Total dispatches in range: ${dispatches.length}`);

  // Check companies
  const byCompany = {};
  for (const d of dispatches) {
    const compId = d.salesOrder?.customer?.companyId || d.companyId || 'UNKNOWN';
    byCompany[compId] = (byCompany[compId] || 0) + 1;
  }
  console.log('Dispatches by customer.companyId:', byCompany);

  // Check items, products, specs
  let itemsCount = 0;
  let productsFound = new Set();
  let specsFound = [];
  let capacitiesFound = new Set();
  let sizesFound = new Set();
  let coloursFound = new Set();

  for (const d of dispatches) {
    for (const it of (d.items || [])) {
      itemsCount++;
      const p = it.salesOrderItem?.product;
      if (p) productsFound.add(p.name);
      const spec = it.salesOrderItem?.specifications;
      if (spec) specsFound.push(spec);
    }
  }

  console.log(`Total items across dispatches: ${itemsCount}`);
  console.log('Products found on items:', Array.from(productsFound));
  console.log('Sample item specifications (first 5):', specsFound.slice(0, 5));

  // Check if there are dispatches created by seed or tests
  console.log('\nSample Dispatches details (first 10):');
  for (const d of dispatches.slice(0, 10)) {
    console.log({
      id: d.id,
      dispatchNo: d.dispatchNo,
      dispatchedAt: d.dispatchedAt,
      totalWeight: d.totalWeight,
      customer: d.salesOrder?.customer?.companyName,
      customerCompanyId: d.salesOrder?.customer?.companyId,
      salesExecutive: d.salesOrder?.salesExecutive?.name,
      items: d.items?.map(it => ({
        qty: it.quantity,
        product: it.salesOrderItem?.product?.name,
        specs: it.salesOrderItem?.specifications
      }))
    });
  }

  // Let's also search codebase for 119996 or 2688 or 15042 or 69210 to see if there was a seed script or data migration!
  await prisma.$disconnect();
}

deepAudit().catch(console.error);
