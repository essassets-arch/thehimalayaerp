const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public',
    },
  },
});

async function check() {
  const users = [
    { email: 'super.admin@himalayaerp.com', pass: 'SuperAdmin@hcppl' },
    { email: 'super.admin@himalayaerp.com', pass: 'admin123' },
    { email: 'sales1@himalayaerp.com', pass: 'Himalaya@2026' },
    { email: 'sana.r@himalayaerp.com', pass: 'Himalaya@1234' },
  ];

  for (const u of users) {
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      console.log(`User ${u.email} not found`);
      continue;
    }
    const match = await bcrypt.compare(u.pass, user.password);
    console.log(`Email: ${u.email} | Pass: "${u.pass}" -> MATCH: ${match}`);
  }
}

check().finally(() => prisma.$disconnect());
