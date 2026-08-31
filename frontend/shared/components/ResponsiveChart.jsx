'use client';

import React, { useState, useEffect, useRef, useMemo, cloneElement, isValidElement } from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * Universal Master ResponsiveChart component for all ERP Dashboards & Analytics Pages.
 * 
 * Capabilities:
 * - Fluid auto-scaling across Mobile (320px-480px), Tablet (768px), Laptop (1080p), 2K (1440p), 4K (2160p), and 8K (4320p)
 * - Zero-blank guarantee: never renders a blank box even before ResizeObserver fires
 * - Clean non-obstructive empty states only when dataset is explicitly empty []
 * - Dynamic font, margin, radius, and stroke scaling for high-DPI, mobile, and ultra-wide screens
 */
export default function ResponsiveChart({
  children,
  height: baseHeight = 320,
  minHeight,
  className = '',
  emptyTitle = 'No telemetry data available',
  emptySubtitle = 'No records found for the selected time range or filter.',
  allowEmptyFallback = false,
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: 600,
    height: baseHeight,
    isMobile: false,
    is4K: false,
    is8K: false,
    scale: 1,
  });

  // Calculate dynamic responsive target height based on screen resolution
  const getDynamicHeight = (base) => {
    if (typeof window === 'undefined') return base;
    const screenW = window.innerWidth;
    if (screenW >= 5120) return Math.round(base * 2.2); // 8K / 5K ultrawide
    if (screenW >= 2560) return Math.round(base * 1.5); // 4K / QHD
    if (screenW >= 1920) return Math.round(base * 1.15); // Full HD
    if (screenW <= 480) return Math.max(220, Math.min(base, 260)); // Mobile
    return base;
  };

  useEffect(() => {
    setMounted(true);

    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const parentWidth = containerRef.current.parentElement?.clientWidth || 0;
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

      // Determine robust width (never 0)
      const measuredWidth = Math.floor(
        rect.width > 0 ? rect.width : (parentWidth > 0 ? parentWidth : Math.max(200, windowWidth * 0.9))
      );

      const is8K = windowWidth >= 5120;
      const is4K = windowWidth >= 2560 && windowWidth < 5120;
      const isMobile = windowWidth <= 640;
      const scale = is8K ? 2.0 : is4K ? 1.5 : isMobile ? 0.9 : windowWidth >= 1920 ? 1.15 : 1.0;

      const dynamicTargetHeight = getDynamicHeight(baseHeight);
      const measuredHeight = Math.max(
        minHeight || dynamicTargetHeight,
        rect.height > 50 ? Math.floor(rect.height) : dynamicTargetHeight
      );

      setDimensions({
        width: Math.max(150, measuredWidth),
        height: measuredHeight,
        isMobile,
        is4K,
        is8K,
        scale,
      });
    };

    measure();
    const animId = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        measure();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [baseHeight, minHeight]);

  // Inspect child chart data safely
  const { hasData, isChildValid } = useMemo(() => {
    if (!isValidElement(children)) return { hasData: true, isChildValid: false };
    const chartProps = children.props || {};
    const chartData = chartProps.data;

    if (chartData === undefined) {
      return { hasData: true, isChildValid: true };
    }

    if (Array.isArray(chartData)) {
      return { hasData: chartData.length > 0, isChildValid: true };
    }

    return { hasData: true, isChildValid: true };
  }, [children]);

  // Clone children and inject fluid responsive dimensions + scale props
  const renderedChart = useMemo(() => {
    if (!isChildValid || !isValidElement(children)) return null;

    const currentMargin = children.props?.margin;
    const defaultMargin = {
      top: Math.round(10 * dimensions.scale),
      right: Math.round(dimensions.isMobile ? 10 : 16 * dimensions.scale),
      left: Math.round(dimensions.isMobile ? -10 : 0),
      bottom: Math.round(10 * dimensions.scale),
    };

    return cloneElement(children, {
      width: dimensions.width,
      height: dimensions.height,
      margin: currentMargin || defaultMargin,
    });
  }, [children, dimensions, isChildValid]);

  const targetHeight = getDynamicHeight(baseHeight);

  return (
    <div
      ref={containerRef}
      className={`responsive-chart-container master-chart-wrapper ${className}`}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: `${dimensions.height || targetHeight}px`,
        minHeight: `${minHeight || targetHeight}px`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Active Chart Rendering */}
      {dimensions.width > 0 && renderedChart}

      {/* Empty Fallback when explicitly requested and data is empty [] */}
      {mounted && !hasData && allowEmptyFallback && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(248, 250, 252, 0.92)',
            backdropFilter: 'blur(3px)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            zIndex: 5,
            border: '1px dashed rgba(203, 213, 225, 0.8)',
          }}
        >
          <div
            style={{
              width: `${Math.round(40 * dimensions.scale)}px`,
              height: `${Math.round(40 * dimensions.scale)}px`,
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
            }}
          >
            <BarChart3 size={Math.round(20 * dimensions.scale)} />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: `${Math.round(12.5 * dimensions.scale)}px`,
              color: '#334155',
            }}
          >
            {emptyTitle}
          </span>
          <span
            style={{
              fontSize: `${Math.round(11 * dimensions.scale)}px`,
              color: '#64748b',
              marginTop: '4px',
              maxWidth: '340px',
            }}
          >
            {emptySubtitle}
          </span>
        </div>
      )}
    </div>
  );
}
