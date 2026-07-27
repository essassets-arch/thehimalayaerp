import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function QCDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  const qcEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'QC'
  );

  // Live Calculations from state
  const totalSamples = state.sales?.samples?.length || 0;
  const underTesting = state.sales?.samples?.filter(s => s.status === 'Sent' || s.status === 'Pending').length || 0;
  const passedSamples = state.sales?.samples?.filter(s => s.status === 'Approved' || s.status === 'Passed').length || 0;
  const rejectedSamples = state.sales?.samples?.filter(s => s.status === 'Failed' || s.status === 'Rejected' || s.status === 'Lost').length || 0;
  
  const yieldRate = totalSamples > 0 ? Math.round((passedSamples / totalSamples) * 100) : 100;
  const defectRate = totalSamples > 0 ? Math.round((rejectedSamples / totalSamples) * 100) : 0;

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
    { header: 'Inspector', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
    { header: 'Role', accessor: 'role' },
    { header: 'Tests Logged', accessor: 'tasksCompleted' },
    { header: 'Attendance', accessor: 'attendance', render: (row) => `${row.attendance}%` },
    { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Quality Control (QC) Command Center"
        subtitle="Sample prototyping inspections, tolerance reports, pass/fail yields, and defect registries"
        onBack={onBack}
      />

      {/* KPI Cards */}
      <DepartmentKPI
        data={[
          { title: 'QC Staff Inspectors', value: qcEmployees.length },
          { title: 'Total Sample Lots', value: totalSamples },
          { title: 'Under Testing Labs', value: underTesting },
          { title: 'Passed Shipments', value: passedSamples },
          { title: 'Rejected / Rework', value: rejectedSamples, borderClass: rejectedSamples > 0 ? 'border-left-red' : 'border-left-emerald' },
          { title: 'First-Pass Yield', value: `${yieldRate}%` }
        ]}
      />

      {/* Inspection Register */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Laboratory Quality Registry Logs</h3>
        <DataTable
          columns={[
            { header: 'Sample ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>SMP-{String(row.id).padStart(3, '0')}</strong> },
            { header: 'Customer Ref', accessor: 'leadName' },
            { header: 'Product Item', accessor: 'product' },
            { header: 'Sample Quantity', accessor: 'quantity' },
            { header: 'Dispatch Date', accessor: 'dispatchDate', render: (row) => row.dispatchDate || 'Pending Prep' },
            { 
              header: 'Inspection Result', 
              accessor: 'status', 
              render: (row) => {
                const status = row.status;
                const isPass = status === 'Approved' || status === 'Passed';
                const isFail = status === 'Failed' || status === 'Rejected' || status === 'Lost';
                return (
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: isPass ? '#10b981' : isFail ? '#ef4444' : '#fbbf24',
                    background: isPass ? 'rgba(16,185,129,0.12)' : isFail ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.12)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {status}
                  </span>
                );
              }
            }
          ]}
          data={state.sales?.samples || []}
        />
      </div>

      {/* Yield Visualizer Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        <div className="app-card" style={{ margin: 0, padding: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: 'var(--color-text-primary)' }}>First-Pass Yield Analytics</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span>Target Yield Rate: <strong>95%</strong></span>
            <span>Current Yield Rate: <strong style={{ color: yieldRate >= 95 ? '#10b981' : '#fbbf24' }}>{yieldRate}%</strong></span>
          </div>
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${yieldRate}%`, height: '100%', background: yieldRate >= 95 ? '#10b981' : '#fbbf24' }} />
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', display: 'block', marginTop: '8px' }}>
            Calculated as Passed Samples divided by Total Samples registered in state database.
          </span>
        </div>

        <div className="app-card" style={{ margin: 0, padding: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: 'var(--color-text-primary)' }}>Defect Analytics Rate</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span>Critical Defect Cap: <strong>5%</strong></span>
            <span>Current Defect Rate: <strong style={{ color: defectRate <= 5 ? '#10b981' : '#ef4444' }}>{defectRate}%</strong></span>
          </div>
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${defectRate}%`, height: '100%', background: defectRate <= 5 ? '#10b981' : '#ef4444' }} />
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', display: 'block', marginTop: '8px' }}>
            Reflects the ratio of rejected/lost prototypes under laboratory inspection protocol.
          </span>
        </div>

      </div>

      {/* QC Team Personnel */}
      <EmployeeTable
        employees={qcEmployees}
        columns={employeeColumns}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />
    </div>
  );
}
