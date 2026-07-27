import { EVENTS } from '../events';
import { emit } from '../eventBus';
import { addTimelineEvent } from '../utils/timeline';

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

export const financeActions = {
  receivePayment: (invoice, paymentDetails, dispatch, currentUser) => {
    const paymentUpdate = {
      id: invoice.id,
      paidAmount: invoice.paidAmount,
      status: 'Outstanding',
      verified: 'Pending',
      paymentMode: paymentDetails.mode,
      referenceNo: paymentDetails.refNo,
      notes: paymentDetails.notes
    };

    dispatch({
      type: 'RECEIVE_PAYMENT',
      payload: { paymentUpdate }
    });

    const notif = buildNotification(
      'Payment Clear Request',
      `Payment proof submitted for Invoice #${invoice.invoiceNo} (₹${Number(paymentDetails.amount).toLocaleString('en-IN')}). Finance review required.`,
      'Finance',
      'Medium',
      invoice.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Payment Proof Logged', 
      invoice.orderNo, 
      `Mode: ${paymentDetails.mode}. Ref No: ${paymentDetails.refNo}. Amount: ₹${Number(paymentDetails.amount).toLocaleString('en-IN')}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.PAYMENT_RECEIVED, { invoice, paymentDetails });
  },

  verifyPayment: (paymentId, amountVerified, order, dispatch, currentUser) => {
    dispatch({
      type: 'VERIFY_PAYMENT',
      payload: { paymentId, amountVerified }
    });

    
    // Trigger notification and audit logs
    const notif = buildNotification(
      'Payment Receipt Verified',
      `Finance verified payment of ₹${amountVerified.toLocaleString('en-IN')} for Order ${order.orderNo}.`,
      'Sales',
      'Medium',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Payment Verified', 
      order.orderNo, 
      `Verified receipt value of ₹${amountVerified.toLocaleString('en-IN')} on invoice`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    // Calculate if order needs closure:
    // Let's grab the updated paid amount
    const totalValue = order.payment?.totalAmount || order.totalValue;
    const currentPaid = (order.payment?.paid || 0) + amountVerified;
    const isPaidInFull = currentPaid >= totalValue;
    const isDispatchedInFull = order.dispatchStatus === 'Delivered';

    let updatedOrder = {
      ...order,
      payment: {
        ...order.payment,
        paid: currentPaid,
        outstanding: Math.max(0, totalValue - currentPaid)
      },
      financeStatus: isPaidInFull ? 'Paid' : 'Partial'
    };

    updatedOrder = addTimelineEvent(
      updatedOrder, 
      EVENTS.PAYMENT_RECEIVED, 
      `Verified payment receipt of ₹${amountVerified.toLocaleString('en-IN')}`
    );

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    emit(EVENTS.PAYMENT_RECEIVED, { order: updatedOrder, amountVerified });

    // Check Auto Close Conditions
    if (isPaidInFull && isDispatchedInFull) {
      financeActions.closeOrder(updatedOrder, dispatch, currentUser);
    }
  },

  closeOrder: (order, dispatch, currentUser) => {
    let closedOrder = {
      ...order,
      overallStage: EVENTS.ORDER_CLOSED
    };
    closedOrder = addTimelineEvent(closedOrder, EVENTS.ORDER_CLOSED, 'Order fully completed, payments verified, outstanding zeroed, order closed safely.');

    dispatch({ type: 'UPDATE_ORDER', payload: closedOrder });

    const notif = buildNotification(
      'Order Closed Successfully',
      `Order ${order.orderNo} has been successfully closed. All compliance cleared.`,
      'Sales',
      'Medium',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(currentUser?.name, 'Order Closed', order.orderNo, 'Order marked closed in ERP database');
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.ORDER_CLOSED, closedOrder);
  },

  recordExpense: (expenseData, dispatch, currentUser) => {
    const expense = {
      id: Date.now() + Math.floor(Math.random() * 100),
      item: expenseData.item,
      amount: Number(expenseData.amount),
      date: expenseData.date || new Date().toISOString().split('T')[0],
      category: expenseData.category || 'Operations'
    };

    dispatch({ type: 'RECORD_EXPENSE', payload: expense });

    const audit = buildAuditLog(
      currentUser?.name,
      'Procurement Expense Recorded',
      '',
      `Logged expense of ₹${expense.amount.toLocaleString('en-IN')} for ${expense.item}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });
  }
};
