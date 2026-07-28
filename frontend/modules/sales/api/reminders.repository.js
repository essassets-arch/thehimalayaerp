import { client } from '../../../shared/api/client.js';
import { ENDPOINTS } from '../../../shared/api/endpoints.js';

export const remindersRepository = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.moduleType) query.set('module_type', params.moduleType);
    if (params.moduleId) query.set('module_id', params.moduleId);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return client.get(`${ENDPOINTS.SALES.REMINDERS}${qs ? `?${qs}` : ''}`);
  },

  create: (data) => client.post(ENDPOINTS.SALES.REMINDERS, data),

  update: (id, data) => client.put(`${ENDPOINTS.SALES.REMINDERS}/${id}`, data),

  complete: (id) => client.patch(`${ENDPOINTS.SALES.REMINDERS}/${id}/complete`),

  cancel: (id) => client.delete(`${ENDPOINTS.SALES.REMINDERS}/${id}`)
};
