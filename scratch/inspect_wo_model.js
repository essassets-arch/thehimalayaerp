const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sampleWo = await prisma.workOrder.findFirst({
    include: {
      workflowState: true,
      productionPlan: true,
      salesOrderItem: true
    }
  });
  console.log('Sample WorkOrder structure:');
  console.log(JSON.stringify(sampleWo, null, 2));

  // Also check workflow states for WORK_ORDER
  const woStates = await prisma.workflowState.findMany({
    where: { workflow: { code: 'WORK_ORDER' } }
  });
  console.log('WORK_ORDER states:', woStates.map(s => ({ id: s.id, code: s.code, name: s.name, sequence: s.sequence })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
