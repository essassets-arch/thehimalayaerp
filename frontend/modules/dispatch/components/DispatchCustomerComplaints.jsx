'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Camera,
  Upload,
  Eye,
  Search,
  Filter,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Send,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const formatDate = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(val);
  }
};

export default function DispatchCustomerComplaints({ portalTitle = 'Dispatch' }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DISPATCH_PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);

  // Done modal state
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidencePreview, setEvidencePreview] = useState('');
  const [dispatchRemarks, setDispatchRemarks] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'ALL' ? '/dispatch/complaints?all=true' : '/dispatch/complaints';
      const res = await backendFetch(endpoint);
      if (Array.isArray(res)) {
        setComplaints(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('[DispatchCustomerComplaints] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle file or camera upload
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'dispatch-complaint-evidence');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await res.json();
      const url = data.url || data.filePath || data.location;
      setEvidenceUrl(url);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setEvidencePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setEvidencePreview('/placeholder-doc.png');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Could not upload evidence.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDoneModal = (complaint) => {
    setSelectedComplaint(complaint);
    setEvidenceUrl('');
    setEvidencePreview('');
    setDispatchRemarks('');
    setShowDoneModal(true);
  };

  const handleSubmitDone = async () => {
    if (!evidenceUrl) {
      return Swal.fire({
        icon: 'warning',
        title: 'Evidence Required',
        text: 'Please upload or capture photo evidence of the inspected products before completing.',
      });
    }
    if (!dispatchRemarks.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Inspection Remarks Required',
        text: 'Please enter dispatch inspection notes / condition findings.',
      });
    }

    setSubmitting(true);
    try {
      await backendFetch(`/dispatch/complaints/${selectedComplaint.id}/complete`, {
        method: 'PUT',
        body: {
          evidenceUrl: evidenceUrl,
          remarks: dispatchRemarks.trim(),
          dispatchEvidence: evidenceUrl,
          dispatchRemarks: dispatchRemarks.trim(),
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Inspection Complete',
        text: `Complaint ${selectedComplaint.complaintNo} forwarded to Finance for return approval.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setShowDoneModal(false);
      setShowDetailModal(false);
      fetchComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'Could not submit dispatch completion.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter complaints
  const complaintsList = Array.isArray(complaints) ? complaints : [];
  const filteredComplaints = complaintsList.filter((c) => {
    if (!c) return false;
    if (activeTab === 'DISPATCH_PENDING') {
      if (c.status !== 'DISPATCH_PENDING') return false;
    } else if (activeTab === 'COMPLETED') {
      if (c.status === 'DISPATCH_PENDING') return false;
    }

    if (!searchQuery?.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (c.complaintNo && String(c.complaintNo).toLowerCase().includes(q)) ||
      (c.order?.orderNumber && String(c.order.orderNumber).toLowerCase().includes(q)) ||
      (c.customer?.companyName && String(c.customer.companyName).toLowerCase().includes(q)) ||
      (c.subject && String(c.subject).toLowerCase().includes(q))
    );
  });

  const pendingCount = complaintsList.filter((c) => c?.status === 'DISPATCH_PENDING').length;
  const completedCount = complaintsList.filter((c) => c?.status && c.status !== 'DISPATCH_PENDING').length;

  if (!mounted) {
    return (
      <div style={{ padding: '20px 24px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
        <div style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading {portalTitle} — Customer Complaints...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', width: '100%', maxWidth: '100%', margin: 0, boxSizing: 'border-box', minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={28} color="#2F4375" />
            {portalTitle} — Customer Complaints
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
            Inspect returned or affected products, capture photo evidence, and forward to Finance for return credit realization.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('DISPATCH_PENDING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'DISPATCH_PENDING' ? '#fff' : 'transparent',
              color: activeTab === 'DISPATCH_PENDING' ? '#2F4375' : '#64748b',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'DISPATCH_PENDING' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Pending Inspection
            <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'COMPLETED' ? '#fff' : 'transparent',
              color: activeTab === 'COMPLETED' ? '#2F4375' : '#64748b',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'COMPLETED' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Inspection Completed
            <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'ALL' ? '#fff' : 'transparent',
              color: activeTab === 'ALL' ? '#2F4375' : '#64748b',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'ALL' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            All Complaints
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by Complaint ID, Order Number, Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1px solid #DCE5F0',
              borderRadius: '8px',
              fontSize: '13.5px',
              outline: 'none',
              background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Complaints Table Card */}
      <div style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Complaint ID</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Order No</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Complaint Type</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Affected Items</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Plant Head Approval</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading complaints...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No complaints pending dispatch inspection.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const isPending = c.status === 'DISPATCH_PENDING';
                  const itemsCount = c.items?.length || 1;
                  const firstItem = c.items?.[0];
                  const prodName = firstItem?.orderItem?.productNameSnapshot || firstItem?.product?.name || c.product?.name || 'Product';

                  return (
                    <tr
                      key={c.id}
                      style={{ borderBottom: '1px solid #F1F5F9', background: isPending ? '#fff' : '#fafafa' }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#2F4375', fontFamily: 'monospace' }}>
                        {c.complaintNo}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1e293b' }}>
                        {c.order?.orderNumber || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#334155' }}>
                        {c.customer?.companyName || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {c.complaintType}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>
                        <span style={{ fontWeight: '600' }}>{prodName}</span>
                        {itemsCount > 1 && (
                          <span style={{ marginLeft: '6px', fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '10px' }}>
                            +{itemsCount - 1} more
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#15803d', fontSize: '12px' }}>
                        ✓ {formatDate(c.approvedAt || c.plantHeadDecisionAt || c.updatedAt)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isPending ? (
                          <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '800', border: '1px solid #ddd6fe' }}>
                            DISPATCH PENDING
                          </span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '800', border: '1px solid #bbf7d0' }}>
                            {c.status}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedComplaint(c);
                              setShowDetailModal(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#f8fafc',
                              border: '1px solid #DCE5F0',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#2F4375',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={14} /> View Order
                          </button>

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleOpenDoneModal(c)}
                              style={{
                                padding: '6px 14px',
                                background: '#16a34a',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '800',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 4px rgba(22,163,74,0.25)',
                              }}
                            >
                              <CheckCircle2 size={14} /> Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* FULL ORDER INSPECTION MODAL                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showDetailModal && selectedComplaint && (
        <div
          onClick={() => setShowDetailModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: 'min(900px, 100%)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '18px', color: '#2F4375' }}>
                    {selectedComplaint.complaintNo}
                  </span>
                  <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  Order: <strong>{selectedComplaint.order?.orderNumber}</strong> • Approved by Plant Head: {formatDate(selectedComplaint.approvedAt || selectedComplaint.plantHeadDecisionAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Customer & Address Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CUSTOMER</span>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                    {selectedComplaint.customer?.companyName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Contact: {selectedComplaint.customer?.phone || selectedComplaint.customer?.contactPerson || '—'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SHIPPING ADDRESS</span>
                  <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '4px', lineHeight: 1.4 }}>
                    {selectedComplaint.order?.shippingAddress || selectedComplaint.customer?.shippingAddress || selectedComplaint.customer?.address || 'Standard plant delivery'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SALES EXECUTIVE</span>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                    {selectedComplaint.salesExecutive?.name || 'Sales Representative'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                    Total Order Bill: {formatCurrency(selectedComplaint.order?.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#334155' }}>
                  Affected Items For Physical Verification
                </h3>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Product</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Unit Price</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Ordered Qty</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Delivered Qty</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>Complaint Qty</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#b91c1c' }}>Complaint Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedComplaint.items && selectedComplaint.items.length > 0 ? (
                        selectedComplaint.items.map((it) => (
                          <tr key={it.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>
                              {it.orderItem?.productNameSnapshot || it.product?.name || 'Product'}
                              {it.product?.sku && <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>SKU: {it.product.sku}</span>}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                              {formatCurrency(it.unitPrice || it.orderItem?.unitPrice)}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                              {Number(it.orderedQuantity || 0)}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                              {Number(it.deliveredQuantity || it.orderedQuantity || 0)}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>
                              {Number(it.complaintQuantity || 0)}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#b91c1c' }}>
                              {formatCurrency(it.complaintAmount || Number(it.unitPrice || 0) * Number(it.complaintQuantity || 0))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: '14px', textAlign: 'center', color: '#64748b' }}>
                            {selectedComplaint.product?.name || 'Standard order items'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Plant Head & Sales Remarks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    SALES COMPLAINT NOTE
                  </span>
                  <div style={{ fontSize: '13px', color: '#334155' }}>
                    {selectedComplaint.description}
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    PLANT HEAD INSTRUCTION
                  </span>
                  <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600' }}>
                    {selectedComplaint.adminRemarks || 'Approved for dispatch inspection and physical return verification.'}
                  </div>
                </div>
              </div>

              {/* Existing Dispatch Evidence if already completed */}
              {selectedComplaint.dispatchEvidence && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    DISPATCH INSPECTION EVIDENCE
                  </span>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img
                      src={selectedComplaint.dispatchEvidence}
                      alt="Dispatch Evidence"
                      style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #93c5fd' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: '600' }}>
                        Notes: {selectedComplaint.dispatchRemarks || 'No inspection notes'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                        Completed: {formatDate(selectedComplaint.dispatchCompletedAt)} by {selectedComplaint.dispatchCompletedBy || 'Dispatch Team'}
                      </div>
                      <a
                        href={selectedComplaint.dispatchEvidence}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', marginTop: '6px', fontWeight: '700' }}
                      >
                        View Full Photo <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{ padding: '9px 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
              >
                Close
              </button>

              {selectedComplaint.status === 'DISPATCH_PENDING' && (
                <button
                  type="button"
                  onClick={() => handleOpenDoneModal(selectedComplaint)}
                  style={{
                    padding: '10px 22px',
                    background: '#16a34a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                  }}
                >
                  <CheckCircle2 size={16} /> Done & Send to Finance
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DISPATCH "DONE" / PHOTO EVIDENCE CAPTURE MODAL                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showDoneModal && selectedComplaint && (
        <div
          onClick={() => setShowDoneModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: 'min(600px, 100%)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={20} color="#16a34a" />
                  Dispatch Inspection & Evidence Upload
                </h2>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  Complaint: <strong>{selectedComplaint.complaintNo}</strong> • Order: {selectedComplaint.order?.orderNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDoneModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Info Callout */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#166534' }}>
                <strong>Step 3 in Workflow:</strong> Dispatch physical inspection confirms the returned or damaged quantity. After submitting, this complaint will immediately appear in <strong>Finance</strong> for final realization and deduction.
              </div>

              {/* Camera & File Upload Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Capture or Upload Inspection Evidence Photo *
                </label>

                {/* Hidden Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                  }}
                />

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: '#eff6ff',
                      border: '1.5px dashed #3b82f6',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#1d4ed8',
                      fontWeight: '700',
                      fontSize: '13.5px',
                    }}
                  >
                    <Camera size={20} />
                    Open Camera (Mobile)
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#475569',
                      fontWeight: '700',
                      fontSize: '13.5px',
                    }}
                  >
                    <Upload size={20} />
                    Upload File / Photo
                  </button>
                </div>

                {uploading && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                    Uploading photo evidence...
                  </div>
                )}

                {/* Evidence Preview */}
                {evidencePreview && (
                  <div style={{ marginTop: '14px', position: 'relative', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', maxHeight: '200px' }}>
                    <img
                      src={evidencePreview}
                      alt="Inspection Evidence Preview"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', background: '#0f172a' }}
                    />
                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>
                      ✓ Photo Attached
                    </div>
                  </div>
                )}
              </div>

              {/* Inspection Remarks */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Dispatch Inspection Notes / Warehouse Remarks *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Received 10 boxes damaged product back at Dispatch Bay 2. Barcode verified against order. Approved for finance return."
                  value={dispatchRemarks}
                  onChange={(e) => setDispatchRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
                  required
                />
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDoneModal(false)}
                disabled={submitting}
                style={{ padding: '9px 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitDone}
                disabled={submitting || uploading}
                style={{
                  padding: '10px 22px',
                  background: '#16a34a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                }}
              >
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Confirm Done & Send to Finance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
