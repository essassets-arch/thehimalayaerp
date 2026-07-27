export const ALLOWED_TRANSITIONS = {
  'Pending': ['Created'],
  'Created': ['Planned', 'Material Requested', 'Material Approved', 'Cancelled'],
  'Planned': ['Work Order Created', 'On Hold', 'Cancelled'],
  'Work Order Created': ['Material Requested', 'In Production', 'On Hold', 'Cancelled'],
  'Material Requested': ['Material Approved', 'Shortage', 'Work Order Created', 'On Hold', 'Cancelled'],
  'Shortage': ['Material Requested', 'Material Approved', 'In Production', 'On Hold', 'Cancelled'],
  'Material Approved': ['Material Issued', 'On Hold', 'Cancelled'],
  'Material Issued': ['In Production', 'On Hold', 'Cancelled'],
  'In Production': ['QC Pending', 'Paused', 'On Hold', 'Cancelled'],
  'Paused': ['In Production', 'QC Pending', 'Cancelled'],
  'QC Pending': ['QC Passed', 'In Production', 'On Hold', 'Cancelled'],
  'QC Passed': ['Dispatch Created', 'On Hold', 'Cancelled'],
  'Dispatch Created': ['In Transit', 'On Hold', 'Cancelled'],
  'In Transit': ['Partially Delivered', 'Payment Pending', 'Dispatch Created', 'On Hold', 'Cancelled'],
  'Partially Delivered': ['Dispatch Created', 'Payment Pending', 'On Hold', 'Cancelled'],
  'Payment Pending': ['Payment Verified', 'Cancelled'],
  'Payment Verified': ['Closed'],
  'On Hold': ['Planned', 'In Production', 'Cancelled'],
  'Closed': [],
  'Cancelled': []
};

export function validateTransition(currentStatus, nextStatus) {
  const normalize = (status) => {
    if (!status) return 'Created';
    const s = status.toUpperCase().replace(/\s+/g, '_');
    if (s === 'DISPATCH_READY' || s === 'QC_PASSED') return 'QC Passed';
    if (s === 'DISPATCH_CREATED') return 'Dispatch Created';
    if (s === 'IN_TRANSIT') return 'In Transit';
    if (s === 'PARTIALLY_DELIVERED') return 'Partially Delivered';
    if (s === 'PAYMENT_PENDING') return 'Payment Pending';
    if (s === 'PAYMENT_VERIFIED') return 'Payment Verified';
    if (s === 'CLOSED') return 'Closed';
    if (s === 'CANCELLED') return 'Cancelled';
    if (s === 'IN_PRODUCTION') return 'In Production';
    if (s === 'QC_PENDING') return 'QC Pending';
    if (s === 'PLANNED') return 'Planned';
    if (s === 'WORK_ORDER_CREATED') return 'Work Order Created';
    if (s === 'MATERIAL_REQUESTED') return 'Material Requested';
    if (s === 'MATERIAL_APPROVED') return 'Material Approved';
    if (s === 'MATERIAL_ISSUED') return 'Material Issued';
    if (s === 'PAUSED') return 'Paused';
    if (s === 'ON_HOLD') return 'On Hold';
    return status;
  };

  const current = normalize(currentStatus);
  const target = normalize(nextStatus);
  
  // If no change in status, it is always allowed
  if (current === target) {
    return { allowed: true };
  }

  const allowed = ALLOWED_TRANSITIONS[current] || [];
  
  if (!allowed.includes(target)) {
    return { 
      allowed: false, 
      message: `Invalid ERP workflow transition: Cannot transition order from state "${current}" to "${target}".` 
    };
  }
  return { allowed: true };
}

