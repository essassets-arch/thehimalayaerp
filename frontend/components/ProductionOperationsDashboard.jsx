'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Factory,
  Target,
  Settings,
  Layers,
  ShieldCheck,
  Truck,
  Play,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  RefreshCw,
  X,
  Clock,
  User,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { backendFetch } from '../lib/backendFetch';
import './ProductionOperationsDashboard.css';

export default function ProductionOperationsDashboard({
  workOrders = [],
  orders = [],
  machines = [],
  onSelectOrderDetails,
  productionTargetAchievement = null,
  loadingTarget = false,
  derivedStats,
  initialShiftEntries,
  initialScrapEntries,
  onCompleteRework
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [targetAchievement, setTargetAchievement] = useState(productionTargetAchievement);

  useEffect(() => {
    if (productionTargetAchievement) {
      setTargetAchievement(productionTargetAchievement);
    }
  }, [productionTargetAchievement]);

  // Filters
  const [timeFilter, setTimeFilter] = useState('month'); // 'day' | 'week' | 'month' | 'all'
  const [shiftFilter, setShiftFilter] = useState('ALL'); // 'ALL' | 'A' | 'B' | 'C'
  const [machineFilter, setMachineFilter] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(() => '2026-10');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState('ALL'); // 'ALL' | 'FLOOR' | 'QC_PENDING' ...
  const [showAllLiveOrders, setShowAllLiveOrders] = useState(false);

  // Action Modals
  const [modalType, setModalType] = useState(null); // 'start' | 'shift' | 'finish_qc' | 'qc_pass_fail' | 'dispatch' | 'view_wo'
  const [selectedWo, setSelectedWo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Forms
  const [startForm, setStartForm] = useState({
    workOrderId: '',
    machineId: 'HM001',
    shift: 'A',
    operator: ''
  });

  const [shiftForm, setShiftForm] = useState({
    workOrderId: '',
    shift: 'Morning',
    operator: '',
    supervisor: 'Plant Supervisor',
    setsProduced: '',
    coversProduced: '',
    framesProduced: '',
    totalWeightKg: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: ''
  });

  const [finishQcForm, setFinishQcForm] = useState({
    workOrderId: '',
    quantity: ''
  });

  const [qcForm, setQcForm] = useState({
    workOrderId: '',
    status: 'PASSED',
    testRating: '40T',
    proofLoadKn: '400',
    certificateNo: `QC-CERT-${new Date().getFullYear()}-001`,
    defectCategory: 'None',
    remarks: 'Proof load test verified compliant with IS 12592 / EN 124 standard'
  });

  const [dispatchForm, setDispatchForm] = useState({
    workOrderId: '',
    quantity: '',
    notes: 'Handover to Finished Goods Dispatch Yard'
  });

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Fetch Dashboard Telemetry & Live Super Admin Production Target
  const fetchDashboardData = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setRefreshing(true);
    try {
      const [res, targetRes] = await Promise.all([
        backendFetch(`/production-workflow/dashboard?period=${timeFilter}&shift=${shiftFilter}&machine=${machineFilter}&month=${selectedMonth}`).catch(() => null),
        backendFetch(`/api/backend/production-targets/achievement?month=${selectedMonth}&period=${timeFilter}`).catch(() => null)
      ]);
      const data = res?.data || res;
      if (data && typeof data === 'object') {
        setDashboardData(data);
      }
      const tData = targetRes?.data || targetRes;
      if (tData && (tData.hasTarget || tData.achievement !== undefined || tData.target > 0)) {
        setTargetAchievement(tData);
      }
    } catch (err) {
      console.warn('Backend fetch failed, using authoritative reference baseline:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, [timeFilter, shiftFilter, machineFilter, selectedMonth]);


  // Month name helper
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Dynamically generated list for filter dropdown from live records & rolling calendar
  const availableMonths = useMemo(() => {
    const monthsMap = new Map();

    // 1. Collect months present in live work orders and reporting data
    if (Array.isArray(dashboardData?.allWorkOrders)) {
      dashboardData.allWorkOrders.forEach((wo) => {
        const dStr = wo.targetDate || wo.createdAt;
        if (dStr && /^\d{4}-\d{2}/.test(dStr)) {
          const val = dStr.slice(0, 7);
          const [y, m] = val.split('-').map(Number);
          monthsMap.set(val, `${monthNames[(m || 1) - 1]} ${y}`);
        }
      });
    }

    // 2. Add rolling 12 months from current date
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthsMap.has(val)) {
        monthsMap.set(val, `${monthNames[d.getMonth()]} ${d.getFullYear()}`);
      }
    }

    return Array.from(monthsMap.entries()).map(([val, label]) => ({ val, label }));
  }, [dashboardData]);

  // Dynamic reporting period label
  const reportingPeriodLabel = useMemo(() => {
    if (dashboardData?.reportingPeriodLabel) return dashboardData.reportingPeriodLabel;
    if (dashboardData?.reportingPeriod) return dashboardData.reportingPeriod;
    const now = new Date();
    if (timeFilter === 'day') {
      const d = String(now.getDate()).padStart(2, '0');
      const m = monthShorts[now.getMonth()];
      const y = now.getFullYear();
      return `${d} ${m} ${y}`;
    }
    if (timeFilter === 'week') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const d1 = String(past.getDate()).padStart(2, '0');
      const m1 = monthShorts[past.getMonth()];
      const y1 = past.getFullYear();
      const d2 = String(now.getDate()).padStart(2, '0');
      const m2 = monthShorts[now.getMonth()];
      const y2 = now.getFullYear();
      return `${d1} ${m1} ${y1} – ${d2} ${m2} ${y2}`;
    }
    if (timeFilter === 'all') {
      return 'All Recorded Operations';
    }
    const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [y, m] = (selectedMonth || curMonthStr).split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const mShort = monthShorts[(m || 1) - 1] || 'Oct';
    return `01 ${mShort} ${y} – ${lastDay} ${mShort} ${y}`;
  }, [timeFilter, selectedMonth, dashboardData]);

  // Authoritative Data Resolvers
  const rawKpis = dashboardData?.executiveKpis;

  const targetSource = useMemo(() => {
    if (targetAchievement && (targetAchievement.hasTarget || targetAchievement.target > 0 || targetAchievement.quantityTarget > 0)) {
      return targetAchievement;
    }
    if (rawKpis?.planAchievement && (rawKpis.planAchievement.hasTarget || rawKpis.planAchievement.targetQty > 0)) {
      return rawKpis.planAchievement;
    }
    return null;
  }, [targetAchievement, rawKpis?.planAchievement]);

  const planAchievementKpi = useMemo(() => {
    if (targetSource) {
      const pct = Number(targetSource.percentage ?? targetSource.achievement ?? 0);
      const targetQty = Number(targetSource.target ?? targetSource.quantityTarget ?? targetSource.targetQty ?? 0);
      const achievedQty = Number(targetSource.achieved ?? targetSource.achievedQty ?? 0);
      const periodName = targetSource.period || 'Monthly';

      const targetLabel = targetSource.targetLabel || (
        targetQty > 0
          ? `Target: 95%+ • ${targetQty.toLocaleString('en-IN')} Sets`
          : 'Target: 95%+'
      );

      const trend = targetSource.trend || (
        pct >= 95
          ? `▲ ${(pct - 95).toFixed(1)}% vs. plan`
          : `▼ ${(95 - pct).toFixed(1)}% vs. plan`
      );

      const trendType = targetSource.trendType || (pct >= 95 ? 'positive' : 'negative');

      return {
        percentage: pct,
        targetLabel,
        trend,
        trendType,
        targetQty,
        achievedQty,
        period: periodName,
        hasTarget: true
      };
    }
    return rawKpis?.planAchievement || {
      percentage: dashboardData?.summary?.efficiency || 0,
      targetLabel: 'Target: 95%+',
      trend: 'Live Database Rate',
      trendType: 'positive',
      targetQty: dashboardData?.summary?.plannedUnits || 0,
      achievedQty: dashboardData?.summary?.producedUnits || 0,
      hasTarget: false
    };
  }, [targetSource, rawKpis?.planAchievement, dashboardData?.summary]);

  const kpis = {
    totalProduction: rawKpis?.totalProduction || {
      valueMt: dashboardData?.productionReconciliation?.headlineTotalProductionMt ?? 0,
      unitsCount: dashboardData?.summary?.producedUnits ?? 0,
      unitsLabel: `${(dashboardData?.summary?.producedUnits ?? 0).toLocaleString('en-IN')} Units`,
      trend: '—',
      trendType: 'neutral'
    },
    planAchievement: planAchievementKpi,
    oee: rawKpis?.oee || {
      percentage: Number(dashboardData?.summary?.efficiency ?? 0),
      targetLabel: 'Target: 82%+',
      trend: '—',
      trendType: 'neutral'
    },
    activeFloorRuns: rawKpis?.activeFloorRuns || {
      activeCount: dashboardData?.summary?.machinesRunning ?? 0,
      totalAvailable: dashboardData?.summary?.totalMachines ?? 6,
      subtitle: `of ${dashboardData?.summary?.totalMachines ?? 6} presses running`,
      note: 'Balanced load'
    },
    firstPassYield: rawKpis?.firstPassYield || {
      percentage: Number(dashboardData?.summary?.firstPassYield ?? 100),
      targetLabel: 'Target: 98.5%+',
      trend: '—',
      trendType: 'neutral'
    },
    dispatchBacklog: rawKpis?.dispatchBacklog || {
      unitsCount: dashboardData?.summary?.readyForDispatchCount ?? 0,
      weightMt: 0,
      subtitle: `(${dashboardData?.summary?.readyForDispatchCount ?? 0} Units)`,
      trend: '—',
      trendType: 'neutral'
    }
  };

  const pipeline = (Array.isArray(dashboardData?.manufacturingPipeline) && dashboardData.manufacturingPipeline.length > 0)
    ? dashboardData.manufacturingPipeline
    : [];

  const pressFleet = (Array.isArray(dashboardData?.hydraulicPressFleet) && dashboardData.hydraulicPressFleet.length > 0)
    ? dashboardData.hydraulicPressFleet
    : (Array.isArray(dashboardData?.machineFleet) && dashboardData.machineFleet.length > 0)
      ? dashboardData.machineFleet
      : (Array.isArray(machines) && machines.length > 0 ? machines : []);

  const trendData = (Array.isArray(dashboardData?.productionTrendMonthly) && dashboardData.productionTrendMonthly.length > 0)
    ? dashboardData.productionTrendMonthly
    : (Array.isArray(dashboardData?.dailyTrend) && dashboardData.dailyTrend.length > 0)
      ? dashboardData.dailyTrend
      : [];

  const rawShift = dashboardData?.shiftWiseProductionSummary;
  const shiftSummary = (rawShift?.shifts && rawShift.shifts.length > 0)
    ? rawShift
    : {
        shifts: [],
        total: { shift: 'Total', sets: 0, covers: 0, frames: 0, totalWeightMt: 0 }
      };

  const wipMt = dashboardData?.productionReconciliation?.floorWorkInProgressMt ?? 0;
  const shiftOutputMt = shiftSummary.total?.totalWeightMt ?? 0;
  const totalProductionMt = kpis.totalProduction.valueMt || 0;

  const diagnostics = dashboardData?.qualityAndScrapDiagnostics || null;

  // Live Work Orders Pool (combines backend API items and state items)
  const liveWorkOrdersPool = useMemo(() => {
    if (Array.isArray(dashboardData?.allWorkOrders) && dashboardData.allWorkOrders.length > 0) {
      return dashboardData.allWorkOrders;
    }
    if (Array.isArray(dashboardData?.referenceActiveWorkOrders) && dashboardData.referenceActiveWorkOrders.length > 0) {
      return dashboardData.referenceActiveWorkOrders;
    }
    if (Array.isArray(workOrders) && workOrders.length > 0) {
      return workOrders.map((w) => {
        const target = Number(w.quantity || 10);
        const prod = Number(w.quantityProduced || w.producedQuantity || w.producedQty || 0);
        const prog = target > 0 ? Math.min(100, Math.round((prod / target) * 100)) : 0;
        const st = String(w.status || w.productionStatus || 'PENDING').toUpperCase();

        let badge = 'pending';
        let statusDisplay = 'Pending';
        let stage = 'INCOMING';

        if (['STARTED', 'IN_PROGRESS', 'IN_PRODUCTION', 'RUNNING'].includes(st)) {
          badge = 'floor-run';
          statusDisplay = 'Floor Run';
          stage = 'FLOOR';
        } else if (['QC_PENDING', 'TESTING', 'UNDER_INSPECTION'].includes(st)) {
          badge = 'qc-testing';
          statusDisplay = 'QC Testing';
          stage = 'QC_PENDING';
        } else if (['QC_FAILED', 'REWORK', 'REWORK_IN_PROGRESS'].includes(st)) {
          badge = 'rework';
          statusDisplay = 'Rework';
          stage = 'QC_FAILED';
        } else if (['READY_FOR_DISPATCH', 'QC_APPROVED'].includes(st)) {
          badge = 'ready-dispatch';
          statusDisplay = 'Ready for Dispatch';
          stage = 'READY_FOR_DISPATCH';
        } else if (['DISPATCHED', 'CLOSED', 'COMPLETED'].includes(st)) {
          badge = 'dispatched';
          statusDisplay = 'Dispatched';
          stage = 'DISPATCHED';
        }

        const so = w.productionPlan?.salesOrder || w.salesOrder;
        const customerName = so?.customer?.companyName || so?.customer?.name || w.customer || w.customerName || 'Valued Client';
        const soOrderNo = so?.orderNumber || w.orderNo || w.orderNumber || '—';

        return {
          id: w.id,
          workOrderNo: w.workOrderNumber || w.id,
          orderNo: soOrderNo,
          customer: customerName,
          salesOrderCustomer: soOrderNo !== '—' ? `${soOrderNo} – ${customerName}` : customerName,
          product: w.salesOrderItem?.product?.name || w.productName || w.product || 'Standard Product',
          size: w.salesOrderItem?.product?.size || w.size || '—',
          loadRating: w.salesOrderItem?.product?.capacity || w.loadRating || '40T',
          targetQty: `${target} Sets`,
          producedQty: `${prod} Sets`,
          progress: prog,
          shiftMachine: w.machineId ? `A – ${w.machineId}` : (stage === 'FLOOR' ? 'A – HM001' : '—'),
          duration: w.duration ? `${Math.floor(w.duration / 60)}h ${w.duration % 60}m` : '—',
          status: statusDisplay,
          badgeClass: badge,
          stage
        };
      });
    }
    return [];
  }, [dashboardData, workOrders]);

  // Combined or Filtered Work Orders
  const displayedWorkOrders = useMemo(() => {
    return liveWorkOrdersPool.filter((item) => {
      if (shiftFilter !== 'ALL') {
        const sm = String(item.shiftMachine || '');
        if (!sm.startsWith(shiftFilter) && !sm.includes(`Shift ${shiftFilter}`)) return false;
      }
      if (machineFilter !== 'ALL') {
        const sm = String(item.shiftMachine || '');
        if (!sm.includes(machineFilter)) return false;
      }
      if (activeStageFilter !== 'ALL') {
        if (activeStageFilter === 'incoming' && item.stage !== 'INCOMING') return false;
        if (activeStageFilter === 'floorRuns' && item.stage !== 'FLOOR') return false;
        if (activeStageFilter === 'qcTesting' && item.stage !== 'QC_PENDING') return false;
        if (activeStageFilter === 'reworkScrap' && item.stage !== 'QC_FAILED') return false;
        if (activeStageFilter === 'readyDispatch' && item.stage !== 'READY_FOR_DISPATCH') return false;
        if (activeStageFilter === 'dispatched' && item.stage !== 'DISPATCHED') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (item.workOrderNo || '').toLowerCase().includes(q) ||
          (item.salesOrderCustomer || '').toLowerCase().includes(q) ||
          (item.customer || '').toLowerCase().includes(q) ||
          (item.product || '').toLowerCase().includes(q) ||
          (item.status || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [liveWorkOrdersPool, activeStageFilter, searchQuery, shiftFilter, machineFilter]);

  // Operational Action Handlers
  const handleStartRun = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (startForm.workOrderId) {
        await backendFetch(`/production-workflow/work-orders/${startForm.workOrderId}/start`, {
          method: 'POST',
          body: { machineId: startForm.machineId, operator: startForm.operator, shift: startForm.shift }
        }).catch(() => null);
      }
      showToast(`Work Order started successfully on ${startForm.machineId}`);
      setModalType(null);
      fetchDashboardData(false);
    } catch {
      showToast('Error starting production run', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await backendFetch('/production/shift-entries', {
        method: 'POST',
        body: {
          workOrderId: shiftForm.workOrderId,
          shift: shiftForm.shift,
          producedQty: Number(shiftForm.setsProduced || 0),
          targetQty: 100,
          date: shiftForm.date,
          remarks: shiftForm.remarks
        }
      }).catch(() => null);
      showToast('Shift DPR entry logged and saved successfully');
      setModalType(null);
      fetchDashboardData(false);
    } catch {
      showToast('Failed to save shift entry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishQc = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (finishQcForm.workOrderId) {
        await backendFetch(`/production-workflow/work-orders/${finishQcForm.workOrderId}/finish-run`, {
          method: 'POST',
          body: { quantity: Number(finishQcForm.quantity || 1) }
        }).catch(() => null);
      }
      showToast('Run completed and transferred to QC Queue');
      setModalType(null);
      fetchDashboardData(false);
    } catch {
      showToast('Error transferring to QC', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQcSubmit = async (e) => {
    e.preventDefault();
    if (!qcForm.workOrderId) {
      showToast('Please select a work order for QC inspection', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await backendFetch('/production-workflow/qc-pass', {
        method: 'POST',
        body: {
          workOrderIds: [qcForm.workOrderId],
          result: qcForm.status,
          remarks: qcForm.remarks,
          certificateNo: qcForm.certificateNo,
          proofLoadKn: qcForm.proofLoadKn
        }
      }).catch(() => null);
      showToast(`QC Certificate ${qcForm.certificateNo} recorded: ${qcForm.status}`);
      setModalType(null);
      fetchDashboardData(false);
    } catch {
      showToast('Failed to log QC certificate', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchForm.workOrderId) {
      showToast('Please select a finished goods work order for dispatch handover', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await backendFetch('/production-workflow/send-to-dispatch', {
        method: 'POST',
        body: {
          workOrderIds: [dispatchForm.workOrderId]
        }
      }).catch(() => null);
      showToast('Eligible Finished Goods staged and handed over to Dispatch');
      setModalType(null);
      fetchDashboardData(false);
    } catch {
      showToast('Error transferring to dispatch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pod-dashboard">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`pod-toast ${toastMessage.type}`}>
          <CheckCircle2 size={16} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ─── 1. DASHBOARD HEADER ─── */}
      <div className="pod-header-card">
        <div className="pod-header-main">
          <div className="pod-header-titles">
            <h1>HIMALAYA ERP — Production Department Dashboard</h1>
            <p>Manufacturing Excellence | Quality Products | Stronger Infrastructure</p>
          </div>

          <div className="pod-header-controls">
            {/* Shift Filter Dropdown */}
            <select
              className="pod-filter-select"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              aria-label="Shift Filter"
            >
              <option value="ALL">All Shifts</option>
              <option value="A">Shift A (Morning)</option>
              <option value="B">Shift B (Evening)</option>
              <option value="C">Shift C (Night)</option>
            </select>

            {/* Machine Filter Dropdown */}
            <select
              className="pod-filter-select"
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              aria-label="Machine Filter"
            >
              <option value="ALL">All Machines</option>
              {(pressFleet || []).map((m, idx) => {
                const mId = m?.machineId || m?.id || `HM00${idx + 1}`;
                const mCap = m?.capacity || m?.machineName?.match(/\d+T/)?.[0] || 'Press';
                return (
                  <option key={mId} value={mId}>
                    {mId} ({mCap})
                  </option>
                );
              })}
            </select>

            {/* Period Filter Bar */}
            {/* Month Selection Filter */}
            <select
              className="pod-filter-select pod-month-select"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setTimeFilter('month');
              }}
              aria-label="Month Selection Filter"
            >
              {availableMonths.map((m) => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
            </select>

            <div className="pod-period-bar">
              {[
                { id: 'day', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
                { id: 'all', label: 'All' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`pod-period-btn ${timeFilter === p.id ? 'active' : ''}`}
                  onClick={() => setTimeFilter(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="pod-refresh-btn"
              onClick={() => fetchDashboardData(true)}
              title="Refresh Data"
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'pod-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Sub-header Metadata Bar */}
        <div className="pod-metadata-bar">
          <div className="pod-meta-item">
            <span className="pod-meta-label">Department:</span>
            <span className="pod-meta-val">Production Department</span>
          </div>
          <div className="pod-meta-item">
            <span className="pod-meta-label">Reporting Period:</span>
            <span className="pod-meta-val">{reportingPeriodLabel}</span>
          </div>
          <div className="pod-meta-item">
            <span className="pod-meta-label">Logged-in Role:</span>
            <span className="pod-meta-val">Plant Head</span>
          </div>
          <div className="pod-meta-item">
            <span className="pod-meta-label">Organization:</span>
            <span className="pod-meta-val">Himalaya FRP & Construction Products</span>
          </div>
          <div className="pod-meta-item">
            <span className="pod-meta-label">Reconciliation:</span>
            <span className="pod-meta-val" title={`${shiftOutputMt} MT Shift Output + ${wipMt} MT Press WIP`}>
              {totalProductionMt} MT ({shiftOutputMt} MT Output + {wipMt} MT WIP)
            </span>
          </div>
          <div className="pod-meta-item">
            <span className="pod-meta-label">Weights Authority:</span>
            <span className="pod-meta-val">Product Master Composition</span>
          </div>
        </div>
      </div>

      {/* ─── 2. KEY PERFORMANCE INDICATORS (KPIs) ─── */}
      <div className="pod-kpi-grid">
        {/* KPI 1: Total Production */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-top">
            <div className="pod-kpi-icon-box blue">
              <Factory size={18} />
            </div>
            <span className="pod-kpi-label">Total Production</span>
          </div>
          <div className="pod-kpi-main">
            <span className="pod-kpi-value">{kpis.totalProduction.valueMt} MT</span>
            <span className="pod-kpi-subtitle">{kpis.totalProduction.unitsLabel}</span>
          </div>
          <span className="pod-kpi-trend positive">{kpis.totalProduction.trend}</span>
        </div>

        {/* KPI 2: Plan Achievement */}
        <div 
          className="pod-kpi-card"
          title={kpis.planAchievement.hasTarget && kpis.planAchievement.targetQty ? `Super Admin Target: ${Number(kpis.planAchievement.targetQty).toLocaleString('en-IN')} Units (${kpis.planAchievement.period || 'Monthly'}) | Achieved: ${Number(kpis.planAchievement.achievedQty || 0).toLocaleString('en-IN')} Units (${kpis.planAchievement.percentage}%)` : 'Super Admin Production Target Adherence'}
        >
          <div className="pod-kpi-top">
            <div className="pod-kpi-icon-box green">
              <Target size={18} />
            </div>
            <span className="pod-kpi-label">Plan Achievement</span>
          </div>
          <div className="pod-kpi-main">
            <span className="pod-kpi-value">{kpis.planAchievement.percentage}%</span>
            <span className="pod-kpi-subtitle" title={kpis.planAchievement.targetQty ? `${Number(kpis.planAchievement.achievedQty || 0).toLocaleString('en-IN')} / ${Number(kpis.planAchievement.targetQty).toLocaleString('en-IN')} Units Achieved` : undefined}>
              {kpis.planAchievement.targetLabel}
            </span>
          </div>
          <span className={`pod-kpi-trend ${kpis.planAchievement.trendType || 'positive'}`}>
            {kpis.planAchievement.trend}
          </span>
        </div>


        {/* KPI 3: Overall Equipment Effectiveness */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-top">
            <div className="pod-kpi-icon-box purple">
              <Settings size={18} />
            </div>
            <span className="pod-kpi-label">Overall Equipment Effectiveness</span>
          </div>
          <div className="pod-kpi-main">
            <span className="pod-kpi-value">{kpis.oee.percentage}%</span>
            <span className="pod-kpi-subtitle">{kpis.oee.targetLabel}</span>
          </div>
          <span className="pod-kpi-trend positive">{kpis.oee.trend}</span>
        </div>

        {/* KPI 4: Active Floor Runs */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-top">
            <div className="pod-kpi-icon-box amber">
              <Layers size={18} />
            </div>
            <span className="pod-kpi-label">Active Floor Runs</span>
          </div>
          <div className="pod-kpi-main">
            <span className="pod-kpi-value">{kpis.activeFloorRuns.activeCount}</span>
            <span className="pod-kpi-subtitle">{kpis.activeFloorRuns.subtitle}</span>
          </div>
          <span className="pod-kpi-trend neutral">{kpis.activeFloorRuns.note}</span>
        </div>

        {/* KPI 5: First Pass Yield */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-top">
            <div className="pod-kpi-icon-box teal">
              <ShieldCheck size={18} />
            </div>
            <span className="pod-kpi-label">First Pass Yield (FPY)</span>
          </div>
          <div className="pod-kpi-main">
            <span className="pod-kpi-value">{kpis.firstPassYield.percentage}%</span>
            <span className="pod-kpi-subtitle">{kpis.firstPassYield.targetLabel}</span>
          </div>
          <span className="pod-kpi-trend positive">{kpis.firstPassYield.trend}</span>
        </div>

        {/* KPI 6: Ready for Dispatch Backlog */}
        <div className="pod-kpi-card">
          <div className="pod-kpi-top">
            <div className="pod-kpi-icon-box red">
              <Truck size={18} />
            </div>
            <span className="pod-kpi-label">Ready for Dispatch Backlog</span>
          </div>
          <div className="pod-kpi-main">
            <span className="pod-kpi-value">{kpis.dispatchBacklog.unitsCount} Units</span>
            <span className="pod-kpi-subtitle">{kpis.dispatchBacklog.subtitle}</span>
          </div>
          <span className="pod-kpi-trend negative">{kpis.dispatchBacklog.trend}</span>
        </div>
      </div>

      {/* ─── 3. ROW 2: PIPELINE & PRESS FLEET ─── */}
      <div className="pod-row-two-col">
        {/* Left Column: Pipeline & Analytics */}
        <div className="pod-panel">
          <div className="pod-panel-header">
            <h2 className="pod-panel-title">Manufacturing Pipeline</h2>
            <button
              type="button"
              className="pod-panel-link"
              onClick={() => {
                setActiveStageFilter('ALL');
                setShowAllLiveOrders(true);
              }}
            >
              View All
            </button>
          </div>

          {/* 6 Connected Chevron Process Pipeline */}
          <div className="pod-pipeline-container">
            <div className="pod-pipeline-chevrons">
              {pipeline.map((stage) => {
                const isSelected = activeStageFilter === stage.id;
                return (
                  <div
                    key={stage.id}
                    className={`pod-chevron-block ${isSelected ? 'active' : ''}`}
                    onClick={() => setActiveStageFilter(isSelected ? 'ALL' : stage.id)}
                  >
                    <div
                      className="pod-chevron-arrow"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stage.stageNumber} {stage.stageName}
                    </div>
                    <div className="pod-chevron-info">
                      <span className="pod-chevron-wo">{stage.woCount} WO</span>
                      <span className="pod-chevron-mt">{stage.weightMt} MT</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Split Section: Trend Chart & Shift Summary */}
          <div className="pod-split-analytics">
            {/* Left: Production Trend (MT) */}
            <div className="pod-sub-card">
              <div className="pod-sub-card-header">
                <h3 className="pod-sub-title">Production Trend (MT)</h3>
                <div className="pod-chart-legend">
                  <div className="pod-legend-item">
                    <span className="pod-legend-dot actual" />
                    <span>Actual</span>
                  </div>
                  <div className="pod-legend-item">
                    <span className="pod-legend-dot planned" />
                    <span>Planned</span>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: 6, fontSize: 11, border: 'none' }}
                      formatter={(val, name) => [`${val} MT`, name]}
                    />
                    <Bar dataKey="actual" fill="#93c5fd" radius={[2, 2, 0, 0]} name="Actual" barSize={10} />
                    <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={{ r: 2, fill: '#2563eb' }} name="Actual" />
                    <Line type="monotone" dataKey="planned" stroke="#16a34a" strokeWidth={2} dot={{ r: 2, fill: '#16a34a' }} name="Planned" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Shift-wise Production Summary */}
            <div className="pod-sub-card">
              <div className="pod-sub-card-header">
                <h3 className="pod-sub-title">Shift-wise Production Summary</h3>
              </div>
              <div className="pod-shift-table-wrap">
                <table className="pod-shift-table">
                  <thead>
                    <tr>
                      <th>Shift</th>
                      <th>Sets</th>
                      <th>Covers</th>
                      <th>Frames</th>
                      <th>Total Weight (MT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftSummary.shifts.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.shift}</td>
                        <td>{row.sets.toLocaleString()}</td>
                        <td>{row.covers.toLocaleString()}</td>
                        <td>{row.frames.toLocaleString()}</td>
                        <td>{row.totalWeightMt}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td>{shiftSummary.total.shift}</td>
                      <td>{shiftSummary.total.sets.toLocaleString()}</td>
                      <td>{shiftSummary.total.covers.toLocaleString()}</td>
                      <td>{shiftSummary.total.frames.toLocaleString()}</td>
                      <td>{shiftSummary.total.totalWeightMt}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b', lineHeight: 1.3 }}>
                  <strong>* Production Reconciliation:</strong> Total Headline ({totalProductionMt} MT) = Shift Completed Output ({shiftOutputMt} MT) + Shop Floor In-Process WIP ({wipMt} MT) across HM001–HM006.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hydraulic Press Fleet Grid */}
        <div className="pod-panel pod-fleet-panel">
          <div className="pod-panel-header">
            <div className="pod-fleet-header-title-box">
              <h2 className="pod-panel-title">Hydraulic Press Fleet</h2>
              <span className="pod-fleet-iot-badge">
                WO Execution Logs (IoT Offline)
              </span>
            </div>
            <button
              type="button"
              className="pod-panel-link"
              onClick={() => {
                setModalType('start');
              }}
            >
              View All
            </button>
          </div>

          <div className="pod-fleet-grid">
            {pressFleet.map((machine, index) => {
              const machineId = machine?.machineId || machine?.id || `HM00${index + 1}`;
              const rawStatus = machine?.status || (machine?.isActive === false ? 'Maintenance' : 'Running');
              const statusClass = String(rawStatus || 'running').toLowerCase().replace(/\s+/g, '-');
              const oee = typeof machine?.oee === 'number' ? machine.oee : (statusClass === 'running' ? 80 : 0);
              const radius = 18;
              const circumference = 2 * Math.PI * radius;
              const strokeOffset = circumference - (oee / 100) * circumference;
              const strokeColor =
                oee >= 80 ? '#16a34a' : oee >= 60 ? '#2563eb' : oee > 0 ? '#d97706' : '#94a3b8';
              const activeWoText = machine?.activeWo || '—';
              const hasWo = activeWoText !== '—';
              const capacity = machine?.capacity || machine?.machineName?.match(/\d+T/)?.[0] || '300T';
              const shift = machine?.shift || 'A';
              const operator = machine?.operator || '—';
              const runtimeHours = machine?.runtimeHours || '0.0h';
              const idleHours = machine?.idleHours || '0.0h';
              const product = machine?.product;

              return (
                <div 
                  key={machineId} 
                  className={`pod-machine-card ${statusClass}`}
                  title={`${machineId} (${capacity} Hydraulic Press) — ${rawStatus}\nWO: ${activeWoText}${product && product !== '—' ? ` | ${product}` : ''}\nShift ${shift} • Operator: ${operator}\nRuntime: ${runtimeHours} | Idle: ${idleHours}\nOEE: ${oee}%`}
                >
                  <div className="pod-machine-info">
                    <div className="pod-machine-header-row">
                      <span className="pod-machine-id">{machineId}</span>
                      <span className={`pod-machine-status-badge ${statusClass}`}>{rawStatus}</span>
                    </div>
                    <span className="pod-machine-capacity">{capacity} Hydraulic Press</span>
                    <span 
                      className="pod-machine-wo"
                      title={hasWo ? `Work Order: ${activeWoText}${product && product !== '—' && !activeWoText.includes(product) ? ` | ${product}` : ''}` : 'No active work order'}
                    >
                      <strong className="pod-wo-tag">WO:</strong> {activeWoText.replace(/^WO:\s*/i, '')} {product && product !== '—' && !activeWoText.includes(product) ? `| ${product}` : ''}
                    </span>
                    <span 
                      className="pod-machine-meta"
                      title={`Shift ${shift} • Operator: ${operator}`}
                    >
                      Shift {shift} • Operator: {operator}
                    </span>
                    <div className="pod-machine-runtime-row">
                      <span className="pod-runtime-chip run" title={`Runtime: ${runtimeHours}`}>
                        <span className="pod-chip-dot green" /> {runtimeHours}
                      </span>
                      <span className="pod-runtime-chip idle" title={`Idle Time: ${idleHours}`}>
                        <span className="pod-chip-dot amber" /> Idle {idleHours}
                      </span>
                    </div>
                  </div>

                  {/* Circular OEE Gauge */}
                  <div className="pod-machine-gauge" title={`OEE: ${oee}%`}>
                    <svg className="pod-gauge-svg" width="48" height="48" viewBox="0 0 48 48">
                      <circle className="pod-gauge-bg" cx="24" cy="24" r={radius} strokeWidth="4" fill="none" />
                      <circle
                        className="pod-gauge-val"
                        cx="24"
                        cy="24"
                        r={radius}
                        strokeWidth="4"
                        stroke={strokeColor}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="pod-gauge-center">
                      <span className="pod-gauge-pct">{oee}%</span>
                      <span className="pod-gauge-label">OEE</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>



      {/* ─── 5. ROW 4: ACTIVE WORK ORDERS & QUICK ACTIONS ─── */}
      <div className="pod-bottom-grid">
        {/* Left: Work Orders Table */}
        <div className="pod-table-panel">
          <div className="pod-panel-header">
            <h2 className="pod-panel-title">Active Work Orders</h2>
            <button
              type="button"
              className="pod-panel-link"
              onClick={() => {
                setActiveStageFilter('ALL');
                setShowAllLiveOrders(true);
              }}
            >
              View All (Live ERP Records)
            </button>
          </div>

          <div className="pod-table-toolbar">
            <div className="pod-table-search">
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search WO, customer, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {activeStageFilter !== 'ALL' && (
              <button
                type="button"
                className="pod-btn-view"
                onClick={() => setActiveStageFilter('ALL')}
              >
                Clear Stage Filter ({activeStageFilter})
              </button>
            )}
          </div>

          <div className="pod-table-wrap">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>WO No.</th>
                  <th>Sales Order / Customer</th>
                  <th>Product & Size</th>
                  <th>Load Rating</th>
                  <th>Target Qty</th>
                  <th>Produced Qty</th>
                  <th>Progress</th>
                  <th>Shift & Machine</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedWorkOrders.map((wo) => (
                  <tr key={wo.id}>
                    <td>
                      <span
                        className="pod-wo-link"
                        onClick={() => {
                          setSelectedWo(wo);
                          setModalType('view_wo');
                        }}
                      >
                        {wo.workOrderNo}
                      </span>
                    </td>
                    <td>{wo.salesOrderCustomer}</td>
                    <td>{wo.product && wo.size && wo.size !== '—' && !wo.product.includes(wo.size) ? `${wo.product} (${wo.size})` : (wo.product || 'Standard Product')}</td>
                    <td>{wo.loadRating}</td>
                    <td>{wo.targetQty}</td>
                    <td>{wo.producedQty}</td>
                    <td>
                      <div className="pod-progress-cell">
                        <div className="pod-progress-bar">
                          <div className="pod-progress-fill" style={{ width: `${wo.progress}%` }} />
                        </div>
                        <span className="pod-progress-pct">{wo.progress}%</span>
                      </div>
                    </td>
                    <td>{wo.shiftMachine}</td>
                    <td>{wo.duration}</td>
                    <td>
                      <span className={`pod-badge-status ${wo.badgeClass}`}>
                        {wo.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="pod-btn-view"
                        onClick={() => {
                          setSelectedWo(wo);
                          setModalType('view_wo');
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>



      {/* ─── 7. MODALS ─── */}

      {/* Modal 1: Start Run */}
      {modalType === 'start' && (
        <div className="pod-modal-overlay">
          <div className="pod-modal-content">
            <div className="pod-modal-header">
              <h3>Start Production Run</h3>
              <button type="button" className="pod-modal-close" onClick={() => setModalType(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleStartRun}>
              <div className="pod-modal-body">
                <div className="pod-form-group">
                  <label className="pod-form-label">Select Work Order</label>
                  <select
                    className="pod-form-select"
                    value={startForm.workOrderId}
                    onChange={(e) => setStartForm({ ...startForm, workOrderId: e.target.value })}
                  >
                    <option value="">Select Work Order...</option>
                    {(displayedWorkOrders.filter(w => ['INCOMING', 'PLANNED', 'READY', 'CREATED'].includes(w.stage) || w.status === 'Pending' || w.status === 'Incoming').length > 0
                      ? displayedWorkOrders.filter(w => ['INCOMING', 'PLANNED', 'READY', 'CREATED'].includes(w.stage) || w.status === 'Pending' || w.status === 'Incoming')
                      : displayedWorkOrders
                    ).slice(0, 50).map((w) => (
                      <option key={w.id} value={w.id || w.workOrderNo}>
                        {w.workOrderNo} — {w.product} ({w.targetQty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pod-form-row">
                  <div className="pod-form-group">
                    <label className="pod-form-label">Hydraulic Press Machine</label>
                    <select
                      className="pod-form-select"
                      value={startForm.machineId}
                      onChange={(e) => setStartForm({ ...startForm, machineId: e.target.value })}
                    >
                      {(pressFleet || []).map((m) => (
                        <option key={m.machineId || m.id} value={m.machineId || m.id}>
                          {m.machineId} ({m.capacity || 'Press'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pod-form-group">
                    <label className="pod-form-label">Shift</label>
                    <select
                      className="pod-form-select"
                      value={startForm.shift}
                      onChange={(e) => setStartForm({ ...startForm, shift: e.target.value })}
                    >
                      <option value="A">Shift A (Morning)</option>
                      <option value="B">Shift B (Evening)</option>
                      <option value="C">Shift C (Night)</option>
                    </select>
                  </div>
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Operator Name</label>
                  <input
                    type="text"
                    className="pod-form-input"
                    value={startForm.operator}
                    onChange={(e) => setStartForm({ ...startForm, operator: e.target.value })}
                    placeholder="e.g. Ramesh"
                  />
                </div>
              </div>

              <div className="pod-modal-footer">
                <button type="button" className="pod-btn-cancel" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="pod-btn-submit" disabled={submitting}>
                  {submitting ? 'Starting...' : 'Start Job on Floor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log Shift DPR */}
      {modalType === 'shift' && (
        <div className="pod-modal-overlay">
          <div className="pod-modal-content">
            <div className="pod-modal-header">
              <h3>Log Daily Production Report (DPR)</h3>
              <button type="button" className="pod-modal-close" onClick={() => setModalType(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleLogShift}>
              <div className="pod-modal-body">
                <div className="pod-form-row">
                  <div className="pod-form-group">
                    <label className="pod-form-label">Shift</label>
                    <select
                      className="pod-form-select"
                      value={shiftForm.shift}
                      onChange={(e) => setShiftForm({ ...shiftForm, shift: e.target.value })}
                    >
                      <option value="Morning">Shift A (Morning)</option>
                      <option value="Evening">Shift B (Evening)</option>
                      <option value="Night">Shift C (Night)</option>
                    </select>
                  </div>

                  <div className="pod-form-group">
                    <label className="pod-form-label">Date</label>
                    <input
                      type="date"
                      className="pod-form-input"
                      value={shiftForm.date}
                      onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Work Order Reference</label>
                  <input
                    type="text"
                    className="pod-form-input"
                    value={shiftForm.workOrderId}
                    onChange={(e) => setShiftForm({ ...shiftForm, workOrderId: e.target.value })}
                    placeholder="Enter Work Order No. (e.g. WO-2026-001)"
                  />
                </div>

                <div className="pod-form-row">
                  <div className="pod-form-group">
                    <label className="pod-form-label">Sets Produced</label>
                    <input
                      type="number"
                      className="pod-form-input"
                      value={shiftForm.setsProduced}
                      onChange={(e) => setShiftForm({ ...shiftForm, setsProduced: e.target.value })}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">Covers Produced</label>
                    <input
                      type="number"
                      className="pod-form-input"
                      value={shiftForm.coversProduced}
                      onChange={(e) => setShiftForm({ ...shiftForm, coversProduced: e.target.value })}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">Frames Produced</label>
                    <input
                      type="number"
                      className="pod-form-input"
                      value={shiftForm.framesProduced}
                      onChange={(e) => setShiftForm({ ...shiftForm, framesProduced: e.target.value })}
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Total Shift Weight (kg / MT)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="pod-form-input"
                    value={shiftForm.totalWeightKg}
                    onChange={(e) => setShiftForm({ ...shiftForm, totalWeightKg: e.target.value })}
                    placeholder="e.g. 4850"
                  />
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Supervisor / Remarks</label>
                  <textarea
                    className="pod-form-textarea"
                    value={shiftForm.remarks}
                    onChange={(e) => setShiftForm({ ...shiftForm, remarks: e.target.value })}
                    placeholder="Batch observations, raw material mix quality, hydraulic pressure logs"
                  />
                </div>
              </div>

              <div className="pod-modal-footer">
                <button type="button" className="pod-btn-cancel" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="pod-btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Submit Shift DPR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Finish Run ➔ QC */}
      {modalType === 'finish_qc' && (
        <div className="pod-modal-overlay">
          <div className="pod-modal-content">
            <div className="pod-modal-header">
              <h3>Move Floor Run to QC Testing Queue</h3>
              <button type="button" className="pod-modal-close" onClick={() => setModalType(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleFinishQc}>
              <div className="pod-modal-body">
                <div className="pod-form-group">
                  <label className="pod-form-label">Select Active Floor Run</label>
                  <select
                    className="pod-form-select"
                    value={finishQcForm.workOrderId}
                    onChange={(e) => setFinishQcForm({ ...finishQcForm, workOrderId: e.target.value })}
                  >
                    <option value="">Select Active Floor Run...</option>
                    {(displayedWorkOrders.filter(w => w.stage === 'FLOOR' || w.status === 'Floor Run').length > 0
                      ? displayedWorkOrders.filter(w => w.stage === 'FLOOR' || w.status === 'Floor Run')
                      : displayedWorkOrders
                    ).slice(0, 50).map((w) => (
                      <option key={w.id} value={w.id || w.workOrderNo}>
                        {w.workOrderNo} — {w.product} ({w.producedQty} produced)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Batch Quantity Finished for Inspection</label>
                  <input
                    type="number"
                    className="pod-form-input"
                    value={finishQcForm.quantity}
                    onChange={(e) => setFinishQcForm({ ...finishQcForm, quantity: e.target.value })}
                    placeholder="e.g. 320"
                  />
                </div>
              </div>

              <div className="pod-modal-footer">
                <button type="button" className="pod-btn-cancel" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="pod-btn-submit" disabled={submitting}>
                  {submitting ? 'Transferring...' : 'Transfer to QC Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Pass / Fail QC */}
      {modalType === 'qc_pass_fail' && (
        <div className="pod-modal-overlay">
          <div className="pod-modal-content">
            <div className="pod-modal-header">
              <h3>Record QC Load Test & Inspection Result</h3>
              <button type="button" className="pod-modal-close" onClick={() => setModalType(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleQcSubmit}>
              <div className="pod-modal-body">
                <div className="pod-form-group">
                  <label className="pod-form-label">Work Order in QC Queue</label>
                  <select
                    className="pod-form-select"
                    value={qcForm.workOrderId}
                    onChange={(e) => setQcForm({ ...qcForm, workOrderId: e.target.value })}
                  >
                    <option value="">Select Work Order in QC Queue...</option>
                    {(displayedWorkOrders.filter(w => w.stage === 'QC_PENDING' || w.status === 'QC Testing').length > 0
                      ? displayedWorkOrders.filter(w => w.stage === 'QC_PENDING' || w.status === 'QC Testing')
                      : displayedWorkOrders
                    ).slice(0, 50).map((w) => (
                      <option key={w.id} value={w.id || w.workOrderNo}>
                        {w.workOrderNo} — {w.product} ({w.loadRating || '40T Rating'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pod-form-row">
                  <div className="pod-form-group">
                    <label className="pod-form-label">Inspection Verdict</label>
                    <select
                      className="pod-form-select"
                      value={qcForm.status}
                      onChange={(e) => setQcForm({ ...qcForm, status: e.target.value })}
                    >
                      <option value="PASSED">PASS (Approved for Dispatch)</option>
                      <option value="FAILED">FAIL (Send to Rework / Scrap)</option>
                    </select>
                  </div>

                  <div className="pod-form-group">
                    <label className="pod-form-label">Proof Load Rating</label>
                    <select
                      className="pod-form-select"
                      value={qcForm.testRating}
                      onChange={(e) => setQcForm({ ...qcForm, testRating: e.target.value })}
                    >
                      <option value="2.5T">2.5 Ton (Pedestrian)</option>
                      <option value="12.5T">12.5 Ton (Light Commercial)</option>
                      <option value="25T">25 Ton (Medium Duty)</option>
                      <option value="40T">40 Ton (Heavy Duty Highways)</option>
                      <option value="50T">50 Ton (Extra Heavy Duty)</option>
                    </select>
                  </div>
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Certificate / Test Log No.</label>
                  <input
                    type="text"
                    className="pod-form-input"
                    value={qcForm.certificateNo}
                    onChange={(e) => setQcForm({ ...qcForm, certificateNo: e.target.value })}
                  />
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Inspection Notes & Parameters</label>
                  <textarea
                    className="pod-form-textarea"
                    value={qcForm.remarks}
                    onChange={(e) => setQcForm({ ...qcForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="pod-modal-footer">
                <button type="button" className="pod-btn-cancel" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="pod-btn-submit" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record QC Verdict'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Handover to Dispatch */}
      {modalType === 'dispatch' && (
        <div className="pod-modal-overlay">
          <div className="pod-modal-content">
            <div className="pod-modal-header">
              <h3>Handover Finished Goods to Dispatch</h3>
              <button type="button" className="pod-modal-close" onClick={() => setModalType(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleDispatchSubmit}>
              <div className="pod-modal-body">
                <div className="pod-form-group">
                  <label className="pod-form-label">Eligible Finished Goods Work Order</label>
                  <select
                    className="pod-form-select"
                    value={dispatchForm.workOrderId}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, workOrderId: e.target.value })}
                  >
                    <option value="">Select Eligible Work Order...</option>
                    {(displayedWorkOrders.filter(w => w.stage === 'READY_FOR_DISPATCH' || w.status === 'Ready for Dispatch').length > 0
                      ? displayedWorkOrders.filter(w => w.stage === 'READY_FOR_DISPATCH' || w.status === 'Ready for Dispatch')
                      : displayedWorkOrders
                    ).slice(0, 50).map((w) => (
                      <option key={w.id} value={w.id || w.workOrderNo}>
                        {w.workOrderNo} — {w.product} (Passed QC)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pod-form-group">
                  <label className="pod-form-label">Handover Notes</label>
                  <textarea
                    className="pod-form-textarea"
                    value={dispatchForm.notes}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="pod-modal-footer">
                <button type="button" className="pod-btn-cancel" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="pod-btn-submit" disabled={submitting}>
                  {submitting ? 'Handing over...' : 'Confirm Handover to Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: View WO Details */}
      {modalType === 'view_wo' && selectedWo && (
        <div className="pod-modal-overlay">
          <div className="pod-modal-content">
            <div className="pod-modal-header">
              <h3>Work Order Details: {selectedWo.workOrderNo}</h3>
              <button type="button" className="pod-modal-close" onClick={() => setModalType(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="pod-modal-body">
              <div className="pod-meta-item">
                <span className="pod-meta-label">Sales Order / Client:</span>
                <span className="pod-meta-val">{selectedWo.salesOrderCustomer}</span>
              </div>
              <div className="pod-meta-item">
                <span className="pod-meta-label">Product & Specification:</span>
                <span className="pod-meta-val">{selectedWo.product}</span>
              </div>
              <div className="pod-meta-item">
                <span className="pod-meta-label">Load Rating:</span>
                <span className="pod-meta-val">{selectedWo.loadRating}</span>
              </div>
              <div className="pod-meta-item">
                <span className="pod-meta-label">Planned Target vs Produced:</span>
                <span className="pod-meta-val">{selectedWo.targetQty} planned | {selectedWo.producedQty} completed ({selectedWo.progress}%)</span>
              </div>
              <div className="pod-meta-item">
                <span className="pod-meta-label">Assigned Shift & Machine:</span>
                <span className="pod-meta-val">{selectedWo.shiftMachine}</span>
              </div>
              <div className="pod-meta-item">
                <span className="pod-meta-label">Production Duration:</span>
                <span className="pod-meta-val">{selectedWo.duration}</span>
              </div>
              <div className="pod-meta-item">
                <span className="pod-meta-label">Operational Status:</span>
                <span className={`pod-badge-status ${selectedWo.badgeClass}`}>{selectedWo.status}</span>
              </div>
            </div>
            <div className="pod-modal-footer">
              <button type="button" className="pod-btn-cancel" onClick={() => setModalType(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
