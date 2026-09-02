const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Migrating nahin.v@himalayaerp.com to hr@himalayaerp.com ---');
  
  // 1. Check if user with hr@himalayaerp.com already exists
  const existingHrUser = await prisma.user.findUnique({ where: { email: 'hr@himalayaerp.com' } });
  const nahinUser = await prisma.user.findUnique({ where: { email: 'nahin.v@himalayaerp.com' } });

  if (nahinUser) {
    if (!existingHrUser) {
      await prisma.user.update({
        where: { id: nahinUser.id },
        data: {
          email: 'hr@himalayaerp.com'
        }
      });
      console.log('✅ Updated User email from nahin.v@himalayaerp.com to hr@himalayaerp.com (id:', nahinUser.id, ')');
    } else {
      console.log('ℹ️ hr@himalayaerp.com already exists as user id:', existingHrUser.id);
    }
  }

  // 2. Update Employee workEmail and personalEmail if matching nahin.v
  const matchingEmployees = await prisma.employee.findMany({
    where: {
      OR: [
        { workEmail: 'nahin.v@himalayaerp.com' },
        { personalEmail: 'nahin.v@himalayaerp.com' }
      ]
    }
  });

  for (const emp of matchingEmployees) {
    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        workEmail: 'hr@himalayaerp.com',
        personalEmail: emp.personalEmail === 'nahin.v@himalayaerp.com' ? 'hr@himalayaerp.com' : emp.personalEmail
      }
    });
    console.log(`✅ Updated Employee ${emp.employeeCode} (${emp.fullName}) workEmail to hr@himalayaerp.com`);
  }

  console.log('--- Migration Finished Successfully ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
