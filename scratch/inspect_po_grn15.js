const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  }
});

async function run() {
  const grn = await prisma.goodsReceiptNote.findUnique({
    where: { grnNumber: 'GRN-2026-000015' }
  });

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: grn.purchaseOrderId },
    include: {
      items: {
        include: { product: true }
      },
      purchaseIndent: true
    }
  });

  console.log('PO Number:', po.poNumber);
  console.log('PO Indent Number:', po.purchaseIndent?.indentNumber);
  console.log('PO Items:', JSON.stringify(po.items.map(i => ({
    id: i.id,
    productId: i.productId,
    productName: i.product?.name,
    productSku: i.product?.sku,
    materialNameSnapshot: i.materialNameSnapshot,
    materialCodeSnapshot: i.materialCodeSnapshot,
    uomSnapshot: i.uomSnapshot,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    unit: i.product?.unit
  })), null, 2));

  const grnItems = await prisma.goodsReceiptItem.findMany({
    where: { goodsReceiptNoteId: grn.id }
  });
  console.log('GRN Items:', JSON.stringify(grnItems, null, 2));
}

run().finally(() => prisma.$disconnect());
