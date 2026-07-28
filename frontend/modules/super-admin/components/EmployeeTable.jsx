import React from 'react';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function EmployeeTable({ 
  employees = [], 
  onViewEmployee, 
  columns = null 
}) {
  const defaultColumns = [
    { 
      header: 'Employee ID', 
      accessor: 'id', 
      render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.id}</span> 
    },
    { 
      header: 'Name', 
      accessor: 'name', 
      render: (row) => <strong>{row.name}</strong> 
    },
    { 
      header: 'Role', 
      accessor: 'role' 
    },
    { 
      header: 'Attendance', 
      accessor: 'attendance', 
      render: (row) => <span>{row.attendance ? `${row.attendance}%` : 'N/A'}</span> 
    },
    { 
      header: 'Status', 
      accessor: 'active', 
      render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> 
    }
  ];

  const displayColumns = columns || defaultColumns;

  return (
    <div className="app-card" style={{ margin: 0 }}>
      <div className="card-top-bar">
        <h3 className="card-heading" style={{ fontSize: '14px' }}>Department Personnel</h3>
      </div>
      <DataTable 
        columns={displayColumns}
        data={employees}
        actions={(row) => (
          <button 
            className="action-btn"
            style={{ 
              background: 'rgba(0, 0, 0, 0.04)', 
              border: '1px solid var(--color-border)', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '11px', 
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
            onClick={() => onViewEmployee(row)}
          >
            View Employee
          </button>
        )}
      />
    </div>
  );
}
