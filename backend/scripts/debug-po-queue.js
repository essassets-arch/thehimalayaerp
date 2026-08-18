const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectProcurementQueue() {
  console.log('=== INSPECTING DB PURCHASE INDENTS & PO QUEUE ===');
  
  const indents = await prisma.purchaseIndent.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, indentNo: true, status: true, department: true, requestedById: true, createdAt: true }
  });
  console.log('Purchase Indents in DB:', indents);

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, poNumber: true, status: true, issuedById: true, createdAt: true }
  });
  console.log('Purchase Orders in DB:', purchaseOrders);
}

inspectProcurementQueue().finally(() => prisma.$disconnect());
