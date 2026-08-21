'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, CheckCircle2, XCircle, Eye, FileText, Download, DollarSign, Clock, AlertTriangle,
  TrendingDown, ShieldCheck, AlertCircle, Calendar, ArrowUpRight, Filter, RefreshCw, ChevronRight, User, Check
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import Swal from 'sweetalert2';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/backendFetch';

const formatINR = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

export default function FinanceSalesConfirmationView() {
  const queryClient = useQueryClient();
  const state = useERPStore((s) => s.state);
  const verifyFinancePayment = useERPStore((s) => s.verifyFinancePayment);
  const rejectFinancePayment = useERPStore((s) => s.rejectFinancePayment);
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentTermsFilter, setPaymentTermsFilter] = useState('All');
  const [dueStateFilter, setDueStateFilter] = useState('All');

  // Modals state
  const [verifyModal, setVerifyModal] = useState(null); // { payment, order }
  const [rejectModal, setRejectModal] = useState(null); // { payment, order }
  const [historyModal, setHistoryModal] = useState(null); // { orderId }

  // ── Fetch verification queue from backend ──────────────────────────────────
  const {
    data: queueData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['finance-verification-queue', activeTab, paymentTermsFilter, dueStateFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== 'All') params.append('tab', activeTab);
      if (paymentTermsFilter !== 'All') params.append('paymentTerms', paymentTermsFilter);
      if (dueStateFilter !== 'All') params.append('dueState', dueStateFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await backendFetch(`/api/backend/finance/payments/verification-queue?${params.toString()}`);
      const data = response?.data || response;
      return data || { summary: {}, rows: [] };
    },
  });

  // Fetch complete history when history modal is opened
  const { data: orderHistoryData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['finance-order-history', historyModal?.orderId],
    queryFn: async () => {
      if (!historyModal?.orderId) return null;
      const response = await backendFetch(`/api/backend/finance/payments/order/${historyModal.orderId}/history`);
      return response?.data || response;
    },
    enabled: Boolean(historyModal?.orderId),
  });

  const summary = queueData?.summary || {
    pendingVerificationCount: 0,
    dueSoonCount: 0,
    dueTodayCount: 0,
    overdueCount: 0,
    partiallyPaidCount: 0,
    totalOutstanding: 0,
    totalVerified: 0,
  };

  const rows = queueData?.rows || [];

  // ── Action: Handle Payment Verification ───────────────────────────────────
  const handleVerify = async (paymentId, orderRef) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Verify Payment?',
      text: `Confirm verification for payment ${verifyModal?.payment?.paymentNo || paymentId} on ${orderRef || 'this order'}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Verify Payment',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16A34A',
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      await backendFetch(`/api/backend/finance/payments/${paymentId}/verify`, {
        method: 'POST',
      });

      // Synchronize client cache & local state if available
      try {
        if (typeof verifyFinancePayment === 'function') {
          verifyFinancePayment(paymentId, 'Finance Team');
        }
      } catch {}

      setVerifyModal(null);
      await queryClient.invalidateQueries({ queryKey: ['finance-verification-queue'] });
      await queryClient.invalidateQueries({ queryKey: ['finance-order-history'] });
      await refetch();

      await Swal.fire({
        icon: 'success',
        title: 'Payment Verified ✓',
        text: 'The payment has been verified and order balances updated in real time.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: err?.message || 'Payment verification failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Action: Handle Payment Rejection ───────────────────────────────────────
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    const fd = new FormData(e.target);
    const rejectionReason = String(fd.get('rejectionReason') || '').trim();

    if (!rejectionReason) {
      Swal.fire({
        icon: 'warning',
        title: 'Reason Required',
        text: 'Please provide a clear reason for rejecting this payment.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await backendFetch(`/api/backend/finance/payments/${rejectModal.payment.id}/reject`, {
        method: 'POST',
        body: { rejectionReason },
      });

      try {
        if (typeof rejectFinancePayment === 'function') {
          rejectFinancePayment(rejectModal.payment.id, rejectionReason, 'Finance Team');
        }
      } catch {}

      setRejectModal(null);
      await queryClient.invalidateQueries({ queryKey: ['finance-verification-queue'] });
      await queryClient.invalidateQueries({ queryKey: ['finance-order-history'] });
      await refetch();

      await Swal.fire({
        icon: 'success',
        title: 'Payment Rejected',
        text: 'The payment has been rejected and the assigned salesperson has been notified.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err?.message || 'Payment rejection failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="finance-verification-page w-full" style={{ width: '100%', maxWidth: '100%', padding: '24px', boxSizing: 'border-box' }}>
      
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="finance-verification-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign className="w-8 h-8 text-blue-600 bg-blue-50 p-1.5 rounded-xl border border-blue-200" />
            Finance Payment Verification & Follow-Up Engine
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Authoritative source of truth for payment verification, credit terms tracking, overdue follow-up, and real-time ledger settlement.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            color: '#334155',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Live Data
        </button>
      </div>

      {/* ── Top Summary KPI Cards (Section 13) ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Pending Verification */}
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
            <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 600 }}>Pending Verification</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#92400E', marginTop: '2px' }}>
              {summary.pendingVerificationCount || 0}
            </div>
          </div>
        </div>

        {/* Due Soon */}
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
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Due Soon</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
              {summary.dueSoonCount || 0}
            </div>
          </div>
        </div>

        {/* Due Today */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FED7AA',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 600 }}>Due Today</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#9A3412', marginTop: '2px' }}>
              {summary.dueTodayCount || 0}
            </div>
          </div>
        </div>

        {/* Overdue */}
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
            <div style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 600 }}>Overdue Orders</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#991B1B', marginTop: '2px' }}>
              {summary.overdueCount || 0}
            </div>
          </div>
        </div>

        {/* Partially Paid */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #BFDBFE',
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
            <div style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 600 }}>Partially Paid</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E40AF', marginTop: '2px' }}>
              {summary.partiallyPaidCount || 0}
            </div>
          </div>
        </div>

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
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Outstanding</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {formatINR(summary.totalOutstanding)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Card ──────────────────────────────────────────────── */}
      <div className="payment-verification-table-card w-full" style={{ width: '100%', maxWidth: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        
        {/* Tabs (Section 11 & 12) */}
        <div className="finance-verification-tabs" style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All' },
            { id: 'Pending Verification', label: `Pending Verification (${summary.pendingVerificationCount || 0})` },
            { id: 'Due Soon', label: `Due Soon (${summary.dueSoonCount || 0})` },
            { id: 'Due Today', label: `Due Today (${summary.dueTodayCount || 0})` },
            { id: 'Overdue', label: `Overdue (${summary.overdueCount || 0})` },
            { id: 'Partially Paid', label: `Partially Paid (${summary.partiallyPaidCount || 0})` },
            { id: 'Verified', label: 'Verified' },
            { id: 'Rejected', label: 'Rejected' },
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
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar & Filters (Section 14 & 15) */}
        <div className="finance-verification-toolbar" style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px', maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order No, Customer, Salesperson, Ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Payment Terms Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Terms:</label>
              <select
                value={paymentTermsFilter}
                onChange={(e) => setPaymentTermsFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', background: '#FFFFFF', fontWeight: 600 }}
              >
                <option value="All">All Terms</option>
                <option value="7 Days">7 Days</option>
                <option value="15 Days">15 Days</option>
                <option value="20 Days">20 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="90 Days">90 Days</option>
                <option value="Custom">Custom</option>
                <option value="Advance">Advance</option>
              </select>
            </div>

            {/* Due State Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Due State:</label>
              <select
                value={dueStateFilter}
                onChange={(e) => setDueStateFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', background: '#FFFFFF', fontWeight: 600 }}
              >
                <option value="All">All Due States</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Due Today">Due Today</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Payment Table (Section 13 & 14) ────────────────────────────────── */}
        <div className="finance-verification-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="payment-verification-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 14px' }}>Order Number</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Salesperson</th>
                <th style={{ padding: '12px 14px' }}>Order Date</th>
                <th style={{ padding: '12px 14px' }}>Payment Terms</th>
                <th style={{ padding: '12px 14px' }}>Start Date</th>
                <th style={{ padding: '12px 14px' }}>Due Date</th>
                <th style={{ padding: '12px 14px' }}>Elapsed / Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Order Total</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Paid Amount</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Outstanding</th>
                <th style={{ padding: '12px 14px' }}>Payment Status</th>
                <th style={{ padding: '12px 14px' }}>Verification</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={14} style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Loading payment records...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '48px 24px', textAlign: 'center', color: '#94A3B8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '32px' }}>📭</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>No orders found matching the filter criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const hasPending = (r.pendingPayments || []).length > 0;
                  const firstPending = r.pendingPayments?.[0];
                  const remDays = r.daysRemaining;
                  const isAdv = String(r.paymentTerms || '').toLowerCase().includes('advance');

                  return (
                    <tr key={r.orderId + idx} style={{ borderBottom: '1px solid #F1F5F9', background: hasPending ? '#FFFBEB' : '#FFFFFF' }}>
                      {/* Order Number */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '12.5px', color: '#1E3A8A' }}>
                          {r.orderNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{r.customerName}</div>
                      </td>

                      {/* Salesperson */}
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{r.salespersonName || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Order Date */}
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                        {r.orderDate ? String(r.orderDate).split('T')[0] : '—'}
                      </td>

                      {/* Payment Terms */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: isAdv ? '#0284C7' : '#2563EB',
                          background: isAdv ? '#E0F2FE' : '#EFF6FF',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                        }}>
                          {r.paymentTerms || '15 Days'}
                        </span>
                      </td>

                      {/* Start Date */}
                      <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                        {r.paymentTermStartDate ? String(r.paymentTermStartDate).split('T')[0] : '—'}
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                        {r.paymentDueDate ? String(r.paymentDueDate).split('T')[0] : '—'}
                      </td>

                      {/* Elapsed / Due Status */}
                      <td style={{ padding: '12px 14px' }}>
                        {r.dueState === 'COMPLETED' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                            ✓ Settled
                          </span>
                        ) : isAdv ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                            ⚡ Advance
                          </span>
                        ) : r.dueState === 'OVERDUE' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                            🔴 Overdue {r.daysOverdue}d
                          </span>
                        ) : r.dueState === 'DUE_TODAY' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                            🟡 Due Today
                          </span>
                        ) : r.dueState === 'DUE_SOON' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                            🟠 Due in {remDays}d
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>
                            ⚪ In {remDays}d
                          </span>
                        )}
                      </td>

                      {/* Order Total */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                        {formatINR(r.orderTotal)}
                      </td>

                      {/* Paid Amount */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>
                        {formatINR(r.verifiedPaidAmount)}
                      </td>

                      {/* Outstanding Amount */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: r.outstandingAmount > 0 ? '#DC2626' : '#16A34A' }}>
                        {formatINR(r.outstandingAmount)}
                      </td>

                      {/* Payment Status */}
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
                          ...(r.paymentStatus === 'PAID' ? { background: '#D1FAE5', color: '#065F46' } :
                            r.paymentStatus === 'PARTIALLY_PAID' ? { background: '#DBEAFE', color: '#1E40AF' } :
                            r.paymentStatus === 'OVERDUE' ? { background: '#FEE2E2', color: '#991B1B' } :
                            { background: '#FEF3C7', color: '#92400E' })
                        }}>
                          {r.paymentStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td style={{ padding: '12px 14px' }}>
                        {hasPending ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            background: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FDE68A'
                          }}>
                            ⏳ {formatINR(firstPending?.amount)} ({r.pendingPayments.length})
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                            {r.verificationStatus?.replace(/_/g, ' ') || 'None'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          
                          {/* View Full History */}
                          <button
                            type="button"
                            title="View Payment History & Audit"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                            }}
                            onClick={() => setHistoryModal({ orderId: r.orderId, orderNumber: r.orderNumber })}
                          >
                            <Eye className="w-3.5 h-3.5" /> History
                          </button>

                          {/* Verify / Reject Actions for Pending Payments */}
                          {hasPending && firstPending && (
                            <>
                              <button
                                onClick={() => setVerifyModal({ payment: firstPending, order: r })}
                                disabled={isProcessing}
                                style={{
                                  background: '#16A34A',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Verify Payment"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Verify
                              </button>

                              <button
                                onClick={() => setRejectModal({ payment: firstPending, order: r })}
                                disabled={isProcessing}
                                style={{
                                  background: '#DC2626',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Reject Payment"
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

      {/* ── Verify Payment Confirmation Modal (Section 16) ─────────────────── */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/70">
              <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-600" /> Verify Customer Payment
              </h2>
              <button onClick={() => setVerifyModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px', fontSize: '13px' }}>
                  <span className="text-gray-500 font-semibold">Order Number:</span>
                  <span className="font-bold text-blue-900 font-mono">{verifyModal.order?.orderNumber}</span>

                  <span className="text-gray-500 font-semibold">Customer:</span>
                  <span className="font-bold text-gray-800">{verifyModal.order?.customerName}</span>

                  <span className="text-gray-500 font-semibold">Payment Amount:</span>
                  <span className="font-extrabold text-green-700 text-base">{formatINR(verifyModal.payment?.amount)}</span>

                  <span className="text-gray-500 font-semibold">Method:</span>
                  <span className="font-semibold text-gray-800">{verifyModal.payment?.method || 'BANK_TRANSFER'}</span>

                  <span className="text-gray-500 font-semibold">Reference/UTR:</span>
                  <span className="font-mono text-gray-800 font-bold">{verifyModal.payment?.transactionReference || verifyModal.payment?.paymentNo || '—'}</span>

                  <span className="text-gray-500 font-semibold">Current Paid:</span>
                  <span className="text-gray-700">{formatINR(verifyModal.order?.verifiedPaidAmount)}</span>

                  <span className="text-gray-500 font-semibold">Current Balance:</span>
                  <span className="font-bold text-red-600">{formatINR(verifyModal.order?.outstandingAmount)}</span>

                  <span className="text-gray-500 font-semibold">New Balance:</span>
                  <span className="font-extrabold text-indigo-700">
                    {formatINR(Math.max(0, Number(verifyModal.order?.outstandingAmount || 0) - Number(verifyModal.payment?.amount || 0)))}
                  </span>
                </div>
              </div>

              {verifyModal.payment?.proofUrl && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Attached Proof Document</label>
                  <a
                    href={verifyModal.payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                  >
                    <FileText className="w-4 h-4" /> View Payment Proof Document <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setVerifyModal(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerify(verifyModal.payment.id, verifyModal.order.orderNumber)}
                disabled={isProcessing}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm transition-colors shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> {isProcessing ? 'Verifying...' : 'Confirm & Verify Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Payment Modal (Section 19) ───────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/70">
              <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Reject Customer Payment
              </h2>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            
            <form onSubmit={handleReject} className="p-6 space-y-4">
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                <div><strong>Order:</strong> <span className="font-mono text-blue-900 font-bold">{rejectModal.order?.orderNumber}</span></div>
                <div><strong>Payment Ref:</strong> <span className="font-mono font-semibold">{rejectModal.payment?.paymentNo}</span></div>
                <div><strong>Amount:</strong> <span className="font-bold text-red-600">{formatINR(rejectModal.payment?.amount)}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="rejectionReason" 
                  required 
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm" 
                  rows={3} 
                  placeholder="e.g. Transaction reference does not match bank statement, insufficient credit, fake UTR..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm transition-colors shadow-md flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Complete Payment History Modal (Section 20 & 31) ───────────────── */}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" /> Complete Payment History & Verification
                </h2>
                <div className="text-xs text-gray-500 font-mono mt-0.5">{historyModal.orderNumber}</div>
              </div>
              <button onClick={() => setHistoryModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span>Loading payment details...</span>
                </div>
              ) : !orderHistoryData ? (
                <div className="py-12 text-center text-gray-400">Order details could not be loaded.</div>
              ) : (
                <>
                  {/* Order & Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div className="text-xs text-gray-500 font-semibold">Order Total</div>
                      <div className="text-base font-extrabold text-gray-900 mt-1">{formatINR(orderHistoryData.summary?.orderTotal)}</div>
                    </div>
                    <div style={{ background: '#DCFCE7', padding: '12px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                      <div className="text-xs text-green-700 font-semibold">Verified Paid</div>
                      <div className="text-base font-extrabold text-green-900 mt-1">{formatINR(orderHistoryData.summary?.verifiedPaid)}</div>
                    </div>
                    <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                      <div className="text-xs text-yellow-800 font-semibold">Pending Verification</div>
                      <div className="text-base font-extrabold text-yellow-900 mt-1">{formatINR(orderHistoryData.summary?.pendingVerification)}</div>
                    </div>
                    <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                      <div className="text-xs text-red-700 font-semibold">Outstanding Balance</div>
                      <div className="text-base font-extrabold text-red-900 mt-1">{formatINR(orderHistoryData.summary?.outstandingAmount)}</div>
                    </div>
                  </div>

                  {/* Payment Timeline Table */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" /> Chronological Payment Records
                    </h3>

                    {(!orderHistoryData.history || orderHistoryData.history.length === 0) ? (
                      <div className="p-8 text-center bg-gray-50 rounded-xl text-gray-400">
                        No payments recorded for this order yet.
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                            <tr>
                              <th className="p-3">Date</th>
                              <th className="p-3 text-right">Amount</th>
                              <th className="p-3">Method / Ref</th>
                              <th className="p-3">Submitted By</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Audit Details</th>
                              <th className="p-3 text-center">Proof</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {orderHistoryData.history.map((h, i) => (
                              <tr key={h.id || i} className="hover:bg-gray-50/50">
                                <td className="p-3 font-semibold text-gray-700">
                                  {h.receivedAt ? String(h.receivedAt).split('T')[0] : '—'}
                                </td>
                                <td className="p-3 text-right font-extrabold text-gray-900">
                                  {formatINR(h.amount)}
                                </td>
                                <td className="p-3">
                                  <div className="font-semibold text-gray-800">{h.method}</div>
                                  <div className="font-mono text-gray-500 text-[11px]">{h.transactionReference || h.paymentNo}</div>
                                </td>
                                <td className="p-3 text-gray-600">
                                  {h.submittedByName || 'Sales User'}
                                </td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                    h.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                    h.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {h.status === 'VERIFIED' && '✓ '}
                                    {h.status === 'REJECTED' && '✕ '}
                                    {h.status}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-600">
                                  {h.status === 'VERIFIED' && (
                                    <div>
                                      <span className="font-semibold">By:</span> {h.verifiedByName || 'Finance User'}
                                      <div className="text-[10px] text-gray-400">{h.verifiedAt ? new Date(h.verifiedAt).toLocaleString() : ''}</div>
                                    </div>
                                  )}
                                  {h.status === 'REJECTED' && (
                                    <div className="text-red-700">
                                      <div className="font-bold">Reason: {h.rejectionReason}</div>
                                      <div className="text-[10px] text-gray-400">By: {h.rejectedByName || 'Finance'} on {h.rejectedAt ? new Date(h.rejectedAt).toLocaleString() : ''}</div>
                                    </div>
                                  )}
                                  {h.status !== 'VERIFIED' && h.status !== 'REJECTED' && (
                                    <span className="text-yellow-700 italic">Awaiting verification</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {h.proofUrl ? (
                                    <a
                                      href={h.proofUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                                    >
                                      <FileText className="w-3.5 h-3.5" /> Proof
                                    </a>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModal(null)}
                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold text-sm transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
