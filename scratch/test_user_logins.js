const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function testPasswords() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } }
  });

  const candidates = [
    'Himalaya@2026',
    'Admin@123',
    'SuperAdmin@123',
    'SuperAdmin@2026',
    'Admin@2026',
    'Password@123',
    'sales1',
    'sales2',
    'sales123'
  ];

  const users = await prisma.user.findMany({
    where: {
      email: { in: ['superadmin@himalayaerp.com', 'sales1@himalayaerp.com', 'sales2@himalayaerp.com', 'sales3@himalayaerp.com', 'sales4@himalayaerp.com', 'sales5@himalayaerp.com', 'sales11@himalayaerp.com', 'sales12@himalayaerp.com', 'sales13@himalayaerp.com', 'sales14@himalayaerp.com'] }
    }
  });

  for (const user of users) {
    let matched = null;
    for (const c of candidates) {
      if (await bcrypt.compare(c, user.password)) {
        matched = c;
        break;
      }
    }
    console.log(`${user.email}: ${matched ? `MATCH: ${matched}` : 'NO MATCH'}`);
  }

  await prisma.$disconnect();
}

testPasswords().catch(console.error);
