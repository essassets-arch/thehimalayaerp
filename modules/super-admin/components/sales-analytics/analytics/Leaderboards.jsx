import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockLeaderboardData } from '../../../services/salesAnalytics.service.js';
import { Award, TrendingUp, Users } from 'lucide-react';

const Medal = ({ rank }) => {
  const colors = { 1: '#f59e0b', 2: '#8893A7', 3: '#ea580c' };
  const labels = { 1: '🥇', 2: '🥈', 3: '🥉' };
  if (rank <= 3) return <span style={{ fontSize: '16px' }}>{labels[rank]}</span>;
  return <span style={{ fontWeight: '800', color: '#8893A7', fontSize: '12px' }}>{rank}</span>;
};

const Bar = ({ pct, color = '#337a86' }) => (
  <div style={{ background: '#f1f5f9', borderRadius: '999px', height: '6px', overflow: 'hidden', minWidth: '80px' }}>
    <div style={{ height: '100%', background: color, borderRadius: '999px', width: `${pct}%`, transition: 'width 0.6s ease' }} />
  </div>
);

const LeaderTable = ({ title, icon, data, columns, color = '#337a86' }) => (
  <ChartCard title={title} subtitle={`Top ${data.length} ranked by performance`}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
        <thead>
          <tr style={{ background: '#F5FAFE', borderBottom: '2px solid var(--color-border)' }}>
            {columns.map(c => (
              <th key={c} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)', background: idx < 3 ? `${color}06` : (idx % 2 === 0 ? 'transparent' : '#fafbfc'), transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
              onMouseLeave={e => e.currentTarget.style.background = idx < 3 ? `${color}06` : (idx % 2 === 0 ? 'transparent' : '#fafbfc')}>
              <td style={{ padding: '9px 12px', textAlign: 'center' }}><Medal rank={idx + 1} /></td>
              {row.cells.map((cell, ci) => (
                <td key={ci} style={{ padding: '9px 12px', color: 'var(--color-text-primary)', fontWeight: ci === 0 ? '700' : '500' }}>
                  {cell.bar ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ minWidth: '36px', fontWeight: '700' }}>{cell.value}</span>
                      <Bar pct={cell.bar} color={color} />
                    </div>
                  ) : cell.badge ? (
                    <span style={{ background: `${color}20`, color, padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>{cell.value}</span>
                  ) : cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ChartCard>
);

const Leaderboards = () => {
  const { filters, leaderboardData } = useContext(SalesAnalyticsContext);
  const data = leaderboardData || mockLeaderboardData(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Employees */}
      <LeaderTable
        title="🏆 Sales Employee Leaderboard"
        color="#337a86"
        columns={['#', 'Employee', 'Zone', 'Revenue', 'Orders', 'Leads', 'Conv. Rate', 'Avg Deal']}
        data={data.employees.map(e => ({
          cells: [
            { value: e.name },
            { value: e.zone },
            { value: `₹${e.revenue}L`, bar: e.revPct, bar: e.revPct },
            { value: e.orders },
            { value: e.leads },
            { value: `${e.conv}%`, badge: true },
            { value: `₹${e.avgDeal}K` }
          ]
        }))}
      />

      {/* Top Customers */}
      <LeaderTable
        title="🏢 Top Customers by Revenue"
        color="#4f46e5"
        columns={['#', 'Customer', 'Region', 'Orders', 'Revenue', 'Outstanding', 'Last Order', 'Status']}
        data={data.customers.map(c => ({
          cells: [
            { value: c.name },
            { value: c.region },
            { value: c.orders },
            { value: `₹${c.revenue}L`, bar: c.revPct },
            { value: `₹${c.outstanding}L` },
            { value: c.lastOrder },
            { value: c.status, badge: true }
          ]
        }))}
      />

      {/* Top Products */}
      <LeaderTable
        title="📦 Top Products Leaderboard"
        color="#16a34a"
        columns={['#', 'Product', 'Category', 'Qty', 'Revenue', 'Margin', 'Returns']}
        data={data.products.map(p => ({
          cells: [
            { value: p.name },
            { value: p.category },
            { value: p.qty.toLocaleString() },
            { value: `₹${p.revenue}L`, bar: p.revPct },
            { value: `${p.margin}%`, badge: true },
            { value: `${p.returns}%` }
          ]
        }))}
      />
    </div>
  );
};

export default React.memo(Leaderboards);
