import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import {
  CreateBackOfficeReportDto,
  UpdateBackOfficeReportDto,
  AcknowledgeBackOfficeReportDto,
  QueryBackOfficeReportDto,
} from './dto/back-office-report.dto';

@Injectable()
export class BackOfficeService implements OnApplicationBootstrap {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.ensureBackOfficeSetup();
    } catch (err) {
      console.error('[BackOfficeService] Automatic setup error:', err);
    }
  }

  private async ensureBackOfficeSetup() {
    let company = await this.prisma.company.findFirst();
    if (!company) {
      company = await this.prisma.company.create({
        data: {
          publicId: 'COMP-000001',
          name: 'Himalaya Enterprises',
        },
      });
    }

    let role = await this.prisma.role.findFirst({
      where: { OR: [{ code: 'BACK_OFFICE' }, { name: 'Back Office' }] },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          publicId: 'ROLE-BACK-OFFICE',
          name: 'Back Office',
          code: 'BACK_OFFICE',
        },
      });
    }

    const permissions = [
      {
        code: 'backoffice.report.create',
        name: 'Create Back Office Daily Report',
      },
      { code: 'backoffice.report.read', name: 'View Back Office Daily Report' },
      {
        code: 'backoffice.report.manage',
        name: 'Manage Back Office Daily Report',
      },
      { code: 'profile.read', name: 'View Profile' },
    ];

    for (const p of permissions) {
      let perm = await this.prisma.permission.findUnique({
        where: { code: p.code },
      });
      if (!perm) {
        perm = await this.prisma.permission.create({
          data: {
            publicId: `PERM-${p.code.toUpperCase().replace(/\./g, '_')}`,
            code: p.code,
            name: p.name,
          },
        });
      }

      const rp = await this.prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: perm.id },
        },
      });

      if (!rp) {
        await this.prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      }
    }

    const superAdminRole = await this.prisma.role.findFirst({
      where: { OR: [{ code: 'SUPER_ADMIN' }, { name: 'Super Admin' }] },
    });

    if (superAdminRole) {
      let reviewPerm = await this.prisma.permission.findUnique({
        where: { code: 'backoffice.report.review' },
      });
      if (!reviewPerm) {
        reviewPerm = await this.prisma.permission.create({
          data: {
            publicId: 'PERM-BACKOFFICE_REPORT_REVIEW',
            code: 'backoffice.report.review',
            name: 'Review Back Office Daily Reports',
          },
        });
      }
      const rpAdmin = await this.prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: reviewPerm.id,
          },
        },
      });
      if (!rpAdmin) {
        await this.prisma.rolePermission.create({
          data: { roleId: superAdminRole.id, permissionId: reviewPerm.id },
        });
      }
    }
  }

  /**
   * Helper: ensure report date as Date object without timezone shift issues
   */
  private parseReportDate(dateStr: string): Date {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      throw new BadRequestException('Invalid report date format');
    }
    return d;
  }

  /**
   * Create a new Daily Report for the logged-in back office user
  /**
   * Create a new Daily Report for the logged-in back office user
   */
  async createReport(
    companyId: string,
    userId: string,
    dto: CreateBackOfficeReportDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const targetCompanyId = user?.companyId || companyId;

    const reportDate = this.parseReportDate(dto.reportDate);
    const year = reportDate.getFullYear();

    const publicId = await this.sequenceService.generateNext(
      `bo_${targetCompanyId}_${year}`,
      `BO-${year}-`,
      4,
    );

    const report = await this.prisma.backOfficeDailyReport.create({
      data: {
        publicId,
        companyId: targetCompanyId,
        userId,
        reportDate,
        title: dto.title,
        summary: dto.summary || null,
        tasksCompleted: dto.tasksCompleted,
        issuesOrBlockers: dto.issuesOrBlockers || null,
        planForTomorrow: dto.planForTomorrow || null,
        workingHours: dto.workingHours !== undefined ? dto.workingHours : null,
        status: dto.status || 'SUBMITTED',
      },
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            name: true,
            email: true,
            role: { select: { code: true, name: true } },
          },
        },
      },
    });

    return report;
  }

  /**
   * List reports for the logged in back office staff member
   */
  async getMyReports(
    companyId: string,
    userId: string,
    query: QueryBackOfficeReportDto,
  ) {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.reportDate = {};
      if (query.startDate) {
        where.reportDate.gte = this.parseReportDate(query.startDate);
      }
      if (query.endDate) {
        where.reportDate.lte = this.parseReportDate(query.endDate);
      }
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { tasksCompleted: { contains: s, mode: 'insensitive' } },
        { publicId: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [total, reports] = await Promise.all([
      this.prisma.backOfficeDailyReport.count({ where }),
      this.prisma.backOfficeDailyReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              publicId: true,
              name: true,
              email: true,
              role: { select: { code: true, name: true } },
            },
          },
        },
        orderBy: { reportDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single report by ID
   */
  async getReportById(
    companyId: string,
    id: string,
    userId?: string,
    isAdmin?: boolean,
  ) {
    const report = await this.prisma.backOfficeDailyReport.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            name: true,
            email: true,
            role: { select: { code: true, name: true } },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Daily report not found');
    }

    if (!isAdmin && userId && report.userId !== userId) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  }

  /**
   * Update report (only if author and not already acknowledged)
   */
  async updateReport(
    companyId: string,
    userId: string,
    id: string,
    dto: UpdateBackOfficeReportDto,
  ) {
    const existing = await this.prisma.backOfficeDailyReport.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Daily report not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'Cannot edit report submitted by another user',
      );
    }

    if (existing.status === 'ACKNOWLEDGED') {
      throw new BadRequestException('Acknowledged reports cannot be edited');
    }

    const dataToUpdate: any = {};
    if (dto.reportDate) {
      dataToUpdate.reportDate = this.parseReportDate(dto.reportDate);
    }
    if (dto.title !== undefined) dataToUpdate.title = dto.title;
    if (dto.summary !== undefined) dataToUpdate.summary = dto.summary || null;
    if (dto.tasksCompleted !== undefined)
      dataToUpdate.tasksCompleted = dto.tasksCompleted;
    if (dto.issuesOrBlockers !== undefined)
      dataToUpdate.issuesOrBlockers = dto.issuesOrBlockers || null;
    if (dto.planForTomorrow !== undefined)
      dataToUpdate.planForTomorrow = dto.planForTomorrow || null;
    if (dto.workingHours !== undefined)
      dataToUpdate.workingHours = dto.workingHours;
    if (dto.status !== undefined) dataToUpdate.status = dto.status;

    const updated = await this.prisma.backOfficeDailyReport.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            name: true,
            email: true,
            role: { select: { code: true, name: true } },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete report (only author if draft)
   */
  async deleteReport(companyId: string, userId: string, id: string) {
    const existing = await this.prisma.backOfficeDailyReport.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Daily report not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'Cannot delete report submitted by another user',
      );
    }

    if (existing.status === 'ACKNOWLEDGED') {
      throw new BadRequestException('Cannot delete an acknowledged report');
    }

    await this.prisma.backOfficeDailyReport.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Report deleted successfully' };
  }

  /**
   * Super Admin: Get all back office reports with filters, search, and KPI aggregates
   */
  async getAllReportsForSuperAdmin(
    companyId: string,
    query: QueryBackOfficeReportDto,
  ) {
    const where: any = {
      deletedAt: null,
    };

    if (query.userId && query.userId !== 'ALL') {
      where.userId = query.userId;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.reportDate = {};
      if (query.startDate) {
        where.reportDate.gte = this.parseReportDate(query.startDate);
      }
      if (query.endDate) {
        where.reportDate.lte = this.parseReportDate(query.endDate);
      }
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { tasksCompleted: { contains: s, mode: 'insensitive' } },
        { publicId: { contains: s, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: s, mode: 'insensitive' } },
              { email: { contains: s, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      total,
      reports,
      todayCount,
      pendingCount,
      acknowledgedCount,
      backOfficeStaffCount,
    ] = await Promise.all([
      this.prisma.backOfficeDailyReport.count({ where }),
      this.prisma.backOfficeDailyReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              publicId: true,
              name: true,
              email: true,
              role: { select: { code: true, name: true } },
            },
          },
        },
        orderBy: [{ reportDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.backOfficeDailyReport.count({
        where: {
          companyId,
          deletedAt: null,
          reportDate: { gte: todayStart },
        },
      }),
      this.prisma.backOfficeDailyReport.count({
        where: {
          companyId,
          deletedAt: null,
          status: 'SUBMITTED',
        },
      }),
      this.prisma.backOfficeDailyReport.count({
        where: {
          companyId,
          deletedAt: null,
          status: 'ACKNOWLEDGED',
        },
      }),
      this.prisma.user.count({
        where: {
          companyId,
          deletedAt: null,
          role: {
            OR: [
              { code: 'BACK_OFFICE' },
              { name: { contains: 'Back Office', mode: 'insensitive' } },
            ],
          },
        },
      }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalReports: total,
        todaySubmissions: todayCount,
        pendingReview: pendingCount,
        acknowledgedReports: acknowledgedCount,
        staffCount: backOfficeStaffCount,
      },
    };
  }

  /**
   * Super Admin: Acknowledge report and add remarks/feedback
   */
  async acknowledgeReport(
    companyId: string,
    adminUserId: string,
    id: string,
    dto: AcknowledgeBackOfficeReportDto,
  ) {
    const existing = await this.prisma.backOfficeDailyReport.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Daily report not found');
    }

    const updated = await this.prisma.backOfficeDailyReport.update({
      where: { id },
      data: {
        status: dto.status || 'ACKNOWLEDGED',
        adminRemarks:
          dto.adminRemarks !== undefined
            ? dto.adminRemarks
            : existing.adminRemarks,
        acknowledgedById: adminUserId,
        acknowledgedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            name: true,
            email: true,
            role: { select: { code: true, name: true } },
          },
        },
      },
    });

    return updated;
  }

  /**
   * List active Back Office staff users for Super Admin dropdown filter
   */
  async getBackOfficeStaffList(companyId: string) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        role: {
          OR: [
            { code: 'BACK_OFFICE' },
            { name: { contains: 'Back Office', mode: 'insensitive' } },
          ],
        },
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Helper: calculate ageing bucket and days overdue
   */
  private calculateAgeing(dueDate: Date, status: string) {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (status === 'PAID') {
      return { ageingDays: 0, ageingBucket: 'Paid / Settled' };
    }

    if (diffDays <= 0) {
      return { ageingDays: 0, ageingBucket: 'Yet To Due' };
    } else if (diffDays <= 30) {
      return { ageingDays: diffDays, ageingBucket: '1-30 Days' };
    } else if (diffDays <= 45) {
      return { ageingDays: diffDays, ageingBucket: '31-45 Days' };
    } else if (diffDays <= 60) {
      return { ageingDays: diffDays, ageingBucket: '46-60 Days' };
    } else if (diffDays <= 90) {
      return { ageingDays: diffDays, ageingBucket: '61-90 Days' };
    } else if (diffDays <= 120) {
      return { ageingDays: diffDays, ageingBucket: '91-120 Days' };
    } else {
      return { ageingDays: diffDays, ageingBucket: 'More than 120 Days' };
    }
  }

  /**
   * AR — Invoice / Receivable Register (21 columns) for given entity ('APPL' or 'HCPPL')
   */
  async getArRegister(entity: 'APPL' | 'HCPPL', query: any) {
    const {
      search,
      quarter,
      ageingBucket,
      status,
      salesPerson,
      companyName,
      salesType,
      dateFrom,
      dateTo,
      sortBy = 'srNo',
      sortOrder = 'asc',
      page = 1,
      limit = 25,
    } = query;

    const where: any = {
      entity,
    };

    if (quarter && quarter !== 'ALL') {
      where.quarter = quarter;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (salesPerson && salesPerson !== 'ALL') {
      where.salesPerson = { contains: salesPerson, mode: 'insensitive' };
    }
    if (companyName && companyName !== 'ALL') {
      where.companyName = { contains: companyName, mode: 'insensitive' };
    }
    if (salesType && salesType !== 'ALL') {
      where.salesType = salesType;
    }
    if (dateFrom || dateTo) {
      where.invoiceDate = {};
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
      if (dateTo) where.invoiceDate.lte = new Date(dateTo);
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { siteName: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { salesPerson: { contains: q, mode: 'insensitive' } },
        { remarks: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderField = sortBy;
    if (orderField === 'invoiceNo') orderField = 'invoiceNumber';
    const validDbSort = [
      'srNo',
      'invoiceNumber',
      'invoiceDate',
      'basicAmount',
      'invoiceAmount',
      'companyName',
      'siteName',
      'city',
      'salesType',
      'salesPerson',
      'paymentTermDays',
      'dueDate',
      'status',
      'amtRcvd',
      'amtRcvdDate',
      'completePaymentDate',
      'outstanding',
      'remarks',
      'quarter',
      'createdAt',
    ];
    const safeOrderField = validDbSort.includes(orderField) ? orderField : 'srNo';
    const safeSortOrder = sortOrder && String(sortOrder).toLowerCase() === 'desc' ? 'desc' : 'asc';

    const allMatches = await (this.prisma as any).backOfficeArInvoice.findMany({
      where,
      orderBy: { [safeOrderField]: safeSortOrder },
    });

    const mapped = allMatches.map((row: any) => {
      const calculated = this.calculateAgeing(row.dueDate, row.status);
      const ageingDays = (row.ageingDays !== null && row.ageingDays !== undefined) ? Number(row.ageingDays) : calculated.ageingDays;
      const bucket = (row.ageingBucket && row.ageingBucket.trim()) ? row.ageingBucket.trim() : calculated.ageingBucket;
      return {
        id: row.id,
        srNo: row.srNo,
        invoiceNo: row.invoiceNumber,
        invoiceDate: row.invoiceDate,
        basicAmount: Number(row.basicAmount),
        invoiceAmount: Number(row.invoiceAmount),
        companyName: row.companyName,
        siteName: row.siteName || '-',
        city: row.city || '-',
        salesType: row.salesType,
        salesPerson: row.salesPerson || '-',
        paymentTermDays: row.paymentTermDays,
        dueDate: row.dueDate,
        ageingDays,
        ageingBucket: bucket,
        status: row.status,
        amtRcvd: Number(row.amtRcvd),
        amtRcvdDate: row.amtRcvdDate,
        completePaymentDate: row.completePaymentDate,
        outstanding: Number(row.outstanding),
        remarks: row.remarks || '',
        quarter: row.quarter,
      };
    });

    let filtered = mapped;
    if (ageingBucket && ageingBucket !== 'ALL') {
      filtered = mapped.filter((r: any) => r.ageingBucket === ageingBucket);
    }

    if (sortBy === 'ageingDays' || sortBy === 'ageingBucket') {
      filtered.sort((a: any, b: any) => {
        if (sortBy === 'ageingDays') {
          return safeSortOrder === 'desc' ? b.ageingDays - a.ageingDays : a.ageingDays - b.ageingDays;
        } else {
          return safeSortOrder === 'desc'
            ? String(b.ageingBucket || '').localeCompare(String(a.ageingBucket || ''))
            : String(a.ageingBucket || '').localeCompare(String(b.ageingBucket || ''));
        }
      });
    }

    const totals = filtered.reduce(
      (acc: any, r: any) => {
        acc.basicAmount += r.basicAmount;
        acc.invoiceAmount += r.invoiceAmount;
        acc.amtRcvd += r.amtRcvd;
        acc.outstanding += r.outstanding;
        acc.count += 1;
        return acc;
      },
      { basicAmount: 0, invoiceAmount: 0, amtRcvd: 0, outstanding: 0, count: 0 }
    );

    totals.basicAmount = Number(totals.basicAmount.toFixed(2));
    totals.invoiceAmount = Number(totals.invoiceAmount.toFixed(2));
    totals.amtRcvd = Number(totals.amtRcvd.toFixed(2));
    totals.outstanding = Number(totals.outstanding.toFixed(2));

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 25);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = filtered.slice(startIndex, startIndex + limitNum);

    const quarters = Array.from(new Set(allMatches.map((r: any) => r.quarter))).filter(Boolean).sort();
    const salesPersons = Array.from(new Set(allMatches.map((r: any) => r.salesPerson).filter(Boolean))).sort();
    const statuses = Array.from(new Set(allMatches.map((r: any) => r.status))).filter(Boolean).sort();

    return {
      items: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limitNum) || 1,
      },
      totals,
      filterOptions: {
        quarters,
        salesPersons,
        statuses,
      },
    };
  }

  async getApplArRegister(query: any) {
    return this.getArRegister('APPL', query);
  }

  async getHcpplArRegister(query: any) {
    return this.getArRegister('HCPPL', query);
  }

  /**
   * HCPPL AR — Summary Sheet (Section 1: Unpaid, Section 2: RT)
   */
  async getHcpplArSummary() {
    const invoices = await (this.prisma as any).backOfficeArInvoice.findMany({
      where: { entity: 'HCPPL' },
    });

    const quarters = ['Q1-2026/27', 'Q2-2026/27', 'Q3-2026/27', 'Q4-2026/27'];
    const ageingBuckets = [
      'Yet To Due',
      '1-30 Days',
      '31-45 Days',
      '46-60 Days',
      '61-90 Days',
      '91-120 Days',
      'More than 120 Days',
    ];

    const createMatrix = () => {
      const rows: any = {};
      for (const bucket of ageingBuckets) {
        rows[bucket] = {
          ageing: bucket,
          q1: { billCount: 0, invAmount: 0 },
          q2: { billCount: 0, invAmount: 0 },
          q3: { billCount: 0, invAmount: 0 },
          q4: { billCount: 0, invAmount: 0 },
          overall: { billCount: 0, invAmount: 0 },
        };
      }
      return rows;
    };

    const unpaidMatrix = createMatrix();
    const rtMatrix = createMatrix();

    for (const inv of invoices) {
      const isRt = inv.status === 'RT' || inv.salesType === 'RT';
      const matrix = isRt ? rtMatrix : unpaidMatrix;

      const { ageingBucket: bucket } = this.calculateAgeing(inv.dueDate, inv.status);

      if (matrix[bucket]) {
        const amt = Number(inv.outstanding || inv.invoiceAmount);
        const q = inv.quarter;

        if (q === 'Q1-2026/27' || (q && q.startsWith('Q1'))) {
          matrix[bucket].q1.billCount += 1;
          matrix[bucket].q1.invAmount += amt;
        } else if (q === 'Q2-2026/27' || (q && q.startsWith('Q2'))) {
          matrix[bucket].q2.billCount += 1;
          matrix[bucket].q2.invAmount += amt;
        } else if (q === 'Q3-2026/27' || (q && q.startsWith('Q3'))) {
          matrix[bucket].q3.billCount += 1;
          matrix[bucket].q3.invAmount += amt;
        } else if (q === 'Q4-2026/27' || (q && q.startsWith('Q4'))) {
          matrix[bucket].q4.billCount += 1;
          matrix[bucket].q4.invAmount += amt;
        }

        matrix[bucket].overall.billCount += 1;
        matrix[bucket].overall.invAmount += amt;
      }
    }

    const finalizeSection = (matrixRows: any) => {
      const list = ageingBuckets.map((b) => {
        const r = matrixRows[b];
        return {
          ageing: r.ageing,
          q1: { billCount: r.q1.billCount, invAmount: Number(r.q1.invAmount.toFixed(2)) },
          q2: { billCount: r.q2.billCount, invAmount: Number(r.q2.invAmount.toFixed(2)) },
          q3: { billCount: r.q3.billCount, invAmount: Number(r.q3.invAmount.toFixed(2)) },
          q4: { billCount: r.q4.billCount, invAmount: Number(r.q4.invAmount.toFixed(2)) },
          overall: { billCount: r.overall.billCount, invAmount: Number(r.overall.invAmount.toFixed(2)) },
        };
      });

      const totalRow = list.reduce(
        (acc: any, r: any) => {
          acc.q1.billCount += r.q1.billCount;
          acc.q1.invAmount += r.q1.invAmount;
          acc.q2.billCount += r.q2.billCount;
          acc.q2.invAmount += r.q2.invAmount;
          acc.q3.billCount += r.q3.billCount;
          acc.q3.invAmount += r.q3.invAmount;
          acc.q4.billCount += r.q4.billCount;
          acc.q4.invAmount += r.q4.invAmount;
          acc.overall.billCount += r.overall.billCount;
          acc.overall.invAmount += r.overall.invAmount;
          return acc;
        },
        {
          ageing: 'Total',
          q1: { billCount: 0, invAmount: 0 },
          q2: { billCount: 0, invAmount: 0 },
          q3: { billCount: 0, invAmount: 0 },
          q4: { billCount: 0, invAmount: 0 },
          overall: { billCount: 0, invAmount: 0 },
        }
      );

      totalRow.q1.invAmount = Number(totalRow.q1.invAmount.toFixed(2));
      totalRow.q2.invAmount = Number(totalRow.q2.invAmount.toFixed(2));
      totalRow.q3.invAmount = Number(totalRow.q3.invAmount.toFixed(2));
      totalRow.q4.invAmount = Number(totalRow.q4.invAmount.toFixed(2));
      totalRow.overall.invAmount = Number(totalRow.overall.invAmount.toFixed(2));

      return {
        rows: list,
        total: totalRow,
      };
    };

    const unpaidSection = finalizeSection(unpaidMatrix);
    const rtSection = finalizeSection(rtMatrix);

    const overallTotal = {
      unpaidInvAmount: unpaidSection.total.overall.invAmount,
      unpaidBillCount: unpaidSection.total.overall.billCount,
      rtInvAmount: rtSection.total.overall.invAmount,
      rtBillCount: rtSection.total.overall.billCount,
      combinedInvAmount: Number(
        (unpaidSection.total.overall.invAmount + rtSection.total.overall.invAmount).toFixed(2)
      ),
      combinedBillCount: unpaidSection.total.overall.billCount + rtSection.total.overall.billCount,
    };

    return {
      unpaid: unpaidSection,
      rt: rtSection,
      summary: overallTotal,
      quarters,
    };
  }

  /**
   * Helper: calculate fiscal quarter from date
   */
  private calculateQuarter(date: Date): string {
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    let qNum: number;
    let startYear: number;
    let endYear: number;

    if (month >= 3 && month <= 5) {
      qNum = 1;
      startYear = year;
      endYear = year + 1;
    } else if (month >= 6 && month <= 8) {
      qNum = 2;
      startYear = year;
      endYear = year + 1;
    } else if (month >= 9 && month <= 11) {
      qNum = 3;
      startYear = year;
      endYear = year + 1;
    } else {
      qNum = 4;
      startYear = year - 1;
      endYear = year;
    }
    const endShort = String(endYear).slice(-2);
    return `Q${qNum}-${startYear}/${endShort}`;
  }

  /**
   * DATA ENTRY: Create new AR invoice record for APPL or HCPPL (all 21 fields writable)
   */
  async createArInvoice(entity: 'APPL' | 'HCPPL', dto: any) {
    if (!dto.invoiceNumber || !dto.companyName) {
      throw new BadRequestException('Invoice number and Company name are required.');
    }

    const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : new Date();
    const paymentTermDays = dto.paymentTermDays !== undefined && dto.paymentTermDays !== '' ? Number(dto.paymentTermDays) : 30;
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : new Date(invoiceDate.getTime() + paymentTermDays * 24 * 60 * 60 * 1000);
    const quarter = dto.quarter && String(dto.quarter).trim() ? String(dto.quarter).trim() : this.calculateQuarter(invoiceDate);

    const basicAmount = dto.basicAmount !== undefined && dto.basicAmount !== '' ? Number(dto.basicAmount) : 0;
    const invoiceAmount = dto.invoiceAmount !== undefined && dto.invoiceAmount !== '' ? Number(dto.invoiceAmount) : basicAmount;
    const amtRcvd = dto.amtRcvd !== undefined && dto.amtRcvd !== '' ? Number(dto.amtRcvd) : 0;
    const outstanding = dto.outstanding !== undefined && dto.outstanding !== '' ? Number(dto.outstanding) : Number((invoiceAmount - amtRcvd).toFixed(2));

    let status = dto.status || (outstanding <= 0 ? 'PAID' : (amtRcvd > 0 ? 'PARTIAL' : 'UNPAID'));
    if (dto.salesType === 'RT') {
      status = 'RT';
    }

    let completePaymentDate: Date | null = null;
    if (dto.completePaymentDate) {
      completePaymentDate = new Date(dto.completePaymentDate);
    } else if (outstanding <= 0 && amtRcvd > 0) {
      completePaymentDate = new Date();
    }

    let amtRcvdDate: Date | null = null;
    if (dto.amtRcvdDate) {
      amtRcvdDate = new Date(dto.amtRcvdDate);
    } else if (amtRcvd > 0) {
      amtRcvdDate = new Date();
    }

    let srNo: number;
    if (dto.srNo !== undefined && dto.srNo !== null && dto.srNo !== '' && !isNaN(Number(dto.srNo))) {
      srNo = Number(dto.srNo);
    } else {
      const lastSr = await (this.prisma as any).backOfficeArInvoice.findFirst({
        where: { entity },
        orderBy: { srNo: 'desc' },
        select: { srNo: true },
      });
      srNo = (lastSr?.srNo || 0) + 1;
    }

    const calculatedAgeing = this.calculateAgeing(dueDate, status);
    const ageingDays = dto.ageingDays !== undefined && dto.ageingDays !== null && dto.ageingDays !== ''
      ? Number(dto.ageingDays)
      : calculatedAgeing.ageingDays;
    const ageingBucket = dto.ageingBucket && String(dto.ageingBucket).trim()
      ? String(dto.ageingBucket).trim()
      : calculatedAgeing.ageingBucket;

    return (this.prisma as any).backOfficeArInvoice.create({
      data: {
        entity,
        srNo,
        invoiceNumber: String(dto.invoiceNumber).trim(),
        invoiceDate,
        basicAmount: basicAmount.toFixed(2),
        invoiceAmount: invoiceAmount.toFixed(2),
        companyName: String(dto.companyName).trim(),
        siteName: dto.siteName ? String(dto.siteName).trim() : null,
        city: dto.city ? String(dto.city).trim() : null,
        salesType: dto.salesType || 'Regular',
        salesPerson: dto.salesPerson ? String(dto.salesPerson).trim() : null,
        paymentTermDays,
        dueDate,
        status,
        amtRcvd: amtRcvd.toFixed(2),
        amtRcvdDate,
        completePaymentDate,
        outstanding: outstanding.toFixed(2),
        remarks: dto.remarks ? String(dto.remarks).trim() : null,
        quarter,
        ageingDays,
        ageingBucket,
      },
    });
  }

  /**
   * DATA ENTRY: Update existing AR invoice record (all 21 fields writable)
   */
  async updateArInvoice(entity: 'APPL' | 'HCPPL', id: string, dto: any) {
    const existing = await (this.prisma as any).backOfficeArInvoice.findFirst({
      where: { id, entity },
    });

    if (!existing) {
      throw new NotFoundException(`${entity} invoice not found`);
    }

    const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : existing.invoiceDate;
    const paymentTermDays = dto.paymentTermDays !== undefined && dto.paymentTermDays !== '' ? Number(dto.paymentTermDays) : existing.paymentTermDays;
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : (dto.invoiceDate || dto.paymentTermDays !== undefined
      ? new Date(invoiceDate.getTime() + paymentTermDays * 24 * 60 * 60 * 1000)
      : existing.dueDate);
    const quarter = dto.quarter && String(dto.quarter).trim() ? String(dto.quarter).trim() : (dto.invoiceDate ? this.calculateQuarter(invoiceDate) : existing.quarter);

    const basicAmount = dto.basicAmount !== undefined && dto.basicAmount !== '' ? Number(dto.basicAmount) : Number(existing.basicAmount);
    const invoiceAmount = dto.invoiceAmount !== undefined && dto.invoiceAmount !== '' ? Number(dto.invoiceAmount) : Number(existing.invoiceAmount);
    const amtRcvd = dto.amtRcvd !== undefined && dto.amtRcvd !== '' ? Number(dto.amtRcvd) : Number(existing.amtRcvd);
    const outstanding = dto.outstanding !== undefined && dto.outstanding !== '' ? Number(dto.outstanding) : Number((invoiceAmount - amtRcvd).toFixed(2));

    let status = dto.status || existing.status;
    if (dto.status === undefined) {
      if (outstanding <= 0 && amtRcvd > 0 && status !== 'RT') {
        status = 'PAID';
      } else if (dto.salesType === 'RT') {
        status = 'RT';
      }
    }

    let completePaymentDate = existing.completePaymentDate;
    if (dto.completePaymentDate !== undefined) {
      completePaymentDate = dto.completePaymentDate ? new Date(dto.completePaymentDate) : null;
    } else if (outstanding <= 0 && amtRcvd > 0) {
      completePaymentDate = existing.completePaymentDate || new Date();
    } else if (outstanding > 0) {
      completePaymentDate = null;
    }

    let amtRcvdDate = existing.amtRcvdDate;
    if (dto.amtRcvdDate !== undefined) {
      amtRcvdDate = dto.amtRcvdDate ? new Date(dto.amtRcvdDate) : null;
    } else if (amtRcvd > 0 && !existing.amtRcvdDate) {
      amtRcvdDate = new Date();
    }

    const srNo = (dto.srNo !== undefined && dto.srNo !== null && dto.srNo !== '' && !isNaN(Number(dto.srNo)))
      ? Number(dto.srNo)
      : existing.srNo;

    const calculatedAgeing = this.calculateAgeing(dueDate, status);
    const ageingDays = dto.ageingDays !== undefined && dto.ageingDays !== null && dto.ageingDays !== ''
      ? Number(dto.ageingDays)
      : (existing.ageingDays !== null ? existing.ageingDays : calculatedAgeing.ageingDays);
    const ageingBucket = dto.ageingBucket && String(dto.ageingBucket).trim()
      ? String(dto.ageingBucket).trim()
      : (existing.ageingBucket || calculatedAgeing.ageingBucket);

    return (this.prisma as any).backOfficeArInvoice.update({
      where: { id },
      data: {
        srNo,
        invoiceNumber: dto.invoiceNumber ? String(dto.invoiceNumber).trim() : existing.invoiceNumber,
        invoiceDate,
        basicAmount: basicAmount.toFixed(2),
        invoiceAmount: invoiceAmount.toFixed(2),
        companyName: dto.companyName ? String(dto.companyName).trim() : existing.companyName,
        siteName: dto.siteName !== undefined ? dto.siteName : existing.siteName,
        city: dto.city !== undefined ? dto.city : existing.city,
        salesType: dto.salesType || existing.salesType,
        salesPerson: dto.salesPerson !== undefined ? dto.salesPerson : existing.salesPerson,
        paymentTermDays,
        dueDate,
        status,
        amtRcvd: amtRcvd.toFixed(2),
        amtRcvdDate,
        completePaymentDate,
        outstanding: outstanding.toFixed(2),
        remarks: dto.remarks !== undefined ? dto.remarks : existing.remarks,
        quarter,
        ageingDays,
        ageingBucket,
      },
    });
  }

  /**
   * DATA ENTRY: Delete AR invoice record
   */
  async deleteArInvoice(entity: 'APPL' | 'HCPPL', id: string) {
    const existing = await (this.prisma as any).backOfficeArInvoice.findFirst({
      where: { id, entity },
    });
    if (!existing) throw new NotFoundException(`${entity} invoice not found`);

    return (this.prisma as any).backOfficeArInvoice.delete({
      where: { id },
    });
  }

  // APPL Delegates
  async createApplArInvoice(dto: any) {
    return this.createArInvoice('APPL', dto);
  }
  async updateApplArInvoice(id: string, dto: any) {
    return this.updateArInvoice('APPL', id, dto);
  }
  async deleteApplArInvoice(id: string) {
    return this.deleteArInvoice('APPL', id);
  }

  // HCPPL Delegates
  async createHcpplArInvoice(dto: any) {
    return this.createArInvoice('HCPPL', dto);
  }
  async updateHcpplArInvoice(id: string, dto: any) {
    return this.updateArInvoice('HCPPL', id, dto);
  }
  async deleteHcpplArInvoice(id: string) {
    return this.deleteArInvoice('HCPPL', id);
  }

  /**
   * DATA ENTRY: Retrieve underlying HCPPL records for maintenance/editing
   */
  async getHcpplArEntries(query: any) {
    const {
      search,
      quarter,
      section,
      page = 1,
      limit = 20,
    } = query;

    const where: any = { entity: 'HCPPL' };

    if (quarter && quarter !== 'ALL') {
      where.quarter = quarter;
    }
    if (section === 'RT') {
      where.OR = [{ status: 'RT' }, { salesType: 'RT' }];
    } else if (section === 'UNPAID') {
      where.status = { not: 'RT' };
      where.salesType = { not: 'RT' };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        {
          OR: [
            { invoiceNumber: { contains: q, mode: 'insensitive' } },
            { companyName: { contains: q, mode: 'insensitive' } },
            { salesPerson: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const totalItems = await (this.prisma as any).backOfficeArInvoice.count({ where });
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);

    const items = await (this.prisma as any).backOfficeArInvoice.findMany({
      where,
      orderBy: { invoiceDate: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    return {
      items: items.map((r: any) => {
        const { ageingDays, ageingBucket } = this.calculateAgeing(r.dueDate, r.status);
        return {
          id: r.id,
          srNo: r.srNo,
          invoiceNumber: r.invoiceNumber,
          invoiceDate: r.invoiceDate,
          basicAmount: Number(r.basicAmount),
          invoiceAmount: Number(r.invoiceAmount),
          companyName: r.companyName,
          salesPerson: r.salesPerson,
          salesType: r.salesType,
          paymentTermDays: r.paymentTermDays,
          dueDate: r.dueDate,
          status: r.status,
          amtRcvd: Number(r.amtRcvd),
          outstanding: Number(r.outstanding),
          quarter: r.quarter,
          ageingDays,
          ageingBucket,
          remarks: r.remarks,
        };
      }),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    };
  }

  /**
   * CONFIRMED DISPATCHES REGISTER (Read-Only Consolidation for Dispatch 1 & Dispatch 2)
   *
   * Absolute safety rules:
   * - Strictly read-only; zero mutation or record creation.
   * - Reads existing Prisma dispatch records with status = 'DELIVERED'.
   * - Authoritative separation:
   *     Dispatch 1: ['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'Category 1']
   *     Dispatch 2: ['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'Category 2']
   *     (Null/ambiguous records are NEVER guessed into Dispatch 1 or Dispatch 2: D1 ∩ D2 = ∅)
   * - Joins Sales Person from Sales Order hierarchy; never hardcoded, fallback '—'.
   * - Precise India Standard Time (IST, UTC+05:30) date boundaries.
   */
  async getConfirmedDispatches(query: any) {
    const {
      tab = 'D1',
      dateFilter = 'today',
      startDate,
      endDate,
      search,
      page = 1,
      limit = 25,
      exportAll = false,
    } = query;

    const D1_CATEGORIES = ['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'Category 1'];
    const D2_CATEGORIES = ['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'Category 2'];

    // 1. Determine IST calendar range
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
    const istYear = nowIST.getUTCFullYear();
    const istMonth = nowIST.getUTCMonth();
    const istDate = nowIST.getUTCDate();

    let dateRange: { start: Date; end: Date } | null = null;

    if (dateFilter === 'today') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'yesterday') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'this_month') {
      const startIST = new Date(Date.UTC(istYear, istMonth, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth + 1, 0, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'custom' && startDate && endDate) {
      const [sY, sM, sD] = String(startDate).split('-').map(Number);
      const [eY, eM, eD] = String(endDate).split('-').map(Number);
      if (!isNaN(sY) && !isNaN(eY)) {
        const startIST = new Date(Date.UTC(sY, sM - 1, sD, 0, 0, 0, 0));
        const endIST = new Date(Date.UTC(eY, eM - 1, eD, 23, 59, 59, 999));
        dateRange = {
          start: new Date(startIST.getTime() - IST_OFFSET_MS),
          end: new Date(endIST.getTime() - IST_OFFSET_MS),
        };
      }
    }

    // 2. Build base filter: ONLY confirmed deliveries (DELIVERED)
    const baseWhere: any = {
      status: 'DELIVERED',
    };

    if (dateRange) {
      baseWhere.OR = [
        {
          dispatchedAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        {
          AND: [
            { dispatchedAt: null },
            {
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          ],
        },
      ];
    }

    // 3. Search conditions
    let searchCondition: any = null;
    if (search && String(search).trim()) {
      const term = String(search).trim();
      searchCondition = {
        OR: [
          { dispatchNo: { contains: term, mode: 'insensitive' } },
          { invoiceNumber: { contains: term, mode: 'insensitive' } },
          { gatePassNumber: { contains: term, mode: 'insensitive' } },
          { driverName: { contains: term, mode: 'insensitive' } },
          { vehicleNumber: { contains: term, mode: 'insensitive' } },
          { deliveryAddress: { contains: term, mode: 'insensitive' } },
          { receivedBy: { contains: term, mode: 'insensitive' } },
          {
            salesOrder: {
              OR: [
                { orderNumber: { contains: term, mode: 'insensitive' } },
                { customer: { companyName: { contains: term, mode: 'insensitive' } } },
                { salesExecutive: { name: { contains: term, mode: 'insensitive' } } },
              ],
            },
          },
        ],
      };
    }

    // 4. Calculate tab counts under the active dateFilter & search
    const filterD1Where: any = {
      ...baseWhere,
      dispatchCategory: { in: D1_CATEGORIES },
    };
    const filterD2Where: any = {
      ...baseWhere,
      dispatchCategory: { in: D2_CATEGORIES },
    };
    if (searchCondition) {
      filterD1Where.AND = [searchCondition];
      filterD2Where.AND = [searchCondition];
    }

    const [d1Count, d2Count] = await Promise.all([
      this.prisma.dispatch.count({ where: filterD1Where }),
      this.prisma.dispatch.count({ where: filterD2Where }),
    ]);

    // 5. Query the requested tab ('D1' vs 'D2')
    const selectedTab = String(tab).toUpperCase() === 'D2' ? 'D2' : 'D1';
    const activeCategories = selectedTab === 'D2' ? D2_CATEGORIES : D1_CATEGORIES;

    const queryWhere: any = {
      ...baseWhere,
      dispatchCategory: { in: activeCategories },
    };
    if (searchCondition) {
      queryWhere.AND = [searchCondition];
    }

    const totalItems = selectedTab === 'D2' ? d2Count : d1Count;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 25);
    const isExport = exportAll === true || exportAll === 'true' || limit === 'all' || Number(limit) === -1;

    const dispatches = await this.prisma.dispatch.findMany({
      where: queryWhere,
      include: {
        salesOrder: {
          include: {
            customer: true,
            salesExecutive: { select: { id: true, name: true, email: true } },
            sourceQuotation: {
              include: {
                salesExecutive: { select: { id: true, name: true, email: true } },
                lead: {
                  include: {
                    salesExecutive: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
            quotation: {
              include: {
                salesExecutive: { select: { id: true, name: true, email: true } },
                lead: {
                  include: {
                    salesExecutive: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            salesOrderItem: {
              include: {
                product: true,
              },
            },
          },
        },
        invoices: true,
      },
      orderBy: [
        { dispatchedAt: 'desc' },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      ...(isExport ? {} : { skip: (pageNum - 1) * limitNum, take: limitNum }),
    });

    // 6. Map and enrich records with resolved Sales Person
    const mappedItems = dispatches.map((d: any) => {
      const so = d.salesOrder;
      const salesPerson =
        so?.salesExecutive?.name ||
        so?.sourceQuotation?.salesExecutive?.name ||
        so?.quotation?.salesExecutive?.name ||
        so?.sourceQuotation?.lead?.salesExecutive?.name ||
        so?.quotation?.lead?.salesExecutive?.name ||
        '—';

      const customerName =
        so?.customer?.companyName ||
        (d as any).customerName ||
        'Consignee Client';

      const consigneeAddress =
        d.deliveryAddress ||
        d.documentChecklist?.deliveryAddress ||
        (typeof so?.shippingAddress === 'string' ? so.shippingAddress : (so?.shippingAddress?.formattedAddress || so?.shippingAddress?.address)) ||
        (typeof so?.customer?.shippingAddress === 'string' ? so.customer.shippingAddress : (so?.customer?.shippingAddress?.formattedAddress || so?.customer?.shippingAddress?.address)) ||
        'Customer Designated Site';

      return {
        id: d.id,
        dispatchNo: d.dispatchNo,
        salesOrderId: d.salesOrderId,
        salesOrderNumber: so?.orderNumber || '—',
        dispatchCategory: selectedTab,
        status: d.status,
        customerName,
        consigneeAddress,
        salesPerson,
        salesPersonEmail: so?.salesExecutive?.email || null,
        driverName: d.driverName || '—',
        driverPhone: d.driverPhone || '—',
        vehicleNumber: d.vehicleNumber || '—',
        transporterName: d.transporterName || '—',
        lrNumber: d.lrNumber || d.ewayBillNumber || '—',
        invoiceNumber: d.invoiceNumber || d.documentChecklist?.invoiceNumber || d.invoices?.[0]?.invoiceNumber || '—',
        challanNumber: d.gatePassNumber || d.documentChecklist?.challanNumber || d.challanNumber || '—',
        dispatchedAt: d.dispatchedAt || d.createdAt,
        deliveredAt: d.deliveredAt,
        receivedBy: d.receivedBy || '—',
        receiverPhone: d.receiverPhone || '—',
        deliveryRemarks: d.deliveryRemarks || '—',
        podUrl: d.podUrl || null,
        podStatus: d.podStatus || (d.status === 'DELIVERED' ? 'APPROVED' : 'PENDING'),
        totalWeight: d.totalWeight ? Number(d.totalWeight) : null,
        freightAmount: d.freightAmount ? Number(d.freightAmount) : null,
        packageCount: d.packageCount || null,
        documentChecklist: d.documentChecklist || null,
        items: (d.items || []).map((item: any) => ({
          id: item.id,
          productName: item.salesOrderItem?.product?.name || item.salesOrderItem?.productNameSnapshot || 'Dispatched Item',
          sku: item.salesOrderItem?.product?.sku || '—',
          quantity: Number(item.quantity) || 0,
          unit: item.salesOrderItem?.product?.unit || 'Nos',
        })),
      };
    });

    return {
      items: mappedItems,
      counts: {
        D1: d1Count,
        D2: d2Count,
        total: d1Count + d2Count,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      filter: {
        tab: selectedTab,
        dateFilter,
        startDate: startDate || null,
        endDate: endDate || null,
        search: search || '',
      },
    };
  }

  /**
   * AR — HCPPL MANUAL DATA ENTRY REGISTER
   *
   * Fully independent, manual row-by-row data entry sheet.
   * Zero automatic generation or mutation of core ERP invoice/payment tables.
   */

  async getHcpplArManualEntries(query: any) {
    const {
      dateFilter = 'all',
      startDate,
      endDate,
      search,
      managementStatus,
      ageingBucket,
      dueStatus,
      paymentStatus,
      salesPerson,
      salesType,
      page = 1,
      limit = 25,
      exportAll = false,
    } = query;

    const where: any = {
      isArchived: false,
    };

    // 1. IST Date boundaries
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
    const istYear = nowIST.getUTCFullYear();
    const istMonth = nowIST.getUTCMonth();
    const istDate = nowIST.getUTCDate();

    let dateRange: { start: Date; end: Date } | null = null;

    if (dateFilter === 'today') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'yesterday') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'this_month') {
      const startIST = new Date(Date.UTC(istYear, istMonth, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth + 1, 0, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'last_month') {
      const startIST = new Date(Date.UTC(istYear, istMonth - 1, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, 0, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'financial_year') {
      const fyStartYear = istMonth >= 3 ? istYear : istYear - 1;
      const startIST = new Date(Date.UTC(fyStartYear, 3, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(fyStartYear + 1, 2, 31, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'custom' && startDate && endDate) {
      const [sY, sM, sD] = String(startDate).split('-').map(Number);
      const [eY, eM, eD] = String(endDate).split('-').map(Number);
      if (!isNaN(sY) && !isNaN(eY)) {
        const startIST = new Date(Date.UTC(sY, sM - 1, sD, 0, 0, 0, 0));
        const endIST = new Date(Date.UTC(eY, eM - 1, eD, 23, 59, 59, 999));
        dateRange = {
          start: new Date(startIST.getTime() - IST_OFFSET_MS),
          end: new Date(endIST.getTime() - IST_OFFSET_MS),
        };
      }
    }

    if (dateRange) {
      where.invoiceDate = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    // 2. Specific manual filters
    if (managementStatus && managementStatus !== 'ALL') {
      where.managementStatus = managementStatus;
    }
    if (ageingBucket && ageingBucket !== 'ALL') {
      where.ageingBucket = ageingBucket;
    }
    if (dueStatus && dueStatus !== 'ALL') {
      where.dueStatus = dueStatus;
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }
    if (salesPerson && salesPerson !== 'ALL') {
      where.salesPerson = { contains: salesPerson, mode: 'insensitive' };
    }
    if (salesType && salesType !== 'ALL') {
      where.salesType = { contains: salesType, mode: 'insensitive' };
    }

    // 3. Multi-field text search
    if (search && String(search).trim()) {
      const term = String(search).trim();
      where.AND = [
        {
          OR: [
            { invoiceNo: { contains: term, mode: 'insensitive' } },
            { partyName: { contains: term, mode: 'insensitive' } },
            { siteName: { contains: term, mode: 'insensitive' } },
            { salesPerson: { contains: term, mode: 'insensitive' } },
            { salesType: { contains: term, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // 4. Fetch all matching records to compute exact decimal summaries
    const allMatches = await (this.prisma as any).hcpplArManualEntry.findMany({
      where,
      orderBy: [
        { invoiceDate: 'desc' },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });

    let totalBasic = 0;
    let totalGst = 0;
    let mgmtCount = 0;
    let nmgmtCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let partlyPaidCount = 0;
    let cancelledCount = 0;

    for (const item of allMatches) {
      const basic = Number(item.basicAmount) || 0;
      const gst = Number(item.invoiceGstAmount) || 0;
      totalBasic = Number((totalBasic + basic).toFixed(2));
      totalGst = Number((totalGst + gst).toFixed(2));

      if (item.managementStatus === 'MGMT') mgmtCount++;
      else nmgmtCount++;

      const pStatus = String(item.paymentStatus).toUpperCase();
      if (pStatus === 'PAID') paidCount++;
      else if (pStatus === 'PARTLY PAID' || pStatus === 'PARTIAL') partlyPaidCount++;
      else if (pStatus === 'CANCELLED') cancelledCount++;
      else unpaidCount++;
    }

    const totalInvoiceAmount = Number((totalBasic + totalGst).toFixed(2));

    // 5. Pagination
    const totalItems = allMatches.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 25);
    const isExport = exportAll === true || exportAll === 'true' || limit === 'all' || Number(limit) === -1;

    const pagedRecords = isExport
      ? allMatches
      : allMatches.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const mappedItems = pagedRecords.map((r: any) => {
      const basic = Number(r.basicAmount) || 0;
      const gst = Number(r.invoiceGstAmount) || 0;
      return {
        id: r.id,
        srNo: r.srNo,
        invoiceNo: r.invoiceNo,
        invoiceDate: r.invoiceDate,
        basicAmount: basic,
        invoiceGstAmount: gst,
        invoiceAmount: Number((basic + gst).toFixed(2)),
        partyName: r.partyName,
        siteName: r.siteName || '—',
        salesType: r.salesType || '—',
        salesPerson: r.salesPerson || '—',
        paymentTerm: r.paymentTerm || '—',
        ageingDays: r.ageingDays !== null && r.ageingDays !== undefined ? r.ageingDays : null,
        managementStatus: r.managementStatus || 'NMGMT',
        ageingBucket: r.ageingBucket || '30 DAYS',
        dueStatus: r.dueStatus || 'DUE',
        paymentStatus: r.paymentStatus || 'UNPAID',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    // 6. Distinct filter options from all active manual records
    const allActive = await (this.prisma as any).hcpplArManualEntry.findMany({
      where: { isArchived: false },
      select: { salesPerson: true, salesType: true },
    });

    const salesPersons = Array.from(
      new Set(allActive.map((r: any) => r.salesPerson).filter(Boolean)),
    ).sort();
    const salesTypes = Array.from(
      new Set(allActive.map((r: any) => r.salesType).filter(Boolean)),
    ).sort();

    return {
      items: mappedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      totals: {
        totalEntries: totalItems,
        totalBasicAmount: totalBasic,
        totalGstAmount: totalGst,
        totalInvoiceAmount,
        mgmtCount,
        nmgmtCount,
        paidCount,
        unpaidCount,
        partlyPaidCount,
        cancelledCount,
      },
      filterOptions: {
        salesPersons,
        salesTypes,
      },
    };
  }

  /**
   * DATA ENTRY: Create new HCPPL AR manual record
   */
  async createHcpplArManualEntry(userId: string, dto: any) {
    if (!dto.invoiceNo || !dto.partyName || !dto.invoiceDate) {
      throw new BadRequestException('Invoice No., Date, and Party Name are required.');
    }

    const basicAmountNum = Number(dto.basicAmount) || 0;
    const invoiceGstAmountNum = Number(dto.invoiceGstAmount) || 0;

    const last = await (this.prisma as any).hcpplArManualEntry.findFirst({
      orderBy: { srNo: 'desc' },
      select: { srNo: true },
    });
    const srNo = (last?.srNo || 0) + 1;

    return (this.prisma as any).hcpplArManualEntry.create({
      data: {
        srNo,
        invoiceNo: String(dto.invoiceNo).trim(),
        invoiceDate: new Date(dto.invoiceDate),
        basicAmount: basicAmountNum.toFixed(2),
        invoiceGstAmount: invoiceGstAmountNum.toFixed(2),
        partyName: String(dto.partyName).trim(),
        siteName: dto.siteName ? String(dto.siteName).trim() : null,
        salesType: dto.salesType ? String(dto.salesType).trim() : null,
        salesPerson: dto.salesPerson ? String(dto.salesPerson).trim() : null,
        paymentTerm: dto.paymentTerm ? String(dto.paymentTerm).trim() : null,
        ageingDays: dto.ageingDays !== undefined && dto.ageingDays !== '' && !isNaN(Number(dto.ageingDays))
          ? Number(dto.ageingDays)
          : null,
        managementStatus: dto.managementStatus === 'MGMT' ? 'MGMT' : 'NMGMT',
        ageingBucket: dto.ageingBucket || '30 DAYS',
        dueStatus: dto.dueStatus || 'DUE',
        paymentStatus: dto.paymentStatus || 'UNPAID',
        isArchived: false,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  /**
   * DATA ENTRY: Update existing HCPPL AR manual record
   */
  async updateHcpplArManualEntry(id: string, userId: string, dto: any) {
    const existing = await (this.prisma as any).hcpplArManualEntry.findFirst({
      where: { id, isArchived: false },
    });

    if (!existing) {
      throw new NotFoundException('HCPPL AR Manual Entry not found');
    }

    const basicAmountNum = dto.basicAmount !== undefined ? Number(dto.basicAmount) : Number(existing.basicAmount);
    const invoiceGstAmountNum = dto.invoiceGstAmount !== undefined ? Number(dto.invoiceGstAmount) : Number(existing.invoiceGstAmount);

    return (this.prisma as any).hcpplArManualEntry.update({
      where: { id },
      data: {
        invoiceNo: dto.invoiceNo ? String(dto.invoiceNo).trim() : existing.invoiceNo,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : existing.invoiceDate,
        basicAmount: basicAmountNum.toFixed(2),
        invoiceGstAmount: invoiceGstAmountNum.toFixed(2),
        partyName: dto.partyName ? String(dto.partyName).trim() : existing.partyName,
        siteName: dto.siteName !== undefined ? (dto.siteName ? String(dto.siteName).trim() : null) : existing.siteName,
        salesType: dto.salesType !== undefined ? (dto.salesType ? String(dto.salesType).trim() : null) : existing.salesType,
        salesPerson: dto.salesPerson !== undefined ? (dto.salesPerson ? String(dto.salesPerson).trim() : null) : existing.salesPerson,
        paymentTerm: dto.paymentTerm !== undefined ? (dto.paymentTerm ? String(dto.paymentTerm).trim() : null) : existing.paymentTerm,
        ageingDays: dto.ageingDays !== undefined && dto.ageingDays !== '' && !isNaN(Number(dto.ageingDays))
          ? Number(dto.ageingDays)
          : existing.ageingDays,
        managementStatus: dto.managementStatus || existing.managementStatus,
        ageingBucket: dto.ageingBucket || existing.ageingBucket,
        dueStatus: dto.dueStatus || existing.dueStatus,
        paymentStatus: dto.paymentStatus || existing.paymentStatus,
        updatedById: userId,
      },
    });
  }

  /**
   * DATA ENTRY: Soft-Archive existing HCPPL AR manual record
   */
  async archiveHcpplArManualEntry(id: string, userId: string) {
    const existing = await (this.prisma as any).hcpplArManualEntry.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('HCPPL AR Manual Entry not found');
    }

    return (this.prisma as any).hcpplArManualEntry.update({
      where: { id },
      data: {
        isArchived: true,
        updatedById: userId,
      },
    });
  }

  /**
   * AR — SAMPLE TRACKER MANUAL REGISTER
   *
   * Completely standalone manual tracking sheet for customer samples.
   * Zero connection to core Dispatch, Sales Orders, Leads, Products, or Inventory.
   */

  async getSampleTrackerEntries(query: any) {
    const {
      dateFilter = 'all',
      startDate,
      endDate,
      search,
      status,
      transportMode,
      sortBy = 'dispatchDate',
      sortOrder = 'desc',
      page = 1,
      limit = 25,
      exportAll = false,
    } = query;

    const where: any = {
      isArchived: false,
    };

    // 1. IST Date boundaries
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
    const istYear = nowIST.getUTCFullYear();
    const istMonth = nowIST.getUTCMonth();
    const istDate = nowIST.getUTCDate();

    let dateRange: { start: Date; end: Date } | null = null;

    if (dateFilter === 'today') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'yesterday') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'this_month') {
      const startIST = new Date(Date.UTC(istYear, istMonth, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth + 1, 0, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'last_month') {
      const startIST = new Date(Date.UTC(istYear, istMonth - 1, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, 0, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'financial_year') {
      const fyStartYear = istMonth >= 3 ? istYear : istYear - 1;
      const startIST = new Date(Date.UTC(fyStartYear, 3, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(fyStartYear + 1, 2, 31, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'custom' && startDate && endDate) {
      const [sY, sM, sD] = String(startDate).split('-').map(Number);
      const [eY, eM, eD] = String(endDate).split('-').map(Number);
      if (!isNaN(sY) && !isNaN(eY)) {
        const startIST = new Date(Date.UTC(sY, sM - 1, sD, 0, 0, 0, 0));
        const endIST = new Date(Date.UTC(eY, eM - 1, eD, 23, 59, 59, 999));
        dateRange = {
          start: new Date(startIST.getTime() - IST_OFFSET_MS),
          end: new Date(endIST.getTime() - IST_OFFSET_MS),
        };
      }
    }

    if (dateRange) {
      where.dispatchDate = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    // 2. Specific filters
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (transportMode && transportMode !== 'ALL') {
      where.transportMode = transportMode;
    }

    // 3. Multi-field search
    if (search && String(search).trim()) {
      const term = String(search).trim();
      where.AND = [
        {
          OR: [
            { partyName: { contains: term, mode: 'insensitive' } },
            { materialManually: { contains: term, mode: 'insensitive' } },
            { partyContact: { contains: term, mode: 'insensitive' } },
            { referencePerson: { contains: term, mode: 'insensitive' } },
            { referenceNumber: { contains: term, mode: 'insensitive' } },
            { remark: { contains: term, mode: 'insensitive' } },
            { transportMode: { contains: term, mode: 'insensitive' } },
            { status: { contains: term, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // 4. Determine ordering
    const validSortFields = ['dispatchDate', 'partyName', 'transportAmount', 'status', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'dispatchDate';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const allMatches = await (this.prisma as any).sampleTrackerEntry.findMany({
      where,
      orderBy: [
        { [orderField]: orderDirection },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });

    // 5. Compute decimal-safe totals
    let totalTransportAmount = 0;
    let pendingCount = 0;
    let dispatchedCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    for (const item of allMatches) {
      const amt = Number(item.transportAmount) || 0;
      totalTransportAmount = Number((totalTransportAmount + amt).toFixed(2));

      const s = String(item.status || '').toUpperCase();
      if (s === 'PENDING') pendingCount++;
      else if (s === 'DISPATCHED') dispatchedCount++;
      else if (s === 'IN TRANSIT') inTransitCount++;
      else if (s === 'DELIVERED') deliveredCount++;
      else if (s === 'CANCELLED') cancelledCount++;
    }

    // 6. Pagination & dynamic SR NO (never stored in DB)
    const totalItems = allMatches.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 25);
    const isExport = exportAll === true || exportAll === 'true' || limit === 'all' || Number(limit) === -1;

    const pagedRecords = isExport
      ? allMatches
      : allMatches.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const startIndex = (pageNum - 1) * limitNum;
    const mappedItems = pagedRecords.map((r: any, idx: number) => ({
      srNo: isExport ? idx + 1 : startIndex + idx + 1,
      id: r.id,
      partyName: r.partyName,
      station: r.sitePincode || '—',
      sitePincode: r.sitePincode || '—',
      materialManually: r.materialManually,
      contactPerson: r.partyContact || '—',
      contactNumber: '',
      sampleDetails: '',
      partyContact: r.partyContact || '—',
      referancePerson: r.referencePerson || '—',
      referencePerson: r.referencePerson || '—',
      referaceNumber: r.referenceNumber || '—',
      referenceNumber: r.referenceNumber || '—',
      dispatchDate: r.dispatchDate,
      transportMode: r.transportMode || 'BY HAND',
      transportAmount: Number(r.transportAmount) || 0,
      status: r.status || 'SAMPLE GIVEN',
      remarks: r.remark || '',
      remark: r.remark || '',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return {
      items: mappedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      totals: {
        totalSamples: totalItems,
        pendingCount,
        dispatchedCount,
        inTransitCount,
        deliveredCount,
        cancelledCount,
        totalTransportAmount,
      },
    };
  }

  async createSampleTrackerEntry(userId: string, dto: any) {
    if (
      !dto.partyName ||
      !dto.materialManually ||
      !dto.dispatchDate ||
      !dto.transportMode ||
      !dto.status
    ) {
      throw new BadRequestException(
        'Party Name, Material Manually, Dispatch Date, Transport Mode, and Status are required for manual sample tracking.',
      );
    }

    const transportAmountNum = Number(dto.transportAmount) || 0;
    const refPerson = dto.referancePerson !== undefined ? dto.referancePerson : dto.referencePerson;
    const refNum = dto.referaceNumber !== undefined ? dto.referaceNumber : dto.referenceNumber;
    const rem = dto.remarks !== undefined ? dto.remarks : dto.remark;
    const contact = dto.contactPerson !== undefined ? dto.contactPerson : dto.partyContact;
    const station = dto.station !== undefined ? dto.station : dto.sitePincode;

    return (this.prisma as any).sampleTrackerEntry.create({
      data: {
        partyName: String(dto.partyName).trim(),
        sitePincode: station ? String(station).trim() : null,
        materialManually: String(dto.materialManually).trim(),
        partyContact: contact ? String(contact).trim() : null,
        referencePerson: refPerson ? String(refPerson).trim() : null,
        referenceNumber: refNum ? String(refNum).trim() : null,
        dispatchDate: new Date(dto.dispatchDate),
        transportMode: String(dto.transportMode).trim(),
        transportAmount: transportAmountNum.toFixed(2),
        status: String(dto.status).trim(),
        remark: rem ? String(rem).trim() : null,
        isArchived: false,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async updateSampleTrackerEntry(id: string, userId: string, dto: any) {
    const existing = await (this.prisma as any).sampleTrackerEntry.findFirst({
      where: { id, isArchived: false },
    });
    if (!existing) {
      throw new NotFoundException('Sample Tracker Entry not found');
    }

    const transportAmountNum = dto.transportAmount !== undefined ? Number(dto.transportAmount) : Number(existing.transportAmount);
    const refPerson = dto.referancePerson !== undefined ? dto.referancePerson : dto.referencePerson;
    const refNum = dto.referaceNumber !== undefined ? dto.referaceNumber : dto.referenceNumber;
    const rem = dto.remarks !== undefined ? dto.remarks : dto.remark;
    const contact = dto.contactPerson !== undefined ? dto.contactPerson : dto.partyContact;
    const station = dto.station !== undefined ? dto.station : dto.sitePincode;

    return (this.prisma as any).sampleTrackerEntry.update({
      where: { id },
      data: {
        partyName: dto.partyName ? String(dto.partyName).trim() : existing.partyName,
        sitePincode: station !== undefined ? (station ? String(station).trim() : null) : existing.sitePincode,
        materialManually: dto.materialManually ? String(dto.materialManually).trim() : existing.materialManually,
        partyContact: contact !== undefined ? (contact ? String(contact).trim() : null) : existing.partyContact,
        referencePerson: refPerson !== undefined ? (refPerson ? String(refPerson).trim() : null) : existing.referencePerson,
        referenceNumber: refNum !== undefined ? (refNum ? String(refNum).trim() : null) : existing.referenceNumber,
        dispatchDate: dto.dispatchDate ? new Date(dto.dispatchDate) : existing.dispatchDate,
        transportMode: dto.transportMode || existing.transportMode,
        transportAmount: transportAmountNum.toFixed(2),
        status: dto.status || existing.status,
        remark: rem !== undefined ? (rem ? String(rem).trim() : null) : existing.remark,
        updatedById: userId,
      },
    });
  }

  async archiveSampleTrackerEntry(id: string, userId: string) {
    const existing = await (this.prisma as any).sampleTrackerEntry.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Sample Tracker Entry not found');
    }

    return (this.prisma as any).sampleTrackerEntry.update({
      where: { id },
      data: {
        isArchived: true,
        updatedById: userId,
      },
    });
  }

  /**
   * AR — OUTWARD REGISTER MANUAL ENTRY
   *
   * Completely standalone manual tracking sheet for outward material movements.
   * Zero connection to Inventory, Stock deductions, Production, or Dispatch.
   */

  async getOutwardRegisterEntries(query: any) {
    const {
      dateFilter = 'all',
      startDate,
      endDate,
      search,
      transporterName,
      salesPerson,
      receivingStatus,
      sortBy = 'outwardDate',
      sortOrder = 'desc',
      page = 1,
      limit = 25,
      exportAll = false,
    } = query;

    const where: any = {
      isArchived: false,
    };

    // 1. IST Date boundaries
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
    const istYear = nowIST.getUTCFullYear();
    const istMonth = nowIST.getUTCMonth();
    const istDate = nowIST.getUTCDate();

    let dateRange: { start: Date; end: Date } | null = null;

    if (dateFilter === 'today') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'yesterday') {
      const startIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, istDate - 1, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'this_month') {
      const startIST = new Date(Date.UTC(istYear, istMonth, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth + 1, 0, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'last_month') {
      const startIST = new Date(Date.UTC(istYear, istMonth - 1, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(istYear, istMonth, 0, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'financial_year') {
      const fyStartYear = istMonth >= 3 ? istYear : istYear - 1;
      const startIST = new Date(Date.UTC(fyStartYear, 3, 1, 0, 0, 0, 0));
      const endIST = new Date(Date.UTC(fyStartYear + 1, 2, 31, 23, 59, 59, 999));
      dateRange = {
        start: new Date(startIST.getTime() - IST_OFFSET_MS),
        end: new Date(endIST.getTime() - IST_OFFSET_MS),
      };
    } else if (dateFilter === 'custom' && startDate && endDate) {
      const [sY, sM, sD] = String(startDate).split('-').map(Number);
      const [eY, eM, eD] = String(endDate).split('-').map(Number);
      if (!isNaN(sY) && !isNaN(eY)) {
        const startIST = new Date(Date.UTC(sY, sM - 1, sD, 0, 0, 0, 0));
        const endIST = new Date(Date.UTC(eY, eM - 1, eD, 23, 59, 59, 999));
        dateRange = {
          start: new Date(startIST.getTime() - IST_OFFSET_MS),
          end: new Date(endIST.getTime() - IST_OFFSET_MS),
        };
      }
    }

    if (dateRange) {
      where.outwardDate = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    // 2. Specific filters
    if (transporterName && transporterName !== 'ALL') {
      where.transporterName = { contains: transporterName, mode: 'insensitive' };
    }
    if (salesPerson && salesPerson !== 'ALL') {
      where.salesPerson = { contains: salesPerson, mode: 'insensitive' };
    }
    if (receivingStatus && receivingStatus !== 'ALL') {
      if (receivingStatus.toUpperCase() === 'RECEIVED') {
        where.receivingManually = { contains: 'received', mode: 'insensitive' };
      } else if (receivingStatus.toUpperCase() === 'PENDING') {
        where.OR = [
          { receivingManually: null },
          { receivingManually: { contains: 'pending', mode: 'insensitive' } },
        ];
      }
    }

    // 3. Multi-field search
    if (search && String(search).trim()) {
      const term = String(search).trim();
      where.AND = [
        {
          OR: [
            { partyName: { contains: term, mode: 'insensitive' } },
            { transporterName: { contains: term, mode: 'insensitive' } },
            { vehicleNo: { contains: term, mode: 'insensitive' } },
            { material: { contains: term, mode: 'insensitive' } },
            { salesPerson: { contains: term, mode: 'insensitive' } },
            { invoiceNo: { contains: term, mode: 'insensitive' } },
            { receivingManually: { contains: term, mode: 'insensitive' } },
            { remark: { contains: term, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // 4. Ordering
    const validSortFields = ['outwardDate', 'partyName', 'transporterName', 'quantity', 'invoiceNo', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'outwardDate';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const allMatches = await (this.prisma as any).outwardRegisterEntry.findMany({
      where,
      orderBy: [
        { [orderField]: orderDirection },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });

    // 5. Decimal-safe KPI summaries
    let totalQuantity = 0;
    let todayEntries = 0;
    let thisMonthEntries = 0;
    let receivedCount = 0;
    let pendingCount = 0;

    const todayStart = new Date(Date.UTC(istYear, istMonth, istDate, 0, 0, 0, 0)).getTime() - IST_OFFSET_MS;
    const todayEnd = new Date(Date.UTC(istYear, istMonth, istDate, 23, 59, 59, 999)).getTime() - IST_OFFSET_MS;
    const monthStart = new Date(Date.UTC(istYear, istMonth, 1, 0, 0, 0, 0)).getTime() - IST_OFFSET_MS;
    const monthEnd = new Date(Date.UTC(istYear, istMonth + 1, 0, 23, 59, 59, 999)).getTime() - IST_OFFSET_MS;

    for (const item of allMatches) {
      const q = Number(item.quantity) || 0;
      totalQuantity = Number((totalQuantity + q).toFixed(3));

      const dt = new Date(item.outwardDate).getTime();
      if (dt >= todayStart && dt <= todayEnd) todayEntries++;
      if (dt >= monthStart && dt <= monthEnd) thisMonthEntries++;

      const rec = String(item.receivingManually || '').toLowerCase();
      if (rec.includes('received') || rec.includes('done') || rec.includes('ok')) {
        receivedCount++;
      } else {
        pendingCount++;
      }
    }

    // 6. Pagination & dynamic SR NO
    const totalItems = allMatches.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 25);
    const isExport = exportAll === true || exportAll === 'true' || limit === 'all' || Number(limit) === -1;

    const pagedRecords = isExport
      ? allMatches
      : allMatches.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const startIndex = (pageNum - 1) * limitNum;
    const mappedItems = pagedRecords.map((r: any, idx: number) => ({
      srNo: isExport ? idx + 1 : startIndex + idx + 1,
      id: r.id,
      outwardDate: r.outwardDate,
      transporterName: r.transporterName,
      vehicleNo: r.vehicleNo || '—',
      material: r.material,
      quantity: Number(r.quantity) || 0,
      partyName: r.partyName,
      salesPerson: r.salesPerson || '—',
      invoiceNo: r.invoiceNo || '—',
      receivingManually: r.receivingManually || '—',
      remark: r.remark || '',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // 7. Distinct filter options
    const allActive = await (this.prisma as any).outwardRegisterEntry.findMany({
      where: { isArchived: false },
      select: { transporterName: true, salesPerson: true },
    });
    const transporters = Array.from(new Set(allActive.map((r: any) => r.transporterName).filter(Boolean))).sort();
    const salesPersons = Array.from(new Set(allActive.map((r: any) => r.salesPerson).filter(Boolean))).sort();

    return {
      items: mappedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      totals: {
        totalEntries: totalItems,
        totalQuantity,
        todayEntries,
        thisMonthEntries,
        receivedCount,
        pendingCount,
      },
      filterOptions: {
        transporters,
        salesPersons,
      },
    };
  }

  async createOutwardRegisterEntry(userId: string, dto: any) {
    if (!dto.outwardDate || !dto.transporterName || !dto.material || !dto.partyName) {
      throw new BadRequestException('Date, Transporter Name, Material, and Party Name are required.');
    }

    const quantityNum = Number(dto.quantity) || 0;

    return (this.prisma as any).outwardRegisterEntry.create({
      data: {
        outwardDate: new Date(dto.outwardDate),
        transporterName: String(dto.transporterName).trim(),
        vehicleNo: dto.vehicleNo ? String(dto.vehicleNo).trim() : null,
        material: String(dto.material).trim(),
        quantity: quantityNum.toFixed(3),
        partyName: String(dto.partyName).trim(),
        salesPerson: dto.salesPerson ? String(dto.salesPerson).trim() : null,
        invoiceNo: dto.invoiceNo ? String(dto.invoiceNo).trim() : null,
        receivingManually: dto.receivingManually ? String(dto.receivingManually).trim() : null,
        remark: dto.remark ? String(dto.remark).trim() : null,
        isArchived: false,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async updateOutwardRegisterEntry(id: string, userId: string, dto: any) {
    const existing = await (this.prisma as any).outwardRegisterEntry.findFirst({
      where: { id, isArchived: false },
    });
    if (!existing) {
      throw new NotFoundException('Outward Register Entry not found');
    }

    const quantityNum = dto.quantity !== undefined ? Number(dto.quantity) : Number(existing.quantity);

    return (this.prisma as any).outwardRegisterEntry.update({
      where: { id },
      data: {
        outwardDate: dto.outwardDate ? new Date(dto.outwardDate) : existing.outwardDate,
        transporterName: dto.transporterName ? String(dto.transporterName).trim() : existing.transporterName,
        vehicleNo: dto.vehicleNo !== undefined ? (dto.vehicleNo ? String(dto.vehicleNo).trim() : null) : existing.vehicleNo,
        material: dto.material ? String(dto.material).trim() : existing.material,
        quantity: quantityNum.toFixed(3),
        partyName: dto.partyName ? String(dto.partyName).trim() : existing.partyName,
        salesPerson: dto.salesPerson !== undefined ? (dto.salesPerson ? String(dto.salesPerson).trim() : null) : existing.salesPerson,
        invoiceNo: dto.invoiceNo !== undefined ? (dto.invoiceNo ? String(dto.invoiceNo).trim() : null) : existing.invoiceNo,
        receivingManually: dto.receivingManually !== undefined ? (dto.receivingManually ? String(dto.receivingManually).trim() : null) : existing.receivingManually,
        remark: dto.remark !== undefined ? (dto.remark ? String(dto.remark).trim() : null) : existing.remark,
        updatedById: userId,
      },
    });
  }

  async archiveOutwardRegisterEntry(id: string, userId: string) {
    const existing = await (this.prisma as any).outwardRegisterEntry.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Outward Register Entry not found');
    }

    return (this.prisma as any).outwardRegisterEntry.update({
      where: { id },
      data: {
        isArchived: true,
        updatedById: userId,
      },
    });
  }

  /**
   * AR — PAYMENT FOLLOW UPS MANUAL REGISTER
   *
   * Completely standalone manual tracking sheet for customer payment follow-ups.
   * Zero connection to Invoices, Finance, Ledger, AR, or automatic calculations.
   */

  async getPaymentFollowUpEntries(query: any) {
    const {
      search,
      salesPerson,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 25,
      exportAll = false,
    } = query;

    const where: any = {
      isArchived: false,
    };

    if (salesPerson && salesPerson !== 'ALL') {
      where.salesPerson = { contains: salesPerson, mode: 'insensitive' };
    }

    if (minAmount !== undefined && minAmount !== '') {
      where.duePaymentAmount = { ...(where.duePaymentAmount || {}), gte: Number(minAmount) };
    }
    if (maxAmount !== undefined && maxAmount !== '') {
      where.duePaymentAmount = { ...(where.duePaymentAmount || {}), lte: Number(maxAmount) };
    }

    if (search && String(search).trim()) {
      const term = String(search).trim();
      where.AND = [
        {
          OR: [
            { partyName: { contains: term, mode: 'insensitive' } },
            { salesPerson: { contains: term, mode: 'insensitive' } },
            { remarks: { contains: term, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const validSortFields = ['partyName', 'duePaymentAmount', 'salesPerson', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const allMatches = await (this.prisma as any).paymentFollowUpEntry.findMany({
      where,
      orderBy: [
        { [orderField]: orderDirection },
        { id: 'desc' },
      ],
    });

    let totalDuePaymentAmount = 0;
    for (const item of allMatches) {
      const amt = Number(item.duePaymentAmount) || 0;
      totalDuePaymentAmount = Number((totalDuePaymentAmount + amt).toFixed(2));
    }

    const totalItems = allMatches.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 25);
    const isExport = exportAll === true || exportAll === 'true' || limit === 'all' || Number(limit) === -1;

    const pagedRecords = isExport
      ? allMatches
      : allMatches.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const startIndex = (pageNum - 1) * limitNum;
    const mappedItems = pagedRecords.map((r: any, idx: number) => ({
      srNo: isExport ? idx + 1 : startIndex + idx + 1,
      id: r.id,
      partyName: r.partyName,
      duePaymentAmount: Number(r.duePaymentAmount) || 0,
      salesPerson: r.salesPerson || '—',
      remarks: r.remarks || '',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const allActive = await (this.prisma as any).paymentFollowUpEntry.findMany({
      where: { isArchived: false },
      select: { salesPerson: true },
    });
    const salesPersons = Array.from(new Set(allActive.map((r: any) => r.salesPerson).filter(Boolean))).sort();

    return {
      items: mappedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      totals: {
        totalFollowUps: totalItems,
        totalDuePaymentAmount,
      },
      filterOptions: {
        salesPersons,
      },
    };
  }

  async createPaymentFollowUpEntry(userId: string, dto: any) {
    if (!dto.partyName || dto.duePaymentAmount === undefined || dto.duePaymentAmount === '') {
      throw new BadRequestException('Party Name and Due Payment Amount are required.');
    }

    const amountNum = Number(dto.duePaymentAmount) || 0;

    return (this.prisma as any).paymentFollowUpEntry.create({
      data: {
        partyName: String(dto.partyName).trim(),
        duePaymentAmount: amountNum.toFixed(2),
        salesPerson: dto.salesPerson ? String(dto.salesPerson).trim() : null,
        remarks: dto.remarks ? String(dto.remarks).trim() : null,
        isArchived: false,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async updatePaymentFollowUpEntry(id: string, userId: string, dto: any) {
    const existing = await (this.prisma as any).paymentFollowUpEntry.findFirst({
      where: { id, isArchived: false },
    });
    if (!existing) {
      throw new NotFoundException('Payment Follow Up Entry not found');
    }

    const amountNum = dto.duePaymentAmount !== undefined ? Number(dto.duePaymentAmount) : Number(existing.duePaymentAmount);

    return (this.prisma as any).paymentFollowUpEntry.update({
      where: { id },
      data: {
        partyName: dto.partyName ? String(dto.partyName).trim() : existing.partyName,
        duePaymentAmount: amountNum.toFixed(2),
        salesPerson: dto.salesPerson !== undefined ? (dto.salesPerson ? String(dto.salesPerson).trim() : null) : existing.salesPerson,
        remarks: dto.remarks !== undefined ? (dto.remarks ? String(dto.remarks).trim() : null) : existing.remarks,
        updatedById: userId,
      },
    });
  }

  async archivePaymentFollowUpEntry(id: string, userId: string) {
    const existing = await (this.prisma as any).paymentFollowUpEntry.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Payment Follow Up Entry not found');
    }

    return (this.prisma as any).paymentFollowUpEntry.update({
      where: { id },
      data: {
        isArchived: true,
        updatedById: userId,
      },
    });
  }
}




