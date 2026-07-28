import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockProductData } from '../../../services/salesAnalytics.service.js';
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#337a86','#0284c7','#4f46e5','#8b5cf6','#ec4899','#f59e0b','#16a34a','#ea580c'];

const ProductAnalytics = () => {
  const { filters, productData } = useContext(SalesAnalyticsContext);
  const data = productData || mockProductData(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Row 1: Sales by Category Pie + Top Products Horizontal Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
        <ChartCard title="Sales by Category" subtitle="Revenue share — pie chart">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.categories} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.categories.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v}L`, 'Revenue']} contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 10 Products by Revenue" subtitle="Horizontal bar — highest selling">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <YAxis type="category" dataKey="product" tick={{ fontSize: 10, fill: '#334155', fontWeight: '600' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip formatter={(v) => [`₹${v}L`, 'Revenue']} contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#337a86" radius={[0, 6, 6, 0]}>
                {data.topProducts.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Top Selling Table + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <ChartCard title="Top Selling Products" subtitle="Quantity sold and revenue">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#F5FAFE', borderBottom: '2px solid var(--color-border)' }}>
                  {['#', 'Product', 'Category', 'Qty Sold', 'Revenue', 'Avg Price', 'Growth'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topSelling.map((p, idx) => (
                  <tr key={p.product} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : '#fafbfc' }}>
                    <td style={{ padding: '9px 12px', fontWeight: '800', color: '#8893A7' }}>{idx + 1}</td>
                    <td style={{ padding: '9px 12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{p.product}</td>
                    <td style={{ padding: '9px 12px', color: '#5E6B82' }}>{p.category}</td>
                    <td style={{ padding: '9px 12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{p.qty.toLocaleString()}</td>
                    <td style={{ padding: '9px 12px', fontWeight: '800', color: '#16a34a' }}>₹{p.revenue}L</td>
                    <td style={{ padding: '9px 12px', color: 'var(--color-text-secondary)' }}>₹{p.avgPrice}</td>
                    <td style={{ padding: '9px 12px', color: p.growth >= 0 ? '#16a34a' : '#ef4444', fontWeight: '700' }}>
                      {p.growth >= 0 ? '▲' : '▼'} {Math.abs(p.growth)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard title="Category Radar Performance" subtitle="Multi-dimension category score">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data.radarData}>
              <PolarGrid stroke="#DCE5F0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#5E6B82' }} />
              <Tooltip contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              {data.categories.slice(0, 4).map((cat, idx) => (
                <Radar key={cat.name} name={cat.name} dataKey={cat.name.toLowerCase()} stroke={COLORS[idx]} fill={COLORS[idx]} fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default React.memo(ProductAnalytics);
