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

const isMaterialMatch = (invName, reqName) => {
  const inv = (invName || '').toLowerCase();
  const req = (reqName || '').toLowerCase();
  if (inv === req) return true;
  if (inv.includes(req) || req.includes(inv)) return true;
  if (req === 'cement' && inv.includes('cement')) return true;
  if (req === 'sand' && inv.includes('sand')) return true;
  if (req === 'aggregate' && inv.includes('aggregate')) return true;
  return false;
};

const findInventoryItem = (inventory, name) => {
  return (inventory || []).find(inv => isMaterialMatch(inv.material, name));
};

export const productionOrchestrator = {
  planOrder: (state, order, targetDate, priority, dispatch, currentUser) => {
    if (currentUser?.role !== 'Plant Head' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Plant Head role can plan production schedules.', 'UNAUTHORIZED');
    }

    // Concurrency check (optimistic lock)
    if (order.status !== 'Created') {
      return ERPError(`Concurrency Block: Cannot plan order. Status has changed from "Created" to "${order.status}".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'Planned');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    let updatedOrder = {
      ...order,
      status: 'Planned',
      overallStage: 'Planned',
      deliveryDate: targetDate,
      priority,
      currentDepartment: 'Production'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'Planned', `Order planned by Plant Head. Completion date: ${targetDate}, Priority: ${priority}`);

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Order Planned', 
      order.orderNo, 
      'ORDER', 
      'Created', 
      'Planned', 
      `Planned completion target: ${targetDate}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    const notif = buildNotification(
      'Order Planned',
      `Order ${order.orderNo} planned. Production can now configure the Work Order.`,
      'Production',
      'Medium',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'ORDER',
        entityId: order.orderNo,
        action: 'PLANNED',
        payload: updatedOrder,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.PLANNED, updatedOrder);
    return ERPSuccess(updatedOrder);
  },

  createWorkOrder: (state, order, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can generate work orders.', 'UNAUTHORIZED');
    }

    // Concurrency check (optimistic lock)
    if (order.status !== 'Planned') {
      return ERPError(`Concurrency Block: Cannot create Work Order. Order status is "${order.status}", expected "Planned".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'Work Order Created');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    // Unified ID Schema: WO-XXXX-01
    const orderNum = order.orderNo.replace('ORD-', '');
    const woId = `WO-${orderNum}-01`;
    
    // Check if work order already exists
    const exists = (state.workOrders || []).some(wo => wo.id === woId);
    if (exists && !order.isReproduction) {
      return ERPError(`Work Order ${woId} already exists.`, 'CONFLICT');
    }

    const existingWO = (state.workOrders || []).find(wo => wo.id === woId);
    const workOrder = {
      id: woId,
      orderNo: order.orderNo,
      productId: order.detailedItems?.[0]?.code || 'P-GEN',
      productName: order.products,
      quantity: order.quantity,
      status: 'Work Order Created',
      progress: 0,
      stage: 'Planning',
      reworkCount: (existingWO?.reworkCount || 0) + (order.isReproduction ? 1 : 0),
      qcHistory: existingWO?.qcHistory || [],
      targetDate: order.deliveryDate || '',
      priority: order.priority || 'Medium'
    };

    dispatch({ type: 'CREATE_WORK_ORDER', payload: workOrder });

    let updatedOrder = { 
      ...order,
      workOrderId: woId,
      hasWorkOrder: true,
      status: 'Work Order Created',
      overallStage: 'Work Order Created'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'Work Order Created', `Work Order ${woId} generated for production planning.`);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Work Order Created', 
      woId, 
      'WORK_ORDER', 
      'Planned', 
      'Work Order Created', 
      `Generated Work Order ${woId} for order ${order.orderNo}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'WORK_ORDER',
        entityId: woId,
        action: 'CREATED',
        payload: workOrder,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    return ERPSuccess(workOrder);
  },

  raiseMaterialRequest: (state, workOrder, materials, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can raise material requests.', 'UNAUTHORIZED');
    }

    const isDailyAdhoc = !workOrder || workOrder.id === 'DAILY-STOCK' || !workOrder.orderNo;

    let requestId = '';
    if (isDailyAdhoc) {
      requestId = `MR-DAILY-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const mReq = {
        id: requestId,
        workOrderId: 'DAILY-STOCK',
        orderNo: 'DAILY-STOCK',
        materials: materials.map(m => ({
          materialName: m.material,
          quantityRequested: Number(m.qty),
          quantityApproved: 0
        })),
        requester: currentUser?.name || 'Production team',
        status: 'Pending',
        createdAt: Date.now()
      };

      dispatch({ type: 'CREATE_MATERIAL_REQUEST', payload: mReq });

      const notif = buildNotification(
        Date.now() + Math.random(),
        'Daily Material Request',
        `Daily material request ${requestId} raised for shop floor replenishment.`,
        'Store',
        'Medium',
        'DAILY-STOCK'
      );
      dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

      dispatch({
        type: 'ADD_AUDIT_LOG',
        payload: {
          id: Date.now() + Math.random(),
          entityId: requestId,
          entityType: 'Material Request',
          action: 'Created',
          fromStatus: 'None',
          toStatus: 'Pending',
          user: currentUser?.name || 'Production team',
          timestamp: Date.now()
        }
      });

      return ERPSuccess(mReq);
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    // Concurrency check (optimistic lock)
    if (order.status !== 'Work Order Created' && order.status !== 'Shortage') {
      return ERPError(`Concurrency Block: Cannot request materials. Order status is "${order.status}", expected "Work Order Created" or "Shortage".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'Material Requested');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    // Unified ID Schema: MR-XXXX-01
    const orderNum = workOrder.orderNo.replace('ORD-', '');
    requestId = `MR-${orderNum}-01`;

    const mReq = {
      id: requestId,
      workOrderId: workOrder.id,
      orderNo: workOrder.orderNo,
      materials: materials.map(m => ({
        materialName: m.material,
        quantityRequested: Number(m.qty),
        quantityApproved: 0
      })),
      requester: currentUser?.name || 'Production team',
      status: 'Pending',
      createdAt: Date.now()
    };

    dispatch({ type: 'CREATE_MATERIAL_REQUEST', payload: mReq });

    let updatedOrder = { 
      ...order, 
      status: 'Material Requested',
      overallStage: 'Material Requested',
      storeStatus: 'Requested',
      currentDepartment: 'Plant Head'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'Material Requested', `Raised material request ${requestId} for Work Order ${workOrder.id}`);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { id: workOrder.id, status: 'Material Requested' }
    });

    const notif = buildNotification(
      'Material Approval Required',
      `Production requested materials for Order ${order.orderNo}.`,
      'Plant Head',
      'High',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Material Requested', 
      requestId, 
      'MATERIAL_REQUEST', 
      order.status, 
      'Material Requested', 
      `Material request ${requestId} raised for ${workOrder.id}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'MATERIAL_REQUEST',
        entityId: requestId,
        action: 'MATERIAL_REQUESTED',
        payload: mReq,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.MATERIAL_REQUESTED, mReq);
    return ERPSuccess(mReq);
  },

  approveMaterialRequest: (state, request, targetQtyOverrides, isApproved, dispatch, currentUser, remarks = '') => {
    if (currentUser?.role !== 'Plant Head' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Plant Head role can approve material requests.', 'UNAUTHORIZED');
    }

    const isDailyAdhoc = request.orderNo === 'DAILY-STOCK';

    if (isDailyAdhoc) {
      if (!isApproved) {
        dispatch({
          type: 'APPROVE_MATERIAL_REQUEST',
          payload: { id: request.id, status: 'Rejected' }
        });
        
        const audit = buildAuditLog(
          currentUser?.name, 
          'Material Request Rejected', 
          request.id, 
          'MATERIAL_REQUEST', 
          'Pending', 
          'Rejected', 
          remarks ? `Daily request rejected. Reason: ${remarks}` : `Daily request rejected.`
        );
        dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });
        return ERPSuccess(request);
      }

      const approvedMaterials = request.materials.map(m => {
        const reqId = `${request.id}-${m.materialName}`;
        const approvedQty = Number(targetQtyOverrides[reqId] !== undefined ? targetQtyOverrides[reqId] : m.quantityRequested);
        return {
          ...m,
          quantityApproved: approvedQty
        };
      });

      dispatch({
        type: 'APPROVE_MATERIAL_REQUEST',
        payload: { 
          id: request.id, 
          status: 'Approved',
          materials: approvedMaterials
        }
      });

      const notif = buildNotification(
        Date.now() + Math.random(),
        'Material Request Approved',
        `Plant Head approved Daily request ${request.id}.`,
        'Store',
        'Medium',
        'DAILY-STOCK'
      );
      dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

      const audit = buildAuditLog(
        currentUser?.name, 
        'Material Request Approved', 
        request.id, 
        'MATERIAL_REQUEST', 
        'Pending', 
        'Approved', 
        `Daily request approved.`
      );
      dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

      return ERPSuccess(request);
    }

    const order = state.orders.find(o => o.orderNo === request.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    // No status restriction - Plant Head can approve/reject at any time

    if (!isApproved) {
      // Rejection logic: Transitions status back to "Work Order Created"

      dispatch({
        type: 'APPROVE_MATERIAL_REQUEST',
        payload: { id: request.id, status: 'Rejected' }
      });
      
      let updatedOrder = { 
        ...order, 
        status: 'Work Order Created', 
        overallStage: 'Work Order Created',
        storeStatus: 'Rejected', 
        currentDepartment: 'Production' 
      };
      const rejectRemark = remarks ? `Material request rejected by Plant Head. Reason: ${remarks}` : `Material request rejected by Plant Head.`;
      updatedOrder = addTimelineEvent(updatedOrder, 'Work Order Created', rejectRemark);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

      dispatch({
        type: 'UPDATE_WORK_ORDER',
        payload: { id: request.workOrderId, status: 'Work Order Created' }
      });

      const audit = buildAuditLog(
        currentUser?.name, 
        'Material Request Rejected', 
        request.id, 
        'MATERIAL_REQUEST', 
        'Material Requested', 
        'Work Order Created', 
        rejectRemark
      );
      dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });
      return ERPSuccess(request);
    }

    // Allocate without stock checks
    const approvedMaterials = request.materials.map(m => {
      const approvedQty = Number(targetQtyOverrides[m.materialName] !== undefined ? targetQtyOverrides[m.materialName] : m.quantityRequested);
      return {
        ...m,
        quantityApproved: approvedQty
      };
    });

    const nextStatus = 'Material Approved';
    // No workflow transition restriction for Plant Head material approval

    dispatch({
      type: 'APPROVE_MATERIAL_REQUEST',
      payload: { 
        id: request.id, 
        status: 'Approved',
        materials: approvedMaterials
      }
    });

    let updatedOrder = { 
      ...order, 
      status: nextStatus,
      overallStage: nextStatus,
      plantHeadStatus: nextStatus,
      storeStatus: 'Approved',
      currentDepartment: 'Store'
    };

    let logRemarks = `Approved materials release request ${request.id}`;

    updatedOrder = addTimelineEvent(updatedOrder, nextStatus, logRemarks);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { id: request.workOrderId, status: nextStatus }
    });

    const notif = buildNotification(
      'Material Request Approved',
      `Plant Head approved materials for Order ${request.orderNo}.`,
      'Store',
      'Medium',
      request.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Material Request Approved', 
      request.id, 
      'MATERIAL_REQUEST', 
      'Material Requested', 
      nextStatus, 
      logRemarks
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'MATERIAL_REQUEST',
        entityId: request.id,
        action: 'MATERIAL_APPROVED',
        payload: { ...request, status: 'Approved', materials: approvedMaterials },
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.MATERIAL_APPROVED, { request, hasShortage: false });
    return ERPSuccess(request);
  },

  issueMaterial: (state, request, dispatch, currentUser) => {
    if (currentUser?.role !== 'Store' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Store role can issue materials.', 'UNAUTHORIZED');
    }

    const isDailyAdhoc = request.orderNo === 'DAILY-STOCK';

    if (isDailyAdhoc) {
      const insufficientStock = request.materials.some(m => {
        const invItem = findInventoryItem(state.rawInventory, m.materialName);
        return !invItem || invItem.stock < (m.quantityApproved || m.quantityRequested);
      });

      if (insufficientStock) {
        return ERPError('Insufficient stock in inventory to issue the materials.', 'INSUFFICIENT_STOCK');
      }

      const materialsIssued = request.materials.map(m => ({
        materialName: m.materialName,
        quantityIssued: m.quantityApproved || m.quantityRequested
      }));

      dispatch({
        type: 'ISSUE_MATERIAL',
        payload: { requestId: request.id, materialsIssued }
      });

      const notif = buildNotification(
        Date.now() + Math.random(),
        'Materials Issued',
        `Store issued raw materials for Daily Adhoc request ${request.id}.`,
        'Production',
        'Medium',
        'DAILY-STOCK'
      );
      dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

      const audit = buildAuditLog(
        currentUser?.name, 
        'Material Issued', 
        request.id, 
        'MATERIAL_REQUEST', 
        'Approved', 
        'Issued', 
        `Daily adhoc materials issued successfully.`
      );
      dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

      return ERPSuccess(request);
    }

    const order = state.orders.find(o => o.orderNo === request.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    // Concurrency check (optimistic lock)
    if (order.status !== 'Material Approved') {
      return ERPError(`Concurrency Block: Cannot issue materials. Order status is "${order.status}", expected "Material Approved".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'Material Issued');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    // Double check stock levels to avoid over-allocation
    const insufficientStock = request.materials.some(m => {
      const invItem = findInventoryItem(state.rawInventory, m.materialName);
      return !invItem || invItem.stock < m.quantityApproved;
    });

    if (insufficientStock) {
      return ERPError('Insufficient stock in inventory to issue the materials.', 'INSUFFICIENT_STOCK');
    }

    const materialsIssued = request.materials.map(m => ({
      materialName: m.materialName,
      quantityIssued: m.quantityApproved
    }));

    dispatch({
      type: 'ISSUE_MATERIAL',
      payload: { requestId: request.id, materialsIssued }
    });

    let updatedOrder = { 
      ...order, 
      status: 'Material Issued',
      overallStage: 'Material Issued',
      storeStatus: 'Issued',
      currentDepartment: 'Production'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'Material Issued', `Store issued raw materials for Work Order ${request.workOrderId}`);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { id: request.workOrderId, status: 'Material Issued' }
    });

    const notif = buildNotification(
      'Materials Issued',
      `Store issued raw materials for Order ${request.orderNo}. Manufacturing ready.`,
      'Production',
      'Medium',
      request.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Material Issued', 
      request.id, 
      'MATERIAL_REQUEST', 
      'Material Approved', 
      'Material Issued', 
      `Request ${request.id} issued. Inventory decremented.`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'MATERIAL_REQUEST',
        entityId: request.id,
        action: 'MATERIAL_ISSUED',
        payload: request,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.MATERIAL_ISSUED, request);
    return ERPSuccess(request);
  },

  startProduction: (state, workOrder, machine, operator, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can start manufacturing.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    // Concurrency check (optimistic lock)
    if (order.status !== 'Material Issued' && order.status !== 'Work Order Created' && order.status !== 'Shortage') {
      return ERPError(`Concurrency Block: Cannot start production. Order status is "${order.status}", expected "Material Issued", "Work Order Created", or "Shortage".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'In Production');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    let updatedOrder = {
      ...order,
      status: 'In Production',
      overallStage: 'In Production',
      productionStatus: 'Running'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'In Production', 'Production started on the assembly floor.');
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { 
        id: workOrder.id, 
        status: 'In Production', 
        progress: 5, 
        stage: 'Cutting',
        machine: machine || 'Mixer-1',
        operator: operator || 'Ravi',
        startedAt: Date.now(),
        lastStartedAt: Date.now(),
        accumulatedTime: 0
      }
    });

    const activeRep = (state.reproductions || []).find(rep => rep.workOrderId === workOrder.id && rep.status === 'Pending');
    if (activeRep) {
      dispatch({
        type: 'UPDATE_REPRODUCTION',
        payload: {
          id: activeRep.id,
          status: 'In Progress',
          startedAt: Date.now()
        }
      });
    }

    const audit = buildAuditLog(
      currentUser?.name, 
      'Production Started', 
      workOrder.id, 
      'WORK_ORDER', 
      'Material Issued', 
      'In Production', 
      `Work Order ${workOrder.id} manufacturing started`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'WORK_ORDER',
        entityId: workOrder.id,
        action: 'IN_PRODUCTION',
        payload: workOrder,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.IN_PRODUCTION, updatedOrder);
    return ERPSuccess(updatedOrder);
  },

  updateProductionProgress: (state, workOrder, progress, stage, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can update floor progress.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { id: workOrder.id, progress: Number(progress), stage }
    });

    const activeRep = (state.reproductions || []).find(rep => rep.workOrderId === workOrder.id && rep.status === 'In Progress');
    if (activeRep) {
      dispatch({
        type: 'UPDATE_REPRODUCTION',
        payload: {
          id: activeRep.id,
          progress: Number(progress),
          currentStage: stage
        }
      });
    }

    const audit = buildAuditLog(
      currentUser?.name, 
      'Production Progress', 
      workOrder.id, 
      'WORK_ORDER', 
      order.status, 
      order.status, 
      `Work Order ${workOrder.id} progress updated to ${progress}% at stage: ${stage}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'WORK_ORDER',
        entityId: workOrder.id,
        action: 'PRODUCTION_PROGRESS',
        payload: { progress, stage },
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    return ERPSuccess(workOrder);
  },

  completeProduction: (state, workOrder, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can complete manufacturing.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    // Concurrency check (optimistic lock)
    if (order.status !== 'In Production' && order.status !== 'Paused') {
      return ERPError(`Concurrency Block: Cannot complete production. Order status is "${order.status}", expected "In Production" or "Paused".`, 'CONCURRENCY_ERROR');
    }

    const transitionCheck = validateTransition(order.status, 'QC Pending');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    // Calculate final elapsed time
    let finalAccumulated = workOrder.accumulatedTime || 0;
    if (order.status === 'In Production' && workOrder.lastStartedAt) {
      const elapsed = Date.now() - workOrder.lastStartedAt;
      finalAccumulated += elapsed;
    }

    let updatedOrder = {
      ...order,
      status: 'QC Pending',
      overallStage: 'QC Pending',
      productionStatus: 'Completed',
      currentDepartment: 'QC'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'QC Pending', 'Production completed. Batch forwarded for Quality Control (QC) inspection.');
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    // Mark any active reproduction queue entries as completed
    const activeRep = (state.reproductions || []).find(rep => rep.workOrderId === workOrder.id && rep.status !== 'Completed');
    if (activeRep) {
      dispatch({
        type: 'UPDATE_REPRODUCTION',
        payload: {
          id: activeRep.id,
          status: 'Completed'
        }
      });
    }

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { 
        id: workOrder.id, 
        status: 'QC Pending', 
        progress: 100, 
        stage: 'QC Testing',
        completedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        accumulatedTime: finalAccumulated
      }
    });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Production Completed', 
      workOrder.id, 
      'WORK_ORDER', 
      order.status, 
      'QC Pending', 
      `Work Order ${workOrder.id} completed. Awaiting QC. Total execution time: ${Math.round(finalAccumulated / 1000)}s`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    const notif = buildNotification(
      'QC Inspection Required',
      `Order ${order.orderNo} batch completed. QC verification pending.`,
      'QC',
      'High',
      order.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    dispatch({
      type: 'RECORD_EVENT',
      payload: {
        id: generateUniqueId('EVT'),
        entity: 'WORK_ORDER',
        entityId: workOrder.id,
        action: 'QC_PENDING',
        payload: updatedOrder,
        timestamp: Date.now(),
        user: currentUser?.name || 'System'
      }
    });

    emit(EVENTS.QC_PENDING, updatedOrder);
    return ERPSuccess(updatedOrder);
  },

  pauseProduction: (state, workOrder, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can pause manufacturing.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    const transitionCheck = validateTransition(order.status, 'Paused');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    const elapsed = Date.now() - (workOrder.lastStartedAt || workOrder.startedAt || Date.now());
    const newAccumulated = (workOrder.accumulatedTime || 0) + elapsed;

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { 
        id: workOrder.id, 
        status: 'Paused',
        accumulatedTime: newAccumulated
      }
    });

    let updatedOrder = {
      ...order,
      status: 'Paused',
      overallStage: 'Paused'
    };
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Production Paused', 
      workOrder.id, 
      'WORK_ORDER', 
      order.status, 
      'Paused', 
      `Work Order ${workOrder.id} paused. Total accumulated time: ${Math.round(newAccumulated / 1000)}s`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    return ERPSuccess(updatedOrder);
  },

  resumeProduction: (state, workOrder, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can resume manufacturing.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    const transitionCheck = validateTransition(order.status, 'In Production');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    dispatch({
      type: 'UPDATE_WORK_ORDER',
      payload: { 
        id: workOrder.id, 
        status: 'In Production',
        lastStartedAt: Date.now()
      }
    });

    let updatedOrder = {
      ...order,
      status: 'In Production',
      overallStage: 'In Production'
    };
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    const audit = buildAuditLog(
      currentUser?.name, 
      'Production Resumed', 
      workOrder.id, 
      'WORK_ORDER', 
      order.status, 
      'In Production', 
      `Work Order ${workOrder.id} production resumed.`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    return ERPSuccess(updatedOrder);
  },

  cancelOrder: (state, orderNo, remarks, dispatch, currentUser) => {
    const order = state.orders.find(o => o.orderNo === orderNo);
    if (!order) return ERPError('Order not found.', 'NOT_FOUND');

    if (order.status === 'Closed' || order.status === 'Cancelled') {
      return ERPError(`Cannot cancel order. Current status is terminal: "${order.status}".`, 'TERMINAL_STATE');
    }

    const transitionCheck = validateTransition(order.status, 'Cancelled');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    const cancelReason = remarks ? `Order cancelled. Reason: ${remarks}` : 'Order cancelled by authorized coordinator.';

    let updatedOrder = {
      ...order,
      status: 'Cancelled',
      overallStage: 'Cancelled',
      currentDepartment: 'None'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'Cancelled', cancelReason);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    // Sync Work Order if exists
    const matchedWo = (state.workOrders || []).find(wo => wo.orderNo === orderNo);
    if (matchedWo) {
      dispatch({
        type: 'UPDATE_WORK_ORDER',
        payload: { id: matchedWo.id, status: 'Cancelled' }
      });
    }

    const audit = buildAuditLog(
      currentUser?.name, 
      'Order Cancelled', 
      orderNo, 
      'ORDER', 
      order.status, 
      'Cancelled', 
      cancelReason
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    const notif = buildNotification(
      'Order Cancelled',
      `Order ${orderNo} has been cancelled.`,
      'Sales',
      'High',
      orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    return ERPSuccess(updatedOrder);
  },

  holdOrder: (state, orderNo, remarks, dispatch, currentUser) => {
    const order = state.orders.find(o => o.orderNo === orderNo);
    if (!order) return ERPError('Order not found.', 'NOT_FOUND');

    if (order.status === 'On Hold') {
      // Resume Order flow
      let resumeTarget = 'Planned';
      const matchedWo = (state.workOrders || []).find(wo => wo.orderNo === orderNo);
      if (matchedWo && matchedWo.progress > 0) {
        resumeTarget = 'In Production';
      }

      const transitionCheck = validateTransition(order.status, resumeTarget);
      if (!transitionCheck.allowed) {
        return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
      }

      let updatedOrder = {
        ...order,
        status: resumeTarget,
        overallStage: resumeTarget,
        currentDepartment: resumeTarget === 'Planned' ? 'Production' : 'Production'
      };
      updatedOrder = addTimelineEvent(updatedOrder, resumeTarget, 'Order resumed from On Hold status.');
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

      if (matchedWo) {
        dispatch({
          type: 'UPDATE_WORK_ORDER',
          payload: { id: matchedWo.id, status: resumeTarget }
        });
      }

      const audit = buildAuditLog(
        currentUser?.name, 
        'Order Resumed', 
        orderNo, 
        'ORDER', 
        'On Hold', 
        resumeTarget, 
        'Order status set active again.'
      );
      dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

      return ERPSuccess(updatedOrder);
    }

    // Hold Order flow
    const transitionCheck = validateTransition(order.status, 'On Hold');
    if (!transitionCheck.allowed) {
      return ERPError(transitionCheck.message, 'INVALID_TRANSITION');
    }

    const holdReason = remarks ? `Order placed On Hold. Reason: ${remarks}` : 'Order placed On Hold.';

    let updatedOrder = {
      ...order,
      status: 'On Hold',
      overallStage: 'On Hold'
    };
    updatedOrder = addTimelineEvent(updatedOrder, 'On Hold', holdReason);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    // Sync Work Order if exists
    const matchedWo = (state.workOrders || []).find(wo => wo.orderNo === orderNo);
    if (matchedWo) {
      dispatch({
        type: 'UPDATE_WORK_ORDER',
        payload: { id: matchedWo.id, status: 'On Hold' }
      });
    }

    const audit = buildAuditLog(
      currentUser?.name, 
      'Order On Hold', 
      orderNo, 
      'ORDER', 
      order.status, 
      'On Hold', 
      holdReason
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    return ERPSuccess(updatedOrder);
  },

  sendToReproduction: (state, workOrder, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can dispatch reproductions.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    const reproductionId = `RE-${Math.floor(1000 + Math.random() * 9000)}`;
    const reproduction = {
      // Identification
      id: reproductionId,
      workOrderId: workOrder.id,
      orderNo: workOrder.orderNo,
      productName: workOrder.productName,
      quantity: workOrder.quantity,
      
      // Production Assignment
      assignedLine: 'Mixer-1',
      assignedSupervisor: 'Ramanathan Swamy',
      priority: 'High',
      
      // Status Tracking
      status: 'Pending',
      currentStage: 'Cutting',
      progress: 0,
      
      // Timeline
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null
    };

    // Update the latest failed QC inspection history entry with Action Tracking
    const updatedHistory = (workOrder.qcHistory || []).map((h, idx, arr) => {
      if (idx === arr.length - 1 && (h.result === 'Failed' || h.qcStatus === 'Failed')) {
        return {
          ...h,
          actionTaken: 'Reproduction',
          actionTriggeredBy: currentUser?.name || 'Production Team',
          actionDate: new Date().toISOString().split('T')[0]
        };
      }
      return h;
    });

    dispatch({
      type: 'SEND_TO_REPRODUCTION',
      payload: {
        workOrderId: workOrder.id,
        orderNo: workOrder.orderNo,
        reproduction,
        qcHistory: updatedHistory
      }
    });

    const notif = buildNotification(
      'QC Rework Dispatched',
      `Work Order ${workOrder.id} dispatched to reproduction run ${reproductionId}.`,
      'Production',
      'High',
      workOrder.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name,
      'QC Reproduction Dispatched',
      workOrder.id,
      'WORK_ORDER',
      'Rework',
      'Planned',
      `Dispatched to reproduction queue under run ${reproductionId}`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    return ERPSuccess(reproduction);
  },

  rejectFailedWorkOrder: (state, workOrder, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can reject work orders.', 'UNAUTHORIZED');
    }

    const order = state.orders.find(o => o.orderNo === workOrder.orderNo);
    if (!order) return ERPError('Linked order not found.', 'NOT_FOUND');

    // Update the latest failed QC inspection history entry with Action Tracking
    const updatedHistory = (workOrder.qcHistory || []).map((h, idx, arr) => {
      if (idx === arr.length - 1 && (h.result === 'Failed' || h.qcStatus === 'Failed')) {
        return {
          ...h,
          actionTaken: 'Reject',
          actionTriggeredBy: currentUser?.name || 'Production Team',
          actionDate: new Date().toISOString().split('T')[0]
        };
      }
      return h;
    });

    dispatch({
      type: 'REJECT_FAILED_WORK_ORDER',
      payload: {
        workOrderId: workOrder.id,
        orderNo: workOrder.orderNo,
        qcHistory: updatedHistory
      }
    });

    const notif = buildNotification(
      'QC Work Order Rejected',
      `Work Order ${workOrder.id} has been rejected. Parent order ${workOrder.orderNo} cancelled.`,
      'Sales',
      'High',
      workOrder.orderNo
    );
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    const audit = buildAuditLog(
      currentUser?.name,
      'QC Work Order Rejected',
      workOrder.id,
      'WORK_ORDER',
      'Rework',
      'Rejected',
      `Rejected failed work order. Order ${workOrder.orderNo} cancelled.`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    return ERPSuccess(workOrder);
  },

  updateReproduction: (state, reproductionId, fields, dispatch, currentUser) => {
    if (currentUser?.role !== 'Production' && currentUser?.role !== 'Super Admin') {
      return ERPError('Unauthorized: Only Production role can update reproductions.', 'UNAUTHORIZED');
    }

    dispatch({
      type: 'UPDATE_REPRODUCTION',
      payload: {
        id: reproductionId,
        ...fields
      }
    });

    const audit = buildAuditLog(
      currentUser?.name,
      'Reproduction Updated',
      reproductionId,
      'REPRODUCTION',
      'Pending',
      fields.status || 'Updated',
      `Updated reproduction queue details`
    );
    dispatch({ type: 'ADD_AUDIT_LOG', payload: audit });

    return ERPSuccess(reproductionId);
  }
};
