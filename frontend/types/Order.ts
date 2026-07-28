// ──────────────────────────────────────────────────────────
// Himalaya ERP — Master Order Status Enum
// Covers the complete Lead → Payment lifecycle
// ──────────────────────────────────────────────────────────
export enum OrderStatus {
  // ── Sales Stage ──────────────────────────────────────
  LEAD_CREATED        = 'LEAD_CREATED',
  SAMPLE_REQUIRED     = 'SAMPLE_REQUIRED',
  SAMPLE_APPROVED     = 'SAMPLE_APPROVED',
  QUOTATION_CREATED   = 'QUOTATION_CREATED',
  QUOTATION_SENT      = 'QUOTATION_SENT',
  QUOTATION_APPROVED  = 'QUOTATION_APPROVED',
  ORDER_CREATED       = 'ORDER_CREATED',
  ORDER_CONFIRMED     = 'ORDER_CONFIRMED',

  // ── Plant Head Stage ─────────────────────────────────
  PLANT_PENDING       = 'PLANT_PENDING',    // Sent to Plant Head
  PLANT_ACCEPTED      = 'PLANT_ACCEPTED',   // Plant Head accepted
  PLANT_REJECTED      = 'PLANT_REJECTED',   // Plant Head rejected
  PRODUCTION_PLANNED  = 'PRODUCTION_PLANNED', // Plan approved
  WORK_ORDER_CREATED  = 'WORK_ORDER_CREATED', // WO generated

  // ── Production Stage ─────────────────────────────────
  PRODUCTION_ACCEPTED = 'PRODUCTION_ACCEPTED',
  IN_PRODUCTION       = 'IN_PRODUCTION',
  PRODUCTION_COMPLETED= 'PRODUCTION_COMPLETED',
  REWORK              = 'REWORK',

  // ── QC Stage ─────────────────────────────────────────
  QC_PENDING          = 'QC_PENDING',
  QC_APPROVED         = 'QC_APPROVED',
  QC_FAILED           = 'QC_FAILED',

  // ── Dispatch Stage ───────────────────────────────────
  DISPATCH_PENDING    = 'DISPATCH_PENDING',   // Dispatch prepared
  IN_TRANSIT          = 'IN_TRANSIT',          // Dispatched / tracking
  DELIVERED           = 'DELIVERED',

  // ── Finance Stage ────────────────────────────────────
  INVOICED            = 'INVOICED',
  PAYMENT_PENDING     = 'PAYMENT_PENDING',

  // ── Finance Executive Stage ──────────────────────────
  PAYMENT_VERIFIED    = 'PAYMENT_VERIFIED',
  CLOSED              = 'CLOSED',

  // ── Legacy aliases (keep for compatibility) ──────────
  LEAD                = 'LEAD',
  SAMPLE              = 'SAMPLE',
  QUOTATION           = 'QUOTATION',
  SALES_ORDER         = 'SALES_ORDER',
  INVOICE_PENDING     = 'INVOICE_PENDING',
  PAID                = 'PAID',
}

// Current department — controls which panel sees the order
export type Department =
  | 'Sales'
  | 'Plant Head'
  | 'Production'
  | 'QC'
  | 'Dispatch'
  | 'Finance'
  | 'Finance Executive'
  | 'Closed';

// One timeline event appended at every status transition
export interface TimelineEvent {
  id: string;
  status: string;
  event: string;
  action: string;
  timestamp: string;
  actor: string;
  department: string;
  notes?: string;
}

// Product line item — carried from Lead all the way through
export interface OrderItem {
  productId?: string;
  productName: string;
  productDetails?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;     // %
  taxRate?: number;      // % (GST)
  code?: string;
}

// ──────────────────────────────────────────────────────────
// Master Order Record
// Created at quotation conversion and augmented at every stage
// ──────────────────────────────────────────────────────────
export interface Order {
  // ── Identity ────────────────────────────────────────
  id: string;
  orderNo: string;
  publicId?: string;

