import React, { useState, useEffect } from 'react';
import { selectMaterialRejections, selectFinancePurchaseOrder } from '../../../store/procurementSelectors';
import { approveVendorReplacement, closeMaterialRejection, disposeRejectedStock } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { AlertTriangle, CheckCircle, PackageX } from 'lucide-react';
import Swal from 'sweetalert2';

export default function RejectionManagement() {
  const [rejections, setRejections] = useState([]);
  const [selectedRejection, setSelectedRejection] = useState(null);
  const [approvalData, setApprovalData] = useState({
    approvedReplacementQty: 0,
    expectedDeliveryDate: '',
    vendorAcknowledgementNumber: '',
    vendorRemarks: '',
    financeRemarks: '',
    defectiveMaterialDisposition: 'RETURN_TO_VENDOR'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRejections(selectMaterialRejections());
  }, []);

  const handleSelectRejection = (rejId) => {
    const rej = selectMaterialRejections().find(r => r.id === rejId);
    setSelectedRejection(rej);
    setApprovalData({
      approvedReplacementQty: rej.remainingResolutionQty,
      expectedDeliveryDate: '',
      vendorAcknowledgementNumber: '',
      vendorRemarks: '',
      financeRemarks: '',
      defectiveMaterialDisposition: 'RETURN_TO_VENDOR'
    });
  };

  const handleApproveReplacement = async () => {
    if (approvalData.approvedReplacementQty <= 0) {
      Swal.fire('Error', 'Approved quantity must be greater than 0', 'error');
      return;
    }
    if (approvalData.approvedReplacementQty > selectedRejection.remainingResolutionQty) {
      Swal.fire('Error', `Cannot approve more than remaining resolution quantity (${selectedRejection.remainingResolutionQty})`, 'error');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      approveVendorReplacement({
        rejectionId: selectedRejection.id,
        approvedReplacementQty: approvalData.approvedReplacementQty,
        expectedDeliveryDate: approvalData.expectedDeliveryDate,
        vendorAcknowledgementNumber: approvalData.vendorAcknowledgementNumber,
        vendorRemarks: approvalData.vendorRemarks,
        financeRemarks: approvalData.financeRemarks,
        defectiveMaterialDisposition: approvalData.defectiveMaterialDisposition,
        actor: 'Finance'
      });
      
      await Swal.fire('Success', 'Replacement approved and expected.', 'success');
      
      setSelectedRejection(null);
      setRejections(selectMaterialRejections());
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to approve replacement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisposeStock = async () => {
    const { value: disposition } = await Swal.fire({
      title: 'Dispose Original Rejected Stock',
      input: 'select',
      inputOptions: {
        'RETURN_TO_VENDOR': 'Return to Vendor',
        'SCRAP_AFTER_APPROVAL': 'Scrap after Approval',
        'DISPOSE_LOCALLY': 'Dispose Locally'
      },
      inputPlaceholder: 'Select disposition',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to choose a disposition!'
        }
      }
    });

    if (disposition) {
      try {
        disposeRejectedStock(selectedRejection.id, selectedRejection.rejectedQty, disposition, 'Finance');
        await Swal.fire('Success', `Stock disposition recorded as ${disposition}`, 'success');
        setSelectedRejection(selectMaterialRejections().find(r => r.id === selectedRejection.id));
        setRejections(selectMaterialRejections());
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleCloseRejection = async () => {
    try {
      closeMaterialRejection(selectedRejection.id, 'Finance');
      await Swal.fire('Success', 'Material rejection closed.', 'success');
      setSelectedRejection(null);
      setRejections(selectMaterialRejections());
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (selectedRejection) {
    const po = selectFinancePurchaseOrder(selectedRejection.poId);
    
    return (
      <div style={{ padding: '24px' }}>
        <button 
          onClick={() => setSelectedRejection(null)}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}
        >
          ? Back to List
        </button>
        
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#24345C', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PackageX size={24} color="#dc2626" />
              Rejection Details
            </h2>
            <ProcurementStatusBadge status={selectedRejection.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: '#F5FAFE', padding: '16px', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Rejection #</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.rejectionNumber}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Original PO #</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.poId}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Vendor</span>
              <strong style={{ color: '#24345C' }}>{po?.vendorName || 'Unknown'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Material</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.materialName}</strong>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#24345C' }}>Resolution Progress</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '12px', color: '#b91c1c', display: 'block' }}>Original Rejected</span>
                <strong style={{ fontSize: '20px', color: '#991b1b' }}>{selectedRejection.rejectedQty}</strong>
              </div>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '12px', color: '#1d4ed8', display: 'block' }}>Replacement Accepted</span>
                <strong style={{ fontSize: '20px', color: '#1e3a8a' }}>{selectedRejection.cumulativeReplacementAcceptedQty}</strong>
              </div>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#fdf4ff', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                <span style={{ fontSize: '12px', color: '#a21caf', display: 'block' }}>Comm. Settled</span>
                <strong style={{ fontSize: '20px', color: '#86198f' }}>{selectedRejection.commerciallySettledQty}</strong>
              </div>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '12px', color: '#b45309', display: 'block' }}>Remaining Resolution</span>
                <strong style={{ fontSize: '20px', color: '#92400e' }}>{selectedRejection.remainingResolutionQty}</strong>
              </div>
            </div>
          </div>

          {selectedRejection.status === 'MATERIAL_REJECTION_SUBMITTED' && (
            <div style={{ background: '#F5FAFE', border: '1px solid #DCE5F0', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#24345C' }}>Approve Vendor Replacement</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Approved Replacement Qty</label>
                  <input 
                    type="number" 
                    value={approvalData.approvedReplacementQty} 
                    onChange={(e) => setApprovalData(prev => ({...prev, approvedReplacementQty: Number(e.target.value)}))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '6px' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Expected Delivery Date</label>
                  <input 
                    type="date" 
                    value={approvalData.expectedDeliveryDate} 
                    onChange={(e) => setApprovalData(prev => ({...prev, expectedDeliveryDate: e.target.value}))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '6px' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Vendor Acknowledgment #</label>
                  <input 
                    type="text" 
                    value={approvalData.vendorAcknowledgementNumber} 
                    onChange={(e) => setApprovalData(prev => ({...prev, vendorAcknowledgementNumber: e.target.value}))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '6px' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Defective Material Disposition</label>
                  <select
                    value={approvalData.defectiveMaterialDisposition}
                    onChange={(e) => setApprovalData(prev => ({...prev, defectiveMaterialDisposition: e.target.value}))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '6px', background: '#fff' }}
                  >
                    <option value="RETURN_TO_VENDOR">Return to Vendor</option>
                    <option value="VENDOR_PICKUP_PENDING">Vendor Pickup Pending</option>
                    <option value="SCRAP_AFTER_APPROVAL">Scrap After Approval</option>
                    <option value="DISPOSE_LOCALLY">Dispose Locally</option>
                    <option value="RETAIN_FOR_INSPECTION">Retain for Inspection</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Finance Remarks</label>
                <textarea 
                  value={approvalData.financeRemarks}
                  onChange={(e) => setApprovalData(prev => ({...prev, financeRemarks: e.target.value}))}
                  rows={2}
                  style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleApproveReplacement}
                  disabled={isSubmitting}
                  style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {isSubmitting ? 'Approving...' : 'Approve Vendor Replacement'}
                </button>
              </div>
            </div>
          )}

          {['REPLACEMENT_EXPECTED', 'PARTIALLY_RESOLVED', 'RESOLVED'].includes(selectedRejection.status) && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #DCE5F0' }}>
              <button 
                onClick={handleDisposeStock}
                disabled={!!selectedRejection.originalStockDisposition}
                style={{ padding: '10px 16px', background: selectedRejection.originalStockDisposition ? '#f1f5f9' : '#fff', color: selectedRejection.originalStockDisposition ? '#8893A7' : '#24345C', border: '1px solid #D6E2F0', borderRadius: '6px', cursor: selectedRejection.originalStockDisposition ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {selectedRejection.originalStockDisposition ? `Stock Disposed: ${selectedRejection.originalStockDisposition}` : 'Dispose Original Rejected Stock'}
              </button>
              
              <button 
                onClick={handleCloseRejection}
                disabled={selectedRejection.remainingResolutionQty > 0 || !selectedRejection.originalStockDisposition}
                style={{ padding: '10px 24px', background: (selectedRejection.remainingResolutionQty > 0 || !selectedRejection.originalStockDisposition) ? '#8893A7' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: (selectedRejection.remainingResolutionQty > 0 || !selectedRejection.originalStockDisposition) ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                Close Rejection Case
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#24345C' }}>Rejection Management</h2>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', textAlign: 'left' }}>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Rejection #</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Material</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Original PO</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Unresolved Qty</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rejections.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#5E6B82' }}>
                  No active material rejections.
                </td>
              </tr>
            ) : (
              rejections.map(rej => (
                <tr key={rej.id} style={{ borderBottom: '1px solid #DCE5F0' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{rej.rejectionNumber}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{rej.materialName}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#5E6B82' }}>{rej.poId}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <strong style={{ color: rej.remainingResolutionQty > 0 ? '#b91c1c' : '#15803d' }}>
                      {rej.remainingResolutionQty}
                    </strong>
                  </td>
                  <td style={{ padding: '16px' }}><ProcurementStatusBadge status={rej.status} /></td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleSelectRejection(rej.id)}
                      style={{ padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Manage
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
