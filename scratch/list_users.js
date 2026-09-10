const { PrismaClient } = require('@prisma/client');

async function updateDB(url, label) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const sana = await prisma.user.findUnique({ where: { email: 'sana.r@himalayaerp.com' } });
  if (sana) {
    await prisma.user.updateMany({
      where: { email: 'makhdum@himalayaerp.com' },
      data: { password: sana.password, failedLoginAttempts: 0, lockedUntil: null }
    });
    console.log(`Updated makhdum on ${label}`);
  }
  await prisma.$disconnect();
}

async function main() {
  await updateDB('postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public', '5435');
  await updateDB('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public', '5432');
}

main();
