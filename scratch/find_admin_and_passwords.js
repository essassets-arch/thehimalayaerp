const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } }
});

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { in: ['admin@himalayaerp.com', 'superadmin@himalayaerp.com', 'sales1@himalayaerp.com', 'sales2@himalayaerp.com', 'sales3@himalayaerp.com', 'sales4@himalayaerp.com', 'sales5@himalayaerp.com', 'sales11@himalayaerp.com', 'sales12@himalayaerp.com', 'sales13@himalayaerp.com', 'sales14@himalayaerp.com'] }
    },
    select: { id: true, email: true, role: { select: { name: true } }, name: true, password: true }
  });
  console.log('Users:', users);
  await prisma.$disconnect();
}

main().catch(console.error);
