'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  calculateSalaryStructure,
  SalaryInputData,
  CalculatedSalaryOutput,
} from '@/services/payroll/salaryCalculation';
import { payrollService } from '@/services/payroll/payrollService';
import { employeesService } from '@/services/hr/employeesService';
import './CreateSalaryWorkstation.css';

interface EmployeeOption {
  id: string;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  department?: any;
  jobTitle?: string;
  status?: string;
  baseSalary?: number;
}

interface CreateSalaryStructureViewProps {
  mode?: 'create' | 'edit' | 'view';
  structureId?: string;
}

const fmt = (val: unknown) =>
  `₹ ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function CreateSalaryStructureView({
  mode = 'create',
  structureId,
}: CreateSalaryStructureViewProps) {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [existingStructures, setExistingStructures] = useState<any[]>([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Selected payroll month (defaults to current month YYYY-MM)
  const [payrollMonth, setPayrollMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  });

  // Complete attendance & leave records fetched from backend
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState<boolean>(true);

  const [effectiveFrom, setEffectiveFrom] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [wef, setWef] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Salary Inputs
  const [basicSalary, setBasicSalary] = useState<number>(30000);
  const [hraPct, setHraPct] = useState<number>(10);
  const [ltaPct, setLtaPct] = useState<number>(5);
  const [eduPct, setEduPct] = useState<number>(5);
  const [convPct, setConvPct] = useState<number>(5);

  const [empEpfPct, setEmpEpfPct] = useState<number>(12);
  const [empEsicPct, setEmpEsicPct] = useState<number>(0.75);
  const [ptPct, setPtPct] = useState<number>(0);

  const [compEpfPct, setCompEpfPct] = useState<number>(12);
  const [compEsicPct, setCompEsicPct] = useState<number>(3.25);
  const [gratuityPct, setGratuityPct] = useState<number>(4.81);

  const [allowOverride, setAllowOverride] = useState<boolean>(false);
  const [loadedStructure, setLoadedStructure] = useState<any>(null);

  // Load initial employees & salary structures
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      setLoading(true);
      try {
        const [empRes, structRes] = await Promise.all([
          employeesService.listEmployees({ page: 1, limit: 100 }).catch(() => ({ items: [] })),
          payrollService.getSalaryStructures().catch(() => []),
        ]);

        if (!isMounted) return;

        const empList = Array.isArray(empRes) ? empRes : (empRes as any)?.items || [];
        const structList = Array.isArray(structRes) ? structRes : (structRes as any)?.items || [];

        setEmployees(empList);
        setExistingStructures(structList);

        // If in edit or view mode with structureId, load that structure
        if (structureId && (mode === 'edit' || mode === 'view')) {
          const struct = await payrollService.getSalaryStructure(structureId).catch(() => null);
          if (struct) {
            setLoadedStructure(struct);
            setSelectedEmployeeId(struct.employeeId);
            setBasicSalary(Number(struct.basicSalary) || 0);
            setHraPct(Number(struct.hraPercentage) || 0);
            setLtaPct(Number(struct.ltaPercentage) || 0);
            setEduPct(Number(struct.educationAllowancePercentage) || 0);
            setConvPct(Number(struct.conveyancePercentage) || 0);
            setEmpEpfPct(Number(struct.employeeEpfPercentage) || 0);
            setEmpEsicPct(Number(struct.employeeEsicPercentage) || 0);
            setPtPct(Number(struct.professionalTaxPercentage) || 0);
            setCompEpfPct(Number(struct.companyEpfPercentage) || 0);
            setCompEsicPct(Number(struct.companyEsicPercentage) || 0);
            setGratuityPct(Number(struct.gratuityPercentage) || 4.81);
            if (struct.wef) setWef(struct.wef);
            if (struct.effectiveFrom) {
              setEffectiveFrom(new Date(struct.effectiveFrom).toISOString().split('T')[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load salary preparation data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void initData();
    return () => {
      isMounted = false;
    };
  }, [structureId, mode]);

  // Selected employee master object
  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);

  // Check if an active salary structure already exists for the selected employee
  const existingActiveStructure = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return existingStructures.find(
      (s) => s.employeeId === selectedEmployeeId && s.isActive && s.id !== structureId
    );
  }, [selectedEmployeeId, existingStructures, structureId]);

  // AUTOMATIC ATTENDANCE & LEAVE FETCHING ON EMPLOYEE / MONTH SELECTION
  useEffect(() => {
    let isCancelled = false;

    if (!selectedEmployeeId) {
      setAttendanceData(null);
      setAttendanceError(null);
      setLoadingAttendance(false);
      return;
    }

    // Immediately clear previous employee data to prevent cross-employee leakage
    setAttendanceData(null);
    setAttendanceError(null);
    setLoadingAttendance(true);

    async function fetchAttendance() {
      try {
        const res = await payrollService.getPayrollAttendanceSummary(selectedEmployeeId, payrollMonth);
        if (isCancelled) return;

        setAttendanceData(res);

        // Auto-fill salary structure inputs if active structure exists and mode is 'create'
        if (mode === 'create' && res?.structure) {
          const struct = res.structure;
          setBasicSalary(Number(struct.basicSalary) || 30000);
          setHraPct(Number(struct.hraPercentage) || 10);
          setLtaPct(Number(struct.ltaPercentage) || 5);
          setEduPct(Number(struct.educationAllowancePercentage) || 5);
          setConvPct(Number(struct.conveyancePercentage) || 5);
          setEmpEpfPct(Number(struct.employeeEpfPercentage) || 12);
          setEmpEsicPct(Number(struct.employeeEsicPercentage) || 0.75);
          setPtPct(Number(struct.professionalTaxPercentage) || 0);
          setCompEpfPct(Number(struct.companyEpfPercentage) || 12);
          setCompEsicPct(Number(struct.companyEsicPercentage) || 3.25);
          setGratuityPct(Number(struct.gratuityPercentage) || 4.81);
          if (struct.wef) setWef(struct.wef);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to fetch attendance summary:', err);
          setAttendanceError(err?.message || 'Could not fetch attendance & leave data from HR system.');
        }
      } finally {
        if (!isCancelled) {
          setLoadingAttendance(false);
        }
      }
    }

    void fetchAttendance();

    return () => {
      isCancelled = true;
    };
  }, [selectedEmployeeId, payrollMonth, mode]);

  // Auto-fill basic salary from employee master if starting fresh
  const handleSelectEmployee = (emp: EmployeeOption) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeSearch('');
    setIsEmployeeDropdownOpen(false);

    if (mode === 'create') {
      const existing = existingStructures.find((s) => s.employeeId === emp.id && s.isActive);
      if (existing) {
        setBasicSalary(Number(existing.basicSalary) || 30000);
        setHraPct(Number(existing.hraPercentage) || 10);
        setLtaPct(Number(existing.ltaPercentage) || 5);
        setEduPct(Number(existing.educationAllowancePercentage) || 5);
        setConvPct(Number(existing.conveyancePercentage) || 5);
        setEmpEpfPct(Number(existing.employeeEpfPercentage) || 12);
        setEmpEsicPct(Number(existing.employeeEsicPercentage) || 0.75);
        setPtPct(Number(existing.professionalTaxPercentage) || 0);
        setCompEpfPct(Number(existing.companyEpfPercentage) || 12);
        setCompEsicPct(Number(existing.companyEsicPercentage) || 3.25);
        setGratuityPct(Number(existing.gratuityPercentage) || 4.81);
        if (existing.wef) setWef(existing.wef);
      } else if (emp.baseSalary && Number(emp.baseSalary) > 0) {
        setBasicSalary(Number(emp.baseSalary));
      }
    }
  };

  // Filtered employees for search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const q = employeeSearch.toLowerCase();
    return employees.filter((emp) => {
      const name = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      const code = emp.employeeCode || '';
      const dept = typeof emp.department === 'object' ? emp.department?.name : emp.department;
      return (
        name.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        (dept && dept.toLowerCase().includes(q))
      );
    });
  }, [employees, employeeSearch]);

  // Live calculation output for Base Full Month
  const calculation: CalculatedSalaryOutput = useMemo(() => {
    const input: SalaryInputData = {
      basicSalary: Number(basicSalary) || 0,
      hraPercentage: Number(hraPct) || 0,
      ltaPercentage: Number(ltaPct) || 0,
      educationAllowancePercentage: Number(eduPct) || 0,
      conveyancePercentage: Number(convPct) || 0,
      employeeEpfPercentage: Number(empEpfPct) || 0,
      employeeEsicPercentage: Number(empEsicPct) || 0,
      professionalTaxPercentage: Number(ptPct) || 0,
      companyEpfPercentage: Number(compEpfPct) || 0,
      companyEsicPercentage: Number(compEsicPct) || 0,
      gratuityPercentage: Number(gratuityPct) || 0,
    };
    return calculateSalaryStructure(input);
  }, [
    basicSalary,
    hraPct,
    ltaPct,
    eduPct,
    convPct,
    empEpfPct,
    empEsicPct,
    ptPct,
    compEpfPct,
    compEsicPct,
    gratuityPct,
  ]);

  // Attendance Proration & Per-Day Salary / Leave Cut Metrics
  const calendarDays = attendanceData?.calendarDays ?? 30;
  const payableDays = attendanceData?.payableDays ?? 30;
  const unpaidDays = attendanceData?.unpaidDays ?? Math.max(0, calendarDays - payableDays);
  const prorationRatio = attendanceData?.prorationRatio ?? (calendarDays > 0 ? payableDays / calendarDays : 1.0);

  // Exact Per Day Rates
  const perDaySalary = calendarDays > 0 ? calculation.grossTotalA / calendarDays : 0;
  const perDayBasic = calendarDays > 0 ? calculation.basicSalary / calendarDays : 0;

  // Exact Leave Salary Cut = Per Day Salary * Unpaid/Absent Leave Days
  const leaveDeductionAmount = perDaySalary * unpaidDays;

  // Actual Earned Figures
  const proratedGross = Math.max(0, calculation.grossTotalA - leaveDeductionAmount);
  const proratedDeduction = calculation.totalDeductionB * prorationRatio;
  const proratedNet = Math.max(0, proratedGross - proratedDeduction);
  const proratedCompanyCost = calculation.totalCompanyContributionD * prorationRatio;
  const proratedCtc = proratedGross + proratedCompanyCost;

  // Handle Save / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Employee Required',
        text: 'Please select an employee before proceeding.',
        confirmButtonColor: '#0f172a',
      });
      return;
    }

    if (loadingAttendance) {
      await Swal.fire({
        icon: 'info',
        title: 'Attendance Fetching in Progress',
        text: 'Please wait until attendance and leave data has finished syncing.',
        confirmButtonColor: '#0f172a',
      });
      return;
    }

    if (basicSalary <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Invalid Basic Salary',
        text: 'Please enter a valid Basic Salary greater than ₹ 0.',
        confirmButtonColor: '#0f172a',
      });
      return;
    }

    const payload = {
      employeeId: selectedEmployeeId,
      effectiveFrom,
      wef,
      employeeNameSnapshot:
        selectedEmployee?.fullName ||
        `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`.trim() ||
        loadedStructure?.employeeNameSnapshot ||
        'Staff Member',
      designationSnapshot:
        selectedEmployee?.jobTitle || loadedStructure?.designationSnapshot || 'Staff Member',
      departmentSnapshot:
        (typeof selectedEmployee?.department === 'object'
          ? selectedEmployee?.department?.name
          : selectedEmployee?.department) ||
        loadedStructure?.departmentSnapshot ||
        'Operations',
      basicSalary: calculation.basicSalary,
      hraPercentage: calculation.hraPercentage,
      hraAmount: calculation.hraAmount,
      ltaPercentage: calculation.ltaPercentage,
      ltaAmount: calculation.ltaAmount,
      educationAllowancePercentage: calculation.educationAllowancePercentage,
      educationAllowanceAmount: calculation.educationAllowanceAmount,
      conveyancePercentage: calculation.conveyancePercentage,
      conveyanceAllowance: calculation.conveyanceAmount,
      grossSalary: calculation.grossTotalA,
      employeeEpfPercentage: calculation.employeeEpfPercentage,
      employeeEpfAmount: calculation.employeeEpfAmount,
      employeeEsicPercentage: calculation.employeeEsicPercentage,
      employeeEsicAmount: calculation.employeeEsicAmount,
      professionalTaxPercentage: calculation.professionalTaxPercentage,
      professionalTaxAmount: calculation.professionalTaxAmount,
      totalDeduction: calculation.totalDeductionB,
      netTakeHome: calculation.netTakeHomeC,
      companyEpfPercentage: calculation.companyEpfPercentage,
      companyEpfAmount: calculation.companyEpfAmount,
      companyEsicPercentage: calculation.companyEsicPercentage,
      companyEsicAmount: calculation.companyEsicAmount,
      gratuityPercentage: calculation.gratuityPercentage,
      gratuityAmount: calculation.gratuityAmount,
      totalCompanyContribution: calculation.totalCompanyContributionD,
      ctcPerMonth: calculation.ctcPerMonthE,
      allowOverride: allowOverride || Boolean(existingActiveStructure),
    };

    setSubmitting(true);
    try {
      if (mode === 'edit' && structureId) {
        await payrollService.updateSalaryStructure(structureId, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Salary Structure Updated',
          text: `Salary structure for ${payload.employeeNameSnapshot} has been updated successfully!`,
          confirmButtonColor: '#0f172a',
        });
      } else {
        await payrollService.createSalaryStructure(payload);
        await Swal.fire({
          icon: 'success',
          title: 'Salary Structure Created',
          text: `Salary structure for ${payload.employeeNameSnapshot} (CTC: ₹${calculation.ctcPerMonthE.toLocaleString('en-IN')}) saved successfully!`,
          confirmButtonColor: '#0f172a',
        });
      }
      router.push('/hr/salary/prepare');
    } catch (err: any) {
      console.error('Failed to save salary structure:', err);
      const isConflict = err?.status === 409 || err?.response?.status === 409;
      if (isConflict && !allowOverride) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Active Structure Exists',
          text:
            err?.response?.data?.error?.message ||
            'An active salary structure already exists for this employee. Do you want to supersede it with this new revision?',
          showCancelButton: true,
          confirmButtonText: 'Yes, supersede & save',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#0f172a',
        });
        if (result.isConfirmed) {
          setAllowOverride(true);
          try {
            await payrollService.createSalaryStructure({ ...payload, allowOverride: true });
            await Swal.fire({
              icon: 'success',
              title: 'Salary Structure Saved',
              text: 'New active salary structure revision created successfully!',
              confirmButtonColor: '#0f172a',
            });
            router.push('/hr/salary/prepare');
          } catch (retryErr: any) {
            await Swal.fire({
              icon: 'error',
              title: 'Save Failed',
              text: retryErr?.message || 'Unable to supersede salary structure.',
              confirmButtonColor: '#ef4444',
            });
          }
        }
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: err?.message || 'Unable to save salary structure.',
          confirmButtonColor: '#ef4444',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = mode === 'view';

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #0f172a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#475569' }}>Loading Salary Preparation Workstation...</p>
      </div>
    );
  }

  const employeeDisplayName =
    selectedEmployee?.fullName ||
    `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`.trim() ||
    loadedStructure?.employeeNameSnapshot ||
    'Select an Employee';

  const employeeDisplayJob =
    selectedEmployee?.jobTitle || loadedStructure?.designationSnapshot || 'Designation Pending';

  const employeeDisplayDept =
    (typeof selectedEmployee?.department === 'object'
      ? selectedEmployee?.department?.name
      : selectedEmployee?.department) ||
    loadedStructure?.departmentSnapshot ||
    'Department Pending';

  const employeeDisplayCode = selectedEmployee?.employeeCode || 'EMP-CODE';

  return (
    <div className="ctc-workstation-container">
      {/* ── Top Header & Breadcrumbs ── */}
      <div className="ctc-header-bar">
        <div className="ctc-header-left">
          <div className="ctc-breadcrumb">
            <Link href="/hr/salary/prepare">Salary Preparation</Link>
            <span>/</span>
            <span className="ctc-breadcrumb-current">
              {mode === 'view' ? 'View Statement' : mode === 'edit' ? 'Edit Structure' : 'Create Salary & CTC Structure'}
            </span>
          </div>
          <h1 className="ctc-header-title">
            {mode === 'view'
              ? 'Employee Salary & CTC Statement'
              : mode === 'edit'
              ? 'Edit Employee Salary Structure & CTC'
              : 'Create Employee Salary Structure & CTC'}
          </h1>
          <p className="ctc-header-subtitle">
            Authoritative salary preparation synchronized with HR Attendance, Leave records &amp; Company Calendar.
          </p>
        </div>

        <div className="ctc-header-actions">
          <Link href="/hr/salary/prepare" className="btn-ctc-outline">
            ← Back to Salary Register
          </Link>

          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedEmployeeId || loadingAttendance}
              className="btn-ctc-primary"
            >
              {submitting
                ? 'Saving Structure...'
                : loadingAttendance
                ? 'Syncing Attendance...'
                : mode === 'edit'
                ? 'Update Salary Record'
                : 'Save & Publish CTC'}
            </button>
          )}
        </div>
      </div>

      {/* ── Active Structure Warning Alert ── */}
      {existingActiveStructure && mode === 'create' && (
        <div className="ctc-alert-warning">
          <div className="ctc-alert-warning-left">
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>
              <div className="ctc-alert-warning-title">Active Salary Structure Already Exists</div>
              <div className="ctc-alert-warning-desc">
                {employeeDisplayName} currently has an active monthly CTC of{' '}
                <strong>₹{Number(existingActiveStructure.ctcPerMonth || 0).toLocaleString('en-IN')}</strong>. Saving this form will supersede the previous record with this new revision.
              </div>
            </div>
          </div>
          <Link
            href={`/hr/salary/prepare/edit/${existingActiveStructure.id}`}
            className="ctc-alert-warning-btn"
          >
            Edit Existing Record →
          </Link>
        </div>
      )}

      {/* ── Main Workstation 2-Column Grid (Left Form + Right Sticky Sidebar) ── */}
      <form onSubmit={handleSubmit} className="ctc-workstation-grid">
        {/* LEFT COLUMN: Input Steps and Breakup Cards */}
        <div>
          {/* STEP 1: Employee Master Selection & Payroll Month Card */}
          <div className="ctc-card">
            <div className="ctc-card-header">
              <div className="ctc-card-title">
                <span className="step-badge">1</span>
                <div>
                  <h3>Employee Master &amp; Payroll Month Selection</h3>
                  <p>Choose the employee and payroll month to automatically fetch attendance and leave records.</p>
                </div>
              </div>

              {/* Month Selector in Header */}
              <div className="ctc-month-select-wrap">
                <label htmlFor="payrollMonthInput">Payroll Month:</label>
                <input
                  id="payrollMonthInput"
                  type="month"
                  className="ctc-month-input"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="ctc-form-grid">
              {/* Custom Searchable Employee Picker */}
              <div className="form-group span-2" ref={dropdownRef}>
                <label className="form-label">
                  Select Employee <span className="req">*</span>
                </label>
                <div className="ctc-dropdown-container">
                  <button
                    type="button"
                    disabled={mode !== 'create'}
                    onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                    className="ctc-dropdown-trigger-btn"
                  >
                    <span>
                      {selectedEmployee
                        ? `👤 ${selectedEmployee.fullName || selectedEmployee.firstName} (${selectedEmployee.employeeCode}) — ${typeof selectedEmployee.department === 'object' ? selectedEmployee.department?.name : selectedEmployee.department || 'Operations'}`
                        : '🔍 Search & Select Staff Member...'}
                    </span>
                    {mode === 'create' && <span style={{ fontSize: '11px', color: '#64748b' }}>▼</span>}
                  </button>

                  {isEmployeeDropdownOpen && mode === 'create' && (
                    <div className="ctc-dropdown-menu">
                      <div className="ctc-dropdown-search-wrap">
                        <input
                          type="text"
                          placeholder="Type name, employee code or department..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          autoFocus
                          className="ctc-dropdown-search-input"
                        />
                      </div>

                      <div className="ctc-dropdown-list">
                        {filteredEmployees.length === 0 ? (
                          <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                            No employees found matching "{employeeSearch}"
                          </div>
                        ) : (
                          filteredEmployees.map((emp) => {
                            const isSelected = emp.id === selectedEmployeeId;
                            const hasActive = existingStructures.some(
                              (s) => s.employeeId === emp.id && s.isActive
                            );
                            return (
                              <div
                                key={emp.id}
                                onClick={() => handleSelectEmployee(emp)}
                                className={`ctc-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                              >
                                <div>
                                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                                    {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                    Code: <strong>{emp.employeeCode}</strong> • Dept:{' '}
                                    {typeof emp.department === 'object' ? emp.department?.name : emp.department || 'Operations'} • Role:{' '}
                                    {emp.jobTitle || 'Executive'}
                                  </div>
                                </div>
                                {hasActive && (
                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      fontWeight: 600,
                                      color: '#15803d',
                                      background: '#dcfce7',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      border: '1px solid #bbf7d0',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Active CTC
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Effective From Date */}
              <div className="form-group">
                <label className="form-label">
                  Effective From <span className="req">*</span>
                </label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* W.E.F. Reference Date */}
              <div className="form-group">
                <label className="form-label">
                  W.E.F. Date (With Effect From) <span className="req">*</span>
                </label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={wef}
                  onChange={(e) => setWef(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Selected Employee Snapshot Preview Ribbon */}
            {selectedEmployee && (
              <div className="ctc-emp-snapshot-card">
                <div className="ctc-emp-avatar">
                  {selectedEmployee.firstName?.[0] || 'E'}
                </div>
                <div className="ctc-emp-details">
                  <div className="ctc-emp-name">
                    {selectedEmployee.fullName || `${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim()}
                  </div>
                  <div className="ctc-emp-meta">
                    <span>Code: <strong>{selectedEmployee.employeeCode}</strong></span>
                    <span>•</span>
                    <span>Dept: <strong>{typeof selectedEmployee.department === 'object' ? selectedEmployee.department?.name : selectedEmployee.department || 'Operations'}</strong></span>
                    <span>•</span>
                    <span>Role: <strong>{selectedEmployee.jobTitle || 'Executive'}</strong></span>
                  </div>
                </div>
                <span className="ctc-emp-status-badge">
                  ● Verified Master
                </span>
              </div>
            )}
          </div>

          {/* =========================================================================
              STEP 2: ATTENDANCE & LEAVE INTEGRATION DETAILS SECTION
             ========================================================================= */}
          {selectedEmployeeId && (
            <div className="ctc-attendance-section">
              {/* Header Bar */}
              <div className="ctc-attendance-header-bar">
                <div className="ctc-attendance-header-title">
                  <span>📊 Attendance &amp; Leave Consumption</span>
                  <span className="ctc-attendance-badge-live">
                    ⚡ Live HR Sync
                  </span>
                </div>

                <div className="ctc-attendance-controls">
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Period: <strong>{attendanceData?.period?.from || `${payrollMonth}-01`}</strong> → <strong>{attendanceData?.period?.to || `${payrollMonth}-31`}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMatrixExpanded(!isMatrixExpanded)}
                    className="ctc-btn-toggle-matrix"
                  >
                    {isMatrixExpanded ? '▲ Collapse Daily Matrix' : '▼ View 31-Day Matrix'}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loadingAttendance && (
                <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                  <div style={{ width: '28px', height: '28px', border: '3px solid #0f172a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Fetching all attendance punches &amp; leave records from HR system...
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                    Resolving calendar days, working schedule, approved leaves, weekly offs &amp; holidays.
                  </div>
                </div>
              )}

              {/* Error State */}
              {!loadingAttendance && attendanceError && (
                <div style={{ padding: '14px 18px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#991b1b', fontSize: '12.5px' }}>
                  ⚠️ <strong>Attendance Sync Warning:</strong> {attendanceError}
                </div>
              )}

              {/* KPI Summary Metrics Grid */}
              {!loadingAttendance && attendanceData && (
                <>
                  <div className="ctc-attendance-kpis-grid">
                    <div className="ctc-attendance-kpi-card">
                      <div className="ctc-kpi-label">💼 Working Days</div>
                      <div className="ctc-kpi-value">{attendanceData.workingDays}</div>
                      <div className="ctc-kpi-sub">Scheduled Roster</div>
                    </div>

                    <div className="ctc-attendance-kpi-card">
                      <div className="ctc-kpi-label" style={{ color: '#15803d' }}>✅ Present Days</div>
                      <div className="ctc-kpi-value" style={{ color: '#15803d' }}>{attendanceData.presentDays}</div>
                      <div className="ctc-kpi-sub">Punched In &amp; Valid</div>
                    </div>

                    <div className="ctc-attendance-kpi-card">
                      <div className="ctc-kpi-label" style={{ color: '#dc2626' }}>❌ Absent Days</div>
                      <div className="ctc-kpi-value" style={{ color: '#dc2626' }}>{attendanceData.absentDays}</div>
                      <div className="ctc-kpi-sub">Unauthorized Absence</div>
                    </div>

                    <div className="ctc-attendance-kpi-card highlight-payable">
                      <div className="ctc-kpi-label">⭐ Total Payable</div>
                      <div className="ctc-kpi-value">{attendanceData.payableDays}</div>
                      <div className="ctc-kpi-sub" style={{ color: '#166534' }}>
                        {(prorationRatio * 100).toFixed(1)}% of Month
                      </div>
                    </div>
                  </div>

                  {/* Proration Ratio & Leave Salary Cut Banner */}
                  <div className="ctc-proration-banner">
                    <div>
                      <span className="ctc-proration-formula">
                        Salary Proration Factor: <strong>{attendanceData.payableDays} / {attendanceData.calendarDays} Days = {(prorationRatio * 100).toFixed(2)}%</strong>
                      </span>
                      <div style={{ fontSize: '11.5px', color: '#1e40af', marginTop: '3px' }}>
                        {unpaidDays > 0 ? (
                          <span>
                            ✂️ <strong>Leave / LOP Salary Cut:</strong> −{fmt(leaveDeductionAmount)} ({unpaidDays} absent/unpaid days @ {fmt(perDaySalary)}/day). Full base structure is preserved below.
                          </span>
                        ) : (
                          <span>✅ 100% full attendance recorded for this period. No leave salary deduction.</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {leaveDeductionAmount > 0 && (
                        <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '3px 9px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>
                          Leave Cut: −{fmt(leaveDeductionAmount)}
                        </span>
                      )}
                      <span className="ctc-proration-badge">
                        Actual Earned: {fmt(proratedGross)} Gross
                      </span>
                    </div>
                  </div>

                  {/* Per Day Salary & Leave Cut Breakdown Grid */}
                  <div className="ctc-leave-calc-box">
                    <div className="ctc-leave-calc-item">
                      <span className="ctc-leave-calc-title">💵 Per Day Salary Rate</span>
                      <span className="ctc-leave-calc-val">{fmt(perDaySalary)} / day</span>
                      <span className="ctc-leave-calc-sub">₹{Math.round(calculation.grossTotalA).toLocaleString('en-IN')} ÷ {calendarDays} Days</span>
                    </div>

                    <div className="ctc-leave-calc-item">
                      <span className="ctc-leave-calc-title">📅 Paid / Payable Days</span>
                      <span className="ctc-leave-calc-val" style={{ color: '#15803d' }}>{payableDays} Days</span>
                      <span className="ctc-leave-calc-sub">{(prorationRatio * 100).toFixed(1)}% of {calendarDays} Calendar Days</span>
                    </div>

                    <div className={`ctc-leave-calc-item ${unpaidDays > 0 ? 'highlight-cut' : ''}`}>
                      <span className="ctc-leave-calc-title">✂️ Leave Cut ({unpaidDays} Days)</span>
                      <span className="ctc-leave-calc-val">{unpaidDays > 0 ? `− ${fmt(leaveDeductionAmount)}` : '₹ 0.00'}</span>
                      <span className="ctc-leave-calc-sub">{unpaidDays} Days × {fmt(perDaySalary)}/d</span>
                    </div>

                    <div className="ctc-leave-calc-item highlight-earned">
                      <span className="ctc-leave-calc-title">💰 Actual Earned Gross</span>
                      <span className="ctc-leave-calc-val">{fmt(proratedGross)}</span>
                      <span className="ctc-leave-calc-sub">{payableDays} Days × {fmt(perDaySalary)}/d</span>
                    </div>
                  </div>

                  {/* Expandable Daily Matrix Table */}
                  {isMatrixExpanded && attendanceData.days && (
                    <div className="ctc-matrix-container">
                      <div className="ctc-matrix-table-wrap">
                        <table className="ctc-matrix-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Calendar Type</th>
                              <th>Punch In</th>
                              <th>Punch Out</th>
                              <th>Worked Time</th>
                              <th>Attendance</th>
                              <th>Leave Record</th>
                              <th>Final Status</th>
                              <th style={{ textAlign: 'right' }}>Payable Factor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceData.days.map((day: any, idx: number) => {
                              let rowClass = '';
                              if (day.calendarType === 'WEEKLY_OFF') rowClass = 'row-weekly-off';
                              else if (day.calendarType === 'HOLIDAY') rowClass = 'row-holiday';
                              else if (day.finalStatus === 'ABSENT') rowClass = 'row-absent';

                              let statusPillClass = 'pill-scheduled';
                              if (day.finalStatus === 'PRESENT') statusPillClass = 'pill-present';
                              else if (day.finalStatus === 'PAID_LEAVE') statusPillClass = 'pill-paid-leave';
                              else if (day.finalStatus === 'UNPAID_LEAVE') statusPillClass = 'pill-unpaid-leave';
                              else if (day.finalStatus === 'WEEKLY_OFF') statusPillClass = 'pill-weekly-off';
                              else if (day.finalStatus === 'HOLIDAY') statusPillClass = 'pill-holiday';
                              else if (day.finalStatus === 'ABSENT') statusPillClass = 'pill-absent';
                              else if (day.finalStatus === 'HALF_DAY') statusPillClass = 'pill-half-day';

                              return (
                                <tr key={idx} className={rowClass}>
                                  <td>
                                    <strong>{day.date}</strong> <small style={{ color: '#64748b' }}>({day.dayName})</small>
                                  </td>
                                  <td>
                                    {day.holidayName ? (
                                      <span style={{ color: '#b45309', fontWeight: 600 }}>🎉 {day.holidayName}</span>
                                    ) : day.calendarType === 'WEEKLY_OFF' ? (
                                      <span style={{ color: '#64748b' }}>Weekly Off</span>
                                    ) : (
                                      <span style={{ color: '#0f172a' }}>Working Day</span>
                                    )}
                                  </td>
                                  <td style={{ fontFamily: 'monospace' }}>{day.punchIn}</td>
                                  <td style={{ fontFamily: 'monospace' }}>{day.punchOut}</td>
                                  <td>{day.workedHours}</td>
                                  <td>
                                    {day.attendanceStatus !== '—' ? (
                                      <span style={{ fontWeight: 600 }}>{day.attendanceStatus}</span>
                                    ) : (
                                      <span style={{ color: '#94a3b8' }}>—</span>
                                    )}
                                  </td>
                                  <td>
                                    {day.leave ? (
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: 600,
                                          color: day.leave.isApproved ? '#0284c7' : '#d97706',
                                          background: day.leave.isApproved ? '#e0f2fe' : '#fef3c7',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                        }}
                                      >
                                        {day.leave.leaveType} ({day.leave.status})
                                      </span>
                                    ) : (
                                      <span style={{ color: '#94a3b8' }}>—</span>
                                    )}
                                  </td>
                                  <td>
                                    <span className={`pill-status ${statusPillClass}`}>
                                      {day.finalStatus.replace(/_/g, ' ')}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right', fontWeight: 700, color: day.payableFactor > 0 ? '#15803d' : '#dc2626' }}>
                                    {day.payableFactor.toFixed(1)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 3: Basic Salary Hero & Allowances (A) */}
          <div className="ctc-card">
            <div className="ctc-card-header">
              <div className="ctc-card-title">
                <span className="step-badge">2</span>
                <div>
                  <h3>A. Basic Salary &amp; Allowances (Gross Earnings)</h3>
                  <p>All percentage allowances are dynamically calculated from the Basic Salary.</p>
                </div>
              </div>
            </div>

            {/* Basic Salary Hero Card */}
            <div className="ctc-basic-hero-card">
              <div className="ctc-basic-hero-content">
                <div className="ctc-basic-hero-left">
                  <div className="ctc-basic-hero-label">ENTER MONTHLY BASIC SALARY</div>
                  <div className="ctc-basic-hero-input-wrap">
                    <span className="ctc-basic-currency-prefix">₹</span>
                    <input
                      type="number"
                      min={1}
                      step="any"
                      disabled={isReadOnly}
                      value={basicSalary || ''}
                      onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                      placeholder="30000"
                      className="ctc-basic-input"
                    />
                  </div>
                  <div className="ctc-basic-hero-hint">
                    Foundation component for HRA, LTA, Education, Conveyance, EPF &amp; Gratuity.
                  </div>
                </div>

                <div className="ctc-basic-hero-right">
                  <span className="ctc-basic-hero-pill-label">Gross Earnings Total (A)</span>
                  <div className="ctc-basic-hero-total">{fmt(calculation.grossTotalA)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Per Day Rate: <strong>{fmt(perDaySalary)} / day</strong> ({calendarDays} Days)
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Allowances Grid */}
            <div className="ctc-allowances-grid">
              {/* HRA */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="ctc-allowance-tag">Tax Exempt Eligible</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={hraPct}
                    onChange={(e) => setHraPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Basic</span>
                </div>
                <div className="ctc-allowance-result">{fmt(calculation.hraAmount)}</div>
              </div>

              {/* LTA */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span>Leave Travel Allowance (LTA)</span>
                  <span className="ctc-allowance-tag">Travel Support</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={ltaPct}
                    onChange={(e) => setLtaPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Basic</span>
                </div>
                <div className="ctc-allowance-result">{fmt(calculation.ltaAmount)}</div>
              </div>

              {/* Education */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span>Education Allowance</span>
                  <span className="ctc-allowance-tag">Skill &amp; Child Edu</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={eduPct}
                    onChange={(e) => setEduPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Basic</span>
                </div>
                <div className="ctc-allowance-result">{fmt(calculation.educationAllowanceAmount)}</div>
              </div>

              {/* Conveyance */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span>Conveyance Allowance</span>
                  <span className="ctc-allowance-tag">Commute Support</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={convPct}
                    onChange={(e) => setConvPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Basic</span>
                </div>
                <div className="ctc-allowance-result">{fmt(calculation.conveyanceAmount)}</div>
              </div>
            </div>
          </div>

          {/* STEP 4: Employee Statutory Deductions (B) */}
          <div className="ctc-card">
            <div className="ctc-card-header">
              <div className="ctc-card-title">
                <span className="step-badge">3</span>
                <div>
                  <h3>B. Employee Statutory Deductions</h3>
                  <p>Statutory employee deductions subtracted from gross salary to arrive at in-hand take-home pay.</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TOTAL DEDUCTIONS (B)</span>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#be123c' }}>
                  {fmt(calculation.totalDeductionB)}
                </div>
              </div>
            </div>

            <div className="ctc-allowances-grid">
              {/* Employee EPF */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span style={{ color: '#be123c' }}>EPF Employee (PF)</span>
                  <span className="ctc-allowance-tag">12% Standard</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={empEpfPct}
                    onChange={(e) => setEmpEpfPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Basic</span>
                </div>
                <div className="ctc-allowance-result" style={{ color: '#be123c' }}>
                  {fmt(calculation.employeeEpfAmount)}
                </div>
              </div>

              {/* Employee ESIC */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span style={{ color: '#be123c' }}>ESIC Employee</span>
                  <span className="ctc-allowance-tag">0.75% of Gross</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={empEsicPct}
                    onChange={(e) => setEmpEsicPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Gross</span>
                </div>
                <div className="ctc-allowance-result" style={{ color: '#be123c' }}>
                  {fmt(calculation.employeeEsicAmount)}
                </div>
              </div>

              {/* Professional Tax */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span style={{ color: '#be123c' }}>Professional Tax (PT)</span>
                  <span className="ctc-allowance-tag">State Tax</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={ptPct}
                    onChange={(e) => setPtPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Gross</span>
                </div>
                <div className="ctc-allowance-result" style={{ color: '#be123c' }}>
                  {fmt(calculation.professionalTaxAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* NET TAKE-HOME HERO BANNER (C = A - B) */}
          <div className="ctc-net-hero-card">
            <div className="ctc-net-hero-left">
              <span>Net Take Home Pay (C = A - B)</span>
              <strong>MONTHLY IN-HAND SALARY:</strong>
              <div className="ctc-net-hero-sub">
                Gross ({fmt(calculation.grossTotalA)})
                {leaveDeductionAmount > 0 && (
                  <span style={{ color: '#dc2626', fontWeight: 600 }}> − Leave Cut ({fmt(leaveDeductionAmount)})</span>
                )}
                <span> − Deductions ({fmt(calculation.totalDeductionB)})</span>
              </div>
            </div>

            <div className="ctc-net-hero-right">
              <strong>{fmt(prorationRatio < 1 ? proratedNet : calculation.netTakeHomeC)}</strong>
              <small>{prorationRatio < 1 ? `Prorated Actual (${(prorationRatio * 100).toFixed(1)}%)` : 'Full Monthly Net'}</small>
            </div>
          </div>

          {/* STEP 5: Employer Statutory Contributions (D) */}
          <div className="ctc-card">
            <div className="ctc-card-header">
              <div className="ctc-card-title">
                <span className="step-badge">4</span>
                <div>
                  <h3>D. Employer Statutory Contributions (Company Cost)</h3>
                  <p>Direct contributions paid by the company in addition to gross earnings.</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TOTAL COMPANY CONTRIBUTION (D)</span>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {fmt(calculation.totalCompanyContributionD)}
                </div>
              </div>
            </div>

            <div className="ctc-allowances-grid">
              {/* Employer EPF */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span style={{ color: '#1e40af' }}>Company EPF (PF)</span>
                  <span className="ctc-allowance-tag">12% Standard</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={compEpfPct}
                    onChange={(e) => setCompEpfPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Basic</span>
                </div>
                <div className="ctc-allowance-result" style={{ color: '#1e40af' }}>
                  {fmt(calculation.companyEpfAmount)}
                </div>
              </div>

              {/* Employer ESIC */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span style={{ color: '#1e40af' }}>Company ESIC</span>
                  <span className="ctc-allowance-tag">3.25% of Gross</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={compEsicPct}
                    onChange={(e) => setCompEsicPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Gross</span>
                </div>
                <div className="ctc-allowance-result" style={{ color: '#1e40af' }}>
                  {fmt(calculation.companyEsicAmount)}
                </div>
              </div>

              {/* Gratuity */}
              <div className="ctc-allowance-card">
                <div className="ctc-allowance-title">
                  <span style={{ color: '#1e40af' }}>Gratuity Provision</span>
                  <span className="ctc-allowance-tag">4.81% (15/26 Days)</span>
                </div>
                <div className="ctc-allowance-control">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    disabled={isReadOnly}
                    value={gratuityPct}
                    onChange={(e) => setGratuityPct(parseFloat(e.target.value) || 0)}
                    className="ctc-pct-input"
                  />
                  <span className="ctc-pct-symbol">% of Basic</span>
                </div>
                <div className="ctc-allowance-result" style={{ color: '#1e40af' }}>
                  {fmt(calculation.gratuityAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL CTC HERO BANNER (E = A + D) */}
          <div className="ctc-ctc-hero-card">
            <div className="ctc-ctc-hero-left">
              <span>Total Cost To Company (E = A + D)</span>
              <strong>TOTAL MONTHLY CTC:</strong>
              <div className="ctc-ctc-hero-sub">
                Gross Earnings ({fmt(calculation.grossTotalA)}) + Company Contribution ({fmt(calculation.totalCompanyContributionD)})
              </div>
            </div>

            <div className="ctc-ctc-hero-right">
              <strong>{fmt(calculation.ctcPerMonthE)}</strong>
              <small>Annual CTC: {fmt(calculation.ctcPerAnnum)} / Yr</small>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Executive Summary & Action Card */}
        <div>
          <div className="ctc-sidebar-sticky">
            <div>
              <h3>Executive Financial Summary</h3>
              <p>Real-time calculation breakdown for this structure.</p>
            </div>

            {/* Profile Snapshot */}
            <div className="ctc-sidebar-profile">
              <h4>{employeeDisplayName}</h4>
              <p>
                <strong>{employeeDisplayCode}</strong> • {employeeDisplayDept}
              </p>
              <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                ● W.E.F: {wef} • Month: {payrollMonth}
              </div>
            </div>

            {/* Block 1: FULL MONTH ENTITLEMENT */}
            <div className="sidebar-block">
              <div className="sidebar-block-title">
                <span>1. Full Month Entitlement</span>
                <span>Structure CTC</span>
              </div>
              <div className="sidebar-row">
                <span>Gross Earnings (A)</span>
                <strong>{fmt(calculation.grossTotalA)}</strong>
              </div>
              <div className="sidebar-row">
                <span>Employee Deductions (B)</span>
                <span style={{ color: '#be123c' }}>−{fmt(calculation.totalDeductionB)}</span>
              </div>
              <div className="sidebar-row total">
                <span>Net Take-Home (C = A - B)</span>
                <strong>{fmt(calculation.netTakeHomeC)}</strong>
              </div>
              <div className="sidebar-row">
                <span>Employer Cost (D)</span>
                <span style={{ color: '#1e40af' }}>+{fmt(calculation.totalCompanyContributionD)}</span>
              </div>
              <div className="sidebar-row total" style={{ color: '#0f172a' }}>
                <span>Monthly CTC (E = A + D)</span>
                <strong>{fmt(calculation.ctcPerMonthE)}</strong>
              </div>
            </div>

            {/* Block 2: ATTENDANCE & LOP */}
            <div className="sidebar-block block-attendance">
              <div className="sidebar-block-title">
                <span>2. Attendance &amp; LOP</span>
                <span>{attendanceData?.calendarDays ?? 30} Calendar Days</span>
              </div>
              <div className="sidebar-row">
                <span>Working Days</span>
                <span>{attendanceData?.workingDays ?? 0}</span>
              </div>
              <div className="sidebar-row">
                <span>Present Days</span>
                <span style={{ color: '#15803d', fontWeight: 600 }}>{attendanceData?.presentDays ?? 0}</span>
              </div>
              <div className="sidebar-row">
                <span>Absent / Unpaid Days</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{unpaidDays}</span>
              </div>
              <div className="sidebar-row">
                <span>Total Payable Days</span>
                <strong style={{ color: '#15803d' }}>{payableDays} Days</strong>
              </div>
              <div className="sidebar-row">
                <span>Per Day Salary Rate</span>
                <span>{fmt(perDaySalary)} / d</span>
              </div>
              {leaveDeductionAmount > 0 && (
                <div className="sidebar-row cut total">
                  <span>✂️ Loss of Pay (LOP)</span>
                  <strong>− {fmt(leaveDeductionAmount)}</strong>
                </div>
              )}
            </div>

            {/* Block 3: ACTUAL PAYROLL */}
            <div className="sidebar-block block-payroll">
              <div className="sidebar-block-title">
                <span>3. Actual Payroll Payable</span>
                <span>Prorated</span>
              </div>
              <div className="sidebar-row">
                <span>Actual Earned Gross</span>
                <strong>{fmt(proratedGross)}</strong>
              </div>
              <div className="sidebar-row">
                <span>Actual Deductions</span>
                <span style={{ color: '#be123c' }}>−{fmt(proratedDeduction)}</span>
              </div>
              <div className="sidebar-row highlight-net">
                <span>Net Payable In-Hand</span>
                <span>{fmt(proratedNet)}</span>
              </div>
              <div className="sidebar-row" style={{ marginTop: '2px' }}>
                <span>Actual Employer Cost</span>
                <span style={{ color: '#1e40af' }}>+{fmt(proratedCompanyCost)}</span>
              </div>
              <div className="sidebar-row highlight-ctc">
                <span>Actual Month CTC</span>
                <span>{fmt(proratedCtc)}</span>
              </div>
            </div>

            {/* Form Actions */}
            {!isReadOnly && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={submitting || !selectedEmployeeId || loadingAttendance}
                  className="btn-ctc-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submitting
                    ? 'Saving Structure...'
                    : loadingAttendance
                    ? 'Syncing Attendance...'
                    : mode === 'edit'
                    ? 'Update Salary Structure'
                    : 'Save & Publish CTC'}
                </button>

                <Link
                  href="/hr/salary/prepare"
                  className="btn-ctc-outline"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                >
                  Cancel
                </Link>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateSalaryStructureView;
