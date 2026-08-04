import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CANONICAL_PERMISSIONS = [
  { code: 'admin.dashboard.read', name: 'View Admin Dashboard' },
  { code: 'admin.users.manage', name: 'Manage Users' },
  { code: 'admin.roles.manage', name: 'Manage Roles & Permissions' },
  { code: 'admin.audit.read', name: 'View System Audit Logs' },
  { code: 'admin.planthead.read', name: 'View Plant Head Workspace' },
  { code: 'planthead.read', name: 'Plant Head Read' },
  { code: 'sales.leads.read', name: 'View Sales Leads' },
  { code: 'sales.leads.create', name: 'Create Sales Lead' },
  { code: 'sales.orders.read', name: 'View Sales Orders' },
  { code: 'sales.orders.create', name: 'Create Sales Order' },
  { code: 'sales.customers.read', name: 'View Customers' },
  { code: 'sales.customers.create', name: 'Create Customer' },
  { code: 'inventory.stock.read', name: 'View Stock Levels' },
  { code: 'inventory.items.manage', name: 'Manage Inventory Items' },
  { code: 'production.plans.read', name: 'View Production Plans' },
  { code: 'production.work_orders.manage', name: 'Manage Work Orders' },
  { code: 'qc.inspections.read', name: 'View QC Inspections' },
  { code: 'dispatch.shipments.read', name: 'View Shipments' },
  { code: 'dispatch.shipments.create', name: 'Create Shipment' },
  { code: 'finance.invoices.read', name: 'View Invoices' },
  { code: 'finance.payments.manage', name: 'Manage Payments' },
  { code: 'hr.employees.read', name: 'View HR Roster' },
  { code: 'hr.payroll.read', name: 'View Payroll Data' }
];

async function alignSeed() {
  console.log('[Seed Alignment] Executing idempotent seed alignment...');

  // 1. Upsert Permissions
  const createdPerms: string[] = [];
  for (const perm of CANONICAL_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({ where: { code: perm.code } });
    if (!existing) {
      const created = await prisma.permission.create({
        data: {
          publicId: `PERM-${perm.code.replace(/\./g, '-').toUpperCase()}`,
          name: perm.name,
          code: perm.code
        }
      });
      createdPerms.push(created.code);
    }
  }

  console.log(`[Seed Alignment] Permissions check done. New permissions created: ${createdPerms.length}`);

  // 2. Fetch Super Admin & Admin Roles
  const superAdminRole = await prisma.role.findFirst({
    where: { OR: [{ code: 'SUPER_ADMIN' }, { name: 'Super Admin' }] }
  });

  const plantHeadRole = await prisma.role.findFirst({
    where: { OR: [{ code: 'PLANT_HEAD' }, { name: 'Plant Head' }] }
  });

  const allPermissions = await prisma.permission.findMany();

  // 3. Ensure Super Admin role has all permissions
  if (superAdminRole) {
    for (const perm of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: perm.id
          }
        },
        create: {
          roleId: superAdminRole.id,
          permissionId: perm.id
        },
        update: {}
      });
    }
    console.log(`[Seed Alignment] Super Admin role permissions aligned (${allPermissions.length} permissions linked).`);
  }

  // 4. Ensure Plant Head role permissions
  if (plantHeadRole) {
    const plantHeadPermCodes = [
      'admin.planthead.read',
      'planthead.read',
      'sales.customers.read',
      'sales.orders.read',
      'inventory.stock.read',
      'production.plans.read',
      'qc.inspections.read'
    ];
    for (const code of plantHeadPermCodes) {
      const perm = allPermissions.find(p => p.code === code);
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: plantHeadRole.id,
              permissionId: perm.id
            }
          },
          create: {
            roleId: plantHeadRole.id,
            permissionId: perm.id
          },
          update: {}
        });
      }
    }
    console.log(`[Seed Alignment] Plant Head role permissions aligned.`);
  }

  console.log('[Seed Alignment] Idempotent seed alignment completed safely with ZERO data loss.');
}

alignSeed()
  .catch(err => {
    console.error('[Seed Alignment] Error during alignment:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
