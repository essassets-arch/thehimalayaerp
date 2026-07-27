import React, { useContext } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import { Download, Printer, Mail, FileSpreadsheet, BarChart2, RefreshCw } from 'lucide-react';
import { exportPDF, exportCSV, printReport } from '../../../utils/export.js';
import SalesAnalyticsTabs from './SalesAnalyticsTabs.jsx';
import SalesAnalyticsFilters from './SalesAnalyticsFilters.jsx';

const SalesAnalyticsHeader = () => {
  const { filters, activeTab } = useContext(SalesAnalyticsContext);

  return (
    <div style={{ background: 'var(--color-card-bg, #ffffff)', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid var(--color-border)', marginBottom: '20px' }}>
      {/* Top Row: Title + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #337a86, #0284c7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>Sales Analytics</h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500', marginTop: '2px' }}>
              Super Admin · Enterprise BI Dashboard · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => exportPDF('sales-analytics-root', `Sales_Analytics_${filters.period}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Download size={13} /> PDF
          </button>
          <button onClick={() => alert('Excel export — connect to backend API')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <FileSpreadsheet size={13} /> Excel
          </button>
          <button onClick={printReport}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#24345C', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Printer size={13} /> Print
          </button>
          <button onClick={() => alert('Email report — connect to backend API')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
            <Mail size={13} /> Email
          </button>
          <button onClick={() => window.location.reload()}
            style={{ padding: '8px 12px', background: '#f1f5f9', color: '#5E6B82', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}
            title="Refresh data">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Tabs + Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <SalesAnalyticsTabs />
        <SalesAnalyticsFilters />
      </div>
    </div>
  );
};

export default SalesAnalyticsHeader;
