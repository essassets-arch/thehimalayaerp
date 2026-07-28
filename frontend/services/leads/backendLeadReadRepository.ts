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
    const result = await this.fetchApi<any>(url.toString());

    // The CRM leads endpoint currently returns a plain array. Normalize it to
    // the repository contract consumed by ERPContext.
    if (Array.isArray(result)) {
      return {
        data: result,
        pagination: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 25,
          total: result.length,
          totalPages: result.length ? Math.ceil(result.length / (params?.pageSize || 25)) : 0,
        },
      };
    }

    return {
      data: Array.isArray(result?.data) ? result.data : [],
      pagination: result?.pagination || result?.meta || {
        page: params?.page || 1,
        pageSize: params?.pageSize || 25,
        total: Array.isArray(result?.data) ? result.data.length : 0,
        totalPages: Array.isArray(result?.data) && result.data.length ? 1 : 0,
      },
    };
  }

  async getLead(leadId: string): Promise<unknown> {
    return this.fetchApi<unknown>(`/api/backend/sales/leads/${leadId}`);
  }

  async getLeadTimeline(leadId: string): Promise<unknown[]> {
    return this.fetchApi<unknown[]>(`/api/backend/sales/leads/${leadId}/timeline`);
  }
}
