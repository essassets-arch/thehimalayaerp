export type DocumentReference = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storageKey?: string;
  localDataUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type AuditEvent = {
  id: string;
  entityType: 'LEAD' | 'SAMPLE' | 'QUOTATION' | 'ORDER' | 'PAYMENT' | 'REPLACEMENT' | 'RETURN' | 'DISPATCH';
  entityId: string;
  orderId?: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  actorId: string;
  actorName: string;
  department: string;
  remarks?: string;
  createdAt: string;
};


export type SalesLead = {
  id: string;
  customerName: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  phone: string;
  siteInchargeName?: string;
  siteInchargeMobile?: string;
  officeContact?: string;
  email: string;
  billingAddress: string;
  deliveryAddress: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  projectName?: string;
  groupName?: string;
  gstName?: string;
  gstNumber?: string;
  requiredProducts?: string;
  expectedQuantities?: string;
  expectedTransportationCost?: number;
  detailedItems?: any[];
  sampleRequired?: boolean;
  sampleItems?: any[];
  sampleQuantity?: number;
  sampleExpectedDate?: string;
  notes?: string;
  salesperson: string;
  status: 'LEAD_CREATED' | 'SAMPLE_REQUESTED' | 'QUOTATION_CREATED' | 'LOST';
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
};

export type SampleDispatchLeg = {
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  transportMode?: string;
  courier?: string;
  lrAwbNumber?: string;
  dispatchDate?: string;
  actualCost?: number;
  document?: DocumentReference;
  remarks?: string;
};

export type SalesSample = {
  id: string;
  leadId: string;
  quotationId?: string;
  product: string;
  quantity: number;
  specifications?: string;
  colorGradeSize?: string;
  notes?: string;
  
  expectedTransportationCost?: number;
  expectedDeliveryDate?: string;
  specialDeliveryInstructions?: string;

  forwardDispatch?: SampleDispatchLeg;
  returnDispatch?: SampleDispatchLeg;

  confirmedDeliveryDateTime?: string;
  receivedBy?: string;
  receiverContact?: string;
  podDocument?: DocumentReference;
  deliveryRemarks?: string;

  testingStartDateTime?: string;
  testingEndDateTime?: string;

  testingStatus: 'NOT_STARTED' | 'PENDING' | 'PASSED' | 'FAILED';
  returnStatus: 'NOT_REQUESTED' | 'REQUESTED' | 'ASSIGNED' | 'IN_TRANSIT' | 'RETURNED';

  // Overarching legacy status just for high-level tracking, but logic uses specific fields above
  status: 'SAMPLE_DISPATCH_REQUESTED' | 'SAMPLE_VEHICLE_ASSIGNED' | 'SAMPLE_DISPATCHED' | 'SAMPLE_IN_TRANSIT' | 'SAMPLE_DELIVERED' | 'SAMPLE_TESTING' | 'SAMPLE_PASSED' | 'SAMPLE_FAILED' | 'SAMPLE_RETURN_REQUESTED' | 'SAMPLE_RETURN_IN_TRANSIT' | 'SAMPLE_RETURNED';
  createdAt: string;
};

export type PaymentMilestone = {
  id: string;
  label: string;
  percentage: number;
  trigger: 'ORDER_CONFIRMATION' | 'BEFORE_DISPATCH' | 'ON_DISPATCH' | 'ON_DELIVERY' | 'AFTER_INVOICE' | 'AFTER_DELIVERY' | 'FIXED_DATE';
  offsetDays: number;
  fixedDate?: string;
};

export type QuotationLineItem = {
  id: string;
  productId: string;
  productName: string;
  specifications: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercentage: number;
  gstPercentage: number;
  hsnCode?: string;
  taxableValue: number;
  gstValue: number;
  totalAmount: number;
};

export type SalesQuotation = {
  id: string;
  leadId?: string;
  sampleId?: string;
  customerName: string;
  groupName?: string;
  gstName?: string;
  gstNumber?: string;
  billingAddress: string;
  deliveryAddress: string;
  contactPerson: string;
  salesperson: string;
  
  validityDate?: string;
  expectedTransportationCost: number;
  deliveryTerms?: string;
  termsAndNotes?: string;

  items: QuotationLineItem[];
  paymentMilestones: PaymentMilestone[];
  
  grandTotal: number;

  status: 'QUOTATION_DRAFT' | 'QUOTATION_SENT' | 'CUSTOMER_ACCEPTED' | 'CUSTOMER_REJECTED' | 'REVISION_REQUESTED' | 'CONVERTED_TO_ORDER';
  createdAt: string;
};

