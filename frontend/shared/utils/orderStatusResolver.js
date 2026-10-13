import { isTradingProduct, isPureTradingOrder } from './dispatchCategory';

export function isTradingOrder(order) {
  if (!order) return false;
  return isPureTradingOrder(order) || isTradingProduct(order);
}

export function isDeliveredOrder(order) {
  if (!order) return false;

  const dispatches = Array.isArray(order.dispatches) ? order.dispatches : [];
  if (dispatches.length > 0) {
    const completedStatuses = new Set(['DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED']);
    const hasActiveTransit = dispatches.some((d) =>
      ['DISPATCHED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(String(d.status || '').toUpperCase())
    );
    if (hasActiveTransit) {
      return false; // Active dispatches on route with driver take precedence over legacy delivered flags
    }
    return dispatches.every((d) => completedStatuses.has(String(d.status || '').toUpperCase()));
  }

  const dispatchSt = String(order.dispatchStatus || '').toUpperCase();
  const orderSt = String(order.orderStatus || order.status || order.workflowStatus || '').toUpperCase();
  return (
    ['DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED'].includes(dispatchSt) ||
    ['DELIVERED', 'CLOSED'].includes(orderSt) ||
    Boolean(order.deliveredDate || order.deliveredAt)
  );
}

export function getOrderStatusLabel(order) {
  if (!order) return 'Pending';

  const status = String(order.status || order.orderStatus || '').toUpperCase();
  if (
    status === 'LOST' ||
    order.workflowStateCode === 'LOST' ||
    Boolean(order.lostReason) ||
    Boolean(order.lossRecord) ||
    Boolean(order.lostComplaintId)
  ) {
    return 'Lost';
  }
  if (order.commercialStatus === 'ORDER_CLOSED' || status === 'CLOSED' || status === 'ORDER_CLOSED') {
    return 'Closed';
  }

  const prodStatus = String(order.productionStatus || '').toUpperCase();
  const dispStatus = String(order.dispatchStatus || '').toUpperCase();
  const isTrading = isTradingOrder(order);

  // 1. Delivered
  if (isDeliveredOrder(order)) {
    return 'Delivered';
  }

  // 2. In Transit / Dispatched
  const dispatches = Array.isArray(order.dispatches) ? order.dispatches : [];
  const hasActiveTransitDispatch = dispatches.some((d) =>
    ['DISPATCHED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(String(d.status || '').toUpperCase())
  );

  const isInTransit =
    hasActiveTransitDispatch ||
    ['DISPATCHED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(dispStatus) ||
    ['DISPATCHED', 'IN_TRANSIT', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(status) ||
    prodStatus === 'DISPATCHED' ||
    (status === 'COMPLETED' && !isDeliveredOrder(order));

  if (isInTransit) {
    return 'In Transit';
  }

  // 3. Ready for Dispatch / Dispatch Planned
  if (
    ['READY_FOR_PICKUP', 'DISPATCH_READY', 'READY_FOR_DISPATCH'].includes(dispStatus) ||
    status === 'READY_FOR_DISPATCH' ||
    order.workflowStateCode === 'READY_FOR_DISPATCH' ||
    prodStatus === 'READY_FOR_DISPATCH' ||
    (isTrading && (order.sentToDispatch2 || order.currentDepartment === 'Dispatch 2'))
  ) {
    return isTrading ? 'Sent to Dispatch' : 'Ready for Dispatch';
  }

  if (['DISPATCH_DRAFT', 'DISPATCH_CREATED'].includes(dispStatus)) {
    return isTrading ? 'Sent to Dispatch' : 'Ready for Dispatch';
  }

  // 4. QC Approved
  if (
    order.qcStatus === 'QC_APPROVED' ||
    order.qcStatus === 'APPROVED' ||
    ['QC_APPROVED', 'PRODUCTION_COMPLETED'].includes(prodStatus)
  ) {
    return 'QC Approved';
  }

  // 5. QC Inspection
  if (
    ['QUALITY_CHECK', 'QC_INSPECTION', 'QC', 'QC_PENDING'].includes(prodStatus) ||
    ['QC_PENDING', 'PENDING_INSPECTION'].includes(String(order.qcStatus || '').toUpperCase())
  ) {
    return 'QC Inspection';
  }

  // 6. In Production
  if (
    ['RELEASED', 'PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS', 'IN_PRODUCTION', 'STARTED', 'PARTIALLY_COMPLETED'].includes(prodStatus) ||
    status === 'IN_PRODUCTION' ||
    order.workflowStateCode === 'IN_PRODUCTION'
  ) {
    return 'In Production';
  }

  // 7. Production Planned
  if (
    order.planningStatus === 'PRODUCTION_PLANNED' ||
    prodStatus === 'PLANNED' ||
    status === 'PRODUCTION_PLANNED' ||
    status === 'READY_FOR_PRODUCTION' ||
    order.workflowStateCode === 'READY_FOR_PRODUCTION' ||
    order.workflowStateCode === 'PRODUCTION_PLANNED'
  ) {
    return 'Production Planned';
  }

  // 8. Accepted by Plant Head
  if (
    order.planningStatus === 'PLANT_HEAD_ACCEPTED' ||
    status === 'PLANT_APPROVED' ||
    order.workflowStateCode === 'PLANT_APPROVED'
  ) {
    return 'Accepted by Plant Head';
  }

  // 9. Sent to Plant Head / Sent to Dispatch
  if (
    order.planningStatus === 'PENDING_ACCEPTANCE' ||
    ['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_PENDING'].includes(status) ||
    ['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_PENDING'].includes(String(order.workflowStateCode || '').toUpperCase()) ||
    order.sentToPlantHead
  ) {
    return isTrading ? 'Sent to Dispatch' : 'Sent to Plant Head';
  }

  // 10. Confirmed
  if (
    ['CONFIRMED', 'ORDER_CONFIRMED', 'DRAFT', 'SUBMITTED', 'PENDING_APPROVAL'].includes(status) ||
    order.commercialStatus === 'ORDER_CONFIRMED'
  ) {
    return 'Confirmed';
  }

  return order.status || order.workflowStatus || 'Confirmed';
}
