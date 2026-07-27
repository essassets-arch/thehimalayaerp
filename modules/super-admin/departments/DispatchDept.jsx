import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function DispatchDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  const dispatchEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'Dispatch'
  );

  // Live Calculations from state
  const pendingDispatch = (state.sales?.orders || []).filter(o => o.dispatchStatus === 'Pending' && o.status !== 'Closed').length;
  const inTransit = (state.sales?.orders || []).filter(o => o.dispatchStatus === 'Dispatched' || o.dispatchStatus === 'Shipped').length;
  const deliveredCount = (state.dispatches || []).filter(d => d.status === 'Delivered').length;
  const totalFreight = (state.dispatches || []).reduce((sum, d) => sum + (d.transportCost || 0), 0);

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
    { header: 'Trips Completed', accessor: 'tasksCompleted' },
    { header: 'Attendance', accessor: 'attendance', render: (row) => `${row.attendance}%` },
    { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  const vehicleFleet = [
    { id: 'V01', vehicleNo: 'MH-12-PQ-1234', type: '10-Ton Truck', driver: 'Ramesh Singh', currentOrder: 'ORD-0804', status: 'Available' },
    { id: 'V02', vehicleNo: 'DL-01-AB-5678', type: 'Container Lorry', driver: 'Manpreet Singh', currentOrder: 'None', status: 'Idle' },
    { id: 'V03', vehicleNo: 'KA-03-CD-9012', type: 'Flatbed Trailer', driver: 'Anand Kumar', currentOrder: 'None', status: 'Maintenance' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Logistics & Dispatch Control"
        subtitle="Freight logs, fleet assignments, deliveries monitoring, and LR tracking"
        onBack={onBack}
      />

      {/* KPI Cards */}
      <DepartmentKPI
        data={[
          { title: 'Dispatch Personnel', value: dispatchEmployees.length },
          { title: 'Pending Shipments', value: pendingDispatch },
          { title: 'Vehicles In-Transit', value: inTransit },
          { title: 'Delivered Orders', value: deliveredCount },
          { title: 'Logistics Cost Accrued', value: `₹${totalFreight.toLocaleString()}` },
          { title: 'On-Time Delivery Rate', value: '98%' }
        ]}
      />

      {/* Vehicle Fleet Status */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Vehicle Fleet Registry</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {vehicleFleet.map((v) => (
            <div 
              key={v.id} 
              style={{ 
                padding: '12px 16px', 
                background: 'rgba(0,0,0,0.015)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '13px' }}>{v.vehicleNo}</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  background: v.status === 'Available' || v.status === 'Idle' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: v.status === 'Available' || v.status === 'Idle' ? '#10b981' : '#ef4444'
                }}>
                  {v.status}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#5E6B82', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>Type: <strong>{v.type}</strong></span>
                <span>Assigned Operator: <strong>{v.driver}</strong></span>
                <span>Active Consignment: <strong>{v.currentOrder}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatches Logs Table */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Dispatches & Freight Ledger</h3>
        <DataTable
          columns={[
            { header: 'Dispatch ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
            { header: 'Order Ref', accessor: 'orderNo' },
            { header: 'Consignee Name', accessor: 'customerName' },
            { header: 'Transporter Fleet', accessor: 'transporter' },
            { header: 'Lorry Receipt (LR)', accessor: 'lrNumber' },
            { header: 'Freight Charge', accessor: 'transportCost', render: (row) => `₹${row.transportCost?.toLocaleString()}` },
            { header: 'Delivery Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={state.dispatches || []}
        />
      </div>

      {/* Dispatch Team Personnel */}
      <EmployeeTable
        employees={dispatchEmployees}
        columns={employeeColumns}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />
    </div>
  );
}
