const { PrismaClient } = require('@prisma/client');
const { ProductionWorkflowService } = require('./dist/modules/production/production-workflow.service');
const { InventoryService } = require('./dist/modules/inventory/inventory.service');

const prisma = new PrismaClient();

async function main() {
  const service = new ProductionWorkflowService(prisma, new InventoryService(prisma));
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  const data = await service.getFinishedGoods(companyId);
  console.log('--- getFinishedGoods Result ---');
  const target = data.find(item => item.productCode === 'HIMALAYAFRPMHC450X450C250');
  console.log('Target item:', JSON.stringify(target, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
