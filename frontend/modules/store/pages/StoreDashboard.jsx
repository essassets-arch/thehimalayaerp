'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart
} from 'recharts';
import {
  Package, TrendingUp, AlertTriangle, CheckCircle, Clock,
  DollarSign, Layers, RefreshCw, Filter, Download, Search,
  ShieldCheck, Truck, Activity, PieChart as PieIcon, BarChart3,
  Database, ArrowUpRight, ArrowDownRight, Award, Zap, XCircle
} from 'lucide-react';

// Comprehensive Seeding Dataset for Inventory Master & Store Analytics
const INVENTORY_DATASET = [
  { code: 'HCPPL001', name: 'WATER PAPER 60', warehouse: 'FG-04 Spares', category: 'Hardware', group: 'Abrasives', supplier: 'Apex Industrial Supplies', available: 15, reserved: 2, min: 20, max: 100, price: 120, aging: 45, abc: 'Class C', fsn: 'Slow Moving', rejections: 0 },
  { code: 'HCPPL002', name: 'WATER PAPER 80', warehouse: 'FG-04 Spares', category: 'Hardware', group: 'Abrasives', supplier: 'Apex Industrial Supplies', available: 1890, reserved: 150, min: 200, max: 2500, price: 110, aging: 12, abc: 'Class B', fsn: 'Fast Moving', rejections: 12 },
  { code: 'HCPPL003', name: 'WATER PAPER 120', warehouse: 'FG-04 Spares', category: 'Hardware', group: 'Abrasives', supplier: 'Apex Industrial Supplies', available: 32, reserved: 5, min: 50, max: 500, price: 115, aging: 28, abc: 'Class C', fsn: 'Slow Moving', rejections: 2 },
  { code: 'HCPPL004', name: 'WATER PAPER 150', warehouse: 'FG-04 Spares', category: 'Hardware', group: 'Abrasives', supplier: 'Apex Industrial Supplies', available: 850, reserved: 40, min: 100, max: 1200, price: 115, aging: 18, abc: 'Class B', fsn: 'Fast Moving', rejections: 5 },
  { code: 'HCPPL005', name: 'BLUE PIGMENT HIGH GRADE', warehouse: 'FG-03 Chemical Store', category: 'Chemical & Pigment', group: 'Pigments', supplier: 'Gujarat Chemical Corp', available: 52, reserved: 10, min: 100, max: 500, price: 4200, aging: 190, abc: 'Class A', fsn: 'Non-Moving', rejections: 18 },
  { code: 'HCPPL006', name: 'LIGHT GREY PIGMENT', warehouse: 'FG-03 Chemical Store', category: 'Chemical & Pigment', group: 'Pigments', supplier: 'Gujarat Chemical Corp', available: 123, reserved: 20, min: 50, max: 300, price: 3800, aging: 35, abc: 'Class A', fsn: 'Fast Moving', rejections: 4 },
  { code: 'HCPPL007', name: 'RED PIGMENT POWDER', warehouse: 'FG-03 Chemical Store', category: 'Chemical & Pigment', group: 'Pigments', supplier: 'Gujarat Chemical Corp', available: 59, reserved: 5, min: 60, max: 400, price: 3500, aging: 85, abc: 'Class A', fsn: 'Slow Moving', rejections: 8 },
  { code: 'HCPPL008', name: 'BLACK PIGMENT CARBON', warehouse: 'FG-03 Chemical Store', category: 'Chemical & Pigment', group: 'Pigments', supplier: 'Gujarat Chemical Corp', available: 200, reserved: 30, min: 80, max: 600, price: 2900, aging: 14, abc: 'Class A', fsn: 'Fast Moving', rejections: 2 },
  { code: 'HCPPL009', name: 'HIGH TENSILE STEEL SHEET 3MM', warehouse: 'FG-02 Raw Material Yard', category: 'Raw Material', group: 'Metals & Sheets', supplier: 'Tata Steel Ltd', available: 1450, reserved: 200, min: 500, max: 1800, price: 850, aging: 22, abc: 'Class A', fsn: 'Fast Moving', rejections: 25 },
  { code: 'HCPPL010', name: 'ALUMINUM COIL 1.5MM', warehouse: 'FG-02 Raw Material Yard', category: 'Raw Material', group: 'Metals & Sheets', supplier: 'Tata Steel Ltd', available: 920, reserved: 100, min: 300, max: 1200, price: 1250, aging: 40, abc: 'Class A', fsn: 'Fast Moving', rejections: 10 },
  { code: 'HCPPL011', name: 'BENJO WAX POLISH', warehouse: 'FG-03 Chemical Store', category: 'Chemical & Pigment', group: 'Solvents', supplier: 'Asian Paints Raw', available: 20, reserved: 0, min: 40, max: 200, price: 650, aging: 210, abc: 'Class B', fsn: 'Non-Moving', rejections: 1 },
  { code: 'HCPPL012', name: 'WHITE WAX POLISH', warehouse: 'FG-03 Chemical Store', category: 'Chemical & Pigment', group: 'Solvents', supplier: 'Asian Paints Raw', available: 45, reserved: 5, min: 50, max: 250, price: 620, aging: 75, abc: 'Class B', fsn: 'Slow Moving', rejections: 3 },
  { code: 'HCPPL013', name: 'INDUSTRIAL BRUSH 50 MM', warehouse: 'FG-04 Spares', category: 'Hardware', group: 'Tools', supplier: 'Apex Industrial Supplies', available: 227, reserved: 15, min: 50, max: 500, price: 95, aging: 10, abc: 'Class C', fsn: 'Fast Moving', rejections: 0 },
  { code: 'HCPPL014', name: 'IRON CUTTING DISK 4 INCH', warehouse: 'FG-04 Spares', category: 'Hardware', group: 'Tools', supplier: 'Apex Industrial Supplies', available: 271, reserved: 20, min: 100, max: 800, price: 145, aging: 15, abc: 'Class C', fsn: 'Fast Moving', rejections: 6 },
  { code: 'HCPPL015', name: 'GEAR LUBRICANT OIL ISO 220', warehouse: 'FG-01 Main FG', category: 'Raw Material', group: 'Solvents', supplier: 'Bharat Petroleum', available: 2, reserved: 0, min: 10, max: 50, price: 1850, aging: 95, abc: 'Class B', fsn: 'Slow Moving', rejections: 0 },
  { code: 'HCPPL016', name: 'SANDING MACHINE DUAL ACTION', warehouse: 'FG-04 Spares', category: 'Electrical', group: 'Power Tools', supplier: 'Apex Industrial Supplies', available: 4, reserved: 1, min: 2, max: 10, price: 8500, aging: 120, abc: 'Class A', fsn: 'Slow Moving', rejections: 1 },
  { code: 'HCPPL017', name: 'HEAVY DUTY DRILL BIT 12MM', warehouse: 'FG-04 Spares', category: 'Hardware', group: 'Tools', supplier: 'Apex Industrial Supplies', available: 26, reserved: 2, min: 30, max: 150, price: 320, aging: 50, abc: 'Class C', fsn: 'Slow Moving', rejections: 2 },
  { code: 'HCPPL018', name: 'PACKAGING CORRUGATED BOX XL', warehouse: 'FG-01 Main FG', category: 'Packaging', group: 'Cartons', supplier: 'Apex Industrial Supplies', available: 3200, reserved: 450, min: 1000, max: 3000, price: 45, aging: 8, abc: 'Class C', fsn: 'Fast Moving', rejections: 15 },
  { code: 'HCPPL019', name: 'INDUSTRIAL GLUE CYANOACRYLATE', warehouse: 'FG-03 Chemical Store', category: 'Chemical & Pigment', group: 'Solvents', supplier: 'Gujarat Chemical Corp', available: 38, reserved: 0, min: 50, max: 300, price: 480, aging: 160, abc: 'Class B', fsn: 'Slow Moving', rejections: 7 },
  { code: 'HCPPL020', name: 'COPPER BUSBAR 50X6MM', warehouse: 'FG-02 Raw Material Yard', category: 'Raw Material', group: 'Metals & Sheets', supplier: 'Tata Steel Ltd', available: 680, reserved: 80, min: 200, max: 800, price: 2100, aging: 25, abc: 'Class A', fsn: 'Fast Moving', rejections: 3 }
];

