'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useERPStore } from '@/store/erpStore';
import {
  PAYMENT_STATUS,
  PAYROLL_STATUS,
  approvePayrollBySuperAdmin,
  closePayroll,
  createPayrollDraft,
  createSalaryPaymentBatch,
  generatePayslips,
  markEmployeePaymentFailed,
  markEmployeePaymentPaid,
  rejectPayrollBySuperAdmin,
  reopenRejectedPayroll,
  retryEmployeePayment,
  selectPayrollRuns,
  submitPayrollToSuperAdmin,
  updatePayrollEmployee,
  verifyPayrollByFinance,
} from '@/store/payrollFlow';

type Mode = 'prepare' | 'super-admin' | 'finance' | 'payment' | 'payslips' | 'history' | 'employee';

const money = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const statuses: Record<Mode, string[]> = {
  prepare: [PAYROLL_STATUS.PAYROLL_DRAFT, PAYROLL_STATUS.SUPER_ADMIN_REJECTED, PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL],
  'super-admin': [PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL, PAYROLL_STATUS.SUPER_ADMIN_REJECTED, PAYROLL_STATUS.SUPER_ADMIN_APPROVED],
  finance: [PAYROLL_STATUS.SUPER_ADMIN_APPROVED],
  payment: [PAYROLL_STATUS.FINANCE_VERIFIED, PAYROLL_STATUS.PAYMENT_PROCESSING, PAYROLL_STATUS.PARTIALLY_PAID, PAYROLL_STATUS.SALARY_PAID],
  payslips: [PAYROLL_STATUS.SALARY_PAID, PAYROLL_STATUS.PAYSLIP_GENERATED],
  history: Object.values(PAYROLL_STATUS),
  employee: [PAYROLL_STATUS.PAYSLIP_GENERATED, PAYROLL_STATUS.PAYROLL_CLOSED],
};

const titles: Record<Mode, [string, string]> = {
  prepare: ['Prepare Salary', 'Generate, review, correct, and submit payroll to Super Admin.'],
  'super-admin': ['Payroll Analysis & Approvals', 'Review payroll totals, exceptions, and employee calculations.'],
  finance: ['Salary Verification', 'Only payrolls approved by Super Admin are available here.'],
  payment: ['Salary Disbursement', 'Create payment batches and resolve employee-level payment exceptions.'],
  payslips: ['Payslip Generation', 'Payslips are available only for successfully paid employees.'],
  history: ['Payroll History', 'Close completed payrolls; closed records remain read-only.'],
  employee: ['My Payslips', 'View generated and closed payroll payslips.'],
};

const notifyError = (error: unknown) => Swal.fire('Action blocked', error instanceof Error ? error.message : String(error), 'warning');
const runAction = async (callback: () => void, message?: string) => {
  try {
    callback();
    if (message) await Swal.fire('Success', message, 'success');
  } catch (error) {
    await notifyError(error);
  }
};

