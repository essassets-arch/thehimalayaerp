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
  const salesRoles = await prisma.role.findMany({
    where: { code: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER'] } },
  });
  const salesPerms = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
          'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.convert',
          'sales.dashboard.read',
          'sales.orders.read', 'sales.orders.create', 'sales.orders.update',
          'crm.quotation.read', 'crm.quotation.create', 'crm.quotation.update'
        ]
      }
    }
  });

  for (const role of salesRoles) {
    for (const perm of salesPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
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

  // Procurement permissions are deliberately assigned by role rather than
  // inferred in controllers; users must sign in again after reseeding so JWT
  // permission claims are refreshed.
  const procurementRolePermissions: Record<string, string[]> = {
    STORE_MANAGER: ['procurement.indents.create','procurement.indents.read','procurement.indents.update','procurement.indents.submit','procurement.indents.resubmit','procurement.indents.cancel','procurement.purchase_orders.read','procurement.purchase_orders.delivery_read','procurement.purchase_orders.closure_read','procurement.grns.create','procurement.grns.read','procurement.grns.update','procurement.grns.submit','procurement.grns.resubmit','procurement.vendor_invoices.read','procurement.vendor_payments.read','procurement.audit.read','suppliers.read','products.read','warehouses.read','inventory.stock.read'],
    PLANT_HEAD: ['procurement.indents.read','procurement.indents.approve','procurement.indents.return','procurement.indents.reject','procurement.purchase_orders.read','procurement.purchase_orders.closure_read','procurement.grns.read','procurement.vendor_invoices.read','procurement.vendor_payments.read','procurement.audit.read','products.read','warehouses.read','inventory.stock.read'],
    FINANCE_EXECUTIVE: ['procurement.indents.read','procurement.purchase_orders.create','procurement.purchase_orders.read','procurement.purchase_orders.update','procurement.purchase_orders.submit','procurement.purchase_orders.issue','procurement.purchase_orders.vendor_status','procurement.purchase_orders.dispatch','procurement.purchase_orders.closure_read','procurement.purchase_orders.close','procurement.grns.read','procurement.grns.audit','procurement.grns.return','procurement.vendor_invoices.create','procurement.vendor_invoices.read','procurement.vendor_invoices.update','procurement.vendor_invoices.submit','procurement.vendor_invoices.match','procurement.vendor_invoices.resolve_exception','procurement.vendor_invoices.verify','procurement.vendor_invoices.request_payment','procurement.vendor_invoices.cancel','procurement.vendor_payments.create','procurement.vendor_payments.read','procurement.vendor_payments.update','procurement.vendor_payments.submit','procurement.vendor_payments.process','procurement.vendor_payments.complete','procurement.vendor_payments.fail','procurement.vendor_payments.cancel','inventory.receipts.post','suppliers.read','products.read','warehouses.read'],
    FINANCE_MANAGER: ['procurement.indents.read','procurement.purchase_orders.create','procurement.purchase_orders.read','procurement.purchase_orders.update','procurement.purchase_orders.submit','procurement.purchase_orders.issue','procurement.purchase_orders.vendor_status','procurement.purchase_orders.dispatch','procurement.purchase_orders.closure_read','procurement.purchase_orders.close','procurement.grns.read','procurement.grns.audit','procurement.grns.return','procurement.vendor_invoices.create','procurement.vendor_invoices.read','procurement.vendor_invoices.update','procurement.vendor_invoices.submit','procurement.vendor_invoices.match','procurement.vendor_invoices.resolve_exception','procurement.vendor_invoices.verify','procurement.vendor_invoices.request_payment','procurement.vendor_invoices.cancel','procurement.vendor_payments.create','procurement.vendor_payments.read','procurement.vendor_payments.update','procurement.vendor_payments.submit','procurement.vendor_payments.process','procurement.vendor_payments.complete','procurement.vendor_payments.fail','procurement.vendor_payments.cancel','inventory.receipts.post','suppliers.read','products.read','warehouses.read'],
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

  const hashedPassword = await bcrypt.hash('admin123', 12);
  const allRoles = await prisma.role.findMany();

  for (const role of allRoles) {
    const emailSlug = role.code.toLowerCase().replace(/_/g, '.');
    const email = `${emailSlug}@himalayaerp.com`;
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
