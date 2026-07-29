const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const role = await prisma.role.findUnique({ where: { code: 'DISPATCH_EXECUTIVE' } });
  if (!role) return console.log('Role not found');
  
  const codes = ['sales.order.read', 'sales.customer.read', 'sales.lead.read', 'qc.read'];
  for (const code of codes) {
    let perm = await prisma.permission.findUnique({ where: { code } });
    if (!perm) {
      perm = await prisma.permission.create({ data: { code, name: code } });
    }
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: { roleId: role.id, permissionId: perm.id },
    });
  }
  console.log('Granted permissions to Dispatch Executive');
}
run().finally(() => prisma.$disconnect());
