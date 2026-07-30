import React from 'react';
import { X, FileText } from 'lucide-react';

export default function BrandAnalysisViewModal({ request, onClose }) {
  if (!request) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '24px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Request Details</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>{request.requestNumber}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Product Name</div>
              <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>{request.productName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Brand Name</div>
              <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>{request.brandName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>PO Number</div>
              <div style={{ fontSize: '15px', color: '#111827', fontFamily: 'monospace' }}>{request.poNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Invoice Number</div>
              <div style={{ fontSize: '15px', color: '#111827', fontFamily: 'monospace' }}>{request.invoiceNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Vendor Name</div>
              <div style={{ fontSize: '15px', color: '#111827' }}>{request.vendorName || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Quantity</div>
              <div style={{ fontSize: '15px', color: '#111827' }}>{request.quantity || '-'}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Store Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '2px' }}>Requested By</div>
                <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>{request.createdBy?.name || 'Unknown User'}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{request.createdBy?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '2px' }}>Store / Warehouse</div>
                <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>{request.store?.name || 'Unknown Store'}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{request.store?.location}</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Remarks</div>
            <div style={{ fontSize: '14px', color: '#374151', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
              {request.remarks || 'No remarks provided.'}
            </div>
          </div>

          {request.invoiceFile && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Attached Document</div>
              <a 
                href={request.invoiceFile} 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px', 
                  padding: '10px 16px', background: '#eff6ff', color: '#2563eb', 
                  borderRadius: '8px', textDecoration: 'none', fontWeight: '500' 
                }}
              >
                <FileText size={18} />
                View Invoice Document
              </a>
            </div>
          )}
        </div>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#374151' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
