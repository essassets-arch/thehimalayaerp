const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma5435 = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } }
  });
  const prisma5432 = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
  });

  for (const [name, prisma] of [['DB 5435 (Docker)', prisma5435], ['DB 5432 (Local Test)', prisma5432]]) {
    try {
      console.log(`=== Checking ${name} ===`);
      const products = await prisma.product.findMany({ where: { name: { contains: 'handle', mode: 'insensitive' } } });
      console.log('Products:', products.map(p => ({ id: p.id, name: p.name, sku: p.sku, productType: p.productType })));
      const rawMaterials = await prisma.rawMaterial.findMany({ where: { name: { contains: 'handle', mode: 'insensitive' } } });
      console.log('RawMaterials:', rawMaterials.map(r => ({ id: r.id, name: r.name, sku: r.sku })));
      const pos = await prisma.purchaseOrder.findMany({
        where: { poNumber: { contains: 'PO-REJ-581697' } },
        include: { items: true, grns: { include: { items: true } } }
      });
      console.log('PO PO-REJ-581697:', JSON.stringify(pos, null, 2));
      const txs = await prisma.inventoryTransaction.findMany({
        where: {
          OR: [
            { productId: { in: products.map(p => p.id) } },
            { rawMaterialId: { in: rawMaterials.map(r => r.id) } }
          ]
        }
      });
      console.log('InventoryTransactions:', txs);
      const stockHistories = await prisma.stockHistory.findMany({
        where: {
          productId: { in: [...products.map(p => p.id), ...rawMaterials.map(r => r.id)] }
        }
      });
      console.log('StockHistories:', stockHistories);
    } catch (err) {
      console.error(`Error with ${name}:`, err.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

check();
