const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Migrating nahin.v@himalayaerp.com to hr@himalayaerp.com ---');

  const hrPasswordHash = await bcrypt.hash('HR@hcppl', 12);
  
  // 1. Fetch relevant users
  const hrUser = await prisma.user.findUnique({ where: { email: 'hr@himalayaerp.com' } });
  const nahinUser = await prisma.user.findUnique({ where: { email: 'nahin.v@himalayaerp.com' } });

  // 2. Fetch all potentially conflicting employees
  const allEmployees = await prisma.employee.findMany({
    where: {
      OR: [
        { workEmail: 'hr@himalayaerp.com' },
        { workEmail: 'nahin.v@himalayaerp.com' },
        { personalEmail: 'nahin.v@himalayaerp.com' },
        ...(hrUser ? [{ userId: hrUser.id }] : []),
        ...(nahinUser ? [{ userId: nahinUser.id }] : [])
      ]
    }
  });

  console.log(`Found ${allEmployees.length} employee record(s) involved in migration.`);

  // 3. STEP A: Unlink userId and assign unique temporary emails to clear unique constraints
  for (const emp of allEmployees) {
    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        userId: null,
        workEmail: `temp.${emp.id.slice(0, 8)}.${Date.now()}@himalayaerp.com`,
        personalEmail: null
      }
    });
  }

  // 4. STEP B: Harmonize User accounts
  let targetUser = hrUser;
  if (!targetUser && nahinUser) {
    targetUser = await prisma.user.update({
      where: { id: nahinUser.id },
      data: {
        email: 'hr@himalayaerp.com',
        password: hrPasswordHash,
        isActive: true
      }
    });
    console.log('✅ Updated User email from nahin.v@ to hr@himalayaerp.com');
  } else if (targetUser) {
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        password: hrPasswordHash,
        isActive: true,
        name: 'Nahin V'
      }
    });
    console.log('✅ Updated hr@himalayaerp.com user password to HR@hcppl');

    if (nahinUser && nahinUser.id !== targetUser.id) {
      try {
        await prisma.user.delete({ where: { id: nahinUser.id } });
        console.log('✅ Removed duplicate user nahin.v@himalayaerp.com');
      } catch {
        await prisma.user.update({
          where: { id: nahinUser.id },
          data: { email: `nahin.v.archived.${Date.now()}@himalayaerp.com`, isActive: false }
        });
        console.log('ℹ️ Archived duplicate user nahin.v@himalayaerp.com');
      }
    }
  }

  // 5. STEP C: Select and establish primary HR employee
  // Prefer employee with code EMP-1 or EMP-HR-001 or earliest created
  const primaryEmp = allEmployees.find(e => e.employeeCode === 'EMP-1') ||
                     allEmployees.find(e => e.employeeCode === 'EMP-HR-001') ||
                     allEmployees[0];

  if (primaryEmp) {
    await prisma.employee.update({
      where: { id: primaryEmp.id },
      data: {
        workEmail: 'hr@himalayaerp.com',
        fullName: 'Nahin V',
        firstName: 'Nahin',
        lastName: 'V',
        jobTitle: 'HR Manager',
        status: 'ACTIVE',
        userId: targetUser ? targetUser.id : null
      }
    });
    console.log(`✅ Configured primary HR Employee: ${primaryEmp.employeeCode} (${primaryEmp.fullName}) -> hr@himalayaerp.com`);

    // Clean up any other duplicate employees
    for (const otherEmp of allEmployees) {
      if (otherEmp.id !== primaryEmp.id) {
        await prisma.employee.update({
          where: { id: otherEmp.id },
          data: {
            workEmail: `archived.${otherEmp.employeeCode}.${Date.now()}@himalayaerp.com`,
            userId: null
          }
        });
        console.log(`ℹ️ Archived secondary employee ${otherEmp.employeeCode}`);
      }
    }
  }

  console.log('--- Migration Finished Successfully ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
