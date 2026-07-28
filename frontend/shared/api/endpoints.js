/**
 * Centralized API endpoints for Himalaya ERP.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ROLES: '/auth/roles',
    PASSCODES: '/auth/passcodes'
  },
  SALES: {
    LEADS: '/sales/leads',
    SAMPLES: '/sales/samples',
    QUOTATIONS: '/sales/quotations',
    ORDERS: '/sales/orders',
    REMINDERS: '/sales/reminders',
    ORDER_TIMELINE: (orderNo) => `/sales/orders/${orderNo}/timeline`
  },
  ADMIN_OPS: {
    LEADS: '/admin-ops/leads',
    LEAD_BY_ID: (id) => `/admin-ops/leads/${id}`,
    ORDERS: '/admin-ops/direct-orders',
    QUOTATIONS: '/admin-ops/quotations',
    CUSTOMERS: '/admin-ops/customers'
  },
  PRODUCTION: {
    WORK_ORDERS: '/production/work-orders',
    MATERIAL_REQUESTS: '/production/material-requests',
    MATERIAL_REQUEST_STATUS: (id) => `/production/material-requests/${id}/status`
  },
  PURCHASE: {
    MACHINES: '/purchase/machines',
    BOM: '/purchase/bom'
  },
  STORE: {
    PURCHASE_ORDERS: '/store/purchase-orders'
  },
  DISPATCH: {
    BASE: '/dispatch',
    QUEUE: '/dispatch/queue'
  },
  FINANCE: {
    INVOICES: '/finance/invoices'
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ_ALL: '/notifications/read-all',
    BY_ID: (id) => `/notifications/${id}`
  },
  ADMIN: {
    USERS: '/admin/users',
    EMPLOYEES: '/admin/employees',
    LEAVES: '/admin/employees/leaves',
    AUDIT_LOGS: '/admin/audit-logs',
    SETTINGS: '/admin/settings',
    MODULES: '/admin/modules',
    SEED: '/admin/seed'
  },
  SUPER_ADMIN: {
    EVENTS: '/domain-events/recent',
    HEALTH: '/domain-events/health'
  },
  PRODUCTS: '/products'
};
