import { useMemo, useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  AlertTriangle, AlertCircle, CheckCircle2, Info,
  RotateCcw, Package, Truck, Ban, ShieldAlert, Clock
} from 'lucide-react';

/* ── Severity config ── */
const SEVERITY = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)', Icon: AlertCircle },
  warning:  { label: 'Warning',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)', Icon: AlertTriangle },
  info:     { label: 'Info',     color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.22)', Icon: Info },
  success:  { label: 'Success',  color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.22)', Icon: CheckCircle2 },
};

/* ── Derive alerts from application state ── */
function deriveAlerts(state) {
  const alerts = [];
  const orders = state.orders || [];
  const workOrders = state.workOrders || [];
  const materialRequests = state.materialRequests || [];
  const dispatches = state.dispatches || [];
  const rawInventory = state.rawInventory || [];
  const eventStore = state.eventStore || [];

  /* 1. Shortage orders */
  orders
    .filter(o => o.status === 'Shortage')
    .forEach(o => {
      alerts.push({
        id: `shortage-${o.orderNo}`,
        severity: 'critical',
        icon: 'package',
        title: `Stock Shortage — ${o.orderNo}`,
        message: `Order ${o.orderNo} for ${o.customer?.name || o.customerName} is stalled due to insufficient raw material stock.`,
        tag: 'Inventory',
        orderRef: o.orderNo,
        timestamp: Date.now() - 1000 * 60 * 2,
      });
    });

  /* 2. QC rework loops (> 1 rework) */
  workOrders
    .filter(wo => wo.reworkCount > 0)
    .forEach(wo => {
      alerts.push({
        id: `rework-${wo.id}`,
        severity: wo.reworkCount > 1 ? 'critical' : 'warning',
        icon: 'rework',
        title: `QC Rework Loop — ${wo.id}`,
        message: `Work order ${wo.id} has failed QC inspection ${wo.reworkCount} time${wo.reworkCount > 1 ? 's' : ''}. Review production quality.`,
        tag: 'Quality',
        orderRef: wo.orderNo,
        timestamp: Date.now() - 1000 * 60 * 5,
      });
    });

  /* 3. Overdue orders: delivery date passed & not Closed/Delivered */
  const today = new Date();
  orders
    .filter(o => {
      if (['Closed', 'Delivered', 'Payment Verified'].includes(o.status)) return false;
      if (!o.deliveryDate) return false;
      return new Date(o.deliveryDate) < today;
    })
    .forEach(o => {
      alerts.push({
        id: `overdue-${o.orderNo}`,
        severity: 'warning',
        icon: 'clock',
        title: `Overdue Delivery — ${o.orderNo}`,
        message: `Order ${o.orderNo} was due on ${o.deliveryDate} and is currently at stage: "${o.status}".`,
        tag: 'Logistics',
        orderRef: o.orderNo,
        timestamp: Date.now() - 1000 * 60 * 10,
      });
    });

  /* 4. Low inventory items (stock < 20) */
  rawInventory
    .filter(inv => inv.stock < 20)
    .forEach(inv => {
      const avail = inv.stock - (inv.reserved || 0);
      alerts.push({
        id: `lowinv-${inv.id || inv.material}`,
        severity: avail <= 0 ? 'critical' : 'warning',
        icon: 'package',
        title: `Low Stock — ${inv.material}`,
        message: `${inv.material} stock is critically low: ${inv.stock}T available, ${inv.reserved || 0}T reserved. Net usable: ${avail}T.`,
        tag: 'Inventory',
        orderRef: '',
        timestamp: Date.now() - 1000 * 60 * 15,
      });
    });

  /* 5. Unverified dispatched orders */
  dispatches
    .filter(d => d.status === 'Dispatched')
    .forEach(d => {
      alerts.push({
        id: `dispatch-pending-${d.id}`,
        severity: 'info',
        icon: 'truck',
        title: `Awaiting Delivery Confirmation — ${d.id}`,
        message: `Consignment ${d.id} (Order ${d.orderNo}) was dispatched via ${d.vehicleNo}. Delivery proof pending.`,
        tag: 'Dispatch',
        orderRef: d.orderNo,
        timestamp: Date.now() - 1000 * 60 * 20,
      });
    });

  /* 6. Orders stuck in Payment Pending for > 0 (no auto-timer — just flag them) */
  orders
    .filter(o => o.status === 'Payment Pending')
    .forEach(o => {
      alerts.push({
        id: `payment-pending-${o.orderNo}`,
        severity: 'warning',
        icon: 'shield',
        title: `Payment Clearance Pending — ${o.orderNo}`,
        message: `Order ${o.orderNo} has been delivered. Sales has marked payment received but Finance verification is pending.`,
        tag: 'Finance',
        orderRef: o.orderNo,
        timestamp: Date.now() - 1000 * 60 * 8,
      });
    });

  /* 7. Recent transaction rollback events */
  eventStore
    .filter(e => e.action === 'TRANSACTION_ERROR')
    .slice(-3)
    .forEach(e => {
      alerts.push({
        id: `txerr-${e.id}`,
        severity: 'critical',
        icon: 'shield',
        title: `Transaction Rollback Detected`,
        message: `A state-mutating transaction was rolled back. Entity: ${e.entity || 'N/A'}, ID: ${e.entityId || 'N/A'}.`,
        tag: 'System',
        orderRef: '',
        timestamp: e.timestamp || Date.now(),
      });
    });

  // sort newest first (by id stability — use index fallback)
  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2, success: 3 };
    return order[a.severity] - order[b.severity];
  });
}

