import assert from 'node:assert/strict';
import * as sales from '../store/domains/sales/salesActions';
import * as production from '../store/domains/production/productionActions';
import * as dispatch from '../store/domains/dispatch/dispatchActions';

const salesActor = { id: 'SALES', name: 'Sales User' };
const plantActor = { id: 'PLANT', name: 'Plant Head' };
const productionActor = { id: 'PRODUCTION', name: 'Production' };
const qcActor = { id: 'QC', name: 'QC' };
const dispatchActor = { id: 'DISPATCH', name: 'Dispatch' };
const financeActor = { id: 'FINANCE', name: 'Finance', department: 'Finance' };

let state: sales.ERPState = {
  sales: {
    leads: [],
    samples: [],
    quotations: [],
    orders: [],
    paymentConfirmations: [],
    replacementRequests: [],
    returnRequests: [],
  },
  production: {
    workOrders: [],
    qcRecords: [],
    finishedGoods: [],
  },
  dispatch: {
    dispatchOrders: [],
    consignments: [],
  },
  auditEvents: [],
};

const lead = {
  id: 'LEAD-HARSH-001',
  companyName: 'Harsh Infrastructure Pvt Ltd',
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
};
[state] = sales.createLead(state, lead, salesActor);
for (const status of [
  'LEAD_ASSIGNED',
  'CUSTOMER_CONTACTED',
  'MEETING_COMPLETED',
  'REQUIREMENT_RECEIVED',
  'REQUIREMENT_APPROVED',
  'NO_SAMPLE',
] as const) {
  state = sales.updateLeadStatus(state, lead.id, status, salesActor);
}

const quotation: any = {
  id: 'QTN-HARSH-001',
  leadId: lead.id,
  customerName: lead.companyName,
  groupName: lead.groupName,
  gstName: lead.gstName,
  gstNumber: lead.gstNumber,
  billingAddress: lead.billingAddress,
  deliveryAddress: lead.deliveryAddress,
  contactPerson: lead.contactPerson,
  expectedTransportationCost: 2500,
  transportationCost: 2500,
  items: [{
    id: 'QTN-LINE-HARSH-001',
    productId: 'PROD-RCC-600',
    productName: 'RCC Hume Pipe 600mm',
    specification: 'NP3 Grade, Grey, M30',
    specifications: 'NP3 Grade, Grey, M30',
    quantity: 100,
    unit: 'Pcs',
    unitPrice: 1800,
    discountPercent: 5,
    discountPercentage: 5,
    gstPercent: 18,
    gstPercentage: 18,
    taxableValue: 171000,
    gstValue: 30780,
    lineTotal: 201780,
    totalAmount: 201780,
  }],
  paymentMilestones: [
    { id: 'PM-HARSH-01', label: 'Advance', percentage: 50, trigger: 'ORDER_CONFIRMATION', offsetDays: 0 },
    { id: 'PM-HARSH-02', label: 'Final Payment', percentage: 50, trigger: 'ON_DELIVERY', offsetDays: 0 },
  ],
  grandTotal: 204280,
};
[state] = sales.createQuotation(state, quotation, salesActor);
state = sales.updateQuotationStatus(state, quotation.id, 'QUOTATION_SENT', salesActor);
state = sales.updateQuotationStatus(state, quotation.id, 'QUOTATION_APPROVED', salesActor);

let orderId: string;
[state, orderId] = sales.convertQuotationToOrder(state, quotation.id, salesActor);
assert.equal(orderId, 'ORD-HARSH-001');
const orderLine = state.sales.orders[0].items[0] as any;
orderLine.id = 'ORDER-LINE-HARSH-001';

state = sales.sendOrderToPlantHead(state, orderId, {}, salesActor);
state = sales.acceptOrderByPlantHead(state, orderId, {}, plantActor);
state = sales.planOrder(state, orderId, {
  targetDate: '2026-08-10',
  priority: 'MEDIUM',
  productionLine: 'LINE-1',
  remarks: 'Produce as per NP3 specification',
}, plantActor);

