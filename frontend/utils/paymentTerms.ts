export interface PaymentValidationResult {
  valid: boolean;
  error?: string;
}

export const PAYMENT_TERMS_OPTIONS = [
  { label: 'Advance (Immediate)', value: 'Advance' },
  { label: '7 Days', value: 7 },
  { label: '15 Days (Default)', value: 15 },
  { label: '20 Days', value: 20 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: 'Custom', value: 'custom' },
];

export function validatePaymentTerms(days: number | string, maxAllowedDays: number = 20): PaymentValidationResult {
  if (String(days).toLowerCase().includes('advance') || days === 0) {
    return { valid: true };
  }
  const numDays = typeof days === 'number' ? days : parseInt(String(days), 10);
  if (isNaN(numDays) || numDays < 1) {
    return { valid: false, error: 'Payment terms must be at least 1 day.' };
  }
  if (numDays > maxAllowedDays) {
    return { valid: false, error: `Payment terms cannot exceed ${maxAllowedDays} days.` };
  }
  return { valid: true };
}

export function calculateDueDate(deliveryDateStr: string, paymentTermsDays: number | string): string {
  if (!deliveryDateStr) return '--';
  const isAdvance = String(paymentTermsDays).toLowerCase().includes('advance') || paymentTermsDays === 0;
  if (isAdvance) return deliveryDateStr;
  const numDays = typeof paymentTermsDays === 'number' ? paymentTermsDays : parseInt(String(paymentTermsDays).match(/\d+/)?.[0] || '15', 10);
  if (isNaN(numDays)) return '--';
  const deliveryDate = new Date(deliveryDateStr);
  if (isNaN(deliveryDate.getTime())) return '--';
  
  const dueDate = new Date(deliveryDate);
  dueDate.setDate(dueDate.getDate() + numDays);
  return dueDate.toISOString().split('T')[0];
}

export function calculateRemainingDays(dueDateStr: string, isAdvance: boolean = false): number | null {
  if (isAdvance) return 0;
  if (!dueDateStr || dueDateStr === '--') return null;
  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatRemainingDays(remainingDays: number | null, status: string, isAdvance: boolean = false): string {
  if (status === 'Waiting for Delivery' || remainingDays === null) return '--';
  if (status === 'Paid') return 'Completed';
  if (isAdvance) return '0 Days (Advance)';
  if (remainingDays < 0) {
    return `Overdue by ${Math.abs(remainingDays)} Day${Math.abs(remainingDays) > 1 ? 's' : ''}`;
  }
  if (remainingDays === 0) return '0 Days (Due Today)';
  return `${remainingDays} Day${remainingDays > 1 ? 's' : ''}`;
}

export function getPaymentStatus(
  orderStatus: string,
  deliveryDateStr: string | undefined,
  paymentTermsDays: number | string,
  totalAmount: number,
  paidAmount: number
): {
  status: 'Waiting for Delivery' | 'Not Due' | 'Due Today' | 'Overdue' | 'Paid';
  dueDate: string;
  remainingDays: number | null;
  pendingAmount: number;
  badgeColor: 'gray' | 'blue' | 'orange' | 'red' | 'green';
} {
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const isAdvance = String(paymentTermsDays).toLowerCase().includes('advance') || paymentTermsDays === 0;

  if (pendingAmount === 0 && totalAmount > 0) {
    return {
      status: 'Paid',
      dueDate: deliveryDateStr ? calculateDueDate(deliveryDateStr, paymentTermsDays) : '--',
      remainingDays: null,
      pendingAmount: 0,
      badgeColor: 'green'
    };
  }

  const isDelivered = String(orderStatus).toLowerCase() === 'delivered' || String(orderStatus).toLowerCase() === 'closed';
  
  if (!isDelivered || !deliveryDateStr) {
    return {
      status: 'Waiting for Delivery',
      dueDate: '--',
      remainingDays: null,
      pendingAmount,
      badgeColor: 'gray'
    };
  }

  const dueDate = calculateDueDate(deliveryDateStr, paymentTermsDays);
  const remainingDays = calculateRemainingDays(dueDate, isAdvance);

  if (remainingDays === null) {
    return {
      status: 'Waiting for Delivery',
      dueDate: '--',
      remainingDays: null,
      pendingAmount,
      badgeColor: 'gray'
    };
  }

  if (isAdvance) {
    return {
      status: 'Due Today',
      dueDate,
      remainingDays: 0,
      pendingAmount,
      badgeColor: 'orange'
    };
  }

  if (remainingDays > 0) {
    return {
      status: 'Not Due',
      dueDate,
      remainingDays,
      pendingAmount,
      badgeColor: 'blue'
    };
  } else if (remainingDays === 0) {
    return {
      status: 'Due Today',
      dueDate,
      remainingDays,
      pendingAmount,
      badgeColor: 'orange'
    };
  } else {
    return {
      status: 'Overdue',
      dueDate,
      remainingDays,
      pendingAmount,
      badgeColor: 'red'
    };
  }
}
