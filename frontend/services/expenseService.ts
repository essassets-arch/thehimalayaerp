import { apiClient } from '../lib/apiClient';

export interface ExpenseClaimItem {
  id: string;
  publicId: string;
  companyId: string;
  userId: string;
  employeeId?: string | null;
  claimNumber: string;
  expenseName: string;
  amount: number | string;
  expenseDate: string;
  receiptUrl?: string | null;
  status: 'PENDING_HR' | 'PENDING_SUPERADMIN' | 'PENDING_FINANCE' | 'FINANCE_PROCESSED' | 'REJECTED';
  
  hrApprovedById?: string | null;
  hrApprovedBy?: string | null;
  hrApprovedAt?: string | null;
  hrRemarks?: string | null;

  superAdminApprovedById?: string | null;
  superAdminApprovedBy?: string | null;
  superAdminApprovedAt?: string | null;
  superAdminRemarks?: string | null;

  financeProcessedById?: string | null;
  financeProcessedBy?: string | null;
  financeProcessedAt?: string | null;
  financeRemarks?: string | null;
  paymentReference?: string | null;

  employeeName?: string;
  department?: string;
  designation?: string;
  
  user?: {
    id: string;
    name: string;
    email: string;
    role?: {
      id: string;
      name: string;
      code: string;
    };
  };

  employee?: {
    id: string;
    employeeCode: string;
    jobTitle?: string;
    department?: {
      id: string;
      name: string;
    };
  };

  history?: Array<{
    id: string;
    action: string;
    fromStatus?: string | null;
    toStatus: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    remarks?: string | null;
    createdAt: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  expenseName: string;
  amount: number;
  expenseDate: string;
  receiptUrl?: string;
}

export const expenseService = {
  /**
   * Submit an expense claim (JWT bound claimant).
   */
  submitExpense: async (payload: CreateExpensePayload): Promise<ExpenseClaimItem> => {
    const res: any = await apiClient.post('/expenses', payload);
    if (res && res.success === false) {
      throw new Error(res.message || 'Failed to submit expense claim');
    }
    return res?.data || res;
  },

  /**
   * Upload a receipt bill (JPG, PNG, GIF max 5MB).
   */
  uploadReceipt: async (file: File): Promise<{ url: string; fileId: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    // Get auth token
    let token = null;
    if (typeof window !== 'undefined') {
      const authStorageStr = window.localStorage.getItem('auth-storage');
      if (authStorageStr) {
        try {
          const parsed = JSON.parse(authStorageStr);
          token = parsed?.state?.accessToken;
        } catch (_) {}
      }
      if (!token) token = window.sessionStorage.getItem('token') || window.localStorage.getItem('token');
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/backend/expenses/upload-receipt', {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || (data && data.success === false)) {
      throw new Error(data?.message || 'Failed to upload receipt image');
    }

    const fileUrl = data.url || data.data?.url || (data.data?.relativePath ? `/api/backend/files/serve/${data.data.relativePath}` : '');
    return {
      url: fileUrl,
      fileId: data.fileId || data.data?.fileId || '',
      fileName: data.fileName || data.data?.fileName || file.name,
    };
  },

  /**
   * Fetch current user's submitted claims.
   */
  getMyExpenses: async (): Promise<ExpenseClaimItem[]> => {
    const res: any = await apiClient.get('/expenses/my');
    if (res && res.success && res.data) {
      return Array.isArray(res.data) ? res.data : (res.data.items || []);
    }
    return Array.isArray(res) ? res : (res?.data || res?.items || []);
  },

  /**
   * Fetch pending claims filtered by stage or user role on backend.
   */
  getPendingExpenses: async (stage?: string): Promise<ExpenseClaimItem[]> => {
    const qs = stage ? `?stage=${encodeURIComponent(stage)}` : '';
    const res: any = await apiClient.get(`/expenses/pending${qs}`);
    if (res && res.success && res.data) {
      return Array.isArray(res.data) ? res.data : [];
    }
    return Array.isArray(res) ? res : (res?.data || []);
  },

  /**
   * Fetch all claims for company history audit.
   */
  getAllExpenses: async (query?: { status?: string; search?: string }): Promise<ExpenseClaimItem[]> => {
    const q = new URLSearchParams();
    if (query?.status && query.status !== 'all') q.set('status', query.status);
    if (query?.search) q.set('search', query.search);
    const qs = q.toString();

    const res: any = await apiClient.get(`/expenses/all${qs ? `?${qs}` : ''}`);
    if (res && res.success && res.data) {
      return Array.isArray(res.data) ? res.data : [];
    }
    return Array.isArray(res) ? res : (res?.data || []);
  },

  /**
   * Approve a claim along the workflow.
   */
  approveExpense: async (
    id: string,
    payload?: { remarks?: string; paymentReference?: string }
  ): Promise<ExpenseClaimItem> => {
    const res: any = await apiClient.patch(`/expenses/${id}/approve`, payload || {});
    if (res && res.success === false) {
      throw new Error(res.message || 'Failed to approve expense claim');
    }
    return res?.data || res;
  },

  /**
   * Reject a claim.
   */
  rejectExpense: async (
    id: string,
    payload: { remarks: string }
  ): Promise<ExpenseClaimItem> => {
    const res: any = await apiClient.patch(`/expenses/${id}/reject`, payload);
    if (res && res.success === false) {
      throw new Error(res.message || 'Failed to reject expense claim');
    }
    return res?.data || res;
  },
};
