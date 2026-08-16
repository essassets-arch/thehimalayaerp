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
  const role = normalizeRole(user?.role);
  const bypassRoles = [
    'SUPER_ADMIN', 'ADMIN', 'PLANT_HEAD', 'PLANTHEAD', 'STORE_MANAGER', 'STORE',
    'FINANCE_MANAGER', 'FINANCE', 'FINANCE_EXECUTIVE', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SALES',
    'SUPER_SALES', 'SUPERSALES', 'PRODUCTION_PLANNER', 'QC_INSPECTOR', 'DISPATCH_EXECUTIVE', 'DISPATCH_2'
  ];
  if (bypassRoles.includes(role)) {
    return true;
  }
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes(permission) || permissions.includes('*');
}

export function isPlantHead(role?: string | null): boolean {
  return normalizeRole(role) === 'PLANT_HEAD';
}
