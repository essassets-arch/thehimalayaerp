const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const perms = await prisma.permission.findMany({
    where: { code: { in: ['qc.inspection.read', 'qc.inspection.approve'] } }
  });
  const roles = await prisma.role.findMany({
    where: { code: { in: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PLANT_HEAD', 'QC_INSPECTOR'] } }
  });

  for (const role of roles) {
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
  console.log('Permissions updated!');
}
run().finally(() => prisma.$disconnect());
