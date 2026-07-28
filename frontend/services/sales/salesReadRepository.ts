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
}

export interface SalesOrder {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerCode: string | null;

  items: SalesOrderItem[];

  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  orderStatus: string;
  creditStatus: string;
  allocationStatus: string;
  productionStatus: string;
  qcStatus: string;
  dispatchStatus: string;
  invoiceStatus: string;
  paymentStatus: string;
  closureStatus: string;

  createdAt: string;
  updatedAt: string;
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
