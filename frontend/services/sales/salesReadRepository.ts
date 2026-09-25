export interface SalesOrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string | null;
  orderedQuantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  deliveredQuantity: number;
  returnedQuantity: number;
  replacedQuantity: number;
  availableForReturn?: number;
  availableForReplacement?: number;
  fulfillment?: {
    orderedQty: number;
    availableFG: number;
    fgAllocatableQty: number;
    productionRequiredQty: number;
    activeReservedQty: number;
    productionCommittedQty?: number;
    alreadyDispatchedQty?: number;
    pendingDirectDispatchQty?: number;
    pendingProductionQty?: number;
    fulfillmentState?: string;
  };
  specifications?: any;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  raw?: any;
  _raw?: any;
}

export interface SalesOrder {
  id: string;
  orderId: string;
  orderNo?: string;
  orderNumber?: string;
  status?: string;
  productionPlanId?: string | null;
  productionAssignedToId?: string | null;
  customerId: string;
  customerName: string;
  customerCode: string | null;
  salesperson?: string;
  customer?: {
    id?: string;
    name: string;
    companyName: string;
    customerCode?: string | null;
    phone?: string | null;
    email?: string | null;
    contactPerson?: string | null;
    gstin?: string | null;
    billingAddress?: any;
    shippingAddress?: any;
  } | null;

  items: SalesOrderItem[];

  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount?: number;
  freightAmount?: number;

  customerPurchaseOrderNo?: string | null;
  customerPurchaseOrderDate?: string | null;
  customerPurchaseOrderFileUrl?: string | null;
  orderDate?: string | null;
  deliveryTerms?: string | null;
  requestedDeliveryDate?: string | null;
  paymentTerms?: string | null;
  paymentTermDays?: number | null;
  paymentDueDate?: string | null;
  billingAddress?: any;
  shippingAddress?: any;
  dispatches?: any[];
  quotation?: any;
  sourceQuotation?: any;

  orderStatus: string;
  creditStatus: string;
  allocationStatus: string;
  productionStatus: string;
  qcStatus: string;
  dispatchStatus: string;
  invoiceStatus: string;
  paymentStatus: string;
  verifiedPaidAmount?: number;
  balanceAmount?: number;
  closureStatus: string;
  planningStatus?: string;
  dispatchCategory?: string;
  productionTargetDate?: string | null;
  targetDate?: string | null;
  priority?: string;
  productionLine?: string;
  deliveredAt?: string | null;
  deliveredDate?: string | null;
  replacementStatus?: string;
  returnStatus?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  raw?: any;
  _raw?: any;
}

export interface SalesOrderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  orderStatus?: string;
  productionStatus?: string;
  dispatchStatus?: string;
  paymentStatus?: string;
  closureStatus?: string;
}

export interface SalesOrderPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SalesOrderListResponse {
  data: SalesOrder[];
  pagination: SalesOrderPagination;
}

export interface SalesOrderTimelineEvent {
  id: string;
  action: string;
  createdAt: string;
  performedBy: string | null;
  remarks: string | null;
}

export interface SalesReadRepository {
  listOrders(params?: SalesOrderListParams): Promise<SalesOrderListResponse>;
  getOrder(orderId: string): Promise<SalesOrder>;
  getOrderTimeline(orderId: string): Promise<SalesOrderTimelineEvent[]>;
}
