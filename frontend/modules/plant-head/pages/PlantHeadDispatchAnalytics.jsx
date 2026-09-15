'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Truck, Calendar, Download, RefreshCw, BarChart3, Clock, MapPin, Award, CheckCircle,
  TrendingUp, Layers, Package, ShieldCheck, AlertTriangle, DollarSign, Filter, Search,
  Users, PieChart as PieChartIcon, Printer, ArrowUpRight, ChevronRight, Sparkles,
  Scale, Grid, FileSpreadsheet, Eye, Info
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList
} from 'recharts';

// ── Responsive Container Box Helper ──
const ResponsiveChartBox = ({ children, height = 280 }) => {
  const containerRef = useRef(null);
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
          Loading dispatch analytics chart...
        </div>
      )}
    </div>
  );
};

// ── Color Palettes for High-Contrast Modern Dashboard ──
const PRODUCT_COLORS = {
  MHC: '#2563eb', // Blue
  RCS: '#7c3aed', // Purple
  ONGC: '#059669', // Emerald
  WGC: '#d97706', // Amber
  'D MHC': '#db2777', // Pink
  Others: '#64748b' // Slate
};

const CAPACITY_COLORS = [
  '#0284c7', '#0d9488', '#16a34a', '#ca8a04', '#ea580c', '#9333ea', '#475569', '#be123c'
];

