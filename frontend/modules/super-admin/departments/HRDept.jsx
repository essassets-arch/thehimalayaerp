'use client';

import React, { useState } from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ExitClearanceFormModal from '../../hr/components/ExitClearanceFormModal';
import { exportToCSV, exportToExcel } from '../../../services/export.service';
import { FileText, Eye, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function HRDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast, showExitClearanceOnly = false }) {
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedExitRecord, setSelectedExitRecord] = useState(null);

  const defaultExitClearances = [
    {
      empId: 'EMP-014',
      name: 'Neha Shah',
      department: 'Marketing & Sales',
      effectiveDate: '2026-06-30',
      empDetails: {
        name: 'Neha Shah',
        id: 'EMP-014',
        designation: 'Marketing Executive',
        department: 'Marketing & Sales',
        dateOfJoining: '2022-04-10',
        resignationDate: '2026-05-30',
        lastWorkingDay: '2026-06-30',
        noticePeriod: '30',
        noticeServed: '30',
        reportingManager: 'Sales Director'
      },
      clearance: {
        workHandover: 'Completed',
        assetsReturned: 'Yes',
        financeDues: 'Cleared',
        adminClearance: 'Cleared',
        managerClearance: 'Cleared',
        exitInterview: 'Done',
        leaveBalance: '4',
        fullAndFinal: 'Completed'
      },
      assets: {
        laptopPc: true,
        monitor: true,
        keyboardMouse: true,
        mobileCharger: true,
        idCard: true,
        keys: true,
        headsetDisk: true,
        documentsFiles: true,
        other: 'Marketing Collateral Drive'
      },
      approval: {
        remarks: 'All clearance formalities completed seamlessly.',
        empSignature: 'Neha Shah',
        empSigDate: '2026-05-30',
        mgrSignature: 'Sales Director',
        mgrSigDate: '2026-06-05',
        hrSignature: 'HR Head',
        hrSigDate: '2026-06-10',
        finalHrStatus: 'Cleared',
        hrSignOff: 'HR Head - Sign Off',
        hrSignOffDate: '2026-06-10',
        companyStamp: 'Himalaya Enterprises - HR Official Seal'
      },
      checkpoints: { IT: true, Finance: true, Store: true, HR: true },
      progress: 100,
      status: 'Cleared'
    },
    {
      empId: 'EMP-009',
      name: 'Ramanathan Swamy',
      department: 'Plant Operations',
      effectiveDate: '2026-07-15',
      empDetails: {
        name: 'Ramanathan Swamy',
        id: 'EMP-009',
        designation: 'Senior Shift Engineer',
        department: 'Plant Operations',
        dateOfJoining: '2021-08-15',
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

  const exitClearances = state?.exitClearances?.length > 0 ? state.exitClearances : defaultExitClearances;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="card-heading" style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Corporate Offboarding & Exit Clearance Registry</h2>
            <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> Read-Only Audit Access
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82' }}>All employee resignation records, department clearance checkpoints, & official forms</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

      <DataTable 
        columns={[
          { header: 'Employee Code', accessor: 'empId' },
          { header: 'Resigning Staff', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
          { header: 'Department', accessor: 'department' },
          { header: 'Effective Date', accessor: 'effectiveDate' },
          { 
            header: 'Department Checkpoints Status', 
            accessor: 'empId',
            render: (row) => (
              <div style={{ display: 'flex', gap: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                <span style={{ background: row.checkpoints?.IT ? '#E6F4EA' : '#FCE8E6', color: row.checkpoints?.IT ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>IT</span>
                <span style={{ background: row.checkpoints?.Finance ? '#E6F4EA' : '#FCE8E6', color: row.checkpoints?.Finance ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>FIN</span>
                <span style={{ background: row.checkpoints?.Store ? '#E6F4EA' : '#FCE8E6', color: row.checkpoints?.Store ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>STORE</span>
                <span style={{ background: row.checkpoints?.HR ? '#E6F4EA' : '#FCE8E6', color: row.checkpoints?.HR ? '#137333' : '#C5221F', padding: '2px 6px', borderRadius: '4px' }}>HR</span>
              </div>
            )
          },
          { 
            header: 'Clearance Progress', 
            accessor: 'progress',
            render: (row) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                <div style={{ flex: 1, background: '#E2E8F0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${row.progress}%`, background: row.progress === 100 ? '#10B981' : '#3B82F6', height: '100%' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{row.progress}%</span>
              </div>
            )
          },
          { header: 'Overall Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
          {
            header: 'Action',
            accessor: 'empId',
            render: (row) => (
              <button
                type="button"
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => {
                  setSelectedExitRecord(row);
                  setShowExitModal(true);
                }}
              >
                <Eye size={13} /> View Form (Read-Only)
              </button>
            )
          }
        ]}
        data={exitClearances}
      />
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
          onClose={() => setShowExitModal(false)}
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
        onClose={() => setShowExitModal(false)}
        employees={state.employees || []}
        initialData={selectedExitRecord}
        readOnly={true}
      />
    </div>
  );
}
