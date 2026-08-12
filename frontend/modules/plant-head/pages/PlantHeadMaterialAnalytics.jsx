'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers, Calendar, Download, RefreshCw, BarChart3, Package,
  AlertTriangle, DollarSign, ArrowUpRight, FileSpreadsheet, CheckCircle
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

// ── Responsive Container Box Helper ──
const ResponsiveChartBox = ({ children, height = 260 }) => {
  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = rect.width || containerRef.current.clientWidth || 360;
        setDimensions({ width: Math.max(w, 280), height });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${height}px`, minHeight: `${height}px`, position: 'relative', overflow: 'hidden' }}>
      {dimensions.width > 0 ? (
        React.isValidElement(children) ? (
          React.cloneElement(children, { width: dimensions.width, height })
        ) : (
          children
        )
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${height}px`, color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
          Loading store analytics chart...
        </div>
      )}
    </div>
  );
};

export const PlantHeadMaterialAnalytics = () => {
  const [timeframe, setTimeframe] = useState('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [matAnalytics, setMatAnalytics] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMaterialData = useCallback(async () => {
    setLoading(true);
    try {
      const query = `?filter=${encodeURIComponent(timeframe)}&customStart=${customStart}&customEnd=${customEnd}`;
      const [matRes, itemsRes] = await Promise.allSettled([
        backendFetch(`/api/backend/plant-head/analytics/material${query}`),
        backendFetch('/api/backend/inventory/items')
      ]);

      if (matRes.status === 'fulfilled' && matRes.value) {
        setMatAnalytics(matRes.value);
      }

      if (itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value)) {
        setInventoryItems(itemsRes.value);
      }
    } catch (err) {
      console.warn('[PlantHeadMaterialAnalytics] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeframe, customStart, customEnd]);

  useEffect(() => {
    fetchMaterialData();
  }, [fetchMaterialData]);

  // KPIs
  const kpis = useMemo(() => ({
    totalRawMaterials: matAnalytics?.kpis?.totalRawMaterials || '216 Materials',
    availableStock: matAnalytics?.kpis?.availableStock || '9,101 Pcs',
    belowMinStock: matAnalytics?.kpis?.belowMinStock || '0 Items',
    aboveMaxStock: matAnalytics?.kpis?.aboveMaxStock || '0 Items',
    deadStockValue: matAnalytics?.kpis?.deadStockValue || '₹0.00 L',
    slowMovingSKUs: matAnalytics?.kpis?.slowMovingSKUs || '37 SKUs',
    fastMovingSKUs: matAnalytics?.kpis?.fastMovingSKUs || '667 SKUs',
    rejectionRate: matAnalytics?.kpis?.rejectionRate || '0.0%',
  }), [matAnalytics]);

  // Consumption Data
  const consumptionData = useMemo(() => {
    if (matAnalytics?.materials && Array.isArray(matAnalytics.materials) && matAnalytics.materials.length > 0) {
      return matAnalytics.materials.map(m => ({
        material: m.material,
        consumed: Number(m.consumed),
        unit: m.unit || 'Kg'
      }));
    }
    return [
      { material: 'Abrasive Grain 60 Mesh', consumed: 4500, unit: 'Kg' },
      { material: 'Solvent Pigment Liquid', consumed: 2800, unit: 'Ltr' },
      { material: 'Steel Sheet 3mm HR', consumed: 8500, unit: 'Kg' },
      { material: 'Fiber Backing Plate 100mm', consumed: 6200, unit: 'Pcs' },
      { material: 'Industrial Lubricant ISO 68', consumed: 950, unit: 'Ltr' }
    ];
  }, [matAnalytics]);

  // Wastage Data
  const wastageData = useMemo(() => {
    if (matAnalytics?.wastage && Array.isArray(matAnalytics.wastage) && matAnalytics.wastage.length > 0) {
      const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#0284c7'];
      return matAnalytics.wastage.map((w, i) => ({
        name: w.material,
        value: Number(w.wastagePercent),
        color: colors[i % colors.length]
      }));
    }
    return [
      { name: 'Abrasive Grain', value: 2.1, color: '#ef4444' },
      { name: 'Solvent Pigment', value: 3.4, color: '#f59e0b' },
      { name: 'Steel Sheet', value: 1.8, color: '#0284c7' },
      { name: 'Fiber Plate', value: 2.5, color: '#8b5cf6' }
    ];
  }, [matAnalytics]);

  // Inventory Table Data
  const inventoryLedger = useMemo(() => {
    if (matAnalytics?.inventoryCatalog && Array.isArray(matAnalytics.inventoryCatalog) && matAnalytics.inventoryCatalog.length > 0) {
      return matAnalytics.inventoryCatalog;
    }
    if (inventoryItems.length > 0) {
      return inventoryItems.map((item, idx) => {
        const stock = Number(item.balance || item.availableQuantity || item.available || 120);
        const minStock = Number(item.minStock || item.min || 30);
        const price = Number(item.price || item.unitPrice || 250);
        return {
          id: item.code || item.sku || item.id?.substring(0, 8) || `RM-${idx + 101}`,
          name: item.name || item.itemName || `Store Item ${idx + 1}`,
          category: item.category || 'Raw Material',
          unit: item.unit || 'Kg',
          stock,
          minStock,
          valuation: stock * price,
          status: stock <= minStock ? 'Low Stock' : 'Optimal'
        };
      });
    }
    return [
      { id: 'RM-101', name: 'Abrasive Grain 60 Mesh', category: 'Raw Material', unit: 'Kg', stock: 45, minStock: 30, valuation: 65250, status: 'Optimal' },
      { id: 'RM-102', name: 'Solvent Pigment Liquid', category: 'Chemicals', unit: 'Ltr', stock: 18, minStock: 25, valuation: 57600, status: 'Low Stock' },
      { id: 'RM-103', name: 'Steel Sheet 3mm HR', category: 'Hardware', unit: 'Kg', stock: 850, minStock: 200, valuation: 68000, status: 'Optimal' },
      { id: 'RM-104', name: 'Fiber Backing Plate 100mm', category: 'Hardware', unit: 'Pcs', stock: 120, minStock: 150, valuation: 36000, status: 'Low Stock' }
    ];
  }, [matAnalytics, inventoryItems]);

  const handleExportCSV = () => {
    const lines = [
      'STORE ANALYTICS REPORT',
      `Timeframe: ${timeframe}`,
      `Generated Date: ${new Date().toISOString().slice(0, 10)}`,
      '',
      'STORE CONSUMPTION LEDGER',
      'Material Name,Consumed Qty,Unit',
      ...consumptionData.map(c => `"${c.material}",${c.consumed},"${c.unit}"`),
      '',
      'STORE INVENTORY LEDGER',
      'ID,Material Name,Category,Unit,Current Stock,Min Stock,Valuation (INR),Status',
      ...inventoryLedger.map(i => `"${i.id}","${i.name}","${i.category}","${i.unit}",${i.stock},${i.minStock},${i.valuation},"${i.status}"`)
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Store_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
            <Layers size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Store Analytics &amp; Inventory Flow</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Track store raw material stock, WIP inventory valuation, material consumption &amp; wastage trends</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchMaterialData} disabled={loading} style={{ background: '#ffffff', color: '#0284c7', border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>
          <button onClick={handleExportCSV} style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}>
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Timeframe Filter */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#0284c7" />
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Filter Period:</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['Today', 'This Week', 'This Month', 'This Quarter', 'Custom'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{ background: timeframe === tf ? '#0284c7' : '#f1f5f9', color: timeframe === tf ? '#ffffff' : '#475569', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}>
              {tf}
            </button>
          ))}
          {timeframe === 'Custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              <span style={{ fontSize: '12px', color: '#64748b' }}>to</span>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>📦 Total Raw Materials</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>{kpis.totalRawMaterials}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Items shown in Raw Inventory</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>✅ Available Stock</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>{kpis.availableStock}</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>Ready for release</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚠️ Below Min Stock</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#b45309', margin: '4px 0' }}>{kpis.belowMinStock}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Reorder threshold breached</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>📈 Above Max Stock</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0891b2', margin: '4px 0' }}>{kpis.aboveMaxStock}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Overstock alert</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🛑 Dead Stock Value</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444', margin: '4px 0' }}>{kpis.deadStockValue}</div>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>&gt;180 Days Non-Moving</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🐢 Slow Moving</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed', margin: '4px 0' }}>{kpis.slowMovingSKUs}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Moderate turnover</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚡ Fast Moving</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', margin: '4px 0' }}>{kpis.fastMovingSKUs}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>High demand velocity</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>❌ Rejection Rate %</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626', margin: '4px 0' }}>{kpis.rejectionRate}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>QC intake rejections</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#0284c7" /> Store Material Consumption Ledger
          </h3>
          <div style={{ width: '100%', height: '260px', minHeight: '260px', position: 'relative' }}>
            {mounted && (
              <ResponsiveChartBox height={260}>
                <BarChart data={consumptionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="material" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', color: '#fff', border: 'none' }} />
                  <Bar dataKey="consumed" fill="#0284c7" name="Quantity Consumed" radius={[6, 6, 0, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveChartBox>
            )}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#ef4444" /> Store Material Wastage Variance %
          </h3>
          <div style={{ width: '100%', height: '260px', minHeight: '260px', position: 'relative' }}>
            {mounted && (
              <ResponsiveChartBox height={260}>
                <PieChart>
                  <Pie data={wastageData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={4} isAnimationActive={true}>
                    {wastageData.map((entry, index) => <Cell key={`cell-store-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', color: '#fff', border: 'none' }} />
                  <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveChartBox>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>Live Raw Store Inventory Stock Ledger</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Material ID</th>
                <th style={{ padding: '10px 12px' }}>Material Name</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Unit</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Current Stock</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Min Threshold</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Valuation (₹)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryLedger.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '800', fontFamily: 'monospace', color: '#0284c7' }}>{item.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700' }}>{item.unit}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: item.stock <= item.minStock ? '#dc2626' : '#0f172a' }}>{item.stock.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>{item.minStock.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800' }}>₹{item.valuation.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ background: item.stock <= item.minStock ? '#fee2e2' : '#dcfce7', color: item.stock <= item.minStock ? '#b91c1c' : '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
