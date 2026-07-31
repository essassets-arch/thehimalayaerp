export function isRestrictedRole(role?: string): boolean {
  if (!role) return true;
  const restrictedRoles = [
    'SALES_EXECUTIVE', 'SALES_INTERN',
    'PLANT_HEAD', 'PRODUCTION_OPERATOR',
    'DISPATCH_EXECUTIVE',
    'FINANCE_EXECUTIVE', 'FINANCE_MANAGER',
    'STORE_MANAGER'
  ];
  return restrictedRoles.includes(role);
}

export function getAdvancedScope(userId?: string, role?: string, rules: Record<string, any> = {}): Record<string, any> {
  if (!userId || !role) {
    // If no role/userId is provided but the function is called, return the first rule to fail safe?
    // Actually, if no role, assume unrestricted? No, if no role, they shouldn't see anything.
    if (!role) return { id: 'UNAUTHORIZED_NO_ROLE' };
    return {};
  }

  const domainMap: Record<string, string[]> = {
    'SALES': ['SALES_EXECUTIVE', 'SALES_INTERN'],
    'FINANCE': ['FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
    'PRODUCTION': ['PLANT_HEAD', 'PRODUCTION_OPERATOR'],
    'DISPATCH': ['DISPATCH_EXECUTIVE'],
    'STORE': ['STORE_MANAGER'],
  };

  let userDomain = 'OTHER';
  for (const [domain, roles] of Object.entries(domainMap)) {
    if (roles.includes(role)) {
      userDomain = domain;
      break;
    }
  }

  // Admin/Super Admin are 'OTHER', they get {} (unrestricted).
  if (userDomain === 'OTHER') {
    return {};
  }

  // If a rule exists for their domain, apply it.
  if (rules[userDomain]) {
    return rules[userDomain];
  }

  // If they are in a restricted domain but no explicit rule allows them, 
  // they can still see it by default (e.g. Finance seeing Sales Orders)
  return {};
}

// Backward compatibility for existing files to not break everything at once
export function getSalesScope(userId?: string, role?: string, ownershipField: string = 'createdById'): Record<string, any> {
  return getAdvancedScope(userId, role, {
    'SALES': { [ownershipField]: userId }
  });
}
