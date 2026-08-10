import { LeadRepositoryFactory } from './leadRepositoryFactory';

export const leadsReadRepository = {
  list: async (query: { page?: number; pageSize?: number; search?: string } = {}) => {
    return LeadRepositoryFactory.getReadRepository().listLeads(query);
  },

  getById: async (id: string) => {
    const data = await LeadRepositoryFactory.getReadRepository().getLeadById(id);
    return { success: true, data };
  },
};
export type { FrontendLead } from './leadMapper';
