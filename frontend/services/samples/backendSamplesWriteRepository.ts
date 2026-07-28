import { apiClient } from '../../lib/apiClient';

export const backendSamplesWriteRepository = {
  create: async (data: any, context?: any) => {
    return apiClient.post('/api/backend/sales/samples', data, {
      headers: {
        'Idempotency-Key': context?.idempotencyKey || Date.now().toString()
      }
    });
  },

  update: async (id: string, data: any, context?: any) => {
    return apiClient.patch(`/api/backend/sales/samples/${id}`, data, {
      headers: {
        'Idempotency-Key': context?.idempotencyKey || Date.now().toString()
      }
    });
  },

  updateStatus: async (id: string, status: string, expectedVersion: number, context?: any) => {
    return apiClient.post(`/api/backend/sales/samples/${id}/status`, { status, expectedVersion }, {
      headers: {
        'Idempotency-Key': context?.idempotencyKey || Date.now().toString()
      }
    });
  }
};
