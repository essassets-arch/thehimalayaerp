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
import { exportToCSV, exportToExcel } from '../../../services/export.service';



export default function HRPortal() {
  const params = useParams(); const view = params?.slug?.[0];
  const { state, dispatch, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const navigate = useRouter();

  // Roster states
  const [dbEmployees, setDbEmployees] = useState([]);

  const loadEmployees = async () => {
    try {
      const res = await employeesService.listEmployees({ page: 1, limit: 50 });
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
    return dbEmployees.length > 0
      ? dbEmployees.map(emp => ({
          id: emp.employeeCode || emp.id,
          name: emp.fullName || `${emp.firstName} ${emp.lastName}`.trim(),
          department: typeof emp.department === 'object' ? (emp.department?.name || 'Operations') : (emp.department || 'Operations'),
          designation: emp.jobTitle || 'Staff Member',
          status: emp.status || 'ACTIVE'
        }))
      : [];
  }, [dbEmployees]);

  const [directoryEmployees, setDirectoryEmployees] = useState([]);
  const [directoryError, setDirectoryError] = useState('');

  const loadDirectory = async () => {
    try {
      const today = new Date();
      const [listRes, payrollOverviewRes] = await Promise.allSettled([
        employeesService.listEmployees({ page: 1, limit: 100, search: globalSearch }),
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

  // Legacy register staff form state removed — handled by EmployeeRegistrationForm component

  // Attendance simulator states
  const [selectedStaffSim, setSelectedStaffSim] = useState('');

  useEffect(() => {
    if (employees.length > 0 && !selectedStaffSim) {
      setSelectedStaffSim(employees[0].id);
    }
  }, [employees, selectedStaffSim]);

  const [simTime, setSimTime] = useState('09:22');
  const [simDate, setSimDate] = useState('2026-06-11');
  const [selectedLogPreview, setSelectedLogPreview] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [customFilterDate, setCustomFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [rosterInspectDate, setRosterInspectDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [simLogs, setSimLogs] = useState([]);
  const [rosterEmployeeFilter, setRosterEmployeeFilter] = useState('All');

  const [shiftPolicies, setShiftPolicies] = useState({
    'HR': { checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
    'Sales': { checkIn: '09:30 AM', checkOut: '06:30 PM', grace: 30 },
    'Production': { checkIn: '08:00 AM', checkOut: '05:00 PM', grace: 10 },
    'Finance': { checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
    'Default': { checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 }
  });

  const loadPoliciesFromDB = async () => {
    try {
      const response = await apiClient.get('/attendance/policies');
      if (response && response.success !== false) {
        const data = Array.isArray(response) ? response : (response.data || []);
        if (data.length > 0) {
          const mapped = {};
          data.forEach(p => {
            mapped[p.deptName] = { checkIn: p.checkIn, checkOut: p.checkOut, grace: p.grace };
          });
          setShiftPolicies(mapped);
          localStorage.setItem('himalaya_shift_policy', JSON.stringify(mapped));
        }
      }
    } catch (e) {
      console.error('Error fetching shift policies from DB:', e);
    }
  };

  useEffect(() => {
    loadPoliciesFromDB();
  }, []);

  const saveShiftPolicy = async (updated) => {
    setShiftPolicies(updated);
    try {
      localStorage.setItem('himalaya_shift_policy', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      for (const dept of Object.keys(updated)) {
        await apiClient.post(`/attendance/policies/${dept}`, updated[dept]);
      }
    } catch (e) {
      console.error('Error saving shift policy to DB:', e);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('himalaya_shift_policy');
        if (saved) {
          setShiftPolicies(JSON.parse(saved));
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [editingDeptPolicy, setEditingDeptPolicy] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState('09:00 AM');
  const [editCheckOut, setEditCheckOut] = useState('06:00 PM');
  const [editGrace, setEditGrace] = useState(15);
  const [attendanceSubTab, setAttendanceSubTab] = useState('register');



  const getPunchStatus = (timeStr, isCheckIn, deptName = 'Default') => {
    if (!timeStr || timeStr === '—') return '—';
    try {
      const policy = shiftPolicies[deptName] || shiftPolicies['Default'] || { checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 };
      const cleaned = timeStr.trim();
      const match = cleaned.match(/^(\d+):(\d+):?(\d+)?\s*(AM|PM)$/i);
      if (!match) return '—';
      
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[4].toUpperCase();
      
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const checkMinutes = hours * 60 + minutes;
      
      const parsePolicyTime = (pTime) => {
        const pMatch = pTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (!pMatch) return 0;
        let pHours = parseInt(pMatch[1], 10);
        const pMins = parseInt(pMatch[2], 10);
        const pAmpm = pMatch[3].toUpperCase();
        if (pAmpm === 'PM' && pHours !== 12) pHours += 12;
        if (pAmpm === 'AM' && pHours === 12) pHours = 0;
        return pHours * 60 + pMins;
      };
      
      if (isCheckIn) {
        const shiftStartMinutes = parsePolicyTime(policy.checkIn);
        const graceLimitMinutes = shiftStartMinutes + parseInt(policy.grace || 15, 10);
        
        if (checkMinutes > graceLimitMinutes) {
          const minutesLate = checkMinutes - shiftStartMinutes;
          return `Late (+${minutesLate} mins)`;
        } else if (checkMinutes > shiftStartMinutes) {
          return 'Grace Window';
        }
        return 'On Time';
      } else {
        const shiftEndMinutes = parsePolicyTime(policy.checkOut);
        
        if (checkMinutes > shiftEndMinutes) {
          const minutesOT = checkMinutes - shiftEndMinutes;
          return `Overtime (+${minutesOT} mins)`;
        } else if (checkMinutes < shiftEndMinutes) {
          const minutesEarly = shiftEndMinutes - checkMinutes;
          return `Early Leaver (-${minutesEarly} mins)`;
        }
        return 'On Time';
      }
    } catch (e) {
      return 'GPS Verified';
    }
  };

  const loadPunchesErrCount = useRef(0);

  // Load real-time punches from NestJS database
  const loadPunches = async () => {
    if (loadPunchesErrCount.current >= 4) return;
    try {
      // Build dynamic API path based on period/target date
      let apiPath = '/attendance';
      if (filterPeriod === 'today') {
        apiPath = `/attendance?date=${rosterInspectDate}`;
      } else if (filterPeriod === 'custom') {
        apiPath = `/attendance?mode=logs&from=${customFilterDate}&to=${customFilterDate}`;
      } else if (filterPeriod === 'weekly') {
        const toDateStr = new Date().toISOString().slice(0, 10);
        const fromDateStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        apiPath = `/attendance?mode=logs&from=${fromDateStr}&to=${toDateStr}`;
      } else if (filterPeriod === 'monthly') {
        const toDateStr = new Date().toISOString().slice(0, 10);
        const fromDateStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        apiPath = `/attendance?mode=logs&from=${fromDateStr}&to=${toDateStr}`;
      } else if (filterPeriod === 'all') {
        apiPath = '/attendance?mode=logs';
      }

      // 1. Fetch real punches from centralized DB
      let dbPunches = [];
      try {
        const response = await apiClient.get(apiPath);
        if (response) {
          loadPunchesErrCount.current = 0;
          if (Array.isArray(response)) {
            dbPunches = response;
          } else if (response.data && Array.isArray(response.data)) {
            dbPunches = response.data;
          } else if (response.items && Array.isArray(response.items)) {
            dbPunches = response.items;
          }
        }
      } catch (e) {
        loadPunchesErrCount.current += 1;
        console.warn('[HRPortal] Error fetching punches from DB (backoff active):', e?.message || e);
      }

      const mappedDbPunches = dbPunches.map(p => ({
        id: p.employeeCode,
        name: p.employeeName,
        email: p.email,
        department: p.department,
        role: p.role,
        action: p.punchOut !== '—' ? 'Check Out' : 'Check In',
        time: p.punchOut !== '—' ? p.punchOut : p.punchIn,
        punchIn: p.punchIn,
        punchOut: p.punchOut,
        date: p.date,
        location: p.punchInLocation || '—',
        coords: p.coords,
        selfieUrl: p.selfieUrl,
        punchInSelfieUrl: p.punchInSelfieUrl,
        punchOutSelfieUrl: p.punchOutSelfieUrl,
        status: p.status,
        timestamp: p.timestamp,
        isRealPunch: true
      }));

      // 2. Merge sources prioritizing database records (Simulated sources removed)
      const mergedMap = new Map();

      mappedDbPunches.forEach(p => {
        const key = `${p.id}_${p.date}`;
        mergedMap.set(key, p);
      });

      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      });

      setSimLogs(mergedList);
    } catch (e) {
      console.error('Error loading punches in HR portal:', e);
    }
  };

  useEffect(() => {
    loadPunches();
    window.addEventListener('storage', loadPunches);
    window.addEventListener('himalaya:punch', loadPunches);
    const interval = setInterval(loadPunches, 4000);
    return () => {
      window.removeEventListener('storage', loadPunches);
      window.removeEventListener('himalaya:punch', loadPunches);
      clearInterval(interval);
    };
  }, [user, employees, rosterInspectDate, filterPeriod, customFilterDate]);

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

    // Parse the simulated time "HH:MM"
    const [hoursStr, minutesStr] = presetTime.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Determine action: morning check in (before 2 PM), check out otherwise
    const isCheckIn = hours < 14;
    const action = isCheckIn ? 'Check In' : 'Check Out';

    // Format display time
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;

    let checkStatus = getPunchStatus(timeStr, isCheckIn, selectedEmpObj.department || 'Default');

    // Dynamic simulated GPS coords (near factory base coordinates 23.0229, 72.5566 with small random noise)
    const latOffset = (Math.random() - 0.5) * 0.005;
    const lngOffset = (Math.random() - 0.5) * 0.005;
    const simLat = (23.0229 + latOffset).toFixed(4);
    const simLng = (72.5566 + lngOffset).toFixed(4);
    const simCoords = `${simLat}° N, ${simLng}° E`;
    const simAddress = `GIDC Industrial Estate, Sector ${Math.floor(Math.random() * 5) + 1}, Haridwar Campus`;

    // Dynamic simulated portrait / avatar selfie image
    const simSelfieUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedStaffSim}_${Date.now()}`;

    const newLog = {
      id: selectedStaffSim,
      name: selectedEmpObj.name,
      action,
      time: timeStr,
      date: simDate ? new Date(simDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Saturday, 15 August 2026',
      status: checkStatus,
      location: simAddress,
      coords: simCoords,
      selfieUrl: simSelfieUrl,
      isRealPunch: false,
      timestamp: simDate ? new Date(`${simDate}T${presetTime}:00`).toISOString() : new Date().toISOString()
    };

    setSimLogs(prev => {
      const updated = [newLog, ...prev];
      const simulatedOnly = updated.filter(p => !p.isRealPunch);
      try {
        localStorage.setItem('himalaya_sim_logs', JSON.stringify(simulatedOnly));
      } catch (e) {}
      return updated;
    });

    apiClient.post('/attendance/punches', {
      empId: newLog.id,
      empName: newLog.name,
      type: isCheckIn ? 'PUNCH_IN' : 'PUNCH_OUT',
      time: newLog.time,
      date: newLog.date,
      location: newLog.location,
      coords: newLog.coords,
      selfieUrl: newLog.selfieUrl,
      isRealPunch: false,
      timestamp: newLog.timestamp
    }).then(() => {
      loadPunches();
    }).catch(e => console.error('Error saving simulated log to backend:', e));

    showToast(`Dynamic clock punch audit logged for ${selectedEmpObj.name}!`);
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
    return (
      <HRDashboardView 
        onNavigate={(path) => navigate.push(path)}
        onOpenExitModal={(record) => {
          setSelectedExitRecord(record);
          setShowExitModal(true);
        }}
        employees={employees}
        leaves={leaves}
        exitClearances={exitClearances}
        shifts={shifts}
      />
    );
  };

  // 2. EMPLOYEES DIRECTORY
  const renderEmployees = () => {
    if (params?.slug?.[1]) return <EmployeeDetails id={params.slug[1]} />;
    const activeStaffData = directoryEmployees.length > 0 ? directoryEmployees : dbEmployees;

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
            { header: 'Role / Designation', accessor: 'jobTitle', render: (row) => row.jobTitle || row.designation || row.role || 'Staff Member' },
            { header: 'Working Days', accessor: 'payroll', render: (row) => row.payroll?.standardWorkingDays || '25' },
            { header: 'Paid Days', accessor: 'payroll', render: (row) => row.payroll?.payableDays || '25' },
            { header: 'Unpaid Days', accessor: 'payroll', render: (row) => row.payroll?.unpaidLeaveDays || '0' },
            { header: 'Gross Salary', accessor: 'payroll', render: (row) => row.payroll ? `₹${Number(row.payroll.grossEarnings).toLocaleString('en-IN')}` : `₹${Number(row.baseSalary || row.salary || 25000).toLocaleString('en-IN')}` },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || row.payroll?.status || 'ACTIVE'} /> }
          ]}
          data={activeStaffData}
          searchQuery={globalSearch}
          searchField="fullName"
          actions={(row) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                title="View Employee Profile"
                className="action-btn"
                style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '6px 12px', borderRadius: '6px', color: '#0284C7', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => navigate.push(`/hr/employees/${row.id}`)}
              >
                <Eye size={14} /> Inspect
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

  // 4. ATTENDANCE & CLOCK BIOMETRIC SIMULATOR (Redesigned Premium UI)
  const renderAttendance = () => {
    let activePreview = null;
    const grouped = {};
    const sortedSimLogs = [...simLogs].sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTime - bTime;
    });

    sortedSimLogs.forEach(log => {
      const isCheckIn = log.action === 'Check In' || ('punchIn' in log && log.punchIn !== '—');
      const timeStr = isCheckIn ? (log.time || log.punchIn) : (log.time || log.punchOut);
      const logDate = log.date || '2026-06-11';
      const key = `${log.id}_${logDate}`;
      const empDept = employees.find(e => e.id === log.id)?.department || 'Default';
      const calculatedStatus = log.isRealPunch ? log.status : getPunchStatus(timeStr, isCheckIn, empDept);

      if (!grouped[key]) {
        grouped[key] = {
          ...log,
          punchIn: isCheckIn ? timeStr : '—',
          punchOut: !isCheckIn ? timeStr : '—',
          status: calculatedStatus,
          date: logDate
        };
      } else {
        if (isCheckIn) {
          grouped[key].punchIn = timeStr;
          if (log.selfieUrl) grouped[key].selfieUrl = log.selfieUrl;
          if (log.punchInSelfieUrl) grouped[key].punchInSelfieUrl = log.punchInSelfieUrl;
        } else {
          grouped[key].punchOut = timeStr;
          if (log.selfieUrl) grouped[key].selfieUrl = log.selfieUrl;
          if (log.punchOutSelfieUrl) grouped[key].punchOutSelfieUrl = log.punchOutSelfieUrl;
          if (log.isRealPunch) {
            grouped[key].status = log.status;
          } else if (calculatedStatus && calculatedStatus !== 'On Time' && calculatedStatus !== 'GPS Verified' && calculatedStatus !== '—') {
            grouped[key].status = `${grouped[key].status} / ${calculatedStatus}`;
          }
        }
      }
    });
    const rawFormattedLogs = Object.values(grouped).filter(log => log.punchIn !== '—' || log.punchOut !== '—');

    const getFilteredLogs = (logs) => {
      const todayStr = new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local time
      
      let filtered = logs.filter(log => {
        if (filterPeriod === 'all') return true;
        
        if (filterPeriod === 'today') {
          if (log.isRealPunch) {
            return log.date === todayStr;
          } else {
            return log.date === simDate;
          }
        } else if (filterPeriod === 'custom') {
          return log.date === customFilterDate;
        } else if (filterPeriod === 'weekly') {
          const logDate = new Date(log.date);
          const now = new Date();
          const diffTime = Math.abs(now - logDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        } else if (filterPeriod === 'monthly') {
          const logDate = new Date(log.date);
          const now = new Date();
          const diffTime = Math.abs(now - logDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        }
        return true;
      });

      if (rosterEmployeeFilter && rosterEmployeeFilter !== 'All') {
        filtered = filtered.filter(log => log.id === rosterEmployeeFilter);
      }

      return filtered;
    };

    const formattedLogs = getFilteredLogs(rawFormattedLogs);

    if (selectedLogPreview) {
      activePreview = selectedLogPreview;
    } else if (formattedLogs.length > 0) {
      activePreview = formattedLogs[0];
    } else {
      activePreview = null;
    }

    const filteredEmployees = employees.filter(emp => 
      emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) || 
      emp.id?.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ── HEADER BAR ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>HR Biometric & GPS Attendance Audit</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>Monitor live device check-ins, verify camera selfies, and validate geolocations</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '20px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', animation: 'pulse 1.5s infinite' }} />
              Live Sync Active
            </span>
          </div>
        </div>

        {/* Roster tab navigation bar */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', gap: '24px', marginBottom: '8px' }}>
          <button
            onClick={() => setAttendanceSubTab('register')}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: 'transparent',
              fontSize: '14.5px',
              fontWeight: '800',
              cursor: 'pointer',
              color: attendanceSubTab === 'register' ? '#4F46E5' : '#64748B',
              borderBottom: attendanceSubTab === 'register' ? '3px solid #4F46E5' : '3px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Attendance Register
          </button>
          <button
            onClick={() => setAttendanceSubTab('shifts')}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: 'transparent',
              fontSize: '14.5px',
              fontWeight: '800',
              cursor: 'pointer',
              color: attendanceSubTab === 'shifts' ? '#4F46E5' : '#64748B',
              borderBottom: attendanceSubTab === 'shifts' ? '3px solid #4F46E5' : '3px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Shift & Grace Policy Manager
          </button>
        </div>

        {attendanceSubTab === 'shifts' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="app-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Departmental Shift & Grace Policies</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Configure custom work shifts, grace windows, and policy parameters per department. Punches are dynamically audited based on these rules.</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
                      <th style={{ padding: '12px' }}>Department</th>
                      <th style={{ padding: '12px' }}>Shift Start (Check In)</th>
                      <th style={{ padding: '12px' }}>Shift End (Check Out)</th>
                      <th style={{ padding: '12px' }}>Grace Window</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(shiftPolicies).map((dept) => {
                      const policy = shiftPolicies[dept];
                      return (
                        <tr key={dept} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0F172A' }}>
                            {dept === 'Default' ? 'Default (Other Depts)' : `${dept} Department`}
                          </td>
                          <td style={{ padding: '14px 12px', fontFamily: 'monospace', fontWeight: '700', color: '#16A34A' }}>
                            {policy.checkIn}
                          </td>
                          <td style={{ padding: '14px 12px', fontFamily: 'monospace', fontWeight: '700', color: '#DC2626' }}>
                            {policy.checkOut}
                          </td>
                          <td style={{ padding: '14px 12px', fontWeight: '700', color: '#475569' }}>
                            {policy.grace} minutes
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setEditingDeptPolicy(dept);
                                setEditCheckIn(policy.checkIn);
                                setEditCheckOut(policy.checkOut);
                                setEditGrace(policy.grace);
                              }}
                              style={{
                                padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1',
                                borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer',
                                color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              <Edit3 size={12} /> Edit Policy
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inline Editor Modal */}
            {editingDeptPolicy && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="app-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                      Edit {editingDeptPolicy} Shift Policy
                    </h3>
                    <button onClick={() => setEditingDeptPolicy(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>×</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Shift Start (Check In Time)</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00 AM"
                        value={editCheckIn}
                        onChange={(e) => setEditCheckIn(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Shift End (Check Out Time)</label>
                      <input
                        type="text"
                        placeholder="e.g. 06:00 PM"
                        value={editCheckOut}
                        onChange={(e) => setEditCheckOut(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Grace Period (Minutes)</label>
                      <input
                        type="number"
                        value={editGrace}
                        onChange={(e) => setEditGrace(parseInt(e.target.value, 10))}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => setEditingDeptPolicy(null)}
                        style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updated = {
                            ...shiftPolicies,
                            [editingDeptPolicy]: { checkIn: editCheckIn, checkOut: editCheckOut, grace: editGrace }
                          };
                          saveShiftPolicy(updated);
                          setEditingDeptPolicy(null);
                          showToast(`${editingDeptPolicy} Shift Policy updated successfully! 🟢`);
                        }}
                        style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', color: '#ffffff', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}
                      >
                        Save Policy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── METRIC CARDS GRID ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: "Today's Total Logs", value: formattedLogs.length, sub: "Auto-synced from devices", bg: '#F8FAFC', border: '#E2E8F0', text: '#0F172A', icon: <Clock size={20} color="#475569" /> },
            { label: "GPS Verified", value: formattedLogs.filter(l => l.coords).length, sub: "Auto-captured coordinate", bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', icon: <MapPin size={20} color="#0284c7" /> },
            { label: "Biometric Selfies", value: formattedLogs.filter(l => l.selfieUrl).length, sub: "Verified camera captures", bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', icon: <Camera size={20} color="#7c3aed" /> },
            { label: "Late Punches", value: formattedLogs.filter(l => l.status?.includes('Late')).length, sub: "Outside grace window", bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', icon: <Shield size={20} color="#d97706" /> }
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: card.text, margin: '4px 0' }}>{card.value}</div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{card.sub}</span>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ffffff', border: `1px solid ${card.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN WORKSPACE SPLIT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'stretch' }}>
          
          {/* Left Column: Attendance Register */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Attendance Logs Table */}
            <div className="app-card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: '#0F172A' }}>Roster Punch Logs Register</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Select any row below to audit the selfie capture &amp; coordinates</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Period Filter Pills */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'custom', label: 'Custom' },
                      { id: 'all', label: 'All Logs' }
                    ].map(period => (
                      <button
                        key={period.id}
                        onClick={() => setFilterPeriod(period.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          border: 'none',
                          cursor: 'pointer',
                          background: filterPeriod === period.id ? '#ffffff' : 'transparent',
                          color: filterPeriod === period.id ? '#0F172A' : '#64748B',
                          boxShadow: filterPeriod === period.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Input */}
                  {filterPeriod === 'custom' && (
                    <input
                      type="date"
                      value={customFilterDate}
                      onChange={(e) => setCustomFilterDate(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: '#334155',
                        background: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        outline: 'none'
                      }}
                    />
                  )}

                  <button onClick={() => {
                    const csvContent = formattedLogs.map(l => `${l.name},${l.id},${l.punchIn},${l.punchOut},${l.status},${l.location || 'N/A'}`).join('\n');
                    exportToCSV(csvContent, 'attendance-audit-logs.csv');
                  }} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </div>

              <DataTable 
                columns={[
                  { 
                    header: 'Biometric Photo', 
                    accessor: 'selfieUrl',
                    render: (row) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {row.selfieUrl ? (
                          <img src={getBackendAssetUrl(row.selfieUrl)} alt="Selfie preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #cbd5e1' }}>
                            <Camera size={14} color="#64748b" />
                          </div>
                        )}
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: row.selfieUrl ? '#0284c7' : '#64748b' }}>
                          {row.selfieUrl ? '📸 Verified Photo' : 'Simulated Face'}
                        </span>
                      </div>
                    )
                  },
                  { header: 'ID', accessor: 'id' },
                  { header: 'Employee', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
                  { 
                    header: 'Date', 
                    accessor: 'date', 
                    render: (row) => (
                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>
                        {row.date || 'Saturday, 15 August 2026'}
                      </span>
                    )
                  },
                  { 
                    header: 'Punch In', 
                    accessor: 'punchIn', 
                    render: (row) => (
                      <span style={{ fontWeight: '800', color: row.punchIn !== '—' ? '#16A34A' : '#64748B', fontFamily: 'monospace', fontSize: '12px' }}>
                        {row.punchIn}
                      </span>
                    )
                  },
                  { 
                    header: 'Punch Out', 
                    accessor: 'punchOut', 
                    render: (row) => (
                      <span style={{ fontWeight: '800', color: row.punchOut !== '—' ? '#DC2626' : '#64748B', fontFamily: 'monospace', fontSize: '12px' }}>
                        {row.punchOut}
                      </span>
                    )
                  },
                  { 
                    header: 'GPS Location', 
                    accessor: 'location',
                    render: (row) => row.coords ? (
                      <span style={{ color: '#0284c7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11.5px' }} title={`${row.location} (${row.coords})`}>
                        <MapPin size={12} /> Verified
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '11px' }}>No GPS</span>
                    )
                  },
                  { 
                    header: 'Roster Status', 
                    accessor: 'status',
                    render: (row) => {
                      const isLate = row.status?.includes('Late');
                      const isEarly = row.status?.includes('Early');
                      const isOT = row.status?.includes('Overtime');
                      const isGps = row.status === 'GPS Verified';
                      
                      let bg = '#DCFCE7';
                      let color = '#15803D';
                      let border = '#BBF7D0';
                      
                      if (isLate || isEarly) {
                        bg = '#FEF3C7';
                        color = '#D97706';
                        border = '#FDE68A';
                      } else if (isOT) {
                        bg = '#EEF2FF';
                        color = '#4F46E5';
                        border = '#C7D2FE';
                      } else if (isGps) {
                        bg = '#E0F2FE';
                        color = '#0369A1';
                        border = '#BAE6FD';
                      }
                      
                      return (
                        <span style={{ 
                          padding: '3.5px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800',
                          background: bg, color: color, border: `1px solid ${border}`
                        }}>
                          {row.status}
                        </span>
                      );
                    }
                  }
                ]}
                data={formattedLogs}
                searchQuery=""
                searchField="name"
                onRowClick={(row) => setSelectedLogPreview(row)}
                emptyMessage="No attendance logs registered today."
              />
            </div>
          </div>

          {/* Right Column: High-tech Biometric Selfie Monitor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Corporate Employee Roster Viewer */}
            <div className="app-card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: '#0F172A' }}>Corporate Employee Roster Viewer</h3>
                <span style={{ padding: '3px 8px', borderRadius: '12px', background: '#F1F5F9', color: '#475569', fontSize: '10px', fontWeight: '800' }}>MONITOR</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Filter by Employee</label>
                  <select
                    value={rosterEmployeeFilter}
                    onChange={(e) => {
                      setRosterEmployeeFilter(e.target.value);
                      setSelectedLogPreview(null);
                    }}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: '#fff' }}
                  >
                    <option value="All">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name || emp.fullName} ({emp.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Audit Target Date</label>
                  <input 
                    type="date" 
                    value={rosterInspectDate} 
                    onChange={(e) => setRosterInspectDate(e.target.value)} 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: '#fff' }} 
                  />
                </div>
              </div>
            </div>

            <div className="app-card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: '#0F172A' }}>Biometric Selfie &amp; GPS Monitor</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Live photographic identity verification terminal</span>
              </div>

              {/* Photo preview monitor box */}
              <div style={{ flex: 1, minHeight: '220px', background: '#0B0F19', borderRadius: '12px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', border: '2px solid #1E293B', overflow: 'hidden' }}>
                {activePreview?.punchInSelfieUrl || activePreview?.punchOutSelfieUrl ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', height: '100%', flex: 1 }}>
                    {activePreview?.punchInSelfieUrl ? (
                      <div style={{ flex: 1, position: 'relative', height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={getBackendAssetUrl(activePreview.punchInSelfieUrl)} alt="Punch In Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.75)', color: '#10B981', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)', letterSpacing: '0.5px' }}>PUNCH IN</div>
                      </div>
                    ) : null}
                    {activePreview?.punchOutSelfieUrl ? (
                      <div style={{ flex: 1, position: 'relative', height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={getBackendAssetUrl(activePreview.punchOutSelfieUrl)} alt="Punch Out Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.75)', color: '#EF4444', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.3)', letterSpacing: '0.5px' }}>PUNCH OUT</div>
                      </div>
                    ) : (
                      activePreview?.punchInSelfieUrl ? (
                        <div style={{ flex: 1, background: '#111827', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '10px', fontWeight: '700', border: '1px dashed #1e293b' }}>
                          <Camera size={18} color="#1e293b" style={{ marginBottom: '4px' }} />
                          No Punch Out
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  activePreview?.selfieUrl ? (
                    <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
                      <img src={getBackendAssetUrl(activePreview.selfieUrl)} alt="Webcam Capture" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748B', padding: '24px' }}>
                      <Camera size={44} color="#334155" style={{ display: 'block', margin: '0 auto 12px auto' }} />
                      <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#0EA5E9', fontWeight: '800', display: 'block', marginBottom: '8px' }}>BIOMETRIC SCANNER READY</span>
                      <span style={{ fontSize: '12px', color: '#475569' }}>Select employee check-in log to inspect photo capture</span>
                    </div>
                  )
                )}
                
                {/* Overlay live tag */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#fff', textTransform: 'uppercase' }}>SECURE CAPTURE</span>
                </div>
              </div>

              {/* Details box */}
              {activePreview && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Employee Name:</span>
                    <strong style={{ color: '#0F172A' }}>{activePreview.name} ({activePreview.id})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Punch Action:</span>
                    <span style={{ color: '#0F172A', fontWeight: '800' }}>
                      {activePreview.action ? activePreview.action : (
                        `${activePreview.punchIn !== '—' ? 'Punch In' : ''}${activePreview.punchIn !== '—' && activePreview.punchOut !== '—' ? ' & ' : ''}${activePreview.punchOut !== '—' ? 'Punch Out' : ''}`
                      )}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Device Timestamp:</span>
                    <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>
                      {activePreview.time ? activePreview.time : (
                        `${activePreview.punchIn !== '—' ? `In: ${activePreview.punchIn}` : ''}${activePreview.punchIn !== '—' && activePreview.punchOut !== '—' ? ' | ' : ''}${activePreview.punchOut !== '—' ? `Out: ${activePreview.punchOut}` : ''}`
                      )} ({activePreview.date || 'Today'})
                    </strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Verified Geolocation Address:</span>
                    <strong style={{ color: '#0284C7', fontSize: '12px', lineHeight: 1.35 }}>
                      📍 {activePreview.location || 'No Verified Location'}
                    </strong>
                    {activePreview.coords && (
                      <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#0369A1', fontWeight: '700' }}>
                        Exact GPS Coords: {activePreview.coords}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}
      </div>
    );
  };

  // 5. SHIFT SCHEDULES BOARD & MONITOR
  const renderShifts = () => {
    const generalPolicy = shiftPolicies['Default'] || { checkIn: '09:00 AM', checkOut: '06:00 PM' };
    const salesPolicy = shiftPolicies['Sales'] || { checkIn: '09:30 AM', checkOut: '06:30 PM' };
    const prodPolicy = shiftPolicies['Production'] || { checkIn: '08:00 AM', checkOut: '05:00 PM' };

    const totalRegistered = employees.length;
    const presentToday = formattedLogs.filter(l => l.punchIn !== '—').length;
    const lateToday = formattedLogs.filter(l => l.status?.includes('Late')).length;

    const shiftSummaryData = [
      {
        shift: 'General Shift (HR/Finance/Other)',
        employees: employees.filter(e => e.department === 'HR' || e.department === 'Finance').length || Math.max(0, totalRegistered - employees.filter(e => e.department === 'Sales' || e.department === 'Production').length),
        present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('On Time')).length,
        late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Late')).length,
        timing: `${generalPolicy.checkIn} - ${generalPolicy.checkOut}`,
        status: lateToday > 3 ? 'Attention' : 'Optimal'
      },
      {
        shift: 'Sales Shift',
        employees: employees.filter(e => e.department === 'Sales').length,
        present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Sales')).length,
        late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Sales') && l.status?.includes('Late')).length,
        timing: `${salesPolicy.checkIn} - ${salesPolicy.checkOut}`,
        status: 'Optimal'
      },
      {
        shift: 'Production Shift',
        employees: employees.filter(e => e.department === 'Production').length,
        present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Production')).length,
        late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Production') && l.status?.includes('Late')).length,
        timing: `${prodPolicy.checkIn} - ${prodPolicy.checkOut}`,
        status: 'Optimal'
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px 24px', borderRadius: '14px', color: '#ffffff' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Shift & Attendance Monitor</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Current workforce distribution by active shift</p>
          </div>
          <button 
            className="action-btn"
            style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
            onClick={() => showToast('Shift management configuration updated.')}
          >
            Manage Shifts
          </button>
        </div>

        {/* 1. Shift Workforce Distribution Table */}
        <div className="app-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-heading" style={{ margin: 0 }}>Current Workforce Distribution by Shift</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Total Staff: {totalRegistered} Employees</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Shift</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Employees</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Present</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Late</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Timing</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shiftSummaryData.map((row) => (
                  <tr key={row.shift} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>{row.shift}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#334155' }}>{row.employees}</td>
                    <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: '800' }}>{row.present}</td>
                    <td style={{ padding: '12px 16px', color: row.late > 5 ? '#ef4444' : '#f59e0b', fontWeight: '800' }}>{row.late}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>{row.timing}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800',
                        background: row.status === 'Optimal' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: row.status === 'Optimal' ? '#10b981' : '#ef4444'
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Templates Grid */}
        <div className="app-card">
          <h3 className="card-heading" style={{ marginBottom: '16px' }}>Active Corporate Shift Templates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { id: 'General', label: 'General Shift', hours: '09:00 AM - 06:00 PM', grace: '+15 mins', type: 'Full-time standard' },
              { id: 'Morning', label: 'Morning Shift', hours: '06:00 AM - 02:00 PM', grace: '+10 mins', type: 'Full-time standard' },
              { id: 'Night', label: 'Night Shift', hours: '10:00 PM - 06:00 AM', grace: '+15 mins', type: 'Full-time standard' }
            ].map(temp => (
              <div key={temp.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '14px' }}>{temp.label}</strong>
                  <button onClick={() => showToast(`Edit template for ${temp.label}`)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                </div>
                <h4 style={{ fontSize: '16px', margin: '4px 0', color: '#0ea5e9', fontWeight: '800' }}>{temp.hours}</h4>
                <p style={{ fontSize: '11px', color: '#5E6B82', margin: '4px 0 0 0' }}>
                  Grace window: {temp.grace} | Type: {temp.type}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Schedules table */}
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
                  <option value="General Shift">General Shift (09:00 AM - 06:00 PM)</option>
                  <option value="Morning Shift">Morning Shift (06:00 AM - 02:00 PM)</option>
                  <option value="Night Shift">Night Shift (10:00 PM - 06:00 AM)</option>
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

    const activeExitList = exitClearances;

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
      case 'leaves':
        return <LeaveApprovalView roleMode="HR" />;
      case 'exit-clearance':
        return renderExitClearance();
      case 'payroll':
        return renderPayroll();
      case 'notifications':
        return <HRNotificationsView />;
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
