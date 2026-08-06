'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import StatusBadge from './StatusBadge';
import { 
  CheckCircle, XCircle, FileText, Image as ImageIcon, 
  User, Calendar, Clock, RefreshCw, AlertCircle 
} from 'lucide-react';

export default function ExpenseManagementView() {
  const [pendingClaims, setPendingClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [remarks, setRemarks] = useState('');
  
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

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const handleDecision = async (action) => {
    if (!selectedClaim) return;
    
    try {
      setProcessing(true);
      const endpoint = `/expenses/${selectedClaim.id}/${action}`;
      
      const res = await apiClient.patch(endpoint, { remarks });
      if (res && res.success) {
        setRemarks('');
        await fetchPendingClaims();
      }
    } catch (err) {
      console.error(`Failed to execute expense decision ${action}`, err);
      alert(`Action failed: ${err.message || 'Server error'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: 'calc(100vh - 140px)', minHeight: '500px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Expense Management</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Review and approve employee corporate reimbursement claims.</p>
        </div>
        <button
          onClick={fetchPendingClaims}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
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
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Sync Queue
        </button>
      </div>

      {/* Grid Layout Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', flex: 1, minHeight: 0 }}>
        
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
              <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('reject')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
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
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
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

    </div>
  );
}
