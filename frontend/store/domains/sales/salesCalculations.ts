import { 
  SalesOrder, 
  PaymentConfirmation, 
  ReplacementRequest, 
  ReturnRequest, 
  AfterSalesRequestItem, 
  PaymentMilestone,
  SalesSample
} from './salesTypes';

/**
 * Calculates the total reported (but not necessarily verified) payment amount.
 * Ignores rejected confirmations.
 */
export const calculateReportedPaidAmount = (orderId: string, confirmations: PaymentConfirmation[]): number => {
  return confirmations
    .filter(c => c.orderId === orderId && c.status !== 'FINANCE_REJECTED')
    .reduce((sum, c) => sum + c.amount, 0);
};

/**
 * Calculates the total VERIFIED payment amount (only FINANCE_VERIFIED).
 */
export const calculateVerifiedPaidAmount = (orderId: string, confirmations: PaymentConfirmation[]): number => {
  return confirmations
    .filter(c => c.orderId === orderId && c.status === 'FINANCE_VERIFIED')
    .reduce((sum, c) => sum + c.amount, 0);
};

export const deriveOrderPaymentStatus = (
  order: SalesOrder,
  paymentConfirmations: PaymentConfirmation[]
): SalesOrder['paymentStatus'] => {
  const verifiedTotal = calculateVerifiedPaidAmount(order.id, paymentConfirmations);
  const hasPendingConfirmation = paymentConfirmations.some(
    (c) => (c.orderId === order.id || c.orderId === order.orderNo) && c.status === 'FINANCE_VERIFICATION_PENDING'
  );

  if (verifiedTotal >= Number(order.grandTotal || 0) && Number(order.grandTotal || 0) > 0) {
    return 'FULLY_PAID';
  }

  if (hasPendingConfirmation) {
    return 'FINANCE_VERIFICATION_PENDING';
  }

  if (verifiedTotal > 0) {
    return 'PARTIALLY_PAID';
  }

  if (order.dispatchStatus === 'DELIVERED') {
    return 'PAYMENT_DUE';
  }

  return 'NOT_DUE';
};

/**
 * Calculates the remaining pending amount based on verified payments.
 */
export const calculatePendingAmount = (order: SalesOrder, confirmations: PaymentConfirmation[]): number => {
  const verifiedPaid = calculateVerifiedPaidAmount(order.id, confirmations);
  const pending = order.grandTotal - verifiedPaid;
  return pending > 0 ? pending : 0;
};

/**
 * Calculates the expected amount for a specific milestone.
 */
export const calculateMilestoneAmount = (order: SalesOrder, milestone: PaymentMilestone): number => {
  return (order.grandTotal * milestone.percentage) / 100;
};

/**
 * Validates that the sum of payment milestones equals 100%.
 */
export const validateMilestonePercentages = (milestones: PaymentMilestone[]): boolean => {
  const total = milestones.reduce((sum, m) => sum + m.percentage, 0);
  return total === 100;
};

/**
 * Calculates the quantity of an order line item that is still eligible for replacement or return.
 * Subtracts quantities already requested/approved in other replacement or return requests.
 */
export const getAvailableAfterSalesQuantity = (
  orderLineId: string,
  deliveredQuantity: number, // From original order line item
  replacements: ReplacementRequest[],
  returns: ReturnRequest[]
): number => {
  let usedQuantity = 0;

  // Add quantities from active or completed replacements
  replacements.forEach(req => {
    if (req.status !== 'REPLACEMENT_REJECTED') {
      const item = req.items.find(i => i.orderLineId === orderLineId);
      if (item) {
        usedQuantity += item.approvedQuantity || item.requestedQuantity;
      }
    }
  });

  // Add quantities from active or completed returns
  returns.forEach(req => {
    if (req.status !== 'RETURN_REJECTED') {
      const item = req.items.find(i => i.orderLineId === orderLineId);
      if (item) {
        usedQuantity += item.approvedQuantity || item.requestedQuantity;
      }
    }
  });

  const available = deliveredQuantity - usedQuantity;
  return available > 0 ? available : 0;
};

const getDeliveredLineQuantity = (item: any): number =>
  Number(
    item.deliveredQuantity ??
    item.quantity_dispatched ??
    item.delivered_qty ??
    item.qcApprovedQuantity ??
    item.approvedQuantity ??
    item.quantity ??
    0
  );

