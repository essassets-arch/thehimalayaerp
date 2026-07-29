const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const role = await prisma.role.findUnique({ where: { code: 'DISPATCH_EXECUTIVE' } });
  if (!role) return console.log('Role not found');
  
  const codes = ['sales.orders.read', 'sales.customers.read', 'sales.leads.read', 'qc.inspection.read'];
  for (const code of codes) {
    let perm = await prisma.permission.findUnique({ where: { code } });
    if (!perm) {
      console.log(`Permission ${code} not found, skipping.`);
      continue;
    }
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: { roleId: role.id, permissionId: perm.id },
    });
  }
  console.log('Granted read permissions to Dispatch Executive');
}
run().finally(() => prisma.$disconnect());
