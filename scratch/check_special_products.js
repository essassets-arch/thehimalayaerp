const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
(async () => {
  const prods = await p.product.findMany({
    where: {
      OR: [
        { sku: { contains: 'WGC-750X750' } },
        { name: { contains: 'WGC 750X750' } },
        { name: { contains: 'WGC' }, size: { contains: '750' } }
      ]
    },
    select: { id: true, sku: true, name: true, size: true, capacity: true }
  });
  console.log('WGC 750 products:', prods);
  await p.$disconnect();
})();
