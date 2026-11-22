import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/apiClient';

function unwrapList(res) {
  const body = res?.data ?? res;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

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
    setError(null);
    try {
      const [
        usersRes,
        employeesRes,
        auditLogsRes,
        companiesRes,
        rolesRes
      ] = await Promise.all([
        apiClient.get('/admin/users').catch(() => ({ data: [] })),
        apiClient.get('/admin/employees?page=1&limit=100').catch(() => ({ data: [] })),
        apiClient.get('/admin/audit-logs?page=1&limit=50').catch(() => ({ data: [] })),
        apiClient.get('/admin/companies').catch(() => ({ data: [] })),
        apiClient.get('/admin/roles').catch(() => ({ data: [] }))
      ]);

      setData({
        users: unwrapList(usersRes),
        employees: unwrapList(employeesRes),
        modules: [],
        auditLogs: unwrapList(auditLogsRes),
        companies: unwrapList(companiesRes),
        roles: unwrapList(rolesRes)
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
