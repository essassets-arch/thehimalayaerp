const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixData() {
  const workOrders = await prisma.workOrder.findMany({
    include: { productionPlan: { include: { salesOrder: { include: { items: true } } } } }
  });

  for (const wo of workOrders) {
    const updateData = {};
    if (!wo.salesOrderItemId && wo.productionPlan.salesOrder.items.length > 0) {
      updateData.salesOrderItemId = wo.productionPlan.salesOrder.items[0].id;
    }
    
    // Check if it has an approved QC Inspection
    const qc = await prisma.qCInspection.findFirst({
      where: { workOrderId: wo.id, status: 'APPROVED' }
    });

    if (qc) {
      if (!wo.startedAt) {
        updateData.startedAt = new Date(qc.createdAt.getTime() - 1000 * 60 * 60 * 2); // 2 hours before QC
      }
      if (!wo.completedAt) {
        updateData.completedAt = new Date(qc.createdAt.getTime() - 1000 * 60 * 5); // 5 mins before QC
      }
      if (!wo.duration) {
        updateData.duration = 120; // 2 hours
      }
      updateData.status = 'COMPLETED'; // If QC is approved, it must be at least completed
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.workOrder.update({
        where: { id: wo.id },
        data: updateData
      });
    }
  }
  console.log('Fixed missing WorkOrder data for the UI!');
}

fixData().finally(() => prisma.$disconnect());
