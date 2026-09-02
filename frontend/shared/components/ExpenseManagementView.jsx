'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from './StatusBadge';
import DataTable from './DataTable';
import { 
  CheckCircle, XCircle, FileText, Image as ImageIcon, 
  User, Calendar, Clock, RefreshCw, AlertCircle, ShieldCheck, DollarSign, X, CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';
import { expenseService } from '../../services/expenseService';

export default function ExpenseManagementView({ roleMode }) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const effectiveRoleMode = roleMode || (
    currentPath.includes('/super-admin') ? 'SUPER_ADMIN' :
    currentPath.includes('/finance') ? 'FINANCE' : 'HR'
  );

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [pendingClaims, setPendingClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
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
      const data = await expenseService.getPendingExpenses();
      const claims = Array.isArray(data) ? data : [];
      setPendingClaims(claims);
      
      // Auto-select first item or preserve existing selection
      if (claims.length > 0) {
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
  }, []);

  const fetchAllClaims = useCallback(async () => {
    try {
      setLoadingAll(true);
      const data = await expenseService.getAllExpenses();
      setAllClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to retrieve all expense claims', err);
    } finally {
      setLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingClaims();
    } else {
      fetchAllClaims();
    }
  }, [activeTab, fetchPendingClaims, fetchAllClaims]);

  const handleDecision = async (action) => {
    if (!selectedClaim) return;
    
    if (action === 'reject' && !remarks.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Rejection Reason Required',
        text: 'Please provide a clear reason for declining this expense claim in the remarks field.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    try {
      setProcessing(true);
      if (action === 'approve') {
        await expenseService.approveExpense(selectedClaim.id, {
          remarks: remarks.trim() || undefined,
          paymentReference: effectiveRoleMode === 'FINANCE' ? (paymentReference.trim() || undefined) : undefined,
        });

        Swal.fire({
          icon: 'success',
          title: effectiveRoleMode === 'FINANCE' ? 'Expense Settled & Processed' : 'Claim Approved',
          text: effectiveRoleMode === 'HR' 
            ? 'Claim has been forwarded to Super Admin for approval.' 
            : effectiveRoleMode === 'SUPER_ADMIN'
            ? 'Claim has been forwarded to Finance for payment processing.'
            : 'Expense claim has been marked as settled & finalized.',
          confirmButtonColor: '#0284c7'
        });
      } else {
        await expenseService.rejectExpense(selectedClaim.id, {
          remarks: remarks.trim(),
        });

        Swal.fire({
          icon: 'success',
          title: 'Claim Rejected',
          text: 'The claimant has been notified of the rejection reason.',
          confirmButtonColor: '#0284c7'
        });
      }

      setRemarks('');
      setPaymentReference('');
      await fetchPendingClaims();
      fetchAllClaims();
    } catch (err) {
      console.error(`Failed to execute expense decision ${action}`, err);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err?.message || 'Failed to update expense claim state.',
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
      header: 'Employee',
      accessor: 'employeeName',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{row.employeeName || row.user?.name || 'Staff Member'}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{row.designation || 'Staff'} • <span style={{ color: '#0284c7' }}>{row.department || 'Operations'}</span></span>
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
          onClick={() => setPreviewReceiptModal(row.receiptUrl)}
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
      onClick={() => {
        setSelectedClaim(row);
        setActiveTab('pending');
      }}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        color: '#0284c7',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
      }}
    >
      Inspect
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
              ? 'Authorize verified HR claims and route them to Finance for disbursement.' 
              : effectiveRoleMode === 'FINANCE'
              ? 'Verify final management authorizations and execute payment settlements.'
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
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                Stage: {effectiveRoleMode === 'SUPER_ADMIN' ? 'Super Admin' : effectiveRoleMode === 'FINANCE' ? 'Finance' : 'HR'}
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
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '10px' }}>
                          {claim.department}
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
                        {selectedClaim.designation} • <span style={{ color: '#0284c7' }}>{selectedClaim.department}</span>
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
                          <strong>HR Approval ({selectedClaim.hrApprovedBy || 'HR'}):</strong>
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
                          <strong>Finance Settlement ({selectedClaim.financeProcessedBy || 'Finance'}):</strong>
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
                    {selectedClaim.receiptUrl ? (
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <img
                          src={selectedClaim.receiptUrl}
                          alt="Receipt Bill"
                          style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', cursor: 'pointer', objectFit: 'contain' }}
                          onClick={() => setPreviewReceiptModal(selectedClaim.receiptUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptModal(selectedClaim.receiptUrl)}
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px' }}
                        >
                          👁️ View Full-Screen Receipt
                        </button>
                      </div>
                    ) : (
                      <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '20px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={22} />
                        No receipt attachment uploaded with this claim.
                      </div>
                    )}
                  </div>

                  {/* Finance Payment Reference Field */}
                  {effectiveRoleMode === 'FINANCE' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>Payment / Disbursal Reference (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. UTR-98234710293, Cheque #004921, Bank Transfer Ref"
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
                      background: '#16a34a',
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
                      : 'Process & Settle Expense'}
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
                placeholder="Filter by claim number, employee, description, department..."
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
                              {claim.employeeName} • <span style={{ color: '#0284c7', fontWeight: 600 }}>{claim.department}</span>
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
                              onClick={() => setPreviewReceiptModal(claim.receiptUrl)}
                              style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', fontSize: '12px', fontWeight: 700, color: '#0369a1', cursor: 'pointer' }}
                            >
                              👁️ View Receipt
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaim(claim);
                              setActiveTab('pending');
                            }}
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: 'none', background: '#0284c7', fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                          >
                            Review Claim
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
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={previewReceiptModal}
                alt="Receipt Full Preview"
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
