const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const prods = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'WGC', mode: 'insensitive' } },
        { sku: { contains: 'WGC', mode: 'insensitive' } }
      ]
    }
  });
  console.log(`Found ${prods.length} WGC products:`);
  prods.forEach(p => console.log(`${p.id} | ${p.name} | SKU: ${p.sku} | Category: ${p.category} | SubCategory: ${p.subCategory || ''}`));
  await prisma.$disconnect();
}

run().catch(console.error);
