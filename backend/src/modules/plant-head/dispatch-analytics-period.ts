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
    return { startDate: new Date('1970-01-01T00:00:00.000Z'), endDate: new Date('2099-12-31T23:59:59.999Z'), periodLabel: 'All-Time Aggregate', isAllTime: true };
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

export function standardizeProduct(raw?: string, name?: string): string {
  const pStr = `${raw || ''} ${name || ''}`.toUpperCase();
  if (pStr.includes('DMHC') || pStr.includes('D MHC') || pStr.includes('DOUBLE')) return 'D MHC';
  if (pStr.includes('RCS') || pStr.includes('RECESSED')) return 'RCS';
  if (pStr.includes('ONGC')) return 'ONGC';
  if (pStr.includes('WGC') || pStr.includes('GULLY')) return 'WGC';
  if (pStr.includes('MHC') || pStr.includes('MANHOLE')) return 'MHC';
  return raw?.trim() || name?.trim() || 'Other / Unmapped';
}

export function standardizeCapacity(raw?: string): string {
  if (!raw || raw === 'Not recorded') return 'Other / Unmapped';
  const c = String(raw).trim().toUpperCase();
  if (c.includes('C250') || c.includes('C-250') || c.includes('25T')) return 'C250';
  if (c.includes('B125') || c.includes('B-125') || c.includes('12.5T')) return 'B125';
  if (c.includes('D400') || c.includes('D-400') || c.includes('40T')) return 'D400';
  if (c.includes('E600') || c.includes('E-600') || c.includes('60T')) return 'E600';
  if (c.includes('F900') || c.includes('F-900') || c.includes('90T')) return 'F900';
  if (c.includes('ELD') || c.includes('EXTRA LIGHT')) return 'ELD';
  if (c.includes('3T') || c.includes('3 TON')) return '3T';
  if (c.includes('LD') || c.includes('LIGHT DUTY')) return 'LD';
  return raw?.trim() || 'Other / Unmapped';
}

export function standardizeSize(raw?: string): string {
  if (!raw || raw === 'Not recorded') return 'Other / Unmapped';
  let s = String(raw).trim().toUpperCase();
  s = s.replace(/\s*[xX*×]\s*/g, ' × ');
  if (s.includes('900') && (s.includes('MM') || s.includes('DIA'))) return '900 MM';
  if (s.includes('600') && s.includes('600')) return '600 × 600';
  if (s.includes('1200') && s.includes('1200')) return '1200 × 1200';
  if (s.includes('1200') && s.includes('900')) return '1200 × 900';
  if (s.includes('450') && s.includes('600')) return '450 × 600';
  if (s.includes('600') && s.includes('450')) return '450 × 600';
  if (s.includes('900') && s.includes('900')) return '900 × 900';
  if (s.includes('750') && s.includes('750')) return '750 × 750';
  if (s.includes('450') && s.includes('450')) return '450 × 450';
  if (s.includes('300') && s.includes('300')) return '300 × 300';
  if (s.includes('1000') && s.includes('1000')) return '1000 × 1000';
  if (s.includes('300') && s.includes('700')) return '300 × 700';
  return s || 'Other / Unmapped';
}

export function standardizeColour(raw?: string): string {
  if (!raw || raw === 'Not recorded') return 'Other / Unmapped';
  const c = String(raw).trim().toLowerCase();
  if (c.includes('grey') || c.includes('gray')) return 'Grey';
  if (c.includes('black')) return 'Black';
  if (c.includes('green')) return 'P.Green';
  if (c.includes('red')) return 'Red';
  if (c.includes('white')) return 'White';
  if (c.includes('ivory')) return 'Ivory';
  return raw ? (c.charAt(0).toUpperCase() + c.slice(1)) : 'Other / Unmapped';
}

