import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import StatusBadge from './StatusBadge';
import { Calendar, User, FileText, CheckCircle, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LeaveApprovalView({ roleMode = 'HR' }) {
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [remarksInput, setRemarksInput] = useState({});

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = roleMode === 'SUPER_ADMIN' ? '/leaves/pending' : '/leaves/pending';
      const res = await apiClient.get(`${endpoint}?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (e) {
      console.error('Failed to load pending leave requests', e);
    } finally {
      setLoading(false);
    }
  }, [roleMode]);

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/leaves/all?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (e) {
      console.error('Failed to load audit history leaves', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    if (roleMode === 'SUPER_ADMIN' || roleMode === 'HR') {
      fetchAudit();
    }
  }, [fetchPending, fetchAudit, roleMode]);

  const handleAction = async (id, action) => {
    const remarks = remarksInput[id] || '';

    if (action === 'reject') {
      const { value: rejectRemarks, isDismissed } = await Swal.fire({
        title: 'Reject Leave Request?',
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
        const res = await apiClient.patch(`/leaves/${id}/reject`, { remarks: rejectRemarks });
        if (res && res.success) {
          await Swal.fire({
            title: 'Rejected!',
            text: 'The leave request has been successfully rejected.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          setRemarksInput(prev => ({ ...prev, [id]: '' }));
          await fetchPending();
          if (roleMode === 'SUPER_ADMIN' || roleMode === 'HR') {
            await fetchAudit();
          }
        } else {
          Swal.fire('Error', res.message || 'Failed to reject leave request.', 'error');
        }
      } catch (e) {
        console.error(e);
        Swal.fire('Error', e.message || 'Server error occurred.', 'error');
      } finally {
        setActioningId(null);
      }
      return;
    }

    try {
      setActioningId(id);
      const endpoint = `/leaves/${id}/${action}`;
      const res = await apiClient.patch(endpoint, { remarks });
      if (res && res.success) {
        await Swal.fire({
          title: 'Approved!',
          text: 'Leave request has been successfully approved.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
        setRemarksInput(prev => ({ ...prev, [id]: '' }));
        await fetchPending();
        if (roleMode === 'SUPER_ADMIN' || roleMode === 'HR') {
          await fetchAudit();
        }
      } else {
        Swal.fire('Error', res.message || 'Failed to approve leave request.', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', e.message || 'Server error occurred.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const getSubTitle = () => {
    if (roleMode === 'HR') return 'Sales, Store, & Finance Departments';
    if (roleMode === 'PLANT_HEAD') return 'Store Dispatch & Production Departments';
    return 'Final review and company-wide leave auditing';
  };

  const displayList = activeSubTab === 'pending' ? requests : auditLogs;

  return (
    <div className="hr-leave-approval-root" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      
      {/* Premium Title bar */}
      <div className="hr-leave-header erp-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '20px 24px', color: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Leave Approval Hub • {roleMode.replace('_', ' ')}</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '600' }}>{getSubTitle()}</p>
        </div>
        <button
          onClick={() => { fetchPending(); if (roleMode === 'SUPER_ADMIN' || roleMode === 'HR') fetchAudit(); }}
          disabled={loading}
          className="hr-leave-sync-btn"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Sync Records
        </button>
      </div>

      {/* Tabs configuration for HR, Super Admin, and Plant Head */}
      {(roleMode === 'SUPER_ADMIN' || roleMode === 'HR' || roleMode === 'PLANT_HEAD') && (
        <div 
          className="erp-tab-scroll-bar hr-leave-tab-bar" 
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
          <button
            onClick={() => setActiveSubTab('pending')}
            style={{ 
              padding: '10px 14px', 
              border: 'none', 
              background: 'transparent', 
              borderBottom: activeSubTab === 'pending' ? '2.5px solid #0284c7' : '2.5px solid transparent', 
              color: activeSubTab === 'pending' ? '#0284c7' : '#64748b', 
              fontWeight: activeSubTab === 'pending' ? '800' : '600', 
              fontSize: '13px',
              cursor: 'pointer', 
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              userSelect: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Pending Approvals</span>
            <span style={{
              background: activeSubTab === 'pending' ? '#0284c7' : '#e2e8f0',
              color: activeSubTab === 'pending' ? '#fff' : '#64748b',
              borderRadius: '20px', padding: '1px 7px',
              fontSize: '11px', fontWeight: 800,
            }}>{requests.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            style={{ 
              padding: '10px 14px', 
              border: 'none', 
              background: 'transparent', 
              borderBottom: activeSubTab === 'audit' ? '2.5px solid #0284c7' : '2.5px solid transparent', 
              color: activeSubTab === 'audit' ? '#0284c7' : '#64748b', 
              fontWeight: activeSubTab === 'audit' ? '800' : '600', 
              fontSize: '13px',
              cursor: 'pointer', 
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              userSelect: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>All Company Records</span>
            <span style={{
              background: activeSubTab === 'audit' ? '#0284c7' : '#e2e8f0',
              color: activeSubTab === 'audit' ? '#fff' : '#64748b',
              borderRadius: '20px', padding: '1px 7px',
              fontSize: '11px', fontWeight: 800,
            }}>{auditLogs.length}</span>
          </button>
        </div>
      )}

      {loading && displayList.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading requests...</p>
      ) : displayList.length === 0 ? (
        <div className="app-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontWeight: '600', margin: 0 }}>
            {activeSubTab === 'pending' ? 'No pending leave applications requiring your action.' : 'No company leave history logged.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {displayList.map(req => {
            const hasActionPermission = activeSubTab === 'pending';
            const employeeName = req.employee?.fullName || req.employee?.user?.name || req.user?.name || req.appliedByName || 'Employee';
            const employeeCode = req.employee?.employeeCode || 'EMP';
            const departmentName = req.department?.name || 'Sales & Marketing';

            return (
              <div key={req.id} className="app-card hr-leave-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.015)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Header Information */}
                <div className="hr-leave-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
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
                  <div className="hr-leave-card-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <StatusBadge status={req.status} />
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
                      Applied {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="hr-leave-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Leave Interval</span>
                    <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginTop: '3px' }}>
                      {new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                      Duration: {req.totalDays} {req.totalDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Type & Details</span>
                    <strong style={{ fontSize: '12.5px', color: '#1e293b', display: 'block', marginTop: '3px' }}>{req.leaveType}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>{req.reason}</span>
                  </div>
                </div>

                {/* Attachment View */}
                {req.attachment && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Attachment:</span>
                    <a
                      href={req.attachment}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12px', color: '#0284c7', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      View Attached File / Receipt
                    </a>
                  </div>
                )}

                {/* Timeline / Approvals History log */}
                {req.approvals && req.approvals.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '3px solid #cbd5e1', paddingLeft: '12px', marginLeft: '6px' }}>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Workflow Status Trail</span>
                    {req.approvals.map((app, idx) => (
                      <div key={app.id || idx} style={{ fontSize: '12px', color: '#334155' }}>
                        📅 {new Date(app.actionDate).toLocaleDateString()} - <strong style={{ color: app.action === 'APPROVED' ? '#16a34a' : '#ef4444' }}>{app.action}</strong> by <strong>{app.approverRole}</strong>
                        {app.remarks && <span style={{ color: '#475569', fontStyle: 'italic', display: 'block', marginLeft: '12px' }}>Remarks: "{app.remarks}"</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* HR/Plant Head/Super Admin Actions */}
                {hasActionPermission && (
                  <div className="hr-leave-action-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <MessageSquare size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Add review remarks/comments..."
                        value={remarksInput[req.id] || ''}
                        onChange={e => setRemarksInput(prev => ({ ...prev, [req.id]: e.target.value }))}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', minWidth: 0 }}
                      />
                    </div>
                    <div className="hr-leave-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={actioningId === req.id}
                        className="hr-leave-reject-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#ffffff', border: '1px solid #f87171', color: '#ef4444', padding: '10px 18px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                      >
                        <XCircle size={14} /> Reject Request
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={actioningId === req.id}
                        className="hr-leave-approve-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#0284c7', border: 'none', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0369a1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#0284c7'; }}
                      >
                        <CheckCircle size={14} /> Approve & Forward
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
