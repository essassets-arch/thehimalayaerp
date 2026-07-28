import { 
  SalesSample, 
  SalesQuotation, 
  SalesOrder, 
  PaymentConfirmation, 
  ReplacementRequest, 
  ReturnRequest 
} from './salesTypes';
import { calculatePendingAmount, getAvailableAfterSalesQuantity } from './salesCalculations';

export class SalesTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalesTransitionError';
  }
}

export const assertSampleCanDispatch = (sample: SalesSample) => {
  if (sample.status !== 'SAMPLE_VEHICLE_ASSIGNED' && sample.status !== 'SAMPLE_DISPATCH_REQUESTED') {
    throw new SalesTransitionError("Sample must be requested or vehicle assigned before dispatch.");
  }
  if (!sample.forwardDispatch?.vehicleNumber || !sample.forwardDispatch?.driverName) {
    throw new SalesTransitionError("Sample forward dispatch details (vehicle, driver) are required before dispatching.");
  }
};

export const assertSampleCanDeliver = (sample: SalesSample) => {
  if (sample.status !== 'SAMPLE_IN_TRANSIT' && sample.status !== 'SAMPLE_DISPATCHED') {
    throw new SalesTransitionError("Sample must be in transit before confirming delivery.");
  }
  if (sample.confirmedDeliveryDateTime) {
    throw new SalesTransitionError("Sample delivery has already been confirmed.");
  }
};

export const assertSampleTestingCanStart = (sample: SalesSample) => {
  if (!sample.confirmedDeliveryDateTime) {
    throw new SalesTransitionError("Sample testing cannot start before confirmed delivery.");
  }
};

export const assertQuotationCanConvert = (quotation: SalesQuotation) => {
  const allowed = ['QUOTATION_APPROVED', 'CUSTOMER_ACCEPTED', 'QUOTATION_SHARED', 'Sent', 'Approved'];
  if (!allowed.includes(quotation.status)) {
    throw new SalesTransitionError(`Quotation must be QUOTATION_APPROVED before conversion (current: ${quotation.status}).`);
  }
};

export const assertOrderCanSendToPlantHead = (order: SalesOrder) => {
  if (order.commercialStatus !== 'ORDER_CONFIRMED') {
    throw new SalesTransitionError("Order must be CONFIRMED to send to Plant Head.");
  }
  if (order.planningStatus !== 'NOT_SENT') {
    throw new SalesTransitionError("Order has already been sent to Plant Head.");
  }
};

export const assertWorkOrderCanActivate = (order: SalesOrder) => {
  if (order.planningStatus !== 'PRODUCTION_PLANNED') {
    throw new SalesTransitionError("Work order cannot activate before production planning is complete.");
  }
  if (order.productionStatus !== 'NOT_STARTED') {
    throw new SalesTransitionError("Production has already started.");
  }
};

export const assertSalesPaymentValid = (order: SalesOrder, confirmations: PaymentConfirmation[], paymentAmount: number) => {
  const pendingAmount = calculatePendingAmount(order, confirmations);
  if (paymentAmount <= 0) {
    throw new SalesTransitionError("Payment amount must be greater than zero.");
  }
  if (paymentAmount > pendingAmount) {
    throw new SalesTransitionError(`Sales payment (${paymentAmount}) cannot exceed remaining verified balance (${pendingAmount}).`);
  }
};

export const assertPaymentCanBeVerified = (confirmation: PaymentConfirmation, order: SalesOrder, paymentConfirmations: PaymentConfirmation[]) => {
  if (confirmation.status === 'FINANCE_VERIFIED') {
    throw new SalesTransitionError("Finance cannot approve an already verified confirmation.");
  }
  if (confirmation.status === 'FINANCE_REJECTED') {
    throw new SalesTransitionError("Finance cannot approve a rejected confirmation. Request a new submission.");
  }
  
  // Exact currency-safe comparison in paise (assuming amount is standard base, multiply by 100 for paise)
  const pendingAmountInPaise = Math.round(calculatePendingAmount(order, paymentConfirmations) * 100);
  const requestedAmountInPaise = Math.round(confirmation.amount * 100);
  if (requestedAmountInPaise > pendingAmountInPaise) {
    throw new SalesTransitionError(`Verified payments cannot exceed the order total. Attempted to approve ${confirmation.amount} but only ${pendingAmountInPaise / 100} is pending.`);
  }
};

export const assertPaymentCanBeRejected = (confirmation: PaymentConfirmation) => {
  if (confirmation.status === 'FINANCE_VERIFIED') {
    throw new SalesTransitionError("Finance cannot reject an already verified confirmation.");
  }
  if (confirmation.status === 'FINANCE_REJECTED') {
    throw new SalesTransitionError("Finance cannot reject an already rejected confirmation.");
  }
};

export const assertOrderCanClose = (order: SalesOrder, confirmations: PaymentConfirmation[]) => {
  if (order.dispatchStatus !== 'DELIVERED') {
    throw new SalesTransitionError("Order cannot close before complete delivery.");
  }
  const pendingAmount = calculatePendingAmount(order, confirmations);
  if (pendingAmount > 0) {
    throw new SalesTransitionError(`Order cannot close with a pending verified balance of ${pendingAmount}.`);
  }
};

export const assertReplacementCanDispatch = (request: ReplacementRequest) => {
  if (request.status !== 'REPLACEMENT_APPROVED') {
    throw new SalesTransitionError("Replacement cannot dispatch before Plant Head approval.");
  }
};

export const assertReturnCanBeAssigned = (request: ReturnRequest) => {
  if (request.status !== 'RETURN_APPROVED') {
    throw new SalesTransitionError("Return cannot begin pickup before Plant Head approval.");
  }
};

export const assertReturnCanStartTransit = (request: ReturnRequest) => {
  if (request.status !== 'RETURN_PICKUP_ASSIGNED') {
    throw new SalesTransitionError("Return must be assigned a pickup vehicle before starting transit.");
  }
};

export const assertReturnCanBeReceived = (request: ReturnRequest, receivedQuantity: number) => {
  if (request.status !== 'RETURN_IN_TRANSIT') {
    throw new SalesTransitionError("Return must be in transit before confirming receipt.");
  }
  const approvedQuantity = request.items.reduce((sum, item) => sum + (item.approvedQuantity || 0), 0);
  if (receivedQuantity <= 0) {
    throw new SalesTransitionError("Received quantity must be greater than zero.");
  }
  if (receivedQuantity > approvedQuantity) {
    throw new SalesTransitionError(`Cannot receive more than approved quantity (${approvedQuantity}).`);
  }
};

export const assertValidAfterSalesQuantity = (
  orderLineId: string,
  requestedQuantity: number,
  deliveredQuantity: number,
  replacements: ReplacementRequest[],
  returns: ReturnRequest[]
) => {
  const available = getAvailableAfterSalesQuantity(orderLineId, deliveredQuantity, replacements, returns);
  if (requestedQuantity > available) {
    throw new SalesTransitionError(`Requested quantity (${requestedQuantity}) exceeds available replaceable/returnable quantity (${available}).`);
  }
};
