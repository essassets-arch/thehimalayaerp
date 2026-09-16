const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function check() {
  const u = await prisma.user.findUnique({
    where: { email: 'sahad.accounts@himalayaerp.com' },
    include: { role: true }
  });
  if (!u) {
    console.log('Sahad user NOT found');
    return;
  }
  console.log('User found:', u.email, 'Role:', u.role?.name, u.role?.code);
  const candidates = ['admin123', 'Hcpp1@5253', 'Hcppl@5253', 'Himalaya@1234', 'password123'];
  for (const p of candidates) {
    const ok = await bcrypt.compare(p, u.password);
    if (ok) {
      console.log('Matching password:', p);
    }
  }
}

check().finally(() => prisma.$disconnect());
