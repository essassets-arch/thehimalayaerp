import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function HRDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  const hrEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'HR'
  );

  // Live Calculations from state
  const totalEmployees = state.employees?.length || 0;
  const onLeaveCount = (state.leaves || []).filter(l => l.status === 'Approved' || l.status === 'PH Pending').length;
  const presentToday = totalEmployees - onLeaveCount;
  
  const payrollTotal = (state.employees || []).reduce((sum, e) => sum + (e.salary || 30000), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(payrollTotal / totalEmployees) : 0;

  // Group departments count
  const departmentsCount = new Set((state.employees || []).map(e => e.department)).size;

  if (deptEmployee) {
    return (
      <EmployeeDetail
        emp={deptEmployee}
        state={state}
        onBack={() => setDeptEmployee(null)}
      />
    );
  }

  const employeeColumns = [
    { header: 'Employee', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
    { header: 'Role', accessor: 'role' },
    { header: 'Leave Balance', accessor: 'leavesTaken', render: (row) => `${15 - (row.leavesTaken || 0)} Days` },
    { header: 'Salary', accessor: 'salary', render: (row) => `₹${(row.salary || 0).toLocaleString()}` },
    { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Human Resources (HR) Command Center"
        subtitle="Global employee records, leave administration, payroll matrices, and roster details"
        onBack={onBack}
      />

      {/* KPI Cards */}
      <DepartmentKPI
        data={[
          { title: 'Total Enterprise Employees', value: totalEmployees },
          { title: 'Roster Present Today', value: presentToday },
          { title: ' Roster On Approved Leave', value: onLeaveCount, borderClass: onLeaveCount > 0 ? 'border-left-purple' : 'border-left-emerald' },
          { title: 'Unique Departments', value: departmentsCount },
          { title: 'Gross Payroll Accrual', value: `₹${payrollTotal.toLocaleString()}` },
          { title: 'Roster Average Salary', value: `₹${avgSalary.toLocaleString()}` }
        ]}
      />

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
    </div>
  );
}
