'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ExitClearanceFormModal from '../../hr/components/ExitClearanceFormModal';
import { exportToCSV, exportToExcel } from '../../../services/export.service';
import { useERP } from '../../../shared/context/ERPContext';
import { FileText, Eye, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function HRDept({ state: propState, deptEmployee, setDeptEmployee, onBack, navigate, showToast, showExitClearanceOnly = false }) {
  const { state: erpState, dispatch } = useERP();
  const state = propState || erpState || {};
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedExitRecord, setSelectedExitRecord] = useState(null);

  const defaultExitClearances = [
    {
      empId: 'EMP-005',
      name: 'Neha Shah',
      department: 'Finance',
      effectiveDate: '2026-06-30',
      empDetails: {
        id: 'EMP-005',
        name: 'Neha Shah',
        designation: 'Senior Accountant',
        department: 'Finance',
        dateOfJoining: '2021-03-15',
        resignationDate: '2026-05-30',
        lastWorkingDay: '2026-06-30',
        noticePeriod: '30',
        noticeServed: '30',
        reportingManager: 'Anil Kumar (VP Finance)'
      },
      clearance: {
        workHandover: 'Completed',
        assetsReturned: 'Yes',
        financeDues: 'Cleared',
        adminClearance: 'Cleared',
        managerClearance: 'Cleared',
        exitInterview: 'Done',
        leaveBalance: '5',
        fullAndFinal: 'Completed'
      },
      assets: {
        laptopPc: true,
        monitor: true,
        keyboardMouse: true,
        mobileCharger: true,
        idCard: true,
        keys: true,
        headsetDisk: false,
        documentsFiles: true,
        other: 'Access token returned'
      },
      approval: {
        remarks: 'Handover complete. All financial ledger access revoked.',
        empSignature: 'Neha Shah',
        empSigDate: '2026-06-30',
        mgrSignature: 'Anil Kumar',
        mgrSigDate: '2026-06-30',
        hrSignature: 'Raman HR',
        hrSigDate: '2026-06-30',
        finalHrStatus: 'Cleared',
        hrSignOff: 'Raman HR',
        hrSignOffDate: '2026-06-30',
        companyStamp: 'Himalaya Enterprises - HR Seal'
      },
      checkpoints: { IT: true, Finance: true, Store: true, HR: true },
      progress: 100,
      status: 'Cleared'
    },
    {
      empId: 'EMP-002',
      name: 'Ramanathan Swamy',
      department: 'Operations',
      effectiveDate: '2026-07-15',
      empDetails: {
        id: 'EMP-002',
        name: 'Ramanathan Swamy',
        designation: 'Operations Lead',
        department: 'Operations',
        dateOfJoining: '2022-04-10',
        resignationDate: '2026-06-15',
        lastWorkingDay: '2026-07-15',
        noticePeriod: '30',
        noticeServed: '30',
        reportingManager: 'Plant Manager'
      },
      clearance: {
        workHandover: 'Pending',
        assetsReturned: 'Yes',
        financeDues: 'Pending',
        adminClearance: 'Cleared',
        managerClearance: 'Pending',
        exitInterview: 'Pending',
        leaveBalance: '8',
        fullAndFinal: 'Pending'
      },
      assets: {
        laptopPc: true,
        monitor: false,
        keyboardMouse: true,
        mobileCharger: true,
        idCard: true,
        keys: true,
        headsetDisk: true,
        documentsFiles: true,
        other: ''
      },
      approval: {
        remarks: 'Notice period underway. Store handover pending.',
        empSignature: 'Ramanathan Swamy',
        empSigDate: '2026-06-15',
        mgrSignature: '',
        mgrSigDate: '',
        hrSignature: 'HR Team',
        hrSigDate: '2026-06-15',
        finalHrStatus: 'Pending',
        hrSignOff: '',
        hrSignOffDate: '',
        companyStamp: 'Himalaya Enterprises - HR Seal'
      },
      checkpoints: { IT: true, Finance: false, Store: true, HR: false },
      progress: 50,
      status: 'In Progress'
    }
  ];

  const exitClearances = useMemo(() => {
    if (state?.exitClearances?.length > 0) return state.exitClearances;
    try {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('himalaya_exit_clearances') || '[]');
        if (Array.isArray(stored) && stored.length > 0) return stored;
      }
    } catch {}
    return defaultExitClearances;
  }, [state?.exitClearances]);

  const totalEmployees = state.employees?.length || 0;
  const onLeaveCount = (state.leaves || []).filter(l => l.status === 'Approved' || l.status === 'PH Pending').length;
  const presentToday = totalEmployees - onLeaveCount;
  const payrollTotal = (state.employees || []).reduce((sum, e) => sum + (e.salary || 30000), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(payrollTotal / totalEmployees) : 0;
  const departmentsCount = new Set((state.employees || []).map(e => e.department)).size;

  const handleExportRegistryCSV = () => {
    const data = exitClearances.map(item => ({
      'Employee Code': item.empId,
      'Resigning Staff': item.name,
      'Department': item.department,
      'Effective Date': item.effectiveDate,
      'IT Cleared': item.checkpoints?.IT ? 'Yes' : 'No',
      'Finance Cleared': item.checkpoints?.Finance ? 'Yes' : 'No',
      'Store Cleared': item.checkpoints?.Store ? 'Yes' : 'No',
      'HR Cleared': item.checkpoints?.HR ? 'Yes' : 'No',
      'Clearance Progress': `${item.progress}%`,
      'Overall Status': item.status
    }));
    exportToCSV(data, `exit-clearance-registry-superadmin-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportRegistryExcel = () => {
    const data = exitClearances.map(item => ({
      'Employee Code': item.empId,
      'Resigning Staff': item.name,
      'Department': item.department,
      'Effective Date': item.effectiveDate,
      'IT Cleared': item.checkpoints?.IT ? 'Yes' : 'No',
      'Finance Cleared': item.checkpoints?.Finance ? 'Yes' : 'No',
      'Store Cleared': item.checkpoints?.Store ? 'Yes' : 'No',
      'HR Cleared': item.checkpoints?.HR ? 'Yes' : 'No',
      'Clearance Progress': `${item.progress}%`,
      'Overall Status': item.status
    }));
    exportToExcel(data, `exit-clearance-registry-superadmin-${new Date().toISOString().split('T')[0]}.xls`);
  };

  if (deptEmployee) {
    return (
      <EmployeeDetail
        emp={deptEmployee}
        state={state}
        onBack={() => setDeptEmployee(null)}
      />
    );
  }

  // Component for Exit Clearance Table
  const ExitClearanceRegistryComponent = () => (
    <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 className="card-heading" style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>Corporate Offboarding & Exit Clearance Registry</h2>
            <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> Read-Only Audit Access
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', display: 'block', marginTop: '2px' }}>All employee resignation records, department clearance checkpoints, & official forms</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="action-btn"
            style={{ background: '#0284c7', border: 'none', padding: '8px 14px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            onClick={handleExportRegistryCSV}
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            type="button"
            className="action-btn"
            style={{ background: '#16a34a', border: 'none', padding: '8px 14px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            onClick={handleExportRegistryExcel}
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-only">
        <DataTable 
          columns={[
            { 
              header: 'Employee Code', 
              accessor: 'empId',
              render: (row) => (
                <span style={{ fontWeight: '800', color: '#0284c7', background: 'rgba(2, 132, 199, 0.08)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                  {row.empId}
                </span>
              )
            },
            { 
              header: 'Resigning Staff', 
              accessor: 'name', 
              render: (row) => (
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{row.name}</strong>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{row.empDetails?.designation || row.designation || 'Staff'}</div>
                </div>
              ) 
            },
            { 
              header: 'Department', 
              accessor: 'department',
              render: (row) => (
                <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                  {row.department}
                </span>
              )
            },
            { 
              header: 'Effective Date', 
              accessor: 'effectiveDate',
              render: (row) => (
                <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
                  {row.effectiveDate || 'N/A'}
                </span>
              )
            },
            { 
              header: 'Department Checkpoints', 
              accessor: 'empId',
              render: (row) => (
                <div style={{ display: 'flex', gap: '6px', fontSize: '11px', flexWrap: 'wrap' }}>
                  {Object.entries(row.checkpoints || { IT: false, Finance: false, Store: false, HR: false }).map(([dept, isCleared]) => (
                    <span 
                      key={dept} 
                      style={{ 
                        background: isCleared ? 'rgba(22, 163, 74, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
                        color: isCleared ? '#16a34a' : '#b45309', 
                        border: `1px solid ${isCleared ? 'rgba(22, 163, 74, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                        padding: '2px 7px', 
                        borderRadius: '4px',
                        fontWeight: '700'
                      }}
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              )
            },
            { 
              header: 'Clearance Progress', 
              accessor: 'progress', 
              render: (row) => {
                const pct = row.progress || 0;
                return (
                  <div style={{ width: '120px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', marginBottom: '3px', color: pct === 100 ? '#16a34a' : '#0284c7' }}>
                      <span>{pct}%</span>
                      <span>{pct === 100 ? 'Complete' : 'In Progress'}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              } 
            },
            { 
              header: 'Overall Status', 
              accessor: 'status', 
              render: (row) => (
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '11.5px', 
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: row.status === 'Cleared' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                  color: row.status === 'Cleared' ? '#16a34a' : '#0284c7' 
                }}>
                  {row.status === 'Cleared' ? '✓ Cleared' : '⏳ In Progress'}
                </span>
              ) 
            },
            {
              header: 'Official Form',
              accessor: 'empId',
              render: (row) => (
                <button
                  type="button"
                  className="action-btn"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => {
                    setSelectedExitRecord(row);
                    setShowExitModal(true);
                  }}
                >
                  <FileText size={13} color="#0284c7" /> View Form (Read-Only)
                </button>
              )
            }
          ]}
          data={exitClearances}
        />
      </div>

      {/* Mobile Horizontal List Cards */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {exitClearances.map((item, idx) => (
          <div
            key={item.empId || idx}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* Header: Name + Code + Department & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>
                    {item.empId}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>• {item.department}</span>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            {/* Effective Date & Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
              <div>
                <span style={{ color: '#64748b' }}>Effective: </span>
                <strong>{item.effectiveDate}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '110px' }}>
                <div style={{ flex: 1, background: '#E2E8F0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.progress}%`, background: item.progress === 100 ? '#10B981' : '#3B82F6', height: '100%' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.progress}%</span>
              </div>
            </div>

            {/* Checkpoints Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Checkpoints:</span>
              <div style={{ display: 'flex', gap: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                <span style={{ background: item.checkpoints?.IT ? '#E6F4EA' : '#FCE8E6', color: item.checkpoints?.IT ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>IT</span>
                <span style={{ background: item.checkpoints?.Finance ? '#E6F4EA' : '#FCE8E6', color: item.checkpoints?.Finance ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>FIN</span>
                <span style={{ background: item.checkpoints?.Store ? '#E6F4EA' : '#FCE8E6', color: item.checkpoints?.Store ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>STORE</span>
                <span style={{ background: item.checkpoints?.HR ? '#E6F4EA' : '#FCE8E6', color: item.checkpoints?.HR ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>HR</span>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              style={{
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onClick={() => {
                setSelectedExitRecord(item);
                setShowExitModal(true);
              }}
            >
              <FileText size={14} color="#38bdf8" /> View Form (Read-Only)
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (showExitClearanceOnly) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <DepartmentHeader
          title="Corporate Offboarding & Exit Clearance Registry"
          subtitle="Super Admin read-only audit dashboard for employee resignation records and department sign-offs"
          onBack={onBack}
        />
        <ExitClearanceRegistryComponent />

        <ExitClearanceFormModal
          isOpen={showExitModal}
          onClose={() => {
            setShowExitModal(false);
            setSelectedExitRecord(null);
          }}
          employees={state.employees || []}
          initialData={selectedExitRecord}
          readOnly={true}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Human Resources (HR) Command Center"
        subtitle="Global employee records, leave administration, payroll matrices, and offboarding clearances"
        onBack={onBack}
      />

      {/* KPI Cards */}
      <DepartmentKPI
        data={[
          { title: 'Total Enterprise Employees', value: totalEmployees },
          { title: 'Roster Present Today', value: presentToday },
          { title: 'Roster On Approved Leave', value: onLeaveCount, borderClass: onLeaveCount > 0 ? 'border-left-purple' : 'border-left-emerald' },
          { title: 'Offboarding Clearance Registry', value: exitClearances.length },
          { title: 'Gross Payroll Accrual', value: `₹${payrollTotal.toLocaleString()}` },
          { title: 'Roster Average Salary', value: `₹${avgSalary.toLocaleString()}` }
        ]}
      />

      {/* Offboarding Registry Section */}
      <ExitClearanceRegistryComponent />

      {/* Active Employees List */}
      <EmployeeTable
        employees={state.employees || []}
        columns={[
          { header: 'ID', accessor: 'id' },
          { header: 'Employee Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
          { header: 'Department', accessor: 'department' },
          { header: 'Role Assigned', accessor: 'role' },
          { header: 'Joining Date', accessor: 'joiningDate' },
          { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
        ]}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />

      {/* Leaves Logs & Payroll Splits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        <div className="app-card" style={{ margin: 0 }}>
          <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Roster Leave Requests Ledger</h3>
          <DataTable
            columns={[
              { header: 'Leave ID', accessor: 'id' },
              { header: 'Employee', accessor: 'empName', render: (row) => <strong>{row.empName}</strong> },
              { header: 'Duration (Days)', accessor: 'duration' },
              { header: 'Reason Text', accessor: 'reason' },
              { header: 'Approval status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
            ]}
            data={state.leaves || []}
          />
        </div>

        <div className="app-card" style={{ margin: 0 }}>
          <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Roster Attendance Ledger</h3>
          <DataTable
            columns={[
              { header: 'Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Department', accessor: 'department' },
              { header: 'Attendance %', accessor: 'attendance', render: (row) => `${row.attendance || 100}%` },
              { header: 'Leaves Taken', accessor: 'leavesTaken', render: (row) => `${row.leavesTaken || 0} Days` }
            ]}
            data={state.employees || []}
          />
        </div>
      </div>

      <ExitClearanceFormModal
        isOpen={showExitModal}
        onClose={() => {
          setShowExitModal(false);
          setSelectedExitRecord(null);
        }}
        employees={state.employees || []}
        initialData={selectedExitRecord}
        readOnly={true}
      />
    </div>
  );
}
