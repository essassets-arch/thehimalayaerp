const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password@123', 10);
  const updated = await prisma.user.updateMany({
    where: {
      email: { in: ['finance.manager@himalayaerp.com', 'finance.manager.browser@himalayaerp.test', 'finance.executive@himalayaerp.com'] },
    },
    data: {
      password: hash,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  console.log('RESET FINANCE USERS PASSWORD & UNLOCKED. Count:', updated.count);

  const user = await prisma.user.findUnique({ where: { email: 'finance.manager@himalayaerp.com' } });
  const isMatch = await bcrypt.compare('Password@123', user.password);
  console.log('BCRYPT VERIFICATION MATCH:', isMatch, 'IS_ACTIVE:', user.isActive, 'LOCKED_UNTIL:', user.lockedUntil);
}

main().catch(console.error).finally(() => prisma.$disconnect());
