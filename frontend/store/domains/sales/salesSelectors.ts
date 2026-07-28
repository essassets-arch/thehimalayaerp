/**
 * salesSelectors.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Role-safe, cross-panel selectors derived from state.sales.
 *
 * Convention: all selectors accept the full ERPState (not state.sales),
 * so they can be passed directly to useERPStore(selector).
 *
 * Data masking rules:
 *  - Dispatch views never contain pricing/payment data
 *  - Plant Head views never contain payment data
 *  - Production views never contain payment or commercial data
 *  - Finance views contain required commercial data
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
  QuotationLineItem,
} from './salesTypes';
import { normalizeStatus } from '../shared/workflowUtils';
import {
  calculatePendingAmount,
  getAvailableAfterSalesQuantity,
  getSampleRemainingDays,
} from './salesCalculations';

// ─── Minimal ERPState shape for selectors ────────────────────────────────────
export interface ERPStoreState {
  state: {
    sales: SalesDomainState;
    [key: string]: any;
  };
  [key: string]: any;
}

// Helper to normalize sales safely

// ─── Memoization Helper ──────────────────────────────────────────────────────
function memoize<T>(fn: (store: any) => T): (store: any) => T {
  let lastSalesRef: any = null;
  let lastResult: any = null;
  return (store: any): T => {
    const currentSales = store?.sales || store?.state?.sales;
    if (currentSales && currentSales === lastSalesRef && lastResult !== null) return lastResult as T;
    lastSalesRef = currentSales;
    lastResult = fn(store);
    return lastResult as T;
  };
}

const getSales = (erpStoreState: ERPStoreState): SalesDomainState => {
  const sales = erpStoreState?.sales || erpStoreState?.state?.sales;
  const leadsReadEnabled = process.env.NEXT_PUBLIC_BACKEND_LEADS_READ === 'true';
  const leads = leadsReadEnabled
    ? (erpStoreState?.state?.serverCache?.leads || erpStoreState?.serverCache?.leads || [])
    : (Array.isArray(sales?.leads) ? sales.leads : []);

  return {
    leads,
    samples: Array.isArray(sales?.samples) ? sales.samples : [],
    quotations: Array.isArray(sales?.quotations) ? sales.quotations : [],
    orders: Array.isArray(sales?.orders) ? sales.orders : [],
    paymentConfirmations: Array.isArray(sales?.paymentConfirmations) ? sales.paymentConfirmations : [],
    replacementRequests: Array.isArray(sales?.replacementRequests) ? sales.replacementRequests : [],
    returnRequests: Array.isArray(sales?.returnRequests) ? sales.returnRequests : [],
  };
};

// ════════════════════════════════════════════════════════════════════════════
//  LEAD SELECTORS
// ════════════════════════════════════════════════════════════════════════════

/** All leads for the Sales panel */
const _selectSalesLeads = (store: ERPStoreState): SalesLead[] =>
  getSales(store).leads;

/** Leads that are eligible for a new sample dispatch */
const _selectLeadsForSample = (store: ERPStoreState): SalesLead[] =>
  getSales(store).leads.filter(
    (l) =>
      l.status === 'LEAD_CREATED' ||
      l.status === 'SAMPLE_REQUESTED' ||
      l.status === 'QUOTATION_CREATED'
  );

// ════════════════════════════════════════════════════════════════════════════
//  SAMPLE SELECTORS
// ════════════════════════════════════════════════════════════════════════════

const _selectSalesSamples = (store: ERPStoreState): SalesSample[] =>
  getSales(store).samples;

/** Dispatch-safe view: no pricing data included (samples have none, but we strip redundant lead info) */
const _selectDispatchSamples = (store: ERPStoreState) => {
  const { samples, leads } = getSales(store);
  return samples
    .filter(
      (s) =>
        s.status === 'SAMPLE_DISPATCH_REQUESTED' ||
        s.status === 'SAMPLE_VEHICLE_ASSIGNED' ||
        s.status === 'SAMPLE_DISPATCHED' ||
        s.status === 'SAMPLE_IN_TRANSIT'
    )
    .map((s) => {
      const lead = leads.find((l) => l.id === s.leadId);
      return {
        id: s.id,
        leadId: s.leadId,
        customerName: lead?.customerName || '',
        contactPerson: lead?.contactPerson || '',
        deliveryAddress: lead?.deliveryAddress || '',
        product: s.product,
        quantity: s.quantity,
        specifications: s.specifications,
        status: s.status,
        expectedDeliveryDate: s.expectedDeliveryDate,
        specialDeliveryInstructions: s.specialDeliveryInstructions,
        forwardDispatch: s.forwardDispatch,
        createdAt: s.createdAt,
      };
    });
};

