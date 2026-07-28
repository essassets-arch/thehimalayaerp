import React from 'react';

export default function DepartmentHeader({ title, subtitle, onBack }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>{title}</h2>
        <span style={{ fontSize: '11px', color: '#475569' }}>{subtitle}</span>
      </div>
      {onBack && (
        <button
          className="action-btn"
          style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={onBack}
        >
          ← Back
        </button>
      )}
    </div>
  );
}
