const { PrismaClient } = require('@prisma/client');

async function testUrl(name, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const u = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
    console.log(`[${name}] Sales 1:`, u ? `${u.id} | ${u.name} | ${u.email} | ${u.role}` : 'NOT FOUND');
    const orderCount = await prisma.salesOrder.count({ where: { salesExecutive: { email: 'sales1@himalayaerp.com' } } });
    console.log(`[${name}] Existing Sales 1 Orders: ${orderCount}`);
  } catch (e) {
    console.log(`[${name}] Error:`, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await testUrl('Port 5435 himalaya_postgres', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await testUrl('Port 5432 browser_test', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
  await testUrl('Port 5432 himalaya_erp', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public');
}

run();
