import React, { useState, useEffect } from 'react';
import { selectMaterialRejections } from '../../../store/procurementSelectors';
import { createReplacementGRN } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ReceiveReplacement() {
  const [rejections, setRejections] = useState([]);
  const [selectedRejection, setSelectedRejection] = useState(null);
  const [deliveryData, setDeliveryData] = useState({
    deliveredQty: 0,
    acceptedQty: 0,
    rejectedQty: 0,
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only show rejections waiting for replacement or partially resolved
    const active = selectMaterialRejections().filter(r => 
      ['REPLACEMENT_EXPECTED', 'PARTIALLY_RESOLVED'].includes(r.status)
    );
    setRejections(active);
  }, []);

  const handleSelectRejection = (rejId) => {
    const rej = selectMaterialRejections().find(r => r.id === rejId);
    setSelectedRejection(rej);
    setDeliveryData({
      deliveredQty: 0,
      acceptedQty: 0,
      rejectedQty: 0,
      remarks: ''
    });
  };

  const handleQtyChange = (field, value) => {
    const numValue = Number(value) || 0;
    setDeliveryData(prev => {
      const updated = { ...prev, [field]: numValue };
      if (field === 'deliveredQty') {
        updated.acceptedQty = numValue;
        updated.rejectedQty = 0;
      } else if (field === 'acceptedQty') {
        updated.rejectedQty = Math.max(0, updated.deliveredQty - numValue);
      } else if (field === 'rejectedQty') {
        updated.acceptedQty = Math.max(0, updated.deliveredQty - numValue);
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (deliveryData.deliveredQty <= 0) {
      Swal.fire('Error', 'Delivered quantity must be greater than 0', 'error');
      return;
    }
    const remainingScheduled = selectedRejection.replacementApprovedQty - selectedRejection.cumulativeReplacementDeliveredQty;
    if (deliveryData.deliveredQty > remainingScheduled) {
      Swal.fire('Error', `Cannot receive more than scheduled quantity (${remainingScheduled})`, 'error');
      return;
    }
    if (deliveryData.acceptedQty + deliveryData.rejectedQty !== deliveryData.deliveredQty) {
      Swal.fire('Error', 'Accepted + Rejected must equal Delivered', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        items: [{
          materialId: selectedRejection.materialId,
          materialName: selectedRejection.materialName,
          deliveredQty: deliveryData.deliveredQty,
          acceptedQty: deliveryData.acceptedQty,
          rejectedQty: deliveryData.rejectedQty
        }],
        remarks: deliveryData.remarks
      };

      createReplacementGRN(selectedRejection.id, payload, 'Store Admin');
      
      await Swal.fire('Success', 'Replacement GRN created and submitted for finance audit.', 'success');
      
      setSelectedRejection(null);
      setRejections(selectMaterialRejections().filter(r => 
        ['REPLACEMENT_EXPECTED', 'PARTIALLY_RESOLVED'].includes(r.status)
      ));
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to create Replacement GRN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedRejection) {
    const remainingScheduled = selectedRejection.replacementApprovedQty - selectedRejection.cumulativeReplacementDeliveredQty;

    return (
      <div className="receive-replacement-container">
        <style>{`
          .receive-replacement-container { padding: 20px; }
          .receive-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background: #F5FAFE; padding: 16px; borderRadius: 8px; }
          .receive-recon-grid { display: flex; gap: 16px; margin-bottom: 16px; }
          .receive-qty-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .receive-actions { display: flex; justify-content: flex-end; gap: 12px; }
          @media (max-width: 768px) {
            .receive-replacement-container { padding: 12px 6px !important; }
            .receive-meta-grid { grid-template-columns: 1fr !important; gap: 10px !important; padding: 12px !important; }
            .receive-recon-grid { flex-direction: column !important; gap: 10px !important; }
            .receive-qty-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
            .receive-actions { flex-direction: column-reverse !important; }
            .receive-actions button { width: 100% !important; justify-content: center !important; }
          }
        `}</style>
        <button 
          onClick={() => setSelectedRejection(null)}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '16px', fontWeight: 600, fontSize: '13px' }}
        >
          ← Back to List
        </button>
        
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '19px', color: '#24345C', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={22} color="#3b82f6" />
              Receive Replacement
            </h2>
            <ProcurementStatusBadge status={selectedRejection.status} />
          </div>

          <div className="receive-meta-grid">
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Rejection #</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.rejectionNumber}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Original PO #</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.poId}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Material</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.materialName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Expected Delivery</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.expectedDeliveryDate || 'TBD'}</strong>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', margin: '0 0 14px 0', color: '#24345C', fontWeight: 800 }}>Quantity Reconciliation</h3>
            <div className="receive-recon-grid">
              <div style={{ flex: 1, padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '12px', color: '#1d4ed8', display: 'block' }}>Approved Repl. Qty</span>
                <strong style={{ fontSize: '19px', color: '#1e3a8a' }}>{selectedRejection.replacementApprovedQty}</strong>
              </div>
              <div style={{ flex: 1, padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '12px', color: '#15803d', display: 'block' }}>Already Delivered</span>
                <strong style={{ fontSize: '19px', color: '#166534' }}>{selectedRejection.cumulativeReplacementDeliveredQty}</strong>
              </div>
              <div style={{ flex: 1, padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '12px', color: '#b91c1c', display: 'block' }}>Remaining Scheduled</span>
                <strong style={{ fontSize: '19px', color: '#991b1b' }}>{remainingScheduled}</strong>
              </div>
            </div>
          </div>

          <div className="receive-qty-grid">
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Current Delivered Qty</label>
              <input 
                type="number" 
                value={deliveryData.deliveredQty} 
                onChange={(e) => handleQtyChange('deliveredQty', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#16a34a', marginBottom: '6px' }}>Good (Accepted)</label>
              <input 
                type="number" 
                value={deliveryData.acceptedQty} 
                onChange={(e) => handleQtyChange('acceptedQty', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #bbf7d0', borderRadius: '8px', background: '#f0fdf4', fontSize: '14px', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>Damaged (Rejected)</label>
              <input 
                type="number" 
                value={deliveryData.rejectedQty} 
                onChange={(e) => handleQtyChange('rejectedQty', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #fecaca', borderRadius: '8px', background: '#fef2f2', fontSize: '14px', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Store Verification Remarks</label>
            <textarea 
              value={deliveryData.remarks}
              onChange={(e) => setDeliveryData(prev => ({...prev, remarks: e.target.value}))}
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
              placeholder="Any comments regarding the physical replacement?"
            />
          </div>

          <div className="receive-actions">
            <button 
              onClick={() => setSelectedRejection(null)}
              style={{ padding: '10px 18px', background: '#fff', border: '1px solid #D6E2F0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
            >
              {isSubmitting ? 'Creating GRN...' : 'Create Replacement GRN'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="receive-replacement-container">
      <style>{`
        .receive-replacement-container { padding: 20px; }
        @media (max-width: 768px) {
          .receive-replacement-container { padding: 12px 6px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#24345C' }}>Replacement Deliveries</h2>
      </div>

      <div className="store-table-scroll-wrapper" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', textAlign: 'left' }}>
              <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Rejection #</th>
              <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Material</th>
              <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>PO Reference</th>
              <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Qty to Replace</th>
              <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rejections.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#5E6B82', fontSize: '13px' }}>
                  No pending replacement deliveries.
                </td>
              </tr>
            ) : (
              rejections.map(rej => (
                <tr key={rej.id} style={{ borderBottom: '1px solid #DCE5F0' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: 800, color: '#2563eb' }}>{rej.rejectionNumber}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{rej.materialName}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#5E6B82' }}>{rej.poId}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>
                    <strong style={{ color: '#0f172a' }}>{rej.replacementApprovedQty - rej.cumulativeReplacementDeliveredQty}</strong> <span style={{ fontSize: '12px', color: '#64748b' }}>remaining</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}><ProcurementStatusBadge status={rej.status} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleSelectRejection(rej.id)}
                      style={{ padding: '7px 14px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Receive Material
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
