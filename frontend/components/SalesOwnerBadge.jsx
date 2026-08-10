import React from 'react';

/**
 * Reusable Sales Owner Badge Component
 * Displays human-readable Sales Executive Name + Email with role indicators
 */
export default function SalesOwnerBadge({ user, fallbackName, fallbackEmail, compact = false }) {
  const name = user?.name || fallbackName || 'Sales Executive';
  const email = user?.email || fallbackEmail || 'sales@himalayaerp.com';
  const isSuperSales = email.toLowerCase().includes('supersales') || name.toLowerCase().includes('supersales');

  return (
    <div
      className={`inline-flex flex-col rounded-lg border px-2.5 py-1 text-left shadow-xs transition-all ${
        isSuperSales
          ? 'bg-purple-50/80 border-purple-200 text-purple-900'
          : 'bg-blue-50/80 border-blue-200 text-slate-800'
      }`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        padding: compact ? '2px 6px' : '4px 8px',
        borderRadius: '6px',
        border: `1px solid ${isSuperSales ? '#E9D5FF' : '#BFDBFE'}`,
        backgroundColor: isSuperSales ? '#FAF5FF' : '#EFF6FF',
        fontSize: compact ? '10px' : '11.5px',
        lineHeight: '1.25',
      }}
      title={`Sales Owner: ${name} (${email})`}
    >
      <div style={{ fontWeight: 600, color: isSuperSales ? '#6B21A8' : '#1E3A8A' }}>
        {name}
      </div>
      <div style={{ fontSize: '9.5px', color: '#64748B', fontFamily: 'monospace', marginTop: '1px' }}>
        {email}
      </div>
    </div>
  );
}
