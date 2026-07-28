/**
 * salesActions.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure domain action functions for the Sales O2C workflow.
 *
 * Rules:
 *  - Every function takes `(state: ERPState, payload, actor) → ERPState`
 *  - No function touches the Zustand store directly (no useERPStore calls)
 *  - Every create action returns the new record ID via the idMap out-param pattern;
 *    callers get the ID by reading state.sales.* after dispatch.
 *  - Idempotent: re-running with the same payload returns the existing record.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  SalesDomainState,
  SalesLead,
  SalesSample,
  SalesQuotation,
  SalesOrder,
  PaymentConfirmation,
  ReplacementRequest,
  ReturnRequest,
  AuditEvent,
  AfterSalesRequestItem,
} from './salesTypes';
import {
  assertQuotationCanConvert,
  assertOrderCanSendToPlantHead,
  assertSalesPaymentValid,
  assertPaymentCanBeVerified,
  assertPaymentCanBeRejected,
  assertReplacementCanDispatch,
  assertReturnCanBeAssigned,
  assertReturnCanStartTransit,
  assertReturnCanBeReceived,
  assertValidAfterSalesQuantity,
  SalesTransitionError,
} from './salesTransitions';
import { validateQuotation } from './salesValidation';
import { deriveOrderPaymentStatus } from './salesCalculations';
import { normalizeStatus } from '../shared/workflowUtils';
import { generateEntityIdPure } from '../../idGenerator';

// ─── ERPState shape (minimal inline type for portability) ───────────────────
export type ActionActor = { id: string; name: string };

export interface ERPState {
  sales: SalesDomainState;
  production: {
    workOrders: any[];
    qcRecords: any[];
    finishedGoods: any[];
  };
  dispatch: {
    dispatchOrders: any[];
    consignments: any[];
  };
  auditEvents: AuditEvent[];
  [key: string]: any; // Other non-Sales domain properties pass through
}

// ─── Helpers ────────────────────────────────────────────────────────────────



const audit = (
  entityType: AuditEvent['entityType'],
  entityId: string,
  action: string,
  actor: ActionActor,
  department: string,
  newStatus?: string,
  previousStatus?: string,
  remarks?: string,
  orderId?: string
): AuditEvent => ({
  id: `AUD-${Date.now()}-${Math.floor(Math.random() * 999)}`,
  entityType,
  entityId,
  orderId,
  action,
  previousStatus,
  newStatus,
  actorId: actor.id,
  actorName: actor.name,
  department,
  remarks,
  createdAt: new Date().toISOString(),
});

const normalizeSales = (sales: Partial<SalesDomainState>): SalesDomainState => ({
  leads: Array.isArray(sales?.leads) ? sales.leads : [],
  samples: Array.isArray(sales?.samples) ? sales.samples : [],
  quotations: Array.isArray(sales?.quotations) ? sales.quotations : [],
  orders: Array.isArray(sales?.orders) ? sales.orders : [],
  paymentConfirmations: Array.isArray(sales?.paymentConfirmations) ? sales.paymentConfirmations : [],
  replacementRequests: Array.isArray(sales?.replacementRequests) ? sales.replacementRequests : [],
  returnRequests: Array.isArray(sales?.returnRequests) ? sales.returnRequests : [],
});

const withSales = (state: ERPState, updates: Partial<SalesDomainState>, newAudit?: AuditEvent): ERPState => ({
  ...state,
  sales: { ...normalizeSales(state.sales), ...updates },
  auditEvents: newAudit
    ? [newAudit, ...(state.auditEvents || [])]
    : (state.auditEvents || []),
});

// ─── Payload Types (exported for consumers) ──────────────────────────────────

export type CreateLeadPayload = {
  id?: string;
  companyName: string;
  contactPerson: string;
  customerName?: string;
  mobile?: string;
  phone?: string;
  siteInchargeName?: string;
  siteInchargeMobile?: string;
  officeContact?: string;
  email?: string;
  projectName?: string;
  groupName?: string;
  gstName?: string;
  gstNumber?: string;
  billingAddress?: string;
  deliveryAddress?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  expectedTransportationCost?: number;
  notes?: string;
  requiredProducts?: string;
  expectedQuantities?: string;
  detailedItems?: any[];
  sampleRequired?: boolean;
  sampleItems?: any[];
  sampleQuantity?: number;
  sampleExpectedDate?: string;
};

export type RequestSamplePayload = {
  id?: string;
  leadId: string;
  product: string;
  quantity: number;
  specifications?: string;
  colorGradeSize?: string;
  notes?: string;
  expectedTransportationCost?: number;
  expectedDeliveryDate?: string;
  specialDeliveryInstructions?: string;
};

export type CreateQuotationPayload = {
  id?: string;
  leadId?: string;
  sampleId?: string;
  customerName: string;
  groupName?: string;
  gstName?: string;
  gstNumber?: string;
  billingAddress: string;
  deliveryAddress: string;
  contactPerson: string;
  validityDate?: string;
  expectedTransportationCost: number;
  deliveryTerms?: string;
  termsAndNotes?: string;
  items: SalesQuotation['items'];
  paymentMilestones: SalesQuotation['paymentMilestones'];
  grandTotal: number;
};

export type RecordPaymentPayload = {
  amount: number;
  paymentDate: string;
  method: PaymentConfirmation['method'];
  transactionReference?: string;
  proofDocument?: PaymentConfirmation['proofDocument'];
};

export type RequestAfterSalesPayload = {
  orderId: string;
  items: AfterSalesRequestItem[];
  pickupAddress?: string;
  contactPerson?: string;
  preferredDate?: string;
  photos?: any[];
  documents?: any[];
  remarks?: string;
  // Replacement-specific
  pickupRequired?: boolean;
  replacementDeliveryAddress?: string;
  preferredReplacementDate?: string;
  // Return-specific
  refundExpected?: boolean;
  replacementExpected?: boolean;
  preferredPickupDate?: string;
};

export type SendToPlantHeadPayload = {
  requiredDeliveryDate?: string;
  remarks?: string;
};

export type AcceptByPlantHeadPayload = {
  remarks?: string;
};

export type RejectByPlantHeadPayload = {
  remarks: string;
};

export type PlanOrderPayload = {
  targetDate?: string;
  targetProductionDate?: string;
  productionLine?: string;
  machine?: string;
  priority?: string;
  remarks?: string;
};

export type AssignReturnPickupPayload = {
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  transporter?: string;
  lrAwbNumber?: string;
  pickupDate?: string;
  expectedFactoryArrival?: string;
  transportationCost?: number;
  pickupDocument?: any;
  remarks?: string;
};

export type ConfirmReturnReceiptPayload = {
  receivedDate?: string;
  receivedAt?: string;
  receivedTime?: string;
  receivedBy: string;
  receivedQuantity?: number;
  receivedItems?: Array<{
    orderLineId: string;
    receivedQuantity: number;
    condition?: string;
  }>;
  materialCondition?: string;
  inspectionNotes?: string;
  receiptImages?: any[];
  receiptDocument?: any;
  remarks?: string;
};

// ════════════════════════════════════════════════════════════════════════════
//  LEAD ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export function createLead(
  state: ERPState,
  payload: CreateLeadPayload,
  actor: ActionActor
): [ERPState, string] {
  const leads = normalizeSales(state.sales).leads;

  // Idempotency: if same id provided and exists, return existing
  if (payload.id) {
    const existing = leads.find((l) => l.id === payload.id);
    if (existing) return [state, existing.id];
  }

  let nextState = state;
  let leadId = payload.id;
  if (!leadId) {
    [leadId, nextState] = generateEntityIdPure(state, 'lead');
  }
  const companyName = payload.companyName || payload.customerName || '';
  const contactPerson = payload.contactPerson || payload.siteInchargeName || '';
  const mobile = payload.mobile || payload.phone || payload.siteInchargeMobile || '';
  const formattedAddress = payload.address
    ? [
        payload.address.line1,
        payload.address.city,
        payload.address.state,
        payload.address.pincode,
        payload.address.country,
      ].filter(Boolean).join(', ')
    : '';
  const billingAddress = payload.billingAddress || formattedAddress;
  const deliveryAddress = payload.deliveryAddress || formattedAddress;

  const newLead: SalesLead = {
    id: leadId,
    customerName: companyName,
    companyName,
    contactPerson,
    mobile,
    phone: mobile,
    siteInchargeName: payload.siteInchargeName || contactPerson,
    siteInchargeMobile: payload.siteInchargeMobile || mobile,
    officeContact: payload.officeContact || '',
    email: payload.email || '',
    projectName: payload.projectName || '',
    groupName: payload.groupName || '',
    gstName: payload.gstName || '',
    gstNumber: payload.gstNumber || '',
    billingAddress,
    deliveryAddress,
    address: payload.address,
    requiredProducts: payload.requiredProducts || '',
    expectedQuantities: payload.expectedQuantities || '',
    expectedTransportationCost: Number(payload.expectedTransportationCost) || 0,
    detailedItems: Array.isArray(payload.detailedItems) ? payload.detailedItems : [],
    sampleRequired: Boolean(payload.sampleRequired),
    sampleItems: Array.isArray(payload.sampleItems) ? payload.sampleItems : [],
    sampleQuantity: Number(payload.sampleQuantity) || 0,
    sampleExpectedDate: payload.sampleExpectedDate || '',
    notes: payload.notes || '',
    status: 'LEAD_CREATED',
    salesperson: actor.name,
    createdBy: actor.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return [
    withSales(
      nextState,
      { leads: [...leads, newLead] },
      audit('LEAD', leadId, 'LEAD_CREATED', actor, 'Sales', 'LEAD_CREATED')
    ),
    leadId,
  ];
}

export function updateLeadStatus(
  state: ERPState,
  leadId: string,
  status: SalesLead['status'],
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const lead = sales.leads.find((l) => l.id === leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  const updatedLead = { ...lead, status, updatedAt: new Date().toISOString() };
  return withSales(
    state,
    { leads: sales.leads.map((l) => (l.id === leadId ? updatedLead : l)) },
    audit('LEAD', leadId, `LEAD_STATUS_${status}`, actor, 'Sales', status, lead.status)
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SAMPLE ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export function requestSample(
  state: ERPState,
  payload: RequestSamplePayload,
  actor: ActionActor
): [ERPState, string] {
  const sales = normalizeSales(state.sales);

  if (payload.id) {
    const existing = sales.samples.find((s) => s.id === payload.id);
    if (existing) return [state, existing.id];
  }

  let nextState = state;
  let sampleId = payload.id;
  if (!sampleId) {
    [sampleId, nextState] = generateEntityIdPure(state, 'sample');
  }

  const newSample: SalesSample = {
    id: sampleId,
    leadId: payload.leadId,
    product: payload.product,
    quantity: payload.quantity,
    specifications: payload.specifications,
    colorGradeSize: payload.colorGradeSize,
    notes: payload.notes,
    expectedTransportationCost: payload.expectedTransportationCost,
    expectedDeliveryDate: payload.expectedDeliveryDate,
    specialDeliveryInstructions: payload.specialDeliveryInstructions,
    testingStatus: 'NOT_STARTED',
    returnStatus: 'NOT_REQUESTED',
    status: 'SAMPLE_DISPATCH_REQUESTED',
    createdAt: new Date().toISOString(),
  };

  // Update lead status to SAMPLE_REQUESTED
  const updatedLeads = sales.leads.map((l) =>
    l.id === payload.leadId && l.status === 'LEAD_CREATED'
      ? { ...l, status: 'SAMPLE_REQUESTED' as const, updatedAt: new Date().toISOString() }
      : l
  );

  return [
    withSales(
      nextState,
      { samples: [...sales.samples, newSample], leads: updatedLeads },
      audit('SAMPLE', sampleId, 'SAMPLE_REQUESTED', actor, 'Sales', 'SAMPLE_DISPATCH_REQUESTED')
    ),
    sampleId,
  ];
}

// ════════════════════════════════════════════════════════════════════════════
//  QUOTATION ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export function createQuotation(
  state: ERPState,
  payload: CreateQuotationPayload,
  actor: ActionActor
): [ERPState, string] {
  const sales = normalizeSales(state.sales);

  if (payload.id) {
    const existing = sales.quotations.find((q) => q.id === payload.id);
    if (existing) return [state, existing.id];
  }

  const sourceLead = payload.leadId
    ? sales.leads.find((lead) => lead.id === payload.leadId)
    : undefined;
  const rawPayload = payload as any;
  const sourceItems = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(rawPayload.detailedItems)
      ? rawPayload.detailedItems
      : [];
  const normalizedItems = sourceItems.map((item: any, index: number) => ({
    ...item,
    id: item.id || `QTN-LINE-${index + 1}`,
    productId: item.productId || item.code || `PRODUCT-${index + 1}`,
    productName: item.productName || item.name || '',
    specification: item.specification || item.productDetails || item.description || '',
    quantity: Number(item.quantity ?? item.qty ?? 0),
    unit: item.unit || 'Pcs',
    unitPrice: Number(item.unitPrice ?? item.rate ?? 0),
    discountPercent: Number(item.discountPercent ?? item.discount ?? 0),
    gstPercent: Number(item.gstPercent ?? item.tax ?? 0),
    lineTotal: Number(
      item.lineTotal ??
      item.amount ??
      (
        Number(item.quantity ?? item.qty ?? 0) *
        Number(item.unitPrice ?? item.rate ?? 0)
      )
    ),
  }));
  const normalizedMilestones = Array.isArray(payload.paymentMilestones)
    ? payload.paymentMilestones
    : [{
        id: 'PM-1',
        label: rawPayload.paymentTerms || 'Full Payment',
        percentage: 100,
        trigger: 'ON_DELIVERY',
        offsetDays: 0,
      }];
  const normalizedPayload: CreateQuotationPayload = {
    ...payload,
    customerName: payload.customerName || sourceLead?.companyName || sourceLead?.customerName || '',
    contactPerson: payload.contactPerson || sourceLead?.contactPerson || '',
    billingAddress: payload.billingAddress || sourceLead?.billingAddress || '',
    deliveryAddress: payload.deliveryAddress || sourceLead?.deliveryAddress || '',
    expectedTransportationCost: Number(
      payload.expectedTransportationCost ?? rawPayload.transportCharge ?? 0
    ),
    validityDate: payload.validityDate || rawPayload.validTill,
    termsAndNotes: payload.termsAndNotes || rawPayload.notes,
    items: normalizedItems,
    paymentMilestones: normalizedMilestones,
    grandTotal: Number(payload.grandTotal ?? rawPayload.totalAmount ?? 0),
  };

  const errors = validateQuotation(normalizedPayload);
  if (errors.length > 0) throw new Error(`Quotation validation: ${errors.join(', ')}`);

  let nextState = state;
  let quotationId = payload.id;
  if (!quotationId) {
    [quotationId, nextState] = generateEntityIdPure(state, 'quotation');
  }

  const newQuotation: SalesQuotation = {
    id: quotationId,
    leadId: normalizedPayload.leadId,
    sampleId: normalizedPayload.sampleId,
    customerName: normalizedPayload.customerName,
    groupName: normalizedPayload.groupName,
    gstName: normalizedPayload.gstName,
    gstNumber: normalizedPayload.gstNumber,
    billingAddress: normalizedPayload.billingAddress,
    deliveryAddress: normalizedPayload.deliveryAddress,
    contactPerson: normalizedPayload.contactPerson,
    salesperson: actor.name,
    validityDate: normalizedPayload.validityDate,
    expectedTransportationCost: normalizedPayload.expectedTransportationCost,
    deliveryTerms: normalizedPayload.deliveryTerms,
    termsAndNotes: normalizedPayload.termsAndNotes,
    items: normalizedPayload.items,
    paymentMilestones: normalizedPayload.paymentMilestones,
    grandTotal: normalizedPayload.grandTotal,
    status: 'QUOTATION_DRAFT',
    createdAt: new Date().toISOString(),
  };

  // Mark lead as QUOTATION_CREATED if applicable
  const updatedLeads = payload.leadId
    ? sales.leads.map((l) =>
        l.id === payload.leadId
          ? { ...l, status: 'QUOTATION_CREATED' as const, updatedAt: new Date().toISOString() }
          : l
      )
    : sales.leads;

  return [
    withSales(
      nextState,
      { quotations: [...sales.quotations, newQuotation], leads: updatedLeads },
      audit('QUOTATION', quotationId, 'QUOTATION_CREATED', actor, 'Sales', 'QUOTATION_DRAFT')
    ),
    quotationId,
  ];
}

export function updateQuotationStatus(
  state: ERPState,
  quotationId: string,
  status: SalesQuotation['status'],
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const quotation = sales.quotations.find((q) => q.id === quotationId);
  if (!quotation) throw new Error(`Quotation ${quotationId} not found`);

  const updated = { ...quotation, status };
  return withSales(
    state,
    { quotations: sales.quotations.map((q) => (q.id === quotationId ? updated : q)) },
    audit('QUOTATION', quotationId, `QUOTATION_${status}`, actor, 'Sales', status, quotation.status)
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ORDER ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export function convertQuotationToOrder(
  state: ERPState,
  quotationId: string,
  actor: ActionActor
): [ERPState, string] {
  const sales = normalizeSales(state.sales);
  const quotation = sales.quotations.find((q) => q.id === quotationId);
  if (!quotation) throw new Error(`Quotation ${quotationId} not found`);

  // Idempotency: if order already exists for this quotation, return it
  const existing = sales.orders.find((o) => o.quotationId === quotationId);
  if (existing) return [state, existing.id];

  assertQuotationCanConvert(quotation);

  let nextState = state;
  let orderId = quotation.id.startsWith('QTN-')
    ? quotation.id.replace(/^QTN-/, 'ORD-')
    : '';
  
  if (!orderId) {
    [orderId, nextState] = generateEntityIdPure(state, 'order');
  }

  const productsSummary = (quotation.items || []).map((i: any) => `${i.productName || i.name || 'Item'} (${i.quantity || 1} Qty)`).join(', ');
  const totalQty = (quotation.items || []).reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

  const newOrder: SalesOrder = {
    id: orderId,
    orderNo: orderId,
    leadId: quotation.leadId,
    quotationId: quotation.id,
    sampleId: quotation.sampleId,
    customerName: quotation.customerName,
    billingAddress: quotation.billingAddress,
    deliveryAddress: quotation.deliveryAddress,
    contactPerson: quotation.contactPerson,
    salesperson: quotation.salesperson,
    items: quotation.items,
    products: productsSummary || (quotation as any).products || 'Items',
    quantity: totalQty,
    paymentMilestones: quotation.paymentMilestones,
    transportationCost: Number(
      (quotation as any).transportationCost ?? quotation.expectedTransportationCost ?? 0
    ),
    grandTotal: quotation.grandTotal,
    totalAmount: quotation.grandTotal,
    commercialStatus: 'ORDER_CONFIRMED',
    planningStatus: 'NOT_SENT',
    productionStatus: 'NOT_STARTED',
    qcStatus: 'NOT_READY',
    dispatchStatus: 'NOT_READY',
    paymentStatus: 'NOT_DUE',
    replacementStatus: 'NONE',
    returnStatus: 'NONE',
    createdAt: new Date().toISOString(),
  };

  const updatedQuotation: SalesQuotation = { ...quotation, status: 'CONVERTED_TO_ORDER' };

  return [
    withSales(
      nextState,
      {
        orders: [...sales.orders, newOrder],
        quotations: sales.quotations.map((q) => (q.id === quotationId ? updatedQuotation : q)),
      },
      audit('ORDER', orderId, 'CONVERT_QUOTATION_TO_ORDER', actor, 'Sales', 'ORDER_CONFIRMED')
    ),
    orderId,
  ];
}

export function sendOrderToPlantHead(
  state: ERPState,
  orderId: string,
  payload: SendToPlantHeadPayload = {},
  actor: ActionActor = { id: 'Sales', name: 'Sales User' }
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId || o.orderNo === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  if (
    order.planningStatus === 'PENDING_ACCEPTANCE' ||
    order.planningStatus === 'PLANT_HEAD_ACCEPTED' ||
    order.planningStatus === 'PRODUCTION_PLANNED'
  ) {
    return state;
  }

  const updated: SalesOrder = {
    ...order,
    commercialStatus: 'SENT_TO_PLANT_HEAD',
    planningStatus: 'PENDING_ACCEPTANCE',
    workflowStatus: 'SENT_TO_PLANT_HEAD',
    plantHeadStatus: 'PENDING',
    sentToPlantHead: true,
    sentToPlantHeadAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === order.id ? updated : o)) },
    audit('ORDER', order.id, 'SEND_TO_PLANT_HEAD', actor, 'Sales', 'SENT_TO_PLANT_HEAD', order.commercialStatus, payload.remarks)
  );
}

export function acceptOrderByPlantHead(
  state: ERPState,
  orderId: string,
  payload: AcceptByPlantHeadPayload = {},
  actor: ActionActor = { id: 'Plant Head', name: 'Plant Head' }
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId || o.orderNo === orderId || (o as any).order_number === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.planningStatus !== 'PENDING_ACCEPTANCE' && order.planningStatus !== 'PLANT_HEAD_ACCEPTED') {
    throw new SalesTransitionError(
      `Order ${orderId} cannot be accepted; planningStatus is ${order.planningStatus}`
    );
  }

  // Idempotency
  if (order.planningStatus === 'PLANT_HEAD_ACCEPTED') return state;

  const updated: SalesOrder = {
    ...order,
    planningStatus: 'PLANT_HEAD_ACCEPTED',
    workflowStatus: 'PLANT_HEAD_ACCEPTED',
    plantHeadStatus: 'ACCEPTED',
    acceptedByPlantHeadAt: new Date().toISOString(),
  };

  return withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === order.id ? updated : o)) },
    audit('ORDER', order.id, 'PLANT_HEAD_ACCEPTED', actor, 'Plant Head', 'PLANT_HEAD_ACCEPTED', order.planningStatus, payload?.remarks)
  );
}

export function rejectOrderByPlantHead(
  state: ERPState,
  orderId: string,
  payload: RejectByPlantHeadPayload = {},
  actor: ActionActor = { id: 'Plant Head', name: 'Plant Head' }
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId || o.orderNo === orderId || (o as any).order_number === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.planningStatus !== 'PENDING_ACCEPTANCE') {
    throw new SalesTransitionError(
      `Order ${orderId} cannot be rejected; planningStatus is ${order.planningStatus}`
    );
  }

  const updated: SalesOrder = {
    ...order,
    planningStatus: 'NOT_SENT',
    commercialStatus: 'ORDER_CONFIRMED',
  };

  return withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === order.id ? updated : o)) },
    audit('ORDER', order.id, 'PLANT_HEAD_REJECTED', actor, 'Plant Head', 'NOT_SENT', order.planningStatus, payload.remarks)
  );
}

export function planOrder(
  state: ERPState,
  orderId: string,
  payload: PlanOrderPayload,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId || o.orderNo === orderId || (o as any).order_number === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.planningStatus !== 'PLANT_HEAD_ACCEPTED' && order.planningStatus !== 'PENDING_ACCEPTANCE' && order.commercialStatus !== 'SENT_TO_PLANT_HEAD') {
    throw new SalesTransitionError(
      `Order ${orderId} must be accepted before planning; planningStatus is ${order.planningStatus}`
    );
  }

  // Idempotency
  if (order.planningStatus === 'PRODUCTION_PLANNED' && order.productionStatus === 'NOT_STARTED') return state;

  const targetDateVal = payload.targetDate || payload.targetProductionDate || order.productionTargetDate || (order as any).targetDate;

  const updated: SalesOrder = {
    ...order,
    planningStatus: 'PRODUCTION_PLANNED',
    productionStatus: 'NOT_STARTED',
    productionTargetDate: targetDateVal,
    targetDate: targetDateVal,
    priority: payload.priority || order.priority || 'MEDIUM',
    productionLine: payload.productionLine || (order as any).productionLine,
  };

  return withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === order.id ? updated : o)) },
    audit('ORDER', order.id, 'PRODUCTION_PLANNED', actor, 'Plant Head', 'PRODUCTION_PLANNED', order.planningStatus, payload.remarks)
  );
}

export function activateWorkOrder(
  state: ERPState,
  orderId: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.planningStatus !== 'PRODUCTION_PLANNED') {
    throw new SalesTransitionError(
      `Order ${orderId} is not production planned; planningStatus is ${order.planningStatus}`
    );
  }

  const production = state.production || { workOrders: [], qcRecords: [], finishedGoods: [] };
  const existing = production.workOrders.find((wo: any) => wo.orderId === orderId);
  if (existing) return state;

  const now = new Date().toISOString();
  const workOrderItems = (Array.isArray(order.items) ? order.items : []).map((item: any, index: number) => ({
    orderLineId: item.orderLineId || item.id || `${orderId}-LINE-${index + 1}`,
    productId: item.productId || item.id || `PRODUCT-${index + 1}`,
    productName: item.productName || item.name || 'Product',
    specification: item.specification || item.productDetails || item.description || '',
    targetQuantity: Number(item.targetQuantity ?? item.quantity ?? item.qty ?? 0),
    unit: item.unit || 'Pcs',
  }));
  if (workOrderItems.length === 0) {
    throw new Error(`Sales order ${orderId} has no production items`);
  }

  const updated: SalesOrder = { ...order, productionStatus: 'WORK_ORDER_CREATED', updatedAt: now } as SalesOrder;
  
  const [workOrderId, nextState] = generateEntityIdPure(state, 'workOrder');
  
  const newWorkOrder = {
    id: workOrderId,
    orderId: order.id,
    customerName: order.customerName,
    items: workOrderItems,
    targetQuantity: workOrderItems.reduce(
      (sum: number, item: any) => sum + Number(item.targetQuantity || 0),
      0
    ),
    unit: workOrderItems.length === 1 ? workOrderItems[0].unit : 'Mixed',
    targetDate: (order as any).targetDate || order.productionTargetDate,
    priority: (order as any).priority || 'MEDIUM',
    productionLine: (order as any).productionLine,
    status: 'WORK_ORDER_CREATED',
    createdAt: now,
    updatedAt: now,
  };

  const newSalesState = withSales(
    nextState,
    { orders: sales.orders.map((o) => (o.id === orderId ? updated : o)) },
    audit('ORDER', orderId, 'WORK_ORDER_ACTIVATED', actor, 'Production', 'WORK_ORDER_CREATED', order.productionStatus)
  );

  return {
    ...newSalesState,
    production: {
      ...production,
      workOrders: [...production.workOrders, newWorkOrder],
    },
  };
}

export function startProduction(
  state: ERPState,
  workOrderId: string,
  actor: ActionActor
): ERPState {
  const production = state.production || { workOrders: [], qcRecords: [], finishedGoods: [] };
  const workOrder = production.workOrders.find((wo: any) => wo.id === workOrderId);
  if (!workOrder) throw new Error(`Work order ${workOrderId} not found`);
  if (workOrder.status === 'PRODUCTION_STARTED') return state;
  if (workOrder.status !== 'WORK_ORDER_CREATED') {
    throw new SalesTransitionError(`Work order ${workOrderId} cannot be started from ${workOrder.status}`);
  }
  const sales = normalizeSales(state.sales);
  const workOrderSuffix = String(workOrder.id || '').replace(/^WO-/, '');
  const linkedOrder = sales.orders.find((order: any) =>
    order.id === workOrder.orderId ||
    order.id === workOrder.orderNo ||
    String(order.id || '').replace(/^(ORD|SO)-/, '') === workOrderSuffix
  );
  if (!linkedOrder) {
    throw new Error(
      workOrder.orderId
        ? `Linked Sales order ${workOrder.orderId} not found`
        : `Work order ${workOrderId} has no resolvable linked orderId`
    );
  }
  const sourceItems = Array.isArray(workOrder.items) && workOrder.items.length
    ? workOrder.items
    : Array.isArray(linkedOrder.items)
      ? linkedOrder.items
      : [];
  const repairedItems = sourceItems.map((item: any, index: number) => ({
    ...item,
    orderLineId: item.orderLineId || item.id || `${linkedOrder.id}-LINE-${index + 1}`,
    productId: item.productId || item.id || `PRODUCT-${index + 1}`,
    productName: item.productName || item.name || 'Product',
    specification: item.specification || item.productDetails || item.description || '',
    targetQuantity: Number(item.targetQuantity ?? item.quantity ?? item.qty ?? 0),
    unit: item.unit || 'Pcs',
  }));
  const now = new Date().toISOString();
  return withSales({
    ...state,
    production: {
      ...production,
      workOrders: production.workOrders.map((wo: any) =>
        wo.id === workOrderId
          ? {
              ...wo,
              orderId: linkedOrder.id,
              customerName: wo.customerName || linkedOrder.customerName,
              items: repairedItems,
              targetQuantity: Number(wo.targetQuantity) ||
                repairedItems.reduce((sum: number, item: any) => sum + Number(item.targetQuantity || 0), 0),
              unit: wo.unit || (repairedItems.length === 1 ? repairedItems[0].unit : 'Mixed'),
              status: 'PRODUCTION_STARTED',
              startedAt: now,
              updatedAt: now,
            }
          : wo
      ),
    },
  }, {
    orders: sales.orders.map((order) =>
      order.id === linkedOrder.id
        ? { ...order, productionStatus: 'PRODUCTION_STARTED' as any, updatedAt: now }
        : order
    ),
  }, audit('ORDER', linkedOrder.id, 'PRODUCTION_STARTED', actor, 'Production', 'PRODUCTION_STARTED'));
}

export function completeProduction(
  state: ERPState,
  workOrderId: string,
  payload: {
    producedItems?: any[];
    producedQty?: number;
    batchId?: string;
    batchNo?: string;
    remarks?: string;
  } | ActionActor = {},
  actor: ActionActor = { id: 'Production', name: 'Production' }
): ERPState {
  if ('id' in payload && 'name' in payload) {
    actor = payload as ActionActor;
    payload = {};
  }
  const production = state.production || { workOrders: [], qcRecords: [], finishedGoods: [] };
  const workOrder = production.workOrders.find((wo: any) =>
    wo.id === workOrderId || wo.orderId === workOrderId
  );
  if (!workOrder) throw new Error(`Work order ${workOrderId} not found`);
  const orderId = workOrder.orderId;
  const producedItems = (payload as any).producedItems || [];
  const producedQty = Number(
    (payload as any).producedQty ??
    producedItems.reduce(
      (sum: number, item: any) => sum + Number(item.producedQuantity ?? item.quantity ?? 0),
      0
    )
  );
  const batchNo = (payload as any).batchNo || (payload as any).batchId || workOrder.batchNo;
  if (workOrder.status === 'PRODUCTION_COMPLETED') return state;
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  const updatedOrder: SalesOrder = {
    ...order,
    productionStatus: 'PRODUCTION_COMPLETED' as any,
    qcStatus: 'QC_PENDING' as any,
  };
  const next = withSales({
    ...state,
    production: {
      ...production,
      workOrders: production.workOrders.map((wo: any) =>
        wo.id === workOrder.id
          ? {
              ...wo,
              status: 'PRODUCTION_COMPLETED',
              producedItems,
              producedQty,
              batchNo,
              batchId: batchNo,
              remarks: (payload as any).remarks || wo.remarks,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : wo
      ),
    },
  }, {
    orders: sales.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
  }, audit('ORDER', orderId, 'PRODUCTION_COMPLETED', actor, 'Production', 'PRODUCTION_COMPLETED', order.productionStatus));
  return next;
}

/*
 * Kept below only as a source-history marker; production writes are handled by
 * the canonical work-order implementation above.
 */
