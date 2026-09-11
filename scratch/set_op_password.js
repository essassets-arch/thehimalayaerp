const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });

async function setPassword() {
  const hash = await bcrypt.hash('admin123', 10);
  await p.user.update({
    where: { email: 'production.operator@himalayaerp.com' },
    data: { password: hash, failedLoginAttempts: 0, lockedUntil: null, isActive: true }
  });
  console.log('Updated password for production.operator to admin123!');
  await p.$disconnect();
}
setPassword();
