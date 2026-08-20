'use client';

import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import { useAuthStore } from '../../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/backendFetch';

export default function OutstandingView() {
  const state = useERPStore((s) => s.state);
  const financeActions = useERPStore((s) => (s).finance);
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activePreset, setActivePreset] = useState('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minOutstanding, setMinOutstanding] = useState('');
  const [maxOutstanding, setMaxOutstanding] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [collectionStatus, setCollectionStatus] = useState('All');
  const [reminderStatus, setReminderStatus] = useState('All');
  const [salesmanFilter, setSalesmanFilter] = useState('All Salesmen');
  const [sortBy, setSortBy] = useState('Outstanding: High to Low');

  const localOrders = state.sales?.orders || [];
  const localCustomerPayments = state.finance?.customerPayments || [];
  const followUps = state.finance?.paymentFollowUps || [];
  const {
    data: backendOrders = [],
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
    isFetching: ordersFetching,
  } = useQuery({
    queryKey: ['finance-outstanding-delivered-orders'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments/delivered-orders');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });
  const {
    data: backendPayments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
    isFetching: paymentsFetching,
  } = useQuery({
    queryKey: ['finance-outstanding-payments'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });

  React.useEffect(() => {
    const handleStorage = () => {
      setRefreshCounter((prev) => prev + 1);
      refetchOrders();
      refetchPayments();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [refetchOrders, refetchPayments]);

  const orders = useMemo(() => {
    const combined = [...backendOrders, ...localOrders];
    return combined.filter((order, index, list) => {
      const id = String(order.id || order.orderId || order.orderNo || '');
      return id && list.findIndex((candidate) =>
        String(candidate.id || candidate.orderId || candidate.orderNo || '') === id
      ) === index;
    });
  }, [backendOrders, localOrders]);

  // Map outstanding list from orders and payments
  const outstandingList = useMemo(() => {
    return orders.map((o) => {
      const totalAmount = Number(o.grandTotal ?? o.totalAmount ?? 0);
      
      // 1. Backend verified payments
      const backendPaidAmount = backendPayments
        .filter((payment) =>
          String(payment.salesOrderId || payment.salesOrder?.id || '') === String(o.id) &&
          ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(payment.status || '').toUpperCase())
        )
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      // 2. Local state verified payments
      const localPaidAmount = localCustomerPayments
        .filter((payment) =>
          String(payment.orderId || '') === String(o.id) &&
          payment.verificationStatus === 'FINANCE_VERIFIED'
        )
        .reduce((sum, payment) => sum + Number(payment.paymentAmount || 0), 0);

      // 3. LocalStorage confirmations verified payments
      let storagePaidAmount = 0;
      try {
        const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
        if (raw) {
          const list = JSON.parse(raw);
          storagePaidAmount = list
            .filter((c) => {
              const orderIdKey = String(c.orderId || c.orderNo || '').replace(/^ORD-/, '').trim().toLowerCase();
              const oIdKey = String(o.id || o.orderNo || '').replace(/^ORD-/, '').trim().toLowerCase();
              return orderIdKey === oIdKey && c.status === 'FINANCE_VERIFIED';
            })
            .reduce((sum, c) => sum + Number(c.amount || 0), 0);
        }
      } catch (e) {}

      // 4. Order object's own pre-calculated paid field
      const orderSelfPaid = Number(o.verifiedPaidAmount || 0);

      // Take maximum to avoid double counting across local sync targets
      const paidAmount = Math.max(backendPaidAmount, localPaidAmount, storagePaidAmount, orderSelfPaid);
      const outstanding = Math.max(totalAmount - paidAmount, 0);

      // Days Overdue
      const deliveredDate = o.deliveredAt ? new Date(o.deliveredAt) : null;
      const defaultDueDate = deliveredDate && !Number.isNaN(deliveredDate.getTime())
        ? new Date(deliveredDate.getTime() + (15 * 24 * 60 * 60 * 1000)).toISOString()
        : new Date().toISOString();
      const dueDate = o.paymentDueDate || o.dueDate || o.requiredDeliveryDate || o.expectedDeliveryDate || defaultDueDate;
      const diffTime = Date.now() - new Date(dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      return {
        invoiceId: o.id,
        invoiceNumber: o.invoiceNo || `INV-${o.orderNo || o.orderId || o.id}`,
        orderNumber: o.orderNo || o.orderId || o.id,
        customerName: o.customerName || o.customer?.companyName || 'Unknown customer',
        customerId: o.customerId || o.customer?.id || 'CUST-UNKNOWN',
        totalAmount,
        paidAmount,
        outstanding,
        dueDate,
        daysOverdue,
        salesPerson: o.salesperson || 'N/A',
        salesPersonId: o.salespersonId || '',
        status: o.paymentStatus || 'PAYMENT_DUE',
        orderStatus: o.dispatchStatus || (o.deliveredAt ? 'DELIVERED' : 'OPEN'),
        reminderSent: followUps.some((f) => f.orderId === o.id)
      };
    }).filter((item) => item.outstanding > 0);
  }, [orders, backendPayments, localCustomerPayments, followUps, refreshCounter]);

  const salesmen = useMemo(() => Array.from(new Set(
    outstandingList.map((item) => item.salesPerson).filter((name) => name && name !== 'N/A')
  )).sort((left, right) => left.localeCompare(right)), [outstandingList]);

  // Compute aging buckets
  const agingStats = useMemo(() => {
    return outstandingList.reduce((acc, item) => {
      const bal = item.outstanding;
      if (item.daysOverdue <= 0) acc.current += bal;
      else if (item.daysOverdue <= 30) acc.bracket1_30 += bal;
      else if (item.daysOverdue <= 60) acc.bracket31_60 += bal;
      else if (item.daysOverdue <= 90) acc.bracket61_90 += bal;
      else acc.bracket90_plus += bal;
      return acc;
    }, { current: 0, bracket1_30: 0, bracket31_60: 0, bracket61_90: 0, bracket90_plus: 0 });
  }, [outstandingList]);

  const handleSelfReminder = (item) => {
    const today = new Date().toISOString().split('T')[0];
    Swal.fire({
      title: 'Schedule Self Reminder',
      html: `
        <div style="text-align: left; font-family: 'Outfit', sans-serif; font-size: 13.5px; display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Reminder Follow-up Date</label>
            <input type="date" id="reminder-date" value="${today}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Task Description / Notes</label>
            <textarea id="reminder-notes" placeholder="e.g. Call client accounts manager to verify NEFT settlement" style="width: 100%; height: 80px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px; resize: none;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Schedule Reminder',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const date = (document.getElementById('reminder-date') ).value;
        const notes = (document.getElementById('reminder-notes') ).value;
        if (!date) {
          Swal.showValidationMessage('Reminder date is required.');
          return false;
        }
        return { date, notes };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const actor = {
            id: user?.id || 'System',
            name: user?.name || 'Finance Executive User',
            role: user?.role || 'Finance Executive'
          };
        financeActions.addPaymentFollowUp({
          customerId: item.customerId,
          orderId: item.invoiceId,
          invoiceNumber: item.invoiceNumber,
          customerName: item.customerName,
          outstandingAmount: item.outstanding,
          contactPerson: 'Accounts Desk',
            phoneNumber: '9876543210',
            followUpDate: today,
            contactMode: 'Phone',
            discussionSummary: `Scheduled task: ${result.value.notes}`,
            customerResponse: 'Needs More Time',
            nextFollowUpDate: result.value.date,
            remarks: result.value.notes
          }, actor);

          Swal.fire({
            icon: 'success',
            title: 'Reminder Logged',
            text: 'Self reminder scheduled and saved to customer follow-ups.',
            timer: 1850,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire('Error', err?.message || String(err), 'error');
        }
      }
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredList = useMemo(() => {
    const filtered = outstandingList.filter((o) => {
      const matchesSearch = 
        o.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(o.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.salesPerson?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (minOutstanding !== '' && o.outstanding < Number(minOutstanding)) return false;
      if (maxOutstanding !== '' && o.outstanding > Number(maxOutstanding)) return false;
      const dueDateValue = String(o.dueDate || '').slice(0, 10);
      if (dueFrom && dueDateValue < dueFrom) return false;
      if (dueTo && dueDateValue > dueTo) return false;
      if (collectionStatus === 'Unpaid' && o.paidAmount > 0) return false;
      if (collectionStatus === 'Partially Paid' && !(o.paidAmount > 0 && o.outstanding > 0)) return false;
      if (reminderStatus === 'Scheduled' && !o.reminderSent) return false;
      if (reminderStatus === 'Not Scheduled' && o.reminderSent) return false;
      if (salesmanFilter !== 'All Salesmen' && o.salesPerson !== salesmanFilter) return false;

      switch (activePreset) {
        case 'Reminders':
          return o.reminderSent;
        case 'Not Due':
          return o.daysOverdue === 0;
        case '1-30 Days':
          return o.daysOverdue >= 1 && o.daysOverdue <= 30;
        case '31-60 Days':
          return o.daysOverdue >= 31 && o.daysOverdue <= 60;
        case '61-90 Days':
          return o.daysOverdue > 60 && o.daysOverdue <= 90;
        case '90+ Days Overdue':
          return o.daysOverdue > 90;
        default:
          return true;
      }
    });

    return filtered.sort((left, right) => {
      switch (sortBy) {
        case 'Outstanding: Low to High':
          return left.outstanding - right.outstanding;
        case 'Most Overdue':
          return right.daysOverdue - left.daysOverdue;
        case 'Due Date: Earliest':
          return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
        case 'Customer: A to Z':
          return left.customerName.localeCompare(right.customerName);
        default:
          return right.outstanding - left.outstanding;
      }
    });
  }, [
    outstandingList,
    searchQuery,
    activePreset,
    minOutstanding,
    maxOutstanding,
    dueFrom,
    dueTo,
    collectionStatus,
    reminderStatus,
    salesmanFilter,
    sortBy,
  ]);

  const advancedFilterCount = [
    minOutstanding,
    maxOutstanding,
    dueFrom,
    dueTo,
    collectionStatus !== 'All',
    reminderStatus !== 'All',
    salesmanFilter !== 'All Salesmen',
    sortBy !== 'Outstanding: High to Low',
  ].filter(Boolean).length;

  const resetAdvancedFilters = () => {
    setMinOutstanding('');
    setMaxOutstanding('');
    setDueFrom('');
    setDueTo('');
    setCollectionStatus('All');
    setReminderStatus('All');
    setSalesmanFilter('All Salesmen');
    setSortBy('Outstanding: High to Low');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Outstanding Collections</h1>
        <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
          Monitor aging balances, send client payment reminders, and record collections commitments.
        </p>
      </div>

      {/* Aging Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Current Due</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#1E293B' }}>{formatCurrency(agingStats.current)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>1-30 Days</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#10b981' }}>{formatCurrency(agingStats.bracket1_30)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase' }}>31-60 Days</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>{formatCurrency(agingStats.bracket31_60)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f97316', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '700', textTransform: 'uppercase' }}>61-90 Days</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#f97316' }}>{formatCurrency(agingStats.bracket61_90)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase' }}>90+ Days Overdue</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(agingStats.bracket90_plus)}</h3>
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(ordersError || paymentsError) && (
          <div style={{ padding: '12px 14px', borderRadius: '8px', background: '#FEF2F2', color: '#B91C1C' }}>
            {ordersError?.message || paymentsError?.message || 'Unable to load outstanding payments.'}
          </div>
        )}
        
        {/* Filters bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Not Due', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days Overdue', 'Reminders'].map((preset) => (
              <button
                key={preset}
                onClick={() => setActivePreset(preset)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: activePreset === preset ? '#0ea5e9' : '#F1F5F9',
                  color: activePreset === preset ? 'white' : '#475569',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search outstanding..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className="btn-small btn-outline-small"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: showAdvancedFilters ? '#EFF6FF' : undefined,
                color: showAdvancedFilters ? '#1D4ED8' : undefined,
              }}
            >
              <SlidersHorizontal size={13} />
              Advanced Filters
              {advancedFilterCount > 0 && (
                <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: '#2563EB', color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: 10 }}>
                  {advancedFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { refetchOrders(); refetchPayments(); }}
              disabled={ordersFetching || paymentsFetching}
              className="btn-small btn-outline-small"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div style={{ padding: 16, borderRadius: 10, border: '1px solid #BFDBFE', background: '#F8FBFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <strong style={{ color: '#1E3A8A', fontSize: 13 }}>Advanced Filters</strong>
              <button onClick={() => setShowAdvancedFilters(false)} aria-label="Close advanced filters" style={{ border: 0, background: 'transparent', color: '#64748B', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Minimum Outstanding
                <input type="number" min="0" value={minOutstanding} onChange={(event) => setMinOutstanding(event.target.value)} placeholder="₹ 0" style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7 }} />
              </label>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Maximum Outstanding
                <input type="number" min="0" value={maxOutstanding} onChange={(event) => setMaxOutstanding(event.target.value)} placeholder="No maximum" style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7 }} />
              </label>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Due Date From
                <input type="date" value={dueFrom} onChange={(event) => setDueFrom(event.target.value)} style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7 }} />
              </label>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Due Date To
                <input type="date" value={dueTo} onChange={(event) => setDueTo(event.target.value)} style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7 }} />
              </label>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Collection Status
                <select value={collectionStatus} onChange={(event) => setCollectionStatus(event.target.value)} style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7, background: '#fff' }}>
                  <option>All</option>
                  <option>Unpaid</option>
                  <option>Partially Paid</option>
                </select>
              </label>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Self Reminder
                <select value={reminderStatus} onChange={(event) => setReminderStatus(event.target.value)} style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7, background: '#fff' }}>
                  <option>All</option>
                  <option>Scheduled</option>
                  <option>Not Scheduled</option>
                </select>
              </label>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Salesman
                <select value={salesmanFilter} onChange={(event) => setSalesmanFilter(event.target.value)} style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7, background: '#fff' }}>
                  <option>All Salesmen</option>
                  {salesmen.map((salesman) => <option key={salesman} value={salesman}>{salesman}</option>)}
                </select>
              </label>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                Sort Results
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ width: '100%', marginTop: 5, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 7, background: '#fff' }}>
                  <option>Outstanding: High to Low</option>
                  <option>Outstanding: Low to High</option>
                  <option>Most Overdue</option>
                  <option>Due Date: Earliest</option>
                  <option>Customer: A to Z</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              <span style={{ color: '#64748B', fontSize: 12 }}>{filteredList.length} of {outstandingList.length} outstanding accounts shown</span>
              <button onClick={resetAdvancedFilters} className="btn-small btn-outline-small">Reset Advanced Filters</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px' }}>Customer Name</th>
                <th style={{ padding: '12px 16px' }}>Invoice No</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Outstanding</th>
                <th style={{ padding: '12px 16px' }}>Due Date</th>
                <th style={{ padding: '12px 16px' }}>Days Overdue</th>
                <th style={{ padding: '12px 16px' }}>Sales Executive</th>
                <th style={{ padding: '12px 16px' }}>Delivery Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13.5px' }}>
              {(ordersLoading || paymentsLoading) ? (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                    Loading outstanding payments...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    No outstanding accounts found matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.invoiceId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{item.customerName}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{item.invoiceNumber}</td>
                    <td style={{ padding: '12px 16px' }}>₹{item.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#EF4444' }}>₹{item.outstanding.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>{item.dueDate?.split('T')[0]}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: item.daysOverdue > 90 ? '#FFE4E6' : (item.daysOverdue > 30 ? '#FFEDD5' : '#D1FAE5'),
                        color: item.daysOverdue > 90 ? '#9E2121' : (item.daysOverdue > 30 ? '#C2410C' : '#065F46')
                      }}>
                        {item.daysOverdue > 0 ? `${item.daysOverdue} Days` : 'Not Due'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{item.salesPerson}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: item.orderStatus === 'DELIVERED' ? '#D1FAE5' : '#F1F5F9',
                        color: item.orderStatus === 'DELIVERED' ? '#065F46' : '#475569'
                      }}>
                        {item.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          onClick={() => handleSelfReminder(item)}
                          style={{
                            padding: '6px 10px',
                            background: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Schedule Self
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
