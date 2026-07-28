import { useMemo } from 'react';
import { ClipboardList, Star } from 'lucide-react';

export default function ActivityLogsPanel({ state, performers, filters }) {
  const auditLogs = state.auditLogs || [];

  // Filter logs based on user filter
  const filteredLogs = useMemo(() => {
    if (filters.user && filters.user !== 'all') {
      const selectedUser = (state.users || []).find(u => u.id === filters.user);
      if (!selectedUser) return [];
      return auditLogs.filter(log => log.user === selectedUser.name);
    }
    
    // Default: show sales related logs
    const salesNames = performers.map(p => p.name);
    return auditLogs.filter(log => salesNames.includes(log.user) || log.action.includes('Target') || log.action.includes('Sales'));
  }, [auditLogs, performers, filters.user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Activity score indexes */}
      <div className="card-solid">
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={15} color="var(--color-primary)" /> Salesperson Activity Index Scores
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {performers.map(p => (
            <div key={p.id} style={{ 
              padding: '16px', 
              background: 'rgba(0, 0, 0, 0.02)', 
              borderRadius: '12px', 
              border: '1px solid rgba(0, 0, 0, 0.06)',
              textAlign: 'center'
            }}>
              <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-primary)' }}>{p.name}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.role}</span>
              
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: 'var(--color-primary)', 
                margin: '10px 0 6px 0' 
              }}>
                {p.activityScore}
              </div>
              <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)', display: 'block', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '6px' }}>
                Followups×3 + Orders×10
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Roster Audit Logs List */}
      <div className="card-solid">
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClipboardList size={15} color="var(--color-primary)" /> Sales Activity Logs & Audit Trail
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 10px' }}>Timestamp</th>
                <th style={{ padding: '12px 10px' }}>User</th>
                <th style={{ padding: '12px 10px' }}>Action Event</th>
                <th style={{ padding: '12px 10px' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} style={{ fontSize: '13px' }}>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'block', fontWeight: '500' }}>{log.date}</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{log.time}</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.user}</strong>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        background: 'rgba(59, 130, 246, 0.08)',
                        color: '#1d4ed8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(59, 130, 246, 0.15)'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>{log.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
