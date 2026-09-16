const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password@123', 10);
  const updated = await prisma.user.updateMany({
    where: {
      email: {
        in: [
          'superadmin@himalayaerp.com',
          'sana.r@himalayaerp.com',
          'trushna.g@himalayaerp.com',
          'ravikant.t@himalayaerp.com'
        ]
      },
    },
    data: {
      password: hash,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  console.log('Set Password@123 for users. Count:', updated.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
