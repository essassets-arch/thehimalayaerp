import React, { useState, useEffect } from 'react';
import { selectGoodsReceiptNotes, selectFinancePurchaseOrder } from '../../../store/procurementSelectors';
import { approveGRN } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import DataTable from '../../../shared/components/DataTable';
import { FileCheck, ShieldCheck, ChevronRight, CornerUpLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DeliveryAudit() {
  const [grns, setGrns] = useState([]);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [associatedPO, setAssociatedPO] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only show GRNs submitted for Finance Audit
    const pending = selectGoodsReceiptNotes().filter(g => 
      g.status === 'SUBMITTED_FOR_FINANCE_AUDIT'
    );
    setGrns(pending);
  }, []);

  const handleSelectGRN = (grnId) => {
    const grn = selectGoodsReceiptNotes().find(g => g.id === grnId);
    setSelectedGRN(grn);
    
    if (grn) {
      const po = selectFinancePurchaseOrder(grn.poId);
      setAssociatedPO(po);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      
      approveGRN(selectedGRN.id, 'Finance Auditor');
      
      await Swal.fire('Approved', 'GRN has been approved and inventory updated.', 'success');
      
      // Reset
      setSelectedGRN(null);
      setAssociatedPO(null);
      setGrns(selectGoodsReceiptNotes().filter(g => g.status === 'SUBMITTED_FOR_FINANCE_AUDIT'));
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to approve GRN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedGRN) {
    return (
      <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button 
              onClick={() => setSelectedGRN(null)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}
            >
              <CornerUpLeft size={14} /> Back to Pending Audits
            </button>
            <h2 className="card-heading" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              Audit GRN: {selectedGRN.grnNumber}
              {selectedGRN.grnType === 'REPLACEMENT' && (
                <span style={{ fontSize: '11px', background: '#e9d5ff', color: '#7e22ce', padding: '2px 8px', borderRadius: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>REPLACEMENT</span>
              )}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Against PO: <strong>{associatedPO?.poNumber}</strong>
              {selectedGRN.grnType === 'REPLACEMENT' && selectedGRN.materialRejectionId && ` | Rejection: ${selectedGRN.materialRejectionId}`}
            </div>
          </div>
          <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', color: 'var(--color-primary)', borderRadius: '50%' }}>
            <ShieldCheck size={28} />
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text)' }}>Received Items</h3>
          <DataTable 
            columns={[
              { header: 'Material', accessor: 'materialName', render: row => <strong style={{color: 'var(--color-text)'}}>{row.materialName}</strong> },
              { header: 'Delivered', accessor: 'deliveredQty', render: row => <span style={{ color: 'var(--color-text-secondary)' }}>{row.deliveredQty}</span> },
              { header: 'Accepted', accessor: 'acceptedQty', render: row => <strong style={{ color: '#16a34a' }}>{row.acceptedQty}</strong> },
              { header: 'Rejected', accessor: 'rejectedQty', render: row => <strong style={{ color: '#dc2626' }}>{row.rejectedQty}</strong> },
              { header: 'Unit Rate (₹)', accessor: 'materialId', render: row => {
                const poItem = associatedPO?.items.find(i => i.materialId === row.materialId);
                const rate = poItem?.unitRate || 0;
                return `₹${rate.toLocaleString()}`;
              }},
              { header: 'Impact (₹)', accessor: 'id', render: row => {
                const poItem = associatedPO?.items.find(i => i.materialId === row.materialId);
                const rate = poItem?.unitRate || 0;
                const impact = row.acceptedQty * rate;
                return <strong>₹{impact.toLocaleString()}</strong>;
              }}
            ]}
            data={selectedGRN.items || []}
            emptyMessage="No items found."
          />
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-text)' }}>Store Remarks</h4>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', color: 'var(--color-text)', fontStyle: 'italic' }}>
            {selectedGRN.remarks || 'No remarks provided by store.'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            disabled={isSubmitting}
            className="btn-small btn-outline-small"
          >
            Return for Correction
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="btn-small btn-primary-small"
            style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff' }}
          >
            {isSubmitting ? 'Approving...' : 'Approve & Post to Inventory'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-card">
      <div className="card-top-bar" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="card-heading">Finance Delivery Audit</h2>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Review and approve Store Goods Receipt Notes</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {grns.map(grn => {
          const po = selectFinancePurchaseOrder(grn.poId);
          return (
            <div 
              key={grn.id} 
              onClick={() => handleSelectGRN(grn.id)}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                background: '#fff',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {grn.grnNumber}
                    {grn.grnType === 'REPLACEMENT' && (
                      <span style={{ fontSize: '10px', background: '#e9d5ff', color: '#7e22ce', padding: '2px 6px', borderRadius: '12px', fontWeight: '800' }}>REPLACEMENT</span>
                    )}
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>PO: {po?.poNumber || grn.poId}</div>
                </div>
                <div style={{ color: 'var(--color-primary)' }}>
                  <FileCheck size={24} />
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Submitted: <strong>{formatDate(new Date(grn.createdAt))}</strong>
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ProcurementStatusBadge status={grn.status} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Audit <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}

        {grns.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
            <FileCheck size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
            <div style={{ fontSize: '16px', fontWeight: '600' }}>No deliveries pending audit.</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>When the store team submits a GRN, it will appear here for financial review.</div>
          </div>
        )}
      </div>
    </div>
  );
}
