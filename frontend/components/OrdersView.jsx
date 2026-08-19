'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Eye, Box, CheckCircle, Truck, PackageCheck, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import Swal from 'sweetalert2';
import StatusBadge from '../shared/components/StatusBadge';
import { useAuth } from '../shared/context/AuthContext';
import ReminderModal from '../shared/components/ReminderModal.jsx';
import SalesOwnerBadge from './SalesOwnerBadge.jsx';
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
  onConfirmPayment,
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
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const search = localSearch;
  const setSearch = (val) => {
    setLocalSearch(val);
    if (typeof setSearchQuery === 'function') {
      setSearchQuery(val);
    }
  };
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryModal, setSelectedDeliveryModal] = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [filter, setFilter] = useState('All Orders');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [reminderModal, setReminderModal] = useState(null);
  const [sendingOrderId, setSendingOrderId] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, pageSize]);

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
    return dispatchSt === 'DELIVERED' || orderSt === 'DELIVERED' || orderSt === 'CLOSED' || Boolean(order?.deliveredDate || order?.deliveredAt);
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
    if (!order) return false;
    if (order.sentToPlantHead || order.sentToPlantHeadAt) return false;
    if (order.planningStatus && order.planningStatus !== 'NOT_SENT') return false;
    const status = String(order.status || order.orderStatus || order.workflowStateCode || order.workflowState?.code || '').toUpperCase();
    if (['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_PENDING', 'PLANT_HEAD_ACCEPTED', 'PRODUCTION_PLANNED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'COMPLETED'].includes(status)) return false;
    return true;
  };

  const canAskReplacement = (order) => {
    return isDeliveredOrder(order) && getAvailableAfterSalesQuantity(order) > 0 && !hasActiveReplacement(order) && !hasFullReturnCompleted(order);
  };

  const canAskReturn = (order) => {
    return isDeliveredOrder(order) && getAvailableAfterSalesQuantity(order) > 0 && !hasActiveReturn(order) && !hasFullReturnCompleted(order);
  };

  const isTradingOrder = (order) => {
    const items = Array.isArray(order?.items) ? order.items : Array.isArray(order?.orderItems) ? order.orderItems : [];
    if (items.length === 0) {
      const singleName = order?.productName || order?.name || '';
      const singleCat = order?.category || order?.brand || '';
      if (['COVERBLOCK', 'RCC PIPE', 'FRC COVER'].includes(singleCat.toUpperCase())) return true;
      if (singleName.toLowerCase().includes('wcb') || singleName.toLowerCase().includes('coverblock')) return true;
      return false;
    }
    return items.every((item) => {
      const type = (item.productType || item.product?.productType || '').toUpperCase();
      const cat = (item.category || item.product?.category || item.brand || '').toUpperCase();
      const name = (item.productNameSnapshot || item.productName || item.name || '').toLowerCase();
      if (type === 'TRADING') return true;
      if (['COVERBLOCK', 'RCC PIPE', 'FRC COVER'].includes(cat)) return true;
      if (name.includes('wcb') || name.includes('coverblock')) return true;
      return false;
    });
  };

  const getOrderStatusLabel = (order) => {
    if (!order) return 'Pending';
    if (order.commercialStatus === 'ORDER_CLOSED') return 'Closed';
    
    const status = String(order.status || order.orderStatus || '').toUpperCase();
    const prodStatus = String(order.productionStatus || '').toUpperCase();
    const dispStatus = String(order.dispatchStatus || '').toUpperCase();
    
    // 1. Delivered
    if (dispStatus === 'DELIVERED' || status === 'DELIVERED' || status === 'COMPLETED') {
      return 'Delivered';
    }
    
    // 2. In Transit
    if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(dispStatus) || status === 'IN_TRANSIT') {
      return 'In Transit';
    }
    
    // 3. Dispatch Planned / Ready for Dispatch
    if (['DISPATCH_DRAFT', 'DISPATCH_CREATED', 'DISPATCH_READY'].includes(dispStatus) || status === 'READY_FOR_DISPATCH' || order.workflowStateCode === 'READY_FOR_DISPATCH') {
      return isTradingOrder(order) ? 'Sent to Dispatch' : 'Ready for Dispatch';
    }
    
    // 4. QC / Quality check / Production Completed
    if (order.qcStatus === 'QC_APPROVED' || ['COMPLETED', 'PRODUCTION_COMPLETED', 'QC_APPROVED'].includes(prodStatus)) {
      return 'QC Approved';
    }
    if (['QUALITY_CHECK', 'QC_INSPECTION', 'QC'].includes(prodStatus)) {
      return 'QC Inspection';
    }
    
    // 5. In Production
    if (['RELEASED', 'PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS', 'IN_PRODUCTION'].includes(prodStatus) || status === 'IN_PRODUCTION') {
      return 'In Production';
    }
    
    // 6. Production Planned (Plant Head Review)
    if (order.planningStatus === 'PRODUCTION_PLANNED' || prodStatus === 'PLANNED' || status === 'PRODUCTION_PLANNED' || status === 'READY_FOR_PRODUCTION') {
      return 'Production Planned';
    }
    
    // 7. Accepted by Plant Head
    if (order.planningStatus === 'PLANT_HEAD_ACCEPTED' || status === 'PLANT_APPROVED') {
      return 'Accepted by Plant Head';
    }
    
    // 8. Sent to Plant Head
    if (order.planningStatus === 'PENDING_ACCEPTANCE' || ['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD'].includes(status) || order.sentToPlantHead) {
      return isTradingOrder(order) ? 'Sent to Dispatch' : 'Sent to Plant Head';
    }
    
    // 9. Confirmed
    if (['CONFIRMED', 'ORDER_CONFIRMED', 'DRAFT', 'SUBMITTED', 'PENDING_APPROVAL'].includes(status) || order.commercialStatus === 'ORDER_CONFIRMED') {
      return 'Confirmed';
    }
    
    return order.status || order.workflowStatus || 'Confirmed';
  };

  const getOrderActionState = (order) => {
    if (!order) return { action: null, label: 'No Action' };

    const backendStatus = String(
      order.status ||
      order.workflowStateCode ||
      order.orderStatus ||
      ''
    ).trim().toUpperCase();

    const isTrading = isTradingOrder(order);

    if (backendStatus === 'READY_FOR_DISPATCH') {
      return { action: null, label: isTrading ? 'Sent to Dispatch' : 'Ready for Dispatch' };
    }

    const isAlreadySent = Boolean(
      order.sentToPlantHead ||
      order.sentToPlantHeadAt ||
      (order.planningStatus && order.planningStatus !== 'NOT_SENT') ||
      ['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_PENDING', 'PLANT_APPROVED', 'PLANT_HEAD_ACCEPTED', 'PRODUCTION_PLANNED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'COMPLETED'].includes(backendStatus)
    );

    if (isAlreadySent) {
      if (backendStatus === 'PLANT_APPROVED' || order.planningStatus === 'PLANT_HEAD_ACCEPTED') {
        return { action: null, label: 'Accepted by Plant Head' };
      }
      if (order.planningStatus === 'PRODUCTION_PLANNED' || order.productionStatus === 'PLANNED' || backendStatus === 'PRODUCTION_PLANNED' || backendStatus === 'READY_FOR_PRODUCTION') {
        return { action: null, label: 'Production Planned' };
      }
      if (['PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS', 'IN_PRODUCTION'].includes(order.productionStatus) || backendStatus === 'IN_PRODUCTION') {
        return { action: null, label: 'In Production' };
      }
      return { action: null, label: isTrading ? 'Sent to Dispatch' : 'Sent to Plant Head' };
    }

    const actionLabel = isTrading ? 'Send to Dispatch' : 'Send to Plant Head';

    return { action: 'SEND_TO_PLANT', label: actionLabel };
  };

  const validOrders = orders.filter(o => {
    if (!o) return false;
    const orderReference = o.orderNo || o.orderNumber || o.orderId || o.id;
    const hasOrderReference = Boolean(orderReference);
    const cust = o.customerName || o.customer?.companyName || o.customer?.name || o.clientName || o.companyName || o.leadName || o.customer;
    const hasCustomer = Boolean(cust);
    const hasItems =
      (Array.isArray(o.items) && o.items.length > 0) ||
      (Array.isArray(o.detailedItems) && o.detailedItems.length > 0) ||
      (Array.isArray(o.orderItems) && o.orderItems.length > 0) ||
      Boolean(o.products) ||
      Boolean(o.totalAmount) ||
      Boolean(o.grandTotal) ||
      Boolean(o.totalValue) ||
      Boolean(orderReference);
    return hasOrderReference && (hasCustomer || hasItems);
  });

  const filteredOrders = validOrders.filter(o => {
    const custVal = o.customerName || o.customer?.companyName || o.customer?.name || o.clientName || o.companyName || o.leadName || '';
    const custName = typeof custVal === 'string' ? custVal : (custVal?.companyName || custVal?.name || '');

    let itemsStr = '';
    if (typeof o.products === 'string') {
      itemsStr = o.products;
    } else if (Array.isArray(o.items)) {
      itemsStr = o.items.map(i => i.productName || i.name || i.productNameSnapshot || i.productCode || '').join(' ');
    } else if (Array.isArray(o.detailedItems)) {
      itemsStr = o.detailedItems.map(i => i.productName || i.name || '').join(' ');
    }

    const orderNoStr = String(o.orderNo || o.orderNumber || o.orderId || o.id || '');
    const poNoStr = String(o.customerPurchaseOrderNo || o.customerPoNo || o.poNumber || o.poNo || '');
    const qStr = search.trim().toLowerCase();

    const matchesSearch = !qStr ||
      custName.toLowerCase().includes(qStr) || 
      itemsStr.toLowerCase().includes(qStr) ||
      orderNoStr.toLowerCase().includes(qStr) ||
      poNoStr.toLowerCase().includes(qStr);
    
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

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const startIndex = filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredOrders.length);
  const displayedOrders = flat ? filteredOrders : filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

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
        <h2 className="module-title">Sales Orders Tracker</h2>
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
      <div className="crm-table-container desktop-only">
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
                      <td data-label="Customer" style={{ fontWeight: 700 }}>{o.customerName || o.customer?.name || o.customer?.companyName || '—'}</td>
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
                              onClick={() => {
                                const targetId = o.id || o.orderNo || o.orderNumber;
                                navigate.push(`/sales/payment-followup?orderId=${targetId}`);
                              }}
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
                      {o.customerName || o.customer?.name || o.customer?.companyName || '—'}
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

                            {(actionState.action === 'SEND_TO_PLANT' || actionState.action === 'SEND_TO_PLANT_HEAD' || actionState.action === 'SEND_TO_PLANT_HEAD_DIRECT') && (
                              <button
                                type="button"
                                disabled={sendingOrderId === (o.id || o.orderNo)}
                                onClick={async () => {
                                  const orderId = o.id || o.orderNo;
                                  if (sendingOrderId === orderId) return;
                                  const isTrading = isTradingOrder(o);
                                  const confirmation = await Swal.fire({
                                    title: isTrading ? 'Send Order to Dispatch?' : 'Send Order to Plant Head?',
                                    text: isTrading
                                      ? 'This is a Trading Order. It will bypass factory production and go directly to the Dispatch queue.'
                                      : 'This order will be added to the Plant Head incoming-order queue for production planning.',
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonText: isTrading ? 'Yes, Send to Dispatch' : 'Yes, Send Order',
                                    cancelButtonText: 'Cancel',
                                  });
                                  if (!confirmation.isConfirmed) return;
                                  setSendingOrderId(orderId);
                                  try {
                                    const sent = await onUpdateOrderStatus?.(orderId, 'SEND_TO_PLANT');
                                    if (sent !== false) {
                                      await Swal.fire({
                                        title: isTrading ? 'Sent to Dispatch' : 'Order Sent Successfully',
                                        text: isTrading
                                          ? 'The order is now available in Dispatch Orders for fulfillment.'
                                          : 'The order is now available in Plant Head Incoming Orders.',
                                        icon: 'success',
                                      });
                                    }
                                  } catch (err) {
                                    await Swal.fire({ icon: 'error', title: 'Unable to Send Order', text: err?.message || 'Unable to send order' });
                                  } finally {
                                    setSendingOrderId(null);
                                  }
                                }}
                                data-testid={`order-send-action-${o.orderNo || o.id}`}
                                style={{
                                  display: 'inline-flex', alignItems: 'center',
                                  padding: '4px 12px', height: '30px',
                                  background: isTradingOrder(o) ? '#0284c7' : '#2F4375',
                                  border: isTradingOrder(o) ? '1px solid #0369a1' : '1px solid #2F4375',
                                  borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: '700',
                                  color: '#ffffff', whiteSpace: 'nowrap',
                                  flexShrink: 0
                                }}
                              >
                                {actionState.label}
                              </button>
                            )}

                            {isDeliveredOrder(o) && (
                              <>
                                {canAskForPayment(o) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const targetId = o.id || o.orderNo || o.orderNumber;
                                      navigate.push(`/sales/payment-followup?orderId=${targetId}`);
                                    }}
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

      {/* Mobile Card Layout */}
      <div className="mobile-only orders-mobile-list" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
        <style>{`
          @media (max-width: 640px) {
            .desktop-only { display: none !important; }
            .mobile-only.orders-mobile-list { display: flex !important; }
          }
        `}</style>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
            No orders generated.
          </div>
        ) : (
          displayedOrders.map((o) => {
            const paid = Number(o.verifiedPaidAmount ?? o.payment?.paid ?? 0) || 0;
            const total = Number(o.grandTotal ?? o.totalAmount ?? o.payment?.totalAmount ?? o.totalValue ?? 0) || 0;
            const paymentKey = String(o.paymentStatus || '').toUpperCase();
            const paymentLabel = PAYMENT_LABELS[paymentKey] || (paymentKey ? paymentKey.replaceAll('_', ' ') : 'Awaiting Payment');
            
            let itemsList = '—';
            if (o.products) { itemsList = o.products; }
            else if (Array.isArray(o.items) && o.items.length > 0) {
              itemsList = o.items.map(i => `${i.productName || i.name || i.product?.name || i.productNameSnapshot || 'Item'} (${i.quantity ?? i.orderedQuantity ?? 1} Qty)`).join(', ');
            } else if (Array.isArray(o.detailedItems) && o.detailedItems.length > 0) {
              itemsList = o.detailedItems.map(i => `${i.productName || i.name || 'Item'} (${i.quantity || 1} Qty)`).join(', ');
            }

            const orderNo = o.orderNo || o.id;
            const actionState = getOrderActionState(o);
            const statusLabel = isProductionUser ? (o.orderStage || 'In Production') : (filter === 'Delivered' ? paymentLabel : getOrderStatusLabel(o));

            return (
              <div key={orderNo} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #f1f3f5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span onClick={() => navigate.push(`/orders/${orderNo}`)} style={{ fontSize: '15px', fontWeight: '800', color: '#1e3a8a', textDecoration: 'underline', cursor: 'pointer' }}>{orderNo}</span>
                  <button onClick={() => setSelectedOrder(o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', cursor: 'pointer' }}>
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Customer</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>{o.customerName || o.customer?.name || o.customer?.companyName || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Total Value</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{formatINR(total)}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Products / Items</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>{itemsList}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Status</div>
                    <StatusBadge status={statusLabel} />
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f3f5', paddingTop: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Actions</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    
                    {actionState && actionState.label && (
                      <button
                        type="button"
                        onClick={actionState.onClick}
                        disabled={actionState.disabled}
                        style={{
                          gridColumn: actionState.label === 'Send to Plant Head' ? '1 / -1' : 'auto',
                          padding: '8px 12px', height: '36px',
                          background: actionState.label === 'Send to Plant Head' ? '#1e3a8a' : (actionState.disabled ? '#f1f5f9' : '#eff6ff'),
                          border: actionState.label === 'Send to Plant Head' ? 'none' : `1px solid ${actionState.disabled ? '#e2e8f0' : '#3b82f6'}`,
                          borderRadius: '8px', cursor: actionState.disabled ? 'not-allowed' : 'pointer',
                          fontSize: '13px', fontWeight: '700',
                          color: actionState.label === 'Send to Plant Head' ? '#ffffff' : (actionState.disabled ? '#94a3b8' : '#1d4ed8'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {actionState.label}
                      </button>
                    )}

                    {onAskReplacement && isDeliveredOrder(o) && !hasActiveReplacement(o) && !['COMPLETED', 'REJECTED'].includes(String(o.replacementStatus || '').toUpperCase()) && (
                      <button
                        type="button"
                        onClick={() => onAskReplacement(o)}
                        style={{
                          gridColumn: actionState && actionState.label ? 'auto' : '1',
                          padding: '8px 12px', height: '36px',
                          background: '#fef9c3', border: '1px solid #fde047',
                          borderRadius: '8px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '800',
                          color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        Ask for Replacement
                      </button>
                    )}
                    
                    {onAskReturn && isDeliveredOrder(o) && !hasActiveReturn(o) && !['COMPLETED', 'REJECTED'].includes(String(o.returnStatus || '').toUpperCase()) && (
                      <button
                        type="button"
                        onClick={() => onAskReturn(o)}
                        style={{
                          gridColumn: (actionState && actionState.label) || onAskReplacement ? 'auto' : '1',
                          padding: '8px 12px', height: '36px',
                          background: '#ffe4e6', border: '1px solid #fda4af',
                          borderRadius: '8px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '800',
                          color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        Ask for Return
                      </button>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination controls */}
      {!flat && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginTop: '20px',
          borderTop: '1px solid var(--color-border, #e2e8f0)',
          paddingTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)' }}>
              Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of <strong>{filteredOrders.length}</strong> orders
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary, #64748b)' }}>
              <span>Show:</span>
              <select
                aria-label="Items per page"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  color: '#1e293b',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              disabled={currentPage === 1 || filteredOrders.length === 0}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="btn-small btn-outline-small"
              style={{
                margin: 0,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: (currentPage === 1 || filteredOrders.length === 0) ? 0.5 : 1,
                cursor: (currentPage === 1 || filteredOrders.length === 0) ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {filteredOrders.length > 0 && getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 6px',
                  borderRadius: '6px',
                  border: currentPage === pageNum ? 'none' : '1px solid #cbd5e1',
                  background: currentPage === pageNum ? '#2F4375' : '#ffffff',
                  color: currentPage === pageNum ? '#ffffff' : '#334155',
                  fontWeight: currentPage === pageNum ? '700' : '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || filteredOrders.length === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="btn-small btn-outline-small"
              style={{
                margin: 0,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: (currentPage === totalPages || filteredOrders.length === 0) ? 0.5 : 1,
                cursor: (currentPage === totalPages || filteredOrders.length === 0) ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                fontWeight: '600'
              }}
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
                  <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{currentDetailsOrder.customerName || currentDetailsOrder.customer?.name || currentDetailsOrder.customer?.companyName || '—'}</p>
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
                    onClick={() => {
                      const targetId = currentDetailsOrder.id || currentDetailsOrder.orderNo || currentDetailsOrder.orderNumber;
                      setSelectedOrder(null);
                      navigate.push(`/sales/payment-followup?orderId=${targetId}`);
                    }}
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
