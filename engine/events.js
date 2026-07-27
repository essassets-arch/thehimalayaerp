export const EVENTS = {
  LEAD_CREATED: 'LEAD_CREATED',
  SAMPLE_REQUESTED: 'SAMPLE_REQUESTED',
  SAMPLE_DISPATCHED: 'SAMPLE_DISPATCHED',
  SAMPLE_APPROVED: 'SAMPLE_APPROVED',
  SAMPLE_REJECTED: 'SAMPLE_REJECTED',
  QUOTATION_CREATED: 'QUOTATION_CREATED',
  QUOTATION_APPROVED: 'QUOTATION_APPROVED',
  
  // Strict workflow status values
  ORDER_CONFIRMED: 'Created', // alias for initial order creation
  CREATED: 'Created',
  PLANNED: 'Planned',
  MATERIAL_REQUESTED: 'Material Requested',
  MATERIAL_APPROVED: 'Material Approved',
  MATERIAL_ISSUED: 'Material Issued',
  IN_PRODUCTION: 'In Production',
  QC_PENDING: 'QC Pending',
  QC_PASSED: 'QC Passed',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_VERIFIED: 'Payment Verified',
  CLOSED: 'Closed'
};
