import { SalesOrderStatus } from '@prisma/client';

export interface SalesOrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productCode: string | null;
  orderedQuantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  // Quantities are now computed from child documents (DispatchItem, SalesReturnItem, etc.)
  // These are returned as computed summaries from the service, not stored DB fields.
  deliveredQuantity?: number;
  returnedQuantity?: number;
  replacedQuantity?: number;
}

export interface SalesOrderResponseDto {
  id: string;
  orderId: string;
  orderNumber?: string;
  orderNo?: string;
  customerId: string;
  customerName: string;
  customerCode: string | null;
  customer?: any;
  salesExecutiveId?: string | null;
  salesExecutive?: { id: string; name: string; email: string } | null;
  salesperson?: string;
  salesPersonName?: string;
  shippingAddress?: any;
  billingAddress?: any;

  items: SalesOrderItemResponseDto[];

  subtotal: number;
  taxAmount: number;
  freightAmount?: number;
  totalAmount: number;
  verifiedPaidAmount: number;
  balanceAmount: number;
  paymentStatus: string;

  // Single unified lifecycle status (replaces the old roll-up fields)
  status: SalesOrderStatus;
  sentToPlantHead?: boolean;
  sentToPlantHeadAt?: string;
  planningStatus?: string;
  productionPlanId?: string | null;
  productionStatus?: string | null;
  productionAssignedToId?: string | null;
  qcStatus?: string | null;
  targetDate?: string | null;
  priority?: string | null;

  workflowStateId: string | null;
  workflowStateCode?: string;
  workflowStateName?: string;

  // Computed summaries — derived from child documents, not stored
  productionSummary?: string;
  dispatchSummary?: string;
  dispatchStatus?: string;
  deliveredAt?: string;
  podUrl?: string;
  returnStatus?: string;
  replacementStatus?: string;
  paymentSummary?: string;
  invoiceSummary?: string;
  remarks?: string;
  dispatches?: any[];

  createdAt: string;
  updatedAt: string;
  version: number;
}
