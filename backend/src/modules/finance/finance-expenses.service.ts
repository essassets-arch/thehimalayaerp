import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { SequenceService } from '../../common/sequence/sequence.service';
import {
  CreateFinanceExpenseDto,
  UpdateFinanceExpenseDto,
  QueryFinanceExpenseDto,
  CreateFinanceCategoryDto,
  UpdateFinanceCategoryDto,
  CreateFinanceHeaderDto,
  UpdateFinanceHeaderDto,
} from './dto/finance-expense.dto';

@Injectable()
export class FinanceExpensesService {
  private readonly logger = new Logger(FinanceExpensesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
  ) {}

  /**
   * Resolves the authoritative tenant company ID.
   * Super Admins can query or specify a tenant; regular users are locked to their own companyId.
   */
  resolveTenant(user: any, requestedCompanyId?: string): string {
    const rawRole =
      typeof user?.role === 'object' && user?.role !== null
        ? user.role.code || user.role.name || ''
        : user?.role;
    const normalizedRole = String(rawRole || '').toUpperCase();
    const isSuperAdmin =
      normalizedRole === 'SUPER_ADMIN' ||
      normalizedRole === 'SUPERADMIN' ||
      normalizedRole.includes('SUPER_ADMIN');

    if (isSuperAdmin && requestedCompanyId?.trim()) {
      return requestedCompanyId.trim();
    }

    const companyId = user?.companyId;
    if (!companyId) {
      throw new UnauthorizedException(
        'An authenticated company context is required.',
      );
    }
    return companyId;
  }

  /**
   * Parses date presets using Indian financial year and calendar conventions.
   */
  parseDateRange(
    preset?: string,
    customFrom?: string,
    customTo?: string,
  ): { gte?: Date; lte?: Date } {
    const now = new Date();

    if (preset === 'this_month') {
      const gte = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const lte = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { gte, lte };
    }

    if (preset === 'last_month') {
      const gte = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const lte = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { gte, lte };
    }

    if (preset === 'this_fy') {
      // Indian Financial Year: April 1 to March 31
      const currentMonth = now.getMonth(); // 0 = Jan, 3 = Apr
      const fyStartYear = currentMonth >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const gte = new Date(fyStartYear, 3, 1, 0, 0, 0, 0); // April 1
      const lte = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999); // March 31 next year
      return { gte, lte };
    }

    if (preset === 'previous_fy') {
      const currentMonth = now.getMonth();
      const fyStartYear = (currentMonth >= 3 ? now.getFullYear() : now.getFullYear() - 1) - 1;
      const gte = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
      const lte = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
      return { gte, lte };
    }

    if (customFrom || customTo) {
      const range: { gte?: Date; lte?: Date } = {};
      if (customFrom) {
        const fromDate = customFrom.includes('T')
          ? new Date(customFrom)
          : new Date(`${customFrom}T00:00:00.000Z`);
        if (!isNaN(fromDate.getTime())) {
          range.gte = fromDate;
        }
      }
      if (customTo) {
        const toDate = customTo.includes('T')
          ? new Date(customTo)
          : new Date(`${customTo}T23:59:59.999Z`);
        if (!isNaN(toDate.getTime())) {
          range.lte = toDate;
        }
      }
      return range;
    }

