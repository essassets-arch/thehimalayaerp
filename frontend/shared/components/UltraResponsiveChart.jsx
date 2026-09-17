'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, ArrowRight } from 'lucide-react';

/**
 * Universal Ultra-Responsive Chart Container
 * 
 * Supports all display formats:
 * - Ultra-Small Mobile: 320px - 480px (optimized margins, compact heights, legible minimum font sizes)
 * - Standard Mobile & Tablets: 481px - 768px
 * - Laptops & Desktops: 769px - 1920px
 * - 2K / 4K Displays: 1921px - 3840px
 * - 8K Ultra-Wide: 3841px - 7680px
 * - 12K Displays: >= 7681px up to 12288px+ (fluid full-width scaling, high-DPI font enlargement, no 2400px clamping)
 * 
 * Guarantees:
 * 1. Zero blank boxes - measures accurately on hydration and resize
 * 2. Elegant, non-disruptive empty state when dataset is empty
 * 3. Supports function-as-child for dynamic typography & stroke scaling:
 *    ({ width, height, scale, isMobile, is12K, is4K }) => <AreaChart ... />
 */
export default function UltraResponsiveChart({
  children,
  height: baseHeight = 280,
  minHeight,
  className = '',
  isEmpty = false,
  emptyTitle = 'No telemetry data recorded for this timeframe',
  emptySubtitle = 'Try selecting another month or aggregate timeframe to inspect active factory telemetry.',
  onSwitchTimeframe = null,
  switchButtonLabel = 'Switch to Active Month',
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState({
    width: 600,
    height: baseHeight,
    scale: 1,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    is4K: false,
    is8K: false,
    is12K: false,
  });

  // Calculate dynamic responsive target height based on screen resolution
  const getDynamicHeight = useCallback((base) => {
    if (typeof window === 'undefined') return base;
    const screenW = window.innerWidth;
    if (screenW >= 7680) return Math.max(minHeight || 0, Math.round(base * 1.85)); // 8K / 12K displays
    if (screenW >= 3840) return Math.max(minHeight || 0, Math.round(base * 1.45)); // 4K / 5K ultrawide
    if (screenW >= 2560) return Math.max(minHeight || 0, Math.round(base * 1.25)); // 2K / QHD
    if (screenW >= 1920) return Math.max(minHeight || 0, Math.round(base * 1.1));  // Full HD
    if (screenW <= 480) return Math.max(minHeight || 180, Math.min(base, 240));    // Mobile
    return Math.max(minHeight || 0, base);
  }, [minHeight]);

  useEffect(() => {
    setMounted(true);

    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const parentW = containerRef.current.parentElement?.clientWidth || 0;
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;

      // Unconstrained full-width responsiveness (allows 12K displays to use their canvas properly)
      // Minimum safe width: 160px (mobile 320px screen width)
      // Maximum: 12000px (allows full utilization on 8K/12K display walls)
      const rawW = Math.floor(rect.width > 0 ? rect.width : (parentW > 0 ? parentW : winW * 0.95));
      const measuredWidth = Math.min(Math.max(160, rawW), 12000);

      const is12K = winW >= 7680;
      const is8K = winW >= 5120 && winW < 7680;
      const is4K = winW >= 2560 && winW < 5120;
      const isTablet = winW > 480 && winW <= 768;
      const isMobile = winW <= 480;
      const isDesktop = !isMobile && !isTablet && !is4K && !is8K && !is12K;

      // Dynamic scale factor for typography, strokes, points, and margins
      const scale = is12K ? 2.2 : is8K ? 1.75 : is4K ? 1.35 : isMobile ? 0.9 : 1.0;
      const measuredHeight = getDynamicHeight(baseHeight);

      setMetrics({
        width: measuredWidth,
        height: measuredHeight,
        scale,
        isMobile,
        isTablet,
        isDesktop,
        is4K,
        is8K,
        is12K,
      });
    };

    measure();
    const animId = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        measure();
      });
      ro.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [baseHeight, getDynamicHeight]);

  const currentHeight = metrics.height || getDynamicHeight(baseHeight);

  return (
    <div
      ref={containerRef}
      className={`ultra-responsive-chart-wrapper ${className}`}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: `${currentHeight}px`,
        minHeight: `${currentHeight}px`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── Active Chart Visualizer ── */}
      {mounted && !isEmpty && (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {typeof children === 'function' ? (
            children({
              width: metrics.width,
              height: currentHeight,
              scale: metrics.scale,
              isMobile: metrics.isMobile,
              isTablet: metrics.isTablet,
              isDesktop: metrics.isDesktop,
              is4K: metrics.is4K,
              is8K: metrics.is8K,
              is12K: metrics.is12K,
            })
          ) : (
            children
          )}
        </div>
      )}

      {/* ── Graceful Empty State (Zero Data for selected month) ── */}
      {mounted && isEmpty && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '10px',
            border: '1px dashed #cbd5e1',
            padding: '24px 16px',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: `${Math.round(44 * metrics.scale)}px`,
              height: `${Math.round(44 * metrics.scale)}px`,
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <BarChart3 size={Math.round(22 * metrics.scale)} />
          </div>
          <div
            style={{
              fontSize: `${Math.round(13.5 * metrics.scale)}px`,
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '4px',
            }}
          >
            {emptyTitle}
          </div>
          <div
            style={{
              fontSize: `${Math.round(11.5 * metrics.scale)}px`,
              color: '#64748b',
              maxWidth: '420px',
              lineHeight: 1.4,
              marginBottom: onSwitchTimeframe ? '14px' : '0',
            }}
          >
            {emptySubtitle}
          </div>
          {onSwitchTimeframe && (
            <button
              type="button"
              onClick={onSwitchTimeframe}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: `${Math.round(7 * metrics.scale)}px ${Math.round(14 * metrics.scale)}px`,
                borderRadius: '8px',
                fontSize: `${Math.round(12 * metrics.scale)}px`,
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{switchButtonLabel}</span>
              <ArrowRight size={Math.round(14 * metrics.scale)} />
            </button>
          )}
        </div>
      )}

      {/* ── Server-Side / Mount Loading State ── */}
      {!mounted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${currentHeight}px`,
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          Initializing visualization...
        </div>
      )}
    </div>
  );
}
