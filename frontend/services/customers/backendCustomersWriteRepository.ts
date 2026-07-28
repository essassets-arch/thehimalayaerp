import { backendFetch } from '@/lib/backendFetch';
import { mapBackendCustomerToFrontend, FrontendCustomer } from './customerMapper';

type CustomerContext = { idempotencyKey: string; requestId?: string };

export const backendCustomersWriteRepository = {
  create: async (input: any, ctx: CustomerContext): Promise<FrontendCustomer> => {
    const data = await backendFetch<any>('/api/backend/sales/customers', {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendCustomerToFrontend(data);
  },

  update: async (id: string, input: any, ctx: CustomerContext): Promise<FrontendCustomer> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/sales/customers/${safeId}`, {
      method: 'PATCH',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendCustomerToFrontend(data);
  },

  deactivate: async (id: string, input: { expectedVersion: number; reason?: string }, ctx: CustomerContext): Promise<FrontendCustomer> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/sales/customers/${safeId}/deactivate`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendCustomerToFrontend(data);
  },

  restore: async (id: string, input: { expectedVersion: number }, ctx: CustomerContext): Promise<FrontendCustomer> => {
    const safeId = encodeURIComponent(id);
    const data = await backendFetch<any>(`/api/backend/sales/customers/${safeId}/restore`, {
      method: 'POST',
      body: input,
      idempotencyKey: ctx.idempotencyKey,
      requestId: ctx.requestId,
    });
    return mapBackendCustomerToFrontend(data);
  },
};