export const getOrderAvailableAfterSalesQuantity = (
  order: SalesOrder,
  replacements: ReplacementRequest[],
  returns: ReturnRequest[]
): number =>
  (order.items || []).reduce((total, item: any) => {
    const lineId = item.id || item.orderLineId || item.productId;
    return total + getAvailableAfterSalesQuantity(
      lineId,
      getDeliveredLineQuantity(item),
      replacements.filter((request) => request.orderId === order.id),
      returns.filter((request) => request.orderId === order.id)
    );
  }, 0);

/**
 * Generates ISO string for sample testing end date
 */
export const calculateSampleTestingEndDate = (confirmedDeliveryDateTime: string): string => {
  const date = new Date(confirmedDeliveryDateTime);
  date.setDate(date.getDate() + 20);
  return date.toISOString();
};

/**
 * Calculates remaining days in the 20-day sample testing window
 */
export const getSampleRemainingDays = (sample: SalesSample): number => {
  if (!sample.testingEndDateTime) return 20;
  
  const end = new Date(sample.testingEndDateTime).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  
  if (diff <= 0) return 0;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const selectHasFullReturnCompleted = (state: any, orderId: string): boolean => {
  const sales = state?.sales || state;
  const order = (sales.orders || []).find((o: any) => o.id === orderId || o.orderNo === orderId);
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return false;

  const returns = (sales.returnRequests || []).filter((r: any) => (r.orderId === order.id || r.orderId === order.orderNo) && r.status === 'RETURN_RECEIVED');
  if (returns.length === 0) return false;

  return order.items.every((item: any) => {
    const itemLineId = item.id || item.orderLineId || item.productId;
    const deliveredQty = Number(item.quantity_dispatched ?? item.delivered_qty ?? item.quantity ?? 0);
    const returnedQty = returns.reduce((sum: number, r: any) => {
      const match = (r.items || []).find((i: any) => i.orderLineId === itemLineId || i.productId === item.productId);
      return sum + Number(match?.receivedQuantity || match?.approvedQuantity || match?.requestedQuantity || 0);
    }, 0);
    return deliveredQty > 0 && returnedQty >= deliveredQty;
  });
};

export const selectCanAskForPayment = (state: any, orderId: string): boolean => {
  const sales = state?.sales || state;
  const order = (sales.orders || []).find((o: any) => o.id === orderId || o.orderNo === orderId);
  if (!order) return false;

  const isDelivered = String(order.dispatchStatus).toUpperCase() === 'DELIVERED';
  const isFullyPaid = String(order.paymentStatus).toUpperCase() === 'FULLY_PAID';
  const hasPendingFinance = (sales.paymentConfirmations || []).some(
    (c: any) => (c.orderId === order.id || c.orderId === order.orderNo) && c.status === 'FINANCE_VERIFICATION_PENDING'
  );

  return isDelivered && !isFullyPaid && !hasPendingFinance;
};

export const selectCanRequestReplacement = (state: any, orderId: string): boolean => {
  const sales = state?.sales || state;
  const order = (sales.orders || []).find((o: any) => o.id === orderId || o.orderNo === orderId);
  if (!order) return false;

  const isDelivered = String(order.dispatchStatus).toUpperCase() === 'DELIVERED';
  if (!isDelivered) return false;

  const activeReplacement = (sales.replacementRequests || []).some(
    (r: any) => (r.orderId === order.id || r.orderId === order.orderNo) &&
    ['REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED', 'REPLACEMENT_DISPATCHED', 'REPLACEMENT_IN_TRANSIT'].includes(r.status)
  );
  if (activeReplacement) return false;

  const fullReturnCompleted = selectHasFullReturnCompleted(state, orderId);
  if (fullReturnCompleted) return false;

  return getOrderAvailableAfterSalesQuantity(
    order,
    sales.replacementRequests || [],
    sales.returnRequests || []
  ) > 0;
};

export const selectCanRequestReturn = (state: any, orderId: string): boolean => {
  const sales = state?.sales || state;
  const order = (sales.orders || []).find((o: any) => o.id === orderId || o.orderNo === orderId);
  if (!order) return false;

  const isDelivered = String(order.dispatchStatus).toUpperCase() === 'DELIVERED';
  if (!isDelivered) return false;

  const activeReturn = (sales.returnRequests || []).some(
    (r: any) => (r.orderId === order.id || r.orderId === order.orderNo) &&
    ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKUP_ASSIGNED', 'RETURN_IN_TRANSIT'].includes(r.status)
  );
  if (activeReturn) return false;

  const fullReturnCompleted = selectHasFullReturnCompleted(state, orderId);
  if (fullReturnCompleted) return false;

  return getOrderAvailableAfterSalesQuantity(
    order,
    sales.replacementRequests || [],
    sales.returnRequests || []
  ) > 0;
};
