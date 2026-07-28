export interface SalesOrderItemResponseDto {
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

export interface SalesOrderResponseDto {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerCode: string | null;

  items: SalesOrderItemResponseDto[];

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
  version: number;
}
