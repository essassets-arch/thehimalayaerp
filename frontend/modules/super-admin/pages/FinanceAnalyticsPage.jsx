import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Lucide from 'lucide-react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { backendFetch } from '@/lib/backendFetch';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import './FinanceAnalyticsPage.css';
import { exportSalesReportPDF, exportFinanceReportPDF, exportInventoryReportPDF } from '../../../services/export.service';

import ResponsiveChart from '../../../shared/components/ResponsiveChart';

const CHART_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"];

export default function FinanceAnalyticsPage() {
  const { activeDates, filters } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View states
  const [riskRankBy, setRiskRankBy] = useState('overdue'); // outstanding | overdue | oldestDueDays | pendingInvoices
  const [brandRankBy, setBrandRankBy] = useState('revenue'); // revenue | collected | outstanding
  const [salespersonRankBy, setSalespersonRankBy] = useState('collected'); // collected | receivable | outstanding | overdue

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        from: activeDates.dateFrom || '',
        to: activeDates.dateTo || '',
        branchId: filters.branchId || '',
        customerId: filters.customerId || '',
        salespersonId: filters.salespersonId || '',
        vendorId: filters.vendorId || '',
        brandId: filters.brandId || '',
        categoryId: filters.categoryId || '',
        orderStatus: filters.orderStatus || ''
      });
      const res = await backendFetch(`/super-admin/analytics/finance?${q.toString()}`);
      setData(res);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeDates.dateFrom, activeDates.dateTo, filters]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="finance-analytics-container" style={{ textAlign: 'center', padding: '48px 0' }}>
        <Lucide.AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16, display: 'inline-block' }} />
        <h2>Unable to load Finance Command Center.</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>{error.message || 'An error occurred while fetching finance telemetry.'}</p>
        <button onClick={load} className="fa-btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="finance-analytics-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Lucide.Loader size={36} className="animate-spin" style={{ color: '#6366f1', marginBottom: 12 }} />
        <p style={{ color: '#64748b', fontWeight: 'bold' }}>Loading Finance & Commercial Control Telemetry...</p>
      </div>
    );
  }

  const {
    summary = {},
    collections = {},
    receivables = {},
    salespersonCollections = [],
    brands = {},
    procurement = {},
    rejections = {},
    payroll = {},
    exposure = {},
    performance = {},
    alerts = []
  } = data;

  const collectedAmount = summary.collections?.collectedAmount ?? 0;

  const handleExport = (format) => {
    alert(`Exporting Finance Analytics data as ${format.toUpperCase()}...`);
  };

  // Sort customer risks dynamically
  const sortedCustomerRisks = [...(receivables.riskRanking || [])].sort((a, b) => {
    if (riskRankBy === 'outstanding') return b.outstanding - a.outstanding;
    if (riskRankBy === 'oldestDueDays') return b.oldestDueDays - a.oldestDueDays;
    if (riskRankBy === 'pendingInvoices') return b.pendingInvoices - a.pendingInvoices;
    return b.overdue - a.overdue; // default
  });

  // Sort brand performance dynamically
  const sortedBrands = [...(brands.ranking || [])].sort((a, b) => {
    if (brandRankBy === 'collected') return b.collected - a.collected;
    if (brandRankBy === 'outstanding') return b.outstanding - a.outstanding;
    return b.revenue - a.revenue; // default
  });

  // Sort salesperson collections dynamically
  const sortedSalespersons = [...(salespersonCollections || [])].sort((a, b) => {
    if (salespersonRankBy === 'receivable') return b.receivable - a.receivable;
    if (salespersonRankBy === 'outstanding') return b.outstanding - a.outstanding;
    if (salespersonRankBy === 'overdue') return b.overdue - a.overdue;
    return b.collected - a.collected; // default
  });

  return (
    <div className="finance-analytics-container">
      {/* ── HEADER BLOCK ── */}
      <div className="finance-analytics-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="finance-analytics-header-icon">
            <Lucide.ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="finance-analytics-title">Finance &amp; Commercial Control</h1>
              <span className="finance-analytics-badge">COMMERCIAL CONTROL</span>
            </div>
            <p className="finance-analytics-subtitle">Complete financial visibility across collections, receivables, purchase commitments, material rejections, payroll and brand performance.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleExport('pdf')} className="fa-btn-outline">
            <Lucide.FileText size={16} /> Export PDF
          </button>
          <button onClick={() => handleExport('excel')} className="fa-btn-outline">
            <Lucide.FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div style={{ marginBottom: 24 }}>
        <SuperAdminAnalyticsFilter 
          title="Finance Filter Control"
          showBranch={true}
          showCustomer={true}
          showProduct={false}
          showCategory={false}
          showSalesperson={true}
          showStatus={false}
          filterOptions={data.filters}
        />
      </div>

      {/* ── EXECUTIVE FINANCE KPIs ── */}
      <div className="fa-kpi-grid">
        <div className="fa-kpi-card text-blue">
          <span className="label">Sales / Invoice Value</span>
          <strong className="value">{formatCurrency(summary.sales?.invoiceValue ?? 0)}</strong>
          <span className="sub">Orders: {formatCurrency(summary.sales?.confirmedValue ?? 0)}</span>
        </div>
        <div className="fa-kpi-card text-emerald">
          <span className="label">Verified Collections</span>
          <strong className="value">{formatCurrency(summary.collections?.collectedAmount ?? 0)}</strong>
          <span className="sub">Verification Pending: {formatCurrency(collections.summary?.verificationPending ?? 0)}</span>
        </div>
        <div className="fa-kpi-card text-orange">
          <span className="label">Outstanding</span>
          <strong className="value">{formatCurrency(summary.receivables?.outstandingAmount ?? 0)}</strong>
          <span className="sub">Overdue: {formatCurrency(summary.receivables?.overdueAmount ?? 0)}</span>
        </div>
        <div className="fa-kpi-card text-purple">
          <span className="label">Purchase Commitments</span>
          <strong className="value">{formatCurrency(summary.procurement?.poCommitmentValue ?? 0)}</strong>
          <span className="sub">Pending PO Requests: {summary.procurement?.pendingIndentsCount ?? 0}</span>
        </div>
        <div className="fa-kpi-card text-red">
          <span className="label">Rejected Material Exposure</span>
          <strong className="value">{formatCurrency(summary.rejections?.totalRejectionValue ?? 0)}</strong>
          <span className="sub">Resolutions: {rejections.summary?.resolvedThisMonth ?? 0} cases</span>
        </div>
        <div className="fa-kpi-card text-indigo">
          <span className="label">Payroll Payable</span>
          <strong className="value">{formatCurrency(summary.payroll?.payrollNet ?? 0)}</strong>
          <span className="sub">Net Cash Flow: {formatCurrency(collectedAmount - summary.payroll?.payrollNet - summary.procurement?.poCommitmentValue)}</span>
        </div>
      </div>

      {/* ── CASH COLLECTION OVERVIEW & RECEIVABLES AGING ── */}
      <div className="fa-double-grid">
        <div className="fa-card">
          <h3 className="fa-card-title">Billing &amp; Receipts Trends</h3>
          <ResponsiveChart height={300}>
            <ComposedChart data={collections.trends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '11px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="billings" name="Gross Billings" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" />
              <Line type="monotone" dataKey="receipts" name="Verified Collections" stroke="#10B981" strokeWidth={2.5} />
            </ComposedChart>
          </ResponsiveChart>
        </div>

        <div className="fa-card">
          <h3 className="fa-card-title">Receivables Aging (Days Overdue)</h3>
          <ResponsiveChart height={300}>
            <BarChart data={[
              { name: 'Current / Not Due', value: receivables.aging?.notDue ?? 0 },
              { name: '1-15 Days', value: receivables.aging?.aging1to15 ?? 0 },
              { name: '16-30 Days', value: receivables.aging?.aging16to30 ?? 0 },
              { name: '31-60 Days', value: receivables.aging?.aging31to60 ?? 0 },
              { name: '61-90 Days', value: receivables.aging?.aging61to90 ?? 0 },
              { name: '90+ Days', value: receivables.aging?.agingMoreThan90 ?? 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip />
              <Bar dataKey="value" name="Balance" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                <Cell fill="#10B981" />
                <Cell fill="#F59E0B" />
                <Cell fill="#EF4444" />
                <Cell fill="#EF4444" />
                <Cell fill="#EF4444" />
                <Cell fill="#EF4444" />
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </div>
      </div>

      {/* ── COLLECTION RISK RANKING ── */}
      <div className="fa-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3 className="fa-card-title">Collection Risk Ranking (Receivables Attention List)</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Rank By:</span>
            <select value={riskRankBy} onChange={(e) => setRiskRankBy(e.target.value)} className="fa-select-inline">
              <option value="overdue">Overdue Amount</option>
              <option value="outstanding">Outstanding Balance</option>
              <option value="oldestDueDays">Oldest Due Invoice</option>
              <option value="pendingInvoices">Count of Pending Invoices</option>
            </select>
          </div>
        </div>
        <div className="desktop-only">
          <div className="fa-table-wrapper">
            <table className="fa-table">
              <thead>
                <tr>
                  <th>Risk Rank</th>
                  <th>Customer</th>
                  <th>Outstanding Balance</th>
                  <th>Overdue Outstanding</th>
                  <th>Oldest Invoice Due</th>
                  <th>Unpaid Invoices</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomerRisks.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="bold">{idx + 1 === 1 ? '🥇 1' : idx + 1 === 2 ? '🥈 2' : idx + 1 === 3 ? '🥉 3' : idx + 1}</td>
                    <td className="bold">{row.customerName}</td>
                    <td>{formatCurrency(row.outstanding)}</td>
                    <td className="bold text-danger">{formatCurrency(row.overdue)}</td>
                    <td>{row.oldestDueDays > 0 ? `${row.oldestDueDays} days overdue` : 'Not overdue'}</td>
                    <td>{row.pendingInvoices} Invoices</td>
                  </tr>
                ))}
                {sortedCustomerRisks.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No customer accounts with pending balances.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Collection Risk Cards */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedCustomerRisks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b', fontSize: '13px' }}>
              No customer accounts with pending balances.
            </div>
          ) : (
            sortedCustomerRisks.map((row, idx) => {
              const rankDisplay = idx + 1 === 1 ? '🥇 1' : idx + 1 === 2 ? '🥈 2' : idx + 1 === 3 ? '🥉 3' : `#${idx + 1}`;
              return (
                <div
                  key={row.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, background: idx < 3 ? '#fef3c7' : '#f1f5f9', color: idx < 3 ? '#b45309' : '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                        {rankDisplay}
                      </span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{row.customerName}</strong>
                    </div>
                    {row.oldestDueDays > 0 ? (
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                        {row.oldestDueDays}d Overdue
                      </span>
                    ) : (
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                        Not Overdue
                      </span>
                    )}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '8px',
                    padding: '8px',
                    gap: '4px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Outstanding</span>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{formatCurrency(row.outstanding)}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Overdue</span>
                      <strong style={{ fontSize: '12px', color: '#dc2626' }}>{formatCurrency(row.overdue)}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Pending</span>
                      <strong style={{ fontSize: '12px', color: '#2563eb' }}>{row.pendingInvoices} Invoices</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── PAYMENT VERIFICATION COMMAND CENTER & SALESPERSON PERFORMANCE ── */}
      <div className="fa-double-grid">
        <div className="fa-card">
          <h3 className="fa-card-title">Payment Verification (Pending / Auditing)</h3>
          <div className="fa-drawer-grid" style={{ marginBottom: 16 }}>
            <div className="grid-item">
              <span className="label">Verification Pending</span>
              <strong>{collections.verification?.pendingCount ?? 0} Payments</strong>
              <span className="sub">{formatCurrency(collections.summary?.verificationPending ?? 0)}</span>
            </div>
            <div className="grid-item text-success">
              <span className="label">Verified Today</span>
              <strong>{collections.verification?.verifiedTodayCount ?? 0} Payments</strong>
              <span className="sub">{formatCurrency(collections.summary?.verifiedToday ?? 0)}</span>
            </div>
            <div className="grid-item text-red">
              <span className="label">Average Verification SLA</span>
              <strong>{collections.summary?.averageVerificationTime ?? 0} Hours</strong>
              <span className="sub">Oldest pending: {collections.summary?.oldestPendingHrs ?? 0} hours</span>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginBottom: 12 }}>Note: Payment verifications and auditing are executed directly on the payment verification operational page.</p>
        </div>

        <div className="fa-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="fa-card-title">Salesperson Collection Rankings</h3>
            <select value={salespersonRankBy} onChange={(e) => setSalespersonRankBy(e.target.value)} className="fa-select-inline">
              <option value="collected">Collected Amount</option>
              <option value="receivable">Total Receivable</option>
              <option value="outstanding">Outstanding</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="desktop-only">
            <div className="fa-table-wrapper" style={{ maxHeight: 200, overflowY: 'auto' }}>
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Salesperson</th>
                    <th>Receivable</th>
                    <th>Collected</th>
                    <th>Outstanding</th>
                    <th>Collection %</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSalespersons.map((row, idx) => (
                    <tr key={row.salespersonName}>
                      <td className="bold">{idx + 1}</td>
                      <td className="bold">{row.salespersonName}</td>
                      <td>{formatCurrency(row.receivable)}</td>
                      <td className="bold text-success">{formatCurrency(row.collected)}</td>
                      <td>{formatCurrency(row.outstanding)}</td>
                      <td>{row.collectionRate != null ? `${row.collectionRate}%` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedSalespersons.map((row, idx) => (
              <div
                key={row.salespersonName}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{row.salespersonName}</strong>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                    {row.collectionRate != null ? `${row.collectionRate}%` : 'N/A'}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  gap: '4px',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Receivable</span>
                    <strong style={{ fontSize: '11px', color: '#0f172a' }}>{formatCurrency(row.receivable)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Collected</span>
                    <strong style={{ fontSize: '11px', color: '#16a34a' }}>{formatCurrency(row.collected)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Outstanding</span>
                    <strong style={{ fontSize: '11px', color: '#ea580c' }}>{formatCurrency(row.outstanding)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BRAND ANALYSIS & PERFORMANCE ── */}
      <div className="fa-card" style={{ marginBottom: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3 className="fa-card-title">Brand Performance Analysis</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Sort By:</span>
            <select value={brandRankBy} onChange={(e) => setBrandRankBy(e.target.value)} className="fa-select-inline">
              <option value="revenue">Revenue Wise</option>
              <option value="collected">Collection Wise</option>
              <option value="outstanding">Outstanding Wise</option>
            </select>
          </div>
        </div>
        <div className="desktop-only">
          <div className="fa-table-wrapper">
            <table className="fa-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Sales Volume (Qty)</th>
                  <th>Revenue Value</th>
                  <th>Cost Margin</th>
                  <th>Collected Amount</th>
                  <th>Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {sortedBrands.map((row) => (
                  <tr key={row.brandName}>
                    <td className="bold">{row.brandName}</td>
                    <td>{formatNumber(row.quantity)}</td>
                    <td>{formatCurrency(row.revenue)}</td>
                    <td style={{ color: '#64748b', fontStyle: 'italic' }}>N/A (Cost Disabled)</td>
                    <td className="bold text-success">{formatCurrency(row.collected)}</td>
                    <td>{formatCurrency(row.outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedBrands.map((row) => (
            <div
              key={row.brandName}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{row.brandName}</strong>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  Vol: {formatNumber(row.quantity)}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '8px',
                padding: '8px',
                gap: '4px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Revenue</span>
                  <strong style={{ fontSize: '11.5px', color: '#0f172a' }}>{formatCurrency(row.revenue)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Collected</span>
                  <strong style={{ fontSize: '11.5px', color: '#16a34a' }}>{formatCurrency(row.collected)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '9.5px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Outstanding</span>
                  <strong style={{ fontSize: '11.5px', color: '#ea580c' }}>{formatCurrency(row.outstanding)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROCUREMENT & PURCHASE COMMITTED ── */}
      <div className="fa-double-grid">
        <div className="fa-card">
          <h3 className="fa-card-title">Procurement PO Pipeline Status</h3>
          <div className="fa-drawer-grid" style={{ marginBottom: 16 }}>
            <div className="grid-item">
              <span className="label">Waiting Finance</span>
              <strong>{procurement.summary?.pendingApprovedIndents ?? 0} Indents</strong>
            </div>
            <div className="grid-item">
              <span className="label">Draft POs</span>
              <strong>{procurement.summary?.draftPosCount ?? 0} POs</strong>
            </div>
            <div className="grid-item">
              <span className="label">Approval Pending</span>
              <strong>{procurement.summary?.awaitingApprovalCount ?? 0} POs</strong>
            </div>
            <div className="grid-item text-purple">
              <span className="label">Issued PO Commitment</span>
              <strong>{formatCurrency(procurement.summary?.openCommitmentValue ?? 0)}</strong>
            </div>
          </div>
          <div className="desktop-only">
            <div className="fa-table-wrapper" style={{ maxHeight: 200, overflowY: 'auto' }}>
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Indent / PO Status</th>
                    <th>Active Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Plant Head Approved</td><td>{procurement.statuses?.plantHeadApproved ?? 0}</td></tr>
                  <tr><td>Waiting Finance Action</td><td>{procurement.statuses?.waitingFinance ?? 0}</td></tr>
                  <tr><td>Draft Purchase Order</td><td>{procurement.statuses?.draftPo ?? 0}</td></tr>
                  <tr><td>Approved &amp; Issued PO</td><td>{procurement.statuses?.issued ?? 0}</td></tr>
                  <tr><td>Partially Received Goods</td><td>{procurement.statuses?.partiallyReceived ?? 0}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Plant Head Approved', count: procurement.statuses?.plantHeadApproved ?? 0, color: '#3b82f6' },
              { label: 'Waiting Finance Action', count: procurement.statuses?.waitingFinance ?? 0, color: '#f59e0b' },
              { label: 'Draft Purchase Order', count: procurement.statuses?.draftPo ?? 0, color: '#64748b' },
              { label: 'Approved & Issued PO', count: procurement.statuses?.issued ?? 0, color: '#10b981' },
              { label: 'Partially Received Goods', count: procurement.statuses?.partiallyReceived ?? 0, color: '#8b5cf6' }
            ].map((st, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{st.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: st.color, background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '6px' }}>
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="fa-card">
          <h3 className="fa-card-title">Open Commitments by Vendor</h3>
          <div className="desktop-only">
            <div className="fa-table-wrapper" style={{ maxHeight: 310, overflowY: 'auto' }}>
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Open POs</th>
                    <th>PO Value</th>
                    <th>Received Value</th>
                    <th>Committed Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {procurement.vendors?.slice(0, 10).map((row) => (
                    <tr key={row.vendorName}>
                      <td className="bold">{row.vendorName}</td>
                      <td>{row.openPosCount} POs</td>
                      <td>{formatCurrency(row.poValue)}</td>
                      <td>{formatCurrency(row.receivedValue)}</td>
                      <td className="bold text-purple">{formatCurrency(row.openCommitment)}</td>
                    </tr>
                  ))}
                  {(procurement.vendors || []).length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No active purchase commitments.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(procurement.vendors || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12px' }}>
                No active purchase commitments.
              </div>
            ) : (
              procurement.vendors?.slice(0, 10).map((row) => (
                <div
                  key={row.vendorName}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{row.vendorName}</strong>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {row.openPosCount} POs
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    gap: '4px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>PO Value</span>
                      <strong style={{ fontSize: '11px', color: '#0f172a' }}>{formatCurrency(row.poValue)}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Received</span>
                      <strong style={{ fontSize: '11px', color: '#16a34a' }}>{formatCurrency(row.receivedValue)}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Committed</span>
                      <strong style={{ fontSize: '11px', color: '#7c3aed' }}>{formatCurrency(row.openCommitment)}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── MATERIAL REJECTIONS & EXPOSURE ── */}
      <div className="fa-double-grid" style={{ marginTop: 24 }}>
        <div className="fa-card">
          <h3 className="fa-card-title">Material Rejections Financial Exposure</h3>
          <div className="fa-drawer-grid" style={{ marginBottom: 16 }}>
            <div className="grid-item text-red">
              <span className="label">Rejected Exposure</span>
              <strong>{formatCurrency(rejections.exposure?.rejectedValue ?? 0)}</strong>
              <span className="sub">Cases: {rejections.summary?.openCount ?? 0} open</span>
            </div>
            <div className="grid-item text-orange">
              <span className="label">Credit Notes Pending</span>
              <strong>{formatCurrency(rejections.exposure?.vendorCreditPending ?? 0)}</strong>
            </div>
            <div className="grid-item text-purple">
              <span className="label">Replacement Expected</span>
              <strong>{formatCurrency(rejections.exposure?.replacementValuePending ?? 0)}</strong>
            </div>
            <div className="grid-item text-success">
              <span className="label">Recovered / Resolved</span>
              <strong>{formatCurrency(rejections.exposure?.recoveredValue ?? 0)}</strong>
              <span className="sub">Unrecoverable: {formatCurrency(rejections.exposure?.unrecoverableLoss ?? 0)}</span>
            </div>
          </div>
          <h4 style={{ margin: '12px 0 6px 0', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Rejection Reason Analysis:</h4>
          <div className="desktop-only">
            <div className="fa-table-wrapper">
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Reason Category</th>
                    <th>Affect Cases</th>
                    <th>Exposed Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rejections.reasons?.map((r) => (
                    <tr key={r.reason}>
                      <td>{r.reason}</td>
                      <td>{r.cases} Cases</td>
                      <td className="bold text-danger">{formatCurrency(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rejections.reasons?.map((r) => (
              <div key={r.reason} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{r.reason}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{r.cases} Cases Affected</div>
                </div>
                <strong style={{ fontSize: '12.5px', color: '#dc2626' }}>{formatCurrency(r.value)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAYROLL LIABILITY & COST DISTRIBUTION ── */}
        <div className="fa-card">
          <h3 className="fa-card-title">Salary &amp; Payroll Cost Analysis</h3>
          <div className="fa-drawer-grid" style={{ marginBottom: 16 }}>
            <div className="grid-item">
              <span className="label">Employees Payable</span>
              <strong>{payroll.summary?.employeesPayable ?? 0} Employees</strong>
              <span className="sub">Pending: {payroll.summary?.pendingFinance ?? 0}</span>
            </div>
            <div className="grid-item text-purple">
              <span className="label">Gross Payroll Cost</span>
              <strong>{formatCurrency(payroll.summary?.grossPayroll ?? 0)}</strong>
              <span className="sub">Deductions: {formatCurrency(payroll.summary?.deductions ?? 0)}</span>
            </div>
            <div className="grid-item text-indigo">
              <span className="label">Net Liability due</span>
              <strong>{formatCurrency(payroll.summary?.netPayroll ?? 0)}</strong>
              <span className="sub">SLA Processed: {payroll.summary?.processedCount ?? 0} records</span>
            </div>
          </div>
          <h4 style={{ margin: '12px 0 6px 0', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Department Payroll Cost Split:</h4>
          <div className="desktop-only">
            <div className="fa-table-wrapper" style={{ maxHeight: 150, overflowY: 'auto' }}>
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Staff Count</th>
                    <th>Gross Earnings</th>
                    <th>Net Pay Obligation</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.departmentWise?.map((row) => (
                    <tr key={row.departmentName}>
                      <td className="bold">{row.departmentName}</td>
                      <td>{row.employeesCount} Staff</td>
                      <td>{formatCurrency(row.gross)}</td>
                      <td className="bold text-indigo">{formatCurrency(row.netPay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {payroll.departmentWise?.map((row) => (
              <div key={row.departmentName} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{row.departmentName}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{row.employeesCount} Staff • Gross {formatCurrency(row.gross)}</div>
                </div>
                <strong style={{ fontSize: '12.5px', color: '#4f46e5' }}>{formatCurrency(row.netPay)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINANCIAL EXPOSURE & INFLOW VS COMMITMENTS ── */}
      <div className="fa-double-grid" style={{ marginTop: 24 }}>
        <div className="fa-card">
          <h3 className="fa-card-title">Finance Inflow vs Obligation Commitments</h3>
          <ResponsiveChart height={280}>
            <BarChart data={[
              { name: 'Collections Inflow', amount: collectedAmount },
              { name: 'PO Commitments', amount: exposure.openPoCommitment ?? 0 },
              { name: 'Payroll Liability', amount: exposure.payrollLiability ?? 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip />
              <Bar dataKey="amount" name="Obligation Amount" radius={[4, 4, 0, 0]}>
                <Cell fill="#10B981" />
                <Cell fill="#8B5CF6" />
                <Cell fill="#6366F1" />
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </div>

        <div className="fa-card">
          <h3 className="fa-card-title">Commercial Risk &amp; Exposure Feed</h3>
          <div className="desktop-only">
            <div className="fa-table-wrapper">
              <table className="fa-table">
                <thead>
                  <tr>
                    <th>Commercial Segment</th>
                    <th>Net Obligation Exposure</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bold">Customer Total Receivable Outstanding</td>
                    <td className="bold text-orange">{formatCurrency(exposure.customerOutstanding ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="bold">Customer Overdue Balance</td>
                    <td className="bold text-red">{formatCurrency(exposure.customerOverdue ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="bold">Open Purchase Commitments (AP equivalent)</td>
                    <td className="bold text-purple">{formatCurrency(exposure.openPoCommitment ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="bold">Material Quality Rejections Exposure</td>
                    <td className="bold text-red">{formatCurrency(exposure.materialRejectionExposure ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="bold">Salary &amp; Payroll Monthly Obligation</td>
                    <td className="bold text-indigo">{formatCurrency(exposure.payrollLiability ?? 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Customer Total Receivable Outstanding', value: exposure.customerOutstanding ?? 0, color: '#ea580c' },
              { label: 'Customer Overdue Balance', value: exposure.customerOverdue ?? 0, color: '#dc2626' },
              { label: 'Open Purchase Commitments (AP equiv.)', value: exposure.openPoCommitment ?? 0, color: '#7c3aed' },
              { label: 'Material Quality Rejections Exposure', value: exposure.materialRejectionExposure ?? 0, color: '#dc2626' },
              { label: 'Salary & Payroll Monthly Obligation', value: exposure.payrollLiability ?? 0, color: '#4f46e5' }
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{item.label}</span>
                <strong style={{ fontSize: '12.5px', color: item.color }}>{formatCurrency(item.value)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MANAGEMENT EXCEPTIONS CONTROL FEED ── */}
      {alerts.length > 0 && (
        <div className="fa-alerts-card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lucide.AlertTriangle size={20} color="#b45309" />
            <span className="fa-alerts-title">Finance Exceptions &amp; Attention Feed ({alerts.length})</span>
          </div>
          <div className="fa-alerts-list">
            {alerts.map((alertText, idx) => (
              <div key={idx} className="fa-alert-item">
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

          <button
            onClick={async () => {
              try {
                await exportFinanceReportPDF({
                  startDate: activeDates?.dateFrom,
                  endDate: activeDates?.dateTo,
                  branchId: filters?.branch
                });
              } catch (e) {
                console.error(e);
              }
            }}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Landmark size={16} /> Finance & Inflows PDF
          </button>

          <button
            onClick={async () => {
              try {
                await exportInventoryReportPDF({
                  startDate: activeDates?.dateFrom,
                  endDate: activeDates?.dateTo,
                  branchId: filters?.branch
                });
              } catch (e) {
                console.error(e);
              }
            }}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Boxes size={16} /> Stock Levels & Store PDF
          </button>
        </div>
      </div>
    </div>
  );
}
