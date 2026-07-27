import React from 'react';

export default function ModulePlaceholder({ title, description, route }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '320px',
      padding: '48px 24px',
      textAlign: 'center',
      background: 'linear-gradient(145deg, #F5FAFE 0%, #EFF6FF 100%)',
      borderRadius: '16px',
      border: '2px dashed #D6E2F0',
    }}>
      {/* Icon */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '20px',
        background: 'linear-gradient(135deg, #e0f2fe, #bfdbfe)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px', fontSize: '36px',
        boxShadow: '0 8px 24px rgba(47, 67, 117, 0.12)',
      }}>
        🚧
      </div>

      {/* Badge */}
      <span style={{
        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
        background: '#FEF3C7', color: '#92400E', fontSize: '11px',
        fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        Coming Soon
      </span>

      {/* Title */}
      <h2 style={{
        margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800',
        color: '#24345C', letterSpacing: '-0.3px',
      }}>
        {title}
      </h2>

      {/* Description */}
      <p style={{
        margin: '0 0 20px 0', fontSize: '14px', color: '#5E6B82',
        maxWidth: '380px', lineHeight: '1.6',
      }}>
        {description || 'This module is under active development and will be available soon.'}
      </p>

      {/* Route pill */}
      {route && (
        <code style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: '8px',
          background: '#EFF6FF', color: '#2563EB', fontSize: '12px',
          fontWeight: '600', border: '1px solid #BFDBFE',
          fontFamily: 'monospace',
        }}>
          {route}
        </code>
      )}
    </div>
  );
}
