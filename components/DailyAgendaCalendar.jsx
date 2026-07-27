import { useState, useMemo } from 'react';
import { useERP } from '../shared/context/ERPContext';
import {
  ChevronLeft, ChevronRight, Calendar, Users, FileText,
  ShoppingCart, CreditCard, TestTube, Package, Truck, AlertCircle,
  PhoneCall
} from 'lucide-react';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function padTwo(n) { return String(n).padStart(2, '0'); }
function toDateStr(y, m, d) { return `${y}-${padTwo(m + 1)}-${padTwo(d)}`; }

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const EVENT_TYPES = {
  lead_followup: { label: 'Lead Follow-up',      icon: PhoneCall,     color: '#f59e0b', bg: '#fef3c7' },
  lead_created:  { label: 'New Lead Registered',  icon: Users,         color: '#10b981', bg: '#d1fae5' },
  sample:        { label: 'Sample',               icon: TestTube,      color: '#0ea5e9', bg: '#e0f2fe' },
  quotation:     { label: 'Quotation Follow-up',  icon: FileText,      color: '#8b5cf6', bg: '#ede9fe' },
  quot_expire:   { label: 'Quotation Expiry',     icon: FileText,      color: '#ec4899', bg: '#fdf2f8' },
  order:         { label: 'Order',                icon: ShoppingCart,  color: '#6366f1', bg: '#eef2ff' },
  delivery:      { label: 'Delivery Due',         icon: Package,       color: '#d97706', bg: '#fef9c3' },
  payment:       { label: 'Payment Due',          icon: CreditCard,    color: '#f43f5e', bg: '#ffe4e6' },
  dispatch:      { label: 'Dispatch',             icon: Truck,         color: '#0891b2', bg: '#ecfeff' },
};

