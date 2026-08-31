import { useState, useMemo } from 'react';
import { useERP } from '../shared/context/ERPContext';
import {
  ChevronLeft, ChevronRight, Calendar, Users, FileText,
  ShoppingCart, CreditCard, TestTube, Package, Truck, AlertCircle,
  PhoneCall, Clock, CheckCircle2
} from 'lucide-react';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function padTwo(n) { return String(n).padStart(2, '0'); }
function toDateStr(y, m, d) { return `${y}-${padTwo(m + 1)}-${padTwo(d)}`; }

function normalizeDateStr(rawDate) {
  if (!rawDate) return null;
  if (typeof rawDate === 'string') {
    const trimmed = rawDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (trimmed.includes('T')) {
      const p = trimmed.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
    }
    if (trimmed.includes(' ')) {
      const p = trimmed.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;
    }
  }
  if (typeof rawDate === 'number') {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;
    }
  }
  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    return `${rawDate.getFullYear()}-${padTwo(rawDate.getMonth() + 1)}-${padTwo(rawDate.getDate())}`;
  }
  return null;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const EVENT_TYPES = {
  reminder:      { label: 'Follow-up Task',        icon: PhoneCall,     color: '#f59e0b', bg: '#fef3c7' },
  lead_followup: { label: 'Lead Follow-up',        icon: PhoneCall,     color: '#f59e0b', bg: '#fef3c7' },
  lead_created:  { label: 'New Lead Registered',   icon: Users,         color: '#10b981', bg: '#d1fae5' },
  sample:        { label: 'Sample',                icon: TestTube,      color: '#0ea5e9', bg: '#e0f2fe' },
  quotation:     { label: 'Quotation Follow-up',   icon: FileText,      color: '#8b5cf6', bg: '#ede9fe' },
  quot_expire:   { label: 'Quotation Expiry',      icon: FileText,      color: '#ec4899', bg: '#fdf2f8' },
  order:         { label: 'Order Confirmed',       icon: ShoppingCart,  color: '#6366f1', bg: '#eef2ff' },
  delivery:      { label: 'Delivery Due',          icon: Package,       color: '#d97706', bg: '#fef9c3' },
  payment:       { label: 'Payment Due',           icon: CreditCard,    color: '#f43f5e', bg: '#ffe4e6' },
  dispatch:      { label: 'Dispatch',              icon: Truck,         color: '#0891b2', bg: '#ecfeff' },
};

