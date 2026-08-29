'use client';
import React, { useState, useEffect } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { selectMaterialRejections } from '../../../store/procurementSelectors';
import { submitMaterialRejection } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../../procurement/components/ProcurementStatusBadge';
import { PackageX, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

export default function MaterialRejections() {
  const [rejections, setRejections] = useState([]);
  const storeState = useERPStore(s => s.state);
  
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionForm, setRejectionForm] = useState({
    poId: '',
    grnId: '',
    materialId: '',
    materialName: '',
    rejectedQty: 0,
    reason: ''
  });

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    deliveredQty: 0,
    acceptedQty: 0,
    rejectedQty: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const purchaseOrders = storeState.procurement?.purchaseOrders || storeState.purchaseOrders || [];
  const selectedPO = purchaseOrders.find((po) => po.id === rejectionForm.poId);
  const selectedPOItems = selectedPO?.items || [];

  useEffect(() => {
    setRejections(selectMaterialRejections());
  }, [storeState]); // Re-run when state changes

  const handleCreateRejection = () => {
    setRejectionForm({ poId: '', grnId: '', materialId: '', materialName: '', rejectedQty: 0, reason: '' });
    setShowRejectionModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionForm.poId || !rejectionForm.materialId || rejectionForm.rejectedQty <= 0 || !rejectionForm.reason.trim()) {
      return Swal.fire('Error', 'Please fill in all required fields.', 'error');
    }
    const confirmation = await Swal.fire({
      title: 'Send rejection to Finance?',
      html: `<div style="text-align:left;line-height:1.7"><strong>Quantity:</strong> ${rejectionForm.rejectedQty}<br/><strong>Reason:</strong> ${rejectionForm.reason || 'Not specified'}<br/><span style="color:#64748b">Finance will review the request and set the expected replacement delivery date.</span></div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, send to Finance',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Continue editing',
    });
    if (!confirmation.isConfirmed) return;
    try {
      setIsSubmitting(true);
      await submitMaterialRejection({
        ...rejectionForm,
      }, 'Store Admin');
      await Swal.fire('Success', 'Material rejection logged and sent to Finance.', 'success');
      setShowRejectionModal(false);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyDelivery = (rej) => {
    setSelectedRejection(rej);
    setVerifyForm({
      deliveredQty: rej.remainingResolutionQty,
      acceptedQty: rej.remainingResolutionQty,
      rejectedQty: 0
    });
    setShowVerifyModal(true);
  };

  const submitReplacementGRN = async () => {
    const deliveredQty = Number(verifyForm.deliveredQty) || 0;
    const acceptedQty = Number(verifyForm.acceptedQty) || 0;
    const rejectedQty = Number(verifyForm.rejectedQty) || 0;
    if (deliveredQty <= 0 || acceptedQty + rejectedQty !== deliveredQty) {
      return Swal.fire('Error', 'Invalid quantities. Accepted + Rejected must equal Delivered.', 'error');
    }
    try {
      setIsSubmitting(true);
      const grnData = {
        purchaseOrderId: selectedRejection.purchaseOrderId || selectedRejection.poId,
        items: [{
          productId: selectedRejection.materialId,
          deliveredQuantity: verifyForm.deliveredQty,
          acceptedQuantity: verifyForm.acceptedQty,
          rejectedQuantity: verifyForm.rejectedQty,
          inspectionRemarks: 'Replacement delivery inspection'
        }]
      };
      await createReplacementGRN(selectedRejection.id, grnData, 'Store Admin');
      await Swal.fire('Success', 'Replacement delivery recorded and sent for audit.', 'success');
      setShowVerifyModal(false);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const thStyle = {
    padding: '12px 16px', textAlign: 'left', fontSize: '11px',
    fontWeight: 800, color: '#5E6B82', textTransform: 'uppercase',
    letterSpacing: '0.5px', background: '#F5FAFE', borderBottom: '2px solid #E5ECF5',
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '13px 16px', fontSize: '13px', color: '#24345C',
    borderBottom: '1px solid #F0F5FA', verticalAlign: 'middle',
  };

  return (
    <div className="material-rejections-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      <style>{`
        .material-rejections-modal-overlay { padding: 16px; }
        .material-rejections-modal { width: 100%; max-width: min(94vw, 640px); }
        .material-rejections-form { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        @media (max-width: 760px) {
          .material-rejections-page { padding: 14px !important; }
          .material-rejections-modal-overlay { align-items: flex-end !important; padding: 0 !important; }
          .material-rejections-modal { width: 100% !important; max-height: 94vh !important; border-radius: 18px 18px 0 0 !important; }
          .material-rejections-form { grid-template-columns: 1fr !important; padding: 18px !important; gap: 13px !important; }
          .material-rejections-form > div[style*="grid-column"] { grid-column: auto !important; }
          .material-rejections-actions { flex-direction: column-reverse; }
          .material-rejections-actions button { width: 100%; padding: 12px 16px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#24345C', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageX size={24} color="#ef4444" />
            Material Rejections
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
            Track and manage rejected materials from incoming deliveries
          </p>
        </div>
        <button 
          onClick={handleCreateRejection}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={16} /> Log New Rejection
        </button>
      </div>

      {rejections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: '#F9FBFE', borderRadius: '12px', border: '1px dashed #DCE5F0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#24345C' }}>No material rejections logged.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E5ECF5', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Rejection #</th>
                <th style={thStyle}>PO Reference</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Rejected Qty</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Expected Delivery</th>
              </tr>
            </thead>
            <tbody>
              {rejections.map(r => (
                <tr key={r.id}>
                  <td style={tdStyle}><strong>{r.rejectionNumber}</strong></td>
                  <td style={tdStyle}>{r.poId}</td>
                  <td style={tdStyle}>{r.materialName || r.materialId}</td>
                  <td style={tdStyle}><strong style={{ color: '#ef4444' }}>{r.rejectedQty}</strong></td>
                  <td style={tdStyle}><ProcurementStatusBadge status={r.status} /></td>
                  <td style={tdStyle}>{r.expectedDeliveryDate ? new Date(r.expectedDeliveryDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REJECTION MODAL */}
      {showRejectionModal && (
        <div className="material-rejections-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.62)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div className="material-rejections-modal" style={{ background: '#fff', borderRadius: '18px', width: '640px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(15,23,42,.28)' }}>
            <div style={{ padding: '22px 24px 18px', background: 'linear-gradient(135deg,#fff1f2,#fff)', borderBottom: '1px solid #ffe4e6' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', background: '#fee2e2', color: '#dc2626' }}><PackageX size={21}/></div><div><h3 style={{ margin: 0, fontSize: '19px', color: '#172554' }}>Log Material Rejection</h3><p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>Record rejected material and route it to Finance.</p></div></div>
            </div>
            <div className="material-rejections-form" style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>PO Number <span style={{color:'#dc2626'}}>*</span></label>
                <select style={{ width: '100%', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px', background:'#fff' }} value={rejectionForm.poId} onChange={e => setRejectionForm({...rejectionForm, poId: e.target.value, materialId: '', materialName: ''})}><option value="">Select Purchase Order</option>{purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.poNumber || po.publicId || po.id}</option>)}</select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>GRN Reference / Invoice</label>
                <input placeholder="GRN or invoice number" style={{ width: '100%', boxSizing:'border-box', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                       value={rejectionForm.grnId} onChange={e => setRejectionForm({...rejectionForm, grnId: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Material / Product <span style={{color:'#dc2626'}}>*</span></label>
                <select disabled={!rejectionForm.poId} style={{ width: '100%', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px', background: rejectionForm.poId ? '#fff' : '#f8fafc' }} value={rejectionForm.materialId} onChange={e => { const item = selectedPOItems.find(i => (i.productId || i.materialId) === e.target.value); setRejectionForm({...rejectionForm, materialId: e.target.value, materialName: item?.product?.name || item?.materialName || 'Material'}); }}><option value="">{rejectionForm.poId ? 'Select Material' : 'Select PO first'}</option>{selectedPOItems.map(item => <option key={item.productId || item.materialId} value={item.productId || item.materialId}>{item.product?.name || item.materialName || item.productId}</option>)}</select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Rejected Quantity <span style={{color:'#dc2626'}}>*</span></label>
                <input type="number" min="0" style={{ width: '100%', boxSizing:'border-box', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                       value={rejectionForm.rejectedQty} onChange={e => setRejectionForm({...rejectionForm, rejectedQty: Number(e.target.value)})} />
              </div>
              <div style={{gridColumn:'1 / -1'}}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Reason <span style={{color:'#dc2626'}}>*</span></label>
                <textarea rows={3} placeholder="Describe the damage, quality issue, or shortage" style={{ width: '100%', boxSizing:'border-box', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px', resize:'vertical' }} 
                       value={rejectionForm.reason} onChange={e => setRejectionForm({...rejectionForm, reason: e.target.value})} />
              </div>
              <div className="material-rejections-actions" style={{ gridColumn:'1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px', paddingTop:'18px', borderTop:'1px solid #e2e8f0' }}>
                <button onClick={() => setShowRejectionModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={submitRejection} disabled={isSubmitting} style={{ padding: '8px 16px', border: 'none', background: '#ef4444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
                  {isSubmitting ? 'Submitting...' : 'Send to Finance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY DELIVERY MODAL */}
      {showVerifyModal && selectedRejection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Verify Replacement Delivery</h3>
            <div style={{ marginBottom: '16px', padding: '12px', background: '#F5FAFE', borderRadius: '8px', fontSize: '13px' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Rejection #:</strong> {selectedRejection.rejectionNumber}</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>PO #:</strong> {selectedRejection.poId}</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>Material:</strong> {selectedRejection.materialName}</p>
              <p style={{ margin: 0, color: '#b91c1c' }}><strong>Remaining to Verify:</strong> {selectedRejection.remainingResolutionQty}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Delivered Quantity</label>
                <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                       value={verifyForm.deliveredQty} onChange={e => { const deliveredQty = Number(e.target.value) || 0; setVerifyForm({ deliveredQty, acceptedQty: deliveredQty, rejectedQty: 0 }); }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Accepted Qty</label>
                  <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                         value={verifyForm.acceptedQty} onChange={e => { const acceptedQty = Math.min(Number(e.target.value) || 0, Number(verifyForm.deliveredQty) || 0); setVerifyForm({ ...verifyForm, acceptedQty, rejectedQty: (Number(verifyForm.deliveredQty) || 0) - acceptedQty }); }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Rejected Qty</label>
                  <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                         value={verifyForm.rejectedQty} onChange={e => { const rejectedQty = Math.min(Number(e.target.value) || 0, Number(verifyForm.deliveredQty) || 0); setVerifyForm({ ...verifyForm, rejectedQty, acceptedQty: (Number(verifyForm.deliveredQty) || 0) - rejectedQty }); }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => setShowVerifyModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={submitReplacementGRN} disabled={isSubmitting} style={{ padding: '8px 16px', border: 'none', background: '#059669', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
                  {isSubmitting ? 'Verifying...' : 'Confirm & Verify Delivery'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
