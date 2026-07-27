'use client';

import React, { useEffect, useCallback } from 'react';
import { useERPStore, getProcurementAnalytics } from '../../store/erpStore';
import { apiClient } from '../../lib/apiClient';
import { deepEqual } from '../../lib/deepEqual';
import { useNotifications } from './NotificationContext';

export { useERPStore };

let syncInFlight = false;
let lastSyncStartedAt = 0;

export const useERP = () => {
  const store = useERPStore();
  const notificationStore = useNotifications();

  const notify = (title, message, role) => {
    if (notificationStore?.addNotification) {
      notificationStore.addNotification({
        title,
        message,
        targetRole: role,
        read: false,
        timestamp: new Date().toISOString()
      });
    }
  };

  const syncData = useCallback(async () => {
    const now = Date.now();
    if (syncInFlight || now - lastSyncStartedAt < 250) return;
    lastSyncStartedAt = now;
    syncInFlight = true;
    try {
      const currentStore = useERPStore.getState();
      const currentState = currentStore.state;
      const [customersRes] = await Promise.all([
        apiClient.get('/admin-ops/customers').catch(() => ({ success: false })),
      ]);

      const latestStore = useERPStore.getState();
      const latestState = latestStore.state;
      const currentProcurement = latestState.procurement || {};
      const currentSales = latestState.sales || {};

      let materialIndents = Array.isArray(currentProcurement.materialIndents) && currentProcurement.materialIndents.length > 0
        ? currentProcurement.materialIndents
        : (typeof window !== 'undefined' && JSON.parse(window.localStorage.getItem('erp_material_indents') || 'null')) || (currentProcurement.materialIndents || []);

      let purchaseOrders = Array.isArray(currentProcurement.purchaseOrders) && currentProcurement.purchaseOrders.length > 0
        ? currentProcurement.purchaseOrders
        : (typeof window !== 'undefined' && JSON.parse(window.localStorage.getItem('erp_purchase_orders') || 'null')) || (currentProcurement.purchaseOrders || []);

      let goodsReceiptNotes = Array.isArray(currentProcurement.goodsReceiptNotes) && currentProcurement.goodsReceiptNotes.length > 0
        ? currentProcurement.goodsReceiptNotes
        : (typeof window !== 'undefined' && JSON.parse(window.localStorage.getItem('erp_goods_receipts') || 'null')) || (currentProcurement.goodsReceiptNotes || []);

      let dispatches = latestState.dispatches || [];
      let vendorReturns = latestState.vendorReturns || [];
      let notifications = latestState.notifications || [];
      let analysisRequests = latestState.analysisRequests || [];
      let vendorInvoices = latestState.vendorInvoices || [];
      let vendorPayments = latestState.vendorPayments || [];
      let rawInventory = latestState.rawInventory || [];
      let reminders = latestState.reminders || [];

      if (typeof window !== 'undefined' && window.localStorage) {
        const getLocal = (key, fallback) => {
          const val = JSON.parse(window.localStorage.getItem(key) || 'null');
          return Array.isArray(val) && val.length > 0 ? val : fallback;
        };
        dispatches = getLocal('erp_dispatches', dispatches);
        vendorReturns = getLocal('erp_vendor_returns', vendorReturns);
        notifications = getLocal('erp_notifications', notifications);
        analysisRequests = getLocal('erp_analysis_requests_v1', analysisRequests);
        vendorInvoices = getLocal('erp_vendor_invoices', vendorInvoices);
        vendorPayments = getLocal('erp_vendor_payments', vendorPayments);
        rawInventory = getLocal('erp_inventory', rawInventory);
        reminders = getLocal('erp_reminders', reminders);
      }

      const nextState = {
        ...latestState,
        customers: customersRes.success ? (customersRes.customers || customersRes.data || []) : latestState.customers || [],
        workOrders: latestState.workOrders || [],
        dispatches,
        notifications,
        vendorReturns,
        analysisRequests,
        purchaseIndents: materialIndents,
        purchaseOrders,
        goodsReceipts: goodsReceiptNotes,
        vendorInvoices,
        vendorPayments,
        rawInventory,
        reminders,
        procurement: {
          ...currentProcurement,
          materialIndents,
          purchaseOrders,
          goodsReceiptNotes
        },
        // Sales is local-canonical. Never hydrate it from the legacy mock API.
        sales: {
          leads: Array.isArray(currentSales.leads) ? currentSales.leads : [],
          samples: Array.isArray(currentSales.samples) ? currentSales.samples : [],
          quotations: Array.isArray(currentSales.quotations) ? currentSales.quotations : [],
          orders: Array.isArray(currentSales.orders) ? currentSales.orders : [],
          paymentConfirmations: Array.isArray(currentSales.paymentConfirmations) ? currentSales.paymentConfirmations : [],
          replacementRequests: Array.isArray(currentSales.replacementRequests) ? currentSales.replacementRequests : [],
          returnRequests: Array.isArray(currentSales.returnRequests) ? currentSales.returnRequests : [],
        },
      };

      if (!deepEqual(nextState, latestState)) {
        latestStore.setState(nextState);
      }
    } catch (err) {
      console.error('[ERPContext] Failed to sync data', err);
    } finally {
      syncInFlight = false;
    }
  }, []);

  return {
    ...store,
    state: store.state,
    setState: store.setState,
    hasHydrated: store.hasHydrated,

    // ── Sales domain actions (grouped namespace) ──────────────────────────
    salesActions: store.salesActions,

    // ── Backwards-compatible shims ────────────────────────────────────────
    verifyFinancePayment: store.verifyFinancePayment,
    rejectFinancePayment: store.rejectFinancePayment,
    approveOrderQC: store.approveOrderQC,
    failOrderQC: store.failOrderQC,
    submitForQC: store.submitForQC,
    submitQCInspection: store.submitQCInspection,
    startReproduction: store.startReproduction,
    completeReproduction: store.completeReproduction,
    createDispatchRecord: store.createDispatchRecord,
    startDispatchDelivery: store.startDispatchDelivery,
    confirmDelivered: store.confirmDelivered,
    submitSalesPayment: store.submitSalesPayment,
    closeOrder: store.closeOrder,
    updateRequestStatus: ((id, status, data) => {}),

    // --- Procurement Actions ---
    createMaterialIndent: (payload) => {
      const res = store.createMaterialIndent(payload);
      notify('Indent Created', 'A new material indent is awaiting approval', 'Plant Head');
      return res;
    },
    approveMaterialIndent: (id, quantity, remarks) => {
      const res = store.approveMaterialIndent(id, quantity, remarks);
      notify('Indent Approved', 'Material indent has been approved by Plant Head', 'Finance');
      return res;
    },
    returnMaterialIndent: (id, remarks) => {
      const res = store.returnMaterialIndent(id, remarks);
      notify('Indent Returned', 'Material indent returned for correction', 'Store');
      return res;
    },
    rejectMaterialIndent: (id, remarks) => {
      const res = store.rejectMaterialIndent(id, remarks);
      notify('Indent Rejected', 'Material indent has been rejected', 'Store');
      return res;
    },
    createPurchaseIndent: (data) => {
      const res = store.createPurchaseIndent(data);
      notify('Indent Created', 'A new purchase indent is awaiting approval', 'Plant Head');
      return res;
    },
    updatePurchaseIndent: store.updatePurchaseIndent,
    resubmitPurchaseIndent: store.resubmitPurchaseIndent,
    approvePurchaseIndent: (id, quantity, remarks) => {
      const res = store.approvePurchaseIndent(id, quantity, remarks);
      notify('Indent Approved', 'Indent has been approved by Plant Head', 'Finance');
      return res;
    },
    rejectPurchaseIndent: store.rejectPurchaseIndent,
    cancelPurchaseIndent: store.cancelPurchaseIndent,
    createPurchaseOrderFromIndent: store.createPurchaseOrderFromIndent,
    updatePurchaseOrder: store.updatePurchaseOrder,
    submitPurchaseOrder: (id) => {
      const res = store.submitPurchaseOrder(id);
      const pos = store.state.procurement?.purchaseOrders || store.state.purchaseOrders || [];
      const po = pos.find(p => p.id === id);
      if (po && po.grandTotal > 50000) {
        notify('PO Approval Required', 'A PO exceeding ₹50,000 requires your approval', 'Super Admin');
      } else {
        notify('PO Auto-Approved', 'A PO under ₹50,000 has been auto-approved', 'Finance');
      }
      return res;
    },
    approvePurchaseOrder: (id, remarks, approver) => {
      const res = store.approvePurchaseOrder(id, remarks, approver);
      notify('PO Approved', 'Super Admin has approved the PO', 'Finance');
      return res;
    },
    rejectPurchaseOrder: store.rejectPurchaseOrder,
    issuePurchaseOrder: (id, poNo) => {
      const res = store.issuePurchaseOrder(id, poNo);
      notify('PO Issued', `Purchase Order ${poNo || id} has been issued`, 'Store');
      return res;
    },
    acceptPurchaseOrderByVendor: store.acceptPurchaseOrderByVendor,
    amendPurchaseOrder: store.amendPurchaseOrder,
    cancelPurchaseOrder: store.cancelPurchaseOrder,

    createGoodsReceipt: (poId, data) => {
      store.createGoodsReceipt(poId, data);
      notify('GRN Submitted', `GRN submitted and awaits inspection`, 'QC');
    },
    approveGoodsReceipt: (id, remarks) => {
      store.approveGoodsReceipt(id, remarks);
      notify('QC Approved', 'Goods Receipt has passed Quality Check', 'Store');
    },
    rejectGoodsReceipt: store.rejectGoodsReceipt,
    postGoodsReceiptToStock: (id) => {
      store.postGoodsReceiptToStock(id);
      notify('Stock Posted', 'Inventory updated. Ready for vendor payment processing.', 'Finance');
    },

    createVendorInvoice: store.createVendorInvoice,
    verifyVendorInvoice: store.verifyVendorInvoice,
    createVendorPayment: store.createVendorPayment,
    completeVendorPayment: (id, data) => {
      store.completeVendorPayment(id, data);
      notify('Payment Completed', 'Vendor payment has been processed successfully.', 'Store');
    },
    cancelVendorPayment: store.cancelVendorPayment,
    attachDocumentMeta: store.attachDocumentMeta,

    updateVendorReturnStatus: store.updateVendorReturnStatus,
    createReplacementGRN: store.createReplacementGRN,

    getProcurementAnalytics: () => getProcurementAnalytics ? getProcurementAnalytics(store.state) : {},

    dispatch: async (action) => {
      const { type, payload } = action;
      let nextState = { ...store.state };

      switch (type) {
        case 'UPDATE_ORDER_STATUS': {
          const orderId = payload.id || payload.orderId || payload.orderNo;
          if (typeof store.updateOrderStatus === 'function') {
            try {
              store.updateOrderStatus(orderId, payload.status, payload);
            } catch (err) {
              console.error('Strict order status transition failed:', err.message);
            }
          }
          // Also update state.sales.orders
          nextState.sales = {
            ...(nextState.sales || {}),
            orders: (nextState.sales?.orders || []).map(o =>
              (o.id === orderId || o.orderNo === orderId) ? { ...o, ...payload } : o
            ),
          };
          store.setState(nextState);
          break;
        }
        case 'UPDATE_ORDER': {
          const orderId = payload.orderNo || payload.id;
          try {
            if (payload.status === 'PLANT_ACCEPTED' || payload.workflowStatus === 'PLANT_ACCEPTED') {
              store.salesActions?.acceptOrderByPlantHead(orderId, { remarks: 'Accepted via Portal' }, 'Plant Head');
            } else if (payload.status === 'PRODUCTION_PLANNED' || payload.workflowStatus === 'PRODUCTION_PLANNED') {
              store.salesActions?.planOrder(orderId, { machine: payload.machineId || 'Main Assembly' }, 'Plant Head');
            } else if (payload.status === 'PRODUCTION_STARTED' || payload.workflowStatus === 'PRODUCTION_STARTED') {
              store.salesActions?.activateWorkOrder(orderId, 'Production');
            } else if (payload.status === 'PRODUCTION_COMPLETED' || payload.workflowStatus === 'PRODUCTION_COMPLETED') {
              store.salesActions?.completeProduction(orderId, 'Production');
            } else if (payload.status === 'QC_APPROVED' || payload.workflowStatus === 'QC_APPROVED') {
              store.salesActions?.approveQC(orderId, payload.remarks || 'Approved', 'QC');
            } else if (payload.dispatchStatus === 'Delivered') {
              store.salesActions?.confirmDelivery(orderId, 'Dispatch');
            }
          } catch (err) {
            console.error('Sales action mapping caught an invalid transition:', err.message);
          }
          break;
        }
        case 'ADD_NOTIFICATION':
          nextState.notifications = [...(nextState.notifications || []), payload];
          store.setState(nextState);
          break;
        case 'ADD_RAW_MATERIAL':
          nextState.rawInventory = [...(nextState.rawInventory || []), { ...payload, id: `RM-${Date.now()}` }];
          store.setState(nextState);
          break;
        case 'EDIT_RAW_MATERIAL':
          nextState.rawInventory = (nextState.rawInventory || []).map(m => m.id === payload.id ? { ...m, ...payload } : m);
          store.setState(nextState);
          break;
        case 'DELETE_RAW_MATERIAL':
          nextState.rawInventory = (nextState.rawInventory || []).filter(m => m.id !== payload.id);
          store.setState(nextState);
          break;
        default:
          break;
      }
    },

    createAnalysisRequest: store.createAnalysisRequest,
    saveAnalysisRequestDraft: store.saveAnalysisRequestDraft,
    updateAnalysisRequest: store.updateAnalysisRequest,
    submitAnalysisRequest: store.submitAnalysisRequest,
    startFinanceAnalysis: store.startFinanceAnalysis,
    returnAnalysisRequestToStore: store.returnAnalysisRequestToStore,
    rejectAnalysisRequestByFinance: store.rejectAnalysisRequestByFinance,
    submitAnalysisRequestToSuperAdmin: store.submitAnalysisRequestToSuperAdmin,
    returnAnalysisRequestToFinance: store.returnAnalysisRequestToFinance,
    returnAnalysisRequestToStoreByAdmin: store.returnAnalysisRequestToStoreByAdmin,
    rejectAnalysisRequestByAdmin: store.rejectAnalysisRequestByAdmin,
    approveAnalysisRequest: store.approveAnalysisRequest,
    approveTechnicalTrial: store.approveTechnicalTrial,
    startTrial: store.startTrial,
    submitTrialReport: store.submitTrialReport,
    requestTrialClarification: store.requestTrialClarification,
    completeAnalysisRequest: store.completeAnalysisRequest,

    // --- HR & Payroll Actions ---
    createPayrollBatch: store.createPayrollBatch,
    prepareSalary: store.prepareSalary,
    submitSalaryToSuperAdmin: store.submitSalaryToSuperAdmin,
    resubmitSalaryToSuperAdmin: store.resubmitSalaryToSuperAdmin,
    approveSalary: store.approveSalary,
    rejectSalary: store.rejectSalary,
    onHoldSalary: store.onHoldSalary,
    sendSalaryToFinance: store.sendSalaryToFinance,
    startSalaryPayment: store.startSalaryPayment,
    markSalaryAsPaid: store.markSalaryAsPaid,

    syncData,
  };
};

export const ERPProvider = ({ children }) => {
  const { syncData, state } = useERP();

  useEffect(() => {
    // Only run initialization if data is missing, to prevent overwriting newly converted orders
    const orders = state?.sales?.orders;
    if (!orders || (Array.isArray(orders) && orders.length === 0)) {
      syncData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
