import { backendFetch } from '@/lib/backendFetch';
import { mapBackendCustomerToFrontend, FrontendCustomer } from './customerMapper';

export const backendCustomersReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const url = new URL('/api/backend/customers', window.location.origin);
    if (query.page) url.searchParams.append('page', String(query.page));
    if (query.pageSize) url.searchParams.append('pageSize', String(query.pageSize));
    if (query.search) url.searchParams.append('search', query.search);

    const envelope = await backendFetch<any>(url.toString());
    const mapped: FrontendCustomer[] = (envelope?.data ?? envelope ?? []).map(mapBackendCustomerToFrontend);

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

  getById: async (id: string): Promise<{ success: boolean; data: FrontendCustomer | null }> => {
    const listRes = await backendCustomersReadRepository.list({ pageSize: 1000 });
    const found = listRes.data.find((c) => c.id === id);
    return { success: true, data: found || null };
  },
};
