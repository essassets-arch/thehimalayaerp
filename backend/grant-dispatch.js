const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function fix() {
  const role = await prisma.role.findFirst({ where: { code: 'DISPATCH_EXECUTIVE' } });
  const perm = await prisma.permission.findFirst({ where: { code: 'production.workorder.complete' } });
  
  if (role && perm) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: {
        id: crypto.randomUUID(),
        roleId: role.id,
        permissionId: perm.id
      }
    });
    console.log('Granted production.workorder.complete to Dispatch Executive');
  } else {
    console.log('Role or Permission not found');
  }
}

fix().then(() => prisma.$disconnect());
