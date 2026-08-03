// ──────────────────────────────────────────────────────────
// Himalaya ERP — Final Procurement Workflow Types & Constants
// ──────────────────────────────────────────────────────────

export const INDENT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_PLANT_HEAD_APPROVAL: 'PENDING_PLANT_HEAD_APPROVAL',
  PLANT_HEAD_CORRECTION_REQUIRED: 'PLANT_HEAD_CORRECTION_REQUIRED',
  PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
  FINANCE_ACCEPTED: 'FINANCE_ACCEPTED',
  CONVERTED_TO_PO: 'CONVERTED_TO_PO',
  PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export const PO_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_SUPER_ADMIN_APPROVAL: 'PENDING_SUPER_ADMIN_APPROVAL',
  SUPER_ADMIN_REJECTED: 'SUPER_ADMIN_REJECTED',
  SUPER_ADMIN_APPROVED: 'SUPER_ADMIN_APPROVED',
  PO_ISSUED: 'PO_ISSUED',
  DELIVERY_PENDING: 'DELIVERY_PENDING',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  FULLY_RECEIVED: 'FULLY_RECEIVED',
  CLOSURE_PENDING: 'CLOSURE_PENDING',
  PO_CLOSED: 'PO_CLOSED',
  PO_CANCELLED: 'PO_CANCELLED',
} as const;

export const GRN_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED_FOR_FINANCE_AUDIT: 'SUBMITTED_FOR_FINANCE_AUDIT',
  FINANCE_AUDIT_ON_HOLD: 'FINANCE_AUDIT_ON_HOLD',
  FINANCE_CORRECTION_REQUIRED: 'FINANCE_CORRECTION_REQUIRED',
  FINANCE_APPROVED: 'FINANCE_APPROVED',
  FINANCE_REJECTED: 'FINANCE_REJECTED',
} as const;

export const GRN_TYPE = {
  STANDARD: 'STANDARD',
  REPLACEMENT: 'REPLACEMENT'
} as const;

export const COMMERCIAL_TREATMENT = {
  ZERO_VALUE_REPLACEMENT: 'ZERO_VALUE_REPLACEMENT',
  CHARGEABLE_REPLACEMENT: 'CHARGEABLE_REPLACEMENT',
  DEBIT_NOTE_ADJUSTMENT: 'DEBIT_NOTE_ADJUSTMENT',
  CREDIT_NOTE_ADJUSTMENT: 'CREDIT_NOTE_ADJUSTMENT'
} as const;

export const DEFECTIVE_MATERIAL_DISPOSITION = {
  RETURN_TO_VENDOR: 'RETURN_TO_VENDOR',
  VENDOR_PICKUP_PENDING: 'VENDOR_PICKUP_PENDING',
  SCRAP_AFTER_APPROVAL: 'SCRAP_AFTER_APPROVAL',
  DISPOSE_LOCALLY: 'DISPOSE_LOCALLY',
  RETAIN_FOR_INSPECTION: 'RETAIN_FOR_INSPECTION'
} as const;

export const MATERIAL_REJECTION_STATUS = {
  DRAFT: 'DRAFT',
  MATERIAL_REJECTION_SUBMITTED: 'MATERIAL_REJECTION_SUBMITTED',
  FINANCE_VENDOR_DISCUSSION: 'FINANCE_VENDOR_DISCUSSION',
  REPLACEMENT_APPROVED: 'REPLACEMENT_APPROVED',
  REPLACEMENT_EXPECTED: 'REPLACEMENT_EXPECTED',
  PARTIALLY_RESOLVED: 'PARTIALLY_RESOLVED',
  RESOLVED: 'RESOLVED',
  NO_REPLACEMENT: 'NO_REPLACEMENT',
  CREDIT_NOTE_PENDING: 'CREDIT_NOTE_PENDING',
  CREDIT_NOTE_RECEIVED: 'CREDIT_NOTE_RECEIVED',
  COMMERCIAL_ADJUSTMENT_COMPLETED: 'COMMERCIAL_ADJUSTMENT_COMPLETED',
  REJECTED_BY_FINANCE: 'REJECTED_BY_FINANCE',
  VENDOR_DISPUTE: 'VENDOR_DISPUTE',
  WRITE_OFF_PENDING: 'WRITE_OFF_PENDING',
  WRITE_OFF_APPROVED: 'WRITE_OFF_APPROVED',
  CLOSED: 'CLOSED',
} as const;

export const REPLACEMENT_RECEIPT_STATUS = {
  EXPECTED: 'EXPECTED',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  FULLY_RECEIVED: 'FULLY_RECEIVED',
  FINANCE_VERIFIED: 'FINANCE_VERIFIED',
  CLOSED: 'CLOSED',
} as const;

export const VENDOR_INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  THREE_WAY_MATCH_PENDING: 'THREE_WAY_MATCH_PENDING',
  MISMATCH_FOUND: 'MISMATCH_FOUND',
  ON_HOLD: 'ON_HOLD',
  APPROVED: 'APPROVED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
} as const;

export type ProcurementDocumentEntityType = 'INDENT' | 'PURCHASE_ORDER' | 'GRN' | 'MATERIAL_REJECTION' | 'REPLACEMENT_RECEIPT' | 'VENDOR_INVOICE';