  // ── Cross-references ─────────────────────────────────
  leadId?: string;
  quotationId?: string;
  quotationRef?: string;
  workOrderId?: string;
  workOrderNo?: string;
  planId?: string;
  invoiceId?: string;

  // ── Customer ─────────────────────────────────────────
  customerName: string;
  customer: {
    id?: string;
    name: string;
    companyName?: string;
    contactPerson?: string;
    mobile?: string;
    email?: string;
    gstNumber?: string;
    gstName?: string;
  };
  deliveryAddress?: string;

  // ── Products / Items ─────────────────────────────────
  detailedItems: OrderItem[];
  products?: string;           // display string, derived

  // ── Pricing ──────────────────────────────────────────
  subTotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  freightCharges?: number;
  grandTotal?: number;
  totalAmount?: number;        // alias
  paymentTerms?: string;
  quotationValidity?: string;
  termsAndConditions?: string;

  // ── Workflow State ───────────────────────────────────
  workflowStatus: OrderStatus | string;
  status?: string;             // alias kept for legacy components
  currentDepartment: Department | string;
  overallStage?: string;

  // ── Plant Head sub-record ────────────────────────────
  plan?: {
    planId?: string;
    targetDate?: string;
    startDate?: string;
    priority?: string;
    machine?: string;
    machineId?: string;
    shift?: string;
    plant?: string;
    instructions?: string;
    remarks?: string;
    status?: string;          // 'Draft Plan' | 'Approved'
  };

  // ── Production sub-record ────────────────────────────
  production?: {
    actualStartDate?: string;
    machine?: string;
    operator?: string;
    shift?: string;
    batchNumber?: string;
    plannedQty?: number;
    producedQty?: number;
    rejectedQty?: number;
    balanceQty?: number;
    downtimeMinutes?: number;
    notes?: string;
    outputQuantity?: number;
    rejectQuantity?: number;
  };

  // ── QC sub-record ────────────────────────────────────
  qc?: {
    inspectorName?: string;
    inspectionDate?: string;
    dimensionResult?: string;
    weightResult?: string;
    strengthResult?: string;
    finishResult?: string;
    colorResult?: string;
    visualResult?: string;
    overallResult?: 'Pass' | 'Fail' | string;
    acceptedQty?: number;
    rejectedQty?: number;
    reworkQty?: number;
    defects?: string[];
    remarks?: string;
    images?: string[];
  };

  // ── Dispatch sub-record ──────────────────────────────
  dispatch?: {
    dispatchQty?: number;
    vehicleNo?: string;
    driverName?: string;
    driverPhone?: string;
    transporter?: string;
    lrNumber?: string;
    ewayBill?: string;
    deliveryChallan?: string;
    dispatchDate?: string;
    estimatedArrival?: string;
    actualDeliveryDate?: string;
    receiverName?: string;
    receivedQty?: number;
    deliveryRemarks?: string;
    proofOfDelivery?: string;
    loadingImages?: string[];
    dispatchTonnage?: number;
    driverMobile?: string;
  };

  // ── Finance sub-record ───────────────────────────────
  invoice?: {
    invoiceId?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    amount?: number;
    paidAmount?: number;
    balanceAmount?: number;
    dueDate?: string;
  };

  // ── Payment sub-record ───────────────────────────────
  payment?: {
    paymentId?: string;
    amount?: number;
    paymentDate?: string;
    paymentMode?: string;
    transactionReference?: string;
    utrNumber?: string;
    receiptFile?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    remarks?: string;
  };

  // ── Timeline ─────────────────────────────────────────
  history: TimelineEvent[];

  // ── Meta ─────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
  salesExecutive?: string;
  notes?: string;
  priority?: string;

  // ── Legacy compatibility fields ──────────────────────
  quotation?: any;
  schedule?: any;
  [key: string]: any;
}
