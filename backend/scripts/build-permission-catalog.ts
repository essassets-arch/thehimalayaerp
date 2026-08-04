import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const CANONICAL_PERMISSIONS = [
  // Authentication & System
  { code: 'admin.dashboard.read', name: 'View Admin Dashboard', module: 'Administration', resource: 'Dashboard', action: 'read' },
  { code: 'admin.users.manage', name: 'Manage Users', module: 'Administration', resource: 'Users', action: 'manage' },
  { code: 'admin.roles.manage', name: 'Manage Roles & Permissions', module: 'Administration', resource: 'Roles', action: 'manage' },
  { code: 'admin.audit.read', name: 'View System Audit Logs', module: 'Administration', resource: 'AuditLogs', action: 'read' },
  { code: 'admin.planthead.read', name: 'View Plant Head Workspace', module: 'Administration', resource: 'PlantHead', action: 'read' },
  
  // Sales & CRM
  { code: 'sales.leads.read', name: 'View Sales Leads', module: 'Sales', resource: 'Leads', action: 'read' },
  { code: 'sales.leads.create', name: 'Create Sales Lead', module: 'Sales', resource: 'Leads', action: 'create' },
  { code: 'sales.orders.read', name: 'View Sales Orders', module: 'Sales', resource: 'Orders', action: 'read' },
  { code: 'sales.orders.create', name: 'Create Sales Order', module: 'Sales', resource: 'Orders', action: 'create' },
  { code: 'sales.customers.read', name: 'View Customers', module: 'Sales', resource: 'Customers', action: 'read' },
  { code: 'sales.customers.create', name: 'Create Customer', module: 'Sales', resource: 'Customers', action: 'create' },

  // Inventory & Store
  { code: 'inventory.stock.read', name: 'View Stock Levels', module: 'Store', resource: 'Inventory', action: 'read' },
  { code: 'inventory.items.manage', name: 'Manage Inventory Items', module: 'Store', resource: 'Inventory', action: 'manage' },
  
  // Production & QC
  { code: 'production.plans.read', name: 'View Production Plans', module: 'Production', resource: 'ProductionPlans', action: 'read' },
  { code: 'production.work_orders.manage', name: 'Manage Work Orders', module: 'Production', resource: 'WorkOrders', action: 'manage' },
  { code: 'qc.inspections.read', name: 'View QC Inspections', module: 'QC', resource: 'Inspections', action: 'read' },

  // Dispatch & Logistics
  { code: 'dispatch.shipments.read', name: 'View Shipments', module: 'Dispatch', resource: 'Shipments', action: 'read' },
  { code: 'dispatch.shipments.create', name: 'Create Shipment', module: 'Dispatch', resource: 'Shipments', action: 'create' },

  // Finance & Accounts
  { code: 'finance.invoices.read', name: 'View Invoices', module: 'Finance', resource: 'Invoices', action: 'read' },
  { code: 'finance.payments.manage', name: 'Manage Payments', module: 'Finance', resource: 'Payments', action: 'manage' },

  // HR & Employees
  { code: 'hr.employees.read', name: 'View HR Roster', module: 'HR', resource: 'Employees', action: 'read' },
  { code: 'hr.payroll.read', name: 'View Payroll Data', module: 'HR', resource: 'Payroll', action: 'read' }
];

async function buildPermissionCatalog() {
  console.log('[Permission Catalog] Scanning permissions database and building permissions catalog...');

  const dbPermissions = await prisma.permission.findMany({
    include: {
      rolePermissions: {
        include: { role: true }
      }
    }
  });

  const catalog = CANONICAL_PERMISSIONS.map(p => {
    const matchedInDb = dbPermissions.find(dbP => dbP.code === p.code);
    const assignedRoles = matchedInDb 
      ? matchedInDb.rolePermissions.map(rp => rp.role.name)
      : [];
    
    return {
      ...p,
      existsInDb: !!matchedInDb,
      assignedRolesCount: assignedRoles.length,
      assignedRoles
    };
  });

  const catalogData = {
    timestamp: new Date().toISOString(),
    totalCanonicalPermissions: CANONICAL_PERMISSIONS.length,
    dbPermissionsCount: dbPermissions.length,
    catalog
  };

  const docsDir = path.join(__dirname, '../../docs/super-admin');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Save JSON
  fs.writeFileSync(
    path.join(docsDir, 'permission-catalog.json'),
    JSON.stringify(catalogData, null, 2),
    'utf-8'
  );

  // Save Markdown
  let mdContent = `# Permission Catalog & RBAC Audit

**Generated Date**: ${catalogData.timestamp}
**Total Canonical Permissions**: ${catalogData.totalCanonicalPermissions}
**Database Permissions Count**: ${catalogData.dbPermissionsCount}

## System Permissions Matrix

| Permission Code | Module | Resource | Action | Assigned Roles |
| :--- | :--- | :--- | :--- | :--- |
`;

  catalog.forEach(item => {
    const rolesStr = item.assignedRoles.length > 0 ? item.assignedRoles.join(', ') : '_None_';
    mdContent += `| \`${item.code}\` | ${item.module} | ${item.resource} | ${item.action} | ${rolesStr} |\n`;
  });

  fs.writeFileSync(path.join(docsDir, 'permission-catalog.md'), mdContent, 'utf-8');

  console.log('[Permission Catalog] Catalog generated successfully in docs/super-admin/permission-catalog.json and .md');
}

buildPermissionCatalog()
  .catch(err => {
    console.error('[Permission Catalog] Error generating permission catalog:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
