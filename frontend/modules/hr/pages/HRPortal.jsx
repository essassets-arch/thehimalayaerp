'use client';

import { useEffect, useState } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useERP } from '../../../shared/context/ERPContext';
import MyProfileView from '../../../shared/components/MyProfileView';
import ExpenseManagementView from '../../../shared/components/ExpenseManagementView';
import LeaveApprovalView from '../../../shared/components/LeaveApprovalView';
import HRAttendanceRequestsView from '../../../shared/components/HRAttendanceRequestsView';
import { useAuth } from '../../../shared/context/AuthContext';
import { adminService } from '../../../services/admin.service';
import { apiClient } from '../../../lib/apiClient';
import { employeesService } from '../../../services/hr/employeesService';
import EmployeeRegistrationForm from '../employee/components/EmployeeRegistrationForm';
import EmployeeDetails from '../employee/components/EmployeeDetails';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { 
  Users, UserPlus, Clock, ClipboardList, FileText, PackageCheck, CreditCard, Bell, 
  Trash2, Edit3, Shield, UserX, CheckCircle, XCircle, Search, Save, Calendar, Camera, Play, Eye, Download, FileSpreadsheet
} from 'lucide-react';
import UsersManagementView from '../components/UsersManagementView';
import ExitClearanceFormModal from '../components/ExitClearanceFormModal';
import { exportToCSV, exportToExcel } from '../../../services/export.service';

