import { getBatchId, getOrderId, getWorkOrderId, normalizeItems, normalizeStatus } from '../shared/workflowUtils';

const inStatuses = (record: any, statuses: string[]) =>
  statuses.includes(normalizeStatus(record?.status ?? record?.dispatchStatus));

export const dispatchOrderTabs = [
  { key: 'all', label: 'All', predicate: (r: any) => !inStatuses(r, ['DELIVERED', 'DELIVERY_CONFIRMED', 'CANCELLED', 'RETURN_INITIATED', 'RETURNED', 'ARCHIVED', 'CLOSED']) },
  { key: 'ready', label: 'Ready for Dispatch', predicate: (r: any) => inStatuses(r, ['AVAILABLE_FOR_DISPATCH', 'READY_FOR_DISPATCH', 'QC_APPROVED', 'PENDING_DISPATCH']) && r.dispatchableQty > 0 },
  { key: 'created', label: 'Dispatch Created', predicate: (r: any) => inStatuses(r, ['DISPATCH_CREATED', 'CREATED', 'PLANNED', 'READY_FOR_DEPARTURE']) },
  { key: 'in-transit', label: 'In Transit', predicate: (r: any) => inStatuses(r, ['IN_TRANSIT', 'DISPATCHED', 'VEHICLE_DEPARTED', 'OUT_FOR_DELIVERY']) },
  { key: 'delivered', label: 'Delivered', predicate: (r: any) => inStatuses(r, ['DELIVERED', 'DELIVERY_CONFIRMED']) },
  { key: 'history', label: 'History', predicate: (r: any) => inStatuses(r, ['COMPLETED', 'DELIVERED', 'DELIVERY_CONFIRMED', 'CANCELLED', 'RETURN_INITIATED', 'RETURNED', 'REPLACEMENT_INITIATED', 'ARCHIVED', 'CLOSED']) },
];

export const sampleDispatchTabs = [
  { key: 'all', label: 'All', predicate: () => true },
  { key: 'pending', label: 'Pending Dispatch', predicate: (r: any) => inStatuses(r, ['PENDING', 'PENDING_DISPATCH', 'SAMPLE_CREATED', 'SAMPLE_DISPATCH_REQUESTED']) },
  { key: 'in-transit', label: 'In Transit', predicate: (r: any) => inStatuses(r, ['IN_TRANSIT', 'DISPATCHED', 'SAMPLE_DISPATCHED', 'SAMPLE_IN_TRANSIT']) },
  { key: 'delivered', label: 'Delivered', predicate: (r: any) => inStatuses(r, ['DELIVERED', 'SAMPLE_DELIVERED']) },
  { key: 'return-due', label: 'Return Due', predicate: (r: any) => Boolean(r.returnDue) },
  { key: 'returned', label: 'Returned', predicate: (r: any) => inStatuses(r, ['RETURNED', 'SAMPLE_RETURNED']) },
  { key: 'history', label: 'History', predicate: (r: any) => inStatuses(r, ['DELIVERED', 'SAMPLE_DELIVERED', 'RETURN_DUE', 'RETURN_INITIATED', 'RETURN_IN_TRANSIT', 'RETURNED', 'SAMPLE_RETURNED', 'LOST', 'CANCELLED', 'CLOSED']) },
];

export const returnTabs = [
  { key: 'all', label: 'All', predicate: () => true },
  { key: 'requested', label: 'Return Requested', predicate: (r: any) => inStatuses(r, ['RETURN_REQUESTED', 'PENDING_APPROVAL']) },
  { key: 'approved', label: 'Approved', predicate: (r: any) => inStatuses(r, ['RETURN_APPROVED', 'APPROVED']) },
  { key: 'pickup-scheduled', label: 'Pickup Scheduled', predicate: (r: any) => inStatuses(r, ['PICKUP_SCHEDULED', 'RETURN_PICKUP_ASSIGNED', 'RETURN_DISPATCH_CREATED']) },
  { key: 'in-transit', label: 'In Transit', predicate: (r: any) => inStatuses(r, ['RETURN_IN_TRANSIT', 'PICKED_UP']) },
  { key: 'received', label: 'Received', predicate: (r: any) => inStatuses(r, ['RETURN_RECEIVED', 'RECEIVED_AT_PLANT', 'INSPECTION_PENDING']) },
  { key: 'rejected', label: 'Rejected', predicate: (r: any) => inStatuses(r, ['RETURN_REJECTED', 'REJECTED']) },
  { key: 'history', label: 'History', predicate: (r: any) => inStatuses(r, ['RETURN_RECEIVED', 'RETURN_COMPLETED', 'REFUND_COMPLETED', 'CREDIT_NOTE_ISSUED', 'REJECTED', 'RETURN_REJECTED', 'CANCELLED', 'CLOSED']) },
];

