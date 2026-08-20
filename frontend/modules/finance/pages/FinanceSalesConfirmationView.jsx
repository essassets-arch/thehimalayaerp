'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, CheckCircle2, XCircle, Eye, FileText, Download, DollarSign, Clock, AlertTriangle,
  TrendingDown, ShieldCheck, AlertCircle, Calendar, ArrowUpRight
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import Swal from 'sweetalert2';
import { useQuery } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/backendFetch';

const formatINR = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

export default function FinanceSalesConfirmationView() {
  const state = useERPStore((s) => s.state);
  const verifyFinancePayment = useERPStore((s) => s.verifyFinancePayment);
  const rejectFinancePayment = useERPStore((s) => s.rejectFinancePayment);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const localOrders = state.sales?.orders || [];
  const { data: backendPayments = [], refetch: refetchBackendPayments } = useQuery({
    queryKey: ['finance-sales-payment-confirmations'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });
  const { data: backendDeliveredOrders = [] } = useQuery({
    queryKey: ['finance-delivered-sales-orders'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments/delivered-orders');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });
  const orders = React.useMemo(() => {
    const combined = [...backendDeliveredOrders, ...localOrders];
    return combined.filter((order, index, list) => {
      const key = String(order.id || order.orderNo || order.orderId || '');
      return list.findIndex((candidate) =>
        String(candidate.id || candidate.orderNo || candidate.orderId || '') === key
      ) === index;
    });
  }, [backendDeliveredOrders, localOrders]);

  const calculateVerifiedPaidAmount = (orderId, confirmations) => {
    const normId = String(orderId || '').replace(/^ORD-/, '').trim().toLowerCase();
    const list = confirmations || [];
    return list
      .filter((payment) => {
        const normPId = String(payment.orderId || '').replace(/^ORD-/, '').trim().toLowerCase();
        return normPId === normId && (payment.status === 'FINANCE_VERIFIED' || payment.status === 'VERIFIED');
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  };

  const calculatePendingAmount = (order, confirmations) => {
    const total = Number(order.grandTotal ?? order.totalAmount ?? 0);
    const paid = calculateVerifiedPaidAmount(order.id || order.orderNo || order.orderNumber, confirmations);
    return Math.max(total - paid, 0);
  };

  const calculateOrderPaymentTerms = (o) => {
    const deliveryDate = o.deliveredAt || o.delivered_at || o.actualDeliveryDate || o.deliveredDate;
    const invoiceDate = o.invoiceDate || o.invoice_date || deliveryDate || o.createdAt;
    const rawTerms = o.paymentTerms || o.payment_terms || o.quotation?.paymentTerms || '';
    const isAdvance = String(rawTerms).toLowerCase().includes('advance') || String(o.payment_terms || '').toLowerCase().includes('advance');
    const termDays = isAdvance ? 0 : (Number(o.paymentTermsDays ?? o.payment_terms_days ?? o.paymentTermDays ?? (String(rawTerms).match(/\d+/)?.[0] || 15)) || 15);
    const displayTerms = isAdvance ? 'Advance' : (rawTerms || `${termDays} Days`);

    let dueDateValue = null;
    if (o.paymentDueDate || o.payment_due_date) {
      dueDateValue = new Date(o.paymentDueDate || o.payment_due_date);
    } else if (invoiceDate) {
      const base = new Date(invoiceDate);
      dueDateValue = isAdvance ? base : new Date(base.getTime() + termDays * 86400000);
    }

    let remainingDays = null;
    let reminderLabel = 'Not scheduled';
    if (isAdvance) {
      remainingDays = 0;
      reminderLabel = 'Advance (Immediate)';
    } else if (dueDateValue) {
      const todayMid = new Date();
      todayMid.setHours(0, 0, 0, 0);
      const dueMid = new Date(dueDateValue);
      dueMid.setHours(0, 0, 0, 0);
      remainingDays = Math.round((dueMid.getTime() - todayMid.getTime()) / 86400000);

      if (remainingDays > 0) {
        reminderLabel = `Due in ${remainingDays} Day${remainingDays === 1 ? '' : 's'}`;
      } else if (remainingDays === 0) {
        reminderLabel = 'Due Today';
      } else {
        reminderLabel = `Overdue by ${Math.abs(remainingDays)} Day${Math.abs(remainingDays) === 1 ? '' : 's'}`;
      }
    }

    return {
      deliveryDate: deliveryDate ? String(deliveryDate).split('T')[0] : null,
      invoiceDate: invoiceDate ? String(invoiceDate).split('T')[0] : null,
      dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : null,
      paymentTerms: displayTerms,
      termDays,
      isAdvance,
      remainingDays,
      reminderLabel,
    };
  };

  const paymentConfirmations = React.useMemo(() => {
    const getStorageConfirmations = () => {
      try {
        const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
        if (raw) {
          const list = JSON.parse(raw);
          return list.map((c) => ({
            id: c.id || `PC-${Date.now()}`,
            orderId: c.orderId || c.orderNo,
            amount: Number(c.amount || 0),
            paymentDate: c.createdAt || new Date().toISOString(),
            method: c.paymentMode || c.method || 'BANK_TRANSFER',
            transactionReference: c.referenceNumber || c.transactionReference || 'UTR-88992233',
            proofDocument: c.proofDocument || c.proofUrl,
            status: c.status || 'FINANCE_VERIFICATION_PENDING',
            financeRemarks: c.remarks,
            createdAt: c.createdAt,
            source: 'local_storage',
            orderSnapshot: {
              id: c.orderId || c.orderNo,
              orderNo: c.orderNo || c.orderNumber || c.orderId,
              invoiceNo: `INV-${String(c.orderNo || c.orderId).replace(/^ORD-/, '').slice(-6)}`,
              customerName: c.customerName || 'Customer',
              salesperson: 'Sales',
              grandTotal: Number(c.amount || 0),
              totalAmount: Number(c.amount || 0),
            },
          }));
        }
      } catch {}
      return [];
    };

    const localConfirmations = (state.finance?.customerPayments || []).map((p) => ({
      id: p.id,
      orderId: p.orderId,
      amount: p.paymentAmount,
      paymentDate: p.paymentDate,
      method: p.paymentMode === 'Bank Transfer' ? 'BANK_TRANSFER' : (p.paymentMode === 'Cheque' ? 'CHEQUE' : (p.paymentMode === 'Cash' ? 'CASH' : 'ONLINE')),
      transactionReference: p.transactionReference || p.chequeNumber || p.referenceNumber,
      proofDocument: p.paymentProof?.[0],
      status: p.verificationStatus,
      financeRemarks: p.rejectionReason || p.remarks,
      verifiedBy: p.verifiedBy,
      verifiedAt: p.verifiedAt,
      createdAt: p.recordedAt,
      source: 'local',
    }));
    const persistedConfirmations = backendPayments
      .filter((payment) => payment.salesOrderId)
      .map((payment) => {
        const backendStatus = String(payment.status || '').toUpperCase();
        const status =
          ['UNDER_VERIFICATION', 'SUBMITTED', 'RECEIVED'].includes(backendStatus)
            ? 'FINANCE_VERIFICATION_PENDING'
            : ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(backendStatus)
              ? 'FINANCE_VERIFIED'
              : backendStatus === 'BOUNCED'
                ? 'FINANCE_REJECTED'
                : backendStatus;
        return {
          id: payment.id,
          orderId: payment.salesOrderId,
          amount: Number(payment.amount || 0),
          paymentDate: payment.receivedAt || payment.createdAt,
          method: payment.method || 'BANK_TRANSFER',
          transactionReference: payment.paymentNo,
          proofDocument: payment.proofUrl,
          status,
          verifiedAt: payment.verifiedAt,
          createdAt: payment.createdAt,
          source: 'backend',
          orderSnapshot: {
            id: payment.salesOrder?.id || payment.salesOrderId,
            orderNo: payment.salesOrder?.orderNumber,
            invoiceNo: `INV-${payment.salesOrder?.orderNumber || payment.salesOrderId}`,
            customerName: payment.customer?.companyName || payment.customer?.name || 'Unknown',
            salesperson: 'Sales',
            grandTotal: Number(payment.salesOrder?.totalAmount || 0),
            totalAmount: Number(payment.salesOrder?.totalAmount || 0),
          },
        };
      });

    const all = [...persistedConfirmations, ...localConfirmations, ...getStorageConfirmations()];
    const getPriority = (item) => (item.source === 'backend' ? 3 : item.source === 'local' ? 2 : 1);
    const map = new Map();
    all.forEach((item) => {
      const normOrder = String(item.orderId || '').replace(/^ORD-/, '').trim().toLowerCase();
      if (!normOrder) return;
      const ref = String(item.transactionReference || '').replace(/^UTR-88992233$/, '').trim().toLowerCase();
      const key = `${normOrder}_${item.amount}_${item.status}${ref ? `_${ref}` : ''}`;
      if (!map.has(key)) {
        map.set(key, item);
      } else {
        const existing = map.get(key);
        if (getPriority(item) > getPriority(existing)) {
          map.set(key, item);
        }
      }
    });

    return Array.from(map.values());
  }, [state.finance?.customerPayments, backendPayments]);

  const [activeTab, setActiveTab] = useState('Payment Outstanding');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModal, setRejectModal] = useState(null);

  // Top Summary Statistics
  const stats = useMemo(() => {
    let totalOutstanding = 0;
    let awaitingVerifCount = 0;
    let awaitingVerifAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let totalVerified = 0;

    orders.forEach((o) => {
      const isDelivered = String(o.dispatchStatus || '').toUpperCase() === 'DELIVERED' || Boolean(o.deliveredAt);
      const pending = calculatePendingAmount(o, paymentConfirmations);
      if (isDelivered && pending > 0 && o.commercialStatus !== 'ORDER_CLOSED') {
        totalOutstanding += pending;
        const terms = calculateOrderPaymentTerms(o);
        if (terms.remainingDays !== null && terms.remainingDays < 0) {
          overdueCount++;
          overdueAmount += pending;
        }
      }
    });

    paymentConfirmations.forEach((c) => {
      if (c.status === 'FINANCE_VERIFICATION_PENDING' || c.status === 'SALES_PAYMENT_RECORDED') {
        awaitingVerifCount++;
        awaitingVerifAmount += Number(c.amount || 0);
      } else if (c.status === 'FINANCE_VERIFIED' || c.status === 'VERIFIED') {
        totalVerified += Number(c.amount || 0);
      }
    });

    return {
      totalOutstanding,
      awaitingVerifCount,
      awaitingVerifAmount,
      overdueCount,
      overdueAmount,
      totalVerified,
    };
  }, [orders, paymentConfirmations]);

  // Derive unified row objects depending on the tab context
  const rows = useMemo(() => {
    let result = [];
    
    if (activeTab === 'Payment Outstanding') {
      // Base on orders with pendingAmount > 0
      result = orders.filter((o) => {
        const pending = calculatePendingAmount(o, paymentConfirmations);
        const isDelivered =
          String(o.dispatchStatus || '').toUpperCase() === 'DELIVERED' ||
          Boolean(o.deliveredAt);
        return isDelivered && pending > 0 && o.commercialStatus !== 'ORDER_CLOSED';
      }).map((o) => {
        const terms = calculateOrderPaymentTerms(o);
        return {
          type: 'ORDER',
          id: o.id,
          orderId: o.orderNo || o.orderNumber || o.id,
          invoiceNo: o.invoiceNo || `INV-${String(o.orderNo || o.id).replace(/^ORD-/, '')}`,
          customerName: o.customerName,
          salesperson: o.salesperson,
          deliveryDate: terms.deliveryDate,
          invoiceDate: terms.invoiceDate,
          paymentTerms: terms.paymentTerms,
          dueDate: terms.dueDate,
          remainingDays: terms.remainingDays,
          reminderLabel: terms.reminderLabel,
          isAdvance: terms.isAdvance,
          totalAmount: o.grandTotal ?? o.totalAmount,
          verifiedAmount: calculateVerifiedPaidAmount(o.id, paymentConfirmations),
          pendingAmount: calculatePendingAmount(o, paymentConfirmations),
          status: o.paymentStatus || 'PENDING'
        };
      });
    } 
    else if (activeTab === 'Closed Orders') {
      // Base on orders that are ORDER_CLOSED or fully paid
      result = orders.filter((o) => o.commercialStatus === 'ORDER_CLOSED' || calculatePendingAmount(o, paymentConfirmations) <= 0).map((o) => {
        const terms = calculateOrderPaymentTerms(o);
        return {
          type: 'ORDER',
          id: o.id,
          orderId: o.orderNo || o.orderNumber || o.id,
          invoiceNo: o.invoiceNo || `INV-${String(o.orderNo || o.id).replace(/^ORD-/, '')}`,
          customerName: o.customerName,
          salesperson: o.salesperson,
          deliveryDate: terms.deliveryDate,
          invoiceDate: terms.invoiceDate,
          paymentTerms: terms.paymentTerms,
          dueDate: terms.dueDate,
          remainingDays: terms.remainingDays,
          reminderLabel: terms.reminderLabel,
          totalAmount: o.grandTotal ?? o.totalAmount,
          verifiedAmount: calculateVerifiedPaidAmount(o.id, paymentConfirmations),
          pendingAmount: 0,
          status: 'CLOSED'
        };
      });
    }
    else {
      // Based on payment confirmations
      let filteredConfirmations = [];
      if (activeTab === 'Sales Confirmations') {
        filteredConfirmations = paymentConfirmations.filter((c) => c.status === 'FINANCE_VERIFICATION_PENDING' || c.status === 'SALES_PAYMENT_RECORDED');
      } else if (activeTab === 'Verified Payments') {
        filteredConfirmations = paymentConfirmations.filter((c) => c.status === 'FINANCE_VERIFIED' || c.status === 'VERIFIED');
      } else if (activeTab === 'Rejected Payments') {
        filteredConfirmations = paymentConfirmations.filter((c) => c.status === 'FINANCE_REJECTED' || c.status === 'BOUNCED');
      }

      // Deduplicate confirmations per order/amount/status
      const getPriority = (item) => (item.source === 'backend' ? 3 : item.source === 'local' ? 2 : 1);
      const map = new Map();
      filteredConfirmations.forEach((confirmation) => {
        const normOrder = String(confirmation.orderId || '').replace(/^ORD-/, '').trim().toLowerCase();
        const key = `${normOrder}|${confirmation.amount}|${confirmation.status}`;
        if (!map.has(key)) {
          map.set(key, confirmation);
        } else {
          const existing = map.get(key);
          if (getPriority(confirmation) > getPriority(existing)) {
            map.set(key, confirmation);
          }
        }
      });
      filteredConfirmations = Array.from(map.values());

      result = filteredConfirmations.map((c) => {
        const normCId = String(c.orderId || '').replace(/^ORD-/, '').trim().toLowerCase();
        const o = orders.find((ord) => {
          const normOId = String(ord.id || ord.orderNo || ord.orderNumber || '').replace(/^ORD-/, '').trim().toLowerCase();
          return normOId === normCId;
        }) || c.orderSnapshot || {};
        const terms = calculateOrderPaymentTerms(o);

        return {
          type: 'CONFIRMATION',
          id: c.id,
          orderId: o.orderNo || o.orderNumber || c.orderId,
          confirmationId: c.id,
          invoiceNo: o.invoiceNo || (o.invoice_number ? o.invoice_number : `INV-${String(c.orderId).replace(/^ORD-/, '').slice(-6)}`),
          customerName: o.customerName || o.customer_name || o.customer?.name || c.orderSnapshot?.customerName || 'Unknown',
          salesperson: o.salesperson || c.orderSnapshot?.salesperson || 'Sales',
          paymentAmount: c.amount,
          paymentDate: c.paymentDate ? String(c.paymentDate).split('T')[0] : '—',
          paymentMethod: c.method,
          transactionRef: c.transactionReference,
          paymentProof: c.proofDocument,
          paymentTerms: terms.paymentTerms,
          dueDate: terms.dueDate,
          remainingDays: terms.remainingDays,
          reminderLabel: terms.reminderLabel,
          totalAmount: o.grandTotal || o.totalAmount || c.amount,
          verifiedAmount: calculateVerifiedPaidAmount(c.orderId, paymentConfirmations),
          pendingAmount: calculatePendingAmount(o, paymentConfirmations),
          status: c.status,
          remarks: c.financeRemarks,
          rawConfirmation: c
        };
      });
    }

    // Apply text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => 
        r.orderId?.toLowerCase().includes(q) || 
        r.confirmationId?.toLowerCase().includes(q) || 
        r.customerName?.toLowerCase().includes(q) ||
        r.invoiceNo?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, paymentConfirmations, activeTab, searchQuery]);

  const handleApprove = async (confirmationId) => {
    const confirmation = paymentConfirmations.find((item) => item.id === confirmationId);
    const result = await Swal.fire({
      icon: 'question',
      title: 'Approve Payment?',
      text: `Verify ₹${Number(confirmation?.amount || 0).toLocaleString('en-IN')} for ${confirmation?.orderSnapshot?.orderNo || confirmation?.orderId || 'this order'}?`,
      showCancelButton: true,
      confirmButtonText: 'Approve Payment',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;
    setIsProcessing(true);
    try {
      let processed = false;

      // 1. Try Backend if source is backend or not PC- local ID
      if (confirmation?.source === 'backend' || (confirmationId && !String(confirmationId).startsWith('PC-'))) {
        try {
          await backendFetch(`/api/backend/finance/payments/${confirmationId}/verify`, {
            method: 'POST',
          });
          processed = true;
        } catch (backendErr) {
          console.warn('Backend payment verification failed, falling back to local handlers:', backendErr);
        }
      }

      // 2. Try Store action
      if (!processed && typeof verifyFinancePayment === 'function') {
        try {
          verifyFinancePayment(confirmationId, 'Finance Team');
          processed = true;
        } catch (storeErr) {
          console.warn('Store verifyFinancePayment failed:', storeErr);
        }
      }

      // 3. Update localStorage confirmations if source is local_storage or fallback
      if (confirmation || !processed) {
        try {
          const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map((c) => {
              if (c.id === confirmationId || c.orderId === confirmation?.orderId || c.orderNo === confirmation?.orderId) {
                return {
                  ...c,
                  status: 'FINANCE_VERIFIED',
                  paymentStatus: 'PAID',
                  verifiedAt: new Date().toISOString(),
                };
              }
              return c;
            });
            localStorage.setItem('himalaya_sales_payment_confirmations', JSON.stringify(updated));
            processed = true;
          }
        } catch (lsErr) {
          console.warn('LocalStorage payment update error:', lsErr);
        }

        // Also sync order payment status in himalaya_erp_store if available
        try {
          const rawStore = localStorage.getItem('himalaya_erp_store');
          if (rawStore) {
            const parsedStore = JSON.parse(rawStore);
            if (parsedStore?.state?.sales?.orders) {
              parsedStore.state.sales.orders = parsedStore.state.sales.orders.map((ord) => {
                if (ord.id === confirmation?.orderId || ord.orderNo === confirmation?.orderId || ord.orderNumber === confirmation?.orderId) {
                  return {
                    ...ord,
                    paymentStatus: 'PAID',
                    verifiedPaidAmount: Number(confirmation?.amount || ord.grandTotal || ord.totalAmount || 0),
                    balanceAmount: 0,
                  };
                }
                return ord;
              });
              localStorage.setItem('himalaya_erp_store', JSON.stringify(parsedStore));
            }
          }
        } catch {}
      }

      if (!processed && !confirmation) {
        throw new Error('Cannot find this payment record. It may have already been processed.');
      }

      await refetchBackendPayments();
      await Swal.fire({ icon: 'success', title: 'Payment Verified ✓', text: 'The payment has been verified and the order balance updated.', timer: 1800, showConfirmButton: false });
    } catch (err) {
      await Swal.fire({ icon: 'error', title: 'Verification Failed', text: err?.message || String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    const fd = new FormData(e.target);
    const remarks = String(fd.get('remarks') || '');
    setIsProcessing(true);
    try {
      const confirmationId = rejectModal.confirmationId;
      const confirmation = paymentConfirmations.find((item) => item.id === confirmationId);
      let processed = false;

      // 1. Try Backend if source is backend or not PC- local ID
      if (confirmation?.source === 'backend' || (confirmationId && !String(confirmationId).startsWith('PC-'))) {
        try {
          await backendFetch(`/api/backend/finance/payments/${confirmationId}/bounce`, {
            method: 'POST',
            body: { remarks },
          });
          processed = true;
        } catch (backendErr) {
          console.warn('Backend payment rejection failed, falling back to local handlers:', backendErr);
        }
      }

      // 2. Try Store action
      if (!processed && typeof rejectFinancePayment === 'function') {
        try {
          rejectFinancePayment(confirmationId, remarks, 'Finance Team');
          processed = true;
        } catch (storeErr) {
          console.warn('Store rejectFinancePayment failed:', storeErr);
        }
      }

      // 3. Update localStorage confirmations if source is local_storage or fallback
      if (confirmation || !processed) {
        try {
          const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map((c) => {
              if (c.id === confirmationId || c.orderId === confirmation?.orderId || c.orderNo === confirmation?.orderId) {
                return {
                  ...c,
                  status: 'FINANCE_REJECTED',
                  paymentStatus: 'BOUNCED',
                  financeRemarks: remarks,
                  remarks,
                  rejectedAt: new Date().toISOString(),
                };
              }
              return c;
            });
            localStorage.setItem('himalaya_sales_payment_confirmations', JSON.stringify(updated));
            processed = true;
          }
        } catch (lsErr) {
          console.warn('LocalStorage payment rejection error:', lsErr);
        }
      }

      if (!processed && !confirmation) {
        throw new Error('Cannot find this payment record. It may have already been processed.');
      }

      setRejectModal(null);
      await refetchBackendPayments();
      await Swal.fire({ icon: 'success', title: 'Payment Rejected', text: 'The payment has been marked as bounced. Sales can submit a corrected payment confirmation.', timer: 1800, showConfirmButton: false });
    } catch (err) {
      await Swal.fire({ icon: 'error', title: 'Rejection Failed', text: err?.message || String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="finance-verification-page w-full" style={{ width: '100%', maxWidth: '100%', padding: '20px', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div className="finance-verification-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign className="w-7 h-7 text-blue-600" />
            Finance Payment Verification & Outstanding
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time reconciliation of client payments, credit term tracking, and collection verification.
          </p>
        </div>
      </div>

      {/* ── Top Summary KPI Cards ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Outstanding */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Outstanding Balance</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{formatINR(stats.totalOutstanding)}</div>
          </div>
        </div>

        {/* Awaiting Verification */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 600 }}>Awaiting Verification ({stats.awaitingVerifCount})</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#92400E', marginTop: '2px' }}>{formatINR(stats.awaitingVerifAmount)}</div>
          </div>
        </div>

        {/* Overdue Amount */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FECACA',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 600 }}>Overdue Collections ({stats.overdueCount})</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#991B1B', marginTop: '2px' }}>{formatINR(stats.overdueAmount)}</div>
          </div>
        </div>

        {/* Total Verified */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #BBF7D0',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>Verified Collections</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#166534', marginTop: '2px' }}>{formatINR(stats.totalVerified)}</div>
          </div>
        </div>
      </div>

      <div className="payment-verification-table-card w-full" style={{ width: '100%', maxWidth: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Tabs */}
        <div className="finance-verification-tabs" style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'Payment Outstanding', label: 'Payment Outstanding' },
            { id: 'Sales Confirmations', label: `Sales Confirmations (${stats.awaitingVerifCount})` },
            { id: 'Verified Payments', label: 'Verified Payments' },
            { id: 'Rejected Payments', label: 'Rejected Payments' },
            { id: 'Closed Orders', label: 'Closed Orders' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'active' : ''}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === tab.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                background: activeTab === tab.id ? '#2563EB' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="finance-verification-toolbar" style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="finance-verification-search" style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Invoice, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={() => refetchBackendPayments()}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            ↻ Refresh Data
          </button>
        </div>

        {/* Table */}
        <div className="finance-verification-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="payment-verification-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                {activeTab !== 'Payment Outstanding' && activeTab !== 'Closed Orders' && <th style={{ padding: '12px 14px' }}>Conf. ID</th>}
                <th style={{ padding: '12px 14px' }}>Order ID</th>
                <th style={{ padding: '12px 14px' }}>Invoice No</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Delivery / Inv Date</th>
                <th style={{ padding: '12px 14px' }}>Payment Terms</th>
                <th style={{ padding: '12px 14px' }}>Due Date</th>
                <th style={{ padding: '12px 14px' }}>Remaining Days</th>
                {activeTab !== 'Payment Outstanding' && activeTab !== 'Closed Orders' && (
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Payment Amt</th>
                )}
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total Amount</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Verified Paid</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Pending Balance</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '48px 24px', textAlign: 'center', color: '#94A3B8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '32px' }}>📭</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>No records found in this tab.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const remDays = r.remainingDays;
                  const isAdv = r.isAdvance || String(r.paymentTerms || '').toLowerCase().includes('advance');

                  return (
                    <tr key={r.id + idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {r.type === 'CONFIRMATION' && (
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6366F1', background: '#EEF2FF', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            {r.confirmationId}
                          </span>
                        </td>
                      )}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '12.5px', color: '#1E3A8A' }}>
                          {r.orderId}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                        {r.invoiceNo || '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{r.customerName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>By: {r.salesperson}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                        {r.deliveryDate || r.invoiceDate || '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: isAdv ? '#0284c7' : '#2563eb',
                          background: isAdv ? '#e0f2fe' : '#eff6ff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                        }}>
                          {r.paymentTerms || '15 Days'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                        {r.dueDate || '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isAdv ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                            ⚡ Advance
                          </span>
                        ) : remDays === null ? (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        ) : remDays > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: remDays <= 3 ? '#FEF3C7' : '#DCFCE7', color: remDays <= 3 ? '#D97706' : '#16A34A', border: `1px solid ${remDays <= 3 ? '#FDE68A' : '#BBF7D0'}` }}>
                            🟢 {remDays} {remDays === 1 ? 'Day' : 'Days'}
                          </span>
                        ) : remDays === 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                            🟡 Due Today
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                            🔴 Overdue {Math.abs(remDays)}d
                          </span>
                        )}
                      </td>

                      {r.type === 'CONFIRMATION' && (
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                          {formatINR(r.paymentAmount)}
                        </td>
                      )}

                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                        {formatINR(r.totalAmount)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>
                        {formatINR(r.verifiedAmount)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: r.pendingAmount > 0 ? '#DC2626' : '#16A34A' }}>
                        {formatINR(r.pendingAmount)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                          ...(r.status?.includes('VERIFIED') && !r.status?.includes('UN') ? { background: '#D1FAE5', color: '#065F46' } :
                            r.status?.includes('PENDING') || r.status?.includes('RECORDED') ? { background: '#FEF3C7', color: '#92400E' } :
                            r.status?.includes('REJECTED') || r.status?.includes('BOUNCED') ? { background: '#FEE2E2', color: '#991B1B' } :
                            r.status === 'CLOSED' ? { background: '#F1F5F9', color: '#475569' } :
                            r.status === 'FULLY_PAID' ? { background: '#D1FAE5', color: '#065F46' } :
                            r.status === 'PARTIALLY_PAID' ? { background: '#DBEAFE', color: '#1E40AF' } :
                            r.status === 'PENDING' ? { background: '#FEF3C7', color: '#92400E' } :
                            { background: '#F1F5F9', color: '#475569' })
                        }}>
                          {r.status?.includes('VERIFIED') && !r.status?.includes('UN') && <span>✓</span>}
                          {r.status?.includes('PENDING') || r.status?.includes('RECORDED') ? '⏳' : ''}
                          {r.status?.includes('REJECTED') || r.status?.includes('BOUNCED') ? '✕' : ''}
                          {r.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            title="View Details"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: '#475569'
                            }}
                            onClick={() => Swal.fire({
                              title: `Payment & Terms — ${r.orderId}`,
                              html: `
                                <div style="text-align: left; font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
                                  <div><strong>Order No:</strong> ${r.orderId}</div>
                                  <div><strong>Invoice No:</strong> ${r.invoiceNo || '—'}</div>
                                  <div><strong>Customer:</strong> ${r.customerName}</div>
                                  <div><strong>Payment Terms:</strong> ${r.paymentTerms}</div>
                                  <div><strong>Due Date:</strong> ${r.dueDate || '—'} (${r.reminderLabel})</div>
                                  <div><strong>Total Amount:</strong> ${formatINR(r.totalAmount)}</div>
                                  <div><strong>Verified Paid:</strong> ${formatINR(r.verifiedAmount)}</div>
                                  <div><strong>Pending Due:</strong> <span style="color:#DC2626; font-weight:800;">${formatINR(r.pendingAmount)}</span></div>
                                  ${r.paymentMethod ? `<div><strong>Method:</strong> ${r.paymentMethod}</div>` : ''}
                                  ${r.transactionRef ? `<div><strong>Ref/UTR:</strong> ${r.transactionRef}</div>` : ''}
                                </div>
                              `,
                              confirmButtonText: 'Close',
                            })}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {r.type === 'CONFIRMATION' && r.paymentProof && (
                            <button
                              type="button"
                              title="View Proof"
                              style={{
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                color: '#2563EB'
                              }}
                              onClick={() => window.open(r.paymentProof, '_blank', 'noopener,noreferrer')}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          {r.type === 'CONFIRMATION' && (r.status === 'FINANCE_VERIFICATION_PENDING' || r.status === 'SALES_PAYMENT_RECORDED') && (
                            <>
                              <button
                                onClick={() => handleApprove(r.confirmationId)}
                                disabled={isProcessing}
                                style={{
                                  background: '#16A34A',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  opacity: isProcessing ? 0.5 : 1,
                                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                                }}
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" /> {isProcessing ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => setRejectModal(r)}
                                disabled={isProcessing}
                                style={{
                                  background: '#DC2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  opacity: isProcessing ? 0.5 : 1,
                                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                                }}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Reject Payment
              </h2>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleReject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation ID</label>
                <input type="text" disabled value={rejectModal.confirmationId} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Remarks</label>
                <textarea 
                  name="remarks" 
                  required 
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500" 
                  rows={3} 
                  placeholder="State the reason for rejection (e.g. UTR mismatch, insufficient credit)..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setRejectModal(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
