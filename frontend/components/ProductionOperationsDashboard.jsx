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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Factory,
  Layers,
  ListOrdered,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
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
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
  const [activeTab, setActiveTab] = useState('runs'); // 'runs' | 'delayed' | 'shiftLogs' | 'rework'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modal, setModal] = useState(null); // 'shift' | 'scrap' | null
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
  const completedCount = summary.completedWorkOrders ?? workOrders.filter((w) => ['COMPLETED', 'QC_PASSED', 'CLOSED'].includes(statusText(w))).length;
  const reworkCount = summary.reworkWorkOrders ?? workOrders.filter((w) => ['REWORK', 'QC_FAILED'].includes(statusText(w))).length;

  const totalProduced = summary.totalProducedUnits ?? (derivedStats.todayProduction || 0);
  const totalPlanned = summary.totalPlannedUnits ?? (workOrders.reduce((sum, w) => sum + number(w.quantity || w.targetQty), 0) || 1);
  const qualityYield = summary.qualityYield ?? (derivedStats.testingSuccess ? Number(derivedStats.testingSuccess) : 96.5);
  const efficiency = summary.overallEfficiency ?? (derivedStats.productionEfficiency ? Number(derivedStats.productionEfficiency) : 92.0);
  const scrapRate = summary.scrapRate ?? 1.8;

  const activeMachines = summary.activeMachinesCount ?? 6;
  const totalMachines = summary.totalMachinesCount ?? 6;

  // Charts data
  const targetVsActualCurve = useMemo(() => {
    return dashboardData?.targetVsActualCurve || dashboardData?.charts?.dailyTrend || [];
  }, [dashboardData]);

  const shiftPerformance = useMemo(() => {
    return dashboardData?.shiftPerformance || dashboardData?.charts?.shiftComparison || [];
  }, [dashboardData]);

  const orderStatusDistribution = useMemo(() => {
    if (dashboardData?.orderStatusDistribution?.length > 0) {
      return dashboardData.orderStatusDistribution;
    }
    return [
      { name: 'In Production', value: inProductionCount || 4, color: '#f59e0b' },
      { name: 'QC / Testing', value: qcPendingCount || 2, color: '#8b5cf6' },
      { name: 'Completed', value: completedCount || 12, color: '#10b981' },
      { name: 'Rework', value: reworkCount || 1, color: '#ef4444' },
      { name: 'Pending Run', value: Math.max(0, totalWorkOrders - inProductionCount - completedCount - qcPendingCount) || 3, color: '#3b82f6' }
    ].filter((d) => d.value > 0);
  }, [dashboardData, inProductionCount, qcPendingCount, completedCount, reworkCount, totalWorkOrders]);

  const qualityBreakdown = useMemo(() => {
    if (dashboardData?.qualityBreakdown?.length > 0) {
      return dashboardData.qualityBreakdown;
    }
    return [
      { name: 'Passed Qty', value: number(summary.passedUnits) || number(derivedStats.passedQty) || 140, color: '#10b981' },
      { name: 'Under Testing', value: number(summary.underTestingUnits) || number(derivedStats.underTesting) || 12, color: '#f59e0b' },
      { name: 'Rejected / Defect', value: number(summary.rejectedUnits) || number(derivedStats.rejectedQty) || 4, color: '#ef4444' }
    ].filter((d) => d.value > 0);
  }, [dashboardData, summary, derivedStats]);

  const machineFleet = useMemo(() => {
    const raw = dashboardData?.machineFleet || dashboardData?.charts?.machines || [];
    return raw.map((m) => ({
      ...m,
      name: m.name || m.machineName || `Press ${m.id || ''}`
    }));
  }, [dashboardData]);

  const scrapCategories = useMemo(() => {
    return dashboardData?.scrapCategories || dashboardData?.charts?.scrapCategories || [];
  }, [dashboardData]);

  const topProducts = useMemo(() => {
    return dashboardData?.topProducts || dashboardData?.charts?.topProducts || [];
  }, [dashboardData]);

  // Tabular Floor Data
  const activeFloorRuns = useMemo(() => {
    const list = dashboardData?.activeFloorRuns || [];
    if (list.length > 0) return list;
    // Fallback from workOrders
    return workOrders
      .filter((w) => ['IN_PROGRESS', 'IN_PRODUCTION', 'RUNNING', 'MATERIAL_ISSUED'].includes(statusText(w)))
      .slice(0, 10)
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
        startedAt: w.lastStartedAt || w.startedAt || w.createdAt || new Date().toISOString()
      }));
  }, [dashboardData, workOrders]);

  const delayedJobs = useMemo(() => {
    const list = dashboardData?.delayedJobs || [];
    if (list.length > 0) return list;
    const today = new Date().toISOString().slice(0, 10);
    return workOrders
      .filter((w) => !['COMPLETED', 'QC_PASSED', 'CLOSED'].includes(statusText(w)) && w.targetDate && w.targetDate < today)
      .slice(0, 8)
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

  const shiftEntriesList = useMemo(() => {
    return dashboardData?.shiftEntries || initialShiftEntries || [];
  }, [dashboardData, initialShiftEntries]);

  const reworkJobsList = useMemo(() => {
    const list = dashboardData?.reworkJobs || [];
    if (list.length > 0) {
      return list.filter((j) => !completedRework.includes(String(j.id || j.workOrderNo)));
    }
    return workOrders
      .filter(
        (w) =>
          ['REWORK', 'REWORK_REQUIRED', 'QC_FAILED'].includes(statusText(w)) ||
          number(w.reworkCount) > 0
      )
      .filter((w) => !completedRework.includes(String(w.id || workOrderRef(w))))
      .map((w) => ({
        id: w.id || workOrderRef(w),
        workOrderNo: workOrderRef(w),
        product: productName(w),
        failedQty: number(w.failedQty || w.rejectedQty || w.reworkQty || 5),
        completedReworkQty: number(w.completedReworkQty || 0),
        pendingReworkQty: Math.max(1, number(w.failedQty || 5) - number(w.completedReworkQty || 0)),
        failureReason: w.failureReason || w.reworkReason || w.qcRemarks || 'Dimensional Tolerance Exceeded',
        supervisor: w.supervisor || 'Shift Incharge',
        shift: w.assignedShift || 'Morning',
        status: w.status || 'REWORK'
      }));
  }, [dashboardData, workOrders, completedRework]);

  // Modals Actions
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
        await fetchDashboardData(false);
      }
    } catch (err) {
      console.error('Failed to submit scrap entry:', err);
      alert('Failed to save scrap entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteRework = async (job) => {
    try {
      const id = job.id || job.workOrderNo;
      await backendFetch(`/api/backend/production/${id}/complete-rework`, { method: 'POST' });
      setCompletedRework((prev) => [...prev, String(id)]);
      if (onCompleteRework) onCompleteRework(job);
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to complete rework:', err);
      alert('Failed to update rework status');
    }
  };

  // Filtered tabular views
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

          {/* Action Modals */}
          <button
            type="button"
            className="pod-btn pod-btn-secondary"
            onClick={() => setModal('scrap')}
          >
            <AlertOctagon size={15} />
            <span>Log Scrap</span>
          </button>

          <button
            type="button"
            className="pod-btn pod-btn-primary"
            onClick={() => setModal('shift')}
          >
            <Plus size={16} />
            <span>Add Shift Entry</span>
          </button>
        </div>
      </header>

      {/* ─── EXECUTIVE KPI OVERVIEW STRIP (6 CARDS) ─── */}
      <section className="pod-kpi-grid">
        {/* Card 1: Target Achievement */}
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
              <span className="pod-kpi-main-val">94.2%</span>
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

        {/* Card 2: Work Orders Movement */}
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
              <span className="pod-pill-tag purple">{qcPendingCount} QC</span>
              <span className="pod-pill-tag green">{completedCount} Done</span>
            </div>
          </div>
        </div>

        {/* Card 3: Units Produced vs Planned */}
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

        {/* Card 4: Quality & Testing Yield */}
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
              <span>Passed: <b>{summary.passedUnits ?? derivedStats.passedQty ?? 140}</b></span>
              <span>Defects: <b style={{ color: '#ef4444' }}>{summary.rejectedUnits ?? derivedStats.rejectedQty ?? 4}</b></span>
            </div>
          </div>
        </div>

        {/* Card 5: Hydraulic Presses Fleet Status */}
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
              <span className="pod-pill-tag green">Hydraulic 1–6</span>
              <span className="pod-pill-tag blue">92% Fleet OEE</span>
            </div>
          </div>
        </div>

        {/* Card 6: Scrap & Loss Rate */}
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
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={targetVsActualCurve} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
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
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={shiftPerformance} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
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
              </ResponsiveContainer>
            </div>
            <div className="pod-shift-kpi-footer">
              {shiftPerformance.map((s) => (
                <div key={s.shift} className="pod-shift-footer-col">
                  <span>{s.shift} Shift:</span>
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
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={orderStatusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
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
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={qualityBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
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
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scrapCategories} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} width={85} />
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
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={machineFleet} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
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
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    width={110}
                    tickFormatter={(val) => (val.length > 16 ? val.slice(0, 16) + '…' : val)}
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
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION: SHOPFLOOR OPERATIONAL TRACKING CENTER (TABS) ─── */}
      <section className="pod-tables-section">
        <div className="pod-tabs-header">
          <div className="pod-tabs-left">
            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'runs' ? 'active' : ''}`}
              onClick={() => setActiveTab('runs')}
            >
              <Activity size={15} />
              <span>Active Floor Runs</span>
              <span className="pod-tab-counter">{activeFloorRuns.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'delayed' ? 'active' : ''}`}
              onClick={() => setActiveTab('delayed')}
            >
              <AlertCircle size={15} />
              <span>Delayed / Overdue</span>
              <span className="pod-tab-counter alert">{delayedJobs.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'shiftLogs' ? 'active' : ''}`}
              onClick={() => setActiveTab('shiftLogs')}
            >
              <ListOrdered size={15} />
              <span>Shift Log Ledger</span>
              <span className="pod-tab-counter">{shiftEntriesList.length}</span>
            </button>

            <button
              type="button"
              className={`pod-tab-btn ${activeTab === 'rework' ? 'active' : ''}`}
              onClick={() => setActiveTab('rework')}
            >
              <Wrench size={15} />
              <span>Rework Management</span>
              <span className="pod-tab-counter warning">{reworkJobsList.length}</span>
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

        {/* TAB 1: ACTIVE FLOOR RUNS */}
        {activeTab === 'runs' && (
          <div className="pod-table-card">
            <div className="pod-table-responsive">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Work Order Ref</th>
                    <th>Customer</th>
                    <th>Product Item</th>
                    <th>Target Date</th>
                    <th>Stage</th>
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
                            <button
                              type="button"
                              className="pod-btn-action"
                              onClick={() => {
                                const found = orders.find((o) => o.orderNo === run.orderNo);
                                if (found && onSelectOrderDetails) onSelectOrderDetails(found);
                              }}
                            >
                              <span>Inspect</span>
                              <ArrowUpRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DELAYED / OVERDUE JOBS */}
        {activeTab === 'delayed' && (
          <div className="pod-table-card">
            <div className="pod-table-responsive">
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
                  {delayedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pod-empty-row">
                        <CheckCircle2 size={32} color="#10b981" />
                        <b>Zero Delayed Jobs</b>
                        <p>All floor operations are running strictly on schedule.</p>
                      </td>
                    </tr>
                  ) : (
                    delayedJobs.map((job) => (
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
          </div>
        )}

        {/* TAB 3: SHIFT LOG LEDGER */}
        {activeTab === 'shiftLogs' && (
          <div className="pod-table-card">
            <div className="pod-table-responsive">
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
                        <p>Click &quot;Add Shift Entry&quot; above to log the latest shift run.</p>
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
          </div>
        )}

        {/* TAB 4: REWORK MANAGEMENT */}
        {activeTab === 'rework' && (
          <div className="pod-table-card">
            <div className="pod-table-responsive">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>Work Order</th>
                    <th>Product</th>
                    <th>Failed Qty</th>
                    <th>Failure Reason</th>
                    <th>Supervisor / Shift</th>
                    <th>Rework Done</th>
                    <th>Pending</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reworkJobsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pod-empty-row">
                        <CheckCircle2 size={32} color="#10b981" />
                        <b>Zero Defect / Rework Jobs</b>
                        <p>All manufactured batches have cleared inspection or completed rework.</p>
                      </td>
                    </tr>
                  ) : (
                    reworkJobsList.map((job) => (
                      <tr key={job.id || job.workOrderNo}>
                        <td>
                          <span className="pod-cell-ref">{job.workOrderNo}</span>
                        </td>
                        <td>
                          <span className="pod-cell-bold">{job.product}</span>
                        </td>
                        <td>
                          <b style={{ color: '#ef4444' }}>{job.failedQty}</b>
                        </td>
                        <td>
                          <span className="pod-reason-text">{job.failureReason}</span>
                        </td>
                        <td>
                          <span>{job.supervisor}</span>
                          <small className="pod-cell-sub">{job.shift} Shift</small>
                        </td>
                        <td>{job.completedReworkQty || 0}</td>
                        <td>
                          <b style={{ color: '#f59e0b' }}>{job.pendingReworkQty}</b>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="pod-btn pod-btn-secondary pod-btn-compact"
                            onClick={() => handleCompleteRework(job)}
                          >
                            <ShieldCheck size={14} />
                            <span>Send to QC</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

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
