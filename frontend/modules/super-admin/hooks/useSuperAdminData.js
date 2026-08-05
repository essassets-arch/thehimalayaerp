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
        apiClient.get('/backend/users').catch(() => ({ data: [] })),
        apiClient.get('/admin/employees').catch(() => ({ data: [] })),
        apiClient.get('/admin/modules'),
        apiClient.get('/admin/audit-logs'),
        apiClient.get('/admin/companies'),
        apiClient.get('/admin/roles')
      ]);

      setData({
        users: Array.isArray(usersRes.data?.data) ? usersRes.data.data : (Array.isArray(usersRes.data) ? usersRes.data : []),
        employees: Array.isArray(employeesRes.data?.items) ? employeesRes.data.items : (Array.isArray(employeesRes.data) ? employeesRes.data : []),
        modules: modulesRes.data || [],
        auditLogs: auditLogsRes.data || [],
        companies: companiesRes.data || [],
        roles: rolesRes.data || []
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
