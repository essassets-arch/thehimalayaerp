import { PrismaClient } from '@prisma/client';

async function listDbs() {
  const prisma = new PrismaClient();
  try {
    const dbs = await prisma.$queryRawUnsafe(`SELECT datname FROM pg_database WHERE datistemplate = false;`);
    console.log('Databases:', dbs);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

listDbs();
