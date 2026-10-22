'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Truck,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  X,
  Package,
  ShieldCheck,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import PaginationControl from '../../../shared/components/PaginationControl';
import FinanceOrderDetailsModal from './FinanceOrderDetailsModal';
import FinanceQuotationModal from './FinanceQuotationModal';
import styles from './FinanceReadyForDispatchView.module.css';

const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const formatDate = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function FinanceReadyForDispatchView() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalReady: 0,
    stagedCount: 0,
    dispatchedCount: 0,
    inTransitCount: 0,
    deliveredCount: 0,
    totalValueINR: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [quotationModal, setQuotationModal] = useState({
    isOpen: false,
    quotation: null,
    salesOrderNumber: null,
    customerName: null,
    loading: false,
  });

  // Fetch Orders
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await backendFetch(`/api/backend/finance/ready-for-dispatch?${params.toString()}`, {
        cacheTtlMs: 0,
      });

      if (res && res.success) {
        setOrders(Array.isArray(res.data) ? res.data : []);
        if (res.summary) {
          setSummary(res.summary);
        }
        if (res.pagination) {
          setTotalItems(res.pagination.totalItems || 0);
          setTotalPages(res.pagination.totalPages || 1);
        }
      } else {
        throw new Error(res?.message || 'Failed to retrieve ready-for-dispatch orders');
      }
    } catch (err) {
      console.error('Failed to fetch ready for dispatch orders:', err);
      setError(err.message || 'Unable to connect to Finance Ready for Dispatch API. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, startDate, endDate, page, limit]);

  // Initial load and on filter changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page to 1 when filters change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Open Quotation handler with immediate render and live fetch enhancement
  const handleOpenQuotation = async (order) => {
    if (!order) return;

    const qId = order.quotationId || order.quotation?.id;
    const initialQuotation = order.quotation || null;

    setQuotationModal({
      isOpen: true,
      quotation: initialQuotation,
      salesOrderNumber: order.salesOrderNumber,
      customerName: order.customerName,
      loading: Boolean(qId && !initialQuotation),
    });

    if (qId) {
      try {
        const quoteRes = await backendFetch(`/api/backend/quotations/${qId}`, {
          cacheTtlMs: 0,
        });
        const quoteData = quoteRes?.data || quoteRes;
        if (quoteData && typeof quoteData === 'object' && (quoteData.id || quoteData.quotationNumber)) {
          setQuotationModal((prev) => ({
            ...prev,
            quotation: {
              ...(initialQuotation || {}),
              ...quoteData,
            },
            loading: false,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch linked full quotation from API, using embedded fallback:', err);
        setQuotationModal((prev) => ({ ...prev, loading: false }));
      }
    }
  };

  const renderStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className={styles.badgeDelivered}>
          <CheckCircle2 size={12} /> Delivered
        </span>
      );
    }
    if (s === 'IN_TRANSIT') {
      return (
        <span className={styles.badgeInTransit}>
          <Truck size={12} /> In Transit
        </span>
      );
    }
    if (s === 'DISPATCHED') {
      return (
        <span className={styles.badgeDispatched}>
          <Truck size={12} /> Dispatched
        </span>
      );
    }
    return (
      <span className={styles.badgeStaged}>
        <Clock size={12} /> Staged
      </span>
    );
  };

  return (
    <div className={styles.page}>
      {/* ─── Hero Header ─── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <Truck size={28} />
        </div>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            <span>Finance & Operations Integration</span>
            <span className={styles.readOnlyTag}>READ ONLY</span>
          </div>
          <h1>Ready for Dispatch Orders</h1>
          <p>
            Authoritative visibility of production orders dispatched or staged for dispatch. Verified against live production and sales order records.
          </p>
        </div>

        {/* Operational Metrics Badges */}
        <div className={styles.summaryBadges}>
          <div className={styles.summaryBadge}>
            <div style={{ color: '#0284c7' }}>
              <Package size={20} />
            </div>
            <div>
              <strong>{summary.totalReady || 0}</strong>
              <div><span>Total Staged / Dispatched</span></div>
            </div>
          </div>

          <div className={styles.summaryBadge}>
            <div style={{ color: '#16a34a' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <strong>{formatINR(summary.totalValueINR || 0)}</strong>
              <div><span>Total Order Value</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Panel ─── */}
      <div className={styles.panel}>
        {/* ─── Toolbar Filters ─── */}
        <div className={styles.toolbar}>
          <div className={styles.filterRowTop}>
            {/* Search Box */}
            <div className={styles.searchBox}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by Sales Order #, Quotation #, or Customer..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setPage(1); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className={styles.filterControls}>
              {/* Status Select */}
              <div className={styles.selectWrapper}>
                <Filter size={14} color="#64748b" />
                <select value={statusFilter} onChange={handleStatusChange} aria-label="Filter by dispatch status">
                  <option value="ALL">All Statuses</option>
                  <option value="STAGED">Staged for Dispatch</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              {/* Date From */}
              <div className={styles.dateInputWrapper}>
                <span>From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  aria-label="Filter start date"
                />
              </div>

              {/* Date To */}
              <div className={styles.dateInputWrapper}>
                <span>To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  aria-label="Filter end date"
                />
              </div>

              {/* Clear Filters */}
              {(search || statusFilter !== 'ALL' || startDate || endDate) && (
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={handleClearFilters}
                  title="Reset all filters"
                >
                  Reset Filters
                </button>
              )}

              {/* Refresh Button */}
              <button
                type="button"
                className={`${styles.btnAction} ${styles.btnRefresh}`}
                onClick={() => fetchOrders(true)}
                disabled={refreshing || loading}
                title="Refresh from backend"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Error State ─── */}
        {error && (
          <div className={styles.errorState}>
            <AlertCircle size={24} style={{ margin: '0 auto 6px' }} />
            <h3>Unable to Load Records</h3>
            <p>{error}</p>
            <button
              type="button"
              className={styles.btnAction}
              onClick={() => fetchOrders(false)}
            >
              Retry
            </button>
          </div>
        )}

        {/* ─── Table Section ─── */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.srNo}>Sr. No.</th>
                <th>Sales Order No.</th>
                <th>Customer Name</th>
                <th>Quotation No.</th>
                <th>Order Date</th>
                <th>Dispatch-Ready Date</th>
                <th>Order Amount</th>
                <th>Dispatch Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`}>
                    <td colSpan={9}>
                      <div className={styles.skeletonRow} />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className={styles.emptyState}>
                      <Package size={36} color="#94a3b8" />
                      <h3>No Ready-for-Dispatch Orders Found</h3>
                      <p>
                        {search || statusFilter !== 'ALL' || startDate || endDate
                          ? 'No dispatched production orders match your filter criteria. Try resetting filters.'
                          : 'When production orders are sent to dispatch from the Production module, they will automatically appear here for Finance view-only tracking.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => {
                  const srNo = (page - 1) * limit + idx + 1;
                  return (
                    <tr key={order.id || order.orderKey || idx}>
                      {/* 1. Sr. No. */}
                      <td className={styles.srNo}>{srNo}</td>

                      {/* 2. Sales Order No. */}
                      <td>
                        <span
                          className={styles.soRef}
                          onClick={() => setSelectedOrder(order)}
                          title="View order details"
                        >
                          {order.salesOrderNumber || '—'}
                        </span>
                      </td>

                      {/* 3. Customer Name */}
                      <td>
                        <div className={styles.customerName} title={order.customerName}>
                          {order.customerName || '—'}
                        </div>
                      </td>

                      {/* 4. Quotation No. */}
                      <td>
                        {order.quotationNumber ? (
                          <span
                            className={styles.quotationRef}
                            onClick={() => handleOpenQuotation(order)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view quotation"
                          >
                            {order.quotationNumber}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* 5. Order Date */}
                      <td className={styles.dateCell}>
                        {formatDate(order.orderDate)}
                      </td>

                      {/* 6. Dispatch-Ready Date */}
                      <td className={styles.dateCell}>
                        {formatDate(order.dispatchReadyDate)}
                      </td>

                      {/* 7. Order Amount */}
                      <td className={styles.amountCell}>
                        {formatINR(order.orderAmount)}
                      </td>

                      {/* 8. Dispatch Status */}
                      <td>{renderStatusBadge(order.dispatchStatus)}</td>

                      {/* 9. Actions */}
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            type="button"
                            className={styles.btnViewDetails}
                            onClick={() => setSelectedOrder(order)}
                            title="View order details"
                          >
                            <Eye size={13} />
                            Details
                          </button>

                          {order.quotationNumber ? (
                            <button
                              type="button"
                              className={styles.btnViewQuotation}
                              onClick={() => handleOpenQuotation(order)}
                              title="View original quotation"
                            >
                              <FileText size={13} />
                              Quotation
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={styles.btnViewQuotationDisabled}
                              disabled
                              title="No quotation linked to this order"
                            >
                              <FileText size={13} />
                              —
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

        {/* ─── Pagination Control ─── */}
        {totalItems > 0 && (
          <PaginationControl
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={limit}
            pageSizeOptions={[10, 25, 50, 100]}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
            themeColor="#0284c7"
          />
        )}
      </div>

      {/* ─── Order Details Modal (Read-Only) ─── */}
      {selectedOrder && (
        <FinanceOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOpenQuotation={(ord) => {
            setSelectedOrder(null);
            handleOpenQuotation(ord);
          }}
        />
      )}

      {/* ─── Quotation Modal (Read-Only) ─── */}
      {quotationModal.isOpen && (
        <FinanceQuotationModal
          quotation={quotationModal.quotation}
          salesOrderNumber={quotationModal.salesOrderNumber}
          customerName={quotationModal.customerName}
          loading={quotationModal.loading}
          onClose={() =>
            setQuotationModal({
              isOpen: false,
              quotation: null,
              salesOrderNumber: null,
              customerName: null,
              loading: false,
            })
          }
        />
      )}
    </div>
  );
}
