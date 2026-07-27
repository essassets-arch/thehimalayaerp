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

export const dispatchOrchestrator = {
  createDispatch: (state, dispatchData, dispatch, currentUser) => {
    if (currentUser?.role !== 'Dispatch' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Dispatch role can schedule dispatches.', 'UNAUTHORIZED');
    }

    const dispatchItems = dispatchData.dispatchItems || [];
    if (dispatchItems.length === 0) {
      return ERPError('No dispatch items specified.', 'INVALID_PAYLOAD');
    }

    // Validate transitions, over-dispatch, and work order integrity for all orders in the batch
    for (const item of dispatchItems) {
      const order = state.orders.find(o => o.orderNo === (item.orderNo || item.orderId));
      if (!order) {
        return ERPError(`Linked order ${item.orderNo || item.orderId} not found.`, 'NOT_FOUND');
      }

      // Concurrency check (optimistic lock)
      if (!['QC Passed', 'QC_PASSED', 'DISPATCH_READY', 'Dispatch Created', 'DISPATCH_CREATED', 'In Transit', 'Partially Delivered'].includes(order.status)) {
        return ERPError(`Order ${item.orderNo || item.orderId} Concurrency Block: Current status is "${order.status}", expected QC Passed, Dispatch Created, In Transit or Partially Delivered.`, 'CONCURRENCY_ERROR');
      }

      // State transition validation
      const transitionCheck = validateTransition(order.status, 'Dispatch Created');
      if (!transitionCheck.allowed) {
        return ERPError(`Order ${item.orderNo || item.orderId}: ${transitionCheck.message}`, 'INVALID_TRANSITION');
      }

      // Work Order Integrity check
      const linkedWo = (state.workOrders || []).find(wo => wo.orderNo === order.orderNo);
      if (linkedWo && !['Completed', 'QC Passed', 'Closed'].includes(linkedWo.status)) {
        return ERPError(`Order ${item.orderNo || item.orderId} Data Integrity Block: Linked Work Order ${linkedWo.id} is not in a terminal/completed state. Current status: "${linkedWo.status}".`, 'DATA_INTEGRITY_VIOLATION');
      }

      // Over-dispatch protection
      const newQty = Number(item.qty);
      const alreadyDispatched = (state.dispatches || [])
        .flatMap(d => d.dispatchItems || [])
        .filter(di => di.orderNo === order.orderNo)
        .reduce((sum, di) => sum + Number(di.qty), 0);

      if (alreadyDispatched + newQty > order.quantity) {
        return ERPError(`Order ${item.orderNo || item.orderId} Over-Dispatch Block: Dispatched quantity (${alreadyDispatched + newQty} Tons) would exceed order total quantity (${order.quantity} Tons).`, 'OVER_DISPATCH');
      }
    }

    // Unified ID Schema: DSP-XXXX-01, DSP-XXXX-02, etc.
    const firstOrder = state.orders.find(o => o.orderNo === (dispatchItems[0].orderNo || dispatchItems[0].orderId));
    const orderNum = firstOrder.orderNo.replace('ORD-', '');
    const existingCount = (state.dispatches || []).filter(d => d.id.startsWith(`DSP-${orderNum}-`)).length;
    const seq = String(existingCount + 1).padStart(2, '0');
    const dispatchId = `DSP-${orderNum}-${seq}`;

    const dispatchRecord = {
      id: dispatchId,
      vehicleNo: dispatchData.vehicleNo,
      driverName: dispatchData.driverName,
      driverMobile: dispatchData.driverMobile,
      transporter: dispatchData.transporter,
      transportCost: Number(dispatchData.transportCost || 0),
      lrNumber: dispatchData.lrNumber,
      ewayBill: dispatchData.ewayBill,
      dispatchItems: dispatchItems.map(item => ({
        orderNo: item.orderNo || item.orderId,
        qty: Number(item.qty),
        deliveredQty: 0 // initially 0
      })),
      status: 'Dispatch Created', // Transitions from Dispatch Created -> In Transit -> Delivered
      proofImage: '',
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now()
    };

    // Legacy support fields
    dispatchRecord.orderNo = firstOrder.orderNo;
    dispatchRecord.customerName = firstOrder.customer?.name || firstOrder.customerName || 'Multi-Customer';
    dispatchRecord.quantity = dispatchItems.reduce((sum, item) => sum + Number(item.qty), 0);
    dispatchRecord.type = dispatchItems.length > 1 ? 'Multi-Order' : 'Single';

    dispatch({
      type: 'CREATE_DISPATCH',
      payload: { dispatchRecord }
    });

    // Update order states
    dispatchItems.forEach(item => {
      const order = state.orders.find(o => o.orderNo === (item.orderNo || item.orderId));
      const qty = Number(item.qty);
      const completed = (order.dispatch?.completed || 0) + qty;
      const total = order.dispatch?.total || order.quantity;
      const remaining = Math.max(0, total - completed);

      let updatedOrder = {
        ...order,
        totalQty: total,
        dispatchedQty: completed,
        remainingQty: remaining,
        dispatch: {
          ...order.dispatch,
          completed,
          remaining
        },
        dispatchStatus: 'Dispatch Created',
        status: 'Dispatch Created',
        overallStage: 'Dispatch Created',
        currentDepartment: 'Dispatch'
      };

      updatedOrder = addTimelineEvent(
        updatedOrder,
        'Dispatch Created',
        `Dispatch record created for ${qty} Tons via vehicle ${dispatchData.vehicleNo}. Dispatch ID: ${dispatchId}`
      );

      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

      const notif = buildNotification(
        'Dispatch Scheduled',
        `Consignment ${dispatchId} scheduled for Order ${order.orderNo}.`,
        'Sales',
        'Medium',
        order.orderNo
      );
      dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

      const audit = buildAuditLog(
        currentUser?.name,
        'Dispatch Created',
        dispatchId,
        'DISPATCH',
        order.status,
        'Dispatch Created',
        `Dispatch record allocated. Qty: ${qty} Tons`
      );
      dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });
    });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'DISPATCH',
        entityId: dispatchId,
        action: 'CREATED',
        payload: dispatchRecord,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    return ERPSuccess(dispatchRecord);
  },

  departVehicle: (state, dispatchId, dispatchStore, currentUser) => {
    if (currentUser?.role !== 'Dispatch' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Dispatch role can depart vehicles.', 'UNAUTHORIZED');
    }

    const dispatchRec = state.dispatches.find(d => d.id === dispatchId);
    if (!dispatchRec) return ERPError('Dispatch record not found.', 'NOT_FOUND');

    // Concurrency check (optimistic lock)
    if (dispatchRec.status !== 'Dispatch Created') {
      return ERPError(`Concurrency Block: Dispatch status is "${dispatchRec.status}", expected "Dispatch Created".`, 'CONCURRENCY_ERROR');
    }

    const items = dispatchRec.dispatchItems || [];

    // Verify all transition paths first
    for (const item of items) {
      const order = state.orders.find(o => o.orderNo === item.orderNo);
      if (order) {
        const transitionCheck = validateTransition(order.status, 'In Transit');
        if (!transitionCheck.allowed) {
          return ERPError(`Order ${order.orderNo}: ${transitionCheck.message}`, 'INVALID_TRANSITION');
        }
      }
    }

    // Set dispatch status to In Transit
    dispatchStore({
      type: 'DEPART_VEHICLE',
      payload: { dispatchId }
    });

    items.forEach(item => {
      const order = state.orders.find(o => o.orderNo === item.orderNo);
      if (!order) return;

      let updatedOrder = {
        ...order,
        status: 'In Transit',
        overallStage: 'In Transit',
        dispatchStatus: 'In Transit'
      };
      updatedOrder = addTimelineEvent(
        updatedOrder,
        'In Transit',
        `Vehicle ${dispatchRec.vehicleNo} departed factory floor. Transit started.`
      );
      dispatchStore({ type: 'UPDATE_ORDER', payload: updatedOrder });

      const audit = buildAuditLog(
        currentUser?.name,
        'Consignment In Transit',
        dispatchId,
        'DISPATCH',
        'Dispatch Created',
        'In Transit',
        `Vehicle ${dispatchRec.vehicleNo} departed.`
      );
      dispatchStore({ type: 'ADD_AUDIT_LOG', payload: audit });
    });

    return ERPSuccess(dispatchRec);
  },

  deliverDispatch: (state, dispatchId, proofFileName, dispatchStore, currentUser) => {
    if (currentUser?.role !== 'Dispatch' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Dispatch role can sign off deliveries.', 'UNAUTHORIZED');
    }

    const dispatchRec = state.dispatches.find(d => d.id === dispatchId);
    if (!dispatchRec) return ERPError('Dispatch record not found.', 'NOT_FOUND');

    // Concurrency check (optimistic lock)
    if (dispatchRec.status !== 'In Transit') {
      return ERPError(`Concurrency Block: Dispatch status is "${dispatchRec.status}", expected "In Transit".`, 'CONCURRENCY_ERROR');
    }

    const items = dispatchRec.dispatchItems || [];

    // Verify all transition paths first
    for (const item of items) {
      const order = state.orders.find(o => o.orderNo === item.orderNo);
      if (order) {
        // Calculate transition target derived from deliveredQty
        const previousDelivered = (state.dispatches || [])
          .filter(d => d.status === 'Delivered' && d.id !== dispatchId)
          .flatMap(d => d.dispatchItems || [])
          .filter(di => di.orderNo === order.orderNo)
          .reduce((sum, di) => sum + Number(di.qty), 0);

        const cumulativeDelivered = previousDelivered + Number(item.qty);
        const nextStatus = cumulativeDelivered < order.quantity ? 'Partially Delivered' : 'Payment Pending';

        const transitionCheck = validateTransition(order.status, nextStatus);
        if (!transitionCheck.allowed) {
          return ERPError(`Order ${order.orderNo}: ${transitionCheck.message}`, 'INVALID_TRANSITION');
        }
      }
    }

    dispatchStore({
      type: 'DELIVER_DISPATCH',
      payload: { dispatchId, proofImage: proofFileName || 'pod_uploaded.jpg' }
    });

    items.forEach(item => {
      const order = state.orders.find(o => o.orderNo === item.orderNo);
      if (!order) return;

      const previousDelivered = (state.dispatches || [])
        .filter(d => d.status === 'Delivered' && d.id !== dispatchId)
        .flatMap(d => d.dispatchItems || [])
        .filter(di => di.orderNo === order.orderNo)
        .reduce((sum, di) => sum + Number(di.qty), 0);

      const cumulativeDelivered = previousDelivered + Number(item.qty);
      const isFull = cumulativeDelivered >= order.quantity;
      const nextStatus = isFull ? 'Payment Pending' : 'Partially Delivered';

      let updatedOrder = {
        ...order,
        status: nextStatus,
        overallStage: nextStatus,
        dispatchStatus: isFull ? 'Delivered' : 'Partially Delivered',
        currentDepartment: isFull ? 'Finance' : 'Dispatch'
      };

      updatedOrder = addTimelineEvent(
        updatedOrder,
        nextStatus,
        `Delivery Proof uploaded: ${proofFileName}. Delivered quantity: ${item.qty} Tons. Total delivered so far: ${cumulativeDelivered} / ${order.quantity} Tons.`
      );

      dispatchStore({ type: 'UPDATE_ORDER', payload: updatedOrder });

      // Notify Finance & Sales
      const targetDepts = isFull ? ['Sales', 'Finance'] : ['Sales'];
      targetDepts.forEach(dept => {
        const deliveryNotif = buildNotification(
          isFull ? 'Delivery Completed' : 'Partial Delivery Completed',
          `Order ${order.orderNo} delivered quantity: ${item.qty} Tons (Total: ${cumulativeDelivered}/${order.quantity} Tons).`,
          dept,
          'High',
          order.orderNo
        );
        dispatchStore({ type: 'ADD_NOTIFICATION', payload: deliveryNotif });
      });

      const audit = buildAuditLog(
        currentUser?.name,
        isFull ? 'Order Fully Delivered' : 'Order Partially Delivered',
        dispatchId,
        'DISPATCH',
        'In Transit',
        nextStatus,
        `POD: ${proofFileName}. Delivered: ${item.qty} Tons.`
      );
      dispatchStore({ type: 'ADD_AUDIT_LOG', payload: audit });

      emit(EVENTS.DELIVERED, { order: updatedOrder, dispatchId });
    });

    return ERPSuccess(dispatchRec);
  }
};
