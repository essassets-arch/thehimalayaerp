import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP } from '../../../../shared/context/ERPContext';
import { useAuth } from '../../../../shared/context/AuthContext';
import { ShieldCheck, X } from 'lucide-react';
import { useO2PWorkflow } from '../../../../shared/hooks/useO2PWorkflow';
import { useERPStore } from '../../../../store/erpStore';

export default function QCInspectionModal({ selectedOrder, onClose }) {
  const { submitQCInspection } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const o2p = useO2PWorkflow();
  const navigate = useRouter();

  const [submitting, setSubmitting] = useState(false);
  
  const total = Number(selectedOrder.totalQty || selectedOrder.quantityProduced || selectedOrder.producedQuantity || selectedOrder.producedQty || selectedOrder.production?.producedQty || selectedOrder.production?.plannedQty || selectedOrder.quantity || 0);

  const [inspectedQty, setInspectedQty] = useState(total);
  const [acceptedQty, setAcceptedQty] = useState(total);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [reworkQty, setReworkQty] = useState(0);
  
  const [strength, setStrength] = useState('48 MPa');
  const [dimensions, setDimensions] = useState('Within Limit (±0.15mm)');
  const [weight, setWeight] = useState('Standard');
  const [remarks, setRemarks] = useState('');
  const [disposition, setDisposition] = useState('Send for Rework');
  
  const [defects, setDefects] = useState({ cracks: false, warp: false, voids: false, tolerance: false, discoloration: false });

  // Quick Decisions
  const setQuickDecision = (decision) => {
    if (decision === 'Batch Passed') {
      setAcceptedQty(inspectedQty);
      setRejectedQty(0);
    } else if (decision === 'Full Reject') {
      setAcceptedQty(0);
      setRejectedQty(inspectedQty);
    }
  };

  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    const sum = Number(acceptedQty) + Number(rejectedQty) + Number(reworkQty);

    if (sum > total || sum > Number(inspectedQty)) {
      Swal.fire({ icon: 'error', title: 'Quantity Mismatch', text: `Approved + Rejected + Rework cannot exceed produced quantity (${total}).` });
      return;
    }

    const activeDefects = Object.entries(defects).filter(([, v]) => v).map(([k]) => ({
      cracks: 'Surface Cracks', warp: 'Dimension Warp', voids: 'Structural Voids', tolerance: 'Tolerance Deviation', discoloration: 'Color Discoloration'
    })[k]);

    if (Number(rejectedQty) > 0 && activeDefects.length === 0) {
      showToast('Please select at least one defect flag for rejected items.');
      return;
    }

    const confirmed = await Swal.fire({
      title: 'Submit QC Decision?',
      html: `Approved: <strong>${acceptedQty}</strong> | Rejected: <strong>${rejectedQty}</strong><br/>Order: <strong>${selectedOrder.orderNo || selectedOrder.id}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit Decision',
      customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn', cancelButton: 'swal-premium-cancel-btn' },
      buttonsStyling: false,
    });

    if (!confirmed.isConfirmed) return;

    setSubmitting(true);
    try {
      const qcData = {
        inspectorName: user?.name || 'QC Inspector',
        strength, dimensions, weight,
        defects: activeDefects,
        remarks,
        inspectedQuantity: Number(inspectedQty),
        acceptedQty: Number(acceptedQty),
        rejectedQty: Number(rejectedQty),
        disposition: Number(rejectedQty) > 0 ? disposition : ''
      };

      useERPStore.getState().approveQC(selectedOrder.workOrderId || selectedOrder.id, {
        batchId: selectedOrder.batchNumberFinal,
        items: (selectedOrder.items || []).map((item, index) => ({
          orderLineId: item.id || item.orderLineId,
          producedQuantity: index === 0 ? total : Number(item.producedQuantity ?? item.quantity ?? 0),
          approvedQuantity: index === 0 ? Number(acceptedQty) : 0,
          rejectedQuantity: index === 0 ? Number(rejectedQty) : 0,
          reworkQuantity: index === 0 ? Number(reworkQty) : 0,
        })),
        remarks,
      }, user?.name || 'QC Inspector');
      
      showToast(`QC Submitted: ${acceptedQty} Approved, ${rejectedQty} Rejected.`);
      onClose();
      if (Number(acceptedQty) > 0 && Number(rejectedQty) === 0) {
        navigate.push('/production/finished-goods');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Submission Failed', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 'min(94vw, 650px)', maxHeight: '90vh', padding: 0, overflowY: 'auto', borderRadius: '16px' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#24345C', margin: 0 }}>QC Inspection Sign-off</h3>
              <p style={{ fontSize: '11px', color: '#8893A7', margin: '2px 0 0 0' }}>
                Order: {selectedOrder.orderNo || selectedOrder.id} · {selectedOrder.customerName}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #DCE5F0', background: '#F5FAFE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleInspectionSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto' }}>

            {/* Order info strip */}
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '8px', fontSize: '12px', color: '#581c87' }}>
                <div>Product: <strong>{selectedOrder.products || selectedOrder.productName || selectedOrder.detailedItems?.[0]?.productName || '—'}</strong></div>
                <div>Batch: <strong>{selectedOrder.batchNumberFinal || selectedOrder.batchNumber || selectedOrder.production?.batchNumber || '—'}</strong></div>
                <div>Ordered Qty: <strong>{selectedOrder.orderedQuantity || selectedOrder.quantity || selectedOrder.estimatedQuantity || 0}</strong></div>
                <div>Produced Qty: <strong>{total}</strong></div>
              </div>
            </div>

            {/* Quantities & Disposition */}
            <div style={{ padding: '16px', background: '#F5FAFE', border: '1px solid #DCE5F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '800', margin: 0, color: '#1e293b' }}>Inspection Quantities</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-small" style={{ fontSize: '10px', padding: '4px 8px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setQuickDecision('Batch Passed')}>All Passed</button>
                  <button type="button" className="btn-small" style={{ fontSize: '10px', padding: '4px 8px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setQuickDecision('Full Reject')}>All Rejected</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#5E6B82' }}>Inspected Qty</label>
                  <input type="number" min="0" className="form-input" style={{ fontWeight: 'bold' }} value={inspectedQty} onChange={e => {
                      setInspectedQty(e.target.value);
                      setAcceptedQty(e.target.value);
                      setRejectedQty(0);
                  }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 'bold' }}>Rework Qty</label>
                  <input type="number" min="0" className="form-input" value={reworkQty} onChange={e => setReworkQty(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>Approved Qty</label>
                  <input type="number" min="0" className="form-input" style={{ borderColor: '#86efac', background: '#f0fdf4' }} value={acceptedQty} onChange={e => setAcceptedQty(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold' }}>Rejected Qty</label>
                  <input type="number" min="0" className="form-input" style={{ borderColor: '#fca5a5', background: '#fef2f2' }} value={rejectedQty} onChange={e => setRejectedQty(e.target.value)} />
                </div>
              </div>
              
              {Number(rejectedQty) > 0 && (
                <div className="form-group" style={{ margin: '16px 0 0 0', animation: 'fadeIn 0.3s ease' }}>
                  <label className="form-label" style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold' }}>Rejection Disposition</label>
                  <select className="form-input" value={disposition} onChange={e => setDisposition(e.target.value)} style={{ borderColor: '#fca5a5' }}>
                    <option value="Send for Rework">Send for Rework</option>
                    <option value="Mark as Scrap">Mark as Scrap</option>
                    <option value="Hold for Review">Hold for Review</option>
                    <option value="Retest Required">Retest Required</option>
                  </select>
                </div>
              )}
            </div>

            {/* Test results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '14px' }}>
              {[
                { label: 'Compressive Strength', val: strength, set: setStrength },
                { label: 'Dimensional Accuracy', val: dimensions, set: setDimensions },
                { label: 'Weight / Moisture', val: weight, set: setWeight },
              ].map(({ label, val, set }) => (
                <div key={label} className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{label}</label>
                  <input type="text" className="form-input" value={val} onChange={e => set(e.target.value)} />
                </div>
              ))}
            </div>

            {/* Defects */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Defect Flags {Number(rejectedQty) > 0 && <span style={{color: 'red'}}>*</span>}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '8px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                {Object.entries(defects).map(([k, v]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={v} onChange={e => setDefects({ ...defects, [k]: e.target.checked })} />
                    <span>{{ cracks: 'Surface Cracks', warp: 'Dimension Warp', voids: 'Structural Voids', tolerance: 'Tolerance Deviation', discoloration: 'Color Discoloration' }[k]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Inspector Remarks</label>
              <textarea className="form-input" style={{ height: '60px', fontSize: '12.5px' }}
                value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Observations, notes, defect details..." />
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#5E6B82' }}>
              Validation: {acceptedQty} + {rejectedQty} + {reworkQty} = <strong style={{ color: (Number(acceptedQty) + Number(rejectedQty) + Number(reworkQty)) <= Number(inspectedQty) ? '#16a34a' : '#dc2626' }}>{Number(acceptedQty) + Number(rejectedQty) + Number(reworkQty)} / {inspectedQty}</strong>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose}
                style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-border)', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                style={{ padding: '10px 24px', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', fontWeight: 'bold', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting…' : 'Submit Decision'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

