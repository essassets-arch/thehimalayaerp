import { apiClient } from '../lib/apiClient';
import { STATUS } from '../shared/constants';

export const normalizeMaterialLines = (request = {}) => {
  const source = Array.isArray(request.materials)
    ? request.materials
    : Array.isArray(request.items)
      ? request.items
      : request.materials && typeof request.materials === 'object'
        ? [request.materials]
        : request.items && typeof request.items === 'object'
          ? [request.items]
          : (request.materialName || request.material || request.name)
            ? [request]
            : [];

  return source.map((material) => ({
    ...material,
    materialName: material.materialName || material.material || material.name || '',
    quantityRequested: Number(
      material.quantityRequested ?? material.requestedQty ?? material.quantity ?? material.qty ?? 0
    ),
    quantityApproved: Number(
      material.quantityApproved ?? material.approvedQty ??
      material.quantityRequested ?? material.requestedQty ?? material.quantity ?? material.qty ?? 0
    ),
  })).filter((material) => material.materialName);
};

export const productionService = {
  planOrder: async (state, order, targetDate, priority, dispatch, currentUser) => {
    const payload = {
      sales_order_id: order.id,
      planned_start_date: new Date().toISOString().split('T')[0],
      planned_end_date: targetDate,
      status: STATUS.PLANNED,
      notes: `Plan generated from Sales Order ${order.orderNo}`
    };

    const res = await apiClient.post('/production/plans', payload);
    return { success: true, planId: res.planId };
  },

  createWorkOrder: async (state, order, dispatch, currentUser) => {
    const workOrderIds = order.work_order_ids || [];
    if (workOrderIds.length > 0) {
      // We have explicit work order IDs — activate each directly
      for (const woId of workOrderIds) {
        await apiClient.post('/workflow/transition', {
          entity: 'work_order',
          entityId: woId,
          transitionName: 'ACTIVATE_WORK_ORDER',
          notes: `Activated from Production Portal for Order ${order.orderNo}`
        });
      }
      return { success: true };
    } else {
      // We only know the sales order ID — let the backend resolve the PLANNED work order
      const salesOrderId = order.id;
      await apiClient.post('/workflow/transition', {
        entity: 'work_order_by_sales_order',
        entityId: salesOrderId,
        transitionName: 'ACTIVATE_WORK_ORDER',
        notes: `Activated from Production Portal for Order ${order.orderNo}`
      });
      return { success: true };
    }
  },

  raiseMaterialRequest: async (state, workOrder, materials, dispatch, currentUser) => {
    // Look up work order database ID
    const woDbId = workOrder.dbId || workOrder.id;
    const payload = {
      work_order_id: typeof woDbId === 'number' ? woDbId : null,
      materials: materials.map(m => ({
        materialName: m.material || m.materialName,
        quantityRequested: Number(m.qty || m.quantityRequested || 0)
      }))
    };

    const res = await apiClient.post('/production/material-requests', payload);
    return { success: true, requestId: res.data?.requestId || res.requestId };
  },

  approveMaterialRequest: async (state, request, targetQtyOverrides, statusOrIsApproved, dispatch, currentUser) => {
    const mrDbId = request.dbId || request.id;
    const statusVal = typeof statusOrIsApproved === 'string' 
      ? statusOrIsApproved 
      : (statusOrIsApproved ? 'Approved' : 'Rejected');

    const payload = {
      status: statusVal,
      materials: normalizeMaterialLines(request).map(m => {
        const override = targetQtyOverrides ? targetQtyOverrides[m.materialName] : null;
        return {
          materialName: m.materialName,
          quantityApproved: override !== undefined && override !== null ? Number(override) : Number(m.quantityRequested)
        };
      })
    };

    const res = await apiClient.patch(`/production/material-requests/${mrDbId}/status`, payload);
    return { success: true, data: res };
  },

  issueMaterial: async (state, request, department, dispatch, currentUser) => {
    const mrDbId = request.dbId || request.id;
    const materials = normalizeMaterialLines(request);
    if (!mrDbId) throw new Error('Material request ID is required.');
    if (materials.length === 0) throw new Error('No valid materials were found in this request.');

    const payload = {
      department: department || 'Production',
      materialsIssued: materials.map(m => ({
        materialName: m.materialName,
        quantityIssued: Number(m.quantityApproved ?? m.quantityRequested ?? 0)
      }))
    };

    const res = await apiClient.post(`/production/material-requests/${mrDbId}/issue`, payload);
    return { success: true, data: res };
  },

  startProduction: async (state, workOrder, machine, operator, shift, dispatch, currentUser) => {
    const woDbId = workOrder.dbId || workOrder.id;
    const res = await apiClient.post('/workflow/transition', {
      entity: 'work_order',
      entityId: woDbId,
      transitionName: 'START_PRODUCTION',
      payload: { machine, operator, shift },
      notes: `Started production on machine ${machine} by ${operator} during ${shift}`
    });
    return { success: true, data: res };
  },

  pauseProduction: async (state, workOrder, dispatch, currentUser) => {
    const woDbId = workOrder.dbId || workOrder.id;
    const res = await apiClient.post('/workflow/transition', {
      entity: 'work_order',
      entityId: woDbId,
      transitionName: 'PAUSE_PRODUCTION',
      payload: {},
      notes: 'Paused production'
    });
    return { success: true, data: res };
  },

  resumeProduction: async (state, workOrder, dispatch, currentUser) => {
    const woDbId = workOrder.dbId || workOrder.id;
    const res = await apiClient.post('/workflow/transition', {
      entity: 'work_order',
      entityId: woDbId,
      transitionName: 'RESUME_PRODUCTION',
      payload: {},
      notes: 'Resumed production'
    });
    return { success: true, data: res };
  },

  updateProductionProgress: async (state, workOrder, progress, stage, dispatch, currentUser) => {
    const woDbId = workOrder.dbId;
    const status = progress === 100 ? 'Completed' : 'In Production';

    const notesObj = {
      stage: stage,
      reworkCount: workOrder.reworkCount || 0,
      qcHistory: workOrder.qcHistory || []
    };

    const payload = {
      quantity_produced: (progress / 100) * workOrder.quantity,
      status: status,
      notes: JSON.stringify(notesObj)
    };

    const res = await apiClient.put(`/production/work-orders/${woDbId}`, payload);
    return { success: true, data: res };
  },

  completeProduction: async (state, workOrder, dispatch, currentUser, payload = {}) => {
    const woDbId = workOrder.dbId || workOrder.id;
    const res = await apiClient.patch(`/production/work-orders/${woDbId}/complete`, payload);
    return { success: true, data: res };
  },

  submitQCInspection: async (state, order, workOrder, qcResults, isApproved, dispatch, currentUser) => {
    const woDbId = workOrder.dbId || workOrder.id;
    
    // Construct defect history object
    const newInspection = {
      id: `QC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      inspector: currentUser?.name || 'QC Agent',
      result: isApproved ? 'Passed' : 'Failed',
      defects: qcResults.defects || []
    };

    const updatedQCHistory = [...(workOrder.qcHistory || []), newInspection];

    // Create the inspection record in QC table
    const payload = {
      work_order_id: woDbId,
      overall_result: isApproved ? 'Pass' : 'Fail',
      defects: qcResults.defects || [],
      dimension_result: qcResults.dimension || 'Pass',
      weight_result: qcResults.weight || 'Pass',
      strength_result: qcResults.strength || 'Pass',
      surface_result: qcResults.surface || 'Pass',
      packaging_result: qcResults.packaging || 'Pass'
    };

    const res = await apiClient.post('/production/qc', payload);

    // Trigger state-machine transition when possible. If the work order is already in a later QC state,
    // record the inspection and continue without blocking the user.
    const transitionName = isApproved ? 'QC_ACCEPT' : 'QC_REJECT';
    try {
      await apiClient.post('/workflow/transition', {
        entity: 'work_order',
        entityId: woDbId,
        transitionName,
        payload: {
          qcHistory: updatedQCHistory
        },
        notes: isApproved ? 'Quality control check passed.' : 'Quality control check failed. Routing to Rework.'
      });
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || '';
      if (!message.includes('ILLEGAL_TRANSITION') && !message.includes('Illegal transition')) {
        throw err;
      }
    }

    return { success: true, qcId: res.qcId };
  },

  getQCInspections: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const suffix = queryParams ? `?${queryParams}` : '';
    const res = await apiClient.get(`/production/qc${suffix}`);
    return res.data || res;
  },

  sendToReproduction: async (state, workOrder, dispatch, currentUser) => {
    const woDbId = workOrder.dbId;
    const notesObj = {
      stage: 'Awaiting Re-conversion',
      reworkCount: (workOrder.reworkCount || 0) + 1,
      qcHistory: workOrder.qcHistory || []
    };

    const payload = {
      quantity_produced: 0,
      status: STATUS.REWORK,
      notes: JSON.stringify(notesObj)
    };

    const res = await apiClient.put(`/production/work-orders/${woDbId}`, payload);
    return { success: true, data: res };
  },

  rejectFailedWorkOrder: async (state, workOrder, dispatch, currentUser) => {
    const woDbId = workOrder.dbId;
    const notesObj = {
      stage: 'Rejected',
      reworkCount: workOrder.reworkCount || 0,
      qcHistory: workOrder.qcHistory || []
    };

    const payload = {
      status: 'Cancelled',
      notes: JSON.stringify(notesObj)
    };

    const res = await apiClient.put(`/production/work-orders/${woDbId}`, payload);
    return { success: true, data: res };
  },

  updateReproduction: async (state, reproductionId, fields, dispatch, currentUser) => {
    return { success: true };
  },

  getDashboardStats: async () => {
    const res = await apiClient.get('/production/dashboard-stats');
    return res.data || res;
  },

  getProductionEntries: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await apiClient.get(`/production/production?${queryParams}`);
    return res.data || res;
  },

  createProductionEntry: async (payload) => {
    const res = await apiClient.post('/production/production', payload);
    return res.data || res;
  },

  getTestingEntries: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await apiClient.get(`/production/testing?${queryParams}`);
    return res.data || res;
  },

  getTestingEntryById: async (id) => {
    const res = await apiClient.get(`/production/testing/${id}`);
    return res.data || res;
  },

  updateTestingEntry: async (id, payload) => {
    const res = await apiClient.put(`/production/testing/${id}`, payload);
    return res.data || res;
  },

  approveTestingEntry: async (id, payload) => {
    const res = await apiClient.post(`/production/testing/${id}/approve`, payload);
    return res.data || res;
  },

  deleteTestingEntry: async (id) => {
    const res = await apiClient.delete(`/production/testing/${id}`);
    return res.data || res;
  },

  getRejectionEntries: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await apiClient.get(`/production/rejection?${queryParams}`);
    return res.data || res;
  },

  createRejectionEntry: async (payload) => {
    const res = await apiClient.post('/production/rejection', payload);
    return res.data || res;
  },

  executeRejectionAction: async (id, payload) => {
    const res = await apiClient.post(`/production/rejection/${id}/action`, payload);
    return res.data || res;
  }
};
