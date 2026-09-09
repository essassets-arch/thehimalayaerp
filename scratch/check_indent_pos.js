const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });

async function main() {
  const target = 'c99c91fc-8e90-417b-b790-66ed222d33ab';
  const pos = await prisma.purchaseOrder.findMany({
    where: { purchaseIndentId: target }
  });
  console.log('PurchaseOrders for target:', pos);
  
  const allPos = await prisma.purchaseOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, poNumber: true, publicId: true, purchaseIndentId: true, status: true }
  });
  console.log('Recent PurchaseOrders:', allPos);

  const indents = await prisma.purchaseIndent.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, publicId: true, indentNo: true, status: true, department: true, createdAt: true }
  });
  console.log('All indents in Docker DB (count=' + indents.length + '):');
  console.table(indents);
}

main().catch(console.error).finally(() => prisma.$disconnect());
