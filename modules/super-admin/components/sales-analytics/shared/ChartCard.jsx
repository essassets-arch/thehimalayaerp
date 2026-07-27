import React from 'react';

const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: '340px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {subtitle}
          </span>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default React.memo(ChartCard);
