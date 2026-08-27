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
      { code: 'backoffice.report.create', name: 'Create Back Office Daily Report' },
      { code: 'backoffice.report.read', name: 'View Back Office Daily Report' },
      { code: 'backoffice.report.manage', name: 'Manage Back Office Daily Report' },
      { code: 'profile.read', name: 'View Profile' },
    ];

    for (const p of permissions) {
      let perm = await this.prisma.permission.findUnique({ where: { code: p.code } });
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
          roleId_permissionId: { roleId: superAdminRole.id, permissionId: reviewPerm.id },
        },
      });
      if (!rpAdmin) {
        await this.prisma.rolePermission.create({
          data: { roleId: superAdminRole.id, permissionId: reviewPerm.id },
        });
      }
    }

    const email = 'backoffice@himalayaerp.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          publicId: 'USR-BACKOFFICE-01',
          email,
          password: hashedPassword,
          name: 'Back Office Executive',
          roleId: role.id,
          companyId: company.id,
          isActive: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          roleId: role.id,
          password: hashedPassword,
          isActive: true,
        },
      });
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
      throw new ForbiddenException('Cannot edit report submitted by another user');
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
    if (dto.tasksCompleted !== undefined) dataToUpdate.tasksCompleted = dto.tasksCompleted;
    if (dto.issuesOrBlockers !== undefined) dataToUpdate.issuesOrBlockers = dto.issuesOrBlockers || null;
    if (dto.planForTomorrow !== undefined) dataToUpdate.planForTomorrow = dto.planForTomorrow || null;
    if (dto.workingHours !== undefined) dataToUpdate.workingHours = dto.workingHours;
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
      throw new ForbiddenException('Cannot delete report submitted by another user');
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
        adminRemarks: dto.adminRemarks !== undefined ? dto.adminRemarks : existing.adminRemarks,
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
}
