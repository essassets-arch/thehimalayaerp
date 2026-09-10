require('dotenv').config({ path: 'd:/prototype-next-main/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rmCount = await prisma.rawMaterial.count();
  const prodCount = await prisma.product.count();
  const prodRmCount = await prisma.product.count({ where: { productType: 'RAW_MATERIAL' } });
  const txCount = await prisma.inventoryTransaction.count();
  console.log('Database Counts:', { rmCount, prodCount, prodRmCount, txCount });

  const rmMatA = await prisma.rawMaterial.findFirst({ where: { name: { contains: 'Material A', mode: 'insensitive' } } });
  const prodMatA = await prisma.product.findFirst({ where: { name: { contains: 'Material A', mode: 'insensitive' } } });
  console.log('Material A lookup:', { rmMatA, prodMatA });

  // Sample Products with RAW_MATERIAL
  const sampleProdRms = await prisma.product.findMany({ where: { productType: 'RAW_MATERIAL' }, take: 5 });
  console.log('Sample Product (RAW_MATERIAL):', sampleProdRms.map(p => ({ id: p.id, name: p.name, sku: p.sku })));

  // Sample POs
  const pos = await prisma.purchaseOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } }
  });
  console.log('Recent POs:', JSON.stringify(pos.map(po => ({
    id: po.id,
    poNumber: po.poNumber,
    status: po.status,
    items: po.items.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.product?.name,
      productType: i.product?.productType,
      materialName: i.materialName,
      materialCode: i.materialCode,
      quantity: i.quantity,
      receivedQuantity: i.receivedQuantity
    }))
  })), null, 2));

  // Sample InventoryTransactions
  const recentTxs = await prisma.inventoryTransaction.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true, rawMaterial: true }
  });
  console.log('Recent InventoryTransactions:', JSON.stringify(recentTxs.map(t => ({
    id: t.id,
    type: t.type,
    quantity: t.quantity,
    productId: t.productId,
    rawMaterialId: t.rawMaterialId,
    productName: t.product?.name,
    rawMaterialName: t.rawMaterial?.name,
  })), null, 2));
  // Check txs for Material A
  const matATxs = await prisma.inventoryTransaction.findMany({
    where: {
      OR: [
        { productId: 'be331853-875d-4fb0-99a5-191c7c3a8f1c' },
        { product: { sku: 'MAT-A' } },
        { rawMaterial: { sku: 'MAT-A' } },
        { referenceId: { contains: 'PO-DRAFT-2026-000010' } }
      ]
    }
  });
  console.log('Material A Txs:', matATxs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
