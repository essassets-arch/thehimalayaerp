import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting ERP seed...\n');

  // ── 1. Roles ────────────────────────────────────────────────────────────────
  console.log('📋 Seeding roles...');
  const roleDefinitions = [
    { code: 'SUPER_ADMIN',          name: 'Super Admin' },
    { code: 'ADMIN',                name: 'Admin' },
    { code: 'SALES_EXECUTIVE',      name: 'Sales Executive' },
    { code: 'SALES_MANAGER',        name: 'Sales Manager' },
    { code: 'PLANT_HEAD',           name: 'Plant Head' },
    { code: 'PRODUCTION_PLANNER',   name: 'Production Planner' },
    { code: 'PRODUCTION_OPERATOR',  name: 'Production Operator' },
    { code: 'QC_INSPECTOR',         name: 'QC Inspector' },
    { code: 'DISPATCH_EXECUTIVE',   name: 'Dispatch Executive' },
    { code: 'FINANCE_EXECUTIVE',    name: 'Finance Executive' },
    { code: 'FINANCE_MANAGER',      name: 'Finance Manager' },
    { code: 'STORE_MANAGER',        name: 'Store Manager' },
    { code: 'HR',                   name: 'HR' },
  ];

  for (const r of roleDefinitions) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: { publicId: `ROLE-${r.code}`, name: r.name, code: r.code },
    });
  }

  // ── 2. Permissions ──────────────────────────────────────────────────────────
  console.log('🔑 Seeding permissions...');
  const permissionCodes = [
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.delete', 'sales.leads.convert',
    'sales.dashboard.read',
    'sales.orders.approve', 'sales.orders.create', 'sales.orders.read', 'sales.orders.update',

    'crm.quotation.create', 'crm.quotation.read', 'crm.quotation.update',
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send', 'crm.quotations.accept', 'crm.quotations.convert', 'crm.quotations.delete',
    'dispatch.create', 'dispatch.read', 'dispatch.update',
    'logistics.dispatches.read', 'logistics.dispatches.create', 'logistics.dispatches.start-delivery', 'logistics.dispatches.confirm-delivery',
    'finance.invoice.read', 'finance.invoice.update',
    'finance.ledger.read',
    'finance.payment.create', 'finance.payment.read', 'finance.payment.update',
    'procurement.indents.create', 'procurement.indents.read', 'procurement.indents.update', 'procurement.indents.submit', 'procurement.indents.resubmit', 'procurement.indents.approve', 'procurement.indents.return', 'procurement.indents.reject', 'procurement.indents.cancel',
    'procurement.purchase_orders.create', 'procurement.purchase_orders.read', 'procurement.purchase_orders.update', 'procurement.purchase_orders.submit', 'procurement.purchase_orders.approve', 'procurement.purchase_orders.return', 'procurement.purchase_orders.reject', 'procurement.purchase_orders.issue', 'procurement.purchase_orders.vendor_status', 'procurement.purchase_orders.dispatch', 'procurement.purchase_orders.delivery_read', 'procurement.purchase_orders.closure_read', 'procurement.purchase_orders.close',
    'procurement.grns.create', 'procurement.grns.read', 'procurement.grns.update', 'procurement.grns.submit', 'procurement.grns.resubmit', 'procurement.grns.audit', 'procurement.grns.return',
    'procurement.vendor_invoices.create', 'procurement.vendor_invoices.read', 'procurement.vendor_invoices.update', 'procurement.vendor_invoices.submit', 'procurement.vendor_invoices.match', 'procurement.vendor_invoices.verify', 'procurement.vendor_invoices.request_payment', 'procurement.vendor_invoices.resolve_exception', 'procurement.vendor_invoices.cancel',
    'procurement.vendor_payments.create', 'procurement.vendor_payments.read', 'procurement.vendor_payments.update', 'procurement.vendor_payments.submit', 'procurement.vendor_payments.approve', 'procurement.vendor_payments.process', 'procurement.vendor_payments.complete', 'procurement.vendor_payments.fail', 'procurement.vendor_payments.cancel', 'procurement.audit.read', 'inventory.receipts.post', 'vendors.read', 'suppliers.read', 'products.read', 'warehouses.read', 'inventory.stock.read',
    'production.plan.approve', 'production.plan.create', 'production.plan.read', 'production.plan.release',
    'production.workorder.complete', 'production.workorder.read', 'production.workorder.start', 'production.workorder.update',
    'qc.inspection.approve', 'qc.inspection.read',

    // Original CRM / Sales (legacy/misc)
    'sample.read', 'sample.create', 'sample.dispatch', 'sample.update',
    'quotation.read', 'quotation.create', 'quotation.update', 'quotation.send', 'quotation.accept',
    'salesorder.confirm', 'salesorder.send_to_plant', 'salesorder.cancel',
    'salesorder.amend', 'salesorder.credit_override',
    // Original Production
    'production.qc.read', 'production.qc.inspect', 'production.qc.approve', 'production.qc.reject',
    // Original Dispatch
    'dispatch.confirm',
    // Original Finance
    'invoice.read', 'invoice.create', 'invoice.post', 'invoice.void',
    'payment.read', 'payment.create', 'payment.verify', 'payment.reject',
    'creditnote.read', 'creditnote.create',
    // Original After Sales
    'return.read', 'return.create', 'return.approve', 'return.reject',
    'replacement.read', 'replacement.create', 'replacement.approve',
    'complaint.read', 'complaint.create', 'complaint.resolve',
    // Original Admin
    'user.read', 'user.create', 'user.update', 'user.deactivate',
    'role.read', 'role.assign',
    'approval.approve', 'approval.reject',
    'attachment.upload', 'attachment.delete',
    'notification.read', 'comment.create', 'comment.read',
    'reports.sales', 'reports.production', 'reports.finance',
    'hr.recruitment.requests.create',
    'hr.recruitment.requests.read.own',
    'hr.recruitment.requests.read.all',
    'hr.recruitment.requests.update.own',
    'hr.recruitment.requests.withdraw',
    'hr.recruitment.requests.process',
    'hr.recruitment.requests.return',
    'hr.recruitment.requests.reject',
    'hr.recruitment.requests.fulfil',
    'hr.recruitment.candidates.create',
    'hr.recruitment.candidates.update',
    'hr.recruitment.interviews.create',
    'hr.recruitment.interviews.update',
    'hr.employees.read',
    'hr.employees.create',
    'hr.employees.update',
    'hr.employees.status.update',
    'hr.employees.documents.read',
    'hr.employees.documents.upload',
    'hr.employees.documents.delete',
    'hr.employees.sensitive.read',
    'hr.departments.read',
    'hr.locations.read',
    'hr.payroll.read',
    'hr.payroll.prepare',
    'hr.payroll.update',
    'hr.payroll.submit',
    'superadmin.payroll.read',
    'superadmin.payroll.approve',
    'superadmin.payroll.reject',
    'superadmin.payroll.hold',
    'superadmin.payroll.send_to_finance',
    'finance.payroll.read',
    'finance.payroll.process',
    'finance.payroll.pay',
    'finance.payroll.history',
    'salary_slips.read_own',
    'salary_slips.read_all',
    'salary_slips.download',
    'salary_slips.share',
    'salary_slips.revoke_share',

    // SOD Override Permissions
    'procurement.indents.override',
    'procurement.po.override',
    'procurement.grn.override',
    'finance.invoices.override',
    'finance.payments.override',
    'qc.override',
    'hr.recruitment.requests.override',
    'hr.payroll.override',

    // Controller specific aliases & domain permissions
    'admin.attachments.read', 'admin.attachments.create', 'admin.attachments.delete',
    'admin.auth.read', 'admin.users.unlock',
    'store.brand-analysis.create', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'finance.brand-analysis.read',
    'super-admin.brand-analysis.approve', 'super-admin.brand-analysis.reject', 'finance.brand-analysis.start', 'finance.brand-analysis.complete',
    'admin.comments.read', 'admin.comments.create', 'admin.comments.delete',
    'sales.customercomplaints.create', 'sales.customercomplaints.read', 'sales.customercomplaints.update', 'sales.customercomplaints.delete',
    'sales.customercomplaints.submit', 'sales.customercomplaints.approve', 'sales.customercomplaints.reject',
    'inventory.inventory.create', 'inventory.inventory.read',
    'admin.materialrequests.read', 'admin.materialrequests.create', 'admin.materialrequests.approve', 'admin.materialrequests.reject', 'admin.materialrequests.update',
    'admin.notifications.read', 'admin.notifications.update',
    'admin.planthead.read', 'admin.planthead.create',
    'procurement.procurement.read', 'procurement.procurement.create', 'procurement.procurement.reject',
    'production.productiontesting.read', 'production.productiontesting.create', 'production.productiontesting.update', 'production.productiontesting.delete',
    'production.floor.read', 'production.productionworkflow.read', 'production.floor.create', 'production.floor.start', 'production.floor.complete', 'production.floor.rework',
    'plant-head.qc-failures.read',
    'admin.products.create', 'admin.products.read', 'admin.products.update',
    'hr.recruitment.read',
    'admin.replacements.create', 'admin.replacements.read', 'admin.replacements.approve', 'admin.replacements.reject', 'admin.replacements.update',
    'sales.salesreports.read', 'sales.salesreturns.create', 'sales.salesreturns.read', 'sales.salesreturns.approve', 'sales.salesreturns.reject', 'sales.salesreturns.update',
    'sales.targets.create', 'sales.targets.read', 'sales.targets.update', 'sales.targets.delete',
    'admin.samples.create', 'admin.samples.read', 'admin.samples.update',
    'admin.storereports.read', 'procurement.suppliers.read',
    'inventory.warehouses.create', 'inventory.warehouses.read', 'inventory.warehouses.update', 'admin.workflow.read',
    'store.brand-analysis.create', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'finance.brand-analysis.read',
    'super-admin.brand-analysis.approve', 'super-admin.brand-analysis.reject', 'finance.brand-analysis.start', 'finance.brand-analysis.complete',
    'plant-head.qc-failures.read'
  ];

  for (const code of permissionCodes) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { publicId: uid('PERM'), name: code, code },
    });
  }

  // ── 3. Company ──────────────────────────────────────────────────────────────
  console.log('🏢 Seeding company...');
  const company = await prisma.company.upsert({
    where: { publicId: 'COMP-000001' },
    update: {},
    create: { publicId: 'COMP-000001', name: 'Himalaya Wellness Pvt. Ltd.' },
  });

  for (const item of [
    { code: 'HR', name: 'Human Resources' },
    { code: 'SALES', name: 'Sales' },
    { code: 'FINANCE', name: 'Finance' },
    { code: 'PRODUCTION', name: 'Production' },
    { code: 'QUALITY', name: 'Quality Control' },
  ]) {
    await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: item.code } },
      update: { name: item.name, isActive: true },
      create: { companyId: company.id, ...item },
    });
  }
  for (const item of [
    { code: 'HEAD_OFFICE', name: 'Head Office' },
    { code: 'PLANT', name: 'Plant' },
    { code: 'WAREHOUSE', name: 'Warehouse' },
    { code: 'FIELD', name: 'Field' },
    { code: 'REMOTE', name: 'Remote' },
  ]) {
    await prisma.workLocation.upsert({
      where: { companyId_code: { companyId: company.id, code: item.code } },
      update: { name: item.name, isActive: true },
      create: { companyId: company.id, ...item },
    });
  }

  // ── 4. Assign all permissions to SUPER_ADMIN and ADMIN ─────────────────────
  console.log('🔗 Assigning permissions to admin roles...');
  const adminRoles = await prisma.role.findMany({
    where: { code: { in: ['SUPER_ADMIN', 'ADMIN'] } },
  });
  const allPerms = await prisma.permission.findMany();

  for (const role of adminRoles) {
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  const ownSlipPermission = await prisma.permission.findUnique({ where: { code: 'salary_slips.read_own' } });
  if (ownSlipPermission) {
    const everyRole = await prisma.role.findMany();
    for (const role of everyRole) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: ownSlipPermission.id } },
        update: {},
        create: { roleId: role.id, permissionId: ownSlipPermission.id },
      });
    }
  }

  console.log('🔗 Assigning permissions to sales roles...');
  const salesExecRole = await prisma.role.findUnique({ where: { code: 'SALES_EXECUTIVE' } });
  const salesMgrRole = await prisma.role.findUnique({ where: { code: 'SALES_MANAGER' } });

  const commonSalesPerms = [
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.convert',
    'sales.dashboard.read',
    'sales.orders.read', 'sales.orders.create', 'sales.orders.update',
    'crm.quotation.read', 'crm.quotation.create', 'crm.quotation.update',
    'sales.customercomplaints.read', 'sales.customercomplaints.create', 'sales.customercomplaints.update',
    'sales.complaints.read', 'sales.complaints.create', 'sales.complaints.update',
    'inventory.warehouses.read', 'warehouses.read',
    'procurement.suppliers.read', 'suppliers.read',
    'inventory.inventory.read', 'inventory.stock.read',
    'products.read', 'admin.products.read',
    'admin.materialrequests.read', 'admin.materialrequests.create', 'materialrequests.read',
  ];

  const salesExecPermsList = [
    ...commonSalesPerms,
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send',
    'crm.quotations.accept', 'crm.quotations.convert',
  ];

  const salesMgrPermsList = [
    ...commonSalesPerms,
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send',
    'crm.quotations.accept', 'crm.quotations.convert', 'crm.quotations.delete',
  ];

  if (salesExecRole) {
    const perms = await prisma.permission.findMany({ where: { code: { in: salesExecPermsList } } });
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: salesExecRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: salesExecRole.id, permissionId: perm.id },
      });
    }
  }

  if (salesMgrRole) {
    const perms = await prisma.permission.findMany({ where: { code: { in: salesMgrPermsList } } });
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: salesMgrRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: salesMgrRole.id, permissionId: perm.id },
      });
    }
  }

  console.log('Assigning permissions to finance roles...');
  const financeRoles = await prisma.role.findMany({
    where: { code: { in: ['FINANCE_EXECUTIVE', 'FINANCE_MANAGER'] } },
  });
  const financePerms = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'finance.payment.read',
          'finance.payment.update',
          'sales.customers.read',
          'finance.payroll.read',
          'finance.payroll.process',
          'finance.payroll.pay',
          'finance.payroll.history',
          'salary_slips.read_all',
          'salary_slips.download',
          'salary_slips.share',
          'salary_slips.revoke_share',
        ],
      },
    },
  });

  for (const role of financeRoles) {
    for (const perm of financePerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  console.log('🔗 Assigning procurement permissions to operational roles...');
  const procurementPerms = await prisma.permission.findMany({
    where: {
      code: {
        startsWith: 'procurement.',
      },
    },
  });

  const operationalRoles = await prisma.role.findMany({
    where: {
      code: {
        in: ['PLANT_HEAD', 'STORE_MANAGER', 'PRODUCTION_PLANNER', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
      },
    },
  });

  for (const role of operationalRoles) {
    for (const perm of procurementPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // Procurement permissions are deliberately assigned by role rather than
  // inferred in controllers; users must sign in again after reseeding so JWT
  // permission claims are refreshed.
  const procurementRolePermissions: Record<string, string[]> = {
    STORE_MANAGER: ['procurement.indents.create','procurement.indents.read','procurement.indents.update','procurement.indents.submit','procurement.indents.resubmit','procurement.indents.cancel','procurement.purchase_orders.read','procurement.purchase_orders.delivery_read','procurement.purchase_orders.closure_read','procurement.grns.create','procurement.grns.read','procurement.grns.update','procurement.grns.submit','procurement.grns.resubmit','procurement.vendor_invoices.read','procurement.vendor_payments.read','procurement.audit.read','suppliers.read','procurement.suppliers.read','products.read','warehouses.read','inventory.warehouses.read','inventory.stock.read','inventory.inventory.read'],
    PLANT_HEAD: ['procurement.indents.read','procurement.indents.approve','procurement.indents.return','procurement.indents.reject','procurement.purchase_orders.read','procurement.purchase_orders.closure_read','procurement.grns.read','procurement.vendor_invoices.read','procurement.vendor_payments.read','procurement.audit.read','products.read','warehouses.read','inventory.warehouses.read','inventory.stock.read','inventory.inventory.read','procurement.suppliers.read','suppliers.read'],
    FINANCE_EXECUTIVE: ['procurement.indents.read','procurement.purchase_orders.create','procurement.purchase_orders.read','procurement.purchase_orders.update','procurement.purchase_orders.submit','procurement.purchase_orders.issue','procurement.purchase_orders.vendor_status','procurement.purchase_orders.dispatch','procurement.purchase_orders.closure_read','procurement.purchase_orders.close','procurement.grns.read','procurement.grns.audit','procurement.grns.return','procurement.vendor_invoices.create','procurement.vendor_invoices.read','procurement.vendor_invoices.update','procurement.vendor_invoices.submit','procurement.vendor_invoices.match','procurement.vendor_invoices.resolve_exception','procurement.vendor_invoices.verify','procurement.vendor_invoices.request_payment','procurement.vendor_invoices.cancel','procurement.vendor_payments.create','procurement.vendor_payments.read','procurement.vendor_payments.update','procurement.vendor_payments.submit','procurement.vendor_payments.process','procurement.vendor_payments.complete','procurement.vendor_payments.fail','procurement.vendor_payments.cancel','inventory.receipts.post','suppliers.read','procurement.suppliers.read','products.read','warehouses.read','inventory.warehouses.read','inventory.inventory.read'],
    FINANCE_MANAGER: ['procurement.indents.read','procurement.purchase_orders.create','procurement.purchase_orders.read','procurement.purchase_orders.update','procurement.purchase_orders.submit','procurement.purchase_orders.issue','procurement.purchase_orders.vendor_status','procurement.purchase_orders.dispatch','procurement.purchase_orders.closure_read','procurement.purchase_orders.close','procurement.grns.read','procurement.grns.audit','procurement.grns.return','procurement.vendor_invoices.create','procurement.vendor_invoices.read','procurement.vendor_invoices.update','procurement.vendor_invoices.submit','procurement.vendor_invoices.match','procurement.vendor_invoices.resolve_exception','procurement.vendor_invoices.verify','procurement.vendor_invoices.request_payment','procurement.vendor_invoices.cancel','procurement.vendor_payments.create','procurement.vendor_payments.read','procurement.vendor_payments.update','procurement.vendor_payments.submit','procurement.vendor_payments.process','procurement.vendor_payments.complete','procurement.vendor_payments.fail','procurement.vendor_payments.cancel','inventory.receipts.post','suppliers.read','procurement.suppliers.read','products.read','warehouses.read','inventory.warehouses.read','inventory.inventory.read'],
    SUPER_ADMIN: ['procurement.purchase_orders.read','procurement.purchase_orders.approve','procurement.purchase_orders.return','procurement.purchase_orders.reject','procurement.purchase_orders.closure_read','procurement.vendor_invoices.read','procurement.vendor_payments.read','procurement.vendor_payments.approve','procurement.audit.read'],
  };
  for (const [roleCode, codes] of Object.entries(procurementRolePermissions)) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    const permissions = await prisma.permission.findMany({ where: { code: { in: codes } } });
    if (role) for (const permission of permissions) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
  }

  const plantHeadRole = await prisma.role.findUnique({ where: { code: 'PLANT_HEAD' } });
  const plantHeadPermissions = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'sales.orders.read',
          'sales.orders.update',
          'production.plan.read',
          'production.plan.create',
          'production.plan.approve',
          'production.plan.release',
          'production.workorder.update',
          'qc.inspection.read',
          'dispatch.create',
          'dispatch.read',
          'dispatch.update',
          'logistics.dispatches.read',
          'logistics.dispatches.create',
          'logistics.dispatches.start-delivery',
          'logistics.dispatches.confirm-delivery',
          'hr.recruitment.requests.create',
          'hr.recruitment.requests.read.own',
          'hr.recruitment.requests.update.own',
          'hr.recruitment.requests.withdraw',
        ],
      },
    },
  });
  if (plantHeadRole) {
    for (const permission of plantHeadPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: plantHeadRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: plantHeadRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const hrRole = await prisma.role.findUnique({ where: { code: 'HR' } });
  const hrPermissions = await prisma.permission.findMany({
    where: { OR: [{ code: { startsWith: 'hr.' } }, { code: { startsWith: 'salary_slips.' } }] },
  });
  if (hrRole) {
    for (const permission of hrPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: hrRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: hrRole.id, permissionId: permission.id },
      });
    }
  }

  // ── 5. Users (one per role) ─────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const productionRoles = await prisma.role.findMany({
    where: { code: { in: ['PLANT_HEAD', 'PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR'] } },
  });
  const productionPermissions = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'production.plan.read',
          'production.plan.create',
          'production.plan.approve',
          'production.plan.release',
          'production.workorder.read',
          'production.workorder.start',
          'production.workorder.complete',
          'production.workorder.update',
          'qc.inspection.read',
          'admin.materialrequests.read',
          'admin.materialrequests.create',
          'admin.materialrequests.approve',
          'materialrequests.read',
        ],
      },
    },
  });
  for (const role of productionRoles) {
    for (const permission of productionPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Dispatch users need read access to the production queue that feeds their
  // dashboard, in addition to permission to create and progress dispatches.
  const dispatchRole = await prisma.role.findUnique({
    where: { code: 'DISPATCH_EXECUTIVE' },
  });
  const dispatchPermissions = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'production.workorder.read',
          'production.workorder.update',
          'sales.orders.read',
          'dispatch.create',
          'dispatch.read',
          'dispatch.update',
          'logistics.dispatches.read',
          'logistics.dispatches.create',
          'logistics.dispatches.start-delivery',
          'logistics.dispatches.confirm-delivery',
        ],
      },
    },
  });
  if (dispatchRole) {
    for (const permission of dispatchPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: dispatchRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: dispatchRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Temporarily grant dispatch creation to all roles for end-to-end testing convenience
  console.log('🔗 Assigning dispatch permissions to all roles for testing...');
  const everyRoleAgain = await prisma.role.findMany();
  const allDispatchPerms = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'dispatch.create',
          'dispatch.read',
          'dispatch.update',
          'logistics.dispatches.read',
          'logistics.dispatches.create',
          'logistics.dispatches.start-delivery',
          'logistics.dispatches.confirm-delivery',
        ],
      },
    },
  });
  for (const role of everyRoleAgain) {
    for (const permission of allDispatchPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log('🔗 Assigning catalog and QC permissions to all roles...');
  const globalCatalogPerms = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'products.read',
          'admin.products.read',
          'warehouses.read',
          'inventory.warehouses.read',
          'suppliers.read',
          'procurement.suppliers.read',
          'inventory.stock.read',
          'inventory.inventory.read',
          'admin.materialrequests.read',
          'materialrequests.read',
          'production.qc.read',
          'qc.inspection.read',
          'production.productionworkflow.read',
          'production.finishedgoods.read',
          'finance.brand-analysis.read',
          'store.brand-analysis.read',
          'super-admin.brand-analysis.read',
          'admin.replacements.create',
          'admin.replacements.read',
          'admin.replacements.approve',
          'admin.replacements.reject',
          'admin.replacements.update',
          'production.qc.approve',
          'qc.inspection.approve',
          'production.qc.reject',
          'qc.inspection.reject',
          'production.floor.complete',
        ],
      },
    },
  });

  const allRolesInSystem = await prisma.role.findMany();
  for (const role of allRolesInSystem) {
    for (const perm of globalCatalogPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: perm.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  console.log('👤 Seeding sample customers & products...');
  const sampleCustomers = [
    { companyName: 'Karan Enterprises', customerCode: 'CUST-001', email: 'karan@enterprises.com', phone: '+91 9876543210', contactPerson: 'Karan Sharma' },
    { companyName: 'Himalaya Distributors', customerCode: 'CUST-002', email: 'contact@himalayadist.com', phone: '+91 9812345678', contactPerson: 'Rahul Verma' },
    { companyName: 'Acme Health & Care', customerCode: 'CUST-003', email: 'orders@acmehealth.com', phone: '+91 9898989898', contactPerson: 'Priya Gupta' },
    { companyName: 'Lead Company 663544576', customerCode: 'CUST-004', email: 'info@leadco.com', phone: '+91 9777666555', contactPerson: 'Suresh Kumar' },
  ];

  for (const cust of sampleCustomers) {
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { companyName: cust.companyName },
          { customerCode: cust.customerCode },
        ],
      },
    });
    if (!existing) {
      await prisma.customer.create({
        data: {
          companyId: company.id,
          companyName: cust.companyName,
          customerCode: cust.customerCode,
          email: cust.email,
          phone: cust.phone,
          contactPerson: cust.contactPerson,
          status: 'ACTIVE',
        },
      });
    }
  }

  const sampleProducts = [
    { publicId: 'PROD-001', name: 'Herbal Shampoo 500ml', sku: 'SKU-HS500', unit: 'Bottle', unitPrice: 350.00, category: 'Personal Care' },
    { publicId: 'PROD-002', name: 'Organic Neem Face Wash 150ml', sku: 'SKU-NFW150', unit: 'Tube', unitPrice: 180.00, category: 'Skincare' },
    { publicId: 'PROD-003', name: 'Ayurvedic Toothpaste 200g', sku: 'SKU-ATP200', unit: 'Pack', unitPrice: 120.00, category: 'Oral Care' },
    { publicId: 'PROD-004', name: 'Item (1 Qty)', sku: 'SKU-ITEM1', unit: 'Unit', unitPrice: 1416.00, category: 'General' },
    { publicId: 'PROD-005', name: 'Item (100 Qty)', sku: 'SKU-ITEM100', unit: 'Box', unitPrice: 42000.00, category: 'Bulk' },
  ];

  for (const prod of sampleProducts) {
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { publicId: prod.publicId },
          { name: prod.name },
          { sku: prod.sku },
        ],
      },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          companyId: company.id,
          publicId: prod.publicId,
          name: prod.name,
          sku: prod.sku,
          unit: prod.unit,
          unitPrice: prod.unitPrice,
          category: prod.category,
          isActive: true,
        },
      });
    }
  }

  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const allRoles = await prisma.role.findMany();

  for (const role of allRoles) {
    const emailSlug = role.code.toLowerCase().replace(/_/g, '.');
    const email = (role.code === 'SUPER_ADMIN' && process.env.INITIAL_ADMIN_EMAIL)
      ? process.env.INITIAL_ADMIN_EMAIL
      : `${emailSlug}@himalayaerp.com`;

    await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        publicId: uid('USR'),
        email,
        password: hashedPassword,
        name: role.name,
        roleId: role.id,
        companyId: company.id,
      },
    });
  }

  // ── 6. Document Sequences ───────────────────────────────────────────────────
  console.log('🔢 Seeding document sequences...');
  const currentYear = new Date().getFullYear();

  const sequences = [
    { documentType: 'LEAD',   prefix: 'LEAD' },
    { documentType: 'SAMPLE', prefix: 'SAMP' },
    { documentType: 'QT',     prefix: 'QT'   },
    { documentType: 'SO',     prefix: 'SO'   },
    { documentType: 'PP',     prefix: 'PP'   },   // Production Plan
    { documentType: 'WO',     prefix: 'WO'   },   // Work Order
    { documentType: 'BATCH',  prefix: 'BATCH'},
    { documentType: 'QC',     prefix: 'QC'   },
    { documentType: 'DISP',   prefix: 'DISP' },
    { documentType: 'INV',    prefix: 'INV'  },
    { documentType: 'PAY',    prefix: 'PAY'  },
    { documentType: 'RET',    prefix: 'RET'  },
    { documentType: 'REPL',   prefix: 'REPL' },
    { documentType: 'COMP',   prefix: 'COMP' },   // Complaint
    { documentType: 'PO',     prefix: 'PO'   },   // Purchase Order
    { documentType: 'GRN',    prefix: 'GRN'  },   // Goods Receipt Note
    { documentType: 'AMEND',  prefix: 'AMD'  },   // Order Amendment
  ];

  for (const seq of sequences) {
    await prisma.documentSequence.upsert({
      where: { companyId_documentType_year: { companyId: company.id, documentType: seq.documentType, year: currentYear } },
      update: {},
      create: {
        companyId: company.id,
        documentType: seq.documentType,
        prefix: seq.prefix,
        year: currentYear,
        currentNumber: 0,
      },
    });
  }

  // ── 7. Workflow Definitions ─────────────────────────────────────────────────
  console.log('⚙️  Seeding workflow definitions...');

  const workflows: {
    code: string;
    name: string;
    states: { code: string; name: string; sequence: number; isInitial?: boolean; isFinal?: boolean }[];
    transitions: { from: string; to: string; actionName: string; actionLabel: string; requiredRole?: string; requiresApproval?: boolean; allowReject?: boolean }[];
  }[] = [
    {
      code: 'LEAD',
      name: 'Lead Workflow',
      states: [
        { code: 'NEW',                    name: 'New',                    sequence: 1, isInitial: true },
        { code: 'CONTACTED',              name: 'Contacted',              sequence: 2 },
        { code: 'REQUIREMENT_IDENTIFIED', name: 'Requirement Identified', sequence: 3 },
        { code: 'QUOTATION_SENT',         name: 'Quotation Sent',         sequence: 4 },
        { code: 'NEGOTIATION',            name: 'Negotiation',            sequence: 5 },
        { code: 'WON',                    name: 'Won',                    sequence: 6, isFinal: true },
        { code: 'LOST',                   name: 'Lost',                   sequence: 7, isFinal: true },
      ],
      transitions: [
        { from: 'NEW',                    to: 'CONTACTED',              actionName: 'CONTACT',      actionLabel: 'Mark Contacted' },
        { from: 'CONTACTED',              to: 'REQUIREMENT_IDENTIFIED', actionName: 'IDENTIFY_REQ', actionLabel: 'Identify Req' },
        { from: 'REQUIREMENT_IDENTIFIED', to: 'QUOTATION_SENT',         actionName: 'SEND_QUOTE',   actionLabel: 'Send Quote' },
        { from: 'QUOTATION_SENT',         to: 'NEGOTIATION',            actionName: 'NEGOTIATE',    actionLabel: 'Start Negotiation' },
        { from: 'NEGOTIATION',            to: 'WON',                    actionName: 'WON',          actionLabel: 'Mark Won' },
        
        { from: 'NEW',                    to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'CONTACTED',              to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'REQUIREMENT_IDENTIFIED', to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'QUOTATION_SENT',         to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'NEGOTIATION',            to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
      ],
    },
    {
      code: 'QUOTATION',
      name: 'Quotation Workflow',
      states: [
        { code: 'NEW',              name: 'New',               sequence: 0, isInitial: true },
        { code: 'DRAFT',            name: 'Draft',             sequence: 1, isInitial: true },
        { code: 'INTERNAL_REVIEW',  name: 'Internal Review',   sequence: 2 },
        { code: 'SENT',             name: 'Sent',              sequence: 3 },
        { code: 'NEGOTIATION',      name: 'Negotiation',       sequence: 4 },
        { code: 'APPROVED',         name: 'Approved',          sequence: 5 },
        { code: 'CONVERTED_TO_SO',  name: 'Converted to SO',   sequence: 6, isFinal: true },
        { code: 'REJECTED',         name: 'Rejected',          sequence: 7, isFinal: true },
        { code: 'EXPIRED',          name: 'Expired',           sequence: 8, isFinal: true },
        { code: 'CANCELLED',        name: 'Cancelled',         sequence: 9, isFinal: true },
        { code: 'SUPERSEDED',       name: 'Superseded',        sequence: 10, isFinal: true },
      ],
      transitions: [
        { from: 'NEW',               to: 'SENT',              actionName: 'SEND',          actionLabel: 'Send directly to Customer' },
        { from: 'NEW',               to: 'INTERNAL_REVIEW',   actionName: 'SUBMIT_REVIEW', actionLabel: 'Submit for Review' },
        { from: 'NEW',               to: 'APPROVED',          actionName: 'APPROVE',       actionLabel: 'Approve' },
        { from: 'NEW',               to: 'CANCELLED',         actionName: 'CANCEL',        actionLabel: 'Cancel' },
        { from: 'DRAFT',             to: 'INTERNAL_REVIEW',   actionName: 'SUBMIT_REVIEW', actionLabel: 'Submit for Review' },
        { from: 'INTERNAL_REVIEW',   to: 'SENT',              actionName: 'SEND',          actionLabel: 'Send to Customer' },
        { from: 'DRAFT',             to: 'SENT',              actionName: 'SEND',          actionLabel: 'Send directly to Customer' },
        { from: 'SENT',              to: 'NEGOTIATION',       actionName: 'NEGOTIATE',     actionLabel: 'Start Negotiation' },
        { from: 'SENT',              to: 'APPROVED',          actionName: 'APPROVE',       actionLabel: 'Approve' },
        { from: 'NEGOTIATION',       to: 'APPROVED',          actionName: 'APPROVE',       actionLabel: 'Approve' },
        { from: 'APPROVED',          to: 'CONVERTED_TO_SO',   actionName: 'CONVERT',       actionLabel: 'Convert to Sales Order' },
        
        { from: 'INTERNAL_REVIEW',   to: 'REJECTED',          actionName: 'REJECT',        actionLabel: 'Reject' },
        { from: 'SENT',              to: 'REJECTED',          actionName: 'REJECT',        actionLabel: 'Reject' },
        { from: 'NEGOTIATION',       to: 'REJECTED',          actionName: 'REJECT',        actionLabel: 'Reject' },
        
        { from: 'DRAFT',             to: 'CANCELLED',         actionName: 'CANCEL',        actionLabel: 'Cancel' },
        
        { from: 'SENT',              to: 'EXPIRED',           actionName: 'EXPIRE',        actionLabel: 'Mark Expired' },
      ],
    },
    {
      code: 'SALES_ORDER',
      name: 'Sales Order Workflow',
      states: [
        { code: 'DRAFT',              name: 'Draft',              sequence: 1,  isInitial: true },
        { code: 'PENDING_APPROVAL',   name: 'Pending Approval',   sequence: 2 },
        { code: 'CONFIRMED',          name: 'Confirmed',          sequence: 3 },
        { code: 'SENT_TO_PLANT',      name: 'Sent to Plant',      sequence: 4 },
        { code: 'PLANT_APPROVED',     name: 'Plant Approved',     sequence: 5 },
        { code: 'READY_FOR_PRODUCTION', name: 'Ready for Production', sequence: 6 },
        { code: 'IN_PRODUCTION',      name: 'In Production',      sequence: 7 },
        { code: 'READY_FOR_DISPATCH', name: 'Ready for Dispatch', sequence: 8 },
        { code: 'COMPLETED',          name: 'Completed',          sequence: 9,  isFinal: true },
        { code: 'CANCELLED',          name: 'Cancelled',          sequence: 10, isFinal: true },
      ],
      transitions: [
        { from: 'DRAFT',               to: 'PENDING_APPROVAL',    actionName: 'SUBMIT',          actionLabel: 'Submit for Approval',   requiredRole: 'SALES_EXECUTIVE' },
        { from: 'PENDING_APPROVAL',    to: 'CONFIRMED',           actionName: 'CONFIRM',         actionLabel: 'Confirm Order',         requiredRole: 'SALES_MANAGER', requiresApproval: true },
        { from: 'CONFIRMED',           to: 'SENT_TO_PLANT',       actionName: 'SEND_TO_PLANT',   actionLabel: 'Send to Plant Head',    requiredRole: 'SALES_MANAGER' },
        { from: 'SENT_TO_PLANT',       to: 'PLANT_APPROVED',      actionName: 'PLANT_APPROVE',   actionLabel: 'Approve at Plant',      requiredRole: 'PLANT_HEAD', requiresApproval: true },
        { from: 'PLANT_APPROVED',      to: 'READY_FOR_PRODUCTION',actionName: 'PLAN_PRODUCTION', actionLabel: 'Mark Ready for Prod.',  requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'READY_FOR_PRODUCTION',to: 'IN_PRODUCTION',       actionName: 'START_PRODUCTION',actionLabel: 'Start Production',      requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'IN_PRODUCTION',       to: 'READY_FOR_DISPATCH',  actionName: 'MARK_READY',      actionLabel: 'Mark Ready for Dispatch',requiredRole: 'QC_INSPECTOR' },
        { from: 'READY_FOR_DISPATCH',  to: 'COMPLETED',           actionName: 'COMPLETE',        actionLabel: 'Close Order',           requiredRole: 'FINANCE_MANAGER' },
        { from: 'DRAFT',               to: 'CANCELLED',           actionName: 'CANCEL',          actionLabel: 'Cancel Order',          requiredRole: 'SALES_MANAGER' },
        { from: 'PENDING_APPROVAL',    to: 'CANCELLED',           actionName: 'CANCEL',          actionLabel: 'Cancel Order',          requiredRole: 'SALES_MANAGER' },
      ],
    },
    {
      code: 'PRODUCTION_PLAN',
      name: 'Production Plan Workflow',
      states: [
        { code: 'DRAFT',       name: 'Draft',        sequence: 1, isInitial: true },
        { code: 'UNDER_REVIEW',name: 'Under Review', sequence: 2 },
        { code: 'APPROVED',    name: 'Approved',     sequence: 3 },
        { code: 'RELEASED',    name: 'Released',     sequence: 4 },
        { code: 'IN_PROGRESS', name: 'In Progress',  sequence: 5 },
        { code: 'COMPLETED',   name: 'Completed',    sequence: 6, isFinal: true },
        { code: 'CANCELLED',   name: 'Cancelled',    sequence: 7, isFinal: true },
      ],
      transitions: [
        { from: 'DRAFT',        to: 'UNDER_REVIEW', actionName: 'SUBMIT',   actionLabel: 'Submit for Review',  requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'UNDER_REVIEW', to: 'APPROVED',     actionName: 'APPROVE',  actionLabel: 'Approve Plan',       requiredRole: 'PLANT_HEAD', requiresApproval: true },
        { from: 'APPROVED',     to: 'RELEASED',     actionName: 'RELEASE',  actionLabel: 'Release to Floor',   requiredRole: 'PLANT_HEAD' },
        { from: 'RELEASED',     to: 'IN_PROGRESS',  actionName: 'START',    actionLabel: 'Start Production',   requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'IN_PROGRESS',  to: 'COMPLETED',    actionName: 'COMPLETE', actionLabel: 'Mark Completed',     requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'DRAFT',        to: 'CANCELLED',    actionName: 'CANCEL',   actionLabel: 'Cancel Plan',        requiredRole: 'PLANT_HEAD' },
        { from: 'UNDER_REVIEW', to: 'CANCELLED',    actionName: 'REJECT',   actionLabel: 'Reject Plan',        requiredRole: 'PLANT_HEAD' },
      ],
    },
    {
      code: 'WORK_ORDER',
      name: 'Work Order Workflow',
      states: [
        { code: 'CREATED',          name: 'Created',           sequence: 1, isInitial: true },
        { code: 'MATERIAL_PENDING', name: 'Material Pending',  sequence: 2 },
        { code: 'READY',            name: 'Ready',             sequence: 3 },
        { code: 'STARTED',          name: 'Started',           sequence: 4 },
        { code: 'PARTIALLY_COMPLETED', name: 'Partially Completed', sequence: 5 },
        { code: 'COMPLETED',        name: 'Completed',         sequence: 6, isFinal: true },
        { code: 'CANCELLED',        name: 'Cancelled',         sequence: 7, isFinal: true },
      ],
      transitions: [
        { from: 'CREATED',          to: 'READY',            actionName: 'ACCEPT',            actionLabel: 'Accept Work Order', requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'CREATED',          to: 'CANCELLED',        actionName: 'REJECT',            actionLabel: 'Reject Work Order', requiredRole: 'PRODUCTION_PLANNER', allowReject: true },
        { from: 'CREATED',          to: 'MATERIAL_PENDING', actionName: 'REQUEST_MATERIALS', actionLabel: 'Request Materials', requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'MATERIAL_PENDING', to: 'READY',            actionName: 'ISSUE_MATERIALS',   actionLabel: 'Issue Materials',   requiredRole: 'STORE_MANAGER' },
        { from: 'READY',            to: 'STARTED',          actionName: 'START',             actionLabel: 'Start Job',         requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'STARTED',          to: 'PARTIALLY_COMPLETED', actionName: 'LOG_BATCH',      actionLabel: 'Log Batch',         requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'PARTIALLY_COMPLETED', to: 'PARTIALLY_COMPLETED', actionName: 'LOG_BATCH',   actionLabel: 'Log Additional Batch', requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'STARTED',          to: 'COMPLETED',        actionName: 'COMPLETE',          actionLabel: 'Complete Job',      requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'PARTIALLY_COMPLETED', to: 'COMPLETED',     actionName: 'COMPLETE',          actionLabel: 'Complete Job',      requiredRole: 'PRODUCTION_OPERATOR' },
      ],
    },
    {
      code: 'QC_INSPECTION',
      name: 'QC Inspection Workflow',
      states: [
        { code: 'PENDING',         name: 'Pending',         sequence: 1, isInitial: true },
        { code: 'IN_PROGRESS',     name: 'In Progress',     sequence: 2 },
        { code: 'APPROVED',        name: 'Approved',        sequence: 3, isFinal: true },
        { code: 'REJECTED',        name: 'Rejected',        sequence: 4, isFinal: true },
        { code: 'REWORK_REQUIRED', name: 'Rework Required', sequence: 5, isFinal: true },
      ],
      transitions: [
        { from: 'PENDING',     to: 'IN_PROGRESS',     actionName: 'START',   actionLabel: 'Start Inspection', requiredRole: 'QC_INSPECTOR' },
        { from: 'IN_PROGRESS', to: 'APPROVED',        actionName: 'APPROVE', actionLabel: 'Approve',          requiredRole: 'QC_INSPECTOR' },
        { from: 'IN_PROGRESS', to: 'REJECTED',        actionName: 'REJECT',  actionLabel: 'Reject',           requiredRole: 'QC_INSPECTOR', allowReject: true },
        { from: 'IN_PROGRESS', to: 'REWORK_REQUIRED', actionName: 'REWORK',  actionLabel: 'Send to Rework',   requiredRole: 'QC_INSPECTOR' },
      ],
    },
    {
      code: 'DISPATCH',
      name: 'Dispatch Workflow',
      states: [
        { code: 'CREATED',            name: 'Created',            sequence: 1, isInitial: true },
        { code: 'READY',              name: 'Ready',              sequence: 2 },
        { code: 'IN_TRANSIT',         name: 'In Transit',         sequence: 3 },
        { code: 'PARTIALLY_DELIVERED',name: 'Partially Delivered',sequence: 4 },
        { code: 'DELIVERED',          name: 'Delivered',          sequence: 5 },
        { code: 'COMPLETED',          name: 'Completed',          sequence: 6, isFinal: true },
      ],
      transitions: [
        { from: 'CREATED',             to: 'READY',               actionName: 'READY_FOR_DISPATCH', actionLabel: 'Mark Ready',         requiredRole: 'DISPATCH_EXECUTIVE' },
        { from: 'READY',               to: 'IN_TRANSIT',          actionName: 'DISPATCH',           actionLabel: 'Dispatch',           requiredRole: 'DISPATCH_EXECUTIVE' },
        { from: 'IN_TRANSIT',          to: 'PARTIALLY_DELIVERED', actionName: 'PARTIAL_DELIVERY',   actionLabel: 'Partial Delivery' },
        { from: 'IN_TRANSIT',          to: 'DELIVERED',           actionName: 'DELIVER',            actionLabel: 'Confirm Delivery' },
        { from: 'PARTIALLY_DELIVERED', to: 'DELIVERED',           actionName: 'DELIVER',            actionLabel: 'Confirm Full Delivery' },
        { from: 'DELIVERED',           to: 'COMPLETED',           actionName: 'COMPLETE',           actionLabel: 'Close Dispatch' },
      ],
    },
    {
      code: 'INVOICE',
      name: 'Invoice Workflow',
      states: [
        { code: 'DRAFT',          name: 'Draft',           sequence: 1, isInitial: true },
        { code: 'POSTED',         name: 'Posted',          sequence: 2 },
        { code: 'PARTIALLY_PAID', name: 'Partially Paid',  sequence: 3 },
        { code: 'PAID',           name: 'Paid',            sequence: 4, isFinal: true },
        { code: 'VOID',           name: 'Void',            sequence: 5, isFinal: true },
        { code: 'CANCELLED',      name: 'Cancelled',       sequence: 6, isFinal: true },
      ],
      transitions: [
        { from: 'DRAFT',          to: 'POSTED',         actionName: 'POST',    actionLabel: 'Post Invoice',       requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'POSTED',         to: 'PARTIALLY_PAID', actionName: 'PARTIAL', actionLabel: 'Record Partial Pay' },
        { from: 'PARTIALLY_PAID', to: 'PARTIALLY_PAID', actionName: 'PARTIAL', actionLabel: 'Record More Payment' },
        { from: 'POSTED',         to: 'PAID',           actionName: 'PAY',     actionLabel: 'Mark Fully Paid' },
        { from: 'PARTIALLY_PAID', to: 'PAID',           actionName: 'PAY',     actionLabel: 'Mark Fully Paid' },
        { from: 'DRAFT',          to: 'CANCELLED',      actionName: 'CANCEL',  actionLabel: 'Cancel Invoice',     requiredRole: 'FINANCE_MANAGER' },
        { from: 'POSTED',         to: 'VOID',           actionName: 'VOID',    actionLabel: 'Void Invoice',       requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
      ],
    },
    {
      code: 'CUSTOMER_PAYMENT',
      name: 'Customer Payment Workflow',
      states: [
        { code: 'RECEIVED',                     name: 'Received',                     sequence: 1, isInitial: true },
        { code: 'FINANCE_VERIFICATION_PENDING', name: 'Finance Verification Pending', sequence: 2 },
        { code: 'FINANCE_VERIFIED',             name: 'Finance Verified',             sequence: 3 },
        { code: 'PARTIALLY_ALLOCATED',          name: 'Partially Allocated',          sequence: 4 },
        { code: 'ALLOCATED',                    name: 'Allocated',                    sequence: 5, isFinal: true },
        { code: 'BOUNCED',                      name: 'Bounced',                      sequence: 6, isFinal: true },
      ],
      transitions: [
        { from: 'RECEIVED',                     to: 'FINANCE_VERIFICATION_PENDING', actionName: 'SUBMIT_VERIFICATION', actionLabel: 'Submit for Verification', requiredRole: 'SALES_EXECUTIVE' },
        { from: 'FINANCE_VERIFICATION_PENDING', to: 'FINANCE_VERIFIED',             actionName: 'VERIFY',              actionLabel: 'Verify Payment',         requiredRole: 'FINANCE_EXECUTIVE', requiresApproval: true },
        { from: 'FINANCE_VERIFIED',             to: 'PARTIALLY_ALLOCATED',          actionName: 'ALLOCATE',            actionLabel: 'Allocate Funds',         requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'PARTIALLY_ALLOCATED', to: 'PARTIALLY_ALLOCATED', actionName: 'ALLOCATE',      actionLabel: 'Allocate More',      requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'FINANCE_VERIFIED',    to: 'ALLOCATED',           actionName: 'ALLOCATE_FULL', actionLabel: 'Fully Allocate',     requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'PARTIALLY_ALLOCATED', to: 'ALLOCATED',           actionName: 'ALLOCATE_FULL', actionLabel: 'Fully Allocate',     requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'RECEIVED',            to: 'BOUNCED',             actionName: 'MARK_BOUNCED',  actionLabel: 'Mark as Bounced',    requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
        { from: 'FINANCE_VERIFICATION_PENDING', to: 'BOUNCED',    actionName: 'MARK_BOUNCED',  actionLabel: 'Reject/Bounce',      requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
        { from: 'FINANCE_VERIFIED',    to: 'BOUNCED',             actionName: 'MARK_BOUNCED',  actionLabel: 'Mark as Bounced',    requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
      ],
    },
  ];

  for (const wf of workflows) {
    const workflow = await prisma.workflowDefinition.upsert({
      where: { code: wf.code },
      update: { name: wf.name },
      create: { code: wf.code, name: wf.name },
    });

    // States
    const stateMap: Record<string, string> = {};
    for (const s of wf.states) {
      const existing = await prisma.workflowState.findFirst({
        where: { workflowId: workflow.id, code: s.code },
      });
      const state = existing
        ? await prisma.workflowState.update({
            where: { id: existing.id },
            data: { name: s.name, sequence: s.sequence, isInitial: s.isInitial ?? false, isFinal: s.isFinal ?? false },
          })
        : await prisma.workflowState.create({
            data: {
              workflowId: workflow.id,
              code: s.code,
              name: s.name,
              sequence: s.sequence,
              isInitial: s.isInitial ?? false,
              isFinal: s.isFinal ?? false,
            },
          });
      stateMap[s.code] = state.id;
    }

    // Transitions
    for (const t of wf.transitions) {
      await prisma.workflowTransition.upsert({
        where: {
          id: (await prisma.workflowTransition.findFirst({
            where: {
              workflowId: workflow.id,
              fromStateId: stateMap[t.from],
              toStateId: stateMap[t.to],
            },
          }))?.id ?? 'nonexistent',
        },
        update: {},
        create: {
          workflowId: workflow.id,
          fromStateId: stateMap[t.from],
          toStateId: stateMap[t.to],
          actionName: t.actionName,
          actionLabel: t.actionLabel,
          requiredRole: t.requiredRole,
          requiresApproval: t.requiresApproval ?? false,
          allowReject: false,
        },
      });
    }

    console.log(`  ✓ ${wf.name}`);
  }

  // ── 9. Seed Inventory Items ───────────────────────────────────────────────
  console.log('📦 Seeding inventory items...');
  const inventoryItemsList = [
    { srNo: 1, itemName: 'WATER PAPER 60', code: 'HCPPL001', unit: 'ROLL', balance: 1, category: 'Hardware', minStock: 20 },
    { srNo: 2, itemName: 'WATER PAPER 80', code: 'HCPPL002', unit: 'PCS', balance: 1890, category: 'Hardware', minStock: 20 },
    { srNo: 3, itemName: 'WATER PAPER 120', code: 'HCPPL003', unit: 'PCS', balance: 32, category: 'Hardware', minStock: 20 },
    { srNo: 4, itemName: 'WATER PAPER 150', code: 'HCPPL004', unit: 'PCS', balance: 850, category: 'Hardware', minStock: 20 },
    { srNo: 5, itemName: 'WATER PAPER 220', code: 'HCPPL005', unit: 'PCS', balance: 145, category: 'Hardware', minStock: 20 },
    { srNo: 6, itemName: 'WATER PAPER 320', code: 'HCPPL006', unit: 'PCS', balance: 450, category: 'Hardware', minStock: 20 },
    { srNo: 7, itemName: 'WATER PAPER 400', code: 'HCPPL007', unit: 'PCS', balance: 1572, category: 'Hardware', minStock: 20 },
    { srNo: 8, itemName: 'WATER PAPER 600', code: 'HCPPL008', unit: 'PCS', balance: 114, category: 'Hardware', minStock: 20 },
    { srNo: 9, itemName: 'WATER PAPER 800', code: 'HCPPL009', unit: 'PCS', balance: 200, category: 'Hardware', minStock: 20 },
    { srNo: 10, itemName: 'WATER PAPER 1000', code: 'HCPPL010', unit: 'PCS', balance: 707, category: 'Hardware', minStock: 20 },
    { srNo: 11, itemName: 'WATER PAPER 1200', code: 'HCPPL011', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 20 },
    { srNo: 12, itemName: 'WATER PAPER 1500', code: 'HCPPL012', unit: 'PCS', balance: 100, category: 'Hardware', minStock: 20 },
    { srNo: 13, itemName: 'BLUE PIGMENT', code: 'HCPPL013', unit: 'KG', balance: 52, category: 'Raw Material', minStock: 2 },
    { srNo: 14, itemName: 'LIGHT GREY PIGMENT', code: 'HCPPL014', unit: 'KG', balance: 123, category: 'Raw Material', minStock: 10 },
    { srNo: 15, itemName: 'RED PIGMENT', code: 'HCPPL015', unit: 'KG', balance: 59, category: 'Raw Material', minStock: 10 },
    { srNo: 16, itemName: 'BLACK PIGMENT', code: 'HCPPL016', unit: 'KG', balance: 200, category: 'Raw Material', minStock: 25 },
    { srNo: 17, itemName: 'WHITE PIGMENT', code: 'HCPPL017', unit: 'KG', balance: 18, category: 'Raw Material', minStock: 2 },
    { srNo: 18, itemName: 'BENJO WAX POLISH', code: 'HCPPL018', unit: 'KG', balance: 20, category: 'Raw Material', minStock: 5 },
    { srNo: 19, itemName: 'WHITE WAX POLISH', code: 'HCPPL019', unit: 'KG', balance: 45, category: 'Raw Material', minStock: 40 },
    { srNo: 20, itemName: 'BRUSH 25 MM', code: 'HCPPL020', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 5 },
    { srNo: 21, itemName: 'BRUSH 38 MM', code: 'HCPPL021', unit: 'PCS', balance: 78, category: 'Hardware', minStock: 5 },
    { srNo: 22, itemName: 'BRUSH 50 MM', code: 'HCPPL022', unit: 'PCS', balance: 227, category: 'Hardware', minStock: 5 },
    { srNo: 23, itemName: 'BRUSH 75 MM', code: 'HCPPL023', unit: 'PCS', balance: 9, category: 'Hardware', minStock: 5 },
    { srNo: 24, itemName: 'BRUSH 100 MM', code: 'HCPPL024', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 5 },
    { srNo: 25, itemName: 'FIBER CUTTING DISH (DIAMOND CUTTER)', code: 'HCPPL025', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 20 },
    { srNo: 26, itemName: 'GC WHEEL', code: 'HCPPL026', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 20 },
    { srNo: 27, itemName: 'BEAR DIS 36', code: 'HCPPL027', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 10 },
    { srNo: 28, itemName: 'BEAR DIS 60', code: 'HCPPL028', unit: 'PCS', balance: 200, category: 'Hardware', minStock: 10 },
    { srNo: 29, itemName: 'BEAR DIS 80', code: 'HCPPL029', unit: 'PCS', balance: 100, category: 'Hardware', minStock: 10 },
    { srNo: 30, itemName: 'BEAR DIS 120', code: 'HCPPL030', unit: 'PCS', balance: 50, category: 'Hardware', minStock: 10 },
    { srNo: 31, itemName: 'WELCOR PAPER 80', code: 'HCPPL031', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 5 },
    { srNo: 32, itemName: 'WELCOR PAPER 120', code: 'HCPPL032', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 5 },
    { srNo: 33, itemName: 'WELCOR PAPER 180', code: 'HCPPL033', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 5 },
    { srNo: 34, itemName: 'WELCOR PAPER 220', code: 'HCPPL034', unit: 'PCS', balance: 51, category: 'Hardware', minStock: 5 },
    { srNo: 35, itemName: 'WELCOR PAPER 320', code: 'HCPPL035', unit: 'PCS', balance: 9, category: 'Hardware', minStock: 5 },
    { srNo: 36, itemName: 'WELCOR PAPER 400', code: 'HCPPL036', unit: 'PCS', balance: 38, category: 'Hardware', minStock: 5 },
    { srNo: 37, itemName: 'WELCOR PAPER 600', code: 'HCPPL037', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 5 },
    { srNo: 38, itemName: 'IRON CUTTING DISK', code: 'HCPPL038', unit: 'PCS', balance: 271, category: 'Hardware', minStock: 10 },
    { srNo: 39, itemName: 'SANDING MACHINE', code: 'HCPPL039', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
    { srNo: 40, itemName: 'FEVICKIK', code: 'HCPPL040', unit: 'PCS', balance: 38, category: 'Hardware', minStock: 10 },
    { srNo: 41, itemName: 'GRIDER WASHER (LOOK NUT)', code: 'HCPPL041', unit: 'PCS', balance: 58, category: 'Hardware', minStock: 10 },
    { srNo: 42, itemName: 'C CLAMP 4 INCH', code: 'HCPPL042', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 2 },
    { srNo: 43, itemName: 'C CLAMP 6 INCH', code: 'HCPPL043', unit: 'PCS', balance: 6, category: 'Hardware', minStock: 2 },
    { srNo: 44, itemName: 'HAKSAW BLADE', code: 'HCPPL044', unit: 'PCS', balance: 461, category: 'Hardware', minStock: 20 },
    { srNo: 45, itemName: 'GEAR OIL', code: 'HCPPL045', unit: 'LTR', balance: 2, category: 'Raw Material', minStock: 1 },
    { srNo: 46, itemName: 'PLASTIC HAMMER', code: 'HCPPL046', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 1 },
    { srNo: 47, itemName: 'HAMMER 1.5', code: 'HCPPL047', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
    { srNo: 48, itemName: 'DRILL BIT 3MM', code: 'HCPPL048', unit: 'PCS', balance: 24, category: 'Hardware', minStock: 5 },
    { srNo: 49, itemName: 'DRILL BIT 4MM', code: 'HCPPL049', unit: 'PCS', balance: 10, category: 'Hardware', minStock: 5 },
    { srNo: 50, itemName: 'DRILL BIT 6MM', code: 'HCPPL050', unit: 'PCS', balance: 6, category: 'Hardware', minStock: 5 },
    { srNo: 51, itemName: 'DRILL BIT 210*6MM', code: 'HCPPL051', unit: 'PCS', balance: 28, category: 'Hardware', minStock: 5 },
    { srNo: 52, itemName: 'DRILL BIT 8MM', code: 'HCPPL052', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 5 },
    { srNo: 53, itemName: 'DRILL BIT 10MM', code: 'HCPPL053', unit: 'PCS', balance: 12, category: 'Hardware', minStock: 5 },
    { srNo: 54, itemName: 'DRILL BIT 12MM', code: 'HCPPL054', unit: 'PCS', balance: 26, category: 'Hardware', minStock: 5 },
    { srNo: 55, itemName: 'THAPPI 6MM', code: 'HCPPL055', unit: 'PCS', balance: 17, category: 'Hardware', minStock: 5 },
    { srNo: 56, itemName: 'THAPPI 8MM', code: 'HCPPL056', unit: 'PCS', balance: 59, category: 'Hardware', minStock: 5 },
    { srNo: 57, itemName: 'THAPPI 10MM', code: 'HCPPL057', unit: 'PCS', balance: 45, category: 'Hardware', minStock: 5 },
    { srNo: 58, itemName: 'THAPPI 12MM', code: 'HCPPL058', unit: 'PCS', balance: 41, category: 'Hardware', minStock: 5 },
    { srNo: 59, itemName: 'THAPPI SMALL', code: 'HCPPL059', unit: 'PCS', balance: 89, category: 'Hardware', minStock: 5 },
    { srNo: 60, itemName: 'FLAT CHISEL 25', code: 'HCPPL060', unit: 'PCS', balance: 37, category: 'Hardware', minStock: 5 },
    { srNo: 61, itemName: 'FLAT CHISEL 32', code: 'HCPPL061', unit: 'PCS', balance: 39, category: 'Hardware', minStock: 5 },
    { srNo: 62, itemName: 'FLAT CHISEL 40', code: 'HCPPL062', unit: 'PCS', balance: 48, category: 'Hardware', minStock: 5 },
    { srNo: 63, itemName: 'FLAT CHISEL 50', code: 'HCPPL063', unit: 'PCS', balance: 57, category: 'Hardware', minStock: 5 },
    { srNo: 64, itemName: 'PVC FLAT CHISEL HANDLE', code: 'HCPPL064', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 5 },
    { srNo: 65, itemName: 'SCREW DRIVER 18 INCH', code: 'HCPPL065', unit: 'PCS', balance: 17, category: 'Hardware', minStock: 2 },
    { srNo: 66, itemName: 'SCREW DRIVER SMALL REGULAR', code: 'HCPPL066', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 2 },
    { srNo: 67, itemName: 'A-11 MOUNTAIN WHEEL (STONE BIT)', code: 'HCPPL067', unit: 'PKT', balance: 5, category: 'Hardware', minStock: 1 },
    { srNo: 68, itemName: 'STERER 8MM', code: 'HCPPL068', unit: 'PCS', balance: 1, category: 'Hardware', minStock: 2 },
    { srNo: 69, itemName: 'STERER 12MM', code: 'HCPPL069', unit: 'PCS', balance: 12, category: 'Hardware', minStock: 2 },
    { srNo: 70, itemName: 'PILERS (PAKKD)', code: 'HCPPL070', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
    { srNo: 71, itemName: 'FILE (ROUND, FLAT, THANDER)', code: 'HCPPL071', unit: 'PCS', balance: 1, category: 'Hardware', minStock: 1 },
    { srNo: 72, itemName: 'PERMENENT MARKER', code: 'HCPPL072', unit: 'PCS', balance: 59, category: 'Hardware', minStock: 10 },
    { srNo: 73, itemName: 'BOARD MARKER', code: 'HCPPL073', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 9 },
    { srNo: 74, itemName: 'PENCIL', code: 'HCPPL074', unit: 'PCS', balance: 9, category: 'Hardware', minStock: 1 },
    { srNo: 75, itemName: 'PEN', code: 'HCPPL075', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 1 },
    { srNo: 76, itemName: 'MASKING TAPE', code: 'HCPPL076', unit: 'PKT', balance: 48, category: 'Hardware', minStock: 1 },
    { srNo: 77, itemName: 'STICH FLIM (RAPING ROLL)', code: 'HCPPL077', unit: 'ROLL', balance: 36, category: 'Hardware', minStock: 1 },
    { srNo: 78, itemName: 'AUTO FINCH GREY COLOUR', code: 'HCPPL078', unit: 'CAN', balance: 12, category: 'Hardware', minStock: 1 },
    { srNo: 79, itemName: 'AUTO FINCH BLACK COLOUR', code: 'HCPPL079', unit: 'CAN', balance: 7, category: 'Hardware', minStock: 1 },
    { srNo: 80, itemName: 'AUTO FINCH BLUE COLOUR', code: 'HCPPL080', unit: 'CAN', balance: 2, category: 'Hardware', minStock: 1 },
    { srNo: 81, itemName: 'SCALE 18 INCH', code: 'HCPPL081', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 1 },
    { srNo: 82, itemName: 'SCALE 24 INCH', code: 'HCPPL082', unit: 'PCS', balance: 4, category: 'Hardware', minStock: 1 },
    { srNo: 83, itemName: 'SCALE 40 INCH', code: 'HCPPL083', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
    { srNo: 84, itemName: 'MEASURING TAPE 3M', code: 'HCPPL084', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 2 },
    { srNo: 85, itemName: 'MEASURING TAPE 5M', code: 'HCPPL085', unit: 'PCS', balance: 1, category: 'Hardware', minStock: 1 },
    { srNo: 86, itemName: 'BUCKET 5', code: 'HCPPL086', unit: 'PCS', balance: 24, category: 'Hardware', minStock: 5 },
    { srNo: 87, itemName: 'BUCKET 10', code: 'HCPPL087', unit: 'PCS', balance: 59, category: 'Hardware', minStock: 5 },
    { srNo: 88, itemName: 'BUCKET 13', code: 'HCPPL088', unit: 'PCS', balance: 23, category: 'Hardware', minStock: 5 },
    { srNo: 89, itemName: 'BUCKET 20', code: 'HCPPL089', unit: 'PCS', balance: 6, category: 'Hardware', minStock: 5 },
    { srNo: 90, itemName: 'GHAMELA 8', code: 'HCPPL090', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 3 },
    { srNo: 91, itemName: 'GHAMELA 10', code: 'HCPPL091', unit: 'PCS', balance: 23, category: 'Hardware', minStock: 3 },
    { srNo: 92, itemName: 'GHAMELA 12', code: 'HCPPL092', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 3 },
    { srNo: 93, itemName: 'GHAMELA 14', code: 'HCPPL093', unit: 'PCS', balance: 61, category: 'Hardware', minStock: 3 },
    { srNo: 94, itemName: 'GHAMELA 19', code: 'HCPPL094', unit: 'PCS', balance: 51, category: 'Hardware', minStock: 3 },
    { srNo: 95, itemName: 'MUGGA', code: 'HCPPL095', unit: 'PCS', balance: 56, category: 'Hardware', minStock: 5 },
    { srNo: 96, itemName: 'WIRE TAPE', code: 'HCPPL096', unit: 'PCS', balance: 60, category: 'Hardware', minStock: 10 },
    { srNo: 97, itemName: 'GRINDER CORBON (6-100)', code: 'HCPPL097', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 10 },
    { srNo: 98, itemName: 'MIXURE CORBON', code: 'HCPPL098', unit: 'PCS', balance: 60, category: 'Hardware', minStock: 10 },
    { srNo: 99, itemName: 'PVA', code: 'HCPPL099', unit: 'LTR', balance: 0, category: 'Raw Material', minStock: 2 },
    { srNo: 100, itemName: 'CLEAR RESIN', code: 'HCPPL100', unit: 'BARREL', balance: 59, category: 'Raw Material', minStock: 5 },
    { srNo: 101, itemName: 'ISO RESIN', code: 'HCPPL101', unit: 'BARREL', balance: 46, category: 'Raw Material', minStock: 2 },
    { srNo: 102, itemName: 'ISO GEL-COAT', code: 'HCPPL102', unit: 'BARREL', balance: 0, category: 'Raw Material', minStock: 0 },
    { srNo: 103, itemName: 'SURFACE TISSUE MAT (30GSM)', code: 'HCPPL103', unit: 'ROLL', balance: 0, category: 'Raw Material', minStock: 1 },
    { srNo: 104, itemName: 'FGM MAT 225 GSM', code: 'HCPPL104', unit: 'ROLL', balance: 37, category: 'Raw Material', minStock: 1 },
    { srNo: 105, itemName: 'FGM MAT 450 GSM', code: 'HCPPL105', unit: 'ROLL', balance: 0, category: 'Raw Material', minStock: 5 },
    { srNo: 106, itemName: 'FGM MATT 1230 GSM', code: 'HCPPL106', unit: 'ROLL', balance: 30, category: 'Raw Material', minStock: 5 },
    { srNo: 107, itemName: 'WOVEN ROVING 610 GSM', code: 'HCPPL107', unit: 'ROLL', balance: 57, category: 'Raw Material', minStock: 5 },
    { srNo: 108, itemName: 'MEKP (CATALYST)', code: 'HCPPL108', unit: 'CAN', balance: 28, category: 'Raw Material', minStock: 1 },
    { srNo: 109, itemName: 'COBALT OCTOATE', code: 'HCPPL109', unit: 'CAN', balance: 29, category: 'Raw Material', minStock: 1 },
    { srNo: 110, itemName: 'THINNER', code: 'HCPPL110', unit: 'LTR', balance: 0, category: 'Raw Material', minStock: 50 },
    { srNo: 111, itemName: 'QUARTZ BIG', code: 'HCPPL111', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 10 },
    { srNo: 112, itemName: 'QUARTZ MEDIUM', code: 'HCPPL112', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 10 },
    { srNo: 113, itemName: 'QUARTZ SMALL', code: 'HCPPL113', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 10 },
    { srNo: 114, itemName: 'DOLOMITE POWDER', code: 'HCPPL114', unit: 'BAG', balance: 420, category: 'Raw Material', minStock: 10 },
    { srNo: 115, itemName: 'GEL COAT POWDER', code: 'HCPPL115', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 0 },
    { srNo: 116, itemName: 'ELECTRIC ZIGSAW MACHINE', code: 'HCPPL116', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
    { srNo: 117, itemName: 'HAND MIXTURE MACHINE', code: 'HCPPL117', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
    { srNo: 118, itemName: 'ANGLE GRINDER', code: 'HCPPL118', unit: 'PCS', balance: 0, category: 'Electric', minStock: 2 },
    { srNo: 119, itemName: 'DRILL MACHINE', code: 'HCPPL119', unit: 'PCS', balance: 0, category: 'Electric', minStock: 2 },
    { srNo: 120, itemName: 'BUFING MACHINE', code: 'HCPPL120', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
    { srNo: 121, itemName: 'SANDING MACHINE', code: 'HCPPL121', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
    { srNo: 122, itemName: 'POP (PLASTER OF PARIS)', code: 'HCPPL122', unit: 'BAG', balance: 0, category: 'Hardware', minStock: 2 },
    { srNo: 123, itemName: 'PLY WOOD 4MM', code: 'HCPPL123', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
    { srNo: 124, itemName: 'PLY WOOD 6MM', code: 'HCPPL124', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
    { srNo: 125, itemName: 'PLY WOOD 12MM', code: 'HCPPL125', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
    { srNo: 126, itemName: 'PLY WOOD 18MM', code: 'HCPPL126', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
    { srNo: 127, itemName: 'ZIGSAW BLADE', code: 'HCPPL127', unit: 'PCS', balance: 98, category: 'Hardware', minStock: 5 },
    { srNo: 128, itemName: 'WASTE CLOTH', code: 'HCPPL128', unit: 'KG', balance: 0, category: 'Hardware', minStock: 5 },
    { srNo: 129, itemName: 'BELCHA (SEWAL)', code: 'HCPPL129', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
    { srNo: 130, itemName: 'SHARPNER', code: 'HCPPL130', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
    { srNo: 131, itemName: 'ERASER', code: 'HCPPL131', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
    { srNo: 132, itemName: 'HYDROLIC OIL', code: 'HCPPL132', unit: 'LTR', balance: 0, category: 'Hardware', minStock: 20 },
    { srNo: 133, itemName: 'GRISH', code: 'HCPPL133', unit: 'KG', balance: 0, category: 'Hardware', minStock: 20 },
    { srNo: 134, itemName: 'WELDING RODE', code: 'HCPPL134', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 1 },
    { srNo: 135, itemName: 'NYLON BLACK PATTY', code: 'HCPPL135', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 1 },
    { srNo: 136, itemName: 'GREY GLOVES', code: 'HCPPL136', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 10 },
  ];

  for (const item of inventoryItemsList) {
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: item.code },
          { name: item.itemName },
        ],
      },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          companyId: company.id,
          publicId: `PROD-${item.code}`,
          name: item.itemName,
          sku: item.code,
          unit: item.unit,
          unitPrice: 0,
          minimumStock: item.minStock,
          category: item.category,
          isActive: true,
        },
      });
    }
  }

  console.log('\n✅ Seed complete!');
  console.log(`\n🏢 Company: Himalaya Wellness Pvt. Ltd.`);
  console.log(`👥 Users seeded (password: admin123):`);
  for (const r of roleDefinitions) {
    const slug = r.code.toLowerCase().replace(/_/g, '.');
    console.log(`   ${slug}@himalayaerp.com  →  ${r.name}`);
  }
  console.log(`\n📋 Workflow definitions: ${workflows.map(w => w.code).join(', ')}`);
  console.log(`🔢 Document sequences: ${sequences.map(s => s.prefix).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
