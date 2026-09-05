const { PrismaClient } = require('@prisma/client');

const dbNames = [
  'himalaya_erp_browser_test',
  'himalaya_erp',
  'himalaya_erp_dev',
  'prototype_next_browser_test'
];

async function check() {
  for (const dbName of dbNames) {
    const url = `postgresql://himalaya_erp_user:12345678@localhost:5432/${dbName}?schema=public`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } }
      });
      const leadCount = user ? await prisma.lead.count({ where: { salesExecutiveId: user.id } }) : 0;
      console.log(`DB [${dbName}]: user exists=${Boolean(user)}, leads=${leadCount}`);
    } catch (e) {
      console.log(`DB [${dbName}]: failed connection (${e.message})`);
    } finally {
      await prisma.$disconnect();
    }
  }
}

check();
