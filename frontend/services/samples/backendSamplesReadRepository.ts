import { apiClient } from '../../lib/apiClient';

export const backendSamplesReadRepository = {
  list: async () => {
    return apiClient.get('/api/backend/sales/samples');
  },
  
  getById: async (id: string) => {
    return apiClient.get(`/api/backend/sales/samples/${id}`);
  }
};
