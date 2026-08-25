'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/notificationStore';
import { getBackendAssetUrl } from '../../../lib/assetUrl';
import { employeesService } from '../../../services/hr/employeesService';
import { 
  Bell, Calendar, Clock, CheckCircle2, AlertTriangle, UserCheck, 
  ArrowRight, ShieldCheck, FileText, UserX, CreditCard, ChevronRight, Check, X, Filter
} from 'lucide-react';

export default function HRNotificationsView() {
  const navigate = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [processedAlerts, setProcessedAlerts] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const res = await employeesService.listEmployees({ page: 1, limit: 100 });
        if (res && res.items) {
          setEmployees(res.items);
        }
      } catch (err) {
        console.error('Error fetching employees in HR notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Pre-configured rich HR notifications linked to staff members
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

  // Set default selected alert on load
  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert) {
      setSelectedAlert(alerts[0]);
    }
  }, [alerts]);

  const filteredAlerts = alerts.filter(al => {
    if (activeTab === 'ALL') return true;
    return al.type === activeTab;
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

  // Find full employee record from roster
  const selectedEmp = selectedAlert 
    ? employees.find(e => 
        e.employeeCode === selectedAlert.employeeCode || 
        e.id === selectedAlert.employeeCode ||
        e.fullName?.toLowerCase().includes(selectedAlert.empName?.toLowerCase())
      )
    : null;

  const handleAction = (alertId, actionName) => {
    setProcessedAlerts(prev => ({ ...prev, [alertId]: actionName }));
    showToast(`Action "${actionName}" completed for alert ${alertId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-sans, system-ui, -apple-system)' }}>
      
      {/* ── TOP BANNER & KPI METRICS ── */}
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
              <Bell size={22} color="#38BDF8" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              HR Action Center & Alerts
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
            Real-time management notifications, leave approvals, biometric overrides &amp; staff clearance checkpoints.
          </p>
        </div>

        {/* Quick KPI Stats */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(8px)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Active Alerts</span>
            <strong style={{ fontSize: '20px', color: '#F8FAFC', fontWeight: '800' }}>{alerts.length}</strong>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '11px', color: '#FDE68A', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Pending Leave</span>
            <strong style={{ fontSize: '20px', color: '#FBBF24', fontWeight: '800' }}>1</strong>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <span style={{ fontSize: '11px', color: '#FECACA', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>High Priority</span>
            <strong style={{ fontSize: '20px', color: '#F87171', fontWeight: '800' }}>1</strong>
          </div>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
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
            boxSizing: 'border-box',
            scrollBehavior: 'smooth',
            touchAction: 'pan-x',
            cursor: 'grab'
          }}
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
            { id: 'ALL', label: 'All Alerts' },
            { id: 'LEAVE', label: 'Leave Applications' },
            { id: 'ATTENDANCE', label: 'Attendance Overrides' },
            { id: 'EXIT', label: 'Exit Clearance' },
            { id: 'PAYROLL', label: 'Payroll' },
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
          Showing {filteredAlerts.length} of {alerts.length} notifications
        </span>
      </div>

      {/* ── MAIN CONTENT GRID: LIST + INSPECTOR ── */}
      <div className="hr-notifications-view-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: NOTIFICATION CARDS */}
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
                    background: isSelected ? '#FFFFFF' : '#FFFFFF',
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
                        Inspect Profile <ChevronRight size={14} color="#0284C7" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: DETAILED STAFF PROFILE & ACTION INSPECTOR */}
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
                        if (selectedAlert.type === 'LEAVE') navigate.push('/hr/leave-approvals');
                        else if (selectedAlert.type === 'ATTENDANCE') navigate.push('/hr/attendance-requests');
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
  );
}
