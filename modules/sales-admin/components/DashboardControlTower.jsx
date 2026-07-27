import { useMemo } from 'react';
import { ChevronDown, Settings, ChevronRight, MoreVertical, TrendingUp, HelpCircle, AlertCircle, ArrowUpRight, Target, ShieldAlert, Activity } from 'lucide-react';
import { getColor } from '../services/analyticsService';
import { ChartContainer, ChartTooltip } from '@/components/ui/line-charts-9';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function DashboardControlTower({ state, performers, filters, setFilters }) {
  // Aggregate KPIs
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalTarget = 0;
    let totalReceived = 0;
    let totalLeadsCount = 0;
    let totalOrdersCount = 0;

    performers.forEach(p => {
      totalRevenue += p.revenue;
      totalTarget += p.target;
      totalReceived += p.received;
      totalLeadsCount += (p.leadsCount || 0);
      totalOrdersCount += (p.ordersCount || 0);
    });

    const totalGap = Math.max(0, totalTarget - totalRevenue);
    const achievementPercent = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;
    const paymentEfficiency = totalRevenue > 0 ? (totalReceived / totalRevenue) * 100 : 100;
    
    // Funnel counts from state + baselines
    const funnelLeads = (state.sales?.leads || []).length + 10000;
    const funnelSamples = (state.sales?.samples || []).length + 5200;
    const funnelQuotations = (state.sales?.quotations || []).length + 2500;
    const funnelOrders = (state.sales?.orders || []).length + 1000;

    // Overall conversion rate
    const overallConversion = funnelLeads > 0 ? (funnelOrders / funnelLeads) * 100 : 0;
    const quoteToOrderConversion = funnelQuotations > 0 ? (funnelOrders / funnelQuotations) * 100 : 0;
    
    // Average deal size
    const avgDealSize = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;

    const dropoffLeadToSample = funnelLeads > 0 ? (100 - (funnelSamples / funnelLeads) * 100) : 0;
    const dropoffSampleToQuote = funnelSamples > 0 ? (100 - (funnelQuotations / funnelSamples) * 100) : 0;
    const dropoffQuoteToOrder = funnelQuotations > 0 ? (100 - (funnelOrders / funnelQuotations) * 100) : 0;

    // Performers sorted by gap descending (only those with target > 0)
    const gapPerformers = [...performers]
      .filter(p => p.target > 0)
      .sort((a, b) => b.gap - a.gap);

    return {
      totalRevenue,
      totalTarget,
      totalGap,
      achievementPercent,
      paymentEfficiency,
      overallConversion,
      quoteToOrderConversion,
      avgDealSize,
      funnelLeads,
      funnelSamples,
      funnelQuotations,
      funnelOrders,
      dropoffLeadToSample,
      dropoffSampleToQuote,
      dropoffQuoteToOrder,
      gapPerformers
    };
  }, [performers, state.sales?.leads, state.sales?.samples, state.sales?.quotations, state.sales?.orders]);

  const top3 = useMemo(() => {
    return [...performers].slice(0, 3);
  }, [performers]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarGradient = (name) => {
    if (name.includes('Carter')) return 'linear-gradient(135deg, #f5a06a, #e07040)';
    if (name.includes('Connor')) return 'linear-gradient(135deg, #70c080, #40a060)';
    return 'linear-gradient(135deg, #70a0e8, #4070c8)';
  };

  const formatCurrency = (val) => {
    if (val >= 10000000) {
      return `₹${parseFloat((val / 10000000).toFixed(2))} Cr`;
    }
    if (val >= 100000) {
      return `₹${parseFloat((val / 100000).toFixed(2))} L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Setup monthly chart data based on target and dynamic sales
  // June is the active month (aligned to Simulation Date: June 15)
  const chartData = [
    { name: 'Apr', value: 35, active: false },
    { name: 'May', value: 48, active: false },
    { name: 'Jun', value: Math.round(stats.achievementPercent), active: true },
    { name: 'Jul', value: 68, active: false },
    { name: 'Aug', value: 58, active: false },
    { name: 'Sep', value: 50, active: false },
    { name: 'Oct', value: 45, active: false },
    { name: 'Nov', value: 40, active: false },
    { name: 'Dec', value: 30, active: false }
  ];

  const growthTrendData = useMemo(() => {
    return [
      { date: 'Jun 1', revenue: Math.round(stats.totalRevenue * 0.15), target: Math.round(stats.totalTarget * 0.1) },
      { date: 'Jun 3', revenue: Math.round(stats.totalRevenue * 0.28), target: Math.round(stats.totalTarget * 0.2) },
      { date: 'Jun 5', revenue: Math.round(stats.totalRevenue * 0.42), target: Math.round(stats.totalTarget * 0.3) },
      { date: 'Jun 7', revenue: Math.round(stats.totalRevenue * 0.55), target: Math.round(stats.totalTarget * 0.4) },
      { date: 'Jun 9', revenue: Math.round(stats.totalRevenue * 0.68), target: Math.round(stats.totalTarget * 0.5) },
      { date: 'Jun 11', revenue: Math.round(stats.totalRevenue * 0.82), target: Math.round(stats.totalTarget * 0.6) },
      { date: 'Jun 13', revenue: Math.round(stats.totalRevenue * 0.92), target: Math.round(stats.totalTarget * 0.7) },
      { date: 'Jun 15', revenue: stats.totalRevenue, target: Math.round(stats.totalTarget * 0.8) }
    ];
  }, [stats.totalRevenue, stats.totalTarget]);

  const growthChartConfig = {
    revenue: {
      label: 'Achieved Sales',
      color: 'var(--accent)',
    },
    target: {
      label: 'Allocated Target',
      color: '#10b981',
    }
  };

  const funnelPieConfig = {
    leads: {
      label: 'CRM Leads',
      color: '#38bdf8',
    },
    samples: {
      label: 'Samples Approved',
      color: '#a78bfa',
    },
    quotes: {
      label: 'Quotations Drafted',
      color: '#fb923c',
    },
    orders: {
      label: 'Confirmed Orders',
      color: '#4ade80',
    }
  };

  const funnelPieData = useMemo(() => {
    return [
      { stage: 'leads', value: stats.funnelLeads, fill: '#38bdf8' },
      { stage: 'samples', value: stats.funnelSamples, fill: '#a78bfa' },
      { stage: 'quotes', value: stats.funnelQuotations, fill: '#fb923c' },
      { stage: 'orders', value: stats.funnelOrders, fill: '#4ade80' }
    ];
  }, [stats.funnelLeads, stats.funnelSamples, stats.funnelQuotations, stats.funnelOrders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* ── HEADER TITLE SECTION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', width: '100%' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--accent)' }} /> Sales Control Tower
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Enterprise KPI Overview & Real-Time Performance Assessment
          </span>
        </div>
        <div style={{ background: 'var(--bg-elevated)', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', border: '1px solid var(--border-soft)', color: 'var(--text-secondary)' }}>
          Simulation Active • <strong style={{ color: 'var(--text-primary)' }}>June 15, 2026</strong>
        </div>
      </div>

      {/* Standalone KPI Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        width: '100%',
        marginBottom: '24px'
      }}>
        {/* Card 1: Total Revenue */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', borderLeft: '4px solid #337a86' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Revenue</span>
          <strong style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(stats.totalRevenue)}</strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Closed sales value</span>
        </div>

        {/* Card 2: Total Target */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Target</span>
          <strong style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(stats.totalTarget)}</strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Allocated quotas</span>
        </div>

        {/* Card 3: Total Gap */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Gap ❌</span>
          <strong style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(stats.totalGap)}</strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Shortfall remaining</span>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Conversion Rate</span>
          <strong style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.overallConversion.toFixed(1)}%</strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Leads to orders conversion</span>
        </div>

        {/* Card 5: Payment Efficiency */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', borderLeft: '4px solid #7a3a9a' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Payment Efficiency</span>
          <strong style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.paymentEfficiency.toFixed(1)}%</strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Total payments collected</span>
        </div>

        {/* Card 6: Avg Deal Size */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Avg Deal Size</span>
          <strong style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(stats.avgDealSize)}</strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Average contract amount</span>
        </div>
      </div>

      {/* ── MIDDLE ROW: 2-COLUMN DASHBOARD GRID ── */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        
        {/* ── COLUMN 1 ── */}
        <div className="grid-column">
          
          {/* Growth Widget */}
          <div className="app-card growth-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '580px', justifyContent: 'space-between' }}>
            <div className="card-top-bar" style={{ marginBottom: 0 }}>
              <h2 className="card-heading" style={{ fontSize: '15px', fontWeight: '800' }}>Growth</h2>
              <button className="card-dropdown-pill">
                <span>Monthly</span>
                <ChevronDown size={10} strokeWidth={3} />
              </button>
            </div>

            <div style={{ flex: 1, minHeight: '220px', width: '100%', minWidth: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {/* Target Achievement summary KPI inside chart section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-baseline', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  {Math.round(stats.achievementPercent)}%
                </span>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', background: 'rgba(22, 163, 74, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                  Target achievement
                </span>
              </div>

              {/* Line Chart */}
              <ChartContainer
                config={growthChartConfig}
                style={{ height: '260px', width: '100%' }}
              >
                <ComposedChart
                  data={growthTrendData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 8"
                    stroke="rgba(0,0,0,0.05)"
                    horizontal={true}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                    tickMargin={8}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    tickMargin={8}
                    width={65}
                  />

                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', boxShadow: 'var(--shadow-premium)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{payload[0].payload.date}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Sales:</span>
                                <strong style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(payload[0].payload.revenue)}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px' }}>
                                <span style={{ color: '#10b981', fontWeight: '600' }}>Target:</span>
                                <strong style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(payload[0].payload.target)}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    fill="url(#growthAreaGradient)"
                    stroke="none"
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'white', strokeWidth: 1.5 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="target"
                    name="target"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </div>

            <div style={{ 
              borderTop: '1px solid rgba(0,0,0,0.08)', 
              paddingTop: '16px', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
              gap: '16px 24px' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Overall Target</span>
                <strong style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{formatCurrency(stats.totalTarget)}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total Achieved</span>
                <strong style={{ fontSize: '14.5px', fontWeight: '800', color: '#16a34a' }}>{formatCurrency(stats.totalRevenue)}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Remaining Gap</span>
                <strong style={{ fontSize: '14.5px', fontWeight: '800', color: stats.totalGap > 0 ? '#dc2626' : '#16a34a' }}>
                  {stats.totalGap > 0 ? formatCurrency(stats.totalGap) : 'Completed 🎉'}
                </strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Collection Ratio</span>
                <strong style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.paymentEfficiency.toFixed(1)}%</strong>
              </div>
            </div>
          </div>

        </div>

        {/* ── COLUMN 2 ── */}
        <div className="grid-column">
          
          {/* Monthly Revenue Bar Chart */}
          <div className="app-card" style={{ padding: '24px', height: '330px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-top-bar" style={{ marginBottom: 0 }}>
              <h2 className="card-heading" style={{ fontSize: '15px', fontWeight: '800' }}>Monthly Revenue</h2>
              <button className="card-dropdown-pill">
                <span>Monthly</span>
                <ChevronDown size={10} strokeWidth={3} />
              </button>
            </div>

            {/* Bar Chart Canvas area */}
            <div style={{ display: 'flex', height: '180px', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 10px 0 10px', position: 'relative' }}>
              
              {/* Y Axis Guide Lines */}
              <div style={{ position: 'absolute', left: 0, right: 0, top: 20, borderTop: '1px dashed rgba(0,0,0,0.08)' }}></div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 70, borderTop: '1px dashed rgba(0,0,0,0.08)' }}></div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 120, borderTop: '1px dashed rgba(0,0,0,0.08)' }}></div>

              {chartData.map((d) => {
                const barHeight = `${Math.min(100, d.value)}%`;
                return (
                  <div key={d.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                    <div style={{ height: '130px', display: 'flex', alignItems: 'flex-end', width: '22px' }}>
                      <div 
                        title={`${d.name}: ${d.value}%`}
                        style={{ 
                          width: '100%', 
                          height: barHeight, 
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.4s ease',
                          background: d.active 
                            ? 'var(--accent)' 
                            : 'rgba(16, 185, 129, 0.15)'
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '8px', fontWeight: d.active ? 'bold' : 'normal' }}>
                      {d.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performers & Success Rate */}
          <div style={{ display: 'flex', gap: '20px', height: '230px' }}>
            
            {/* Top Performers (Elevated Card) */}
            <div className="card-solid" style={{ 
              flex: 1, 
              background: 'var(--bg-elevated)', 
              color: 'var(--text-primary)', 
              padding: '20px', 
              border: '1px solid var(--border-soft)', 
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '800' }}>Top Performers</span>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '2px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', background: '#2F4375', color: '#fff', padding: '3px 8px', borderRadius: '6px' }}>All Time</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', marginLeft: '2px' }}>This year</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {top3.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '30px', 
                        height: '30px', 
                        borderRadius: '50%', 
                        background: getAvatarGradient(p.name), 
                        color: '#000', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: '800', 
                        fontSize: '11px' 
                      }}>
                        {getInitials(p.name)}
                      </div>
                      <div>
                        <span style={{ fontSize: '11.5px', fontWeight: 'bold', display: 'block', lineHeight: '1.2' }}>{p.name}</span>
                        <span style={{ fontSize: '9px', color: '#888' }}>{p.role}</span>
                      </div>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Success & Conversion Rates Card */}
            <div className="app-card" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Conversion Rates</span>
                <span style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>Overall Metrics</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '16px', flex: 1 }}>
                
                {/* Lead → Order Circular Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '84px', height: '84px' }}>
                    <svg width="84" height="84" viewBox="0 0 84 84">
                      {/* Track */}
                      <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="6" />
                      {/* Progress */}
                      <circle 
                        cx="42" 
                        cy="42" 
                        r="36" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="6" 
                        strokeDasharray={226.2} 
                        strokeDashoffset={226.2 - (226.2 * Math.min(100, stats.overallConversion)) / 100} 
                        strokeLinecap="round" 
                        transform="rotate(-90 42 42)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                      />
                    </svg>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, left: 0, right: 0, bottom: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '14px',
                      color: 'var(--color-text-primary)'
                    }}>
                      {stats.overallConversion.toFixed(1)}%
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                    Lead → Order
                  </span>
                </div>

                {/* Quote → Order Circular Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '84px', height: '84px' }}>
                    <svg width="84" height="84" viewBox="0 0 84 84">
                      {/* Track */}
                      <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(51, 122, 134, 0.08)" strokeWidth="6" />
                      {/* Progress */}
                      <circle 
                        cx="42" 
                        cy="42" 
                        r="36" 
                        fill="none" 
                        stroke="var(--accent)" 
                        strokeWidth="6" 
                        strokeDasharray={226.2} 
                        strokeDashoffset={226.2 - (226.2 * Math.min(100, stats.quoteToOrderConversion)) / 100} 
                        strokeLinecap="round" 
                        transform="rotate(-90 42 42)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                      />
                    </svg>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, left: 0, right: 0, bottom: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '14px',
                      color: 'var(--color-text-primary)'
                    }}>
                      {stats.quoteToOrderConversion.toFixed(1)}%
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                    Quote → Order
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── BOTTOM ROW: FUNNEL & TARGET GAP TABLE ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        marginTop: '24px',
        width: '100%'
      }}>
        {/* Funnel Widget */}
        <div className="app-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', minHeight: '340px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', textTransform: 'uppercase', margin: 0 }}>
              CRM Sales Conversion Funnel
            </h4>
            <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
              Drop-offs and conversion analysis between pipeline stages
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '20px 0 10px 0', flex: 1 }}>
            
            {/* Left Column: Pie Chart volume distribution */}
            <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChartContainer config={funnelPieConfig} style={{ width: '100%', height: '100%' }}>
                <PieChart width={130} height={130}>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', fontSize: '10px', boxShadow: 'var(--shadow-premium)' }}>
                            <span style={{ fontWeight: '700', color: data.fill }}>{funnelPieConfig[data.stage]?.label}</span>: <strong>{data.value.toLocaleString()}</strong>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={funnelPieData}
                    dataKey="value"
                    nameKey="stage"
                    innerRadius={20}
                    outerRadius={50}
                    paddingAngle={3}
                    cornerRadius={4}
                  >
                    {funnelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Right Column: Text Details and progress bars */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Stage 1: Leads */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '100%', 
                  background: 'rgba(56, 189, 248, 0.08)', 
                  border: '1px solid rgba(56, 189, 248, 0.25)', 
                  borderRadius: '8px', 
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#0284c7' }}>1. CRM Leads</span>
                  <strong>{stats.funnelLeads}</strong>
                </div>
              </div>

              {/* Stage 2: Samples */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '80%', 
                  background: 'rgba(167, 139, 250, 0.08)', 
                  border: '1px solid rgba(167, 139, 250, 0.25)', 
                  borderRadius: '8px', 
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#6d28d9' }}>2. Samples Approved</span>
                  <strong>{stats.funnelSamples}</strong>
                </div>
                <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: '800', whiteSpace: 'nowrap' }}>
                  ↓ {stats.dropoffLeadToSample.toFixed(0)}%
                </span>
              </div>

              {/* Stage 3: Quotations */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '65%', 
                  background: 'rgba(251, 146, 60, 0.08)', 
                  border: '1px solid rgba(251, 146, 60, 0.25)', 
                  borderRadius: '8px', 
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#c2410c' }}>3. Quotations Drafted</span>
                  <strong>{stats.funnelQuotations}</strong>
                </div>
                <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: '800', whiteSpace: 'nowrap' }}>
                  ↓ {stats.dropoffSampleToQuote.toFixed(0)}%
                </span>
              </div>

              {/* Stage 4: Orders */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '50%', 
                  background: 'rgba(74, 222, 128, 0.08)', 
                  border: '1px solid rgba(74, 222, 128, 0.25)', 
                  borderRadius: '8px', 
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#15803d' }}>4. Confirmed Orders</span>
                  <strong>{stats.funnelOrders}</strong>
                </div>
                <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: '800', whiteSpace: 'nowrap' }}>
                  ↓ {stats.dropoffQuoteToOrder.toFixed(0)}%
                </span>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Conversion Rate: <strong>{stats.overallConversion.toFixed(1)}%</strong></span>
            <span>Total leakage: <strong>{(100 - stats.overallConversion).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Target Gap Table */}
        <div className="app-card" style={{ padding: '24px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', textTransform: 'uppercase', margin: 0 }}>
              Target Gap & Performance Deficits (Loss Creators)
            </h4>
            <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
              Roster sorted by remaining target gap to prioritize recovery actions
            </span>
          </div>

          <div style={{ overflowX: 'auto', margin: '15px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  <th style={{ padding: '8px 0' }}>Salesperson</th>
                  <th style={{ padding: '8px' }}>Target</th>
                  <th style={{ padding: '8px' }}>Achieved</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Target Gap</th>
                </tr>
              </thead>
              <tbody>
                {stats.gapPerformers.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', fontSize: '12.5px' }}>
                    <td style={{ padding: '10px 0' }}>
                      <strong style={{ display: 'block' }}>{p.name}</strong>
                      <span style={{ fontSize: '9px', color: '#888' }}>{p.role} • Achievement: {p.achievement.toFixed(0)}%</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>{formatCurrency(p.target)}</td>
                    <td style={{ padding: '10px 8px', color: '#16a34a', fontWeight: 'bold' }}>{formatCurrency(p.revenue)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: p.gap > 0 ? '#ef4444' : '#16a34a', fontWeight: 'bold' }}>
                      {p.gap > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <AlertCircle size={12} style={{ color: '#ef4444' }} /> {formatCurrency(p.gap)}
                        </span>
                      ) : (
                        'Target Met'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '11.5px', color: '#ef4444', fontWeight: '800' }}>
            ⚠️ Total deficit to clear: {formatCurrency(stats.totalGap)}
          </div>
        </div>
      </div>

    </div>
  );
}
