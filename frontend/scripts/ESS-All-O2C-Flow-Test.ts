/**
 * ESS — Complete Sales Order, Replacement & Return Flow Audit
 *
 * Run: npx tsx scripts/ESS-All-O2C-Flow-Test.ts
 */
import assert from 'node:assert/strict';
import { useERPStore } from '../store/erpStore';
import {
  selectCanRequestReplacement,
  selectCanRequestReturn,
} from '../store/domains/sales/salesCalculations';

type Row = Record<string, any>;
type Action = (...args: any[]) => any;

const ids = {
  lead: 'LEAD-ESS-001',
  quotation: 'QTN-ESS-001',
  order: 'ORD-ESS-001',
  orderLine: 'ORDER-LINE-ESS-001',
  workOrder: 'WO-ESS-001',
  replacement: 'REP-ESS-001',
  replacementDispatch: 'RDSP-ESS-001',
  return: 'RET-ESS-001',
};
const TOTAL_QTY = 100;
const REPLACEMENT_QTY = 10;
const RETURN_QTY = 15;
const GRAND_TOTAL = 204280;

const state = (): Row => useERPStore.getState() as Row;
const action = (name: string): Action => {
  const current = state();
  for (const group of [current, current.salesActions, current.productionActions, current.dispatchActions]) {
    if (typeof group?.[name] === 'function') return group[name];
  }
  throw new Error(`Missing action "${name}"`);
};
const byId = (rows: unknown, id: string): Row | undefined =>
  Array.isArray(rows) ? rows.find((row) => row?.id === id) : undefined;
const forOrder = (rows: unknown): Row[] =>
  Array.isArray(rows) ? rows.filter((row) => row?.orderId === ids.order) : [];
const expectOrder = (expected: Row) => {
  const order = byId(state().sales?.orders, ids.order);
  assert.ok(order, `Order ${ids.order} not found`);
  for (const [field, value] of Object.entries(expected)) {
    assert.equal(order[field], value, `Expected order.${field}=${value}; received ${order[field]}`);
  }
};
const stage = async (name: string, test: () => unknown) => {
  console.log(`\n▶ ${name}`);
  await test();
  console.log(`  ✅ ${name} passed`);
};

