const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });

async function seedUser() {
  const admin = await p.user.findFirst({
    where: { email: 'super.admin@himalayaerp.com' }
  });
  console.log('Superadmin found:', !!admin, 'companyId:', admin.companyId);

  let opRole = await p.role.findFirst({
    where: { code: 'PRODUCTION_OPERATOR' }
  });
  if (!opRole) {
    opRole = await p.role.findFirst({
      where: { code: 'PRODUCTION_PLANNER' }
    });
  }

  let opUser = await p.user.findUnique({
    where: { email: 'production.operator@himalayaerp.com' }
  });

  if (!opUser && admin) {
    opUser = await p.user.create({
      data: {
        publicId: 'USR-PROD-OP-' + Date.now(),
        name: 'Production Operator',
        email: 'production.operator@himalayaerp.com',
        password: admin.password,
        roleId: opRole ? opRole.id : admin.roleId,
        companyId: admin.companyId,
        isActive: true
      }
    });
    console.log('Created production.operator@himalayaerp.com');
  } else if (opUser && admin) {
    await p.user.update({
      where: { email: 'production.operator@himalayaerp.com' },
      data: { password: admin.password, isActive: true, failedLoginAttempts: 0, lockedUntil: null }
    });
    console.log('Updated production.operator@himalayaerp.com password');
  }

  console.log('Done!');
  await p.$disconnect();
}
seedUser();
