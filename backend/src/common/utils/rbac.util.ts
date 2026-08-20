import { UnauthorizedException } from '@nestjs/common';

export function isRestrictedRole(role?: string): boolean {
  if (!role) return true;
  const normalizedRole = String(role).toUpperCase().replace(/[\s-]+/g, '_');
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
  return restrictedRoles.includes(normalizedRole);
}

export function isSalespersonScopedRole(role?: string): boolean {
  if (!role) return false;
  const normalizedRole = String(role).toUpperCase().replace(/[\s-]+/g, '_');
  return ['SALES_EXECUTIVE', 'SALES_INTERN'].includes(normalizedRole);
}

export function canAssignSalesOwner(role?: string): boolean {
  if (!role) return false;
  const normalizedRole = String(role).toUpperCase().replace(/[\s-]+/g, '_');
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPER_USER', 'SALES_MANAGER'];
  return allowedRoles.includes(normalizedRole);
}

export function getLeadSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return { OR: [{ salesExecutiveId: userId }, { createdById: userId }] };
}

export function getQuotationSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return { OR: [{ salesExecutiveId: userId }, { createdById: userId }] };
}

export function getOrderSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { createdById: userId },
      { salesExecutiveId: userId },
      { salesExecutiveId: null },
      { quotation: { salesExecutiveId: userId } },
      { quotation: { createdById: userId } },
      { sourceQuotation: { salesExecutiveId: userId } },
      { sourceQuotation: { createdById: userId } },
    ],
  };
}

export function getSampleSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { createdById: userId },
      { salesExecutiveId: userId },
    ],
  };
}

export function getComplaintSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { createdBy: userId },
      { salesExecutiveId: userId },
    ],
  };
}

export function getReturnSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { requestedById: userId },
      { salesOrder: { salesExecutiveId: userId } },
      { salesOrder: { createdById: userId } },
      { salesOrder: { quotation: { salesExecutiveId: userId } } },
      { salesOrder: { sourceQuotation: { salesExecutiveId: userId } } },
    ],
  };
}

export function getReplacementSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { requestedById: userId },
      { salesOrder: { salesExecutiveId: userId } },
      { salesOrder: { createdById: userId } },
      { salesOrder: { quotation: { salesExecutiveId: userId } } },
      { salesOrder: { sourceQuotation: { salesExecutiveId: userId } } },
    ],
  };
}

export function getPaymentSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { createdById: userId },
      { salesOrder: { salesExecutiveId: userId } },
      { salesOrder: { createdById: userId } },
      { salesOrder: { quotation: { salesExecutiveId: userId } } },
      { salesOrder: { sourceQuotation: { salesExecutiveId: userId } } },
    ],
  };
}

export function getFollowUpSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return { OR: [{ lead: { salesExecutiveId: userId } }, { createdById: userId }] };
}

export function getDispatchSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { createdById: userId },
      { salesOrder: { salesExecutiveId: userId } },
      { salesOrder: { createdById: userId } },
      { salesOrder: { quotation: { salesExecutiveId: userId } } },
      { salesOrder: { sourceQuotation: { salesExecutiveId: userId } } },
    ],
  };
}

export function getProductionPlanSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { assignedToId: userId },
      { salesOrder: { quotation: { salesExecutiveId: userId } } },
    ],
  };
}

export function getWorkOrderSalesScope(userId?: string, role?: string): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');
  return {
    OR: [
      { createdById: userId },
      { productionPlan: { assignedToId: userId } },
    ],
  };
}

export function getAdvancedScope(
  userId?: string,
  role?: string,
  rules: Record<string, any> = {},
): Record<string, any> {
  if (!userId || !role) {
    if (!role) return { id: 'UNAUTHORIZED_NO_ROLE' };
    return {};
  }

  const domainMap: Record<string, string[]> = {
    SALES: ['SALES_EXECUTIVE', 'SALES_INTERN', 'SUPER_SALES'],
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

  if (userDomain === 'OTHER') {
    return {};
  }

  if (rules[userDomain]) {
    return rules[userDomain];
  }

  return {};
}

export function getSalesScope(
  userId?: string,
  role?: string,
  targetModel: 'Lead' | 'Quotation' | 'SalesOrder' | 'SampleRequest' | 'CustomerPayment' | 'ProductionPlan' | 'Dispatch' | 'WorkOrder' | 'Customer' | string = 'createdById',
): Record<string, any> {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new UnauthorizedException('User ID required for sales scoping');

  if (targetModel === 'Lead' || targetModel === 'assignedToId') {
    return getLeadSalesScope(userId, role);
  }
  if (targetModel === 'Quotation') {
    return getQuotationSalesScope(userId, role);
  }
  if (targetModel === 'SalesOrder') {
    return getOrderSalesScope(userId, role);
  }
  if (targetModel === 'SampleRequest') {
    return getSampleSalesScope(userId, role);
  }
  if (targetModel === 'CustomerComplaint') {
    return getComplaintSalesScope(userId, role);
  }
  if (targetModel === 'CustomerPayment') {
    return getPaymentSalesScope(userId, role);
  }
  if (targetModel === 'FollowUp') {
    return getFollowUpSalesScope(userId, role);
  }
  if (targetModel === 'SalesReturn') {
    return getReturnSalesScope(userId, role);
  }
  if (targetModel === 'ReplacementRequest') {
    return getReplacementSalesScope(userId, role);
  }
  if (targetModel === 'Dispatch') {
    return getDispatchSalesScope(userId, role);
  }
  if (targetModel === 'ProductionPlan') {
    return getProductionPlanSalesScope(userId, role);
  }
  if (targetModel === 'WorkOrder') {
    return getWorkOrderSalesScope(userId, role);
  }
  if (targetModel === 'Customer') {
    return { createdById: userId };
  }
  if (targetModel === 'createdById') {
    return { createdById: userId };
  }

  return { createdById: userId };
}

export function getProcurementScope(
  userId?: string,
  role?: string,
  companyId?: string,
): Record<string, any> {
  if (!companyId) return {};
  return getAdvancedScope(userId, role, {
    STORE: { companyId },
  });
}

export function getHrScope(
  userId?: string,
  role?: string,
  employeeId?: string,
): Record<string, any> {
  const rules: Record<string, any> = {};
  if (employeeId) {
    rules['OTHER'] = { id: employeeId };
    rules['SALES'] = { id: employeeId };
    rules['PRODUCTION'] = { id: employeeId };
    rules['DISPATCH'] = { id: employeeId };
    rules['STORE'] = { id: employeeId };
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

