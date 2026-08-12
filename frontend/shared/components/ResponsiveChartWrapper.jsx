'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

export default function ResponsiveChartWrapper({ children, minHeight = 280, height, className = '' }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) {
          setContainerWidth(w);
        }
      }
    };

    measure();
    const animationFrame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null;
    if (containerRef.current && observer) {
      observer.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  const containerHeight = height || minHeight;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: containerHeight, minHeight: containerHeight, position: 'relative' }}
    >
      {containerWidth > 0 ? (
        <ResponsiveContainer width={containerWidth} height={containerHeight}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div style={{ width: '100%', height: containerHeight, background: '#f8fafc', borderRadius: '12px' }} />
      )}
    </div>
  );
}