    // Default: this month
    const gte = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const lte = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { gte, lte };
  }

  /**
   * Helper to construct Prisma WHERE clause for expense queries.
   */
  private buildWhereClause(
    companyId: string,
    query: QueryFinanceExpenseDto,
  ): Prisma.FinanceExpenseWhereInput {
    const where: Prisma.FinanceExpenseWhereInput = {
      companyId,
    };

    // Date filtering
    const dateRange = this.parseDateRange(
      query.datePreset,
      query.dateFrom,
      query.dateTo,
    );
    if (dateRange.gte || dateRange.lte) {
      where.expenseDate = {
        ...(dateRange.gte && { gte: dateRange.gte }),
        ...(dateRange.lte && { lte: dateRange.lte }),
      };
    }

    // Category filter
    if (query.categoryId?.trim()) {
      where.categoryId = query.categoryId.trim();
    }

    // Header filter
    if (query.headerId?.trim()) {
      where.headerId = query.headerId.trim();
    }

    // Payment method filter
    if (query.paymentMethod?.trim()) {
      where.paymentMethod = query.paymentMethod.trim();
    }

    // Paid to filter
    if (query.paidTo?.trim()) {
      where.paidTo = {
        contains: query.paidTo.trim(),
        mode: 'insensitive',
      };
    }

    // Universal text search
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { expenseNumber: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { paidTo: { contains: s, mode: 'insensitive' } },
        { voucherNumber: { contains: s, mode: 'insensitive' } },
        { invoiceNumber: { contains: s, mode: 'insensitive' } },
        { notes: { contains: s, mode: 'insensitive' } },
        { category: { name: { contains: s, mode: 'insensitive' } } },
        { header: { name: { contains: s, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  /**
   * Creates a new Finance Expense with relational validation.
   */
  async createExpense(dto: CreateFinanceExpenseDto, user: any) {
    const companyId = this.resolveTenant(user, dto.companyId);
    const userId = user.sub || user.id;

    // Validate category exists for this company
    const category = await this.prisma.financeExpenseCategory.findFirst({
      where: { id: dto.categoryId, companyId },
    });
    if (!category) {
      throw new BadRequestException('Specified expense category does not exist in this company.');
    }
    if (!category.isActive) {
      throw new BadRequestException('Selected expense category is currently inactive.');
    }

    // Validate header if provided
    if (dto.headerId) {
      const header = await this.prisma.financeExpenseHeader.findUnique({
        where: { id: dto.headerId },
      });
      if (!header) {
        throw new BadRequestException('Specified expense header does not exist.');
      }
      if (header.categoryId !== category.id) {
        throw new BadRequestException('Selected expense header does not belong to the selected category.');
      }
      if (!header.isActive) {
        throw new BadRequestException('Selected expense header is currently inactive.');
      }
    }

    const expDate = new Date(dto.expenseDate);
    if (isNaN(expDate.getTime())) {
      throw new BadRequestException('Invalid expense date provided.');
    }

    // Atomic sequence generation
    const yearCode = expDate.getFullYear();
    const sequenceKey = `FIN-EXP-${companyId}-${yearCode}`;
    const expenseNumber = await this.sequenceService.generateNext(
      sequenceKey,
      `EXP-${yearCode}-`,
      4,
    );

    const expense = await this.prisma.financeExpense.create({
      data: {
        expenseNumber,
        companyId,
        expenseDate: expDate,
        categoryId: category.id,
        headerId: dto.headerId || null,
        amount: new Prisma.Decimal(dto.amount),
        description: dto.description.trim(),
        paidTo: dto.paidTo?.trim() || null,
        paymentMethod: dto.paymentMethod?.trim() || null,
        voucherNumber: dto.voucherNumber?.trim() || null,
        invoiceNumber: dto.invoiceNumber?.trim() || null,
        receiptUrl: dto.receiptUrl?.trim() || null,
        notes: dto.notes?.trim() || null,
        status: 'RECORDED',
        createdById: userId,
      },
      include: {
        category: true,
        header: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Write audit log
    await this.prisma.auditLog
      .create({
        data: {
          actorUserId: userId,
          companyId,
          action: 'CREATE_FINANCE_EXPENSE',
          entityType: 'FinanceExpense',
          entityId: expense.id,
          after: expense as any,
        },
      })
      .catch((err) => this.logger.warn(`Failed to write audit log: ${err.message}`));

    return expense;
  }

  /**
   * Retrieves a single expense detail.
   */
  async getExpenseById(id: string, user: any) {
    const companyId = this.resolveTenant(user);
    const expense = await this.prisma.financeExpense.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        header: true,
        company: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Finance expense with ID '${id}' not found.`);
    }

    return expense;
  }

  /**
   * Updates an existing expense where permitted.
   */
  async updateExpense(id: string, dto: UpdateFinanceExpenseDto, user: any) {
    const companyId = this.resolveTenant(user);
    const userId = user.sub || user.id;

    const existing = await this.prisma.financeExpense.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(`Finance expense with ID '${id}' not found.`);
    }

    if (existing.status === 'POSTED') {
      throw new BadRequestException('Posted financial expenses cannot be directly modified. Reverse or adjust according to accounting rules.');
    }

    const targetCategoryId = dto.categoryId || existing.categoryId;
    let targetHeaderId = dto.headerId !== undefined ? dto.headerId : existing.headerId;

    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.financeExpenseCategory.findFirst({
        where: { id: dto.categoryId, companyId },
      });
      if (!category) {
        throw new BadRequestException('Selected expense category does not exist.');
      }
      // If header is not explicitly updated, check if old header is compatible
      if (dto.headerId === undefined && existing.headerId) {
        const oldHeader = await this.prisma.financeExpenseHeader.findUnique({
          where: { id: existing.headerId },
        });
        if (oldHeader?.categoryId !== dto.categoryId) {
          targetHeaderId = null; // Clear incompatible header
        }
      }
    }

    if (targetHeaderId) {
      const header = await this.prisma.financeExpenseHeader.findUnique({
        where: { id: targetHeaderId },
      });
      if (!header || header.categoryId !== targetCategoryId) {
        throw new BadRequestException('Selected expense header does not belong to the selected category.');
      }
    }

    const updated = await this.prisma.financeExpense.update({
      where: { id },
      data: {
        ...(dto.expenseDate && { expenseDate: new Date(dto.expenseDate) }),
        ...(dto.categoryId && { categoryId: targetCategoryId }),
        headerId: targetHeaderId,
        ...(dto.amount !== undefined && { amount: new Prisma.Decimal(dto.amount) }),
        ...(dto.description !== undefined && { description: dto.description.trim() }),
        ...(dto.paidTo !== undefined && { paidTo: dto.paidTo?.trim() || null }),
        ...(dto.paymentMethod !== undefined && { paymentMethod: dto.paymentMethod?.trim() || null }),
        ...(dto.voucherNumber !== undefined && { voucherNumber: dto.voucherNumber?.trim() || null }),
        ...(dto.invoiceNumber !== undefined && { invoiceNumber: dto.invoiceNumber?.trim() || null }),
        ...(dto.receiptUrl !== undefined && { receiptUrl: dto.receiptUrl?.trim() || null }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
        ...(dto.status !== undefined && { status: dto.status }),
        updatedById: userId,
      },
      include: {
        category: true,
        header: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Write audit log
    await this.prisma.auditLog
      .create({
        data: {
          actorUserId: userId,
          companyId,
          action: 'UPDATE_FINANCE_EXPENSE',
          entityType: 'FinanceExpense',
          entityId: id,
          before: existing as any,
          after: updated as any,
        },
      })
      .catch((err) => this.logger.warn(`Failed to write audit log: ${err.message}`));

    return updated;
  }

  /**
   * Searchable and paginated expense register.
   */
  async listExpenses(query: QueryFinanceExpenseDto, user: any) {
    const companyId = this.resolveTenant(user, query.companyId);
    const where = this.buildWhereClause(companyId, query);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const allowedSortFields = ['expenseDate', 'amount', 'createdAt', 'expenseNumber'];
    const sortBy = allowedSortFields.includes(query.sortBy || '')
      ? query.sortBy!
      : 'expenseDate';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      this.prisma.financeExpense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          header: true,
          company: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.financeExpense.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Authoritative summary cards calculated from database records:
   * Total Expenses, This Month, Total Entries, Top Expense Category.
   */
  async getSummary(query: QueryFinanceExpenseDto, user: any) {
    const companyId = this.resolveTenant(user, query.companyId);
    const where = this.buildWhereClause(companyId, query);

    // 1. Authoritative Total & Count for active filter scope
    const aggregate = await this.prisma.financeExpense.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalExpenses = Number(aggregate._sum.amount || 0);
    const totalEntries = aggregate._count.id;

    // 2. This Month total for the company scope
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const thisMonthAggregate = await this.prisma.financeExpense.aggregate({
      where: {
        companyId,
        expenseDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });
    const thisMonth = Number(thisMonthAggregate._sum.amount || 0);

    // 3. Top Expense Category within active filter scope
    const categoryGroups = await this.prisma.financeExpense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1,
    });

    let topCategory: {
      categoryId: string;
      categoryName: string;
      amount: number;
      percentage: number;
    } | null = null;

    if (categoryGroups.length > 0 && categoryGroups[0]._sum.amount) {
      const topCatRecord = await this.prisma.financeExpenseCategory.findUnique({
        where: { id: categoryGroups[0].categoryId },
        select: { id: true, name: true },
      });

      const topAmount = Number(categoryGroups[0]._sum.amount);
      const percentage =
        totalExpenses > 0 ? (topAmount / totalExpenses) * 100 : 0;

      topCategory = {
        categoryId: categoryGroups[0].categoryId,
        categoryName: topCatRecord?.name || 'Unknown',
        amount: topAmount,
        percentage: Number(percentage.toFixed(1)),
      };
    }

    return {
      totalExpenses,
      thisMonth,
      totalEntries,
      topCategory,
    };
  }

  /**
   * Category-wise expense breakdown with drill-down metrics:
   * Category, Header, Total amount, Number of transactions, Percentage, Most recent date.
   */
  async getCategoryBreakdown(query: QueryFinanceExpenseDto, user: any) {
    const companyId = this.resolveTenant(user, query.companyId);
    const where = this.buildWhereClause(companyId, query);

    const totalAggregate = await this.prisma.financeExpense.aggregate({
      where,
      _sum: { amount: true },
    });
    const overallTotal = Number(totalAggregate._sum.amount || 0);

    // Group by category and header
    const grouped = await this.prisma.financeExpense.groupBy({
      by: ['categoryId', 'headerId'],
      where,
      _sum: { amount: true },
      _count: { id: true },
      _max: { expenseDate: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Populate category and header names
    const categoryIds = [...new Set(grouped.map((g) => g.categoryId))];
    const headerIds = [
      ...new Set(
        grouped.map((g) => g.headerId).filter((h): h is string => Boolean(h)),
      ),
    ];

    const [categories, headers] = await Promise.all([
      this.prisma.financeExpenseCategory.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      }),
      this.prisma.financeExpenseHeader.findMany({
        where: { id: { in: headerIds } },
        select: { id: true, name: true, categoryId: true },
      }),
    ]);

    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const headerMap = new Map(headers.map((h) => [h.id, h.name]));

    const breakdown = grouped.map((item) => {
      const amount = Number(item._sum.amount || 0);
      const percentage =
        overallTotal > 0 ? (amount / overallTotal) * 100 : 0;

      return {
        categoryId: item.categoryId,
        categoryName: catMap.get(item.categoryId) || 'Uncategorized',
        headerId: item.headerId || null,
        headerName: item.headerId ? headerMap.get(item.headerId) || 'General' : 'Not Configured',
        totalAmount: amount,
        transactionCount: item._count.id,
        percentage: Number(percentage.toFixed(2)),
        mostRecentDate: item._max.expenseDate,
      };
    });

    // Also produce category-level rolled-up chart data
    const categoryRollup = new Map<
      string,
      { categoryId: string; categoryName: string; amount: number; count: number }
    >();

    for (const b of breakdown) {
      const existing = categoryRollup.get(b.categoryId) || {
        categoryId: b.categoryId,
        categoryName: b.categoryName,
        amount: 0,
        count: 0,
      };
      existing.amount += b.totalAmount;
      existing.count += b.transactionCount;
      categoryRollup.set(b.categoryId, existing);
    }

    const chartData = Array.from(categoryRollup.values())
      .map((item) => ({
        ...item,
        percentage:
          overallTotal > 0 ? Number(((item.amount / overallTotal) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      overallTotal,
      breakdown,
      chartData,
    };
  }

  /**
   * Full dataset export respecting active filters.
   */
  async exportExpenses(query: QueryFinanceExpenseDto, user: any) {
    const companyId = this.resolveTenant(user, query.companyId);
    const where = this.buildWhereClause(companyId, query);

    const expenses = await this.prisma.financeExpense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: {
        category: true,
        header: true,
        company: { select: { name: true } },
        createdBy: { select: { name: true, email: true } },
      },
    });

    return expenses.map((e, index) => ({
      'Sr. No.': index + 1,
      'Expense Number': e.expenseNumber,
      'Expense Date': e.expenseDate.toISOString().split('T')[0],
      'Company': e.company.name,
      'Category / Subheader': e.category.name,
      'Header': e.header?.name || '—',
      'Description / Purpose': e.description,
      'Paid To': e.paidTo || '—',
      'Payment Method': e.paymentMethod || '—',
      'Voucher / Ref': e.voucherNumber || '—',
      'Invoice / Bill': e.invoiceNumber || '—',
      'Amount (INR)': Number(e.amount).toFixed(2),
      'Status': e.status,
      'Created By': e.createdBy.name,
    }));
  }

  // -------------------------------------------------------------
  // Category Master Management
  // -------------------------------------------------------------

  async getCategories(user: any, requestedCompanyId?: string, includeInactive: boolean = false) {
    const companyId = this.resolveTenant(user, requestedCompanyId);

    return this.prisma.financeExpenseCategory.findMany({
      where: {
        companyId,
        ...(!includeInactive && { isActive: true }),
      },
      include: {
        headers: {
          where: !includeInactive ? { isActive: true } : undefined,
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateFinanceCategoryDto, user: any) {
    const companyId = this.resolveTenant(user, dto.companyId);
    const trimmedName = dto.name.trim();

    const existing = await this.prisma.financeExpenseCategory.findUnique({
      where: {
        companyId_name: { companyId, name: trimmedName },
      },
    });

    if (existing) {
      throw new BadRequestException(`Category '${trimmedName}' already exists in this company.`);
    }

    return this.prisma.financeExpenseCategory.create({
      data: {
        companyId,
        name: trimmedName,
        description: dto.description?.trim() || null,
        isActive: true,
      },
      include: { headers: true },
    });
  }

  async updateCategory(id: string, dto: UpdateFinanceCategoryDto, user: any) {
    const companyId = this.resolveTenant(user);

    const category = await this.prisma.financeExpenseCategory.findFirst({
      where: { id, companyId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found.`);
    }

    if (dto.name && dto.name.trim() !== category.name) {
      const duplicate = await this.prisma.financeExpenseCategory.findUnique({
        where: {
          companyId_name: { companyId, name: dto.name.trim() },
        },
      });
      if (duplicate) {
        throw new BadRequestException(`Category '${dto.name.trim()}' already exists.`);
      }
    }

    return this.prisma.financeExpenseCategory.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { headers: true },
    });
  }

  async createHeader(categoryId: string, dto: CreateFinanceHeaderDto, user: any) {
    const companyId = this.resolveTenant(user);

    const category = await this.prisma.financeExpenseCategory.findFirst({
      where: { id: categoryId, companyId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    const trimmedName = dto.name.trim();
    const existing = await this.prisma.financeExpenseHeader.findUnique({
      where: {
        categoryId_name: { categoryId, name: trimmedName },
      },
    });
    if (existing) {
      throw new BadRequestException(`Header '${trimmedName}' already exists under this category.`);
    }

    return this.prisma.financeExpenseHeader.create({
      data: {
        categoryId,
        name: trimmedName,
        description: dto.description?.trim() || null,
        isActive: true,
      },
    });
  }

  async updateHeader(
    categoryId: string,
    headerId: string,
    dto: UpdateFinanceHeaderDto,
    user: any,
  ) {
    const companyId = this.resolveTenant(user);

    const category = await this.prisma.financeExpenseCategory.findFirst({
      where: { id: categoryId, companyId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    const header = await this.prisma.financeExpenseHeader.findFirst({
      where: { id: headerId, categoryId },
    });
    if (!header) {
      throw new NotFoundException(`Header with ID '${headerId}' not found.`);
    }

    if (dto.name && dto.name.trim() !== header.name) {
      const duplicate = await this.prisma.financeExpenseHeader.findUnique({
        where: {
          categoryId_name: { categoryId, name: dto.name.trim() },
        },
      });
      if (duplicate) {
        throw new BadRequestException(`Header '${dto.name.trim()}' already exists under this category.`);
      }
    }

    return this.prisma.financeExpenseHeader.update({
      where: { id: headerId },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }
}
