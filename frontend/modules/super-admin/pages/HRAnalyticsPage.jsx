'use client';

import React, { useState, useEffect, useCallback, useRef, cloneElement } from 'react';
import * as Lucide from 'lucide-react';
import { 
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { backendFetch } from '@/lib/backendFetch';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import './HRAnalyticsPage.css';

const CHART_COLORS = ["#7e22ce", "#16a34a", "#2563eb", "#d97706", "#e11d48", "#06b6d4", "#64748b"];

function ResponsiveChart({ height, children }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!ref.current) return;
    
    const initialWidth = ref.current.getBoundingClientRect().width || ref.current.offsetWidth;
    if (initialWidth > 0) {
      setWidth(initialWidth);
    }

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth } = entries[0].contentRect;
      if (newWidth > 0) {
        setWidth(newWidth);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div style={{ height: `${height}px`, width: '100%' }} />;
  }

  return (
    <div ref={ref} style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      {width > 0 && cloneElement(children, { width, height })}
    </div>
  );
}

export default function HRAnalyticsPage() {
  const { period, startDate, endDate, activeDates, filters, setFilter } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Drill-down Drawer Employee selection
  const [selectedEmp, setSelectedEmp] = useState(null);

  const fetchHRAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('from', startDate);
      if (endDate) params.append('to', endDate);
      if (filters.branch && filters.branch !== 'All') params.append('branchId', filters.branch);
      if (filters.department && filters.department !== 'All') params.append('departmentId', filters.department);
      if (filters.employmentType && filters.employmentType !== 'All') params.append('employmentType', filters.employmentType);
      if (filters.employee && filters.employee !== 'All') params.append('employeeId', filters.employee);

      const res = await backendFetch(`/api/backend/super-admin/analytics/hr?${params.toString()}`, { cacheTtlMs: 0 });
      setData(res);
    } catch (err) {
      console.error('Error fetching HR analytics:', err);
      setError('Unable to load HR & Workforce Command Center telemetry.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filters]);

  useEffect(() => {
    fetchHRAnalytics();
  }, [fetchHRAnalytics]);

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Metric,Value", 
         `Total Employees,${data.workforce?.total ?? 0}`,
         `Present Today,${data.attendance?.today?.present ?? 0}`,
         `Absent Today,${data.attendance?.today?.absent ?? 0}`,
         `Late Today,${data.attendance?.today?.late ?? 0}`,
         `Payroll Cost,₹${data.payroll?.summary?.netPayroll ?? 0}`,
         `Expenses Approved,₹${data.expenses?.summary?.approved ?? 0}`
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hr-analytics-summary-${startDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <p className="hr-header-description">Complete workforce visibility across employees, attendance, leave, recruitment, payroll, expenses and exits.</p>
          </div>
        </div>
        
        <button onClick={handleExportCSV} style={{ background: '#7e22ce', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Lucide.Download size={16} /> Export CSV
        </button>
      </header>

      {/* ── FILTER BAR ── */}
      <SuperAdminAnalyticsFilter
        title="Command Center Filter Control"
        showBranch={true}
        showDepartment={true}
        showEmploymentType={true}
        showEmployee={true}
      />

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
          <div className="hr-kpi-card-value">{workforce.total ?? 0}</div>
          <div className="hr-kpi-card-subtext">
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{workforce.active ?? 0} Active</span> | <span>{workforce.inactive ?? 0} Inactive</span>
          </div>
        </div>

        <div className="hr-kpi-card green">
          <div className="hr-kpi-card-header">
            <span>Attendance Rate</span>
            <Lucide.CheckCircle size={16} />
          </div>
          <div className="hr-kpi-card-value">{attendance.today?.rate ?? '100'}%</div>
          <div className="hr-kpi-card-subtext">
            <span>{attendance.today?.present ?? 0} Present Today</span> | <span style={{ color: '#ef4444' }}>{attendance.today?.absent ?? 0} Absent</span>
          </div>
        </div>

        <div className="hr-kpi-card amber">
          <div className="hr-kpi-card-header">
            <span>Celebrations</span>
            <Lucide.Gift size={16} style={{ color: '#d97706' }} />
          </div>
          <div className="hr-kpi-card-value">{(workforce.birthdaysCount ?? 0) + (workforce.anniversariesCount ?? 0)}</div>
          <div className="hr-kpi-card-subtext">
            <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{workforce.birthdaysCount ?? 0} Birthdays</span> | <span style={{ color: '#1d4ed8', fontWeight: 'bold' }}>{workforce.anniversariesCount ?? 0} Anniversaries</span>
          </div>
        </div>

        <div className="hr-kpi-card blue">
          <div className="hr-kpi-card-header">
            <span>Active Recruitment</span>
            <Lucide.Search size={16} />
          </div>
          <div className="hr-kpi-card-value">{recruitment.summary?.openRequisitions ?? 0}</div>
          <div className="hr-kpi-card-subtext">
            <span>{recruitment.summary?.totalVacancies ?? 0} Open Vacancies</span>
          </div>
        </div>

        <div className="hr-kpi-card purple" style={{ borderLeftColor: '#a855f7' }}>
          <div className="hr-kpi-card-header">
            <span>Pending Approvals</span>
            <Lucide.Clock size={16} />
          </div>
          <div className="hr-kpi-card-value">
            {leave.summary?.pendingApproval ?? 0}
          </div>
          <div className="hr-kpi-card-subtext">
            <span>Leaves pending</span>
          </div>
        </div>

        <div className="hr-kpi-card rose">
          <div className="hr-kpi-card-header">
            <span>Monthly Net Payroll</span>
            <Lucide.CreditCard size={16} />
          </div>
          <div className="hr-kpi-card-value">{formatCurrency(payroll.summary?.netPayroll ?? 0)}</div>
          <div className="hr-kpi-card-subtext">
            <span>Payable: {payroll.summary?.payableEmployees ?? 0} Staff</span>
          </div>
        </div>
      </div>

      {/* ── 2. TODAY'S ATTENDANCE & DEPT BREAKDOWN ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Live Attendance Command</h3>
            <span className="hr-status-pill active">Today: {attendance.today?.targetDate}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>CLOCK-IN ACTIVE</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>{attendance.today?.clockedIn ?? 0}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>LATE TODAY</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#d97706' }}>{attendance.today?.late ?? 0}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>EARLY EXITS</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#e11d48' }}>{attendance.today?.earlyExit ?? 0}</div>
            </div>
          </div>
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
                {attendance.lateArrivals?.list?.map((row, idx) => (
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
              </tbody>
            </table>
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Department-Wise Attendance</h3>
          </div>
          <div className="hr-table-frame" style={{ maxHeight: 310 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Expected</th>
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
                        <span>{row.rate}%</span>
                        <div className="hr-progress-container" style={{ width: 60 }}>
                          <div className="hr-progress-fill" style={{ width: `${row.rate}%`, background: row.rate > 90 ? '#16a34a' : '#d97706' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <YAxis width={40} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="rate" name="Present Rate %" fill="#faf5ff" stroke="#7e22ce" strokeWidth={2} />
                  <Bar dataKey="late" name="Late Arrivals" fill="#d97706" barSize={12} />
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
          <div className="hr-lifecycle-funnel">
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Hiring</span>
              <span className="hr-funnel-step-value">{recruitment.summary?.totalVacancies ?? 0}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Selected</span>
              <span className="hr-funnel-step-value">{recruitment.pipeline?.selected ?? 0}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Onboarding</span>
              <span className="hr-funnel-step-value">{recruitment.pipeline?.joined ?? 0}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">Active</span>
              <span className="hr-funnel-step-value">{workforce.active ?? 0}</span>
            </div>
            <div className="hr-funnel-step">
              <span className="hr-funnel-step-label">On Notice</span>
              <span className="hr-funnel-step-value">{exits.summary?.notice ?? 0}</span>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 14, background: '#eff6ff', borderRadius: 8, border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 'bold', color: '#1e40af' }}>ERP LOG-IN AUDIT</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>Total Active Staff</span>
              <strong>{workforce.active ?? 0} Employees</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ef4444' }}>
              <span>Employees Without Login Credentials</span>
              <strong>{users.summary?.noLogin ?? 0} Staff</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>Active User Accounts</span>
              <strong>{users.summary?.active ?? 0} Users</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. LEAVE & WORKFORCE AVAILABILITY ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Leave Type Breakdown</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '240px', width: '100%', minWidth: 0 }}>
            <div style={{ flex: 1 }}>
              {leave.types?.length === 0 ? (
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>No leave transactions this month.</div>
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
          <div className="hr-table-frame">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Leaves Active</th>
                  <th>Risk Level</th>
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
                        {day.leaves > 3 ? 'High Staffing Risk' : day.leaves > 1 ? 'Moderate' : 'Healthy'}
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
      </div>

      {/* ── 5. PAYROLL & DEPT COSTS ── */}
      <div className="hr-double-grid">
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title">Department-Wise Payroll Expense</h3>
          </div>
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
              <div style={{ fontSize: 16, fontWeight: 900, color: '#b91c1c' }}>{employeeDataQuality.missingFieldCounts?.pan ?? 0}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>MISSING AADHAAR</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#b91c1c' }}>{employeeDataQuality.missingFieldCounts?.aadhaar ?? 0}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>MISSING BANK ACC</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#b91c1c' }}>{employeeDataQuality.missingFieldCounts?.bank ?? 0}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>MISSING MANAGER</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>{employeeDataQuality.missingFieldCounts?.manager ?? 0}</div>
            </div>
          </div>
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
            <span style={{ fontSize: 12, color: '#64748b' }}>Attrition: {exits.attrition?.attritionRate}</span>
          </div>
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
      </div>

      {/* ── CELEBRATIONS (BIRTHDAYS & ANNIVERSARIES) ── */}
      <div className="hr-double-grid" style={{ marginBottom: '24px' }}>
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Lucide.Cake size={18} style={{ color: '#7e22ce' }} /> Birthdays in Selected Period
            </h3>
            <span className="hr-status-pill active" style={{ background: '#faf5ff', color: '#7e22ce', border: '1px solid #f3e8ff' }}>
              {celebrations?.birthdays?.length ?? 0} Birthdays
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
              <Lucide.Gift size={18} style={{ color: '#2563eb' }} /> Work Anniversaries in Selected Period
            </h3>
            <span className="hr-status-pill active" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
              {celebrations?.anniversaries?.length ?? 0} Anniversaries
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
              {employees.slice(0, 10).map((emp, idx) => (
                <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedEmp(emp)}>
                  <td><strong>{emp.fullName}</strong></td>
                  <td><code>{emp.employeeCode}</code></td>
                  <td>{emp.department?.name || 'Unassigned'}</td>
                  <td>{emp.jobTitle}</td>
                  <td>{emp.workLocation?.name || 'Factory Head'}</td>
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
                  <strong>{formatCurrency(Number(selectedEmp.baseSalary ?? 0))}</strong>
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
