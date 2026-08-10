import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComplaintStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerComplaintDto } from './dto/create-customer-complaint.dto';
import { getComplaintSalesScope, isSalespersonScopedRole } from '../../common/utils/rbac.util';

const includeRelations = {
  customer: { select: { id: true, companyName: true, customerCode: true } },
  product: { select: { id: true, name: true, sku: true } },
} satisfies Prisma.CustomerComplaintInclude;

@Injectable()
export class CustomerComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    const complaint = await this.prisma.customerComplaint.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  private async number() {
    const count = await this.prisma.customerComplaint.count();
    let num = `CMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const existing = await this.prisma.customerComplaint.findUnique({
      where: { complaintNo: num },
    });
    if (existing) {
      num = `CMP-${new Date().getFullYear()}-${String(count + 2).padStart(4, '0')}`;
    }
    return num;
  }

  async create(dto: CreateCustomerComplaintDto, userId: string) {
    const status =
      dto.status === 'DRAFT'
        ? ComplaintStatus.DRAFT
        : ComplaintStatus.PENDING_SUPER_ADMIN;

    return this.prisma.customerComplaint.create({
      data: {
        complaintNo: await this.number(),
        customerId: dto.customerId,
        productId: dto.productId,
        complaintType: dto.complaintType,
        priority: (dto.priority as any) || 'MEDIUM',
        complaintDate: new Date(dto.complaintDate),
        subject: dto.subject,
        description: dto.description,
        salesRemarks: dto.salesRemarks,
        attachment: dto.attachment,
        status,
        submittedBy: userId,
        createdBy: userId,
        salesExecutiveId: userId,
        ...(status === ComplaintStatus.PENDING_SUPER_ADMIN
          ? { submittedAt: new Date() }
          : {}),
      },
      include: includeRelations,
    });
  }

  async listSales(userId: string, role?: string) {
    const scope = getComplaintSalesScope(userId, role);
    return this.prisma.customerComplaint.findMany({
      where: scope,
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSales(id: string, userId: string, role?: string) {
    const scope = getComplaintSalesScope(userId, role);
    const c = await this.prisma.customerComplaint.findFirst({
      where: { id, ...scope },
      include: includeRelations,
    });
    if (!c) {
      throw new NotFoundException('Complaint not found');
    }
    return c;
  }

  async updateSales(
    id: string,
    dto: CreateCustomerComplaintDto,
    userId: string,
    role?: string,
  ) {
    const existing = await this.findSales(id, userId, role);
    if (
      existing.status !== ComplaintStatus.DRAFT &&
      existing.status !== ComplaintStatus.REJECTED
    )
      throw new BadRequestException(
        'Only draft or rejected complaints can be edited',
      );
    return this.prisma.customerComplaint.update({
      where: { id },
      data: {
        ...dto,
        complaintDate: new Date(dto.complaintDate),
        status:
          existing.status === ComplaintStatus.DRAFT
            ? ComplaintStatus.DRAFT
            : ComplaintStatus.REJECTED,
        updatedBy: userId,
      },
      include: includeRelations,
    });
  }
  async removeSales(id: string, userId: string, role?: string) {
    const c = await this.findSales(id, userId, role);
    if (c.status !== ComplaintStatus.DRAFT)
      throw new BadRequestException('Only drafts can be deleted');
    await this.prisma.customerComplaint.delete({ where: { id } });
    return { id };
  }
  async resubmit(id: string, userId: string, role?: string) {
    const c = await this.findSales(id, userId, role);
    if (c.status !== ComplaintStatus.REJECTED)
      throw new BadRequestException(
        'Only rejected complaints can be resubmitted',
      );
    return this.prisma.customerComplaint.update({
      where: { id },
      data: {
        status: ComplaintStatus.PENDING_SUPER_ADMIN,
        submittedBy: userId,
        submittedAt: new Date(),
        updatedBy: userId,
        rejectedBy: null,
        rejectedAt: null,
      },
      include: includeRelations,
    });
  }

  async listAdmin() {
    return this.prisma.customerComplaint.findMany({
      where: {
        status: {
          in: [
            ComplaintStatus.PENDING_SUPER_ADMIN,
            ComplaintStatus.APPROVED,
            ComplaintStatus.REJECTED,
          ],
        },
      },
      include: includeRelations,
      orderBy: { submittedAt: 'desc' },
    });
  }
  async findAdmin(id: string) {
    return this.get(id);
  }
  async approve(id: string, userId: string, adminRemarks?: string) {
    const c = await this.get(id);
    if (c.status !== ComplaintStatus.PENDING_SUPER_ADMIN)
      throw new BadRequestException('Only pending complaints can be approved');
    return this.prisma.customerComplaint.update({
      where: { id },
      data: {
        status: ComplaintStatus.APPROVED,
        approvedBy: userId,
        approvedAt: new Date(),
        adminRemarks: adminRemarks ?? c.adminRemarks,
        updatedBy: userId,
      },
      include: includeRelations,
    });
  }
  async reject(id: string, userId: string, adminRemarks: string) {
    const c = await this.get(id);
    if (c.status !== ComplaintStatus.PENDING_SUPER_ADMIN)
      throw new BadRequestException('Only pending complaints can be rejected');
    return this.prisma.customerComplaint.update({
      where: { id },
      data: {
        status: ComplaintStatus.REJECTED,
        rejectedBy: userId,
        rejectedAt: new Date(),
        adminRemarks,
        updatedBy: userId,
      },
      include: includeRelations,
    });
  }
  async remarks(id: string, userId: string, adminRemarks: string) {
    await this.get(id);
    return this.prisma.customerComplaint.update({
      where: { id },
      data: { adminRemarks, updatedBy: userId },
      include: includeRelations,
    });
  }
}
