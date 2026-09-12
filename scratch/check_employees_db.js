const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public"
    }
  }
});

async function main() {
  const employees = await prisma.employee.findMany({
    take: 3,
    select: { id: true, employeeCode: true, firstName: true, lastName: true }
  });
  console.log('Employees:', employees);

  const structures = await prisma.employeeSalaryStructure.findMany({
    take: 3
  });
  console.log('Structures count:', structures.length, structures);
}

main().catch(console.error).finally(() => prisma.$disconnect());
