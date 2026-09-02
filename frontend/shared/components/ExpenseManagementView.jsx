'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusBadge from './StatusBadge';
import DataTable from './DataTable';
import { 
  CheckCircle, XCircle, FileText, Image as ImageIcon, 
  User, Calendar, Clock, RefreshCw, AlertCircle, ShieldCheck, 
  DollarSign, X, CreditCard, Eye, ArrowRight, Check, Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { expenseService } from '../../services/expenseService';
import { useSearchParams } from 'next/navigation';

/**
 * Dedicated Secure Receipt Image Component with Loading Spinner & Graceful Fallback
 */
function SecureReceiptImage({ claim, onPreview }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [claim?.id, claim?.receiptUrl]);

  if (!claim || !claim.receiptUrl) {
    return (
      <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '20px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <ImageIcon size={22} />
        No receipt attachment uploaded with this claim.
      </div>
    );
  }

  const getReceiptUrl = () => {
    if (claim.receiptUrl.startsWith('data:') || claim.receiptUrl.startsWith('blob:')) {
      return claim.receiptUrl;
    }
    const base = `/api/backend/expenses/${claim.id || claim.claimNumber}/receipt`;
    if (typeof window !== 'undefined') {
      let token = window.sessionStorage.getItem('token') || window.localStorage.getItem('token');
      if (!token) {
        try {
          const authStorageStr = window.localStorage.getItem('auth-storage');
          if (authStorageStr) {
            token = JSON.parse(authStorageStr)?.state?.accessToken;
          }
        } catch (_) {}
      }
      if (token) return `${base}?token=${encodeURIComponent(token)}`;
    }
    return base;
  };

  const receiptEndpoint = getReceiptUrl();

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', minHeight: '140px', justifyContent: 'center', position: 'relative' }}>
      {!imgLoaded && !imgError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '12px', padding: '20px' }}>
          <Loader2 size={16} className="spin" />
          <span>Loading receipt image...</span>
        </div>
      )}

      {imgError ? (
        <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <ImageIcon size={24} color="#0284c7" />
          <span>Receipt Bill Attached</span>
          <button
            type="button"
            onClick={() => onPreview(receiptEndpoint)}
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', marginTop: '4px' }}
          >
            👁️ Open Receipt Full-Screen
          </button>
        </div>
      ) : (
        <img
          src={receiptEndpoint}
          alt="Receipt Bill Attachment"
          style={{
            maxWidth: '100%',
            maxHeight: '220px',
            borderRadius: '6px',
            cursor: 'pointer',
            objectFit: 'contain',
            display: imgLoaded ? 'block' : 'none',
            border: '1px solid #e2e8f0'
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          onClick={() => onPreview(receiptEndpoint)}
        />
      )}

      {imgLoaded && !imgError && (
        <button
          type="button"
          onClick={() => onPreview(receiptEndpoint)}
          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px' }}
        >
          👁️ Click to View Receipt Full-Screen
        </button>
      )}
    </div>
  );
}

