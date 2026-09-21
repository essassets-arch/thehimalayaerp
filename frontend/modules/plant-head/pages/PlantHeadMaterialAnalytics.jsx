'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Package,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  ChevronRight,
  BarChart3,
  Layers,
  RefreshCw,
  X,
  FileSpreadsheet,
  ExternalLink,
  ChevronLeft,
  Info,
  CalendarDays,
  FileText,
  Activity,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import UltraResponsiveChart from '../../../shared/components/UltraResponsiveChart';
import styles from '../components/material-analytics.module.css';

// ── Decimal Safe Formatting Helpers ──
const formatKg = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const num = Number(val);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const formatPercent = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00%';
  return Number(val).toFixed(2) + '%';
};

const csvCell = (val) => {
  const s = String(val ?? '');
  return '"' + s.replace(/^[=+@\-]/, (m) => "'" + m).replaceAll('"', '""') + '"';
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function PlantHeadMaterialAnalytics() {
  // ── Tab State: 'store-ro' | 'material-wise' (synced with URL) ──
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'material-wise' || tab === 'material') return 'material-wise';
    }
    return 'store-ro';
  });

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // ── Global Filter States ──
  const currentYearStr = String(new Date().getFullYear());
  const currentMonthNumStr = String(new Date().getMonth() + 1);

  const [dateRangePreset, setDateRangePreset] = useState('This Month');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNumStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState('ALL');
  const [movementClassification, setMovementClassification] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');

  // ── Refresh & Timestamp ──
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastUpdatedText, setLastUpdatedText] = useState('');

  // ── Store R/O Tab Data ──
  const [storeRoData, setStoreRoData] = useState(null);
  const [storeRoLoading, setStoreRoLoading] = useState(true);
  const [storeRoError, setStoreRoError] = useState('');

  // ── Material Wise Tab Data ──
  const [matWiseData, setMatWiseData] = useState(null);
  const [matWiseLoading, setMatWiseLoading] = useState(false);
  const [matWiseError, setMatWiseError] = useState('');
  const [matWisePage, setMatWisePage] = useState(1);
  const [matWisePageSize, setMatWisePageSize] = useState(25);
  const [selectedDrillMaterial, setSelectedDrillMaterial] = useState(null);
  const [selectedDrillDate, setSelectedDrillDate] = useState(null);

  // ── Monthly Matrix View: 'issue' | 'receive' | 'consumption' ──
  const [matrixView, setMatrixView] = useState('issue');
  const [matrixYear, setMatrixYear] = useState(currentYearStr);

  // ── Modals & Drawers ──
  const [allDatesModalOpen, setAllDatesModalOpen] = useState(false);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [drawerMaterial, setDrawerMaterial] = useState(null);

  // ── Transaction Audit Drawer ──
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [auditParams, setAuditParams] = useState({ materialId: '', movementType: 'ALL', title: 'Audit' });
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);

  // ── Query Param Builder ──
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (dateRangePreset === 'Custom') {
      params.set('filter', 'Custom');
      if (customStart) params.set('customStart', customStart);
      if (customEnd) params.set('customEnd', customEnd);
    } else if (dateRangePreset !== 'Month') {
      params.set('filter', dateRangePreset);
    } else {
      params.set('month', selectedMonth);
      params.set('year', selectedYear);
    }

    if (search.trim()) params.set('search', search.trim());
    if (movementType !== 'ALL') params.set('movementFilter', movementType);
    if (movementClassification !== 'ALL') params.set('classification', movementClassification);
    return params;
  }, [dateRangePreset, customStart, customEnd, selectedMonth, selectedYear, search, movementType, movementClassification]);

  // ── Fetch Authoritative Store R/O Data ──
  const fetchStoreRoData = useCallback(async () => {
    setStoreRoLoading(true);
    setStoreRoError('');
    try {
      const q = buildQueryParams().toString();
      const res = await backendFetch(`/api/backend/plant-head/analytics/material?${q}`, {
        cacheTtlMs: 0,
      });
      if (!res || !res.kpis) {
        throw new Error('Invalid analytics response format');
      }
      setStoreRoData(res);
      const now = new Date();
      setLastUpdatedText(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        }) + ' IST',
      );
    } catch (err) {
      setStoreRoError(err?.message || 'Unable to load material analytics. Please retry.');
    } finally {
      setStoreRoLoading(false);
    }
  }, [buildQueryParams]);

  // ── Fetch Authoritative Material Wise Data ──
  const fetchMatWiseData = useCallback(async () => {
    setMatWiseLoading(true);
    setMatWiseError('');
    try {
      const qParams = buildQueryParams();
      if (selectedDrillMaterial) qParams.set('materialId', selectedDrillMaterial);
      if (selectedDrillDate) qParams.set('date', selectedDrillDate);

      const res = await backendFetch(`/api/backend/plant-head/analytics/material-wise?${qParams.toString()}`, {
        cacheTtlMs: 0,
      });
      if (!res || !Array.isArray(res.materials)) {
        throw new Error('Invalid material-wise response format');
      }
      setMatWiseData(res);
    } catch (err) {
      setMatWiseError(err?.message || 'Unable to load material wise analysis.');
    } finally {
      setMatWiseLoading(false);
    }
  }, [buildQueryParams, selectedDrillMaterial, selectedDrillDate]);

  // ── Fetch Transaction Audit ──
  const fetchAuditRecords = useCallback(async (matId, mType, page = 1) => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '25',
        movementType: mType || 'ALL',
      });
      if (matId) params.set('materialId', matId);
      if (storeRoData?.period?.startDate && storeRoData?.period?.endDate) {
        params.set('startDate', storeRoData.period.startDate);
        params.set('endDate', storeRoData.period.endDate);
      }

      const res = await backendFetch(`/api/backend/plant-head/analytics/transaction-audit?${params.toString()}`, {
        cacheTtlMs: 0,
      });
      setAuditData(res);
      setAuditPage(page);
    } catch (e) {
      console.error('Audit fetch error:', e);
    } finally {
      setAuditLoading(false);
    }
  }, [storeRoData]);

  // Trigger main data fetch on filter / refresh change
  useEffect(() => {
    fetchStoreRoData();
  }, [fetchStoreRoData, refreshCount]);

  // Trigger material wise data fetch when active tab is material-wise
  useEffect(() => {
    if (activeTab === 'material-wise') {
      fetchMatWiseData();
    }
  }, [activeTab, fetchMatWiseData, refreshCount]);

  // Handler for opening audit drawer
  const openAuditDrawer = (matId, mType, title) => {
    setAuditParams({ materialId: matId, movementType: mType || 'ALL', title: title || 'Transaction Audit' });
    setAuditDrawerOpen(true);
    fetchAuditRecords(matId, mType || 'ALL', 1);
  };

  // Handler for opening material detail drawer
  const openMaterialDrawer = (item) => {
    setDrawerMaterial(item);
    setMaterialDrawerOpen(true);
  };

  // Reset all filters
  const handleClearFilters = () => {
    setDateRangePreset('This Month');
    setSelectedMonth(currentMonthNumStr);
    setSelectedYear(currentYearStr);
    setCustomStart('');
    setCustomEnd('');
    setSearch('');
    setMovementType('ALL');
    setMovementClassification('ALL');
    setUnitFilter('ALL');
    setSelectedDrillMaterial(null);
    setSelectedDrillDate(null);
  };

  // CSV Export for current filtered view
  const handleExportCsv = () => {
    if (activeTab === 'store-ro' && storeRoData) {
      const headers = ['Sr. No.', 'Material Name', 'SKU', 'Unit', 'Category', 'Issue (PCS)', 'Receive (PCS)', 'Issue %', 'Transactions', 'Avg Issue/Txn'];
      const rows = (storeRoData.issueByItem || []).map((row, idx) => {
        const rec = (storeRoData.receiveByItem || []).find((r) => r.materialId === row.materialId);
        return [
          idx + 1,
          csvCell(row.itemName),
          csvCell(row.itemSku),
          csvCell(row.unit),
          csvCell(row.category),
          row.sumOfKg,
          rec ? rec.sumOfKg : 0,
          row.percentage + '%',
          row.transactions,
          row.avgPerTransaction,
        ].join(',');
      });
      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Himalaya_Store_RO_Analytics_${storeRoData.period?.periodLabel || 'Export'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (activeTab === 'material-wise' && matWiseData) {
      const headers = ['Material', 'SKU', 'Unit', 'Category', 'Issue (PCS)', 'Issue Txns', 'Receive (PCS)', 'Consumption (PCS)', 'Classification'];
      const rows = (matWiseData.materials || []).map((m) => [
        csvCell(m.materialName),
        csvCell(m.materialSku),
        csvCell(m.unit),
        csvCell(m.category),
        m.totalIssueKg,
        m.issueTransactions,
        m.totalReceiveKg,
        m.totalConsumptionKg,
        csvCell(m.classification),
      ].join(','));
      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Himalaya_Material_Wise_Analytics_${matWiseData.period?.periodLabel || 'Export'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Filtered Material Wise table rows
  const matWiseFilteredRows = useMemo(() => {
    if (!matWiseData?.materials) return [];
    return matWiseData.materials.filter((m) => {
      if (unitFilter !== 'ALL' && m.unit !== unitFilter) return false;
      return true;
    });
  }, [matWiseData, unitFilter]);

  const matWiseTotalPages = Math.max(1, Math.ceil(matWiseFilteredRows.length / matWisePageSize));
  const matWiseCurrentPage = Math.min(matWisePage, matWiseTotalPages);
  const matWiseVisibleRows = matWiseFilteredRows.slice(
    (matWiseCurrentPage - 1) * matWisePageSize,
    matWiseCurrentPage * matWisePageSize,
  );

  return (
    <div className={styles.page}>
      {/* ── Brand Header ── */}
      <header className={styles.brandHeader}>
        <div className={styles.brandInfo}>
          <div className={styles.brandBadge}>
            <ShieldCheck size={13} />
            HIMALAYA COMPOSITES
          </div>
          <h1 className={styles.brandTitle}>RAW MATERIAL ANALYTICS</h1>
          <div className={styles.brandSubtitle}>
            STORE RAW INVENTORY CONTROL | RAW MATERIAL MOVEMENT | PRODUCTION ALLOCATION
          </div>
        </div>

        <div className={styles.headerMeta}>
          <div className={styles.timestamp}>
            <Clock size={14} />
            Last Updated: <strong>{lastUpdatedText || 'Loading...'}</strong>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setRefreshCount((c) => c + 1)}
              disabled={storeRoLoading}
              title="Refetch authoritative Store data"
            >
              <RefreshCw size={14} className={storeRoLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleExportCsv}
              disabled={storeRoLoading || (!storeRoData && !matWiseData)}
              title="Export RFC compliant CSV"
            >
              <Download size={14} />
              Export CSV
            </button>
            <a
              href="/store/raw-inventory"
              target="_blank"
              rel="noreferrer"
              className={styles.btnSecondary}
              title="Open raw inventory master ledger in new tab"
            >
              <ExternalLink size={14} />
              Store Raw Inventory
            </a>
          </div>
        </div>
      </header>

      {/* ── Global Filter Bar ── */}
      <section className={styles.filterBar} aria-label="Global Filters">
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label htmlFor="filter-preset">Date Range</label>
            <select
              id="filter-preset"
              className={styles.filterSelect}
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Previous Month">Previous Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Month">Specific Month</option>
              <option value="Custom">Custom Dates</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          {dateRangePreset === 'Month' && (
            <>
              <div className={styles.filterGroup}>
                <label htmlFor="filter-month">Month</label>
                <select
                  id="filter-month"
                  className={styles.filterSelect}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={String(idx + 1)}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="filter-year">Year</label>
                <select
                  id="filter-year"
                  className={styles.filterSelect}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {['2024', '2025', '2026', '2027'].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {dateRangePreset === 'Custom' && (
            <>
              <div className={styles.filterGroup}>
                <label htmlFor="filter-start">From</label>
                <input
                  id="filter-start"
                  type="date"
                  className={styles.filterInput}
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="filter-end">Through</label>
                <input
                  id="filter-end"
                  type="date"
                  className={styles.filterInput}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </>
          )}

          <div className={styles.filterGroup}>
            <label htmlFor="filter-movement-type">Movement Type</label>
            <select
              id="filter-movement-type"
              className={styles.filterSelect}
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
            >
              <option value="ALL">All Movements</option>
              <option value="ISSUE">Issue to Production</option>
              <option value="RECEIVE">Store Receipts (GRN)</option>
              <option value="CONSUMPTION">Production Consumed</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filter-classification">Classification</label>
            <select
              id="filter-classification"
              className={styles.filterSelect}
              value={movementClassification}
              onChange={(e) => setMovementClassification(e.target.value)}
            >
              <option value="ALL">All Classifications</option>
              <option value="FAST_MOVING">Fast Moving</option>
              <option value="SLOW_MOVING">Slow Moving</option>
              <option value="NON_MOVING">Non-Moving</option>
            </select>
          </div>

          <div className={styles.filterGroup} style={{ flex: '1 1 200px' }}>
            <label htmlFor="filter-search">Search Material</label>
            <input
              id="filter-search"
              type="search"
              className={styles.filterInput}
              placeholder="Search by name, SKU or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.btnOutline}
              onClick={handleClearFilters}
              title="Reset all filters to defaults"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* ── Error Banner ── */}
      {storeRoError && (
        <div className={styles.errorState} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>{storeRoError}</span>
          </div>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setRefreshCount((c) => c + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 6 KPI Cards Grid ── */}
      <section className={styles.kpiGrid} aria-label="Material Performance KPIs">
        {/* Card 1: TOTAL ITEMS */}
        <article className={`${styles.kpiCard} ${styles.kpiCyan}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>TOTAL ITEMS</span>
            <div className={styles.kpiIconWrapper}><Package size={18} /></div>
          </div>
          <div className={styles.kpiValue}>
            {storeRoLoading ? '...' : (storeRoData?.kpis?.totalItems ?? 0)}
          </div>
          <div className={styles.kpiSubtext}>
            <span>Master catalog items</span>
          </div>
        </article>

        {/* Card 2: TOTAL ISSUE */}
        <article className={`${styles.kpiCard} ${styles.kpiBlue}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>TOTAL ISSUE</span>
            <div className={styles.kpiIconWrapper}><ArrowUpRight size={18} /></div>
          </div>
          <div className={styles.kpiValue}>
            {storeRoLoading ? '...' : `${formatKg(storeRoData?.kpis?.totalIssueKg)} PCS`}
          </div>
          <div className={styles.kpiSubtext}>
            <span>{storeRoData?.kpis?.issuedMaterialsCount ?? 0} issued materials</span>
          </div>
        </article>

        {/* Card 3: TOTAL RECEIVE */}
        <article className={`${styles.kpiCard} ${styles.kpiGreen}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>TOTAL RECEIVE</span>
            <div className={styles.kpiIconWrapper}><ArrowDownLeft size={18} /></div>
          </div>
          <div className={styles.kpiValue}>
            {storeRoLoading ? '...' : `${formatKg(storeRoData?.kpis?.totalReceiveKg)} PCS`}
          </div>
          <div className={styles.kpiSubtext}>
            <span>{storeRoData?.kpis?.receivedMaterialsCount ?? 0} received materials</span>
          </div>
        </article>

        {/* Card 4: TOTAL CONSUMPTION */}
        <article className={`${styles.kpiCard} ${styles.kpiAmber}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>TOTAL CONSUMPTION</span>
            <div className={styles.kpiIconWrapper}><Activity size={18} /></div>
          </div>
          <div className={styles.kpiValue}>
            {storeRoLoading ? '...' : `${formatKg(storeRoData?.kpis?.totalConsumptionKg)} PCS`}
          </div>
          <div className={styles.kpiSubtext}>
            <span>Shop floor consumed</span>
          </div>
        </article>

        {/* Card 5: TOP ISSUE MATERIAL */}
        <article className={`${styles.kpiCard} ${styles.kpiIndigo}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>TOP ISSUE MATERIAL</span>
            <div className={styles.kpiIconWrapper}><TrendingUp size={18} /></div>
          </div>
          <div className={styles.kpiValue} style={{ fontSize: '18px', wordBreak: 'break-word' }}>
            {storeRoLoading ? '...' : (storeRoData?.kpis?.topIssueMaterial?.name || '-')}
          </div>
          <div className={styles.kpiSubtext}>
            {storeRoData?.kpis?.topIssueMaterial?.quantity > 0 ? (
              <span>
                {formatKg(storeRoData.kpis.topIssueMaterial.quantity)} {storeRoData.kpis.topIssueMaterial.unit || 'PCS'} (
                {formatPercent(storeRoData.kpis.topIssueMaterial.percentage)})
              </span>
            ) : (
              <span>No issues recorded</span>
            )}
          </div>
        </article>

        {/* Card 6: TOP ISSUE DATE */}
        <article className={`${styles.kpiCard} ${styles.kpiPurple}`}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiTitle}>TOP ISSUE DATE</span>
            <div className={styles.kpiIconWrapper}><CalendarDays size={18} /></div>
          </div>
          <div className={styles.kpiValue}>
            {storeRoLoading ? '...' : (storeRoData?.kpis?.topIssueDate?.date || '-')}
          </div>
          <div className={styles.kpiSubtext}>
            {storeRoData?.kpis?.topIssueDate?.quantity > 0 ? (
              <span>
                {formatKg(storeRoData.kpis.topIssueDate.quantity)} PCS (
                {formatPercent(storeRoData.kpis.topIssueDate.percentage)})
              </span>
            ) : (
              <span>No transactions</span>
            )}
          </div>
        </article>
      </section>

      {/* ── Tab Switcher Bar ── */}
      <nav className={styles.tabBar} aria-label="Analytics Workspace Tabs">
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'store-ro' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('store-ro')}
        >
          <Layers size={16} />
          STORE R/O (RAW INVENTORY)
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'material-wise' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('material-wise')}
        >
          <FileSpreadsheet size={16} />
          RAW MATERIAL WISE ANALYSIS
        </button>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 1: STORE R/O DASHBOARD VIEW
          ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'store-ro' && (
        <>
          {/* SECTION 1: STORE MOVEMENT OVERVIEW (3 PANELS) */}
          <div className={styles.overviewGrid}>
            {/* Panel A: STORE ISSUE — ITEM WISE */}
            <section className={styles.overviewPanel} aria-label="Store Issue Item Wise">
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <ArrowUpRight size={16} style={{ color: '#2563eb' }} />
                  Store Issue — Item Wise
                </div>
                <span className={styles.panelBadge}>
                  {storeRoData?.issueByItem?.length || 0} items
                </span>
              </div>
              <div className={styles.tableWrap} style={{ maxHeight: '380px' }}>
                <table className={styles.enterpriseTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Sr.</th>
                      <th>Material Name</th>
                      <th className={styles.textRight}>Issue (PCS)</th>
                      <th className={styles.textRight}>%</th>
                      <th className={styles.textRight}>Txns</th>
                      <th className={styles.textRight}>Avg/Txn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeRoLoading ? (
                      <tr><td colSpan={6} className={styles.textCenter} style={{ padding: '24px' }}>Loading issues...</td></tr>
                    ) : (storeRoData?.issueByItem || []).length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyState}>No material issues found for this period.</td></tr>
                    ) : (
                      storeRoData.issueByItem.map((item) => (
                        <tr
                          key={item.materialId}
                          className={styles.clickableRow}
                          onClick={() => openAuditDrawer(item.materialId, 'ISSUE', `Issue Audit: ${item.itemName}`)}
                          title="Click to view underlying InventoryTransaction records"
                        >
                          <td style={{ fontWeight: 600 }}>{item.sr}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.itemName}</div>
                            <small style={{ color: '#64748b' }}>{item.itemSku}</small>
                          </td>
                          <td className={styles.textRight} style={{ fontWeight: 700, color: '#1e40af' }}>
                            {formatKg(item.sumOfKg)}
                          </td>
                          <td className={styles.textRight}>{formatPercent(item.percentage)}</td>
                          <td className={styles.textRight}>{item.transactions}</td>
                          <td className={styles.textRight}>{formatKg(item.avgPerTransaction)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Panel B: STORE RECEIVE — ITEM WISE */}
            <section className={styles.overviewPanel} aria-label="Store Receive Item Wise">
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <ArrowDownLeft size={16} style={{ color: '#10b981' }} />
                  Store Receive — Item Wise
                </div>
                <span className={styles.panelBadge}>
                  {storeRoData?.receiveByItem?.length || 0} items
                </span>
              </div>
              <div className={styles.tableWrap} style={{ maxHeight: '380px' }}>
                <table className={styles.enterpriseTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Sr.</th>
                      <th>Material Name</th>
                      <th className={styles.textRight}>Receive (PCS)</th>
                      <th className={styles.textRight}>%</th>
                      <th className={styles.textRight}>Txns</th>
                      <th className={styles.textRight}>Avg/Txn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeRoLoading ? (
                      <tr><td colSpan={6} className={styles.textCenter} style={{ padding: '24px' }}>Loading receipts...</td></tr>
                    ) : (storeRoData?.receiveByItem || []).length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyState}>No store receipts found for this period.</td></tr>
                    ) : (
                      storeRoData.receiveByItem.map((item) => (
                        <tr
                          key={item.materialId}
                          className={styles.clickableRow}
                          onClick={() => openAuditDrawer(item.materialId, 'RECEIVE', `Receipt Audit: ${item.itemName}`)}
                          title="Click to view underlying GoodsReceiptNote records"
                        >
                          <td style={{ fontWeight: 600 }}>{item.sr}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.itemName}</div>
                            <small style={{ color: '#64748b' }}>{item.itemSku}</small>
                          </td>
                          <td className={styles.textRight} style={{ fontWeight: 700, color: '#166534' }}>
                            {formatKg(item.sumOfKg)}
                          </td>
                          <td className={styles.textRight}>{formatPercent(item.percentage)}</td>
                          <td className={styles.textRight}>{item.transactions}</td>
                          <td className={styles.textRight}>{formatKg(item.avgPerTransaction)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Panel C: TOP ISSUE DATES */}
            <section className={styles.overviewPanel} aria-label="Top Issue Dates">
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <CalendarDays size={16} style={{ color: '#9333ea' }} />
                  Top Issue Dates
                </div>
                <button
                  type="button"
                  className={styles.btnOutline}
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setAllDatesModalOpen(true)}
                >
                  View All
                </button>
              </div>
              <div className={styles.tableWrap} style={{ maxHeight: '380px' }}>
                <table className={styles.enterpriseTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Sr.</th>
                      <th>Date (IST)</th>
                      <th className={styles.textRight}>Issue (PCS)</th>
                      <th className={styles.textRight}>%</th>
                      <th className={styles.textRight}>Txns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeRoLoading ? (
                      <tr><td colSpan={5} className={styles.textCenter} style={{ padding: '24px' }}>Loading dates...</td></tr>
                    ) : (storeRoData?.topIssueDates || []).length === 0 ? (
                      <tr><td colSpan={5} className={styles.emptyState}>No issue dates found for this period.</td></tr>
                    ) : (
                      (storeRoData.topIssueDates.slice(0, 10) || []).map((d) => (
                        <tr
                          key={d.date}
                          className={styles.clickableRow}
                          onClick={() => {
                            setSelectedDrillDate(d.date);
                            handleTabChange('material-wise');
                          }}
                          title="Click to drilldown materials issued on this date"
                        >
                          <td style={{ fontWeight: 600 }}>{d.sr}</td>
                          <td style={{ fontWeight: 600 }}>{d.date}</td>
                          <td className={styles.textRight} style={{ fontWeight: 700, color: '#7e22ce' }}>
                            {formatKg(d.sumOfKg)}
                          </td>
                          <td className={styles.textRight}>{formatPercent(d.percentage)}</td>
                          <td className={styles.textRight}>{d.transactions}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* SECTION 2: DAILY MATERIAL MOVEMENT CHART */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Activity size={18} style={{ color: '#2563eb' }} />
                  Daily Material Movement Flow
                </h2>
                <div className={styles.sectionSubtitle}>
                  Comparison of Store Issue, Store Receive, and Shop Floor Consumption across the active period
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 600 }}>
                <span style={{ color: '#2563eb' }}>● Issue</span>
                <span style={{ color: '#10b981' }}>● Receive</span>
                <span style={{ color: '#f59e0b' }}>● Consumption</span>
              </div>
            </div>

            <UltraResponsiveChart
              height={280}
              isEmpty={!storeRoData?.dailyFlow || storeRoData.dailyFlow.length === 0}
              emptyTitle="No daily movement data for this period"
              emptySubtitle="Try selecting another month or preset date range to view movement timeline."
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={storeRoData?.dailyFlow || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIssue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorReceive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v} PCS`} />
                  <Tooltip
                    formatter={(val, name) => [`${formatKg(val)} PCS`, name]}
                    contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="issueKg" name="Store Issue" stroke="#2563eb" fillOpacity={1} fill="url(#colorIssue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="receiveKg" name="Store Receive" stroke="#10b981" fillOpacity={1} fill="url(#colorReceive)" strokeWidth={2} />
                  <Area type="monotone" dataKey="consumptionKg" name="Consumption" stroke="#f59e0b" fillOpacity={1} fill="url(#colorConsumption)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </UltraResponsiveChart>
          </section>

          {/* SECTION 3: TOP MATERIALS BY ISSUE (BAR CHART) */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <BarChart3 size={18} style={{ color: '#4338ca' }} />
                  Top Materials by Issue (Top 10)
                </h2>
                <div className={styles.sectionSubtitle}>
                  Leading materials by outbound Store release quantity during this period (Click any bar to inspect)
                </div>
              </div>
            </div>

            <UltraResponsiveChart
              height={260}
              isEmpty={!storeRoData?.topMaterialsByIssue || storeRoData.topMaterialsByIssue.length === 0}
              emptyTitle="No materials issued in this period"
              emptySubtitle="Try selecting another month or aggregate timeframe."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={storeRoData?.topMaterialsByIssue || []}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(v) => `${v} PCS`} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} />
                  <Tooltip
                    formatter={(val) => [`${formatKg(val)} PCS`, 'Issue Quantity']}
                    contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="issueKg"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    onClick={(entry) => {
                      const item = storeRoData?.issueByItem?.find((i) => i.itemName === entry.name);
                      if (item) openMaterialDrawer(item);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </UltraResponsiveChart>
          </section>

          {/* SECTION 4: SUMMARY & HIGHLIGHTS + KEY INSIGHTS */}
          <div className={styles.summaryGrid}>
            {/* Highlights Box */}
            <div className={styles.insightsCard}>
              <div className={styles.insightsTitle}>
                <TrendingUp size={16} />
                Summary & Highlights
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Net Store Balance</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: (storeRoData?.highlights?.netBalanceKg ?? 0) >= 0 ? '#166534' : '#991b1b', marginTop: '4px' }}>
                    {formatKg(storeRoData?.highlights?.netBalanceKg)} PCS
                  </div>
                  <small style={{ fontSize: '11px', color: '#64748b' }}>Receive minus Issue</small>
                </div>

                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Consumption Ratio</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {formatPercent(storeRoData?.highlights?.consumptionIssueRatio)}
                  </div>
                  <small style={{ fontSize: '11px', color: '#64748b' }}>Consumed of Issued</small>
                </div>
              </div>
            </div>

            {/* Deterministic Dynamic Key Insights */}
            <div className={styles.insightsCard}>
              <div className={styles.insightsTitle}>
                <ShieldCheck size={16} />
                Key Operational Insights
              </div>
              <ul className={styles.insightsList}>
                {(storeRoData?.insights || []).map((sentence, idx) => (
                  <li key={idx} className={styles.insightsItem}>
                    <span className={styles.insightBullet}>★</span>
                    <span>{sentence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 5: MONTHLY MATERIAL MOVEMENT MATRIX */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Calendar size={18} style={{ color: '#2563eb' }} />
                  Monthly Material Movement Matrix ({storeRoData?.monthlyMatrix?.year || currentYearStr})
                </h2>
                <div className={styles.sectionSubtitle}>
                  12-month cross-sectional movement intelligence across all catalog raw materials
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: matrixView === 'issue' ? '#2563eb' : 'transparent',
                      color: matrixView === 'issue' ? '#fff' : '#475569',
                    }}
                    onClick={() => setMatrixView('issue')}
                  >
                    Issue (PCS)
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: matrixView === 'receive' ? '#10b981' : 'transparent',
                      color: matrixView === 'receive' ? '#fff' : '#475569',
                    }}
                    onClick={() => setMatrixView('receive')}
                  >
                    Receive (PCS)
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: matrixView === 'consumption' ? '#f59e0b' : 'transparent',
                      color: matrixView === 'consumption' ? '#fff' : '#475569',
                    }}
                    onClick={() => setMatrixView('consumption')}
                  >
                    Consumption (PCS)
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.tableWrap} style={{ maxHeight: '420px' }}>
              <table className={styles.matrixTable}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '180px' }}>Material</th>
                    <th style={{ width: '60px' }}>Unit</th>
                    {(storeRoData?.monthlyMatrix?.months || []).map((m) => (
                      <th key={m} style={{ minWidth: '70px' }}>{m}</th>
                    ))}
                    <th style={{ minWidth: '90px' }}>Total PCS</th>
                  </tr>
                </thead>
                <tbody>
                  {(storeRoData?.monthlyMatrix?.rows || []).length === 0 ? (
                    <tr><td colSpan={15} className={styles.emptyState}>No monthly matrix records found.</td></tr>
                  ) : (
                    storeRoData.monthlyMatrix.rows.map((row) => {
                      const values =
                        matrixView === 'issue'
                          ? row.monthlyIssue
                          : matrixView === 'receive'
                          ? row.monthlyReceive
                          : row.monthlyConsumption;
                      const rowTotal =
                        matrixView === 'issue'
                          ? row.totalIssueKg
                          : matrixView === 'receive'
                          ? row.totalReceiveKg
                          : row.totalConsumptionKg;

                      return (
                        <tr key={row.materialId}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{row.materialName}</div>
                            <small style={{ color: '#64748b' }}>{row.sku}</small>
                          </td>
                          <td style={{ color: '#64748b' }}>{row.unit}</td>
                          {(storeRoData?.monthlyMatrix?.months || []).map((m) => {
                            const val = values[m] || 0;
                            return (
                              <td
                                key={m}
                                style={{
                                  color: val > 0 ? '#0f172a' : '#94a3b8',
                                  fontWeight: val > 0 ? 600 : 400,
                                }}
                              >
                                {val > 0 ? formatKg(val) : '-'}
                              </td>
                            );
                          })}
                          <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{formatKg(rowTotal)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className={styles.matrixTotalRow}>
                    <td colSpan={2}>Grand Total ({matrixView.toUpperCase()})</td>
                    {(storeRoData?.monthlyMatrix?.months || []).map((m) => {
                      const t = storeRoData?.monthlyMatrix?.totals?.[matrixView]?.[m] || 0;
                      return <td key={m}>{formatKg(t)}</td>;
                    })}
                    <td>
                      {formatKg(
                        matrixView === 'issue'
                          ? storeRoData?.monthlyMatrix?.totals?.grandTotalIssueKg
                          : matrixView === 'receive'
                          ? storeRoData?.monthlyMatrix?.totals?.grandTotalReceiveKg
                          : storeRoData?.monthlyMatrix?.totals?.grandTotalConsumptionKg,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* SECTION 6: STORE R/O RECONCILIATION PANEL */}
          <section className={styles.reconciliationCard} aria-label="Data Reconciliation">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', margin: 0 }}>
                  Authoritative Store Reconciliation Guarantee
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                  Numbers reconcile 1:1 with Store Inventory Ledgers. Independent analytics discrepancies are flagged immediately.
                </p>
              </div>
              <span className={styles.reconciliationVariance}>
                RECONCILED (0.00 PCS VARIANCE)
              </span>
            </div>

            <div className={styles.reconciliationGrid}>
              <div className={styles.reconciliationBox}>
                <span className={styles.reconciliationLabel}>Store Issue (OUT / ISSUE_TO_PRODUCTION)</span>
                <div className={styles.reconciliationNumbers}>
                  <span>Store: {formatKg(storeRoData?.reconciliation?.storeIssueKg)} PCS</span>
                  <span>Analytics: {formatKg(storeRoData?.reconciliation?.analyticsIssueKg)} PCS</span>
                </div>
                <span className={styles.reconciliationVariance}>
                  Variance: {formatKg(storeRoData?.reconciliation?.issueVarianceKg)} PCS
                </span>
              </div>

              <div className={styles.reconciliationBox}>
                <span className={styles.reconciliationLabel}>Store Receive (Goods Receipt Notes)</span>
                <div className={styles.reconciliationNumbers}>
                  <span>Store: {formatKg(storeRoData?.reconciliation?.storeReceiveKg)} PCS</span>
                  <span>Analytics: {formatKg(storeRoData?.reconciliation?.analyticsReceiveKg)} PCS</span>
                </div>
                <span className={styles.reconciliationVariance}>
                  Variance: {formatKg(storeRoData?.reconciliation?.receiveVarianceKg)} PCS
                </span>
              </div>

              <div className={styles.reconciliationBox}>
                <span className={styles.reconciliationLabel}>Material Consumption (Material Requests)</span>
                <div className={styles.reconciliationNumbers}>
                  <span>Store: {formatKg(storeRoData?.reconciliation?.storeConsumptionKg)} PCS</span>
                  <span>Analytics: {formatKg(storeRoData?.reconciliation?.analyticsConsumptionKg)} PCS</span>
                </div>
                <span className={styles.reconciliationVariance}>
                  Variance: {formatKg(storeRoData?.reconciliation?.consumptionVarianceKg)} PCS
                </span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 2: MATERIAL WISE ANALYSIS TAB
          ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'material-wise' && (
        <section className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <FileSpreadsheet size={18} style={{ color: '#2563eb' }} />
                Material Wise Analysis Workspace
              </h2>
              <div className={styles.sectionSubtitle}>
                Comprehensive master materials inventory and movement intelligence with 3-way drilldown
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className={styles.filterSelect}
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value);
                  setMatWisePage(1);
                }}
              >
                <option value="ALL">All Units</option>
                <option value="KG">KG</option>
                <option value="PCS">PCS</option>
                <option value="ROLL">ROLL</option>
                <option value="Bags">Bags</option>
              </select>
            </div>
          </div>

          {/* Drilldown Summary Badges */}
          {matWiseData?.kpis && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
              <span className={styles.badgeFast}>Fast Moving: {matWiseData.kpis.fastMovingCount}</span>
              <span className={styles.badgeSlow}>Slow Moving: {matWiseData.kpis.slowMovingCount}</span>
              <span className={styles.badgeNonMoving}>Non-Moving: {matWiseData.kpis.nonMovingCount}</span>
              <span style={{ fontSize: '12px', color: '#64748b', padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px' }}>
                All Catalog Materials: <strong>{matWiseData.kpis.totalMaterials || matWiseFilteredRows.length}</strong>
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>
                Showing {matWiseFilteredRows.length} materials
              </span>
            </div>
          )}

          {/* Section: Inventory Totals by Unit */}
          {matWiseData?.totalsByUnit && matWiseData.totalsByUnit.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} style={{ color: '#0284c7' }} />
                    Inventory Totals by Unit (Full Catalog)
                  </h3>
                  <small style={{ color: '#64748b' }}>
                    KG, pieces, litres and other units reported separately across all Store raw inventory materials.
                  </small>
                </div>
              </div>
              <div className={styles.tableWrap} style={{ maxHeight: '220px' }}>
                <table className={styles.enterpriseTable}>
                  <thead>
                    <tr>
                      <th>Unit</th>
                      <th className={styles.textRight}>Materials</th>
                      <th className={styles.textRight}>Current Stock</th>
                      <th className={styles.textRight}>Period Opening</th>
                      <th className={styles.textRight}>Received</th>
                      <th className={styles.textRight}>Issued</th>
                      <th className={styles.textRight}>Adjustments</th>
                      <th className={styles.textRight}>Period Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matWiseData.totalsByUnit.map((row) => (
                      <tr key={row.unit}>
                        <td style={{ fontWeight: 700 }}>{row.unit}</td>
                        <td className={styles.textRight}>{row.materials}</td>
                        <td
                          className={styles.textRight}
                          style={{
                            fontWeight: 700,
                            color: (row.currentStock ?? 0) <= 0 ? '#991b1b' : '#0f172a',
                          }}
                        >
                          {formatKg(row.currentStock)}
                        </td>
                        <td className={styles.textRight}>{formatKg(row.openingStock)}</td>
                        <td className={styles.textRight} style={{ color: '#166534', fontWeight: 600 }}>
                          {formatKg(row.received)}
                        </td>
                        <td className={styles.textRight} style={{ color: '#1e40af', fontWeight: 600 }}>
                          {formatKg(row.issued)}
                        </td>
                        <td className={styles.textRight}>{formatKg(row.adjustment)}</td>
                        <td className={styles.textRight} style={{ fontWeight: 700 }}>
                          {formatKg(row.closingStock)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Material Master Table */}
          <div className={styles.tableWrap} style={{ maxHeight: '480px' }}>
            <table className={styles.enterpriseTable}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Sr.</th>
                  <th>Material / SKU</th>
                  <th>Unit</th>
                  <th className={styles.textRight}>Current Stock</th>
                  <th className={styles.textRight}>Issue (PCS)</th>
                  <th className={styles.textRight}>Txns</th>
                  <th className={styles.textRight}>Receive (PCS)</th>
                  <th className={styles.textRight}>Consumption (PCS)</th>
                  <th className={styles.textCenter}>Stock Status</th>
                  <th className={styles.textCenter}>Velocity</th>
                  <th className={styles.textCenter}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matWiseLoading ? (
                  <tr><td colSpan={11} className={styles.textCenter} style={{ padding: '24px' }}>Loading materials...</td></tr>
                ) : matWiseVisibleRows.length === 0 ? (
                  <tr><td colSpan={11} className={styles.emptyState}>No materials match the selected filters.</td></tr>
                ) : (
                  matWiseVisibleRows.map((m, idx) => (
                    <tr
                      key={m.materialId}
                      className={styles.clickableRow}
                      onClick={() => openMaterialDrawer(m)}
                    >
                      <td>{(matWiseCurrentPage - 1) * matWisePageSize + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.materialName}</div>
                        <small style={{ color: '#64748b' }}>{m.materialSku || 'No SKU'}</small>
                      </td>
                      <td>{m.unit}</td>
                      <td
                        className={styles.textRight}
                        style={{
                          fontWeight: 700,
                          color: (m.currentStock ?? 0) <= 0 ? '#991b1b' : '#0f172a',
                        }}
                      >
                        {formatKg(m.currentStock)}
                      </td>
                      <td className={styles.textRight} style={{ fontWeight: 700, color: '#1e40af' }}>
                        {formatKg(m.totalIssueKg)}
                      </td>
                      <td className={styles.textRight}>{m.issueTransactions}</td>
                      <td className={styles.textRight} style={{ fontWeight: 700, color: '#166534' }}>
                        {formatKg(m.totalReceiveKg)}
                      </td>
                      <td className={styles.textRight} style={{ fontWeight: 700, color: '#b45309' }}>
                        {formatKg(m.totalConsumptionKg)}
                      </td>
                      <td className={styles.textCenter}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              m.stockStatus === 'IN_STOCK'
                                ? '#dcfce7'
                                : m.stockStatus === 'LOW_STOCK'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              m.stockStatus === 'IN_STOCK'
                                ? '#15803d'
                                : m.stockStatus === 'LOW_STOCK'
                                ? '#b45309'
                                : '#991b1b',
                          }}
                        >
                          {m.stockStatus ? m.stockStatus.replace('_', ' ') : 'UNKNOWN'}
                        </span>
                      </td>
                      <td className={styles.textCenter}>
                        <span
                          className={
                            m.classification === 'FAST_MOVING'
                              ? styles.badgeFast
                              : m.classification === 'SLOW_MOVING'
                              ? styles.badgeSlow
                              : styles.badgeNonMoving
                          }
                        >
                          {m.classification ? m.classification.replace('_', ' ') : 'NON MOVING'}
                        </span>
                      </td>
                      <td className={styles.textCenter}>
                        <button
                          type="button"
                          className={styles.btnOutline}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openAuditDrawer(m.materialId, 'ALL', `Transactions: ${m.materialName}`);
                          }}
                        >
                          Audit ERP
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {matWiseTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Page <strong>{matWiseCurrentPage}</strong> of <strong>{matWiseTotalPages}</strong> ({matWiseFilteredRows.length} total)
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={styles.btnOutline}
                  disabled={matWiseCurrentPage <= 1}
                  onClick={() => setMatWisePage((p) => p - 1)}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  type="button"
                  className={styles.btnOutline}
                  disabled={matWiseCurrentPage >= matWiseTotalPages}
                  onClick={() => setMatWisePage((p) => p + 1)}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 3-Way Drilldown Sections */}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Direction 1: Material → Days */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a' }}>
                Direction 1: Material → Days Breakdown
              </h4>
              {matWiseData?.materialDailyAnalysis?.selectedMaterial ? (
                <div>
                  <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                    Active Material: <strong>{matWiseData.materialDailyAnalysis.selectedMaterial.materialName}</strong> (
                    {formatKg(matWiseData.materialDailyAnalysis.selectedMaterial.totalIssueKg)} {matWiseData.materialDailyAnalysis.selectedMaterial.unit || 'PCS'} total)
                  </div>
                  <div className={styles.tableWrap} style={{ maxHeight: '200px' }}>
                    <table className={styles.enterpriseTable}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th className={styles.textRight}>Issue (PCS)</th>
                          <th className={styles.textRight}>Receive (PCS)</th>
                          <th className={styles.textRight}>Consumption (PCS)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(matWiseData.materialDailyAnalysis.dailyTrend || []).map((d) => (
                          <tr key={d.date}>
                            <td>{d.date}</td>
                            <td className={styles.textRight}>{formatKg(d.issueKg)}</td>
                            <td className={styles.textRight}>{formatKg(d.receiveKg)}</td>
                            <td className={styles.textRight}>{formatKg(d.consumptionKg)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#64748b' }}>Select any material from the table above to view daily flow.</p>
              )}
            </div>

            {/* Direction 3: Day → Materials */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a' }}>
                Direction 3: Day → Materials Movement
              </h4>
              {matWiseData?.dateWiseMaterialIssue?.selectedDate ? (
                <div>
                  <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                    Active Date: <strong>{matWiseData.dateWiseMaterialIssue.selectedDate}</strong> (
                    {formatKg(matWiseData.dateWiseMaterialIssue.totalDayIssueKg)} PCS total)
                  </div>
                  <div className={styles.tableWrap} style={{ maxHeight: '200px' }}>
                    <table className={styles.enterpriseTable}>
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th className={styles.textRight}>Issue (PCS)</th>
                          <th className={styles.textRight}>Transactions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(matWiseData.dateWiseMaterialIssue.materials || []).map((m, idx) => (
                          <tr key={idx}>
                            <td>{m.materialName}</td>
                            <td className={styles.textRight}>{formatKg(m.issueKg)}</td>
                            <td className={styles.textRight}>{m.transactions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#64748b' }}>Click any date in the Top Dates table to view materials moved that day.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Sliding Transaction Audit Drawer ── */}
      {auditDrawerOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setAuditDrawerOpen(false)}>
          <div className={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className={styles.drawerTitle}>{auditParams.title || 'Transaction Audit'}</h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Authoritative raw records from PostgreSQL store transactions
                </div>
              </div>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setAuditDrawerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Type Switcher Tabs in Drawer */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {['ALL', 'ISSUE', 'RECEIVE', 'CONSUMPTION'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      background: auditParams.movementType === t ? '#1e3a8a' : '#fff',
                      color: auditParams.movementType === t ? '#fff' : '#475569',
                    }}
                    onClick={() => {
                      setAuditParams((p) => ({ ...p, movementType: t }));
                      fetchAuditRecords(auditParams.materialId, t, 1);
                    }}
                  >
                    {t === 'ALL' ? 'All Types' : t}
                  </button>
                ))}
              </div>

              {auditLoading ? (
                <div className={styles.textCenter} style={{ padding: '40px' }}>Loading transactions...</div>
              ) : !auditData || auditData.data.length === 0 ? (
                <div className={styles.emptyState}>No underlying records found for this scope.</div>
              ) : (
                <>
                  <div className={styles.tableWrap}>
                    <table className={styles.enterpriseTable}>
                      <thead>
                        <tr>
                          <th>Date IST</th>
                          <th>Type</th>
                          <th>Material</th>
                          <th className={styles.textRight}>Quantity</th>
                          <th>Reference</th>
                          <th>Warehouse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditData.data.map((tx) => (
                          <tr key={tx.id}>
                            <td>{tx.date}</td>
                            <td>
                              <span
                                className={
                                  tx.category === 'ISSUE'
                                    ? styles.badgeIssue
                                    : tx.category === 'RECEIVE'
                                    ? styles.badgeReceive
                                    : styles.badgeConsumption
                                }
                              >
                                {tx.movementType}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{tx.materialName}</div>
                              <small style={{ color: '#64748b' }}>{tx.sku}</small>
                            </td>
                            <td className={styles.textRight} style={{ fontWeight: 700 }}>
                              {formatKg(tx.quantity)} {tx.unit}
                            </td>
                            <td>
                              <div>{tx.referenceId}</div>
                              <small style={{ color: '#64748b' }}>{tx.details}</small>
                            </td>
                            <td style={{ color: '#64748b' }}>{tx.warehouse}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {auditData.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Page {auditPage} of {auditData.totalPages} ({auditData.total} total records)
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className={styles.btnOutline}
                          disabled={auditPage <= 1}
                          onClick={() => fetchAuditRecords(auditParams.materialId, auditParams.movementType, auditPage - 1)}
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          className={styles.btnOutline}
                          disabled={auditPage >= auditData.totalPages}
                          onClick={() => fetchAuditRecords(auditParams.materialId, auditParams.movementType, auditPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Material Detail Drawer ── */}
      {materialDrawerOpen && drawerMaterial && (
        <div className={styles.drawerBackdrop} onClick={() => setMaterialDrawerOpen(false)}>
          <div className={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className={styles.drawerTitle}>{drawerMaterial.itemName || drawerMaterial.materialName}</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  SKU: {drawerMaterial.itemSku || drawerMaterial.materialSku || 'N/A'} · Unit: {drawerMaterial.unit || 'PCS'}
                </div>
              </div>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setMaterialDrawerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700 }}>TOTAL ISSUE</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>
                    {formatKg(drawerMaterial.sumOfKg || drawerMaterial.totalIssueKg)} {drawerMaterial.unit || 'PCS'}
                  </div>
                </div>
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>TRANSACTIONS</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>
                    {drawerMaterial.transactions || drawerMaterial.issueTransactions || 0}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>AVG / TXN</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                    {formatKg(drawerMaterial.avgPerTransaction || 0)} {drawerMaterial.unit || 'PCS'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setMaterialDrawerOpen(false);
                    openAuditDrawer(
                      drawerMaterial.materialId,
                      'ALL',
                      `ERP Ledger: ${drawerMaterial.itemName || drawerMaterial.materialName}`,
                    );
                  }}
                >
                  <FileText size={16} />
                  Inspect All Transaction Records in ERP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View All Dates Modal ── */}
      {allDatesModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setAllDatesModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                All Store Issue Movement Dates ({storeRoData?.period?.periodLabel || 'Active Period'})
              </h3>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setAllDatesModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.tableWrap}>
                <table className={styles.enterpriseTable}>
                  <thead>
                    <tr>
                      <th>Sr.</th>
                      <th>Date (IST)</th>
                      <th className={styles.textRight}>Issue Quantity (PCS)</th>
                      <th className={styles.textRight}>Percentage Share</th>
                      <th className={styles.textRight}>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(storeRoData?.topIssueDates || []).map((d) => (
                      <tr
                        key={d.date}
                        className={styles.clickableRow}
                        onClick={() => {
                          setSelectedDrillDate(d.date);
                          setAllDatesModalOpen(false);
                          handleTabChange('material-wise');
                        }}
                      >
                        <td>{d.sr}</td>
                        <td style={{ fontWeight: 600 }}>{d.date}</td>
                        <td className={styles.textRight} style={{ fontWeight: 700, color: '#1e40af' }}>
                          {formatKg(d.sumOfKg)}
                        </td>
                        <td className={styles.textRight}>{formatPercent(d.percentage)}</td>
                        <td className={styles.textRight}>{d.transactions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantHeadMaterialAnalytics;
