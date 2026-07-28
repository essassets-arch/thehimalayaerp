import { create } from 'zustand';
import { assertTransition, createId, calculatePOLineTotals, createProcurementAuditEntry } from '../constants/procurement';

const persistToStorage = (state: any) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('erp_procurement_data_version', '1');

      if (Array.isArray(state.orders)) {
        window.localStorage.setItem('erp_orders', JSON.stringify(state.orders));
        window.localStorage.setItem('himalaya_orders', JSON.stringify(state.orders));
      }
      if (Array.isArray(state.workOrders)) {
        window.localStorage.setItem('erp_work_orders', JSON.stringify(state.workOrders));
      }
      if (Array.isArray(state.dispatches)) {
        window.localStorage.setItem('erp_dispatches', JSON.stringify(state.dispatches));
      }
      if (Array.isArray(state.payments)) {
        window.localStorage.setItem('erp_payments', JSON.stringify(state.payments));
      }
      if (Array.isArray(state.notifications)) {
        window.localStorage.setItem('erp_notifications', JSON.stringify(state.notifications));
      }
      if (Array.isArray(state.purchaseIndents)) {
        window.localStorage.setItem('erp_purchase_indents', JSON.stringify(state.purchaseIndents));
      }
      if (Array.isArray(state.purchaseOrders)) {
        window.localStorage.setItem('erp_purchase_orders', JSON.stringify(state.purchaseOrders));
      }
      if (Array.isArray(state.goodsReceipts)) {
        window.localStorage.setItem('erp_goods_receipts', JSON.stringify(state.goodsReceipts));
      }
      if (Array.isArray(state.vendorReturns)) {
        window.localStorage.setItem('erp_vendor_returns', JSON.stringify(state.vendorReturns));
      }
      if (Array.isArray(state.vendorInvoices)) {
        window.localStorage.setItem('erp_vendor_invoices', JSON.stringify(state.vendorInvoices));
      }
      if (Array.isArray(state.vendorPayments)) {
        window.localStorage.setItem('erp_vendor_payments', JSON.stringify(state.vendorPayments));
      }
      if (Array.isArray(state.rawInventory)) {
        window.localStorage.setItem('erp_inventory', JSON.stringify(state.rawInventory));
      }
      if (Array.isArray(state.analysisRequests)) {
        window.localStorage.setItem('erp_analysis_requests_v1', JSON.stringify(state.analysisRequests));
      }
    }
  } catch (e) {
    console.error('Failed to persist ERP state to localStorage', e);
  }
};

const matchOrderId = (item: any, targetId: string) => {
  if (!item || !targetId) return false;
  const tid = String(targetId).trim().toLowerCase();
  const idMatch = String(item.id || '').trim().toLowerCase() === tid;
  const oidMatch = String(item.orderId || '').trim().toLowerCase() === tid;
  const oNumMatch = String(item.orderNumber || '').trim().toLowerCase() === tid;
  const oNoMatch = String(item.orderNo || '').trim().toLowerCase() === tid;
  const wIdMatch = String(item.workOrderId || '').trim().toLowerCase() === tid;
  const wNoMatch = String(item.workOrderNo || '').trim().toLowerCase() === tid;
  const pvMatch = String(item.paymentVerificationId || item.payment_id || '').trim().toLowerCase() === tid;
  const dspMatch = String(item.dispatchId || '').trim().toLowerCase() === tid;

  const woDerived = `wo-${String(item.orderNo || item.id || '').split('-').slice(1).join('-') || item.id}`.toLowerCase();
  return idMatch || oidMatch || oNumMatch || oNoMatch || wIdMatch || wNoMatch || pvMatch || dspMatch || woDerived === tid;
};

const getInitialStateFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      orders: [], workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: []
    };
  }
  try {
    const getStorageList = (key: string) => {
      const data = window.localStorage.getItem(key);
      if (!data) return [];
      try { return JSON.parse(data) || []; } catch { return []; }
    };
    return {
      orders: getStorageList('erp_orders'),
      workOrders: getStorageList('erp_work_orders'),
      dispatches: getStorageList('erp_dispatches'),
      payments: getStorageList('erp_payments'),
      notifications: getStorageList('erp_notifications'),
      samples: getStorageList('erp_samples'),
      rawInventory: getStorageList('erp_inventory'),
      customers: getStorageList('erp_customers'),
      leads: [],
      quotations: getStorageList('erp_quotations'),
      purchaseIndents: getStorageList('erp_purchase_indents'),
      purchaseOrders: getStorageList('erp_purchase_orders'),
      goodsReceipts: getStorageList('erp_goods_receipts'),
      vendorInvoices: getStorageList('erp_vendor_invoices'),
      vendorPayments: getStorageList('erp_vendor_payments'),
      vendorReturns: getStorageList('erp_vendor_returns'),
      analysisRequests: getStorageList('erp_analysis_requests_v1')
    };
  } catch {
    return {
      orders: [], workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: []
    };
  }
};

const safePersist = (store: any, updater: (state: any) => any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const rawPOs = window.localStorage.getItem('erp_purchase_orders');
    if (rawPOs) {
      try {
        const storedPOs = JSON.parse(rawPOs);
        if (storedPOs?.length > 0 && store.state.purchaseOrders?.length > 0) {
          const latestStored = storedPOs[0]?.lastUpdatedAt;
          const latestMem = store.state.purchaseOrders[0]?.lastUpdatedAt;
          if (latestStored && latestMem && new Date(latestStored) > new Date(latestMem)) {
            // concurrency mismatch, could merge missing here, for now we will proceed to overwrite
          }
        }
      } catch (e) {}
    }
  }
  return updater(store);
};

