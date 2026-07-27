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

export const productionActions = {
  acceptOrder: (order, dispatch, currentUser) => {
    let updatedOrder = {
      ...order,
      productionStatus: 'Running',
      overallStage: EVENTS.PRODUCTION_STARTED
    };
    updatedOrder = addTimelineEvent(updatedOrder, EVENTS.PRODUCTION_STARTED, 'Production planned and batch assigned');

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const audit = buildAuditLog(currentUser?.name, 'Production Accepted', order.orderNo, 'Order scheduled for manufacturing');
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.PRODUCTION_STARTED, updatedOrder);
  },

  raiseMaterialRequest: (order, materialName, quantityRequested, dispatch, currentUser) => {
    const requestId = 'MREQ-' + Math.floor(1000 + Math.random() * 9000);
    const mReq = {
      id: requestId,
      orderNo: order.orderNo,
      materialName,
      quantityRequested,
      quantityApproved: 0,
      requester: currentUser?.name || 'Production team',
      status: 'Pending',
      createdAt: Date.now()
    };

    dispatch({ type: 'CREATE_MATERIAL_REQUEST', payload: mReq });

    let updatedOrder = { ...order, storeStatus: 'Requested' };
    updatedOrder = addTimelineEvent(updatedOrder, EVENTS.MATERIAL_REQUESTED, `Requested ${quantityRequested} Tons of ${materialName}`);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const notif = buildNotification(
      'Material Approval Required',
      `Production requested ${quantityRequested} Tons of ${materialName} for Order ${order.orderNo}.`,
      'Plant Head',
      'High',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(currentUser?.name, 'Material Requested', order.orderNo, `Material request ${requestId} created for ${quantityRequested} Ton ${materialName}`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.MATERIAL_REQUESTED, mReq);
  },

  approveMaterialRequest: (request, order, quantityApproved, isApproved, dispatch, currentUser) => {
    const status = isApproved ? 'Approved' : 'Rejected';
    
    dispatch({
      type: 'APPROVE_MATERIAL_REQUEST',
      payload: { id: request.id, status, quantityApproved }
    });

    let updatedOrder = { 
      ...order, 
      plantHeadStatus: status,
      storeStatus: status === 'Approved' ? 'Approved' : order.storeStatus
    };
    updatedOrder = addTimelineEvent(updatedOrder, EVENTS.MATERIAL_APPROVED, `${status} ${quantityApproved} Tons of ${request.materialName}`);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const notif = buildNotification(
      isApproved ? 'Material Request Approved' : 'Material Request Rejected',
      `Plant Head ${status} ${quantityApproved} Tons of ${request.materialName} for Order ${request.orderNo}.`,
      isApproved ? 'Store' : 'Production',
      'Medium',
      request.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      isApproved ? 'Material Request Approved' : 'Material Request Rejected', 
      request.orderNo, 
      `Request ${request.id} ${status.toLowerCase()} with qty: ${quantityApproved} Tons`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.MATERIAL_APPROVED, { request, quantityApproved, isApproved });
  },

  issueMaterial: (request, order, dispatch, currentUser) => {
    dispatch({
      type: 'ISSUE_MATERIAL',
      payload: { requestId: request.id, materialName: request.materialName, quantityIssued: request.quantityApproved }
    });

    let updatedOrder = { 
      ...order, 
      storeStatus: 'Issued' 
    };
    updatedOrder = addTimelineEvent(updatedOrder, EVENTS.MATERIAL_ISSUED, `Store issued ${request.quantityApproved} Tons of ${request.materialName}`);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const notif = buildNotification(
      'Materials Issued',
      `Store issued ${request.quantityApproved} Tons of ${request.materialName} for Order ${request.orderNo}.`,
      'Production',
      'Medium',
      request.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(currentUser?.name, 'Material Issued', request.orderNo, `Request ${request.id} issued. Raw inventory updated.`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.MATERIAL_ISSUED, request);
  },

  updateProductionWork: (order, status, dispatch, currentUser) => {
    const stage = status === 'Completed' ? EVENTS.PRODUCTION_COMPLETED : EVENTS.PRODUCTION_RUNNING;
    let updatedOrder = {
      ...order,
      productionStatus: status,
      overallStage: stage
    };
    updatedOrder = addTimelineEvent(updatedOrder, stage, `Production status changed to: ${status}`);

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const audit = buildAuditLog(currentUser?.name, 'Production Status Update', order.orderNo, `Manufacturing state: ${status}`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    if (status === 'Completed') {
      const notif = buildNotification(
        'Production Completed',
        `Order ${order.orderNo} production completed. QC inspection required.`,
        'Plant Head',
        'High',
        order.orderNo
      );
      dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
      emit(EVENTS.PRODUCTION_COMPLETED, updatedOrder);
    } else {
      emit(EVENTS.PRODUCTION_RUNNING, updatedOrder);
    }
  },

  approveQC: (order, qcResults, isApproved, dispatch, currentUser) => {
    const status = isApproved ? 'Approved' : 'Rejected';
    const stage = EVENTS.QC_APPROVED;
    
    let updatedOrder = {
      ...order,
      plantHeadStatus: isApproved ? 'QC Approved' : 'QC Rejected',
      productionStatus: isApproved ? 'Completed' : 'Rework'
    };
    
    updatedOrder = addTimelineEvent(
      updatedOrder, 
      stage, 
      `QC Check: ${status} (Strength: ${qcResults.strength}, Dimensions: ${qcResults.dimensions}, Quality: ${qcResults.quality}, Weight: ${qcResults.weight})`
    );

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const notif = buildNotification(
      isApproved ? 'QC Check Approved' : 'QC Check Failed',
      `Order ${order.orderNo} QC inspection ${status.toLowerCase()}. ${isApproved ? 'Ready for logistics.' : 'Sent back for rework.'}`,
      isApproved ? 'Dispatch' : 'Production',
      'High',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(currentUser?.name, 'QC Inspection', order.orderNo, `Result: ${status}. Details: ${JSON.stringify(qcResults)}`);
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    emit(EVENTS.QC_APPROVED, { order, isApproved, qcResults });
  }
};
