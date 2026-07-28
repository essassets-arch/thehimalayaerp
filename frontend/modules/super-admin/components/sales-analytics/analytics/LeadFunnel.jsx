import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockFunnelData } from '../../../services/salesAnalytics.service.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FUNNEL_COLORS = ['#337a86','#0284c7','#4f46e5','#8b5cf6','#ec4899','#f59e0b','#16a34a','#ea580c','#24345C'];

const FunnelStage = ({ stage, value, prev, color, isFirst }) => {
  const pct = prev && prev > 0 ? ((value / prev) * 100).toFixed(0) : 100;
  const dropOff = prev && prev > 0 ? prev - value : 0;
  const width = prev && prev > 0 ? Math.max(40, (value / prev) * 100) : 100;

  return (
    <div style={{ marginBottom: '6px', position: 'relative' }}>
      {!isFirst && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', paddingLeft: '20px' }}>
          <div style={{ width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `10px solid ${color}40`, marginLeft: '0' }} />
          <span style={{ fontSize: '10.5px', color: '#8893A7', fontWeight: '600' }}>
            {pct}% conversion · {dropOff.toLocaleString()} dropped
          </span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: `${width}%`, background: color, borderRadius: '8px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'width 0.6s ease', minWidth: '200px' }}>
          <span style={{ color: '#fff', fontWeight: '800', fontSize: '13px' }}>{stage}</span>
          <span style={{ color: '#fff', fontWeight: '900', fontSize: '15px' }}>{value.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const LeadFunnel = () => {
  const { filters, funnelData } = useContext(SalesAnalyticsContext);
  const data = funnelData || mockFunnelData(filters);

  const overallConv = data.stages.length > 1
    ? ((data.stages[data.stages.length - 1].value / data.stages[0].value) * 100).toFixed(1)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Funnel Visual */}
        <ChartCard title="Lead Funnel" subtitle={`Overall conversion: ${overallConv}% (${data.stages[0].value.toLocaleString()} → ${data.stages[data.stages.length - 1].value.toLocaleString()})`}>
          <div style={{ padding: '8px 0' }}>
            {data.stages.map((s, idx) => (
              <FunnelStage
                key={s.stage}
                stage={s.stage}
                value={s.value}
                prev={idx > 0 ? data.stages[idx - 1].value : null}
                color={FUNNEL_COLORS[idx % FUNNEL_COLORS.length]}
                isFirst={idx === 0}
              />
            ))}
          </div>
        </ChartCard>

        {/* Stage Bar Chart */}
        <ChartCard title="Stage Volumes" subtitle="Count at each pipeline stage">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.stages} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 110 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: '#334155', fontWeight: '600' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip
                formatter={(val) => [val.toLocaleString(), 'Count']}
                contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', fontSize: '12px', color: '#fff' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.stages.map((_, idx) => (
                  <Cell key={idx} fill={FUNNEL_COLORS[idx % FUNNEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Conversion Rate Table */}
      <ChartCard title="Stage-by-Stage Conversion Rates" subtitle="Dropout analysis at each stage">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#F5FAFE', borderBottom: '2px solid var(--color-border)' }}>
                {['Stage', 'Count', 'Conversion from Prev', 'Drop-off', 'Avg Days in Stage'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.stages.map((s, idx) => {
                const prev = idx > 0 ? data.stages[idx - 1].value : null;
                const conv = prev ? `${((s.value / prev) * 100).toFixed(1)}%` : '—';
                const drop = prev ? (prev - s.value).toLocaleString() : '—';
                return (
                  <tr key={s.stage} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : '#fafbfc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }}>{s.stage}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{s.value.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: idx === 0 ? '#8893A7' : (parseFloat(conv) > 70 ? '#16a34a' : parseFloat(conv) > 40 ? '#f59e0b' : '#ef4444'), fontWeight: '700' }}>{conv}</td>
                    <td style={{ padding: '10px 14px', color: '#ef4444', fontWeight: '600' }}>{drop}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{s.avgDays ?? '—'} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

export default React.memo(LeadFunnel);
