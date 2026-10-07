const { PrismaClient } = require('@prisma/client');

async function check(dbName) {
  const url = `postgresql://himalaya_erp_user:12345678@localhost:5432/${dbName}?schema=public`;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const dbs = await prisma.$queryRawUnsafe('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Available databases:', dbs.map(d => d.datname));

    for (const d of dbs) {
      const p = new PrismaClient({ datasources: { db: { url: `postgresql://himalaya_erp_user:12345678@localhost:5432/${d.datname}?schema=public` } } });
      try {
        const col = await p.$queryRawUnsafe(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'Product' AND column_name = 'isTrading';
        `);
        console.log(`Database [${d.datname}] Product.isTrading:`, col.length > 0 ? 'EXISTS' : 'MISSING');
        if (col.length === 0) {
          console.log(`Adding isTrading to [${d.datname}]...`);
          await p.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isTrading" boolean NOT NULL DEFAULT false;`);
          await p.$executeRawUnsafe(`
            UPDATE "Product"
            SET "isTrading" = true
            WHERE "productType" = 'TRADING'
               OR "dispatchCategory" IN ('D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CAT 2', '2');
          `);
          console.log(`Added isTrading to [${d.datname}].`);
        }
      } catch (e) {
        console.log(`Database [${d.datname}] check error:`, e.message);
      } finally {
        await p.$disconnect();
      }
    }
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check('postgres');
