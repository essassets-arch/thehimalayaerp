const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  }
});

async function run() {
  const grn = await prisma.goodsReceiptNote.findUnique({
    where: { grnNumber: 'GRN-2026-000014' },
    include: { items: true }
  });
  console.log('GRN items:', grn?.items);

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: grn.purchaseOrderId },
    include: { items: { include: { product: true } } }
  });
  console.log('PO Number:', po?.poNumber);
  console.log('PO items:', po?.items);
}

run().finally(() => prisma.$disconnect());
