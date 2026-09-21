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
  FileSpreadsheet,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import {
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
import UltraResponsiveChart from '../../../shared/components/UltraResponsiveChart';
import MaterialWiseAnalysisView from '../components/MaterialWiseAnalysisView';

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
  // ── Top Tab Navigation State: 'store-ro' | 'material-wise' ──
  const [activeTab, setActiveTab] = useState('store-ro');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'material-wise' || tab === 'material') {
        setActiveTab('material-wise');
      }
    }
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

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
  const fetchAnalytics = useCallback(
    async (overrideParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const mode = overrideParams.filterMode || filterMode;
        const month = overrideParams.selectedMonth !== undefined ? overrideParams.selectedMonth : selectedMonth;
        const year = overrideParams.selectedYear !== undefined ? overrideParams.selectedYear : selectedYear;
        const start = overrideParams.customStart || customStart;
        const end = overrideParams.customEnd || customEnd;

        const params = new URLSearchParams();
        if (mode === 'monthly') {
          params.append('month', String(month));
          params.append('year', String(year));
        } else {
          params.append('filter', 'Custom');
          params.append('customStart', start);
          params.append('customEnd', end);
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
    },
    [filterMode, selectedMonth, selectedYear, customStart, customEnd],
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Apply Filter Explicit Handler ──
  const handleApplyFilter = () => {
    if (filterMode === 'custom') {
      if (!customStart || !customEnd) {
        alert('Please select both Start Date and End Date for the custom range.');
        return;
      }
      if (new Date(customStart) > new Date(customEnd)) {
        alert('Start Date cannot be later than End Date.');
        return;
      }
    }
    fetchAnalytics({
      filterMode,
      selectedMonth,
      selectedYear,
      customStart,
      customEnd,
    });
  };

  // ── Reset to August 2026 Default & Immediate Reload ──
  const handleReset = () => {
    setFilterMode('monthly');
    setSelectedMonth('8');
    setSelectedYear('2026');
    setCustomStart('2026-08-01');
    setCustomEnd('2026-08-31');
    setIssueSearch('');
    setReceiveSearch('');
    fetchAnalytics({
      filterMode: 'monthly',
      selectedMonth: '8',
      selectedYear: '2026',
      customStart: '2026-08-01',
      customEnd: '2026-08-31',
    });
  };

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

  // ── Robust UTF-8 BOM CSV Export (Works across all browsers & Excel) ──
  const handleExportCSV = () => {
    if (!analyticsData) {
      alert('Analytics data is still loading. Please wait.');
      return;
    }
    const {
      issueByItem = [],
      receiveByItem = [],
      top10DatesConsumption = [],
      period = {},
    } = analyticsData;

    let csv = '';
    // Header
    csv += 'HIMALAYA MACHINERY ERP - STORE R/O MONTHLY REPORT\r\n';
    csv += `Report Period,"${period.periodLabel || kpis.month || 'August 2026'}"\r\n`;
    csv += `Generated At,"${new Date().toLocaleString('en-IN')}"\r\n`;
    csv += `Data Source,"PostgreSQL Authoritative Stock Ledger"\r\n\r\n`;

    // KPI Summary Section
    csv += 'KPI SUMMARY\r\n';
    csv += 'Metric,Value,Unit\r\n';
    csv += `Total Store Issue,${kpis.totalIssueKg || 0},KG\r\n`;
    csv += `Total Store Receive,${kpis.totalReceiveKg || 0},KG\r\n`;
    csv += `Total Floor Consumption,${kpis.totalConsumptionKg || 0},KG\r\n`;
    csv += `Net Inventory Delta,${highlights.netBalanceKg || 0},KG\r\n`;
    csv += `Floor Consumption Efficiency,${highlights.consumptionIssueRatio || 0}%\r\n`;
    csv += `Total Unique Items,${kpis.totalItems || 0},Count\r\n`;
    csv += `Top Issued Item,"${(kpis.topItem || '-').replace(/"/g, '""')}",${kpis.topItemQty || 0} KG (${kpis.topItemPercentage || 0}%)\r\n`;
    csv += `Top Issue Date,"${kpis.topIssueDate || '-'}",${kpis.topIssueDateQty || 0} KG\r\n\r\n`;

    // Section 1: Store Issues
    csv += 'STORE ISSUE (KG) - ITEM WISE\r\n';
    csv += 'Sr,Item Name,Item SKU,Unit,Sum of KG,Percentage (%)\r\n';
    if (issueByItem.length === 0) {
      csv += '1,"No store issues recorded for this period",-,KG,0,0%\r\n';
    } else {
      issueByItem.forEach((row, idx) => {
        csv += `${idx + 1},"${(row.itemName || '').replace(/"/g, '""')}","${(row.itemSku || '').replace(/"/g, '""')}",${row.unit || 'KG'},${row.sumOfKg || 0},${row.percentage || 0}%\r\n`;
      });
    }
    csv += `Total,,,KG,${kpis.totalIssueKg || 0},100%\r\n\r\n`;

    // Section 2: Store Receives
    csv += 'STORE RECEIVE (KG) - ITEM WISE\r\n';
    csv += 'Sr,Item Name,Item SKU,Unit,Sum of KG,Percentage (%)\r\n';
    if (receiveByItem.length === 0) {
      csv += '1,"No store receipts recorded for this period",-,KG,0,0%\r\n';
    } else {
      receiveByItem.forEach((row, idx) => {
        csv += `${idx + 1},"${(row.itemName || '').replace(/"/g, '""')}","${(row.itemSku || '').replace(/"/g, '""')}",${row.unit || 'KG'},${row.sumOfKg || 0},${row.percentage || 0}%\r\n`;
      });
    }
    csv += `Total,,,KG,${kpis.totalReceiveKg || 0},100%\r\n\r\n`;

    // Section 3: Consumption
    csv += 'TOP DATES - CONSUMPTION (KG)\r\n';
    csv += 'Sr,Date,Sum of KG,Percentage (%)\r\n';
    if (top10DatesConsumption.length === 0) {
      csv += '1,"No floor consumption recorded for this period",0,0%\r\n';
    } else {
      top10DatesConsumption.forEach((row, idx) => {
        csv += `${idx + 1},"${row.date}",${row.sumOfKg || 0},${row.percentage || 0}%\r\n`;
      });
    }
    csv += `Total,,${kpis.totalConsumptionKg || 0},100%\r\n\r\n`;

    // Section 4: Key Insights
    csv += 'EXECUTIVE AUDIT INSIGHTS\r\n';
    insights.forEach((ins, idx) => {
      csv += `${idx + 1},"${ins.replace(/\*\*/g, '').replace(/"/g, '""')}"\r\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const periodStr = (period.periodLabel || kpis.month || 'August_2026').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Store_RO_Report_${periodStr}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  };

  // ── Multi-Tab Excel Workbook Export (.xlsx) ──
  const handleExportExcel = async () => {
    if (!analyticsData) {
      alert('Analytics data is still loading. Please wait.');
      return;
    }
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      // Sheet 1: KPIs
      const kpiRows = [
        ['HIMALAYA MACHINERY ERP - STORE R/O REPORT'],
        ['Report Period', analyticsData.period?.periodLabel || kpis.month || 'August 2026'],
        ['Generated At', new Date().toLocaleString('en-IN')],
        ['Data Source', 'PostgreSQL Authoritative Stock Ledger'],
        [''],
        ['Metric', 'Value', 'Unit'],
        ['Total Store Issue', kpis.totalIssueKg || 0, 'KG'],
        ['Total Store Receive', kpis.totalReceiveKg || 0, 'KG'],
        ['Total Floor Consumption', kpis.totalConsumptionKg || 0, 'KG'],
        ['Net Inventory Delta', highlights.netBalanceKg || 0, 'KG'],
        ['Consumption Efficiency', `${highlights.consumptionIssueRatio || 0}%`, 'Ratio'],
        ['Total Items Count', kpis.totalItems || 0, 'Count'],
        ['Top Issued Item', kpis.topItem || '-', `${kpis.topItemQty || 0} KG (${kpis.topItemPercentage || 0}%)`],
        ['Peak Issue Date', kpis.topIssueDate || '-', `${kpis.topIssueDateQty || 0} KG`],
      ];
      const wsKpis = XLSX.utils.aoa_to_sheet(kpiRows);
      XLSX.utils.book_append_sheet(wb, wsKpis, 'KPI Summary');

      // Sheet 2: Store Issues
      const issueRows = [
        ['Sr', 'Item Name', 'Item SKU', 'Unit', 'Sum of KG', 'Percentage'],
        ...(analyticsData.issueByItem || []).map((row, idx) => [
          idx + 1,
          row.itemName,
          row.itemSku || '',
          row.unit || 'KG',
          row.sumOfKg,
          `${row.percentage}%`,
        ]),
        ['Total', '', '', 'KG', kpis.totalIssueKg || 0, '100%'],
      ];
      const wsIssues = XLSX.utils.aoa_to_sheet(issueRows);
      XLSX.utils.book_append_sheet(wb, wsIssues, 'Store Issues');

      // Sheet 3: Store Receives
      const receiveRows = [
        ['Sr', 'Item Name', 'Item SKU', 'Unit', 'Sum of KG', 'Percentage'],
        ...(analyticsData.receiveByItem || []).map((row, idx) => [
          idx + 1,
          row.itemName,
          row.itemSku || '',
          row.unit || 'KG',
          row.sumOfKg,
          `${row.percentage}%`,
        ]),
        ['Total', '', '', 'KG', kpis.totalReceiveKg || 0, '100%'],
      ];
      const wsReceives = XLSX.utils.aoa_to_sheet(receiveRows);
      XLSX.utils.book_append_sheet(wb, wsReceives, 'Store Receives');

      // Sheet 4: Consumption
      const consumptionRows = [
        ['Sr', 'Date', 'Sum of KG', 'Percentage'],
        ...(analyticsData.top10DatesConsumption || []).map((row, idx) => [
          idx + 1,
          row.date,
          row.sumOfKg,
          `${row.percentage}%`,
        ]),
        ['Total', '', kpis.totalConsumptionKg || 0, '100%'],
      ];
      const wsConsumption = XLSX.utils.aoa_to_sheet(consumptionRows);
      XLSX.utils.book_append_sheet(wb, wsConsumption, 'Floor Consumption');

      const periodStr = (analyticsData.period?.periodLabel || kpis.month || 'August_2026').replace(/[^a-zA-Z0-9_-]/g, '_');
      XLSX.writeFile(wb, `Store_RO_Report_${periodStr}.xlsx`);
    } catch (err) {
      console.error('Excel export error, falling back to CSV:', err);
      handleExportCSV();
    }
  };

  // ── Print Report Handler ──
  const handlePrint = () => {
    if (!analyticsData) {
      alert('Analytics data is still loading. Please wait.');
      return;
    }
    try {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 80);
    } catch (err) {
      console.error('window.print failed:', err);
    }
  };

  return (
    <div className="store-ro-dashboard" style={styles.container}>
      {/* ── TOP PRIMARY TAB NAVIGATION ── */}
      <div style={styles.topTabBar} className="no-print">
        <button
          type="button"
          id="tab-store-ro"
          onClick={() => handleTabChange('store-ro')}
          style={{
            ...styles.topTabBtn,
            ...(activeTab === 'store-ro' ? styles.topTabActive : {}),
          }}
        >
          <Layers size={16} />
          <span>STORE R/O (MONTHLY REPORT)</span>
        </button>
        <button
          type="button"
          id="tab-material-wise"
          onClick={() => handleTabChange('material-wise')}
          style={{
            ...styles.topTabBtn,
            ...(activeTab === 'material-wise' ? styles.topTabActive : {}),
          }}
        >
          <BarChart3 size={16} />
          <span>MATERIAL WISE ANALYSIS (ALL STORE MATERIALS)</span>
        </button>
      </div>

      {activeTab === 'store-ro' ? (
        <>
          {/* ─────────────────────────────────────────────────────────────
              SCREEN-ONLY VIEW (Interactive Dashboard)
          ───────────────────────────────────────────────────────────── */}
          <div className="screen-only-view">
        {/* ── 1. HEADER BAR ── */}
        <div style={styles.headerBanner} className="no-print">
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

        {/* ── ALL STORE MATERIALS QUICK ACCESS BANNER ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '1.5px solid #86EFAC',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#16A34A', color: '#FFFFFF', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#14532D' }}>
                All Materials from Store Panel Available in Material Wise Analysis
              </div>
              <div style={{ fontSize: '11.5px', color: '#15803D', marginTop: '2px' }}>
                Store R/O focuses on monthly issue &amp; receive dispatches. To explore all 320+ raw materials and items from the Store Panel with live stock, non-moving status, and daily drilldowns, switch tabs.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleTabChange('material-wise')}
            style={{
              background: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '12.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
            }}
          >
            <span>Open All Store Materials</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* ── 2. FILTER TOOLBAR ── */}
        <div style={styles.filterToolbar} className="no-print">
          <div style={styles.filterRow}>
            <div style={styles.modeTabs}>
              <button
                type="button"
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
                type="button"
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
                    onChange={(e) => {
                      const m = e.target.value;
                      setSelectedMonth(m);
                      fetchAnalytics({
                        selectedMonth: m,
                        filterMode: 'monthly',
                        selectedYear,
                      });
                    }}
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
                    onChange={(e) => {
                      const y = e.target.value;
                      setSelectedYear(y);
                      fetchAnalytics({
                        selectedYear: y,
                        filterMode: 'monthly',
                        selectedMonth,
                      });
                    }}
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
                type="button"
                id="apply-filter-btn"
                onClick={handleApplyFilter}
                disabled={loading}
                style={styles.applyBtn}
                title="Apply selected date range and refresh analytics"
              >
                <TrendingUp size={15} />
                {loading ? 'Refreshing...' : 'Apply Filter'}
              </button>
              <button
                type="button"
                id="reset-filter-btn"
                onClick={handleReset}
                disabled={loading}
                style={styles.resetBtn}
                title="Reset to default August 2026 period"
              >
                <RotateCcw size={15} />
                Reset
              </button>
              <button
                type="button"
                id="export-csv-btn"
                onClick={handleExportCSV}
                style={styles.exportBtn}
                title="Export report data to CSV"
              >
                <Download size={15} />
                Export CSV
              </button>
              <button
                type="button"
                id="export-excel-btn"
                onClick={handleExportExcel}
                style={{ ...styles.exportBtn, background: '#0284C7' }}
                title="Export complete report to formatted Excel (.xlsx)"
              >
                <FileSpreadsheet size={15} />
                Export Excel
              </button>
              <button
                type="button"
                id="print-report-btn"
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

        {/* ── ERROR NOTICE (IF ANY) ── */}
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

        {/* ── 3. 7 KPI METRIC CARDS ROW ── */}
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

        {/* ── 4. 3-COLUMN ANALYTICAL SECTION ── */}
        <div style={styles.analyticalGrid}>
          {/* Column 1: STORE ISSUE */}
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
                    <th style={{ ...styles.th, width: '90px', textAlign: 'right' }}>%</th>
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
                      <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={{ ...styles.td, fontWeight: '700', color: '#64748B' }}>
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
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#6D28D9' }}>
                          {(row.sumOfKg || 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.pctCell}>
                            <span style={styles.pctText}>{row.percentage || 0}%</span>
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
                    <td colSpan={2} style={{ ...styles.tdFoot, fontWeight: '800', color: '#1E1B4B' }}>
                      Grand Total
                    </td>
                    <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '900', color: '#6D28D9', fontSize: '14px' }}>
                      {(kpis.totalIssueKg || 0).toLocaleString()} KG
                    </td>
                    <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '800' }}>
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Column 2: STORE RECEIVE */}
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
              <span style={styles.countBadge}>{filteredReceives.length} Items</span>
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
                    <th style={{ ...styles.th, width: '90px', textAlign: 'right' }}>%</th>
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
                      <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={{ ...styles.td, fontWeight: '700', color: '#64748B' }}>
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
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#047857' }}>
                          {(row.sumOfKg || 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.pctCell}>
                            <span style={styles.pctText}>{row.percentage || 0}%</span>
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
                    <td colSpan={2} style={{ ...styles.tdFoot, fontWeight: '800', color: '#064E3B' }}>
                      Grand Total
                    </td>
                    <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '900', color: '#047857', fontSize: '14px' }}>
                      {(kpis.totalReceiveKg || 0).toLocaleString()} KG
                    </td>
                    <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '800' }}>
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Column 3: TOP 10 CONSUMPTION */}
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
              <strong>Note:</strong> Sourced from Shop Floor logged consumption (not finished product weights).
            </div>

            <div style={styles.tableScrollWrapper}>
              <table style={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '45px' }}>Sr.</th>
                    <th style={styles.th}>Date</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Sum of KG</th>
                    <th style={{ ...styles.th, width: '90px', textAlign: 'right' }}>%</th>
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
                      <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={{ ...styles.td, fontWeight: '700', color: '#64748B' }}>
                          {row.sr || idx + 1}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '700', color: '#1E293B' }}>
                          {row.date}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#B45309' }}>
                          {(row.sumOfKg || 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.pctCell}>
                            <span style={styles.pctText}>{row.percentage || 0}%</span>
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
                    <td colSpan={2} style={{ ...styles.tdFoot, fontWeight: '800', color: '#78350F' }}>
                      Grand Total
                    </td>
                    <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '900', color: '#B45309', fontSize: '14px' }}>
                      {(kpis.totalConsumptionKg || 0).toLocaleString()} KG
                    </td>
                    <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '800' }}>
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* ── 5. SUMMARY & HIGHLIGHTS CARDS ── */}
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
                  color: (highlights.netBalanceKg || 0) >= 0 ? '#047857' : '#DC2626',
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
              <span style={styles.highlightTileDesc}>Floor utilization vs issued</span>
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
              <div style={{ ...styles.highlightTileValue, fontSize: '18px', color: '#1E293B' }}>
                {highlights.turnoverStatus || 'STEADY'}
              </div>
              <span style={styles.highlightTileDesc}>Depot workload status</span>
            </div>
          </div>
        </div>

        {/* ── 6. KEY INSIGHTS ── */}
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

        {/* ── 7. MATERIAL FLOW VISUALIZATION SUITE (6 CHARTS) ── */}
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
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
            {/* Chart 1: Daily Material Movement Timeline */}
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
                        Receive (Emerald) vs Issue (Violet) vs Floor Consumed (Amber)
                      </span>
                    </div>
                  </div>
                  <span style={{ ...styles.chartMiniBadge, background: '#EDE9FE', color: '#6D28D9' }}>
                    Flow Timeline
                  </span>
                </div>

                {loading ? (
                  <div style={styles.chartLoadingWrapper}>
                    <div className="chart-spinner" />
                    <span style={styles.chartLoadingText}>Loading timeline telemetry...</span>
                  </div>
                ) : (
                  <UltraResponsiveChart
                    height={310}
                    isEmpty={sortedDailyFlow.length === 0}
                    emptyTitle="No Daily Material Flow Recorded"
                    emptySubtitle="No Store Issue, Receive, or Floor Consumption logs for this timeframe."
                  >
                    {({ width, height, scale, isMobile }) => (
                      <BarChart
                        width={width}
                        height={height}
                        data={sortedDailyFlow}
                        margin={{
                          top: 15 * scale,
                          right: isMobile ? 10 : 20 * scale,
                          left: isMobile ? -25 : -10,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickLine={false}
                          tickFormatter={formatDateTick}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickLine={false}
                          tickFormatter={(val) =>
                            Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0F172A',
                            color: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: `${Math.round(12 * scale)}px`,
                          }}
                          formatter={(val, name) => [`${Number(val).toLocaleString()} KG`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: `${Math.round(11 * scale)}px`, paddingTop: '6px' }} />
                        <Bar dataKey="receiveKg" fill="#10B981" name="Received (KG)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="issueKg" fill="#8B5CF6" name="Issued (KG)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="consumptionKg" fill="#F59E0B" name="Consumed (KG)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </UltraResponsiveChart>
                )}
              </div>
            )}

            {/* Chart 2: Top Materials Volume Share (Donut) */}
            {(chartViewTab === 'all' || chartViewTab === 'materials') && (
              <div style={styles.chartCard}>
                <div style={styles.chartCardHeader}>
                  <div style={styles.chartCardHeaderLeft}>
                    <PieChartIcon size={18} style={{ color: '#8B5CF6' }} />
                    <div>
                      <h4 style={styles.chartCardTitle}>TOP MATERIALS VOLUME SHARE (%)</h4>
                      <span style={styles.chartCardSubtitle}>
                        Proportional volume share across primary commodities in KG
                      </span>
                    </div>
                  </div>
                  <span style={{ ...styles.chartMiniBadge, background: '#FCE7F3', color: '#BE185D' }}>
                    Distribution
                  </span>
                </div>

                {loading ? (
                  <div style={styles.chartLoadingWrapper}>
                    <div className="chart-spinner" />
                    <span style={styles.chartLoadingText}>Loading distribution telemetry...</span>
                  </div>
                ) : (
                  <UltraResponsiveChart
                    height={310}
                    isEmpty={topMaterialsShareData.length === 0}
                    emptyTitle="No Material Share Data"
                    emptySubtitle="No item transactions recorded for the selected period."
                  >
                    {({ width, height, scale }) => {
                      const minDim = Math.min(width, height);
                      const innerR = Math.max(38, Math.round(minDim * 0.22));
                      const outerR = Math.max(68, Math.round(minDim * 0.38));

                      return (
                        <PieChart width={width} height={height} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <Tooltip
                            contentStyle={{
                              background: '#0F172A',
                              color: '#fff',
                              borderRadius: '8px',
                              border: 'none',
                              fontSize: `${Math.round(12 * scale)}px`,
                            }}
                            formatter={(val, name, entry) => [
                              `${Number(val).toLocaleString()} KG (${entry?.payload?.percentage || 0}%)`,
                              entry?.payload?.name,
                            ]}
                          />
                          <Legend wrapperStyle={{ fontSize: `${Math.round(11 * scale)}px`, paddingTop: '6px' }} />
                          <Pie
                            data={topMaterialsShareData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="48%"
                            innerRadius={innerR}
                            outerRadius={outerR}
                            paddingAngle={3}
                          >
                            {topMaterialsShareData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      );
                    }}
                  </UltraResponsiveChart>
                )}
              </div>
            )}

            {/* Chart 3: Cumulative Material Trajectory */}
            {(chartViewTab === 'all' || chartViewTab === 'timeline') && (
              <div style={styles.chartCard}>
                <div style={styles.chartCardHeader}>
                  <div style={styles.chartCardHeaderLeft}>
                    <LineChartIcon size={18} style={{ color: '#10B981' }} />
                    <div>
                      <h4 style={styles.chartCardTitle}>CUMULATIVE INVENTORY TRAJECTORY (KG)</h4>
                      <span style={styles.chartCardSubtitle}>
                        Progressive store intake vs depot issue vs shop floor draw
                      </span>
                    </div>
                  </div>
                  <span style={{ ...styles.chartMiniBadge, background: '#D1FAE5', color: '#065F46' }}>
                    Accumulation
                  </span>
                </div>

                {loading ? (
                  <div style={styles.chartLoadingWrapper}>
                    <div className="chart-spinner" />
                    <span style={styles.chartLoadingText}>Loading trajectory telemetry...</span>
                  </div>
                ) : (
                  <UltraResponsiveChart
                    height={310}
                    isEmpty={cumulativeFlowData.length === 0}
                    emptyTitle="No Cumulative Telemetry"
                    emptySubtitle="No cumulative inventory flow recorded for this timeframe."
                  >
                    {({ width, height, scale, isMobile }) => (
                      <AreaChart
                        width={width}
                        height={height}
                        data={cumulativeFlowData}
                        margin={{
                          top: 15 * scale,
                          right: isMobile ? 10 : 20 * scale,
                          left: isMobile ? -25 : -10,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id="gradReceive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="gradIssue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickLine={false}
                          tickFormatter={formatDateTick}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickLine={false}
                          tickFormatter={(val) =>
                            Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0F172A',
                            color: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: `${Math.round(12 * scale)}px`,
                          }}
                          formatter={(val, name) => [`${Number(val).toLocaleString()} KG`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: `${Math.round(11 * scale)}px`, paddingTop: '6px' }} />
                        <Area
                          type="monotone"
                          dataKey="cumReceiveKg"
                          stroke="#10B981"
                          strokeWidth={Math.max(2, Math.round(2 * scale))}
                          fillOpacity={1}
                          fill="url(#gradReceive)"
                          name="Cum. Received (KG)"
                        />
                        <Area
                          type="monotone"
                          dataKey="cumIssueKg"
                          stroke="#8B5CF6"
                          strokeWidth={Math.max(2, Math.round(2 * scale))}
                          fillOpacity={1}
                          fill="url(#gradIssue)"
                          name="Cum. Issued (KG)"
                        />
                        <Line
                          type="monotone"
                          dataKey="cumConsumptionKg"
                          stroke="#F59E0B"
                          strokeWidth={Math.max(2.5, Math.round(2.5 * scale))}
                          dot={false}
                          name="Cum. Consumed (KG)"
                        />
                      </AreaChart>
                    )}
                  </UltraResponsiveChart>
                )}
              </div>
            )}

            {/* Chart 4: Top Materials Issue vs Receive Comparison */}
            {(chartViewTab === 'all' || chartViewTab === 'materials') && (
              <div style={styles.chartCard}>
                <div style={styles.chartCardHeader}>
                  <div style={styles.chartCardHeaderLeft}>
                    <BarChart3 size={18} style={{ color: '#0284C7' }} />
                    <div>
                      <h4 style={styles.chartCardTitle}>TOP MATERIALS: ISSUE VS RECEIVE (KG)</h4>
                      <span style={styles.chartCardSubtitle}>
                        Direct side-by-side comparison for primary commodities
                      </span>
                    </div>
                  </div>
                  <span style={{ ...styles.chartMiniBadge, background: '#E0F2FE', color: '#0369A1' }}>
                    Commodity Matrix
                  </span>
                </div>

                {loading ? (
                  <div style={styles.chartLoadingWrapper}>
                    <div className="chart-spinner" />
                    <span style={styles.chartLoadingText}>Loading commodity matrix...</span>
                  </div>
                ) : (
                  <UltraResponsiveChart
                    height={310}
                    isEmpty={itemWiseComparisonData.length === 0}
                    emptyTitle="No Commodity Comparison Data"
                    emptySubtitle="No item issue or receive records found for this period."
                  >
                    {({ width, height, scale, isMobile }) => (
                      <BarChart
                        width={width}
                        height={height}
                        data={itemWiseComparisonData}
                        layout="vertical"
                        margin={{
                          top: 10,
                          right: isMobile ? 15 : 25 * scale,
                          left: isMobile ? 25 : 35 * scale,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          type="number"
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickFormatter={(val) =>
                            Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val
                          }
                        />
                        <YAxis
                          dataKey="itemName"
                          type="category"
                          stroke="#64748B"
                          fontSize={Math.round(isMobile ? 9.5 : 10.5 * scale)}
                          tickLine={false}
                          width={isMobile ? 75 : Math.round(95 * scale)}
                          tickFormatter={(str) => (str.length > 12 ? `${str.slice(0, 12)}…` : str)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0F172A',
                            color: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: `${Math.round(12 * scale)}px`,
                          }}
                          formatter={(val, name) => [`${Number(val).toLocaleString()} KG`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: `${Math.round(11 * scale)}px`, paddingTop: '6px' }} />
                        <Bar dataKey="receiveKg" fill="#10B981" name="Received (KG)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="issueKg" fill="#8B5CF6" name="Issued (KG)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    )}
                  </UltraResponsiveChart>
                )}
              </div>
            )}

            {/* Chart 5: Daily Net Inventory Variance / Volatility */}
            {(chartViewTab === 'all' || chartViewTab === 'balance') && (
              <div style={styles.chartCard}>
                <div style={styles.chartCardHeader}>
                  <div style={styles.chartCardHeaderLeft}>
                    <Activity size={18} style={{ color: '#F59E0B' }} />
                    <div>
                      <h4 style={styles.chartCardTitle}>DAILY NET STORE BALANCE FLOW (KG)</h4>
                      <span style={styles.chartCardSubtitle}>
                        Net Intake (+) Inflow vs Net Drawdown (-) Depletion
                      </span>
                    </div>
                  </div>
                  <span style={{ ...styles.chartMiniBadge, background: '#FEF3C7', color: '#B45309' }}>
                    Net Volatility
                  </span>
                </div>

                {loading ? (
                  <div style={styles.chartLoadingWrapper}>
                    <div className="chart-spinner" />
                    <span style={styles.chartLoadingText}>Loading net flow telemetry...</span>
                  </div>
                ) : (
                  <UltraResponsiveChart
                    height={310}
                    isEmpty={dailyNetVarianceData.length === 0}
                    emptyTitle="No Balance Variance Records"
                    emptySubtitle="No store intake or issue variance recorded for this period."
                  >
                    {({ width, height, scale, isMobile }) => (
                      <BarChart
                        width={width}
                        height={height}
                        data={dailyNetVarianceData}
                        margin={{
                          top: 15 * scale,
                          right: isMobile ? 10 : 20 * scale,
                          left: isMobile ? -25 : -10,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickLine={false}
                          tickFormatter={formatDateTick}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickLine={false}
                          tickFormatter={(val) =>
                            Math.abs(Number(val)) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0F172A',
                            color: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: `${Math.round(12 * scale)}px`,
                          }}
                          formatter={(val) => [
                            `${Number(val) >= 0 ? '+' : ''}${Number(val).toLocaleString()} KG`,
                            'Net Flow',
                          ]}
                        />
                        <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
                        <Bar dataKey="netKg" name="Net Balance (KG)">
                          {dailyNetVarianceData.map((entry, index) => (
                            <Cell key={`net-cell-${index}`} fill={entry.netKg >= 0 ? '#10B981' : '#F43F5E'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </UltraResponsiveChart>
                )}
              </div>
            )}

            {/* Chart 6: Operational Flow Balance & Velocity */}
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
                  <span style={{ ...styles.chartMiniBadge, background: '#F1F5F9', color: '#334155' }}>
                    Aggregate
                  </span>
                </div>

                {loading ? (
                  <div style={styles.chartLoadingWrapper}>
                    <div className="chart-spinner" />
                    <span style={styles.chartLoadingText}>Loading aggregate velocity...</span>
                  </div>
                ) : (
                  <UltraResponsiveChart
                    height={310}
                    isEmpty={
                      kpis.totalReceiveKg === 0 &&
                      kpis.totalIssueKg === 0 &&
                      kpis.totalConsumptionKg === 0
                    }
                    emptyTitle="No Flow Velocity Data"
                    emptySubtitle="All store movement metrics are currently at 0 KG for this timeframe."
                  >
                    {({ width, height, scale, isMobile }) => (
                      <BarChart
                        width={width}
                        height={height}
                        data={summaryComparisonData}
                        layout="vertical"
                        margin={{
                          top: 15,
                          right: isMobile ? 20 : 30 * scale,
                          left: isMobile ? 15 : 20 * scale,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          type="number"
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickFormatter={(val) =>
                            Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val
                          }
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#64748B"
                          fontSize={Math.round(11 * scale)}
                          tickLine={false}
                          width={isMobile ? 95 : Math.round(115 * scale)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0F172A',
                            color: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: `${Math.round(12 * scale)}px`,
                          }}
                          formatter={(val) => [`${Number(val).toLocaleString()} KG`]}
                        />
                        <Bar dataKey="volumeKg" name="Volume (KG)" radius={[0, 6, 6, 0]}>
                          {summaryComparisonData.map((entry, index) => (
                            <Cell key={`cell-comp-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </UltraResponsiveChart>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED PRINT-ONLY OFFICIAL A4 AUDIT REPORT
      ───────────────────────────────────────────────────────────── */}
      <div className="print-only-report">
        {/* Official Letterhead */}
        <div style={styles.printHeaderBox}>
          <div>
            <div style={styles.printCompanyTitle}>
              HIMALAYA MACHINERY PVT. LTD.
            </div>
            <div style={styles.printReportSubtitle}>
              STORE R/O MONTHLY MATERIAL AUDIT & STOCK CONTROL STATEMENT
            </div>
            <div style={styles.printReportSubtext}>
              PostgreSQL Verified Ledger • Plant Head Executive Operations Manifest
            </div>
          </div>
          <div style={styles.printMetaBlock}>
            <div><strong>Period:</strong> {analyticsData?.period?.periodLabel || kpis.month || 'AUGUST 2026'}</div>
            <div><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Document ID:</strong> STR-RO-{(analyticsData?.period?.periodLabel || 'AUDIT').replace(/\s+/g, '-').toUpperCase()}</div>
            <div><strong>Ledger Integrity:</strong> Reconciled &amp; Active</div>
          </div>
        </div>

        {/* KPI Performance Summary Matrix */}
        <div style={styles.printKpiGrid}>
          <div style={styles.printKpiCard}>
            <div style={styles.printKpiLabel}>Total Store Issue</div>
            <div style={{ ...styles.printKpiVal, color: '#6D28D9' }}>
              {(kpis.totalIssueKg || 0).toLocaleString()} KG
            </div>
            <div style={styles.printKpiFoot}>Dispatched to floor</div>
          </div>
          <div style={styles.printKpiCard}>
            <div style={styles.printKpiLabel}>Total Store Receive</div>
            <div style={{ ...styles.printKpiVal, color: '#047857' }}>
              {(kpis.totalReceiveKg || 0).toLocaleString()} KG
            </div>
            <div style={styles.printKpiFoot}>Verified intake</div>
          </div>
          <div style={styles.printKpiCard}>
            <div style={styles.printKpiLabel}>Floor Consumption</div>
            <div style={{ ...styles.printKpiVal, color: '#B45309' }}>
              {(kpis.totalConsumptionKg || 0).toLocaleString()} KG
            </div>
            <div style={styles.printKpiFoot}>Shop floor usage</div>
          </div>
          <div style={styles.printKpiCard}>
            <div style={styles.printKpiLabel}>Net Movement Delta</div>
            <div style={{ ...styles.printKpiVal, color: (highlights.netBalanceKg || 0) >= 0 ? '#047857' : '#DC2626' }}>
              {(highlights.netBalanceKg || 0) >= 0 ? '+' : ''}{(highlights.netBalanceKg || 0).toLocaleString()} KG
            </div>
            <div style={styles.printKpiFoot}>Receive vs Issue</div>
          </div>
          <div style={styles.printKpiCard}>
            <div style={styles.printKpiLabel}>Utilization Efficiency</div>
            <div style={{ ...styles.printKpiVal, color: '#2563EB' }}>
              {highlights.consumptionIssueRatio || 0}%
            </div>
            <div style={styles.printKpiFoot}>Consumption/Issue</div>
          </div>
        </div>

        {/* Section 1: Store Issues */}
        <div style={styles.printSection}>
          <div style={styles.printSectionTitle}>
            1. STORE ISSUE (KG) – ITEM WISE ({filteredIssues.length} Materials Dispatched)
          </div>
          <table className="print-table">
            <thead>
              <tr style={{ background: '#F1F5F9', color: '#0F172A', textAlign: 'left', fontWeight: '800' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>Sr</th>
                <th>Material Description / Item Name</th>
                <th style={{ width: '130px' }}>Item SKU</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Unit</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Sum of KG</th>
                <th style={{ width: '70px', textAlign: 'right' }}>Share %</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '12px', color: '#64748B' }}>
                    No store issues recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.sr || idx + 1}</td>
                    <td style={{ fontWeight: '700' }}>{row.itemName}</td>
                    <td>{row.itemSku || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{row.unit || 'KG'}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800' }}>{(row.sumOfKg || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{row.percentage || 0}%</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: '#F8FAFC', fontWeight: '900' }}>
                <td colSpan={4} style={{ textAlign: 'right', paddingRight: '12px' }}>Total Store Issues:</td>
                <td style={{ textAlign: 'right', color: '#6D28D9' }}>{(kpis.totalIssueKg || 0).toLocaleString()} KG</td>
                <td style={{ textAlign: 'right' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 2: Store Receives */}
        <div style={styles.printSection}>
          <div style={styles.printSectionTitle}>
            2. STORE RECEIVE (KG) – ITEM WISE ({filteredReceives.length} Materials Intake Verified)
          </div>
          <table className="print-table">
            <thead>
              <tr style={{ background: '#F1F5F9', color: '#0F172A', textAlign: 'left', fontWeight: '800' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>Sr</th>
                <th>Material Description / Item Name</th>
                <th style={{ width: '130px' }}>Item SKU</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Unit</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Sum of KG</th>
                <th style={{ width: '70px', textAlign: 'right' }}>Share %</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceives.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '12px', color: '#64748B' }}>
                    No store receipts recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredReceives.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.sr || idx + 1}</td>
                    <td style={{ fontWeight: '700' }}>{row.itemName}</td>
                    <td>{row.itemSku || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{row.unit || 'KG'}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800' }}>{(row.sumOfKg || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{row.percentage || 0}%</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: '#F8FAFC', fontWeight: '900' }}>
                <td colSpan={4} style={{ textAlign: 'right', paddingRight: '12px' }}>Total Store Receipts:</td>
                <td style={{ textAlign: 'right', color: '#047857' }}>{(kpis.totalReceiveKg || 0).toLocaleString()} KG</td>
                <td style={{ textAlign: 'right' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 3: Consumption */}
        <div style={styles.printSection}>
          <div style={styles.printSectionTitle}>
            3. TOP 10 DATES – CONSUMPTION (KG) ({top10DatesConsumption.length} Active Days)
          </div>
          <table className="print-table">
            <thead>
              <tr style={{ background: '#F1F5F9', color: '#0F172A', textAlign: 'left', fontWeight: '800' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>Sr</th>
                <th>Consumption Log Date</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Quantity Consumed (KG)</th>
                <th style={{ width: '80px', textAlign: 'right' }}>Share %</th>
              </tr>
            </thead>
            <tbody>
              {top10DatesConsumption.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '12px', color: '#64748B' }}>
                    No floor consumption recorded for this period.
                  </td>
                </tr>
              ) : (
                top10DatesConsumption.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{row.sr || idx + 1}</td>
                    <td style={{ fontWeight: '700' }}>{row.date}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800' }}>{(row.sumOfKg || 0).toLocaleString()} KG</td>
                    <td style={{ textAlign: 'right' }}>{row.percentage || 0}%</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: '#F8FAFC', fontWeight: '900' }}>
                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px' }}>Total Floor Consumption:</td>
                <td style={{ textAlign: 'right', color: '#B45309' }}>{(kpis.totalConsumptionKg || 0).toLocaleString()} KG</td>
                <td style={{ textAlign: 'right' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 4: Key Insights */}
        {insights.length > 0 && (
          <div style={styles.printSection}>
            <div style={styles.printSectionTitle}>4. EXECUTIVE TELEMETRY & AUDIT HIGHLIGHTS</div>
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px 14px', background: '#F8FAFC' }}>
              {insights.map((ins, idx) => (
                <div key={idx} style={{ fontSize: '10px', color: '#334155', marginBottom: '4px' }}>
                  • {ins.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tri-Signature Stamp & Authorization Box */}
        <div style={styles.printFooterBox}>
          <div style={styles.printSignRow}>
            <div style={styles.printSignCol}>
              <div style={styles.printSignBorder} />
              <div style={styles.printSignRole}>STORE IN-CHARGE</div>
              <div style={styles.printSignDept}>Himalaya Store Dept.</div>
            </div>
            <div style={styles.printSignCol}>
              <div style={styles.printSignBorder} />
              <div style={styles.printSignRole}>PLANT HEAD</div>
              <div style={styles.printSignDept}>Operations & Production</div>
            </div>
            <div style={styles.printSignCol}>
              <div style={styles.printSignBorder} />
              <div style={styles.printSignRole}>INTERNAL AUDITOR</div>
              <div style={styles.printSignDept}>Finance & Material Audit</div>
            </div>
          </div>
          <div style={styles.printLegalNote}>
            This Store R/O statement is electronically generated from the authoritative PostgreSQL database of Himalaya Machinery ERP.
          </div>
        </div>
      </div>
        </>
      ) : (
        <MaterialWiseAnalysisView />
      )}

      {/* ─────────────────────────────────────────────────────────────
          UNIVERSAL RESPONSIVE CSS & PRINT MEDIA RULES
      ───────────────────────────────────────────────────────────── */}
      <style jsx global>{`
        .store-ro-dashboard * {
          box-sizing: border-box;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .chart-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ── Screen Mode: Hide Print Document ── */
        @media screen {
          .print-only-report {
            display: none !important;
          }
        }

        /* ── Print Media: Dedicated Official A4 Report ── */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html,
          body,
          #__next,
          .app-container,
          .main-viewport,
          .plant-head-portal-root,
          div[class*='layout'],
          main {
            background: #ffffff !important;
            color: #0f172a !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .print-only-report,
          .print-only-report * {
            visibility: visible !important;
          }
          .print-only-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 4mm 6mm !important;
            margin: 0 !important;
          }
          .screen-only-view,
          .no-print,
          .hero-banner,
          .o2p-workflow-banner,
          .sidebar,
          .app-sidebar,
          nav,
          header,
          aside,
          button,
          input,
          select {
            display: none !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
          }
          .print-table thead {
            display: table-header-group !important;
          }
          .print-table tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 5px 8px !important;
          }
        }

        /* ── Extra Small Devices (320px - 480px) ── */
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

        /* ── Small to Medium Devices (481px - 768px) ── */
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
      `}</style>
    </div>
  );
};

// ── Fluid Responsive Inline Style Definitions (Supports 320px to 12K) ──
const styles = {
  topTabBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    padding: '6px',
    borderRadius: '12px',
    border: '1.5px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
    width: 'fit-content',
    maxWidth: '100%',
    overflowX: 'auto',
  },
  topTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: 'clamp(12px, 0.85vw, 13px)',
    fontWeight: '700',
    color: '#64748B',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  topTabActive: {
    background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(10, 25, 47, 0.25)',
    fontWeight: '800',
  },
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
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: 'clamp(12px, 1.2vw, 18px)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
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
  chartLoadingWrapper: {
    width: '100%',
    height: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: '#F8FAFC',
    borderRadius: '12px',
  },
  chartLoadingText: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '600',
  },

  // ── Print-Only Report Styles ──
  printHeaderBox: {
    borderBottom: '2.5px solid #0F172A',
    paddingBottom: '12px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  printCompanyTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
  },
  printReportSubtitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '2px',
  },
  printReportSubtext: {
    fontSize: '9.5px',
    color: '#64748B',
    marginTop: '2px',
  },
  printMetaBlock: {
    textAlign: 'right',
    fontSize: '10px',
    color: '#334155',
    lineHeight: '1.4',
  },
  printKpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  printKpiCard: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '6px',
    padding: '8px 10px',
    background: '#F8FAFC',
  },
  printKpiLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  printKpiVal: {
    fontSize: '15px',
    fontWeight: '900',
    marginTop: '2px',
  },
  printKpiFoot: {
    fontSize: '8.5px',
    color: '#64748B',
    marginTop: '1px',
  },
  printSection: {
    marginBottom: '20px',
    breakInside: 'avoid',
  },
  printSectionTitle: {
    fontSize: '12px',
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  printFooterBox: {
    marginTop: '28px',
    borderTop: '1.5px dashed #94A3B8',
    paddingTop: '20px',
    breakInside: 'avoid',
  },
  printSignRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    marginBottom: '20px',
  },
  printSignCol: {
    textAlign: 'center',
    width: '180px',
  },
  printSignBorder: {
    borderTop: '1.5px solid #0F172A',
    marginBottom: '6px',
  },
  printSignRole: {
    fontSize: '10.5px',
    fontWeight: '900',
    color: '#0F172A',
  },
  printSignDept: {
    fontSize: '9px',
    color: '#64748B',
  },
  printLegalNote: {
    textAlign: 'center',
    fontSize: '8.5px',
    color: '#94A3B8',
  },
};

export default PlantHeadMaterialAnalytics;
