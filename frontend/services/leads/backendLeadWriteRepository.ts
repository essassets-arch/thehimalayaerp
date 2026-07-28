import { LeadWriteRepository, CreateLeadInput, UpdateLeadInput, TransitionLeadInput, AddLeadFollowupInput, AddLeadReminderInput, MarkLeadLostInput, WriteRequestOptions } from './leadWriteRepository';
import { backendFetch } from '@/lib/backendFetch';

export class BackendLeadWriteRepository implements LeadWriteRepository {
  private async mutateApi(endpoint: string, method: string, body: any, options?: WriteRequestOptions) {
    return backendFetch(endpoint, {
      method: method as 'POST' | 'PATCH' | 'DELETE' | 'PUT',
      body,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  async createLead(input: CreateLeadInput, options?: WriteRequestOptions) {
    return this.mutateApi('/api/backend/sales/leads', 'POST', input, options);
  }

  async updateLead(leadId: string, input: UpdateLeadInput, options?: WriteRequestOptions) {
    return this.mutateApi(`/api/backend/sales/leads/${leadId}`, 'PATCH', input, options);
  }

  async qualifyLead(leadId: string, input: TransitionLeadInput, options?: WriteRequestOptions) {
    return this.mutateApi(`/api/backend/sales/leads/${leadId}/qualify`, 'POST', input, options);
  }

  async addFollowup(leadId: string, input: AddLeadFollowupInput, options?: WriteRequestOptions) {
    return this.mutateApi(`/api/backend/sales/leads/${leadId}/followups`, 'POST', input, options);
  }

  async addReminder(leadId: string, input: AddLeadReminderInput, options?: WriteRequestOptions) {
    return this.mutateApi(`/api/backend/sales/leads/${leadId}/reminders`, 'POST', input, options);
  }

  async markLost(leadId: string, input: MarkLeadLostInput, options?: WriteRequestOptions) {
    return this.mutateApi(`/api/backend/sales/leads/${leadId}/mark-lost`, 'POST', input, options);
  }

  async restoreLead(leadId: string, input: TransitionLeadInput, options?: WriteRequestOptions) {
    return this.mutateApi(`/api/backend/sales/leads/${leadId}/restore`, 'POST', input, options);
  }
}
