const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true, employee: true }
  });
  console.log(`Total users in DB: ${users.length}`);
  users.forEach(u => {
    console.log(`- User: ${u.email}, Role: ${u.role?.code}, CompanyId: ${u.companyId}, EmployeeLink: ${u.employee ? u.employee.employeeCode : 'NONE'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
