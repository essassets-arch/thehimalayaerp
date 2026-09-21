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
  Layers,
  ChevronRight,
  Info,
  BarChart3,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const PlantHeadMaterialAnalytics = () => {
  // ── Filter State ──
  const [filterMode, setFilterMode] = useState('monthly'); // 'monthly' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState('8'); // August default
  const [selectedYear, setSelectedYear] = useState('2026');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-08-31');

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

  // ── CSV Export Functionality ──
  const handleExportCSV = () => {
    if (!analyticsData) return;
    const { kpis, issueByItem, receiveByItem, top10DatesConsumption, period } =
      analyticsData;

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

  const kpis = analyticsData?.kpis || {};
  const highlights = analyticsData?.highlights || {};
  const insights = analyticsData?.insights || [];
  const top10DatesConsumption = analyticsData?.top10DatesConsumption || [];
  const dailyFlow = analyticsData?.dailyFlow || [];

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
          <div style={styles.kpiValueMain}>
            {kpis.month || 'AUGUST 2026'}
          </div>
          <div style={styles.kpiFooter}>Reporting Period</div>
        </div>

        {/* KPI 2: Total Issue */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #8B5CF6' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOTAL ISSUE (KG)</span>
            <ArrowUpRight size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <div style={{ ...styles.kpiValueMain, color: '#6D28D9' }}>
            {(kpis.totalIssueKg || 0).toLocaleString()} <span style={styles.unitSpan}>KG</span>
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
            {(kpis.totalReceiveKg || 0).toLocaleString()} <span style={styles.unitSpan}>KG</span>
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
            {(kpis.topItemQty || 0).toLocaleString()} KG ({kpis.topItemPercentage || 0}%)
          </div>
        </div>

        {/* KPI 7: Top Issue Date */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #475569' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>TOP ISSUE DATE</span>
            <Clock size={18} style={{ color: '#475569' }} />
          </div>
          <div style={{ ...styles.kpiValueMain, fontSize: '18px', color: '#1E293B' }}>
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
                <h3 style={styles.cardTitleText}>STORE ISSUE (KG) – ITEM WISE</h3>
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
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
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
                  <td
                    colSpan={2}
                    style={{ ...styles.tdFoot, fontWeight: '800', color: '#1E1B4B' }}
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
                  <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '800' }}>
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
                <h3 style={styles.cardTitleText}>STORE RECEIVE (KG) – ITEM WISE</h3>
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
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
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
                  <td
                    colSpan={2}
                    style={{ ...styles.tdFoot, fontWeight: '800', color: '#064E3B' }}
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
                  <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '800' }}>
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
                <h3 style={styles.cardTitleText}>TOP 10 DATE – CONSUMPTION (KG)</h3>
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
            <strong>Note:</strong> Sourced from Shop Floor logged consumption (not
            finished product weights).
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
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td style={{ ...styles.td, fontWeight: '700', color: '#64748B' }}>
                        {row.sr || idx + 1}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#1E293B' }}>
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
                  <td
                    colSpan={2}
                    style={{ ...styles.tdFoot, fontWeight: '800', color: '#78350F' }}
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
                  <td style={{ ...styles.tdFoot, textAlign: 'right', fontWeight: '800' }}>
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
          7. MATERIAL FLOW VISUALIZATION (CHARTS)
      ───────────────────────────────────────────────────────────── */}
      {dailyFlow.length > 0 && (
        <div style={styles.chartContainer} className="no-print">
          <div style={styles.chartHeader}>
            <BarChart3 size={18} style={{ color: '#1E293B' }} />
            <div>
              <h4 style={styles.chartTitle}>DAILY MATERIAL FLOW LEDGER (KG)</h4>
              <span style={styles.chartSubtitle}>
                Side-by-side timeline of Issue, Receive, and Floor Consumption
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: '280px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                  }}
                />
                <Legend />
                <Bar dataKey="receiveKg" fill="#10B981" name="Received (KG)" />
                <Bar dataKey="issueKg" fill="#8B5CF6" name="Issued (KG)" />
                <Bar
                  dataKey="consumptionKg"
                  fill="#F59E0B"
                  name="Consumed (KG)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
          PRINT STYLES
      ───────────────────────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
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

// ── Complete Style Definitions ──
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#0F172A',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  headerBanner: {
    background: 'linear-gradient(135deg, #0A192F 0%, #0F2744 60%, #1E3A8A 100%)',
    borderRadius: '16px',
    padding: '24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
    color: '#fff',
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logoImg: {
    height: '52px',
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
  },
  companySubtext: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    color: '#93C5FD',
    textTransform: 'uppercase',
  },
  headerTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '900',
    letterSpacing: '-0.5px',
    color: '#FFFFFF',
  },
  titleHighlight: {
    color: '#FBBF24',
  },
  headerTagline: {
    margin: 0,
    fontSize: '12px',
    color: '#CBD5E1',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  headerBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  badgeChip: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '8px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterToolbar: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '16px 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  modeTabs: {
    display: 'flex',
    background: '#F1F5F9',
    padding: '4px',
    borderRadius: '10px',
    gap: '4px',
  },
  modeTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '13px',
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
    gap: '14px',
    flexWrap: 'wrap',
  },
  controlItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  controlLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  selectInput: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    outline: 'none',
    minWidth: '140px',
  },
  dateInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0F172A',
    outline: 'none',
  },
  actionButtonsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  applyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0F172A',
    color: '#FFFFFF',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '8px',
    fontSize: '13px',
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
    padding: '9px 14px',
    borderRadius: '8px',
    fontSize: '13px',
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
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '13px',
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
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  errorBanner: {
    background: '#FEE2E2',
    border: '1px solid #F87171',
    borderRadius: '12px',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '16px 18px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: '0.5px',
  },
  kpiValueMain: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: '1.2',
  },
  unitSpan: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748B',
  },
  kpiFooter: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600',
  },
  analyticalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px',
  },
  tableCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  tableCardHeader: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#FFFFFF',
  },
  cardHeaderTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardTitleText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '0.3px',
  },
  cardSubtitleText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  countBadge: {
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '800',
  },
  tableSearchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
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
    maxHeight: '440px',
    overflowY: 'auto',
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    background: '#F1F5F9',
    padding: '10px 14px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    borderBottom: '1px solid #E2E8F0',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: '10px 14px',
    borderBottom: '1px solid #F1F5F9',
  },
  trEven: {
    background: '#FFFFFF',
  },
  trOdd: {
    background: '#FAFAFA',
  },
  emptyCell: {
    padding: '36px 20px',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '13px',
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
    padding: '12px 14px',
  },
  pctCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  pctText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
  },
  pctTrack: {
    width: '50px',
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
    padding: '20px 24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
  },
  highlightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  highlightsTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: '0.5px',
  },
  highlightsSubtitle: {
    fontSize: '12px',
    color: '#64748B',
  },
  highlightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  highlightTile: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  highlightTileLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  highlightTileValue: {
    fontSize: '20px',
    fontWeight: '900',
  },
  highlightTileDesc: {
    fontSize: '11px',
    color: '#64748B',
  },
  insightsBanner: {
    background: 'linear-gradient(135deg, #0A192F 0%, #0F172A 100%)',
    borderRadius: '14px',
    padding: '22px 28px',
    color: '#F8FAFC',
    border: '1px solid #1E293B',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  insightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  insightsTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: '1px',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  insightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#CBD5E1',
  },
  chartContainer: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '20px 24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  chartTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '800',
    color: '#0F172A',
  },
  chartSubtitle: {
    fontSize: '11px',
    color: '#64748B',
  },
  printFooterBlock: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '2px solid #000',
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
