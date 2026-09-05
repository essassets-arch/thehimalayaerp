const { PrismaClient } = require('@prisma/client');

async function listDbs() {
  const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
  try {
    const dbs = await prisma.$queryRawUnsafe('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Databases:', dbs);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

listDbs();
