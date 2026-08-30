export const DASHBOARD_REDIRECTS = {
  // Super-level
  'Super Admin':    '/super-admin/dashboard',
  'Admin':          '/admin/dashboard',
  // Sales
  'Sales Admin':    '/sales/dashboard',
  'Sales Executive':'/sales/dashboard',
  'Sales':          '/sales/dashboard',
  // Operations
  'Plant Head':     '/plant-head/dashboard',
  'Production':     '/production/dashboard',
  'Store':          '/store/dashboard',
  // Dispatch — all three roles land on the same portal; RBAC filters the view
  'Dispatch':              '/dispatch/dashboard',
  'Dispatch Manager':      '/dispatch/dashboard',
  'Dispatch 1 Operator':   '/dispatch/dashboard',
  'Dispatch 2 Operator':   '/dispatch/dashboard',
  'QC':             '/qc/dashboard',
  // Support
  'Finance':        '/finance/po-requests',
  'finance-lead':   '/finance/po-requests',
  'Finance Executive': '/finance-executive/dashboard',
  'finance-executive': '/finance-executive/dashboard',
  'HR':             '/hr/dashboard',
  'Back Office':    '/back-office/daily-report',
  'BACK_OFFICE':    '/back-office/daily-report',
  'back-office':    '/back-office/daily-report',
  'Back Office / Admin': '/back-office/daily-report',
  'Back Office Lead': '/back-office/daily-report',
  'Data Analyst & Back Office Lead': '/back-office/daily-report',
};

export const ROLE_ROUTES = {
  'Super Admin':    '/super-admin',
  'Admin':          '/admin',
  'Sales Admin':    '/sales/dashboard',
  'Sales Executive':'/sales/dashboard',
  'Sales':          '/sales',
  'Plant Head':     '/plant-head',
  'Production':     '/production',
  'Store':          '/store',
  // Dispatch
  'Dispatch':              '/dispatch',
  'Dispatch Manager':      '/dispatch',
  'Dispatch 1 Operator':   '/dispatch',
  'Dispatch 2 Operator':   '/dispatch',
  'QC':             '/qc',
  'Finance':        '/finance',
  'finance-lead':   ['/finance/*'],
  'Finance Executive': ['/finance-executive/*'],
  'finance-executive': ['/finance-executive/*'],
  'HR':             '/hr',
  'Back Office':    '/back-office',
  'BACK_OFFICE':    '/back-office',
};
