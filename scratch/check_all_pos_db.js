const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const pos = await prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('Total POs found:', pos.length);
  pos.forEach(p => {
    console.log({
      id: p.id,
      publicId: p.publicId,
      poNumber: p.poNumber,
      status: p.status,
      totalAmount: p.totalAmount,
      supplierId: p.supplierId,
      supplierName: p.supplier?.name,
      orderRemarks: p.orderRemarks,
      snapshotVendor: p.snapshot?.vendorName,
      snapshotIndents: p.snapshot?.selectedIndents?.map(i => i.indentNo || i.publicId)
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
