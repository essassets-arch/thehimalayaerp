import { legacyCustomersWriteRepository } from './legacyCustomersWriteRepository';
import { backendCustomersWriteRepository } from './backendCustomersWriteRepository';
import { FrontendCustomer } from './customerMapper';

const useBackend = true; // Phase 4 strictly enforces backend

export const customersWriteRepository = {
  create: async (input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    if (useBackend) {
      return backendCustomersWriteRepository.create(input, context);
    }
    return legacyCustomersWriteRepository.create(input, context);
  },

  update: async (id: string, input: any, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    if (useBackend) {
      return backendCustomersWriteRepository.update(id, input, context);
    }
    return legacyCustomersWriteRepository.update(id, input, context);
  },

  deactivate: async (id: string, input: { expectedVersion: number; reason?: string }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    if (useBackend) {
      return backendCustomersWriteRepository.deactivate(id, input, context);
    }
    return legacyCustomersWriteRepository.deactivate(id, input, context);
  },

  restore: async (id: string, input: { expectedVersion: number }, context: { idempotencyKey: string; requestId?: string }): Promise<FrontendCustomer> => {
    if (useBackend) {
      return backendCustomersWriteRepository.restore(id, input, context);
    }
    return legacyCustomersWriteRepository.restore(id, input, context);
  },
};
