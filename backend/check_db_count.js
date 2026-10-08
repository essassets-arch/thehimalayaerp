const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.rawMaterial.count();
  console.log('RawMaterial count in local DB:', count);
  const prodCount = await prisma.product.count({ where: { productType: 'RAW_MATERIAL' } });
  console.log('Product RAW count in local DB:', prodCount);
  const hmCount = await prisma.product.count({ where: { sku: { startsWith: 'HM' } } });
  console.log('Product HM sku count in local DB:', hmCount);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
