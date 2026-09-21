'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  TrendingUp,
  RotateCcw,
  Download,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Activity,
  Layers,
  BarChart3,
  HelpCircle,
  Eye,
  ChevronRight,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import UltraResponsiveChart from '../../../shared/components/UltraResponsiveChart';

export default function MaterialWiseAnalysisView() {
  // ── Filter State ──
  const [filterMode, setFilterMode] = useState('monthly'); // 'monthly' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState('8');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-08-31');

  // Search & Filter state
  const [materialSearch, setMaterialSearch] = useState('');
  const [movementFilter, setMovementFilter] = useState('ALL'); // 'ALL' | 'ISSUED' | 'FAST_MOVING' | 'SLOW_MOVING' | 'NON_MOVING' | 'HIGH_ISSUE' | 'LOW_ISSUE'
  const [sortBy, setSortBy] = useState('highest_issue');

  // Selected Drilldown items
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // Main Main Table Pagination
  const [tablePage, setTablePage] = useState(1);
  const pageSize = 15;

  // Data & Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);

  // Detail Modal & Paginated Audit History state
  const [selectedDetailMaterial, setSelectedDetailMaterial] = useState(null);
  const [modalHistoryPage, setModalHistoryPage] = useState(1);
  const [modalHistoryData, setModalHistoryData] = useState(null);
  const [modalHistoryLoading, setModalHistoryLoading] = useState(false);

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

  // ── Fetch Material Wise Analytics ──
  const fetchMaterialWise = useCallback(
    async (overrideParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const mode = overrideParams.filterMode || filterMode;
        const month = overrideParams.selectedMonth !== undefined ? overrideParams.selectedMonth : selectedMonth;
        const year = overrideParams.selectedYear !== undefined ? overrideParams.selectedYear : selectedYear;
        const start = overrideParams.customStart || customStart;
        const end = overrideParams.customEnd || customEnd;
        const matId = overrideParams.selectedMaterialId !== undefined ? overrideParams.selectedMaterialId : selectedMaterialId;
        const dStr = overrideParams.selectedDateStr !== undefined ? overrideParams.selectedDateStr : selectedDateStr;

        const params = new URLSearchParams();
        if (mode === 'monthly') {
          params.append('month', String(month));
          params.append('year', String(year));
        } else {
          params.append('filter', 'Custom');
          params.append('customStart', start);
          params.append('customEnd', end);
        }

        if (matId) params.append('materialId', matId);
        if (dStr) params.append('date', dStr);

        const res = await backendFetch(
          `/api/backend/plant-head/analytics/material-wise?${params.toString()}`,
        );

        if (res && typeof res === 'object') {
          setAnalyticsData(res);
          // Set initial drilldown selections if not already selected
          if (!selectedMaterialId && res.spotlights?.mostIssuedMaterial?.materialId) {
            setSelectedMaterialId(res.spotlights.mostIssuedMaterial.materialId);
          } else if (!selectedMaterialId && res.materials?.[0]?.materialId) {
            setSelectedMaterialId(res.materials[0].materialId);
          }
          if (!selectedDateStr && res.spotlights?.highestIssueDay?.date && res.spotlights.highestIssueDay.date !== '-') {
            setSelectedDateStr(res.spotlights.highestIssueDay.date);
          } else if (!selectedDateStr && res.dateWiseMaterialIssue?.availableDates?.[0]) {
            setSelectedDateStr(res.dateWiseMaterialIssue.availableDates[0]);
          }
        } else {
          throw new Error('Invalid response structure from material analytics API');
        }
      } catch (err) {
        console.error('Failed to fetch material-wise analytics:', err);
        setError(err?.message || 'Failed to load Material Wise Analytics.');
      } finally {
        setLoading(false);
      }
    },
    [filterMode, selectedMonth, selectedYear, customStart, customEnd, selectedMaterialId, selectedDateStr],
  );

  useEffect(() => {
    fetchMaterialWise();
  }, [fetchMaterialWise]);

  // ── Apply Filter ──
  const handleApplyFilter = () => {
    if (filterMode === 'custom') {
      if (!customStart || !customEnd) {
        alert('Please select both Start Date and End Date.');
        return;
      }
      if (new Date(customStart) > new Date(customEnd)) {
        alert('Start Date cannot be after End Date.');
        return;
      }
    }
    setTablePage(1);
    fetchMaterialWise({
      filterMode,
      selectedMonth,
      selectedYear,
      customStart,
      customEnd,
    });
  };

  // ── Reset ──
  const handleReset = () => {
    setFilterMode('monthly');
    setSelectedMonth('8');
    setSelectedYear('2026');
    setCustomStart('2026-08-01');
    setCustomEnd('2026-08-31');
    setMaterialSearch('');
    setMovementFilter('ALL');
    setSortBy('highest_issue');
    setTablePage(1);
    fetchMaterialWise({
      filterMode: 'monthly',
      selectedMonth: '8',
      selectedYear: '2026',
      customStart: '2026-08-01',
      customEnd: '2026-08-31',
      selectedMaterialId: '',
      selectedDateStr: '',
    });
  };

  // ── Material Selection Change for Drilldowns ──
  const handleSelectMaterial = (mId) => {
    setSelectedMaterialId(mId);
    fetchMaterialWise({ selectedMaterialId: mId });
  };

  // ── Date Selection Change for Day Breakdown ──
  const handleSelectDate = (dStr) => {
    setSelectedDateStr(dStr);
    fetchMaterialWise({ selectedDateStr: dStr });
  };

  // ── Fetch Paginated Material Transaction History ──
  const fetchModalHistory = useCallback(async (matId, page = 1) => {
    if (!matId) return;
    setModalHistoryLoading(true);
    try {
      const res = await backendFetch(
        `/api/backend/plant-head/analytics/material-wise/${matId}/transactions?page=${page}&pageSize=10`,
      );
      if (res && res.data) {
        setModalHistoryData(res);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setModalHistoryLoading(false);
    }
  }, []);

  const handleOpenDetailModal = (material) => {
    setSelectedDetailMaterial(material);
    setModalHistoryPage(1);
    fetchModalHistory(material.materialId, 1);
  };

  const handleCloseDetailModal = () => {
    setSelectedDetailMaterial(null);
    setModalHistoryData(null);
  };

  // ── Filtered and Sorted Main Material Table ──
  const filteredAndSortedMaterials = useMemo(() => {
    if (!analyticsData?.materials) return [];
    let list = [...analyticsData.materials];

    // 1. Text Search Filter (name or SKU)
    if (materialSearch.trim()) {
      const q = materialSearch.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.materialName.toLowerCase().includes(q) ||
          m.materialSku.toLowerCase().includes(q) ||
          (m.category && m.category.toLowerCase().includes(q)),
      );
    }

    // 2. Movement Status Filter
    if (movementFilter === 'ISSUED') {
      list = list.filter((m) => m.totalIssueKg > 0);
    } else if (movementFilter === 'FAST_MOVING') {
      list = list.filter((m) => m.movementClass === 'FAST_MOVING');
    } else if (movementFilter === 'SLOW_MOVING') {
      list = list.filter((m) => m.movementClass === 'SLOW_MOVING');
    } else if (movementFilter === 'NON_MOVING') {
      list = list.filter((m) => m.movementClass === 'NON_MOVING');
    } else if (movementFilter === 'HIGH_ISSUE') {
      list = list.filter((m) => m.percentageOfTotal >= 5);
    } else if (movementFilter === 'LOW_ISSUE') {
      list = list.filter((m) => m.totalIssueKg > 0 && m.percentageOfTotal < 5);
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === 'highest_issue') return b.totalIssueKg - a.totalIssueKg;
      if (sortBy === 'lowest_issue') return a.totalIssueKg - b.totalIssueKg;
      if (sortBy === 'most_transactions') return b.issueTransactions - a.issueTransactions;
      if (sortBy === 'most_days') return b.issueDays - a.issueDays;
      if (sortBy === 'least_days') return a.issueDays - b.issueDays;
      if (sortBy === 'highest_avg') return b.avgKgPerIssue - a.avgKgPerIssue;
      if (sortBy === 'name_asc') return a.materialName.localeCompare(b.materialName);
      if (sortBy === 'name_desc') return b.materialName.localeCompare(a.materialName);
      if (sortBy === 'last_issue_date') return b.lastIssueDate.localeCompare(a.lastIssueDate);
      if (sortBy === 'first_issue_date') return a.firstIssueDate.localeCompare(b.firstIssueDate);
      return b.totalIssueKg - a.totalIssueKg;
    });

    return list;
  }, [analyticsData?.materials, materialSearch, movementFilter, sortBy]);

  // Paginated slice
  const paginatedMaterials = useMemo(() => {
    const start = (tablePage - 1) * pageSize;
    return filteredAndSortedMaterials.slice(start, start + pageSize);
  }, [filteredAndSortedMaterials, tablePage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedMaterials.length / pageSize) || 1;

  // ── Export Main Material Table to CSV ──
  const handleExportCSV = () => {
    if (!filteredAndSortedMaterials.length) {
      alert('No material records available to export.');
      return;
    }
    const periodLabel = analyticsData?.period?.periodLabel || 'AUGUST_2026';
    let csv = '';
    csv += 'HIMALAYA MACHINERY ERP - MATERIAL WISE ISSUE & MOVEMENT REPORT\r\n';
    csv += `Period,"${periodLabel}"\r\n`;
    csv += `Generated At,"${new Date().toLocaleString('en-IN')}"\r\n`;
    csv += `Authoritative Source,"PostgreSQL InventoryTransaction (type=OUT, refType=ISSUE_TO_PRODUCTION)"\r\n\r\n`;

    csv += 'Sr,Material Name,Material SKU,Category,Movement Status,Movement Score,Total Issue (KG),Issue Transactions,Issue Days,Avg KG / Issue,Avg KG / Issue Day,First Issue Date,Last Issue Date,% of Total Issue\r\n';

    filteredAndSortedMaterials.forEach((row, idx) => {
      csv += `${idx + 1},"${(row.materialName || '').replace(/"/g, '""')}","${(row.materialSku || '').replace(/"/g, '""')}","${row.category || 'Raw Material'}",${row.movementClass},${row.movementScore},${row.totalIssueKg},${row.issueTransactions},${row.issueDays},${row.avgKgPerIssue},${row.avgKgPerIssueDay},"${row.firstIssueDate}","${row.lastIssueDate}",${row.percentageOfTotal}%\r\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanPeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Material_Wise_Analysis_${cleanPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  };

  const kpis = analyticsData?.kpis || {};
  const spotlights = analyticsData?.spotlights || {};
  const dailyAnalysis = analyticsData?.materialDailyAnalysis || {};
  const monthlyAnalysis = analyticsData?.materialMonthlyAnalysis || {};
  const dateWiseIssue = analyticsData?.dateWiseMaterialIssue || {};
  const matrix = analyticsData?.materialMonthlyMatrix || {};

  return (
    <div className="material-wise-container" style={styles.container}>
      {/* ── 1. HEADER BANNER ── */}
      <div style={styles.headerBanner}>
        <div style={styles.headerLeft}>
          <div style={styles.headerTitleRow}>
            <div style={styles.headerIconBox}>
              <Layers size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={styles.brandSubtext}>
                HIMALAYA MACHINERY ERP · PLANT HEAD MATERIAL PORTAL
              </div>
              <h1 style={styles.headerTitle}>
                MATERIAL WISE ANALYSIS –{' '}
                <span style={styles.titleHighlight}>
                  {analyticsData?.period?.periodLabel || 'AUGUST 2026'}
                </span>
              </h1>
              <p style={styles.headerTagline}>
                COMPLETE MATERIAL ISSUE, MOVEMENT & CONSUMPTION ANALYTICS
              </p>
            </div>
          </div>
        </div>

        <div style={styles.headerRightBadges}>
          <div style={styles.badgeChip}>
            <CheckCircle size={14} color="#10B981" />
            <span>Authoritative Store Issues</span>
          </div>
          <div style={styles.badgeChip}>
            <ShieldCheck size={14} color="#38BDF8" />
            <span>Zero Double Counting</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            style={styles.methodologyBtn}
            title="Inspect Movement Score & Percentile Classification Methodology"
          >
            <HelpCircle size={14} color="#8B5CF6" />
            <span>Classification Logic</span>
          </button>
        </div>
      </div>

      {/* ── METHODOLOGY EXPLANATION BANNER (TOGGLABLE) ── */}
      {showMethodology && (
        <div style={styles.methodologyCard}>
          <div style={styles.methodologyHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} color="#8B5CF6" />
              <strong>Movement Classification Methodology (Transparent &amp; Auditable)</strong>
            </div>
            <button
              type="button"
              onClick={() => setShowMethodology(false)}
              style={styles.closeBtn}
            >
              <X size={16} />
            </button>
          </div>
          <p style={styles.methodologyText}>
            <strong>Movement Score (0–100):</strong> Calculated as <code>40% Normalized Total Issue Quantity + 30% Normalized Issue Frequency + 30% Normalized Active Issue Days</code>. This prevents a single large one-time bulk transfer from artificially inflating a material to fast-moving without regular floor demand.
          </p>
          <div style={styles.methodologyGrid}>
            <div style={styles.methodologyPill}>
              <span style={styles.pillBadgeFast}>FAST MOVING</span>
              <span>Top 25th percentile of active materials based on actual issue activity and movement score.</span>
            </div>
            <div style={styles.methodologyPill}>
              <span style={styles.pillBadgeSlow}>SLOW MOVING</span>
              <span>Materials with active store issues during the period, but below the top quartile movement score.</span>
            </div>
            <div style={styles.methodologyPill}>
              <span style={styles.pillBadgeNon}>NON-MOVING</span>
              <span>Materials registered in the catalog with <strong>0 Store Issue KG</strong> during the selected period.</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. FILTER TOOLBAR ── */}
      <div style={styles.filterToolbar}>
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
              <Calendar size={14} />
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
              <Filter size={14} />
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
                    fetchMaterialWise({ selectedMonth: m, filterMode: 'monthly', selectedYear });
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
                    fetchMaterialWise({ selectedYear: y, filterMode: 'monthly', selectedMonth });
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
                <label style={styles.controlLabel}>From Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              <div style={styles.controlItem}>
                <label style={styles.controlLabel}>To Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
            </div>
          )}

          {/* Quick Search */}
          <div style={styles.searchGroup}>
            <label style={styles.controlLabel}>Search Material</label>
            <div style={styles.searchBox}>
              <Search size={14} color="#64748B" />
              <input
                type="text"
                placeholder="Search material name or SKU..."
                value={materialSearch}
                onChange={(e) => {
                  setMaterialSearch(e.target.value);
                  setTablePage(1);
                }}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Movement Status Filter */}
          <div style={styles.controlItem}>
            <label style={styles.controlLabel}>Movement Filter</label>
            <select
              value={movementFilter}
              onChange={(e) => {
                setMovementFilter(e.target.value);
                setTablePage(1);
              }}
              style={styles.selectInput}
            >
              <option value="ALL">All Materials</option>
              <option value="ISSUED">Issued Only (&gt; 0 KG)</option>
              <option value="FAST_MOVING">Fast Moving (Top 25%)</option>
              <option value="SLOW_MOVING">Slow Moving</option>
              <option value="NON_MOVING">Non-Moving (0 KG)</option>
              <option value="HIGH_ISSUE">High Issue (&ge; 5% Share)</option>
              <option value="LOW_ISSUE">Low Issue (&lt; 5% Share)</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={styles.controlItem}>
            <label style={styles.controlLabel}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setTablePage(1);
              }}
              style={styles.selectInput}
            >
              <option value="highest_issue">Highest Issue KG</option>
              <option value="lowest_issue">Lowest Issue KG</option>
              <option value="most_transactions">Most Transactions</option>
              <option value="most_days">Most Issue Days</option>
              <option value="least_days">Least Issue Days</option>
              <option value="highest_avg">Highest Avg KG/Issue</option>
              <option value="name_asc">Material Name A-Z</option>
              <option value="name_desc">Material Name Z-A</option>
              <option value="last_issue_date">Last Issue Date</option>
              <option value="first_issue_date">First Issue Date</option>
            </select>
          </div>

          {/* Actions */}
          <div style={styles.actionButtonsGroup}>
            <button
              type="button"
              id="mat-apply-filter-btn"
              onClick={handleApplyFilter}
              disabled={loading}
              style={styles.applyBtn}
            >
              <TrendingUp size={14} />
              {loading ? 'Refreshing...' : 'Apply Filter'}
            </button>
            <button
              type="button"
              id="mat-reset-filter-btn"
              onClick={handleReset}
              disabled={loading}
              style={styles.resetBtn}
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              type="button"
              id="mat-export-csv-btn"
              onClick={handleExportCSV}
              style={styles.exportBtn}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── ERROR DISPLAY ── */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} color="#EF4444" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 3. TOP 8 KPI CARDS ── */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>TOTAL MATERIALS</span>
            <Package size={18} color="#6366F1" />
          </div>
          <div style={styles.kpiValue}>{(kpis.totalMaterials || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Registered in Master</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>MATERIALS ISSUED</span>
            <TrendingUp size={18} color="#0284C7" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#0284C7' }}>
            {(kpis.materialsIssued || 0).toLocaleString()}
          </div>
          <div style={styles.kpiSub}>Active in period</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>FAST MOVING</span>
            <Flame size={18} color="#10B981" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#10B981' }}>
            {(kpis.fastMovingCount || 0).toLocaleString()}
          </div>
          <div style={styles.kpiSub}>Top 25% movement score</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>SLOW MOVING</span>
            <Clock size={18} color="#F59E0B" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#F59E0B' }}>
            {(kpis.slowMovingCount || 0).toLocaleString()}
          </div>
          <div style={styles.kpiSub}>Low frequency / quantity</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>NON-MOVING</span>
            <Layers size={18} color="#94A3B8" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#64748B' }}>
            {(kpis.nonMovingCount || 0).toLocaleString()}
          </div>
          <div style={styles.kpiSub}>0 KG issued in period</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>TOTAL ISSUE (KG)</span>
            <Sparkles size={18} color="#8B5CF6" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#8B5CF6' }}>
            {(kpis.totalIssueKg || 0).toLocaleString()} KG
          </div>
          <div style={styles.kpiSub}>Reconciles with Store R/O</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>ISSUE TRANSACTIONS</span>
            <Activity size={18} color="#EC4899" />
          </div>
          <div style={styles.kpiValue}>{(kpis.totalIssueTransactions || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Store issue vouchers</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>ISSUE DAYS</span>
            <Calendar size={18} color="#14B8A6" />
          </div>
          <div style={styles.kpiValue}>{(kpis.totalIssueDays || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Distinct active dates</div>
        </div>
      </div>

      {/* ── 4. SPOTLIGHT HIGHLIGHTS CARDS ── */}
      <div style={styles.spotlightGrid}>
        <div style={styles.spotlightCard}>
          <div style={styles.spotlightHeader}>
            <Flame size={16} color="#10B981" />
            <span style={styles.spotlightTitle}>MOST ISSUED MATERIAL (WEIGHT)</span>
          </div>
          <div style={styles.spotlightMain}>
            <div style={styles.spotlightName}>{spotlights.mostIssuedMaterial?.name || '-'}</div>
            <div style={styles.spotlightSku}>SKU: {spotlights.mostIssuedMaterial?.sku || '-'}</div>
          </div>
          <div style={styles.spotlightMetrics}>
            <div>
              <span style={styles.metricSub}>Total Issued</span>
              <strong style={{ color: '#10B981', display: 'block', fontSize: '15px' }}>
                {(spotlights.mostIssuedMaterial?.quantityKg || 0).toLocaleString()} KG
              </strong>
            </div>
            <div>
              <span style={styles.metricSub}>Store Share</span>
              <strong style={{ color: '#0F172A', display: 'block', fontSize: '15px' }}>
                {spotlights.mostIssuedMaterial?.percentage || 0}%
              </strong>
            </div>
            <div>
              <span style={styles.metricSub}>Issue Days</span>
              <strong style={{ color: '#0F172A', display: 'block', fontSize: '15px' }}>
                {spotlights.mostIssuedMaterial?.issueDays || 0} Days
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.spotlightCard}>
          <div style={styles.spotlightHeader}>
            <Activity size={16} color="#0284C7" />
            <span style={styles.spotlightTitle}>MOST FREQUENTLY ISSUED (TRANSACTIONS)</span>
          </div>
          <div style={styles.spotlightMain}>
            <div style={styles.spotlightName}>{spotlights.mostFrequentlyIssuedMaterial?.name || '-'}</div>
            <div style={styles.spotlightSku}>SKU: {spotlights.mostFrequentlyIssuedMaterial?.sku || '-'}</div>
          </div>
          <div style={styles.spotlightMetrics}>
            <div>
              <span style={styles.metricSub}>Transactions</span>
              <strong style={{ color: '#0284C7', display: 'block', fontSize: '15px' }}>
                {spotlights.mostFrequentlyIssuedMaterial?.transactions || 0} Txns
              </strong>
            </div>
            <div>
              <span style={styles.metricSub}>Active Days</span>
              <strong style={{ color: '#0F172A', display: 'block', fontSize: '15px' }}>
                {spotlights.mostFrequentlyIssuedMaterial?.issueDays || 0} Days
              </strong>
            </div>
            <div>
              <span style={styles.metricSub}>Total Weight</span>
              <strong style={{ color: '#0F172A', display: 'block', fontSize: '15px' }}>
                {(spotlights.mostFrequentlyIssuedMaterial?.quantityKg || 0).toLocaleString()} KG
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.spotlightCard}>
          <div style={styles.spotlightHeader}>
            <Calendar size={16} color="#8B5CF6" />
            <span style={styles.spotlightTitle}>HIGHEST MATERIAL ISSUE DAY (PEAK DATE)</span>
          </div>
          <div style={styles.spotlightMain}>
            <div style={styles.spotlightName}>{spotlights.highestIssueDay?.date || '-'}</div>
            <div style={styles.spotlightSku}>{spotlights.highestIssueDay?.materialSummary || '-'}</div>
          </div>
          <div style={styles.spotlightMetrics}>
            <div>
              <span style={styles.metricSub}>Total Day Issue</span>
              <strong style={{ color: '#8B5CF6', display: 'block', fontSize: '15px' }}>
                {(spotlights.highestIssueDay?.quantityKg || 0).toLocaleString()} KG
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                if (spotlights.highestIssueDay?.date && spotlights.highestIssueDay.date !== '-') {
                  handleSelectDate(spotlights.highestIssueDay.date);
                }
              }}
              style={styles.inspectDateBtn}
            >
              <span>Inspect Date</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. MAIN MATERIAL TABLE: ALL MATERIALS COMPLETE ISSUE ANALYSIS ── */}
      <div style={styles.sectionCard}>
        <div style={styles.tableHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>ALL MATERIALS – COMPLETE ISSUE ANALYSIS</h2>
            <div style={styles.sectionSubtitle}>
              Authoritative catalog listing showing active dispatches, transactions, movement metrics, and non-moving items.
            </div>
          </div>

          <div style={styles.tableQuickFilterRow}>
            {[
              { key: 'ALL', label: `ALL (${analyticsData?.materials?.length || 0})` },
              { key: 'ISSUED', label: `ISSUED (${kpis.materialsIssued || 0})` },
              { key: 'FAST_MOVING', label: `FAST (${kpis.fastMovingCount || 0})` },
              { key: 'SLOW_MOVING', label: `SLOW (${kpis.slowMovingCount || 0})` },
              { key: 'NON_MOVING', label: `NON-MOVING (${kpis.nonMovingCount || 0})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMovementFilter(tab.key);
                  setTablePage(1);
                }}
                style={{
                  ...styles.quickFilterTab,
                  ...(movementFilter === tab.key ? styles.quickFilterTabActive : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Main Material Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>Sr</th>
                <th style={{ ...styles.th, minWidth: '220px' }}>Material Name</th>
                <th style={{ ...styles.th, width: '110px' }}>Material Code</th>
                <th style={{ ...styles.th, width: '140px', textAlign: 'center' }}>Movement</th>
                <th style={{ ...styles.th, width: '110px', textAlign: 'right' }}>Total Issue (KG)</th>
                <th style={{ ...styles.th, width: '80px', textAlign: 'center' }}>Txns</th>
                <th style={{ ...styles.th, width: '80px', textAlign: 'center' }}>Issue Days</th>
                <th style={{ ...styles.th, width: '100px', textAlign: 'right' }}>Avg KG/Issue</th>
                <th style={{ ...styles.th, width: '100px', textAlign: 'right' }}>Avg KG/Day</th>
                <th style={{ ...styles.th, width: '95px', textAlign: 'center' }}>First Issue</th>
                <th style={{ ...styles.th, width: '95px', textAlign: 'center' }}>Last Issue</th>
                <th style={{ ...styles.th, width: '80px', textAlign: 'right' }}>Share %</th>
                <th style={{ ...styles.th, width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMaterials.length === 0 ? (
                <tr>
                  <td colSpan={13} style={styles.emptyTableTd}>
                    No material records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedMaterials.map((row) => {
                  const isSelectedForDrilldown = row.materialId === selectedMaterialId;
                  return (
                    <tr
                      key={row.materialId}
                      style={{
                        ...styles.tr,
                        ...(isSelectedForDrilldown ? styles.trSelected : {}),
                      }}
                    >
                      <td style={{ ...styles.td, textAlign: 'center', fontWeight: '700' }}>
                        {row.sr}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.materialNameCell}>
                          <strong>{row.materialName}</strong>
                          <span style={styles.categoryPill}>{row.category || 'Raw Material'}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <code style={styles.skuBadge}>{row.materialSku || '-'}</code>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.movementBadgeContainer}>
                          {row.movementClass === 'FAST_MOVING' && (
                            <span style={styles.badgeFast}>FAST MOVING</span>
                          )}
                          {row.movementClass === 'SLOW_MOVING' && (
                            <span style={styles.badgeSlow}>SLOW MOVING</span>
                          )}
                          {row.movementClass === 'NON_MOVING' && (
                            <span style={styles.badgeNon}>NON-MOVING</span>
                          )}
                          {row.movementScore > 0 && (
                            <span style={styles.scorePill}>Score: {row.movementScore}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: row.totalIssueKg > 0 ? '#6D28D9' : '#94A3B8' }}>
                        {row.totalIssueKg.toLocaleString()} {row.unit}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center', fontWeight: '600' }}>
                        {row.issueTransactions}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center', fontWeight: '600' }}>
                        {row.issueDays}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {row.avgKgPerIssue.toLocaleString()}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {row.avgKgPerIssueDay.toLocaleString()}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center', fontSize: '11px' }}>
                        {row.firstIssueDate}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center', fontSize: '11px' }}>
                        {row.lastIssueDate}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>
                        {row.percentageOfTotal}%
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.tableActionBtns}>
                          <button
                            type="button"
                            onClick={() => handleSelectMaterial(row.materialId)}
                            style={{
                              ...styles.actionBtnSmall,
                              background: isSelectedForDrilldown ? '#0284C7' : '#F1F5F9',
                              color: isSelectedForDrilldown ? '#FFFFFF' : '#0F172A',
                            }}
                            title="Load daily and monthly drilldown charts for this material"
                          >
                            {isSelectedForDrilldown ? 'Active' : 'Drilldown'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(row)}
                            style={styles.actionBtnSmallView}
                            title="Open full material audit report and paginated transaction ledger"
                          >
                            <Eye size={12} />
                            <span>View</span>
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

        {/* Pagination Controls */}
        <div style={styles.paginationRow}>
          <div style={styles.paginationInfo}>
            Showing {(tablePage - 1) * pageSize + 1} to{' '}
            {Math.min(tablePage * pageSize, filteredAndSortedMaterials.length)} of{' '}
            {filteredAndSortedMaterials.length} materials
          </div>
          <div style={styles.paginationNav}>
            <button
              type="button"
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
              disabled={tablePage <= 1}
              style={styles.pageBtn}
            >
              Previous
            </button>
            <span style={styles.pageNumber}>
              Page {tablePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
              disabled={tablePage >= totalPages}
              style={styles.pageBtn}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── 6. DUAL-DIRECTION INTERACTIVE DRILLDOWNS ── */}
      <div style={styles.drilldownGrid}>
        {/* DIRECTION 1: Material → Days */}
        <div style={styles.sectionCard}>
          <div style={styles.drilldownHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#0284C7" />
              <div>
                <h3 style={styles.drilldownTitle}>MATERIAL DAILY ISSUE ANALYSIS (MATERIAL → DAYS)</h3>
                <div style={styles.drilldownSub}>
                  Selected: <strong>{dailyAnalysis.selectedMaterial?.materialName || 'None'}</strong>{' '}
                  ({dailyAnalysis.selectedMaterial?.materialSku || '-'})
                </div>
              </div>
            </div>

            {/* Quick Material Selector */}
            <select
              value={selectedMaterialId}
              onChange={(e) => handleSelectMaterial(e.target.value)}
              style={styles.materialSelectDropdown}
            >
              <option value="">-- Change Material --</option>
              {analyticsData?.materials?.map((m) => (
                <option key={m.materialId} value={m.materialId}>
                  {m.materialName} ({m.totalIssueKg.toLocaleString()} KG)
                </option>
              ))}
            </select>
          </div>

          {/* Daily Trend Chart */}
          <div style={styles.chartWrapper}>
            <UltraResponsiveChart
              height={260}
              isEmpty={!dailyAnalysis.dailyTrend?.length}
              emptyTitle="No daily issue transactions for this material"
              emptySubtitle="This material had 0 store issues recorded during the selected date range."
            >
              {({ width, height }) => (
                <BarChart width={width} height={height} data={dailyAnalysis.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val.toLocaleString()} KG`, 'Daily Issue']}
                    contentStyle={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '6px', fontSize: '11px' }}
                  />
                  <Bar dataKey="issueKg" fill="#0284C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </UltraResponsiveChart>
          </div>

          {/* Daily Table */}
          <div style={{ ...styles.tableContainer, maxHeight: '220px', overflowY: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Issue Date</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Issue Quantity (KG)</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Vouchers</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Cumulative (KG)</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>% of Material</th>
                </tr>
              </thead>
              <tbody>
                {!dailyAnalysis.dailyTrend?.length ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyTableTd}>No daily records.</td>
                  </tr>
                ) : (
                  dailyAnalysis.dailyTrend.map((row, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '700' }}>{row.date}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#0284C7' }}>
                        {row.issueKg.toLocaleString()} KG
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{row.issueTransactions}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {row.cumulativeIssueKg.toLocaleString()} KG
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{row.percentageOfMaterialTotal}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DIRECTION 2: Material → Months */}
        <div style={styles.sectionCard}>
          <div style={styles.drilldownHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#8B5CF6" />
              <div>
                <h3 style={styles.drilldownTitle}>MATERIAL MONTHLY ANALYSIS (MATERIAL → MONTHS)</h3>
                <div style={styles.drilldownSub}>
                  Selected Period: <strong>{(monthlyAnalysis.selectedPeriodTotalKg || 0).toLocaleString()} KG</strong> | 12-Month Total: <strong>{(monthlyAnalysis.historical12MonthTotalKg || 0).toLocaleString()} KG</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div style={styles.chartWrapper}>
            <UltraResponsiveChart
              height={260}
              isEmpty={!monthlyAnalysis.monthlyTrend?.some((m) => m.totalIssueKg > 0)}
              emptyTitle="No historical issue records over the past 12 months"
              emptySubtitle="This material has zero dispatches logged across all historical monthly periods."
            >
              {({ width, height }) => (
                <BarChart width={width} height={height} data={monthlyAnalysis.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="monthLabel" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val.toLocaleString()} KG`, 'Monthly Issue']}
                    contentStyle={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '6px', fontSize: '11px' }}
                  />
                  <Bar dataKey="totalIssueKg" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </UltraResponsiveChart>
          </div>

          {/* Monthly Table */}
          <div style={{ ...styles.tableContainer, maxHeight: '220px', overflowY: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Month</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Total Issue (KG)</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Txns</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Days</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>MoM Change</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Movement Status</th>
                </tr>
              </thead>
              <tbody>
                {!monthlyAnalysis.monthlyTrend?.length ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyTableTd}>No monthly records.</td>
                  </tr>
                ) : (
                  monthlyAnalysis.monthlyTrend.map((row, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '700' }}>{row.monthLabel}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#8B5CF6' }}>
                        {row.totalIssueKg.toLocaleString()} KG
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{row.issueTransactions}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{row.issueDays}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {row.percentageChangeVsPrev !== null ? (
                          <span style={{ color: row.percentageChangeVsPrev >= 0 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                            {row.percentageChangeVsPrev >= 0 ? '+' : ''}{row.percentageChangeVsPrev}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={row.movementStatus === 'NON-MOVING' ? styles.badgeNon : styles.badgeFast}>
                          {row.movementStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── DIRECTION 3: DAY → MATERIALS (DATE-WISE MATERIAL ISSUE) ── */}
      <div style={styles.sectionCard}>
        <div style={styles.drilldownHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#10B981" />
            <div>
              <h3 style={styles.drilldownTitle}>DATE-WISE MATERIAL ISSUE (DAY → MATERIALS)</h3>
              <div style={styles.drilldownSub}>
                Inspect all materials issued on date: <strong>{dateWiseIssue.selectedDate || '-'}</strong> | Total Day Issue: <strong>{(dateWiseIssue.totalDayIssueKg || 0).toLocaleString()} KG</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Select Date:</label>
            <select
              value={selectedDateStr}
              onChange={(e) => handleSelectDate(e.target.value)}
              style={styles.materialSelectDropdown}
            >
              <option value="">-- Choose Date --</option>
              {dateWiseIssue.availableDates?.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={{ ...styles.th, width: '60px', textAlign: 'center' }}>Rank</th>
                <th style={styles.th}>Material Description</th>
                <th style={{ ...styles.th, width: '130px' }}>Material SKU</th>
                <th style={{ ...styles.th, width: '130px', textAlign: 'right' }}>Issue Quantity (KG)</th>
                <th style={{ ...styles.th, width: '100px', textAlign: 'center' }}>Vouchers</th>
                <th style={{ ...styles.th, width: '110px', textAlign: 'right' }}>% of Day Total</th>
              </tr>
            </thead>
            <tbody>
              {!dateWiseIssue.materials?.length ? (
                <tr>
                  <td colSpan={6} style={styles.emptyTableTd}>
                    No store issues recorded for date {selectedDateStr || '(Select a date above)'}.
                  </td>
                </tr>
              ) : (
                dateWiseIssue.materials.map((row) => (
                  <tr key={row.materialId} style={styles.tr}>
                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: '800' }}>#{row.rank}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{row.materialName}</td>
                    <td style={styles.td}>
                      <code style={styles.skuBadge}>{row.materialSku || '-'}</code>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#10B981' }}>
                      {row.issueKg.toLocaleString()} {row.unit}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>{row.transactions}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>
                      {row.percentageOfDayTotal}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {dateWiseIssue.materials?.length > 0 && (
              <tfoot>
                <tr style={{ background: '#F8FAFC', fontWeight: '900' }}>
                  <td colSpan={3} style={{ ...styles.td, textAlign: 'right' }}>Day Total Issue:</td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#10B981' }}>
                    {(dateWiseIssue.totalDayIssueKg || 0).toLocaleString()} KG
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {dateWiseIssue.materials.reduce((acc, m) => acc + m.transactions, 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── 7. MATERIAL × MONTH ISSUE MATRIX ── */}
      <div style={styles.sectionCard}>
        <div style={styles.tableHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>MATERIAL × MONTH ISSUE MATRIX (ROLLING 6 MONTHS)</h2>
            <div style={styles.sectionSubtitle}>
              Comparative material issue volume (KG) across monthly accounting intervals with row and column reconciliations.
            </div>
          </div>
        </div>

        <div style={styles.matrixScrollContainer}>
          <table style={styles.matrixTable}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={{ ...styles.th, minWidth: '220px', position: 'sticky', left: 0, background: '#F1F5F9', zIndex: 2 }}>
                  Material Name
                </th>
                <th style={{ ...styles.th, width: '120px' }}>SKU</th>
                {matrix.months?.map((mLabel) => (
                  <th key={mLabel} style={{ ...styles.th, minWidth: '110px', textAlign: 'right' }}>
                    {mLabel}
                  </th>
                ))}
                <th style={{ ...styles.th, minWidth: '130px', textAlign: 'right', background: '#E2E8F0' }}>
                  Total (KG)
                </th>
              </tr>
            </thead>
            <tbody>
              {!matrix.rows?.length ? (
                <tr>
                  <td colSpan={(matrix.months?.length || 0) + 3} style={styles.emptyTableTd}>
                    No matrix data available.
                  </td>
                </tr>
              ) : (
                matrix.rows.map((row) => (
                  <tr key={row.materialId} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700', position: 'sticky', left: 0, background: '#FFFFFF', zIndex: 1 }}>
                      {row.materialName}
                    </td>
                    <td style={styles.td}>
                      <code style={styles.skuBadge}>{row.materialSku || '-'}</code>
                    </td>
                    {matrix.months?.map((mLabel) => (
                      <td key={mLabel} style={{ ...styles.td, textAlign: 'right' }}>
                        {(row.months?.[mLabel] || 0) > 0 ? (
                          <strong style={{ color: '#0F172A' }}>{row.months[mLabel].toLocaleString()}</strong>
                        ) : (
                          <span style={{ color: '#CBD5E1' }}>-</span>
                        )}
                      </td>
                    ))}
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#6D28D9', background: '#F8FAFC' }}>
                      {(row.totalIssueKg || 0).toLocaleString()} KG
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {matrix.rows?.length > 0 && (
              <tfoot>
                <tr style={{ background: '#F1F5F9', fontWeight: '900' }}>
                  <td colSpan={2} style={{ ...styles.td, textAlign: 'right', position: 'sticky', left: 0, background: '#F1F5F9', zIndex: 1 }}>
                    Monthly Grand Total:
                  </td>
                  {matrix.months?.map((mLabel) => (
                    <td key={mLabel} style={{ ...styles.td, textAlign: 'right', color: '#0F172A' }}>
                      {(matrix.columnTotals?.[mLabel] || 0).toLocaleString()} KG
                    </td>
                  ))}
                  <td style={{ ...styles.td, textAlign: 'right', color: '#6D28D9', background: '#E2E8F0' }}>
                    {(matrix.columnTotals?.grandTotalKg || 0).toLocaleString()} KG
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── 8. COMPLETE MATERIAL REPORT & AUDIT HISTORY MODAL ── */}
      {selectedDetailMaterial && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={20} color="#0284C7" />
                  <h3 style={styles.modalTitle}>{selectedDetailMaterial.materialName}</h3>
                </div>
                <div style={styles.modalSubtitle}>
                  Material SKU: <strong>{selectedDetailMaterial.materialSku || '-'}</strong> | Category: <strong>{selectedDetailMaterial.category || 'Raw Material'}</strong> | Unit: <strong>{selectedDetailMaterial.unit}</strong>
                </div>
              </div>
              <button type="button" onClick={handleCloseDetailModal} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Specs & Stock Grid */}
            <div style={styles.modalKpiGrid}>
              <div style={styles.modalKpiBox}>
                <span style={styles.modalKpiLabel}>Live Current Stock</span>
                <strong style={{ ...styles.modalKpiVal, color: '#10B981' }}>
                  {(selectedDetailMaterial.currentStock || 0).toLocaleString()} {selectedDetailMaterial.unit}
                </strong>
              </div>
              <div style={styles.modalKpiBox}>
                <span style={styles.modalKpiLabel}>Movement Class</span>
                <strong style={{ ...styles.modalKpiVal, color: '#6366F1' }}>
                  {selectedDetailMaterial.movementClass}
                </strong>
              </div>
              <div style={styles.modalKpiBox}>
                <span style={styles.modalKpiLabel}>Movement Score</span>
                <strong style={styles.modalKpiVal}>
                  {selectedDetailMaterial.movementScore || 0} / 100
                </strong>
              </div>
              <div style={styles.modalKpiBox}>
                <span style={styles.modalKpiLabel}>Period Total Issue</span>
                <strong style={{ ...styles.modalKpiVal, color: '#8B5CF6' }}>
                  {(selectedDetailMaterial.totalIssueKg || 0).toLocaleString()} KG
                </strong>
              </div>
              <div style={styles.modalKpiBox}>
                <span style={styles.modalKpiLabel}>Total Vouchers</span>
                <strong style={styles.modalKpiVal}>
                  {selectedDetailMaterial.issueTransactions || 0}
                </strong>
              </div>
              <div style={styles.modalKpiBox}>
                <span style={styles.modalKpiLabel}>Active Issue Days</span>
                <strong style={styles.modalKpiVal}>
                  {selectedDetailMaterial.issueDays || 0}
                </strong>
              </div>
            </div>

            {/* Paginated Issue Transaction History Table */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={styles.modalSectionTitle}>TRANSACTION-LEVEL STORE ISSUE AUDIT TRAIL</h4>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>Sr</th>
                      <th style={{ ...styles.th, width: '95px' }}>Date</th>
                      <th style={{ ...styles.th, width: '130px' }}>Timestamp (IST)</th>
                      <th style={{ ...styles.th, width: '110px', textAlign: 'right' }}>Issued Qty</th>
                      <th style={{ ...styles.th, width: '130px' }}>Reference Type</th>
                      <th style={{ ...styles.th, width: '140px' }}>Reference Doc ID</th>
                      <th style={styles.th}>Dispatched From</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalHistoryLoading ? (
                      <tr>
                        <td colSpan={7} style={styles.emptyTableTd}>Loading transactions from PostgreSQL ledger...</td>
                      </tr>
                    ) : !modalHistoryData?.data?.length ? (
                      <tr>
                        <td colSpan={7} style={styles.emptyTableTd}>No individual store issue vouchers logged for this material.</td>
                      </tr>
                    ) : (
                      modalHistoryData.data.map((tx) => (
                        <tr key={tx.id} style={styles.tr}>
                          <td style={{ ...styles.td, textAlign: 'center' }}>{tx.sr}</td>
                          <td style={{ ...styles.td, fontWeight: '700' }}>{tx.date}</td>
                          <td style={{ ...styles.td, fontSize: '11px', color: '#64748B' }}>{tx.dateTime}</td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#6D28D9' }}>
                            {tx.quantityKg.toLocaleString()} {tx.unit}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.refBadge}>{tx.referenceType}</span>
                          </td>
                          <td style={styles.td}>
                            <code>{tx.referenceNumber}</code>
                          </td>
                          <td style={styles.td}>{tx.warehouseName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Pagination */}
              {modalHistoryData?.totalPages > 1 && (
                <div style={styles.paginationRow}>
                  <div style={styles.paginationInfo}>
                    Page {modalHistoryData.page} of {modalHistoryData.totalPages} ({modalHistoryData.total} Total Vouchers)
                  </div>
                  <div style={styles.paginationNav}>
                    <button
                      type="button"
                      onClick={() => {
                        const newP = Math.max(1, modalHistoryPage - 1);
                        setModalHistoryPage(newP);
                        fetchModalHistory(selectedDetailMaterial.materialId, newP);
                      }}
                      disabled={modalHistoryPage <= 1 || modalHistoryLoading}
                      style={styles.pageBtn}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newP = Math.min(modalHistoryData.totalPages, modalHistoryPage + 1);
                        setModalHistoryPage(newP);
                        fetchModalHistory(selectedDetailMaterial.materialId, newP);
                      }}
                      disabled={modalHistoryPage >= modalHistoryData.totalPages || modalHistoryLoading}
                      style={styles.pageBtn}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Enterprise Style Definitions (Consistent with Himalaya Dark Navy & Clean Cards) ──
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    color: '#0F172A',
  },
  headerBanner: {
    background: 'linear-gradient(135deg, #0A192F 0%, #0D2240 50%, #17325C 100%)',
    borderRadius: '12px',
    padding: '18px 24px',
    color: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
  },
  brandSubtext: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: '0.08em',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '900',
    letterSpacing: '-0.02em',
    margin: '2px 0',
  },
  titleHighlight: {
    color: '#F59E0B',
  },
  headerTagline: {
    fontSize: '11px',
    color: '#94A3B8',
    margin: 0,
  },
  headerRightBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  badgeChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  methodologyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(139, 92, 246, 0.2)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#DDD6FE',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    cursor: 'pointer',
  },
  methodologyCard: {
    background: '#F8FAFC',
    border: '1.5px solid #CBD5E1',
    borderRadius: '10px',
    padding: '16px 20px',
  },
  methodologyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748B',
  },
  methodologyText: {
    fontSize: '12px',
    color: '#334155',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  methodologyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '10px',
  },
  methodologyPill: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '11px',
    color: '#475569',
  },
  pillBadgeFast: {
    alignSelf: 'flex-start',
    background: '#DCFCE7',
    color: '#15803D',
    fontWeight: '800',
    fontSize: '9.5px',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  pillBadgeSlow: {
    alignSelf: 'flex-start',
    background: '#FEF3C7',
    color: '#B45309',
    fontWeight: '800',
    fontSize: '9.5px',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  pillBadgeNon: {
    alignSelf: 'flex-start',
    background: '#F1F5F9',
    color: '#475569',
    fontWeight: '800',
    fontSize: '9.5px',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  filterToolbar: {
    background: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '12px',
  },
  modeTabs: {
    display: 'flex',
    background: '#F1F5F9',
    borderRadius: '6px',
    padding: '3px',
    gap: '2px',
  },
  modeTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#64748B',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modeTabActive: {
    background: '#0F172A',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterControlsGroup: {
    display: 'flex',
    gap: '10px',
  },
  controlItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  controlLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  selectInput: {
    height: '34px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0F172A',
    outline: 'none',
  },
  dateInput: {
    height: '34px',
    padding: '0 8px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '12px',
    color: '#0F172A',
  },
  searchGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '220px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '34px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '12px',
    color: '#0F172A',
    width: '100%',
  },
  actionButtonsGroup: {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',
  },
  applyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0F172A',
    color: '#FFFFFF',
    height: '34px',
    padding: '0 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F1F5F9',
    color: '#475569',
    height: '34px',
    padding: '0 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid #CBD5E1',
    cursor: 'pointer',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#047857',
    color: '#FFFFFF',
    height: '34px',
    padding: '0 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#FEF2F2',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    color: '#B91C1C',
    fontSize: '12.5px',
    fontWeight: '600',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
    gap: '12px',
  },
  kpiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px 14px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  kpiTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  kpiLabel: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: '0.04em',
  },
  kpiValue: {
    fontSize: '19px',
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: '-0.02em',
  },
  kpiSub: {
    fontSize: '9px',
    color: '#94A3B8',
    marginTop: '2px',
  },
  spotlightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '14px',
  },
  spotlightCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
  },
  spotlightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#475569',
    marginBottom: '10px',
  },
  spotlightTitle: {
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  spotlightMain: {
    marginBottom: '12px',
  },
  spotlightName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0F172A',
  },
  spotlightSku: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  spotlightMetrics: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid #F1F5F9',
  },
  metricSub: {
    fontSize: '9px',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  inspectDateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#F1F5F9',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#0F172A',
    cursor: 'pointer',
  },
  sectionCard: {
    background: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  tableHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.01em',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  tableQuickFilterRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  quickFilterTab: {
    padding: '5px 10px',
    borderRadius: '16px',
    fontSize: '10.5px',
    fontWeight: '700',
    background: '#F1F5F9',
    color: '#475569',
    border: '1px solid #CBD5E1',
    cursor: 'pointer',
  },
  quickFilterTabActive: {
    background: '#0F172A',
    color: '#FFFFFF',
    borderColor: '#0F172A',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11.5px',
  },
  theadRow: {
    background: '#F8FAFC',
    borderBottom: '2px solid #E2E8F0',
  },
  th: {
    padding: '9px 10px',
    fontWeight: '800',
    color: '#475569',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  trSelected: {
    background: '#EFF6FF',
  },
  td: {
    padding: '9px 10px',
    color: '#1E293B',
  },
  emptyTableTd: {
    padding: '24px',
    textAlign: 'center',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  materialNameCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  categoryPill: {
    fontSize: '9px',
    color: '#64748B',
  },
  skuBadge: {
    background: '#F1F5F9',
    padding: '2px 5px',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#334155',
  },
  movementBadgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  badgeFast: {
    background: '#DCFCE7',
    color: '#15803D',
    fontWeight: '800',
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '8px',
  },
  badgeSlow: {
    background: '#FEF3C7',
    color: '#B45309',
    fontWeight: '800',
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '8px',
  },
  badgeNon: {
    background: '#F1F5F9',
    color: '#64748B',
    fontWeight: '800',
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '8px',
  },
  scorePill: {
    fontSize: '8.5px',
    color: '#64748B',
  },
  tableActionBtns: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
  },
  actionBtnSmall: {
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  actionBtnSmallView: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    background: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#0F172A',
    cursor: 'pointer',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid #F1F5F9',
  },
  paginationInfo: {
    fontSize: '11px',
    color: '#64748B',
  },
  paginationNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pageBtn: {
    background: '#F1F5F9',
    border: '1px solid #CBD5E1',
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#0F172A',
    cursor: 'pointer',
  },
  pageNumber: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
  },
  drilldownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '16px',
  },
  drilldownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  drilldownTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  drilldownSub: {
    fontSize: '10.5px',
    color: '#64748B',
    marginTop: '2px',
  },
  materialSelectDropdown: {
    height: '30px',
    padding: '0 8px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '11px',
    fontWeight: '600',
    color: '#0F172A',
  },
  chartWrapper: {
    marginBottom: '12px',
  },
  matrixScrollContainer: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11.5px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalCard: {
    background: '#FFFFFF',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '14px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#0F172A',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '11.5px',
    color: '#64748B',
    marginTop: '4px',
  },
  modalKpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    marginTop: '16px',
  },
  modalKpiBox: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  modalKpiLabel: {
    fontSize: '9.5px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  modalKpiVal: {
    fontSize: '14px',
    fontWeight: '900',
    color: '#0F172A',
    display: 'block',
    marginTop: '2px',
  },
  modalSectionTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  refBadge: {
    background: '#F1F5F9',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9.5px',
    fontWeight: '700',
    color: '#475569',
  },
};
