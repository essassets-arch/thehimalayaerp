import { LeadReadRepository, LeadListParams, LeadListResponse } from './leadReadRepository';
import { backendFetch } from '@/lib/backendFetch';

export class BackendLeadReadRepository implements LeadReadRepository {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    return backendFetch<T>(endpoint);
  }

  async listLeads(params?: LeadListParams): Promise<LeadListResponse> {
    const url = new URL('/api/backend/sales/leads', window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.fetchApi(url.toString());
  }

  async getLead(leadId: string): Promise<unknown> {
    return this.fetchApi<unknown>(`/api/backend/sales/leads/${leadId}`);
  }

  async getLeadTimeline(leadId: string): Promise<unknown[]> {
    return this.fetchApi<unknown[]>(`/api/backend/sales/leads/${leadId}/timeline`);
  }
}
