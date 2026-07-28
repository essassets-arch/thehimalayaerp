/**
 * Himalaya ERP — Complete Sales O2C + Replacement + Return Audit
 *
 * Run: npx tsx scripts/test-complete-sales-o2c.ts
 */
import assert from 'node:assert/strict';
import { useERPStore } from '../store/erpStore';
import {
  selectCanRequestReplacement,
  selectCanRequestReturn,
  selectHasFullReturnCompleted,
} from '../store/domains/sales/salesCalculations';

type Row = Record<string, any>;
type Action = (...args: any[]) => any;

const ids = {
  lead: 'LEAD-HARSH-FULL-001',
  quotation: 'QTN-HARSH-FULL-001',
  order: 'ORD-HARSH-FULL-001',
  orderLine: 'ORDER-LINE-HARSH-FULL-001',
  workOrder: 'WO-HARSH-FULL-001',
  replacement: 'REP-HARSH-FULL-001',
  replacementDispatch: 'RDSP-HARSH-FULL-001',
  return: 'RET-HARSH-FULL-001',
};
const totalQuantity = 100;
const replacementQuantity = 10;
const returnQuantity = 15;
const grandTotal = 204280;

const getState = (): Row => useERPStore.getState() as Row;
const action = (name: string): Action => {
  const state = getState();
  for (const group of [state, state.salesActions, state.productionActions, state.dispatchActions]) {
    if (typeof group?.[name] === 'function') return group[name];
  }
  throw new Error(`Missing action "${name}"`);
};
const byId = (rows: unknown, id: string): Row | undefined =>
  Array.isArray(rows) ? rows.find((row) => row?.id === id) : undefined;
const forOrder = (rows: unknown): Row[] =>
  Array.isArray(rows) ? rows.filter((row) => row?.orderId === ids.order) : [];
const order = (): Row => {
  const value = byId(getState().sales?.orders, ids.order);
  assert.ok(value, `Order ${ids.order} not found`);
  return value;
};
const expectOrder = (expected: Row) => {
  const current = order();
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(current[key], value, `Expected order.${key}=${value}; received ${current[key]}`);
  }
};
const stage = async (name: string, test: () => unknown) => {
  process.stdout.write(`\n▶ ${name}\n`);
  try {
    await test();
    console.log(`  ✅ ${name} passed`);
  } catch (error) {
    console.error(`  ❌ ${name} failed`);
    throw error;
  }
};

