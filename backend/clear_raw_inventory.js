const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.rawMaterial.deleteMany({});
  try { await prisma.materialRequestItem.deleteMany({}); } catch (e) {}
  try { await prisma.materialRequest.deleteMany({}); } catch (e) {}
  try {
    await prisma.product.deleteMany({
      where: {
        OR: [
          { productType: 'RAW_MATERIAL' },
          { category: { equals: 'Raw Material', mode: 'insensitive' } },
          { category: { equals: 'Raw Material Yard', mode: 'insensitive' } }
        ]
      }
    });
  } catch (e) {
    console.log('Product clean warning:', e.message);
  }
  console.log('Successfully cleared raw inventory from database.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
