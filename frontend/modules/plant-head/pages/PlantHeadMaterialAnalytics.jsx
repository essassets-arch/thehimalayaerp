'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Award,
  Clock,
  Download,
  Printer,
  RotateCcw,
  Filter,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Search,
  ChevronRight,
  Info,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  LineChart as LineChartIcon,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

const PIE_COLORS = [
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#0284C7',
  '#EC4899',
  '#64748B',
  '#14B8A6',
  '#6366F1',
];

export const PlantHeadMaterialAnalytics = () => {
  // ── Filter State ──
  const [filterMode, setFilterMode] = useState('monthly'); // 'monthly' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState('8'); // August default
  const [selectedYear, setSelectedYear] = useState('2026');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-08-31');

  // Chart category filter tab: 'all' | 'timeline' | 'materials' | 'balance'
  const [chartViewTab, setChartViewTab] = useState('all');

  // Search queries within tables
  const [issueSearch, setIssueSearch] = useState('');
  const [receiveSearch, setReceiveSearch] = useState('');

  // ── Data & Loading State ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = ['2024', '2025', '2026', '2027'];

  // ── Fetch Authoritative Analytics from NestJS via /api/backend ──
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterMode === 'monthly') {
        params.append('month', selectedMonth);
        params.append('year', selectedYear);
      } else {
        params.append('filter', 'Custom');
        params.append('customStart', customStart);
        params.append('customEnd', customEnd);
      }

      const res = await backendFetch(
        `/api/backend/plant-head/analytics/material?${params.toString()}`,
      );

      if (res && typeof res === 'object') {
        setAnalyticsData(res);
      } else {
        throw new Error('Invalid response structure received from server');
      }
    } catch (err) {
      console.error('Failed to fetch material analytics:', err);
      setError(err?.message || 'Failed to load Store R/O analytics.');
    } finally {
      setLoading(false);
    }
  }, [filterMode, selectedMonth, selectedYear, customStart, customEnd]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Filtered Tables ──
  const filteredIssues = useMemo(() => {
    if (!analyticsData?.issueByItem) return [];
    if (!issueSearch.trim()) return analyticsData.issueByItem;
    const q = issueSearch.toLowerCase();
    return analyticsData.issueByItem.filter(
      (i) =>
        i.itemName?.toLowerCase().includes(q) ||
        i.itemSku?.toLowerCase().includes(q),
    );
  }, [analyticsData?.issueByItem, issueSearch]);

  const filteredReceives = useMemo(() => {
    if (!analyticsData?.receiveByItem) return [];
    if (!receiveSearch.trim()) return analyticsData.receiveByItem;
    const q = receiveSearch.toLowerCase();
    return analyticsData.receiveByItem.filter(
      (i) =>
        i.itemName?.toLowerCase().includes(q) ||
        i.itemSku?.toLowerCase().includes(q),
    );
  }, [analyticsData?.receiveByItem, receiveSearch]);

  // ── Chronologically Sorted Daily Flow (Ensures smooth timeline visualization) ──
  const sortedDailyFlow = useMemo(() => {
    if (!analyticsData?.dailyFlow?.length) return [];
    return [...analyticsData.dailyFlow].sort((a, b) => {
      const [dA, mA, yA] = (a.date || '').split('-').map(Number);
      const [dB, mB, yB] = (b.date || '').split('-').map(Number);
      const timeA = yA && mA && dA ? new Date(yA, mA - 1, dA).getTime() : 0;
      const timeB = yB && mB && dB ? new Date(yB, mB - 1, dB).getTime() : 0;
      return timeA - timeB;
    });
  }, [analyticsData?.dailyFlow]);

  // ── Derived Chart Datasets ──
  const kpis = analyticsData?.kpis || {};
  const highlights = analyticsData?.highlights || {};
  const insights = analyticsData?.insights || [];
  const top10DatesConsumption = analyticsData?.top10DatesConsumption || [];

  // 1. Top Materials Share Data for Donut Chart
  const topMaterialsShareData = useMemo(() => {
    const sourceList =
      analyticsData?.issueByItem?.length > 0
        ? analyticsData.issueByItem
        : analyticsData?.receiveByItem || [];
    if (!sourceList.length) return [];
    const top5 = sourceList.slice(0, 5).map((item) => ({
      name: item.itemName,
      value: item.sumOfKg,
      percentage: item.percentage,
    }));
    const rest = sourceList.slice(5);
    if (rest.length > 0) {
      const restKg = rest.reduce((acc, i) => acc + i.sumOfKg, 0);
      const totalKg = sourceList.reduce((acc, i) => acc + i.sumOfKg, 0);
      top5.push({
        name: 'Other Materials',
        value: Math.round(restKg * 100) / 100,
        percentage:
          totalKg > 0 ? Math.round((restKg / totalKg) * 10000) / 100 : 0,
      });
    }
    return top5;
  }, [analyticsData?.issueByItem, analyticsData?.receiveByItem]);

  // 2. Cumulative Flow Data for Area Chart
  const cumulativeFlowData = useMemo(() => {
    if (!sortedDailyFlow.length) return [];
    let cumR = 0;
    let cumI = 0;
    let cumC = 0;
    return sortedDailyFlow.map((d) => {
      cumR += Number(d.receiveKg || 0);
      cumI += Number(d.issueKg || 0);
      cumC += Number(d.consumptionKg || 0);
      return {
        date: d.date,
        cumReceiveKg: Math.round(cumR * 100) / 100,
        cumIssueKg: Math.round(cumI * 100) / 100,
        cumConsumptionKg: Math.round(cumC * 100) / 100,
        netBalance: Math.round((cumR - cumI) * 100) / 100,
      };
    });
  }, [sortedDailyFlow]);

  // 3. Top Materials: Issue vs Receive Comparison
  const itemWiseComparisonData = useMemo(() => {
    const issues = analyticsData?.issueByItem || [];
    const receives = analyticsData?.receiveByItem || [];
    if (!issues.length && !receives.length) return [];

    const map = new Map();
    issues.forEach((i) => {
      map.set(i.itemName, {
        itemName: i.itemName,
        issueKg: i.sumOfKg || 0,
        receiveKg: 0,
      });
    });
    receives.forEach((r) => {
      const cur = map.get(r.itemName) || {
        itemName: r.itemName,
        issueKg: 0,
        receiveKg: 0,
      };
      cur.receiveKg = (cur.receiveKg || 0) + (r.sumOfKg || 0);
      map.set(r.itemName, cur);
    });

    return Array.from(map.values())
      .sort((a, b) => b.issueKg + b.receiveKg - (a.issueKg + a.receiveKg))
      .slice(0, 8);
  }, [analyticsData?.issueByItem, analyticsData?.receiveByItem]);

  // 4. Daily Net Stock Variance Data (Inflow vs Depletion)
  const dailyNetVarianceData = useMemo(() => {
    if (!sortedDailyFlow.length) return [];
    return sortedDailyFlow.map((d) => {
      const net =
        Math.round((Number(d.receiveKg || 0) - Number(d.issueKg || 0)) * 100) /
        100;
      return {
        date: d.date,
        netKg: net,
        positiveNet: net >= 0 ? net : 0,
        negativeNet: net < 0 ? net : 0,
      };
    });
  }, [sortedDailyFlow]);

  // 5. Summary Comparison Bar Data
  const summaryComparisonData = useMemo(() => {
    return [
      {
        name: 'Store Receive',
        volumeKg: kpis.totalReceiveKg || 0,
        fill: '#10B981',
      },
      {
        name: 'Store Issue',
        volumeKg: kpis.totalIssueKg || 0,
        fill: '#8B5CF6',
      },
      {
        name: 'Floor Consumption',
        volumeKg: kpis.totalConsumptionKg || 0,
        fill: '#F59E0B',
      },
      {
        name: 'Net Delta',
        volumeKg: Math.abs(highlights.netBalanceKg || 0),
        fill: (highlights.netBalanceKg || 0) >= 0 ? '#047857' : '#DC2626',
      },
    ];
  }, [
    kpis.totalReceiveKg,
    kpis.totalIssueKg,
    kpis.totalConsumptionKg,
    highlights.netBalanceKg,
  ]);

  // Clean date tick formatter for charts
  const formatDateTick = useCallback((dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const day = parts[0];
      const monthNames = [
        '',
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const month = monthNames[Number(parts[1])] || '';
      return `${day} ${month}`;
    }
    return dateStr;
  }, []);

  // ── CSV Export Functionality ──
  const handleExportCSV = () => {
    if (!analyticsData) return;
    const { issueByItem, receiveByItem, period } = analyticsData;

    let csvContent = 'data:text/csv;charset=utf-8,';

    // Header Metadata
    csvContent += 'HIMALAYA ERP - STORE R/O MONTHLY REPORT\n';
    csvContent += `Report Period,"${period?.periodLabel || kpis?.month}"\n`;
    csvContent += `Generated At,"${new Date().toLocaleString('en-IN')}"\n\n`;

    // KPI Summary Section
    csvContent += 'KPI SUMMARY\n';
    csvContent += `Metric,Value,Unit\n`;
    csvContent += `Total Issue,${kpis?.totalIssueKg || 0},KG\n`;
    csvContent += `Total Receive,${kpis?.totalReceiveKg || 0},KG\n`;
    csvContent += `Total Consumption,${kpis?.totalConsumptionKg || 0},KG\n`;
    csvContent += `Total Unique Items,${kpis?.totalItems || 0},Count\n`;
    csvContent += `Top Item,"${kpis?.topItem || '-'}",${kpis?.topItemQty || 0} KG (${kpis?.topItemPercentage || 0}%)\n`;
    csvContent += `Top Issue Date,"${kpis?.topIssueDate || '-'}",${kpis?.topIssueDateQty || 0} KG\n\n`;

    // Section 1: Store Issues
    csvContent += 'STORE ISSUE (KG) - ITEM WISE\n';
    csvContent += 'Sr.,Item Name,Item SKU,Sum of KG,%\n';
    (issueByItem || []).forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.itemName}","${row.itemSku || ''}",${row.sumOfKg},${row.percentage}%\n`;
    });
    csvContent += `Total,,,${kpis?.totalIssueKg || 0},100%\n\n`;

    // Section 2: Store Receives
    csvContent += 'STORE RECEIVE (KG) - ITEM WISE\n';
    csvContent += 'Sr.,Item Name,Item SKU,Sum of KG,%\n';
    (receiveByItem || []).forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.itemName}","${row.itemSku || ''}",${row.sumOfKg},${row.percentage}%\n`;
    });
    csvContent += `Total,,,${kpis?.totalReceiveKg || 0},100%\n\n`;

    // Section 3: Consumption
    csvContent += 'TOP 10 DATE - CONSUMPTION (KG)\n';
    csvContent += 'Sr.,Date,Sum of KG,%\n';
    (top10DatesConsumption || []).forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.date}",${row.sumOfKg},${row.percentage}%\n`;
    });
    csvContent += `Total,,${kpis?.totalConsumptionKg || 0},100%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Store_RO_Report_${(period?.periodLabel || 'Report').replace(/\s+/g, '_')}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setFilterMode('monthly');
    setSelectedMonth('8');
    setSelectedYear('2026');
    setCustomStart('2026-08-01');
    setCustomEnd('2026-08-31');
    setIssueSearch('');
    setReceiveSearch('');
  };

  return (
    <div className="store-ro-dashboard" style={styles.container}>
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR - Industrial ERP Navy Header
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.headerBanner} className="print-header">
        <div style={styles.headerLeft}>
          <div style={styles.logoWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/himalaya-logo.png"
              alt="Himalaya ERP Logo"
              style={styles.logoImg}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div style={styles.headerBrandText}>
              <span style={styles.companySubtext}>
                HIMALAYA MACHINERY ERP · PLANT HEAD PORTAL
              </span>
              <h1 style={styles.headerTitle}>
                STORE R/O –{' '}
                <span style={styles.titleHighlight}>
                  {analyticsData?.period?.periodLabel || 'AUGUST 2026'}
                </span>
              </h1>
              <p style={styles.headerTagline}>
                MATERIAL CONTROL | EFFICIENT PLANNING | STRONGER PRODUCTION
              </p>
            </div>
          </div>
        </div>

        <div style={styles.headerBadges} className="no-print">
          <div style={styles.badgeChip}>
            <CheckCircle size={14} style={{ color: '#10B981' }} />
            <span>Accurate Stock Ledger</span>
          </div>
          <div style={styles.badgeChip}>
            <Flame size={14} style={{ color: '#F59E0B' }} />
            <span>Real-Time Consumption</span>
          </div>
          <div style={styles.badgeChip}>
            <ShieldCheck size={14} style={{ color: '#38BDF8' }} />
            <span>Zero Unaccounted Loss</span>
          </div>
          <div style={styles.badgeChip}>
            <Sparkles size={14} style={{ color: '#A78BFA' }} />
            <span>PostgreSQL Authoritative</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER TOOLBAR
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.filterToolbar} className="no-print">
        <div style={styles.filterRow}>
          <div style={styles.modeTabs}>
            <button
              onClick={() => setFilterMode('monthly')}
              style={{
                ...styles.modeTabBtn,
                ...(filterMode === 'monthly' ? styles.modeTabActive : {}),
              }}
            >
              <Calendar size={15} />
              Monthly View
            </button>
            <button
              onClick={() => setFilterMode('custom')}
              style={{
                ...styles.modeTabBtn,
                ...(filterMode === 'custom' ? styles.modeTabActive : {}),
              }}
            >
              <Filter size={15} />
              Custom Date Range
            </button>
          </div>

          {filterMode === 'monthly' ? (
            <div style={styles.filterControlsGroup}>
              <div style={styles.controlItem}>
                <label style={styles.controlLabel}>Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={styles.selectInput}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.controlItem}>
                <label style={styles.controlLabel}>Select Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={styles.selectInput}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div style={styles.filterControlsGroup}>
              <div style={styles.controlItem}>
                <label style={styles.controlLabel}>Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              <div style={styles.controlItem}>
                <label style={styles.controlLabel}>End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
            </div>
          )}

          <div style={styles.actionButtonsGroup}>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              style={styles.applyBtn}
              title="Apply selected date range"
            >
              <TrendingUp size={15} />
              {loading ? 'Refreshing...' : 'Apply Filter'}
            </button>
            <button
              onClick={handleReset}
              style={styles.resetBtn}
              title="Reset to default period"
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              onClick={handleExportCSV}
              style={styles.exportBtn}
              title="Export report data to Excel/CSV"
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              style={styles.printBtn}
              title="Print formal report"
            >
              <Printer size={15} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ERROR NOTICE (IF ANY)
      ───────────────────────────────────────────────────────────── */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: '700', color: '#991B1B' }}>
              Failed to load analytics
            </div>
            <div style={{ fontSize: '13px', color: '#B91C1C' }}>{error}</div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. 7 KPI METRIC CARDS ROW
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.kpiGrid}>
        {/* KPI 1: Month */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #3B82F6' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>MONTH</span>
            <Calendar size={18} style={{ color: '#3B82F6' }} />
          </div>
          <div style={styles.kpiValueMain}>{kpis.month || 'AUGUST 2026'}</div>
          <div style={styles.kpiFooter}>Reporting Period</div>
        </div>

        {/* KPI 2: Total Issue */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #8B5CF6' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOTAL ISSUE (KG)</span>
            <ArrowUpRight size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <div style={{ ...styles.kpiValueMain, color: '#6D28D9' }}>
            {(kpis.totalIssueKg || 0).toLocaleString()}{' '}
            <span style={styles.unitSpan}>KG</span>
          </div>
          <div style={styles.kpiFooter}>Store out to production</div>
        </div>

        {/* KPI 3: Total Receive */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #10B981' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOTAL RECEIVE (KG)</span>
            <ArrowDownRight size={18} style={{ color: '#10B981' }} />
          </div>
          <div style={{ ...styles.kpiValueMain, color: '#047857' }}>
            {(kpis.totalReceiveKg || 0).toLocaleString()}{' '}
            <span style={styles.unitSpan}>KG</span>
          </div>
          <div style={styles.kpiFooter}>Goods receipt intake</div>
        </div>

        {/* KPI 4: Total Consumption */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #F59E0B' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOTAL CONSUMPTION (KG)</span>
            <Flame size={18} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ ...styles.kpiValueMain, color: '#B45309' }}>
            {(kpis.totalConsumptionKg || 0).toLocaleString()}{' '}
            <span style={styles.unitSpan}>KG</span>
          </div>
          <div style={styles.kpiFooter}>Floor raw-material usage</div>
        </div>

        {/* KPI 5: Total Items */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #0284C7' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOTAL ITEMS</span>
            <Package size={18} style={{ color: '#0284C7' }} />
          </div>
          <div style={{ ...styles.kpiValueMain, color: '#0369A1' }}>
            {(kpis.totalItems || 0).toLocaleString()}
          </div>
          <div style={styles.kpiFooter}>Distinct materials moved</div>
        </div>

        {/* KPI 6: Top Item */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #EC4899' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOP ITEM</span>
            <Award size={18} style={{ color: '#EC4899' }} />
          </div>
          <div
            style={{
              ...styles.kpiValueMain,
              fontSize: '16px',
              fontWeight: '800',
              color: '#BE185D',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={kpis.topItem || '-'}
          >
            {kpis.topItem || '-'}
          </div>
          <div style={styles.kpiFooter}>
            {(kpis.topItemQty || 0).toLocaleString()} KG (
            {kpis.topItemPercentage || 0}%)
          </div>
        </div>

        {/* KPI 7: Top Issue Date */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #475569' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOP ISSUE DATE</span>
            <Clock size={18} style={{ color: '#475569' }} />
          </div>
          <div
            style={{
              ...styles.kpiValueMain,
              fontSize: '18px',
              color: '#1E293B',
            }}
          >
            {kpis.topIssueDate || '-'}
          </div>
          <div style={styles.kpiFooter}>
            {(kpis.topIssueDateQty || 0).toLocaleString()} KG peak day
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. 3-COLUMN ANALYTICAL SECTION
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.analyticalGrid}>
        {/* ── Column 1: STORE ISSUE (KG) – ITEM WISE ── */}
        <div style={styles.tableCard}>
          <div style={{ ...styles.tableCardHeader, background: '#1E1B4B' }}>
            <div style={styles.cardHeaderTitleGroup}>
              <ArrowUpRight size={18} style={{ color: '#A78BFA' }} />
              <div>
                <h3 style={styles.cardTitleText}>
                  STORE ISSUE (KG) – ITEM WISE
                </h3>
                <span style={styles.cardSubtitleText}>
                  Authoritative depot dispatches to shop floor
                </span>
              </div>
            </div>
            <span style={styles.countBadge}>{filteredIssues.length} Items</span>
          </div>

          <div style={styles.tableSearchBar} className="no-print">
            <Search size={14} style={{ color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search issued material..."
              value={issueSearch}
              onChange={(e) => setIssueSearch(e.target.value)}
              style={styles.tableSearchInput}
            />
          </div>

          <div style={styles.tableScrollWrapper}>
            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '45px' }}>Sr.</th>
                  <th style={styles.th}>Item Name</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Sum of KG</th>
                  <th
                    style={{ ...styles.th, width: '90px', textAlign: 'right' }}
                  >
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.emptyCell}>
                      {loading
                        ? 'Loading store issue records...'
                        : 'No material movement found for the selected period.'}
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((row, idx) => (
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: '700',
                          color: '#64748B',
                        }}
                      >
                        {row.sr || idx + 1}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '700', color: '#1E293B' }}>
                          {row.itemName}
                        </div>
                        {row.itemSku && (
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            SKU: {row.itemSku}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          textAlign: 'right',
                          fontWeight: '800',
                          color: '#6D28D9',
                        }}
                      >
                        {(row.sumOfKg || 0).toLocaleString()}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.pctCell}>
                          <span style={styles.pctText}>
                            {row.percentage || 0}%
                          </span>
                          <div style={styles.pctTrack}>
                            <div
                              style={{
                                ...styles.pctBar,
                                width: `${Math.min(100, row.percentage || 0)}%`,
                                background: '#8B5CF6',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={styles.tfootRow}>
                  <td
                    colSpan={2}
                    style={{
                      ...styles.tdFoot,
                      fontWeight: '800',
                      color: '#1E1B4B',
                    }}
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      ...styles.tdFoot,
                      textAlign: 'right',
                      fontWeight: '900',
                      color: '#6D28D9',
                      fontSize: '14px',
                    }}
                  >
                    {(kpis.totalIssueKg || 0).toLocaleString()} KG
                  </td>
                  <td
                    style={{
                      ...styles.tdFoot,
                      textAlign: 'right',
                      fontWeight: '800',
                    }}
                  >
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Column 2: STORE RECEIVE (KG) – ITEM WISE ── */}
        <div style={styles.tableCard}>
          <div style={{ ...styles.tableCardHeader, background: '#064E3B' }}>
            <div style={styles.cardHeaderTitleGroup}>
              <ArrowDownRight size={18} style={{ color: '#6EE7B7' }} />
              <div>
                <h3 style={styles.cardTitleText}>
                  STORE RECEIVE (KG) – ITEM WISE
                </h3>
                <span style={styles.cardSubtitleText}>
                  Goods receipt intake verified by Store
                </span>
              </div>
            </div>
            <span style={styles.countBadge}>
              {filteredReceives.length} Items
            </span>
          </div>

          <div style={styles.tableSearchBar} className="no-print">
            <Search size={14} style={{ color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search received material..."
              value={receiveSearch}
              onChange={(e) => setReceiveSearch(e.target.value)}
              style={styles.tableSearchInput}
            />
          </div>

          <div style={styles.tableScrollWrapper}>
            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '45px' }}>Sr.</th>
                  <th style={styles.th}>Item Name</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Sum of KG</th>
                  <th
                    style={{ ...styles.th, width: '90px', textAlign: 'right' }}
                  >
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReceives.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.emptyCell}>
                      {loading
                        ? 'Loading store receive records...'
                        : 'No material movement found for the selected period.'}
                    </td>
                  </tr>
                ) : (
                  filteredReceives.map((row, idx) => (
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: '700',
                          color: '#64748B',
                        }}
                      >
                        {row.sr || idx + 1}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '700', color: '#1E293B' }}>
                          {row.itemName}
                        </div>
                        {row.itemSku && (
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            SKU: {row.itemSku}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          textAlign: 'right',
                          fontWeight: '800',
                          color: '#047857',
                        }}
                      >
                        {(row.sumOfKg || 0).toLocaleString()}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.pctCell}>
                          <span style={styles.pctText}>
                            {row.percentage || 0}%
                          </span>
                          <div style={styles.pctTrack}>
                            <div
                              style={{
                                ...styles.pctBar,
                                width: `${Math.min(100, row.percentage || 0)}%`,
                                background: '#10B981',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={styles.tfootRow}>
                  <td
                    colSpan={2}
                    style={{
                      ...styles.tdFoot,
                      fontWeight: '800',
                      color: '#064E3B',
                    }}
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      ...styles.tdFoot,
                      textAlign: 'right',
                      fontWeight: '900',
                      color: '#047857',
                      fontSize: '14px',
                    }}
                  >
                    {(kpis.totalReceiveKg || 0).toLocaleString()} KG
                  </td>
                  <td
                    style={{
                      ...styles.tdFoot,
                      textAlign: 'right',
                      fontWeight: '800',
                    }}
                  >
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Column 3: TOP 10 DATE – CONSUMPTION (KG) ── */}
        <div style={styles.tableCard}>
          <div style={{ ...styles.tableCardHeader, background: '#78350F' }}>
            <div style={styles.cardHeaderTitleGroup}>
              <Flame size={18} style={{ color: '#FDE68A' }} />
              <div>
                <h3 style={styles.cardTitleText}>
                  TOP 10 DATE – CONSUMPTION (KG)
                </h3>
                <span style={styles.cardSubtitleText}>
                  Authoritative Shop Floor utilization ledger
                </span>
              </div>
            </div>
            <span style={styles.countBadge}>
              {top10DatesConsumption.length} Days
            </span>
          </div>

          <div
            style={{
              padding: '10px 16px',
              fontSize: '12px',
              color: '#92400E',
              background: '#FEF3C7',
              borderBottom: '1px solid #FDE68A',
            }}
          >
            <strong>Note:</strong> Sourced from Shop Floor logged consumption
            (not finished product weights).
          </div>

          <div style={styles.tableScrollWrapper}>
            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '45px' }}>Sr.</th>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Sum of KG</th>
                  <th
                    style={{ ...styles.th, width: '90px', textAlign: 'right' }}
                  >
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {top10DatesConsumption.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.emptyCell}>
                      {loading
                        ? 'Loading consumption log...'
                        : 'No material movement found for the selected period.'}
                    </td>
                  </tr>
                ) : (
                  top10DatesConsumption.map((row, idx) => (
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: '700',
                          color: '#64748B',
                        }}
                      >
                        {row.sr || idx + 1}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: '700',
                          color: '#1E293B',
                        }}
                      >
                        {row.date}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          textAlign: 'right',
                          fontWeight: '800',
                          color: '#B45309',
                        }}
                      >
                        {(row.sumOfKg || 0).toLocaleString()}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.pctCell}>
                          <span style={styles.pctText}>
                            {row.percentage || 0}%
                          </span>
                          <div style={styles.pctTrack}>
                            <div
                              style={{
                                ...styles.pctBar,
                                width: `${Math.min(100, row.percentage || 0)}%`,
                                background: '#F59E0B',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={styles.tfootRow}>
                  <td
                    colSpan={2}
                    style={{
                      ...styles.tdFoot,
                      fontWeight: '800',
                      color: '#78350F',
                    }}
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      ...styles.tdFoot,
                      textAlign: 'right',
                      fontWeight: '900',
                      color: '#B45309',
                      fontSize: '14px',
                    }}
                  >
                    {(kpis.totalConsumptionKg || 0).toLocaleString()} KG
                  </td>
                  <td
                    style={{
                      ...styles.tdFoot,
                      textAlign: 'right',
                      fontWeight: '800',
                    }}
                  >
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. SUMMARY & HIGHLIGHTS CARDS
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.highlightsContainer}>
        <div style={styles.highlightsHeader}>
          <BarChart3 size={18} style={{ color: '#0F172A' }} />
          <h3 style={styles.highlightsTitle}>SUMMARY & HIGHLIGHTS</h3>
          <span style={styles.highlightsSubtitle}>
            Derived operational metrics for executive control
          </span>
        </div>

        <div style={styles.highlightsGrid}>
          <div style={styles.highlightTile}>
            <span style={styles.highlightTileLabel}>Net Inventory Movement</span>
            <div
              style={{
                ...styles.highlightTileValue,
                color:
                  (highlights.netBalanceKg || 0) >= 0 ? '#047857' : '#DC2626',
              }}
            >
              {(highlights.netBalanceKg || 0) >= 0 ? '+' : ''}
              {(highlights.netBalanceKg || 0).toLocaleString()} KG
            </div>
            <span style={styles.highlightTileDesc}>Receive vs Issue variance</span>
          </div>

          <div style={styles.highlightTile}>
            <span style={styles.highlightTileLabel}>Consumption Efficiency</span>
            <div style={{ ...styles.highlightTileValue, color: '#2563EB' }}>
              {highlights.consumptionIssueRatio || 0}%
            </div>
            <span style={styles.highlightTileDesc}>
              Floor utilization vs issued
            </span>
          </div>

          <div style={styles.highlightTile}>
            <span style={styles.highlightTileLabel}>Active SKU Count</span>
            <div style={{ ...styles.highlightTileValue, color: '#7C3AED' }}>
              {highlights.activeSkuCount || 0} Materials
            </div>
            <span style={styles.highlightTileDesc}>SKUs moved in period</span>
          </div>

          <div style={styles.highlightTile}>
            <span style={styles.highlightTileLabel}>Peak Issue Volume</span>
            <div style={{ ...styles.highlightTileValue, color: '#BE185D' }}>
              {(highlights.peakIssueQty || 0).toLocaleString()} KG
            </div>
            <span style={styles.highlightTileDesc}>
              Peak date: {highlights.peakIssueDate || '-'}
            </span>
          </div>

          <div style={styles.highlightTile}>
            <span style={styles.highlightTileLabel}>Average Daily Issue</span>
            <div style={{ ...styles.highlightTileValue, color: '#0F766E' }}>
              {(highlights.avgDailyIssueKg || 0).toLocaleString()} KG/Day
            </div>
            <span style={styles.highlightTileDesc}>Monthly throughput rate</span>
          </div>

          <div style={styles.highlightTile}>
            <span style={styles.highlightTileLabel}>Store Velocity Status</span>
            <div
              style={{
                ...styles.highlightTileValue,
                fontSize: '18px',
                color: '#1E293B',
              }}
            >
              {highlights.turnoverStatus || 'STEADY'}
            </div>
            <span style={styles.highlightTileDesc}>Depot workload status</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. KEY INSIGHTS - Dark Navy Intelligent Executive Banner
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.insightsBanner}>
        <div style={styles.insightsHeader}>
          <Sparkles size={20} style={{ color: '#FBBF24' }} />
          <h3 style={styles.insightsTitle}>
            EXECUTIVE STORE INTELLIGENCE & AUDIT INSIGHTS
          </h3>
        </div>

        <div style={styles.insightsList}>
          {insights.length === 0 ? (
            <div style={styles.insightItem}>
              • No material movement found for the selected period.
            </div>
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} style={styles.insightItem}>
                <ChevronRight
                  size={16}
                  style={{ color: '#38BDF8', flexShrink: 0, marginTop: '2px' }}
                />
                <span
                  dangerouslySetInnerHTML={{
                    __html: insight.replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong style="color: #F8FAFC; font-weight: 800;">$1</strong>',
                    ),
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. MATERIAL FLOW VISUALIZATION SUITE (ALL CHARTS & GRAPHS)
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.chartsSuiteSection} className="no-print">
        <div style={styles.chartsSuiteHeader}>
          <div style={styles.chartsSuiteHeaderLeft}>
            <Activity size={22} style={{ color: '#2563EB' }} />
            <div>
              <h3 style={styles.chartsSuiteTitle}>
                STORE MATERIAL MOVEMENT VISUALIZATION & FLOW ANALYTICS
              </h3>
              <span style={styles.chartsSuiteSubtitle}>
                Complete timeline, material share, cumulative trajectory, item
                comparison, net variance, and operational balance
              </span>
            </div>
          </div>

          <div style={styles.chartTabGroup}>
            <button
              onClick={() => setChartViewTab('all')}
              style={{
                ...styles.chartTabBtn,
                ...(chartViewTab === 'all' ? styles.chartTabActive : {}),
              }}
            >
              <Layers size={13} />
              All Visuals (6)
            </button>
            <button
              onClick={() => setChartViewTab('timeline')}
              style={{
                ...styles.chartTabBtn,
                ...(chartViewTab === 'timeline' ? styles.chartTabActive : {}),
              }}
            >
              <LineChartIcon size={13} />
              Daily Timelines
            </button>
            <button
              onClick={() => setChartViewTab('materials')}
              style={{
                ...styles.chartTabBtn,
                ...(chartViewTab === 'materials' ? styles.chartTabActive : {}),
              }}
            >
              <PieChartIcon size={13} />
              Material Shares
            </button>
            <button
              onClick={() => setChartViewTab('balance')}
              style={{
                ...styles.chartTabBtn,
                ...(chartViewTab === 'balance' ? styles.chartTabActive : {}),
              }}
            >
              <SlidersHorizontal size={13} />
              Inventory Velocity
            </button>
          </div>
        </div>

        <div style={styles.chartsGrid}>
          {/* ── Chart 1: Daily Material Movement Timeline (Bar Chart) ── */}
          {(chartViewTab === 'all' || chartViewTab === 'timeline') && (
            <div style={styles.chartCard}>
              <div style={styles.chartCardHeader}>
                <div style={styles.chartCardHeaderLeft}>
                  <BarChart3 size={18} style={{ color: '#2563EB' }} />
                  <div>
                    <h4 style={styles.chartCardTitle}>
                      DAILY MATERIAL FLOW TIMELINE (KG)
                    </h4>
                    <span style={styles.chartCardSubtitle}>
                      Receive (Emerald) vs Issue (Violet) vs Floor Consumed
                      (Amber)
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.chartMiniBadge,
                    background: '#EDE9FE',
                    color: '#6D28D9',
                  }}
                >
                  Flow Timeline
                </span>
              </div>
              <div style={styles.chartResponsiveWrapper}>
                {sortedDailyFlow.length === 0 ? (
                  <div style={styles.chartEmptyOverlay}>
                    <Info size={28} style={{ color: '#94A3B8' }} />
                    <span>No material movement found for selected period.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedDailyFlow}
                      margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={formatDateTick}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) =>
                          Number(val) >= 1000
                            ? `${(Number(val) / 1000).toFixed(0)}k`
                            : val
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0F172A',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        formatter={(val, name) => [
                          `${Number(val).toLocaleString()} KG`,
                          name,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar
                        dataKey="receiveKg"
                        fill="#10B981"
                        name="Received (KG)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="issueKg"
                        fill="#8B5CF6"
                        name="Issued (KG)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="consumptionKg"
                        fill="#F59E0B"
                        name="Consumed (KG)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* ── Chart 2: Top Materials Volume Share (Donut / Pie Chart) ── */}
          {(chartViewTab === 'all' || chartViewTab === 'materials') && (
            <div style={styles.chartCard}>
              <div style={styles.chartCardHeader}>
                <div style={styles.chartCardHeaderLeft}>
                  <PieChartIcon size={18} style={{ color: '#8B5CF6' }} />
                  <div>
                    <h4 style={styles.chartCardTitle}>
                      TOP MATERIALS VOLUME SHARE (%)
                    </h4>
                    <span style={styles.chartCardSubtitle}>
                      Proportional volume share across primary commodities in KG
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.chartMiniBadge,
                    background: '#FCE7F3',
                    color: '#BE185D',
                  }}
                >
                  Distribution
                </span>
              </div>
              <div style={styles.chartResponsiveWrapper}>
                {topMaterialsShareData.length === 0 ? (
                  <div style={styles.chartEmptyOverlay}>
                    <Info size={28} style={{ color: '#94A3B8' }} />
                    <span>No material movement found for selected period.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <Tooltip
                        contentStyle={{
                          background: '#0F172A',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        formatter={(val, name, entry) => [
                          `${Number(val).toLocaleString()} KG (${entry?.payload?.percentage || 0}%)`,
                          entry?.payload?.name,
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                      />
                      <Pie
                        data={topMaterialsShareData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="48%"
                        innerRadius="46%"
                        outerRadius="74%"
                        paddingAngle={3}
                      >
                        {topMaterialsShareData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* ── Chart 3: Cumulative Material Trajectory (Area Chart) ── */}
          {(chartViewTab === 'all' || chartViewTab === 'timeline') && (
            <div style={styles.chartCard}>
              <div style={styles.chartCardHeader}>
                <div style={styles.chartCardHeaderLeft}>
                  <LineChartIcon size={18} style={{ color: '#10B981' }} />
                  <div>
                    <h4 style={styles.chartCardTitle}>
                      CUMULATIVE INVENTORY TRAJECTORY (KG)
                    </h4>
                    <span style={styles.chartCardSubtitle}>
                      Progressive store intake vs depot issue vs shop floor draw
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.chartMiniBadge,
                    background: '#D1FAE5',
                    color: '#065F46',
                  }}
                >
                  Accumulation
                </span>
              </div>
              <div style={styles.chartResponsiveWrapper}>
                {cumulativeFlowData.length === 0 ? (
                  <div style={styles.chartEmptyOverlay}>
                    <Info size={28} style={{ color: '#94A3B8' }} />
                    <span>No material movement found for selected period.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={cumulativeFlowData}
                      margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradReceive"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.45}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradIssue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.45}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={formatDateTick}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) =>
                          Number(val) >= 1000
                            ? `${(Number(val) / 1000).toFixed(0)}k`
                            : val
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0F172A',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        formatter={(val, name) => [
                          `${Number(val).toLocaleString()} KG`,
                          name,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Area
                        type="monotone"
                        dataKey="cumReceiveKg"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#gradReceive)"
                        name="Cum. Received (KG)"
                      />
                      <Area
                        type="monotone"
                        dataKey="cumIssueKg"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#gradIssue)"
                        name="Cum. Issued (KG)"
                      />
                      <Line
                        type="monotone"
                        dataKey="cumConsumptionKg"
                        stroke="#F59E0B"
                        strokeWidth={2.5}
                        dot={false}
                        name="Cum. Consumed (KG)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* ── Chart 4: Top Materials Issue vs Receive Comparison ── */}
          {(chartViewTab === 'all' || chartViewTab === 'materials') && (
            <div style={styles.chartCard}>
              <div style={styles.chartCardHeader}>
                <div style={styles.chartCardHeaderLeft}>
                  <BarChart3 size={18} style={{ color: '#0284C7' }} />
                  <div>
                    <h4 style={styles.chartCardTitle}>
                      TOP MATERIALS: ISSUE VS RECEIVE (KG)
                    </h4>
                    <span style={styles.chartCardSubtitle}>
                      Direct side-by-side comparison for primary commodities
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.chartMiniBadge,
                    background: '#E0F2FE',
                    color: '#0369A1',
                  }}
                >
                  Commodity Matrix
                </span>
              </div>
              <div style={styles.chartResponsiveWrapper}>
                {itemWiseComparisonData.length === 0 ? (
                  <div style={styles.chartEmptyOverlay}>
                    <Info size={28} style={{ color: '#94A3B8' }} />
                    <span>No material movement found for selected period.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={itemWiseComparisonData}
                      layout="vertical"
                      margin={{ top: 10, right: 25, left: 35, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        type="number"
                        stroke="#64748B"
                        fontSize={11}
                        tickFormatter={(val) =>
                          Number(val) >= 1000
                            ? `${(Number(val) / 1000).toFixed(0)}k`
                            : val
                        }
                      />
                      <YAxis
                        dataKey="itemName"
                        type="category"
                        stroke="#64748B"
                        fontSize={10}
                        tickLine={false}
                        width={90}
                        tickFormatter={(str) =>
                          str.length > 12 ? `${str.slice(0, 12)}…` : str
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0F172A',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        formatter={(val, name) => [
                          `${Number(val).toLocaleString()} KG`,
                          name,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar
                        dataKey="receiveKg"
                        fill="#10B981"
                        name="Received (KG)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="issueKg"
                        fill="#8B5CF6"
                        name="Issued (KG)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* ── Chart 5: Daily Net Inventory Variance / Volatility ── */}
          {(chartViewTab === 'all' || chartViewTab === 'balance') && (
            <div style={styles.chartCard}>
              <div style={styles.chartCardHeader}>
                <div style={styles.chartCardHeaderLeft}>
                  <Activity size={18} style={{ color: '#F59E0B' }} />
                  <div>
                    <h4 style={styles.chartCardTitle}>
                      DAILY NET STORE BALANCE FLOW (KG)
                    </h4>
                    <span style={styles.chartCardSubtitle}>
                      Net Intake (+) Inflow vs Net Drawdown (-) Depletion
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.chartMiniBadge,
                    background: '#FEF3C7',
                    color: '#B45309',
                  }}
                >
                  Net Volatility
                </span>
              </div>
              <div style={styles.chartResponsiveWrapper}>
                {dailyNetVarianceData.length === 0 ? (
                  <div style={styles.chartEmptyOverlay}>
                    <Info size={28} style={{ color: '#94A3B8' }} />
                    <span>No material movement found for selected period.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyNetVarianceData}
                      margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={formatDateTick}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) =>
                          Math.abs(Number(val)) >= 1000
                            ? `${(Number(val) / 1000).toFixed(0)}k`
                            : val
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0F172A',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [
                          `${Number(val) >= 0 ? '+' : ''}${Number(val).toLocaleString()} KG`,
                          'Net Flow',
                        ]}
                      />
                      <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
                      <Bar dataKey="netKg" name="Net Balance (KG)">
                        {dailyNetVarianceData.map((entry, index) => (
                          <Cell
                            key={`net-cell-${index}`}
                            fill={entry.netKg >= 0 ? '#10B981' : '#F43F5E'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* ── Chart 6: Operational Velocity & Flow Balance ── */}
          {(chartViewTab === 'all' || chartViewTab === 'balance') && (
            <div style={styles.chartCard}>
              <div style={styles.chartCardHeader}>
                <div style={styles.chartCardHeaderLeft}>
                  <SlidersHorizontal size={18} style={{ color: '#0F172A' }} />
                  <div>
                    <h4 style={styles.chartCardTitle}>
                      OPERATIONAL FLOW BALANCE & VELOCITY (KG)
                    </h4>
                    <span style={styles.chartCardSubtitle}>
                      Comparative aggregate volume breakdown across metrics
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.chartMiniBadge,
                    background: '#F1F5F9',
                    color: '#334155',
                  }}
                >
                  Aggregate
                </span>
              </div>
              <div style={styles.chartResponsiveWrapper}>
                {kpis.totalReceiveKg === 0 &&
                kpis.totalIssueKg === 0 &&
                kpis.totalConsumptionKg === 0 ? (
                  <div style={styles.chartEmptyOverlay}>
                    <Info size={28} style={{ color: '#94A3B8' }} />
                    <span>No material movement found for selected period.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={summaryComparisonData}
                      layout="vertical"
                      margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        type="number"
                        stroke="#64748B"
                        fontSize={11}
                        tickFormatter={(val) =>
                          Number(val) >= 1000
                            ? `${(Number(val) / 1000).toFixed(0)}k`
                            : val
                        }
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0F172A',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [
                          `${Number(val).toLocaleString()} KG`,
                        ]}
                      />
                      <Bar
                        dataKey="volumeKg"
                        name="Volume (KG)"
                        radius={[0, 6, 6, 0]}
                      >
                        {summaryComparisonData.map((entry, index) => (
                          <Cell key={`cell-comp-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. FORMAL PRINT-ONLY FOOTER & SIGN-OFF BLOCK
      ───────────────────────────────────────────────────────────── */}
      <div style={styles.printFooterBlock} className="print-only">
        <div style={styles.printSignGrid}>
          <div style={styles.printSignBox}>
            <div style={styles.printSignLine} />
            <div style={styles.printSignTitle}>STORE IN-CHARGE</div>
            <div style={styles.printSignSub}>Himalaya Store Dept.</div>
          </div>
          <div style={styles.printSignBox}>
            <div style={styles.printSignLine} />
            <div style={styles.printSignTitle}>PLANT HEAD</div>
            <div style={styles.printSignSub}>Operations & Production</div>
          </div>
          <div style={styles.printSignBox}>
            <div style={styles.printSignLine} />
            <div style={styles.printSignTitle}>INTERNAL AUDITOR</div>
            <div style={styles.printSignSub}>Finance & Ledger Audit</div>
          </div>
        </div>
        <div style={styles.printDisclaimer}>
          This Store R/O statement is electronically generated from the
          authoritative PostgreSQL ledger of Himalaya Machinery ERP.
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          UNIVERSAL RESPONSIVE CSS STYLES (320px to 12K Ultra HD)
      ───────────────────────────────────────────────────────────── */}
      <style jsx global>{`
        /* Universal Box-Sizing & Zero Horizontal Scroll Rules */
        .store-ro-dashboard * {
          box-sizing: border-box;
        }

        /* ── Extra Small Devices (320px - 480px: iPhone SE, Galaxy Fold cover) ── */
        @media (max-width: 480px) {
          .store-ro-dashboard {
            padding: 8px !important;
            gap: 14px !important;
          }
          .print-header {
            padding: 12px 10px !important;
            border-radius: 10px !important;
          }
        }

        /* ── Small to Medium Devices (481px - 768px: Mobile Landscape, Mini Tablets) ── */
        @media (min-width: 481px) and (max-width: 768px) {
          .store-ro-dashboard {
            padding: 14px !important;
            gap: 16px !important;
          }
        }

        /* ── Standard Desktops & Laptops (769px - 1440px) ── */
        @media (min-width: 769px) and (max-width: 1440px) {
          .store-ro-dashboard {
            padding: 20px 24px !important;
          }
        }

        /* ── Large Desktop & 2K QHD (1441px - 2559px) ── */
        @media (min-width: 1441px) and (max-width: 2559px) {
          .store-ro-dashboard {
            padding: 26px 36px !important;
          }
        }

        /* ── 4K UHD Displays (2560px - 3840px) ── */
        @media (min-width: 2560px) and (max-width: 3840px) {
          .store-ro-dashboard {
            padding: 36px 48px !important;
            gap: 28px !important;
          }
          .store-ro-dashboard h1 {
            font-size: 34px !important;
          }
          .store-ro-dashboard h3 {
            font-size: 18px !important;
          }
          .store-ro-dashboard h4 {
            font-size: 16px !important;
          }
        }

        /* ── 8K UHD & Video Wall Displays (3841px - 7680px) ── */
        @media (min-width: 3841px) and (max-width: 7680px) {
          .store-ro-dashboard {
            padding: 48px 64px !important;
            gap: 36px !important;
          }
          .store-ro-dashboard h1 {
            font-size: 42px !important;
          }
          .store-ro-dashboard h3 {
            font-size: 22px !important;
          }
          .store-ro-dashboard h4 {
            font-size: 20px !important;
          }
        }

        /* ── 12K Ultra Large Displays (7681px+) ── */
        @media (min-width: 7681px) {
          .store-ro-dashboard {
            padding: 64px 96px !important;
            gap: 48px !important;
          }
          .store-ro-dashboard h1 {
            font-size: 56px !important;
          }
          .store-ro-dashboard h3 {
            font-size: 28px !important;
          }
          .store-ro-dashboard h4 {
            font-size: 24px !important;
          }
        }

        /* Print Media Styles */
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .store-ro-dashboard {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .print-header {
            background: #0f172a !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// ── Fluid Responsive Inline Style Definitions (Supports 320px to 12K) ──
const styles = {
  container: {
    padding: 'clamp(10px, 1.8vw, 40px)',
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#0F172A',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  headerBanner: {
    background:
      'linear-gradient(135deg, #0A192F 0%, #0F2744 60%, #1E3A8A 100%)',
    borderRadius: '16px',
    padding: 'clamp(14px, 2vw, 28px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
    color: '#fff',
    flexWrap: 'wrap',
    gap: '16px',
    width: '100%',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: 0,
    flex: '1 1 300px',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  logoImg: {
    height: 'clamp(36px, 4vw, 54px)',
    width: 'auto',
    objectFit: 'contain',
    background: '#ffffff',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  headerBrandText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  companySubtext: {
    fontSize: 'clamp(10px, 0.85vw, 13px)',
    fontWeight: '800',
    letterSpacing: '1.2px',
    color: '#93C5FD',
    textTransform: 'uppercase',
  },
  headerTitle: {
    margin: 0,
    fontSize: 'clamp(18px, 2.2vw, 32px)',
    fontWeight: '900',
    letterSpacing: '-0.5px',
    color: '#FFFFFF',
    wordBreak: 'break-word',
  },
  titleHighlight: {
    color: '#FBBF24',
  },
  headerTagline: {
    margin: 0,
    fontSize: 'clamp(10px, 0.85vw, 13px)',
    color: '#CBD5E1',
    fontWeight: '600',
    letterSpacing: '0.4px',
  },
  headerBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  badgeChip: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  filterToolbar: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '12px 18px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
    width: '100%',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    width: '100%',
  },
  modeTabs: {
    display: 'flex',
    background: '#F1F5F9',
    padding: '4px',
    borderRadius: '10px',
    gap: '4px',
    flexWrap: 'wrap',
  },
  modeTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '700',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modeTabActive: {
    background: '#FFFFFF',
    color: '#0F172A',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  filterControlsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  controlItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  controlLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  selectInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0F172A',
    outline: 'none',
    minWidth: '120px',
  },
  dateInput: {
    padding: '7px 10px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0F172A',
    outline: 'none',
  },
  actionButtonsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  applyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0F172A',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F8FAFC',
    color: '#475569',
    border: '1px solid #CBD5E1',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#047857',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  errorBanner: {
    background: '#FEE2E2',
    border: '1px solid #F87171',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
    gap: '12px',
    width: '100%',
  },
  kpiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '12px 14px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: '0.4px',
  },
  kpiValueMain: {
    fontSize: 'clamp(17px, 1.8vw, 24px)',
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: '1.2',
  },
  unitSpan: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
  },
  kpiFooter: {
    fontSize: '10px',
    color: '#64748B',
    fontWeight: '600',
  },
  analyticalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
    gap: '16px',
    width: '100%',
  },
  tableCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  tableCardHeader: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#FFFFFF',
  },
  cardHeaderTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  cardTitleText: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '0.2px',
  },
  cardSubtitleText: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  countBadge: {
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '3px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: '800',
    flexShrink: 0,
  },
  tableSearchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  tableSearchInput: {
    border: 'none',
    background: 'transparent',
    fontSize: '12px',
    color: '#0F172A',
    width: '100%',
    outline: 'none',
  },
  tableScrollWrapper: {
    maxHeight: '420px',
    overflowY: 'auto',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    width: '100%',
  },
  dataTable: {
    width: '100%',
    minWidth: '320px',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    background: '#F1F5F9',
    padding: '9px 12px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    borderBottom: '1px solid #E2E8F0',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #F1F5F9',
  },
  trEven: {
    background: '#FFFFFF',
  },
  trOdd: {
    background: '#FAFAFA',
  },
  emptyCell: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '12px',
    fontWeight: '600',
  },
  tfootRow: {
    background: '#F8FAFC',
    borderTop: '2px solid #CBD5E1',
    position: 'sticky',
    bottom: 0,
    zIndex: 1,
  },
  tdFoot: {
    padding: '9px 12px',
  },
  pctCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '3px',
  },
  pctText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
  },
  pctTrack: {
    width: '42px',
    height: '4px',
    background: '#E2E8F0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  pctBar: {
    height: '100%',
    borderRadius: '2px',
  },
  highlightsContainer: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '16px 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
    width: '100%',
  },
  highlightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  highlightsTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: '0.4px',
  },
  highlightsSubtitle: {
    fontSize: '11px',
    color: '#64748B',
  },
  highlightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
    gap: '12px',
    width: '100%',
  },
  highlightTile: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  highlightTileLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  highlightTileValue: {
    fontSize: '17px',
    fontWeight: '900',
  },
  highlightTileDesc: {
    fontSize: '10px',
    color: '#64748B',
  },
  insightsBanner: {
    background: 'linear-gradient(135deg, #0A192F 0%, #0F172A 100%)',
    borderRadius: '14px',
    padding: '16px 22px',
    color: '#F8FAFC',
    border: '1px solid #1E293B',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    width: '100%',
  },
  insightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  insightsTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: '0.8px',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  insightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#CBD5E1',
  },
  chartsSuiteSection: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: 'clamp(14px, 1.8vw, 24px)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%',
  },
  chartsSuiteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  chartsSuiteHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  chartsSuiteTitle: {
    margin: 0,
    fontSize: 'clamp(13px, 1.1vw, 16px)',
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: '0.4px',
  },
  chartsSuiteSubtitle: {
    fontSize: 'clamp(10px, 0.85vw, 12px)',
    color: '#64748B',
  },
  chartTabGroup: {
    display: 'flex',
    background: '#F1F5F9',
    padding: '3px',
    borderRadius: '10px',
    gap: '3px',
    flexWrap: 'wrap',
  },
  chartTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '7px',
    border: 'none',
    background: 'transparent',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  chartTabActive: {
    background: '#FFFFFF',
    color: '#0F172A',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
    gap: '16px',
    width: '100%',
  },
  chartCard: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: 'clamp(12px, 1.2vw, 18px)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  chartCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  chartCardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  chartCardTitle: {
    margin: 0,
    fontSize: 'clamp(12px, 0.95vw, 14px)',
    fontWeight: '800',
    color: '#0F172A',
  },
  chartCardSubtitle: {
    fontSize: 'clamp(10px, 0.8vw, 11px)',
    color: '#64748B',
  },
  chartMiniBadge: {
    padding: '3px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: '800',
  },
  chartResponsiveWrapper: {
    width: '100%',
    height: 'clamp(260px, 24vw, 420px)',
    position: 'relative',
    minWidth: 0,
  },
  chartEmptyOverlay: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#94A3B8',
    fontSize: '12px',
    fontWeight: '600',
  },
  printFooterBlock: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '2px solid #000',
    width: '100%',
  },
  printSignGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '60px',
  },
  printSignBox: {
    textAlign: 'center',
    width: '200px',
  },
  printSignLine: {
    borderTop: '1px solid #000',
    marginBottom: '6px',
  },
  printSignTitle: {
    fontSize: '11px',
    fontWeight: '800',
  },
  printSignSub: {
    fontSize: '10px',
    color: '#666',
  },
  printDisclaimer: {
    marginTop: '40px',
    fontSize: '9px',
    color: '#666',
    textAlign: 'center',
  },
};

export default PlantHeadMaterialAnalytics;
