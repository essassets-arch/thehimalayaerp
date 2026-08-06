import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import StatusBadge from './StatusBadge';
import { Calendar, User, FileText, CheckCircle, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

export default function HRAttendanceRequestsView() {
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [remarksInput, setRemarksInput] = useState({});

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/attendance-requests/pending?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (e) {
      console.error('Failed to load pending attendance requests', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/attendance-requests/history?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (e) {
      console.error('Failed to load history attendance requests', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchAudit();
  }, [fetchPending, fetchAudit]);

  const handleAction = async (id, action) => {
    const remarks = remarksInput[id] || '';

    if (action === 'reject') {
      const { value: rejectRemarks, isDismissed } = await Swal.fire({
        title: 'Reject Attendance Request?',
        text: 'Please provide the mandatory rejection reason/remarks below:',
        input: 'textarea',
        inputPlaceholder: 'Enter rejection remarks here...',
        inputValue: remarks,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Reject Request',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return 'Rejection remarks are strictly mandatory!';
          }
        }
      });

      if (isDismissed) return;

      try {
        setActioningId(id);
        const res = await apiClient.patch(`/attendance-requests/${id}/reject`, { remarks: rejectRemarks });
        if (res && res.success) {
          await Swal.fire({
            title: 'Rejected!',
            text: 'The manual attendance request has been rejected.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          setRemarksInput(prev => ({ ...prev, [id]: '' }));
          await fetchPending();
          await fetchAudit();
        } else {
          Swal.fire('Error', res.message || 'Failed to reject request.', 'error');
        }
      } catch (e) {
        console.error(e);
        Swal.fire('Error', e.message || 'Server error occurred.', 'error');
      } finally {
        setActioningId(null);
      }
      return;
    }

    // Approve flow
    const confirmResult = await Swal.fire({
      title: 'Approve Attendance Request?',
      text: remarks ? `Remarks: "${remarks}"` : 'Are you sure you want to approve this request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setActioningId(id);
      const res = await apiClient.patch(`/attendance-requests/${id}/approve`, { remarks });
      if (res && res.success) {
        await Swal.fire({
          title: 'Approved!',
          text: 'The manual attendance request has been approved.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
        setRemarksInput(prev => ({ ...prev, [id]: '' }));
        await fetchPending();
        await fetchAudit();
      } else {
        Swal.fire('Error', res.message || 'Failed to approve request.', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', e.message || 'Server error occurred.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const displayList = activeSubTab === 'pending' ? requests : auditLogs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '24px', color: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Manual Attendance Approval Hub</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '600' }}>Review and log manual employee clock-in records</p>
        </div>
        <button
          onClick={() => { fetchPending(); fetchAudit(); }}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Sync Records
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '6px' }}>
        <button
          onClick={() => setActiveSubTab('pending')}
          style={{ padding: '10px 20px', border: 'none', background: 'transparent', borderBottom: activeSubTab === 'pending' ? '3px solid #0284c7' : '3px solid transparent', color: activeSubTab === 'pending' ? '#0284c7' : '#64748b', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          Pending HR Review ({requests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          style={{ padding: '10px 20px', border: 'none', background: 'transparent', borderBottom: activeSubTab === 'audit' ? '3px solid #0284c7' : '3px solid transparent', color: activeSubTab === 'audit' ? '#0284c7' : '#64748b', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          Processed Audit Logs ({auditLogs.length})
        </button>
      </div>

      {loading && displayList.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading requests...</p>
      ) : displayList.length === 0 ? (
        <div className="app-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontWeight: '600', margin: 0 }}>
            {activeSubTab === 'pending' ? 'No pending manual attendance requests requiring action.' : 'No manual attendance audit history logged.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {displayList.map(req => {
            const hasActionPermission = activeSubTab === 'pending';
            const employeeName = req.employee?.fullName || 'Unknown';
            const employeeCode = req.employee?.employeeCode || 'N/A';
            const departmentName = req.employee?.department?.name || 'Unassigned';

            return (
              <div key={req.id} className="app-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.015)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={20} style={{ color: '#0284c7' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{employeeName} ({employeeCode})</h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '700' }}>
                        Dept: <span style={{ color: '#0284c7' }}>{departmentName}</span>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <StatusBadge status={req.status} />
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Target Date</span>
                    <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginTop: '3px' }}>
                      {new Date(req.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Reason / Explanation</span>
                    <span style={{ fontSize: '12.5px', color: '#1e293b', display: 'block', marginTop: '3px' }}>{req.reason}</span>
                  </div>
                </div>

                {/* Processed History Remarks */}
                {!hasActionPermission && req.remarks && (
                  <div style={{ fontSize: '12px', borderLeft: '3px solid #cbd5e1', paddingLeft: '12px', color: '#475569', fontStyle: 'italic' }}>
                    <strong>HR remarks:</strong> "{req.remarks}"
                  </div>
                )}

                {/* Actions */}
                {hasActionPermission && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <MessageSquare size={16} style={{ color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Add review remarks/comments..."
                        value={remarksInput[req.id] || ''}
                        onChange={e => setRemarksInput(prev => ({ ...prev, [req.id]: e.target.value }))}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={actioningId === req.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #f87171', color: '#ef4444', padding: '10px 18px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                      >
                        <XCircle size={14} /> Reject Request
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={actioningId === req.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#16a34a', border: 'none', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; }}
                      >
                        <CheckCircle size={14} /> Approve Request
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
