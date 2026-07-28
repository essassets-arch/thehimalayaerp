'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { StandardActionButtons, PageSearchInput } from '@/components/GlobalUIComponents';
import '@/components/erp-premium-ui.css';

export default function ProductApprovalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([
    { id: 'PA-001', name: 'High-Tensile Galvanized Steel Rods 24mm', category: 'Raw Materials', requestedBy: 'R&D Team', targetDate: '2026-08-01', status: 'PENDING_APPROVAL', specs: 'Grade 80, 24mm diameter, Anti-Corrosive' },
    { id: 'PA-002', name: 'Precision CNC Aluminum Joint Couplers', category: 'Finished Components', requestedBy: 'Tooling Dept', targetDate: '2026-08-05', status: 'PENDING_APPROVAL', specs: 'AL-6061, Hard Anodized' },
    { id: 'PA-003', name: 'Industrial Rubber Gaskets HD-100', category: 'Sealing Materials', requestedBy: 'Store Manager', targetDate: '2026-07-28', status: 'APPROVED', specs: 'Neoprene, High Temp Resistant up to 200°C' }
  ]);

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    setProducts(products.map(p => p.id === id ? { ...p, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : p));
    alert(`Product ${id} ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully!`);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <ShieldCheck style={{ width: 24, height: 24, color: '#4f46e5' }} />
            Plant Head → Product Approval
          </h2>
          <p className="erp-header-subtitle">Review new product designs, raw material specifications, and component approvals.</p>
        </div>
        <PageSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search product or requester..." />
      </div>

      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Requested By</th>
                <th>Target Date</th>
                <th>Specifications</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{p.id}</td>
                  <td style={{ fontWeight: 700, color: '#24345C' }}>{p.name}</td>
                  <td style={{ color: '#475569' }}>{p.category}</td>
                  <td style={{ color: '#334155' }}>{p.requestedBy}</td>
                  <td style={{ fontWeight: 600, color: '#24345C' }}>{p.targetDate}</td>
                  <td style={{ color: '#5E6B82', fontSize: '12px' }}>{p.specs}</td>
                  <td>
                    <span className={`erp-badge ${
                      p.status === 'APPROVED' ? 'erp-badge-green' :
                      p.status === 'REJECTED' ? 'erp-badge-red' : 'erp-badge-orange'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {p.status === 'PENDING_APPROVAL' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleAction(p.id, 'APPROVE')} className="erp-btn erp-btn-sm erp-btn-success" type="button">
                          Approve
                        </button>
                        <button onClick={() => handleAction(p.id, 'REJECT')} className="erp-btn erp-btn-sm erp-btn-danger" type="button">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <StandardActionButtons compact />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
