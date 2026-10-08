const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const prods = await prisma.product.findMany({
    where: { productType: 'RAW_MATERIAL' },
    orderBy: { sku: 'asc' },
    select: { sku: true, name: true, unit: true, category: true, minimumStock: true, unitPrice: true }
  });
  console.log('Count:', prods.length);
  console.log(prods.map((p, idx) => `${idx + 1}. [${p.sku}] ${p.name} (${p.unit})`).join('\n'));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
