import { EVENTS } from '../events';
import { emit } from '../eventBus';
import { addTimelineEvent } from '../utils/timeline';
import { ERPError, ERPSuccess } from '../utils/errors';
import { validateTransition } from '../utils/stateGuard';
import { generateUniqueId } from '../utils/idGenerator';

const buildNotification = (title, message, department, priority = 'Medium', referenceId = '') => ({
  id: generateUniqueId('NOT'),
  title,
  message,
  department,
  priority,
  date: new Date().toISOString().split('T')[0],
  read: false,
  referenceId
});

const buildAuditLog = (user, action, entityId, entityType, fromStatus, toStatus, remarks = '') => ({
  id: generateUniqueId('AUD'),
  user: user || 'System',
  action,
  entityId,
  entityType,
  fromStatus,
  toStatus,
  remarks,
  timestamp: Date.now(),
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
});

export const financeOrchestrator = {
  receivePayment: (state, invoice, paymentDetails, dispatch, currentUser) => {
    if (currentUser?.role !== 'Sales' &&
        currentUser?.role !== 'Sales Executive' &&
        currentUser?.role !== 'Super Admin' &&
        currentUser?.role !== 'Finance' &&
        currentUser?.role !== 'finance-lead' &&
        currentUser?.role !== 'finance-executive') {
      return ERPError('Unauthorized: Only Sales or Finance roles can submit payment logs.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === invoice.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    // Concurrency check (optimistic lock)
    if (order.status !== 'Delivered' && order.status !== 'Payment Pending' && order.status !== 'Partially Delivered') {
      return ERPError(`Concurrency Block: Cannot record payment. Current status is "${order.status}", expected "Payment Pending" or "Partially Delivered".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'Payment Pending');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

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
      payload: { paymentUpdate, orderNo: invoice.orderNo }
    });

    let updatedOrder = {
      ...order,
      status: 'Payment Pending',
      overallStage: 'Payment Pending',
      currentDepartment: 'Finance'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'Payment Pending', `Payment proof logged. Mode: ${paymentDetails.mode}. Ref: ${paymentDetails.refNo}. Awaiting Finance verification.`);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

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
      invoice.id, 
      'PAYMENT', 
      order.status, 
      'Payment Pending', 
      `Mode: ${paymentDetails.mode}. Ref No: ${paymentDetails.refNo}. Amount: ₹${Number(paymentDetails.amount).toLocaleString('en-IN')}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'PAYMENT',
        entityId: invoice.id,
        action: 'PAYMENT_PENDING',
        payload: { paymentUpdate, invoice },
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.PAYMENT_PENDING, { invoice, paymentDetails });
    return ERPSuccess(paymentUpdate);
  },

  verifyPayment: (state, paymentId, amountVerified, order, dispatch, currentUser) => {
    if (currentUser?.role !== 'Finance' &&
        currentUser?.role !== 'Super Admin' &&
        !financeOrchestrator.canVerifyPayment(currentUser?.role)) {
      return ERPError('Unauthorized: Only Finance Manager role can verify payments.', 'UNAUTHORIZED');
    }

    // Concurrency check (optimistic lock)
    if (order.status !== 'Payment Pending' && order.status !== 'Partially Delivered') {
      return ERPError(`Concurrency Block: Cannot verify payment. Order status is "${order.status}", expected "Payment Pending" or "Partially Delivered".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'Payment Verified');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    dispatch({
      type: 'VERIFY_PAYMENT',
      payload: { paymentId, amountVerified }
    });

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
      paymentId, 
      'PAYMENT', 
      order.status, 
      'Payment Verified', 
      `Verified receipt value of ₹${amountVerified.toLocaleString('en-IN')} on invoice`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    const totalValue = order.payment?.totalAmount || order.totalValue;
    const currentPaid = (order.payment?.paid || 0) + amountVerified;
    const isPaidInFull = currentPaid >= totalValue;

    // Derived delivery check
    const totalDelivered = (state.dispatches || [])
      .filter(d => d.status === 'Delivered')
      .flatMap(d => d.dispatchItems || [])
      .filter(di => di.orderNo === order.orderNo)
      .reduce((sum, di) => sum + Number(di.qty), 0);
    const isDeliveredInFull = totalDelivered >= order.quantity;

    let updatedOrder = {
      ...order,
      payment: {
        ...order.payment,
        paid: currentPaid,
        outstanding: Math.max(0, totalValue - currentPaid)
      },
      financeStatus: isPaidInFull ? 'Paid' : 'Partial',
      status: 'Payment Verified',
      overallStage: 'Payment Verified',
      currentDepartment: (isPaidInFull && isDeliveredInFull) ? 'None' : 'Finance'
    };

    updatedOrder = addTimelineEvent(
      updatedOrder, 
      'Payment Verified', 
      `Verified payment receipt of ₹${amountVerified.toLocaleString('en-IN')}`
    );

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'PAYMENT',
        entityId: paymentId,
        action: 'PAYMENT_VERIFIED',
        payload: { amountVerified, orderNo: order.orderNo, isPaidInFull },
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.PAYMENT_VERIFIED, { order: updatedOrder, amountVerified });

    // Auto Close: if paid in full and fully delivered, transition to Closed
    if (isPaidInFull && isDeliveredInFull) {
      financeOrchestrator.closeOrder(state, updatedOrder, dispatch, currentUser);
    }
    
    return ERPSuccess(updatedOrder);
  },

  closeOrder: (state, order, dispatch, currentUser) => {
    if (currentUser?.role !== 'Finance' &&
        currentUser?.role !== 'Super Admin' &&
        !financeOrchestrator.canCloseOrder(currentUser?.role)) {
      return ERPError('Unauthorized: Only Finance Manager role can close orders.', 'UNAUTHORIZED');
    }

    // Concurrency check (optimistic lock)
    if (order.status !== 'Payment Verified') {
      return ERPError(`Concurrency Block: Cannot close order. Order status is "${order.status}", expected "Payment Verified".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'Closed');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    // Derived Dues & Delivery checks
    const totalPaid = order.payment?.paid || 0;
    const totalDue = order.payment?.totalAmount || order.totalValue;
    const outstanding = Math.max(0, totalDue - totalPaid);

    const totalDelivered = (state.dispatches || [])
      .filter(d => d.status === 'Delivered')
      .flatMap(d => d.dispatchItems || [])
      .filter(di => di.orderNo === order.orderNo)
      .reduce((sum, di) => sum + Number(di.qty), 0);
    const dispatchRemaining = Math.max(0, order.quantity - totalDelivered);

    if (outstanding > 0 || dispatchRemaining > 0) {
      return ERPError(`Dues Clearance Pending: Cannot close Order ${order.orderNo}. Dues outstanding: ₹${outstanding.toLocaleString('en-IN')}, remaining dispatch volume: ${dispatchRemaining} Tons.`, 'OUTSTANDING_DUES');
    }

    let closedOrder = {
      ...order,
      status: 'Closed',
      overallStage: 'Closed',
      currentDepartment: 'None'
    };
    closedOrder = addTimelineEvent(closedOrder, 'Closed', 'Order fully completed, payments verified, outstanding zeroed, order closed safely.');

    dispatch({ type: 'UPDATE_ORDER', payload: closedOrder });

    // Update Work Order to closed too
    const matchedWo = (state.workOrders || []).find(wo => wo.orderNo === order.orderNo);
    if (matchedWo) {
      dispatch({
        type: 'UPDATE_WORK_ORDER',
        payload: { id: matchedWo.id, status: 'Closed', progress: 100 }
      });
    }

    const notif = buildNotification(
      'Order Closed Successfully',
      `Order ${order.orderNo} has been successfully closed. All compliance cleared.`,
      'Sales',
      'Medium',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Order Closed', 
      order.orderNo, 
      'ORDER', 
      'Payment Verified', 
      'Closed', 
      'Order marked closed in ERP database'
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'ORDER',
        entityId: order.orderNo,
        action: 'CLOSED',
        payload: closedOrder,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.CLOSED, closedOrder);
    return ERPSuccess(closedOrder);
  },

  recordExpense: (state, expenseData, dispatch, currentUser) => {
    if (currentUser?.role !== 'Finance' &&
        currentUser?.role !== 'Super Admin' &&
        !financeOrchestrator.canRecordExpense(currentUser?.role)) {
      return ERPError('Unauthorized: Only Finance Manager role can record operating expenses.', 'UNAUTHORIZED');
    }

    const expense = {
      id: generateUniqueId('EXP'),
      item: expenseData.item,
      amount: Number(expenseData.amount),
      date: expenseData.date || new Date().toISOString().split('T')[0],
      category: expenseData.category || 'Operations'
    };

    dispatch({ type: 'RECORD_EXPENSE', payload: expense });

    const audit = buildAuditLog(
      currentUser?.name,
      'Procurement Expense Recorded',
      expense.id,
      'EXPENSE',
      'Active',
      'Recorded',
      `Logged expense of ₹${expense.amount.toLocaleString('en-IN')} for ${expense.item}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'EXPENSE',
        entityId: expense.id,
        action: 'EXPENSE_RECORDED',
        payload: expense,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    return ERPSuccess(expense);
  },

  canVerifyPayment(role) {
    return [
      "finance-lead",
      "finance-executive"
    ].includes(role);
  },

  canCloseOrder(role) {
    return role === "finance-lead";
  },

  canRecordExpense(role) {
    return role === "finance-lead";
  }
};
