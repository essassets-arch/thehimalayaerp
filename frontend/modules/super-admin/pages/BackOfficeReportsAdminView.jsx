'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../lib/apiClient';
import DataTable from '../../../shared/components/DataTable';
import {
  FileText,
  Users,
  RefreshCw,
  Eye,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function BackOfficeReportsAdminView() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    todaySubmissions: 0,
    staffCount: 0
  });
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Inspector Modal state
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchStaffList = useCallback(async () => {
    try {
      const res = await apiClient.get('/super-admin/backoffice-reports/staff');
      if (res && (res.data || Array.isArray(res))) {
        const list = res.data || res || [];
        setStaffList(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Failed to fetch back office staff list:', err);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userFilter && userFilter !== 'ALL') params.append('userId', userFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);

      const res = await apiClient.get(`/super-admin/backoffice-reports?${params.toString()}`);
      if (res && res.data) {
        const list = res.data.data || res.data || [];
        setReports(Array.isArray(list) ? list : []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch back office reports for Super Admin:', err);
    } finally {
      setLoading(false);
    }
  }, [userFilter, startDate, endDate, search]);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleOpenInspect = (report) => {
    setSelectedReport(report);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', paddingBottom: '32px', boxSizing: 'border-box' }}>
      
      {/* ── Responsive CSS Rules ── */}
      <style jsx>{`
        @media (max-width: 768px) {
          .sa-top-banner {
            padding: 16px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .sa-top-banner button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 44px !important;
          }
          .sa-filter-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .sa-filter-controls {
            width: 100% !important;
            flex-direction: column !important;
          }
          .sa-filter-controls select, .sa-filter-controls input {
            width: 100% !important;
          }
          .sa-table-card {
            padding: 16px !important;
          }
          .sa-modal-window {
            width: 95% !important;
            margin: 10px !important;
            max-height: 94vh !important;
          }
          .sa-modal-body {
            padding: 16px !important;
            gap: 14px !important;
          }
          .sa-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── Top Governance Banner ── */}
      <div className="sa-top-banner" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}>
            <FileText size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
                Back Office Daily Reports Audit
              </h1>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                fontSize: '10.5px',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: '700',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                SUPER ADMIN GOVERNANCE
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: '1.4' }}>
              Review daily activity reports submitted by Back Office team members
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          style={{
            background: '#334155',
            color: '#f8fafc',
            border: '1px solid #475569',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '42px'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {/* ── KPI Metrics Cards Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        <div style={{
          background: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', borderLeft: '5px solid #0284c7'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              Total Reports Logged
            </span>
            <FileText size={18} style={{ color: '#0284c7' }} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '8px 0 0 0' }}>
            {stats.totalReports}
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
            All-time entries count
          </span>
        </div>

        <div style={{
          background: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', borderLeft: '5px solid #06b6d4'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              Today's Submissions
            </span>
            <Calendar size={18} style={{ color: '#06b6d4' }} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '8px 0 0 0' }}>
            {stats.todaySubmissions}
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
            Submitted for {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        <div style={{
          background: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', borderLeft: '5px solid #6366f1'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              Back Office Staff Count
            </span>
            <Users size={18} style={{ color: '#6366f1' }} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '8px 0 0 0' }}>
            {stats.staffCount}
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
            Active Back Office staff members
          </span>
        </div>

      </div>

      {/* ── Main Reports Table Card ── */}
      <div className="app-card sa-table-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
        
        {/* Filters Header */}
        <div className="sa-filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Back Office Reports Roster
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Filter by employee or date range to inspect work items
            </span>
          </div>

          <div className="sa-filter-controls" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Employee Filter */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '12.5px', fontWeight: '700', color: '#334155', cursor: 'pointer',
                minHeight: '38px'
              }}
            >
              <option value="ALL">All Employees</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>

            {/* Start & End Dates */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From Date"
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '12px', fontWeight: '600', color: '#334155',
                minHeight: '38px'
              }}
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To Date"
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '12px', fontWeight: '600', color: '#334155',
                minHeight: '38px'
              }}
            />

            {(userFilter !== 'ALL' || startDate || endDate || search) && (
              <button
                onClick={() => {
                  setUserFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setSearch('');
                }}
                style={{
                  padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: '#ffffff', fontSize: '12px', fontWeight: '700', color: '#ef4444', cursor: 'pointer',
                  minHeight: '38px'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Responsive Horizontal Scroll Box for Table */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <DataTable
            columns={[
              {
                header: 'Report Ref ID',
                accessor: 'publicId',
                render: (row) => (
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#6366f1', fontSize: '12px' }}>
                    {row.publicId}
                  </span>
                )
              },
              {
                header: 'Employee',
                accessor: 'user',
                render: (row) => (
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '13px', display: 'block' }}>{row.user?.name || 'Back Office Staff'}</strong>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>{row.user?.email}</span>
                  </div>
                )
              },
              {
                header: 'Report Date',
                accessor: 'reportDate',
                render: (row) => (
                  <strong style={{ color: '#334155', fontSize: '12.5px' }}>
                    {new Date(row.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </strong>
                )
              },
              {
                header: 'Work Title / Primary Focus',
                accessor: 'title',
                render: (row) => (
                  <div>
                    <strong style={{ color: '#334155', fontSize: '13px', display: 'block' }}>{row.title}</strong>
                    {row.summary && <span style={{ fontSize: '11.5px', color: '#64748b' }}>{row.summary}</span>}
                  </div>
                )
              },
              {
                header: 'Hours',
                accessor: 'workingHours',
                render: (row) => (
                  <span style={{ fontWeight: '700', color: '#475569' }}>
                    {row.workingHours ? `${row.workingHours} hrs` : '—'}
                  </span>
                )
              },
              {
                header: 'Submitted At',
                accessor: 'createdAt',
                render: (row) => (
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {new Date(row.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )
              }
            ]}
            data={reports}
            searchQuery={search}
            searchField="title"
            actions={(row) => (
              <button
                onClick={() => handleOpenInspect(row)}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  minHeight: '34px'
                }}
              >
                <Eye size={14} /> View Report
              </button>
            )}
            emptyMessage="No Back Office daily reports found matching your criteria."
          />
        </div>
      </div>

      {/* ── SUPER ADMIN REPORT INSPECTION MODAL ── */}
      {selectedReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.70)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '12px'
        }}>
          <div className="sa-modal-window" style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '720px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#0284c7' }}>
                    {selectedReport.publicId}
                  </span>
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0 0' }}>
                  {selectedReport.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="sa-modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Meta Grid */}
              <div className="sa-modal-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
                background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Employee</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {selectedReport.user?.name} ({selectedReport.user?.email})
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Report Date</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {new Date(selectedReport.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Working Hours</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {selectedReport.workingHours ? `${selectedReport.workingHours} hrs` : '—'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Submitted At</span>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginTop: '2px' }}>
                    {new Date(selectedReport.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Tasks & Activities Completed */}
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                  Tasks & Activities Completed
                </h4>
                <div style={{
                  background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px',
                  fontSize: '13.5px', color: '#0f172a', whiteSpace: 'pre-line', lineHeight: '1.65'
                }}>
                  {selectedReport.tasksCompleted}
                </div>
              </div>

              {/* Issues or Blockers */}
              {selectedReport.issuesOrBlockers && (
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#b91c1c', margin: '0 0 8px 0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} style={{ color: '#dc2626' }} /> Issues / Roadblocks Reported
                  </h4>
                  <div style={{
                    background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px',
                    fontSize: '13px', color: '#991b1b', whiteSpace: 'pre-line', lineHeight: '1.5'
                  }}>
                    {selectedReport.issuesOrBlockers}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end',
              background: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
            }}>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: '#64748b', color: '#ffffff', border: 'none',
                  padding: '9px 20px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
                  minHeight: '38px'
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
