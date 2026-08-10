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

export function canAssignSalesOwner(role?: string): boolean {
  if (!role) return false;
  const normalizedRole = String(role).toUpperCase().replace(/[\s-]+/g, '_');
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPER_USER', 'SALES_MANAGER'];
  return allowedRoles.includes(normalizedRole);
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
    DISPATCH: ['DISPATCH_EXECUTIVE', 'DISPATCH_2', 'DISPATCH'],
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

export function getSalesScope(
  userId?: string,
  role?: string,
  targetModel: 'Lead' | 'Quotation' | 'SalesOrder' | 'SampleRequest' | 'CustomerPayment' | string = 'createdById',
): Record<string, any> {
  if (!userId || !role) return {};

  const normalizedRole = String(role).toUpperCase().replace(/[\s-]+/g, '_');

  // Management / Department Head roles that have unrestricted cross-team visibility
  const unrestrictedRoles = [
    'SUPER_ADMIN',
    'ADMIN',
    'SUPER_USER',
    'PLANT_HEAD',
    'FINANCE_MANAGER',
    'FINANCE_EXECUTIVE',
    'SALES_MANAGER',
    'STORE_MANAGER',
    'DISPATCH_EXECUTIVE',
    'QC_EXECUTIVE',
  ];

  if (unrestrictedRoles.includes(normalizedRole)) {
    return {};
  }

  // Individual Salesperson Roles (SUPER_SALES, SALES_EXECUTIVE, SALES_INTERN, etc.)
  const leadOwnership = { OR: [{ createdById: userId }, { assignedToId: userId }, { salesExecutiveId: userId }] };

  if (targetModel === 'Lead' || targetModel === 'assignedToId') {
    return leadOwnership;
  }

  if (targetModel === 'Quotation') {
    return {
      OR: [
        { createdById: userId },
        { salesExecutiveId: userId },
        { lead: leadOwnership },
      ],
    };
  }

  if (targetModel === 'SalesOrder') {
    return {
      OR: [
        { createdById: userId },
        { salesExecutiveId: userId },
        { quotation: { OR: [{ createdById: userId }, { salesExecutiveId: userId }, { lead: leadOwnership }] } },
      ],
    };
  }

  if (targetModel === 'SampleRequest') {
    return {
      OR: [
        { createdById: userId },
        { salesExecutiveId: userId },
        { lead: leadOwnership },
      ],
    };
  }

  if (targetModel === 'CustomerPayment') {
    return {
      OR: [
        { createdById: userId },
        { salesOrder: { OR: [{ createdById: userId }, { salesExecutiveId: userId }, { quotation: { OR: [{ createdById: userId }, { salesExecutiveId: userId }, { lead: leadOwnership }] } }] } },
      ],
    };
  }

  // Generic fallback if passed a field name like 'createdById' or 'assignedToId'
  if (targetModel === 'createdById') {
    return { OR: [{ createdById: userId }, { salesExecutiveId: userId }] };
  }

  return { [targetModel]: userId };
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
