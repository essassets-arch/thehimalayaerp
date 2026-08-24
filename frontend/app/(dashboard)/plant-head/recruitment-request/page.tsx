'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, Pencil, RefreshCw, Send, Trash2, UserPlus, X } from 'lucide-react';
import { recruitmentService, RecruitmentRequest } from '@/services/recruitment.service';
import '@/components/erp-premium-ui.css';
import styles from './recruitment.module.css';

const initialForm = {
  designation: '', department: 'Production', vacancies: 1, priority: 'MEDIUM',
  requiredByDate: '', employmentType: 'PERMANENT', requiredExperience: '',
  requiredSkills: '', reasonForHiring: '', jobDescription: '',
};
const editable = ['DRAFT', 'OPEN', 'RETURNED_FOR_CORRECTION'];
const withdrawable = ['OPEN', 'RETURNED_FOR_CORRECTION'];

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type StatusTab = typeof STATUS_TABS[number];

function statusMatchesTab(status: string, tab: StatusTab): boolean {
  if (tab === 'All') return true;
  if (tab === 'Pending') return ['OPEN', 'DRAFT', 'RETURNED_FOR_CORRECTION'].includes(status);
  if (tab === 'Approved') return status === 'FULFILLED';
  if (tab === 'Rejected') return status === 'REJECTED' || status === 'WITHDRAWN';
  return false;
}

