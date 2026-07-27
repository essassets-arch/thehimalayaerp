import { expect, test } from '@playwright/test';
import {
  getOrderId,
  getWorkOrderId,
  isPlanningHistoryOrder,
  normalizeItems,
  normalizeStatus,
  resolveProducedQuantity,
  selectOrderTimeline,
} from '../../store/domains/shared/workflowUtils';
import { dispatchOrderTabs, resolveDispatchQueue } from '../../store/domains/dispatch/dispatchSelectors';
import { normalizeMaterialLines } from '../../services/production.service';
import { startProduction } from '../../store/domains/sales/salesActions';
import { createDispatch } from '../../store/domains/dispatch/dispatchActions';

test('workflow normalization and safe resolvers', () => {
  expect(normalizeStatus(' production-completed ')).toBe('PRODUCTION_COMPLETED');
  expect(getOrderId({ order_no: 'ORD-1' })).toBe('ORD-1');
  expect(getWorkOrderId({ work_order_id: 'WO-1' })).toBe('WO-1');
  expect(normalizeItems({ items: { productName: 'Pipe' } })).toEqual([{ productName: 'Pipe' }]);
  expect(normalizeItems({ items: 'invalid' })).toEqual([]);
  expect(resolveProducedQuantity({ producedQty: 0 }, { quantity: 100 }, {})).toBe(0);
  expect(resolveProducedQuantity({}, { completedQty: 100 }, {})).toBe(100);
  expect(isPlanningHistoryOrder({ qcStatus: 'QC Approved' })).toBe(true);
});

test('material issue normalization supports flat and grouped requests', () => {
  expect(normalizeMaterialLines({
    id: 'MR-1',
    materialName: 'Cement',
    quantityRequested: 12,
    quantityApproved: 0,
  })).toEqual([expect.objectContaining({
    materialName: 'Cement',
    quantityRequested: 12,
    quantityApproved: 0,
  })]);

  expect(normalizeMaterialLines({
    items: [{ material: 'Sand', approvedQty: 8 }],
  })).toEqual([expect.objectContaining({
    materialName: 'Sand',
    quantityApproved: 8,
  })]);
  expect(normalizeMaterialLines({ id: 'MR-EMPTY' })).toEqual([]);
});

test('local timeline fallback combines canonical linked records', () => {
  const timeline = selectOrderTimeline({
    sales: {
      orders: [{ id: 'ORD-1', sentToPlantHead: true, qcStatus: 'QC_APPROVED', commercialStatus: 'ORDER_CLOSED' }],
      paymentConfirmations: [{ id: 'PAY-1', orderId: 'ORD-1', status: 'FINANCE_VERIFIED' }],
    },
    production: {
      workOrders: [{ id: 'WO-1', orderId: 'ORD-1', status: 'PRODUCTION_COMPLETED' }],
      qcRecords: [{ id: 'QC-1', orderId: 'ORD-1', workOrderId: 'WO-1', status: 'QC_APPROVED' }],
      finishedGoods: [{ id: 'FG-1', orderId: 'ORD-1' }],
    },
    dispatch: {
      consignments: [{ id: 'DSP-1', orderId: 'ORD-1', status: 'DELIVERED' }],
    },
  }, 'ORD-1');
  expect(timeline.map(entry => entry.stage)).toEqual(expect.arrayContaining([
    'Created', 'Confirmed', 'Production Completed', 'QC Passed',
    'Dispatch Planned', 'Delivered', 'Payment Verified', 'Closed',
  ]));
});

