'use client';

import React, { useEffect, useCallback } from 'react';
import { useERPStore, getProcurementAnalytics } from '../../store/erpStore';
import { apiClient } from '../../lib/apiClient';
import { useNotificationStore } from './NotificationContext';

export { useERPStore };

export const useERP = () => {
  const store = useERPStore();
  const notificationStore = useNotificationStore ? useNotificationStore() : null;

  // Enhance store actions with notifications
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
    try {
      const [leadsRes, samplesRes, quotesRes, ordersRes, paymentsRes, customersRes, workOrdersRes] = await Promise.all([
        apiClient.get('/sales/leads').catch(() => ({ success: false })),
        apiClient.get('/sales/samples').catch(() => ({ success: false })),
        apiClient.get('/sales/quotations').catch(() => ({ success: false })),
        apiClient.get('/sales/orders').catch(() => ({ success: false })),
        apiClient.get('/finance/payments').catch(() => ({ success: false })),
        apiClient.get('/admin-ops/customers').catch(() => ({ success: false })),
        apiClient.get('/production/work-orders').catch(() => ({ success: false })),
      ]);

      let orders = ordersRes.success ? (ordersRes.orders || ordersRes.data || []) : store.state.orders || [];
      let payments = paymentsRes.success ? (paymentsRes.payments || paymentsRes.data || []) : store.state.payments || [];
      let workOrders = workOrdersRes.success ? (workOrdersRes.workOrders || workOrdersRes.orders || workOrdersRes.data || []) : store.state.workOrders || [];
      let dispatches = store.state.dispatches || [];
      let notifications = store.state.notifications || [];
      let vendorReturns = store.state.vendorReturns || [];
      let analysisRequests = store.state.analysisRequests || [];

      // Procurement collections
      let purchaseIndents = store.state.purchaseIndents || [];
      let purchaseOrders = store.state.purchaseOrders || [];
      let goodsReceipts = store.state.goodsReceipts || [];
      let vendorInvoices = store.state.vendorInvoices || [];
      let vendorPayments = store.state.vendorPayments || [];
      let rawInventory = store.state.rawInventory || [];

      if (typeof window !== 'undefined' && window.localStorage) {
        if (ordersRes.success) {
          window.localStorage.setItem('erp_orders', JSON.stringify(orders));
          window.localStorage.setItem('himalaya_orders', JSON.stringify(orders));
        } else {
          const storedOrders = JSON.parse(window.localStorage.getItem('erp_orders') || window.localStorage.getItem('himalaya_orders') || 'null');
          if (Array.isArray(storedOrders) && storedOrders.length > 0) orders = storedOrders;
        }

        if (paymentsRes.success) {
          window.localStorage.setItem('erp_payments', JSON.stringify(payments));
        } else {
          const storedPayments = JSON.parse(window.localStorage.getItem('erp_payments') || 'null');
          if (Array.isArray(storedPayments)) payments = storedPayments;
        }

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
      }

      const currentProcurement = store.state.procurement || {};
      const materialIndents = Array.isArray(currentProcurement.materialIndents) && currentProcurement.materialIndents.length > 0
        ? currentProcurement.materialIndents
        : (typeof window !== 'undefined' && JSON.parse(window.localStorage.getItem('erp_material_indents') || 'null')) || (currentProcurement.materialIndents || []);

      const purchaseOrders = Array.isArray(currentProcurement.purchaseOrders) && currentProcurement.purchaseOrders.length > 0
        ? currentProcurement.purchaseOrders
        : (typeof window !== 'undefined' && JSON.parse(window.localStorage.getItem('erp_purchase_orders') || 'null')) || (currentProcurement.purchaseOrders || []);

      const goodsReceipts = Array.isArray(currentProcurement.goodsReceiptNotes) && currentProcurement.goodsReceiptNotes.length > 0
        ? currentProcurement.goodsReceiptNotes
        : (typeof window !== 'undefined' && JSON.parse(window.localStorage.getItem('erp_goods_receipts') || 'null')) || (currentProcurement.goodsReceiptNotes || []);

      store.setState({
        ...store.state,
        leads: Array.isArray(store.state.sales?.leads) ? store.state.sales.leads : [],
        samples: samplesRes.success ? (samplesRes.samples || samplesRes.data || []) : store.state.samples || [],
        quotations: quotesRes.success ? (quotesRes.quotations || quotesRes.data || []) : store.state.quotations || [],
        orders,
        payments,
        customers: customersRes.success ? (customersRes.customers || customersRes.data || []) : store.state.customers || [],
        workOrders,
        dispatches,
        notifications,
        vendorReturns,
        analysisRequests,
        purchaseIndents: materialIndents,
        purchaseOrders,
        goodsReceipts,
        vendorInvoices,
        vendorPayments,
        rawInventory,
        procurement: {
          ...currentProcurement,
          materialIndents,
          purchaseOrders,
          goodsReceiptNotes: goodsReceipts
        }
      });
    } catch (err) {
      console.error('[ERPContext] Failed to sync data', err);
    }
  }, [store]);

  return {
    ...store,
    state: store.state,
    setState: store.setState,
    approveOrderQC: store.approveOrderQC,
    failOrderQC: store.failOrderQC,
    createDispatchRecord: store.createDispatchRecord,
    startDispatchDelivery: store.startDispatchDelivery,
    confirmDelivered: store.confirmDelivered,
    submitSalesPayment: store.submitSalesPayment,
    verifyFinancePayment: store.verifyFinancePayment,
    closeOrder: store.closeOrder,
    updateRequestStatus: ((id, status, data) => {}),

    // --- Procurement Actions (Exported directly from Zustand) ---
    createPurchaseIndent: (data) => {
      store.createPurchaseIndent(data);
      notify('Indent Created', 'A new purchase indent is awaiting approval', 'Plant Head');
    },
    updatePurchaseIndent: store.updatePurchaseIndent,
    resubmitPurchaseIndent: store.resubmitPurchaseIndent,
    approvePurchaseIndent: (id, remarks) => {
      store.approvePurchaseIndent(id, remarks);
      notify('Indent Approved', 'Indent has been approved by Plant Head', 'Finance');
    },
    rejectPurchaseIndent: store.rejectPurchaseIndent,
    cancelPurchaseIndent: store.cancelPurchaseIndent,

    createPurchaseOrderFromIndent: store.createPurchaseOrderFromIndent,
    updatePurchaseOrder: store.updatePurchaseOrder,
    submitPurchaseOrder: (id) => {
      store.submitPurchaseOrder(id);
      const po = store.state.purchaseOrders.find(p => p.id === id);
      if (po && po.grandTotal > 50000) {
        notify('PO Approval Required', 'A PO exceeding ₹50,000 requires your approval', 'Super Admin');
      } else {
        notify('PO Auto-Approved', 'A PO under ₹50,000 has been auto-approved', 'Finance');
      }
    },
    approvePurchaseOrder: (id, remarks, approver) => {
      store.approvePurchaseOrder(id, remarks, approver);
      notify('PO Approved', 'Super Admin has approved the PO', 'Finance');
    },
    rejectPurchaseOrder: store.rejectPurchaseOrder,
    issuePurchaseOrder: (id, poNo) => {
      store.issuePurchaseOrder(id, poNo);
      notify('PO Issued', `Purchase Order ${poNo || id} has been issued`, 'Store');
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
        case 'UPDATE_ORDER': {
          nextState.orders = (nextState.orders || []).map(o =>
            (o.id === payload.orderNo || o.orderNo === payload.orderNo || o.id === payload.id)
              ? { ...o, ...payload }
              : o
          );
          store.setState(nextState);
          const order = nextState.orders.find(o => o.id === payload.orderNo || o.orderNo === payload.orderNo || o.id === payload.id);
          if (order?.id) await apiClient.put(`/orders/${order.id}`, order).catch(() => {});
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

    syncData,
  };
};

export const ERPProvider = ({ children }) => {
  const { syncData } = useERP();

  useEffect(() => {
    syncData();
    
    // Cross-tab concurrency listener
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('erp_')) {
        syncData();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
