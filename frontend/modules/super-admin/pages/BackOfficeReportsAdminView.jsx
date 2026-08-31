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
  Clock,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  UserCheck
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

  // Responsive Breakpoint State
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '14px' : '20px',
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      padding: isMobile ? '12px' : 'clamp(16px, 2vw, 24px)',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* ── Top Governance Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '22px 24px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
          <div style={{
            width: isMobile ? '42px' : '50px',
            height: isMobile ? '42px' : '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}>
            <FileText size={isMobile ? 22 : 26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
                Back Office Daily Reports Audit
              </h1>
              <span style={{
                background: 'rgba(99, 102, 241, 0.18)',
                color: '#a5b4fc',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '800',
                border: '1px solid rgba(99, 102, 241, 0.35)'
              }}>
                SUPER ADMIN GOVERNANCE
              </span>
            </div>
            <p style={{ fontSize: isMobile ? '11.5px' : '12.5px', color: '#94a3b8', margin: '3px 0 0 0', lineHeight: '1.4' }}>
              Review daily activity reports submitted by Back Office team members
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          disabled={loading}
          style={{
            background: '#334155',
            color: '#f8fafc',
            border: '1px solid #475569',
            padding: isMobile ? '8px 14px' : '10px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: isMobile ? '12px' : '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: isMobile ? '38px' : '42px',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {/* ── KPI Metrics Cards Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(clamp(150px, 20vw, 240px), 1fr))',
        gap: isMobile ? '10px' : '16px'
      }}>
        
        <div style={{
          background: '#ffffff', borderRadius: '14px', padding: isMobile ? '12px 14px' : '18px 20px', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7', minWidth: 0, overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: isMobile ? '10px' : '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Total Reports
            </span>
            <FileText size={isMobile ? 15 : 18} style={{ color: '#0284c7', flexShrink: 0 }} />
          </div>
          <h2 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '900', color: '#0f172a', margin: '4px 0 0 0' }}>
            {stats.totalReports}
          </h2>
          <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8', display: 'block', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            All-time entries count
          </span>
        </div>

        <div style={{
          background: '#ffffff', borderRadius: '14px', padding: isMobile ? '12px 14px' : '18px 20px', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', borderLeft: '4px solid #06b6d4', minWidth: 0, overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: isMobile ? '10px' : '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Today's Logs
            </span>
            <Calendar size={isMobile ? 15 : 18} style={{ color: '#06b6d4', flexShrink: 0 }} />
          </div>
          <h2 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '900', color: '#0f172a', margin: '4px 0 0 0' }}>
            {stats.todaySubmissions}
          </h2>
          <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8', display: 'block', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Submitted for today
          </span>
        </div>

        <div style={{
          background: '#ffffff', borderRadius: '14px', padding: isMobile ? '12px 14px' : '18px 20px', border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', borderLeft: '4px solid #6366f1', minWidth: 0, overflow: 'hidden',
          gridColumn: isMobile ? '1 / -1' : 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: isMobile ? '10px' : '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Back Office Staff
            </span>
            <Users size={isMobile ? 15 : 18} style={{ color: '#6366f1', flexShrink: 0 }} />
          </div>
          <h2 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '900', color: '#0f172a', margin: '4px 0 0 0' }}>
            {stats.staffCount}
          </h2>
          <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8', display: 'block', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Active Back Office staff members
          </span>
        </div>

      </div>

      {/* ── Main Reports Table & Mobile Cards Card ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: isMobile ? '14px' : '20px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)', minWidth: 0, overflow: 'hidden' }}>
        
        {/* Filters Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: isMobile ? '14.5px' : '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Back Office Reports Roster
            </h3>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              Filter by employee or date range to inspect work items
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 200px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search report title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px 7px 30px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: '#f8fafc', fontSize: '12px', fontWeight: '600', color: '#334155', boxSizing: 'border-box', outline: 'none'
                }}
              />
            </div>

            {/* Employee Filter */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              style={{
                flex: isMobile ? '1 1 100%' : 'none',
                padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer', outline: 'none'
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
                flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
                padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '11.5px', fontWeight: '600', color: '#334155', outline: 'none'
              }}
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To Date"
              style={{
                flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
                padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '11.5px', fontWeight: '600', color: '#334155', outline: 'none'
              }}
            />

            {(userFilter !== 'ALL' || startDate || endDate || search) && (
              <button
                type="button"
                onClick={() => {
                  setUserFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setSearch('');
                }}
                style={{
                  padding: '7px 12px', borderRadius: '8px', border: '1px solid #fecaca',
                  background: '#fff1f2', fontSize: '11.5px', fontWeight: '700', color: '#ef4444', cursor: 'pointer',
                  flex: isMobile ? '1 1 100%' : 'none'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content: Mobile Cards or Desktop DataTable */}
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            ⏳ Loading Back Office daily reports...
          </div>
        ) : isMobile ? (
          /* Mobile Touch-Friendly Card List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No Back Office daily reports found matching your criteria.
              </div>
            ) : (
              reports.map((row) => (
                <div
                  key={row.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#6366f1', fontSize: '12px' }}>
                        {row.publicId}
                      </span>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px', marginTop: '2px' }}>
                        {row.user?.name || 'Back Office Staff'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{row.user?.email}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800' }}>
                        {row.workingHours ? `${row.workingHours} hrs` : 'Standard'}
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                        {new Date(row.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
                    <strong style={{ fontSize: '12.5px', color: '#1e293b', display: 'block' }}>{row.title}</strong>
                    {row.summary && <span style={{ fontSize: '11.5px', color: '#64748b' }}>{row.summary}</span>}
                  </div>

                  {row.issuesOrBlockers && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#b91c1c' }}>
                      <AlertTriangle size={12} color="#dc2626" />
                      <span>Blocker/Issue reported</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenInspect(row)}
                      style={{
                        background: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={13} /> View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop & Tablet Table */
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
                  type="button"
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
        )}
      </div>

      {/* ── SUPER ADMIN REPORT INSPECTION MODAL ── */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.70)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: isMobile ? '10px' : '16px'
          }}
          onClick={() => setSelectedReport(null)}
        >
          <div
            style={{
              background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '680px',
              maxHeight: 'min(92vh, 760px)', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: isMobile ? '14px 16px' : '18px 20px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#6366f1' }}>
                    {selectedReport.publicId}
                  </span>
                </div>
                <h3 style={{ fontSize: isMobile ? '15px' : '16.5px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0 0' }}>
                  {selectedReport.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#64748b" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: isMobile ? '14px 16px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Meta Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)', gap: '12px',
                background: '#f8fafc', padding: isMobile ? '12px' : '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0'
              }}>
                <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
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

                <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Submitted Timestamp</span>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginTop: '2px' }}>
                    {new Date(selectedReport.createdAt).toLocaleString('en-GB')}
                  </div>
                </div>
              </div>

              {/* Tasks & Activities Completed */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                  Tasks & Activities Completed
                </h4>
                <div style={{
                  background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: isMobile ? '12px' : '16px',
                  fontSize: '13px', color: '#0f172a', whiteSpace: 'pre-line', lineHeight: '1.65'
                }}>
                  {selectedReport.tasksCompleted}
                </div>
              </div>

              {/* Issues or Blockers */}
              {selectedReport.issuesOrBlockers && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c', margin: '0 0 6px 0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} style={{ color: '#dc2626' }} /> Issues / Roadblocks Reported
                  </h4>
                  <div style={{
                    background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: isMobile ? '12px' : '14px 16px',
                    fontSize: '12.5px', color: '#991b1b', whiteSpace: 'pre-line', lineHeight: '1.5'
                  }}>
                    {selectedReport.issuesOrBlockers}
                  </div>
                </div>
              )}

              {/* Plan For Tomorrow */}
              {selectedReport.planForTomorrow && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', margin: '0 0 6px 0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} style={{ color: '#0284c7' }} /> Plan For Next Day
                  </h4>
                  <div style={{
                    background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: isMobile ? '12px' : '14px 16px',
                    fontSize: '12.5px', color: '#0369a1', whiteSpace: 'pre-line', lineHeight: '1.5'
                  }}>
                    {selectedReport.planForTomorrow}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end',
              background: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
            }}>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{
                  background: '#64748b', color: '#ffffff', border: 'none',
                  padding: '8px 20px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
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
