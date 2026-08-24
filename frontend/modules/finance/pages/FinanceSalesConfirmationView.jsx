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
import { getBackendAssetUrl } from '../../../lib/assetUrl';

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
  const [verifyImageError, setVerifyImageError] = useState(false);

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
        <div className="finance-kpi-card" style={{
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
        <div className="finance-kpi-card" style={{
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
        <div className="finance-kpi-card" style={{
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
        <div className="finance-kpi-card" style={{
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
        <div className="finance-kpi-card" style={{
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
        <div className="finance-kpi-card" style={{
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
              className={`finance-verification-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
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
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search Order No, Customer, Salesperson, Ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '13.5px',
                  background: '#FFFFFF',
                  color: '#1E293B',
                }}
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
                className="finance-verification-select"
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
                className="finance-verification-select"
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
                <th style={{ padding: '12px 14px', minWidth: '150px' }}>Order Number</th>
                <th style={{ padding: '12px 14px', minWidth: '160px' }}>Customer</th>
                <th style={{ padding: '12px 14px', minWidth: '130px' }}>Salesperson</th>
                <th style={{ padding: '12px 14px', minWidth: '110px' }}>Order Date</th>
                <th style={{ padding: '12px 14px', minWidth: '120px' }}>Payment Terms</th>
                <th style={{ padding: '12px 14px', minWidth: '110px' }}>Start Date</th>
                <th style={{ padding: '12px 14px', minWidth: '110px' }}>Due Date</th>
                <th style={{ padding: '12px 14px', minWidth: '130px' }}>Elapsed / Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', minWidth: '110px' }}>Order Total</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', minWidth: '110px' }}>Paid Amount</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', minWidth: '110px' }}>Outstanding</th>
                <th style={{ padding: '12px 14px', minWidth: '130px' }}>Payment Status</th>
                <th style={{ padding: '12px 14px', minWidth: '130px' }}>Verification</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', minWidth: '240px' }}>Actions</th>
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
                                onClick={() => {
                                  setVerifyImageError(false);
                                  setVerifyModal({ payment: firstPending, order: r });
                                }}
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

        {/* ── Mobile Cards List View (Section 13) ── */}
        <div className="payment-verification-mobile-cards" style={{ display: 'none', padding: '14px', flexDirection: 'column', gap: '14px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <span>Loading payment records...</span>
            </div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📭</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>No orders found matching the filter criteria.</span>
            </div>
          ) : (
            rows.map((r, idx) => {
              const hasPending = (r.pendingPayments || []).length > 0;
              const firstPending = r.pendingPayments?.[0];
              const remDays = r.daysRemaining;
              const formattedDate = r.orderDate ? new Date(r.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

              return (
                <div 
                  key={r.orderId + idx} 
                  className="payment-mobile-card" 
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: hasPending ? '4px solid #F59E0B' : (r.dueState === 'OVERDUE' ? '4px solid #DC2626' : '4px solid #3B82F6'),
                    borderRadius: '14px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Header Row: Calendar + Date + Days Pill + Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{formattedDate}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '11px', background: '#EEF2FF', color: '#4F46E5', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>
                            🌙 In {remDays || 8}d
                          </span>
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A'
                    }}>
                      {r.paymentStatus || 'PENDING'}
                    </span>
                  </div>

                  {/* Customer / Order Info */}
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    <strong style={{ color: '#0F172A' }}>{r.customerName}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                      Order: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1E3A8A' }}>{r.orderNumber}</span> • {r.salespersonName || 'Sales'}
                    </div>
                  </div>

                  {/* 3 Metric Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px 0', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>Amount</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{formatINR(r.orderTotal)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>Paid</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#16A34A' }}>{formatINR(r.verifiedPaidAmount)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>Outstanding</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#DC2626' }}>{formatINR(r.outstandingAmount)}</span>
                    </div>
                  </div>

                  {/* Pending verification info */}
                  {hasPending && firstPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#92400E' }}>
                      <span>⏳ {formatINR(firstPending?.amount)} ({r.pendingPayments.length})</span>
                    </div>
                  )}

                  {/* 3 Action Buttons Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: hasPending ? '1fr 1fr 1fr' : '1fr', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '9px 8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setHistoryModal({ orderId: r.orderId, orderNumber: r.orderNumber })}
                    >
                      <Eye className="w-3.5 h-3.5" /> History
                    </button>

                    {hasPending && firstPending && (
                      <>
                        <button
                          type="button"
                          style={{
                            background: '#16A34A',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '9px 8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setVerifyImageError(false);
                            setVerifyModal({ payment: firstPending, order: r });
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                        </button>

                        <button
                          type="button"
                          style={{
                            background: '#DC2626',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '9px 8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => setRejectModal({ payment: firstPending, order: r })}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Verify Payment Confirmation Modal (Section 16) ─────────────────── */}
      {verifyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '512px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F0FDF4',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0,
              }}>
                <ShieldCheck style={{ width: '24px', height: '24px', color: '#16A34A' }} /> Verify Customer Payment
              </h2>
              <button
                onClick={() => {
                  setVerifyModal(null);
                  setVerifyImageError(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px 16px', fontSize: '13.5px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#64748B' }}>Order Number:</span>
                  <span style={{ fontWeight: 800, color: '#1E3A8A', fontFamily: 'monospace', fontSize: '14px' }}>{verifyModal.order?.orderNumber}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Customer:</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{verifyModal.order?.customerName}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Payment Amount:</span>
                  <span style={{ fontWeight: 900, color: '#16A34A', fontSize: '16px' }}>{formatINR(verifyModal.payment?.amount)}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Method:</span>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{verifyModal.payment?.method || 'BANK_TRANSFER'}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Reference/UTR:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>{verifyModal.payment?.transactionReference || verifyModal.payment?.paymentNo || '—'}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Current Paid:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{formatINR(verifyModal.order?.verifiedPaidAmount)}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Current Balance:</span>
                  <span style={{ fontWeight: 700, color: '#DC2626' }}>{formatINR(verifyModal.order?.outstandingAmount)}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>New Balance:</span>
                  <span style={{ fontWeight: 900, color: '#4F46E5', fontSize: '15px' }}>
                    {formatINR(Math.max(0, Number(verifyModal.order?.outstandingAmount || 0) - Number(verifyModal.payment?.amount || 0)))}
                  </span>
                </div>
              </div>

              {verifyModal.payment?.proofUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attached Proof Document</label>
                  
                  {/* Image Preview Container */}
                  {/\.(png|jpe?g|gif|webp|bmp|svg)/i.test(verifyModal.payment.proofUrl.split('?')[0]) && !verifyImageError ? (
                    <div style={{
                      width: '100%',
                      maxHeight: '260px',
                      overflow: 'hidden',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      boxSizing: 'border-box',
                    }}>
                      <img
                        src={getBackendAssetUrl(verifyModal.payment.proofUrl)}
                        alt="Payment Proof"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '244px',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          cursor: 'zoom-in',
                        }}
                        onClick={() => window.open(getBackendAssetUrl(verifyModal.payment.proofUrl), '_blank')}
                        onError={() => setVerifyImageError(true)}
                        title="Click to view full image in new tab"
                      />
                    </div>
                  ) : verifyModal.payment?.proofUrl && verifyImageError ? (
                    <div style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '10px',
                      color: '#B45309',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxSizing: 'border-box',
                    }}>
                      <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0, color: '#D97706' }} />
                      <span>Proof image not found on server or access expired.</span>
                    </div>
                  ) : null}

                  <a
                    href={getBackendAssetUrl(verifyModal.payment.proofUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      gap: '8px',
                      color: '#2563EB',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '12px',
                      background: '#EFF6FF',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #BFDBFE',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FileText style={{ width: '16px', height: '16px' }} /> View Payment Proof Document <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                  </a>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid #F1F5F9',
              background: '#F8FAFC',
            }}>
              <button
                type="button"
                onClick={() => {
                  setVerifyModal(null);
                  setVerifyImageError(false);
                }}
                disabled={isProcessing}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerify(verifyModal.payment.id, verifyModal.order.orderNumber)}
                disabled={isProcessing}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  background: '#16A34A',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.15s ease',
                }}
              >
                <Check style={{ width: '16px', height: '16px' }} /> {isProcessing ? 'Verifying...' : 'Confirm & Verify Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Payment Modal (Section 19) ───────────────────────────────── */}
      {rejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '448px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FEF2F2',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0,
              }}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: '#DC2626' }} /> Reject Customer Payment
              </h2>
              <button
                onClick={() => setRejectModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleReject} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', margin: 0 }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Order:</strong> <span style={{ fontFamily: 'monospace', color: '#1E3A8A', fontWeight: 800, marginLeft: '4px' }}>{rejectModal.order?.orderNumber}</span></div>
                <div><strong>Payment Ref:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, marginLeft: '4px' }}>{rejectModal.payment?.paymentNo}</span></div>
                <div><strong>Amount:</strong> <span style={{ fontWeight: 800, color: '#DC2626', marginLeft: '4px' }}>{formatINR(rejectModal.payment?.amount)}</span></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rejection Reason <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea 
                  name="rejectionReason" 
                  required 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '13.5px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px',
                    background: '#FFFDFD',
                  }}
                  placeholder="e.g. Transaction reference does not match bank statement, insufficient credit, fake UTR..."
                ></textarea>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #F1F5F9',
              }}>
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  disabled={isProcessing}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#475569',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    background: '#DC2626',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <XCircle style={{ width: '16px', height: '16px' }} /> {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Complete Payment History Modal (Section 20 & 31) ───────────────── */}
      {historyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '768px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F8FAFC',
            }}>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                }}>
                  <DollarSign style={{ width: '20px', height: '20px', color: '#2563EB' }} /> Complete Payment History & Verification
                </h2>
                <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>{historyModal.orderNumber}</div>
              </div>
              <button
                onClick={() => setHistoryModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {isLoadingHistory ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <RefreshCw style={{ width: '32px', height: '32px', color: '#2563EB', animation: 'spin 1s linear infinite' }} />
                  <span>Loading payment details...</span>
                </div>
              ) : !orderHistoryData ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: '#94A3B8' }}>Order details could not be loaded.</div>
              ) : (
                <>
                  {/* Order & Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Order Total</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{formatINR(orderHistoryData.summary?.orderTotal)}</div>
                    </div>
                    <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#166534' }}>Verified Paid</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#14532D', marginTop: '4px' }}>{formatINR(orderHistoryData.summary?.verifiedPaid)}</div>
                    </div>
                    <div style={{ background: '#FFFDF5', padding: '12px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#854D0E' }}>Pending Verification</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#713F12', marginTop: '4px' }}>{formatINR(orderHistoryData.summary?.pendingVerification)}</div>
                    </div>
                    <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#991B1B' }}>Outstanding Balance</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#7F1D1D', marginTop: '4px' }}>{formatINR(orderHistoryData.summary?.outstandingAmount)}</div>
                    </div>
                  </div>

                  {/* Payment Timeline Table */}
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock style={{ width: '16px', height: '16px', color: '#2563EB' }} /> Chronological Payment Records
                    </h3>

                    {(!orderHistoryData.history || orderHistoryData.history.length === 0) ? (
                      <div style={{ padding: '32px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', color: '#94A3B8' }}>
                        No payments recorded for this order yet.
                      </div>
                    ) : (
                      <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                          <thead style={{ background: '#F8FAFC', color: '#475569', fontWeight: 700, borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                              <th style={{ padding: '10px 12px', minWidth: '95px' }}>Date</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', minWidth: '95px' }}>Amount</th>
                              <th style={{ padding: '10px 12px', minWidth: '140px' }}>Method / Ref</th>
                              <th style={{ padding: '10px 12px', minWidth: '110px' }}>Submitted By</th>
                              <th style={{ padding: '10px 12px', minWidth: '110px' }}>Status</th>
                              <th style={{ padding: '10px 12px', minWidth: '180px' }}>Audit Details</th>
                              <th style={{ padding: '10px 12px', textAlign: 'center', minWidth: '80px' }}>Proof</th>
                            </tr>
                          </thead>
                          <tbody style={{ verticalAlign: 'middle' }}>
                            {orderHistoryData.history.map((h, i) => (
                              <tr key={h.id || i} style={{ borderBottom: i === orderHistoryData.history.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
                                <td style={{ padding: '12px', fontWeight: 600, color: '#475569' }}>
                                  {h.receivedAt ? String(h.receivedAt).split('T')[0] : '—'}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                                  {formatINR(h.amount)}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <div style={{ fontWeight: 700, color: '#334155' }}>{h.method}</div>
                                  <div style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '10.5px', marginTop: '2px' }}>{h.transactionReference || h.paymentNo}</div>
                                </td>
                                <td style={{ padding: '12px', color: '#475569' }}>
                                  {h.submittedByName || 'Sales User'}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    ...(h.status === 'VERIFIED' ? { background: '#D1FAE5', color: '#065F46' } :
                                      h.status === 'REJECTED' ? { background: '#FEE2E2', color: '#991B1B' } :
                                      { background: '#FEF3C7', color: '#92400E' })
                                  }}>
                                    {h.status === 'VERIFIED' && '✓ '}
                                    {h.status === 'REJECTED' && '✕ '}
                                    {h.status}
                                  </span>
                                </td>
                                <td style={{ padding: '12px', color: '#475569', fontSize: '11.5px' }}>
                                  {h.status === 'VERIFIED' && (
                                    <div>
                                      <span style={{ fontWeight: 600 }}>By:</span> {h.verifiedByName || 'Finance User'}
                                      <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{h.verifiedAt ? new Date(h.verifiedAt).toLocaleString() : ''}</div>
                                    </div>
                                  )}
                                  {h.status === 'REJECTED' && (
                                    <div style={{ color: '#991B1B' }}>
                                      <div style={{ fontWeight: 700 }}>Reason: {h.rejectionReason}</div>
                                      <div style={{ fontSize: '10px', color: '#FCA5A5', marginTop: '2px' }}>By: {h.rejectedByName || 'Finance'} on {h.rejectedAt ? new Date(h.rejectedAt).toLocaleString() : ''}</div>
                                    </div>
                                  )}
                                  {h.status !== 'VERIFIED' && h.status !== 'REJECTED' && (
                                    <span style={{ color: '#D97706', fontStyle: 'italic' }}>Awaiting verification</span>
                                  )}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                  {h.proofUrl ? (
                                    <a
                                      href={getBackendAssetUrl(h.proofUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#2563EB',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                      }}
                                    >
                                      <FileText style={{ width: '14px', height: '14px' }} /> Proof
                                    </a>
                                  ) : (
                                    <span style={{ color: '#CBD5E1' }}>—</span>
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

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #F1F5F9',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={() => setHistoryModal(null)}
                style={{
                  padding: '8px 18px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
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
