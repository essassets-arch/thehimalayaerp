import React from 'react';
import DepartmentHeader from '../components/DepartmentHeader';
import DepartmentKPI from '../components/DepartmentKPI';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetail from '../components/EmployeeDetail';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function StoreDept({ state, deptEmployee, setDeptEmployee, onBack, navigate, showToast }) {
  const storeEmployees = (state.employees || []).filter(
    (emp) => emp.department === 'Store'
  );

  // Price mapping for raw inventory
  const itemPrices = {
    'OPC Cement Clinker': 400,
    'Gypsum Raw': 300,
    'River Sand': 1500,
    'Coarse Aggregate 20mm': 1200,
    'Fine Aggregate 10mm': 1000,
    'Superplasticizer Admixture': 120,
    'Waterproofing Compound': 250
  };

  // Inventory value calculations
  const totalItems = state.rawInventory?.length || 0;
  const inventoryValue = (state.rawInventory || []).reduce((sum, item) => {
    const price = itemPrices[item.material] || 100;
    return sum + (item.stock * price);
  }, 0);

  const lowStockItems = (state.rawInventory || []).filter(
    item => item.stock <= item.reorderLevel
  );

  const pendingPOs = state.purchaseOrders?.filter(po => po.status === 'REQUESTED' || po.status === 'APPROVED').length || 0;
  const materialRequestsCount = state.materialRequests?.length || 0;

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
    { header: 'Status', accessor: 'active', render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DepartmentHeader
        title="Store & Inventory Command Center"
        subtitle="Stock valuations, reorder trigger levels, indents issuing, and vendor indents tracking"
        onBack={onBack}
      />

      {/* KPI Cards */}
      <DepartmentKPI
        data={[
          { title: 'Store Personnel', value: storeEmployees.length },
          { title: 'Inventory Stock Items', value: totalItems },
          { title: 'Total Valuation', value: `₹${inventoryValue.toLocaleString()}` },
          { title: 'Low Stock Alert Items', value: lowStockItems.length, borderClass: lowStockItems.length > 0 ? 'border-left-red' : 'border-left-emerald' },
          { title: 'Pending PO Indents', value: pendingPOs },
          { title: 'Material Requests Logs', value: materialRequestsCount }
        ]}
      />

      {/* Alert Banner for Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ margin: 0, color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚠️ Low Stock Alert triggers activated for {lowStockItems.length} raw material items
          </h4>
          <span style={{ fontSize: '11.5px', color: '#8893A7' }}>
            The following items are at or below their mapped safety reorder levels. Please create purchase requisitions immediately.
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
            {lowStockItems.map((item, idx) => (
              <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '10.5px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                {item.material}: {item.stock} {item.unit} (Reorder: {item.reorderLevel})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw Materials Inventory Table */}
      <div className="app-card" style={{ margin: 0 }}>
        <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Raw Material Warehousing Roster</h3>
        <DataTable
          columns={[
            { header: 'Material Name', accessor: 'material', render: (row) => <strong>{row.material}</strong> },
            { header: 'Current Stock', accessor: 'stock', render: (row) => `${row.stock} ${row.unit}` },
            { header: 'Reorder Level', accessor: 'reorderLevel', render: (row) => `${row.reorderLevel} ${row.unit}` },
            { header: 'Estimated Price', accessor: 'material', render: (row) => `₹${(itemPrices[row.material] || 0)} / ${row.unit}` },
            { header: 'Computed Value', accessor: 'stock', render: (row) => `₹${(row.stock * (itemPrices[row.material] || 100)).toLocaleString()}` },
            { 
              header: 'Status', 
              accessor: 'stock', 
              render: (row) => {
                const isCritical = row.stock <= (row.reorderLevel * 0.5);
                const isLow = row.stock <= row.reorderLevel;
                return (
                  <span style={{ 
                    fontSize: '10.5px', 
                    fontWeight: 'bold', 
                    color: isCritical ? '#ef4444' : isLow ? '#fbbf24' : '#10b981',
                    background: isCritical ? 'rgba(239, 68, 68, 0.12)' : isLow ? 'rgba(251, 191, 36, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {isCritical ? 'Critical' : isLow ? 'Low Stock' : 'Sufficient'}
                  </span>
                );
              } 
            }
          ]}
          data={state.rawInventory || []}
        />
      </div>

      {/* Purchase Requests & Material Issued */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        <div className="app-card" style={{ margin: 0 }}>
          <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Store Purchase Requisitions</h3>
          <DataTable
            columns={[
              { header: 'PO ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
              { header: 'Requisition Notes', accessor: 'notes' },
              { header: 'Items count', accessor: 'items', render: (row) => `${row.items?.length || 0} line items` },
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
            ]}
            data={state.purchaseOrders || []}
          />
        </div>

        <div className="app-card" style={{ margin: 0 }}>
          <h3 className="card-heading" style={{ fontSize: '14px', marginBottom: '14px' }}>Issued Indents History</h3>
          <DataTable
            columns={[
              { header: 'Indent ID', accessor: 'id' },
              { header: 'Work Order Ref', accessor: 'workOrderId', render: (row) => <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{row.workOrderId}</span> },
              { header: 'Materials Issued', accessor: 'materials', render: (row) => row.materials.map(m => `${m.materialName} (x${m.quantityApproved})`).join(', ') },
              { header: 'Status', accessor: 'status', render: (row) => <span style={{ color: '#10b981', fontWeight: 'bold' }}>{row.status}</span> }
            ]}
            data={(state.materialRequests || []).filter(mr => mr.status === 'Issued')}
          />
        </div>

      </div>

      {/* Store Personnel */}
      <EmployeeTable
        employees={storeEmployees}
        columns={employeeColumns}
        onViewEmployee={(emp) => setDeptEmployee(emp)}
      />
    </div>
  );
}
