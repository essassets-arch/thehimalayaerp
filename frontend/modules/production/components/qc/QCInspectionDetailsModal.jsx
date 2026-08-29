import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function QCInspectionDetailsModal({ inspection, onClose }) {
  if (!inspection) return null;

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 'min(94vw, 580px)', maxHeight: '90vh', padding: 0, overflowY: 'auto', borderRadius: '16px' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#24345C', margin: 0 }}>Inspection Record Details</h3>
              <p style={{ fontSize: '11px', color: '#8893A7', margin: '2px 0 0 0' }}>
                Order: {inspection.workOrderId} · Attempt #{inspection.attemptNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #DCE5F0', background: '#F5FAFE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '450px', overflowY: 'auto' }}>
          
          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '8px', fontSize: '12px', color: '#581c87' }}>
              <div>Result: <strong>{inspection.result}</strong></div>
              <div>Inspector: <strong>{inspection.inspectorName}</strong></div>
              <div>Date: <strong>{new Date(inspection.inspectedAt).toLocaleString()}</strong></div>
              <div>Total Inspected: <strong>{inspection.inspectedQuantity} units</strong></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '10px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Approved Qty</label>
              <div className="form-input" style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 'bold' }}>{inspection.approvedQuantity}</div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Rejected Qty</label>
              <div className="form-input" style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 'bold' }}>{inspection.rejectedQuantity}</div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Rework Qty</label>
              <div className="form-input" style={{ background: '#fffbeb', color: '#d97706', fontWeight: 'bold' }}>{inspection.reworkQuantity}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Compressive Strength</label>
              <div className="form-input" style={{ background: '#F5FAFE' }}>{inspection.parameters?.strength || '—'}</div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Dimensional Accuracy</label>
              <div className="form-input" style={{ background: '#F5FAFE' }}>{inspection.parameters?.dimensions || '—'}</div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Weight / Moisture</label>
              <div className="form-input" style={{ background: '#F5FAFE' }}>{inspection.parameters?.weight || '—'}</div>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Defects Found</label>
            <div className="form-input" style={{ background: '#F5FAFE', minHeight: '38px', height: 'auto' }}>
              {inspection.defects?.length > 0 ? inspection.defects.join(', ') : 'None'}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Remarks</label>
            <div className="form-input" style={{ background: '#F5FAFE', minHeight: '60px', height: 'auto' }}>
              {inspection.remarks || 'No remarks provided.'}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #D6E2F0', fontWeight: 'bold' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
