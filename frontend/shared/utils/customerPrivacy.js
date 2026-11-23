/**
 * Frontend Customer Identity Privacy Helper.
 * Mirrors backend/src/common/security/customer-privacy.util.ts:
 * Plant Head, Production (Planner/Operator), QC, and Store MUST ONLY see Order ID
 * (orderNumber) + product items/quantities — never customer names or client PII.
 */

export function normalizeRoleForPrivacy(roleOrUser) {
  if (!roleOrUser) return '';
  let raw = roleOrUser;
  if (typeof roleOrUser === 'object') {
    raw =
      roleOrUser.role?.code ||
      roleOrUser.role?.name ||
      roleOrUser.role ||
      roleOrUser.roleCode ||
      '';
  }
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

export function isCustomerBlindRole(roleOrUser) {
  const norm = normalizeRoleForPrivacy(roleOrUser);
  if (!norm) return false;

  if (
    norm === 'SUPER_ADMIN' ||
    norm === 'SUPERADMIN' ||
    norm === 'ADMIN' ||
    norm === 'SUPER_USER' ||
    norm.includes('SUPER_ADMIN') ||
    norm.includes('SALES') ||
    norm.includes('DISPATCH') ||
    norm.includes('LOGISTICS') ||
    norm.includes('FINANCE') ||
    norm.includes('ACCOUNT') ||
    norm.includes('BACK_OFFICE') ||
    norm === 'HR' ||
    norm.startsWith('HR_') ||
    norm.includes('DIRECTOR')
  ) {
    return false;
  }

  return (
    norm === 'PLANT_HEAD' ||
    norm === 'PLANTHEAD' ||
    norm === 'PLANT_MANAGER' ||
    norm === 'FACTORY_MANAGER' ||
    norm.includes('PLANT_HEAD') ||
    norm.includes('PLANTHEAD') ||
    norm === 'PRODUCTION' ||
    norm.startsWith('PRODUCTION_') ||
    norm === 'QC' ||
    norm.startsWith('QC_') ||
    norm === 'QUALITY' ||
    norm === 'QUALITY_CONTROL' ||
    norm === 'STORE' ||
    norm.startsWith('STORE_') ||
    norm === 'WAREHOUSE' ||
    norm.startsWith('WAREHOUSE_')
  );
}

export function isCurrentUserCustomerBlind() {
  if (typeof window === 'undefined') return false;
  try {
    const rawAuth = window.localStorage.getItem('auth-storage');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      const st = parsed?.state;
      if (st?.role || st?.user) {
        return isCustomerBlindRole(st.role || st.user);
      }
    }
    const rawUser =
      window.localStorage.getItem('erpUser') ||
      window.sessionStorage.getItem('erpUser');
    if (rawUser) {
      return isCustomerBlindRole(JSON.parse(rawUser));
    }
  } catch {
    // ignore storage access issues
  }
  return false;
}

export function extractSafeOrderId(record) {
  if (!record || typeof record !== 'object') return '—';
  return (
    record.orderNumber ||
    record.orderNo ||
    record.order_no ||
    record.resolvedSoNumber ||
    record.salesOrderNumber ||
    record.salesOrderNo ||
    record.salesOrder?.orderNumber ||
    record.originalSalesOrder?.orderNumber ||
    record.productionPlan?.salesOrder?.orderNumber ||
    record.workOrder?.productionPlan?.salesOrder?.orderNumber ||
    record.workOrderNumber ||
    record.woNumber ||
    record.id ||
    '—'
  );
}
