import { BadRequestException } from '@nestjs/common';

export const hrDay = (value: Date) => new Date(value.getTime() + 330 * 60000).toISOString().slice(0, 10);
export const hrTime = (value: Date | null) => value ? value.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : null;
export const employedStatuses = ['ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'ON_LEAVE'];
export const presentStatuses = ['PRESENT', 'PUNCHED_IN', 'HALF_DAY', 'MISSING_PUNCH_OUT'];
export const leaveStatuses = ['PAID_LEAVE', 'UNPAID_LEAVE'];

export function hrPeriod(query: any, now: Date) {
  const today = hrDay(now);
  const parse = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Use YYYY-MM-DD dates');
    const date = new Date(`${value}T00:00:00+05:30`);
    if (!Number.isFinite(date.getTime()) || hrDay(date) !== value) throw new BadRequestException('Invalid HR report date');
    return date;
  };
  const allTime = query?.period === 'All Time';
  const start = parse(allTime ? `${today.slice(0, 4)}-01-01` : query?.from || `${today.slice(0, 7)}-01`);
  const end = new Date(parse(allTime ? today : query?.to || today).getTime() + 86400000 - 1);
  if (start > end) throw new BadRequestException('Start date must precede end date');
  return { start, end, allTime, today, todayStart: parse(today), todayEnd: new Date(parse(today).getTime() + 86400000 - 1) };
}

// Missing punches are unknown, not evidence of absence. Holidays and weekly offs
// are excluded from the recorded working-day rate.
export function attendanceCounts(records: any[]) {
  const present = records.filter(a => presentStatuses.includes(a.status)).length;
  const absent = records.filter(a => a.status === 'ABSENT').length;
  const leave = records.filter(a => leaveStatuses.includes(a.status)).length;
  const denominator = present + absent + leave;
  return {
    present, absent, leave,
    late: records.filter(a => a.lateMinutes > 0).length,
    rate: denominator ? Number((present / denominator * 100).toFixed(1)) : null,
    recorded: records.length,
  };
}

export function hrCelebrations(employees: any[], start: Date, end: Date, allTime: boolean, now: Date) {
  const from = allTime ? `${hrDay(now).slice(0, 4)}-01-01` : hrDay(start);
  const to = allTime ? `${hrDay(now).slice(0, 4)}-12-31` : hrDay(end);
  const birthdays: any[] = [], anniversaries: any[] = [];
  for (const employee of employees.filter(e => employedStatuses.includes(e.status))) {
    for (let year = Number(from.slice(0, 4)); year <= Number(to.slice(0, 4)); year++) {
      for (const [field, result] of [['dateOfBirth', birthdays], ['joiningDate', anniversaries]] as const) {
        if (!employee[field]) continue;
        const original = hrDay(new Date(employee[field]));
        const occurrence = `${year}${original.slice(4)}`;
        const date = new Date(`${occurrence}T00:00:00+05:30`);
        if (hrDay(date) !== occurrence || occurrence < from || occurrence > to || occurrence <= original) continue;
        result.push({ id: employee.id, name: employee.fullName, date: occurrence, years: year - Number(original.slice(0, 4)), department: employee.department?.name || 'Unassigned' });
      }
    }
  }
  return { birthdays: birthdays.sort((a, b) => a.date.localeCompare(b.date)), anniversaries: anniversaries.sort((a, b) => a.date.localeCompare(b.date)) };
}