export type SalesOrder = {
  id: string;
  leadId?: string;
  quotationId: string;
  sampleId?: string;
  
  customerName: string;
  billingAddress: string;
  deliveryAddress: string;
  contactPerson: string;
  salesperson: string;

  items: QuotationLineItem[];
  paymentMilestones: PaymentMilestone[];
  
  transportationCost: number;
  grandTotal: number;
  
  // These MUST be calculated via selectors now based on the user's feedback, 
  // but keeping verifiedPaidAmount persists helps in cases where we don't want to recount the world.
  // Actually, user explicitly said: type SalesOrder = { grandTotal, salesReportedPaidAmount, verifiedPaidAmount }
  // "However, salesReportedPaidAmount is also derivable... A stronger design is [calculating it]". 
  // So we omit it here and derive it.

  requiredDeliveryDate?: string;

  commercialStatus: 'ORDER_CONFIRMED' | 'SENT_TO_PLANT_HEAD' | 'ORDER_ACTIVE' | 'ORDER_CLOSED' | 'ORDER_CANCELLED';
  planningStatus: 'NOT_SENT' | 'PENDING_ACCEPTANCE' | 'PLANT_HEAD_ACCEPTED' | 'PRODUCTION_PLANNED';
  productionStatus: 'NOT_STARTED' | 'WORK_ORDER_CREATED' | 'IN_PROGRESS' | 'COMPLETED';
  qcStatus: 'NOT_READY' | 'PENDING' | 'PARTIALLY_APPROVED' | 'APPROVED' | 'REWORK_REQUIRED' | 'REJECTED';
  dispatchStatus: 'NOT_READY' | 'PENDING' | 'CREATED' | 'IN_TRANSIT' | 'DELIVERED';
  paymentStatus: 'NOT_DUE' | 'PAYMENT_DUE' | 'ADVANCE_DUE' | 'PARTIALLY_PAID' | 'FINANCE_VERIFICATION_PENDING' | 'FULLY_PAID' | 'OVERDUE';
  replacementStatus: 'NONE' | 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED';
  returnStatus: 'NONE' | 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED';

  createdAt: string;
};

export type PaymentMethod = 'ONLINE' | 'CHEQUE' | 'BANK_TRANSFER' | 'CASH';

export type PaymentConfirmation = {
  id: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  transactionReference?: string;
  proofDocument?: DocumentReference;
  status: 'SALES_PAYMENT_RECORDED' | 'FINANCE_VERIFICATION_PENDING' | 'FINANCE_VERIFIED' | 'FINANCE_REJECTED';
  financeRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  replacesConfirmationId?: string;
  createdAt: string;
};

export type AfterSalesRequestItem = {
  orderLineId: string;
  productId: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  reason: string;
  condition?: string;
};

export type ReplacementRequest = {
  id: string;
  orderId: string;
  items: AfterSalesRequestItem[];
  status: 'REPLACEMENT_REQUESTED' | 'REPLACEMENT_APPROVED' | 'REPLACEMENT_REJECTED' | 'REPLACEMENT_DISPATCHED' | 'REPLACEMENT_IN_TRANSIT' | 'REPLACEMENT_DELIVERED';
  pickupRequired: boolean;
  replacementDeliveryAddress?: string;
  preferredReplacementDate?: string;
  photos?: DocumentReference[];
  documents?: DocumentReference[];
  remarks?: string;
  plantHeadRemarks?: string;
  dispatchId?: string;
  dispatchDetails?: Record<string, any>;
  deliveredAt?: string;
  receivedBy?: string;
  createdAt: string;
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  items: AfterSalesRequestItem[];
  status: 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURN_REJECTED' | 'RETURN_PICKUP_ASSIGNED' | 'RETURN_IN_TRANSIT' | 'RETURN_RECEIVED';
  pickupAddress?: string;
  contactPerson?: string;
  preferredPickupDate?: string;
  refundExpected: boolean;
  replacementExpected: boolean;
  photos?: DocumentReference[];
  documents?: DocumentReference[];
  pickupDocument?: DocumentReference;
  transitDocument?: DocumentReference;
  receiptImages?: DocumentReference[];
  receiptDocument?: DocumentReference;
  inspectionImages?: DocumentReference[];
  remarks?: string;
  plantHeadRemarks?: string;
  receivedAt?: string;
  receivedBy?: string;
  receivedItems?: Array<{
    orderLineId: string;
    receivedQuantity: number;
    condition?: string;
  }>;
  createdAt: string;
};

