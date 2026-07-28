import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockRegionalData } from '../../../services/salesAnalytics.service.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const REGION_COLORS = { North: '#337a86', South: '#0284c7', East: '#4f46e5', West: '#ea580c', Central: '#8b5cf6' };

const RegionalAnalytics = () => {
  const { filters, regionalData } = useContext(SalesAnalyticsContext);
  const data = regionalData || mockRegionalData(filters);

  const totalRevenue = data.regions.reduce((s, r) => s + r.revenue, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Region Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
        {data.regions.map(r => (
          <div key={r.name} style={{ background: '#F5FAFE', padding: '14px 16px', borderRadius: '10px', borderLeft: `4px solid ${REGION_COLORS[r.name] || '#337a86'}`, border: `1px solid ${(REGION_COLORS[r.name] || '#337a86')}20` }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', marginBottom: '8px' }}>{r.name}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#24345C' }}>₹{r.revenue}L</div>
            <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '4px' }}>{((r.revenue / totalRevenue) * 100).toFixed(1)}% share</div>
            <div style={{ fontSize: '11px', color: r.growth >= 0 ? '#16a34a' : '#ef4444', fontWeight: '700', marginTop: '4px' }}>
              {r.growth >= 0 ? '▲' : '▼'} {Math.abs(r.growth)}% YoY
            </div>
          </div>
        ))}
      </div>

      {/* Region Bar + Monthly Line */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ChartCard title="Region Comparison" subtitle="Revenue vs Target by zone">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.regions} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip formatter={(v) => [`₹${v}L`]} contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#337a86" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#DCE5F0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Regional Trend (Monthly)" subtitle="All zones over 12 months">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthlyByRegion} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              {Object.keys(REGION_COLORS).map(region => (
                <Line key={region} type="monotone" dataKey={region.toLowerCase()} name={region} stroke={REGION_COLORS[region]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* City-Level Breakdown Table */}
      <ChartCard title="City-Level Breakdown" subtitle="Revenue and order metrics by city">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#F5FAFE', borderBottom: '2px solid var(--color-border)' }}>
                {['City', 'Region', 'Orders', 'Revenue', 'Customers', 'Avg Order', 'Growth', 'Sales Rep'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.cities.map((c, idx) => (
                <tr key={c.city} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : '#fafbfc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : '#fafbfc'}>
                  <td style={{ padding: '9px 12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{c.city}</td>
                  <td style={{ padding: '9px 12px' }}><span style={{ background: `${REGION_COLORS[c.region] || '#337a86'}20`, color: REGION_COLORS[c.region] || '#337a86', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>{c.region}</span></td>
                  <td style={{ padding: '9px 12px', fontWeight: '700' }}>{c.orders.toLocaleString()}</td>
                  <td style={{ padding: '9px 12px', fontWeight: '800', color: '#16a34a' }}>₹{c.revenue}L</td>
                  <td style={{ padding: '9px 12px' }}>{c.customers.toLocaleString()}</td>
                  <td style={{ padding: '9px 12px', color: '#5E6B82' }}>₹{c.avgOrder}K</td>
                  <td style={{ padding: '9px 12px', color: c.growth >= 0 ? '#16a34a' : '#ef4444', fontWeight: '700' }}>{c.growth >= 0 ? '▲' : '▼'} {Math.abs(c.growth)}%</td>
                  <td style={{ padding: '9px 12px', color: '#5E6B82' }}>{c.rep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

export default React.memo(RegionalAnalytics);
