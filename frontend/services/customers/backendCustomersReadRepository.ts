import { backendFetch } from '@/lib/backendFetch';
import { mapBackendCustomerToFrontend, FrontendCustomer } from './customerMapper';

export const backendCustomersReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const url = new URL('/api/backend/sales/customers', window.location.origin);
    if (query.page) url.searchParams.append('page', String(query.page));
    if (query.pageSize) url.searchParams.append('pageSize', String(query.pageSize));
    if (query.search) url.searchParams.append('search', query.search);

    const envelope = await backendFetch<any>(url.toString());
    
    let rawItems = [];
    let meta = { page: query.page || 1, pageSize: query.pageSize || 25, total: 0, totalPages: 1 };
    
    if (Array.isArray(envelope)) {
      rawItems = envelope;
    } else if (envelope?.items && Array.isArray(envelope.items)) {
      rawItems = envelope.items;
      meta.total = envelope.total || rawItems.length;
    } else if (envelope?.data && Array.isArray(envelope.data)) {
      rawItems = envelope.data;
      meta = envelope.meta || meta;
    }

    const mapped: FrontendCustomer[] = rawItems.map(mapBackendCustomerToFrontend);

    return {
      success: true,
      data: mapped,
      meta,
    };
  },

  getById: async (id: string): Promise<{ success: boolean; data: FrontendCustomer | null }> => {
    const url = new URL(`/api/backend/sales/customers/${id}`, window.location.origin);
    try {
      const envelope = await backendFetch<any>(url.toString());
      if (envelope?.success && envelope.data) {
        return { success: true, data: mapBackendCustomerToFrontend(envelope.data) };
      }
      return { success: false, data: null };
    } catch (e) {
      return { success: false, data: null };
    }
  },
};
