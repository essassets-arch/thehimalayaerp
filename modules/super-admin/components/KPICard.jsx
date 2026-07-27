import React from 'react';

export default function KPICard({ title, value, borderClass = 'border-left-blue', style = {} }) {
  return (
    <div className={`app-card ${borderClass}`} style={{ margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      <span style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 'bold' }}>
        {title}
      </span>
      <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: '4px 0 0 0', color: 'var(--color-text-primary)' }}>
        {value}
      </h3>
    </div>
  );
}
