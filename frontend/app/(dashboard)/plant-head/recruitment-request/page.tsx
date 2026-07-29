'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, Pencil, RefreshCw, Send, Trash2, UserPlus, X } from 'lucide-react';
import { recruitmentService, RecruitmentRequest } from '@/services/recruitment.service';
import '@/components/erp-premium-ui.css';

const initialForm = {
  designation: '', department: 'Production', vacancies: 1, priority: 'MEDIUM',
  requiredByDate: '', employmentType: 'PERMANENT', requiredExperience: '',
  requiredSkills: '', reasonForHiring: '', jobDescription: '',
};
const editable = ['DRAFT', 'OPEN', 'RETURNED_FOR_CORRECTION'];
const withdrawable = ['OPEN', 'RETURNED_FOR_CORRECTION'];

export default function RecruitmentRequestPage() {
  const [form, setForm] = useState(initialForm);
  const [requests, setRequests] = useState<RecruitmentRequest[]>([]);
  const [selected, setSelected] = useState<RecruitmentRequest | null>(null);
  const [editing, setEditing] = useState<RecruitmentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title"><UserPlus size={24} color="#4f46e5" />Plant Head → Recruitment Requests</h2>
          <p className="erp-header-subtitle">Raise manpower requirement indents directly routed to the HR department.</p>
        </div>
        <button className="erp-btn erp-btn-sm" onClick={load}><RefreshCw size={15} /> Refresh</button>
      </div>

      {message && <div style={notice('#dcfce7', '#166534')}>{message}</div>}
      {error && <div style={notice('#fee2e2', '#991b1b')}>{error}</div>}

      <form onSubmit={submit} className="erp-table-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={heading}><Send size={17} color="#4f46e5" />{editing ? `Edit ${editing.indentNumber}` : 'Raise New Recruitment Indent'}</h3>
        <div style={formGrid}>
          <Field label="Designation / Role Name *"><input required placeholder="e.g. Lathe Operator" className="erp-search-input" {...field('designation')} /></Field>
          <Field label="Department *"><select required className="erp-search-input" {...field('department')}>
            {['Production', 'Quality Assurance', 'Maintenance', 'Store', 'Dispatch', 'Engineering', 'Administration'].map((value) => <option key={value}>{value}</option>)}
          </select></Field>
          <Field label="Number of Vacancies *"><input required type="number" min={1} className="erp-search-input" {...field('vacancies')} /></Field>
          <Field label="Priority Level *"><select required className="erp-search-input" {...field('priority')}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Required By Date"><input type="date" className="erp-search-input" {...field('requiredByDate')} /></Field>
          <Field label="Employment Type"><select className="erp-search-input" {...field('employmentType')}>{['PERMANENT', 'CONTRACT', 'TEMPORARY', 'APPRENTICE', 'INTERN'].map((value) => <option key={value}>{value[0] + value.slice(1).toLowerCase()}</option>)}</select></Field>
          <Field label="Required Experience"><input placeholder="e.g. 2–4 years" className="erp-search-input" {...field('requiredExperience')} /></Field>
          <Field label="Reason for Hiring *"><textarea required placeholder="e.g. New production line" className="erp-search-input" rows={3} {...field('reasonForHiring')} /></Field>
          <Field label="Required Skills"><textarea className="erp-search-input" rows={3} {...field('requiredSkills')} /></Field>
          <Field label="Job Description / Remarks"><textarea className="erp-search-input" rows={3} {...field('jobDescription')} /></Field>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button disabled={saving} className="erp-btn erp-btn-primary" type="submit">{saving ? 'Saving…' : editing ? 'Save & Resubmit' : 'Submit & Forward to HR'}</button>
          {editing && <button type="button" className="erp-btn" onClick={() => { setEditing(null); setForm(initialForm); }}>Cancel</button>}
        </div>
      </form>

      <div className="erp-table-card" style={{ padding: 20 }}>
        <h3 style={heading}>Submitted Requests History</h3>
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead><tr><th>Indent ID</th><th>Requested Role</th><th>Department</th><th>Vacancies</th><th>Priority</th><th>Required By</th><th>Status</th><th>Submitted Date</th><th>Actions</th></tr></thead>
            <tbody>
              {!loading && requests.map((row) => <tr key={row.id}>
                <td><strong>{row.indentNumber}</strong></td><td>{row.designation}</td><td>{row.department}</td><td>{row.vacancies}</td>
                <td><strong>{row.priority}</strong></td><td>{date(row.requiredByDate)}</td><td><Status value={row.status} /></td><td>{date(row.submittedAt)}</td>
                <td><div style={{ display: 'flex', gap: 6 }}>
                  <button title="View Details" className="erp-btn erp-btn-sm" onClick={() => setSelected(row)}><Eye size={14} /></button>
                  {editable.includes(row.status) && <button title="Edit Request" className="erp-btn erp-btn-sm" onClick={() => edit(row)}><Pencil size={14} /></button>}
                  {withdrawable.includes(row.status) && <button title="Withdraw Request" className="erp-btn erp-btn-sm" onClick={() => withdraw(row)}><Trash2 size={14} /></button>}
                </div></td>
              </tr>)}
              {loading && <tr><td colSpan={9}>Loading recruitment requests…</td></tr>}
              {!loading && !requests.length && <tr><td colSpan={9}>No recruitment requests submitted yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <div style={overlay} onClick={() => setSelected(null)}><div style={drawer} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setSelected(null)} style={close}><X /></button>
        <h2>{selected.indentNumber} · {selected.designation}</h2><Status value={selected.status} />
        <Detail label="Department" value={selected.department} /><Detail label="Vacancies" value={`${selected.positionsFilled}/${selected.vacancies} filled`} />
        <Detail label="Employment Type" value={selected.employmentType} /><Detail label="Experience" value={selected.requiredExperience} />
        <Detail label="Required Skills" value={selected.requiredSkills} /><Detail label="Reason for Hiring" value={selected.reasonForHiring} />
        <Detail label="Job Description / Remarks" value={selected.jobDescription} /><Detail label="HR Remarks" value={selected.hrRemarks} />
      </div></div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label style={{ display: 'grid', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155' }}>{label}{children}</label>; }
function Status({ value }: { value: string }) { return <span className={`erp-badge ${value === 'FULFILLED' ? 'erp-badge-green' : value === 'REJECTED' || value === 'WITHDRAWN' ? 'erp-badge-red' : 'erp-badge-blue'}`}>{value.replaceAll('_', ' ')}</span>; }
function Detail({ label, value }: { label: string; value?: string }) { return value ? <div style={{ marginTop: 18 }}><div style={{ fontSize: 11, color: '#64748b', fontWeight: 800 }}>{label.toUpperCase()}</div><div style={{ marginTop: 4 }}>{value}</div></div> : null; }
const date = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN') : '—';
const formGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 };
const heading: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: '#24345C', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' };
const notice = (background: string, color: string): React.CSSProperties => ({ background, color, padding: 12, borderRadius: 8, marginBottom: 14, fontWeight: 700 });
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: '#0f172a77', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' };
const drawer: React.CSSProperties = { width: 'min(520px, 94vw)', height: '100%', overflowY: 'auto', background: 'white', padding: 28, boxShadow: '-10px 0 30px #0f172a22', position: 'relative' };
const close: React.CSSProperties = { position: 'absolute', right: 18, top: 18, border: 0, background: 'transparent', cursor: 'pointer' };
