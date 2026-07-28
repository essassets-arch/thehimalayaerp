import React from 'react';
import KPICard from './KPICard';

export default function DepartmentKPI({ data = [] }) {
  const borderClasses = [
    'border-left-blue',
    'border-left-emerald',
    'border-left-purple',
    'border-left-amber',
    'border-left-pink',
    'border-left-blue'
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
      {data.map((item, idx) => (
        <KPICard
          key={idx}
          title={item.title}
          value={item.value}
          borderClass={item.borderClass || borderClasses[idx % borderClasses.length]}
          style={item.style}
        />
      ))}
    </div>
  );
}
