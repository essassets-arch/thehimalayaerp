const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { QcService } = require('./src/modules/qc/qc.service');
const { WorkflowService } = require('./src/modules/workflow/workflow.service');

async function test() {
  const workflowService = new WorkflowService(prisma);
  const qcService = new QcService(prisma, workflowService);
  try {
    await qcService.processAction('c67f64d6-bc41-4896-84a5-248e1fb3a468', 'APPROVE', 'test', 'SYSTEM', { approvedQuantity: 10 });
    console.log('Success!');
  } catch (e) {
    console.error('Error!', e);
  } finally {
    prisma.$disconnect();
  }
}
test();