/* ─────────────────────────────────────────
   Derive ALL agenda events from live props & state
───────────────────────────────────────── */
function deriveEvents({ state = {}, leads: leadsProp, quotations: quotesProp, orders: ordersProp, payments: paymentsProp, samples: samplesProp, reminders: remindersProp }) {
  const events = {}; // { 'YYYY-MM-DD': [event, ...] }

  const addEvent = (rawDate, event) => {
    const dateKey = normalizeDateStr(rawDate);
    if (!dateKey) return;
    if (!events[dateKey]) events[dateKey] = [];
    events[dateKey].push(event);
  };

  const allLeads = Array.isArray(leadsProp) && leadsProp.length > 0 ? leadsProp : (state.leads || state.sales?.leads || []);
  const allQuotations = Array.isArray(quotesProp) && quotesProp.length > 0 ? quotesProp : (state.quotations || state.sales?.quotations || []);
  const allOrders = Array.isArray(ordersProp) && ordersProp.length > 0 ? ordersProp : (state.orders || state.sales?.orders || []);
  const allPayments = Array.isArray(paymentsProp) && paymentsProp.length > 0 ? paymentsProp : (state.payments || state.sales?.payments || []);
  const allSamples = Array.isArray(samplesProp) && samplesProp.length > 0 ? samplesProp : (state.samples || state.sales?.samples || []);
  const allReminders = Array.isArray(remindersProp) && remindersProp.length > 0 ? remindersProp : (state.reminders || state.sales?.reminders || []);

  /* ── 1. EXPLICIT REMINDERS & FOLLOW-UPS ── */
  allReminders.forEach(r => {
    const rDate = r.reminderDate || r.reminderAt || r.date || r.createdAt;
    const mType = String(r.moduleType || r.type || 'GENERAL').toUpperCase();
    let eType = 'lead_followup';
    let label = 'Scheduled Reminder';

    if (mType.includes('LEAD')) { eType = 'lead_followup'; label = 'Lead Follow-up'; }
    else if (mType.includes('SAMPLE')) { eType = 'sample'; label = 'Sample Follow-up'; }
    else if (mType.includes('QUOTE') || mType.includes('QUOTATION')) { eType = 'quotation'; label = 'Quotation Follow-up'; }
    else if (mType.includes('ORDER') || mType.includes('PRODUCTION')) { eType = 'order'; label = 'Order Follow-up'; }
    else if (mType.includes('PAY') || mType.includes('FINANCE') || mType.includes('INVOICE')) { eType = 'payment'; label = 'Payment Follow-up'; }

    if (rDate) {
      addEvent(rDate, {
        type: eType,
        title: `${label}: ${r.customerName || r.title || 'Follow-up Task'}`,
        subtitle: r.remarks || r.notes || r.description || `Status: ${r.status || 'Pending'}`,
        status: r.status || 'Pending',
        id: `reminder-${r.id}`
      });
    }
  });

  /* ── 2. LEADS ── */
  allLeads.forEach(lead => {
    if (lead.followUpDate) {
      addEvent(lead.followUpDate, {
        type: 'lead_followup',
        title: `Follow-up: ${lead.companyName || lead.customerName || lead.name || 'Lead'}`,
        subtitle: `${lead.contactPerson || ''}${lead.contactPerson ? ' · ' : ''}${lead.phone || lead.salesperson || 'Follow-up scheduled'}`,
        status: lead.status || 'Follow-up',
        id: `lead-fu-${lead.id}`
      });
    }
    const createDate = lead.createdAt || lead.date || lead.created_at;
    if (createDate) {
      addEvent(createDate, {
        type: 'lead_created',
        title: `Lead Registered: ${lead.companyName || lead.customerName || lead.name || 'New Lead'}`,
        subtitle: `${lead.contactPerson || ''}${lead.contactPerson ? ' · ' : ''}Status: ${lead.status || 'New'}`,
        status: lead.status || 'New',
        id: `lead-created-${lead.id}`
      });
    }
    // Lead timeline entries
    (Array.isArray(lead.timeline) ? lead.timeline : []).forEach((entry, idx) => {
      if (entry.date && entry.stage && String(entry.stage).toLowerCase().includes('follow')) {
        addEvent(entry.date, {
          type: 'lead_followup',
          title: `Follow-up Logged: ${lead.companyName || 'Lead'}`,
          subtitle: entry.text || entry.stage,
          status: lead.status,
          id: `lead-tl-${lead.id}-${idx}`
        });
      }
    });
  });

  /* ── 3. SAMPLES ── */
  allSamples.forEach(s => {
    if (s.followUpDate) {
      addEvent(s.followUpDate, {
        type: 'sample',
        title: `Sample Follow-up: ${s.leadName || s.customerName || 'Sample Request'}`,
        subtitle: `${s.product || s.sampleName || 'Sample'} · Status: ${s.status || 'Pending'}`,
        status: s.status,
        id: `sample-fu-${s.id}`
      });
    }
    if (s.dispatchDate) {
      addEvent(s.dispatchDate, {
        type: 'sample',
        title: `Sample Dispatched: ${s.leadName || s.customerName || 'Sample'}`,
        subtitle: `${s.product || ''} · Tracking: ${s.trackingNumber || s.courier || 'Dispatched'}`,
        status: s.status,
        id: `sample-disp-${s.id}`
      });
    }
    if (s.expiryDate || s.validTill) {
      addEvent(s.expiryDate || s.validTill, {
        type: 'quot_expire',
        title: `Sample Expiry: ${s.leadName || s.customerName || 'Sample'}`,
        subtitle: `${s.product || ''} · Status: ${s.status || 'Pending'}`,
        status: s.status,
        id: `sample-exp-${s.id}`
      });
    }
    if (s.deliveredDate) {
      addEvent(s.deliveredDate, {
        type: 'dispatch',
        title: `Sample Delivered: ${s.leadName || s.customerName}`,
        subtitle: `${s.product || ''} · Delivery Confirmed`,
        status: 'Delivered',
        id: `sample-del-${s.id}`
      });
    }
  });

  /* ── 4. QUOTATIONS ── */
  allQuotations.forEach(q => {
    const qDate = q.date || q.createdAt || q.quotationDate;
    if (qDate) {
      addEvent(qDate, {
        type: 'quotation',
        title: `Quotation Drafted: ${q.customerName || q.clientName || 'Quotation'}`,
        subtitle: `${q.quotationNumber || q.quoteNo || ''} · ₹${Number(q.totalAmount || q.grandTotal || 0).toLocaleString('en-IN')}`,
        status: q.status || 'Draft',
        id: `quote-date-${q.id}`
      });
    }
    if (q.followUpDate) {
      addEvent(q.followUpDate, {
        type: 'quotation',
        title: `Quotation Follow-up: ${q.customerName || q.clientName || 'Quotation'}`,
        subtitle: `₹${Number(q.totalAmount || q.grandTotal || 0).toLocaleString('en-IN')} · ${q.status || 'Pending'}`,
        status: q.status,
        id: `quote-fu-${q.id}`
      });
    }
    if (q.validTill || q.validUntil) {
      addEvent(q.validTill || q.validUntil, {
        type: 'quot_expire',
        title: `Quotation Expiry: ${q.customerName || q.clientName || 'Quotation'}`,
        subtitle: `Valid until date reached · ${q.status || 'Active'}`,
        status: q.status,
        id: `quote-exp-${q.id}`
      });
    }
  });

  /* ── 5. ORDERS ── */
  allOrders.forEach(order => {
    const oDate = order.orderDate || order.date || order.createdAt || order.confirmedAt;
    const cust = order.customerName || order.customer?.name || order.customer?.companyName || 'Customer';
    const oNo = order.orderId || order.orderNumber || order.orderNo || `#${order.id}`;
    if (oDate) {
      addEvent(oDate, {
        type: 'order',
        title: `Order: ${cust}`,
        subtitle: `${oNo} · ₹${Number(order.grandTotal || order.totalAmount || 0).toLocaleString('en-IN')}`,
        status: order.status || 'Active',
        id: `order-dt-${order.id || oNo}`
      });
    }
    const delivDate = order.expectedDeliveryDate || order.deliveryDate;
    if (delivDate) {
      addEvent(delivDate, {
        type: 'delivery',
        title: `Delivery Due: ${cust}`,
        subtitle: `${oNo} · Status: ${order.status || 'Processing'}`,
        status: order.deliveryStatus || order.status || 'Pending',
        id: `delivery-${order.id || oNo}`
      });
    }
  });

  /* ── 6. PAYMENTS ── */
  allPayments.forEach(p => {
    const pDate = p.dueDate || p.paymentDueDate || p.date || p.createdAt;
    if (pDate && p.status !== 'Paid') {
      addEvent(pDate, {
        type: 'payment',
        title: `Payment Due: ${p.customerName || p.customer || 'Customer'}`,
        subtitle: `Due: ₹${Number(p.totalAmount || p.amount || 0).toLocaleString('en-IN')} · Status: ${p.status || 'Pending'}`,
        status: p.status || 'Pending',
        id: `payment-${p.id}`
      });
    }
  });

  return events;
}

