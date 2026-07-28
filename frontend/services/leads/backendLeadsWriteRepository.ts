import { backendFetch } from '@/lib/backendFetch';
import { mapBackendLeadToFrontend, FrontendLead } from './leadMapper';

type LeadContext = { idempotencyKey: string; requestId?: string };

export const backendLeadsWriteRepository = {
  create: async (input: any, ctx: LeadContext): Promise<FrontendLead> => {
    const data = await backendFetch<any>('/api/backend/leads', {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  update: async (id: string, input: any, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}`, {
      method: 'PATCH',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  qualify: async (id: string, input: { expectedVersion: number; notes?: string }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}/qualify`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  markLost: async (id: string, input: { expectedVersion: number; reason: string; notes?: string }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}/mark-lost`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  restore: async (id: string, input: { expectedVersion: number; restoreToStatus: string; reason?: string }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}/restore`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  assignCustomer: async (id: string, input: { expectedVersion: number; customerId: string }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}/assign-customer`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  unassignCustomer: async (id: string, input: { expectedVersion: number; reason?: string }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}/unassign-customer`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  setReminder: async (id: string, input: { expectedVersion: number; nextReminderAt: string; notes?: string }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}/reminder`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  clearReminder: async (id: string, input: { expectedVersion: number }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}/reminder/clear`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },

  delete: async (id: string, input: { expectedVersion: number }, ctx: LeadContext): Promise<FrontendLead> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/leads/${safeId}`, {
      method: 'DELETE',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendLeadToFrontend(data);
  },
};
