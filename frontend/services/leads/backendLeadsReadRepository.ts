import { backendFetch } from '@/lib/backendFetch';
import { mapBackendLeadToFrontend, FrontendLead } from './leadMapper';

export const backendLeadsReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const url = new URL('/api/backend/leads', window.location.origin);
    if (query.page) url.searchParams.append('page', String(query.page));
    if (query.pageSize) url.searchParams.append('pageSize', String(query.pageSize));
    if (query.search) url.searchParams.append('search', query.search);

    const envelope = await backendFetch<any>(url.toString());
    const mapped: FrontendLead[] = (envelope?.data ?? envelope ?? []).map(mapBackendLeadToFrontend);

    return {
      success: true,
      data: mapped,
      meta: envelope?.meta || {
        page: query.page || 1,
        pageSize: query.pageSize || 25,
        total: mapped.length,
        totalPages: 1,
      },
    };
  },

  getById: async (id: string): Promise<{ success: boolean; data: FrontendLead | null }> => {
    const safeId = encodeURIComponent(id);
    try {
      const data = await backendFetch<any>(`/api/backend/leads/${safeId}`);
      return { success: true, data: mapBackendLeadToFrontend(data) };
    } catch (err: any) {
      if (err.status === 404) return { success: true, data: null };
      throw err;
    }
  },
};