/* ─────────────────────────────────────────
   EventChip
───────────────────────────────────────── */
function EventChip({ event }) {
  const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.order;
  const Icon = cfg.icon;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '10px 14px',
        background: cfg.bg,
        border: `1px solid ${cfg.color}28`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: '10px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = `0 4px 16px ${cfg.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        background: `${cfg.color}18`, border: `1px solid ${cfg.color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} color={cfg.color} strokeWidth={2.3} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', lineHeight: 1.35, wordBreak: 'break-word' }}>
          {event.title}
        </div>
        <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '2px', fontWeight: '500', wordBreak: 'break-word' }}>
          {event.subtitle}
        </div>
        {event.status && (
          <span style={{
            display: 'inline-block', marginTop: '5px',
            fontSize: '9.5px', fontWeight: '800', color: cfg.color,
            background: `${cfg.color}15`, padding: '2px 7px', borderRadius: '20px',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {event.status}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function DailyAgendaCalendar({ 
  state: stateProp, 
  leads: leadsProp, 
  quotations: quotesProp, 
  orders: ordersProp, 
  payments: paymentsProp, 
  samples: samplesProp, 
  reminders: remindersProp 
}) {
  let erpState = {};
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const erp = useERP();
    erpState = erp?.state || {};
  } catch {
    erpState = stateProp || {};
  }
  const state = { ...erpState, ...(stateProp || {}) };

  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const allEvents = useMemo(() => deriveEvents({
    state,
    leads: leadsProp,
    quotations: quotesProp,
    orders: ordersProp,
    payments: paymentsProp,
    samples: samplesProp,
    reminders: remindersProp
  }), [state, leadsProp, quotesProp, ordersProp, paymentsProp, samplesProp, remindersProp]);

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const todayStr      = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedEvents = allEvents[selectedDate] || [];

  const getEventCount = (day) => (allEvents[toDateStr(viewYear, viewMonth, day)] || []).length;

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedLabel   = `${MONTH_NAMES[selectedDateObj.getMonth()]} ${selectedDateObj.getDate()}, ${selectedDateObj.getFullYear()}`;

  const eventTypeCounts = useMemo(() => {
    const counts = {};
    selectedEvents.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [selectedEvents]);

  // Total events across whole month (for mini stat)
  const monthEventTotal = useMemo(() => {
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      total += getEventCount(d);
    }
    return total;
  }, [allEvents, viewYear, viewMonth, daysInMonth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0' }}>
      <style>{`
        @keyframes calSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cal-split-container {
          display: flex;
          flex-direction: row;
          gap: 16px;
          width: 100%;
          align-items: stretch;
        }
        .cal-split-left {
          flex: 0 0 38%;
          width: 38%;
          min-width: 260px;
          display: flex;
          flex-direction: column;
        }
        .cal-split-right {
          flex: 1 1 62%;
          width: 62%;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 768px) {
          .cal-split-container {
            flex-direction: column;
          }
          .cal-split-left, .cal-split-right {
            flex: 1 1 100%;
            width: 100%;
            min-width: 100%;
          }
        }
        .cal-day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
          position: relative;
          min-width: 0;
          padding: 2px;
          user-select: none;
        }
        .cal-day-cell:hover {
          background: #f1f5f9 !important;
          transform: scale(1.08);
        }
        .cal-day-dots {
          display: flex;
          gap: 2px;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
        }
        .cal-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .agenda-event-row {
          animation: calSlideIn 0.2s ease both;
        }
        .agenda-scroll::-webkit-scrollbar { width: 4px; }
        .agenda-scroll::-webkit-scrollbar-track { background: transparent; }
        .agenda-scroll::-webkit-scrollbar-thumb { background: #DCE5F0; border-radius: 4px; }
      `}</style>

      <div className="cal-split-container">
        {/* ── LEFT COLUMN (40%): Month Navigation + Calendar Grid ── */}
        <div className="cal-split-left">
          {/* Month Navigation */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '7px',
                background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(99,102,241,0.3)',
              }}>
                <Calendar size={13} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#24345C', letterSpacing: '-0.3px' }}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </div>
                <div style={{ fontSize: '9.5px', color: '#8893A7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {monthEventTotal} events this month
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <button onClick={goToday} style={{
                fontSize: '9.5px', fontWeight: '700', color: '#6366f1',
                background: '#eef2ff', border: '1px solid #c7d2fe',
                padding: '3px 7px', borderRadius: '6px', cursor: 'pointer',
                transition: 'background 0.15s'
              }}>
                Today
              </button>
              <button onClick={prevMonth} style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: '#f1f5f9', border: '1px solid #DCE5F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <ChevronLeft size={13} color="#475569" />
              </button>
              <button onClick={nextMonth} style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: '#f1f5f9', border: '1px solid #DCE5F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <ChevronRight size={13} color="#475569" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{
            background: '#ffffff', border: '1px solid #DCE5F0',
            borderRadius: '12px', padding: '8px', flex: 1,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '4px' }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{
                  textAlign: 'center', fontSize: '9px', fontWeight: '800',
                  color: '#8893A7', letterSpacing: '0.05em', padding: '2px 0',
                  textTransform: 'uppercase',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const ds = toDateStr(viewYear, viewMonth, day);
                const isToday    = ds === todayStr;
                const isSelected = ds === selectedDate;
                const dayEvents  = allEvents[ds] || [];
                const eventCount = dayEvents.length;

                let bg    = 'transparent';
                let color = '#334155';
                if (isSelected)      { bg = '#6366f1'; color = '#ffffff'; }
                else if (isToday)    { bg = '#eef2ff'; color = '#6366f1'; }
                else if (eventCount) { bg = 'transparent'; }

                const dotColors = [...new Set(dayEvents.map(e => EVENT_TYPES[e.type]?.color).filter(Boolean))].slice(0, 3);

                return (
                  <div
                    key={day}
                    className="cal-day-cell"
                    style={{ background: bg, color, fontWeight: isToday || isSelected ? '800' : '600' }}
                    onClick={() => setSelectedDate(ds)}
                    title={eventCount > 0 ? `${eventCount} event${eventCount > 1 ? 's' : ''}` : ''}
                  >
                    <span style={{ lineHeight: 1 }}>{day}</span>
                    {eventCount > 0 && (
                      <div className="cal-day-dots">
                        {dotColors.map((c, idx) => (
                          <div key={idx} className="cal-dot"
                            style={{ background: isSelected ? 'rgba(255,255,255,0.75)' : c }} />
                        ))}
                        {eventCount > dotColors.length && (
                          <div className="cal-dot"
                            style={{ background: isSelected ? 'rgba(255,255,255,0.4)' : '#8893A7' }} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (60%): Agenda Panel ── */}
        <div className="cal-split-right">
          <div style={{
            background: '#ffffff', border: '1px solid #DCE5F0',
            borderRadius: '12px', overflow: 'hidden',
            flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px',
          }}>
            {/* Header */}
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(to right, #F5FAFE, #ffffff)',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#24345C' }}>
                  Agenda for {selectedLabel}
                </div>
                <div style={{ fontSize: '10.5px', color: '#8893A7', fontWeight: '600', marginTop: '2px' }}>
                  {selectedEvents.length === 0
                    ? 'No events scheduled'
                    : `${selectedEvents.length} event${selectedEvents.length !== 1 ? 's' : ''} scheduled`}
                </div>
              </div>
              {selectedEvents.length > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: '800', color: '#6366f1',
                  background: '#eef2ff', border: '1px solid #c7d2fe',
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  {selectedEvents.length}
                </span>
              )}
            </div>

            {/* Type summary pills */}
            {Object.keys(eventTypeCounts).length > 0 && (
              <div style={{
                padding: '7px 14px', display: 'flex', gap: '5px', flexWrap: 'wrap',
                borderBottom: '1px solid #f1f5f9', flexShrink: 0,
              }}>
                {Object.entries(eventTypeCounts).map(([type, count]) => {
                  const cfg = EVENT_TYPES[type];
                  if (!cfg) return null;
                  return (
                    <span key={type} style={{
                      fontSize: '9.5px', fontWeight: '700', color: cfg.color,
                      background: cfg.bg, border: `1px solid ${cfg.color}28`,
                      padding: '2px 7px', borderRadius: '20px',
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                      {count} {cfg.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Events scrollable list */}
            <div className="agenda-scroll" style={{
              flex: 1, overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: '7px',
            }}>
              {selectedEvents.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '24px 0', color: '#8893A7',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: '#F5FAFE', border: '1px solid #DCE5F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AlertCircle size={18} color="#94A3B8" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>No events scheduled</div>
                    <div style={{ fontSize: '11px', color: '#8893A7', marginTop: '2px' }}>
                      Click any highlighted date to view its agenda
                    </div>
                  </div>
                </div>
              ) : (
                selectedEvents.map((event, idx) => (
                  <div
                    key={`${event.id}-${idx}`}
                    className="agenda-event-row"
                    style={{ animationDelay: `${idx * 35}ms` }}
                  >
                    <EventChip event={event} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
