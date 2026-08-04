import { navigationConfig } from "./navigationConfig";

export function getModuleKeyFromPath(pathname) {
  if (!pathname) return null;
  if (pathname.startsWith('/super-admin')) return 'Super Admin';
  if (pathname.startsWith('/sales')) return 'Sales';
  if (pathname.startsWith('/production')) return 'Production';
  if (pathname.startsWith('/plant-head')) return 'Plant Head';
  if (pathname.startsWith('/store')) return 'Store';
  if (pathname.startsWith('/qc')) return 'QC';
  if (pathname.startsWith('/dispatch')) return 'Dispatch';
  if (pathname.startsWith('/finance-executive')) return 'Finance Executive';
  if (pathname.startsWith('/finance')) return 'Finance';
  if (pathname.startsWith('/hr')) return 'HR';
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
  if (isSuperOrAdmin && moduleKey && navigationConfig[moduleKey]) {
    return navigationConfig[moduleKey];
  }

  if (role) {
    const roleKeyMap = {
      'finance-executive': 'Finance Executive',
      'Finance Executive': 'Finance Executive',
      'finance-lead': 'Finance',
      'Finance Manager': 'Finance',
      'Sales Executive': 'Sales',
      'Sales Manager': 'Sales',
      'System Admin': 'Admin',
      'HR Manager': 'HR',
      'Production Manager': 'Production',
      'Store Manager': 'Store',
      'QC Manager': 'QC',
      'Dispatch Manager': 'Dispatch',
      'Super Admin': 'Super Admin',
      'super-admin': 'Super Admin'
    };
    const roleKey = roleKeyMap[role] || role;
    if (navigationConfig[roleKey]) {
      return navigationConfig[roleKey];
    }
    
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
      return stitchedNav.filter(item => {
        if (seenPaths.has(item.path)) return false;
        seenPaths.add(item.path);
        return true;
      });
    }

    if (roleStr.includes('finance')) return navigationConfig[roleStr.includes('executive') ? 'Finance Executive' : 'Finance'] || [];
    if (roleStr.includes('sales')) return navigationConfig['Sales'] || [];
    if (roleStr.includes('hr')) return navigationConfig['HR'] || [];
    if (roleStr.includes('production')) return navigationConfig['Production'] || [];
    if (roleStr.includes('store')) return navigationConfig['Store'] || [];
    if (roleStr.includes('qc') || roleStr.includes('quality')) return navigationConfig['QC'] || [];
    if (roleStr.includes('dispatch')) return navigationConfig['Dispatch'] || [];
    if (roleStr.includes('plant')) return navigationConfig['Plant Head'] || [];
    if (roleStr.includes('super')) return navigationConfig['Super Admin'] || [];
    if (roleStr.includes('admin')) return navigationConfig['Admin'] || [];
  }

  return navigationConfig['Super Admin'] || [];
}
