const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public' } }
});

async function main() {
  // Let's find Dispatch Department
  let dispatchDept = await prisma.department.findFirst({
    where: { name: { contains: 'Dispatch', mode: 'insensitive' } }
  });

  console.log('Dispatch Dept:', dispatchDept?.id, dispatchDept?.name);

  // Check Ravikant T
  let ravikant = await prisma.employee.findFirst({
    where: {
      OR: [
        { firstName: 'Ravikant' },
        { employeeCode: 'EMP-10' }
      ]
    }
  });

  console.log('Existing employee:', ravikant);
}

main().catch(console.error).finally(() => prisma.$disconnect());
