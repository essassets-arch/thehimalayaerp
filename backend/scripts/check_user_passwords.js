const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const url = 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public';
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const hash = await bcrypt.hash('password123', 10);

  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  });

  console.log(`Found ${users.length} users in Docker DB.`);

  const targetEmails = [
    'supersales1@himalayaerp.com',
    'supersales2@himalayaerp.com',
    'sales1@himalayaerp.com',
    'sales2@himalayaerp.com',
    'sales3@himalayaerp.com',
  ];

  await prisma.user.updateMany({
    where: { email: { in: targetEmails } },
    data: { password: hash },
  });

  console.log('\nUpdated password for target test accounts to "password123".');
}

main().finally(() => prisma.$disconnect());