/** Samples enriched with testing countdown for Sales/Admin panels */
const _selectEnrichedSamples = (store: ERPStoreState) =>
  getSales(store).samples.map((s) => ({
    ...s,
    testingRemainingDays: getSampleRemainingDays(s),
  }));

// ════════════════════════════════════════════════════════════════════════════
//  QUOTATION SELECTORS
// ════════════════════════════════════════════════════════════════════════════

const _selectSalesQuotations = (store: ERPStoreState): SalesQuotation[] =>
  getSales(store).quotations;

const _selectPendingQuotations = (store: ERPStoreState): SalesQuotation[] =>
  getSales(store).quotations.filter(
    (q) => q.status === 'QUOTATION_DRAFT' || q.status === 'QUOTATION_SENT'
  );

// ════════════════════════════════════════════════════════════════════════════
//  ORDER SELECTORS
// ════════════════════════════════════════════════════════════════════════════

const _selectSalesOrders = (store: ERPStoreState): SalesOrder[] =>
  getSales(store).orders;

/**
 * Plant Head incoming orders: orders with planningStatus === 'PENDING_ACCEPTANCE'.
 */
const _selectPlantHeadIncomingOrders = (store: ERPStoreState) => {
  const { orders } = getSales(store);
  return orders
    .filter((o: any) =>
      o.sentToPlantHead === true ||
      normalizeStatus(o.workflowStatus) === 'SENT_TO_PLANT_HEAD' ||
      normalizeStatus(o.plantHeadStatus) === 'PENDING' ||
      normalizeStatus(o.status) === 'SENT_TO_PLANT_HEAD' ||
      normalizeStatus(o.planningStatus) === 'PENDING_ACCEPTANCE'
    )
    .filter((o: any) => !['ACCEPTED', 'REJECTED'].includes(normalizeStatus(o.plantHeadStatus)))
    .map(toPlantHeadSafeView);
};

/**
 * Plant Head planning orders: orders with planningStatus === 'PLANT_HEAD_ACCEPTED'.
 */
const _selectPlantHeadPlanningOrders = (store: ERPStoreState) => {
  const { orders } = getSales(store);
  return orders
    .filter((o) => o.planningStatus === 'PLANT_HEAD_ACCEPTED')
    .map(toPlantHeadSafeView);
};

/**
 * Production incoming orders: orders with planningStatus === 'PRODUCTION_PLANNED' && productionStatus === 'NOT_STARTED'.
 */
const _selectProductionIncomingOrders = (store: ERPStoreState) => {
  const { orders } = getSales(store);
  return orders
    .filter(
      (o) =>
        o.planningStatus === 'PRODUCTION_PLANNED' &&
        (o.productionStatus === 'NOT_STARTED' || !o.productionStatus)
    )
    .map(toProductionSafeView);
};

const _selectProductionWorkOrders = (store: ERPStoreState) => {
  const { orders } = getSales(store);
  return orders
    .filter(
      (o) =>
        o.planningStatus === 'PLANT_HEAD_ACCEPTED' ||
        o.planningStatus === 'PRODUCTION_PLANNED' ||
        ['WORK_ORDER_CREATED', 'PRODUCTION_ACCEPTED', 'IN_PRODUCTION', 'PAUSED', 'REWORK', 'PRODUCTION_COMPLETED', 'QC_PENDING'].includes(o.productionStatus)
    )
    .map(toProductionSafeView);
};

/**
 * Dispatch view: orders where QC-approved, finished goods, or completed production ready for dispatch.
 * No pricing/payment data.
 */
const _selectDispatchOrders = (store: ERPStoreState) => {
  const { orders } = getSales(store);
  const eligibleQC = ['APPROVED', 'QC_APPROVED', 'PASSED', 'QC_PASSED', 'PARTIALLY_APPROVED', 'FINISHED_GOODS', 'READY', 'READY_FOR_DISPATCH', 'SENT_TO_DISPATCH'];
  const eligibleProduction = ['PRODUCTION_COMPLETED', 'COMPLETED', 'FINISHED_GOODS', 'QC_APPROVED', 'QC_PASSED'];
  const eligibleDispatch = ['READY_FOR_DISPATCH', 'DISPATCH_CREATED', 'PENDING', 'IN_TRANSIT'];

  return orders
    .filter(
      (o) =>
        (eligibleQC.includes(o.qcStatus) ||
         eligibleProduction.includes(o.productionStatus) ||
         eligibleDispatch.includes(o.dispatchStatus) ||
         (o as any).sentToDispatchAt ||
         (o as any).dispatchStatus === 'SENT_TO_DISPATCH') &&
        o.qcStatus !== 'REWORK_REQUIRED' &&
        o.qcStatus !== 'FAILED' &&
        o.dispatchStatus !== 'DELIVERED' &&
        o.dispatchStatus !== 'CONFIRMED'
    )
    .map(toDispatchSafeView);
};

