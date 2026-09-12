const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public"
    }
  }
});

async function main() {
  const structure = await prisma.employeeSalaryStructure.findUnique({
    where: { id: '01339514-e4bb-4346-a1bb-4ce26be9b838' },
    include: { employee: true }
  });
  console.log('Structure by ID:', structure);

  const ravikant = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeCode: 'EMP-10' },
        { firstName: { contains: 'Ravikant', mode: 'insensitive' } }
      ]
    },
    include: {
      salaryStructures: true,
      payrollRecords: true
    }
  });
  console.log('\nRavikant employee:', ravikant ? {
    id: ravikant.id,
    code: ravikant.employeeCode,
    name: ravikant.firstName + ' ' + ravikant.lastName,
    structures: ravikant.salaryStructures,
    payrollRecords: ravikant.payrollRecords
  } : 'NOT FOUND');
}

main().catch(console.error).finally(() => prisma.$disconnect());
