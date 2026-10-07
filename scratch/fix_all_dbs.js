const { PrismaClient } = require('@prisma/client');

async function fixAll() {
  const dbs = ['himalaya_erp', 'himalaya_erp_dev', 'himalaya_erp_test', 'himalaya_erp_browser_test', 'prototype_next_browser_test'];
  for (const db of dbs) {
    const p = new PrismaClient({ datasources: { db: { url: `postgresql://himalaya_erp_user:12345678@localhost:5432/${db}?schema=public` } } });
    try {
      console.log(`Checking [${db}]...`);
      // 1. Add column if not exists
      await p.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isTrading" boolean NOT NULL DEFAULT false;`);
      
      // 2. Check if productType or product_type exists
      const cols = await p.$queryRawUnsafe(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'Product';
      `);
      const colNames = cols.map(c => c.column_name);
      console.log(`[${db}] columns count:`, colNames.length);

      const hasProductType = colNames.includes('productType');
      const hasProductTypeSnake = colNames.includes('product_type');
      const hasDispatchCat = colNames.includes('dispatchCategory');
      const hasDispatchCatSnake = colNames.includes('dispatch_category');

      let updateSql = '';
      if (hasProductType && hasDispatchCat) {
        updateSql = `
          UPDATE "Product"
          SET "isTrading" = true
          WHERE "productType" = 'TRADING'
             OR "dispatchCategory" IN ('D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CAT 2', '2');
        `;
      } else if (hasProductTypeSnake && hasDispatchCatSnake) {
        updateSql = `
          UPDATE "Product"
          SET "isTrading" = true
          WHERE "product_type" = 'TRADING'
             OR "dispatch_category" IN ('D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CAT 2', '2');
        `;
      } else if (hasDispatchCat) {
        updateSql = `
          UPDATE "Product"
          SET "isTrading" = true
          WHERE "dispatchCategory" IN ('D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CAT 2', '2');
        `;
      }

      if (updateSql) {
        const count = await p.$executeRawUnsafe(updateSql);
        console.log(`[${db}] updated ${count} products to isTrading = true.`);
      }

      const total = await p.$queryRawUnsafe(`SELECT count(*)::int as cnt FROM "Product";`);
      const trading = await p.$queryRawUnsafe(`SELECT count(*)::int as cnt FROM "Product" WHERE "isTrading" = true;`);
      console.log(`[${db}] Total products: ${total[0].cnt}, isTrading=true: ${trading[0].cnt}`);
    } catch (e) {
      console.error(`[${db}] Error:`, e.message);
    } finally {
      await p.$disconnect();
    }
  }
}

fixAll();