// ════════════════════════════════════════════════════════════════════════════
//  PAYMENT SELECTORS
// ════════════════════════════════════════════════════════════════════════════

const _selectSalesPaymentConfirmations = (store: ERPStoreState): PaymentConfirmation[] =>
  getSales(store).paymentConfirmations;

/**
 * Finance Sales Confirmations: payments awaiting Finance verification.
 * Includes linked order data for commercial context.
 */
const _selectFinanceSalesConfirmations = (store: ERPStoreState) => {
  const { paymentConfirmations, orders } = getSales(store);
  return paymentConfirmations
    .filter((p) => p.status === 'FINANCE_VERIFICATION_PENDING' || p.status === 'SALES_PAYMENT_RECORDED')
    .map((p) => {
      const order = orders.find((o) => o.id === p.orderId);
      return {
        ...p,
        customerName: order?.customerName || '',
        grandTotal: order?.grandTotal ?? 0,
        salesperson: order?.salesperson || '',
        orderContactPerson: order?.contactPerson || '',
      };
    });
};

/** All confirmed payments for an order (for Finance closed POs / history) */
const _selectFinanceVerifiedPayments = (store: ERPStoreState): PaymentConfirmation[] =>
  getSales(store).paymentConfirmations.filter((p) => p.status === 'FINANCE_VERIFIED');

// ════════════════════════════════════════════════════════════════════════════
//  REPLACEMENT SELECTORS
// ════════════════════════════════════════════════════════════════════════════

const _selectSalesReplacementRequests = (store: ERPStoreState): ReplacementRequest[] =>
  getSales(store).replacementRequests;

/** Plant Head replacement requests awaiting approval */
const _selectPlantHeadReplacementRequests = (store: ERPStoreState) => {
  const { replacementRequests, orders } = getSales(store);
  return replacementRequests
    .filter((r) => r.status === 'REPLACEMENT_REQUESTED' || r.status === 'REPLACEMENT_APPROVED')
    .map((r) => {
      const order = orders.find((o) => o.id === r.orderId);
      return {
        ...r,
        customerName: order?.customerName || '',
        orderContactPerson: order?.contactPerson || '',
        deliveryAddress: order?.deliveryAddress || '',
      };
    });
};

/** Dispatch replacement requests: approved replacements to be shipped */
const _selectDispatchReplacements = (store: ERPStoreState) => {
  const { replacementRequests, orders } = getSales(store);
  return replacementRequests
    .filter(
      (r) =>
        r.status === 'REPLACEMENT_APPROVED' ||
        r.status === 'REPLACEMENT_DISPATCHED' ||
        r.status === 'REPLACEMENT_IN_TRANSIT' ||
        r.status === 'REPLACEMENT_DELIVERED'
    )
    .map((r) => {
      const order = orders.find((o) => o.id === r.orderId);
      return {
        id: r.id,
        orderId: r.orderId,
        customerName: order?.customerName || '',
        contactPerson: order?.contactPerson || '',
        deliveryAddress: order?.deliveryAddress || r.replacementDeliveryAddress || '',
        items: r.items,
        status: r.status,
        pickupRequired: r.pickupRequired,
        preferredReplacementDate: r.preferredReplacementDate,
        documents: r.documents,
        photos: r.photos,
        plantHeadRemarks: r.plantHeadRemarks,
        createdAt: r.createdAt,
        // No pricing data
      };
    });
};

// ════════════════════════════════════════════════════════════════════════════
//  RETURN SELECTORS
// ════════════════════════════════════════════════════════════════════════════

const _selectSalesReturnRequests = (store: ERPStoreState): ReturnRequest[] =>
  getSales(store).returnRequests;

/** Plant Head return requests awaiting approval */
const _selectPlantHeadReturnRequests = (store: ERPStoreState) => {
  const { returnRequests, orders } = getSales(store);
  return returnRequests
    .filter((r) => r.status === 'RETURN_REQUESTED' || r.status === 'RETURN_APPROVED')
    .map((r) => {
      const order = orders.find((o) => o.id === r.orderId);
      return {
        ...r,
        customerName: order?.customerName || '',
        orderContactPerson: order?.contactPerson || '',
      };
    });
};

