const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

const checkQueries = [
  '1200X900',
  '600X260',
  '450X1000',
  '1800X1200',
  '1200X600',
  '3T',
  '600X450',
  '15X15'
];

(async () => {
  for (const q of checkQueries) {
    const prods = await p.product.findMany({
      where: {
        OR: [
          { sku: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: { sku: true, name: true, category: true },
      take: 5
    });
    console.log(`Query "${q}": found ${prods.length} products:`, prods.map(x => x.name));
  }
  await p.$disconnect();
})();
