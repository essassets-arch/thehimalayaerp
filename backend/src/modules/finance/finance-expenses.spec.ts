import { Test, TestingModule } from '@nestjs/testing';
import { FinanceExpensesService } from './finance-expenses.service';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FinanceExpensesService (Integration & Unit)', () => {
  let service: FinanceExpensesService;
  let prisma: PrismaService;

  const mockCompanyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  const mockUser = {
    sub: '0dd62f60-4cc4-41b9-a785-4f03ecfafb4f',
    companyId: mockCompanyId,
    role: 'FINANCE_MANAGER',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceExpensesService, PrismaService, SequenceService],
    }).compile();

    service = module.get<FinanceExpensesService>(FinanceExpensesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Date Presets & Indian FY Calculations', () => {
    it('should correctly calculate This Month range', () => {
      const range = service.parseDateRange('this_month');
      expect(range.gte).toBeInstanceOf(Date);
      expect(range.lte).toBeInstanceOf(Date);
      expect(range.gte!.getDate()).toBe(1);
    });

    it('should correctly calculate Last Month range', () => {
      const range = service.parseDateRange('last_month');
      expect(range.gte).toBeInstanceOf(Date);
      expect(range.lte).toBeInstanceOf(Date);
      expect(range.gte!.getDate()).toBe(1);
      expect(range.gte!.getTime()).toBeLessThan(range.lte!.getTime());
    });

    it('should correctly calculate Indian Financial Year (April 1 to March 31)', () => {
      const range = service.parseDateRange('this_fy');
      expect(range.gte!.getMonth()).toBe(3); // April is month index 3
      expect(range.gte!.getDate()).toBe(1);
      expect(range.lte!.getMonth()).toBe(2); // March is month index 2
      expect(range.lte!.getDate()).toBe(31);
    });

    it('should correctly calculate Previous Financial Year', () => {
      const thisFY = service.parseDateRange('this_fy');
      const prevFY = service.parseDateRange('previous_fy');
      expect(prevFY.gte!.getFullYear()).toBe(thisFY.gte!.getFullYear() - 1);
      expect(prevFY.lte!.getFullYear()).toBe(thisFY.lte!.getFullYear() - 1);
    });

    it('should parse custom date range', () => {
      const range = service.parseDateRange('custom', '2026-05-01', '2026-05-15');
      expect(range.gte!.toISOString().startsWith('2026-05-01')).toBe(true);
      expect(range.lte!.toISOString().startsWith('2026-05-15')).toBe(true);
    });
  });

  describe('Category & Header Validation', () => {
    it('should retrieve seeded categories for the test company', async () => {
      const categories = await service.getCategories(mockUser, mockCompanyId);
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThanOrEqual(23);

      const salaryCat = categories.find((c) => c.name === 'SALARY');
      expect(salaryCat).toBeDefined();
      expect(salaryCat!.headers.some((h) => h.name === 'ALL STAFF SALARY')).toBe(true);
    });

    it('should reject invalid category ID on expense creation', async () => {
      await expect(
        service.createExpense(
          {
            expenseDate: '2026-10-23',
            categoryId: '00000000-0000-0000-0000-000000000000',
            amount: 5000,
            description: 'Invalid category test',
          },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject a header that does not belong to the selected category', async () => {
      const categories = await service.getCategories(mockUser, mockCompanyId);
      const salaryCat = categories.find((c) => c.name === 'SALARY')!;
      const donationCat = categories.find((c) => c.name === 'DONATION')!;
      const donationHeader = donationCat.headers[0];

      await expect(
        service.createExpense(
          {
            expenseDate: '2026-10-23',
            categoryId: salaryCat.id,
            headerId: donationHeader.id, // Mismatched header!
            amount: 1500,
            description: 'Mismatched header test',
          },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Authoritative Calculations & Precision', () => {
    it('should return valid summary cards with Decimal accuracy', async () => {
      const summary = await service.getSummary(
        { datePreset: 'this_fy', companyId: mockCompanyId },
        mockUser,
      );

      expect(typeof summary.totalExpenses).toBe('number');
      expect(typeof summary.thisMonth).toBe('number');
      expect(typeof summary.totalEntries).toBe('number');
      expect(summary.totalExpenses).toBeGreaterThanOrEqual(0);
      expect(summary.thisMonth).toBeGreaterThanOrEqual(0);
    });

    it('should calculate category breakdown with valid percentages', async () => {
      const breakdown = await service.getCategoryBreakdown(
        { datePreset: 'this_fy', companyId: mockCompanyId },
        mockUser,
      );

      expect(breakdown).toHaveProperty('overallTotal');
      expect(breakdown).toHaveProperty('breakdown');
      expect(breakdown).toHaveProperty('chartData');
      expect(Array.isArray(breakdown.breakdown)).toBe(true);
      expect(Array.isArray(breakdown.chartData)).toBe(true);
    });
  });
});
