import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockPaymentData } from '../../../services/salesAnalytics.service.js';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const STATUS_COLORS = { Received: '#16a34a', Pending: '#f59e0b', Overdue: '#ef4444', 'Partial': '#0284c7', Advance: '#8b5cf6' };

const PaymentAnalytics = () => {
  const { filters, paymentData } = useContext(SalesAnalyticsContext);
  const data = paymentData || mockPaymentData(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
        {data.summary.map(s => (
          <div key={s.label} style={{ background: '#F5FAFE', padding: '14px 16px', borderRadius: '10px', borderLeft: `4px solid ${STATUS_COLORS[s.label] || '#337a86'}` }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#24345C' }}>₹{s.amount}L</div>
            <div style={{ fontSize: '11px', color: STATUS_COLORS[s.label] || '#337a86', fontWeight: '700', marginTop: '4px' }}>{s.count} transactions</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Payment Mode Pie */}
        <ChartCard title="Payment Mode Distribution" subtitle="Cash, UPI, Cheque, Transfer…">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.modes} dataKey="amount" nameKey="mode" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}
                label={({ mode, percent }) => `${mode} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.modes.map((_, idx) => <Cell key={idx} fill={['#337a86','#0284c7','#4f46e5','#8b5cf6','#ea580c','#16a34a'][idx % 6]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v}L`, 'Amount']} contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Aging Buckets */}
        <ChartCard title="Receivables Aging Analysis" subtitle="Days overdue — bucket distribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.aging} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip formatter={(v) => [`₹${v}L`, 'Outstanding']} contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="amount" name="Outstanding" radius={[4, 4, 0, 0]}>
                {data.aging.map((b, idx) => <Cell key={idx} fill={['#16a34a','#f59e0b','#ea580c','#ef4444','#7f1d1d'][Math.min(idx, 4)]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly Collections Trend */}
      <ChartCard title="Monthly Collections vs Billings" subtitle="Amount collected vs invoiced over time">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.monthly} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#5E6B82' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
            <Tooltip contentStyle={{ background: '#24345C', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="billed" name="Billed" stroke="#0284c7" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="collected" name="Collected" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="outstanding" name="Outstanding" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Overdue Table */}
      <ChartCard title="Top Overdue Accounts" subtitle="Customers with highest outstanding balances">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#F5FAFE', borderBottom: '2px solid var(--color-border)' }}>
                {['Customer', 'Region', 'Overdue (₹L)', 'Days Overdue', 'Total Orders', 'Last Payment', 'Risk'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.overdueAccounts.map((a, idx) => (
                <tr key={a.customer} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : '#fafbfc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : '#fafbfc'}>
                  <td style={{ padding: '9px 12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{a.customer}</td>
                  <td style={{ padding: '9px 12px', color: '#5E6B82' }}>{a.region}</td>
                  <td style={{ padding: '9px 12px', fontWeight: '800', color: '#ef4444' }}>₹{a.overdue}L</td>
                  <td style={{ padding: '9px 12px', color: a.days > 60 ? '#ef4444' : a.days > 30 ? '#f59e0b' : '#16a34a', fontWeight: '700' }}>{a.days} days</td>
                  <td style={{ padding: '9px 12px' }}>{a.orders}</td>
                  <td style={{ padding: '9px 12px', color: '#5E6B82' }}>{a.lastPayment}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{ background: a.risk === 'High' ? '#fee2e2' : a.risk === 'Medium' ? '#fef9c3' : '#dcfce7', color: a.risk === 'High' ? '#ef4444' : a.risk === 'Medium' ? '#a16207' : '#16a34a', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>{a.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

export default React.memo(PaymentAnalytics);
