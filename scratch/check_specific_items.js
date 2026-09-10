const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wgc750 = await prisma.product.findMany({
    where: { name: { contains: 'WGC 750X750' } },
    select: { name: true, sku: true }
  });
  console.log('WGC 750X750 in DB:', wgc750);

  const rcs1500_65 = await prisma.product.findMany({
    where: { name: { contains: 'RCS 1500X1500' } },
    select: { name: true, sku: true }
  });
  console.log('RCS 1500X1500 in DB:', rcs1500_65);

  const ongc600x720 = await prisma.product.findMany({
    where: { name: { contains: '600X720' } },
    select: { name: true, sku: true }
  });
  console.log('ONGC 600X720 in DB:', ongc600x720);
}

main().catch(console.error).finally(() => prisma.$disconnect());
