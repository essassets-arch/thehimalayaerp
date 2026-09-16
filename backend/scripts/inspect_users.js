const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'superadmin@himalayaerp.com' },
        { role: { code: { contains: 'PLANT' } } },
      ],
    },
    select: {
      id: true,
      email: true,
      role: { select: { code: true, name: true } },
      isActive: true,
      password: true,
    },
  });
  console.log('Users in DB:', users.map(u => ({ ...u, password: u.password ? u.password.slice(0, 15) + '...' : null })));

  const bcrypt = require('bcrypt');
  const passwordsToTry = ['admin123', 'Admin@123', 'planthead123', 'password123', 'Himalaya@123', 'Plant@123', 'Super@123', 'superadmin123'];
  for (const u of users) {
    console.log(`\nTesting passwords for ${u.email}:`);
    for (const pwd of passwordsToTry) {
      const match = await bcrypt.compare(pwd, u.password || '');
      if (match) console.log(`  >>> FOUND MATCH for ${u.email}: "${pwd}"`);
    }
  }
}

main().finally(() => prisma.$disconnect());