export type ProcurementDocumentType = 'VENDOR_QUOTATION' | 'PO_PDF' | 'VENDOR_INVOICE' | 'DELIVERY_CHALLAN' | 'LR' | 'E_WAY_BILL' | 'WEIGHBRIDGE_SLIP' | 'MATERIAL_CERTIFICATE' | 'DELIVERY_PHOTO' | 'DAMAGE_PHOTO' | 'CREDIT_NOTE' | 'OTHER';

export interface ProcurementDocument {
  id: string;
  entityType: ProcurementDocumentEntityType;
  entityId: string;
  documentType: ProcurementDocumentType;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey?: string;
  localDataUrl?: string;
  checksum?: string;
  uploadedBy: string;
  uploadedAt: string;
  isDeleted: boolean;
}

export interface ProcurementAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  remarks: string;
  quantityChanges: Record<string, number>;
  documentIds: string[];
  metadata: Record<string, unknown>;
}

export function assertTransition(
  entity: string,
  currentStatus: string,
  allowedStatuses: string[],
  action: string
) {
  if (!allowedStatuses.includes(currentStatus)) {
    throw new Error(
      `Cannot ${action} ${entity}: current status is ${currentStatus}; ` +
      `allowed status${allowedStatuses.length > 1 ? 'es are' : ' is'} ` +
      `${allowedStatuses.join(', ')}.`
    );
  }
}

export function createId(prefix: string): string {
  const ts = Date.now();
  const rand = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).substring(2, 10);
  return `${prefix}-${ts}-${rand}`;
}

export function createHumanNo(prefix: string, seq?: number): string {
  const year = new Date().getFullYear();
  const num = seq !== undefined ? String(seq).padStart(4, '0') : String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${year}-${num}`;
}

export function calculatePOLineTotals(items: any[], freightAmount: number = 0) {
  const normalizedItems = (items || []).map((item: any) => {
    const orderedQty = Number(item.orderedQty !== undefined ? item.orderedQty : item.quantity) || 0;
    const unitRate = Number(item.unitRate !== undefined ? item.unitRate : item.rate) || 0;
    const discountPercent = Number(item.discountPercent || 0);
    const gstPercent = Number(item.gstPercent !== undefined ? item.gstPercent : item.gst) || 18;

    const lineBase = Number((orderedQty * unitRate).toFixed(2));
    const lineDiscount = Number(((lineBase * discountPercent) / 100).toFixed(2));
    const lineTaxable = Number((lineBase - lineDiscount).toFixed(2));
    const lineGst = Number(((lineTaxable * gstPercent) / 100).toFixed(2));
    const lineTotal = Number((lineTaxable + lineGst).toFixed(2));

    return {
      ...item,
      orderedQty,
      unitRate,
      discountPercent,
      gstPercent,
      lineBase,
      lineDiscount,
      taxableAmount: lineTaxable,
      gstAmount: lineGst,
      lineTotal,
    };
  });

  const subtotal = Number(normalizedItems.reduce((acc, i) => acc + i.lineBase, 0).toFixed(2));
  const discountAmount = Number(normalizedItems.reduce((acc, i) => acc + i.lineDiscount, 0).toFixed(2));
  const itemsTaxable = Number(normalizedItems.reduce((acc, i) => acc + i.taxableAmount, 0).toFixed(2));
  const itemsGst = Number(normalizedItems.reduce((acc, i) => acc + i.gstAmount, 0).toFixed(2));

  const freight = Number(freightAmount || 0);
  const freightGst = Number((freight * 0.18).toFixed(2)); // Standard 18% GST on freight

  const taxableAmount = Number((itemsTaxable + freight).toFixed(2));
  const gstAmount = Number((itemsGst + (freight > 0 ? freightGst : 0)).toFixed(2));
  const grandTotal = Number((taxableAmount + gstAmount).toFixed(2));

  return {
    items: normalizedItems,
    subtotal,
    discountAmount,
    freightAmount: freight,
    taxableAmount,
    gstAmount,
    grandTotal,
  };
}

export function createProcurementAuditEntry(
  a1: string = 'PROCUREMENT_EVENT',
  a2?: string | null,
  a3?: string | null,
  a4?: string | null,
  a5?: string | null,
  a6?: string,
  a7?: string,
  remarks: string = '',
  quantityChanges: Record<string, number> = {},
  documentIds: string[] = [],
  metadata: Record<string, unknown> = {}
): ProcurementAuditLog {
  let entityType = 'Procurement';
  let entityId = 'GENERIC';
  let action = a1;
  let previousStatus: string | null = null;
  let newStatus: string | null = null;
  let actorName = 'System';
  let actorRole = 'System';

  if (a7 !== undefined) {
    entityType = a1;
    entityId = a2 || 'GENERIC';
    action = a3 || 'ACTION';
    previousStatus = a4 ?? null;
    newStatus = a5 ?? null;
    actorName = a6 || 'System';
    actorRole = a7 || 'System';
  } else {
    action = a1;
    previousStatus = a2 ?? null;
    newStatus = a3 ?? null;
    actorName = a4 || 'System';
    actorRole = a5 || 'System';
  }

  return {
    id: createId('AUD'),
    entityType,
    entityId,
    action,
    previousStatus,
    newStatus,
    actorId: actorName,
    actorName,
    actorRole,
    timestamp: new Date().toISOString(),
    remarks,
    quantityChanges,
    documentIds,
    metadata,
  };
}
