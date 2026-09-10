const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const po2 = await prisma.purchaseOrder.findFirst({
    where: { publicId: 'PO-DRAFT-2026-000002' },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  console.log('PO2:', {
    id: po2.id,
    publicId: po2.publicId,
    status: po2.status,
    totalAmount: po2.totalAmount,
    supplier: po2.supplier?.name,
    snapshot: po2.snapshot,
    items: po2.items.map(i => ({
      name: i.product?.name || i.materialNameSnapshot,
      qty: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal
    }))
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