export default function HRPortal() {
  const params = useParams(); const view = params?.slug?.[0];
  const { state, dispatch, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const navigate = useRouter();

  // Roster states
  const employees = state.employees || [];
  const [directoryEmployees, setDirectoryEmployees] = useState([]);
  const [directoryError, setDirectoryError] = useState('');
  useEffect(() => {
    if (view !== 'employees') return;
    const today = new Date();
    employeesService.getPayrollOverview({ month: today.getMonth() + 1, year: today.getFullYear(), search: globalSearch })
      .then((result) => {
        setDirectoryEmployees(result);
        setDirectoryError('');
      })
      .catch((error) => setDirectoryError(error.message));
  }, [view, globalSearch]);
  const leaves = state.leaves || [];
  const shifts = state.shifts || [];
  const exitClearances = state.exitClearances || [];

  // Legacy register staff form state removed — handled by EmployeeRegistrationForm component

  // Attendance simulator states
  const [selectedStaffSim, setSelectedStaffSim] = useState(employees[1]?.id || 'EMP-002');
  const [simTime, setSimTime] = useState('09:22');
  const [simDate, setSimDate] = useState('2026-06-11');
  const [simLogs, setSimLogs] = useState([
    { selfie: 'Biometric Selfie', id: 'EMP-002', name: 'Ramanathan Swamy', action: 'Check In', time: '09:22 AM', status: 'Late (+7 mins)' }
  ]);

  // Shift assignment modal/dropdown states
  const [editingShiftEmp, setEditingShiftEmp] = useState(null);
  const [newShiftVal, setNewShiftVal] = useState('General Shift');

  // Exit clearance state
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedExitRecord, setSelectedExitRecord] = useState(null);
  const [exitForm, setExitForm] = useState({ empId: 'EMP-001', effectiveDate: '2026-06-01' });

  // Selected Alert state for Inspector
  const [selectedAlert, setSelectedAlert] = useState(null);

  // ── AUDIT LOG HELPER ──
  const logActivity = (action, remarks) => {
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: user?.name || 'HR Executive',
        action,
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks
      }
    });
  };

  // Legacy handleRegisterStaff removed — handled by EmployeeRegistrationForm component

  // ── PUNCH ATTENDANCE SIMULATOR ──
  const runGraceAuditor = (presetTime) => {
    setSimTime(presetTime);
    const selectedEmpObj = employees.find(e => e.id === selectedStaffSim);
    if (!selectedEmpObj) return;

    let checkStatus = 'On Time';
    if (presetTime === '09:25' || presetTime === '09:22') {
      checkStatus = 'Late (+7 mins)';
    } else if (presetTime === '06:15') {
      checkStatus = 'Overtime (+15 mins)';
    }

    const newLog = {
      selfie: 'Biometric Selfie',
      id: selectedStaffSim,
      name: selectedEmpObj.name,
      action: presetTime === '06:15' ? 'Check Out' : 'Check In',
      time: presetTime + ' AM',
      status: checkStatus
    };

    setSimLogs([newLog, ...simLogs]);
    showToast(`Clock punch simulation logged for ${selectedEmpObj.name}!`);
  };

  // ── UPDATE SHIFT ASSIGNMENT ──
  const handleReassignShift = async (empId) => {
    try {
      await adminService.updateEmployee(empId, { shift: newShiftVal });
      await syncData();
      showToast(`Shift updated to ${newShiftVal}!`);
      setEditingShiftEmp(null);
    } catch (err) {
      // Fallback: update locally if backend doesn't support shift field yet
      dispatch({ type: 'UPDATE_SHIFT', payload: { empId, shift: newShiftVal } });
      showToast(`Shift updated to ${newShiftVal}! (local)`);
      setEditingShiftEmp(null);
    }
  };

  // ── INITIATE EXIT OFFBOARDING ──
  const handleInitiateExit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const resigningStaff = employees.find(emp => emp.id === exitForm.empId);
    if (!resigningStaff) return;

    const newExit = {
      empId: exitForm.empId,
      name: resigningStaff.name,
      department: resigningStaff.department,
      effectiveDate: exitForm.effectiveDate,
      checkpoints: { IT: false, Finance: false, Store: false, HR: false },
      progress: 0,
      status: 'In Progress'
    };

    try {
      // Mark employee as inactive in DB and record exit
      await adminService.updateEmployee(exitForm.empId, {
        is_active: false,
        exit_date: exitForm.effectiveDate,
        exit_status: 'In Progress'
      });
      await syncData();
    } catch (err) {
      // Fallback to local dispatch if backend doesn't support exit fields yet
      dispatch({ type: 'ADD_EXIT_CLEARANCE', payload: newExit });
    }

    showToast(`Exit checkpoints initiated for ${resigningStaff.name}!`);
    setShowExitModal(false);
  };

  const handleSaveExitFormModal = async (record) => {
    const clearedCount = Object.values(record.checkpoints || {}).filter(Boolean).length;
    const progress = Math.round((clearedCount / (Object.keys(record.checkpoints || {}).length || 4)) * 100);
    const updatedRecord = {
      ...record,
      progress,
      status: record.approval?.finalHrStatus === 'Cleared' ? 'Cleared' : progress === 100 ? 'Cleared' : 'In Progress'
    };

    const existing = exitClearances.find(ex => ex.empId === record.empId);
    if (existing) {
      dispatch({ type: 'UPDATE_EXIT_CLEARANCE', payload: updatedRecord });
    } else {
      dispatch({ type: 'ADD_EXIT_CLEARANCE', payload: updatedRecord });
    }

    try {
      await adminService.updateEmployee(record.empId, {
        is_active: updatedRecord.status === 'Cleared' ? false : true,
        exit_date: record.effectiveDate,
        exit_status: updatedRecord.status
      });
      await syncData();
    } catch (err) {
      console.warn('Exit DB sync failed:', err.message);
    }

    showToast(`Resignation & Exit Clearance Form saved for ${record.name}!`);
    setShowExitModal(false);
    setSelectedExitRecord(null);
  };

  const toggleCheckpoint = async (empId, deptKey) => {
    const record = exitClearances.find(ex => ex.empId === empId);
    if (!record) return;

    const updatedCheckpoints = { ...record.checkpoints, [deptKey]: !record.checkpoints[deptKey] };
    const clearedCount = Object.values(updatedCheckpoints).filter(Boolean).length;
    const progress = (clearedCount / 4) * 100;
    const status = progress === 100 ? 'Cleared' : 'In Progress';

    // Update locally immediately for fast UI
    dispatch({ type: 'UPDATE_EXIT_CLEARANCE', payload: { empId, checkpoints: updatedCheckpoints, progress, status } });

    try {
      await adminService.updateEmployee(empId, {
        exit_status: status,
        exit_checkpoints: JSON.stringify(updatedCheckpoints)
      });
    } catch (err) {
      // Local dispatch already done above — non-critical if backend fails
      console.warn('Exit checkpoint DB sync failed:', err.message);
    }

    showToast(`Checkpoint ${deptKey} updated for resigning employee.`);
  };

  // ── LEAVE APPROVAL HANDLERS ──
  const handleLeaveApproval = async (leaveId, isApproved) => {
    const newStatus = isApproved ? 'Approved' : 'Rejected';
    // Optimistic local update first
    dispatch({ type: 'UPDATE_LEAVE', payload: { id: leaveId, status: newStatus } });

    try {
      await apiClient.patch(`/admin/employees/leaves/${leaveId}`, { status: newStatus });
    } catch (err) {
      // Route may not exist yet — local dispatch already done
      console.warn('Leave approval DB sync failed:', err.message);
    }

    showToast(isApproved ? 'Leave application APPROVED.' : 'Leave application REJECTED.');
  };

  // ── DELETE EMPLOYEE ──
  const handleDeleteEmployee = async (empId, name) => {
    if (confirm(`Are you sure you want to delete employee ${name}?`)) {
      try {
        await adminService.deleteEmployee(empId);
        await syncData();
        showToast(`Employee ${name} deleted.`);
      } catch (err) {
        // Fallback: remove locally if DB fails
        dispatch({ type: 'DELETE_EMPLOYEE', payload: empId });
        showToast(`Employee ${name} deleted (local). Error: ${err.message}`);
      }
    }
  };

  // ── VIEW RENDERERS ──

  // 1. DASHBOARD
  const renderDashboard = () => {
    const totalStaff = employees.length;
    const activeStaff = employees.filter(e => e.active).length;
    const pendingLeavesCount = leaves.filter(l => l.status === 'PH Pending' || l.status === 'Pending').length;
    const salaryExpense = employees.reduce((sum, e) => sum + (e.salary || 30000), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>HR Dashboard: Overview</h2>
          <span style={{ fontSize: '12px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="app-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Staff Strength</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px' }}>{totalStaff} Employees</h3>
            <span style={{ fontSize: '11px', color: '#84cc16' }}>{activeStaff} Active on floor</span>
          </div>

          <div className="app-card" style={{ borderLeft: '4px solid #84cc16' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Daily Attendance</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px' }}>96% Attendance</h3>
            <span style={{ fontSize: '11px', color: '#8893A7' }}>Simulated average rate</span>
          </div>

          <div className="app-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Leave Requests Awaiting</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px' }}>{pendingLeavesCount} Applications</h3>
            <span style={{ fontSize: '11px', color: '#ef4444' }}>Awaiting HR Clearance</span>
          </div>

          <div className="app-card" style={{ borderLeft: '4px solid #9333ea' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Monthly Payroll Outlay</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px' }}>₹{(salaryExpense / 100000).toFixed(2)} L</h3>
            <span style={{ fontSize: '11px', color: '#8893A7' }}>Cumulative Wages Outlay</span>
          </div>
        </div>

        {/* Department Breakdown & Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div className="app-card">
            <h3 className="card-heading" style={{ marginBottom: '16px' }}>Employee Department Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <div>
                    <strong>{emp.name}</strong> ({emp.id})
                    <div style={{ fontSize: '11px', color: '#5E6B82' }}>{emp.role}</div>
                  </div>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    background: emp.department === 'Sales' ? 'rgba(14, 165, 233, 0.1)' : emp.department === 'Production' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(147, 51, 234, 0.1)',
                    color: emp.department === 'Sales' ? '#0ea5e9' : emp.department === 'Production' ? '#16a34a' : '#9333ea'
                  }}>
                    {emp.department}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="app-card" style={{ border: '1px dashed #ef4444', background: 'rgba(239,68,68,0.02)' }}>
            <h3 className="card-heading" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ HR Action Alerts
            </h3>
            <div style={{ marginTop: '14px', fontSize: '13px' }}>
              <strong>Leave Requests Awaiting Review</strong>
              <p style={{ color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                There are {pendingLeavesCount} leaves pending manager review. Open Leave Approvals to clear.
              </p>
              <button 
                className="action-btn"
                style={{ background: '#ef4444', color: '#fff', border: 'none', width: '100%', padding: '8px', borderRadius: '6px', fontWeight: 'bold', marginTop: '16px', cursor: 'pointer' }}
                onClick={() => navigate.push('/hr/leaves')}
              >
                Resolve Leave Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. EMPLOYEES DIRECTORY
  const renderEmployees = () => {
    if (params?.slug?.[1]) return <EmployeeDetails id={params.slug[1]} />;
    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-heading">Corporate Staff Directory</h2>
            <span style={{ fontSize: '11px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
          </div>
          <button 
            className="action-btn"
            style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => navigate.push('/hr/register-staff')}
          >
            <UserPlus size={16} /> Register Staff
          </button>
        </div>

        <DataTable 
          columns={[
            { header: 'Code', accessor: 'employeeCode' },
            { header: 'Full Name', accessor: 'fullName', render: (row) => <strong>{row.fullName}</strong> },
            { header: 'Department', accessor: 'department', render: (row) => row.department?.name },
            { header: 'Role', accessor: 'jobTitle' },
            { header: 'Working Days', accessor: 'payroll', render: (row) => row.payroll?.standardWorkingDays || '—' },
            { header: 'Paid Days', accessor: 'payroll', render: (row) => row.payroll?.payableDays || '—' },
            { header: 'Unpaid Days', accessor: 'payroll', render: (row) => row.payroll?.unpaidLeaveDays || '—' },
            { header: 'Gross Salary', accessor: 'payroll', render: (row) => row.payroll ? `₹${Number(row.payroll.grossEarnings).toLocaleString('en-IN')}` : '—' },
            { header: 'Payroll Status', accessor: 'payroll', render: (row) => row.payroll?.status || 'NOT GENERATED' }
          ]}
          data={directoryEmployees}
          searchQuery={globalSearch}
          searchField="fullName"
          actions={(row) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                title="View Employee"
                className="action-btn"
                style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}
                onClick={() => navigate.push(`/hr/employees/${row.id}`)}
              >
                <Eye size={12} />
              </button>
            </div>
          )}
          emptyMessage={directoryError || "No employees found in records."}
        />
      </div>
    );
  };

  // 3. REGISTER STAFF FORM — delegated to dedicated component
  const renderRegisterStaff = () => <EmployeeRegistrationForm />;

  // 4. ATTENDANCE & CLOCK BIOMETRIC SIMULATOR
  const renderAttendance = () => {
    const selectedEmpObj = employees.find(e => e.id === selectedStaffSim);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Biometric Clock Auditor</h2>
          <span style={{ fontSize: '12px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'stretch' }}>
          {/* Simulator Panel */}
          <div className="app-card">
            <h3 className="card-heading" style={{ marginBottom: '14px' }}>System Clock & Grace Period Auditor</h3>
            <p style={{ fontSize: '12px', color: '#5E6B82', marginBottom: '16px' }}>
              Use this simulator panel to test late check-ins and overtime calculations by changing the clock time.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Clock Simulation Time</label>
                <input type="time" value={simTime} onChange={(e) => setSimTime(e.target.value)} className="form-input" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Simulation Date</label>
                <input type="date" value={simDate} onChange={(e) => setSimDate(e.target.value)} className="form-input" />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', color: '#5E6B82', display: 'block', marginBottom: '8px' }}>Time Presets:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => runGraceAuditor('09:05')} 
                  style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  09:05 AM (Grace Window)
                </button>
                <button 
                  onClick={() => runGraceAuditor('09:25')} 
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  09:25 AM (Late Check-in)
                </button>
                <button 
                  onClick={() => runGraceAuditor('06:15')} 
                  style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  06:15 PM (Overtime Check-out)
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #DCE5F0', paddingTop: '16px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Select Staff Member</label>
              <select 
                value={selectedStaffSim} 
                onChange={(e) => setSelectedStaffSim(e.target.value)} 
                className="form-select"
                style={{ maxWidth: '300px' }}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Face Preview Monitor */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-heading" style={{ marginBottom: '14px' }}>Biometric Selfie Monitor</h3>
            
            <div style={{ flex: 1, minHeight: '180px', background: '#24345C', borderRadius: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #334155' }}>
              {selectedEmpObj ? (
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <Camera size={40} color="#0ea5e9" style={{ display: 'block', margin: '0 auto 12px auto' }} />
                  <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#84cc16', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    FACE PREVIEW SECURE
                  </span>
                  <strong style={{ fontSize: '14px', display: 'block' }}>{selectedEmpObj.name}</strong>
                  <span style={{ fontSize: '11.5px', color: '#8893A7' }}>{selectedEmpObj.id} | {selectedEmpObj.role}</span>
                </div>
              ) : (
                <span style={{ color: '#5E6B82' }}>Select Staff Member</span>
              )}
            </div>

            {selectedEmpObj && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginTop: '16px', background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Assigned Shift:</span>
                  <strong>General Shift (09:00 - 18:00)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Grace Period:</span>
                  <strong>Up to 15 minutes (09:15 AM)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Punch Action:</span>
                  <strong>Check In</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Punch Time:</span>
                  <strong>{simTime} ({simDate})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                  <span>Status:</span>
                  <strong>Late (+7 mins)</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Today's Logs Roster */}
        <div className="app-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-heading">Attendance Register & Analytics Reports</h3>
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <span>Today's Logs: <strong>{simLogs.length}</strong></span>
              <span>Late Reports: <strong>{simLogs.filter(l => l.status.includes('Late')).length}</strong></span>
              <span>Overtime Tracking: <strong>0</strong></span>
            </div>
          </div>

          <DataTable 
            columns={[
              { header: 'Biometric Selfie', accessor: 'selfie', render: () => <span style={{ fontSize: '11px', color: '#0ea5e9', fontWeight: 'bold' }}>📸 Bio Selfie Secure</span> },
              { header: 'Employee Code', accessor: 'id' },
              { header: 'Staff Name', accessor: 'name' },
              { header: 'Log Action', accessor: 'action' },
              { header: 'Clock Time', accessor: 'time' },
              { 
                header: 'Register Status', 
                accessor: 'status',
                render: (row) => (
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    background: row.status.includes('Late') ? 'rgba(245,158,11,0.15)' : 'rgba(22,163,74,0.15)',
                    color: row.status.includes('Late') ? '#f59e0b' : '#16a34a' 
                  }}>
                    {row.status}
                  </span>
                )
              }
            ]}
            data={simLogs}
            searchQuery=""
            searchField="name"
            emptyMessage="No biometric clock punches logged today."
          />
        </div>
      </div>
    );
  };

  // 5. SHIFT SCHEDULES BOARD
  const renderShifts = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Active Corporate Shift Templates</h2>
          <span style={{ fontSize: '12px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
        </div>

        {/* Templates Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { id: 'General', label: 'General Shift', hours: '09:00 - 18:00', grace: '+15 mins', type: 'Full-time standard' },
            { id: 'Morning', label: 'Morning Shift', hours: '06:00 - 14:00', grace: '+10 mins', type: 'Full-time standard' },
            { id: 'Night', label: 'Night Shift', hours: '22:00 - 06:00', grace: '+15 mins', type: 'Full-time standard' }
          ].map(temp => (
            <div key={temp.id} className="app-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>{temp.label}</strong>
                <button style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
              </div>
              <h3 style={{ fontSize: '18px', margin: '4px 0', color: '#24345C' }}>{temp.hours}</h3>
              <p style={{ fontSize: '11px', color: '#5E6B82', margin: '4px 0 0 0' }}>
                Grace window: {temp.grace} | Type: {temp.type}
              </p>
            </div>
          ))}
        </div>

        {/* Schedules table */}
        <div className="app-card">
          <h3 className="card-heading" style={{ marginBottom: '16px' }}>Staff Shift Schedules Board</h3>
          
          <DataTable 
            columns={[
              { header: 'Employee Code', accessor: 'empId' },
              { header: 'Full Name', accessor: 'name' },
              { header: 'Department', accessor: 'department' },
              { header: 'Designation', accessor: 'role' },
              { 
                header: 'Scheduled Shift', 
                accessor: 'shift', 
                render: (row) => (
                  <strong style={{ color: '#0ea5e9' }}>
                    {row.shift || 'General Shift'}
                  </strong>
                ) 
              }
            ]}
            data={shifts}
            searchQuery={globalSearch}
            searchField="name"
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="action-btn"
                  style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', padding: '5px 10px', borderRadius: '4px', color: '#0ea5e9', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    setEditingShiftEmp(row.empId);
                    setNewShiftVal(row.shift || 'General Shift');
                  }}
                >
                  Reassign Shift
                </button>
              </div>
            )}
            emptyMessage="No staff shift configurations logged."
          />
        </div>

        {/* Reassignment Mini-Modal Popover */}
        {editingShiftEmp && (
          <div className="modal-overlay active" onClick={() => setEditingShiftEmp(null)} style={{ zIndex: 10000 }}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '350px' }}>
              <div className="modal-header-row">
                <h3 className="modal-title-text">Reassign Staff Shift</h3>
                <button className="modal-close-btn" onClick={() => setEditingShiftEmp(null)}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <label className="form-label">Select Template Shift</label>
                <select value={newShiftVal} onChange={(e) => setNewShiftVal(e.target.value)} className="form-select">
                  <option value="General Shift">General Shift (09:00 - 18:00)</option>
                  <option value="Morning Shift">Morning Shift (06:00 - 14:00)</option>
                  <option value="Night Shift">Night Shift (22:00 - 06:00)</option>
                </select>
                <button 
                  className="action-btn"
                  style={{ background: 'var(--color-primary)', border: 'none', padding: '10px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
                  onClick={() => handleReassignShift(editingShiftEmp)}
                >
                  Assign Shift
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 6. LEAVE WORKFLOWS
  const renderLeaves = () => {
    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-heading">Leave Request Applications</h2>
            <span style={{ fontSize: '11px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
          </div>
        </div>

        <DataTable 
          columns={[
            { header: 'Request ID', accessor: 'id' },
            { header: 'Employee Name', accessor: 'empName' },
            { header: 'From Date', accessor: 'startDate' },
            { header: 'To Date', accessor: 'endDate' },
            { header: 'Duration (Days)', accessor: 'duration', render: (row) => `${row.duration || 1} Days` },
            { header: 'Reason', accessor: 'reason' },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={leaves}
          searchQuery={globalSearch}
          searchField="empName"
          actions={(row) => {
            const isPending = row.status === 'PH Pending' || row.status === 'Pending';
            return (
              <div style={{ display: 'flex', gap: '8px' }}>
                {isPending ? (
                  <>
                    <button 
                      className="action-btn"
                      style={{ background: 'rgba(22, 163, 74, 0.15)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#16a34a', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                      onClick={() => handleLeaveApproval(row.id, true)}
                    >
                      Approve
                    </button>
                    <button 
                      className="action-btn"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                      onClick={() => handleLeaveApproval(row.id, false)}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#8893A7', fontSize: '11px', fontWeight: 'bold' }}>Action Taken</span>
                )}
              </div>
            );
          }}
          emptyMessage="No leave requests logged."
        />
      </div>
    );
  };

  // 7. EXIT CLEARANCE
  const renderExitClearance = () => {
    const defaultExitClearances = [
      {
        empId: 'EMP-005',
        name: 'Neha Shah',
        department: 'Finance',
        effectiveDate: '2026-06-30',
        empDetails: {
          id: 'EMP-005',
          name: 'Neha Shah',
          designation: 'Senior Accountant',
          department: 'Finance',
          dateOfJoining: '2021-03-15',
          resignationDate: '2026-05-30',
          lastWorkingDay: '2026-06-30',
          noticePeriod: '30',
          noticeServed: '30',
          reportingManager: 'Anil Kumar (VP Finance)'
        },
        clearance: {
          workHandover: 'Completed',
          assetsReturned: 'Yes',
          financeDues: 'Cleared',
          adminClearance: 'Cleared',
          managerClearance: 'Cleared',
          exitInterview: 'Done',
          leaveBalance: '5',
          fullAndFinal: 'Completed'
        },
        assets: {
          laptopPc: true,
          monitor: true,
          keyboardMouse: true,
          mobileCharger: true,
          idCard: true,
          keys: true,
          headsetDisk: false,
          documentsFiles: true,
          other: 'Access token returned'
        },
        approval: {
          remarks: 'Handover complete. All financial ledger access revoked.',
          empSignature: 'Neha Shah',
          empSigDate: '2026-06-30',
          mgrSignature: 'Anil Kumar',
          mgrSigDate: '2026-06-30',
          hrSignature: 'Raman HR',
          hrSigDate: '2026-06-30',
          finalHrStatus: 'Cleared',
          hrSignOff: 'Raman HR',
          hrSignOffDate: '2026-06-30',
          companyStamp: 'Himalaya Enterprises - HR Seal'
        },
        checkpoints: { IT: true, Finance: true, Store: true, HR: true },
        progress: 100,
        status: 'Cleared'
      },
      {
        empId: 'EMP-002',
        name: 'Ramanathan Swamy',
        department: 'Operations',
        effectiveDate: '2026-07-15',
        empDetails: {
          id: 'EMP-002',
          name: 'Ramanathan Swamy',
          designation: 'Operations Lead',
          department: 'Operations',
          dateOfJoining: '2022-04-10',
          resignationDate: '2026-06-15',
          lastWorkingDay: '2026-07-15',
          noticePeriod: '30',
          noticeServed: '30',
          reportingManager: 'Plant Manager'
        },
        clearance: {
          workHandover: 'Pending',
          assetsReturned: 'Yes',
          financeDues: 'Pending',
          adminClearance: 'Cleared',
          managerClearance: 'Pending',
          exitInterview: 'Pending',
          leaveBalance: '8',
          fullAndFinal: 'Pending'
        },
        assets: {
          laptopPc: true,
          monitor: false,
          keyboardMouse: true,
          mobileCharger: true,
          idCard: true,
          keys: true,
          headsetDisk: true,
          documentsFiles: true,
          other: ''
        },
        approval: {
          remarks: 'Notice period underway. Store handover pending.',
          empSignature: 'Ramanathan Swamy',
          empSigDate: '2026-06-15',
          mgrSignature: '',
          mgrSigDate: '',
          hrSignature: 'HR Team',
          hrSigDate: '2026-06-15',
          finalHrStatus: 'Pending',
          hrSignOff: '',
          hrSignOffDate: '',
          companyStamp: 'Himalaya Enterprises - HR Seal'
        },
        checkpoints: { IT: true, Finance: false, Store: true, HR: false },
        progress: 50,
        status: 'In Progress'
      }
    ];

    const activeExitList = exitClearances.length > 0 ? exitClearances : defaultExitClearances;

    const handleExportRegistryCSV = () => {
      const data = activeExitList.map(item => ({
        'Employee Code': item.empId,
        'Resigning Staff': item.name,
        'Department': item.department,
        'Effective Date': item.effectiveDate,
        'IT Cleared': item.checkpoints?.IT ? 'Yes' : 'No',
        'Finance Cleared': item.checkpoints?.Finance ? 'Yes' : 'No',
        'Store Cleared': item.checkpoints?.Store ? 'Yes' : 'No',
        'HR Cleared': item.checkpoints?.HR ? 'Yes' : 'No',
        'Clearance Progress': `${item.progress}%`,
        'Overall Status': item.status
      }));
      exportToCSV(data, `exit-clearance-registry-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportRegistryExcel = () => {
      const data = activeExitList.map(item => ({
        'Employee Code': item.empId,
        'Resigning Staff': item.name,
        'Department': item.department,
        'Effective Date': item.effectiveDate,
        'IT Cleared': item.checkpoints?.IT ? 'Yes' : 'No',
        'Finance Cleared': item.checkpoints?.Finance ? 'Yes' : 'No',
        'Store Cleared': item.checkpoints?.Store ? 'Yes' : 'No',
        'HR Cleared': item.checkpoints?.HR ? 'Yes' : 'No',
        'Clearance Progress': `${item.progress}%`,
        'Overall Status': item.status
      }));
      exportToExcel(data, `exit-clearance-registry-${new Date().toISOString().split('T')[0]}.xls`);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="card-heading" style={{ fontSize: '18px', fontWeight: '800' }}>Corporate Offboarding & Exit Clearance Registry</h2>
            <span style={{ fontSize: '11px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="action-btn"
              style={{ background: '#0284c7', border: 'none', padding: '8px 14px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              onClick={handleExportRegistryCSV}
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              className="action-btn"
              style={{ background: '#16a34a', border: 'none', padding: '8px 14px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              onClick={handleExportRegistryExcel}
            >
              <FileSpreadsheet size={14} /> Export Excel
            </button>
            <button 
              className="action-btn"
              style={{ background: '#24345C', border: 'none', padding: '8px 14px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              onClick={() => {
                setSelectedExitRecord(null);
                setShowExitModal(true);
              }}
            >
              <FileText size={14} /> Initiate Exit Process
            </button>
          </div>
        </div>

        <div className="app-card">
          <DataTable 
            columns={[
              { header: 'Employee Code', accessor: 'empId' },
              { header: 'Resigning Staff', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Department', accessor: 'department' },
              { header: 'Effective Date', accessor: 'effectiveDate' },
              { 
                header: 'Department Checkpoints Status', 
                accessor: 'empId',
                render: (row) => (
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
                    {Object.entries(row.checkpoints || {}).map(([dept, isCleared]) => (
                      <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={isCleared} 
                          onChange={() => toggleCheckpoint(row.empId, dept)} 
                        />
                        <span style={{ color: isCleared ? '#16a34a' : '#5E6B82', fontWeight: isCleared ? 'bold' : 'normal' }}>
                          {dept}
                        </span>
                      </label>
                    ))}
                  </div>
                )
              },
              { header: 'Clearance Progress', accessor: 'progress', render: (row) => <strong>{row.progress}%</strong> },
              { 
                header: 'Overall Status', 
                accessor: 'status',
                render: (row) => (
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    background: row.status === 'Cleared' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                    color: row.status === 'Cleared' ? '#16a34a' : '#0ea5e9' 
                  }}>
                    {row.status}
                  </span>
                )
              },
              {
                header: 'Resignation Form',
                accessor: 'empId',
                render: (row) => (
                  <button
                    className="action-btn"
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      color: '#0f172a',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => {
                      setSelectedExitRecord(row);
                      setShowExitModal(true);
                    }}
                  >
                    <FileText size={12} /> View / Edit Form
                  </button>
                )
              }
            ]}
            data={activeExitList}
            searchQuery={globalSearch}
            searchField="name"
            emptyMessage="No offboarding processes registered."
          />
        </div>

        {/* Exit Clearance Form Modal */}
        <ExitClearanceFormModal
          isOpen={showExitModal}
          onClose={() => {
            setShowExitModal(false);
            setSelectedExitRecord(null);
          }}
          onSubmit={handleSaveExitFormModal}
          employees={employees}
          initialData={selectedExitRecord}
        />
      </div>
    );
  };


  // 8. PAYROLL OUTLAY
  const renderPayroll = () => {
    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-heading">Corporate Staff Monthly Payroll</h2>
            <span style={{ fontSize: '11px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
          </div>
          <button 
            className="action-btn"
            style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => showToast('Salaries disbursed successfully for June 2026!')}
          >
            Disburse Salaries
          </button>
        </div>

        <DataTable 
          columns={[
            { header: 'Employee Code', accessor: 'id' },
            { header: 'Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
            { header: 'Department', accessor: 'department' },
            { header: 'Designation', accessor: 'role' },
            { header: 'Base Salary', accessor: 'salary', render: (row) => `₹${(row.salary || 30000).toLocaleString('en-IN')}` },
            { 
              header: 'Leaves Deductions', 
              accessor: 'id', 
              render: (row) => {
                const pendingCount = leaves.filter(l => l.empId === row.id && l.status === 'Approved').length || 0;
                const deduction = pendingCount * 1500;
                return deduction > 0 ? <span style={{ color: '#ef4444' }}>-₹{deduction.toLocaleString('en-IN')}</span> : '₹0';
              } 
            },
            { 
              header: 'Net Payable', 
              accessor: 'id', 
              render: (row) => {
                const pendingCount = leaves.filter(l => l.empId === row.id && l.status === 'Approved').length || 0;
                const deduction = pendingCount * 1500;
                const base = row.salary || 30000;
                const net = Math.max(0, base - deduction);
                return <strong style={{ color: '#16a34a' }}>₹{net.toLocaleString('en-IN')}</strong>;
              } 
            }
          ]}
          data={employees}
          searchQuery={globalSearch}
          searchField="name"
          emptyMessage="No payroll summaries generated."
        />
      </div>
    );
  };

  // 9. HR NOTIFICATIONS
  const renderNotifications = () => {
    const alerts = [
      { id: 'AL-01', title: 'Leave Application Pending', message: 'Ramanathan Swamy has applied for a 3-day leave starting 18-Jun-2026.', date: '10-Jun-2026', type: 'Leave', empId: 'EMP-002' },
      { id: 'AL-02', title: 'Exit Process Checkpoint', message: 'Neha Shah clearance checkpoint is in progress. 75% completed.', date: '01-Jun-2026', type: 'Exit', empId: 'EMP-005' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>HR Action Alerts & System Alerts</h2>
          <span style={{ fontSize: '12px', color: '#5E6B82' }}>📅 Date: 2026-06-10</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'stretch' }}>
          {/* Alerts List */}
          <div className="app-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DCE5F0', paddingBottom: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px' }}>Unread (0) | All Alerts ({alerts.length})</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map(al => (
                <div 
                  key={al.id} 
                  onClick={() => setSelectedAlert(al)}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid #DCE5F0', 
                    background: selectedAlert?.id === al.id ? 'rgba(14,165,233,0.05)' : '#ffffff',
                    borderColor: selectedAlert?.id === al.id ? '#0ea5e9' : '#DCE5F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px' }}>{al.title}</strong>
                    <span style={{ fontSize: '10px', color: '#5E6B82' }}>{al.date}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{al.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Inspector */}
          <div className="app-card">
            <h3 className="card-heading" style={{ marginBottom: '14px' }}>Detailed Staff Profile Inspector</h3>
            {selectedAlert ? (
              (() => {
                const emp = employees.find(e => e.id === selectedAlert.empId);
                if (!emp) return <span style={{ color: '#5E6B82' }}>Employee profile not found.</span>;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                      <span style={{ fontSize: '10px', color: '#5E6B82', display: 'block' }}>Roster Member</span>
                      <strong>{emp.name} ({emp.id})</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#5E6B82' }}>Designation</span>
                        <p style={{ fontWeight: 'bold' }}>{emp.role}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#5E6B82' }}>Department</span>
                        <p style={{ fontWeight: 'bold' }}>{emp.department}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#5E6B82' }}>Base Pay</span>
                        <p style={{ fontWeight: 'bold' }}>₹{emp.salary.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#5E6B82' }}>Attendance</span>
                        <p style={{ fontWeight: 'bold', color: '#16a34a' }}>{emp.attendance || 95}%</p>
                      </div>
                    </div>
                    <button 
                      className="action-btn"
                      style={{ background: 'var(--color-primary)', border: 'none', padding: '8px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}
                      onClick={() => {
                        if (selectedAlert.type === 'Leave') navigate.push('/hr/leaves');
                        if (selectedAlert.type === 'Exit') navigate.push('/hr/exit-clearance');
                      }}
                    >
                      Process Action Checklist
                    </button>
                  </div>
                );
              })()
            ) : (
              <p style={{ fontSize: '12.5px', color: '#5E6B82', textAlign: 'center', marginTop: '24px' }}>
                Select an alert from the notification list to inspect employee's corporate details and initiate follow-up actions.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveView = () => {
    switch (view) {
      case 'profile':
        return <MyProfileView />;
      case 'expense-management':
        return <ExpenseManagementView />;
      case 'leave-approvals':
        return <LeaveApprovalView roleMode="HR" />;
      case 'attendance-requests':
        return <HRAttendanceRequestsView />;
      case 'dashboard':
        return renderDashboard();
      case 'employees':
        return renderEmployees();
      case 'register-staff':
        return renderRegisterStaff();
      case 'attendance':
        return renderAttendance();
      case 'shifts':
        return renderShifts();
      case 'leaves':
        return renderLeaves();
      case 'exit-clearance':
        return renderExitClearance();
      case 'payroll':
        return renderPayroll();
      case 'notifications':
        return renderNotifications();
      case 'users':
        return <UsersManagementView />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {renderActiveView()}
    </div>
  );
}
