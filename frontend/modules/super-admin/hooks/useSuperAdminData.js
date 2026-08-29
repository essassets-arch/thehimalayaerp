import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/apiClient';

export function useSuperAdminData() {
  const [data, setData] = useState({
    users: [],
    employees: [],
    modules: [],
    auditLogs: [],
    companies: [],
    roles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        usersRes,
        employeesRes,
        modulesRes,
        auditLogsRes,
        companiesRes,
        rolesRes
      ] = await Promise.all([
        apiClient.get('/admin/users').catch(() => ({ data: [] })),
        apiClient.get('/admin/employees').catch(() => ({ data: [] })),
        apiClient.get('/admin/modules').catch(() => ({ data: [] })),
        apiClient.get('/admin/audit-logs').catch(() => ({ data: [] })),
        apiClient.get('/admin/companies').catch(() => ({ data: [] })),
        apiClient.get('/admin/roles').catch(() => ({ data: [] }))
      ]);

      const rawUsers = usersRes.data?.data || usersRes.data || [];
      const rawEmployees = employeesRes.data?.data?.items || employeesRes.data?.items || employeesRes.data?.data || employeesRes.data || [];
      const rawRoles = rolesRes.data?.data || rolesRes.data || [];

      setData({
        users: Array.isArray(rawUsers) ? rawUsers : [],
        employees: Array.isArray(rawEmployees) ? rawEmployees : [],
        modules: Array.isArray(modulesRes.data) ? modulesRes.data : [],
        auditLogs: Array.isArray(auditLogsRes.data) ? auditLogsRes.data : [],
        companies: Array.isArray(companiesRes.data) ? companiesRes.data : [],
        roles: Array.isArray(rawRoles) ? rawRoles : []
      });
    } catch (err) {
      console.error('Failed to load Super Admin data from backend:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { data, loading, error, refetch: fetchAll };
}
