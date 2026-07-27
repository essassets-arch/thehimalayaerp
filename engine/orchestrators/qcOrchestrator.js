import { EVENTS } from '../events';
import { emit } from '../eventBus';
import { STATUS } from '../../shared/constants';
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

export const qcOrchestrator = {
  submitInspection: (state, order, workOrder, qcResults, isApproved, dispatch, currentUser) => {
    if (currentUser?.role !== 'QC' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only QC Officer role can sign off inspections.', 'UNAUTHORIZED');
    }

    // Concurrency check (optimistic lock)
    if (order.status !== STATUS.QC_PENDING) {
      return ERPError(`Concurrency Block: Cannot inspect order. Current status is "${order.status}", expected "${STATUS.QC_PENDING}".`, 'CONCURRENCY_ERROR');
    }

    const nextStatus = isApproved ? STATUS.QC_PASSED : STATUS.IN_PRODUCTION;

    const transitionCheck = validateTransition(order.status, nextStatus);
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    const qcLogEntry = {
      // Identification
      failureId: `FAIL-${Math.floor(1000 + Math.random() * 9000)}`,
      workOrderId: workOrder.id,
      orderNo: workOrder.orderNo,
      productName: workOrder.productName,
      quantity: workOrder.quantity,
      
      // QC Inspection Info
      inspectorName: currentUser?.name || 'QC Officer',
      inspectionDate: new Date().toISOString().split('T')[0],
      qcStatus: isApproved ? 'Passed' : 'Failed',
      failureStage: workOrder.stage || 'Final QC',
      
      // Failure Details
      failureReasons: qcResults.defects || [],
      failureSeverity: (qcResults.defects?.length > 3) ? 'Critical' : (qcResults.defects?.length > 0 ? 'Major' : 'Minor'),
      defectCount: qcResults.defects?.length || 0,
      defectRate: qcResults.defects?.length ? ((qcResults.defects.length / 5) * 100).toFixed(1) : 0,
      remarks: isApproved ? 'Checklist passed' : `Defects detected: ${qcResults.defects?.join(', ')}`,
      
      // Evidence
      inspectionPhotos: qcResults.image ? [qcResults.image] : [],
      qcReportUpload: null,
      
      // Action Tracking (updated later)
      actionTaken: isApproved ? 'None' : 'Pending',
      actionTriggeredBy: null,
      actionDate: null,

      // Compatibility/Legacy fields
      result: isApproved ? 'Passed' : 'Failed',
      defects: qcResults.defects || [],
      date: new Date().toISOString().split('T')[0],
      inspector: currentUser?.name || 'QC Officer'
    };

    const updatedQcHistory = [...(workOrder.qcHistory || []), qcLogEntry];
    const newReworkCount = isApproved ? workOrder.reworkCount : (workOrder.reworkCount || 0) + 1;

    // 1. Update Work Order State
    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: {
        id: workOrder.id,
        status: isApproved ? STATUS.QC_PASSED : STATUS.REWORK,
        qcStatus: isApproved ? 'Passed' : 'Failed',
        reworkCount: newReworkCount,
        qcHistory: updatedQcHistory,
        progress: isApproved ? 100 : 20, // Reset to 20% on failure
        stage: isApproved ? STATUS.QC_PASSED : STATUS.REWORK
      }
    });

    // 2. Update Order State
    let updatedOrder = {
      ...order,
      status: nextStatus,
      overallStage: nextStatus,
      productionStatus: isApproved ? STATUS.QC_PASSED : STATUS.REWORK,
      plantHeadStatus: isApproved ? STATUS.QC_PASSED : 'QC Failed',
      currentDepartment: isApproved ? 'Dispatch' : 'Production'
    };

    let remarks = isApproved
      ? `QC Passed: Strength=${qcResults.strength}, Dimensions=${qcResults.dimensions}, Quality=${qcResults.quality}, Weight=${qcResults.weight}`
      : `QC Failed (Rework Loop #${newReworkCount}): Defects=[${qcResults.defects?.join(', ')}]`;

    updatedOrder = addTimelineEvent(updatedOrder, nextStatus, remarks);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    // 3. Notifications & Audits
    const notif = buildNotification(
      isApproved ? 'QC Verification Approved' : 'QC Verification Failed',
      isApproved
        ? `Order ${order.orderNo} cleared QC inspection. Forwarded to logistics.`
        : `Order ${order.orderNo} failed inspection. Returned to floor for rework.`,
      isApproved ? 'Dispatch' : 'Production',
      'High',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      isApproved ? 'QC Inspection Passed' : 'QC Inspection Failed', 
      workOrder.id, 
      'WORK_ORDER', 
      'QC Pending', 
      isApproved ? 'QC Passed' : 'Rework', 
      remarks
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    // Central Event Store Logging
    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'WORK_ORDER',
        entityId: workOrder.id,
        action: isApproved ? 'QC_PASSED' : 'QC_FAILED',
        payload: { qcResults, reworkCount: newReworkCount },
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(isApproved ? EVENTS.QC_PASSED : EVENTS.IN_PRODUCTION, { order: updatedOrder, results: qcResults });
    return ERPSuccess(updatedOrder);
  }
};
