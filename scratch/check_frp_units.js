const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.product.groupBy({
    by: ['unit'],
    where: { category: { in: ['FRP COVERS', 'FRP COVER'] } },
    _count: true
  });
  console.log('Units for FRP products:', units);
}

main().catch(console.error).finally(() => prisma.$disconnect());
