import { useState } from 'react';
import { Search, Wrench, Layers, Activity, Clock, CheckCircle, Check } from 'lucide-react';
import DataTable from '../shared/components/DataTable';
import StatusBadge from '../shared/components/StatusBadge';

export default function SalesProductionStatusView({ orders = [], searchQuery = '' }) {
  const [filter, setFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const search = searchQuery || localSearch;

  // Filter orders by search query and active pipeline stage
  const filteredOrders = orders.filter(o => {
    const custName = o.customerName || o.customer?.name || '';
    const matchesSearch = custName.toLowerCase().includes(search.toLowerCase()) || 
                          o.products.toLowerCase().includes(search.toLowerCase()) ||
                          o.orderNo.toLowerCase().includes(search.toLowerCase());
    
    const prodStatus = String(o.productionStatus || '').toLowerCase();
    const stStatus = String(o.storeStatus || '').toLowerCase();
    const qcStatus = String(o.plantHeadStatus || '').toLowerCase();

    let matchesFilter = false;
    if (filter === 'All') {
      matchesFilter = true;
    } else if (filter === 'Awaiting Materials') {
      matchesFilter = (stStatus !== 'issued' && prodStatus !== 'completed' && prodStatus !== 'qc_pending' && prodStatus !== 'qc_passed');
    } else if (filter === 'Manufacturing') {
      matchesFilter = ['running', 'rework', 'hold', 'in_production', 'work_order_created', 'planned'].includes(prodStatus);
    } else if (filter === 'QC Inspection') {
      matchesFilter = (['completed', 'qc_pending'].includes(prodStatus) && ['pending', 'qc rejected', 'qc_rejected'].includes(qcStatus));
    } else if (filter === 'QC Approved') {
      matchesFilter = ['approved', 'qc approved', 'qc_passed', 'qc passed'].includes(qcStatus);
    }

    return matchesSearch && matchesFilter;
  });

  // KPI Calculations
  const total = orders.length;
  const awaitingMaterials = orders.filter(o => {
    const stStatus = String(o.storeStatus || '').toLowerCase();
    const prodStatus = String(o.productionStatus || '').toLowerCase();
    return stStatus !== 'issued' && prodStatus !== 'completed' && prodStatus !== 'qc_pending' && prodStatus !== 'qc_passed';
  }).length;

  const runningCount = orders.filter(o => {
    const prodStatus = String(o.productionStatus || '').toLowerCase();
    return ['running', 'rework', 'in_production', 'work_order_created', 'planned'].includes(prodStatus);
  }).length;

  const holdCount = orders.filter(o => String(o.productionStatus || '').toLowerCase() === 'hold').length;

  const completedCount = orders.filter(o => {
    const qcStatus = String(o.plantHeadStatus || '').toLowerCase();
    return ['approved', 'qc approved', 'qc_passed', 'qc passed'].includes(qcStatus);
  }).length;

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return '#22c55e'; // Green
      case 'active': return '#3b82f6'; // Blue
      case 'hold': return '#f59e0b'; // Amber
      case 'rejected': return '#ef4444'; // Red
      default: return '#D6E2F0'; // Grey
    }
  };

  const renderPipeline = (o) => {
    const prodStatus = String(o.productionStatus || '').toLowerCase();
    const qcStatus = String(o.plantHeadStatus || '').toLowerCase();
    const dispStatus = String(o.dispatchStatus || '').toLowerCase();

    // Step 1: Order Confirm
    const s1 = 'completed';

    // Step 2: Plant Head Production
    let s2 = 'pending';
    if (['completed', 'qc_pending', 'qc_passed', 'qc passed'].includes(prodStatus)) {
      s2 = 'completed';
    } else if (['running', 'rework', 'in_production', 'work_order_created', 'planned'].includes(prodStatus)) {
      s2 = 'active';
    } else if (prodStatus === 'hold') {
      s2 = 'hold';
    } else {
      s2 = 'active';
    }

    // Step 3: QC
    let s3 = 'pending';
    if (['approved', 'qc approved', 'qc_passed', 'qc passed'].includes(qcStatus)) {
      s3 = 'completed';
    } else if (['rejected', 'qc rejected', 'qc_rejected'].includes(qcStatus)) {
      s3 = 'rejected';
    } else if (s2 === 'completed') {
      s3 = 'active';
    }

    // Step 4: Dispatch Delivered
    let s4 = 'pending';
    if (dispStatus === 'delivered' || dispStatus === 'closed') {
      s4 = 'completed';
    } else if (['dispatched', 'dispatch_created', 'in transit', 'in_transit'].includes(dispStatus)) {
      s4 = 'active';
    } else if (s3 === 'completed') {
      s4 = 'active';
    }

    // Resolve current active stage description
    let activeText = 'Order Confirmed';
    if (s4 === 'completed') {
      activeText = 'Delivered successfully';
    } else if (['dispatched', 'dispatch_created', 'in transit', 'in_transit'].includes(dispStatus)) {
      activeText = 'Cargo Dispatched';
    } else if (s3 === 'completed') {
      activeText = 'QC Approved - Awaiting Dispatch';
    } else if (s3 === 'rejected') {
      activeText = 'QC Rejected - Floor Rework';
    } else if (s3 === 'active') {
      activeText = 'QC Inspection queue';
    } else if (prodStatus === 'hold') {
      activeText = 'Assembly floor on Hold';
    } else if (['running', 'in_production', 'work_order_created', 'planned'].includes(prodStatus)) {
      activeText = 'Manufacturing Floor execution';
    }

    const renderStep = (status, titleText) => {
      const color = getStepColor(status);
      const isCompleted = status === 'completed';
      const isActive = status === 'active';
      return (
        <div 
          style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '50%', 
            background: color, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#ffffff', 
            zIndex: 2, 
            position: 'relative', 
            boxShadow: isActive ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none',
            cursor: 'help'
          }} 
          title={titleText}
        >
          {isCompleted ? <Check size={12} strokeWidth={3} /> : null}
        </div>
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', padding: '0 8px' }}>
          {/* Step 1: Order Confirm */}
          {renderStep(s1, 'Order Confirm (automatically marked completed as the order exists)')}
          
          <div style={{ flex: 1, height: '3px', background: s2 !== 'pending' ? getStepColor(s2 === 'completed' ? 'completed' : 'active') : '#D6E2F0', zIndex: 1, margin: '0 -2px' }} />
          
          {/* Step 2: Plant Head Production */}
          {renderStep(s2, `Plant Head Production (reflects floor assembly and manufacturing status): ${o.productionStatus || 'Pending'}`)}
          
          <div style={{ flex: 1, height: '3px', background: s3 !== 'pending' ? getStepColor(s3 === 'completed' ? 'completed' : 'active') : '#D6E2F0', zIndex: 1, margin: '0 -2px' }} />
          
          {/* Step 3: QC */}
          {renderStep(s3, `QC (reflects final quality check approvals): ${o.plantHeadStatus || 'Pending'}`)}
          
          <div style={{ flex: 1, height: '3px', background: s4 !== 'pending' ? getStepColor(s4 === 'completed' ? 'completed' : 'active') : '#D6E2F0', zIndex: 1, margin: '0 -2px' }} />
          
          {/* Step 4: Dispatch Delivered */}
          {renderStep(s4, `Dispatch Delivered (reflects cargo logistics dispatching and final receipt): ${o.dispatchStatus || 'Pending'}`)}
        </div>
        
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          {activeText}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* KPI Stats cards */}
      <div className="finance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="app-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="card-sub-label">Total Orders</p>
              <h3 className="card-value-lg">{total}</h3>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '8px', borderRadius: '8px' }}>
              <Activity size={20} />
            </div>
          </div>
        </div>

        <div className="app-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="card-sub-label">Awaiting Materials</p>
              <h3 className="card-value-lg" style={{ color: awaitingMaterials > 0 ? 'var(--color-accent-purple)' : 'inherit' }}>{awaitingMaterials}</h3>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '8px', borderRadius: '8px' }}>
              <Layers size={20} />
            </div>
          </div>
        </div>

        <div className="app-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="card-sub-label">Active Floor Execution</p>
              <h3 className="card-value-lg" style={{ color: '#2563eb' }}>{runningCount}</h3>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '8px' }}>
              <Wrench size={20} />
            </div>
          </div>
        </div>

        <div className="app-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="card-sub-label">Manufacturing On Hold</p>
              <h3 className="card-value-lg" style={{ color: holdCount > 0 ? '#ea580c' : 'inherit' }}>{holdCount}</h3>
            </div>
            <div style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', padding: '8px', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="app-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="card-sub-label">QC Approved / Ready</p>
              <h3 className="card-value-lg" style={{ color: '#16a34a' }}>{completedCount}</h3>
            </div>
            <div style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', padding: '8px', borderRadius: '8px' }}>
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="app-card" style={{ flex: 1 }}>
        <div className="module-header-row">
          <h2 className="module-title">Order Production Pipelines</h2>
          
          <div className="module-actions">
            {/* Filter pills */}
            <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
              {['All', 'Awaiting Materials', 'Manufacturing', 'QC Inspection', 'QC Approved'].map(st => (
                <button 
                  key={st}
                  className={`filter-pill ${filter === st ? 'active' : ''}`}
                  onClick={() => setFilter(st)}
                  style={{ color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search */}
            {!searchQuery && (
              <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
                <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search pipeline..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            )}
          </div>
        </div>

        <DataTable
          columns={[
            { header: 'Order ID', accessor: 'orderNo', render: (row) => <strong style={{ color: 'var(--color-accent-teal)' }}>{row.orderNo}</strong> },
            { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName || row.customer?.name },
            { header: 'Products / Items', accessor: 'products' },
            { header: 'Store Release', accessor: 'storeStatus', render: (row) => <StatusBadge status={row.storeStatus} /> },
            { header: 'Quality Check', accessor: 'plantHeadStatus', render: (row) => <StatusBadge status={row.plantHeadStatus} /> },
            { header: 'Pipeline Progress', accessor: 'productionStatus', render: (row) => renderPipeline(row) }
          ]}
          data={filteredOrders}
          searchQuery={search}
          searchField="customerName"
          emptyMessage="No active order pipeline logs match the selected filter."
        />
      </div>
    </div>
  );
}
