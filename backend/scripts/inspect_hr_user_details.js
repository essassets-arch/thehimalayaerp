const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true, employee: true }
  });
  console.log('--- ALL USERS ---');
  for (const u of users) {
    if (u.email.includes('hr') || u.email.includes('nahin') || (u.name && u.name.toLowerCase().includes('nahin')) || (u.role && u.role.code === 'HR')) {
      console.log('User:', { id: u.id, email: u.email, name: u.name, role: u.role?.code, empId: u.employee?.id, empCode: u.employee?.employeeCode, empName: u.employee?.fullName });
    }
  }

  const emps = await prisma.employee.findMany({
    include: { department: true }
  });
  console.log('--- ALL EMPLOYEES MATCHING ---');
  for (const e of emps) {
    if ((e.workEmail && (e.workEmail.includes('hr') || e.workEmail.includes('nahin'))) || (e.fullName && (e.fullName.toLowerCase().includes('nahin') || e.fullName.toLowerCase().includes('hr')))) {
      console.log('Employee:', { id: e.id, employeeCode: e.employeeCode, fullName: e.fullName, workEmail: e.workEmail, jobTitle: e.jobTitle, department: e.department?.name });
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