const ICON_MAP = {
  package: Package,
  rework: RotateCcw,
  truck: Truck,
  clock: Clock,
  shield: ShieldAlert,
  ban: Ban,
};

const TAGS = ['All', 'Inventory', 'Quality', 'Logistics', 'Finance', 'Dispatch', 'System'];

export default function EnterpriseAlerts() {
  const { state } = useERP();
  const [activeTag, setActiveTag] = useState('All');
  const [dismissed, setDismissed] = useState(new Set());

  const allAlerts = useMemo(() => deriveAlerts(state), [state]);
  const filtered = allAlerts.filter(a => {
    if (dismissed.has(a.id)) return false;
    if (activeTag !== 'All' && a.tag !== activeTag) return false;
    return true;
  });

  const criticalCount = allAlerts.filter(a => a.severity === 'critical' && !dismissed.has(a.id)).length;
  const warningCount  = allAlerts.filter(a => a.severity === 'warning'  && !dismissed.has(a.id)).length;

  const dismissAlert = (id) => setDismissed(prev => new Set([...prev, id]));
  const dismissAll   = () => setDismissed(new Set(allAlerts.map(a => a.id)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#ef4444" />
            Enterprise Alert Feed
          </h3>
          {criticalCount > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '12px', padding: '2px 9px', fontSize: '11px', fontWeight: '800' }}>
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ background: '#f59e0b', color: '#000', borderRadius: '12px', padding: '2px 9px', fontSize: '11px', fontWeight: '800' }}>
              {warningCount} Warnings
            </span>
          )}
        </div>
        {filtered.length > 0 && (
          <button
            onClick={dismissAll}
            style={{ fontSize: '11px', color: '#8893A7', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}
          >
            Dismiss All
          </button>
        )}
      </div>

      {/* Tag filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: activeTag === tag ? 'var(--color-primary, #0ea5e9)' : 'rgba(255,255,255,0.08)',
              background: activeTag === tag ? 'rgba(14,165,233,0.15)' : 'transparent',
              color: activeTag === tag ? '#0ea5e9' : '#8893A7',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '10px', padding: '32px 20px', textAlign: 'center',
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px'
        }}>
          <CheckCircle2 size={32} color="#10b981" strokeWidth={1.5} />
          <span style={{ color: '#10b981', fontWeight: '700', fontSize: '14px' }}>All systems operational</span>
          <span style={{ color: '#5E6B82', fontSize: '12px' }}>No active alerts or warnings in this category.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
          {filtered.map(alert => {
            const sev = SEVERITY[alert.severity];
            const AlertIcon = sev.Icon;
            const EntityIcon = ICON_MAP[alert.icon] || Info;

            return (
              <div
                key={alert.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 14px',
                  background: sev.bg,
                  border: `1px solid ${sev.border}`,
                  borderRadius: '10px',
                  transition: 'transform 0.15s ease',
                  position: 'relative',
                  animation: 'fadeSlideIn 0.25s ease'
                }}
              >
                {/* Left icon */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: `${sev.color}20`,
                  border: `1px solid ${sev.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <EntityIcon size={16} color={sev.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{alert.title}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                      padding: '1px 7px', borderRadius: '20px',
                      background: `${sev.color}25`, color: sev.color
                    }}>{sev.label}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: '600', padding: '1px 7px', borderRadius: '20px',
                      background: 'rgba(255,255,255,0.06)', color: '#8893A7'
                    }}>{alert.tag}</span>
                    {alert.orderRef && (
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#60a5fa', fontWeight: 'bold' }}>
                        {alert.orderRef}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8893A7', lineHeight: '1.5' }}>
                    {alert.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  title="Dismiss alert"
                  style={{
                    background: 'transparent', border: 'none', color: '#475569',
                    cursor: 'pointer', fontSize: '16px', lineHeight: 1,
                    padding: '2px 4px', borderRadius: '4px',
                    flexShrink: 0,
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
