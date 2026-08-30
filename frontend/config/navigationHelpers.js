import { navigationConfig } from "./navigationConfig";

export function getModuleKeyFromPath(pathname) {
  if (!pathname) return null;
  if (pathname.startsWith('/super-admin')) return 'Super Admin';
  if (pathname.startsWith('/supersales')) return 'SuperSales';
  if (pathname.startsWith('/sales')) return 'Sales';
  if (pathname.startsWith('/production')) return 'Production';
  if (pathname.startsWith('/plant-head')) return 'Plant Head';
  if (pathname.startsWith('/store')) return 'Store';
  if (pathname.startsWith('/qc')) return 'QC';
  if (pathname.startsWith('/dispatch-2')) return 'Dispatch 2';
  if (pathname.startsWith('/dispatch')) return 'Dispatch';
  if (pathname.startsWith('/finance-executive')) return 'Finance Executive';
  if (pathname.startsWith('/finance')) return 'Finance';
  if (pathname.startsWith('/hr')) return 'HR';
  if (pathname.startsWith('/back-office')) return 'Back Office';
  if (pathname.startsWith('/admin')) return 'Admin';
  return null;
}

export function getNavigationForPath(pathname, role) {
  let roleName = '';
  if (role) {
    if (typeof role === 'string') roleName = role;
    else if (typeof role === 'object') roleName = role.name || role.code || '';
  }

  // Super Admin & Admin can navigate anywhere and morph navigation to that module
  const isSuperOrAdmin = roleName === 'Super Admin' || roleName === 'Admin' || roleName === 'SUPER_ADMIN' || roleName === 'ADMIN';

  const moduleKey = getModuleKeyFromPath(pathname);
  
  let nav = [];
  if (isSuperOrAdmin && moduleKey && navigationConfig[moduleKey]) {
    nav = navigationConfig[moduleKey];
  } else if (role) {
    const roleKeyMap = {
      'finance-executive': 'Finance Executive',
      'Finance Executive': 'Finance Executive',
      'FINANCE_EXECUTIVE': 'Finance Executive',
      'finance-lead': 'Finance',
      'Finance Manager': 'Finance',
      'FINANCE_MANAGER': 'Finance',
      'FINANCE_LEAD': 'Finance',
      'FINANCE': 'Finance',
      'Sales Executive': 'Sales',
      'Sales Manager': 'Sales',
      'SALES_EXECUTIVE': 'Sales',
      'SALES_MANAGER': 'Sales',
      'System Admin': 'Admin',
      'Admin': 'Admin',
      'ADMIN': 'Admin',
      'Back Office / Admin': 'Back Office',
      'Back Office Lead': 'Back Office',
      'Data Analyst & Back Office Lead': 'Back Office',
      'HR Manager': 'HR',
      'HR_MANAGER': 'HR',
      'Production Manager': 'Production',
      'PRODUCTION_MANAGER': 'Production',
      'Store Manager': 'Store',
      'STORE_MANAGER': 'Store',
      'QC Manager': 'QC',
      'QC_MANAGER': 'QC',
      'Dispatch Manager': 'Dispatch',
      'DISPATCH_MANAGER': 'Dispatch',
      'DISPATCH_EXECUTIVE': 'Dispatch',
      'DISPATCH_2': 'Dispatch 2',
      'Dispatch 2': 'Dispatch 2',
      'dispatch_2': 'Dispatch 2',
      'dispatch-2': 'Dispatch 2',
      'Dispatch2': 'Dispatch 2',
      'Super Admin': 'Super Admin',
      'super-admin': 'Super Admin',
      'SUPER_ADMIN': 'Super Admin',
      'SUPER_SALES': 'SuperSales',
      'SuperSales': 'SuperSales',
      'SuperSales 1': 'SuperSales',
      'SuperSales 2': 'SuperSales',
      'Super Sales 1': 'SuperSales',
      'Super Sales 2': 'SuperSales',
      'super_sales': 'SuperSales',
      'super-sales': 'SuperSales',
      'Super Sales': 'SuperSales',
      'Back Office': 'Back Office',
      'back-office': 'Back Office',
      'BACK_OFFICE': 'Back Office',
      'BackOffice': 'Back Office',
    };
    const roleKey = roleKeyMap[role] || role;
    if (navigationConfig[roleKey]) {
      nav = navigationConfig[roleKey];
    } else {
      const roleStr = String(role).toLowerCase();

      // Check custom roles first
      let customRoles = [];
      try {
        const erpStore = require('../store/erpStore').useERPStore;
        if (erpStore) {
          customRoles = erpStore.getState().state?.customRoles || [];
        }
      } catch (e) {
        // Ignore if store is not accessible
      }

      const customRole = customRoles.find(r => r.name.toLowerCase() === roleStr);
      if (customRole && customRole.allowedPanels && customRole.allowedPanels.length > 0) {
        let stitchedNav = [];
        customRole.allowedPanels.forEach(panel => {
          if (navigationConfig[panel]) {
            stitchedNav = [...stitchedNav, ...navigationConfig[panel]];
          }
        });
        // Deduplicate by path
        const seenPaths = new Set();
        nav = stitchedNav.filter(item => {
          if (seenPaths.has(item.path)) return false;
          seenPaths.add(item.path);
          return true;
        });
      } else if (roleStr.includes('supersales') || roleStr.includes('super_sales')) {
        nav = navigationConfig['SuperSales'] || [];
      } else if (roleStr.includes('dispatch2') || roleStr.includes('dispatch_2') || roleStr.includes('dispatch-2') || roleStr === 'dispatch 2') {
        nav = navigationConfig['Dispatch 2'] || [];
      } else if (roleStr.includes('finance')) {
        nav = navigationConfig[roleStr.includes('executive') ? 'Finance Executive' : 'Finance'] || [];
      } else if (roleStr.includes('sales')) {
        nav = navigationConfig['Sales'] || [];
      } else if (roleStr.includes('hr')) {
        nav = navigationConfig['HR'] || [];
      } else if (roleStr.includes('production')) {
        nav = navigationConfig['Production'] || [];
      } else if (roleStr.includes('store')) {
        nav = navigationConfig['Store'] || [];
      } else if (roleStr.includes('qc') || roleStr.includes('quality')) {
        nav = navigationConfig['QC'] || [];
      } else if (roleStr.includes('dispatch')) {
        nav = navigationConfig['Dispatch'] || [];
      } else if (roleStr.includes('plant')) {
        nav = navigationConfig['Plant Head'] || [];
      } else if (roleStr.includes('super')) {
        nav = navigationConfig['Super Admin'] || [];
      } else if (roleStr.includes('admin')) {
        nav = navigationConfig['Admin'] || [];
      }
    }
  } else {
    nav = navigationConfig['Super Admin'] || [];
  }

  // Clone array to prevent direct mutation of original config items
  const resultNav = [...nav];

  // Resolve prefix dynamically from pathname
  const activeModuleKey = moduleKey || 'Sales';
  const prefix = {
    'Sales': '/sales',
    'SuperSales': '/supersales',
    'Production': '/production',
    'Plant Head': '/plant-head',
    'Store': '/store',
    'QC': '/qc',
    'Dispatch 2': '/dispatch-2',
    'Dispatch': '/dispatch',
    'Finance Executive': '/finance-executive',
    'Finance': '/finance',
    'HR': '/hr',
    'Back Office': '/back-office',
    'Admin': '/admin',
    'Super Admin': '/super-admin'
  }[activeModuleKey] || '/sales';

  // Inject My Profile if not present (except for Super Admin)
  if (activeModuleKey !== 'Super Admin' && !resultNav.some(item => item.id === 'profile')) {
    resultNav.push({
      id: 'profile',
      label: 'My Profile',
      icon: 'UserCircle',
      path: `${prefix}/profile`
    });
  }

  // Inject Expense Management if HR or Super Admin
  const isHrOrSuper = String(roleName).toUpperCase().includes('HR') || String(roleName).toUpperCase().includes('SUPER_ADMIN');
  if (isHrOrSuper && !resultNav.some(item => item.id === 'expense-management')) {
    resultNav.push({
      id: 'expense-management',
      label: 'Expense Management',
      icon: 'CreditCard',
      path: `${prefix}/expense-management`
    });
  }

  // Ensure My Profile is explicitly filtered out for Super Admin
  if (activeModuleKey === 'Super Admin') {
    return resultNav.filter(item => item.id !== 'profile');
  }

  return resultNav;
}
