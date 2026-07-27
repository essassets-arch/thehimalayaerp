import { mockDB } from '@/lib/mockDB';
import { mapBackendLeadToFrontend, FrontendLead } from './leadMapper';

export const legacyLeadsWriteRepository = {
  create: async (input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const created = mockDB.insert('leads', {
      ...input,
      status: 'NEW',
    });
    return mapBackendLeadToFrontend(created);
  },

  update: async (id: string, input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, input);
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  qualify: async (id: string, input: { expectedVersion: number; notes?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, { status: 'QUALIFIED', notes: input.notes });
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  markLost: async (id: string, input: { expectedVersion: number; reason: string; notes?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, { status: 'LOST', lostReason: input.reason, notes: input.notes });
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  restore: async (id: string, input: { expectedVersion: number; restoreToStatus: string; reason?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, { status: input.restoreToStatus, restoreReason: input.reason });
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  assignCustomer: async (id: string, input: { expectedVersion: number; customerId: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, { customerId: input.customerId });
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  unassignCustomer: async (id: string, input: { expectedVersion: number; reason?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, { customerId: null });
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  setReminder: async (id: string, input: { expectedVersion: number; nextReminderAt: string; notes?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, { nextReminderAt: input.nextReminderAt, reminderNotes: input.notes });
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  clearReminder: async (id: string, input: { expectedVersion: number }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const updated = mockDB.update('leads', id, { nextReminderAt: null });
    if (!updated) throw new Error('Lead not found');
    return mapBackendLeadToFrontend(updated);
  },

  delete: async (id: string, input: { expectedVersion: number }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    const lead = mockDB.getById('leads', id);
    if (!lead) throw new Error('Lead not found');
    mockDB.remove('leads', id);
    return mapBackendLeadToFrontend({ ...lead, deletedAt: new Date().toISOString() });
  },
};