/** Dispatch return requests: approved returns for pickup coordination */
const _selectDispatchReturns = (store: ERPStoreState) => {
  const { returnRequests, orders } = getSales(store);
  return returnRequests
    .filter((r) =>
      [
        'RETURN_APPROVED',
        'RETURN_PICKUP_ASSIGNED',
        'RETURN_IN_TRANSIT',
        'RETURN_RECEIVED',
      ].includes(r.status)
    )
    .map((r) => {
      const order = orders.find((o) => o.id === r.orderId);
      return {
        id: r.id,
        orderId: r.orderId,
        customerName: order?.customerName || '',
        contactPerson: r.contactPerson || order?.contactPerson || '',
        pickupAddress: r.pickupAddress || order?.deliveryAddress || '',
        items: r.items,
        status: r.status,
        preferredPickupDate: r.preferredPickupDate,
        pickupDocument: r.pickupDocument,
        transitDocument: r.transitDocument,
        receiptImages: r.receiptImages,
        receiptDocument: r.receiptDocument,
        inspectionImages: r.inspectionImages,
        plantHeadRemarks: r.plantHeadRemarks,
        remarks: r.remarks,
        createdAt: r.createdAt,
        // No pricing data included
      };
    });
};

// ════════════════════════════════════════════════════════════════════════════
//  ACTION POLICY SELECTORS (canX helpers)
// ════════════════════════════════════════════════════════════════════════════

export const canGenerateQuotationFromLead = (status: SalesLead['status']): boolean =>
  status === 'LEAD_CREATED' || status === 'SAMPLE_REQUESTED' || status === 'QUOTATION_CREATED';

export const canRequestSample = (status: SalesLead['status']): boolean =>
  status === 'LEAD_CREATED' || status === 'SAMPLE_REQUESTED';

export const canConvertQuotation = (status: SalesQuotation['status']): boolean =>
  status === 'CUSTOMER_ACCEPTED';

export const canSendOrderToPlantHead = (order: SalesOrder): boolean =>
  order.commercialStatus === 'ORDER_CONFIRMED' && order.planningStatus === 'NOT_SENT';

export const canRecordPayment = (
  order: SalesOrder,
  confirmations: PaymentConfirmation[]
): boolean =>
  order.commercialStatus !== 'ORDER_CANCELLED' && calculatePendingAmount(order, confirmations) > 0;

export const canRequestReplacement = (
  order: SalesOrder,
  replacements: ReplacementRequest[],
  returns: ReturnRequest[]
): boolean => {
  if (order.dispatchStatus !== 'DELIVERED') return false;
  if (replacements.some((request) =>
    request.orderId === order.id &&
    ['REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED', 'REPLACEMENT_DISPATCHED', 'REPLACEMENT_IN_TRANSIT']
      .includes(request.status)
  )) return false;
  let totalAvailable = 0;
  for (const item of order.items) {
    totalAvailable += getAvailableAfterSalesQuantity(item.id, item.quantity, replacements, returns);
  }
  return totalAvailable > 0;
};

export const canRequestReturn = (
  order: SalesOrder,
  replacements: ReplacementRequest[],
  returns: ReturnRequest[]
): boolean => {
  if (order.dispatchStatus !== 'DELIVERED') return false;
  if (returns.some((request) =>
    request.orderId === order.id &&
    ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKUP_ASSIGNED', 'RETURN_IN_TRANSIT']
      .includes(request.status)
  )) return false;
  let totalAvailable = 0;
  for (const item of order.items) {
    totalAvailable += getAvailableAfterSalesQuantity(item.id, item.quantity, replacements, returns);
  }
  return totalAvailable > 0;
};

// ════════════════════════════════════════════════════════════════════════════
//  DATA MASKING HELPERS (private)
// ════════════════════════════════════════════════════════════════════════════

/** Plant Head view: no payment, no pricing — operational info only */
function toPlantHeadSafeView(order: SalesOrder) {
  const safeItems = Array.isArray(order.items) ? order.items : [];
  return {
    ...order,
    id: order.id,
    orderNo: order.orderNo || order.id,
    customerName: order.customerName || (order as any).customer?.name || 'Customer',
    contactPerson: order.contactPerson,
    deliveryAddress: order.deliveryAddress,
    salesperson: order.salesperson,
    requiredDeliveryDate: order.requiredDeliveryDate,
    planningStatus: order.planningStatus,
    commercialStatus: order.commercialStatus,
    productionStatus: order.productionStatus,
    qcStatus: order.qcStatus,
    dispatchStatus: order.dispatchStatus,
    replacementStatus: order.replacementStatus,
    returnStatus: order.returnStatus,
    products: (order as any).products || (safeItems.length > 0 ? safeItems.map(i => `${i?.productName || (i as any)?.name || 'Item'} (${i?.quantity || 1} Qty)`).join(', ') : 'Items'),
    detailedItems: safeItems,
    items: safeItems.map(toOperationalItem),
    createdAt: order.createdAt,
  };
}

