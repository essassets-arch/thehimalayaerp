const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ take: 5, select: { id: true, email: true, companyId: true } });
  console.log('Sample users companyId:', users);
  const emps = await prisma.employee.findMany({ take: 5, select: { id: true, fullName: true, companyId: true } });
  console.log('Sample emps companyId:', emps);
  await prisma.$disconnect();
}
run();
