import { useERP } from '../context/ERPContext';
import { FileCheck } from 'lucide-react';

export default function ApprovalHistory({ orderNo }) {
  const { state } = useERP();
  
  // Filter material requests for this order
  const mRequests = (state.materialRequests || []).filter(mr => mr.orderNo === orderNo);
  const auditLogs = (state.auditLogs || []).filter(
    log => log.orderNo === orderNo && (log.action.includes('Approve') || log.action.includes('QC') || log.action.includes('Issue'))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileCheck size={16} className="text-primary" />
        Department Approval History
      </h4>

      {mRequests.length === 0 && auditLogs.length === 0 ? (
        <span style={{ fontStyle: 'italic', fontSize: '12.5px', color: 'var(--color-text-secondary)', padding: '10px 0' }}>
          No approval actions logged for this order.
        </span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Material Requests Status Card */}
          {mRequests.map((req, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)' }}>Raw Materials Clearance</span>
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  background: req.status === 'Issued' ? 'rgba(70, 192, 128, 0.15)' : req.status === 'Approved' ? 'rgba(112, 160, 232, 0.15)' : 'rgba(245, 160, 106, 0.15)',
                  color: req.status === 'Issued' ? '#4ade80' : req.status === 'Approved' ? '#60a5fa' : '#f97316'
                }}>
                  {req.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#ccc', margin: 0 }}>
                Material: <strong>{req.materialName}</strong> | Requested: <strong>{req.quantityRequested} Tons</strong> | Approved: <strong>{req.quantityApproved || 0} Tons</strong>
              </p>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Requester: {req.requester}</span>
            </div>
          ))}

          {/* Action Log Entries */}
          {auditLogs.map((log, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.01)',
              borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
              padding: '10px 14px',
              fontSize: '12.5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#fff' }}>{log.action}</strong>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{log.date} {log.time}</span>
              </div>
              <p style={{ color: '#aaa', margin: '4px 0 0 0', fontSize: '11.5px' }}>{log.remarks}</p>
              <span style={{ fontSize: '10px', color: 'var(--color-primary)' }}>Sign-off: {log.user}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
