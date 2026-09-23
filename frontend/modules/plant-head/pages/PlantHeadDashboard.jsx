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
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
  ChevronDown,
  ArrowRight,
  Layers,
  Wrench,
  Users,
  Activity,
  Percent,
  X,
  BarChart3,
  PieChart as PieChartIcon,
  Table as TableIcon,
  Cpu,
  Search,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
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
  const [hasMounted, setHasMounted] = useState(false);
  const [filter, setFilter] = useState('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Machine Availability & Daily Status State
  const [machineStatuses, setMachineStatuses] = useState([]);
  const [loadingMachineStatuses, setLoadingMachineStatuses] = useState(false);
  const [savingMachineStatuses, setSavingMachineStatuses] = useState(false);
  const [machineStatusesDate, setMachineStatusesDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA');
  });
  const [machineSearch, setMachineSearch] = useState('');
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [machineSaveSuccess, setMachineSaveSuccess] = useState(false);

  const fetchMachineStatuses = useCallback(async (dateStr) => {
    try {
      setLoadingMachineStatuses(true);
      const res = await backendFetch(`/api/backend/machine-status?date=${dateStr}`);
      if (Array.isArray(res) && res.length > 0) {
        setMachineStatuses(res);
      } else {
        // Fallback default 6 configured machines (HM001 - HM006)
        setMachineStatuses([
          { id: 1, machineId: 'HM001', machineName: 'Hydraulic Machine 1', machineType: 'Hydraulic Press', location: 'Section A', status: 'USE' },
          { id: 2, machineId: 'HM002', machineName: 'Hydraulic Machine 2', machineType: 'Hydraulic Press', location: 'Section A', status: 'USE' },
          { id: 3, machineId: 'HM003', machineName: 'Hydraulic Machine 3', machineType: 'Hydraulic Press', location: 'Section B', status: 'USE' },
          { id: 4, machineId: 'HM004', machineName: 'Hydraulic Machine 4', machineType: 'Hydraulic Press', location: 'Section B', status: 'USE' },
          { id: 5, machineId: 'HM005', machineName: 'Hydraulic Machine 5', machineType: 'Hydraulic Press', location: 'Section C', status: 'USE' },
          { id: 6, machineId: 'HM006', machineName: 'Hydraulic Machine 6', machineType: 'Hydraulic Press', location: 'Section C', status: 'USE' },
        ]);
      }
    } catch (err) {
      console.error('[PlantHeadDashboard] Failed to fetch machine statuses:', err);
    } finally {
      setLoadingMachineStatuses(false);
    }
  }, []);

  useEffect(() => {
    fetchMachineStatuses(machineStatusesDate);
  }, [machineStatusesDate, fetchMachineStatuses]);

  const updateLocalMachineStatus = (machineId, status) => {
    setMachineStatuses((prev) =>
      prev.map((m) => (m.id === machineId || m.machineId === machineId ? { ...m, status } : m))
    );
  };

  const handleSaveMachineStatusesSubmit = async () => {
    try {
      setSavingMachineStatuses(true);
      setMachineSaveSuccess(false);
      const payload = {
        workDate: machineStatusesDate,
        machines: machineStatuses.map((m) => ({
          machineId: m.id,
          status: m.status || 'USE',
          remarks: m.remarks || '',
        })),
      };
      await backendFetch('/api/backend/machine-status', {
        method: 'POST',
        body: payload,
      });
      setMachineSaveSuccess(true);
      setTimeout(() => setMachineSaveSuccess(false), 3500);
      fetchMachineStatuses(machineStatusesDate);
      fetchDashboard(true);
    } catch (err) {
      console.error('[PlantHeadDashboard] Failed to save machine status:', err);
    } finally {
      setSavingMachineStatuses(false);
    }
  };

  // Breakdown Card View Modes ('chart' | 'table')
  const [productViewMode, setProductViewMode] = useState('chart');
  const [sizeViewMode, setSizeViewMode] = useState('chart');
  const [capacityViewMode, setCapacityViewMode] = useState('chart');
  const [customerViewMode, setCustomerViewMode] = useState('chart');
  const [qcViewMode, setQcViewMode] = useState('details');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  // Machine Availability Calculations
  const inUseMachineCount = useMemo(() => {
    if (machineStatuses && machineStatuses.length > 0) {
      return machineStatuses.filter(m => m.status === 'USE').length;
    }
    return k.machineAvailability?.inUseCount != null ? k.machineAvailability?.inUseCount : 6;
  }, [machineStatuses, k.machineAvailability]);

  const totalMachineCount = useMemo(() => {
    return machineStatuses.length || k.machineAvailability?.totalMachines || 6;
  }, [machineStatuses, k.machineAvailability]);

  const filteredMachineStatuses = useMemo(() => {
    const term = machineSearch.toLowerCase().trim();
    if (!term) return machineStatuses;
    return machineStatuses.filter(
      (m) =>
        (m.machineId && m.machineId.toLowerCase().includes(term)) ||
        (m.machineName && m.machineName.toLowerCase().includes(term)) ||
        (m.machineType && m.machineType.toLowerCase().includes(term)) ||
        (m.location && m.location.toLowerCase().includes(term))
    );
  }, [machineStatuses, machineSearch]);

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

  // Quality inspection donut data
  const qcDonutData = useMemo(() => {
    const acc = Number(qc?.accepted || 0);
    const rej = Number(qc?.rejected || 0);
    const rew = Number(qc?.rework || 0);
    const total = acc + rej + rew;
    if (total === 0) return [];
    return [
      { name: 'Accepted', value: acc, color: PALETTE.emerald, percent: Number(((acc / total) * 100).toFixed(1)) },
      { name: 'Rejected', value: rej, color: PALETTE.crimson, percent: Number(((rej / total) * 100).toFixed(1)) },
      { name: 'Rework', value: rew, color: PALETTE.orange, percent: Number(((rew / total) * 100).toFixed(1)) },
    ].filter(item => item.value > 0);
  }, [qc]);

  // Calculated daily benchmark averages
  const avgDailyProd = useMemo(() => {
    const active = (prod?.dailyVsTarget || []).filter(d => Number(d.actualPcs || 0) > 0);
    return active.length ? Math.round(Number(prod?.totalPcs || 0) / active.length) : 0;
  }, [prod]);

  const avgDailyDisp = useMemo(() => {
    const active = (disp?.dailyVsTarget || []).filter(d => Number(d.actualPcs || 0) > 0);
    return active.length ? Math.round(Number(disp?.totalPcs || 0) / active.length) : 0;
  }, [disp]);

  // Safe zero-blank responsive chart container with hydration guard
  const SafeChartBox = ({ children, height = 220, isEmpty = false, emptyText = 'No data recorded for this timeframe' }) => {
    if (!hasMounted) {
      return (
        <div style={{ width: '100%', height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '6px' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: PALETTE.navy, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div style={{ width: '100%', height: `${height}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '6px', border: '1px dashed #CBD5E1', padding: '16px', boxSizing: 'border-box' }}>
          <BarChart3 size={24} color="#94A3B8" style={{ marginBottom: '6px' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: PALETTE.slateMuted }}>{emptyText}</span>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', minWidth: 0, height: `${height}px`, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          {children}
        </ResponsiveContainer>
      </div>
    );
  };

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
            onClick={() => setShowMachineModal(true)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${inUseMachineCount > 0 ? PALETTE.emerald : PALETTE.orange}`,
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Click to view and configure Machine Availability"
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Machine Availability</span>
              <Cpu size={16} color={inUseMachineCount > 0 ? PALETTE.emerald : PALETTE.orange} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: inUseMachineCount > 0 ? PALETTE.emerald : PALETTE.orange, lineHeight: 1.4 }}>
              {inUseMachineCount} / {totalMachineCount} IN USE ({totalMachineCount > 0 ? Math.round((inUseMachineCount / totalMachineCount) * 100) : 0}%)
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: PALETTE.blue, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{totalMachineCount} Configured Machines</span>
              <span style={{ fontSize: '10px', textDecoration: 'underline' }}>Manage Fleet →</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {avgDailyProd > 0 && (
                  <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Avg: {fmt(avgDailyProd)} PCS/day
                  </span>
                )}
                <span style={{ fontSize: '10px', background: '#F1F5F9', color: PALETTE.slateMuted, padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  TARGET NOT CONFIGURED
                </span>
              </div>
            </div>
            <SafeChartBox height={220} isEmpty={!prod.dailyVsTarget?.length || prod.totalPcs === 0} emptyText="No production recorded for this timeframe">
              <BarChart data={prod.dailyVsTarget || []} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="phProdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B5FA5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#073B63" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  stroke="#CBD5E1"
                  interval={(prod.dailyVsTarget?.length || 0) > 15 ? 'preserveStartEnd' : 0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#CBD5E1" />
                <Tooltip
                  formatter={(value) => [`${fmt(value)} PCS`, 'Actual Production']}
                  labelFormatter={(lbl, items) => {
                    const row = items?.[0]?.payload;
                    return row?.date || lbl;
                  }}
                  contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '12px', border: 'none' }}
                />
                {avgDailyProd > 0 && (
                  <ReferenceLine y={avgDailyProd} stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: `Avg ${fmt(avgDailyProd)}`, position: 'insideTopRight', fill: '#D97706', fontSize: 10, fontWeight: 700 }} />
                )}
                <Bar dataKey="actualPcs" name="Actual (PCS)" fill="url(#phProdGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeChartBox>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {avgDailyDisp > 0 && (
                  <span style={{ fontSize: '10px', background: '#DBEAFE', color: '#1D4ED8', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Avg: {fmt(avgDailyDisp)} PCS/day
                  </span>
                )}
                <span style={{ fontSize: '10px', background: '#F1F5F9', color: PALETTE.slateMuted, padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  TARGET NOT CONFIGURED
                </span>
              </div>
            </div>
            <SafeChartBox height={220} isEmpty={!disp.dailyVsTarget?.length || disp.totalPcs === 0} emptyText="No dispatch recorded for this timeframe">
              <BarChart data={disp.dailyVsTarget || []} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="phDispGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  stroke="#CBD5E1"
                  interval={(disp.dailyVsTarget?.length || 0) > 15 ? 'preserveStartEnd' : 0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#CBD5E1" />
                <Tooltip
                  formatter={(value) => [`${fmt(value)} PCS`, 'Actual Dispatch']}
                  labelFormatter={(lbl, items) => {
                    const row = items?.[0]?.payload;
                    return row?.date || lbl;
                  }}
                  contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '12px', border: 'none' }}
                />
                {avgDailyDisp > 0 && (
                  <ReferenceLine y={avgDailyDisp} stroke="#2563EB" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: `Avg ${fmt(avgDailyDisp)}`, position: 'insideTopRight', fill: '#1D4ED8', fontSize: 10, fontWeight: 700 }} />
                )}
                <Bar dataKey="actualPcs" name="Actual (PCS)" fill="url(#phDispGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeChartBox>
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
            <SafeChartBox height={220} isEmpty={!dashboardData?.monthlyTrend?.length} emptyText="No trend data available">
              <AreaChart data={dashboardData?.monthlyTrend || []} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaProdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#073B63" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#073B63" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaDispGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#159447" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#159447" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#CBD5E1" />
                <Tooltip
                  formatter={(val, name) => [`${fmt(val)} PCS`, name]}
                  contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '12px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Area type="monotone" dataKey="productionPcs" name="Production (PCS)" stroke={PALETTE.navy} fill="url(#areaProdGrad)" strokeWidth={2.5} dot={{ r: 3, fill: PALETTE.navy }} />
                <Area type="monotone" dataKey="dispatchPcs" name="Dispatch (PCS)" stroke={PALETTE.emerald} fill="url(#areaDispGrad)" strokeWidth={2.5} dot={{ r: 3, fill: PALETTE.emerald }} />
              </AreaChart>
            </SafeChartBox>
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

            <div style={{ display: 'flex', alignItems: 'center', height: '220px', gap: '12px' }}>
              <div style={{ flex: '1 1 50%', minWidth: 0, height: '100%', position: 'relative' }}>
                <SafeChartBox height={220} isEmpty={false}>
                  <PieChart>
                    <Pie
                      data={fulfillmentDonutData.length ? fulfillmentDonutData : [{ name: 'No Orders', value: 1, color: '#CBD5E1' }]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={2}
                    >
                      {(fulfillmentDonutData.length ? fulfillmentDonutData : [{ name: 'No Orders', value: 1, color: '#CBD5E1' }]).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {fulfillmentDonutData.length > 0 && (
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={{ background: '#0F172A', color: '#FFF', padding: '6px 10px', borderRadius: '6px', fontSize: '11px' }}>
                              <span style={{ color: d.color, fontWeight: 700 }}>{d.name}</span>: {d.value} orders ({d.percent}%)
                              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{fmt(d.pcs)} PCS</div>
                            </div>
                          );
                        }}
                      />
                    )}
                  </PieChart>
                </SafeChartBox>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: PALETTE.slateDark, lineHeight: 1 }}>
                    {ord?.fulfillment?.totalOrders || 0}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>
                    Orders
                  </div>
                </div>
              </div>

              {/* Legend with exact count and PCS */}
              <div style={{ flex: '1 1 50%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                {[
                  { label: 'Completed', stats: ord?.fulfillment?.completed, color: FULFILLMENT_COLORS.completed },
                  { label: 'In Production', stats: ord?.fulfillment?.inProduction, color: FULFILLMENT_COLORS.inProduction },
                  { label: 'Not Started', stats: ord?.fulfillment?.notStarted, color: FULFILLMENT_COLORS.notStarted },
                  { label: 'Delayed', stats: ord?.fulfillment?.delayed, color: FULFILLMENT_COLORS.delayed },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ color: PALETTE.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: PALETTE.slateDark, flexShrink: 0 }}>
                      {item.stats?.percent || 0}% ({item.stats?.count || 0})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. ROW 3: PRODUCTION & DISPATCH ANALYSIS (Charts & Tables in PCS) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>

          {/* CARD 1: PRODUCT-WISE PRODUCTION (PCS) - CHART & TABLE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Product-Wise Output</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  {prod.productWise?.length || 0} Products
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '4px' }}>
                <button
                  type="button"
                  onClick={() => setProductViewMode('chart')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: productViewMode === 'chart' ? '#FFFFFF' : 'transparent',
                    color: productViewMode === 'chart' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <BarChart3 size={11} /> Chart
                </button>
                <button
                  type="button"
                  onClick={() => setProductViewMode('table')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: productViewMode === 'table' ? '#FFFFFF' : 'transparent',
                    color: productViewMode === 'table' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <TableIcon size={11} /> Table
                </button>
              </div>
            </div>

            {productViewMode === 'chart' ? (
              <div style={{ padding: '12px' }}>
                <SafeChartBox height={240} isEmpty={!prod.productWise?.length} emptyText="No product production records">
                  <BarChart
                    layout="vertical"
                    data={(prod.productWise || []).slice(0, 5).map(p => ({
                      ...p,
                      shortName: p.product.length > 18 ? p.product.slice(0, 18) + '…' : p.product
                    }))}
                    margin={{ top: 8, right: 28, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                    <YAxis dataKey="shortName" type="category" width={110} tick={{ fontSize: 10, fill: PALETTE.slateDark, fontWeight: 600 }} />
                    <Tooltip
                      formatter={(val, name, entry) => [`${fmt(val)} PCS (${entry.payload.sharePercent}%)`, entry.payload.product]}
                      contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                    />
                    <Bar dataKey="pcs" radius={[0, 4, 4, 0]}>
                      {(prod.productWise || []).slice(0, 5).map((_, i) => (
                        <Cell key={i} fill={['#073B63', '#0B5FA5', '#159447', '#D97706', '#6A3DB8'][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </SafeChartBox>
              </div>
            ) : (
              <div style={{ maxHeight: '254px', overflowY: 'auto' }}>
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
            )}
          </div>

          {/* CARD 2: SIZE-WISE PRODUCTION (PCS) - CHART & TABLE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Size-Wise Output</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  {prod.sizeWise?.length || 0} Sizes
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSizeViewMode('chart')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: sizeViewMode === 'chart' ? '#FFFFFF' : 'transparent',
                    color: sizeViewMode === 'chart' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <BarChart3 size={11} /> Chart
                </button>
                <button
                  type="button"
                  onClick={() => setSizeViewMode('table')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: sizeViewMode === 'table' ? '#FFFFFF' : 'transparent',
                    color: sizeViewMode === 'table' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <TableIcon size={11} /> Table
                </button>
              </div>
            </div>

            {sizeViewMode === 'chart' ? (
              <div style={{ padding: '12px' }}>
                <SafeChartBox height={240} isEmpty={!prod.sizeWise?.length} emptyText="No size production records">
                  <BarChart
                    layout="vertical"
                    data={(prod.sizeWise || []).slice(0, 5).map(s => ({
                      ...s,
                      shortName: s.size.length > 16 ? s.size.slice(0, 16) + '…' : s.size
                    }))}
                    margin={{ top: 8, right: 28, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                    <YAxis dataKey="shortName" type="category" width={100} tick={{ fontSize: 10, fill: PALETTE.slateDark, fontWeight: 600 }} />
                    <Tooltip
                      formatter={(val, name, entry) => [`${fmt(val)} PCS (${entry.payload.sharePercent}%)`, entry.payload.size]}
                      contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                    />
                    <Bar dataKey="pcs" radius={[0, 4, 4, 0]}>
                      {(prod.sizeWise || []).slice(0, 5).map((_, i) => (
                        <Cell key={i} fill={['#0B5FA5', '#159447', '#D97706', '#6A3DB8', '#073B63'][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </SafeChartBox>
              </div>
            ) : (
              <div style={{ maxHeight: '254px', overflowY: 'auto' }}>
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
            )}
          </div>

          {/* CARD 3: LOAD CAPACITY-WISE (PCS) - CHART & TABLE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Capacity-Wise Output</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  {prod.capacityWise?.length || 0} Ratings
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '4px' }}>
                <button
                  type="button"
                  onClick={() => setCapacityViewMode('chart')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: capacityViewMode === 'chart' ? '#FFFFFF' : 'transparent',
                    color: capacityViewMode === 'chart' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <PieChartIcon size={11} /> Chart
                </button>
                <button
                  type="button"
                  onClick={() => setCapacityViewMode('table')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: capacityViewMode === 'table' ? '#FFFFFF' : 'transparent',
                    color: capacityViewMode === 'table' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <TableIcon size={11} /> Table
                </button>
              </div>
            </div>

            {capacityViewMode === 'chart' ? (
              <div style={{ padding: '12px', display: 'flex', alignItems: 'center', height: '240px' }}>
                <SafeChartBox height={240} isEmpty={!prod.capacityWise?.length} emptyText="No capacity data">
                  <PieChart>
                    <Pie
                      data={prod.capacityWise || []}
                      dataKey="pcs"
                      nameKey="capacity"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={74}
                      paddingAngle={2}
                    >
                      {(prod.capacityWise || []).map((_, i) => (
                        <Cell key={i} fill={['#073B63', '#0B5FA5', '#159447', '#D97706', '#6A3DB8', '#DC2626', '#0284C7', '#475569'][i % 8]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, entry) => [`${fmt(val)} PCS (${entry.payload.sharePercent}%)`, entry.payload.capacity]}
                      contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </SafeChartBox>
              </div>
            ) : (
              <div style={{ maxHeight: '254px', overflowY: 'auto' }}>
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
            )}
          </div>

          {/* CARD 4: DISPATCH TREND (PCS) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.blue, textTransform: 'uppercase', margin: 0 }}>
                  Dispatch Trend (PCS)
                </h3>
                <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Daily Dispatched Volume</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.blue, background: '#EFF6FF', padding: '3px 8px', borderRadius: '4px' }}>
                {fmt(disp.totalPcs)} Total PCS
              </span>
            </div>
            <SafeChartBox height={220} isEmpty={!disp.trend?.length || disp.totalPcs === 0} emptyText="No dispatch activity in selected period">
              <AreaChart data={disp.trend || []} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="dispTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B5FA5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0B5FA5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  stroke="#CBD5E1"
                  interval={(disp.trend?.length || 0) > 15 ? 'preserveStartEnd' : 0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#CBD5E1" />
                <Tooltip
                  formatter={(val) => [`${fmt(val)} PCS`, 'Dispatched Volume']}
                  labelFormatter={(lbl, items) => {
                    const row = items?.[0]?.payload;
                    return row?.date || lbl;
                  }}
                  contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="pcs" stroke={PALETTE.blue} fill="url(#dispTrendGrad)" strokeWidth={2.5} dot={{ r: 3, fill: PALETTE.blue }} />
              </AreaChart>
            </SafeChartBox>
          </div>

          {/* CARD 5: TOP 5 CUSTOMERS (BY PCS) - CHART & TABLE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: PALETTE.navy, color: '#FFFFFF', padding: '10px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Top 5 Clients</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  Dispatched
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '4px' }}>
                <button
                  type="button"
                  onClick={() => setCustomerViewMode('chart')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: customerViewMode === 'chart' ? '#FFFFFF' : 'transparent',
                    color: customerViewMode === 'chart' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <BarChart3 size={11} /> Chart
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerViewMode('table')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: customerViewMode === 'table' ? '#FFFFFF' : 'transparent',
                    color: customerViewMode === 'table' ? PALETTE.navy : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <TableIcon size={11} /> Table
                </button>
              </div>
            </div>

            {customerViewMode === 'chart' ? (
              <div style={{ padding: '12px' }}>
                <SafeChartBox height={240} isEmpty={!disp.topCustomers?.length} emptyText="No dispatch customer records">
                  <BarChart
                    layout="vertical"
                    data={(disp.topCustomers || []).map(c => ({
                      ...c,
                      shortName: c.customer.length > 18 ? c.customer.slice(0, 18) + '…' : c.customer
                    }))}
                    margin={{ top: 8, right: 28, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#94A3B8' }} />
                    <YAxis dataKey="shortName" type="category" width={110} tick={{ fontSize: 10, fill: PALETTE.slateDark, fontWeight: 600 }} />
                    <Tooltip
                      formatter={(val, name, entry) => [`${fmt(val)} PCS (${entry.payload.sharePercent}%)`, entry.payload.customer]}
                      contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                    />
                    <Bar dataKey="pcs" radius={[0, 4, 4, 0]}>
                      {(disp.topCustomers || []).map((_, i) => (
                        <Cell key={i} fill={['#073B63', '#0B5FA5', '#159447', '#D97706', '#6A3DB8'][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </SafeChartBox>
              </div>
            ) : (
              <div style={{ maxHeight: '254px', overflowY: 'auto' }}>
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
            )}
          </div>

        </div>

        {/* ── 5.5. MACHINE AVAILABILITY & DAILY OPERATIONS FLEET ── */}
        <div id="machine-fleet-section" style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          {/* Header */}
          <div style={{
            background: PALETTE.navy,
            color: '#FFFFFF',
            padding: '12px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                <Cpu size={18} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Machine Availability & Daily Operations Fleet
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>
                  Manage running status for configured production machines • Real-time synchronization
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                background: inUseMachineCount > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                border: `1px solid ${inUseMachineCount > 0 ? '#10B981' : '#EF4444'}`,
                color: inUseMachineCount > 0 ? '#34D399' : '#F87171',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {inUseMachineCount} / {totalMachineCount} Machines Running ({totalMachineCount > 0 ? Math.round((inUseMachineCount / totalMachineCount) * 100) : 0}%)
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 600 }}>Date:</span>
                <input
                  type="date"
                  value={machineStatusesDate}
                  onChange={(e) => setMachineStatusesDate(e.target.value)}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveMachineStatusesSubmit}
                disabled={savingMachineStatuses || machineStatuses.length === 0}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: savingMachineStatuses ? '#94A3B8' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: savingMachineStatuses || machineStatuses.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                  transition: 'all 0.15s ease'
                }}
              >
                {savingMachineStatuses ? '⏳ Saving Log...' : '✓ Save Daily Status'}
              </button>
            </div>
          </div>

          {/* Success banner */}
          {machineSaveSuccess && (
            <div style={{
              background: '#DCFCE7',
              borderBottom: '1px solid #BBF7D0',
              color: '#15803D',
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={16} />
              <span>Machine daily statuses for {machineStatusesDate} saved successfully! Dashboard availability updated.</span>
            </div>
          )}

          {/* Controls Bar */}
          <div style={{
            padding: '10px 18px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search machine ID, name, type..."
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: PALETTE.slateMuted }}>
              Configured Fleet: <strong style={{ color: PALETTE.slateDark }}>{filteredMachineStatuses.length} Machines</strong>
              {filteredMachineStatuses.length !== totalMachineCount && ` (filtered from ${totalMachineCount})`}
            </div>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', color: PALETTE.slate, fontWeight: 700, borderBottom: '1px solid #E2E8F0', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px', width: '130px' }}>Machine ID</th>
                  <th style={{ padding: '12px 16px', minWidth: '180px' }}>Machine Name</th>
                  <th style={{ padding: '12px 16px', minWidth: '150px' }}>Type</th>
                  <th style={{ padding: '12px 16px', minWidth: '130px' }}>Location</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', width: '220px' }}>Daily Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingMachineStatuses ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: PALETTE.slateMuted }}>
                      Loading machine statuses...
                    </td>
                  </tr>
                ) : filteredMachineStatuses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: PALETTE.slateMuted }}>
                      No machines match &quot;{machineSearch}&quot;
                    </td>
                  </tr>
                ) : (
                  filteredMachineStatuses.map((m) => {
                    const isUse = m.status === 'USE';
                    const isNotUse = m.status === 'NOT_USE';

                    return (
                      <tr key={m.id || m.machineId} style={{ borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#7C3AED' }}>
                          {m.machineId}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: PALETTE.slateDark }}>
                          {m.machineName}
                        </td>
                        <td style={{ padding: '12px 16px', color: PALETTE.slate }}>
                          {m.machineType}
                        </td>
                        <td style={{ padding: '12px 16px', color: PALETTE.slateMuted }}>
                          <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            {m.location || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', background: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #DCE5F0', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => updateLocalMachineStatus(m.id || m.machineId, 'USE')}
                              style={{
                                padding: '6px 18px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: isUse ? '#FFFFFF' : 'transparent',
                                color: isUse ? '#10B981' : '#64748B',
                                boxShadow: isUse ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isUse ? '#10B981' : '#CBD5E1' }} />
                              Use
                            </button>

                            <button
                              type="button"
                              onClick={() => updateLocalMachineStatus(m.id || m.machineId, 'NOT_USE')}
                              style={{
                                padding: '6px 18px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: isNotUse ? '#FFFFFF' : 'transparent',
                                color: isNotUse ? '#EF4444' : '#64748B',
                                boxShadow: isNotUse ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isNotUse ? '#EF4444' : '#CBD5E1' }} />
                              Not Use
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div style={{
            padding: '12px 18px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: PALETTE.slateMuted,
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              <span>Fleet Summary: </span>
              <strong style={{ color: PALETTE.emerald }}>{inUseMachineCount} In Use</strong>
              <span> • </span>
              <strong style={{ color: totalMachineCount - inUseMachineCount > 0 ? PALETTE.orange : PALETTE.slateMuted }}>
                {totalMachineCount - inUseMachineCount} Standby / Idle
              </strong>
            </div>
            <button
              type="button"
              onClick={handleSaveMachineStatusesSubmit}
              disabled={savingMachineStatuses || machineStatuses.length === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #10B981',
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 700,
                cursor: savingMachineStatuses || machineStatuses.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {savingMachineStatuses ? 'Saving...' : '✓ Save Statuses'}
            </button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>Quality Control</span>
                <ShieldCheck size={16} color={PALETTE.emerald} />
              </div>
              <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '2px', borderRadius: '4px' }}>
                <button
                  type="button"
                  onClick={() => setQcViewMode('details')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: qcViewMode === 'details' ? '#FFFFFF' : 'transparent',
                    color: qcViewMode === 'details' ? PALETTE.navy : PALETTE.slateMuted,
                    boxShadow: qcViewMode === 'details' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => setQcViewMode('chart')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: qcViewMode === 'chart' ? '#FFFFFF' : 'transparent',
                    color: qcViewMode === 'chart' ? PALETTE.navy : PALETTE.slateMuted,
                    boxShadow: qcViewMode === 'chart' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <PieChartIcon size={11} /> Chart
                </button>
              </div>
            </div>

            {qcViewMode === 'chart' ? (
              <div style={{ padding: '12px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SafeChartBox height={190} isEmpty={!qcDonutData.length} emptyText="No inspection records">
                  <PieChart>
                    <Pie
                      data={qcDonutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={36}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {qcDonutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, entry) => [`${fmt(val)} (${entry.payload.percent}%)`, entry.payload.name]}
                      contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </SafeChartBox>
              </div>
            ) : (
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', minHeight: '210px', justifyContent: 'center' }}>
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
            )}

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
                <span style={{ fontWeight: 700, color: inUseMachineCount > 0 ? PALETTE.emerald : PALETTE.slateDark }}>{inUseMachineCount} / {totalMachineCount} Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Breakdowns / Off</span>
                <span style={{ fontWeight: 600, color: totalMachineCount - inUseMachineCount > 0 ? PALETTE.orange : PALETTE.slateMuted }}>{totalMachineCount - inUseMachineCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PALETTE.slateMuted }}>Availability</span>
                <span style={{ fontWeight: 700, color: inUseMachineCount > 0 ? PALETTE.emerald : PALETTE.slateDark }}>
                  {totalMachineCount > 0 ? Math.round((inUseMachineCount / totalMachineCount) * 100) : 0}%
                </span>
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
              <button
                onClick={() => setShowMachineModal(true)}
                style={{ fontSize: '11px', fontWeight: 600, color: PALETTE.blue, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                <span>Manage Fleet Daily Status</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* CARD 5: HR & LABOUR */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.navy, textTransform: 'uppercase' }}>HR & Labour</span>
                {hr.hasLogs && (
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: PALETTE.emeraldLight, color: PALETTE.emerald, border: `1px solid ${PALETTE.emerald}30` }}>
                    LIVE
                  </span>
                )}
              </div>
              <Users size={16} color={PALETTE.violet} />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: PALETTE.slateMuted }}>Active Employees</span>
                <span style={{ fontWeight: 700, color: PALETTE.slateDark }}>{hr.totalEmployees ?? 32}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: PALETTE.slateMuted }}>
                  {hr.dateLabel && hr.dateLabel !== 'Today' ? `Present (${hr.dateLabel})` : 'Present Today'}
                </span>
                <span style={{ fontWeight: 700, color: hr.hasLogs && hr.presentToday > 0 ? PALETTE.emerald : PALETTE.slateMuted }}>
                  {hr.hasLogs ? `${hr.presentToday} Staff` : (hr.presentToday != null && hr.presentToday > 0 ? `${hr.presentToday} Staff` : 'NOT RECORDED')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: PALETTE.slateMuted }}>
                  {hr.dateLabel && hr.dateLabel !== 'Today' ? `Absent (${hr.dateLabel})` : 'Absent Today'}
                </span>
                <span style={{ fontWeight: 600, color: hr.hasLogs && (hr.absentToday || 0) > 0 ? PALETTE.orange : PALETTE.slateMuted }}>
                  {hr.hasLogs ? `${hr.absentToday} Staff` : (hr.absentToday != null && hr.absentToday > 0 ? `${hr.absentToday} Staff` : 'NOT RECORDED')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: PALETTE.slateMuted }}>Attendance %</span>
                <span style={{
                  fontWeight: 700,
                  color: hr.hasLogs && hr.attendancePercent != null
                    ? (hr.attendancePercent >= 80 ? PALETTE.emerald : hr.attendancePercent >= 50 ? PALETTE.orange : PALETTE.crimson)
                    : PALETTE.slateMuted,
                }}>
                  {hr.hasLogs && hr.attendancePercent != null ? `${hr.attendancePercent}%` : (hr.attendancePercent != null && hr.attendancePercent > 0 ? `${hr.attendancePercent}%` : 'NOT RECORDED')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: PALETTE.slateMuted }}>Shifts Running</span>
                <span style={{ fontWeight: 700, color: PALETTE.slateDark }}>{hr.shiftsRunning || 5} Policies</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 14px', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => router.push('/hr/attendance')}
                style={{ fontSize: '11px', fontWeight: 600, color: PALETTE.blue, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                <span>View HR & Attendance Logs</span>
                <ArrowRight size={12} />
              </button>
              {hr.onLeave != null && hr.onLeave > 0 ? (
                <span style={{ fontSize: '10px', color: PALETTE.amber, fontWeight: 600 }}>
                  {hr.onLeave} on leave
                </span>
              ) : hr.hasLogs ? (
                <span style={{ fontSize: '10px', color: PALETTE.emerald, fontWeight: 600 }}>
                  {hr.clockedIn ? `${hr.clockedIn} clocked in` : 'Synced'}
                </span>
              ) : (
                <span style={{ fontSize: '10px', color: PALETTE.slateMuted }}>
                  No logs for date
                </span>
              )}
            </div>
          </div>

        </div>
      </main>

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

      {/* ── Machine Availability & Fleet Modal ── */}
      {showMachineModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}
          onClick={() => setShowMachineModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: PALETTE.navy,
              color: '#FFFFFF',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={20} color="#38BDF8" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                    Machine Availability & Fleet Operations
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                    Configure daily operation status for 6 hydraulic press machines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMachineModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#FFFFFF', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Controls Bar */}
            <div style={{ padding: '12px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: PALETTE.slateDark }}>Work Date:</span>
                <input
                  type="date"
                  value={machineStatusesDate}
                  onChange={(e) => setMachineStatusesDate(e.target.value)}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{
                background: inUseMachineCount > 0 ? '#DCFCE7' : '#FEE2E2',
                color: inUseMachineCount > 0 ? '#15803D' : '#B91C1C',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800
              }}>
                {inUseMachineCount} / {totalMachineCount} Machines Running ({totalMachineCount > 0 ? Math.round((inUseMachineCount / totalMachineCount) * 100) : 0}%)
              </div>
            </div>

            {/* Success Alert inside modal */}
            {machineSaveSuccess && (
              <div style={{ background: '#DCFCE7', color: '#15803D', padding: '8px 20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #BBF7D0' }}>
                <Check size={16} />
                <span>Statuses saved successfully!</span>
              </div>
            )}

            {/* Modal Table Container */}
            <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', color: PALETTE.slate, fontWeight: 700, borderBottom: '1px solid #E2E8F0', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 16px' }}>Machine ID</th>
                    <th style={{ padding: '10px 16px' }}>Machine Name</th>
                    <th style={{ padding: '10px 16px' }}>Type</th>
                    <th style={{ padding: '10px 16px' }}>Location</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Daily Status</th>
                  </tr>
                </thead>
                <tbody>
                  {machineStatuses.map((m) => {
                    const isUse = m.status === 'USE';
                    const isNotUse = m.status === 'NOT_USE';

                    return (
                      <tr key={m.id || m.machineId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#7C3AED' }}>
                          {m.machineId}
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: 700, color: PALETTE.slateDark }}>
                          {m.machineName}
                        </td>
                        <td style={{ padding: '10px 16px', color: PALETTE.slate }}>
                          {m.machineType}
                        </td>
                        <td style={{ padding: '10px 16px', color: PALETTE.slateMuted }}>
                          {m.location || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', background: '#F8FAFC', padding: '3px', borderRadius: '8px', border: '1px solid #DCE5F0', gap: '3px' }}>
                            <button
                              type="button"
                              onClick={() => updateLocalMachineStatus(m.id || m.machineId, 'USE')}
                              style={{
                                padding: '5px 14px',
                                borderRadius: '5px',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: isUse ? '#FFFFFF' : 'transparent',
                                color: isUse ? '#10B981' : '#64748B',
                                boxShadow: isUse ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isUse ? '#10B981' : '#CBD5E1' }} />
                              Use
                            </button>

                            <button
                              type="button"
                              onClick={() => updateLocalMachineStatus(m.id || m.machineId, 'NOT_USE')}
                              style={{
                                padding: '5px 14px',
                                borderRadius: '5px',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: isNotUse ? '#FFFFFF' : 'transparent',
                                color: isNotUse ? '#EF4444' : '#64748B',
                                boxShadow: isNotUse ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isNotUse ? '#EF4444' : '#CBD5E1' }} />
                              Not Use
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: '14px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowMachineModal(false);
                  const el = document.getElementById('machine-fleet-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ padding: '8px 14px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: PALETTE.slateDark, cursor: 'pointer' }}
              >
                Scroll to Section on Page ↓
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowMachineModal(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveMachineStatusesSubmit}
                  disabled={savingMachineStatuses || machineStatuses.length === 0}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: savingMachineStatuses ? '#94A3B8' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: savingMachineStatuses || machineStatuses.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                  }}
                >
                  {savingMachineStatuses ? '⏳ Saving...' : '✓ Save Daily Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlantHeadDashboard;
