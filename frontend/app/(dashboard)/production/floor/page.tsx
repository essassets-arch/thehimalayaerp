'use client';

import React, { useEffect, useState, useMemo } from 'react';
import PaginationControl from '@/shared/components/PaginationControl';
import { 
  Play, 
  CheckCircle2, 
  Search, 
  RotateCcw, 
  AlertCircle, 
  Timer, 
  Building2, 
  Boxes, 
  Clock, 
  Eye, 
  Factory,
  Check,
  History,
  Activity,
  CalendarCheck,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { backendFetch } from '@/lib/backendFetch';
import OrderDetailsModal from '@/shared/components/OrderDetailsModal';
import styles from './floor.module.css';

interface FloorWorkOrder {
  id: string;
  workOrderNumber: string;
  orderNo?: string;
  orderNumber?: string;
  productionPlan?: {
    planNumber?: string;
    salesOrderId?: string;
    salesOrder?: {
      orderNumber?: string;
      customer?: {
        name?: string;
        companyName?: string;
      };
    };
  };
  salesOrderItem?: {
    productNameSnapshot?: string;
    product?: {
      name?: string;
      sku?: string;
    };
  };
  productName?: string;
  product?: string;
  productCode?: string;
  quantity?: number;
  quantityProduced?: number;
  producedQty?: number;
  startedAt?: string;
  lastStartedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: any;
  workflowState?: {
    name?: string;
    code?: string;
  } | null;
  status?: string;
  priority?: string;
  customerName?: string;
}

interface GroupedFloorOrder {
  orderKey: string;
  salesOrderNumber: string;
  customerName: string;
  items: FloorWorkOrder[];
  totalQty: number;
  activeCount: number;
  completedCount: number;
  longestDurationMs: number;
  matchedSalesOrder?: any;
}

export default function ProductionFloorPage() {
  const [allJobs, setAllJobs] = useState<FloorWorkOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Real-time live timer ticking every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchJobs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefetching(true);

      const [woData, soData] = await Promise.allSettled([
        backendFetch<FloorWorkOrder[]>('/api/backend/production/work-orders'),
        backendFetch<any[]>('/api/backend/sales/orders?page=1&pageSize=200')
      ]);

      if (woData.status === 'fulfilled' && Array.isArray(woData.value)) {
        setAllJobs(woData.value);
      }
      if (soData.status === 'fulfilled') {
        const rawSo = soData.value;
        setSalesOrders(Array.isArray(rawSo) ? rawSo : (rawSo as any)?.data || []);
      }
    } catch (err: any) {
      toast.error('Failed to load production floor');
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => { 
    setIsClient(true);
    fetchJobs();
  }, []);

  // Rework helper
  const isReworkJob = (wo: any) => {
    return (
      Boolean(wo.reworkCount && Number(wo.reworkCount) > 0) ||
      wo.productionStatus === 'REWORK_IN_PROGRESS' ||
      wo.productionStatus === 'QC_FAILED' ||
      wo.status === 'REWORK_IN_PROGRESS' ||
      wo.status === 'QC_FAILED' ||
      wo.workflowState?.code === 'REWORK_IN_PROGRESS' ||
      Boolean(wo.failureReason)
    );
  };

  // Classify active vs completed/history jobs
  const isJobActive = (wo: FloorWorkOrder) => {
    if (isReworkJob(wo) && (wo as any).productionStatus === 'REWORK_IN_PROGRESS') {
      return true;
    }
    const status = String(wo.workflowState?.name || wo.workflowState?.code || wo.status || '').toUpperCase();
    return [
      'IN_PROGRESS', 
      'IN PRODUCTION', 
      'STARTED', 
      'PRODUCTION_STARTED', 
      'RUNNING', 
      'REWORK_IN_PROGRESS', 
      'REWORK'
    ].includes(status);
  };

  const isJobCompleted = (wo: FloorWorkOrder) => {
    const status = String(wo.workflowState?.name || wo.workflowState?.code || wo.status || '').toUpperCase();
    return (
      [
        'COMPLETED', 
        'DONE', 
        'PRODUCTION_COMPLETED', 
        'QC_PENDING', 
        'QC_PASSED', 
        'QC_FAILED', 
        'CLOSED'
      ].includes(status) || 
      status.includes('COMPLETE') || 
      status.includes('QC')
    );
  };

  // Resolve product name helper
  const getProductName = (job: any) => {
    return (
      job.salesOrderItem?.productNameSnapshot ||
      job.salesOrderItem?.product?.name ||
      job.productName ||
      job.product ||
      'FRP High Grade Product'
    );
  };

  // Format Duration with live second-by-second counting
  const formatDuration = (job: FloorWorkOrder, isHistory = false) => {
    const startTimeStr = job.startedAt || job.lastStartedAt || job.notes?.startTime || job.updatedAt || job.createdAt;
    if (!startTimeStr) {
      return {
        label: isHistory ? 'Completed' : '⏱️ 00m 00s',
        subtext: isHistory ? 'Quick Finish' : 'Just Started',
        badgeClass: styles.durationMinutes,
        tooltip: 'Work started recently'
      };
    }

    const start = new Date(startTimeStr).getTime();
    const end = isHistory && (job.completedAt || job.updatedAt) 
      ? new Date(job.completedAt || job.updatedAt!).getTime() 
      : currentTime;

    const diffMs = Math.max(0, end - start);
    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    const pad = (n: number) => String(n).padStart(2, '0');

    if (isHistory) {
      if (days === 0 && totalHours === 0) {
        return {
          label: `✓ ${Math.max(1, totalMinutes)} Mins`,
          subtext: 'Total Floor Time',
          badgeClass: styles.durationCompleted,
          tooltip: `Completed in ${totalMinutes} minutes`
        };
      } else if (days === 0) {
        return {
          label: `✓ ${hours}h ${minutes}m`,
          subtext: `${totalMinutes} Mins Total`,
          badgeClass: styles.durationCompleted,
          tooltip: `Total time: ${totalMinutes} mins`
        };
      } else {
        return {
          label: `✓ ${days}d ${hours}h`,
          subtext: `${totalMinutes.toLocaleString()} Mins Total`,
          badgeClass: styles.durationCompleted,
          tooltip: `Total time: ${days} days, ${hours} hours`
        };
      }
    }

    if (days === 0 && totalHours === 0) {
      return {
        label: `⏱️ ${pad(minutes)}m ${pad(seconds)}s`,
        subtext: `${totalMinutes} Mins elapsed`,
        badgeClass: styles.durationMinutes,
        tooltip: `Started: ${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
      };
    }

    if (days === 0) {
      return {
        label: `⏱️ ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
        subtext: `${totalMinutes} Mins`,
        badgeClass: styles.durationHours,
        tooltip: `Started: ${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
      };
    }

    return {
      label: `⏱️ ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
      subtext: `${days} Day${days === 1 ? '' : 's'} (${totalMinutes.toLocaleString()}m)`,
      badgeClass: styles.durationDays,
      tooltip: `Total: ${totalMinutes.toLocaleString()} minutes`
    };
  };

  // Group work orders by Sales Order
  const groupJobsByOrder = (jobs: FloorWorkOrder[]) => {
    const groups: Record<string, GroupedFloorOrder> = {};

    jobs.forEach((job: any) => {
      const soNumber =
        job.productionPlan?.salesOrder?.orderNumber ||
        job.salesOrder?.orderNumber ||
        job.orderNo ||
        job.orderNumber ||
        '';

      const matchedSO = salesOrders.find((so: any) =>
        String(so.orderNumber || so.orderNo || so.id) === String(soNumber) ||
        String(so.id) === String(job.productionPlan?.salesOrderId)
      );

      const resolvedSoNumber = soNumber || matchedSO?.orderNumber || (job.workOrderNumber ? `SO-2026-${job.workOrderNumber.replace(/\D/g, '').slice(-5).padStart(5, '0')}` : 'SO-2026-00001');

      const customerName =
        job.customerName ||
        job.productionPlan?.salesOrder?.customer?.companyName ||
        matchedSO?.customerName ||
        matchedSO?.customer?.companyName ||
        matchedSO?.customer?.name ||
        'Standard Production';

      const enrichedJob = {
        ...job,
        resolvedSoNumber,
        resolvedCustomer: customerName,
        matchedSalesOrder: matchedSO
      };

      if (!groups[resolvedSoNumber]) {
        groups[resolvedSoNumber] = {
          orderKey: resolvedSoNumber,
          salesOrderNumber: resolvedSoNumber,
          customerName,
          items: [],
          totalQty: 0,
          activeCount: 0,
          completedCount: 0,
          longestDurationMs: 0,
          hasRework: false,
          matchedSalesOrder: matchedSO || job.productionPlan?.salesOrder
        };
      }

      groups[resolvedSoNumber].items.push(enrichedJob);
      groups[resolvedSoNumber].totalQty += Number(job.quantity || 1);

      if (isReworkJob(job)) {
        groups[resolvedSoNumber].hasRework = true;
      }

      if (isJobActive(job)) groups[resolvedSoNumber].activeCount++;
      if (isJobCompleted(job)) groups[resolvedSoNumber].completedCount++;

      const startMs = job.startedAt ? new Date(job.startedAt).getTime() : Date.now();
      const diff = Math.max(0, currentTime - startMs);
      if (diff > groups[resolvedSoNumber].longestDurationMs) {
        groups[resolvedSoNumber].longestDurationMs = diff;
      }
    });

    return Object.values(groups);
  };

  const activeJobs = useMemo(() => allJobs.filter(isJobActive), [allJobs]);
  const historyJobs = useMemo(() => allJobs.filter(isJobCompleted), [allJobs]);

  const displayedJobsList = activeTab === 'ACTIVE' ? activeJobs : historyJobs;

  // Filtered grouped orders
  const groupedOrders = useMemo(() => {
    const allGrouped = groupJobsByOrder(displayedJobsList);
    if (!searchQuery.trim()) return allGrouped;
    const q = searchQuery.toLowerCase().trim();

    return allGrouped.filter(group => {
      const matchHeader =
        group.salesOrderNumber.toLowerCase().includes(q) ||
        group.customerName.toLowerCase().includes(q);

      const matchItem = group.items.some(job =>
        (job.workOrderNumber || '').toLowerCase().includes(q) ||
        getProductName(job).toLowerCase().includes(q)
      );

      return matchHeader || matchItem;
    });
  }, [displayedJobsList, salesOrders, searchQuery, currentTime]);

  const paginatedGroupedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return groupedOrders.slice(start, start + pageSize);
  }, [groupedOrders, currentPage, pageSize]);

  const handleOpenOrderModal = (group: GroupedFloorOrder) => {
    const itemsList = group.items.map((job, index) => ({
      name: getProductName(job),
      code: job.productCode || `P-FRP-0${index + 1}`,
      qty: Number(job.quantity || 1),
      rate: 2500,
      gst: 18,
      total: Number(job.quantity || 1) * 2500
    }));

    const mapped = {
      orderNo: group.salesOrderNumber,
      customerName: group.customerName,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'In Production',
      productionStatus: 'In Production',
      dispatchStatus: 'Pending',
      items: itemsList
    };
    setSelectedOrderForModal(mapped);
  };

  const handleOpenItemModal = (job: FloorWorkOrder) => {
    const rawSo = (job as any).resolvedSoNumber || job.productionPlan?.salesOrder?.orderNumber || job.workOrderNumber;
    const customerName = (job as any).resolvedCustomer || job.productionPlan?.salesOrder?.customer?.companyName || 'Standard Production';

    const mapped = {
      ref: rawSo,
      orderNo: rawSo,
      customerName,
      date: new Date().toLocaleDateString('en-GB'),
      status: job.status || 'In Production',
      productionStatus: job.status || 'In Production',
      dispatchStatus: 'Pending',
      items: [
        {
          name: getProductName(job),
          code: job.productCode || 'PRD-01',
          qty: Number(job.quantity || 1),
          rate: 2500,
          gst: 18,
          total: Number(job.quantity || 1) * 2500
        }
      ]
    };
    setSelectedOrderForModal(mapped);
  };

  const handleComplete = async (job: FloorWorkOrder) => {
    const jobId = job.id;
    const woNumber = job.workOrderNumber || job.id;

    const confirmation = await Swal.fire({
      title: 'Complete Work Order?',
      text: `Mark work order #${woNumber} (${getProductName(job)}) as Complete and send it to Quality Control (QC)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete Job',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
    });

    if (!confirmation.isConfirmed) return;

    setCompletingId(jobId);
    try {
      await backendFetch(`/api/backend/production/work-orders/${jobId}/complete`, { 
        method: 'POST',
        body: { remarks: 'Completed on production floor' }
      });
      await fetchJobs(true);
      await Swal.fire({
        icon: 'success',
        title: 'Sent to QC!',
        text: `Work order #${woNumber} has been moved to Quality Testing.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Complete',
        text: err.message || 'Could not complete work order.',
      });
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <main className={styles.floorPage}>
      {/* ── Top Header Bar ── */}
      <div className={styles.headerContainer}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span className={styles.liveTag}>
              <span className={styles.pulseGreenDot} /> Live Production Floor
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
              • {activeJobs.length} active jobs running
            </span>
          </div>
          <h1 className={styles.pageTitle}>Shop Floor Execution</h1>
          <p className={styles.pageSubtitle}>
            Live real-time monitoring of running manufacturing orders and multi-product batch execution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchJobs(true)}
            className={styles.btnRefresh}
            title="Refresh Floor"
          >
            <RotateCcw size={14} className={isRefetching ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Control Bar (Active/History & Search) ── */}
      <div className={styles.controlBar}>
        <div className={styles.tabGroupScrollWrapper}>
          <div className={styles.tabGroup}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'ACTIVE' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('ACTIVE')}
            >
              <Activity size={14} /> Active Floor ({activeJobs.length})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'HISTORY' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('HISTORY')}
            >
              <History size={14} /> Completed History ({historyJobs.length})
            </button>
          </div>
        </div>

        <div className={styles.searchBox}>
          <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder={activeTab === 'ACTIVE' ? "Search Order #, Customer, Product..." : "Search completed history..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '0 4px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Main Floor Content ── */}
      {!isClient || loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>Loading production floor...</span>
        </div>
      ) : groupedOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <Boxes size={38} color="#94a3b8" />
          <span style={{ fontWeight: '700', fontSize: '15px', color: '#334155' }}>
            {activeTab === 'ACTIVE' ? 'No active jobs on floor' : 'No history found'}
          </span>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {searchQuery ? 'Try adjusting your search criteria.' : 'All production jobs have been completed or none are currently running.'}
          </p>
        </div>
      ) : (
        <div className={styles.orderWiseContainer}>
          {paginatedGroupedOrders.map((group) => {
            const isHistory = activeTab === 'HISTORY';
            return (
              <section key={group.orderKey} className={styles.orderCard}>
                {/* ── Order Header (Highlighted) ── */}
                <div className={styles.orderCardHeader}>
                  <div className={styles.orderHeaderLeft}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span
                        className={styles.soLink}
                        onClick={() => handleOpenOrderModal(group)}
                        title="Click to view full sales order details"
                      >
                        {group.salesOrderNumber}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} color="#94a3b8" />
                        <strong style={{ color: '#0f172a' }}>{group.customerName}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {group.hasRework && (
                        <span className={styles.badgeReworkOrder}>
                          🔁 REWORK ORDER
                        </span>
                      )}
                      <span className={`${styles.orderChip} ${styles.chipBlue}`}>
                        <Package size={12} /> {group.items.length} {group.items.length === 1 ? 'Product' : 'Products in this Order'}
                      </span>
                      <span className={`${styles.orderChip} ${styles.chipEmerald}`}>
                        <Boxes size={12} /> {group.totalQty} Units on Floor
                      </span>
                      {!isHistory && (
                        <span className={`${styles.orderChip} ${styles.chipAmber}`}>
                          <Timer size={12} /> Live Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.orderHeaderRight}>
                    <button
                      type="button"
                      className={styles.btnTerminal}
                      onClick={() => handleOpenOrderModal(group)}
                    >
                      <Eye size={13} /> Order Details
                    </button>
                  </div>
                </div>

                {/* ── 1. Desktop Products Table ── */}
                <div className={styles.desktopProductsTableWrapper}>
                  <table className={styles.orderProductsTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                        <th>Product Item & Specifications</th>
                        <th style={{ width: '150px' }}>Work Order #</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Floor Qty</th>
                        <th style={{ width: '170px', textAlign: 'center' }}>Live Duration</th>
                        <th style={{ width: '150px', textAlign: 'center' }}>Status</th>
                        <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((job, idx) => {
                        const durationInfo = formatDuration(job, isHistory);
                        const isRework = (job.workflowState?.name || job.status) === 'REWORK_IN_PROGRESS' || isReworkJob(job);

                        return (
                          <tr key={job.id || idx} className={styles.orderProductRow}>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#94a3b8', fontSize: '12px' }}>
                              {idx + 1}
                            </td>

                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                                  {getProductName(job)}
                                </span>
                                {isReworkJob(job) && (
                                  <span className={styles.badgeReworkItem} title={`Rework Required: ${(job as any).failureReason || 'QC Rejection'}`}>
                                    🔁 REWORK {(job as any).reworkCount ? `#${(job as any).reworkCount}` : ''}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '1px' }}>
                                {job.productCode && (
                                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                    SKU: {job.productCode}
                                  </span>
                                )}
                                {(job as any).failureReason && isReworkJob(job) && (
                                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                                    ⚠️ Defect: {(job as any).failureReason}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span className={styles.woBadge} style={{ fontSize: '11.5px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', width: 'fit-content' }}>
                                  {job.workOrderNumber || `WO-${job.id.slice(0, 8)}`}
                                </span>
                                {isReworkJob(job) && (
                                  <span className={styles.badgeReworkItem} style={{ width: 'fit-content', fontSize: '10.5px' }}>
                                    🔁 REWORK {(job as any).reworkCount ? `#${(job as any).reworkCount}` : ''}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <div className={styles.qtyBadge}>
                                {job.quantity || 1} <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', marginLeft: '3px' }}>UNITS</span>
                              </div>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <div className={durationInfo.badgeClass} title={durationInfo.tooltip}>
                                  <span>{durationInfo.label}</span>
                                </div>
                                {durationInfo.subtext && (
                                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>
                                    {durationInfo.subtext}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              {isHistory ? (
                                <span className={styles.badgeCompleted}>
                                  <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                                  ✓ Ready for QC
                                </span>
                              ) : (
                                <span className={isRework ? styles.badgeRework : styles.badgeInProgress}>
                                  <span className={styles.pulseDot} />
                                  {isRework ? 'REWORK' : 'IN PRODUCTION'}
                                </span>
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className={styles.btnTerminal}
                                  style={{ padding: '5px 10px', fontSize: '11.5px' }}
                                  onClick={() => handleOpenItemModal(job)}
                                >
                                  <Eye size={12} /> View
                                </button>

                                {!isHistory && (
                                  <button
                                    type="button"
                                    onClick={() => handleComplete(job)}
                                    disabled={completingId === job.id}
                                    className={styles.btnComplete}
                                    style={{ padding: '5px 12px', fontSize: '11.5px' }}
                                  >
                                    <CheckCircle2 size={12} />
                                    {completingId === job.id ? 'Sending…' : 'Complete'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── 2. Mobile List-Wise Products View ── */}
                <div className={styles.mobileProductsListWrapper}>
                  {group.items.map((job, idx) => {
                    const durationInfo = formatDuration(job, isHistory);
                    const isRework = (job.workflowState?.name || job.status) === 'REWORK_IN_PROGRESS' || isReworkJob(job);

                    return (
                      <div key={job.id || idx} className={styles.mobileProductListItem}>
                        {/* Top: Product Name + SKU + Quantity */}
                        <div className={styles.mobileProductItemTop}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
                                #{idx + 1}
                              </span>
                              <span className={styles.woBadge} style={{ fontSize: '11px', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                                {job.workOrderNumber || `WO-${job.id.slice(0, 8)}`}
                              </span>
                              {isReworkJob(job) && (
                                <span className={styles.badgeReworkItem} style={{ fontSize: '10px', padding: '1px 5px' }}>
                                  🔁 REWORK {(job as any).reworkCount ? `#${(job as any).reworkCount}` : ''}
                                </span>
                              )}
                            </div>
                            <div className={styles.mobileProductItemName} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{getProductName(job)}</span>
                              {isReworkJob(job) && (
                                <span className={styles.badgeReworkItem} title={`Rework Required: ${(job as any).failureReason || 'QC Rejection'}`}>
                                  🔁 REWORK {(job as any).reworkCount ? `#${(job as any).reworkCount}` : ''}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '1px' }}>
                              {job.productCode && (
                                <div className={styles.mobileProductItemSku}>
                                  SKU: {job.productCode}
                                </div>
                              )}
                              {(job as any).failureReason && isReworkJob(job) && (
                                <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                                  ⚠️ Defect: {(job as any).failureReason}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.qtyBadgeMobile} style={{ flexShrink: 0 }}>
                            {job.quantity || 1} <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1' }}>UNITS</span>
                          </div>
                        </div>

                        {/* Duration Pill for Mobile */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div className={durationInfo.badgeClass} style={{ fontSize: '11px', padding: '3px 8px' }}>
                            <span>{durationInfo.label}</span>
                          </div>
                          {durationInfo.subtext && (
                            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                              • {durationInfo.subtext}
                            </span>
                          )}
                        </div>

                        {/* Bottom: Status Badge + Action Buttons */}
                        <div className={styles.mobileProductItemFooter}>
                          <div style={{ flexShrink: 0 }}>
                            {isHistory ? (
                              <span className={styles.badgeCompleted} style={{ fontSize: '10.5px', padding: '3px 7px' }}>
                                ✓ Ready for QC
                              </span>
                            ) : (
                              <span className={isRework ? styles.badgeRework : styles.badgeInProgress} style={{ fontSize: '10.5px', padding: '3px 7px' }}>
                                <span className={styles.pulseDot} />
                                {isRework ? 'REWORK' : 'IN PRODUCTION'}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className={styles.btnTerminalMobile}
                              onClick={() => handleOpenItemModal(job)}
                            >
                              <Eye size={12} /> Details
                            </button>

                            {!isHistory && (
                              <button
                                type="button"
                                onClick={() => handleComplete(job)}
                                disabled={completingId === job.id}
                                className={styles.btnCompleteMobile}
                              >
                                <CheckCircle2 size={12} />
                                {completingId === job.id ? 'Sending…' : 'Complete'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <PaginationControl
            currentPage={currentPage}
            totalPages={Math.ceil(groupedOrders.length / pageSize) || 1}
            totalItems={groupedOrders.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          role="production"
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}
    </main>
  );
}
