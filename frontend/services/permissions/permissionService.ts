export function normalizeRole(role?: string | null): string {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

export function hasPermission(
  user: { permissions?: unknown; role?: string } | null | undefined,
  permission: string,
): boolean {
  if (!user) return false;
  const role = normalizeRole(user?.role);
  const bypassRoles = ['SUPER_ADMIN', 'ADMIN'];
  if (bypassRoles.includes(role)) {
    return true;
  }
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  if (permissions.includes('*') || permissions.includes(permission)) {
    return true;
  }

  const PERMISSION_ALIASES: Record<string, string[]> = {
    'sales.leads.read': ['sales.leads.read', 'crm.leads.read', 'sales.read', 'sales.leads.manage'],
    'sales.customers.read': ['sales.customers.read', 'sales.read', 'sales.orders.read'],
    'sales.orders.read': ['sales.orders.read', 'sales.read', 'sales.order.read'],
    'crm.quotations.read': ['crm.quotations.read', 'crm.quotation.read', 'sales.quotations.read', 'sales.quotation.read', 'sales.read'],
    'procurement.indents.read': ['procurement.indents.read', 'procurement.procurement.read', 'procurement.read', 'admin.planthead.read', 'planthead.read', 'inventory.stock.read', 'inventory.inventory.read'],
    'procurement.purchase_orders.read': ['procurement.purchase_orders.read', 'procurement.purchase-orders.read', 'procurement.po.read', 'procurement.procurement.read', 'procurement.read'],
    'procurement.grns.read': ['procurement.grns.read', 'procurement.grn.read', 'procurement.procurement.read', 'procurement.read'],
    'procurement.invoices.read': ['procurement.invoices.read', 'procurement.invoice.read', 'procurement.vendor-invoices.read', 'procurement.procurement.read', 'procurement.read', 'finance.invoices.read', 'finance.read'],
    'procurement.payments.read': ['procurement.payments.read', 'procurement.payment.read', 'procurement.vendor-payments.read', 'procurement.procurement.read', 'procurement.read', 'finance.payments.manage', 'finance.read'],
    'production.plan.read': ['production.plan.read', 'production.plans.read', 'admin.planthead.read', 'planthead.read', 'production.productionworkflow.read', 'production.floor.read'],
    'production.workorder.read': ['production.workorder.read', 'production.workorders.read', 'production.work_orders.manage', 'admin.planthead.read', 'planthead.read', 'production.productionworkflow.read', 'production.floor.read'],
  };

  const aliases = PERMISSION_ALIASES[permission] || [permission];
  return aliases.some(a => permissions.includes(a));
}

export function isPlantHead(role?: string | null): boolean {
  return normalizeRole(role) === 'PLANT_HEAD';
}

