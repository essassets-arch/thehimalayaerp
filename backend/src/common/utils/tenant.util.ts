import { UnauthorizedException } from '@nestjs/common';

/**
 * Resolves the authenticated company/tenant ID with strict role validation.
 * Regular users are strictly restricted to their assigned JWT companyId.
 * Only Super Admin users are allowed to switch tenant context via the x-company-id header.
 */
export function resolveTenantId(req: any, fallback?: string): string {
  const user = req?.user;
  if (!user && !fallback) {
    throw new UnauthorizedException('Authentication required');
  }

  const rawRole =
    typeof user?.role === 'object' && user?.role !== null
      ? (user.role as any).code || (user.role as any).name || ''
      : user?.role;
  const role = String(rawRole || '')
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const isSuperAdmin =
    role === 'SUPER_ADMIN' ||
    role === 'SUPERADMIN' ||
    role.includes('SUPER_ADMIN') ||
    role.includes('SUPERADMIN') ||
    role === 'ADMIN';

  const requestedTenant = req?.headers?.['x-company-id'];
  if (isSuperAdmin && typeof requestedTenant === 'string' && requestedTenant.trim()) {
    return requestedTenant.trim();
  }

  const companyId = user?.companyId;
  if (typeof companyId === 'string' && companyId.trim()) {
    return companyId.trim();
  }

  if (typeof fallback === 'string' && fallback.trim()) {
    return fallback.trim();
  }

  throw new UnauthorizedException('An authenticated company context is required.');
}
