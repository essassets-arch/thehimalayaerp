const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log(`=== FOUND ${employees.length} EMPLOYEES TO RE-SEQUENCE ===\n`);

  // First give temporary codes to avoid unique constraint collisions
  for (let i = 0; i < employees.length; i++) {
    await prisma.employee.update({
      where: { id: employees[i].id },
      data: {
        employeeCode: `TEMP-EMP-${i + 1}-${Date.now()}`
      }
    });
  }

  // Now assign clean sequential EMP-1, EMP-2, EMP-3, ...
  for (let i = 0; i < employees.length; i++) {
    const newCode = `EMP-${i + 1}`;
    const emp = employees[i];
    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        employeeCode: newCode,
        publicId: newCode
      }
    });
    console.log(`${newCode.padEnd(8)} | ${emp.fullName.padEnd(22)} | ${emp.workEmail || 'no-email'}`);
  }

  console.log('\n=== EMPLOYEE CODE SEQUENCE UPDATE COMPLETE ===\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
