'use client';

import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Eye, FilePenLine, Plus, Trash2, Search, X, Check } from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';

const blank = () => ({
  customerId: '',
  productId: '',
  complaintType: 'Product Quality',
  priority: 'Medium',
  complaintDate: new Date().toISOString().slice(0, 10),
  subject: '',
  description: '',
  salesRemarks: '',
  attachment: '',
});

const types = [
  'Product Quality',
  'Damage',
  'Wrong Product',
  'Quantity Shortage',
  'Delivery',
  'Billing',
  'Service',
  'Other',
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];
const label = (value) => String(value || '').replaceAll('_', ' ');

// Smart Auto-Suggest Dropdown Component
function SmartAutoSuggest({
  label,
  placeholder,
  valueText,
  selectedId,
  options = [],
  onSelect,
  onClear,
  required = false,
}) {
  const [query, setQuery] = useState(valueText || '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(valueText || '');
  }, [valueText]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (opt) =>
        String(opt.title || '').toLowerCase().includes(q) ||
        String(opt.subtitle || '').toLowerCase().includes(q)
    );
  }, [options, query]);

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <span className="form-label">
        {label} {required && '*'}
      </span>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value.trim()) {
              onClear();
            }
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          style={{ paddingRight: selectedId ? '32px' : '12px' }}
        />
        {selectedId ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onClear();
              setIsOpen(true);
            }}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
            }}
          >
            <X size={16} />
          </button>
        ) : (
          <Search
            size={16}
            style={{
              position: 'absolute',
              right: '10px',
              pointerEvents: 'none',
              color: '#94A3B8',
            }}
          />
        )}

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: '220px',
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              padding: '4px 0',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '10px 14px', fontSize: '13px', color: '#64748B' }}>
                No suggestions found for "{query}"
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === selectedId;
                return (
                  <div
                    key={opt.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(opt.title);
                      onSelect(opt);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? '#F1F5F9' : 'transparent',
                    }}
                    className="hover:bg-slate-100"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                        {opt.title}
                      </span>
                      {opt.subtitle && (
                        <span style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={16} style={{ color: '#2563EB' }} />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerComplaintManagement({ mode = 'sales' }) {
  const admin = mode === 'admin';
  const base = admin ? '/api/backend/admin/complaints' : '/api/backend/sales/complaints';
  const [complaints, setComplaints] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blank);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [customerText, setCustomerText] = useState('');
  const [productText, setProductText] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await backendFetch(base, { cacheTtlMs: 0 });
      setComplaints(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      Swal.fire('Unable to load complaints', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [base]);

  useEffect(() => {
    if (admin) return;
    Promise.all([
      backendFetch('/api/backend/sales/customers', { cacheTtlMs: 0 }),
      backendFetch('/api/backend/products', { cacheTtlMs: 0 }),
    ])
      .then(([cs, ps]) => {
        const rawCs = Array.isArray(cs) ? cs : cs.items || cs.data || [];
        const rawPs = Array.isArray(ps) ? ps : ps.items || ps.data || [];

        setCustomers(
          rawCs.map((c) => ({
            id: c.id,
            title: c.companyName || c.name || c.contactPerson || 'Unnamed Customer',
            subtitle: [c.customerCode || c.code, c.email || c.phone].filter(Boolean).join(' · '),
          }))
        );

        setProducts(
          rawPs.map((p) => ({
            id: p.id,
            title: p.name || p.productName || 'Unnamed Product',
            subtitle: [p.sku || p.publicId, p.category, p.unitPrice ? `₹${p.unitPrice}` : '']
              .filter(Boolean)
              .join(' · '),
          }))
        );
      })
      .catch(() => {});
  }, [admin]);

  const edit = (complaint) => {
    setAttachmentFile(null);
    setCustomerText(complaint.customer?.companyName || '');
    setProductText(complaint.product?.name || '');
    setEditing(complaint);
    setForm({
      customerId: complaint.customerId,
      productId: complaint.productId,
      complaintType: complaint.complaintType,
      priority: complaint.priority,
      complaintDate: complaint.complaintDate.slice(0, 10),
      subject: complaint.subject,
      description: complaint.description,
      salesRemarks: complaint.salesRemarks || '',
      attachment: complaint.attachment || '',
    });
    setOpen(true);
  };

  const submit = async (status) => {
    if (!form.customerId || !form.productId)
      return Swal.fire(
        'Select a valid customer and product',
        'Choose a customer and product from the suggestions so they can be linked to the complaint.',
        'warning'
      );
    if (status !== 'DRAFT' && (!form.subject || !form.description))
      return Swal.fire(
        'Complete required fields',
        'Customer, product, subject, and description are required.',
        'warning'
      );
    try {
      let attachment = form.attachment;
      if (attachmentFile) {
        const upload = new FormData();
        upload.append('file', attachmentFile);
        upload.append('category', 'attachments');
        const response = await fetch('/api/upload', { method: 'POST', body: upload });
        if (!response.ok)
          throw new Error((await response.json()).message || 'Attachment upload failed');
        attachment = (await response.json()).url;
      }
      const data = { ...form, attachment, status };
      await backendFetch(editing ? `${base}/${editing.id}` : base, {
        method: editing ? 'PUT' : 'POST',
        body: data,
      });
      setOpen(false);
      setEditing(null);
      setForm(blank());
      await load();
      Swal.fire(status === 'DRAFT' ? 'Draft saved' : 'Submitted to Super Admin', '', 'success');
    } catch (error) {
      Swal.fire('Unable to save complaint', error.message, 'error');
    }
  };

  const remove = async (complaint) => {
    const r = await Swal.fire({
      title: 'Delete draft?',
      icon: 'warning',
      showCancelButton: true,
    });
    if (!r.isConfirmed) return;
    try {
      await backendFetch(`${base}/${complaint.id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      Swal.fire('Unable to delete', e.message, 'error');
    }
  };

  const resubmit = async (complaint) => {
    try {
      await backendFetch(`${base}/${complaint.id}/resubmit`, { method: 'POST' });
      await load();
    } catch (e) {
      Swal.fire('Unable to resubmit', e.message, 'error');
    }
  };

  const adminAction = async (complaint, action) => {
    const prompt = await Swal.fire({
      title:
        action === 'approve'
          ? 'Approve complaint'
          : action === 'reject'
          ? 'Reject complaint'
          : 'Admin remarks',
      input: 'textarea',
      inputLabel: 'Remarks',
      inputValidator: (v) =>
        action === 'reject' && !v?.trim() ? 'Rejection remarks are required.' : undefined,
      showCancelButton: true,
    });
    if (!prompt.isConfirmed) return;
    try {
      await backendFetch(`${base}/${complaint.id}/${action}`, {
        method: 'PUT',
        body: { adminRemarks: prompt.value || '' },
      });
      setSelected(null);
      await load();
    } catch (e) {
      Swal.fire('Unable to update', e.message, 'error');
    }
  };

  const Status = ({ value }) => (
    <span
      className={`inline-block rounded-full text-xs font-bold text-center ${
        value === 'APPROVED'
          ? 'bg-emerald-100 text-emerald-700'
          : value === 'REJECTED'
          ? 'bg-red-100 text-red-700'
          : value === 'DRAFT'
          ? 'bg-slate-100 text-slate-700'
          : 'bg-amber-100 text-amber-700'
      }`}
      style={{
        padding: '4px 12px',
        width: 'max-content',
        minWidth: '80px',
        whiteSpace: 'nowrap',
      }}
    >
      {label(value)}
    </span>
  );

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row">
        <div>
          <h2 className="module-title">
            {admin ? 'Customer Complaint Review' : 'Customer Complaint Management'}
          </h2>
          <span className="text-sm text-slate-500">
            {admin
              ? 'Review submitted customer complaints.'
              : 'Create and track customer complaints.'}
          </span>
        </div>
        {!admin && (
          <button
            className="btn-small btn-primary-small flex items-center gap-2"
            onClick={() => {
              setEditing(null);
              setAttachmentFile(null);
              setCustomerText('');
              setProductText('');
              setForm(blank());
              setOpen(true);
            }}
          >
            <Plus size={15} /> Create Complaint
          </button>
        )}
      </div>

      <div className="crm-table-container">
        <table className="crm-table responsive-table flat-table">
          <thead>
            <tr>
              {(admin
                ? [
                    'Complaint No',
                    'Customer',
                    'Product',
                    'Complaint Type',
                    'Subject',
                    'Priority',
                    'Submitted By',
                    'Submitted Date',
                    'Status',
                    'Actions',
                  ]
                : [
                    'Complaint No',
                    'Customer',
                    'Product',
                    'Complaint Type',
                    'Subject',
                    'Priority',
                    'Status',
                    'Created Date',
                    'Super Admin Remarks',
                    'Actions',
                  ]
              ).map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10">Loading complaints…</td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="10">No complaints found.</td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id}>
                  <td data-label="Complaint No">{c.complaintNo}</td>
                  <td data-label="Customer">{c.customer?.companyName}</td>
                  <td data-label="Product">{c.product?.name}</td>
                  <td data-label="Complaint Type">{c.complaintType}</td>
                  <td data-label="Subject">{c.subject}</td>
                  <td data-label="Priority">{c.priority}</td>
                  {admin ? (
                    <>
                      <td data-label="Submitted By">{c.submittedBy || '—'}</td>
                      <td data-label="Submitted Date">
                        {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td data-label="Status">
                        <Status value={c.status} />
                      </td>
                      <td data-label="Created Date">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td data-label="Super Admin Remarks">{c.adminRemarks || '—'}</td>
                    </>
                  )}
                  {admin && (
                    <td data-label="Status">
                      <Status value={c.status} />
                    </td>
                  )}
                  <td data-label="Actions">
                    <div className="flex items-center gap-2 action-btn-group">
                      <button
                        className="action-btn flex items-center justify-center"
                        title="View"
                        onClick={() => setSelected(c)}
                      >
                        <Eye size={15} />
                      </button>
                      {!admin && c.status === 'DRAFT' && (
                        <>
                          <button
                            className="action-btn flex items-center justify-center"
                            title="Edit"
                            onClick={() => edit(c)}
                          >
                            <FilePenLine size={15} />
                          </button>
                          <button
                            className="action-btn flex items-center justify-center"
                            title="Delete"
                            onClick={() => remove(c)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                      {!admin && c.status === 'REJECTED' && (
                        <button
                          className="btn-small btn-primary-small"
                          onClick={() => resubmit(c)}
                        >
                          Resubmit
                        </button>
                      )}
                      {admin && (
                        <button
                          className="btn-small btn-primary-small"
                          onClick={() => setSelected(c)}
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="complaint-modal-overlay">
          <div className="complaint-modal">
            <div className="complaint-modal-header">
              <h2>{editing ? 'Edit Complaint' : 'Create Complaint'}</h2>
              <button onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="complaint-form-body">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SmartAutoSuggest
                  label="Customer"
                  placeholder="Type to search customer (e.g. Karan...)"
                  valueText={customerText}
                  selectedId={form.customerId}
                  options={customers}
                  required
                  onSelect={(opt) => {
                    setCustomerText(opt.title);
                    setForm({ ...form, customerId: opt.id });
                  }}
                  onClear={() => {
                    setCustomerText('');
                    setForm({ ...form, customerId: '' });
                  }}
                />

                <SmartAutoSuggest
                  label="Product"
                  placeholder="Type to search product (e.g. Shampoo...)"
                  valueText={productText}
                  selectedId={form.productId}
                  options={products}
                  required
                  onSelect={(opt) => {
                    setProductText(opt.title);
                    setForm({ ...form, productId: opt.id });
                  }}
                  onClear={() => {
                    setProductText('');
                    setForm({ ...form, productId: '' });
                  }}
                />

                <label className="form-group">
                  <span className="form-label">Complaint Type *</span>
                  <select
                    className="form-input"
                    value={form.complaintType}
                    onChange={(e) => setForm({ ...form, complaintType: e.target.value })}
                  >
                    {types.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">Priority *</span>
                  <select
                    className="form-input"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {priorities.map((x) => (
                      <option key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">Complaint Date *</span>
                  <input
                    className="form-input"
                    type="date"
                    value={form.complaintDate}
                    onChange={(e) => setForm({ ...form, complaintDate: e.target.value })}
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Attachment</span>
                  <input
                    className="form-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  />
                  {(attachmentFile || form.attachment) && (
                    <small>{attachmentFile?.name || 'Existing attachment'}</small>
                  )}
                </label>
              </div>

              <label className="form-group">
                <span className="form-label">Subject *</span>
                <input
                  className="form-input"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </label>

              <label className="form-group">
                <span className="form-label">Complaint Description *</span>
                <textarea
                  className="form-input"
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>

              <label className="form-group">
                <span className="form-label">Sales Remarks</span>
                <textarea
                  className="form-input"
                  rows="2"
                  value={form.salesRemarks}
                  onChange={(e) => setForm({ ...form, salesRemarks: e.target.value })}
                />
              </label>
            </div>

            <div className="complaint-modal-footer">
              <button className="btn-small" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn-small" onClick={() => submit('DRAFT')}>
                Save Draft
              </button>
              <button
                className="btn-small btn-primary-small"
                onClick={() => submit('PENDING_SUPER_ADMIN')}
              >
                Submit to Super Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="complaint-modal-overlay">
          <div className="complaint-modal">
            <div className="complaint-modal-header">
              <h2>
                {selected.complaintNo}: {selected.subject}
              </h2>
              <button onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="complaint-form-body">
              <p>
                <b>Customer:</b> {selected.customer?.companyName}
              </p>
              <p>
                <b>Product:</b> {selected.product?.name}
              </p>
              <p>
                <b>Status:</b> <Status value={selected.status} />
              </p>
              <p>
                <b>Description:</b> {selected.description}
              </p>
              <p>
                <b>Sales remarks:</b> {selected.salesRemarks || '—'}
              </p>
              <p>
                <b>Super Admin remarks:</b> {selected.adminRemarks || '—'}
              </p>
            </div>
            {admin && (
              <div className="complaint-modal-footer">
                {selected.status === 'PENDING_SUPER_ADMIN' && (
                  <>
                    <button
                      className="btn-small btn-primary-small"
                      onClick={() => adminAction(selected, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => adminAction(selected, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button className="btn-small" onClick={() => adminAction(selected, 'remarks')}>
                  Add Remarks
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
