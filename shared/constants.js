// ──────────────────────────────────────────────────────────
// Himalaya ERP — Canonical Status Set
// Aligned with the full Lead → Payment lifecycle
// ──────────────────────────────────────────────────────────
export const STATUS = {
  // ── Sales ─────────────────────────────────────────────
  LEAD_CREATED:        'LEAD_CREATED',
  SAMPLE_REQUIRED:     'SAMPLE_REQUIRED',
  SAMPLE_APPROVED:     'SAMPLE_APPROVED',
  QUOTATION_CREATED:   'QUOTATION_CREATED',
  QUOTATION_SENT:      'QUOTATION_SENT',
  QUOTATION_APPROVED:  'QUOTATION_APPROVED',
  ORDER_CREATED:       'ORDER_CREATED',
  ORDER_CONFIRMED:     'ORDER_CONFIRMED',

  // ── Plant Head ─────────────────────────────────────────
  PLANT_PENDING:       'PLANT_PENDING',
  PLANT_ACCEPTED:      'PLANT_ACCEPTED',
  PLANT_REJECTED:      'PLANT_REJECTED',
  PRODUCTION_PLANNED:  'PRODUCTION_PLANNED',
  WORK_ORDER_CREATED:  'WORK_ORDER_CREATED',

  // ── Production ─────────────────────────────────────────
  PRODUCTION_ACCEPTED: 'PRODUCTION_ACCEPTED',
  IN_PRODUCTION:       'IN_PRODUCTION',
  PRODUCTION_COMPLETED:'PRODUCTION_COMPLETED',
  REWORK:              'REWORK',
  PAUSED:              'PAUSED',

  // ── QC ─────────────────────────────────────────────────
  QC_PENDING:          'QC_PENDING',
  QC_APPROVED:         'QC_APPROVED',
  QC_FAILED:           'QC_FAILED',

  // ── Dispatch ───────────────────────────────────────────
  DISPATCH_PENDING:    'DISPATCH_PENDING',
  IN_TRANSIT:          'IN_TRANSIT',
  DELIVERED:           'DELIVERED',

  // ── Finance ────────────────────────────────────────────
  INVOICED:            'INVOICED',
  PAYMENT_PENDING:     'PAYMENT_PENDING',

  // ── Finance Executive ──────────────────────────────────
  PAYMENT_VERIFIED:    'PAYMENT_VERIFIED',
  CLOSED:              'CLOSED',

  // ── Exceptional ────────────────────────────────────────
  CANCELLED:           'CANCELLED',

  // ── Legacy aliases ─────────────────────────────────────
  PLANNED:             'PRODUCTION_PLANNED',    // old alias
  DISPATCH_CREATED:    'DISPATCH_PENDING',       // old alias
  DISPATCH_READY:      'QC_APPROVED',            // old alias
  QC_PASSED:           'QC_APPROVED',            // old alias
  MATERIAL_REQUESTED:  'WORK_ORDER_CREATED',
  MATERIAL_APPROVED:   'WORK_ORDER_CREATED',
  MATERIAL_ISSUED:     'IN_PRODUCTION',
  PAYMENT_VERIFIED_OLD:'PAYMENT_VERIFIED',
  SALES_ORDER:         'ORDER_CONFIRMED',
};

// Department mapping — which statuses belong to which panel
export const DEPARTMENT_STATUSES = {
  Sales: [
    STATUS.ORDER_CREATED,
    STATUS.ORDER_CONFIRMED,
    STATUS.PLANT_PENDING,
    STATUS.PLANT_ACCEPTED,
    STATUS.PRODUCTION_PLANNED,
    STATUS.WORK_ORDER_CREATED,
    STATUS.IN_PRODUCTION,
    STATUS.PRODUCTION_COMPLETED,
    STATUS.QC_PENDING,
    STATUS.QC_APPROVED,
    STATUS.DISPATCH_PENDING,
    STATUS.IN_TRANSIT,
    STATUS.DELIVERED,
    STATUS.INVOICED,
    STATUS.PAYMENT_PENDING,
    STATUS.PAYMENT_VERIFIED,
    STATUS.CLOSED,
  ],
  PlantHead: [STATUS.PLANT_PENDING, STATUS.PLANT_ACCEPTED, STATUS.PRODUCTION_PLANNED, STATUS.WORK_ORDER_CREATED],
  Production: [STATUS.WORK_ORDER_CREATED, STATUS.PRODUCTION_ACCEPTED, STATUS.IN_PRODUCTION, STATUS.PRODUCTION_COMPLETED, STATUS.REWORK],
  QC: [STATUS.PRODUCTION_COMPLETED, STATUS.QC_PENDING, STATUS.QC_APPROVED, STATUS.QC_FAILED],
  Dispatch: [STATUS.QC_APPROVED, STATUS.DISPATCH_PENDING, STATUS.IN_TRANSIT, STATUS.DELIVERED],
  Finance: [STATUS.DELIVERED, STATUS.INVOICED, STATUS.PAYMENT_PENDING, STATUS.PAYMENT_VERIFIED, STATUS.CLOSED],
  FinanceExecutive: [STATUS.PAYMENT_PENDING, STATUS.PAYMENT_VERIFIED, STATUS.CLOSED],
};

