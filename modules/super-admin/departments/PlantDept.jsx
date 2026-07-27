import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function PlantDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  const plantEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'Plant'
  );

  // Live Calculations from state
  const pendingApprovals = (state.materialRequests || []).filter(mr => mr.status === 'Pending');
  const approvedMRCount = (state.materialRequests || []).filter(mr => mr.status === 'Issued').length;
  const pendingPOs = (state.purchaseOrders || []).filter(po => po.status === 'REQUESTED').length;
  const activeWOs = (state.workOrders || []).filter(wo => wo.status === 'In Production').length;
  const dispatchClearances = (state.sales?.orders || []).filter(o => o.dispatchStatus === 'Delivered' || o.overallStage === 'Closed').length;

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
    { header: 'Sign-Offs Logged', accessor: 'tasksCompleted' },
    { header: 'Attendance', accessor: 'attendance', render: (row) => `${row.attendance}%` },
    { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Plant Head Command Dashboard"
        subtitle="Global schedules releasing, production order approvals, and material indent sign-offs"
        onBack={onBack}
      />

      {/* KPI Cards */}
      <DepartmentKPI
        data={[
          { title: 'Plant Officers', value: plantEmployees.length },
          { title: 'Pending Indent Approvals', value: pendingApprovals.length, borderClass: pendingApprovals.length > 0 ? 'border-left-purple' : 'border-left-emerald' },
          { title: 'Approved Indents Today', value: approvedMRCount },
          { title: 'Awaiting PO Clearances', value: pendingPOs },
          { title: 'Active Released WOs', value: activeWOs },
          { title: 'Dispatch Clearances Issued', value: dispatchClearances }
        ]}
      />

      {/* Material Approval Queue */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Material Indent Authorization Queue</h3>
        <DataTable
          columns={[
            { header: 'Request ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
            { header: 'Work Order Ref', accessor: 'workOrderId' },
            { header: 'Indented Items', accessor: 'materials', render: (row) => row.materials.map(m => `${m.materialName} (x${m.quantityRequested})`).join(', ') },
            { header: 'Requester Staff', accessor: 'requester' },
            { header: 'Authorization Status', accessor: 'status', render: (row) => <span style={{ background: row.status === 'Pending' ? 'rgba(251,191,36,0.12)' : 'rgba(16,185,129,0.12)', color: row.status === 'Pending' ? '#fbbf24' : '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{row.status}</span> }
          ]}
          data={state.materialRequests || []}
        />
      </div>

      {/* Work Order Schedule Board */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Released Job Schedules</h3>
        <DataTable
          columns={[
            { header: 'WO#', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
            { header: 'Product Item', accessor: 'productName' },
            { header: 'Job Quantity', accessor: 'quantity' },
            { header: 'Required Date', accessor: 'targetDate' },
            { header: 'Priority Level', accessor: 'priority', render: (row) => <span style={{ color: row.priority === 'High' ? '#ef4444' : '#3b82f6', fontWeight: 'bold' }}>{row.priority}</span> },
            { header: 'Progress', accessor: 'progress', render: (row) => `${row.progress}%` },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={state.workOrders || []}
        />
      </div>

      {/* Plant Team Personnel */}
      <EmployeeTable
        employees={plantEmployees}
        columns={employeeColumns}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />
    </div>
  );
}
