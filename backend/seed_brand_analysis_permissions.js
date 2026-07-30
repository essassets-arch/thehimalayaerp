const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissionsToSeed = [
  { code: 'store.brand-analysis.create', name: 'Create Brand Analysis Request' },
  { code: 'store.brand-analysis.read', name: 'Read Store Brand Analysis Requests' },
  { code: 'store.brand-analysis.update', name: 'Update Pending Brand Analysis Request' },
  { code: 'store.brand-analysis.cancel', name: 'Cancel Brand Analysis Request' },
  { code: 'super-admin.brand-analysis.read', name: 'Read All Brand Analysis Requests' },
  { code: 'super-admin.brand-analysis.approve', name: 'Approve Brand Analysis Request' },
  { code: 'super-admin.brand-analysis.reject', name: 'Reject Brand Analysis Request' },
  { code: 'finance.brand-analysis.read', name: 'Read Approved Brand Analysis Requests' },
  { code: 'finance.brand-analysis.start', name: 'Start Brand Analysis' },
  { code: 'finance.brand-analysis.complete', name: 'Complete Brand Analysis' },
];

async function seed() {
  console.log('Seeding permissions...');
  
  for (const perm of permissionsToSeed) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name },
      create: {
        id: require('crypto').randomUUID(),
        publicId: require('crypto').randomUUID(),
        code: perm.code,
        name: perm.name,
      }
    });
  }

  // Assign to roles
  const assignToRole = async (roleName, permissions) => {
    const role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) {
      console.log(`Role ${roleName} not found, skipping.`);
      return;
    }

    for (const code of permissions) {
      const p = await prisma.permission.findUnique({ where: { code } });
      if (p) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: p.id,
            }
          },
          update: {},
          create: {
            id: require('crypto').randomUUID(),
            roleId: role.id,
            permissionId: p.id,
          }
        });
      }
    }
  };

  // Assigning
  await assignToRole('Store Manager', [
    'store.brand-analysis.create',
    'store.brand-analysis.read',
    'store.brand-analysis.update',
    'store.brand-analysis.cancel',
  ]);

  await assignToRole('Super Admin', [
    'super-admin.brand-analysis.read',
    'super-admin.brand-analysis.approve',
    'super-admin.brand-analysis.reject',
  ]);

  await assignToRole('Finance Manager', [
    'finance.brand-analysis.read',
    'finance.brand-analysis.start',
    'finance.brand-analysis.complete',
  ]);

  console.log('Permissions seeded and assigned successfully.');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
