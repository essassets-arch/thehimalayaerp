import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';

interface UserPayload {
  sub?: string;
  role?: string;
  permissions?: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest<{ user?: UserPayload }>();
    const user = req.user;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      if (isOptional) return true;
      if (!user || !user.sub) {
        throw new ForbiddenException('Authentication required');
      }
      return true;
    }

    if (!user || !user.sub) {
      if (isOptional) return true;
      throw new ForbiddenException('Insufficient permissions');
    }

    // Normalized Role Check from JWT
    let normalizedRole = String(user.role || '').toUpperCase().replace(/[\s-]+/g, '_');
    if (normalizedRole.startsWith('SUPER_SALES') || normalizedRole.startsWith('SUPERSALES')) {
      normalizedRole = 'SUPER_SALES';
    } else if (normalizedRole.startsWith('SALES_EXEC') || normalizedRole === 'SALES') {
      normalizedRole = 'SALES_EXECUTIVE';
    }

    if (['SUPER_ADMIN', 'ADMIN'].includes(normalizedRole)) {
      return true;
    }

    // Merge permissions from JWT payload AND live Database
    const userPermSet = new Set<string>(
      Array.isArray(user.permissions) ? user.permissions : []
    );

    try {
      let dbRole: any = null;

      // 1. Primary lookup by user ID (sub)
      if (user.sub) {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: user.sub },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        });
        if (dbUser?.role) {
          dbRole = dbUser.role;
        }
      }

      // 2. Secondary lookup by role code or name
      if (!dbRole && user.role) {
        dbRole = await this.prisma.role.findFirst({
          where: {
            OR: [
              { code: user.role },
              { code: normalizedRole },
              { name: user.role },
            ],
          },
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        });
      }

      if (dbRole) {
        let dbRoleCode = String(dbRole.code || '').toUpperCase().replace(/[\s-]+/g, '_');
        if (dbRoleCode.startsWith('SUPER_SALES') || dbRoleCode.startsWith('SUPERSALES')) {
          dbRoleCode = 'SUPER_SALES';
        } else if (dbRoleCode.startsWith('SALES_EXEC') || dbRoleCode === 'SALES') {
          dbRoleCode = 'SALES_EXECUTIVE';
        }

        if (['SUPER_ADMIN', 'ADMIN'].includes(dbRoleCode)) {
          return true;
        }
        for (const rp of dbRole.rolePermissions || []) {
          if (rp.permission?.code) {
            userPermSet.add(rp.permission.code);
          }
        }
      }
    } catch (err) {
      // Ignore DB lookup error and fall back to collected set
    }

    const allUserPerms = Array.from(userPermSet);

    const PERMISSION_ALIASES: Record<string, string[]> = {
      'admin.planthead.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read', 'production.plans.read'],
      'planthead.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read', 'production.plans.read'],
      'plant-head.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read', 'production.plans.read'],
      'planthead.dashboard.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read', 'production.plans.read'],
      'admin.products.read': ['admin.products.read', 'products.read', 'store.read', 'finance.read', 'sales.read', 'inventory.stock.read', 'admin.read', 'super-admin.read'],
      'products.read': ['admin.products.read', 'products.read', 'store.read', 'finance.read', 'sales.read', 'inventory.stock.read', 'admin.read', 'super-admin.read'],
      'inventory.warehouses.read': ['inventory.warehouses.read', 'warehouses.read', 'inventory.stock.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'warehouses.read': ['inventory.warehouses.read', 'warehouses.read', 'inventory.stock.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'procurement.suppliers.read': ['procurement.suppliers.read', 'suppliers.read', 'vendors.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'suppliers.read': ['procurement.suppliers.read', 'suppliers.read', 'vendors.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'inventory.inventory.read': ['inventory.inventory.read', 'inventory.stock.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'inventory.stock.read': ['inventory.inventory.read', 'inventory.stock.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'production.qc.read': ['production.qc.read', 'qc.inspection.read', 'qc.inspections.read'],
      'qc.inspection.read': ['production.qc.read', 'qc.inspection.read', 'qc.inspections.read'],
      'qc.inspections.read': ['production.qc.read', 'qc.inspection.read', 'qc.inspections.read'],
      'production.productionworkflow.read': ['production.productionworkflow.read', 'production.finishedgoods.read', 'production.qc.read', 'qc.inspection.read', 'production.plan.read', 'production.plans.read', 'production.workorder.read', 'production.work_orders.manage', 'admin.planthead.read', 'planthead.read'],
      'production.finishedgoods.read': ['production.productionworkflow.read', 'production.finishedgoods.read', 'production.qc.read', 'qc.inspection.read', 'production.plan.read', 'production.plans.read', 'production.workorder.read', 'admin.planthead.read', 'planthead.read'],
      'production.plan.read': ['production.plan.read', 'production.plans.read', 'admin.planthead.read', 'planthead.read', 'plant-head.read', 'production.productionworkflow.read', 'production.floor.read'],
      'production.plans.read': ['production.plan.read', 'production.plans.read', 'admin.planthead.read', 'planthead.read', 'plant-head.read', 'production.productionworkflow.read', 'production.floor.read'],
      'production.plan.create': ['production.plan.create', 'production.plans.create', 'admin.planthead.read', 'planthead.read', 'plant-head.read', 'production.floor.create'],
      'production.plan.approve': ['production.plan.approve', 'production.plans.approve', 'admin.planthead.read', 'planthead.read', 'plant-head.read'],
      'production.plan.release': ['production.plan.release', 'production.plans.release', 'admin.planthead.read', 'planthead.read', 'plant-head.read'],
      'production.workorder.read': ['production.workorder.read', 'production.workorders.read', 'production.work_orders.read', 'production.work_orders.manage', 'production.workorder.manage', 'admin.planthead.read', 'planthead.read', 'plant-head.read', 'production.productionworkflow.read', 'production.floor.read', 'production.plans.read', 'production.plan.read', 'dispatch.shipments.read', 'dispatch.delivery.verify', 'logistics.dispatches.read'],
      'production.workorders.read': ['production.workorder.read', 'production.workorders.read', 'production.work_orders.read', 'production.work_orders.manage', 'production.workorder.manage', 'admin.planthead.read', 'planthead.read', 'plant-head.read', 'production.productionworkflow.read', 'production.floor.read', 'production.plans.read', 'production.plan.read', 'dispatch.shipments.read', 'dispatch.delivery.verify', 'logistics.dispatches.read'],
      'production.workorder.start': ['production.workorder.start', 'production.work_orders.manage', 'production.workorder.manage', 'production.floor.start', 'admin.planthead.read', 'planthead.read', 'plant-head.read'],
      'production.workorder.complete': ['production.workorder.complete', 'production.work_orders.manage', 'production.workorder.manage', 'production.floor.complete', 'admin.planthead.read', 'planthead.read', 'plant-head.read'],
      'production.workorder.update': ['production.workorder.update', 'production.work_orders.manage', 'production.workorder.manage', 'production.floor.update', 'admin.planthead.read', 'planthead.read', 'plant-head.read'],
      'user.read': ['user.read', 'store.read', 'finance.read', 'sales.orders.read', 'admin.read', 'hr.read', 'super-admin.read', 'plant.read', 'planthead.read', 'admin.planthead.read', 'plant-head.read', 'production.plans.read', 'production.plan.read', 'production.floor.read', 'production.work_orders.manage', 'common.dashboard.read'],
      'finance.brand-analysis.read': ['finance.brand-analysis.read', 'brand-analysis.read', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'store.read', 'inventory.stock.read', 'inventory.inventory.read', 'finance.read', 'finance.payment.read', 'finance.invoices.read', 'finance.ledger.read', 'finance.payments.manage', 'finance.sales-analytics.read', 'admin.read', 'super-admin.read'],
      'finance.read': ['finance.read', 'finance.brand-analysis.read', 'finance.payment.read', 'finance.invoices.read', 'finance.ledger.read', 'finance.payments.manage', 'finance.sales-analytics.read', 'finance.salary.manage', 'finance.salary.view', 'admin.read', 'super-admin.read'],
      'finance.payments.read': ['finance.payments.read', 'finance.payment.read', 'finance.payments.manage', 'finance.read', 'admin.read', 'super-admin.read'],
      'finance.payment.read': ['finance.payments.read', 'finance.payment.read', 'finance.payments.manage', 'finance.read', 'admin.read', 'super-admin.read'],
      'finance.brand-analysis.start': ['finance.brand-analysis.start', 'finance.brand-analysis.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'finance.brand-analysis.complete': ['finance.brand-analysis.complete', 'finance.brand-analysis.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'store.brand-analysis.read': ['finance.brand-analysis.read', 'brand-analysis.read', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'store.read', 'inventory.stock.read', 'inventory.inventory.read', 'admin.read', 'super-admin.read'],
      'super-admin.brand-analysis.read': ['finance.brand-analysis.read', 'brand-analysis.read', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'store.read', 'inventory.stock.read', 'inventory.inventory.read', 'admin.read', 'super-admin.read', 'finance.read'],
      'store.brand-analysis.create': ['store.brand-analysis.create', 'brand-analysis.create', 'store.create', 'store.read', 'store.manage', 'inventory.stock.read', 'inventory.inventory.read', 'procurement.create', 'admin.read', 'super-admin.read'],
      'super-admin.brand-analysis.approve': ['super-admin.brand-analysis.approve', 'brand-analysis.approve', 'admin.approve', 'admin.read', 'super-admin.read'],
      'super-admin.brand-analysis.reject': ['super-admin.brand-analysis.reject', 'brand-analysis.reject', 'admin.reject', 'admin.read', 'super-admin.read'],
      'admin.replacements.create': ['admin.replacements.create', 'sales.replacements.create', 'replacements.create', 'sales.orders.create', 'sales.orders.read'],
      'admin.replacements.read': ['admin.replacements.read', 'sales.replacements.read', 'replacements.read', 'sales.orders.read'],
      'admin.replacements.approve': ['admin.replacements.approve', 'sales.replacements.approve', 'replacements.approve', 'sales.orders.approve', 'sales.orders.read'],
      'admin.replacements.reject': ['admin.replacements.reject', 'sales.replacements.reject', 'replacements.reject', 'sales.orders.reject', 'sales.orders.read'],
      'admin.replacements.update': ['admin.replacements.update', 'sales.replacements.update', 'replacements.update', 'sales.orders.update', 'sales.orders.read'],
      'production.qc.approve': ['production.qc.approve', 'qc.inspection.approve', 'qc.inspections.approve', 'production.qc.read', 'qc.inspection.read', 'production.floor.complete'],
      'qc.inspection.approve': ['production.qc.approve', 'qc.inspection.approve', 'qc.inspections.approve', 'production.qc.read', 'qc.inspection.read', 'production.floor.complete'],
      'production.qc.reject': ['production.qc.reject', 'qc.inspection.reject', 'qc.inspections.reject', 'production.qc.read', 'qc.inspection.read'],
      'qc.inspection.reject': ['production.qc.reject', 'qc.inspection.reject', 'qc.inspections.reject', 'production.qc.read', 'qc.inspection.read'],
      'sales.customercomplaints.read': ['sales.customercomplaints.read', 'sales.complaints.read'],
      'sales.complaints.read': ['sales.customercomplaints.read', 'sales.complaints.read'],
      'sales.customercomplaints.create': ['sales.customercomplaints.create', 'sales.complaints.create'],
      'sales.complaints.create': ['sales.customercomplaints.create', 'sales.complaints.create'],
      'admin.materialrequests.read': ['admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read', 'material_requests.read', 'inventory.stock.read', 'inventory.inventory.read'],
      'materialrequests.read': ['admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read', 'material_requests.read', 'inventory.stock.read', 'inventory.inventory.read'],
      'inventory.materialrequests.read': ['admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read', 'material_requests.read', 'inventory.stock.read', 'inventory.inventory.read'],
      'production.materialrequests.read': ['admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read', 'material_requests.read', 'inventory.stock.read', 'inventory.inventory.read'],
      'admin.materialrequests.create': ['admin.materialrequests.create', 'materialrequests.create', 'inventory.materialrequests.create', 'production.materialrequests.create', 'material_requests.create', 'admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read'],
      'admin.materialrequests.approve': ['admin.materialrequests.approve', 'materialrequests.approve', 'inventory.materialrequests.approve', 'production.materialrequests.approve', 'material_requests.approve', 'admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read'],
      'admin.materialrequests.reject': ['admin.materialrequests.reject', 'materialrequests.reject', 'inventory.materialrequests.reject', 'production.materialrequests.reject', 'material_requests.reject', 'admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read'],
      'admin.materialrequests.update': ['admin.materialrequests.update', 'materialrequests.update', 'inventory.materialrequests.update', 'production.materialrequests.update', 'material_requests.update', 'admin.materialrequests.approve', 'materialrequests.approve', 'admin.materialrequests.read', 'materialrequests.read', 'inventory.materialrequests.read', 'production.materialrequests.read', 'inventory.stock.read', 'inventory.inventory.read'],
      'sales.orders.read': ['sales.orders.read', 'sales.order.read', 'sales.read', 'admin.read', 'super-admin.read', 'admin.planthead.read', 'planthead.read', 'plant-head.read', 'dispatch.shipments.read'],
      'sales.orders.create': ['sales.orders.create', 'sales.order.create'],
      'sales.orders.update': ['sales.orders.update', 'sales.order.update'],
      'sales.leads.read': ['sales.leads.read', 'crm.leads.read', 'sales.read', 'sales.leads.manage', 'admin.read', 'super-admin.read'],
      'sales.customers.read': ['sales.customers.read', 'crm.customers.read', 'sales.read', 'sales.orders.read', 'admin.read', 'super-admin.read'],
      'crm.quotations.read': ['crm.quotations.read', 'crm.quotation.read', 'sales.quotations.read', 'sales.quotation.read', 'sales.read', 'sales.orders.read', 'admin.read', 'super-admin.read', 'finance.read'],
      'sales.quotations.read': ['crm.quotations.read', 'crm.quotation.read', 'sales.quotations.read', 'sales.quotation.read', 'sales.read', 'sales.orders.read', 'admin.read', 'super-admin.read', 'finance.read'],
      'crm.quotations.create': ['crm.quotations.create', 'crm.quotation.create', 'sales.quotations.create'],
      'crm.quotations.update': ['crm.quotations.update', 'crm.quotation.update', 'sales.quotations.update'],
      'crm.quotations.send': ['crm.quotations.send', 'crm.quotation.send'],
      'crm.quotations.convert': ['crm.quotations.convert', 'crm.quotation.convert', 'crm.quotations.update', 'sales.orders.create'],
      'crm.quotations.accept': ['crm.quotations.accept', 'crm.quotation.accept', 'crm.quotations.update', 'sales.orders.create'],
      'procurement.indents.read': ['procurement.indents.read', 'procurement.procurement.read', 'procurement.read', 'admin.planthead.read', 'planthead.read', 'plant-head.read', 'inventory.stock.read', 'inventory.inventory.read', 'store.read', 'finance.read', 'finance.invoices.read', 'admin.read', 'super-admin.read'],
      'procurement.purchase_orders.read': ['procurement.purchase_orders.read', 'procurement.purchase-orders.read', 'procurement.po.read', 'procurement.procurement.read', 'procurement.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read', 'admin.planthead.read', 'planthead.read'],
      'procurement.purchase-orders.read': ['procurement.purchase_orders.read', 'procurement.purchase-orders.read', 'procurement.po.read', 'procurement.procurement.read', 'procurement.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read', 'admin.planthead.read', 'planthead.read'],
      'procurement.grns.read': ['procurement.grns.read', 'procurement.grn.read', 'procurement.procurement.read', 'procurement.read', 'inventory.stock.read', 'inventory.inventory.read', 'store.read', 'admin.planthead.read', 'planthead.read', 'finance.read', 'finance.invoices.read', 'admin.read', 'super-admin.read'],
      'procurement.invoices.read': ['procurement.invoices.read', 'procurement.invoice.read', 'procurement.vendor-invoices.read', 'procurement.procurement.read', 'procurement.read', 'finance.invoices.read', 'finance.invoice.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'procurement.vendor-invoices.read': ['procurement.vendor-invoices.read', 'procurement.invoices.read', 'procurement.invoice.read', 'procurement.procurement.read', 'procurement.read', 'finance.invoices.read', 'finance.invoice.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'procurement.payments.read': ['procurement.payments.read', 'procurement.payment.read', 'procurement.vendor-payments.read', 'procurement.procurement.read', 'procurement.read', 'finance.payments.manage', 'finance.payment.read', 'finance.payments.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'procurement.vendor-payments.read': ['procurement.vendor-payments.read', 'procurement.payments.read', 'procurement.payment.read', 'procurement.vendor-payments.read', 'procurement.procurement.read', 'procurement.read', 'finance.payments.manage', 'finance.payment.read', 'finance.payments.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'finance.sales-analytics.read': ['finance.sales-analytics.read', 'finance.read'],
      'finance.sales-analytics.export': ['finance.sales-analytics.export'],
      'finance.sales-analytics.activity.read': ['finance.sales-analytics.activity.read', 'finance.sales-analytics.read'],
      'finance.sales-analytics.receivables.read': ['finance.sales-analytics.receivables.read', 'finance.sales-analytics.read'],
      'procurement.procurement.read': ['procurement.procurement.read', 'procurement.indents.read', 'procurement.po.read', 'procurement.grn.read', 'procurement.invoices.read', 'procurement.payments.read', 'procurement.read', 'inventory.stock.read', 'inventory.inventory.read', 'finance.read', 'store.read', 'admin.read', 'super-admin.read'],
      'procurement.procurement.create': ['procurement.procurement.create', 'procurement.indents.create', 'procurement.po.create', 'procurement.create'],
      'procurement.procurement.reject': ['procurement.procurement.reject', 'procurement.indents.reject', 'procurement.po.reject', 'procurement.reject'],
    };

    const hasSinglePermission = (reqPerm: string): boolean => {
      const aliases = PERMISSION_ALIASES[reqPerm] || [reqPerm];
      return aliases.some((alias) => allUserPerms.includes(alias));
    };

    const hasPermission = requiredPermissions.some((perm) =>
      hasSinglePermission(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
