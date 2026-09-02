'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  complaintsService,
  ComplaintItem,
  ComplaintStats,
} from '../../../services/hr/complaintsService';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Eye,
  User,
  Building,
  Mail,
  Phone,
  MessageSquare,
  Send,
  X,
  Calendar,
  Layers,
  Inbox,
  Check,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending Review',
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
      };
    case 'IN_REVIEW':
      return {
        label: 'In Review',
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved',
        bg: '#f0fdf4',
        color: '#15803d',
        border: '#bbf7d0',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: '#fef2f2',
        color: '#b91c1c',
        border: '#fecaca',
      };
    default:
      return {
        label: status,
        bg: '#f1f5f9',
        color: '#475569',
        border: '#cbd5e1',
      };
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'CRITICAL':
      return {
        label: 'CRITICAL',
        bg: '#fef2f2',
        color: '#dc2626',
        border: '#fecaca',
      };
    case 'HIGH':
      return {
        label: 'HIGH',
        bg: '#fff7ed',
        color: '#ea580c',
        border: '#fed7aa',
      };
    case 'LOW':
      return {
        label: 'LOW',
        bg: '#f8fafc',
        color: '#64748b',
        border: '#e2e8f0',
      };
    default:
      return {
        label: 'MEDIUM',
        bg: '#eff6ff',
        color: '#2563eb',
        border: '#bfdbfe',
      };
  }
}