async function main() {
  await stage('RESET STATE', () => {
    const current = getState();
    useERPStore.setState({
      ...current,
      sales: {
        ...(current.sales ?? {}),
        leads: [], samples: [], quotations: [], orders: [], paymentConfirmations: [],
        replacementRequests: [], returnRequests: [],
      },
      production: { ...(current.production ?? {}), workOrders: [], qcRecords: [], finishedGoods: [] },
      dispatch: {
        ...(current.dispatch ?? {}),
        dispatchOrders: [], consignments: [], replacementConsignments: [], returnPickups: [],
      },
      auditEvents: [],
    });
    assert.equal(getState().sales.orders.length, 0);
  });

  await stage('CREATE LEAD', () => {
    action('createLead')({
      id: ids.lead,
      companyName: 'Harsh Infrastructure Pvt Ltd',
      customerName: 'Harsh Infrastructure Pvt Ltd',
      contactPerson: 'Harsh Sharma',
      mobile: '9876543210',
      email: 'harsh@example.com',
      projectName: 'Harsh Highway Drainage Project',
      groupName: 'Harsh Group',
      gstName: 'Harsh Infrastructure Private Limited',
      gstNumber: '27AABCH1234F1Z5',
      billingAddress: 'Nagpur, Maharashtra',
      deliveryAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra',
      expectedTransportationCost: 2500,
      status: 'LEAD_CREATED',
    });
    assert.ok(byId(getState().sales.leads, ids.lead));
  });

  await stage('QUOTATION TO ORDER', () => {
    action('createQuotation')({
      id: ids.quotation,
      leadId: ids.lead,
      customerName: 'Harsh Infrastructure Pvt Ltd',
      contactPerson: 'Harsh Sharma',
      deliveryAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra',
      items: [{
        id: 'QTN-LINE-HARSH-FULL-001',
        productId: 'PROD-RCC-600',
        productName: 'RCC Hume Pipe 600mm',
        specification: 'NP3 Grade, Grey, M30',
        quantity: totalQuantity,
        unit: 'Pcs',
        unitPrice: 1800,
        discountPercent: 5,
        gstPercent: 18,
        lineTotal: 201780,
      }],
      transportationCost: 2500,
      grandTotal,
      paymentMilestones: [
        {
          id: 'PM-HARSH-FULL-01',
          label: 'Advance',
          percentage: 50,
          trigger: 'ORDER_CONFIRMATION',
          offsetDays: 0,
        },
        {
          id: 'PM-HARSH-FULL-02',
          label: 'Final Payment',
          percentage: 50,
          trigger: 'ON_DELIVERY',
          offsetDays: 0,
        },
      ],
      status: 'QUOTATION_DRAFT',
    });
    action('sendQuotation')(ids.quotation);
    action('acceptQuotation')(ids.quotation);
    action('convertQuotationToOrder')(ids.quotation);
    action('convertQuotationToOrder')(ids.quotation);
    const orders = getState().sales.orders.filter((row: Row) => row.quotationId === ids.quotation);
    assert.equal(orders.length, 1, 'Quotation conversion must be idempotent');
    ids.order = orders[0].id;
    ids.orderLine = orders[0].items[0].id;
    expectOrder({ commercialStatus: 'ORDER_CONFIRMED', planningStatus: 'NOT_SENT' });
  });

  await stage('PLANT HEAD FLOW', () => {
    action('sendOrderToPlantHead')(ids.order);
    expectOrder({ commercialStatus: 'SENT_TO_PLANT_HEAD', planningStatus: 'PENDING_ACCEPTANCE' });
    action('acceptOrderByPlantHead')(ids.order);
    action('planOrder')(ids.order, {
      targetDate: '2026-08-10',
      priority: 'MEDIUM',
      productionLine: 'LINE-1',
      remarks: 'Produce as per NP3 specification',
    });
    expectOrder({ planningStatus: 'PRODUCTION_PLANNED', productionStatus: 'NOT_STARTED' });
  });

  await stage('PRODUCTION AND QC', () => {
    action('activateWorkOrder')(ids.order);
    action('activateWorkOrder')(ids.order);
    const workOrders = forOrder(getState().production.workOrders);
    assert.equal(workOrders.length, 1, 'Work-order activation must be idempotent');
    ids.workOrder = workOrders[0].id;
    action('startProduction')(ids.workOrder);
    action('completeProduction')(ids.workOrder, {
      producedItems: [{ orderLineId: ids.orderLine, producedQuantity: totalQuantity }],
    });
    action('approveQC')(ids.workOrder, {
      id: 'QC-HARSH-FULL-001',
      batchId: 'BATCH-HARSH-FULL-001',
      items: [{
        orderLineId: ids.orderLine,
        producedQuantity: totalQuantity,
        approvedQuantity: totalQuantity,
        rejectedQuantity: 0,
      }],
    });
    expectOrder({ productionStatus: 'PRODUCTION_COMPLETED', qcStatus: 'QC_APPROVED' });
    assert.equal(forOrder(getState().production.qcRecords).length, 1);
    assert.equal(forOrder(getState().production.finishedGoods).length, 1);
  });

  await stage('DISPATCH AND DELIVERY', () => {
    const finishedGoodsId = forOrder(getState().production.finishedGoods)[0].id;
    action('sendFinishedGoodsToDispatch')(finishedGoodsId);
    action('sendFinishedGoodsToDispatch')(finishedGoodsId);
    const queues = forOrder(getState().dispatch.dispatchOrders);
    assert.equal(queues.length, 1, 'Dispatch queue creation must be idempotent');
    action('createDispatch')(queues[0].id, {
      id: 'DSP-HARSH-FULL-001',
      vehicleNumber: 'MH-31-AB-1234',
      driverName: 'Ramesh Kumar',
      driverPhone: '9876543211',
      transporter: 'Himalaya Own Fleet',
      lrNumber: 'LR-HARSH-FULL-001',
      dispatchDate: '2026-08-11',
    });
    const consignment = forOrder(getState().dispatch.consignments)[0];
    assert.ok(consignment);
    action('startDispatchTransit')(consignment.id);
    action('confirmDelivery')(consignment.id, {
      deliveredAt: '2026-08-12T11:30:00+05:30',
      receivedBy: 'Harsh Sharma',
      remarks: 'Material received in good condition',
    });
    expectOrder({ dispatchStatus: 'DELIVERED', commercialStatus: 'ORDER_ACTIVE' });
  });

  await stage('PAYMENT AND CLOSURE', () => {
    action('recordSalesPayment')(ids.order, {
      id: 'PAY-HARSH-FULL-001',
      amount: grandTotal,
      paymentDate: '2026-08-12',
      method: 'BANK_TRANSFER',
      transactionReference: 'TXN-HARSH-FULL-001',
    });
    const payment = forOrder(getState().sales.paymentConfirmations)[0];
    assert.equal(payment.status, 'FINANCE_VERIFICATION_PENDING');
    action('verifyFinancePayment')(payment.id);
    action('verifyFinancePayment')(payment.id);
    expectOrder({ dispatchStatus: 'DELIVERED', paymentStatus: 'FULLY_PAID', commercialStatus: 'ORDER_CLOSED' });
    const verified = forOrder(getState().sales.paymentConfirmations)
      .filter((row) => row.status === 'FINANCE_VERIFIED')
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    assert.equal(verified, grandTotal);
  });

  await stage('REPLACEMENT FLOW', () => {
    action('requestReplacement')(ids.order, {
      id: ids.replacement,
      items: [{
        orderLineId: ids.orderLine,
        productId: 'PROD-RCC-600',
        productName: 'RCC Hume Pipe 600mm',
        requestedQuantity: replacementQuantity,
        condition: 'DAMAGED_IN_TRANSIT',
        reason: 'Surface damage',
      }],
      pickupRequired: false,
      replacementAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra',
      preferredDate: '2026-08-18',
      remarks: 'Replace damaged pieces',
    });
    action('approveReplacement')(ids.replacement, {
      approvedItems: [{ orderLineId: ids.orderLine, approvedQuantity: replacementQuantity }],
      priority: 'MEDIUM',
      remarks: 'Approved for replacement',
    });
    action('dispatchReplacement')(ids.replacement, {
      id: ids.replacementDispatch,
      vehicleNumber: 'MH-31-RP-1001',
      driverName: 'Suresh',
      dispatchDate: '2026-08-18',
    });
    const requested = byId(getState().sales.replacementRequests, ids.replacement);
    const transitId = requested?.dispatchId ?? ids.replacementDispatch ?? ids.replacement;
    action('startReplacementTransit')(transitId);
    action('confirmReplacementDelivery')(transitId, {
      deliveredAt: '2026-08-19T12:00:00+05:30',
      receivedBy: 'Harsh Sharma',
    });
    assert.equal(byId(getState().sales.replacementRequests, ids.replacement)?.status, 'REPLACEMENT_DELIVERED');
    expectOrder({ dispatchStatus: 'DELIVERED', paymentStatus: 'FULLY_PAID', commercialStatus: 'ORDER_CLOSED' });
  });

  await stage('RETURN FLOW', () => {
    action('requestReturn')(ids.order, {
      id: ids.return,
      items: [{
        orderLineId: ids.orderLine,
        productId: 'PROD-RCC-600',
        productName: 'RCC Hume Pipe 600mm',
        requestedQuantity: returnQuantity,
        condition: 'NOT_REQUIRED',
        reason: 'Client requirement reduced',
      }],
      pickupAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra',
      contactPerson: 'Harsh Sharma',
      preferredPickupDate: '2026-08-22',
      refundExpected: true,
    });
    action('approveReturn')(ids.return, {
      approvedItems: [{ orderLineId: ids.orderLine, approvedQuantity: returnQuantity }],
      remarks: 'Approved for pickup',
    });
    action('assignReturnPickup')(ids.return, {
      vehicleNumber: 'MH-31-RT-2001',
      driverName: 'Mahesh',
      pickupDate: '2026-08-22',
    });
    action('startReturnTransit')(ids.return);
    action('confirmReturnReceipt')(ids.return, {
      receivedAt: '2026-08-23T15:00:00+05:30',
      receivedBy: 'Factory Store',
      receivedItems: [{
        orderLineId: ids.orderLine,
        receivedQuantity: returnQuantity,
        condition: 'GOOD',
      }],
      remarks: 'Return completed',
    });
    assert.equal(byId(getState().sales.returnRequests, ids.return)?.status, 'RETURN_RECEIVED');
    expectOrder({ dispatchStatus: 'DELIVERED', paymentStatus: 'FULLY_PAID', commercialStatus: 'ORDER_CLOSED' });
  });

  await stage('FINAL QUANTITY AND LINKAGE CHECKS', () => {
    const replacement = byId(getState().sales.replacementRequests, ids.replacement);
    const returned = byId(getState().sales.returnRequests, ids.return);
    const replacementTotal = (replacement?.items ?? []).reduce(
      (sum: number, item: Row) => sum + Number(item.approvedQuantity ?? item.requestedQuantity ?? 0), 0);
    const returnTotal = (returned?.items ?? []).reduce(
      (sum: number, item: Row) => sum + Number(item.receivedQuantity ?? item.approvedQuantity ?? item.requestedQuantity ?? 0), 0);
    assert.equal(totalQuantity - replacementTotal - returnTotal, 75);
    assert.equal(selectCanRequestReplacement(getState(), ids.order), true);
    assert.equal(selectCanRequestReturn(getState(), ids.order), true);
    assert.equal(selectHasFullReturnCompleted(getState(), ids.order), false);
    assert.throws(
      () => action('requestReplacement')(ids.order, {
        id: 'REP-HARSH-OVER-LIMIT',
        items: [{
          orderLineId: ids.orderLine,
          productId: 'PROD-RCC-600',
          requestedQuantity: 76,
          reason: 'Must be rejected',
        }],
      }),
      /exceeds available/
    );
    assert.throws(
      () => action('requestReturn')(ids.order, {
        id: 'RET-HARSH-OVER-LIMIT',
        items: [{
          orderLineId: ids.orderLine,
          productId: 'PROD-RCC-600',
          requestedQuantity: 76,
          reason: 'Must be rejected',
        }],
      }),
      /exceeds available/
    );
    assert.equal(forOrder(getState().sales.replacementRequests).length, 1);
    assert.equal(forOrder(getState().sales.returnRequests).length, 1);
    for (const rows of [
      getState().production.workOrders,
      getState().production.qcRecords,
      getState().production.finishedGoods,
      getState().dispatch.dispatchOrders,
      getState().dispatch.consignments,
      getState().sales.paymentConfirmations,
      getState().sales.replacementRequests,
      getState().sales.returnRequests,
    ]) {
      assert.ok(forOrder(rows).every((row) => row.orderId === ids.order));
    }
  });

  console.table({
    orderId: order().id,
    commercialStatus: order().commercialStatus,
    productionStatus: order().productionStatus,
    qcStatus: order().qcStatus,
    dispatchStatus: order().dispatchStatus,
    paymentStatus: order().paymentStatus,
    replacements: forOrder(getState().sales.replacementRequests).length,
    returns: forOrder(getState().sales.returnRequests).length,
  });
  console.log('\n🎉 COMPLETE SALES O2C + REPLACEMENT + RETURN AUDIT PASSED');
}

main().catch((error) => {
  console.error('\n❌ COMPLETE SALES O2C AUDIT FAILED');
  console.error(error);
  process.exitCode = 1;
});