/* ─────────────────────────────────────────
   Derive ALL agenda events from ERP state
───────────────────────────────────────── */
function deriveEvents(state) {
  const events = {}; // { 'YYYY-MM-DD': [event, ...] }

  const addEvent = (dateStr, event) => {
    if (!dateStr || typeof dateStr !== 'string') return;
    const trimmed = dateStr.trim();
    if (!trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) return; // only valid YYYY-MM-DD
    if (!events[trimmed]) events[trimmed] = [];
    events[trimmed].push(event);
  };

  /* ── LEADS ── */
  (state.sales?.leads || []).forEach(lead => {
    // Every follow-up date set for a lead
    if (lead.followUpDate) {
      addEvent(lead.followUpDate, {
        type: 'lead_followup',
        title: `Follow-up: ${lead.companyName}`,
        subtitle: `${lead.contactPerson} · ${lead.salesperson || '—'}`,
        status: lead.status,
        id: `lead-fu-${lead.id}`
      });
    }

    // Each follow-up entry in the lead timeline that has a date
    (Array.isArray(lead.timeline) ? lead.timeline : []).forEach((entry, idx) => {
      if (idx === 0 && entry.date) {
        // First timeline entry = lead created date
        addEvent(entry.date, {
          type: 'lead_created',
          title: `New Lead Registered`,
          subtitle: `${lead.companyName} (${lead.contactPerson})`,
          status: lead.status,
          id: `lead-created-${lead.id}`
        });
      } else if (entry.date && entry.stage && String(entry.stage).toLowerCase().includes('follow')) {
        // Logged follow-up activities in the timeline
        addEvent(entry.date, {
          type: 'lead_followup',
          title: `Follow-up Logged: ${lead.companyName}`,
          subtitle: entry.text || entry.stage,
          status: lead.status,
          id: `lead-tl-${lead.id}-${idx}`
        });
      }
    });
  });

  /* ── SAMPLES ── */
  (state.samples || []).forEach(s => {
    if (s.followUpDate) {
      addEvent(s.followUpDate, {
        type: 'sample',
        title: `Sample Follow-up: ${s.leadName}`,
        subtitle: `${s.product} · Status: ${s.status}`,
        id: `sample-fu-${s.id}`
      });
    }
    if (s.dispatchDate) {
      addEvent(s.dispatchDate, {
        type: 'sample',
        title: `Sample Dispatched: ${s.leadName}`,
        subtitle: `${s.product} · Status: ${s.status}`,
        id: `sample-disp-${s.id}`
      });
    }
    if (s.expiryDate) {
      addEvent(s.expiryDate, {
        type: 'quot_expire',
        title: `Sample Expiry: ${s.leadName}`,
        subtitle: `${s.product} · Status: ${s.status}`,
        id: `sample-exp-${s.id}`
      });
    }
    if (s.deliveredDate) {
      addEvent(s.deliveredDate, {
        type: 'dispatch',
        title: `Sample Delivered: ${s.leadName}`,
        subtitle: `${s.product} · POD confirmed`,
        id: `sample-del-${s.id}`
      });
    }
  });

  /* ── QUOTATIONS ── */
  (state.quotations || []).forEach(q => {
    // Quotation creation date
    if (q.date) {
      addEvent(q.date, {
        type: 'quotation',
        title: `Quotation #QTN-${q.id} Drafted`,
        subtitle: `${q.customerName} · ${q.items} · ₹${(q.totalAmount || 0).toLocaleString('en-IN')}`,
        status: q.status,
        id: `quote-date-${q.id}`
      });
    }
    // Follow-up date
    if (q.followUpDate) {
      addEvent(q.followUpDate, {
        type: 'quotation',
        title: `Quotation Follow-up: ${q.customerName}`,
        subtitle: `${q.items} · ₹${(q.totalAmount || 0).toLocaleString('en-IN')} · ${q.status}`,
        status: q.status,
        id: `quote-fu-${q.id}`
      });
    }
    // Valid-till / expiry
    if (q.validTill) {
      addEvent(q.validTill, {
        type: 'quot_expire',
        title: `Quotation Expires: ${q.customerName}`,
        subtitle: `${q.items} · Status: ${q.status}`,
        id: `quote-exp-${q.id}`
      });
    }
  });

  /* ── ORDERS ── */
  (state.orders || []).forEach(order => {
    if (order.date) {
      addEvent(order.date, {
        type: 'order',
        title: `Order Created: ${order.customer?.name || order.customerName}`,
        subtitle: `${order.products} · ${order.orderNo}`,
        status: order.status,
        id: `order-${order.orderNo}`
      });
    }
    if (order.deliveryDate) {
      addEvent(order.deliveryDate, {
        type: 'delivery',
        title: `Delivery Due: ${order.customer?.name || order.customerName}`,
        subtitle: `${order.products} · ${order.orderNo}`,
        status: order.status,
        id: `delivery-${order.orderNo}`
      });
    }
    // Also pull any follow-up dates from order timeline stages
    (order.timeline || []).forEach((entry, idx) => {
      if (entry.followUpDate) {
        addEvent(entry.followUpDate, {
          type: 'order',
          title: `Order Follow-up: ${order.customer?.name}`,
          subtitle: `${order.orderNo} · ${entry.stage}`,
          id: `order-tl-fu-${order.orderNo}-${idx}`
        });
      }
    });
  });

  /* ── PAYMENTS ── */
  (state.payments || []).forEach(p => {
    if (p.dueDate && p.status !== 'Paid') {
      addEvent(p.dueDate, {
        type: 'payment',
        title: `Payment Due: ${p.customerName}`,
        subtitle: `${p.invoiceNo} · ₹${(p.totalAmount || 0).toLocaleString('en-IN')}`,
        status: p.status,
        id: `payment-${p.id}`
      });
    }
  });

  /* ── DISPATCHES ── */
  (state.dispatches || []).forEach(d => {
    if (d.date) {
      addEvent(d.date, {
        type: 'dispatch',
        title: `Dispatched: ${d.customerName}`,
        subtitle: `${d.vehicleNo} · ${d.quantity} units · ${d.status}`,
        id: `dispatch-${d.id}`
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
   Reads directly from useERP() so it always
   has the live persisted state — no prop needed.
───────────────────────────────────────── */
export default function DailyAgendaCalendar({ state: stateProp }) {
  // Always pull from ERP context (live); fall back to prop if context unavailable
  let erpState;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const erp = useERP();
    erpState = erp.state;
  } catch {
    erpState = stateProp || {};
  }
  const state = erpState;

  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const allEvents = useMemo(() => deriveEvents(state), [state]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      <style>{`
        @keyframes calSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cal-day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
          position: relative;
          min-width: 0;
          padding: 3px 2px;
          user-select: none;
        }
        .cal-day-cell:hover {
          background: #f1f5f9 !important;
          transform: scale(1.1);
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

      {/* ── Month Navigation ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(99,102,241,0.3)',
          }}>
            <Calendar size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#24345C', letterSpacing: '-0.3px' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <div style={{ fontSize: '10px', color: '#8893A7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {monthEventTotal} events this month
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={goToday} style={{
            fontSize: '10px', fontWeight: '700', color: '#6366f1',
            background: '#eef2ff', border: '1px solid #c7d2fe',
            padding: '4px 10px', borderRadius: '8px', cursor: 'pointer',
            marginRight: '2px', transition: 'background 0.15s'
          }}>
            Today
          </button>
          <button onClick={prevMonth} style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: '#f1f5f9', border: '1px solid #DCE5F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ChevronLeft size={14} color="#475569" />
          </button>
          <button onClick={nextMonth} style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: '#f1f5f9', border: '1px solid #DCE5F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ChevronRight size={14} color="#475569" />
          </button>
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div style={{
        background: '#ffffff', border: '1px solid #DCE5F0',
        borderRadius: '14px', padding: '10px', marginBottom: '10px',
      }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '4px' }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '9.5px', fontWeight: '800',
              color: '#8893A7', letterSpacing: '0.05em', padding: '3px 0',
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

            // Up to 3 unique type colors as dots
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
                    {/* Extra grey dot if more types than 3 */}
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

      {/* ── Agenda Panel ── */}
      <div style={{
        background: '#ffffff', border: '1px solid #DCE5F0',
        borderRadius: '14px', overflow: 'hidden',
        flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
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
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#24345C' }}>
              Agenda for {selectedLabel}
            </div>
            <div style={{ fontSize: '10px', color: '#8893A7', fontWeight: '600', marginTop: '2px' }}>
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
          padding: '10px 14px 14px',
          display: 'flex', flexDirection: 'column', gap: '7px',
        }}>
          {selectedEvents.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '20px 0', color: '#8893A7',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#F5FAFE', border: '1px solid #DCE5F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={18} color="#D6E2F0" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#5E6B82' }}>No events</div>
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
  );
}
