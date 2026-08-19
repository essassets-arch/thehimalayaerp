const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: { email: 'hr@himalayaerp.com' },
    include: { role: true }
  });

  if (!user) {
    console.log('❌ HR user not found in the database!');
    return;
  }

  console.log('👤 HR User Found:');
  console.log('   Email:', user.email);
  console.log('   Role:', user.role ? user.role.code : 'No Role');
  console.log('   Is Active:', user.isActive);
  console.log('   Password Hash:', user.password);

  const matchesAdmin123 = await bcrypt.compare('admin123', user.password);
  console.log('   Matches "admin123":', matchesAdmin123);

  const matchesAdmin123Cr = await bcrypt.compare('admin123\r', user.password);
  console.log('   Matches "admin123\\r":', matchesAdmin123Cr);

  if (process.env.INITIAL_ADMIN_PASSWORD) {
    const matchesEnv = await bcrypt.compare(process.env.INITIAL_ADMIN_PASSWORD, user.password);
    console.log(`   Matches Env INITIAL_ADMIN_PASSWORD ("${process.env.INITIAL_ADMIN_PASSWORD}"):`, matchesEnv);
    const matchesEnvCr = await bcrypt.compare(process.env.INITIAL_ADMIN_PASSWORD + '\r', user.password);
    console.log(`   Matches Env INITIAL_ADMIN_PASSWORD + \\r:`, matchesEnvCr);
  }
}

main().catch(console.error);
