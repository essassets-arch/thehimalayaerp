import { SalesOrder, SalesOrderItem, SalesOrderTimelineEvent, SalesOrderPagination } from './salesReadRepository';

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function toFiniteNumber(val: unknown): number {
  if (typeof val === 'number' && Number.isFinite(val)) {
    return val;
  }
  if (typeof val === 'string') {
    const num = parseFloat(val);
    if (Number.isFinite(num)) return num;
  }
  return 0;
}

export function normalizeSalesOrder(order: unknown): SalesOrder {
  const source = isRecord(order) ? order : {};
  const orderNumber = typeof source.orderId === 'string'
    ? source.orderId
    : typeof source.orderNumber === 'string'
      ? source.orderNumber
      : '';
  const status = typeof source.status === 'string'
    ? source.status
    : typeof source.workflowStateCode === 'string'
      ? source.workflowStateCode
    : typeof source.orderStatus === 'string'
      ? source.orderStatus
      : 'DRAFT';

  return {
    id: typeof source.id === 'string' ? source.id : '',
    orderId: orderNumber,
    orderNo: orderNumber,
    orderNumber,
    status,
    productionPlanId: typeof source.productionPlanId === 'string' ? source.productionPlanId : null,
    productionAssignedToId: typeof source.productionAssignedToId === 'string' ? source.productionAssignedToId : null,
    customerId: typeof source.customerId === 'string' ? source.customerId : '',
    customerName: typeof source.customerName === 'string' ? source.customerName : '',
    customerCode: typeof source.customerCode === 'string' ? source.customerCode : null,
    salesperson: typeof source.salesperson === 'string'
      ? source.salesperson
      : (isRecord(source.salesExecutive) && typeof source.salesExecutive.name === 'string')
        ? source.salesExecutive.name
        : 'Sales User',
    customer: isRecord(source.customer) ? {
      id: typeof source.customer.id === 'string' ? source.customer.id : '',
      name: typeof source.customer.name === 'string' ? source.customer.name : (typeof source.customer.companyName === 'string' ? source.customer.companyName : ''),
      companyName: typeof source.customer.companyName === 'string' ? source.customer.companyName : '',
    } : (typeof source.customerName === 'string' ? { name: source.customerName, companyName: source.customerName } : null),
    items: Array.isArray(source.items) ? source.items.map(normalizeSalesOrderItem) : [],

    subtotal: toFiniteNumber(source.subtotal),
    taxAmount: toFiniteNumber(source.taxAmount),
    totalAmount: toFiniteNumber(source.totalAmount),

    orderStatus: status,
    creditStatus: typeof source.creditStatus === 'string' ? source.creditStatus : 'PENDING',
    allocationStatus: typeof source.allocationStatus === 'string' ? source.allocationStatus : 'NOT_ALLOCATED',
    productionStatus: typeof source.productionStatus === 'string' ? source.productionStatus : 'NOT_REQUIRED',
    qcStatus: typeof source.qcStatus === 'string' ? source.qcStatus : 'NOT_REQUIRED',
    dispatchStatus: typeof source.dispatchStatus === 'string' ? source.dispatchStatus : 'NOT_READY',
    invoiceStatus: typeof source.invoiceStatus === 'string' ? source.invoiceStatus : 'PENDING',
    paymentStatus: typeof source.paymentStatus === 'string' ? source.paymentStatus : 'NOT_DUE',
    verifiedPaidAmount: toFiniteNumber(source.verifiedPaidAmount),
    balanceAmount: toFiniteNumber(source.balanceAmount),
    closureStatus: typeof source.closureStatus === 'string' ? source.closureStatus : 'OPEN',
    planningStatus: typeof source.planningStatus === 'string' ? source.planningStatus : undefined,
    targetDate: typeof source.targetDate === 'string' ? source.targetDate : null,
    priority: typeof source.priority === 'string' ? source.priority : undefined,
    replacementStatus: typeof source.replacementStatus === 'string' ? source.replacementStatus : undefined,
    returnStatus: typeof source.returnStatus === 'string' ? source.returnStatus : undefined,
    remarks: typeof source.remarks === 'string' ? source.remarks : undefined,

    createdAt: typeof source.createdAt === 'string' ? source.createdAt : new Date().toISOString(),
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : new Date().toISOString(),
  };
}

export function normalizeSalesOrderItem(item: unknown): SalesOrderItem {
  const source = isRecord(item) ? item : {};
  return {
    id: typeof source.id === 'string' ? source.id : '',
    productId: typeof source.productId === 'string' ? source.productId : '',
    productName: typeof source.productName === 'string' ? source.productName : '',
    productCode: typeof source.productCode === 'string' ? source.productCode : null,
    orderedQuantity: toFiniteNumber(source.orderedQuantity),
    unit: typeof source.unit === 'string' ? source.unit : 'PCS',
    unitPrice: toFiniteNumber(source.unitPrice),
    lineTotal: toFiniteNumber(source.lineTotal),
    deliveredQuantity: toFiniteNumber(source.deliveredQuantity),
    returnedQuantity: toFiniteNumber(source.returnedQuantity),
    replacedQuantity: toFiniteNumber(source.replacedQuantity),
    fulfillment: isRecord(source.fulfillment) ? {
      orderedQty: toFiniteNumber(source.fulfillment.orderedQty),
      availableFG: toFiniteNumber(source.fulfillment.availableFG),
      fgAllocatableQty: toFiniteNumber(source.fulfillment.fgAllocatableQty),
      productionRequiredQty: toFiniteNumber(source.fulfillment.productionRequiredQty),
      activeReservedQty: toFiniteNumber(source.fulfillment.activeReservedQty),
      productionCommittedQty: toFiniteNumber(source.fulfillment.productionCommittedQty),
      alreadyDispatchedQty: toFiniteNumber(source.fulfillment.alreadyDispatchedQty),
      pendingDirectDispatchQty: toFiniteNumber(source.fulfillment.pendingDirectDispatchQty),
      pendingProductionQty: toFiniteNumber(source.fulfillment.pendingProductionQty),
      fulfillmentState: typeof source.fulfillment.fulfillmentState === 'string' ? source.fulfillment.fulfillmentState : 'PENDING_DECISION',
    } : undefined,
  };
}

export function normalizeSalesOrderTimelineEvent(event: unknown): SalesOrderTimelineEvent {
  const source = isRecord(event) ? event : {};
  return {
    id: typeof source.id === 'string' ? source.id : '',
    action: typeof source.action === 'string' ? source.action : '',
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : new Date().toISOString(),
    performedBy: typeof source.performedBy === 'string' ? source.performedBy : null,
    remarks: typeof source.remarks === 'string' ? source.remarks : null,
  };
}

export function normalizePagination(pagination: unknown): SalesOrderPagination {
  const source = isRecord(pagination) ? pagination : {};
  return {
    page: toFiniteNumber(source.page) || 1,
    pageSize: toFiniteNumber(source.pageSize) || 25,
    total: toFiniteNumber(source.total) || 0,
    totalPages: toFiniteNumber(source.totalPages) || 0,
  };
}
