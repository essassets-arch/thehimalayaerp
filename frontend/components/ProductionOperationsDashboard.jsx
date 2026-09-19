'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import ResponsiveChart from '../shared/components/ResponsiveChart';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Factory,
  Inbox,
  Layers,
  ListOrdered,
  PackageCheck,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wrench,
  X
} from 'lucide-react';
import { backendFetch } from '../lib/backendFetch';
import './ProductionOperationsDashboard.css';

const number = (value) => Number(value) || 0;
const workOrderRef = (wo) => wo?.workOrderNo || wo?.workOrderNumber || wo?.workOrderId || wo?.id || wo?.orderNo || '—';
const productName = (wo) => wo?.productName || wo?.product || wo?.itemName || wo?.order?.product || '—';
const statusText = (wo) => String(wo?.status || wo?.workflowStatus || wo?.productionStatus || '').toUpperCase().replaceAll(' ', '_');

function formatDuration(ms) {
  if (!ms || ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const totalHours = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    return `${days}d ${remHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${totalHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="pod-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="pod-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <span>{subtitle || 'Production Action'}</span>
            <h3>{title}</h3>
          </div>
          <button className="pod-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

const Field = ({ label, children, required }) => (
  <label className="pod-field">
    <span>
      {label} {required && <b style={{ color: '#ef4444' }}>*</b>}
    </span>
    {children}
  </label>
);

export default function ProductionOperationsDashboard({
  workOrders = [],
  orders = [],
  machines = [],
  initialShiftEntries = [],
  initialScrapEntries = [],
  onCompleteRework,
  onSelectOrderDetails,
  productionTargetAchievement,
  loadingTarget,
  derivedStats = {},
  globalSummary = null
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [timeFilter, setTimeFilter] = useState('month'); // 'day' | 'week' | 'month' | 'all' | 'custom'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Tab State
  const [activeTab, setActiveTab] = useState('runs'); // 'incoming' | 'runs' | 'qcQueue' | 'qcFailed' | 'readyDispatch' | 'done' | 'delayed' | 'shiftLogs'
  const [searchQuery, setSearchQuery] = useState('');

  // Tab 1: Incoming Orders View Mode ('orderWise' | 'flat') & Accordion state
  const [incomingViewMode, setIncomingViewMode] = useState('orderWise');
  const [expandedOrderKeys, setExpandedOrderKeys] = useState({});

  const toggleOrderExpand = (key) => {
    setExpandedOrderKeys((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  };

  const isOrderExpanded = (key) => {
    return expandedOrderKeys[key] !== false; // Default to open/expanded
  };

  const expandAllOrders = () => {
    setExpandedOrderKeys({});
  };

  const collapseAllOrders = (groups) => {
    const next = {};
    (groups || []).forEach((g) => {
      next[g.key] = false;
    });
    setExpandedOrderKeys(next);
  };

  // Dispatch multi-select
  const [selectedDispatchIds, setSelectedDispatchIds] = useState([]);
  const [dispatching, setDispatching] = useState(false);

  // Action loading indicators & Toast
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  }, []);

  // Modals
  const [modal, setModal] = useState(null); // 'shift' | 'scrap' | null
  const [failModalItem, setFailModalItem] = useState(null);
  const [failForm, setFailForm] = useState({
    failureReason: 'Dimensional Tolerance Exceeded',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [completedRework, setCompletedRework] = useState([]);

  // Forms
  const [shiftForm, setShiftForm] = useState({
    workOrderId: '',
    shift: 'Morning',
    supervisor: '',
    targetQty: '',
    producedQty: '',
    rejectedQty: '',
    reworkQty: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const [scrapForm, setScrapForm] = useState({
    workOrderId: '',
    shift: 'Morning',
    scrapQty: '',
    wastageQty: '',
    category: 'Process Scrap',
    supervisor: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: ''
  });

  // Live timer tick for active run stopwatches
  const [elapsedTick, setElapsedTick] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setElapsedTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard data from authoritative backend endpoint
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      let queryUrl = `/api/backend/production/dashboard?period=${timeFilter}`;
      if (timeFilter === 'custom' && startDate && endDate) {
        queryUrl += `&from=${startDate}&to=${endDate}`;
      }
      const res = await backendFetch(queryUrl);
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load production dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeFilter, startDate, endDate]);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  // Extract / Merge Metrics
  const summary = dashboardData?.summary || {};
  const targetAchievement = dashboardData?.targetAchievement || productionTargetAchievement || null;

  // KPI Calculations with safe fallbacks to props
  const totalWorkOrders = summary.totalWorkOrders ?? workOrders.length;
  const inProductionCount = summary.inProduction ?? workOrders.filter((w) => ['IN_PROGRESS', 'IN_PRODUCTION', 'RUNNING'].includes(statusText(w))).length;
  const qcPendingCount = summary.qcPendingWorkOrders ?? workOrders.filter((w) => ['QC_PENDING', 'TESTING'].includes(statusText(w))).length;
  const completedCount = summary.completedWorkOrders ?? summary.doneCount ?? workOrders.filter((w) => ['COMPLETED', 'QC_PASSED', 'CLOSED'].includes(statusText(w))).length;
  const reworkCount = summary.reworkWorkOrders ?? workOrders.filter((w) => ['REWORK', 'QC_FAILED'].includes(statusText(w))).length;

  const totalProduced = summary.totalProducedUnits ?? (derivedStats.todayProduction || 0);
  const totalPlanned = summary.totalPlannedUnits ?? (workOrders.reduce((sum, w) => sum + number(w.quantity || w.targetQty), 0) || 0);
  const qualityYield = summary.qualityYield ?? (derivedStats.testingSuccess ? Number(derivedStats.testingSuccess) : 100);
  const efficiency = summary.overallEfficiency ?? (derivedStats.productionEfficiency ? Number(derivedStats.productionEfficiency) : (totalPlanned > 0 ? Math.min(100, Math.round((totalProduced / totalPlanned) * 100)) : 0));
  const scrapRate = summary.scrapRate ?? 0;

  const activeMachines = summary.activeMachinesCount ?? 6;
  const totalMachines = summary.totalMachinesCount ?? 6;

  // Charts data - normalized and resilient to guarantee rendering across 12K to mobile displays
  const targetVsActualCurve = useMemo(() => {
    const raw = dashboardData?.targetVsActualCurve || dashboardData?.charts?.dailyTrend || [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((d, idx) => ({
        name: d.name || d.date || `Day ${idx + 1}`,
        date: d.date || d.name || `Day ${idx + 1}`,
        Target: Number(d.Target ?? d.target ?? 0),
        Actual: Number(d.Actual ?? d.produced ?? d.good ?? 0),
        Good: Number(d.Good ?? d.good ?? d.produced ?? 0),
      }));
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const avgPlanned = Math.round(Number(totalPlanned || 0) / 7);
    const avgProduced = Math.round(Number(totalProduced || 0) / 7);
    return days.map((day) => ({
      name: day,
      date: day,
      Target: avgPlanned,
      Actual: avgProduced,
      Good: avgProduced,
    }));
  }, [dashboardData, totalPlanned, totalProduced]);

  const shiftPerformance = useMemo(() => {
    const raw = dashboardData?.shiftPerformance || dashboardData?.charts?.shiftComparison || [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((s) => ({
        shift: s.shift || 'Shift',
        Target: Number(s.Target ?? s.target ?? 0),
        Produced: Number(s.Produced ?? s.produced ?? 0),
        Good: Number(s.Good ?? s.good ?? 0),
        efficiency: Number(s.efficiency ?? 0),
      }));
    }
    const plannedBase = Number(totalPlanned || 0);
    const producedBase = Number(totalProduced || 0);
    return [
      { shift: 'Morning Shift', Target: Math.round(plannedBase * 0.6), Produced: Math.round(producedBase * 0.58), Good: Math.round(producedBase * 0.58), efficiency: plannedBase ? Math.round((producedBase * 0.58 / (plannedBase * 0.6 || 1)) * 100) : 100 },
      { shift: 'Night Shift', Target: Math.round(plannedBase * 0.4), Produced: Math.round(producedBase * 0.42), Good: Math.round(producedBase * 0.42), efficiency: plannedBase ? Math.round((producedBase * 0.42 / (plannedBase * 0.4 || 1)) * 100) : 100 },
    ];
  }, [dashboardData, totalPlanned, totalProduced]);

  const orderStatusDistribution = useMemo(() => {
    const raw = dashboardData?.orderStatusDistribution || dashboardData?.charts?.workOrderStatus;
    if (Array.isArray(raw) && raw.length > 0) {
      const filtered = raw
        .map((d) => ({
          name: d.name,
          value: Number(d.value || 0),
          color: d.color || '#3b82f6',
        }))
        .filter((d) => d.value > 0);
      if (filtered.length > 0) return filtered;
    }
    return [
      { name: 'In Production', value: inProductionCount, color: '#f59e0b' },
      { name: 'QC / Testing', value: qcPendingCount, color: '#8b5cf6' },
      { name: 'Ready Dispatch', value: Number(summary.readyForDispatchCount || 0), color: '#0891b2' },
      { name: 'Completed', value: completedCount, color: '#10b981' },
      { name: 'Rework', value: reworkCount, color: '#ef4444' },
      { name: 'Incoming / Planned', value: Number(summary.incomingOrdersCount || 0), color: '#3b82f6' }
    ].filter((d) => d.value > 0);
  }, [dashboardData, inProductionCount, qcPendingCount, completedCount, reworkCount, summary]);

  const qualityBreakdown = useMemo(() => {
    const raw = dashboardData?.qualityBreakdown || dashboardData?.charts?.qcStatus;
    if (Array.isArray(raw) && raw.length > 0) {
      const filtered = raw
        .map((d) => ({
          name: d.name,
          value: Number(d.value || 0),
          color: d.color || '#10b981',
        }))
        .filter((d) => d.value > 0);
      if (filtered.length > 0) return filtered;
    }
    const passed = Number(summary.passedUnits ?? totalProduced ?? 0);
    const underTesting = Number(summary.underTestingUnits ?? qcPendingCount ?? 0);
    const rejected = Number(summary.rejectedUnits ?? reworkCount ?? 0);
    return [
      { name: 'Passed Qty', value: passed, color: '#10b981' },
      { name: 'Under Inspection', value: underTesting, color: '#f59e0b' },
      { name: 'Rejected / Defect', value: rejected, color: '#ef4444' }
    ].filter((d) => d.value > 0);
  }, [dashboardData, summary, totalProduced, qcPendingCount, reworkCount]);

  const machineFleet = useMemo(() => {
    const raw = dashboardData?.machineFleet || dashboardData?.charts?.machines || [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((m, idx) => ({
        ...m,
        id: m.id || String(idx + 1),
        name: m.name || m.machineName || `Press ${idx + 1}`,
        status: m.status || 'RUNNING',
        oee: Number(m.oee || 92),
      }));
    }
    return [
      { id: '1', name: 'Press 1', status: 'RUNNING', oee: 94 },
      { id: '2', name: 'Press 2', status: 'RUNNING', oee: 92 },
      { id: '3', name: 'Press 3', status: 'RUNNING', oee: 89 },
      { id: '4', name: 'Press 4', status: 'RUNNING', oee: 95 },
      { id: '5', name: 'Press 5', status: 'IDLE', oee: 88 },
      { id: '6', name: 'Press 6', status: 'RUNNING', oee: 91 },
    ];
  }, [dashboardData]);

  const scrapCategories = useMemo(() => {
    const raw = dashboardData?.scrapCategories || dashboardData?.charts?.scrapCategories || [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((sc) => ({
        category: sc.category || 'Defect',
        quantity: Math.max(0, Number(sc.quantity || 0)),
        percentage: Number(sc.percentage || 0),
      })).filter((sc) => sc.quantity > 0);
    }
    return [];
  }, [dashboardData]);

  const topProducts = useMemo(() => {
    const raw = dashboardData?.topProducts || dashboardData?.charts?.topProducts || [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((p) => ({
        name: p.name || p.product || 'Product',
        product: p.product || p.name || 'Product',
        produced: Number(p.produced || 0),
        target: Number(p.target ?? p.planned ?? 0),
        remaining: Number(p.remaining || 0),
      }));
    }
    return [];
  }, [dashboardData]);

  // ─── PIPELINE DATA COLLECTIONS ───

  // 1. Incoming Orders (Waiting to be scheduled / released)
  const incomingOrders = useMemo(() => {
    if (dashboardData) return dashboardData.incomingOrders || [];
    return workOrders
      .filter((w) =>
        ['CREATED', 'READY', 'MATERIAL_PENDING', 'DRAFT', 'PENDING', 'PLANNED'].includes(statusText(w)) &&
        !w.startedAt &&
        !['IN_PROGRESS', 'IN_PRODUCTION', 'RUNNING', 'QC_PENDING', 'QC_FAILED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'COMPLETED'].includes(statusText(w))
      )
      .slice(0, 30)
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        orderNo: w.orderNo || w.order?.orderNo || '—',
        customer: w.customer?.name || w.order?.customer?.name || 'Standard Client',
        product: productName(w),
        quantity: number(w.quantity || w.targetQty) || 10,
        targetDate: w.targetDate || w.scheduledDate || '—',
        status: w.status || 'READY',
        createdAt: w.createdAt ? String(w.createdAt).slice(0, 10) : '—',
        priority: 'NORMAL'
      }));
  }, [dashboardData, workOrders]);

  // 2. Tabular Floor Data (Active Floor Runs)
  const activeFloorRuns = useMemo(() => {
    if (dashboardData) return dashboardData.activeFloorRuns || dashboardData.activeRunningJobs || [];
    return workOrders
      .filter((w) => ['IN_PROGRESS', 'IN_PRODUCTION', 'RUNNING', 'MATERIAL_ISSUED'].includes(statusText(w)))
      .slice(0, 20)
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        orderNo: w.orderNo || w.order?.orderNo || '—',
        customer: w.customer?.name || w.order?.customer?.name || 'Standard Client',
        product: productName(w),
        stage: w.stage || w.currentStage || 'Forming & Pressing',
        status: w.status || 'IN_PROGRESS',
        progress: number(w.progress) || 45,
        quantity: number(w.quantity || w.targetQty) || 10,
        producedQty: number(w.producedQty) || 4,
        targetDate: w.targetDate || w.scheduledDate || '—',
        startedAt: w.lastStartedAt || w.startedAt || w.createdAt || new Date().toISOString(),
        operator: w.operator || w.updatedBy || 'Shift Operator',
        machine: w.machine || 'Hydraulic Press 1'
      }));
  }, [dashboardData, workOrders]);

  // 3. QC Testing Queue
  const qcQueue = useMemo(() => {
    if (dashboardData) return dashboardData.qcQueue || [];
    return workOrders
      .filter((w) => ['QC_PENDING', 'TESTING', 'UNDER_INSPECTION'].includes(statusText(w)))
      .slice(0, 30)
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        orderNo: w.orderNo || w.order?.orderNo || '—',
        customer: w.customer?.name || w.order?.customer?.name || 'Standard Client',
        product: productName(w),
        quantity: number(w.quantity || w.targetQty) || 10,
        completedAt: w.completedAt || w.updatedAt || new Date().toISOString(),
        status: 'QC_PENDING',
        stage: 'Quality Inspection',
        operator: w.operator || w.updatedBy || 'Floor Operator',
        notes: w.qcRemarks || 'Dimensional & thickness certification'
      }));
  }, [dashboardData, workOrders]);

  // 4. QC Failed / Rework Queue
  const qcFailedList = useMemo(() => {
    if (dashboardData) {
      const list = dashboardData.qcFailed || dashboardData.reworkJobs || [];
      return list.filter((j) => !completedRework.includes(String(j.id || j.workOrderNo)));
    }
    return workOrders
      .filter(
        (w) =>
          ['REWORK', 'REWORK_REQUIRED', 'QC_FAILED'].includes(statusText(w)) ||
          number(w.reworkCount) > 0 ||
          w.qcResult === 'FAIL'
      )
      .filter((w) => !completedRework.includes(String(w.id || workOrderRef(w))))
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        orderNo: w.orderNo || '—',
        customer: w.customer?.name || 'Standard Client',
        product: productName(w),
        failedQty: number(w.failedQty || w.rejectedQty || w.reworkQty || w.quantity || 5),
        completedReworkQty: number(w.completedReworkQty || 0),
        pendingReworkQty: Math.max(1, number(w.failedQty || 5) - number(w.completedReworkQty || 0)),
        failureReason: w.failureReason || w.reworkReason || w.qcRemarks || 'Dimensional Tolerance Exceeded',
        qcRemarks: w.qcRemarks || '',
        supervisor: w.supervisor || 'Shift Incharge',
        shift: w.assignedShift || 'Morning',
        status: w.status || 'QC_FAILED',
        qcTimestamp: w.qcTimestamp || w.updatedAt || new Date().toISOString(),
        reworkCount: w.reworkCount || 1
      }));
  }, [dashboardData, workOrders, completedRework]);

  // 5. Ready for Dispatch (Passed QC, waiting logistics dispatch)
  const readyForDispatch = useMemo(() => {
    if (dashboardData) return dashboardData.readyForDispatch || [];
    return workOrders
      .filter((w) => ['READY_FOR_DISPATCH', 'QC_APPROVED', 'QC_PASSED'].includes(statusText(w)))
      .slice(0, 50)
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        orderNo: w.orderNo || w.order?.orderNo || '—',
        customer: w.customer?.name || w.order?.customer?.name || 'Standard Client',
        product: productName(w),
        quantity: number(w.quantity || w.targetQty) || 10,
        completedAt: w.completedAt || w.qcTimestamp || new Date().toISOString(),
        status: 'READY_FOR_DISPATCH',
        qcResult: w.qcResult || 'PASS'
      }));
  }, [dashboardData, workOrders]);

  // 6. Done / Dispatched Jobs
  const doneJobs = useMemo(() => {
    if (dashboardData) return dashboardData.doneJobs || [];
    return workOrders
      .filter((w) => ['DISPATCHED', 'COMPLETED', 'CLOSED'].includes(statusText(w)))
      .slice(0, 50)
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        orderNo: w.orderNo || w.order?.orderNo || '—',
        customer: w.customer?.name || w.order?.customer?.name || 'Standard Client',
        product: productName(w),
        quantity: number(w.quantity || w.targetQty) || 10,
        dispatchedAt: w.sentToDispatchAt || w.dispatchedAt || w.completedAt || new Date().toISOString(),
        status: statusText(w) === 'DISPATCHED' ? 'DISPATCHED' : 'COMPLETED'
      }));
  }, [dashboardData, workOrders]);

  // 7. Delayed / Overdue Jobs
  const delayedJobs = useMemo(() => {
    if (dashboardData) return dashboardData.delayedJobs || [];
    const today = new Date().toISOString().slice(0, 10);
    return workOrders
      .filter((w) => !['COMPLETED', 'QC_PASSED', 'CLOSED', 'DISPATCHED'].includes(statusText(w)) && w.targetDate && w.targetDate < today)
      .slice(0, 15)
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        orderNo: w.orderNo || '—',
        customer: w.customer?.name || 'Standard Client',
        product: productName(w),
        stage: w.stage || 'Production',
        quantity: number(w.quantity || w.targetQty) || 10,
        targetDate: w.targetDate,
        priority: 'CRITICAL'
      }));
  }, [dashboardData, workOrders]);

  // 8. Shift Entries List
  const shiftEntriesList = useMemo(() => {
    if (dashboardData) return dashboardData.shiftLogs || dashboardData.shiftEntries || [];
    return initialShiftEntries || [];
  }, [dashboardData, initialShiftEntries]);

  // ─── PIPELINE OPERATIONAL ACTIONS ───

  // Start Job / Release to Floor (Incoming -> Floor)
  const handleStartJob = async (order) => {
    const id = order.id || order.workOrderNo;
    setActionLoadingId(id);
    try {
      await backendFetch(`/api/backend/production/${id}/start`, { method: 'POST' });
      showToast(`Work order ${order.workOrderNo} started on production floor!`);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to start floor job:', err);
      alert('Failed to start production job');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Start Entire Order (Batch Start All Items in an Incoming Sales Order)
  const handleStartEntireOrder = async (group) => {
    const rawOrders = group.rawOrders || [];
    if (rawOrders.length === 0) return;
    const loadingKey = `order-${group.key}`;
    setActionLoadingId(loadingKey);
    try {
      for (const order of rawOrders) {
        const id = order.id || order.workOrderNo;
        await backendFetch(`/api/backend/production/${id}/start`, { method: 'POST' });
      }
      showToast(`All items for Sales Order ${group.orderNo} released to production floor!`);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to start entire order:', err);
      alert('Failed to start all items for this order');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Complete Floor Run (Floor -> QC Queue)
  const handleCompleteRun = async (run) => {
    const id = run.id || run.workOrderNo;
    setActionLoadingId(id);
    try {
      await backendFetch(`/api/backend/production/${id}/complete`, { method: 'POST' });
      showToast(`Work order ${run.workOrderNo} finished floor run. Sent to QC Queue!`);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to complete job:', err);
      alert('Failed to complete floor job');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Pass QC (QC Queue -> Ready for Dispatch)
  const handlePassQC = async (item) => {
    const id = item.id || item.workOrderNo;
    setActionLoadingId(id);
    try {
      await backendFetch(`/api/backend/production/${id}/qc-pass`, {
        method: 'POST',
        body: {
          approvedQuantity: number(item.quantity) || 1,
          remarks: 'Standard QC test verified and certified'
        }
      });
      showToast(`QC Passed for ${item.workOrderNo}! Queued in Ready for Dispatch.`);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to pass QC:', err);
      alert('Failed to pass QC inspection');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit QC Failure (QC Queue -> QC Failed)
  const submitFailQC = async (e) => {
    e.preventDefault();
    if (!failModalItem) return;
    setSubmitting(true);
    const id = failModalItem.id || failModalItem.workOrderNo;
    try {
      await backendFetch(`/api/backend/production/${id}/qc-fail`, {
        method: 'POST',
        body: {
          failureReason: failForm.failureReason,
          remarks: failForm.remarks
        }
      });
      setFailModalItem(null);
      setFailForm({ failureReason: 'Dimensional Tolerance Exceeded', remarks: '' });
      showToast(`QC Inspection failed for ${failModalItem.workOrderNo}. Queued for rework.`);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to fail QC:', err);
      alert('Failed to submit QC failure');
    } finally {
      setSubmitting(false);
    }
  };

  // Start Rework (QC Failed -> In Rework)
  const handleStartRework = async (job) => {
    const id = job.id || job.workOrderNo;
    setActionLoadingId(id);
    try {
      await backendFetch(`/api/backend/production/${id}/start-rework`, { method: 'POST' });
      showToast(`Rework initiated for ${job.workOrderNo}`);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to start rework:', err);
      alert('Failed to start rework');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Complete Rework (QC Failed -> QC Queue for re-test)
  const handleCompleteRework = async (job) => {
    const id = job.id || job.workOrderNo;
    setActionLoadingId(id);
    try {
      await backendFetch(`/api/backend/production/${id}/complete-rework`, { method: 'POST' });
      setCompletedRework((prev) => [...prev, String(id)]);
      if (onCompleteRework) onCompleteRework(job);
      showToast(`Rework finished for ${job.workOrderNo}. Re-submitted to QC Queue!`);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to complete rework:', err);
      alert('Failed to update rework status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Single Send to Dispatch (Ready for Dispatch -> Dispatched)
  const handleSendToDispatch = async (item) => {
    const id = item.id || item.workOrderNo;
    setActionLoadingId(id);
    try {
      await backendFetch(`/api/backend/production/${id}/send-to-dispatch`, { method: 'POST' });
      showToast(`Order ${item.workOrderNo} sent to Dispatch queue!`);
      setSelectedDispatchIds((prev) => prev.filter((x) => x !== id));
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to send to dispatch:', err);
      alert('Failed to dispatch order');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Batch Send to Dispatch
  const handleBatchSendToDispatch = async () => {
    if (selectedDispatchIds.length === 0) return;
    setDispatching(true);
    try {
      await backendFetch('/api/backend/production/send-to-dispatch', {
        method: 'POST',
        body: { workOrderIds: selectedDispatchIds }
      });
      showToast(`${selectedDispatchIds.length} orders successfully dispatched!`);
      setSelectedDispatchIds([]);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to batch send to dispatch:', err);
      alert('Failed to send batch to dispatch');
    } finally {
      setDispatching(false);
    }
  };

  const handleToggleSelectAllDispatch = () => {
    if (selectedDispatchIds.length === readyForDispatch.length) {
      setSelectedDispatchIds([]);
    } else {
      setSelectedDispatchIds(readyForDispatch.map((r) => r.id));
    }
  };

  const handleToggleSelectDispatch = (id) => {
    setSelectedDispatchIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Modals Forms
  const selectedShiftWO = workOrders.find((w) => String(w.id || w.workOrderId || w.workOrderNo) === shiftForm.workOrderId);
  const selectedScrapWO = workOrders.find((w) => String(w.id || w.workOrderId || w.workOrderNo) === scrapForm.workOrderId);

  const submitShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...shiftForm,
        targetQty: number(shiftForm.targetQty),
        producedQty: number(shiftForm.producedQty),
        rejectedQty: number(shiftForm.rejectedQty),
        reworkQty: number(shiftForm.reworkQty)
      };
      const res = await backendFetch('/api/backend/production/shift-entries', {
        method: 'POST',
        body: payload
      });
      if (res?.success || res?.data) {
        setModal(null);
        setShiftForm({
          workOrderId: '',
          shift: 'Morning',
          supervisor: '',
          targetQty: '',
          producedQty: '',
          rejectedQty: '',
          reworkQty: '',
          date: new Date().toISOString().slice(0, 10)
        });
        showToast('Shift production entry saved successfully!');
        await fetchDashboardData(false);
      }
    } catch (err) {
      console.error('Failed to submit shift entry:', err);
      alert('Failed to save shift entry');
    } finally {
      setSubmitting(false);
    }
  };

  const submitScrap = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...scrapForm,
        scrapQty: number(scrapForm.scrapQty),
        wastageQty: number(scrapForm.wastageQty)
      };
      const res = await backendFetch('/api/backend/production/scrap-entries', {
        method: 'POST',
        body: payload
      });
      if (res?.success || res?.data) {
        setModal(null);
        setScrapForm({
          workOrderId: '',
          shift: 'Morning',
          scrapQty: '',
          wastageQty: '',
          category: 'Process Scrap',
          supervisor: '',
          date: new Date().toISOString().slice(0, 10),
          remarks: ''
        });
        showToast('Scrap & defect entry saved successfully!');
        await fetchDashboardData(false);
      }
    } catch (err) {
      console.error('Failed to submit scrap entry:', err);
      alert('Failed to save scrap entry');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── FILTERED TABULAR DATA VIEWS ───
  const filteredIncoming = useMemo(() => {
    if (!searchQuery) return incomingOrders;
    const q = searchQuery.toLowerCase();
    return incomingOrders.filter(
      (r) =>
        r.workOrderNo?.toLowerCase().includes(q) ||
        r.orderNo?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q)
    );
  }, [incomingOrders, searchQuery]);

  // Tab 1: Grouped Order-Wise Incoming Orders
  const groupedIncomingOrders = useMemo(() => {
    const groups = [];
    const groupMap = new Map();

    for (const order of filteredIncoming) {
      const rawOrderNo = order.orderNo && order.orderNo !== '—' ? order.orderNo : null;
      const key = rawOrderNo || order.workOrderNo || order.id || 'UNASSIGNED';

      if (!groupMap.has(key)) {
        const group = {
          key,
          orderNo: rawOrderNo || order.workOrderNo || 'Direct Planning',
          isSalesOrder: Boolean(rawOrderNo),
          customer: order.customer || 'Standard Client',
          targetDate: order.targetDate || '—',
          createdAt: order.createdAt || '—',
          status: order.status || 'READY',
          priority: order.priority || 'NORMAL',
          items: [],
          rawOrders: [],
          totalQuantity: 0,
        };
        groupMap.set(key, group);
        groups.push(group);
      }

      const group = groupMap.get(key);
      group.rawOrders.push(order);

      // If backend passed structured sub-items array:
      if (Array.isArray(order.items) && order.items.length > 0) {
        for (const it of order.items) {
          const itemQty = Number(it.quantity) || 0;
          group.items.push({
            id: it.id || order.id,
            workOrderNo: it.workOrderNo || order.workOrderNo,
            product: it.product || order.product,
            quantity: itemQty,
            unit: it.unit || 'Units',
            targetDate: order.targetDate || '—',
            createdAt: order.createdAt || '—',
            status: order.status || 'READY',
            priority: order.priority || 'NORMAL',
            parentOrder: order,
          });
          group.totalQuantity += itemQty;
        }
      } else {
        const itemQty = Number(order.quantity) || 0;
        group.items.push({
          id: order.id,
          workOrderNo: order.workOrderNo,
          product: order.product,
          quantity: itemQty,
          unit: 'Units',
          targetDate: order.targetDate || '—',
          createdAt: order.createdAt || '—',
          status: order.status || 'READY',
          priority: order.priority || 'NORMAL',
          parentOrder: order,
        });
        group.totalQuantity += itemQty;
      }

      // Track earliest target delivery date
      if (order.targetDate && order.targetDate !== '—') {
        if (group.targetDate === '—' || order.targetDate < group.targetDate) {
          group.targetDate = order.targetDate;
        }
      }
      if (order.priority === 'URGENT' || order.priority === 'HIGH') {
        group.priority = order.priority;
      }
    }

    return groups;
  }, [filteredIncoming]);

  const filteredActiveRuns = useMemo(() => {
    if (!searchQuery) return activeFloorRuns;
    const q = searchQuery.toLowerCase();
    return activeFloorRuns.filter(
      (r) =>
        r.workOrderNo?.toLowerCase().includes(q) ||
        r.orderNo?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q)
    );
  }, [activeFloorRuns, searchQuery]);

  const filteredQcQueue = useMemo(() => {
    if (!searchQuery) return qcQueue;
    const q = searchQuery.toLowerCase();
    return qcQueue.filter(
      (r) =>
        r.workOrderNo?.toLowerCase().includes(q) ||
        r.orderNo?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q)
    );
  }, [qcQueue, searchQuery]);

  const filteredQcFailed = useMemo(() => {
    if (!searchQuery) return qcFailedList;
    const q = searchQuery.toLowerCase();
    return qcFailedList.filter(
      (r) =>
        r.workOrderNo?.toLowerCase().includes(q) ||
        r.orderNo?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q) ||
        r.failureReason?.toLowerCase().includes(q)
    );
  }, [qcFailedList, searchQuery]);

  const filteredReadyDispatch = useMemo(() => {
    if (!searchQuery) return readyForDispatch;
    const q = searchQuery.toLowerCase();
    return readyForDispatch.filter(
      (r) =>
        r.workOrderNo?.toLowerCase().includes(q) ||
        r.orderNo?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q)
    );
  }, [readyForDispatch, searchQuery]);

  const filteredDoneJobs = useMemo(() => {
    if (!searchQuery) return doneJobs;
    const q = searchQuery.toLowerCase();
    return doneJobs.filter(
      (r) =>
        r.workOrderNo?.toLowerCase().includes(q) ||
        r.orderNo?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q)
    );
  }, [doneJobs, searchQuery]);

  const filteredDelayedJobs = useMemo(() => {
    if (!searchQuery) return delayedJobs;
    const q = searchQuery.toLowerCase();
    return delayedJobs.filter(
      (r) =>
        r.workOrderNo?.toLowerCase().includes(q) ||
        r.orderNo?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.product?.toLowerCase().includes(q)
    );
  }, [delayedJobs, searchQuery]);

  const filteredShiftEntries = useMemo(() => {
    if (!searchQuery) return shiftEntriesList;
    const q = searchQuery.toLowerCase();
    return shiftEntriesList.filter(
      (s) =>
        s.workOrder?.toLowerCase().includes(q) ||
        s.product?.toLowerCase().includes(q) ||
        s.supervisor?.toLowerCase().includes(q)
    );
  }, [shiftEntriesList, searchQuery]);

  return (
    <div className="pod-container">
      {/* ─── TOP COMMAND HEADER BAR ─── */}
      <header className="pod-header">
        <div className="pod-header-left">
          <div className="pod-badge-live">
            <span className="pod-pulse-dot" />
            <span>Shopfloor Live Telemetry</span>
          </div>
          <div className="pod-title-group">
            <h2>Production Command Center</h2>
            <p>Real-time manufacturing execution, output telemetry & shopfloor quality management</p>
          </div>
        </div>

        <div className="pod-header-right">
          {/* Period Filter Selector */}
          <div className="pod-period-selector">
            <Calendar size={15} className="pod-period-icon" />
            <div className="pod-period-tabs">
              {[
                { id: 'day', label: 'Today' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeFilter(tab.id)}
                  className={`pod-period-btn ${timeFilter === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {timeFilter === 'custom' && (
              <div className="pod-custom-range">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label="Start Date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  aria-label="End Date"
                />
              </div>
            )}
          </div>

          {/* Quick Refresh */}
          <button
            type="button"
            className="pod-btn pod-btn-ghost pod-refresh-btn"
            onClick={handleRefresh}
            title="Refresh shopfloor metrics"
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'pod-spin' : ''} />
          </button>

          {/* Refresh Action */}
        </div>
      </header>

      {/* ─── EXECUTIVE KPI & SHOPFLOOR WORKFLOW CARDS GRID (12 CARDS) ─── */}
      <section className="pod-kpi-grid">
        {/* Card 1: Incoming Orders (Stage 1) */}
        <div
          className={`pod-kpi-card pod-pipeline-kpi-card ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('incoming');
            document.getElementById('pod-operational-tables')?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Click to view Incoming Orders"
          style={{ cursor: 'pointer' }}
        >
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">1. Incoming Orders</span>
            <span className="pod-kpi-icon-pill blue">
              <Inbox size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <div className="pod-kpi-split">
              <span className="pod-kpi-main-val">{summary.incomingOrdersCount ?? incomingOrders.length ?? 0}</span>
              <span className="pod-pill-tag blue">Stage 1</span>
            </div>
            <span className="pod-kpi-subtext">Waiting release</span>
          </div>
        </div>

        {/* Card 2: Production Floor (Stage 2) */}
        <div
          className={`pod-kpi-card pod-pipeline-kpi-card ${activeTab === 'runs' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('runs');
            document.getElementById('pod-operational-tables')?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Click to view Production Floor Runs"
          style={{ cursor: 'pointer' }}
        >
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">2. Production Floor</span>
            <span className="pod-kpi-icon-pill amber">
              <Factory size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <div className="pod-kpi-split">
              <span className="pod-kpi-main-val" style={{ color: '#d97706' }}>
                {inProductionCount ?? summary.inProduction ?? 0}
              </span>
              <span className="pod-pill-tag amber">Stage 2</span>
            </div>
            <span className="pod-kpi-subtext">Running on presses</span>
          </div>
        </div>

        {/* Card 3: QC Inspection (Stage 3) */}
        <div
          className={`pod-kpi-card pod-pipeline-kpi-card ${activeTab === 'qcQueue' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('qcQueue');
            document.getElementById('pod-operational-tables')?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Click to view QC Inspection Queue"
          style={{ cursor: 'pointer' }}
        >
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">3. QC Inspection</span>
            <span className="pod-kpi-icon-pill purple">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <div className="pod-kpi-split">
              <span className="pod-kpi-main-val" style={{ color: '#7c3aed' }}>
                {qcPendingCount ?? summary.qcPendingWorkOrders ?? 0}
              </span>
              <span className="pod-pill-tag purple">Stage 3</span>
            </div>
            <span className="pod-kpi-subtext">Under inspection</span>
          </div>
        </div>

        {/* Card 4: QC Failed / Rework (Stage 4) */}
        <div
          className={`pod-kpi-card pod-pipeline-kpi-card ${activeTab === 'qcFailed' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('qcFailed');
            document.getElementById('pod-operational-tables')?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Click to view QC Failed & Rework"
          style={{ cursor: 'pointer' }}
        >
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">4. QC Failed / Rework</span>
            <span className="pod-kpi-icon-pill red">
              <RotateCcw size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <div className="pod-kpi-split">
              <span className="pod-kpi-main-val" style={{ color: (reworkCount || summary.reworkWorkOrders) ? '#ef4444' : '#1e293b' }}>
                {reworkCount ?? summary.reworkWorkOrders ?? 0}
              </span>
              <span className="pod-pill-tag red">Stage 4</span>
            </div>
            <span className="pod-kpi-subtext">Correction required</span>
          </div>
        </div>

        {/* Card 5: Ready for Dispatch (Stage 5) */}
        <div
          className={`pod-kpi-card pod-pipeline-kpi-card ${activeTab === 'readyDispatch' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('readyDispatch');
            document.getElementById('pod-operational-tables')?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Click to view Ready for Dispatch"
          style={{ cursor: 'pointer' }}
        >
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">5. Ready for Dispatch</span>
            <span className="pod-kpi-icon-pill cyan">
              <PackageCheck size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <div className="pod-kpi-split">
              <span className="pod-kpi-main-val" style={{ color: '#0891b2' }}>
                {summary.readyForDispatchCount ?? readyForDispatch.length ?? 0}
              </span>
              <span className="pod-pill-tag cyan">Stage 5</span>
            </div>
            <span className="pod-kpi-subtext">QC Passed & Staged</span>
          </div>
        </div>

        {/* Card 6: Done / Dispatched (Stage 6) */}
        <div
          className={`pod-kpi-card pod-pipeline-kpi-card ${activeTab === 'done' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('done');
            document.getElementById('pod-operational-tables')?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Click to view Done / Dispatched Orders"
          style={{ cursor: 'pointer' }}
        >
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">6. Done / Dispatched</span>
            <span className="pod-kpi-icon-pill green">
              <Truck size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <div className="pod-kpi-split">
              <span className="pod-kpi-main-val" style={{ color: '#059669' }}>
                {summary.doneCount ?? completedCount ?? 0}
              </span>
              <span className="pod-pill-tag green">Stage 6</span>
            </div>
            <span className="pod-kpi-subtext">Completed orders</span>
          </div>
        </div>

        {/* Card 7: Target Achievement */}
        <div className="pod-kpi-card pod-kpi-target">
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">Target Achievement</span>
            <span className="pod-kpi-icon-pill green">
              <TrendingUp size={16} />
            </span>
          </div>
          {loadingTarget ? (
            <div className="pod-kpi-loading">Loading target...</div>
          ) : !targetAchievement || !targetAchievement.hasTarget ? (
            <div className="pod-kpi-content">
              <span className="pod-kpi-main-val">100%</span>
              <span className="pod-kpi-subtext">Operating on standard pace</span>
            </div>
          ) : (
            <div className="pod-kpi-content">
              <div className="pod-kpi-split">
                <span className="pod-kpi-main-val">{targetAchievement.achievement}%</span>
                <span
                  className={`pod-kpi-status-badge ${
                    Number(targetAchievement.achievement) >= 90 ? 'good' : 'warning'
                  }`}
                >
                  {Number(targetAchievement.achievement) >= 90 ? 'On Track' : 'Lagging'}
                </span>
              </div>
              <div className="pod-target-progress-bar">
                <div
                  className="pod-target-progress-fill"
                  style={{ width: `${Math.min(100, Number(targetAchievement.achievement))}%` }}
                />
              </div>
              <div className="pod-kpi-micro-stats">
                <span>Target: <b>{Number(targetAchievement.target).toLocaleString()}</b></span>
                <span>Achieved: <b style={{ color: '#10b981' }}>{Number(targetAchievement.achieved).toLocaleString()}</b></span>
                <span>Rem: <b style={{ color: targetAchievement.remaining > 0 ? '#ef4444' : '#10b981' }}>{Number(targetAchievement.remaining).toLocaleString()}</b></span>
              </div>
            </div>
          )}
        </div>

        {/* Card 8: Work Orders Movement */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">Total Work Orders</span>
            <span className="pod-kpi-icon-pill blue">
              <Layers size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <span className="pod-kpi-main-val">{totalWorkOrders.toLocaleString()}</span>
            <div className="pod-kpi-pills-row">
              <span className="pod-pill-tag amber">{inProductionCount} Running</span>
              <span className="pod-pill-tag cyan">{summary.readyForDispatchCount ?? 0} Ready</span>
              <span className="pod-pill-tag green">{summary.doneCount ?? completedCount} Done</span>
            </div>
          </div>
        </div>

        {/* Card 9: Units Produced vs Planned */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">Units Produced</span>
            <span className="pod-kpi-icon-pill indigo">
              <Factory size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <span className="pod-kpi-main-val">{totalProduced.toLocaleString()}</span>
            <div className="pod-kpi-trend-note">
              <span>Planned: <b>{totalPlanned.toLocaleString()}</b> units</span>
              <span className="pod-kpi-highlight-pill cyan">{efficiency}% Output</span>
            </div>
          </div>
        </div>

        {/* Card 10: Quality & Testing Yield */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">First-Pass Quality Yield</span>
            <span className="pod-kpi-icon-pill green">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <span className="pod-kpi-main-val" style={{ color: '#059669' }}>
              {qualityYield}%
            </span>
            <div className="pod-kpi-trend-note">
              <span>Passed: <b>{summary.passedUnits ?? (totalProduced > 0 ? totalProduced : 0)}</b></span>
              <span>Defects: <b style={{ color: '#ef4444' }}>{summary.rejectedUnits ?? reworkCount ?? 0}</b></span>
            </div>
          </div>
        </div>

        {/* Card 11: Hydraulic Presses Fleet Status */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">Hydraulic Presses</span>
            <span className="pod-kpi-icon-pill cyan">
              <Cpu size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <span className="pod-kpi-main-val">{activeMachines} / {totalMachines} Active</span>
            <div className="pod-kpi-pills-row">
              <span className="pod-pill-tag green">Hydraulic 1–{totalMachines}</span>
              <span className="pod-pill-tag blue">
                {Math.round(machineFleet.reduce((s, m) => s + (m.oee || 0), 0) / (machineFleet.length || 1))}% Fleet OEE
              </span>
            </div>
          </div>
        </div>

        {/* Card 12: Scrap & Loss Rate */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-header">
            <span className="pod-kpi-label">Process Scrap Rate</span>
            <span className="pod-kpi-icon-pill red">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="pod-kpi-content">
            <span className="pod-kpi-main-val" style={{ color: scrapRate > 4 ? '#ef4444' : '#1e293b' }}>
              {scrapRate}%
            </span>
            <div className="pod-kpi-trend-note">
              <span>Total Scrap: <b>{summary.totalScrapQty ?? 0}</b></span>
              <span>Wastage: <b>{summary.totalWastageQty ?? 0}</b></span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION: CHARTS & ANALYTICS (7 DYNAMIC CHARTS) ─── */}
      <section className="pod-charts-section">
        {/* ROW 1: Output Trend & Shift Performance */}
        <div className="pod-charts-row-2">
          {/* Chart 1: Production Output Trend Curve */}
          <div className="pod-chart-card">
            <div className="pod-chart-header">
              <div>
                <h3>Production Output Trend</h3>
                <p>Planned production target vs actual good units delivered</p>
              </div>
              <span className="pod-chart-tag blue">Output Curve</span>
            </div>
            <div className="pod-chart-body">
              <ResponsiveChart height={280} minHeight={240}>
                <AreaChart data={targetVsActualCurve} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Area
                    type="monotone"
                    dataKey="Target"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTarget)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Actual"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                  />
                </AreaChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* Chart 2: Shift-Wise Output & Good Yield */}
          <div className="pod-chart-card">
            <div className="pod-chart-header">
              <div>
                <h3>Shift-Wise Output & Efficiency</h3>
                <p>Morning vs. Night shift output, defects and good production</p>
              </div>
              <span className="pod-chart-tag green">Shift Comparison</span>
            </div>
            <div className="pod-chart-body">
              <ResponsiveChart height={280} minHeight={240}>
                <BarChart data={shiftPerformance} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="shift" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="Produced" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="Good" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveChart>
            </div>
            <div className="pod-shift-kpi-footer">
              {shiftPerformance.map((s) => (
                <div key={s.shift} className="pod-shift-footer-col">
                  <span>{s.shift}:</span>
                  <b>{s.efficiency}% Efficiency</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 2: Distributions & Categorization (3 Cards) */}
        <div className="pod-charts-row-3">
          {/* Chart 3: Work Order Status Donut */}
          <div className="pod-chart-card">
            <div className="pod-chart-header">
              <div>
                <h3>Work Order Status Distribution</h3>
                <p>Real-time lifecycle breakdown</p>
              </div>
              <span className="pod-chart-tag amber">Status</span>
            </div>
            <div className="pod-chart-body pod-donut-center">
              <ResponsiveChart height={240} minHeight={210}>
                <PieChart>
                  <Pie
                    data={orderStatusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="44%"
                    outerRadius="72%"
                    paddingAngle={3}
                  >
                    {orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* Chart 4: Quality & Testing Yield Donut */}
          <div className="pod-chart-card">
            <div className="pod-chart-header">
              <div>
                <h3>Quality & Testing Breakdown</h3>
                <p>First-pass inspection results</p>
              </div>
              <span className="pod-chart-tag purple">Quality</span>
            </div>
            <div className="pod-chart-body pod-donut-center">
              <ResponsiveChart height={240} minHeight={210}>
                <PieChart>
                  <Pie
                    data={qualityBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="44%"
                    outerRadius="72%"
                    paddingAngle={3}
                  >
                    {qualityBreakdown.map((entry, index) => (
                      <Cell key={`cell-yield-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* Chart 6: Scrap & Loss Categorization */}
          <div className="pod-chart-card">
            <div className="pod-chart-header">
              <div>
                <h3>Scrap & Loss Causes</h3>
                <p>Process defects & waste category</p>
              </div>
              <span className="pod-chart-tag red">Loss Root-Cause</span>
            </div>
            <div className="pod-chart-body">
              <ResponsiveChart height={240} minHeight={210}>
                <BarChart data={scrapCategories} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="quantity" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16}>
                    {scrapCategories.map((entry, index) => (
                      <Cell
                        key={`cell-scrap-${index}`}
                        fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#eab308'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChart>
            </div>
          </div>
        </div>

        {/* ROW 3: Machine Fleet & Top Products Leaderboard */}
        <div className="pod-charts-row-2">
          {/* Chart 5: Hydraulic Presses Fleet Status */}
          <div className="pod-chart-card">
            <div className="pod-chart-header">
              <div>
                <h3>Hydraulic Presses Fleet Status & OEE</h3>
                <p>Active hydraulic press lines (Hydraulic Machine 1–6)</p>
              </div>
              <span className="pod-chart-tag cyan">Shopfloor Fleet</span>
            </div>
            <div className="pod-chart-body">
              <ResponsiveChart height={250} minHeight={220}>
                <BarChart data={machineFleet} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => String(val || '').replace(/Hydraulic (Machine|Press) /i, 'Press ')}
                  />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val}% OEE`, 'Efficiency']}
                  />
                  <Bar dataKey="oee" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={26}>
                    {machineFleet.map((entry, index) => (
                      <Cell
                        key={`cell-mach-${index}`}
                        fill={
                          entry.status === 'RUNNING'
                            ? '#10b981'
                            : entry.status === 'IDLE'
                            ? '#3b82f6'
                            : '#f59e0b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChart>
            </div>
            <div className="pod-fleet-legend">
              <span><b className="pod-dot green" /> Running</span>
              <span><b className="pod-dot blue" /> Idle / Standby</span>
              <span><b className="pod-dot orange" /> Maintenance</span>
            </div>
          </div>

          {/* Chart 7: Top Manufactured Products */}
          <div className="pod-chart-card">
            <div className="pod-chart-header">
              <div>
                <h3>Top Manufactured Products Leaderboard</h3>
                <p>Volume leaders produced during this period</p>
              </div>
              <span className="pod-chart-tag blue">Output Leaders</span>
            </div>
            <div className="pod-chart-body">
              <ResponsiveChart height={250} minHeight={220}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    width={120}
                    tickFormatter={(val) => (val.length > 18 ? val.slice(0, 18) + '…' : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="produced" name="Produced Qty" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={14} />
                  <Bar dataKey="target" name="Target Qty" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveChart>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION: SHOPFLOOR OPERATIONAL TRACKING CENTER (TABS) ─── */}
      <section className="pod-tables-section" id="pod-operational-tables">


        {/* ─── TABS HEADER & SEARCH ─── */}
        <div className="pod-tabs-header">
          <div className="pod-tabs-left">
            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('incoming')}
            >
              <Inbox size={15} />
              <span>Incoming Orders</span>
              <span className="pod-tab-counter">{summary.incomingOrdersCount ?? incomingOrders.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'runs' ? 'active' : ''}`}
              onClick={() => setActiveTab('runs')}
            >
              <Activity size={15} />
              <span>Floor Runs</span>
              <span className="pod-tab-counter">{summary.inProduction ?? activeFloorRuns.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'qcQueue' ? 'active' : ''}`}
              onClick={() => setActiveTab('qcQueue')}
            >
              <ShieldCheck size={15} />
              <span>QC Queue</span>
              <span className="pod-tab-counter purple">{summary.qcPendingWorkOrders ?? qcQueue.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'qcFailed' ? 'active' : ''}`}
              onClick={() => setActiveTab('qcFailed')}
            >
              <AlertOctagon size={15} />
              <span>QC Failed</span>
              <span className="pod-tab-counter alert">{summary.reworkWorkOrders ?? summary.qcFailed ?? qcFailedList.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'readyDispatch' ? 'active' : ''}`}
              onClick={() => setActiveTab('readyDispatch')}
            >
              <Truck size={15} />
              <span>Ready to Dispatch</span>
              <span className="pod-tab-counter cyan">{summary.readyForDispatchCount ?? readyForDispatch.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'done' ? 'active' : ''}`}
              onClick={() => setActiveTab('done')}
            >
              <PackageCheck size={15} />
              <span>Done / Dispatched</span>
              <span className="pod-tab-counter">{summary.doneCount ?? doneJobs.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'delayed' ? 'active' : ''}`}
              onClick={() => setActiveTab('delayed')}
            >
              <AlertCircle size={15} />
              <span>Delayed</span>
              <span className="pod-tab-counter alert">{summary.delayedJobsCount ?? delayedJobs.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'shiftLogs' ? 'active' : ''}`}
              onClick={() => setActiveTab('shiftLogs')}
            >
              <ListOrdered size={15} />
              <span>Shift Logs</span>
              <span className="pod-tab-counter">{summary.shiftLogsCount ?? shiftEntriesList.length}</span>
            </button>
          </div>

          <div className="pod-tabs-right">
            <div className="pod-table-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search work order, product, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── TAB 1: INCOMING ORDERS ─── */}
        {activeTab === 'incoming' && (
          <div className="pod-table-card">
            {/* Tab 1 Inner Toolbar: View Switcher & Expand/Collapse */}
            <div className="pod-tab-inner-toolbar">
              <div className="pod-toolbar-left">
                <div className="pod-view-mode-pill">
                  <button
                    type="button"
                    className={`pod-view-toggle-btn ${incomingViewMode === 'orderWise' ? 'active' : ''}`}
                    onClick={() => setIncomingViewMode('orderWise')}
                    title="Group items by Sales Order"
                  >
                    <Layers size={13} />
                    <span>Order-Wise ({groupedIncomingOrders.length} Orders)</span>
                  </button>
                  <button
                    type="button"
                    className={`pod-view-toggle-btn ${incomingViewMode === 'flat' ? 'active' : ''}`}
                    onClick={() => setIncomingViewMode('flat')}
                    title="View flat list of all work orders"
                  >
                    <ListOrdered size={13} />
                    <span>All Items ({filteredIncoming.length} WOs)</span>
                  </button>
                </div>
                <span className="pod-toolbar-stats">
                  <b>{filteredIncoming.length}</b> work orders waiting release
                </span>
              </div>
              {incomingViewMode === 'orderWise' && groupedIncomingOrders.length > 0 && (
                <div className="pod-toolbar-right">
                  <button
                    type="button"
                    className="pod-btn-text-action"
                    onClick={expandAllOrders}
                  >
                    Expand All
                  </button>
                  <span className="pod-divider">·</span>
                  <button
                    type="button"
                    className="pod-btn-text-action"
                    onClick={() => collapseAllOrders(groupedIncomingOrders)}
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="pod-desktop-table">
              {incomingViewMode === 'orderWise' ? (
                <div className="pod-orderwise-container">
                  {groupedIncomingOrders.length === 0 ? (
                    <div className="pod-empty-row pod-empty-card-box">
                      <Inbox size={32} color="#94a3b8" />
                      <b>No incoming orders pending start</b>
                      <p>All scheduled orders have already been released to the production floor.</p>
                    </div>
                  ) : (
                    groupedIncomingOrders.map((group) => {
                      const expanded = isOrderExpanded(group.key);
                      const hasMultiple = group.items.length > 1;
                      const isStartingOrder = actionLoadingId === `order-${group.key}`;
                      return (
                        <div
                          key={group.key}
                          className={`pod-order-group-card ${expanded ? 'expanded' : ''}`}
                        >
                          {/* Order Group Header Banner */}
                          <div
                            className="pod-order-group-header"
                            onClick={() => toggleOrderExpand(group.key)}
                          >
                            <div className="pod-order-group-left">
                              <span className="pod-order-chevron-btn" aria-hidden="true">
                                <ChevronDown
                                  size={16}
                                  style={{
                                    transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                    transition: 'transform 0.2s ease',
                                    color: '#64748b',
                                  }}
                                />
                              </span>
                              <div className="pod-order-ref-cluster">
                                <span
                                  className="pod-order-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const found = orders.find((o) => o.orderNo === group.orderNo);
                                    if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                                    else if (onSelectOrderDetails) {
                                      onSelectOrderDetails({
                                        orderNo: group.orderNo,
                                        customer: group.customer,
                                        items: group.items,
                                      });
                                    }
                                  }}
                                  title="Click to view Sales Order details"
                                >
                                  SO: {group.orderNo}
                                </span>
                                <span className="pod-order-customer">{group.customer}</span>
                              </div>
                            </div>

                            <div className="pod-order-group-right">
                              <div className="pod-order-meta-chips">
                                <span className="pod-chip pod-chip-items">
                                  <b>{group.items.length}</b> {group.items.length === 1 ? 'Product' : 'Products'}
                                </span>
                                <span className="pod-chip pod-chip-qty">
                                  <b>{group.totalQuantity.toLocaleString()}</b> Units
                                </span>
                                <span className="pod-chip pod-chip-date">
                                  <Calendar size={12} /> Target: {group.targetDate || '—'}
                                </span>
                                <span className="pod-stage-badge blue">Waiting Release</span>
                              </div>

                              {hasMultiple && (
                                <button
                                  type="button"
                                  className="pod-btn-start-order"
                                  disabled={isStartingOrder}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEntireOrder(group);
                                  }}
                                >
                                  <Play size={12} />
                                  <span>{isStartingOrder ? 'Starting All...' : 'Release All Items'}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Nested Items Table */}
                          {expanded && (
                            <div className="pod-order-items-table-wrapper">
                              <table className="pod-order-items-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: '22%' }}>Work Order Ref</th>
                                    <th style={{ width: '38%' }}>Product Item & Specifications</th>
                                    <th style={{ width: '13%' }}>Quantity</th>
                                    <th style={{ width: '13%' }}>Target Date</th>
                                    <th style={{ width: '14%' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.items.map((item, idx) => {
                                    const itemId = item.parentOrder?.id || item.id;
                                    const isStarting = actionLoadingId === itemId;
                                    return (
                                      <tr key={item.id || idx}>
                                        <td>
                                          <span
                                            className="pod-cell-ref"
                                            onClick={() => {
                                              const found = orders.find((o) => o.orderNo === group.orderNo);
                                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                                            }}
                                          >
                                            {item.workOrderNo}
                                          </span>
                                        </td>
                                        <td>
                                          <span className="pod-cell-bold">{item.product}</span>
                                        </td>
                                        <td>
                                          <span className="pod-cell-qty">
                                            <b>{item.quantity}</b> {item.unit || 'Units'}
                                          </span>
                                        </td>
                                        <td>
                                          <span className="pod-cell-sub">
                                            {item.targetDate || group.targetDate || '—'}
                                          </span>
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            className="pod-btn-start-job"
                                            disabled={isStarting || isStartingOrder}
                                            onClick={() => handleStartJob(item.parentOrder || item)}
                                          >
                                            <Play size={12} />
                                            <span>{isStarting ? 'Starting...' : 'Start Production'}</span>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Flat Desktop Table */
                <div className="pod-table-responsive">
                  <table className="pod-data-table">
                    <thead>
                      <tr>
                        <th>Work Order Ref</th>
                        <th>Customer & Order</th>
                        <th>Product Item</th>
                        <th>Quantity</th>
                        <th>Target Date</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIncoming.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="pod-empty-row">
                            <Inbox size={32} color="#94a3b8" />
                            <b>No incoming orders pending start</b>
                            <p>All scheduled work orders have already been released to the production floor.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredIncoming.map((order) => (
                          <tr key={order.id || order.workOrderNo}>
                            <td>
                              <span
                                className="pod-cell-ref"
                                onClick={() => {
                                  const found = orders.find((o) => o.orderNo === order.orderNo);
                                  if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                                }}
                              >
                                {order.workOrderNo}
                              </span>
                              {order.orderNo && order.orderNo !== '—' && (
                                <small className="pod-cell-sub">SO: {order.orderNo}</small>
                              )}
                            </td>
                            <td>
                              <span className="pod-cell-bold">{order.customer || 'Standard Client'}</span>
                            </td>
                            <td>
                              <span className="pod-cell-bold">{order.product}</span>
                            </td>
                            <td>
                              <b>{order.quantity}</b> Units
                            </td>
                            <td>
                              <span>{order.targetDate || '—'}</span>
                            </td>
                            <td>
                              <small className="pod-cell-sub">{order.createdAt || '—'}</small>
                            </td>
                            <td>
                              <span className="pod-stage-badge">{order.status || 'READY'}</span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="pod-btn-start-job"
                                disabled={actionLoadingId === order.id}
                                onClick={() => handleStartJob(order)}
                              >
                                <Play size={12} />
                                <span>{actionLoadingId === order.id ? 'Starting...' : 'Start Production'}</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mobile View */}
            <div className="pod-mobile-list">
              {incomingViewMode === 'orderWise' ? (
                groupedIncomingOrders.length === 0 ? (
                  <div className="pod-mobile-empty">
                    <Inbox size={28} color="#94a3b8" />
                    <b>No incoming orders pending start</b>
                    <p>All scheduled work orders have already been released to the production floor.</p>
                  </div>
                ) : (
                  groupedIncomingOrders.map((group) => {
                    const expanded = isOrderExpanded(group.key);
                    const hasMultiple = group.items.length > 1;
                    const isStartingOrder = actionLoadingId === `order-${group.key}`;
                    return (
                      <div
                        key={`m-grp-${group.key}`}
                        className={`pod-mobile-card pod-mobile-order-card ${expanded ? 'expanded' : ''}`}
                      >
                        <div
                          className="pod-mobile-card-header"
                          onClick={() => toggleOrderExpand(group.key)}
                        >
                          <div className="pod-mobile-card-title-group">
                            <span
                              className="pod-cell-ref"
                              onClick={(e) => {
                                e.stopPropagation();
                                const found = orders.find((o) => o.orderNo === group.orderNo);
                                if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                              }}
                            >
                              SO: {group.orderNo}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="pod-stage-badge blue">Waiting Release</span>
                            <ChevronDown
                              size={16}
                              style={{
                                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: 'transform 0.2s ease',
                                color: '#64748b',
                              }}
                            />
                          </div>
                        </div>

                        <div className="pod-mobile-card-body">
                          <div className="pod-mobile-card-customer">{group.customer}</div>
                          <div className="pod-mobile-card-chips">
                            <span className="pod-mobile-chip">
                              <b>{group.items.length}</b> {group.items.length === 1 ? 'Product' : 'Products'}
                            </span>
                            <span className="pod-mobile-chip">
                              <b>{group.totalQuantity}</b> Units Total
                            </span>
                            <span className="pod-mobile-chip">
                              Target: {group.targetDate || '—'}
                            </span>
                          </div>

                          {/* Nested Line Items on Mobile */}
                          {expanded && (
                            <div className="pod-mobile-order-items-list">
                              {group.items.map((item, idx) => {
                                const itemId = item.parentOrder?.id || item.id;
                                const isStarting = actionLoadingId === itemId;
                                return (
                                  <div key={`m-it-${item.id || idx}`} className="pod-mobile-order-item-row">
                                    <div className="pod-mobile-order-item-info">
                                      <span className="pod-mobile-order-item-title">{item.product}</span>
                                      <div className="pod-mobile-order-item-meta">
                                        <span className="pod-mobile-order-item-wo">{item.workOrderNo}</span>
                                        <span className="pod-mobile-order-item-qty">
                                          <b>{item.quantity}</b> Units
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="pod-btn-start-job pod-btn-mobile-item"
                                      disabled={isStarting || isStartingOrder}
                                      onClick={() => handleStartJob(item.parentOrder || item)}
                                    >
                                      <Play size={11} />
                                      <span>{isStarting ? '...' : 'Start'}</span>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {hasMultiple && (
                          <div className="pod-mobile-card-actions">
                            <button
                              type="button"
                              className="pod-btn-start-order pod-btn-mobile-full"
                              disabled={isStartingOrder}
                              onClick={() => handleStartEntireOrder(group)}
                            >
                              <Play size={13} />
                              <span>
                                {isStartingOrder
                                  ? 'Starting All Items...'
                                  : `Release All ${group.items.length} Items`}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                /* Flat Mobile List */
                filteredIncoming.length === 0 ? (
                  <div className="pod-mobile-empty">
                    <Inbox size={28} color="#94a3b8" />
                    <b>No incoming orders pending start</b>
                    <p>All scheduled work orders have already been released to the production floor.</p>
                  </div>
                ) : (
                  filteredIncoming.map((order) => (
                    <div key={`m-inc-${order.id || order.workOrderNo}`} className="pod-mobile-card">
                      <div className="pod-mobile-card-header">
                        <div className="pod-mobile-card-title-group">
                          <span
                            className="pod-cell-ref"
                            onClick={() => {
                              const found = orders.find((o) => o.orderNo === order.orderNo);
                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                            }}
                          >
                            {order.workOrderNo}
                          </span>
                          {order.orderNo && order.orderNo !== '—' && (
                            <span className="pod-mobile-card-sub">SO: {order.orderNo}</span>
                          )}
                        </div>
                        <span className="pod-stage-badge blue">{order.status || 'READY'}</span>
                      </div>

                      <div className="pod-mobile-card-body">
                        <div className="pod-mobile-card-customer">{order.customer || 'Standard Client'}</div>
                        <div className="pod-mobile-card-product">{order.product}</div>

                        <div className="pod-mobile-card-chips">
                          <span className="pod-mobile-chip">
                            <b>{order.quantity}</b> Units
                          </span>
                          <span className="pod-mobile-chip">
                            Target: {order.targetDate || '—'}
                          </span>
                          {order.createdAt && (
                            <span className="pod-mobile-chip text-muted">
                              {order.createdAt}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pod-mobile-card-actions">
                        <button
                          type="button"
                          className="pod-btn-start-job pod-btn-mobile-full"
                          disabled={actionLoadingId === order.id}
                          onClick={() => handleStartJob(order)}
                        >
                          <Play size={13} />
                          <span>{actionLoadingId === order.id ? 'Starting...' : 'Start Production'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: ACTIVE FLOOR RUNS ─── */}
        {activeTab === 'runs' && (
          <div className="pod-table-card">
            {/* Desktop Table View */}
            <div className="pod-table-responsive pod-desktop-table">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Work Order Ref</th>
                    <th>Customer</th>
                    <th>Product Item</th>
                    <th>Target Date</th>
                    <th>Stage & Machine</th>
                    <th>Progress</th>
                    <th>Floor Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveRuns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pod-empty-row">
                        <CheckCircle2 size={32} color="#10b981" />
                        <b>No active floor runs matching filter</b>
                        <p>All planned work orders have been processed or are in queue.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredActiveRuns.map((run) => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      const isOverdue = run.targetDate && run.targetDate < todayStr;
                      const startedAtTime = run.startedAt ? new Date(run.startedAt).getTime() : Date.now();
                      const currentElapsed = Math.max(0, Date.now() - startedAtTime + (run.durationMs || 0));

                      return (
                        <tr key={run.id || run.workOrderNo}>
                          <td>
                            <span
                              className="pod-cell-ref"
                              onClick={() => {
                                const found = orders.find((o) => o.orderNo === run.orderNo);
                                if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                              }}
                            >
                              {run.workOrderNo}
                            </span>
                            {run.orderNo && run.orderNo !== '—' && (
                              <small className="pod-cell-sub">SO: {run.orderNo}</small>
                            )}
                          </td>
                          <td>
                            <span className="pod-cell-bold">{run.customer || '—'}</span>
                          </td>
                          <td>
                            <span className="pod-cell-bold">{run.product}</span>
                            <small className="pod-cell-sub">
                              Qty: {run.producedQty || 0} / {run.quantity} units
                            </small>
                          </td>
                          <td>
                            <div className="pod-target-date-cell">
                              <span>{run.targetDate || '—'}</span>
                              {isOverdue && (
                                <span className="pod-badge-overdue">Overdue</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="pod-stage-badge">{run.stage || 'In Production'}</span>
                            <small className="pod-cell-sub">{run.machine || 'Press 1'}</small>
                          </td>
                          <td>
                            <div className="pod-progress-cell">
                              <div className="pod-mini-bar">
                                <div
                                  className="pod-mini-bar-fill"
                                  style={{ width: `${Math.min(100, number(run.progress))}%` }}
                                />
                              </div>
                              <span>{run.progress}%</span>
                            </div>
                          </td>
                          <td>
                            <div className="pod-stopwatch-pill">
                              <Clock size={12} />
                              <code>{formatDuration(currentElapsed)}</code>
                            </div>
                          </td>
                          <td>
                            <div className="pod-action-pair">
                              <button
                                type="button"
                                className="pod-btn-complete-run"
                                disabled={actionLoadingId === run.id}
                                onClick={() => handleCompleteRun(run)}
                              >
                                <CheckCircle2 size={12} />
                                <span>{actionLoadingId === run.id ? 'Sending...' : 'Complete & Send QC'}</span>
                              </button>
                              <button
                                type="button"
                                className="pod-btn-action"
                                onClick={() => {
                                  const found = orders.find((o) => o.orderNo === run.orderNo);
                                  if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                                }}
                              >
                                <ArrowUpRight size={13} />
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

            {/* Mobile List-Wise View */}
            <div className="pod-mobile-list">
              {filteredActiveRuns.length === 0 ? (
                <div className="pod-mobile-empty">
                  <CheckCircle2 size={28} color="#10b981" />
                  <b>No active floor runs matching filter</b>
                  <p>All planned work orders have been processed or are in queue.</p>
                </div>
              ) : (
                filteredActiveRuns.map((run) => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const isOverdue = run.targetDate && run.targetDate < todayStr;
                  const startedAtTime = run.startedAt ? new Date(run.startedAt).getTime() : Date.now();
                  const currentElapsed = Math.max(0, Date.now() - startedAtTime + (run.durationMs || 0));

                  return (
                    <div key={`m-run-${run.id || run.workOrderNo}`} className="pod-mobile-card">
                      <div className="pod-mobile-card-header">
                        <div className="pod-mobile-card-title-group">
                          <span
                            className="pod-cell-ref"
                            onClick={() => {
                              const found = orders.find((o) => o.orderNo === run.orderNo);
                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                            }}
                          >
                            {run.workOrderNo}
                          </span>
                          {run.orderNo && run.orderNo !== '—' && (
                            <span className="pod-mobile-card-sub">SO: {run.orderNo}</span>
                          )}
                        </div>
                        <div className="pod-stopwatch-pill">
                          <Clock size={11} />
                          <code>{formatDuration(currentElapsed)}</code>
                        </div>
                      </div>

                      <div className="pod-mobile-card-body">
                        <div className="pod-mobile-card-customer">{run.customer || '—'}</div>
                        <div className="pod-mobile-card-product">{run.product}</div>

                        <div className="pod-mobile-card-chips">
                          <span className="pod-mobile-chip">
                            Qty: <b>{run.producedQty || 0}</b> / {run.quantity} units
                          </span>
                          <span className="pod-mobile-chip">
                            {run.machine || 'Press 1'}
                          </span>
                          <span className={`pod-mobile-chip ${isOverdue ? 'alert' : ''}`}>
                            Due: {run.targetDate || '—'} {isOverdue && '(Overdue)'}
                          </span>
                        </div>

                        <div className="pod-progress-cell" style={{ marginTop: '8px' }}>
                          <div className="pod-mini-bar" style={{ flex: 1 }}>
                            <div
                              className="pod-mini-bar-fill"
                              style={{ width: `${Math.min(100, number(run.progress))}%` }}
                            />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '12px' }}>{run.progress}%</span>
                        </div>
                      </div>

                      <div className="pod-mobile-card-actions">
                        <button
                          type="button"
                          className="pod-btn-complete-run pod-btn-mobile-grow"
                          disabled={actionLoadingId === run.id}
                          onClick={() => handleCompleteRun(run)}
                        >
                          <CheckCircle2 size={13} />
                          <span>{actionLoadingId === run.id ? 'Sending...' : 'Complete & Send QC'}</span>
                        </button>
                        <button
                          type="button"
                          className="pod-btn-action"
                          onClick={() => {
                            const found = orders.find((o) => o.orderNo === run.orderNo);
                            if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                          }}
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: QC TESTING QUEUE ─── */}
        {activeTab === 'qcQueue' && (
          <div className="pod-table-card">
            {/* Desktop Table View */}
            <div className="pod-table-responsive pod-desktop-table">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Work Order Ref</th>
                    <th>Customer & Order</th>
                    <th>Product Item</th>
                    <th>Batch Qty</th>
                    <th>Finished Time</th>
                    <th>Operator / Shift</th>
                    <th>Inspection Stage</th>
                    <th>QC Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQcQueue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pod-empty-row">
                        <ShieldCheck size={32} color="#10b981" />
                        <b>Zero items in QC testing queue</b>
                        <p>All finished manufactured batches have completed quality inspection.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredQcQueue.map((item) => (
                      <tr key={item.id || item.workOrderNo}>
                        <td>
                          <span
                            className="pod-cell-ref"
                            onClick={() => {
                              const found = orders.find((o) => o.orderNo === item.orderNo);
                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                            }}
                          >
                            {item.workOrderNo}
                          </span>
                          {item.orderNo && item.orderNo !== '—' && (
                            <small className="pod-cell-sub">SO: {item.orderNo}</small>
                          )}
                        </td>
                        <td>
                          <span className="pod-cell-bold">{item.customer || 'Standard Client'}</span>
                        </td>
                        <td>
                          <span className="pod-cell-bold">{item.product}</span>
                        </td>
                        <td>
                          <b>{item.quantity}</b> Units
                        </td>
                        <td>
                          <small className="pod-cell-sub">{item.completedAt ? String(item.completedAt).slice(0, 16).replace('T', ' ') : '—'}</small>
                        </td>
                        <td>
                          <span>{item.operator || 'Shift Operator'}</span>
                        </td>
                        <td>
                          <span className="pod-stage-badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                            {item.stage || 'Quality Inspection'}
                          </span>
                        </td>
                        <td>
                          <div className="pod-action-pair">
                            <button
                              type="button"
                              className="pod-btn-qc-pass"
                              disabled={actionLoadingId === item.id}
                              onClick={() => handlePassQC(item)}
                            >
                              <CheckCircle2 size={12} />
                              <span>{actionLoadingId === item.id ? 'Passing...' : 'Pass QC'}</span>
                            </button>
                            <button
                              type="button"
                              className="pod-btn-qc-fail"
                              onClick={() => setFailModalItem(item)}
                            >
                              <AlertOctagon size={12} />
                              <span>Fail QC</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List-Wise View */}
            <div className="pod-mobile-list">
              {filteredQcQueue.length === 0 ? (
                <div className="pod-mobile-empty">
                  <ShieldCheck size={28} color="#10b981" />
                  <b>Zero items in QC testing queue</b>
                  <p>All finished batches have completed quality inspection.</p>
                </div>
              ) : (
                filteredQcQueue.map((item) => (
                  <div key={`m-qc-${item.id || item.workOrderNo}`} className="pod-mobile-card">
                    <div className="pod-mobile-card-header">
                      <div className="pod-mobile-card-title-group">
                        <span
                          className="pod-cell-ref"
                          onClick={() => {
                            const found = orders.find((o) => o.orderNo === item.orderNo);
                            if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                          }}
                        >
                          {item.workOrderNo}
                        </span>
                        {item.orderNo && item.orderNo !== '—' && (
                          <span className="pod-mobile-card-sub">SO: {item.orderNo}</span>
                        )}
                      </div>
                      <span className="pod-stage-badge purple">Quality Inspection</span>
                    </div>

                    <div className="pod-mobile-card-body">
                      <div className="pod-mobile-card-customer">{item.customer || 'Standard Client'}</div>
                      <div className="pod-mobile-card-product">{item.product}</div>

                      <div className="pod-mobile-card-chips">
                        <span className="pod-mobile-chip">
                          Batch: <b>{item.quantity}</b> Units
                        </span>
                        <span className="pod-mobile-chip">
                          Inspector: {item.operator || 'Floor Operator'}
                        </span>
                        {item.completedAt && (
                          <span className="pod-mobile-chip text-muted">
                            {String(item.completedAt).slice(0, 10)}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <div className="pod-mobile-notes">Notes: {item.notes}</div>
                      )}
                    </div>

                    <div className="pod-mobile-card-actions">
                      <button
                        type="button"
                        className="pod-btn-qc-pass pod-btn-mobile-grow"
                        disabled={actionLoadingId === item.id}
                        onClick={() => handlePassQC(item)}
                      >
                        <CheckCircle2 size={13} />
                        <span>{actionLoadingId === item.id ? 'Passing...' : 'Pass QC'}</span>
                      </button>
                      <button
                        type="button"
                        className="pod-btn-qc-fail"
                        onClick={() => setFailModalItem(item)}
                      >
                        <AlertOctagon size={13} />
                        <span>Fail QC</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: QC FAILED / REWORK QUEUE ─── */}
        {activeTab === 'qcFailed' && (
          <div className="pod-table-card">
            {/* Desktop Table View */}
            <div className="pod-table-responsive pod-desktop-table">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Work Order Ref</th>
                    <th>Product</th>
                    <th>Failed Qty</th>
                    <th>Failure Reason</th>
                    <th>QC Remarks</th>
                    <th>Rework Iteration</th>
                    <th>Status</th>
                    <th>Rework Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQcFailed.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pod-empty-row">
                        <CheckCircle2 size={32} color="#10b981" />
                        <b>Zero Defect / QC Failed Work Orders</b>
                        <p>All batches have cleared inspection or completed their rework cycle.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredQcFailed.map((job) => (
                      <tr key={job.id || job.workOrderNo}>
                        <td>
                          <span className="pod-cell-ref">{job.workOrderNo}</span>
                          {job.orderNo && job.orderNo !== '—' && (
                            <small className="pod-cell-sub">SO: {job.orderNo}</small>
                          )}
                        </td>
                        <td>
                          <span className="pod-cell-bold">{job.product}</span>
                        </td>
                        <td>
                          <b style={{ color: '#ef4444' }}>{job.failedQty}</b> Units
                        </td>
                        <td>
                          <span className="pod-reason-text" style={{ color: '#dc2626', fontWeight: 700 }}>
                            {job.failureReason}
                          </span>
                        </td>
                        <td>
                          <small className="pod-cell-sub">{job.qcRemarks || 'Tolerance deviation'}</small>
                        </td>
                        <td>
                          <span className="pod-tab-counter warning">Attempt #{job.reworkCount || 1}</span>
                        </td>
                        <td>
                          <span className="pod-stage-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <div className="pod-action-pair">
                            <button
                              type="button"
                              className="pod-btn pod-btn-secondary pod-btn-compact"
                              disabled={actionLoadingId === job.id}
                              onClick={() => handleStartRework(job)}
                            >
                              <RotateCcw size={13} />
                              <span>Start Rework</span>
                            </button>
                            <button
                              type="button"
                              className="pod-btn pod-btn-primary pod-btn-compact"
                              disabled={actionLoadingId === job.id}
                              onClick={() => handleCompleteRework(job)}
                            >
                              <ShieldCheck size={13} />
                              <span>Complete & QC</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List-Wise View */}
            <div className="pod-mobile-list">
              {filteredQcFailed.length === 0 ? (
                <div className="pod-mobile-empty">
                  <CheckCircle2 size={28} color="#10b981" />
                  <b>Zero Defect / QC Failed Work Orders</b>
                  <p>All batches have cleared inspection or completed rework.</p>
                </div>
              ) : (
                filteredQcFailed.map((job) => (
                  <div key={`m-fail-${job.id || job.workOrderNo}`} className="pod-mobile-card">
                    <div className="pod-mobile-card-header">
                      <div className="pod-mobile-card-title-group">
                        <span className="pod-cell-ref">{job.workOrderNo}</span>
                        {job.orderNo && job.orderNo !== '—' && (
                          <span className="pod-mobile-card-sub">SO: {job.orderNo}</span>
                        )}
                      </div>
                      <span className="pod-tab-counter warning">Attempt #{job.reworkCount || 1}</span>
                    </div>

                    <div className="pod-mobile-card-body">
                      <div className="pod-mobile-card-product">{job.product}</div>
                      <div className="pod-reason-text" style={{ color: '#dc2626', fontWeight: 700, margin: '4px 0' }}>
                        Defect: {job.failureReason}
                      </div>
                      {job.qcRemarks && (
                        <div className="pod-mobile-notes">Remarks: {job.qcRemarks}</div>
                      )}

                      <div className="pod-mobile-card-chips">
                        <span className="pod-mobile-chip alert">
                          Failed: <b>{job.failedQty}</b> Units
                        </span>
                        <span className="pod-mobile-chip">
                          Shift: {job.shift || 'Morning'}
                        </span>
                      </div>
                    </div>

                    <div className="pod-mobile-card-actions">
                      <button
                        type="button"
                        className="pod-btn pod-btn-secondary pod-btn-mobile-grow"
                        disabled={actionLoadingId === job.id}
                        onClick={() => handleStartRework(job)}
                      >
                        <RotateCcw size={13} />
                        <span>Start Rework</span>
                      </button>
                      <button
                        type="button"
                        className="pod-btn pod-btn-primary pod-btn-mobile-grow"
                        disabled={actionLoadingId === job.id}
                        onClick={() => handleCompleteRework(job)}
                      >
                        <ShieldCheck size={13} />
                        <span>Complete & QC</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 5: READY FOR DISPATCH ─── */}
        {activeTab === 'readyDispatch' && (
          <div className="pod-table-card">
            {/* Batch Toolbar */}
            {selectedDispatchIds.length > 0 && (
              <div className="pod-batch-toolbar">
                <div className="pod-batch-info">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>
                    <b>{selectedDispatchIds.length}</b> work order(s) selected for dispatch
                  </span>
                </div>
                <button
                  type="button"
                  className="pod-btn-dispatch"
                  disabled={dispatching}
                  onClick={handleBatchSendToDispatch}
                >
                  <Truck size={14} />
                  <span>{dispatching ? 'Dispatching...' : `Send ${selectedDispatchIds.length} Selected to Dispatch`}</span>
                </button>
              </div>
            )}

            {/* Desktop Table View */}
            <div className="pod-table-responsive pod-desktop-table">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '38px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className="pod-checkbox"
                        checked={readyForDispatch.length > 0 && selectedDispatchIds.length === readyForDispatch.length}
                        onChange={handleToggleSelectAllDispatch}
                        title="Select All for Dispatch"
                      />
                    </th>
                    <th>Work Order Ref</th>
                    <th>Customer & Order</th>
                    <th>Product Item</th>
                    <th>Ready Qty</th>
                    <th>QC Certification</th>
                    <th>Inspection Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadyDispatch.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pod-empty-row">
                        <Truck size={32} color="#94a3b8" />
                        <b>No work orders waiting for dispatch</b>
                        <p>All QC certified goods have already been sent to the logistics dispatch bay.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReadyDispatch.map((item) => {
                      const isSelected = selectedDispatchIds.includes(item.id);
                      return (
                        <tr key={item.id || item.workOrderNo} style={{ background: isSelected ? '#f0fdf4' : undefined }}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              className="pod-checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectDispatch(item.id)}
                            />
                          </td>
                          <td>
                            <span
                              className="pod-cell-ref"
                              onClick={() => {
                                const found = orders.find((o) => o.orderNo === item.orderNo);
                                if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                              }}
                            >
                              {item.workOrderNo}
                            </span>
                            {item.orderNo && item.orderNo !== '—' && (
                              <small className="pod-cell-sub">SO: {item.orderNo}</small>
                            )}
                          </td>
                          <td>
                            <span className="pod-cell-bold">{item.customer || 'Standard Client'}</span>
                          </td>
                          <td>
                            <span className="pod-cell-bold">{item.product}</span>
                          </td>
                          <td>
                            <b style={{ color: '#059669' }}>{item.quantity}</b> Units
                          </td>
                          <td>
                            <span className="pod-stage-badge" style={{ background: '#d1fae5', color: '#065f46', fontWeight: 800 }}>
                              ✓ PASS - Certified
                            </span>
                          </td>
                          <td>
                            <small className="pod-cell-sub">{item.completedAt ? String(item.completedAt).slice(0, 10) : 'Today'}</small>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="pod-btn-dispatch"
                              disabled={actionLoadingId === item.id}
                              onClick={() => handleSendToDispatch(item)}
                            >
                              <Truck size={13} />
                              <span>{actionLoadingId === item.id ? 'Sending...' : 'Send to Dispatch'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List-Wise View */}
            <div className="pod-mobile-list">
              {filteredReadyDispatch.length === 0 ? (
                <div className="pod-mobile-empty">
                  <Truck size={28} color="#94a3b8" />
                  <b>No work orders waiting for dispatch</b>
                  <p>All QC certified goods have been sent to logistics.</p>
                </div>
              ) : (
                filteredReadyDispatch.map((item) => {
                  const isSelected = selectedDispatchIds.includes(item.id);
                  return (
                    <div
                      key={`m-disp-${item.id || item.workOrderNo}`}
                      className="pod-mobile-card"
                      style={{ borderColor: isSelected ? '#10b981' : undefined }}
                    >
                      <div className="pod-mobile-card-header">
                        <div className="pod-mobile-card-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            className="pod-checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectDispatch(item.id)}
                          />
                          <span
                            className="pod-cell-ref"
                            onClick={() => {
                              const found = orders.find((o) => o.orderNo === item.orderNo);
                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                            }}
                          >
                            {item.workOrderNo}
                          </span>
                        </div>
                        <span className="pod-stage-badge emerald">✓ Certified</span>
                      </div>

                      <div className="pod-mobile-card-body">
                        <div className="pod-mobile-card-customer">{item.customer || 'Standard Client'}</div>
                        <div className="pod-mobile-card-product">{item.product}</div>

                        <div className="pod-mobile-card-chips">
                          <span className="pod-mobile-chip green">
                            Ready: <b>{item.quantity}</b> Units
                          </span>
                          <span className="pod-mobile-chip text-muted">
                            Passed: {item.completedAt ? String(item.completedAt).slice(0, 10) : 'Today'}
                          </span>
                        </div>
                      </div>

                      <div className="pod-mobile-card-actions">
                        <button
                          type="button"
                          className="pod-btn-dispatch pod-btn-mobile-full"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleSendToDispatch(item)}
                        >
                          <Truck size={13} />
                          <span>{actionLoadingId === item.id ? 'Sending...' : 'Send to Dispatch'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 6: DONE / DISPATCHED JOBS ─── */}
        {activeTab === 'done' && (
          <div className="pod-table-card">
            {/* Desktop Table View */}
            <div className="pod-table-responsive pod-desktop-table">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Work Order Ref</th>
                    <th>Customer & Order</th>
                    <th>Product Item</th>
                    <th>Completed Qty</th>
                    <th>Dispatched Date</th>
                    <th>Fulfillment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoneJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="pod-empty-row">
                        <PackageCheck size={32} color="#94a3b8" />
                        <b>No completed or dispatched orders in this window</b>
                        <p>Finished goods dispatched to logistics will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDoneJobs.map((item) => (
                      <tr key={item.id || item.workOrderNo}>
                        <td>
                          <span
                            className="pod-cell-ref"
                            onClick={() => {
                              const found = orders.find((o) => o.orderNo === item.orderNo);
                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                            }}
                          >
                            {item.workOrderNo}
                          </span>
                          {item.orderNo && item.orderNo !== '—' && (
                            <small className="pod-cell-sub">SO: {item.orderNo}</small>
                          )}
                        </td>
                        <td>
                          <span className="pod-cell-bold">{item.customer || 'Standard Client'}</span>
                        </td>
                        <td>
                          <span className="pod-cell-bold">{item.product}</span>
                        </td>
                        <td>
                          <b>{item.quantity}</b> Units
                        </td>
                        <td>
                          <span>{item.dispatchedAt ? String(item.dispatchedAt).slice(0, 10) : '—'}</span>
                        </td>
                        <td>
                          <span className="pod-stage-badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800 }}>
                            {item.status === 'DISPATCHED' ? '✓ Dispatched to Logistics' : '✓ Completed'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="pod-btn-action"
                            onClick={() => {
                              const found = orders.find((o) => o.orderNo === item.orderNo);
                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                            }}
                          >
                            <span>Inspect</span>
                            <ArrowUpRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List-Wise View */}
            <div className="pod-mobile-list">
              {filteredDoneJobs.length === 0 ? (
                <div className="pod-mobile-empty">
                  <PackageCheck size={28} color="#94a3b8" />
                  <b>No completed or dispatched orders in this window</b>
                  <p>Finished goods dispatched to logistics will appear here.</p>
                </div>
              ) : (
                filteredDoneJobs.map((item) => (
                  <div key={`m-done-${item.id || item.workOrderNo}`} className="pod-mobile-card">
                    <div className="pod-mobile-card-header">
                      <div className="pod-mobile-card-title-group">
                        <span
                          className="pod-cell-ref"
                          onClick={() => {
                            const found = orders.find((o) => o.orderNo === item.orderNo);
                            if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                          }}
                        >
                          {item.workOrderNo}
                        </span>
                        {item.orderNo && item.orderNo !== '—' && (
                          <span className="pod-mobile-card-sub">SO: {item.orderNo}</span>
                        )}
                      </div>
                      <span className="pod-stage-badge green">
                        {item.status === 'DISPATCHED' ? '✓ Dispatched' : '✓ Completed'}
                      </span>
                    </div>

                    <div className="pod-mobile-card-body">
                      <div className="pod-mobile-card-customer">{item.customer || 'Standard Client'}</div>
                      <div className="pod-mobile-card-product">{item.product}</div>

                      <div className="pod-mobile-card-chips">
                        <span className="pod-mobile-chip green">
                          <b>{item.quantity}</b> Units
                        </span>
                        <span className="pod-mobile-chip text-muted">
                          Date: {item.dispatchedAt ? String(item.dispatchedAt).slice(0, 10) : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="pod-mobile-card-actions">
                      <button
                        type="button"
                        className="pod-btn pod-btn-secondary pod-btn-mobile-full"
                        onClick={() => {
                          const found = orders.find((o) => o.orderNo === item.orderNo);
                          if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                        }}
                      >
                        <ArrowUpRight size={13} />
                        <span>View Order Details</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 7: DELAYED / OVERDUE JOBS ─── */}
        {activeTab === 'delayed' && (
          <div className="pod-table-card">
            {/* Desktop Table View */}
            <div className="pod-table-responsive pod-desktop-table">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Work Order</th>
                    <th>Customer & Order</th>
                    <th>Product</th>
                    <th>Planned Qty</th>
                    <th>Target Date</th>
                    <th>Days Overdue</th>
                    <th>Priority</th>
                    <th>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDelayedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pod-empty-row">
                        <CheckCircle2 size={32} color="#10b981" />
                        <b>Zero Delayed Jobs</b>
                        <p>All floor operations are running strictly on schedule.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDelayedJobs.map((job) => (
                      <tr key={job.id || job.workOrderNo} className="pod-row-alert">
                        <td>
                          <span className="pod-cell-ref">{job.workOrderNo}</span>
                        </td>
                        <td>
                          <span className="pod-cell-bold">{job.customer}</span>
                          <small className="pod-cell-sub">SO: {job.orderNo}</small>
                        </td>
                        <td>
                          <span className="pod-cell-bold">{job.product}</span>
                        </td>
                        <td>{job.quantity} Units</td>
                        <td>
                          <span className="pod-date-alert">{job.targetDate}</span>
                        </td>
                        <td>
                          <span className="pod-badge-overdue">
                            {job.daysOverdue ? `${job.daysOverdue} days late` : 'Overdue'}
                          </span>
                        </td>
                        <td>
                          <span className="pod-priority-pill critical">CRITICAL</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="pod-btn-resolve"
                            onClick={() => {
                              const found = orders.find((o) => o.orderNo === job.orderNo);
                              if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                            }}
                          >
                            Expedite Job
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List-Wise View */}
            <div className="pod-mobile-list">
              {filteredDelayedJobs.length === 0 ? (
                <div className="pod-mobile-empty">
                  <CheckCircle2 size={28} color="#10b981" />
                  <b>Zero Delayed Jobs</b>
                  <p>All floor operations are running strictly on schedule.</p>
                </div>
              ) : (
                filteredDelayedJobs.map((job) => (
                  <div key={`m-dly-${job.id || job.workOrderNo}`} className="pod-mobile-card alert">
                    <div className="pod-mobile-card-header">
                      <div className="pod-mobile-card-title-group">
                        <span className="pod-cell-ref">{job.workOrderNo}</span>
                        {job.orderNo && job.orderNo !== '—' && (
                          <span className="pod-mobile-card-sub">SO: {job.orderNo}</span>
                        )}
                      </div>
                      <span className="pod-badge-overdue">
                        {job.daysOverdue ? `${job.daysOverdue}d late` : 'Overdue'}
                      </span>
                    </div>

                    <div className="pod-mobile-card-body">
                      <div className="pod-mobile-card-customer">{job.customer}</div>
                      <div className="pod-mobile-card-product">{job.product}</div>

                      <div className="pod-mobile-card-chips">
                        <span className="pod-mobile-chip">
                          Qty: <b>{job.quantity}</b> Units
                        </span>
                        <span className="pod-mobile-chip alert">
                          Target: {job.targetDate}
                        </span>
                        <span className="pod-priority-pill critical">CRITICAL</span>
                      </div>
                    </div>

                    <div className="pod-mobile-card-actions">
                      <button
                        type="button"
                        className="pod-btn-resolve pod-btn-mobile-full"
                        onClick={() => {
                          const found = orders.find((o) => o.orderNo === job.orderNo);
                          if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                        }}
                      >
                        Expedite Job
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 8: SHIFT LOG LEDGER ─── */}
        {activeTab === 'shiftLogs' && (
          <div className="pod-table-card">
            {/* Desktop Table View */}
            <div className="pod-table-responsive pod-desktop-table">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Date & Shift</th>
                    <th>Work Order</th>
                    <th>Product</th>
                    <th>Supervisor</th>
                    <th>Target</th>
                    <th>Produced</th>
                    <th>Rejected</th>
                    <th>Rework</th>
                    <th>Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShiftEntries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="pod-empty-row">
                        <Factory size={32} color="#94a3b8" />
                        <b>No Shift Entries Recorded</b>
                        <p>No shift logs recorded for the selected timeframe.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredShiftEntries.map((entry, idx) => {
                      const eff = entry.efficiency != null ? Number(entry.efficiency).toFixed(1) : '100.0';
                      return (
                        <tr key={entry.id || idx}>
                          <td>
                            <div className="pod-shift-cell">
                              <span className={`pod-shift-badge ${entry.shift?.toLowerCase()}`}>
                                {entry.shift || 'Morning'}
                              </span>
                              <small>{entry.date ? entry.date.slice(0, 10) : '—'}</small>
                            </div>
                          </td>
                          <td>
                            <span className="pod-cell-ref">{entry.workOrder || '—'}</span>
                          </td>
                          <td>
                            <span className="pod-cell-bold">{entry.product || '—'}</span>
                          </td>
                          <td>{entry.supervisor || 'Shift Incharge'}</td>
                          <td><b>{entry.targetQty}</b></td>
                          <td><b style={{ color: '#2563eb' }}>{entry.producedQty}</b></td>
                          <td>
                            <span style={{ color: number(entry.rejectedQty) > 0 ? '#ef4444' : '#64748b' }}>
                              {entry.rejectedQty || 0}
                            </span>
                          </td>
                          <td>{entry.reworkQty || 0}</td>
                          <td>
                            <span
                              className={`pod-eff-badge ${
                                Number(eff) >= 90 ? 'good' : Number(eff) >= 80 ? 'ok' : 'low'
                              }`}
                            >
                              {eff}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List-Wise View */}
            <div className="pod-mobile-list">
              {filteredShiftEntries.length === 0 ? (
                <div className="pod-mobile-empty">
                  <Factory size={28} color="#94a3b8" />
                  <b>No Shift Entries Recorded</b>
                  <p>No shift logs recorded for the selected timeframe.</p>
                </div>
              ) : (
                filteredShiftEntries.map((entry, idx) => {
                  const eff = entry.efficiency != null ? Number(entry.efficiency).toFixed(1) : '100.0';
                  return (
                    <div key={`m-shf-${entry.id || idx}`} className="pod-mobile-card">
                      <div className="pod-mobile-card-header">
                        <div className="pod-shift-cell" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                          <span className={`pod-shift-badge ${entry.shift?.toLowerCase()}`}>
                            {entry.shift || 'Morning'}
                          </span>
                          <span className="pod-mobile-card-sub">{entry.date ? entry.date.slice(0, 10) : '—'}</span>
                        </div>
                        <span
                          className={`pod-eff-badge ${
                            Number(eff) >= 90 ? 'good' : Number(eff) >= 80 ? 'ok' : 'low'
                          }`}
                        >
                          {eff}% Eff
                        </span>
                      </div>

                      <div className="pod-mobile-card-body">
                        <div className="pod-cell-ref" style={{ marginBottom: '2px' }}>{entry.workOrder || '—'}</div>
                        <div className="pod-mobile-card-product">{entry.product || '—'}</div>
                        <div className="pod-mobile-card-sub" style={{ margin: '4px 0' }}>
                          Supervisor: {entry.supervisor || 'Shift Incharge'}
                        </div>

                        <div className="pod-mobile-card-chips">
                          <span className="pod-mobile-chip">Target: <b>{entry.targetQty}</b></span>
                          <span className="pod-mobile-chip green">Produced: <b>{entry.producedQty}</b></span>
                          <span className={`pod-mobile-chip ${number(entry.rejectedQty) > 0 ? 'alert' : ''}`}>
                            Defects: <b>{entry.rejectedQty || 0}</b>
                          </span>
                          <span className="pod-mobile-chip">Rework: <b>{entry.reworkQty || 0}</b></span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>

      {/* ─── MODAL: QC INSPECTION FAILURE / REWORK ─── */}
      {failModalItem && (
        <Modal
          title={`Mark QC Failure — ${failModalItem.workOrderNo}`}
          subtitle="Quality Defect & Rework Logging"
          onClose={() => setFailModalItem(null)}
        >
          <form onSubmit={submitFailQC}>
            <div className="pod-form-grid">
              <Field label="Defect / Failure Reason" required>
                <select
                  value={failForm.failureReason}
                  onChange={(e) => setFailForm({ ...failForm, failureReason: e.target.value })}
                >
                  <option value="Dimensional Tolerance Exceeded">Dimensional Tolerance Exceeded</option>
                  <option value="Surface Defect / Blister">Surface Defect / Blister</option>
                  <option value="Resin Starvation / Dry Fibers">Resin Starvation / Dry Fibers</option>
                  <option value="Color / Appearance Mismatch">Color / Appearance Mismatch</option>
                  <option value="Incomplete Curing / Soft Spot">Incomplete Curing / Soft Spot</option>
                  <option value="Structural Crack / Porosity">Structural Crack / Porosity</option>
                  <option value="Weight / Density Out of Spec">Weight / Density Out of Spec</option>
                  <option value="Other Defect">Other Defect</option>
                </select>
              </Field>

              <Field label="Failed Product Item">
                <input value={failModalItem.product || '—'} disabled />
              </Field>

              <Field label="Rejected Quantity (Units)">
                <input value={`${failModalItem.quantity || 1} Units`} disabled />
              </Field>

              <Field label="Inspector Notes & Remarks">
                <textarea
                  placeholder="Describe specific defect location, measurement delta, or rework instruction..."
                  value={failForm.remarks}
                  onChange={(e) => setFailForm({ ...failForm, remarks: e.target.value })}
                />
              </Field>
            </div>

            <footer>
              <button
                type="button"
                className="pod-btn pod-btn-ghost"
                onClick={() => setFailModalItem(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pod-btn pod-btn-primary"
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm QC Failure & Queue for Rework'}
              </button>
            </footer>
          </form>
        </Modal>
      )}

      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="pod-toast">
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── MODAL 1: ADD SHIFT ENTRY ─── */}
      {modal === 'shift' && (
        <Modal
          title="Log Shift Production Run"
          subtitle="Shopfloor Output Ledger"
          onClose={() => setModal(null)}
        >
          <form onSubmit={submitShift}>
            <div className="pod-form-grid">
              <Field label="Shift Operating Window" required>
                <select
                  value={shiftForm.shift}
                  onChange={(e) => setShiftForm({ ...shiftForm, shift: e.target.value })}
                >
                  <option value="Morning">Morning Shift (06:00 - 14:00)</option>
                  <option value="Night">Night Shift (14:00 - 22:00 / 22:00 - 06:00)</option>
                </select>
              </Field>

              <Field label="Work Order" required>
                <select
                  required
                  value={shiftForm.workOrderId}
                  onChange={(e) => setShiftForm({ ...shiftForm, workOrderId: e.target.value })}
                >
                  <option value="">Select Work Order</option>
                  {workOrders.map((wo, idx) => (
                    <option
                      key={`${workOrderRef(wo)}-${idx}`}
                      value={String(wo.id || wo.workOrderId || wo.workOrderNo)}
                    >
                      {workOrderRef(wo)} — {productName(wo)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Product Item">
                <input value={productName(selectedShiftWO || {})} disabled />
              </Field>

              <Field label="Shift Supervisor / Incharge" required>
                <input
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={shiftForm.supervisor}
                  onChange={(e) => setShiftForm({ ...shiftForm, supervisor: e.target.value })}
                />
              </Field>

              <Field label="Planned Target Qty" required>
                <input
                  required
                  min="0"
                  type="number"
                  placeholder="Target units"
                  value={shiftForm.targetQty}
                  onChange={(e) => setShiftForm({ ...shiftForm, targetQty: e.target.value })}
                />
              </Field>

              <Field label="Actual Produced Qty" required>
                <input
                  required
                  min="0"
                  type="number"
                  placeholder="Finished units"
                  value={shiftForm.producedQty}
                  onChange={(e) => setShiftForm({ ...shiftForm, producedQty: e.target.value })}
                />
              </Field>

              <Field label="Rejected Units">
                <input
                  min="0"
                  type="number"
                  placeholder="Defects count"
                  value={shiftForm.rejectedQty}
                  onChange={(e) => setShiftForm({ ...shiftForm, rejectedQty: e.target.value })}
                />
              </Field>

              <Field label="Rework Allocated Qty">
                <input
                  min="0"
                  type="number"
                  placeholder="Units sent to rework"
                  value={shiftForm.reworkQty}
                  onChange={(e) => setShiftForm({ ...shiftForm, reworkQty: e.target.value })}
                />
              </Field>

              <Field label="Production Date" required>
                <input
                  required
                  type="date"
                  value={shiftForm.date}
                  onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                />
              </Field>
            </div>

            <footer>
              <button
                type="button"
                className="pod-btn pod-btn-ghost"
                onClick={() => setModal(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pod-btn pod-btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Record Shift Output'}
              </button>
            </footer>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 2: LOG SCRAP / WASTAGE ─── */}
      {modal === 'scrap' && (
        <Modal
          title="Record Process Scrap & Wastage"
          subtitle="Material Defect & Waste Ledger"
          onClose={() => setModal(null)}
        >
          <form onSubmit={submitScrap}>
            <div className="pod-form-grid">
              <Field label="Work Order" required>
                <select
                  required
                  value={scrapForm.workOrderId}
                  onChange={(e) => setScrapForm({ ...scrapForm, workOrderId: e.target.value })}
                >
                  <option value="">Select Work Order</option>
                  {workOrders.map((wo, idx) => (
                    <option
                      key={`${workOrderRef(wo)}-${idx}`}
                      value={String(wo.id || wo.workOrderId || wo.workOrderNo)}
                    >
                      {workOrderRef(wo)} — {productName(wo)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Product / Compound">
                <input value={productName(selectedScrapWO || {})} disabled />
              </Field>

              <Field label="Shift">
                <select
                  value={scrapForm.shift}
                  onChange={(e) => setScrapForm({ ...scrapForm, shift: e.target.value })}
                >
                  <option value="Morning">Morning Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </Field>

              <Field label="Scrap Qty (Units / Kg)" required>
                <input
                  required
                  min="0"
                  type="number"
                  placeholder="Scrapped volume"
                  value={scrapForm.scrapQty}
                  onChange={(e) => setScrapForm({ ...scrapForm, scrapQty: e.target.value })}
                />
              </Field>

              <Field label="Wastage Qty (Units / Kg)">
                <input
                  min="0"
                  type="number"
                  placeholder="Unrecoverable waste"
                  value={scrapForm.wastageQty}
                  onChange={(e) => setScrapForm({ ...scrapForm, wastageQty: e.target.value })}
                />
              </Field>

              <Field label="Root Cause / Category" required>
                <select
                  value={scrapForm.category}
                  onChange={(e) => setScrapForm({ ...scrapForm, category: e.target.value })}
                >
                  <option value="Process Scrap">Process Scrap (Trimming / Flash)</option>
                  <option value="Material Defect">Material Defect (Blister / Porosity)</option>
                  <option value="Machine Loss">Machine Loss (Hydraulic Pressure Drop)</option>
                  <option value="Handling Damage">Handling Damage</option>
                  <option value="Other">Other Operational Loss</option>
                </select>
              </Field>

              <Field label="Supervisor" required>
                <input
                  required
                  placeholder="Reporting supervisor"
                  value={scrapForm.supervisor}
                  onChange={(e) => setScrapForm({ ...scrapForm, supervisor: e.target.value })}
                />
              </Field>

              <Field label="Incident Date" required>
                <input
                  required
                  type="date"
                  value={scrapForm.date}
                  onChange={(e) => setScrapForm({ ...scrapForm, date: e.target.value })}
                />
              </Field>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Root-Cause Remarks">
                  <textarea
                    rows={3}
                    placeholder="Specify defect observation, mold cavity number, or scrap reasoning..."
                    value={scrapForm.remarks}
                    onChange={(e) => setScrapForm({ ...scrapForm, remarks: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            <footer>
              <button
                type="button"
                className="pod-btn pod-btn-ghost"
                onClick={() => setModal(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pod-btn pod-btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Record Scrap Entry'}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
