'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Flame,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { recruitmentService, RecruitmentRequest } from '@/services/recruitment.service';
import styles from './recruitment.module.css';

const initialForm = {
  designation: '',
  department: 'Production',
  vacancies: 1,
  priority: 'MEDIUM',
  requiredByDate: '',
  employmentType: 'PERMANENT',
  requiredExperience: '',
  requiredSkills: '',
  reasonForHiring: '',
  jobDescription: '',
};

const editableStatuses = ['DRAFT', 'OPEN', 'RETURNED_FOR_CORRECTION'];
const withdrawableStatuses = ['OPEN', 'RETURNED_FOR_CORRECTION'];

const STATUS_TABS = ['All', 'Open / Pending', 'Fulfilled', 'Rejected / Withdrawn'] as const;
type StatusTab = typeof STATUS_TABS[number];

function statusMatchesTab(status: string, tab: StatusTab): boolean {
  if (tab === 'All') return true;
  if (tab === 'Open / Pending') return ['OPEN', 'DRAFT', 'RETURNED_FOR_CORRECTION', 'PENDING', 'HR_PROCESSING'].includes(status);
  if (tab === 'Fulfilled') return status === 'FULFILLED';
  if (tab === 'Rejected / Withdrawn') return ['REJECTED', 'WITHDRAWN'].includes(status);
  return false;
}

