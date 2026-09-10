const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'WGC' } },
        { name: { contains: 'MHC' } },
        { name: { contains: 'ONGC' } },
        { name: { contains: 'RCS' } },
      ]
    },
    take: 20
  });

  console.log(`Found ${products.length} sample products with WGC/MHC/ONGC/RCS:`);
  products.forEach(p => {
    console.log({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      productType: p.productType,
      brand: p.brand,
      unit: p.unit,
      dispatchCategory: p.dispatchCategory,
      size: p.size,
      type: p.type,
      capacity: p.capacity
    });
  });

  const totalCount = await prisma.product.count();
  console.log('Total products in database:', totalCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
