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

export const dispatchActions = {
  createDispatch: (order, dispatchData, dispatch, currentUser) => {
    const qty = Number(dispatchData.quantity);
    const remainingBefore = order.dispatch?.remaining ?? order.quantity;
    const isFull = qty >= remainingBefore;
    const type = isFull ? 'Full' : 'Partial';
    const dispatchId = 'DSP-' + Math.floor(1000 + Math.random() * 9000);

    const dispatchRecord = {
      id: dispatchId,
      orderNo: order.orderNo,
      customerName: order.customer.name,
      vehicleNo: dispatchData.vehicleNo,
      driverName: dispatchData.driverName,
      driverMobile: dispatchData.driverMobile,
      transporter: dispatchData.transporter,
      transportCost: Number(dispatchData.transportCost || 0),
      lrNumber: dispatchData.lrNumber,
      ewayBill: dispatchData.ewayBill,
      quantity: qty,
      type,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now()
    };

    // Calculate new completion statuses
    const completed = (order.dispatch?.completed || 0) + qty;
    const total = order.dispatch?.total || order.quantity;
        const dispatchStatus = completed >= total ? 'Delivered' : 'Partial';
    const stage = completed >= total ? 'Fully Delivered' : 'Partial Delivered';

    let updatedOrder = {
      ...order,
      dispatchStatus,
      overallStage: stage
    };
    
    updatedOrder = addTimelineEvent(
      updatedOrder, 
      stage, 
      `Dispatched ${qty} Units via vehicle ${dispatchData.vehicleNo} (${type} Dispatch)`
    );

    dispatch({
      type: 'CREATE_DISPATCH',
      payload: { dispatchRecord, orderNo: order.orderNo, quantityDispatched: qty }
    });

    const notif = buildNotification(
      'Consignment Dispatched',
      `${type} dispatch created for Order ${order.orderNo}. ${qty} units sent via ${dispatchData.transporter}.`,
      'Sales',
      'Medium',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Consignment Dispatched', 
      order.orderNo, 
      `Vehicle: ${dispatchData.vehicleNo}. Transporter: ${dispatchData.transporter}. Cost: ₹${dispatchData.transportCost}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.DISPATCH_CREATED, { order: updatedOrder, dispatchRecord });
  }
};
