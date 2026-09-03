'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PaginationControl from '@/shared/components/PaginationControl';
import {
  ClipboardCheck,
  Search,
  Download,
  Clock,
  Package,
  CheckCircle2,
  Building2,
  Eye,
  RefreshCw,
  X,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import styles from './completed.module.css';

interface WorkOrder {
  id: string;
  workOrderNumber?: string;
  orderNo?: string;
  orderNumber?: string;
  productionPlan?: {
    salesOrder?: {
      orderNumber?: string;
      customer?: { companyName: string };
    };
  };
  salesOrderItem?: {
    productNameSnapshot?: string;
    product?: { name?: string; code?: string; size?: string; capacity?: string };
  } | null;
  productName?: string;
  quantity?: number;
  producedQuantity?: number;
  producedQty?: number;
  status?: string;
  workflowStatus?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  duration?: number | null;
  completedById?: string | null;
  operatorName?: string | null;
  supervisorName?: string | null;
  machineId?: string | null;
  batchNumber?: string | null;
  notes?: any;
  customerName?: string;
  workflowState?: { name: string; code?: string } | null;
}

export default function CompletedOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'QC_PENDING' | 'QC_PASSED' | 'DISPATCHED'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['work-orders-completed-rich'],
    queryFn: async () => {
      const [woRes, soRes] = await Promise.allSettled([
        backendFetch<WorkOrder[]>('/api/backend/production/work-orders'),
        backendFetch<any[]>('/api/backend/sales/orders?page=1&pageSize=200')
      ]);

      const rawWorkOrders = woRes.status === 'fulfilled' && Array.isArray(woRes.value) ? woRes.value : [];
      const rawSalesOrders = soRes.status === 'fulfilled'
        ? (Array.isArray(soRes.value) ? soRes.value : soRes.value?.data || [])
        : [];

      // Filter to completed manufacturing batches
      const completedList = rawWorkOrders.filter((wo: any) => {
        const s = String(wo.status || wo.workflowStatus || wo.workflowState?.code || '').toUpperCase();
        return (
          wo.completedAt != null ||
          ['COMPLETED', 'PRODUCTION_COMPLETED', 'QC_PENDING', 'QC_PASSED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED', 'CLOSED'].includes(s)
        );
      });

      // Enrich with sales order metadata if available
      return completedList.map((wo: any) => {
        const soNumber =
          wo.productionPlan?.salesOrder?.orderNumber ||
          wo.salesOrder?.orderNumber ||
          wo.orderNo ||
          wo.orderNumber ||
          '';

        const matchedSO = rawSalesOrders.find((so: any) =>
          String(so.orderNumber || so.orderNo || so.id) === String(soNumber) ||
          String(so.id) === String(wo.productionPlan?.salesOrderId)
        );

        const customerName =
          wo.customerName ||
          wo.productionPlan?.salesOrder?.customer?.companyName ||
          matchedSO?.customerName ||
          matchedSO?.customer?.companyName ||
          matchedSO?.customer?.name ||
          '—';

        const productName =
          wo.salesOrderItem?.productNameSnapshot ||
          wo.salesOrderItem?.product?.name ||
          wo.productName ||
          matchedSO?.items?.[0]?.productNameSnapshot ||
          'Custom FRP Product';

        return {
          ...wo,
          resolvedSoNumber: soNumber || matchedSO?.orderNumber || `SO-${wo.id.slice(0, 6).toUpperCase()}`,
          resolvedCustomer: customerName,
          resolvedProductName: productName
        };
      });
    }
  });

  // Filter logic
  const filteredData = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.filter((wo: any) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (wo.workOrderNumber || wo.id || '').toLowerCase().includes(q) ||
        (wo.resolvedSoNumber || '').toLowerCase().includes(q) ||
        (wo.resolvedCustomer || '').toLowerCase().includes(q) ||
        (wo.resolvedProductName || '').toLowerCase().includes(q);

      // Status tab
      const statusUpper = String(wo.status || wo.workflowStatus || wo.workflowState?.code || '').toUpperCase();
      let matchStatus = true;
      if (statusFilter === 'QC_PENDING') {
        matchStatus = statusUpper.includes('QC_PENDING') || statusUpper.includes('COMPLETED') || statusUpper === 'TESTING';
      } else if (statusFilter === 'QC_PASSED') {
        matchStatus = statusUpper.includes('QC_PASSED') || statusUpper.includes('APPROVED') || statusUpper.includes('READY_FOR_DISPATCH');
      } else if (statusFilter === 'DISPATCHED') {
        matchStatus = statusUpper.includes('DISPATCH') || statusUpper.includes('DELIVERED') || statusUpper === 'CLOSED';
      }

      // Date filter
      let matchDate = true;
      if (dateFilter !== 'ALL' && wo.completedAt) {
        const compDate = new Date(wo.completedAt);
        const now = new Date();
        if (dateFilter === 'TODAY') {
          matchDate = compDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchDate = compDate >= sevenDaysAgo;
        } else if (dateFilter === 'MONTH') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchDate = compDate >= thirtyDaysAgo;
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [data, search, statusFilter, dateFilter]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const totalBatches = list.length;
    const totalUnits = list.reduce((sum, wo) => sum + Number(wo.producedQuantity ?? wo.producedQty ?? wo.quantity ?? 0), 0);

    const durations = list.map(wo => Number(wo.duration)).filter(d => !isNaN(d) && d > 0);
    const avgDurationMins = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 135;
    const avgHours = Math.floor(avgDurationMins / 60);
    const avgMins = avgDurationMins % 60;

    const qcPendingCount = list.filter((wo: any) => {
      const s = String(wo.status || wo.workflowStatus || '').toUpperCase();
      return s.includes('QC_PENDING') || s.includes('COMPLETED') || s === 'TESTING';
    }).length;

    const qcPassedCount = list.filter((wo: any) => {
      const s = String(wo.status || wo.workflowStatus || '').toUpperCase();
      return s.includes('QC_PASSED') || s.includes('APPROVED') || s.includes('READY') || s.includes('DISPATCH');
    }).length;

    return {
      totalBatches,
      totalUnits,
      avgDurationStr: `${avgHours}h ${avgMins}m`,
      qcPendingCount,
      qcPassedCount
    };
  }, [data]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['Work Order No', 'Sales Order No', 'Customer', 'Product', 'Produced Qty', 'Started At', 'Completed At', 'Duration (Mins)', 'Status'];
    const rows = filteredData.map((wo: any) => [
      wo.workOrderNumber || wo.id,
      wo.resolvedSoNumber,
      `"${(wo.resolvedCustomer || '').replace(/"/g, '""')}"`,
      `"${(wo.resolvedProductName || '').replace(/"/g, '""')}"`,
      wo.producedQuantity || wo.producedQty || wo.quantity || 0,
      wo.startedAt ? new Date(wo.startedAt).toLocaleString('en-IN') : '—',
      wo.completedAt ? new Date(wo.completedAt).toLocaleString('en-IN') : '—',
      wo.duration || '—',
      wo.workflowState?.name || wo.status || 'COMPLETED'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Completed_Production_Batches_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (wo: any) => {
    const raw = String(wo.workflowState?.code || wo.status || wo.workflowStatus || '').toUpperCase();
    if (raw.includes('QC_PASSED') || raw.includes('APPROVED') || raw.includes('READY_FOR_DISPATCH')) {
      return (
        <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={12} /> QC Approved
        </span>
      );
    }
    if (raw.includes('DISPATCH') || raw.includes('DELIVERED')) {
      return (
        <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          📦 Dispatched
        </span>
      );
    }
    return (
      <span style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        🔍 QC Pending
      </span>
    );
  };

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <ClipboardCheck size={26} />
          </div>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>Manufacturing Archives</span>
            <h1>Completed Production Batches</h1>
            <p>Real-time log of finished work orders, manufactured units, cycle times, and QC clearance.</p>
          </div>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh latest completed data"
          >
            <RefreshCw size={15} className={isRefetching ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
            onClick={handleExportCSV}
            title="Export CSV report"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      {/* ── KPI Grid ── */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#ecfdf5', color: '#059669' }}>
            <ClipboardCheck size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Completed Batches</span>
            <span className={styles.kpiValue}>{metrics.totalBatches}</span>
            <span className={styles.kpiSubtext}>✓ Production Finished</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Package size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Units Produced</span>
            <span className={styles.kpiValue}>{metrics.totalUnits.toLocaleString()}</span>
            <span className={styles.kpiSubtext} style={{ color: '#2563eb' }}>FRP Sets & Slabs</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#faf5ff', color: '#9333ea' }}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Avg Manufacturing Cycle</span>
            <span className={styles.kpiValue}>{metrics.avgDurationStr}</span>
            <span className={styles.kpiSubtext} style={{ color: '#9333ea' }}>Start to Cure Finished</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#fffbeb', color: '#d97706' }}>
            <Layers size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>QC Status</span>
            <span className={styles.kpiValue}>{metrics.qcPassedCount} <small style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>Passed / {metrics.qcPendingCount} Pending</small></span>
            <span className={styles.kpiSubtext} style={{ color: '#d97706' }}>Inspection Flow</span>
          </div>
        </div>
      </section>

      {/* ── Main Data Panel ── */}
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          {/* Status Tabs */}
          <div className={styles.filterPills}>
            <button
              type="button"
              className={`${styles.pill} ${statusFilter === 'ALL' ? styles.pillActive : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Completed ({metrics.totalBatches})
            </button>
            <button
              type="button"
              className={`${styles.pill} ${statusFilter === 'QC_PENDING' ? styles.pillActive : ''}`}
              onClick={() => setStatusFilter('QC_PENDING')}
            >
              🔍 QC Pending ({metrics.qcPendingCount})
            </button>
            <button
              type="button"
              className={`${styles.pill} ${statusFilter === 'QC_PASSED' ? styles.pillActive : ''}`}
              onClick={() => setStatusFilter('QC_PASSED')}
            >
              ✅ QC Approved ({metrics.qcPassedCount})
            </button>
            <button
              type="button"
              className={`${styles.pill} ${statusFilter === 'DISPATCHED' ? styles.pillActive : ''}`}
              onClick={() => setStatusFilter('DISPATCHED')}
            >
              📦 Dispatched
            </button>
          </div>

          <div className={styles.toolbarRight}>
            {/* Date Range Selector */}
            <select
              className={styles.dateSelect}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              aria-label="Filter by completion period"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Completed Today</option>
              <option value="WEEK">Completed This Week</option>
              <option value="MONTH">Completed This Month</option>
            </select>

            {/* Search Input */}
            <label className={styles.search}>
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search WO, SO, Customer, Item..."
                aria-label="Search completed orders"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className={styles.clearBtn} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </label>
          </div>
        </div>

        {/* Table Container */}
        <div className={styles.tableContainer}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#10b981' }} />
              <div className={styles.emptyStateTitle}>Loading Completed Production Batches…</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <ClipboardCheck size={28} />
              </div>
              <div className={styles.emptyStateTitle}>No Completed Batches Found</div>
              <div className={styles.emptyStateText}>
                {search ? `No completed orders match your search "${search}".` : 'No finished work orders recorded in this filter period.'}
              </div>
            </div>
          ) : (
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Sales Order #</th>
                  <th>Customer</th>
                  <th>Product / Specification</th>
                  <th style={{ textAlign: 'center' }}>Produced Qty</th>
                  <th>Manufacturing Time</th>
                  <th>Duration</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((wo: any) => {
                  const startedStr = wo.startedAt ? new Date(wo.startedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
                  const completedStr = wo.completedAt ? new Date(wo.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
                  const durationMins = Number(wo.duration) || 120;
                  const durH = Math.floor(durationMins / 60);
                  const durM = durationMins % 60;
                  const qty = wo.producedQuantity || wo.producedQty || wo.quantity || 1;

                  return (
                    <tr key={wo.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className={styles.orderIdLink} onClick={() => setSelectedOrder(wo)}>
                            {wo.resolvedSoNumber}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                            WO: {wo.workOrderNumber || wo.id.slice(0, 10)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.customerName}>
                          <Building2 size={14} color="#64748b" style={{ flexShrink: 0 }} />
                          <span>{wo.resolvedCustomer}</span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.productName}>{wo.resolvedProductName}</div>
                        <div className={styles.productMeta}>
                          {[wo.salesOrderItem?.product?.size, wo.salesOrderItem?.product?.capacity].filter(Boolean).join(' • ') || 'FRP High Grade'}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={styles.qtyBadge}>
                          {qty.toLocaleString()} SETS
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '12px', color: '#1e293b' }}>
                          <strong>End:</strong> {completedStr}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Start: {startedStr}
                        </div>
                      </td>

                      <td>
                        <span className={styles.durationChip}>
                          <Clock size={11} /> {durH}h {durM}m
                        </span>
                      </td>

                      <td>
                        {renderStatusBadge(wo)}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                            onClick={() => setSelectedOrder(wo)}
                            title="View complete work order & batch passport"
                          >
                            <Eye size={12} />
                            Details
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnQc}`}
                            onClick={() => router.push('/production/qc-pending')}
                            title="Jump to QC inspection queue"
                          >
                            <ExternalLink size={12} />
                            QC Queue
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <PaginationControl
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / pageSize) || 1}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </section>

      {/* ── Order / Work Order Details Modal ── */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>Batch Production Passport</span>
                <h3>Work Order #{selectedOrder.workOrderNumber || selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalField}>
                  <label>Linked Sales Order</label>
                  <span style={{ color: '#2563eb' }}>{selectedOrder.resolvedSoNumber}</span>
                </div>
                <div className={styles.modalField}>
                  <label>Customer Name</label>
                  <span>{selectedOrder.resolvedCustomer}</span>
                </div>
                <div className={styles.modalField}>
                  <label>Manufactured Product</label>
                  <span>{selectedOrder.resolvedProductName}</span>
                </div>
                <div className={styles.modalField}>
                  <label>Produced Quantity</label>
                  <span style={{ color: '#059669' }}>
                    {(selectedOrder.producedQuantity || selectedOrder.producedQty || selectedOrder.quantity || 0).toLocaleString()} SETS
                  </span>
                </div>
                <div className={styles.modalField}>
                  <label>Production Started</label>
                  <span>{selectedOrder.startedAt ? new Date(selectedOrder.startedAt).toLocaleString('en-IN') : '—'}</span>
                </div>
                <div className={styles.modalField}>
                  <label>Production Completed</label>
                  <span>{selectedOrder.completedAt ? new Date(selectedOrder.completedAt).toLocaleString('en-IN') : '—'}</span>
                </div>
                <div className={styles.modalField}>
                  <label>Total Cycle Duration</label>
                  <span>{Math.floor((Number(selectedOrder.duration) || 120) / 60)}h {(Number(selectedOrder.duration) || 120) % 60}m</span>
                </div>
                <div className={styles.modalField}>
                  <label>Quality Clearance Status</label>
                  <span>{renderStatusBadge(selectedOrder)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className={styles.modalField}>
                  <label>Operator & Shift Notes</label>
                  <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                    {typeof selectedOrder.notes === 'string' ? selectedOrder.notes : JSON.stringify(selectedOrder.notes)}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}
                  style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0' }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                  onClick={() => {
                    setSelectedOrder(null);
                    router.push('/production/qc-pending');
                  }}
                >
                  Open QC Queue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
