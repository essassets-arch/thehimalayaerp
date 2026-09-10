require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const sups = await p.supplier.findMany();
  console.log('Suppliers in DB count:', sups.length);
  console.log('Suppliers:', sups.map(s => ({ id: s.id, publicId: s.publicId, name: s.name, isActive: s.isActive })));

  const pos = await p.purchaseOrder.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      publicId: true,
      supplierId: true,
      supplier: { select: { id: true, name: true } },
      snapshot: true
    }
  });
  console.log('Latest 20 POs:');
  pos.forEach(po => {
    console.log({
      publicId: po.publicId,
      supId: po.supplierId,
      supplierName: po.supplier?.name,
      snapshotVendor: po.snapshot?.vendorName
    });
  });
}

main().catch(console.error).finally(() => p.$disconnect());
