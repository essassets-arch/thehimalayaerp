import React, { useContext } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import { BarChart2, Table2 } from 'lucide-react';

const TAB_CONFIG = [
  { id: 'analytics', label: 'Analytics', icon: BarChart2, desc: 'Executive Dashboard' },
  { id: 'explorer', label: 'Data Explorer', icon: Table2, desc: 'Drill-down Tables' },
];

const SalesAnalyticsTabs = () => {
  const { activeTab, setActiveTab } = useContext(SalesAnalyticsContext);

  return (
    <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', gap: '2px', border: '1px solid var(--color-border)' }}>
      {TAB_CONFIG.map(tab => {
        const active = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px',
              background: active ? '#fff' : 'transparent',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              boxShadow: active ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
              transition: 'all 0.2s ease',
              color: active ? '#337a86' : '#5E6B82',
              fontWeight: active ? '800' : '600',
              fontSize: '13.5px',
            }}>
            <Icon size={15} style={{ color: active ? '#337a86' : '#8893A7' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ lineHeight: '1.2' }}>{tab.label}</div>
              <div style={{ fontSize: '10px', fontWeight: '500', color: active ? '#64a2ab' : '#8893A7', lineHeight: '1.2' }}>{tab.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SalesAnalyticsTabs;