function legacyCompleteProductionRemoved(
  state: ERPState,
  orderId: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  if (order.productionStatus === 'COMPLETED') return state;

  const updated: SalesOrder = {
    ...order,
    productionStatus: 'COMPLETED',
    qcStatus: 'PENDING',
  };
  return withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === orderId ? updated : o)) },
    audit('ORDER', orderId, 'PRODUCTION_COMPLETED', actor, 'Production', 'COMPLETED', order.productionStatus)
  );
}

export function approveQC(
  state: ERPState,
  workOrderId: string,
  payload: { id?: string; batchId?: string; batchNo?: string; items?: any[]; remarks?: string; reworkQty?: number } = {},
  actor: ActionActor
): ERPState {
  const production = state.production || { workOrders: [], qcRecords: [], finishedGoods: [] };
  const workOrder = production.workOrders.find((wo: any) =>
    wo.id === workOrderId || wo.orderId === workOrderId
  );
  if (!workOrder) throw new Error(`Work order ${workOrderId} not found`);
  const orderId = workOrder.orderId;
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const existingQC = production.qcRecords.find((record: any) =>
    record.workOrderId === workOrder.id && normalizeStatus(record.status) === 'QC_APPROVED'
  );
  if (existingQC) return state;

  const now = new Date().toISOString();
  const producedByLine = new Map(
    (workOrder.producedItems || []).map((item: any) => [item.orderLineId, Number(item.producedQuantity ?? item.quantity ?? 0)])
  );
  const qcItems = (order.items || []).map((item: any) => {
    const input = payload.items?.find((entry: any) =>
      entry.orderLineId === item.id || entry.productId === item.productId || entry.id === item.id
    ) || {};
    const producedQuantity = Number(input.producedQuantity ?? producedByLine.get(item.id) ?? item.quantity ?? 0);
    const approvedQuantity = Number(input.approvedQuantity ?? input.acceptedQty ?? producedQuantity);
    const rejectedQuantity = Number(input.rejectedQuantity ?? input.rejectedQty ?? 0);
    const reworkQuantity = Number(input.reworkQuantity ?? input.reworkQty ?? 0);
    if (approvedQuantity < 0 || rejectedQuantity < 0 || reworkQuantity < 0 ||
      approvedQuantity + rejectedQuantity + reworkQuantity > producedQuantity) {
      throw new SalesTransitionError(
        `QC quantities for ${item.id} cannot exceed produced quantity (${producedQuantity}).`
      );
    }
    return {
      orderLineId: item.id,
      productId: item.productId,
      productName: item.productName,
      producedQuantity,
      approvedQuantity,
      rejectedQuantity,
      reworkQuantity,
      unit: item.unit,
    };
  });
  const itemsWithQC = order.items.map((item: any) => {
    const qc = qcItems.find((record: any) => record.orderLineId === item.id);
    return { ...item, approvedQuantity: qc?.approvedQuantity ?? 0 };
  });
  const updated: SalesOrder = {
    ...order,
    workflowStatus: 'QC_APPROVED',
    qcStatus: 'QC_APPROVED',
    qcApprovedQty: Number((order as any).qcApprovedQty ?? 0) +
      qcItems.reduce((sum: number, item: any) => sum + item.approvedQuantity, 0),
    items: itemsWithQC,
  };
  const qcRecordId = payload.id || workOrder.id.replace(/^WO-/, 'QC-');
  const finishedGoodsId = order.id.replace(/^ORD-/, 'FG-');
  const batchId = payload.batchId || payload.batchNo || workOrder.batchId || workOrder.batchNo || order.id.replace(/^ORD-/, 'BATCH-');
  const finishedGoodsItems = order.items.map((item: any) => {
    const qc = qcItems.find((record: any) => record.orderLineId === item.id);
    return {
      orderLineId: item.id,
      productId: item.productId,
      productName: item.productName,
      producedQuantity: qc?.producedQuantity ?? 0,
      qcApprovedQuantity: qc?.approvedQuantity ?? 0,
      qcRejectedQuantity: qc?.rejectedQuantity ?? 0,
      reworkQuantity: qc?.reworkQuantity ?? 0,
      reservedQuantity: 0,
      dispatchedQuantity: 0,
      unit: item.unit,
    };
  });
  const approvedTotal = finishedGoodsItems.reduce((sum: number, item: any) => sum + item.qcApprovedQuantity, 0);
  const existingFinishedIndex = production.finishedGoods.findIndex((record: any) =>
    record.workOrderId === workOrder.id && String(record.batchId ?? record.batchNo) === String(batchId)
  );
  const finishedRecord = {
    id: finishedGoodsId,
    finishedGoodsId,
    batchId,
    batchNo: batchId,
    orderId,
    orderNo: order.id,
    workOrderId: workOrder.id,
    workOrderNo: workOrder.id,
    customerName: order.customerName,
    productName: finishedGoodsItems.map((item: any) => item.productName).join(', '),
    producedQty: finishedGoodsItems.reduce((sum: number, item: any) => sum + item.producedQuantity, 0),
    qcApprovedQty: approvedTotal,
    availableQty: approvedTotal,
    reservedQty: 0,
    dispatchedQty: 0,
    uom: finishedGoodsItems[0]?.unit,
    items: finishedGoodsItems,
    status: 'AVAILABLE_FOR_DISPATCH',
    qcInspectionId: qcRecordId,
    qcApprovedAt: now,
    createdAt: now,
  };
  const nextFinishedGoods = [...production.finishedGoods];
  if (existingFinishedIndex >= 0) nextFinishedGoods[existingFinishedIndex] = {
    ...nextFinishedGoods[existingFinishedIndex],
    ...finishedRecord,
  };
  else nextFinishedGoods.push(finishedRecord);
  return withSales(
    {
      ...state,
      production: {
        ...production,
        qcRecords: [...production.qcRecords, {
          id: qcRecordId,
          workOrderId: workOrder.id,
          orderId,
          items: qcItems,
          status: 'QC_APPROVED',
          approvedQty: approvedTotal,
          rejectedQty: qcItems.reduce((sum: number, item: any) => sum + item.rejectedQuantity, 0),
          reworkQty: qcItems.reduce((sum: number, item: any) => sum + item.reworkQuantity, 0),
          remarks: payload.remarks,
          approvedAt: now,
          createdAt: now,
        }],
        workOrders: production.workOrders.map((record: any) => record.id === workOrder.id ? {
          ...record,
          status: 'QC_APPROVED',
          qcStatus: 'APPROVED',
          qcApprovedQty: approvedTotal,
          qcApprovedAt: now,
          batchId,
          batchNo: batchId,
        } : record),
        finishedGoods: nextFinishedGoods,
      },
    },
    { orders: sales.orders.map((o) => (o.id === orderId ? updated : o)) },
    audit('ORDER', orderId, 'QC_APPROVED', actor, 'QC', 'QC_APPROVED', order.qcStatus, payload.remarks)
  );
}