// Status → label mapping for UI display
export const STATUS_LABELS = {
  LEAD_CREATED:        'New Lead',
  SAMPLE_REQUIRED:     'Sample Required',
  SAMPLE_APPROVED:     'Sample Approved',
  QUOTATION_CREATED:   'Quotation Created',
  QUOTATION_SENT:      'Quotation Sent',
  QUOTATION_APPROVED:  'Customer Approved',
  ORDER_CREATED:       'Order Created',
  ORDER_CONFIRMED:     'Order Confirmed',
  PLANT_PENDING:       'Waiting for Plant Head',
  PLANT_ACCEPTED:      'Plant Accepted',
  PLANT_REJECTED:      'Plant Rejected',
  PRODUCTION_PLANNED:  'Production Planned',
  WORK_ORDER_CREATED:  'Work Order Created',
  PRODUCTION_ACCEPTED: 'Production Accepted',
  IN_PRODUCTION:       'In Production',
  PRODUCTION_COMPLETED:'Production Completed',
  REWORK:              'Rework',
  QC_PENDING:          'QC Pending',
  QC_APPROVED:         'Ready for Dispatch',
  QC_FAILED:           'QC Rejected',
  DISPATCH_PENDING:    'Dispatch Prepared',
  IN_TRANSIT:          'Dispatched',
  DELIVERED:           'Delivered',
  INVOICED:            'Invoice Generated',
  PAYMENT_PENDING:     'Payment Pending',
  PAYMENT_VERIFIED:    'Payment Verified',
  CLOSED:              'Order Closed',
  CANCELLED:           'Cancelled',
  PAUSED:              'Paused',
  // Legacy
  SALES_ORDER:         'Sales Order',
  PLANNED:             'Planned',
};

// Re-export canonical procurement status definitions for JS/JSX usage
export const INDENT_STATUS = {
  PENDING_PLANT_HEAD_APPROVAL: 'PENDING_PLANT_HEAD_APPROVAL',
  PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
  PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
  CONVERTED_TO_PO: 'CONVERTED_TO_PO',
  CANCELLED: 'INDENT_CANCELLED',
};

export const PO_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_SUPER_ADMIN_APPROVAL: 'PENDING_SUPER_ADMIN_APPROVAL',
  SUPER_ADMIN_REJECTED: 'SUPER_ADMIN_REJECTED',
  SUPER_ADMIN_APPROVED: 'SUPER_ADMIN_APPROVED',
  PO_ISSUED: 'PO_ISSUED',
  VENDOR_ACCEPTED: 'VENDOR_ACCEPTED',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  GRN_SUBMITTED: 'GRN_SUBMITTED',
  GRN_APPROVED: 'GRN_APPROVED',
  STOCK_POSTED: 'STOCK_POSTED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PO_CLOSED: 'PO_CLOSED',
  CANCELLED: 'PO_CANCELLED',
};

export const GRN_STATUS = {
  DRAFT: 'GRN_DRAFT',
  SUBMITTED: 'GRN_SUBMITTED',
  APPROVED: 'GRN_APPROVED',
  QUALITY_REJECTED: 'QUALITY_REJECTED',
  STOCK_POSTED: 'STOCK_POSTED',
};

export const INVOICE_STATUS = {
  DRAFT: 'INVOICE_DRAFT',
  SUBMITTED: 'INVOICE_SUBMITTED',
  VERIFIED: 'INVOICE_VERIFIED',
  PAID: 'INVOICE_PAID',
  REJECTED: 'INVOICE_REJECTED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'PAYMENT_COMPLETED',
  FAILED: 'PAYMENT_FAILED',
  CANCELLED: 'PAYMENT_CANCELLED',
};

export const VRN_STATUS = {
  WAITING_PICKUP: 'WAITING_PICKUP',
  PICKED_UP: 'PICKED_UP',
  REPLACED: 'REPLACED',
  CLOSED: 'CLOSED',
};

