const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.rawMaterial.deleteMany({});
  const count = await prisma.rawMaterial.count();
  console.log('RawMaterial count in DB after wipe:', count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
