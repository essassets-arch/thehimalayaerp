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
import './DispatchAnalyticsPage.css';

import ResponsiveChart from '../../../shared/components/ResponsiveChart';

const CHART_COLORS = ["#0284C7", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#64748B"];
const REASON_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#64748B"];

export default function DispatchAnalyticsPage() {
  const { activeDates, filters } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState('all');
  const [tempType, setTempType] = useState('All');
  const [tempTransporter, setTempTransporter] = useState('All');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ from: activeDates.dateFrom, to: activeDates.dateTo });
      
      const filterMap = {
        branch: 'branchId',
        product: 'productId',
        category: 'categoryId',
        status: 'dispatchStatus',
        salesperson: 'salesExecutiveId',
      };
      
      Object.entries(filterMap).forEach(([key, value]) => {
        if (filters[key] && filters[key] !== 'All') {
          params.set(value, filters[key]);
        }
      });

      if (tempType !== 'All') params.set('dispatchType', tempType);
      if (tempTransporter !== 'All') params.set('transporterId', tempTransporter);

      const res = await backendFetch(`/api/backend/super-admin/analytics/dispatch?${params}`, { cacheTtlMs: 0 });
      setData(res);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [activeDates.dateFrom, activeDates.dateTo, filters, tempType, tempTransporter]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="dispatch-analytics-container" style={{ textAlign: 'center', padding: '48px 0' }}>
        <Lucide.AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2>Unable to load Dispatch Command Center.</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>{error.message || 'An error occurred while fetching analytics.'}</p>
        <button onClick={load} className="dispatch-analytics-btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="dispatch-analytics-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Lucide.Loader size={36} className="animate-spin" style={{ color: '#0284c7', marginBottom: 12 }} />
        <p style={{ color: '#64748b', fontWeight: 'bold' }}>Loading Dispatch Command Center Telemetry...</p>
      </div>
    );
  }

  const {
    flow = {},
    transportCost = {},
    dailyDispatch = {},
    readyOrders = {},
    remainingDispatch = {},
    delivery = {},
    products = [],
    customers = [],
    salespersons = [],
    categories = {},
    samples = {},
    replacements = {},
    returns = {},
    logistics = {},
    inventoryReconciliation = {},
    delays = {},
    history = {},
    performance = {},
    alerts = []
  } = data;

  const dailyTrends = dailyDispatch.trends || [];

  const handleExport = (format) => {
    alert(`Exporting Dispatch Analytics data as ${format.toUpperCase()}...`);
  };

  const customFilters = (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <select 
        value={tempType} 
        onChange={(e) => setTempType(e.target.value)}
        className="sa-analytics-filter__select"
      >
        <option value="All">Type: All Dispatches</option>
        <option value="sales-order">Sales Order Dispatch</option>
        <option value="sample">Sample Dispatch</option>
        <option value="replacement">Replacement Dispatch</option>
        <option value="return">Return Pickup</option>
      </select>
      <select 
        value={tempTransporter} 
        onChange={(e) => setTempTransporter(e.target.value)}
        className="sa-analytics-filter__select"
      >
        <option value="All">Transporter: All</option>
        {(data.filters?.transporters || []).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="dispatch-analytics-container">
      {/* ── HEADER BLOCK ── */}
      <div className="dispatch-analytics-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="dispatch-analytics-header-icon">
            <Lucide.Truck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="dispatch-analytics-title">Dispatch Command Center</h1>
              <span className="dispatch-analytics-badge">LOGISTICS TELEMETRY</span>
            </div>
            <p className="dispatch-analytics-subtitle">Real-time tracking of dispatch funnel, sample conversion, replacements, returns, and inventory allocations.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleExport('pdf')} className="dispatch-analytics-btn-outline">
            <Lucide.FileText size={16} /> Export PDF
          </button>
          <button onClick={() => handleExport('excel')} className="dispatch-analytics-btn-outline">
            <Lucide.FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div style={{ marginBottom: 24 }}>
        <SuperAdminAnalyticsFilter 
          title="Logistics Filter Control"
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

      {/* ── TRANSPORT COST VARIANCE ── */}
      <div className="dispatch-cost-section">
        <div className="dispatch-cost-card">
          <div className="dispatch-cost-card-header">
            <div>
              <span className="dispatch-cost-title">This Month Transport Cost</span>
              <div className="dispatch-cost-amount">{formatCurrency(transportCost.thisMonthTransportCost)}</div>
            </div>
            <div className="dispatch-cost-icon-box orange">
              <Lucide.DollarSign size={20} />
            </div>
          </div>
          <div className="dispatch-cost-footer">
            <span>Last Month: <strong>{formatCurrency(transportCost.lastMonthTransportCost)}</strong></span>
            <span className="dispatch-cost-trend red">MoM Change: <strong>{transportCost.costChangePercent >= 0 ? '+' : ''}{transportCost.costChangePercent}%</strong></span>
          </div>
        </div>

        <div className="dispatch-cost-card span-two">
          <div className="dispatch-cost-card-header">
            <div>
              <span className="dispatch-cost-title">Quotation Estimate vs Actual Transport Cost (Variance)</span>
              <div className="dispatch-cost-badge-budget">{formatCurrency(transportCost.varianceAmount)} Over Budget</div>
            </div>
            <div className="dispatch-cost-icon-box blue">
              <Lucide.Percent size={20} />
            </div>
          </div>
          <div className="dispatch-cost-variance-grid">
            <div className="dispatch-cost-variance-item">
              <span className="label">EXPECTED (QUOTATION)</span>
              <strong className="value blue">{formatCurrency(transportCost.expectedTransportCost)}</strong>
            </div>
            <div className="dispatch-cost-variance-item">
              <span className="label">ACTUAL DISPATCH COST</span>
              <strong className="value red">{formatCurrency(transportCost.actualTransportCost)}</strong>
            </div>
            <div className="dispatch-cost-variance-item highlight">
              <span className="label">VARIANCE</span>
              <strong className="value danger">+{formatCurrency(transportCost.varianceAmount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXECUTIVE KPIs ── */}
      <div className="dispatch-kpis-grid">
        <div className="dispatch-kpi-card" onClick={() => setActiveStage('ready')}>
          <div className="dispatch-kpi-header">
            <span className="label">Ready for Dispatch</span>
            <Lucide.Archive size={18} color="#0284c7" />
          </div>
          <div className="value">{flow.ready?.count ?? 0}</div>
          <p className="sub">Orders waiting in queue</p>
        </div>
        <div className="dispatch-kpi-card" onClick={() => setActiveStage('created')}>
          <div className="dispatch-kpi-header">
            <span className="label">Dispatches Created</span>
            <Lucide.PlusCircle size={18} color="#10b981" />
          </div>
          <div className="value">{flow.created?.count ?? 0}</div>
          <p className="sub">Created in selected period</p>
        </div>
        <div className="dispatch-kpi-card" onClick={() => setActiveStage('inTransit')}>
          <div className="dispatch-kpi-header">
            <span className="label">In Transit</span>
            <Lucide.Truck size={18} color="#f59e0b" />
          </div>
          <div className="value">{flow.inTransit?.count ?? 0}</div>
          <p className="sub">Active shipments moving</p>
        </div>
        <div className="dispatch-kpi-card" onClick={() => setActiveStage('delivered')}>
          <div className="dispatch-kpi-header">
            <span className="label">Delivered</span>
            <Lucide.FileCheck size={18} color="#10b981" />
          </div>
          <div className="value">{flow.delivered?.count ?? 0}</div>
          <p className="sub">Delivered in period</p>
        </div>
        <div className="dispatch-kpi-card" onClick={() => setActiveStage('remaining')}>
          <div className="dispatch-kpi-header">
            <span className="label">Pending Dispatch</span>
            <Lucide.Clock size={18} color="#ef4444" />
          </div>
          <div className="value">{flow.remaining?.count ?? 0}</div>
          <p className="sub">Awaiting stock or transport</p>
        </div>
        <div className="dispatch-kpi-card">
          <div className="dispatch-kpi-header">
            <span className="label">Remaining Quantity</span>
            <Lucide.Layers size={18} color="#64748b" />
          </div>
          <div className="value">{formatNumber(remainingDispatch.summary?.remainingQuantity ?? 0)}</div>
          <p className="sub">Total units not dispatched</p>
        </div>
        <div className="dispatch-kpi-card">
          <div className="dispatch-kpi-header">
            <span className="label">Samples Dispatched</span>
            <Lucide.FlaskConical size={18} color="#8b5cf6" />
          </div>
          <div className="value">{samples.summary?.totalDispatched ?? 0}</div>
          <p className="sub">Active samples sent</p>
        </div>
        <div className="dispatch-kpi-card">
          <div className="dispatch-kpi-header">
            <span className="label">Replacement Pending</span>
            <Lucide.AlertCircle size={18} color="#f59e0b" />
          </div>
          <div className="value">{replacements.summary?.pending ?? 0}</div>
          <p className="sub">Awaiting replacement dispatch</p>
        </div>
        <div className="dispatch-kpi-card">
          <div className="dispatch-kpi-header">
            <span className="label">Returns In Progress</span>
            <Lucide.RotateCcw size={18} color="#ec4899" />
          </div>
          <div className="value">{returns.summary?.inTransit ?? 0}</div>
          <p className="sub">Return pickups moving</p>
        </div>
        <div className="dispatch-kpi-card">
          <div className="dispatch-kpi-header">
            <span className="label">On-Time Delivery %</span>
            <Lucide.CheckCircle size={18} color="#10b981" />
          </div>
          <div className="value">{delivery.summary?.onTimeDeliveryRate ?? 0}%</div>
          <p className="sub">Delivered within target date</p>
        </div>
        <div className="dispatch-kpi-card">
          <div className="dispatch-kpi-header">
            <span className="label">Delayed Deliveries</span>
            <Lucide.AlertTriangle size={18} color="#ef4444" />
          </div>
          <div className="value">{delivery.summary?.delayedShipments ?? 0}</div>
          <p className="sub">Deliveries beyond promised date</p>
        </div>
        <div className="dispatch-kpi-card">
          <div className="dispatch-kpi-header">
            <span className="label">Total Dispatched Qty</span>
            <Lucide.Layers size={18} color="#0284c7" />
          </div>
          <div className="value">{formatNumber(delivery.summary?.deliveredThisMonth ?? 0)}</div>
          <p className="sub">Total physical units dispatched</p>
        </div>
      </div>

      {/* ── DISPATCH LIFECYCLE FUNNEL ── */}
      <div className="dispatch-card" style={{ marginBottom: 24 }}>
        <h3 className="dispatch-card-title">Dispatch Lifecycle Funnel</h3>
        <div className="dispatch-funnel-container">
          <div className={`dispatch-funnel-node ${activeStage === 'ready' ? 'active' : ''}`} onClick={() => setActiveStage('ready')}>
            <span className="node-title">READY FOR DISPATCH</span>
            <strong className="node-value">{flow.ready?.count ?? 0} Orders</strong>
            <span className="node-sub">{formatNumber(flow.ready?.qty ?? 0)} Units</span>
          </div>
          <div className="dispatch-funnel-arrow">
            <Lucide.ArrowDown size={20} />
          </div>
          <div className={`dispatch-funnel-node ${activeStage === 'created' ? 'active' : ''}`} onClick={() => setActiveStage('created')}>
            <span className="node-title">DISPATCH CREATED</span>
            <strong className="node-value">{flow.created?.count ?? 0} Dispatches</strong>
            <span className="node-sub">{formatNumber(flow.created?.qty ?? 0)} Units</span>
          </div>
          <div className="dispatch-funnel-arrow">
            <Lucide.ArrowDown size={20} />
          </div>
          <div className={`dispatch-funnel-node ${activeStage === 'inTransit' ? 'active' : ''}`} onClick={() => setActiveStage('inTransit')}>
            <span className="node-title">IN TRANSIT</span>
            <strong className="node-value">{flow.inTransit?.count ?? 0} active</strong>
            <span className="node-sub">{formatNumber(flow.inTransit?.qty ?? 0)} Units</span>
          </div>
          <div className="dispatch-funnel-arrow">
            <Lucide.ArrowDown size={20} />
          </div>
          <div className={`dispatch-funnel-node ${activeStage === 'delivered' ? 'active' : ''}`} onClick={() => setActiveStage('delivered')}>
            <span className="node-title">DELIVERED</span>
            <strong className="node-value">{flow.delivered?.count ?? 0} completed</strong>
            <span className="node-sub">{formatNumber(flow.delivered?.qty ?? 0)} Units</span>
          </div>
          <div className="dispatch-funnel-arrow">
            <Lucide.ArrowRight size={20} />
          </div>
          <div className={`dispatch-funnel-node ${activeStage === 'remaining' ? 'active' : ''}`} onClick={() => setActiveStage('remaining')}>
            <span className="node-title">REMAINING BALANCE</span>
            <strong className="node-value">{flow.remaining?.count ?? 0} Orders</strong>
            <span className="node-sub">{formatNumber(flow.remaining?.qty ?? 0)} Units</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>* Clicking any funnel stage details its transactional records in the lists below.</p>
          {activeStage !== 'all' && (
            <button onClick={() => setActiveStage('all')} className="dispatch-analytics-btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
              Reset Filter (Show All)
            </button>
          )}
        </div>
      </div>

      {/* ── STAGE SPECIFIC TABLES / VIEWS ── */}
      {activeStage === 'ready' && (
        <div className="dispatch-card" style={{ marginBottom: 24 }}>
          <h3 className="dispatch-card-title">Ready for Dispatch Analytics</h3>
          <div className="dispatch-grid-three" style={{ marginBottom: 16 }}>
            <div className="dispatch-kpi-subcard">
              <span className="label">Orders Ready</span>
              <strong className="val">{readyOrders.summary?.ordersReady ?? 0}</strong>
            </div>
            <div className="dispatch-kpi-subcard">
              <span className="label">Fully Ready</span>
              <strong className="val text-success">{readyOrders.summary?.fullyReady ?? 0}</strong>
            </div>
            <div className="dispatch-kpi-subcard">
              <span className="label">Partially Ready</span>
              <strong className="val text-warning">{readyOrders.summary?.partiallyReady ?? 0}</strong>
            </div>
          </div>
          <div className="dispatch-table-wrapper">
            <table className="dispatch-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Total Ordered</th>
                  <th>Reserved Qty</th>
                  <th>Dispatchable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {readyOrders.orders?.map((row, idx) => (
                  <tr key={idx}>
                    <td className="bold text-blue-600">{row.orderNo}</td>
                    <td>{row.customerName}</td>
                    <td>{row.orderedQty}</td>
                    <td>{row.reservedQty}</td>
                    <td className="bold text-success">{row.reservedQty}</td>
                    <td><span className="badge badge-success">READY FOR DISPATCH</span></td>
                  </tr>
                ))}
                {(!readyOrders.orders || readyOrders.orders.length === 0) && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No ready orders in the queue.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeStage === 'created' && (
        <div className="dispatch-card" style={{ marginBottom: 24 }}>
          <h3 className="dispatch-card-title">Dispatch Creation Performance</h3>
          <div className="dispatch-grid-three" style={{ marginBottom: 16 }}>
            <div className="dispatch-kpi-subcard">
              <span className="label">Dispatches Created Today</span>
              <strong className="val">{dailyDispatch.summary?.dispatches ?? 0}</strong>
            </div>
            <div className="dispatch-kpi-subcard">
              <span className="label">Orders Covered</span>
              <strong className="val">{dailyDispatch.summary?.orders ?? 0}</strong>
            </div>
            <div className="dispatch-kpi-subcard">
              <span className="label">Total Quantity Dispatched</span>
              <strong className="val">{formatNumber(dailyDispatch.summary?.totalQuantity ?? 0)}</strong>
            </div>
          </div>
          <div className="dispatch-table-wrapper">
            <table className="dispatch-table">
              <thead>
                <tr>
                  <th>Dispatch No.</th>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Qty Dispatched</th>
                  <th>Transporter</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentPeriodDispatches.map((d, idx) => (
                  <tr key={idx}>
                    <td className="bold">{d.dispatchNo}</td>
                    <td className="text-blue-600">{d.salesOrder?.orderNumber}</td>
                    <td>{d.salesOrder?.customer?.companyName}</td>
                    <td>{d.items?.reduce((s, i) => s + toNumber(i.quantity), 0)}</td>
                    <td>{d.transporterName || '—'}</td>
                    <td>{d.vehicleNumber || '—'}</td>
                    <td><span className="badge badge-info">{d.status.replaceAll('_', ' ')}</span></td>
                  </tr>
                ))}
                {currentPeriodDispatches.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>No dispatches created in this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DAILY DISPATCH REPORT & TRENDS ── */}
      <div className="dispatch-double-grid">
        <div className="dispatch-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="dispatch-card-title">Daily Dispatch Trend</h3>
            <span className="badge badge-info">Interactive Telemetry</span>
          </div>
          <ResponsiveChart height={300}>
            <ComposedChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '11px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="qty" name="Qty Dispatched" fill="#0284C7" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="delivered" name="Delivered Count" stroke="#10B981" strokeWidth={2.5} />
              <Line type="monotone" dataKey="pending" name="Pending Count" stroke="#EF4444" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveChart>
        </div>

        <div className="dispatch-card">
          <h3 className="dispatch-card-title">Today's Dispatch Summary</h3>
          <div className="dispatch-report-grid">
            <div className="dispatch-report-item">
              <span className="label">Dispatches Created</span>
              <strong className="val">{dailyDispatch.summary?.dispatches ?? 0}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Orders Covered</span>
              <strong className="val">{dailyDispatch.summary?.orders ?? 0}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Total Quantity</span>
              <strong className="val">{formatNumber(dailyDispatch.summary?.totalQuantity ?? 0)}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Customers Served</span>
              <strong className="val">{dailyDispatch.summary?.customers ?? 0}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Vehicles Active</span>
              <strong className="val">{dailyDispatch.summary?.vehiclesUsed ?? 0}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Delivered Today</span>
              <strong className="val text-success">{dailyDispatch.summary?.delivered ?? 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── REMAINING DISPATCH BACKLOGS ── */}
      <div className="dispatch-card" style={{ marginBottom: 24 }}>
        <h3 className="dispatch-card-title">Remaining Dispatch Backlogs</h3>
        <div className="dispatch-grid-four" style={{ marginBottom: 20 }}>
          <div className="dispatch-kpi-subcard">
            <span className="label">Orders with Balance</span>
            <strong className="val text-danger">{remainingDispatch.summary?.ordersWithBalance ?? 0}</strong>
          </div>
          <div className="dispatch-kpi-subcard">
            <span className="label">Remaining Quantity</span>
            <strong className="val">{formatNumber(remainingDispatch.summary?.remainingQuantity ?? 0)}</strong>
          </div>
          <div className="dispatch-kpi-subcard">
            <span className="label">Critical Pending (&gt;7 Days)</span>
            <strong className="val text-danger">{remainingDispatch.summary?.criticalPendingOrders ?? 0}</strong>
          </div>
          <div className="dispatch-kpi-subcard">
            <span className="label">Past Target Date</span>
            <strong className="val text-warning">{remainingDispatch.summary?.pastTargetDate ?? 0}</strong>
          </div>
        </div>

        <div className="dispatch-double-grid" style={{ marginBottom: 20 }}>
          <div className="dispatch-table-wrapper" style={{ maxHeight: '350px' }}>
            <table className="dispatch-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Ordered</th>
                  <th>Dispatched</th>
                  <th>Remaining</th>
                  <th>Age (Days)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {remainingDispatch.orders?.map((row, idx) => (
                  <tr key={idx}>
                    <td className="bold text-blue-600">{row.orderNo}</td>
                    <td>{row.customerName}</td>
                    <td>{row.orderedQty}</td>
                    <td>{row.dispatchedQty}</td>
                    <td className="bold text-danger">{row.remainingQty}</td>
                    <td className={row.age > 4 ? "bold text-danger" : ""}>{row.age} days</td>
                    <td><span className="badge badge-warning">{row.status}</span></td>
                  </tr>
                ))}
                {(!remainingDispatch.orders || remainingDispatch.orders.length === 0) && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>No pending backlogs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="dispatch-sub-title" style={{ marginTop: 0 }}>Backlog Aging Distribution</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="dispatch-kpi-subcard small">
                <span className="label">0–1 Day</span>
                <strong className="val text-success">{remainingDispatch.aging?.aging0to1 ?? 0} Orders</strong>
              </div>
              <div className="dispatch-kpi-subcard small">
                <span className="label">2–3 Days</span>
                <strong className="val text-info">{remainingDispatch.aging?.aging2to3 ?? 0} Orders</strong>
              </div>
              <div className="dispatch-kpi-subcard small">
                <span className="label">4–7 Days</span>
                <strong className="val text-warning">{remainingDispatch.aging?.aging4to7 ?? 0} Orders</strong>
              </div>
              <div className="dispatch-kpi-subcard small">
                <span className="label">&gt; 7 Days</span>
                <strong className="val text-danger">{remainingDispatch.aging?.agingMoreThan7 ?? 0} Orders</strong>
              </div>
            </div>
            <div className="dispatch-report-item" style={{ marginTop: 16 }}>
              <span className="label">Oldest Pending Dispatch</span>
              <strong style={{ fontSize: '18px', color: '#ef4444' }}>{remainingDispatch.aging?.oldestPendingDays ?? 0} Days</strong>
            </div>
            <div className="dispatch-report-item" style={{ marginTop: 8 }}>
              <span className="label">Average Waiting Time</span>
              <strong style={{ fontSize: '18px' }}>{remainingDispatch.aging?.averageWaitingDays ?? 0} Days</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── DELIVERY PERFORMANCE ── */}
      <div className="dispatch-card" style={{ marginBottom: 24 }}>
        <h3 className="dispatch-card-title">Delivery Performance</h3>
        <div className="dispatch-grid-four" style={{ marginBottom: 20 }}>
          <div className="dispatch-kpi-subcard">
            <span className="label">Delivered Today</span>
            <strong className="val text-success">{delivery.summary?.deliveredToday ?? 0}</strong>
          </div>
          <div className="dispatch-kpi-subcard">
            <span className="label">Delivered This Month</span>
            <strong className="val">{delivery.summary?.deliveredThisMonth ?? 0}</strong>
          </div>
          <div className="dispatch-kpi-subcard">
            <span className="label">On-Time Deliveries</span>
            <strong className="val text-success">{delivery.summary?.onTime ?? 0}</strong>
          </div>
          <div className="dispatch-kpi-subcard">
            <span className="label">Average Transit Time</span>
            <strong className="val">{delivery.summary?.avgTransitTime ?? 0} Days</strong>
          </div>
        </div>

        <div className="dispatch-double-grid">
          <div>
            <h4 className="dispatch-sub-title">Transporter Performance Scorecard</h4>
            <div className="dispatch-table-wrapper">
              <table className="dispatch-table">
                <thead>
                  <tr>
                    <th>Transporter</th>
                    <th>Shipments</th>
                    <th>Delivered</th>
                    <th>Delayed</th>
                    <th>Avg Transit</th>
                    <th>On-Time %</th>
                  </tr>
                </thead>
                <tbody>
                  {delivery.transporters?.map((row, idx) => (
                    <tr key={idx}>
                      <td className="bold">{row.transporter}</td>
                      <td>{row.shipments}</td>
                      <td>{row.delivered}</td>
                      <td className="text-danger">{row.delayed}</td>
                      <td>{row.avgTransit} Days</td>
                      <td className="bold text-success">{row.onTimePct}%</td>
                    </tr>
                  ))}
                  {(!delivery.transporters || delivery.transporters.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No transporter records available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dispatch-kpi-subcard" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 className="dispatch-sub-title" style={{ marginTop: 0 }}>Logistics Performance Index</h4>
            <div className="dispatch-report-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="dispatch-report-item">
                <span className="label">Fastest Transit Delivery</span>
                <strong className="text-success">{delivery.summary?.fastestDelivery ?? 0} Days</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Longest Transit Delivery</span>
                <strong className="text-danger">{delivery.summary?.longestDelivery ?? 0} Days</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Delayed Shipments in queue</span>
                <strong className="text-warning">{delivery.summary?.delayedShipments ?? 0} Shipments</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── D1 / D2 PERFORMANCE SCORECARD ── */}
      <div className="dispatch-card" style={{ marginBottom: 24 }}>
        <h3 className="dispatch-card-title">D1 / D2 Performance Comparison</h3>
        <div className="dispatch-double-grid">
          <div className="dispatch-kpi-subcard">
            <h4 className="dispatch-sub-title text-blue-600">DISPATCH 1 (Executive)</h4>
            <div className="dispatch-report-grid">
              <div className="dispatch-report-item">
                <span className="label">Ready Orders</span>
                <strong>{categories.dispatch1?.readyOrders ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Dispatches Today</span>
                <strong>{categories.dispatch1?.dispatchesToday ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Qty Dispatched</span>
                <strong>{formatNumber(categories.dispatch1?.qtyDispatched ?? 0)}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Pending Dispatch</span>
                <strong>{categories.dispatch1?.pending ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="dispatch-kpi-subcard">
            <h4 className="dispatch-sub-title text-purple-600">DISPATCH 2 (Store)</h4>
            <div className="dispatch-report-grid">
              <div className="dispatch-report-item">
                <span className="label">Ready Orders</span>
                <strong>{categories.dispatch2?.readyOrders ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Dispatches Today</span>
                <strong>{categories.dispatch2?.dispatchesToday ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Qty Dispatched</span>
                <strong>{formatNumber(categories.dispatch2?.qtyDispatched ?? 0)}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Pending Dispatch</span>
                <strong>{categories.dispatch2?.pending ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SAMPLES, REPLACEMENTS & RETURNS ── */}
      <div className="dispatch-double-grid" style={{ marginBottom: 24 }}>
        <div className="dispatch-card">
          <h3 className="dispatch-card-title">Sample Dispatch Analytics</h3>
          <div className="dispatch-grid-three" style={{ marginBottom: 12 }}>
            <div className="dispatch-kpi-subcard small">
              <span className="label">Ready / Transit</span>
              <strong>{samples.summary?.samplesReady ?? 0} / {samples.summary?.samplesInTransit ?? 0}</strong>
            </div>
            <div className="dispatch-kpi-subcard small">
              <span className="label">Delivered</span>
              <strong>{samples.summary?.samplesDelivered ?? 0}</strong>
            </div>
            <div className="dispatch-kpi-subcard small">
              <span className="label">Overdue</span>
              <strong className="text-danger">{samples.summary?.samplesOverdue ?? 0}</strong>
            </div>
          </div>

          <h4 className="dispatch-sub-title">Sample Conversion Insights</h4>
          <div className="dispatch-report-grid" style={{ marginBottom: 16 }}>
            <div className="dispatch-report-item">
              <span className="label">Samples Dispatched</span>
              <strong>{samples.summary?.totalDispatched ?? 0}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Samples Delivered</span>
              <strong>{samples.summary?.samplesDelivered ?? 0}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Samples Accepted</span>
              <strong>{samples.summary?.totalAccepted ?? 0}</strong>
            </div>
            <div className="dispatch-report-item">
              <span className="label">Converted to Business</span>
              <strong className="text-success">{samples.summary?.converted ?? 0}</strong>
            </div>
          </div>

          <div className="dispatch-table-wrapper" style={{ maxHeight: '200px' }}>
            <table className="dispatch-table small">
              <thead>
                <tr>
                  <th>Sample No</th>
                  <th>Customer/Lead</th>
                  <th>Status</th>
                  <th>Testing</th>
                </tr>
              </thead>
              <tbody>
                {samples.records?.map((row, idx) => (
                  <tr key={idx}>
                    <td className="bold">{row.sampleNo}</td>
                    <td>{row.customerName}</td>
                    <td>{row.deliveryStatus}</td>
                    <td>{row.testingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dispatch-card">
          <h3 className="dispatch-card-title">Replacements & Returns</h3>
          <div className="dispatch-kpi-subcard" style={{ marginBottom: 16 }}>
            <h4 className="dispatch-sub-title" style={{ margin: '0 0 8px 0' }}>Replacement Requests ({replacements.summary?.replacementRequests ?? 0})</h4>
            <div className="dispatch-report-grid">
              <div className="dispatch-report-item">
                <span className="label">Approved</span>
                <strong>{replacements.summary?.approved ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Ready / Shipped</span>
                <strong>{replacements.summary?.readyForDispatch ?? 0} / {replacements.summary?.inTransit ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Replacement Rate</span>
                <strong className="text-danger">{replacements.summary?.replacementRate ?? 0}%</strong>
              </div>
            </div>
          </div>

          <div className="dispatch-kpi-subcard">
            <h4 className="dispatch-sub-title" style={{ margin: '0 0 8px 0' }}>Sales Returns ({returns.summary?.returnRequests ?? 0})</h4>
            <div className="dispatch-report-grid">
              <div className="dispatch-report-item">
                <span className="label">Pickup Pending</span>
                <strong>{returns.summary?.pickupPending ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Received / Closed</span>
                <strong>{returns.summary?.received ?? 0} / {returns.summary?.closed ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Return Rate</span>
                <strong className="text-danger">{returns.summary?.returnRate ?? 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCT DISPATCH PERFORMANCE ── */}
      <div className="dispatch-card" style={{ marginBottom: 24 }}>
        <h3 className="dispatch-card-title">Product-Wise Dispatch Summary</h3>
        <div className="dispatch-table-wrapper">
          <table className="dispatch-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Ready FG</th>
                <th>Reserved Against Order</th>
                <th>Dispatched Qty</th>
                <th>Remaining Order Qty</th>
                <th>Delivered</th>
                <th>Returns</th>
                <th>Replacements</th>
              </tr>
            </thead>
            <tbody>
              {products.map((row, idx) => (
                <tr key={idx}>
                  <td className="bold">{row.product}</td>
                  <td>{row.readyFG}</td>
                  <td>{row.reserved}</td>
                  <td className="bold text-blue-600">{row.dispatched}</td>
                  <td className="bold text-danger">{row.remaining}</td>
                  <td className="text-success">{row.delivered}</td>
                  <td>{row.returnQty}</td>
                  <td>{row.replacementQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FG & RESERVATION RECONCILIATION ── */}
      <div className="dispatch-card" style={{ marginBottom: 24 }}>
        <h3 className="dispatch-card-title">FG &amp; Reservation Reconciliation</h3>
        <div className="dispatch-reconciliation-flow">
          <div className="reconciliation-node">
            <span className="label">FG AVAILABLE</span>
            <strong className="val">{formatNumber(inventoryReconciliation.finishedGoods ?? 0)}</strong>
          </div>
          <div className="reconciliation-arrow"><Lucide.ArrowRight /></div>
          <div className="reconciliation-node">
            <span className="label">RESERVED</span>
            <strong className="val">{formatNumber(inventoryReconciliation.reservations ?? 0)}</strong>
          </div>
          <div className="reconciliation-arrow"><Lucide.ArrowRight /></div>
          <div className="reconciliation-node">
            <span className="label">DISPATCH READY</span>
            <strong className="val">{formatNumber(inventoryReconciliation.dispatchReady ?? 0)}</strong>
          </div>
          <div className="reconciliation-arrow"><Lucide.ArrowRight /></div>
          <div className="reconciliation-node">
            <span className="label">STOCK DEDUCTED</span>
            <strong className="val">{formatNumber(inventoryReconciliation.dispatched ?? 0)}</strong>
          </div>
        </div>

        <h4 className="dispatch-sub-title" style={{ marginTop: 24 }}>Reservation &amp; Transaction Mismatch Exceptions</h4>
        <div className="dispatch-table-wrapper">
          <table className="dispatch-table">
            <thead>
              <tr>
                <th>Exception Code</th>
                <th>Severity</th>
                <th>Detailed Mismatch Message</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReconciliation.mismatches?.map((m, idx) => (
                <tr key={idx}>
                  <td className="bold danger-text">{m.type}</td>
                  <td>
                    <span className={`badge ${m.severity === 'CRITICAL' ? 'badge-danger' : m.severity === 'WARNING' ? 'badge-warning' : 'badge-info'}`}>
                      {m.severity}
                    </span>
                  </td>
                  <td>{m.message}</td>
                </tr>
              ))}
              {(!inventoryReconciliation.mismatches || inventoryReconciliation.mismatches.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>✓ All stock allocations, reservations, and dispatch transactions are fully reconciled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EXCEPTIONS & MANAGEMENT ALERTS ── */}
      <div className="dispatch-alerts-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Lucide.AlertCircle size={20} color="#b45309" />
          <span className="dispatch-alerts-title">Management Attention Alerts ({alerts.length})</span>
        </div>
        <div className="dispatch-alerts-list">
          {alerts.map((alertText, idx) => (
            <div key={idx} className="dispatch-alert-item">
              <Lucide.AlertTriangle size={16} color="#d97706" />
              <span>{alertText}</span>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="dispatch-alert-item success">
              <Lucide.CheckCircle size={16} color="#10b981" />
              <span>No outstanding logistics exceptions or dispatch backlogs reported today.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
