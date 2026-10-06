const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding isTrading column to Product table...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isTrading" boolean NOT NULL DEFAULT false;
  `);

  console.log('Backfilling isTrading values based on existing productType and dispatchCategory...');
  const updatedCount = await prisma.$executeRawUnsafe(`
    UPDATE "Product"
    SET "isTrading" = true
    WHERE "productType" = 'TRADING'
       OR "dispatchCategory" IN ('D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CAT 2', '2');
  `);
  console.log(`Updated ${updatedCount} products to isTrading = true.`);

  const sample = await prisma.$queryRawUnsafe(`
    SELECT id, name, "productType", "dispatchCategory", "isTrading"
    FROM "Product"
    WHERE "isTrading" = true
    LIMIT 5;
  `);
  console.log('Sample trading products in DB:', sample);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
