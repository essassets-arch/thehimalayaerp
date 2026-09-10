const { PrismaClient } = require('@prisma/client');

async function check(port, url) {
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    const po = await p.purchaseOrder.findFirst({
      where: { OR: [{ poNumber: 'PO-REJ-581697' }, { publicId: 'PO-REJ-581697' }] },
      include: {
        items: { include: { product: true } },
        grns: { include: { items: true } },
        supplier: true
      }
    });
    console.log(`\n=== Port ${port} ===`);
    if (!po) {
      console.log('PO-REJ-581697 NOT FOUND');
      return;
    }
    console.log('PO:', {
      id: po.id,
      poNumber: po.poNumber,
      status: po.status,
      supplier: po.supplier?.name,
      items: po.items.map(i => ({
        id: i.id,
        productId: i.productId,
        productName: i.product?.name,
        qty: Number(i.quantity),
        recQty: Number(i.receivedQuantity),
        accQty: Number(i.acceptedQuantity),
      })),
      grnsCount: po.grns.length
    });

    // Also check raw materials and inventory transactions for the product
    if (po.items[0]) {
      const prodId = po.items[0].productId;
      const prodName = po.items[0].product?.name;
      console.log(`Looking for Product ${prodId} / "${prodName}" in RawMaterial and InventoryTransaction...`);

      const rawMats = await p.rawMaterial.findMany({
        where: {
          OR: [
            { id: prodId },
            { name: { contains: prodName, mode: 'insensitive' } },
            { sku: { contains: prodName, mode: 'insensitive' } }
          ]
        }
      });
      console.log('Matching RawMaterials:', rawMats.map(r => ({ id: r.id, name: r.name, sku: r.sku, stock: Number(r.currentStock || r.stock || 0) })));

      const prod = await p.product.findUnique({ where: { id: prodId } });
      console.log('Product in DB:', prod ? { id: prod.id, name: prod.name, stock: prod.currentStock } : null);

      const txs = await p.inventoryTransaction.findMany({
        where: {
          OR: [
            { productId: prodId },
            { rawMaterialId: prodId }
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      console.log(`InventoryTransactions (${txs.length}):`, txs.map(t => ({ id: t.id, type: t.type, quantity: Number(t.quantity), reason: t.reason })));
    }
  } catch (e) {
    console.log('Port ' + port + ' error:', e.message);
  } finally {
    await p.$disconnect();
  }
}

async function run() {
  await check(5435, 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await check(5432, 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

run();
