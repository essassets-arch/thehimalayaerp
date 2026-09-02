import { apiClient } from '../../lib/apiClient';

export interface ComplaintItem {
  id: string;
  publicId?: string;
  companyId: string;
  userId: string;
  employeeId?: string;
  ticketCode: string;
  category: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  hrRemarks?: string | null;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  createdAt: string;
  updatedAt: string;
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
    phoneNumber?: string;
    department?: {
      id: string;
      name: string;
    };
    workLocation?: {
      id: string;
      name: string;
    };
  };
  resolvedBy?: {
    id: string;
    name: string;
  };
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  rejected: number;
}

export interface CreateComplaintPayload {
  category: string;
  subject: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const complaintsService = {
  /**
   * Submit a new complaint. Complainant identity is bound to JWT automatically on backend.
   */
  submitComplaint: async (payload: CreateComplaintPayload): Promise<ComplaintItem> => {
    return apiClient.post('/complaints', payload);
  },

  /**
   * Fetch current user's submitted complaints.
   */
  getMyComplaints: async (): Promise<ComplaintItem[]> => {
    const res = await apiClient.get('/complaints/my');
    return Array.isArray(res) ? res : (res?.data || res?.items || []);
  },

  /**
   * HR endpoint to list all company complaints with optional filters.
   */
  getHrComplaints: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ComplaintItem[]; stats: ComplaintStats; pagination: any }> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const url = `/hr/complaints${qs ? `?${qs}` : ''}`;
    return apiClient.get(url);
  },

  /**
   * HR endpoint to update status and add remarks.
   */
  updateComplaintStatus: async (
    id: string,
    payload: { status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'; hrRemarks?: string }
  ): Promise<ComplaintItem> => {
    return apiClient.patch(`/hr/complaints/${id}/status`, payload);
  },
};
