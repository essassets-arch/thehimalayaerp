'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { financeSalesAnalyticsService } from '../../../services/financeSalesAnalytics.service';
import SalesAnalyticsKpiGrid from './SalesAnalyticsKpiGrid';
import SalespersonPerformancePreview from './SalespersonPerformancePreview';

export default function SalesAnalyticsSummaryCard({ summary: initialSummary }) {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(initialSummary || null);
  const [salespersonsData, setSalespersonsData] = useState([]);
  const [loading, setLoading] = useState(!initialSummary);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const [sumRes, spRes] = await Promise.all([
        financeSalesAnalyticsService.getSummary({ datePreset: 'this_month' }),
        financeSalesAnalyticsService.getSalespersons({ limit: 5 }),
      ]);

      const sum = sumRes?.data?.summary || sumRes?.summary || sumRes?.data;
      if (sum) setSummaryData(sum);

      const sps = spRes?.data?.salespersons || spRes?.salespersons || spRes?.data || [];
      if (Array.isArray(sps)) setSalespersonsData(sps);
    } catch (err) {
      console.warn('[SalesAnalyticsSummaryCard] Failed to load sales analytics overview:', err);
      const status = err?.status || err?.response?.status;
      if (status === 403) {
        setIsForbidden(true);
      } else {
        setError(err.message || 'Unable to load Sales Analytics');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialSummary) {
      fetchData();
    }
  }, [initialSummary, fetchData]);

  if (isForbidden) {
    return null;
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#FFFFFF',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(14,165,233,0.15)',
              border: '1px solid rgba(14,165,233,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#F8FAFC', margin: 0 }}>
              Sales Performance
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0 0' }}>
              Live salesperson revenue & collection view
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/finance/sales-analytics')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
            transition: 'transform 0.2s ease, boxShadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>View Complete Sales Analytics</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: '80px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            ))}
          </div>
          <div
            style={{
              height: '140px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="#F87171" />
            <div>
              <div style={{ fontWeight: '700', color: '#FCA5A5', fontSize: '14px' }}>
                Unable to load Sales Analytics
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                {error}
              </div>
            </div>
          </div>
          <button
            onClick={fetchData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          <SalesAnalyticsKpiGrid summary={summaryData} />
          <SalespersonPerformancePreview salespersons={salespersonsData} />
        </>
      )}
    </div>
  );
}
