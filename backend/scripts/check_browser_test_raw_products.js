const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: { companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', productType: 'RAW_MATERIAL' }
  });
  console.log('25 Raw Products for Browser Test Company:', prods.map(p => ({ sku: p.sku, name: p.name, unit: p.unit, minStock: p.minimumStock })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
