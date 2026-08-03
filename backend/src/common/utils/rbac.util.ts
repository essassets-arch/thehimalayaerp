export function isRestrictedRole(role?: string): boolean {
  if (!role) return true;
  const restrictedRoles = [
    'SALES_EXECUTIVE',
    'SALES_INTERN',
    'PLANT_HEAD',
    'PRODUCTION_OPERATOR',
    'DISPATCH_EXECUTIVE',
    'FINANCE_EXECUTIVE',
    'FINANCE_MANAGER',
    'STORE_MANAGER',
  ];
  return restrictedRoles.includes(role);
}

export function getAdvancedScope(
  userId?: string,
  role?: string,
  rules: Record<string, any> = {},
): Record<string, any> {
  if (!userId || !role) {
    // If no role/userId is provided but the function is called, return the first rule to fail safe?
    // Actually, if no role, assume unrestricted? No, if no role, they shouldn't see anything.
    if (!role) return { id: 'UNAUTHORIZED_NO_ROLE' };
    return {};
  }

  const domainMap: Record<string, string[]> = {
    SALES: ['SALES_EXECUTIVE', 'SALES_INTERN'],
    FINANCE: ['FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
    PRODUCTION: ['PLANT_HEAD', 'PRODUCTION_OPERATOR'],
    DISPATCH: ['DISPATCH_EXECUTIVE'],
    STORE: ['STORE_MANAGER'],
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
export function getSalesScope(
  userId?: string,
  role?: string,
  ownershipField: string = 'createdById',
): Record<string, any> {
  return getAdvancedScope(userId, role, {
    SALES: { [ownershipField]: userId },
  });
}

export function getProcurementScope(
  userId?: string,
  role?: string,
  companyId?: string,
): Record<string, any> {
  // Procurement gets access to their company's data.
  // Further filtering by branch or specific rules could apply if they are store managers.
  if (!companyId) return {}; // Global read if not company specific
  return getAdvancedScope(userId, role, {
    STORE: { companyId },
  });
}

export function getHrScope(
  userId?: string,
  role?: string,
  employeeId?: string,
): Record<string, any> {
  // Regular employees should only see their own HR data
  const rules: Record<string, any> = {};
  if (employeeId) {
    rules['OTHER'] = { id: employeeId }; // General non-HR users can only see their own record
    rules['SALES'] = { id: employeeId };
    rules['PRODUCTION'] = { id: employeeId };
    rules['DISPATCH'] = { id: employeeId };
    rules['STORE'] = { id: employeeId };
    // FINANCE can see payroll broadly, HR can see everyone.
  }
  return getAdvancedScope(userId, role, rules);
}

export function getProductionScope(
  userId?: string,
  role?: string,
  companyId?: string,
): Record<string, any> {
  return getAdvancedScope(userId, role, {
    PRODUCTION: companyId ? { companyId } : {},
  });
}

export function getFinanceScope(
  userId?: string,
  role?: string,
  companyId?: string,
): Record<string, any> {
  return getAdvancedScope(userId, role, {
    FINANCE: companyId ? { companyId } : {},
  });
}

export function getDispatchScope(
  userId?: string,
  role?: string,
  companyId?: string,
): Record<string, any> {
  return getAdvancedScope(userId, role, {
    DISPATCH: companyId ? { companyId } : {},
  });
}
