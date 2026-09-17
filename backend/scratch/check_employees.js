const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    const emps = await prisma.employee.findMany({
      take: 10,
      include: {
        department: true,
        user: { include: { role: true } },
        salaryStructures: true,
      },
    });
    console.log('Sample employees:');
    for (const e of emps) {
      console.log(`- ${e.fullName} (${e.employeeCode}) | Dept: ${e.department?.name} | Job: ${e.jobTitle} | User: ${e.user?.email} (Role: ${e.user?.role?.name}) | Structures: ${e.salaryStructures.length}`);
    }

    const salesEmps = await prisma.employee.findMany({
      where: {
        OR: [
          { fullName: { contains: 'Sales', mode: 'insensitive' } },
          { jobTitle: { contains: 'Sales', mode: 'insensitive' } },
        ]
      },
      include: { user: { include: { role: true } } }
    });
    console.log('\nSales employees:');
    for (const s of salesEmps) {
      console.log(`- ${s.fullName} (${s.employeeCode}) | User: ${s.user?.email} | Role: ${s.user?.role?.name}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
