'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import StatusBadge from './StatusBadge';
import DataTable from './DataTable';
import { 
  CheckCircle, XCircle, FileText, Image as ImageIcon, 
  User, Calendar, Clock, RefreshCw, AlertCircle 
} from 'lucide-react';

export default function ExpenseManagementView({ roleMode }) {
  const isSuperAdmin = roleMode === 'SUPER_ADMIN' || (typeof window !== 'undefined' && window.location.pathname.includes('/super-admin'));
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [pendingClaims, setPendingClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [remarks, setRemarks] = useState('');
  
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
      const res = await apiClient.get('/expenses/pending');
      if (res && res.success && Array.isArray(res.data)) {
        setPendingClaims(res.data);
        
        // Auto-select first item or update existing selection references
        if (res.data.length > 0) {
          const matched = res.data.find(c => selectedClaim && c.id === selectedClaim.id);
          setSelectedClaim(matched || res.data[0]);
        } else {
          setSelectedClaim(null);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve pending claims', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClaim]);

  const fetchAllClaims = useCallback(async () => {
    try {
      setLoadingAll(true);
      const res = await apiClient.get('/expenses/all');
      if (res && res.success && Array.isArray(res.data)) {
        setAllClaims(res.data);
      }
    } catch (err) {
      console.error('Failed to retrieve all claims', err);
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
  }, [activeTab]);

  const handleDecision = async (action) => {
    if (!selectedClaim) return;
    
    try {
      setProcessing(true);
      const endpoint = `/expenses/${selectedClaim.id}/${action}`;
      
      const res = await apiClient.patch(endpoint, { remarks });
      if (res && res.success) {
        setRemarks('');
        await fetchPendingClaims();
        fetchAllClaims();
      }
    } catch (err) {
      console.error(`Failed to execute expense decision ${action}`, err);
      alert(`Action failed: ${err.message || 'Server error'}`);
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
        (claim.expenseName || '').toLowerCase().includes(q) ||
        (claim.department || '').toLowerCase().includes(q);

      const matchesStatus = historyStatusFilter === 'all' || claim.status === historyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allClaims, historySearch, historyStatusFilter]);

  const historyColumns = [
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
          <strong>{row.employeeName || 'Staff Member'}</strong>
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
      render: (row) => <strong style={{ color: '#0284c7' }}>₹{Number(row.amount).toLocaleString('en-IN')}</strong>
    },
    {
      header: 'Receipt',
      accessor: 'receiptUrl',
      render: (row) => row.receiptUrl ? (
        <button
          type="button"
          onClick={() => {
            const w = window.open();
            w.document.write(`<img src="${row.receiptUrl}" style="max-width:100%; max-height:100vh; object-fit:contain; display:block; margin:auto;" />`);
          }}
          style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
        >
          👁️ View Bill
        </button>
      ) : (
        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>No Receipt</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'HR Approved By',
      accessor: 'hrApprovedBy',
      render: (row) => row.hrApprovedBy ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{row.hrApprovedBy}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{row.hrApprovedAt ? new Date(row.hrApprovedAt).toLocaleDateString() : ''}</span>
        </div>
      ) : (
        <span style={{ color: '#cbd5e1', fontSize: '11.5px' }}>—</span>
      )
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      render: (row) => row.remarks ? (
        <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }} title={row.remarks}>
          {row.remarks.length > 30 ? `${row.remarks.substring(0, 30)}...` : row.remarks}
        </span>
      ) : (
        <span style={{ color: '#cbd5e1', fontSize: '11.5px' }}>—</span>
      )
    }
  ];

  const renderHistoryActions = (row) => {
    const isPending = isSuperAdmin ? row.status === 'PENDING_SUPER_ADMIN' : row.status === 'PENDING_HR';
    if (isPending) {
      return (
        <button
          type="button"
          onClick={() => {
            setSelectedClaim(row);
            setActiveTab('pending');
          }}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.15)'
          }}
        >
          Review
        </button>
      );
    }
    return null;
  };

  return (
    <div className="hr-expense-mgmt-root" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: 'calc(100vh - 140px)', minHeight: '500px' }}>
      
      {/* Header */}
      <div className="hr-expense-header erp-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#ffffff', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Expense Management</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Review and approve employee corporate reimbursement claims.
          </p>
        </div>
        <button
          onClick={activeTab === 'pending' ? fetchPendingClaims : fetchAllClaims}
          disabled={loading || loadingAll}
          className="hr-expense-sync-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#0f172a',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading || loadingAll ? 'spin' : ''} />
          Sync Queue
        </button>
      </div>

      {/* Navigation Tabs */}
      <div 
        className="erp-tab-scroll-bar hr-expense-tab-bar" 
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
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY * 0.8;
          }
        }}
        onMouseDown={(e) => {
          const el = e.currentTarget;
          el.dataset.isDown = 'true';
          el.dataset.startX = String(e.pageX - el.offsetLeft);
          el.dataset.scrollLeft = String(el.scrollLeft);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.dataset.isDown = 'false';
        }}
        onMouseUp={(e) => {
          e.currentTarget.dataset.isDown = 'false';
        }}
        onMouseMove={(e) => {
          const el = e.currentTarget;
          if (el.dataset.isDown !== 'true') return;
          e.preventDefault();
          const x = e.pageX - el.offsetLeft;
          const startX = Number(el.dataset.startX || 0);
          const scrollLeft = Number(el.dataset.scrollLeft || 0);
          const walk = (x - startX) * 1.5;
          el.scrollLeft = scrollLeft - walk;
        }}
      >
        {[
          { key: 'pending', label: 'Pending Claims Queue', icon: Clock },
          { key: 'history', label: 'Claims History Log', icon: FileText }
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
            <div style={{ borderBottom: '1px solid #e2e8f0', padding: '16px', background: '#f8fafc' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                Pending Tasks ({pendingClaims.length})
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading && pendingClaims.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>Syncing claims...</p>
              ) : pendingClaims.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={32} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>Queue Clear!</span>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>No pending expense claims require your approval at this time.</p>
                </div>
              ) : (
                pendingClaims.map(claim => {
                  const isSelected = selectedClaim && claim.id === selectedClaim.id;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => { setSelectedClaim(claim); setRemarks(''); }}
                      style={{
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        borderRadius: '8px',
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
                        <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{claim.expenseName}</strong>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0284c7', whiteSpace: 'nowrap' }}>
                          ₹{Number(claim.amount).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                        <span>Submitted by: <strong>{claim.employeeName}</strong></span>
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '10px' }}>
                          {claim.department}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(claim.createdAt).toLocaleDateString()}</span>
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
                <div style={{ borderBottom: '1px solid #e2e8f0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={24} style={{ color: '#0284c7' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{selectedClaim.employeeName}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                      {selectedClaim.designation} • <span style={{ color: '#0284c7' }}>{selectedClaim.department}</span>
                    </p>
                  </div>
                </div>

                {/* Scrollable details */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Description Card */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', background: '#f1f5f9', padding: '16px', borderRadius: '10px' }}>
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
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Current Workflow State</span>
                      <div style={{ marginTop: '4px' }}>
                        <StatusBadge status={selectedClaim.status} />
                      </div>
                    </div>
                  </div>

                  {/* Receipt Image Panel */}
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Receipt Bill Attachment</h5>
                    {selectedClaim.receiptUrl ? (
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <img
                          src={selectedClaim.receiptUrl}
                          alt="Receipt Bill"
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', cursor: 'pointer', objectFit: 'contain' }}
                          onClick={() => {
                            const w = window.open();
                            w.document.write(`<img src="${selectedClaim.receiptUrl}" style="max-width:100%; max-height:100vh; object-fit:contain; display:block; margin:auto;" />`);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const w = window.open();
                            w.document.write(`<img src="${selectedClaim.receiptUrl}" style="max-width:100%; max-height:100vh; object-fit:contain; display:block; margin:auto;" />`);
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          👁️ Click to View Receipt Full-Screen
                        </button>
                      </div>
                    ) : (
                      <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={24} />
                        No receipt attachment uploaded with this claim.
                      </div>
                    )}
                  </div>

                  {/* Audit Approval Remarks Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Approval Remarks / Comments</label>
                    <textarea
                      rows={3}
                      placeholder="Enter approval comments or decline reasons..."
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                        background: '#ffffff',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                </div>

                {/* Action Buttons Panel */}
                <div className="hr-expense-actions-bar" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
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
                      padding: '10px 18px',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontSize: '13px',
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
                      padding: '10px 22px',
                      background: '#16a34a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: processing ? 'wait' : 'pointer',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <CheckCircle size={15} /> Approve Claim
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
                placeholder="Filter by employee name, description, department..."
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
                <option value="PENDING_SUPER_ADMIN">Pending Admin Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', overflowY: 'auto', flex: 1 }}>
            {loadingAll && allClaims.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Syncing claims database...</p>
            ) : (
              <DataTable 
                columns={historyColumns}
                data={filteredClaims}
                searchQuery=""
                searchField=""
                actions={renderHistoryActions}
                emptyMessage="No historical expense claims match your search filters."
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
}
