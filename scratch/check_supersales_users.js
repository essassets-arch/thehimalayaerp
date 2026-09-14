const { PrismaClient } = require('@prisma/client');

async function check(label, url) {
  console.log(`\n--- Checking ${label} ---`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'supersales' } },
          { name: { contains: 'Super Sales', mode: 'insensitive' } },
          { name: { contains: 'SuperSales', mode: 'insensitive' } }
        ]
      },
      include: { employee: true, role: true }
    });
    console.log(users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role?.name,
      phone: u.employee?.phoneNumber,
      compPhone: u.employee?.companyPhoneNumber
    })));
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await check('Docker DB (5435)', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await check('Local DB (5432)', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main().catch(console.error);
