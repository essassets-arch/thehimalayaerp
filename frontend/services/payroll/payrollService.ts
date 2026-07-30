import { backendFetch, ensureAccessToken } from '@/lib/backendFetch';

export type PayrollRecord = {
  [key: string]: any;
  id: string; payrollNumber: string; status: string; version: number;
  grossEarnings: string; totalDeductions: string; netPayable: string; paidAmount: string;
  standardWorkingDays: string; presentDays: string; paidLeaveDays: string; unpaidLeaveDays: string;
  payableDays: string; overtimeHours: string; employee: any; payrollPeriod: any;
  attendanceSummary?: any; payment?: any; salarySlip?: any; statusHistory?: any[];
};
export type PayrollPage = { items: PayrollRecord[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } };
const root = '/api/backend/hr';
const qs = (params: Record<string, unknown> = {}) => {
  const value = new URLSearchParams();
  Object.entries(params).forEach(([key, item]) => item !== undefined && item !== '' && value.set(key, String(item)));
  return value.toString();
};
const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'req-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
};

const post = <T>(url: string, body: unknown, idempotencyKey = generateUUID()) =>
  backendFetch<T>(url, { method: 'POST', body, idempotencyKey });

export const payrollService = {
  getEmployeePayrollOverview: (params = {}) => backendFetch<PayrollPage>(`${root}/payroll?${qs(params)}`, { cacheTtlMs: 0 }),
  getEmployeePayrollDetails: (id: string) => backendFetch<PayrollRecord>(`${root}/payroll/${id}`, { cacheTtlMs: 0 }),
  getPayrollRecords: (params = {}) => backendFetch<PayrollPage>(`${root}/payroll?${qs(params)}`, { cacheTtlMs: 0 }),
  getPayrollRecord: (id: string) => backendFetch<PayrollRecord>(`${root}/payroll/${id}`, { cacheTtlMs: 0 }),
  generatePayroll: (body: unknown) => post<any[]>(`${root}/payroll/generate`, body),
  generateBulkPayroll: (body: unknown) => post<any[]>(`${root}/payroll/generate-bulk`, body),
  recalculatePayroll: (id: string, body: unknown) => post<PayrollRecord>(`${root}/payroll/${id}/recalculate`, body),
  updatePayrollAdjustments: (id: string, body: unknown) => post<any>(`${root}/payroll/${id}/adjustments`, body),
  submitPayroll: (id: string, body: unknown) => post<PayrollRecord>(`${root}/payroll/${id}/submit`, body),
  submitBulkPayroll: (records: unknown[]) => post<PayrollRecord[]>(`${root}/payroll/submit-bulk`, { records }),
  getPendingApprovals: (params = {}) => backendFetch<PayrollPage>(`${root}/payroll/approvals/pending?${qs(params)}`, { cacheTtlMs: 0 }),
  approvePayroll: (id: string, body: unknown) => post<PayrollRecord>(`${root}/payroll/${id}/approve`, body),
  rejectPayroll: (id: string, body: unknown) => post<PayrollRecord>(`${root}/payroll/${id}/reject`, body),
  holdPayroll: (id: string, body: unknown) => post<PayrollRecord>(`${root}/payroll/${id}/hold`, body),
  returnPayrollForCorrection: (id: string, body: unknown) => post<PayrollRecord>(`${root}/payroll/${id}/return-for-correction`, body),
  sendPayrollToFinance: (records: unknown[]) => post<PayrollRecord[]>(`${root}/payroll/send-to-finance`, { records }),
  getFinancePendingPayroll: (params = {}) => backendFetch<PayrollPage>(`${root}/payroll/finance/pending?${qs(params)}`, { cacheTtlMs: 0 }),
  startPayrollProcessing: (id: string, body: unknown) => post<PayrollRecord>(`${root}/payroll/${id}/start-processing`, body),
  startBulkPayrollProcessing: (records: unknown[]) => post<PayrollRecord[]>(`${root}/payroll/start-processing-bulk`, { records }),
  getProcessingPayroll: (params = {}) => backendFetch<PayrollPage>(`${root}/payroll/finance/processing?${qs(params)}`, { cacheTtlMs: 0 }),
  markPayrollPaid: (id: string, body: unknown, key = generateUUID()) => post<any>(`${root}/payroll/${id}/mark-paid`, body, key),
  getPayrollHistory: (params = {}) => backendFetch<PayrollPage>(`${root}/payroll/finance/history?${qs(params)}`, { cacheTtlMs: 0 }),
  getSalarySlipByPayrollId: (payrollRecordId: string) => backendFetch<any>(`${root}/salary-slips/payroll/${payrollRecordId}`, { cacheTtlMs: 0 }),
  getSalarySlip: (id: string) => backendFetch<any>(`${root}/salary-slips/${id}`, { cacheTtlMs: 0 }),
  getEmployeeSalarySlips: (employeeId: string) => backendFetch<any[]>(`${root}/employees/${employeeId}/salary-slips`, { cacheTtlMs: 0 }),
  getMySalarySlips: () => backendFetch<any[]>(`${root}/salary-slips/mine`, { cacheTtlMs: 0 }),
  downloadSalarySlipPdf: async (id: string) => {
    const token = await ensureAccessToken();
    const response = await fetch(`${root}/salary-slips/${id}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) throw new Error('Unable to download the salary slip. Please try again.');
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const filename = disposition.match(/filename=\"?([^\";]+)\"?/i)?.[1] || 'Salary-Slip.pdf';
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
    URL.revokeObjectURL(url);
    return filename;
  },
  createSalarySlipShare: (id: string, input: unknown) => post<any>(`${root}/salary-slips/${id}/share`, input),
  revokeSalarySlipShare: (shareId: string) => backendFetch<any>(`${root}/salary-slips/shares/${shareId}`, { method: 'DELETE' }),
  getPublicSharedSalarySlip: async (token: string) => {
    const response = await fetch(`${root}/salary-slips/shared/${encodeURIComponent(token)}`);
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || 'This salary-slip link is not available.');
    return json.data;
  },
  downloadPublicSharedSalarySlip: async (token: string) => {
    const response = await fetch(`${root}/salary-slips/shared/${encodeURIComponent(token)}/pdf`);
    if (!response.ok) throw new Error('Unable to download the shared salary slip.');
    const blob = await response.blob(); const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Salary-Slip.pdf'; anchor.click(); URL.revokeObjectURL(url);
  },
  enableEmployeeSalarySlipAccess: (id: string) => post<any>(`${root}/salary-slips/${id}/enable-employee-access`, {}),
  auditSalarySlipPrint: (id: string) => post<any>(`${root}/salary-slips/${id}/print`, {}),
  getSalaryStructures: () => backendFetch<any[]>(`${root}/salary-structures`, { cacheTtlMs: 0 }),
  saveSalaryStructure: (employeeId: string, body: unknown) => post<any>(`${root}/salary-structures/${employeeId}`, body),
};
