'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, UserPlus, Clock, ClipboardList, FileText, CreditCard, AlertTriangle, 
  CheckCircle, XCircle, Search, Calendar, ChevronRight, TrendingUp, TrendingDown,
  ArrowUpRight, AlertCircle, ShieldAlert, DollarSign, Layers, ChevronDown, Check, ExternalLink, RefreshCw,
  Briefcase, UserCheck, CheckCheck, Sparkles, Building2, UserX
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, 
  AreaChart, Area, ResponsiveContainer
} from 'recharts';
import ResponsiveChartWrapper from '../../../shared/components/ResponsiveChartWrapper';
import { backendFetch } from '@/lib/backendFetch';
import { employeesService } from '../../../services/hr/employeesService';

// Curated harmonious color palette for departments
const DEPT_COLORS = [
  '#0ea5e9', // Sky blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16'  // Lime
];

// Helper to format currency
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  if (num === 0) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};

// Generate list of 6 recent months ending at current date
const generateRecentMonths = (count = 6) => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  }
  return months;
};

export default function HRDashboardView({ 
  onNavigate, 
  onOpenExitModal, 
  employees = [], 
  leaves = [], 
  expenses = [],
  exitClearances = [],
  shifts = [],
  auditLogs = [],
  filters = {},
  activeDates = {},
  hideHeader = false
}) {
  const recentMonthOptions = useMemo(() => generateRecentMonths(6), []);
  const [selectedMonth, setSelectedMonth] = useState(
    filters?.salaryMonth || recentMonthOptions[0] || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [dashboardMetrics, setDashboardMetrics] = useState(null);

  // Live telemetry state fetched directly from backend
  const [liveData, setLiveData] = useState({
    attendanceSummary: null,
    attendanceRequests: [],
    payrollOverview: [],
    recruitmentRequests: [],
    drafts: [],
    liveExpenses: [],
    liveLeaves: [],
    liveEmployees: [],
    liveAuditLogs: []
  });

  useEffect(() => {
    if (filters?.salaryMonth) {
      setSelectedMonth(filters.salaryMonth);
    }
  }, [filters?.salaryMonth]);

  // Parse month and year from selectedMonth
  const { selectedMonthIndex, selectedYear } = useMemo(() => {
    const parts = (selectedMonth || '').split(' ');
    const monthName = parts[0] || '';
    const yearNum = parseInt(parts[1] || String(new Date().getFullYear()), 10);
    const dateObj = new Date(`${monthName} 1, ${yearNum}`);
    const monthIdx = isNaN(dateObj.getMonth()) ? (new Date().getMonth() + 1) : (dateObj.getMonth() + 1);
    return { selectedMonthIndex: monthIdx, selectedYear: yearNum || new Date().getFullYear() };
  }, [selectedMonth]);

  // Safe fetch helper that catches permission/network errors gracefully
  const safeFetch = async (fetcher, fallback = null) => {
    try {
      const res = await fetcher();
      return res;
    } catch {
      return fallback;
    }
  };

  // Fetch live dashboard telemetry
  const fetchLiveTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        dashRes,
        empRes,
        attSummaryRes,
        attReqsRes,
        leavesRes,
        payrollRes,
        recruitmentRes,
        draftsRes,
        expensesRes
      ] = await Promise.allSettled([
        safeFetch(() => employeesService.getDashboardMetrics({ month: selectedMonthIndex, year: selectedYear }), null),
        safeFetch(() => backendFetch('/api/backend/hr/employees?page=1&limit=200'), []),
        safeFetch(() => backendFetch('/api/backend/attendance/summary'), null),
        safeFetch(() => backendFetch('/api/backend/attendance-requests/pending'), []),
        safeFetch(() => backendFetch('/api/backend/leaves'), []),
        safeFetch(() => backendFetch(`/api/backend/hr/employees/payroll-overview?month=${selectedMonthIndex}&year=${selectedYear}`), []),
        safeFetch(async () => {
          try {
            return await backendFetch('/api/backend/hr/recruitment-requests/my-requests');
          } catch {
            return [];
          }
        }, []),
        safeFetch(() => backendFetch('/api/backend/hr/employees/drafts'), []),
        safeFetch(() => backendFetch('/api/backend/expenses/pending'), [])
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboardMetrics(dashRes.value);
      }

      const parsedEmployees = empRes.status === 'fulfilled' && empRes.value
        ? (Array.isArray(empRes.value) ? empRes.value : (empRes.value?.items || empRes.value?.data || []))
        : [];

      const parsedLeaves = leavesRes.status === 'fulfilled' && leavesRes.value
        ? (Array.isArray(leavesRes.value) ? leavesRes.value : (leavesRes.value?.items || leavesRes.value?.data || []))
        : [];

      const parsedPayroll = payrollRes.status === 'fulfilled' && payrollRes.value
        ? (Array.isArray(payrollRes.value) ? payrollRes.value : (payrollRes.value?.items || payrollRes.value?.data || []))
        : [];

      const parsedRecruitment = recruitmentRes.status === 'fulfilled' && recruitmentRes.value
        ? (Array.isArray(recruitmentRes.value) ? recruitmentRes.value : (recruitmentRes.value?.items || recruitmentRes.value?.data || []))
        : [];

      const parsedDrafts = draftsRes.status === 'fulfilled' && draftsRes.value
        ? (Array.isArray(draftsRes.value) ? draftsRes.value : (draftsRes.value?.items || draftsRes.value?.data || []))
        : [];

      const parsedExpenses = expensesRes.status === 'fulfilled' && expensesRes.value
        ? (Array.isArray(expensesRes.value) ? expensesRes.value : (expensesRes.value?.items || expensesRes.value?.data || []))
        : [];

      setLiveData({
        liveEmployees: parsedEmployees,
        attendanceSummary: attSummaryRes.status === 'fulfilled' ? attSummaryRes.value : null,
        attendanceRequests: attReqsRes.status === 'fulfilled' && Array.isArray(attReqsRes.value) ? attReqsRes.value : [],
        liveLeaves: parsedLeaves,
        payrollOverview: parsedPayroll,
        recruitmentRequests: parsedRecruitment,
        drafts: parsedDrafts,
        liveExpenses: parsedExpenses,
        liveAuditLogs: []
      });
    } catch (err) {
      console.warn('Dashboard telemetry fetch notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedMonthIndex, selectedYear]);

  useEffect(() => {
    fetchLiveTelemetry();
  }, [fetchLiveTelemetry]);

  // Master merged datasets - prioritize live database records
  const allEmployees = useMemo(() => {
    if (liveData.liveEmployees.length > 0) return liveData.liveEmployees;
    if (Array.isArray(employees) && employees.length > 0) return employees;
    return [];
  }, [employees, liveData.liveEmployees]);

  const allLeaves = useMemo(() => {
    if (liveData.liveLeaves.length > 0) return liveData.liveLeaves;
    if (Array.isArray(leaves) && leaves.length > 0) return leaves;
    return [];
  }, [leaves, liveData.liveLeaves]);

  const allExpenses = useMemo(() => {
    if (liveData.liveExpenses.length > 0) return liveData.liveExpenses;
    if (Array.isArray(expenses) && expenses.length > 0) return expenses;
    return [];
  }, [expenses, liveData.liveExpenses]);

  const allExitClearances = useMemo(() => {
    if (dashboardMetrics?.exits?.list && dashboardMetrics.exits.list.length > 0) {
      return dashboardMetrics.exits.list;
    }
    return Array.isArray(exitClearances) ? exitClearances : [];
  }, [dashboardMetrics, exitClearances]);

  const allAuditLogs = useMemo(() => {
    if (Array.isArray(auditLogs) && auditLogs.length > 0) return auditLogs;
    if (liveData.liveAuditLogs.length > 0) return liveData.liveAuditLogs;
    return [];
  }, [auditLogs, liveData.liveAuditLogs]);

  const allAttendanceRequests = useMemo(() => {
    return Array.isArray(liveData.attendanceRequests) ? liveData.attendanceRequests : [];
  }, [liveData.attendanceRequests]);

  // Filter staff by search query
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allEmployees;
    return allEmployees.filter(e => {
      const name = String(e.name || e.fullName || `${e.firstName || ''} ${e.lastName || ''}`).toLowerCase();
      const code = String(e.id || e.employeeCode || '').toLowerCase();
      const dept = String(typeof e.department === 'object' ? (e.department?.name || '') : (e.department || '')).toLowerCase();
      return name.includes(q) || code.includes(q) || dept.includes(q);
    });
  }, [allEmployees, searchQuery]);

  // ── 1. DYNAMIC KPI CALCULATIONS ──
  const totalStaffCount = dashboardMetrics?.workforce?.totalStaff ?? allEmployees.length;
  const activeStaffCount = dashboardMetrics?.workforce?.activeStaff ?? (
    allEmployees.filter(e => {
      const st = String(e.status || e.employmentStatus || '').toUpperCase();
      return e.isActive !== false && e.active !== false && st !== 'INACTIVE' && st !== 'TERMINATED' && st !== 'RESIGNED' && st !== 'RETIRED';
    }).length
  );

  // New joinees this month
  const newJoineesThisMonth = useMemo(() => {
    if (dashboardMetrics?.workforce?.newJoinees) return dashboardMetrics.workforce.newJoinees;
    return allEmployees.filter(e => {
      const dateStr = e.joiningDate || e.dateOfJoining || e.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && (d.getMonth() + 1) === selectedMonthIndex && d.getFullYear() === selectedYear;
    });
  }, [dashboardMetrics, allEmployees, selectedMonthIndex, selectedYear]);

  // Attendance metrics
  const { presentCount, lateCount, absentCount, attendanceRate, wfhCount } = useMemo(() => {
    if (dashboardMetrics?.attendance?.today) {
      const t = dashboardMetrics.attendance.today;
      return {
        presentCount: Number(t.present || 0),
        lateCount: Number(t.late || 0),
        absentCount: Number(t.absent || 0),
        attendanceRate: Number(t.attendanceRate || 0).toFixed(1),
        wfhCount: Number(t.halfDay || 0)
      };
    }
    if (liveData.attendanceSummary) {
      const s = liveData.attendanceSummary;
      const pres = Number(s.presentToday ?? s.presentCount ?? s.present ?? s.currentlyPunchedIn ?? 0);
      const late = Number(s.lateCount ?? s.late ?? 0);
      const abs = Number(s.absentCount ?? s.absent ?? 0);
      const wfh = Number(s.wfhCount ?? s.halfDayCount ?? s.wfh ?? 0);
      const rate = totalStaffCount > 0 
        ? ((pres / Math.max(1, totalStaffCount)) * 100).toFixed(1) 
        : (s.attendancePercentage !== undefined ? Number(s.attendancePercentage).toFixed(1) : (pres > 0 ? '100.0' : '0.0'));
      return { presentCount: pres, lateCount: late, absentCount: abs, attendanceRate: rate, wfhCount: wfh };
    }
    return { presentCount: 0, lateCount: 0, absentCount: 0, attendanceRate: '0.0', wfhCount: 0 };
  }, [dashboardMetrics, liveData.attendanceSummary, totalStaffCount]);

  // Pending Leaves count
  const pendingLeavesList = useMemo(() => {
    return allLeaves.filter(l => {
      const st = String(l?.status || '').toUpperCase();
      return st === 'PENDING' || st === 'PH PENDING' || st === 'PH_PENDING' || st === 'PENDING_HR' || st === 'APPLIED';
    });
  }, [allLeaves]);
  const pendingLeavesCount = dashboardMetrics?.leaves?.pendingCount ?? pendingLeavesList.length;

  // Pending Expenses count
  const pendingExpensesList = useMemo(() => {
    return allExpenses.filter(ex => {
      const st = String(ex?.status || '').toUpperCase();
      return st === 'PENDING' || st === 'PENDING_HR' || st === 'PENDING_SUPER_ADMIN';
    });
  }, [allExpenses]);
  const pendingExpensesCount = dashboardMetrics?.expenses?.pendingCount ?? pendingExpensesList.length;

  // Exit Clearances & Inactive / Notice Staff
  const activeExitsList = useMemo(() => {
    if (dashboardMetrics?.exits?.list && dashboardMetrics.exits.list.length > 0) {
      return dashboardMetrics.exits.list;
    }
    const fromClearances = allExitClearances.filter(ex => {
      const st = String(ex.status || '').toUpperCase();
      return st !== 'CLEARED' && st !== 'COMPLETED';
    });
    const fromEmployees = allEmployees.filter(e => {
      const st = String(e.status || e.employmentStatus || '').toUpperCase();
      return st === 'INACTIVE' || st === 'RESIGNED' || st === 'TERMINATED' || st === 'NOTICE_PERIOD';
    });
    return fromClearances.length > 0 ? fromClearances : fromEmployees;
  }, [dashboardMetrics, allExitClearances, allEmployees]);
  const exitsCount = dashboardMetrics?.exits?.pendingCount ?? activeExitsList.filter(e => e.status !== 'Cleared').length;
  const pendingHrExitsCount = useMemo(() => {
    if (dashboardMetrics?.exits?.pendingCount !== undefined) {
      return dashboardMetrics.exits.pendingCount;
    }
    return activeExitsList.filter(ex => (ex.status === 'In Progress' || ex.status === 'PENDING') && ex.status !== 'Cleared').length;
  }, [dashboardMetrics, activeExitsList]);

  // Onboarding count (Drafts + Pending Recruitment + New Joinees)
  const onboardingCount = useMemo(() => {
    if (dashboardMetrics?.onboarding?.totalCount !== undefined) {
      return dashboardMetrics.onboarding.totalCount;
    }
    const draftsCount = Array.isArray(liveData.drafts) ? liveData.drafts.length : 0;
    const pendingRecruit = (Array.isArray(liveData.recruitmentRequests) ? liveData.recruitmentRequests : []).filter(r => {
      const st = String(r.status || '').toUpperCase();
      return st === 'OPEN' || st === 'PENDING' || st === 'IN_PROGRESS' || st === 'HR_PROCESSING';
    }).length;
    return draftsCount + pendingRecruit + newJoineesThisMonth.length;
  }, [dashboardMetrics, liveData.drafts, liveData.recruitmentRequests, newJoineesThisMonth]);

  // ── 2. ATTENDANCE BREAKDOWN & EXCEPTIONS DATA ──
  const attendanceBreakdown = useMemo(() => {
    if (dashboardMetrics?.attendance?.breakdown && dashboardMetrics.attendance.breakdown.length > 0) {
      return dashboardMetrics.attendance.breakdown;
    }
    return [
      { name: 'Present', count: presentCount, color: '#10b981' },
      { name: 'Late', count: lateCount, color: '#f59e0b' },
      { name: 'Absent', count: absentCount, color: '#ef4444' },
      { name: 'On Leave', count: pendingLeavesCount, color: '#8b5cf6' },
      { name: 'Half Day', count: wfhCount, color: '#0ea5e9' }
    ];
  }, [dashboardMetrics, presentCount, lateCount, absentCount, pendingLeavesCount, wfhCount]);

  const pendingAttendanceReqsCount = useMemo(() => {
    return allAttendanceRequests.filter(r => {
      const st = String(r.status || '').toUpperCase();
      return st === 'PENDING' || st === 'REQUESTED';
    }).length;
  }, [allAttendanceRequests]);

  const attendanceExceptions = useMemo(() => {
    if (dashboardMetrics?.attendance?.exceptions && dashboardMetrics.attendance.exceptions.length > 0) {
      return dashboardMetrics.attendance.exceptions;
    }
    const items = [];
    if (lateCount > 0) {
      items.push({ type: 'Late Check-ins', count: lateCount, severity: 'warning', detail: 'Grace limit exceeded (+15 mins)' });
    }
    const missingPunch = liveData.attendanceSummary?.missingPunchOut ?? liveData.attendanceSummary?.missingCheckouts ?? 0;
    if (missingPunch > 0) {
      items.push({ type: 'Missing Check-outs', count: missingPunch, severity: 'danger', detail: 'Punches unverified from previous days' });
    }
    const ot = liveData.attendanceSummary?.overtimeCount || 0;
    if (ot > 0) {
      items.push({ type: 'Overtime', count: ot, severity: 'info', detail: 'Extended shift hours recorded' });
    }
    if (pendingAttendanceReqsCount > 0) {
      items.push({ type: 'Correction Requests', count: pendingAttendanceReqsCount, severity: 'danger', detail: 'Manual punch & regularizations' });
    }
    return items;
  }, [dashboardMetrics, lateCount, liveData.attendanceSummary, pendingAttendanceReqsCount]);

  // ── 3. DYNAMIC DEPARTMENT WORKFORCE ──
  const departmentWorkforce = useMemo(() => {
    if (dashboardMetrics?.workforce?.departments && dashboardMetrics.workforce.departments.length > 0) {
      return dashboardMetrics.workforce.departments;
    }
    if (allEmployees.length === 0) return [];
    
    const deptCountMap = {};
    allEmployees.forEach(emp => {
      const rawDept = typeof emp.department === 'object' ? (emp.department?.name || 'Operations') : (emp.department || 'Operations');
      let deptName = (rawDept || 'Operations').trim() || 'General';
      const lower = deptName.toLowerCase();
      if (lower === 'sales' || lower === 'sales department') deptName = 'Sales Department';
      else if (lower === 'production' || lower === 'production department') deptName = 'Production Department';
      else if (lower === 'hr' || lower === 'hr department' || lower === 'human resources') deptName = 'HR Department';
      else if (lower === 'super admin' || lower === 'super admin department') deptName = 'Super Admin Department';
      else if (lower === 'dispatch' || lower === 'dispatch department') deptName = 'Dispatch Department';
      else if (lower === 'finance' || lower === 'finance department') deptName = 'Finance Department';
      else if (lower === 'store' || lower === 'store department') deptName = 'Store Department';
      else if (lower === 'data analytics') deptName = 'Data Analytics';

      deptCountMap[deptName] = (deptCountMap[deptName] || 0) + 1;
    });

    const total = Math.max(1, allEmployees.length);
    return Object.entries(deptCountMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        name,
        count,
        percentage: Number(((count / total) * 100).toFixed(1)),
        color: DEPT_COLORS[idx % DEPT_COLORS.length]
      }));
  }, [dashboardMetrics, allEmployees]);

  // ── 4. DYNAMIC HR ACTION ITEMS ──
  const actionItems = useMemo(() => {
    if (dashboardMetrics?.actionItems && dashboardMetrics.actionItems.length > 0) {
      return dashboardMetrics.actionItems;
    }
    const list = [];
    if (pendingLeavesCount > 0) {
      list.push({
        id: 'act-leaves',
        title: `${pendingLeavesCount} Leave Request${pendingLeavesCount > 1 ? 's' : ''}`,
        subtitle: `${pendingLeavesCount} require immediate HR approval`,
        priority: 'high',
        type: 'Leave',
        actionText: 'Review',
        path: '/hr/leave-approvals'
      });
    }
    if (exitsCount > 0) {
      list.push({
        id: 'act-exits',
        title: `${exitsCount} Exit Clearance${exitsCount > 1 ? 's' : ''}`,
        subtitle: `${pendingHrExitsCount > 0 ? pendingHrExitsCount : exitsCount} awaiting HR sign-off`,
        priority: 'high',
        type: 'Exit',
        actionText: 'Open',
        path: '/hr/exit-clearance'
      });
    }
    if (onboardingCount > 0) {
      list.push({
        id: 'act-onboarding',
        title: `${onboardingCount} Employee Onboarding${onboardingCount > 1 ? 's' : ''}`,
        subtitle: 'Documentation & profile creation',
        priority: 'medium',
        type: 'Onboarding',
        actionText: 'Review',
        path: '/hr/register-staff'
      });
    }
    if (pendingAttendanceReqsCount > 0) {
      list.push({
        id: 'act-attendance',
        title: `${pendingAttendanceReqsCount} Attendance Correction${pendingAttendanceReqsCount > 1 ? 's' : ''}`,
        subtitle: 'Manual shift punch & regularization requests',
        priority: 'high',
        type: 'Attendance',
        actionText: 'Review',
        path: '/hr/attendance-requests'
      });
    }
    if (pendingExpensesCount > 0) {
      list.push({
        id: 'act-expenses',
        title: `${pendingExpensesCount} Pending Expense Claim${pendingExpensesCount > 1 ? 's' : ''}`,
        subtitle: 'Travel & local reimbursement approvals',
        priority: 'medium',
        type: 'Expense',
        actionText: 'Review',
        path: '/hr/expense-management'
      });
    }
    return list;
  }, [dashboardMetrics, pendingLeavesCount, exitsCount, pendingHrExitsCount, onboardingCount, pendingAttendanceReqsCount, pendingExpensesCount]);

  // ── 5. DYNAMIC PAYROLL SUMMARY DATA ──
  const { grossTotal, leaveDeductionsTotal, otherDeductionsTotal, netPayableTotal, slipsGeneratedCount, salariesDisbursedCount, payrollReadyPercentage } = useMemo(() => {
    if (dashboardMetrics?.payroll) {
      const p = dashboardMetrics.payroll;
      return {
        grossTotal: Number(p.grossTotal || 0),
        leaveDeductionsTotal: Number(p.leaveDeductionsTotal || 0),
        otherDeductionsTotal: Number(p.otherDeductionsTotal || 0),
        netPayableTotal: Number(p.netPayableTotal || 0),
        slipsGeneratedCount: Number(p.slipsGeneratedCount || 0),
        salariesDisbursedCount: Number(p.salariesDisbursedCount || 0),
        payrollReadyPercentage: Number(p.payrollReadyPercentage || 0)
      };
    }
    const overviewList = liveData.payrollOverview;
    if (overviewList.length > 0) {
      let gross = 0;
      let leaveDeds = 0;
      let otherDeds = 0;
      let net = 0;
      let slips = 0;
      let disbursed = 0;

      overviewList.forEach(p => {
        const pr = p.payroll || p;
        const g = Number(pr.grossEarnings || pr.grossSalary || pr.baseSalary || pr.salary || 0);
        const l = Number(pr.leaveDeductions || pr.lopDeductions || pr.leaveDeduction || 0);
        const o = Number(pr.totalDeductions || pr.otherDeductions || 0) - l;
        const n = Number(pr.netPayable || (g - (l + Math.max(0, o))) || 0);
        
        gross += g;
        leaveDeds += l;
        otherDeds += Math.max(0, o);
        net += n;

        const st = String(pr.status || p.status || '').toUpperCase();
        if (st && st !== 'DRAFT' && st !== 'NONE') slips++;
        if (st === 'PAID' || st === 'DISBURSED' || st === 'SETTLED') disbursed++;
      });

      const readyPct = totalStaffCount > 0 ? Math.min(100, Math.round((slips / totalStaffCount) * 100)) : (gross > 0 ? 100 : 0);
      return {
        grossTotal: gross,
        leaveDeductionsTotal: leaveDeds,
        otherDeductionsTotal: otherDeds,
        netPayableTotal: net > 0 ? net : (gross - (leaveDeds + otherDeds)),
        slipsGeneratedCount: slips,
        salariesDisbursedCount: disbursed,
        payrollReadyPercentage: readyPct
      };
    }

    let fallbackGross = 0;
    allEmployees.forEach(e => {
      const sal = Number(e.salary || e.basicSalary || e.baseSalary || e.payroll?.grossEarnings || 0);
      fallbackGross += sal;
    });
    return {
      grossTotal: fallbackGross,
      leaveDeductionsTotal: 0,
      otherDeductionsTotal: 0,
      netPayableTotal: fallbackGross,
      slipsGeneratedCount: 0,
      salariesDisbursedCount: 0,
      payrollReadyPercentage: 0
    };
  }, [dashboardMetrics, liveData.payrollOverview, allEmployees, totalStaffCount]);

  // 6-Month Payroll Outlay Trend Data
  const payrollTrendData = useMemo(() => {
    if (dashboardMetrics?.payroll?.outlayTrend && dashboardMetrics.payroll.outlayTrend.length > 0) {
      return dashboardMetrics.payroll.outlayTrend;
    }
    const months = generateRecentMonths(6).reverse();
    return months.map((m, idx) => {
      const monthAbbr = m.split(' ')[0].substring(0, 3);
      const isCurrentMonth = idx === months.length - 1;
      return {
        month: monthAbbr,
        gross: isCurrentMonth && grossTotal > 0 ? Number((grossTotal / 100000).toFixed(1)) : 0,
        net: isCurrentMonth && netPayableTotal > 0 ? Number((netPayableTotal / 100000).toFixed(1)) : 0
      };
    });
  }, [dashboardMetrics, netPayableTotal, grossTotal]);

  // ── 6. DYNAMIC LEAVE ANALYTICS ──
  const leaveStatusData = useMemo(() => {
    if (dashboardMetrics?.leaves?.statusBreakdown && dashboardMetrics.leaves.statusBreakdown.length > 0) {
      return dashboardMetrics.leaves.statusBreakdown;
    }
    if (allLeaves.length === 0) {
      return [
        { name: 'Approved', value: 0, color: '#10b981' },
        { name: 'Pending', value: 0, color: '#f59e0b' },
        { name: 'Rejected', value: 0, color: '#ef4444' }
      ];
    }
    const approved = allLeaves.filter(l => String(l.status || '').toUpperCase() === 'APPROVED').length;
    const pending = pendingLeavesCount;
    const rejected = allLeaves.filter(l => String(l.status || '').toUpperCase() === 'REJECTED').length;
    const phPending = allLeaves.filter(l => String(l.status || '').toUpperCase().includes('PH')).length;

    const data = [
      { name: 'Approved', value: approved, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Rejected', value: rejected, color: '#ef4444' }
    ];
    if (phPending > 0) {
      data.push({ name: 'PH Pending', value: phPending, color: '#8b5cf6' });
    }
    return data;
  }, [dashboardMetrics, allLeaves, pendingLeavesCount]);

  const leaveTypesData = useMemo(() => {
    if (dashboardMetrics?.leaves?.typesBreakdown && dashboardMetrics.leaves.typesBreakdown.length > 0) {
      return dashboardMetrics.leaves.typesBreakdown;
    }
    if (allLeaves.length === 0) return [];
    const typeCountMap = {};
    allLeaves.forEach(l => {
      const rawType = l.leaveType || l.type || l.reason || 'General Leave';
      const cleanType = String(rawType).trim();
      typeCountMap[cleanType] = (typeCountMap[cleanType] || 0) + 1;
    });

    const total = Math.max(1, allLeaves.length);
    const colors = ['#0ea5e9', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
    return Object.entries(typeCountMap).map(([type, count], i) => ({
      type,
      count,
      percentage: Number(((count / total) * 100).toFixed(0)),
      color: colors[i % colors.length]
    }));
  }, [dashboardMetrics, allLeaves]);

  // ── 7. DYNAMIC RECENT HR ACTIVITY LOG ──
  const recentActivities = useMemo(() => {
    if (dashboardMetrics?.recentActivities && dashboardMetrics.recentActivities.length > 0) {
      return dashboardMetrics.recentActivities;
    }
    if (allAuditLogs.length > 0) {
      return allAuditLogs.slice(0, 5).map(log => {
        const d = log.createdAt ? new Date(log.createdAt) : new Date();
        const timeStr = !isNaN(d.getTime()) 
          ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) 
          : 'Recent';
        
        let category = 'HR';
        let badgeColor = '#0ea5e9';
        const actionStr = String(log.action || '').toUpperCase();
        if (actionStr.includes('LEAVE')) { category = 'Leave'; badgeColor = '#10b981'; }
        else if (actionStr.includes('PAYROLL') || actionStr.includes('SALARY')) { category = 'Payroll'; badgeColor = '#8b5cf6'; }
        else if (actionStr.includes('EMPLOYEE') || actionStr.includes('ONBOARD')) { category = 'Onboarding'; badgeColor = '#0ea5e9'; }
        else if (actionStr.includes('EXIT') || actionStr.includes('RESIGN')) { category = 'Exit'; badgeColor = '#f59e0b'; }
        else if (actionStr.includes('ATTENDANCE') || actionStr.includes('PUNCH')) { category = 'Attendance'; badgeColor = '#06b6d4'; }

        return {
          time: timeStr,
          text: log.remarks || `${(log.action || 'HR action').replace(/_/g, ' ')} by ${log.actorUserId || log.user || 'HR Staff'}`,
          category,
          badgeColor
        };
      });
    }

    // Dynamic events generated from active data
    const dynamicEvents = [];
    if (pendingLeavesList.length > 0) {
      dynamicEvents.push({
        time: 'Today',
        text: `${pendingLeavesList.length} leave application${pendingLeavesList.length > 1 ? 's' : ''} awaiting HR review`,
        category: 'Leave',
        badgeColor: '#10b981'
      });
    }
    if (slipsGeneratedCount > 0) {
      dynamicEvents.push({
        time: 'Today',
        text: `${slipsGeneratedCount} salary slips processed for ${selectedMonth}`,
        category: 'Payroll',
        badgeColor: '#8b5cf6'
      });
    }
    if (allEmployees.length > 0) {
      const latestEmp = allEmployees[0];
      const name = latestEmp.name || latestEmp.fullName || latestEmp.firstName || 'Staff';
      dynamicEvents.push({
        time: 'Recent',
        text: `Employee record verified for ${name}`,
        category: 'Onboarding',
        badgeColor: '#0ea5e9'
      });
    }
    if (exitsCount > 0) {
      dynamicEvents.push({
        time: 'Active',
        text: `${exitsCount} active resignation clearance${exitsCount > 1 ? 's' : ''} in tracking`,
        category: 'Exit',
        badgeColor: '#f59e0b'
      });
    }
    return dynamicEvents;
  }, [dashboardMetrics, allAuditLogs, pendingLeavesList, slipsGeneratedCount, selectedMonth, allEmployees, exitsCount]);

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

        @media (max-width: 768px) {
          .hr-dash-wrapper {
            padding: 16px 16px 0;
          }
        }

        @media (max-width: 480px) {
          .hr-dash-wrapper {
            padding: 14px 12px 0;
          }
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
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
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
          justify-content: space-between;
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

        .hr-grid-1col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
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
          min-width: 0;
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

        @media (max-width: 480px) {
          .hr-card,
          .hr-action-center {
            padding: 16px;
          }
          .hr-kpi-card {
            padding: 14px 16px;
          }
          .hr-quick-actions button {
            flex: 1 1 auto;
            justify-content: center;
          }
        }
      `}</style>

      {/* ── 2. KPI CARDS ── */}
      <div className="hr-kpi-grid">
        
        {/* Total Staff */}
        <div 
          onClick={() => onNavigate ? onNavigate('/hr/employees') : null}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #0ea5e9' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>👥 Total Staff</span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> {newJoineesThisMonth.length > 0 ? `+${newJoineesThisMonth.length}` : 'Active'}
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>
            {totalStaffCount}
          </h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            {activeStaffCount} Active
          </div>
        </div>

        {/* Present Today */}
        <div 
          onClick={() => onNavigate ? onNavigate('/hr/attendance') : null}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #10b981' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>🟢 Present Today</span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> {attendanceRate}%
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>
            {presentCount}
          </h2>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
            {attendanceRate}% Attendance
          </div>
        </div>

        {/* Pending Leaves */}
        <div 
          onClick={() => onNavigate ? onNavigate('/hr/leave-approvals') : null}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #f59e0b' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>🟠 Pending Leaves</span>
            <span style={{ fontSize: '11px', color: pendingLeavesCount > 0 ? '#ef4444' : '#10b981', fontWeight: '700', background: pendingLeavesCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {pendingLeavesCount > 0 ? 'Action Needed' : 'All Clear'}
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>
            {pendingLeavesCount}
          </h2>
          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>
            {pendingLeavesCount > 0 ? `${pendingLeavesCount} require HR action` : 'No pending requests'}
          </div>
        </div>

        {/* Monthly Payroll */}
        <div 
          onClick={() => onNavigate ? onNavigate('/hr/payroll') : null}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #8b5cf6' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>💰 Monthly Payroll</span>
            <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '700', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {payrollReadyPercentage}% Ready
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>
            {formatCurrency(netPayableTotal)}
          </h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            {selectedMonth}
          </div>
        </div>

        {/* Exits in Progress */}
        <div 
          onClick={() => onNavigate ? onNavigate('/hr/exit-clearance') : null}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #ec4899' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>🚪 Exits in Progress</span>
            <span style={{ fontSize: '11px', color: exitsCount > 0 ? '#ec4899' : '#10b981', fontWeight: '700', background: exitsCount > 0 ? 'rgba(236, 72, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {exitsCount > 0 ? `${exitsCount} Pending` : 'All Cleared'}
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>
            {exitsCount}
          </h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            {exitsCount > 0 ? `${pendingHrExitsCount} awaiting HR` : `${allExitClearances.length || activeExitsList.length || 0} total cleared`}
          </div>
        </div>

        {/* Onboarding */}
        <div 
          onClick={() => onNavigate ? onNavigate('/hr/register-staff') : null}
          className="hr-kpi-card"
          style={{ borderLeft: '4px solid #06b6d4' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>📝 Onboarding</span>
            <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '700', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {selectedMonth.split(' ')[0]}
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: '#0f172a' }}>
            {onboardingCount}
          </h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Active onboarding
          </div>
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
              <strong style={{ fontSize: '15px', color: '#047857', fontWeight: '800' }}>{attendanceRate}%</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Attendance Chart */}
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
                <span style={{ fontSize: '10px', color: attendanceExceptions.length > 0 ? '#ef4444' : '#10b981', fontWeight: '700', background: attendanceExceptions.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {attendanceExceptions.reduce((sum, item) => sum + item.count, 0)} total
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attendanceExceptions.length > 0 ? (
                  attendanceExceptions.map((exc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingBottom: '6px', borderBottom: idx < attendanceExceptions.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{exc.type}</span>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{exc.detail}</div>
                      </div>
                      <strong style={{ color: exc.severity === 'danger' ? '#ef4444' : exc.severity === 'warning' ? '#f59e0b' : '#0ea5e9', fontSize: '13px' }}>
                        {exc.count}
                      </strong>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: '#10b981', textAlign: 'center', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCheck size={16} /> All check-ins regular today
                  </div>
                )}
              </div>

              <button 
                onClick={() => onNavigate ? onNavigate('/hr/attendance-requests') : null}
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
                <div style={{ background: actionItems.length > 0 ? '#ef4444' : '#10b981', color: '#ffffff', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {actionItems.length > 0 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: actionItems.length > 0 ? '#991b1b' : '#065f46', margin: 0 }}>
                  HR Action Center
                </h3>
              </div>
              <span style={{ background: actionItems.length > 0 ? '#fee2e2' : '#d1fae5', color: actionItems.length > 0 ? '#991b1b' : '#065f46', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '12px' }}>
                {actionItems.length > 0 ? '⚠ Action Required' : '✓ All Cleared'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {actionItems.length > 0 ? (
                actionItems.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: item.priority === 'high' ? 'rgba(254, 242, 242, 0.7)' : 'rgba(248, 250, 252, 0.8)',
                      borderLeft: `4px solid ${item.priority === 'high' ? '#ef4444' : item.type === 'Onboarding' ? '#0ea5e9' : '#06b6d4'}`,
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{item.title}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{item.subtitle}</span>
                    </div>

                    <button
                      onClick={() => onNavigate ? onNavigate(item.path) : null}
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
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      [{item.actionText}]
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#059669', background: '#f0fdf4', borderRadius: '10px', border: '1px dashed #86efac' }}>
                  <Sparkles size={24} style={{ margin: '0 auto 8px auto', display: 'block', color: '#10b981' }} />
                  <strong style={{ fontSize: '13px', display: 'block' }}>All HR action items are cleared!</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>No pending leave, exit, or expense approvals.</span>
                </div>
              )}
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
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} style={{ color: '#0ea5e9' }} /> Department Workforce
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Click a department to open filtered staff directory</span>
            </div>
            <button 
              onClick={() => onNavigate ? onNavigate('/hr/employees') : null}
              style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              View Directory →
            </button>
          </div>

          {departmentWorkforce.length > 0 ? (
            <>
              <div style={{ minWidth: 0, width: '100%' }}>
                <ResponsiveChartWrapper minHeight={Math.max(180, departmentWorkforce.length * 34)}>
                  <BarChart layout="vertical" data={departmentWorkforce} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={135} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '12px' }}
                      formatter={(val) => [`${val} staff`, 'Workforce']}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {departmentWorkforce.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" onClick={() => onNavigate ? onNavigate(`/hr/employees?dept=${encodeURIComponent(entry.name)}`) : null} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveChartWrapper>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {departmentWorkforce.map((dept) => (
                  <div 
                    key={dept.name}
                    onClick={() => onNavigate ? onNavigate(`/hr/employees?dept=${encodeURIComponent(dept.name)}`) : null}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                      <span style={{ color: '#1e293b' }}>{dept.name}</span>
                      <span style={{ color: '#64748b' }}><strong>{dept.count}</strong> staff ({dept.percentage}%)</span>
                    </div>
                    
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, dept.percentage)}%`,
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
            </>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No department records found.
            </div>
          )}
        </div>

        {/* SECTION 6: Payroll Summary */}
        <div className="hr-card" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: '#10b981' }} /> Payroll Summary
              </h3>
              <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                {selectedMonth}
              </span>
            </div>

            {/* Financial Numbers */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Gross Payroll</span>
                <strong>{formatCurrency(grossTotal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>Leave Deductions</span>
                <span>-{formatCurrency(leaveDeductionsTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                <span>Other Deductions</span>
                <span>-{formatCurrency(otherDeductionsTotal)}</span>
              </div>
              <div style={{ height: '1px', background: '#cbd5e1', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: '#10b981' }}>
                <span>Net Payable</span>
                <span>{formatCurrency(netPayableTotal)}</span>
              </div>
            </div>

            {/* Counters & Progress */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', fontSize: '11px' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.06)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.15)' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Slips Generated</span>
                <strong style={{ fontSize: '14px', color: '#0ea5e9' }}>
                  {slipsGeneratedCount} / {totalStaffCount}
                </strong>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Salaries Disbursed</span>
                <strong style={{ fontSize: '14px', color: '#10b981' }}>
                  {salariesDisbursedCount} / {totalStaffCount}
                </strong>
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
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val) => [`₹${val} L`, 'Net Outlay']} />
                    <Area type="monotone" dataKey="net" stroke="#10b981" fillOpacity={1} fill="url(#payrollGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveChartWrapper>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button 
              onClick={() => onNavigate ? onNavigate('/hr/payroll') : null}
              style={{ flex: 1, padding: '9px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              [ Prepare Payroll ]
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('/hr/payroll') : null}
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
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserX size={18} style={{ color: '#ec4899' }} /> Exit Clearance Tracker
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Click any record to open Exit Clearance Form Modal</span>
            </div>
            
            <button 
              onClick={() => onNavigate ? onNavigate('/hr/exit-clearance') : null}
              style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Full Tracker →
            </button>
          </div>

          {allExitClearances.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allExitClearances.map((item) => {
                const clearedCount = Object.values(item.checkpoints || {}).filter(Boolean).length;
                const totalCheckpoints = Math.max(1, Object.keys(item.checkpoints || {}).length || 4);
                const progress = item.progress !== undefined ? item.progress : Math.round((clearedCount / totalCheckpoints) * 100);
                const status = item.status || (progress === 100 ? 'Cleared' : 'In Progress');

                return (
                  <div 
                    key={item.empId || item.id}
                    onClick={() => onOpenExitModal ? onOpenExitModal(item) : onNavigate ? onNavigate('/hr/exit-clearance') : null}
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
                        <strong style={{ color: '#0f172a' }}>{item.empId || item.id}</strong> &nbsp;
                        <span style={{ fontWeight: '600', color: '#334155' }}>{item.name || item.fullName || 'Staff Member'}</span>
                        {item.department && <span style={{ fontSize: '11px', color: '#64748b' }}> • {item.department}</span>}
                      </div>
                      <span style={{ 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800',
                        background: status === 'Cleared' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                        color: status === 'Cleared' ? '#10b981' : '#0ea5e9'
                      }}>
                        {status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '8px', background: '#cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : '#0ea5e9', borderRadius: '4px' }} />
                      </div>
                      <strong style={{ fontSize: '11px', color: '#0f172a', minWidth: '32px', textAlign: 'right' }}>{progress}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
              <UserX size={24} style={{ margin: '0 auto 8px auto', display: 'block', color: '#94a3b8' }} />
              <strong style={{ fontSize: '13px', display: 'block', color: '#334155' }}>No exit clearances currently in progress</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>All staff offboarding is clear and up to date.</span>
            </div>
          )}
        </div>

      </div>

      {/* ── 6. LEAVE ANALYTICS & RECENT HR ACTIVITY ── */}
      <div className="hr-grid-2col-equal">
        
        {/* SECTION 7: Leave Analytics */}
        <div className="hr-card">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} style={{ color: '#f59e0b' }} /> Leave Analytics
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Application status & leave category breakdown</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Donut Chart */}
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
              {leaveTypesData.length > 0 ? (
                leaveTypesData.map((lt) => (
                  <div key={lt.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: lt.color }} />
                      <span style={{ color: '#334155' }}>{lt.type}</span>
                    </div>
                    <strong style={{ color: '#0f172a' }}>{lt.percentage}% ({lt.count})</strong>
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b', fontSize: '12px', padding: '8px 0' }}>
                  No leave applications recorded in this period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 10: Recent HR Activity */}
        <div className="hr-card">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#6366f1' }} /> Recent HR Activity
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Audit log timeline of recent HR events</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', minWidth: '42px' }}>{act.time}</span>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.badgeColor, marginTop: '5px', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                    {act.text}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '12px', padding: '16px 0', textAlign: 'center' }}>
                No recent activity logs recorded.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
