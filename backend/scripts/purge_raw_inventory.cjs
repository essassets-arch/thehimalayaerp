require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purgeRawInventory() {
  console.log('===========================================================');
  console.log('🧹 Purging All Raw Material Data & Inventory Transactions...');
  console.log('===========================================================');

  const beforeRmCount = await prisma.rawMaterial.count();
  const beforeProdRmCount = await prisma.product.count({
    where: {
      isActive: true,
      OR: [
        { productType: 'RAW_MATERIAL' },
        { type: 'RAW_MATERIAL' },
        { category: { contains: 'Raw', mode: 'insensitive' } },
      ],
    },
  });

  console.log(`Current active records before purge:`);
  console.log(`  - RawMaterial: ${beforeRmCount}`);
  console.log(`  - Active Product RM: ${beforeProdRmCount}`);

  await prisma.$transaction(async (tx) => {
    // 1. Delete transactions referencing raw materials or raw material products
    const deletedTx = await tx.inventoryTransaction.deleteMany({
      where: {
        OR: [
          { rawMaterialId: { not: null } },
          {
            product: {
              OR: [
                { productType: 'RAW_MATERIAL' },
                { type: 'RAW_MATERIAL' },
                { category: { contains: 'Raw', mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
    });
    console.log(`  ✓ Deleted ${deletedTx.count} inventory transactions`);

    // 2. Delete stock history for raw materials
    const deletedHist = await tx.stockHistory.deleteMany({
      where: {
        product: {
          OR: [
            { productType: 'RAW_MATERIAL' },
            { type: 'RAW_MATERIAL' },
            { category: { contains: 'Raw', mode: 'insensitive' } },
          ],
        },
      },
    });
    console.log(`  ✓ Deleted ${deletedHist.count} stock history records`);

    // 3. Delete all raw materials
    const deletedRm = await tx.rawMaterial.deleteMany({});
    console.log(`  ✓ Deleted ${deletedRm.count} RawMaterial records`);

    // 4. Deactivate any remaining RAW_MATERIAL products
    const updatedProds = await tx.product.updateMany({
      where: {
        OR: [
          { productType: 'RAW_MATERIAL' },
          { type: 'RAW_MATERIAL' },
          { category: { contains: 'Raw', mode: 'insensitive' } },
        ],
      },
      data: {
        isActive: false,
      },
    });
    console.log(`  ✓ Deactivated ${updatedProds.count} RAW_MATERIAL product records`);
  });

  const afterRmCount = await prisma.rawMaterial.count();
  const afterProdRmCount = await prisma.product.count({
    where: {
      isActive: true,
      OR: [
        { productType: 'RAW_MATERIAL' },
        { type: 'RAW_MATERIAL' },
        { category: { contains: 'Raw', mode: 'insensitive' } },
      ],
    },
  });

  console.log('===========================================================');
  console.log(`After purge:`);
  console.log(`  - RawMaterial records: ${afterRmCount}`);
  console.log(`  - Active Product RM records: ${afterProdRmCount}`);
  console.log('✅ Purge completed successfully. Zero raw materials active.');
  console.log('===========================================================');
}

purgeRawInventory()
  .catch((err) => {
    console.error('❌ Purge failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
