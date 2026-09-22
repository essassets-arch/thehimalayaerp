'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Factory,
  Package,
  Truck,
  Clock,
  Boxes,
  ShieldCheck,
  Settings,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Layers,
  Wrench,
  Users,
  Activity,
  FileText,
  Percent,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { backendFetch } from '../../../lib/backendFetch';

// ── Palette matching master reference ──
const PALETTE = {
  navy: '#073B63',
  navyDark: '#052A47',
  blue: '#0B5FA5',
  blueLight: '#E8F1F8',
  emerald: '#159447',
  emeraldLight: '#E9F6EE',
  orange: '#F28C28',
  orangeLight: '#FEF3E9',
  crimson: '#D92323',
  crimsonLight: '#FDECEC',
  violet: '#6A3DB8',
  violetLight: '#F1ECFA',
  amber: '#D9A400',
  slateDark: '#0F172A',
  slate: '#334155',
  slateMuted: '#64748B',
  slateLight: '#F8FAFC',
  border: '#E2E8F0',
  cardBg: '#FFFFFF',
};

const FULFILLMENT_COLORS = {
  completed: '#159447',
  inProduction: '#0B5FA5',
  notStarted: '#F28C28',
  delayed: '#D92323',
};

// Safe Indian number formatter
const fmt = (val, decimals = 0) => {
  const n = Number(val || 0);
  if (isNaN(n)) return '0';
  return decimals > 0
    ? n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(n).toLocaleString('en-IN');
};

