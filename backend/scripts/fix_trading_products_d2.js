const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== FIXING TRADING PRODUCTS IN DATABASE ===');

  // 1. Update all products in TRADING categories to productType = 'TRADING' and dispatchCategory = 'D2'
  const res1 = await prisma.product.updateMany({
    where: {
      OR: [
        { productType: 'TRADING' },
        { category: { in: ['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS'] } },
        { sku: { startsWith: 'WCB' } },
        { sku: { startsWith: 'PCB' } },
        { sku: { startsWith: 'HTCB' } },
        { sku: { startsWith: 'DTCB' } },
        { sku: { startsWith: 'MCB' } },
        { sku: { startsWith: 'BTCB' } },
        { sku: { startsWith: 'FRCCP' } },
        { sku: { startsWith: 'FRCT' } },
        { sku: { startsWith: 'FRCSQRC' } },
        { name: { contains: 'COVERBLOCK', mode: 'insensitive' } },
        { name: { contains: 'COVER BLOCK', mode: 'insensitive' } },
        { name: { contains: 'FRC COVER', mode: 'insensitive' } },
        { name: { contains: 'RCC PIPE', mode: 'insensitive' } },
      ],
      AND: [
        {
          NOT: {
            OR: [
              { category: 'FRP COVERS' },
              { category: 'FRP GRATINGS' },
              { category: 'Hardware' },
              { category: 'Electric' },
              { category: 'Raw Material' },
              { name: { contains: 'FRP MOULDED', mode: 'insensitive' } },
              { name: { contains: 'FRP GRATINGS', mode: 'insensitive' } },
              { name: { contains: 'FRP GRATING', mode: 'insensitive' } },
            ],
          },
        },
      ],
    },
    data: {
      productType: 'TRADING',
      dispatchCategory: 'D2',
    },
  });

  console.log(`Updated ${res1.count} products to TRADING / D2.`);

  // 2. Ensure FRP GRATINGS / FRP COVERS are MANUFACTURING / D1
  const res2 = await prisma.product.updateMany({
    where: {
      OR: [
        { category: 'FRP COVERS' },
        { category: 'FRP GRATINGS' },
        { category: 'Finished Goods' },
        { name: { contains: 'FRP MOULDED', mode: 'insensitive' } },
        { name: { contains: 'FRP GRATINGS', mode: 'insensitive' } },
        { name: { contains: 'FRP GRATING', mode: 'insensitive' } },
      ],
    },
    data: {
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
    },
  });

  console.log(`Updated ${res2.count} products to MANUFACTURING / D1.`);

  // 3. Print summary of product counts
  const breakdown = await prisma.product.groupBy({
    by: ['category', 'productType', 'dispatchCategory'],
    _count: true,
  });

  console.log('\n--- Product Distribution Post-Update ---');
  console.table(breakdown);
}

main()
  .catch((err) => {
    console.error('Error fixing trading products:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
