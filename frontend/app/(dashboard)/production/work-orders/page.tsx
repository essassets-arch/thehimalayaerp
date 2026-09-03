'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Eye, 
  Search, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  RotateCcw,
  Building2,
  Calendar,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List
} from 'lucide-react';
import Swal from 'sweetalert2';

import { backendFetch } from '@/lib/backendFetch';
import OrderDetailsModal from '@/shared/components/OrderDetailsModal';
import styles from './work-orders.module.css';

interface WorkOrder {
  id: string;
  workOrderNumber?: string;
  orderNo?: string;
  orderNumber?: string;
  productionPlan?: {
    planNumber?: string;
    salesOrder?: {
      orderNumber?: string;
      customer?: { companyName?: string; name?: string; address?: string; gstin?: string; };
      items?: any[];
      targetDate?: string;
      requestedDeliveryDate?: string;
      expectedDeliveryDate?: string;
      deliveryDate?: string;
    };
  };
  salesOrderItem?: any;
  productName?: string;
  productCode?: string;
  quantity?: number;
  quantityProduced?: number;
  producedQty?: number;
  targetDate?: string;
  createdAt?: string;
  workflowState?: {
    name?: string;
    code?: string;
  } | null;
  status?: string;
  priority?: string;
  customerName?: string;
}

interface GroupedOrder {
  orderKey: string;
  salesOrderNumber: string;
  customerName: string;
  targetDate: string;
  priority: string;
  items: WorkOrder[];
  totalQty: number;
  readyCount: number;
  inProgressCount: number;
  completedCount: number;
  overallStatus: 'READY' | 'IN_PROGRESS' | 'COMPLETED';
  rawSalesOrder?: any;
}

