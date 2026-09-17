const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: '600X900', mode: 'insensitive' } },
        { sku: { contains: '600X900', mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, sku: true, companyId: true }
  });
  console.log('Matching Products:', prods);
}

main().finally(() => prisma.$disconnect());
