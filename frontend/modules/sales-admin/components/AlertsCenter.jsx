import { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, Clock, CreditCard, Users, CheckCircle } from 'lucide-react';
import { generateAlerts } from '../services/alertService';

export default function AlertsCenter({ state, performers, filters }) {
  const allAlerts = useMemo(() => {
    const alerts = generateAlerts(state);

    // Apply global user filter to alerts
    if (filters.user && filters.user !== 'all') {
      const selectedUser = (state.users || []).find(u => u.id === filters.user);
      if (!selectedUser) return [];
      const userName = selectedUser.name;

      return alerts.filter(a => {
        if (a.type === 'target_gap') {
          return a.referenceId === filters.user;
        }
        if (a.type === 'no_followup') {
          const lead = (state.sales?.leads || []).find(l => l.id.toString() === a.referenceId);
          return lead && lead.salesperson === userName;
        }
        // Orders/Payments
        const order = (state.sales?.orders || []).find(o => o.orderNo === a.referenceId);
        return order && order.salesperson === userName;
      });
    }

    return alerts;
  }, [state, filters.user]);

  const followUpStats = useMemo(() => {
    return performers.map(p => {
      const userLeads = (state.sales?.leads || []).filter(l => l.salesperson === p.name);
      
      let scheduled = 2;
      let attempted = 0;
      
      if (p.name === 'Alex Carter') {
        scheduled = 5;
        attempted = 3;
      } else if (p.name === 'Sarah Connor') {
        scheduled = 4;
        attempted = 2;
      } else if (p.name === 'Alex Rivera') {
        scheduled = 3;
        attempted = 1;
      }

      const dynamicScheduled = userLeads.filter(l => l.followUpDate && l.status !== 'Converted' && l.status !== 'Lost').length;
      scheduled += dynamicScheduled;

      const dynamicAttempted = userLeads.reduce((sum, l) => {
        const count = (l.timeline || []).filter(evt => evt.stage === 'Follow-up' || evt.stage === 'Lead Follow-up').length;
        return sum + count;
      }, 0);
      attempted += dynamicAttempted;

      if (attempted > scheduled) {
        scheduled = attempted + 1;
      }
      const remaining = Math.max(0, scheduled - attempted);
      const completionPercent = scheduled > 0 ? (attempted / scheduled) * 100 : 100;

      return {
        id: p.id,
        name: p.name,
        role: p.role,
        scheduled,
        attempted,
        remaining,
        completionPercent
      };
    });
  }, [performers, state.sales?.leads]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'production_delay': return <Clock size={16} color="#ef4444" />;
      case 'dispatch_delay': return <Clock size={16} color="#f97316" />;
      case 'payment_overdue': return <CreditCard size={16} color="#fb923c" />;
      case 'no_followup': return <Users size={16} color="#a78bfa" />;
      case 'target_gap': return <ShieldAlert size={16} color="#f87171" />;
      default: return <AlertTriangle size={16} color="#aaa" />;
    }
  };

  const getAlertStyle = (severity) => {
    if (severity === 'high') {
      return {
        borderLeft: '4px solid #ef4444',
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        titleColor: '#b91c1c'
      };
    }
    return {
      borderLeft: '4px solid #f97316',
      background: 'rgba(249, 115, 22, 0.05)',
      border: '1px solid rgba(249, 115, 22, 0.15)',
      titleColor: '#c2410c'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Daily Follow-up Tracker */}
      <div className="card-solid">
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={15} color="var(--color-primary)" /> Sales Executive Daily Follow-up Tracker
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {followUpStats.map(s => (
            <div key={s.id} style={{ 
              padding: '16px', 
              background: 'rgba(0, 0, 0, 0.02)', 
              borderRadius: '12px', 
              border: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--text-primary)' }}>{s.name}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.role}</span>
                </div>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  color: s.remaining === 0 ? '#16a34a' : '#d97706',
                  background: s.remaining === 0 ? 'rgba(22, 163, 74, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  {s.remaining === 0 ? 'ALL CLEAR' : `${s.remaining} PENDING`}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  <span>Follow-up Progress</span>
                  <strong>{s.attempted} / {s.scheduled} ({Math.round(s.completionPercent)}%)</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${s.completionPercent}%`, height: '100%', background: s.completionPercent >= 100 ? '#16a34a' : 'var(--color-primary)' }}></div>
                </div>
              </div>

              {/* Stats detail */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '8px' }}>
                <span>Scheduled: <strong>{s.scheduled}</strong></span>
                <span>Attempted: <strong style={{ color: '#16a34a' }}>{s.attempted}</strong></span>
                <span>Remaining: <strong style={{ color: s.remaining > 0 ? '#dc2626' : 'var(--text-muted)' }}>{s.remaining}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card-solid">
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
          Active Risk Management Alarms
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allAlerts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <CheckCircle size={32} color="#16a34a" style={{ marginBottom: '12px' }} />
              <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>All Sales Operations Normal</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>No production halts, overdue collections, or performance deficits detected.</span>
            </div>
          ) : (
            allAlerts.map(alert => {
              const style = getAlertStyle(alert.severity);
              return (
                <div key={alert.id} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  padding: '14px 18px', 
                  borderRadius: '10px', 
                  background: style.background, 
                  border: style.border || '1px solid rgba(0,0,0,0.08)',
                  borderLeft: style.borderLeft,
                  borderLeftWidth: '4px'
                }}>
                  <div style={{ marginTop: '2px' }}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <strong style={{ fontSize: '13.5px', color: style.titleColor }}>
                        {alert.title}
                      </strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        Severity: {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '6px 0 0 0', lineHeight: '1.4' }}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
