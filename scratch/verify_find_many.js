const { PrismaClient } = require('@prisma/client');

async function testQueries() {
  const dbs = ['himalaya_erp', 'himalaya_erp_browser_test'];
  for (const db of dbs) {
    console.log(`\nTesting queries on [${db}]...`);
    const prisma = new PrismaClient({ datasources: { db: { url: `postgresql://himalaya_erp_user:12345678@localhost:5432/${db}?schema=public` } } });
    try {
      const prods = await prisma.product.findMany({ take: 5 });
      console.log(`[${db}] product.findMany succeeded. Found:`, prods.length);

      const quotes = await prisma.quotation.findMany({
        take: 5,
        include: { items: { include: { product: true } } }
      });
      console.log(`[${db}] quotation.findMany succeeded. Found:`, quotes.length);

      const orders = await prisma.salesOrder.findMany({
        take: 5,
        include: { items: { include: { product: true } } }
      });
      console.log(`[${db}] salesOrder.findMany succeeded. Found:`, orders.length);
    } catch (err) {
      console.error(`[${db}] FAILED:`, err.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

testQueries();