export default function HRComplaintCenterView() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [resolveStatus, setResolveStatus] = useState<'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'>('RESOLVED');
  const [hrRemarks, setHrRemarks] = useState('');
  const [savingResolution, setSavingResolution] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complaintsService.getHrComplaints({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
        limit: 100,
      });
      setComplaints(res.items || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error('Failed to load HR complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleOpenResolveModal = (c: ComplaintItem) => {
    setSelectedComplaint(c);
    setResolveStatus(c.status);
    setHrRemarks(c.hrRemarks || '');
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSavingResolution(true);
    try {
      await complaintsService.updateComplaintStatus(selectedComplaint.id, {
        status: resolveStatus,
        hrRemarks,
      });

      Swal.fire({
        icon: 'success',
        title: 'Complaint Updated',
        text: `Ticket ${selectedComplaint.ticketCode} status has been updated to ${resolveStatus}.`,
        confirmButtonColor: '#0284c7',
      });

      setSelectedComplaint(null);
      await fetchComplaints();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err?.message || 'Could not update complaint.',
        confirmButtonColor: '#0284c7',
      });
    } finally {
      setSavingResolution(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
              HR Complaint &amp; Grievance Center
            </h1>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Inspect, investigate, and resolve employee workplace issues with automated notifications
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchComplaints()}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: '#334155',
            fontSize: '13px',
            fontWeight: '700',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Records
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Received</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fffbeb', borderRadius: '12px', border: '1.5px solid #fde68a', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#b45309', textTransform: 'uppercase' }}>Pending Review</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#d97706', marginTop: '4px' }}>{stats.pending}</div>
        </div>
        <div style={{ background: '#eff6ff', borderRadius: '12px', border: '1.5px solid #bfdbfe', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase' }}>In Investigation</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>{stats.inReview}</div>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: '12px', border: '1.5px solid #bbf7d0', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>Resolved &amp; Closed</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{stats.resolved}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Complaints', count: stats.total },
              { id: 'PENDING', label: 'Pending', count: stats.pending },
              { id: 'IN_REVIEW', label: 'In Review', count: stats.inReview },
              { id: 'RESOLVED', label: 'Resolved', count: stats.resolved },
              { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: active ? '800' : '600',
                    background: active ? '#0284c7' : '#f8fafc',
                    color: active ? '#ffffff' : '#475569',
                    border: active ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        background: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        color: active ? '#ffffff' : '#334155',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by ticket, name, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                <th style={{ padding: '12px 16px' }}>Ticket ID</th>
                <th style={{ padding: '12px 16px' }}>Complainant</th>
                <th style={{ padding: '12px 16px' }}>Department / Role</th>
                <th style={{ padding: '12px 16px' }}>Category &amp; Subject</th>
                <th style={{ padding: '12px 16px' }}>Submitted Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Inbox size={36} color="#94a3b8" />
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>No Complaints Found</div>
                      <div style={{ fontSize: '12.5px' }}>
                        {searchQuery ? `No complaints matching "${searchQuery}".` : 'No workplace grievances in this category.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const statusBadge = getStatusBadge(c.status);
                  const priorityBadge = getPriorityBadge(c.priority);
                  const complainantName = c.user?.name || 'Staff Member';
                  const employeeCode = c.employee?.employeeCode || 'N/A';
                  const departmentName = c.employee?.department?.name || 'Operations';
                  const roleName = c.user?.role?.name || c.employee?.jobTitle || 'Employee';

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fbff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                    >
                      {/* Ticket Code */}
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0284c7' }}>
                        {c.ticketCode}
                      </td>

                      {/* Complainant */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{complainantName}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>Code: {employeeCode}</div>
                      </td>

                      {/* Department / Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#334155' }}>{departmentName}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{roleName}</div>
                      </td>

                      {/* Category & Subject */}
                      <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: '700',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                            }}
                          >
                            {c.category}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: priorityBadge.bg,
                              color: priorityBadge.color,
                              border: `1px solid ${priorityBadge.border}`,
                            }}
                          >
                            {priorityBadge.label}
                          </span>
                        </div>
                        <div style={{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.subject}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`,
                            display: 'inline-block',
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenResolveModal(c)}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Resolution Modal */}
      {selectedComplaint && (
        <div
          onClick={() => setSelectedComplaint(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              border: '1.5px solid #cbd5e1',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '15px',
                borderTopRightRadius: '15px',
              }}
            >
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#38bdf8" />
                  Complaint Review: {selectedComplaint.ticketCode}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Filed on {new Date(selectedComplaint.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Complainant Profile Strip */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>COMPLAINANT</div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>{selectedComplaint.user?.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#0284c7' }}>{selectedComplaint.user?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>EMPLOYEE CODE</div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>{selectedComplaint.employee?.employeeCode || 'N/A'}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{selectedComplaint.employee?.phoneNumber || 'No phone'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>DEPARTMENT / ROLE</div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>{selectedComplaint.employee?.department?.name || 'Operations'}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{selectedComplaint.user?.role?.name || 'Staff'}</div>
                </div>
              </div>

              {/* Subject & Description */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    {selectedComplaint.category}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: getPriorityBadge(selectedComplaint.priority).bg, color: getPriorityBadge(selectedComplaint.priority).color, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${getPriorityBadge(selectedComplaint.priority).border}` }}>
                    {selectedComplaint.priority} PRIORITY
                  </span>
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                  {selectedComplaint.subject}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {selectedComplaint.description}
                </p>
              </div>

              {/* HR Resolution Form */}
              <form onSubmit={handleSaveResolution} style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1.5px solid #e2e8f0', paddingTop: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                  HR Investigation &amp; Resolution Actions
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Update Status
                  </label>
                  <select
                    value={resolveStatus}
                    onChange={(e: any) => setResolveStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: '700',
                      outline: 'none',
                    }}
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="IN_REVIEW">In Investigation / In Review</option>
                    <option value="RESOLVED">Resolved &amp; Closed</option>
                    <option value="REJECTED">Rejected / Invalid</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    HR Remarks &amp; Resolution Notes (Visible to Complainant)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter resolution notes, disciplinary action taken, or explanation for the employee..."
                    value={hrRemarks}
                    onChange={(e) => setHrRemarks(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingResolution}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: savingResolution ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Check size={16} />
                    {savingResolution ? 'Saving...' : 'Save Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
