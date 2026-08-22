'use client';

import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Eye, FilePenLine, Plus, Trash2, Search, X, Check, ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { useMediaQuery } from '../hooks/useMediaQuery';

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

  // Review Remarks & Search Filter states
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');

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
    if (selected) {
      setReviewRemarks(selected.adminRemarks || '');
    }
  }, [selected]);

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
      complaintDate: complaint.complaintDate ? complaint.complaintDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
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

  const handleAdminDecision = async (action) => {
    if (!selected) return;
    if (action === 'reject' && !reviewRemarks.trim()) {
      return Swal.fire({
        title: 'Rejection Remarks Required',
        text: 'Please provide rejection remarks before rejecting the complaint.',
        icon: 'warning',
      });
    }

    try {
      await backendFetch(`${base}/${selected.id}/${action}`, {
        method: 'PUT',
        body: { adminRemarks: reviewRemarks || '' },
      });
      Swal.fire({
        title: action === 'approve' ? 'Complaint Approved' : action === 'reject' ? 'Complaint Rejected' : 'Remarks Updated',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      setSelected(null);
      await load();
    } catch (e) {
      Swal.fire('Unable to update', e.message || 'Server error', 'error');
    }
  };

  const Status = ({ value }) => (
    <span
      className={`inline-block rounded-full text-xs font-bold text-center ${
        value === 'APPROVED'
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
          : value === 'REJECTED'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : value === 'DRAFT'
          ? 'bg-slate-100 text-slate-700 border border-slate-300'
          : 'bg-amber-100 text-amber-800 border border-amber-300'
      }`}
      style={{
        padding: '3px 12px',
        width: 'max-content',
        minWidth: '80px',
        whiteSpace: 'nowrap',
      }}
    >
      {label(value)}
    </span>
  );

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (statusTab !== 'ALL' && c.status !== statusTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        String(c.complaintNo || '').toLowerCase().includes(q) ||
        String(c.customer?.companyName || '').toLowerCase().includes(q) ||
        String(c.product?.name || '').toLowerCase().includes(q) ||
        String(c.subject || '').toLowerCase().includes(q) ||
        String(c.complaintType || '').toLowerCase().includes(q)
      );
    });
  }, [complaints, statusTab, searchQuery]);

  const isCompact = useMediaQuery('(max-width: 1024px)');

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'PENDING_SUPER_ADMIN').length,
      approved: complaints.filter((c) => c.status === 'APPROVED').length,
      rejected: complaints.filter((c) => c.status === 'REJECTED').length,
    };
  }, [complaints]);

  return (
    <div className="app-card complaint-management-container" style={{ flex: 1 }}>
      
      {/* Header Row */}
      <div className="module-header-row" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <h2 className="module-title" style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
              {admin ? 'Customer Complaint Review' : 'Customer Complaint Management'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {admin
                ? 'Review and resolve submitted customer complaints with decision remarks.'
                : 'Create, track, and manage customer quality and service complaints.'}
            </p>
          </div>
        </div>
        {!admin && (
          <div className="complaint-header-actions">
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
              style={{ padding: '9px 18px', background: '#2563eb', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Plus size={16} /> Create Complaint
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats summary */}
      <div className="complaint-kpi-grid">
        <div className="complaint-kpi-card kpi-blue">
          <div className="complaint-kpi-top">
            <span className="complaint-kpi-title">TOTAL COMPLAINTS</span>
            <CheckCircle2 size={18} className="complaint-kpi-icon" />
          </div>
          <div className="complaint-kpi-val">{stats.total}</div>
        </div>

        <div className="complaint-kpi-card kpi-amber">
          <div className="complaint-kpi-top">
            <span className="complaint-kpi-title">PENDING REVIEW</span>
            <Clock size={18} className="complaint-kpi-icon" />
          </div>
          <div className="complaint-kpi-val">{stats.pending}</div>
        </div>

        <div className="complaint-kpi-card kpi-green">
          <div className="complaint-kpi-top">
            <span className="complaint-kpi-title">APPROVED</span>
            <CheckCircle2 size={18} className="complaint-kpi-icon" />
          </div>
          <div className="complaint-kpi-val">{stats.approved}</div>
        </div>

        <div className="complaint-kpi-card kpi-red">
          <div className="complaint-kpi-top">
            <span className="complaint-kpi-title">REJECTED</span>
            <XCircle size={18} className="complaint-kpi-icon" />
          </div>
          <div className="complaint-kpi-val">{stats.rejected}</div>
        </div>
      </div>

      {/* Filter Control Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div className="complaint-filter-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING_SUPER_ADMIN', label: 'Pending Review' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'REJECTED', label: 'Rejected' },
            ...(!admin ? [{ id: 'DRAFT', label: 'Drafts' }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                border: statusTab === tab.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: statusTab === tab.id ? '#2563eb' : '#ffffff',
                color: statusTab === tab.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                boxShadow: statusTab === tab.id ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search complaint, customer, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '13.5px',
              outline: 'none',
              background: '#ffffff',
              boxSizing: 'border-box',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>
      </div>

      {/* Complaints Table or Mobile Cards */}
      {isCompact ? (
        <div className="complaint-mobile-cards-list">
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>Loading complaints…</div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <AlertCircle size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>No complaints found</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Try changing the status filter or search query.</div>
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div key={c.id} className="complaint-mobile-card">
                <div className="cm-card-top">
                  <span className="cm-complaint-no">{c.complaintNo}</span>
                  <Status value={c.status} />
                </div>

                <div className="cm-customer-name">{c.customer?.companyName || c.customerName || '—'}</div>

                <div className="cm-product-type">
                  <span className="cm-product-name">{c.product?.name || 'General Product'}</span>
                  {c.complaintType && (
                    <span> • {c.complaintType}</span>
                  )}
                </div>

                {c.subject && (
                  <div className="cm-subject-box">
                    {c.subject}
                  </div>
                )}

                <div className="cm-footer-row">
                  <div className="cm-meta-left">
                    <div className="cm-date">
                      <Clock size={13} style={{ color: '#94a3b8' }} />
                      <span>{new Date(c.createdAt || c.complaintDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {c.priority && (
                      <span className={`cm-priority-pill cm-priority-${c.priority.toLowerCase()}`}>
                        {c.priority}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      className="cm-btn-view"
                      title="View & Review"
                      onClick={() => setSelected(c)}
                    >
                      <Eye size={13} /> View
                    </button>
                    {!admin && c.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => edit(c)}
                          style={{ padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#334155' }}
                          title="Edit"
                        >
                          <FilePenLine size={13} />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          style={{ padding: '6px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                    {!admin && c.status === 'REJECTED' && (
                      <button
                        onClick={() => resubmit(c)}
                        style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Resubmit
                      </button>
                    )}
                    {admin && (
                      <button
                        onClick={() => setSelected(c)}
                        style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="crm-table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto' }}>
          <table className="crm-table responsive-table flat-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
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
                  <th key={x} style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading complaints…</td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No complaints found matching filter criteria.</td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} className="hover:bg-slate-50">
                    <td data-label="Complaint No" style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7', fontSize: '12.5px' }}>{c.complaintNo}</td>
                    <td data-label="Customer" style={{ padding: '12px 14px', fontWeight: '750', color: '#0f172a', fontSize: '13px' }}>{c.customer?.companyName || '—'}</td>
                    <td data-label="Product" style={{ padding: '12px 14px', color: '#334155', fontSize: '12.5px', fontWeight: '600' }}>{c.product?.name || '—'}</td>
                    <td data-label="Complaint Type" style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>{c.complaintType}</td>
                    <td data-label="Subject" style={{ padding: '12px 14px', color: '#1e293b', fontSize: '12.5px', fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</td>
                    <td data-label="Priority" style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '800',
                        background: c.priority === 'Critical' ? '#fee2e2' : c.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                        color: c.priority === 'Critical' ? '#dc2626' : c.priority === 'High' ? '#c2410c' : '#475569'
                      }}>
                        {c.priority}
                      </span>
                    </td>
                    {admin ? (
                      <>
                        <td data-label="Submitted By" style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{c.submittedBy || '—'}</td>
                        <td data-label="Submitted Date" style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>
                          {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td data-label="Status" style={{ padding: '12px 14px' }}>
                          <Status value={c.status} />
                        </td>
                        <td data-label="Created Date" style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>
                          {new Date(c.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td data-label="Super Admin Remarks" style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>{c.adminRemarks || '—'}</td>
                      </>
                    )}
                    {admin && (
                      <td data-label="Status" style={{ padding: '12px 14px' }}>
                        <Status value={c.status} />
                      </td>
                    )}
                    <td data-label="Actions" style={{ padding: '12px 14px' }}>
                      <div className="flex items-center gap-2 action-btn-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="action-btn flex items-center justify-center"
                          title="View & Review"
                          onClick={() => setSelected(c)}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#334155' }}
                        >
                          <Eye size={14} />
                        </button>
                        {!admin && c.status === 'DRAFT' && (
                          <>
                            <button
                              className="action-btn flex items-center justify-center"
                              title="Edit"
                              onClick={() => edit(c)}
                              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#334155' }}
                            >
                              <FilePenLine size={14} />
                            </button>
                            <button
                              className="action-btn flex items-center justify-center"
                              title="Delete"
                              onClick={() => remove(c)}
                              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {!admin && c.status === 'REJECTED' && (
                          <button
                            className="btn-small btn-primary-small"
                            onClick={() => resubmit(c)}
                            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
                          >
                            Resubmit
                          </button>
                        )}
                        {admin && (
                          <button
                            className="btn-small btn-primary-small"
                            onClick={() => setSelected(c)}
                            style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
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
      )}

      {/* Create / Edit Form Modal */}
      {open && (
        <div className="complaint-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
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

      {/* Review & Detail Modal */}
      {selected && (
        <div className="complaint-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="complaint-modal" style={{ width: 'min(780px, 95vw)', borderRadius: '16px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div className="complaint-modal-header" style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                    {selected.complaintNo}
                  </span>
                  <Status value={selected.status} />
                </div>
                <h2 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
                  {selected.subject}
                </h2>
              </div>
              <button 
                onClick={() => setSelected(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '8px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="complaint-form-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
              
              {/* Metadata Grid (2-Column) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Name</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    {selected.customer?.companyName || '—'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Affected Product</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    {selected.product?.name || '—'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complaint Type</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                    {selected.complaintType}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority Level</span>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: selected.priority === 'Critical' ? '#fee2e2' : selected.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                      color: selected.priority === 'Critical' ? '#dc2626' : selected.priority === 'High' ? '#c2410c' : '#475569'
                    }}>
                      {selected.priority} Priority
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted By</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                    {selected.submittedBy || 'Sales Executive'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted Date</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                    {selected.submittedAt ? new Date(selected.submittedAt).toLocaleDateString('en-IN') : (selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—')}
                  </p>
                </div>
              </div>

              {/* Complaint Description */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Complaint Description
                </span>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selected.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Sales Remarks */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', display: 'block', marginBottom: '6px' }}>
                  Sales Representative Remarks
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#0c4a6e', lineHeight: '1.5' }}>
                  {selected.salesRemarks || 'No sales remarks submitted.'}
                </p>
              </div>

              {/* Super Admin Remarks Input / Inspection Area */}
              {admin ? (
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#6b21a8', display: 'block', marginBottom: '8px' }}>
                    Super Admin Review Remarks & Feedback
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter review notes, instructions, or resolution remarks..."
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d8b4fe',
                      fontSize: '13px',
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ) : (
                selected.adminRemarks && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Super Admin Response & Remarks
                    </span>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                      {selected.adminRemarks}
                    </p>
                  </div>
                )
              )}

            </div>

            {/* Modal Footer */}
            <div className="complaint-modal-footer" style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setSelected(null)}
                style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
              >
                Close
              </button>

              {admin ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleAdminDecision('remarks')}
                    style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Save Remarks
                  </button>
                  {selected.status === 'PENDING_SUPER_ADMIN' && (
                    <>
                      <button
                        onClick={() => handleAdminDecision('reject')}
                        style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAdminDecision('approve')}
                        style={{ padding: '8px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
