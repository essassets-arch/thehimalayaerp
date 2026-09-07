const { PrismaClient } = require('@prisma/client');

async function testDb(url, name) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const res = await prisma.$queryRawUnsafe('SELECT current_database(), current_user;');
    console.log(`[SUCCESS] ${name}: connected to`, res);
    const dbs = await prisma.$queryRawUnsafe('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log(`   Databases in this cluster:`, dbs.map(r => r.datname).join(', '));
  } catch (e) {
    console.log(`[FAILED] ${name}: ${e.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  await testDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public', 'Local 5432 browser_test');
  await testDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public', 'Local 5432 himalaya_erp');
  await testDb('postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public', 'Docker 5435 himalaya_erp');
})();
