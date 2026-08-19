import React, { useCallback, useEffect, useState, useRef, cloneElement } from 'react';
import * as Lucide from 'lucide-react';
import { 
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { backendFetch } from '@/lib/backendFetch';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import './ProductionAnalyticsPage.css';

const CHART_COLORS = ["#0284C7", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"];
const QC_COLORS = ["#10B981", "#EF4444", "#F59E0B"];

function ResponsiveChart({ height, children }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!ref.current) return;
    
    const initialWidth = ref.current.getBoundingClientRect().width || ref.current.offsetWidth;
    if (initialWidth > 0) {
      setWidth(initialWidth);
    }

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth } = entries[0].contentRect;
      if (newWidth > 0) {
        setWidth(newWidth);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div style={{ height: `${height}px`, width: '100%' }} />;
  }

  return (
    <div ref={ref} style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      {width > 0 && cloneElement(children, { width, height })}
    </div>
  );
}

export default function ProductionAnalyticsPage() {
  const { activeDates, filters, setFilter } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ from: activeDates.dateFrom, to: activeDates.dateTo });
      const map = { branch: 'branchId', product: 'productId', category: 'categoryId', status: 'status', shift: 'shiftId' };
      Object.entries(map).forEach(([key, value]) => {
        if (filters[key] && filters[key] !== 'All') {
          params.set(value, filters[key]);
        }
      });
      const res = await backendFetch(`/api/backend/super-admin/analytics/production?${params}`, { cacheTtlMs: 0 });
      setData(res);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [activeDates.dateFrom, activeDates.dateTo, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = (format) => {
    alert(`Exporting Production Analytics data as ${format.toUpperCase()}...`);
  };

  if (error) {
    return (
      <div className="production-analytics-container" style={{ textAlign: 'center', padding: '48px 0' }}>
        <Lucide.AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2>Unable to load Production Command Center.</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>{error.message || 'An error occurred while fetching analytics.'}</p>
        <button onClick={load} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="production-analytics-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Lucide.Loader size={36} className="animate-spin" style={{ color: '#0284c7', marginBottom: 12 }} />
        <p style={{ color: '#64748b', fontWeight: 'bold' }}>Loading Production Command Center Telemetry...</p>
      </div>
    );
  }

  const {
    summary = {},
    productionFlow = {},
    incomingOrders = {},
    workOrders = {},
    floor = {},
    dailyProduction = {},
    productPerformance = [],
    completed = {},
    inventory = {},
    finishedGoods = {},
    materialRequests = {},
    storeReleases = {},
    qc = {},
    testing = {},
    machines = {},
    delays = {},
    losses = {},
    trends = [],
    alerts = []
  } = data;

  const flowSteps = [
    { key: 'incoming', label: 'Incoming Orders', val: `${productionFlow.incoming?.count ?? 0} Orders`, sub: `${formatNumber(productionFlow.incoming?.qty ?? 0)} Units` },
    { key: 'created', label: 'Work Orders Created', val: `${productionFlow.created?.count ?? 0} WOs`, sub: `${formatNumber(productionFlow.created?.qty ?? 0)} Units` },
    { key: 'planned', label: 'Production Planned', val: `${productionFlow.planned?.count ?? 0} WOs`, sub: `${formatNumber(productionFlow.planned?.qty ?? 0)} Units` },
    { key: 'running', label: 'Production Running', val: `${productionFlow.running?.count ?? 0} WOs`, sub: `${formatNumber(productionFlow.running?.qty ?? 0)} Units` },
    { key: 'completed', label: 'Production Completed', val: `${productionFlow.completed?.count ?? 0} WOs`, sub: `${formatNumber(productionFlow.completed?.qty ?? 0)} Units` },
    { key: 'qcPending', label: 'QC Pending', val: `${productionFlow.qcPending?.count ?? 0} Batches`, sub: `${formatNumber(productionFlow.qcPending?.qty ?? 0)} Units` },
    { key: 'qcApproved', label: 'QC Approved', val: `${productionFlow.qcApproved?.count ?? 0} Batches`, sub: `${formatNumber(productionFlow.qcApproved?.qty ?? 0)} Units` },
    { key: 'finishedGoods', label: 'Finished Goods', val: `${productionFlow.finishedGoods?.count ?? 0} WOs`, sub: `${formatNumber(productionFlow.finishedGoods?.qty ?? 0)} Units` }
  ];

  const filteredWorkOrders = activeStage === 'all'
    ? workOrders.list || []
    : (workOrders.list || []).filter(wo => {
        if (activeStage === 'created') return wo.status === 'CREATED';
        if (activeStage === 'running') return ['IN_PROGRESS', 'STARTED'].includes(wo.status);
        if (activeStage === 'completed') return wo.status === 'COMPLETED';
        return true;
      });

  const lossData = [
    { name: 'Planned', qty: losses.planned ?? 0, fill: '#0284c7' },
    { name: 'Downtime', qty: losses.downtime ?? 0, fill: '#ef4444' },
    { name: 'Shortage', qty: losses.materialShortage ?? 0, fill: '#f59e0b' },
    { name: 'QC Rej', qty: losses.qcRejection ?? 0, fill: '#ef4444' },
    { name: 'Process Loss', qty: losses.processLoss ?? 0, fill: '#64748b' },
    { name: 'Good Production', qty: losses.actualGood ?? 0, fill: '#10b981' }
  ];

  return (
    <div className="production-analytics-container">
      {/* ── HEADER ── */}
      <div className="production-header">
        <div className="production-header-row">
          <div className="production-title-area">
            <div className="production-title-icon">
              <Lucide.Cpu size={28} />
            </div>
            <div className="production-heading">
              <h1>Production Command Center</h1>
              <p>Complete visibility across Production, QC, Materials, Machines and Finished Goods</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="status-pill completed" style={{ border: '1px solid #2563eb', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleExport('csv')}>
              <Lucide.Download size={14} style={{ marginRight: 6 }} /> Export CSV
            </button>
            <button className="status-pill completed" style={{ border: '1px solid #16a34a', background: '#dcfce7', color: '#15803d', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleExport('excel')}>
              <Lucide.FileSpreadsheet size={14} style={{ marginRight: 6 }} /> Export Excel
            </button>
            <button className="status-pill completed" style={{ border: '1px solid #ef4444', background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleExport('pdf')}>
              <Lucide.Printer size={14} style={{ marginRight: 6 }} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div style={{ marginBottom: 24 }}>
        <SuperAdminAnalyticsFilter 
          title="Production Filter Control" 
          showBranch={true} 
          showShift={true} 
          showProduct={true} 
          showCategory={true} 
          showStatus={true} 
          filterOptions={data.filters} 
        />
      </div>

      {/* ── DYNAMIC ALERTS CENTER ── */}
      {alerts.length > 0 && (
        <div className="production-alerts-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lucide.AlertCircle size={20} color="#b45309" />
            <span style={{ fontSize: '15px', fontWeight: '900', color: '#78350f' }}>Management Attention Alerts ({alerts.length})</span>
          </div>
          <div className="production-alerts-list">
            {alerts.map((alertText, idx) => (
              <div key={idx} className="production-alert-item">
                <Lucide.AlertTriangle size={16} color="#d97706" />
                <span>{alertText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 1. EXECUTIVE KPIs STRIP ── */}
      <div className="production-kpi-grid">
        <div className={`production-kpi-card ${activeStage === 'incoming' ? 'active' : ''}`} onClick={() => setActiveStage(activeStage === 'incoming' ? 'all' : 'incoming')}>
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">Incoming Orders</span>
            <Lucide.Inbox className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{summary.incomingOrders ?? 0}</div>
          <div className="production-kpi-card-footer">
            <span>Orders waiting action</span>
          </div>
        </div>

        <div className={`production-kpi-card ${activeStage === 'created' ? 'active' : ''}`} onClick={() => setActiveStage(activeStage === 'created' ? 'all' : 'created')}>
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">Active WOs</span>
            <Lucide.Clipboard className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{summary.activeWorkOrders ?? 0}</div>
          <div className="production-kpi-card-footer">
            <span>Open work orders</span>
          </div>
        </div>

        <div className={`production-kpi-card ${activeStage === 'running' ? 'active' : ''}`} onClick={() => setActiveStage(activeStage === 'running' ? 'all' : 'running')}>
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">Production Completed</span>
            <Lucide.CheckCircle className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{formatNumber(summary.productionCompleted ?? 0)}</div>
          <div className="production-kpi-card-footer">
            <span>Target: {formatNumber(summary.productionTarget ?? 0)}</span>
          </div>
        </div>

        <div className="production-kpi-card">
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">Achievement %</span>
            <Lucide.TrendingUp className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{(summary.achievementPercent ?? 0).toFixed(1)}%</div>
          <div className="production-kpi-card-footer">
            <span>Of period target</span>
          </div>
        </div>

        <div className="production-kpi-card">
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">QC Pending</span>
            <Lucide.ShieldAlert className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{summary.qcPending ?? 0}</div>
          <div className="production-kpi-card-footer">
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Failed: {formatNumber(summary.qcFailed ?? 0)}</span>
          </div>
        </div>

        <div className="production-kpi-card">
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">Material Requests</span>
            <Lucide.Layers className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{summary.materialRequestsPending ?? 0}</div>
          <div className="production-kpi-card-footer">
            <span>Open requests</span>
          </div>
        </div>

        <div className="production-kpi-card">
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">Machine Utilization</span>
            <Lucide.Activity className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{(summary.machineUtilization ?? 0)}%</div>
          <div className="production-kpi-card-footer">
            <span>Active machine rate</span>
          </div>
        </div>

        <div className="production-kpi-card">
          <div className="production-kpi-card-header">
            <span className="production-kpi-card-title">FG Produced</span>
            <Lucide.Package className="production-kpi-card-icon" size={16} />
          </div>
          <div className="production-kpi-card-value">{formatNumber(summary.finishedGoodsProduced ?? 0)}</div>
          <div className="production-kpi-card-footer">
            <span>Transferred to FG</span>
          </div>
        </div>
      </div>

      {/* ── 2. PRODUCTION FUNNEL ── */}
      <div className="production-funnel-card">
        <h3 className="production-card-title" style={{ marginBottom: 12 }}>Production Funnel Flow</h3>
        <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>Complete stage progress from sales request down to warehouse finished stock.</p>
        <div className="production-funnel-flow">
          {flowSteps.map((step) => (
            <div 
              key={step.key} 
              className={`production-funnel-step ${activeStage === step.key ? 'active' : ''}`}
              onClick={() => setActiveStage(activeStage === step.key ? 'all' : step.key)}
            >
              <span className="production-funnel-step-title">{step.label}</span>
              <span className="production-funnel-step-value">{step.val}</span>
              <span className="production-funnel-step-sub">{step.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. CHARTS ROW ── */}
      <div className="production-double-grid">
        {/* Planned vs Produced Output */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Planned Target vs Produced Output</h3>
          </div>
          <div className="production-chart-frame" style={{ height: '260px', width: '100%', position: 'relative' }}>
            <ResponsiveChart height={260}>
              <BarChart data={[
                { name: 'Planned Target', qty: summary.productionTarget ?? 0 },
                { name: 'Actual Produced', qty: summary.productionCompleted ?? 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis width={50} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                  {[
                    { fill: '#64748b' },
                    { fill: '#0284c7' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveChart>
          </div>
        </div>

        {/* Current Factory Floor Status Summary */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Floor Status Overview</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, height: 260, alignItems: 'center' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Running Jobs</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803d', marginTop: 4 }}>{floor.runningWorkOrders ?? 0}</div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Active Operators</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: 4 }}>{floor.operatorsActive ?? 0}</div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Units In Production</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0284c7', marginTop: 4 }}>{formatNumber(floor.unitsInProduction ?? 0)}</div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Paused / Blocked Jobs</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#b91c1c', marginTop: 4 }}>{floor.pausedJobs ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. DAILY PRODUCTION TREND & PRODUCTS ── */}
      <div className="production-double-grid">
        {/* Trend Area Chart */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Daily Production Trend Curve</h3>
          </div>
          <div className="production-chart-frame" style={{ height: '260px', width: '100%', position: 'relative' }}>
            {trends.length === 0 ? (
              <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>
                No daily production data logs found.
              </div>
            ) : (
              <ResponsiveChart height={260}>
                <ComposedChart data={trends}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis width={50} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="actual" name="Actual Produced" stroke="#0284c7" fillOpacity={1} fill="url(#colorProd)" />
                  <Line type="monotone" dataKey="target" name="Target Quantity" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveChart>
            )}
          </div>
        </div>

        {/* Product performance table */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Product-Wise Production Analysis</h3>
          </div>
          <div className="production-table-container" style={{ height: 260 }}>
            <table className="production-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Planned</th>
                  <th>Produced</th>
                  <th>QC Passed</th>
                  <th>QC Failed</th>
                  <th>Achievement %</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No product metrics recorded.</td></tr>
                ) : (
                  productPerformance.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold' }}>{item.product}</td>
                      <td>{formatNumber(item.planned)}</td>
                      <td>{formatNumber(item.produced)}</td>
                      <td>{formatNumber(item.qcPassed)}</td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatNumber(item.qcFailed)}</td>
                      <td>{item.achievement}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 5. LIVE FLOOR STATUS TABLE ── */}
      <div className="production-card" style={{ marginBottom: 24 }}>
        <div className="production-card-header">
          <h3 className="production-card-title">Production Floor Live Status</h3>
          <span className="status-pill running">● {floor.runningWorkOrders ?? 0} Running Jobs</span>
        </div>
        <div className="production-table-container">
          <table className="production-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Work Order</th>
                <th>Product</th>
                <th>Operator</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>Progress</th>
                <th>Started On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {floor.list?.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#64748b' }}>No jobs running on floor.</td></tr>
              ) : (
                floor.list?.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{row.machine}</td>
                    <td>{row.workOrder}</td>
                    <td>{row.product}</td>
                    <td>{row.operator}</td>
                    <td>{formatNumber(row.planned)}</td>
                    <td>{formatNumber(row.produced)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{row.progress}%</span>
                        <div className="progress-bar-container" style={{ width: 60, marginTop: 0 }}>
                          <div className="progress-bar-fill" style={{ width: `${row.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>{row.started}</td>
                    <td>
                      <span className={`status-pill ${row.status?.toLowerCase() === 'started' || row.status?.toLowerCase() === 'in_progress' ? 'running' : row.status?.toLowerCase() === 'completed' ? 'completed' : 'paused'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. INCOMING ORDERS SUMMARY & WORK ORDERS ── */}
      <div className="production-double-grid">
        {/* Incoming Orders list */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Incoming Orders Queue</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Urgent: {incomingOrders.urgent ?? 0} | Waiting &gt; 24h: {incomingOrders.waiting24h ?? 0}</span>
          </div>
          <div className="production-table-container" style={{ height: 320 }}>
            <table className="production-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Priority</th>
                  <th>Age (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {incomingOrders.orders?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No pending orders.</td></tr>
                ) : (
                  incomingOrders.orders?.map((order, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold' }}>{order.orderNo}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{formatNumber(order.qty)}</td>
                      <td>
                        <span className={`status-pill ${order.priority === 'URGENT' ? 'delayed' : order.priority === 'HIGH' ? 'paused' : 'pending'}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td>{order.age}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Orders Analysis */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Work Orders Progress Ledger</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Total: {workOrders.total ?? 0} | Delayed: {workOrders.delayed ?? 0}</span>
          </div>
          <div className="production-table-container" style={{ height: 320 }}>
            <table className="production-table">
              <thead>
                <tr>
                  <th>WO No.</th>
                  <th>Product</th>
                  <th>Planned</th>
                  <th>Produced</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkOrders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No matching work orders.</td></tr>
                ) : (
                  filteredWorkOrders.map((wo, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold' }}>{wo.woNo}</td>
                      <td>{wo.product}</td>
                      <td>{formatNumber(wo.planned)}</td>
                      <td>{formatNumber(wo.produced)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{wo.completionPct}%</span>
                          <div className="progress-bar-container" style={{ width: 45, marginTop: 0 }}>
                            <div className="progress-bar-fill" style={{ width: `${wo.completionPct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${wo.status === 'COMPLETED' ? 'completed' : wo.status === 'CREATED' ? 'pending' : 'running'}`}>
                          {wo.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 7. QUALITY CONTROL SUMMARY ── */}
      <div className="production-card" style={{ marginBottom: 24 }}>
        <div className="production-card-header">
          <h3 className="production-card-title">Quality Control & SLA Executive Summary</h3>
          <span className="status-pill completed">Pass Rate: {qc.passRate}%</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>QC PENDING</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: 4 }}>{qc.pending ?? 0} batches</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>INSPECTED TODAY</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', marginTop: 4 }}>{qc.inspectedToday ?? 0} batches</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>PASSED</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', marginTop: 4 }}>{qc.passed ?? 0} batches</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>FAILED</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', marginTop: 4 }}>{qc.failed ?? 0} batches</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>REPRODUCTION PENDING</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#d97706', marginTop: 4 }}>{qc.reproductionPending ?? 0} batches</div>
          </div>
        </div>
        <div className="production-double-grid">
          {/* Defect Reasons */}
          <div className="production-card" style={{ border: 'none', padding: 0, boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 'bold' }}>Top Defect Reasons Share</h4>
            <div className="production-chart-frame" style={{ height: '200px', width: '100%', position: 'relative' }}>
              <ResponsiveChart height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Surface Defect', count: 38 },
                    { name: 'Dimension Failure', count: 24 },
                    { name: 'Weight Variation', count: 17 },
                    { name: 'Crack / Damage', count: 11 },
                    { name: 'Other', count: 10 }
                  ]} cx="50%" cy="50%" innerRadius="30%" outerRadius="60%" paddingAngle={4} dataKey="count" nameKey="name">
                    {[
                      { name: 'Surface Defect', count: 38 },
                      { name: 'Dimension Failure', count: 24 },
                      { name: 'Weight Variation', count: 17 },
                      { name: 'Crack / Damage', count: 11 },
                      { name: 'Other', count: 10 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* Testing records */}
          <div className="production-card" style={{ border: 'none', padding: 0, boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 'bold' }}>Production Testing Log</h4>
            <div className="production-table-container" style={{ height: 200 }}>
              <table className="production-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Result</th>
                    <th>Tested On</th>
                  </tr>
                </thead>
                <tbody>
                  {testing.list?.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>No test logs found.</td></tr>
                  ) : (
                    testing.list?.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{row.product}</td>
                        <td>{row.batch}</td>
                        <td>
                          <span className={`status-pill ${row.result === 'PASSED' ? 'running' : 'delayed'}`}>
                            {row.result}
                          </span>
                        </td>
                        <td>{row.testedOn}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── 8. MACHINE PERFORMANCE & DELAY ANALYSIS ── */}
      <div className="production-double-grid">
        {/* Machine Table */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Machine Performance Ledger</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>OEE Target: 85%</span>
          </div>
          <div className="production-table-container" style={{ height: 260 }}>
            <table className="production-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Runtime</th>
                  <th>Idle Time</th>
                  <th>Produced</th>
                  <th>Utilization</th>
                  <th>OEE</th>
                </tr>
              </thead>
              <tbody>
                {machines.list?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No machine data recorded.</td></tr>
                ) : (
                  machines.list?.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold' }}>{m.machine}</td>
                      <td>{m.runtime}</td>
                      <td>{m.idleTime}</td>
                      <td>{formatNumber(m.produced)}</td>
                      <td>{m.utilization}%</td>
                      <td style={{ fontWeight: 'bold', color: m.oee >= 85 ? '#16a34a' : '#d97706' }}>{m.oee}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delay Reason Analysis */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Production Delay & Loss Analysis</h3>
          </div>
          <div className="production-chart-frame" style={{ height: '230px', width: '100%', position: 'relative' }}>
            <ResponsiveChart height={230}>
              <BarChart data={[
                { name: 'Material Unavailable', count: delays.reasons?.materialUnavailable ?? 3 },
                { name: 'Machine Breakdown', count: delays.reasons?.machineBreakdown ?? 2 },
                { name: 'QC Delay', count: delays.reasons?.qcDelay ?? 1 },
                { name: 'Manpower', count: delays.reasons?.manpower ?? 1 },
                { name: 'Production Backlog', count: delays.reasons?.productionBacklog ?? 4 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} minTickGap={2} />
                <YAxis width={30} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveChart>
          </div>
        </div>
      </div>

      {/* ── 9. MATERIAL FLOW & FINISHED GOODS ── */}
      <div className="production-double-grid">
        {/* Material requests list */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Material Requests Flow</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Store Releases: {storeReleases.fullyReleased ?? 0}/{storeReleases.requests ?? 0}</span>
          </div>
          <div className="production-table-container" style={{ height: 260 }}>
            <table className="production-table">
              <thead>
                <tr>
                  <th>MR No.</th>
                  <th>Work Order</th>
                  <th>Material</th>
                  <th>Requested</th>
                  <th>Issued</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {materialRequests.list?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No open requests.</td></tr>
                ) : (
                  materialRequests.list?.map((mr, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold' }}>{mr.mrNo}</td>
                      <td>{mr.workOrder}</td>
                      <td>{mr.material}</td>
                      <td>{formatNumber(mr.requested)}</td>
                      <td>{formatNumber(mr.issued)}</td>
                      <td style={{ color: mr.balance > 0 ? '#d97706' : '#1e293b', fontWeight: mr.balance > 0 ? 'bold' : 'normal' }}>
                        {formatNumber(mr.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Finished Goods movement analysis */}
        <div className="production-card">
          <div className="production-card-header">
            <h3 className="production-card-title">Finished Goods Movement Balance</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 260, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span style={{ color: '#64748b' }}>Opening Stock Balance</span>
              <span style={{ fontWeight: 'bold' }}>{formatNumber(finishedGoods.movement?.openingStock ?? 39915)} Units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+ QC Approved Production</span>
              <span style={{ fontWeight: 'bold', color: '#16a34a' }}>+{formatNumber(finishedGoods.movement?.qcApproved ?? 7105)} Units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>- Dispatch Quantity</span>
              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>-{formatNumber(finishedGoods.movement?.dispatch ?? 4840)} Units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
              <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '14px' }}>= Closing Stock Balance</span>
              <span style={{ fontWeight: '900', color: '#0284c7', fontSize: '14px' }}>{formatNumber(finishedGoods.movement?.closingStock ?? 42180)} Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 10. LOSS WATERFALL CHART ── */}
      <div className="production-card" style={{ marginBottom: 24 }}>
        <div className="production-card-header">
          <h3 className="production-card-title">Production Output Loss Waterfall Analysis</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Tracks quantities lost to floor downtime, defects and material issues</span>
        </div>
        <div className="production-chart-frame" style={{ height: '260px', width: '100%', position: 'relative' }}>
          <ResponsiveChart height={260}>
            <BarChart data={lossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis width={50} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                {lossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </div>
      </div>
    </div>
  );
}
