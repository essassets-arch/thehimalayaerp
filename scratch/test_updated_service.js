const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const { ProductionWorkflowService } = require(path.resolve(__dirname, '../backend/dist/modules/production/production-workflow.service'));

async function test() {
  const service = new ProductionWorkflowService(prisma, null, null);

  console.log('=== TEST 1: Month 2026-10 ===');
  const resMonth = await service.getGlobalSummaryReport({ month: '2026-10' });
  console.log('meta:', JSON.stringify(resMonth.meta, null, 2));
  console.log('summary:', JSON.stringify(resMonth.summary, null, 2));
  console.log('workflow:', JSON.stringify(resMonth.workflow, null, 2));
  console.log('trends count:', resMonth.trends?.length);
  console.log('recentWorkOrders total:', resMonth.recentWorkOrders?.total, 'items in page:', resMonth.recentWorkOrders?.items?.length);

  console.log('\n=== TEST 2: Today ===');
  const resToday = await service.getGlobalSummaryReport({ period: 'day' });
  console.log('Today period label:', resToday.meta?.period?.label);
  console.log('Today summary workOrderCount:', resToday.summary?.workOrderCount, 'produced:', resToday.summary?.actualProductionQuantity);

  console.log('\n=== TEST 3: Status Filter STARTED ===');
  const resStarted = await service.getGlobalSummaryReport({ status: 'STARTED', page: 1, pageSize: 5 });
  console.log('Started workOrders total:', resStarted.recentWorkOrders?.total);
  if (resStarted.recentWorkOrders?.items?.length > 0) {
    console.log('First item status:', resStarted.recentWorkOrders.items[0].status, resStarted.recentWorkOrders.items[0].stage);
  }

  console.log('\n=== TEST 4: Reconciliation ===');
  console.log('productionReconciliation:', JSON.stringify(resMonth.productionReconciliation, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