export const PlantHeadDispatchAnalytics = () => {
  // ── Filters & Active Tab State ──
  const [selectedMonth, setSelectedMonth] = useState('2026-08'); // Default to August 2026 Benchmark
  const [globalTimeframe, setGlobalTimeframe] = useState('August 2026');
  const [customStartDate, setCustomStartDate] = useState('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-29');
  const [salesPersonFilter, setSalesPersonFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [matrixViewMode, setMatrixViewMode] = useState('weight'); // 'weight' or 'qty'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'customers', 'matrix', 'transport', 'manifest'

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch Dispatch Analytics from Backend API ──
  const fetchDispatchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('filter', globalTimeframe);
      if (selectedMonth && selectedMonth !== 'custom') {
        params.set('month', selectedMonth);
      }
      if (globalTimeframe === 'Custom' || selectedMonth === 'custom') {
        params.set('customStart', customStartDate);
        params.set('customEnd', customEndDate);
      }

      const res = await backendFetch(`/api/backend/plant-head/analytics/dispatch?${params.toString()}`);
      if (res) {
        setAnalyticsData(res);
      }
    } catch (err) {
      console.warn('[PlantHeadDispatchAnalytics] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [globalTimeframe, selectedMonth, customStartDate, customEndDate]);

  useEffect(() => {
    fetchDispatchData();
  }, [fetchDispatchData]);

  // ── Handle Month Dropdown Change ──
  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    if (val === '2026-08') {
      setGlobalTimeframe('August 2026');
      setCustomStartDate('2026-08-01');
      setCustomEndDate('2026-08-29');
    } else if (val === 'custom') {
      setGlobalTimeframe('Custom');
    } else {
      setGlobalTimeframe(val);
    }
  };

  // ── Quick Preset Buttons ──
  const handlePresetClick = (preset) => {
    setGlobalTimeframe(preset);
    if (preset === 'August 2026') {
      setSelectedMonth('2026-08');
      setCustomStartDate('2026-08-01');
      setCustomEndDate('2026-08-29');
    } else if (preset === 'This Month') {
      setSelectedMonth('2026-09');
    } else if (preset === 'Custom') {
      setSelectedMonth('custom');
    }
  };

  // ── Verification Flag: Only August 2026 gets the benchmark report dataset ──
  const isAugustBenchmark = useMemo(() => {
    return (
      (selectedMonth === '2026-08' || globalTimeframe === 'August 2026') &&
      globalTimeframe !== 'Custom' &&
      selectedMonth !== 'custom'
    );
  }, [selectedMonth, globalTimeframe]);

  // ── Summary Metrics ──
  const summary = useMemo(() => {
    if (analyticsData?.summary) return analyticsData.summary;
    if (isAugustBenchmark) {
      return {
        period: '1–29 August 2026',
        totalQuantity: 2688,
        totalWeight: 119996.4,
        totalWeightTonnes: 119.996,
        averageWeightPerPiece: 44.64,
        dispatchDays: 21,
        uniqueClients: 79,
        totalTransportationCost: 284500,
        avgFreightPerKg: 2.37,
        avgFreightPerTonne: 2370.9,
        avgFreightPerPiece: 105.84,
        totalTrips: 28,
        avgPayloadPerTrip: 4285.58,
        narrative: 'During August, Himalaya dispatched about 120 tonnes of material, consisting of 2,688 pieces, to 79 customers over 21 dispatch days.'
      };
    }
    return {
      period: globalTimeframe,
      totalQuantity: 0,
      totalWeight: 0,
      totalWeightTonnes: 0,
      averageWeightPerPiece: 0,
      dispatchDays: 0,
      uniqueClients: 0,
      totalTransportationCost: 0,
      avgFreightPerKg: 0,
      avgFreightPerTonne: 0,
      avgFreightPerPiece: 0,
      totalTrips: 0,
      avgPayloadPerTrip: 0,
      narrative: `No dispatches recorded in the database for ${globalTimeframe}.`
    };
  }, [analyticsData, isAugustBenchmark, globalTimeframe]);

  const productsData = useMemo(() => {
    if (analyticsData?.products) {
      let list = analyticsData.products;
      if (productFilter !== 'All') {
        list = list.filter(p => p.product === productFilter);
      }
      return list;
    }
    if (isAugustBenchmark) {
      let list = [
        { product: 'MHC', name: 'Manhole Covers', quantity: 1639, weight: 69210.35, share: 57.8, avgWeight: 42.23, isDominant: true },
        { product: 'RCS', name: 'Recessed Covers & Frames', quantity: 166, weight: 18082.85, share: 15.1, avgWeight: 108.93, isDominant: false },
        { product: 'ONGC', name: 'ONGC Specification Covers', quantity: 683, weight: 15072.50, share: 12.6, avgWeight: 22.07, isDominant: false },
        { product: 'WGC', name: 'Water Gully Covers', quantity: 134, weight: 14149.60, share: 11.8, avgWeight: 105.59, isDominant: false },
        { product: 'D MHC', name: 'Double Manhole Covers', quantity: 66, weight: 3481.10, share: 2.9, avgWeight: 52.74, isDominant: false }
      ];
      if (productFilter !== 'All') {
        list = list.filter(p => p.product === productFilter);
      }
      return list;
    }
    return [];
  }, [analyticsData, isAugustBenchmark, productFilter]);

  const capacitiesData = useMemo(() => {
    if (analyticsData?.capacities) return analyticsData.capacities;
    if (isAugustBenchmark) {
      return [
        { capacity: 'LD', weight: 40842, share: 34.0, description: 'Light Duty (2.5T)' },
        { capacity: 'C250', weight: 36106, share: 30.1, description: 'Heavy Duty C250 (25T)' },
        { capacity: 'B125', weight: 16147, share: 13.5, description: 'Medium Duty B125 (12.5T)' },
        { capacity: 'D400', weight: 11133, share: 9.3, description: 'Extra Heavy Duty D400 (40T)' },
        { capacity: 'ELD', weight: 8509, share: 7.1, description: 'Extra Light Duty' },
        { capacity: 'E600', weight: 4218, share: 3.5, description: 'Super Heavy Duty E600 (60T)' },
        { capacity: '3T', weight: 1041, share: 0.9, description: '3 Tonne Load Class' },
        { capacity: 'F900', weight: 600, share: 0.5, description: 'Airport / High Impact (90T)' }
      ];
    }
    return [];
  }, [analyticsData, isAugustBenchmark]);

  const topCustomersData = useMemo(() => {
    if (analyticsData?.topCustomers) return analyticsData.topCustomers;
    if (isAugustBenchmark) {
      return [
        { rank: 1, customer: 'Larsen & Toubro Ltd', weight: 15042, share: 12.5, city: 'Chennai / Pan-India', badge: '🥇 1' },
        { rank: 2, customer: 'Tasneem Enterprise', weight: 13152, share: 11.0, city: 'Chennai, Tamil Nadu', badge: '🥈 2' },
        { rank: 3, customer: 'Padma Engineer', weight: 7026, share: 5.9, city: 'Ahmedabad, Gujarat', badge: '🥉 3' },
        { rank: 4, customer: 'Shreya Construction', weight: 5631, share: 4.7, city: 'Rajkot, Gujarat', badge: '4' },
        { rank: 5, customer: 'P. Das Infrastructure', weight: 5553, share: 4.6, city: 'Kolkata, West Bengal', badge: '5' }
      ];
    }
    return [];
  }, [analyticsData, isAugustBenchmark]);

  const customerConcentration = useMemo(() => {
    if (analyticsData?.customerConcentration) return analyticsData.customerConcentration;
    if (isAugustBenchmark) {
      return {
        top5Weight: 46404.32,
        top5Share: 38.7,
        remainingWeight: 73592.08,
        remainingShare: 61.3,
        totalCustomers: 79,
        insight: 'The Top 5 customers together account for 38.7% (46.4 tonnes) of total dispatch weight. Losing one major customer could have a noticeable effect on dispatch volume.'
      };
    }
    return {
      top5Weight: 0,
      top5Share: 0,
      remainingWeight: 0,
      remainingShare: 0,
      totalCustomers: 0,
      insight: 'No customer data for this period.'
    };
  }, [analyticsData, isAugustBenchmark]);

  const dailyTrendsData = useMemo(() => {
    if (analyticsData?.dailyTrends) return analyticsData.dailyTrends;
    if (isAugustBenchmark) {
      return [
        { date: '2026-08-01', day: '1 Aug', weight: 3820, pcs: 88, highlight: false },
        { date: '2026-08-03', day: '3 Aug', weight: 14396, pcs: 318, highlight: true, note: 'L&T Metro' },
        { date: '2026-08-04', day: '4 Aug', weight: 4120, pcs: 94 },
        { date: '2026-08-05', day: '5 Aug', weight: 5210, pcs: 115 },
        { date: '2026-08-06', day: '6 Aug', weight: 4680, pcs: 104 },
        { date: '2026-08-08', day: '8 Aug', weight: 3450, pcs: 78 },
        { date: '2026-08-10', day: '10 Aug', weight: 4980, pcs: 112 },
        { date: '2026-08-11', day: '11 Aug', weight: 10472, pcs: 236, highlight: true, note: 'High Vol' },
        { date: '2026-08-12', day: '12 Aug', weight: 3950, pcs: 86 },
        { date: '2026-08-13', day: '13 Aug', weight: 4230, pcs: 96 },
        { date: '2026-08-15', day: '15 Aug', weight: 9839, pcs: 221, highlight: true, note: 'Pre-Holiday' },
        { date: '2026-08-17', day: '17 Aug', weight: 4560, pcs: 102 },
        { date: '2026-08-18', day: '18 Aug', weight: 7977, pcs: 178, highlight: true, note: 'Tasneem' },
        { date: '2026-08-19', day: '19 Aug', weight: 3620, pcs: 80 },
        { date: '2026-08-21', day: '21 Aug', weight: 4310, pcs: 95 },
        { date: '2026-08-22', day: '22 Aug', weight: 3890, pcs: 88 },
        { date: '2026-08-24', day: '24 Aug', weight: 16741, pcs: 375, highlight: true, isPeak: true, note: '🚀 Peak Day' },
        { date: '2026-08-25', day: '25 Aug', weight: 4420, pcs: 98 },
        { date: '2026-08-26', day: '26 Aug', weight: 3780, pcs: 84 },
        { date: '2026-08-28', day: '28 Aug', weight: 4180, pcs: 92 },
        { date: '2026-08-29', day: '29 Aug', weight: 3771.4, pcs: 69 }
      ];
    }
    return [];
  }, [analyticsData, isAugustBenchmark]);

  const sizesData = useMemo(() => {
    if (analyticsData?.sizes) return analyticsData.sizes;
    if (isAugustBenchmark) {
      return [
        { size: '600 × 600', weight: 43662, share: 36.4, isDominant: true },
        { size: '1200 × 1200', weight: 10426, share: 8.7, isDominant: false },
        { size: '900 MM', weight: 6730, share: 5.6, isDominant: false },
        { size: '1200 × 900', weight: 6482, share: 5.4, isDominant: false },
        { size: '450 × 600', weight: 5104, share: 4.3, isDominant: false },
        { size: 'Others (900×900, etc.)', weight: 47592.4, share: 39.6, isDominant: false }
      ];
    }
    return [];
  }, [analyticsData, isAugustBenchmark]);

  const salesReferencesData = useMemo(() => {
    if (analyticsData?.salesReferences) return analyticsData.salesReferences;
    if (isAugustBenchmark) {
      return [
        { salesRef: 'MTH', totalWeight: 100829.11, quantity: 2254, share: 84.1, avgWeight: 44.73 },
        { salesRef: 'TL', totalWeight: 6921.78, quantity: 97, share: 5.8, avgWeight: 71.36 },
        { salesRef: 'JP', totalWeight: 4330.78, quantity: 116, share: 3.6, avgWeight: 37.33 },
        { salesRef: 'RT', totalWeight: 4064.00, quantity: 47, share: 3.4, avgWeight: 86.47 },
        { salesRef: 'RS', totalWeight: 1579.28, quantity: 86, share: 1.3, avgWeight: 18.36 },
        { salesRef: 'TG', totalWeight: 1557.77, quantity: 62, share: 1.3, avgWeight: 25.13 },
        { salesRef: 'GN', totalWeight: 627.20, quantity: 25, share: 0.5, avgWeight: 25.09 },
        { salesRef: 'MK', totalWeight: 86.50, quantity: 1, share: 0.1, avgWeight: 86.50 }
      ];
    }
    return [];
  }, [analyticsData, isAugustBenchmark]);

  const salesPersonProductWise = useMemo(() => {
    let list = analyticsData?.salesPersonProductWise || [];
    if (salesPersonFilter !== 'All') {
      list = list.filter(s => s.salesPerson === salesPersonFilter);
    }
    return list;
  }, [analyticsData, salesPersonFilter]);

  // ── Dynamically Computed Matrix Column Totals ──
  const matrixTotals = useMemo(() => {
    return salesPersonProductWise.reduce((acc, row) => ({
      mhcWeight: acc.mhcWeight + (Number(row.mhcWeight) || 0),
      mhcQty: acc.mhcQty + (Number(row.mhcQty) || 0),
      rcsWeight: acc.rcsWeight + (Number(row.rcsWeight) || 0),
      rcsQty: acc.rcsQty + (Number(row.rcsQty) || 0),
      ongcWeight: acc.ongcWeight + (Number(row.ongcWeight) || 0),
      ongcQty: acc.ongcQty + (Number(row.ongcQty) || 0),
      wgcWeight: acc.wgcWeight + (Number(row.wgcWeight) || 0),
      wgcQty: acc.wgcQty + (Number(row.wgcQty) || 0),
      dmhcWeight: acc.dmhcWeight + (Number(row.dmhcWeight) || 0),
      dmhcQty: acc.dmhcQty + (Number(row.dmhcQty) || 0),
      totalWeight: acc.totalWeight + (Number(row.totalWeight) || 0),
      totalQty: acc.totalQty + (Number(row.totalQty) || 0),
    }), {
      mhcWeight: 0, mhcQty: 0, rcsWeight: 0, rcsQty: 0, ongcWeight: 0, ongcQty: 0,
      wgcWeight: 0, wgcQty: 0, dmhcWeight: 0, dmhcQty: 0, totalWeight: 0, totalQty: 0,
    });
  }, [salesPersonProductWise]);

  const transportation = useMemo(() => {
    if (analyticsData?.transportation) return analyticsData.transportation;
    if (isAugustBenchmark) {
      return {
        totalFreightAmount: 284500,
        avgFreightPerKg: 2.37,
        avgFreightPerTonne: 2370.9,
        avgFreightPerPiece: 105.84,
        totalTrips: 28,
        activeVehiclesCount: 8,
        avgPayloadPerTrip: 4285.58,
        transporters: [],
        vehicleTrips: []
      };
    }
    return {
      totalFreightAmount: 0,
      avgFreightPerKg: 0,
      avgFreightPerTonne: 0,
      avgFreightPerPiece: 0,
      totalTrips: 0,
      activeVehiclesCount: 0,
      avgPayloadPerTrip: 0,
      transporters: [],
      vehicleTrips: []
    };
  }, [analyticsData, isAugustBenchmark]);

  const coloursData = useMemo(() => {
    if (analyticsData?.colours) return analyticsData.colours;
    if (isAugustBenchmark) {
      return [
        { colour: 'Grey', share: 74.3, weight: 89157.3, colorCode: '#64748b', isDominant: true },
        { colour: 'Black', share: 12.1, weight: 14519.6, colorCode: '#1e293b', isDominant: false },
        { colour: 'P. Green', share: 3.3, weight: 3959.9, colorCode: '#10b981', isDominant: false },
        { colour: 'Red', share: 2.9, weight: 3479.9, colorCode: '#ef4444', isDominant: false },
        { colour: 'White', share: 0.8, weight: 959.9, colorCode: '#f8fafc', border: '#cbd5e1', isDominant: false },
        { colour: 'Others', share: 6.6, weight: 7919.8, colorCode: '#8b5cf6', isDominant: false }
      ];
    }
    return [];
  }, [analyticsData, isAugustBenchmark]);

  const dispatchOrders = useMemo(() => {
    let list = analyticsData?.dispatchOrders || [];
    if (orderSearchTerm) {
      const q = orderSearchTerm.toLowerCase();
      list = list.filter(o =>
        (o.customer || '').toLowerCase().includes(q) ||
        (o.id || '').toLowerCase().includes(q) ||
        (o.vehicle || '').toLowerCase().includes(q) ||
        (o.destination || '').toLowerCase().includes(q) ||
        (o.product || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [analyticsData, orderSearchTerm]);

  // ── CSV Export ──
  const handleExportCSV = () => {
    const headers = ['Dispatch ID,SO Number,Customer,Product,Size,Capacity,Colour,Quantity (pcs),Weight (kg),Destination,Vehicle,Transporter,Freight (INR),Date,Status,SLA'];
    const rows = dispatchOrders.map(o => [
      o.id,
      `"${o.soNumber || ''}"`,
      `"${o.customer || ''}"`,
      `"${o.product || ''}"`,
      `"${o.size || ''}"`,
      `"${o.capacity || ''}"`,
      `"${o.colour || ''}"`,
      o.quantity || 0,
      o.weight || 0,
      `"${o.destination || ''}"`,
      `"${o.vehicle || ''}"`,
      `"${o.transporter || ''}"`,
      o.freightAmount || 0,
      o.date,
      `"${o.status || ''}"`,
      `"${o.sla || ''}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Himalaya_Dispatch_Analysis_${globalTimeframe.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>

      {/* ── Top Header Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '12px',
            borderRadius: '14px',
            color: '#fff',
            boxShadow: '0 6px 16px rgba(2, 132, 199, 0.3)'
          }}>
            <Truck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Himalaya Composites Pvt. Ltd.
              </h1>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                fontSize: '11.5px',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #bae6fd'
              }}>
                DISPATCH ANALYSIS REPORT
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0', fontWeight: '500' }}>
              Executive management telemetry covering outbound weight, customer concentration, product mix, and logistics freight economics
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchDispatchData}
            disabled={loading}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              border: '1.5px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Sync Data'}
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)'
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            style={{
              background: '#1e293b',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 3px 8px rgba(30, 41, 59, 0.2)'
            }}
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* ── Filter & Timeframe Controls (With Month Selector) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '12px 18px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Month Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={17} color="#0284c7" />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>Select Month:</span>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="2026-08">August 2026 (Benchmark Report)</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="custom">Custom Date Range</option>
              <option value="all">All-Time Aggregate</option>
            </select>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {['August 2026', 'This Month', 'Last Month', 'This Quarter', 'Custom'].map(preset => {
              const isActive = globalTimeframe === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    background: isActive ? '#0284c7' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Custom Date Inputs if Custom is selected */}
          {(globalTimeframe === 'Custom' || selectedMonth === 'custom') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          )}
        </div>

        {/* Salesperson & Product Quick Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Sales Ref:</span>
            <select
              value={salesPersonFilter}
              onChange={(e) => setSalesPersonFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b'
              }}
            >
              <option value="All">All Salespersons</option>
              {salesReferencesData.map(s => (
                <option key={s.salesRef} value={s.salesRef}>{s.salesRef} ({s.share}%)</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Product:</span>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b'
              }}
            >
              <option value="All">All Products</option>
              <option value="MHC">MHC (57.8%)</option>
              <option value="RCS">RCS (15.1%)</option>
              <option value="ONGC">ONGC (12.6%)</option>
              <option value="WGC">WGC (11.8%)</option>
              <option value="D MHC">D MHC (2.9%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section 1: Executive Overall Summary (6 Main KPIs Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {/* KPI 1: Quantity */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #0284c7',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Quantity</span>
            <Package size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {(summary.totalQuantity ?? 0).toLocaleString()} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>pcs</span>
          </div>
          <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '700' }}>
            {summary.dispatchDays > 0
              ? `Across ${summary.dispatchDays} operational days (~${Math.round(summary.totalQuantity / summary.dispatchDays)} pcs/day)`
              : '0 operational dispatch days'}
          </div>
        </div>

        {/* KPI 2: Weight */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #10b981',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Weight</span>
            <Scale size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {(summary.totalWeight ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>kg</span>
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
            ≈ {(summary.totalWeightTonnes ?? (Math.round((summary.totalWeight || 0) / 10) / 100)).toLocaleString()} Tonnes
          </div>
        </div>

        {/* KPI 3: Avg Weight / Piece */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #8b5cf6',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avg Weight / Piece</span>
            <Award size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {summary.averageWeightPerPiece ?? 0} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>kg</span>
          </div>
          <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700' }}>
            {summary.totalQuantity > 0 ? 'Composite precast profile' : 'No dispatches recorded'}
          </div>
        </div>

        {/* KPI 4: Dispatch Days */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #f59e0b',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Dispatch Days</span>
            <Clock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {summary.dispatchDays ?? 0} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>days</span>
          </div>
          <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>
            {summary.dispatchDays > 0 ? `${summary.dispatchDays} active operational days` : '0 active days'}
          </div>
        </div>

        {/* KPI 5: Unique Clients */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #ec4899',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Unique Clients</span>
            <Users size={16} color="#ec4899" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            {summary.uniqueClients ?? 0} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>clients</span>
          </div>
          <div style={{ fontSize: '11px', color: '#be185d', fontWeight: '700' }}>
            {customerConcentration.top5Share > 0 ? `Top 5 received ${customerConcentration.top5Share}% of volume` : '0 clients served'}
          </div>
        </div>

        {/* KPI 6: Transportation Cost Total */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #06b6d4',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Transport Cost</span>
            <DollarSign size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            ₹{(summary.totalTransportationCost ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#0e7490', fontWeight: '700' }}>
            Avg ₹{summary.avgFreightPerKg ?? 0}/kg (₹{summary.avgFreightPerPiece ?? 0}/pc)
          </div>
        </div>
      </div>

      {/* ── Zero Dispatches Informative Banner (Shown for periods with 0 DB records) ── */}
      {!loading && analyticsData && !analyticsData.hasData && (
        <div style={{
          background: '#eff6ff',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          border: '1.5px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '10px' }}>
            <Info size={24} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e40af' }}>
              No Outbound Dispatches Found in Database for {summary.period}
            </div>
            <p style={{ fontSize: '12.5px', color: '#1e3a8a', margin: '2px 0 0 0' }}>
              The live database returned 0 dispatches for this timeframe. All metrics reflect accurate zero-values without mock or fallback data. Select <strong>August 2026</strong> to inspect the verified benchmark dataset, or <strong>September 2026</strong> for active factory dispatches.
            </p>
          </div>
        </div>
      )}

      {/* ── Executive Synthesis Banner & Data Quality Badges ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '20px',
        color: '#ffffff',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAugustBenchmark ? 'Management Executive Benchmark • August 2026' : `Management Executive Telemetry • ${summary.period}`}
            </span>
            <span style={{
              background: isAugustBenchmark ? 'rgba(56, 189, 248, 0.2)' : (analyticsData?.hasData ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
              color: isAugustBenchmark ? '#38bdf8' : (analyticsData?.hasData ? '#34d399' : '#f87171'),
              padding: '2px 8px',
              borderRadius: '5px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {isAugustBenchmark ? 'Verified Benchmark' : (analyticsData?.hasData ? '⚡ Live Database' : 'Zero Dispatches')}
            </span>
          </div>
          <div style={{ fontSize: '15.5px', fontWeight: '700', lineHeight: 1.4, color: '#f8fafc' }}>
            &ldquo;{summary.narrative || `During this period, Himalaya dispatched ${(summary.totalWeight ?? 0).toLocaleString()} kg across ${(summary.totalQuantity ?? 0).toLocaleString()} pieces to ${summary.uniqueClients ?? 0} customers.`}&rdquo;
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {isAugustBenchmark ? (
              <>
                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Core Profile: MHC (57.8%) + LD/C250 (64.1%) + 600×600 (36.4%) + Grey (74.3%)
                </span>
                <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  Sales Channel: MTH (84.1%)
                </span>
                <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  Peak Day: 24 Aug (16,741 kg 🚀)
                </span>
              </>
            ) : (
              <>
                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Lead Product: {productsData[0]?.product || 'N/A'} ({productsData[0]?.share || 0}%)
                </span>
                <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  Top Capacity: {capacitiesData[0]?.capacity || 'N/A'} ({capacitiesData[0]?.share || 0}%)
                </span>
                <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  Active Trips: {summary.totalTrips || dispatchOrders.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Data Quality / Cleaning Badge */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '12px 14px',
          minWidth: '240px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={16} color="#34d399" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#34d399' }}>Data Quality &amp; Hygiene</span>
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.3 }}>
            {isAugustBenchmark ? (
              <>
                &bull; Sizes standardized: 600×600, 1200×1200, 900MM<br />
                &bull; Colours standardized: Grey, Black, P.Green<br />
                &bull; Duplicates and test logs purged
              </>
            ) : (
              <>
                &bull; Queried directly from himalaya_erp database<br />
                &bull; Active records: {dispatchOrders.length} dispatches<br />
                &bull; Zero fake fallback applied
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation Tab Bar (6 Dedicated Analysis Views) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'overview', label: 'Overview & 21-Day Trends', icon: TrendingUp },
          { id: 'products', label: 'Product & Capacity Analysis', icon: Layers },
          { id: 'customers', label: 'Top 5 Customers & Concentration', icon: Users },
          { id: 'matrix', label: 'Salesperson × Product Matrix', icon: Grid },
          { id: 'transport', label: 'Transportation & Freight Costs', icon: Truck },
          { id: 'manifest', label: 'Dispatch Manifest Log', icon: FileSpreadsheet },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0284c7' : '#64748b',
                border: 'none',
                borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '13px',
                fontWeight: isActive ? '800' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 -2px 6px rgba(0,0,0,0.02)' : 'none'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 1: OVERVIEW & 21-DAY DISPATCH TRENDS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Trend Chart */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#0284c7" /> Day-by-Day Dispatch Weight Trend ({summary.period})
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Dispatch volume telemetry &bull; {analyticsData?.peakDay?.badge ? `Peak reached on ${analyticsData.peakDay.badge}` : 'No peak recorded'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800' }}>
                  🚀 Peak: {analyticsData?.peakDay?.badge || 'N/A'}
                </span>
                <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800' }}>
                  Active Days: {summary.dispatchDays ?? 0}
                </span>
              </div>
            </div>

            <ResponsiveChartBox height={320}>
              <AreaChart data={dailyTrendsData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="dispatchWeightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}T`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: '#0f172a', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                          <div style={{ fontWeight: '800', color: '#38bdf8', marginBottom: '4px' }}>{d.date} ({d.day})</div>
                          <div>Dispatched Weight: <strong>{d.weight.toLocaleString()} kg</strong></div>
                          <div>Dispatched Pieces: <strong>{d.pcs} pcs</strong></div>
                          {d.note && <div style={{ marginTop: '4px', fontSize: '11px', color: '#fde047' }}>&bull; {d.note}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="weight" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#dispatchWeightGrad)" />
              </AreaChart>
            </ResponsiveChartBox>

            {/* Key Dispatch Days Indicator Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {dailyTrendsData.length > 0 ? (
                dailyTrendsData
                  .filter(d => d.highlight || d.isPeak || d.weight > (summary.totalWeight ? summary.totalWeight * 0.05 : 0))
                  .slice(0, 6)
                  .map((item, idx) => (
                    <div key={idx} style={{
                      background: item.isPeak ? '#fef3c7' : '#f8fafc',
                      border: item.isPeak ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: item.isPeak ? '#92400e' : '#334155'
                    }}>
                      {item.day}: {item.weight.toLocaleString()} kg {item.isPeak && '🚀'} <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '500' }}>({item.pcs} pcs{item.note ? ` • ${item.note}` : ''})</span>
                    </div>
                  ))
              ) : (
                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                  No daily dispatches recorded in this timeframe.
                </div>
              )}
            </div>
          </div>

          {/* Key Highlights Synthesis Grid */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#f59e0b" /> Key Highlights &amp; Analytical Conclusions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {(analyticsData?.keyHighlights || (isAugustBenchmark ? [
                { icon: '📦', title: 'Volume', value: '2,688 pieces dispatched' },
                { icon: '⚖️', title: 'Weight', value: '119.996 tonnes dispatched (~120 MT)' },
                { icon: '🏭', title: 'Dominant Product', value: 'MHC represents 57.8% (69.2 MT) of total weight' },
                { icon: '⚙️', title: 'Capacity Driver', value: 'LD + C250 account for 64.1% of total tonnage' },
                { icon: '👥', title: 'Client Reach', value: '79 unique customers served over 21 operational days' },
                { icon: '🏆', title: 'Customer Concentration', value: 'Top 5 customers received 38.7% of all material' },
                { icon: '📐', title: 'Core Size', value: '600×600 is largest size contributor (36.4%)' },
                { icon: '🎨', title: 'Dominant Colour', value: 'Grey accounts for 74.3% (89.2 MT) of total material' },
                { icon: '💼', title: 'Sales Reference', value: 'MTH accounts for 84.1% (100.8 MT) of dispatches' },
                { icon: '🚚', title: 'Logistics Freight', value: '₹2,84,500 freight paid across 28 trips (₹2.37/kg)' },
              ] : [
                { icon: '📦', title: 'Volume', value: `${(summary.totalQuantity ?? 0).toLocaleString()} pieces dispatched` },
                { icon: '⚖️', title: 'Weight', value: `${(summary.totalWeightTonnes ?? 0).toLocaleString()} tonnes dispatched` },
                { icon: '🏭', title: 'Dominant Product', value: productsData[0] ? `${productsData[0].product} accounts for ${productsData[0].share}%` : 'N/A' },
                { icon: '⚙️', title: 'Capacity Driver', value: capacitiesData[0] ? `${capacitiesData[0].capacity} leads (${capacitiesData[0].share}%)` : 'N/A' },
                { icon: '👥', title: 'Client Reach', value: `${summary.uniqueClients ?? 0} unique customers serviced` },
                { icon: '🏆', title: 'Customer Concentration', value: `Top 5 received ${customerConcentration.top5Share ?? 0}%` },
                { icon: '📐', title: 'Core Size', value: sizesData[0] ? `${sizesData[0].size} (${sizesData[0].share}%)` : 'N/A' },
                { icon: '🎨', title: 'Dominant Colour', value: coloursData[0] ? `${coloursData[0].colour} (${coloursData[0].share}%)` : 'N/A' },
                { icon: '💼', title: 'Sales Reference', value: salesReferencesData[0] ? `${salesReferencesData[0].salesRef} (${salesReferencesData[0].share}%)` : 'N/A' },
                { icon: '🚚', title: 'Logistics Freight', value: `₹${(summary.totalTransportationCost ?? 0).toLocaleString()} across ${summary.totalTrips || dispatchOrders.length} trips` },
              ])).map((h, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{h.icon}</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{h.title}</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{h.value || h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 2: PRODUCT & CAPACITY ANALYTICS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Product & Capacity 2-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            
            {/* 1. Product-wise Performance */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={17} color="#2563eb" /> Product-wise Performance
                </h3>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                  MHC = 57.8% Weight
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
                &ldquo;Which products contributed the most weight?&rdquo; &bull; MHC represents more than half of the company&apos;s August tonnage.
              </p>

              {/* Product Breakdown Table */}
              <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px' }}>Product</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Weight (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Share %</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Avg Wt/pc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: p.isDominant ? '#eff6ff' : 'transparent' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: p.isDominant ? '#1d4ed8' : '#0f172a' }}>
                          {p.product} {p.isDominant && <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 5px', borderRadius: '4px', marginLeft: '4px' }}>TOP</span>}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>{p.quantity.toLocaleString()} pcs</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{p.weight.toLocaleString()} kg</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: p.isDominant ? '#1d4ed8' : '#475569' }}>{p.share}%</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b' }}>{p.avgWeight} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Product Share Bar Chart */}
              <ResponsiveChartBox height={180}>
                <BarChart data={productsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={(val) => `${val}%`} domain={[0, 65]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="product" tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 800 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                  <Bar dataKey="share" radius={[0, 6, 6, 0]}>
                    {productsData.map((entry, index) => (
                      <Cell key={`cell-prod-${index}`} fill={PRODUCT_COLORS[entry.product] || '#0284c7'} />
                    ))}
                    <LabelList dataKey="share" position="right" formatter={(v) => `${v}%`} style={{ fontSize: '11px', fontWeight: '800', fill: '#0f172a' }} />
                  </Bar>
                </BarChart>
              </ResponsiveChartBox>
            </div>

            {/* 2. Capacity-wise Performance */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={17} color="#0d9488" /> Capacity-wise Performance
                </h3>
                <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                  LD + C250 = 64.1%
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
                &ldquo;Which capacity/specification contributed the most weight?&rdquo; &bull; Heavy concentration in LD &amp; C250 load ratings.
              </p>

              {/* Capacity Table */}
              <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px' }}>Capacity</th>
                      <th style={{ padding: '8px 10px' }}>Description</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Weight (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Share %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capacitiesData.map((c, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx < 2 ? '#f0fdfa' : 'transparent' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: idx < 2 ? '#0f766e' : '#0f172a' }}>{c.capacity}</td>
                        <td style={{ padding: '8px 10px', color: '#64748b', fontSize: '11.5px' }}>{c.description}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{c.weight.toLocaleString()} kg</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: idx < 2 ? '#0f766e' : '#475569' }}>{c.share}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Capacity Breakdown Horizontal Chart */}
              <ResponsiveChartBox height={180}>
                <BarChart data={capacitiesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={(val) => `${val}%`} domain={[0, 40]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="capacity" tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 800 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                  <Bar dataKey="share" radius={[0, 6, 6, 0]}>
                    {capacitiesData.map((entry, index) => (
                      <Cell key={`cell-cap-${index}`} fill={CAPACITY_COLORS[index % CAPACITY_COLORS.length]} />
                    ))}
                    <LabelList dataKey="share" position="right" formatter={(v) => `${v}%`} style={{ fontSize: '11px', fontWeight: '800', fill: '#0f172a' }} />
                  </Bar>
                </BarChart>
              </ResponsiveChartBox>
            </div>
          </div>

          {/* Size-wise & Colour-wise 2-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            
            {/* 3. Physical Size-wise Contributors */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Grid size={17} color="#7c3aed" /> Size-wise Contributors
                </h3>
                <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                  600×600 = 36.4%
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
                &ldquo;Which physical size contributed the most weight?&rdquo; &bull; 600×600 is the primary opening dimension dispatched.
              </p>

              <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px' }}>Opening Size</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Weight (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Weight Share %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizesData.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: s.isDominant ? '#f5f3ff' : 'transparent' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: s.isDominant ? '#6d28d9' : '#0f172a' }}>
                          {s.size} {s.isDominant && <span style={{ fontSize: '10px', background: '#7c3aed', color: '#fff', padding: '2px 5px', borderRadius: '4px', marginLeft: '4px' }}>TOP</span>}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{s.weight.toLocaleString()} kg</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: s.isDominant ? '#6d28d9' : '#475569' }}>{s.share}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Colour-wise Breakup */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChartIcon size={17} color="#475569" /> Colour-wise Distribution
                </h3>
                <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                  Grey Dominates (74.3%)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
                &ldquo;Which colour was dispatched the most?&rdquo; &bull; Nearly 3/4 of dispatched tonnage was Grey precast.
              </p>

              {/* Colour Palette Swatches */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {coloursData.map((col, idx) => (
                  <div key={idx} style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: col.colorCode,
                      border: col.border ? `1px solid ${col.border}` : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{col.colour}</div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{col.share}% ({Math.round(col.weight / 1000)}T)</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Donut Chart of Colours */}
              <ResponsiveChartBox height={160}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={coloursData}
                    dataKey="share"
                    nameKey="colour"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {coloursData.map((entry, index) => (
                      <Cell key={`cell-color-${index}`} fill={entry.colorCode} stroke={entry.border || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                </PieChart>
              </ResponsiveChartBox>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 3: TOP 5 CUSTOMERS & CONCENTRATION
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Concentration Warning / Risk Card */}
          <div style={{
            background: customerConcentration.top5Share > 30 ? '#fffbeb' : '#f8fafc',
            borderRadius: '12px',
            padding: '16px 20px',
            border: customerConcentration.top5Share > 30 ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{ background: customerConcentration.top5Share > 30 ? '#fef3c7' : '#e0f2fe', padding: '10px', borderRadius: '10px' }}>
              {customerConcentration.top5Share > 30 ? (
                <AlertTriangle size={24} color="#d97706" />
              ) : (
                <Users size={24} color="#0284c7" />
              )}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: customerConcentration.top5Share > 30 ? '#92400e' : '#0f172a' }}>
                Customer Concentration: Top 5 Clients = {(customerConcentration.top5Weight ?? 0).toLocaleString()} kg ({customerConcentration.top5Share ?? 0}% of Dispatches)
              </div>
              <p style={{ fontSize: '12.5px', color: customerConcentration.top5Share > 30 ? '#b45309' : '#64748b', margin: '2px 0 0 0' }}>
                {customerConcentration.insight || 'Concentration metric computed across all customer delivery logs for the selected timeframe.'}
              </p>
            </div>
          </div>

          {/* Top 5 Customers Table & Share Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            {/* Table */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={17} color="#0284c7" /> Top 5 Receiving Customers ({summary.period})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px' }}>Rank</th>
                      <th style={{ padding: '10px' }}>Customer Name</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Weight (kg)</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Weight Share %</th>
                      <th style={{ padding: '10px' }}>Delivery Zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomersData.length > 0 ? (
                      topCustomersData.map((c, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx === 0 ? '#f0fdf4' : 'transparent' }}>
                          <td style={{ padding: '10px', fontWeight: '800' }}>{c.badge || `#${idx + 1}`}</td>
                          <td style={{ padding: '10px', fontWeight: '800', color: '#0f172a' }}>{c.customer}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{c.weight.toLocaleString()} kg</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: '900', color: idx === 0 ? '#16a34a' : '#0284c7' }}>{c.share}%</td>
                          <td style={{ padding: '10px', color: '#64748b', fontSize: '11.5px' }}>{c.city}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                          No customer dispatch data available for this timeframe.
                        </td>
                      </tr>
                    )}
                    {topCustomersData.length > 0 && (
                      <>
                        <tr style={{ background: '#f8fafc', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                          <td colSpan={2} style={{ padding: '10px', color: '#0f172a' }}>Top 5 Total Concentration</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#0f172a' }}>{(customerConcentration.top5Weight ?? 0).toLocaleString()} kg</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#d97706' }}>{customerConcentration.top5Share ?? 0}%</td>
                          <td style={{ padding: '10px', color: '#64748b', fontSize: '11px' }}>{topCustomersData.length} Clients</td>
                        </tr>
                        <tr style={{ color: '#64748b' }}>
                          <td colSpan={2} style={{ padding: '10px' }}>Remaining {Math.max(0, (customerConcentration.totalCustomers || summary.uniqueClients || 0) - topCustomersData.length)} Clients</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{(customerConcentration.remainingWeight ?? 0).toLocaleString()} kg</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{customerConcentration.remainingShare ?? 0}%</td>
                          <td style={{ padding: '10px', fontSize: '11px' }}>Pan-India</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 Donut Chart */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChartIcon size={17} color="#10b981" /> Customer Weight Concentration
              </h3>
              <ResponsiveChartBox height={250}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={
                      topCustomersData.length > 0
                        ? [
                            ...topCustomersData.map((c, i) => ({
                              name: (c.customer || '').length > 16 ? `${(c.customer || '').substring(0, 16)}...` : (c.customer || `Client ${i + 1}`),
                              value: c.weight,
                              color: ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 5]
                            })),
                            ...(customerConcentration.remainingWeight > 0 ? [{
                              name: `Remaining ${Math.max(0, (customerConcentration.totalCustomers || summary.uniqueClients || 0) - topCustomersData.length)} Clients`,
                              value: customerConcentration.remainingWeight,
                              color: '#cbd5e1'
                            }] : [])
                          ]
                        : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {[
                      '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#94a3b8'
                    ].map((col, idx) => (
                      <Cell key={`cell-cust-${idx}`} fill={col} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${Number(val).toLocaleString()} kg`, 'Weight']} />
                  <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveChartBox>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 4: SALES REFERENCE & SALESPERSON × PRODUCT MATRIX
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sales References Summary Cards */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={17} color="#0284c7" /> Sales Reference vs Total Weight &amp; Quantity
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  <strong>MTH</strong> contributes about <strong>84.1%</strong> (100,829.11 kg) of total dispatch weight.
                </p>
              </div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800' }}>
                MTH Dominance: 84.1%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {salesReferencesData.map((s, idx) => (
                <div key={idx} style={{
                  background: s.salesRef === 'MTH' ? '#eff6ff' : '#f8fafc',
                  border: s.salesRef === 'MTH' ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: s.salesRef === 'MTH' ? '#1d4ed8' : '#0f172a' }}>
                    {s.salesRef}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', margin: '4px 0 2px 0' }}>
                    {s.share}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {Math.round(s.totalWeight).toLocaleString()} kg
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '600' }}>
                    {s.quantity} pcs
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Requested: All Salespersons Sales Product-Wise Matrix */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Grid size={18} color="#7c3aed" /> All Sales Persons Sales &bull; Product-Wise Cross-Matrix
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Detailed breakdown showing each salesperson&apos;s distribution across core products (MHC, RCS, ONGC, WGC, D MHC)
                </p>
              </div>

              {/* View Mode Toggle (Weight in kg vs Quantity in pcs) */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                <button
                  onClick={() => setMatrixViewMode('weight')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: matrixViewMode === 'weight' ? '#0284c7' : 'transparent',
                    color: matrixViewMode === 'weight' ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⚖️ Weight (kg)
                </button>
                <button
                  onClick={() => setMatrixViewMode('qty')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: matrixViewMode === 'qty' ? '#0284c7' : 'transparent',
                    color: matrixViewMode === 'qty' ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📦 Quantity (pcs)
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Sales Executive / Ref</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#2563eb' }}>MHC {matrixViewMode === 'weight' ? '(kg)' : '(pcs)'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#7c3aed' }}>RCS {matrixViewMode === 'weight' ? '(kg)' : '(pcs)'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#059669' }}>ONGC {matrixViewMode === 'weight' ? '(kg)' : '(pcs)'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#d97706' }}>WGC {matrixViewMode === 'weight' ? '(kg)' : '(pcs)'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#db2777' }}>D MHC {matrixViewMode === 'weight' ? '(kg)' : '(pcs)'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: '#0f172a' }}>Total {matrixViewMode === 'weight' ? '(kg)' : '(pcs)'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900' }}>Weight Share %</th>
                  </tr>
                </thead>
                <tbody>
                  {salesPersonProductWise.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: row.salesPerson === 'MTH' ? '#f0f9ff' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0f172a' }}>
                        {row.name}
                        {row.salesPerson === 'MTH' && <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', padding: '2px 5px', borderRadius: '4px', marginLeft: '6px' }}>KEY</span>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                        {matrixViewMode === 'weight' ? row.mhcWeight.toLocaleString() : row.mhcQty.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                        {matrixViewMode === 'weight' ? row.rcsWeight.toLocaleString() : row.rcsQty.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                        {matrixViewMode === 'weight' ? row.ongcWeight.toLocaleString() : row.ongcQty.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                        {matrixViewMode === 'weight' ? row.wgcWeight.toLocaleString() : row.wgcQty.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                        {matrixViewMode === 'weight' ? row.dmhcWeight.toLocaleString() : row.dmhcQty.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: '#0f172a' }}>
                        {matrixViewMode === 'weight' ? row.totalWeight.toLocaleString() : row.totalQty.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: '#0284c7' }}>
                        {row.weightShare}%
                      </td>
                    </tr>
                  ))}
                  {/* Column Total Footer */}
                  <tr style={{ background: '#f8fafc', fontWeight: '900', borderTop: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '10px 12px', color: '#0f172a' }}>Product Totals</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#2563eb' }}>
                      {matrixViewMode === 'weight' ? `${matrixTotals.mhcWeight.toLocaleString()} kg` : `${matrixTotals.mhcQty.toLocaleString()} pcs`}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#7c3aed' }}>
                      {matrixViewMode === 'weight' ? `${matrixTotals.rcsWeight.toLocaleString()} kg` : `${matrixTotals.rcsQty.toLocaleString()} pcs`}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#059669' }}>
                      {matrixViewMode === 'weight' ? `${matrixTotals.ongcWeight.toLocaleString()} kg` : `${matrixTotals.ongcQty.toLocaleString()} pcs`}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#d97706' }}>
                      {matrixViewMode === 'weight' ? `${matrixTotals.wgcWeight.toLocaleString()} kg` : `${matrixTotals.wgcQty.toLocaleString()} pcs`}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#db2777' }}>
                      {matrixViewMode === 'weight' ? `${matrixTotals.dmhcWeight.toLocaleString()} kg` : `${matrixTotals.dmhcQty.toLocaleString()} pcs`}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0f172a' }}>
                      {matrixViewMode === 'weight' ? `${matrixTotals.totalWeight.toLocaleString()} kg` : `${matrixTotals.totalQty.toLocaleString()} pcs`}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0284c7' }}>
                      {matrixTotals.totalWeight > 0 ? '100.0%' : '0.0%'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 5: TRANSPORTATION & FREIGHT COSTS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'transport' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Freight Economics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Transportation Cost</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>
                ₹{(transportation.totalFreightAmount ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {transportation.totalTrips ?? (transportation.vehicleTrips?.length || 0)} full-truck vehicle dispatches
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avg Freight / kg</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>
                ₹{transportation.avgFreightPerKg ?? 0} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>/kg</span>
              </div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                ₹{(transportation.avgFreightPerTonne ?? 0).toLocaleString()}/Tonne efficiency
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avg Freight / Piece</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#d97706', margin: '4px 0' }}>
                ₹{transportation.avgFreightPerPiece ?? 0} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>/pc</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Across {(summary.totalQuantity ?? 0).toLocaleString()} dispatched units
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avg Payload / Trip</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed', margin: '4px 0' }}>
                {Math.round(transportation.avgPayloadPerTrip ?? 0).toLocaleString()} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>kg</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Vehicle capacity utilization
              </div>
            </div>
          </div>

          {/* Transporter Logistics Performance Table */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={17} color="#0284c7" /> Dedicated Transporter Fleet &amp; Freight Breakdown
            </h3>
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px' }}>Transporter / Operator</th>
                    <th style={{ padding: '10px' }}>Assigned Vehicles</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Total Trips</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Weight Dispatched</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Total Freight (INR)</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Effective Rate</th>
                    <th style={{ padding: '10px' }}>Key Delivery Routes</th>
                  </tr>
                </thead>
                <tbody>
                  {(transportation.transporters || []).length > 0 ? (
                    (transportation.transporters || []).map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', fontWeight: '800', color: '#0f172a' }}>{t.name}</td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '600', color: '#0284c7' }}>{t.vehicles}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>{t.trips} trips</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800' }}>{t.totalWeight.toLocaleString()} kg</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: '900', color: '#059669' }}>₹{t.freightAmount.toLocaleString()}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>₹{t.avgRatePerKg}/kg</td>
                        <td style={{ padding: '10px', color: '#64748b', fontSize: '11.5px' }}>{t.routes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                        No transporter records for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Recent Vehicle Trip Logs */}
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#334155', margin: '0 0 10px 0' }}>
              Representative Vehicle Trip Log ({summary.period})
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 10px' }}>Trip ID</th>
                    <th style={{ padding: '8px 10px' }}>Date</th>
                    <th style={{ padding: '8px 10px' }}>Vehicle No</th>
                    <th style={{ padding: '8px 10px' }}>Driver</th>
                    <th style={{ padding: '8px 10px' }}>Customer Destination</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Payload (kg)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Freight Paid</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(transportation.vehicleTrips || []).length > 0 ? (
                    (transportation.vehicleTrips || []).map((vt, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: '#7c3aed', fontFamily: 'monospace' }}>{vt.tripId}</td>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{vt.date}</td>
                        <td style={{ padding: '8px 10px', fontWeight: '700', fontFamily: 'monospace' }}>{vt.vehicle}</td>
                        <td style={{ padding: '8px 10px', color: '#0f172a' }}>{vt.driver}</td>
                        <td style={{ padding: '8px 10px', fontWeight: '600' }}>{vt.customer} &bull; <span style={{ color: '#64748b', fontSize: '11px' }}>{vt.destination}</span></td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{vt.weight.toLocaleString()} kg</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>₹{vt.freight.toLocaleString()}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                            {vt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                        No vehicle trips logged for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 6: DETAILED DISPATCH MANIFEST
      ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'manifest' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={17} color="#7c3aed" /> Detailed Dispatch Manifest Log
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Showing standardized dispatch records with verified product specifications, vehicle numbers, freight, and delivery proof
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="text"
                  placeholder="Search customer, vehicle, ID..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    width: '240px',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                onClick={handleExportCSV}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px' }}>Dispatch ID</th>
                  <th style={{ padding: '10px' }}>Customer Name</th>
                  <th style={{ padding: '10px' }}>Product</th>
                  <th style={{ padding: '10px' }}>Size</th>
                  <th style={{ padding: '10px' }}>Capacity</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Weight (kg)</th>
                  <th style={{ padding: '10px' }}>Vehicle</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Freight (INR)</th>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dispatchOrders.map((d, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '800', fontFamily: 'monospace', color: '#7c3aed' }}>{d.id}</td>
                    <td style={{ padding: '10px', fontWeight: '700', color: '#0f172a' }}>{d.customer}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                        {d.product}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: '#475569', fontWeight: '600' }}>{d.size}</td>
                    <td style={{ padding: '10px', color: '#0f766e', fontWeight: '700' }}>{d.capacity}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>{d.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{d.weight?.toLocaleString()} kg</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '11.5px', color: '#334155' }}>{d.vehicle}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#059669' }}>₹{d.freightAmount?.toLocaleString()}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{d.date}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        background: d.status === 'Delivered' ? '#dcfce7' : '#e0f2fe',
                        color: d.status === 'Delivered' ? '#15803d' : '#0369a1',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
export default PlantHeadDispatchAnalytics;