async function main() {
  await stage('RESET STATE', () => {
    const current = state();
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
    assert.equal(state().sales.orders.length, 0);
  });

  await stage('LEAD → QUOTATION → ORDER', () => {
    action('createLead')({
      id: ids.lead,
      companyName: 'ESS Infrastructure Pvt Ltd',
      contactPerson: 'ESS Contact',
      phone: '9876543210',
      siteInchargeName: 'ESS Contact',
      siteInchargeMobile: '9876543210',
      email: 'ess@example.com',
      projectName: 'ESS Highway Drainage Project',
      groupName: 'ESS Group',
      gstName: 'ESS Infrastructure Private Limited',
      gstNumber: '27AABCE1234F1Z5',
      address: {
        line1: 'Site No. 5, NH-44',
        city: 'Nagpur',
        state: 'Maharashtra',
        country: 'India',
        pincode: '440001',
      },
      detailedItems: [{
        productName: 'RCC Hume Pipe 600mm',
        specification: 'NP3 Grade, Grey, M30',
        quantity: TOTAL_QTY,
        unitPrice: 1800,
      }],
      expectedTransportationCost: 2500,
      status: 'LEAD_CREATED',
    });
    const lead = byId(state().sales.leads, ids.lead);
    assert.ok(lead);
    assert.equal(lead.companyName, 'ESS Infrastructure Pvt Ltd');
    assert.equal(lead.phone, '9876543210');
    assert.equal(lead.mobile, '9876543210');
    assert.equal(lead.detailedItems.length, 1);
    assert.match(lead.deliveryAddress, /Nagpur/);
    for (const status of [
      'LEAD_ASSIGNED',
      'CUSTOMER_CONTACTED',
      'MEETING_COMPLETED',
      'REQUIREMENT_RECEIVED',
      'REQUIREMENT_APPROVED',
      'NO_SAMPLE',
    ]) {
      action('updateLeadStatus')(ids.lead, status);
    }

    action('createQuotation')({
      id: ids.quotation,
      leadId: ids.lead,
      customerName: 'ESS Infrastructure Pvt Ltd',
      contactPerson: 'ESS Contact',
      gstName: 'ESS Infrastructure Private Limited',
      gstNumber: '27AABCE1234F1Z5',
      billingAddress: 'Nagpur, Maharashtra',
      deliveryAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra',
      items: 'RCC Hume Pipe 600mm (NP3 Grade, Grey, M30) (x100)',
      detailedItems: [{
        id: 'QTN-LINE-ESS-001',
        productId: 'PROD-RCC-600',
        productName: 'RCC Hume Pipe 600mm',
        productDetails: 'NP3 Grade, Grey, M30',
        quantity: TOTAL_QTY,
        unitPrice: 1800,
        discount: 5,
        tax: 18,
      }],
      transportationCost: 2500,
      expectedTransportationCost: 2500,
      totalAmount: GRAND_TOTAL,
      paymentTerms: '30 Days',
      status: 'QUOTATION_DRAFT',
    });
    const quotation = byId(state().sales.quotations, ids.quotation);
    assert.ok(Array.isArray(quotation?.items));
    assert.equal(quotation?.items.length, 1);
    assert.equal(quotation?.items[0].specification, 'NP3 Grade, Grey, M30');
    assert.equal(quotation?.grandTotal, GRAND_TOTAL);
    action('sendQuotation')(ids.quotation);
    action('acceptQuotation')(ids.quotation);
    assert.equal(byId(state().sales.quotations, ids.quotation)?.status, 'QUOTATION_APPROVED');

    action('convertQuotationToOrder')(ids.quotation);
    action('convertQuotationToOrder')(ids.quotation);
    const orders = state().sales.orders.filter((row: Row) => row.quotationId === ids.quotation);
    assert.equal(orders.length, 1, 'Quotation conversion must be idempotent');
    ids.order = orders[0].id;
    ids.orderLine = orders[0].items[0].id;
    expectOrder({
      commercialStatus: 'ORDER_CONFIRMED',
      planningStatus: 'NOT_SENT',
      productionStatus: 'NOT_STARTED',
    });
  });

  await stage('PLANT HEAD → PRODUCTION → QC', () => {
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

    action('activateWorkOrder')(ids.order);
    action('activateWorkOrder')(ids.order);
    const workOrders = forOrder(state().production.workOrders);
    assert.equal(workOrders.length, 1, 'Work-order activation must be idempotent');
    ids.workOrder = workOrders[0].id;
    assert.equal(workOrders[0].orderId, ids.order);
    assert.equal(workOrders[0].items[0].productName, 'RCC Hume Pipe 600mm');
    assert.equal(workOrders[0].items[0].targetQuantity, TOTAL_QTY);
    assert.equal(workOrders[0].items[0].unit, 'Pcs');
    action('startProduction')(ids.workOrder);
    assert.equal(byId(state().production.workOrders, ids.workOrder)?.status, 'PRODUCTION_STARTED');
    expectOrder({ productionStatus: 'PRODUCTION_STARTED' });
    action('completeProduction')(ids.workOrder, {
      producedItems: [{ orderLineId: ids.orderLine, producedQuantity: TOTAL_QTY }],
      producedQty: TOTAL_QTY,
      batchNo: 'BATCH-ESS-001',
    });
    const completedWorkOrder = byId(state().production.workOrders, ids.workOrder);
    assert.equal(completedWorkOrder?.status, 'PRODUCTION_COMPLETED');
    assert.equal(completedWorkOrder?.producedQty, TOTAL_QTY);
    assert.equal(completedWorkOrder?.batchNo, 'BATCH-ESS-001');
    expectOrder({ productionStatus: 'PRODUCTION_COMPLETED', qcStatus: 'QC_PENDING' });
    action('approveQC')(ids.workOrder, {
      id: 'QC-ESS-001',
      batchId: 'BATCH-ESS-001',
      items: [{
        orderLineId: ids.orderLine,
        producedQuantity: TOTAL_QTY,
        approvedQuantity: TOTAL_QTY,
        rejectedQuantity: 0,
      }],
    });
    expectOrder({ productionStatus: 'PRODUCTION_COMPLETED', qcStatus: 'QC_APPROVED' });
    assert.equal(forOrder(state().production.qcRecords).length, 1);
    assert.equal(forOrder(state().production.finishedGoods).length, 1);
  });

  await stage('FINISHED GOODS → DISPATCH → DELIVERY', () => {
    const finishedGoodsId = forOrder(state().production.finishedGoods)[0].id;
    action('sendFinishedGoodsToDispatch')(finishedGoodsId);
    action('sendFinishedGoodsToDispatch')(finishedGoodsId);
    const queue = forOrder(state().dispatch.dispatchOrders);
    assert.equal(queue.length, 1, 'Dispatch queue creation must be idempotent');
    action('createDispatch')(queue[0].id, {
      id: 'DSP-ESS-001',
      vehicleNumber: 'MH-31-AB-1234',
      driverName: 'Ramesh Kumar',
      driverPhone: '9876543211',
      transporter: 'Himalaya Own Fleet',
      lrNumber: 'LR-ESS-001',
      dispatchDate: '2026-08-11',
    });
    const consignment = forOrder(state().dispatch.consignments)[0];
    assert.ok(consignment);
    action('startDispatchTransit')(consignment.id);
    expectOrder({ dispatchStatus: 'IN_TRANSIT' });
    action('confirmDelivery')(consignment.id, {
      deliveredAt: '2026-08-12T11:30:00+05:30',
      receivedBy: 'ESS Contact',
      remarks: 'Material received in good condition',
    });
    expectOrder({ dispatchStatus: 'DELIVERED', commercialStatus: 'ORDER_ACTIVE' });
  });

  await stage('PAYMENT → FINANCE VERIFICATION → CLOSURE', () => {
    action('recordSalesPayment')(ids.order, {
      id: 'PAY-ESS-001',
      amount: GRAND_TOTAL,
      paymentDate: '2026-08-12',
      method: 'BANK_TRANSFER',
      transactionReference: 'TXN-ESS-001',
    });
    const payment = forOrder(state().sales.paymentConfirmations)[0];
    assert.equal(payment.status, 'FINANCE_VERIFICATION_PENDING');
    action('verifyFinancePayment')(payment.id);
    action('verifyFinancePayment')(payment.id);
    expectOrder({
      dispatchStatus: 'DELIVERED',
      paymentStatus: 'FULLY_PAID',
      commercialStatus: 'ORDER_CLOSED',
    });
    const verifiedTotal = forOrder(state().sales.paymentConfirmations)
      .filter((row) => row.status === 'FINANCE_VERIFIED')
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    assert.equal(verifiedTotal, GRAND_TOTAL, 'Finance verification must be idempotent');
  });

  await stage('REPLACEMENT REQUEST → DELIVERY', () => {
    action('requestReplacement')(ids.order, {
      id: ids.replacement,
      items: [{
        orderLineId: ids.orderLine,
        productId: 'PROD-RCC-600',
        productName: 'RCC Hume Pipe 600mm',
        requestedQuantity: REPLACEMENT_QTY,
        condition: 'DAMAGED_IN_TRANSIT',
        reason: 'Surface damage',
      }],
      pickupRequired: false,
      replacementAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra',
      preferredDate: '2026-08-18',
      remarks: 'Replace damaged pieces',
    });
    action('approveReplacement')(ids.replacement, {
      approvedItems: [{ orderLineId: ids.orderLine, approvedQuantity: REPLACEMENT_QTY }],
      source: 'FINISHED_GOODS',
      priority: 'MEDIUM',
      expectedReadyDate: '2026-08-18',
      remarks: 'Approved',
    });
    action('dispatchReplacement')(ids.replacement, {
      id: ids.replacementDispatch,
      vehicleNumber: 'MH-31-RP-1001',
      driverName: 'Suresh',
      dispatchDate: '2026-08-18',
    });
    const request = byId(state().sales.replacementRequests, ids.replacement);
    const dispatchId = request?.dispatchId ?? ids.replacementDispatch;
    action('startReplacementTransit')(dispatchId);
    action('confirmReplacementDelivery')(dispatchId, {
      deliveredAt: '2026-08-19T12:00:00+05:30',
      receivedBy: 'ESS Contact',
    });
    assert.equal(byId(state().sales.replacementRequests, ids.replacement)?.status, 'REPLACEMENT_DELIVERED');
    expectOrder({ dispatchStatus: 'DELIVERED', paymentStatus: 'FULLY_PAID', commercialStatus: 'ORDER_CLOSED' });
  });

  await stage('RETURN REQUEST → FACTORY RECEIPT', () => {
    action('requestReturn')(ids.order, {
      id: ids.return,
      items: [{
        orderLineId: ids.orderLine,
        productId: 'PROD-RCC-600',
        productName: 'RCC Hume Pipe 600mm',
        requestedQuantity: RETURN_QTY,
        condition: 'NOT_REQUIRED',
        reason: 'Client requirement reduced',
      }],
      pickupAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra',
      contactPerson: 'ESS Contact',
      preferredPickupDate: '2026-08-22',
      refundExpected: true,
      replacementExpected: false,
    });
    action('approveReturn')(ids.return, {
      approvedItems: [{ orderLineId: ids.orderLine, approvedQuantity: RETURN_QTY }],
      returnDestination: 'Haridwar Factory',
      inspectionRequired: true,
      remarks: 'Approved for pickup',
    });
    action('assignReturnPickup')(ids.return, {
      vehicleNumber: 'MH-31-RT-2001',
      driverName: 'Mahesh',
      driverPhone: '9876543233',
      pickupDate: '2026-08-22',
    });
    action('startReturnTransit')(ids.return);
    action('confirmReturnReceipt')(ids.return, {
      receivedAt: '2026-08-23T15:00:00+05:30',
      receivedBy: 'Factory Store',
      receivedItems: [{
        orderLineId: ids.orderLine,
        receivedQuantity: RETURN_QTY,
        condition: 'GOOD',
      }],
      inspectionNotes: 'Material received and verified',
    });
    assert.equal(byId(state().sales.returnRequests, ids.return)?.status, 'RETURN_RECEIVED');
    expectOrder({ dispatchStatus: 'DELIVERED', paymentStatus: 'FULLY_PAID', commercialStatus: 'ORDER_CLOSED' });
  });

  await stage('QUANTITY RULE AND CANONICAL LINKAGE', () => {
    assert.equal(selectCanRequestReplacement(state(), ids.order), true);
    assert.equal(selectCanRequestReturn(state(), ids.order), true);
    for (const [kind, create] of [
      ['replacement', () => action('requestReplacement')(ids.order, {
        id: 'REP-ESS-OVER-LIMIT',
        items: [{ orderLineId: ids.orderLine, productId: 'PROD-RCC-600', requestedQuantity: 76 }],
      })],
      ['return', () => action('requestReturn')(ids.order, {
        id: 'RET-ESS-OVER-LIMIT',
        items: [{ orderLineId: ids.orderLine, productId: 'PROD-RCC-600', requestedQuantity: 76 }],
      })],
    ] as const) {
      assert.throws(create, /exceeds available/, `Over-limit ${kind} must be rejected`);
    }
    assert.equal(forOrder(state().sales.replacementRequests).length, 1);
    assert.equal(forOrder(state().sales.returnRequests).length, 1);
    for (const rows of [
      state().production.workOrders,
      state().production.qcRecords,
      state().production.finishedGoods,
      state().dispatch.dispatchOrders,
      state().dispatch.consignments,
      state().sales.paymentConfirmations,
      state().sales.replacementRequests,
      state().sales.returnRequests,
    ]) {
      assert.ok(forOrder(rows).every((row) => row.orderId === ids.order));
    }
    assert.equal(TOTAL_QTY - REPLACEMENT_QTY - RETURN_QTY, 75);
  });

  const order = byId(state().sales.orders, ids.order);
  console.log('\n=== ESS FINAL RESULT ===');
  console.table({
    orderId: order?.id,
    customer: order?.customerName,
    commercialStatus: order?.commercialStatus,
    planningStatus: order?.planningStatus,
    productionStatus: order?.productionStatus,
    qcStatus: order?.qcStatus,
    dispatchStatus: order?.dispatchStatus,
    paymentStatus: order?.paymentStatus,
    replacementStatus: byId(state().sales.replacementRequests, ids.replacement)?.status,
    returnStatus: byId(state().sales.returnRequests, ids.return)?.status,
    remainingEligibleQuantity: TOTAL_QTY - REPLACEMENT_QTY - RETURN_QTY,
  });
  console.log('\n🎉 ESS ALL SALES ORDER + REPLACEMENT + RETURN TESTS PASSED');
}

main().catch((error: unknown) => {
  console.error('\n❌ ESS FLOW TEST FAILED');
  console.error(error);
  process.exitCode = 1;
});
