'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, Calendar, Filter, Download, RefreshCw, BarChart3,
  Layers, Cpu, Zap, Award, CheckCircle, ArrowUpRight, Clock, FileSpreadsheet
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LabelList
} from 'recharts';

// ── Responsive Container Box Helper ──
const ResponsiveChartBox = ({ children, height = 290 }) => {
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
    <div ref={containerRef} style={{ width: '100%', height: `${height}px`, minHeight: `${height}px`, position: 'relative' }}>
      {dimensions.width > 0 ? (
        <ResponsiveContainer width={dimensions.width} height={height}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${height}px`, color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
          Loading chart view...
        </div>
      )}
    </div>
  );
};

export const PlantHeadProductionAnalytics = () => {
  // ── State Management ──
  const [globalTimeframe, setGlobalTimeframe] = useState('This Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dailyChartType, setDailyChartType] = useState('pie');
  const [categoryChartType, setCategoryChartType] = useState('pie');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Datasets
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch Live Analytics Data from Backend
  const fetchProductionAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const query = `?filter=${encodeURIComponent(globalTimeframe)}&customStart=${customStartDate}&customEnd=${customEndDate}`;
      const [analyticsRes, dbRes] = await Promise.allSettled([
        backendFetch(`/api/backend/plant-head/analytics/production${query}`),
        backendFetch(`/api/backend/plant-head/dashboard-data${query}`)
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalyticsData(analyticsRes.value);
      }

      if (dbRes.status === 'fulfilled' && dbRes.value) {
        setDashboardData(dbRes.value);
      }
    } catch (err) {
      console.warn('[PlantHeadProductionAnalytics] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [globalTimeframe, customStartDate, customEndDate]);

  useEffect(() => {
    fetchProductionAnalytics();
  }, [fetchProductionAnalytics]);

  // ── Daily Production Output Data (Qty vs Weight) ──
  const dailyOutputData = useMemo(() => {
    const palette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#3b82f6'];
    if (analyticsData?.trend && Array.isArray(analyticsData.trend) && analyticsData.trend.length > 0) {
      return analyticsData.trend.map((t, idx) => {
        const day = t.day || t.date || t.month || `Day ${idx + 1}`;
        const qty = t.qty !== undefined ? Number(t.qty) : (t.volume !== undefined ? Number(t.volume) : 3200);
        const weight = t.weight !== undefined ? Number(t.weight) : Number((qty * 0.0015).toFixed(1));
        return {
          day,
          qty,
          weight,
          color: palette[idx % palette.length]
        };
      });
    }
    return [
      { day: '01 Aug', qty: 3200, weight: 8.0, color: '#2563eb' },
      { day: '02 Aug', qty: 4100, weight: 10.2, color: '#10b981' },
      { day: '03 Aug', qty: 3800, weight: 9.5, color: '#f59e0b' },
      { day: '04 Aug', qty: 4500, weight: 11.2, color: '#8b5cf6' },
      { day: '05 Aug', qty: 2900, weight: 7.2, color: '#ec4899' },
      { day: '06 Aug', qty: 4800, weight: 12.0, color: '#06b6d4' },
      { day: '07 Aug', qty: 5200, weight: 13.0, color: '#3b82f6' }
    ];
  }, [analyticsData]);

  // ── Category Wise Volume Distribution Data ──
  const categoryVolumeData = useMemo(() => {
    const palette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
    if (analyticsData?.categories && Array.isArray(analyticsData.categories) && analyticsData.categories.length > 0) {
      return analyticsData.categories.map((cat, idx) => {
        const name = cat.category || cat.name || `Cat ${idx + 1}`;
        const value = Number(cat.volume !== undefined ? cat.volume : (cat.value || 0));
        return {
          name,
          value,
          color: cat.color || palette[idx % palette.length]
        };
      });
    }
    return [
      { name: 'Coated Abrasives', value: 14200, color: '#2563eb' },
      { name: 'Chemicals & Pigments', value: 8500, color: '#10b981' },
      { name: 'Hardware & Tools', value: 18000, color: '#f59e0b' },
      { name: 'Packaging Goods', value: 12000, color: '#8b5cf6' }
    ];
  }, [analyticsData]);

  // ── Calculated Summaries for Right Side Info Cards ──
  const dailyTotals = useMemo(() => {
    const totalQty = dailyOutputData.reduce((acc, curr) => acc + Number(curr.qty || 0), 0);
    const totalWeight = dailyOutputData.reduce((acc, curr) => acc + Number(curr.weight || 0), 0);
    const sorted = [...dailyOutputData].sort((a, b) => b.qty - a.qty);
    const topItem = sorted[0] || { day: 'N/A', qty: 0 };
    const topPercent = totalQty > 0 ? ((topItem.qty / totalQty) * 100).toFixed(0) : 0;

    return {
      totalQty,
      totalWeight: Number(totalWeight.toFixed(2)),
      topItem,
      topPercent
    };
  }, [dailyOutputData]);

  const categoryTotals = useMemo(() => {
    const totalVolume = categoryVolumeData.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
    const sorted = [...categoryVolumeData].sort((a, b) => b.value - a.value);
    const topItem = sorted[0] || { name: 'N/A', value: 0 };
    const topPercent = totalVolume > 0 ? ((topItem.value / totalVolume) * 100).toFixed(0) : 0;

    return {
      totalVolume,
      topItem,
      topPercent
    };
  }, [categoryVolumeData]);

  // ── Machine Utilization & Efficiency Matrix ──
  const machineList = useMemo(() => {
    if (analyticsData?.machines && Array.isArray(analyticsData.machines) && analyticsData.machines.length > 0) {
      return analyticsData.machines.map((m, idx) => ({
        id: m.id || `MC-0${idx + 1}`,
        name: m.name || `Mixer Machine ${idx + 1}`,
        line: m.line || `Line ${String.fromCharCode(65 + idx)}`,
        efficiency: m.efficiency,
        runtime: m.runtime || (m.efficiency * 0.22).toFixed(1),
        downtime: m.downtime || ((100 - m.efficiency) * 0.05).toFixed(1),
        operator: m.operator || `Operator ${idx + 1}`
      }));
    }
    return [
      { id: 'MC-01', name: 'High-Speed Paper Coater', line: 'Line A (Coating)', efficiency: 95, runtime: '20.5', downtime: '0.8', operator: 'Rajesh Patel' },
      { id: 'MC-04', name: 'Chemical Planetary Mixer', line: 'Line B (Mixing)', efficiency: 88, runtime: '18.2', downtime: '1.2', operator: 'Suresh Kumar' },
      { id: 'MC-07', name: 'Hydraulic Flap Disc Press', line: 'Line C (Assembly)', efficiency: 76, runtime: '15.4', downtime: '3.5', operator: 'Vikram Singh' },
      { id: 'MC-09', name: 'Automated Tunnel Oven', line: 'Line D (Curing)', efficiency: 91, runtime: '19.0', downtime: '1.0', operator: 'Amit Shah' }
    ];
  }, [analyticsData]);

  // Export CSV
  const handleExportCSV = () => {
    const lines = [
      'PRODUCTION ANALYTICS REPORT',
      `Timeframe: ${globalTimeframe}`,
      `Generated Date: ${new Date().toISOString().slice(0, 10)}`,
      '',
      'DAILY PRODUCTION OUTPUT (QTY VS WEIGHT)',
      'Date,Qty (Pcs),Weight (Tons)',
      ...dailyOutputData.map(d => `"${d.day}",${d.qty},${d.weight}`),
      '',
      'CATEGORY WISE VOLUME DISTRIBUTION',
      'Category,Volume (Pcs)',
      ...categoryVolumeData.map(c => `"${c.name}",${c.value}`),
      '',
      'MACHINE UTILIZATION & EFFICIENCY MATRIX',
      'Machine ID,Name,Line,Efficiency %,Runtime (Hrs),Downtime (Hrs),Operator',
      ...machineList.map(m => `"${m.id}","${m.name}","${m.line}",${m.efficiency},${m.runtime},${m.downtime},"${m.operator}"`)
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Production_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Production Analytics
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Deep dive into production output, machine utilization, and shift efficiency
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchProductionAnalytics}
            disabled={loading}
            style={{ background: '#ffffff', color: '#0284c7', border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Refresh Sync'}
          </button>
          <button
            onClick={handleExportCSV}
            style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── Global Timeframe Filter Bar ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#0284c7" />
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>Global Timeframe:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {['Today', 'This Week', 'This Month', 'This Quarter', 'Custom'].map((tf) => {
            const isActive = globalTimeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setGlobalTimeframe(tf)}
                style={{
                  background: isActive ? '#0284c7' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tf}
              </button>
            );
          })}

          {globalTimeframe === 'Custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Top Executive KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🏭 Total Volume Output</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>
            {analyticsData?.kpis?.totalVolume ? `${Number(analyticsData.kpis.totalVolume).toLocaleString()} Pcs` : '52,700 Pcs'}
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>{analyticsData?.kpis?.volumeGrowth || '+8.4%'} vs last timeframe</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚖️ Total Production Weight</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>
            {analyticsData?.kpis?.totalWeight ? `${Number(analyticsData.kpis.totalWeight).toLocaleString()} Tons` : '74.1 Tons'}
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>Weight output ledger</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚡ First Pass Yield (FPY)</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed', margin: '4px 0' }}>
            {analyticsData?.kpis?.fpyRate ? `${analyticsData.kpis.fpyRate}%` : '97.4%'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Quality pass rate</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚙️ Machine Efficiency</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#b45309', margin: '4px 0' }}>
            {analyticsData?.kpis?.machineEfficiency ? `${analyticsData.kpis.machineEfficiency}%` : '87.5%'}
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>{analyticsData?.kpis?.activeLinesCount || 4} Active Production Lines</div>
        </div>
      </div>

      {/* ── 2 Main Charts Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Chart 1: Daily Production Output (Qty vs Weight) */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#0284c7" /> Daily Production Output (Qty vs Weight)
            </h3>
            
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
              <button
                onClick={() => setDailyChartType('pie')}
                style={{
                  background: dailyChartType === 'pie' ? '#0284c7' : 'transparent',
                  color: dailyChartType === 'pie' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: dailyChartType === 'pie' ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                🍩 Pie Chart
              </button>
              <button
                onClick={() => setDailyChartType('composed')}
                style={{
                  background: dailyChartType === 'composed' ? '#0284c7' : 'transparent',
                  color: dailyChartType === 'composed' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: dailyChartType === 'composed' ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                📊 Bar &amp; Combo
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: '290px', minHeight: '290px', position: 'relative' }}>
            {mounted && dailyChartType === 'pie' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', height: '290px' }}>
                <div style={{ flex: '1', minWidth: '180px', height: '290px' }}>
                  <ResponsiveChartBox height={290}>
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={dailyOutputData}
                        dataKey="qty"
                        nameKey="day"
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        isAnimationActive={true}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {dailyOutputData.map((entry, index) => (
                          <Cell key={`cell-daily-pie-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '10px', color: '#fff', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}
                        formatter={(val) => [`${Number(val).toLocaleString()} Pcs`, 'Quantity Output']}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                        formatter={(value) => <span style={{ color: '#334155', fontWeight: 700 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveChartBox>
                </div>

                {/* Right Side Info Breakdown Card */}
                <div style={{ width: '200px', minWidth: '180px', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '280px', boxSizing: 'border-box' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={14} /> Output Info Card
                    </div>

                    <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>Total Volume</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#0284c7' }}>{dailyTotals.totalQty.toLocaleString()} Pcs</div>
                      <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', marginTop: '2px' }}>⚖️ {dailyTotals.totalWeight} Tons</div>
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Daily Breakdown:</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto', paddingRight: '2px' }}>
                      {dailyOutputData.map((d, idx) => {
                        const pct = dailyTotals.totalQty > 0 ? ((d.qty / dailyTotals.totalQty) * 100).toFixed(0) : 0;
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                              <span style={{ fontWeight: '700', color: '#1e293b' }}>{d.day}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '800', color: '#334155' }}>{d.qty.toLocaleString()}</span>
                              <span style={{ fontSize: '10px', fontWeight: '800', background: `${d.color}15`, color: d.color, padding: '1px 5px', borderRadius: '4px' }}>{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ paddingTop: '6px', borderTop: '1px solid #e2e8f0', fontSize: '10.5px', color: '#059669', fontWeight: '800' }}>
                    🏆 Peak Day: {dailyTotals.topItem.day} ({dailyTotals.topPercent}%)
                  </div>
                </div>
              </div>
            )}

            {mounted && dailyChartType === 'composed' && (
              <ResponsiveChartBox height={290}>
                <ComposedChart data={dailyOutputData} margin={{ top: 25, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#0284c7" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#059669" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '10px', color: '#fff', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="qty" name="Quantity Output (Pcs)" radius={[6, 6, 0, 0]} isAnimationActive={true}>
                    {dailyOutputData.map((entry, index) => (
                      <Cell key={`cell-daily-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="qty" position="top" formatter={(val) => Number(val).toLocaleString()} style={{ fontSize: '10.5px', fontWeight: '800', fill: '#1e293b' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} name="Total Weight (Tons)" isAnimationActive={true} />
                </ComposedChart>
              </ResponsiveChartBox>
            )}
          </div>
        </div>

        {/* Chart 2: Category Wise Volume Distribution */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#10b981" /> Category Wise Volume Distribution
            </h3>
            
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
              <button
                onClick={() => setCategoryChartType('pie')}
                style={{
                  background: categoryChartType === 'pie' ? '#0284c7' : 'transparent',
                  color: categoryChartType === 'pie' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: categoryChartType === 'pie' ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                🍩 Pie Chart
              </button>
              <button
                onClick={() => setCategoryChartType('bar')}
                style={{
                  background: categoryChartType === 'bar' ? '#0284c7' : 'transparent',
                  color: categoryChartType === 'bar' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: categoryChartType === 'bar' ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                📊 Bar Chart
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: '290px', minHeight: '290px', position: 'relative' }}>
            {mounted && categoryChartType === 'pie' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', height: '290px' }}>
                <div style={{ flex: '1', minWidth: '180px', height: '290px' }}>
                  <ResponsiveChartBox height={290}>
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={categoryVolumeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        isAnimationActive={true}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryVolumeData.map((entry, index) => (
                          <Cell key={`cell-pie-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '10px', color: '#fff', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}
                        formatter={(val) => [`${Number(val).toLocaleString()} Pcs`, 'Volume']}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                        formatter={(value) => <span style={{ color: '#334155', fontWeight: 700 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveChartBox>
                </div>

                {/* Right Side Info Breakdown Card */}
                <div style={{ width: '200px', minWidth: '180px', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '280px', boxSizing: 'border-box' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={14} /> Category Info Card
                    </div>

                    <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>Total Volume</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#10b981' }}>{categoryTotals.totalVolume.toLocaleString()} Pcs</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginTop: '2px' }}>{categoryVolumeData.length} Product Categories</div>
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Category Share:</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto', paddingRight: '2px' }}>
                      {categoryVolumeData.map((c, idx) => {
                        const pct = categoryTotals.totalVolume > 0 ? ((c.value / categoryTotals.totalVolume) * 100).toFixed(0) : 0;
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                              <span style={{ fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{c.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '800', color: '#334155' }}>{c.value.toLocaleString()}</span>
                              <span style={{ fontSize: '10px', fontWeight: '800', background: `${c.color}15`, color: c.color, padding: '1px 5px', borderRadius: '4px' }}>{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ paddingTop: '6px', borderTop: '1px solid #e2e8f0', fontSize: '10.5px', color: '#0284c7', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    🏆 Top: {categoryTotals.topItem.name} ({categoryTotals.topPercent}%)
                  </div>
                </div>
              </div>
            )}

            {mounted && categoryChartType === 'bar' && (
              <ResponsiveChartBox height={290}>
                <BarChart data={categoryVolumeData} margin={{ top: 25, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} interval={0} angle={-15} textAnchor="end" height={45} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '10px', color: '#fff', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}
                    formatter={(val) => [`${Number(val).toLocaleString()} Pcs`, 'Volume']}
                  />
                  <Bar dataKey="value" name="Volume (Pcs)" radius={[6, 6, 0, 0]} isAnimationActive={true}>
                    {categoryVolumeData.map((entry, index) => (
                      <Cell key={`cell-cat-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(val) => Number(val).toLocaleString()} style={{ fontSize: '11px', fontWeight: '800', fill: '#0f172a' }} />
                  </Bar>
                </BarChart>
              </ResponsiveChartBox>
            )}
          </div>
        </div>

      </div>

      {/* ── Machine Utilization & Shift Efficiency Matrix ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="#7c3aed" /> Machine Utilization &amp; Shift Efficiency Matrix
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Machine ID</th>
                <th style={{ padding: '10px 12px' }}>Machine Name</th>
                <th style={{ padding: '10px 12px' }}>Production Line</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Efficiency %</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Runtime (Hrs)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Downtime (Hrs)</th>
                <th style={{ padding: '10px 12px' }}>Operator</th>
              </tr>
            </thead>
            <tbody>
              {machineList.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '800', fontFamily: 'monospace', color: '#7c3aed' }}>{m.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{m.name}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{m.line}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: m.efficiency >= 90 ? '#15803d' : m.efficiency >= 80 ? '#0284c7' : '#b91c1c' }}>
                    {m.efficiency}%
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>{m.runtime} hrs</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: '700' }}>{m.downtime} hrs</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{m.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dispatch & Logistics Telemetry Matrix ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="#0284c7" /> Dispatch &amp; Logistics Telemetry
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>Ready for Dispatch</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>
              {dashboardData?.dispatch?.readyForDispatch || 0} Orders
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>Fleet Status</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b' }}>
              {dashboardData?.dispatch?.vehicleStatus || '4/5 Active'}
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>On-Time Dispatch SLA</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>
              {analyticsData?.kpis?.onTimeSla || dashboardData?.dispatch?.onTimeSla || '98.2%'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