export default function RecruitmentRequestPage() {
  const [form, setForm] = useState(initialForm);
  const [requests, setRequests] = useState<RecruitmentRequest[]>([]);
  const [selected, setSelected] = useState<RecruitmentRequest | null>(null);
  const [editing, setEditing] = useState<RecruitmentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('All');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setRequests(await recruitmentService.mine()); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const field = (name: keyof typeof initialForm) => ({
    value: form[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [name]: name === 'vacancies' ? Number(event.target.value) : event.target.value })),
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      if (editing) {
        await recruitmentService.update(editing.id, { ...form, version: editing.version });
        if (editing.status === 'RETURNED_FOR_CORRECTION') {
          const updated = await recruitmentService.get(editing.id);
          await recruitmentService.action(editing.id, 'resubmit', { version: updated.version });
        }
      } else {
        await recruitmentService.create(form);
      }
      setMessage(editing ? 'Recruitment indent updated successfully.' : 'Recruitment indent submitted and forwarded to HR successfully.');
      setForm(initialForm); setEditing(null); await load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  function edit(row: RecruitmentRequest) {
    setEditing(row);
    setForm({
      designation: row.designation, department: row.department, vacancies: row.vacancies,
      priority: row.priority, requiredByDate: row.requiredByDate?.slice(0, 10) || '',
      employmentType: row.employmentType || 'PERMANENT', requiredExperience: row.requiredExperience || '',
      requiredSkills: row.requiredSkills || '', reasonForHiring: row.reasonForHiring,
      jobDescription: row.jobDescription || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function withdraw(row: RecruitmentRequest) {
    if (!confirm(`Withdraw ${row.indentNumber}?`)) return;
    try { await recruitmentService.action(row.id, 'withdraw', { version: row.version }); await load(); }
    catch (err: any) { setError(err.message); }
  }

  const filteredRequests = requests.filter(r => statusMatchesTab(r.status, activeTab));
  const tabCounts: Record<StatusTab, number> = {
    All: requests.length,
    Pending: requests.filter(r => statusMatchesTab(r.status, 'Pending')).length,
    Approved: requests.filter(r => statusMatchesTab(r.status, 'Approved')).length,
    Rejected: requests.filter(r => statusMatchesTab(r.status, 'Rejected')).length,
  };

  return (
    <div className="erp-page-container">
      {/* Header */}
      <div className={styles.header}>
        <div className="erp-header-title-group">
          <h2 className={styles.headerTitle}><UserPlus size={22} color="#4f46e5" />Plant Head → Recruitment Requests</h2>
          <p className="erp-header-subtitle">Raise manpower requirement indents directly routed to the HR department.</p>
        </div>
        <button className={`erp-btn erp-btn-sm ${styles.refreshBtn}`} onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? styles.spinning : ''} /> {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {message && <div className={styles.alertSuccess}>{message}</div>}
      {error && <div className={styles.alertError}>{error}</div>}

      {/* Form */}
      <form onSubmit={submit} className={styles.formCard}>
        <h3 className={styles.sectionHeading}>
          <Send size={16} color="#4f46e5" />
          {editing ? `Edit ${editing.indentNumber}` : 'Raise New Recruitment Indent'}
        </h3>

        <div className={styles.formGrid}>
          <Field label="Designation / Role Name *">
            <input required placeholder="e.g. Lathe Operator" className={styles.formInput} {...field('designation')} />
          </Field>
          <Field label="Department *">
            <select required className={styles.formInput} {...field('department')}>
              {['Production', 'Quality Assurance', 'Maintenance', 'Store', 'Dispatch', 'Engineering', 'Administration'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Number of Vacancies *">
            <input required type="number" min={1} className={styles.formInput} {...field('vacancies')} />
          </Field>
          <Field label="Priority Level *">
            <select required className={styles.formInput} {...field('priority')}>
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Required By Date">
            <input type="date" className={styles.formInput} {...field('requiredByDate')} />
          </Field>
          <Field label="Employment Type">
            <select className={styles.formInput} {...field('employmentType')}>
              {['PERMANENT', 'CONTRACT', 'TEMPORARY', 'APPRENTICE', 'INTERN'].map((v) => <option key={v}>{v[0] + v.slice(1).toLowerCase()}</option>)}
            </select>
          </Field>
          <Field label="Required Experience">
            <input placeholder="e.g. 2–4 years" className={styles.formInput} {...field('requiredExperience')} />
          </Field>
          <Field label="Reason for Hiring *">
            <textarea required placeholder="e.g. New production line" className={styles.formInput} rows={3} {...field('reasonForHiring')} />
          </Field>
          <Field label="Required Skills">
            <textarea placeholder="e.g. CNC, Quality Check" className={styles.formInput} rows={3} {...field('requiredSkills')} />
          </Field>
          <Field label="Job Description / Remarks">
            <textarea placeholder="Enter remarks (optional)" className={styles.formInput} rows={3} {...field('jobDescription')} />
          </Field>
        </div>

        <div className={styles.formActions}>
          <button disabled={saving} className={`erp-btn erp-btn-primary ${styles.submitBtn}`} type="submit">
            {saving ? 'Saving…' : editing ? 'Save & Resubmit' : 'Submit & Forward to HR'}
          </button>
          {editing && (
            <button type="button" className={`erp-btn ${styles.cancelBtn}`} onClick={() => { setEditing(null); setForm(initialForm); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* History */}
      <div className={styles.historyCard}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.clockIcon}>🕐</span> Submitted Requests History
        </h3>

        {/* Status Tabs */}
        <div className={styles.tabBar}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span className={styles.tabCount}>({tabCounts[tab]})</span>
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className={`erp-table-responsive ${styles.tableWrap}`}>
          <table className="erp-table" style={{ minWidth: '780px' }}>
            <thead>
              <tr>
                <th>Indent ID</th><th>Requested Role</th><th>Department</th><th>Vacancies</th>
                <th>Priority</th><th>Required By</th><th>Status</th><th>Submitted Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 20, color: '#8893A7' }}>Loading recruitment requests…</td></tr>}
              {!loading && filteredRequests.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: '#8893A7', fontWeight: 600 }}>No recruitment requests submitted yet.</td></tr>
              )}
              {!loading && filteredRequests.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.indentNumber}</strong></td>
                  <td>{row.designation}</td>
                  <td>{row.department}</td>
                  <td>{row.vacancies}</td>
                  <td><strong>{row.priority}</strong></td>
                  <td>{date(row.requiredByDate)}</td>
                  <td><StatusBadge value={row.status} /></td>
                  <td>{date(row.submittedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button title="View Details" className="erp-btn erp-btn-sm" onClick={() => setSelected(row)}><Eye size={14} /></button>
                      {editable.includes(row.status) && <button title="Edit" className="erp-btn erp-btn-sm" onClick={() => edit(row)}><Pencil size={14} /></button>}
                      {withdrawable.includes(row.status) && <button title="Withdraw" className="erp-btn erp-btn-sm" onClick={() => withdraw(row)}><Trash2 size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className={styles.mobileCards}>
          {loading && <p className={styles.mobileEmpty}>Loading recruitment requests…</p>}
          {!loading && filteredRequests.length === 0 && (
            <div className={styles.mobileEmptyState}>
              <p className={styles.mobileEmptyTitle}>No recruitment requests submitted yet.</p>
            </div>
          )}
          {!loading && filteredRequests.map((row) => (
            <div key={row.id} className={styles.mobileCard}>
              {/* Card Top: Indent ID + Status */}
              <div className={styles.mobileCardTop}>
                <code className={styles.mobileIndentId}>{row.indentNumber}</code>
                <StatusBadge value={row.status} />
              </div>
              {/* Role + Department */}
              <div className={styles.mobileCardTitle}>{row.designation}</div>
              <div className={styles.mobileCardDept}>{row.department}</div>
              {/* Metrics row */}
              <div className={styles.mobileMetrics}>
                <div className={styles.mobileMetric}>
                  <span className={styles.mobileMetricLabel}>Vacancies</span>
                  <span className={styles.mobileMetricVal}>{row.vacancies}</span>
                </div>
                <div className={styles.mobileMetric}>
                  <span className={styles.mobileMetricLabel}>Priority</span>
                  <span className={styles.mobileMetricVal}>{row.priority}</span>
                </div>
                <div className={styles.mobileMetric}>
                  <span className={styles.mobileMetricLabel}>Required By</span>
                  <span className={styles.mobileMetricVal}>{date(row.requiredByDate)}</span>
                </div>
              </div>
              {/* Actions */}
              <div className={styles.mobileCardActions}>
                <button className={`erp-btn erp-btn-sm ${styles.mobileActionBtn}`} onClick={() => setSelected(row)}>
                  <Eye size={13} /> View
                </button>
                {editable.includes(row.status) && (
                  <button className={`erp-btn erp-btn-sm ${styles.mobileActionBtn}`} onClick={() => edit(row)}>
                    <Pencil size={13} /> Edit
                  </button>
                )}
                {withdrawable.includes(row.status) && (
                  <button className={`erp-btn erp-btn-sm erp-btn-danger ${styles.mobileActionBtn}`} onClick={() => withdraw(row)}>
                    <Trash2 size={13} /> Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div style={overlay} onClick={() => setSelected(null)}>
          <div className="erp-drawer-responsive" style={drawer} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={closeBtn}><X /></button>
            <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#24345C', paddingRight: 32 }}>
              {selected.indentNumber} · {selected.designation}
            </h2>
            <StatusBadge value={selected.status} />
            <Detail label="Department" value={selected.department} />
            <Detail label="Vacancies" value={`${selected.positionsFilled}/${selected.vacancies} filled`} />
            <Detail label="Employment Type" value={selected.employmentType} />
            <Detail label="Experience" value={selected.requiredExperience} />
            <Detail label="Required Skills" value={selected.requiredSkills} />
            <Detail label="Reason for Hiring" value={selected.reasonForHiring} />
            <Detail label="Job Description / Remarks" value={selected.jobDescription} />
            <Detail label="HR Remarks" value={selected.hrRemarks} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: 'grid', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155' }}>{label}{children}</label>;
}
function StatusBadge({ value }: { value: string }) {
  const cls = value === 'FULFILLED' ? 'erp-badge-green' : (value === 'REJECTED' || value === 'WITHDRAWN') ? 'erp-badge-red' : 'erp-badge-blue';
  return <span className={`erp-badge ${cls}`}>{value.replaceAll('_', ' ')}</span>;
}
function Detail({ label, value }: { label: string; value?: string }) {
  return value ? (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800 }}>{label.toUpperCase()}</div>
      <div style={{ marginTop: 4 }}>{value}</div>
    </div>
  ) : null;
}
const date = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN') : '—';
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: '#0f172a77', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' };
const drawer: React.CSSProperties = { width: 'min(520px, 100vw)', height: '100%', overflowY: 'auto', background: 'white', padding: 'clamp(16px, 4vw, 28px)', boxShadow: '-10px 0 30px #0f172a22', position: 'relative' };
const closeBtn: React.CSSProperties = { position: 'absolute', right: 18, top: 18, border: 0, background: 'transparent', cursor: 'pointer' };
