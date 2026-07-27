import { legacyLeadsReadRepository } from './legacyLeadsReadRepository';
import { backendLeadsReadRepository } from './backendLeadsReadRepository';

export const leadsReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const useBackend = process.env.NEXT_PUBLIC_BACKEND_LEADS_READ === 'true';
    if (useBackend) {
      return backendLeadsReadRepository.list(query);
    }
    return legacyLeadsReadRepository.list(query);
  },

  getById: async (id: string) => {
    const useBackend = process.env.NEXT_PUBLIC_BACKEND_LEADS_READ === 'true';
    if (useBackend) {
      return backendLeadsReadRepository.getById(id);
    }
    return legacyLeadsReadRepository.getById(id);
  },
};
export type { FrontendLead } from './leadMapper';
