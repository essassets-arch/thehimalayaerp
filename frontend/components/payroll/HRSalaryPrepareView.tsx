'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { payrollService } from '@/services/payroll/payrollService';
import { employeesService } from '@/services/hr/employeesService';
import { SalarySlipDocument } from './SalarySlipDocument';
import './SalaryModuleResponsive.css';

const money = (val: unknown) =>
  `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function HRSalaryPrepareView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [structures, setStructures] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [viewingSlipStructure, setViewingSlipStructure] = useState<any | null>(null);

  // Load salary structures, employees, and payroll records
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [structRes, empRes, recordsRes] = await Promise.all([
        payrollService.getSalaryStructures().catch(() => []),
        employeesService.listEmployees({ page: 1, limit: 100 }).catch(() => ({ items: [] })),
        payrollService.getPayrollRecords({ page: 1, pageSize: 100 }).catch(() => ({ items: [] })),
      ]);

      const structList = Array.isArray(structRes) ? structRes : (structRes as any)?.items || [];
      const empList = Array.isArray(empRes) ? empRes : (empRes as any)?.items || [];
      const recList = Array.isArray(recordsRes) ? recordsRes : (recordsRes as any)?.items || [];

      setStructures(structList);
      setEmployees(empList);
      setPayrollRecords(recList);
    } catch (err: any) {
      console.error('Failed to load salary data:', err);
      setError(err?.message || 'Failed to load salary structures.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Map employee IDs to their latest PayrollRecord for instant submission status tracking
  const employeePayrollStatusMap = useMemo(() => {
    const map = new Map<string, any>();
    payrollRecords.forEach((rec) => {
      const empId = rec.employeeId || rec.employee?.id;
      if (empId) {
        // If multiple, keep the latest (records are ordered by createdAt desc)
        if (!map.has(empId)) {
          map.set(empId, rec);
        }
      }
    });
    return map;
  }, [payrollRecords]);

  // Filtered structures (Active Register Tab)
  const filteredStructures = useMemo(() => {
    if (!search.trim()) return structures;
    const q = search.toLowerCase();
    return structures.filter((s) => {
      const name = (
        s.employeeNameSnapshot ||
        s.employee?.fullName ||
        `${s.employee?.firstName || ''} ${s.employee?.lastName || ''}`
      ).toLowerCase();
      const code = (s.employee?.employeeCode || '').toLowerCase();
      const dept = (
        s.departmentSnapshot ||
        (typeof s.employee?.department === 'object' ? s.employee?.department?.name : s.employee?.department || '')
      ).toLowerCase();
      const title = (s.designationSnapshot || s.employee?.jobTitle || '').toLowerCase();
      return name.includes(q) || code.includes(q) || dept.includes(q) || title.includes(q);
    });
  }, [structures, search]);

  // Filtered payroll history records (History Tab)
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return payrollRecords;
    const q = historySearch.toLowerCase();
    return payrollRecords.filter((r) => {
      const name = (r.employeeName || r.employee?.fullName || '').toLowerCase();
      const code = (r.employeeCode || r.employee?.employeeCode || '').toLowerCase();
      const dept = (r.department || r.employee?.department?.name || '').toLowerCase();
      const status = (r.status || '').toLowerCase();
      return name.includes(q) || code.includes(q) || dept.includes(q) || status.includes(q);
    });
  }, [payrollRecords, historySearch]);

  // Overall totals for Active Structures
  const totals = useMemo(() => {
    return filteredStructures.reduce(
      (acc, s) => ({
        count: acc.count + 1,
        gross: acc.gross + Number(s.grossSalary || 0),
        deductions: acc.deductions + Number(s.totalDeduction || 0),
        net: acc.net + Number(s.netTakeHome || 0),
        companyCost: acc.companyCost + Number(s.totalCompanyContribution || 0),
        ctc: acc.ctc + Number(s.ctcPerMonth || 0),
      }),
      { count: 0, gross: 0, deductions: 0, net: 0, companyCost: 0, ctc: 0 }
    );
  }, [filteredStructures]);

  // Overall totals for History Records
  const historyTotals = useMemo(() => {
    return filteredHistory.reduce(
      (acc, r) => ({
        count: acc.count + 1,
        gross: acc.gross + Number(r.grossEarnings || 0),
        deductions: acc.deductions + Number(r.totalDeductions || 0),
        net: acc.net + Number(r.netPayable || 0),
      }),
      { count: 0, gross: 0, deductions: 0, net: 0 }
    );
  }, [filteredHistory]);

  // Count unsubmitted structures
  const unsubmittedCount = useMemo(() => {
    return structures.filter((s) => {
      const empId = s.employeeId || s.employee?.id;
      const rec = employeePayrollStatusMap.get(empId);
      const isSent = rec && ['PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'PENDING_FINANCE', 'PROCESSING', 'PAID', 'SALARY_PAID', 'ON_HOLD'].includes(rec.status);
      return !isSent;
    }).length;
  }, [structures, employeePayrollStatusMap]);

  // Helpers for display
  const getEmpName = (s: any) =>
    s.employeeNameSnapshot ||
    s.employee?.fullName ||
    (s.employee ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim() : '') ||
    s.employee?.employeeCode ||
    'Staff Member';

  const getEmpCode = (s: any) => s.employee?.employeeCode || s.employeeCode || '—';
  const getEmpDesignation = (s: any) => s.designationSnapshot || s.employee?.jobTitle || s.jobTitle || 'Staff';
  const getEmpDept = (s: any) =>
    s.departmentSnapshot ||
    (typeof s.employee?.department === 'object' ? s.employee?.department?.name : s.employee?.department) ||
    s.department ||
    'General';

  const getWef = (s: any) => {
    if (s.wef) return s.wef;
    if (s.effectiveFrom) return new Date(s.effectiveFrom).toLocaleDateString('en-GB');
    return '—';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_SUPER_ADMIN_APPROVAL':
        return <span className="payroll-status-pill status-pending">⏳ Pending Super Admin Approval</span>;
      case 'SUPER_ADMIN_APPROVED':
        return <span className="payroll-status-pill status-approved">✅ Super Admin Approved</span>;
      case 'RETURNED_TO_HR':
        return <span className="payroll-status-pill status-returned">🔄 Returned for Correction</span>;
      case 'ON_HOLD':
        return <span className="payroll-status-pill status-hold">⏸️ On Hold</span>;
      case 'PENDING_FINANCE':
        return <span className="payroll-status-pill status-finance">💳 Sent to Finance</span>;
      case 'PROCESSING':
        return <span className="payroll-status-pill status-finance">⚙️ Finance Processing</span>;
      case 'PAID':
      case 'SALARY_PAID':
        return <span className="payroll-status-pill status-paid">💰 Disbursed / Paid</span>;
      case 'DRAFT':
        return <span className="payroll-status-pill status-draft">📝 Draft</span>;
      default:
        return <span className="payroll-status-pill status-draft">{status?.replace(/_/g, ' ') || 'Unknown'}</span>;
    }
  };

  // Actions
  const handleOpenCreate = () => {
    router.push('/hr/salary/prepare/create');
  };

  const handleOpenView = (structure: any) => {
    setViewingSlipStructure(structure);
  };

  const handleOpenEdit = (structure: any) => {
    router.push(`/hr/salary/prepare/edit/${structure.id}`);
  };

  const handleSendToSuperAdmin = async (structure: any) => {
    const empName = getEmpName(structure);
    const result = await Swal.fire({
      title: 'Send Salary to Super Admin?',
      html: `Submit salary calculation for <strong>${empName}</strong> to Super Admin for approval?<br><br>
             <div style="text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-size: 13px;">
               <div style="display:flex; justify-content:space-between;"><span>Gross Earnings (A):</span> <strong>${money(structure.grossSalary)}</strong></div>
               <div style="display:flex; justify-content:space-between; color:#e11d48; margin-top:2px;"><span>Deductions (B):</span> <strong>-${money(structure.totalDeduction)}</strong></div>
               <div style="display:flex; justify-content:space-between; color:#059669; font-weight:700; border-top:1px dashed #cbd5e1; padding-top:4px; margin-top:4px;"><span>Net Take-Home (C):</span> <strong>${money(structure.netTakeHome)}</strong></div>
               <div style="display:flex; justify-content:space-between; margin-top:2px;"><span>Monthly CTC (E):</span> <strong>${money(structure.ctcPerMonth)}</strong></div>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Send to Superadmin',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const empId = structure.employeeId || structure.employee?.id;
      const idsToSubmit = [structure.id, empId].filter(Boolean);

      await payrollService.submitPayroll(structure.id, { ids: idsToSubmit });
      await loadData();

      const swalRes = await Swal.fire({
        icon: 'success',
        title: 'Sent to Super Admin',
        html: `Salary calculation for <strong>${empName}</strong> has been submitted to Super Admin for approval.<br><small style="color: #64748b;">It is now awaiting review in the <strong>Submission History &amp; Approval Status</strong> tab.</small>`,
        showCancelButton: true,
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#64748b',
        confirmButtonText: '📜 View in Submission History ➔',
        cancelButtonText: 'Stay on Active Register',
      });

      if (swalRes.isConfirmed) {
        setActiveTab('history');
      }
    } catch (err: any) {
      console.error('Failed to submit salary to Super Admin:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: err?.message || 'Failed to submit salary to Super Admin.',
        confirmButtonColor: '#0f172a',
      });
    }
  };

  const handleSendAllToSuperAdmin = async () => {
    if (filteredStructures.length === 0) return;

    const result = await Swal.fire({
      title: 'Send All Salaries to Super Admin?',
      html: `Submit all <strong>${filteredStructures.length}</strong> active salary records to Super Admin for approval?<br><br>
             <div style="text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-size: 13px;">
               <div style="display:flex; justify-content:space-between;"><span>Total Prepared CTCs:</span> <strong>${filteredStructures.length}</strong></div>
               <div style="display:flex; justify-content:space-between;"><span>Total Gross:</span> <strong>${money(totals.gross)}</strong></div>
               <div style="display:flex; justify-content:space-between; color:#059669; font-weight:700;"><span>Total Net Pay:</span> <strong>${money(totals.net)}</strong></div>
               <div style="display:flex; justify-content:space-between; font-weight:800;"><span>Total Monthly CTC:</span> <strong>${money(totals.ctc)}</strong></div>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Send All to Superadmin',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const allIds = filteredStructures.map((s) => s.id);
      await payrollService.submitBulkPayroll(allIds);
      await loadData();

      const swalRes = await Swal.fire({
        icon: 'success',
        title: 'All Salaries Sent to Super Admin',
        html: `Submitted <strong>${filteredStructures.length}</strong> salary records to Super Admin for approval.<br><small style="color: #64748b;">They are now awaiting review in the <strong>Submission History &amp; Approval Status</strong> tab.</small>`,
        showCancelButton: true,
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#64748b',
        confirmButtonText: '📜 View in Submission History ➔',
        cancelButtonText: 'Stay on Active Register',
      });

      if (swalRes.isConfirmed) {
        setActiveTab('history');
      }
    } catch (err: any) {
      console.error('Failed to bulk submit to Super Admin:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Bulk Submission Error',
        text: err?.message || 'Failed to submit all salaries to Super Admin.',
        confirmButtonColor: '#0f172a',
      });
    }
  };

  const handleDelete = async (structure: any) => {
    const name = getEmpName(structure);
    const result = await Swal.fire({
      title: 'Delete Salary Structure?',
      html: `Are you sure you want to delete the salary structure for <strong>${name}</strong>?<br><small style="color: #64748b;">This action cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await payrollService.deleteSalaryStructure(structure.id);
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: `Salary structure for ${name} has been deleted.`,
        timer: 1500,
        showConfirmButton: false,
      });
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete salary structure:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Failed to delete salary structure.',
      });
    }
  };

  return (
    <div className="salary-page-wrapper">
      {/* ── Official Salary Slip Modal ── */}
      {viewingSlipStructure && (
        <SalarySlipDocument
          structure={viewingSlipStructure}
          onClose={() => setViewingSlipStructure(null)}
          isModal={true}
        />
      )}

      {/* ── Top Hero Banner ── */}
      <div className="salary-hero-banner">
        <div className="salary-hero-content">
          <span className="salary-hero-tag">HR &amp; Payroll Management</span>
          <h1 className="salary-hero-title">Employee Salary &amp; CTC Preparation</h1>
          <p className="salary-hero-desc">
            Define, structure, and calculate individual employee salary breakdowns, statutory EPF/ESIC deductions, employer contributions, and authoritative monthly CTC statements.
          </p>
        </div>

        <div className="salary-hero-stats">
          <div className="salary-hero-stat-item">
            <span>Prepared CTCs</span>
            <strong>{totals.count} Active</strong>
          </div>
          <div className="salary-hero-stat-divider"></div>
          <div className="salary-hero-stat-item">
            <span>Monthly CTC Outflow</span>
            <strong className="accent">{money(totals.ctc)}</strong>
          </div>
        </div>
      </div>

      {/* ── Master KPI 5-Card Stats Grid ── */}
      <div className="salary-kpi-grid">
        {/* Gross Total (A) */}
        <div className="salary-kpi-card">
          <span className="salary-kpi-label">A • Gross Earnings</span>
          <div className="salary-kpi-value gross">{money(totals.gross)}</div>
          <span className="salary-kpi-badge badge-gross">Total Wages</span>
        </div>

        {/* Deductions (B) */}
        <div className="salary-kpi-card">
          <span className="salary-kpi-label">B • Total Deductions</span>
          <div className="salary-kpi-value deduction">{money(totals.deductions)}</div>
          <span className="salary-kpi-badge badge-deduction">EPF + ESIC + P.Tax</span>
        </div>

        {/* Net Take-Home (C) */}
        <div className="salary-kpi-card highlight">
          <span className="salary-kpi-label">C • Net Take-Home (A - B)</span>
          <div className="salary-kpi-value net">{money(totals.net)}</div>
          <span className="salary-kpi-badge badge-net">Total In-Hand Pay</span>
        </div>

        {/* Company Cost (D) */}
        <div className="salary-kpi-card">
          <span className="salary-kpi-label">D • Company Cost</span>
          <div className="salary-kpi-value company">{money(totals.companyCost)}</div>
          <span className="salary-kpi-badge badge-company">Employer Share</span>
        </div>

        {/* Monthly CTC (E) */}
        <div className="salary-kpi-card highlight">
          <span className="salary-kpi-label">E • Total Monthly CTC (A + D)</span>
          <div className="salary-kpi-value ctc">{money(totals.ctc)}</div>
          <span className="salary-kpi-badge badge-ctc">Cost To Company</span>
        </div>
      </div>

      {/* ── Main Section Card (Tabs + Toolbar + Table / Cards) ── */}
      <div className="salary-section-card">
        {/* ── Primary Navigation Tabs ── */}
        <div className="salary-tabs-wrapper">
          <button
            onClick={() => setActiveTab('register')}
            className={`salary-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          >
            📋 Active Salary Register
            <span className="salary-tab-badge">{structures.length} Active</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`salary-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            📜 Submission History &amp; Approval Status
            <span className="salary-tab-badge">{payrollRecords.length} Records</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: ACTIVE SALARY STRUCTURES REGISTER                       */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'register' && (
          <>
            {/* Toolbar Header */}
            <div className="salary-toolbar">
              <div className="salary-toolbar-info">
                <h2>Active Employee Salary Register</h2>
                <p>Formulated salary structures and live Super Admin submission status</p>
              </div>

              <div className="salary-toolbar-actions">
                {/* Search Box */}
                <div className="salary-search-box">
                  <span className="salary-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search employee name, code, designation, dept..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Refresh Button */}
                <button onClick={loadData} disabled={loading} className="btn-salary-refresh" title="Reload List">
                  🔄 {loading ? 'Loading...' : 'Refresh'}
                </button>

                {/* Send All to Superadmin Button */}
                <button
                  onClick={handleSendAllToSuperAdmin}
                  disabled={loading || unsubmittedCount === 0}
                  className="btn-salary-refresh"
                  style={{
                    background: unsubmittedCount === 0 ? '#f8fafc' : '#f0fdf4',
                    color: unsubmittedCount === 0 ? '#64748b' : '#166534',
                    borderColor: unsubmittedCount === 0 ? '#e2e8f0' : '#bbf7d0',
                    fontWeight: 700,
                  }}
                  title={
                    unsubmittedCount === 0
                      ? 'All active salary structures are already submitted to Super Admin'
                      : `Submit ${unsubmittedCount} active salary calculations to Super Admin for approval`
                  }
                >
                  {unsubmittedCount === 0 ? '✓ All Sent to Superadmin' : `📤 Send All to Superadmin (${unsubmittedCount})`}
                </button>

                {/* Create Salary Button */}
                <button onClick={handleOpenCreate} className="btn-salary-primary">
                  + Create Salary Structure
                </button>
              </div>
            </div>

            {/* ── Desktop Data Table (≥ 768px) ── */}
            <div className="salary-table-responsive">
              <table className="salary-data-table">
                <thead>
                  <tr>
                    <th>Employee Details</th>
                    <th>Department &amp; Job</th>
                    <th>W.E.F. Date</th>
                    <th style={{ textAlign: 'right' }}>Basic Pay</th>
                    <th style={{ textAlign: 'right' }}>Gross (A)</th>
                    <th style={{ textAlign: 'right' }}>Deduction (B)</th>
                    <th style={{ textAlign: 'right' }}>Net Pay (C)</th>
                    <th style={{ textAlign: 'right' }}>Company (D)</th>
                    <th style={{ textAlign: 'right' }}>Monthly CTC (E)</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' }}></div>
                        Loading active salary records...
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#e11d48' }}>
                        <div>{error}</div>
                        <button onClick={loadData} className="btn-salary-refresh" style={{ marginTop: '10px' }}>
                          Try Again
                        </button>
                      </td>
                    </tr>
                  )}

                  {!loading && !error && filteredStructures.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                          {search ? 'No employees matching search criteria' : 'No salary structures prepared yet'}
                        </div>
                        <p style={{ fontSize: '13px', margin: '4px 0 16px', color: '#64748b' }}>
                          Click below to formulate and allocate the first employee salary &amp; CTC structure.
                        </p>
                        <button onClick={handleOpenCreate} className="btn-salary-primary">
                          + Create Salary Structure
                        </button>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredStructures.map((struct) => {
                      const empName = getEmpName(struct);
                      const empCode = getEmpCode(struct);
                      const empJob = getEmpDesignation(struct);
                      const empDept = getEmpDept(struct);
                      const wefDate = getWef(struct);

                      const empId = struct.employeeId || struct.employee?.id;
                      const payrollRec = employeePayrollStatusMap.get(empId);
                      const isAlreadySent =
                        payrollRec &&
                        ['PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'PENDING_FINANCE', 'PROCESSING', 'PAID', 'SALARY_PAID', 'ON_HOLD'].includes(
                          payrollRec.status
                        );

                      return (
                        <tr key={struct.id}>
                          {/* Employee Info */}
                          <td>
                            <div className="emp-cell-profile">
                              <div className="emp-avatar">{empName.charAt(0).toUpperCase()}</div>
                              <div className="emp-title-wrap">
                                <button
                                  onClick={() => handleOpenView(struct)}
                                  className="emp-name-link"
                                  title="Click to view full salary slip"
                                >
                                  {empName}
                                </button>
                                <span className="emp-code-chip">{empCode}</span>
                              </div>
                            </div>
                          </td>

                          {/* Department & Role */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{empJob}</span>
                              <span className="emp-dept-pill">{empDept}</span>
                            </div>
                          </td>

                          {/* W.E.F */}
                          <td>
                            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                              {wefDate}
                            </span>
                          </td>

                          {/* Basic */}
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            {money(struct.basicSalary)}
                          </td>

                          {/* Gross (A) */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-bold">{money(struct.grossSalary)}</span>
                          </td>

                          {/* Deduction (B) */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-deduction">-{money(struct.totalDeduction)}</span>
                          </td>

                          {/* Net Pay (C) */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-net-pill">{money(struct.netTakeHome)}</span>
                          </td>

                          {/* Company Cost (D) */}
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>
                            {money(struct.totalCompanyContribution)}
                          </td>

                          {/* CTC (E) */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-ctc-pill">{money(struct.ctcPerMonth)}</span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-group">
                              {isAlreadySent ? (
                                <button
                                  disabled
                                  className="btn-action-sm btn-send-admin btn-sent"
                                  title={`Already submitted to Super Admin (Status: ${payrollRec.status.replace(/_/g, ' ')})`}
                                >
                                  ✓ Sent to Superadmin
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSendToSuperAdmin(struct)}
                                  className="btn-action-sm btn-send-admin"
                                  title="Send this salary calculation to Super Admin for approval"
                                >
                                  {payrollRec?.status === 'RETURNED_TO_HR' ? '🔄 Re-send' : '📤 Send to Superadmin'}
                                </button>
                              )}

                              <button onClick={() => handleOpenView(struct)} className="btn-action-sm btn-view" title="Open Salary Slip">
                                📄 View Slip
                              </button>
                              <button onClick={() => handleOpenEdit(struct)} className="btn-action-sm btn-edit" title="Edit Structure">
                                ✏️ Edit
                              </button>
                              <button onClick={() => handleDelete(struct)} className="btn-action-sm btn-delete" title="Delete Structure">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Employee Cards (< 768px) ── */}
            <div className="salary-mobile-cards">
              {!loading &&
                filteredStructures.map((struct) => {
                  const empName = getEmpName(struct);
                  const empCode = getEmpCode(struct);
                  const empJob = getEmpDesignation(struct);
                  const empDept = getEmpDept(struct);
                  const wefDate = getWef(struct);

                  const empId = struct.employeeId || struct.employee?.id;
                  const payrollRec = employeePayrollStatusMap.get(empId);
                  const isAlreadySent =
                    payrollRec &&
                    ['PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'PENDING_FINANCE', 'PROCESSING', 'PAID', 'SALARY_PAID', 'ON_HOLD'].includes(
                      payrollRec.status
                    );

                  return (
                    <div key={struct.id} className="salary-emp-card">
                      <div className="salary-emp-card-header">
                        <div className="emp-cell-profile">
                          <div className="emp-avatar">{empName.charAt(0).toUpperCase()}</div>
                          <div className="emp-title-wrap">
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{empName}</span>
                            <span className="emp-code-chip">{empCode} • {empJob}</span>
                          </div>
                        </div>
                        <span className="emp-dept-pill">{empDept}</span>
                      </div>

                      <div className="salary-emp-card-grid">
                        <div className="salary-emp-card-stat">
                          <span>Gross (A)</span>
                          <strong>{money(struct.grossSalary)}</strong>
                        </div>
                        <div className="salary-emp-card-stat">
                          <span>Deductions (B)</span>
                          <strong style={{ color: '#e11d48' }}>{money(struct.totalDeduction)}</strong>
                        </div>
                        <div className="salary-emp-card-stat">
                          <span>Net In-Hand (C)</span>
                          <strong style={{ color: '#059669' }}>{money(struct.netTakeHome)}</strong>
                        </div>
                        <div className="salary-emp-card-stat">
                          <span>Monthly CTC (E)</span>
                          <strong style={{ color: '#d97706' }}>{money(struct.ctcPerMonth)}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Effective From: <strong>{wefDate}</strong></span>
                        <span>Company Cost (D): <strong>{money(struct.totalCompanyContribution)}</strong></span>
                      </div>

                      <div className="salary-emp-card-actions">
                        {isAlreadySent ? (
                          <button
                            disabled
                            className="btn-action-sm btn-send-admin btn-sent"
                            style={{ textAlign: 'center', padding: '8px', gridColumn: 'span 2' }}
                          >
                            ✓ Sent to Superadmin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendToSuperAdmin(struct)}
                            className="btn-action-sm btn-send-admin"
                            style={{ textAlign: 'center', padding: '8px', gridColumn: 'span 2' }}
                          >
                            {payrollRec?.status === 'RETURNED_TO_HR' ? '🔄 Re-send to Superadmin' : '📤 Send to Superadmin'}
                          </button>
                        )}
                        <button onClick={() => handleOpenView(struct)} className="btn-action-sm btn-view" style={{ textAlign: 'center', padding: '8px' }}>
                          📄 View Slip
                        </button>
                        <button onClick={() => handleOpenEdit(struct)} className="btn-action-sm btn-edit" style={{ textAlign: 'center', padding: '8px' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(struct)} className="btn-action-sm btn-delete" style={{ textAlign: 'center', padding: '8px' }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: PAYROLL SUBMISSION HISTORY & APPROVAL STATUS            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <>
            {/* History Toolbar Header */}
            <div className="salary-toolbar">
              <div className="salary-toolbar-info">
                <h2>Payroll Submission History &amp; Approval Tracking</h2>
                <p>Live status of monthly payrolls sent to Super Admin and Finance disbursement workflow</p>
              </div>

              <div className="salary-toolbar-actions">
                {/* Search Box */}
                <div className="salary-search-box">
                  <span className="salary-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by employee, code, department, status..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>

                {/* Refresh Button */}
                <button onClick={loadData} disabled={loading} className="btn-salary-refresh" title="Reload History">
                  🔄 {loading ? 'Loading...' : 'Refresh'}
                </button>

                {/* Switch back to Active Register */}
                <button
                  onClick={() => setActiveTab('register')}
                  className="btn-salary-refresh"
                  style={{ background: '#f8fafc', color: '#0f172a', fontWeight: 700 }}
                >
                  📋 Back to Active Register
                </button>
              </div>
            </div>

            {/* ── History Data Table (≥ 768px) ── */}
            <div className="salary-table-responsive">
              <table className="salary-data-table">
                <thead>
                  <tr>
                    <th>Employee Details</th>
                    <th>Department &amp; Job</th>
                    <th>Payroll Month</th>
                    <th>Payable / LOP Days</th>
                    <th style={{ textAlign: 'right' }}>Gross Earnings</th>
                    <th style={{ textAlign: 'right' }}>Total Deductions</th>
                    <th style={{ textAlign: 'right' }}>Net In-Hand Pay</th>
                    <th>Approval Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' }}></div>
                        Loading submission history...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>📜</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                          No payroll submission records found
                        </div>
                        <p style={{ fontSize: '13px', margin: '4px 0 16px', color: '#64748b' }}>
                          Submit your first prepared salary structure to Super Admin to begin approval tracking.
                        </p>
                        <button onClick={() => setActiveTab('register')} className="btn-salary-primary">
                          Go to Active Register
                        </button>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredHistory.map((rec) => {
                      const empName = rec.employeeName || rec.employee?.fullName || 'Staff Member';
                      const empCode = rec.employeeCode || rec.employee?.employeeCode || '—';
                      const empJob = rec.jobTitle || rec.employee?.jobTitle || 'Staff';
                      const empDept = rec.department || rec.employee?.department?.name || 'General';
                      const periodStr = rec.payrollPeriod ? `${rec.payrollPeriod.month}/${rec.payrollPeriod.year}` : `${rec.month || '—'}/${rec.year || '—'}`;

                      return (
                        <tr key={rec.id}>
                          {/* Employee Info */}
                          <td>
                            <div className="emp-cell-profile">
                              <div className="emp-avatar">{empName.charAt(0).toUpperCase()}</div>
                              <div className="emp-title-wrap">
                                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>{empName}</span>
                                <span className="emp-code-chip">{empCode}</span>
                              </div>
                            </div>
                          </td>

                          {/* Department & Role */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{empJob}</span>
                              <span className="emp-dept-pill">{empDept}</span>
                            </div>
                          </td>

                          {/* Payroll Period */}
                          <td>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                              🗓️ {periodStr}
                            </span>
                          </td>

                          {/* Days Breakdown */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                              <span><strong>{rec.payableDays || rec.presentDays || 0}</strong> Payable Days</span>
                              {Number(rec.unpaidDays || 0) > 0 && (
                                <span style={{ color: '#e11d48', fontWeight: 700 }}>{rec.unpaidDays} Days LOP Cut</span>
                              )}
                            </div>
                          </td>

                          {/* Gross Earnings */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-bold">{money(rec.grossEarnings)}</span>
                          </td>

                          {/* Deductions */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-deduction">-{money(rec.totalDeductions)}</span>
                          </td>

                          {/* Net Pay */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-net-pill">{money(rec.netPayable)}</span>
                          </td>

                          {/* Status Badge */}
                          <td>{getStatusBadge(rec.status)}</td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-group">
                              <button
                                onClick={() => {
                                  const struct = structures.find(
                                    (s) => s.employeeId === (rec.employeeId || rec.employee?.id) || s.id === rec.employeeId
                                  );
                                  handleOpenView(
                                    struct
                                      ? {
                                          ...struct,
                                          ...rec,
                                          grossSalary: rec.grossEarnings || struct.grossSalary,
                                          totalDeduction: rec.totalDeductions || struct.totalDeduction,
                                          netTakeHome: rec.netPayable || struct.netTakeHome,
                                          ctcPerMonth: Number(rec.grossEarnings || struct.grossSalary || 0) + Number(rec.employerTotalCost || struct.totalCompanyContribution || 0),
                                          totalCompanyContribution: rec.employerTotalCost || struct.totalCompanyContribution,
                                        }
                                      : {
                                          ...rec,
                                          basicSalary: rec.basicSalary,
                                          grossSalary: rec.grossEarnings,
                                          totalDeduction: rec.totalDeductions,
                                          netTakeHome: rec.netPayable,
                                          ctcPerMonth: Number(rec.grossEarnings || 0) + Number(rec.employerTotalCost || 0),
                                          totalCompanyContribution: rec.employerTotalCost,
                                        }
                                  );
                                }}
                                className="btn-action-sm btn-view"
                                title="View Salary Slip"
                              >
                                📄 View Slip
                              </button>

                              {rec.status === 'RETURNED_TO_HR' && (
                                <button
                                  onClick={() => handleSendToSuperAdmin(rec)}
                                  className="btn-action-sm btn-send-admin"
                                  title="Re-submit to Super Admin"
                                >
                                  🔄 Re-submit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile History Cards (< 768px) ── */}
            <div className="salary-mobile-cards">
              {!loading &&
                filteredHistory.map((rec) => {
                  const empName = rec.employeeName || rec.employee?.fullName || 'Staff Member';
                  const empCode = rec.employeeCode || rec.employee?.employeeCode || '—';
                  const empJob = rec.jobTitle || rec.employee?.jobTitle || 'Staff';
                  const empDept = rec.department || rec.employee?.department?.name || 'General';
                  const periodStr = rec.payrollPeriod ? `${rec.payrollPeriod.month}/${rec.payrollPeriod.year}` : `${rec.month || '—'}/${rec.year || '—'}`;

                  return (
                    <div key={rec.id} className="salary-emp-card">
                      <div className="salary-emp-card-header">
                        <div className="emp-cell-profile">
                          <div className="emp-avatar">{empName.charAt(0).toUpperCase()}</div>
                          <div className="emp-title-wrap">
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{empName}</span>
                            <span className="emp-code-chip">{empCode} • {empJob}</span>
                          </div>
                        </div>
                        <span className="emp-dept-pill">{empDept}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700 }}>Period: {periodStr}</span>
                        {getStatusBadge(rec.status)}
                      </div>

                      <div className="salary-emp-card-grid">
                        <div className="salary-emp-card-stat">
                          <span>Gross</span>
                          <strong>{money(rec.grossEarnings)}</strong>
                        </div>
                        <div className="salary-emp-card-stat">
                          <span>Deductions</span>
                          <strong style={{ color: '#e11d48' }}>-{money(rec.totalDeductions)}</strong>
                        </div>
                        <div className="salary-emp-card-stat">
                          <span>Net In-Hand</span>
                          <strong style={{ color: '#059669' }}>{money(rec.netPayable)}</strong>
                        </div>
                        <div className="salary-emp-card-stat">
                          <span>Payable Days</span>
                          <strong style={{ color: '#0f172a' }}>{rec.payableDays || rec.presentDays || 0}</strong>
                        </div>
                      </div>

                      <div className="salary-emp-card-actions">
                        <button
                          onClick={() => {
                            const struct = structures.find(
                              (s) => s.employeeId === (rec.employeeId || rec.employee?.id) || s.id === rec.employeeId
                            );
                            handleOpenView(
                              struct
                                ? {
                                    ...struct,
                                    ...rec,
                                    grossSalary: rec.grossEarnings || struct.grossSalary,
                                    totalDeduction: rec.totalDeductions || struct.totalDeduction,
                                    netTakeHome: rec.netPayable || struct.netTakeHome,
                                    ctcPerMonth: Number(rec.grossEarnings || struct.grossSalary || 0) + Number(rec.employerTotalCost || struct.totalCompanyContribution || 0),
                                    totalCompanyContribution: rec.employerTotalCost || struct.totalCompanyContribution,
                                  }
                                : {
                                    ...rec,
                                    basicSalary: rec.basicSalary,
                                    grossSalary: rec.grossEarnings,
                                    totalDeduction: rec.totalDeductions,
                                    netTakeHome: rec.netPayable,
                                    ctcPerMonth: Number(rec.grossEarnings || 0) + Number(rec.employerTotalCost || 0),
                                    totalCompanyContribution: rec.employerTotalCost,
                                  }
                            );
                          }}
                          className="btn-action-sm btn-view"
                          style={{ textAlign: 'center', padding: '8px', gridColumn: 'span 2' }}
                        >
                          📄 View Salary Slip
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
