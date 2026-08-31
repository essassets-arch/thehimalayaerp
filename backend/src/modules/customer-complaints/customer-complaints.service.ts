import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComplaintStatus, Prisma, SalesOrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import {
  CreateCustomerComplaintDto,
  CustomerComplaintItemDto,
} from './dto/create-customer-complaint.dto';
import {
  getComplaintSalesScope,
  getOrderSalesScope,
  isSalespersonScopedRole,
} from '../../common/utils/rbac.util';

const includeRelations = {
  customer: {
    select: {
      id: true,
      companyName: true,
      customerCode: true,
      email: true,
      phone: true,
    },
  },
  product: {
    select: { id: true, name: true, sku: true, publicId: true },
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      orderDate: true,
      totalAmount: true,
      status: true,
      salesExecutiveId: true,
      createdById: true,
      quotationId: true,
      items: {
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          productCodeSnapshot: true,
          orderedQuantity: true,
          unit: true,
          unitPrice: true,
          lineTotal: true,
          product: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
    },
  },
  items: {
    include: {
      product: {
        select: { id: true, name: true, sku: true, publicId: true },
      },
      orderItem: {
        select: {
          id: true,
          productNameSnapshot: true,
          orderedQuantity: true,
          unit: true,
          unitPrice: true,
        },
      },
    },
  },
  salesExecutive: {
    select: { id: true, name: true, email: true },
  },
  lossRecord: true,
} satisfies Prisma.CustomerComplaintInclude;

