import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function FinanceDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  const financeEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'Finance'
  );

  // Live Calculations from state
  const totalInvoiced = (state.payments || []).reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const revenueCollected = (state.payments || []).reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const outstandingAmount = totalInvoiced - revenueCollected;
  const verifiedCount = (state.payments || []).filter(p => p.verified && p.verified !== 'None').length;
  
  const collectionPercentage = totalInvoiced > 0 ? Math.round((revenueCollected / totalInvoiced) * 100) : 0;

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
    { header: 'Verification Tasks', accessor: 'tasksCompleted' },
    { header: 'Attendance', accessor: 'attendance', render: (row) => `${row.attendance}%` },
    { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Finance & Accounts Command Center"
        subtitle="Revenue ledger journals, invoice audits, accounts outstanding, and transaction matching tracking"
        onBack={onBack}
      />

      {/* KPI Cards */}
      <DepartmentKPI
        data={[
          { title: 'Finance Executives', value: financeEmployees.length },
          { title: 'Total Revenue Collected', value: `₹${revenueCollected.toLocaleString()}` },
          { title: 'Outstanding Receivables', value: `₹${outstandingAmount.toLocaleString()}`, borderClass: outstandingAmount > 0 ? 'border-left-purple' : 'border-left-emerald' },
          { title: 'Verified Invoices', value: verifiedCount },
          { title: 'Collection Rate', value: `${collectionPercentage}%` }
        ]}
      />

      {/* Receivables Aging Analysis */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Receivables Aging Ledger</h3>
        <DataTable
          columns={[
            { header: 'Customer Partner', accessor: 'customerName', render: (row) => <strong>{row.customerName}</strong> },
            { header: 'Invoice Reference', accessor: 'invoiceNo' },
            { header: 'Total Value', accessor: 'totalAmount', render: (row) => `₹${row.totalAmount.toLocaleString()}` },
            { header: 'Collected Amount', accessor: 'paidAmount', render: (row) => `₹${row.paidAmount.toLocaleString()}` },
            { header: 'Total Outstanding', accessor: 'totalAmount', render: (row) => `₹${(row.totalAmount - row.paidAmount).toLocaleString()}` },
            { header: 'Payment Target Date', accessor: 'dueDate' }
          ]}
          data={(state.payments || []).filter(p => p.status !== 'Paid')}
        />
      </div>

      {/* Invoice Verification Queue & Payment Registry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        <div className="app-card" style={{ margin: 0 }}>
          <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Pending Voucher Audits Queue</h3>
          <DataTable
            columns={[
              { header: 'Invoice No', accessor: 'invoiceNo', render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.invoiceNo}</span> },
              { header: 'Customer', accessor: 'customerName' },
              { header: 'Total Amount', accessor: 'totalAmount', render: (row) => `₹${row.totalAmount.toLocaleString()}` },
              { 
                header: 'Audit Clearance', 
                accessor: 'verified', 
                render: (row) => (
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    color: row.verified === 'Approved' ? '#10b981' : '#fbbf24',
                    background: row.verified === 'Approved' ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {row.verified}
                  </span>
                ) 
              }
            ]}
            data={(state.payments || []).filter(p => p.verified !== 'Approved')}
          />
        </div>

        <div className="app-card" style={{ margin: 0 }}>
          <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>General Transaction Journal</h3>
          <DataTable
            columns={[
              { header: 'Invoice#', accessor: 'invoiceNo' },
              { header: 'Paid Amount', accessor: 'paidAmount', render: (row) => `₹${row.paidAmount.toLocaleString()}` },
              { header: 'Payment Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
            ]}
            data={state.payments || []}
          />
        </div>

      </div>

      {/* Finance Personnel */}
      <EmployeeTable
        employees={financeEmployees}
        columns={employeeColumns}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />
    </div>
  );
}