export const useERPStore = create((set, get: any) => ({
  state: getInitialStateFromStorage(),
  setState: (newState: any) => {
    persistToStorage(newState);
    set({ state: newState });
  },
  quotationDraft: null,
  setQuotationDraft: (draft: any) => set({ quotationDraft: draft }),
  clearQuotationDraft: () => set({ quotationDraft: null }),

  // ---------------- PROCUREMENT WORKFLOW METHODS ----------------

  // --- Indents ---
  createPurchaseIndent: (data: any, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!data.items || data.items.length === 0) throw new Error("Indent requires at least one item");
    if (!data.requiredDate) throw new Error("Indent requires a requiredDate");
    const newIndent = { 
      ...data, 
      id: createId('IND'), 
      status: 'PENDING_PLANT_HEAD_APPROVAL', 
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('CREATE_INDENT', undefined, 'PENDING_PLANT_HEAD_APPROVAL', actorName, 'Store')]
    };
    const newState = { ...s.state, purchaseIndents: [newIndent, ...(s.state.purchaseIndents || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  updatePurchaseIndent: (indentId: string, data: any, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        if (ind.status !== 'PLANT_HEAD_REJECTED' && ind.status !== 'PENDING_PLANT_HEAD_APPROVAL') {
          throw new Error("Cannot edit indent unless pending or rejected");
        }
        return { ...ind, ...data, lastUpdatedAt: new Date().toISOString() };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  resubmitPurchaseIndent: (indentId: string, remarks: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PLANT_HEAD_REJECTED'], 'resubmit');
        return { 
          ...ind, 
          status: 'PENDING_PLANT_HEAD_APPROVAL', 
          plantHeadRemarks: '', 
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('RESUBMIT_INDENT', ind.status, 'PENDING_PLANT_HEAD_APPROVAL', actorName, 'Store', remarks)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  approvePurchaseIndent: (indentId: string, remarks: string, approverName: string = 'Plant Head') => set((store: any) => safePersist(store, (s) => {
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PENDING_PLANT_HEAD_APPROVAL'], 'approve');
        return { 
          ...ind, 
          status: 'PLANT_HEAD_APPROVED', 
          plantHeadRemarks: remarks, 
          plantHeadApprovedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('APPROVE_INDENT', ind.status, 'PLANT_HEAD_APPROVED', approverName, 'Plant Head', remarks)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectPurchaseIndent: (indentId: string, remarks: string, rejectorName: string = 'Plant Head') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Rejection remarks are mandatory");
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PENDING_PLANT_HEAD_APPROVAL'], 'reject');
        return { 
          ...ind, 
          status: 'PLANT_HEAD_REJECTED', 
          plantHeadRemarks: remarks, 
          plantHeadRejectedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('REJECT_INDENT', ind.status, 'PLANT_HEAD_REJECTED', rejectorName, 'Plant Head', remarks)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  cancelPurchaseIndent: (indentId: string, reason: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Cancellation reason mandatory");
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PENDING_PLANT_HEAD_APPROVAL', 'PLANT_HEAD_APPROVED'], 'cancel');
        return { 
          ...ind, 
          status: 'INDENT_CANCELLED',
          cancellationReason: reason,
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('CANCEL_INDENT', ind.status, 'INDENT_CANCELLED', actorName, 'User', reason)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),


  // --- Purchase Orders ---
  createPurchaseOrderFromIndent: (indentId: string, poData: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    let indentConverted = false;
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PLANT_HEAD_APPROVED'], 'convert to PO');
        indentConverted = true;
        return { 
          ...ind, 
          status: 'CONVERTED_TO_PO',
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('CONVERT_TO_PO', ind.status, 'CONVERTED_TO_PO', actorName, 'Finance')]
        };
      }
      return ind;
    });
    if (!indentConverted) throw new Error("Indent not found or not approved");
    
    const totals = calculatePOLineTotals(poData.items, poData.freightAmount);
    const newPO = { 
      ...poData, 
      ...totals,
      id: createId('DPO'), 
      indentId, 
      status: 'DRAFT', 
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('CREATE_DRAFT_PO', undefined, 'DRAFT', actorName, 'Finance')]
    };
    const newState = { ...s.state, purchaseIndents, purchaseOrders: [newPO, ...(s.state.purchaseOrders || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  updatePurchaseOrder: (poId: string, data: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['DRAFT', 'SUPER_ADMIN_REJECTED'], 'update');
        const items = data.items || po.items;
        const freight = data.freightAmount !== undefined ? data.freightAmount : po.freightAmount;
        const totals = calculatePOLineTotals(items, freight);
        return { 
          ...po, 
          ...data, 
          ...totals,
          status: 'DRAFT',
          lastUpdatedAt: new Date().toISOString()
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  submitPurchaseOrder: (poId: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['DRAFT'], 'submit');
        if (!po.vendorId && !po.vendorName) throw new Error("Vendor is required");
        if (!po.items || po.items.length === 0) throw new Error("At least one item is required");
        
        const nextStatus = po.grandTotal <= 50000 ? 'SUPER_ADMIN_APPROVED' : 'PENDING_SUPER_ADMIN_APPROVAL';
        const remarks = po.grandTotal <= 50000 ? 'Auto-approved via Financial Threshold <= ₹50,000' : 'Submitted for approval';
        
        return { 
          ...po, 
          status: nextStatus, 
          submittedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('SUBMIT_PO', po.status, nextStatus, actorName, 'Finance', remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  approvePurchaseOrder: (poId: string, remarks: string, approverName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['PENDING_SUPER_ADMIN_APPROVAL'], 'approve');
        return { 
          ...po, 
          status: 'SUPER_ADMIN_APPROVED', 
          superAdminRemarks: remarks, 
          approvedBy: approverName, 
          approvedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('APPROVE_PO', po.status, 'SUPER_ADMIN_APPROVED', approverName, 'Super Admin', remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectPurchaseOrder: (poId: string, remarks: string, rejectorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Rejection remarks are mandatory");
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['PENDING_SUPER_ADMIN_APPROVAL'], 'reject');
        return { 
          ...po, 
          status: 'SUPER_ADMIN_REJECTED', 
          superAdminRemarks: remarks, 
          rejectedBy: rejectorName, 
          rejectedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('REJECT_PO', po.status, 'SUPER_ADMIN_REJECTED', rejectorName, 'Super Admin', remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  issuePurchaseOrder: (poId: string, finalPoNumber?: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['SUPER_ADMIN_APPROVED'], 'issue');
        const poNumber = finalPoNumber || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        return { 
          ...po, 
          status: 'PO_ISSUED', 
          poNumber, 
          issuedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('ISSUE_PO', po.status, 'PO_ISSUED', actorName, 'Finance', `PO No: ${poNumber}`)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  acceptPurchaseOrderByVendor: (poId: string, data: any, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['PO_ISSUED'], 'vendor accept');
        if (!data.expectedDeliveryDate && !po.deliveryDate) throw new Error("Expected delivery date is required");
        return { 
          ...po, 
          status: 'VENDOR_ACCEPTED', 
          vendorResponse: {
            status: "ACCEPTED",
            respondedAt: new Date().toISOString(),
            expectedDeliveryDate: data.expectedDeliveryDate || po.deliveryDate,
            remarks: data.remarks || "Vendor acceptance simulated for prototype"
          },
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('VENDOR_ACCEPT_PO', po.status, 'VENDOR_ACCEPTED', actorName, 'Vendor', data.remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  amendPurchaseOrder: (poId: string, amendmentData: any, reason: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Amendment reason required");
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        const revNo = `Rev-${(po.amendments?.length || 0) + 1}`;
        const previousState = { items: po.items, freightAmount: po.freightAmount, grandTotal: po.grandTotal };
        const items = amendmentData.items || po.items;
        const freight = amendmentData.freightAmount !== undefined ? amendmentData.freightAmount : po.freightAmount;
        const totals = calculatePOLineTotals(items, freight);
        
        return {
          ...po,
          ...amendmentData,
          ...totals,
          amendments: [...(po.amendments || []), { revisionNo: revNo, amendedAt: new Date().toISOString(), amendedBy: actorName, reason, previousState, newState: totals }],
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('AMEND_PO', po.status, po.status, actorName, 'Finance', `${revNo}: ${reason}`)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  cancelPurchaseOrder: (poId: string, reason: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Cancellation reason required");
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['DRAFT', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'PO_ISSUED', 'VENDOR_ACCEPTED'], 'cancel');
        return { 
          ...po, 
          status: 'PO_CANCELLED',
          cancellationReason: reason,
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('CANCEL_PO', po.status, 'PO_CANCELLED', actorName, 'User', reason)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),


  // --- GRN & QC ---
  createGoodsReceipt: (poId: string, data: any, actorName: string = 'Store') => set((store: any) => safePersist(store, (s) => {
    let indentId = '';
    const existingGRNs = s.state.goodsReceipts || [];
    const vendorReturns = [...(s.state.vendorReturns || [])];
    
    const totalDelivered = Number(data.receivedQty || data.items?.reduce((acc: number, item: any) => acc + (Number(item.receivedQty || item.quantity) || 0), 0) || 0);
    const totalAccepted = Number(data.acceptedQty !== undefined ? data.acceptedQty : totalDelivered);
    const totalRejected = Number(data.rejectedQty !== undefined ? data.rejectedQty : Math.max(0, totalDelivered - totalAccepted));

    if (totalDelivered <= 0) throw new Error("Delivered quantity must be > 0");
    if (totalAccepted + totalRejected !== totalDelivered) throw new Error("Accepted + Rejected must equal Delivered quantity");

    const newGRNId = data.id || createId('GRN');
    const newGRNNo = data.grnNumber || useERPStore.getState().generateEntityId('grn');

    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId || po.poNumber === poId) {
        assertTransition('PurchaseOrder', po.status, ['VENDOR_ACCEPTED', 'PARTIALLY_RECEIVED'], 'create GRN');
        indentId = po.indentId || '';
        
        const poOrderedQty = Number(po.orderedQty || po.quantity || po.items?.reduce((acc: number, i: any) => acc + (Number(i.quantity) || 0), 0) || 1000);
        const prevDelivered = existingGRNs.filter((g: any) => (g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber) && g.status !== 'QUALITY_REJECTED').reduce((acc: number, g: any) => acc + (Number(g.receivedQty) || 0), 0);
        
        if (totalDelivered > (poOrderedQty - prevDelivered)) {
          throw new Error(`Delivered qty (${totalDelivered}) exceeds pending qty (${poOrderedQty - prevDelivered})`);
        }

        const nextStatus = (prevDelivered + totalDelivered) >= poOrderedQty ? 'GRN_SUBMITTED' : 'PARTIALLY_RECEIVED';
        
        return { 
          ...po, 
          status: nextStatus, 
          lastReceivedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('CREATE_GRN', po.status, nextStatus, actorName, 'Store', `GRN: ${newGRNNo}`)]
        };
      }
      return po;
    });

    if (totalRejected > 0 && !data.isReplacementGRN) {
      vendorReturns.push({
        id: createId('VRN'),
        returnNo: useERPStore.getState().generateEntityId('vendorReturn'),
        poNumber: poId,
        grnNumber: newGRNNo,
        grnId: newGRNId,
        vendorName: data.vendorName || 'Authorized Vendor',
        materialName: data.materialName || 'Procured Materials',
        rejectedQty: totalRejected,
        reason: data.remarks || 'Quality Check / Mismatch',
        status: 'WAITING_PICKUP',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      });
    }

    const newGRN = {
      ...data,
      id: newGRNId,
      grnNumber: newGRNNo,
      purchaseOrderId: poId,
      poNumber: poId,
      indentId,
      receivedQty: totalDelivered,
      acceptedQty: totalAccepted,
      rejectedQty: totalRejected,
      status: 'GRN_SUBMITTED',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('SUBMIT_GRN', undefined, 'GRN_SUBMITTED', actorName, 'Store')]
    };

    const newState = { ...s.state, purchaseOrders, vendorReturns, goodsReceipts: [newGRN, ...existingGRNs] };
    persistToStorage(newState);
    return { state: newState };
  })),

  approveGoodsReceipt: (grnId: string, remarks: string, inspectorName: string = 'QC') => set((store: any) => safePersist(store, (s) => {
    const goodsReceipts = (s.state.goodsReceipts || []).map((grn: any) => {
      if (grn.id === grnId) {
        assertTransition('GoodsReceipt', grn.status, ['GRN_SUBMITTED'], 'approve');
        return { 
          ...grn, 
          status: 'GRN_APPROVED', 
          qcRemarks: remarks, 
          approvedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(grn.auditTrail || []), createProcurementAuditEntry('APPROVE_GRN', grn.status, 'GRN_APPROVED', inspectorName, 'QC', remarks)]
        };
      }
      return grn;
    });
    const newState = { ...s.state, goodsReceipts };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectGoodsReceipt: (grnId: string, remarks: string, inspectorName: string = 'QC') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Rejection remarks mandatory");
    let foundGRN: any = null;
    const goodsReceipts = (s.state.goodsReceipts || []).map((grn: any) => {
      if (grn.id === grnId) {
        assertTransition('GoodsReceipt', grn.status, ['GRN_SUBMITTED'], 'reject');
        foundGRN = grn;
        return { 
          ...grn, 
          status: 'QUALITY_REJECTED', 
          qcRemarks: remarks, 
          rejectedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(grn.auditTrail || []), createProcurementAuditEntry('REJECT_GRN', grn.status, 'QUALITY_REJECTED', inspectorName, 'QC', remarks)]
        };
      }
      return grn;
    });
    
    const vendorReturns = [...(s.state.vendorReturns || [])];
    if (foundGRN && !vendorReturns.find(v => v.grnId === grnId)) {
      vendorReturns.push({
        id: createId('VRN'),
        returnNo: useERPStore.getState().generateEntityId('vendorReturn'),
        poNumber: foundGRN.poNumber || foundGRN.purchaseOrderId,
        grnNumber: foundGRN.grnNumber,
        grnId: foundGRN.id,
        vendorName: foundGRN.vendorName || 'Authorized Vendor',
        materialName: foundGRN.materialName || 'Procured Materials',
        rejectedQty: foundGRN.receivedQty || 0,
        reason: remarks,
        status: 'WAITING_PICKUP',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      });
    }

    const newState = { ...s.state, goodsReceipts, vendorReturns };
    persistToStorage(newState);
    return { state: newState };
  })),

  postGoodsReceiptToStock: (grnId: string, actorName: string = 'Store') => set((store: any) => safePersist(store, (s) => {
    let rawInventory = [...(s.state.rawInventory || [])];
    let foundGRN: any = null;

    const goodsReceipts = (s.state.goodsReceipts || []).map((grn: any) => {
      if (grn.id === grnId) {
        assertTransition('GoodsReceipt', grn.status, ['GRN_APPROVED'], 'post stock');
        foundGRN = grn;
        return { 
          ...grn, 
          status: 'STOCK_POSTED', 
          postedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(grn.auditTrail || []), createProcurementAuditEntry('POST_STOCK', grn.status, 'STOCK_POSTED', actorName, 'Store')]
        };
      }
      return grn;
    });

    if (!foundGRN) throw new Error("GRN not found");

    const items = foundGRN.items && foundGRN.items.length > 0 ? foundGRN.items : [{ code: foundGRN.materialCode || `RM-${Date.now()}`, name: foundGRN.materialName || 'Raw Material', acceptedQty: foundGRN.acceptedQty }];
    items.forEach((item: any) => {
      const qtyToAdd = Number(item.acceptedQty !== undefined ? item.acceptedQty : item.quantity) || 0;
      if (qtyToAdd > 0) {
        const invIdx = rawInventory.findIndex((r: any) => (item.code && r.code === item.code) || r.material === item.name);
        if (invIdx !== -1) {
          rawInventory[invIdx] = { ...rawInventory[invIdx], stock: (Number(rawInventory[invIdx].stock) || 0) + qtyToAdd };
        } else {
          rawInventory.push({ code: item.code || `RM-${Date.now()}`, material: item.name, stock: qtyToAdd, unit: item.unit || 'Kg' });
        }
      }
    });

    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === foundGRN.purchaseOrderId || po.poNumber === foundGRN.purchaseOrderId || po.poNumber === foundGRN.poNumber) {
        const poOrderedQty = Number(po.orderedQty || po.quantity || po.items?.reduce((acc: number, i: any) => acc + (Number(i.quantity) || 0), 0) || 1000);
        const allPoGRNs = goodsReceipts.filter((g: any) => g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber || g.poNumber === po.poNumber);
        
        const allPosted = allPoGRNs.every((g: any) => g.status === 'STOCK_POSTED' || g.status === 'QUALITY_REJECTED' || g.status === 'GRN Returned to Store');
        const totalAcceptedQty = allPoGRNs.reduce((acc: number, g: any) => acc + (Number(g.acceptedQty) || 0), 0);
        
        if (allPosted && totalAcceptedQty >= poOrderedQty) {
          return { ...po, status: 'STOCK_POSTED', lastUpdatedAt: new Date().toISOString(), auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('PO_STOCK_POSTED', po.status, 'STOCK_POSTED', 'System', 'System')] };
        }
      }
      return po;
    });

    const newState = { ...s.state, goodsReceipts, rawInventory, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),


  // --- Invoices & Payments ---
  createVendorInvoice: (poId: string, data: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const newInvoice = {
      ...data,
      id: createId('INV'),
      poId,
      status: 'INVOICE_SUBMITTED',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('SUBMIT_INVOICE', undefined, 'INVOICE_SUBMITTED', actorName, 'Finance')]
    };
    const newState = { ...s.state, vendorInvoices: [newInvoice, ...(s.state.vendorInvoices || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  verifyVendorInvoice: (invoiceId: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const vendorInvoices = (s.state.vendorInvoices || []).map((inv: any) => {
      if (inv.id === invoiceId) {
        assertTransition('VendorInvoice', inv.status, ['INVOICE_SUBMITTED'], 'verify');
        return { 
          ...inv, 
          status: 'INVOICE_VERIFIED',
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(inv.auditTrail || []), createProcurementAuditEntry('VERIFY_INVOICE', inv.status, 'INVOICE_VERIFIED', actorName, 'Finance')]
        };
      }
      return inv;
    });
    const newState = { ...s.state, vendorInvoices };
    persistToStorage(newState);
    return { state: newState };
  })),

  createVendorPayment: (poId: string, invoiceId: string, data: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    // Validate PO has posted GRNs
    const poGRNs = (s.state.goodsReceipts || []).filter((g: any) => g.purchaseOrderId === poId || g.poNumber === poId);
    if (!poGRNs.some((g: any) => g.status === 'STOCK_POSTED')) {
      throw new Error("Cannot pay without at least one STOCK_POSTED GRN");
    }

    const newPayment = { 
      ...data, 
      id: createId('PAY'),
      purchaseOrderId: poId,
      invoiceId, 
      status: 'PAYMENT_PENDING', 
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('CREATE_PAYMENT', undefined, 'PAYMENT_PENDING', actorName, 'Finance')]
    };
    const newState = { ...s.state, vendorPayments: [newPayment, ...(s.state.vendorPayments || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  completeVendorPayment: (paymentId: string, data: any, actorName: string = 'Finance Executive') => set((store: any) => safePersist(store, (s) => {
    if (!data.transactionId && !data.utrNo) throw new Error("Transaction ID / UTR required to complete payment");
    
    let poIdToClose = '';
    let invoiceIdToClose = '';
    
    const vendorPayments = (s.state.vendorPayments || []).map((vp: any) => {
      if (vp.id === paymentId) {
        assertTransition('VendorPayment', vp.status, ['PAYMENT_PENDING'], 'complete');
        poIdToClose = vp.purchaseOrderId;
        invoiceIdToClose = vp.invoiceId;
        return { 
          ...vp, 
          ...data,
          status: 'PAYMENT_COMPLETED', 
          completedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(vp.auditTrail || []), createProcurementAuditEntry('COMPLETE_PAYMENT', vp.status, 'PAYMENT_COMPLETED', actorName, 'Finance', data.transactionId)]
        };
      }
      return vp;
    });

    const vendorInvoices = (s.state.vendorInvoices || []).map((inv: any) => {
      if (inv.id === invoiceIdToClose) {
        return { ...inv, status: 'INVOICE_PAID', lastUpdatedAt: new Date().toISOString() };
      }
      return inv;
    });

    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poIdToClose || po.poNumber === poIdToClose) {
        // Strict PO Closing Check
        const allPoGRNs = (s.state.goodsReceipts || []).filter((g: any) => g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber || g.poNumber === po.poNumber);
        const poVRNs = (s.state.vendorReturns || []).filter((v: any) => v.poNumber === po.id || v.poNumber === po.poNumber);
        const poPayments = vendorPayments.filter((vp: any) => vp.purchaseOrderId === po.id || vp.purchaseOrderId === po.poNumber);

        const allGRNsPosted = allPoGRNs.length > 0 && allPoGRNs.every((g: any) => g.status === 'STOCK_POSTED' || g.status === 'QUALITY_REJECTED' || g.status === 'GRN Returned to Store');
        const allReturnsResolved = poVRNs.every((v: any) => v.status === 'REPLACED' || v.status === 'CLOSED' || v.status === 'Replacement Received' || v.status === 'Replacement Settled' || v.status === 'Canceled');
        const totalCompletedPayment = poPayments.filter((vp: any) => vp.status === 'PAYMENT_COMPLETED').reduce((acc: number, vp: any) => acc + (Number(vp.amount) || 0), 0);
        
        const finalPayable = po.grandTotal || 0;

        if (allGRNsPosted && allReturnsResolved && totalCompletedPayment >= finalPayable * 0.95) {
          return { 
            ...po, 
            status: 'PO_CLOSED', 
            closedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
            auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('CLOSE_PO', po.status, 'PO_CLOSED', 'System', 'System', 'All criteria met')]
          };
        }
      }
      return po;
    });

    const newState = { ...s.state, vendorPayments, vendorInvoices, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  cancelVendorPayment: (paymentId: string, reason: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Cancellation reason required");
    const vendorPayments = (s.state.vendorPayments || []).map((vp: any) => {
      if (vp.id === paymentId) {
        assertTransition('VendorPayment', vp.status, ['PAYMENT_PENDING'], 'cancel');
        return { 
          ...vp, 
          status: 'PAYMENT_CANCELLED',
          cancellationReason: reason,
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(vp.auditTrail || []), createProcurementAuditEntry('CANCEL_PAYMENT', vp.status, 'PAYMENT_CANCELLED', actorName, 'Finance', reason)]
        };
      }
      return vp;
    });
    const newState = { ...s.state, vendorPayments };
    persistToStorage(newState);
    return { state: newState };
  })),

  attachDocumentMeta: (entityType: string, entityId: string, docMeta: any) => set((store: any) => safePersist(store, (s) => {
    const metaRecord = { ...docMeta, id: createId('DOC'), uploadedAt: new Date().toISOString() };
    const updater = (items: any[]) => (items || []).map(item => {
      if (item.id === entityId || item.poNumber === entityId) {
        return { ...item, documents: [...(item.documents || []), metaRecord], lastUpdatedAt: new Date().toISOString() };
      }
      return item;
    });

    let newState = { ...s.state };
    if (entityType === 'PO') newState.purchaseOrders = updater(newState.purchaseOrders);
    else if (entityType === 'GRN') newState.goodsReceipts = updater(newState.goodsReceipts);
    else if (entityType === 'INVOICE') newState.vendorInvoices = updater(newState.vendorInvoices);
    
    persistToStorage(newState);
    return { state: newState };
  })),

  // --- Vendor Returns ---
  updateVendorReturnStatus: (vrnId: string, status: string, remarks?: string) => {
    set((store: any) => {
      const vendorReturns = (store.state.vendorReturns || []).map((vrn: any) => {
        if (vrn.id === vrnId || vrn.returnNo === vrnId) {
          return { ...vrn, status, lastUpdatedAt: new Date().toISOString() };
        }
        return vrn;
      });
      const newState = { ...store.state, vendorReturns };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  createReplacementGRN: (poId: string, vrnId: string, data: any) => {
    set((store: any) => {
      const vendorReturns = (store.state.vendorReturns || []).map((vrn: any) => {
        if (vrn.id === vrnId || vrn.returnNo === vrnId) {
          return { ...vrn, status: 'REPLACED' };
        }
        return vrn;
      });

      const newGRNId = createId('GRN');
      const newGRNNo = data.grnNumber || useERPStore.getState().generateEntityId('grn');
      const totalReceived = Number(data.receivedQty || data.quantity || 0);
      const totalAccepted = Number(data.acceptedQty !== undefined ? data.acceptedQty : totalReceived);

      const newGRN = {
        ...data,
        id: newGRNId,
        grnNumber: newGRNNo,
        purchaseOrderId: poId,
        poNumber: poId,
        isReplacementGRN: true,
        linkedVRNId: vrnId,
        receivedQty: totalReceived,
        acceptedQty: totalAccepted,
        rejectedQty: 0,
        status: 'GRN_SUBMITTED',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      };

      const newState = { ...store.state, goodsReceipts: [newGRN, ...(store.state.goodsReceipts || [])], vendorReturns };
      persistToStorage(newState);
      return { state: newState };
    });
  },
}));
