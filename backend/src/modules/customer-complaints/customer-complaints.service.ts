import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComplaintStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerComplaintDto } from './dto/create-customer-complaint.dto';

const includeRelations = {
  customer: { select: { id: true, companyName: true, customerCode: true } },
  product: { select: { id: true, name: true, sku: true } },
} satisfies Prisma.CustomerComplaintInclude;

@Injectable()
export class CustomerComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  private async get(id: string) {
    const complaint = await this.prisma.customerComplaint.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  private async number() {
    const count = await this.prisma.customerComplaint.count();
    const year = new Date().getFullYear();
    let num = `CMP-${year}-${String(count + 1).padStart(4, '0')}`;
    const existing = await this.prisma.customerComplaint.findUnique({
      where: { complaintNo: num },
    });
    if (existing) {
      num = `CMP-${year}-${String(count + 1).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
    }
    return num;
  }

  async create(dto: CreateCustomerComplaintDto, userId: string) {
    const [customer, product] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
      this.prisma.product.findUnique({ where: { id: dto.productId } }),
    ]);
    if (!customer) throw new NotFoundException('Customer not found');
    if (!product) throw new NotFoundException('Product not found');
    const status =
      dto.status === 'DRAFT'
        ? ComplaintStatus.DRAFT
        : ComplaintStatus.PENDING_SUPER_ADMIN;
    const now = new Date();
    return this.prisma.customerComplaint.create({
      data: {
        complaintNo: await this.number(),
        customerId: dto.customerId,
        productId: dto.productId,
        complaintType: dto.complaintType,
        priority: dto.priority,
        complaintDate: new Date(dto.complaintDate),
        subject: dto.subject,
        description: dto.description,
        salesRemarks: dto.salesRemarks,
        attachment: dto.attachment,
        status,
        createdBy: userId,
        updatedBy: userId,
        ...(status === ComplaintStatus.PENDING_SUPER_ADMIN
          ? { submittedBy: userId, submittedAt: now }
          : {}),
      },
      include: includeRelations,
    });
  }

  async listSales(userId: string) {
    return this.prisma.customerComplaint.findMany({
      where: { createdBy: userId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }
  async findSales(id: string, userId: string) {
    const c = await this.get(id);
    if (c.createdBy !== userId) throw new ForbiddenException();
    return c;
  }

  async updateSales(
    id: string,
    dto: CreateCustomerComplaintDto,
    userId: string,
  ) {
    const existing = await this.findSales(id, userId);
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
  async removeSales(id: string, userId: string) {
    const c = await this.findSales(id, userId);
    if (c.status !== ComplaintStatus.DRAFT)
      throw new BadRequestException('Only drafts can be deleted');
    await this.prisma.customerComplaint.delete({ where: { id } });
    return { id };
  }
  async resubmit(id: string, userId: string) {
    const c = await this.findSales(id, userId);
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
