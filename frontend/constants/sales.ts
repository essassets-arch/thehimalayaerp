// ──────────────────────────────────────────────────────────
// Himalaya ERP — Canonical Sales Constants & Helpers
// ──────────────────────────────────────────────────────────

export const LEAD_STATUS = {
  NEW_LEAD: 'NEW_LEAD',
  CONTACTED: 'CONTACTED',
  FOLLOW_UP: 'FOLLOW_UP',
  QUALIFIED: 'QUALIFIED',
  SAMPLE_REQUIRED: 'SAMPLE_REQUIRED',
  QUOTATION_PENDING: 'QUOTATION_PENDING',
  QUOTATION_SENT: 'QUOTATION_SENT',
  CONVERTED_TO_ORDER: 'CONVERTED_TO_ORDER',
  LOST: 'LOST',
} as const;

export const SAMPLE_STATUS = {
  SAMPLE_REQUESTED: 'SAMPLE_REQUESTED',
  READY_FOR_DISPATCH: 'READY_FOR_DISPATCH',
  DISPATCHED: 'DISPATCHED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  UNDER_CUSTOMER_TESTING: 'UNDER_CUSTOMER_TESTING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURN_DUE: 'RETURN_DUE',
  RETURN_IN_TRANSIT: 'RETURN_IN_TRANSIT',
  SAMPLE_RETURNED: 'SAMPLE_RETURNED',
  LOST: 'LOST',
} as const;

export const QUOTATION_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  SENT_TO_CUSTOMER: 'SENT_TO_CUSTOMER',
  CUSTOMER_NEGOTIATION: 'CUSTOMER_NEGOTIATION',
  CUSTOMER_ACCEPTED: 'CUSTOMER_ACCEPTED',
  CUSTOMER_REJECTED: 'CUSTOMER_REJECTED',
  EXPIRED: 'EXPIRED',
  CONVERTED_TO_ORDER: 'CONVERTED_TO_ORDER',
} as const;

export const SALES_ORDER_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_CUSTOMER_CONFIRMATION: 'PENDING_CUSTOMER_CONFIRMATION',
  CUSTOMER_CONFIRMED: 'CUSTOMER_CONFIRMED',
  PENDING_PLANT_HEAD_REVIEW: 'PENDING_PLANT_HEAD_REVIEW',
  PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
  PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
  MATERIAL_PENDING: 'MATERIAL_PENDING',
  PRODUCTION_PLANNED: 'PRODUCTION_PLANNED',
  PRODUCTION_IN_PROGRESS: 'PRODUCTION_IN_PROGRESS',
  PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED',
  QC_PENDING: 'QC_PENDING',
  QC_FAILED_REWORK: 'QC_FAILED_REWORK',
  QC_APPROVED: 'QC_APPROVED',
  READY_FOR_DISPATCH: 'READY_FOR_DISPATCH',
  DISPATCHED: 'DISPATCHED',
  IN_TRANSIT: 'IN_TRANSIT',
  PARTIALLY_DELIVERED: 'PARTIALLY_DELIVERED',
  DELIVERED: 'DELIVERED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAYMENT_SUBMITTED_FOR_VERIFICATION: 'PAYMENT_SUBMITTED_FOR_VERIFICATION',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  ORDER_CLOSED: 'ORDER_CLOSED',
} as const;

export const DISPATCH_STATUS = {
  DISPATCH_CREATED: 'DISPATCH_CREATED',
  READY_FOR_DISPATCH: 'READY_FOR_DISPATCH',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  PARTIALLY_DELIVERED: 'PARTIALLY_DELIVERED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
  CUSTOMER_UNAVAILABLE: 'CUSTOMER_UNAVAILABLE',
  ADDRESS_ISSUE: 'ADDRESS_ISSUE',
  MATERIAL_RETURNED: 'MATERIAL_RETURNED',
} as const;

/**
 * Validates logical stage transitions in the Sales Lifecycle.
 */
export function assertSalesTransition(entityType: string, currentStatus: string, nextStatus: string): void {
  // Simple validation for critical transitions (can be expanded)
  
  if (entityType === 'ORDER') {
    const closedStatuses = [
      SALES_ORDER_STATUS.ORDER_CLOSED,
      SALES_ORDER_STATUS.PLANT_HEAD_REJECTED
    ];
    if (closedStatuses.includes(currentStatus as any)) {
      if (nextStatus !== SALES_ORDER_STATUS.PENDING_PLANT_HEAD_REVIEW) { // exception for resubmission
        throw new Error(`Invalid transition: Cannot transition from terminal state ${currentStatus}.`);
      }
    }

    if (nextStatus === SALES_ORDER_STATUS.READY_FOR_DISPATCH) {
      if (currentStatus !== SALES_ORDER_STATUS.QC_APPROVED && currentStatus !== SALES_ORDER_STATUS.QC_FAILED_REWORK && currentStatus !== SALES_ORDER_STATUS.PRODUCTION_COMPLETED) { 
        throw new Error(`Invalid transition: Order must be QC_APPROVED before Dispatch (current: ${currentStatus}).`);
      }
    }

    if (nextStatus === SALES_ORDER_STATUS.QC_APPROVED) {
      if (currentStatus !== SALES_ORDER_STATUS.QC_PENDING && currentStatus !== SALES_ORDER_STATUS.PRODUCTION_COMPLETED && currentStatus !== SALES_ORDER_STATUS.QC_FAILED_REWORK) {
        throw new Error(`Invalid transition: Cannot approve QC from ${currentStatus}.`);
      }
    }
    
    if (nextStatus === SALES_ORDER_STATUS.ORDER_CLOSED) {
      const preReqs = [
        SALES_ORDER_STATUS.DELIVERED,
        SALES_ORDER_STATUS.PAYMENT_VERIFIED,
        SALES_ORDER_STATUS.PAYMENT_SUBMITTED_FOR_VERIFICATION,
        SALES_ORDER_STATUS.PARTIALLY_DELIVERED
      ];
      if (!preReqs.includes(currentStatus as any)) {
        throw new Error(`Invalid transition: Cannot close order directly from ${currentStatus}.`);
      }
    }
  }

  if (entityType === 'QUOTATION') {
    if (nextStatus === QUOTATION_STATUS.CONVERTED_TO_ORDER) {
      if (currentStatus !== QUOTATION_STATUS.CUSTOMER_ACCEPTED) {
         throw new Error(`Invalid transition: Quotation must be CUSTOMER_ACCEPTED before converting to Order (current: ${currentStatus}).`);
      }
    }
  }
}
