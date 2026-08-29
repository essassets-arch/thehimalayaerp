const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function clean() {
  await prisma.employeeDocument.deleteMany({ where: { employee: { workEmail: 'test.salarystaff@himalayaerp.com' } } });
  await prisma.employee.deleteMany({ where: { workEmail: 'test.salarystaff@himalayaerp.com' } });
  await prisma.user.deleteMany({ where: { email: 'test.salarystaff@himalayaerp.com' } });
  console.log('Cleaned up test record');
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
