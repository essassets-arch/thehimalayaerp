const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const duplicates = await prisma.$queryRawUnsafe(`
    SELECT "purchaseIndentId", COUNT(*)
    FROM "PurchaseOrder"
    WHERE "purchaseIndentId" IS NOT NULL
    GROUP BY "purchaseIndentId"
    HAVING COUNT(*) > 1
  `);
  console.log('Duplicate PO purchaseIndentId:', duplicates);
  await prisma.$disconnect();
}

run().catch(console.error);
