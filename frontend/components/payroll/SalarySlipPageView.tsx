'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { payrollService } from '@/services/payroll/payrollService';
import { SalarySlipDocument } from './SalarySlipDocument';

interface SalarySlipPageViewProps {
  structureId: string;
}

export function SalarySlipPageView({ structureId }: SalarySlipPageViewProps) {
  const [structure, setStructure] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function fetchStructure() {
      setLoading(true);
      setError('');
      try {
        const data = await payrollService.getSalaryStructure(structureId);
        if (isMounted) {
          setStructure(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load salary slip statement.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (structureId) {
      void fetchStructure();
    }

    return () => {
      isMounted = false;
    };
  }, [structureId]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Loading Official Salary Statement...</p>
      </div>
    );
  }

  if (error || !structure) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚠️</div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Statement Not Found</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{error || 'Unable to find the requested salary structure.'}</p>
        <Link
          href="/hr/salary/prepare"
          style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '10px 18px',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          ← Back to Salary Register
        </Link>
      </div>
    );
  }

  return <SalarySlipDocument structure={structure} isModal={false} />;
}
