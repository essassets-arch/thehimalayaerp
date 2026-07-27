// ──────────────────────────────────────────────────────────
// Himalaya ERP — Canonical Production Constants & Helpers
// ──────────────────────────────────────────────────────────

export const WORK_ORDER_STATUS = {
  PRODUCTION_PLANNED: 'PRODUCTION_PLANNED',
  MATERIAL_PENDING: 'MATERIAL_PENDING',
  READY_FOR_PRODUCTION: 'READY_FOR_PRODUCTION',
  PRODUCTION_STARTED: 'PRODUCTION_STARTED',
  PRODUCTION_IN_PROGRESS: 'PRODUCTION_IN_PROGRESS',
  PRODUCTION_PAUSED: 'PRODUCTION_PAUSED',
  PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
  PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED',
} as const;

export const MATERIAL_REQUEST_STATUS = {
  PENDING_PLANT_HEAD_APPROVAL: 'PENDING_PLANT_HEAD_APPROVAL',
  PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
  PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
  STORE_APPROVED: 'STORE_APPROVED',
  STORE_REJECTED: 'STORE_REJECTED',
  ISSUED: 'ISSUED'
} as const;

/**
 * Validates logical stage transitions in the Production Lifecycle.
 */
export function assertProductionTransition(entityType: string, currentStatus: string, nextStatus: string): void {
  if (entityType === 'WORK_ORDER') {
    if (nextStatus === WORK_ORDER_STATUS.PRODUCTION_STARTED) {
      if (currentStatus !== WORK_ORDER_STATUS.READY_FOR_PRODUCTION && currentStatus !== WORK_ORDER_STATUS.PRODUCTION_PAUSED && currentStatus !== WORK_ORDER_STATUS.PRODUCTION_PLANNED) {
        throw new Error(`Invalid transition: Cannot start production from ${currentStatus}.`);
      }
    }
    
    if (nextStatus === WORK_ORDER_STATUS.PRODUCTION_COMPLETED) {
      const validPre = [
        WORK_ORDER_STATUS.PRODUCTION_STARTED, 
        WORK_ORDER_STATUS.PRODUCTION_IN_PROGRESS, 
        WORK_ORDER_STATUS.PARTIALLY_COMPLETED
      ];
      if (!validPre.includes(currentStatus as any)) {
        throw new Error(`Invalid transition: Cannot mark production complete from ${currentStatus}.`);
      }
    }
  }

  if (entityType === 'MATERIAL_REQUEST' && nextStatus === MATERIAL_REQUEST_STATUS.ISSUED) {
    if (currentStatus !== MATERIAL_REQUEST_STATUS.STORE_APPROVED) {
      throw new Error(`Invalid transition: Material Request must be STORE_APPROVED before being issued (current: ${currentStatus}).`);
    }
  }
}
