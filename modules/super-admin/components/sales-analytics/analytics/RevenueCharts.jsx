import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockChartData } from '../../../services/salesAnalytics.service.js';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const COLORS = { primary: '#337a86', secondary: '#0284c7', accent: '#4f46e5', success: '#16a34a', warning: '#f59e0b' };

const CustomTooltip = ({ active, payload, label, prefix = '₹', suffix = 'L' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#24345C', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>
      <p style={{ fontWeight: '700', marginBottom: '6px', color: '#8893A7' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{prefix}{p.value?.toLocaleString()}{suffix}</strong>
        </p>
      ))}
    </div>
  );
};

const RevenueCharts = () => {
  const { filters, chartData } = useContext(SalesAnalyticsContext);
  const data = chartData || mockChartData(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Row 1: Monthly Revenue Trend + Daily Revenue Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ChartCard title="Monthly Revenue Trend" subtitle="Revenue vs Target by Month">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyRevenue} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="revenue" name="Actual" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#DCE5F0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Revenue (This Month)" subtitle="Day-by-day cumulative area">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.dailyRevenue} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.primary} fill="url(#revGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Quarterly Comparison + YoY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ChartCard title="Quarterly Revenue Comparison" subtitle="Q1–Q4 across years">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.quarterly} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="y2023" name="FY 2023-24" fill="#DCE5F0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="y2024" name="FY 2024-25" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="y2025" name="FY 2025-26" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Year-on-Year Growth (%)" subtitle="Annual revenue growth rate">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.yoyGrowth} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip prefix="" suffix="%" />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
              <Line type="monotone" dataKey="growth" name="YoY Growth" stroke={COLORS.success} strokeWidth={3} dot={{ fill: COLORS.success, r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Revenue by Category grouped bar + Revenue Mix Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
        <ChartCard title="Revenue by Category — Monthly" subtitle="Stacked view per product category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.categoryMonthly} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="tiles" name="Tiles" stackId="a" fill={COLORS.primary} />
              <Bar dataKey="bricks" name="Bricks" stackId="a" fill={COLORS.secondary} />
              <Bar dataKey="blocks" name="Blocks" stackId="a" fill={COLORS.accent} />
              <Bar dataKey="cement" name="Cement" stackId="a" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trends by Region" subtitle="All regions — monthly line">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.regionMonthly} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="north" name="North" stroke={COLORS.primary} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="south" name="South" stroke={COLORS.secondary} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="east" name="East" stroke={COLORS.accent} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="west" name="West" stroke={COLORS.warning} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default React.memo(RevenueCharts);