export default function ExpenseManagementView({ roleMode }) {
  const searchParams = useSearchParams();
  const deepLinkedExpenseId = searchParams?.get('expenseId') || '';

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const effectiveRoleMode = roleMode || (
    currentPath.includes('/super-admin') ? 'SUPER_ADMIN' :
    currentPath.includes('/finance') ? 'FINANCE' : 'HR'
  );

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [pendingClaims, setPendingClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [inspectModalClaim, setInspectModalClaim] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [previewReceiptModal, setPreviewReceiptModal] = useState(null);

  // History tab states
  const [allClaims, setAllClaims] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [loadingAll, setLoadingAll] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchPendingClaims = useCallback(async () => {
    try {
      setLoading(true);
      const data = await expenseService.getPendingExpenses(effectiveRoleMode);
      const claims = Array.isArray(data) ? data : [];
      setPendingClaims(claims);
      
      // Auto-select deep-linked item or first item
      if (claims.length > 0) {
        if (deepLinkedExpenseId) {
          const matched = claims.find(c => c.claimNumber === deepLinkedExpenseId || c.id === deepLinkedExpenseId || c.publicId === deepLinkedExpenseId);
          if (matched) {
            setSelectedClaim(matched);
            return;
          }
        }
        setSelectedClaim(prev => {
          if (!prev) return claims[0];
          const matched = claims.find(c => c.id === prev.id);
          return matched || claims[0];
        });
      } else {
        setSelectedClaim(null);
      }
    } catch (err) {
      console.error('Failed to retrieve pending expense claims', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveRoleMode, deepLinkedExpenseId]);

  const fetchAllClaims = useCallback(async () => {
    try {
      setLoadingAll(true);
      const data = await expenseService.getAllExpenses();
      const claims = Array.isArray(data) ? data : [];
      setAllClaims(claims);

      // If deep linked ID is in history, open inspect modal
      if (deepLinkedExpenseId && claims.length > 0) {
        const matched = claims.find(c => c.claimNumber === deepLinkedExpenseId || c.id === deepLinkedExpenseId);
        if (matched) {
          setInspectModalClaim(matched);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve all expense claims', err);
    } finally {
      setLoadingAll(false);
    }
  }, [deepLinkedExpenseId]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingClaims();
    } else {
      fetchAllClaims();
    }
  }, [activeTab, fetchPendingClaims, fetchAllClaims]);

  /**
   * Handle Decision (Approve / Reject) with SweetAlert2 Yes/No Confirmation
   */
  const handleDecision = async (action, claimToProcess = selectedClaim) => {
    if (!claimToProcess) return;
    
    if (action === 'reject') {
      const { value: rejectReason, isConfirmed } = await Swal.fire({
        title: 'Reject Expense Claim?',
        html: `
          <div style="text-align: left; display: flex; flex-direction: column; gap: 8px;">
            <p style="margin: 0 0 8px 0; font-size: 13.5px; color: #475569;">
              Are you sure you want to decline claim <strong>${claimToProcess.claimNumber || 'EXP'}</strong> (₹${Number(claimToProcess.amount).toLocaleString('en-IN')}) submitted by <strong>${claimToProcess.employeeName || claimToProcess.user?.name}</strong>?
            </p>
            <label style="font-weight: 700; font-size: 12.5px; color: #1e293b;">Reason for Rejection *</label>
            <textarea id="swal-reject-reason" class="swal2-textarea" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 13px; min-height: 80px;" placeholder="Please specify the reason for declining this claim...">${remarks}</textarea>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Reject Claim',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        preConfirm: () => {
          const val = document.getElementById('swal-reject-reason')?.value;
          if (!val || !val.trim()) {
            Swal.showValidationMessage('Please provide a reason for declining this claim!');
            return false;
          }
          return val.trim();
        }
      });

      if (!isConfirmed || !rejectReason) return;

      try {
        setProcessing(true);
        await expenseService.rejectExpense(claimToProcess.id, { remarks: rejectReason });
        Swal.fire({
          icon: 'success',
          title: 'Claim Rejected',
          text: 'The claimant has been notified of the rejection reason.',
          confirmButtonColor: '#0284c7'
        });
        setRemarks('');
        setInspectModalClaim(null);
        await fetchPendingClaims();
        fetchAllClaims();
      } catch (err) {
        console.error('Failed to reject claim:', err);
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: err?.message || 'Failed to reject claim',
          confirmButtonColor: '#0284c7'
        });
      } finally {
        setProcessing(false);
      }
      return;
    }

    // ── Approval Flow ──
    const targetStageText = effectiveRoleMode === 'HR' 
      ? 'Super Admin for authorization' 
      : effectiveRoleMode === 'SUPER_ADMIN' 
      ? 'Finance for disbursement' 
      : 'Final Settlement (Paid & Stored in History)';

    const confirmBtnText = effectiveRoleMode === 'FINANCE'
      ? 'Yes, Settle & Finalize Payment'
      : effectiveRoleMode === 'SUPER_ADMIN'
      ? 'Yes, Approve to Finance'
      : 'Yes, Approve to Super Admin';

    const { value: confirmData, isConfirmed } = await Swal.fire({
      title: effectiveRoleMode === 'FINANCE' ? 'Finalize & Settle Expense?' : 'Approve Expense Claim?',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px;">
          <p style="margin: 0 0 6px 0; font-size: 13.5px; color: #475569;">
            Are you sure you want to approve claim <strong>${claimToProcess.claimNumber || 'EXP'}</strong> of <strong>₹${Number(claimToProcess.amount).toLocaleString('en-IN')}</strong> submitted by <strong>${claimToProcess.employeeName || claimToProcess.user?.name}</strong>?
          </p>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #0369a1; font-weight: 600;">
            Next Step: <strong>${targetStageText}</strong>
          </div>
          ${effectiveRoleMode === 'FINANCE' ? `
            <div style="margin-top: 4px;">
              <label style="font-weight: 700; font-size: 12.5px; color: #1e293b;">Payment / Disbursal Reference (Optional)</label>
              <input id="swal-payment-ref" class="swal2-input" style="margin: 4px 0 0 0; width: 100%; box-sizing: border-box; font-size: 13px; height: 38px;" placeholder="e.g. UTR-98214810293, Cheque #004921, Bank Transfer Ref" value="${paymentReference}" />
            </div>
          ` : ''}
          <div style="margin-top: 4px;">
            <label style="font-weight: 700; font-size: 12.5px; color: #1e293b;">Approval Remarks (Optional)</label>
            <textarea id="swal-approval-remarks" class="swal2-textarea" style="margin: 4px 0 0 0; width: 100%; box-sizing: border-box; font-size: 13px; min-height: 60px;" placeholder="Add remarks or notes...">${remarks}</textarea>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const rem = document.getElementById('swal-approval-remarks')?.value || '';
        const pRef = document.getElementById('swal-payment-ref')?.value || '';
        return { remarks: rem.trim(), paymentReference: pRef.trim() };
      }
    });

    if (!isConfirmed) return;

    try {
      setProcessing(true);
      await expenseService.approveExpense(claimToProcess.id, {
        remarks: confirmData.remarks || remarks.trim() || undefined,
        paymentReference: effectiveRoleMode === 'FINANCE' ? (confirmData.paymentReference || paymentReference.trim() || undefined) : undefined
      });

      Swal.fire({
        icon: 'success',
        title: effectiveRoleMode === 'FINANCE' ? 'Expense Settled & Stored in History! 🎉' : 'Claim Approved Successfully',
        text: effectiveRoleMode === 'HR'
          ? 'Claim has been verified and forwarded to Super Admin.'
          : effectiveRoleMode === 'SUPER_ADMIN'
          ? 'Claim has been authorized and forwarded to Finance for payment.'
          : 'Payment has been settled and moved to Company Claims History Log.',
        confirmButtonColor: '#0284c7'
      });

      setRemarks('');
      setPaymentReference('');
      setInspectModalClaim(null);
      await fetchPendingClaims();
      fetchAllClaims();
    } catch (err) {
      console.error('Failed to approve claim:', err);
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err?.message || 'Failed to approve claim',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Filter history claims based on search query and status dropdown
  const filteredClaims = React.useMemo(() => {
    return allClaims.filter(claim => {
      const q = historySearch.toLowerCase();
      const matchesSearch = !historySearch || 
        (claim.employeeName || '').toLowerCase().includes(q) ||
        (claim.userRoleName || '').toLowerCase().includes(q) ||
        (claim.claimNumber || '').toLowerCase().includes(q) ||
        (claim.expenseName || '').toLowerCase().includes(q) ||
        (claim.department || '').toLowerCase().includes(q);

      const matchesStatus = historyStatusFilter === 'all' || claim.status === historyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allClaims, historySearch, historyStatusFilter]);

  const historyColumns = [
    {
      header: 'Claim #',
      accessor: 'claimNumber',
      render: (row) => (
        <span style={{ fontSize: '11.5px', fontWeight: '800', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px' }}>
          {row.claimNumber || 'EXP'}
        </span>
      )
    },
    {
      header: 'Claim Date',
      accessor: 'expenseDate',
      render: (row) => new Date(row.expenseDate).toLocaleDateString()
    },
    {
      header: 'Employee / Claimant',
      accessor: 'employeeName',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{row.employeeName || row.user?.name || 'Staff Member'}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            <span style={{ fontWeight: '700', color: '#0369a1' }}>{row.userRoleName || row.designation || 'Staff'}</span> • {row.department || 'Operations'}
          </span>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'expenseName',
      render: (row) => <strong>{row.expenseName}</strong>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => <strong style={{ color: '#0284c7', fontWeight: '800' }}>₹{Number(row.amount).toLocaleString('en-IN')}</strong>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Receipt',
      accessor: 'receiptUrl',
      render: (row) => row.receiptUrl ? (
        <button
          type="button"
          onClick={() => setPreviewReceiptModal(`/api/backend/expenses/${row.id || row.claimNumber}/receipt`)}
          style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
        >
          👁️ View Bill
        </button>
      ) : (
        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>No Attachment</span>
      )
    }
  ];

  const renderHistoryActions = (row) => (
    <button
      type="button"
      onClick={() => setInspectModalClaim(row)}
      style={{
        padding: '6px 14px',
        borderRadius: '6px',
        border: '1px solid #0284c7',
        background: '#f0f9ff',
        color: '#0284c7',
        fontSize: '12px',
        fontWeight: '800',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <Eye size={13} /> Inspect
    </button>
  );

  return (
    <div className="hr-expense-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      {/* Header Bar */}
      <div className="hr-expense-header-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Expense Management &amp; Approvals
            </h2>
            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
              {effectiveRoleMode === 'SUPER_ADMIN' ? 'Super Admin Approval' : effectiveRoleMode === 'FINANCE' ? 'Finance Settlement' : 'HR Verification'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
            {effectiveRoleMode === 'SUPER_ADMIN' 
              ? 'Authorize verified claims and route them to Finance for disbursement.' 
              : effectiveRoleMode === 'FINANCE'
              ? 'Verify management authorizations and execute payment settlements (Done / Settle).'
              : 'Audit employee claims, receipts, and forward valid submissions to Super Admin.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTab === 'pending') fetchPendingClaims();
            else fetchAllClaims();
          }}
          disabled={loading || loadingAll}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '700',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={(loading || loadingAll) ? 'spin' : ''} />
          <span>Refresh Claims</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div 
        className="hr-expense-tabs-scroll-bar erp-tab-scroll-bar"
        style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e2e8f0', 
          gap: '8px', 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch', 
          minWidth: 0, 
          width: '100%', 
          boxSizing: 'border-box', 
          paddingBottom: '2px',
          paddingRight: '16px',
          scrollBehavior: 'smooth',
          touchAction: 'pan-x',
          cursor: 'grab'
        }}
      >
        {[
          { key: 'pending', label: `Pending Claims Queue (${pendingClaims.length})`, icon: Clock },
          { key: 'history', label: 'Company Claims History Log', icon: FileText }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: isActive ? '800' : '600',
                color: isActive ? '#0284c7' : '#64748b',
                borderBottom: isActive ? '2.5px solid #0284c7' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                userSelect: 'none'
              }}
            >
              <TabIcon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'pending' ? (
        /* Pending Claims split view */
        <div className="hr-expense-split-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', flex: 1, minHeight: 0 }}>
          
          {/* Left Column: Pending List */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', padding: '16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Pending Tasks ({pendingClaims.length})
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                Stage: {effectiveRoleMode === 'SUPER_ADMIN' ? 'Super Admin Review' : effectiveRoleMode === 'FINANCE' ? 'Finance Settlement' : 'HR Review'}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading && pendingClaims.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>Syncing claims...</p>
              ) : pendingClaims.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={32} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>Queue Clear!</span>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                    No pending expense claims require your action at this time.
                  </p>
                </div>
              ) : (
                pendingClaims.map(claim => {
                  const isSelected = selectedClaim && claim.id === selectedClaim.id;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => { setSelectedClaim(claim); setRemarks(''); setPaymentReference(''); }}
                      style={{
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px',
                        background: isSelected ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: '800', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>
                              {claim.claimNumber || 'EXP'}
                            </span>
                            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{claim.expenseName}</strong>
                          </div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0284c7', whiteSpace: 'nowrap' }}>
                          ₹{Number(claim.amount).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                        <span>Submitted by: <strong>{claim.employeeName || claim.user?.name}</strong></span>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700' }}>
                          {claim.userRoleName || claim.designation}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                        <StatusBadge status={claim.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Claim Details */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedClaim ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                
                {/* Profile Card */}
                <div style={{ borderBottom: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={22} style={{ color: '#0284c7' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{selectedClaim.employeeName || selectedClaim.user?.name}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                        <span style={{ color: '#0369a1', fontWeight: '700' }}>{selectedClaim.userRoleName || selectedClaim.designation}</span> • <span style={{ color: '#0284c7' }}>{selectedClaim.department}</span>
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '800', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px' }}>
                    {selectedClaim.claimNumber || 'EXP'}
                  </span>
                </div>

                {/* Scrollable details */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Description Card */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', background: '#f1f5f9', padding: '16px', borderRadius: '10px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Description</span>
                      <strong style={{ fontSize: '13.5px', color: '#1e293b', display: 'block', marginTop: '4px' }}>{selectedClaim.expenseName}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Claim Amount</span>
                      <strong style={{ fontSize: '15px', color: '#0284c7', display: 'block', marginTop: '4px', fontWeight: '900' }}>
                        ₹{Number(selectedClaim.amount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Expense Date</span>
                      <strong style={{ fontSize: '13.5px', color: '#1e293b', display: 'block', marginTop: '4px' }}>
                        {new Date(selectedClaim.expenseDate).toLocaleDateString()}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Workflow State</span>
                      <div style={{ marginTop: '4px' }}>
                        <StatusBadge status={selectedClaim.status} />
                      </div>
                    </div>
                  </div>

                  {/* Previous Approvals Timeline / Cards */}
                  {(selectedClaim.hrRemarks || selectedClaim.superAdminRemarks || selectedClaim.financeRemarks) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Approval Trail</span>
                      
                      {selectedClaim.hrRemarks && (
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#0369a1' }}>
                          <strong>HR Approval ({selectedClaim.hrApprovedBy || 'HR Manager'}):</strong>
                          <p style={{ margin: '4px 0 0 0' }}>{selectedClaim.hrRemarks}</p>
                          {selectedClaim.hrApprovedAt && <span style={{ fontSize: '10.5px', color: '#0284c7', display: 'block', marginTop: '4px' }}>{new Date(selectedClaim.hrApprovedAt).toLocaleString()}</span>}
                        </div>
                      )}

                      {selectedClaim.superAdminRemarks && (
                        <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#854d0e' }}>
                          <strong>Super Admin Approval ({selectedClaim.superAdminApprovedBy || 'Super Admin'}):</strong>
                          <p style={{ margin: '4px 0 0 0' }}>{selectedClaim.superAdminRemarks}</p>
                          {selectedClaim.superAdminApprovedAt && <span style={{ fontSize: '10.5px', color: '#a16207', display: 'block', marginTop: '4px' }}>{new Date(selectedClaim.superAdminApprovedAt).toLocaleString()}</span>}
                        </div>
                      )}

                      {selectedClaim.financeRemarks && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#166534' }}>
                          <strong>Finance Settlement ({selectedClaim.financeProcessedBy || 'Finance Head'}):</strong>
                          <p style={{ margin: '4px 0 0 0' }}>{selectedClaim.financeRemarks}</p>
                          {selectedClaim.paymentReference && <span style={{ display: 'block', marginTop: '2px', fontWeight: '700' }}>Ref: {selectedClaim.paymentReference}</span>}
                          {selectedClaim.financeProcessedAt && <span style={{ fontSize: '10.5px', color: '#15803d', display: 'block', marginTop: '4px' }}>{new Date(selectedClaim.financeProcessedAt).toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Receipt Image Panel */}
                  <div>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Receipt Bill Attachment</h5>
                    <SecureReceiptImage claim={selectedClaim} onPreview={(url) => setPreviewReceiptModal(url)} />
                  </div>

                  {/* Finance Payment Reference Field */}
                  {effectiveRoleMode === 'FINANCE' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>Payment / Disbursal Reference (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. UTR-98214810293, Cheque #004921, Bank Transfer Ref"
                        value={paymentReference}
                        onChange={e => setPaymentReference(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '13px',
                          marginTop: '4px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}

                  {/* Audit Approval Remarks Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                      {effectiveRoleMode === 'FINANCE' ? 'Finance Processing Notes' : 'Approval Remarks / Reason'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={effectiveRoleMode === 'FINANCE' ? "Enter disbursement details or decline reason..." : "Enter approval comments or decline reasons..."}
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                        background: '#ffffff',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                </div>

                {/* Action Buttons Panel */}
                <div className="hr-expense-actions-bar" style={{ borderTop: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleDecision('reject')}
                    className="hr-expense-reject-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: processing ? 'wait' : 'pointer'
                    }}
                  >
                    <XCircle size={15} /> Reject Claim
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleDecision('approve')}
                    className="hr-expense-approve-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '9px 20px',
                      background: effectiveRoleMode === 'FINANCE' ? '#15803d' : '#16a34a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: processing ? 'wait' : 'pointer',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <CheckCircle size={15} /> 
                    {effectiveRoleMode === 'HR' 
                      ? 'Approve (Forward to Super Admin)' 
                      : effectiveRoleMode === 'SUPER_ADMIN'
                      ? 'Approve (Forward to Finance)'
                      : '✓ Done / Settle & Finalize Payment'}
                  </button>
                </div>

              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#94a3b8', gap: '8px' }}>
                <AlertCircle size={32} />
                <strong style={{ fontSize: '14px', color: '#475569' }}>Select a Claim</strong>
                <p style={{ margin: 0, fontSize: '12px', textAlign: 'center' }}>Choose an expense request from the pending list to review and perform audit actions.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* History Log Panel */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>
          
          {/* Filters Bar */}
          <div className="app-card hr-expense-history-filters" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div className="hr-expense-filter-field" style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center', minWidth: '260px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569', whiteSpace: 'nowrap' }}>Search Query:</span>
              <input
                type="text"
                placeholder="Filter by claim number, employee, role, description, department..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13.5px',
                  outline: 'none',
                  minWidth: 0
                }}
              />
            </div>
            <div className="hr-expense-filter-field" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569', whiteSpace: 'nowrap' }}>Workflow Status:</span>
              <select
                value={historyStatusFilter}
                onChange={e => setHistoryStatusFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13.5px',
                  background: '#ffffff',
                  fontWeight: '700',
                  color: '#475569',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="PENDING_HR">Pending HR</option>
                <option value="PENDING_SUPERADMIN">Pending Super Admin</option>
                <option value="PENDING_FINANCE">Pending Finance</option>
                <option value="FINANCE_PROCESSED">Processed / Settled</option>
                <option value="REJECTED">Declined</option>
              </select>
            </div>
          </div>

          {/* Table / Cards Container */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', overflowY: 'auto', flex: 1 }}>
            {loadingAll && allClaims.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Syncing claims database...</p>
            ) : (
              <>
                <div className="desktop-only">
                  <DataTable 
                    columns={historyColumns}
                    data={filteredClaims}
                    searchQuery=""
                    searchField=""
                    actions={renderHistoryActions}
                    emptyMessage="No historical expense claims match your search filters."
                  />
                </div>

                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredClaims.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b', fontSize: '13px' }}>
                      No historical expense claims match your search filters.
                    </div>
                  ) : (
                    filteredClaims.map((claim) => (
                      <div
                        key={claim.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '14px',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>
                                {claim.claimNumber || 'EXP'}
                              </span>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{claim.expenseName}</strong>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              {claim.employeeName} • <span style={{ color: '#0369a1', fontWeight: '700' }}>{claim.userRoleName || claim.designation}</span>
                            </div>
                          </div>
                          <StatusBadge status={claim.status} />
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          gap: '8px'
                        }}>
                          <div>
                            <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Claim Amount</span>
                            <strong style={{ fontSize: '14px', color: '#0284c7' }}>₹{Number(claim.amount).toLocaleString('en-IN')}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Claim Date</span>
                            <strong style={{ fontSize: '12px', color: '#334155' }}>{new Date(claim.expenseDate).toLocaleDateString()}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {claim.receiptUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewReceiptModal(`/api/backend/expenses/${claim.id || claim.claimNumber}/receipt`)}
                              style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', fontSize: '12px', fontWeight: 750, color: '#0369a1', cursor: 'pointer' }}
                            >
                              👁️ View Receipt
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setInspectModalClaim(claim)}
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: 'none', background: '#0284c7', fontSize: '12px', fontWeight: 750, color: '#fff', cursor: 'pointer' }}
                          >
                            Inspect Claim
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── INSPECT HISTORICAL CLAIM MODAL ── */}
      {inspectModalClaim && (
        <div
          onClick={() => setInspectModalClaim(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#38bdf8" />
                <span style={{ fontSize: '15px', fontWeight: '800' }}>
                  Claim Inspection ({inspectModalClaim.claimNumber || 'EXP'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalClaim(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Profile Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#0284c7" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      {inspectModalClaim.employeeName || inspectModalClaim.user?.name}
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      <strong style={{ color: '#0369a1' }}>{inspectModalClaim.userRoleName || inspectModalClaim.designation}</strong> • {inspectModalClaim.department}
                    </span>
                  </div>
                </div>
                <StatusBadge status={inspectModalClaim.status} />
              </div>

              {/* Data Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f1f5f9', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Description</span>
                  <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginTop: '2px' }}>{inspectModalClaim.expenseName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Claim Amount</span>
                  <strong style={{ fontSize: '14.5px', color: '#0284c7', display: 'block', marginTop: '2px', fontWeight: '900' }}>
                    ₹{Number(inspectModalClaim.amount).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Expense Date</span>
                  <strong style={{ fontSize: '12.5px', color: '#1e293b', display: 'block', marginTop: '2px' }}>
                    {new Date(inspectModalClaim.expenseDate).toLocaleDateString()}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Submitted At</span>
                  <strong style={{ fontSize: '12.5px', color: '#1e293b', display: 'block', marginTop: '2px' }}>
                    {new Date(inspectModalClaim.createdAt).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Full Timeline of Approvals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Audit &amp; Approval Timeline</span>
                
                {/* 1. Submission */}
                <div style={{ borderLeft: '3px solid #94a3b8', paddingLeft: '12px', paddingBottom: '6px' }}>
                  <strong style={{ fontSize: '12px', color: '#334155' }}>1. Submitted by Claimant</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                    {inspectModalClaim.employeeName || inspectModalClaim.user?.name} ({inspectModalClaim.userRoleName || 'Staff'}) on {new Date(inspectModalClaim.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* 2. HR Approval */}
                {inspectModalClaim.hrRemarks && (
                  <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '12px', paddingBottom: '6px' }}>
                    <strong style={{ fontSize: '12px', color: '#0369a1' }}>2. HR Verification ({inspectModalClaim.hrApprovedBy || 'HR'})</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#334155' }}>{inspectModalClaim.hrRemarks}</p>
                    {inspectModalClaim.hrApprovedAt && <span style={{ fontSize: '10.5px', color: '#64748b' }}>{new Date(inspectModalClaim.hrApprovedAt).toLocaleString()}</span>}
                  </div>
                )}

                {/* 3. Super Admin Approval */}
                {inspectModalClaim.superAdminRemarks && (
                  <div style={{ borderLeft: '3px solid #eab308', paddingLeft: '12px', paddingBottom: '6px' }}>
                    <strong style={{ fontSize: '12px', color: '#854d0e' }}>3. Super Admin Authorization ({inspectModalClaim.superAdminApprovedBy || 'Super Admin'})</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#334155' }}>{inspectModalClaim.superAdminRemarks}</p>
                    {inspectModalClaim.superAdminApprovedAt && <span style={{ fontSize: '10.5px', color: '#64748b' }}>{new Date(inspectModalClaim.superAdminApprovedAt).toLocaleString()}</span>}
                  </div>
                )}

                {/* 4. Finance Settlement */}
                {inspectModalClaim.financeRemarks && (
                  <div style={{ borderLeft: '3px solid #16a34a', paddingLeft: '12px', paddingBottom: '6px' }}>
                    <strong style={{ fontSize: '12px', color: '#166534' }}>4. Finance Settlement ({inspectModalClaim.financeProcessedBy || 'Finance Head'})</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#334155' }}>{inspectModalClaim.financeRemarks}</p>
                    {inspectModalClaim.paymentReference && <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', display: 'block' }}>Ref: {inspectModalClaim.paymentReference}</span>}
                    {inspectModalClaim.financeProcessedAt && <span style={{ fontSize: '10.5px', color: '#64748b' }}>{new Date(inspectModalClaim.financeProcessedAt).toLocaleString()}</span>}
                  </div>
                )}
              </div>

              {/* Receipt Bill Preview */}
              {inspectModalClaim.receiptUrl && (
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Receipt Bill Attachment</span>
                  <SecureReceiptImage claim={inspectModalClaim} onPreview={(url) => setPreviewReceiptModal(url)} />
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setInspectModalClaim(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN RECEIPT VIEWER MODAL ── */}
      {previewReceiptModal && (
        <div
          onClick={() => setPreviewReceiptModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ padding: '14px 20px', background: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '800' }}>Receipt Bill Attachment</span>
              <button
                type="button"
                onClick={() => setPreviewReceiptModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <img
                src={previewReceiptModal}
                alt="Receipt Full Preview"
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.receipt-error-msg')) {
                    const div = document.createElement('div');
                    div.className = 'receipt-error-msg';
                    div.style.textAlign = 'center';
                    div.style.padding = '30px';
                    div.style.color = '#475569';
                    div.innerHTML = `<p style="font-weight:700;font-size:14px;color:#0f172a;">Receipt Image Attached</p><a href="${previewReceiptModal}" target="_blank" style="color:#0284c7;text-decoration:underline;font-weight:700;">Click here to download/view receipt file</a>`;
                    parent.appendChild(div);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