export function createDispatch(
  state: ERPState,
  orderId: string,
  dispatchData: any,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const itemsWithDispatch = (order.items || []).map((item) => {
    const itemDisp = dispatchData.items?.find((p: any) => p.productId === item.productId || p.id === item.id);
    const addedQty = itemDisp ? Number(itemDisp.quantity || itemDisp.dispatchedQuantity || 0) : Number(item.approvedQuantity || item.quantity || 0);
    return {
      ...item,
      dispatchedQuantity: (item.dispatchedQuantity || 0) + addedQty
    };
  });

  const updated: SalesOrder = {
    ...order,
    dispatchStatus: 'DISPATCH_CREATED',
    items: itemsWithDispatch,
  };
  
  const existingDispatches = state.dispatches || [];
  const newDispatch = {
    id: `DSP-${Date.now()}`,
    orderId,
    ...dispatchData,
    status: 'DISPATCH_CREATED',
  };

  const newSalesState = withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === orderId ? updated : o)) },
    audit('ORDER', orderId, 'DISPATCH_CREATED', actor, 'Dispatch', 'DISPATCH_CREATED', order.dispatchStatus)
  );

  return {
    ...newSalesState,
    dispatches: [...existingDispatches, newDispatch],
  };
}

export function startDispatchTransit(
  state: ERPState,
  orderId: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  if (order.dispatchStatus === 'IN_TRANSIT') return state;

  const updated: SalesOrder = { ...order, dispatchStatus: 'IN_TRANSIT' };
  
  const dispatches = state.dispatches || [];
  const updatedDispatches = dispatches.map(d => d.orderId === orderId && d.status !== 'DELIVERED' ? { ...d, status: 'IN_TRANSIT' } : d);

  const newSalesState = withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === orderId ? updated : o)) },
    audit('ORDER', orderId, 'IN_TRANSIT', actor, 'Dispatch', 'IN_TRANSIT', order.dispatchStatus)
  );
  
  return {
    ...newSalesState,
    dispatches: updatedDispatches,
  };
}

