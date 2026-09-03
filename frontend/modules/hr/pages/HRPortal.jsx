'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useERP } from '../../../shared/context/ERPContext';
import MyProfileView from '../../../shared/components/MyProfileView';
import ExpenseManagementView from '../../../shared/components/ExpenseManagementView';
import LeaveApprovalView from '../../../shared/components/LeaveApprovalView';
import HRAttendanceRequestsView from '../../../shared/components/HRAttendanceRequestsView';
import AttendanceView from '../../../shared/components/AttendanceView';
import { useAuth } from '../../../shared/context/AuthContext';
import { adminService } from '../../../services/admin.service';
import { apiClient } from '../../../lib/apiClient';
import { employeesService } from '../../../services/hr/employeesService';
import { getBackendAssetUrl } from '../../../lib/assetUrl';
import EmployeeRegistrationForm from '../employee/components/EmployeeRegistrationForm';
import EmployeeDetails from '../employee/components/EmployeeDetails';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { 
  Users, UserPlus, Clock, ClipboardList, FileText, PackageCheck, CreditCard, Bell, 
  Trash2, Edit3, Shield, UserX, CheckCircle, XCircle, Search, Save, Calendar, Camera, Play, Eye, Download, FileSpreadsheet, MapPin
} from 'lucide-react';
import UsersManagementView from '../components/UsersManagementView';
import HRNotificationsView from '../components/HRNotificationsView';
import ExitClearanceFormModal from '../components/ExitClearanceFormModal';
import HRDashboardView from '../components/HRDashboardView';
import HRComplaintCenterView from '../components/HRComplaintCenterView';
import { exportToCSV, exportToExcel } from '../../../services/export.service';

