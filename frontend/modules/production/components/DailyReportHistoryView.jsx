'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { backendFetch } from '../../../lib/backendFetch';
import Swal from 'sweetalert2';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Printer,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  Send,
  Boxes,
  Package,
  Scale,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  FileText,
  Download
} from 'lucide-react';

export default function DailyReportHistoryView({
  roleMode = 'PRODUCTION', // 'PRODUCTION' | 'DISPATCH' | 'PLANT_HEAD' | 'SUPER_ADMIN'
  isReadOnly = roleMode === 'PLANT_HEAD' || roleMode === 'SUPER_ADMIN',
  isDispatch = roleMode === 'DISPATCH',
  dispatchType = 'DISPATCH_1',
  title,
  subtitle,
  onNewReport,
  onEditReport,
  onViewReport
}) {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  const baseApiUrl = useMemo(() => {
    if (!isDispatch) {
      return '/api/backend/production/daily-reports';
    }
    return dispatchType === 'DISPATCH_1'
      ? '/api/backend/dispatch/daily-reports'
      : '/api/backend/dispatch-2/daily-reports';
  }, [isDispatch, dispatchType]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Detail View
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [loadingModalDetail, setLoadingModalDetail] = useState(false);

  // Filters
  const [preset, setPreset] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));

      if (preset !== 'All') params.set('preset', preset);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (shiftFilter !== 'All') params.set('shift', shiftFilter);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await backendFetch(`${baseApiUrl}?${params.toString()}`);
      if (res) {
        setReports(res.items || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('[DailyReportHistory] Error loading history:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, preset, startDate, endDate, shiftFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const openReportModal = async (reportId) => {
    try {
      setLoadingModalDetail(true);
      const data = await backendFetch(`${baseApiUrl}/${reportId}`);
      setSelectedReportModal(data);
    } catch (err) {
      console.error('[DailyReportHistory] Error opening detail modal:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to load report details'
      });
    } finally {
      setLoadingModalDetail(false);
    }
  };

  const handleExportCSV = () => {
    if (!reports || reports.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data to Export',
        text: 'There are no daily production reports to export.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const headers = [
      'Report No',
      'Date',
      'Shift',
      'Supervisor',
      'Status',
      'Covers Produced',
      'Frames Produced',
      'Total Sets',
      'Total Weight (KG)',
      'Total Weight (MT)',
      'Remarks'
    ];

    const csvRows = reports.map(r => {
      const w = Number(r.totalWeight || 0);
      return [
        `"${r.reportNo || r.id || ''}"`,
        `"${r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-GB') : ''}"`,
        `"${r.shift || ''}"`,
        `"${r.shiftSupervisorName || r.supervisorName || ''}"`,
        `"${r.status || 'DRAFT'}"`,
        r.totalCovers || 0,
        r.totalFrames || 0,
        r.totalSets || 0,
        w.toFixed(2),
        (w / 1000).toFixed(3),
        `"${(r.remarks || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Production_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aggregate stats across current page/view
  const historyStats = useMemo(() => {
    let covers = 0;
    let frames = 0;
    let sets = 0;
    let weight = 0;

    reports.forEach(r => {
      covers += Number(r.totalCovers || 0);
      frames += Number(r.totalFrames || 0);
      sets += Number(r.totalSets || 0);
      weight += Number(r.totalWeight || 0);
    });

    return {
      covers,
      frames,
      sets,
      weight: Math.round(weight * 100) / 100,
      weightMT: (weight / 1000).toFixed(2)
    };
  }, [reports]);

  const handleCancelReport = async (reportId) => {
    const confirm = await Swal.fire({
      title: 'Cancel Daily Report?',
      text: 'This will reverse the associated stock changes. Stock cannot become negative.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Cancel Report',
      cancelButtonText: 'No, Keep Report'
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const res = await backendFetch(`${baseApiUrl}/${reportId}/cancel`, {
        method: 'POST'
      });
      if (res) {
        Swal.fire({
          icon: 'success',
          title: 'Report Cancelled',
          text: 'Stock changes reversed successfully.'
        });
        fetchHistory();
      }
    } catch (err) {
      console.error('[DailyReportHistory] Cancel Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: err.message || 'Unable to cancel report'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (st) => {
    let bg = 'rgba(100, 116, 139, 0.1)';
    let color = '#475569';
    let icon = <Clock size={12} />;

    if (st === 'DRAFT') {
      bg = 'rgba(245, 158, 11, 0.1)';
      color = '#d97706';
      icon = <Clock size={12} />;
    } else if (st === 'SUBMITTED') {
      bg = 'rgba(59, 130, 246, 0.1)';
      color = '#2563eb';
      icon = <Send size={12} />;
    } else if (st === 'APPROVED') {
      bg = 'rgba(16, 185, 129, 0.1)';
      color = '#059669';
      icon = <CheckCircle size={12} />;
    } else if (st === 'REOPENED') {
      bg = 'rgba(239, 68, 68, 0.1)';
      color = '#dc2626';
      icon = <RefreshCw size={12} />;
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '12px',
        background: bg,
        color: color,
        fontWeight: '800',
        fontSize: '11px',
        textTransform: 'uppercase'
      }}>
        {icon} {st}
      </span>
    );
  };

  const getHeaderTitle = () => {
    if (title) return title;
    if (roleMode === 'PLANT_HEAD') return 'Plant Head — Daily Production Reports (Read Only)';
    if (roleMode === 'SUPER_ADMIN') return 'Super Admin — Daily Production Reports (Read Only)';
    if (isDispatch || roleMode === 'DISPATCH') return 'Daily Dispatch Report History';
    return 'Daily Production Report History';
  };

  const getHeaderSubtitle = () => {
    if (subtitle) return subtitle;
    if (roleMode === 'PLANT_HEAD') return 'Read-only view of daily production output logs submitted by the production department.';
    if (roleMode === 'SUPER_ADMIN') return 'Read-only oversight & audit view of all daily production reports across all shifts.';
    if (isDispatch || roleMode === 'DISPATCH') return 'Filter, inspect, print, and audit historical daily dispatch logs.';
    return 'Filter, inspect, print, and audit historical daily production logs.';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      
      {/* HEADER & TOP CONTROLS */}
      <div style={{
        background: 'var(--color-bg-card, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-soft, 0 4px 6px -1px rgba(0,0,0,0.05))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary, #0f172a)', margin: 0 }}>
              {getHeaderTitle()}
            </h1>
            {isReadOnly && (
              <span style={{
                background: 'rgba(100, 116, 139, 0.1)',
                color: '#475569',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Lock size={12} /> Read Only
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', margin: '4px 0 0 0' }}>
            {getHeaderSubtitle()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid var(--color-border, #cbd5e1)',
              background: 'var(--color-bg-subtle, #f8fafc)',
              color: 'var(--color-text-primary, #0f172a)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid #10b981',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#059669',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={15} /> Export CSV
          </button>

          {!isReadOnly && (onNewReport || roleMode === 'PRODUCTION' || roleMode === 'DISPATCH') && (
            <button
              type="button"
              onClick={onNewReport || (() => { window.location.href = roleMode === 'DISPATCH' ? '/dispatch/daily-report' : '/production/daily-report'; })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(47, 67, 117, 0.25)'
              }}
            >
              <Plus size={16} /> Create Daily Report
            </button>
          )}
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div style={{ background: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '10px' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary, #64748b)', textTransform: 'uppercase' }}>Total Reports</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary, #0f172a)' }}>{total}</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '10px', borderRadius: '10px' }}>
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary, #64748b)', textTransform: 'uppercase' }}>{isDispatch ? 'Covers Dispatched' : 'Covers Produced'}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary, #0f172a)' }}>{historyStats.covers.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '10px', borderRadius: '10px' }}>
            <Boxes size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary, #64748b)', textTransform: 'uppercase' }}>{isDispatch ? 'Frames Dispatched' : 'Frames Produced'}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary, #0f172a)' }}>{historyStats.frames.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', padding: '10px', borderRadius: '10px' }}>
            <Scale size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary, #64748b)', textTransform: 'uppercase' }}>{isDispatch ? 'Dispatch Weight' : 'Production Weight'}</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#7c3aed' }}>{historyStats.weight.toLocaleString()} kg</div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#6d28d9' }}>{historyStats.weightMT} MT</div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{
        background: 'var(--color-bg-card, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
            {['All', 'Today', 'Yesterday', 'This Week', 'This Month'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPreset(p);
                  setPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: preset === p ? '#ffffff' : 'transparent',
                  color: preset === p ? '#0f172a' : '#64748b',
                  fontSize: '12px',
                  fontWeight: preset === p ? '800' : '600',
                  cursor: 'pointer',
                  boxShadow: preset === p ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => { setShiftFilter(e.target.value); setPage(1); }}
            className="form-select"
            style={{ margin: 0, fontSize: '13px', width: '140px' }}
          >
            <option value="All">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Night">Night</option>
            <option value="General">General</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-select"
            style={{ margin: 0, fontSize: '13px', width: '150px' }}
          >
            <option value="All">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REOPENED">REOPENED</option>
          </select>

          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Report No, Product Code, Name, Size..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: '100%', margin: 0, paddingLeft: '34px', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Custom Date Range if preset is All */}
        {preset === 'All' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
            <span style={{ fontWeight: '700', color: '#64748b' }}>Custom Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="form-input"
              style={{ margin: 0, width: '150px', fontSize: '12px' }}
            />
            <span style={{ color: '#94a3b8' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="form-input"
              style={{ margin: 0, width: '150px', fontSize: '12px' }}
            />
          </div>
        )}
      </div>

      {/* HISTORY TABLE */}
      <div style={{
        background: 'var(--color-bg-card, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-soft, 0 4px 6px -1px rgba(0,0,0,0.05))',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Report No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Shift</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Rows</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Covers</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Frames</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Sets</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Total Weight</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Created By</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Loading production history records...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No production reports found matching current filters.
                  </td>
                </tr>
              ) : (
                reports.map((report, idx) => {
                  const d = report.reportDate ? report.reportDate.split('T')[0] : '—';
                  const w = Number(report.totalWeight || 0);

                  return (
                    <tr
                      key={report.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      {/* Report No */}
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          type="button"
                          onClick={() => openReportModal(report.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                            color: 'var(--color-primary, #2563eb)',
                            fontSize: '13px',
                            textDecoration: 'underline'
                          }}
                        >
                          {report.reportNo}
                        </button>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#334155' }}>
                        {d}
                      </td>

                      {/* Shift */}
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>
                        {report.shift || 'Morning'}
                      </td>

                      {/* Rows */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>
                        {report.rowCount || report.items?.length || 0}
                      </td>

                      {/* Covers */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: '#2563eb' }}>
                        {Number(report.totalCovers || 0).toLocaleString()}
                      </td>

                      {/* Frames */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: '#d97706' }}>
                        {Number(report.totalFrames || 0).toLocaleString()}
                      </td>

                      {/* Sets */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                        {Number(report.totalSets || 0).toLocaleString()}
                      </td>

                      {/* Total Weight */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '900', color: '#7c3aed' }}>
                        {w.toLocaleString()} kg
                      </td>

                      {/* Created By */}
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>
                        {report.createdBy?.name || 'User'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {renderStatusBadge(report.status)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            title="Inspect Details (Read Only)"
                            onClick={() => openReportModal(report.id)}
                            style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#2563eb', cursor: 'pointer' }}
                          >
                            <Eye size={14} />
                          </button>

                          {!isReadOnly && (report.status === 'DRAFT' || report.status === 'REOPENED') && onEditReport && (
                            <button
                              type="button"
                              title="Edit Draft Report"
                              onClick={() => onEditReport(report.id)}
                              style={{ background: 'rgba(245, 158, 11, 0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#d97706', cursor: 'pointer' }}
                            >
                              <Edit size={14} />
                            </button>
                          )}

                          {!isReadOnly && (report.status === 'SUBMITTED' || report.status === 'APPROVED') && (
                            <button
                              type="button"
                              title="Cancel Report (Reverses Stock)"
                              onClick={() => handleCancelReport(report.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#dc2626', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            title="Print Report View"
                            onClick={() => {
                              if (onViewReport) onViewReport(report.id);
                              else openReportModal(report.id);
                            }}
                            style={{ background: 'rgba(100, 116, 139, 0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#475569', cursor: 'pointer' }}
                          >
                            <Printer size={14} />
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

        {/* PAGINATION FOOTER */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fafafa'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            Showing {reports.length} of {total} reports
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: page <= 1 ? '#cbd5e1' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: page >= totalPages ? '#cbd5e1' : '#334155',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* REPORT INSPECTION MODAL (READ ONLY) */}
      {selectedReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setSelectedReportModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: 'monospace' }}>
                    {selectedReportModal.reportNo}
                  </h2>
                  {renderStatusBadge(selectedReportModal.status)}
                  {isReadOnly && (
                    <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(100,116,139,0.1)', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                      Read Only View
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Date: <strong>{selectedReportModal.reportDate ? selectedReportModal.reportDate.split('T')[0] : '—'}</strong> | Shift: <strong>{selectedReportModal.shift}</strong> | Supervisor: <strong>{selectedReportModal.supervisorName || '—'}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Creator & Approver Audit Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '12.5px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Submitted By</span>
                  <strong style={{ color: '#0f172a' }}>{selectedReportModal.createdBy?.name || 'Operator'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Approved By</span>
                  <strong style={{ color: '#0f172a' }}>{selectedReportModal.approvedBy?.name || (selectedReportModal.status === 'APPROVED' ? 'Plant Head' : 'Pending Approval')}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Total Net Production Weight</span>
                  <strong style={{ color: '#7c3aed', fontSize: '14px' }}>{Number(selectedReportModal.totalWeight || 0).toLocaleString()} kg ({((selectedReportModal.totalWeight || 0)/1000).toFixed(2)} MT)</strong>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>Production Items Breakdown</h3>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#475569' }}>#</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Product / Details</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Size</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Type</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Covers</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Cover Wt</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Frames</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Frame Wt</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Sets</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#475569' }}>Total Wt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportModal.items && selectedReportModal.items.length > 0 ? (
                        selectedReportModal.items.map((it, idx) => (
                          <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0f172a' }}>
                              {it.product?.name || it.customProductName || 'Product'}
                              {it.remarks && <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>Note: {it.remarks}</div>}
                              {it.weightOverrideReason && <div style={{ fontSize: '11px', color: '#d97706', fontWeight: '600' }}>Override: {it.weightOverrideReason}</div>}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#334155' }}>{it.size || '—'}</td>
                            <td style={{ padding: '8px 12px', color: '#334155' }}>{it.type || '—'}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#2563eb' }}>{it.coverQty}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#334155' }}>{Number(it.coverWeight || 0).toFixed(1)} kg</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#d97706' }}>{it.frameQty}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#334155' }}>{Number(it.frameWeight || 0).toFixed(1)} kg</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>{it.setQty}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '800', color: '#7c3aed' }}>{Number(it.totalWeight || 0).toFixed(1)} kg</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No line items recorded</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => {
                  if (onViewReport) {
                    setSelectedReportModal(null);
                    onViewReport(selectedReportModal.id);
                  } else {
                    const basePath = roleMode === 'DISPATCH' ? '/dispatch' : '/production';
                    window.open(`${basePath}/daily-report/${selectedReportModal.id}`, '_blank');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} /> Printable Page
              </button>

              {!isReadOnly && (selectedReportModal.status === 'SUBMITTED' || selectedReportModal.status === 'APPROVED') && (
                <button
                  type="button"
                  onClick={() => {
                    handleCancelReport(selectedReportModal.id);
                    setSelectedReportModal(null);
                  }}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Report
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
