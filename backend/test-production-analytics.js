const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { SuperAdminService } = require('./dist/src/modules/super-admin/super-admin.service.js');

async function main() {
  const service = new SuperAdminService(prisma);
  try {
    const result = await service.getProductionAnalytics({}, null);
    console.log('SUCCESS! Result summary:', JSON.stringify(result.summary, null, 2));
    console.log('Trends count:', result.trends.length);
    console.log('Work orders count:', result.workOrders.list.length);
    console.log('Alerts:', result.alerts);
  } catch (error) {
    console.error('FAILED with error:', error);
  }
}

main().finally(() => prisma.$disconnect());
