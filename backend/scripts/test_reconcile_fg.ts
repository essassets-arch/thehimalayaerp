import { PrismaClient } from '@prisma/client';
import { ProductionWorkflowService } from '../src/modules/production/production-workflow.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';

const prisma = new PrismaClient();

async function main() {
  const service = new ProductionWorkflowService(prisma, new InventoryService(prisma));
  
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  const data = await service.getFinishedGoods(companyId);
  
  console.log('--- getFinishedGoods returned items count:', data.length);
  const target = data.find((item: any) => item.productCode === 'HIMALAYAFRPMHC450X450C250');
  console.log('Target item:', target);
}

main().catch(console.error).finally(() => prisma.$disconnect());