state = production.activateWorkOrder(state, orderId, productionActor);
state = production.activateWorkOrder(state, orderId, productionActor);
const workOrderId = state.production.workOrders.find((record: any) => record.orderId === orderId)?.id;
assert.ok(workOrderId);
state = production.startProduction(state, workOrderId, productionActor);
state = production.completeProduction(state, workOrderId, {
  producedItems: [{ orderLineId: 'ORDER-LINE-HARSH-001', producedQuantity: 100 }],
}, productionActor);
state = production.approveQC(state, workOrderId, {
  items: [{
    orderLineId: 'ORDER-LINE-HARSH-001',
    producedQuantity: 100,
    approvedQuantity: 100,
    rejectedQuantity: 0,
  }],
}, qcActor);

const finishedGoodsId = state.production.finishedGoods.find((record: any) => record.orderId === orderId)?.id;
assert.ok(finishedGoodsId);
state = dispatch.sendFinishedGoodsToDispatch(state, finishedGoodsId, dispatchActor);
state = dispatch.sendFinishedGoodsToDispatch(state, finishedGoodsId, dispatchActor);
const dispatchOrderId = state.dispatch.dispatchOrders.find((record: any) => record.orderId === orderId)?.id;
assert.ok(dispatchOrderId);
state = dispatch.createDispatch(state, dispatchOrderId, {
  vehicleNumber: 'MH-31-AB-1234',
  driverName: 'Ramesh Kumar',
  driverPhone: '9876543211',
  transporter: 'Himalaya Own Fleet',
  lrNumber: 'LR-HARSH-001',
  dispatchDate: '2026-08-11',
}, dispatchActor);
const consignmentId = state.dispatch.consignments.find((record: any) => record.orderId === orderId)?.id;
assert.ok(consignmentId);
state = dispatch.startDispatchTransit(state, consignmentId, dispatchActor);
state = dispatch.confirmDelivery(state, consignmentId, {
  deliveredAt: '2026-08-12T11:30:00+05:30',
  receivedBy: 'Harsh Sharma',
  remarks: 'Material received in good condition',
}, dispatchActor);

let paymentId: string;
[state, paymentId] = sales.recordSalesPayment(state, orderId, {
  amount: 204280,
  paymentDate: '2026-08-12',
  method: 'BANK_TRANSFER',
  transactionReference: 'TXN-HARSH-001',
}, salesActor);
assert.equal(paymentId, 'PAY-HARSH-001');
state = sales.verifyFinancePayment(state, paymentId, financeActor);

const order = state.sales.orders.find((record) => record.id === orderId)!;
assert.equal(order.dispatchStatus, 'DELIVERED');
assert.equal(order.paymentStatus, 'FULLY_PAID');
assert.equal(order.commercialStatus, 'ORDER_CLOSED');

const linkedRecords = [
  ...state.production.workOrders,
  ...state.production.qcRecords,
  ...state.production.finishedGoods,
  ...state.dispatch.dispatchOrders,
  ...state.dispatch.consignments,
  ...state.sales.paymentConfirmations,
];
assert.ok(linkedRecords.length > 0);
assert.ok(linkedRecords.every((record) => record.orderId === orderId));

for (const [name, records] of Object.entries({
  leads: state.sales.leads,
  quotations: state.sales.quotations,
  orders: state.sales.orders,
  workOrders: state.production.workOrders,
  qcRecords: state.production.qcRecords,
  finishedGoods: state.production.finishedGoods,
  dispatchOrders: state.dispatch.dispatchOrders,
  consignments: state.dispatch.consignments,
  paymentConfirmations: state.sales.paymentConfirmations,
})) {
  assert.equal(new Set(records.map((record: any) => record.id)).size, records.length, `${name} contains duplicate IDs`);
}

console.log('Harsh O2C audit passed');
console.log(JSON.stringify({
  orderId: order.id,
  dispatchStatus: order.dispatchStatus,
  paymentStatus: order.paymentStatus,
  commercialStatus: order.commercialStatus,
  linkedRecords: linkedRecords.length,
}, null, 2));
