import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter } from 'next/navigation';
import { useERP } from '../context/ERPContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { employeesService } from '../../services/hr/employeesService';
import { getBackendAssetUrl } from '../../lib/assetUrl';
import SecureImage from './SecureImage';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import { exportToCSV } from '../../services/export.service';
import { 
  Clock, MapPin, Camera, Shield, Edit3, Download, Users, UserPlus, Eye, Calendar, RefreshCw
} from 'lucide-react';

export default function AttendanceView({ employees: propEmployees }) {
  const { state, dispatch, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const navigate = useRouter();

  // Load employees if not passed as props
  const [dbEmployees, setDbEmployees] = useState([]);

  const loadEmployees = async () => {
    try {
      const res = await employeesService.listEmployees({ page: 1, limit: 50 });
      if (res && res.items) {
        setDbEmployees(res.items);
      }
    } catch (e) {
      console.error('Error loading employees in AttendanceView:', e);
    }
  };

  useEffect(() => {
    if (!propEmployees) {
      loadEmployees();
    }
  }, [propEmployees]);

  const employees = useMemo(() => {
    if (propEmployees) return propEmployees;
    return dbEmployees.length > 0
      ? dbEmployees.map(emp => ({
          id: emp.employeeCode || emp.id,
          name: emp.fullName || `${emp.firstName} ${emp.lastName}`.trim(),
          department: typeof emp.department === 'object' ? (emp.department?.name || 'Operations') : (emp.department || 'Operations'),
          designation: emp.jobTitle || 'Staff Member',
          status: emp.status || 'ACTIVE'
        }))
      : [];
  }, [dbEmployees, propEmployees]);

  const leaves = state.leaves || [];
  const shifts = state.shifts || [];

  // Attendance states
  const [selectedStaffSim, setSelectedStaffSim] = useState('');
  useEffect(() => {
    if (employees.length > 0 && !selectedStaffSim) {
      setSelectedStaffSim(employees[0].id);
    }
  }, [employees, selectedStaffSim]);

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

  const loadPunches = async () => {
    if (loadPunchesErrCount.current >= 4) return;
    try {
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
        console.warn('[AttendanceView] Error fetching punches from DB (backoff active):', e?.message || e);
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
      console.error('Error loading punches in AttendanceView:', e);
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

  const handleReassignShift = async (empId) => {
    try {
      await apiClient.patch(`/admin/employees/${empId}`, { shift: newShiftVal });
      await syncData();
      showToast(`Shift updated to ${newShiftVal}!`);
      setEditingShiftEmp(null);
    } catch (err) {
      dispatch({ type: 'UPDATE_SHIFT', payload: { empId, shift: newShiftVal } });
      showToast(`Shift updated to ${newShiftVal}! (local)`);
      setEditingShiftEmp(null);
    }
  };

  // Re-map format for simulation/rendering
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
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    let filtered = logs.filter(log => {
      if (filterPeriod === 'all') return true;
      
      if (filterPeriod === 'today') {
        return log.date === todayStr;
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

  let activePreview = null;
  if (selectedLogPreview) {
    activePreview = selectedLogPreview;
  } else if (formattedLogs.length > 0) {
    activePreview = formattedLogs[0];
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) || 
    emp.id?.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER BAR */}
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

      {/* Attendance tabs - horizontal scroll on small screens */}
      <div 
        className="attendance-tabs-wrapper w-full max-w-full overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ 
          borderBottom: '2px solid #E2E8F0', 
          marginBottom: '8px',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        <div 
          className="attendance-tabs flex w-max min-w-max flex-nowrap gap-2"
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            width: 'max-content',
            minWidth: 'max-content',
            gap: '8px'
          }}
        >
          <button
            onClick={() => setAttendanceSubTab('register')}
            className="shrink-0 whitespace-nowrap"
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              color: attendanceSubTab === 'register' ? '#4F46E5' : '#64748B',
              borderBottom: attendanceSubTab === 'register' ? '2.5px solid #4F46E5' : '2.5px solid transparent',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
              userSelect: 'none'
            }}
          >
            Attendance Register
          </button>
          <button
            onClick={() => setAttendanceSubTab('policies')}
            className="shrink-0 whitespace-nowrap"
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              color: attendanceSubTab === 'policies' ? '#4F46E5' : '#64748B',
              borderBottom: attendanceSubTab === 'policies' ? '2.5px solid #4F46E5' : '2.5px solid transparent',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
              userSelect: 'none'
            }}
          >
            Shift &amp; Grace Policy Management
          </button>
          <button
            onClick={() => setAttendanceSubTab('shifts')}
            className="shrink-0 whitespace-nowrap"
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              color: attendanceSubTab === 'shifts' ? '#4F46E5' : '#64748B',
              borderBottom: attendanceSubTab === 'shifts' ? '2.5px solid #4F46E5' : '2.5px solid transparent',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
              userSelect: 'none'
            }}
          >
            Staff Shift Schedules Board
          </button>
        </div>
      </div>

      {/* SUB TAB: SHIFT & GRACE POLICY MANAGER */}
      {attendanceSubTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
          <div className="app-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Departmental Shift & Grace Policies</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Configure custom work shifts, grace windows, and policy parameters per department. Punches are dynamically audited based on these rules.</span>
            </div>

            <div className="desktop-only hr-table-scroll-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table className="hr-policy-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
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

            {/* Mobile Policy Cards */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(shiftPolicies).map((dept) => {
                const policy = shiftPolicies[dept];
                return (
                  <div
                    key={dept}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                        {dept === 'Default' ? 'Default (Other Depts)' : `${dept} Department`}
                      </strong>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#475569', fontWeight: 700 }}>
                        Grace: {policy.grace}m
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      gap: '8px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 750, color: '#16a34a', textTransform: 'uppercase', display: 'block' }}>Shift Start</span>
                        <strong style={{ fontSize: '13px', color: '#16a34a', fontFamily: 'monospace' }}>{policy.checkIn}</strong>
                      </div>
                      <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '10px', fontWeight: 750, color: '#dc2626', textTransform: 'uppercase', display: 'block' }}>Shift End</span>
                        <strong style={{ fontSize: '13px', color: '#dc2626', fontFamily: 'monospace' }}>{policy.checkOut}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingDeptPolicy(dept);
                        setEditCheckIn(policy.checkIn);
                        setEditCheckOut(policy.checkOut);
                        setEditGrace(policy.grace);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%'
                      }}
                    >
                      <Edit3 size={13} /> Edit Policy Parameters
                    </button>
                  </div>
                );
              })}
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
                      onChange={(e) => setEditGrace(parseInt(e.target.value, 10) || 0)}
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
      )}

      {/* SUB TAB: REGISTER */}
      {attendanceSubTab === 'register' && (
        <>
          {/* METRIC CARDS GRID (4 / 2 / 2 / 1 Grid) */}
          <div className="erp-kpi-grid" style={{ marginBottom: '16px' }}>
            {[
              { label: "Today's Total Logs", value: formattedLogs.length, sub: "Auto-synced from devices", bg: '#F8FAFC', border: '#E2E8F0', text: '#0F172A', icon: <Clock size={20} color="#475569" /> },
              { label: "GPS Verified", value: formattedLogs.filter(l => l.coords).length, sub: "Auto-captured coordinate", bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', icon: <MapPin size={20} color="#0284c7" /> },
              { label: "Biometric Selfies", value: formattedLogs.filter(l => l.selfieUrl || l.punchInSelfieUrl || l.punchOutSelfieUrl).length, sub: "Verified camera captures", bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', icon: <Camera size={20} color="#7c3aed" /> },
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

          {/* MAIN WORKSPACE SPLIT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', alignItems: 'stretch' }}>
            
            {/* Left Column: Attendance Register */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="app-card" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                <div className="hr-attendance-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: '#0F172A' }}>Roster Punch Logs Register</h3>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Select any row below to audit the selfie capture &amp; coordinates</span>
                  </div>
                  <div className="hr-attendance-toolbar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Period Filter Pills */}
                    <div className="hr-attendance-period-pills" style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '2px' }}>
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
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer',
                            background: filterPeriod === period.id ? '#ffffff' : 'transparent',
                            color: filterPeriod === period.id ? '#0F172A' : '#64748B',
                            boxShadow: filterPeriod === period.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap'
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

                    <button 
                      onClick={() => {
                        const csvContent = formattedLogs.map(l => `${l.name},${l.id},${l.punchIn},${l.punchOut},${l.status},${l.location || 'N/A'}`).join('\n');
                        exportToCSV(csvContent, 'attendance-audit-logs.csv');
                      }} 
                      className="hr-attendance-export-btn"
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#475569' }}
                    >
                      <Download size={13} /> Export CSV
                    </button>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="desktop-only">
                  <DataTable 
                    scrollMode={true}
                    columns={[
                      { 
                        header: 'Biometric Photo', 
                        accessor: 'selfieUrl',
                        render: (row) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {row.punchInSelfieUrl || row.punchOutSelfieUrl || row.selfieUrl ? (
                              <SecureImage src={row.punchInSelfieUrl || row.punchOutSelfieUrl || row.selfieUrl} alt="Selfie preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7' }} fallbackText="N/A" allowZoom={false} />
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #cbd5e1' }}>
                                <Camera size={14} color="#64748b" />
                              </div>
                            )}
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: (row.punchInSelfieUrl || row.punchOutSelfieUrl || row.selfieUrl) ? '#0284c7' : '#64748b' }}>
                              {(row.punchInSelfieUrl || row.punchOutSelfieUrl || row.selfieUrl) ? '📸 Verified Photo' : 'Simulated Face'}
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

                {/* Mobile Horizontal Punch Cards List */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formattedLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                      No attendance logs registered for this period.
                    </div>
                  ) : (
                    formattedLogs.map((row, idx) => {
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

                      const isSelected = activePreview?.id === row.id && activePreview?.date === row.date;

                      return (
                        <div
                          key={row.id + (row.date || '') + idx}
                          onClick={() => setSelectedLogPreview(row)}
                          style={{
                            background: isSelected ? '#f0f9ff' : '#ffffff',
                            border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '14px',
                            boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Top: Avatar/Photo + Name + ID + Status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {row.punchInSelfieUrl || row.punchOutSelfieUrl || row.selfieUrl ? (
                                <SecureImage src={row.punchInSelfieUrl || row.punchOutSelfieUrl || row.selfieUrl} alt="Selfie preview" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7', flexShrink: 0 }} fallbackText="N/A" allowZoom={false} />
                              ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #cbd5e1', flexShrink: 0 }}>
                                  <Camera size={16} color="#64748b" />
                                </div>
                              )}
                              <div>
                                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{row.name}</strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                                    {row.id}
                                  </code>
                                  {row.department && <span style={{ fontSize: '11px', color: '#64748b' }}>• {row.department}</span>}
                                </div>
                              </div>
                            </div>
                            <span style={{ 
                              padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                              background: bg, color: color, border: `1px solid ${border}`, whiteSpace: 'nowrap'
                            }}>
                              {row.status}
                            </span>
                          </div>

                          {/* Date & Location */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                            <span>📅 {row.date || 'Today'}</span>
                            {row.coords ? (
                              <span style={{ color: '#0284c7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11.5px' }}>
                                <MapPin size={12} /> {row.location || 'GPS Verified'}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '11px' }}>No GPS</span>
                            )}
                          </div>

                          {/* Punch In / Out 2-Column Grid Strip */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            gap: '8px',
                            textAlign: 'center'
                          }}>
                            <div>
                              <span style={{ fontSize: '10px', fontWeight: 750, color: '#16a34a', textTransform: 'uppercase', display: 'block' }}>Punch In</span>
                              <strong style={{ fontSize: '13px', color: row.punchIn !== '—' ? '#16A34A' : '#94a3b8', fontFamily: 'monospace' }}>
                                {row.punchIn}
                              </strong>
                            </div>
                            <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '10px', fontWeight: 750, color: '#dc2626', textTransform: 'uppercase', display: 'block' }}>Punch Out</span>
                              <strong style={{ fontSize: '13px', color: row.punchOut !== '—' ? '#DC2626' : '#94a3b8', fontFamily: 'monospace' }}>
                                {row.punchOut}
                              </strong>
                            </div>
                          </div>

                          {/* Tap to inspect badge / button */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '11.5px' }}>
                            <span style={{ color: isSelected ? '#0284c7' : '#64748b', fontWeight: 700 }}>
                              {isSelected ? '✓ Biometric Preview Active' : '🔍 Tap to inspect biometric selfie'}
                            </span>
                            <span style={{ color: '#0284c7', fontWeight: 800 }}>View Details →</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: High-tech Biometric Selfie Monitor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
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
                          <SecureImage src={activePreview.punchInSelfieUrl} alt="Punch In Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} fallbackText="Selfie Missing" />
                          <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.75)', color: '#10B981', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)', letterSpacing: '0.5px' }}>PUNCH IN</div>
                        </div>
                      ) : null}
                      {activePreview?.punchOutSelfieUrl ? (
                        <div style={{ flex: 1, position: 'relative', height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                          <SecureImage src={activePreview.punchOutSelfieUrl} alt="Punch Out Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} fallbackText="Selfie Missing" />
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
                        <SecureImage src={activePreview.selfieUrl} alt="Webcam Capture" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} fallbackText="Selfie Missing" />
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#64748B', padding: '24px' }}>
                        <Camera size={44} color="#334155" style={{ display: 'block', margin: '0 auto 12px auto' }} />
                        <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#0EA5E9', fontWeight: '800', display: 'block', marginBottom: '8px' }}>BIOMETRIC SCANNER READY</span>
                        <span style={{ fontSize: '12px', color: '#475569' }}>Select employee check-in log to inspect photo capture</span>
                      </div>
                    )
                  )}
                  
                  {/* Overlay secure capture badge */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#fff', textTransform: 'uppercase' }}>SECURE CAPTURE</span>
                  </div>
                </div>

                {/* Details card */}
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

      {/* SUB TAB: SHIFT BOARD */}
      {attendanceSubTab === 'shifts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Timing/Summaries Header Bar */}
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

          {/* Shift Workforce Distribution Table */}
          <div className="app-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-heading" style={{ margin: 0 }}>Current Workforce Distribution by Shift</h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Total Staff: {employees.length} Employees</span>
            </div>

            <div className="desktop-only erp-table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
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
                  {[
                    {
                      shift: 'General Shift (HR/Finance/Other)',
                      employees: employees.filter(e => e.department === 'HR' || e.department === 'Finance').length || Math.max(0, employees.length - employees.filter(e => e.department === 'Sales' || e.department === 'Production').length),
                      present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('On Time')).length,
                      late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Late')).length,
                      timing: `${shiftPolicies['Default']?.checkIn || '09:00 AM'} - ${shiftPolicies['Default']?.checkOut || '06:00 PM'}`,
                      status: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Late')).length > 3 ? 'Attention' : 'Optimal'
                    },
                    {
                      shift: 'Sales Shift',
                      employees: employees.filter(e => e.department === 'Sales').length,
                      present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Sales')).length,
                      late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Sales') && l.status?.includes('Late')).length,
                      timing: `${shiftPolicies['Sales']?.checkIn || '09:30 AM'} - ${shiftPolicies['Sales']?.checkOut || '06:30 PM'}`,
                      status: 'Optimal'
                    },
                    {
                      shift: 'Production Shift',
                      employees: employees.filter(e => e.department === 'Production').length,
                      present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Production')).length,
                      late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Production') && l.status?.includes('Late')).length,
                      timing: `${shiftPolicies['Production']?.checkIn || '08:00 AM'} - ${shiftPolicies['Production']?.checkOut || '05:00 PM'}`,
                      status: 'Optimal'
                    }
                  ].map((row) => (
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

            {/* Mobile Shift Distribution Cards */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  shift: 'General Shift (HR/Finance/Other)',
                  employees: employees.filter(e => e.department === 'HR' || e.department === 'Finance').length || Math.max(0, employees.length - employees.filter(e => e.department === 'Sales' || e.department === 'Production').length),
                  present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('On Time')).length,
                  late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Late')).length,
                  timing: `${shiftPolicies['Default']?.checkIn || '09:00 AM'} - ${shiftPolicies['Default']?.checkOut || '06:00 PM'}`,
                  status: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Late')).length > 3 ? 'Attention' : 'Optimal'
                },
                {
                  shift: 'Sales Shift',
                  employees: employees.filter(e => e.department === 'Sales').length,
                  present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Sales')).length,
                  late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Sales') && l.status?.includes('Late')).length,
                  timing: `${shiftPolicies['Sales']?.checkIn || '09:30 AM'} - ${shiftPolicies['Sales']?.checkOut || '06:30 PM'}`,
                  status: 'Optimal'
                },
                {
                  shift: 'Production Shift',
                  employees: employees.filter(e => e.department === 'Production').length,
                  present: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Production')).length,
                  late: formattedLogs.filter(l => l.punchIn !== '—' && l.status?.includes('Production') && l.status?.includes('Late')).length,
                  timing: `${shiftPolicies['Production']?.checkIn || '08:00 AM'} - ${shiftPolicies['Production']?.checkOut || '05:00 PM'}`,
                  status: 'Optimal'
                }
              ].map((row) => (
                <div
                  key={row.shift}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{row.shift}</strong>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800',
                      background: row.status === 'Optimal' ? '#dcfce7' : '#fee2e2',
                      color: row.status === 'Optimal' ? '#15803d' : '#b91c1c'
                    }}>
                      {row.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    ⏱️ Timing: <strong>{row.timing}</strong>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '8px',
                    padding: '8px',
                    gap: '4px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Staff</span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{row.employees}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Present</span>
                      <strong style={{ fontSize: '13px', color: '#16a34a' }}>{row.present}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Late</span>
                      <strong style={{ fontSize: '13px', color: row.late > 5 ? '#ef4444' : '#f59e0b' }}>{row.late}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Shift Templates */}
          <div className="app-card">
            <h3 className="card-heading" style={{ marginBottom: '16px' }}>Active Corporate Shift Templates</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                { id: 'General', label: 'General Shift', hours: `${shiftPolicies['Default']?.checkIn || '09:00 AM'} - ${shiftPolicies['Default']?.checkOut || '06:00 PM'}`, grace: `+${shiftPolicies['Default']?.grace || 15} mins`, type: 'Full-time standard' },
                { id: 'Sales', label: 'Sales Shift', hours: `${shiftPolicies['Sales']?.checkIn || '09:30 AM'} - ${shiftPolicies['Sales']?.checkOut || '06:30 PM'}`, grace: `+${shiftPolicies['Sales']?.grace || 30} mins`, type: 'Full-time standard' },
                { id: 'Production', label: 'Production Shift', hours: `${shiftPolicies['Production']?.checkIn || '08:00 AM'} - ${shiftPolicies['Production']?.checkOut || '05:00 PM'}`, grace: `+${shiftPolicies['Production']?.grace || 10} mins`, type: 'Full-time standard' }
              ].map(temp => (
                <div key={temp.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{temp.label}</strong>
                    <button onClick={() => showToast(`Edit template for ${temp.label}`)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                  </div>
                  <h4 style={{ fontSize: '15px', margin: '4px 0', color: '#0ea5e9', fontWeight: '800' }}>{temp.hours}</h4>
                  <p style={{ fontSize: '11px', color: '#5E6B82', margin: '4px 0 0 0' }}>
                    Grace window: {temp.grace} | Type: {temp.type}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Schedules Table */}
          <div className="app-card">
            <h3 className="card-heading" style={{ marginBottom: '16px' }}>Staff Shift Schedules Board</h3>
            
            {/* Desktop DataTable */}
            <div className="desktop-only">
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

            {/* Mobile Schedules Cards */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shifts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b', fontSize: '13px' }}>
                  No staff shift configurations logged.
                </div>
              ) : (
                shifts.map((row, idx) => (
                  <div
                    key={row.empId || idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{row.name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                            {row.empId}
                          </code>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>• {row.department}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{row.role}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Shift:</span>
                      <strong style={{ fontSize: '12px', color: '#0284c7' }}>{row.shift || 'General Shift'}</strong>
                    </div>

                    <button 
                      type="button"
                      style={{
                        background: '#0284c7',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%'
                      }}
                      onClick={() => {
                        setEditingShiftEmp(row.empId);
                        setNewShiftVal(row.shift || 'General Shift');
                      }}
                    >
                      Reassign Shift
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reassignment Mini-Modal Popover */}
          {editingShiftEmp && (
            <div className="modal-overlay active" onClick={() => setEditingShiftEmp(null)} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)' }}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '350px', background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="modal-title-text" style={{ margin: 0, fontWeight: '800' }}>Reassign Staff Shift</h3>
                  <button className="modal-close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setEditingShiftEmp(null)}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label className="form-label">Select Template Shift</label>
                  <select value={newShiftVal} onChange={(e) => setNewShiftVal(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}>
                    <option value="General Shift">General Shift (09:00 AM - 06:00 PM)</option>
                    <option value="Morning Shift">Morning Shift (06:00 AM - 02:00 PM)</option>
                    <option value="Night Shift">Night Shift (10:00 PM - 06:00 AM)</option>
                  </select>
                  <button 
                    className="action-btn"
                    style={{ background: 'var(--color-primary, #4F46E5)', border: 'none', padding: '10px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
                    onClick={() => handleReassignShift(editingShiftEmp)}
                  >
                    Assign Shift
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
