/**
 * Authentication API module for Himalaya ERP.
 */

import { client, ENDPOINTS } from '../api';

export const authApi = {
  login: (email, password) => client.post(ENDPOINTS.AUTH.LOGIN, { email, password }),
  getRoles: () => client.get(ENDPOINTS.AUTH.ROLES, { cacheKey: 'auth_roles' }),
  getPasscodes: () => client.get(ENDPOINTS.AUTH.PASSCODES, { cacheKey: 'auth_passcodes' }),
  getMenu: () => client.get('/auth/menu'),
  getDashboardWidgets: () => client.get('/auth/dashboard-widgets')
};