export const PlantHeadDashboard = () => {
  const router = useRouter();

  // State
  const [filter, setFilter] = useState('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');

  // Fetch Dashboard Data from Backend Aggregation Endpoint
  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const q = new URLSearchParams();
      if (filter) q.set('filter', filter);
      if (filter === 'Custom' && customStart && customEnd) {
        q.set('customStart', customStart);
        q.set('customEnd', customEnd);
      }
      q.set('year', '2026');

      const res = await backendFetch(`/api/backend/plant-head/dashboard?${q.toString()}`);
      if (res && res.kpis) {
        setDashboardData(res);
        const now = new Date();
        const istHours = String((now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24).padStart(2, '0');
        const istMins = String((now.getUTCMinutes() + 30) % 60).padStart(2, '0');
        setLastUpdatedTime(`${istHours}:${istMins} IST`);
      } else {
        throw new Error('Invalid dashboard data structure received from server');
      }
    } catch (err) {
      console.error('[PlantHeadDashboard] Error fetching dashboard data:', err);
      setError(err?.message || 'Unable to load Plant Head dashboard data. Please verify network and backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, customStart, customEnd]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Date Filter Switcher
  const handleFilterClick = (preset) => {
    if (preset === 'Custom') {
      setShowCustomModal(true);
    } else {
      setFilter(preset);
    }
  };

  const applyCustomFilter = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setFilter('Custom');
    setShowCustomModal(false);
  };

  // Safe Extraction
  const p = dashboardData?.period || {};
  const k = dashboardData?.kpis || {};
  const prod = dashboardData?.production || {};
  const disp = dashboardData?.dispatch || {};
  const ord = dashboardData?.orders || {};
  const inv = dashboardData?.inventory || {};
  const pur = dashboardData?.purchase || {};
  const qc = dashboardData?.quality || {};
  const maint = dashboardData?.maintenance || {};
  const hr = dashboardData?.hr || {};
  const costing = dashboardData?.costing || {};
  const safety = dashboardData?.safety || {};
  const insights = dashboardData?.insights || [];
  const alerts = dashboardData?.alerts || [];

  // Order fulfillment donut data
  const fulfillmentDonutData = useMemo(() => {
    const f = ord?.fulfillment;
    if (!f || f.totalOrders === 0) return [];
    return [
      { name: 'Completed', value: f.completed?.count || 0, pcs: f.completed?.pcs || 0, percent: f.completed?.percent || 0, color: FULFILLMENT_COLORS.completed },
      { name: 'In Production', value: f.inProduction?.count || 0, pcs: f.inProduction?.pcs || 0, percent: f.inProduction?.percent || 0, color: FULFILLMENT_COLORS.inProduction },
      { name: 'Not Started', value: f.notStarted?.count || 0, pcs: f.notStarted?.pcs || 0, percent: f.notStarted?.percent || 0, color: FULFILLMENT_COLORS.notStarted },
      { name: 'Delayed', value: f.delayed?.count || 0, pcs: f.delayed?.pcs || 0, percent: f.delayed?.percent || 0, color: FULFILLMENT_COLORS.delayed },
    ].filter(item => item.value > 0);
  }, [ord]);

  // Render Skeleton Loader
  if (loading && !dashboardData) {
    return (
      <div style={{ padding: '24px', background: PALETTE.slateLight, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ height: '70px', background: '#E2E8F0', borderRadius: '8px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '44px', background: '#E2E8F0', borderRadius: '8px', marginBottom: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: '110px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ height: '16px', width: '60%', background: '#F1F5F9', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ height: '28px', width: '80%', background: '#E2E8F0', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: '300px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  // Render Error State with Retry
  if (error && !dashboardData) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: PALETTE.slateLight }}>
        <div style={{ maxWidth: '520px', width: '100%', background: '#FFFFFF', border: `1px solid ${PALETTE.crimson}`, borderRadius: '12px', padding: '32px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={48} color={PALETTE.crimson} style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: PALETTE.slateDark, marginBottom: '8px' }}>Dashboard Data Unavailable</h2>
          <p style={{ fontSize: '14px', color: PALETTE.slateMuted, lineHeight: 1.5, marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => fetchDashboard(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: PALETTE.navy, color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={16} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', color: PALETTE.slateDark, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* ── 1. HEADER (Command Center Header) ── */}
      <header style={{
        background: `linear-gradient(135deg, ${PALETTE.navyDark} 0%, ${PALETTE.navy} 100%)`,
        color: '#FFFFFF',
        padding: '16px 24px',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Factory size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#93C5FD', fontWeight: 700 }}>
              Himalaya Composites Pvt. Ltd.
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF', lineHeight: 1.2 }}>
              Plant Head Manufacturing Command Center
            </div>
          </div>
        </div>

        {/* Center: Pillar Tagline */}
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '6px 14px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#E2E8F0',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span>Manufacturing</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>Quality</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>People</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>Profitability</span>
        </div>

        {/* Right: Dynamic Period Badge & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            padding: '6px 12px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9', textTransform: 'uppercase' }}>
              REPORTING PERIOD: {p.label || 'CURRENT PERIOD'}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
              {lastUpdatedTime ? `Synced: ${lastUpdatedTime}` : 'Live PostgreSQL'}
            </div>
          </div>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            title="Refresh Live Data"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '6px',
              color: '#FFFFFF',
              padding: '8px 12px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* ── 2. GLOBAL DATE FILTER BAR ── */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginRight: '4px' }}>
            Date Range:
          </span>
          {['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'Quarter', 'Year', 'Custom'].map((preset) => {
            const isActive = filter === preset;
            return (
              <button
                key={preset}
                onClick={() => handleFilterClick(preset)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? `1px solid ${PALETTE.navy}` : '1px solid #E2E8F0',
                  background: isActive ? PALETTE.navy : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : PALETTE.slate,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {preset}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '12px', color: PALETTE.slateMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
          <span>All production & dispatch metrics displayed in <strong>PCS</strong></span>
        </div>
      </div>

      {/* Main Dashboard Container */}
      <main style={{ padding: '20px 24px', maxWidth: '1680px', margin: '0 auto' }}>

        {/* ── 3. ROW 1: 8 LARGE KPI CARDS (PCS-First) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>

          {/* CARD 1: TOTAL PRODUCTION */}
          <div
            onClick={() => router.push('/plant-head/planning')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.navy}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Production</span>
              <Factory size={16} color={PALETTE.navy} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: PALETTE.slateDark, lineHeight: 1.2 }}>
              {fmt(k.totalProduction?.pcs)} <span style={{ fontSize: '13px', fontWeight: 600, color: PALETTE.navy }}>PCS</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: PALETTE.slateMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: PALETTE.slate }}>
                TARGET NOT CONFIGURED
              </span>
            </div>
          </div>

          {/* CARD 2: TOTAL DISPATCH */}
          <div
            onClick={() => router.push('/dispatch/orders')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.blue}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Dispatch</span>
              <Truck size={16} color={PALETTE.blue} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: PALETTE.slateDark, lineHeight: 1.2 }}>
              {fmt(k.totalDispatch?.pcs)} <span style={{ fontSize: '13px', fontWeight: 600, color: PALETTE.blue }}>PCS</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: PALETTE.slateMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: PALETTE.slate }}>
                TARGET NOT CONFIGURED
              </span>
            </div>
          </div>

          {/* CARD 3: PENDING ORDERS */}
          <div
            onClick={() => router.push('/plant-head/incoming-orders')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.orange}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Orders</span>
              <Clock size={16} color={PALETTE.orange} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: PALETTE.slateDark, lineHeight: 1.2 }}>
              {fmt(k.pendingOrders?.pcs)} <span style={{ fontSize: '13px', fontWeight: 600, color: PALETTE.orange }}>PCS</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: PALETTE.slateMuted }}>
              <span style={{ fontWeight: 700, color: PALETTE.slateDark }}>{fmt(k.pendingOrders?.ordersCount)}</span> Active Orders
            </div>
          </div>

          {/* CARD 4: RAW MATERIAL STOCK (Native Store Unit) */}
          <div
            onClick={() => router.push('/plant-head/raw-inventory')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.emerald}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Raw Material Stock</span>
              <Boxes size={16} color={PALETTE.emerald} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: PALETTE.slateDark, lineHeight: 1.2 }}>
              {fmt(k.rawMaterialStock?.stock)} <span style={{ fontSize: '13px', fontWeight: 600, color: PALETTE.emerald }}>{k.rawMaterialStock?.unit || 'KG'}</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: PALETTE.slateMuted }}>
              <span style={{ fontWeight: 700, color: PALETTE.slateDark }}>{k.rawMaterialStock?.itemsCount || 0}</span> Active Inventory Items
            </div>
          </div>

          {/* CARD 5: QUALITY REJECTION */}
          <div
            onClick={() => router.push('/plant-head/qc-failures')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${k.qualityRejection?.rejectionPercent > 0 ? PALETTE.crimson : PALETTE.emerald}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Quality Rejection</span>
              <ShieldCheck size={16} color={k.qualityRejection?.rejectionPercent > 0 ? PALETTE.crimson : PALETTE.emerald} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: k.qualityRejection?.rejectionPercent > 0 ? PALETTE.crimson : PALETTE.emerald, lineHeight: 1.2 }}>
              {Number(k.qualityRejection?.rejectionPercent || 0).toFixed(1)}%
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: PALETTE.slateMuted }}>
              Accepted: <span style={{ fontWeight: 700, color: PALETTE.emerald }}>{k.qualityRejection?.acceptedPercent || 100}%</span>
            </div>
          </div>

          {/* CARD 6: MACHINE AVAILABILITY */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.slateMuted}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Machine Availability</span>
              <Settings size={16} color={PALETTE.slateMuted} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: PALETTE.slateMuted, lineHeight: 1.4 }}>
              {k.machineAvailability?.statusText || 'NOT CONFIGURED'}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: PALETTE.slateMuted }}>
              <span style={{ fontWeight: 700, color: PALETTE.slateDark }}>{k.machineAvailability?.totalMachines || 6}</span> Configured Machines
            </div>
          </div>

          {/* CARD 7: ON-TIME DELIVERY */}
          <div
            onClick={() => router.push('/plant-head/dispatch-analytics')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.emerald}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>On-Time Delivery</span>
              <CheckCircle2 size={16} color={PALETTE.emerald} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: PALETTE.slateDark, lineHeight: 1.2 }}>
              {k.onTimeDelivery?.percent != null ? `${k.onTimeDelivery?.percent}%` : 'N/A'}
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: PALETTE.slateMuted }}>
              Delivered: <span style={{ fontWeight: 700, color: PALETTE.slateDark }}>{k.onTimeDelivery?.totalDelivered || 0}</span> shipments
            </div>
          </div>

          {/* CARD 8: PRODUCTIVITY (PCS/Man/Day) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.violet}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Productivity</span>
              <TrendingUp size={16} color={PALETTE.violet} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: PALETTE.slateMuted, lineHeight: 1.4 }}>
              {k.productivity?.statusText || 'NOT CONFIGURED'}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: PALETTE.slateMuted }}>
              Target: PCS / Man / Day
            </div>
          </div>

        </div>

        {/* ── 4. ROW 2: ANALYTICS ROW (4 WIDGETS) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>

          {/* WIDGET 1: PRODUCTION VS TARGET (DAILY) (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase', margin: 0 }}>
                  Production vs Target (Daily)
                </h3>
                <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Actual Output (PCS) across period</span>
              </div>
              <span style={{ fontSize: '10px', background: '#F1F5F9', color: PALETTE.slateMuted, padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                TARGET NOT CONFIGURED
              </span>
            </div>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prod.dailyVsTarget || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip formatter={(value) => [`${fmt(value)} PCS`, 'Actual Production']} />
                  <Bar dataKey="actualPcs" name="Actual (PCS)" fill={PALETTE.navy} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WIDGET 2: DISPATCH VS TARGET (DAILY) (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.blue, textTransform: 'uppercase', margin: 0 }}>
                  Dispatch vs Target (Daily)
                </h3>
                <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Outbound Deliveries (PCS)</span>
              </div>
              <span style={{ fontSize: '10px', background: '#F1F5F9', color: PALETTE.slateMuted, padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                TARGET NOT CONFIGURED
              </span>
            </div>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disp.dailyVsTarget || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip formatter={(value) => [`${fmt(value)} PCS`, 'Actual Dispatch']} />
                  <Bar dataKey="actualPcs" name="Actual (PCS)" fill={PALETTE.blue} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WIDGET 3: MONTHLY TREND (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.slateDark, textTransform: 'uppercase', margin: 0 }}>
                  Monthly Trend ({p.targetYear || 2026})
                </h3>
                <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Production (PCS) vs Dispatch (PCS)</span>
              </div>
            </div>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip formatter={(val, name) => [`${fmt(val)} PCS`, name]} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="productionPcs" name="Production (PCS)" stroke={PALETTE.navy} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="dispatchPcs" name="Dispatch (PCS)" stroke={PALETTE.emerald} strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WIDGET 4: ORDER FULFILLMENT STATUS (Donut) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.slateDark, textTransform: 'uppercase', margin: 0 }}>
                  Order Fulfillment Status
                </h3>
                <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Distribution of {ord?.fulfillment?.totalOrders || 0} Total Orders</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', height: '220px', gap: '8px' }}>
              <div style={{ width: '50%', height: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fulfillmentDonutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {fulfillmentDonutData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name, entry) => [`${val} orders (${entry.payload.percent}%)`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: PALETTE.slateDark }}>
                    {ord?.fulfillment?.totalOrders || 0}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: PALETTE.slateMuted, textTransform: 'uppercase' }}>
                    Orders
                  </div>
                </div>
              </div>

              {/* Legend with exact count and PCS */}
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                {[
                  { label: 'Completed', stats: ord?.fulfillment?.completed, color: FULFILLMENT_COLORS.completed },
                  { label: 'In Production', stats: ord?.fulfillment?.inProduction, color: FULFILLMENT_COLORS.inProduction },
                  { label: 'Not Started', stats: ord?.fulfillment?.notStarted, color: FULFILLMENT_COLORS.notStarted },
                  { label: 'Delayed', stats: ord?.fulfillment?.delayed, color: FULFILLMENT_COLORS.delayed },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span style={{ color: PALETTE.slate }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: PALETTE.slateDark }}>
                      {item.stats?.percent || 0}% ({item.stats?.count || 0})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── 5. ROW 3: PRODUCTION & DISPATCH ANALYSIS (Tables & Trend in PCS) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>

          {/* TABLE 1: PRODUCT-WISE PRODUCTION (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Product-Wise Production (PCS)</span>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                {prod.productWise?.length || 0} Products
              </span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: PALETTE.slateMuted, fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Product</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>PCS</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(prod.productWise || []).slice(0, 7).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500, color: PALETTE.slateDark }}>{item.product}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.pcs)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.slateMuted }}>{item.sharePercent}%</td>
                    </tr>
                  ))}
                  {(!prod.productWise || prod.productWise.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: PALETTE.slateMuted }}>
                        No production records for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: PALETTE.blueLight, fontWeight: 800, borderTop: '2px solid #CBD5E1' }}>
                    <td style={{ padding: '8px 12px', color: PALETTE.navy }}>Total</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>{fmt(prod.totalPcs)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TABLE 2: SIZE-WISE PRODUCTION (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Size-Wise Production (PCS)</span>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                {prod.sizeWise?.length || 0} Sizes
              </span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: PALETTE.slateMuted, fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Size</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>PCS</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(prod.sizeWise || []).slice(0, 7).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500, color: PALETTE.slateDark }}>{item.size}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.pcs)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.slateMuted }}>{item.sharePercent}%</td>
                    </tr>
                  ))}
                  {(!prod.sizeWise || prod.sizeWise.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: PALETTE.slateMuted }}>
                        No size data for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: PALETTE.blueLight, fontWeight: 800, borderTop: '2px solid #CBD5E1' }}>
                    <td style={{ padding: '8px 12px', color: PALETTE.navy }}>Total</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>{fmt(prod.totalPcs)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TABLE 3: LOAD CAPACITY-WISE (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Load Capacity-Wise (PCS)</span>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                {prod.capacityWise?.length || 0} Ratings
              </span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: PALETTE.slateMuted, fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Capacity</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>PCS</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(prod.capacityWise || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: PALETTE.slateDark }}>{item.capacity}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.pcs)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.slateMuted }}>{item.sharePercent}%</td>
                    </tr>
                  ))}
                  {(!prod.capacityWise || prod.capacityWise.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: PALETTE.slateMuted }}>
                        No capacity data for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: PALETTE.blueLight, fontWeight: 800, borderTop: '2px solid #CBD5E1' }}>
                    <td style={{ padding: '8px 12px', color: PALETTE.navy }}>Total</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>{fmt(prod.totalPcs)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* CHART 5: DISPATCH TREND (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.blue, textTransform: 'uppercase', margin: 0 }}>
                  Dispatch Trend (PCS)
                </h3>
                <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Daily Dispatched Volume</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.blue }}>
                {fmt(disp.totalPcs)} Total PCS
              </span>
            </div>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={disp.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip formatter={(val) => [`${fmt(val)} PCS`, 'Dispatched Volume']} />
                  <Line type="monotone" dataKey="pcs" stroke={PALETTE.blue} strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLE 4: TOP 5 CUSTOMERS (BY PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Top 5 Customers (By PCS)</span>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                Dispatched
              </span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: PALETTE.slateMuted, fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px', width: '28px' }}>#</th>
                    <th style={{ padding: '8px 12px' }}>Customer</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>PCS</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(disp.topCustomers || []).map((c) => (
                    <tr key={c.rank} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', color: PALETTE.slateMuted, fontWeight: 700 }}>{c.rank}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 500, color: PALETTE.slateDark }}>{c.customer}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{fmt(c.pcs)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.slateMuted }}>{c.sharePercent}%</td>
                    </tr>
                  ))}
                  {(!disp.topCustomers || disp.topCustomers.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: PALETTE.slateMuted }}>
                        No dispatch records for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: PALETTE.blueLight, fontWeight: 800, borderTop: '2px solid #CBD5E1' }}>
                    <td colSpan={2} style={{ padding: '8px 12px', color: PALETTE.navy }}>Top 5 Total</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>{fmt(disp.top5TotalPcs)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>
                      {disp.totalPcs > 0 ? `${Number(((disp.top5TotalPcs / disp.totalPcs) * 100).toFixed(1))}%` : '0%'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>

        {/* ── 6. ROW 4: OPERATIONAL SUMMARY (5 COMPACT CARDS) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}>

          {/* CARD 1: STORE & INVENTORY */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Store & Inventory</span>
              <Boxes size={16} color={PALETTE.emerald} />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Catalog Items</span>
                <span style={{ fontWeight: 700 }}>{inv.totalItems || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Raw Stock</span>
                <span style={{ fontWeight: 700 }}>{fmt(inv.totalStock)} {inv.unit || 'KG'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Received (GRN)</span>
                <span style={{ fontWeight: 700, color: PALETTE.emerald }}>{fmt(inv.receivedThisMonth)} {inv.unit || 'KG'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Issued to Production</span>
                <span style={{ fontWeight: 700, color: PALETTE.blue }}>{fmt(inv.issuedThisMonth)} {inv.unit || 'KG'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Low Stock Items</span>
                <span style={{ fontWeight: 700, color: inv.lowStockItems > 0 ? PALETTE.orange : PALETTE.slateDark }}>{inv.lowStockItems || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Out of Stock Items</span>
                <span style={{ fontWeight: 700, color: inv.outOfStockItems > 0 ? PALETTE.crimson : PALETTE.slateDark }}>{inv.outOfStockItems || 0}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA' }}>
              <button
                onClick={() => router.push('/plant-head/raw-inventory')}
                style={{ fontSize: '11px', fontWeight: 600, color: PALETTE.blue, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                <span>View Store Inventory</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* CARD 2: PURCHASE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Purchase</span>
              <Package size={16} color={PALETTE.blue} />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Purchase Orders</span>
                <span style={{ fontWeight: 700 }}>{pur.totalPOs || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Open POs</span>
                <span style={{ fontWeight: 700, color: PALETTE.blue }}>{pur.openPOs || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Received (GRNs)</span>
                <span style={{ fontWeight: 700, color: PALETTE.emerald }}>{pur.receivedThisMonth || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Pending Delivery</span>
                <span style={{ fontWeight: 700 }}>{pur.pendingDelivery || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Overdue POs</span>
                <span style={{ fontWeight: 700, color: pur.overduePOs > 0 ? PALETTE.crimson : PALETTE.slateDark }}>{pur.overduePOs || 0}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA' }}>
              <button
                onClick={() => router.push('/procurement/purchase-orders')}
                style={{ fontSize: '11px', fontWeight: 600, color: PALETTE.blue, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                <span>View Purchase Orders</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* CARD 3: QUALITY CONTROL */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Quality Control</span>
              <ShieldCheck size={16} color={PALETTE.emerald} />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Inspected</span>
                <span style={{ fontWeight: 700 }}>{fmt(qc.totalInspected)} Units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Accepted</span>
                <span style={{ fontWeight: 700, color: PALETTE.emerald }}>{fmt(qc.accepted)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Rejected</span>
                <span style={{ fontWeight: 700, color: qc.rejected > 0 ? PALETTE.crimson : PALETTE.slateDark }}>{fmt(qc.rejected)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Rejection Rate</span>
                <span style={{ fontWeight: 700, color: qc.rejectionPercent > 0 ? PALETTE.crimson : PALETTE.emerald }}>{qc.rejectionPercent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Rework Orders</span>
                <span style={{ fontWeight: 700 }}>{qc.rework || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>First Pass Yield (FPY)</span>
                <span style={{ fontWeight: 700, color: PALETTE.emerald }}>{qc.firstPassYield}%</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA' }}>
              <button
                onClick={() => router.push('/plant-head/qc-failures')}
                style={{ fontSize: '11px', fontWeight: 600, color: PALETTE.blue, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                <span>View QC Reports</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* CARD 4: MAINTENANCE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Maintenance</span>
              <Wrench size={16} color={PALETTE.slateMuted} />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Machines</span>
                <span style={{ fontWeight: 700 }}>{maint.totalMachines || 6} Configured</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Running Fleet</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Breakdowns</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Availability</span>
                <span style={{ fontWeight: 700, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Downtime</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>{maint.totalDowntime || '0 hrs'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>MTTR (Avg.)</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>{maint.mttr || 'N/A'}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '10px', color: PALETTE.slateMuted }}>Daily status logging not initialized</span>
            </div>
          </div>

          {/* CARD 5: HR & LABOUR */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>HR & Labour</span>
              <Users size={16} color={PALETTE.violet} />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Active Employees</span>
                <span style={{ fontWeight: 700 }}>{hr.totalEmployees || 45}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Present Today</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT RECORDED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Absent Today</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT RECORDED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Attendance %</span>
                <span style={{ fontWeight: 700, color: PALETTE.slateMuted }}>NOT RECORDED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Shifts Running</span>
                <span style={{ fontWeight: 700 }}>{hr.shiftsRunning || 5} Policies</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Productivity Target</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '10px', color: PALETTE.slateMuted }}>Attendance logs not recorded for selected date</span>
            </div>
          </div>

        </div>

        {/* ── 7. ROW 5: FINANCIAL, MATERIAL & SAFETY ROW ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>

          {/* CARD 1: COSTING & PROFITABILITY */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Costing & Profitability</span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Material Cost / KG</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Labour Cost / KG</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Mfg Cost / KG</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Cost / Price (Avg.)</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Selling Price / Piece (Avg.)</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Gross Margin</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>NOT CONFIGURED</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '10px', color: PALETTE.slateMuted }}>Costing model not configured in active database</span>
            </div>
          </div>

          {/* TABLE 2: MATERIAL CONSUMPTION VS STANDARD */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Material Consumption vs Standard</span>
              <button
                onClick={() => router.push('/plant-head/material-analytics')}
                style={{ fontSize: '11px', color: PALETTE.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Detailed Analytics →
              </button>
            </div>
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <Info size={32} color={PALETTE.slateMuted} style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '13px', fontWeight: 600, color: PALETTE.slateDark, marginBottom: '4px' }}>
                BOM Standards Not Configured
              </div>
              <p style={{ fontSize: '11px', color: PALETTE.slateMuted, margin: 0, lineHeight: 1.4 }}>
                Material consumption standards are not defined in the product BOM catalog. Raw material issue movements are actively logged in the Store module.
              </p>
            </div>
          </div>

          {/* CARD 3: SAFETY & EHS */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Safety & EHS</span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Total Incidents</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>N/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Near Miss Reports</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>N/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Safety Training</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>N/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>PPE Compliance</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>N/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Fire Equipment Audit</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>N/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Environmental Compliance</span>
                <span style={{ fontWeight: 600, color: PALETTE.slateMuted }}>N/A</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '10px', color: PALETTE.slateMuted }}>EHS incident tracking module not configured in database</span>
            </div>
          </div>

          {/* TABLE 4: PENDING ORDERS (TOP 5) (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pending Orders (Top 5)</span>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                {fmt(ord?.totalPendingPcs)} Pending PCS
              </span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: PALETTE.slateMuted, fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px', width: '24px' }}>#</th>
                    <th style={{ padding: '8px 12px' }}>Customer / Order</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Pending PCS</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Target Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(ord?.pendingTop5 || []).map((o) => (
                    <tr key={o.rank} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', color: PALETTE.slateMuted, fontWeight: 700 }}>{o.rank}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 600, color: PALETTE.slateDark }}>{o.customer}</div>
                        <div style={{ fontSize: '10px', color: PALETTE.slateMuted }}>{o.orderNumber}</div>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: PALETTE.orange }}>
                        {fmt(o.pendingPcs)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.slateMuted, fontSize: '11px' }}>
                        {o.dueDate}
                      </td>
                    </tr>
                  ))}
                  {(!ord?.pendingTop5 || ord?.pendingTop5.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: PALETTE.slateMuted }}>
                        No pending sales orders
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: PALETTE.blueLight, fontWeight: 800, borderTop: '2px solid #CBD5E1' }}>
                    <td colSpan={2} style={{ padding: '8px 12px', color: PALETTE.navy }}>Total Pending</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.orange }}>{fmt(ord?.totalPendingPcs)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: PALETTE.navy }}>PCS</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>

        {/* ── 8. ROW 6: KEY INSIGHTS & ACTIONS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>

          {/* KEY INSIGHTS */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={18} color={PALETTE.navy} />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase', margin: 0 }}>
                Key Operational Insights
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: PALETTE.slate, lineHeight: 1.5 }}>
              {insights.map((ins, i) => (
                <li key={i} style={{ fontWeight: 500 }}>{ins}</li>
              ))}
              {insights.length === 0 && (
                <li style={{ color: PALETTE.slateMuted }}>All plant operations operating within normal baseline parameters.</li>
              )}
            </ul>
          </div>

          {/* ALERTS & ACTIONS */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={18} color={PALETTE.orange} />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.orange, textTransform: 'uppercase', margin: 0 }}>
                Alerts & Action Items
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alerts.map((al, idx) => (
                <div
                  key={idx}
                  onClick={() => al.link && router.push(al.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: al.severity === 'critical' ? PALETTE.crimsonLight : PALETTE.orangeLight,
                    border: `1px solid ${al.severity === 'critical' ? PALETTE.crimson : PALETTE.orange}`,
                    fontSize: '12px',
                    cursor: al.link ? 'pointer' : 'default'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', color: al.severity === 'critical' ? PALETTE.crimson : PALETTE.orange }}>
                      [{al.category}]
                    </span>
                    <span style={{ color: PALETTE.slateDark, fontWeight: 500 }}>{al.message}</span>
                  </div>
                  {al.link && <ExternalLink size={14} color={al.severity === 'critical' ? PALETTE.crimson : PALETTE.orange} />}
                </div>
              ))}
              {alerts.length === 0 && (
                <div style={{ fontSize: '12px', color: PALETTE.slateMuted, padding: '12px 0' }}>
                  No active critical plant alerts for the selected period.
                </div>
              )}
            </div>
          </div>

          {/* PLANT HEAD NOTES */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={18} color={PALETTE.navy} />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase', margin: 0 }}>
                Plant Head Notes
              </h3>
            </div>
            <div style={{ padding: '20px 14px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: PALETTE.slateMuted, marginBottom: '6px' }}>
                No supervisor shift notes logged for {p.label || 'this period'}.
              </div>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                Shift remarks recorded by Plant Head will automatically display here.
              </span>
            </div>
          </div>

        </div>

      </main>

      {/* ── 9. PROFESSIONAL ENTERPRISE FOOTER ── */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '16px 24px',
        fontSize: '11px',
        color: PALETTE.slateMuted,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Himalaya Composites Pvt. Ltd. — Manufacturing Command Center
        </div>
        <div style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          Safety | Quality | People | Process | Sustainability
        </div>
        <div>
          PostgreSQL Database Single Source of Truth
        </div>
      </footer>

      {/* ── Custom Date Range Modal ── */}
      {showCustomModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            maxWidth: '400px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: PALETTE.slateDark }}>
                Select Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color={PALETTE.slateMuted} />
              </button>
            </div>

            <form onSubmit={applyCustomFilter}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: PALETTE.slate, marginBottom: '4px' }}>
                  From Date:
                </label>
                <input
                  type="date"
                  required
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: PALETTE.slate, marginBottom: '4px' }}>
                  To Date:
                </label>
                <input
                  type="date"
                  required
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: PALETTE.navy, color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlantHeadDashboard;
