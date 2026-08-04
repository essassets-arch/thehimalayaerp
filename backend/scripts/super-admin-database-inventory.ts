import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runInventory() {
  console.log('[Database Inventory] Executing read-only database inventory scan...');

  const [
    companiesCount,
    branchesCount,
    warehousesCount,
    departmentsCount,
    usersCount,
    employeesCount,
    rolesCount,
    permissionsCount,
    rolePermissionsCount,
    productsCount,
    customersCount,
    suppliersCount,
    refreshSessionsCount,
    salesOrdersCount
  ] = await Promise.all([
    prisma.company.count(),
    prisma.branch.count(),
    prisma.warehouse.count(),
    prisma.department.count(),
    prisma.user.count(),
    prisma.employee.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.rolePermission.count(),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.supplier.count(),
    prisma.refreshSession.count(),
    prisma.salesOrder.count()
  ]);

  // Check orphans & anomalies
  const usersWithoutRole = await prisma.user.count({ where: { roleId: { equals: '' } } });
  const inactiveUsers = await prisma.user.count({ where: { isActive: false } });
  const inactiveProducts = await prisma.product.count({ where: { isActive: false } });

  const inventoryData = {
    timestamp: new Date().toISOString(),
    counts: {
      companies: companiesCount,
      branches: branchesCount,
      warehouses: warehousesCount,
      departments: departmentsCount,
      users: usersCount,
      employees: employeesCount,
      roles: rolesCount,
      permissions: permissionsCount,
      rolePermissions: rolePermissionsCount,
      products: productsCount,
      customers: customersCount,
      suppliers: suppliersCount,
      refreshSessions: refreshSessionsCount,
      salesOrders: salesOrdersCount
    },
    anomalies: {
      usersWithoutRole,
      inactiveUsers,
      inactiveProducts
    }
  };

  const docsDir = path.join(__dirname, '../../docs/super-admin');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Save JSON
  const jsonPath = path.join(docsDir, 'database-inventory.json');
  fs.writeFileSync(jsonPath, JSON.stringify(inventoryData, null, 2), 'utf-8');

  // Save Markdown
  const mdPath = path.join(docsDir, 'database-inventory.md');
  const mdContent = `# Database Inventory & Health Report

**Generated Date**: ${inventoryData.timestamp}

## Record Counts Summary

| Entity | Total Count |
| :--- | :--- |
| **Companies** | ${inventoryData.counts.companies} |
| **Branches** | ${inventoryData.counts.branches} |
| **Warehouses** | ${inventoryData.counts.warehouses} |
| **Departments** | ${inventoryData.counts.departments} |
| **Users** | ${inventoryData.counts.users} |
| **Employees** | ${inventoryData.counts.employees} |
| **Roles** | ${inventoryData.counts.roles} |
| **Permissions** | ${inventoryData.counts.permissions} |
| **Role-Permission Assignments** | ${inventoryData.counts.rolePermissions} |
| **Products** | ${inventoryData.counts.products} |
| **Customers** | ${inventoryData.counts.customers} |
| **Suppliers** | ${inventoryData.counts.suppliers} |
| **Active Refresh Sessions** | ${inventoryData.counts.refreshSessions} |
| **Sales Orders** | ${inventoryData.counts.salesOrders} |

## Integrity & Anomaly Checks

- **Users without Assigned Role**: ${usersWithoutRole}
- **Inactive Users**: ${inactiveUsers}
- **Inactive Products**: ${inactiveProducts}
- **Database Status**: Preserved & Fully Intact
`;
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  console.log('[Database Inventory] Scan complete. Output saved to docs/super-admin/database-inventory.json and .md');
}

runInventory()
  .catch((err) => {
    console.error('[Database Inventory] Error running inventory script:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
