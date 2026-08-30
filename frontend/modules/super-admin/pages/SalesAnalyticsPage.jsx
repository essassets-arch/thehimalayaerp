import React, { useState, useEffect, useCallback, useRef, cloneElement } from 'react';
import * as Lucide from 'lucide-react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { backendFetch } from '@/lib/backendFetch';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import './SalesAnalyticsPage.css';
import { exportSalesReportPDF } from '../../../services/export.service';

import ResponsiveChart from '../../../shared/components/ResponsiveChart';

const CHART_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"];

export default function SalesAnalyticsPage() {
  const { activeDates, filters } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  
  // Custom interactive controls
  const [performanceView, setPerformanceView] = useState('overall'); // 'overall' | 'orders' | 'payments'
  const [performanceScope, setPerformanceScope] = useState('all'); // 'all' | 'completed' | 'open'
  const [rankBy, setRankBy] = useState('overallScore');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        from: activeDates.dateFrom,
        to: activeDates.dateTo,
        performanceView,
        performanceScope,
        rankBy
      });

      const filterMap = {
        branch: 'branchId',
        customer: 'customerId',
        product: 'productId',
        category: 'categoryId',
        salesperson: 'salespersonId',
        status: 'orderStatus'
      };

      Object.entries(filterMap).forEach(([key, value]) => {
        if (filters[key] && filters[key] !== 'All') {
          params.set(value, filters[key]);
        }
      });

      if (paymentFilter !== 'All') params.set('paymentStatus', paymentFilter);

      const res = await backendFetch(`/api/backend/super-admin/analytics/sales?${params}`, { cacheTtlMs: 0 });
      setData(res);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [activeDates.dateFrom, activeDates.dateTo, filters, performanceView, performanceScope, rankBy, paymentFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Adjust rankBy defaults when swapping views
  const handleViewChange = (view) => {
    setPerformanceView(view);
    if (view === 'overall') setRankBy('overallScore');
    else if (view === 'orders') setRankBy('orderValue');
    else if (view === 'payments') setRankBy('collectedAmount');
  };

  if (error) {
    return (
      <div className="sales-analytics-container" style={{ textAlign: 'center', padding: '48px 0' }}>
        <Lucide.AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2>Unable to load Sales Command Center.</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>{error.message || 'An error occurred while fetching analytics.'}</p>
        <button onClick={load} className="sa-btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="sales-analytics-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Lucide.Loader size={36} className="animate-spin" style={{ color: '#6366f1', marginBottom: 12 }} />
        <p style={{ color: '#64748b', fontWeight: 'bold' }}>Loading Sales & Revenue Telemetry...</p>
      </div>
    );
  }

  const {
    summary = {},
    funnel = {},
    salespersonPerformance = {},
    leads = {},
    samples = {},
    quotations = {},
    orders = {},
    payments = {},
    complaints = {},
    risks = {},
    performance = {},
    alerts = []
  } = data;

  const quoteValue = summary.quotations?.value ?? 0;
  const orderValue = summary.orders?.value ?? 0;
  const collectedAmount = summary.revenue?.collected ?? 0;

  const handleExport = (format) => {
    alert(`Exporting Sales Analytics data as ${format.toUpperCase()}...`);
  };

  const customFilters = (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <select 
        value={paymentFilter} 
        onChange={(e) => setPaymentFilter(e.target.value)}
        className="sa-analytics-filter__select"
      >
        <option value="All">Payment: All</option>
        <option value="Fully Paid">Fully Paid</option>
        <option value="Partial">Partially Paid</option>
        <option value="Pending">Pending</option>
        <option value="Overdue">Overdue</option>
      </select>
    </div>
  );

  const leaderboardFiltered = (salespersonPerformance.leaderboard || []).filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.salespersonName.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
  });

  return (
    <div className="sales-analytics-container">
      {/* ── HEADER BLOCK ── */}
      <div className="sales-analytics-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="sales-analytics-header-icon">
            <Lucide.BarChart2 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="sales-analytics-title">Sales &amp; Revenue Command Center</h1>
              <span className="sales-analytics-badge">O2C TELEMETRY</span>
            </div>
            <p className="sales-analytics-subtitle">Aggregated sales performance, conversion indexes, collections cashflows, receivables, and order fulfillment states.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleExport('pdf')} className="sa-btn-outline">
            <Lucide.FileText size={16} /> Export PDF
          </button>
          <button onClick={() => handleExport('excel')} className="sa-btn-outline">
            <Lucide.FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div style={{ marginBottom: 24 }}>
        <SuperAdminAnalyticsFilter 
          title="Sales Filter Control"
          showBranch={true}
          showCustomer={true}
          showProduct={true}
          showCategory={true}
          showSalesperson={true}
          showStatus={true}
          filterOptions={data.filters}
          customActions={customFilters}
        />
      </div>

      {/* ── TOP-PERFORMER CARDS STRIP ── */}
      <div className="sa-top-performers-grid">
        <div className="sa-performer-card card-overall">
          <div className="sa-card-icon-box"><Lucide.Award size={22} /></div>
          <div className="sa-card-content">
            <span className="label">🏆 TOP OVERALL</span>
            <strong className="value">{salespersonPerformance.topOverall?.name || '—'}</strong>
            <span className="sub">Score: {salespersonPerformance.topOverall?.score || 0}</span>
          </div>
        </div>
        <div className="sa-performer-card card-collections">
          <div className="sa-card-icon-box"><Lucide.DollarSign size={22} /></div>
          <div className="sa-card-content">
            <span className="label">💰 TOP COLLECTION</span>
            <strong className="value">{salespersonPerformance.topCollection?.name || '—'}</strong>
            <span className="sub">{formatCurrency(salespersonPerformance.topCollection?.amount || 0)}</span>
          </div>
        </div>
        <div className="sa-performer-card card-orders">
          <div className="sa-card-icon-box"><Lucide.TrendingUp size={22} /></div>
          <div className="sa-card-content">
            <span className="label">📦 TOP ORDER VALUE</span>
            <strong className="value">{salespersonPerformance.topOrderValue?.name || '—'}</strong>
            <span className="sub">{formatCurrency(salespersonPerformance.topOrderValue?.amount || 0)}</span>
          </div>
        </div>
        <div className="sa-performer-card card-paid">
          <div className="sa-card-icon-box"><Lucide.CheckSquare size={22} /></div>
          <div className="sa-card-content">
            <span className="label">✅ MOST FULLY PAID ORDERS</span>
            <strong className="value">{salespersonPerformance.topFullyPaid?.name || '—'}</strong>
            <span className="sub">{salespersonPerformance.topFullyPaid?.count || 0} Orders</span>
          </div>
        </div>
      </div>

      {/* ── EXECUTIVE SALES SUMMARY ── */}
      <div className="sa-summary-grid">
        <div className="sa-summary-card">
          <span className="label">Leads</span>
          <div className="value text-blue">{summary.leads?.total ?? 0}</div>
          <div className="footer">Active: <strong>{summary.leads?.active ?? 0}</strong></div>
        </div>
        <div className="sa-summary-card">
          <span className="label">Quotations</span>
          <div className="value text-purple">{summary.quotations?.total ?? 0}</div>
          <div className="footer">Value: <strong>{formatCurrency(summary.quotations?.value ?? 0)}</strong></div>
        </div>
        <div className="sa-summary-card">
          <span className="label">Confirmed Orders</span>
          <div className="value text-emerald">{summary.orders?.total ?? 0}</div>
          <div className="footer">Value: <strong>{formatCurrency(summary.orders?.value ?? 0)}</strong></div>
        </div>
        <div className="sa-summary-card">
          <span className="label">Verified Collections</span>
          <div className="value text-emerald">{formatCurrency(summary.revenue?.collected ?? 0)}</div>
          <div className="footer">DSO: <strong>{performance.onTimeFulfillmentRate}% On-Time</strong></div>
        </div>
        <div className="sa-summary-card">
          <span className="label">Outstanding Balance</span>
          <div className="value text-orange">{formatCurrency(summary.revenue?.outstanding ?? 0)}</div>
          <div className="footer">Overdue: <strong>{formatCurrency(summary.revenue?.overdue ?? 0)}</strong></div>
        </div>
        <div className="sa-summary-card">
          <span className="label">Lead → Order Conv. %</span>
          <div className="value text-indigo">{performance.leadToOrderRate ?? 0}%</div>
          <div className="footer">Complaints: <strong>{complaints.summary?.open ?? 0} Open</strong></div>
        </div>
      </div>

      {/* ── SALESPERSON PERFORMANCE LEADERBOARD ── */}
      <div className="sa-card" style={{ marginBottom: 24 }}>
        <div className="sa-leaderboard-header">
          <h3 className="sa-card-title" style={{ margin: 0 }}>Salesperson Performance Leaderboard</h3>
          <div className="sa-leaderboard-controls">
            <div className="sa-btn-group">
              <button onClick={() => handleViewChange('overall')} className={`sa-tab-btn ${performanceView === 'overall' ? 'active' : ''}`}>Overall</button>
              <button onClick={() => handleViewChange('orders')} className={`sa-tab-btn ${performanceView === 'orders' ? 'active' : ''}`}>Order Wise</button>
              <button onClick={() => handleViewChange('payments')} className={`sa-tab-btn ${performanceView === 'payments' ? 'active' : ''}`}>Payment Wise</button>
            </div>

            <div className="sa-btn-group">
              <button onClick={() => setPerformanceScope('all')} className={`sa-tab-btn small ${performanceScope === 'all' ? 'active' : ''}`}>All Business</button>
              <button onClick={() => setPerformanceScope('completed')} className={`sa-tab-btn small ${performanceScope === 'completed' ? 'active' : ''}`}>Completed Business</button>
            </div>

            {performanceView === 'orders' && (
              <select value={rankBy} onChange={(e) => setRankBy(e.target.value)} className="sa-select-dropdown">
                <option value="orderValue">Rank By: Order Value</option>
                <option value="orderCount">Rank By: Number of Orders</option>
                <option value="deliveredOrders">Rank By: Delivered Orders</option>
                <option value="completedOrders">Rank By: Fully Completed Orders</option>
                <option value="averageOrderValue">Rank By: Average Order Value</option>
              </select>
            )}

            {performanceView === 'payments' && (
              <select value={rankBy} onChange={(e) => setRankBy(e.target.value)} className="sa-select-dropdown">
                <option value="collectedAmount">Rank By: Collection Amount</option>
                <option value="collectionRate">Rank By: Collection %</option>
                <option value="fullyPaidOrders">Rank By: Fully Paid Orders</option>
              </select>
            )}

            <div className="sa-search-input-box">
              <Lucide.Search size={14} />
              <input 
                type="text" 
                placeholder="Search salesperson..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="desktop-only">
          <div className="sa-table-wrapper" style={{ marginTop: 16 }}>
            {performanceView === 'overall' && (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Salesperson</th>
                    <th>Leads</th>
                    <th>Orders</th>
                    <th>Order Value</th>
                    <th>Collected</th>
                    <th>Outstanding</th>
                    <th>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardFiltered.map((row) => (
                    <tr key={row.userId} onClick={() => setSelectedSalesperson(row)} className="clickable">
                      <td className="bold">{row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}</td>
                      <td>
                        <div className="bold">{row.salespersonName}</div>
                        <div className="sub">{row.email}</div>
                      </td>
                      <td>{row.leads?.total}</td>
                      <td>{row.orders?.confirmed}</td>
                      <td>{formatCurrency(row.orders?.confirmedValue)}</td>
                      <td className="bold text-success">{formatCurrency(row.payments?.verifiedCollected)}</td>
                      <td>{formatCurrency(row.payments?.outstanding)}</td>
                      <td className="text-danger">{formatCurrency(row.payments?.overdue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {performanceView === 'orders' && (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Salesperson</th>
                    <th>Confirmed Orders</th>
                    <th>Delivered</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Order Value</th>
                    <th>Avg Order</th>
                    <th>Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardFiltered.map((row) => (
                    <tr key={row.userId} onClick={() => setSelectedSalesperson(row)} className="clickable">
                      <td className="bold">{row.rank}</td>
                      <td>
                        <div className="bold">{row.salespersonName}</div>
                        <div className="sub">{row.email}</div>
                      </td>
                      <td>{row.orders?.confirmed}</td>
                      <td>{row.orders?.delivered}</td>
                      <td>{row.orders?.closed}</td>
                      <td>{row.orders?.pending}</td>
                      <td className="bold">{formatCurrency(row.orders?.confirmedValue)}</td>
                      <td>{formatCurrency(row.orders?.averageOrderValue)}</td>
                      <td>{row.conversion?.leadToOrder}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {performanceView === 'payments' && (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Salesperson</th>
                    <th>Order Value</th>
                    <th>Collected</th>
                    <th>Collection %</th>
                    <th>Coverage %</th>
                    <th>Outstanding</th>
                    <th>Overdue</th>
                    <th>Fully Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardFiltered.map((row) => (
                    <tr key={row.userId} onClick={() => setSelectedSalesperson(row)} className="clickable">
                      <td className="bold">{row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}</td>
                      <td>
                        <div className="bold">{row.salespersonName}</div>
                        <div className="sub">{row.email}</div>
                      </td>
                      <td>{formatCurrency(row.orders?.confirmedValue)}</td>
                      <td className="bold text-success">{formatCurrency(row.payments?.verifiedCollected)}</td>
                      <td className="bold">{row.payments?.collectionRate != null ? `${row.payments.collectionRate}%` : '—'}</td>
                      <td className="sub">{row.payments?.orderCollectionCoverage}%</td>
                      <td>{formatCurrency(row.payments?.outstanding)}</td>
                      <td className="text-danger">{formatCurrency(row.payments?.overdue)}</td>
                      <td className="bold text-success">{row.payments?.fullyPaidOrders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Card List View */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 16 }}>
          {leaderboardFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b', fontSize: '13px' }}>
              No salespeople matched your filter.
            </div>
          ) : (
            leaderboardFiltered.map((row) => {
              const rankDisplay = row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : `#${row.rank}`;
              const rankColor = row.rank === 1 ? '#d97706' : row.rank === 2 ? '#64748b' : row.rank === 3 ? '#b45309' : '#0284c7';
              const rankBg = row.rank === 1 ? '#fef3c7' : row.rank === 2 ? '#f1f5f9' : row.rank === 3 ? '#ffedd5' : '#e0f2fe';
              return (
                <div
                  key={row.userId}
                  onClick={() => setSelectedSalesperson(row)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, background: rankBg, color: rankColor, padding: '4px 10px', borderRadius: '8px', border: `1px solid ${rankColor}33`, whiteSpace: 'nowrap' }}>
                        {rankDisplay}
                      </span>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{row.salespersonName}</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>{row.email}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>Inspect →</span>
                  </div>

                  {/* Overall View Grid */}
                  {performanceView === 'overall' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: '8px',
                      padding: '10px',
                      gap: '8px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Leads / Orders</span>
                        <strong style={{ fontSize: '12px', color: '#0f172a' }}>{row.leads?.total || 0} / {row.orders?.confirmed || 0}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Order Value</span>
                        <strong style={{ fontSize: '12px', color: '#0f172a' }}>{formatCurrency(row.orders?.confirmedValue || 0)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Collected</span>
                        <strong style={{ fontSize: '12px', color: '#16a34a' }}>{formatCurrency(row.payments?.verifiedCollected || 0)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Outstanding</span>
                        <strong style={{ fontSize: '11.5px', color: '#ea580c' }}>{formatCurrency(row.payments?.outstanding || 0)}</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Overdue</span>
                        <strong style={{ fontSize: '11.5px', color: (row.payments?.overdue || 0) > 0 ? '#ef4444' : '#64748b' }}>
                          {formatCurrency(row.payments?.overdue || 0)}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Order Wise View Grid */}
                  {performanceView === 'orders' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: '8px',
                      padding: '10px',
                      gap: '8px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Confirmed</span>
                        <strong style={{ fontSize: '12px', color: '#0f172a' }}>{row.orders?.confirmed || 0}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Delivered</span>
                        <strong style={{ fontSize: '12px', color: '#2563eb' }}>{row.orders?.delivered || 0}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Closed / Done</span>
                        <strong style={{ fontSize: '12px', color: '#16a34a' }}>{row.orders?.closed || 0}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Order Value</span>
                        <strong style={{ fontSize: '11.5px', color: '#0f172a' }}>{formatCurrency(row.orders?.confirmedValue || 0)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Avg Order</span>
                        <strong style={{ fontSize: '11.5px', color: '#64748b' }}>{formatCurrency(row.orders?.averageOrderValue || 0)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Conversion %</span>
                        <strong style={{ fontSize: '11.5px', color: '#7c3aed' }}>{row.conversion?.leadToOrder || 0}%</strong>
                      </div>
                    </div>
                  )}

                  {/* Payment Wise View Grid */}
                  {performanceView === 'payments' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: '8px',
                      padding: '10px',
                      gap: '8px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Order Value</span>
                        <strong style={{ fontSize: '11.5px', color: '#0f172a' }}>{formatCurrency(row.orders?.confirmedValue || 0)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Collected</span>
                        <strong style={{ fontSize: '12px', color: '#16a34a' }}>{formatCurrency(row.payments?.verifiedCollected || 0)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Collection %</span>
                        <strong style={{ fontSize: '11.5px', color: '#2563eb' }}>{row.payments?.collectionRate != null ? `${row.payments.collectionRate}%` : '—'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Outstanding</span>
                        <strong style={{ fontSize: '11.5px', color: '#ea580c' }}>{formatCurrency(row.payments?.outstanding || 0)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Overdue</span>
                        <strong style={{ fontSize: '11.5px', color: (row.payments?.overdue || 0) > 0 ? '#ef4444' : '#64748b' }}>
                          {formatCurrency(row.payments?.overdue || 0)}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Fully Paid</span>
                        <strong style={{ fontSize: '11.5px', color: '#16a34a' }}>{row.payments?.fullyPaidOrders || 0} Orders</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── SALES LIFECYCLE FUNNEL ── */}
      <div className="sa-card" style={{ marginBottom: 24 }}>
        <h3 className="sa-card-title">Sales O2C Funnel Visualizer</h3>
        
        {/* Desktop Visual Funnel Flow */}
        <div className="desktop-only">
          <div className="sa-funnel-flow">
            <div className="sa-funnel-node">
              <span className="label">LEADS</span>
              <strong>{summary.leads?.total ?? 0}</strong>
            </div>
            <div className="sa-funnel-arrow"><Lucide.ArrowDown /></div>
            <div className="sa-funnel-node">
              <span className="label">SAMPLES SENT</span>
              <strong>{samples.summary?.total ?? 0}</strong>
            </div>
            <div className="sa-funnel-arrow"><Lucide.ArrowDown /></div>
            <div className="sa-funnel-node">
              <span className="label">QUOTATIONS</span>
              <strong>{summary.quotations?.total ?? 0}</strong>
              <span className="sub">{formatCurrency(summary.quotations?.value ?? 0)}</span>
            </div>
            <div className="sa-funnel-arrow"><Lucide.ArrowDown /></div>
            <div className="sa-funnel-node">
              <span className="label">CONFIRMED ORDERS</span>
              <strong>{summary.orders?.total ?? 0}</strong>
              <span className="sub">{formatCurrency(summary.orders?.value ?? 0)}</span>
            </div>
            <div className="sa-funnel-arrow"><Lucide.ArrowDown /></div>
            <div className="sa-funnel-node">
              <span className="label">FULLY PAID</span>
              <strong>{leaderboardFiltered.reduce((sum, item) => sum + (item.payments?.fullyPaidOrders || 0), 0)} Orders</strong>
              <span className="sub">{formatCurrency(collectedAmount)}</span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Stage Cards */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Stage 1: Leads */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>1</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>LEADS</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{summary.leads?.total ?? 0}</strong>
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #f1f5f9', fontWeight: 600 }}>Active: {summary.leads?.active ?? 0}</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>↓ Lead → Quote: {funnel.conversions?.leadToQuote}%</div>

          {/* Stage 2: Samples Sent */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>2</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>SAMPLES SENT</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{samples.summary?.total ?? 0}</strong>
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #f1f5f9', fontWeight: 600 }}>Dispatched: {samples.summary?.dispatched ?? 0}</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>↓ Sample → Quote</div>

          {/* Stage 3: Quotations */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>3</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>QUOTATIONS</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{summary.quotations?.total ?? 0}</strong>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#9333ea', background: '#faf5ff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #f3e8ff', fontWeight: 800 }}>{formatCurrency(summary.quotations?.value ?? 0)}</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>↓ Quote → Order: {funnel.conversions?.quoteToOrder}%</div>

          {/* Stage 4: Confirmed Orders */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>4</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>CONFIRMED ORDERS</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{summary.orders?.total ?? 0}</strong>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#16a34a', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', border: '1px solid #dcfce7', fontWeight: 800 }}>{formatCurrency(summary.orders?.value ?? 0)}</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>↓ Order → Payment Closure</div>

          {/* Stage 5: Fully Paid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>5</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>FULLY PAID</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{leaderboardFiltered.reduce((sum, item) => sum + (item.payments?.fullyPaidOrders || 0), 0)} Orders</strong>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 800 }}>{formatCurrency(collectedAmount)}</span>
          </div>
        </div>

        <div className="sa-funnel-rates">
          <div className="rate-item">Lead → Quote: <strong>{funnel.conversions?.leadToQuote}%</strong></div>
          <div className="rate-item">Quote → Order: <strong>{funnel.conversions?.quoteToOrder}%</strong></div>
          <div className="rate-item">Lead → Order: <strong>{funnel.conversions?.leadToOrder}%</strong></div>
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="sa-double-grid">
        <div className="sa-card">
          <h3 className="sa-card-title">Gross billing &amp; Receipts Curve</h3>
          <ResponsiveChart
            height={320}
            emptyTitle="No billing or receipts in selected period"
            emptySubtitle="Billings and collections curves will appear as transactions are processed."
          >
            <ComposedChart data={payments.trends && payments.trends.length > 0 ? payments.trends : [{ period: 'Current', orderValue: orderValue, collections: collectedAmount }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '11px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
              <Legend />
              <Area type="monotone" dataKey="orderValue" name="Billings" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" />
              <Line type="monotone" dataKey="collections" name="Receipts" stroke="#10B981" strokeWidth={2.5} />
            </ComposedChart>
          </ResponsiveChart>
        </div>

        <div className="sa-card">
          <h3 className="sa-card-title">Opportunity Pipeline Potentials</h3>
          <ResponsiveChart
            height={320}
            emptyTitle="No active pipeline potentials recorded"
            emptySubtitle="Open quotes, leads and confirmed orders will populate this chart."
          >
            <BarChart data={[
              { name: 'Leads Potential', val: Math.max(0, quoteValue * 1.5) },
              { name: 'Open Quotes', val: Math.max(0, quoteValue) },
              { name: 'Confirmed Orders', val: Math.max(0, orderValue) }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
              <Bar dataKey="val" name="Potential Value" fill="#6366f1" radius={[6, 6, 0, 0]}>
                <Cell fill="#8B5CF6" />
                <Cell fill="#6366F1" />
                <Cell fill="#10B981" />
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </div>
      </div>

      {/* ── LEADS & FOLLOW UPS ── */}
      <div className="sa-card" style={{ marginBottom: 24 }}>
        <h3 className="sa-card-title">CRM Leads &amp; follow-up Analysis</h3>
        <div className="sa-double-grid">
          <div>
            <h4 className="sa-sub-title">Lead Source &amp; Conversion rates</h4>
            <div className="desktop-only">
              <div className="sa-table-wrapper">
                <table className="sa-table small">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Leads</th>
                      <th>Quotations</th>
                      <th>Orders</th>
                      <th>Conversion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.sources?.map((row, idx) => (
                      <tr key={idx}>
                        <td className="bold">{row.source}</td>
                        <td>{row.leads}</td>
                        <td>{row.quotations}</td>
                        <td>{row.orders}</td>
                        <td className="bold text-success">{row.conversionPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leads.sources?.map((row, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{row.source}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {row.leads} Leads • {row.quotations} Quotes • {row.orders} Orders
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                    {row.conversionPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="sa-sub-title">Lead aging buckets</h4>
            <div className="sa-grid-two">
              <div className="sa-report-item">
                <span className="label">0–7 Days</span>
                <strong>{leads.aging?.aging0to7} Leads</strong>
              </div>
              <div className="sa-report-item">
                <span className="label">8–15 Days</span>
                <strong>{leads.aging?.aging8to15} Leads</strong>
              </div>
              <div className="sa-report-item">
                <span className="label">16–30 Days</span>
                <strong>{leads.aging?.aging16to30} Leads</strong>
              </div>
              <div className="sa-report-item">
                <span className="label">&gt; 30 Days</span>
                <strong>{(leads.aging?.aging31to60 || 0) + (leads.aging?.agingMoreThan60 || 0)} Leads</strong>
              </div>
            </div>
            <div className="sa-report-item" style={{ marginTop: 12 }}>
              <span className="label">Oldest Open lead</span>
              <strong style={{ color: '#ef4444' }}>{leads.aging?.oldestLeadDays} Days</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── RECEIVABLES AGING ── */}
      <div className="sa-card" style={{ marginBottom: 24 }}>
        <h3 className="sa-card-title">Finance Ageing Buckets</h3>
        <div className="sa-double-grid">
          <div>
            <h4 className="sa-sub-title">receivable Ageing</h4>
            <div className="sa-grid-two">
              <div className="sa-report-item">
                <span className="label">Not Due</span>
                <strong>{formatCurrency(payments.aging?.notDue ?? 0)}</strong>
              </div>
              <div className="sa-report-item text-warning">
                <span className="label">1–30 Days</span>
                <strong>{formatCurrency((payments.aging?.aging1to15 || 0) + (payments.aging?.aging16to30 || 0))}</strong>
              </div>
              <div className="sa-report-item text-danger">
                <span className="label">31–90 Days</span>
                <strong>{formatCurrency((payments.aging?.aging31to60 || 0) + (payments.aging?.aging61to90 || 0))}</strong>
              </div>
              <div className="sa-report-item text-danger-heavy">
                <span className="label">&gt; 90 Days Critical</span>
                <strong>{formatCurrency(payments.aging?.agingMoreThan90 ?? 0)}</strong>
              </div>
            </div>
          </div>

          <div className="sa-report-item" style={{ justifyContent: 'center' }}>
            <span className="label">Average Payment delay</span>
            <strong style={{ fontSize: '24px', color: '#ef4444' }}>
              {payments.summary?.averageCollectionDays != null ? `${payments.summary.averageCollectionDays} Days` : '—'}
            </strong>
          </div>
        </div>
      </div>

      {/* ── CROSS DEPARTMENT FULFILLMENT RISK ── */}
      <div className="sa-card" style={{ marginBottom: 24 }}>
        <h3 className="sa-card-title">Fulfillment Commitment Risks</h3>
        <div className="desktop-only">
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order No</th>
                  <th>Target Date</th>
                  <th>Current stage</th>
                  <th>Delay (Days)</th>
                  <th>Salesperson Owner</th>
                </tr>
              </thead>
              <tbody>
                {risks.customerCommitments?.map((row, idx) => (
                  <tr key={idx}>
                    <td className="bold">{row.customer}</td>
                    <td className="text-blue">{row.orderNo}</td>
                    <td>{row.targetDate}</td>
                    <td><span className="badge badge-warning">{row.stage}</span></td>
                    <td className="bold text-danger">{row.delay} Days</td>
                    <td>{row.owner}</td>
                  </tr>
                ))}
                {(!risks.customerCommitments || risks.customerCommitments.length === 0) && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>✓ All customer commitments are fully on-time and in-schedule.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(!risks.customerCommitments || risks.customerCommitments.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#10b981', fontWeight: 'bold', fontSize: '12.5px' }}>
              ✓ All customer commitments are fully on-time and in-schedule.
            </div>
          ) : (
            risks.customerCommitments.map((row, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{row.customer}</strong>
                    <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 700 }}>{row.orderNo}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                    {row.delay} Days Delay
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>Stage: <strong>{row.stage}</strong></span>
                  <span>Owner: <strong>{row.owner}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── EXCEPTIONS CONTROL FEED ── */}
      {alerts.length > 0 && (
        <div className="sa-alerts-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lucide.AlertTriangle size={20} color="#b45309" />
            <span className="sa-alerts-title">Management Attention Alerts ({alerts.length})</span>
          </div>
          <div className="sa-alerts-list">
            {alerts.map((alertText, idx) => (
              <div key={idx} className="sa-alert-item">
                <Lucide.AlertCircle size={16} color="#d97706" />
                <span>{alertText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive Document Export Center */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginTop: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 750, color: '#1e293b' }}>Executive Document Export Center</h4>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
          Generate formatted PDF executive documentation using active company filters and live reporting metrics.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              try {
                await exportSalesReportPDF({
                  startDate: activeDates?.dateFrom,
                  endDate: activeDates?.dateTo,
                  branchId: filters?.branch
                });
              } catch (e) {
                console.error(e);
              }
            }}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.FileText size={16} /> Sales Performance PDF
          </button>
        </div>
      </div>

      {/* ── SALESPERSON DETAIL DRAWER ── */}
      {selectedSalesperson && (
        <div className="sa-drawer-overlay" onClick={() => setSelectedSalesperson(null)}>
          <div className="sa-drawer-card" onClick={e => e.stopPropagation()}>
            <div className="sa-drawer-header">
              <div>
                <span className="sa-drawer-badge">RANK #{selectedSalesperson.rank}</span>
                <h2 className="sa-drawer-title">{selectedSalesperson.salespersonName}</h2>
                <p className="sa-drawer-subtitle">{selectedSalesperson.role} • {selectedSalesperson.email}</p>
              </div>
              <button className="sa-drawer-close-btn" onClick={() => setSelectedSalesperson(null)}>✕</button>
            </div>

            <div className="sa-drawer-scroll-container">
              <div className="sa-drawer-section">
                <h4 className="section-title">OVERALL PERFORMANCE</h4>
                <div className="sa-drawer-grid">
                  <div className="grid-item"><span className="label">Overall Score</span><strong>{selectedSalesperson.scores?.overall}</strong></div>
                  <div className="grid-item"><span className="label">Leads count</span><strong>{selectedSalesperson.leads?.total}</strong></div>
                  <div className="grid-item"><span className="label">Quotations</span><strong>{selectedSalesperson.quotations?.total}</strong></div>
                  <div className="grid-item"><span className="label">Lead → Order Conv</span><strong>{selectedSalesperson.conversion?.leadToOrder}%</strong></div>
                </div>
              </div>

              <div className="sa-drawer-section">
                <h4 className="section-title">ORDERS LIFECYCLE</h4>
                <div className="sa-drawer-grid">
                  <div className="grid-item"><span className="label">Order Value</span><strong>{formatCurrency(selectedSalesperson.orders?.confirmedValue)}</strong></div>
                  <div className="grid-item"><span className="label">Delivered</span><strong>{selectedSalesperson.orders?.delivered}</strong></div>
                  <div className="grid-item"><span className="label">Closed / Complete</span><strong>{selectedSalesperson.orders?.closed}</strong></div>
                  <div className="grid-item"><span className="label">Delayed Orders</span><strong className={selectedSalesperson.orders?.delayed > 0 ? "text-danger" : ""}>{selectedSalesperson.orders?.delayed}</strong></div>
                </div>
              </div>

              <div className="sa-drawer-section">
                <h4 className="section-title">COLLECTIONS &amp; CASHFLOW</h4>
                <div className="sa-drawer-grid">
                  <div className="grid-item"><span className="label">Invoice Value</span><strong>{formatCurrency(selectedSalesperson.payments?.invoiceValue)}</strong></div>
                  <div className="grid-item"><span className="label">Verified Collected</span><strong className="text-success">{formatCurrency(selectedSalesperson.payments?.verifiedCollected)}</strong></div>
                  <div className="grid-item"><span className="label">Outstanding</span><strong>{formatCurrency(selectedSalesperson.payments?.outstanding)}</strong></div>
                  <div className="grid-item"><span className="label">Collection Rate</span><strong>{selectedSalesperson.payments?.collectionRate != null ? `${selectedSalesperson.payments.collectionRate}%` : '—'}</strong></div>
                </div>
              </div>

              <div className="sa-drawer-section">
                <h4 className="section-title">PAYMENT STATUS BREAKDOWN</h4>
                <div className="sa-drawer-grid">
                  <div className="grid-item"><span className="label">Fully Paid</span><strong className="text-success">{selectedSalesperson.payments?.fullyPaidOrders}</strong></div>
                  <div className="grid-item"><span className="label">Partial Paid</span><strong>{selectedSalesperson.payments?.partiallyPaidOrders}</strong></div>
                  <div className="grid-item"><span className="label">Pending Payments</span><strong>{selectedSalesperson.payments?.unpaidOrders}</strong></div>
                  <div className="grid-item"><span className="label">Overdue Outstanding</span><strong className="text-danger">{formatCurrency(selectedSalesperson.payments?.overdue)}</strong></div>
                </div>
              </div>

              <div className="sa-drawer-section">
                <h4 className="section-title">CUSTOMERS &amp; COMPLAINTS</h4>
                <div className="sa-drawer-grid">
                  <div className="grid-item"><span className="label">Active Customers</span><strong>{selectedSalesperson.customers?.active ?? 0}</strong></div>
                  <div className="grid-item"><span className="label">Repeat Customers</span><strong>{selectedSalesperson.customers?.repeat ?? 0}</strong></div>
                  <div className="grid-item"><span className="label">New Customers</span><strong>{selectedSalesperson.customers?.new ?? 0}</strong></div>
                </div>
              </div>
            </div>

            <div className="sa-drawer-actions">
              <button className="sa-btn-primary" onClick={() => setSelectedSalesperson(null)}>Close Drawer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