export default function PayrollWorkflowView({ mode }: { mode: Mode }) {
  const rawRuns = useERPStore((store: any) => store.state?.payrollRuns);
  const runs = useMemo(() => selectPayrollRuns({ payrollRuns: rawRuns }), [rawRuns]);
  const [month, setMonth] = useState('2026-07');
  const [payrollId, setPayrollId] = useState('');
  const [expanded, setExpanded] = useState<string>('');
  const [tab, setTab] = useState(new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('tab') || 'All');

  const shown = useMemo(() => runs.filter((run: any) => {
    if (!statuses[mode].includes(run.status)) return false;
    if (tab === 'Rejected') return run.status === PAYROLL_STATUS.SUPER_ADMIN_REJECTED;
    if (tab === 'Pending') return run.status === PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL;
    if (tab === 'Approved') return run.status === PAYROLL_STATUS.SUPER_ADMIN_APPROVED;
    if (tab === 'Failed') return run.employees.some((line: any) => line.paymentStatus === PAYMENT_STATUS.PAYMENT_FAILED);
    return true;
  }), [runs, mode, tab]);
  const summary = useMemo(() => shown.reduce((result: any, run: any) => ({
    employees: result.employees + Number(run.employees?.length || 0),
    gross: result.gross + Number(run.totals?.grossSalary || 0),
    deductions: result.deductions + Number(run.totals?.totalDeductions || 0),
    net: result.net + Number(run.totals?.netPayable || 0),
  }), { employees: 0, gross: 0, deductions: 0, net: 0 }), [shown]);

  const create = () => runAction(
    () => createPayrollDraft(month, { payrollId: payrollId.trim() || undefined }, 'HR'),
    'Payroll draft saved and will remain available after refresh.',
  );

  const submit = async (run: any) => {
    const result = await Swal.fire({ title: 'Submit to Super Admin?', text: 'HR editing will be locked after submission.', icon: 'question', showCancelButton: true, confirmButtonText: 'Submit to Super Admin' });
    if (result.isConfirmed) await runAction(() => submitPayrollToSuperAdmin(run.id), 'Payroll submitted to Super Admin.');
  };

  const approve = async (run: any) => {
    const result = await Swal.fire({ title: 'Approve and Send to Finance?', input: 'textarea', inputLabel: 'Approval remarks', showCancelButton: true, confirmButtonText: 'Approve and Send to Finance' });
    if (result.isConfirmed) await runAction(() => approvePayrollBySuperAdmin(run.id, result.value || ''), 'Payroll approved and sent to Finance.');
  };

  const reject = async (run: any) => {
    const result = await Swal.fire({ title: 'Reject payroll', input: 'textarea', inputLabel: 'Rejection reason', inputValidator: (value) => !value?.trim() ? 'Rejection reason is required.' : undefined, showCancelButton: true, confirmButtonText: 'Reject' });
    if (result.isConfirmed) await runAction(() => rejectPayrollBySuperAdmin(run.id, result.value));
  };

  const batch = async (run: any) => {
    if (run.status === PAYROLL_STATUS.FINANCE_VERIFIED) {
      await runAction(() => createSalaryPaymentBatch(run.id, { paymentMode: 'Bank Transfer' }), 'Payment batch generated; salary processing started.');
      return;
    }
    const processable = run.employees.filter((line: any) => line.paymentStatus === PAYMENT_STATUS.PAYMENT_PROCESSING);
    for (const line of processable) {
      await runAction(() => markEmployeePaymentPaid(run.id, line.employeeId, { transactionReference: `TXN-${line.employeeId}-${Date.now()}`, paymentMode: 'Bank Transfer' }));
    }
    await Swal.fire('Payments updated', `${processable.length} payment(s) marked successful.`, 'success');
  };

  const editDeduction = async (run: any, line: any) => {
    if (run.status === PAYROLL_STATUS.SUPER_ADMIN_REJECTED) {
      await runAction(() => reopenRejectedPayroll(run.id), 'Payroll opened for correction.');
      return;
    }
    const result = await Swal.fire({ title: `Edit deduction — ${line.employeeName}`, input: 'number', inputValue: line.deductions.otherDeductions || 0, inputAttributes: { min: '0', step: '1' }, showCancelButton: true, confirmButtonText: 'Save correction' });
    if (result.isConfirmed) await runAction(() => updatePayrollEmployee(run.id, line.employeeId, { deductions: { otherDeductions: Number(result.value || 0) } }), 'Salary recalculated.');
  };

  const reopen = async (run: any) => {
    try {
      reopenRejectedPayroll(run.id);
      setTab('All');
      await Swal.fire('Success', 'Payroll opened for correction.', 'success');
    } catch (error) {
      await notifyError(error);
    }
  };

  const retry = async (run: any, employeeId: string) => {
    try {
      retryEmployeePayment(run.id, employeeId);
      setTab('All');
      await Swal.fire('Success', 'Payment returned to processing queue.', 'success');
    } catch (error) {
      await notifyError(error);
    }
  };

  const primary = (run: any) => {
    if (mode === 'prepare') {
      if (run.status === PAYROLL_STATUS.SUPER_ADMIN_REJECTED) return <button onClick={() => reopen(run)}>Correct Payroll</button>;
      if (run.status === PAYROLL_STATUS.PAYROLL_DRAFT) return <button onClick={() => submit(run)}>Submit to Super Admin</button>;
      return <button disabled>Submitted</button>;
    }
    if (mode === 'super-admin' && run.status === PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL) return <><button onClick={() => approve(run)}>Approve and Send to Finance</button><button className="danger" onClick={() => reject(run)}>Reject</button></>;
    if (mode === 'finance') return <button onClick={() => runAction(() => verifyPayrollByFinance(run.id), 'Payroll verified and ready for disbursement.')}>Verify Payroll</button>;
    if (mode === 'payment') {
      if (run.status === PAYROLL_STATUS.FINANCE_VERIFIED) return <button onClick={() => batch(run)}>Generate Payment Batch</button>;
      if ([PAYROLL_STATUS.PAYMENT_PROCESSING, PAYROLL_STATUS.PARTIALLY_PAID].includes(run.status)) return <button onClick={() => batch(run)}>Mark All Processing Paid</button>;
    }
    if (mode === 'payslips' && run.status === PAYROLL_STATUS.SALARY_PAID) return <button onClick={() => runAction(() => generatePayslips(run.id), 'Payslips generated.')}>Generate Payslips</button>;
    if (mode === 'history' && run.status === PAYROLL_STATUS.PAYSLIP_GENERATED) return <button onClick={() => runAction(() => closePayroll(run.id), 'Payroll closed and is now read-only.')}>Close Payroll</button>;
    return null;
  };

  return <main className="payroll-page">
    <section className="payroll-hero">
      <div><span className="payroll-eyebrow">Payroll workspace</span><h1>{titles[mode][0]}</h1><p className="subtitle">{titles[mode][1]}</p></div>
      <div className="payroll-live"><span />Central payroll state</div>
    </section>
    <section className="payroll-stats" aria-label="Payroll summary">
      <article><span>Payroll runs</span><strong>{shown.length}</strong><small>Current workflow stage</small></article>
      <article><span>Employees</span><strong>{summary.employees}</strong><small>Included salary lines</small></article>
      <article><span>Gross payroll</span><strong>{money(summary.gross)}</strong><small>Before deductions</small></article>
      <article className="payroll-net-card"><span>Net payable</span><strong>{money(summary.net)}</strong><small>{money(summary.deductions)} deductions</small></article>
    </section>
    {mode === 'prepare' && <section className="payroll-control-card">
      <div className="payroll-section-title"><h2>Create payroll run</h2><p>Select a salary month and optionally provide your own payroll reference.</p></div>
      <div className="toolbar">
        <label><span>Salary month</span><input aria-label="Salary Month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
        <label><span>Payroll ID</span><input aria-label="Payroll ID" placeholder="e.g. PAY-2026-07" value={payrollId} onChange={(event) => setPayrollId(event.target.value)} /></label>
        <button onClick={create}>Generate Payroll</button>
      </div>
    </section>}
    <section className="payroll-content-card">
    <div className="payroll-content-head"><div><h2>Payroll records</h2><p>{shown.length} record{shown.length === 1 ? '' : 's'} available</p></div>
    {(mode === 'super-admin' || mode === 'payment' || mode === 'prepare') && <div className="tabs">
      {['All', ...(mode === 'super-admin' ? ['Pending', 'Approved', 'Rejected'] : []), ...(mode === 'payment' ? ['Failed'] : []), ...(mode === 'prepare' ? ['Rejected'] : [])].map((name) =>
        <button className={tab === name ? '' : 'secondary'} key={name} onClick={() => setTab(name)}>{name}</button>)}
    </div>}</div>
    <div className="table-wrap"><table><thead><tr>
      {['Payroll', 'Month', 'Employees', 'Gross', 'Deductions', 'Net Payable', 'Status', 'Action'].map((label) => <th key={label}>{label}</th>)}
    </tr></thead><tbody>
      {!shown.length && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#5E6B82', padding: 32 }}>No payroll records available for this stage.</td></tr>}
      {shown.map((run: any) => <React.Fragment key={run.id}><tr>
        <td>{run.id}</td><td>{run.salaryMonth}</td><td>{run.employees.length}</td><td>{money(run.totals?.grossSalary)}</td>
        <td>{money(run.totals?.totalDeductions)}</td><td>{money(run.totals?.netPayable)}</td><td className="status">{run.status}</td>
        <td><div className="actions"><button className="secondary" onClick={() => setExpanded(expanded === run.id ? '' : run.id)}>{expanded === run.id ? 'Hide' : 'View / Review'}</button>{primary(run)}</div></td>
      </tr>{expanded === run.id && <tr><td colSpan={8} className="details">
        {run.status === PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL && mode === 'prepare' && <div className="warning">Payroll is pending Super Admin approval and cannot be edited.</div>}
        {run.status === PAYROLL_STATUS.SUPER_ADMIN_REJECTED && <div className="warning"><strong>Rejection reason:</strong> {run.superAdminApproval?.remarks || 'See revision history.'}</div>}
        {mode === 'finance' && run.employees.some((line: any) => !line.bankDetailsValid) && <div className="warning">
          {run.employees.filter((line: any) => !line.bankDetailsValid).length} employee(s) have missing or invalid bank details. Affected payments will be excluded.
        </div>}
        <table><thead><tr>{['Employee', 'Department', 'Present Days', 'Gross', 'Deduction', 'Net Salary', 'Payment Status', 'Transaction / Payment Date', 'Action'].map((label) => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>{run.employees.map((line: any) => <tr key={line.employeeId}><td>{line.employeeId}<br />{line.employeeName}</td><td>{line.department}</td><td>{line.attendance?.presentDays}</td><td>{money(line.grossSalary)}</td><td>{money(line.totalDeductions)}</td><td>{money(line.netSalary)}</td><td>{!line.bankDetailsValid && mode === 'finance' ? 'INVALID_BANK_DETAILS' : line.paymentStatus}</td>
            <td>{line.transactionReference || '—'}<br />{line.paymentDate ? new Date(line.paymentDate).toLocaleDateString('en-IN') : '—'}</td>
            <td><div className="actions">
              {mode === 'prepare' && <button disabled={run.status === PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL} onClick={() => editDeduction(run, line)}>Edit Deduction</button>}
              {mode === 'payment' && line.paymentStatus === PAYMENT_STATUS.PAYMENT_PROCESSING && <><button onClick={() => runAction(() => markEmployeePaymentPaid(run.id, line.employeeId, { transactionReference: `TXN-${line.employeeId}`, paymentMode: 'Bank Transfer' }))}>Mark Paid</button><button className="danger" onClick={() => runAction(() => markEmployeePaymentFailed(run.id, line.employeeId, 'Payment failed'))}>Mark Failed</button></>}
              {mode === 'payment' && line.paymentStatus === PAYMENT_STATUS.PAYMENT_FAILED && <button onClick={() => retry(run, line.employeeId)}>Retry Payment</button>}
            </div></td></tr>)}</tbody></table>
        <details><summary>Revision history</summary><pre>{JSON.stringify(run.revisionHistory, null, 2)}</pre></details>
      </td></tr>}</React.Fragment>)}
    </tbody></table></div></section>
  </main>;
}
