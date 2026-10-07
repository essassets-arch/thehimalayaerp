const { PrismaClient } = require('@prisma/client');

async function syncCols() {
  const pMain = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });

  try {
    console.log('Adding missing columns to Product in himalaya_erp...');
    await pMain.$executeRawUnsafe(`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "componentType" text NOT NULL DEFAULT 'STANDARD',
      ADD COLUMN IF NOT EXISTS "coversPerSet" integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "framesPerSet" integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "setRatio" integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "isTrading" boolean NOT NULL DEFAULT false;
    `);

    console.log('Columns added. Now testing queries...');
    const prods = await pMain.product.findMany({ take: 5 });
    console.log('product.findMany succeeded! Rows:', prods.length);

    const quotes = await pMain.quotation.findMany({
      take: 5,
      include: { items: { include: { product: true } } }
    });
    console.log('quotation.findMany succeeded! Rows:', quotes.length);

    const orders = await pMain.salesOrder.findMany({
      take: 5,
      include: { items: { include: { product: true } } }
    });
    console.log('salesOrder.findMany succeeded! Rows:', orders.length);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pMain.$disconnect();
  }
}

syncCols();
