'use client';

import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { PageSearchInput, StandardActionButtons } from '@/components/GlobalUIComponents';
import '@/components/erp-premium-ui.css';

export default function StoreReportsPage() {
  const [activeReport, setActiveReport] = useState<'monthly' | 'daily' | 'weekly'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');

  const monthlyStockData = [
    { code: 'RM-STEEL-01', material: 'Steel Rods 24mm Grade 80', unit: 'MT', openingStock: 120, received: 45, issued: 30, closingStock: 135 },
    { code: 'RM-ALUM-04', material: 'Aluminum Billets AL-6061', unit: 'MT', openingStock: 80, received: 20, issued: 50, closingStock: 50 },
    { code: 'RM-RUBBER-10', material: 'Industrial Neoprene Gaskets', unit: 'PCS', openingStock: 5000, received: 2000, issued: 3500, closingStock: 3500 }
  ];

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <FileSpreadsheet style={{ width: 24, height: 24, color: '#059669' }} />
            Store Inventory & Stock Reports
          </h2>
          <p className="erp-header-subtitle">Audit daily material issues, weekly threshold alerts, and monthly stock ledgers.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveReport('monthly')}
            className={`erp-btn erp-btn-sm ${activeReport === 'monthly' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
            type="button"
          >
            Monthly Stock Report
          </button>
          <button
            onClick={() => setActiveReport('daily')}
            className={`erp-btn erp-btn-sm ${activeReport === 'daily' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
            type="button"
          >
            Daily Issue Report
          </button>
          <button
            onClick={() => setActiveReport('weekly')}
            className={`erp-btn erp-btn-sm ${activeReport === 'weekly' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
            type="button"
          >
            Weekly Threshold Report
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search material..." />
        <StandardActionButtons 
          onDownload={() => alert('Downloading report PDF...')}
          onShare={() => alert('Sharing report...')}
          onPrint={() => window.print()}
        />
      </div>

      <div className="erp-table-card">
        {activeReport === 'monthly' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Material Description</th>
                  <th>Unit</th>
                  <th>Opening Stock</th>
                  <th>Received</th>
                  <th>Issued</th>
                  <th>Closing Stock</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStockData.map(m => (
                  <tr key={m.code}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#24345C' }}>{m.code}</td>
                    <td style={{ fontWeight: 700, color: '#24345C' }}>{m.material}</td>
                    <td style={{ color: '#475569' }}>{m.unit}</td>
                    <td style={{ fontWeight: 700, color: '#4f46e5' }}>{m.openingStock}</td>
                    <td style={{ fontWeight: 700, color: '#047857' }}>+{m.received}</td>
                    <td style={{ fontWeight: 700, color: '#b45309' }}>-{m.issued}</td>
                    <td style={{ fontWeight: 800, color: '#24345C', background: '#F5FAFE' }}>{m.closingStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport !== 'monthly' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5E6B82', fontSize: '13px', fontStyle: 'italic' }}>
            Displaying {activeReport === 'daily' ? 'Daily Issue Logs' : 'Weekly Stock Re-order Threshold Alerts'}. All systems healthy.
          </div>
        )}
      </div>
    </div>
  );
}
