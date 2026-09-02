const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Migrating nahin.v@himalayaerp.com to hr@himalayaerp.com ---');

  const hrPasswordHash = await bcrypt.hash('HR@hcppl', 12);
  
  // 1. Check users
  const existingHrUser = await prisma.user.findUnique({ where: { email: 'hr@himalayaerp.com' } });
  const nahinUser = await prisma.user.findUnique({ where: { email: 'nahin.v@himalayaerp.com' } });

  let targetUserId = null;

  if (existingHrUser && nahinUser) {
    console.log('ℹ️ Both hr@ and nahin.v@ users exist. Harmonizing...');
    // Update password of hr@ user
    await prisma.user.update({
      where: { id: existingHrUser.id },
      data: { password: hrPasswordHash, isActive: true, name: nahinUser.name || 'Nahin V' }
    });
    // Relink any employees pointing to nahinUser to existingHrUser
    await prisma.employee.updateMany({
      where: { userId: nahinUser.id },
      data: { userId: existingHrUser.id }
    });
    // Remove obsolete nahinUser
    try {
      await prisma.user.delete({ where: { id: nahinUser.id } });
      console.log('✅ Removed duplicate user nahin.v@himalayaerp.com');
    } catch (e) {
      console.log('ℹ️ Kept nahinUser id due to foreign key constraints, updated email to backup.');
      await prisma.user.update({
        where: { id: nahinUser.id },
        data: { email: `nahin.v.migrated.${Date.now()}@himalayaerp.com` }
      });
    }
    targetUserId = existingHrUser.id;
  } else if (nahinUser && !existingHrUser) {
    await prisma.user.update({
      where: { id: nahinUser.id },
      data: {
        email: 'hr@himalayaerp.com',
        password: hrPasswordHash,
      }
    });
    console.log('✅ Updated User email from nahin.v@himalayaerp.com to hr@himalayaerp.com');
    targetUserId = nahinUser.id;
  } else if (existingHrUser) {
    await prisma.user.update({
      where: { id: existingHrUser.id },
      data: { password: hrPasswordHash, isActive: true }
    });
    console.log('✅ Updated existing hr@himalayaerp.com user password to HR@hcppl');
    targetUserId = existingHrUser.id;
  }

  // 2. Check Employees
  const existingHrEmp = await prisma.employee.findFirst({ where: { workEmail: 'hr@himalayaerp.com' } });
  const nahinEmps = await prisma.employee.findMany({
    where: {
      OR: [
        { workEmail: 'nahin.v@himalayaerp.com' },
        { personalEmail: 'nahin.v@himalayaerp.com' }
      ]
    }
  });

  if (existingHrEmp) {
    console.log(`ℹ️ Employee with workEmail: hr@himalayaerp.com already exists (id: ${existingHrEmp.id}, code: ${existingHrEmp.employeeCode})`);
    if (targetUserId) {
      await prisma.employee.update({
        where: { id: existingHrEmp.id },
        data: { userId: targetUserId }
      });
    }

    for (const emp of nahinEmps) {
      if (emp.id !== existingHrEmp.id) {
        // Change duplicate nahin emp workEmail to backup or link
        await prisma.employee.update({
          where: { id: emp.id },
          data: {
            workEmail: `nahin.v.old.${Date.now()}@himalayaerp.com`,
            personalEmail: null
          }
        });
        console.log(`✅ Shifted legacy duplicate employee ${emp.employeeCode} email to avoid unique conflict.`);
      }
    }
  } else {
    for (const emp of nahinEmps) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: {
          workEmail: 'hr@himalayaerp.com',
          personalEmail: emp.personalEmail === 'nahin.v@himalayaerp.com' ? 'hr@himalayaerp.com' : emp.personalEmail,
          userId: targetUserId || emp.userId
        }
      });
      console.log(`✅ Updated Employee ${emp.employeeCode} (${emp.fullName}) workEmail to hr@himalayaerp.com`);
    }
  }

  console.log('--- Migration Finished Successfully ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
