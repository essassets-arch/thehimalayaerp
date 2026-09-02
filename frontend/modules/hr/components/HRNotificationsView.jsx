'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/notificationStore';
import { useERP } from '../../../shared/context/ERPContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { getBackendAssetUrl } from '../../../lib/assetUrl';
import { employeesService } from '../../../services/hr/employeesService';
import { 
  Bell, Calendar, Clock, CheckCircle2, AlertTriangle, UserCheck, 
  ArrowRight, ShieldCheck, FileText, UserX, CreditCard, ChevronRight, 
  Check, X, Filter, RefreshCw, Send, Megaphone, Users, User, ShieldAlert, 
  Sparkles, CheckSquare, Search, AtSign
} from 'lucide-react';

export default function HRNotificationsView() {
  const navigate = useRouter();
  const { state, dispatch, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  
  // Main view mode: 'broadcast' (Announcement broadcast & delivery history) or 'approvals' (HR Action Center)
  const [mainSection, setMainSection] = useState('broadcast');

  // Recipient Target Mode: 'DEPARTMENT' (Role/Dept broadcast) vs 'USER_WISE' (Specific staff / users)
  const [recipientMode, setRecipientMode] = useState('DEPARTMENT');

  // Roster & employee list
  const [employees, setEmployees] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // User-wise search & selection
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Broadcast composer state
  const [notifComposer, setNotifComposer] = useState({
    title: '',
    message: '',
    priority: 'High',
    route: '/notifications'
  });
  const [selectedNotifDepts, setSelectedNotifDepts] = useState(['ALL']);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('ALL');

  // HR Action Center states
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [processedAlerts, setProcessedAlerts] = useState({});

  const DEPARTMENTS = [
    { code: 'SALES_EXECUTIVE', name: 'Sales' },
    { code: 'PRODUCTION_PLANNER', name: 'Production' },
    { code: 'STORE_MANAGER', name: 'Store' },
    { code: 'QC_INSPECTOR', name: 'QC' },
    { code: 'DISPATCH_EXECUTIVE', name: 'Dispatch' },
    { code: 'FINANCE_EXECUTIVE', name: 'Finance' },
    { code: 'HR', name: 'HR' },
    { code: 'PLANT_HEAD', name: 'Plant Head' },
    { code: 'SUPER_ADMIN', name: 'Management' }
  ];

  // Fetch employees and users
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingEmployees(true);
        const [empRes, userRes] = await Promise.allSettled([
          employeesService.listEmployees({ page: 1, limit: 200 }),
          apiClient.get('/admin/users')
        ]);

        if (empRes.status === 'fulfilled' && empRes.value?.items) {
          setEmployees(empRes.value.items);
        }
        if (userRes.status === 'fulfilled') {
          const uData = Array.isArray(userRes.value) ? userRes.value : (userRes.value?.data || []);
          setSystemUsers(uData);
        }
      } catch (err) {
        console.error('Error fetching employees/users in HR notifications:', err);
      } finally {
        setLoadingEmployees(false);
      }
    }
    loadData();
  }, []);

  // Merged selectable staff directory
  const selectableStaff = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // Add employees
    employees.forEach(emp => {
      const uId = emp.userId || emp.id || emp.employeeCode;
      if (!seenIds.has(uId)) {
        seenIds.add(uId);
        list.push({
          id: emp.userId || emp.id,
          employeeId: emp.id,
          employeeCode: emp.employeeCode || emp.id,
          name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff Member',
          email: emp.workEmail || emp.email || '—',
          department: typeof emp.department === 'object' ? (emp.department?.name || 'Operations') : (emp.department || 'Operations'),
          designation: emp.jobTitle || 'Staff Member',
          avatar: emp.selfieUrl || null
        });
      }
    });

    // Add any standalone system users
    systemUsers.forEach(u => {
      if (!seenIds.has(u.id)) {
        seenIds.add(u.id);
        list.push({
          id: u.id,
          employeeId: u.id,
          employeeCode: u.employeeCode || `USR-${u.id.slice(0, 4)}`,
          name: u.name || u.fullName || u.email?.split('@')[0] || 'User',
          email: u.email || '—',
          department: u.role?.name || u.role || 'Staff',
          designation: u.role?.name || u.role || 'User',
          avatar: null
        });
      }
    });

    return list;
  }, [employees, systemUsers]);

  // Filtered selectable staff by search term
  const filteredSelectableStaff = useMemo(() => {
    if (!userSearchQuery.trim()) return selectableStaff;
    const q = userSearchQuery.toLowerCase();
    return selectableStaff.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.employeeCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [selectableStaff, userSearchQuery]);

  // Fetch broadcast history
  const fetchBroadcastHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await apiClient.get('/notifications/broadcast-history');
      if (res && res.success && Array.isArray(res.data)) {
        setBroadcastHistory(res.data);
      } else if (Array.isArray(res)) {
        setBroadcastHistory(res);
      } else if (res && res.items && Array.isArray(res.items)) {
        setBroadcastHistory(res.items);
      }
    } catch (err) {
      console.warn('Failed to fetch broadcast history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcastHistory();
  }, [fetchBroadcastHistory]);

  const isAllDeptsSelected = selectedNotifDepts.includes('ALL');

  const toggleDept = (code) => {
    if (code === 'ALL') {
      if (isAllDeptsSelected) {
        setSelectedNotifDepts([]);
      } else {
        setSelectedNotifDepts(['ALL']);
      }
    } else {
      let updated = [...selectedNotifDepts].filter(x => x !== 'ALL');
      if (updated.includes(code)) {
        updated = updated.filter(x => x !== code);
      } else {
        updated.push(code);
      }
      setSelectedNotifDepts(updated);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const selectAllUsers = () => {
    const allIds = filteredSelectableStaff.map(s => s.id);
    setSelectedUserIds(allIds);
  };

  const clearAllUsers = () => {
    setSelectedUserIds([]);
  };

  // Handle Broadcast / User-Wise Submission
  const handleSendNotification = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!notifComposer.title.trim() || !notifComposer.message.trim()) {
      showToast('Please specify an announcement title and message body.');
      return;
    }

    if (recipientMode === 'DEPARTMENT' && selectedNotifDepts.length === 0) {
      showToast('Please select at least one department or All Departments.');
      return;
    }

    if (recipientMode === 'USER_WISE' && selectedUserIds.length === 0) {
      showToast('Please select at least one employee/user to receive the notification.');
      return;
    }

    try {
      setSendingBroadcast(true);
      const payload = {
        title: notifComposer.title.trim(),
        message: notifComposer.message.trim(),
        priority: notifComposer.priority || 'High',
        route: notifComposer.route || '/notifications'
      };

      if (recipientMode === 'USER_WISE') {
        payload.userIds = selectedUserIds;
      } else {
        payload.roleCodes = selectedNotifDepts;
      }

      const res = await apiClient.post('/notifications/broadcast', payload);
      const targetCount = recipientMode === 'USER_WISE' ? selectedUserIds.length : (isAllDeptsSelected ? 'All' : selectedNotifDepts.length);
      showToast(`Notification sent successfully to ${recipientMode === 'USER_WISE' ? `${targetCount} selected user(s)` : `${targetCount} department(s)`}! 📢`);
      
      setNotifComposer({
        title: '',
        message: '',
        priority: 'High',
        route: '/notifications'
      });
      setSelectedNotifDepts(['ALL']);
      setSelectedUserIds([]);
      
      await syncData();
      await fetchBroadcastHistory();
    } catch (err) {
      console.error('Failed to send announcement:', err);
      showToast(`Failed to send notification: ${err.message || 'Server error'}`);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Pre-configured rich HR approval alerts linked to staff members
  const initialAlerts = [
    {
      id: 'AL-101',
      title: 'Leave Application Pending Approval',
      message: 'Ramanathan Swamy has submitted a 3-day Casual Leave request starting 18-Jun-2026.',
      date: 'Today, 10:45 AM',
      type: 'LEAVE',
      severity: 'WARNING',
      employeeCode: 'EMP-001',
      empName: 'Ramanathan Swamy',
      details: {
        leaveType: 'Casual Leave',
        startDate: '18-Jun-2026',
        endDate: '20-Jun-2026',
        days: 3,
        reason: 'Family event in native hometown',
        substitute: 'Raj Patel'
      }
    },
    {
      id: 'AL-102',
      title: 'Manual Attendance Override Request',
      message: 'Raj Patel submitted a punch-in correction request for 17-Aug-2026 (Forgot Selfie Punch).',
      date: 'Today, 09:15 AM',
      type: 'ATTENDANCE',
      severity: 'INFO',
      employeeCode: 'EMP-002',
      empName: 'Raj Patel',
      details: {
        requestDate: '17-Aug-2026',
        requestedPunchIn: '09:00 AM',
        requestedPunchOut: '05:30 PM',
        reason: 'Biometric device camera timeout at security gate',
        supervisorApproved: true
      }
    },
    {
      id: 'AL-103',
      title: 'Exit Process Clearance Checkpoint',
      message: 'Neha Shah clearance checkpoint is in progress. 75% departmental clearance completed.',
      date: 'Yesterday, 04:20 PM',
      type: 'EXIT',
      severity: 'CRITICAL',
      employeeCode: 'EMP-005',
      empName: 'Neha Shah',
      details: {
        resignationDate: '01-May-2026',
        lastWorkingDay: '30-Jun-2026',
        clearanceProgress: '75%',
        pendingDepts: ['IT Assets Return', 'Store No-Dues']
      }
    },
    {
      id: 'AL-104',
      title: 'Payroll Bank Details Verification',
      message: 'Amit Sharma updated Bank IFSC & Account Number for salary credit.',
      date: '15-Aug-2026',
      type: 'PAYROLL',
      severity: 'SUCCESS',
      employeeCode: 'EMP-003',
      empName: 'Amit Sharma',
      details: {
        bankName: 'HDFC Bank Ltd',
        accountNumber: '•••• •••• 9842',
        ifscCode: 'HDFC0000128',
        verificationStatus: 'Pending HR Sign-off'
      }
    }
  ];

  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert) {
      setSelectedAlert(alerts[0]);
    }
  }, [alerts, selectedAlert]);

  const filteredAlerts = alerts.filter(al => {
    if (activeTab === 'ALL') return true;
    return al.type === activeTab;
  });

  const filteredHistory = broadcastHistory.filter(item => {
    if (historyFilter === 'ALL') return true;
    if (historyFilter === 'READ') return item.status === 'READ' || item.isRead;
    if (historyFilter === 'UNREAD') return item.status !== 'READ' && !item.isRead;
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', pill: '#EF4444', icon: AlertTriangle };
      case 'WARNING':
        return { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', pill: '#F59E0B', icon: Calendar };
      case 'SUCCESS':
        return { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', pill: '#10B981', icon: CheckCircle2 };
      default:
        return { bg: '#F0F9FF', border: '#7DD3FC', text: '#075985', pill: '#0EA5E9', icon: Clock };
    }
  };

  const selectedEmp = selectedAlert 
    ? employees.find(e => 
        e.employeeCode === selectedAlert.employeeCode || 
        e.id === selectedAlert.employeeCode ||
        e.fullName?.toLowerCase().includes(selectedAlert.empName?.toLowerCase())
      )
    : null;

  const handleAction = (alertId, actionName) => {
    setProcessedAlerts(prev => ({ ...prev, [alertId]: actionName }));
    showToast(`Action "${actionName}" recorded for checkpoint ${alertId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-sans, system-ui, -apple-system)', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      
      {/* ── TOP HEADER BANNER & STATS ── */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
        borderRadius: '16px', 
        padding: '24px 28px', 
        color: '#FFFFFF', 
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Megaphone size={22} color="#38BDF8" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              HR Corporate Notifications &amp; User-Wise Alerts
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
            Send announcements to specific users or entire departments, deliver real-time push alerts, and track read confirmations.
          </p>
        </div>

        {/* Quick KPI Stats */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(8px)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Notifications Sent</span>
            <strong style={{ fontSize: '20px', color: '#F8FAFC', fontWeight: '800' }}>{broadcastHistory.length}</strong>
          </div>
          <div style={{ background: 'rgba(14, 165, 233, 0.15)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
            <span style={{ fontSize: '11px', color: '#BAE6FD', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Registered Staff</span>
            <strong style={{ fontSize: '20px', color: '#38BDF8', fontWeight: '800' }}>{selectableStaff.length || '—'}</strong>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '11px', color: '#FDE68A', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Approval Alerts</span>
            <strong style={{ fontSize: '20px', color: '#FBBF24', fontWeight: '800' }}>{alerts.length}</strong>
          </div>
        </div>
      </div>

      {/* ── SECTION SWITCHER TABS ── */}
      <div 
        className="w-full max-w-full overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ 
          borderBottom: '2px solid #E2E8F0', 
          marginBottom: '4px',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'nowrap', width: 'max-content', minWidth: 'max-content', gap: '8px' }}>
          <button
            onClick={() => setMainSection('broadcast')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              color: mainSection === 'broadcast' ? '#0284C7' : '#64748B',
              borderBottom: mainSection === 'broadcast' ? '3px solid #0284C7' : '3px solid transparent',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}
          >
            <Megaphone size={16} /> Notification Center (Department &amp; User-Wise)
          </button>

          <button
            onClick={() => setMainSection('approvals')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              color: mainSection === 'approvals' ? '#0284C7' : '#64748B',
              borderBottom: mainSection === 'approvals' ? '3px solid #0284C7' : '3px solid transparent',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}
          >
            <ShieldAlert size={16} /> HR Action Center &amp; Approval Alerts ({alerts.length})
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: BROADCAST & USER-WISE NOTIFICATIONS                   */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {mainSection === 'broadcast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px', width: '100%', alignItems: 'start' }}>
            
            {/* Column 1: Compose Notification Form */}
            <form onSubmit={handleSendNotification} className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', margin: 0, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
                    📢 Compose &amp; Dispatch Notification
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Deliver real-time in-app bell alerts and instant push notifications to staff.
                  </span>
                </div>
              </div>

              {/* Recipient Targeting Mode Selector (Department-wise vs User-wise) */}
              <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setRecipientMode('DEPARTMENT')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    background: recipientMode === 'DEPARTMENT' ? '#ffffff' : 'transparent',
                    color: recipientMode === 'DEPARTMENT' ? '#0284c7' : '#64748b',
                    boxShadow: recipientMode === 'DEPARTMENT' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Users size={14} /> Department / Role Broadcast
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientMode('USER_WISE')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    background: recipientMode === 'USER_WISE' ? '#ffffff' : 'transparent',
                    color: recipientMode === 'USER_WISE' ? '#0284c7' : '#64748b',
                    boxShadow: recipientMode === 'USER_WISE' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <User size={14} /> 👤 User-Wise / Individual Staff ({selectedUserIds.length})
                </button>
              </div>
              
              {/* Title & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                    Notification Title *
                  </label>
                  <input
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="e.g. Performance Review Submission / Shift Update"
                    value={notifComposer.title} 
                    onChange={e => setNotifComposer({ ...notifComposer, title: e.target.value })}
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                    Urgency Priority
                  </label>
                  <select
                    className="form-select"
                    value={notifComposer.priority}
                    onChange={e => setNotifComposer({ ...notifComposer, priority: e.target.value })}
                    style={{ marginTop: '6px', fontWeight: '700' }}
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Normal">🔵 Normal Priority</option>
                    <option value="Urgent">⚡ Critical / Urgent</option>
                    <option value="Low">⚪ General Notice</option>
                  </select>
                </div>
              </div>

              {/* TARGET SELECTION A: DEPARTMENT WISE */}
              {recipientMode === 'DEPARTMENT' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b', margin: 0 }}>
                      Target Departments *
                    </label>
                    <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                      {isAllDeptsSelected ? 'All Active Employees' : `${selectedNotifDepts.length} Dept(s) Selected`}
                    </span>
                  </div>
                  
                  {/* Select All Toggle */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => toggleDept('ALL')}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        border: '1.5px solid ' + (isAllDeptsSelected ? '#0284c7' : '#cbd5e1'),
                        background: isAllDeptsSelected ? '#e0f2fe' : '#ffffff',
                        color: isAllDeptsSelected ? '#0369a1' : '#475569',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Users size={14} /> 📢 All Users &amp; Departments (Global)
                    </button>
                  </div>

                  {/* Checkbox Grid for individual selection */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    {DEPARTMENTS.map(dept => {
                      const isChecked = isAllDeptsSelected || selectedNotifDepts.includes(dept.code);
                      return (
                        <label key={dept.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isAllDeptsSelected ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isAllDeptsSelected}
                            onChange={() => toggleDept(dept.code)}
                            style={{ width: '16px', height: '16px', cursor: isAllDeptsSelected ? 'not-allowed' : 'pointer', accentColor: '#0284c7' }}
                          />
                          {dept.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TARGET SELECTION B: USER-WISE SELECTION */}
              {recipientMode === 'USER_WISE' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b', margin: 0 }}>
                      Select Target Staff / Users *
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '800', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                        {selectedUserIds.length} Selected
                      </span>
                      <button
                        type="button"
                        onClick={selectAllUsers}
                        style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                      >
                        Select All
                      </button>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <button
                        type="button"
                        onClick={clearAllUsers}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Search filter for staff */}
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search employee by name, code, role or department..."
                      value={userSearchQuery}
                      onChange={e => setUserSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px 7px 32px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', background: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Scrollable list of staff members with checkboxes */}
                  <div style={{ maxHeight: '220px', overflowY: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {loadingEmployees && selectableStaff.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                        Loading staff directory...
                      </div>
                    ) : filteredSelectableStaff.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                        No employees found matching "{userSearchQuery}".
                      </div>
                    ) : (
                      filteredSelectableStaff.map(staff => {
                        const isChecked = selectedUserIds.includes(staff.id);
                        return (
                          <div
                            key={staff.id}
                            onClick={() => toggleUserSelection(staff.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: isChecked ? '#e0f2fe' : '#ffffff',
                              border: isChecked ? '1px solid #7dd3fc' : '1px solid #f1f5f9',
                              cursor: 'pointer',
                              transition: 'all 0.1s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by container onClick
                                style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                              />
                              <div>
                                <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block' }}>
                                  {staff.name}
                                </strong>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  {staff.employeeCode} • {staff.designation} ({staff.department})
                                </span>
                              </div>
                            </div>

                            <span style={{ fontSize: '10.5px', color: isChecked ? '#0369a1' : '#94a3b8', fontWeight: '700' }}>
                              {isChecked ? '✓ Selected' : '+ Add'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Message Details Body */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                  Notification Message Details *
                </label>
                <textarea
                  required 
                  className="form-input" 
                  rows="4" 
                  placeholder={recipientMode === 'USER_WISE' ? "Type specific instructions or personalized notification message..." : "Type the corporate announcement message details here..."}
                  value={notifComposer.message} 
                  onChange={e => setNotifComposer({ ...notifComposer, message: e.target.value })}
                  style={{ marginTop: '6px', resize: 'vertical' }}
                />
              </div>

              {/* Destination Route (Optional) */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#64748b' }}>
                  Optional Action Link (Deep Link)
                </label>
                <input
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. /hr/attendance or /notifications"
                  value={notifComposer.route} 
                  onChange={e => setNotifComposer({ ...notifComposer, route: e.target.value })}
                  style={{ marginTop: '4px', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '4px' }}>
                <button 
                  type="submit" 
                  disabled={sendingBroadcast}
                  className="action-btn" 
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '11px 22px', 
                    borderRadius: '8px', 
                    fontWeight: '800', 
                    fontSize: '13px',
                    cursor: sendingBroadcast ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={15} /> 
                  {sendingBroadcast 
                    ? 'Sending Notification...' 
                    : recipientMode === 'USER_WISE' 
                      ? `Send to ${selectedUserIds.length} User(s)` 
                      : 'Broadcast Announcement'}
                </button>
              </div>
            </form>

            {/* Column 2: Live Broadcast & Notification Delivery Log */}
            <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', margin: 0, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
                    Notification Stream &amp; Delivery Log
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Live status of all sent notifications with recipient read confirmations.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={historyFilter}
                    onChange={e => setHistoryFilter(e.target.value)}
                    style={{ fontSize: '11.5px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155' }}
                  >
                    <option value="ALL">All ({broadcastHistory.length})</option>
                    <option value="READ">Read</option>
                    <option value="UNREAD">Unread</option>
                  </select>

                  <button
                    type="button"
                    onClick={fetchBroadcastHistory}
                    disabled={loadingHistory}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0284c7', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={12} className={loadingHistory ? 'spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {loadingHistory && broadcastHistory.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                  <RefreshCw size={24} className="spin" color="#0284c7" style={{ display: 'block', margin: '0 auto 12px auto' }} />
                  Loading delivery stream...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                  <Bell size={32} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 10px auto' }} />
                  No notification history records found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '540px', overflowY: 'auto', paddingRight: '4px', width: '100%', minWidth: 0 }}>
                  {filteredHistory.map((notif, idx) => {
                    const isRead = notif.status === 'READ' || notif.isRead;
                    return (
                      <div key={idx} style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: isRead ? '#f8fafc' : '#ffffff', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 'fit-content', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800' }}>{notif.title}</strong>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>
                          {notif.message}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                          <div>
                            Recipient: <strong style={{ color: '#334155' }}>{notif.recipientName || 'Staff Member'}</strong> {notif.recipientRole ? `(${notif.recipientRole})` : ''}
                          </div>
                          <div>
                            <span style={{ background: isRead ? '#dcfce7' : '#fee2e2', color: isRead ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                              {isRead ? '✓ Read' : '● Unread'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: HR ACTION CENTER & APPROVAL ALERTS                    */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {mainSection === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filter sub-tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div 
              className="erp-tab-scroll-bar hr-notif-tab-bar" 
              style={{ 
                display: 'flex', 
                gap: '8px', 
                background: '#F1F5F9', 
                padding: '4px', 
                borderRadius: '12px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              {[
                { id: 'ALL', label: 'All Alerts' },
                { id: 'LEAVE', label: 'Leave Applications' },
                { id: 'ATTENDANCE', label: 'Attendance Overrides' },
                { id: 'EXIT', label: 'Exit Clearance' },
                { id: 'PAYROLL', label: 'Payroll Verification' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                    color: activeTab === tab.id ? '#0F172A' : '#64748B',
                    boxShadow: activeTab === tab.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    userSelect: 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
              Showing {filteredAlerts.length} of {alerts.length} action items
            </span>
          </div>

          {/* Action Center Grid: List + Inspector */}
          <div className="hr-notifications-view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', alignItems: 'start' }}>
            
            {/* Left Column: Notification Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAlerts.length === 0 ? (
                <div className="app-card" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <Bell size={36} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: '700', margin: '0 0 4px 0', color: '#334155' }}>No alerts in this category</p>
                  <span style={{ fontSize: '12px' }}>All pending action items for this category have been processed.</span>
                </div>
              ) : (
                filteredAlerts.map(al => {
                  const sev = getSeverityStyle(al.severity);
                  const isSelected = selectedAlert?.id === al.id;
                  const isProcessed = processedAlerts[al.id];
                  const IconComp = sev.icon;

                  return (
                    <div
                      key={al.id}
                      onClick={() => setSelectedAlert(al)}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '14px',
                        padding: '16px 20px',
                        border: '1.5px solid',
                        borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                        boxShadow: isSelected ? '0 8px 20px -4px rgba(2, 132, 199, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Left severity accent bar */}
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px', background: sev.pill }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            background: sev.bg, 
                            color: sev.text, 
                            fontSize: '10.5px', 
                            fontWeight: '800', 
                            padding: '3px 9px', 
                            borderRadius: '6px', 
                            border: `1px solid ${sev.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <IconComp size={12} /> {al.type}
                          </span>

                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                            {al.employeeCode}
                          </span>
                        </div>

                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
                          {al.date}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                        {al.title}
                      </h3>

                      <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                        {al.message}
                      </p>

                      {/* Inline Action Pills */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                        <span style={{ fontSize: '11.5px', color: '#0284C7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Staff: {al.empName}
                        </span>

                        {isProcessed ? (
                          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '800', background: '#DCFCE7', padding: '3px 8px', borderRadius: '6px' }}>
                            ✓ {isProcessed}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            Inspect Details <ChevronRight size={14} color="#0284C7" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Detailed Staff Profile & Action Inspector */}
            <div className="hr-notifications-inspector" style={{ position: 'sticky', top: '20px' }}>
              <div className="app-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', background: '#FFFFFF' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={18} color="#0284C7" /> Staff Profile &amp; Action Inspector
                  </h2>
                  {selectedAlert && (
                    <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                      ID: {selectedAlert.id}
                    </span>
                  )}
                </div>

                {selectedAlert ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    
                    {/* Staff Info Banner */}
                    <div style={{ 
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px'
                    }}>
                      {selectedEmp?.selfieUrl ? (
                        <img 
                          src={getBackendAssetUrl(selectedEmp.selfieUrl)} 
                          alt={selectedAlert.empName}
                          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284C7' }} 
                        />
                      ) : (
                        <div style={{ 
                          width: '52px', 
                          height: '52px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', 
                          color: '#FFFFFF', 
                          fontWeight: '800', 
                          fontSize: '18px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
                        }}>
                          {selectedAlert.empName.charAt(0)}
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: '0 0 2px 0' }}>
                          {selectedEmp ? selectedEmp.fullName : selectedAlert.empName}
                        </h3>
                        <span style={{ fontSize: '12px', color: '#0284C7', fontWeight: '700', display: 'block' }}>
                          Code: {selectedAlert.employeeCode} • {selectedEmp?.jobTitle || selectedEmp?.department?.name || 'Corporate Staff'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          {selectedEmp?.workEmail || 'Email Verified'}
                        </span>
                      </div>
                    </div>

                    {/* Key Employee Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ background: '#FAF5FF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #F3E8FF' }}>
                        <span style={{ fontSize: '10.5px', color: '#7E22CE', fontWeight: '700', display: 'block' }}>Department</span>
                        <strong style={{ fontSize: '12.5px', color: '#581C87' }}>
                          {selectedEmp?.department?.name || selectedEmp?.department || 'Operations'}
                        </strong>
                      </div>
                      <div style={{ background: '#ECFDF5', padding: '10px 12px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                        <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: '700', display: 'block' }}>Attendance Rate</span>
                        <strong style={{ fontSize: '12.5px', color: '#065F46' }}>96.5% (Optimal)</strong>
                      </div>
                      <div style={{ background: '#EFF6FF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                        <span style={{ fontSize: '10.5px', color: '#1D4ED8', fontWeight: '700', display: 'block' }}>Base Salary</span>
                        <strong style={{ fontSize: '12.5px', color: '#1E40AF' }}>
                          ₹{selectedEmp?.baseSalary ? Number(selectedEmp.baseSalary).toLocaleString('en-IN') : '25,000'} / mo
                        </strong>
                      </div>
                      <div style={{ background: '#FFF7ED', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                        <span style={{ fontSize: '10.5px', color: '#C2410C', fontWeight: '700', display: 'block' }}>Employment Status</span>
                        <strong style={{ fontSize: '12.5px', color: '#9A3412' }}>ACTIVE (Confirmed)</strong>
                      </div>
                    </div>

                    {/* Notification Action Breakdown Box */}
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '11px', color: '#475569', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Request Details &amp; Checkpoint Summary
                      </span>

                      <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                        {selectedAlert.message}
                      </p>

                      {selectedAlert.details && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                          {Object.entries(selectedAlert.details).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ textTransform: 'capitalize', color: '#64748B' }}>{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <strong style={{ color: '#0F172A' }}>{String(val)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Primary Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(selectedAlert.id, 'APPROVED')}
                        className="action-btn"
                        style={{ 
                          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)', 
                          color: '#FFFFFF', 
                          border: 'none', 
                          padding: '12px', 
                          borderRadius: '10px', 
                          fontWeight: '800', 
                          fontSize: '13.5px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                        }}
                      >
                        <Check size={18} /> Approve &amp; Record Decision
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => handleAction(selectedAlert.id, 'REJECTED')}
                          style={{ 
                            background: '#FFF1F2', 
                            color: '#E11D48', 
                            border: '1px solid #FECDD3', 
                            padding: '10px', 
                            borderRadius: '10px', 
                            fontWeight: '700', 
                            fontSize: '12.5px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <X size={16} /> Reject
                        </button>

                        <button
                          onClick={() => {
                            if (selectedAlert.type === 'LEAVE') navigate.push('/hr/leaves');
                            else if (selectedAlert.type === 'ATTENDANCE') navigate.push('/hr/attendance');
                            else if (selectedAlert.type === 'EXIT') navigate.push('/hr/exit-clearance');
                            else navigate.push('/hr/employees');
                          }}
                          style={{ 
                            background: '#F0F9FF', 
                            color: '#0284C7', 
                            border: '1px solid #BAE6FD', 
                            padding: '10px', 
                            borderRadius: '10px', 
                            fontWeight: '700', 
                            fontSize: '12.5px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          Open Workflow <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94A3B8' }}>
                    <FileText size={40} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                    <p style={{ fontWeight: '700', color: '#475569', margin: '0 0 4px 0' }}>No Alert Selected</p>
                    <span style={{ fontSize: '12px' }}>Click any notification card from the left panel to inspect staff details.</span>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
