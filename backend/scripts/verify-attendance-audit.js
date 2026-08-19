const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== AUDITING TARGET 17 ACCOUNTS MAPPINGS ===');
  const targetEmails = [
    'supersales1@himalayaerp.com',
    'supersales2@himalayaerp.com',
    'sales1@himalayaerp.com',
    'sales2@himalayaerp.com',
    'sales3@himalayaerp.com',
    'sales4@himalayaerp.com',
    'sales5@himalayaerp.com',
    'sales6@himalayaerp.com',
    'sales7@himalayaerp.com',
    'plant.head@himalayaerp.com',
    'production.operator@himalayaerp.com',
    'ravikant.tiwari@himalayaerp.com',
    'sahad.dispatch@himalayaerp.com',
    'finance.executive@himalayaerp.com',
    'sahad.accounts@himalayaerp.com',
    'store.manager@himalayaerp.com',
    'hr@himalayaerp.com'
  ];

  const mappings = await prisma.user.findMany({
    where: { email: { in: targetEmails } },
    include: { employee: true, role: true }
  });

  console.log(`Matched ${mappings.length} out of 17 target users.`);
  mappings.forEach(u => {
    console.log(`- Email: ${u.email}`);
    console.log(`  Role: ${u.role?.code || 'NONE'}`);
    console.log(`  User ID: ${u.id}`);
    console.log(`  Employee ID: ${u.employee ? u.employee.id : 'MISSING'}`);
    console.log(`  Employee Code: ${u.employee ? u.employee.employeeCode : 'MISSING'}`);
    console.log(`  Company ID: ${u.companyId}`);
  });

  console.log('\n=== TODAY\'S ACTUAL ATTENDANCE RECORDS ===');
  const todayRecords = await prisma.attendance.findMany({
    include: {
      employee: true
    },
    orderBy: { punchInAt: 'desc' }
  });
  console.log(`Total attendance records found: ${todayRecords.length}`);
  todayRecords.forEach(r => {
    console.log(`- EmpCode: ${r.employee?.employeeCode || 'NONE'}`);
    console.log(`  FullName: ${r.employee?.fullName || 'NONE'}`);
    console.log(`  Email: ${r.employee?.workEmail || 'NONE'}`);
    console.log(`  Date: ${r.attendanceDate.toISOString()}`);
    console.log(`  PunchIn: ${r.punchInAt ? r.punchInAt.toISOString() : '—'}`);
    console.log(`  PunchOut: ${r.punchOutAt ? r.punchOutAt.toISOString() : '—'}`);
    console.log(`  Status: ${r.status}`);
    console.log(`  SelfieUrl: ${r.punchInSelfieUrl}`);
    console.log(`  CompanyId: ${r.companyId}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
