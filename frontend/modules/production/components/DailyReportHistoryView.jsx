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
  FileDown,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  Send,
  Boxes,
  Package,
  Scale,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DailyReportHistoryView({ onNewReport, onEditReport, onViewReport }) {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

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

      const res = await backendFetch(`/api/backend/production/daily-reports?${params.toString()}`);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      
      {/* HEADER & TOP CONTROLS */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', margin: 0 }}>
            Daily Production Report History
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Filter, inspect, print, and audit historical daily production logs.
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
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          <button
            type="button"
            onClick={onNewReport}
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
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '10px' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Reports</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{total}</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '10px', borderRadius: '10px' }}>
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Covers Produced</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{historyStats.covers.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '10px', borderRadius: '10px' }}>
            <Boxes size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Frames Produced</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{historyStats.frames.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', padding: '10px', borderRadius: '10px' }}>
            <Scale size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Production Weight</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#7c3aed' }}>{historyStats.weight.toLocaleString()} kg</div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#6d28d9' }}>{historyStats.weightMT} MT</div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
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

        {/* Custom Date Range if preset is not preset */}
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
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
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
                        <span style={{ fontWeight: '800', fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: '13px' }}>
                          {report.reportNo}
                        </span>
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
                            title="View Printable Report"
                            onClick={() => onViewReport(report.id)}
                            style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#2563eb', cursor: 'pointer' }}
                          >
                            <Eye size={14} />
                          </button>

                          {(report.status === 'DRAFT' || report.status === 'REOPENED') && (
                            <button
                              type="button"
                              title="Edit Draft Report"
                              onClick={() => onEditReport(report.id)}
                              style={{ background: 'rgba(245, 158, 11, 0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#d97706', cursor: 'pointer' }}
                            >
                              <Edit size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            title="Print Report"
                            onClick={() => onViewReport(report.id)}
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
          borderTop: '1px solid var(--color-border)',
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

    </div>
  );
}
