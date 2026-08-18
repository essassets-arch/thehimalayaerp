const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugEndpoints() {
  console.log('=== DEBUGGING ATTENDANCE & PAYROLL 500 ERRORS ===');

  try {
    const user = await prisma.user.findFirst({
      where: { role: { code: 'FINANCE_MANAGER' } },
      include: { role: true, employee: true }
    });
    console.log('Found Finance Manager User:', user?.id, 'Email:', user?.email, 'CompanyId:', user?.companyId);

    // Test Today Attendance
    console.log('\n--- Testing Attendance me/today ---');
    const now = new Date();
    const startOfDay = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000+05:30`);
    
    const whereConditions = [{ userId: user.id }];
    if (user?.employee?.id) whereConditions.push({ employeeId: user.employee.id });

    const attendanceRecord = await prisma.attendance.findFirst({
      where: {
        OR: whereConditions,
        ...(user.companyId && { companyId: user.companyId }),
        attendanceDate: startOfDay,
      },
    });
    console.log('Attendance Record Found:', attendanceRecord);

    // Test List Attendance
    console.log('\n--- Testing List Attendance ---');
    const listCount = await prisma.attendance.count({});
    console.log('Total Attendance Records in DB:', listCount);

    // Test Payroll
    console.log('\n--- Testing HR Payroll ---');
    const payrollCount = await prisma.payrollRecord.count({});
    console.log('Total Payroll Records in DB:', payrollCount);

  } catch (err) {
    console.error('DEBUG EXCEPTION:', err);
  } finally {
    await prisma.$disconnect();
  }
}

debugEndpoints();
