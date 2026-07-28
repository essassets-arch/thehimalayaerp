import { legacyCustomersReadRepository } from './legacyCustomersReadRepository';
import { backendCustomersReadRepository } from './backendCustomersReadRepository';

export const customersReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const useBackend = true; // Phase 4 strictly enforces backend
    if (useBackend) {
      return backendCustomersReadRepository.list(query);
    }
    return legacyCustomersReadRepository.list(query);
  },

  getById: async (id: string) => {
    const useBackend = true; // Phase 4 strictly enforces backend
    if (useBackend) {
      return backendCustomersReadRepository.getById(id);
    }
    return legacyCustomersReadRepository.getById(id);
  },
};
export type { FrontendCustomer } from './customerMapper';
