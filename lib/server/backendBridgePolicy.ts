import 'server-only';

/**
 * Bridge policies define route-level requirements (e.g., idempotency key).
 * accessMode has been removed — all requests now carry the real user's JWT
 * extracted from the Authorization header forwarded by the browser.
 */
export type BridgePolicy = {
  requireIdempotencyKey: boolean;
};

export const bridgePolicies = {
  listCustomers:          { requireIdempotencyKey: false },
  checkCustomerDuplicates:{ requireIdempotencyKey: false },
  createCustomer:         { requireIdempotencyKey: true  },
  updateCustomer:         { requireIdempotencyKey: true  },
  deactivateCustomer:     { requireIdempotencyKey: true  },
  restoreCustomer:        { requireIdempotencyKey: true  },

  listLeads:              { requireIdempotencyKey: false },
  checkLeadDuplicates:    { requireIdempotencyKey: false },
  getLead:                { requireIdempotencyKey: false },
  createLead:             { requireIdempotencyKey: true  },
  updateLead:             { requireIdempotencyKey: true  },
  qualifyLead:            { requireIdempotencyKey: true  },
  markLeadLost:           { requireIdempotencyKey: true  },
  restoreLead:            { requireIdempotencyKey: true  },
  assignCustomer:         { requireIdempotencyKey: true  },
  unassignCustomer:       { requireIdempotencyKey: true  },
  setReminder:            { requireIdempotencyKey: true  },
  clearReminder:          { requireIdempotencyKey: true  },
  leadTimeline:           { requireIdempotencyKey: false },
  deleteLead:             { requireIdempotencyKey: true  },
} satisfies Record<string, BridgePolicy>;
