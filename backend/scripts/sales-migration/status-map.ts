import { 
  SalesOrderStatus, 
  ProductionStatus, 
  DispatchStatus, 
  PaymentStatus, 
  OrderClosureStatus 
} from '@prisma/client';

export const orderStatusMap: Record<string, SalesOrderStatus> = {
  'NEW': SalesOrderStatus.DRAFT,
  'ORDER_CREATED': SalesOrderStatus.DRAFT,
  'DRAFT': SalesOrderStatus.DRAFT,
  'CONFIRMED': SalesOrderStatus.CONFIRMED,
  'ORDER_CONFIRMED': SalesOrderStatus.CONFIRMED,
  'PLANT_PENDING': SalesOrderStatus.SENT_TO_PLANT_HEAD,
  'PENDING_ACCEPTANCE': SalesOrderStatus.SENT_TO_PLANT_HEAD,
  'SENT_TO_PLANT_HEAD': SalesOrderStatus.SENT_TO_PLANT_HEAD,
  'PLANT_HEAD_ACCEPTED': SalesOrderStatus.PRODUCTION_PLANNED,
  'PRODUCTION_PLANNED': SalesOrderStatus.PRODUCTION_PLANNED,
  'IN_PRODUCTION': SalesOrderStatus.FULFILLMENT_IN_PROGRESS,
  'PRODUCTION_IN_PROGRESS': SalesOrderStatus.FULFILLMENT_IN_PROGRESS,
  'DISPATCH_CREATED': SalesOrderStatus.READY_FOR_DISPATCH,
  'IN_TRANSIT': SalesOrderStatus.PARTIALLY_DISPATCHED,
  'DELIVERED': SalesOrderStatus.DELIVERED,
  'CANCELLED': SalesOrderStatus.CANCELLED,
  'CLOSED': SalesOrderStatus.DELIVERED, // Closure is separate enum usually
};

export const dispatchStatusMap: Record<string, DispatchStatus> = {
  'NOT_READY': DispatchStatus.NOT_READY,
  'DISPATCH_CREATED': DispatchStatus.DISPATCH_CREATED,
  'READY': DispatchStatus.READY,
  'IN_TRANSIT': DispatchStatus.IN_TRANSIT,
  'DELIVERED': DispatchStatus.DELIVERED,
};

export const productionStatusMap: Record<string, ProductionStatus> = {
  'NOT_STARTED': ProductionStatus.NOT_STARTED,
  'PLANNED': ProductionStatus.PLANNED,
  'WORK_ORDER_CREATED': ProductionStatus.WORK_ORDER_CREATED,
  'IN_PRODUCTION': ProductionStatus.IN_PROGRESS,
  'PRODUCTION_IN_PROGRESS': ProductionStatus.IN_PROGRESS,
  'COMPLETED': ProductionStatus.COMPLETED,
  'PRODUCTION_COMPLETED': ProductionStatus.COMPLETED,
};

export const paymentStatusMap: Record<string, PaymentStatus> = {
  'PENDING': PaymentStatus.DUE,
  'PAYMENT_PENDING': PaymentStatus.DUE,
  'PARTIALLY_PAID': PaymentStatus.PARTIALLY_PAID,
  'AWAITING_FINANCE_VERIFICATION': PaymentStatus.FINANCE_VERIFICATION_PENDING,
  'FINANCE_VERIFICATION_PENDING': PaymentStatus.FINANCE_VERIFICATION_PENDING,
  'FULLY_PAID': PaymentStatus.FULLY_PAID,
  'PAID': PaymentStatus.FULLY_PAID,
};

export function deriveStatuses(legacyStatus: string, payload: any) {
  const normalizedLegacyStatus = (legacyStatus || '').toUpperCase();
  
  let orderStatus = orderStatusMap[normalizedLegacyStatus] || SalesOrderStatus.DRAFT;
  let productionStatus = productionStatusMap[payload.productionStatus?.toUpperCase()] || ProductionStatus.NOT_STARTED;
  let dispatchStatus = dispatchStatusMap[payload.dispatchStatus?.toUpperCase()] || DispatchStatus.NOT_READY;
  let paymentStatus = paymentStatusMap[payload.paymentStatus?.toUpperCase()] || PaymentStatus.DUE;
  let closureStatus = payload.closureStatus === 'CLOSED' ? OrderClosureStatus.CLOSED : OrderClosureStatus.OPEN;

  // Inference rules based on legacy state logic
  if (normalizedLegacyStatus === 'DELIVERED') {
    orderStatus = SalesOrderStatus.DELIVERED;
    dispatchStatus = DispatchStatus.DELIVERED;
    productionStatus = ProductionStatus.COMPLETED;
  }

  if (normalizedLegacyStatus === 'CLOSED') {
    closureStatus = OrderClosureStatus.CLOSED;
  }

  return { orderStatus, productionStatus, dispatchStatus, paymentStatus, closureStatus };
}
