const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "PurchaseOrder_purchaseIndentId_key";`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PurchaseOrder_purchaseIndentId_idx" ON public."PurchaseOrder"("purchaseIndentId");`);
  console.log('Successfully dropped unique index and added non-unique index on PurchaseOrder.purchaseIndentId');
}

main().catch(console.error).finally(() => prisma.$disconnect());
