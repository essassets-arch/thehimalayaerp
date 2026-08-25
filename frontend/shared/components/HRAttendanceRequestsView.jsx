import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../../lib/apiClient';
import StatusBadge from './StatusBadge';
import {
  Calendar, CheckCircle, XCircle, RefreshCw,
  Search, Clock, FileText, Inbox
} from 'lucide-react';
import Swal from 'sweetalert2';

/* ─── Style helpers ───────────────────────────────────────────────── */
const S = {
  root: { display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '24px 28px', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  headerTitle: { fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.3px' },
  headerSub: { fontSize: '13px', color: '#94a3b8', margin: '4px 0 0', fontWeight: 600 },
  syncBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', borderRadius: '10px', padding: '9px 18px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.2s' },
  statsRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  statChip: (accent) => ({ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: `1px solid ${accent}28`, borderLeft: `4px solid ${accent}`, borderRadius: '10px', padding: '12px 16px', flex: '1 1 140px', minWidth: '130px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }),
  statLabel: { fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  statValue: (accent) => ({ fontSize: '24px', fontWeight: 900, color: accent, lineHeight: 1 }),
  tabBar: { display: 'flex', gap: '4px', borderBottom: '2px solid #f1f5f9', overflowX: 'auto', WebkitOverflowScrolling: 'touch', minWidth: 0 },
  tab: (active) => ({ padding: '11px 22px', border: 'none', background: 'transparent', borderBottom: active ? '2px solid #0284c7' : '2px solid transparent', color: active ? '#0284c7' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontSize: '13.5px', marginBottom: '-2px', whiteSpace: 'nowrap', flexShrink: 0 }),
  toolbar: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', minWidth: '160px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', flex: 1, color: '#1e293b', minWidth: 0 },
  filterSelect: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 600, outline: 'none' },
  tableWrap: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', maxWidth: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  table: { width: '100%', minWidth: '760px', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' },
  thRight: { padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' },
  tr: (i) => ({ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc', transition: 'background 0.15s' }),
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  tdRight: { padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' },
  empAvatar: { width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  empName: { fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0 },
  empMeta: { fontSize: '11.5px', color: '#64748b', margin: '2px 0 0', fontWeight: 600 },
  dateChip: { display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#0369a1', fontWeight: 700 },
  reasonText: { fontSize: '12.5px', color: '#475569', maxWidth: '240px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 },
  remarksCell: { fontSize: '12px', color: '#64748b', fontStyle: 'italic', borderLeft: '3px solid #cbd5e1', paddingLeft: '10px', maxWidth: '200px', margin: 0 },
  actionsCell: { display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' },
  remarkInput: { padding: '7px 11px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', width: '130px', color: '#1e293b' },
  btnApprove: { display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16a34a', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(22,163,74,0.25)' },
  btnReject: { display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #fca5a5', color: '#dc2626', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' },
  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' },
  emptyText: { fontSize: '14px', color: '#94a3b8', fontWeight: 600, margin: 0 },
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HRAttendanceRequestsView() {
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [remarksInput, setRemarksInput] = useState({});
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/attendance-requests/pending?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (e) {
      console.error('Failed to load pending attendance requests', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/attendance-requests/history?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (e) {
      console.error('Failed to load history attendance requests', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchAudit();
  }, [fetchPending, fetchAudit]);

  const handleAction = async (id, action) => {
    const remarks = remarksInput[id] || '';

    if (action === 'reject') {
      const { value: rejectRemarks, isDismissed } = await Swal.fire({
        title: 'Reject Attendance Request?',
        text: 'Please provide the mandatory rejection reason/remarks below:',
        input: 'textarea',
        inputPlaceholder: 'Enter rejection remarks here...',
        inputValue: remarks,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Reject Request',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return 'Rejection remarks are strictly mandatory!';
          }
        }
      });

      if (isDismissed) return;

      try {
        setActioningId(id);
        const res = await apiClient.patch(`/attendance-requests/${id}/reject`, { remarks: rejectRemarks });
        if (res && res.success) {
          await Swal.fire({
            title: 'Rejected!',
            text: 'The manual attendance request has been rejected.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          setRemarksInput(prev => ({ ...prev, [id]: '' }));
          await fetchPending();
          await fetchAudit();
        } else {
          Swal.fire('Error', res.message || 'Failed to reject request.', 'error');
        }
      } catch (e) {
        console.error(e);
        Swal.fire('Error', e.message || 'Server error occurred.', 'error');
      } finally {
        setActioningId(null);
      }
      return;
    }

    // Approve flow
    const confirmResult = await Swal.fire({
      title: 'Approve Attendance Request?',
      text: remarks ? `Remarks: "${remarks}"` : 'Are you sure you want to approve this request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setActioningId(id);
      const res = await apiClient.patch(`/attendance-requests/${id}/approve`, { remarks });
      if (res && res.success) {
        await Swal.fire({
          title: 'Approved!',
          text: 'The manual attendance request has been approved.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
        setRemarksInput(prev => ({ ...prev, [id]: '' }));
        await fetchPending();
        await fetchAudit();
      } else {
        Swal.fire('Error', res.message || 'Failed to approve request.', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', e.message || 'Server error occurred.', 'error');
    } finally {
      setActioningId(null);
    }
  };


  /* ── derived data ── */
  const rawList = activeTab === 'pending' ? requests : auditLogs;

  const departments = useMemo(() => {
    const s = new Set(rawList.map(r => r.employee?.department?.name).filter(Boolean));
    return Array.from(s).sort();
  }, [rawList]);

  const displayList = useMemo(() => {
    let list = rawList;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.employee?.fullName || '').toLowerCase().includes(q) ||
        (r.employee?.employeeCode || '').toLowerCase().includes(q) ||
        (r.reason || '').toLowerCase().includes(q)
      );
    }
    if (deptFilter) list = list.filter(r => r.employee?.department?.name === deptFilter);
    return list;
  }, [rawList, search, deptFilter]);

  const approvedCount = auditLogs.filter(r => String(r.status).toUpperCase() === 'APPROVED').length;
  const rejectedCount = auditLogs.filter(r => String(r.status).toUpperCase() === 'REJECTED').length;

  /* ═════════════════════════ RENDER ═══════════════════════════════ */
  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <div style={S.header} className="hr-att-header erp-header-card">
        <div>
          <h2 style={S.headerTitle}>Manual Attendance Approval Hub</h2>
          <p style={S.headerSub}>Review and process employee manual clock-in records</p>
        </div>
        <button
          style={S.syncBtn}
          className="hr-att-sync-btn"
          disabled={loading}
          onClick={() => { fetchPending(); fetchAudit(); }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Sync Records
        </button>
      </div>

      {/* ── Stats chips ── */}
      <div style={S.statsRow} className="hr-att-stats-grid">
        {[
          { label: 'Pending Review',   value: requests.length,  accent: '#f59e0b', icon: <Clock size={18} color="#f59e0b" /> },
          { label: 'Total Processed',  value: auditLogs.length, accent: '#6366f1', icon: <FileText size={18} color="#6366f1" /> },
          { label: 'Approved',         value: approvedCount,    accent: '#16a34a', icon: <CheckCircle size={18} color="#16a34a" /> },
          { label: 'Rejected',         value: rejectedCount,    accent: '#dc2626', icon: <XCircle size={18} color="#dc2626" /> },
        ].map(({ label, value, accent, icon }) => (
          <div key={label} style={S.statChip(accent)} className="hr-att-stat-card">
            {icon}
            <div>
              <div style={S.statLabel}>{label}</div>
              <div style={S.statValue(accent)}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div 
        className="erp-tab-scroll-bar hr-att-tab-bar"
        style={{
          ...S.tabBar,
          scrollBehavior: 'smooth',
          touchAction: 'pan-x',
          cursor: 'grab',
          paddingRight: '16px'
        }}
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY * 0.8;
          }
        }}
        onMouseDown={(e) => {
          const el = e.currentTarget;
          el.dataset.isDown = 'true';
          el.dataset.startX = String(e.pageX - el.offsetLeft);
          el.dataset.scrollLeft = String(el.scrollLeft);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.dataset.isDown = 'false';
        }}
        onMouseUp={(e) => {
          e.currentTarget.dataset.isDown = 'false';
        }}
        onMouseMove={(e) => {
          const el = e.currentTarget;
          if (el.dataset.isDown !== 'true') return;
          e.preventDefault();
          const x = e.pageX - el.offsetLeft;
          const startX = Number(el.dataset.startX || 0);
          const scrollLeft = Number(el.dataset.scrollLeft || 0);
          const walk = (x - startX) * 1.5;
          el.scrollLeft = scrollLeft - walk;
        }}
      >
        {[
          { key: 'pending', label: 'Pending HR Review',   count: requests.length },
          { key: 'audit',   label: 'Processed Audit Log', count: auditLogs.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            style={{
              ...S.tab(activeTab === key),
              userSelect: 'none'
            }}
            onClick={() => { setActiveTab(key); setSearch(''); setDeptFilter(''); }}
          >
            <span>{label}</span>
            <span style={{
              marginLeft: '6px',
              background: activeTab === key ? '#0284c7' : '#e2e8f0',
              color: activeTab === key ? '#fff' : '#64748b',
              borderRadius: '20px', padding: '1px 7px',
              fontSize: '11px', fontWeight: 800,
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={S.toolbar} className="hr-att-toolbar">
        <div style={S.searchWrap} className="hr-att-search-wrap">
          <Search size={15} color="#94a3b8" />
          <input
            style={S.searchInput}
            placeholder="Search by name, code or reason…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          style={S.filterSelect}
          className="hr-att-select"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {(search || deptFilter) && (
          <button
            onClick={() => { setSearch(''); setDeptFilter(''); }}
            style={{ ...S.filterSelect, cursor: 'pointer', color: '#ef4444', borderColor: '#fca5a5' }}
            className="hr-att-clear-btn"
          >
            Clear Filters
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }} className="hr-att-count">
          {displayList.length} records
        </div>
      </div>

      {/* ── Table ── */}
      <div style={S.tableWrap}>
        {loading && displayList.length === 0 ? (
          <div style={S.emptyBox}>
            <RefreshCw size={32} color="#cbd5e1" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={S.emptyText}>Loading records…</p>
          </div>
        ) : displayList.length === 0 ? (
          <div style={S.emptyBox}>
            <Inbox size={40} color="#cbd5e1" />
            <p style={S.emptyText}>
              {search || deptFilter
                ? 'No records match your filters.'
                : activeTab === 'pending'
                  ? 'No pending attendance requests at the moment.'
                  : 'No processed attendance history found.'}
            </p>
          </div>
        ) : (
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>#</th>
                <th style={S.th}>Employee</th>
                <th style={S.th}>Department</th>
                <th style={S.th}>Target Date</th>
                <th style={S.th}>Reason</th>
                <th style={S.th}>Submitted</th>
                <th style={S.th}>Status</th>
                {activeTab === 'audit'   && <th style={S.th}>HR Remarks</th>}
                {activeTab === 'pending' && <th style={S.thRight}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayList.map((req, i) => {
                const name     = req.employee?.fullName      || 'Unknown';
                const code     = req.employee?.employeeCode  || 'N/A';
                const dept     = req.employee?.department?.name || '—';
                const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <tr
                    key={req.id}
                    style={S.tr(i)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    {/* # */}
                    <td style={{ ...S.td, color: '#94a3b8', fontWeight: 700, fontSize: '12px' }}>
                      {i + 1}
                    </td>

                    {/* Employee */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={S.empAvatar}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#1d4ed8' }}>{initials}</span>
                        </div>
                        <div>
                          <p style={S.empName}>{name}</p>
                          <p style={S.empMeta}>{code}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ ...S.td, fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                      {dept}
                    </td>

                    {/* Target Date */}
                    <td style={S.td}>
                      <span style={S.dateChip}>
                        <Calendar size={11} />
                        {fmtDate(req.date)}
                      </span>
                    </td>

                    {/* Reason */}
                    <td style={S.td}>
                      <p style={S.reasonText} title={req.reason}>{req.reason || '—'}</p>
                    </td>

                    {/* Submitted */}
                    <td style={{ ...S.td, fontSize: '12px', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {fmtDate(req.createdAt)}
                    </td>

                    {/* Status */}
                    <td style={S.td}>
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Audit — HR Remarks */}
                    {activeTab === 'audit' && (
                      <td style={S.td}>
                        {req.remarks
                          ? <p style={S.remarksCell} title={req.remarks}>{req.remarks}</p>
                          : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>}
                      </td>
                    )}

                    {/* Pending — Actions */}
                    {activeTab === 'pending' && (
                      <td style={S.tdRight}>
                        <div style={S.actionsCell}>
                          <input
                            type="text"
                            placeholder="Remarks…"
                            value={remarksInput[req.id] || ''}
                            onChange={e => setRemarksInput(p => ({ ...p, [req.id]: e.target.value }))}
                            style={S.remarkInput}
                          />
                          <button
                            style={S.btnReject}
                            disabled={actioningId === req.id}
                            onClick={() => handleAction(req.id, 'reject')}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                          <button
                            style={S.btnApprove}
                            disabled={actioningId === req.id}
                            onClick={() => handleAction(req.id, 'approve')}
                            onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                            onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
