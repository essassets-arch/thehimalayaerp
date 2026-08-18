const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSuperAdminQueueQuery() {
  console.log('=== TESTING SUPER ADMIN QUEUE API QUERY ===');
  
  const pendingOrders = await prisma.purchaseOrder.findMany({
    where: {
      status: { in: ['PENDING_SUPER_ADMIN_APPROVAL', 'PENDING_APPROVAL', 'SUBMITTED', 'PENDING_FINANCE', 'DRAFT', 'PENDING'] }
    },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  console.log(`Found ${pendingOrders.length} pending PO request(s) for Super Admin:`, pendingOrders.map(p => ({
    id: p.id,
    poNumber: p.poNumber,
    status: p.status,
    totalAmount: p.totalAmount,
    supplierName: p.supplier?.name
  })));
}

testSuperAdminQueueQuery().finally(() => prisma.$disconnect());
