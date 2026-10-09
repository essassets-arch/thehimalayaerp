const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const servicePath = path.resolve(__dirname, '../backend/dist/modules/production/production-workflow.service');
const { ProductionWorkflowService } = require(servicePath);

async function main() {
  const service = new ProductionWorkflowService(prisma, null, null);
  const data = await service.getGlobalSummaryReport({ period: 'month' });

  console.log('--- BACKEND REPORT RESULT ---');
  console.log('executiveKpis:', JSON.stringify(data.executiveKpis, null, 2));
  console.log('shiftWiseProductionSummary:', JSON.stringify(data.shiftWiseProductionSummary, null, 2));
  console.log('hydraulicPressFleet:', JSON.stringify(data.hydraulicPressFleet, null, 2));
  console.log('qualityAndScrapDiagnostics:', JSON.stringify(data.qualityAndScrapDiagnostics, null, 2));
  console.log('manufacturingPipeline:', JSON.stringify(data.manufacturingPipeline, null, 2));
  console.log('referenceActiveWorkOrders (first 3):', JSON.stringify(data.referenceActiveWorkOrders.slice(0, 3), null, 2));
  console.log('productionReconciliation:', JSON.stringify(data.productionReconciliation, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
