const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

(async () => {
  const suppliers = await prisma.supplier.findMany();
  console.log('Suppliers in DB:', suppliers.map(s => ({ id: s.id, publicId: s.publicId, name: s.name })));

  const pos = await prisma.purchaseOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { supplier: true }
  });
  console.log('Recent POs:', pos.map(p => ({
    id: p.id,
    publicId: p.publicId,
    poNumber: p.poNumber,
    supplierId: p.supplierId,
    supplierName: p.supplier?.name,
    status: p.status,
    totalAmount: p.totalAmount
  })));
  await prisma.$disconnect();
})();
