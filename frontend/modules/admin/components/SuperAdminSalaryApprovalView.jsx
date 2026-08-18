'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { CheckCircle2, PauseCircle, RotateCcw, XCircle, Send, Eye, ShieldCheck, DollarSign } from 'lucide-react';

export default function SuperAdminSalaryApprovalView() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDrawerRecord, setActiveDrawerRecord] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submittingBulk, setSubmittingBulk] = useState(false);

  // Reason Modal State
  const [actionModal, setActionModal] = useState<{ type: 'HOLD' | 'RETURN' | 'REJECT'; recordId: string } | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/super-admin/payroll/pending');
      if (res && res.success !== false) {
        setRecords(res.data || res || []);
      }
    } catch (err: any) {
      console.error('Failed to load Super Admin pending payroll:', err);
      setError(err.message || 'Error loading pending payroll approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const handleApproveSingle = async (id: string) => {
    try {
      await apiClient.post(`/super-admin/payroll/${id}/approve`, {});
      await fetchPendingApprovals();
      if (activeDrawerRecord?.id === id) setActiveDrawerRecord(null);
    } catch (err: any) {
      alert(err.message || 'Failed to approve salary');
    }
  };

  const handleExecuteModalAction = async () => {
    if (!actionModal) return;
    try {
      if (actionModal.type === 'HOLD') {
        await apiClient.post(`/super-admin/payroll/${actionModal.recordId}/hold`, { reason: reasonInput });
      } else if (actionModal.type === 'RETURN') {
        await apiClient.post(`/super-admin/payroll/${actionModal.recordId}/return`, { reason: reasonInput });
      } else if (actionModal.type === 'REJECT') {
        await apiClient.post(`/super-admin/payroll/${actionModal.recordId}/reject`, { reason: reasonInput });
      }
      setActionModal(null);
      setReasonInput('');
      await fetchPendingApprovals();
      if (activeDrawerRecord?.id === actionModal.recordId) setActiveDrawerRecord(null);
    } catch (err: any) {
      alert(err.message || `Failed to execute ${actionModal.type}`);
    }
  };

  const handleSendSelectedToFinance = async () => {
    if (!selectedIds.length) {
      alert('Please select payroll records to approve and send to Finance.');
      return;
    }
    try {
      setSubmittingBulk(true);
      // Auto-approve pending ones first if needed
      for (const id of selectedIds) {
        const rec = records.find(r => r.id === id);
        if (rec?.status === 'PENDING_SUPER_ADMIN_APPROVAL') {
          await apiClient.post(`/super-admin/payroll/${id}/approve`, {});
        }
      }
      await apiClient.post('/super-admin/payroll/send-to-finance', { ids: selectedIds });
      setSelectedIds([]);
      await fetchPendingApprovals();
    } catch (err: any) {
      alert(err.message || 'Failed to send payroll to Finance');
    } finally {
      setSubmittingBulk(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let bg = '#FEF3C7';
    let color = '#B45309';
    let border = '#FDE68A';

    if (status === 'ON_HOLD') {
      bg = '#FFEDD5'; color = '#C2410C'; border = '#FDBA74';
    } else if (status === 'SUPER_ADMIN_APPROVED') {
      bg = '#DCFCE7'; color = '#15803D'; border = '#86EFAC';
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

  const totalNetPending = records.reduce((acc, r) => acc + (r.netPayable || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'sans-serif' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px 24px', borderRadius: '14px', color: '#ffffff'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Super Admin Salary Approval Portal</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Review HR-verified payroll records, authorize disbursement, or return records for correction</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}>
            Total Value: <span style={{ color: '#38bdf8', fontSize: '15px', fontWeight: '900' }}>₹{totalNetPending.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={handleSendSelectedToFinance}
            disabled={submittingBulk || selectedIds.length === 0}
            style={{
              padding: '10px 18px', background: selectedIds.length === 0 ? '#475569' : '#0ea5e9',
              color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: selectedIds.length === 0 ? 'none' : '0 4px 12px rgba(14, 165, 233, 0.3)'
            }}
          >
            <Send size={16} /> Approve &amp; Send Selected to Finance ({selectedIds.length})
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#991b1b', fontSize: '13px', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* Main Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
            Pending Salary Approvals ({records.length} records)
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
            Loading approval queue...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No payroll records currently pending Super Admin approval.
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
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Attendance / LOP</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Gross Earnings</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Deductions</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Net Payable</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>HR Verifier</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Actions</th>
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
                      {row.payableDays}d Payable / <span style={{ color: '#dc2626' }}>{row.unpaidDays}d LOP</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                      ₹{row.grossEarnings?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#d97706' }}>
                      ₹{row.totalDeductions?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '900', color: '#0ea5e9', fontSize: '14px' }}>
                      ₹{row.netPayable?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11.5px', color: '#475569' }}>
                      Verified ✓
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(row.status)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setActiveDrawerRecord(row)}
                          style={{ padding: '5px 9px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Audit
                        </button>
                        <button
                          onClick={() => handleApproveSingle(row.id)}
                          style={{ padding: '5px 9px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Drawer */}
      {activeDrawerRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000
        }}>
          <div style={{
            width: '100%', maxWidth: '540px', background: '#ffffff', height: '100%', overflowY: 'auto',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {activeDrawerRecord.employeeName} — Salary Audit
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  {activeDrawerRecord.employeeCode} · {activeDrawerRecord.department}
                </span>
              </div>
              <button onClick={() => setActiveDrawerRecord(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {/* Attendance Snapshot */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#0f172a' }}>📅 Frozen Attendance Snapshot:</strong>
              <div>Working Days: {activeDrawerRecord.scheduledWorkingDays} | Present: {activeDrawerRecord.presentDays} | Payable: {activeDrawerRecord.payableDays} | LOP: {activeDrawerRecord.unpaidDays}</div>
            </div>

            {/* Earnings & Deductions Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
              <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>Gross Earnings</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#15803d', marginTop: '2px' }}>₹{activeDrawerRecord.grossEarnings?.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase' }}>Total Deductions</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color '#b45309', marginTop: '2px' }}>₹{activeDrawerRecord.totalDeductions?.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div style={{ background: '#0ea5e9', padding: '18px', borderRadius: '12px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.9 }}>Net Payable Salary</span>
                <div style={{ fontSize: '26px', fontWeight: '900', marginTop: '2px' }}>₹{activeDrawerRecord.netPayable?.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* 4 Super Admin Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => handleApproveSingle(activeDrawerRecord.id)}
                style={{ padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                onClick={() => setActionModal({ type: 'HOLD', recordId: activeDrawerRecord.id })}
                style={{ padding: '12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <PauseCircle size={16} /> Put On Hold
              </button>
              <button
                onClick={() => setActionModal({ type: 'RETURN', recordId: activeDrawerRecord.id })}
                style={{ padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RotateCcw size={16} /> Return to HR
              </button>
              <button
                onClick={() => setActionModal({ type: 'REJECT', recordId: activeDrawerRecord.id })}
                style={{ padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Hold / Return / Reject) */}
      {actionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Confirm {actionModal.type === 'HOLD' ? 'Put On Hold' : (actionModal.type === 'RETURN' ? 'Return to HR' : 'Reject Payroll')}
            </h3>
            <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>
              Reason / Remarks:
            </label>
            <textarea
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="Enter specific audit remarks or correction instructions..."
              rows={3}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActionModal(null)} style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleExecuteModalAction} style={{ padding: '8px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
