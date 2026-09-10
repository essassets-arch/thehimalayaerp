const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  console.log('Company:', company ? { id: company.id, name: company.name } : null);

  const frpProducts = await prisma.product.findMany({
    where: { name: { contains: 'FRP', mode: 'insensitive' } },
    take: 15,
  });
  console.log('Found FRP products sample count:', frpProducts.length);
  if (frpProducts.length > 0) {
    console.log('Sample FRP product:', JSON.stringify(frpProducts[0], null, 2));
    console.log('All sample names & skus:', frpProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      productType: p.productType,
      brand: p.brand,
      unit: p.unit,
      dispatchCategory: p.dispatchCategory,
      hsnCode: p.hsnCode,
      gstRate: p.gstRate
    })));
  }

  // Also check all distinct categories
  const categories = await prisma.product.findMany({
    select: { category: true, productType: true },
    distinct: ['category', 'productType'],
  });
  console.log('Categories in DB:', categories);
}

main().catch(console.error).finally(() => prisma.$disconnect());
