'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { PayrollRecord, payrollService } from '@/services/payroll/payrollService';
import { useRouter } from 'next/navigation';

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

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [year, selectedMonth] = month.split('-').map(Number);
    try {
      const params = { month: selectedMonth, year, page: 1, pageSize: 100 };
      const result = mode === 'employee'
        ? { items: (await payrollService.getMySalarySlips()).map((slip: any) => ({ ...slip.payrollRecord, employee: slip.employee, salarySlip: slip })), pagination: { page: 1, pageSize: 100, total: 0, totalPages: 1 } }
        : mode === 'super-admin' ? await payrollService.getPendingApprovals(params)
        : mode === 'finance' ? await payrollService.getFinancePendingPayroll(params)
        : mode === 'payment' ? await payrollService.getProcessingPayroll(params)
        : mode === 'history' || mode === 'payslips' ? await payrollService.getPayrollHistory(params)
        : await payrollService.getPayrollRecords(params);
      setRecords(result.items);
    } catch (cause: any) { setError(cause.message); }
    finally { setLoading(false); }
  }, [mode, month]);
  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => records.reduce((sum, record) => ({
    gross: sum.gross + Number(record.grossEarnings), deductions: sum.deductions + Number(record.totalDeductions),
    net: sum.net + Number(record.netPayable),
  }), { gross: 0, deductions: 0, net: 0 }), [records]);

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
    const result = await Swal.fire({ title: 'Submit salary for approval?', html: `<b>${record.employee.fullName}</b><br>${month}<br>Net payable: ${money(record.netPayable)}`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) await execute(record.id, () => payrollService.submitPayroll(record.id, { version: record.version }), 'Salary submitted to Super Admin.');
  };
  const review = async (record: PayrollRecord, action: 'approve' | 'reject' | 'hold' | 'correction') => {
    const remarksRequired = action !== 'approve';
    const result = await Swal.fire({ title: `${action === 'correction' ? 'Return for correction' : action} salary?`, html: `<b>${record.employee.fullName}</b><br>Net payable: ${money(record.netPayable)}`, input: 'textarea', inputLabel: 'Remarks', inputValidator: (value) => remarksRequired && !value?.trim() ? 'Remarks are required.' : undefined, showCancelButton: true });
    if (!result.isConfirmed) return;
    const body = { version: record.version, remarks: result.value || '' };
    const request = action === 'approve' ? payrollService.approvePayroll(record.id, body)
      : action === 'reject' ? payrollService.rejectPayroll(record.id, body)
      : action === 'hold' ? payrollService.holdPayroll(record.id, body)
      : payrollService.returnPayrollForCorrection(record.id, body);
    await execute(record.id, () => request, `Salary ${action === 'correction' ? 'returned for correction' : `${action}d`}.`);
  };
  const sendFinance = async (record: PayrollRecord) => {
    const result = await Swal.fire({ title: 'Send approved salary to Finance?', html: `<b>${record.employee.fullName}</b><br>${money(record.netPayable)}`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) await execute(record.id, () => payrollService.sendPayrollToFinance([{ id: record.id, version: record.version }]), 'Salary sent to Finance.');
  };
  const start = async (record: PayrollRecord) => {
    const result = await Swal.fire({ title: 'Start salary processing?', html: `<b>${record.employee.fullName}</b><br>${money(record.netPayable)}`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) await execute(record.id, () => payrollService.startPayrollProcessing(record.id, { version: record.version }), 'Salary moved to processing.');
  };
  const paid = async (record: PayrollRecord) => {
    const result = await Swal.fire({
      title: 'Mark salary as paid?', html: `<b>${record.employee.fullName}</b><br>${month}<br>${money(record.netPayable)}`,
      input: 'text', inputLabel: 'UTR Number', inputPlaceholder: 'UTR123456789',
      inputValidator: (value) => !value?.trim() ? 'UTR number is required.' : undefined, showCancelButton: true,
    });
    if (!result.isConfirmed) return;
    await execute(record.id, () => payrollService.markPayrollPaid(record.id, {
      version: record.version, paymentDate: new Date().toISOString(), paymentMode: 'BANK_TRANSFER',
      paidAmount: record.netPayable, utrNumber: result.value, transactionReference: result.value,
    }), 'Salary payment completed and salary slip generated.');
  };
  const missingSlip = () => Swal.fire('Salary slip unavailable', 'Salary slip is not available for this paid payroll record.', 'warning');
  const viewSlip = (record: PayrollRecord) => record.salarySlip
    ? router.push(mode === 'employee' ? `/employee/salary-slips/${record.salarySlip.id}` : `/finance/salary/history/${record.id}/salary-slip`)
    : void missingSlip();
  const downloadSlip = async (record: PayrollRecord) => {
    if (!record.salarySlip) return void missingSlip();
    try { await payrollService.downloadSalarySlipPdf(record.salarySlip.id); await Swal.fire('Downloaded', 'Salary slip downloaded successfully.', 'success'); }
    catch (error: any) { await Swal.fire('Download failed', error.message, 'error'); }
  };
  const shareSlip = async (record: PayrollRecord) => {
    if (!record.salarySlip) return void missingSlip();
    const result = await Swal.fire({
      title: 'Share Salary Slip', html: `Create a secure link for <b>${record.employee.fullName}</b> — ${record.payrollPeriod.month}/${record.payrollPeriod.year}.`,
      input: 'select', inputOptions: { 24: '24 hours', 72: '3 days', 168: '7 days', 720: '30 days' },
      inputLabel: 'Link validity', showCancelButton: true, confirmButtonText: 'Create Secure Link',
    });
    if (!result.isConfirmed) return;
    try {
      const share = await payrollService.createSalarySlipShare(record.salarySlip.id, { validHours: Number(result.value), allowDownload: true });
      const url = `${window.location.origin}/salary-slip/shared/${share.token}`;
      const choice = await Swal.fire({ title: 'Secure share link created successfully.', html: `<input value="${url}" readonly style="width:100%;padding:8px">`, showDenyButton: true, showCancelButton: true, confirmButtonText: 'Copy / Share', denyButtonText: 'Revoke Link', cancelButtonText: 'Close' });
      if (choice.isConfirmed) {
        if (navigator.share) await navigator.share({ title: `Salary Slip — ${record.employee.fullName}`, url });
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
    if (mode === 'prepare' && ['DRAFT', 'CORRECTION_REQUIRED'].includes(record.status)) return <button disabled={busy === record.id} onClick={() => submit(record)}>Submit</button>;
    if (mode === 'super-admin' && record.status === 'SUPER_ADMIN_APPROVED') return <button disabled={!!busy} onClick={() => sendFinance(record)}>Send to Finance</button>;
    if (mode === 'super-admin') return <><button disabled={!!busy} onClick={() => review(record, 'approve')}>Approve</button><button disabled={!!busy} onClick={() => review(record, 'reject')}>Reject</button><button disabled={!!busy} onClick={() => review(record, 'hold')}>Hold</button><button disabled={!!busy} onClick={() => review(record, 'correction')}>Return</button></>;
    if (mode === 'finance') return <button disabled={!!busy} onClick={() => start(record)}>Start Processing</button>;
    if (mode === 'payment') return <button disabled={!!busy} onClick={() => paid(record)}>Salary Done</button>;
    if (mode === 'prepare' && record.status === 'SUPER_ADMIN_APPROVED') return <button disabled={!!busy} onClick={() => sendFinance(record)}>Send to Finance</button>;
    if (record.status === 'SALARY_PAID' && record.salarySlip) return <details><summary style={{ cursor: 'pointer' }}>Actions</summary><div style={{ display: 'grid', gap: 5, position: 'absolute', background: '#fff', padding: 8, boxShadow: '0 6px 20px #0002', zIndex: 5 }}>
      <button onClick={() => viewSlip(record)}>View Salary Slip</button>
      <button onClick={() => downloadSlip(record)}>Download PDF</button>
      <button onClick={() => window.open(`/finance/salary/history/${record.id}/salary-slip?print=1`, '_blank')}>Print</button>
      <button onClick={() => shareSlip(record)}>Share</button>
      <button onClick={() => execute(record.id, () => payrollService.enableEmployeeSalarySlipAccess(record.salarySlip.id), 'Salary slip is available to the employee.')}>Make Available to Employee</button>
    </div></details>;
    if (record.status === 'SALARY_PAID') return <button onClick={missingSlip}>View Salary Slip</button>;
    return <span>—</span>;
  };

  return <main className="payroll-page">
    <section className="payroll-hero"><div><span className="payroll-eyebrow">Database-backed payroll</span><h1>{title[mode]}</h1><p className="subtitle">Attendance, calculations, approvals, payments and immutable salary slips from PostgreSQL.</p></div></section>
    <section className="payroll-stats">
      <article><span>Records</span><strong>{records.length}</strong></article>
      <article><span>Gross earnings</span><strong>{money(totals.gross)}</strong></article>
      <article><span>Deductions</span><strong>{money(totals.deductions)}</strong></article>
      <article className="payroll-net-card"><span>Net payable</span><strong>{money(totals.net)}</strong></article>
    </section>
    <section className="payroll-control-card"><div className="toolbar">
      <label><span>Salary month</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
      {mode === 'prepare' && <button disabled={!!busy} onClick={generate}>{busy === 'generate' ? 'Generating…' : 'Generate Monthly Salary'}</button>}
      <button className="secondary" onClick={load}>Refresh</button>
    </div></section>
    <section className="payroll-content-card"><div className="table-wrap"><table><thead><tr>
      {['Employee', 'ID', 'Department', 'Month', 'Working', 'Paid', 'Unpaid', 'Gross', 'Deductions', 'Net', 'Status', 'Actions'].map((label) => <th key={label}>{label}</th>)}
    </tr></thead><tbody>
      {loading && <tr><td colSpan={12}>Loading payroll records…</td></tr>}
      {!loading && error && <tr><td colSpan={12}><button onClick={load}>Retry</button> {error}</td></tr>}
      {!loading && !error && !records.length && <tr><td colSpan={12}>No payroll records are available for this stage and month.</td></tr>}
      {records.map((record) => <React.Fragment key={record.id}><tr>
        <td><button className="secondary" onClick={() => setExpanded(expanded === record.id ? '' : record.id)}>{record.employee.fullName}</button></td>
        <td>{record.employee.employeeCode}</td><td>{record.employee.department?.name}</td><td>{record.payrollPeriod.month}/{record.payrollPeriod.year}</td>
        <td>{record.standardWorkingDays}</td><td>{record.payableDays}</td><td>{record.unpaidLeaveDays}</td>
        <td>{money(record.grossEarnings)}</td><td>{money(record.totalDeductions)}</td><td>{money(record.netPayable)}</td>
        <td className="status">{record.status.replaceAll('_', ' ')}</td><td><div className="actions">{actions(record)}</div></td>
      </tr>{expanded === record.id && <tr><td colSpan={12} className="details">
        <h3>Complete salary calculation</h3>
        <div className="payroll-stats"><article><span>Basic</span><strong>{money(record.basicSalary)}</strong></article><article><span>HRA</span><strong>{money(record.hra)}</strong></article><article><span>PF</span><strong>{money(record.pfDeduction)}</strong></article><article><span>ESIC</span><strong>{money(record.esicDeduction)}</strong></article></div>
        <pre>{JSON.stringify(record.salarySlip?.snapshotJson || record.attendanceSummary || record.statusHistory, null, 2)}</pre>
      </td></tr>}</React.Fragment>)}
    </tbody></table></div></section>
  </main>;
}
