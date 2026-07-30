'use client';
import React, { useState, useEffect } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { selectMaterialRejections } from '../../../store/procurementSelectors';
import { submitMaterialRejection, createReplacementGRN } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../../procurement/components/ProcurementStatusBadge';
import { PackageX, Plus, FileCheck } from 'lucide-react';
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

  useEffect(() => {
    setRejections(selectMaterialRejections());
  }, [storeState]); // Re-run when state changes

  const handleCreateRejection = () => {
    setRejectionForm({ poId: '', grnId: '', materialId: '', materialName: '', rejectedQty: 0, reason: '' });
    setShowRejectionModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionForm.poId || !rejectionForm.materialId || rejectionForm.rejectedQty <= 0) {
      return Swal.fire('Error', 'Please fill in all required fields.', 'error');
    }
    try {
      setIsSubmitting(true);
      submitMaterialRejection({
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
    if (verifyForm.deliveredQty <= 0 || verifyForm.acceptedQty + verifyForm.rejectedQty !== verifyForm.deliveredQty) {
      return Swal.fire('Error', 'Invalid quantities. Accepted + Rejected must equal Delivered.', 'error');
    }
    try {
      setIsSubmitting(true);
      const grnData = {
        warehouseId: 'MAIN-WH-01',
        items: [{
          productId: selectedRejection.materialId,
          receivedQuantity: verifyForm.deliveredQty,
          acceptedQuantity: verifyForm.acceptedQty,
          rejectedQuantity: verifyForm.rejectedQty,
          inspectionRemarks: 'Replacement delivery inspection'
        }]
      };
      createReplacementGRN(selectedRejection.id, grnData, 'Store Admin');
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
    <div style={{ padding: '24px' }}>
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
                <th style={thStyle}>Action</th>
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
                  <td style={tdStyle}>
                    {['REPLACEMENT_EXPECTED', 'PARTIALLY_RESOLVED'].includes(r.status) && (
                      <button 
                        onClick={() => handleVerifyDelivery(r)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <FileCheck size={14} /> Verify Delivery
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REJECTION MODAL */}
      {showRejectionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Log Material Rejection</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>PO Number</label>
                <input style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                       value={rejectionForm.poId} onChange={e => setRejectionForm({...rejectionForm, poId: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>GRN Reference / Invoice</label>
                <input style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                       value={rejectionForm.grnId} onChange={e => setRejectionForm({...rejectionForm, grnId: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Material / Product</label>
                <input style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                       value={rejectionForm.materialId} onChange={e => setRejectionForm({...rejectionForm, materialId: e.target.value, materialName: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Rejected Quantity</label>
                <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                       value={rejectionForm.rejectedQty} onChange={e => setRejectionForm({...rejectionForm, rejectedQty: Number(e.target.value)})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Reason</label>
                <textarea rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                       value={rejectionForm.reason} onChange={e => setRejectionForm({...rejectionForm, reason: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
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
                       value={verifyForm.deliveredQty} onChange={e => setVerifyForm({...verifyForm, deliveredQty: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Accepted Qty</label>
                  <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                         value={verifyForm.acceptedQty} onChange={e => setVerifyForm({...verifyForm, acceptedQty: Number(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Rejected Qty</label>
                  <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                         value={verifyForm.rejectedQty} onChange={e => setVerifyForm({...verifyForm, rejectedQty: Number(e.target.value)})} />
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
