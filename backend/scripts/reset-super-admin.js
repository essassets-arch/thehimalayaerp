const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'super.admin@himalayaerp.com';
  const newPassword = process.argv[3] || 'SuperAdmin&67*';

  console.log(`Resetting credentials for: ${email}`);
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updated = await prisma.user.updateMany({
    where: { email },
    data: {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true,
    },
  });

  if (updated.count === 0) {
    console.error(`❌ User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`✅ Successfully unlocked ${email}`);
  console.log(`✅ Password has been updated to: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Error executing reset script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
