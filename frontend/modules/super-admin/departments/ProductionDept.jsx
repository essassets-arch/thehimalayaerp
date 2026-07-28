import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function ProductionDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  const prodEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'Production'
  );

  // Live work orders calculations
  const totalWOs = state.workOrders?.length || 0;
  const runningJobs = state.workOrders?.filter(wo => wo.status === 'In Production').length || 0;
  const completedJobs = state.workOrders?.filter(wo => wo.status === 'Closed' || wo.status === 'Completed').length || 0;
  const delayedJobs = state.workOrders?.filter(wo => wo.status === 'Material Requested' || wo.priority === 'High' && wo.progress < 50).length || 0;
  const avgEfficiency = 92; // default high efficiency benchmark

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
    { header: 'Tasks Completed', accessor: 'tasksCompleted' },
    { header: 'Attendance', accessor: 'attendance', render: (row) => `${row.attendance}%` },
    { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Production Department Monitoring"
        subtitle="Shop floor work orders dispatching, machine configurations, and shift allocations"
        onBack={onBack}
      />

      {/* KPIs */}
      <DepartmentKPI
        data={[
          { title: 'Total Workers', value: prodEmployees.length },
          { title: 'Running Jobs', value: runningJobs },
          { title: 'Completed Jobs', value: completedJobs },
          { title: 'Delayed Batches', value: delayedJobs },
          { title: 'Plant Efficiency', value: `${avgEfficiency}%` }
        ]}
      />

      {/* Machine Status Grid */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Floor Machine Status (Live telemetry)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {(state.machines || []).map((m) => (
            <div 
              key={m.id} 
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
                <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '13px' }}>{m.id}: {m.name}</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  background: m.status === 'Running' ? 'rgba(16, 185, 129, 0.15)' : m.status === 'Idle' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: m.status === 'Running' ? '#10b981' : m.status === 'Idle' ? '#fbbf24' : '#ef4444'
                }}>
                  {m.status}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#5E6B82' }}>
                {m.currentWO ? (
                  <>
                    <span>Current Job: <strong>{m.currentWO}</strong></span>
                    <div style={{ width: '100%', background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                      <div style={{ width: `${m.completion}%`, height: '100%', background: 'var(--color-primary)' }} />
                    </div>
                    <span style={{ fontSize: '9px', marginTop: '2px', display: 'block', textAlign: 'right' }}>{m.completion}% Completed</span>
                  </>
                ) : (
                  <span>No Job Configured</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Active Production Work Orders</h3>
        <DataTable
          columns={[
            { header: 'WO#', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
            { header: 'Product Item', accessor: 'productName' },
            { header: 'Target Qty', accessor: 'quantity' },
            { header: 'Progress', accessor: 'progress', render: (row) => `${row.progress}%` },
            { header: 'Current Stage', accessor: 'stage' },
            { header: 'Priority', accessor: 'priority', render: (row) => <span style={{ color: row.priority === 'High' ? '#ef4444' : '#3b82f6', fontWeight: 'bold' }}>{row.priority}</span> },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={state.workOrders || []}
        />
      </div>

      {/* Production Roster */}
      <EmployeeTable
        employees={prodEmployees}
        columns={employeeColumns}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />

      {/* Flow displaying production pipeline stages */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '20px' }}>Production Floor Stage Map</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {['Order Received', 'Planning', 'Material Request', 'Production Floor', 'Quality Check', 'Dispatch Logged'].map((stage, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.015)', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', minWidth: '130px' }}>
                <span style={{ display: 'block', fontSize: '9px', color: '#475569', marginBottom: '2px' }}>Stage 0{idx+1}</span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stage}</span>
              </div>
              {idx < 5 && <span style={{ color: 'var(--color-primary)', fontSize: '16px', fontWeight: 'bold' }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
