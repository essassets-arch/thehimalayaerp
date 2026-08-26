'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { calculateSalaryStructure, round, SalaryInputData } from '@/services/payroll/salaryCalculation';
import { payrollService } from '@/services/payroll/payrollService';

interface EmployeeOption {
  id: string;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  department?: any;
  jobTitle?: string;
  status?: string;
}

interface CTCPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  employees: EmployeeOption[];
  existingStructures?: any[];
}

export function CTCPreparationModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
  employees,
  existingStructures = [],
}: CTCPreparationModalProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [wef, setWef] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Salary Component Inputs
  const [basicSalary, setBasicSalary] = useState<string>('25000');
  const [hraPercentage, setHraPercentage] = useState<string>('10');
  const [ltaPercentage, setLtaPercentage] = useState<string>('5');
  const [educationAllowancePercentage, setEducationAllowancePercentage] = useState<string>('5');
  const [conveyancePercentage, setConveyancePercentage] = useState<string>('5');

  // Deduction Inputs
  const [employeeEpfPercentage, setEmployeeEpfPercentage] = useState<string>('12');
  const [employeeEsicPercentage, setEmployeeEsicPercentage] = useState<string>('0.75');
  const [professionalTaxPercentage, setProfessionalTaxPercentage] = useState<string>('0');

  // Company Contribution Inputs
  const [companyEpfPercentage, setCompanyEpfPercentage] = useState<string>('12');
  const [companyEsicPercentage, setCompanyEsicPercentage] = useState<string>('3.25');
  const [gratuityPercentage, setGratuityPercentage] = useState<string>('4.81');

  const [busy, setBusy] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  // Selected employee object
  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);

  // Derived employee details
  const empName = useMemo(() => {
    if (initialData?.employeeNameSnapshot) return initialData.employeeNameSnapshot;
    if (!selectedEmployee) return '—';
    return (
      selectedEmployee.fullName ||
      `${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim() ||
      selectedEmployee.employeeCode
    );
  }, [selectedEmployee, initialData]);

  const empDesignation = useMemo(() => {
    if (initialData?.designationSnapshot) return initialData.designationSnapshot;
    if (!selectedEmployee) return '—';
    return selectedEmployee.jobTitle || 'Staff';
  }, [selectedEmployee, initialData]);

  const empDepartment = useMemo(() => {
    if (initialData?.departmentSnapshot) return initialData.departmentSnapshot;
    if (!selectedEmployee) return '—';
    const dept = selectedEmployee.department;
    return typeof dept === 'object' ? dept?.name : dept || 'General';
  }, [selectedEmployee, initialData]);

  // Filtered employees for dropdown
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const q = employeeSearch.toLowerCase();
    return employees.filter((emp) => {
      const name = (emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`).toLowerCase();
      const code = (emp.employeeCode || '').toLowerCase();
      const dept = (typeof emp.department === 'object' ? emp.department?.name : emp.department || '').toLowerCase();
      const title = (emp.jobTitle || '').toLowerCase();
      return name.includes(q) || code.includes(q) || dept.includes(q) || title.includes(q);
    });
  }, [employees, employeeSearch]);

  // Initialize or reset state when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' || mode === 'view') {
      if (initialData) {
        setSelectedEmployeeId(initialData.employeeId || initialData.employee?.id || '');
        setWef(
          initialData.wef ||
            (initialData.effectiveFrom ? new Date(initialData.effectiveFrom).toISOString().split('T')[0] : '') ||
            new Date().toISOString().split('T')[0]
        );
        setBasicSalary(String(initialData.basicSalary ?? '0'));
        setHraPercentage(String(initialData.hraPercentage ?? '0'));
        setLtaPercentage(String(initialData.ltaPercentage ?? '0'));
        setEducationAllowancePercentage(String(initialData.educationAllowancePercentage ?? '0'));
        setConveyancePercentage(String(initialData.conveyancePercentage ?? '0'));
        setEmployeeEpfPercentage(String(initialData.employeeEpfPercentage ?? '0'));
        setEmployeeEsicPercentage(String(initialData.employeeEsicPercentage ?? '0'));
        setProfessionalTaxPercentage(String(initialData.professionalTaxPercentage ?? '0'));
        setCompanyEpfPercentage(String(initialData.companyEpfPercentage ?? '0'));
        setCompanyEsicPercentage(String(initialData.companyEsicPercentage ?? '0'));
        setGratuityPercentage(String(initialData.gratuityPercentage ?? '4.81'));
        setDuplicateWarning(null);
      }
    } else {
      // Create mode default
      setSelectedEmployeeId('');
      setEmployeeSearch('');
      setWef(new Date().toISOString().split('T')[0]);
      setBasicSalary('25000');
      setHraPercentage('10');
      setLtaPercentage('5');
      setEducationAllowancePercentage('5');
      setConveyancePercentage('5');
      setEmployeeEpfPercentage('12');
      setEmployeeEsicPercentage('0.75');
      setProfessionalTaxPercentage('0');
      setCompanyEpfPercentage('12');
      setCompanyEsicPercentage('3.25');
      setGratuityPercentage('4.81');
      setDuplicateWarning(null);
    }
  }, [isOpen, mode, initialData]);

  // Handle employee selection in Create mode
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    if (!empId) {
      setDuplicateWarning(null);
      return;
    }
    // Check if an active salary structure already exists
    const existing = existingStructures.find((s) => s.employeeId === empId && s.isActive !== false);
    if (existing) {
      setDuplicateWarning(existing);
    } else {
      setDuplicateWarning(null);
    }
  };

  // Live calculation based on current state
  const calculation = useMemo(() => {
    const input: SalaryInputData = {
      basicSalary: parseFloat(basicSalary) || 0,
      hraPercentage: parseFloat(hraPercentage) || 0,
      ltaPercentage: parseFloat(ltaPercentage) || 0,
      educationAllowancePercentage: parseFloat(educationAllowancePercentage) || 0,
      conveyancePercentage: parseFloat(conveyancePercentage) || 0,
      employeeEpfPercentage: parseFloat(employeeEpfPercentage) || 0,
      employeeEsicPercentage: parseFloat(employeeEsicPercentage) || 0,
      professionalTaxPercentage: parseFloat(professionalTaxPercentage) || 0,
      companyEpfPercentage: parseFloat(companyEpfPercentage) || 0,
      companyEsicPercentage: parseFloat(companyEsicPercentage) || 0,
      gratuityPercentage: parseFloat(gratuityPercentage) || 4.81,
    };
    return calculateSalaryStructure(input);
  }, [
    basicSalary,
    hraPercentage,
    ltaPercentage,
    educationAllowancePercentage,
    conveyancePercentage,
    employeeEpfPercentage,
    employeeEsicPercentage,
    professionalTaxPercentage,
    companyEpfPercentage,
    companyEsicPercentage,
    gratuityPercentage,
  ]);

  const money = (val: number | string | undefined) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      Swal.fire({ icon: 'warning', title: 'Employee Required', text: 'Please select an employee.' });
      return;
    }
    if (!wef) {
      Swal.fire({ icon: 'warning', title: 'W.E.F. Required', text: 'Please select the effective date (W.E.F.).' });
      return;
    }
    if (Number(basicSalary) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Invalid Basic Salary', text: 'BASIC salary must be greater than zero.' });
      return;
    }

    try {
      setBusy(true);
      const payload = {
        employeeId: selectedEmployeeId,
        wef,
        effectiveFrom: new Date(wef).toISOString(),
        employeeNameSnapshot: empName,
        designationSnapshot: empDesignation,
        departmentSnapshot: empDepartment,
        basicSalary: calculation.basicSalary,
        hraPercentage: calculation.hraPercentage,
        ltaPercentage: calculation.ltaPercentage,
        educationAllowancePercentage: calculation.educationAllowancePercentage,
        conveyancePercentage: calculation.conveyancePercentage,
        employeeEpfPercentage: calculation.employeeEpfPercentage,
        employeeEsicPercentage: calculation.employeeEsicPercentage,
        professionalTaxPercentage: calculation.professionalTaxPercentage,
        companyEpfPercentage: calculation.companyEpfPercentage,
        companyEsicPercentage: calculation.companyEsicPercentage,
        gratuityPercentage: calculation.gratuityPercentage,
        allowOverride: true,
      };

      if (mode === 'edit' && initialData?.id) {
        await payrollService.updateSalaryStructure(initialData.id, payload);
        Swal.fire({
          icon: 'success',
          title: 'Salary Structure Updated',
          text: `Salary details for ${empName} have been successfully updated.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await payrollService.createSalaryStructure(payload);
        Swal.fire({
          icon: 'success',
          title: 'Salary Structure Created',
          text: `Salary and CTC details for ${empName} have been successfully saved.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save salary structure:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save salary structure.';
      Swal.fire({ icon: 'error', title: 'Save Failed', text: msg });
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {mode === 'view' ? 'C. T. C. DETAILS (Statement)' : mode === 'edit' ? 'Edit Employee Salary Structure & CTC' : 'Create Employee Salary Structure & CTC'}
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
              Monthly salary breakup, statutory deductions, company contribution, and dynamic CTC
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Employee Selection in Create Mode */}
          {mode === 'create' && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Select Employee *
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search by name, ID or department..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  style={{
                    flex: '1 1 200px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  required
                  style={{
                    flex: '2 1 300px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  <option value="">-- Choose Employee --</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeCode} ({emp.employeeCode}) — {typeof emp.department === 'object' ? emp.department?.name : emp.department || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duplicate Active Record Alert */}
              {duplicateWarning && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    ⚠️ <strong>Active Salary Exists:</strong> {empName} already has an active CTC record of{' '}
                    <strong>{money(duplicateWarning.ctcPerMonth)}</strong> (W.E.F. {duplicateWarning.wef || '—'}). Saving will create a new revised active structure.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Employee Information Header Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0284c7', marginBottom: '12px' }}>
              C. T. C. DETAILS
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px', fontWeight: 600 }}>Name of Employee:</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{empName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px', fontWeight: 600 }}>Designation:</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{empDesignation}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px', fontWeight: 600 }}>Department:</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{empDepartment}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px', fontWeight: 600 }}>W.E.F. (Effective Date): *</span>
                {isReadOnly ? (
                  <strong style={{ color: '#0f172a', fontSize: '14px' }}>{wef || '—'}</strong>
                ) : (
                  <input
                    type="date"
                    value={wef}
                    onChange={(e) => setWef(e.target.value)}
                    required
                    style={{
                      marginTop: '2px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section A: Salary Breakup Structure */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: 700, fontSize: '13px', color: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
              <span>A - Salary Breakup Structure</span>
              <span>Monthly</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '8px 16px' }}>Component</th>
                  <th style={{ textAlign: 'center', padding: '8px 16px', width: '180px' }}>Input / %</th>
                  <th style={{ textAlign: 'right', padding: '8px 16px', width: '140px' }}>Calculated Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px', fontWeight: 600 }}>BASIC</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      money(basicSalary)
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#64748b' }}>₹</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={basicSalary}
                          onChange={(e) => setBasicSalary(e.target.value)}
                          required
                          style={{ width: '100px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}
                        />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 600 }}>{money(calculation.basicSalary)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>HRA</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${hraPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={hraPercentage}
                          onChange={(e) => setHraPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>{money(calculation.hraAmount)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>LTA</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${ltaPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={ltaPercentage}
                          onChange={(e) => setLtaPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>{money(calculation.ltaAmount)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>Edu. All</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${educationAllowancePercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={educationAllowancePercentage}
                          onChange={(e) => setEducationAllowancePercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>{money(calculation.educationAllowanceAmount)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>Conveyance</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${conveyancePercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={conveyancePercentage}
                          onChange={(e) => setConveyancePercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>{money(calculation.conveyanceAmount)}</td>
                </tr>

                {/* Gross Total A */}
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td colSpan={2} style={{ padding: '10px 16px', color: '#0f172a' }}>
                    Gross Total - A
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: '#0f172a', fontSize: '14px' }}>
                    {money(calculation.grossTotalA)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section B: Deduction */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#fef2f2', padding: '10px 16px', fontWeight: 700, fontSize: '13px', color: '#991b1b' }}>
              B - Deduction
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px', width: '50%' }}>EPF (Employee)</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center', width: '180px' }}>
                    {isReadOnly ? (
                      `${employeeEpfPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={employeeEpfPercentage}
                          onChange={(e) => setEmployeeEpfPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', color: '#dc2626', width: '140px' }}>
                    {money(calculation.employeeEpfAmount)}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>ESIC (Employee)</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${employeeEsicPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.05"
                          value={employeeEsicPercentage}
                          onChange={(e) => setEmployeeEsicPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', color: '#dc2626' }}>
                    {money(calculation.employeeEsicAmount)}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>P.Tax</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${professionalTaxPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={professionalTaxPercentage}
                          onChange={(e) => setProfessionalTaxPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', color: '#dc2626' }}>
                    {money(calculation.professionalTaxAmount)}
                  </td>
                </tr>

                {/* Total B */}
                <tr style={{ background: '#fef2f2', fontWeight: 800 }}>
                  <td colSpan={2} style={{ padding: '10px 16px', color: '#991b1b' }}>
                    Total - B
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: '#991b1b', fontSize: '14px' }}>
                    {money(calculation.totalDeductionB)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section C: Net Take Home */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #86efac',
              borderRadius: '12px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.05em' }}>
                C - NET TAKE HOME (A - B)
              </span>
              <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                Gross Total ({money(calculation.grossTotalA)}) − Deductions ({money(calculation.totalDeductionB)})
              </div>
            </div>
            <strong style={{ fontSize: '18px', color: '#166534', fontWeight: 800 }}>
              {money(calculation.netTakeHomeC)}
            </strong>
          </div>

          {/* Section D: Company Contribution Cost */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '10px 16px', fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
              D - Company Contribution Cost
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px', width: '50%' }}>EPF (Company)</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center', width: '180px' }}>
                    {isReadOnly ? (
                      `${companyEpfPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={companyEpfPercentage}
                          onChange={(e) => setCompanyEpfPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', width: '140px' }}>
                    {money(calculation.companyEpfAmount)}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>ESIC (Company)</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${companyEsicPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.05"
                          value={companyEsicPercentage}
                          onChange={(e) => setCompanyEsicPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                    {money(calculation.companyEsicAmount)}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 16px' }}>Gratuity</td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    {isReadOnly ? (
                      `${gratuityPercentage}%`
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={gratuityPercentage}
                          onChange={(e) => setGratuityPercentage(e.target.value)}
                          style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                    {money(calculation.gratuityAmount)}
                  </td>
                </tr>

                {/* Total D */}
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td colSpan={2} style={{ padding: '10px 16px', color: '#0f172a' }}>
                    Total - D
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: '#0f172a', fontSize: '14px' }}>
                    {money(calculation.totalCompanyContributionD)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section E: CTC PER MONTH */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#e0f2fe', letterSpacing: '0.05em' }}>
                E - CTC PER MONTH (A + D)
              </span>
              <div style={{ fontSize: '12px', color: '#bae6fd', marginTop: '2px' }}>
                Gross Total A ({money(calculation.grossTotalA)}) + Total Company Cost D ({money(calculation.totalCompanyContributionD)})
              </div>
            </div>
            <strong style={{ fontSize: '22px', color: '#ffffff', fontWeight: 900 }}>
              {money(calculation.ctcPerMonthE)}
            </strong>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={busy}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: busy ? 0.7 : 1,
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                {busy ? 'Saving…' : mode === 'edit' ? 'Update Salary' : 'Save Salary'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
