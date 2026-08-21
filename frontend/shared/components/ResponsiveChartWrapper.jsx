'use client';

import React from 'react';
import ResponsiveChart from './ResponsiveChart';

export default function ResponsiveChartWrapper({ children, minHeight = 280, height, className = '', ...props }) {
  return (
    <ResponsiveChart
      height={height || minHeight}
      minHeight={minHeight}
      className={className}
      {...props}
    >
      {children}
    </ResponsiveChart>
  );
}
