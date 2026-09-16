'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Building2,
  Calendar,
  FileText,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  X,
  CreditCard,
  Scale,
  Receipt,
  ArrowDownRight,
  TrendingDown,
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

export default function FinanceCustomerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('FINANCE_PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolution Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [approvedReturnAmount, setApprovedReturnAmount] = useState(0);
  const [financeRemarks, setFinanceRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'ALL' ? '/finance/complaints?all=true' : '/finance/complaints';
      const res = await backendFetch(endpoint);
      if (Array.isArray(res)) {
        setComplaints(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('[FinanceCustomerComplaints] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleOpenResolveModal = (c) => {
    setSelectedComplaint(c);
    const calculated = Number(c.calculatedComplaintAmount || 0);
    setApprovedReturnAmount(calculated);
    setFinanceRemarks('');
    setShowResolveModal(true);
  };

  const handleSubmitResolve = async () => {
    const origBill = Number(selectedComplaint?.originalBillAmount || selectedComplaint?.order?.totalAmount || 0);
    const returnVal = Number(approvedReturnAmount);

    if (isNaN(returnVal) || returnVal < 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Invalid Return Amount',
        text: 'Approved return amount must be zero or a positive number.',
      });
    }

    if (returnVal > origBill) {
      return Swal.fire({
        icon: 'warning',
        title: 'Amount Exceeded',
        text: `Approved return (${formatCurrency(returnVal)}) cannot exceed original bill amount (${formatCurrency(origBill)}).`,
      });
    }

    if (!financeRemarks.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Finance Remarks Required',
        text: 'Please provide mandatory return reason / credit adjustment remarks for the audit trail.',
      });
    }

    const netRealization = Math.max(0, origBill - returnVal);

    const { isConfirmed } = await Swal.fire({
      title: `Confirm Return Approval & Resolution?`,
      html: `
        <div style="text-align:left; font-size:13.5px; line-height:1.6; color:#334155;">
          <p>You are authorizing a permanent financial adjustment for complaint <b>${selectedComplaint.complaintNo}</b>:</p>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin:10px 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>Original Order Bill:</span>
              <strong>${formatCurrency(origBill)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#dc2626;">
              <span>Approved Return Deduction:</span>
              <strong>-${formatCurrency(returnVal)}</strong>
            </div>
            <div style="border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between; color:#16a34a; font-size:14px;">
              <span>Net Sales Realization:</span>
              <strong>${formatCurrency(netRealization)}</strong>
            </div>
          </div>
          <p style="font-size:12px; color:#64748b; margin:0;">
            ✓ Safe invariant: SalesOrder.totalAmount remains permanently intact at ${formatCurrency(origBill)}.<br/>
            ✓ Concurrency guard: Unique constraint ensures this deduction cannot be duplicated.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve & Resolve',
      confirmButtonColor: '#16a34a',
      cancelButtonText: 'Cancel',
    });

    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      const res = await backendFetch(`/finance/complaints/${selectedComplaint.id}/resolve`, {
        method: 'PUT',
        body: {
          approvedReturnAmount: returnVal,
          financeRemarks: financeRemarks.trim(),
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Complaint Resolved',
        text: `Financial adjustment ${res?.adjustmentReference || ''} created successfully. Net realization updated.`,
        timer: 2500,
        showConfirmButton: false,
      });

      setShowResolveModal(false);
      fetchComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Resolution Failed',
        text: err.message || 'Could not resolve complaint in finance.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter complaints
  const complaintsList = Array.isArray(complaints) ? complaints : [];
  const filteredComplaints = complaintsList.filter((c) => {
    if (!c) return false;
    if (activeTab === 'FINANCE_PENDING') {
      if (c.status !== 'FINANCE_PENDING') return false;
    } else if (activeTab === 'RESOLVED') {
      if (c.status !== 'RESOLVED') return false;
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

  const pendingCount = complaintsList.filter((c) => c?.status === 'FINANCE_PENDING').length;
  const resolvedCount = complaintsList.filter((c) => c?.status === 'RESOLVED').length;

  if (!mounted) {
    return (
      <div style={{ padding: '20px 24px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
        <div style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading Finance — Customer Complaints Resolution...
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
            <DollarSign size={28} color="#047857" />
            Finance — Customer Complaints Resolution
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
            Verify Dispatch physical evidence, approve return deduction amount, and reconcile net order sales realization.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('FINANCE_PENDING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'FINANCE_PENDING' ? '#fff' : 'transparent',
              color: activeTab === 'FINANCE_PENDING' ? '#047857' : '#64748b',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'FINANCE_PENDING' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Pending Finance
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESOLVED')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'RESOLVED' ? '#fff' : 'transparent',
              color: activeTab === 'RESOLVED' ? '#047857' : '#64748b',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'RESOLVED' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Resolved Complaints
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
              {resolvedCount}
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
              color: activeTab === 'ALL' ? '#047857' : '#64748b',
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
            placeholder="Search Complaint ID, Order Number, Customer Name..."
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
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Original Bill</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Calculated Return</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Approved Return</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Dispatch Evidence</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading finance complaints...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No complaints pending finance resolution.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const isPending = c.status === 'FINANCE_PENDING';
                  const origBill = Number(c.originalBillAmount || c.order?.totalAmount || 0);
                  const calcReturn = Number(c.calculatedComplaintAmount || 0);
                  const approvedReturn = Number(c.financeApprovedReturnAmount ?? calcReturn);

                  return (
                    <tr
                      key={c.id}
                      style={{ borderBottom: '1px solid #F1F5F9', background: isPending ? '#fff' : '#fafafa' }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#047857', fontFamily: 'monospace' }}>
                        {c.complaintNo}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1e293b' }}>
                        {c.order?.orderNumber || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#334155' }}>
                        {c.customer?.companyName || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                        {formatCurrency(origBill)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#dc2626', fontWeight: '600' }}>
                        -{formatCurrency(calcReturn)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#16a34a', fontWeight: '800' }}>
                        {c.status === 'RESOLVED' ? `-${formatCurrency(approvedReturn)}` : 'Pending'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {c.dispatchEvidence ? (
                          <a
                            href={c.dispatchEvidence}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: '700', fontSize: '12px' }}
                          >
                            ✓ Photo Verified <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isPending ? (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '800', border: '1px solid #fcd34d' }}>
                            FINANCE PENDING
                          </span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '800', border: '1px solid #bbf7d0' }}>
                            RESOLVED
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleOpenResolveModal(c)}
                            style={{
                              padding: '7px 14px',
                              background: '#047857',
                              border: 'none',
                              borderRadius: '7px',
                              fontSize: '12.5px',
                              fontWeight: '800',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 5px rgba(4,120,87,0.25)',
                            }}
                          >
                            <Scale size={14} /> Review & Resolve
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenResolveModal(c)}
                            style={{
                              padding: '6px 12px',
                              background: '#f8fafc',
                              border: '1px solid #DCE5F0',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={13} /> View Realization
                          </button>
                        )}
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
      {/* FINANCE RESOLUTION & DEDUCTION MODAL                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showResolveModal && selectedComplaint && (() => {
        const origBill = Number(selectedComplaint.originalBillAmount || selectedComplaint.order?.totalAmount || 0);
        const calcReturn = Number(selectedComplaint.calculatedComplaintAmount || 0);
        const currentReturn = Number(approvedReturnAmount);
        const netRealization = Math.max(0, origBill - currentReturn);
        const isResolved = selectedComplaint.status === 'RESOLVED';

        return (
          <div
            onClick={() => setShowResolveModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.68)',
              backdropFilter: 'blur(4px)',
              padding: '16px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                width: 'min(860px, 100%)',
                maxHeight: '94vh',
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
                    <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '18px', color: '#047857' }}>
                      {selectedComplaint.complaintNo}
                    </span>
                    <span style={{ background: isResolved ? '#dcfce7' : '#fef3c7', color: isResolved ? '#15803d' : '#b45309', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Order: <strong>{selectedComplaint.order?.orderNumber}</strong> • Customer: <strong>{selectedComplaint.customer?.companyName}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Realization Summary Highlight Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#fff',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    boxShadow: '0 8px 20px -4px rgba(4,120,87,0.3)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ORIGINAL ORDER BILL
                    </span>
                    <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>
                      {formatCurrency(origBill)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#d1fae5' }}>
                      Permanently intact in DB
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      FINANCE RETURN DEDUCTION
                    </span>
                    <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px', color: '#fecaca' }}>
                      -{formatCurrency(currentReturn)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#fee2e2' }}>
                      Adjustment via credit entry
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      NET SALES REALIZATION
                    </span>
                    <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px', color: '#fef9c3' }}>
                      {formatCurrency(netRealization)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#fef08a' }}>
                      Realized revenue for company
                    </span>
                  </div>
                </div>

                {/* Dispatch Evidence Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    DISPATCH VERIFICATION EVIDENCE & REMARKS
                  </span>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {selectedComplaint.dispatchEvidence ? (
                      <img
                        src={selectedComplaint.dispatchEvidence}
                        alt="Dispatch Evidence"
                        style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    ) : (
                      <div style={{ width: '140px', height: '100px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>
                        No Image
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: '600' }}>
                        {selectedComplaint.dispatchRemarks || 'Dispatch physical inspection completed.'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Inspected by <strong>{selectedComplaint.dispatchCompletedBy || 'Dispatch Team'}</strong> on {formatDate(selectedComplaint.dispatchCompletedAt)}
                      </div>
                      {selectedComplaint.dispatchEvidence && (
                        <a
                          href={selectedComplaint.dispatchEvidence}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', marginTop: '6px', fontWeight: '700' }}
                        >
                          Enlarge Evidence Photo <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Calculation Table */}
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: '800', color: '#334155' }}>
                    Affected Items & System Calculated Return
                  </h3>
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Product</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Unit Price</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Delivered</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#dc2626' }}>Complaint Qty</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#b91c1c' }}>Calculated Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedComplaint.items && selectedComplaint.items.length > 0 ? (
                          selectedComplaint.items.map((it) => (
                            <tr key={it.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>
                                {it.orderItem?.productNameSnapshot || it.product?.name || 'Product'}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                                {formatCurrency(it.unitPrice || it.orderItem?.unitPrice)}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                                {Number(it.deliveredQuantity || it.orderedQuantity || 0)}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#dc2626' }}>
                                {Number(it.complaintQuantity || 0)}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#b91c1c' }}>
                                {formatCurrency(it.complaintAmount || Number(it.unitPrice || 0) * Number(it.complaintQuantity || 0))}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} style={{ padding: '14px', textAlign: 'center', color: '#64748b' }}>
                              Standard order calculation: {formatCurrency(calcReturn)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Finance Inputs (If not already resolved) */}
                {!isResolved ? (
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                          Finance Approved Return Amount (₹) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          max={origBill}
                          value={approvedReturnAmount}
                          onChange={(e) => setApprovedReturnAmount(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1.5px solid #047857',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '800',
                            color: '#047857',
                            background: '#fff',
                          }}
                          required
                        />
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                          💡 Pre-filled from calculated value ({formatCurrency(calcReturn)}). You can manually adjust as agreed with customer.
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                          Net Realized Order Value (₹)
                        </label>
                        <input
                          type="text"
                          disabled
                          value={formatCurrency(netRealization)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '800',
                            color: '#15803d',
                            background: '#f0fdf4',
                          }}
                        />
                        <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '4px' }}>
                          Net revenue attributed to sales after deduction.
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                        Return Reason / Finance Remarks *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Credit note issued for 10 units transit damage as verified by Dispatch photo. Approved return deduction ₹10,000 against invoice."
                        value={financeRemarks}
                        onChange={(e) => setFinanceRemarks(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      FINANCIAL ADJUSTMENT RECORDED
                    </span>
                    <div style={{ fontSize: '13.5px', color: '#166534' }}>
                      Approved Return: <strong>-{formatCurrency(selectedComplaint.financeApprovedReturnAmount)}</strong> • Net Realization: <strong>{formatCurrency(selectedComplaint.netOrderValue || (origBill - Number(selectedComplaint.financeApprovedReturnAmount)))}</strong>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                      Finance Remarks: <em>{selectedComplaint.financeRemarks}</em>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                      Resolved by {selectedComplaint.financeResolvedBy || 'Finance Manager'} on {formatDate(selectedComplaint.financeResolvedAt)}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  style={{ padding: '9px 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                >
                  Close
                </button>

                {!isResolved && (
                  <button
                    type="button"
                    onClick={handleSubmitResolve}
                    disabled={submitting}
                    style={{
                      padding: '10px 24px',
                      background: '#047857',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(4,120,87,0.3)',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {submitting ? 'Resolving...' : 'Approve Return & Resolve Complaint'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
