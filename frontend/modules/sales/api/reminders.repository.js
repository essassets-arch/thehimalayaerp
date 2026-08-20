import { client } from '../../../shared/api/client.js';
import { ENDPOINTS } from '../../../shared/api/endpoints.js';

export const remindersRepository = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.moduleType) query.set('module_type', params.moduleType);
    if (params.moduleId) query.set('module_id', params.moduleId);
    if (params.status) query.set('status', params.status);
    if (params.module) query.set('module', params.module);
    const qs = query.toString();
    return client.get(`${ENDPOINTS.SALES.REMINDERS}${qs ? `?${qs}` : ''}`);
  },

  create: (data) => client.post(ENDPOINTS.SALES.REMINDERS, data),

  update: (id, data) => client.patch(`${ENDPOINTS.SALES.REMINDERS}/${id}`, data),

  complete: (id) => client.patch(`${ENDPOINTS.SALES.REMINDERS}/${id}/complete`),

  dismiss: (id) => client.patch(`${ENDPOINTS.SALES.REMINDERS}/${id}/dismiss`),

  cancel: (id) => client.delete(`${ENDPOINTS.SALES.REMINDERS}/${id}`),

  getDaily: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.set('date', params.date);
    if (params.status) query.set('status', params.status);
    if (params.sourceType) query.set('sourceType', params.sourceType);
    if (params.search) query.set('search', params.search);
    if (params.module) query.set('module', params.module);
    const qs = query.toString();
    return client.get(`${ENDPOINTS.SALES.REMINDERS}/daily${qs ? `?${qs}` : ''}`);
  }
};
