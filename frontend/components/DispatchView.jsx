import { useState } from 'react';
import { Search, Truck, ArrowLeft, Send, CheckCircle, Navigation, ShieldCheck, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DispatchView({ orders, onUpdateDispatchStatus }) {
  const [search, setSearch] = useState('');
  const [activeDispatchOrder, setActiveDispatchOrder] = useState(null); // Used for rendering full-screen dispatch logging form
  const [deliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  const handleCompleteDeliveryClick = (orderId) => {
    Swal.fire({
      title: 'Complete Delivery?',
      text: `Are you sure you want to mark order #ORD-${orderId} as successfully Delivered?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delivered',
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
        onUpdateDispatchStatus(orderId, 'Delivered');
      }
    });
  };
  
  // Dispatch details database mocks (keyed by order ID)
  const [dispatchDetails, setDispatchDetails] = useState({
    801: {
      transporter: 'Apex Cargo Solutions',
      vehicleNo: 'IL-12-G-8849',
      driverName: 'Robert Dow',
      driverPhone: '+1 555-9382',
      dispatchedDate: '2026-06-08',
      deliveryDate: '2026-06-12'
    }
  });

  const getDispatchLog = (orderId) => dispatchDetails[orderId] || null;

  // Filter orders in dispatch workflow:
  // - Pending: QC Approved and dispatchStatus is Pending
  // - In Transit: dispatchStatus is In Transit
  // - Delivered: dispatchStatus is Delivered
  const dispatchOrders = orders.filter(o => 
    (o.status === 'QC Approved' || o.dispatchStatus === 'In Transit' || o.dispatchStatus === 'Delivered') &&
    (o.customerName.toLowerCase().includes(search.toLowerCase()) || o.products.toLowerCase().includes(search.toLowerCase()))
  );

  const handleLogDispatch = (e) => {
    e.preventDefault();
    if (!activeDispatchOrder) return;

    const fd = new FormData(e.target);
    const log = {
      transporter: fd.get('transporter'),
      vehicleNo: fd.get('vehicleNo'),
      driverName: fd.get('driverName'),
      driverPhone: fd.get('driverPhone'),
      dispatchedDate: new Date().toISOString().split('T')[0],
      deliveryDate: fd.get('deliveryDate')
    };

    // Store dispatch log
    setDispatchDetails({
      ...dispatchDetails,
      [activeDispatchOrder.id]: log
    });

    // Update dispatch status to In Transit
    onUpdateDispatchStatus(activeDispatchOrder.id, 'In Transit');
    setActiveDispatchOrder(null);
  };

  // Render Full Screen Dispatch Creation Form
  if (activeDispatchOrder) {
    return (
      <div className="app-card" style={{ flex: 1 }}>
        <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" className="card-top-icon-btn" onClick={() => setActiveDispatchOrder(null)} style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}>
              <ArrowLeft size={16} />
            </button>
            <h2 className="module-title">Create Dispatch & Logistics Log</h2>
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>ORDER DETAILS</span>
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>{activeDispatchOrder.products}</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Customer Name: <strong>{activeDispatchOrder.customerName}</strong></p>
        </div>

        <form onSubmit={handleLogDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Transporter Service Agency *</label>
              <input type="text" name="transporter" className="form-input" placeholder="e.g. Apex Cargo Solutions" required defaultValue="Apex Cargo Solutions" />
            </div>
            <div className="form-group">
              <label className="form-label">Carrier Truck / Vehicle Number *</label>
              <input type="text" name="vehicleNo" className="form-input" placeholder="e.g. IL-12-G-8849" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Driver Name *</label>
              <input type="text" name="driverName" className="form-input" placeholder="e.g. Robert Dow" required />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Phone Number *</label>
              <input type="text" name="driverPhone" className="form-input" placeholder="e.g. +1 555-9382" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expected Delivery Clearance Date *</label>
            <input type="date" name="deliveryDate" className="form-input" required defaultValue={deliveryDate} />
          </div>

          <div className="form-actions">
            <button type="submit" className="form-submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Send size={15} /> Publish Dispatch manifest
            </button>
            <button type="button" className="btn-small btn-outline-small" onClick={() => setActiveDispatchOrder(null)}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row" style={{ marginBottom: '24px' }}>
        <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={20} /> Logistics & Dispatch Tracking
        </h2>
        <div className="module-actions">
          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search dispatch queue..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Grid of logistics cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
        {dispatchOrders.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '14px', color: 'var(--color-text-muted)' }}>
            No dispatch listings waiting or in transit.
          </div>
        ) : (
          dispatchOrders.map((o) => {
            const log = getDispatchLog(o.id);
            return (
              <div 
                key={o.id} 
                className="event-card-item" 
                style={{ 
                  flexDirection: 'column', 
                  alignItems: 'stretch', 
                  padding: '20px', 
                  cursor: 'default',
                  borderLeft: `5px solid ${o.dispatchStatus === 'Delivered' ? '#16a34a' : o.dispatchStatus === 'In Transit' ? '#0284c7' : '#8893A7'}` 
                }}
              >
                {/* Top header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-muted)' }}>ORDER #ORD-{o.id}</span>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '2px' }}>{o.products}</h4>
                  </div>
                  <span className={`badge`} style={{
                    background: o.dispatchStatus === 'Delivered' ? '#dcfce7' : o.dispatchStatus === 'In Transit' ? '#e0f2fe' : '#f3f4f6',
                    color: o.dispatchStatus === 'Delivered' ? '#166534' : o.dispatchStatus === 'In Transit' ? '#0369a1' : '#4b5563'
                  }}>
                    {o.dispatchStatus === 'Pending' ? 'Waiting Loading' : o.dispatchStatus}
                  </span>
                </div>

                {/* Cargo Details / Driver particulars */}
                {log ? (
                  <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '6px', color: 'var(--color-text-secondary)' }}>
                      <Truck size={13} style={{ marginTop: '1px' }} />
                      <span>Transporter: <strong>{log.transporter}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', color: 'var(--color-text-secondary)' }}>
                      <Navigation size={13} style={{ marginTop: '1px' }} />
                      <span>Truck Plate: <strong>{log.vehicleNo}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', color: 'var(--color-text-secondary)' }}>
                      <MapPin size={13} style={{ marginTop: '1px' }} />
                      <span>Driver: <strong>{log.driverName} ({log.driverPhone})</strong></span>
                    </div>
                    <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '6px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontWeight: '700' }}>
                      <span>Shipped: {log.dispatchedDate}</span>
                      <span style={{ color: o.dispatchStatus === 'Delivered' ? '#16a34a' : 'inherit' }}>
                        ETA: {log.deliveryDate}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', color: '#b45309', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} />
                    <span>Awaiting transporter selection & driver allocation details.</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  {o.dispatchStatus === 'Pending' && (
                    <button 
                      type="button" 
                      className="btn-small btn-primary-small"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => setActiveDispatchOrder(o)}
                    >
                      <Truck size={12} /> Assign Vehicle
                    </button>
                  )}
                  {o.dispatchStatus === 'In Transit' && (
                    <button 
                      type="button" 
                      className="btn-small btn-primary-small"
                      style={{ flex: 1, background: 'var(--color-accent-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: 'none' }}
                      onClick={() => handleCompleteDeliveryClick(o.id)}
                    >
                      <CheckCircle size={12} /> Complete Delivery
                    </button>
                  )}
                  {o.dispatchStatus === 'Delivered' && (
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 0', color: '#16a34a', fontSize: '12px', fontWeight: '700' }}>
                      <CheckCircle size={14} /> Consignment successfully received!
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
