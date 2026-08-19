const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== SALES6 DB DIAGNOSTIC ===');
  const user = await prisma.user.findUnique({
    where: { email: 'sales6@himalayaerp.com' },
    include: { employee: true }
  });
  console.log('User Record:', user ? { id: user.id, email: user.email, name: user.name, employee: user.employee } : 'User not found');

  const employee = await prisma.employee.findFirst({
    where: { workEmail: 'sales6@himalayaerp.com' }
  });
  console.log('Employee Record:', employee ? { id: employee.id, employeeCode: employee.employeeCode, fullName: employee.fullName, userId: employee.userId } : 'Employee not found');

  const allUnlinked = await prisma.employee.findMany({
    where: { userId: null },
    select: { employeeCode: true, fullName: true, workEmail: true }
  });
  console.log('All unlinked employees:', allUnlinked);
}

main().catch(console.error).finally(() => prisma.$disconnect());
