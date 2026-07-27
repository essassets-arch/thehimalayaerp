'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useERP } from '../../../../../../shared/context/ERPContext';
import { useO2PWorkflow } from '../../../../../../shared/hooks/useO2PWorkflow';
import { useNotificationStore } from '../../../../../../store/notificationStore';
import {
  CheckCircle2, XCircle, ArrowLeft, Loader2, Archive,
  FileText, CreditCard, Truck, ShieldCheck, Calendar,
  DollarSign, User, Hash, Clock, Package
} from 'lucide-react';
import Swal from 'sweetalert2';

function InfoRow({ icon: Icon, label, value, accent = '#5E6B82' }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
      <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 700, marginTop: '2px' }}>{value || '—'}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, children, accent = '#3b82f6' }: any) {
  return (
    <div style={{
      background: '#24345C',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '16px',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function OrderClosurePage() {
  const params   = useParams();
  const router   = useRouter();
  const orderId  = params?.id as string;

  const { state, closeOrder } = useERP();
  const { closeOrder: o2pClose, setActiveOrder } = useO2PWorkflow();
  const showToast = useNotificationStore(s => s.showToast);

  const [closing, setClosing] = useState(false);
  const [closed,  setClosed]  = useState(false);

  // ── Resolve order ────────────────────────────────────────
  const order = (state.orders || []).find((o: any) =>
    [o.id, o.orderNo, o.orderId, o.orderNumber]
      .map((v: any) => String(v || '').toLowerCase())
      .includes(String(orderId || '').toLowerCase())
  );

  // ── Payment check ────────────────────────────────────────
  const payments = (state.payments || []).filter((p: any) =>
    [p.orderId, p.orderNo, p.order_number]
      .map((v: any) => String(v || '').toLowerCase())
      .includes(String(orderId || '').toLowerCase())
  );

  const totalPaid   = payments.reduce((s: number, p: any) => s + Number(p.amount || p.paymentAmount || 0), 0);
  const orderTotal  = Number(order?.totalAmount || order?.grand_total || order?.totalOrderValue || 0);
  const outstanding = Math.max(0, orderTotal - totalPaid);
  const isFullyPaid = outstanding === 0 || order?.workflowStatus === 'PAYMENT_COMPLETED';

  const isAlreadyClosed = ['Closed', 'CLOSED'].includes(order?.status || order?.workflowStatus || '');

  // ── Handle Close ─────────────────────────────────────────
  const handleClose = async () => {
    if (!order) return;

    if (!isFullyPaid && !isAlreadyClosed) {
      const conf = await Swal.fire({
        title: 'Outstanding Balance Detected',
        html: `<p style="color:#8893A7;font-size:14px;">This order has an outstanding balance of <strong style="color:#f59e0b">₹${outstanding.toLocaleString('en-IN')}</strong>. Close anyway?</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Close Order',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        background: '#24345C',
        color: '#f1f5f9',
      });
      if (!conf.isConfirmed) return;
    } else {
      const conf = await Swal.fire({
        title: 'Archive & Close Order?',
        html: `<p style="color:#8893A7;font-size:14px;">Order <strong style="color:#f1f5f9">${orderId}</strong> will be permanently marked as <strong style="color:#22c55e">Closed</strong>. This action cannot be undone.</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✓ Close & Archive',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#22c55e',
        background: '#24345C',
        color: '#f1f5f9',
      });
      if (!conf.isConfirmed) return;
    }

    setClosing(true);
    try {
      // Close in erpStore
      closeOrder(orderId);
      // Close in o2pStore (calls apiClient internally)
      await o2pClose({ orderId, actor: 'Finance Manager' });

      setClosed(true);
      showToast(`Order ${orderId} closed & archived successfully`, 'success');

      await Swal.fire({
        icon: 'success',
        title: 'Order Closed!',
        text: `Order ${orderId} has been archived.`,
        timer: 2000,
        showConfirmButton: false,
        background: '#24345C',
        color: '#f1f5f9',
      });

      router.push('/finance/invoices');
    } catch (err: any) {
      showToast(err?.message || 'Failed to close order', 'error');
    } finally {
      setClosing(false);
    }
  };

  // ── Dispatch / invoice references ────────────────────────
  const dispatch = (state.dispatches || []).find((d: any) =>
    [d.orderId, d.orderNo]
      .map((v: any) => String(v || '').toLowerCase())
      .includes(String(orderId || '').toLowerCase())
  );

  const fmt = (val: any) => val ? `₹${Number(val).toLocaleString('en-IN')}` : '—';
  const fmtDate = (val: any) => val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #24345C 100%)',
        padding: '32px 24px',
        fontFamily: "var(--font-main, 'Plus Jakarta Sans'), sans-serif",
        color: '#f1f5f9',
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: '1px solid #1e293b',
            borderRadius: '8px', padding: '8px 14px', color: '#8893A7',
            fontSize: '13px', cursor: 'pointer', marginBottom: '24px',
            fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '12px',
              background: isAlreadyClosed ? '#22c55e20' : '#5E6B8220',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${isAlreadyClosed ? '#22c55e40' : '#334155'}`,
            }}>
              <Archive size={22} color={isAlreadyClosed ? '#22c55e' : '#5E6B82'} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                Order Closure Board
              </div>
              <div style={{ fontSize: '13px', color: '#5E6B82', marginTop: '2px' }}>
                Order Administration · Step 12 of 12
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 800, padding: '6px 14px',
                borderRadius: '20px',
                background: isAlreadyClosed ? '#22c55e20' : '#5E6B8220',
                color: isAlreadyClosed ? '#22c55e' : '#8893A7',
                border: `1px solid ${isAlreadyClosed ? '#22c55e40' : '#334155'}`,
              }}>
                {isAlreadyClosed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {isAlreadyClosed ? 'CLOSED' : (order ? order.status || order.workflowStatus : 'NOT FOUND')}
              </span>
            </div>
          </div>
        </div>

        {/* Not found */}
        {!order && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#475569' }}>
            <XCircle size={48} color="#ef4444" style={{ marginBottom: '16px', opacity: 0.7 }} />
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>Order Not Found</div>
            <div style={{ fontSize: '13px' }}>No order found with ID: <code style={{ color: '#5E6B82' }}>{orderId}</code></div>
          </div>
        )}

        {order && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* ── LEFT column ─────────────────────────────── */}
            <div>
              <SectionCard title="Order Details" accent="#3b82f6">
                <InfoRow icon={Hash}      label="Order No"       value={order.orderNo || order.id}           accent="#3b82f6" />
                <InfoRow icon={User}      label="Customer"       value={order.customer || order.customerName} accent="#3b82f6" />
                <InfoRow icon={Package}   label="Product"        value={order.products?.[0]?.productName || order.productName} accent="#3b82f6" />
                <InfoRow icon={Calendar}  label="Order Date"     value={fmtDate(order.orderDate || order.createdAt)} accent="#3b82f6" />
                <InfoRow icon={Calendar}  label="Delivery Date"  value={fmtDate(order.deliveryDate)}          accent="#3b82f6" />
              </SectionCard>

              <SectionCard title="Financials" accent="#10b981">
                <InfoRow icon={DollarSign} label="Order Total"   value={fmt(orderTotal)}                      accent="#10b981" />
                <InfoRow icon={CreditCard} label="Total Paid"    value={fmt(totalPaid)}                       accent="#10b981" />
                <InfoRow icon={CreditCard} label="Outstanding"   value={outstanding > 0 ? `₹${outstanding.toLocaleString('en-IN')}` : '✓ Fully Paid'} accent={outstanding > 0 ? '#f59e0b' : '#22c55e'} />
              </SectionCard>
            </div>

            {/* ── RIGHT column ────────────────────────────── */}
            <div>
              <SectionCard title="Workflow Status" accent="#a855f7">
                <InfoRow icon={CheckCircle2} label="QC Status"      value={order.qcStatus || '—'}            accent="#ec4899" />
                <InfoRow icon={Truck}        label="Dispatch Status" value={dispatch?.status || order.dispatchStatus || '—'} accent="#f97316" />
                <InfoRow icon={ShieldCheck}  label="Payment Status"  value={order.paymentStatus || '—'}      accent="#22c55e" />
                <InfoRow icon={FileText}     label="Invoice Status"  value={order.invoiceStatus || (order.invoiceId ? 'Generated' : '—')} accent="#14b8a6" />
              </SectionCard>

              <SectionCard title="Payments Received" accent="#0ea5e9">
                {payments.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>No payments recorded yet.</div>
                ) : payments.map((p: any, i: number) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>
                          {p.paymentMode || p.payment_mode || 'NEFT'} · {p.referenceNumber || p.transactionReference || '—'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#5E6B82', marginTop: '2px' }}>
                          {fmtDate(p.paymentDate || p.payment_date || p.createdAt)}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e' }}>
                        {fmt(p.amount || p.paymentAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </SectionCard>
            </div>

            {/* ── Full-width Close CTA ─────────────────────── */}
            <div style={{ gridColumn: '1 / -1' }}>
              {isAlreadyClosed ? (
                <div style={{
                  background: '#14532d20',
                  border: '1px solid #22c55e30',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}>
                  <CheckCircle2 size={28} color="#22c55e" />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#22c55e' }}>Order Successfully Closed</div>
                    <div style={{ fontSize: '13px', color: '#5E6B82', marginTop: '4px' }}>
                      This order has been archived and is no longer active in the O2P workflow.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#24345C',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                    Close & Archive This Order
                  </div>
                  <div style={{ fontSize: '12px', color: '#5E6B82', marginBottom: '20px', lineHeight: 1.6 }}>
                    Closing the order marks the completion of the full Order-to-Payment cycle.
                    The order will be archived and no further workflow transitions are possible.
                    {!isFullyPaid && (
                      <span style={{ display: 'block', color: '#f59e0b', marginTop: '8px', fontWeight: 700 }}>
                        ⚠ Outstanding balance of ₹{outstanding.toLocaleString('en-IN')} detected. Ensure payment is settled before closing.
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleClose}
                      disabled={closing}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: isFullyPaid
                          ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                          : 'linear-gradient(135deg, #b45309, #d97706)',
                        border: 'none', borderRadius: '10px',
                        padding: '12px 24px', color: '#fff',
                        fontSize: '14px', fontWeight: 800, cursor: closing ? 'wait' : 'pointer',
                        opacity: closing ? 0.7 : 1,
                        transition: 'all 0.2s',
                        boxShadow: isFullyPaid
                          ? '0 4px 14px #22c55e40'
                          : '0 4px 14px #d9770640',
                      }}
                    >
                      {closing
                        ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Closing…</>
                        : <><Archive size={15} /> Close & Archive Order</>
                      }
                    </button>
                    <button
                      onClick={() => router.push('/finance/invoices')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'transparent', border: '1px solid #334155',
                        borderRadius: '10px', padding: '12px 20px', color: '#8893A7',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <FileText size={15} /> View Invoices
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
