const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const perms = await prisma.permission.findMany({
    where: { code: { startsWith: 'dispatch' } }
  });
  console.log(perms.map(p => p.code));

  const roles = await prisma.role.findMany();
  
  for (const role of roles) {
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
  console.log('Permissions updated for all roles to include dispatch!');
}
run().finally(() => prisma.$disconnect());
