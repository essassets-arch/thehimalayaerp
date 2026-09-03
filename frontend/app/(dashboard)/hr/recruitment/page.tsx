'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building,
  CheckCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Flame,
  PlusCircle,
  RefreshCw,
  Search,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { recruitmentService, RecruitmentRequest } from '@/services/recruitment.service';
import styles from './hr-recruitment.module.css';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function HRRecruitmentPage() {
  const [requests, setRequests] = useState<RecruitmentRequest[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selected, setSelected] = useState<RecruitmentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Actions states
  const [actionProcessing, setActionProcessing] = useState(false);
  const [rejectingReq, setRejectingReq] = useState<RecruitmentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fulfillingReq, setFulfillingReq] = useState<RecruitmentRequest | null>(null);
  const [positionsFilled, setPositionsFilled] = useState<number>(1);
  const [joiningDate, setJoiningDate] = useState<string>('');
  const [remarks, setRemarks] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await recruitmentService.list();
      setRequests(rows || []);
      if (selected?.id) {
        const fresh = await recruitmentService.get(selected.id);
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
  }, [load]);

  // Departments list from requests
  const departments = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [requests]);

  // Filtered requests
  const visible = useMemo(() => {
    return requests.filter((row) => {
      const needle = search.trim().toLowerCase();
      const statusMatch = !status || row.status === status;
      const deptMatch = !departmentFilter || row.department === departmentFilter;
      const priorityMatch = !priorityFilter || row.priority === priorityFilter;

      const searchMatch =
        !needle ||
        row.indentNumber?.toLowerCase().includes(needle) ||
        row.designation?.toLowerCase().includes(needle) ||
        row.department?.toLowerCase().includes(needle) ||
        row.requestedByName?.toLowerCase().includes(needle) ||
        row.reasonForHiring?.toLowerCase().includes(needle);

      return statusMatch && deptMatch && priorityMatch && searchMatch;
    });
  }, [requests, search, status, departmentFilter, priorityFilter]);

  // KPI Stats
  const stats = useMemo(() => {
    return {
      total: requests.length,
      open: requests.filter((r) => r.status === 'OPEN').length,
      pending: requests.filter((r) => ['PENDING', 'HR_PROCESSING', 'RETURNED_FOR_CORRECTION'].includes(r.status)).length,
      fulfilled: requests.filter((r) => r.status === 'FULFILLED').length,
      urgent: requests.filter((r) => ['HIGH', 'URGENT'].includes(r.priority) && r.status !== 'FULFILLED').length,
    };
  }, [requests]);

  async function handleOpenDetails(row: RecruitmentRequest) {
    try {
      const fresh = await recruitmentService.get(row.id);
      setSelected(fresh);
    } catch (err: any) {
      setError(err.message || 'Failed to load details.');
    }
  }

  async function handleMarkPending(row: RecruitmentRequest) {
    setError('');
    setMessage('');
    setActionProcessing(true);
    try {
      await recruitmentService.action(row.id, 'pending', { version: row.version });
      setMessage(`Recruitment indent ${row.indentNumber} marked as pending review.`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to update request.');
    } finally {
      setActionProcessing(false);
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingReq) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
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
      setMessage(`Recruitment indent ${rejectingReq.indentNumber} rejected.`);
      setRejectingReq(null);
      setRejectionReason('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to reject recruitment indent.');
    } finally {
      setActionProcessing(false);
    }
  }

  async function handleFulfillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fulfillingReq) return;
    if (positionsFilled <= 0) {
      alert('Positions Filled must be at least 1.');
      return;
    }
    if (positionsFilled > fulfillingReq.vacancies) {
      alert(`Positions Filled cannot exceed total requested vacancies (${fulfillingReq.vacancies}).`);
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
      setMessage(`Recruitment indent ${fulfillingReq.indentNumber} fulfilled successfully.`);
      setFulfillingReq(null);
      setRemarks('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to fulfill recruitment indent.');
    } finally {
      setActionProcessing(false);
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* ── 1. Hero Header Banner ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroIconWrap}>
            <Users size={28} />
          </div>
          <div>
            <h1 className={styles.heroTitle}>HR → Recruitment Operations</h1>
            <p className={styles.heroSubtitle}>
              Review, process, fulfill, or route plant manpower recruitment requisitions.
            </p>
          </div>
        </div>
        <div className={styles.heroActions}>
          <button
            className={styles.refreshButton}
            onClick={() => {
              void load();
            }}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── 2. KPI Metrics Grid ── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
            <FileText size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Requisitions</span>
            <span className={styles.kpiValue}>{stats.total}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Open Indents</span>
            <span className={styles.kpiValue}>{stats.open}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pending Review</span>
            <span className={styles.kpiValue}>{stats.pending}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Fulfilled</span>
            <span className={styles.kpiValue}>{stats.fulfilled}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Notification Alerts ── */}
      {message && (
        <div className={styles.alertSuccess}>
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className={styles.alertError}>
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── 4. Main Requisitions Table & Card ── */}
      <div className={styles.card}>
        {/* Controls Row */}
        <div className={styles.controlsRow}>
          <div className={styles.filterGroup}>
            {/* Status Tabs */}
            <div className={styles.tabList}>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  className={`${styles.tabItem} ${status === f.value ? styles.tabItemActive : ''}`}
                  onClick={() => setStatus(f.value)}
                >
                  {f.label}{' '}
                  <span className={styles.tabBadge}>
                    {f.value === ''
                      ? requests.length
                      : requests.filter((r) => r.status === f.value).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Department Filter */}
            <select
              className={styles.filterSelect}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              className={styles.filterSelect}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Search Input */}
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search role, dept, indent ID, requester..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop View Table (>= 768px) */}
        <div className={styles.desktopTableWrap}>
          <table className={styles.table}>
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
              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading recruitment requests…
                  </td>
                </tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontWeight: 600 }}>
                    No recruitment requests match the current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                visible.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <code className={styles.indentCode}>{row.indentNumber}</code>
                    </td>
                    <td>
                      <div className={styles.roleTitle}>{row.designation}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        Required by: {formatDate(row.requiredByDate)}
                      </div>
                    </td>
                    <td>
                      <span className={styles.deptBadge}>{row.department}</span>
                    </td>
                    <td>
                      <div className={styles.requesterInfo}>
                        <span className={styles.requesterName}>{row.requestedByName}</span>
                        <span className={styles.requesterRole}>
                          {row.requestedByRole ? row.requestedByRole.replaceAll('_', ' ') : 'Requester'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <strong>
                          {row.positionsFilled || 0} / {row.vacancies}
                        </strong>
                        <div
                          style={{
                            width: 60,
                            height: 5,
                            background: '#e2e8f0',
                            borderRadius: 4,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((row.positionsFilled || 0) / (row.vacancies || 1)) * 100)
                              )}%`,
                              height: '100%',
                              background: row.status === 'FULFILLED' ? '#10b981' : '#4f46e5',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={row.priority} />
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={`${styles.btnAction} ${styles.btnActionView}`}
                          onClick={() => handleOpenDetails(row)}
                          title="View Requisition Details"
                        >
                          <Eye size={14} /> View
                        </button>

                        {row.status === 'OPEN' && (
                          <button
                            disabled={actionProcessing}
                            className={`${styles.btnAction} ${styles.btnActionPending}`}
                            onClick={() => handleMarkPending(row)}
                          >
                            Mark Pending
                          </button>
                        )}

                        {['OPEN', 'PENDING', 'HR_PROCESSING', 'ON_HOLD'].includes(row.status) && (
                          <>
                            <button
                              disabled={actionProcessing}
                              className={`${styles.btnAction} ${styles.btnActionFulfill}`}
                              onClick={() => {
                                setFulfillingReq(row);
                                setPositionsFilled(row.vacancies - (row.positionsFilled || 0) || 1);
                                setJoiningDate(new Date().toISOString().slice(0, 10));
                                setRemarks('');
                              }}
                            >
                              Fulfill
                            </button>
                            <button
                              disabled={actionProcessing}
                              className={`${styles.btnAction} ${styles.btnActionReject}`}
                              onClick={() => {
                                setRejectingReq(row);
                                setRejectionReason('');
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards (< 768px) */}
        <div className={styles.mobileCardsGrid}>
          {loading && (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              Loading recruitment requests…
            </p>
          )}
          {!loading && visible.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b', fontWeight: 600 }}>
              No recruitment requests match the current filters.
            </div>
          )}
          {!loading &&
            visible.map((row) => (
              <div key={row.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <code className={styles.indentCode}>{row.indentNumber}</code>
                  <div className={styles.mobileBadges}>
                    <PriorityBadge priority={row.priority} />
                    <StatusBadge status={row.status} />
                  </div>
                </div>

                <div className={styles.mobileRoleTitle}>{row.designation}</div>

                <div className={styles.mobileDeptRow}>
                  <Building size={14} />
                  <span>{row.department}</span>
                  <span>•</span>
                  <span>{row.employmentType || 'Permanent'}</span>
                </div>

                <div className={styles.mobileRequesterRow}>
                  <User size={14} color="#059669" />
                  <span>
                    <strong>{row.requestedByName}</strong> ({row.requestedByRole?.replaceAll('_', ' ')})
                  </span>
                </div>

                <div className={styles.mobileMetricBox}>
                  <div className={styles.mobileMetricCol}>
                    <span className={styles.mobileMetricLabel}>Vacancies</span>
                    <span className={styles.mobileMetricValue}>{row.vacancies}</span>
                  </div>
                  <div className={styles.mobileMetricCol}>
                    <span className={styles.mobileMetricLabel}>Filled</span>
                    <span className={styles.mobileMetricValue}>{row.positionsFilled || 0}</span>
                  </div>
                  <div className={styles.mobileMetricCol}>
                    <span className={styles.mobileMetricLabel}>Required</span>
                    <span className={styles.mobileMetricValue}>{formatDate(row.requiredByDate)}</span>
                  </div>
                </div>

                <div className={styles.mobileCardActions}>
                  <button
                    className={`${styles.btnAction} ${styles.btnActionView}`}
                    onClick={() => handleOpenDetails(row)}
                  >
                    <Eye size={14} /> View
                  </button>

                  {row.status === 'OPEN' && (
                    <button
                      disabled={actionProcessing}
                      className={`${styles.btnAction} ${styles.btnActionPending}`}
                      onClick={() => handleMarkPending(row)}
                    >
                      Pending
                    </button>
                  )}

                  {['OPEN', 'PENDING', 'HR_PROCESSING', 'ON_HOLD'].includes(row.status) && (
                    <>
                      <button
                        disabled={actionProcessing}
                        className={`${styles.btnAction} ${styles.btnActionFulfill}`}
                        onClick={() => {
                          setFulfillingReq(row);
                          setPositionsFilled(row.vacancies - (row.positionsFilled || 0) || 1);
                          setJoiningDate(new Date().toISOString().slice(0, 10));
                          setRemarks('');
                        }}
                      >
                        Fulfill
                      </button>
                      <button
                        disabled={actionProcessing}
                        className={`${styles.btnAction} ${styles.btnActionReject}`}
                        onClick={() => {
                          setRejectingReq(row);
                          setRejectionReason('');
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── 5. Responsive Detail Drawer ── */}
      {selected && (
        <div className={styles.drawerOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.drawerCloseBtn} onClick={() => setSelected(null)}>
              <X size={18} />
            </button>

            <div>
              <code className={styles.indentCode}>{selected.indentNumber}</code>
              <h2 className={styles.drawerTitle} style={{ marginTop: '8px' }}>
                {selected.designation}
              </h2>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <StatusBadge status={selected.status} />
                <PriorityBadge priority={selected.priority} />
              </div>
            </div>

            <div className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Requisition Information</h3>
              <div className={styles.drawerGrid}>
                <div className={styles.drawerItem}>
                  <span className={styles.drawerItemLabel}>Department</span>
                  <span className={styles.drawerItemValue}>{selected.department}</span>
                </div>
                <div className={styles.drawerItem}>
                  <span className={styles.drawerItemLabel}>Requested By</span>
                  <span className={styles.drawerItemValue}>
                    {selected.requestedByName} ({selected.requestedByRole?.replaceAll('_', ' ')})
                  </span>
                </div>
                <div className={styles.drawerItem}>
                  <span className={styles.drawerItemLabel}>Vacancies</span>
                  <span className={styles.drawerItemValue}>
                    {selected.positionsFilled || 0} / {selected.vacancies} Filled
                  </span>
                </div>
                <div className={styles.drawerItem}>
                  <span className={styles.drawerItemLabel}>Employment Type</span>
                  <span className={styles.drawerItemValue}>{selected.employmentType || 'Permanent'}</span>
                </div>
                <div className={styles.drawerItem}>
                  <span className={styles.drawerItemLabel}>Required By</span>
                  <span className={styles.drawerItemValue}>{formatDate(selected.requiredByDate)}</span>
                </div>
                <div className={styles.drawerItem}>
                  <span className={styles.drawerItemLabel}>Submitted Date</span>
                  <span className={styles.drawerItemValue}>{formatDate(selected.submittedAt)}</span>
                </div>
              </div>
            </div>

            <div className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Reason for Hiring</h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                {selected.reasonForHiring || '—'}
              </p>
            </div>

            {selected.requiredSkills && (
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Required Skills</h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                  {selected.requiredSkills}
                </p>
              </div>
            )}

            {selected.hrRemarks && (
              <div className={styles.drawerSection} style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <h3 className={styles.drawerSectionTitle} style={{ color: '#065f46' }}>
                  HR Fulfillment Remarks
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#065f46', lineHeight: 1.5 }}>
                  {selected.hrRemarks}
                </p>
                {selected.fulfilledBy && (
                  <div style={{ fontSize: '11.5px', color: '#059669', marginTop: 4 }}>
                    Fulfilled by {selected.fulfilledBy} on {formatDate(selected.fulfilledAt)}
                  </div>
                )}
              </div>
            )}

            {selected.rejectionReason && (
              <div className={styles.drawerSection} style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                <h3 className={styles.drawerSectionTitle} style={{ color: '#991b1b' }}>
                  Rejection Reason
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#991b1b', lineHeight: 1.5 }}>
                  {selected.rejectionReason}
                </p>
                {selected.rejectedBy && (
                  <div style={{ fontSize: '11.5px', color: '#dc2626', marginTop: 4 }}>
                    Rejected by {selected.rejectedBy} on {formatDate(selected.rejectedAt)}
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Audit & Lifecycle Timeline</h3>
              {selected.timeline && selected.timeline.length > 0 ? (
                <div>
                  {selected.timeline.map((item) => (
                    <div key={item.id} className={styles.timelineItem}>
                      <div className={styles.timelineAction}>{item.action}</div>
                      <div className={styles.timelineMeta}>
                        {item.performedByName} ({item.performedByRole}) •{' '}
                        {new Date(item.createdAt).toLocaleString('en-IN')}
                      </div>
                      {item.remarks && <div className={styles.timelineRemarks}>{item.remarks}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  No timeline updates recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Rejection Modal ── */}
      {rejectingReq && (
        <div className={styles.modalOverlay} onClick={() => setRejectingReq(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setRejectingReq(null)}>
              <X size={18} />
            </button>
            <h3 className={styles.modalTitle}>Reject Indent: {rejectingReq.indentNumber}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Role: <strong>{rejectingReq.designation}</strong> ({rejectingReq.department})
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Reason for Rejection *</label>
                <textarea
                  required
                  placeholder="Explain why this recruitment requisition is rejected..."
                  className={styles.textarea}
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.btnAction} ${styles.btnActionView}`}
                  onClick={() => setRejectingReq(null)}
                  disabled={actionProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btnAction} ${styles.btnActionReject}`}
                  disabled={actionProcessing}
                >
                  {actionProcessing ? 'Processing…' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Fulfillment Modal ── */}
      {fulfillingReq && (
        <div className={styles.modalOverlay} onClick={() => setFulfillingReq(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setFulfillingReq(null)}>
              <X size={18} />
            </button>
            <h3 className={styles.modalTitle}>Fulfill Indent: {fulfillingReq.indentNumber}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Role: <strong>{fulfillingReq.designation}</strong> ({fulfillingReq.department}) •{' '}
              {fulfillingReq.vacancies} vacancies requested
            </p>

            <form onSubmit={handleFulfillSubmit}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Positions Filled *</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={fulfillingReq.vacancies}
                  className={styles.input}
                  value={positionsFilled}
                  onChange={(e) => setPositionsFilled(Number(e.target.value))}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Joining Date *</label>
                <input
                  required
                  type="date"
                  className={styles.input}
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>HR Remarks / Candidate Details</label>
                <textarea
                  placeholder="Enter notes, candidate names, or joining details..."
                  className={styles.textarea}
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.btnAction} ${styles.btnActionView}`}
                  onClick={() => setFulfillingReq(null)}
                  disabled={actionProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btnAction} ${styles.btnActionFulfill}`}
                  disabled={actionProcessing}
                >
                  {actionProcessing ? 'Processing…' : 'Confirm Fulfillment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = (priority || 'MEDIUM').toUpperCase();
  const cls =
    p === 'URGENT'
      ? styles.priorityURGENT
      : p === 'HIGH'
      ? styles.priorityHIGH
      : p === 'MEDIUM'
      ? styles.priorityMEDIUM
      : styles.priorityLOW;
  return <span className={`${styles.priorityBadge} ${cls}`}>{p}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s = status || 'OPEN';
  const isFulfilled = s === 'FULFILLED';
  const isRejected = ['REJECTED', 'WITHDRAWN'].includes(s);
  const isPending = ['PENDING', 'HR_PROCESSING', 'ON_HOLD', 'RETURNED_FOR_CORRECTION'].includes(s);

  let bg = '#eef2ff';
  let color = '#4338ca';
  let border = '#c7d2fe';

  if (isFulfilled) {
    bg = '#ecfdf5';
    color = '#065f46';
    border = '#a7f3d0';
  } else if (isRejected) {
    bg = '#fef2f2';
    color = '#991b1b';
    border = '#fecaca';
  } else if (isPending) {
    bg = '#fffbeb';
    color = '#b45309';
    border = '#fde68a';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: '8px',
        fontSize: '11.5px',
        fontWeight: 700,
        background: bg,
        color,
        border: `1px solid ${border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
      }}
    >
      {s.replaceAll('_', ' ')}
    </span>
  );
}

function formatDate(val?: string) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return val;
  }
}
