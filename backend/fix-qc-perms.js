const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.findUnique({ where: { code: 'QC_INSPECTOR' } });
  if (!role) {
    console.log('QC_INSPECTOR role not found');
    return;
  }
  
  const perms = await prisma.permission.findMany({
    where: { code: { in: ['production.qc.read', 'production.qc.inspect', 'production.qc.approve', 'production.qc.reject', 'production.floor.read'] } }
  });
  
  console.log('Found perms:', perms.map(p => p.code));
  
  for (const p of perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
      update: {},
      create: { roleId: role.id, permissionId: p.id }
    });
  }
  console.log('Successfully added permissions to QC_INSPECTOR!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
