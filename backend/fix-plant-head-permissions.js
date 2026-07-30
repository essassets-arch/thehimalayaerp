const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const newPerms = [
    'procurement.purchase_orders.read',
    'procurement.purchase_orders.closure_read',
    'procurement.grns.read',
    'procurement.vendor_invoices.read',
    'procurement.vendor_payments.read',
    'procurement.audit.read'
  ];

  const role = await p.role.findUnique({ where: { code: 'PLANT_HEAD' } });
  if (!role) { console.log('PLANT_HEAD role not found'); return; }

  const permissions = await p.permission.findMany({ where: { code: { in: newPerms } } });
  console.log('Found permissions to assign:', permissions.map(x => x.code));

  let assigned = 0;
  for (const perm of permissions) {
    await p.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: { roleId: role.id, permissionId: perm.id }
    });
    assigned++;
  }

  // Check for any missing perms (not found in DB)
  const foundCodes = permissions.map(x => x.code);
  const missing = newPerms.filter(c => !foundCodes.includes(c));
  if (missing.length > 0) {
    console.log('WARNING: These permissions do not exist in the DB yet, creating them...');
    for (const code of missing) {
      const created = await p.permission.create({ data: { code, description: code } });
      await p.rolePermission.create({ data: { roleId: role.id, permissionId: created.id } });
      console.log(' Created & assigned:', code);
    }
  }

  console.log('Done - assigned', assigned, 'existing permissions to PLANT_HEAD');
  await p.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
