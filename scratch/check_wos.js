const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const wos = await prisma.workOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      salesOrderItem: true,
      productionPlan: {
        include: {
          salesOrder: true
        }
      }
    }
  });
  console.log('Work orders count:', wos.length);
  wos.forEach(w => {
    console.log('WO:', w.id, w.workOrderNumber, 'status:', w.status, 'prodStatus:', w.productionStatus, 'qty:', w.quantity, 'SO:', w.productionPlan?.salesOrder?.orderNumber);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
