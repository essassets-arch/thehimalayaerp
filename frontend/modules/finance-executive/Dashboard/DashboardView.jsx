'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ResponsiveContainer, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export default function DashboardView() {
  const navigate = useRouter();
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState([]);
  const [pending, setPending] = useState([]);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, chartRes, pendingRes, agingRes] = await Promise.all([
        apiClient.get('/v1/finance-executive/dashboard/kpis'),
        apiClient.get('/v1/finance-executive/aging-chart'),
        apiClient.get('/v1/finance-executive/dashboard/pending'),
        apiClient.get('/v1/finance-executive/aging-summary')
      ]);

      if (kpiRes.success) setKpis(kpiRes.data);
      if (chartRes.success) setCharts(chartRes.data);
      if (pendingRes.success) setPending(pendingRes.data);
      if (agingRes.success) {
        // Transform the shared aging summary object into the array format Recharts PieChart expects
        const formattedAging = Object.entries(agingRes.data)
          .filter(([key]) => key !== 'totalOutstanding')
          .map(([key, details]) => ({
            name: key,
            value: details.amount
          }));
        setAging(formattedAging);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--color-accent-teal)', borderBottomColor: 'transparent', borderRadius: '50%' }}></div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Loading Financial Dashboard...</p>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>Finance Executive Portal</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>Real-time collections, billing verifications, and customer ledger matching.</p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--color-sidebar-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={14} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="app-card border-left-blue">
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Total Invoiced</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '24px', fontWeight: '800' }}>{formatCurrency(kpis?.totalInvoiced)}</h3>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>All generated billing logs</p>
        </div>

        <div className="app-card border-left-emerald">
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Total Collected</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '24px', fontWeight: '800', color: '#10b981' }}>{formatCurrency(kpis?.totalCollected)}</h3>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Paid & cleared amounts</p>
        </div>

        <div className="app-card border-left-red">
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Total Outstanding</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(kpis?.outstanding)}</h3>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Balance receivable from clients</p>
        </div>

        <div className="app-card border-left-amber">
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Pending Verifications</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>{kpis?.pendingVerifications}</h3>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Awaiting bank statement match</p>
        </div>
      </div>

      {/* Mini KPIs & Operational Data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="app-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: '600', margin: 0 }}>Today's Collections</p>
            <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0 0 0' }}>{formatCurrency(kpis?.todayCollections)}</h4>
          </div>
        </div>
        <div className="app-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: '600', margin: 0 }}>This Month's Collections</p>
            <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0 0 0' }}>{formatCurrency(kpis?.thisMonthCollections)}</h4>
          </div>
        </div>
        <div className="app-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: '600', margin: 0 }}>Average Collection Time</p>
            <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0 0 0' }}>{kpis?.averageCollectionTime}</h4>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }} className="responsive-grid-1col">
        {/* Collection Trend */}
        <div className="app-card">
          <div className="card-top-bar">
            <h2 className="card-heading">Billing vs Collection Trend</h2>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE5F0" />
                <XAxis dataKey="month" stroke="#5E6B82" fontSize={11} />
                <YAxis stroke="#5E6B82" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#DCE5F0', color: '#1e293b', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="invoiced" name="Invoiced" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="collected" name="Collected" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aging Distribution */}
        <div className="app-card">
          <div className="card-top-bar">
            <h2 className="card-heading">Outstanding Aging</h2>
          </div>
          <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aging}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {aging.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Verifications Queue */}
      <div className="app-card">
        <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-heading">Pending Verifications Queue</h2>
          <button 
            onClick={() => navigate.push('/finance-executive/payment-verification')} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-accent-teal)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            View Verification Queue <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="crm-table-container" style={{ marginTop: '10px' }}>
          <table className="crm-table responsive-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Payment Mode</th>
                <th>Ref No. (UTR/Cheque)</th>
                <th>Amount</th>
                <th>Received Date</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>
                    🎉 No pending verifications in queue! All payments matched.
                  </td>
                </tr>
              ) : (
                pending.map((p) => (
                  <tr key={p.payment_id}>
                    <td data-label="Invoice No" style={{ fontWeight: 'bold' }}>{p.invoice_number}</td>
                    <td data-label="Customer">{p.customer_name}</td>
                    <td data-label="Payment Mode">
                      <span className="badge badge-pending" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        {p.payment_mode}
                      </span>
                    </td>
                    <td data-label="Ref No.">{p.utr_number || p.cheque_number || 'N/A'}</td>
                    <td data-label="Amount" style={{ fontWeight: 'bold' }}>{formatCurrency(p.amount)}</td>
                    <td data-label="Received Date">{new Date(p.received_date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
