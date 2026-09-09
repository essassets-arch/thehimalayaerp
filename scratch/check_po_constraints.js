const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const indexes = await prisma.$queryRawUnsafe(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'PurchaseOrder';
  `);
  console.log(JSON.stringify(indexes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
