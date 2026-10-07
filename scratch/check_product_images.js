const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const countWithImage = await prisma.product.count({
    where: { imageUrl: { not: null } }
  });
  console.log('Total products with imageUrl:', countWithImage);

  if (countWithImage > 0) {
    const samples = await prisma.product.findMany({
      where: { imageUrl: { not: null } },
      select: { id: true, name: true, imageUrl: true },
      take: 5
    });
    console.log('Samples:', samples);
  } else {
    console.log('No products currently have imageUrl configured in Product Master.');
  }

  const sampleProducts = await prisma.product.findMany({
    select: { id: true, name: true, type: true, size: true, capacity: true },
    take: 5
  });
  console.log('Sample products:', sampleProducts);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
