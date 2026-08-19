const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'hr@himalayaerp.com' },
    include: { employee: true }
  });
  console.log(JSON.stringify(users, null, 2));

  const allHrEmployees = await prisma.employee.findMany({
    where: { workEmail: 'hr@himalayaerp.com' }
  });
  console.log('All HR employees:', allHrEmployees);
}

main().catch(console.error).finally(() => prisma.$disconnect());
