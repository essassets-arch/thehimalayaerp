'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle, 
  CreditCard, Eye, Download, Share2, Printer, Plus, X, ArrowUpDown, ChevronDown, Bell
} from 'lucide-react';
import Swal from 'sweetalert2';
import ReminderModal from '../shared/components/ReminderModal.jsx';
import { useERPStore } from '../store/erpStore';
import { apiClient } from '../lib/apiClient';
import { backendFetch } from '../lib/backendFetch';
import { useQuery } from '@tanstack/react-query';
import { getPaymentStatus, formatRemainingDays } from '../utils/paymentTerms';
import { 
  PaymentStatusBadge, 
  StandardActionButtons, 
  OrderDetailDrawer, 
  PageSearchInput 
} from './GlobalUIComponents';
import './erp-premium-ui.css';

export default function SharedPaymentTable({ mode = 'sales' }: { mode?: 'sales' | 'finance' }) {
  const storeState = useERPStore((s: any) => s.state);
  const recordPayment = useERPStore((s: any) => s.recordSalesPayment);
  const localOrders = useMemo(() => storeState?.sales?.orders || [], [storeState?.sales?.orders]);
  const quotations = useMemo(() => storeState?.sales?.quotations || [], [storeState?.sales?.quotations]);
  const paymentConfirmations = useMemo(() => storeState?.sales?.paymentConfirmations || [], [storeState?.sales?.paymentConfirmations]);
  const consignments = useMemo(() => storeState?.dispatch?.consignments || [], [storeState?.dispatch?.consignments]);
  const { data: backendOrders = [] } = useQuery<any[]>({
    queryKey: ['payment-followup-sales-orders'],
    queryFn: async () => {
      const response = await backendFetch<any>('/api/backend/sales/orders');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });
  const { data: backendPayments = [], refetch: refetchBackendPayments } = useQuery<any[]>({
    queryKey: ['sales-recorded-payments'],
    queryFn: async () => {
      const response = await backendFetch<any>('/api/backend/finance/payments/sales-recorded');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });
  const orders = useMemo(() => {
    const normalizedBackend = backendOrders.map((order: any) => ({
      ...order,
      orderNo: order.orderNo || order.orderId,
    }));
    return [...normalizedBackend, ...localOrders].filter(
      (order: any, index: number, list: any[]) => {
        const key = String(order.id || order.orderNo || order.orderId || '');
        return list.findIndex((candidate: any) =>
          String(candidate.id || candidate.orderNo || candidate.orderId || '') === key
        ) === index;
      },
    );
  }, [backendOrders, localOrders]);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  
  // Modals & Drawers
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<any>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<any>(null);
  
  // Payment Form State
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRemarks, setPayRemarks] = useState('');
  const [payProof, setPayProof] = useState<File | null>(null);
  const [reminderModal, setReminderModal] = useState<any>(null);

  const handleSaveReminder = async (formData: any) => {
    if (!reminderModal) return;
    try {
      await apiClient.post('/sales/reminders', {
        ...formData,
        moduleType: 'Payment',
        moduleId: reminderModal.order.id || reminderModal.order.orderNo,
        customerName: reminderModal.order.customerName || reminderModal.order.customer || 'Customer',
      });
      Swal.fire({ icon: 'success', title: 'Reminder saved', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Failed to save reminder', text: err?.message });
    }
    setReminderModal(null);
  };

  // 1. Process Orders with Payment Calculations
  const processedOrders = useMemo(() => {
    return orders.map((o: any) => {
      const orderId = o.id || o.orderNo;
      const quotation = quotations.find((q: any) => String(q.id) === String(o.quotationId));
      const consignment = consignments.find((c: any) =>
        String(c.orderId) === String(orderId) || String(c.orderId) === String(o.orderNo)
      );
      const totalAmount = Number(
        consignment?.payableAmount ?? o.grandTotal ?? o.totalAmount ?? quotation?.grandTotal ?? 0
      );
      const verifiedFromConfirmations = paymentConfirmations
        .filter((confirmation: any) =>
          confirmation.orderId === o.id && confirmation.status === 'FINANCE_VERIFIED'
        )
        .reduce((sum: number, confirmation: any) => sum + Number(confirmation.amount || 0), 0);
      const backendOrderPayments = backendPayments.filter((payment: any) =>
        String(payment.salesOrderId) === String(o.id)
      );
      const verifiedBackendAmount = backendOrderPayments
        .filter((payment: any) => ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(payment.status || '').toUpperCase()))
        .reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);
      const hasPendingFinanceConfirmation = paymentConfirmations.some((confirmation: any) =>
        String(confirmation.orderId) === String(orderId) &&
        ['FINANCE_VERIFICATION_PENDING', 'PENDING', 'SUBMITTED_FOR_VERIFICATION'].includes(
          String(confirmation.status || '').toUpperCase()
        )
      ) || backendOrderPayments.some((payment: any) =>
        ['SUBMITTED', 'UNDER_VERIFICATION', 'FINANCE_VERIFICATION_PENDING', 'RECEIVED']
          .includes(String(payment.status || '').toUpperCase())
      );
      const paidAmount = Number(o.paidAmount || o.paid_amount || (verifiedFromConfirmations + verifiedBackendAmount) || 0);
      const pendingAmount = Math.max(0, totalAmount - paidAmount);
      const paymentTermsRaw = String(o.paymentTerms || '15');
      const paymentTermsMatch = paymentTermsRaw.match(/\d+/);
      const paymentTermsDays = paymentTermsMatch ? parseInt(paymentTermsMatch[0], 10) : (paymentTermsRaw.toLowerCase().includes('advance') ? 0 : 15);
      const deliveryDate = consignment?.deliveredAt?.split('T')[0] || o.deliveryDate || o.deliveredAt?.split('T')[0];
      const invoiceDate = o.invoiceDate || deliveryDate || o.createdAt?.split('T')[0] || '--';
      const invoiceNo = o.invoiceNo || `INV-${String(o.orderNo || o.id || '100').replace(/^ORD-/, '')}`;
      const salesperson = o.salesperson || quotation?.salesperson || 'Sales';

      const paymentInfo = getPaymentStatus(
        consignment?.status === 'DELIVERED' || o.dispatchStatus === 'DELIVERED'
          ? 'Delivered'
          : o.dispatchStatus || o.status || '',
        deliveryDate,
        paymentTermsDays,
        totalAmount,
        paidAmount
      );

      return {
        ...o,
        totalAmount,
        paidAmount,
        pendingAmount,
        paymentTerms: paymentTermsRaw,
        paymentTermsDays,
        deliveryDate: deliveryDate || '--',
        invoiceDate,
        invoiceNo,
        salesperson,
        paymentStatus: hasPendingFinanceConfirmation ? 'Payment Verification Pending' : paymentInfo.status,
        dueDate: paymentInfo.dueDate,
        remainingDays: paymentInfo.remainingDays,
        badgeColor: paymentInfo.badgeColor,
        hasPendingFinanceConfirmation,
        isDelivered: consignment?.status === 'DELIVERED' ||
          String(o.dispatchStatus || '').toUpperCase() === 'DELIVERED' ||
          Boolean(deliveryDate && deliveryDate !== '--')
      };
    });
  }, [orders, quotations, paymentConfirmations, backendPayments, consignments]);

  // 2. Filter Orders for Table Display
  const filteredOrders = useMemo(() => {
    return processedOrders.filter((o: any) => {
      if (activeTab === 'pending') {
        if (!o.isDelivered || o.pendingAmount <= 0) return false;
      } else {
        if (o.pendingAmount > 0) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = String(o.id || '').toLowerCase().includes(q);
        const matchNo = String(o.orderNo || '').toLowerCase().includes(q);
        const matchCust = String(o.customerName || o.customer || '').toLowerCase().includes(q);
        const matchInv = String(o.invoiceNo || '').toLowerCase().includes(q);
        const matchSales = String(o.salesperson || '').toLowerCase().includes(q);
        if (!matchId && !matchNo && !matchCust && !matchInv && !matchSales) return false;
      }

      if (customerFilter && !String(o.customerName || o.customer || '').toLowerCase().includes(customerFilter.toLowerCase())) {
        return false;
      }

      if (salespersonFilter && !String(o.salesperson || '').toLowerCase().includes(salespersonFilter.toLowerCase())) {
        return false;
      }

      if (statusFilter && o.paymentStatus !== statusFilter) return false;

      if (quickFilter) {
        const rem = o.remainingDays;
        if (quickFilter === 'due_today' && rem !== 0) return false;
        if (quickFilter === 'due_7' && (rem === null || rem <= 0 || rem > 7)) return false;
        if (quickFilter === 'overdue_20_30' && (rem === null || rem > -20 || rem < -30)) return false;
        if (quickFilter === 'overdue_30_45' && (rem === null || rem > -30 || rem < -45)) return false;
        if (quickFilter === 'overdue_45_60' && (rem === null || rem > -45 || rem < -60)) return false;
        if (quickFilter === 'overdue_60_90' && (rem === null || rem > -60 || rem < -90)) return false;
        if (quickFilter === 'overdue_90_plus' && (rem === null || rem > -90)) return false;
      }

      return true;
    });
  }, [processedOrders, activeTab, searchQuery, customerFilter, salespersonFilter, statusFilter, quickFilter]);

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    const amountNum = Number(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Swal.fire({
        title: 'Invalid Amount',
        text: 'Please enter a valid positive payment amount.',
        icon: 'warning',
        confirmButtonColor: '#d97706'
      });
      return;
    }
    if (amountNum > Number(paymentModalOrder.pendingAmount || 0)) {
      Swal.fire({
        title: 'Amount Exceeds Balance',
        text: `The maximum recordable amount is ₹${Number(paymentModalOrder.pendingAmount || 0).toLocaleString('en-IN')}.`,
        icon: 'warning',
      });
      return;
    }
    if (!payProof) {
      Swal.fire({
        title: 'Payment Proof Required',
        text: 'Please upload one payment receipt or transaction screenshot.',
        icon: 'warning',
      });
      return;
    }

    try {
      const upload = new FormData();
      upload.append('file', payProof);
      upload.append('category', 'payment-proof');
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: upload });
      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json().catch(() => ({}));
        throw new Error(uploadError?.message || 'Payment proof upload failed');
      }
      const uploadedProof = await uploadResponse.json();
      const proofUrl = uploadedProof.url;
      if (!proofUrl) throw new Error('Payment proof upload did not return a file URL');

      const localOrder = localOrders.find((order: any) =>
        [order.id, order.orderNo, order.orderNumber]
          .filter(Boolean)
          .some((identifier) =>
            [paymentModalOrder.id, paymentModalOrder.orderNo, paymentModalOrder.orderNumber]
              .filter(Boolean)
              .some((candidate) => String(candidate) === String(identifier))
          )
      );

      if (localOrder) {
        recordPayment(
          localOrder.id,
          {
            amount: amountNum,
            method: 'BANK_TRANSFER',
            transactionReference: `TXN${Date.now().toString().slice(-6)}`,
            paymentDate: payDate,
            remarks: payRemarks,
            proofDocument: proofUrl,
          },
          mode === 'finance' ? 'Finance Team' : 'Sales Executive'
        );
      } else {
        const customerId = paymentModalOrder.customerId || paymentModalOrder.customer?.id;
        if (!customerId) {
          throw new Error('Customer information is missing for this order. Please refresh and try again.');
        }

        await backendFetch<any>('/api/backend/finance/payments/sales-record', {
          method: 'POST',
          body: {
            customerId,
            amount: amountNum,
            paymentDate: payDate,
            method: 'BANK_TRANSFER',
            remarks: payRemarks,
            salesOrderId: paymentModalOrder.id,
            proofUrl,
          },
        });
        await refetchBackendPayments();
      }

    const orderId = paymentModalOrder.orderNo || paymentModalOrder.orderNumber || paymentModalOrder.id;

    Swal.fire({
      title: 'Payment Submitted for Verification',
      html: `
        <div style="font-size:14px; text-align:left; line-height:1.6; padding: 4px;">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Amount Recorded:</strong> <span style="color:#047857; font-weight:bold;">₹${amountNum.toLocaleString('en-IN')}</span></p>
          <p><strong>Payment Date:</strong> ${payDate}</p>
          <p><strong>Status:</strong> <span style="color:#b45309; font-weight:bold;">PENDING FINANCE VERIFICATION</span></p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#059669',
      confirmButtonText: 'Done'
    });

      setPaymentModalOrder(null);
      setPayAmount('');
      setPayRemarks('');
      setPayProof(null);
    } catch (error: any) {
      Swal.fire({
        title: 'Payment Recording Failed',
        text: error?.message || String(error),
        icon: 'error',
      });
    }
  };

  return (
    <div className="erp-page-container">
      
      {/* Header Card */}
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <CreditCard style={{ width: 24, height: 24, color: '#4f46e5' }} />
            {mode === 'finance' ? 'Finance → Payment Verification' : 'Sales → Payment Follow-up'}
          </h2>
          <p className="erp-header-subtitle">
            Single Source of Truth payment tracking across ERP. Standardized 15-column specification.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveTab('pending')}
            className={`erp-btn erp-btn-sm ${activeTab === 'pending' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
            type="button"
          >
            {mode === 'finance' ? 'Remaining Payments' : 'Pending Payments'}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`erp-btn erp-btn-sm ${activeTab === 'completed' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
            type="button"
          >
            Paid / Verified Payments
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <PageSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Order ID, Customer, Invoice..."
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
            <strong style={{ color: '#5E6B82' }}>Quick Filters:</strong>
            <button
              onClick={() => setQuickFilter(quickFilter === 'due_today' ? '' : 'due_today')}
              className={`erp-btn erp-btn-sm ${quickFilter === 'due_today' ? 'erp-btn-warning' : 'erp-btn-secondary'}`}
              type="button"
            >
              Due Today
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'due_7' ? '' : 'due_7')}
              className={`erp-btn erp-btn-sm ${quickFilter === 'due_7' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
              type="button"
            >
              Due in 7 Days
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'overdue_20_30' ? '' : 'overdue_20_30')}
              className={`erp-btn erp-btn-sm ${quickFilter === 'overdue_20_30' ? 'erp-btn-danger' : 'erp-btn-secondary'}`}
              type="button"
            >
              20–30 Days Overdue
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'overdue_90_plus' ? '' : 'overdue_90_plus')}
              className={`erp-btn erp-btn-sm ${quickFilter === 'overdue_90_plus' ? 'erp-btn-danger' : 'erp-btn-secondary'}`}
              type="button"
            >
              Above 90 Days
            </button>
            {quickFilter && (
              <button
                onClick={() => setQuickFilter('')}
                style={{ fontSize: '12px', color: '#5E6B82', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                type="button"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
          <input
            type="text"
            placeholder="Filter Customer..."
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="erp-search-input"
            style={{ paddingLeft: '12px' }}
          />
          <input
            type="text"
            placeholder="Filter Salesperson..."
            value={salespersonFilter}
            onChange={(e) => setSalespersonFilter(e.target.value)}
            className="erp-search-input"
            style={{ paddingLeft: '12px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="erp-search-input"
            style={{ paddingLeft: '12px' }}
          >
            <option value="">All Payment Statuses</option>
            <option value="Not Due">Not Due</option>
            <option value="Due Today">Due Today</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
          </select>
          <button
            onClick={() => {
              setCustomerFilter('');
              setSalespersonFilter('');
              setStatusFilter('');
              setSearchQuery('');
              setQuickFilter('');
            }}
            className="erp-btn erp-btn-secondary"
            type="button"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Payment follow-up table */}
      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>1. Order ID</th>
                <th>2. Invoice No</th>
                <th>3. Customer</th>
                <th>4. Salesperson</th>
                <th>5. Delivery Date</th>
                <th>6. Payment Due Date</th>
                <th>7. Remaining Days</th>
                <th>8. Total Amount</th>
                <th>9. Status</th>
                <th>10. POD Document</th>
                <th>11. Reminder</th>
                <th style={{ textAlign: 'right' }}>12. Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '32px', textAlign: 'center', color: '#8893A7', fontStyle: 'italic' }}>
                    No orders match the selected payment filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o: any, idx: number) => {
                  const remainingText = formatRemainingDays(o.remainingDays, o.paymentStatus);
                  return (
                    <tr key={o.id || idx}>
                      <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{o.orderNo || o.id}</td>
                      <td style={{ fontFamily: 'monospace', color: '#475569' }}>{o.invoiceNo}</td>
                      <td style={{ fontWeight: 700, color: '#24345C' }}>{o.customerName || o.customer}</td>
                      <td style={{ color: '#475569' }}>{o.salesperson}</td>
                      <td style={{ color: '#334155' }}>{o.deliveryDate}</td>
                      <td style={{ fontWeight: 600, color: '#24345C' }}>{o.dueDate}</td>
                      <td style={{ fontWeight: 800, color: o.remainingDays !== null && o.remainingDays < 0 ? '#dc2626' : o.remainingDays === 0 ? '#b45309' : '#334155' }}>
                        {remainingText}
                      </td>
                      <td style={{ fontWeight: 800, color: '#24345C' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                      <td>
                        {o.hasPendingFinanceConfirmation ? (
                          <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                            Payment Verification Pending
                          </span>
                        ) : (
                          <PaymentStatusBadge
                            orderStatus={o.isDelivered ? 'Delivered' : o.status}
                            deliveryDate={o.deliveryDate}
                            paymentTerms={o.paymentTerms}
                            totalAmount={o.totalAmount}
                            paidAmount={o.paidAmount}
                          />
                        )}
                      </td>
                      <td>
                        {o.podUrl ? (
                          <a
                            href={o.podUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="erp-btn erp-btn-sm erp-btn-secondary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
                          >
                            <Eye style={{ width: 13, height: 13 }} />
                            View POD
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: '#5E6B82', fontSize: '11.5px' }}>
                        {o.hasPendingFinanceConfirmation
                          ? 'Awaiting Finance approval'
                          : (o.paymentStatus === 'Overdue' ? 'Overdue Reminder Sent' : 'Due in ' + (o.remainingDays || 0) + ' Days')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedOrderForDrawer(o)}
                            className="erp-btn erp-btn-sm erp-btn-secondary"
                            title="View Order Details & Ledger"
                            type="button"
                          >
                            <Eye style={{ width: 14, height: 14 }} />
                          </button>
                          
                          <button
                            onClick={() => setReminderModal({ order: o })}
                            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Add Reminder"
                          >
                            <Bell style={{ width: 14, height: 14 }} />
                          </button>

                          {o.hasPendingFinanceConfirmation ? (
                            <span style={{ color: '#92400e', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                              Sent to Finance
                            </span>
                          ) : o.pendingAmount > 0 && o.isDelivered && (
                            <button
                              onClick={() => {
                                setPaymentModalOrder(o);
                                setPayAmount(String(o.pendingAmount));
                              }}
                              className="erp-btn erp-btn-sm erp-btn-success"
                              type="button"
                            >
                              {mode === 'finance' ? 'Verify / Record Payment' : 'Record Payment'}
                            </button>
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

      {/* Order Detail Drawer */}
      {selectedOrderForDrawer && (
        <OrderDetailDrawer
          order={selectedOrderForDrawer}
          onClose={() => setSelectedOrderForDrawer(null)}
        />
      )}

      {/* Record Payment Modal */}
      {paymentModalOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '420px', maxHeight: '92vh', background: '#ffffff', borderRadius: '16px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #DCE5F0' }}>
            <div style={{ padding: '16px 20px', background: '#24345C', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Record Payment</h3>
                <span style={{ fontSize: '11px', color: '#8893A7' }}>Order: {paymentModalOrder.orderNo || paymentModalOrder.id}</span>
              </div>
              <button onClick={() => {
                setPaymentModalOrder(null);
                setPayProof(null);
              }} style={{ background: 'none', border: 'none', color: '#8893A7', cursor: 'pointer' }} type="button">
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#F5FAFE', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#5E6B82' }}>Total Amount:</span>
                  <strong style={{ color: '#24345C' }}>₹{paymentModalOrder.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#5E6B82' }}>Already Paid:</span>
                  <strong style={{ color: '#047857' }}>₹{paymentModalOrder.paidAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #DCE5F0', paddingTop: '4px', marginTop: '2px' }}>
                  <strong style={{ color: '#334155' }}>Remaining Pending:</strong>
                  <strong style={{ color: '#b45309' }}>₹{paymentModalOrder.pendingAmount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  max={paymentModalOrder.pendingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="erp-search-input"
                  style={{ paddingLeft: '12px', fontWeight: 800, fontSize: '15px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="erp-search-input"
                  style={{ paddingLeft: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Payment Proof Image <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: `1.5px dashed ${payProof ? '#16a34a' : '#94a3b8'}`, borderRadius: '10px', background: payProof ? '#f0fdf4' : '#f8fafc', cursor: 'pointer' }}>
                  <Download style={{ width: 18, height: 18, color: payProof ? '#15803d' : '#475569' }} />
                  <span style={{ minWidth: 0, color: payProof ? '#15803d' : '#475569', fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {payProof ? payProof.name : 'Upload receipt or transaction screenshot'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    onChange={(event) => setPayProof(event.target.files?.[0] || null)}
                    style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                  />
                </label>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '10.5px' }}>JPG, PNG or WebP image.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalOrder(null);
                    setPayProof(null);
                  }}
                  className="erp-btn erp-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-btn erp-btn-success"
                >
                  Submit Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      <ReminderModal
        key={reminderModal?.order?.id || 'new'}
        open={!!reminderModal}
        onClose={() => setReminderModal(null)}
        onSave={handleSaveReminder}
        customerName={reminderModal?.order?.customerName || reminderModal?.order?.customer || ''}
        title="Payment Reminder"
      />
    </div>
  );
}
