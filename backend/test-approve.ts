import { PrismaClient } from '@prisma/client';
import { QcService } from './src/modules/qc/qc.service';
import { WorkflowService } from './src/modules/workflow/workflow.service';

const prisma = new PrismaClient();

async function test() {
  const workflowService = new WorkflowService(prisma as any);
  const qcService = new QcService(prisma as any, workflowService);
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
