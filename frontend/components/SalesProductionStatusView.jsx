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
    const custName = o.customerName || o.customer?.companyName || '';
    const matchesSearch = custName.toLowerCase().includes(search.toLowerCase()) || 
                          String(o.orderId || o.orderNo || '').toLowerCase().includes(search.toLowerCase());
    
    const prodStatus = String(o.productionStatus || '').toUpperCase();
    const orderStatus = String(o.status || '').toUpperCase();

    let matchesFilter = false;
    if (filter === 'All') {
      matchesFilter = true;
    } else if (filter === 'Awaiting Materials') {
      matchesFilter = ['SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'PENDING_PLANNING'].includes(orderStatus) || prodStatus === 'PENDING_PLANNING';
    } else if (filter === 'Manufacturing') {
      matchesFilter = ['READY_FOR_PRODUCTION', 'IN_PRODUCTION'].includes(orderStatus) || ['PLANNED', 'RELEASED', 'IN_PRODUCTION', 'PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS'].includes(prodStatus);
    } else if (filter === 'QC Inspection') {
      // In this backend, QC is part of production completion, but we can treat READY_FOR_DISPATCH as post-QC
      matchesFilter = orderStatus === 'READY_FOR_DISPATCH' && prodStatus !== 'COMPLETED';
    } else if (filter === 'QC Approved') {
      matchesFilter = orderStatus === 'READY_FOR_DISPATCH' || prodStatus === 'COMPLETED';
    }

    return matchesSearch && matchesFilter;
  });

  // KPI Calculations
  const total = orders.length;
  const awaitingMaterials = orders.filter(o => {
    const status = String(o.status || '').toUpperCase();
    const pStatus = String(o.productionStatus || '').toUpperCase();
    return ['SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'PENDING_PLANNING'].includes(status) || pStatus === 'PENDING_PLANNING';
  }).length;

  const runningCount = orders.filter(o => {
    const status = String(o.status || '').toUpperCase();
    const pStatus = String(o.productionStatus || '').toUpperCase();
    return ['READY_FOR_PRODUCTION', 'IN_PRODUCTION'].includes(status) || ['PLANNED', 'RELEASED', 'IN_PRODUCTION', 'PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS'].includes(pStatus);
  }).length;

  const holdCount = orders.filter(o => {
    const status = String(o.status || '').toUpperCase();
    const pStatus = String(o.productionStatus || '').toUpperCase();
    return ['HOLD', 'ON_HOLD', 'ON-HOLD', 'SUSPENDED'].includes(status) || ['HOLD', 'ON_HOLD', 'ON-HOLD', 'SUSPENDED'].includes(pStatus);
  }).length;

  const completedCount = orders.filter(o => {
    const status = String(o.status || '').toUpperCase();
    const pStatus = String(o.productionStatus || '').toUpperCase();
    return status === 'READY_FOR_DISPATCH' || pStatus === 'COMPLETED' || status === 'COMPLETED';
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
    const prodStatus = String(o.productionStatus || '').toUpperCase();
    const orderStatus = String(o.status || '').toUpperCase();
    const dispStatus = String(o.dispatchStatus || '').toUpperCase();

    // Step 1: Order Confirm
    let s1 = 'pending';
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(orderStatus)) {
      s1 = 'completed';
    } else {
      s1 = 'active';
    }

    // Step 2: Plant Head & Production
    let s2 = 'pending';
    if (['READY_FOR_DISPATCH', 'COMPLETED'].includes(orderStatus) || prodStatus === 'COMPLETED') {
      s2 = 'completed';
    } else if (['SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION'].includes(orderStatus) || ['PENDING_PLANNING', 'PLANNED', 'RELEASED', 'IN_PRODUCTION', 'PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS'].includes(prodStatus)) {
      s2 = 'active';
    } else if (s1 === 'completed') {
      s2 = 'pending'; // Waiting for plant head
    }

    // Step 3: Ready for Dispatch / QC Approved
    let s3 = 'pending';
    if (['COMPLETED'].includes(orderStatus) || ['SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED'].includes(dispStatus)) {
      s3 = 'completed';
    } else if (orderStatus === 'READY_FOR_DISPATCH' || prodStatus === 'COMPLETED') {
      s3 = 'active';
    }

    // Step 4: Dispatch Delivered
    let s4 = 'pending';
    if (['DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED'].includes(dispStatus)) {
      s4 = 'completed';
    } else if (['DISPATCH_DRAFT', 'DISPATCH_CREATED', 'SHIPPED', 'IN_TRANSIT'].includes(dispStatus)) {
      s4 = 'active';
    } else if (s3 === 'completed') {
      s4 = 'active';
    }

    // Resolve current active stage description
    let activeText = 'Order Confirmed';
    if (s4 === 'completed') {
      activeText = 'Delivered Successfully';
    } else if (['SHIPPED', 'IN_TRANSIT'].includes(dispStatus)) {
      activeText = 'Cargo Dispatched / In Transit';
    } else if (dispStatus === 'DISPATCH_CREATED' || dispStatus === 'DISPATCH_DRAFT') {
      activeText = 'Dispatch Planned';
    } else if (s3 === 'active' || s3 === 'completed') {
      activeText = 'Production Completed - Awaiting Dispatch';
    } else if (['READY_FOR_PRODUCTION', 'IN_PRODUCTION'].includes(orderStatus) || ['PLANNED', 'RELEASED', 'IN_PRODUCTION', 'PRODUCTION_STARTED', 'PRODUCTION_IN_PROGRESS'].includes(prodStatus)) {
      activeText = 'Manufacturing Floor Execution';
    } else if (['SENT_TO_PLANT_HEAD', 'PLANT_APPROVED'].includes(orderStatus) || prodStatus === 'PENDING_PLANNING') {
      activeText = 'Plant Head Review / Planning';
    } else if (orderStatus === 'CONFIRMED') {
      activeText = 'Awaiting Plant Head Assignment';
    } else {
      activeText = 'Awaiting Approval';
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
            { header: 'Order ID', accessor: 'orderId', render: (row) => <strong style={{ color: 'var(--color-accent-teal)' }}>{row.orderId || row.orderNo}</strong> },
            { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName || row.customer?.companyName || 'Unknown' },
            { header: 'Items', accessor: 'items', render: (row) => row.items?.length ? `${row.items.length} items` : row.products || '-' },
            { header: 'Production Status', accessor: 'productionStatus', render: (row) => <StatusBadge status={row.productionStatus || 'PENDING'} /> },
            { header: 'Dispatch Status', accessor: 'dispatchStatus', render: (row) => <StatusBadge status={row.dispatchStatus || 'PENDING'} /> },
            { header: 'Pipeline Progress', accessor: 'pipeline', render: (row) => renderPipeline(row) }
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
