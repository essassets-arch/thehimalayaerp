const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const emps = await prisma.employee.findMany({
    select: { id: true, employeeCode: true, fullName: true, workEmail: true }
  });
  console.table(emps);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