test('dispatch resolution never shows zero approved with positive dispatchable quantity', () => {
  const state = {
    sales: { orders: [{ id: 'ORD-HARSH-001', customerName: 'Harsh', items: [{ productName: 'Pipe' }] }] },
    production: {
      workOrders: [{ id: 'WO-HARSH-001', orderId: 'ORD-HARSH-001', qcApprovedQty: 100 }],
      qcRecords: [],
      finishedGoods: [{
        id: 'FG-HARSH-001', orderId: 'ORD-HARSH-001', workOrderId: 'WO-HARSH-001',
        availableQty: 100, reservedQty: 0, dispatchedQty: 0,
      }],
    },
    dispatch: {
      dispatchOrders: [{
        id: 'DORD-HARSH-001', orderId: 'ORD-HARSH-001',
        finishedGoodsId: 'FG-HARSH-001', status: 'READY_FOR_DISPATCH',
      }],
      consignments: [],
    },
  };
  const [record] = resolveDispatchQueue(state);
  expect(record.qcApprovedQty).toBe(100);
  expect(record.dispatchableQty).toBe(100);
  expect(dispatchOrderTabs.find(tab => tab.key === 'ready')?.predicate(record)).toBe(true);
});

test('start production repairs a legacy work order from its canonical order suffix', () => {
  const state: any = {
    sales: {
      leads: [],
      samples: [],
      quotations: [],
      paymentConfirmations: [],
      replacementRequests: [],
      returnRequests: [],
      orders: [{
        id: 'ORD-XDV20S',
        customerName: 'ESS Infrastructure Pvt Ltd',
        productionStatus: 'WORK_ORDER_CREATED',
        items: [{
          id: 'LINE-1',
          productId: 'PROD-RCC-600',
          productName: 'RCC Hume Pipe 600mm',
          specification: 'NP3',
          quantity: 100,
          unit: 'Pcs',
        }],
      }],
    },
    production: {
      workOrders: [{
        id: 'WO-XDV20S',
        quantity: 10,
        status: 'WORK_ORDER_CREATED',
      }],
      qcRecords: [],
      finishedGoods: [],
    },
    dispatch: { dispatchOrders: [], consignments: [] },
    auditEvents: [],
  };

  const next = startProduction(
    state,
    'WO-XDV20S',
    { id: 'PRODUCTION', name: 'Production' }
  );
  const workOrder = next.production.workOrders[0];
  expect(workOrder.orderId).toBe('ORD-XDV20S');
  expect(workOrder.items[0].productName).toBe('RCC Hume Pipe 600mm');
  expect(workOrder.items[0].targetQuantity).toBe(100);
  expect(workOrder.unit).toBe('Pcs');
  expect(workOrder.status).toBe('PRODUCTION_STARTED');
  expect(next.sales.orders[0].productionStatus).toBe('PRODUCTION_STARTED');
});

test('one vehicle trip can contain multiple canonically linked order consignments', () => {
  const base: any = {
    sales: {
      orders: [
        { id: 'ORD-1', dispatchStatus: 'READY_FOR_DISPATCH' },
        { id: 'ORD-2', dispatchStatus: 'READY_FOR_DISPATCH' },
      ],
    },
    production: { workOrders: [], qcRecords: [], finishedGoods: [] },
    dispatch: {
      dispatchOrders: [
        { id: 'DORD-1', orderId: 'ORD-1', finishedGoodsId: 'FG-1', status: 'READY_FOR_DISPATCH' },
        { id: 'DORD-2', orderId: 'ORD-2', finishedGoodsId: 'FG-2', status: 'READY_FOR_DISPATCH' },
      ],
      consignments: [],
    },
    auditEvents: [],
  };
  const actor = { id: 'DISPATCH', name: 'Dispatch' };
  const first = createDispatch(base, 'DORD-1', {
    id: 'TRIP-1-1',
    tripId: 'TRIP-1',
    vehicleNumber: 'UK-07-CB-1234',
    quantity: 10,
  }, actor);
  const second = createDispatch(first, 'DORD-2', {
    id: 'TRIP-1-2',
    tripId: 'TRIP-1',
    vehicleNumber: 'UK-07-CB-1234',
    quantity: 20,
  }, actor);

  expect(second.dispatch.consignments).toHaveLength(2);
  expect(second.dispatch.consignments.every((row: any) => row.tripId === 'TRIP-1')).toBe(true);
  expect(second.dispatch.consignments.map((row: any) => row.orderId)).toEqual(['ORD-1', 'ORD-2']);
  expect(second.sales.orders.every((row: any) => row.dispatchStatus === 'DISPATCH_CREATED')).toBe(true);
});
