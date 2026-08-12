'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart
} from 'recharts';
import {
  Package, TrendingUp, AlertTriangle, CheckCircle, Clock,
  DollarSign, Layers, RefreshCw, Download, Search,
  ShieldCheck, Truck, Activity, PieChart as PieIcon, BarChart3,
  Database, ArrowDownRight, Award, Zap, XCircle
} from 'lucide-react';
import ResponsiveChartWrapper from '../../../shared/components/ResponsiveChartWrapper';
import { backendFetch } from '../../../lib/backendFetch';

export const StoreDashboard = () => {
  // ── Dynamic Backend & Live Inventory State ──
  const [liveInventory, setLiveInventory] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [rawMaterialCount, setRawMaterialCount] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  // ── Fetch Pure Dynamic Data from Backend API ──
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const [dashRes, transactionsRes, rawMaterialsRes] = await Promise.allSettled([
        backendFetch('/api/backend/inventory/dashboard'),
        backendFetch('/api/backend/inventory/transactions'),
        backendFetch('/api/backend/products?type=RAW_MATERIAL')
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        const payload = dashRes.value;
        const invList = Array.isArray(payload.inventory) ? payload.inventory.map(item => {
          const itemVal = (Number(item.available || 0) + Number(item.reserved || 0)) * Number(item.price || 0);
          const abc = itemVal > 50000 ? 'Class A' : itemVal > 10000 ? 'Class B' : 'Class C';
          const fsn = item.aging <= 30 ? 'Fast Moving' : item.aging <= 180 ? 'Slow Moving' : 'Non-Moving';
          return {
            id: item.id,
            code: item.code || 'N/A',
            name: item.name || 'Material Item',
            warehouse: item.warehouse || 'Main Store',
            category: item.category || 'Raw Material',
            available: Number(item.available || 0),
            reserved: Number(item.reserved || 0),
            min: Number(item.min || 0),
            max: Number(item.max || 0),
            price: Number(item.price || 0),
            aging: Number(item.aging || 0),
            rejections: Number(item.rejections || 0),
            abc,
            fsn
          };
        }) : [];

        setLiveInventory(invList);
        setSummaryData(payload.summary || null);
      } else {
        setLiveInventory([]);
        setSummaryData(null);
      }

      if (transactionsRes.status === 'fulfilled' && Array.isArray(transactionsRes.value)) {
        setStockTransactions(transactionsRes.value);
      } else {
        setStockTransactions([]);
      }

      // This is deliberately separate from the full product catalog used by
      // dashboard analytics. It matches the records visible in Raw Inventory.
      setRawMaterialCount(
        rawMaterialsRes.status === 'fulfilled' && Array.isArray(rawMaterialsRes.value)
          ? rawMaterialsRes.value.length
          : 0,
      );
    } catch (err) {
      console.warn('[StoreDashboard] Backend fetch error:', err);
      setErrorState(true);
      setLiveInventory([]);
      setSummaryData(null);
      setRawMaterialCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Helper to evaluate stock status ──
  const getStockStatus = (item) => {
    if (item.available === 0) return 'Out of Stock';
    if (item.min > 0 && item.available < item.min) return 'Below Min Stock';
    if (item.max > 0 && item.available > item.max) return 'Above Max Stock';
    if (item.aging > 180 || item.fsn === 'Non-Moving') return 'Dead Stock';
    return 'Available';
  };

  // ── Executive KPI Calculations (Pure Dynamic Math) ──
  const kpiData = useMemo(() => {
    let totalVal = 0;
    let totalAvailableQty = 0;
    let belowMinCount = 0;
    let aboveMaxCount = 0;
    let deadStockVal = 0;
    let slowCount = 0;
    let fastCount = 0;
    let totalRejections = 0;

    liveInventory.forEach((item) => {
      const itemVal = (item.available + item.reserved) * item.price;
      totalVal += itemVal;
      totalAvailableQty += item.available;

      if (item.available < item.min && item.available > 0) belowMinCount++;
      if (item.max > 0 && item.available > item.max) aboveMaxCount++;
      if (item.aging > 180 || item.fsn === 'Non-Moving') deadStockVal += itemVal;
      if (item.fsn === 'Slow Moving') slowCount++;
      if (item.fsn === 'Fast Moving') fastCount++;
      totalRejections += item.rejections;
    });

    const catalogItemCount = liveInventory.length;
    const rejectionRate = summaryData?.rejectionRate !== undefined 
      ? Number(summaryData.rejectionRate).toFixed(1)
      : (catalogItemCount > 0 && totalAvailableQty > 0 ? ((totalRejections / totalAvailableQty) * 100).toFixed(1) : '0.0');

    const accuracy = summaryData?.auditAccuracy ? `${summaryData.auditAccuracy}%` : '0%';
    const turnover = summaryData?.turnoverRatio ? `${summaryData.turnoverRatio}x` : '0x';
    const utilization = summaryData?.warehouseUtilization ? `${summaryData.warehouseUtilization}%` : '0%';

    return {
      totalVal,
      rawMaterialCount,
      totalAvailableQty,
      belowMinCount,
      aboveMaxCount,
      deadStockVal,
      slowCount,
      fastCount,
      rejectionRate,
      accuracy,
      turnover,
      utilization
    };
  }, [liveInventory, rawMaterialCount, summaryData]);

  // ── Chart 1: Inventory Value Trend (Monthly) ──
  const trendChartData = useMemo(() => {
    if (kpiData.totalVal === 0) return [];
    const currentLakhs = Number((kpiData.totalVal / 100000).toFixed(2));
    return [
      { month: 'Current', value: currentLakhs, target: currentLakhs }
    ];
  }, [kpiData.totalVal]);

  // ── Chart 2: Warehouse-wise Stock Distribution ──
  const warehouseDistData = useMemo(() => {
    const map = {};
    liveInventory.forEach((item) => {
      const wh = item.warehouse || 'Main Store';
      const val = (item.available * item.price) / 100000;
      map[wh] = (map[wh] || 0) + val;
    });
    const keys = Object.keys(map);
    if (keys.length === 0) return [];
    return keys.map((wh) => ({
      warehouse: wh,
      valueLakhs: Number(map[wh].toFixed(2))
    }));
  }, [liveInventory]);

  // ── Chart 3: Inventory by Category ──
  const categoryPieData = useMemo(() => {
    const map = {};
    liveInventory.forEach((item) => {
      const cat = item.category || 'Raw Material';
      const val = (item.available * item.price) / 100000;
      map[cat] = (map[cat] || 0) + val;
    });
    const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
    const keys = Object.keys(map);
    if (keys.length === 0) return [];
    return keys.map((cat, idx) => ({
      name: cat,
      value: Number(map[cat].toFixed(2)),
      color: COLORS[idx % COLORS.length]
    }));
  }, [liveInventory]);

  // ── Chart 4: Daily Material Inward vs Outward ──
  const dailyMovementData = useMemo(() => {
    if (!Array.isArray(stockTransactions) || stockTransactions.length === 0) return [];
    const dailyMap = {};
    stockTransactions.forEach(tx => {
      const day = new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!dailyMap[day]) dailyMap[day] = { day, inward: 0, outward: 0 };
      const qty = Number(tx.quantity) || 0;
      if (tx.type === 'IN' || tx.type === 'PURCHASE_RECEIPT') dailyMap[day].inward += qty;
      else if (tx.type === 'OUT') dailyMap[day].outward += qty;
    });
    return Object.values(dailyMap).slice(-7);
  }, [stockTransactions]);

  // ── Chart 5: Minimum Stock vs Current Stock ──
  const minVsCurrentData = useMemo(() => {
    if (liveInventory.length === 0) return [];
    return liveInventory
      .slice(0, 7)
      .map((item) => ({
        name: item.name.length > 14 ? item.name.slice(0, 14) + '...' : item.name,
        Current: item.available,
        Minimum: item.min,
      }));
  }, [liveInventory]);

  // ── Chart 6: Fast, Slow & Dead Stock Distribution ──
  const fsnDonutData = useMemo(() => {
    let fast = 0, slow = 0, dead = 0;
    liveInventory.forEach((item) => {
      if (item.fsn === 'Fast Moving') fast++;
      else if (item.fsn === 'Slow Moving') slow++;
      else dead++;
    });
    if (fast + slow + dead === 0) return [];
    return [
      { name: 'Fast Moving', value: fast, color: '#10b981' },
      { name: 'Slow Moving', value: slow, color: '#f59e0b' },
      { name: 'Dead Stock', value: dead, color: '#ef4444' },
    ];
  }, [liveInventory]);

  // ── Chart 7: Stock Aging Buckets ──
  const stockAgingData = useMemo(() => {
    let b0_30 = 0, b31_60 = 0, b61_90 = 0, b91_180 = 0, b180Plus = 0;
    liveInventory.forEach((item) => {
      if (item.aging <= 30) b0_30++;
      else if (item.aging <= 60) b31_60++;
      else if (item.aging <= 90) b61_90++;
      else if (item.aging <= 180) b91_180++;
      else b180Plus++;
    });
    if (b0_30 + b31_60 + b61_90 + b91_180 + b180Plus === 0) return [];
    return [
      { bucket: '0-30 Days', count: b0_30, color: '#10b981' },
      { bucket: '31-60 Days', count: b31_60, color: '#0284c7' },
      { bucket: '61-90 Days', count: b61_90, color: '#f59e0b' },
      { bucket: '91-180 Days', count: b91_180, color: '#8b5cf6' },
      { bucket: '180+ Days', count: b180Plus, color: '#ef4444' },
    ];
  }, [liveInventory]);

  // ── Chart 8: Top Rejected Materials (Pareto) ──
  const paretoChartData = useMemo(() => {
    const sorted = [...liveInventory].filter(i => i.rejections > 0).sort((a, b) => b.rejections - a.rejections).slice(0, 5);
    if (sorted.length === 0) return [];
    let totalRej = sorted.reduce((sum, i) => sum + i.rejections, 0) || 1;
    let runningSum = 0;

    return sorted.map((item) => {
      runningSum += item.rejections;
      return {
        name: item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name,
        rejections: item.rejections,
        cumPct: Math.round((runningSum / totalRej) * 100),
      };
    });
  }, [liveInventory]);

  // ── Chart 9: ABC Analysis ──
  const abcChartData = useMemo(() => {
    let classA = 0, classB = 0, classC = 0;
    liveInventory.forEach((item) => {
      const val = (item.available * item.price) / 100000;
      if (item.abc === 'Class A') classA += val;
      else if (item.abc === 'Class B') classB += val;
      else classC += val;
    });
    if (classA + classB + classC === 0) return [];
    return [
      { class: 'Class A (High Value)', value: Number(classA.toFixed(2)), color: '#0284c7' },
      { class: 'Class B (Med Value)', value: Number(classB.toFixed(2)), color: '#f59e0b' },
      { class: 'Class C (Low Value)', value: Number(classC.toFixed(2)), color: '#64748b' },
    ];
  }, [liveInventory]);

  // ── Chart 10: FSN Analysis Donut ──
  const fsnChartData = useMemo(() => {
    let fastVal = 0, slowVal = 0, deadVal = 0;
    liveInventory.forEach((item) => {
      const val = (item.available * item.price) / 100000;
      if (item.fsn === 'Fast Moving') fastVal += val;
      else if (item.fsn === 'Slow Moving') slowVal += val;
      else deadVal += val;
    });
    if (fastVal + slowVal + deadVal === 0) return [];
    return [
      { name: 'Fast (F)', value: Number(fastVal.toFixed(2)), color: '#10b981' },
      { name: 'Slow (S)', value: Number(slowVal.toFixed(2)), color: '#f59e0b' },
      { name: 'Non-Moving (N)', value: Number(deadVal.toFixed(2)), color: '#ef4444' },
    ];
  }, [liveInventory]);

  // ── Export CSV Handler ──
  const handleExportCSV = () => {
    const headers = ['Material Code,Material Name,Warehouse,Category,Available Qty,Reserved Qty,Min Stock,Max Stock,Stock Status,Aging (Days),Inventory Value (INR)'];
    const rows = liveInventory.map(i => [
      i.code, `"${i.name}"`, `"${i.warehouse}"`, `"${i.category}"`, i.available, i.reserved, i.min, i.max, `"${getStockStatus(i)}"`, i.aging, (i.available * i.price)
    ].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
              <Database size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Store Manager | Inventory Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Enterprise real-time warehouse inventory valuation, stock aging, ABC/FSN analysis &amp; SLA compliance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            style={{ background: '#ffffff', color: '#0284c7', border: '1.5px solid #e2e8f0', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? 'Refreshing...' : 'Live Sync'}
          </button>
          <button
            onClick={handleExportCSV}
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' }}
          >
            <Download size={16} /> Export Inventory CSV
          </button>
        </div>
      </div>

      {errorState && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '13px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="#dc2626" /> Unable to load inventory data from backend API. Displaying safe empty state.
        </div>
      )}

      {/* ── 12 Executive KPI Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Total Raw Materials */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>📦 Total Raw Materials</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: '4px 0' }}>
            {kpiData.rawMaterialCount} Materials
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Items shown in Raw Inventory</div>
        </div>

        {/* 3. Available Stock */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>✅ Available Stock</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>
            {(kpiData.totalAvailableQty ?? 0).toLocaleString()} Pcs
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Ready for release</div>
        </div>

        {/* 4. Below Minimum Stock */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚠️ Below Min Stock</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', margin: '4px 0' }}>
            {kpiData.belowMinCount} Items
          </div>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>Reorder threshold breached</div>
        </div>

        {/* 5. Above Maximum Stock */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>📈 Above Max Stock</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#b45309', margin: '4px 0' }}>
            {kpiData.aboveMaxCount} Items
          </div>
          <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '600' }}>Overstock alert</div>
        </div>

        {/* 6. Dead Stock Value */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #881337' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🛑 Dead Stock Value</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#991b1b', margin: '4px 0' }}>
            ₹{(kpiData.deadStockVal / 100000).toFixed(2)} L
          </div>
          <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '600' }}>&gt;180 Days Non-Moving</div>
        </div>

        {/* 7. Slow Moving Items */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🐢 Slow Moving</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#d97706', margin: '4px 0' }}>
            {kpiData.slowCount} SKUs
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Moderate turnover</div>
        </div>

        {/* 8. Fast Moving Items */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚡ Fast Moving</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669', margin: '4px 0' }}>
            {kpiData.fastCount} SKUs
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>High demand velocity</div>
        </div>

        {/* 9. Material Rejection % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>❌ Rejection Rate %</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626', margin: '4px 0' }}>
            {kpiData.rejectionRate}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>QC intake rejections</div>
        </div>

      </div>

      {/* ── Bottom Detail Table ── */}
      {false && <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Material Details / Complete Inventory Table
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Showing {liveInventory.length} inventory records across active warehouses
            </p>
          </div>

          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0284c7' }}>
            Total Value: ₹{(kpiData.totalVal / 100000).toFixed(2)} Lakhs
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', textTransform: 'uppercase', fontSize: '11.5px' }}>
                <th style={{ padding: '12px 14px' }}>Material Code</th>
                <th style={{ padding: '12px 14px' }}>Material Name</th>
                <th style={{ padding: '12px 14px' }}>Warehouse</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Available Qty</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Reserved Qty</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Min Stock</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Max Stock</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Stock Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Aging (Days)</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Inventory Value</th>
              </tr>
            </thead>
            <tbody>
              {liveInventory.length > 0 ? (
                liveInventory.map((row, index) => {
                  const status = getStockStatus(row);
                  let badgeBg = '#dcfce7', badgeFg = '#15803d';
                  if (status === 'Below Min Stock' || status === 'Out of Stock') {
                    badgeBg = '#fee2e2'; badgeFg = '#b91c1c';
                  } else if (status === 'Above Max Stock') {
                    badgeBg = '#fef3c7'; badgeFg = '#b45309';
                  } else if (status === 'Dead Stock') {
                    badgeBg = '#ffe4e6'; badgeFg = '#9f1239';
                  }

                  const rowVal = (row.available + row.reserved) * row.price;

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '800', fontFamily: 'monospace', color: '#0284c7' }}>
                        {row.code}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', color: '#334155' }}>
                          {row.warehouse}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontWeight: '600' }}>
                        {row.category}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: row.available < row.min ? '#dc2626' : '#0f172a' }}>
                        {(row.available ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                        {(row.reserved ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                        {(row.min ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                        {(row.max ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ background: badgeBg, color: badgeFg, padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', display: 'inline-block' }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: row.aging > 180 ? '#991b1b' : '#334155' }}>
                        {row.aging} Days
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '900', color: '#0f172a' }}>
                        ₹{(rowVal ?? 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                    No inventory records currently available in store database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>}

    </div>
  );
};

export default StoreDashboard;

