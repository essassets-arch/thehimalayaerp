const { PrismaClient } = require('@prisma/client');

async function testConnection(name, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const userCount = await prisma.user.count();
    const orderCount = await prisma.salesOrder.count();
    const woCount = await prisma.workOrder.count();
    console.log(`[${name}] Connected OK! Users: ${userCount}, Orders: ${orderCount}, WorkOrders: ${woCount}`);
  } catch (err) {
    console.log(`[${name}] Failed: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await testConnection('5432 himalaya_erp_browser_test', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
  await testConnection('5432 himalaya_erp', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public');
  await testConnection('5435 himalaya_postgres', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
}

run();
