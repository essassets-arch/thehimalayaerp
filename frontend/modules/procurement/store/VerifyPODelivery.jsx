import React, { useEffect, useState } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { syncProcurementData, verifyPODelivery } from '../../../store/procurementActions';
import { PurchaseOrderDetails } from '../components/PurchaseOrderDetails';
import { MaterialManifestTable } from '../components/MaterialManifestTable';
import { DeliveryDocumentUploader } from '../components/DeliveryDocumentUploader';
import { Package, Search, ChevronLeft, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

const EMPTY_REJECTIONS = [];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function VerifyPODelivery() {
  const purchaseOrders = useERPStore(state => state.state?.procurement?.purchaseOrders || state.state?.purchaseOrders || []);
  // Keep the empty fallback referentially stable. Returning a new [] from a
  // Zustand selector causes React to resubscribe indefinitely before data loads.
  const materialRejections = useERPStore(state => state.state?.materialRejections ?? EMPTY_REJECTIONS);

  const [selectedPOId, setSelectedPOId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState('pending');
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState(null);

  // Fetch fresh PO statuses when Store opens this queue, including POs Finance
  // has just moved to ORDERED in another session.
  useEffect(() => {
    void syncProcurementData();
  }, []);

  const replacementByPO = new Map(
    materialRejections
      .filter(rejection => ['REPLACEMENT_EXPECTED', 'PARTIALLY_RESOLVED'].includes(rejection.status))
      .map(rejection => [rejection.purchaseOrderId || rejection.poId, rejection]),
  );
  const replacementHistoryByPO = new Map(
    materialRejections
      .filter(rejection => ['REPLACEMENT_RECEIVED', 'RESOLVED'].includes(rejection.status))
      .map(rejection => [rejection.purchaseOrderId || rejection.poId, rejection]),
  );
  const pendingPOs = purchaseOrders.filter(po => 
    // Only POs that can receive another Store delivery belong here. Once a
    // GRN is submitted, Finance owns the next step and the PO moves to history.
    ['ORDERED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'DELIVERY_PENDING', 'PARTIALLY_DELIVERED'].includes(po.status) || replacementByPO.has(po.id)
  );
  const completedPOs = purchaseOrders.filter(po => 
    [
      'DELIVERY_PENDING_FINANCE_AUDIT',
      'PARTIALLY_DELIVERED_PENDING_AUDIT',
      'COMPLETED',
      'GRN_RECEIVED',
      'FULLY_RECEIVED',
      'CLOSED',
      'STOCK_POSTED',
      'PAYMENT_COMPLETED',
      'FINANCE_AUDIT_APPROVED',
    ].includes(po.status)
  );

  const selectedPO = purchaseOrders.find(p => p.id === selectedPOId) || null;

  const handleSelectPO = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;
    setSelectedPOId(po.id);
    const replacement = replacementByPO.get(po.id);
    setSelectedReplacement(replacement || null);
    
    const initialItems = replacement ? (po.items || []).filter(item =>
      (item.productId || item.materialId) === replacement.materialId,
    ).map(item => ({
      productId: item.productId || item.materialId,
      materialName: item.product?.name || item.materialName || replacement.materialName || 'Replacement material',
      remainingSupplyQty: Number(replacement.remainingResolutionQty || replacement.rejectedQty || 0),
      orderedQty: Number(replacement.remainingResolutionQty || replacement.rejectedQty || 0),
      deliveredQty: 0, acceptedQty: 0, rejectedQty: 0,
      unit: item.unit || item.product?.unit || 'Nos', inspectionRemarks: '',
    })) : (po.items || []).map(item => {
      const ordered = Number(item.quantity ?? item.orderedQty ?? 0);
      const delivered = Number(item.cumulativeDeliveredQty ?? item.receivedQuantity ?? 0);
      const remaining = Math.max(0, ordered - delivered);
      
      return {
        productId: item.productId || item.materialId,
        materialName: item.product?.name || item.materialName || 'Material',
        remainingSupplyQty: remaining, orderedQty: ordered,
        deliveredQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        unit: item.unit || item.product?.unit || 'Nos',
        inspectionRemarks: ''
      };
    }).filter(i => i.remainingSupplyQty > 0);

    setDeliveryItems(initialItems);
    setRemarks('');
    setAttachments([]);
  };

  const handleQtyChange = (productId, field, value) => {
    const numValue = Number(value) || 0;
    setDeliveryItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const updated = { ...item, [field]: numValue };
        
        if (field === 'deliveredQty') {
          if (numValue > item.remainingSupplyQty) {
            Swal.fire('Warning', `Delivered quantity cannot exceed remaining supply of ${item.remainingSupplyQty}`, 'warning');
            updated.deliveredQty = item.remainingSupplyQty;
            updated.acceptedQty = item.remainingSupplyQty;
            updated.rejectedQty = 0;
          } else {
            updated.acceptedQty = numValue;
            updated.rejectedQty = 0;
          }
        } else if (field === 'acceptedQty') {
          if (numValue > updated.deliveredQty) {
            updated.acceptedQty = updated.deliveredQty;
            updated.rejectedQty = 0;
          } else {
            updated.rejectedQty = updated.deliveredQty - numValue;
          }
        } else if (field === 'rejectedQty') {
          if (numValue > updated.deliveredQty) {
            updated.rejectedQty = updated.deliveredQty;
            updated.acceptedQty = 0;
          } else {
            updated.acceptedQty = updated.deliveredQty - numValue;
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleTextChange = (productId, value) => {
    setDeliveryItems(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, inspectionRemarks: value };
      }
      return item;
    }));
  };

  const handleSubmitGRN = async () => {
    const activeItems = deliveryItems.filter(i => i.deliveredQty > 0);
    if (activeItems.length === 0) {
      return Swal.fire('Error', 'Please enter delivered quantity for at least one item.', 'error');
    }

    for (const item of activeItems) {
      if (item.acceptedQty + item.rejectedQty !== item.deliveredQty) {
        return Swal.fire('Error', `For ${item.materialName}, Accepted Qty + Rejected Qty must equal Delivered Qty.`, 'error');
      }
    }

    try {
      setIsSubmitting(true);
      const cleanAttachments = (attachments || []).map(att => {
        if (typeof att === 'string' && att.length > 50000) {
          return { name: 'Uploaded File', size: att.length, preview: att.slice(0, 200) + '...' };
        }
        return att;
      });

      const grnPayload = {
        warehouseId: selectedPO.warehouseId || (useERPStore.getState().state.warehouses?.[0]?.id),
        snapshot: { remarks, attachments: cleanAttachments },
        items: activeItems.map(item => ({
          productId: item.productId,
          receivedQuantity: item.deliveredQty,
          acceptedQuantity: item.acceptedQty,
          rejectedQuantity: item.rejectedQty,
          inspectionRemarks: item.inspectionRemarks || ''
        }))
      };
      if (selectedReplacement) {
        grnPayload.isReplacement = true;
        grnPayload.materialRejectionId = selectedReplacement.id;
        grnPayload.snapshot.remarks = `Replacement delivery for ${selectedReplacement.rejectionNumber || 'material rejection'}. ${remarks}`.trim();
      }
      
      await verifyPODelivery(selectedPO.id, grnPayload, 'Store Operator');
      await Swal.fire('Success', 'Delivery verified and GRN submitted for Finance Audit.', 'success');
      setSelectedPOId(null);
      setSelectedReplacement(null);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to submit GRN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPOs = pendingPOs.filter(po => 
    (po.poNumber || po.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (po.supplier?.name || po.vendorDisplayName || po.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedPOs = completedPOs.filter(po => 
    (po.poNumber || po.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (po.supplier?.name || po.vendorDisplayName || po.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerStyle = { animation: 'fadeIn 0.3s ease' };
  
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
  };

  const inputStyle = {
    padding: '10px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    background: '#f8fafc',
    outline: 'none',
    width: '100%',
    transition: 'all 0.2s',
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .po-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          background: #ffffff;
          transition: all 0.2s;
          cursor: pointer;
        }
        .po-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }
        .table-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
        }
        .table-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        @media (max-width: 768px) {
          .verify-po-card-container {
            padding: 16px 14px !important;
          }
          .verify-po-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .verify-po-tabs {
            width: 100% !important;
            justify-content: flex-start !important;
            gap: 16px !important;
            overflow-x: auto !important;
            padding-bottom: 2px !important;
          }
          .verify-po-tabs h2 {
            font-size: 17px !important;
            white-space: nowrap !important;
          }
          .verify-po-search {
            width: 100% !important;
            max-width: 100% !important;
          }
          .verify-po-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .verify-po-card-container {
            padding: 14px 10px !important;
          }
          .verify-po-tabs h2 {
            font-size: 15px !important;
          }
        }
      `}</style>

      {!selectedPO ? (
        <div className="verify-po-card-container" style={cardStyle}>
          <div className="verify-po-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div className="verify-po-tabs" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: viewTab === 'pending' ? '#0f172a' : '#cbd5e1', margin: 0, cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setViewTab('pending')}>Pending Deliveries</h2>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: viewTab === 'history' ? '#0f172a' : '#cbd5e1', margin: 0, cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setViewTab('history')}>Delivery History</h2>
            </div>
            <div className="verify-po-search" style={{ position: 'relative', width: '300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input
                type="text"
                placeholder="Search PO or Vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '38px', background: '#ffffff' }}
              />
            </div>
          </div>

          <div className="verify-po-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {viewTab === 'pending' ? filteredPOs.map(po => (
              <div key={po.id} className="po-card" onClick={() => handleSelectPO(po.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{po.poNumber || po.publicId || po.id}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{po.supplier?.name || po.vendorDisplayName || po.vendorName || 'Supplier'}</p>
                  </div>
                  {replacementByPO.has(po.id) ? (
                    <span style={{ background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', borderRadius:'999px', padding:'5px 9px', fontSize:'11px', fontWeight:800 }}>REPLACEMENT</span>
                  ) : <Package color="#94a3b8" size={20} />}
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '12px', textTransform: 'uppercase' }}>
                    {replacementByPO.has(po.id) ? 'Replacement delivery' : po.status.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    Due: {formatDate(replacementByPO.get(po.id)?.expectedDeliveryDate || po.expectedDeliveryDate || po.deliveryDate)}
                  </span>
                </div>
              </div>
            )) : filteredCompletedPOs.map(po => (
              <div key={po.id} className="po-card" style={{ opacity: 0.8, cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{po.poNumber || po.publicId || po.id}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{po.supplier?.name || po.vendorDisplayName || po.vendorName || 'Supplier'}</p>
                  </div>
                  {replacementHistoryByPO.has(po.id) ? (
                    <span style={{ background:'#f3e8ff', color:'#7e22ce', border:'1px solid #e9d5ff', borderRadius:'999px', padding:'5px 9px', fontSize:'11px', fontWeight:800 }}>REPLACEMENT</span>
                  ) : <CheckCircle2 color="#10b981" size={20} />}
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '12px', textTransform: 'uppercase' }}>
                    {po.status.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    {['DELIVERY_PENDING_FINANCE_AUDIT', 'PARTIALLY_DELIVERED_PENDING_AUDIT'].includes(po.status)
                      ? 'Awaiting Finance Audit'
                      : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {filteredPOs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '48px 0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              No pending deliveries found matching your search.
            </div>
          )}
        </div>
      ) : (
        <div style={cardStyle}>
          <button 
            onClick={() => setSelectedPOId(null)}
            style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', padding: 0 }}
          >
            <ChevronLeft size={16} /> Back to PO List
          </button>

          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
             <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>PO Reference: {selectedPO.poNumber || selectedPO.id}</h3>
             <PurchaseOrderDetails po={selectedPO} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Record New Delivery</h3>
          
          <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Material Details</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', width: '140px' }}>Delivered Qty</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', width: '140px' }}>Accepted</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', width: '140px' }}>Rejected</th>
                </tr>
              </thead>
              <tbody>
                {deliveryItems.map((item) => (
                  <tr key={item.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {item.materialName}
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '6px', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Ordered:</span> <strong style={{ color: '#0f172a' }}>{item.orderedQty}</strong>
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Remaining:</span> <strong style={{ color: '#1d4ed8' }}>{item.remainingSupplyQty} {item.unit}</strong>
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <input type="number" min="0" max={item.remainingSupplyQty} value={item.deliveredQty || ''} onChange={(e) => handleQtyChange(item.productId, 'deliveredQty', e.target.value)} className="table-input" style={{ borderColor: '#e2e8f0' }} />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <input type="number" min="0" max={item.deliveredQty} value={item.acceptedQty || ''} onChange={(e) => handleQtyChange(item.productId, 'acceptedQty', e.target.value)} className="table-input" style={{ borderColor: '#10b981', background: '#ecfdf5' }} />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <input type="number" min="0" max={item.deliveredQty} value={item.rejectedQty || ''} onChange={(e) => handleQtyChange(item.productId, 'rejectedQty', e.target.value)} className="table-input" style={{ borderColor: '#ef4444', background: '#fef2f2' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



          <DeliveryDocumentUploader entityId={selectedPO.id} entityType="GRN" onUploadComplete={setAttachments} />

          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setSelectedPOId(null)}
              style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#64748b', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitGRN}
              disabled={isSubmitting}
              style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
            >
              {isSubmitting ? 'Submitting...' : <><CheckCircle2 size={16} /> Confirm & Verify Delivery</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}








