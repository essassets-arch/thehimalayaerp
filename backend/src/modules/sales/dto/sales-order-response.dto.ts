import { SalesOrderStatus } from '@prisma/client';

export interface SalesOrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productNameSnapshot?: string | null;
  productCode: string | null;
  productCodeSnapshot?: string | null;
  productType?: string;
  isTrading?: boolean;
  orderedQuantity: number;
  unit: string;
  unitPrice: number;
  taxableAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  lineTotal: number;
  // Quantities computed from child documents
  deliveredQuantity?: number;
  returnedQuantity?: number;
  replacedQuantity?: number;
  availableForReturn?: number;
  availableForReplacement?: number;
  fulfillment?: any;
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
  invoiceNumber?: string | null;
  invoiceNo?: string | null;
  invoice_number?: string | null;
  remarks?: string;
  dispatches?: any[];
  productionPlans?: any[];
  workOrders?: any[];
  invoices?: any[];
  histories?: any[];
  quotation?: any;
  quotationNumber?: string | null;
  lead?: any;
  leadNumber?: string | null;

  lostReason?: string | null;
  lostAt?: string | null;
  lostComplaintId?: string | null;
  lossRecord?: any;

  createdAt: string;
  updatedAt: string;
  version: number;
}