/** Production view: operational info only */
function toProductionSafeView(order: SalesOrder) {
  const safeItems = Array.isArray(order.items) ? order.items : [];
  const productStr = (order as any).products || (safeItems.length > 0 ? safeItems.map(i => i?.productName || (i as any)?.name || 'Item').join(', ') : 'Custom Engineered Product');
  return {
    ...order,
    id: order.id,
    orderNo: order.orderNo || order.id,
    order_no: order.orderNo || order.id,
    customerName: order.customerName,
    contactPerson: order.contactPerson,
    deliveryAddress: order.deliveryAddress,
    requiredDeliveryDate: order.requiredDeliveryDate,
    planningStatus: order.planningStatus,
    productionStatus: order.productionStatus,
    qcStatus: order.qcStatus,
    products: productStr,
    productName: (order as any).productName || productStr,
    items: safeItems.map(toOperationalItem),
    createdAt: order.createdAt,
  };
}

/** Dispatch view: no pricing data */
function toDispatchSafeView(order: SalesOrder) {
  const safeItems = Array.isArray(order.items) ? order.items : [];
  const productStr = (order as any).products || (safeItems.length > 0 ? safeItems.map(i => i?.productName || (i as any)?.name || 'Item').join(', ') : 'Custom Engineered Product');
  return {
    ...order,
    id: order.id,
    orderNo: order.orderNo || order.id,
    order_no: order.orderNo || order.id,
    customerName: order.customerName,
    contactPerson: order.contactPerson,
    deliveryAddress: order.deliveryAddress,
    requiredDeliveryDate: order.requiredDeliveryDate,
    dispatchStatus: order.dispatchStatus,
    qcStatus: order.qcStatus,
    products: productStr,
    productName: (order as any).productName || productStr,
    items: safeItems.map(toOperationalItem),
    createdAt: order.createdAt,
  };
}

/** Strip pricing fields from line items for non-commercial roles */
function toOperationalItem(item: QuotationLineItem) {
  if (!item) return {} as any;
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName || (item as any).name || '',
    specifications: item.specifications || (item as any).specification || '',
    quantity: item.quantity,
    unit: item.unit,
    hsnCode: item.hsnCode,
    // unitPrice, gstPercentage, taxableValue, gstValue, totalAmount — excluded
  };
}


// ─── Exported Memoized Selectors ─────────────────────────────────────────────

export const selectSalesLeads = memoize(_selectSalesLeads);
export const selectLeadsForSample = memoize(_selectLeadsForSample);
export const selectSalesSamples = memoize(_selectSalesSamples);
export const selectDispatchSamples = memoize(_selectDispatchSamples);
export const selectEnrichedSamples = memoize(_selectEnrichedSamples);
export const selectSalesQuotations = memoize(_selectSalesQuotations);
export const selectPendingQuotations = memoize(_selectPendingQuotations);
export const selectSalesOrders = memoize(_selectSalesOrders);
export const selectPlantHeadIncomingOrders = memoize(_selectPlantHeadIncomingOrders);
export const selectPlantHeadPlanningOrders = memoize(_selectPlantHeadPlanningOrders);
export const selectProductionIncomingOrders = memoize(_selectProductionIncomingOrders);
export const selectProductionWorkOrders = memoize(_selectProductionWorkOrders);
export const selectDispatchOrders = memoize(_selectDispatchOrders);
export const selectSalesPaymentConfirmations = memoize(_selectSalesPaymentConfirmations);
export const selectFinanceSalesConfirmations = memoize(_selectFinanceSalesConfirmations);
export const selectFinanceVerifiedPayments = memoize(_selectFinanceVerifiedPayments);
export const selectSalesReplacementRequests = memoize(_selectSalesReplacementRequests);
export const selectPlantHeadReplacementRequests = memoize(_selectPlantHeadReplacementRequests);
export const selectDispatchReplacements = memoize(_selectDispatchReplacements);
export const selectSalesReturnRequests = memoize(_selectSalesReturnRequests);
export const selectPlantHeadReturnRequests = memoize(_selectPlantHeadReturnRequests);
export const selectDispatchReturns = memoize(_selectDispatchReturns);
