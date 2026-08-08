export interface PaymentValidationResult {
  valid: boolean;
  error?: string;
}

export const PAYMENT_TERMS_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '15 Days (Default)', value: 15 },
  { label: '20 Days', value: 20 },
  { label: 'Custom (Max 20 Days)', value: 'custom' },
];

export function validatePaymentTerms(days: number, maxAllowedDays: number = 20): PaymentValidationResult {
  if (isNaN(days) || days < 1) {
    return { valid: false, error: 'Payment terms must be at least 1 day.' };
  }
  if (days > maxAllowedDays) {
    return { valid: false, error: `Payment terms cannot exceed ${maxAllowedDays} days.` };
  }
  return { valid: true };
}

export function calculateDueDate(deliveryDateStr: string, paymentTermsDays: number): string {
  if (!deliveryDateStr || isNaN(paymentTermsDays)) return '--';
  const deliveryDate = new Date(deliveryDateStr);
  if (isNaN(deliveryDate.getTime())) return '--';
  
  const dueDate = new Date(deliveryDate);
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);
  return dueDate.toISOString().split('T')[0];
}

export function calculateRemainingDays(dueDateStr: string): number | null {
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

export function formatRemainingDays(remainingDays: number | null, status: string): string {
  if (status === 'Waiting for Delivery' || remainingDays === null) return '--';
  if (status === 'Paid') return 'Completed';
  if (remainingDays < 0) {
    return `Overdue by ${Math.abs(remainingDays)} Day${Math.abs(remainingDays) > 1 ? 's' : ''}`;
  }
  if (remainingDays === 0) return '0 Days (Due Today)';
  return `${remainingDays} Day${remainingDays > 1 ? 's' : ''}`;
}

export function getPaymentStatus(
  orderStatus: string,
  deliveryDateStr: string | undefined,
  paymentTermsDays: number,
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
  const remainingDays = calculateRemainingDays(dueDate);

  if (remainingDays === null) {
    return {
      status: 'Waiting for Delivery',
      dueDate: '--',
      remainingDays: null,
      pendingAmount,
      badgeColor: 'gray'
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
