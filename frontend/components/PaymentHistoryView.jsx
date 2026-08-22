'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle, 
  CreditCard, Eye, RefreshCw, X, ChevronLeft, ChevronRight,
  FileText, ShieldCheck, ExternalLink, Cloud
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { backendFetch } from '../lib/backendFetch';
import { useERPStore } from '../store/erpStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getBackendAssetUrl } from '../lib/assetUrl';
import './erp-premium-ui.css';

export default function PaymentHistoryView({ 
  orders = [], 
  payments = [], 
  searchQuery = '', 
  setSearchQuery 
}) {
  const isCompact = useMediaQuery('(max-width: 1024px)');
  const storeState = useERPStore((s) => s.state);
  const localConfirmations = useMemo(() => storeState?.sales?.paymentConfirmations || [], [storeState?.sales?.paymentConfirmations]);

  // Local UI Filter States
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const search = localSearch;
  const setSearch = (val) => {
    setLocalSearch(val);
    if (typeof setSearchQuery === 'function') {
      setSearchQuery(val);
    }
  };

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [previewProofRecord, setPreviewProofRecord] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState(null);

  // Helper to extract clean customer name from various data sources
  const resolveCustomerName = (item, orderMatch) => {
    const candidateNames = [
      item?.customer?.companyName,
      item?.customer?.name,
      typeof item?.customer === 'string' && item.customer !== 'Customer' ? item.customer : null,
      item?.customerName && item.customerName !== 'Customer' ? item.customerName : null,
      item?.clientName,
      item?.salesOrder?.customer?.companyName,
      item?.salesOrder?.customer?.name,
      item?.salesOrder?.customerName && item.salesOrder.customerName !== 'Customer' ? item.salesOrder.customerName : null,
      orderMatch?.customerName && orderMatch.customerName !== 'Customer' ? orderMatch.customerName : null,
      orderMatch?.customer?.companyName,
      orderMatch?.customer?.name,
      typeof orderMatch?.customer === 'string' && orderMatch.customer !== 'Customer' ? orderMatch.customer : null,
    ];
    return candidateNames.find(name => Boolean(name && typeof name === 'string' && name.trim() !== '' && name.trim() !== 'Customer')) || 'Customer';
  };

  // Fetch Payment Records from Backend API
  const { data: backendPayments = [], isLoading, refetch } = useQuery({
    queryKey: ['sales-payment-history'],
    queryFn: async () => {
      try {
        const response = await backendFetch('/api/backend/finance/payments');
        const records = Array.isArray(response) ? response : response?.data;
        return Array.isArray(records) ? records : [];
      } catch (err) {
        console.warn('Backend payments endpoint failed, falling back to store:', err);
        return [];
      }
    },
  });

  // Combine and normalize payment history data from backend API & local store
  const allHistoryRecords = useMemo(() => {
    const map = new Map();

    // 1. Process backend payments
    backendPayments.forEach((p) => {
      const id = String(p.id || p.paymentNo || p.referenceNo);
      const matchedOrder = orders.find(
        (o) => String(o.id) === String(p.salesOrderId) || String(o.orderNo || o.orderNumber) === String(p.salesOrder?.orderNumber || p.orderNo)
      );

      map.set(id, {
        id: p.id || id,
        paymentNo: p.paymentNo || `PAY-${id.slice(-6)}`,
        orderId: p.salesOrderId || p.salesOrder?.id || p.orderNo || '--',
        orderNo: p.salesOrder?.orderNumber || p.orderNo || (p.salesOrderId ? `ORD-${p.salesOrderId}` : '--'),
        customerName: resolveCustomerName(p, matchedOrder),
        amount: Number(p.amount || p.totalAmount || 0),
        paymentMethod: p.paymentMethod || p.mode || p.type || 'Bank Transfer',
        referenceNo: p.referenceNo || p.utrNumber || p.transactionRef || '--',
        receivedAt: p.receivedAt || p.createdAt || p.paymentDate || new Date().toISOString(),
        verifiedAt: p.verifiedAt || null,
        status: String(p.status || 'VERIFIED').toUpperCase(),
        proofUrl: p.proofUrl || p.receiptUrl || p.attachment || null,
        remarks: p.remarks || p.notes || 'Recorded customer payment',
        raw: p,
      });
    });

    // 2. Process local store confirmations
    localConfirmations.forEach((c) => {
      const id = String(c.id || c.orderId || c.orderNo);
      if (!map.has(id)) {
        const matchedOrder = orders.find(
          (o) => String(o.id) === String(c.orderId || c.id) || String(o.orderNo || o.orderNumber) === String(c.orderNo || c.orderNumber)
        );

        map.set(id, {
          id: c.id || `LOCAL-${id}`,
          paymentNo: c.paymentNo || `PAY-CONF-${id}`,
          orderId: c.orderId || c.id,
          orderNo: c.orderNo || c.orderNumber || `ORD-${c.orderId || id}`,
          customerName: resolveCustomerName(c, matchedOrder),
          amount: Number(c.amount || c.paidAmount || 0),
          paymentMethod: c.paymentMethod || 'Bank Transfer',
          referenceNo: c.referenceNo || c.utr || '--',
          receivedAt: c.date || c.createdAt || new Date().toISOString(),
          verifiedAt: c.verifiedAt || null,
          status: String(c.status || 'PENDING_VERIFICATION').toUpperCase(),
          proofUrl: c.proofUrl || null,
          remarks: c.remarks || c.notes || 'Sales Payment Confirmation',
          raw: c,
        });
      }
    });

    // 3. Process orders with verified payments
    orders.forEach((o) => {
      if (o.paymentConfirmations && Array.isArray(o.paymentConfirmations)) {
        o.paymentConfirmations.forEach((pc, idx) => {
          const key = `ORDER-${o.id}-${idx}`;
          if (!map.has(key)) {
            map.set(key, {
              id: key,
              paymentNo: pc.paymentNo || `PAY-ORD-${o.id}-${idx + 1}`,
              orderId: o.id,
              orderNo: o.orderNo || o.orderNumber || `ORD-${o.id}`,
              customerName: resolveCustomerName(pc, o),
              amount: Number(pc.amount || 0),
              paymentMethod: pc.paymentMethod || 'Bank Transfer',
              referenceNo: pc.referenceNo || '--',
              receivedAt: pc.date || o.createdAt || new Date().toISOString(),
              verifiedAt: pc.verifiedAt || null,
              status: String(pc.status || 'VERIFIED').toUpperCase(),
              proofUrl: pc.proofUrl || null,
              remarks: pc.remarks || 'Order payment record',
              raw: pc,
            });
          }
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }, [backendPayments, localConfirmations, orders]);

  // Metric Computations
  const metrics = useMemo(() => {
    let totalAmount = 0;
    let verifiedCount = 0;
    let verifiedAmount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let rejectedCount = 0;

    allHistoryRecords.forEach((r) => {
      totalAmount += r.amount;
      const st = r.status;
      if (['VERIFIED', 'PAID', 'APPROVED', 'COMPLETED'].includes(st)) {
        verifiedCount++;
        verifiedAmount += r.amount;
      } else if (['PENDING', 'PENDING_VERIFICATION', 'SUBMITTED', 'AWAITING_VERIFICATION', 'UNDER_VERIFICATION', 'AWAITING_FINANCE_VERIFICATION'].includes(st)) {
        pendingCount++;
        pendingAmount += r.amount;
      } else if (['REJECTED', 'FAILED', 'BOUNCED'].includes(st)) {
        rejectedCount++;
      }
    });

    return {
      totalRecords: allHistoryRecords.length,
      totalAmount,
      verifiedCount,
      verifiedAmount,
      pendingCount,
      pendingAmount,
      rejectedCount,
    };
  }, [allHistoryRecords]);

  // Filtering Logic
  const filteredRecords = useMemo(() => {
    return allHistoryRecords.filter((r) => {
      // Search filter
      const searchLower = search.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        r.customerName.toLowerCase().includes(searchLower) ||
        r.orderNo.toLowerCase().includes(searchLower) ||
        r.paymentNo.toLowerCase().includes(searchLower) ||
        r.referenceNo.toLowerCase().includes(searchLower);

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'VERIFIED') {
          matchesStatus = ['VERIFIED', 'PAID', 'APPROVED', 'COMPLETED'].includes(r.status);
        } else if (statusFilter === 'PENDING') {
          matchesStatus = ['PENDING', 'PENDING_VERIFICATION', 'SUBMITTED', 'AWAITING_VERIFICATION', 'UNDER_VERIFICATION', 'AWAITING_FINANCE_VERIFICATION'].includes(r.status);
        } else if (statusFilter === 'REJECTED') {
          matchesStatus = ['REJECTED', 'FAILED', 'BOUNCED'].includes(r.status);
        }
      }

      // Method filter
      let matchesMethod = true;
      if (methodFilter !== 'ALL') {
        matchesMethod = r.paymentMethod.toUpperCase().includes(methodFilter.toUpperCase());
      }

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [allHistoryRecords, search, statusFilter, methodFilter]);

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeClass = (status) => {
    const st = String(status || '').toUpperCase();
    if (['VERIFIED', 'PAID', 'APPROVED', 'COMPLETED'].includes(st)) {
      return 'ph-status-chip status-verified';
    }
    if (['REJECTED', 'FAILED', 'BOUNCED'].includes(st)) {
      return 'ph-status-chip status-rejected';
    }
    return 'ph-status-chip status-pending';
  };

  const renderStatusLabel = (status) => {
    const st = String(status || '').toUpperCase();
    if (['VERIFIED', 'PAID', 'APPROVED', 'COMPLETED'].includes(st)) return 'VERIFIED';
    if (['REJECTED', 'FAILED', 'BOUNCED'].includes(st)) return 'REJECTED';
    return 'UNDER_VERIFICATION';
  };

  return (
    <div className="app-card payment-history-container" style={{ flex: 1 }}>
      {/* KPI Cards */}
      <div className="ph-kpi-grid">
        {/* Total Collections */}
        <div className="ph-kpi-card kpi-blue">
          <div className="ph-kpi-top">
            <span className="ph-kpi-title">TOTAL COLLECTIONS</span>
            <DollarSign size={18} className="ph-kpi-icon" />
          </div>
          <div className="ph-kpi-val">{formatINR(metrics.totalAmount)}</div>
          <span className="ph-kpi-sub">Across {metrics.totalRecords} payment records</span>
        </div>

        {/* Verified Payments */}
        <div className="ph-kpi-card kpi-green">
          <div className="ph-kpi-top">
            <span className="ph-kpi-title">VERIFIED PAYMENTS</span>
            <CheckCircle2 size={18} className="ph-kpi-icon" />
          </div>
          <div className="ph-kpi-val">{formatINR(metrics.verifiedAmount)}</div>
          <span className="ph-kpi-sub">{metrics.verifiedCount} verified transactions</span>
        </div>

        {/* Pending Verification */}
        <div className="ph-kpi-card kpi-amber">
          <div className="ph-kpi-top">
            <span className="ph-kpi-title">PENDING VERIFICATION</span>
            <Clock size={18} className="ph-kpi-icon" />
          </div>
          <div className="ph-kpi-val">{formatINR(metrics.pendingAmount)}</div>
          <span className="ph-kpi-sub">{metrics.pendingCount} awaiting finance check</span>
        </div>

        {/* Rejected / Flagged */}
        <div className="ph-kpi-card kpi-red">
          <div className="ph-kpi-top">
            <span className="ph-kpi-title">REJECTED / FLAGGED</span>
            <AlertTriangle size={18} className="ph-kpi-icon" />
          </div>
          <div className="ph-kpi-val">{metrics.rejectedCount}</div>
          <span className="ph-kpi-sub">Requires review or re-upload</span>
        </div>
      </div>

      {/* Controls: Search, Status Capsule, Method Selector */}
      <div className="ph-controls-stack">
        {/* Search Bar */}
        <div className="ph-search-bar">
          <Search size={17} style={{ color: '#94a3b8', marginRight: '10px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search customer, order, receipt #, or UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px 4px' }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Capsule & Method Select */}
        <div className="ph-filters-row">
          <div className="ph-status-capsule">
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`ph-status-pill ${statusFilter === st.id ? 'active' : ''}`}
                onClick={() => { setStatusFilter(st.id); setCurrentPage(1); }}
              >
                {st.label}
              </button>
            ))}
          </div>

          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
            className="ph-mode-select"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="BANK">Bank Transfer / NEFT / RTGS</option>
            <option value="UPI">UPI / GPay / PhonePe</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CASH">Cash</option>
          </select>
        </div>
      </div>

      {/* Mobile Card Grid or Desktop CRM Table */}
      {isCompact ? (
        <div className="ph-mobile-cards-list">
          {paginatedRecords.length === 0 ? (
            <div className="empty-state-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '36px 20px', textAlign: 'center' }}>
              <CreditCard size={32} style={{ color: '#cbd5e1', margin: '0 auto 10px auto' }} />
              <div className="empty-state-title" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>No payment records found</div>
              <div className="empty-state-subtitle" style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>Try adjusting your search query or filter selection.</div>
            </div>
          ) : (
            paginatedRecords.map((r) => (
              <div key={r.id} className="ph-mobile-card">
                {/* Top Row: Payment No & Amount */}
                <div className="ph-card-row-top">
                  <span className="ph-payment-no">{r.paymentNo}</span>
                  <span className="ph-amount">{formatINR(r.amount)}</span>
                </div>

                {/* Sub Row: Order Ref & Payment Mode */}
                <div className="ph-card-row-sub">
                  <button
                    className="ph-order-link"
                    onClick={() => {
                      const matchedOrder = orders.find(o => String(o.id) === String(r.orderId) || String(o.orderNo) === String(r.orderNo));
                      if (matchedOrder) setSelectedOrderForDrawer(matchedOrder);
                    }}
                  >
                    {r.orderNo}
                  </button>
                  <span className="ph-mode-chip">{r.paymentMethod}</span>
                </div>

                {/* Customer Name */}
                <div className="ph-customer-name">{r.customerName}</div>

                {/* Date & Status Chip */}
                <div className="ph-card-row-date-status">
                  <div className="ph-date">
                    <Calendar size={13} style={{ color: '#94a3b8' }} />
                    <span>{formatDate(r.receivedAt)}</span>
                  </div>
                  <span className={getStatusBadgeClass(r.status)}>
                    {renderStatusLabel(r.status)}
                  </span>
                </div>

                {/* Action Buttons: Receipt & Proof */}
                <div className="ph-card-actions">
                  <button
                    onClick={() => setSelectedPayment(r)}
                    className="ph-btn-receipt"
                    title="View Receipt Details"
                  >
                    <Eye size={14} /> Receipt
                  </button>
                  <button
                    onClick={() => { setPreviewProofRecord(r); setImgFailed(false); }}
                    className="ph-btn-proof"
                    title="View Proof Document"
                  >
                    <Cloud size={14} /> Proof
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="crm-table-container" style={{ borderRadius: '12px', overflowX: 'auto', border: '1px solid #e2e8f0' }}>
          <table className="crm-table responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', textTransform: 'uppercase', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Receipt / Ref No</th>
                <th style={{ padding: '12px 14px' }}>Order Number</th>
                <th style={{ padding: '12px 14px' }}>Customer Name</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount Paid</th>
                <th style={{ padding: '12px 14px' }}>Payment Mode</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={32} style={{ color: '#cbd5e1' }} />
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>No payment history records found.</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Try adjusting your search query or filter selection.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                    <td data-label="Receipt / Ref No" style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{r.paymentNo}</span>
                        {r.referenceNo !== '--' && (
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Ref: {r.referenceNo}</span>
                        )}
                      </div>
                    </td>

                    <td data-label="Order Number" style={{ padding: '12px 14px', fontWeight: '700', color: '#2563eb' }}>
                      <button
                        onClick={() => {
                          const matchedOrder = orders.find(o => String(o.id) === String(r.orderId) || String(o.orderNo) === String(r.orderNo));
                          if (matchedOrder) setSelectedOrderForDrawer(matchedOrder);
                        }}
                        style={{ background: 'none', border: 'none', padding: 0, color: '#2563eb', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {r.orderNo}
                      </button>
                    </td>

                    <td data-label="Customer Name" style={{ padding: '12px 14px', color: '#1e293b', fontWeight: '600' }}>
                      {r.customerName}
                    </td>

                    <td data-label="Date" style={{ padding: '12px 14px', color: '#475569' }}>
                      {formatDate(r.receivedAt)}
                    </td>

                    <td data-label="Amount Paid" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#059669', fontSize: '14px' }}>
                      {formatINR(r.amount)}
                    </td>

                    <td data-label="Payment Mode" style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#334155' }}>
                        {r.paymentMethod}
                      </span>
                    </td>

                    <td data-label="Status" style={{ padding: '12px 14px' }}>
                      <span className={getStatusBadgeClass(r.status)} style={{ fontSize: '11px', padding: '3px 8px' }}>
                        {renderStatusLabel(r.status)}
                      </span>
                    </td>

                    <td data-label="Actions" style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => setSelectedPayment(r)}
                          className="btn-small btn-outline-small"
                          title="View Payment Receipt Details"
                          style={{ padding: '5px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}
                        >
                          <Eye size={12} /> Receipt
                        </button>

                        <button
                          onClick={() => { setPreviewProofRecord(r); setImgFailed(false); }}
                          className="btn-small btn-primary-small"
                          title="View Payment Proof Document"
                          style={{ padding: '5px 8px', borderRadius: '6px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}
                        >
                          <Cloud size={12} /> Proof
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)}</strong> of <strong>{filteredRecords.length}</strong> records
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="btn-small btn-outline-small"
              style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ padding: '5px 10px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="btn-small btn-outline-small"
              style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Receipt Details Modal */}
      {selectedPayment && (
        <div className="modal-overlay active" onClick={() => setSelectedPayment(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', width: '560px', maxWidth: '92vw', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', pb: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Receipt #{selectedPayment.paymentNo}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Recorded on {formatDate(selectedPayment.receivedAt)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedPayment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Customer Name</span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>{selectedPayment.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Sales Order</span>
                <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700' }}>{selectedPayment.orderNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Payment Mode</span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{selectedPayment.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Reference / UTR No</span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{selectedPayment.referenceNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>Total Amount Paid</span>
                <span style={{ fontSize: '18px', color: '#059669', fontWeight: '800' }}>{formatINR(selectedPayment.amount)}</span>
              </div>
            </div>

            {selectedPayment.remarks && (
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Notes / Remarks</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155', fontStyle: 'italic', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  "{selectedPayment.remarks}"
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => { setPreviewProofRecord(selectedPayment); setImgFailed(false); setSelectedPayment(null); }}
                className="btn-small btn-primary-small"
                style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                <Cloud size={14} /> View Proof Document
              </button>
              <button
                onClick={() => setSelectedPayment(null)}
                className="btn-small btn-outline-small"
                style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {previewProofRecord && (
        <div className="modal-overlay active" onClick={() => setPreviewProofRecord(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', width: '680px', maxWidth: '95vw', maxHeight: '90vh', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cloud size={18} style={{ color: '#0284c7' }} /> Payment Proof Document
              </h3>
              <button onClick={() => setPreviewProofRecord(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {previewProofRecord.proofUrl && !imgFailed && typeof previewProofRecord.proofUrl === 'string' && (previewProofRecord.proofUrl.startsWith('http') || previewProofRecord.proofUrl.startsWith('data:') || previewProofRecord.proofUrl.startsWith('/')) ? (
                previewProofRecord.proofUrl.endsWith('.pdf') ? (
                  <iframe src={getBackendAssetUrl(previewProofRecord.proofUrl)} style={{ width: '100%', height: '500px', border: 'none' }} title="Proof PDF" />
                ) : (
                  <img
                    src={getBackendAssetUrl(previewProofRecord.proofUrl)}
                    onError={() => setImgFailed(true)}
                    alt="Payment Proof"
                    style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                )
              ) : (
                /* High-fidelity Digital Payment Proof Voucher */
                <div style={{ width: '100%', maxWidth: '540px', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '16px', right: '-32px', background: '#10b981', color: '#ffffff', padding: '4px 36px', transform: 'rotate(25deg)', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    VERIFIED
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px dashed #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={26} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Payment Proof Document</h4>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ERP Electronic Payment Receipt Confirmation</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Receipt / Ref No</span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{previewProofRecord.paymentNo}</strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Order Reference</span>
                      <strong style={{ fontSize: '13px', color: '#2563eb' }}>{previewProofRecord.orderNo}</strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Customer Name</span>
                      <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>{previewProofRecord.customerName}</strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Payment Date</span>
                      <strong style={{ fontSize: '12px', color: '#334155' }}>{formatDate(previewProofRecord.receivedAt)}</strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Payment Mode</span>
                      <strong style={{ fontSize: '12px', color: '#334155' }}>{previewProofRecord.paymentMethod}</strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>UTR / Transaction Reference</span>
                      <strong style={{ fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>{previewProofRecord.referenceNo !== '--' ? previewProofRecord.referenceNo : `UTR-${previewProofRecord.paymentNo.replaceAll('-', '')}`}</strong>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#065f46', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Amount Received</span>
                        <span style={{ fontSize: '11px', color: '#047857' }}>Verification: <strong>{renderStatusLabel(previewProofRecord.status)}</strong></span>
                      </div>
                      <strong style={{ fontSize: '20px', color: '#047857', fontWeight: '900' }}>{formatINR(previewProofRecord.amount)}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
                    <span>System Generated Proof Record</span>
                    <span>Ref ID: {previewProofRecord.id}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              {previewProofRecord.proofUrl && !imgFailed && (
                <a
                  href={previewProofRecord.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-small btn-primary-small"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', background: '#2563eb', color: '#fff', fontWeight: '600' }}
                >
                  <ExternalLink size={14} /> Open Attachment
                </a>
              )}
              <button
                onClick={() => setPreviewProofRecord(null)}
                className="btn-small btn-outline-small"
                style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
