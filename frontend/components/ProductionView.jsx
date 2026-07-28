import { useState } from 'react';
import { Search, Wrench, Play, CheckCircle2, ChevronRight, ClipboardList, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProductionView({ orders, onUpdateOrderStatus }) {
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  // Raw materials allocation database mocks (keyed by order ID)
  const [materialsChecklists, setMaterialsChecklists] = useState({
    801: [
      { name: 'Forged Steel Blanks (Heavy)', qty: '50 units', allocated: true },
      { name: 'Alloy Hardener Case', qty: '12 kg', allocated: true },
      { name: 'Precision Grinding Lubricant', qty: '20 Liters', allocated: true },
      { name: 'Gear Teeth Finishing Milling Bits', qty: '4 units', allocated: false }
    ]
  });

  const getMaterialsList = (orderId) => {
    if (materialsChecklists[orderId]) {
      return materialsChecklists[orderId];
    }
    // Default fallback checklist
    return [
      { name: 'Standard Raw Cast Billets', qty: 'As specified', allocated: true },
      { name: 'Machining Tooling Bits', qty: '2 units', allocated: false },
      { name: 'Packaging Pallets', qty: 'Bulk wrapper', allocated: false }
    ];
  };

  const handleToggleMaterial = (orderId, materialIndex) => {
    const currentList = getMaterialsList(orderId);
    const updated = [...currentList];
    updated[materialIndex] = {
      ...updated[materialIndex],
      allocated: !updated[materialIndex].allocated
    };
    setMaterialsChecklists({
      ...materialsChecklists,
      [orderId]: updated
    });
  };

  // Filter orders in production: status is Processing, In Progress, or Quality Check
  const productionOrders = orders.filter(o => 
    (o.status === 'Processing' || o.status === 'In Progress' || o.status === 'Quality Check' || o.status === 'QC Approved') &&
    (o.customerName.toLowerCase().includes(search.toLowerCase()) || o.products.toLowerCase().includes(search.toLowerCase()))
  );

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'In Progress': return 50;
      case 'Quality Check': return 80;
      case 'QC Approved': return 100;
      case 'Processing':
      default:
        return 15;
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'In Progress': return 'var(--color-accent-teal)';
      case 'Quality Check': return 'var(--color-orange-dot)';
      case 'QC Approved': return 'var(--color-accent-green)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const handleUpdateStatusClick = (orderId, newStatus, textAction) => {
    Swal.fire({
      title: `${textAction} Order Production?`,
      text: `Are you sure you want to transition order #ORD-${orderId} to status "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${textAction}`,
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        onUpdateOrderStatus(orderId, newStatus);
      }
    });
  };

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row" style={{ marginBottom: '24px' }}>
        <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={20} /> Production Operations Control
        </h2>
        <div className="module-actions">
          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search production line..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      </div>

      <div className="production-layout">
        {/* Production Queue list */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            Live Job Queue ({productionOrders.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {productionOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '14px', color: 'var(--color-text-muted)' }}>
                No active orders in the production pipeline.
              </div>
            ) : (
              productionOrders.map((job) => {
                const percent = getProgressPercentage(job.status);
                const color = getProgressColor(job.status);
                const materials = getMaterialsList(job.id);
                const allAllocated = materials.every(m => m.allocated);
                
                return (
                  <div 
                    key={job.id} 
                    className="event-card-item" 
                    onClick={() => setSelectedJob(job)}
                    style={{ 
                      flexDirection: 'column', 
                      alignItems: 'stretch', 
                      padding: '20px', 
                      border: selectedJob?.id === job.id ? '2px solid var(--color-text-primary)' : '1px solid #f1f3f5' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--color-text-muted)' }}>JOB RUN #ORD-{job.id}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '2px' }}>{job.products}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Customer: <strong>{job.customerName}</strong></p>
                      </div>
                      
                      <span className={`badge`} style={{ 
                        background: job.status === 'QC Approved' ? '#dcfce7' : job.status === 'Quality Check' ? '#fffbeb' : '#eff6ff',
                        color: job.status === 'QC Approved' ? '#166534' : job.status === 'Quality Check' ? '#b45309' : '#1e40af'
                      }}>
                        {job.status === 'Processing' ? 'Not Started' : job.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Milling & Fabrication Stage</span>
                        <span>{percent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f3f5', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8f9fa', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: allAllocated ? '#16a34a' : '#b45309' }}>
                        <ClipboardList size={13} />
                        <span>{allAllocated ? 'Materials allocated' : 'Materials allocation pending'}</span>
                      </div>
                      <button 
                        type="button" 
                        className="btn-small btn-primary-small"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
                      >
                        Inspect Job Details <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected job controls panel */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            Job Operations Desk
          </h3>
          {selectedJob ? (
            <div style={{ background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-muted)' }}>ACTIVE SELECTION</span>
                <h4 style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px' }}>#ORD-{selectedJob.id}</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>{selectedJob.products}</p>
              </div>

              {/* Status Actions */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
                <span className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Job Workflow Controls</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedJob.status === 'Processing' && (
                    <button 
                      type="button" 
                      className="form-submit-btn" 
                      onClick={() => handleUpdateStatusClick(selectedJob.id, 'In Progress', 'Start Machining')}
                      style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Play size={14} fill="currentColor" /> Start Machining
                    </button>
                  )}
                  {selectedJob.status === 'In Progress' && (
                    <button 
                      type="button" 
                      className="form-submit-btn" 
                      onClick={() => handleUpdateStatusClick(selectedJob.id, 'Quality Check', 'Send to QC')}
                      style={{ margin: 0, background: 'var(--color-orange-dot)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <ClipboardList size={14} /> Send to Quality Check
                    </button>
                  )}
                  {selectedJob.status === 'Quality Check' && (
                    <button 
                      type="button" 
                      className="form-submit-btn" 
                      onClick={() => handleUpdateStatusClick(selectedJob.id, 'QC Approved', 'QC Pass')}
                      style={{ margin: 0, background: 'var(--color-accent-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={14} /> Pass Quality QC inspection
                    </button>
                  )}
                  {selectedJob.status === 'QC Approved' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '10px', color: '#166534', fontSize: '12.5px', fontWeight: '700' }}>
                      <CheckCircle2 size={16} /> Ready for Dispatch Routing
                    </div>
                  )}
                </div>
              </div>

              {/* Materials Allocation Checklist */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
                <span className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Raw Material Allocations</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getMaterialsList(selectedJob.id).map((mat, idx) => (
                    <label 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '12px', 
                        cursor: 'pointer', 
                        background: '#fff', 
                        padding: '8px 10px', 
                        borderRadius: '8px', 
                        border: '1px solid #DCE5F0' 
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={mat.allocated} 
                        onChange={() => handleToggleMaterial(selectedJob.id, idx)} 
                        style={{ cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{mat.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Req: {mat.qty}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '18px', color: 'var(--color-text-muted)', fontSize: '12.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={20} />
              <span>Select a job card from the line queue to open control desk.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
