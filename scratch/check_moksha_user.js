const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'moksha.n@himalayaerp.com' },
    include: { role: true, employee: true, company: true }
  });

  if (user) {
    console.log('User found in DB. Stored hash:', user.password);
    const passwordMatch = await bcrypt.compare('Production@hcppl', user.password);
    console.log('Password "Production@hcppl" match:', passwordMatch);

    const lowercaseMatch = await bcrypt.compare('production@hcppl', user.password);
    console.log('Password "production@hcppl" match:', lowercaseMatch);

    const adminMatch = await bcrypt.compare('Admin@123', user.password);
    console.log('Password "Admin@123" match:', adminMatch);
  } else {
    console.log('User moksha.n@himalayaerp.com does NOT exist in DB!');
  }
}

checkUser().catch(console.error).finally(() => prisma.$disconnect());
