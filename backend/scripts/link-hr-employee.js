const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== LINKING HR USER TO EMPLOYEE ===');
  const user = await prisma.user.findFirst({
    where: { email: 'hr@himalayaerp.com' }
  });
  if (!user) {
    console.error('HR user not found.');
    return;
  }

  const employee = await prisma.employee.findFirst({
    where: { employeeCode: 'EMP-1012' }
  });
  if (!employee) {
    console.error('HR employee EMP-1012 not found.');
    return;
  }

  // Update employee to link to this user
  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: { userId: user.id }
  });
  console.log('Successfully linked HR User to Employee:', updated);
}

main().catch(console.error).finally(() => prisma.$disconnect());
