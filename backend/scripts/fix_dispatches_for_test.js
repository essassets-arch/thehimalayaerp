const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const dispatches = await prisma.dispatch.findMany({
    where: { createdById: null },
    include: { salesOrder: true }
  });
  console.log('Found ' + dispatches.length + ' dispatches missing createdById');
  for (const d of dispatches) {
    if (d.salesOrder && d.salesOrder.createdById) {
      await prisma.dispatch.update({
        where: { id: d.id },
        data: { createdById: d.salesOrder.createdById }
      });
      console.log('Updated dispatch ' + d.id + ' with userId ' + d.salesOrder.createdById);
    }
  }
  
  // Also, let's revert the work orders for the latest dispatch so the user can test again if they want!
  if (dispatches.length > 0) {
    const latestDispatch = dispatches[dispatches.length - 1];
    const items = await prisma.dispatchItem.findMany({ where: { dispatchId: latestDispatch.id } });
    for (const item of items) {
      await prisma.workOrder.updateMany({
        where: { salesOrderItemId: item.salesOrderItemId, status: 'DISPATCHED' },
        data: { status: 'READY_FOR_DISPATCH' }
      });
      console.log('Reverted work orders for item ' + item.salesOrderItemId + ' back to READY_FOR_DISPATCH');
    }
    // Delete the latest dispatch so they can recreate it
    await prisma.dispatchItem.deleteMany({ where: { dispatchId: latestDispatch.id } });
    await prisma.dispatch.delete({ where: { id: latestDispatch.id } });
    console.log('Deleted latest dispatch so user can recreate it cleanly.');
  }

  console.log('Done');
}

fix().finally(() => prisma.$disconnect());
