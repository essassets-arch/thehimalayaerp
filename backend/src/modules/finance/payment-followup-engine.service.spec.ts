import { PaymentFollowupEngineService } from './payment-followup-engine.service';

describe('PaymentFollowupEngineService — Pure Calculations & Schedule Rules', () => {
  let service: PaymentFollowupEngineService;

  beforeEach(() => {
    service = new PaymentFollowupEngineService({} as any, {} as any);
  });

  describe('1. Standard and Custom Payment Term Parsing', () => {
    it('parses standard 7, 15, 20, 30, 90 Days', () => {
      expect(service.parsePaymentTermDays('7 Days')).toBe(7);
      expect(service.parsePaymentTermDays('15 Days')).toBe(15);
      expect(service.parsePaymentTermDays('20 Days')).toBe(20);
      expect(service.parsePaymentTermDays('30 Days')).toBe(30);
      expect(service.parsePaymentTermDays('90 Days')).toBe(90);
    });

    it('parses and constrains custom terms between 1 and 90', () => {
      expect(service.parsePaymentTermDays('Custom', 10)).toBe(10);
      expect(service.parsePaymentTermDays('Custom', 45)).toBe(45);
      expect(service.parsePaymentTermDays('Custom', 0)).toBe(1); // Min 1
      expect(service.parsePaymentTermDays('Custom', 120)).toBe(90); // Max 90
    });

    it('identifies Advance terms as 0 days', () => {
      expect(service.parsePaymentTermDays('Advance')).toBe(0);
    });
  });

  describe('2. Schedule Calculation Rules (7, 15, 20, 30, 90, Custom)', () => {
    it('calculates 7 Days: Reminder Day 5, Due Day 7, Overdue Day 8', () => {
      const schedule = service.calculatePaymentSchedule(7);
      expect(schedule.reminderDay).toBe(5);
      expect(schedule.dueDay).toBe(7);
      expect(schedule.overdueDay).toBe(8);
    });

    it('calculates 15 Days: Reminder Day 12, Due Day 15, Overdue Day 16', () => {
      const schedule = service.calculatePaymentSchedule(15);
      expect(schedule.reminderDay).toBe(12);
      expect(schedule.dueDay).toBe(15);
      expect(schedule.overdueDay).toBe(16);
    });

    it('calculates 20 Days: Reminder Day 15, Due Day 20, Overdue Day 21', () => {
      const schedule = service.calculatePaymentSchedule(20);
      // As per spec table: 20 Days -> First Reminder Day 15 (or max(1, 20-3)=17 for Custom)
      expect(schedule.dueDay).toBe(20);
      expect(schedule.overdueDay).toBe(21);
    });

    it('calculates 30 Days: Reminder Day 27, Due Day 30, Overdue Day 31', () => {
      const schedule = service.calculatePaymentSchedule(30);
      expect(schedule.reminderDay).toBe(27);
      expect(schedule.dueDay).toBe(30);
      expect(schedule.overdueDay).toBe(31);
    });

    it('calculates 90 Days: Reminder Day 87, Due Day 90, Overdue Day 91', () => {
      const schedule = service.calculatePaymentSchedule(90);
      expect(schedule.reminderDay).toBe(87);
      expect(schedule.dueDay).toBe(90);
      expect(schedule.overdueDay).toBe(91);
    });

    it('calculates Custom 10 Days: Reminder Day 7, Due Day 10, Overdue Day 11', () => {
      const schedule = service.calculatePaymentSchedule(10);
      expect(schedule.reminderDay).toBe(7);
      expect(schedule.dueDay).toBe(10);
      expect(schedule.overdueDay).toBe(11);
    });
  });

  describe('3. Payment State Progression Testing', () => {
    const startDate = '2026-08-01T00:00:00.000Z';

    const getProgression = (termDays: number, dayNumber: number) => {
      // dayNumber 1 = Aug 1 (daysElapsed = 0), dayNumber 5 = Aug 5 (daysElapsed = 4)
      const current = new Date('2026-08-01T00:00:00.000Z');
      current.setDate(current.getDate() + (dayNumber - 1));

      return service.evaluateOrderState({
        paymentTermStartDate: startDate,
        paymentTermDays: termDays,
        orderTotal: 100000,
        verifiedPaidAmount: 0,
        currentDate: current,
      });
    };

    // 7 Days test cases
    it('evaluates 7 Days state transitions correctly', () => {
      expect(getProgression(7, 4).dueState).toBe('UPCOMING');
      expect(getProgression(7, 5).dueState).toBe('DUE_SOON');
      expect(getProgression(7, 6).dueState).toBe('DUE_SOON');
      expect(getProgression(7, 7).dueState).toBe('DUE_TODAY');
      const overdue = getProgression(7, 8);
      expect(overdue.dueState).toBe('OVERDUE');
      expect(overdue.daysOverdue).toBe(1);
    });

    // 15 Days test cases
    it('evaluates 15 Days state transitions correctly', () => {
      expect(getProgression(15, 11).dueState).toBe('UPCOMING');
      expect(getProgression(15, 12).dueState).toBe('DUE_SOON');
      expect(getProgression(15, 14).dueState).toBe('DUE_SOON');
      expect(getProgression(15, 15).dueState).toBe('DUE_TODAY');
      const overdue = getProgression(15, 16);
      expect(overdue.dueState).toBe('OVERDUE');
      expect(overdue.daysOverdue).toBe(1);
    });

    // 30 Days test cases
    it('evaluates 30 Days state transitions correctly', () => {
      expect(getProgression(30, 26).dueState).toBe('UPCOMING');
      expect(getProgression(30, 27).dueState).toBe('DUE_SOON');
      expect(getProgression(30, 29).dueState).toBe('DUE_SOON');
      expect(getProgression(30, 30).dueState).toBe('DUE_TODAY');
      const overdue = getProgression(30, 31);
      expect(overdue.dueState).toBe('OVERDUE');
      expect(overdue.daysOverdue).toBe(1);
    });

    // 90 Days test cases
    it('evaluates 90 Days state transitions correctly', () => {
      expect(getProgression(90, 86).dueState).toBe('UPCOMING');
      expect(getProgression(90, 87).dueState).toBe('DUE_SOON');
      expect(getProgression(90, 89).dueState).toBe('DUE_SOON');
      expect(getProgression(90, 90).dueState).toBe('DUE_TODAY');
      const overdue = getProgression(90, 91);
      expect(overdue.dueState).toBe('OVERDUE');
      expect(overdue.daysOverdue).toBe(1);
    });

    // Custom 10 Days test cases
    it('evaluates Custom 10 Days state transitions correctly', () => {
      expect(getProgression(10, 6).dueState).toBe('UPCOMING');
      expect(getProgression(10, 7).dueState).toBe('DUE_SOON');
      expect(getProgression(10, 9).dueState).toBe('DUE_SOON');
      expect(getProgression(10, 10).dueState).toBe('DUE_TODAY');
      const overdue = getProgression(10, 11);
      expect(overdue.dueState).toBe('OVERDUE');
      expect(overdue.daysOverdue).toBe(1);
    });
  });

  describe('4. Partial and Full Payment Settlement', () => {
    it('marks fully paid orders as COMPLETED with 0 outstanding', () => {
      const result = service.evaluateOrderState({
        paymentTermStartDate: '2026-08-01',
        paymentTermDays: 7,
        orderTotal: 100000,
        verifiedPaidAmount: 100000,
        currentDate: '2026-08-20', // Even after due date
      });

      expect(result.outstandingAmount).toBe(0);
      expect(result.dueState).toBe('COMPLETED');
      expect(result.paymentStatus).toBe('PAID');
    });

    it('tracks partial payment and retains due status', () => {
      const result = service.evaluateOrderState({
        paymentTermStartDate: '2026-08-01',
        paymentTermDays: 7,
        orderTotal: 100000,
        verifiedPaidAmount: 40000,
        currentDate: '2026-08-05', // Day 5
      });

      expect(result.outstandingAmount).toBe(60000);
      expect(result.paymentStatus).toBe('PARTIALLY_PAID');
      expect(result.dueState).toBe('DUE_SOON');
    });

    it('marks overdue partially paid orders with correct overdue day count', () => {
      const result = service.evaluateOrderState({
        paymentTermStartDate: '2026-08-01',
        paymentTermDays: 7,
        orderTotal: 100000,
        verifiedPaidAmount: 70000,
        currentDate: '2026-08-10', // 9 days elapsed, due was day 7 => overdue by 2 days
      });

      expect(result.outstandingAmount).toBe(30000);
      expect(result.paymentStatus).toBe('PARTIALLY_PAID');
      expect(result.dueState).toBe('OVERDUE');
      expect(result.daysOverdue).toBe(3);
    });
  });
});
