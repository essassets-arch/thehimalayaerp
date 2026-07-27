import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockChartData } from '../../../services/salesAnalytics.service.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend } from 'recharts';

const OrderAnalytics = () => {
  const { filters, chartData } = useContext(SalesAnalyticsContext);
  const data = chartData || mockChartData(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ChartCard title="Daily Orders (This Month)" subtitle="Order count by day">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.dailyOrders} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="orders" name="Orders" fill="#337a86" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order Status Breakdown" subtitle="Monthly status distribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.orderStatus} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="delivered" name="Delivered" stackId="a" fill="#16a34a" />
              <Bar dataKey="production" name="In Production" stackId="a" fill="#f59e0b" />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#0284c7" />
              <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Order Volume Trend (12 Months)" subtitle="Running total + 30-day moving average">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.orderTrend} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            <Area type="monotone" dataKey="orders" name="Orders" stroke="#4f46e5" fill="url(#ordGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="movingAvg" name="30d Avg" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default React.memo(OrderAnalytics);