export const replacementTabs = [
  { key: 'all', label: 'All', predicate: () => true },
  { key: 'requested', label: 'Replacement Requested', predicate: (r: any) => inStatuses(r, ['REPLACEMENT_REQUESTED', 'PENDING_APPROVAL']) },
  { key: 'approved', label: 'Approved', predicate: (r: any) => inStatuses(r, ['REPLACEMENT_APPROVED', 'APPROVED']) },
  { key: 'preparing', label: 'Preparing', predicate: (r: any) => inStatuses(r, ['PREPARING_REPLACEMENT', 'PRODUCTION_PENDING', 'QC_PENDING']) },
  { key: 'ready', label: 'Ready for Dispatch', predicate: (r: any) => inStatuses(r, ['REPLACEMENT_READY', 'AVAILABLE_FOR_DISPATCH', 'QC_APPROVED']) },
  { key: 'in-transit', label: 'In Transit', predicate: (r: any) => inStatuses(r, ['REPLACEMENT_IN_TRANSIT', 'IN_TRANSIT', 'DISPATCHED', 'REPLACEMENT_DISPATCHED']) },
  { key: 'delivered', label: 'Delivered', predicate: (r: any) => inStatuses(r, ['REPLACEMENT_DELIVERED', 'DELIVERED']) },
  { key: 'history', label: 'History', predicate: (r: any) => inStatuses(r, ['REPLACEMENT_DELIVERED', 'REPLACEMENT_COMPLETED', 'REJECTED', 'CANCELLED', 'CLOSED']) },
];

export const resolveDispatchQueue = (state: any): any[] => {
  const root = state?.state ?? state ?? {};
  const salesOrders = root.sales?.orders ?? [];
  const production = root.production ?? {};
  const dispatch = root.dispatch ?? {};
  const finishedGoods = production.finishedGoods ?? [];
  const workOrders = production.workOrders ?? [];
  const inspections = production.qcRecords ?? root.qc?.inspections ?? [];
  const consignments = dispatch.consignments ?? [];
  const queue = dispatch.dispatchOrders ?? [];

  return queue.map((record: any) => {
    const orderId = getOrderId(record);
    const finishedGood = finishedGoods.find((fg: any) =>
      String(fg.id ?? fg.finishedGoodsId) === String(record.finishedGoodsId) ||
      (getOrderId(fg) === orderId && (!getBatchId(record) || getBatchId(fg) === getBatchId(record)))
    ) ?? {};
    const order = salesOrders.find((candidate: any) => String(candidate.id ?? candidate.orderNo) === orderId) ?? {};
    const workOrderId = getWorkOrderId(record) || getWorkOrderId(finishedGood);
    const workOrder = workOrders.find((candidate: any) => String(candidate.id ?? candidate.workOrderNo) === workOrderId) ?? {};
    const inspection = inspections.find((candidate: any) =>
      getOrderId(candidate) === orderId || getWorkOrderId(candidate) === workOrderId
    ) ?? {};
    const consignment = consignments.find((candidate: any) =>
      String(candidate.dispatchOrderId) === String(record.id) || getOrderId(candidate) === orderId
    ) ?? {};
    const sourceItems = normalizeItems(record).length ? normalizeItems(record) : normalizeItems(finishedGood);
    const itemQty = sourceItems.reduce((sum, item) => sum + Number(item.qcApprovedQuantity ?? item.approvedQuantity ?? item.dispatchableQuantity ?? 0), 0);
    const rawApproved = Number(
      finishedGood.qcApprovedQty ?? finishedGood.approvedQty ?? inspection.approvedQty ??
      inspection.approvedQuantity ?? workOrder.qcApprovedQty ?? order.qcApprovedQty ?? itemQty ?? 0
    );
    const reservedQty = Number(finishedGood.reservedQty ?? finishedGood.reservedQuantity ?? 0);
    const dispatchedQty = Number(finishedGood.dispatchedQty ?? finishedGood.dispatchedQuantity ?? 0);
    const availableQty = Number(finishedGood.availableQty ??
      Math.max(0, rawApproved - reservedQty - dispatchedQty));
    const qcApprovedQty = rawApproved > 0 ? rawApproved : availableQty + reservedQty + dispatchedQty;
    const activeReserved = ['DISPATCH_CREATED', 'CREATED', 'PLANNED', 'READY_FOR_DEPARTURE']
      .includes(normalizeStatus(consignment.status)) ? Number(consignment.quantity ?? reservedQty) : 0;
    const dispatchableQty = Math.min(qcApprovedQty, Math.max(0, availableQty - activeReserved));
    const firstItem = sourceItems[0] ?? normalizeItems(order)[0] ?? {};
    return {
      ...record,
      orderId,
      workOrderId,
      batchId: getBatchId(record) || getBatchId(finishedGood),
      customerName: record.customerName ?? order.customerName ?? order.customer_name ?? finishedGood.customerName ?? 'Unknown Customer',
      productName: record.productName ?? finishedGood.productName ?? workOrder.productName ?? firstItem.productName ?? 'Unknown Product',
      qcApprovedQty,
      reservedQty,
      dispatchedQty,
      availableQty,
      dispatchableQty,
      vehicleNo: consignment.vehicleNumber ?? record.vehicleNumber,
      status: consignment.status ?? record.status,
      updatedAt: consignment.updatedAt ?? record.updatedAt ?? record.createdAt,
      consignment,
    };
  });
};
