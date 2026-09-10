const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

(async () => {
  // Find or create supplier karan
  let karan = await prisma.supplier.findFirst({
    where: { name: { equals: 'karan', mode: 'insensitive' } }
  });
  if (!karan) {
    const company = await prisma.company.findFirst();
    karan = await prisma.supplier.create({
      data: {
        publicId: 'SUP-' + Date.now(),
        companyId: company?.id || 'c99c91fc-8e90-417b-b790-66ed222d33ab',
        name: 'karan'
      }
    });
    console.log('Created supplier karan:', karan.id);
  } else {
    console.log('Found supplier karan:', karan.id);
  }

  // Update PO-DRAFT-2026-000002 to point to supplier karan and update snapshot
  const po2 = await prisma.purchaseOrder.findFirst({
    where: { publicId: 'PO-DRAFT-2026-000002' }
  });
  if (po2) {
    const snap = typeof po2.snapshot === 'object' && po2.snapshot ? po2.snapshot : {};
    snap.vendorName = 'karan';
    await prisma.purchaseOrder.update({
      where: { id: po2.id },
      data: {
        supplierId: karan.id,
        snapshot: snap
      }
    });
    console.log('Updated PO-DRAFT-2026-000002 with supplier karan and snapshot.vendorName karan');
  }

  await prisma.$disconnect();
})();