export function confirmDelivery(
  state: ERPState,
  orderIdOrConsignmentId: string,
  deliveryData: any = {},
  actor: ActionActor = { id: 'Dispatch', name: 'Dispatch' }
): ERPState {
  const sales = normalizeSales(state.sales);
  const dispatches = state.dispatches || [];
  
  const consignment = dispatches.find((d: any) => d.id === orderIdOrConsignmentId || d.orderId === orderIdOrConsignmentId);
  const targetOrderId = consignment ? consignment.orderId : orderIdOrConsignmentId;
  const order = sales.orders.find((o) => o.id === targetOrderId || o.orderNo === targetOrderId);

  if (!order) throw new Error(`Order or consignment ${orderIdOrConsignmentId} not found`);

  const verifiedTotal = (sales.paymentConfirmations || [])
    .filter((c: any) => (c.orderId === order.id || c.orderId === order.orderNo) && (c.status === 'FINANCE_VERIFIED' || c.status === 'VERIFIED'))
    .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

  const isFullyPaid = order.paymentStatus === 'FULLY_PAID' || (order.grandTotal > 0 && verifiedTotal >= Number(order.grandTotal));

  const updated: SalesOrder = { 
    ...order, 
    dispatchStatus: 'DELIVERED',
    deliveredAt: deliveryData?.deliveredAt || new Date().toISOString(),
    commercialStatus: isFullyPaid ? 'ORDER_CLOSED' : 'ORDER_ACTIVE',
  };
  
  const updatedDispatches = dispatches.map((d: any) => 
    (d.id === orderIdOrConsignmentId || d.orderId === targetOrderId || d.orderId === order.id)
      ? { ...d, status: 'DELIVERED', deliveryDetails: deliveryData, deliveredAt: new Date().toISOString() }
      : d
  );

  const newSalesState = withSales(
    state,
    { orders: sales.orders.map((o) => (o.id === order.id ? updated : o)) },
    audit('ORDER', order.id, 'DELIVERY_CONFIRMED', actor, 'Dispatch', 'DELIVERED', order.dispatchStatus)
  );

  return {
    ...newSalesState,
    dispatches: updatedDispatches,
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  PAYMENT ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export function recordSalesPayment(
  state: ERPState,
  orderId: string,
  payload: RecordPaymentPayload,
  actor: ActionActor
): [ERPState, string] {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  assertSalesPaymentValid(order, sales.paymentConfirmations, payload.amount);

  const confirmationId = orderId.startsWith('ORD-')
    ? orderId.replace(/^ORD-/, 'PAY-')
    : uid('PAY');

  const newConfirmation: PaymentConfirmation = {
    id: confirmationId,
    orderId,
    amount: payload.amount,
    paymentDate: payload.paymentDate,
    method: payload.method,
    transactionReference: payload.transactionReference,
    proofDocument: payload.proofDocument,
    status: 'FINANCE_VERIFICATION_PENDING',
    createdAt: new Date().toISOString(),
  };

  const updatedOrder: SalesOrder = { ...order, paymentStatus: 'FINANCE_VERIFICATION_PENDING' };

  return [
    withSales(
      state,
      {
        paymentConfirmations: [...sales.paymentConfirmations, newConfirmation],
        orders: sales.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
      },
      audit('PAYMENT', confirmationId, 'PAYMENT_RECORDED', actor, 'Sales', 'SALES_PAYMENT_RECORDED', undefined, undefined, orderId)
    ),
    confirmationId,
  ];
}

export function verifyFinancePayment(
  state: ERPState,
  confirmationId: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const confirmation = sales.paymentConfirmations.find((p) => p.id === confirmationId);
  if (!confirmation) throw new Error(`Payment confirmation ${confirmationId} not found`);
  if (confirmation.status === 'FINANCE_VERIFIED') return state;

  const order = sales.orders.find((o) => o.id === confirmation.orderId);
  if (!order) throw new Error(`Order ${confirmation.orderId} not found`);

  assertPaymentCanBeVerified(confirmation, order, sales.paymentConfirmations);

  const updatedConfirmation: PaymentConfirmation = {
    ...confirmation,
    status: 'FINANCE_VERIFIED',
    verifiedBy: actor.name,
    verifiedAt: new Date().toISOString(),
  };

  let matchingConfirmationHandled = false;
  const newConfirmations = sales.paymentConfirmations.reduce<PaymentConfirmation[]>((records, payment) => {
    if (payment.id !== confirmationId) {
      records.push(payment);
      return records;
    }
    // Collapse legacy duplicate submissions carrying the same deterministic ID,
    // otherwise one approval would count the same received amount multiple times.
    if (!matchingConfirmationHandled) {
      records.push(updatedConfirmation);
      matchingConfirmationHandled = true;
    }
    return records;
  }, []);

  // Calculate totals in paise to avoid floating-point errors
  let verifiedTotalInPaise = 0;
  newConfirmations.forEach((c) => {
    if (c.orderId === order.id && c.status === 'FINANCE_VERIFIED') {
      verifiedTotalInPaise += Math.round(c.amount * 100);
    }
  });
  const grandTotalInPaise = Math.round(order.grandTotal * 100);

  const paymentStatus: SalesOrder['paymentStatus'] =
    verifiedTotalInPaise >= grandTotalInPaise ? 'FULLY_PAID' : 'PARTIALLY_PAID';

  let commercialStatus = order.commercialStatus;
  if (order.dispatchStatus === 'DELIVERED' && verifiedTotalInPaise >= grandTotalInPaise) {
    commercialStatus = 'ORDER_CLOSED';
  }

  const updatedOrder: SalesOrder = { ...order, paymentStatus, commercialStatus };

  const extraAudit: AuditEvent[] =
    commercialStatus === 'ORDER_CLOSED' && order.commercialStatus !== 'ORDER_CLOSED'
      ? [audit('ORDER', order.id, 'ORDER_CLOSED', { id: 'SYSTEM', name: 'System' }, 'System', 'ORDER_CLOSED', order.commercialStatus)]
      : [];

  return {
    ...withSales(
      state,
      {
        paymentConfirmations: newConfirmations,
        orders: sales.orders.map((o) => (o.id === order.id ? updatedOrder : o)),
      },
      audit('PAYMENT', confirmationId, 'PAYMENT_VERIFIED', actor, 'Finance', 'FINANCE_VERIFIED', confirmation.status)
    ),
    auditEvents: [
      audit('PAYMENT', confirmationId, 'PAYMENT_VERIFIED', actor, 'Finance', 'FINANCE_VERIFIED', confirmation.status),
      ...extraAudit,
      ...(state.auditEvents || []),
    ],
  };
}

export function rejectFinancePayment(
  state: ERPState,
  confirmationId: string,
  remarks: string,
  actor: ActionActor = { id: 'Finance', name: 'Finance Team' }
): ERPState {
  const sales = normalizeSales(state.sales);
  const confirmation = sales.paymentConfirmations.find((p) => p.id === confirmationId);
  if (!confirmation) throw new Error(`Payment confirmation ${confirmationId} not found`);

  const updatedConfirmation: PaymentConfirmation = {
    ...confirmation,
    status: 'FINANCE_REJECTED',
    financeRemarks: remarks,
    verifiedBy: actor.name,
    verifiedAt: new Date().toISOString(),
  };

  const newConfirmations = sales.paymentConfirmations.map((p) =>
    p.id === confirmationId ? updatedConfirmation : p
  );

  const order = sales.orders.find((o) => o.id === confirmation.orderId);
  let updatedOrders = sales.orders;

  if (order) {
    const paymentStatus = deriveOrderPaymentStatus(order, newConfirmations);
    const updatedOrder: SalesOrder = { ...order, paymentStatus };
    updatedOrders = sales.orders.map((o) => (o.id === order.id ? updatedOrder : o));
  }

  return withSales(
    state,
    {
      paymentConfirmations: newConfirmations,
      orders: updatedOrders,
    },
    audit('PAYMENT', confirmationId, 'PAYMENT_REJECTED', actor, 'Finance', 'FINANCE_REJECTED', confirmation.status, remarks, confirmation.orderId)
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  REPLACEMENT ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export function requestReplacement(
  state: ERPState,
  payload: RequestAfterSalesPayload,
  actor: ActionActor
): [ERPState, string] {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === payload.orderId);
  if (!order) throw new Error(`Order ${payload.orderId} not found`);
  if (order.dispatchStatus !== 'DELIVERED') {
    throw new SalesTransitionError('Replacement can only be requested after delivery.');
  }

  let nextState = state;
  let requestId = (payload as any).id;
  if (!requestId) {
    [requestId, nextState] = generateEntityIdPure(state, 'replacementRequest');
  }
  const existing = sales.replacementRequests.find((request) => request.id === requestId);
  if (existing) return [state, existing.id];
  const hasActiveReplacement = sales.replacementRequests.some(
    (request) => request.orderId === order.id &&
      ['REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED', 'REPLACEMENT_DISPATCHED', 'REPLACEMENT_IN_TRANSIT']
        .includes(request.status)
  );
  if (hasActiveReplacement) {
    throw new SalesTransitionError('An active replacement request already exists for this order.');
  }
  if (!payload.items?.length) throw new SalesTransitionError('At least one replacement item is required.');
  for (const requested of payload.items) {
    const line = order.items.find((item: any) =>
      item.id === requested.orderLineId ||
      (item as any).orderLineId === requested.orderLineId ||
      item.productId === requested.productId
    );
    if (!line) throw new SalesTransitionError(`Order line ${requested.orderLineId} not found.`);
    if (!(Number(requested.requestedQuantity) > 0)) {
      throw new SalesTransitionError('Replacement quantity must be greater than zero.');
    }
    const deliveredQuantity = Number(
      (line as any).deliveredQuantity ??
      (line as any).quantity_dispatched ??
      (line as any).delivered_qty ??
      line.quantity ??
      0
    );
    assertValidAfterSalesQuantity(
      requested.orderLineId,
      Number(requested.requestedQuantity),
      deliveredQuantity,
      sales.replacementRequests.filter((request) => request.orderId === order.id),
      sales.returnRequests.filter((request) => request.orderId === order.id)
    );
  }

  const newRequest: ReplacementRequest = {
    id: requestId,
    orderId: payload.orderId,
    items: payload.items,
    status: 'REPLACEMENT_REQUESTED',
    pickupRequired: payload.pickupRequired ?? false,
    replacementDeliveryAddress:
      payload.replacementDeliveryAddress ?? (payload as any).replacementAddress,
    preferredReplacementDate:
      payload.preferredReplacementDate ?? payload.preferredDate,
    photos: payload.photos,
    documents: payload.documents,
    remarks: payload.remarks,
    createdAt: new Date().toISOString(),
  };

  const updatedOrder: SalesOrder = { ...order, replacementStatus: 'REQUESTED' };

  return [
    withSales(
      state,
      {
        replacementRequests: [...sales.replacementRequests, newRequest],
        orders: sales.orders.map((o) => (o.id === payload.orderId ? updatedOrder : o)),
      },
      audit('REPLACEMENT', requestId, 'REPLACEMENT_REQUESTED', actor, 'Sales', 'REPLACEMENT_REQUESTED', undefined, payload.remarks, payload.orderId)
    ),
    requestId,
  ];
}

export function approveReplacement(
  state: ERPState,
  requestId: string,
  approval: string | {
    approvedQuantity?: number;
    approvedItems?: Array<{ orderLineId: string; approvedQuantity: number }>;
    remarks?: string;
    [key: string]: any;
  },
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const request = sales.replacementRequests.find((r) => r.id === requestId);
  if (!request) throw new Error(`Replacement request ${requestId} not found`);

  if (request.status !== 'REPLACEMENT_REQUESTED') {
    throw new SalesTransitionError(`Replacement ${requestId} cannot be approved from status ${request.status}`);
  }

  const details = typeof approval === 'string' ? { remarks: approval } : (approval || {});
  const approvedByLine = new Map(
    (details.approvedItems || []).map((item: any) => [item.orderLineId, Number(item.approvedQuantity)])
  );
  for (const item of request.items) {
    const approved = approvedByLine.get(item.orderLineId) ?? details.approvedQuantity ?? item.requestedQuantity;
    if (!(Number(approved) > 0) || Number(approved) > Number(item.requestedQuantity)) {
      throw new SalesTransitionError(
        `Approved replacement quantity for ${item.orderLineId} must be between 1 and ${item.requestedQuantity}.`
      );
    }
  }
  const updated: ReplacementRequest = {
    ...request,
    items: request.items.map((item) => ({
      ...item,
      approvedQuantity:
        approvedByLine.get(item.orderLineId) ??
        details.approvedQuantity ??
        item.requestedQuantity,
    })),
    status: 'REPLACEMENT_APPROVED',
    plantHeadRemarks: details.remarks,
  };

  const order = sales.orders.find((o) => o.id === request.orderId);
  const updatedOrders = order
    ? sales.orders.map((o) =>
        o.id === request.orderId ? { ...o, replacementStatus: 'APPROVED' as const } : o
      )
    : sales.orders;

  return withSales(
    state,
    {
      replacementRequests: sales.replacementRequests.map((r) => (r.id === requestId ? updated : r)),
      orders: updatedOrders,
    },
    audit('REPLACEMENT', requestId, 'REPLACEMENT_APPROVED', actor, 'Plant Head', 'REPLACEMENT_APPROVED', request.status, details.remarks, request.orderId)
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  RETURN ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export function requestReturn(
  state: ERPState,
  payload: RequestAfterSalesPayload,
  actor: ActionActor
): [ERPState, string] {
  const sales = normalizeSales(state.sales);
  const order = sales.orders.find((o) => o.id === payload.orderId);
  if (!order) throw new Error(`Order ${payload.orderId} not found`);
  if (order.dispatchStatus !== 'DELIVERED') {
    throw new SalesTransitionError('Return can only be requested after delivery.');
  }

  let nextState = state;
  let requestId = (payload as any).id;
  if (!requestId) {
    [requestId, nextState] = generateEntityIdPure(state, 'returnRequest');
  }
  const existing = sales.returnRequests.find((request) => request.id === requestId);
  if (existing) return [state, existing.id];
  const hasActiveReturn = sales.returnRequests.some(
    (request) => request.orderId === order.id &&
      ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKUP_ASSIGNED', 'RETURN_IN_TRANSIT']
        .includes(request.status)
  );
  if (hasActiveReturn) {
    throw new SalesTransitionError('An active return request already exists for this order.');
  }
  if (!payload.items?.length) throw new SalesTransitionError('At least one return item is required.');
  for (const requested of payload.items) {
    const line = order.items.find((item: any) =>
      item.id === requested.orderLineId ||
      (item as any).orderLineId === requested.orderLineId ||
      item.productId === requested.productId
    );
    if (!line) throw new SalesTransitionError(`Order line ${requested.orderLineId} not found.`);
    if (!(Number(requested.requestedQuantity) > 0)) {
      throw new SalesTransitionError('Return quantity must be greater than zero.');
    }
    const deliveredQuantity = Number(
      (line as any).deliveredQuantity ??
      (line as any).quantity_dispatched ??
      (line as any).delivered_qty ??
      line.quantity ??
      0
    );
    assertValidAfterSalesQuantity(
      requested.orderLineId,
      Number(requested.requestedQuantity),
      deliveredQuantity,
      sales.replacementRequests.filter((request) => request.orderId === order.id),
      sales.returnRequests.filter((request) => request.orderId === order.id)
    );
  }

  const newRequest: ReturnRequest = {
    id: requestId,
    orderId: payload.orderId,
    items: payload.items,
    status: 'RETURN_REQUESTED',
    pickupAddress: payload.pickupAddress,
    contactPerson: payload.contactPerson,
    preferredPickupDate: payload.preferredPickupDate,
    refundExpected: payload.refundExpected ?? false,
    replacementExpected: payload.replacementExpected ?? false,
    photos: payload.photos,
    documents: payload.documents,
    remarks: payload.remarks,
    createdAt: new Date().toISOString(),
  };

  const updatedOrder: SalesOrder = { ...order, returnStatus: 'REQUESTED' };

  return [
    withSales(
      state,
      {
        returnRequests: [...sales.returnRequests, newRequest],
        orders: sales.orders.map((o) => (o.id === payload.orderId ? updatedOrder : o)),
      },
      audit('RETURN', requestId, 'RETURN_REQUESTED', actor, 'Sales', 'RETURN_REQUESTED', undefined, payload.remarks, payload.orderId)
    ),
    requestId,
  ];
}

export function approveReturn(
  state: ERPState,
  requestId: string,
  approval: string | {
    approvedItems?: Array<{ orderLineId: string; approvedQuantity: number }>;
    remarks?: string;
    [key: string]: any;
  },
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const request = sales.returnRequests.find((r) => r.id === requestId);
  if (!request) throw new Error(`Return request ${requestId} not found`);

  if (request.status !== 'RETURN_REQUESTED') {
    throw new SalesTransitionError(`Return ${requestId} cannot be approved from status ${request.status}`);
  }

  const details = typeof approval === 'string' ? { remarks: approval } : (approval || {});
  const approvedByLine = new Map(
    (details.approvedItems || []).map((item: any) => [item.orderLineId, Number(item.approvedQuantity)])
  );
  for (const item of request.items) {
    const approved = approvedByLine.get(item.orderLineId) ?? item.requestedQuantity;
    if (!(Number(approved) > 0) || Number(approved) > Number(item.requestedQuantity)) {
      throw new SalesTransitionError(
        `Approved return quantity for ${item.orderLineId} must be between 1 and ${item.requestedQuantity}.`
      );
    }
  }
  const updated: ReturnRequest = {
    ...request,
    items: request.items.map((item) => ({
      ...item,
      approvedQuantity: approvedByLine.get(item.orderLineId) ?? item.requestedQuantity,
    })),
    status: 'RETURN_APPROVED',
    plantHeadRemarks: details.remarks,
  };

  const order = sales.orders.find((o) => o.id === request.orderId);
  const updatedOrders = order
    ? sales.orders.map((o) =>
        o.id === request.orderId ? { ...o, returnStatus: 'APPROVED' as const } : o
      )
    : sales.orders;

  return withSales(
    state,
    {
      returnRequests: sales.returnRequests.map((r) => (r.id === requestId ? updated : r)),
      orders: updatedOrders,
    },
    audit('RETURN', requestId, 'RETURN_APPROVED', actor, 'Plant Head', 'RETURN_APPROVED', request.status, details.remarks, request.orderId)
  );
}

export function assignReturnPickup(
  state: ERPState,
  returnId: string,
  payload: AssignReturnPickupPayload,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const request = sales.returnRequests.find((r) => r.id === returnId);
  if (!request) throw new Error(`Return request ${returnId} not found`);

  assertReturnCanBeAssigned(request);

  if (request.status === 'RETURN_PICKUP_ASSIGNED') return state;

  const updated: ReturnRequest = {
    ...request,
    ...payload,
    status: 'RETURN_PICKUP_ASSIGNED',
  };

  return withSales(
    state,
    { returnRequests: sales.returnRequests.map((r) => (r.id === returnId ? updated : r)) },
    audit('RETURN', returnId, 'RETURN_PICKUP_ASSIGNED', actor, 'Dispatch', 'RETURN_PICKUP_ASSIGNED', request.status, payload.remarks, request.orderId)
  );
}

export function startReturnTransit(
  state: ERPState,
  returnId: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const request = sales.returnRequests.find((r) => r.id === returnId);
  if (!request) throw new Error(`Return request ${returnId} not found`);

  assertReturnCanStartTransit(request);

  if (request.status === 'RETURN_IN_TRANSIT') return state;

  const updated: ReturnRequest = { ...request, status: 'RETURN_IN_TRANSIT' };

  return withSales(
    state,
    { returnRequests: sales.returnRequests.map((r) => (r.id === returnId ? updated : r)) },
    audit('RETURN', returnId, 'RETURN_IN_TRANSIT', actor, 'Dispatch', 'RETURN_IN_TRANSIT', request.status, undefined, request.orderId)
  );
}

export function confirmReturnReceipt(
  state: ERPState,
  returnId: string,
  payload: ConfirmReturnReceiptPayload,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const request = sales.returnRequests.find((r) => r.id === returnId);
  if (!request) throw new Error(`Return request ${returnId} not found`);

  const receivedQuantity = payload.receivedQuantity ?? (payload.receivedItems || [])
    .reduce((sum, item) => sum + Number(item.receivedQuantity || 0), 0);
  assertReturnCanBeReceived(request, receivedQuantity);

  if (request.status === 'RETURN_RECEIVED') return state;

  const receivedByLine = new Map(
    (payload.receivedItems || []).map((item) => [item.orderLineId, Number(item.receivedQuantity)])
  );
  const updated: ReturnRequest = {
    ...request,
    ...payload,
    receivedAt: payload.receivedAt ?? payload.receivedDate,
    items: request.items.map((item) => ({
      ...item,
      receivedQuantity: receivedByLine.get(item.orderLineId) ??
        (request.items.length === 1 ? receivedQuantity : undefined),
    })) as any,
    status: 'RETURN_RECEIVED',
  };

  const order = sales.orders.find((o) => o.id === request.orderId);
  const updatedOrders = order
    ? sales.orders.map((o) =>
        o.id === request.orderId ? { ...o, returnStatus: 'COMPLETED' as const } : o
      )
    : sales.orders;

  return withSales(
    state,
    {
      returnRequests: sales.returnRequests.map((r) => (r.id === returnId ? updated : r)),
      orders: updatedOrders,
    },
    audit('RETURN', returnId, 'RETURN_RECEIVED', actor, 'Dispatch', 'RETURN_RECEIVED', request.status, payload.remarks, request.orderId)
  );
}

export function rejectReplacement(
  state: ERPState,
  requestId: string,
  remarks: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const req = sales.replacementRequests.find((r) => r.id === requestId);
  if (!req) throw new Error(`Request ${requestId} not found`);

  const updatedReq: ReplacementRequest = { ...req, status: 'REPLACEMENT_REJECTED' };
  return withSales(
    state,
    { replacementRequests: sales.replacementRequests.map((r) => (r.id === requestId ? updatedReq : r)) },
    audit('REPLACEMENT', requestId, 'REJECTED', actor, 'Plant Head', 'REPLACEMENT_REJECTED', req.status, remarks)
  );
}

export function dispatchReplacement(
  state: ERPState,
  requestId: string,
  payload: any,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const req = sales.replacementRequests.find((r) => r.id === requestId);
  if (!req) throw new Error(`Request ${requestId} not found`);

  if (req.status === 'REPLACEMENT_DISPATCHED') return state;
  assertReplacementCanDispatch(req);
  const updatedReq: ReplacementRequest = {
    ...req,
    dispatchId: payload?.id || req.id,
    dispatchDetails: payload,
    status: 'REPLACEMENT_DISPATCHED',
  };
  return withSales(
    state,
    { replacementRequests: sales.replacementRequests.map((r) => (r.id === requestId ? updatedReq : r)) },
    audit('REPLACEMENT', requestId, 'DISPATCHED', actor, 'Dispatch', 'REPLACEMENT_DISPATCHED', req.status)
  );
}

export function startReplacementTransit(
  state: ERPState,
  requestId: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const req = sales.replacementRequests.find(
    (r) => r.id === requestId || r.dispatchId === requestId
  );
  if (!req) throw new Error(`Request ${requestId} not found`);

  if (req.status === 'REPLACEMENT_IN_TRANSIT') return state;
  if (req.status !== 'REPLACEMENT_DISPATCHED') {
    throw new SalesTransitionError(`Replacement ${req.id} cannot start transit from ${req.status}`);
  }
  const updatedReq: ReplacementRequest = { ...req, status: 'REPLACEMENT_IN_TRANSIT' };
  return withSales(
    state,
    { replacementRequests: sales.replacementRequests.map((r) => (r.id === req.id ? updatedReq : r)) },
    audit('REPLACEMENT', req.id, 'IN_TRANSIT', actor, 'Dispatch', 'REPLACEMENT_IN_TRANSIT', req.status, undefined, req.orderId)
  );
}

export function confirmReplacementDelivery(
  state: ERPState,
  requestId: string,
  payload: any,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const req = sales.replacementRequests.find(
    (r) => r.id === requestId || r.dispatchId === requestId
  );
  if (!req) throw new Error(`Request ${requestId} not found`);

  if (req.status === 'REPLACEMENT_DELIVERED') return state;
  if (req.status !== 'REPLACEMENT_IN_TRANSIT') {
    throw new SalesTransitionError(`Replacement ${req.id} cannot be delivered from ${req.status}`);
  }
  const updatedReq: ReplacementRequest = { ...req, ...payload, status: 'REPLACEMENT_DELIVERED' };
  return withSales(
    state,
    { replacementRequests: sales.replacementRequests.map((r) => (r.id === req.id ? updatedReq : r)) },
    audit('REPLACEMENT', req.id, 'DELIVERED', actor, 'Dispatch', 'REPLACEMENT_DELIVERED', req.status, payload?.remarks, req.orderId)
  );
}

export function rejectReturn(
  state: ERPState,
  requestId: string,
  remarks: string,
  actor: ActionActor
): ERPState {
  const sales = normalizeSales(state.sales);
  const req = sales.returnRequests.find((r) => r.id === requestId);
  if (!req) throw new Error(`Request ${requestId} not found`);

  const updatedReq: ReturnRequest = { ...req, status: 'RETURN_REJECTED' };
  return withSales(
    state,
    { returnRequests: sales.returnRequests.map((r) => (r.id === requestId ? updatedReq : r)) },
    audit('RETURN', requestId, 'REJECTED', actor, 'Plant Head', 'RETURN_REJECTED', req.status, remarks)
  );
}
