import { backendFetch } from '@/lib/backendFetch';

export type EmployeeListResponse = {
  items: any[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

const base = '/api/backend/hr/employees';
const query = (params: Record<string, unknown> = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString();
};

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'req-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
};

export const employeesService = {
  listEmployees: (params: Record<string, unknown> = {}) =>
    backendFetch<EmployeeListResponse>(`${base}?${query(params)}`, { cacheTtlMs: 0 }),
  getPayrollOverview: (params: Record<string, unknown> = {}) =>
    backendFetch<any[]>(`${base}/payroll-overview?${query(params)}`, { cacheTtlMs: 0 }),
  getEmployee: (id: string) => backendFetch<any>(`${base}/${id}`, { cacheTtlMs: 0 }),
  createEmployee: (formData: FormData, idempotencyKey = generateUUID()) =>
    backendFetch<any>(base, { method: 'POST', body: formData, idempotencyKey }),
  saveEmployeeDraft: (payload: unknown, idempotencyKey = generateUUID()) =>
    backendFetch<any>(`${base}/drafts`, { method: 'POST', body: payload, idempotencyKey }),
  listDrafts: () => backendFetch<any[]>(`${base}/drafts`, { cacheTtlMs: 0 }),
  updateEmployee: (id: string, payload: unknown) =>
    backendFetch<any>(`${base}/${id}`, { method: 'PATCH', body: payload }),
  updateEmployeeStatus: (id: string, payload: unknown) =>
    backendFetch<any>(`${base}/${id}/status`, { method: 'PATCH', body: payload }),
  uploadEmployeeDocument: (id: string, formData: FormData) =>
    backendFetch<any>(`${base}/${id}/documents`, { method: 'POST', body: formData }),
  deleteEmployeeDocument: (employeeId: string, documentId: string) =>
    backendFetch<void>(`${base}/${employeeId}/documents/${documentId}`, { method: 'DELETE' }),
  listDepartments: () => backendFetch<any[]>('/api/backend/hr/departments', { cacheTtlMs: 0 }),
  listWorkLocations: () => backendFetch<any[]>('/api/backend/hr/work-locations', { cacheTtlMs: 0 }),
  listReportingManagers: (excludeId?: string) =>
    backendFetch<any[]>(`${base}/managers${excludeId ? `?excludeId=${encodeURIComponent(excludeId)}` : ''}`, { cacheTtlMs: 0 }),
};
