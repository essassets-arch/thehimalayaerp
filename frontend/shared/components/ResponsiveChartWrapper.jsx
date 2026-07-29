'use client';

import { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

export default function ResponsiveChartWrapper({ children, minHeight = 200, className = '' }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      setReady(width > 0 && height > 0);
    };

    update();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(update)
      : null;
    observer?.observe(element);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minWidth: 0, minHeight }}
    >
      {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
