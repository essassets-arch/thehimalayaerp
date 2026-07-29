export function normalizeRole(role?: string | null): string {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

export function hasPermission(
  user: { permissions?: unknown } | null | undefined,
  permission: string,
): boolean {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes(permission) || permissions.includes('*');
}

export function isPlantHead(role?: string | null): boolean {
  return normalizeRole(role) === 'PLANT_HEAD';
}
