const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const cats = await prisma.product.findMany({
    select: { category: true, type: true },
    distinct: ['category', 'type']
  });
  console.log('Distinct Categories & Types:', JSON.stringify(cats, null, 2));

  // Check work orders products
  const wos = await prisma.workOrder.findMany({
    take: 50,
    include: {
      salesOrderItem: { include: { product: true } }
    }
  });
  console.log('Sample WO Products:');
  const seen = new Set();
  for (const w of wos) {
    const p = w.salesOrderItem?.product;
    const key = `${p?.category || 'NULL'} | ${p?.type || 'NULL'} | ${p?.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(`- Category: "${p?.category}", Type: "${p?.type}", Size: "${p?.size}", Cap: "${p?.capacity}", Name: "${p?.name}"`);
    }
  }

  // Count work orders by month
  const allWos = await prisma.workOrder.findMany({
    select: { createdAt: true, completedAt: true }
  });
  const counts = {};
  for (const w of allWos) {
    const ym = w.completedAt ? new Date(w.completedAt).toISOString().slice(0, 7) : new Date(w.createdAt).toISOString().slice(0, 7);
    counts[ym] = (counts[ym] || 0) + 1;
  }
  console.log('Work Order Counts by Month:', counts);

  await prisma.$disconnect();
}
run();
