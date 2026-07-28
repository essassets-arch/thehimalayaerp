export interface LegacySalesOrderItemInput {
  productId?: string;
  productName?: string;
  productCode?: string;
  quantity?: number | string;
  unit?: string;
  unitPrice?: number | string;
  discount?: number | string;
  tax?: number | string;
}

export interface LegacySalesOrderInput {
  legacyId: string;
  orderNumber?: string;
  orderNo?: string;
  quotationId?: string;
  customerId?: string;
  customerCode?: string;
  customerName?: string;

  customerPurchaseOrderNo?: string;
  customerPurchaseOrderDate?: string;

  orderDate?: string;
  date?: string;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;

  items?: LegacySalesOrderItemInput[] | any;
  products?: string; // Sometimes they put products as a string
  quantity?: number | string;

  subtotal?: number | string;
  discountAmount?: number | string;
  taxableAmount?: number | string;
  taxAmount?: number | string;
  freightAmount?: number | string;
  transportCharge?: number | string;
  totalAmount?: number | string;
  totalValue?: number | string;
  grandTotal?: number | string;

  orderStatus?: string;
  status?: string;
  workflowStatus?: string;
  productionStatus?: string;
  qcStatus?: string;
  dispatchStatus?: string;
  paymentStatus?: string;
  closureStatus?: string;

  createdAt?: string;
  updatedAt?: string;

  source?: string;
}
