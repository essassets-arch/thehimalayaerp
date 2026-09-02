import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateComplaintDto,
  UpdateComplaintStatusDto,
  ComplaintQueryDto,
} from './dto/complaint.dto';
import { EmployeeComplaintPriority, EmployeeComplaintStatus } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async resolveCompanyId(
    userId: string,
    companyId?: string,
  ): Promise<string> {
    if (companyId) return companyId;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return user?.companyId || '';
  }

  async createComplaint(
    userId: string,
    companyIdFromReq: string | undefined,
    dto: CreateComplaintDto,
  ) {
    if (!dto.subject?.trim() || !dto.description?.trim()) {
      throw new BadRequestException('Subject and description are required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Authenticated user profile not found.');
    }

    const companyId = user.companyId || (await this.resolveCompanyId(userId, companyIdFromReq));

    // Generate unique sequential ticket code
    const count = await this.prisma.employeeComplaint.count({
      where: { companyId },
    });
    const ticketCode = `CMP-${1001 + count}`;

    const complaint = await this.prisma.employeeComplaint.create({
      data: {
        publicId: randomUUID(),
        companyId,
        userId,
        employeeId: user.employee?.id || null,
        ticketCode,
        category: dto.category.trim(),
        subject: dto.subject.trim(),
        description: dto.description.trim(),
        priority: dto.priority || EmployeeComplaintPriority.MEDIUM,
        status: EmployeeComplaintStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { id: true, name: true, code: true } },
          },
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            jobTitle: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Notify HR / Admins
    try {
      await this.notificationsService.notifyRole({
        companyId,
        roles: ['HR', 'SUPER_ADMIN'],
        type: 'HR_COMPLAINT',
        module: 'HR',
        priority: 'HIGH',
        title: `New Workplace Complaint Filed ⚠️ (${ticketCode})`,
        message: `${user.name} (${user.role?.name || 'Staff'}) filed a complaint regarding "${dto.subject}".`,
        route: '/hr/complain-center',
      });
    } catch (notifErr) {
      // Non-blocking notification error
    }

    return complaint;
  }

  async getMyComplaints(userId: string, companyIdFromReq?: string) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);
    return this.prisma.employeeComplaint.findMany({
      where: {
        userId,
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        resolvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getHrComplaints(companyId: string, query: ComplaintQueryDto) {
    const page = Math.max(1, parseInt(String(query.page || 1), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || 50), 10)));
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { ticketCode: { contains: s, mode: 'insensitive' } },
        { subject: { contains: s, mode: 'insensitive' } },
        { category: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { user: { name: { contains: s, mode: 'insensitive' } } },
        { user: { email: { contains: s, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [items, total, pendingCount, inReviewCount, resolvedCount, rejectedCount] =
      await Promise.all([
        this.prisma.employeeComplaint.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: { select: { id: true, name: true, code: true } },
              },
            },
            employee: {
              select: {
                id: true,
                employeeCode: true,
                jobTitle: true,
                phoneNumber: true,
                department: { select: { id: true, name: true } },
                workLocation: { select: { id: true, name: true } },
              },
            },
            resolvedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.employeeComplaint.count({ where }),
        this.prisma.employeeComplaint.count({
          where: { companyId, status: EmployeeComplaintStatus.PENDING },
        }),
        this.prisma.employeeComplaint.count({
          where: { companyId, status: EmployeeComplaintStatus.IN_REVIEW },
        }),
        this.prisma.employeeComplaint.count({
          where: { companyId, status: EmployeeComplaintStatus.RESOLVED },
        }),
        this.prisma.employeeComplaint.count({
          where: { companyId, status: EmployeeComplaintStatus.REJECTED },
        }),
      ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: pendingCount + inReviewCount + resolvedCount + rejectedCount,
        pending: pendingCount,
        inReview: inReviewCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
      },
    };
  }

  async updateComplaintStatus(
    id: string,
    companyId: string,
    resolverUserId: string,
    dto: UpdateComplaintStatusDto,
  ) {
    const existing = await this.prisma.employeeComplaint.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new NotFoundException('Complaint ticket not found.');
    }

    const updated = await this.prisma.employeeComplaint.update({
      where: { id },
      data: {
        status: dto.status,
        hrRemarks: dto.hrRemarks ? dto.hrRemarks.trim() : existing.hrRemarks,
        resolvedById: resolverUserId,
        resolvedAt:
          dto.status === EmployeeComplaintStatus.RESOLVED ||
          dto.status === EmployeeComplaintStatus.REJECTED
            ? new Date()
            : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        employee: { select: { id: true, employeeCode: true } },
        resolvedBy: { select: { id: true, name: true } },
      },
    });

    // Notify the complainant user
    try {
      await this.notificationsService.notifyUser({
        companyId,
        userId: existing.userId,
        type: 'HR_COMPLAINT_UPDATE',
        module: 'HR',
        priority: 'HIGH',
        title: `Complaint ${existing.ticketCode} Status: ${dto.status} 📋`,
        message: dto.hrRemarks
          ? `HR response: ${dto.hrRemarks}`
          : `Your complaint (${existing.ticketCode}) status has been updated to ${dto.status}.`,
        route: '/profile',
      });
    } catch (err) {
      // Non-blocking
    }

    return updated;
  }
}
