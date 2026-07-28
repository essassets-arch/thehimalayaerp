export const normalizeStatus = (value: unknown = ''): string =>
  String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');

export const getOrderId = (record: any = {}): string =>
  String(record.orderId ?? record.order_id ?? record.orderNo ?? record.order_no ?? record.orderRef ?? '');

export const getWorkOrderId = (record: any = {}): string =>
  String(record.workOrderId ?? record.work_order_id ?? record.workOrderNo ?? record.work_order_no ?? '');

export const getBatchId = (record: any = {}): string =>
  String(record.batchId ?? record.batch_id ?? record.batchNo ?? record.batch_no ?? record.batchNumber ?? '');

export const normalizeItems = (record: any): any[] => {
  if (Array.isArray(record?.items)) return record.items;
  if (Array.isArray(record?.products)) return record.products;
  if (record?.items && typeof record.items === 'object') return [record.items];
  if (record?.products && typeof record.products === 'object') return [record.products];
  return [];
};

export const resolveProducedQuantity = (
  workOrder: any = {},
  productionEntry: any = {},
  order: any = {}
): number => Number(
  workOrder.producedQty ??
  workOrder.completedQty ??
  productionEntry.producedQty ??
  productionEntry.completedQty ??
  productionEntry.quantity ??
  order.producedQty ??
  0
);

export const resolveBatchNumber = (
  workOrder: any = {},
  productionEntry: any = {},
  order: any = {}
): string =>
  String(
    workOrder.batchNo ??
    workOrder.batchId ??
    productionEntry.batchNo ??
    productionEntry.batchNumber ??
    order.batchNo ??
    '—'
  );

const dateParts = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  return {
    date: Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN'),
    time: Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-IN'),
  };
};

export type TimelineEntry = {
  stage: string;
  date: string;
  time: string;
  remarks?: string;
  timestamp?: string;
};

export const selectOrderTimeline = (root: any, orderId: string): TimelineEntry[] => {
  const state = root?.state ?? root ?? {};
  const sales = state.sales ?? {};
  const production = state.production ?? {};
  const dispatch = state.dispatch ?? {};
  const order = (sales.orders ?? []).find((record: any) =>
    String(record.id ?? record.orderNo) === String(orderId)
  );
  if (!order) return [];

  const workOrders = (production.workOrders ?? []).filter((record: any) => getOrderId(record) === String(order.id));
  const workOrderIds = new Set(workOrders.map((record: any) => String(record.id ?? getWorkOrderId(record))));
  const qcRecords = (production.qcRecords ?? state.qc?.inspections ?? []).filter((record: any) =>
    getOrderId(record) === String(order.id) || workOrderIds.has(getWorkOrderId(record))
  );
  const finishedGoods = (production.finishedGoods ?? []).filter((record: any) => getOrderId(record) === String(order.id));
  const consignments = (dispatch.consignments ?? []).filter((record: any) => getOrderId(record) === String(order.id));
  const payments = (sales.paymentConfirmations ?? state.finance?.payments ?? []).filter((record: any) => getOrderId(record) === String(order.id));
  const entries: Array<{ stage: string; at?: string; remarks?: string }> = [];
  const add = (condition: boolean, stage: string, at?: string, remarks?: string) => {
    if (condition) entries.push({ stage, at, remarks });
  };
  add(true, 'Created', order.createdAt, 'Order confirmed');
  add(
    Boolean(order.sentToPlantHead) || ['SENT_TO_PLANT_HEAD', 'PENDING_ACCEPTANCE'].includes(normalizeStatus(order.workflowStatus ?? order.commercialStatus ?? order.planningStatus)),
    'Confirmed',
    order.sentToPlantHeadAt,
    'Sent to Plant Head'
  );
  add(['PLANT_HEAD_ACCEPTED', 'PRODUCTION_PLANNED'].includes(normalizeStatus(order.planningStatus ?? order.workflowStatus)), 'Planned', order.acceptedByPlantHeadAt ?? order.plannedAt, 'Plant Head accepted / planned');
  workOrders.forEach((record: any) => {
    add(true, 'Work Order Created', record.createdAt, record.id);
    add(['PRODUCTION_STARTED', 'IN_PROGRESS'].includes(normalizeStatus(record.status)), 'In Production', record.startedAt, record.remarks);
    add(['PRODUCTION_COMPLETED', 'COMPLETED', 'QC_PENDING', 'QC_APPROVED'].includes(normalizeStatus(record.status)), 'Production Completed', record.completedAt, record.remarks);
  });
  add(normalizeStatus(order.qcStatus) === 'QC_PENDING', 'QC Pending', order.productionCompletedAt);
  qcRecords.forEach((record: any) => add(
    true,
    normalizeStatus(record.status).includes('FAILED') ? 'QC Failed' : 'QC Passed',
    record.approvedAt ?? record.createdAt,
    record.remarks
  ));
  finishedGoods.forEach((record: any) => add(true, 'Dispatch Planned', record.qcApprovedAt ?? record.createdAt, `Finished Goods ${record.id}`));
  consignments.forEach((record: any) => {
    add(true, 'Dispatched', record.createdAt ?? record.dispatchDate, record.vehicleNumber);
    add(['IN_TRANSIT', 'DELIVERED'].includes(normalizeStatus(record.status)), 'In Transit', record.transitStartedAt ?? record.departureDate);
    add(normalizeStatus(record.status) === 'DELIVERED', 'Delivered', record.deliveredAt, record.remarks);
  });
  payments.filter((record: any) => normalizeStatus(record.status) === 'FINANCE_VERIFIED')
    .forEach((record: any) => add(true, 'Payment Verified', record.verifiedAt ?? record.createdAt));
  add(normalizeStatus(order.commercialStatus) === 'ORDER_CLOSED', 'Closed', order.closedAt ?? order.updatedAt);

  return entries
    .map((entry) => ({ ...entry, ...dateParts(entry.at), timestamp: entry.at }))
    .sort((a, b) => String(a.timestamp ?? '').localeCompare(String(b.timestamp ?? '')));
};

export const isPlanningHistoryOrder = (order: any): boolean => [
  'PRODUCTION_COMPLETED', 'QC_PENDING', 'QC_APPROVED', 'QC_FAILED', 'FINISHED_GOODS',
  'AVAILABLE_FOR_DISPATCH', 'DISPATCH_CREATED', 'IN_TRANSIT', 'DELIVERED', 'CLOSED', 'ORDER_CLOSED',
].some((status) => [
  order.workflowStatus,
  order.productionStatus,
  order.qcStatus,
  order.dispatchStatus,
  order.commercialStatus,
].map(normalizeStatus).includes(status));
