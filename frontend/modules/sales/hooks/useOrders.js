import { useCallback } from 'react';
import Swal from 'sweetalert2';
import { useERP, useSalesBackend } from '../../../shared/context/ERPContext.jsx';
import { useERPStore } from '../../../store/erpStore';

export function useOrders(showToast, currentView) {
  const { state } = useERP();
  
  const {
    salesOrders,
    salesOrdersPagination,
    loading,
    errors,
    loadSalesOrders,
    refreshSalesOrders,
    createOrder: backendCreateOrder,
    convertQuotationToOrder,
    attachCustomerPo,
    runCreditCheck,
    approveCreditException,
    confirmOrder,
    sendToPlantHead,
    cancelOrder,
    raiseCustomerComplaint,
    requestReturn,
    requestReplacement,
  } = useSalesBackend();

  const orders = Array.isArray(salesOrders) ? salesOrders : [];

  const pagination = salesOrdersPagination ?? {
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
  };

  const isLoading = Boolean(loading?.salesOrders);
  const error = errors?.salesOrders ?? null;

  const deliveredOrders = orders.filter((o) => {
    const st = String(o.orderStatus || o.status || '').trim().toLowerCase();
    const paySt = String(o.paymentStatus || '').trim().toLowerCase();
    return (st === 'delivered' || st === 'payment completed' || st === 'partially paid') && paySt !== 'paid';
  });

  const createOrder = useCallback(
    async (orderData) => {
      try {
        if (process.env.NEXT_PUBLIC_DATA_SOURCE_MODE === 'backend') {
          const idempotencyKey = crypto.randomUUID();
          const result = await backendCreateOrder(orderData, { idempotencyKey });
          showToast(`Order ${result.orderNumber} created successfully.`);
          refreshSalesOrders();
          return { success: true, data: result };
        }
        
        // Legacy Logic
        const store = useERPStore.getState();
        const id = orderData.id || orderData.orderNo || `ORD-${Date.now()}`;
        if (!store.sales.orders.some((order) => order.id === id)) {
          useERPStore.setState({
            ...store,
            sales: {
              ...store.sales,
              orders: [...store.sales.orders, {
                ...orderData,
                id,
                orderNo: id,
                items: Array.isArray(orderData.items) ? orderData.items : [],
                commercialStatus: 'ORDER_CONFIRMED',
                planningStatus: 'NOT_SENT',
                productionStatus: 'NOT_STARTED',
                qcStatus: 'NOT_READY',
                dispatchStatus: 'NOT_READY',
                paymentStatus: 'NOT_DUE',
                replacementStatus: 'NONE',
                returnStatus: 'NONE',
              }],
            },
          });
        }
        showToast(`Order ${id} created.`);
        return { success: true, data: { ...orderData, id, orderNo: id } };
      } catch (error) {
        const message = error.response?.data?.message || error.message || String(error);
        Swal.fire({ icon: 'error', title: 'Error', text: message });
        return { success: false, error: message };
      }
    },
    [showToast, backendCreateOrder, refreshSalesOrders]
  );

  const performTransition = useCallback(async (actionName, fn, ...args) => {
    try {
      if (process.env.NEXT_PUBLIC_DATA_SOURCE_MODE !== 'backend') {
        throw new Error('This action is only supported in backend mode.');
      }
      const idempotencyKey = crypto.randomUUID();
      const result = await fn(...args, { idempotencyKey });
      showToast(`${actionName} successful.`);
      refreshSalesOrders();
      return { success: true, data: result };
    } catch (error) {
      const message = error.response?.data?.message || error.message || String(error);
      Swal.fire({ icon: 'error', title: `${actionName} Failed`, text: message });
      return { success: false, error: message };
    }
  }, [showToast, refreshSalesOrders]);

  const updateFollowup = useCallback((orderId, data) => {
    // legacy mock for now
    const store = useERPStore.getState();
    useERPStore.setState({
      ...store,
      sales: {
        ...store.sales,
        orders: store.sales.orders.map((o) =>
          o.id === orderId || o.orderNo === orderId ? { ...o, ...data } : o
        ),
      },
    });
    showToast(`Order updated.`);
  }, [showToast]);

  const backendRequestReturn = useCallback(async (orderId, returnData) => {
    return performTransition('Return Request', requestReturn, { salesOrderId: orderId, ...returnData });
  }, [performTransition, requestReturn]);

  const backendRequestReplacement = useCallback(async (orderId, replacementData) => {
    return performTransition('Replacement Request', requestReplacement, { salesOrderId: orderId, ...replacementData });
  }, [performTransition, requestReplacement]);

  const backendRaiseComplaint = useCallback(async (orderId, complaintData) => {
    return performTransition('Raise Complaint', raiseCustomerComplaint, { salesOrderId: orderId, ...complaintData });
  }, [performTransition, raiseCustomerComplaint]);

  return {
    orders,
    deliveredOrders,
    pagination,
    isLoading: isLoading,
    error,
    loadOrders: loadSalesOrders,
    refreshOrders: refreshSalesOrders,
    createOrder,
    updateFollowup,
    
    convertQuotationToOrder: (...args) => performTransition('Convert Quotation', convertQuotationToOrder, ...args),
    attachCustomerPo: (...args) => performTransition('Attach PO', attachCustomerPo, ...args),
    runCreditCheck: (...args) => performTransition('Credit Check', runCreditCheck, ...args),
    approveCreditException: (...args) => performTransition('Approve Credit Exception', approveCreditException, ...args),
    confirmOrder: (...args) => performTransition('Confirm Order', confirmOrder, ...args),
    sendToPlantHead: (...args) => performTransition('Send to Plant Head', sendToPlantHead, ...args),
    cancelOrder: (...args) => performTransition('Cancel Order', cancelOrder, ...args),
    
    requestReturn: backendRequestReturn,
    requestReplacement: backendRequestReplacement,
    raiseCustomerComplaint: backendRaiseComplaint,
  };
}
