import { mockDB } from '@/lib/delay'; // wait, mockDB is imported from '@/lib/mockDB' in apiClient.js
// Let's verify where mockDB is exported. It is exported from '@/lib/mockDB'
import { mockDB } from '@/lib/mockDB';
import { mapBackendCustomerToFrontend, FrontendCustomer } from './customerMapper';

export const legacyCustomersWriteRepository = {
  create: async (input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    const created = mockDB.insert('customers', {
      ...input,
      isActive: true,
      totalOrders: 0,
      totalRevenue: 0,
      outstanding: 0,
      ordersHistory: [],
      communicationLogs: [],
    });
    return mapBackendCustomerToFrontend(created);
  },

  update: async (id: string, input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    const updated = mockDB.update('customers', id, input);
    if (!updated) throw new Error('Customer not found');
    return mapBackendCustomerToFrontend(updated);
  },

  deactivate: async (id: string, input: { expectedVersion: number; reason?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    const updated = mockDB.update('customers', id, { isActive: false, deactivationReason: input.reason });
    if (!updated) throw new Error('Customer not found');
    return mapBackendCustomerToFrontend(updated);
  },

  restore: async (id: string, input: { expectedVersion: number }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    const updated = mockDB.update('customers', id, { isActive: true, deactivationReason: null });
    if (!updated) throw new Error('Customer not found');
    return mapBackendCustomerToFrontend(updated);
  },
};
