const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  }
});

async function main() {
  const p = await prisma.product.findFirst();
  console.log('Sample product:', p?.id, p?.name);
  const indents = await prisma.purchaseIndent.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recent indents:');
  for (const i of indents) {
    console.log(` - ID: ${i.id}, No: ${i.indentNo || i.publicId}, Status: ${i.status}, Items: ${i.items.length}`);
  }
  const suppliers = await prisma.supplier.findMany({ include: { PurchaseOrder: true } });
  console.log('Suppliers in Docker DB (5435):');
  for (const s of suppliers) {
    console.log(` - ID: ${s.id}, Name: "${s.name}", POs Count: ${s.PurchaseOrder.length}`);
    for (const po of s.PurchaseOrder) {
      console.log(`    * PO: ${po.poNumber || po.publicId}, Status: ${po.status}`);
    }
  }

  // Check and add purchaseIndentId column to PurchaseOrderItem if missing
  await prisma.$executeRawUnsafe('ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "purchaseIndentId" TEXT;');
  const poiCols = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'PurchaseOrderItem';");
  console.log('PurchaseOrderItem columns in DB:', poiCols.map(c => c.column_name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
