'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Lucide from 'lucide-react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { backendFetch } from '@/lib/backendFetch';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import './DispatchAnalyticsPage.css';
import ResponsiveChart from '../../../shared/components/ResponsiveChart';
import { exportToExcel, exportDispatchReportPDF } from '../../../services/export.service';

const CHART_COLORS = ['#0284C7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

export default function DispatchAnalyticsPage() {
  const { activeDates, filters, period } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'manifest' | 'transporters' | 'products' | 'backlog' | 'reverse' | 'audit'

  // Interactive funnel stage filter
  const [activeStage, setActiveStage] = useState('all'); // 'all' | 'ready' | 'created' | 'inTransit' | 'delivered' | 'remaining'

  // Custom manifest search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tempType, setTempType] = useState('All');
  const [tempTransporter, setTempTransporter] = useState('All');
  const [tempCategory, setTempCategory] = useState('All');
  const [tempSla, setTempSla] = useState('All');
  const [tempStage, setTempStage] = useState('All');

  // Pagination for live manifest
  const [manifestPage, setManifestPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modal inspection
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        from: activeDates?.dateFrom || '',
        to: activeDates?.dateTo || '',
      });
      if (period) {
        params.set('period', period);
      }

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
      if (tempCategory !== 'All') params.set('dispatchCategory', tempCategory);

      const res = await backendFetch(`/api/backend/super-admin/analytics/dispatch?${params}`, {
        cacheTtlMs: 0,
      });
      setData(res);
    } catch (e) {
      console.error('Failed to load dispatch analytics:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [activeDates?.dateFrom, activeDates?.dateTo, period, filters, tempType, tempTransporter, tempCategory]);

  useEffect(() => {
    load();
  }, [load]);

  // When user clicks a funnel node, sync stage filter
  const handleFunnelNodeClick = (stageKey) => {
    if (activeStage === stageKey) {
      setActiveStage('all');
    } else {
      setActiveStage(stageKey);
    }
  };

  // Switch to manifest with pre-selected stage filter
  const handleViewInManifest = (stageKey) => {
    setTempStage(stageKey);
    setActiveTab('manifest');
    setManifestPage(1);
  };

  // Safe fallback unwrap
  const {
    dispatches = [],
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
    alerts = [],
  } = data || {};

  const dailyTrends = dailyDispatch.trends || [];

  // Filtered manifest dispatches
  const filteredDispatches = useMemo(() => {
    if (!Array.isArray(dispatches)) return [];
    return dispatches.filter((d) => {
      // Stage filter
      if (tempStage !== 'All') {
        const dStage = (d.stage || '').toUpperCase();
        if (dStage !== tempStage.toUpperCase()) return false;
      }
      // Transporter filter
      if (tempTransporter !== 'All' && d.transporterName !== tempTransporter) {
        return false;
      }
      // Category filter
      if (tempCategory !== 'All' && d.dispatchCategory !== tempCategory) {
        return false;
      }
      // SLA filter
      if (tempSla !== 'All' && d.sla !== tempSla) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          (d.dispatchNo && d.dispatchNo.toLowerCase().includes(q)) ||
          (d.orderNumber && d.orderNumber.toLowerCase().includes(q)) ||
          (d.customerName && d.customerName.toLowerCase().includes(q)) ||
          (d.vehicleNumber && d.vehicleNumber.toLowerCase().includes(q)) ||
          (d.driverName && d.driverName.toLowerCase().includes(q)) ||
          (d.transporterName && d.transporterName.toLowerCase().includes(q)) ||
          (d.destination && d.destination.toLowerCase().includes(q)) ||
          (d.city && d.city.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [dispatches, tempStage, tempTransporter, tempCategory, tempSla, searchTerm]);

  // Paginated dispatches
  const totalPages = Math.ceil(filteredDispatches.length / pageSize) || 1;
  const paginatedDispatches = useMemo(() => {
    const startIdx = (manifestPage - 1) * pageSize;
    return filteredDispatches.slice(startIdx, startIdx + pageSize);
  }, [filteredDispatches, manifestPage, pageSize]);

  // Real Export to Excel
  const handleExportExcel = async () => {
    try {
      const rows = (filteredDispatches.length > 0 ? filteredDispatches : dispatches).map((d) => ({
        'Dispatch No': d.dispatchNo,
        'SO Number': d.orderNumber,
        'Customer': d.customerName,
        'Dispatch Date': d.dispatchedAt || '—',
        'Delivered Date': d.deliveredAt || '—',
        'Transporter': d.transporterName || '—',
        'Vehicle': d.vehicleNumber || '—',
        'Driver': d.driverName || '—',
        'Destination': d.destination || '—',
        'City': d.city || '—',
        'Quantity': d.packageCount || 1,
        'Weight (kg)': d.totalWeight || 0,
        'Freight Amount (Rs)': d.freightAmount || 0,
        'Status': d.status,
        'Stage': d.stage,
        'SLA': d.sla,
      }));

      await exportToExcel(
        rows,
        `Himalaya_Dispatch_Manifest_${activeDates.dateFrom}_to_${activeDates.dateTo}.xls`
      );
    } catch (err) {
      console.error('Export failed:', err);
      alert('Unable to export Excel file. Please check permissions.');
    }
  };

  // Real Export to PDF
  const handleExportPDF = async () => {
    try {
      await exportDispatchReportPDF({
        from: activeDates.dateFrom,
        to: activeDates.dateTo,
        branchId: filters.branch !== 'All' ? filters.branch : undefined,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Unable to generate PDF report.');
    }
  };

  if (error) {
    return (
      <div className="dispatch-analytics-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Lucide.AlertTriangle size={52} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Unable to load Dispatch Command Center</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>{error.message || 'An error occurred while fetching dispatch telemetry from the server.'}</p>
        <button onClick={load} className="dispatch-analytics-btn-primary">
          <Lucide.RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="dispatch-analytics-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh' }}>
        <Lucide.Loader size={40} className="animate-spin" style={{ color: '#0284c7', marginBottom: 16 }} />
        <p style={{ color: '#0f172a', fontWeight: '800', fontSize: '16px' }}>Loading Dispatch Command Center Telemetry...</p>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Aggregating live vehicles, stock allocations, manifests, and logistics SLA...</p>
      </div>
    );
  }

  const customFilterToolbar = (
    <div className="da-filter-actions">
      <select
        value={tempStage}
        onChange={(e) => {
          setTempStage(e.target.value);
          setManifestPage(1);
        }}
        className="sa-analytics-filter__select"
      >
        <option value="All">Stage: All Stages</option>
        <option value="READY">Stage: Ready for Dispatch</option>
        <option value="CREATED">Stage: Dispatches Created</option>
        <option value="IN_TRANSIT">Stage: In Transit</option>
        <option value="DELIVERED">Stage: Delivered</option>
      </select>

      <select
        value={tempTransporter}
        onChange={(e) => {
          setTempTransporter(e.target.value);
          setManifestPage(1);
        }}
        className="sa-analytics-filter__select"
      >
        <option value="All">Transporter: All</option>
        {(data.filters?.transporters || []).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={tempCategory}
        onChange={(e) => {
          setTempCategory(e.target.value);
          setManifestPage(1);
        }}
        className="sa-analytics-filter__select"
      >
        <option value="All">Category: D1 &amp; D2</option>
        <option value="D1">D1 (Executive Dispatches)</option>
        <option value="D2">D2 (Plant / Store Dispatches)</option>
      </select>
    </div>
  );

  return (
    <div className="dispatch-analytics-container">
      {/* ── 1. HEADER ── */}
      <div className="dispatch-analytics-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="dispatch-analytics-header-icon">
            <Lucide.Truck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="dispatch-analytics-title">Dispatch Command Center</h1>
              <span className="dispatch-analytics-badge">LOGISTICS TELEMETRY</span>
              <span className="da-status-pill">
                <span className="da-pulse-dot" /> LIVE TELEMETRY
              </span>
            </div>
            <p className="dispatch-analytics-subtitle">
              Authoritative logistics tracking, dispatch lifecycle funnel, vehicle fleets, reverse logistics, and finished goods reconciliation.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={load} className="dispatch-analytics-btn-outline" title="Refresh live telemetry">
            <Lucide.RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleExportPDF} className="dispatch-analytics-btn-outline" title="Export as Branded PDF Report">
            <Lucide.FileText size={15} /> Export PDF
          </button>
          <button onClick={handleExportExcel} className="dispatch-analytics-btn-primary" title="Download Excel Manifest">
            <Lucide.FileSpreadsheet size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── 2. GLOBAL ANALYTICS FILTER BAR ── */}
      <div style={{ marginBottom: 20 }}>
        <SuperAdminAnalyticsFilter
          title="Dispatch Filter Control"
          showBranch={true}
          showCustomer={true}
          showProduct={true}
          showCategory={true}
          showSalesperson={true}
          showStatus={true}
          filterOptions={data.filters}
          customActions={customFilterToolbar}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />
      </div>

      {/* ── 3. TOP NAVIGATION TABS ── */}
      <div className="da-tabs-nav">
        <button
          className={`da-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Lucide.BarChart3 size={16} /> Overview &amp; Funnel
        </button>
        <button
          className={`da-tab-btn ${activeTab === 'manifest' ? 'active' : ''}`}
          onClick={() => setActiveTab('manifest')}
        >
          <Lucide.Truck size={16} /> Live Dispatches Manifest ({dispatches.length})
        </button>
        <button
          className={`da-tab-btn ${activeTab === 'transporters' ? 'active' : ''}`}
          onClick={() => setActiveTab('transporters')}
        >
          <Lucide.Package size={16} /> Transporters &amp; Fleet
        </button>
        <button
          className={`da-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Lucide.Layers size={16} /> Products &amp; Customers
        </button>
        <button
          className={`da-tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlog')}
        >
          <Lucide.Clock size={16} /> Pending Backlog ({remainingDispatch.summary?.ordersWithBalance ?? 0})
        </button>
        <button
          className={`da-tab-btn ${activeTab === 'reverse' ? 'active' : ''}`}
          onClick={() => setActiveTab('reverse')}
        >
          <Lucide.RotateCcw size={16} /> Reverse Logistics
        </button>
        <button
          className={`da-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Lucide.CheckCircle size={16} /> Stock Reconciliation
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: EXECUTIVE OVERVIEW & FUNNEL ──                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* ── TRANSPORT COST VARIANCE ── */}
          <div className="dispatch-cost-section">
            <div className="dispatch-cost-card">
              <div className="dispatch-cost-card-header">
                <div>
                  <span className="dispatch-cost-title">This Period Transport Cost</span>
                  <div className="dispatch-cost-amount">{formatCurrency(transportCost.actualTransportCost || 0)}</div>
                </div>
                <div className="dispatch-cost-icon-box orange">
                  <Lucide.DollarSign size={20} />
                </div>
              </div>
              <div className="dispatch-cost-footer">
                <span>Prior Period: <strong>{formatCurrency(transportCost.lastMonthTransportCost || 0)}</strong></span>
                <span className={`dispatch-cost-trend ${transportCost.costChangePercent >= 0 ? 'red' : 'text-success'}`}>
                  Change: <strong>{transportCost.costChangePercent >= 0 ? '+' : ''}{transportCost.costChangePercent}%</strong>
                </span>
              </div>
            </div>

            <div className="dispatch-cost-card span-two">
              <div className="dispatch-cost-card-header">
                <div>
                  <span className="dispatch-cost-title">Quotation Baseline vs Actual Transport Expense (Variance)</span>
                  <div className={`dispatch-cost-badge-budget ${transportCost.varianceAmount > 0 ? 'danger' : 'success'}`}>
                    {transportCost.varianceAmount > 0
                      ? `${formatCurrency(transportCost.varianceAmount)} Over Budget`
                      : transportCost.varianceAmount < 0
                      ? `${formatCurrency(Math.abs(transportCost.varianceAmount))} Budget Savings`
                      : 'On Budget Baseline'}
                  </div>
                </div>
                <div className="dispatch-cost-icon-box blue">
                  <Lucide.Percent size={20} />
                </div>
              </div>
              <div className="dispatch-cost-variance-grid">
                <div className="dispatch-cost-variance-item">
                  <span className="label">EXPECTED FREIGHT BASELINE</span>
                  <strong className="value blue">{formatCurrency(transportCost.expectedTransportCost || 0)}</strong>
                </div>
                <div className="dispatch-cost-variance-item">
                  <span className="label">ACTUAL DISPATCH EXPENSE</span>
                  <strong className="value red">{formatCurrency(transportCost.actualTransportCost || 0)}</strong>
                </div>
                <div className="dispatch-cost-variance-item highlight">
                  <span className="label">NET COST VARIANCE</span>
                  <strong className={`value ${transportCost.varianceAmount > 0 ? 'danger' : 'text-success'}`}>
                    {transportCost.varianceAmount > 0 ? '+' : ''}{formatCurrency(transportCost.varianceAmount || 0)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── EXECUTIVE KPIS GRID ── */}
          <div className="dispatch-kpis-grid">
            <div
              className={`dispatch-kpi-card ${activeStage === 'ready' ? 'active-border' : ''}`}
              onClick={() => handleFunnelNodeClick('ready')}
            >
              <div className="dispatch-kpi-header">
                <span className="label">Ready for Dispatch</span>
                <Lucide.Archive size={18} color="#0284c7" />
              </div>
              <div className="value">{flow.ready?.count ?? 0}</div>
              <p className="sub">{formatNumber(flow.ready?.qty ?? 0)} units waiting</p>
            </div>

            <div
              className={`dispatch-kpi-card ${activeStage === 'created' ? 'active-border' : ''}`}
              onClick={() => handleFunnelNodeClick('created')}
            >
              <div className="dispatch-kpi-header">
                <span className="label">Dispatches Created</span>
                <Lucide.PlusCircle size={18} color="#10b981" />
              </div>
              <div className="value">{flow.created?.count ?? 0}</div>
              <p className="sub">{formatNumber(flow.created?.qty ?? 0)} units created</p>
            </div>

            <div
              className={`dispatch-kpi-card ${activeStage === 'inTransit' ? 'active-border' : ''}`}
              onClick={() => handleFunnelNodeClick('inTransit')}
            >
              <div className="dispatch-kpi-header">
                <span className="label">Active In Transit</span>
                <Lucide.Truck size={18} color="#f59e0b" />
              </div>
              <div className="value">{flow.inTransit?.count ?? 0}</div>
              <p className="sub">{formatNumber(flow.inTransit?.qty ?? 0)} units en route</p>
            </div>

            <div
              className={`dispatch-kpi-card ${activeStage === 'delivered' ? 'active-border' : ''}`}
              onClick={() => handleFunnelNodeClick('delivered')}
            >
              <div className="dispatch-kpi-header">
                <span className="label">Delivered Shipments</span>
                <Lucide.FileCheck size={18} color="#10b981" />
              </div>
              <div className="value">{flow.delivered?.count ?? 0}</div>
              <p className="sub">{formatNumber(flow.delivered?.qty ?? 0)} units delivered</p>
            </div>

            <div
              className={`dispatch-kpi-card ${activeStage === 'remaining' ? 'active-border' : ''}`}
              onClick={() => handleFunnelNodeClick('remaining')}
            >
              <div className="dispatch-kpi-header">
                <span className="label">Pending Orders</span>
                <Lucide.Clock size={18} color="#ef4444" />
              </div>
              <div className="value">{flow.remaining?.count ?? 0}</div>
              <p className="sub">{formatNumber(remainingDispatch.summary?.remainingQuantity ?? 0)} units balance</p>
            </div>

            <div className="dispatch-kpi-card">
              <div className="dispatch-kpi-header">
                <span className="label">On-Time Delivery %</span>
                <Lucide.CheckCircle size={18} color="#10b981" />
              </div>
              <div className="value text-success">{delivery.summary?.onTimeDeliveryRate ?? 100}%</div>
              <p className="sub">{delivery.summary?.onTime ?? 0} on-time / {delivery.summary?.late ?? 0} delayed</p>
            </div>
          </div>

          {/* ── LIFECYCLE FUNNEL ── */}
          <div className="dispatch-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 className="dispatch-card-title" style={{ margin: 0 }}>Interactive Dispatch Lifecycle Funnel</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Click any stage to filter drilldown records below or open the full live manifest.
                </p>
              </div>
              {activeStage !== 'all' && (
                <button
                  onClick={() => setActiveStage('all')}
                  className="dispatch-analytics-btn-outline"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Clear Selection (Show All)
                </button>
              )}
            </div>

            <div className="dispatch-funnel-container">
              <div
                className={`dispatch-funnel-node ${activeStage === 'ready' ? 'active' : ''}`}
                onClick={() => handleFunnelNodeClick('ready')}
              >
                <span className="node-title">1. READY FOR DISPATCH</span>
                <strong className="node-value">{flow.ready?.count ?? 0} Orders</strong>
                <span className="node-sub">{formatNumber(flow.ready?.qty ?? 0)} Units Reserved</span>
              </div>

              <div className="dispatch-funnel-arrow">
                <Lucide.ArrowRight size={20} />
              </div>

              <div
                className={`dispatch-funnel-node ${activeStage === 'created' ? 'active' : ''}`}
                onClick={() => handleFunnelNodeClick('created')}
              >
                <span className="node-title">2. DISPATCH CREATED</span>
                <strong className="node-value">{flow.created?.count ?? 0} Dispatches</strong>
                <span className="node-sub">{formatNumber(flow.created?.qty ?? 0)} Units Packed</span>
              </div>

              <div className="dispatch-funnel-arrow">
                <Lucide.ArrowRight size={20} />
              </div>

              <div
                className={`dispatch-funnel-node ${activeStage === 'inTransit' ? 'active' : ''}`}
                onClick={() => handleFunnelNodeClick('inTransit')}
              >
                <span className="node-title">3. IN TRANSIT</span>
                <strong className="node-value">{flow.inTransit?.count ?? 0} Active Shipments</strong>
                <span className="node-sub">{formatNumber(flow.inTransit?.qty ?? 0)} Units Moving</span>
              </div>

              <div className="dispatch-funnel-arrow">
                <Lucide.ArrowRight size={20} />
              </div>

              <div
                className={`dispatch-funnel-node ${activeStage === 'delivered' ? 'active' : ''}`}
                onClick={() => handleFunnelNodeClick('delivered')}
              >
                <span className="node-title">4. DELIVERED</span>
                <strong className="node-value">{flow.delivered?.count ?? 0} Completed</strong>
                <span className="node-sub">{formatNumber(flow.delivered?.qty ?? 0)} Units Handed Over</span>
              </div>

              <div className="dispatch-funnel-arrow">
                <Lucide.ArrowRight size={20} />
              </div>

              <div
                className={`dispatch-funnel-node ${activeStage === 'remaining' ? 'active' : ''}`}
                onClick={() => handleFunnelNodeClick('remaining')}
              >
                <span className="node-title">5. REMAINING BALANCE</span>
                <strong className="node-value">{flow.remaining?.count ?? 0} Orders Pending</strong>
                <span className="node-sub">{formatNumber(remainingDispatch.summary?.remainingQuantity ?? 0)} Units</span>
              </div>
            </div>
          </div>

          {/* ── STAGE SPECIFIC DRILLDOWNS ── */}
          {activeStage === 'ready' && (
            <div className="dispatch-card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="dispatch-card-title" style={{ margin: 0 }}>Orders Ready for Dispatch ({readyOrders.orders?.length || 0})</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Finished Goods allocated and reserved, ready for vehicle assignment.</p>
                </div>
                <button
                  onClick={() => handleViewInManifest('READY')}
                  className="dispatch-analytics-btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Inspect in Live Manifest &rarr;
                </button>
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
                      <th>Items Included</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readyOrders.orders?.map((row, idx) => (
                      <tr key={idx}>
                        <td className="bold text-blue-600">{row.orderNo}</td>
                        <td className="bold">{row.customerName}</td>
                        <td>{formatNumber(row.orderedQty)}</td>
                        <td className="bold text-success">{formatNumber(row.reservedQty)}</td>
                        <td className="bold text-success">{formatNumber(row.reservedQty)}</td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {(row.items || []).map((it) => `${it.productName} (${it.reservedQty})`).join(', ') || '—'}
                        </td>
                        <td><span className="badge badge-success">READY FOR DISPATCH</span></td>
                      </tr>
                    ))}
                    {(!readyOrders.orders || readyOrders.orders.length === 0) && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                          No ready orders currently waiting in the dispatch queue.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeStage === 'created' && (
            <div className="dispatch-card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="dispatch-card-title" style={{ margin: 0 }}>Dispatches Created in Period ({dispatches.length})</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>All dispatch notes and delivery documents generated.</p>
                </div>
                <button
                  onClick={() => handleViewInManifest('CREATED')}
                  className="dispatch-analytics-btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Inspect in Live Manifest &rarr;
                </button>
              </div>

              <div className="dispatch-table-wrapper">
                <table className="dispatch-table">
                  <thead>
                    <tr>
                      <th>Dispatch No.</th>
                      <th>Order No.</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Quantity</th>
                      <th>Transporter</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.slice(0, 15).map((d, idx) => (
                      <tr key={idx}>
                        <td className="bold text-blue-600">{d.dispatchNo}</td>
                        <td>{d.orderNumber}</td>
                        <td className="bold">{d.customerName}</td>
                        <td>{d.dispatchedAt || '—'}</td>
                        <td className="bold">{d.packageCount || 1}</td>
                        <td>{d.transporterName || '—'}</td>
                        <td>{d.vehicleNumber || '—'}</td>
                        <td><span className="badge badge-info">{(d.status || '').replaceAll('_', ' ')}</span></td>
                        <td>
                          <button
                            onClick={() => setSelectedDispatch(d)}
                            className="da-action-btn"
                          >
                            <Lucide.Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dispatches.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                          No dispatches created during this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeStage === 'inTransit' && (
            <div className="dispatch-card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="dispatch-card-title" style={{ margin: 0 }}>Active Shipments In Transit</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Live vehicles moving on road toward client destinations.</p>
                </div>
                <button
                  onClick={() => handleViewInManifest('IN_TRANSIT')}
                  className="dispatch-analytics-btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Inspect in Live Manifest &rarr;
                </button>
              </div>

              <div className="dispatch-table-wrapper">
                <table className="dispatch-table">
                  <thead>
                    <tr>
                      <th>Dispatch No.</th>
                      <th>Order No.</th>
                      <th>Customer</th>
                      <th>Destination / City</th>
                      <th>Transporter</th>
                      <th>Vehicle &amp; Driver</th>
                      <th>ETA</th>
                      <th>Condition</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.filter((d) => d.stage === 'IN_TRANSIT').map((d, idx) => (
                      <tr key={idx}>
                        <td className="bold text-blue-600">{d.dispatchNo}</td>
                        <td>{d.orderNumber}</td>
                        <td className="bold">{d.customerName}</td>
                        <td>{d.destination || d.city}</td>
                        <td>{d.transporterName || '—'}</td>
                        <td>{d.vehicleNumber} ({d.driverName || 'Verified Driver'})</td>
                        <td className="bold">{d.eta || 'On Schedule'}</td>
                        <td>
                          <span className={`badge ${d.sla === 'Delayed' ? 'badge-danger' : 'badge-warning'}`}>
                            {d.transitCondition || 'ON SCHEDULE'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedDispatch(d)}
                            className="da-action-btn"
                          >
                            <Lucide.Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dispatches.filter((d) => d.stage === 'IN_TRANSIT').length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                          No shipments currently moving in transit.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeStage === 'delivered' && (
            <div className="dispatch-card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="dispatch-card-title" style={{ margin: 0 }}>Delivered Dispatches</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Shipments delivered with verified Proof of Delivery (POD).</p>
                </div>
                <button
                  onClick={() => handleViewInManifest('DELIVERED')}
                  className="dispatch-analytics-btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Inspect in Live Manifest &rarr;
                </button>
              </div>

              <div className="dispatch-table-wrapper">
                <table className="dispatch-table">
                  <thead>
                    <tr>
                      <th>Dispatch No.</th>
                      <th>Order No.</th>
                      <th>Customer</th>
                      <th>Delivered Date</th>
                      <th>Transporter</th>
                      <th>Freight (₹)</th>
                      <th>POD Status</th>
                      <th>SLA</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.filter((d) => d.stage === 'DELIVERED').slice(0, 15).map((d, idx) => (
                      <tr key={idx}>
                        <td className="bold text-blue-600">{d.dispatchNo}</td>
                        <td>{d.orderNumber}</td>
                        <td className="bold">{d.customerName}</td>
                        <td>{d.deliveredAt || d.dispatchedAt || '—'}</td>
                        <td>{d.transporterName || '—'}</td>
                        <td className="bold">{formatCurrency(d.freightAmount)}</td>
                        <td><span className="badge badge-success">{d.podStatus || 'APPROVED'}</span></td>
                        <td>
                          <span className={`badge ${d.sla === 'On-Time' ? 'badge-success' : 'badge-danger'}`}>
                            {d.sla}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedDispatch(d)}
                            className="da-action-btn"
                          >
                            <Lucide.Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dispatches.filter((d) => d.stage === 'DELIVERED').length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                          No shipments delivered in this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeStage === 'remaining' && (
            <div className="dispatch-card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="dispatch-card-title" style={{ margin: 0 }}>Pending Orders with Remaining Balance ({remainingDispatch.orders?.length || 0})</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Sales orders awaiting manufacturing completion or vehicle release.</p>
                </div>
                <button
                  onClick={() => setActiveTab('backlog')}
                  className="dispatch-analytics-btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  View Full Backlog &rarr;
                </button>
              </div>

              <div className="dispatch-table-wrapper">
                <table className="dispatch-table">
                  <thead>
                    <tr>
                      <th>Order No.</th>
                      <th>Customer</th>
                      <th>Ordered</th>
                      <th>Dispatched</th>
                      <th>Remaining</th>
                      <th>Age (Days)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remainingDispatch.orders?.slice(0, 15).map((row, idx) => (
                      <tr key={idx}>
                        <td className="bold text-blue-600">{row.orderNo}</td>
                        <td className="bold">{row.customerName}</td>
                        <td>{formatNumber(row.orderedQty)}</td>
                        <td>{formatNumber(row.dispatchedQty)}</td>
                        <td className="bold text-danger">{formatNumber(row.remainingQty)}</td>
                        <td className={row.age > 4 ? 'bold text-danger' : ''}>{row.age} days</td>
                        <td><span className="badge badge-warning">{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DAILY DISPATCH REPORT & TRENDS ── */}
          <div className="dispatch-double-grid">
            <div className="dispatch-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="dispatch-card-title" style={{ margin: 0 }}>Daily Dispatch &amp; Delivery Trend</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Quantity dispatched vs completed deliveries across time.</p>
                </div>
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
              <h3 className="dispatch-card-title">Daily Summary Metrics</h3>
              <div className="dispatch-report-grid">
                <div className="dispatch-report-item">
                  <span className="label">Total Dispatches Created</span>
                  <strong className="val">{dailyDispatch.summary?.dispatches ?? 0}</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">Orders Covered</span>
                  <strong className="val">{dailyDispatch.summary?.orders ?? 0}</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">Total Physical Quantity</span>
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
                  <span className="label">Delivered in Period</span>
                  <strong className="val text-success">{dailyDispatch.summary?.delivered ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── D1 / D2 PERFORMANCE SCORECARD ── */}
          <div className="dispatch-card" style={{ marginBottom: 24 }}>
            <h3 className="dispatch-card-title">D1 (Executive) vs D2 (Store) Dispatches</h3>
            <div className="dispatch-double-grid">
              <div className="dispatch-kpi-subcard">
                <h4 className="dispatch-sub-title text-blue-600" style={{ margin: '0 0 12px 0' }}>DISPATCH 1 (Executive Logistics)</h4>
                <div className="dispatch-report-grid">
                  <div className="dispatch-report-item">
                    <span className="label">Ready Orders</span>
                    <strong>{categories.dispatch1?.readyOrders ?? 0}</strong>
                  </div>
                  <div className="dispatch-report-item">
                    <span className="label">Dispatches in Period</span>
                    <strong>{categories.dispatch1?.dispatchesToday ?? 0}</strong>
                  </div>
                  <div className="dispatch-report-item">
                    <span className="label">Qty Dispatched</span>
                    <strong>{formatNumber(categories.dispatch1?.qtyDispatched ?? 0)}</strong>
                  </div>
                  <div className="dispatch-report-item">
                    <span className="label">Delivered / SLA</span>
                    <strong className="text-success">{categories.dispatch1?.delivered ?? 0} ({categories.dispatch1?.onTimePct ?? 100}%)</strong>
                  </div>
                </div>
              </div>

              <div className="dispatch-kpi-subcard">
                <h4 className="dispatch-sub-title text-purple-600" style={{ margin: '0 0 12px 0' }}>DISPATCH 2 (Store / Plant Direct)</h4>
                <div className="dispatch-report-grid">
                  <div className="dispatch-report-item">
                    <span className="label">Ready Orders</span>
                    <strong>{categories.dispatch2?.readyOrders ?? 0}</strong>
                  </div>
                  <div className="dispatch-report-item">
                    <span className="label">Dispatches in Period</span>
                    <strong>{categories.dispatch2?.dispatchesToday ?? 0}</strong>
                  </div>
                  <div className="dispatch-report-item">
                    <span className="label">Qty Dispatched</span>
                    <strong>{formatNumber(categories.dispatch2?.qtyDispatched ?? 0)}</strong>
                  </div>
                  <div className="dispatch-report-item">
                    <span className="label">Delivered / SLA</span>
                    <strong className="text-success">{categories.dispatch2?.delivered ?? 0} ({categories.dispatch2?.onTimePct ?? 100}%)</strong>
                  </div>
                </div>
              </div>
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
                  <span>No outstanding logistics exceptions or dispatch backlogs reported.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: LIVE DISPATCHES MANIFEST                             ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'manifest' && (
        <div className="dispatch-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h3 className="dispatch-card-title" style={{ margin: 0 }}>Live Dispatch Orders &amp; Manifest</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Complete database telemetry of dispatches with vehicle details, driver info, and SLA tracking.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="da-counter-pill">
                Showing {filteredDispatches.length} of {dispatches.length} Dispatches
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="da-manifest-toolbar">
            <div className="da-search-box">
              <Lucide.Search size={16} className="da-search-icon" />
              <input
                type="text"
                placeholder="Search Dispatch #, SO #, Customer, Vehicle, Driver, City..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setManifestPage(1);
                }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="da-search-clear">
                  <Lucide.X size={14} />
                </button>
              )}
            </div>

            <div className="da-toolbar-dropdowns">
              <select
                value={tempStage}
                onChange={(e) => {
                  setTempStage(e.target.value);
                  setManifestPage(1);
                }}
                className="sa-analytics-filter__select"
              >
                <option value="All">All Stages</option>
                <option value="READY">Ready</option>
                <option value="CREATED">Created</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
              </select>

              <select
                value={tempSla}
                onChange={(e) => {
                  setTempSla(e.target.value);
                  setManifestPage(1);
                }}
                className="sa-analytics-filter__select"
              >
                <option value="All">All SLAs</option>
                <option value="On-Time">On-Time</option>
                <option value="Delayed">Delayed</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setManifestPage(1);
                }}
                className="sa-analytics-filter__select"
              >
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="dispatch-table-wrapper" style={{ marginTop: 16 }}>
            <table className="dispatch-table">
              <thead>
                <tr>
                  <th>Dispatch No.</th>
                  <th>Order No. &amp; Date</th>
                  <th>Customer &amp; Destination</th>
                  <th>Quantity / Weight</th>
                  <th>Transporter &amp; Vehicle</th>
                  <th>Freight (₹)</th>
                  <th>Status &amp; Stage</th>
                  <th>SLA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDispatches.map((d, idx) => (
                  <tr key={idx} className="da-row-hover">
                    <td className="bold text-blue-600">
                      <span style={{ cursor: 'pointer' }} onClick={() => setSelectedDispatch(d)}>
                        {d.dispatchNo}
                      </span>
                    </td>
                    <td>
                      <div className="bold">{d.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{d.dispatchedAt || '—'}</div>
                    </td>
                    <td>
                      <div className="bold">{d.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{d.destination || d.city || '—'}</div>
                    </td>
                    <td>
                      <div className="bold">{d.packageCount || 1} pcs</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{d.totalWeight ? `${d.totalWeight} kg` : '—'}</div>
                    </td>
                    <td>
                      <div>{d.transporterName || 'Self-Pickup'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {d.vehicleNumber} {d.driverName ? `· ${d.driverName}` : ''}
                      </div>
                    </td>
                    <td className="bold">{formatCurrency(d.freightAmount)}</td>
                    <td>
                      <span className={`badge ${d.stage === 'DELIVERED' ? 'badge-success' : d.stage === 'IN_TRANSIT' ? 'badge-warning' : 'badge-info'}`}>
                        {(d.status || '').replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.sla === 'On-Time' ? 'badge-success' : 'badge-danger'}`}>
                        {d.sla}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedDispatch(d)}
                        className="da-action-btn"
                        title="View Full Dispatch Details"
                      >
                        <Lucide.Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedDispatches.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                      No matching dispatches found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="da-pagination-bar">
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {filteredDispatches.length > 0 ? (manifestPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(manifestPage * pageSize, filteredDispatches.length)} of {filteredDispatches.length} dispatches
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                disabled={manifestPage <= 1}
                onClick={() => setManifestPage((p) => Math.max(1, p - 1))}
                className="da-page-btn"
              >
                <Lucide.ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '13px', fontWeight: 'bold', padding: '0 8px' }}>
                Page {manifestPage} of {totalPages}
              </span>
              <button
                disabled={manifestPage >= totalPages}
                onClick={() => setManifestPage((p) => Math.min(totalPages, p + 1))}
                className="da-page-btn"
              >
                Next <Lucide.ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: TRANSPORTERS & LOGISTICS                              ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'transporters' && (
        <>
          <div className="dispatch-card" style={{ marginBottom: 24 }}>
            <h3 className="dispatch-card-title">Transporter Performance Scorecard</h3>
            <div className="dispatch-grid-four" style={{ marginBottom: 20 }}>
              <div className="dispatch-kpi-subcard">
                <span className="label">Delivered Shipments</span>
                <strong className="val text-success">{delivery.summary?.deliveredThisMonth ?? 0}</strong>
              </div>
              <div className="dispatch-kpi-subcard">
                <span className="label">On-Time Deliveries</span>
                <strong className="val text-success">{delivery.summary?.onTime ?? 0}</strong>
              </div>
              <div className="dispatch-kpi-subcard">
                <span className="label">Average Transit Time</span>
                <strong className="val">{delivery.summary?.avgTransitTime ?? 0} Days</strong>
              </div>
              <div className="dispatch-kpi-subcard">
                <span className="label">Fastest Transit Delivery</span>
                <strong className="val text-success">{delivery.summary?.fastestDelivery ?? 0} Days</strong>
              </div>
            </div>

            <div className="dispatch-table-wrapper">
              <table className="dispatch-table">
                <thead>
                  <tr>
                    <th>Transporter Name</th>
                    <th>Shipments Handled</th>
                    <th>Delivered</th>
                    <th>Delayed</th>
                    <th>Average Transit Days</th>
                    <th>On-Time Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {(delivery.transporters || []).map((row, idx) => (
                    <tr key={idx}>
                      <td className="bold">{row.transporter}</td>
                      <td>{row.shipments}</td>
                      <td className="text-success bold">{row.delivered}</td>
                      <td className={row.delayed > 0 ? 'text-danger bold' : ''}>{row.delayed}</td>
                      <td>{row.avgTransit} Days</td>
                      <td>
                        <span className={`badge ${row.onTimePct >= 90 ? 'badge-success' : row.onTimePct >= 70 ? 'badge-warning' : 'badge-danger'}`}>
                          {row.onTimePct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!delivery.transporters || delivery.transporters.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                        No transporter records available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dispatch-card">
            <h3 className="dispatch-card-title">Vehicle Fleet Telemetry &amp; Utilization</h3>
            <div className="dispatch-table-wrapper">
              <table className="dispatch-table">
                <thead>
                  <tr>
                    <th>Vehicle Registration No.</th>
                    <th>Completed Trips</th>
                    <th>Dispatched Payload (Units)</th>
                    <th>Fleet Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(logistics.vehicles || []).map((row, idx) => (
                    <tr key={idx}>
                      <td className="bold">{row.vehicle}</td>
                      <td>{row.trips} Trips</td>
                      <td className="bold text-blue-600">{formatNumber(row.qty)} units</td>
                      <td>
                        <span className={`badge ${row.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!logistics.vehicles || logistics.vehicles.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                        No vehicle logs recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: PRODUCTS & CUSTOMERS REACH                            ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <>
          <div className="dispatch-card" style={{ marginBottom: 24 }}>
            <h3 className="dispatch-card-title">Product-Wise Dispatch Summary</h3>
            <div className="dispatch-table-wrapper">
              <table className="dispatch-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Ready FG</th>
                    <th>Reserved Against Orders</th>
                    <th>Dispatched Quantity</th>
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
                      <td style={{ color: '#64748b', fontSize: '11px' }}>{row.sku || '—'}</td>
                      <td>{formatNumber(row.readyFG)}</td>
                      <td>{formatNumber(row.reserved)}</td>
                      <td className="bold text-blue-600">{formatNumber(row.dispatched)}</td>
                      <td className="bold text-danger">{formatNumber(row.remaining)}</td>
                      <td className="text-success bold">{formatNumber(row.delivered)}</td>
                      <td>{row.returnQty || 0}</td>
                      <td>{row.replacementQty || 0}</td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                        No product dispatch records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dispatch-card">
            <h3 className="dispatch-card-title">Customer-Wise Dispatch Performance</h3>
            <div className="dispatch-table-wrapper">
              <table className="dispatch-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Orders</th>
                    <th>Dispatches Created</th>
                    <th>Ordered Qty</th>
                    <th>Delivered Qty</th>
                    <th>Pending Qty</th>
                    <th>On-Time Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, idx) => (
                    <tr key={idx}>
                      <td className="bold">{c.customer}</td>
                      <td>{c.orders}</td>
                      <td className="bold text-blue-600">{c.dispatches}</td>
                      <td>{formatNumber(c.qty)}</td>
                      <td className="text-success bold">{formatNumber(c.delivered)}</td>
                      <td className="text-danger bold">{formatNumber(c.pending)}</td>
                      <td>
                        <span className={`badge ${c.onTimePct >= 80 ? 'badge-success' : 'badge-warning'}`}>
                          {c.onTimePct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                        No customer records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 5: PENDING BACKLOG                                       ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'backlog' && (
        <div className="dispatch-card">
          <h3 className="dispatch-card-title">Remaining Dispatch Backlog &amp; Aging Telemetry</h3>
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
              <span className="label">Past Promised Target Date</span>
              <strong className="val text-warning">{remainingDispatch.summary?.pastTargetDate ?? 0}</strong>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 className="dispatch-sub-title" style={{ marginTop: 0 }}>Backlog Aging Distribution</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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
                <span className="label">&gt; 7 Days (Critical)</span>
                <strong className="val text-danger">{remainingDispatch.aging?.agingMoreThan7 ?? 0} Orders</strong>
              </div>
            </div>
          </div>

          <div className="dispatch-table-wrapper">
            <table className="dispatch-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Ordered</th>
                  <th>Dispatched</th>
                  <th>Remaining</th>
                  <th>Age (Days)</th>
                  <th>Target Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {remainingDispatch.orders?.map((row, idx) => (
                  <tr key={idx}>
                    <td className="bold text-blue-600">{row.orderNo}</td>
                    <td className="bold">{row.customerName}</td>
                    <td>{formatNumber(row.orderedQty)}</td>
                    <td>{formatNumber(row.dispatchedQty)}</td>
                    <td className="bold text-danger">{formatNumber(row.remainingQty)}</td>
                    <td className={row.age > 4 ? 'bold text-danger' : ''}>{row.age} days</td>
                    <td>{row.targetDate || '—'}</td>
                    <td><span className="badge badge-warning">{row.status}</span></td>
                  </tr>
                ))}
                {(!remainingDispatch.orders || remainingDispatch.orders.length === 0) && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                      Zero backlog! All sales orders are fully dispatched.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 6: REVERSE LOGISTICS                                     ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reverse' && (
        <div className="dispatch-double-grid">
          <div className="dispatch-card">
            <h3 className="dispatch-card-title">Sample Dispatch &amp; Conversion Analytics</h3>
            <div className="dispatch-grid-three" style={{ marginBottom: 16 }}>
              <div className="dispatch-kpi-subcard small">
                <span className="label">Ready / In Transit</span>
                <strong>{samples.summary?.samplesReady ?? 0} / {samples.summary?.samplesInTransit ?? 0}</strong>
              </div>
              <div className="dispatch-kpi-subcard small">
                <span className="label">Delivered</span>
                <strong className="text-success">{samples.summary?.samplesDelivered ?? 0}</strong>
              </div>
              <div className="dispatch-kpi-subcard small">
                <span className="label">Overdue</span>
                <strong className="text-danger">{samples.summary?.samplesOverdue ?? 0}</strong>
              </div>
            </div>

            <div className="dispatch-report-grid" style={{ marginBottom: 16 }}>
              <div className="dispatch-report-item">
                <span className="label">Total Samples Dispatched</span>
                <strong>{samples.summary?.totalDispatched ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Samples Approved / Accepted</span>
                <strong className="text-success">{samples.summary?.totalAccepted ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Converted to Closed Business</span>
                <strong className="text-success">{samples.summary?.converted ?? 0}</strong>
              </div>
              <div className="dispatch-report-item">
                <span className="label">Conversion Rate</span>
                <strong className="text-blue-600">
                  {samples.summary?.totalDispatched > 0
                    ? `${Math.round((samples.summary.converted / samples.summary.totalDispatched) * 100)}%`
                    : '—'}
                </strong>
              </div>
            </div>

            <div className="dispatch-table-wrapper" style={{ maxHeight: '250px' }}>
              <table className="dispatch-table small">
                <thead>
                  <tr>
                    <th>Sample No.</th>
                    <th>Customer / Lead</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Testing</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.records?.map((row, idx) => (
                    <tr key={idx}>
                      <td className="bold">{row.sampleNo}</td>
                      <td>{row.customerName}</td>
                      <td>{row.productName}</td>
                      <td><span className="badge badge-info">{row.deliveryStatus}</span></td>
                      <td><span className="badge badge-success">{row.testingStatus}</span></td>
                    </tr>
                  ))}
                  {(!samples.records || samples.records.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '16px' }}>
                        No sample dispatches on record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dispatch-card">
            <h3 className="dispatch-card-title">Replacements &amp; Sales Returns</h3>
            <div className="dispatch-kpi-subcard" style={{ marginBottom: 16 }}>
              <h4 className="dispatch-sub-title" style={{ margin: '0 0 10px 0' }}>
                Replacement Requests ({replacements.summary?.replacementRequests ?? 0})
              </h4>
              <div className="dispatch-report-grid">
                <div className="dispatch-report-item">
                  <span className="label">Approved</span>
                  <strong>{replacements.summary?.approved ?? 0}</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">Ready / In-Transit</span>
                  <strong>{replacements.summary?.readyForDispatch ?? 0} / {replacements.summary?.inTransit ?? 0}</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">Replacement Rate</span>
                  <strong className="text-danger">{replacements.summary?.replacementRate ?? 0}%</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">Pending Action</span>
                  <strong className="text-warning">{replacements.summary?.pending ?? 0}</strong>
                </div>
              </div>
            </div>

            <div className="dispatch-kpi-subcard">
              <h4 className="dispatch-sub-title" style={{ margin: '0 0 10px 0' }}>
                Sales Returns Pickups ({returns.summary?.returnRequests ?? 0})
              </h4>
              <div className="dispatch-report-grid">
                <div className="dispatch-report-item">
                  <span className="label">Pickup Pending</span>
                  <strong className="text-warning">{returns.summary?.pickupPending ?? 0}</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">In Transit</span>
                  <strong className="text-info">{returns.summary?.inTransit ?? 0}</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">Gate Received / Closed</span>
                  <strong className="text-success">{returns.summary?.received ?? 0} / {returns.summary?.closed ?? 0}</strong>
                </div>
                <div className="dispatch-report-item">
                  <span className="label">Return Rate</span>
                  <strong className="text-danger">{returns.summary?.returnRate ?? 0}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 7: STOCK RECONCILIATION & AUDIT                          ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'audit' && (
        <div className="dispatch-card">
          <h3 className="dispatch-card-title">Finished Goods &amp; Dispatch Stock Reconciliation</h3>
          <div className="dispatch-reconciliation-flow">
            <div className="reconciliation-node">
              <span className="label">1. FG AVAILABLE IN WAREHOUSE</span>
              <strong className="val">{formatNumber(inventoryReconciliation.finishedGoods ?? 0)}</strong>
            </div>
            <div className="reconciliation-arrow"><Lucide.ArrowRight /></div>
            <div className="reconciliation-node">
              <span className="label">2. RESERVED FOR SALES ORDERS</span>
              <strong className="val text-blue-600">{formatNumber(inventoryReconciliation.reservations ?? 0)}</strong>
            </div>
            <div className="reconciliation-arrow"><Lucide.ArrowRight /></div>
            <div className="reconciliation-node">
              <span className="label">3. DISPATCH READY IN DOCK</span>
              <strong className="val text-warning">{formatNumber(inventoryReconciliation.dispatchReady ?? 0)}</strong>
            </div>
            <div className="reconciliation-arrow"><Lucide.ArrowRight /></div>
            <div className="reconciliation-node">
              <span className="label">4. PHYSICAL STOCK DEDUCTED</span>
              <strong className="val text-success">{formatNumber(inventoryReconciliation.dispatched ?? 0)}</strong>
            </div>
          </div>

          <h4 className="dispatch-sub-title" style={{ marginTop: 24 }}>System Allocation &amp; Transaction Mismatch Exceptions</h4>
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
                    <td colSpan={3} style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold', padding: '24px' }}>
                      ✓ All stock allocations, order reservations, and dispatch deductions are fully reconciled with zero discrepancies.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── DISPATCH DETAILS MODAL                                      ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedDispatch && (
        <div className="da-modal-overlay" onClick={() => setSelectedDispatch(null)}>
          <div className="da-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="da-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="dispatch-analytics-header-icon" style={{ width: 40, height: 40 }}>
                  <Lucide.Truck size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                      {selectedDispatch.dispatchNo}
                    </h3>
                    <span className="badge badge-info">{selectedDispatch.stage}</span>
                    <span className={`badge ${selectedDispatch.sla === 'On-Time' ? 'badge-success' : 'badge-danger'}`}>
                      {selectedDispatch.sla}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Sales Order #{selectedDispatch.orderNumber} · Customer: {selectedDispatch.customerName}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDispatch(null)} className="da-modal-close">
                <Lucide.X size={18} />
              </button>
            </div>

            <div className="da-modal-body">
              {/* Telemetry Grid */}
              <div className="da-modal-grid-three">
                <div className="da-modal-info-card">
                  <span className="label">DELIVERY DESTINATION</span>
                  <strong className="val">{selectedDispatch.destination || selectedDispatch.city}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                    {selectedDispatch.deliveryAddress}
                  </p>
                </div>

                <div className="da-modal-info-card">
                  <span className="label">LOGISTICS &amp; VEHICLE</span>
                  <strong className="val">{selectedDispatch.transporterName || 'Self-Pickup'}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#0f172a', fontWeight: 'bold' }}>
                    Vehicle: {selectedDispatch.vehicleNumber}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                    Driver: {selectedDispatch.driverName} {selectedDispatch.driverPhone ? `(${selectedDispatch.driverPhone})` : ''}
                  </p>
                </div>

                <div className="da-modal-info-card">
                  <span className="label">FINANCIALS &amp; WEIGHT</span>
                  <strong className="val text-blue-600">{formatCurrency(selectedDispatch.freightAmount)}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#0f172a' }}>
                    Freight Type: {selectedDispatch.freightType}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                    Total Weight: {selectedDispatch.totalWeight} kg ({selectedDispatch.packageCount} pcs)
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 10px 0' }}>Itemized Cargo Manifest</h4>
                <div className="dispatch-table-wrapper">
                  <table className="dispatch-table small">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Dispatched Quantity</th>
                        <th>Specifications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedDispatch.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td className="bold">{it.productName}</td>
                          <td>{it.sku || '—'}</td>
                          <td><span className="badge badge-info">{it.category}</span></td>
                          <td className="bold text-blue-600">{it.quantity}</td>
                          <td style={{ fontSize: '11px', color: '#64748b' }}>
                            {it.specifications ? JSON.stringify(it.specifications) : '—'}
                          </td>
                        </tr>
                      ))}
                      {(!selectedDispatch.items || selectedDispatch.items.length === 0) && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>
                            Single packaged consignment ({selectedDispatch.packageCount || 1} units).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Timeline Details */}
              <div style={{ marginTop: 20, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 10px 0', textTransform: 'uppercase', color: '#475569' }}>
                  Dispatch Milestones &amp; Tracking
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div>
                    <span className="label" style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>DISPATCHED AT</span>
                    <strong style={{ fontSize: '13px' }}>{selectedDispatch.dispatchedAt || '—'}</strong>
                  </div>
                  <div>
                    <span className="label" style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>TARGET / PROMISED ETA</span>
                    <strong style={{ fontSize: '13px' }}>{selectedDispatch.eta || 'On Schedule'}</strong>
                  </div>
                  <div>
                    <span className="label" style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>DELIVERED AT</span>
                    <strong style={{ fontSize: '13px', color: selectedDispatch.deliveredAt ? '#16a34a' : '#64748b' }}>
                      {selectedDispatch.deliveredAt || 'In Transit'}
                    </strong>
                  </div>
                  <div>
                    <span className="label" style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>POD STATUS</span>
                    <strong style={{ fontSize: '13px' }}>{selectedDispatch.podStatus}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="da-modal-footer">
              <button onClick={() => setSelectedDispatch(null)} className="dispatch-analytics-btn-outline">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
