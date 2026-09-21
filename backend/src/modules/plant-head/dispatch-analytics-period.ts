import { BadRequestException } from '@nestjs/common';

const IST = 330 * 60 * 1000;
export function recordedDispatchLocation(...addresses: any[]) {
  const address = addresses.find(value => value && (typeof value === 'string' ? value.trim() : Object.keys(value).length));
  const text = typeof address === 'string' ? address : [address?.line1, address?.line2, address?.city, address?.state, address?.pincode].filter(Boolean).join(', ');
  const city = address?.city || 'Not recorded';
  const locality = address?.locality || text || 'Not recorded';
  const pincode = text?.match(/\b[1-9][0-9]{5}\b/)?.[0] || 'Not recorded';
  return { locality, city, pincode, zone: address?.state || 'Not recorded', formattedLocation: text || 'Not recorded' };
}
export const dispatchDay = (date: Date) => new Date(date.getTime() + IST).toISOString().slice(0, 10);

export function dispatchAnalyticsPeriod(filter?: string, customStart?: string, customEnd?: string, month?: string, year?: string, now = new Date()) {
  const today = dispatchDay(now);
  const date = (value?: string) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Use YYYY-MM-DD dates');
    const parsed = new Date(`${value}T00:00:00+05:30`);
    if (!Number.isFinite(parsed.getTime()) || dispatchDay(parsed) !== value) throw new BadRequestException('Invalid date');
    return parsed;
  };
  if (month === 'custom' || filter === 'Custom') {
    const startDate = date(customStart), lastDay = date(customEnd);
    if (startDate > lastDay) throw new BadRequestException('Start date must precede end date');
    return { startDate, endDate: new Date(lastDay.getTime() + 86400000), periodLabel: `${customStart} to ${customEnd}`, isAllTime: false };
  }
  if (month === 'all' || filter === 'All Time' || filter === 'All-Time Aggregate') {
    return { startDate: new Date(-8640000000000000), endDate: new Date(8640000000000000), periodLabel: 'All-Time Aggregate', isAllTime: true };
  }
  let selected = month || today.slice(0, 7);
  if (month && /^\d{1,2}$/.test(month)) selected = `${year || today.slice(0, 4)}-${month.padStart(2, '0')}`;
  if (!month && filter === 'Last Month') {
    selected = dispatchDay(new Date(date(`${today.slice(0, 7)}-01`).getTime() - 86400000)).slice(0, 7);
  } else if (!month && filter && !['This Month', 'Last Month'].includes(filter)) {
    if (/^\d{4}-\d{2}$/.test(filter)) selected = filter;
    else throw new BadRequestException('Select a month or custom date range');
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selected)) throw new BadRequestException('Use a valid YYYY-MM month');
  const startDate = date(`${selected}-01`);
  const [y, m] = selected.split('-').map(Number);
  const endDate = new Date(startDate.getTime());
  endDate.setTime(startDate.getTime() + new Date(Date.UTC(y, m, 0)).getUTCDate() * 86400000);
  const periodLabel = new Date(`${selected}-15T12:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  return { startDate, endDate, periodLabel, isAllTime: false };
}
