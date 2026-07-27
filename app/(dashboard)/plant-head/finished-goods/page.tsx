'use client';

import React, { useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { PageSearchInput, StandardActionButtons } from '@/components/GlobalUIComponents';
import '@/components/erp-premium-ui.css';

export default function FinishedGoodsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const items = [
    { id: 'FG-801', name: 'High-Tensile Galvanized Bolts M12', category: 'Fasteners', batchNo: 'B-2026-0711', readyStock: 2500, unit: 'PCS', location: 'Warehouse A-04', dispatchReady: true },
    { id: 'FG-802', name: 'Precision CNC Aluminum Joints', category: 'Structural', batchNo: 'B-2026-0715', readyStock: 450, unit: 'SET', location: 'Warehouse B-12', dispatchReady: true },
    { id: 'FG-803', name: 'Industrial Rubber Gaskets HD-100', category: 'Seals', batchNo: 'B-2026-0719', readyStock: 1200, unit: 'PCS', location: 'Warehouse A-01', dispatchReady: false }
  ];

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <PackageCheck style={{ width: 24, height: 24, color: '#059669' }} />
            Plant Head → Finished Goods Inventory
          </h2>
          <p className="erp-header-subtitle">Live visibility into quality-approved manufactured stock ready for dispatch.</p>
        </div>
        <PageSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search finished product..." />
      </div>

      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Batch No.</th>
                <th>Ready Stock</th>
                <th>Storage Location</th>
                <th>Dispatch Ready</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{i.id}</td>
                  <td style={{ fontWeight: 700, color: '#24345C' }}>{i.name}</td>
                  <td style={{ color: '#475569' }}>{i.category}</td>
                  <td style={{ fontFamily: 'monospace', color: '#334155' }}>{i.batchNo}</td>
                  <td style={{ fontWeight: 800, color: '#047857' }}>{i.readyStock} {i.unit}</td>
                  <td style={{ color: '#475569' }}>{i.location}</td>
                  <td>
                    <span className={`erp-badge ${i.dispatchReady ? 'erp-badge-green' : 'erp-badge-orange'}`}>
                      {i.dispatchReady ? 'Ready for Dispatch' : 'In Packaging'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}><StandardActionButtons compact /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
