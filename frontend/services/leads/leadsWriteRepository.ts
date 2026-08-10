import { legacyLeadsWriteRepository } from './legacyLeadsWriteRepository';
import { backendLeadsWriteRepository } from './backendLeadsWriteRepository';
import { FrontendLead } from './leadMapper';

const useBackend = true;

export const leadsWriteRepository = {
  create: async (input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.create(input, context);
    }
    return legacyLeadsWriteRepository.create(input, context);
  },

  update: async (id: string, input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.update(id, input, context);
    }
    return legacyLeadsWriteRepository.update(id, input, context);
  },

  qualify: async (id: string, input: { expectedVersion: number; notes?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.qualify(id, input, context);
    }
    return legacyLeadsWriteRepository.qualify(id, input, context);
  },

  markLost: async (id: string, input: { expectedVersion: number; reason: string; notes?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.markLost(id, input, context);
    }
    return legacyLeadsWriteRepository.markLost(id, input, context);
  },

  restore: async (id: string, input: { expectedVersion: number; restoreToStatus: string; reason?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.restore(id, input, context);
    }
    return legacyLeadsWriteRepository.restore(id, input, context);
  },

  assignCustomer: async (id: string, input: { expectedVersion: number; customerId: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.assignCustomer(id, input, context);
    }
    return legacyLeadsWriteRepository.assignCustomer(id, input, context);
  },

  unassignCustomer: async (id: string, input: { expectedVersion: number; reason?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.unassignCustomer(id, input, context);
    }
    return legacyLeadsWriteRepository.unassignCustomer(id, input, context);
  },

  setReminder: async (id: string, input: { expectedVersion: number; nextReminderAt: string; notes?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.setReminder(id, input, context);
    }
    return legacyLeadsWriteRepository.setReminder(id, input, context);
  },

  clearReminder: async (id: string, input: { expectedVersion: number }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.clearReminder(id, input, context);
    }
    return legacyLeadsWriteRepository.clearReminder(id, input, context);
  },

  delete: async (id: string, input: { expectedVersion: number }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendLead> => {
    if (useBackend) {
      return backendLeadsWriteRepository.delete(id, input, context);
    }
    return legacyLeadsWriteRepository.delete(id, input, context);
  },
};
