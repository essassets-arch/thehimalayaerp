import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
});

async function main() {
  const prods = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'FRC', mode: 'insensitive' } },
        { name: { contains: '36', mode: 'insensitive' } },
        { sku: { contains: 'FRC', mode: 'insensitive' } },
      ],
    },
    take: 10,
  });

  console.log(`Found ${prods.length} matching products:`);
  for (const p of prods) {
    const fg = await prisma.finishedGoods.findMany({ where: { productId: p.id } });
    const totalAvail = fg.reduce((s, f) => s + Number(f.availableQuantity), 0);
    console.log(`Product: [${p.sku}] ${p.name} -> Available FG: ${totalAvail} (items: ${fg.length})`);
  }
}

main().finally(() => prisma.$disconnect());
