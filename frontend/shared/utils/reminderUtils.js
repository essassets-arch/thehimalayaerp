const pad = (n) => String(n).padStart(2, '0');

export const formatReminderDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const formatReminderTime = (timeStr) => {
  if (!timeStr) return '';
  const str = String(timeStr).trim();
  // Filter out default UTC midnight conversions that produce 05:30 or 00:00
  if (str === '05:30' || str === '05:30:00' || str === '00:00' || str === '00:00:00') return '';
  const [h, m] = str.split(':').map(Number);
  if (Number.isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${pad(m || 0)} ${period}`;
};

export const toDateOnly = (value) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const daysUntil = (dateStr) => {
  if (!dateStr) return NaN;
  const target = startOfDay(new Date(`${dateStr}T00:00:00`));
  if (Number.isNaN(target.getTime())) return NaN;
  const today = startOfDay();
  return Math.round((target - today) / 86400000);
};

export const getReminderTimingLabel = (reminder) => {
  if (!reminder || reminder.status === 'Completed' || reminder.status === 'Cancelled') return null;
  const date = reminder.reminderDate || reminder.reminder_date;
  if (!date) return null;
  const diff = daysUntil(date);
  if (diff < 0) return { label: `Overdue (${Math.abs(diff)} Day${Math.abs(diff) === 1 ? '' : 's'})`, tone: 'overdue' };
  if (diff === 0) return { label: 'Due Today', tone: 'today' };
  if (diff === 1) return { label: 'Tomorrow', tone: 'tomorrow' };
  return null;
};

export const getNextPendingReminder = (reminders, moduleType, moduleId) => {
  const pending = (reminders || [])
    .filter((r) =>
      r.moduleType === moduleType &&
      String(r.moduleId) === String(moduleId) &&
      (r.status === 'Pending' || r.status === 'Upcoming')
    )
    .sort((a, b) => {
      const ad = `${a.reminderDate || ''} ${a.reminderTime || ''}`;
      const bd = `${b.reminderDate || ''} ${b.reminderTime || ''}`;
      return ad.localeCompare(bd);
    });
  return pending[0] || null;
};

export const filterRemindersByBucket = (reminders, bucket) => {
  const list = Array.isArray(reminders) ? reminders : [];
  if (!bucket || bucket === 'All') return list;
  if (bucket === 'Completed') return list.filter((r) => r.status === 'Completed');
  if (bucket === 'Overdue') {
    return list.filter((r) => (r.status === 'Pending' || r.status === 'Upcoming') && daysUntil(r.reminderDate) < 0);
  }
  if (bucket === 'Today') {
    return list.filter((r) => (r.status === 'Pending' || r.status === 'Upcoming') && daysUntil(r.reminderDate) === 0);
  }
  if (bucket === 'Tomorrow') {
    return list.filter((r) => (r.status === 'Pending' || r.status === 'Upcoming') && daysUntil(r.reminderDate) === 1);
  }
  if (bucket === 'This Week') {
    return list.filter((r) => {
      if (r.status !== 'Pending' && r.status !== 'Upcoming') return false;
      const diff = daysUntil(r.reminderDate);
      return diff >= 0 && diff <= 6;
    });
  }
  return list;
};

export const LEAD_REMINDER_TYPES = [
  'Call Customer',
  'WhatsApp',
  'Email',
  'Meeting',
  'Follow Up',
  'Visit',
  'Payment',
  'Other'
];

export const QUOTATION_REMINDER_TYPES = [
  'Call',
  'Email',
  'Negotiation',
  'Price Follow-up',
  'Visit',
  'Expiry Reminder',
  'Other'
];

export const getTodayPendingReminders = (reminders) =>
  filterRemindersByBucket(reminders, 'Today')
    .filter((r) => r.status === 'Pending')
    .sort((a, b) => {
      const at = a.reminderTime || '99:99';
      const bt = b.reminderTime || '99:99';
      return at.localeCompare(bt);
    });

export const mapBackendReminder = (row) => ({
  id: row.id,
  moduleType: row.moduleType || row.module_type,
  moduleId: row.moduleId || row.module_id,
  customerId: row.customerId || row.customer_id,
  customerName: row.customerName || row.customer_name,
  title: row.title,
  reminderType: row.reminderType || row.reminder_type,
  priority: row.priority || 'Medium',
  reminderDate: toDateOnly(row.reminderDate || row.reminder_date),
  reminderTime: row.reminderTime || (row.reminder_time ? String(row.reminder_time).slice(0, 5) : null),
  remarks: row.remarks || '',
  status: row.status || 'Pending',
  createdBy: row.createdBy || row.created_by,
  completedAt: row.completedAt || row.completed_at,
  createdAt: row.createdAt || row.created_at
});
