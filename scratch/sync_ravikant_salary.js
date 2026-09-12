const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public' } }
});

async function main() {
  const depts = await prisma.department.findMany();
  console.log('Departments:', depts.map(d => ({ id: d.id, name: d.name })));

  // Find Ravikant or EMP-10
  const ravikant = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeCode: 'EMP-10' },
        { firstName: 'Ravikant' },
        { fullName: { contains: 'Ravikant' } }
      ]
    },
    include: { department: true }
  });
  console.log('Found employee:', ravikant ? { id: ravikant.id, name: ravikant.fullName, code: ravikant.employeeCode } : 'None');
}

main().catch(console.error).finally(() => prisma.$disconnect());
