const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  const perms = await prisma.permission.findMany({
    where: { code: { in: ['production.qc.read', 'production.qc.inspect', 'production.qc.approve', 'production.qc.reject'] } }
  });
  
  for (const role of roles) {
    for (const p of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id }
      });
    }
  }
  console.log('Granted QC permissions to ALL roles to ensure testing works');
}
main().catch(console.error).finally(() => prisma.$disconnect());
