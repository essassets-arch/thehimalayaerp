'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, Search, Users, X } from 'lucide-react';
import { recruitmentService, RecruitmentRequest } from '@/services/recruitment.service';
import '@/components/erp-premium-ui.css';

const filters = [
  ['', 'All'],
  ['OPEN', 'Open'],
  ['PENDING', 'Pending'],
  ['FULFILLED', 'Fulfilled'],
  ['REJECTED', 'Rejected'],
];

export default function HRRecruitmentPage() {
  const [requests, setRequests] = useState<RecruitmentRequest[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<RecruitmentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Actions states
  const [actionProcessing, setActionProcessing] = useState(false);
  const [rejectingReq, setRejectingReq] = useState<RecruitmentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fulfillingReq, setFulfillingReq] = useState<RecruitmentRequest | null>(null);
  const [positionsFilled, setPositionsFilled] = useState<number>(0);
  const [joiningDate, setJoiningDate] = useState<string>('');
  const [remarks, setRemarks] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await recruitmentService.list();
      setRequests(rows);
      const selectedId = selected?.id;
      if (selectedId) {
        const fresh = await recruitmentService.get(selectedId);
        setSelected(fresh);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recruitment requests.');
    } finally {
      setLoading(false);
    }
  }, [selected?.id]);

  useEffect(() => {
    void load();
  }, [status, load]);

  const visible = useMemo(() => {
    return requests.filter((row) => {
      const needle = search.toLowerCase();
      const statusMatch = !status || row.status === status;
      const searchMatch = [
        row.indentNumber,
        row.designation,
        row.department,
        row.requestedByName,
        row.status,
      ].some((value) => value?.toLowerCase().includes(needle));
      return statusMatch && searchMatch;
    });
  }, [requests, search, status]);

  async function open(row: RecruitmentRequest) {
    try {
      setSelected(await recruitmentService.get(row.id));
    } catch (err: any) {
      setError(err.message || 'Failed to load details.');
    }
  }

  async function handlePending(row: RecruitmentRequest) {
    setError('');
    setMessage('');
    setActionProcessing(true);
    try {
      await recruitmentService.action(row.id, 'pending', { version: row.version });
      setMessage('Recruitment request marked as pending.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to mark as pending.');
    } finally {
      setActionProcessing(false);
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingReq) return;
    if (!rejectionReason.trim()) {
      alert('Rejection Reason is required.');
      return;
    }
    setError('');
    setMessage('');
    setActionProcessing(true);
    try {
      await recruitmentService.action(rejectingReq.id, 'reject', {
        version: rejectingReq.version,
        rejectionReason: rejectionReason.trim(),
      });
      setMessage('Recruitment request rejected.');
      setRejectingReq(null);
      setRejectionReason('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to reject request.');
    } finally {
      setActionProcessing(false);
    }
  }

  async function handleFulfillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fulfillingReq) return;
    if (positionsFilled <= 0) {
      alert('Positions Filled must be greater than 0.');
      return;
    }
    if (positionsFilled > fulfillingReq.vacancies) {
      alert('Positions Filled cannot exceed requested vacancies.');
      return;
    }
    setError('');
    setMessage('');
    setActionProcessing(true);
    try {
      await recruitmentService.action(fulfillingReq.id, 'fulfil', {
        version: fulfillingReq.version,
        positionsFilled,
        remarks: remarks.trim(),
      });
      setMessage('Recruitment request fulfilled successfully.');
      setFulfillingReq(null);
      setRemarks('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to fulfill request.');
    } finally {
      setActionProcessing(false);
    }
  }

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <Users size={24} color="#4f46e5" />HR → Recruitment Requests
          </h2>
          <p className="erp-header-subtitle">
            Manage, reject, and fulfill recruitment indents.
          </p>
        </div>
        <button className="erp-btn erp-btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {message && <Notice good>{message}</Notice>}
      {error && <Notice>{error}</Notice>}

      <div className="erp-table-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 620 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
          <input
            className="erp-search-input"
            style={{ paddingLeft: 38 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role, department, indent ID or requester..."
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {filters.map(([value, label]) => (
            <button
              key={label}
              className={`erp-btn erp-btn-sm ${status === value ? 'erp-btn-primary' : ''}`}
              onClick={() => setStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Indent ID</th>
                <th>Requested Role</th>
                <th>Department</th>
                <th>Requested By</th>
                <th>Vacancies</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.indentNumber}</strong>
                  </td>
                  <td>
                    <strong>{row.designation}</strong>
                  </td>
                  <td>{row.department}</td>
                  <td>
                    {row.requestedByRole.replaceAll('_', ' ')} — {row.requestedByName}
                  </td>
                  <td>{row.vacancies}</td>
                  <td>
                    <strong>{row.priority}</strong>
                  </td>
                  <td>
                    <Status value={row.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="erp-btn erp-btn-sm erp-btn-secondary"
                        onClick={() => open(row)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {row.status === 'OPEN' && (
                        <button
                          disabled={actionProcessing}
                          className="erp-btn erp-btn-sm erp-btn-warning"
                          onClick={() => handlePending(row)}
                        >
                          Pending
                        </button>
                      )}
                      {(row.status === 'OPEN' || row.status === 'PENDING') && (
                        <>
                          <button
                            disabled={actionProcessing}
                            className="erp-btn erp-btn-sm erp-btn-danger"
                            onClick={() => {
                              setRejectingReq(row);
                              setRejectionReason('');
                            }}
                          >
                            Reject
                          </button>
                          <button
                            disabled={actionProcessing}
                            className="erp-btn erp-btn-sm erp-btn-success"
                            onClick={() => {
                              setFulfillingReq(row);
                              setPositionsFilled(row.vacancies);
                              setJoiningDate(new Date().toISOString().slice(0, 10));
                              setRemarks('');
                            }}
                          >
                            Fulfill
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={8}>Loading recruitment requests…</td>
                </tr>
              )}
              {!loading && !visible.length && (
                <tr>
                  <td colSpan={8}>No recruitment requests match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={overlay} onClick={() => setSelected(null)}>
          <div style={drawer} onClick={(event) => event.stopPropagation()}>
            <button style={close} onClick={() => setSelected(null)}>
              <X />
            </button>
            <h2 style={{ marginRight: 35 }}>
              {selected.indentNumber} · {selected.designation}
            </h2>
            <Status value={selected.status} />
            <div style={{ marginTop: 20 }}>
              <Details request={selected} />
            </div>
          </div>
        </div>
      )}

      {rejectingReq && (
        <div style={modalOverlay} onClick={() => setRejectingReq(null)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={close} onClick={() => setRejectingReq(null)}>
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#24345C' }}>
              Reject Request: {rejectingReq.indentNumber}
            </h3>
            <form onSubmit={handleRejectSubmit}>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  Rejection Reason *
                  <textarea
                    required
                    placeholder="Enter the reason for rejection..."
                    className="erp-search-input"
                    rows={4}
                    style={{ height: 'auto', padding: '10px 12px' }}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={() => setRejectingReq(null)}
                  disabled={actionProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-btn erp-btn-danger"
                  disabled={actionProcessing}
                >
                  {actionProcessing ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {fulfillingReq && (
        <div style={modalOverlay} onClick={() => setFulfillingReq(null)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={close} onClick={() => setFulfillingReq(null)}>
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#24345C' }}>
              Fulfill Request: {fulfillingReq.indentNumber}
            </h3>
            <form onSubmit={handleFulfillSubmit}>
              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  Positions Filled *
                  <input
                    required
                    type="number"
                    min={1}
                    max={fulfillingReq.vacancies}
                    className="erp-search-input"
                    value={positionsFilled}
                    onChange={(e) => setPositionsFilled(Number(e.target.value))}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  Joining Date *
                  <input
                    required
                    type="date"
                    className="erp-search-input"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  Remarks
                  <textarea
                    placeholder="Enter remarks..."
                    className="erp-search-input"
                    rows={3}
                    style={{ height: 'auto', padding: '10px 12px' }}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={() => setFulfillingReq(null)}
                  disabled={actionProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-btn erp-btn-primary"
                  disabled={actionProcessing}
                >
                  {actionProcessing ? 'Processing...' : 'Confirm Fulfill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Details({ request }: { request: RecruitmentRequest }) {
  return (
    <div>
      <div style={detailGrid}>
        <Detail label="Department" value={request.department} />
        <Detail label="Requested By" value={`${request.requestedByRole.replaceAll('_', ' ')} — ${request.requestedByName}`} />
        <Detail label="Vacancies" value={`${request.positionsFilled}/${request.vacancies} filled`} />
        <Detail label="Priority" value={request.priority} />
        <Detail label="Employment Type" value={request.employmentType} />
        <Detail label="Required By" value={date(request.requiredByDate)} />
        <Detail label="Experience" value={request.requiredExperience} />
        {request.status === 'REJECTED' && (
          <>
            <Detail label="Rejected By" value={request.rejectedBy || '—'} />
            <Detail label="Rejected At" value={request.rejectedAt ? new Date(request.rejectedAt).toLocaleString('en-IN') : '—'} />
            <Detail label="Rejection Reason" value={request.rejectionReason || '—'} />
          </>
        )}
        {request.status === 'FULFILLED' && (
          <>
            <Detail label="Fulfilled By" value={request.fulfilledBy || '—'} />
            <Detail label="Fulfilled At" value={request.fulfilledAt ? new Date(request.fulfilledAt).toLocaleString('en-IN') : '—'} />
            <Detail label="Remarks" value={request.hrRemarks || '—'} />
          </>
        )}
      </div>
      <h3 style={{ marginTop: 24 }}>Request Timeline</h3>
      {request.timeline?.map((item) => (
        <div key={item.id} style={{ borderLeft: '3px solid #6366f1', padding: '3px 0 12px 12px', marginTop: 8 }}>
          <strong>{item.action}</strong>
          <div style={{ color: '#64748b', fontSize: 12 }}>
            {item.performedByName} · {new Date(item.createdAt).toLocaleString('en-IN')}
          </div>
          {item.remarks && <div>{item.remarks}</div>}
        </div>
      ))}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return value ? (
    <div style={{ marginTop: 15 }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800 }}>{label.toUpperCase()}</div>
      <div>{value}</div>
    </div>
  ) : null;
}

function Status({ value }: { value: string }) {
  return (
    <span
      className={`erp-badge ${
        value === 'FULFILLED'
          ? 'erp-badge-green'
          : ['REJECTED', 'WITHDRAWN'].includes(value)
          ? 'erp-badge-red'
          : 'erp-badge-blue'
      }`}
    >
      {value.replaceAll('_', ' ')}
    </span>
  );
}

function Notice({ children, good = false }: { children: React.ReactNode; good?: boolean }) {
  return (
    <div
      style={{
        background: good ? '#dcfce7' : '#fee2e2',
        color: good ? '#166534' : '#991b1b',
        padding: 12,
        borderRadius: 8,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

const date = (value?: string) => (value ? new Date(value).toLocaleDateString('en-IN') : '—');
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: '#0f172a77', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' };
const drawer: React.CSSProperties = { width: 'min(680px, 96vw)', height: '100%', overflowY: 'auto', background: 'white', padding: 28, boxShadow: '-10px 0 30px #0f172a22', position: 'relative' };
const close: React.CSSProperties = { position: 'absolute', right: 18, top: 18, border: 0, background: 'transparent', cursor: 'pointer' };
const detailGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 };

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(4px)',
  zIndex: 1001,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const modalContent: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: 28,
  width: '100%',
  maxWidth: 480,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  position: 'relative',
};
