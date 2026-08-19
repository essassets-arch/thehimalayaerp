const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== ATTENDANCE RECORD AUDIT ===');
  const allRecords = await prisma.attendance.findMany({
    include: {
      employee: true,
      user: true
    }
  });
  console.log(`Total attendance records in DB: ${allRecords.length}`);
  allRecords.forEach(r => {
    console.log(`- ID: ${r.id}, Date: ${r.attendanceDate.toISOString()}, EmpCode: ${r.employee?.employeeCode}, UserEmail: ${r.user?.email}, Status: ${r.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