export const StoreDashboard = () => {
  // ── Global Filter States (Slicers) ──
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [selectedABC, setSelectedABC] = useState('All');
  const [selectedFSN, setSelectedFSN] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('30_days');

  // ── Reset All Filters ──
  const handleResetFilters = () => {
    setSelectedWarehouse('All');
    setSelectedCategory('All');
    setSelectedGroup('All');
    setSelectedSupplier('All');
    setSelectedStockStatus('All');
    setSelectedABC('All');
    setSelectedFSN('All');
    setSearchQuery('');
    setDateRange('30_days');
  };

  // ── Helper to evaluate stock status ──
  const getStockStatus = (item) => {
    if (item.available === 0) return 'Out of Stock';
    if (item.available < item.min) return 'Below Min Stock';
    if (item.available > item.max) return 'Above Max Stock';
    if (item.aging > 180 || item.fsn === 'Non-Moving') return 'Dead Stock';
    return 'Available';
  };

  // ── Filtered Inventory Dataset ──
  const filteredData = useMemo(() => {
    return INVENTORY_DATASET.filter((item) => {
      const status = getStockStatus(item);

      if (selectedWarehouse !== 'All' && item.warehouse !== selectedWarehouse) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedGroup !== 'All' && item.group !== selectedGroup) return false;
      if (selectedSupplier !== 'All' && item.supplier !== selectedSupplier) return false;
      if (selectedABC !== 'All' && item.abc !== selectedABC) return false;
      if (selectedFSN !== 'All' && item.fsn !== selectedFSN) return false;
      
      if (selectedStockStatus !== 'All') {
        if (selectedStockStatus === 'Below Min Stock' && status !== 'Below Min Stock') return false;
        if (selectedStockStatus === 'Above Max Stock' && status !== 'Above Max Stock') return false;
        if (selectedStockStatus === 'Dead Stock' && status !== 'Dead Stock') return false;
        if (selectedStockStatus === 'Available' && status !== 'Available') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }

      return true;
    });
  }, [
    selectedWarehouse, selectedCategory, selectedGroup, selectedSupplier,
    selectedStockStatus, selectedABC, selectedFSN, searchQuery
  ]);

  // ── Executive KPI Calculations ──
  const kpiData = useMemo(() => {
    let totalVal = 0;
    let totalAvailableQty = 0;
    let belowMinCount = 0;
    let aboveMaxCount = 0;
    let deadStockVal = 0;
    let slowCount = 0;
    let fastCount = 0;
    let totalRejections = 0;

    filteredData.forEach((item) => {
      const itemVal = (item.available + item.reserved) * item.price;
      totalVal += itemVal;
      totalAvailableQty += item.available;

      if (item.available < item.min) belowMinCount++;
      if (item.available > item.max) aboveMaxCount++;
      if (item.aging > 180 || item.fsn === 'Non-Moving') deadStockVal += itemVal;
      if (item.fsn === 'Slow Moving') slowCount++;
      if (item.fsn === 'Fast Moving') fastCount++;
      totalRejections += item.rejections;
    });

    const skusCount = filteredData.length;
    const rejectionRate = skusCount > 0 ? (totalRejections / (totalAvailableQty || 1) * 100).toFixed(1) : '1.8';
    const accuracy = '98.6%';
    const turnover = '6.4x';
    const utilization = '84.2%';

    return {
      totalVal,
      skusCount,
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
  }, [filteredData]);

  // ── Chart 1: Inventory Value Trend (Monthly) ──
  const trendChartData = [
    { month: 'Jan', value: 38.5, target: 45.0 },
    { month: 'Feb', value: 41.2, target: 45.0 },
    { month: 'Mar', value: 39.8, target: 45.0 },
    { month: 'Apr', value: 44.1, target: 45.0 },
    { month: 'May', value: 46.5, target: 45.0 },
    { month: 'Jun', value: 45.0, target: 45.0 },
    { month: 'Jul', value: 48.2, target: 45.0 },
    { month: 'Aug', value: (kpiData.totalVal / 100000).toFixed(1), target: 45.0 },
  ];

  // ── Chart 2: Warehouse-wise Stock Distribution ──
  const warehouseDistData = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const wh = item.warehouse;
      const val = (item.available * item.price) / 100000;
      map[wh] = (map[wh] || 0) + val;
    });
    return Object.keys(map).map((wh) => ({
      warehouse: wh.replace('FG-', 'WH-'),
      valueLakhs: Number(map[wh].toFixed(2))
    }));
  }, [filteredData]);

  // ── Chart 3: Inventory by Category ──
  const categoryPieData = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const cat = item.category;
      const val = (item.available * item.price) / 100000;
      map[cat] = (map[cat] || 0) + val;
    });
    const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
    return Object.keys(map).map((cat, idx) => ({
      name: cat,
      value: Number(map[cat].toFixed(2)),
      color: COLORS[idx % COLORS.length]
    }));
  }, [filteredData]);

  // ── Chart 4: Daily Inward vs Outward ──
  const dailyMovementData = [
    { day: '01 Aug', inward: 140, outward: 110 },
    { day: '02 Aug', inward: 180, outward: 165 },
    { day: '03 Aug', inward: 95, outward: 140 },
    { day: '04 Aug', inward: 220, outward: 190 },
    { day: '05 Aug', inward: 310, outward: 280 },
    { day: '06 Aug', inward: 160, outward: 175 },
    { day: '07 Aug', inward: 240, outward: 210 },
  ];

  // ── Chart 5: Minimum vs Current Stock (Critical items) ──
  const minVsCurrentData = useMemo(() => {
    return filteredData
      .slice(0, 7)
      .map((item) => ({
        name: item.name.length > 14 ? item.name.slice(0, 14) + '...' : item.name,
        Current: item.available,
        Minimum: item.min,
      }));
  }, [filteredData]);

  // ── Chart 6: Fast, Slow & Dead Stock Distribution ──
  const fsnDonutData = useMemo(() => {
    let fast = 0, slow = 0, dead = 0;
    filteredData.forEach((item) => {
      if (item.fsn === 'Fast Moving') fast++;
      else if (item.fsn === 'Slow Moving') slow++;
      else dead++;
    });
    return [
      { name: 'Fast Moving', value: fast, color: '#10b981' },
      { name: 'Slow Moving', value: slow, color: '#f59e0b' },
      { name: 'Dead Stock', value: dead, color: '#ef4444' },
    ];
  }, [filteredData]);

  // ── Chart 7: Stock Aging Buckets ──
  const stockAgingData = useMemo(() => {
    let b0_30 = 0, b31_60 = 0, b61_90 = 0, b91_180 = 0, b180Plus = 0;
    filteredData.forEach((item) => {
      if (item.aging <= 30) b0_30++;
      else if (item.aging <= 60) b31_60++;
      else if (item.aging <= 90) b61_90++;
      else if (item.aging <= 180) b91_180++;
      else b180Plus++;
    });
    return [
      { bucket: '0-30 Days', count: b0_30, color: '#10b981' },
      { bucket: '31-60 Days', count: b31_60, color: '#0284c7' },
      { bucket: '61-90 Days', count: b61_90, color: '#f59e0b' },
      { bucket: '91-180 Days', count: b91_180, color: '#8b5cf6' },
      { bucket: '180+ Days', count: b180Plus, color: '#ef4444' },
    ];
  }, [filteredData]);

  // ── Chart 8: Top Rejected Materials (Pareto) ──
  const paretoChartData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => b.rejections - a.rejections).slice(0, 5);
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
  }, [filteredData]);

  // ── Chart 9: ABC Analysis ──
  const abcChartData = useMemo(() => {
    let classA = 0, classB = 0, classC = 0;
    filteredData.forEach((item) => {
      const val = (item.available * item.price) / 100000;
      if (item.abc === 'Class A') classA += val;
      else if (item.abc === 'Class B') classB += val;
      else classC += val;
    });
    return [
      { class: 'Class A (High Value)', value: Number(classA.toFixed(2)), color: '#0284c7' },
      { class: 'Class B (Med Value)', value: Number(classB.toFixed(2)), color: '#f59e0b' },
      { class: 'Class C (Low Value)', value: Number(classC.toFixed(2)), color: '#64748b' },
    ];
  }, [filteredData]);

  // ── Chart 10: FSN Analysis Donut ──
  const fsnChartData = useMemo(() => {
    let fastVal = 0, slowVal = 0, deadVal = 0;
    filteredData.forEach((item) => {
      const val = (item.available * item.price) / 100000;
      if (item.fsn === 'Fast Moving') fastVal += val;
      else if (item.fsn === 'Slow Moving') slowVal += val;
      else deadVal += val;
    });
    return [
      { name: 'Fast (F)', value: Number(fastVal.toFixed(2)), color: '#10b981' },
      { name: 'Slow (S)', value: Number(slowVal.toFixed(2)), color: '#f59e0b' },
      { name: 'Non-Moving (N)', value: Number(deadVal.toFixed(2)), color: '#ef4444' },
    ];
  }, [filteredData]);

  // ── Export CSV Handler ──
  const handleExportCSV = () => {
    const headers = ['Material Code,Material Name,Warehouse,Category,Available Qty,Reserved Qty,Min Stock,Max Stock,Stock Status,Aging (Days),Inventory Value (INR)'];
    const rows = filteredData.map(i => [
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
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, tracking: '-0.02em' }}>
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
            onClick={handleExportCSV}
            style={{ background: '#ffffff', color: '#0284c7', border: '1.5px solid #e2e8f0', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Download size={16} /> Export Inventory CSV
          </button>
          <button
            onClick={handleResetFilters}
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Reset Filters
          </button>
        </div>
      </div>

      {/* ── Global Slicers / Filters Bar ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="#0284c7" /> Global Inventory Filters &amp; Slicers
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {/* Search */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Item / SKU</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU or Name..."
                style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none' }}
              />
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Warehouse */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Warehouse</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
            >
              <option value="All">All Warehouses</option>
              <option value="FG-01 Main FG">FG-01 Main FG</option>
              <option value="FG-02 Raw Material Yard">FG-02 Raw Material Yard</option>
              <option value="FG-03 Chemical Store">FG-03 Chemical Store</option>
              <option value="FG-04 Spares">FG-04 Spares &amp; Hardware</option>
            </select>
          </div>

          {/* Material Category */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
            >
              <option value="All">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Chemical & Pigment">Chemical &amp; Pigment</option>
              <option value="Electrical">Electrical</option>
              <option value="Packaging">Packaging</option>
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
            >
              <option value="All">All Suppliers</option>
              <option value="Apex Industrial Supplies">Apex Industrial</option>
              <option value="Gujarat Chemical Corp">Gujarat Chem</option>
              <option value="Tata Steel Ltd">Tata Steel</option>
              <option value="Asian Paints Raw">Asian Paints</option>
              <option value="Bharat Petroleum">Bharat Petroleum</option>
            </select>
          </div>

          {/* Stock Status */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Stock Status</label>
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Below Min Stock">Below Minimum Stock</option>
              <option value="Above Max Stock">Above Maximum Stock</option>
              <option value="Dead Stock">Dead Stock</option>
            </select>
          </div>

          {/* ABC Category */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>ABC Category</label>
            <select
              value={selectedABC}
              onChange={(e) => setSelectedABC(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
            >
              <option value="All">All ABC Classes</option>
              <option value="Class A">Class A (High Value)</option>
              <option value="Class B">Class B (Medium Value)</option>
              <option value="Class C">Class C (Low Value)</option>
            </select>
          </div>

          {/* FSN Category */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>FSN Category</label>
            <select
              value={selectedFSN}
              onChange={(e) => setSelectedFSN(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
            >
              <option value="All">All FSN Movement</option>
              <option value="Fast Moving">Fast Moving (F)</option>
              <option value="Slow Moving">Slow Moving (S)</option>
              <option value="Non-Moving">Non-Moving (N)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 12 Executive KPI Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* 1. Total Inventory Value */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>💰 Inventory Value</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>
            ₹{(kpiData.totalVal / 100000).toFixed(2)} L
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <ArrowUpRight size={13} /> +4.2% vs last month
          </div>
        </div>

        {/* 2. Total SKUs */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>📦 Total SKUs</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: '4px 0' }}>
            {kpiData.skusCount} SKUs
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Active catalog items</div>
        </div>

        {/* 3. Available Stock */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>✅ Available Stock</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>
            {kpiData.totalAvailableQty.toLocaleString()} Pcs
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

        {/* 10. Physical Stock Accuracy % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>✔ Audit Accuracy %</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>
            {kpiData.accuracy}
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>Physical verification</div>
        </div>

        {/* 11. Inventory Turnover Ratio */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🔄 Turnover Ratio</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#7c3aed', margin: '4px 0' }}>
            {kpiData.turnover}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Annualized velocity</div>
        </div>

        {/* 12. Warehouse Utilization % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🚚 WH Utilization</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#0891b2', margin: '4px 0' }}>
            {kpiData.utilization}
          </div>
          <div style={{ fontSize: '11px', color: '#0891b2', fontWeight: '700' }}>Storage capacity used</div>
        </div>

      </div>

      {/* ── 10 Dynamic Recharts Visual Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px', marginBottom: '24px' }}>

        {/* Visual 1: Inventory Value Trend */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#0284c7" /> Inventory Value Trend (INR Lakhs)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`₹ ${value} Lakhs`, 'Valuation']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} name="Actual Inventory Value" />
                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" name="Safety Target Limit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 2: Warehouse-wise Stock Distribution */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#10b981" /> Warehouse-wise Stock Distribution (Lakhs)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseDistData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="warehouse" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`₹ ${value} Lakhs`, 'Stock Value']} />
                <Bar dataKey="valueLakhs" fill="#10b981" radius={[6, 6, 0, 0]} name="Valuation (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 3: Inventory by Category */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} color="#8b5cf6" /> Inventory Value by Material Category
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹ ${val} Lakhs`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 4: Daily Material Inward vs Outward */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#06b6d4" /> Daily Inward vs Outward Quantity (Pcs)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyMovementData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="inward" stroke="#10b981" strokeWidth={3} name="Inward (GRN Received)" />
                <Line type="monotone" dataKey="outward" stroke="#ef4444" strokeWidth={3} name="Outward (Issued to Prod)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 5: Minimum Stock vs Current Stock */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f59e0b" /> Minimum vs Current Stock (Critical SKUs)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={minVsCurrentData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Current" fill="#0284c7" name="Current Stock" />
                <Bar dataKey="Minimum" fill="#ef4444" name="Min Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 6: Fast, Slow & Dead Stock Distribution */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#eab308" /> Fast, Slow &amp; Dead Stock Distribution
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fsnDonutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} label={({ name, value }) => `${name}: ${value}`}>
                  {fsnDonutData.map((entry, index) => (
                    <Cell key={`cell-fsn-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 7: Stock Aging Buckets */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#6366f1" /> Inventory Aging Buckets (SKU Counts)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockAgingData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="SKU Count" radius={[6, 6, 0, 0]}>
                  {stockAgingData.map((entry, index) => (
                    <Cell key={`cell-aging-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 8: Top Rejected Materials (Pareto) */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={18} color="#dc2626" /> Top Rejected Materials (Pareto Analysis)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="rejections" fill="#dc2626" name="Rejection Qty" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke="#f59e0b" strokeWidth={2.5} name="Cumulative %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 9: ABC Analysis */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#0284c7" /> ABC Valuation Analysis (INR Lakhs)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abcChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹ ${v} Lakhs`} />
                <Bar dataKey="value" name="Valuation (₹)" radius={[6, 6, 0, 0]}>
                  {abcChartData.map((entry, index) => (
                    <Cell key={`cell-abc-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 10: FSN Analysis Donut */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#10b981" /> FSN Inventory Movement Analysis (Lakhs)
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fsnChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ name, value }) => `${name}: ₹${value}L`}>
                  {fsnChartData.map((entry, index) => (
                    <Cell key={`cell-fsn2-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹ ${v} Lakhs`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── Bottom Detail Table ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Material Details / Complete Inventory Table
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Showing {filteredData.length} filtered inventory records across warehouses
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
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => {
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
                        {row.available.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                        {row.reserved.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                        {row.min.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                        {row.max.toLocaleString()}
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
                        ₹{rowVal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                    No inventory items match the selected global filters. Click "Reset Filters" to restore view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
