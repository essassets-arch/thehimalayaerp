const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const prods = await prisma.product.findMany({
    take: 5,
    select: { id: true, name: true, sku: true, coversPerSet: true, framesPerSet: true }
  });
  console.log('Sample Products:', prods);

  const diffRecipes = await prisma.product.findMany({
    where: {
      OR: [
        { coversPerSet: { gt: 1 } },
        { framesPerSet: { gt: 1 } }
      ]
    },
    select: { id: true, name: true, sku: true, coversPerSet: true, framesPerSet: true }
  });
  console.log('Products with >1 recipe:', diffRecipes.length, diffRecipes.slice(0, 5));

  await prisma.$disconnect();
}

run().catch(console.error);
