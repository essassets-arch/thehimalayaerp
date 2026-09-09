const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const readyState = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'WORK_ORDER' }, code: 'READY' }
  });
  console.log('Ready state:', readyState);

  const planReleasedState = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'PRODUCTION_PLAN' }, code: 'RELEASED' }
  });
  console.log('Plan released state:', planReleasedState);

  const soPlantApprovedState = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'SALES_ORDER' }, code: 'PLANT_APPROVED' }
  });
  console.log('SO Plant Approved state:', soPlantApprovedState);
}

main().catch(console.error).finally(() => prisma.$disconnect());
