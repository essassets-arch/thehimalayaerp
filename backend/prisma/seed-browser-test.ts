import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function validateSafety(dbUrl: string) {
  try {
    const parsedUrl = new URL(dbUrl);
    const databaseName = parsedUrl.pathname.replace(/^\//, '');

    const unsafeNames = ['postgres', 'template0', 'template1', 'himalaya_erp', 'prototype_next'];
    if (unsafeNames.includes(databaseName.toLowerCase())) {
      throw new Error(`Unsafe database "${databaseName}" in deny list.`);
    }

    if (!databaseName.endsWith('_browser_test')) {
      throw new Error(`Unsafe database "${databaseName}". Expected a database name ending with "_browser_test".`);
    }
  } catch (err) {
    throw new Error(`Invalid DATABASE_URL format or safety check failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  console.log(`[SEED] Resolving database URL: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);

  try {
    validateSafety(dbUrl);
  } catch(e) {
    console.error(`[SEED ERROR] Database safety violation! ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  console.log(`[SEED] Safety check passed. Proceeding with browser-test seeding...`);

  // 1. Seed Company Structure
  const companyCode = 'HIMALAYA-BROWSER-TEST';
  const company = await prisma.company.upsert({
    where: { publicId: companyCode },
    update: { name: 'Himalaya ERP Browser Test Company' },
    create: {
      publicId: companyCode,
      name: 'Himalaya ERP Browser Test Company',
      version: 1,
    }
  });

  const plant = await prisma.branch.upsert({
    where: { publicId: 'PLANT-BROWSER-01' },
    update: { name: 'Main Plant Browser Test' },
    create: {
      publicId: 'PLANT-BROWSER-01',
      name: 'Main Plant Browser Test',
      companyId: company.id,
    }
  });

  const branch = await prisma.branch.upsert({
    where: { publicId: 'BRANCH-BROWSER-01' },
    update: { name: 'Main Branch Browser Test' },
    create: {
      publicId: 'BRANCH-BROWSER-01',
      name: 'Main Branch Browser Test',
      companyId: company.id,
    }
  });

  const deptCodes = [
    { code: 'DEPT-SALES', name: 'Sales Department' },
    { code: 'DEPT-PRODUCTION', name: 'Production Department' },
    { code: 'DEPT-STORE', name: 'Store Department' },
    { code: 'DEPT-QC', name: 'QC Department' },
    { code: 'DEPT-DISPATCH', name: 'Dispatch Department' },
    { code: 'DEPT-FINANCE', name: 'Finance Department' },
    { code: 'DEPT-HR', name: 'HR Department' },
  ];

  const departments: Record<string, any> = {};
  for (const dept of deptCodes) {
    departments[dept.code] = await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: dept.code } },
      update: { name: dept.name, isActive: true },
      create: {
        companyId: company.id,
        code: dept.code,
        name: dept.name,
        isActive: true,
      }
    });
  }

  const workLocation = await prisma.workLocation.upsert({
    where: { companyId_code: { companyId: company.id, code: 'LOC-BROWSER-MAIN' } },
    update: { name: 'Main Location', isActive: true },
    create: {
      companyId: company.id,
      code: 'LOC-BROWSER-MAIN',
      name: 'Main Location',
      isActive: true,
    }
  });

  // 2. Roles & Permissions
  const permissionsList = [
    'admin.products.create', 'admin.products.read', 'admin.products.update',
    'admin.samples.create', 'admin.samples.read', 'admin.samples.update',
    'admin.replacements.create', 'admin.replacements.read', 'admin.replacements.approve', 'admin.replacements.reject', 'admin.replacements.update',
    'admin.storereports.read',
    'crm.quotation.create', 'crm.quotation.read', 'crm.quotation.update',
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send', 'crm.quotations.accept', 'crm.quotations.convert', 'crm.quotations.delete',
    'dispatch.update', 'logistics.dispatches.create', 'logistics.dispatches.read', 'logistics.dispatches.start-delivery', 'logistics.dispatches.confirm-delivery',
    'finance.invoice.read', 'finance.invoice.update', 'finance.ledger.read', 'finance.payment.create', 'finance.payment.read', 'finance.payment.update',
    'inventory.warehouses.create', 'inventory.warehouses.read', 'inventory.warehouses.update',
    'plant-head.qc-failures.read',
    'production.floor.create', 'production.floor.read', 'production.floor.start', 'production.floor.complete', 'production.floor.rework',
    'production.plan.create', 'production.plan.read', 'production.plan.approve', 'production.plan.release',
    'production.productiontesting.create', 'production.productiontesting.read', 'production.productiontesting.update', 'production.productiontesting.delete',
    'production.productionworkflow.read',
    'production.qc.approve', 'production.qc.read', 'production.qc.reject',
    'production.workorder.complete', 'production.workorder.read', 'production.workorder.start',
    'qc.inspection.approve', 'qc.inspection.read',
    'sales.customers.create', 'sales.customers.read', 'sales.customers.update',
    'sales.dashboard.read',
    'sales.leads.create', 'sales.leads.read', 'sales.leads.update',
    'sales.orders.approve', 'sales.orders.create', 'sales.orders.read', 'sales.orders.update',
    'sales.salesreports.read',
    'sales.salesreturns.approve', 'sales.salesreturns.create', 'sales.salesreturns.read', 'sales.salesreturns.reject', 'sales.salesreturns.update',
    'sales.targets.create', 'sales.targets.delete', 'sales.targets.read', 'sales.targets.update',
    'finance.payment.read', 'finance.payment.create'
  ];

  for (const code of permissionsList) {
    await prisma.permission.upsert({
      where: { code },
      update: { name: code },
      create: { code, name: code, publicId: `PERM-${code}` }
    });
  }

  const allPermissions = await prisma.permission.findMany({ where: { code: { in: permissionsList } } });
  const permMap = Object.fromEntries(allPermissions.map(p => [p.code, p.id]));

  const rolesDef = [
    { code: 'SUPER_ADMIN', name: 'Super Admin', perms: permissionsList },
    { code: 'ADMIN', name: 'Admin', perms: permissionsList },
    { code: 'SALES_EXECUTIVE', name: 'Sales Executive', perms: ['sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send', 'crm.quotation.read', 'crm.quotation.create', 'crm.quotation.update', 'sales.orders.read', 'sales.orders.create', 'sales.orders.update', 'sales.customers.read', 'sales.customers.create', 'sales.customers.update', 'admin.products.read', 'admin.samples.create', 'admin.samples.read', 'admin.samples.update', 'admin.replacements.create', 'admin.replacements.read', 'sales.salesreturns.create', 'sales.salesreturns.read', 'sales.dashboard.read', 'sales.salesreports.read', 'sales.targets.read', 'finance.payment.read', 'finance.payment.create', 'inventory.warehouses.read', 'procurement.suppliers.read', 'inventory.inventory.read'] },
    { code: 'SALES_MANAGER', name: 'Sales Manager', perms: ['sales.orders.read', 'sales.orders.approve', 'sales.orders.update', 'sales.dashboard.read', 'admin.products.read', 'sales.salesreturns.approve', 'sales.customers.read', 'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send', 'crm.quotations.accept', 'crm.quotations.convert', 'crm.quotations.delete', 'crm.quotation.read', 'crm.quotation.create', 'crm.quotation.update', 'inventory.warehouses.read', 'procurement.suppliers.read', 'inventory.inventory.read'] },
    { code: 'PLANT_HEAD', name: 'Plant Head', perms: ['sales.orders.read', 'sales.orders.update', 'sales.orders.approve', 'production.plan.read', 'production.plan.approve', 'production.plan.release', 'plant-head.qc-failures.read', 'admin.replacements.approve', 'admin.replacements.reject', 'sales.salesreturns.approve', 'sales.salesreturns.reject'] },
    { code: 'PRODUCTION_PLANNER', name: 'Production Planner', perms: ['production.plan.read', 'production.plan.create', 'production.plan.approve', 'production.plan.release', 'production.workorder.read', 'production.workorder.start', 'production.workorder.complete', 'production.floor.read', 'production.floor.create', 'production.productionworkflow.read'] },
    { code: 'PRODUCTION_OPERATOR', name: 'Production Operator', perms: ['production.floor.read', 'production.floor.start', 'production.floor.complete', 'production.floor.rework', 'production.workorder.read', 'production.workorder.start', 'production.workorder.complete', 'production.productionworkflow.read'] },
    { code: 'STORE_MANAGER', name: 'Store Manager', perms: ['inventory.warehouses.create', 'inventory.warehouses.read', 'inventory.warehouses.update', 'admin.storereports.read'] },
    { code: 'QC_INSPECTOR', name: 'QC Inspector', perms: ['production.qc.read', 'production.qc.approve', 'production.qc.reject', 'qc.inspection.read', 'qc.inspection.approve'] },
    { code: 'DISPATCH_EXECUTIVE', name: 'Dispatch Executive', perms: ['logistics.dispatches.read', 'logistics.dispatches.create', 'logistics.dispatches.start-delivery', 'logistics.dispatches.confirm-delivery', 'dispatch.update'] },
    { code: 'FINANCE_EXECUTIVE', name: 'Finance Executive', perms: ['finance.payment.read', 'finance.payment.create', 'finance.payment.update', 'finance.ledger.read', 'finance.invoice.read', 'finance.invoice.update'] },
    { code: 'FINANCE_MANAGER', name: 'Finance Manager', perms: ['finance.payment.read', 'finance.payment.create', 'finance.payment.update', 'finance.ledger.read', 'finance.invoice.read', 'finance.invoice.update'] },
    { code: 'HR', name: 'HR', perms: ['user.read', 'user.create'] },
    { code: 'EMPLOYEE', name: 'Employee', perms: [] },
  ];

  for (const rd of rolesDef) {
    const role = await prisma.role.upsert({
      where: { code: rd.code },
      update: { name: rd.name },
      create: { code: rd.code, name: rd.name, publicId: `ROLE-${rd.code}` }
    });

    const existingPerms = await prisma.rolePermission.findMany({ where: { roleId: role.id } });
    const existingPermIds = new Set(existingPerms.map(ep => ep.permissionId));
    
    for (const pcode of rd.perms) {
      const pid = permMap[pcode];
      if (pid && !existingPermIds.has(pid)) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: pid }
        });
      }
    }
  }

  // 3. Test Users & Employees
  const commonPassword = process.env.E2E_COMMON_PASSWORD;
  if (!commonPassword) {
    console.error("[SEED ERROR] E2E_COMMON_PASSWORD is required for seeded test accounts.");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(commonPassword, 10);

  const users = [
    { email: 'super.admin.browser@himalayaerp.test', name: 'Super Admin Test', role: 'SUPER_ADMIN', dept: 'DEPT-HR' },
    { email: 'admin.browser@himalayaerp.test', name: 'Admin Test', role: 'ADMIN', dept: 'DEPT-HR' },
    { email: 'sales.executive.browser@himalayaerp.test', name: 'Sales Exec Test', role: 'SALES_EXECUTIVE', dept: 'DEPT-SALES' },
    { email: 'sales.manager.browser@himalayaerp.test', name: 'Sales Manager Test', role: 'SALES_MANAGER', dept: 'DEPT-SALES' },
    { email: 'plant.head.browser@himalayaerp.test', name: 'Plant Head Test', role: 'PLANT_HEAD', dept: 'DEPT-PRODUCTION' },
    { email: 'production.planner.browser@himalayaerp.test', name: 'Prod Planner Test', role: 'PRODUCTION_PLANNER', dept: 'DEPT-PRODUCTION' },
    { email: 'production.operator.browser@himalayaerp.test', name: 'Prod Operator Test', role: 'PRODUCTION_OPERATOR', dept: 'DEPT-PRODUCTION' },
    { email: 'store.manager.browser@himalayaerp.test', name: 'Store Manager Test', role: 'STORE_MANAGER', dept: 'DEPT-STORE' },
    { email: 'qc.inspector.browser@himalayaerp.test', name: 'QC Inspector Test', role: 'QC_INSPECTOR', dept: 'DEPT-QC' },
    { email: 'dispatch.executive.browser@himalayaerp.test', name: 'Dispatch Exec Test', role: 'DISPATCH_EXECUTIVE', dept: 'DEPT-DISPATCH' },
    { email: 'finance.executive.browser@himalayaerp.test', name: 'Finance Exec Test', role: 'FINANCE_EXECUTIVE', dept: 'DEPT-FINANCE' },
    { email: 'finance.manager.browser@himalayaerp.test', name: 'Finance Mgr Test', role: 'FINANCE_MANAGER', dept: 'DEPT-FINANCE' },
    { email: 'hr.browser@himalayaerp.test', name: 'HR Test', role: 'HR', dept: 'DEPT-HR' },
    { email: 'employee.browser@himalayaerp.test', name: 'Employee Test', role: 'EMPLOYEE', dept: 'DEPT-HR' },
  ];

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const roleRecord = await prisma.role.findUnique({ where: { code: u.role } });
    if (!roleRecord) throw new Error(`Role ${u.role} not found`);
    
    const dbUser = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: passwordHash, roleId: roleRecord.id, isActive: true },
      create: {
        publicId: `USER-${u.role}-BROWSER`,
        email: u.email,
        name: u.name,
        password: passwordHash,
        roleId: roleRecord.id,
        companyId: company.id,
        isActive: true,
      }
    });

    // Typescript enum values
    await prisma.employee.upsert({
      where: { userId: dbUser.id },
      update: { firstName: u.name.split(' ')[0], lastName: u.name.split(' ')[1] || 'Test' },
      create: {
        publicId: `EMP-${u.role}-BROWSER`,
        employeeCode: `EMP-${1000 + i}`,
        firstName: u.name.split(' ')[0],
        lastName: u.name.split(' ')[1] || 'Test',
        fullName: u.name,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'OTHER',
        jobTitle: u.role.replace('_', ' '),
        companyId: company.id,
        userId: dbUser.id,
        departmentId: departments[u.dept].id,
        workLocationId: workLocation.id,
        employmentType: 'PERMANENT',
        joiningDate: new Date(),
        workEmail: u.email,
        phoneNumber: `9876543${i.toString().padStart(3, '0')}`,
        residentialAddress: 'Test Address',
        emergencyContactName: 'Test Emergency',
        emergencyContactPhone: '9876543000',
        emergencyRelationship: 'Friend',
        panNumber: `TESTP${1000 + i}T`,
        aadhaarNumberEncrypted: 'encrypted',
        aadhaarLastFour: '1234',
        aadhaarHash: `hash-${i}`,
        bankName: 'Test Bank',
        accountHolderName: u.name,
        bankAccountType: 'SAVINGS',
        bankAccountEncrypted: 'encrypted',
        bankAccountLastFour: '5678',
        bankAccountHash: `bhash-${i}`,
        ifscCode: 'TEST0001234',
        baseSalary: 50000,
        status: 'ACTIVE'
      }
    });
  }

  // 4. Products
  const productsDef = [
    { code: 'FG-CEMENT-53', name: 'Premium Cement Grade 53', unit: 'BAG', price: 420 },
    { code: 'FG-RMC-M20', name: 'Ready Mix Concrete M20', unit: 'CUM', price: 4500 },
    { code: 'FG-RMC-M25', name: 'Ready Mix Concrete M25', unit: 'CUM', price: 5000 },
    { code: 'FG-RMC-M30', name: 'Ready Mix Concrete M30', unit: 'CUM', price: 5500 },
    { code: 'FG-RMC-M35', name: 'Ready Mix Concrete M35', unit: 'CUM', price: 6000 },
    { code: 'FG-SAND-FINE', name: 'Fine Grade Sand', unit: 'TON', price: 1200 },
    { code: 'FG-AGG-20MM', name: 'Coarse Aggregate 20mm', unit: 'TON', price: 1400 },
    { code: 'FG-PAVER-STD', name: 'Paver Block Standard', unit: 'PCS', price: 45 },
    { code: 'FG-KERB-STD', name: 'Concrete Kerb Stone', unit: 'PCS', price: 250 },
    { code: 'FG-DRAIN-COVER', name: 'Precast Drain Cover', unit: 'PCS', price: 1200 },
    { code: 'FG-INACTIVE-PROD', name: 'Inactive Test Product', unit: 'PCS', price: 100, isActive: false },
  ];

  for (const p of productsDef) {
    await prisma.product.upsert({
      where: { publicId: p.code },
      update: { name: p.name, unitPrice: p.price, isActive: p.isActive !== false },
      create: {
        publicId: p.code,
        sku: p.code,
        name: p.name,
        unit: p.unit,
        unitPrice: p.price,
        minimumStock: 0,
        isActive: p.isActive !== false,
        companyId: company.id,
        category: 'Finished Goods',
      }
    });
  }

  // Create another company and its product to test isolation
  const otherCompany = await prisma.company.upsert({
    where: { publicId: 'OTHER-COMPANY-TEST' },
    update: { name: 'Other Test Company' },
    create: { publicId: 'OTHER-COMPANY-TEST', name: 'Other Test Company', version: 1 }
  });

  await prisma.product.upsert({
    where: { publicId: 'FG-OTHER-COMPANY' },
    update: { name: 'Other Company Product' },
    create: {
      publicId: 'FG-OTHER-COMPANY',
      sku: 'FG-OTHER-COMPANY',
      name: 'Other Company Product',
      unit: 'PCS',
      unitPrice: 50,
      minimumStock: 0,
      isActive: true,
      companyId: otherCompany.id,
      category: 'Finished Goods',
    }
  });

  // 5. Customers
  const customerDefs = [
    { code: 'CUST-BROWSER-001', name: 'Browser Test Infrastructure Pvt Ltd' },
    { code: 'CUST-BROWSER-002', name: 'Browser Test Builders Pvt Ltd' },
    { code: 'CUST-BROWSER-003', name: 'Browser Test Projects Ltd' }
  ];

  const customers: Record<string, any> = {};
  for (const c of customerDefs) {
    customers[c.code] = await prisma.customer.upsert({
      where: { customerCode: c.code },
      update: { companyName: c.name, status: 'ACTIVE' },
      create: {
        customerCode: c.code,
        companyName: c.name,
        companyId: company.id,
        branchId: branch.id,
        contactPerson: 'John Test',
        email: `john@${c.code.toLowerCase()}.test`,
        phone: '9998887776',
        gstin: `27AAACA1234A1Z${c.code.slice(-1)}`,
        status: 'ACTIVE',
        creditStatus: 'GOOD',
      }
    });
  }

  // 6. Vendors
  const vendorDefs = [
    { code: 'VEND-BROWSER-001', name: 'Browser Test Cement Supplier' },
    { code: 'VEND-BROWSER-002', name: 'Browser Test Logistics Supplier' },
    { code: 'VEND-BROWSER-003', name: 'Browser Test General Supplier' }
  ];

  for (const v of vendorDefs) {
    await prisma.supplier.upsert({
      where: { publicId: v.code },
      update: { name: v.name, isActive: true },
      create: {
        publicId: v.code,
        name: v.name,
        companyId: company.id,
        email: `contact@${v.code.toLowerCase()}.test`,
        phone: '8887776665',
        isActive: true,
      }
    });
  }

  // 7. Document Sequences
  const seqTypes = ['LEAD', 'SO', 'QT', 'SAMP', 'PROD', 'WO', 'DISP', 'INV', 'PAY', 'RET', 'REPL', 'COMP'];
  for (const type of seqTypes) {
    await prisma.documentSequence.upsert({
      where: { companyId_documentType_year: { companyId: company.id, documentType: type, year: new Date().getFullYear() } },
      update: {},
      create: {
        companyId: company.id,
        documentType: type,
        prefix: type,
        year: new Date().getFullYear(),
        currentNumber: 1000
      }
    });
  }

  // 8. Workflow Fixtures
  const rmc30 = await prisma.product.findUnique({ where: { publicId: 'FG-RMC-M30' } });
  const salesExec = await prisma.user.findFirst({where: {role: {code: 'SALES_EXECUTIVE'}}});
  
  if (rmc30 && salesExec) {
    // 8.1 Active Lead
    await prisma.lead.upsert({
      where: { leadNumber: 'LEAD-BROWSER-ACTIVE' },
      update: {},
      create: {
        leadNumber: 'LEAD-BROWSER-ACTIVE',
        companyName: 'Browser Test Leads Ltd (SEEDED_PREREQUISITE)',
        contactPerson: 'Lead Test',
        email: 'lead@test.com',
        productInterest: 'RMC M30',
        estimatedQuantity: 100,
        unit: 'CUM',
        createdById: salesExec.id,
        companyId: company.id,
      }
    });
  }

  // Seeding initial machines
  console.log('[SEED] Seeding machines...');
  const initialMachines = [
    { machineId: 'HM001', machineName: 'Hydraulic Machine 1', machineType: 'Hydraulic Press', location: 'Section A' },
    { machineId: 'HM002', machineName: 'Hydraulic Machine 2', machineType: 'Hydraulic Press', location: 'Section A' },
    { machineId: 'HM003', machineName: 'Hydraulic Machine 3', machineType: 'Hydraulic Press', location: 'Section B' },
    { machineId: 'HM004', machineName: 'Hydraulic Machine 4', machineType: 'Hydraulic Press', location: 'Section B' },
    { machineId: 'HM005', machineName: 'Hydraulic Machine 5', machineType: 'Hydraulic Press', location: 'Section C' },
    { machineId: 'HM006', machineName: 'Hydraulic Machine 6', machineType: 'Hydraulic Press', location: 'Section C' },
  ];
  for (const m of initialMachines) {
    await prisma.machine.upsert({
      where: { machineId: m.machineId },
      update: { machineName: m.machineName, machineType: m.machineType, location: m.location, isActive: true },
      create: { machineId: m.machineId, machineName: m.machineName, machineType: m.machineType, location: m.location, isActive: true },
    });
  }

  console.log(`[SEED] Browser-test seeding completed successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
