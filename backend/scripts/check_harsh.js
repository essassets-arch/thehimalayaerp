const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allProducts = await prisma.product.findMany({
    take: 10,
    select: { id: true, name: true, sku: true, category: true, productType: true, isActive: true }
  });
  console.log('Sample Products in DB:', allProducts);

  const harshProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'harsh', mode: 'insensitive' } },
        { sku: { contains: 'harsh', mode: 'insensitive' } },
        { category: { contains: 'harsh', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Products matching harsh:', harshProducts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
