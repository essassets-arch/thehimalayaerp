const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const isActuallyInProductionOrDone = (st, obj = {}) => {
    const s = String(st || '').toUpperCase().trim();
    const producedQty = Number(obj.producedQty || obj.quantityProduced || 0);
    const hasStarted = Boolean(obj.lastStartedAt || obj.startedAt || obj.productionStartTime || producedQty > 0);
    return (
      hasStarted ||
      [
        'READY',
        'IN_PROGRESS',
        'PRODUCTION_STARTED',
        'RUNNING',
        'QC_PENDING',
        'QC_PASSED',
        'QC_APPROVED',
        'QC_FAILED',
        'REWORK_IN_PROGRESS',
        'READY_FOR_DISPATCH',
        'DISPATCHED',
        'COMPLETED',
        'CLOSED',
        'PLANT_REJECTED',
        'REJECTED',
      ].includes(s)
    );
  };

  const wo = await prisma.workOrder.findFirst({
    where: { workOrderNumber: 'WO/2627/0142-01' },
    include: { workflowState: true }
  });

  console.log('WorkOrder status:', wo.status, 'state:', wo.workflowState?.code);
  console.log('Is considered accepted/in history when READY included:', isActuallyInProductionOrDone(wo.workflowState?.code, wo));
}

main().catch(console.error).finally(() => prisma.$disconnect());
