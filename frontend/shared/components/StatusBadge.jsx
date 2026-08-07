
export default function StatusBadge({ status }) {
  const getStatusDisplay = (stat) => {
    if (!stat) return '';
    const displayMap = {
      'PENDING_PLANT_HEAD': 'Ready for Confirmation',
      'PLANT_PENDING': 'Sent to Plant Head',
      'Plant Pending': 'Sent to Plant Head',
      'WORK_ORDER_CREATED': 'Work Order Created',
      'IN_PRODUCTION': 'In Production',
      'PRODUCTION_COMPLETED': 'Production Completed',
      'QC_PENDING': 'QC Pending',
      'QC_PASSED': 'QC Passed',
      'QC_REJECTED': 'QC Rejected',
      'DISPATCH_READY': 'Ready for Dispatch',
      'DISPATCH_CREATED': 'Dispatched',
      'DELIVERED': 'Delivered',
      'PAYMENT_PENDING': 'Payment Pending',
      'CLOSED': 'Closed',
      'REQUESTED': 'Requested',
      'APPROVED': 'Approved',
      'RETURNED_FOR_CORRECTION': 'Returned for Correction',
      'READY_FOR_RELEASE': 'Ready for Release',
      'ISSUED': 'Issued',
      // Brand Analysis statuses
      'PENDING_SUPER_ADMIN_APPROVAL': 'Pending Super Admin Approval',
      'SUPER_ADMIN_APPROVED': 'Super Admin Approved',
      'SUPER_ADMIN_REJECTED': 'Super Admin Rejected',
      'FINANCE_ANALYSIS_IN_PROGRESS': 'Finance Analysis In Progress',
      'FINANCE_ANALYSIS_COMPLETED': 'Finance Analysis Completed',
      'FINANCE_REJECTED': 'Finance Rejected',
    };
    return displayMap[stat] || stat.replace(/_/g, ' ');
  };

  const getBadgeStyle = (stat) => {
    if (!stat) return { background: '#f1f5f9', color: '#475569', border: '1px solid #D6E2F0' };
    const s = String(stat).toLowerCase();
    
    // Green / Success: Approved, Completed, Delivered, Closed, QC Passed
    if (s.includes('confirm') || s.includes('issue') || s.includes('approve') || 
        s === 'verified' || s === 'paid' || s === 'won' || s === 'completed' || 
        s === 'qc approved' || s.includes('good') || s === 'active' || 
        s === 'delivered' || s === 'closed' || s.includes('passed') || 
        s === 'approved' || s === 'issued') {
      return { background: 'rgba(34, 197, 94, 0.12)', color: '#166534', border: '1px solid rgba(34, 197, 94, 0.2)' };
    }

    // Purple / Prepared: prepared, preparing, ready_for_release, production_completed
    if (s.includes('prepare') || s === 'ready_for_release' || s.includes('production_completed') || s === 'production completed') {
      return { background: 'rgba(99, 102, 241, 0.14)', color: '#4338ca', border: '1px solid rgba(99, 102, 241, 0.25)' };
    }

    // Blue / In Progress: Plant, Production, Dispatched, In Transit
    if (s.includes('plant') || s.includes('run') || s.includes('process') || 
        s.includes('partial') || s === 'follow-up' || s.includes('plan') || 
        s.includes('transit') || s.includes('dispatch') || s.includes('production') || 
        s.includes('created')) {
      return { background: 'rgba(59, 130, 246, 0.12)', color: '#1e40af', border: '1px solid rgba(59, 130, 246, 0.2)' };
    }

    // Orange / Warning: Returned, Returned for Correction, returned_for_correction
    if (s.includes('return') || s === 'returned_for_correction') {
      return { background: 'rgba(249, 115, 22, 0.12)', color: '#c2410c', border: '1px solid rgba(249, 115, 22, 0.2)' };
    }

    // Yellow / Pending: Pending, Sent, Draft, Requested
    if (s.includes('pending') || s.includes('draft') || s === 'sent' || s === 'new' || s === 'requested') {
      return { background: 'rgba(234, 179, 8, 0.12)', color: '#854d0e', border: '1px solid rgba(234, 179, 8, 0.2)' };
    }

    // Red / Alert: Reject, Lost, Hold, Cancelled
    if (s.includes('reject') || s.includes('lost') || s.includes('out') || 
        s.includes('fail') || s === 'hold' || s === 'qc rejected' || 
        s.includes('low') || s.includes('delay') || s.includes('cancel')) {
      return { background: 'rgba(239, 68, 68, 0.12)', color: '#991b1b', border: '1px solid rgba(239, 68, 68, 0.2)' };
    }
    
    return { background: '#f1f5f9', color: '#475569', border: '1px solid #D6E2F0' };
  };

  const style = getBadgeStyle(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 'bold',
      letterSpacing: '0.02em',
      textTransform: 'capitalize',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      lineHeight: '1.2',
      boxSizing: 'border-box',
      flexShrink: 0,
      ...style
    }}>
      {getStatusDisplay(status)}
    </span>
  );
}
