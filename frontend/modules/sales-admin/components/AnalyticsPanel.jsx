import { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Landmark, Activity, Layers } from 'lucide-react';

export default function AnalyticsPanel({ state, performers, filters }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 1. Product Segment Data
  const productData = useMemo(() => {
    return [
      { name: 'Alloy Brackets', value: 5600000, color: '#38bdf8' },
      { name: 'Concrete Cylinders', value: 2800000, color: '#a78bfa' },
      { name: 'Heavy Gears', value: 1250000, color: '#4ade80' },
      { name: 'Steel casings', value: 400000, color: '#fb923c' }
    ];
  }, []);

  const totalProductValue = useMemo(() => {
    return productData.reduce((sum, p) => sum + p.value, 0);
  }, [productData]);

  // 2. Payments distribution variables
  const paymentsStats = useMemo(() => {
    let paid = 13000000;
    let outstanding = 3000000;

    performers.forEach(p => {
      paid += p.received;
      outstanding += (p.revenue - p.received);
    });

    const total = paid + outstanding;
    const paidPct = total > 0 ? (paid / total) * 100 : 100;
    const outstandingPct = 100 - paidPct;

    return { paid, outstanding, total, paidPct, outstandingPct };
  }, [performers]);

  // 3. Scaled Enterprise Funnel (10,000 leads down to 1,000 orders)
  const funnelData = useMemo(() => {
    return [
      { stage: '1. Total Leads', count: 10000, pct: 100, color: '#38bdf8' },
      { stage: '2. Samples Sent', count: 5200, pct: 52, color: '#a78bfa' },
      { stage: '3. Quotes Shared', count: 2500, pct: 25, color: '#fb923c' },
      { stage: '4. Closed Orders', count: 1000, pct: 10, color: '#4ade80' }
    ];
  }, []);

  // 4. Monthly Trend Data (Revenue growth)
  const trendData = [
    { month: 'Apr', revenue: 120, target: 150 },
    { month: 'May', revenue: 180, target: 200 },
    { month: 'Jun', revenue: 220, target: 220 },
    { month: 'Jul', revenue: 280, target: 250 },
    { month: 'Aug', revenue: 310, target: 280 },
    { month: 'Sep', revenue: 360, target: 300 }
  ];

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* ── TOP SECTION: LINE CHART & COMPARISON BAR CHART ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* 📈 1. REVENUE TREND (Line Chart) */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', height: '340px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={15} color="var(--color-primary)" /> Monthly Revenue Trend (Growth Index)
            </h4>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '3px' }}>
              Comparison of closed sales contract revenue vs monthly target targets (Lakhs)
            </span>
          </div>

          {/* SVG Line Graph */}
          <div style={{ height: '200px', width: '100%', position: 'relative', marginTop: '10px' }}>
            <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />

              {/* Target Line (Dotted Blue) */}
              <path 
                d="M 40 125 L 128 100 L 216 90 L 304 75 L 392 60 L 480 50" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
              />

              {/* Area Under Path */}
              <path 
                d="M 40 140 L 40 137 L 128 100 L 216 80 L 304 50 L 392 35 L 480 20 L 480 140 Z" 
                fill="url(#areaGradient)" 
              />

              {/* Revenue Line (Solid Emerald) */}
              <path 
                d="M 40 137 L 128 100 L 216 80 L 304 50 L 392 35 L 480 20" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
                filter="url(#glow)"
              />

              {/* Clickable/Hoverable Points */}
              {trendData.map((d, i) => {
                const x = 40 + i * 88;
                // Map revenue coordinates (higher revenue = smaller y value)
                const y = 140 - (d.revenue / 400) * 120;
                return (
                  <g key={d.month} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredPoint({ x, y, ...d })} onMouseLeave={() => setHoveredPoint(null)}>
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={hoveredPoint?.month === d.month ? "6" : "4"} 
                      fill="#4ade80" 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                    />
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {trendData.map((d, i) => (
                <text key={d.month} x={40 + i * 88} y="155" fill="var(--text-secondary)" fontSize="10" textAnchor="middle">
                  {d.month}
                </text>
              ))}

              {/* Y Axis Legend */}
              <text x="35" y="24" fill="var(--text-muted)" fontSize="9" textAnchor="end">300L</text>
              <text x="35" y="74" fill="var(--text-muted)" fontSize="9" textAnchor="end">150L</text>
              <text x="35" y="124" fill="var(--text-muted)" fontSize="9" textAnchor="end">0L</text>

              {/* Tooltip Popup */}
              {hoveredPoint && (
                <g>
                  <rect 
                    x={hoveredPoint.x - 50} 
                    y={hoveredPoint.y - 40} 
                    width="100" 
                    height="30" 
                    rx="6" 
                    fill="#12161a" 
                    stroke="rgba(0,0,0,0.15)" 
                    strokeWidth="1" 
                  />
                  <text x={hoveredPoint.x} y={hoveredPoint.y - 28} fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Rev: ₹{hoveredPoint.revenue} Lakhs
                  </text>
                  <text x={hoveredPoint.x} y={hoveredPoint.y - 16} fill="#38bdf8" fontSize="8" textAnchor="middle">
                    Tgt: ₹{hoveredPoint.target}L
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '3px', background: '#10b981', borderRadius: '2px' }}></span> Revenue Clearances
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '3px', borderBottom: '2px dashed #38bdf8' }}></span> Quota Targets
            </span>
          </div>
        </div>

        {/* 📊 2. SALESPERSON PERFORMANCE COMPARISON */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', height: '340px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={15} color="var(--color-primary)" /> Salesperson Comparison (Target vs Revenue)
            </h4>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '3px' }}>
              Leaderboard target allocation vs actual dynamic revenue clearance
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
            {performers.map(p => {
              const maxVal = Math.max(...performers.map(x => Math.max(x.target, x.revenue)), 1);
              const targetWidth = (p.target / maxVal) * 100;
              const revenueWidth = (p.revenue / maxVal) * 100;

              return (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    <span>{p.name} ({p.role})</span>
                    <span style={{ color: '#16a34a' }}>{formatCurrency(p.revenue)} / {formatCurrency(p.target)}</span>
                  </div>
                  
                  {/* Target bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${targetWidth}%`, height: '100%', background: '#38bdf8', borderRadius: '3px' }}></div>
                  </div>

                  {/* Revenue bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${revenueWidth}%`, height: '100%', background: '#16a34a', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', background: '#38bdf8', borderRadius: '2px' }}></span> Quota Allocation
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '2px' }}></span> Achieved Revenue
            </span>
          </div>
        </div>

      </div>

      {/* ── MIDDLE SECTION: LARGE ENTERPRISE FUNNEL & PIE DISTRIBUTION ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* 🧠 3. FUNNEL CONVERSION (10,000 Leads to 1,000 Orders) */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', height: '340px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={15} color="var(--color-primary)" /> Funnel Conversion (Enterprise Scale)
            </h4>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '3px' }}>
              Stage drop-off scaling from 10,000 leads down to 1,000 closed orders (10% conversion)
            </span>
          </div>

          {/* Horizontal Funnel Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
            {funnelData.map(f => (
              <div key={f.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px', color: 'var(--text-primary)' }}>
                  <span>{f.stage}</span>
                  <strong>{f.count.toLocaleString()} ({f.pct}%)</strong>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: '5px' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px' }}>
            <span>Conversion Limit: <strong>10.0%</strong></span>
            <span>Unconverted Leads: <strong>9,000 (90%)</strong></span>
          </div>
        </div>

        {/* 💳 4. PAYMENT DISTRIBUTION (Pie/Donut Chart) */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', height: '340px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PieChart size={15} color="var(--color-primary)" /> Payment Clearance Share (Book Value)
            </h4>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '3px' }}>
              Clearance distribution of paid vs outstanding invoices
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '15px 0' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />
                
                {/* Paid Circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#16a34a" 
                  strokeWidth="10" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * (paymentsStats.paidPct / 100))}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{Math.round(paymentsStats.paidPct)}%</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Cleared</span>
              </div>
            </div>

            {/* Legend detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', background: '#16a34a', borderRadius: '2px' }}></span>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>Paid Clearance</span>
                  <strong>{formatCurrency(paymentsStats.paid)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', background: '#dc2626', borderRadius: '2px' }}></span>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>Outstanding Dues</span>
                  <strong>{formatCurrency(paymentsStats.outstanding)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Total Book Value: <strong>{formatCurrency(paymentsStats.total)}</strong></span>
            <span>Clearance Rating: <strong style={{ color: '#16a34a' }}>EXCELLENT</strong></span>
          </div>
        </div>

      </div>

      {/* ── BOTTOM SECTION: PRODUCT-WISE BAR & CORRELATION SCATTER ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* 📦 5. PRODUCT-WISE REVENUE */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', height: '340px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={15} color="var(--color-primary)" /> Product Segment Revenue Performance
            </h4>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
              Segment share analysis to identify high-performing inventory lines
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '15px 0' }}>
            {productData.map((prod) => {
              const pct = (prod.value / totalProductValue) * 100;
              return (
                <div key={prod.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px', color: 'var(--text-primary)' }}>
                    <span>{prod.name}</span>
                    <strong>{formatCurrency(prod.value)} ({pct.toFixed(0)}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: prod.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px' }}>
            <span>Top segment: <strong>Alloy Brackets (56%)</strong></span>
            <span>Total Catalog Output: <strong>{formatCurrency(totalProductValue)}</strong></span>
          </div>
        </div>

        {/* 📞 6. ACTIVITY VS PERFORMANCE (Scatter Plot) */}
        <div className="card-solid" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', height: '340px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={15} color="var(--color-primary)" /> Activity index vs Revenue Correlation (Scatter Plot)
            </h4>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
              Analyzes productivity index (X = Followups/Logs) vs output results (Y = Closed Revenue Lakhs)
            </span>
          </div>

          {/* SVG Scatter Plot Grid */}
          <div style={{ height: '180px', width: '100%', position: 'relative', marginTop: '10px' }}>
            <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <filter id="glow-scatter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Axes lines */}
              <line x1="40" y1="130" x2="380" y2="130" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="130" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />

              {/* Grid Lines */}
              <line x1="125" y1="20" x2="125" y2="130" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />
              <line x1="210" y1="20" x2="210" y2="130" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />
              <line x1="295" y1="20" x2="295" y2="130" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />

              <line x1="40" y1="47.5" x2="380" y2="47.5" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />
              <line x1="40" y1="75" x2="380" y2="75" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />
              <line x1="40" y1="102.5" x2="380" y2="102.5" stroke="rgba(0,0,0,0.08)" strokeDasharray="3" />

              {/* Regression Trend Line */}
              <line x1="60" y1="120" x2="360" y2="35" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="3 3" filter="url(#glow-scatter)" opacity="0.8" />

              {/* Plotted Points for Sales users */}
              {performers.map((p, idx) => {
                // Map activity index (0-100) to X (40 to 360)
                const x = 40 + (p.activityScore / 100) * 320;
                // Map revenue (up to 3 Cr / 300 Lakhs) to Y (130 to 20)
                const revLakhs = p.revenue / 100000;
                const y = 130 - (Math.min(300, revLakhs) / 300) * 110;

                const colors = ['#f5a06a', '#10b981', '#3b82f6', '#fb923c'];
                const ptColor = colors[idx % colors.length];

                return (
                  <g key={p.id}>
                    <circle cx={x} cy={y} r="6" fill={ptColor} stroke="#ffffff" strokeWidth="2" />
                    <text x={x + 10} y={y + 3} fill="var(--text-primary)" fontSize="8" fontWeight="bold">
                      {p.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Axis Labels */}
              <text x="380" y="142" fill="var(--text-muted)" fontSize="8" textAnchor="end">Follow-up Index →</text>
              <text x="-75" y="15" fill="var(--text-muted)" fontSize="8" textAnchor="middle" transform="rotate(-90)">Revenue (Lakhs) →</text>

              <text x="125" y="142" fill="var(--text-muted)" fontSize="7" textAnchor="middle">25</text>
              <text x="210" y="142" fill="var(--text-muted)" fontSize="7" textAnchor="middle">50</text>
              <text x="295" y="142" fill="var(--text-muted)" fontSize="7" textAnchor="middle">75</text>
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px' }}>
            <span>Correlation index: <strong>+0.85 (Strong Positive)</strong></span>
            <span>Interpretation: <strong>Higher engagement drives higher sales value</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
