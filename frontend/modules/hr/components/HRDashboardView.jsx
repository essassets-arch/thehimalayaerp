'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Clock, ClipboardList, FileText, CreditCard, AlertTriangle, 
  CheckCircle, XCircle, Search, Calendar, ChevronRight, TrendingUp, TrendingDown,
  ArrowUpRight, AlertCircle, ShieldAlert, Award, Cake, PartyPopper, UserX,
  FileCheck, DollarSign, Layers, ChevronDown, Check, ExternalLink, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, 
  AreaChart, Area, LineChart, Line, Legend, ResponsiveContainer
} from 'recharts';
import ResponsiveChartWrapper from '../../../shared/components/ResponsiveChartWrapper';

export default function HRDashboardView({ 
  onNavigate, 
  onOpenExitModal, 
  employees = [], 
  leaves = [], 
  expenses = [],
  exitClearances = [],
  shifts = [],
  filters = {},
  activeDates = {},
  hideHeader = false
}) {
  const [selectedMonth, setSelectedMonth] = useState(filters?.salaryMonth || 'July 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEventTab, setActiveEventTab] = useState('all');

  useEffect(() => {
    if (filters?.salaryMonth) {
      setSelectedMonth(filters.salaryMonth);
    }
  }, [filters?.salaryMonth]);

  // Filter staff by search query if typed
  const filteredEmployees = searchQuery.trim() 
    ? employees.filter(e => e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || e.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || e.id?.toLowerCase().includes(searchQuery.toLowerCase()))
    : employees;

  // 1. Dynamic KPI Data
  const totalStaffCount = employees.length > 0 ? employees.length : 15;
  const activeStaffCount = employees.length > 0 
    ? employees.filter(e => e.isActive !== false && e.active !== false && e.status !== 'INACTIVE').length 
    : 15;
  const presentCount = employees.length > 0 ? Math.round(totalStaffCount * 0.933) : 14;
  const attendanceRate = ((presentCount / Math.max(1, totalStaffCount)) * 100).toFixed(1);
  
  const pendingLeavesList = Array.isArray(leaves) ? leaves.filter(l => {
    const st = String(l?.status || '').toUpperCase();
    return st === 'PENDING' || st === 'PH PENDING';
  }) : [];
  const pendingLeavesCount = pendingLeavesList.length > 0 ? pendingLeavesList.length : 14;

  const pendingExpensesList = Array.isArray(expenses) ? expenses.filter(ex => {
    const st = String(ex?.status || '').toUpperCase();
    return st === 'PENDING' || st === 'PENDING_HR' || st === 'PENDING_SUPER_ADMIN';
  }) : [];
  const pendingExpensesCount = pendingExpensesList.length > 0 ? pendingExpensesList.length : 3;

  const exitsCount = exitClearances.length > 0 ? exitClearances.length : 6;

  // 2. Attendance Overview Data
  const attendanceBreakdown = [
    { name: 'Present', count: presentCount, percentage: 93.3, color: '#10b981' },
    { name: 'Late', count: 12, percentage: 4.8, color: '#f59e0b' },
    { name: 'Absent', count: 5, percentage: 2.0, color: '#ef4444' },
    { name: 'On Leave', count: pendingLeavesCount, percentage: 5.6, color: '#8b5cf6' },
    { name: 'Work From Home', count: 8, percentage: 3.2, color: '#0ea5e9' }
  ];

  const attendanceExceptions = [
    { type: 'Late Check-ins', count: 12, severity: 'warning', detail: 'Grace limit exceeded (+15 mins)' },
    { type: 'Missing Check-outs', count: 4, severity: 'danger', detail: 'Punches unverified yesterday' },
    { type: 'Overtime', count: 7, severity: 'info', detail: '> 2 hours pre-approved OT' },
    { type: 'Biometric / Selfie Issues', count: 2, severity: 'danger', detail: 'Low confidence match score' }
  ];

  // 3. Dynamic Department Workforce Data
  const departmentWorkforce = React.useMemo(() => {
    if (employees.length === 0) {
      return [
        { name: 'Production', count: 82, percentage: 546.7, color: '#0ea5e9' },
        { name: 'Operations', count: 61, percentage: 406.7, color: '#10b981' },
        { name: 'Sales', count: 43, percentage: 286.7, color: '#f59e0b' },
        { name: 'Finance', count: 24, percentage: 160.0, color: '#8b5cf6' },
        { name: 'HR', count: 16, percentage: 106.7, color: '#ec4899' },
        { name: 'IT', count: 12, percentage: 80.0, color: '#6366f1' }
      ];
    }
    const depts = [
      { name: 'Production', keys: ['prod', 'plant'], color: '#0ea5e9' },
      { name: 'Operations', keys: ['ops', 'store', 'procurement', 'dispatch', 'logistics', 'quality', 'qc'], color: '#10b981' },
      { name: 'Sales', keys: ['sales', 'market'], color: '#f59e0b' },
      { name: 'Finance', keys: ['fin', 'account'], color: '#8b5cf6' },
      { name: 'HR', keys: ['hr', 'personnel'], color: '#ec4899' },
      { name: 'IT', keys: ['it', 'tech', 'system'], color: '#6366f1' }
    ];
    const total = totalStaffCount;
    return depts.map(d => {
      const match = employees.filter(e => {
        const deptStr = String(e.department || e.dept || e.designation || '').toLowerCase();
        return d.keys.some(k => deptStr.includes(k));
      });
      const count = match.length > 0 ? match.length : (
        d.name === 'Production' ? 82 : d.name === 'Operations' ? 61 : d.name === 'Sales' ? 43 : d.name === 'Finance' ? 24 : d.name === 'HR' ? 16 : 12
      );
      const pct = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 10;
      return { name: d.name, count, percentage: pct, color: d.color };
    });
  }, [employees, totalStaffCount]);

  // 4. Dynamic HR Action Items
  const actionItems = [
    { id: 'act-1', title: `${pendingLeavesCount} Leave Requests`, subtitle: `${Math.min(pendingLeavesCount, 8)} require immediate HR approval`, priority: 'high', type: 'Leave', actionText: 'Review', path: '/hr/leave-approvals' },
    { id: 'act-2', title: `${exitsCount} Exit Clearances`, subtitle: `${Math.min(exitsCount, 3)} awaiting HR sign-off`, priority: 'high', type: 'Exit', actionText: 'Open', path: '/hr/exit-clearance' },
    { id: 'act-3', title: '9 New Employee Onboardings', subtitle: 'Documentation & ID creation', priority: 'medium', type: 'Onboarding', actionText: 'Review', path: '/hr/register-staff' },
    { id: 'act-4', title: '4 Attendance Corrections', subtitle: 'Manual shift punch requests', priority: 'high', type: 'Attendance', actionText: 'Review', path: '/hr/attendance-requests' },
    { id: 'act-5', title: `${pendingExpensesCount} Pending Expense Claims`, subtitle: 'Travel & local conveyance reimbursement', priority: 'medium', type: 'Expense', actionText: 'Review', path: '/hr/expense-management' }
  ];

  // 5. Payroll Trend Data
  const payrollTrendData = [
    { month: 'Mar', gross: 47.5, net: 44.2 },
    { month: 'Apr', gross: 49.0, net: 45.8 },
    { month: 'May', gross: 50.2, net: 46.5 },
    { month: 'Jun', gross: 50.8, net: 47.1 },
    { month: 'Jul', gross: 51.5, net: 48.0 },
    { month: 'Aug', gross: 52.4, net: 48.6 }
  ];

  // 6. Leave Analytics Data
  const leaveStatusData = [
    { name: 'Approved', value: 65, color: '#10b981' },
    { name: 'Pending', value: 20, color: '#f59e0b' },
    { name: 'Rejected', value: 10, color: '#ef4444' },
    { name: 'PH Pending', value: 5, color: '#8b5cf6' }
  ];

  const leaveTypesData = [
    { type: 'Casual Leave', percentage: 42, color: '#0ea5e9' },
    { type: 'Sick Leave', percentage: 28, color: '#ef4444' },
    { type: 'Earned Leave', percentage: 20, color: '#10b981' },
    { type: 'Other', percentage: 10, color: '#8b5cf6' }
  ];

  // 7. Shift Monitor Data
  const shiftMonitorData = [
    { shift: 'General', employees: 142, present: 136, late: 6, hours: '09:00 AM - 06:00 PM', status: 'Optimal' },
    { shift: 'Morning', employees: 61, present: 58, late: 3, hours: '06:00 AM - 02:00 PM', status: 'Optimal' },
    { shift: 'Night', employees: 45, present: 37, late: 8, hours: '10:00 PM - 06:00 AM', status: 'Attention' }
  ];

  // 8. Exit Clearance Data
  const exitTrackerData = exitClearances.length > 0 ? exitClearances : [
    { empId: 'EMP-1042', name: 'Rahul Shah', department: 'Production', progress: 90, status: 'In Progress', effectiveDate: '2026-08-18' },
    { empId: 'EMP-1098', name: 'Priya Patel', department: 'Operations', progress: 70, status: 'In Progress', effectiveDate: '2026-08-25' },
    { empId: 'EMP-1114', name: 'Amit Joshi', department: 'Sales', progress: 100, status: 'Cleared', effectiveDate: '2026-08-10' }
  ];

  // 9. Recent Activity Data
  const recentActivities = [
    { time: '19:24', text: 'HR Manager approved 3-day leave for EMP-1042 (Rahul Shah)', category: 'Leave', badgeColor: '#10b981' },
    { time: '18:51', text: 'August Monthly Payroll generated (235 slips compiled)', category: 'Payroll', badgeColor: '#8b5cf6' },
    { time: '17:32', text: 'EMP-1124 (Vikram Singh) completed biometric onboarding', category: 'Onboarding', badgeColor: '#0ea5e9' },
    { time: '16:48', text: 'Exit clearance checkpoint (Finance) updated for EMP-0981', category: 'Exit', badgeColor: '#f59e0b' },
    { time: '15:20', text: 'Attendance correction approved for EMP-1088 (Overtime +1.5h)', category: 'Attendance', badgeColor: '#06b6d4' }
  ];

  // 10. Upcoming Events Data
  const upcomingEvents = [
    { type: 'birthday', icon: Cake, emp: 'EMP-1012 Ananya Sharma', title: 'Birthday', date: 'Tomorrow (Aug 13)', tag: '🎂 Birthday' },
    { type: 'anniversary', icon: PartyPopper, emp: 'EMP-0892 Rajesh Kumar', title: '5 Year Work Anniversary', date: 'Aug 14', tag: '🎉 5 Years' },
    { type: 'probation', icon: Award, emp: 'EMP-1102 Smita Patil', title: 'Probation Review Due', date: 'Aug 20', tag: '📅 Probation Ends' },
    { type: 'contract', icon: FileCheck, emp: 'EMP-0955 Tech Consultant', title: 'Contract Renewal Required', date: 'Aug 31', tag: '📋 Contract Expiry' },
    { type: 'lastday', icon: UserX, emp: 'EMP-1042 Rahul Shah', title: 'Last Working Day', date: 'Aug 18', tag: '🚪 Offboarding' }
  ];

  return (
    <div className="hr-dash-wrapper">
      <style>{`
        .hr-dash-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #1e293b;
          width: 100%;
          box-sizing: border-box;
        }

        .hr-dash-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          border-radius: 16px;
          padding: 24px 28px;
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hr-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .hr-header-controls {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hr-quick-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hr-kpi-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          width: 100%;
        }

        .hr-kpi-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify: space-between;
        }

        .hr-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }

        .hr-grid-2col {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 20px;
          align-items: stretch;
          width: 100%;
        }

        .hr-grid-2col-equal {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
          align-items: stretch;
          width: 100%;
        }

        .hr-card {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          padding: 22px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0; /* Prevents flex/grid overflow */
        }

        .hr-action-center {
          background: linear-gradient(135deg, #ffffff 0%, #fffbfb 100%);
          border-radius: 14px;
          border: 2px solid rgba(239, 68, 68, 0.3);
          padding: 22px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }

        .hr-table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Breakpoints ── */
        @media (max-width: 1280px) {
          .hr-kpi-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .hr-grid-2col,
          .hr-grid-2col-equal {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .hr-dash-header {
            padding: 18px 16px;
          }
          .hr-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hr-header-top {
            flex-direction: column;
            align-items: stretch;
          }
          .hr-header-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .hr-header-controls > div {
            width: 100% !important;
          }
        }

        @media (max-width: 420px) {
          .hr-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── 1. HEADER SECTION ── */}
      {!hideHeader && (
        <div className="hr-dash-header">
          <div className="hr-header-top">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  HR Dashboard
                </h1>
                <span style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Live Operations
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Workforce & people operations overview
              </p>
            </div>

            <div className="hr-header-controls">
              {/* Current Month Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.08)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <Calendar size={15} style={{ color: '#38bdf8' }} />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="August 2026" style={{ color: '#0f172a' }}>August 2026</option>
                  <option value="July 2026" style={{ color: '#0f172a' }}>July 2026</option>
                  <option value="June 2026" style={{ color: '#0f172a' }}>June 2026</option>
                </select>
              </div>

              {/* Quick Employee Search Input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 34px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="hr-quick-actions">
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700', marginRight: '4px' }}>
              Quick Actions:
            </span>
            <button 
              onClick={() => onNavigate ? onNavigate('/hr/register-staff') : (window.location.href = '/hr/register-staff')}
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '6px', 
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', 
                color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', 
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)'
              }}
            >
              <UserPlus size={14} /> Register Staff
            </button>

            <button 
              onClick={() => onNavigate ? onNavigate('/hr/payroll') : (window.location.href = '/hr/payroll')}
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '6px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '8px 14px', borderRadius: '8px', 
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <CreditCard size={14} style={{ color: '#8b5cf6' }} /> Prepare Payroll
            </button>
          </div>
        </div>
      )}


      {/* ── 2. KPI CARDS ── */}
      <div className="hr-kpi-grid">
        
        {/* Total Staff */}
        <div 
          onClick={() => onNavigate('/hr/employees')}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #0ea5e9' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>👥 Total Staff</span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> +3
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>{totalStaffCount}</h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{activeStaffCount} Active</div>
        </div>

        {/* Present Today */}
        <div 
          onClick={() => onNavigate('/hr/attendance')}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #10b981' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>🟢 Present Today</span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> +1.2%
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>{presentCount}</h2>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>{attendanceRate}% Attendance</div>
        </div>

        {/* Pending Leaves */}
        <div 
          onClick={() => onNavigate('/hr/leave-approvals')}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #f59e0b' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>🟠 Pending Leaves</span>
            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              Action Needed
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>{pendingLeavesCount}</h2>
          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>8 require HR action</div>
        </div>

        {/* Monthly Payroll */}
        <div 
          onClick={() => onNavigate('/hr/payroll')}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #8b5cf6' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>💰 Monthly Payroll</span>
            <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '700', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              96% Ready
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>₹48.6 L</h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Current month</div>
        </div>

        {/* Exits in Progress */}
        <div 
          onClick={() => onNavigate('/hr/exit-clearance')}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #ec4899' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>🚪 Exits in Progress</span>
            <span style={{ fontSize: '11px', color: '#ec4899', fontWeight: '700', background: 'rgba(236, 72, 153, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              3 Pending
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>{exitsCount}</h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>3 awaiting HR</div>
        </div>

        {/* Onboarding */}
        <div 
          onClick={() => onNavigate('/hr/register-staff')}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #06b6d4' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>📝 Onboarding</span>
            <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '700', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              Aug 2026
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>9</h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>This month</div>
        </div>

      </div>


      {/* ── 3. ATTENDANCE OVERVIEW & HR ACTION CENTER ── */}
      <div className="hr-grid-2col">
        
        {/* SECTION 3: Attendance Overview */}
        <div className="hr-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Attendance Overview
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Real-time workforce check-in status</span>
            </div>
            
            {/* Prominent Attendance Badge */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Today's Rate:</span>
              <strong style={{ fontSize: '15px', color: '#047857', fontWeight: '800' }}>93.1%</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Attendance Chart wrapped in ResponsiveChartWrapper */}
            <div style={{ minWidth: 0, width: '100%' }}>
              <ResponsiveChartWrapper minHeight={240}>
                <BarChart data={attendanceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '12px' }}
                    formatter={(val) => [`${val} staff`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {attendanceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChartWrapper>
            </div>

            {/* Attendance Exceptions List */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Attendance Exceptions</span>
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  25 total
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attendanceExceptions.map((exc, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingBottom: '6px', borderBottom: idx < attendanceExceptions.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{exc.type}</span>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{exc.detail}</div>
                    </div>
                    <strong style={{ color: exc.severity === 'danger' ? '#ef4444' : exc.severity === 'warning' ? '#f59e0b' : '#0ea5e9', fontSize: '13px' }}>
                      {exc.count}
                    </strong>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onNavigate('/hr/attendance-requests')}
                style={{ 
                  marginTop: '4px', width: '100%', padding: '6px', background: '#ffffff', 
                  border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', 
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '4px' 
                }}
              >
                Review Exceptions <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: HR Action Center */}
        <div className="hr-action-center">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#ef4444', color: '#ffffff', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={16} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#991b1b', margin: 0 }}>
                  HR Action Center
                </h3>
              </div>
              <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '12px' }}>
                ⚠ Action Required
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {actionItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: item.priority === 'high' ? 'rgba(254, 242, 242, 0.7)' : 'rgba(248, 250, 252, 0.8)',
                    borderLeft: `4px solid ${item.priority === 'high' ? '#ef4444' : item.type === 'Onboarding' ? '#0ea5e9' : '#06b6d4'}`,
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{item.title}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{item.subtitle}</span>
                  </div>
                  
                  <button 
                    onClick={() => onNavigate(item.path)}
                    style={{
                      background: item.priority === 'high' ? '#ef4444' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    [{item.actionText}]
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '11px', color: '#64748b', textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
            ⚡ High-priority items trigger automated SLA countdowns
          </div>
        </div>

      </div>


      {/* ── 4. DEPARTMENT WORKFORCE & PAYROLL SUMMARY ── */}
      <div className="hr-grid-2col-equal">
        
        {/* SECTION 4: Department Workforce */}
        <div className="hr-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Department Workforce
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Click a department to open filtered staff directory</span>
            </div>
            <button 
              onClick={() => onNavigate('/hr/employees')}
              style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              View Directory →
            </button>
          </div>

          {/* Department Horizontal Bar Chart with ResponsiveChartWrapper */}
          <div style={{ minWidth: 0, width: '100%' }}>
            <ResponsiveChartWrapper minHeight={220}>
              <BarChart layout="vertical" data={departmentWorkforce} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '12px' }}
                  formatter={(val) => [`${val} staff`, 'Workforce']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {departmentWorkforce.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" onClick={() => onNavigate(`/hr/employees?dept=${entry.name}`)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveChartWrapper>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            {departmentWorkforce.map((dept) => (
              <div 
                key={dept.name}
                onClick={() => onNavigate(`/hr/employees?dept=${dept.name}`)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                  <span style={{ color: '#1e293b' }}>{dept.name}</span>
                  <span style={{ color: '#64748b' }}><strong>{dept.count}</strong> staff ({dept.percentage}%)</span>
                </div>
                
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${dept.percentage * 2.5}%`, 
                      height: '100%', 
                      background: dept.color, 
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: Payroll Summary */}
        <div className="hr-card" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Payroll Summary
              </h3>
              <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                January / August
              </span>
            </div>

            {/* Financial Numbers */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Gross Payroll</span>
                <strong>₹52.4 L</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>Leave Deductions</span>
                <span>-₹1.8 L</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                <span>Other Deductions</span>
                <span>-₹2.0 L</span>
              </div>
              <div style={{ height: '1px', background: '#cbd5e1', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: '#10b981' }}>
                <span>Net Payable</span>
                <span>₹48.6 L</span>
              </div>
            </div>

            {/* Counters & Progress */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', fontSize: '11px' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.06)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.15)' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Slips Generated</span>
                <strong style={{ fontSize: '14px', color: '#0ea5e9' }}>235 / 248</strong>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Salaries Disbursed</span>
                <strong style={{ fontSize: '14px', color: '#10b981' }}>228 / 248</strong>
              </div>
            </div>

            {/* 6-Month Trend Chart */}
            <div style={{ marginTop: '14px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>
                6-Month Payroll Outlay Trend
              </span>
              <div style={{ minWidth: 0, width: '100%', marginTop: '6px' }}>
                <ResponsiveChartWrapper minHeight={140}>
                  <AreaChart data={payrollTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val) => [`₹${val} L`, 'Net Payable']} />
                    <Area type="monotone" dataKey="net" stroke="#10b981" fillOpacity={1} fill="url(#payrollGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveChartWrapper>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button 
              onClick={() => onNavigate('/hr/payroll')}
              style={{ flex: 1, padding: '9px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              [ Prepare Payroll ]
            </button>
            <button 
              onClick={() => onNavigate('/hr/payroll')}
              style={{ flex: 1, padding: '9px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              [ View Payroll ]
            </button>
          </div>
        </div>

      </div>


      {/* ── 5. EXIT CLEARANCE TRACKER ── */}
      <div className="hr-grid-1col">

        {/* SECTION 9: Exit Clearance Tracker */}
        <div className="hr-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Exit Clearance Tracker
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Click any record to open Exit Clearance Form Modal</span>
            </div>
            
            <button 
              onClick={() => onNavigate('/hr/exit-clearance')}
              style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Full Tracker →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {exitTrackerData.map((item) => (
              <div 
                key={item.empId}
                onClick={() => onOpenExitModal ? onOpenExitModal(item) : onNavigate('/hr/exit-clearance')}
                style={{ 
                  background: '#f8fafc', 
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{item.empId}</strong> &nbsp;
                    <span style={{ fontWeight: '600', color: '#334155' }}>{item.name}</span>
                  </div>
                  <span style={{ 
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800',
                    background: item.status === 'Cleared' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                    color: item.status === 'Cleared' ? '#10b981' : '#0ea5e9'
                  }}>
                    {item.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, height: '8px', background: '#cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.progress}%`, height: '100%', background: item.progress === 100 ? '#10b981' : '#0ea5e9', borderRadius: '4px' }} />
                  </div>
                  <strong style={{ fontSize: '11px', color: '#0f172a', minWidth: '32px', textAlign: 'right' }}>{item.progress}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>


      {/* ── 6. LEAVE ANALYTICS & RECENT HR ACTIVITY ── */}
      <div className="hr-grid-2col-equal">
        
        {/* SECTION 7: Leave Analytics */}
        <div className="hr-card">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Leave Analytics
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Application status & leave category breakdown</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Donut Chart wrapped in ResponsiveChartWrapper */}
            <div style={{ minWidth: 0, width: '100%' }}>
              <ResponsiveChartWrapper minHeight={200}>
                <PieChart>
                  <Pie data={leaveStatusData} dataKey="value" innerRadius={45} outerRadius={68} paddingAngle={4}>
                    {leaveStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveChartWrapper>
            </div>

            {/* Leave Type Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Leave Types</span>
              {leaveTypesData.map((lt) => (
                <div key={lt.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: lt.color }} />
                    <span style={{ color: '#334155' }}>{lt.type}</span>
                  </div>
                  <strong style={{ color: '#0f172a' }}>{lt.percentage}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 10: Recent HR Activity */}
        <div className="hr-card">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Recent HR Activity
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Audit log timeline of recent HR events</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            {recentActivities.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', minWidth: '40px' }}>{act.time}</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.badgeColor, marginTop: '5px', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  {act.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>


      {/* ── 7. UPCOMING EVENTS (SECTION 11) ── */}
      <div className="hr-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Upcoming Events & Milestones
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Birthdays, work anniversaries, probation end dates, and exit schedules</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'birthday', 'anniversary', 'probation'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveEventTab(tab)}
                style={{
                  background: activeEventTab === tab ? '#0f172a' : '#f1f5f9',
                  color: activeEventTab === tab ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {upcomingEvents
            .filter(ev => activeEventTab === 'all' || ev.type === activeEventTab)
            .map((ev, index) => {
              const IconComp = ev.icon;
              return (
                <div 
                  key={index}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0ea5e9' }}>{ev.tag}</span>
                    <IconComp size={16} style={{ color: '#64748b' }} />
                  </div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{ev.emp}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ev.title}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>📅 {ev.date}</span>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
