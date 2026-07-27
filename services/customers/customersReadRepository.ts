import { legacyCustomersReadRepository } from './legacyCustomersReadRepository';
import { backendCustomersReadRepository } from './backendCustomersReadRepository';

export const customersReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const useBackend = process.env.NEXT_PUBLIC_BACKEND_CUSTOMERS_READ === 'true';
    if (useBackend) {
      return backendCustomersReadRepository.list(query);
    }
    return legacyCustomersReadRepository.list(query);
  },

  getById: async (id: string) => {
    const useBackend = process.env.NEXT_PUBLIC_BACKEND_CUSTOMERS_READ === 'true';
    if (useBackend) {
      return backendCustomersReadRepository.getById(id);
    }
    return legacyCustomersReadRepository.getById(id);
  },
};
export type { FrontendCustomer } from './customerMapper';
