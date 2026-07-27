import { useAuthStore } from '../../store/authStore';

export const ROLE_PERMISSIONS = {
  'Finance Executive': {
    canViewCustomerPayments: true,
    canCollectPayment: true,
    canSubmitPaymentVerification: true,
    canViewPaymentHistory: true,
    canGeneratePaymentReceipt: true,
    canViewOutstandingPayments: true,
    canViewCustomers: true,

    canFinalVerifyPayment: false,
    canRejectPaymentFinally: false,
    canProcessPayroll: false,
    canManagePurchaseOrders: false,
    canManageVendorPayments: false,
    canManageExpenses: false,
    canAccessFinanceSettings: false,
  },
  'Finance': {
    canViewCustomerPayments: true,
    canCollectPayment: true,
    canSubmitPaymentVerification: true,
    canViewPaymentHistory: true,
    canGeneratePaymentReceipt: true,
    canViewOutstandingPayments: true,
    canViewCustomers: true,

    canFinalVerifyPayment: true,
    canRejectPaymentFinally: true,
    canProcessPayroll: true,
    canManagePurchaseOrders: true,
    canManageVendorPayments: true,
    canManageExpenses: true,
    canAccessFinanceSettings: true,
  },
  'Super Admin': {
    canViewCustomerPayments: true,
    canCollectPayment: true,
    canSubmitPaymentVerification: true,
    canViewPaymentHistory: true,
    canGeneratePaymentReceipt: true,
    canViewOutstandingPayments: true,
    canViewCustomers: true,

    canFinalVerifyPayment: true,
    canRejectPaymentFinally: true,
    canProcessPayroll: true,
    canManagePurchaseOrders: true,
    canManageVendorPayments: true,
    canManageExpenses: true,
    canAccessFinanceSettings: true,
  }
};

export const can = (actor, permission) => {
  const role = typeof actor === 'string'
    ? actor
    : (actor?.role || actor?.name || 'Guest');
  
  if (role === 'Super Admin') return true;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return true; // Default to true to not block other modules
  return !!perms[permission];
};

export const useAbility = () => {
  const role = useAuthStore((s) => s.role);
  return {
    can: (permission, subject) => {
      // Map CASL style permission string to our specific role check
      return can(role, permission);
    }
  };
};

export const AbilityProvider = ({ children }) => {
  return children;
};

