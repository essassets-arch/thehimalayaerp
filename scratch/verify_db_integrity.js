const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Verifying DB Products Integrity ---');
  const d1Count = await prisma.product.count({
    where: {
      OR: [
        { dispatchCategory: 'D1' },
        { dispatchCategory: 'DISPATCH_1' }
      ]
    }
  });

  const d2Count = await prisma.product.count({
    where: {
      OR: [
        { dispatchCategory: 'D2' },
        { dispatchCategory: 'DISPATCH_2' },
        { isTrading: true }
      ]
    }
  });

  console.log(`D1 / Manufacturing products in DB: ${d1Count}`);
  console.log(`D2 / Trading products in DB: ${d2Count}`);

  // Test creating a test product with FRC name but explicit D1 category
  const testSku = 'TEST-FRC-D1-' + Date.now();
  const created = await prisma.product.create({
    data: {
      publicId: 'PRD-' + Date.now(),
      companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
      name: 'TEST FRC COVER SLAB',
      sku: testSku,
      category: 'FRC COVER',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      isTrading: false,
      unit: 'PCS',
      unitPrice: 1500
    }
  });
  console.log('Created test product:', {
    id: created.id,
    sku: created.sku,
    productType: created.productType,
    dispatchCategory: created.dispatchCategory,
    isTrading: created.isTrading
  });

  // Clean up test product
  await prisma.product.delete({ where: { id: created.id } });
  console.log('Cleaned up test product.');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
