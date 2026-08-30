'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  X,
  CreditCard,
  Calendar,
  Phone,
  Download,
  Eye,
  ArrowUpRight,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Building2,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import { useAuthStore } from '../../../store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/backendFetch';

const formatINR = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export default function OutstandingView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const state = useERPStore((s) => s.state);
  const financeActions = useERPStore((s) => s.finance);
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
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

  // Follow-up modal state
  const [followUpModal, setFollowUpModal] = useState(null);

  // 1. Fetch delivered orders & active sales orders with balances
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

  // 2. Fetch payments
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

  // 3. Fetch sales orders list for broader matching
  const {
    data: rawSalesOrders = [],
    refetch: refetchSalesOrders,
  } = useQuery({
    queryKey: ['finance-outstanding-sales-orders'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/sales/orders');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });

  const localOrders = state.sales?.orders || [];
  const localCustomerPayments = state.finance?.customerPayments || [];
  const followUps = state.finance?.paymentFollowUps || [];

  // Merge orders safely
  const orders = useMemo(() => {
    const combined = [...backendOrders, ...rawSalesOrders, ...localOrders];
    return combined.filter((order, index, list) => {
      const id = String(order.id || order.orderId || order.orderNo || order.orderNumber || '');
      return id && list.findIndex((candidate) =>
        String(candidate.id || candidate.orderId || candidate.orderNo || candidate.orderNumber || '') === id
      ) === index;
    });
  }, [backendOrders, rawSalesOrders, localOrders]);

  // Compute live outstanding records
  const outstandingList = useMemo(() => {
    return orders.map((o) => {
      const totalAmount = Number(o.grandTotal ?? o.grand_total ?? o.totalAmount ?? o.total_amount ?? o.totalValue ?? 0);
      const targetOrderId = String(o.id || o.orderNo || o.orderNumber || '');

      // 1. Backend verified payments
      const backendPaidAmount = backendPayments
        .filter((payment) => {
          const matchId = String(payment.salesOrderId || payment.salesOrder?.id || payment.orderNumber || payment.orderId || '');
          const isVerified = ['VERIFIED', 'FINANCE_VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(payment.status || '').toUpperCase());
          return isVerified && (matchId === String(o.id) || matchId === String(o.orderNo || o.orderNumber));
        })
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      // 2. Local state verified payments
      const localPaidAmount = localCustomerPayments
        .filter((payment) =>
          (String(payment.orderId || payment.salesOrderId || '') === targetOrderId) &&
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
              const orderIdKey = String(c.orderId || c.orderNo || c.orderNumber || '').replace(/^ORD-/, '').trim().toLowerCase();
              const oIdKey = String(o.id || o.orderNo || o.orderNumber || '').replace(/^ORD-/, '').trim().toLowerCase();
              return (orderIdKey === oIdKey || oIdKey.includes(orderIdKey)) && (c.status === 'FINANCE_VERIFIED' || c.status === 'VERIFIED');
            })
            .reduce((sum, c) => sum + Number(c.amount || 0), 0);
        }
      } catch (e) {}

      // 4. Order object's own pre-calculated paid field
      const orderSelfPaid = Number(o.verifiedPaidAmount ?? o.verified_paid_amount ?? o.paidAmount ?? 0);

      const paidAmount = Math.max(backendPaidAmount, localPaidAmount, storagePaidAmount, orderSelfPaid);
      const outstanding = Math.max(totalAmount - paidAmount, 0);

      // Days Overdue calculation
      const deliveredDate = o.deliveredAt ? new Date(o.deliveredAt) : null;
      const paymentTermDays = Number(o.paymentTermsDays || o.paymentTermDays || 15);
      const baseDate = deliveredDate && !isNaN(deliveredDate.getTime()) ? deliveredDate : new Date(o.createdAt || Date.now());
      const defaultDueDate = new Date(baseDate.getTime() + (paymentTermDays * 24 * 60 * 60 * 1000)).toISOString();
      const dueDate = o.paymentDueDate || o.dueDate || o.expectedDeliveryDate || defaultDueDate;
      const diffTime = Date.now() - new Date(dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      const orderRef = o.orderNumber || o.orderNo || o.order_number || o.id || '—';
      const custName = o.customerName || o.customer_name || o.customer?.companyName || o.customer?.name || (typeof o.customer === 'string' ? o.customer : '') || 'Customer';
      const spName = o.salesperson || o.salespersonName || o.salesExecutive?.name || 'Unassigned';

      return {
        invoiceId: o.id,
        invoiceNumber: o.invoiceNo || o.invoiceNumber || `INV-${orderRef}`,
        orderNumber: orderRef,
        customerName: custName,
        customerId: o.customerId || o.customer?.id || 'CUST-UNKNOWN',
        customerPhone: o.customer?.phone || o.customer?.mobile || '',
        customerEmail: o.customer?.email || '',
        totalAmount,
        paidAmount,
        outstanding,
        paymentTerms: o.paymentTerms || `${paymentTermDays} Days`,
        dueDate,
        daysOverdue,
        salesPerson: spName,
        salesPersonId: o.salespersonId || o.createdById || '',
        status: o.paymentStatus || (outstanding === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIALLY_PAID' : 'PAYMENT_DUE')),
        orderStatus: o.dispatchStatus || (o.deliveredAt ? 'DELIVERED' : (o.status || 'CONFIRMED')),
        reminderSent: followUps.some((f) => String(f.orderId || f.orderNumber) === String(o.id) || String(f.orderId || f.orderNumber) === String(orderRef))
      };
    }).filter((item) => item.outstanding > 0);
  }, [orders, backendPayments, localCustomerPayments, followUps]);

  const salesmen = useMemo(() => Array.from(new Set(
    outstandingList.map((item) => item.salesPerson).filter((name) => name && name !== 'Unassigned' && name !== 'N/A')
  )).sort((left, right) => left.localeCompare(right)), [outstandingList]);

  // Compute Aging KPIs
  const agingStats = useMemo(() => {
    return outstandingList.reduce((acc, item) => {
      const bal = item.outstanding;
      acc.total += bal;
      if (item.daysOverdue <= 0) acc.current += bal;
      else if (item.daysOverdue <= 30) acc.bracket1_30 += bal;
      else if (item.daysOverdue <= 60) acc.bracket31_60 += bal;
      else if (item.daysOverdue <= 90) acc.bracket61_90 += bal;
      else acc.bracket90_plus += bal;
      return acc;
    }, { total: 0, current: 0, bracket1_30: 0, bracket31_60: 0, bracket61_90: 0, bracket90_plus: 0 });
  }, [outstandingList]);

  // Filtered and Sorted list
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

  const handleRefreshAll = () => {
    refetchOrders();
    refetchPayments();
    refetchSalesOrders();
    queryClient.invalidateQueries({ queryKey: ['finance-outstanding-delivered-orders'] });
    queryClient.invalidateQueries({ queryKey: ['finance-outstanding-payments'] });
  };

  const handleScheduleReminder = (item) => {
    const today = new Date().toISOString().split('T')[0];
    Swal.fire({
      title: 'Schedule Payment Reminder',
      html: `
        <div style="text-align: left; font-size: 13px; display: flex; flex-direction: column; gap: 12px; margin-top: 10px; color: #334155;">
          <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div style="font-weight: bold; color: #0F172A;">${item.customerName}</div>
            <div style="font-size: 12px; color: #64748B;">Order ${item.orderNumber} • Outstanding: <b style="color: #DC2626;">${formatINR(item.outstanding)}</b></div>
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Next Follow-up / Reminder Date</label>
            <input type="date" id="reminder-date" value="${today}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Follow-up Notes / Discussion</label>
            <textarea id="reminder-notes" placeholder="e.g. Spoke to accounts manager, promised RTGS payment this Friday" style="width: 100%; height: 80px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px; resize: none;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Follow-up',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const date = (document.getElementById('reminder-date')).value;
        const notes = (document.getElementById('reminder-notes')).value;
        if (!date) {
          Swal.showValidationMessage('Please select a reminder date.');
          return false;
        }
        return { date, notes };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const actor = {
            id: user?.id || 'finance-user',
            name: user?.name || 'Finance Executive',
            role: user?.role || 'Finance'
          };
          if (financeActions && typeof financeActions.addPaymentFollowUp === 'function') {
            financeActions.addPaymentFollowUp({
              customerId: item.customerId,
              orderId: item.invoiceId,
              orderNumber: item.orderNumber,
              invoiceNumber: item.invoiceNumber,
              customerName: item.customerName,
              outstandingAmount: item.outstanding,
              contactPerson: 'Accounts Dept',
              phoneNumber: item.customerPhone || 'N/A',
              followUpDate: today,
              contactMode: 'Phone',
              discussionSummary: result.value.notes || 'Follow-up scheduled',
              customerResponse: 'Promised Payment',
              nextFollowUpDate: result.value.date,
              remarks: result.value.notes
            }, actor);
          }

          Swal.fire({
            icon: 'success',
            title: 'Follow-up Scheduled',
            text: 'Reminder recorded successfully.',
            timer: 1600,
            showConfirmButton: false
          });
          handleRefreshAll();
        } catch (err) {
          Swal.fire('Error', err?.message || String(err), 'error');
        }
      }
    });
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      Swal.fire('No Data', 'No records to export.', 'info');
      return;
    }
    const headers = ['Customer Name', 'Order Number', 'Invoice Number', 'Total Amount', 'Paid Amount', 'Outstanding Amount', 'Payment Terms', 'Due Date', 'Days Overdue', 'Sales Executive', 'Delivery Status'];
    const csvRows = [
      headers.join(','),
      ...filteredList.map((r) => [
        `"${r.customerName.replace(/"/g, '""')}"`,
        `"${r.orderNumber}"`,
        `"${r.invoiceNumber}"`,
        r.totalAmount,
        r.paidAmount,
        r.outstanding,
        `"${r.paymentTerms}"`,
        `"${r.dueDate?.split('T')[0] || ''}"`,
        r.daysOverdue,
        `"${r.salesPerson.replace(/"/g, '""')}"`,
        `"${r.orderStatus}"`
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `outstanding_receivables_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="w-full pb-12" style={{ fontFamily: "var(--font-main), 'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header Title & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign className="text-blue-600" size={24} />
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Outstanding Collections & Receivables
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Live monitoring of customer balances, aging brackets, collection follow-ups, and payment records
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={handleRefreshAll}
              disabled={ordersFetching || paymentsFetching}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
              }}
            >
              <RefreshCw size={14} className={ordersFetching || paymentsFetching ? 'animate-spin' : ''} />
              Refresh Dues
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          {/* Total Outstanding */}
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Outstanding</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{formatINR(agingStats.total)}</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>{outstandingList.length} total pending accounts</span>
          </div>

          {/* Not Due / Current */}
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Not Due (Within Term)</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#10b981' }}>{formatINR(agingStats.current)}</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Upcoming due dates</span>
          </div>

          {/* 1-30 Days */}
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1-30 Days Overdue</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#d97706' }}>{formatINR(agingStats.bracket1_30)}</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Early stage overdue</span>
          </div>

          {/* 31-60 Days */}
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f97316' }}>
            <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>31-60 Days Overdue</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#ea580c' }}>{formatINR(agingStats.bracket31_60)}</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Requires follow-up</span>
          </div>

          {/* 61-90 Days */}
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: '4px solid #e11d48' }}>
            <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>61-90 Days Overdue</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#e11d48' }}>{formatINR(agingStats.bracket61_90)}</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>High priority follow-up</span>
          </div>

          {/* 90+ Days */}
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626' }}>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>90+ Days Critical</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#dc2626' }}>{formatINR(agingStats.bracket90_plus)}</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Critical recovery action</span>
          </div>

        </div>

        {/* Main Table Container */}
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Error Banner if any */}
          {(ordersError || paymentsError) && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{ordersError?.message || paymentsError?.message || 'Unable to sync live outstanding data.'}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            
            {/* Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Not Due', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days Overdue', 'Reminders'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setActivePreset(preset)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: activePreset === preset ? '#2563eb' : '#f1f5f9',
                    color: activePreset === preset ? '#ffffff' : '#475569',
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

            {/* Search and Advanced Filter Trigger */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '15px', height: '15px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search customer, order, invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <button
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: showAdvancedFilters ? '#eff6ff' : '#ffffff',
                  color: showAdvancedFilters ? '#1d4ed8' : '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <SlidersHorizontal size={14} />
                Filters
                {advancedFilterCount > 0 && (
                  <span style={{ minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '9px', background: '#2563eb', color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: '10px' }}>
                    {advancedFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Expandable Drawer */}
          {showAdvancedFilters && (
            <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#f8fbff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ color: '#1e3a8a', fontSize: '13px' }}>Advanced Filter Controls</strong>
                <button onClick={() => setShowAdvancedFilters(false)} aria-label="Close filters" style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  Minimum Amount
                  <input type="number" min="0" value={minOutstanding} onChange={(e) => setMinOutstanding(e.target.value)} placeholder="₹ 0" style={{ width: '100%', marginTop: '4px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  Maximum Amount
                  <input type="number" min="0" value={maxOutstanding} onChange={(e) => setMaxOutstanding(e.target.value)} placeholder="No maximum" style={{ width: '100%', marginTop: '4px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  Due Date From
                  <input type="date" value={dueFrom} onChange={(e) => setDueFrom(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  Due Date To
                  <input type="date" value={dueTo} onChange={(e) => setDueTo(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  Payment Status
                  <select value={collectionStatus} onChange={(e) => setCollectionStatus(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', fontSize: '13px' }}>
                    <option>All</option>
                    <option>Unpaid</option>
                    <option>Partially Paid</option>
                  </select>
                </label>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  Sales Executive
                  <select value={salesmanFilter} onChange={(e) => setSalesmanFilter(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', fontSize: '13px' }}>
                    <option>All Salesmen</option>
                    {salesmen.map((salesman) => <option key={salesman} value={salesman}>{salesman}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  Sort Order
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', fontSize: '13px' }}>
                    <option>Outstanding: High to Low</option>
                    <option>Outstanding: Low to High</option>
                    <option>Most Overdue</option>
                    <option>Due Date: Earliest</option>
                    <option>Customer: A to Z</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Showing {filteredList.length} of {outstandingList.length} accounts</span>
                <button onClick={resetAdvancedFilters} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Outstanding Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px' }}>Customer & Order</th>
                  <th style={{ padding: '12px 16px' }}>Invoice No</th>
                  <th style={{ padding: '12px 16px' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px' }}>Paid Amount</th>
                  <th style={{ padding: '12px 16px' }}>Outstanding Dues</th>
                  <th style={{ padding: '12px 16px' }}>Terms & Due Date</th>
                  <th style={{ padding: '12px 16px' }}>Aging Overdue</th>
                  <th style={{ padding: '12px 16px' }}>Sales Executive</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13px', color: '#1e293b' }}>
                {(ordersLoading || paymentsLoading) ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span style={{ fontWeight: '700' }}>Loading live receivables and outstanding records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={32} className="text-emerald-500" />
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>No outstanding dues found matching criteria</span>
                        <span style={{ fontSize: '12px' }}>All matched accounts have been settled or no entries exist.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const isCriticallyOverdue = item.daysOverdue > 90;
                    const isLate = item.daysOverdue > 30;
                    return (
                      <tr key={item.invoiceId} style={{ borderBottom: '1px solid #f1f5f9', background: isCriticallyOverdue ? '#fffdfd' : '#ffffff' }}>
                        
                        {/* Customer & Order Reference */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px' }}>{item.customerName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0284c7', fontWeight: '700' }}>
                              {item.orderNumber}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '700',
                              background: item.orderStatus === 'DELIVERED' ? '#dcfce7' : '#f1f5f9',
                              color: item.orderStatus === 'DELIVERED' ? '#15803d' : '#475569'
                            }}>
                              {item.orderStatus}
                            </span>
                          </div>
                        </td>

                        {/* Invoice Number */}
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#475569', fontSize: '12.5px' }}>
                          {item.invoiceNumber}
                        </td>

                        {/* Total Amount */}
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                          {formatINR(item.totalAmount)}
                        </td>

                        {/* Verified Paid Amount */}
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#16a34a' }}>
                          {formatINR(item.paidAmount)}
                        </td>

                        {/* Outstanding Amount */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '900', fontSize: '14.5px', color: '#dc2626' }}>
                            {formatINR(item.outstanding)}
                          </div>
                          {item.paidAmount > 0 && (
                            <span style={{ fontSize: '10.5px', color: '#d97706', fontWeight: '700' }}>
                              Partially Settled
                            </span>
                          )}
                        </td>

                        {/* Terms & Due Date */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                            {item.dueDate?.split('T')[0] || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.paymentTerms}
                          </div>
                        </td>

                        {/* Days Overdue */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: item.daysOverdue > 90 ? '#fee2e2' : (item.daysOverdue > 30 ? '#ffedd5' : (item.daysOverdue > 0 ? '#fef3c7' : '#dcfce7')),
                            color: item.daysOverdue > 90 ? '#991b1b' : (item.daysOverdue > 30 ? '#c2410c' : (item.daysOverdue > 0 ? '#b45309' : '#15803d'))
                          }}>
                            {item.daysOverdue > 0 ? `${item.daysOverdue} Days Overdue` : 'Not Due'}
                          </span>
                        </td>

                        {/* Sales Executive */}
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '12px' }}>
                          {item.salesPerson}
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
                            
                            {/* Schedule / Add Follow-up */}
                            <button
                              onClick={() => handleScheduleReminder(item)}
                              title="Schedule Reminder / Add Follow-up"
                              style={{
                                padding: '6px 10px',
                                background: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Calendar size={13} />
                              Follow-up
                            </button>

                            {/* Record Customer Payment */}
                            <button
                              onClick={() => router.push(`/sales/create-payment?orderId=${encodeURIComponent(item.orderNumber)}`)}
                              title="Log / Confirm Payment Collection"
                              style={{
                                padding: '6px 12px',
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                              }}
                            >
                              <CreditCard size={13} />
                              Pay
                            </button>

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

      </div>
    </div>
  );
}
