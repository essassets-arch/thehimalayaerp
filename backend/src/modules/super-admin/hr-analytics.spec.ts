import { SuperAdminService } from './super-admin.service';
import { attendanceCounts, hrCelebrations, hrPeriod } from './hr-analytics';

describe('HR analytics (isolated read-only fixtures)', () => {
  const now = new Date('2026-09-23T05:00:00Z');
  const department = { id: 'dept', companyId: 'tenant', name: 'Actual department' };
  const employee: any = {
    id: 'employee', companyId: 'tenant', fullName: 'Actual employee', employeeCode: 'E1',
    status: 'CONFIRMED', employmentType: 'PERMANENT', departmentId: 'dept', department,
    workLocationId: 'location', workLocation: { id: 'location', name: 'Actual location' },
    joiningDate: new Date('2024-01-02'), dateOfBirth: new Date('1990-12-31'),
    createdAt: new Date('2024-01-02'), baseSalary: null,
  };
  const range = { from: '2026-09-01', to: '2026-09-30' };
  function setup(staff = [employee]) {
    const prisma: any = {};
    for (const model of ['employee', 'department', 'attendance', 'manualAttendanceRequest', 'leaveRequest', 'recruitmentRequest', 'payrollPeriod', 'expenseClaim', 'user', 'notification']) {
      // No write methods exist; any attempted seeding or reassignment fails the test.
      prisma[model] = { findMany: jest.fn().mockResolvedValue([]) };
    }
    prisma.employee.findMany.mockImplementation(async ({ where }: any) => staff.filter(e =>
      e.companyId === where.companyId && (!where.id || e.id === where.id) && (!where.departmentId || e.departmentId === where.departmentId),
    ));
    prisma.department.findMany.mockResolvedValue([department]);
    prisma.department.findFirst = jest.fn().mockResolvedValue(department);
    return { service: new SuperAdminService(prisma), prisma };
  }
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(now); });
  afterEach(() => jest.useRealTimers());

  it('is read-only, counts confirmed staff, and does not invent attendance, leave or exit metrics', async () => {
    const { service, prisma } = setup();
    const report = await service.getHrAnalytics(range, 'tenant');
    expect(report.workforce.active).toBe(1);
    expect(report.attendance.today).toMatchObject({ present: 0, absent: 0, unrecorded: 1, rate: null });
    expect(report.attendance.workingHours.avgHours).toBeNull();
    expect(report.leave.balances[0]).toMatchObject({ casual: null, sick: null, earned: null, remaining: null });
    expect(report.recruitment.metrics).toMatchObject({ timeToFill: null, offerAcceptanceRate: null });
    expect(report.exits.clearances).toEqual([]);
    expect(report.exits.summary.notice).toBeNull();
    expect(report.employees[0].baseSalary).toBeNull();
    expect(prisma.department.findMany).toHaveBeenCalledWith({ where: { companyId: 'tenant' } });
  });

  it('never uses historical punches as today and renders India-time trends', async () => {
    const { service, prisma } = setup();
    prisma.attendance.findMany.mockResolvedValueOnce([{
      employeeId: employee.id, employee, status: 'PRESENT', attendanceDate: new Date('2026-08-31T18:30:00Z'),
      punchInAt: new Date('2026-09-01T03:30:00Z'), punchOutAt: new Date('2026-09-01T11:30:00Z'),
      workedMinutes: 480, overtimeMinutes: 0, lateMinutes: 0,
    }]);
    const report = await service.getHrAnalytics(range, 'tenant');
    expect(report.attendance.trends[0]).toMatchObject({ date: '2026-09-01', present: 1, rate: 100 });
    expect(report.attendance.today).toMatchObject({ targetDate: '2026-09-23', present: 0, absent: 0, rate: null });
    expect(report.attendance.punches).toEqual([]);
    expect(prisma.attendance.findMany.mock.calls[1][0].where.attendanceDate.gte.toISOString()).toBe('2026-09-22T18:30:00.000Z');
  });

  it('keeps empty employee selections scoped across payroll, attendance, leave and expenses', async () => {
    const { service, prisma } = setup();
    const report = await service.getHrAnalytics({ ...range, employeeId: 'missing' }, 'tenant');
    expect(report.workforce.total).toBe(0);
    expect(report.payroll.summary.netPayroll).toBe(0);
    for (const model of ['attendance', 'leaveRequest', 'expenseClaim', 'manualAttendanceRequest']) {
      expect(prisma[model].findMany.mock.calls[0][0].where.employeeId).toEqual({ in: [] });
    }
    const query = prisma.payrollPeriod.findMany.mock.calls[0][0];
    expect(query.include.payrollRecords.where.employeeId).toEqual({ in: [] });
    expect(query.where.companyId).toBe('tenant');
    expect(query.where.startDate.lte.toISOString()).toBe('2026-09-30T18:29:59.999Z');
    expect(query.where.endDate.gte.toISOString()).toBe('2026-08-31T18:30:00.000Z');
    expect(report.filters.employees).toHaveLength(1);
  });

  it('counts payroll employees once across periods and uses actual approval states', async () => {
    const { service, prisma } = setup();
    const record = { employeeId: employee.id, employee, status: 'PAID', grossEarnings: 120, totalDeductions: 20, netPayable: 100, overtimeAmount: 0, leaveDeduction: 0 };
    prisma.payrollPeriod.findMany.mockResolvedValue([{ payrollRecords: [record] }, { payrollRecords: [record] }]);
    prisma.expenseClaim.findMany.mockResolvedValue([
      { employeeId: employee.id, expenseName: 'Actual claim', amount: 25, status: 'PENDING_FINANCE' },
      { employeeId: employee.id, expenseName: 'Actual claim', amount: 10, status: 'FINANCE_PROCESSED' },
      { employeeId: employee.id, expenseName: 'Unapproved', amount: 5, status: 'PENDING_SUPERADMIN' },
    ]);
    prisma.manualAttendanceRequest.findMany.mockResolvedValue([{ id: 'request', employee, date: now, status: 'PENDING' }]);
    const report = await service.getHrAnalytics(range, 'tenant');
    expect(report.payroll.summary).toMatchObject({ payableEmployees: 1, netPayroll: 200, pending: 0, approved: 2 });
    expect(report.payroll.departmentWise[0].employees).toBe(1);
    expect(report.expenses.summary).toMatchObject({ submitted: 40, approved: 35, pending: 5 });
    expect(report.attendanceRequests.summary.pending).toBe(1);
  });

  it('excludes closed requisitions and filled positions from open vacancies', async () => {
    const { service, prisma } = setup();
    prisma.recruitmentRequest.findMany.mockResolvedValue([
      { status: 'OPEN', department: department.name, vacancies: 5, positionsFilled: 2, submittedAt: now, candidates: [{ status: 'OFFER_ACCEPTED' }, { status: 'OFFER_REJECTED' }] },
      { status: 'FULFILLED', department: department.name, vacancies: 8, positionsFilled: 8, submittedAt: now, candidates: [] },
    ]);
    const report = await service.getHrAnalytics(range, 'tenant');
    expect(report.recruitment.summary.totalVacancies).toBe(3);
    expect(report.recruitment.summary.openRequisitions).toBe(1);
    expect(report.recruitment.metrics.offerAcceptanceRate).toBe(50);
  });

  it('validates dates and company, propagates database failures, and leaves all-time unbounded', async () => {
    const { service, prisma } = setup();
    await expect(service.getHrAnalytics(range, '')).rejects.toThrow('Company context');
    await expect(service.getHrAnalytics({ from: '2026-02-30' }, 'tenant')).rejects.toThrow('Invalid HR');
    await expect(service.getHrAnalytics({ from: '2026-10-01', to: '2026-09-01' }, 'tenant')).rejects.toThrow('Start date');
    await service.getHrAnalytics({ period: 'All Time', from: '2020-01-01' }, 'tenant');
    expect(prisma.attendance.findMany.mock.calls[0][0].where.attendanceDate).toBeUndefined();
    expect(prisma.payrollPeriod.findMany.mock.calls[0][0].where).toEqual({ companyId: 'tenant' });
    prisma.employee.findMany.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(service.getHrAnalytics(range, 'tenant')).rejects.toThrow('Database unavailable');
  });

  it('excludes holidays from attendance denominators without assuming absence', () => {
    expect(attendanceCounts([{ status: 'HOLIDAY' }, { status: 'NOT_PUNCHED_IN' }]).rate).toBeNull();
    expect(attendanceCounts([{ status: 'PRESENT' }, { status: 'ABSENT' }, { status: 'WEEKLY_OFF' }])).toMatchObject({ rate: 50, present: 1, absent: 1 });
  });

  it('handles celebrations across years and calculates years at the anniversary', () => {
    const period = hrPeriod({ from: '2026-12-30', to: '2027-01-03' }, now);
    const report = hrCelebrations([employee], period.start, period.end, false, now);
    expect(report.birthdays[0].date).toBe('2026-12-31');
    expect(report.anniversaries[0]).toMatchObject({ date: '2027-01-02', years: 3 });
    const leap = { ...employee, dateOfBirth: new Date('1992-02-29') };
    const february = hrPeriod({ from: '2027-02-01', to: '2027-02-28' }, now);
    expect(hrCelebrations([leap], february.start, february.end, false, now).birthdays).toEqual([]);
  });
});
