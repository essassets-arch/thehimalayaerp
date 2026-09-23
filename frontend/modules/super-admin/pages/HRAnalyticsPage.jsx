'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { 
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { backendFetch } from '@/lib/backendFetch';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { formatCurrency as currency, formatNumber } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import './HRAnalyticsPage.css';

import ResponsiveChart from '../../../shared/components/ResponsiveChart';

const formatCurrency = value => value == null || value === 'Not recorded' ? 'Not recorded' : currency(value);
const formatPercent = value => value == null ? 'Not recorded' : `${value}%`;

const CHART_COLORS = ["#7e22ce", "#16a34a", "#2563eb", "#d97706", "#e11d48", "#06b6d4", "#64748b"];

export default function HRAnalyticsPage() {
  const { period, activeDates, filters, setFilter } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Drill-down Drawer Employee selection
  const [selectedEmp, setSelectedEmp] = useState(null);

  const requestSequence = useRef(0);
  const fetchHRAnalytics = useCallback(async () => {
    const request = ++requestSequence.current;
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedEmp(null);
    try {
      const params = new URLSearchParams();
      params.set('period', period);
      if (activeDates.dateFrom) params.set('from', activeDates.dateFrom);
      if (activeDates.dateTo) params.set('to', activeDates.dateTo);
      if (filters.location && filters.location !== 'All') params.set('location', filters.location);
      if (filters.department && filters.department !== 'All') params.append('departmentId', filters.department);
      if (filters.employmentType && filters.employmentType !== 'All') params.append('employmentType', filters.employmentType);
      if (filters.employee && filters.employee !== 'All') params.append('employeeId', filters.employee);

      const res = await backendFetch(`/api/backend/super-admin/analytics/hr?${params.toString()}`, { cacheTtlMs: 0 });
      if (!res?.workforce || !res?.attendance?.today || !res?.payroll?.summary || !res?.filters || !res?.scope || !res?.period || !Array.isArray(res?.filters?.departments) || !Array.isArray(res?.filters?.locations) || !Array.isArray(res?.filters?.employees) || !Array.isArray(res?.filters?.employmentTypes) || !Array.isArray(res?.employees) || !res?.generatedAt) {
        throw new Error('The server returned an incomplete HR report.');
      }
      if (request === requestSequence.current) setData(res);
    } catch (err) {
      console.error('Error fetching HR analytics:', err);
      if (request === requestSequence.current) setError(err.message || 'Unable to load HR analytics.');
    } finally {
      if (request === requestSequence.current) setLoading(false);
    }
  }, [activeDates.dateFrom, activeDates.dateTo, period, filters]);

  useEffect(() => {
    fetchHRAnalytics();
    return () => { requestSequence.current += 1; };
  }, [fetchHRAnalytics]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Period', data.period.allTime ? 'All Time' : data.period.from + ' to ' + data.period.to],
      ['Generated At', data.generatedAt],
      ['Attendance Snapshot Date', data.attendance.today.targetDate],
      ['Workforce Size (current)', data.workforce.total],
      ['Present Today (recorded)', data.attendance.today.present],
      ['Absent Today (recorded)', data.attendance.today.absent],
      ['Attendance Not Recorded Today', data.attendance.today.unrecorded],
      ['Late Today', data.attendance.today.late],
      ['Recorded Net Payroll (INR)', data.payroll.summary.netPayroll],
      ['Payroll Scope', data.scope.payroll],
      ['Approved Expense Claims (INR)', data.expenses.summary.approved],
      ['Department Filter', filters.department || 'All'],
      ['Location Filter', filters.location || 'All'],
      ['Employment Type Filter', filters.employmentType || 'All'],
      ['Employee Filter', filters.employee || 'All'],
    ];
    const csv = rows.map(row => row.map(value => '"' + String(value ?? 'Not recorded').replaceAll('"', '""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hr-analytics-' + (data.period.from || 'all-time') + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748b', gap: '16px' }}>
        <Lucide.Loader2 className="animate-spin" size={32} />
        <span>Synchronizing workforce records...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <Lucide.AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
        <h3>Error loading Command Center</h3>
        <p style={{ color: '#64748b', marginTop: '8px' }}>{error || 'Unable to communicate with the HR aggregator API.'}</p>
        <button onClick={fetchHRAnalytics} style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  const {
    workforce = {},
    attendance = {},
    attendanceRequests = {},
    leave = {},
    recruitment = {},
    payroll = {},
    expenses = {},
    exits = {},
    users = {},
    employeeDataQuality = {},
    notifications = {},
    alerts = [],
    celebrations = {},
    employees = []
  } = data;

  return (
    <div className="hr-analytics-container">
      {/* ── HEADER ── */}
      <header className="dashboard-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#faf5ff', color: '#7e22ce', padding: '12px', borderRadius: '12px', border: '1.5px solid #f3e8ff' }}>
            <Lucide.Users size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>HR Analytics & Workforce Command Center</h1>
            <p className="hr-header-description">Current workforce and attendance snapshots, with payroll, leave and expense records for the selected period.</p>
          </div>
        </div>
        
        <button onClick={handleExportCSV} style={{ background: '#7e22ce', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Lucide.Download size={16} /> Export CSV
        </button>
      </header>

      {/* Filter bar */}
      <SuperAdminAnalyticsFilter
        title="HR Report Filters"
        customActions={<>
          <select aria-label="Department" className="sa-analytics-filter__select" value={filters.department || 'All'} onChange={e => setFilter('department', e.target.value)}>
            <option value="All">Department: All</option>
            {data.filters.departments.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <select aria-label="Work location" className="sa-analytics-filter__select" value={filters.location || 'All'} onChange={e => setFilter('location', e.target.value)}>
            <option value="All">Location: All</option>
            {data.filters.locations.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <select aria-label="Employment type" className="sa-analytics-filter__select" value={filters.employmentType || 'All'} onChange={e => setFilter('employmentType', e.target.value)}>
            <option value="All">Employment Type: All</option>
            {data.filters.employmentTypes.map(type => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
          </select>
          <select aria-label="Employee" className="sa-analytics-filter__select" value={filters.employee || 'All'} onChange={e => setFilter('employee', e.target.value)}>
            <option value="All">Employee: All</option>
            {data.filters.employees.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <button className="sa-analytics-filter__btn" onClick={fetchHRAnalytics}><Lucide.RefreshCw size={14} /> Refresh</button>
        </>}
      />
      <p style={{ color: '#64748b', fontSize: 12 }}>
        Updated {new Date(data.generatedAt).toLocaleString()} | {data.scope.attendance}
      </p>
      {employees.length === 0 && <p role="status">No employee records match the selected filters.</p>}


      {/* ── ALERTS / EXCEPTION CENTER ── */}
      {alerts.length > 0 && (
        <div className="hr-alerts-panel">
          <h4 className="hr-alerts-title">
            <Lucide.ShieldAlert size={18} /> Workforce Risk & Exception Alerts
          </h4>
          <div className="hr-alerts-list">
            {alerts.map((alert, idx) => (
              <div key={idx} className="hr-alert-item">
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 1. EXECUTIVE KPI SUMMARY ── */}
      <div className="hr-kpi-grid">
        <div className="hr-kpi-card purple">
          <div className="hr-kpi-card-header">
            <span>Workforce Size</span>
            <Lucide.UserCheck size={16} />
          </div>
          <div className="hr-kpi-card-value">{workforce.total ?? 'Not recorded'}</div>
          <div className="hr-kpi-card-subtext">
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{workforce.active ?? 'Not recorded'} Active</span> | <span>{workforce.inactive ?? 'Not recorded'} Inactive</span>
          </div>
        </div>

        <div className="hr-kpi-card green">
          <div className="hr-kpi-card-header">
            <span>Present Rate Today</span>
            <Lucide.CheckCircle size={16} />
          </div>
          <div className="hr-kpi-card-value">{formatPercent(attendance.today?.rate)}</div>
          <div className="hr-kpi-card-subtext">
            <span>{attendance.today?.present ?? 'Not recorded'} Present Today</span> | <span style={{ color: '#ef4444' }}>{attendance.today?.absent ?? 'Not recorded'} Absent</span>
          </div>
        </div>

        <div className="hr-kpi-card amber">
          <div className="hr-kpi-card-header">
            <span>Celebrations</span>
            <Lucide.Gift size={16} style={{ color: '#d97706' }} />
          </div>
          <div className="hr-kpi-card-value">{workforce.birthdaysCount + workforce.anniversariesCount}</div>
          <div className="hr-kpi-card-subtext">
            <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{workforce.birthdaysCount ?? 'Not recorded'} Birthdays</span> | <span style={{ color: '#1d4ed8', fontWeight: 'bold' }}>{workforce.anniversariesCount ?? 'Not recorded'} Anniversaries</span>
          </div>
        </div>

        <div className="hr-kpi-card blue">
          <div className="hr-kpi-card-header">
            <span>Active Recruitment</span>
            <Lucide.Search size={16} />
          </div>
          <div className="hr-kpi-card-value">{recruitment.summary?.openRequisitions ?? 'Not recorded'}</div>
          <div className="hr-kpi-card-subtext">
            <span>{recruitment.summary?.totalVacancies ?? 'Not recorded'} Open Vacancies</span>
          </div>
        </div>

        <div className="hr-kpi-card purple" style={{ borderLeftColor: '#a855f7' }}>
          <div className="hr-kpi-card-header">
            <span>Pending Approvals</span>
            <Lucide.Clock size={16} />
          </div>
          <div className="hr-kpi-card-value">
            {leave.summary?.pendingApproval ?? 'Not recorded'}
          </div>
          <div className="hr-kpi-card-subtext">
            <span>Leaves pending</span>
          </div>
        </div>

        <div className="hr-kpi-card rose">
          <div className="hr-kpi-card-header">
            <span>Recorded Net Payroll</span>
            <Lucide.CreditCard size={16} />
          </div>
          <div className="hr-kpi-card-value">{formatCurrency(payroll.summary?.netPayroll ?? 'Not recorded')}</div>
          <div className="hr-kpi-card-subtext">
            <span>Records for: {payroll.summary?.payableEmployees ?? 'Not recorded'} Staff</span>
          </div>
        </div>
      </div>

      {/* ── 2. TODAY'S ATTENDANCE & DEPT BREAKDOWN ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Today's Recorded Attendance</h3>
            <span className="hr-status-pill active">Today: {attendance.today?.targetDate}</span>
          </div>
          <p style={{ fontSize: 12, color: "#64748b" }}>{attendance.today.unrecorded} active staff have no attendance record today.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>CLOCK-IN ACTIVE</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>{attendance.today?.clockedIn ?? 'Not recorded'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>LATE TODAY</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#d97706' }}>{attendance.today?.late ?? 'Not recorded'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>EARLY EXITS</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#e11d48' }}>{attendance.today?.earlyExit ?? 'Not recorded'}</div>
            </div>
          </div>
          <div className="desktop-only">
            <div className="hr-table-frame" style={{ maxHeight: 220 }}>
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.punches?.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.department}</td>
                      <td>{row.time}</td>
                      <td>{row.punchOut || '—'}</td>
                      <td>
                        <span className={`hr-status-pill ${row.lateMinutes > 0 ? 'pending' : 'active'}`}>
                          {row.lateMinutes > 0 ? `Late ${row.lateMinutes}m` : 'Present'}
                        </span>
                      </td>
                    </tr>
                  ))}
                {attendance.punches.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 16 }}>No punches recorded for today.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(!attendance.punches || attendance.punches.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic' }}>
                No punches recorded for today.
              </div>
            ) : (
              attendance.punches.map((row, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{row.name}</strong>
                    <span className={`hr-status-pill ${row.lateMinutes > 0 ? 'pending' : 'active'}`} style={{ fontSize: '10.5px' }}>
                      {row.lateMinutes > 0 ? `Late ${row.lateMinutes}m` : 'Present'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                    <span>Dept: <strong>{row.department}</strong></span>
                    <span>Punch: <strong>{row.time || '—'}</strong> to <strong>{row.punchOut || '—'}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Department-Wise Attendance Today</h3>
          </div>
          <div className="desktop-only">
            <div className="hr-table-frame" style={{ maxHeight: 310 }}>
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Active Staff</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Leave</th>
                    <th>Present %</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.departmentWise?.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.department}</strong></td>
                      <td>{row.employees}</td>
                      <td>{row.present}</td>
                      <td style={{ color: '#ef4444' }}>{row.absent}</td>
                      <td>{row.leave}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{formatPercent(row.rate)}</span>
                          <div className="hr-progress-container" style={{ width: 60 }}>
                            <div className="hr-progress-fill" style={{ width: `${formatPercent(row.rate)}`, background: row.rate > 90 ? '#16a34a' : '#d97706' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attendance.departmentWise?.map((row, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{row.department}</strong>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: row.rate >= 90 ? '#16a34a' : '#d97706', background: row.rate >= 90 ? '#dcfce7' : '#fef3c7', padding: '2px 8px', borderRadius: '12px' }}>
                    {formatPercent(row.rate)} Present
                  </span>
                </div>
                <div className="hr-progress-container" style={{ width: '100%', height: '5px' }}>
                  <div className="hr-progress-fill" style={{ width: `${formatPercent(row.rate)}`, background: row.rate >= 90 ? '#16a34a' : '#d97706' }} />
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  gap: '2px',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Active Staff</span>
                    <strong style={{ fontSize: '11px', color: '#0f172a' }}>{row.employees}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', display: 'block' }}>Present</span>
                    <strong style={{ fontSize: '11px', color: '#16a34a' }}>{row.present}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', display: 'block' }}>Absent</span>
                    <strong style={{ fontSize: '11px', color: '#ef4444' }}>{row.absent}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Leave</span>
                    <strong style={{ fontSize: '11px', color: '#64748b' }}>{row.leave}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. ATTENDANCE TRENDS & Lifecycle ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Attendance Rate & Exception Trends</h3>
          </div>
          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            {(!attendance.trends || attendance.trends.length === 0) ? (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>
                No attendance trend data available for the selected period.
              </div>
            ) : (
              <ResponsiveChart height={280}>
                <ComposedChart data={attendance.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="rate" domain={[0, 100]} unit="%" width={45} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="count" orientation="right" allowDecimals={false} width={35} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="rate" type="monotone" dataKey="rate" name="Present % of recorded workdays" fill="#faf5ff" stroke="#7e22ce" strokeWidth={2} />
                  <Bar yAxisId="count" dataKey="late" name="Late Arrivals" fill="#d97706" barSize={12} />
                </ComposedChart>
              </ResponsiveChart>
            )}
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Workforce Lifecycle & Account Audit</h3>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 12.5, color: '#64748b' }}>Status counts along the employee lifecycle.</p>
          <p style={{ fontSize: 12, color: "#64748b" }}>{data.scope.recruitment}</p>
          <div className="hr-lifecycle-funnel">
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Hiring</span>
              <span className="hr-funnel-step-value">{recruitment.summary?.totalVacancies ?? 'Not recorded'}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Selected</span>
              <span className="hr-funnel-step-value">{recruitment.pipeline?.selected ?? 'Not recorded'}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Joined</span>
              <span className="hr-funnel-step-value">{recruitment.pipeline?.joined ?? 'Not recorded'}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Active</span>
              <span className="hr-funnel-step-value">{workforce.active ?? 'Not recorded'}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">On Notice</span>
              <span className="hr-funnel-step-value">{exits.summary?.notice ?? 'Not recorded'}</span>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 14, background: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 'bold', color: '#1e40af' }}>ERP LOG-IN AUDIT</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>Total Active Staff</span>
              <strong>{workforce.active ?? 'Not recorded'} Employees</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ef4444' }}>
              <span>Employees Without Login Credentials</span>
              <strong>{users.summary?.noLogin ?? 'Not recorded'} Staff</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>Active User Accounts</span>
              <strong>{users.summary?.active ?? 'Not recorded'} Users</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. LEAVE & WORKFORCE AVAILABILITY ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Approved Leave Requests by Type</h3>
          </div>
          <p style={{ fontSize: 12, color: "#64748b" }}>{data.scope.leave}</p>
          <div style={{ display: 'flex', alignItems: 'center', height: '240px', width: '100%', minWidth: 0 }}>
            <div style={{ flex: 1 }}>
              {leave.types?.length === 0 ? (
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>No approved leave requests overlap this period.</div>
              ) : (
                <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                  <ResponsiveChart height={240}>
                    <PieChart>
                      <Pie data={leave.types} cx="50%" cy="50%" innerRadius="40%" outerRadius="75%" paddingAngle={3} dataKey="value">
                        {leave.types?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveChart>
                </div>
              )}
            </div>
            <div style={{ width: 140, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {leave.types?.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span style={{ fontWeight: 'bold' }}>{item.value}d</span>
                  <span style={{ color: '#64748b' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Leave Calendar & Availability Risks</h3>
          </div>
          <div className="desktop-only">
            <div className="hr-table-frame">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Leaves Active</th>
                    <th>Source</th>
                    <th>Department Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {leave.trends?.map((day, idx) => (
                    <tr key={idx}>
                      <td><strong>{day.date}</strong></td>
                      <td style={{ fontWeight: 'bold' }}>{day.leaves} Employees</td>
                      <td>
                        <span className={`hr-status-pill ${day.leaves > 3 ? 'rose' : day.leaves > 1 ? 'pending' : 'active'}`}>
                          Approved requests
                        </span>
                      </td>
                      <td style={{ fontSize: 11.5, color: '#64748b' }}>
                        {Object.entries(day.breakdown || {}).map(([dept, count]) => `${dept}: ${count}`).join(', ') || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leave.trends?.map((day, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{day.date}</strong>
                  <span className={`hr-status-pill ${day.leaves > 3 ? 'rose' : day.leaves > 1 ? 'pending' : 'active'}`} style={{ fontSize: '10.5px' }}>
                    Approved requests
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>Active Leaves: <strong>{day.leaves} Staff</strong></span>
                  <span>Dept: <strong>{Object.entries(day.breakdown || {}).map(([dept, count]) => `${dept} (${count})`).join(', ') || 'None'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. PAYROLL & DEPT COSTS ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Department-Wise Recorded Payroll</h3>
          </div>
          <p style={{ fontSize: 12, color: "#64748b" }}>{data.scope.payroll}</p>
          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            {(!payroll.departmentWise || payroll.departmentWise.length === 0) ? (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>
                No payroll data available for the selected period.
              </div>
            ) : (
              <ResponsiveChart height={280}>
                <BarChart data={payroll.departmentWise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                  <YAxis width={60} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="gross" name="Gross Salary" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Net Paid" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveChart>
            )}
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Statutory Employee Data Completeness</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>MISSING PAN</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#b91c1c' }}>{employeeDataQuality.missingFieldCounts?.pan ?? 'Not recorded'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>MISSING AADHAAR</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#b91c1c' }}>{employeeDataQuality.missingFieldCounts?.aadhaar ?? 'Not recorded'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>MISSING BANK ACC</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#b91c1c' }}>{employeeDataQuality.missingFieldCounts?.bank ?? 'Not recorded'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>MISSING MANAGER</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>{employeeDataQuality.missingFieldCounts?.manager ?? 'Not recorded'}</div>
            </div>
          </div>
          <div className="desktop-only">
            <div className="hr-table-frame" style={{ maxHeight: 180 }}>
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Missing Statutory Records</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeDataQuality.incompleteRecords?.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.department}</td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 11.5 }}>
                        {item.missingFields?.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(!employeeDataQuality.incompleteRecords || employeeDataQuality.incompleteRecords.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#16a34a', fontSize: '12.5px', fontStyle: 'italic' }}>
                {employees.length ? 'No missing fields found by the employee record checks.' : 'No employee records to check.'}
              </div>
            ) : (
              employeeDataQuality.incompleteRecords.map((item, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{item.name}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.department}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px' }}>
                    Missing: {item.missingFields?.join(', ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 6. EXPENSES & EXITS CLEARANCE ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Expense Outlay Category distribution</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '220px', width: '100%', minWidth: 0 }}>
            <div style={{ flex: 1 }}>
              {expenses.categories?.length === 0 ? (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>No expense claims found.</div>
              ) : (
                <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                  <ResponsiveChart height={220}>
                    <PieChart>
                      <Pie data={expenses.categories} cx="50%" cy="50%" innerRadius="40%" outerRadius="75%" paddingAngle={3} dataKey="value">
                        {expenses.categories?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveChart>
                </div>
              )}
            </div>
            <div style={{ width: 140, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {expenses.categories?.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span style={{ fontWeight: 'bold' }}>₹{formatNumber(item.value)}</span>
                  <span style={{ color: '#64748b' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Offboarding Clearance Tracker</h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>Attrition: {exits.attrition?.attritionRate ?? 'Not recorded'}</span>
          </div>
          <p style={{ color: "#64748b", fontSize: 13 }}>{data.scope.exits}</p>
          <div className="desktop-only">
            <div className="hr-table-frame">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Exiting Employee</th>
                    <th>Department</th>
                    <th>Last Working Day</th>
                    <th>Pending Checkpoint</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {exits.clearances?.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.employee}</strong></td>
                      <td>{item.department}</td>
                      <td>{item.lastWorkingDay}</td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.pendingWith}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{item.progress}%</span>
                          <div className="hr-progress-container" style={{ width: 60 }}>
                            <div className="hr-progress-fill" style={{ width: `${item.progress}%`, background: item.progress === 100 ? '#16a34a' : '#2563eb' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {exits.clearances?.map((item, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{item.employee}</strong>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: item.progress === 100 ? '#16a34a' : '#2563eb', background: item.progress === 100 ? '#dcfce7' : '#eff6ff', padding: '2px 8px', borderRadius: '12px' }}>
                    {item.progress}% Clearance
                  </span>
                </div>
                <div className="hr-progress-container" style={{ width: '100%', height: '5px' }}>
                  <div className="hr-progress-fill" style={{ width: `${item.progress}%`, background: item.progress === 100 ? '#16a34a' : '#2563eb' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>Last Day: <strong>{item.lastWorkingDay}</strong></span>
                  <span>Pending: <strong style={{ color: '#dc2626' }}>{item.pendingWith}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CELEBRATIONS (BIRTHDAYS & ANNIVERSARIES) ── */}
      <div className="hr-double-grid" style={{ marginBottom: '24px' }}>
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Lucide.Cake size={18} style={{ color: '#7e22ce' }} /> Birthdays ({data.scope.celebrations})
            </h3>
            <span className="hr-status-pill active" style={{ background: '#faf5ff', color: '#7e22ce', border: '1px solid #f3e8ff' }}>
              {celebrations?.birthdays?.length ?? 'Not recorded'} Birthdays
            </span>
          </div>
          <div className="hr-table-frame" style={{ maxHeight: '240px' }}>
            {(!celebrations?.birthdays || celebrations.birthdays.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>
                No birthdays in this date range.
              </div>
            ) : (
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Birthday</th>
                  </tr>
                </thead>
                <tbody>
                  {celebrations.birthdays.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.department}</td>
                      <td style={{ color: '#7e22ce', fontWeight: 'bold' }}>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Lucide.Gift size={18} style={{ color: '#2563eb' }} /> Work Anniversaries ({data.scope.celebrations})
            </h3>
            <span className="hr-status-pill active" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
              {celebrations?.anniversaries?.length ?? 'Not recorded'} Anniversaries
            </span>
          </div>
          <div className="hr-table-frame" style={{ maxHeight: '240px' }}>
            {(!celebrations?.anniversaries || celebrations.anniversaries.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>
                No work anniversaries in this date range.
              </div>
            ) : (
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Anniversary</th>
                    <th>Years Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {celebrations.anniversaries.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.department}</td>
                      <td style={{ color: '#2563eb', fontWeight: 'bold' }}>{item.date}</td>
                      <td>
                        <span className="hr-status-pill active" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                          {item.years} {item.years === 1 ? 'Year' : 'Years'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── 7. EMPLOYEE DIRECTORY & DRILL DOWN ── */}
      <div className="hr-card">
        <div className="hr-card-header">
          <h3 className="hr-card-title">Staff Database Telemetry & Directory</h3>
        </div>
        <div className="desktop-only">
          <div className="hr-table-frame">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Location</th>
                  <th>Manager</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedEmp(emp)}>
                    <td><strong>{emp.fullName}</strong></td>
                    <td><code>{emp.employeeCode}</code></td>
                    <td>{emp.department?.name || 'Unassigned'}</td>
                    <td>{emp.jobTitle}</td>
                    <td>{emp.workLocation?.name || 'Not recorded'}</td>
                    <td>{emp.reportingManager?.fullName || '—'}</td>
                    <td>{emp.joiningDate ? emp.joiningDate.slice(0, 10) : '—'}</td>
                    <td>
                      <span className={`hr-status-pill ${emp.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Staff Cards */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {employees.map((emp, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedEmp(emp)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{emp.fullName}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', color: '#0284c7', fontWeight: 700 }}>
                      {emp.employeeCode}
                    </code>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>• {emp.department?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <span className={`hr-status-pill ${emp.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`} style={{ fontSize: '10.5px' }}>
                  {emp.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                <div>
                  <span>Role: </span>
                  <strong style={{ color: '#334155' }}>{emp.jobTitle}</strong>
                </div>
                <div>
                  <span>Joined: </span>
                  <strong style={{ color: '#334155' }}>{emp.joiningDate ? emp.joiningDate.slice(0, 10) : '—'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DRILL DOWN SLIDE DRAWER ── */}
      {selectedEmp && (
        <div className="hr-drawer-overlay" onClick={() => setSelectedEmp(null)}>
          <div className="hr-drawer-box" onClick={(e) => e.stopPropagation()}>
            <div className="hr-drawer-header">
              <h3 className="hr-drawer-title">Employee Profile: {selectedEmp.fullName}</h3>
              <button className="hr-drawer-close" onClick={() => setSelectedEmp(null)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#faf5ff', padding: 16, borderRadius: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#7e22ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold' }}>
                  {selectedEmp.fullName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{selectedEmp.fullName}</h4>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Code: {selectedEmp.employeeCode}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Work Identity</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Department</span>
                  <strong>{selectedEmp.department?.name || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Designation</span>
                  <strong>{selectedEmp.jobTitle}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Reporting Manager</span>
                  <strong>{selectedEmp.reportingManager?.fullName || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Joining Date</span>
                  <strong>{selectedEmp.joiningDate ? selectedEmp.joiningDate.slice(0, 10) : '—'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Statutory & Payroll Data</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Base Salary</span>
                  <strong>{formatCurrency(selectedEmp.baseSalary)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>PAN Card</span>
                  <strong>{selectedEmp.panNumber ? `${selectedEmp.panNumber.slice(0, 4)}XXXXX` : 'Missing'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Bank Account</span>
                  <strong>{selectedEmp.bankAccountLastFour ? `XXXXXX${selectedEmp.bankAccountLastFour}` : 'Missing'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Bank Name / IFSC</span>
                  <strong>{selectedEmp.bankName ? `${selectedEmp.bankName} (${selectedEmp.ifscCode})` : 'Missing'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Emergency Contact</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Relationship / Name</span>
                  <strong>{selectedEmp.emergencyRelationship} ({selectedEmp.emergencyContactName})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Contact Number</span>
                  <strong>{selectedEmp.emergencyContactPhone}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
