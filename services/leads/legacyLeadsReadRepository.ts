import { useERPStore } from '@/store/erpStore';
import { FrontendLead } from './leadMapper';

export const legacyLeadsReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const store = useERPStore.getState();
    let data = store.state?.sales?.leads || [];

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      data = data.filter(l => 
        (l.companyName || '').toLowerCase().includes(searchLower) ||
        (l.contactPerson || '').toLowerCase().includes(searchLower)
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

  getById: async (id: string): Promise<{ success: boolean; data: FrontendLead | null }> => {
    const store = useERPStore.getState();
    const data = store.state?.sales?.leads || [];
    const found = data.find(l => l.id === id);
    return { success: true, data: found || null };
  },
};
