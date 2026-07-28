import { EVENTS } from '../events';
import { emit } from '../eventBus';
import { addTimelineEvent } from '../utils/timeline';

// Helpers to format notifications & audit logs
const buildNotification = (title, message, department, priority = 'Medium', referenceId = '') => ({
  id: Date.now() + Math.random(),
  title,
  message,
  department,
  priority,
  date: new Date().toISOString().split('T')[0],
  read: false,
  referenceId
});

const buildAuditLog = (user, action, orderNo = '', remarks = '') => ({
  id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
  user: user || 'System',
  action,
  orderNo,
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  remarks
});

export const orderActions = {
  addLead: (leadData, dispatch, currentUser) => {
    // A sample is truly requested only if master toggle is on AND at least one product was enabled
    const enabledSampleItems = (leadData.sampleItems || []).filter(si => si.enabled);
    const hasSampleRequest = leadData.sampleRequired && enabledSampleItems.length > 0;

    const newLead = {
      id: Date.now() + Math.floor(Math.random() * 100),
      ...leadData,
      status: hasSampleRequest ? 'Sample Stage' : 'New',
      timeline: [
        { stage: 'Lead Created', text: 'Lead captured', date: new Date().toISOString().split('T')[0], timestamp: Date.now() }
      ]
    };

    dispatch({ type: 'ADD_LEAD', payload: newLead });
    
    const audit = buildAuditLog(currentUser?.name, 'Lead Created', '', `Lead registered for ${newLead.companyName}`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.LEAD_CREATED, newLead);

    // Only create sample entries if user explicitly toggled samples on for specific products
    if (hasSampleRequest) {
      enabledSampleItems.forEach((si, idx) => {
        orderActions.requestSample({
          leadId: newLead.id,
          leadName: newLead.companyName,
          product: si.productName || leadData.productInterested || 'Sample Prototype',
          quantity: si.quantity || 1,
          expectedDate: si.expectedDate || ''
        }, dispatch, currentUser);
      });
    }
  },

  requestSample: (sampleData, dispatch, currentUser) => {
    const newSample = {
      id: 500 + Math.floor(Math.random() * 500),
      ...sampleData,
      status: 'Pending'
    };

    dispatch({ type: 'ADD_SAMPLE', payload: newSample });
    
    const audit = buildAuditLog(currentUser?.name, 'Sample Requested', '', `Requested sample ${newSample.product} for ${newSample.leadName}`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.SAMPLE_REQUESTED, newSample);
  },

  dispatchSample: (sampleId, courierDetails, dispatch, currentUser) => {
    dispatch({
      type: 'UPDATE_SAMPLE',
      payload: { id: sampleId, status: 'Sent', dispatchDate: new Date().toISOString().split('T')[0], courierDetails }
    });

    const audit = buildAuditLog(currentUser?.name, 'Sample Dispatched', '', `Sample ID ${sampleId} dispatched via courier`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.SAMPLE_DISPATCHED, { sampleId, courierDetails });
  },

  approveSample: (sample, dispatch, currentUser) => {
    dispatch({
      type: 'UPDATE_SAMPLE',
      payload: { id: sample.id, status: 'Approved' }
    });

    // Update lead status
    dispatch({
      type: 'UPDATE_LEAD',
      payload: { id: sample.leadId, status: 'Converted' }
    });

    const audit = buildAuditLog(currentUser?.name, 'Sample Approved', '', `Sample ID ${sample.id} approved by client`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.SAMPLE_APPROVED, sample);
  },

  createQuotation: (qData, dispatch, currentUser) => {
    const newQ = {
      id: 200 + Math.floor(Math.random() * 500),
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
      validTill: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ...qData
    };

    dispatch({ type: 'ADD_QUOTATION', payload: newQ });
    
    const audit = buildAuditLog(currentUser?.name, 'Quotation Generated', '', `Quotation #QTN-${newQ.id} created for ${newQ.customerName}`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.QUOTATION_CREATED, newQ);
  },

  confirmOrder: (qtn, dispatch, currentUser) => {
    const orderNo = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    
    // Build initial order timeline
    let initialOrder = {
      orderNo,
      customer: {
        id: 'CUST-' + Math.floor(100 + Math.random() * 900),
        name: qtn.customerName
      },
      products: qtn.items,
      detailedItems: qtn.detailedItems || [
        { productName: qtn.items, code: 'P-GEN', quantity: qtn.quantity, unitPrice: qtn.price, discount: qtn.discount, tax: qtn.tax }
      ],
      quantity: qtn.quantity || 1,
      salesStatus: 'Confirmed',
      productionStatus: 'Pending',
      plantHeadStatus: 'Pending',
      storeStatus: 'Pending',
      dispatchStatus: 'Pending',
      financeStatus: 'Pending',
      overallStage: EVENTS.ORDER_CONFIRMED,
      timeline: [],
      dispatch: {
        total: qtn.quantity || 1,
        completed: 0,
        remaining: qtn.quantity || 1
      },
      payment: {
        totalAmount: qtn.totalAmount,
        paid: 0,
        outstanding: qtn.totalAmount
      },
      createdAt: Date.now()
    };

    initialOrder = addTimelineEvent(initialOrder, EVENTS.ORDER_CONFIRMED, 'Purchase order confirmed by Sales');

    const invoiceNo = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    const payment = {
      id: Date.now() + Math.random(),
      orderNo,
      customerName: qtn.customerName,
      invoiceNo,
      totalAmount: qtn.totalAmount,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Outstanding',
      verified: 'Pending'
    };

    const customer = {
      id: initialOrder.customer.id,
      name: qtn.customerName,
      email: `${qtn.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@contact.com`,
      phone: '+91 9876543' + Math.floor(10 + Math.random() * 89),
      totalOrders: 1,
      totalRevenue: 0,
      outstanding: qtn.totalAmount,
      address: 'Industrial Plot #42, Phase 3',
      ordersHistory: [{ orderNo, product: qtn.items, val: qtn.totalAmount }],
      communicationLogs: [{ date: new Date().toISOString().split('T')[0], type: 'System', summary: 'Customer record generated from sales quotation conversion' }]
    };

    dispatch({
      type: 'CONFIRM_ORDER',
      payload: { order: initialOrder, payment, customer }
    });

    dispatch({
      type: 'UPDATE_QUOTATION',
      payload: { id: qtn.id, status: 'Converted' }
    });

    // Pushes notification to Production department automatically!
    const notif = buildNotification(
      'New Order Received',
      `Order ${orderNo} confirmed for ${qtn.customerName}. Production scheduled.`,
      'Production',
      'High',
      orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(currentUser?.name, 'Order Confirmed', orderNo, `Purchase Order ${orderNo} confirmed from QTN-${qtn.id}`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    // Emit event for any hooks listening
    emit(EVENTS.ORDER_CONFIRMED, initialOrder);
  }
};