@Injectable()
export class CustomerComplaintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
  ) {}

  async get(id: string) {
    const complaint = await this.prisma.customerComplaint.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  /**
   * Helper endpoint returning customer list & their orders (scoped to salesperson)
   * used to populate Create Complaint modal cleanly.
   */
  async getMetaOrdersAndCustomers(userId: string, role?: string) {
    const orderScope = getOrderSalesScope(userId, role);

    const orders = await this.prisma.salesOrder.findMany({
      where: {
        ...orderScope,
        status: {
          notIn: [SalesOrderStatus.DRAFT, SalesOrderStatus.CANCELLED],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            customerCode: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, publicId: true },
            },
          },
        },
        salesExecutive: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customersMap = new Map<string, any>();
    orders.forEach((o) => {
      if (o.customer && !customersMap.has(o.customer.id)) {
        customersMap.set(o.customer.id, o.customer);
      }
    });

    return {
      customers: Array.from(customersMap.values()),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        orderNo: o.orderNumber,
        orderDate: o.orderDate,
        totalAmount: Number(o.totalAmount || 0),
        status: o.status,
        customerId: o.customerId,
        customerName: o.customer?.companyName || '—',
        salesPersonName: o.salesExecutive?.name || 'Salesperson',
        items: o.items.map((item) => ({
          id: item.id,
          orderItemId: item.id,
          productId: item.productId,
          productName:
            item.productNameSnapshot || item.product?.name || 'Product',
          sku: item.productCodeSnapshot || item.product?.sku || '',
          orderedQuantity: Number(item.orderedQuantity || 0),
          deliveredQuantity: Number(item.orderedQuantity || 0),
          unit: item.unit || 'Units',
          unitPrice: Number(item.unitPrice || 0),
        })),
      })),
    };
  }

  async create(dto: CreateCustomerComplaintDto, userId: string, role?: string) {
    if (!dto.customerId) {
      throw new BadRequestException('Customer is required');
    }
    if (!dto.orderId) {
      throw new BadRequestException('Order is required');
    }

    // 1. Validate Order exists and belongs to salesperson if scoped
    const orderScope = getOrderSalesScope(userId, role);
    const order = await this.prisma.salesOrder.findFirst({
      where: {
        id: dto.orderId,
        ...orderScope,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!order) {
      throw new BadRequestException(
        'Selected order was not found or does not belong to your account',
      );
    }

    // 2. Validate Customer belongs to Order
    if (order.customerId !== dto.customerId) {
      throw new BadRequestException(
        'Selected customer does not match the order customer',
      );
    }

    // 3. Validate Complaint Products
    const itemsDto = dto.items || [];
    if (itemsDto.length === 0 && !dto.productId) {
      throw new BadRequestException(
        'At least one product must be selected for the complaint',
      );
    }

    const orderProductIds = new Set(order.items.map((i) => i.productId));
    const orderItemIds = new Set(order.items.map((i) => i.id));

    for (const item of itemsDto) {
      if (!orderProductIds.has(item.productId)) {
        throw new BadRequestException(
          `Product ${item.productId} does not belong to the selected order`,
        );
      }
      if (item.orderItemId && !orderItemIds.has(item.orderItemId)) {
        throw new BadRequestException(
          `Order item ${item.orderItemId} does not belong to the selected order`,
        );
      }
      if (Number(item.complaintQuantity || 0) <= 0) {
        throw new BadRequestException(
          'Complaint quantity must be greater than 0',
        );
      }
    }

    const primaryProductId =
      itemsDto.length > 0 ? itemsDto[0].productId : dto.productId || null;

    const isDraft =
      String(dto.status || '').toUpperCase() === 'DRAFT' ||
      dto.status === ComplaintStatus.DRAFT;

    const status = isDraft
      ? ComplaintStatus.DRAFT
      : ComplaintStatus.PENDING_PLANT_HEAD;

    return this.prisma.$transaction(async (tx) => {
      const complaintNo =
        await this.sequenceService.generateCustomerComplaintNumber(
          new Date(dto.complaintDate || new Date()),
          tx,
        );

      const complaint = await tx.customerComplaint.create({
        data: {
          complaintNo,
          customerId: dto.customerId,
          orderId: dto.orderId,
          productId: primaryProductId,
          complaintType: dto.complaintType,
          priority: dto.priority || 'Medium',
          complaintDate: new Date(dto.complaintDate || new Date()),
          subject: dto.subject,
          description: dto.description,
          salesRemarks: dto.salesRemarks,
          attachment: dto.attachment,
          status,
          submittedBy: isDraft ? null : userId,
          submittedAt: isDraft ? null : new Date(),
          createdBy: userId,
          salesExecutiveId: order.salesExecutiveId || userId,
          items: {
            create: itemsDto.map((item) => ({
              orderItemId: item.orderItemId,
              productId: item.productId,
              orderedQuantity: item.orderedQuantity ?? 0,
              deliveredQuantity:
                item.deliveredQuantity ?? item.orderedQuantity ?? 0,
              complaintQuantity: item.complaintQuantity,
            })),
          },
        },
        include: includeRelations,
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: isDraft ? 'COMPLAINT_DRAFT_CREATED' : 'COMPLAINT_SUBMITTED',
          entityType: 'CustomerComplaint',
          entityId: complaint.id,
          after: {
            complaintNo: complaint.complaintNo,
            orderId: dto.orderId,
            status,
          },
        },
      });

      return complaint;
    });
  }

  async listSales(userId: string, role?: string, query: any = {}) {
    const scope = getComplaintSalesScope(userId, role);
    const where: Prisma.CustomerComplaintWhereInput = {
      ...scope,
    };

    if (query.status && query.status !== 'ALL') {
      const st = String(query.status).toUpperCase();
      if (st === 'SUBMITTED' || st === 'PENDING') {
        where.status = {
          in: [
            ComplaintStatus.PENDING_PLANT_HEAD,
            ComplaintStatus.PENDING_SUPER_ADMIN,
            ComplaintStatus.SUBMITTED,
          ],
        };
      } else {
        where.status = st as any;
      }
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.orderId) {
      where.orderId = query.orderId;
    }
    if (query.complaintType) {
      where.complaintType = query.complaintType;
    }
    if (query.priority) {
      where.priority = { equals: query.priority, mode: 'insensitive' };
    }

    if (query.search) {
      const q = String(query.search).trim();
      where.OR = [
        { complaintNo: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { customer: { companyName: { contains: q, mode: 'insensitive' } } },
        { order: { orderNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.customerComplaint.findMany({
      where,
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
    ) {
      throw new BadRequestException(
        'Only draft or rejected complaints can be edited',
      );
    }

    const itemsDto = dto.items || [];
    const isSubmit =
      dto.status === 'SUBMIT' ||
      dto.status === 'PENDING_PLANT_HEAD' ||
      dto.status === 'SUBMITTED';

    const newStatus = isSubmit
      ? ComplaintStatus.PENDING_PLANT_HEAD
      : existing.status === ComplaintStatus.DRAFT
        ? ComplaintStatus.DRAFT
        : ComplaintStatus.REJECTED;

    return this.prisma.$transaction(async (tx) => {
      // Re-create items if provided
      if (itemsDto.length > 0) {
        await tx.customerComplaintItem.deleteMany({
          where: { complaintId: id },
        });
      }

      const updated = await tx.customerComplaint.update({
        where: { id },
        data: {
          customerId: dto.customerId || existing.customerId,
          orderId: dto.orderId || existing.orderId,
          productId:
            itemsDto.length > 0
              ? itemsDto[0].productId
              : dto.productId || existing.productId,
          complaintType: dto.complaintType || existing.complaintType,
          priority: dto.priority || existing.priority,
          complaintDate: dto.complaintDate
            ? new Date(dto.complaintDate)
            : existing.complaintDate,
          subject: dto.subject || existing.subject,
          description: dto.description || existing.description,
          salesRemarks:
            dto.salesRemarks !== undefined
              ? dto.salesRemarks
              : existing.salesRemarks,
          attachment:
            dto.attachment !== undefined
              ? dto.attachment
              : existing.attachment,
          status: newStatus,
          updatedBy: userId,
          ...(isSubmit
            ? {
                submittedBy: userId,
                submittedAt: new Date(),
                rejectedBy: null,
                rejectedAt: null,
              }
            : {}),
          ...(itemsDto.length > 0
            ? {
                items: {
                  create: itemsDto.map((item) => ({
                    orderItemId: item.orderItemId,
                    productId: item.productId,
                    orderedQuantity: item.orderedQuantity ?? 0,
                    deliveredQuantity:
                      item.deliveredQuantity ?? item.orderedQuantity ?? 0,
                    complaintQuantity: item.complaintQuantity,
                  })),
                },
              }
            : {}),
        },
        include: includeRelations,
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: isSubmit ? 'COMPLAINT_SUBMITTED' : 'COMPLAINT_UPDATED',
          entityType: 'CustomerComplaint',
          entityId: id,
          after: { complaintNo: updated.complaintNo, status: newStatus },
        },
      });

      return updated;
    });
  }

  async removeSales(id: string, userId: string, role?: string) {
    const c = await this.findSales(id, userId, role);
    if (c.status !== ComplaintStatus.DRAFT) {
      throw new BadRequestException('Only drafts can be deleted');
    }
    await this.prisma.customerComplaint.delete({ where: { id } });
    return { id, message: 'Draft complaint deleted' };
  }

  async resubmit(id: string, userId: string, role?: string) {
    const c = await this.findSales(id, userId, role);
    if (c.status !== ComplaintStatus.REJECTED) {
      throw new BadRequestException(
        'Only rejected complaints can be resubmitted',
      );
    }
    return this.prisma.customerComplaint.update({
      where: { id },
      data: {
        status: ComplaintStatus.PENDING_PLANT_HEAD,
        submittedBy: userId,
        submittedAt: new Date(),
        updatedBy: userId,
        rejectedBy: null,
        rejectedAt: null,
      },
      include: includeRelations,
    });
  }

  async listPlantHead(query: any = {}) {
    const where: Prisma.CustomerComplaintWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      const st = String(query.status).toUpperCase();
      if (st === 'PENDING' || st === 'PENDING_PLANT_HEAD') {
        where.status = {
          in: [
            ComplaintStatus.PENDING_PLANT_HEAD,
            ComplaintStatus.PENDING_SUPER_ADMIN,
            ComplaintStatus.SUBMITTED,
          ],
        };
      } else {
        where.status = st as any;
      }
    }

    if (query.search) {
      const q = String(query.search).trim();
      where.OR = [
        { complaintNo: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { customer: { companyName: { contains: q, mode: 'insensitive' } } },
        { order: { orderNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.customerComplaint.findMany({
      where,
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPlantHead(id: string) {
    return this.get(id);
  }

  /**
   * Plant Head APPROVE Transaction:
   * 1. Validate complaint is pending
   * 2. Invariant Check: Verify Order is not already LOST / CANCELLED_LOSS
   * 3. Update CustomerComplaint -> APPROVED
   * 4. Update SalesOrder -> LOST (lostReason, lostAt, lostComplaintId)
   * 5. Create SalesOrderLoss record
   * 6. Update linked Quotation -> LOST
   * 7. Update linked Lead -> LOST
   * 8. Create AuditLog records
   */
  async approve(id: string, userId: string, adminRemarks?: string) {
    return this.prisma.$transaction(async (tx) => {
      const c = await tx.customerComplaint.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              quotation: {
                include: {
                  lead: true,
                },
              },
            },
          },
          lossRecord: true,
        },
      });

      if (!c) {
        throw new NotFoundException('Complaint not found');
      }

      const isPending =
        c.status === ComplaintStatus.PENDING_PLANT_HEAD ||
        c.status === ComplaintStatus.PENDING_SUPER_ADMIN ||
        c.status === ComplaintStatus.SUBMITTED;

      if (!isPending) {
        throw new BadRequestException(
          'Only pending complaints can be approved',
        );
      }

      if (!c.order) {
        throw new BadRequestException(
          'Complaint must be linked to a valid Sales Order to be approved',
        );
      }

      // CRITICAL INVARIANT: Order can transition to LOST only once!
      if (
        c.order.status === SalesOrderStatus.LOST ||
        c.lossRecord ||
        (await tx.salesOrderLoss.findUnique({
          where: { salesOrderId: c.order.id },
        }))
      ) {
        throw new BadRequestException(
          'ORDER_ALREADY_LOST: This order is already marked as Lost and cannot be deducted again.',
        );
      }

      const now = new Date();
      const orderValue = Number(c.order.totalAmount || 0);

      // 1. Update Complaint status -> APPROVED
      const approvedComplaint = await tx.customerComplaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.APPROVED,
          approvedBy: userId,
          approvedAt: now,
          plantHeadDecisionAt: now,
          adminRemarks: adminRemarks ?? c.adminRemarks,
          updatedBy: userId,
        },
        include: includeRelations,
      });

      // 2. Update Order status -> LOST
      await tx.salesOrder.update({
        where: { id: c.order.id },
        data: {
          status: SalesOrderStatus.LOST,
          lostReason: c.complaintType,
          lostAt: now,
          lostComplaintId: c.id,
          updatedById: userId,
        },
      });

      // 3. Create SalesOrderLoss record
      const lossRecord = await tx.salesOrderLoss.create({
        data: {
          salesOrderId: c.order.id,
          complaintId: c.id,
          salesExecutiveId:
            c.order.salesExecutiveId ||
            c.order.createdById ||
            c.salesExecutiveId,
          customerId: c.customerId,
          orderValue: orderValue,
          lostValue: orderValue,
          reason: c.complaintType,
          remarks: adminRemarks || `Customer Complaint ${c.complaintNo} Approved by Plant Head`,
          lostDate: now,
          createdById: userId,
        },
      });

      // 4. Update linked Quotation -> LOST
      if (c.order.quotationId) {
        await tx.quotation.update({
          where: { id: c.order.quotationId },
          data: {
            lostReason: c.complaintType,
            lostAt: now,
            lostComplaintId: c.id,
            updatedById: userId,
          },
        });
      }

      // 5. Update linked Lead -> LOST
      const leadId = c.order.quotation?.leadId;
      if (leadId) {
        await tx.lead.update({
          where: { id: leadId },
          data: {
            lostReason: 'Customer Complaint',
            lostAt: now,
            lostComplaintId: c.id,
            updatedById: userId,
          },
        });
      }

      // 6. Record Audit Trail
      await tx.auditLog.createMany({
        data: [
          {
            actorUserId: userId,
            action: 'COMPLAINT_APPROVED_PLANT_HEAD',
            entityType: 'CustomerComplaint',
            entityId: c.id,
            after: {
              complaintNo: c.complaintNo,
              status: 'APPROVED',
              orderNumber: c.order.orderNumber,
              lostValue: orderValue,
            },
          },
          {
            actorUserId: userId,
            action: 'ORDER_MARKED_LOST',
            entityType: 'SalesOrder',
            entityId: c.order.id,
            after: {
              orderNumber: c.order.orderNumber,
              status: 'LOST',
              lostValue: orderValue,
              complaintNo: c.complaintNo,
            },
          },
          {
            actorUserId: userId,
            action: 'SALES_LOSS_RECORDED',
            entityType: 'SalesOrderLoss',
            entityId: lossRecord.id,
            after: {
              orderId: c.order.id,
              complaintId: c.id,
              lostValue: orderValue,
              salesExecutiveId: lossRecord.salesExecutiveId,
            },
          },
        ],
      });

      return {
        ...approvedComplaint,
        lossRecord,
      };
    });
  }

  async reject(
    id: string,
    userId: string,
    rejectionReason: string,
    adminRemarks?: string,
  ) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }

    const c = await this.get(id);
    const isPending =
      c.status === ComplaintStatus.PENDING_PLANT_HEAD ||
      c.status === ComplaintStatus.PENDING_SUPER_ADMIN ||
      c.status === ComplaintStatus.SUBMITTED;

    if (!isPending) {
      throw new BadRequestException(
        'Only pending complaints can be rejected',
      );
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.customerComplaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.REJECTED,
          rejectedBy: userId,
          rejectedAt: now,
          plantHeadDecisionAt: now,
          rejectionReason,
          adminRemarks: adminRemarks || rejectionReason,
          updatedBy: userId,
        },
        include: includeRelations,
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'COMPLAINT_REJECTED_PLANT_HEAD',
          entityType: 'CustomerComplaint',
          entityId: id,
          after: {
            complaintNo: c.complaintNo,
            status: 'REJECTED',
            rejectionReason,
          },
        },
      });

      return updated;
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

