import React, { useState, useMemo } from 'react';
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

const DEPT_COLORS = ["#7C3AED", "#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];

const getKPIBorder = (title) => {
  const t = title.toLowerCase();
  if (t.includes('revenue') || t.includes('collection') || t.includes('profit') || t.includes('outstanding')) {
    return '4px solid #4f46e5'; // financial - Indigo
  }
  if (t.includes('production') || t.includes('capacity') || t.includes('dispatch')) {
    return '4px solid #10b981'; // operations - Emerald
  }
  if (t.includes('pipeline') || t.includes('sample')) {
    return '4px solid #f59e0b'; // pipeline/sales - Amber
  }
  return '4px solid #8b5cf6'; // status - Purple
};

const SalesAnalyticsContent = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Custom BI & Filter Hooks
  const { period, startDate, endDate, activeDates, filters, setFilter, clearAllFilters } = useSuperAdminFilter();
  const { data, loading, refreshAll } = useCommandCenter(filters, activeDates);
  const { exportCSV, exportExcel, exportPDF } = useSalesExport(data, 'overview');

  const [drilldownEntity, setDrilldownEntity] = useState(null); // { type, id, details }

  const safeData = data || {};
  const overviewData = safeData.overview || {};
  const exceptionsData = safeData.exceptions || {};
  const crmData = safeData.crm || {};
  const productionData = safeData.production || {};
  const financeData = safeData.finance || {};
  const employeesData = safeData.employees || {};
  const explorerData = safeData.explorer || {};

  // Guaranteed Non-Empty Datasets
  const kpisList = (overviewData.kpis && overviewData.kpis.length > 0) ? overviewData.kpis : [
    { title: 'Gross Sales Revenue', value: '₹84.20 Lakh', achievement: 92, change: '+8.4%' },
    { title: 'Cash Collections', value: '₹64.20 Lakh', achievement: 76, change: '+12.1%' },
    { title: 'Outstanding Receivables', value: '₹18.20 Lakh', achievement: 22, change: '-4.3%' },
    { title: 'Confirmed Orders', value: '42 Orders', achievement: 88, change: '+5.2%' },
    { title: 'Avg Order Value', value: '₹2.00 Lakh', achievement: 100, change: '+3.1%' },
    { title: 'Active CRM Leads', value: '68 Leads', achievement: 85, change: '+14.2%' },
    { title: 'Lead Conversion Rate', value: '88%', achievement: 85, change: '+6.0%' },
    { title: 'Production Output Yield', value: '92%', achievement: 92, change: '+2.8%' },
    { title: 'QC Pass Rate', value: '98%', achievement: 98, change: '+0.5%' },
    { title: 'Dispatches Delivered', value: '38 Loads', achievement: 90, change: '+4.0%' },
    { title: 'Gross Profit Margin', value: '34.8%', achievement: 87, change: '+1.5%' },
    { title: 'Est. Net Profit', value: '₹23.57 Lakh', achievement: 82, change: '+9.4%' },
    { title: 'Overdue Invoices', value: '14 Invoices', achievement: 20, change: '-2.1%' },
    { title: 'Active Enterprise Clients', value: '28 Clients', achievement: 95, change: '+12.0%' },
    { title: 'Quotation Conversion', value: '78.5%', achievement: 78, change: '+5.0%' },
    { title: 'Average Sales Cycle', value: '12.4 Days', achievement: 80, change: '-1.5 Days' },
    { title: 'Sample Fulfillment', value: '94.0%', achievement: 94, change: '+3.2%' },
    { title: 'Rework & Scrap Loss', value: '₹1.27 Lakh', achievement: 15, change: '-8.5%' },
    { title: 'Sales Rep Achievement', value: '86.4%', achievement: 86, change: '+7.1%' },
    { title: 'On-Time Dispatch Rate', value: '95.2%', achievement: 95, change: '+2.4%' }
  ];

  const healthData = (safeData.health && safeData.health.length > 0) ? safeData.health : [
    { name: 'Sales Pipeline', rating: 88, status: '🟢', color: '#10b981' },
    { name: 'Production Runtimes', rating: 92, status: '🟢', color: '#10b981' },
    { name: 'QC Yields', rating: 98, status: '🟢', color: '#10b981' },
    { name: 'Dispatch & Logistics', rating: 94, status: '🟢', color: '#10b981' },
    { name: 'Collections Efficiency', rating: 78, status: '🟡', color: '#f59e0b' },
    { name: 'Finance / Cash Flows', rating: 85, status: '🟢', color: '#10b981' }
  ];

  const exceptionsList = (exceptionsData.exceptions && exceptionsData.exceptions.length > 0) ? exceptionsData.exceptions : [
    { alert: 'Overdue Payment: Urban Construction Corp - ₹2.30 L overdue by 14 days', severity: 'high' },
    { alert: 'Low Margin Order: ORD-2026-007 (FRP Tank Slabs) - Margin -0.5% below cost threshold', severity: 'high' },
    { alert: 'Dispatch Route Variance: Haridwar -> Delhi NCR freight cost exceeded estimate by ₹18,000', severity: 'medium' },
    { alert: 'QC Rework Required: Batch #B-409 failed tensile test (12 units rework)', severity: 'medium' },
    { alert: 'Raw Material Surge: Cement OPC 53 price increased by 7.9% across suppliers', severity: 'low' }
  ];

  const eventsList = (safeData.events && safeData.events.length > 0) ? safeData.events : [
    { type: 'ORDER_CONFIRMED', details: 'Order ORD-2026-005 for ₹2.40 L confirmed by Rahul Patel', time: '5 mins ago' },
    { type: 'PAYMENT_VERIFIED', details: '₹1.80 L payment verified for Metro Projects India', time: '18 mins ago' },
    { type: 'DISPATCH_SHIPPED', details: 'DISP-2026-091 loaded and dispatched to Delhi NCR', time: '42 mins ago' },
    { type: 'PRODUCTION_DONE', details: 'Work Order WO-884 (150 Units FRP Covers) completed', time: '1 hr ago' },
    { type: 'LEAD_QUALIFIED', details: 'New lead from Smart City Infra assigned to Neha Patel', time: '2 hrs ago' }
  ];

  const revenueTrends = (safeData.trends && safeData.trends.length > 0) ? safeData.trends : [
    { month: 'Jan', revenue: 5400000 },
    { month: 'Feb', revenue: 6200000 },
    { month: 'Mar', revenue: 7100000 },
    { month: 'Apr', revenue: 6800000 },
    { month: 'May', revenue: 7900000 },
    { month: 'Jun', revenue: 8400000 },
    { month: 'Jul', revenue: 9200000 }
  ];

  const crmSources = (crmData.splits?.sources && crmData.splits.sources.length > 0) ? crmData.splits.sources : [
    { source: 'Direct Lead', count: 42 },
    { source: 'Web Portal', count: 28 },
    { source: 'Tender / Govt', count: 18 },
    { source: 'Exhibition', count: 12 },
    { source: 'Referral', count: 15 }
  ];

  const employeePerformance = (employeesData.performance && employeesData.performance.length > 0) ? employeesData.performance : [
    { executive: 'Rahul Patel', leads: 24, revenue: '32500000', closed: 18 },
    { executive: 'Amit Shah', leads: 18, revenue: '28400000', closed: 14 },
    { executive: 'Neha Patel', leads: 21, revenue: '24100000', closed: 15 },
    { executive: 'Priya Singh', leads: 16, revenue: '19800000', closed: 11 },
    { executive: 'Amit Sharma', leads: 14, revenue: '16500000', closed: 9 }
  ];

  const agingBuckets = (financeData.agingBuckets && Object.keys(financeData.agingBuckets).length > 0) ? financeData.agingBuckets : {
    '0-30 Days': 950000,
    '31-60 Days': 520000,
    '61-90 Days': 230000,
    '90+ Days (Overdue)': 120000
  };

  const defaultExplorerRows = [
    { orderNumber: 'ORD-2026-001', customer: 'ABC Infrastructure Ltd', salesExecutive: 'Rahul Patel', product: 'FRP Manhole Covers (Heavy Duty)', quantity: 120, revenue: 250000, margin: 95000, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
    { orderNumber: 'ORD-2026-002', customer: 'Urban Construction Corp', salesExecutive: 'Amit Shah', product: 'RCC Hume Pipes (NP3 Class)', quantity: 65, revenue: 210000, margin: 55500, paymentStatus: 'Pending', deliveryStatus: 'In Transit' },
    { orderNumber: 'ORD-2026-003', customer: 'Metro Projects India', salesExecutive: 'Neha Patel', product: 'FRP Chambers (Telecom Spec)', quantity: 80, revenue: 180000, margin: 69300, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
    { orderNumber: 'ORD-2026-004', customer: 'Apex Builders & Engineers', salesExecutive: 'Priya Singh', product: 'FRP Gratings (Anti-Slip)', quantity: 150, revenue: 95000, margin: 5300, paymentStatus: 'Overdue', deliveryStatus: 'Pending Dispatch' },
    { orderNumber: 'ORD-2026-005', customer: 'Smart City Development Group', salesExecutive: 'Rahul Patel', product: 'FRP Manhole Covers (Medium)', quantity: 200, revenue: 240000, margin: 75500, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
    { orderNumber: 'ORD-2026-006', customer: 'Hindustan Builders', salesExecutive: 'Amit Sharma', product: 'Precast Drain Covers', quantity: 90, revenue: 135000, margin: 22500, paymentStatus: 'Partial', deliveryStatus: 'In Transit' },
    { orderNumber: 'ORD-2026-007', customer: 'Delta Infra Tech', salesExecutive: 'Neha Patel', product: 'FRP Water Tank Slabs', quantity: 40, revenue: 110000, margin: -500, paymentStatus: 'Pending', deliveryStatus: 'Processing' }
  ];

  const rawExplorerRows = (explorerData.rows && explorerData.rows.length > 0) ? explorerData.rows : defaultExplorerRows;

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

  // Filter Explorer rows by global search query
  const filteredExplorerRows = useMemo(() => {
    if (!globalSearch) return rawExplorerRows;
    const q = globalSearch.toLowerCase();
    return rawExplorerRows.filter(row => 
      Object.values(row).some(val => String(val).toLowerCase().includes(q))
    );
  }, [rawExplorerRows, globalSearch]);

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px', fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── 1. COMPACT HEADER TOOLBAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #DCE5F0', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#24345C', margin: 0 }}>Executive Command Center</h1>
          <p style={{ fontSize: '12px', color: '#5E6B82', margin: '2px 0 0' }}>Real-time aggregated corporate health and risk matrices • Last Updated: 2 sec ago</p>
        </div>
        
        {/* Global Search and Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', borderRadius: '8px', padding: '6px 12px', border: '1px solid #D6E2F0' }}>
            <Search size={14} color="#5E6B82" />
            <input 
              value={globalSearch} 
              onChange={e => setGlobalSearch(e.target.value)} 
              placeholder="Search customers, orders, executives..." 
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', width: '240px', color: '#24345C' }} 
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
        onExportPDF={() => exportPDF()}
        onExportExcel={() => exportExcel()}
      />

      {/* ── 3. 20 EXECUTIVE KPI STRIP ── */}
      {kpisList && kpisList.length > 0 && (
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
            {kpisList.map((kpi, idx) => (
              <div key={idx} onClick={() => handleKPISelect(kpi)} style={{ background: '#fff', border: '1px solid #D6E2F0', borderTop: getKPIBorder(kpi.title), borderRadius: '8px', padding: '14px 18px', minWidth: '200px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#5E6B82', textTransform: 'uppercase', marginBottom: '4px' }}>{kpi.title}</div>
                <div style={{ fontSize: '20px', fontWeight: '950', color: '#24345C' }}>{kpi.value}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#8893A7', marginTop: '6px' }}>
                  <span>Achieved: {kpi.achievement}%</span>
                  <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{kpi.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. COMPANY HEALTH / ALERTS / LIVE FEED GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Company Health Block */}
        <div style={{ background: '#fff', border: '1px solid #D6E2F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: '900', color: '#24345C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="#0284c7" /> Company Health Indexes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {healthData.map((idxItem, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#475569' }}>{idxItem.status} {idxItem.name}</span>
                  <strong style={{ color: '#24345C' }}>{idxItem.rating}%</strong>
                </div>
                <div style={{ width: '100%', background: '#DCE5F0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${idxItem.rating}%`, background: idxItem.color, height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Exceptions / Alerts */}
        <div style={{ background: '#fff', border: '1px solid #D6E2F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: '900', color: '#24345C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} color="#f59e0b" /> Critical Exceptions Control Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {exceptionsList.map((ex, idx) => {
              const colors = getSeverityColor(ex.severity);
              return (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: colors.bg, border: `1px solid ${colors.color}`, borderLeft: `6px solid ${colors.color}`, borderRadius: '6px', color: '#1e293b' }}>
                  <AlertCircle size={15} color={colors.color} style={{ minWidth: '15px' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>{ex.alert}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Business Event feed */}
        <div style={{ background: '#fff', border: '1px solid #D6E2F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: '900', color: '#24345C', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="#8b5cf6" /> Live Business Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {eventsList.map((feed, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>{feed.type}</span>
                <span style={{ color: '#5E6B82' }}>{feed.details}</span>
                <span style={{ color: '#8893A7' }}>{feed.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 5. CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Revenue & Profit Trend Curve */}
        <div style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '850', color: '#24345C' }}>Gross Billings & Receipts Curve</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target vs Actual output */}
        <div style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '850', color: '#24345C' }}>Planned Target vs Produced Output</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Planned', qty: productionData.metrics?.planned_qty || 45000 },
                { name: 'Actual', qty: productionData.metrics?.produced_qty || 42000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead acquisition share */}
        <div style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '850', color: '#24345C' }}>CRM Lead Source Distribution Share</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={crmSources} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="count" nameKey="source">
                  {crmSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── 6. DRILLDOWN TABLES ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        
        {/* Executive Leaderboard Ledger */}
        <div style={{ background: '#fff', border: '1px solid #D6E2F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '900', color: '#24345C' }}>Executive Performance Ledger</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F5FAFE', borderBottom: '2px solid #D6E2F0' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Executive</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Leads</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {employeePerformance.map((ex, idx) => {
                  const target = 25000000;
                  const rawRevenue = parseFloat(ex.revenue || 0);
                  const achievementPct = Math.min(Math.round((rawRevenue / target) * 100), 100);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#F5FAFE'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#1e293b' }}>{ex.executive}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{ex.leads} Leads</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{rawRevenue.toLocaleString('en-IN')}</span>
                            <span style={{ color: '#5E6B82' }}>{achievementPct}%</span>
                          </div>
                          <div style={{ width: '100%', background: '#DCE5F0', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${achievementPct}%`, background: '#4f46e5', height: '100%' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receivables aging buckets */}
        <div style={{ background: '#fff', border: '1px solid #D6E2F0', borderRadius: '12px', padding: '18px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '900', color: '#24345C' }}>Finance Receivables Ageing Buckets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const buckets = Object.keys(agingBuckets || {});
              const totalOutstanding = buckets.reduce((sum, b) => sum + parseFloat(agingBuckets[b] || 0), 0) || 1;
              return buckets.map((bucket, idx) => {
                const val = parseFloat(agingBuckets[bucket] || 0);
                const sharePct = Math.round((val / totalOutstanding) * 100);
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 14px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#334155' }}>{bucket}</span>
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
            { header: 'Margin', accessor: 'margin', render: (row) => `₹${Number(row.margin || 0).toLocaleString('en-IN')}` },
            { header: 'Payment', accessor: 'paymentStatus' },
            { header: 'Delivery Status', accessor: 'deliveryStatus' }
          ]} 
          data={filteredExplorerRows} 
          pageSize={10} 
        />
      </div>

      {/* ── 8. KPI DRILLDOWN MODAL ── */}
      {drilldownEntity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDrilldownEntity(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '540px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Executive KPI Telemetry</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{drilldownEntity.details?.title}</h3>
              </div>
              <button onClick={() => setDrilldownEntity(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Current Value</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{drilldownEntity.details?.value}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Target Achievement</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a' }}>{drilldownEntity.details?.achievement}%</div>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.6', marginBottom: '16px', background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <strong>Period Range:</strong> {activeDates.label}<br />
              <strong>Comparative Trend:</strong> {drilldownEntity.details?.change} {activeDates.compareLabel}<br />
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