export type SalesDomainState = {
  leads: SalesLead[];
  samples: SalesSample[];
  quotations: SalesQuotation[];
  orders: SalesOrder[];
  paymentConfirmations: PaymentConfirmation[];
  replacementRequests: ReplacementRequest[];
  returnRequests: ReturnRequest[];
};

export type PaymentMode =
  | 'Bank Transfer'
  | 'NEFT'
  | 'RTGS'
  | 'IMPS'
  | 'UPI'
  | 'Cheque'
  | 'Cash'
  | 'Other';

export type PaymentVerificationStatus =
  | 'NOT_SUBMITTED'
  | 'FINANCE_EXECUTIVE_RECORDED'
  | 'FINANCE_VERIFICATION_PENDING'
  | 'FINANCE_VERIFIED'
  | 'FINANCE_REJECTED';

export type CollectionStatus =
  | 'NOT_STARTED'
  | 'FOLLOW_UP_REQUIRED'
  | 'CUSTOMER_CONTACTED'
  | 'PAYMENT_PROMISED'
  | 'PAYMENT_RECEIVED'
  | 'PARTIALLY_COLLECTED'
  | 'COLLECTION_COMPLETED';

export type PaymentHistoryEntry = {
  id: string;
  action:
    | 'PAYMENT_RECORDED'
    | 'SUBMITTED_TO_FINANCE'
    | 'PAYMENT_VERIFIED'
    | 'PAYMENT_REJECTED'
    | 'CORRECTION_STARTED'
    | 'PAYMENT_RESUBMITTED'
    | 'RECEIPT_GENERATED';

  fromStatus?: PaymentVerificationStatus;
  toStatus?: PaymentVerificationStatus;

  actorId: string;
  actorName?: string;
  actorRole: string;

  remarks?: string;
  changes?: Record<string, {
    from: unknown;
    to: unknown;
  }>;

  createdAt: string;
};

export type CustomerPayment = {
  id: string;
  orderId: string;
  invoiceId?: string;
  customerId: string;
  customerName: string;

  paymentAmount: number;
  paymentDate: string;
  paymentMode: PaymentMode;

  bankName?: string;
  transactionReference?: string;
  chequeNumber?: string;
  referenceNumber?: string;

  paymentProof?: string[];
  remarks?: string;

  source: 'SALES' | 'FINANCE_EXECUTIVE' | 'FINANCE';

  recordedBy: string;
  recordedAt: string;

  verificationStatus: PaymentVerificationStatus;

  submittedBy?: string;
  submittedAt?: string;

  verifiedBy?: string;
  verifiedAt?: string;

  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  correctionRequired?: string;

  revision: number;
  history: PaymentHistoryEntry[];
};

export type PaymentFollowUp = {
  id: string;
  customerId: string;
  orderId?: string;
  invoiceNumber?: string;
  contactPerson: string;
  phoneNumber: string;
  followUpDate: string;
  contactMode: 'Phone' | 'Email' | 'WhatsApp' | 'Meeting' | 'Other';
  discussionSummary: string;
  customerResponse:
    | 'Will Pay'
    | 'Part Payment Promised'
    | 'Payment Already Sent'
    | 'Invoice Issue'
    | 'Quality Issue'
    | 'Delivery Issue'
    | 'Needs More Time'
    | 'No Response'
    | 'Disputed'
    | 'Other';
  promisedAmount?: number;
  promisedPaymentDate?: string;
  nextFollowUpDate: string;
  remarks?: string;
  recordedBy: string;
  recordedAt: string;
};

export type PaymentReceipt = {
  id: string;
  receiptNumber: string;
  paymentId: string;
  orderId: string;
  invoiceNumber?: string;
  customerName: string;
  customerAddress?: string;
  paymentDate: string;
  paymentAmount: number;
  paymentMode: PaymentMode;
  transactionReference?: string;
  totalInvoiceAmount: number;
  previouslyPaidAmount: number;
  currentPaymentAmount: number;
  remainingBalance: number;
  collectedBy: string;
  verifiedBy?: string;
  companyDetails?: string;
  authorizedSignature?: string;
  createdAt: string;
};

export type FinanceDomainState = {
  customerPayments: CustomerPayment[];
  paymentFollowUps: PaymentFollowUp[];
  paymentReceipts: PaymentReceipt[];
};

