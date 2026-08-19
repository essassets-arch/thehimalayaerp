const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  console.log('=== LIST COMPANY ATTENDANCE FOR TODAY ===');
  
  // 1. Logs mode
  const fromDate = new Date('2026-08-19');
  const toDate = new Date('2026-08-19');
  
  // Helper (duplicate backend's time calculation)
  const getKolkataDate = (date) => {
    const startOfDay = new Date('2026-08-19T00:00:00.000+05:30');
    const endOfDay = new Date('2026-08-19T23:59:59.999+05:30');
    return { startOfDay, endOfDay };
  };
  
  const { startOfDay, endOfDay } = getKolkataDate(fromDate);
  
  console.log(`Querying between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
  
  const logs = await prisma.attendance.findMany({
    where: {
      companyId,
      attendanceDate: { gte: startOfDay, lte: endOfDay }
    },
    include: {
      employee: {
        include: {
          department: true,
          workLocation: true
        }
      }
    }
  });

  console.log(`Logs found: ${logs.length}`);
  logs.forEach(l => {
    console.log(`- EmpCode: ${l.employee?.employeeCode}, Name: ${l.employee?.fullName}, Status: ${l.status}, Date: ${l.attendanceDate.toISOString()}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
