/**
 * useOrders — Order operations for components.
 */
import { useCallback, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useERP } from '../../../shared/context/ERPContext.jsx';
import { useERPStore } from '../../../store/erpStore';
import { useAuth } from '../../../shared/context/AuthContext.jsx';

const normalizeOrder = (o) => {
  if (!o) return o;
  const orderNo = o.orderNo || o.public_id || o.id || '';
  const customerName = o.customerName || o.customer_name || (typeof o.customer === 'string' ? o.customer : o.customer?.name) || '';
  
  const detailedItems = o.detailedItems || (o.items || []).map((it) => ({
    productName: it.product_name || it.name || '',
    productDetails: it.product_details || it.description || '',
    quantity: it.quantity || it.qty || 1,
    unitPrice: it.price || it.unitPrice || 0,
    discount: it.discount_percent || it.discount || 0,
    tax: it.gst_rate !== undefined ? it.gst_rate : (it.tax !== undefined ? it.tax : 18),
    code: it.product_id || it.code || '',
  }));

  const products = Array.isArray(o.products) 
    ? o.products.map(it => it.productName || it.name || '').filter(Boolean).join(', ') 
    : (o.products || detailedItems.map((it) => it.productName).filter(Boolean).join(', ') || 'No products listed');
  const totalAmount = o.totalAmount || o.grandTotal || o.totalValue || detailedItems.reduce((sum, it) => {
    const itemSubtotal = it.quantity * it.unitPrice;
    const discountVal = itemSubtotal * (it.discount || 0) / 100;
    const taxable = itemSubtotal - discountVal;
    const taxVal = taxable * (it.tax || 18) / 100;
    return sum + taxable + taxVal;
  }, 0);

  const overallStage = o.overallStage || o.productionStatus || 'Pending';
  const status = o.orderStatus || o.status || o.workflowStatus || o.salesStatus || 'Pending';
  const dispatchStatus = o.dispatchStatus || 'pending';
  const paymentStatus = o.paymentStatus || 'pending';

  return {
    ...o,
    orderNo,
    customerName,
    detailedItems,
    products,
    totalAmount,
    totalValue: totalAmount,
    overallStage,
    status,
    orderStatus: status,
    dispatchStatus,
    paymentStatus
  };
};

/**
 * @param {Function} showToast
 * @param {string}   currentView — the current portal view
 */
export function useOrders(showToast, currentView) {
  const { state, syncData } = useERP();
  const { user } = useAuth();

  const orders = useERPStore(store => store.state?.sales?.orders) || [];
  
  // Temporarily add this to confirm the order exists
  console.log("SALES ORDERS PAGE:", orders);
  const deliveredOrders = orders.filter((o) => {
    const st = String(o.orderStatus || o.status || '').trim().toLowerCase();
    const paySt = String(o.paymentStatus || '').trim().toLowerCase();
    return (st === 'delivered' || st === 'payment completed' || st === 'partially paid') && paySt !== 'paid';
  });

  /** Create a direct order bypassing the quotation flow. */
  const createOrder = useCallback(
    async (orderData) => {
      try {
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
        const message = error instanceof Error ? error.message : String(error);
        Swal.fire({ icon: 'error', title: 'Error', text: message });
        return { success: false, error: message };
      }
    },
    [showToast]
  );

  /** Update payment follow-up notes. */
  const updateFollowup = useCallback(
    async (orderId, text, nextDate) => {
      const store = useERPStore.getState();
      useERPStore.setState({
        ...store,
        sales: {
          ...store.sales,
          orders: store.sales.orders.map((order) =>
            order.id === orderId || order.orderNo === orderId
              ? { ...order, followupNotes: text, nextFollowupDate: nextDate }
              : order
          ),
        },
      });
      showToast('Follow-up updated.');
      return { success: true };
    },
    [showToast]
  );

  return {
    orders,
    deliveredOrders,
    createOrder,
    updateFollowup,
  };
}