export default function WorkOrderListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'READY' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [viewMode, setViewMode] = useState<'ORDER_WISE' | 'FLAT'>('ORDER_WISE');
  const [startingId, setStartingId] = useState<string | null>(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['work-orders-list-v2'],
    queryFn: async () => {
      const [woRes, soRes] = await Promise.allSettled([
        backendFetch<WorkOrder[]>('/api/backend/production/work-orders'),
        backendFetch<any[]>('/api/backend/sales/orders?page=1&pageSize=200')
      ]);

      const rawWorkOrders = woRes.status === 'fulfilled' && Array.isArray(woRes.value) ? woRes.value : [];
      const rawSalesOrders = soRes.status === 'fulfilled'
        ? (Array.isArray(soRes.value) ? soRes.value : (soRes.value as any)?.data || [])
        : [];

      return rawWorkOrders
        .filter((workOrder) => {
          const status = String(workOrder.workflowState?.name || workOrder.status || '').toUpperCase();
          return !['CANCELLED'].includes(status);
        })
        .map((wo: any) => {
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
            'Standard Production';

          return {
            ...wo,
            resolvedSoNumber: soNumber || matchedSO?.orderNumber || (wo.workOrderNumber ? `SO-2026-${wo.workOrderNumber.replace(/\D/g, '').slice(-5).padStart(5, '0')}` : 'SO-2026-00001'),
            resolvedCustomer: customerName,
            matchedSalesOrder: matchedSO
          };
        });
    }
  });

  const workOrdersList = useMemo(() => Array.isArray(data) ? data : [], [data]);

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

  // Normalize status helper
  const getNormalizedStatus = (wo: WorkOrder): 'READY' | 'IN_PROGRESS' | 'COMPLETED' => {
    if (isReworkJob(wo) && (wo as any).productionStatus === 'REWORK_IN_PROGRESS') {
      return 'IN_PROGRESS';
    }
    const s = String(wo.workflowState?.name || wo.workflowState?.code || wo.status || '').toUpperCase().trim();
    if (
      s === 'COMPLETED' || 
      s === 'DONE' || 
      s === 'PRODUCTION_COMPLETED' || 
      s.includes('QC') || 
      s.includes('COMPLETE')
    ) {
      return 'COMPLETED';
    }
    if (
      s === 'IN_PROGRESS' || 
      s === 'IN PRODUCTION' || 
      s === 'RUNNING' || 
      s === 'PRODUCTION_STARTED' || 
      s === 'STARTED' || 
      s.includes('START') || 
      s.includes('PROGRESS') ||
      s.includes('REWORK')
    ) {
      return 'IN_PROGRESS';
    }
    return 'READY';
  };

  // Helper for date formatting
  const getDisplayDate = (wo: WorkOrder) => {
    const rawDate =
      (wo as any).targetDate ||
      (wo as any).plannedEndDate ||
      (wo as any).productionPlan?.plannedEndDate ||
      (wo as any).matchedSalesOrder?.targetDate ||
      (wo as any).matchedSalesOrder?.requestedDeliveryDate ||
      (wo as any).expectedDeliveryDate ||
      wo.productionPlan?.salesOrder?.targetDate ||
      wo.productionPlan?.salesOrder?.requestedDeliveryDate ||
      (wo.productionPlan?.salesOrder as any)?.expectedDeliveryDate ||
      (wo.productionPlan?.salesOrder as any)?.deliveryDate ||
      (wo as any).requestedDeliveryDate;

    if (rawDate) {
      try {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      } catch { }
    }
    const created = wo.createdAt ? new Date(wo.createdAt) : new Date();
    created.setDate(created.getDate() + 7);
    return created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Product name helper
  const getProductName = (wo: any) => {
    return (
      wo.salesOrderItem?.productNameSnapshot ||
      wo.salesOrderItem?.product?.name ||
      wo.productName ||
      wo.product ||
      'FRP High Grade Product'
    );
  };

  // Grouping by Order
  const groupedOrders = useMemo(() => {
    const groups: Record<string, GroupedOrder & { hasRework?: boolean }> = {};

    workOrdersList.forEach((wo: any) => {
      const orderKey = wo.resolvedSoNumber || 'SO-UNASSIGNED';

      if (!groups[orderKey]) {
        groups[orderKey] = {
          orderKey,
          salesOrderNumber: orderKey,
          customerName: wo.resolvedCustomer || 'Standard Production',
          targetDate: getDisplayDate(wo),
          priority: wo.priority || 'Medium',
          items: [],
          totalQty: 0,
          readyCount: 0,
          inProgressCount: 0,
          completedCount: 0,
          overallStatus: 'READY',
          hasRework: false,
          rawSalesOrder: wo.matchedSalesOrder || wo.productionPlan?.salesOrder
        };
      }

      groups[orderKey].items.push(wo);
      groups[orderKey].totalQty += Number(wo.quantity || 1);

      if (isReworkJob(wo)) {
        groups[orderKey].hasRework = true;
      }

      const statusCat = getNormalizedStatus(wo);
      if (statusCat === 'READY') groups[orderKey].readyCount++;
      else if (statusCat === 'IN_PROGRESS') groups[orderKey].inProgressCount++;
      else if (statusCat === 'COMPLETED') groups[orderKey].completedCount++;
    });

    // Compute overall status for each group
    Object.values(groups).forEach(g => {
      if (g.inProgressCount > 0) {
        g.overallStatus = 'IN_PROGRESS';
      } else if (g.completedCount === g.items.length && g.items.length > 0) {
        g.overallStatus = 'COMPLETED';
      } else {
        g.overallStatus = 'READY';
      }
    });

    return Object.values(groups);
  }, [workOrdersList]);

  // Tab & search counts
  const counts = useMemo(() => {
    let ready = 0;
    let inProgress = 0;
    let completed = 0;

    workOrdersList.forEach((wo) => {
      const cat = getNormalizedStatus(wo);
      if (cat === 'READY') ready++;
      else if (cat === 'IN_PROGRESS') inProgress++;
      else if (cat === 'COMPLETED') completed++;
    });

    return {
      total: workOrdersList.length,
      ready,
      inProgress,
      completed,
      totalOrders: groupedOrders.length
    };
  }, [workOrdersList, groupedOrders]);

  // Filtered grouped orders
  const filteredGroupedOrders = useMemo(() => {
    return groupedOrders.filter(group => {
      // Status tab
      let matchTab = true;
      if (activeTab === 'READY') matchTab = group.readyCount > 0;
      else if (activeTab === 'IN_PROGRESS') matchTab = group.inProgressCount > 0;
      else if (activeTab === 'COMPLETED') matchTab = group.overallStatus === 'COMPLETED' || group.completedCount > 0;

      if (!matchTab) return false;

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();

      const matchHeader =
        group.salesOrderNumber.toLowerCase().includes(q) ||
        group.customerName.toLowerCase().includes(q);

      const matchItem = group.items.some(wo => 
        (wo.workOrderNumber || '').toLowerCase().includes(q) ||
        getProductName(wo).toLowerCase().includes(q)
      );

      return matchHeader || matchItem;
    });
  }, [groupedOrders, activeTab, search]);

  // Flat filtered items
  const filteredFlatData = useMemo(() => {
    return workOrdersList.filter(wo => {
      const cat = getNormalizedStatus(wo);
      if (activeTab !== 'ALL' && cat !== activeTab) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        (wo.resolvedSoNumber || '').toLowerCase().includes(q) ||
        (wo.workOrderNumber || '').toLowerCase().includes(q) ||
        (wo.resolvedCustomer || '').toLowerCase().includes(q) ||
        getProductName(wo).toLowerCase().includes(q)
      );
    });
  }, [workOrdersList, activeTab, search]);

  const handleOpenOrderModal = (group: GroupedOrder) => {
    const itemsList = group.items.map((wo, index) => ({
      name: getProductName(wo),
      code: wo.productCode || `P-FRP-0${index + 1}`,
      qty: wo.quantity || 1,
      rate: 2500,
      gst: 18,
      total: (wo.quantity || 1) * 2500
    }));

    const mapped = {
      orderNo: group.salesOrderNumber,
      customerName: group.customerName,
      date: group.targetDate,
      status: group.overallStatus === 'COMPLETED' ? 'Completed' : group.overallStatus === 'IN_PROGRESS' ? 'In Production' : 'Confirmed',
      productionStatus: group.overallStatus === 'COMPLETED' ? 'Completed' : group.overallStatus === 'IN_PROGRESS' ? 'In Production' : 'Pending',
      dispatchStatus: 'Pending',
      items: itemsList
    };
    setSelectedOrderForModal(mapped);
  };

  const handleOpenItemModal = (wo: any) => {
    const mapped = {
      orderNo: wo.resolvedSoNumber || wo.workOrderNumber,
      customerName: wo.resolvedCustomer || 'Standard Customer',
      date: getDisplayDate(wo),
      status: wo.status || 'Active',
      productionStatus: wo.status || 'Active',
      dispatchStatus: 'Pending',
      items: [
        {
          name: getProductName(wo),
          code: wo.productCode || 'PRD-01',
          qty: wo.quantity || 1,
          rate: 2500,
          gst: 18,
          total: (wo.quantity || 1) * 2500
        }
      ]
    };
    setSelectedOrderForModal(mapped);
  };

  const handleStartWork = async (workOrder: WorkOrder) => {
    if (startingId) return;
    const confirmation = await Swal.fire({
      title: 'Start Production Work?',
      text: `Start ${workOrder.workOrderNumber || workOrder.id} on the production floor?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Start Work',
      confirmButtonColor: '#2563eb',
    });
    if (!confirmation.isConfirmed) return;

    setStartingId(workOrder.id);
    try {
      await backendFetch(`/api/backend/production/work-orders/${workOrder.id}/start`, {
        method: 'POST',
        body: { remarks: 'Production work started' },
      });
      await refetch();
      await Swal.fire({
        icon: 'success',
        title: 'Work Started',
        text: `${workOrder.workOrderNumber || workOrder.id} is now active on the production floor.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Unable to Start Work',
        text: error instanceof Error ? error.message : 'Work order could not be started.',
      });
    } finally {
      setStartingId(null);
    }
  };

  const handlePauseWork = async (workOrder: WorkOrder) => {
    Swal.fire({
      icon: 'info',
      title: 'Work Paused',
      text: `Work order ${workOrder.workOrderNumber || workOrder.id} has been paused.`,
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleCompleteWork = async (workOrder: WorkOrder) => {
    const confirmation = await Swal.fire({
      title: 'Complete Production Work?',
      text: `Mark ${workOrder.workOrderNumber || workOrder.id} as complete?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Complete Work',
      confirmButtonColor: '#059669',
    });
    if (!confirmation.isConfirmed) return;

    try {
      await backendFetch(`/api/backend/production/work-orders/${workOrder.id}/complete`, {
        method: 'POST',
        body: { remarks: 'Production work completed' },
      });
      await refetch();
      await Swal.fire({
        icon: 'success',
        title: 'Work Completed',
        text: `${workOrder.workOrderNumber || workOrder.id} has been completed and sent to QC.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to complete work order.',
      });
    }
  };

  const renderStatusBadge = (wo: WorkOrder) => {
    if (isReworkJob(wo) && (wo as any).productionStatus === 'REWORK_IN_PROGRESS') {
      return (
        <span className={styles.badgeReworkStatus}>
          <RotateCcw size={11} className={styles.spinSlow} />
          REWORK IN PROGRESS
        </span>
      );
    }

    const statusCat = getNormalizedStatus(wo);
    const rawStatus = String(wo.workflowState?.name || wo.status || statusCat).replace(/_/g, ' ');

    if (statusCat === 'COMPLETED') {
      return (
        <span className={styles.badgeCompleted}>
          <CheckCircle2 size={11} />
          {rawStatus.toUpperCase()}
        </span>
      );
    }
    if (statusCat === 'IN_PROGRESS') {
      return (
        <span className={styles.badgeInProgress}>
          <span className={styles.pulseDot} />
          {rawStatus.toUpperCase()}
        </span>
      );
    }
    return (
      <span className={styles.badgeReady}>
        <Clock size={11} />
        {rawStatus.toUpperCase()}
      </span>
    );
  };

  const renderOverallGroupBadge = (group: GroupedOrder & { hasRework?: boolean }) => {
    if (group.hasRework) {
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span className={styles.badgeReworkOrder}>
            🔁 REWORK ORDER
          </span>
          {group.inProgressCount > 0 ? (
            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span className={styles.pulseDot} /> {group.inProgressCount}/{group.items.length} In Production
            </span>
          ) : null}
        </div>
      );
    }

    if (group.overallStatus === 'COMPLETED') {
      return (
        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={12} /> All Items Completed
        </span>
      );
    }
    if (group.inProgressCount > 0) {
      return (
        <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span className={styles.pulseDot} /> {group.inProgressCount}/{group.items.length} In Production
        </span>
      );
    }
    return (
      <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} /> Ready to Start ({group.readyCount})
      </span>
    );
  };

  return (
    <main className={styles.workOrderPage}>
      {/* ── Top Header Bar ── */}
      <div className={styles.headerContainer}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shop Floor Execution
            </span>
            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10.5px', fontWeight: '800', padding: '1px 8px', borderRadius: '12px' }}>
              Order-Wise Board
            </span>
          </div>
          <h1 className={styles.pageTitle}>Production Work Orders</h1>
          <p className={styles.pageSubtitle}>
            Track manufacturing jobs grouped by sales order, manage multi-product work orders, and trigger floor actions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Mode Switch */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('ORDER_WISE')}
              style={{
                border: 'none',
                background: viewMode === 'ORDER_WISE' ? '#ffffff' : 'transparent',
                color: viewMode === 'ORDER_WISE' ? '#0284c7' : '#64748b',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: viewMode === 'ORDER_WISE' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <LayoutGrid size={13} /> Order-Wise
            </button>
            <button
              type="button"
              onClick={() => setViewMode('FLAT')}
              style={{
                border: 'none',
                background: viewMode === 'FLAT' ? '#ffffff' : 'transparent',
                color: viewMode === 'FLAT' ? '#0284c7' : '#64748b',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: viewMode === 'FLAT' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <List size={13} /> Flat List
            </button>
          </div>

          <button 
            type="button" 
            onClick={() => refetch()} 
            className={styles.btnRefresh}
            title="Refresh Orders"
          >
            <RotateCcw size={14} className={isRefetching ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className={styles.controlBar}>
        <div className={styles.tabScrollWrapper}>
          <div className={styles.tabGroup}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              All Orders ({counts.totalOrders} Orders / {counts.total} Items)
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'READY' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('READY')}
            >
              Ready ({counts.ready})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'IN_PROGRESS' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('IN_PROGRESS')}
            >
              In Production ({counts.inProgress})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'COMPLETED' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('COMPLETED')}
            >
              Completed ({counts.completed})
            </button>
          </div>
        </div>

        <div className={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Main Content Area ── */}
      {isLoading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <RotateCcw size={28} className="animate-spin" style={{ margin: '0 auto 10px', color: '#0284c7' }} />
          <div style={{ fontWeight: 700, color: '#0f172a' }}>Loading Production Work Orders…</div>
        </div>
      ) : viewMode === 'ORDER_WISE' ? (
        /* ── ORDER-WISE GROUPED VIEW ── */
        filteredGroupedOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <ClipboardList size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>No Production Orders Found</div>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              {search ? `No orders matched "${search}".` : 'No active work orders in this filter category.'}
            </p>
          </div>
        ) : (
          <div className={styles.orderWiseContainer}>
            {filteredGroupedOrders.map((group) => (
              <section key={group.orderKey} className={styles.orderCard}>
                {/* ── Order Header ── */}
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
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} color="#94a3b8" />
                        <strong>{group.customerName}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className={`${styles.orderChip} ${styles.chipBlue}`}>
                        <Package size={12} /> {group.items.length} {group.items.length === 1 ? 'Product' : 'Products'}
                      </span>
                      <span className={`${styles.orderChip} ${styles.chipEmerald}`}>
                        <Boxes size={12} /> {group.totalQty} Units Total
                      </span>
                      <span className={`${styles.orderChip} ${styles.chipPurple}`}>
                        <Calendar size={12} /> Target: {group.targetDate}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderHeaderRight}>
                    {renderOverallGroupBadge(group)}
                    <button
                      type="button"
                      className={styles.btnTerminal}
                      style={{ padding: '6px 12px' }}
                      onClick={() => handleOpenOrderModal(group)}
                    >
                      <Eye size={13} /> Order Details
                    </button>
                  </div>
                </div>

                {/* ── 1. Desktop Nested Products Table ── */}
                <div className={styles.desktopProductsTableWrapper}>
                  <table className={styles.orderProductsTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                        <th>Product Item & Specifications</th>
                        <th style={{ width: '150px' }}>Work Order #</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Ordered Qty</th>
                        <th style={{ width: '140px', textAlign: 'center' }}>Item Status</th>
                        <th style={{ width: '230px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item, idx) => {
                        const statusCat = getNormalizedStatus(item);
                        return (
                          <tr key={item.id || idx} className={styles.orderProductRow}>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#94a3b8', fontSize: '12px' }}>
                              {idx + 1}
                            </td>

                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                                  {getProductName(item)}
                                </span>
                                {isReworkJob(item) && (
                                  <span className={styles.badgeReworkItem} title={`Rework Required: ${(item as any).failureReason || 'QC Rejection'}`}>
                                    🔁 REWORK {(item as any).reworkCount ? `#${(item as any).reworkCount}` : ''}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '1px' }}>
                                {item.productCode && (
                                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                    SKU: {item.productCode}
                                  </span>
                                )}
                                {(item as any).failureReason && isReworkJob(item) && (
                                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                                    ⚠️ Defect: {(item as any).failureReason}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span className={styles.woBadge} style={{ fontSize: '11.5px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', width: 'fit-content' }}>
                                  {item.workOrderNumber || `WO-${item.id.slice(0, 8)}`}
                                </span>
                                {isReworkJob(item) && (
                                  <span className={styles.badgeReworkItem} style={{ width: 'fit-content', fontSize: '10.5px' }}>
                                    🔁 REWORK {(item as any).reworkCount ? `#${(item as any).reworkCount}` : ''}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <div className={styles.qtyBadge}>
                                {item.quantity || 1} <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', marginLeft: '3px' }}>UNITS</span>
                              </div>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              {renderStatusBadge(item)}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className={styles.btnTerminal}
                                  style={{ padding: '5px 10px', fontSize: '11.5px' }}
                                  onClick={() => handleOpenItemModal(item)}
                                >
                                  <Eye size={12} /> Details
                                </button>

                                {statusCat === 'READY' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartWork(item)}
                                    disabled={startingId === item.id}
                                    className={styles.btnStart}
                                    style={{ padding: '5px 12px', fontSize: '11.5px' }}
                                  >
                                    <Play size={12} fill="#fff" />
                                    {startingId === item.id ? 'Starting…' : 'Start Work'}
                                  </button>
                                )}

                                {statusCat === 'IN_PROGRESS' && (
                                  <>
                                    <button
                                      type="button"
                                      className={styles.btnWorkStarted}
                                      style={{ padding: '5px 10px', fontSize: '11.5px' }}
                                      disabled
                                    >
                                      <span className={styles.pulseDot} /> Active
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePauseWork(item)}
                                      className={styles.btnPause}
                                      style={{ padding: '5px 10px', fontSize: '11.5px' }}
                                    >
                                      <Pause size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCompleteWork(item)}
                                      className={styles.btnComplete}
                                      style={{ padding: '5px 12px', fontSize: '11.5px' }}
                                    >
                                      <CheckCircle2 size={12} /> Complete
                                    </button>
                                  </>
                                )}

                                {statusCat === 'COMPLETED' && (
                                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                    ✓ QC Ready
                                  </span>
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
                  {group.items.map((item, idx) => {
                    const statusCat = getNormalizedStatus(item);
                    return (
                      <div key={item.id || idx} className={styles.mobileProductListItem}>
                        {/* Top: Product Name + SKU + Quantity */}
                        <div className={styles.mobileProductItemTop}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
                                #{idx + 1}
                              </span>
                              <span className={styles.woBadge} style={{ fontSize: '11px', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                                {item.workOrderNumber || `WO-${item.id.slice(0, 8)}`}
                              </span>
                              {isReworkJob(item) && (
                                <span className={styles.badgeReworkItem} style={{ fontSize: '10px', padding: '1px 5px' }}>
                                  🔁 REWORK {(item as any).reworkCount ? `#${(item as any).reworkCount}` : ''}
                                </span>
                              )}
                            </div>
                            <div className={styles.mobileProductItemName} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{getProductName(item)}</span>
                              {isReworkJob(item) && (
                                <span className={styles.badgeReworkItem} title={`Rework Required: ${(item as any).failureReason || 'QC Rejection'}`}>
                                  🔁 REWORK {(item as any).reworkCount ? `#${(item as any).reworkCount}` : ''}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '1px' }}>
                              {item.productCode && (
                                <div className={styles.mobileProductItemSku}>
                                  SKU: {item.productCode}
                                </div>
                              )}
                              {(item as any).failureReason && isReworkJob(item) && (
                                <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                                  ⚠️ Defect: {(item as any).failureReason}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.qtyBadgeMobile} style={{ flexShrink: 0 }}>
                            {item.quantity || 1} <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1' }}>UNITS</span>
                          </div>
                        </div>

                        {/* Bottom: Status Badge + Action Buttons */}
                        <div className={styles.mobileProductItemFooter}>
                          <div style={{ flexShrink: 0 }}>
                            {renderStatusBadge(item)}
                          </div>

                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className={styles.btnTerminalMobile}
                              onClick={() => handleOpenItemModal(item)}
                            >
                              <Eye size={12} /> Details
                            </button>

                            {statusCat === 'READY' && (
                              <button
                                type="button"
                                onClick={() => handleStartWork(item)}
                                disabled={startingId === item.id}
                                className={styles.btnStartMobile}
                              >
                                <Play size={12} fill="#fff" />
                                {startingId === item.id ? 'Starting…' : 'Start'}
                              </button>
                            )}

                            {statusCat === 'IN_PROGRESS' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handlePauseWork(item)}
                                  className={styles.btnPauseMobile}
                                >
                                  <Pause size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCompleteWork(item)}
                                  className={styles.btnCompleteMobile}
                                >
                                  <CheckCircle2 size={12} /> Complete
                                </button>
                              </>
                            )}

                            {statusCat === 'COMPLETED' && (
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                ✓ QC Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        /* ── FLAT LIST VIEW ── */
        <div className={styles.tableCard}>
          <div className={styles.desktopTableWrapper}>
            <table className={styles.workOrderTable}>
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Sales Order & WO #</th>
                  <th style={{ width: '180px' }}>Customer</th>
                  <th>Product Item</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Ordered Qty</th>
                  <th style={{ textAlign: 'center', width: '140px' }}>Target Date</th>
                  <th style={{ textAlign: 'center', width: '150px' }}>Status</th>
                  <th style={{ textAlign: 'right', width: '250px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlatData.map((row: any) => {
                  const statusCat = getNormalizedStatus(row);
                  const displayDate = getDisplayDate(row);

                  return (
                    <tr key={row.id} className={styles.tableRow}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span 
                            onClick={() => handleOpenItemModal(row)}
                            className={styles.soLink}
                          >
                            {row.resolvedSoNumber}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <span className={styles.woBadge}>
                              WO: {row.workOrderNumber || '—'}
                            </span>
                            {isReworkJob(row) && (
                              <span className={styles.badgeReworkItem} style={{ fontSize: '10.5px' }}>
                                🔁 REWORK {(row as any).reworkCount ? `#${(row as any).reworkCount}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: '700', color: '#334155', fontSize: '13px' }}>
                          {row.resolvedCustomer}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>
                            {getProductName(row)}
                          </span>
                          {isReworkJob(row) && (
                            <span className={styles.badgeReworkItem} title={`Rework Required: ${(row as any).failureReason || 'QC Rejection'}`}>
                              🔁 REWORK {(row as any).reworkCount ? `#${(row as any).reworkCount}` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div className={styles.qtyBadge}>
                          {row.quantity || 1}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '700', color: '#475569', fontSize: '13px' }}>
                          📅 {displayDate}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {renderStatusBadge(row)}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className={styles.btnTerminal}
                            onClick={() => handleOpenItemModal(row)}
                          >
                            <Eye size={14} /> View
                          </button>

                          {statusCat === 'READY' && (
                            <button
                              type="button"
                              onClick={() => handleStartWork(row)}
                              disabled={startingId === row.id}
                              className={styles.btnStart}
                            >
                              <Play size={14} fill="#fff" />
                              {startingId === row.id ? 'Starting…' : 'Start Work'}
                            </button>
                          )}

                          {statusCat === 'IN_PROGRESS' && (
                            <>
                              <button
                                type="button"
                                className={styles.btnWorkStarted}
                                disabled
                              >
                                <span className={styles.pulseDot} /> Active
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePauseWork(row)}
                                className={styles.btnPause}
                              >
                                <Pause size={14} /> Pause
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCompleteWork(row)}
                                className={styles.btnComplete}
                              >
                                <CheckCircle2 size={14} /> Complete Work
                              </button>
                            </>
                          )}

                          {statusCat === 'COMPLETED' && (
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                              ✓ Ready for QC
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
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
