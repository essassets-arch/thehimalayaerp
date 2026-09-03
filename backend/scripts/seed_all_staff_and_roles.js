const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const dbUrl = 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function run() {
  console.log('🚀 Seeding all roles, departments, users, and employee master records...');

  // 1. Get Primary Company
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { publicId: 'COM-001' },
        { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' }
      ]
    }
  }) || await prisma.company.findFirst();

  if (!company) {
    throw new Error('No company found in database!');
  }
  console.log(`🏢 Using Company: ${company.name} (${company.id})`);

  // 2. Ensure Work Location
  let workLocation = await prisma.workLocation.findFirst({
    where: { companyId: company.id }
  });
  if (!workLocation) {
    workLocation = await prisma.workLocation.create({
      data: {
        publicId: uid('LOC'),
        name: 'Ahmedabad Head Office',
        companyId: company.id,
        isActive: true,
      }
    });
  }
  console.log(`📍 Work Location: ${workLocation.name} (${workLocation.id})`);

  // 3. Roles Definitions
  const rolesToEnsure = [
    { code: 'SUPER_ADMIN', name: 'Super Admin' },
    { code: 'ADMIN', name: 'Admin' },
    { code: 'SUPER_SALES', name: 'SuperSales' },
    { code: 'SALES_EXECUTIVE', name: 'Sales Executive' },
    { code: 'SALES_MANAGER', name: 'Sales Manager' },
    { code: 'PLANT_HEAD', name: 'Plant Head' },
    { code: 'PRODUCTION_PLANNER', name: 'Production Planner' },
    { code: 'PRODUCTION_OPERATOR', name: 'Production Operator' },
    { code: 'QC_INSPECTOR', name: 'QC Inspector' },
    { code: 'DISPATCH_EXECUTIVE', name: 'Dispatch Executive' },
    { code: 'DISPATCH_2', name: 'Dispatch 2' },
    { code: 'FINANCE_EXECUTIVE', name: 'Finance Executive' },
    { code: 'FINANCE_MANAGER', name: 'Finance Manager' },
    { code: 'STORE_MANAGER', name: 'Store Manager' },
    { code: 'HR', name: 'HR' },
  ];

  const roleMap = {};
  for (const r of rolesToEnsure) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: {
        publicId: `ROLE-${r.code}`,
        name: r.name,
        code: r.code,
      }
    });
    roleMap[r.code] = role;
  }
  console.log(`✅ Roles upserted (${Object.keys(roleMap).length} roles).`);

  // 4. Ensure All Permissions Exist
  const allPermissionsList = [
    // Sales & CRM
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.delete', 'sales.leads.convert',
    'sales.dashboard.read', 'sales.orders.approve', 'sales.orders.create', 'sales.orders.read', 'sales.orders.update',
    'sales.quotations.read', 'sales.quotations.create', 'sales.quotations.update', 'sales.quotations.send', 'sales.quotations.accept', 'sales.quotations.convert', 'sales.quotations.delete',
    'crm.quotation.create', 'crm.quotation.read', 'crm.quotation.update',
    'sales.targets.create', 'sales.targets.read', 'sales.targets.update', 'sales.targets.delete',
    'sales.salesreports.read', 'sales.salesreturns.create', 'sales.salesreturns.read', 'sales.salesreturns.approve', 'sales.salesreturns.reject', 'sales.salesreturns.update',
    'sales.customercomplaints.create', 'sales.customercomplaints.read', 'sales.customercomplaints.update', 'sales.customercomplaints.delete', 'sales.customercomplaints.submit', 'sales.customercomplaints.approve', 'sales.customercomplaints.reject',
    'sample.read', 'sample.create', 'sample.dispatch', 'sample.update',
    'quotation.read', 'quotation.create', 'quotation.update', 'quotation.send', 'quotation.accept',
    'salesorder.confirm', 'salesorder.send_to_plant', 'salesorder.cancel', 'salesorder.amend', 'salesorder.credit_override',

    // Dispatch & Logistics
    'dispatch.create', 'dispatch.read', 'dispatch.update', 'dispatch.confirm',
    'logistics.dispatches.read', 'logistics.dispatches.create', 'logistics.dispatches.start-delivery', 'logistics.dispatches.confirm-delivery',

    // Finance & Accounts
    'finance.invoice.read', 'finance.invoice.update', 'finance.ledger.read',
    'finance.payment.create', 'finance.payment.read', 'finance.payment.update',
    'finance.sales-analytics.read', 'finance.sales-analytics.activity.read', 'finance.sales-analytics.receivables.read', 'finance.sales-analytics.export',
    'finance.brand-analysis.read', 'finance.brand-analysis.start', 'finance.brand-analysis.complete',
    'finance.payroll.read', 'finance.payroll.process', 'finance.payroll.pay', 'finance.payroll.history',
    'invoice.read', 'invoice.create', 'invoice.post', 'invoice.void',
    'payment.read', 'payment.create', 'payment.verify', 'payment.reject',
    'creditnote.read', 'creditnote.create',

    // Procurement & Store
    'procurement.indents.create', 'procurement.indents.read', 'procurement.indents.update', 'procurement.indents.submit', 'procurement.indents.resubmit', 'procurement.indents.approve', 'procurement.indents.return', 'procurement.indents.reject', 'procurement.indents.cancel',
    'procurement.purchase_orders.create', 'procurement.purchase_orders.read', 'procurement.purchase_orders.update', 'procurement.purchase_orders.submit', 'procurement.purchase_orders.approve', 'procurement.purchase_orders.return', 'procurement.purchase_orders.reject', 'procurement.purchase_orders.issue', 'procurement.purchase_orders.vendor_status', 'procurement.purchase_orders.dispatch', 'procurement.purchase_orders.delivery_read', 'procurement.purchase_orders.closure_read', 'procurement.purchase_orders.close',
    'procurement.grns.create', 'procurement.grns.read', 'procurement.grns.update', 'procurement.grns.submit', 'procurement.grns.resubmit', 'procurement.grns.audit', 'procurement.grns.return',
    'procurement.vendor_invoices.create', 'procurement.vendor_invoices.read', 'procurement.vendor_invoices.update', 'procurement.vendor_invoices.submit', 'procurement.vendor_invoices.match', 'procurement.vendor_invoices.verify', 'procurement.vendor_invoices.request_payment', 'procurement.vendor_invoices.resolve_exception', 'procurement.vendor_invoices.cancel',
    'procurement.vendor_payments.create', 'procurement.vendor_payments.read', 'procurement.vendor_payments.update', 'procurement.vendor_payments.submit', 'procurement.vendor_payments.approve', 'procurement.vendor_payments.process', 'procurement.vendor_payments.complete', 'procurement.vendor_payments.fail', 'procurement.vendor_payments.cancel',
    'procurement.audit.read', 'inventory.receipts.post', 'vendors.read', 'suppliers.read', 'products.read', 'warehouses.read', 'inventory.stock.read',
    'inventory.inventory.create', 'inventory.inventory.read', 'inventory.warehouses.create', 'inventory.warehouses.read', 'inventory.warehouses.update',
    'admin.storereports.read', 'store.brand-analysis.create', 'store.brand-analysis.read',

    // Production & QC
    'production.plan.approve', 'production.plan.create', 'production.plan.read', 'production.plan.release',
    'production.workorder.complete', 'production.workorder.read', 'production.workorder.start', 'production.workorder.update',
    'production.floor.read', 'production.productionworkflow.read', 'production.floor.create', 'production.floor.start', 'production.floor.complete', 'production.floor.rework',
    'production.productiontesting.read', 'production.productiontesting.create', 'production.productiontesting.update', 'production.productiontesting.delete',
    'production.qc.read', 'production.qc.inspect', 'production.qc.approve', 'production.qc.reject',
    'qc.inspection.approve', 'qc.inspection.read', 'plant-head.qc-failures.read', 'admin.planthead.read', 'admin.planthead.create',

    // HR & Payroll
    'hr.recruitment.requests.create', 'hr.recruitment.requests.read.own', 'hr.recruitment.requests.read.all', 'hr.recruitment.requests.update.own', 'hr.recruitment.requests.withdraw', 'hr.recruitment.requests.process', 'hr.recruitment.requests.return', 'hr.recruitment.requests.reject', 'hr.recruitment.requests.fulfil',
    'hr.recruitment.candidates.create', 'hr.recruitment.candidates.update', 'hr.recruitment.interviews.create', 'hr.recruitment.interviews.update',
    'hr.employees.read', 'hr.employees.create', 'hr.employees.update', 'hr.employees.status.update', 'hr.employees.documents.read', 'hr.employees.documents.upload', 'hr.employees.documents.delete', 'hr.employees.sensitive.read',
    'hr.departments.read', 'hr.locations.read', 'hr.payroll.read', 'hr.payroll.prepare', 'hr.payroll.update', 'hr.payroll.submit',
    'superadmin.payroll.read', 'superadmin.payroll.approve', 'superadmin.payroll.reject', 'superadmin.payroll.hold', 'superadmin.payroll.send_to_finance',
    'salary_slips.read_own', 'salary_slips.read_all', 'salary_slips.download', 'salary_slips.share', 'salary_slips.revoke_share',

    // Admin & Common
    'user.read', 'user.create', 'user.update', 'user.deactivate', 'role.read', 'role.assign',
    'admin.attachments.read', 'admin.attachments.create', 'admin.attachments.delete',
    'admin.comments.read', 'admin.comments.create', 'admin.comments.delete',
    'admin.notifications.read', 'admin.notifications.update',
    'notification.read', 'comment.create', 'comment.read',
    'reports.sales', 'reports.production', 'reports.finance',
    'super-admin.brand-analysis.read', 'super-admin.brand-analysis.approve', 'super-admin.brand-analysis.reject',
  ];

  const permMap = {};
  for (const code of allPermissionsList) {
    const p = await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { publicId: uid('PERM'), name: code, code },
    });
    permMap[code] = p;
  }

  // Helper to assign perms
  async function assignPermissions(roleCode, codes) {
    const role = roleMap[roleCode];
    if (!role) return;
    for (const code of codes) {
      const perm = permMap[code];
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  // Assign ALL permissions to SUPER_ADMIN, ADMIN, SUPER_SALES
  for (const rCode of ['SUPER_ADMIN', 'ADMIN', 'SUPER_SALES']) {
    await assignPermissions(rCode, allPermissionsList);
  }

  // Sales Executive
  await assignPermissions('SALES_EXECUTIVE', [
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.delete', 'sales.leads.convert',
    'sales.dashboard.read', 'sales.orders.create', 'sales.orders.read', 'sales.orders.update',
    'sales.quotations.read', 'sales.quotations.create', 'sales.quotations.update', 'sales.quotations.send', 'sales.quotations.accept',
    'sales.targets.read', 'sales.salesreports.read', 'sales.salesreturns.create', 'sales.salesreturns.read',
    'sales.customercomplaints.create', 'sales.customercomplaints.read',
    'sample.read', 'sample.create', 'sample.dispatch', 'sample.update',
    'quotation.read', 'quotation.create', 'quotation.update', 'quotation.send', 'quotation.accept',
    'salary_slips.read_own', 'notification.read', 'products.read',
  ]);

  // Finance Executive
  await assignPermissions('FINANCE_EXECUTIVE', [
    'finance.invoice.read', 'finance.invoice.update', 'finance.ledger.read',
    'finance.payment.create', 'finance.payment.read', 'finance.payment.update',
    'finance.sales-analytics.read', 'finance.sales-analytics.activity.read', 'finance.sales-analytics.receivables.read',
    'finance.brand-analysis.read', 'finance.brand-analysis.start', 'finance.brand-analysis.complete',
    'finance.payroll.read', 'finance.payroll.process', 'finance.payroll.history',
    'invoice.read', 'invoice.create', 'invoice.post', 'payment.read', 'payment.create', 'payment.verify',
    'salary_slips.read_own', 'salary_slips.read_all', 'salary_slips.download', 'notification.read',
  ]);

  // Finance Manager
  await assignPermissions('FINANCE_MANAGER', [
    'finance.invoice.read', 'finance.invoice.update', 'finance.ledger.read',
    'finance.payment.create', 'finance.payment.read', 'finance.payment.update',
    'finance.sales-analytics.read', 'finance.sales-analytics.activity.read', 'finance.sales-analytics.receivables.read', 'finance.sales-analytics.export',
    'finance.brand-analysis.read', 'finance.brand-analysis.start', 'finance.brand-analysis.complete',
    'finance.payroll.read', 'finance.payroll.process', 'finance.payroll.pay', 'finance.payroll.history',
    'invoice.read', 'invoice.create', 'invoice.post', 'invoice.void',
    'payment.read', 'payment.create', 'payment.verify', 'payment.reject', 'creditnote.read', 'creditnote.create',
    'salary_slips.read_own', 'salary_slips.read_all', 'salary_slips.download', 'salary_slips.share', 'notification.read',
  ]);

  // Dispatch Executive / Dispatch 2
  for (const dCode of ['DISPATCH_EXECUTIVE', 'DISPATCH_2']) {
    await assignPermissions(dCode, [
      'dispatch.create', 'dispatch.read', 'dispatch.update', 'dispatch.confirm',
      'logistics.dispatches.read', 'logistics.dispatches.create', 'logistics.dispatches.start-delivery', 'logistics.dispatches.confirm-delivery',
      'sales.orders.read', 'products.read', 'inventory.stock.read', 'salary_slips.read_own', 'notification.read',
    ]);
  }

  // Production Planner & Operator
  for (const pCode of ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR']) {
    await assignPermissions(pCode, [
      'production.plan.create', 'production.plan.read', 'production.plan.release', 'production.plan.approve',
      'production.workorder.complete', 'production.workorder.read', 'production.workorder.start', 'production.workorder.update',
      'production.floor.read', 'production.productionworkflow.read', 'production.floor.create', 'production.floor.start', 'production.floor.complete', 'production.floor.rework',
      'production.productiontesting.read', 'production.productiontesting.create', 'production.productiontesting.update', 'production.productiontesting.delete',
      'production.qc.read', 'production.qc.inspect', 'qc.inspection.read', 'qc.inspection.approve',
      'inventory.stock.read', 'products.read', 'salary_slips.read_own', 'notification.read',
    ]);
  }

  // Plant Head
  await assignPermissions('PLANT_HEAD', [
    'admin.planthead.read', 'admin.planthead.create', 'plant-head.qc-failures.read',
    'production.plan.approve', 'production.plan.create', 'production.plan.read', 'production.plan.release',
    'production.workorder.complete', 'production.workorder.read', 'production.workorder.start', 'production.workorder.update',
    'production.floor.read', 'production.productionworkflow.read', 'production.floor.create', 'production.floor.start', 'production.floor.complete',
    'production.productiontesting.read', 'production.productiontesting.create',
    'hr.recruitment.requests.create', 'hr.recruitment.requests.read.own', 'hr.recruitment.requests.update.own',
    'inventory.stock.read', 'products.read', 'salary_slips.read_own', 'notification.read',
  ]);

  // Store Manager
  await assignPermissions('STORE_MANAGER', [
    'inventory.inventory.create', 'inventory.inventory.read', 'inventory.warehouses.create', 'inventory.warehouses.read', 'inventory.warehouses.update', 'inventory.stock.read', 'inventory.receipts.post',
    'admin.storereports.read', 'store.brand-analysis.create', 'store.brand-analysis.read',
    'procurement.indents.create', 'procurement.indents.read', 'procurement.indents.update', 'procurement.indents.submit',
    'procurement.grns.create', 'procurement.grns.read', 'procurement.grns.update', 'procurement.grns.submit',
    'vendors.read', 'suppliers.read', 'products.read', 'salary_slips.read_own', 'notification.read',
  ]);

  // HR
  await assignPermissions('HR', [
    'hr.recruitment.requests.create', 'hr.recruitment.requests.read.own', 'hr.recruitment.requests.read.all', 'hr.recruitment.requests.update.own', 'hr.recruitment.requests.withdraw', 'hr.recruitment.requests.process', 'hr.recruitment.requests.return', 'hr.recruitment.requests.reject', 'hr.recruitment.requests.fulfil',
    'hr.recruitment.candidates.create', 'hr.recruitment.candidates.update', 'hr.recruitment.interviews.create', 'hr.recruitment.interviews.update',
    'hr.employees.read', 'hr.employees.create', 'hr.employees.update', 'hr.employees.status.update', 'hr.employees.documents.read', 'hr.employees.documents.upload', 'hr.employees.documents.delete', 'hr.employees.sensitive.read',
    'hr.departments.read', 'hr.locations.read', 'hr.payroll.read', 'hr.payroll.prepare', 'hr.payroll.update', 'hr.payroll.submit',
    'salary_slips.read_own', 'salary_slips.read_all', 'salary_slips.download', 'salary_slips.share', 'salary_slips.revoke_share',
    'notification.read',
  ]);

  // 5. Ensure Departments Exist
  const departmentsToEnsure = [
    'Sales Department',
    'Finance Department',
    'Dispatch Department',
    'Production Department',
    'Store Department',
    'QC Department',
    'HR Department',
    'Super Admin Department',
    'Operations',
  ];

  const deptMap = {};
  for (const dName of departmentsToEnsure) {
    let dept = await prisma.department.findFirst({
      where: { name: dName, companyId: company.id }
    });
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: dName,
          code: `DEPT_${dName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
          companyId: company.id,
          isActive: true,
        }
      });
    }
    deptMap[dName] = dept;
  }
  console.log(`✅ Departments ensured (${Object.keys(deptMap).length} departments).`);

  // 6. User and Employee Account Data
  const accounts = [
    {
      email: 'sales11@himalayaerp.com',
      rawPassword: 'Himalayacc@2025',
      name: 'Sales Eleven',
      firstName: 'Sales',
      lastName: 'Eleven',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'trushna.g@himalayaerp.com',
      rawPassword: 'Himalaya@3252',
      name: 'Trushna G',
      firstName: 'Trushna',
      lastName: 'G',
      roleCode: 'FINANCE_EXECUTIVE',
      deptName: 'Finance Department',
      jobTitle: 'Finance Executive',
    },
    {
      email: 'sahad.m@himalayaerp.com',
      rawPassword: 'Hcppl@5253',
      name: 'Sahad M',
      firstName: 'Sahad',
      lastName: 'M',
      roleCode: 'FINANCE_MANAGER',
      deptName: 'Finance Department',
      jobTitle: 'Finance Manager',
    },
    {
      email: 'sahad.dispatch@himalayaerp.com',
      rawPassword: 'Sahad@5253',
      name: 'Sahad Dispatch',
      firstName: 'Sahad',
      lastName: 'Dispatch',
      roleCode: 'DISPATCH_2',
      deptName: 'Dispatch Department',
      jobTitle: 'Dispatch Executive 2',
      dispatchCategory: 'Category 2',
    },
    {
      email: 'sales12@himalayaerp.com',
      rawPassword: 'Jyoti@2258',
      name: 'Jyoti Sales 12',
      firstName: 'Jyoti',
      lastName: 'Sales 12',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales14@himalayaerp.com',
      rawPassword: 'ARHIMALAYA12',
      name: 'Sales Fourteen',
      firstName: 'Sales',
      lastName: 'Fourteen',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales13@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales Thirteen',
      firstName: 'Sales',
      lastName: 'Thirteen',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'abbas.b@himalayaerp.com',
      rawPassword: 'dataAnalyst#2101',
      name: 'Abbas B',
      firstName: 'Abbas',
      lastName: 'B',
      roleCode: 'ADMIN',
      deptName: 'Super Admin Department',
      jobTitle: 'Data Analyst & Back Office Lead',
    },
    {
      email: 'moksha.n@himalayaerp.com',
      rawPassword: 'Production@hcppl',
      name: 'Moksha N',
      firstName: 'Moksha',
      lastName: 'N',
      roleCode: 'PRODUCTION_PLANNER',
      deptName: 'Production Department',
      jobTitle: 'Production Planner',
    },
    {
      email: 'ravikant.t@himalayaerp.com',
      rawPassword: 'Logistics@hcppl',
      name: 'Ravikant T',
      firstName: 'Ravikant',
      lastName: 'T',
      roleCode: 'DISPATCH_EXECUTIVE',
      deptName: 'Dispatch Department',
      jobTitle: 'Dispatch Logistics Lead 1',
      dispatchCategory: 'Category 1',
    },
    {
      email: 'makhdum@himalayaerp.com',
      rawPassword: 'Store@hcppl',
      name: 'Makhdum',
      firstName: 'Makhdum',
      lastName: 'Store',
      roleCode: 'STORE_MANAGER',
      deptName: 'Store Department',
      jobTitle: 'Store Manager',
    },
    {
      email: 'hussain.t@himalayaerp.com',
      rawPassword: 'Rnd@hcppl',
      name: 'Hussain T',
      firstName: 'Hussain',
      lastName: 'T',
      roleCode: 'PRODUCTION_PLANNER',
      deptName: 'Production Department',
      jobTitle: 'R&D & Production Specialist',
    },
    {
      email: 'sana.r@himalayaerp.com',
      rawPassword: 'Himalaya@1234',
      name: 'Sana R',
      firstName: 'Sana',
      lastName: 'R',
      roleCode: 'PLANT_HEAD',
      deptName: 'Production Department',
      jobTitle: 'Plant Head',
    },
    {
      email: 'sales1@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales One',
      firstName: 'Sales',
      lastName: 'One',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales2@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales Two',
      firstName: 'Sales',
      lastName: 'Two',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales3@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales Three',
      firstName: 'Sales',
      lastName: 'Three',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales4@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales Four',
      firstName: 'Sales',
      lastName: 'Four',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales5@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales Five',
      firstName: 'Sales',
      lastName: 'Five',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales6@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales Six',
      firstName: 'Sales',
      lastName: 'Six',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'sales7@himalayaerp.com',
      rawPassword: 'Himalaya@2026',
      name: 'Sales Seven',
      firstName: 'Sales',
      lastName: 'Seven',
      roleCode: 'SALES_EXECUTIVE',
      deptName: 'Sales Department',
      jobTitle: 'Sales Executive',
    },
    {
      email: 'supersales1@himalayaerp.com',
      rawPassword: 'supersales123',
      name: 'SuperSales One',
      firstName: 'SuperSales',
      lastName: 'One',
      roleCode: 'SUPER_SALES',
      deptName: 'Sales Department',
      jobTitle: 'SuperSales Lead',
    },
    {
      email: 'supersales2@himalayaerp.com',
      rawPassword: 'supersales124',
      name: 'SuperSales Two',
      firstName: 'SuperSales',
      lastName: 'Two',
      roleCode: 'SUPER_SALES',
      deptName: 'Sales Department',
      jobTitle: 'SuperSales Lead',
    },
    // Also HR & Super Admin
    {
      email: 'nahin.v@himalayaerp.com',
      rawPassword: 'HR@hcppl',
      name: 'Nahin V',
      firstName: 'Nahin',
      lastName: 'V',
      roleCode: 'HR',
      deptName: 'HR Department',
      jobTitle: 'HR Manager',
    },
    {
      email: 'super.admin@himalayaerp.com',
      rawPassword: 'SuperAdmin@hcppl',
      name: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      roleCode: 'SUPER_ADMIN',
      deptName: 'Super Admin Department',
      jobTitle: 'Chief Executive Officer / Super Admin',
    },
  ];

  let empCodeSeq = 1001;
  let idx = 0;
  for (const acc of accounts) {
    idx++;
    const role = roleMap[acc.roleCode];
    const dept = deptMap[acc.deptName] || deptMap['Operations'] || Object.values(deptMap)[0];
    const hashedPassword = await bcrypt.hash(acc.rawPassword, 12);
    const uniquePan = `ABCDE${String(1000 + idx)}F`;
    const uniqueAadhaarLastFour = String(1000 + idx).slice(-4);
    const uniqueAadhaarHash = `hash_aadhaar_${idx}_${Date.now()}`;
    const uniqueBankLastFour = String(5000 + idx).slice(-4);
    const uniqueBankHash = `hash_bank_${idx}_${Date.now()}`;

    // Upsert User
    let user = await prisma.user.findUnique({ where: { email: acc.email } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: acc.name,
          password: hashedPassword,
          roleId: role.id,
          companyId: company.id,
          dispatchCategory: acc.dispatchCategory || null,
          isActive: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          publicId: uid('USR'),
          email: acc.email,
          password: hashedPassword,
          name: acc.name,
          roleId: role.id,
          companyId: company.id,
          dispatchCategory: acc.dispatchCategory || null,
          isActive: true,
        },
      });
    }

    // Upsert Employee Record
    let code = `EMP-${empCodeSeq++}`;
    let employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { workEmail: acc.email },
          { employeeCode: code },
        ]
      }
    });

    if (employee) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          userId: user.id,
          firstName: acc.firstName,
          lastName: acc.lastName,
          fullName: acc.name,
          workEmail: acc.email,
          jobTitle: acc.jobTitle,
          departmentId: dept.id,
          workLocationId: workLocation.id,
          employmentType: 'PERMANENT',
          status: 'ACTIVE',
          dateOfBirth: new Date('1995-01-01'),
          gender: 'MALE',
          phoneNumber: `98765${String(10000 + idx).slice(-5)}`,
          residentialAddress: 'Ahmedabad, Gujarat',
          permanentAddress: 'Ahmedabad, Gujarat',
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '9876543219',
          emergencyRelationship: 'Family',
          panNumber: uniquePan,
          aadhaarNumberEncrypted: `enc_aadhaar_${idx}`,
          aadhaarLastFour: uniqueAadhaarLastFour,
          aadhaarHash: uniqueAadhaarHash,
          bankName: 'HDFC Bank',
          accountHolderName: acc.name,
          bankAccountType: 'SAVINGS',
          bankAccountEncrypted: `enc_bank_${idx}`,
          bankAccountLastFour: uniqueBankLastFour,
          bankAccountHash: uniqueBankHash,
          ifscCode: 'HDFC0001234',
        }
      });
    } else {
      const codeTaken = await prisma.employee.findFirst({ where: { employeeCode: code } });
      if (codeTaken) {
        code = `EMP-${empCodeSeq++}-${Date.now().toString().slice(-4)}`;
      }
      await prisma.employee.create({
        data: {
          publicId: uid('EMP'),
          employeeCode: code,
          companyId: company.id,
          userId: user.id,
          firstName: acc.firstName,
          lastName: acc.lastName,
          fullName: acc.name,
          workEmail: acc.email,
          jobTitle: acc.jobTitle,
          departmentId: dept.id,
          workLocationId: workLocation.id,
          employmentType: 'PERMANENT',
          status: 'ACTIVE',
          joiningDate: new Date('2024-01-01'),
          dateOfBirth: new Date('1995-01-01'),
          gender: 'MALE',
          phoneNumber: `98765${String(10000 + idx).slice(-5)}`,
          residentialAddress: 'Ahmedabad, Gujarat',
          permanentAddress: 'Ahmedabad, Gujarat',
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '9876543219',
          emergencyRelationship: 'Family',
          panNumber: uniquePan,
          aadhaarNumberEncrypted: `enc_aadhaar_${idx}`,
          aadhaarLastFour: uniqueAadhaarLastFour,
          aadhaarHash: uniqueAadhaarHash,
          bankName: 'HDFC Bank',
          accountHolderName: acc.name,
          bankAccountType: 'SAVINGS',
          bankAccountEncrypted: `enc_bank_${idx}`,
          bankAccountLastFour: uniqueBankLastFour,
          bankAccountHash: uniqueBankHash,
          ifscCode: 'HDFC0001234',
          baseSalary: 45000,
        }
      });
    }

    console.log(`👤 Seeded User & Employee: ${acc.email} -> ${acc.name} (${acc.roleCode} / ${acc.deptName})`);
  }

  console.log('🎉 Successfully created and synchronized all 22 requested employees, users, departments, and roles!');
}

run()
  .catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
