const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetOrder() {
  console.log('--- RESETTING ORDER HCCL/2627/0002 ---');
  
  const order = await prisma.salesOrder.findFirst({
    where: { orderNumber: 'HCCL/2627/0002' },
    include: { items: true }
  });

  if (!order) {
    console.error('Order not found!');
    await prisma.$disconnect();
    return;
  }

  const itemIds = order.items.map(i => i.id);

  // 1. Delete Work Orders
  const deletedWOs = await prisma.workOrder.deleteMany({
    where: { salesOrderItemId: { in: itemIds } }
  });
  console.log(`Deleted ${deletedWOs.count} Work Orders.`);

  // 2. Delete Production Plans
  const deletedPPs = await prisma.productionPlan.deleteMany({
    where: { salesOrderId: order.id }
  });
  console.log(`Deleted ${deletedPPs.count} Production Plans.`);

  // 3. Delete Allocations
  const deletedAllocs = await prisma.salesOrderAllocation.deleteMany({
    where: { salesOrderItemId: { in: itemIds } }
  });
  console.log(`Deleted ${deletedAllocs.count} Allocations.`);

  // 4. Find the PLANT_APPROVED workflow state
  const targetState = await prisma.workflowState.findFirst({
    where: { code: 'PLANT_APPROVED' }
  }) || await prisma.workflowState.findFirst({
    where: { code: 'PLANT_HEAD_ACCEPTED' }
  });

  console.log(`Found target workflow state: ${targetState ? targetState.code : 'NONE'} [ID: ${targetState ? targetState.id : 'NONE'}]`);

  // 5. Update SalesOrder status back to PLANT_APPROVED
  const updated = await prisma.salesOrder.update({
    where: { id: order.id },
    data: {
      status: 'PLANT_APPROVED',
      workflowStateId: targetState ? targetState.id : null
    }
  });
  console.log(`Reset SalesOrder status to ${updated.status}.`);
}

resetOrder()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