export default function HRPortal() {
  const params = useParams();
  const pathname = usePathname();
  const slug = useMemo(() => {
    if (Array.isArray(params?.slug) && params.slug.length > 0) return params.slug;
    if (typeof params?.slug === 'string') return [params.slug];
    if (pathname) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts[0] === 'hr' && parts.length > 1) return parts.slice(1);
    }
    return [];
  }, [params?.slug, pathname]);
  const view = slug[0] || 'dashboard';
  const subId = slug[1] || null;

  const { state, dispatch, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const navigate = useRouter();

  // Roster states
  const [dbEmployees, setDbEmployees] = useState([]);
  const [inspectEmployeeId, setInspectEmployeeId] = useState(null);

  const defaultRoster = useMemo(() => [
    { id: 'EMP-1', employeeCode: 'EMP-1', name: 'Sales Eleven', department: 'Sales Department', designation: 'Sales Executive', dateOfJoining: '2023-01-15', reportingManager: 'Plant Head / HR Manager', status: 'ACTIVE' },
    { id: 'EMP-001', employeeCode: 'EMP-001', name: 'Aarav Sharma', department: 'Operations', designation: 'Operations Manager', dateOfJoining: '2022-01-10', reportingManager: 'Plant Head', status: 'ACTIVE' },
    { id: 'EMP-002', employeeCode: 'EMP-002', name: 'Ramanathan Swamy', department: 'Operations', designation: 'Operations Lead', dateOfJoining: '2022-04-10', reportingManager: 'Plant Head', status: 'ACTIVE' },
    { id: 'EMP-003', employeeCode: 'EMP-003', name: 'Priya Patel', department: 'Human Resources', designation: 'HR Executive', dateOfJoining: '2023-02-01', reportingManager: 'HR Manager', status: 'ACTIVE' },
    { id: 'EMP-004', employeeCode: 'EMP-004', name: 'Vikram Singh', department: 'Quality Control', designation: 'QC Specialist', dateOfJoining: '2022-08-20', reportingManager: 'Quality Head', status: 'ACTIVE' },
    { id: 'EMP-005', employeeCode: 'EMP-005', name: 'Neha Shah', department: 'Finance', designation: 'Senior Accountant', dateOfJoining: '2021-03-15', reportingManager: 'VP Finance', status: 'ACTIVE' },
  ], []);

  const loadEmployees = async () => {
    try {
      const res = await employeesService.listEmployees({ page: 1, limit: 1000 });
      if (res && res.items) {
        setDbEmployees(res.items);
      }
    } catch (e) {
      console.error('Error loading employees in HR portal:', e);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const employees = useMemo(() => {
    if (dbEmployees.length > 0) {
      const mappedDb = dbEmployees.map(emp => ({
        id: emp.employeeCode || emp.id,
        dbId: emp.id,
        employeeCode: emp.employeeCode || emp.id,
        name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        department: typeof emp.department === 'object' ? (emp.department?.name || 'Sales Department') : (emp.department || 'Sales Department'),
        designation: emp.jobTitle || emp.role || 'Sales Executive',
        dateOfJoining: emp.joiningDate ? emp.joiningDate.split('T')[0] : (emp.createdAt ? emp.createdAt.split('T')[0] : '2023-01-15'),
        reportingManager: emp.reportingManager?.fullName || emp.reportingManagerName || (typeof emp.reportingManager === 'string' ? emp.reportingManager : 'Plant Head / HR Manager'),
        status: emp.status || 'ACTIVE'
      }));

      const hasSales11 = mappedDb.some(e => e.id === 'EMP-1' || e.employeeCode === 'EMP-1' || e.name === 'Sales Eleven');
      if (!hasSales11) {
        return [defaultRoster[0], ...mappedDb];
      }
      return mappedDb;
    }
    return defaultRoster;
  }, [dbEmployees, defaultRoster]);

  const [directoryEmployees, setDirectoryEmployees] = useState([]);
  const [directoryError, setDirectoryError] = useState('');

  const loadDirectory = async () => {
    try {
      const today = new Date();
      const [listRes, payrollOverviewRes] = await Promise.allSettled([
        employeesService.listEmployees({ page: 1, limit: 1000, search: globalSearch }),
        employeesService.getPayrollOverview({ month: today.getMonth() + 1, year: today.getFullYear(), search: globalSearch })
      ]);

      const allEmps = listRes.status === 'fulfilled' && listRes.value?.items ? listRes.value.items : [];
      const payrollData = payrollOverviewRes.status === 'fulfilled' && Array.isArray(payrollOverviewRes.value) ? payrollOverviewRes.value : [];

      if (allEmps.length > 0) {
        const merged = allEmps.map(emp => {
          const overview = payrollData.find(p => p.id === emp.id || p.employeeCode === emp.employeeCode);
          return {
            ...emp,
            payroll: overview?.payroll || emp.payroll || null
          };
        });
        setDirectoryEmployees(merged);
      } else if (payrollData.length > 0) {
        setDirectoryEmployees(payrollData);
      } else {
        setDirectoryEmployees([]);
      }
      setDirectoryError('');
    } catch (e) {
      setDirectoryError(e.message || 'Error loading employee directory');
    }
  };

  useEffect(() => {
    loadDirectory();
  }, [view, globalSearch]);

  const leaves = state.leaves || [];
  const shifts = state.shifts || [];
  const exitClearances = state.exitClearances || [];

  useEffect(() => {
    try {
      if (!state.exitClearances || state.exitClearances.length === 0) {
        const stored = JSON.parse(localStorage.getItem('himalaya_exit_clearances') || '[]');
        if (Array.isArray(stored) && stored.length > 0) {
          dispatch({ type: 'SET_EXIT_CLEARANCES', payload: stored });
        }
      }
    } catch {}
  }, [state.exitClearances, dispatch]);

  // Exit clearance state
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedExitRecord, setSelectedExitRecord] = useState(null);
  const [exitForm, setExitForm] = useState({ empId: 'EMP-001', effectiveDate: '2026-06-01' });

  // Selected Alert state for Inspector
  const [selectedAlert, setSelectedAlert] = useState(null);
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

    const existing = (exitClearances || []).find(ex => ex.empId === record.empId || ex.id === record.empId);
    if (existing) {
      dispatch({ type: 'UPDATE_EXIT_CLEARANCE', payload: updatedRecord });
    } else {
      dispatch({ type: 'ADD_EXIT_CLEARANCE', payload: updatedRecord });
    }

    try {
      const stored = JSON.parse(localStorage.getItem('himalaya_exit_clearances') || '[]');
      const filtered = stored.filter(x => x.empId !== record.empId && x.id !== record.empId);
      localStorage.setItem('himalaya_exit_clearances', JSON.stringify([updatedRecord, ...filtered]));
    } catch {}

    try {
      const empItem = employees.find(e => e.id === record.empId || e.employeeCode === record.empId);
      const targetId = empItem?.dbId || empItem?.id || record.empId;
      if (empItem?.dbId) {
        await employeesService.updateEmployeeStatus(targetId, {
          status: updatedRecord.status === 'Cleared' ? 'RESIGNED' : 'ACTIVE',
          reason: `Exit clearance updated: ${updatedRecord.status}`
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Exit DB status sync note:', err.message);
    }

    logActivity('EXIT_CLEARANCE_SAVED', `Exit clearance record saved for ${record.name} (${record.empId}) - Status: ${updatedRecord.status}`);
    showToast(`Resignation & Exit Clearance Form saved for ${record.name}!`);
    setShowExitModal(false);
    setSelectedExitRecord(null);
  };

  const toggleCheckpoint = async (empId, deptKey, currentExitList = []) => {
    const sourceList = exitClearances.length > 0 ? exitClearances : currentExitList;
    const record = sourceList.find(ex => ex.empId === empId || ex.id === empId);
    if (!record) return;

    const updatedCheckpoints = { ...record.checkpoints, [deptKey]: !record.checkpoints?.[deptKey] };
    const clearedCount = Object.values(updatedCheckpoints).filter(Boolean).length;
    const progress = Math.round((clearedCount / (Object.keys(updatedCheckpoints).length || 4)) * 100);
    const status = progress === 100 ? 'Cleared' : 'In Progress';

    const updatedRecord = {
      ...record,
      checkpoints: updatedCheckpoints,
      progress,
      status,
      approval: {
        ...(record.approval || {}),
        finalHrStatus: status
      }
    };

    const existingInState = exitClearances.find(ex => ex.empId === empId || ex.id === empId);
    if (existingInState) {
      dispatch({ type: 'UPDATE_EXIT_CLEARANCE', payload: updatedRecord });
    } else {
      dispatch({ type: 'ADD_EXIT_CLEARANCE', payload: updatedRecord });
    }

    try {
      const stored = JSON.parse(localStorage.getItem('himalaya_exit_clearances') || '[]');
      const filtered = stored.filter(x => x.empId !== empId && x.id !== empId);
      localStorage.setItem('himalaya_exit_clearances', JSON.stringify([updatedRecord, ...filtered]));
    } catch {}

    logActivity('EXIT_CHECKPOINT_UPDATED', `Checkpoint ${deptKey} updated for ${record.name} - Progress: ${progress}%`);
    showToast(`Checkpoint ${deptKey} updated for ${record.name}.`);
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
    return (
      <HRDashboardView 
        onNavigate={(path) => navigate.push(path)}
        onOpenExitModal={(record) => {
          setSelectedExitRecord(record);
          setShowExitModal(true);
        }}
        employees={directoryEmployees.length > 0 ? directoryEmployees : dbEmployees.length > 0 ? dbEmployees : employees}
        leaves={leaves}
        expenses={state.expenses || []}
        exitClearances={exitClearances}
        shifts={shifts}
        auditLogs={state.auditLogs || []}
      />
    );
  };

  // 2. EMPLOYEES DIRECTORY & INSPECT
  const renderEmployees = () => {
    const activeInspectId = (view === 'employees' && subId) ? subId : inspectEmployeeId;

    if (activeInspectId) {
      return (
        <EmployeeDetails 
          id={activeInspectId} 
          onBack={() => {
            setInspectEmployeeId(null);
            if (subId) {
              navigate.push('/hr/employees');
            }
          }} 
        />
      );
    }

    const rawStaffData = directoryEmployees.length > 0 ? directoryEmployees : dbEmployees;
    const parseEmpNum = (code) => {
      const m = String(code || '').match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 999999;
    };
    const activeStaffData = [...rawStaffData].sort((a, b) => parseEmpNum(a.employeeCode) - parseEmpNum(b.employeeCode));

    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-heading">Corporate Staff Directory</h2>
            <span style={{ fontSize: '11px', color: '#5E6B82' }}>Manage workforce records, payroll overview and staff profiles</span>
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
            { 
              header: 'Code', 
              accessor: 'employeeCode',
              render: (row) => <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{row.employeeCode || row.id || 'EMP-000'}</strong>
            },
            { 
              header: 'Full Name', 
              accessor: 'fullName', 
              render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {row.selfieUrl ? (
                    <img src={getBackendAssetUrl(row.selfieUrl)} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: '800', fontSize: '12px' }}>
                      {(row.fullName || row.name || 'E').charAt(0)}
                    </div>
                  )}
                  <strong>{row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.name || 'Staff Member'}</strong>
                </div>
              )
            },
            { header: 'Department', accessor: 'department', render: (row) => typeof row.department === 'object' ? (row.department?.name || 'Operations') : (row.department || 'Operations') },
            { 
              header: 'Gross Salary', 
              accessor: 'baseSalary', 
              render: (row) => {
                const amount = row.baseSalary !== undefined && row.baseSalary !== null && row.baseSalary !== ''
                  ? Number(row.baseSalary)
                  : (row.salary !== undefined && row.salary !== null && row.salary !== ''
                    ? Number(row.salary)
                    : (row.payroll?.grossEarnings !== undefined && row.payroll?.grossEarnings !== null
                      ? Number(row.payroll.grossEarnings)
                      : 0));
                return (
                  <span style={{ fontWeight: '700', color: amount > 0 ? '#0f172a' : '#64748b', fontFamily: 'monospace', fontSize: '13px' }}>
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                );
              } 
            },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || row.payroll?.status || 'ACTIVE'} /> }
          ]}
          data={activeStaffData}
          searchQuery={globalSearch}
          searchField="fullName"
          actions={(row) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                title="View Full Profile & Master Record"
                className="action-btn"
                style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '6px 12px', borderRadius: '6px', color: '#0284C7', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setInspectEmployeeId(row.id || row.employeeCode);
                  navigate.push(`/hr/employees/${row.id || row.employeeCode}`);
                }}
              >
                <Eye size={14} /> Inspect
              </button>
              <button 
                title="Edit Employee Information"
                className="action-btn"
                style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '6px 12px', borderRadius: '6px', color: '#B45309', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => navigate.push(`/hr/register-staff?edit=${row.id || row.employeeCode}`)}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
          )}
          emptyMessage={directoryError || "No employees found in corporate directory."}
        />
      </div>
    );
  };

  // 3. REGISTER STAFF FORM — delegated to dedicated component
  const renderRegisterStaff = () => <EmployeeRegistrationForm />;

  // 4. ATTENDANCE & CLOCK BIOMETRIC SIMULATOR (Delegated to shared component)
  const renderAttendance = () => {
    return <AttendanceView employees={employees} />;
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

    const activeExitList = (exitClearances && exitClearances.length > 0) ? exitClearances : defaultExitClearances;

    const totalExits = activeExitList.length;
    const clearedExits = activeExitList.filter(e => e.status === 'Cleared').length;
    const pendingExits = totalExits - clearedExits;
    const avgProgress = totalExits > 0 ? Math.round(activeExitList.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalExits) : 0;

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top Header Card */}
        <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '14px', background: '#ffffff', borderRadius: '12px', padding: '18px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <PackageCheck size={20} />
              </div>
              <div>
                <h2 className="card-heading" style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Corporate Offboarding & Exit Clearance Registry</h2>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>📅 Active Date: {new Date().toISOString().split('T')[0]} • Streamlined Resignation & Handovers</span>
              </div>
            </div>
          </div>
          <div className="hr-action-btn-group" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              className="action-btn"
              style={{ background: '#0284c7', border: 'none', padding: '9px 15px', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)' }}
              onClick={handleExportRegistryCSV}
            >
              <Download size={15} /> Export CSV
            </button>
            <button 
              className="action-btn"
              style={{ background: '#16a34a', border: 'none', padding: '9px 15px', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' }}
              onClick={handleExportRegistryExcel}
            >
              <FileSpreadsheet size={15} /> Export Excel
            </button>
            <button 
              className="action-btn"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: 'none', padding: '9px 18px', borderRadius: '8px', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)' }}
              onClick={() => {
                setSelectedExitRecord(null);
                setShowExitModal(true);
              }}
            >
              <FileText size={15} /> Initiate Exit Process
            </button>
          </div>
        </div>

        {/* Metric KPI Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Resignations</div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{totalExits}</div>
            <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '600', marginTop: '2px' }}>Registered offboarding cases</div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Clearance</div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#d97706', marginTop: '4px' }}>{pendingExits}</div>
            <div style={{ fontSize: '11.5px', color: '#d97706', fontWeight: '600', marginTop: '2px' }}>Checkpoints in progress</div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fully Cleared</div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{clearedExits}</div>
            <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>Handovers complete</div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Clearance Rate</div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#4f46e5', marginTop: '4px' }}>{avgProgress}%</div>
            <div style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: '600', marginTop: '2px' }}>Department fulfillment</div>
          </div>
        </div>

        {/* Registry Table */}
        <div className="app-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <DataTable 
            columns={[
              { 
                header: 'Employee Code', 
                accessor: 'empId',
                render: (row) => (
                  <span style={{ fontWeight: '800', color: '#0284c7', background: 'rgba(2, 132, 199, 0.08)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                    {row.empId}
                  </span>
                )
              },
              { 
                header: 'Resigning Staff', 
                accessor: 'name', 
                render: (row) => (
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{row.name}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{row.empDetails?.designation || 'Staff'}</div>
                  </div>
                ) 
              },
              { 
                header: 'Department', 
                accessor: 'department',
                render: (row) => (
                  <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                    {row.department}
                  </span>
                )
              },
              { 
                header: 'Effective Date', 
                accessor: 'effectiveDate',
                render: (row) => (
                  <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
                    {row.effectiveDate || 'N/A'}
                  </span>
                )
              },
              { 
                header: 'Department Checkpoints', 
                accessor: 'empId',
                render: (row) => (
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
                    {Object.entries(row.checkpoints || { IT: false, Finance: false, Store: false, HR: false }).map(([dept, isCleared]) => (
                      <label 
                        key={dept} 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          cursor: 'pointer',
                          background: isCleared ? 'rgba(22, 163, 74, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                          border: `1px solid ${isCleared ? 'rgba(22, 163, 74, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={Boolean(isCleared)} 
                          onChange={() => toggleCheckpoint(row.empId, dept, activeExitList)} 
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ color: isCleared ? '#16a34a' : '#b45309', fontWeight: '700', fontSize: '11.5px' }}>
                          {dept}
                        </span>
                      </label>
                    ))}
                  </div>
                )
              },
              { 
                header: 'Clearance Progress', 
                accessor: 'progress', 
                render: (row) => {
                  const pct = row.progress || 0;
                  return (
                    <div style={{ width: '120px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', marginBottom: '3px', color: pct === 100 ? '#16a34a' : '#0284c7' }}>
                        <span>{pct}%</span>
                        <span>{pct === 100 ? 'Complete' : 'In Progress'}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  );
                } 
              },
              { 
                header: 'Overall Status', 
                accessor: 'status',
                render: (row) => (
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '11.5px', 
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: row.status === 'Cleared' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                    color: row.status === 'Cleared' ? '#16a34a' : '#0284c7' 
                  }}>
                    {row.status === 'Cleared' ? '✓ Cleared' : '⏳ In Progress'}
                  </span>
                )
              },
              {
                header: 'Official Form',
                accessor: 'empId',
                render: (row) => (
                  <button
                    className="action-btn"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      color: '#0f172a',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => {
                      setSelectedExitRecord(row);
                      setShowExitModal(true);
                    }}
                  >
                    <FileText size={13} color="#0284c7" /> View / Edit Form
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

        <div className="hr-notifications-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'stretch' }}>
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
      case 'leaves':
        return <LeaveApprovalView roleMode="HR" />;
      case 'exit-clearance':
        return renderExitClearance();
      case 'payroll':
        return renderPayroll();
      case 'notifications':
        return <HRNotificationsView />;
      case 'complain-center':
      case 'complaint-center':
      case 'complaints':
        return <HRComplaintCenterView />;
      case 'users':
        return <UsersManagementView />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="hr-portal-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {renderActiveView()}
    </div>
  );
}
