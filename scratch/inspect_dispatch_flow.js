const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const so = await prisma.salesOrder.findFirst({
    where: { orderNumber: 'HCPPL/2627/0001' },
    include: {
      items: { include: { product: true } },
      productionPlans: { include: { workOrders: true } }
    }
  });
  console.log('Order:', so.orderNumber, 'status:', so.status);
  console.log('Items count:', so.items.length);
  for (const it of so.items) {
    console.log('  Item:', it.id, 'product:', it.product?.name, 'category:', it.product?.dispatchCategory);
  }
  for (const pp of so.productionPlans) {
    console.log('Plan:', pp.planNumber, 'status:', pp.status);
    for (const wo of pp.workOrders) {
      console.log('  WO:', wo.workOrderNumber, 'status:', wo.status, 'prodStatus:', wo.productionStatus, 'sentToDispatchAt:', wo.sentToDispatchAt);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
