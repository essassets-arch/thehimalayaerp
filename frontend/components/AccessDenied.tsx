'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface AccessDeniedProps {
  requiredRole?: string;
  message?: string;
}

export default function AccessDenied({ requiredRole, message }: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      fontFamily: "'Outfit', sans-serif",
      padding: '40px 20px',
      color: '#1e293b'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
      }}>
        {/* Shield Icon with animation */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#ef4444',
          marginBottom: '24px',
          boxShadow: '0 8px 16px rgba(239, 68, 68, 0.15)'
        }}>
          <ShieldAlert size={36} />
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 12px 0',
          letterSpacing: '-0.5px'
        }}>
          Access Denied
        </h1>

        <p style={{
          fontSize: '14.5px',
          color: '#475569',
          lineHeight: '1.6',
          margin: '0 0 28px 0'
        }}>
          {message || 'You do not have the required permissions to view this page.'}
          {requiredRole && (
            <span style={{ display: 'block', marginTop: '8px', fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>
              Requires Role: {requiredRole}
            </span>
          )}
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#334155',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: '#0f172a',
              color: 'white',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Home size={16} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}
