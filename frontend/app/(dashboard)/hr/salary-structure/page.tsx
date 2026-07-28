'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useERPStore } from '@/store/erpStore';
import Swal from 'sweetalert2';
import { Settings, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export default function SalaryStructurePage() {
  const employees = useERPStore((store: any) =>
    Array.isArray(store.state?.employees) ? store.state.employees : []
  );
  const setState = useERPStore((store: any) => store.setState);
  const storeState = useERPStore((store: any) => store.state);

  const [configModal, setConfigModal] = useState<{ open: boolean; employee: any | null }>({ open: false, employee: null });
  const [configForm, setConfigForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const openConfig = (employee: any) => {
    setConfigForm({
      baseSalary: employee.baseSalary || employee.salary || '',
      hra: employee.hra || '',
      conveyance: employee.conveyance || '',
      medicalAllowance: employee.medicalAllowance || '',
      allowance: employee.allowance || employee.otherAllowances || '',
      pfApplicable: employee.pfApplicable ?? false,
      esiApplicable: employee.esiApplicable ?? false,
      professionalTax: employee.professionalTax || 200,
      tds: employee.tds || 0,
      overtimeRate: employee.overtimeRate || 0,
      loanDeduction: employee.loanDeduction || 0,
      advanceRecovery: employee.advanceRecovery || 0,
      bankName: employee.bankName || '',
      bankAccountHolder: employee.bankAccountHolder || employee.name || '',
      bankAccount: employee.bankAccount || '',
      ifscCode: employee.ifscCode || employee.ifsc || '',
      branchName: employee.branchName || '',
      accountType: employee.accountType || 'Savings',
      salaryEffectiveDate: employee.salaryEffectiveDate || new Date().toISOString().split('T')[0],
    });
    setConfigModal({ open: true, employee });
  };

  const handleSaveConfig = async () => {
    const emp = configModal.employee;
    if (!emp) return;
    if (!configForm.baseSalary || Number(configForm.baseSalary) <= 0) {
      Swal.fire('Validation Error', 'Basic Salary is required and must be greater than 0.', 'error');
      return;
    }
    if (!configForm.bankAccount) {
      Swal.fire('Validation Error', 'Bank Account Number is required for payroll.', 'error');
      return;
    }
    if (!configForm.ifscCode || !ifscRegex.test(configForm.ifscCode.toUpperCase())) {
      Swal.fire('Validation Error', 'Valid IFSC Code is required.', 'error');
      return;
    }
    if (!configForm.salaryEffectiveDate) {
      Swal.fire('Validation Error', 'Salary Effective Date is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const updatedEmployees = (storeState?.employees || []).map((e: any) => {
        if (e.id !== emp.id) return e;
        return {
          ...e,
          baseSalary: Number(configForm.baseSalary),
          salary: Number(configForm.baseSalary), // compat
          basic: Number(configForm.baseSalary),
          hra: Number(configForm.hra) || 0,
          conveyance: Number(configForm.conveyance) || 0,
          medicalAllowance: Number(configForm.medicalAllowance) || 0,
          allowance: Number(configForm.allowance) || 0,
          pfApplicable: Boolean(configForm.pfApplicable),
          esiApplicable: Boolean(configForm.esiApplicable),
          professionalTax: Number(configForm.professionalTax) || 0,
          tds: Number(configForm.tds) || 0,
          overtimeRate: Number(configForm.overtimeRate) || 0,
          loanDeduction: Number(configForm.loanDeduction) || 0,
          advanceRecovery: Number(configForm.advanceRecovery) || 0,
          bankName: configForm.bankName,
          bankAccountHolder: configForm.bankAccountHolder,
          bankAccount: configForm.bankAccount,
          ifscCode: configForm.ifscCode.toUpperCase(),
          ifsc: configForm.ifscCode.toUpperCase(),
          branchName: configForm.branchName,
          accountType: configForm.accountType,
          salaryEffectiveDate: configForm.salaryEffectiveDate,
          salaryStructureStatus: 'CONFIGURED',
          payrollEligibility: 'ELIGIBLE',
          updatedAt: new Date().toISOString(),
        };
      });

      setState({ ...storeState, employees: updatedEmployees });
      setConfigModal({ open: false, employee: null });
      Swal.fire({ icon: 'success', title: 'Salary Configured', text: `${emp.name}'s salary structure has been configured. They are now eligible for payroll.`, confirmButtonColor: '#2F4375' });
    } catch (err: any) {
      Swal.fire('Error', err?.message || 'Failed to save salary configuration.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: any = { padding: '8px 10px', border: '1.5px solid #DCE5F0', borderRadius: '7px', fontSize: '13px', width: '100%', color: '#24345C', background: '#F8FAFD', outline: 'none' };

  return (
    <main style={{ padding: 24, maxWidth: 1500, margin: 'auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#24345C' }}>Employee Salary Structure</h1>
        <p style={{ color: '#5E6B82', fontSize: '13px', marginTop: '4px' }}>
          Active salary structures and payroll readiness. Employees with <strong>PENDING</strong> status must be configured before they can be included in payroll runs.
        </p>
      </div>

      <div style={{ overflow: 'auto', border: '1px solid #DCE5F0', borderRadius: 12, background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              {['Employee', 'Department', 'Salary Status', 'Basic Salary', 'Bank Details', 'Effective Date', 'Payroll Eligibility', 'Action'].map((label) => (
                <th key={label} style={{ padding: '10px 12px', textAlign: 'left', background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', fontSize: '12px', fontWeight: '700', color: '#5E6B82', whiteSpace: 'nowrap' }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.filter((e: any) => e.recordStatus !== 'ARCHIVED').map((employee: any) => {
              const status = employee.salaryStructureStatus || (employee.baseSalary || employee.salary ? 'CONFIGURED' : 'PENDING');
              const bankValid = Boolean(employee.bankAccount && (employee.ifscCode || employee.ifsc));
              const isConfigured = status === 'CONFIGURED';
              return (
                <tr key={employee.id} style={{ borderBottom: '1px solid #F0F5FB' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: '700', color: '#24345C', fontSize: '13px' }}>{employee.name}</div>
                    <div style={{ fontSize: '11px', color: '#8893A7' }}>{employee.id} · {employee.designation || employee.role}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}>{employee.department}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      background: isConfigured ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                      color: isConfigured ? '#16a34a' : '#d97706',
                    }}>
                      {isConfigured ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                      {isConfigured ? 'CONFIGURED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                    {employee.baseSalary || employee.salary
                      ? `₹${Number(employee.baseSalary || employee.salary).toLocaleString('en-IN')}`
                      : <span style={{ color: '#d97706' }}>Not set</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '12px', color: bankValid ? '#16a34a' : '#ef4444', fontWeight: '600' }}>
                      {bankValid ? '✓ Valid' : '✗ Missing'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#5E6B82' }}>
                    {employee.salaryEffectiveDate ? String(employee.salaryEffectiveDate).slice(0, 10) : <span style={{ color: '#d97706' }}>Not set</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      background: isConfigured && bankValid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: isConfigured && bankValid ? '#16a34a' : '#ef4444',
                    }}>
                      {isConfigured && bankValid ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {isConfigured && bankValid ? 'ELIGIBLE' : 'NOT CONFIGURED'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => openConfig(employee)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', background: isConfigured ? '#F1F5F9' : '#2F4375',
                        color: isConfigured ? '#5E6B82' : '#fff',
                        border: isConfigured ? '1px solid #DCE5F0' : 'none',
                        borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      }}
                    >
                      <Settings size={12} />
                      {isConfigured ? 'Edit Config' : 'Configure Salary'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {employees.filter((e: any) => e.recordStatus !== 'ARCHIVED').length === 0 && (
              <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#8893A7', fontSize: '13px' }}>No active employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Configure Salary Modal ── */}
      {configModal.open && configModal.employee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)', padding: '20px 24px', borderRadius: '16px 16px 0 0', color: '#fff' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Configure Salary Structure</h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>{configModal.employee.name} · {configModal.employee.id}</p>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#5E6B82', borderBottom: '1px solid #E5ECF5', paddingBottom: '8px' }}>EARNINGS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  ['Basic Salary (₹)*', 'baseSalary'],
                  ['HRA (₹)', 'hra'],
                  ['Conveyance (₹)', 'conveyance'],
                  ['Medical Allowance (₹)', 'medicalAllowance'],
                  ['Other Allowances (₹)', 'allowance'],
                  ['Overtime Rate (₹/hr)', 'overtimeRate'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6B82', display: 'block', marginBottom: '4px' }}>{label}</label>
                    <input type="number" min="0" value={configForm[key]} onChange={e => setConfigForm((f: any) => ({ ...f, [key]: e.target.value }))} style={inputStyle} placeholder="0" />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#5E6B82', borderBottom: '1px solid #E5ECF5', paddingBottom: '8px' }}>DEDUCTIONS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="pf" checked={configForm.pfApplicable} onChange={e => setConfigForm((f: any) => ({ ...f, pfApplicable: e.target.checked }))} />
                  <label htmlFor="pf" style={{ fontSize: '12px', fontWeight: '600', color: '#24345C', cursor: 'pointer' }}>PF Applicable (12% of Basic)</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="esi" checked={configForm.esiApplicable} onChange={e => setConfigForm((f: any) => ({ ...f, esiApplicable: e.target.checked }))} />
                  <label htmlFor="esi" style={{ fontSize: '12px', fontWeight: '600', color: '#24345C', cursor: 'pointer' }}>ESI Applicable (0.75% of Gross)</label>
                </div>
                {[
                  ['Professional Tax (₹)', 'professionalTax'],
                  ['TDS (₹)', 'tds'],
                  ['Loan Deduction (₹)', 'loanDeduction'],
                  ['Advance Recovery (₹)', 'advanceRecovery'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6B82', display: 'block', marginBottom: '4px' }}>{label}</label>
                    <input type="number" min="0" value={configForm[key]} onChange={e => setConfigForm((f: any) => ({ ...f, [key]: e.target.value }))} style={inputStyle} placeholder="0" />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#5E6B82', borderBottom: '1px solid #E5ECF5', paddingBottom: '8px' }}>BANK DETAILS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  ['Bank Name', 'bankName'],
                  ['Account Holder', 'bankAccountHolder'],
                  ['Account Number*', 'bankAccount'],
                  ['IFSC Code*', 'ifscCode'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6B82', display: 'block', marginBottom: '4px' }}>{label}</label>
                    <input value={configForm[key]} onChange={e => setConfigForm((f: any) => ({ ...f, [key]: e.target.value }))} style={inputStyle} placeholder={label} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6B82', display: 'block', marginBottom: '4px' }}>Account Type</label>
                  <select value={configForm.accountType} onChange={e => setConfigForm((f: any) => ({ ...f, accountType: e.target.value }))} style={inputStyle}>
                    {['Savings', 'Current', 'Salary'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6B82', display: 'block', marginBottom: '4px' }}>Effective Date*</label>
                  <input type="date" value={configForm.salaryEffectiveDate} onChange={e => setConfigForm((f: any) => ({ ...f, salaryEffectiveDate: e.target.value }))} style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5ECF5', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfigModal({ open: false, employee: null })} style={{ padding: '9px 18px', background: '#F1F5F9', color: '#5E6B82', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSaveConfig} disabled={saving} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #2F4375, #3BAEEB)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> {saving ? 'Saving…' : 'Save & Mark Configured'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
