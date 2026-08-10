const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ROLE_PERMISSIONS = {
  SALES_EXECUTIVE: [
    // Customers
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    // Leads
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.convert',
    // Quotations
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send',
    'crm.quotation.read', 'crm.quotation.create', 'crm.quotation.update',
    'quotation.read', 'quotation.create', 'quotation.update', 'quotation.send',
    // Orders
    'sales.orders.read', 'sales.orders.create', 'sales.orders.update',
    // Samples
    'admin.samples.read', 'admin.samples.create', 'admin.samples.update',
    'sample.read', 'sample.create', 'sample.dispatch', 'sample.update',
    // Products
    'products.read', 'admin.products.read',
    // Warehouses & Stock
    'warehouses.read', 'inventory.warehouses.read', 'inventory.stock.read', 'inventory.inventory.read',
    // Suppliers & Vendors
    'suppliers.read', 'procurement.suppliers.read', 'vendors.read',
    // Dashboard & Reports
    'sales.dashboard.read', 'sales.salesreports.read', 'sales.targets.read', 'reports.sales',
    // Payments & Invoices
    'finance.payment.read', 'finance.payment.create', 'payment.read', 'invoice.read', 'finance.invoice.read',
    // Complaints
    'sales.customercomplaints.read', 'sales.customercomplaints.create', 'complaint.read', 'complaint.create',
    // Returns & Replacements
    'sales.salesreturns.read', 'sales.salesreturns.create', 'return.read', 'return.create',
    'admin.replacements.read', 'admin.replacements.create', 'replacement.read', 'replacement.create',
  ],
  SALES_MANAGER: [
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.delete', 'sales.leads.convert',
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send', 'crm.quotations.accept', 'crm.quotations.convert', 'crm.quotations.delete',
    'crm.quotation.read', 'crm.quotation.create', 'crm.quotation.update',
    'quotation.read', 'quotation.create', 'quotation.update', 'quotation.send', 'quotation.accept',
    'sales.orders.read', 'sales.orders.create', 'sales.orders.update', 'sales.orders.approve',
    'admin.samples.read', 'admin.samples.create', 'admin.samples.update', 'sample.read', 'sample.create',
    'products.read', 'admin.products.read',
    'warehouses.read', 'inventory.warehouses.read', 'inventory.stock.read', 'inventory.inventory.read',
    'suppliers.read', 'procurement.suppliers.read', 'vendors.read',
    'sales.dashboard.read', 'sales.salesreports.read', 'sales.targets.read', 'sales.targets.create', 'sales.targets.update', 'reports.sales',
    'finance.payment.read', 'finance.payment.create', 'payment.read', 'invoice.read', 'finance.invoice.read',
    'sales.customercomplaints.read', 'sales.customercomplaints.create', 'sales.customercomplaints.approve',
    'sales.salesreturns.read', 'sales.salesreturns.create', 'sales.salesreturns.approve',
    'admin.replacements.read', 'admin.replacements.create', 'admin.replacements.approve',
  ],
  SUPER_SALES: [
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.delete', 'sales.leads.convert',
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send', 'crm.quotations.accept', 'crm.quotations.convert', 'crm.quotations.delete',
    'crm.quotation.read', 'crm.quotation.create', 'crm.quotation.update',
    'quotation.read', 'quotation.create', 'quotation.update', 'quotation.send', 'quotation.accept',
    'sales.orders.read', 'sales.orders.create', 'sales.orders.update', 'sales.orders.approve',
    'admin.samples.read', 'admin.samples.create', 'admin.samples.update', 'sample.read', 'sample.create',
    'products.read', 'admin.products.read',
    'warehouses.read', 'inventory.warehouses.read', 'inventory.stock.read', 'inventory.inventory.read',
    'suppliers.read', 'procurement.suppliers.read', 'vendors.read',
    'sales.dashboard.read', 'sales.salesreports.read', 'sales.targets.read', 'reports.sales',
    'finance.payment.read', 'finance.payment.create', 'payment.read', 'invoice.read', 'finance.invoice.read',
    'sales.customercomplaints.read', 'sales.customercomplaints.create', 'sales.customercomplaints.approve',
    'sales.salesreturns.read', 'sales.salesreturns.create', 'sales.salesreturns.approve',
    'admin.replacements.read', 'admin.replacements.create', 'admin.replacements.approve',
  ],
};

function uid(prefix) {
  const bytes = require('crypto').randomBytes(8).toString('hex');
  return `${prefix}-${bytes}`;
}

async function main() {
  console.log('🔄 Aligning permissions for sales roles (SALES_EXECUTIVE, SALES_MANAGER, SUPER_SALES, SUPER_ADMIN)...');

  // Collect all unique permission codes
  const allNeededCodes = new Set();
  Object.values(ROLE_PERMISSIONS).forEach(perms => perms.forEach(p => allNeededCodes.add(p)));

  // Ensure all permissions exist in DB
  for (const code of allNeededCodes) {
    await prisma.permission.upsert({
      where: { code },
      update: { name: code },
      create: { publicId: uid('PERM'), name: code, code },
    });
  }

  // Get all permissions from DB
  const dbPermissions = await prisma.permission.findMany();
  const permMap = Object.fromEntries(dbPermissions.map(p => [p.code, p.id]));

  // Ensure SUPER_ADMIN and ADMIN have ALL permissions
  const adminRoles = await prisma.role.findMany({
    where: { code: { in: ['SUPER_ADMIN', 'ADMIN'] } },
  });
  for (const role of adminRoles) {
    for (const perm of dbPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
    console.log(`✅ Granted ALL (${dbPermissions.length}) permissions to ${role.code}`);
  }

  // Assign specific permissions to roles
  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findFirst({
      where: { OR: [{ code: roleCode }, { name: roleCode }] },
    });
    if (!role) {
      console.warn(`⚠️ Role ${roleCode} not found in DB`);
      continue;
    }

    let count = 0;
    for (const code of permCodes) {
      const permId = permMap[code];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
        count++;
      }
    }
    console.log(`✅ Granted ${count} permissions to ${roleCode} (${role.name})`);
  }

  console.log('🎉 Successfully aligned all sales role permissions!');
}

main()
  .catch(err => {
    console.error('❌ Error aligning permissions:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