export default function PlantHeadRecruitmentPage() {
  const [form, setForm] = useState(initialForm);
  const [requests, setRequests] = useState<RecruitmentRequest[]>([]);
  const [selected, setSelected] = useState<RecruitmentRequest | null>(null);
  const [editing, setEditing] = useState<RecruitmentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recruitmentService.mine();
      setRequests(data || []);
      if (selected?.id) {
        const fresh = await recruitmentService.get(selected.id);
        setSelected(fresh);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load recruitment requests.');
    } finally {
      setLoading(false);
    }
  }, [selected?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const field = (name: keyof typeof initialForm) => ({
    value: form[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((current) => ({
        ...current,
        [name]: name === 'vacancies' ? Number(event.target.value) : event.target.value,
      })),
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (editing) {
        await recruitmentService.update(editing.id, { ...form, version: editing.version });
        if (editing.status === 'RETURNED_FOR_CORRECTION') {
          const updated = await recruitmentService.get(editing.id);
          await recruitmentService.action(editing.id, 'resubmit', { version: updated.version });
        }
        setMessage(`Recruitment indent ${editing.indentNumber} updated successfully.`);
      } else {
        const created = await recruitmentService.create(form);
        setMessage(`Recruitment indent ${created.indentNumber} submitted and forwarded to HR successfully.`);
      }
      setForm(initialForm);
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to save recruitment indent.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row: RecruitmentRequest) {
    setEditing(row);
    setForm({
      designation: row.designation,
      department: row.department,
      vacancies: row.vacancies,
      priority: row.priority,
      requiredByDate: row.requiredByDate ? row.requiredByDate.slice(0, 10) : '',
      employmentType: row.employmentType || 'PERMANENT',
      requiredExperience: row.requiredExperience || '',
      requiredSkills: row.requiredSkills || '',
      reasonForHiring: row.reasonForHiring || '',
      jobDescription: row.jobDescription || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleWithdraw(row: RecruitmentRequest) {
    if (!window.confirm(`Are you sure you want to withdraw recruitment indent ${row.indentNumber}?`)) return;
    setError('');
    setMessage('');
    try {
      await recruitmentService.action(row.id, 'withdraw', { version: row.version });
      setMessage(`Recruitment indent ${row.indentNumber} withdrawn.`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw recruitment indent.');
    }
  }

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchTab = statusMatchesTab(r.status, activeTab);
      const needle = search.trim().toLowerCase();
      if (!needle) return matchTab;
      const matchSearch =
        r.indentNumber?.toLowerCase().includes(needle) ||
        r.designation?.toLowerCase().includes(needle) ||
        r.department?.toLowerCase().includes(needle) ||
        r.reasonForHiring?.toLowerCase().includes(needle);
      return matchTab && matchSearch;
    });
  }, [requests, activeTab, search]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => ['OPEN', 'DRAFT', 'RETURNED_FOR_CORRECTION', 'PENDING', 'HR_PROCESSING'].includes(r.status)).length,
      fulfilled: requests.filter((r) => r.status === 'FULFILLED').length,
      urgent: requests.filter((r) => ['HIGH', 'URGENT'].includes(r.priority) && r.status !== 'FULFILLED').length,
    };
  }, [requests]);

  const tabCounts: Record<StatusTab, number> = {
    All: requests.length,
    'Open / Pending': stats.pending,
    Fulfilled: stats.fulfilled,
    'Rejected / Withdrawn': requests.filter((r) => ['REJECTED', 'WITHDRAWN'].includes(r.status)).length,
  };

  return (
    <div className={styles.pageContainer}>
      {/* ── 1. Hero Header Banner ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroIconWrap}>
            <UserPlus size={28} />
          </div>
          <div>
            <h1 className={styles.heroTitle}>Plant Head → Recruitment Indents</h1>
            <p className={styles.heroSubtitle}>
              Raise production manpower requests directly routed to the HR department.
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
          <div className={styles.kpiIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <FileText size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Indents</span>
            <span className={styles.kpiValue}>{stats.total}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pending with HR</span>
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

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fef2f2', color: '#dc2626' }}>
            <Flame size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Urgent / High</span>
            <span className={styles.kpiValue}>{stats.urgent}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Notification Alerts ── */}
      {message && (
        <div className={styles.alertSuccess}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className={styles.alertError}>
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── 4. Indent Creation / Edit Form Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            {editing ? <Pencil size={18} color="#4f46e5" /> : <PlusCircle size={18} color="#4f46e5" />}
            {editing ? `Edit Recruitment Indent: ${editing.indentNumber}` : 'Raise New Recruitment Indent'}
          </h2>
          <span className={styles.cardTag}>{editing ? 'Editing Mode' : 'Direct HR Forwarding'}</span>
        </div>

        <form onSubmit={submit}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Designation / Job Role <span className={styles.requiredStar}>*</span>
              </label>
              <input
                required
                placeholder="e.g. Lathe Operator / QC Inspector"
                className={styles.input}
                {...field('designation')}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Department <span className={styles.requiredStar}>*</span>
              </label>
              <select required className={styles.select} {...field('department')}>
                {[
                  'Production',
                  'Quality Assurance',
                  'Maintenance',
                  'Store',
                  'Dispatch',
                  'Engineering',
                  'Administration',
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Vacancies Count <span className={styles.requiredStar}>*</span>
              </label>
              <input
                required
                type="number"
                min={1}
                max={100}
                className={styles.input}
                {...field('vacancies')}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Priority Level <span className={styles.requiredStar}>*</span>
              </label>
              <select required className={styles.select} {...field('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Immediate Line Requirement)</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Required By Date</label>
              <input type="date" className={styles.input} {...field('requiredByDate')} />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Employment Type</label>
              <select className={styles.select} {...field('employmentType')}>
                <option value="PERMANENT">Permanent Full-Time</option>
                <option value="CONTRACT">Contract Basis</option>
                <option value="TEMPORARY">Temporary</option>
                <option value="APPRENTICE">Apprentice / Trainee</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Experience Level</label>
              <input
                placeholder="e.g. 2–4 years in manufacturing"
                className={styles.input}
                {...field('requiredExperience')}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>
                Reason for Hiring <span className={styles.requiredStar}>*</span>
              </label>
              <textarea
                required
                placeholder="e.g. Additional shift startup, high production demand, operator attrition replacement..."
                className={styles.textarea}
                rows={2}
                {...field('reasonForHiring')}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Key Required Skills</label>
              <textarea
                placeholder="e.g. CNC machine operation, Quality micrometer tools, safety standards"
                className={styles.textarea}
                rows={2}
                {...field('requiredSkills')}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Job Description / Remarks</label>
              <textarea
                placeholder="Additional notes for HR recruiter..."
                className={styles.textarea}
                rows={2}
                {...field('jobDescription')}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button disabled={saving} className={styles.btnPrimary} type="submit">
              <Send size={15} />
              {saving ? 'Processing…' : editing ? 'Save & Resubmit Indent' : 'Submit Indent to HR'}
            </button>
            {editing && (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setEditing(null);
                  setForm(initialForm);
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── 5. History & Tracking Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Clock size={18} color="#4f46e5" />
            Submitted Indents History
          </h2>
          <span className={styles.cardTag}>Live Sync with HR</span>
        </div>

        {/* Controls: Tabs + Search */}
        <div className={styles.controlsRow}>
          <div className={styles.tabList}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.tabItem} ${activeTab === tab ? styles.tabItemActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab} <span className={styles.tabBadge}>{tabCounts[tab]}</span>
              </button>
            ))}
          </div>

          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by role, indent ID, dept..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className={styles.desktopTableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Indent ID</th>
                <th>Requested Role</th>
                <th>Department</th>
                <th>Vacancies</th>
                <th>Priority</th>
                <th>Required By</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading recruitment requests…
                  </td>
                </tr>
              )}
              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontWeight: 600 }}>
                    No recruitment indents found in this view.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredRequests.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <code className={styles.indentCode}>{row.indentNumber}</code>
                    </td>
                    <td>
                      <div className={styles.roleTitle}>{row.designation}</div>
                    </td>
                    <td>
                      <span className={styles.deptBadge}>{row.department}</span>
                    </td>
                    <td>
                      <strong>
                        {row.positionsFilled || 0} / {row.vacancies}
                      </strong>
                    </td>
                    <td>
                      <PriorityBadge priority={row.priority} />
                    </td>
                    <td>{formatDate(row.requiredByDate)}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>{formatDate(row.submittedAt)}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          title="View Details"
                          className={styles.actionIconBtn}
                          onClick={() => setSelected(row)}
                        >
                          <Eye size={15} />
                        </button>
                        {editableStatuses.includes(row.status) && (
                          <button
                            title="Edit Indent"
                            className={styles.actionIconBtn}
                            onClick={() => handleEdit(row)}
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {withdrawableStatuses.includes(row.status) && (
                          <button
                            title="Withdraw Indent"
                            className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                            onClick={() => handleWithdraw(row)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List (< 768px) */}
        <div className={styles.mobileCardsGrid}>
          {loading && (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              Loading recruitment requests…
            </p>
          )}
          {!loading && filteredRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b', fontWeight: 600 }}>
              No recruitment indents found.
            </div>
          )}
          {!loading &&
            filteredRequests.map((row) => (
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
                    <span className={styles.mobileMetricLabel}>Req Date</span>
                    <span className={styles.mobileMetricValue}>{formatDate(row.requiredByDate)}</span>
                  </div>
                </div>

                {row.reasonForHiring && (
                  <div className={styles.mobileReasonPreview}>
                    <strong>Reason:</strong> {row.reasonForHiring}
                  </div>
                )}

                <div className={styles.mobileCardActions}>
                  <button
                    className={styles.mobileCardActionBtn}
                    onClick={() => setSelected(row)}
                  >
                    <Eye size={14} /> View Details
                  </button>
                  {editableStatuses.includes(row.status) && (
                    <button
                      className={styles.mobileCardActionBtn}
                      onClick={() => handleEdit(row)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  )}
                  {withdrawableStatuses.includes(row.status) && (
                    <button
                      className={`${styles.mobileCardActionBtn} ${styles.mobileCardActionBtnDanger}`}
                      onClick={() => handleWithdraw(row)}
                    >
                      <Trash2 size={14} /> Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── 6. Responsive Details Drawer ── */}
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
                  <span className={styles.drawerItemLabel}>Experience</span>
                  <span className={styles.drawerItemValue}>{selected.requiredExperience || 'Not specified'}</span>
                </div>
                <div className={styles.drawerItem}>
                  <span className={styles.drawerItemLabel}>Submitted On</span>
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
              <div className={styles.drawerSection} style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <h3 className={styles.drawerSectionTitle} style={{ color: '#166534' }}>
                  HR Remarks
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#166534', lineHeight: 1.5 }}>
                  {selected.hrRemarks}
                </p>
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
              </div>
            )}

            {/* Timeline */}
            <div className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Audit & Action Timeline</h3>
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
