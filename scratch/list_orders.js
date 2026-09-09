const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.salesOrder.findMany({
    select: {
      id: true,
      orderNumber: true,
      customer: { select: { companyName: true, contactPerson: true } },
      remarks: true,
      status: true,
      workflowState: { select: { code: true, name: true } },
      productionPlans: {
        select: {
          id: true,
          planNumber: true,
          status: true,
          workOrders: { select: { id: true, workOrderNumber: true, status: true, workflowState: { select: { name: true } } } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  console.log('Recent 50 Sales Orders:');
  for (const o of orders) {
    console.log(`${o.orderNumber} | ${o.customer?.companyName} | ${o.status} | Plan count: ${o.productionPlans?.length} | WOs: ${o.productionPlans?.map(p => p.workOrders.length).join(',') || 0}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
