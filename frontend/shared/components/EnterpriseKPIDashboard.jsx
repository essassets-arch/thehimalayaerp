import { useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  TrendingUp, ShoppingCart, Factory, Truck,
  CreditCard, BarChart3, AlertCircle, CheckCircle2,
  PackageCheck, Zap, Activity, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

/* ─────────────────────────────────────────────
   SVG Ring Gauge
───────────────────────────────────────────── */
function RingGauge({ pct = 0, color = '#10b981', size = 52, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Trend Badge
───────────────────────────────────────────── */
function TrendBadge({ dir, label }) {
  const cfg = {
    up:      { Icon: ArrowUpRight,   color: '#16a34a', bg: '#dcfce7' },
    down:    { Icon: ArrowDownRight, color: '#dc2626', bg: '#fee2e2' },
    neutral: { Icon: Minus,          color: '#5E6B82', bg: '#f1f5f9' },
  }[dir] || { Icon: Minus, color: '#5E6B82', bg: '#f1f5f9' };
  const { Icon, color, bg } = cfg;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '10px', fontWeight: '700', color, background: bg,
      padding: '2px 7px', borderRadius: '20px',
    }}>
      <Icon size={10} strokeWidth={3} />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   KPI Card  — light style (like reference)
───────────────────────────────────────────── */
function KPICard({ icon: Icon, iconColor, iconBg, label, value, sub, trend, trendDir }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #DCE5F0',
        borderRadius: '16px',
        padding: '18px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.10), 0 0 0 2px ${iconColor}30`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Subtle top-left accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
        background: iconColor, borderRadius: '16px 0 0 16px', opacity: 0.7,
      }} />

      {/* Row 1: label + icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingLeft: '4px' }}>
        <span style={{ fontSize: '12px', color: '#5E6B82', fontWeight: '600' }}>{label}</span>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={iconColor} strokeWidth={2.2} />
        </div>
      </div>

      {/* Row 2: big value */}
      <div style={{ paddingLeft: '4px' }}>
        <div style={{
          fontSize: '26px', fontWeight: '800', color: '#24345C',
          letterSpacing: '-0.8px', lineHeight: 1,
        }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: '11px', color: '#8893A7', marginTop: '4px', fontWeight: '500' }}>
            {sub}
          </div>
        )}
      </div>

      {/* Row 3: trend */}
      {trend !== undefined && (
        <div style={{ paddingLeft: '4px' }}>
          <TrendBadge dir={trendDir} label={trend} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Pipeline Row
───────────────────────────────────────────── */
function PipelineRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: color, flexShrink: 0
      }} />
      <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: '600', minWidth: '148px' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}bb, ${color})`,
          borderRadius: '99px',
          transition: 'width 0.9s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', minWidth: '26px', textAlign: 'right' }}>{count}</span>
      <span style={{ fontSize: '10px', color: '#8893A7', minWidth: '30px' }}>/ {total}</span>
      <span style={{
        fontSize: '10px', fontWeight: '700', color,
        background: `${color}18`, border: `1px solid ${color}40`,
        padding: '1px 7px', borderRadius: '20px', minWidth: '38px', textAlign: 'center'
      }}>
        {pct}%
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Material Stat
───────────────────────────────────────────── */
function MatStat({ value, label, color, bgColor }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '4px', padding: '12px 8px', borderRadius: '12px',
      background: bgColor || `${color}10`,
      border: `1px solid ${color}25`,
    }}>
      <span style={{ fontSize: '24px', fontWeight: '800', color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '10px', color: '#8893A7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Derive KPIs
───────────────────────────────────────────── */
function deriveKPIs(state) {
  const orders = state.orders || [];
  const workOrders = state.workOrders || [];
  const materialRequests = state.materialRequests || [];
  const dispatches = state.dispatches || [];
  const payments = state.payments || [];
  const eventStore = state.eventStore || [];

  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.totalAmount, 0);
  const outstanding = payments.filter(p => p.status !== 'Paid').reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);

  const totalOrders = orders.length;
  const closedOrders = orders.filter(o => o.status === 'Closed').length;
  const inProduction = orders.filter(o => ['In Production', 'IN_PRODUCTION'].includes(o.status)).length;
  const qcPending = orders.filter(o => ['QC Pending', 'QC_PENDING'].includes(o.status)).length;
  const qcPassed = orders.filter(o => ['QC Passed', 'QC_PASSED', 'DISPATCH_READY', 'Dispatch Created', 'DISPATCH_CREATED', 'In Transit', 'Partially Delivered', 'Dispatched', 'Delivered', 'Payment Pending', 'Payment Verified', 'Closed'].includes(o.status)).length;
  const shortageCount = orders.filter(o => ['Shortage', 'SHORTAGE'].includes(o.status)).length;

  const totalRework = workOrders.reduce((s, wo) => s + (wo.reworkCount || 0), 0);
  const qcPassRate = workOrders.length > 0
    ? Math.round(((workOrders.filter(wo => wo.reworkCount === 0).length) / workOrders.length) * 100)
    : 100;

  const totalDispatched = dispatches.length;
  const pendingDelivery = dispatches.filter(d => d.status === 'Dispatched').length;
  const delivered = dispatches.filter(d => d.status === 'Delivered').length;

  const mrPending = materialRequests.filter(m => m.status === 'Pending').length;
  const mrIssued = materialRequests.filter(m => m.status === 'Issued').length;
  const mrShortage = materialRequests.filter(m => m.status === 'Shortage').length;

  const rollbacks = eventStore.filter(e => e.action === 'TRANSACTION_ERROR').length;

  return {
    totalRevenue, outstanding, totalOrders, closedOrders, inProduction,
    qcPending, qcPassed, shortageCount, totalRework, qcPassRate,
    totalDispatched, pendingDelivery, delivered, mrPending, mrIssued, mrShortage,
    rollbacks
  };
}

/* ─────────────────────────────────────────────
   Main
───────────────────────────────────────────── */
export default function EnterpriseKPIDashboard() {
  const { state } = useERP();
  const kpi = useMemo(() => deriveKPIs(state), [state]);
  const tot = kpi.totalOrders || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>
            <BarChart3 size={16} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#24345C', letterSpacing: '-0.3px' }}>
              KPI Dashboard
            </h3>
            <span style={{ fontSize: '10px', color: '#8893A7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Enterprise Overview
            </span>
          </div>
        </div>

        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '10px', color: '#16a34a', fontWeight: '800',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          padding: '4px 12px', borderRadius: '20px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#22c55e', boxShadow: '0 0 6px #22c55e',
            animation: 'kpiPulse 1.8s ease-in-out infinite',
            display: 'inline-block',
          }} />
          LIVE
        </span>
      </div>

      {/* ── KPI Cards 2×3 ── */}
      <div className="enterprise-kpi-cards-grid">
        <KPICard
          icon={TrendingUp} iconColor="#10b981" iconBg="#d1fae5"
          label="Revenue Collected"
          value={`₹${(kpi.totalRevenue / 100000).toFixed(1)}L`}
          sub={`₹${(kpi.outstanding / 100000).toFixed(1)}L outstanding`}
          trend="Paid" trendDir="up"
        />
        <KPICard
          icon={ShoppingCart} iconColor="#0ea5e9" iconBg="#e0f2fe"
          label="Total Orders"
          value={kpi.totalOrders}
          sub={`${kpi.closedOrders} closed · ${kpi.shortageCount} shortage`}
          trend={`${kpi.closedOrders} closed`} trendDir={kpi.closedOrders > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          icon={Factory} iconColor="#a855f7" iconBg="#f3e8ff"
          label="In Production"
          value={kpi.inProduction}
          sub={`${kpi.qcPending} awaiting QC`}
          trend={kpi.inProduction > 0 ? 'Active' : 'Idle'} trendDir={kpi.inProduction > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          icon={Truck} iconColor="#8b5cf6" iconBg="#ede9fe"
          label="Dispatches"
          value={kpi.totalDispatched}
          sub={`${kpi.delivered} delivered · ${kpi.pendingDelivery} transit`}
          trend={`${kpi.delivered} Delivered`} trendDir={kpi.delivered > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          icon={CreditCard} iconColor="#f43f5e" iconBg="#ffe4e6"
          label="Outstanding"
          value={`₹${(kpi.outstanding / 100000).toFixed(1)}L`}
          sub={`${kpi.totalOrders - kpi.closedOrders} orders unclosed`}
          trend={kpi.outstanding > 0 ? 'Due' : 'Clear'} trendDir={kpi.outstanding > 0 ? 'down' : 'up'}
        />

        {/* QC Ring Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #DCE5F0',
            borderRadius: '16px',
            padding: '18px 20px 16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'default', position: 'relative', overflow: 'hidden',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.10), 0 0 0 2px rgba(234,179,8,0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Left accent stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
            background: '#eab308', borderRadius: '16px 0 0 16px', opacity: 0.7,
          }} />
          {/* Ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <RingGauge pct={kpi.qcPassRate} color="#eab308" size={56} stroke={5} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '900', color: '#854d0e'
            }}>
              {kpi.qcPassRate}%
            </div>
          </div>
          <div style={{ paddingLeft: '2px' }}>
            <div style={{ fontSize: '12px', color: '#5E6B82', fontWeight: '600', marginBottom: '6px' }}>QC First-Pass</div>
            <TrendBadge
              dir={kpi.totalRework > 2 ? 'down' : kpi.totalRework > 0 ? 'neutral' : 'up'}
              label={kpi.totalRework > 0 ? `${kpi.totalRework} rework${kpi.totalRework > 1 ? 's' : ''}` : 'Clean'}
            />
            <div style={{ fontSize: '10.5px', color: '#8893A7', marginTop: '5px' }}>
              {kpi.totalRework} rework loop{kpi.totalRework !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Pipeline ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #DCE5F0',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: '13px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '12px', fontWeight: '700', color: '#475569',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Activity size={13} color="#6366f1" />
            Order Pipeline
          </span>
          <span style={{
            fontSize: '10px', color: '#6366f1', fontWeight: '700',
            background: '#eef2ff', border: '1px solid #c7d2fe',
            padding: '2px 10px', borderRadius: '20px',
          }}>
            {kpi.totalOrders} Total
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PipelineRow label="In Production"           count={kpi.inProduction}  total={tot} color="#a855f7" />
          <PipelineRow label="QC Passed / Cleared"     count={kpi.qcPassed}      total={tot} color="#10b981" />
          <PipelineRow label="Dispatched / Delivered"   count={kpi.delivered}     total={tot} color="#0ea5e9" />
          <PipelineRow label="Shortage Stalled"         count={kpi.shortageCount} total={tot} color="#f43f5e" />
          <PipelineRow label="Fully Closed"             count={kpi.closedOrders}  total={tot} color="#eab308" />
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="enterprise-kpi-bottom-grid">

        {/* Material Requests */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #DCE5F0',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Material Requests
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <MatStat value={kpi.mrPending}  label="Pending"  color="#d97706" bgColor="#fef9c3" />
            <MatStat value={kpi.mrIssued}   label="Issued"   color="#10b981" bgColor="#d1fae5" />
            <MatStat value={kpi.mrShortage} label="Shortage" color="#f43f5e" bgColor="#ffe4e6" />
          </div>
        </div>

        {/* Transaction Safety */}
        <div style={{
          background: kpi.rollbacks > 0 ? '#fff1f2' : '#f0fdf4',
          border: `1px solid ${kpi.rollbacks > 0 ? '#fecdd3' : '#bbf7d0'}`,
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px',
        }}>
          <span style={{
            fontSize: '11px', fontWeight: '700',
            color: kpi.rollbacks > 0 ? '#9f1239' : '#15803d',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            Tx Safety
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {kpi.rollbacks === 0 ? (
              <>
                <CheckCircle2 size={26} color="#22c55e" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#15803d' }}>All Stable</div>
                  <div style={{ fontSize: '10px', color: '#4ade80', marginTop: '2px' }}>0 rollbacks logged</div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={26} color="#f43f5e" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#dc2626' }}>{kpi.rollbacks} Rollback{kpi.rollbacks > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: '10px', color: '#f87171', marginTop: '2px' }}>Review event store</div>
                </div>
              </>
            )}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '10.5px', fontWeight: '700',
            color: kpi.rollbacks === 0 ? '#16a34a' : '#dc2626',
            background: kpi.rollbacks === 0 ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${kpi.rollbacks === 0 ? '#86efac' : '#fca5a5'}`,
            padding: '4px 10px', borderRadius: '8px',
          }}>
            <Zap size={11} />
            {kpi.rollbacks === 0 ? 'All transactions intact' : `${kpi.rollbacks} error(s) in store`}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kpiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
