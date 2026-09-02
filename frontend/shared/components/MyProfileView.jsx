'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import StatusBadge from './StatusBadge';
import { 
  User, Calendar, CalendarDays, FileText, CreditCard, 
  Upload, FileDown, PlusCircle, RefreshCw,
  Mail, Phone, ShieldCheck, MapPin, LogIn, LogOut, Clock, Fingerprint, Camera, ShieldAlert, Send, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import DataTable from './DataTable';
import { getBackendAssetUrl } from '../../lib/assetUrl';
import SecureImage from './SecureImage';
import { complaintsService } from '../../services/hr/complaintsService';
import { expenseService } from '../../services/expenseService';

export default function MyProfileView() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Local punch log from NestJS database & localStorage
  const [localPunchLog, setLocalPunchLog] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('today');

  const fetchPunchLogsFromDB = useCallback(async () => {
    try {
      const response = await apiClient.get('/attendance/me');
      if (response && response.success !== false) {
        setLocalPunchLog(response.data?.data || response.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch punch logs:', e);
    }
  }, []);

  const formattedLogs = React.useMemo(() => {
    const mapped = localPunchLog.map(item => ({
      id: profile?.employee?.employeeCode || profile?.employeeId || 'EMP-MOCK-001',
      name: profile?.name || 'Employee',
      date: item.date,
      punchIn: item.punchInTime || '—',
      punchOut: item.punchOutTime || '—',
      location: item.location || '—',
      coords: item.coords || '',
      selfieUrl: item.selfieUrl,
      status: item.status,
      timestamp: item.timestamp
    }));

    const now = new Date();
    return mapped.filter(log => {
      if (filterPeriod === 'all') return true;
      const logDate = log.timestamp ? new Date(log.timestamp) : new Date(log.date || now);
      const diffTime = Math.abs(now.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterPeriod === 'today') {
        return logDate.toDateString() === now.toDateString();
      } else if (filterPeriod === 'monthly') {
        return diffDays <= 30;
      } else if (filterPeriod === 'yearly') {
        return diffDays <= 365;
      }
      return true;
    });
  }, [localPunchLog, profile, filterPeriod]);

  useEffect(() => {
    if (profile) {
      fetchPunchLogsFromDB();
    }
  }, [profile, activeTab]);

  useEffect(() => {
    const handlePunchUpdate = () => {
      fetchPunchLogsFromDB();
    };
    window.addEventListener('himalaya:punch', handlePunchUpdate);
    return () => {
      window.removeEventListener('himalaya:punch', handlePunchUpdate);
    };
  }, [fetchPunchLogsFromDB]);

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingSalary, setLoadingSalary] = useState(false);

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

  // Complaints states
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: 'Workplace Environment',
    priority: 'MEDIUM',
    subject: '',
    description: ''
  });

  const fetchComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const data = await complaintsService.getMyComplaints();
      setComplaints(data || []);
    } catch (e) {
      console.error('Failed to load my complaints', e);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.subject.trim() || !complaintForm.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please provide both a subject and a detailed description for your complaint.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    setSubmittingComplaint(true);
    try {
      const created = await complaintsService.submitComplaint(complaintForm);
      Swal.fire({
        icon: 'success',
        title: 'Complaint Submitted to HR',
        text: `Your ticket (${created.ticketCode}) has been securely logged and sent to HR.`,
        confirmButtonColor: '#0284c7'
      });

      setComplaintForm({
        category: 'Workplace Environment',
        priority: 'MEDIUM',
        subject: '',
        description: ''
      });
      setShowComplaintModal(false);
      await fetchComplaints();
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err?.message || 'Unable to submit complaint. Please try again.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Expense Claim states
  const [expenseForm, setExpenseForm] = useState({
    expenseName: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [previewReceiptModal, setPreviewReceiptModal] = useState(null);

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
      const res = await apiClient.get(`/payroll/me?t=${Date.now()}`);
      if (res && res.success !== false) {
        const data = res.data || res || [];
        setSalarySlips(Array.isArray(data) ? data : []);
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
      const data = await expenseService.getMyExpenses();
      setExpenses(Array.isArray(data) ? data : []);
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
    fetchComplaints();
  }, [fetchProfile, fetchAttendance, fetchManualRequests, fetchSalarySlips, fetchExpenses, fetchLeaves, fetchLeaveBalance, fetchComplaints]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|gif)$/i)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid File Type',
        text: 'Only JPG, PNG, and GIF image files are supported for receipt bills.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Too Large',
        text: 'Receipt bill attachment must not exceed 5 MB.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.expenseName.trim() || !expenseForm.amount || !expenseForm.expenseDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        text: 'Please specify expense description, positive amount, and expense date.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const numAmount = Number(expenseForm.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'Please enter a valid positive amount (₹).',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    try {
      setSubmittingExpense(true);
      let uploadedReceiptUrl = expenseForm.receiptUrl || null;

      if (receiptFile) {
        const uploadRes = await expenseService.uploadReceipt(receiptFile);
        uploadedReceiptUrl = uploadRes.url;
      }

      const claim = await expenseService.submitExpense({
        expenseName: expenseForm.expenseName.trim(),
        amount: numAmount,
        expenseDate: expenseForm.expenseDate,
        receiptUrl: uploadedReceiptUrl || undefined
      });

      Swal.fire({
        icon: 'success',
        title: 'Expense Claim Submitted',
        text: `Your claim (${claim.claimNumber}) for ₹${numAmount.toLocaleString('en-IN')} has been submitted to HR for review.`,
        confirmButtonColor: '#0284c7'
      });

      // Reset form
      setExpenseForm({
        expenseName: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        receiptUrl: ''
      });
      setReceiptFile(null);
      setReceiptPreview('');
      
      const fileInput = document.getElementById('receipt-upload-input');
      if (fileInput) fileInput.value = '';

      await fetchExpenses();
    } catch (err) {
      console.error('Failed to submit expense claim:', err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err?.message || 'Unable to submit expense claim. Please try again.',
        confirmButtonColor: '#0284c7'
      });
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
    <div className="hr-page my-profile-root" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', overflowX: 'hidden', paddingBottom: '32px', boxSizing: 'border-box' }}>
      
      {/* 1. Header Profile Info Card */}
      <div className="app-card profile-header-card profile-header" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Avatar Area */}
        <div className="profile-header-avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0284c7', flexShrink: 0 }}>
          <User size={36} style={{ color: '#0284c7' }} />
        </div>

        {/* Text Area */}
        <div className="profile-header-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="profile-header-name" style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{pData.name}</h1>
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '11.5px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
              ID: {pData.employeeId}
            </span>
          </div>
          <p style={{ fontSize: '13.5px', fontWeight: '700', color: '#64748b', margin: 0 }}>
            {pData.designation} • <span style={{ color: '#0284c7' }}>{pData.department}</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12.5px', color: '#64748b', marginTop: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {pData.email}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {pData.phone}</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="hr-tabs-wrapper">
        <div 
          className="hr-tabs profile-tabs-nav erp-tab-scroll-bar" 
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY * 0.8;
            }
          }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            el.dataset.isDown = 'true';
            el.dataset.startX = String(e.pageX - el.offsetLeft);
            el.dataset.scrollLeft = String(el.scrollLeft);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.dataset.isDown = 'false';
          }}
          onMouseUp={(e) => {
            e.currentTarget.dataset.isDown = 'false';
          }}
          onMouseMove={(e) => {
            const el = e.currentTarget;
            if (el.dataset.isDown !== 'true') return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const startX = Number(el.dataset.startX || 0);
            const scrollLeft = Number(el.dataset.scrollLeft || 0);
            const walk = (x - startX) * 1.5;
            el.scrollLeft = scrollLeft - walk;
          }}
        >
          {[
            { key: 'attendance', label: 'Attendance Records', icon: CalendarDays },
            { key: 'salary', label: 'Salary Slips', icon: FileText },
            { key: 'expenses', label: 'Expense Center', icon: CreditCard },
            { key: 'leaves', label: 'Leave Management', icon: Calendar },
            { key: 'complaints', label: 'Complaint Center', icon: ShieldAlert }
          ].map(tab => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`hr-tab profile-tab-btn ${isActive ? 'active' : ''}`}
                style={{ whiteSpace: 'nowrap', flexShrink: 0, userSelect: 'none' }}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dynamic Tabs Content Viewports */}
      <main className="hr-content" style={{ width: '100%', maxWidth: '100%' }}>
        
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
              <div className="punch-records-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '11px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(99,102,241,0.2)',
                    flexShrink: 0
                  }}>
                    <Fingerprint size={20} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Daily Punch Records</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Selfie · GPS Verified attendance from this device</div>
                  </div>
                </div>
                <div className="punch-records-actions">
                  {/* Period Filter Pills */}
                  <div className="punch-period-pills">
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'yearly', label: 'Yearly' },
                      { id: 'all', label: 'All Logs' }
                    ].map(period => (
                      <button
                        key={period.id}
                        onClick={() => setFilterPeriod(period.id)}
                        className={`punch-period-btn ${filterPeriod === period.id ? 'active' : ''}`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      fetchPunchLogsFromDB();
                    }}
                    className="punch-refresh-btn"
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
                <div className="punch-stats-grid">
                  {[
                    {
                      label: 'Total Punches', value: localPunchLog.length,
                      color: '#4f46e5', icon: <Fingerprint size={15} color="#4f46e5" />
                    },
                    {
                      label: 'Punch Ins', value: localPunchLog.filter(e => e.type === 'PUNCH_IN').length,
                      color: '#16a34a', icon: <LogIn size={15} color="#16a34a" />
                    },
                    {
                      label: 'Punch Outs', value: localPunchLog.filter(e => e.type === 'PUNCH_OUT').length,
                      color: '#dc2626', icon: <LogOut size={15} color="#dc2626" />
                    },
                  ].map((s, i) => (
                    <div key={i} className="punch-stat-item">
                      <div className="punch-stat-label">
                        {s.icon}
                        <span>{s.label}</span>
                      </div>
                      <div className="punch-stat-value" style={{ color: s.color }}>{s.value}</div>
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
                    scrollMode={true}
                    columns={[
                      { 
                        header: 'Biometric Photo', 
                        accessor: 'selfieUrl',
                        render: (row) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {row.selfieUrl ? (
                              <SecureImage src={row.selfieUrl} alt="Selfie preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7' }} fallbackText="Selfie unavailable" />
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
              <div className="crm-table-container scroll-mode erp-table-responsive">
                <table className="crm-table responsive-table" style={{ width: '100%', minWidth: '600px' }}>
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
            <form onSubmit={handleExpenseSubmit} className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} color="#0284c7" />
                  Submit Expense Claim
                </h3>
                <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  Corporate Claim
                </span>
              </div>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>Expense Description *</label>
                <input
                  type="text" required className="form-input" placeholder="e.g. Client travel tickets to Haridwar plant"
                  value={expenseForm.expenseName} onChange={e => setExpenseForm(prev => ({ ...prev, expenseName: e.target.value }))}
                  style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>Amount (₹) *</label>
                  <input
                    type="number" min="1" step="0.01" required className="form-input" placeholder="Claim amount"
                    value={expenseForm.amount} onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>Expense Date *</label>
                  <input
                    type="date" required className="form-input"
                    value={expenseForm.expenseDate} onChange={e => setExpenseForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                    style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>Upload Bill Receipt</label>
                <div 
                  onClick={() => document.getElementById('receipt-upload-input').click()}
                  style={{
                    marginTop: '6px',
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
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
                  <Upload size={22} style={{ color: '#0284c7' }} />
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>
                    Click to upload receipt bill
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    JPG, PNG or GIF (Max 5MB)
                  </span>
                </div>
                <input
                  id="receipt-upload-input"
                  type="file" accept="image/jpeg,image/png,image/gif" onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {receiptPreview && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#F5FAFE', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                  <img src={receiptPreview} alt="Receipt Preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '700', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {receiptFile?.name || 'Receipt Image Attached'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {(receiptFile?.size ? (receiptFile.size / 1024).toFixed(1) + ' KB' : 'Ready to upload')}
                    </span>
                  </div>
                  <button type="button" onClick={() => { setReceiptFile(null); setReceiptPreview(''); }} style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#dc2626', fontWeight: '700', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>Remove</button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '4px' }}>
                <button type="submit" disabled={submittingExpense} className="action-btn profile-submit-btn" style={{ background: '#0284c7', color: '#ffffff', opacity: submittingExpense ? 0.7 : 1, padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  {submittingExpense ? 'Submitting Claim...' : 'Submit Expense Claim'}
                </button>
              </div>
            </form>

            {/* Claims History Log */}
            <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  My Filed Expense Claims Log ({expenses.length})
                </h3>
                <button type="button" onClick={fetchExpenses} disabled={loadingExpenses} style={{ background: 'transparent', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={12} className={loadingExpenses ? 'spin' : ''} /> Refresh
                </button>
              </div>

              {loadingExpenses && expenses.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px' }}>Loading expense logs...</p>
              ) : expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                  <CreditCard size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>No expense claims submitted yet.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>Fill out the form on the left to submit a claim for HR &amp; Finance approval.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                  {expenses.map(exp => (
                    <div key={exp.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>
                              {exp.claimNumber || 'EXP'}
                            </span>
                            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{exp.expenseName}</strong>
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                            Claim Date: {new Date(exp.expenseDate).toLocaleDateString()}
                          </span>
                        </div>
                        <strong style={{ fontSize: '14px', color: '#0284c7', fontWeight: '800' }}>
                          ₹{Number(exp.amount).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: '600', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                        <span>Workflow State</span>
                        <StatusBadge status={exp.status} />
                      </div>

                      {/* Approval Remarks History */}
                      {exp.hrRemarks && (
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#0369a1', fontWeight: '600' }}>
                          <strong>HR ({exp.hrApprovedBy || 'Reviewer'}):</strong> {exp.hrRemarks}
                        </div>
                      )}
                      {exp.superAdminRemarks && (
                        <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#854d0e', fontWeight: '600' }}>
                          <strong>Super Admin ({exp.superAdminApprovedBy || 'Super Admin'}):</strong> {exp.superAdminRemarks}
                        </div>
                      )}
                      {exp.financeRemarks && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#166534', fontWeight: '600' }}>
                          <strong>Finance ({exp.financeProcessedBy || 'Finance'}):</strong> {exp.financeRemarks}
                          {exp.paymentReference && <span> • Ref: {exp.paymentReference}</span>}
                        </div>
                      )}
                      
                      {exp.receiptUrl && (
                        <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'flex-start' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptModal(getBackendAssetUrl(exp.receiptUrl))}
                            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            👁️ View Receipt Bill
                          </button>
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
            <div className="leave-balance-grid">
              <div className="leave-balance-card quota">
                <span className="leave-balance-title" style={{ color: '#64748b' }}>Annual Quota</span>
                <h2 className="leave-balance-val" style={{ color: '#0f172a' }}>{leaveBalance.total} Days</h2>
              </div>
              <div className="leave-balance-card approved">
                <span className="leave-balance-title" style={{ color: '#16a34a' }}>Approved</span>
                <h2 className="leave-balance-val" style={{ color: '#16a34a' }}>{leaveBalance.used} Days</h2>
              </div>
              <div className="leave-balance-card remaining">
                <span className="leave-balance-title" style={{ color: '#2563eb' }}>Remaining</span>
                <h2 className="leave-balance-val" style={{ color: '#2563eb' }}>{leaveBalance.remaining} Days</h2>
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
                  <button type="submit" disabled={submittingLeave} className="action-btn profile-submit-btn" style={{ background: '#0284c7', color: '#ffffff', opacity: submittingLeave ? 0.7 : 1 }}>
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

        {/* ── COMPLAINTS TAB CONTENT ── */}
        {activeTab === 'complaints' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
              
              {/* Submit Complaint Card Form */}
              <form
                onSubmit={handleSubmitComplaint}
                className="app-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  margin: 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="#0284c7" />
                    Submit Workplace Complaint
                  </h3>
                  <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    Confidential
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                      Category *
                    </label>
                    <input
                      type="text"
                      list="profile-complaint-categories"
                      required
                      placeholder="Type or choose category..."
                      className="form-input"
                      style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px' }}
                      value={complaintForm.category}
                      onChange={(e) => setComplaintForm(prev => ({ ...prev, category: e.target.value }))}
                    />
                    <datalist id="profile-complaint-categories">
                      <option value="Workplace Environment" />
                      <option value="Harassment / Misconduct" />
                      <option value="Payroll & Compensation" />
                      <option value="Management / Hierarchy" />
                      <option value="Facility / Infrastructure" />
                      <option value="Health & Safety" />
                      <option value="Leave / Attendance Dispute" />
                      <option value="Other Issue" />
                    </datalist>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                      Priority *
                    </label>
                    <input
                      type="text"
                      list="profile-complaint-priorities"
                      required
                      placeholder="Type or choose priority (e.g. Medium, High, Critical)..."
                      className="form-input"
                      style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px' }}
                      value={complaintForm.priority}
                      onChange={(e) => setComplaintForm(prev => ({ ...prev, priority: e.target.value }))}
                    />
                    <datalist id="profile-complaint-priorities">
                      <option value="LOW" />
                      <option value="MEDIUM" />
                      <option value="HIGH" />
                      <option value="CRITICAL" />
                    </datalist>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                    Subject / Short Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your grievance or workplace issue..."
                    className="form-input"
                    style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px' }}
                    value={complaintForm.subject}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific details, dates, individuals involved, and the nature of the issue..."
                    className="form-input"
                    style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px', resize: 'vertical' }}
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="action-btn profile-submit-btn"
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 20px',
                      fontWeight: '800',
                      cursor: submittingComplaint ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Send size={15} />
                    {submittingComplaint ? 'Submitting to HR...' : 'Send Complaint'}
                  </button>
                </div>
              </form>

              {/* My Submitted Complaints History */}
              <div
                className="app-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  margin: 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    My Filed Complaints Log ({complaints.length})
                  </h3>
                  <button
                    type="button"
                    onClick={fetchComplaints}
                    disabled={loadingComplaints}
                    style={{ background: 'transparent', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={12} className={loadingComplaints ? 'spin' : ''} /> Refresh
                  </button>
                </div>

                {loadingComplaints && complaints.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Loading your complaints history...</p>
                ) : complaints.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
                    <ShieldAlert size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>No Complaints Filed</div>
                    <div style={{ fontSize: '12px', marginTop: '2px' }}>You haven't submitted any workplace complaints.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                    {complaints.map((c) => {
                      const isPending = c.status === 'PENDING';
                      const isResolved = c.status === 'RESOLVED';
                      const isRejected = c.status === 'REJECTED';

                      const badgeStyle = isResolved
                        ? { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Resolved' }
                        : isRejected
                        ? { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Rejected' }
                        : isPending
                        ? { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending Review' }
                        : { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'In Investigation' };

                      return (
                        <div
                          key={c.id}
                          style={{
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px',
                            background: isPending ? '#fffdf7' : '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7' }}>
                                {c.ticketCode}
                              </span>
                              <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700' }}>
                                {c.category}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: badgeStyle.bg,
                                color: badgeStyle.color,
                                border: `1px solid ${badgeStyle.border}`
                              }}
                            >
                              {badgeStyle.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                            {c.subject}
                          </div>

                          <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                            {c.description}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            <span>Filed: {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span style={{ fontWeight: '700', color: c.priority === 'HIGH' || c.priority === 'CRITICAL' ? '#dc2626' : '#64748b' }}>
                              {c.priority} PRIORITY
                            </span>
                          </div>

                          {c.hrRemarks && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', color: '#15803d', fontWeight: '600', marginTop: '4px' }}>
                              <strong>HR Response / Resolution:</strong> {c.hrRemarks}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ── WRITE COMPLAINT POPUP MODAL ── */}
      {showComplaintModal && (
        <div
          onClick={() => setShowComplaintModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              border: '1.5px solid #cbd5e1'
            }}
          >
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#38bdf8" />
                Submit Workplace Grievance / Complaint
              </div>
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Category *</label>
                  <input
                    type="text"
                    list="modal-complaint-categories"
                    required
                    placeholder="Type or choose category..."
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <datalist id="modal-complaint-categories">
                    <option value="Workplace Environment" />
                    <option value="Harassment / Misconduct" />
                    <option value="Payroll & Compensation" />
                    <option value="Management / Hierarchy" />
                    <option value="Facility / Infrastructure" />
                    <option value="Health & Safety" />
                    <option value="Leave / Attendance Dispute" />
                    <option value="Other Issue" />
                  </datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Priority *</label>
                  <input
                    type="text"
                    list="modal-complaint-priorities"
                    required
                    placeholder="Type or choose priority..."
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <datalist id="modal-complaint-priorities">
                    <option value="LOW" />
                    <option value="MEDIUM" />
                    <option value="HIGH" />
                    <option value="CRITICAL" />
                  </datalist>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of workplace issue..."
                  value={complaintForm.subject}
                  onChange={(e) => setComplaintForm(prev => ({ ...prev, subject: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide specific details for HR investigation..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: '800', cursor: submittingComplaint ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} />
                  {submittingComplaint ? 'Submitting...' : 'Send Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN RECEIPT VIEWER MODAL ── */}
      {previewReceiptModal && (
        <div
          onClick={() => setPreviewReceiptModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ padding: '14px 20px', background: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '800' }}>Receipt Bill Attachment</span>
              <button
                type="button"
                onClick={() => setPreviewReceiptModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={previewReceiptModal}
                alt="Receipt Full Preview"
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
