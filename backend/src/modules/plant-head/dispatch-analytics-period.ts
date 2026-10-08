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
  if (pStr.includes('DMHC') || pStr.includes('D MHC') || pStr.includes('DOUBLESEAL') || pStr.includes('DOUBLE')) return 'D MHC';
  if (pStr.includes('ONGC')) return 'ONGC';
  if (pStr.includes('WGC') || pStr.includes('GULLY')) return 'WGC';
  if (pStr.includes('RCS') || pStr.includes('RECESSED')) return 'RCS';
  if (pStr.includes('MHC') || pStr.includes('MANHOLE')) return 'MHC';
  if (pStr.includes('GRATING')) return 'FRP MOULDED GRATING';
  if (pStr.includes('WCB') || pStr.includes('PCB') || pStr.includes('COVER BLOCK')) return 'COVER BLOCK';
  return raw?.trim() || name?.trim() || 'FRP Product';
}

export function standardizeCapacity(raw?: string, name?: string): string {
  const c = `${raw || ''} ${name || ''}`.toUpperCase();
  if (!c.trim()) return 'Standard Duty';
  if (c.includes('D400') || c.includes('D-400') || c.includes('40T')) return 'D400';
  if (c.includes('C250') || c.includes('C-250') || c.includes('25T')) return 'C250';
  if (c.includes('B125') || c.includes('B-125') || c.includes('12.5T')) return 'B125';
  if (c.includes('ELD') || c.includes('EXTRA LIGHT')) return 'ELD';
  if (c.includes('3T') || c.includes('3 TON')) return '3T';
  if (c.includes('E600') || c.includes('E-600') || c.includes('60T')) return 'E600';
  if (c.includes('F900') || c.includes('F-900') || c.includes('90T')) return 'F900';
  if (c.includes('LD') || c.includes('LIGHT DUTY') || c.includes('2.5T')) return 'LD';
  if (c.includes('GRATING')) return 'Standard Duty';
  if (c.includes('WCB') || c.includes('PCB') || c.includes('COVER BLOCK')) return 'Civil Accessory';
  return 'Standard Duty';
}

export function standardizeSize(raw?: string, name?: string): string {
  let s = `${raw || ''} ${name || ''}`.toUpperCase().replace(/\s*[xX*×]\s*/g, ' × ');
  if (!s.trim()) return 'Standard Size';

  // Specific millimeter sizes
  if (s.includes('1800 × 1800')) return '1800 × 1800';
  if (s.includes('1500 × 1500')) return '1500 × 1500';
  if (s.includes('1200 × 1200')) return '1200 × 1200';
  if (s.includes('1200 × 900') || s.includes('900 × 1200')) return '1200 × 900';
  if (s.includes('1000 × 1000')) return '1000 × 1000';
  if (s.includes('900 × 900')) return '900 × 900';
  if (s.includes('750 × 750')) return '750 × 750';
  if (s.includes('600 × 900') || s.includes('900 × 600')) return '600 × 900';
  if (s.includes('600 × 600')) return '600 × 600';
  if (s.includes('450 × 600') || s.includes('600 × 450')) return '450 × 600';
  if (s.includes('450 × 450')) return '450 × 450';
  if (s.includes('300 × 700') || s.includes('700 × 300')) return '300 × 700';
  if (s.includes('300 × 300')) return '300 × 300';
  if (s.includes('900') && (s.includes('MM') || s.includes('DIA'))) return '900 MM DIA';

  // Inch sizes
  if (s.includes('30 × 30')) return '30" × 30" (750 × 750)';
  if (s.includes('28 × 28')) return '28" × 28" (700 × 700)';
  if (s.includes('24 × 24')) return '24" × 24" (600 × 600)';
  if (s.includes('21 × 21')) return '21" × 21" (530 × 530)';
  if (s.includes('18 × 24') || s.includes('24 × 18')) return '18" × 24" (450 × 600)';
  if (s.includes('18 × 18')) return '18" × 18" (450 × 450)';
  if (s.includes('12 × 12')) return '12" × 12" (300 × 300)';
  if (s.includes('10 × 10')) return '10" × 10" (250 × 250)';

  // Grating depths
  if (s.includes('38MM') || s.includes('38 MM')) return '38 MM Mesh';
  if (s.includes('30MM') || s.includes('30 MM')) return '30 MM Mesh';
  if (s.includes('25MM') || s.includes('25 MM')) return '25 MM Mesh';

  // Cover blocks
  if (s.includes('50MM') || s.includes('50 MM')) return '50 MM Block';
  if (s.includes('40MM') || s.includes('40 MM')) return '40 MM Block';
  if (s.includes('MULTIPLE')) return 'Multi-Size Block';

  return raw?.trim() || 'Standard Size';
}

