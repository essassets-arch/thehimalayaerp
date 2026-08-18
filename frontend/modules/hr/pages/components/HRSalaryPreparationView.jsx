'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { DollarSign, CheckCircle2, Send, RotateCcw, Eye, AlertCircle, FileText, Calendar, Filter, Users } from 'lucide-react';

export default function HRSalaryPreparationView() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeDrawerRecord, setActiveDrawerRecord] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submittingBulk, setSubmittingBulk] = useState(false);

  const fetchPayrollRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [yearStr, monthStr] = selectedMonth.split('-');
      const res = await apiClient.get(`/hr/payroll?month=${Number(monthStr)}&year=${Number(yearStr)}`);
      if (res && res.success !== false) {
        const raw = res.data?.items || res.items || res.data || res;
        setRecords(Array.isArray(raw) ? raw : []);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      console.error('Failed to load HR payroll records:', err);
      setError(err.message || 'Error loading payroll records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchPayrollRecords();
  }, [fetchPayrollRecords]);

  const handleGeneratePayroll = async () => {
    try {
      setGenerating(true);
      setError('');
      const [yearStr, monthStr] = selectedMonth.split('-');
      const res = await apiClient.post('/hr/payroll/generate', {
        month: Number(monthStr),
        year: Number(yearStr),
        calculationBasis: 'WORKING_DAYS',
      });
      fetchPayrollRecords();
    } catch (err: any) {
      setError(err.message || 'Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const safeRecords = Array.isArray(records) ? records : [];
  const totalGross = safeRecords.reduce((acc, r) => acc + (r.grossEarnings || 0), 0);
  const totalDeductions = safeRecords.reduce((acc, r) => acc + (r.totalDeductions || 0), 0);
  const totalNet = safeRecords.reduce((acc, r) => acc + (r.netPayable || 0), 0);

  const handleVerifySingle = async (id: string) => {
    try {
      await apiClient.post(`/hr/payroll/${id}/verify`, {});
      await fetchPayrollRecords();
      if (activeDrawerRecord?.id === id) {
        const updated = await apiClient.get(`/hr/payroll/${id}`);
        setActiveDrawerRecord(updated.data || updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify salary');
    }
  };

  const handleEditReturned = async (id: string) => {
    try {
      await apiClient.post(`/hr/payroll/${id}/edit-returned`, {});
      await fetchPayrollRecords();
      if (activeDrawerRecord?.id === id) {
        const updated = await apiClient.get(`/hr/payroll/${id}`);
        setActiveDrawerRecord(updated.data || updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to edit returned salary');
    }
  };

  const handleSendSelectedToSuperAdmin = async () => {
    const verifiedIds = records.filter(r => selectedIds.includes(r.id) && (r.status === 'HR_VERIFIED' || r.status === 'DRAFT')).map(r => r.id);
    if (!verifiedIds.length) {
      alert('Please select records in DRAFT or HR_VERIFIED status.');
      return;
    }
    try {
      setSubmittingBulk(true);
      // Auto-verify DRAFT ones first if needed
      for (const id of verifiedIds) {
        const rec = records.find(r => r.id === id);
        if (rec?.status === 'DRAFT') {
          await apiClient.post(`/hr/payroll/${id}/verify`, {});
        }
      }
      await apiClient.post('/hr/payroll/send-to-super-admin', { ids: verifiedIds });
      setSelectedIds([]);
      await fetchPayrollRecords();
    } catch (err: any) {
      alert(err.message || 'Failed to submit records to Super Admin');
    } finally {
      setSubmittingBulk(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let bg = '#F1F5F9';
    let color = '#475569';
    let border = '#CBD5E1';

    switch (status) {
      case 'DRAFT': bg = '#F1F5F9'; color = '#475569'; border = '#CBD5E1'; break;
      case 'HR_VERIFIED': bg = '#E0F2FE'; color = '#0369A1'; border = '#BAE6FD'; break;
      case 'PENDING_SUPER_ADMIN_APPROVAL': bg = '#FEF3C7'; color = '#B45309'; border = '#FDE68A'; break;
      case 'SUPER_ADMIN_APPROVED': bg = '#DCFCE7'; color = '#15803D'; border = '#86EFAC'; break;
      case 'ON_HOLD': bg = '#FFEDD5'; color = '#C2410C'; border = '#FDBA74'; break;
      case 'RETURNED_TO_HR': bg = '#FEE2E2'; color = '#B91C1C'; border = '#FCA5A5'; break;
      case 'PENDING_FINANCE': bg = '#E0E7FF'; color = '#4338CA'; border = '#C7D2FE'; break;
      case 'PROCESSING': bg = '#F3E8FF'; color = '#6B21A8'; border = '#E9D5FF'; break;
      case 'PAID': bg = '#DCFCE7'; color = '#166534'; border = '#86EFAC'; break;
      case 'REJECTED': bg = '#FEE2E2'; color = '#991B1B'; border = '#FCA5A5'; break;
    }

    return (
      <span style={{
        padding: '3.5px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
        background: bg, color: color, border: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.4px'
      }}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const totalGross = records.reduce((acc, r) => acc + (r.grossEarnings || 0), 0);
  const totalDeductions = records.reduce((acc, r) => acc + (r.totalDeductions || 0), 0);
  const totalNet = records.reduce((acc, r) => acc + (r.netPayable || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'sans-serif' }}>
      {/* Header Controls */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        background: '#ffffff', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>HR Salary Preparation &amp; Verification</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Generate monthly salary records from finalized attendance summaries and submit for Super Admin approval</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>Target Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1',
                fontSize: '13px', fontWeight: '700', color: '#1e293b', background: '#f8fafc', outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleGeneratePayroll}
            disabled={generating}
            style={{
              padding: '10px 18px', background: generating ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            <DollarSign size={16} /> {generating ? 'Generating Salary...' : 'Generate Monthly Salary'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#991b1b', fontSize: '13px', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Payroll Count', val: records.length, sub: `Active Employees`, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Total Gross Earnings', val: `₹${totalGross.toLocaleString('en-IN')}`, sub: `Pre-deductions`, color: '#059669', bg: '#ecfdf5' },
          { label: 'Total Deductions', val: `₹${totalDeductions.toLocaleString('en-IN')}`, sub: `LOP, PF, ESIC, PT`, color: '#d97706', bg: '#fffbeb' },
          { label: 'Net Payable Salary', val: `₹${totalNet.toLocaleString('en-IN')}`, sub: `Final Disbursement`, color: '#4f46e5', bg: '#f5f3ff' },
        ].map((card, i) => (
          <div key={i} style={{ background: card.bg, padding: '16px', borderRadius: '12px', border: `1px solid ${card.color}25`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.4px' }}>{card.label}</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: card.color }}>{card.val}</div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#EEF2FF', padding: '12px 20px', borderRadius: '10px', border: '1px solid #C7D2FE'
        }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#3730A3' }}>
            {selectedIds.length} employee record(s) selected
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSendSelectedToSuperAdmin}
              disabled={submittingBulk}
              style={{
                padding: '8px 16px', background: '#4F46E5', color: '#ffffff', border: 'none',
                borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Send size={14} /> Send Selected to Super Admin
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
            Employee Salary Master Records ({records.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
            Loading salary records...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No payroll records generated for {selectedMonth}. Click <strong>Generate Monthly Salary</strong> above to calculate.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === records.length && records.length > 0}
                      onChange={(e) => setSelectedIds(e.target.checked ? records.map(r => r.id) : [])}
                    />
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Employee</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Department</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Working / Payable</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>LOP Days</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Gross Salary</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Deductions</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Net Payable</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, row.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== row.id));
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{row.employeeName}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{row.employeeCode}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>
                      {row.department}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#334155' }}>
                      {row.scheduledWorkingDays}d / <span style={{ color: '#16a34a', fontWeight: '800' }}>{row.payableDays}d</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: row.unpaidDays > 0 ? '#dc2626' : '#64748b' }}>
                      {row.unpaidDays} days
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                      ₹{row.grossEarnings?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#d97706' }}>
                      ₹{row.totalDeductions?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '900', color: '#4f46e5', fontSize: '14px' }}>
                      ₹{row.netPayable?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(row.status)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setActiveDrawerRecord(row)}
                          style={{ padding: '5px 10px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={13} /> Inspect
                        </button>
                        {row.status === 'RETURNED_TO_HR' && (
                          <button
                            onClick={() => handleEditReturned(row.id)}
                            style={{ padding: '5px 10px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RotateCcw size={13} /> Edit Returned
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Inspection Drawer / Modal */}
      {activeDrawerRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000
        }}>
          <div style={{
            width: '100%', maxWidth: '520px', background: '#ffffff', height: '100%', overflowY: 'auto',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {activeDrawerRecord.employeeName || 'Employee Salary Inspection'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  {activeDrawerRecord.employeeCode} · {activeDrawerRecord.department}
                </span>
              </div>
              <button onClick={() => setActiveDrawerRecord(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {/* Current Status Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Current Workflow Status:</span>
              {getStatusBadge(activeDrawerRecord.status)}
            </div>

            {activeDrawerRecord.returnReason && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#991b1b', fontSize: '12.5px' }}>
                <strong>Return Reason:</strong> {activeDrawerRecord.returnReason}
              </div>
            )}

            {/* Attendance Snapshot Card */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                📅 Attendance Snapshot
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>Scheduled Days: <strong>{activeDrawerRecord.scheduledWorkingDays}</strong></div>
                <div>Present Days: <strong style={{ color: '#16a34a' }}>{activeDrawerRecord.presentDays}</strong></div>
                <div>Paid Leave Days: <strong>{activeDrawerRecord.paidLeaveDays}</strong></div>
                <div>Unpaid LOP Days: <strong style={{ color: '#dc2626' }}>{activeDrawerRecord.unpaidDays}</strong></div>
                <div>Half Days: <strong>{activeDrawerRecord.halfDays || 0}</strong></div>
                <div>Payable Days: <strong style={{ color: '#4f46e5' }}>{activeDrawerRecord.payableDays}</strong></div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#166534', borderBottom: '1px solid #86efac', paddingBottom: '6px' }}>
                💵 Earnings Breakdown
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Basic Salary:</span><strong>₹{(activeDrawerRecord.basicSalary || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>HRA:</span><strong>₹{(activeDrawerRecord.hra || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Conveyance Allowance:</span><strong>₹{(activeDrawerRecord.conveyanceAllowance || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Special Allowance:</span><strong>₹{(activeDrawerRecord.specialAllowance || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Other Allowance:</span><strong>₹{(activeDrawerRecord.otherAllowance || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #86efac', paddingTop: '6px', fontWeight: '900', color: '#14532d', fontSize: '14px' }}>
                <span>Gross Earnings:</span><span>₹{(activeDrawerRecord.grossEarnings || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#92400e', borderBottom: '1px solid #fcd34d', paddingBottom: '6px' }}>
                📉 Employee Deductions Breakdown
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Loss of Pay (LOP Deduction):</span><strong style={{ color: '#dc2626' }}>₹{(activeDrawerRecord.leaveDeduction || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PF Employee Share:</span><strong>₹{(activeDrawerRecord.pfDeduction || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>ESIC Employee Share:</span><strong>₹{(activeDrawerRecord.esicDeduction || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Professional Tax (Gujarat PT):</span><strong>₹{(activeDrawerRecord.professionalTax || 0).toLocaleString('en-IN')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #fcd34d', paddingTop: '6px', fontWeight: '900', color: '#78350f', fontSize: '13.5px' }}>
                <span>Total Deductions:</span><span>₹{(activeDrawerRecord.totalDeductions || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Net Salary Card */}
            <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '18px', borderRadius: '12px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>Net Payable Salary</span>
                <div style={{ fontSize: '26px', fontWeight: '900', marginTop: '2px' }}>₹{(activeDrawerRecord.netPayable || 0).toLocaleString('en-IN')}</div>
              </div>
              {activeDrawerRecord.status === 'DRAFT' && (
                <button
                  onClick={() => handleVerifySingle(activeDrawerRecord.id)}
                  style={{ padding: '9px 16px', background: '#ffffff', color: '#4f46e5', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Verify Salary ✓
                </button>
              )}
            </div>

            {/* Bank Snapshot */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Bank Transfer Details Snapshot:</strong>
              <div>Bank: {activeDrawerRecord.bankName || 'HDFC Bank'} · Account: XXXX{activeDrawerRecord.accountLast4 || '1234'} · IFSC: {activeDrawerRecord.ifsc || 'HDFC0001234'}</div>
            </div>

            {/* Actions */}
            {activeDrawerRecord.status === 'RETURNED_TO_HR' && (
              <button
                onClick={() => handleEditReturned(activeDrawerRecord.id)}
                style={{ padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
              >
                Start Editing Returned Salary
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
