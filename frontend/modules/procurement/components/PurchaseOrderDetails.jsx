import React from 'react';
import { ProcurementStatusBadge } from './ProcurementStatusBadge';
import { Calendar, Building2, MapPin } from 'lucide-react';

export function formatProcurementDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function PurchaseOrderDetails({ po }) {
  if (!po) return null;

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Purchase Order: {po.poNumber || po.id}</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Ref Indent: {po.indentId || 'N/A'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ProcurementStatusBadge status={po.status} />
        </div>
      </div>
      
      <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', gap: '8px' }}>
            <Building2 size={16} />
            Vendor Information
          </div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{po.vendorDisplayName || po.vendorName || po.supplier?.name}</p>
        </div>

        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', gap: '8px' }}>
            <Calendar size={16} />
            Important Dates
          </div>
          <div style={{ fontSize: '14px' }}>
            <p style={{ color: '#475569', margin: '0 0 4px 0' }}><span style={{ color: '#94a3b8', display: 'inline-block', width: '80px' }}>Created:</span> <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatProcurementDate(new Date(po.createdAt))}</span></p>
            {po.expectedDeliveryDate && (
              <p style={{ color: '#475569', margin: 0 }}><span style={{ color: '#94a3b8', display: 'inline-block', width: '80px' }}>Delivery:</span> <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatProcurementDate(new Date(po.expectedDeliveryDate))}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
