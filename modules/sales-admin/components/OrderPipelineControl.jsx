import { useMemo } from 'react';
import { Box, Wrench, ShieldCheck, Layers, Truck, AlertCircle, Clock } from 'lucide-react';
import { generateAlerts } from '../services/alertService';
import { matchesTimeFilter } from '../services/analyticsService';

export default function OrderPipelineControl({ state, filters }) {
  // Filter orders dynamically based on global filters
  const orders = useMemo(() => {
    let list = state.sales?.orders || [];

    // Filter by User
    if (filters?.user && filters.user !== 'all') {
      const selectedUser = (state.users || []).find(u => u.id === filters.user);
      if (selectedUser) {
        list = list.filter(o => o.salesperson === selectedUser.name);
      }
    }

    // Filter by Time
    if (filters?.time && filters.time !== 'all') {
      list = list.filter(o => matchesTimeFilter(o.date, filters.time));
    }

    return list;
  }, [state.sales?.orders, state.users, filters]);

  // Generate delay alarms specifically for these filtered orders
  const orderAlerts = useMemo(() => {
    const allAlerts = generateAlerts(state);
    const orderNos = orders.map(o => o.orderNo);
    return allAlerts.filter(a => 
      (a.type === 'production_delay' || a.type === 'dispatch_delay') && 
      orderNos.includes(a.referenceId)
    );
  }, [state, orders]);

  const getStageStyle = (status) => {
    if (status === 'Completed' || status === 'Approved' || status === 'Issued') {
      return { bg: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', border: '1px solid rgba(22, 163, 74, 0.2)' };
    }
    if (status === 'Running' || status === 'Pending') {
      return { bg: 'rgba(202, 138, 4, 0.08)', color: '#ca8a04', border: '1px solid rgba(202, 138, 4, 0.2)' };
    }
    return { bg: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)', border: '1px solid rgba(0,0,0,0.08)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* 1. Alerts Section */}
      {orderAlerts.length > 0 && (
        <div className="alert-danger" style={{ padding: '20px', borderRadius: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
            <AlertCircle size={16} /> Active Logistics & Production Delay Warnings ({orderAlerts.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orderAlerts.map(alert => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', background: 'rgba(239, 68, 68, 0.02)', padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <Clock size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#dc2626' }}>{alert.title}</strong> — <span style={{ color: 'var(--text-secondary)' }}>{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Order Progression Scoreboard */}
      <div className="card-solid">
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
          Active Orders Workflow Progression Tracker
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 10px' }}>Order No</th>
                <th style={{ padding: '12px 10px' }}>Client & Items</th>
                <th style={{ padding: '12px 10px' }}>Current Phase</th>
                <th style={{ padding: '12px 10px' }}>1. Production</th>
                <th style={{ padding: '12px 10px' }}>2. Plant Head</th>
                <th style={{ padding: '12px 10px' }}>3. Store (Material)</th>
                <th style={{ padding: '12px 10px' }}>4. Dispatch</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const isDelayed = orderAlerts.some(a => a.referenceId === order.orderNo);
                const prodStyle = getStageStyle(order.productionStatus);
                const headStyle = getStageStyle(order.plantHeadStatus);
                const storeStyle = getStageStyle(order.storeStatus);
                const dispStyle = getStageStyle(order.dispatchStatus);

                return (
                  <tr key={order.orderNo} style={{ borderBottom: '1px solid var(--border-soft)', fontSize: '13px' }}>
                    <td style={{ padding: '14px 10px' }}>
                      <strong style={{ color: isDelayed ? '#dc2626' : 'var(--text-primary)', fontSize: '14px' }}>{order.orderNo}</strong>
                      {isDelayed && <span style={{ fontSize: '9px', background: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', padding: '2px 4px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold' }}>DELAYED</span>}
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--text-primary)' }}>{order.customer?.name}</span>
                      <span style={{ fontSize: '10.5px', color: '#888' }}>{order.products} • Rep: {order.salesperson}</span>
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(2, 132, 199, 0.08)',
                        color: '#0284c7',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(2, 132, 199, 0.15)'
                      }}>
                        <Box size={12} />
                        {order.overallStage}
                      </span>
                    </td>
                    
                    {/* Production */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ 
                        fontSize: '11.5px', 
                        fontWeight: 'bold',
                        color: prodStyle.color,
                        background: prodStyle.bg,
                        border: prodStyle.border,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Wrench size={11} /> {order.productionStatus}
                      </span>
                    </td>

                    {/* Plant Head */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ 
                        fontSize: '11.5px', 
                        fontWeight: 'bold',
                        color: headStyle.color,
                        background: headStyle.bg,
                        border: headStyle.border,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldCheck size={11} /> {order.plantHeadStatus}
                      </span>
                    </td>

                    {/* Store */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ 
                        fontSize: '11.5px', 
                        fontWeight: 'bold',
                        color: storeStyle.color,
                        background: storeStyle.bg,
                        border: storeStyle.border,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Layers size={11} /> {order.storeStatus}
                      </span>
                    </td>

                    {/* Dispatch */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ 
                        fontSize: '11.5px', 
                        fontWeight: 'bold',
                        color: dispStyle.color,
                        background: dispStyle.bg,
                        border: dispStyle.border,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Truck size={11} /> {order.dispatchStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
