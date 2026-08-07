'use client';

import React from 'react';
import { DollarSign, Wallet, Activity, AlertTriangle, Users, ShoppingBag, Percent, TrendingUp } from 'lucide-react';

export default function SalesAnalyticsKpiGrid({ summary }) {
  const data = summary || {};

  const formatLakh = (val) => {
    if (val === null || val === undefined || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const kpis = [
    {
      title: 'Confirmed Sales',
      value: formatLakh(data.confirmedSalesValue),
      icon: DollarSign,
      color: '#34D399',
      bgColor: 'rgba(52, 211, 153, 0.1)',
      sub: `${data.totalSalesOrders || 0} Total Orders`,
    },
    {
      title: 'Collected',
      value: formatLakh(data.totalCollectedAmount),
      icon: Wallet,
      color: '#60A5FA',
      bgColor: 'rgba(96, 165, 250, 0.1)',
      sub: 'Verified Receipts',
    },
    {
      title: 'Outstanding',
      value: formatLakh(data.outstandingReceivable),
      icon: Activity,
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.1)',
      sub: 'Pending Dues',
    },
    {
      title: 'Overdue',
      value: formatLakh(data.overdueReceivable),
      icon: AlertTriangle,
      color: '#F87171',
      bgColor: 'rgba(248, 113, 113, 0.1)',
      sub: 'Past Due Date',
    },
    {
      title: 'Active Salespeople',
      value: `${data.activeSalespersons || 0}${data.totalSalespersons ? ` / ${data.totalSalespersons}` : ''}`,
      icon: Users,
      color: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.1)',
      sub: 'Team Members',
    },
    {
      title: 'Orders',
      value: data.totalSalesOrders ?? 0,
      icon: ShoppingBag,
      color: '#818CF8',
      bgColor: 'rgba(129, 140, 248, 0.1)',
      sub: 'Generated Orders',
    },
    {
      title: 'Conversion Rate',
      value: data.leadConversionRate !== undefined ? `${data.leadConversionRate}%` : 'N/A',
      icon: Percent,
      color: '#C084FC',
      bgColor: 'rgba(192, 132, 252, 0.1)',
      sub: 'Lead to Order',
    },
    {
      title: 'Collection Efficiency',
      value: data.collectionEfficiency !== undefined ? `${data.collectionEfficiency}%` : 'N/A',
      icon: TrendingUp,
      color: '#34D399',
      bgColor: 'rgba(52, 211, 153, 0.1)',
      sub: 'Collected vs Invoiced',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              transition: 'transform 0.2s ease, borderColor 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8' }}>{kpi.title}</span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: kpi.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color,
                }}
              >
                <Icon size={16} />
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: kpi.color, letterSpacing: '-0.02em' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{kpi.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
