const { PrismaClient } = require('./backend/node_modules/@prisma/client');

async function test() {
  const p1 = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:admin123@localhost:5432/himalaya_erp_dev?schema=public' } }
  });
  const devUser = await p1.user.findFirst({ where: { email: 'sales.executive.browser@himalayaerp.test' } });
  console.log('Dev DB User:', !!devUser);
  await p1.$disconnect();

  const p2 = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:admin123@localhost:5432/himalaya_erp_browser_test?schema=public' } }
  });
  const testUser = await p2.user.findFirst({ where: { email: 'sales.executive.browser@himalayaerp.test' } });
  console.log('Test DB User:', !!testUser);
  await p2.$disconnect();
}
test().catch(console.error);
