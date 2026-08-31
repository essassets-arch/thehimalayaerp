import { backendFetch } from '@/lib/backendFetch';

export const backendSamplesReadRepository = {
  list: async (params: any = {}) => {
    return backendFetch<any[]>('/api/backend/sales/samples', { cacheTtlMs: 0 });
  },
  
  getById: async (id: string) => {
    return backendFetch<any>(`/api/backend/sales/samples/${id}`, { cacheTtlMs: 0 });
  }
};
