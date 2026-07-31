const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.findUnique({ where: { code: 'PLANT_HEAD' } });
  if (!role) return console.log('Role not found');
  
  const perms = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'production.plan.read', 'production.plan.create', 'production.plan.approve', 'production.plan.release',
          'production.workorder.read', 'production.workorder.start', 'production.workorder.complete', 'production.workorder.update',
          'qc.inspection.read'
        ]
      }
    }
  });

  for (const perm of perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: { roleId: role.id, permissionId: perm.id }
    });
  }
  console.log('Permissions updated for PLANT_HEAD');
}

main().finally(() => prisma.$disconnect());
