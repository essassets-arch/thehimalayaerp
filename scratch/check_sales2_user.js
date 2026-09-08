const { PrismaClient } = require('@prisma/client');

async function test(name, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const u = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'sales2@himalayaerp.com' },
          { name: { contains: 'Sales 2', mode: 'insensitive' } }
        ]
      }
    });
    console.log(`[${name}] Sales 2 User:`, u ? `${u.id} | ${u.name} | ${u.email}` : 'NOT FOUND');
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await test('5435 Docker DB', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await test('5432 Browser Test', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
  await test('5432 Main DB', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public');
}

run();
