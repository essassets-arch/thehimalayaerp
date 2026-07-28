import { legacyLeadsReadRepository } from './legacyLeadsReadRepository';
import { backendLeadsReadRepository } from './backendLeadsReadRepository';

export const leadsReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    const useBackend = false; // Phase 4 strictly disables backend leads
    if (useBackend) {
      return backendLeadsReadRepository.list(query);
    }
    return legacyLeadsReadRepository.list(query);
  },

  getById: async (id: string) => {
    const useBackend = false; // Phase 4 strictly disables backend leads
    if (useBackend) {
      return backendLeadsReadRepository.getById(id);
    }
    return legacyLeadsReadRepository.getById(id);
  },
};
export type { FrontendLead } from './leadMapper';
