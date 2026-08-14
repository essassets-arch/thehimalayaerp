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
    const normalizedRole = String(user.role || '').toUpperCase().replace(/[\s-]+/g, '_');
    if (['SUPER_ADMIN', 'ADMIN', 'PLANT_HEAD', 'PLANTHEAD'].includes(normalizedRole)) {
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
        const dbRoleCode = String(dbRole.code || '').toUpperCase().replace(/[\s-]+/g, '_');
        if (['SUPER_ADMIN', 'ADMIN', 'PLANT_HEAD', 'PLANTHEAD'].includes(dbRoleCode)) {
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
      'admin.planthead.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read'],
      'planthead.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read'],
      'plant-head.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read'],
      'planthead.dashboard.read': ['admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read', 'production.productionworkflow.read', 'production.plan.read'],
      'admin.products.read': ['admin.products.read', 'products.read'],
      'products.read': ['admin.products.read', 'products.read'],
      'inventory.warehouses.read': ['inventory.warehouses.read', 'warehouses.read'],
      'warehouses.read': ['inventory.warehouses.read', 'warehouses.read'],
      'procurement.suppliers.read': ['procurement.suppliers.read', 'suppliers.read', 'vendors.read'],
      'suppliers.read': ['procurement.suppliers.read', 'suppliers.read', 'vendors.read'],
      'inventory.inventory.read': ['inventory.inventory.read', 'inventory.stock.read'],
      'inventory.stock.read': ['inventory.inventory.read', 'inventory.stock.read'],
      'production.qc.read': ['production.qc.read', 'qc.inspection.read'],
      'qc.inspection.read': ['production.qc.read', 'qc.inspection.read'],
      'production.productionworkflow.read': ['production.productionworkflow.read', 'production.finishedgoods.read', 'production.qc.read', 'qc.inspection.read', 'production.plan.read', 'production.workorder.read'],
      'production.finishedgoods.read': ['production.productionworkflow.read', 'production.finishedgoods.read', 'production.qc.read', 'qc.inspection.read', 'production.plan.read', 'production.workorder.read'],
      'user.read': ['user.read', 'store.read', 'finance.read', 'sales.orders.read', 'admin.read', 'hr.read', 'super-admin.read', 'plant.read'],
      'finance.brand-analysis.read': ['finance.brand-analysis.read', 'brand-analysis.read', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'store.read', 'inventory.stock.read', 'inventory.inventory.read'],
      'store.brand-analysis.read': ['finance.brand-analysis.read', 'brand-analysis.read', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'store.read', 'inventory.stock.read', 'inventory.inventory.read'],
      'super-admin.brand-analysis.read': ['finance.brand-analysis.read', 'brand-analysis.read', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'store.read', 'inventory.stock.read', 'inventory.inventory.read', 'admin.read'],
      'store.brand-analysis.create': ['store.brand-analysis.create', 'brand-analysis.create', 'store.create', 'store.read', 'store.manage', 'inventory.stock.read', 'inventory.inventory.read', 'procurement.create'],
      'super-admin.brand-analysis.approve': ['super-admin.brand-analysis.approve', 'brand-analysis.approve', 'admin.approve', 'admin.read'],
      'super-admin.brand-analysis.reject': ['super-admin.brand-analysis.reject', 'brand-analysis.reject', 'admin.reject', 'admin.read'],
      'admin.replacements.create': ['admin.replacements.create', 'sales.replacements.create', 'replacements.create', 'sales.orders.create', 'sales.orders.read'],
      'admin.replacements.read': ['admin.replacements.read', 'sales.replacements.read', 'replacements.read', 'sales.orders.read'],
      'admin.replacements.approve': ['admin.replacements.approve', 'sales.replacements.approve', 'replacements.approve', 'sales.orders.approve', 'sales.orders.read'],
      'admin.replacements.reject': ['admin.replacements.reject', 'sales.replacements.reject', 'replacements.reject', 'sales.orders.reject', 'sales.orders.read'],
      'admin.replacements.update': ['admin.replacements.update', 'sales.replacements.update', 'replacements.update', 'sales.orders.update', 'sales.orders.read'],
      'production.qc.approve': ['production.qc.approve', 'qc.inspection.approve', 'production.qc.read', 'qc.inspection.read', 'production.floor.complete'],
      'qc.inspection.approve': ['production.qc.approve', 'qc.inspection.approve', 'production.qc.read', 'qc.inspection.read', 'production.floor.complete'],
      'production.qc.reject': ['production.qc.reject', 'qc.inspection.reject', 'production.qc.read', 'qc.inspection.read'],
      'qc.inspection.reject': ['production.qc.reject', 'qc.inspection.reject', 'production.qc.read', 'qc.inspection.read'],
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
      'sales.orders.read': ['sales.orders.read', 'sales.order.read', 'sales.read', 'admin.read', 'super-admin.read'],
      'sales.orders.create': ['sales.orders.create', 'sales.order.create'],
      'sales.orders.update': ['sales.orders.update', 'sales.order.update'],
      'crm.quotations.read': ['crm.quotations.read', 'crm.quotation.read', 'sales.quotations.read', 'sales.quotation.read', 'sales.read', 'sales.orders.read', 'admin.read', 'super-admin.read', 'finance.read'],
      'sales.quotations.read': ['crm.quotations.read', 'crm.quotation.read', 'sales.quotations.read', 'sales.quotation.read', 'sales.read', 'sales.orders.read', 'admin.read', 'super-admin.read', 'finance.read'],
      'crm.quotations.create': ['crm.quotations.create', 'crm.quotation.create', 'sales.quotations.create'],
      'crm.quotations.update': ['crm.quotations.update', 'crm.quotation.update', 'sales.quotations.update'],
      'crm.quotations.send': ['crm.quotations.send', 'crm.quotation.send'],
      'crm.quotations.convert': ['crm.quotations.convert', 'crm.quotation.convert', 'crm.quotations.update', 'sales.orders.create'],
      'crm.quotations.accept': ['crm.quotations.accept', 'crm.quotation.accept', 'crm.quotations.update', 'sales.orders.create'],
      'procurement.purchase_orders.read': ['procurement.purchase_orders.read', 'procurement.purchase-orders.read', 'procurement.po.read', 'procurement.procurement.read', 'procurement.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'procurement.purchase-orders.read': ['procurement.purchase_orders.read', 'procurement.purchase-orders.read', 'procurement.po.read', 'procurement.procurement.read', 'procurement.read', 'store.read', 'finance.read', 'admin.read', 'super-admin.read'],
      'finance.sales-analytics.read': ['finance.sales-analytics.read', 'finance.read'],
      'finance.sales-analytics.export': ['finance.sales-analytics.export'],
      'finance.sales-analytics.activity.read': ['finance.sales-analytics.activity.read', 'finance.sales-analytics.read'],
      'finance.sales-analytics.receivables.read': ['finance.sales-analytics.receivables.read', 'finance.sales-analytics.read'],
      'procurement.procurement.read': ['procurement.procurement.read', 'procurement.indents.read', 'procurement.po.read', 'procurement.grn.read', 'procurement.invoices.read', 'procurement.payments.read', 'procurement.read', 'inventory.stock.read', 'inventory.inventory.read'],
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
