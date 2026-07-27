import type { ActionActor, ERPState } from '../sales/salesActions';
import { generateEntityIdPure } from '../../idGenerator';

const defaultActor: ActionActor = { id: 'Dispatch', name: 'Dispatch' };

const audit = (state: ERPState, entityId: string, orderId: string, action: string, status: string, actor: ActionActor) => {
  const [auditId, nextState] = generateEntityIdPure(state, 'audit');
  return {
    ...nextState,
    auditEvents: [{
      id: auditId,
      entityType: 'DISPATCH' as const,
      entityId,
      orderId,
      action,
      newStatus: status,
      actorId: actor.id,
      actorName: actor.name,
      department: 'Dispatch',
      createdAt: new Date().toISOString(),
    }, ...(nextState.auditEvents || [])],
  };
};

export function sendFinishedGoodsToDispatch(
  state: ERPState,
  finishedGoodsId: string,
  actor: ActionActor = defaultActor
): ERPState {
  const finishedGoods = state.production.finishedGoods.find((record: any) => record.id === finishedGoodsId);
  if (!finishedGoods) throw new Error(`Finished goods ${finishedGoodsId} not found`);
  const existing = state.dispatch.dispatchOrders.find((record: any) => record.finishedGoodsId === finishedGoodsId);
  if (existing) return state;
  if (!['READY_FOR_DISPATCH', 'AVAILABLE_FOR_DISPATCH'].includes(finishedGoods.status)) {
    throw new Error(`Finished goods ${finishedGoodsId} is not ready for dispatch`);
  }
  const order = state.sales.orders.find((record: any) => record.id === finishedGoods.orderId);
  const dispatchOrder = {
    id: finishedGoods.id.replace(/^FG-/, 'DORD-'),
    finishedGoodsId,
    batchId: finishedGoods.batchId,
    orderId: finishedGoods.orderId,
    customerName: finishedGoods.customerName,
    items: finishedGoods.items.map((item: any) => ({
      orderLineId: item.orderLineId,
      productName: item.productName,
      dispatchableQuantity: item.qcApprovedQuantity - item.dispatchedQuantity,
      unit: item.unit || order?.items.find((line: any) => line.id === item.orderLineId)?.unit || 'Pcs',
    })),
    status: 'READY_FOR_DISPATCH',
    createdAt: new Date().toISOString(),
  };
  return audit({
    ...state,
    production: {
      ...state.production,
      finishedGoods: state.production.finishedGoods.map((record: any) =>
        record.id === finishedGoodsId ? {
          ...record,
          status: 'SENT_TO_DISPATCH',
          items: record.items.map((item: any) => ({
            ...item,
            reservedQuantity: item.qcApprovedQuantity - item.dispatchedQuantity,
          })),
        } : record
      ),
    },
    dispatch: {
      ...state.dispatch,
      dispatchOrders: [...state.dispatch.dispatchOrders, dispatchOrder],
    },
    sales: {
      ...state.sales,
      orders: state.sales.orders.map((record: any) =>
        record.id === finishedGoods.orderId ? { ...record, dispatchStatus: 'READY_FOR_DISPATCH' } : record
      ),
    },
  }, dispatchOrder.id, dispatchOrder.orderId, 'FINISHED_GOODS_SENT_TO_DISPATCH', 'READY_FOR_DISPATCH', actor);
}

export function createDispatch(
  state: ERPState,
  dispatchOrderId: string,
  data: any,
  actor: ActionActor = defaultActor
): ERPState {
  const dispatchState = state.dispatch || ({} as ERPState['dispatch']);
  const dispatchOrders = dispatchState.dispatchOrders || [];
  const consignments = dispatchState.consignments || [];
  const salesOrders = state.sales?.orders || [];
  const dispatchOrder = dispatchOrders.find((record: any) => record.id === dispatchOrderId);
  if (!dispatchOrder) throw new Error(`Dispatch order ${dispatchOrderId} not found`);
  const existing = consignments.find((record: any) => record.dispatchOrderId === dispatchOrderId);
  if (existing) return state;
  const consignment = {
    id: dispatchOrder.orderId.replace(/^ORD-/, 'DSP-'),
    dispatchOrderId,
    finishedGoodsId: dispatchOrder.finishedGoodsId,
    orderId: dispatchOrder.orderId,
    ...data,
    status: 'DISPATCH_CREATED',
    createdAt: new Date().toISOString(),
  };
  return audit({
    ...state,
    dispatch: {
      ...dispatchState,
      dispatchOrders: dispatchOrders.map((record: any) =>
        record.id === dispatchOrderId ? { ...record, status: 'DISPATCH_CREATED' } : record
      ),
      consignments: [...consignments, consignment],
    },
    sales: {
      ...state.sales,
      orders: salesOrders.map((record: any) =>
        record.id === consignment.orderId ? { ...record, dispatchStatus: 'DISPATCH_CREATED' } : record
      ),
    },
  }, consignment.id, consignment.orderId, 'DISPATCH_CREATED', 'DISPATCH_CREATED', actor);
}

export function startDispatchTransit(state: ERPState, consignmentId: string, actor: ActionActor = defaultActor): ERPState {
  const consignment = state.dispatch.consignments.find((record: any) => record.id === consignmentId);
  if (!consignment) throw new Error(`Consignment ${consignmentId} not found`);
  if (consignment.status === 'IN_TRANSIT') return state;
  return audit({
    ...state,
    dispatch: {
      ...state.dispatch,
      consignments: state.dispatch.consignments.map((record: any) =>
        record.id === consignmentId ? { ...record, status: 'IN_TRANSIT' } : record
      ),
    },
    sales: {
      ...state.sales,
      orders: state.sales.orders.map((record: any) =>
        record.id === consignment.orderId ? { ...record, dispatchStatus: 'IN_TRANSIT' } : record
      ),
    },
  }, consignment.id, consignment.orderId, 'DISPATCH_IN_TRANSIT', 'IN_TRANSIT', actor);
}

export function confirmDelivery(state: ERPState, consignmentId: string, data: any, actor: ActionActor = defaultActor): ERPState {
  const consignment = state.dispatch.consignments.find((record: any) => record.id === consignmentId);
  if (!consignment) throw new Error(`Consignment ${consignmentId} not found`);
  if (consignment.status === 'DELIVERED') return state;
  return audit({
    ...state,
    dispatch: {
      ...state.dispatch,
      consignments: state.dispatch.consignments.map((record: any) =>
        record.id === consignmentId ? { ...record, ...data, status: 'DELIVERED' } : record
      ),
    },
    sales: {
      ...state.sales,
      orders: state.sales.orders.map((record: any) =>
        record.id === consignment.orderId
          ? { ...record, dispatchStatus: 'DELIVERED', commercialStatus: 'ORDER_ACTIVE' }
          : record
      ),
    },
  }, consignment.id, consignment.orderId, 'DELIVERY_CONFIRMED', 'DELIVERED', actor);
}
