import React, { useState, useEffect, useCallback, useRef, cloneElement } from 'react';
import { 
  Database, RefreshCw, FileSpreadsheet, Download, Search, AlertCircle, 
  Activity, Layers, TrendingUp, TrendingDown, ArrowUpDown, ChevronLeft, 
  ChevronRight, AlertTriangle, CheckCircle, Package, Box, Truck, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

import ResponsiveChart from '../../../shared/components/ResponsiveChart';

import * as Lucide from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import { SuperAdminFilterProvider, useSuperAdminFilter } from '../context/SuperAdminFilterContext.jsx';
import { useSalesExport } from '../hooks/useSalesExport.js';
import { exportSalesReportPDF, exportFinanceReportPDF, exportInventoryReportPDF } from '../../../services/export.service';
import './InventoryAnalyticsPage.css';

const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#4F46E5', '#06B6D4', '#8B5CF6'];

const InventoryAnalyticsContent = () => {
  const [mounted, setMounted] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [movementStatusFilter, setMovementStatusFilter] = useState('All');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeDates?.dateFrom) params.set('from', activeDates.dateFrom);
      if (activeDates?.dateTo) params.set('to', activeDates.dateTo);
      if (filters.branch && filters.branch !== 'All') params.set('branchId', filters.branch);
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedUnit && selectedUnit !== 'All') params.set('unit', selectedUnit);
      if (stockStatusFilter && stockStatusFilter !== 'All') params.set('stockStatus', stockStatusFilter);
      if (movementStatusFilter && movementStatusFilter !== 'All') params.set('movementStatus', movementStatusFilter);
      if (globalSearch) params.set('search', globalSearch);
      params.set('page', String(page));
      params.set('limit', String(pageSize));

      const payload = await backendFetch(`/api/backend/super-admin/analytics/inventory?${params}`, { cacheTtlMs: 0 });
      setData(payload);
    } catch (err) {
      console.error('Failed to load inventory analytics:', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeDates, filters.branch, selectedCategory, selectedUnit, stockStatusFilter, movementStatusFilter, globalSearch, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { exportExcel, exportPDF } = useSalesExport(data, 'inventory');

  if (error) {
    return (
      <div style={{ padding: '32px', color: '#B91C1C', fontFamily: 'Outfit, sans-serif' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800' }}>Unable to load Inventory Analytics</h2>
        <p style={{ margin: '0 0 16px', color: '#64748B' }}>{error.message || 'An error occurred while connecting to the ERP database.'}</p>
        <button onClick={loadData} style={{ padding: '8px 16px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Retry Request
        </button>
      </div>
    );
  }

  const safeData = data || {};
  const summary = safeData.summary || { totalMaterials: 0, totalStockQuantity: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalInventoryValue: 0 };
  const health = safeData.health || { availabilityPercent: 0, outOfStockPercent: 0, lowStockPercent: 0, healthyStockPercent: 0 };
  const movement = safeData.movement || { stockIn: 0, stockOut: 0, adjustments: 0, netMovement: 0, transactionCount: 0 };
  const classification = safeData.movementClassification || { fast: 0, slow: 0, nonMoving: 0 };
  const alerts = safeData.alerts || { outOfStock: 0, lowStock: 0, totalCritical: 0, pendingIndents: 0 };
  const unitBreakdown = safeData.unitBreakdown || [];
  const categoryBreakdown = safeData.categoryBreakdown || [];
  const movementTrend = safeData.movementTrend || [];
  const criticalMaterials = safeData.criticalMaterials || [];
  const topMaterials = safeData.topMaterials || [];
  const nonMovingMaterials = safeData.nonMovingMaterials || [];
  const materialsList = safeData.materials || [];
  const pagination = safeData.pagination || { page: 1, limit: 15, total: 0, pages: 1 };

  const healthPieData = [
    { name: 'Healthy / In Stock', value: summary.inStock, color: '#10B981' },
    { name: 'Low Stock Warning', value: summary.lowStock, color: '#F59E0B' },
    { name: 'Out of Stock Critical', value: summary.outOfStock, color: '#EF4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="inv-analytics-container">
      
      {/* ── 1. PAGE HEADER & TOOLBAR ── */}
      <div className="inv-analytics-header">
        <div className="inv-analytics-header-title">
          <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: '900', color: '#24345C', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={24} color="#0284c7" /> Inventory Analytics & Material Control
          </h1>
          <p style={{ fontSize: '12.5px', color: '#5E6B82', margin: '2px 0 0' }}>
            Company-wide raw material stock, shortages, movement, valuation and replenishment telemetry • Reconciled Live with Store Module
          </p>
        </div>

        <div className="inv-analytics-header-actions">
          <div className="inv-search-box">
            <Search size={14} color="#5E6B82" />
            <input 
              value={globalSearch}
              onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
              placeholder="Search material code, name, category..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#24345C' }}
            />
          </div>

          <button onClick={loadData} style={{ padding: '8px 12px', background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => exportPDF()} style={{ padding: '8px 14px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            <Download size={14} /> PDF
          </button>
          <button onClick={() => exportExcel()} style={{ padding: '8px 14px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      {/* ── 2. SHARED SUPER ADMIN FILTER CONTROL ── */}
      <SuperAdminAnalyticsFilter 
        title="Inventory Analytics Filter Control"
        showBranch={true}
        showCategory={true}
        showStatus={true}
      />

      {/* ── 3. PRIMARY INVENTORY KPI CARDS ── */}
      <div className="inv-kpi-grid">
        <div className="inv-kpi-card" style={{ borderTop: '4px solid #0284c7' }}>
          <div className="inv-kpi-label">Total Raw Materials</div>
          <div className="inv-kpi-val">{summary.totalMaterials} Materials</div>
          <div className="inv-kpi-sub">Source: /store/raw-inventory</div>
        </div>

        <div className="inv-kpi-card" style={{ borderTop: '4px solid #4f46e5' }}>
          <div className="inv-kpi-label">Total Current Stock</div>
          <div className="inv-kpi-val">{summary.totalStockQuantity.toLocaleString('en-IN')} Total Qty</div>
          <div className="inv-kpi-sub">Across {summary.totalMaterials} material records</div>
        </div>

        <div className="inv-kpi-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="inv-kpi-label">In Stock Materials</div>
          <div className="inv-kpi-val" style={{ color: '#10b981' }}>{summary.inStock} Materials</div>
          <div className="inv-kpi-sub">currentStock &gt; 0 & healthy</div>
        </div>

        <div className="inv-kpi-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="inv-kpi-label">Low Stock Materials</div>
          <div className="inv-kpi-val" style={{ color: '#f59e0b' }}>{summary.lowStock} Materials</div>
          <div className="inv-kpi-sub">Reconciled with Store Low Stock Alerts</div>
        </div>

        <div className="inv-kpi-card" style={{ borderTop: '4px solid #ef4444' }}>
          <div className="inv-kpi-label">Out of Stock Materials</div>
          <div className="inv-kpi-val" style={{ color: '#ef4444' }}>{summary.outOfStock} Materials</div>
          <div className="inv-kpi-sub">currentStock &le; 0</div>
        </div>

        <div className="inv-kpi-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="inv-kpi-label">Total Inventory Value</div>
          <div className="inv-kpi-val">₹{summary.totalInventoryValue.toLocaleString('en-IN')}</div>
          <div className="inv-kpi-sub">Actual material valuation model</div>
        </div>
      </div>

      {/* ── 4. INVENTORY HEALTH SUMMARY & UOM BREAKDOWN ── */}
      <div className="inv-grid-2col">
        
        {/* Inventory Health Visual */}
        <div className="inv-card-section">
          <h3 className="inv-section-title">
            <Activity size={16} color="#0284c7" /> Inventory Health Index
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <div className="inv-chart-frame" style={{ flex: '1 1 220px', '--default-chart-height': '220px', height: 'var(--chart-height, var(--default-chart-height))' }}>
              {mounted && healthPieData.length > 0 ? (
                <ResponsiveChart height={220}>
                  <PieChart>
                    <Pie data={healthPieData} cx="50%" cy="50%" innerRadius="35%" outerRadius="60%" paddingAngle={4} dataKey="value" nameKey="name">
                      {healthPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveChart>
              ) : (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic' }}>
                  No inventory health items to display.
                </div>
              )}
            </div>

            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Stock Availability %</span>
                <span style={{ fontWeight: '950', color: '#10b981' }}>{health.availabilityPercent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Out of Stock %</span>
                <span style={{ fontWeight: '950', color: '#ef4444' }}>{health.outOfStockPercent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Low Stock %</span>
                <span style={{ fontWeight: '950', color: '#f59e0b' }}>{health.lowStockPercent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Healthy Stock %</span>
                <span style={{ fontWeight: '950', color: '#10b981' }}>{health.healthyStockPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock by Unit of Measure */}
        <div className="inv-card-section">
          <h3 className="inv-section-title">
            <Layers size={16} color="#4f46e5" /> Stock by Unit of Measure (UOM)
          </h3>
          <div className="inv-table-wrapper" style={{ maxHeight: '220px' }}>
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Materials Count</th>
                  <th>Current Quantity</th>
                </tr>
              </thead>
              <tbody>
                {unitBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '16px' }}>No units found</td>
                  </tr>
                ) : (
                  unitBreakdown.map((u, idx) => (
                    <tr key={idx}>
                      <td><span className="inv-badge inv-badge-fast">{u.unit}</span></td>
                      <td style={{ fontWeight: 'bold' }}>{u.materials} Materials</td>
                      <td style={{ fontWeight: '950', color: '#24345C' }}>{u.quantity.toLocaleString('en-IN')} {u.unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── 5. STOCK MOVEMENT ANALYTICS & TREND CHART ── */}
      <div className="inv-grid-2col">
        
        {/* Movement KPIs & Summary */}
        <div className="inv-card-section">
          <h3 className="inv-section-title">
            <TrendingUp size={16} color="#10b981" /> Stock Movement Telemetry (Selected Period)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px 14px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#5E6B82', textTransform: 'uppercase' }}>Stock In</div>
              <div style={{ fontSize: '18px', fontWeight: '950', color: '#10b981', margin: '4px 0 0' }}>+{movement.stockIn.toLocaleString('en-IN')} Qty</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#5E6B82', textTransform: 'uppercase' }}>Stock Out</div>
              <div style={{ fontSize: '18px', fontWeight: '950', color: '#ef4444', margin: '4px 0 0' }}>-{movement.stockOut.toLocaleString('en-IN')} Qty</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#5E6B82', textTransform: 'uppercase' }}>Adjustments</div>
              <div style={{ fontSize: '18px', fontWeight: '950', color: '#f59e0b', margin: '4px 0 0' }}>{movement.adjustments >= 0 ? `+${movement.adjustments}` : movement.adjustments} Qty</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #4f46e5' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#5E6B82', textTransform: 'uppercase' }}>Net Movement</div>
              <div style={{ fontSize: '18px', fontWeight: '950', color: '#4f46e5', margin: '4px 0 0' }}>{movement.netMovement >= 0 ? `+${movement.netMovement}` : movement.netMovement} Qty</div>
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Total Inventory Transactions in Period: <strong>{movement.transactionCount}</strong>
          </div>
        </div>

        {/* Movement Trend Chart */}
        <div className="inv-card-section">
          <h3 className="inv-section-title">
            <Activity size={16} color="#4f46e5" /> Stock Movement Trend
          </h3>
          <div className="inv-chart-frame" style={{ '--default-chart-height': '260px' }}>
            {movementTrend.length === 0 ? (
              <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12.5px', fontStyle: 'italic' }}>
                No stock movement transactions logged for the selected period.
              </div>
            ) : (
              mounted && (
                <ResponsiveChart height={260}>
                  <AreaChart data={movementTrend}>
                    <defs>
                      <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis width={40} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#10b981" fillOpacity={1} fill="url(#colorStockIn)" />
                    <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#ef4444" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveChart>
              )
            )}
          </div>
        </div>

      </div>

      {/* ── 6. MATERIAL MOVEMENT CLASSIFICATION ── */}
      <div className="inv-card-section">
        <h3 className="inv-section-title">
          <Activity size={16} color="#8b5cf6" /> Material Movement Classification
        </h3>
        <div className="inv-grid-3col" style={{ marginBottom: '14px' }}>
          <div style={{ padding: '12px 16px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #4338ca' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase' }}>⚡ Fast Moving (&le; 30 Days)</span>
            <div style={{ fontSize: '20px', fontWeight: '950', color: '#4338ca', marginTop: '4px' }}>{classification.fast} Materials</div>
          </div>

          <div style={{ padding: '12px 16px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #d97706' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase' }}>🐢 Slow Moving (31 - 180 Days)</span>
            <div style={{ fontSize: '20px', fontWeight: '950', color: '#d97706', marginTop: '4px' }}>{classification.slow} Materials</div>
          </div>

          <div style={{ padding: '12px 16px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #64748b' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase' }}>🧊 Non-Moving (&gt; 180 Days)</span>
            <div style={{ fontSize: '20px', fontWeight: '950', color: '#64748b', marginTop: '4px' }}>{classification.nonMoving} Materials</div>
          </div>
        </div>
      </div>

      {/* ── 7. CRITICAL STOCK ALERTS & SHORTAGES ── */}
      <div className="inv-card-section">
        <h3 className="inv-section-title" style={{ color: '#ef4444' }}>
          <AlertTriangle size={18} color="#ef4444" /> Critical Stock Alerts & Shortages (Store Reconciled)
        </h3>
        <div className="inv-grid-3col" style={{ marginBottom: '14px' }}>
          <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#991B1B', textTransform: 'uppercase' }}>Out of Stock</div>
            <div style={{ fontSize: '20px', fontWeight: '950', color: '#B91C1C', marginTop: '4px' }}>{alerts.outOfStock} Materials</div>
          </div>

          <div style={{ padding: '12px 16px', background: '#FEF3C7', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400E', textTransform: 'uppercase' }}>Low Stock Warning</div>
            <div style={{ fontSize: '20px', fontWeight: '950', color: '#B45309', marginTop: '4px' }}>{alerts.lowStock} Materials</div>
          </div>

          <div style={{ padding: '12px 16px', background: '#F5FAFE', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#5E6B82', textTransform: 'uppercase' }}>Pending Material Indents</div>
            <div style={{ fontSize: '20px', fontWeight: '950', color: '#0284c7', marginTop: '4px' }}>{alerts.pendingIndents} Indents</div>
          </div>
        </div>

        {/* Critical Material Table */}
        <div className="inv-table-wrapper" style={{ maxHeight: '300px' }}>
          <table className="inv-table">
            <thead>
              <tr>
                <th>Material Code</th>
                <th>Material Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Shortage</th>
                <th>Stock Status</th>
                <th>Indent Status</th>
              </tr>
            </thead>
            <tbody>
              {criticalMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#16a34a', fontStyle: 'italic', padding: '20px' }}>
                    <CheckCircle size={16} inline style={{ marginRight: '6px' }} /> No critical stock alerts or shortages reported.
                  </td>
                </tr>
              ) : (
                criticalMaterials.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{m.code}</td>
                    <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{m.name}</td>
                    <td>{m.category}</td>
                    <td><span className="inv-badge inv-badge-fast">{m.unit}</span></td>
                    <td style={{ fontWeight: '950', color: m.currentStock <= 0 ? '#ef4444' : '#f59e0b' }}>{m.currentStock} {m.unit}</td>
                    <td>{m.minimumStock} {m.unit}</td>
                    <td style={{ fontWeight: 'bold', color: '#ef4444' }}>{m.shortage} {m.unit}</td>
                    <td>
                      <span className={`inv-badge ${m.stockStatus === 'OUT_OF_STOCK' ? 'inv-badge-outstock' : 'inv-badge-lowstock'}`}>
                        {m.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: m.indentStatus === 'No Indent' ? '#f1f5f9' : '#e0f2fe', color: m.indentStatus === 'No Indent' ? '#64748b' : '#0369a1' }}>
                        {m.indentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 8. CATEGORY-WISE INVENTORY ── */}
      <div className="inv-card-section">
        <h3 className="inv-section-title">
          <Package size={16} color="#0284c7" /> Inventory Breakdown by Category
        </h3>
        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Materials</th>
                <th>In Stock</th>
                <th>Low Stock</th>
                <th>Out of Stock</th>
                <th>Total Quantity</th>
                <th>Inventory Value</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '16px' }}>No categories found</td>
                </tr>
              ) : (
                categoryBreakdown.map((cat, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{cat.category}</td>
                    <td style={{ fontWeight: 'bold' }}>{cat.totalMaterials}</td>
                    <td><span className="inv-badge inv-badge-instock">{cat.inStock}</span></td>
                    <td><span className="inv-badge inv-badge-lowstock">{cat.lowStock}</span></td>
                    <td><span className="inv-badge inv-badge-outstock">{cat.outOfStock}</span></td>
                    <td style={{ fontWeight: '950' }}>{cat.quantity.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{cat.inventoryValue.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 9. RAW MATERIAL INVENTORY REGISTER TABLE (PAGINATED) ── */}
      <div className="inv-card-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 className="inv-section-title">
            <Layers size={16} color="#24345C" /> Raw Material Inventory Register
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter selectors */}
            <select value={stockStatusFilter} onChange={e => { setStockStatusFilter(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #D6E2F0', fontSize: '12px', background: '#fff', color: '#24345C', fontWeight: 'bold' }}>
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <select value={movementStatusFilter} onChange={e => { setMovementStatusFilter(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #D6E2F0', fontSize: '12px', background: '#fff', color: '#24345C', fontWeight: 'bold' }}>
              <option value="All">All Movement Types</option>
              <option value="Fast Moving">Fast Moving</option>
              <option value="Slow Moving">Slow Moving</option>
              <option value="Non-Moving">Non-Moving</option>
            </select>

            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #D6E2F0', fontSize: '12px', background: '#fff', color: '#24345C', fontWeight: 'bold' }}>
              <option value={15}>15 per page</option>
              <option value={30}>30 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Master Register Table */}
        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Material Code</th>
                <th>Material Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Stock Status</th>
                <th>Movement Class</th>
                <th>Last Stock In</th>
                <th>Last Stock Out</th>
                <th>Inventory Value</th>
              </tr>
            </thead>
            <tbody>
              {materialsList.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '24px' }}>
                    No raw materials found matching the selected filters.
                  </td>
                </tr>
              ) : (
                materialsList.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{m.code}</td>
                    <td style={{ fontWeight: 'bold', color: '#24345C' }}>{m.name}</td>
                    <td>{m.category}</td>
                    <td><span className="inv-badge inv-badge-fast">{m.unit}</span></td>
                    <td style={{ fontWeight: '950', color: m.currentStock <= 0 ? '#ef4444' : '#10b981' }}>{m.currentStock} {m.unit}</td>
                    <td>{m.minimumStock} {m.unit}</td>
                    <td>
                      <span className={`inv-badge ${m.stockStatus === 'OUT_OF_STOCK' ? 'inv-badge-outstock' : m.stockStatus === 'LOW_STOCK' ? 'inv-badge-lowstock' : 'inv-badge-instock'}`}>
                        {m.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`inv-badge ${m.movementStatus === 'FAST' ? 'inv-badge-fast' : m.movementStatus === 'SLOW' ? 'inv-badge-slow' : 'inv-badge-nonmoving'}`}>
                        {m.movementStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#64748b' }}>{m.lastStockIn ? new Date(m.lastStockIn).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: '11.5px', color: '#64748b' }}>{m.lastStockOut ? new Date(m.lastStockOut).toLocaleDateString() : '—'}</td>
                    <td style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{m.inventoryValue.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="inv-pagination-bar">
          <div>
            Showing <strong>{materialsList.length > 0 ? (page - 1) * pageSize + 1 : 0}</strong> to <strong>{Math.min(page * pageSize, pagination.total)}</strong> of <strong>{pagination.total}</strong> materials
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="inv-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={14} inline /> Previous
            </button>
            <span style={{ fontWeight: 'bold', color: '#24345C' }}>Page {page} of {pagination.pages}</span>
            <button className="inv-page-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight size={14} inline />
            </button>
          </div>
        </div>
      </div>

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
};

export default function InventoryAnalyticsPage() {
  return (
    <SuperAdminFilterProvider>
      <InventoryAnalyticsContent />
    </SuperAdminFilterProvider>
  );
}
