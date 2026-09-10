const { PrismaClient } = require('d:/prototype-next-main/backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const grn = await prisma.goodsReceiptNote.findUnique({
    where: { grnNumber: 'GRN-2026-000014' },
    include: { items: true }
  });
  console.log('GRN:', grn);
  if (grn) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: grn.purchaseOrderId },
      include: { items: { include: { product: true } } }
    });
    console.log('PO:', JSON.stringify(po, null, 2));
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
