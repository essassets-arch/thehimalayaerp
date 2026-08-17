const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { contains: '300X300', mode: 'insensitive' } },
        { name: { contains: '300X300', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Matching Products in DB:', products.map(p => ({ id: p.id, sku: p.sku, name: p.name })));
}

run().finally(() => prisma.$disconnect());
