import { useERPStore } from '@/store/erpStore';
import { FrontendCustomer } from './customerMapper';

export const legacyCustomersReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const store = useERPStore.getState();
    let data = store.state?.customers || [];

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      data = data.filter((c: any) => 
        (c.name || '').toLowerCase().includes(searchLower) ||
        (c.companyName || '').toLowerCase().includes(searchLower)
      );
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 25;
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);

    const paginated = data.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: paginated,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  },

  getById: async (id: string): Promise<{ success: boolean; data: FrontendCustomer | null }> => {
    const store = useERPStore.getState();
    const data = store.state?.customers || [];
    const found = data.find((c: any) => c.id === id);
    return { success: true, data: found || null };
  },
};
