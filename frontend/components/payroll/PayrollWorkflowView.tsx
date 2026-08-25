'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { PayrollRecord, payrollService } from '@/services/payroll/payrollService';
import { useRouter } from 'next/navigation';
import './PayrollWorkflowView.css';

type Mode = 'prepare' | 'super-admin' | 'finance' | 'payment' | 'payslips' | 'history' | 'employee';
const money = (value: unknown) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const title: Record<Mode, string> = {
  prepare: 'HR Salary Preparation', 'super-admin': 'Super Admin Salary Approval',
  finance: 'Finance Pending Salaries', payment: 'Finance Salary Processing',
  payslips: 'Salary Slips', history: 'Paid Salary History', employee: 'My Salary Slips',
};

export default function PayrollWorkflowView({ mode }: { mode: Mode }) {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [year, selectedMonth] = month.split('-').map(Number);
    try {
      const params = { month: selectedMonth, year, page: 1, pageSize: 100 };
      const result = mode === 'employee'
        ? { items: (await payrollService.getMySalarySlips()).map((slip: any) => ({ ...slip.payrollRecord, employee: slip.employee, salarySlip: slip })), pagination: { page: 1, pageSize: 100, total: 0, totalPages: 1 } }
        : (mode === 'super-admin' || mode === 'finance' || mode === 'payment') ? await payrollService.getPayrollRecords(params)
        : mode === 'history' || mode === 'payslips' ? await payrollService.getPayrollHistory(params)
        : await payrollService.getPayrollRecords(params);
      const items = Array.isArray(result) ? result : (result?.items || []);
      setRecords(items);
    } catch (cause: any) { setError(cause.message); setRecords([]); }
    finally { setLoading(false); }
  }, [mode, month]);
  useEffect(() => { void load(); }, [load]);

  const pendingRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    if (mode === 'super-admin') {
      return records.filter(r => ['PENDING_SUPER_ADMIN_APPROVAL', 'ON_HOLD', 'HR_VERIFIED', 'DRAFT'].includes(r?.status));
    }
    if (mode === 'finance' || mode === 'payment') {
      return records.filter(r => ['PENDING_FINANCE', 'PROCESSING', 'SUPER_ADMIN_APPROVED'].includes(r?.status));
    }
    return records;
  }, [records, mode]);

  const historyRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    if (mode === 'super-admin') {
      return records.filter(r => ['SUPER_ADMIN_APPROVED', 'PENDING_FINANCE', 'PROCESSING', 'PAID', 'SALARY_PAID', 'REJECTED', 'RETURNED_TO_HR'].includes(r?.status));
    }
    if (mode === 'finance' || mode === 'payment') {
      return records.filter(r => ['PAID', 'SALARY_PAID', 'REJECTED', 'RETURNED_TO_HR', 'DRAFT', 'HR_VERIFIED', 'PENDING_SUPER_ADMIN_APPROVAL', 'ON_HOLD'].includes(r?.status));
    }
    return records;
  }, [records, mode]);

  const safeRecords = useMemo(() => {
    if (mode === 'super-admin' || mode === 'finance' || mode === 'payment') {
      return activeTab === 'pending' ? pendingRecords : historyRecords;
    }
    return Array.isArray(records) ? records : [];
  }, [records, mode, activeTab, pendingRecords, historyRecords]);

  const totals = useMemo(() => safeRecords.reduce((sum, record) => ({
    gross: sum.gross + Number(record?.grossEarnings || 0), deductions: sum.deductions + Number(record?.totalDeductions || 0),
    net: sum.net + Number(record?.netPayable || 0),
  }), { gross: 0, deductions: 0, net: 0 }), [safeRecords]);
  const empName = (r: any) => r?.employee?.fullName || r?.employeeName || (r?.employee ? `${r.employee.firstName || ''} ${r.employee.lastName || ''}`.trim() : '') || 'Staff Member';
  const empCode = (r: any) => { const c = r?.employee?.employeeCode || r?.employeeId || '—'; return c.length > 14 ? `${c.substring(0, 8)}…` : c; };
  const empDept = (r: any) => r?.employee?.department?.name || '—';
  const periodStr = (r: any) => r?.payrollPeriod ? `${r.payrollPeriod.month}/${r.payrollPeriod.year}` : `${month}`;

  const execute = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusy(id);
    try { await action(); await Swal.fire('Success', success, 'success'); await load(); }
    catch (cause: any) { await Swal.fire('Unable to complete action', cause.message, 'error'); }
    finally { setBusy(''); }
  };
  const generate = async () => {
    const [year, selectedMonth] = month.split('-').map(Number);
    const result = await Swal.fire({ title: 'Generate monthly salaries?', text: `Salary calculations will be generated for ${month}.`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) await execute('generate', () => payrollService.generateBulkPayroll({ month: selectedMonth, year }), 'Monthly salary records generated.');
  };
  const submit = async (record: PayrollRecord) => {
    const result = await Swal.fire({ title: 'Submit salary for approval?', html: `<b>${empName(record)}</b><br>${month}<br>Net payable: ${money(record.netPayable)}`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) await execute(record.id, () => payrollService.submitPayroll(record.id, { version: record.version }), 'Salary submitted to Super Admin.');
  };
  const review = async (record: PayrollRecord, action: 'approve' | 'reject' | 'hold' | 'correction') => {
    const remarksRequired = action !== 'approve';
    const result = await Swal.fire({ title: `${action === 'correction' ? 'Return for correction' : action} salary?`, html: `<b>${empName(record)}</b><br>Net payable: ${money(record.netPayable)}`, input: 'textarea', inputLabel: 'Remarks', inputValidator: (value) => remarksRequired && !value?.trim() ? 'Remarks are required.' : undefined, showCancelButton: true });
    if (!result.isConfirmed) return;
    const body = { version: record.version, remarks: result.value || '' };
    const request = action === 'approve' ? payrollService.approvePayroll(record.id, body)
      : action === 'reject' ? payrollService.rejectPayroll(record.id, body)
      : action === 'hold' ? payrollService.holdPayroll(record.id, body)
      : payrollService.returnPayrollForCorrection(record.id, body);
    await execute(record.id, () => request, `Salary ${action === 'correction' ? 'returned for correction' : `${action}d`}.`);
  };
  const sendFinance = async (record: PayrollRecord) => {
    const result = await Swal.fire({ title: 'Send approved salary to Finance?', html: `<b>${empName(record)}</b><br>${money(record.netPayable)}`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) await execute(record.id, () => payrollService.sendPayrollToFinance([{ id: record.id, version: record.version }]), 'Salary sent to Finance.');
  };
  const start = async (record: PayrollRecord) => {
    const result = await Swal.fire({ title: 'Start salary processing?', html: `<b>${empName(record)}</b><br>${money(record.netPayable)}`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) await execute(record.id, () => payrollService.startPayrollProcessing(record.id, { version: record.version }), 'Salary moved to processing.');
  };
  const paid = async (record: PayrollRecord) => {
    const result = await Swal.fire({
      title: 'Mark salary as paid?', html: `<b>${empName(record)}</b><br>${month}<br>${money(record.netPayable)}`,
      input: 'text', inputLabel: 'UTR Number', inputPlaceholder: 'UTR123456789',
      inputValidator: (value) => !value?.trim() ? 'UTR number is required.' : undefined, showCancelButton: true,
    });
    if (!result.isConfirmed) return;
    await execute(record.id, () => payrollService.markPayrollPaid(record.id, {
      version: record.version, paymentDate: new Date().toISOString(), paymentMode: 'BANK_TRANSFER',
      paidAmount: record.netPayable, utrNumber: result.value, transactionReference: result.value,
    }), 'Salary payment completed and salary slip generated.');
  };
  const viewSlip = (record: PayrollRecord) => {
    const slipId = record.salarySlip?.id || record.id;
    router.push(mode === 'employee' ? `/employee/salary-slips/${slipId}` : `/finance/salary/history/${record.id}/salary-slip`);
  };
  const downloadSlip = async (record: PayrollRecord) => {
    try {
      const slip = record.salarySlip || await payrollService.getSalarySlipByPayrollId(record.id);
      await payrollService.downloadSalarySlipPdf(slip.id);
      await Swal.fire('Downloaded', 'Salary slip downloaded successfully.', 'success');
    } catch (error: any) { await Swal.fire('Download failed', error.message, 'error'); }
  };
  const shareSlip = async (record: PayrollRecord) => {
    try {
      const slip = record.salarySlip || await payrollService.getSalarySlipByPayrollId(record.id);
      const result = await Swal.fire({
        title: 'Share Salary Slip', html: `Create a secure link for <b>${empName(record)}</b> — ${periodStr(record)}.`,
        input: 'select', inputOptions: { 24: '24 hours', 72: '3 days', 168: '7 days', 720: '30 days' },
        inputLabel: 'Link validity', showCancelButton: true, confirmButtonText: 'Create Secure Link',
      });
      if (!result.isConfirmed) return;
      const share = await payrollService.createSalarySlipShare(slip.id, { validHours: Number(result.value), allowDownload: true });
      const url = `${window.location.origin}/salary-slip/shared/${share.token}`;
      const choice = await Swal.fire({ title: 'Secure share link created successfully.', html: `<input value="${url}" readonly style="width:100%;padding:8px">`, showDenyButton: true, showCancelButton: true, confirmButtonText: 'Copy / Share', denyButtonText: 'Revoke Link', cancelButtonText: 'Close' });
      if (choice.isConfirmed) {
        if (navigator.share) await navigator.share({ title: `Salary Slip — ${empName(record)}`, url });
        else await navigator.clipboard.writeText(url);
        await Swal.fire('Ready to share', 'The secure link was copied or shared successfully.', 'success');
      } else if (choice.isDenied) {
        const confirmation = await Swal.fire({ title: 'Revoke salary-slip link?', text: 'Anyone using this link will immediately lose access.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Revoke' });
        if (confirmation.isConfirmed) {
          await payrollService.revokeSalarySlipShare(share.id);
          await Swal.fire('Link revoked', 'The salary-slip link is no longer available.', 'success');
        }
      }
    } catch (error: any) { await Swal.fire('Unable to share salary slip', error.message, 'error'); }
  };
  const actions = (record: PayrollRecord) => {
    const isPaid = record.status === 'PAID' || record.status === 'SALARY_PAID' || !!record.salarySlip;
    if (mode === 'prepare' && (record.status === 'DRAFT' || record.status === 'RETURNED_TO_HR')) return <button onClick={() => submit(record)}>Submit</button>;
    if (mode === 'super-admin') {
      if (['PENDING_SUPER_ADMIN_APPROVAL', 'ON_HOLD', 'HR_VERIFIED'].includes(record.status)) {
        return (
          <div className="button-group">
            <button onClick={() => review(record, 'approve')}>Approve</button>
            <button className="secondary" onClick={() => review(record, 'hold')}>Hold</button>
            <button className="secondary" onClick={() => review(record, 'correction')}>Return to HR</button>
            <button className="danger" onClick={() => review(record, 'reject')}>Reject</button>
          </div>
        );
      }
      if (isPaid) {
        return (
          <div className="button-group">
            <button onClick={() => viewSlip(record)}>View Slip</button>
            <button className="secondary" onClick={() => downloadSlip(record)}>Download</button>
            <button className="secondary" onClick={() => shareSlip(record)}>Share</button>
          </div>
        );
      }
      return <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Processed ({(record.status || '').replaceAll('_', ' ')})</span>;
    }
    if (mode === 'finance' || mode === 'payment') {
      if (record.status === 'PENDING_FINANCE' || record.status === 'SUPER_ADMIN_APPROVED') {
        return (
          <div className="button-group">
            <button onClick={() => start(record)}>Start Processing</button>
            <button className="secondary" onClick={() => paid(record)}>Mark Paid</button>
          </div>
        );
      }
      if (record.status === 'PROCESSING') {
        return <button onClick={() => paid(record)}>Mark Paid</button>;
      }
      if (isPaid) {
        return (
          <div className="button-group">
            <button onClick={() => viewSlip(record)}>View Slip</button>
            <button className="secondary" onClick={() => downloadSlip(record)}>Download</button>
            <button className="secondary" onClick={() => shareSlip(record)}>Share</button>
          </div>
        );
      }
      return <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Status: {(record.status || '').replaceAll('_', ' ')}</span>;
    }
    if (mode === 'history' || mode === 'employee') return <div className="button-group"><button onClick={() => viewSlip(record)}>View Slip</button><button className="secondary" onClick={() => downloadSlip(record)}>Download</button><button className="secondary" onClick={() => shareSlip(record)}>Share</button></div>;
    return null;
  };

  return (
    <main className="payroll-page">
      <header className="payroll-hero">
        <div>
          <span className="payroll-eyebrow">Database-backed payroll</span>
          <h1>{title[mode]}</h1>
          <p className="subtitle">Attendance, calculations, approvals, payments and immutable salary slips from PostgreSQL</p>
        </div>
        <div className="payroll-live">
          <span></span>Live PostgreSQL Engine
        </div>
      </header>

      <section className="payroll-stats">
        <article>
          <span>Records</span>
          <strong>{safeRecords.length}</strong>
          <small>Total active entries</small>
        </article>
        <article>
          <span>Gross earnings</span>
          <strong>{money(totals.gross)}</strong>
          <small>Calculated base + allowances</small>
        </article>
        <article>
          <span>Deductions</span>
          <strong>{money(totals.deductions)}</strong>
          <small>PF, ESIC, PT, LOP</small>
        </article>
        <article className="payroll-net-card">
          <span>Net payable</span>
          <strong>{money(totals.net)}</strong>
          <small>Final disbursement total</small>
        </article>
      </section>

      <section className="payroll-control-card">
        <div className="payroll-section-title">
          <h2>Salary Cycle &amp; Generation</h2>
          <p>Select target month to inspect or run automated batch payroll calculations</p>
        </div>
        <div className="toolbar">
          <label>
            <span>Salary month</span>
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
          {mode === 'prepare' && (
            <button disabled={!!busy} onClick={generate}>
              {busy === 'generate' ? 'Generating…' : '💥 Generate Monthly Salary'}
            </button>
          )}
          <button className="secondary" onClick={load}>🔄 Refresh Data</button>
        </div>
      </section>

      <section className="payroll-content-card">
        <div className="payroll-content-head">
          <div>
            <h2>
              {mode === 'super-admin'
                ? (activeTab === 'pending' ? 'Pending Approvals' : 'Approval History')
                : mode === 'finance' || mode === 'payment'
                ? (activeTab === 'pending' ? 'Pending Disbursement' : 'Disbursement History')
                : 'Payroll Register'}
            </h2>
            <p>
              {mode === 'super-admin'
                ? (activeTab === 'pending' ? 'Salary calculations awaiting Super Admin verification' : 'Historical record of processed salary approvals')
                : mode === 'finance' || mode === 'payment'
                ? (activeTab === 'pending' ? 'Approved salary records ready for payment processing & disbursement' : 'Historical record of completed salary disbursements')
                : `Detailed salary calculations per employee for period ${month}`}
            </p>
          </div>
          {(mode === 'super-admin' || mode === 'finance' || mode === 'payment') && (
            <div 
              className="tabs erp-tab-scroll-bar hr-payroll-tab-bar"
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box',
                scrollBehavior: 'smooth',
                touchAction: 'pan-x',
                cursor: 'grab',
                paddingBottom: '2px',
                paddingRight: '12px'
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
              <button 
                className={activeTab === 'pending' ? '' : 'secondary'} 
                onClick={() => setActiveTab('pending')}
                style={{ whiteSpace: 'nowrap', flexShrink: 0, userSelect: 'none' }}
              >
                {mode === 'finance' || mode === 'payment' ? 'Pending Disbursement' : 'Pending Approvals'} ({pendingRecords.length})
              </button>
              <button 
                className={activeTab === 'history' ? '' : 'secondary'} 
                onClick={() => setActiveTab('history')}
                style={{ whiteSpace: 'nowrap', flexShrink: 0, userSelect: 'none' }}
              >
                {mode === 'finance' || mode === 'payment' ? 'Disbursement History' : 'Approval History'} ({historyRecords.length})
              </button>
            </div>
          )}
        </div>
        {/* Desktop Table View */}
        <div className="desktop-only table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th className="payroll-col-optional">Department</th>
                <th>Month</th>
                <th className="payroll-col-optional">Working</th>
                <th className="payroll-col-optional">Paid</th>
                <th className="payroll-col-optional">Unpaid</th>
                <th>Gross</th>
                <th>Deductions</th>
                <th>Net</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={12} style={{ textAlign: 'center', padding: '30px' }}>⏳ Loading payroll records…</td></tr>}
              {!loading && error && <tr><td colSpan={12} style={{ textAlign: 'center', padding: '30px' }}><button onClick={load}>Retry</button> {error}</td></tr>}
              {!loading && !error && !safeRecords.length && <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No payroll records found for this stage and month. Click "Generate Monthly Salary" above to create them.</td></tr>}
              {safeRecords.map((record) => (
                <React.Fragment key={record.id || Math.random()}>
                  <tr>
                    <td>
                      <button className="emp-name-btn" onClick={() => setExpanded(expanded === record.id ? '' : record.id)}>
                        {empName(record)}
                      </button>
                    </td>
                    <td><code className="emp-code-badge">{empCode(record)}</code></td>
                    <td className="payroll-col-optional">{empDept(record)}</td>
                    <td>{periodStr(record)}</td>
                    <td className="payroll-col-optional">{record.standardWorkingDays || 25}</td>
                    <td className="payroll-col-optional">{record.payableDays || 0}</td>
                    <td className="payroll-col-optional">{record.unpaidLeaveDays || 0}</td>
                    <td><strong>{money(record.grossEarnings)}</strong></td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{money(record.totalDeductions)}</td>
                    <td><strong style={{ color: '#0284c7', fontSize: '13.5px' }}>{money(record.netPayable)}</strong></td>
                    <td>
                      <span className={`status status-${(record.status || 'DRAFT').toLowerCase()}`}>
                        {(record.status || 'DRAFT').replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td><div className="actions">{actions(record)}</div></td>
                  </tr>
                  {expanded === record.id && (
                    <tr>
                      <td colSpan={12} className="details">
                        <h3>Complete salary calculation breakdown</h3>
                        <div className="payroll-stats breakdown-stats">
                          <article><span>Basic Pay</span><strong>{money(record.basicSalary)}</strong></article>
                          <article><span>HRA</span><strong>{money(record.hra)}</strong></article>
                          <article><span>PF Deduction</span><strong>{money(record.pfDeduction)}</strong></article>
                          <article><span>ESIC Deduction</span><strong>{money(record.esicDeduction)}</strong></article>
                        </div>
                        <details style={{ marginTop: '12px' }}>
                          <summary>Inspect Audit Trail & Raw Snapshot JSON</summary>
                          <pre>{JSON.stringify(record.salarySlip?.snapshotJson || record.attendanceSummary || record.statusHistory, null, 2)}</pre>
                        </details>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Horizontal List Cards */}
        <div className="mobile-only payroll-mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px' }}>
          {loading && <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>⏳ Loading payroll records…</div>}
          {!loading && error && <div style={{ textAlign: 'center', padding: '30px', color: '#ef4444' }}><button onClick={load}>Retry</button> {error}</div>}
          {!loading && !error && !safeRecords.length && (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b', fontSize: '13px' }}>
              No payroll records found for this stage and month.
            </div>
          )}
          {safeRecords.map((record) => (
            <div
              key={record.id || Math.random()}
              className="payroll-mobile-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Header: Employee Name + ID + Month & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <button
                    className="emp-name-btn"
                    onClick={() => setExpanded(expanded === record.id ? '' : record.id)}
                    style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}
                  >
                    {empName(record)}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <code className="emp-code-badge">{empCode(record)}</code>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>• {periodStr(record)}</span>
                  </div>
                </div>
                <span className={`status status-${(record.status || 'DRAFT').toLowerCase()}`}>
                  {(record.status || 'DRAFT').replaceAll('_', ' ')}
                </span>
              </div>

              {/* Department & Attendance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Dept: </span>
                  <strong>{empDept(record)}</strong>
                </div>
                <div>
                  <span>Working: <strong>{record.standardWorkingDays || 25}d</strong></span>
                  <span style={{ marginLeft: '6px', color: '#16a34a' }}>Paid: <strong>{record.payableDays || 0}d</strong></span>
                  {Number(record.unpaidLeaveDays || 0) > 0 && (
                    <span style={{ marginLeft: '6px', color: '#dc2626' }}>Unpaid: <strong>{record.unpaidLeaveDays}d</strong></span>
                  )}
                </div>
              </div>

              {/* 3-Column Financial Breakdown Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '8px',
                padding: '8px',
                gap: '4px',
                textAlign: 'center',
              }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Gross</span>
                  <strong style={{ fontSize: '12px', color: '#1e293b' }}>{money(record.grossEarnings)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Deductions</span>
                  <strong style={{ fontSize: '12px', color: '#ef4444' }}>{money(record.totalDeductions)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Net Payable</span>
                  <strong style={{ fontSize: '12px', color: '#0284c7' }}>{money(record.netPayable)}</strong>
                </div>
              </div>

              {/* Expanded Breakdown Drawer if clicked */}
              {expanded === record.id && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Salary Calculation Breakdown:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div>Basic: <strong>{money(record.basicSalary)}</strong></div>
                    <div>HRA: <strong>{money(record.hra)}</strong></div>
                    <div>PF: <strong>{money(record.pfDeduction)}</strong></div>
                    <div>ESIC: <strong>{money(record.esicDeduction)}</strong></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '6px' }}>
                {actions(record)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
