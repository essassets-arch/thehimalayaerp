const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { WorkOrdersService } = require('./src/modules/work-orders/work-orders.service');
const { WorkflowService } = require('./src/modules/workflow/workflow.service');

async function fix() {
  const ws = new WorkflowService(prisma);
  const svc = new WorkOrdersService(prisma, ws);

  const wo = await prisma.workOrder.findFirst({ where: { status: 'QC_APPROVED' } });
  if (wo) {
    console.log('Found WorkOrder:', wo.id, wo.status);
    await svc.sendToDispatch(wo.id, 'SYSTEM');
    console.log('Sent to dispatch!');
  } else {
    console.log('No QC_APPROVED work orders found');
  }
}

fix().then(() => prisma.$disconnect());
