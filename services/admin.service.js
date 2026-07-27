import { apiClient } from '../lib/apiClient';

/**
 * Get system statistics
 */
export const getSystemStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Get stats error:', error);
    throw error;
  }
};

/**
 * Company Management
 */
export const getCompanies = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/admin/companies?${params}` : '/admin/companies';
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Get companies error:', error);
    throw error;
  }
};

export const createCompany = async (companyData) => {
  try {
    const response = await apiClient.post('/admin/companies', companyData);
    return response.data;
  } catch (error) {
    console.error('Create company error:', error);
    throw error;
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    const response = await apiClient.put(`/admin/companies/${id}`, companyData);
    return response.data;
  } catch (error) {
    console.error('Update company error:', error);
    throw error;
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/companies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete company error:', error);
    throw error;
  }
};

/**
 * User Management
 */
export const getUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/admin/users?${params}` : '/admin/users';
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

export const resetUserPassword = async (id, newPassword) => {
  try {
    const response = await apiClient.post(`/admin/users/${id}/reset-password`, {
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const toggleUserStatus = async (id, status) => {
  try {
    const response = await apiClient.post(`/admin/users/${id}/toggle-status`, { status });
    return response.data;
  } catch (error) {
    console.error('Toggle user status error:', error);
    throw error;
  }
};

/**
 * Employee Management
 */
export const getEmployees = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/admin/employees?${params}` : '/admin/employees';
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Get employees error:', error);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post('/admin/employees', employeeData);
    return response.data;
  } catch (error) {
    console.error('Create employee error:', error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.put(`/admin/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error('Update employee error:', error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete employee error:', error);
    throw error;
  }
};

/**
 * Role Management
 */
export const getRoles = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/admin/roles?${params}` : '/admin/roles';
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Get roles error:', error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await apiClient.post('/admin/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Create role error:', error);
    throw error;
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await apiClient.put(`/admin/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete role error:', error);
    throw error;
  }
};

/**
 * Get Workspaces / Branches
 */
export const getWorkspaces = async () => {
  try {
    const response = await apiClient.get('/admin/workspaces');
    return response.data;
  } catch (error) {
    console.error('Get workspaces error:', error);
    throw error;
  }
};

/**
 * Module Management
 */
export const getModules = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/admin/modules?${params}` : '/admin/modules';
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Get modules error:', error);
    throw error;
  }
};

export const toggleModule = async (moduleId, companyId = 1) => {
  try {
    const response = await apiClient.post('/admin/modules/toggle', {
      module_id: moduleId,
      company_id: companyId
    });
    return response.data;
  } catch (error) {
    console.error('Toggle module error:', error);
    throw error;
  }
};

/**
 * Audit Logs
 */
export const getAuditLogs = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/admin/audit-logs?${params}` : '/admin/audit-logs';
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Get audit logs error:', error);
    throw error;
  }
};

export const getAuditLogById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/audit-logs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get audit log error:', error);
    throw error;
  }
};

/**
 * System Settings
 */
export const getSettings = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/admin/settings?${params}` : '/admin/settings';
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await apiClient.put('/admin/settings', { settings });
    return response.data;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
};

export const adminService = {
  getSystemStats,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getModules,
  toggleModule,
  getAuditLogs,
  getAuditLogById,
  getSettings,
  updateSettings
};
