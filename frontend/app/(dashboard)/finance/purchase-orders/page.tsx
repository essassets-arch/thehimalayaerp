'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../../shared/context/ERPContext';
import { Archive, Search, CheckCircle2, Clock, DollarSign, ChevronRight, ExternalLink } from 'lucide-react';
import StatusBadge from '../../../../shared/components/StatusBadge';

const CLOSEABLE_STATUSES = [
  'PAYMENT_COMPLETED', 'PARTIALLY_PAID', 'VERIFIED',
  'Payment Completed', 'Partially Paid', 'Delivered', 'INVOICED'
];
const CLOSED_STATUSES = ['CLOSED', 'Closed'];

export default function ClosureBoardPage() {
  const { state } = useERP();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const orders = (state.orders || []) as any[];

  const closeable = orders.filter(o =>
    CLOSEABLE_STATUSES.some(s =>
      [o.workflowStatus, o.status, o.orderStatus].includes(s)
    )
  );

  const closed = orders.filter(o =>
    CLOSED_STATUSES.some(s =>
      [o.workflowStatus, o.status, o.orderStatus].includes(s)
    )
  );

  const getCustomerName = (c: any) => {
    if (typeof c === 'string') return c;
    if (c && typeof c === 'object') return c.name || c.companyName || c.contactPerson || '';
    return '';
  };

  const filterRows = (rows: any[]) =>
    rows.filter(o => {
      const q = search.toLowerCase();
      const customerStr = getCustomerName(o.customer) || getCustomerName(o.customerName) || '';
      return !q ||
        String(o.id || o.orderNo || '').toLowerCase().includes(q) ||
        customerStr.toLowerCase().includes(q);
    });

  const fmt = (v: any) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

  const Row = ({ order }: { order: any }) => {
    const isClosed = CLOSED_STATUSES.some(s =>
      [order.workflowStatus, order.status, order.orderStatus].includes(s)
    );
    const id = order.orderNo || order.id;
    return (
      <tr
        style={{ borderBottom: '1px solid #DCE5F0', cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        onClick={() => router.push(`/finance/purchase-orders/${id}/close`)}
      >
        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#24345C', fontSize: '13px' }}>{id}</td>
        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '13px' }}>{getCustomerName(order.customer) || getCustomerName(order.customerName) || '—'}</td>
        <td style={{ padding: '12px 16px' }}>
          <StatusBadge status={order.status || order.workflowStatus} />
        </td>
        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '12px' }}>
          {order.paymentStatus || '—'}
        </td>
        <td style={{ padding: '12px 16px', color: '#24345C', fontSize: '13px', fontWeight: 700 }}>
          {fmt(order.totalAmount || order.grand_total)}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <button
            onClick={e => { e.stopPropagation(); router.push(`/finance/purchase-orders/${id}/close`); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: isClosed ? '#22c55e15' : '#f59e0b15',
              border: `1px solid ${isClosed ? '#22c55e40' : '#f59e0b40'}`,
              borderRadius: '6px', padding: '5px 12px',
              color: isClosed ? '#22c55e' : '#f59e0b',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {isClosed ? <CheckCircle2 size={12} /> : <Archive size={12} />}
            {isClosed ? 'View' : 'Close Order'}
            <ChevronRight size={11} />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F5FAFE 0%, #f1f5f9 100%)',
      padding: 'clamp(14px, 2.5vw, 32px)',
      fontFamily: "var(--font-main, 'Plus Jakarta Sans'), sans-serif",
      color: '#24345C',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <style>{`
        .po-closure-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .po-closure-stats-grid {
            grid-template-columns: 1fr;
          }
          .po-closure-search {
            width: 100% !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #D6E2F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Archive size={20} color="#5E6B82" />
              </div>
              <div>
                <h1 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 900, color: '#24345C', margin: 0, letterSpacing: '-0.02em' }}>Closure Board</h1>
                <div style={{ fontSize: '12px', color: '#5E6B82', marginTop: '2px' }}>Order Administration · Step 12 of O2P</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="po-closure-search" style={{ position: 'relative', width: '260px' }}>
            <Search size={14} color="#5E6B82" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              style={{
                background: '#ffffff', border: '1px solid #D6E2F0',
                borderRadius: '8px', padding: '8px 12px 8px 32px',
                color: '#24345C', fontSize: '13px', width: '100%', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="po-closure-stats-grid">
          {[
            { icon: Clock, label: 'Pending Closure', value: filterRows(closeable).length, color: '#f59e0b' },
            { icon: CheckCircle2, label: 'Closed Orders', value: filterRows(closed).length, color: '#22c55e' },
            { icon: DollarSign, label: 'Total Orders', value: filterRows([...closeable, ...closed]).length, color: '#3b82f6' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ background: '#ffffff', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#24345C' }}>{value}</div>
                <div style={{ fontSize: '11px', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Closure Table */}
        {filterRows(closeable).length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #DCE5F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#f59e0b" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Pending Closure ({filterRows(closeable).length})
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F5FAFE' }}>
                    {['Order No', 'Customer', 'Status', 'Payment', 'Amount', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterRows(closeable).map((o, i) => <Row key={i} order={o} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Closed Orders Table */}
        {filterRows(closed).length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #DCE5F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} color="#22c55e" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Closed & Archived ({filterRows(closed).length})
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F5FAFE' }}>
                    {['Order No', 'Customer', 'Status', 'Payment', 'Amount', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterRows(closed).map((o, i) => <Row key={i} order={o} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filterRows(closeable).length === 0 && filterRows(closed).length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#475569' }}>
            <Archive size={48} color="#334155" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#5E6B82', marginBottom: '8px' }}>No Orders Ready for Closure</div>
            <div style={{ fontSize: '13px' }}>Orders that have completed payment verification will appear here.</div>
          </div>
        )}

      </div>
    </div>
  );
}
