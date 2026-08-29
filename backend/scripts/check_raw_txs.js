const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.inventoryTransaction.findMany({
    where: { rawMaterialId: { not: null } },
    include: { rawMaterial: true }
  });
  console.log('Total rawMaterial transactions:', txs.length);

  const productTxs = await prisma.inventoryTransaction.findMany({
    where: { productId: { not: null } },
    include: { product: true }
  });
  const rawProdTxs = productTxs.filter(t => t.product?.productType === 'RAW_MATERIAL');
  console.log('Total rawMaterial product transactions:', rawProdTxs.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
