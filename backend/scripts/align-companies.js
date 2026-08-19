const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== ALIGNING COMPANIES TO 88c57ebc-b3b7-49e3-8d5d-6321a0e89015 ===');
  const targetCompanyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  // Update all users
  const usersRes = await prisma.user.updateMany({
    where: { companyId: { not: targetCompanyId } },
    data: { companyId: targetCompanyId }
  });
  console.log(`Updated ${usersRes.count} users.`);

  // Update all employees
  const employeesRes = await prisma.employee.updateMany({
    where: { companyId: { not: targetCompanyId } },
    data: { companyId: targetCompanyId }
  });
  console.log(`Updated ${employeesRes.count} employees.`);

  // Update all departments
  const departmentsRes = await prisma.department.updateMany({
    where: { companyId: { not: targetCompanyId } },
    data: { companyId: targetCompanyId }
  });
  console.log(`Updated ${departmentsRes.count} departments.`);

  // Update all work locations
  const locationsRes = await prisma.workLocation.updateMany({
    where: { companyId: { not: targetCompanyId } },
    data: { companyId: targetCompanyId }
  });
  console.log(`Updated ${locationsRes.count} work locations.`);

  // Update all attendance records
  const attendanceRes = await prisma.attendance.updateMany({
    where: { companyId: { not: targetCompanyId } },
    data: { companyId: targetCompanyId }
  });
  console.log(`Updated ${attendanceRes.count} attendance records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
