'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Eye, Box, CheckCircle, Truck, PackageCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import StatusBadge from '../shared/components/StatusBadge';
import { useAuth } from '../shared/context/AuthContext';
import ReminderModal from '../shared/components/ReminderModal.jsx';
import { apiClient } from '../lib/apiClient';
import { useERPStore } from '@/store/erpStore';
import styles from './OrdersView.module.css';

export default function OrdersView({ 
  orders, 
  leads = [],
  customers = [],
  replacementRequests: propReplacements,
  returnRequests: propReturns,
  onUpdateOrderStatus, 
  onUpdateOrder,
  onAskReplacement,
  onAskReturn,
  searchQuery,
  setSearchQuery,
  flat = false
}) {
  const storeReplacements = useERPStore(s => s.state?.sales?.replacementRequests) || [];
  const storeReturns = useERPStore(s => s.state?.sales?.returnRequests) || [];

  const replacementRequests = propReplacements || storeReplacements;
  const returnRequests = propReturns || storeReturns;
  const navigate = useRouter();
  const { user } = useAuth();
  const isProductionUser = user?.role === 'Production';
  const [localSearch, setLocalSearch] = useState('');
  const search = searchQuery !== undefined ? searchQuery : localSearch;
  const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryModal, setSelectedDeliveryModal] = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [filter, setFilter] = useState('All Orders');
  const [currentPage, setCurrentPage] = useState(1);
  const [reminderModal, setReminderModal] = useState(null);
  const [sendingOrderId, setSendingOrderId] = useState(null);

  const handleSaveReminder = async (formData) => {
    if (!reminderModal) return;
    try {
      await apiClient.post('/sales/reminders', {
        ...formData,
        moduleType: 'Order',
        moduleId: reminderModal.order?.id || reminderModal.order?.orderNo,
        customerName: reminderModal.order?.customerName || reminderModal.order?.customer || 'Customer',
      });
      Swal.fire({ icon: 'success', title: 'Reminder saved', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed to save reminder', text: err?.message });
    }
    setReminderModal(null);
  };

  const PAYMENT_LABELS = {
    PAYMENT_PENDING: 'Awaiting Payment',
    PARTIALLY_PAID: 'Partial Paid',
    AWAITING_FINANCE_VERIFICATION: 'Payment Verification Pending',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
  };

  const sumQty = (requests = []) => (requests || []).reduce((total, req) => {
    return total + ((req.items || []).reduce((s, i) => s + Number(
      i.receivedQuantity ?? i.approvedQuantity ?? i.requestedQuantity ?? i.quantity ?? 0
    ), 0) || 0);
  }, 0);

  const getAvailableAfterSalesQuantity = (order) => {
    if (!order) return 0;
    const items = order.items || order.detailedItems || [];
    const deliveredQty = items.reduce(
      (sum, item) =>
        sum +
        (Number(
          item.deliveredQuantity ??
          item.quantity ??
          item.orderedQuantity ??
          0
        ) || 0),
      0
    );
    
    const reps = replacementRequests || [];
    const rets = returnRequests || [];

    const orderReplacements = reps.filter(r => r.orderId === order.id || r.orderId === order.orderNo);
    const orderReturns = rets.filter(r => r.orderId === order.id || r.orderId === order.orderNo);
  
    const activeReplacements = orderReplacements.filter(r => ['REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED', 'REPLACEMENT_DISPATCHED', 'REPLACEMENT_IN_TRANSIT'].includes(r.status));
    const completedReplacements = orderReplacements.filter(r => r.status === 'REPLACEMENT_DELIVERED');
  
    const activeReturns = orderReturns.filter(r => ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKUP_ASSIGNED', 'RETURN_IN_TRANSIT'].includes(r.status));
    const completedReturns = orderReturns.filter(r => r.status === 'RETURN_RECEIVED');
  
    return Math.max(0, deliveredQty - sumQty(activeReplacements) - sumQty(completedReplacements) - sumQty(activeReturns) - sumQty(completedReturns));
  };

  const getReplacementHistory = (order) => (replacementRequests || []).filter(r => r.orderId === order.id || r.orderId === order.orderNo);

  const hasActiveReplacement = (order) => {
    const status = String(order?.replacementStatus || order?._raw?.replacement_status || '').toUpperCase();
    if (order?.activeReplacementExists || order?._raw?.active_replacement_exists || ['ACTIVE', 'PENDING', 'REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'DISPATCHED', 'IN_TRANSIT'].includes(status)) return true;
    const reps = replacementRequests || [];
    const orderReplacements = reps.filter(r => r.orderId === order.id || r.orderId === order.orderNo);
    return orderReplacements.some(r => ['REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED', 'REPLACEMENT_DISPATCHED', 'REPLACEMENT_IN_TRANSIT'].includes(r.status));
  };

  const hasActiveReturn = (order) => {
    const status = String(order?.returnStatus || order?._raw?.return_status || '').toUpperCase();
    if (order?.activeReturnExists || order?._raw?.active_return_exists || ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PICKUP_ASSIGNED', 'IN_TRANSIT', 'ACTIVE'].includes(status)) return true;
    const rets = returnRequests || [];
    const orderReturns = rets.filter(r => r.orderId === order.id || r.orderId === order.orderNo);
    return orderReturns.some(r => ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKUP_ASSIGNED', 'RETURN_IN_TRANSIT'].includes(r.status));
  };

  const replacementBadge = (order) => ({
    REQUESTED: 'Replacement Requested',
    UNDER_REVIEW: 'Under Plant Head Review',
    APPROVED: 'Replacement Approved',
    DISPATCHED: 'Dispatch Created',
    IN_TRANSIT: 'Replacement In Transit',
  }[String(order?.replacementStatus || '').toUpperCase()] || 'Replacement Pending');

  const returnBadge = (order) => ({
    REQUESTED: 'Return Requested',
    UNDER_REVIEW: 'Under Plant Head Review',
    APPROVED: 'Return Approved',
    PICKUP_ASSIGNED: 'Dispatch Created',
    IN_TRANSIT: 'Return In Transit',
  }[String(order?.returnStatus || '').toUpperCase()] || 'Return Requested');

  const isDeliveredOrder = (order) => {
    const dispatchSt = String(order?.dispatchStatus || '').toUpperCase();
    const orderSt = String(order?.orderStatus || order?.status || order?.workflowStatus || '').toUpperCase();
    return dispatchSt === 'DELIVERED' || orderSt === 'DELIVERED' || Boolean(order?.deliveredDate || order?.deliveredAt);
  };

  const hasPendingFinanceConfirmation = (order) => {
    const paymentSt = String(order?.paymentStatus || '').toUpperCase();
    if (paymentSt === 'FINANCE_VERIFICATION_PENDING' || paymentSt === 'AWAITING_FINANCE_VERIFICATION') return true;
    const paymentConfirmations = useERPStore.getState().state?.sales?.paymentConfirmations || [];
    const conf = paymentConfirmations.find(c => c.orderId === order?.id || c.orderId === order?.orderNo);
    return Boolean(conf && conf.status === 'FINANCE_VERIFICATION_PENDING');
  };

  const hasFullReturnCompleted = (order) => {
    const rets = returnRequests || [];
    const orderReturns = rets.filter(r => r.orderId === order?.id || r.orderId === order?.orderNo);
    const totalReturnedQty = orderReturns.filter(r => r.status === 'RETURN_RECEIVED').reduce(
      (sum, r) => sum + (r.items?.reduce(
        (s, i) => s + Number(i.receivedQuantity ?? i.approvedQuantity ?? i.requestedQuantity ?? i.quantity ?? 0),
        0
      ) || 0),
      0
    );
    const totalDeliveredQty = (order?.items || order?.detailedItems || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
    return totalDeliveredQty > 0 && totalReturnedQty >= totalDeliveredQty;
  };

  const canAskForPayment = (order) => {
    const isDelivered = isDeliveredOrder(order);
    const paymentSt = String(order?.paymentStatus || '').toUpperCase();
    const total = Number(order?.totalAmount ?? order?.grandTotal ?? order?.payment?.totalAmount ?? 0);
    const verifiedPaid = Number(
      order?.verifiedPaidAmount ??
      order?.verifiedAmount ??
      order?.payment?.paidAmount ??
      order?.payment?.paid ??
      0
    );
    const hasFullyPaidBalance =
      total > 0 &&
      (verifiedPaid >= total ||
        (verifiedPaid > 0 && Number(order?.balanceAmount) === 0));
    const isFinanceApprovedAndPaid =
      paymentSt === 'FULLY_PAID' ||
      paymentSt === 'PAID' ||
      hasFullyPaidBalance;
    return isDelivered && !isFinanceApprovedAndPaid;
  };

  const canSendToPlantHead = (order) => {
    return Boolean(
      order &&
      order.commercialStatus === 'ORDER_CONFIRMED' &&
      order.planningStatus === 'NOT_SENT'
    );
  };

  const canAskReplacement = (order) => {
    return isDeliveredOrder(order) && getAvailableAfterSalesQuantity(order) > 0 && !hasActiveReplacement(order) && !hasFullReturnCompleted(order);
  };

  const canAskReturn = (order) => {
    return isDeliveredOrder(order) && getAvailableAfterSalesQuantity(order) > 0 && !hasActiveReturn(order) && !hasFullReturnCompleted(order);
  };

  const getOrderStatusLabel = (order) => {
    if (!order) return 'Pending';
    if (order.commercialStatus === 'ORDER_CLOSED') return 'Closed';
    if (order.dispatchStatus === 'DELIVERED') return 'Delivered';
    if (order.dispatchStatus === 'IN_TRANSIT') return 'In Transit';
    if (order.dispatchStatus === 'DISPATCH_CREATED') return 'Dispatch Created';
    if (order.qcStatus === 'QC_APPROVED') return 'QC Approved';
    if (order.productionStatus === 'PRODUCTION_COMPLETED') return 'Production Completed';
    if (['PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS', 'IN_PRODUCTION'].includes(order.productionStatus)) return 'In Production';
    if (order.productionStatus === 'WORK_ORDER_CREATED') return 'Work Order Created';
    if (order.planningStatus === 'PRODUCTION_PLANNED') return 'Production Planned';
    if (order.planningStatus === 'PLANT_HEAD_ACCEPTED') return 'Accepted by Plant Head';
    if (order.planningStatus === 'PENDING_ACCEPTANCE') return 'Sent to Plant Head';
    if (order.commercialStatus === 'ORDER_CONFIRMED' && (order.planningStatus === 'NOT_SENT' || !order.planningStatus)) return 'Confirmed';
    return order.status || order.workflowStatus || 'Pending';
  };

  const getOrderActionState = (order) => {
    if (!order) return { action: null, label: 'No Action' };

    // The workflow state is authoritative for backend orders. Falling back to the
    // legacy status fields keeps local/Zustand orders working without showing a
    // stale submit action after the workflow has already moved on.
    const backendStatus = String(
      order.workflowStateCode ||
      order.status ||
      order.orderStatus ||
      ''
    ).trim().toUpperCase();

    const nonSubmittableWorkflowLabels = {
      SENT_TO_PLANT: 'Sent to Plant Head',
      SENT_TO_PLANT_HEAD: 'Sent to Plant Head',
      PLANT_APPROVED: 'Accepted by Plant Head',
      READY_FOR_PRODUCTION: 'Ready for Production',
      IN_PRODUCTION: 'In Production',
      READY_FOR_DISPATCH: 'Ready for Dispatch',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    if (nonSubmittableWorkflowLabels[backendStatus]) {
      return { action: null, label: nonSubmittableWorkflowLabels[backendStatus] };
    }

    if (backendStatus === 'DRAFT') {
      return { action: 'SEND_TO_PLANT_HEAD_DIRECT', label: 'Send to Plant Head' };
    }
    if (backendStatus === 'PENDING_APPROVAL') {
      return { action: 'SEND_TO_PLANT_HEAD_DIRECT', label: 'Send to Plant Head' };
    }
    const isConfirmed = order.commercialStatus === 'ORDER_CONFIRMED' || order.orderStatus === 'CONFIRMED';
    const isNotSent = order.planningStatus === 'NOT_SENT' || !order.planningStatus;
    const isFullyReserved = order.allocationStatus === 'FINISHED_GOODS_RESERVED';

    // If fully available stock, do NOT send to plant head, jump to ready for dispatch
    if (isConfirmed && isFullyReserved) {
      return { action: null, label: 'Ready for Dispatch' };
    }

    if (isConfirmed && isNotSent && !isFullyReserved) {
      return { action: 'SEND_TO_PLANT_HEAD', label: 'Send to Plant Head' };
    }
    
    if (order.planningStatus === 'PENDING_ACCEPTANCE' || order.orderStatus === 'SENT_TO_PLANT_HEAD') {
      return { action: null, label: 'Awaiting Plant Head' };
    }
    if (order.planningStatus === 'PLANT_HEAD_ACCEPTED') {
      return { action: null, label: 'Awaiting Production Plan' };
    }
    if ((order.planningStatus === 'PRODUCTION_PLANNED' || order.productionStatus === 'PLANNED') && (order.productionStatus === 'NOT_STARTED' || !order.productionStatus)) {
      return { action: null, label: 'Production Planned' };
    }
    if (order.productionStatus === 'WORK_ORDER_CREATED') {
      return { action: null, label: 'Work Order Created' };
    }
    if (['PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS', 'IN_PRODUCTION', 'IN_PROGRESS'].includes(order.productionStatus)) {
      return { action: null, label: 'In Production' };
    }
    if (order.productionStatus === 'PRODUCTION_COMPLETED' || order.productionStatus === 'COMPLETED') {
      if (order.qcStatus !== 'QC_APPROVED' && order.qcStatus !== 'APPROVED') {
        return { action: null, label: 'Awaiting QC' };
      }
    }
    if ((order.qcStatus === 'QC_APPROVED' || order.qcStatus === 'APPROVED' || isFullyReserved) && (order.dispatchStatus === 'NOT_READY' || !order.dispatchStatus)) {
      return { action: null, label: 'Ready for Dispatch' };
    }
    if (order.dispatchStatus === 'DISPATCH_CREATED' || order.dispatchStatus === 'READY') {
      return { action: null, label: 'Dispatch Created' };
    }
    if (order.dispatchStatus === 'IN_TRANSIT') {
      return { action: null, label: 'In Transit' };
    }
    if (order.dispatchStatus === 'DELIVERED' && order.paymentStatus !== 'FULLY_PAID') {
      return { action: 'AFTER_DELIVERY', label: 'Payment / After-Sales' };
    }
    if (order.dispatchStatus === 'DELIVERED' && order.paymentStatus === 'FULLY_PAID') {
      return { action: 'AFTER_SALES', label: 'After-Sales Service' };
    }
    if (order.commercialStatus === 'ORDER_CLOSED' || order.closureStatus === 'CLOSED') {
      return { action: 'AFTER_SALES', label: 'Closed' };
    }
    return { action: null, label: 'No Action' };
  };

  const validOrders = orders.filter(o => {
    if (!o) return false;
    const orderReference = o.orderNo || o.orderNumber || o.orderId || o.id;
    const hasOrderReference = typeof orderReference === 'string' && orderReference.length > 0;
    const hasCustomer = Boolean(o.customerName || o.customer?.name);
    const hasItems = (Array.isArray(o.items) && o.items.length > 0) || Boolean(o.products);
    return hasOrderReference && hasCustomer && hasItems;
  });

  const filteredOrders = validOrders.filter(o => {
    const custName = o.customerName || o.customer?.name || '';
    const matchesSearch = custName.toLowerCase().includes(search.toLowerCase()) || 
                          (o.products || '').toLowerCase().includes(search.toLowerCase());
    
    const stage = String(o.status || o.overallStage || o.order_stage || o.productionStatus || 'Draft');
    const stageUpper = stage.toUpperCase();
    
    let matchesFilter = false;
    if (filter === 'All Orders') matchesFilter = true;
    else if (filter === 'Open Orders') {
      matchesFilter = !isDeliveredOrder(o) && !['CLOSED', 'Closed', 'CANCELLED', 'Cancelled'].includes(stage);
    } else if (filter === 'In Production') {
      matchesFilter = ['IN_PRODUCTION', 'WORK_ORDER_CREATED', 'PLANNED', 'MATERIAL_REQUESTED', 'MATERIAL_APPROVED', 'MATERIAL_ISSUED'].includes(stageUpper);
    } else if (filter === 'Dispatched') {
      matchesFilter = ['DISPATCH_CREATED', 'IN_TRANSIT', 'IN TRANSIT', 'DISPATCH_READY'].includes(stageUpper);
    } else if (filter === 'Delivered') {
      matchesFilter = isDeliveredOrder(o);
    } else if (filter === 'Closed') {
      matchesFilter = ['CLOSED', 'Closed'].includes(stage);
    }
    
    return matchesSearch && matchesFilter;
  });

  const ITEMS_PER_PAGE = 25;
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const displayedOrders = flat ? filteredOrders : filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getDispatchBadge = (status) => {
    const s = status || 'Pending';
    switch (s) {
      case 'Delivered':
        return 'badge badge-approved';
      case 'Dispatched':
        return 'badge badge-sent';
      default:
        return 'badge badge-pending';
    }
  };

  const currentDetailsOrder = selectedOrder ? orders.find(o => o.orderNo === selectedOrder.orderNo) : null;
  // Resolve client information
  const detailsCustName = currentDetailsOrder ? (currentDetailsOrder.customerName || currentDetailsOrder.customer?.name || '') : '';
  const clientLead = currentDetailsOrder ? leads.find(l => (l.companyName || '').toLowerCase() === detailsCustName.toLowerCase()) : null;
  const clientCustomer = currentDetailsOrder ? customers.find(c => (c.companyName || c.name || '').toLowerCase() === detailsCustName.toLowerCase()) : null;

  const renderAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const parts = [addr.line1, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean);
    return parts.join(', ') || '';
  };

  const clientAddress = clientLead ? renderAddress(clientLead.address) : (clientCustomer ? clientCustomer.address : 'Andheri, Mumbai (Default Address)');
  const clientGST = clientLead?.gstNumber || '27ABCDE4321G2Z8';

  const formatINR = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '₹0';
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  const orderGrandTotal = currentDetailsOrder
    ? (currentDetailsOrder.payment?.totalAmount || currentDetailsOrder.totalAmount || currentDetailsOrder.totalValue || 0)
    : 0;
  const transportVal = currentDetailsOrder ? (currentDetailsOrder.transportCharge !== undefined ? currentDetailsOrder.transportCharge : 0) : 0;

  // Resolve detailed item rows
  const sourceItems = currentDetailsOrder?.detailedItems?.length
    ? currentDetailsOrder.detailedItems
    : currentDetailsOrder?.items?.length
      ? currentDetailsOrder.items
      : null;
  const fallbackProductName = currentDetailsOrder?.products || 'Product';
  const itemsList = currentDetailsOrder ? (sourceItems || [
    {
      productName: fallbackProductName,
      code: `P-${(String(fallbackProductName).replace(/[^A-Za-z]/g, '').substring(0, 3) || 'PRD').toUpperCase()}-02`,
      quantity: currentDetailsOrder.quantity || 1,
      unitPrice: (orderGrandTotal - transportVal) / (currentDetailsOrder.quantity || 1),
      discount: 0,
      tax: currentDetailsOrder.tax !== undefined ? currentDetailsOrder.tax : (currentDetailsOrder.gst !== undefined ? currentDetailsOrder.gst : 18)
    }
  ]).map(item => ({
    ...item,
    productName: item.productName || item.name || 'Product',
    code: item.code || item.productCode || '',
    quantity: Number(item.quantity ?? item.orderedQuantity ?? 0),
    unitPrice: Number(item.unitPrice ?? item.price ?? 0),
    discount: Number(item.discount ?? 0),
    tax: Number(item.tax ?? item.taxRate ?? 0),
  })) : [];

  const calculatedSubtotal = itemsList.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmt = itemsList.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * (item.discount || 0) / 100), 0);

  const calculatedTaxAmt = itemsList.reduce((sum, item) => {
    const sub = item.quantity * item.unitPrice;
    const disc = sub * (item.discount || 0) / 100;
    return sum + ((sub - disc) * (item.tax !== undefined ? item.tax : 18) / 100);
  }, 0);

  const rawGrandTotal = (calculatedSubtotal - discountAmt) + calculatedTaxAmt;
  const computedTransportVal = currentDetailsOrder ? (currentDetailsOrder.transportCharge !== undefined ? currentDetailsOrder.transportCharge : Math.max(0, orderGrandTotal - rawGrandTotal)) : 0;

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row">
        <h2 className="module-title">Purchase Orders Tracker</h2>
        <div className="module-actions">
          {/* Status filters */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
            {['All Orders', 'Open Orders', 'In Production', 'Dispatched', 'Delivered', 'Closed'].map(st => (
              <button 
                key={st}
                className={`filter-pill ${filter === st ? 'active' : ''}`}
                onClick={() => setFilter(st)}
                style={{ color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="crm-table-container">
        <table className={`crm-table responsive-table ${styles.ordersTable}`}>
          <colgroup>
            {isProductionUser ? (
              <>
                <col style={{ width: '15%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '35%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </>
            ) : (
              <>
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '28%' }} />
              </>
            )}
          </colgroup>
          <thead>
            <tr>
              {filter === 'Delivered' ? (
                <>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Delivery Date</th>
                  <th style={{ textAlign: 'right' }}>Order Value</th>
                  <th style={{ textAlign: 'right' }}>Paid Amount</th>
                  <th style={{ textAlign: 'right' }}>Balance Amount</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </>
              ) : (
                <>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products / Items</th>
                  {!isProductionUser && <th>Total Value</th>}
                  <th>Order Status</th>
                  <th>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={isProductionUser ? "5" : "6"} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  No orders generated.
                </td>
              </tr>
            ) : (
              displayedOrders.map((o) => {
                const paid = Number(o.verifiedPaidAmount ?? o.payment?.paid ?? 0) || 0;
                const total = Number(o.totalAmount ?? o.payment?.totalAmount ?? 0) || 0;
                const balance = o.balanceAmount !== undefined ? Number(o.balanceAmount) || 0 : Math.max(0, total - paid);
                const paymentKey = String(o.paymentStatus || '').toUpperCase();
                const paymentLabel = PAYMENT_LABELS[paymentKey] || (paymentKey ? paymentKey.replaceAll('_', ' ') : 'Awaiting Payment');
                const deliveryDate = o.deliveredAt ? String(o.deliveredAt).slice(0, 10) : (o.expectedDeliveryDate ? String(o.expectedDeliveryDate).slice(0, 10) : '-');

                if (filter === 'Delivered') {
                  return (
                    <tr key={o.id || o.orderNo}>
                      <td data-label="Order No" style={{ fontWeight: 800, fontFamily: 'monospace' }}>{o.orderNo}</td>
                      <td data-label="Customer" style={{ fontWeight: 700 }}>{o.customer?.name}</td>
                      <td data-label="Delivery Date">{deliveryDate}</td>
                      <td data-label="Order Value" style={{ textAlign: 'right', fontWeight: 800 }}>{formatINR(total)}</td>
                      <td data-label="Paid Amount" style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{formatINR(paid)}</td>
                      <td data-label="Balance Amount" style={{ textAlign: 'right', fontWeight: 800, color: '#ef4444' }}>{formatINR(balance)}</td>
                      <td data-label="Payment Status">
                        <StatusBadge status={paymentLabel} />
                      </td>
                      <td data-label="Action" className={styles.actionsCell}>
                        <div className={styles.actionsGrid}>
                          <button
                            title="View"
                            onClick={() => setSelectedOrder(o)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '30px', height: '30px',
                              background: '#ffffff', border: '1px solid #d1d5db',
                              borderRadius: '8px', cursor: 'pointer',
                              color: '#374151'
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          {canAskForPayment(o) && (
                            <button
                              type="button"
                              onClick={() => navigate.push('/sales/payment-followup')}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '4px 12px', height: '30px',
                                background: '#eff6ff',
                                border: '1px solid #3b82f6',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '800',
                                color: '#1d4ed8', whiteSpace: 'nowrap'
                              }}
                            >
                              Ask for Payment
                            </button>
                          )}
                          {hasPendingFinanceConfirmation(o) && (
                            <StatusBadge status="Payment Verification Pending" />
                          )}
                          {onAskReplacement && isDeliveredOrder(o) && !hasActiveReplacement(o) && !['COMPLETED', 'REJECTED'].includes(String(o.replacementStatus || '').toUpperCase()) && (
                            <button
                              type="button"
                              onClick={() => onAskReplacement(o)}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '4px 12px', height: '30px',
                                background: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '800',
                                color: '#92400e', whiteSpace: 'nowrap',
                              }}
                            >
                              Ask for Replacement
                            </button>
                          )}
                          {hasActiveReplacement(o) && (
                            <StatusBadge status={replacementBadge(o)} />
                          )}
                          {String(o.replacementStatus || '').toUpperCase() === 'COMPLETED' && <StatusBadge status="Replacement Completed" />}
                          {String(o.replacementStatus || '').toUpperCase() === 'REJECTED' && <StatusBadge status="Replacement Rejected" />}
                          {onAskReturn && isDeliveredOrder(o) && !hasActiveReturn(o) && !['COMPLETED', 'REJECTED'].includes(String(o.returnStatus || '').toUpperCase()) && (
                            <button
                              type="button"
                              onClick={() => onAskReturn(o)}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '4px 12px', height: '30px',
                                background: '#fff1f2',
                                border: '1px solid #f43f5e',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '800',
                                color: '#e11d48', whiteSpace: 'nowrap',
                              }}
                            >
                              Ask for Return
                            </button>
                          )}
                          {hasActiveReturn(o) && (
                            <StatusBadge status={returnBadge(o)} />
                          )}
                          {String(o.returnStatus || '').toUpperCase() === 'COMPLETED' && <StatusBadge status="Return Completed" />}
                          {String(o.returnStatus || '').toUpperCase() === 'REJECTED' && <StatusBadge status="Return Rejected" />}
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={o.id || o.orderNo}>
                    <td data-label="Order ID" style={{ fontWeight: '700' }}>
                      <span
                        style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => navigate.push(`/orders/${o.orderNo}`)}
                      >
                        {o.orderNo}
                      </span>
                    </td>
                    <td data-label="Customer" style={{ fontWeight: '600' }}>
                      {o.customerName || o.customer?.name || '—'}
                    </td>
                    <td data-label="Products / Items">
                      {o.products || (Array.isArray(o.items) && o.items.length > 0 ? o.items.map(i => `${i.productName || i.name || i.product?.name || i.productNameSnapshot || 'Item'} (${i.quantity ?? i.orderedQuantity ?? 1} Qty)`).join(', ') : '') || (Array.isArray(o.detailedItems) && o.detailedItems.length > 0 ? o.detailedItems.map(i => `${i.productName || i.name || 'Item'} (${i.quantity || 1} Qty)`).join(', ') : '') || '—'}
                    </td>
                    {!isProductionUser && (
                      <td data-label="Total Value" style={{ fontWeight: '700' }}>
                {formatINR(o.grandTotal ?? o.totalAmount ?? o.payment?.totalAmount ?? o.totalValue ?? 0)}
                      </td>
                    )}
                    <td data-label="Order Status">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {o.paymentStatus === 'FULLY_PAID' && <StatusBadge status="Fully Paid" />}
                        <StatusBadge status={getOrderStatusLabel(o)} />
                      </div>
                    </td>
                    <td data-label="Actions" className={styles.actionsCell}>
                      {(() => {
                        const actionState = getOrderActionState(o);
                        return (
                          <div className={styles.actionsGrid}>
                            <button
                              title="View Details"
                              onClick={() => setSelectedOrder(o)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '30px', height: '30px',
                                background: '#ffffff', border: '1px solid #d1d5db',
                                borderRadius: '8px', cursor: 'pointer',
                                color: '#374151', flexShrink: 0
                              }}
                            >
                              <Eye size={13} />
                            </button>

                            {actionState.action === 'SEND_TO_PLANT_HEAD_DIRECT' && (
                              <button
                                type="button"
                                disabled={sendingOrderId === (o.id || o.orderNo)}
                                onClick={async () => {
                                  const orderId = o.id || o.orderNo;
                                  if (sendingOrderId === orderId) return;
                                  const confirmation = await Swal.fire({
                                    title: 'Send Order to Plant Head?',
                                    text: 'This order will be sent to the Plant Head incoming-orders queue.',
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonText: 'Yes, Send',
                                    cancelButtonText: 'No',
                                  });
                                  if (!confirmation.isConfirmed) return;
                                  setSendingOrderId(orderId);
                                  try {
                                    const sent = await onUpdateOrderStatus?.(orderId, 'SEND_TO_PLANT_HEAD_DIRECT');
                                    if (sent !== false) {
                                      await Swal.fire({
                                        title: 'Order Sent',
                                        text: 'The order is now available in Plant Head incoming orders.',
                                        icon: 'success',
                                      });
                                    }
                                  } finally {
                                    setSendingOrderId(null);
                                  }
                                }}
                                style={{
                                  display: 'inline-flex', alignItems: 'center',
                                  padding: '4px 12px', height: '30px',
                                  background: '#2F4375', color: '#fff',
                                  border: '1px solid #2F4375',
                                  borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: '700',
                                  whiteSpace: 'nowrap', flexShrink: 0
                                }}
                              >
                                {actionState.label}
                              </button>
                            )}

                            {actionState.action === 'SEND_TO_PLANT_HEAD' && (
                              <button
                                type="button"
                                disabled={sendingOrderId === (o.id || o.orderNo)}
                                onClick={async () => {
                                  const orderId = o.id || o.orderNo;
                                  if (sendingOrderId === orderId) return;
                                  const confirmation = await Swal.fire({
                                    title: 'Send Order to Plant Head?',
                                    text: 'This order will be added to the Plant Head incoming-order queue for production planning.',
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonText: 'Yes, Send Order',
                                    cancelButtonText: 'Cancel',
                                  });
                                  if (!confirmation.isConfirmed) return;
                                  setSendingOrderId(orderId);
                                  try {
                                    const sent = await onUpdateOrderStatus?.(orderId, 'SEND_TO_PLANT');
                                    if (sent !== false) {
                                      await Swal.fire({
                                        title: 'Order Sent Successfully',
                                        text: 'The order is now available in Plant Head Incoming Orders.',
                                        icon: 'success',
                                      });
                                    }
                                  } catch (err) {
                                    await Swal.fire({ icon: 'error', title: 'Unable to Send Order', text: err?.message || 'Unable to send order' });
                                  } finally {
                                    setSendingOrderId(null);
                                  }
                                }}
                                  data-testid={`order-send-plant-head-${o.orderNo || o.id}`}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center',
                                  padding: '4px 12px', height: '30px',
                                  background: '#c9f03d',
                                  border: '1px solid #b5da2a',
                                  borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: '700',
                                  color: '#1a2600', whiteSpace: 'nowrap',
                                  flexShrink: 0
                                }}
                              >
                                Send to Plant Head
                              </button>
                            )}

                            {isDeliveredOrder(o) && (
                              <>
                                {canAskForPayment(o) && (
                                  <button
                                    type="button"
                                    onClick={() => navigate.push('/sales/payment-followup')}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                                      padding: '4px 12px', height: '30px',
                                      background: '#eff6ff',
                                      border: '1px solid #3b82f6',
                                      borderRadius: '8px', cursor: 'pointer',
                                      fontSize: '12px', fontWeight: '800',
                                      color: '#1d4ed8', whiteSpace: 'nowrap',
                                      flexShrink: 0
                                    }}
                                  >
                                    Ask for Payment
                                  </button>
                                )}
                                {hasPendingFinanceConfirmation(o) && (
                                  <StatusBadge status="Payment Verification Pending" />
                                )}
                                {onAskReplacement && isDeliveredOrder(o) && !hasActiveReplacement(o) && !['COMPLETED', 'REJECTED'].includes(String(o.replacementStatus || '').toUpperCase()) && (
                                  <button
                                    type="button"
                                    onClick={() => onAskReplacement(o)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center',
                                      padding: '4px 12px', height: '30px',
                                      background: '#fef3c7',
                                      border: '1px solid #f59e0b',
                                      borderRadius: '8px', cursor: 'pointer',
                                      fontSize: '12px', fontWeight: '800',
                                      color: '#92400e', whiteSpace: 'nowrap',
                                      flexShrink: 0
                                    }}
                                  >
                                    Ask for Replacement
                                  </button>
                                )}
                                {hasActiveReplacement(o) && (
                                  <StatusBadge status={replacementBadge(o)} />
                                )}
                                {String(o.replacementStatus || '').toUpperCase() === 'COMPLETED' && <StatusBadge status="Replacement Completed" />}
                                {String(o.replacementStatus || '').toUpperCase() === 'REJECTED' && <StatusBadge status="Replacement Rejected" />}
                                {onAskReturn && isDeliveredOrder(o) && !hasActiveReturn(o) && !['COMPLETED', 'REJECTED'].includes(String(o.returnStatus || '').toUpperCase()) && (
                                  <button
                                    type="button"
                                    onClick={() => onAskReturn(o)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center',
                                      padding: '4px 12px', height: '30px',
                                      background: '#fff1f2',
                                      border: '1px solid #f43f5e',
                                      borderRadius: '8px', cursor: 'pointer',
                                      fontSize: '12px', fontWeight: '800',
                                      color: '#e11d48', whiteSpace: 'nowrap',
                                      flexShrink: 0
                                    }}
                                  >
                                    Ask for Return
                                  </button>
                                )}
                                {hasActiveReturn(o) && (
                                  <StatusBadge status={returnBadge(o)} />
                                )}
                                {String(o.returnStatus || '').toUpperCase() === 'COMPLETED' && <StatusBadge status="Return Completed" />}
                                {String(o.returnStatus || '').toUpperCase() === 'REJECTED' && <StatusBadge status="Return Rejected" />}
                              </>
                            )}

                            {!isDeliveredOrder(o) && !actionState.action && actionState.label && (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600', padding: '0 4px' }}>
                                {actionState.label}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!flat && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredOrders.length}</strong> total orders)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="btn-small btn-outline-small"
              style={{ margin: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="btn-small btn-outline-small"
              style={{ margin: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Details & Update Overlay */}
      {currentDetailsOrder && (
        <div className="modal-overlay active" onClick={() => setSelectedOrder(null)}>
            <div 
              className="invoice-sheet-modal" 
              onClick={(e) => e.stopPropagation()} 
            >
              {/* Sheet Branding Header */}
              <div className="sheet-header">
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>HIMALAYA PRODUCTS</h1>
                  <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '600', margin: '2px 0 0 0' }}>Concrete & Aggregate Supply</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>PURCHASE ORDER</h1>
                  <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '700', margin: '4px 0 0 0' }}>Ref: {currentDetailsOrder.orderNo}</p>
                </div>
              </div>

              {/* Horizontal Solid Branding Divider */}
              <hr style={{ border: 'none', borderTop: '2px solid #000000', margin: '0 0 24px 0' }} />

              {/* Client Coordinates & Order Details */}
              <div className="sheet-meta">
                <div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Bill To:</p>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{currentDetailsOrder.customerName || currentDetailsOrder.customer?.name}</p>
                  <p style={{ margin: '2px 0 0 0', color: '#475569', fontWeight: '500' }}>{clientAddress}</p>
                  <p style={{ margin: '4px 0 0 0', color: '#475569', fontWeight: '600' }}>GST: <span style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}>{clientGST}</span></p>
                </div>
                <div className="sheet-meta-right">
                  <p style={{ margin: 0 }}><strong>Order Date:</strong> {currentDetailsOrder.date || '2026-06-05'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="crm-table-container" style={{ margin: '0 0 20px 0', border: '1px solid #eaeaea' }}>
                <table className="crm-table responsive-table" style={{ border: 'none' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Product Details</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Qty</th>
                      {!isProductionUser && <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Rate</th>}
                      {discountAmt > 0 && (
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Discount</th>
                      )}
                      {!isProductionUser && <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Tax (GST)</th>}
                      {!isProductionUser && <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Total</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map((item, index) => {
                      const itemSubtotal = item.quantity * item.unitPrice;
                      const discountValue = itemSubtotal * (item.discount || 0) / 100;
                      const taxable = itemSubtotal - discountValue;
                      const taxValue = taxable * (item.tax !== undefined ? item.tax : 18) / 100;
                      const itemTotal = taxable + taxValue;

                      return (
                        <tr key={index}>
                          <td data-label="Product Details">
                            <div>
                              <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.productName}</div>
                              {item.productDetails && (
                                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>{item.productDetails}</div>
                              )}
                              <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '2px', fontFamily: 'monospace' }}>Code: {item.code}</div>
                            </div>
                          </td>
                          <td data-label="Qty" style={{ textAlign: 'center', fontWeight: '600', color: '#334155' }}>{item.quantity}</td>
                          {!isProductionUser && <td data-label="Rate" style={{ textAlign: 'center', fontWeight: '600', color: '#334155' }}>{formatINR(item.unitPrice)}</td>}
                          {discountAmt > 0 && (
                            <td data-label="Discount" style={{ textAlign: 'center', fontWeight: '600', color: '#5E6B82' }}>{item.discount || 0}%</td>
                          )}
                          {!isProductionUser && <td data-label="Tax (GST)" style={{ textAlign: 'center', fontWeight: '600', color: '#5E6B82' }}>{item.tax !== undefined ? item.tax : 18}%</td>}
                          {!isProductionUser && <td data-label="Total" style={{ textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>{formatINR(itemTotal)}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculations Invoice Summary panel */}
              {!isProductionUser && (
                <div className="sheet-summary">
                  <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatINR(calculatedSubtotal - discountAmt)}</span>
                  </div>
                  <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
                    <span>GST Amount:</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatINR(calculatedTaxAmt)}</span>
                  </div>
                  {computedTransportVal > 0 && (
                    <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#0369a1', fontWeight: '500' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> Transport (Approx.):</span>
                      <span style={{ fontWeight: '600' }}>+{formatINR(computedTransportVal)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#1e293b', borderTop: '1px solid #eaeaea', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: '#1e293b', fontSize: '17px' }}>{formatINR(orderGrandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Production Journey Steps Tracker */}
              {getReplacementHistory(currentDetailsOrder).length > 0 && (
                <div style={{ background: '#fff7ed', borderRadius: '12px', padding: '16px', border: '1px solid #fed7aa', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#9a3412', margin: 0 }}>
                      Replacement History
                    </h4>
                    {String(currentDetailsOrder.replacementStatus || currentDetailsOrder._raw?.replacement_status || '').toUpperCase() === 'COMPLETED' && (
                      <StatusBadge status="Replacement Completed" />
                    )}
                  </div>
                  <div className="crm-table-container" style={{ margin: 0, border: '1px solid #fed7aa' }}>
                    <table className="crm-table responsive-table" style={{ border: 'none' }}>
                      <thead>
                        <tr>
                          <th>Replacement No</th>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Requested</th>
                          <th>Delivered</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getReplacementHistory(currentDetailsOrder).map((rep) => (
                          <tr key={rep.id || rep.request_no}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{rep.request_no}</td>
                            <td>{rep.product_name || rep.productName || 'N/A'}</td>
                            <td>{Number(rep.delivered_qty || rep.approved_qty || rep.requested_qty || 0)}</td>
                            <td>{rep.created_at ? String(rep.created_at).slice(0, 10) : '-'}</td>
                            <td>{rep.delivered_at ? String(rep.delivered_at).slice(0, 10) : '-'}</td>
                            <td><StatusBadge status={rep.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action buttons controls */}
              <div className="sheet-actions">
                {canSendToPlantHead(currentDetailsOrder) && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatusClick(currentDetailsOrder.orderNo || currentDetailsOrder.id, 'PLANT_PENDING', 'Send to Plant Head')}
                    style={{
                      padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0,
                      background: '#c9f03d', border: '1px solid #b5da2a', color: '#1a2600', cursor: 'pointer'
                    }}
                  >
                    ✓ Send to Plant Head
                  </button>
                )}
                {canAskForPayment(currentDetailsOrder) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedOrder(null); navigate.push('/sales/payment-followup'); }}
                    style={{
                      padding: '10px 20px', fontSize: '13px', fontWeight: '800', borderRadius: '8px', margin: 0,
                      background: '#eff6ff', border: '1px solid #3b82f6', color: '#1d4ed8', cursor: 'pointer'
                    }}
                  >
                    Ask for Payment
                  </button>
                )}
                {onAskReplacement && isDeliveredOrder(currentDetailsOrder) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedOrder(null); onAskReplacement(currentDetailsOrder); }}
                    style={{
                      padding: '10px 20px', fontSize: '13px', fontWeight: '800', borderRadius: '8px', margin: 0,
                      background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', cursor: 'pointer'
                    }}
                  >
                    Ask for Replacement
                  </button>
                )}
                {onAskReturn && isDeliveredOrder(currentDetailsOrder) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedOrder(null); onAskReturn(currentDetailsOrder); }}
                    style={{
                      padding: '10px 20px', fontSize: '13px', fontWeight: '800', borderRadius: '8px', margin: 0,
                      background: '#fff1f2', border: '1px solid #f43f5e', color: '#e11d48', cursor: 'pointer'
                    }}
                  >
                    Ask for Return
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn-small btn-outline-small" 
                  onClick={() => setSelectedOrder(null)}
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0 }}
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedDeliveryModal && (
          <div className="sheet-backdrop" onClick={() => setSelectedDeliveryModal(null)}>
            <div className="sheet-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Delivery Details & Status</h3>
                  <p style={{ fontSize: '13px', color: '#5E6B82', margin: '2px 0 0 0' }}>Order #{selectedDeliveryModal.orderNo || selectedDeliveryModal.id}</p>
                </div>
                <StatusBadge status="Delivered" />
              </div>

              <div style={{ background: '#F5FAFE', border: '1px solid #DCE5F0', borderRadius: '14px', padding: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase' }}>Dispatch ID</span>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#334155', fontFamily: 'monospace', marginTop: '2px' }}>
                    {selectedDeliveryModal.dispatchId || `DSP-${String(selectedDeliveryModal.orderNo || selectedDeliveryModal.id || '').replace(/^ORD-/i, '').replace(/^WO-/i, '')}`}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase' }}>Vehicle Number</span>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1d4ed8', fontFamily: 'monospace', marginTop: '2px' }}>
                    {selectedDeliveryModal.vehicleNumber || 'UK07AB1234'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase' }}>Driver Details</span>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
                    {selectedDeliveryModal.driverName || 'Raj Kumar'} ({selectedDeliveryModal.driverPhone || '9876543210'})
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase' }}>Delivered Date</span>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
                    {selectedDeliveryModal.actualDeliveryDate || (selectedDeliveryModal.deliveredAt ? String(selectedDeliveryModal.deliveredAt).slice(0, 10) : '16 Jul 2026')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase' }}>Received By</span>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
                    {selectedDeliveryModal.receivedBy || 'Project Engineer - Mr. Sharma'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase' }}>Delivery Documents</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', marginTop: '2px' }}>
                    Signed Challan, POD Stamped ✓
                  </div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Payment Status</span>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e3a8a', marginTop: '2px' }}>
                    {selectedDeliveryModal.paymentStatus === 'paid' ? 'Full Payment Completed ✓' : (selectedDeliveryModal.paymentStatus === 'submitted_for_verification' ? 'Submitted for Finance Verification' : 'Awaiting Payment')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Outstanding Amount</span>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626', marginTop: '2px' }}>
                    {formatINR(selectedDeliveryModal.outstandingAmount !== undefined ? selectedDeliveryModal.outstandingAmount : (selectedDeliveryModal.totalAmount || selectedDeliveryModal.totalValue || 207000))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryModal(null)}
                  style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '10px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedDeliveryModal(null); navigate.push('/sales/payment-followup'); }}
                  style={{ padding: '10px 20px', background: '#2563eb', border: 'none', borderRadius: '10px', fontWeight: '800', color: '#ffffff', cursor: 'pointer' }}
                >
                  Proceed to Payment Follow-up →
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Reminder Modal */}
        <ReminderModal
          key={reminderModal?.reminder?.id || reminderModal?.order?.id || 'new'}
          open={!!reminderModal}
          onClose={() => setReminderModal(null)}
          onSave={handleSaveReminder}
          customerName={reminderModal?.order?.customerName || reminderModal?.order?.customer?.name || ''}
          title={reminderModal?.reminder ? 'Edit Order Reminder' : 'Order Reminder'}
          initialValues={reminderModal?.reminder || null}
        />

      </div>
    );
  }