export function standardizeColour(raw?: string, name?: string): string {
  const c = `${raw || ''} ${name || ''}`.toUpperCase();
  if (c.includes('GREEN') || c.includes('P.GREEN') || c.includes('GRN')) return 'P.Green';
  if (c.includes('WHITE') || c.includes('WHT')) return 'White';
  if (c.includes('BLACK') || c.includes('BLK')) return 'Black';
  if (c.includes('RED')) return 'Red';
  if (c.includes('IVORY')) return 'Ivory';
  if (c.includes('GREY') || c.includes('GRAY')) return 'Grey';
  return 'Grey'; // Authoritative factory standard for FRP composite products
}

export function getNominalUnitWeight(rawName: string, prod?: string, cap?: string, size?: string): number {
  const p = prod || standardizeProduct('', rawName);
  const c = cap || standardizeCapacity('', rawName);
  const sz = size || standardizeSize('', rawName);
  const s = (rawName || '').toUpperCase();

  // Cover blocks
  if (p === 'COVER BLOCK') {
    if (s.includes('50MM')) return 0.13;
    if (s.includes('40MM')) return 0.08;
    return 0.14;
  }

  // Grating
  if (p === 'FRP MOULDED GRATING') {
    if (s.includes('38MM')) return 12.0;
    if (s.includes('30MM')) return 9.5;
    if (s.includes('25MM')) return 7.5;
    return 8.0;
  }

  // Double manhole covers (DMHC)
  if (p === 'D MHC') {
    if (sz.includes('1800 × 1800')) return c === 'D400' ? 450 : 250;
    if (sz.includes('1500 × 1500')) return c === 'D400' ? 350 : 135;
    if (sz.includes('1200 × 1200')) return c === 'D400' ? 260 : 180;
    if (sz.includes('900 × 900')) return c === 'D400' ? 170 : 90;
    if (sz.includes('750 × 750')) return c === 'D400' ? 120 : 60;
    if (sz.includes('600 × 600')) return c === 'D400' ? 85 : 45;
    return c === 'D400' ? 150 : 80;
  }

  // Manhole covers (MHC), Water Gully (WGC), Recessed (RCS), ONGC
  if (sz.includes('1800 × 1800')) return 260;
  if (sz.includes('1500 × 1500')) return 140;
  if (sz.includes('1200 × 1200')) return c === 'D400' ? 240 : 110;
  if (sz.includes('1000 × 1000')) return c === 'D400' ? 180 : 85;
  if (sz.includes('900 × 900')) return c === 'D400' ? 160 : (c === 'C250' ? 90 : 65);
  if (sz.includes('600 × 900') || sz.includes('18" × 24"')) return c === 'D400' ? 130 : 60;
  if (sz.includes('750 × 750') || sz.includes('30" × 30"')) return c === 'D400' ? 110 : (c === 'C250' ? 60 : 35);
  if (sz.includes('28" × 28"')) return 22;
  if (sz.includes('600 × 600') || sz.includes('24" × 24"')) return c === 'D400' ? 86 : (c === 'C250' ? 45 : (c === 'B125' ? 35 : 22));
  if (sz.includes('21" × 21"')) return 12;
  if (sz.includes('450 × 450') || sz.includes('18" × 18"')) return c === 'D400' ? 40 : 12;
  if (sz.includes('300 × 300') || sz.includes('12" × 12"')) return 6;
  if (sz.includes('10" × 10"')) return 3;

  return 20; // Default generic unit weight
}

