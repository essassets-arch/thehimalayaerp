import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, FileSpreadsheet, Printer, Download,
  Activity, FileText, Users, CheckCircle, AlertCircle, Calendar, MapPin, 
  Trash2, Plus, ArrowUpDown, ChevronDown, Award, Shield, AlertTriangle, 
  Settings, Briefcase, Truck, Database, DollarSign, Cpu, BarChart2, Search
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

import { useSalesFilters, PRESETS } from '../hooks/useSalesFilters.js';
import { useCommandCenter } from '../hooks/useCommandCenter.js';
import { useSalesExport } from '../hooks/useSalesExport.js';

import DataTable from '../components/sales-analytics/explorer/DataTable.jsx';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import { SuperAdminFilterProvider, useSuperAdminFilter } from '../context/SuperAdminFilterContext.jsx';
import './SalesAnalyticsPage.css';

const DEPT_COLORS = ["#7C3AED", "#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];

const getKPIBorder = (title) => {
  const t = title.toLowerCase();
  if (t.includes('revenue') || t.includes('collection') || t.includes('profit') || t.includes('outstanding')) {
    return '4px solid #4f46e5';
  }
  if (t.includes('production') || t.includes('capacity') || t.includes('dispatch')) {
    return '4px solid #10b981';
  }
  if (t.includes('pipeline') || t.includes('sample')) {
    return '4px solid #f59e0b';
  }
  return '4px solid #8b5cf6';
};

const SalesAnalyticsContent = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Custom BI & Filter Hooks
  const { period, startDate, endDate, activeDates, filters, setFilter, clearAllFilters } = useSuperAdminFilter();
  const { data, loading, error, refreshAll } = useCommandCenter(filters, activeDates);
  const { exportCSV, exportExcel, exportPDF } = useSalesExport(data, 'overview');

  const [drilldownEntity, setDrilldownEntity] = useState(null);

  const safeData = data || {};
  const overviewData = safeData.overview || {};
  const exceptionsData = safeData.exceptions || {};
  const crmData = safeData.crm || {};
  const productionData = safeData.production || {};
  const financeData = safeData.finance || {};
  const employeesData = safeData.employees || {};
  const explorerData = safeData.explorer || {};

  const kpisList = (overviewData.kpis && overviewData.kpis.length > 0) ? overviewData.kpis : [];
  const healthData = (safeData.health && safeData.health.length > 0) ? safeData.health : [];
  const exceptionsList = (exceptionsData.exceptions && exceptionsData.exceptions.length > 0) ? exceptionsData.exceptions : [];
  const eventsList = (safeData.events && safeData.events.length > 0) ? safeData.events : [];
  const revenueTrends = (safeData.trends && safeData.trends.length > 0) ? safeData.trends : [];
  const crmSources = (crmData.splits?.sources && crmData.splits.sources.length > 0) ? crmData.splits.sources : [];
  const employeePerformance = (employeesData.performance && employeesData.performance.length > 0) ? employeesData.performance : [];
  const agingBuckets = financeData.agingBuckets || {};
  const rawExplorerRows = (explorerData.rows && explorerData.rows.length > 0) ? explorerData.rows : [];

  const handleKPISelect = (kpi) => {
    setDrilldownEntity({
      type: 'KPI Card Detail',
      id: kpi.title,
      details: kpi
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.04)', border: '1px dashed #ef4444' };
      case 'medium': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.04)', border: '1px dashed #f59e0b' };
      default: return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.04)', border: '1px dashed #3b82f6' };
    }
  };

  const filteredExplorerRows = (() => {
    if (!globalSearch) return rawExplorerRows;
    const lower = globalSearch.toLowerCase();
    return rawExplorerRows.filter(r => 
      String(r.customer || '').toLowerCase().includes(lower) || 
      String(r.orderNumber || '').toLowerCase().includes(lower) || 
      String(r.salesExecutive || '').toLowerCase().includes(lower) ||
      String(r.product || '').toLowerCase().includes(lower)
    );
  })();

  const filteredEmployeePerformance = (() => {
    if (!globalSearch) return employeePerformance;
    const lower = globalSearch.toLowerCase();
    return employeePerformance.filter(e => 
      String(e.executive || '').toLowerCase().includes(lower) ||
      String(e.email || '').toLowerCase().includes(lower)
    );
  })();

  if (error) {
    return <div style={{ padding: '32px', color: '#b91c1c', fontFamily: 'Outfit, sans-serif' }}>
      <h2>Unable to load Executive Command Center.</h2>
      <p>{error.message}</p>
      <button onClick={refreshAll} style={{ padding: '8px 14px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Retry</button>
    </div>;
  }

  return (
    <div className="sales-analytics-container">
      
      {/* ── 1. COMPACT HEADER TOOLBAR ── */}
      <div className="sales-analytics-header">
        <div className="sales-analytics-header-title">
          <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: '900', color: '#24345C', margin: 0 }}>Executive Command Center</h1>
          <p style={{ fontSize: '12px', color: '#5E6B82', margin: '2px 0 0' }}>Real-time aggregated corporate health and risk matrices • Last Updated: {safeData.generatedAt ? new Date(safeData.generatedAt).toLocaleString() : 'Loading…'}</p>
        </div>
        
        {/* Global Search and Actions */}
        <div className="sales-analytics-header-actions">
          <div className="sales-analytics-search-box">
            <Search size={14} color="#5E6B82" />
            <input 
              value={globalSearch} 
              onChange={e => setGlobalSearch(e.target.value)} 
              placeholder="Search customers, orders, executives..." 
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#24345C' }} 
            />
          </div>

          <button onClick={refreshAll} style={{ padding: '8px 12px', background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => exportPDF()} style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            <Download size={14} /> PDF
          </button>
          <button onClick={() => exportExcel()} style={{ padding: '8px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      {/* Shared Super Admin Analytics Filter Bar */}
      <SuperAdminAnalyticsFilter
        title="Sales Analytics Filter Control"
        showBranch={true}
        showSalesperson={true}
        showCustomer={true}
        showProduct={true}
        showCategory={true}
        showStatus={true}
        filterOptions={safeData.filters || {}}
        onExportPDF={() => exportPDF()}
        onExportExcel={() => exportExcel()}
      />

      {/* ── 3. EXECUTIVE KPI STRIP ── */}
      {kpisList && kpisList.length > 0 && (
        <div className="sales-kpi-container">
          <div className="sales-kpi-grid">
            {kpisList.map((kpi, idx) => (
              <div key={idx} className="sales-kpi-card" onClick={() => handleKPISelect(kpi)} style={{ borderTop: getKPIBorder(kpi.title) }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#5E6B82', textTransform: 'uppercase', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.title}</div>
                <div style={{ fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: '950', color: '#24345C' }}>{kpi.value}</div>
                {((kpi.achievement !== null && kpi.achievement !== undefined) || kpi.change) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#8893A7', marginTop: '6px' }}>
                    {(kpi.achievement !== null && kpi.achievement !== undefined) ? (
                      <span>Achieved: {kpi.achievement}%</span>
                    ) : (
                      <span />
                    )}
                    {kpi.change && (
                      <span style={{ color: kpi.change.startsWith('-') ? '#ef4444' : '#16a34a', fontWeight: 'bold' }}>
                        {kpi.change}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. COMPANY HEALTH / ALERTS / LIVE FEED GRID ── */}
      <div className="sales-health-grid">
        
        {/* Company Health Block */}
        <div className="sales-health-card">
          <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: '900', color: '#24345C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="#0284c7" /> Company Health Indexes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {healthData.map((idxItem, idx) => {
              const HEALTH_LABELS = {
                salesPipeline: 'Sales Pipeline',
                productionRuntimes: 'Production Runtimes',
                qcYields: 'QC Yields',
                dispatchLogistics: 'Dispatch & Logistics',
                collectionsEfficiency: 'Collections Efficiency',
                financeCashFlows: 'Finance Cash Flows'
              };
              const label = HEALTH_LABELS[idxItem.name] || idxItem.name;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 'bold', color: '#475569' }}>{label}</span>
                    <strong style={{ color: '#24345C' }}>{idxItem.rating}%</strong>
                  </div>
                  <div style={{ width: '100%', background: '#DCE5F0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${idxItem.rating}%`, background: idxItem.color || '#2563eb', height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Exceptions / Alerts */}
        <div className="sales-health-card">
          <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: '900', color: '#24345C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} color="#f59e0b" /> Critical Exceptions Control Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {exceptionsList.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic' }}>
                No active critical exceptions reported.
              </div>
            ) : (
              exceptionsList.map((ex, idx) => {
                const colors = getSeverityColor(ex.severity);
                return (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: colors.bg, border: `1px solid ${colors.color}`, borderLeft: `6px solid ${colors.color}`, borderRadius: '6px', color: '#1e293b' }}>
                    <AlertCircle size={15} color={colors.color} style={{ minWidth: '15px' }} />
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>{ex.alert}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Business Event feed */}
        <div className="sales-health-card">
          <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: '900', color: '#24345C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="#8b5cf6" /> Live Business Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {eventsList.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic' }}>
                No recent business events logged.
              </div>
            ) : (
              eventsList.map((feed, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#334155' }}>{feed.type}</span>
                  <span style={{ color: '#5E6B82' }}>{feed.details}</span>
                  <span style={{ color: '#8893A7' }}>{feed.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── 5. CHARTS ROW ── */}
      <div className="command-center-charts">
        
        {/* Revenue & Profit Trend Curve */}
        <div className="command-center-chart-card">
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '850', color: '#24345C' }}>Gross Billings & Receipts Curve</h3>
          <div className="command-center-chart-frame">
            {revenueTrends.length === 0 ? (
              <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                No gross billings & receipts recorded for the selected period.
              </div>
            ) : (
              mounted && (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueTrends}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} minTickGap={20} />
                    <YAxis width={40} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" name="Billings" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="receipts" name="Receipts" stroke="#10b981" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>

        {/* Target vs Actual output */}
        <div className="command-center-chart-card">
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '850', color: '#24345C' }}>Planned Target vs Produced Output</h3>
          <div className="command-center-chart-frame">
            {(productionData.metrics?.planned_qty === 0 && productionData.metrics?.produced_qty === 0) ? (
              <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                No production output logged for the selected period.
              </div>
            ) : (
              mounted && (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[
                    { name: 'Planned', qty: productionData.metrics?.planned_qty ?? 0 },
                    { name: 'Actual', qty: productionData.metrics?.produced_qty ?? 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis width={40} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>

        {/* Lead acquisition share */}
        <div className="command-center-chart-card">
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '850', color: '#24345C' }}>CRM Lead Source Distribution Share</h3>
          <div className="command-center-chart-frame">
            {crmSources.length === 0 ? (
              <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                No CRM lead sources recorded for the selected period.
              </div>
            ) : (
              mounted && (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={crmSources} cx="50%" cy="45%" innerRadius="25%" outerRadius="50%" paddingAngle={4} dataKey="count" nameKey="source">
                      {crmSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', bottom: 0 }} />
                  </PieChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>

      </div>

      {/* ── 6. DRILLDOWN TABLES ROW ── */}
      <div className="sales-drilldown-grid">
        
        {/* Executive Leaderboard Ledger */}
        <div className="sales-drilldown-card">
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '900', color: '#24345C' }}>Executive Performance Ledger</h3>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F5FAFE', borderBottom: '2px solid #D6E2F0' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Executive</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Leads</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Confirmed Orders</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployeePerformance.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic', fontSize: '12.5px' }}>
                      No sales executive performance records found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployeePerformance.map((ex, idx) => {
                    const executiveName = ex.executive || ex.name || 'Sales Executive';
                    const leadCount = typeof ex.leads === 'object' ? (ex.leads?.total ?? ex.leads?.active ?? 0) : (ex.leads ?? 0);
                    const rawRevenue = parseFloat(ex.revenue ?? ex.revenueGenerated ?? 0);
                    const achievementPct = ex.achievementPercent == null ? null : Math.round(ex.achievementPercent);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#F5FAFE'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{executiveName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{ex.email}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{leadCount} Leads</span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ background: '#f0fdf4', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{ex.closed ?? 0} Orders</span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{rawRevenue.toLocaleString('en-IN')}</span>
                              <span style={{ color: '#5E6B82' }}>{achievementPct == null ? 'Target Not Configured' : `${achievementPct}%`}</span>
                            </div>
                            <div style={{ width: '100%', background: '#DCE5F0', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${achievementPct ?? 0}%`, background: '#4f46e5', height: '100%' }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receivables aging buckets */}
        <div className="sales-drilldown-card">
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '900', color: '#24345C' }}>Finance Receivables Ageing Buckets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const BUCKET_LABELS = {
                '0_30': '0 - 30 Days',
                '31_60': '31 - 60 Days',
                '61_90': '61 - 90 Days',
                '90_plus': '90+ Days Critical',
                '0-30': '0 - 30 Days',
                '31-60': '31 - 60 Days',
                '61-90': '61 - 90 Days',
                '90+': '90+ Days Critical'
              };
              const buckets = Object.keys(agingBuckets || {});
              const getBucketVal = (b) => {
                const item = agingBuckets[b];
                if (typeof item === 'number') return item;
                if (typeof item === 'object' && item !== null) return parseFloat(item.amount || 0) || 0;
                return parseFloat(item || 0) || 0;
              };
              const totalOutstanding = buckets.reduce((sum, b) => sum + getBucketVal(b), 0) || 1;
              const activeBuckets = buckets.length > 0 ? buckets : ['0_30', '31_60', '61_90', '90_plus'];

              return activeBuckets.map((bucket, idx) => {
                const val = getBucketVal(bucket);
                const sharePct = totalOutstanding > 0 ? Math.round((val / totalOutstanding) * 100) : 0;
                const label = BUCKET_LABELS[bucket] || String(bucket).replace('_', ' ');
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 14px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#334155' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '950', color: '#ef4444' }}>₹{Math.round(val).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ width: '100%', background: '#DCE5F0', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${sharePct}%`, background: '#ef4444', height: '100%' }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>

      {/* ── 7. DATA EXPLORER ACCORDION ── */}
      <div style={{ background: '#fff', border: '1px solid #D6E2F0', borderRadius: '12px', padding: '2px', overflow: 'hidden' }}>
        <DataTable 
          title="Enterprise Transaction Records Explorer" 
          columns={[
            { header: 'Order Number', accessor: 'orderNumber', render: (row) => <strong>{row.orderNumber}</strong> },
            { header: 'Customer Entity', accessor: 'customer' },
            { header: 'Sales Executive', accessor: 'salesExecutive' },
            { header: 'Product Spec', accessor: 'product' },
            { header: 'Qty Sold', accessor: 'quantity' },
            { header: 'Total Revenue', accessor: 'revenue', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{Number(row.revenue || 0).toLocaleString('en-IN')}</span> },
            { header: 'Payment', accessor: 'paymentStatus', render: (row) => {
                const s = String(row.paymentStatus || 'Pending');
                let bg = '#fef3c7', fg = '#d97706';
                if (s === 'Paid' || s === 'Verified') { bg = '#dcfce7'; fg = '#16a34a'; }
                else if (s === 'Overdue') { bg = '#fee2e2'; fg = '#dc2626'; }
                return <span style={{ background: bg, color: fg, padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{s}</span>;
              }
            },
            { header: 'Delivery Status', accessor: 'deliveryStatus', render: (row) => {
                const s = String(row.deliveryStatus || 'Processing');
                let bg = '#f1f5f9', fg = '#475569';
                if (s === 'Delivered') { bg = '#dcfce7'; fg = '#16a34a'; }
                else if (s === 'In Transit') { bg = '#e0f2fe'; fg = '#0284c7'; }
                else if (s === 'Pending Dispatch') { bg = '#fef3c7'; fg = '#d97706'; }
                return <span style={{ background: bg, color: fg, padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{s}</span>;
              }
            }
          ]} 
          data={filteredExplorerRows} 
          pageSize={10} 
        />
      </div>

      {/* ── 8. KPI DRILLDOWN MODAL ── */}
      {drilldownEntity && (
        <div className="sales-modal-overlay" onClick={() => setDrilldownEntity(null)}>
          <div className="sales-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Executive KPI Telemetry</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{drilldownEntity.details?.title}</h3>
              </div>
              <button onClick={() => setDrilldownEntity(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: (drilldownEntity.details?.achievement !== null && drilldownEntity.details?.achievement !== undefined) 
                ? 'repeat(auto-fit, minmax(140px, 1fr))' 
                : '1fr', 
              gap: '12px', 
              marginBottom: '16px' 
            }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Current Value</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{drilldownEntity.details?.value}</div>
              </div>
              {(drilldownEntity.details?.achievement !== null && drilldownEntity.details?.achievement !== undefined) && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Target Achievement</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a' }}>{drilldownEntity.details.achievement}%</div>
                </div>
              )}
            </div>

            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.6', marginBottom: '16px', background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <strong>Period Range:</strong> {activeDates.label}<br />
              {drilldownEntity.details?.change && (
                <>
                  <strong>Comparative Trend:</strong> {drilldownEntity.details.change} {activeDates.compareLabel}<br />
                </>
              )}
              <strong>Calculation Engine:</strong> Aggregate telemetry real-time evaluation across confirmed transactions and operational logs.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDrilldownEntity(null)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Close Telemetry</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const SalesAnalyticsPage = () => {
  return (
    <SuperAdminFilterProvider>
      <SalesAnalyticsContent />
    </SuperAdminFilterProvider>
  );
};

export default SalesAnalyticsPage;
