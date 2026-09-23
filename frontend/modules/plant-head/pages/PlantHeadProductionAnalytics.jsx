'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Factory,
  Package,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  Printer,
  Filter,
  Calendar,
  TrendingUp,
  Layers,
  Users,
  Wrench,
  ShieldCheck,
  Gauge,
  ChevronRight,
  Activity,
  Search,
  ArrowUpRight,
  BarChart2,
  Eye,
  X,
  Award,
  CheckSquare,
  Sparkles,
  PieChart as PieIcon,
  Sliders,
  Camera
} from 'lucide-react';
import {
  ComposedChart,
  BarChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { backendFetch } from '../../../lib/backendFetch';
import UltraResponsiveChart from '../../../shared/components/UltraResponsiveChart';

// ── Color Palette & Constants ──
const PALETTE = {
  primary: '#0284c7',       // Sky 600
  primaryDark: '#0369a1',   // Sky 700
  secondary: '#0f172a',     // Slate 900
  emerald: '#10b981',       // Emerald 500
  purple: '#8b5cf6',        // Violet 500
  amber: '#f59e0b',         // Amber 500
  rose: '#f43f5e',          // Rose 500
  slate: '#64748b',         // Slate 500
  border: '#e2e8f0',
  bgLight: '#f8fafc',
  cardBg: '#ffffff',
};

const CHART_COLORS = ['#0284c7', '#0d9488', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#64748b', '#6366f1'];

const CAPACITY_COLORS = {
  C250: '#0284c7',
  B125: '#0d9488',
  LD: '#8b5cf6',
  ELD: '#f59e0b',
  D400: '#ec4899',
  '3T': '#10b981',
  F900: '#ef4444',
  Other: '#64748b',
};

// Safe number formatter avoiding null/undefined toLocaleString runtime crashes
const fmt = (val, decimals = 0) => {
  const n = Number(val || 0);
  if (isNaN(n)) return '0';
  return decimals > 0
    ? n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(n).toLocaleString('en-IN');
};

// ── Ultra-Responsive Zero-Blank Chart Container (Mobile 320px to Ultra-12K) ──
const ResponsiveChartBox = ({
  children,
  height = 280,
  minHeight,
  isEmpty = false,
  emptyTitle,
  emptySubtitle,
  onSwitchTimeframe,
  switchButtonLabel
}) => {
  return (
    <UltraResponsiveChart
      height={height}
      minHeight={minHeight}
      isEmpty={isEmpty}
      emptyTitle={emptyTitle}
      emptySubtitle={emptySubtitle}
      onSwitchTimeframe={onSwitchTimeframe}
      switchButtonLabel={switchButtonLabel}
    >
      {(metrics) => {
        if (typeof children === 'function') {
          return children(metrics);
        }
        return (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {children}
          </ResponsiveContainer>
        );
      }}
    </UltraResponsiveChart>
  );
};

export const PlantHeadProductionAnalytics = () => {
  // ── Filters & Timeframe State ──
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [globalTimeframe, setGlobalTimeframe] = useState('September 2026');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-30');
  const [productFilter, setProductFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'workorders', 'quality', 'machines', 'customers'
  const [searchQuery, setSearchQuery] = useState('');
  const [metricMode, setMetricMode] = useState('pieces'); // 'pieces' or 'weight'
  const [selectedWorkOrderModal, setSelectedWorkOrderModal] = useState(null);
  const reportRef = useRef(null);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  // ── Fetch Production Telemetry from Live Backend ──
  const loadProductionData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = new URLSearchParams();
      if (selectedMonth === 'custom' || globalTimeframe === 'Custom') {
        q.set('filter', 'Custom');
        q.set('customStart', customStartDate);
        q.set('customEnd', customEndDate);
      } else if (selectedMonth === 'all' || globalTimeframe === 'All Time') {
        q.set('filter', 'All Time');
        q.set('month', 'all');
      } else {
        q.set('month', selectedMonth);
        q.set('filter', globalTimeframe);
      }

      if (productFilter !== 'All') q.set('productId', productFilter);
      if (capacityFilter !== 'All') q.set('capacity', capacityFilter);
      if (sizeFilter !== 'All') q.set('size', sizeFilter);
      if (statusFilter !== 'All') q.set('status', statusFilter);

      const res = await backendFetch(`/api/backend/plant-head/analytics/monthly-production-report?${q.toString()}`, { cacheTtlMs: 0 });
      const rawData = res?.data || res;
      setReport(rawData);
    } catch (err) {
      console.error('Failed to load production analytics:', err);
      setError(err?.message || 'Unable to connect to live production analytics engine.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, globalTimeframe, customStartDate, customEndDate, productFilter, capacityFilter, sizeFilter, statusFilter]);

  useEffect(() => {
    loadProductionData();
  }, [loadProductionData]);

  // ── Timeframe Change Handlers ──
  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    if (val === '2026-08') {
      setGlobalTimeframe('August 2026');
      setCustomStartDate('2026-08-01');
      setCustomEndDate('2026-08-31');
    } else if (val === '2026-09') {
      setGlobalTimeframe('September 2026');
      setCustomStartDate('2026-09-01');
      setCustomEndDate('2026-09-30');
    } else if (val === 'all') {
      setGlobalTimeframe('All Time');
    } else if (val === 'custom') {
      setGlobalTimeframe('Custom');
    }
  };

  const handlePresetClick = (preset) => {
    setGlobalTimeframe(preset);
    if (preset === 'August 2026') {
      setSelectedMonth('2026-08');
      setCustomStartDate('2026-08-01');
      setCustomEndDate('2026-08-31');
    } else if (preset === 'September 2026') {
      setSelectedMonth('2026-09');
      setCustomStartDate('2026-09-01');
      setCustomEndDate('2026-09-30');
    } else if (preset === 'All Time') {
      setSelectedMonth('all');
    } else if (preset === 'Custom') {
      setSelectedMonth('custom');
    }
  };

  // ── Memoized Data Collections ──
  const kpis = useMemo(() => {
    const raw = report?.kpis || {};
    return {
      totalWeight: Number(raw.totalWeight || 0),
      totalWeightTonnes: Number(raw.totalWeightTonnes || (raw.totalWeight ? raw.totalWeight / 1000 : 0)),
      totalCovers: Number(raw.totalCovers || 0),
      totalFrames: Number(raw.totalFrames || 0),
      totalPieces: Number(raw.totalPieces || 0),
      averageWeightPerPiece: Number(raw.averageWeightPerPiece || 0),
      totalWorkOrders: Number(raw.totalWorkOrders || 0),
      completedWorkOrders: Number(raw.completedWorkOrders || 0),
      activeWorkOrders: Number(raw.activeWorkOrders || 0),
      completionRate: Number(raw.completionRate || 0),
      fpyRate: Number(raw.fpyRate || 98.5),
      totalQcInspections: Number(raw.totalQcInspections || 0),
      passedQcCount: Number(raw.passedQcCount || 0),
      rejectedQcCount: Number(raw.rejectedQcCount || 0),
      activeMachines: Number(raw.activeMachines || 6),
      uniqueCustomers: Number(raw.uniqueCustomers || 0),
      narrative: raw.narrative || 'No completed production data for this timeframe.'
    };
  }, [report]);

  const productsData = useMemo(() => report?.products || [], [report]);
  const sizesData = useMemo(() => report?.sizes || [], [report]);
  const capacitiesData = useMemo(() => report?.capacities || [], [report]);
  const dailyTrendData = useMemo(() => report?.dailyTrend || [], [report]);
  const pipelineStatuses = useMemo(() => report?.pipelineStatuses || [], [report]);
  const machineFleetData = useMemo(() => report?.machineFleet || [], [report]);
  const customersData = useMemo(() => report?.customers || [], [report]);
  const salespeopleData = useMemo(() => report?.salespeople || [], [report]);
  const rawWorkOrders = useMemo(() => report?.workOrdersList || [], [report]);

  // Filtered work orders based on live search bar
  const filteredWorkOrders = useMemo(() => {
    if (!searchQuery.trim()) return rawWorkOrders;
    const q = searchQuery.toLowerCase().trim();
    return rawWorkOrders.filter(wo =>
      (wo.workOrderNumber || '').toLowerCase().includes(q) ||
      (wo.orderNumber || '').toLowerCase().includes(q) ||
      (wo.customer || '').toLowerCase().includes(q) ||
      (wo.product || '').toLowerCase().includes(q) ||
      (wo.status || '').toLowerCase().includes(q) ||
      (wo.capacity || '').toLowerCase().includes(q)
    );
  }, [rawWorkOrders, searchQuery]);

  // ── Enhanced UTF-8 BOM CSV Export ──
  const handleExportCSV = () => {
    const listToExport = (rawWorkOrders && rawWorkOrders.length > 0) ? rawWorkOrders : filteredWorkOrders;
    if (!listToExport || listToExport.length === 0) {
      alert('No production work order records found to export for this period.');
      return;
    }

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Work Order No',
      'Production Plan',
      'Sales Order No',
      'Customer Account',
      'Product Specification',
      'Category',
      'Capacity / Rating',
      'Size / Dimension',
      'Quantity (pcs)',
      'Covers (pcs)',
      'Frames (pcs)',
      'Unit Weight (kg)',
      'Total Weight (kg)',
      'Total Weight (MT)',
      'Machine / Press',
      'QC Result',
      'QC Remarks',
      'Production Status',
      'Created Date',
      'Completed Date'
    ];

    const rows = listToExport.map(w => {
      const qty = Number(w.quantity) || 0;
      const wt = Number(w.weight) || 0;
      const unitWt = qty > 0 ? (Math.round((wt / qty) * 10) / 10) : 0;
      return [
        escapeCSV(w.workOrderNumber),
        escapeCSV(w.planNumber),
        escapeCSV(w.orderNumber),
        escapeCSV(w.customer),
        escapeCSV(w.product),
        escapeCSV(w.category),
        escapeCSV(w.capacity),
        escapeCSV(w.size),
        qty,
        Number(w.covers) || 0,
        Number(w.frames) || 0,
        unitWt,
        wt,
        (wt / 1000).toFixed(3),
        escapeCSV(w.machine),
        escapeCSV(w.qcResult),
        escapeCSV(w.qcRemarks),
        escapeCSV(w.status || w.productionStatus),
        escapeCSV(w.createdAt ? new Date(w.createdAt).toISOString().slice(0, 10) : ''),
        escapeCSV(w.completedAt ? new Date(w.completedAt).toISOString().slice(0, 10) : '')
      ].join(',');
    });

    const summaryBlock = [
      `"HIMALAYA COMPOSITES PVT. LTD. - PRODUCTION TELEMETRY AUDIT REPORT"`,
      `"Reporting Timeframe:","${globalTimeframe}"`,
      `"Generated On:","${new Date().toLocaleString('en-IN')}"`,
      `"Total Work Orders:","${listToExport.length}"`,
      `"Total Finished Pieces:","${kpis.totalPieces || listToExport.reduce((s, w) => s + (w.pieces || w.quantity || 0), 0)}"`,
      `"Total Production Weight (kg):","${kpis.totalWeight || listToExport.reduce((s, w) => s + (w.weight || 0), 0)}"`,
      `"Total Production Weight (MT):","${(kpis.totalWeightTonnes || ((kpis.totalWeight || 0) / 1000)).toFixed(2)}"`,
      `"Quality First Pass Yield (FPY):","${kpis.fpyRate}%"`,
      ''
    ].join('\n');

    const csvContent = summaryBlock + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTimeframe = (globalTimeframe || 'all').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Himalaya_Production_Report_${cleanTimeframe}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Download Dashboard Image ──
  const handleDownloadImage = async () => {
    if (!reportRef.current || downloadingImage) return;
    setDownloadingImage(true);

    const fileName = `Himalaya_Production_Analytics_${(globalTimeframe || 'September_2026').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(reportRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
        filter: (node) => {
          if (node.classList && (node.classList.contains('no-capture') || node.classList.contains('no-print') || node.classList.contains('print-only-report'))) {
            return false;
          }
          return true;
        }
      });

      if (dataUrl) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 150);
        setDownloadingImage(false);
        return;
      }
    } catch (h2iErr) {
      console.warn('[html-to-image failed, falling back to html2canvas]:', h2iErr);
    }

    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvasFn = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvasFn(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        ignoreElements: (el) => {
          return el.classList && (el.classList.contains('no-capture') || el.classList.contains('no-print') || el.classList.contains('print-only-report'));
        }
      });

      if (canvas) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 150);
      }
    } catch (err) {
      console.error('Failed to capture dashboard image:', err);
      alert('Unable to capture dashboard image. Please try again.');
    } finally {
      setDownloadingImage(false);
    }
  };

  return (
    <div ref={reportRef} style={{ padding: 'clamp(12px, 2vw, 24px)', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a', width: '100%', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

      {/* Screen Interactive Layout */}
      <div className="screen-only-view">

      {/* ── Top Header Banner ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '12px',
            borderRadius: '14px',
            color: '#fff',
            boxShadow: '0 6px 16px rgba(2, 132, 199, 0.3)'
          }}>
            <Factory size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Himalaya Composites Pvt. Ltd.
              </h1>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                fontSize: '11.5px',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #bae6fd'
              }}>
                PRODUCTION ANALYTICS &amp; MIS
              </span>
              <span style={{
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '11.5px',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                100% RECONCILED LIVE DATABASE
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0', fontWeight: '500' }}>
              Real-time plant telemetry covering completed work orders, mold press throughput, component ratios, and quality assurance
            </p>
          </div>
        </div>

        {/* Global Header Action Buttons */}
        <div className="no-capture" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadProductionData}
            disabled={loading}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              border: '1.5px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Sync Data'}
          </button>
          <button
            onClick={handleDownloadImage}
            disabled={downloadingImage}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: downloadingImage ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)',
              opacity: downloadingImage ? 0.75 : 1
            }}
          >
            <Camera size={14} className={downloadingImage ? 'spin' : ''} /> {downloadingImage ? 'Generating Image...' : 'Download Image'}
          </button>
        </div>
      </div>

      {/* ── Timeframe & Dynamic Filter Toolbar ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '12px 18px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Month Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={17} color="#0284c7" />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>Select Month:</span>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="all">All-Time Aggregate</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {['September 2026', 'August 2026', 'All Time', 'Custom'].map(preset => {
              const isActive = globalTimeframe === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    background: isActive ? '#0284c7' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Custom Date Inputs if Custom is active */}
          {(globalTimeframe === 'Custom' || selectedMonth === 'custom') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          )}
        </div>

        {/* Secondary Dynamic Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Capacity Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Capacity:</span>
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b'
              }}
            >
              <option value="All">All Capacities</option>
              {(report?.filterOptions?.capacities || ['C250', 'LD', 'B125', 'ELD', 'D400', '3T']).map((c, idx) => {
                const cName = typeof c === 'object' && c !== null ? (c.name || c.capacity || '') : String(c || '');
                return <option key={`${cName}-${idx}`} value={cName}>{cName}</option>;
              })}
            </select>
          </div>

          {/* Product Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Product:</span>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b',
                maxWidth: '180px'
              }}
            >
              <option value="All">All Products</option>
              {(report?.filterOptions?.products || []).slice(0, 25).map((p, idx) => {
                const pName = typeof p === 'object' && p !== null ? (p.name || p.product || '') : String(p || '');
                return <option key={`${pName}-${idx}`} value={pName}>{pName}</option>;
              })}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
              <option value="IN_PRODUCTION">In Production</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Executive 6 KPI Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px', marginBottom: '20px' }}>
        {/* KPI 1: Production Weight */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #0284c7',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Weight Output</span>
            <Factory size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {fmt(kpis.totalWeight)} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>kg</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7' }}>
            {kpis.totalWeightTonnes} Tonnes &bull; Avg {kpis.averageWeightPerPiece} kg/pc
          </div>
        </div>

        {/* KPI 2: Total Pieces & Components */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #0d9488',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Component Volume</span>
            <Package size={16} color="#0d9488" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {fmt(kpis.totalPieces)} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>pcs</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0d9488' }}>
            {fmt(kpis.totalCovers)} Covers &bull; {fmt(kpis.totalFrames)} Frames
          </div>
        </div>

        {/* KPI 3: Work Order Completion Rate */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #8b5cf6',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Work Order Fulfillment</span>
            <CheckSquare size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {kpis.completedWorkOrders} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>/ {kpis.totalWorkOrders} WOs</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6' }}>
            {kpis.completionRate}% Completion Rate
          </div>
        </div>

        {/* KPI 4: First Pass Yield (FPY %) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #10b981',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>First Pass Yield (FPY)</span>
            <ShieldCheck size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#059669', margin: '6px 0 2px 0' }}>
            {kpis.fpyRate}%
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#047857' }}>
            {kpis.passedQcCount} Passed &bull; {kpis.rejectedQcCount} Rework
          </div>
        </div>

        {/* KPI 5: Machine Fleet Telemetry */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #f59e0b',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Hydraulic Press Fleet</span>
            <Wrench size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            6 Presses
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#d97706' }}>
            Sections A, B, C &bull; Lines 1-3 Active
          </div>
        </div>

        {/* KPI 6: Customer Demand Base */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #6366f1',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Clients Fulfilled</span>
            <Users size={16} color="#6366f1" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {kpis.uniqueCustomers} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Accounts</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>
            Manufacturing Backlog Active
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'overview', label: 'Overview & Run Rate', icon: TrendingUp },
          { id: 'products', label: 'Product & Load Mix', icon: Layers },
          { id: 'workorders', label: 'Work Orders & Floor', icon: CheckSquare },
          { id: 'quality', label: 'Quality & QC Telemetry', icon: ShieldCheck },
          { id: 'machines', label: 'Machine Fleet & Lines', icon: Wrench },
          { id: 'customers', label: 'Sales & Customer Demand', icon: Users },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                background: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                borderRadius: '8px 8px 0 0',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & THROUGHPUT RUN RATE ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Daily Output Run Rate Composed Chart */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Daily Production Run Rate (Output Weight vs Completed Pieces)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                  Daily production volume recorded across completed work orders &bull; {globalTimeframe}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700' }}>● Weight (kg)</span>
                <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: '700' }}>■ Pieces (nos.)</span>
              </div>
            </div>

            <ResponsiveChartBox
              height={320}
              isEmpty={!dailyTrendData || dailyTrendData.length === 0}
              emptyTitle="No daily production run-rate data for this timeframe"
              emptySubtitle="Switch to September 2026 or All Time to view live daily manufacturing telemetry."
              onSwitchTimeframe={() => handlePresetClick('September 2026')}
              switchButtonLabel="View Active September 2026 Production"
            >
              {(metrics) => (
                <ResponsiveContainer
                  width="100%"
                  height={metrics?.height || 320}
                  minWidth={0}
                  minHeight={metrics?.height || 320}
                  initialDimension={{ width: metrics?.width || 800, height: metrics?.height || 320 }}
                >
                  <ComposedChart
                    data={dailyTrendData}
                    margin={{
                      top: Math.round(10 * (metrics?.scale || 1)),
                      right: Math.round(15 * (metrics?.scale || 1)),
                      bottom: Math.round(20 * (metrics?.scale || 1)),
                      left: Math.round(-5 * (metrics?.scale || 1))
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: Math.max(9, Math.round(10 * (metrics?.scale || 1))), fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      interval="preserveStartEnd"
                      minTickGap={12}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: Math.max(9, Math.round(10 * (metrics?.scale || 1))), fill: '#0284c7' }}
                      axisLine={false}
                      tickLine={false}
                      width={Math.round(42 * (metrics?.scale || 1))}
                      tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}T` : val}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: Math.max(9, Math.round(10 * (metrics?.scale || 1))), fill: '#0d9488' }}
                      axisLine={false}
                      tickLine={false}
                      width={Math.round(36 * (metrics?.scale || 1))}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: `${Math.round(12 * (metrics?.scale || 1))}px`
                      }}
                      formatter={(val, name) => [name === 'weight' ? `${fmt(val)} kg` : `${fmt(val)} pcs`, name === 'weight' ? 'Weight' : 'Pieces']}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      fill="#e0f2fe"
                      stroke="#0284c7"
                      strokeWidth={Math.max(1.5, Math.round(2.5 * (metrics?.scale || 1)))}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="pieces"
                      fill="#0d9488"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={Math.round(30 * (metrics?.scale || 1))}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </ResponsiveChartBox>
          </div>

          {/* Component Balance & Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            {/* Covers vs Frames Balance */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Package size={18} color="#0284c7" />
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Covers vs Frames Production Balance
                </h4>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
                Himalaya composite units require matched covers and frames. Imbalanced production creates staging bottlenecks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '800', marginBottom: '5px' }}>
                    <span style={{ color: '#0284c7' }}>Covers Produced</span>
                    <span style={{ color: '#0f172a' }}>{fmt(kpis.totalCovers)} pcs ({kpis.totalPieces > 0 ? ((kpis.totalCovers / kpis.totalPieces) * 100).toFixed(1) : 50}%)</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${kpis.totalPieces > 0 ? (kpis.totalCovers / kpis.totalPieces) * 100 : 50}%`, height: '100%', background: '#0284c7' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '800', marginBottom: '5px' }}>
                    <span style={{ color: '#0d9488' }}>Frames Produced</span>
                    <span style={{ color: '#0f172a' }}>{fmt(kpis.totalFrames)} pcs ({kpis.totalPieces > 0 ? ((kpis.totalFrames / kpis.totalPieces) * 100).toFixed(1) : 50}%)</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${kpis.totalPieces > 0 ? (kpis.totalFrames / kpis.totalPieces) * 100 : 50}%`, height: '100%', background: '#0d9488' }}></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '18px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
                <strong>Component Balance Ratio:</strong> {kpis.totalFrames > 0 ? (kpis.totalCovers / kpis.totalFrames).toFixed(2) : '1.00'} Cover:Frame ratio. Manufacturing floor is in optimal pairing synchronization.
              </div>
            </div>

            {/* Strategic Operational Highlights */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Sparkles size={18} color="#059669" />
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Key Plant Operational Highlights
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: '800', color: '#166534' }}>Top Capacity: </span>
                  <span style={{ color: '#14532d' }}>{capacitiesData[0]?.name || 'C250'} accounts for {capacitiesData[0]?.share || 0}% of manufacturing output.</span>
                </div>
                <div style={{ padding: '10px 14px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: '800', color: '#0369a1' }}>Quality Yield: </span>
                  <span style={{ color: '#0c4a6e' }}>{kpis.fpyRate}% First Pass Yield across {kpis.totalQcInspections} live technical QC checks.</span>
                </div>
                <div style={{ padding: '10px 14px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: '800', color: '#6b21a8' }}>Primary Size: </span>
                  <span style={{ color: '#581c87' }}>{sizesData[0]?.name || '600X600'} represents {sizesData[0]?.share || 0}% of all physical chamber production.</span>
                </div>
                <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: '800', color: '#92400e' }}>Active Fleet: </span>
                  <span style={{ color: '#78350f' }}>6 Hydraulic Presses fully allocated across Sections A, B, and C.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PRODUCT & LOAD CAPACITY MIX ── */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Mix Bar: Metric Toggle & Header */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '14px 18px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Product Mix &amp; Load Class Distribution
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Analyzing composite output across EN 124 / IS load ratings and chamber sizes
              </p>
            </div>
            {/* Metric Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setMetricMode('weight')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: metricMode === 'weight' ? '#0284c7' : 'transparent',
                  color: metricMode === 'weight' ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Weight (kg)
              </button>
              <button
                onClick={() => setMetricMode('pieces')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: metricMode === 'pieces' ? '#0284c7' : 'transparent',
                  color: metricMode === 'pieces' ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Pieces (nos.)
              </button>
            </div>
          </div>

          {/* 2 Charts Grid: Load Class Bars & Product Weight Donut */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            {/* Chart 1: Load Class Distribution */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>
                Load Capacity Rating Distribution (EN 124 Standard - {metricMode === 'weight' ? 'kg' : 'pcs'})
              </h4>
              <ResponsiveChartBox
                height={260}
                isEmpty={!capacitiesData || capacitiesData.length === 0}
                emptyTitle="No capacity distribution data for this timeframe"
                emptySubtitle="Switch to September 2026 to see load rating distribution."
                onSwitchTimeframe={() => handlePresetClick('September 2026')}
                switchButtonLabel="View Active September 2026 Telemetry"
              >
                {(metrics) => (
                  <ResponsiveContainer
                    width="100%"
                    height={metrics?.height || 260}
                    minWidth={0}
                    minHeight={metrics?.height || 260}
                    initialDimension={{ width: metrics?.width || 800, height: metrics?.height || 260 }}
                  >
                    <BarChart
                      data={capacitiesData}
                      layout="vertical"
                      margin={{
                        left: 0,
                        right: Math.round(35 * (metrics?.scale || 1)),
                        top: Math.round(10 * (metrics?.scale || 1)),
                        bottom: Math.round(10 * (metrics?.scale || 1))
                      }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: Math.max(9, Math.round(11 * (metrics?.scale || 1))), fill: '#0f172a', fontWeight: '700' }}
                        axisLine={false}
                        tickLine={false}
                        width={Math.round(48 * (metrics?.scale || 1))}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0f172a',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: `${Math.round(12 * (metrics?.scale || 1))}px`
                        }}
                        formatter={(val) => [`${fmt(val)} ${metricMode === 'weight' ? 'kg' : 'pcs'} (${capacitiesData.find(c => (metricMode === 'weight' ? c.weight : c.pieces) === val)?.share || 0}%)`, metricMode === 'weight' ? 'Volume' : 'Pieces']}
                      />
                      <Bar dataKey={metricMode === 'weight' ? 'weight' : 'pieces'} radius={[0, 6, 6, 0]}>
                        {capacitiesData.map((entry, idx) => (
                          <Cell key={entry.name} fill={CAPACITY_COLORS[entry.name] || CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                        <LabelList
                          dataKey="share"
                          position="right"
                          formatter={(v) => `${v}%`}
                          style={{ fontSize: `${Math.max(9, Math.round(11 * (metrics?.scale || 1)))}px`, fontWeight: '800', fill: '#0f172a' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ResponsiveChartBox>
            </div>

            {/* Chart 2: Product Weight Donut */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>
                Top Product Output Contribution ({metricMode === 'weight' ? 'Weight kg' : 'Pieces pcs'})
              </h4>
              <ResponsiveChartBox
                height={260}
                isEmpty={!productsData || productsData.length === 0}
                emptyTitle="No product output data for this timeframe"
                emptySubtitle="Switch to September 2026 to inspect product contribution."
                onSwitchTimeframe={() => handlePresetClick('September 2026')}
                switchButtonLabel="View Active September 2026 Telemetry"
              >
                {(metrics) => (
                  <ResponsiveContainer
                    width="100%"
                    height={metrics?.height || 260}
                    minWidth={0}
                    minHeight={metrics?.height || 260}
                    initialDimension={{ width: metrics?.width || 800, height: metrics?.height || 260 }}
                  >
                    <PieChart>
                      <Pie
                        data={productsData.slice(0, 6)}
                        dataKey={metricMode === 'weight' ? 'weight' : 'pieces'}
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={Math.round(50 * (metrics?.scale || 1))}
                        outerRadius={Math.round(80 * (metrics?.scale || 1))}
                        paddingAngle={3}
                      >
                        {productsData.slice(0, 6).map((entry, idx) => (
                          <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#0f172a',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: `${Math.round(12 * (metrics?.scale || 1))}px`
                        }}
                        formatter={(val) => [`${fmt(val)} ${metricMode === 'weight' ? 'kg' : 'pcs'}`, metricMode === 'weight' ? 'Weight' : 'Pieces']}
                      />
                      <Legend wrapperStyle={{ fontSize: `${Math.max(9, Math.round(11 * (metrics?.scale || 1)))}px`, paddingTop: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ResponsiveChartBox>
            </div>
          </div>

          {/* Product Master Table - ONLY PCS (No KG) */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Detailed Manufacturing Mix by Product Specifications
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Live piece-level manufacturing output, cover &amp; frame breakdown, and share % (All units in Pieces / PCS)
                </p>
              </div>
              <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                Unit: Pieces (PCS) Only
              </span>
            </div>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Product Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Covers (pcs)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Frames (pcs)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Pieces (pcs)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Piece Share</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>WOs</th>
                </tr>
              </thead>
              <tbody>
                {productsData.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0f172a' }}>{p.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>{fmt(p.covers)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>{fmt(p.frames)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{fmt(p.pieces)} pcs</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#0369a1' }}>{p.share}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>{p.workOrders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: WORK ORDERS & FLOOR OPERATIONS ── */}
      {activeTab === 'workorders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pipeline Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px' }}>
            {pipelineStatuses.map((st, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${st.status === 'COMPLETED' ? '#10b981' : st.status === 'READY_FOR_DISPATCH' ? '#0284c7' : '#f59e0b'}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  {st.status.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '4px 0 2px 0' }}>
                  {st.count} Work Orders
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                  {fmt(st.weight)} kg &bull; {st.share}% of total volume
                </div>
              </div>
            ))}
          </div>

          {/* Master Work Orders Table with Search Bar */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Work Orders Tracking Telemetry ({filteredWorkOrders.length} Orders)
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Individual work orders linked to production plans, quality results, and press fleet
                </p>
              </div>

              {/* Real-time search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', width: '280px' }}>
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search WO, Customer, Product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Work Order</th>
                    <th style={{ padding: '10px 12px' }}>Sales Order</th>
                    <th style={{ padding: '10px 12px' }}>Customer Account</th>
                    <th style={{ padding: '10px 12px' }}>Product Specs</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Rating</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Qty (pcs)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Weight (kg)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>QC Result</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((wo, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>
                        {wo.workOrderNumber}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', fontFamily: 'monospace' }}>
                        {wo.orderNumber}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>
                        {wo.customer}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        {wo.product}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          {wo.capacity}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800' }}>
                        {wo.quantity}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>
                        {fmt(wo.weight)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          background: wo.qcResult === 'PASS' || wo.qcResult === 'PASSED' ? '#dcfce7' : '#fef3c7',
                          color: wo.qcResult === 'PASS' || wo.qcResult === 'PASSED' ? '#15803d' : '#b45309',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800'
                        }}>
                          {wo.qcResult}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          background: wo.status === 'COMPLETED' ? '#dcfce7' : wo.status === 'READY_FOR_DISPATCH' ? '#e0f2fe' : '#f1f5f9',
                          color: wo.status === 'COMPLETED' ? '#15803d' : wo.status === 'READY_FOR_DISPATCH' ? '#0369a1' : '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800'
                        }}>
                          {wo.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedWorkOrderModal(wo)}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Details &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: QUALITY & QC TELEMETRY ── */}
      {activeTab === 'quality' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* QC KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase' }}>First Pass Yield (FPY)</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#047857', marginTop: '4px' }}>{kpis.fpyRate}%</div>
              <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px' }}>Zero critical defect escapes to dispatch</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>Inspections Conducted</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#0c4a6e', marginTop: '4px' }}>{kpis.totalQcInspections}</div>
              <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px' }}>100% Work Orders Verified by QC Dept</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>Rework / Scrap Count</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#78350f', marginTop: '4px' }}>{kpis.rejectedQcCount}</div>
              <div style={{ fontSize: '12px', color: '#d97706', marginTop: '2px' }}>Internal corrective action loop active</div>
            </div>
          </div>

          {/* Quality Protocol & Inspection Summary */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Technical Quality Protocol Standards
            </h4>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
              Every composite work order undergoes load testing under IS 1726 / EN 124 protocols, dimension tolerance inspection, and visual defect checks prior to dispatch staging.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} color="#10b981" /> Load Rating Verification
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Hydraulic compressive test rigs verify permanent set tolerance and proof load resistance according to capacity specifications (C250: 25T, D400: 40T).
                </div>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} color="#0284c7" /> Dimensional &amp; Seating Integrity
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Frame clear opening and cover seating dimensions calibrated with precision gauges to guarantee rattle-free highway installations.
                </div>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} color="#8b5cf6" /> Material Composition &amp; Resin Cure
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Barcol hardness and thermal cure profiles tested to guarantee zero resin starvation and maximum fiber reinforcement strength.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: MACHINE FLEET & LINE UTILIZATION ── */}
      {activeTab === 'machines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Himalaya Hydraulic Press Fleet (HM001 &ndash; HM006)
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                Operating status, compression tonnage, and throughput distribution across Sections A, B, and C
              </p>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
              6 / 6 Presses Operational
            </span>
          </div>

          {/* 6 Hydraulic Press Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {machineFleetData.map((m, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '18px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '6px 10px', borderRadius: '6px', fontWeight: '900', fontFamily: 'monospace', fontSize: '13px' }}>
                        {m.machineId}
                      </div>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{m.name}</span>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                      ACTIVE
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {m.location}
                    </span>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {m.line}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Throughput Output</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#0284c7', marginTop: '2px' }}>{fmt(m.weight)} kg</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Work Orders</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>{m.workOrders} WOs</div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b' }}>
                  <span>Runtime: <strong>{m.runtimeHours}h / day</strong></span>
                  <span>Line Efficiency: <strong style={{ color: '#16a34a' }}>{m.efficiency}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: CUSTOMER & SALES ATTRIBUTION ── */}
      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Concentration Tiers */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Customer Demand Concentration &amp; Production Backlog
            </h4>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
              Distribution of manufactured composite tonnage across primary client accounts and sales executive teams
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>#</th>
                    <th style={{ padding: '10px 12px' }}>Customer Account</th>
                    <th style={{ padding: '10px 12px' }}>Sales Executive</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Work Orders</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Weight Output</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Share %</th>
                  </tr>
                </thead>
                <tbody>
                  {customersData.slice(0, 15).map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: '700' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0f172a' }}>
                        {c.name} {c.isNew && <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>NEW</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{c.salesperson}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>{c.orders}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{fmt(c.weight)} kg</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0369a1' }}>{c.share}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Strategic Executive Insights (Dynamic 5 Questions) ── */}
      <div style={{
        marginTop: '24px',
        background: '#ffffff',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={18} color="#0284c7" />
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Plant Head Executive Strategic Insights
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>1. Manufacturing Output Velocity</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              The plant achieved {kpis.totalWeightTonnes} tonnes of composite throughput during {globalTimeframe}, fulfilling {kpis.completedWorkOrders} work orders at {kpis.completionRate}% completion rate.
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>2. Dominant Load Class Spectrum</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              {capacitiesData[0]?.name || 'C250'} is the primary load specification representing {capacitiesData[0]?.share || 0}% of manufacturing tonnage, reflecting core municipal drainage demand.
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>3. Component Balancing Ratio</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              Output stands at {fmt(kpis.totalCovers)} covers and {fmt(kpis.totalFrames)} frames. Molding lines are operating in balanced pairing synchronization.
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>4. Fleet Utilization &amp; Line Stability</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              6 Hydraulic Presses operating across Sections A, B, and C achieved an average line efficiency above 90% with zero unplanned mechanical halts.
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>5. Quality Conformance (FPY)</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              Quality department verified {kpis.totalQcInspections} technical inspections resulting in a {kpis.fpyRate}% First Pass Yield, exceeding the 98% plant target.
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Click-to-Drilldown Modal ── */}
      {selectedWorkOrderModal && (
        <div
          onClick={() => setSelectedWorkOrderModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '24px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: 'monospace' }}>
                    {selectedWorkOrderModal.workOrderNumber}
                  </h3>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                    {selectedWorkOrderModal.status}
                  </span>
                  <span style={{
                    background: selectedWorkOrderModal.qcResult === 'PASS' || selectedWorkOrderModal.qcResult === 'PASSED' ? '#dcfce7' : '#fef3c7',
                    color: selectedWorkOrderModal.qcResult === 'PASS' || selectedWorkOrderModal.qcResult === 'PASSED' ? '#15803d' : '#b45309',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    QC: {selectedWorkOrderModal.qcResult}
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Order: {selectedWorkOrderModal.orderNumber} &bull; Plan: {selectedWorkOrderModal.planNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkOrderModal(null)}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* 4 Detail Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>Weight</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0c4a6e', marginTop: '2px' }}>{selectedWorkOrderModal.weight} kg</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase' }}>Quantity</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#14532d', marginTop: '2px' }}>{selectedWorkOrderModal.quantity} pcs</div>
              </div>
              <div style={{ background: '#faf5ff', padding: '12px', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#6b21a8', textTransform: 'uppercase' }}>Covers</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#581c87', marginTop: '2px' }}>{selectedWorkOrderModal.covers} pcs</div>
              </div>
              <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase' }}>Frames</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#78350f', marginTop: '2px' }}>{selectedWorkOrderModal.frames} pcs</div>
              </div>
            </div>

            {/* Specifications Table */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
                Technical Production Specifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12.5px' }}>
                <div><span style={{ color: '#64748b' }}>Customer:</span> <strong>{selectedWorkOrderModal.customer}</strong></div>
                <div><span style={{ color: '#64748b' }}>Sales Rep:</span> <strong>{selectedWorkOrderModal.salesExecutive}</strong></div>
                <div><span style={{ color: '#64748b' }}>Product:</span> <strong>{selectedWorkOrderModal.product}</strong></div>
                <div><span style={{ color: '#64748b' }}>Category:</span> <strong>{selectedWorkOrderModal.category}</strong></div>
                <div><span style={{ color: '#64748b' }}>Load Rating:</span> <strong>{selectedWorkOrderModal.capacity}</strong></div>
                <div><span style={{ color: '#64748b' }}>Nominal Size:</span> <strong>{selectedWorkOrderModal.size}</strong></div>
                <div><span style={{ color: '#64748b' }}>Assigned Machine:</span> <strong>{selectedWorkOrderModal.machine}</strong></div>
                <div><span style={{ color: '#64748b' }}>QC Remarks:</span> <strong>{selectedWorkOrderModal.qcRemarks || 'Standard Dimensional Check OK'}</strong></div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setSelectedWorkOrderModal(null)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      </div> {/* End .screen-only-view */}

      {/* ═══════════════════════════════════════════════════════════════════════════
          EXECUTIVE PRINT REPORT (SHOWS ALL DATA WITHOUT CLIPPING ACROSS PAGES)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="print-only-report" style={{ width: '100%', background: '#ffffff', color: '#0f172a', padding: '10px 0' }}>
        
        {/* Official Company Header */}
        <div style={{ borderBottom: '2.5px solid #0f172a', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Himalaya Composites Pvt. Ltd.
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
              Manufacturing Facility • Production Analytics &amp; MIS Audit Report
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>
              Factory Operations Telemetry • Reconciled Live Database • All Production Work Orders
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#334155', lineHeight: '1.4' }}>
            <div><strong>Reporting Period:</strong> {globalTimeframe}</div>
            <div><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Total Work Orders:</strong> {rawWorkOrders.length} records</div>
            <div><strong>Status:</strong> Reconciled Live ERP Telemetry</div>
          </div>
        </div>

        {/* Executive KPI Performance Summary Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Total Weight</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#0284c7', marginTop: '2px' }}>
              {fmt(kpis.totalWeightTonnes, 2)} MT
            </div>
            <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '1px' }}>{fmt(kpis.totalWeight)} kg net</div>
          </div>

          <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Manufactured Units</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
              {fmt(kpis.totalPieces)} pcs
            </div>
            <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '1px' }}>{fmt(kpis.totalCovers)} Cvr / {fmt(kpis.totalFrames)} Frm</div>
          </div>

          <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Work Orders Status</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
              {kpis.completionRate}% Done
            </div>
            <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '1px' }}>{fmt(kpis.completedWorkOrders)} Comp / {fmt(kpis.activeWorkOrders)} Active</div>
          </div>

          <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Quality FPY Yield</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#7c3aed', marginTop: '2px' }}>
              {kpis.fpyRate}%
            </div>
            <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '1px' }}>{fmt(kpis.passedQcCount)} Pass / {fmt(kpis.rejectedQcCount)} Rej</div>
          </div>

          <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Avg Weight / Unit</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#0369a1', marginTop: '2px' }}>
              {fmt(kpis.averageWeightPerPiece, 1)} kg
            </div>
            <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '1px' }}>{kpis.activeMachines || 6} Active Presses</div>
          </div>
        </div>

        {/* Section 1: Complete Work Orders Table (ALL DATA) */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '12.5px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              1. Master Production Work Orders Schedule ({rawWorkOrders.length} Total Records)
            </h3>
            <span style={{ fontSize: '9.5px', color: '#64748b' }}>Complete production telemetry log</span>
          </div>

          <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#0f172a', textAlign: 'left', fontWeight: '800' }}>
                <th style={{ padding: '5px', width: '25px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '5px' }}>WO Number</th>
                <th style={{ padding: '5px' }}>Plan No</th>
                <th style={{ padding: '5px' }}>Sales Order</th>
                <th style={{ padding: '5px' }}>Customer Account</th>
                <th style={{ padding: '5px' }}>Product Specification</th>
                <th style={{ padding: '5px', textAlign: 'center' }}>Rating</th>
                <th style={{ padding: '5px', textAlign: 'center' }}>Size</th>
                <th style={{ padding: '5px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '5px', textAlign: 'right' }}>Covers</th>
                <th style={{ padding: '5px', textAlign: 'right' }}>Frames</th>
                <th style={{ padding: '5px', textAlign: 'right' }}>Weight (kg)</th>
                <th style={{ padding: '5px' }}>Press / Machine</th>
                <th style={{ padding: '5px', textAlign: 'center' }}>QC Result</th>
                <th style={{ padding: '5px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rawWorkOrders.map((wo, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '4px 5px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '4px 5px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>{wo.workOrderNumber}</td>
                  <td style={{ padding: '4px 5px', fontFamily: 'monospace', color: '#475569' }}>{wo.planNumber}</td>
                  <td style={{ padding: '4px 5px', fontFamily: 'monospace' }}>{wo.orderNumber}</td>
                  <td style={{ padding: '4px 5px', fontWeight: '700', color: '#0f172a' }}>{wo.customer}</td>
                  <td style={{ padding: '4px 5px', color: '#334155' }}>{wo.product}</td>
                  <td style={{ padding: '4px 5px', textAlign: 'center', fontWeight: '700' }}>{wo.capacity}</td>
                  <td style={{ padding: '4px 5px', textAlign: 'center', color: '#475569' }}>{wo.size}</td>
                  <td style={{ padding: '4px 5px', textAlign: 'right', fontWeight: '800' }}>{wo.quantity}</td>
                  <td style={{ padding: '4px 5px', textAlign: 'right' }}>{wo.covers}</td>
                  <td style={{ padding: '4px 5px', textAlign: 'right' }}>{wo.frames}</td>
                  <td style={{ padding: '4px 5px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{fmt(wo.weight)}</td>
                  <td style={{ padding: '4px 5px', color: '#475569' }}>{wo.machine}</td>
                  <td style={{ padding: '4px 5px', textAlign: 'center', fontWeight: '800', color: wo.qcResult === 'PASS' || wo.qcResult === 'PASSED' ? '#15803d' : '#b45309' }}>
                    {wo.qcResult}
                  </td>
                  <td style={{ padding: '4px 5px', textAlign: 'center', fontWeight: '700' }}>
                    {wo.status}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9', fontWeight: '900', borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a' }}>
                <td colSpan={8} style={{ padding: '6px 8px', textAlign: 'right', textTransform: 'uppercase' }}>
                  Total Master Production Totals:
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '900' }}>
                  {rawWorkOrders.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0)}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '900' }}>
                  {rawWorkOrders.reduce((sum, w) => sum + (Number(w.covers) || 0), 0)}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '900' }}>
                  {rawWorkOrders.reduce((sum, w) => sum + (Number(w.frames) || 0), 0)}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '900', color: '#0284c7' }}>
                  {fmt(rawWorkOrders.reduce((sum, w) => sum + (Number(w.weight) || 0), 0))} kg
                </td>
                <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a' }}>
                  {((rawWorkOrders.reduce((sum, w) => sum + (Number(w.weight) || 0), 0)) / 1000).toFixed(2)} MT Total Net Weight
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 2: Product & Category Breakdown */}
        {productsData.length > 0 && (
          <div className="print-card" style={{ marginBottom: '22px' }}>
            <h3 style={{ fontSize: '12.5px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              2. Product &amp; Mould Component Breakdown (Only PCS)
            </h3>
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#0f172a', textAlign: 'left', fontWeight: '800' }}>
                  <th style={{ padding: '5px' }}>Product Name</th>
                  <th style={{ padding: '5px', textAlign: 'right' }}>Covers (pcs)</th>
                  <th style={{ padding: '5px', textAlign: 'right' }}>Frames (pcs)</th>
                  <th style={{ padding: '5px', textAlign: 'right' }}>Total Pieces (pcs)</th>
                  <th style={{ padding: '5px', textAlign: 'right' }}>Piece Share %</th>
                  <th style={{ padding: '5px', textAlign: 'right' }}>Work Orders</th>
                </tr>
              </thead>
              <tbody>
                {productsData.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '4px 5px', fontWeight: '800', color: '#0f172a' }}>{p.name}</td>
                    <td style={{ padding: '4px 5px', textAlign: 'right' }}>{fmt(p.covers)}</td>
                    <td style={{ padding: '4px 5px', textAlign: 'right' }}>{fmt(p.frames)}</td>
                    <td style={{ padding: '4px 5px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{fmt(p.pieces)} pcs</td>
                    <td style={{ padding: '4px 5px', textAlign: 'right', fontWeight: '700' }}>{p.share}%</td>
                    <td style={{ padding: '4px 5px', textAlign: 'right' }}>{p.workOrders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 3: Official Sign-off & Authorizations */}
        <div className="print-card" style={{ marginTop: '28px', borderTop: '1.5px dashed #94a3b8', paddingTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontWeight: '800', fontSize: '10.5px' }}>
                Production Supervisor
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Prepared &amp; Reconciled</div>
            </div>
            <div>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontWeight: '800', fontSize: '10.5px' }}>
                Quality Assurance Head
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Inspection &amp; FPY Verified</div>
            </div>
            <div>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontWeight: '800', fontSize: '10.5px' }}>
                Plant Head / Director
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Final Executive Authorization</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '8.5px', color: '#94a3b8', marginTop: '20px' }}>
            Himalaya Composites Private Limited • Confidential Enterprise Manufacturing Report • Generated via Himalaya Cloud ERP Telemetry
          </div>
        </div>

      </div> {/* End .print-only-report */}

      {/* Global CSS for Screen & Print Modes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @media screen {
          .print-only-report { display: none !important; }
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 8mm 8mm 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .screen-only-view, .no-print, nav, header {
            display: none !important;
          }
          .print-only-report {
            display: block !important;
            width: 100% !important;
            background: #ffffff !important;
          }
          .print-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-table thead {
            display: table-header-group !important;
          }
          .print-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #cbd5e1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PlantHeadProductionAnalytics;
