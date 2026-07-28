'use client';

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { CheckCircle2, Eye, FilePenLine, Paperclip, Plus, Search, XCircle, AlertTriangle } from 'lucide-react';
import { useCustomerComplaintStore } from '../store/customerComplaintStore';
import { useFormDraft } from '../shared/hooks/useFormDraft';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Modal } from './ui/modal';

const EMPTY_FORM = { orderId: '', customer: '', product: '', complaintType: 'Product Quality', complaintDate: new Date().toISOString().split('T')[0], priority: 'Medium', subject: '', description: '', salesRemarks: '', attachment: undefined };
const TYPES = ['Product Quality', 'Damage', 'Wrong Product', 'Quantity Shortage', 'Delivery', 'Billing', 'Service', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUS_VARIANTS = {
  DRAFT: ['secondary', 'bg-slate-100 text-slate-700'], PENDING_SUPER_ADMIN_REVIEW: ['outline', 'border-amber-300 bg-amber-50 text-amber-700'],
  UNDER_REVIEW: ['outline', 'border-blue-300 bg-blue-50 text-blue-700'], IN_RESOLUTION: ['outline', 'border-violet-300 bg-violet-50 text-violet-700'],
  RESOLVED: ['outline', 'border-emerald-300 bg-emerald-50 text-emerald-700'], CLOSED: ['secondary', 'bg-slate-200 text-slate-700'], REJECTED: ['destructive', '']
};
const statusLabel = status => status.replaceAll('_', ' ');
const StatusBadge = ({ status }) => { const [variant, className] = STATUS_VARIANTS[status] || ['outline', '']; return <Badge variant={variant} className={className}>{statusLabel(status)}</Badge>; };
const Field = ({ label, children, className = '' }) => <label className={`grid gap-1.5 ${className}`}><span className="text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
const SummaryCard = ({ label, value, tone }) => <Card className="complaint-stat-card"><CardContent><p className="complaint-stat-label text-slate-500">{label}</p><p className={`complaint-stat-value ${tone}`}>{value}</p></CardContent></Card>;

export default function CustomerComplaintManagement({ mode = 'sales', orders = [], currentUser }) {
  const complaints = useCustomerComplaintStore(s => s.complaints);
  const submitComplaint = useCustomerComplaintStore(s => s.submitComplaint);
  const saveDraft = useCustomerComplaintStore(s => s.saveDraft);
  const submitDraft = useCustomerComplaintStore(s => s.submitDraft);
  const updateStatus = useCustomerComplaintStore(s => s.updateStatus);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tab, setTab] = useState(mode === 'admin' ? 'Pending Review' : 'All');

  const { formData: form, setFormData: setForm, clearDraft } = useFormDraft({
    draftKey: 'erp_draft_create_complaint',
    initialData: EMPTY_FORM,
    enabled: formOpen && !editingId,
    excludeFields: ['attachment']
  });

  const tabMatch = item => ({ 'Pending Review': item.status === 'PENDING_SUPER_ADMIN_REVIEW', 'Under Resolution': ['UNDER_REVIEW', 'IN_RESOLUTION'].includes(item.status), Resolved: ['RESOLVED', 'CLOSED'].includes(item.status), Rejected: item.status === 'REJECTED', All: true }[tab]);
  const visible = useMemo(() => complaints.filter(item => {
    const searchable = `${item.id} ${item.customer} ${item.orderId}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (!statusFilter || item.status === statusFilter) && (!priorityFilter || item.priority === priorityFilter) && (mode !== 'admin' || tabMatch(item));
  }), [complaints, query, statusFilter, priorityFilter, tab, mode]);
  const count = status => complaints.filter(item => status.includes(item.status)).length;
  const salesStats = [['Total Complaints', complaints.length, 'text-slate-900'], ['Pending Review', count(['PENDING_SUPER_ADMIN_REVIEW']), 'text-amber-600'], ['Under Resolution', count(['UNDER_REVIEW', 'IN_RESOLUTION']), 'text-violet-600'], ['Resolved', count(['RESOLVED', 'CLOSED']), 'text-emerald-600']];
  const adminStats = [['Pending Review', count(['PENDING_SUPER_ADMIN_REVIEW']), 'text-amber-600'], ['Under Review', count(['UNDER_REVIEW']), 'text-blue-600'], ['In Resolution', count(['IN_RESOLUTION']), 'text-violet-600'], ['Resolved', count(['RESOLVED', 'CLOSED']), 'text-emerald-600']];

  const readFile = file => { if (!file) return; if (file.size > 1024 * 1024) return Swal.fire('Attachment too large', 'Maximum attachment size is 1 MB.', 'warning'); const reader = new FileReader(); reader.onload = () => setForm(prev => ({ ...prev, attachment: { name: file.name, type: file.type, size: file.size, dataUrl: String(reader.result) } })); reader.readAsDataURL(file); };
  const complaintPayload = () => ({ ...form, createdBy: currentUser?.name || 'Sales Team' });
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM); };
  const editComplaint = item => { setEditingId(item.id); setForm({ orderId: item.orderId, customer: item.customer, product: item.product, complaintType: item.complaintType, complaintDate: item.complaintDate, priority: item.priority, subject: item.subject, description: item.description, salesRemarks: item.salesRemarks, attachment: item.attachment }); setFormOpen(true); };
  const save = submit => { 
    if (submit && (!form.customer || !form.product || !form.subject || form.description.length < 10)) {
      return Swal.fire('Complete required fields', 'Customer, product, subject, and a detailed description are required.', 'warning');
    }
    const payload = complaintPayload(); 
    let id; 
    let isSuccess = false;
    if (editingId) { 
      if (submit) { 
        submitDraft(editingId, payload); 
        id = editingId; 
      } else {
        id = saveDraft(payload, editingId); 
      }
      isSuccess = true;
    } else {
      id = submit ? submitComplaint(payload) : saveDraft(payload); 
      isSuccess = true;
    }
    
    if (isSuccess && !editingId) {
      clearDraft();
    }
    closeForm(); 
    Swal.fire(submit ? 'Submitted to Super Admin' : 'Draft saved', `${id} was ${submit ? 'added to the review queue' : 'saved'}.`, 'success'); 
  };

  const adminAction = async (item, action) => {
    const config = { review: ['UNDER_REVIEW', 'Start review', false], assign: ['IN_RESOLUTION', 'Resolution owner / assignment remarks', true], reject: ['REJECTED', 'Rejection remarks', true], resolve: ['RESOLVED', 'Resolution remarks', true], close: ['CLOSED', 'Closure remarks', false] }[action];
    const result = await Swal.fire({ title: config[1], input: 'textarea', inputLabel: config[1], showCancelButton: true, inputValidator: value => config[2] && !value.trim() ? `${config[1]} are required.` : undefined });
    if (!result.isConfirmed) return; const remarks = result.value?.trim() || config[1]; updateStatus(item.id, config[0], remarks, currentUser?.name || 'Super Admin', action === 'assign' ? remarks : ''); setSelected(null);
  };

  const salesColumns = [['Complaint ID','id'],['Customer','customer'],['Order ID','orderId'],['Product','product'],['Complaint Type','complaintType'],['Priority','priority'],['Date','complaintDate'],['Status','status'],['Actions','actions']];
  const adminColumns = [['Complaint ID','id'],['Customer','customer'],['Order Ref','orderId'],['Product','product'],['Complaint','subject'],['Priority','priority'],['Submitted By','createdBy'],['Date','complaintDate'],['Status','status'],['Actions','actions']];
  const columns = mode === 'sales' ? salesColumns : adminColumns;

  const actions = item => <div className="flex w-full flex-col gap-2 [&>button]:w-full sm:flex-row sm:[&>button]:w-auto md:w-auto md:flex-wrap"><Button variant="outline" size="sm" onClick={() => setSelected(item)}><Eye /> {mode === 'sales' ? 'View' : 'View Details'}</Button>{mode === 'sales' && ['DRAFT','REJECTED'].includes(item.status) && <Button variant="outline" size="sm" onClick={() => editComplaint(item)}><FilePenLine /> Edit</Button>}{mode === 'admin' && !['REJECTED','CLOSED'].includes(item.status) && <Button size="sm" onClick={() => setSelected(item)}><FilePenLine /> Review</Button>}</div>;

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title" style={{ margin: 0 }}>
            {mode === 'sales' ? 'Customer Complaint Management' : 'Customer Complaint Review'}
          </h2>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'inline-block' }}>
            {mode === 'sales' ? 'Register, track, and monitor customer complaints submitted for Super Admin review.' : 'Review customer complaints submitted by Sales and manage their resolution lifecycle.'}
          </span>
        </div>
        
        <div className="module-actions">
          {/* Status filters */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
            {mode === 'admin' ? (
              ['Pending Review', 'Under Resolution', 'Resolved', 'Rejected', 'All'].map(value => (
                <button 
                  key={value}
                  className={`filter-pill ${tab === value ? 'active' : ''}`}
                  onClick={() => setTab(value)}
                  style={{ color: tab === value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {value}
                </button>
              ))
            ) : (
              [{label: 'All Statuses', value: ''}, ...Object.keys(STATUS_VARIANTS).map(v => ({label: statusLabel(v), value: v}))].map(st => (
                <button 
                  key={st.value}
                  className={`filter-pill ${statusFilter === st.value ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st.value)}
                  style={{ color: statusFilter === st.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {st.label}
                </button>
              ))
            )}
          </div>

          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by ID, customer, order..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          {mode === 'sales' && (
            <button 
              className="btn-small btn-primary-small"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              onClick={() => setFormOpen(true)}
            >
              <Plus size={14} /> Create Complaint
            </button>
          )}
        </div>
      </div>

      {/* Info flow message */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '10px', fontSize: '12.5px', color: '#1e40af', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={16} />
        <span><strong>Complaint Resolution SLA:</strong> Critical complaints must be addressed within 24 hours of submission.</span>
      </div>

      {/* Table */}
      <div className="crm-table-container">
        <table className="crm-table responsive-table flat-table">
          <thead>
            <tr>
              {columns.map(([label,key]) => (
                <th key={key} style={{ textAlign: key === 'actions' ? 'center' : 'left' }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  No complaints found.
                </td>
              </tr>
            ) : (
              visible.map(item => (
                <tr key={item.id}>
                  {columns.map(([,key]) => (
                    <td key={key} data-label={columns.find(([,k]) => k === key)[0]} style={{ textAlign: key === 'actions' ? 'center' : 'left' }}>
                      {key === 'status' ? (
                        <StatusBadge status={item.status}/>
                      ) : key === 'actions' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                          <button
                            title="View Details"
                            onClick={() => setSelected(item)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '30px', height: '30px',
                              background: '#ffffff', border: '1px solid #d1d5db',
                              borderRadius: '8px', cursor: 'pointer',
                              color: '#374151', flexShrink: 0
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          {mode === 'sales' && ['DRAFT','REJECTED'].includes(item.status) && (
                            <button
                              title="Edit"
                              onClick={() => editComplaint(item)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '30px', height: '30px',
                                background: '#ffffff', border: '1px solid #d1d5db',
                                borderRadius: '8px', cursor: 'pointer',
                                color: '#374151', flexShrink: 0
                              }}
                            >
                              <FilePenLine size={13} />
                            </button>
                          )}
                          {mode === 'admin' && !['REJECTED','CLOSED'].includes(item.status) && (
                            <button 
                              className="btn-small btn-primary-small"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '30px', padding: '0 12px' }}
                              onClick={() => setSelected(item)}
                            >
                              <CheckCircle2 size={13} /> Review
                            </button>
                          )}
                        </div>
                      ) : key === 'priority' ? (
                        <span style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                          background: item.priority === 'Critical' ? '#fee2e2' : item.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                          color: item.priority === 'Critical' ? '#b91c1c' : item.priority === 'High' ? '#c2410c' : '#475569'
                        }}>
                          {item.priority}
                        </span>
                      ) : key === 'id' ? (
                        <span style={{ fontWeight: '700' }}>{item.id}</span>
                      ) : key === 'customer' ? (
                        <span style={{ fontWeight: '600' }}>{item.customer}</span>
                      ) : key === 'product' ? (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{item.product}</span>
                      ) : (
                        item[key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    {formOpen && <div className="complaint-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) closeForm(); }}>
      <div className="complaint-modal" role="dialog" aria-modal="true" aria-labelledby="complaint-form-title">
        <div className="complaint-modal-header"><div><h2 id="complaint-form-title">{editingId ? `Edit Complaint ${editingId}` : 'Create Complaint'}</h2><p>Register a customer complaint and submit it for Super Admin review.</p></div><button type="button" className="complaint-modal-close" onClick={closeForm} aria-label="Close">×</button></div>
        <form className="complaint-modal-form" onSubmit={e => { e.preventDefault(); save(true); }}>
          <div className="complaint-form-body" style={{ padding: '20px' }}>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <input type="text" className="form-input" value={form.customer} onChange={e => setForm({...form,customer:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Product *</label>
                <input type="text" className="form-input" value={form.product} onChange={e => setForm({...form,product:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Complaint Type *</label>
                <select className="form-input" value={form.complaintType} onChange={e => setForm({...form,complaintType:e.target.value})} style={{ WebkitAppearance: 'auto' }} required>
                  {TYPES.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select className="form-input" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})} style={{ WebkitAppearance: 'auto' }} required>
                  {PRIORITIES.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Complaint Date *</label>
                <input type="date" className="form-input" value={form.complaintDate} onChange={e => setForm({...form,complaintDate:e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-1 mb-4">
              <div className="form-group">
                <label className="form-label">Attachment</label>
                <input type="file" className="form-input" style={{ paddingTop: '7px' }} accept="image/*,.pdf,.doc,.docx" onChange={e => readFile(e.target.files?.[0])}/>
                {form.attachment && <span style={{ fontSize: '12px', color: 'var(--color-accent-teal)', marginTop: '4px', display: 'block', fontWeight: 600 }}>{form.attachment.name}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 mb-4">
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input type="text" className="form-input" value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-1 mb-4">
              <div className="form-group">
                <label className="form-label">Complaint Description *</label>
                <textarea rows={4} className="form-input" style={{ minHeight: '80px', padding: '10px' }} value={form.description} onChange={e => setForm({...form,description:e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-1 mb-4">
              <div className="form-group">
                <label className="form-label">Sales Remarks</label>
                <textarea rows={2} className="form-input" style={{ minHeight: '50px', padding: '10px' }} value={form.salesRemarks} onChange={e => setForm({...form,salesRemarks:e.target.value})} />
              </div>
            </div>
            
          </div>
          <div className="complaint-modal-footer" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn-small w-full sm:w-auto" style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700' }} onClick={closeForm}>Cancel</button>
            <button type="button" className="btn-small w-full sm:w-auto" style={{ background: '#DCE5F0', color: '#334155', fontWeight: '700' }} onClick={() => save(false)}>Save Draft</button>
            <button type="submit" className="btn-small btn-primary-small w-full sm:w-auto">Submit to Super Admin</button>
          </div>
        </form>
      </div>
    </div>}

    <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.id} · ${selected.subject}` : 'Complaint Details'} size="xl" footer={selected && mode === 'admin' ? <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">{selected.status === 'PENDING_SUPER_ADMIN_REVIEW' && <Button onClick={() => adminAction(selected,'review')}><Eye/> Start Review</Button>}{selected.status === 'UNDER_REVIEW' && <Button onClick={() => adminAction(selected,'assign')}><CheckCircle2/> Assign for Resolution</Button>}{['PENDING_SUPER_ADMIN_REVIEW','UNDER_REVIEW'].includes(selected.status) && <Button variant="destructive" onClick={() => adminAction(selected,'reject')}><XCircle/> Reject</Button>}{selected.status === 'IN_RESOLUTION' && <Button onClick={() => adminAction(selected,'resolve')}><CheckCircle2/> Mark Resolved</Button>}{selected.status === 'RESOLVED' && <Button onClick={() => adminAction(selected,'close')}><CheckCircle2/> Close Complaint</Button>}</div> : null}>
      {selected && <div className="space-y-5"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={selected.status}/><Badge variant="outline">{selected.priority}</Badge></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[['Customer',selected.customer],['Order Ref',selected.orderId],['Product',selected.product],['Complaint Type',selected.complaintType],['Submitted By',selected.createdBy],['Date',selected.complaintDate],['Assigned To',selected.assignedTo || 'Not assigned']].map(([label,value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 break-words font-semibold text-slate-900">{value}</p></div>)}</div><section><h3 className="text-sm font-bold">Complaint Description</h3><p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm">{selected.description}</p></section><section><h3 className="text-sm font-bold">Sales Remarks</h3><p className="mt-2 text-sm">{selected.salesRemarks || 'No Sales remarks.'}</p></section>{selected.attachment && <a className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600" href={selected.attachment.dataUrl} download={selected.attachment.name}><Paperclip className="size-4"/> {selected.attachment.name}</a>}<section><h3 className="mb-3 text-sm font-bold">Audit Timeline</h3><div className="space-y-3 border-l-2 border-slate-200 pl-4">{selected.history.map((entry,index) => <div key={`${entry.at}-${index}`}><div className="flex flex-wrap items-center gap-2"><StatusBadge status={entry.status}/><span className="text-xs font-semibold">{entry.actor}</span></div><p className="mt-1 text-sm">{entry.remarks || 'No remarks'}</p><p className="text-xs text-slate-500">{new Date(entry.at).toLocaleString('en-IN')}</p></div>)}</div></section></div>}
    </Modal>
    </div>
  );
}
