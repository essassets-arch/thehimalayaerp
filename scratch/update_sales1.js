const { PrismaClient } = require('@prisma/client');

async function updateSales1(url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'sales1@himalayaerp.com' },
      include: { employee: true }
    });
    if (user?.employee) {
      await prisma.employee.update({
        where: { id: user.employee.id },
        data: { phoneNumber: '9586040153', companyPhoneNumber: '9586040153' }
      });
      console.log('Updated', url, 'to 9586040153');
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await updateSales1('postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await updateSales1('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main();
