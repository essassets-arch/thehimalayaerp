const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function check() {
  const u = await prisma.user.findUnique({
    where: { email: 'sahad.m@himalayaerp.com' }
  });
  if (!u) {
    console.log('User not found');
    return;
  }
  const candidates = ['admin123', 'Hcpp1@5253', 'Hcppl@5253', 'Himalaya@1234', 'password123'];
  for (const p of candidates) {
    const ok = await bcrypt.compare(p, u.password);
    if (ok) {
      console.log('sahad.m password is:', p);
    }
  }
}

check().finally(() => prisma.$disconnect());
