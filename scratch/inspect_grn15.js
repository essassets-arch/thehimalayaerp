const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  }
});

async function run() {
  const grn = await prisma.goodsReceiptNote.findUnique({
    where: { grnNumber: 'GRN-2026-000015' },
    include: { items: true, purchaseOrder: true }
  });
  console.log('GRN 15:', JSON.stringify(grn, null, 2));

  if (grn) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: grn.purchaseOrderId },
      include: {
        items: {
          include: { product: true }
        },
        purchaseIndent: {
          include: { items: { include: { product: true } } }
        },
        supplier: true
      }
    });
    console.log('PO:', JSON.stringify(po, null, 2));

    for (const gi of grn.items) {
      console.log('--- GRN ITEM ---');
      console.log('gi.productId:', gi.productId);
      console.log('gi.purchaseOrderItemId:', gi.purchaseOrderItemId);
      const prod = await prisma.product.findUnique({ where: { id: gi.productId } });
      console.log('Direct product query:', prod?.name, prod?.code, prod?.sku);
      const rawMat = await prisma.rawMaterial.findUnique({ where: { id: gi.productId } }).catch(() => null);
      console.log('Direct rawMaterial query:', rawMat?.name, rawMat?.code);
    }
  }
}

run().finally(() => prisma.$disconnect());
