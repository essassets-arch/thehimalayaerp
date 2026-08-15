'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import StatusBadge from './StatusBadge';
import { 
  User, Calendar, FileText, CreditCard, 
  Upload, FileDown, PlusCircle, RefreshCw,
  Mail, Phone, ShieldCheck, MapPin, LogIn, LogOut, Clock, Fingerprint, Camera
} from 'lucide-react';
import Swal from 'sweetalert2';
import DataTable from './DataTable';

export default function MyProfileView() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Local punch log from NestJS database & localStorage
  const [localPunchLog, setLocalPunchLog] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('today');

  const fetchPunchLogsFromDB = useCallback(async () => {
    try {
      const response = await apiClient.get('/attendance/punches');
      if (response && response.success !== false) {
        const data = Array.isArray(response) ? response : (response.data || []);
        const empCode = profile?.employee?.employeeCode || profile?.employee?.id || profile?.id || 'EMP-001';
        const filtered = data.filter(p => p.empId === empCode);
        setLocalPunchLog(filtered);
      }
    } catch (e) {
      console.error('Failed to fetch punch logs from DB:', e);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchPunchLogsFromDB();
    }
  }, [profile, activeTab]);

  const formattedLogs = React.useMemo(() => {
    const grouped = {};
    
    const sorted = [...localPunchLog].sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTime - bTime;
    });

    sorted.forEach(entry => {
      const dateKey = entry.date || 'Today';
      const cleanEmpId = entry.empId || entry.id || 'EMP-001';
      const key = `${cleanEmpId}_${dateKey}`;
      
      const isPunchIn = entry.type === 'PUNCH_IN';
      
      if (!grouped[key]) {
        grouped[key] = {
          id: cleanEmpId,
          name: entry.empName || entry.name || 'Dr. Vivek Joshi',
          date: dateKey,
          punchIn: isPunchIn ? (entry.punchInTime || entry.time || '—') : '—',
          punchOut: !isPunchIn ? (entry.punchOutTime || entry.time || '—') : '—',
          location: entry.location || 'Factory Campus',
          coords: entry.coords || '',
          selfieUrl: entry.selfieUrl || entry.lastPhoto || null,
          status: entry.status || 'Verified',
          timestamp: entry.timestamp
        };
      } else {
        if (isPunchIn) {
          grouped[key].punchIn = entry.punchInTime || entry.time || '—';
          if (entry.selfieUrl) grouped[key].selfieUrl = entry.selfieUrl;
          if (entry.coords) {
            grouped[key].coords = entry.coords;
            grouped[key].location = entry.location;
          }
        } else {
          grouped[key].punchOut = entry.punchOutTime || entry.time || '—';
          if (!grouped[key].selfieUrl && entry.selfieUrl) {
            grouped[key].selfieUrl = entry.selfieUrl;
          }
          if (entry.status && entry.status !== 'Verified') {
            grouped[key].status = entry.status;
          }
        }
      }
    });

    return Object.values(grouped);
  }, [localPunchLog]);

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Manual Attendance Requests states
  const [manualRequests, setManualRequests] = useState([]);
  const [loadingManual, setLoadingManual] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);

  // Leaves states
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ total: 24, used: 0, remaining: 24 });
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    fromDate: '',
    toDate: '',
    reason: '',
    attachment: ''
  });

  // New Expense form state
  const [expenseForm, setExpenseForm] = useState({
    expenseName: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptBase64: ''
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await apiClient.get(`/profile?t=${Date.now()}`);
      if (res && res.success && res.data) {
        setProfile(res.data);
      }
    } catch (e) {
      console.error('Failed to load profile details', e);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoadingAttendance(true);
      const res = await apiClient.get(`/profile/attendance?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setAttendance(res.data);
      }
    } catch (e) {
      console.error('Failed to load attendance logs', e);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  const fetchManualRequests = useCallback(async () => {
    try {
      setLoadingManual(true);
      const res = await apiClient.get(`/attendance-requests/my?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setManualRequests(res.data);
      }
    } catch (e) {
      console.error('Failed to load manual attendance requests', e);
    } finally {
      setLoadingManual(false);
    }
  }, []);

  const handleManualAttendanceSubmit = async () => {
    const { value: formValues, isDismissed } = await Swal.fire({
      title: 'Request Manual Attendance',
      html:
        '<div style="text-align: left; display: flex; flex-direction: column; gap: 10px;">' +
        '  <label style="font-weight: 700; font-size: 13px; color: #475569;">Attendance Date</label>' +
        '  <input id="swal-input-date" type="date" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">' +
        '  <label style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 10px;">Reason / Remarks</label>' +
        '  <textarea id="swal-input-reason" class="swal2-textarea" style="margin: 0; width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; min-height: 80px;" placeholder="Please provide the reason for manual attendance..."></textarea>' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      preConfirm: () => {
        const date = document.getElementById('swal-input-date').value;
        const reason = document.getElementById('swal-input-reason').value;
        if (!date) {
          Swal.showValidationMessage('Please select a valid date!');
          return false;
        }
        if (!reason || !reason.trim()) {
          Swal.showValidationMessage('Please enter a reason!');
          return false;
        }
        return { date, reason };
      }
    });

    if (isDismissed || !formValues) return;

    try {
      setSubmittingManual(true);
      const res = await apiClient.post('/attendance-requests', formValues);
      if (res && res.success) {
        await Swal.fire({
          title: 'Submitted!',
          text: 'Your manual attendance request has been submitted to HR.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        await fetchManualRequests();
      } else {
        Swal.fire('Error', res.message || 'Failed to submit request.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'An error occurred.', 'error');
    } finally {
      setSubmittingManual(false);
    }
  };

  const fetchSalarySlips = useCallback(async () => {
    try {
      setLoadingSalary(true);
      const res = await apiClient.get(`/profile/salary-slips?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setSalarySlips(res.data);
      }
    } catch (e) {
      console.error('Failed to load salary slips', e);
    } finally {
      setLoadingSalary(false);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoadingExpenses(true);
      const res = await apiClient.get(`/expenses/my?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setExpenses(res.data);
      }
    } catch (e) {
      console.error('Failed to load expense history', e);
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoadingLeaves(true);
      const res = await apiClient.get(`/leaves/my?t=${Date.now()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setLeaves(res.data);
      }
    } catch (e) {
      console.error('Failed to load leave history', e);
    } finally {
      setLoadingLeaves(false);
    }
  }, []);

  const fetchLeaveBalance = useCallback(async () => {
    try {
      const res = await apiClient.get(`/leaves/balance?t=${Date.now()}`);
      if (res && res.success && res.data) {
        setLeaveBalance(res.data);
      }
    } catch (e) {
      console.error('Failed to load leave balance', e);
    }
  }, []);

  const handleLeaveFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLeaveForm(prev => ({ ...prev, attachment: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please specify from date, to date, and reason.',
        icon: 'warning',
        confirmButtonColor: '#0284c7'
      });
      return;
    }
    try {
      setSubmittingLeave(true);
      const res = await apiClient.post('/leaves', {
        leaveType: leaveForm.leaveType,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason,
        attachment: leaveForm.attachment || null
      });
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to submit leave.');
      }
      
      await Swal.fire({
        title: 'Submitted!',
        text: 'Leave request submitted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      setLeaveForm({
        leaveType: 'CASUAL',
        fromDate: '',
        toDate: '',
        reason: '',
        attachment: ''
      });
      const fileInput = document.getElementById('leave-attachment-input');
      if (fileInput) fileInput.value = '';

      await fetchLeaves();
      await fetchLeaveBalance();
    } catch (err) {
      console.error('Failed to submit leave:', err);
      Swal.fire({
        title: 'Submission Error',
        text: err.message || 'Failed to submit leave request.',
        icon: 'error',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setSubmittingLeave(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAttendance();
    fetchManualRequests();
    fetchSalarySlips();
    fetchExpenses();
    fetchLeaves();
    fetchLeaveBalance();
  }, [fetchProfile, fetchAttendance, fetchManualRequests, fetchSalarySlips, fetchExpenses, fetchLeaves, fetchLeaveBalance]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setExpenseForm(prev => ({ ...prev, receiptBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.expenseName || !expenseForm.amount || !expenseForm.expenseDate) {
      alert('Please specify name, amount, and date.');
      return;
    }

    try {
      setSubmittingExpense(true);
      await apiClient.post('/expenses', {
        expenseName: expenseForm.expenseName,
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        receiptUrl: expenseForm.receiptBase64 || null
      });

      // Clear form
      setExpenseForm({
        expenseName: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        receiptBase64: ''
      });
      
      // Reset input element
      const fileInput = document.getElementById('receipt-upload-input');
      if (fileInput) fileInput.value = '';

      // Refresh list
      await fetchExpenses();
    } catch (err) {
      console.error('Failed to submit expense:', err);
      alert(`Failed to submit expense: ${err.message || 'Server error'}`);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDownloadPdf = async (slipId, slipNumber) => {
    try {
      const targetUrl = `/api/backend/payroll/salary-slips/${slipId}/pdf`;
      const token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.localStorage.getItem('himalaya_token')) : null;
      
      const response = await fetch(targetUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('PDF generation failed on server.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary-slip-${slipNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to download salary slip PDF:', err);
      alert('Failed to download salary slip PDF. Please try again.');
    }
  };

  if (loadingProfile && !profile) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
        Loading employee profile workspace...
      </div>
    );
  }

  const pData = profile || {
    name: 'Loading Member',
    employeeId: 'EMP-000',
    email: 'N/A',
    phone: 'N/A',
    department: 'Operations',
    designation: 'Staff',
    joiningDate: new Date(),
    location: 'Haridwar Factory'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', paddingBottom: '32px' }}>
      
      {/* 1. Header Profile Info Card */}
      <div className="app-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        
        {/* Avatar Area */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0284c7', flexShrink: 0 }}>
          <User size={40} style={{ color: '#0284c7' }} />
        </div>

        {/* Text Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{pData.name}</h1>
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '11.5px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
              ID: {pData.employeeId}
            </span>
          </div>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', margin: 0 }}>
            {pData.designation} • <span style={{ color: '#0284c7' }}>{pData.department}</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12.5px', color: '#64748b', marginTop: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {pData.email}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {pData.phone}</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '4px', overflowX: 'auto', paddingBottom: '1px' }}>
        {[
          { key: 'profile', label: 'Personal Information', icon: User },
          { key: 'attendance', label: 'Attendance Records', icon: Calendar },
          { key: 'salary', label: 'Salary Slips', icon: FileText },
          { key: 'expenses', label: 'Expense Center', icon: CreditCard },
          { key: 'leaves', label: 'Leave Management', icon: Calendar }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'transparent',
                fontSize: '13.5px',
                fontWeight: isActive ? '800' : '600',
                color: isActive ? '#0284c7' : '#64748b',
                borderBottom: isActive ? '2.5px solid #0284c7' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Dynamic Tabs Content Viewports */}
      <div style={{ width: '100%' }}>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="app-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', margin: '0 0 16px 0' }}>
              Employee Registry Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Full Employee Name</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>{pData.name}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Department Unit</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>{pData.department}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Designation / Job Title</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>{pData.designation}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Joining Date</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                  {new Date(pData.joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Work Location Node</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} style={{ color: '#0284c7' }} /> {pData.location}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Corporate Access Status</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> ACTIVE EMPLOYEE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── LOCAL PUNCH RECORDS (from HeroBanner modal) ── */}
            <div style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              {/* Header */}
              <div style={{
                padding: '18px 22px 16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '11px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(99,102,241,0.2)',
                  }}>
                    <Fingerprint size={20} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Daily Punch Records</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Selfie · GPS Verified attendance from this device</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Period Filter Pills */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'yearly', label: 'Yearly' },
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

                  <button
                    onClick={() => {
                      fetchPunchLogsFromDB();
                    }}
                    style={{
                      background: '#f8fafc', border: '1px solid #cbd5e1',
                      borderRadius: '8px', padding: '6px 12px',
                      color: '#475569', fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                    }}
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              </div>

              {/* Stats row */}
              {localPunchLog.length > 0 && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  {[
                    {
                      label: 'Total Punches', value: localPunchLog.length,
                      color: '#4f46e5', icon: <Fingerprint size={16} color="#4f46e5" />
                    },
                    {
                      label: 'Punch Ins', value: localPunchLog.filter(e => e.type === 'PUNCH_IN').length,
                      color: '#16a34a', icon: <LogIn size={16} color="#16a34a" />
                    },
                    {
                      label: 'Punch Outs', value: localPunchLog.filter(e => e.type === 'PUNCH_OUT').length,
                      color: '#dc2626', icon: <LogOut size={16} color="#dc2626" />
                    },
                  ].map((s, i) => (
                    <div key={i} style={{
                      padding: '14px 18px', textAlign: 'center',
                      borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '5px' }}>
                        {s.icon}
                        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Log list */}
              <div style={{ padding: '16px 20px', maxHeight: '420px', overflowY: 'auto' }}>
                {localPunchLog.length === 0 ? (
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '32px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: '#f5f3ff', border: '1.5px solid #ddd6fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Fingerprint size={24} color="#4f46e5" />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>No punch records yet</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Use the Punch In / Punch Out button in the header to record attendance</div>
                  </div>
                ) : (
                  <DataTable 
                    columns={[
                      { 
                        header: 'Biometric Photo', 
                        accessor: 'selfieUrl',
                        render: (row) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {row.selfieUrl ? (
                              <img src={row.selfieUrl} alt="Selfie preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7' }} />
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
                          
                          let bg = '#DCFCE7';
                          let color = '#15803D';
                          let border = '#BBF7D0';
                          
                          if (isLate || isEarly) {
                            bg = '#FEF3C7';
                            color = '#D97706';
                            border = '#FDE68A';
                          } else if (isOT) {
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
                    emptyMessage="No punch records registered on this device."
                  />
                )}
              </div>
            </div>

            {/* ── SERVER ATTENDANCE SUMMARY (existing) ── */}
            <div className="app-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {/* Header row */}
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', margin: '0 0 16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Monthly Attendance Summary
                  </h3>
                  <button
                    id="btn-request-manual-attendance"
                    onClick={handleManualAttendanceSubmit}
                    disabled={submittingManual}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: submittingManual ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                      transition: 'all 0.2s',
                      opacity: submittingManual ? 0.7 : 1,
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => { if (!submittingManual) e.currentTarget.style.boxShadow = '0 4px 16px rgba(2, 132, 199, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.25)'; }}
                  >
                    <PlusCircle size={15} />
                    {submittingManual ? 'Submitting...' : 'Request Manual Attendance'}
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', margin: '6px 0 0 0' }}>
                  Click the button above to submit a manual attendance correction request to HR.
                </p>
              </div>
              
              {loadingAttendance && attendance.length === 0 ? (
                <p style={{ color: '#64748b' }}>Querying attendance roster logs...</p>
              ) : attendance.length === 0 ? (
                <p style={{ color: '#64748b' }}>No attendance summaries registered for this user.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {attendance.map((att, idx) => (
                    <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{att.month}</strong>
                        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>Active Period</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderRight: '1px solid #e2e8f0', paddingRight: '8px' }}>
                          <span>Present:</span>
                          <strong style={{ color: '#15803d' }}>{att.present} Days</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', paddingLeft: '8px' }}>
                          <span>Absent:</span>
                          <strong style={{ color: '#b91c1c' }}>{att.absent} Days</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderRight: '1px solid #e2e8f0', paddingRight: '8px', borderTop: '1px solid #f1f5f9' }}>
                          <span>Leave:</span>
                          <strong style={{ color: '#d97706' }}>{att.leave} Days</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', paddingLeft: '8px', borderTop: '1px solid #f1f5f9' }}>
                          <span>Holidays:</span>
                          <strong style={{ color: '#4f46e5' }}>{att.holiday} Days</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual Requests Logs */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '12px' }}>
                  Manual Attendance Requests History
                </h4>
                {loadingManual && manualRequests.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Loading requests...</p>
                ) : manualRequests.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>No manual attendance requests submitted yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {manualRequests.map((req) => (
                      <div key={req.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155' }}>
                            📅 Date: {new Date(req.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            <strong>Reason:</strong> {req.reason}
                          </span>
                          {req.remarks && (
                            <span style={{ fontSize: '11.5px', color: '#475569', fontStyle: 'italic' }}>
                              <strong>HR Remarks:</strong> "{req.remarks}"
                            </span>
                          )}
                        </div>
                        <div>
                          <StatusBadge status={req.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Salary Slips Tab */}
        {activeTab === 'salary' && (
          <div className="app-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', margin: '0 0 16px 0' }}>
              Historical Salary Slip Registry
            </h3>

            {loadingSalary && salarySlips.length === 0 ? (
              <p style={{ color: '#64748b' }}>Querying payroll systems...</p>
            ) : salarySlips.length === 0 ? (
              <p style={{ color: '#64748b' }}>No salary slips generated yet.</p>
            ) : (
              <div className="crm-table-container">
                <table className="crm-table responsive-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Slip Number</th>
                      <th>Salary Period</th>
                      <th>Gross Earnings</th>
                      <th>Deductions</th>
                      <th>Net Paid Amount</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salarySlips.map(slip => (
                      <tr key={slip.id}>
                        <td style={{ fontWeight: '800', fontFamily: 'monospace' }}>{slip.slipNumber}</td>
                        <td>{slip.monthName} {slip.year}</td>
                        <td style={{ fontWeight: '700' }}>₹{Number(slip.grossEarnings).toLocaleString('en-IN')}</td>
                        <td style={{ color: '#ef4444' }}>-₹{Number(slip.totalDeductions).toLocaleString('en-IN')}</td>
                        <td style={{ color: '#16a34a', fontWeight: '800' }}>₹{Number(slip.netPaid).toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDownloadPdf(slip.id, slip.slipNumber)}
                            className="action-btn"
                            style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                          >
                            <FileDown size={14} /> Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Expense Center Tab */}
        {activeTab === 'expenses' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* Submit Expense Form */}
            <form onSubmit={handleExpenseSubmit} className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', margin: 0 }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', margin: '0 0 4px 0' }}>
                Submit Expense Claim
              </h3>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>Expense Description *</label>
                <input
                  type="text" required className="form-input" placeholder="e.g. Travel tickets to Haridwar plant"
                  value={expenseForm.expenseName} onChange={e => setExpenseForm(prev => ({ ...prev, expenseName: e.target.value }))}
                  style={{ marginTop: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>Amount (₹) *</label>
                  <input
                    type="number" min="1" step="0.01" required className="form-input" placeholder="Claim amount"
                    value={expenseForm.amount} onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    style={{ marginTop: '6px' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>Expense Date *</label>
                  <input
                    type="date" required className="form-input"
                    value={expenseForm.expenseDate} onChange={e => setExpenseForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                    style={{ marginTop: '6px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>Upload Bill Receipt</label>
                <div 
                  onClick={() => document.getElementById('receipt-upload-input').click()}
                  style={{
                    marginTop: '6px',
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.background = '#F0F9FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#F8FAFC';
                  }}
                >
                  <Upload size={24} style={{ color: '#64748B' }} />
                  <span style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: '600' }}>
                    Click to upload receipt
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    JPG, PNG or GIF (Max 5MB)
                  </span>
                </div>
                <input
                  id="receipt-upload-input"
                  type="file" accept="image/*" onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {expenseForm.receiptBase64 && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                  <img src={expenseForm.receiptBase64} alt="Receipt Preview" style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div>
                    <span style={{ fontSize: '12.5px', color: '#24345C', fontWeight: '700', display: 'block' }}>Receipt Image Loaded</span>
                    <button type="button" onClick={() => setExpenseForm(prev => ({ ...prev, receiptBase64: '' }))} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: '11px', marginTop: '2px' }}>Remove File</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                <button type="submit" disabled={submittingExpense} className="action-btn" style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', cursor: submittingExpense ? 'wait' : 'pointer', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)', opacity: submittingExpense ? 0.7 : 1 }}>
                  Submit Expense Claim
                </button>
              </div>
            </form>

            {/* Claims History Log */}
            <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Claims History Log
                </h3>
                <button type="button" onClick={fetchExpenses} disabled={loadingExpenses} style={{ background: 'transparent', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={12} className={loadingExpenses ? 'spin' : ''} /> Refresh
                </button>
              </div>

              {loadingExpenses && expenses.length === 0 ? (
                <p style={{ color: '#64748b' }}>Loading logs...</p>
              ) : expenses.length === 0 ? (
                <p style={{ color: '#64748b' }}>No expense claims submitted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
                  {expenses.map(exp => (
                    <div key={exp.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{exp.expenseName}</strong>
                        <strong style={{ fontSize: '13.5px', color: '#0284c7' }}>₹{Number(exp.amount).toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                        <span>Claim Date: {new Date(exp.expenseDate).toLocaleDateString()}</span>
                        <StatusBadge status={exp.status} />
                      </div>
                      
                      {exp.receiptUrl && (
                        <div style={{ marginTop: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w.document.write(`<img src="${exp.receiptUrl}" style="max-width:100%; max-height:100vh; object-fit:contain; display:block; margin:auto;" />`);
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                          >
                            👁️ View Receipt Bill Image
                          </button>
                        </div>
                      )}

                      {exp.remarks && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#b45309', fontWeight: '600', marginTop: '4px' }}>
                          Remarks: {exp.remarks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
        {/* Leave Management Tab */}
        {activeTab === 'leaves' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Leave Balance Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div className="app-card" style={{ background: '#F8FAFC', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Annual Leave Quota</span>
                <h2 style={{ fontSize: '28px', color: '#0f172a', margin: '8px 0 0 0', fontWeight: '900' }}>{leaveBalance.total} Days</h2>
              </div>
              <div className="app-card" style={{ background: '#F0FDF4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>Approved Leaves</span>
                <h2 style={{ fontSize: '28px', color: '#16a34a', margin: '8px 0 0 0', fontWeight: '900' }}>{leaveBalance.used} Days</h2>
              </div>
              <div className="app-card" style={{ background: '#EFF6FF', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' }}>Remaining Leaves</span>
                <h2 style={{ fontSize: '28px', color: '#2563eb', margin: '8px 0 0 0', fontWeight: '900' }}>{leaveBalance.remaining} Days</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
              
              {/* Apply Leave Form */}
              <form onSubmit={handleLeaveSubmit} className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', margin: 0 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', margin: '0 0 4px 0' }}>
                  Apply New Leave Request
                </h3>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>Leave Type *</label>
                  <select
                    className="form-input" style={{ marginTop: '6px' }}
                    value={leaveForm.leaveType} onChange={e => setLeaveForm(prev => ({ ...prev, leaveType: e.target.value }))}
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PAID">Paid Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>From Date *</label>
                    <input
                      type="date" required className="form-input" style={{ marginTop: '6px' }}
                      value={leaveForm.fromDate} onChange={e => setLeaveForm(prev => ({ ...prev, fromDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>To Date *</label>
                    <input
                      type="date" required className="form-input" style={{ marginTop: '6px' }}
                      value={leaveForm.toDate} onChange={e => setLeaveForm(prev => ({ ...prev, toDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>Reason *</label>
                  <textarea
                    required className="form-input" rows={3} placeholder="Please provide brief reason for leave" style={{ marginTop: '6px', resize: 'vertical' }}
                    value={leaveForm.reason} onChange={e => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>



                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                  <button type="submit" disabled={submittingLeave} className="action-btn" style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', cursor: submittingLeave ? 'wait' : 'pointer', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)', opacity: submittingLeave ? 0.7 : 1 }}>
                    Submit Leave Request
                  </button>
                </div>
              </form>

              {/* Leave History Log */}
              <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Leave Application Log
                  </h3>
                  <button type="button" onClick={() => { fetchLeaves(); fetchLeaveBalance(); }} disabled={loadingLeaves} style={{ background: 'transparent', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={12} className={loadingLeaves ? 'spin' : ''} /> Refresh
                  </button>
                </div>

                {loadingLeaves && leaves.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Loading logs...</p>
                ) : leaves.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No leave applications submitted yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                    {leaves.map(req => (
                      <div key={req.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '11.5px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{req.leaveType}</span>
                          <strong style={{ fontSize: '13px', color: '#0f172a' }}>{req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'}</strong>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#334155' }}>{req.reason}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginTop: '4px' }}>
                          <span>{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</span>
                          <StatusBadge status={req.status} />
                        </div>

                        {req.remarks && (
                          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#b45309', fontWeight: '600', marginTop: '4px' }}>
                            Remarks: {req.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
