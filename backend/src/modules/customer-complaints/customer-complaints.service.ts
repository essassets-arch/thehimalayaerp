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
  AdminRemarksDto,
  CompleteDispatchDto,
  CreateCustomerComplaintDto,
  CustomerComplaintItemDto,
  RejectComplaintDto,
  ResolveFinanceDto,
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
      billingAddress: true,
      shippingAddress: true,
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
      paidAmount: true,
      outstandingAmount: true,
      paymentStatus: true,
      billingAddress: true,
      shippingAddress: true,
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
          taxRate: true,
          taxAmount: true,
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
          taxRate: true,
          taxAmount: true,
          lineTotal: true,
        },
      },
    },
  },
  salesExecutive: {
    select: { id: true, name: true, email: true },
  },
  lossRecord: true,
  financeAdjustment: true,
  attachments: {
    orderBy: { uploadedAt: 'asc' },
  },
  statusHistory: {
    orderBy: { createdAt: 'asc' },
  },
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

    const sortedCustomers = Array.from(customersMap.values()).sort((a, b) =>
      (a.companyName || '').localeCompare(b.companyName || ''),
    );

    return {
      customers: sortedCustomers,
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
    const orderItemsById = new Map(order.items.map((i) => [i.id, i]));
    const orderItemsByProduct = new Map(order.items.map((i) => [i.productId, i]));

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
      : ComplaintStatus.PLANT_HEAD_PENDING;

    // Calculate snapshot pricing and complaint value per product
    let totalComplaintCalc = 0;
    const mappedItems = itemsDto.map((item) => {
      const matched =
        (item.orderItemId && orderItemsById.get(item.orderItemId)) ||
        orderItemsByProduct.get(item.productId);
      const unitPrice = Number(matched?.unitPrice || 0);
      const qty = Number(item.complaintQuantity || 0);
      const complaintAmount = unitPrice * qty;
      totalComplaintCalc += complaintAmount;

      return {
        orderItemId: item.orderItemId || matched?.id || null,
        productId: item.productId,
        orderedQuantity: item.orderedQuantity ?? matched?.orderedQuantity ?? 0,
        deliveredQuantity:
          item.deliveredQuantity ?? item.orderedQuantity ?? matched?.orderedQuantity ?? 0,
        complaintQuantity: item.complaintQuantity,
        unitPrice,
        complaintAmount,
        productNameSnapshot: matched?.productNameSnapshot || null,
        productCodeSnapshot: matched?.productCodeSnapshot || null,
      };
    });

    const originalBill = Number(order.totalAmount || 0);

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
          originalBillAmount: originalBill,
          calculatedComplaintAmount: totalComplaintCalc,
          status,
          submittedBy: isDraft ? null : userId,
          submittedAt: isDraft ? null : new Date(),
          createdBy: userId,
          salesExecutiveId: order.salesExecutiveId || userId,
          items: {
            create: mappedItems,
          },
          ...(dto.attachment
            ? {
                attachments: {
                  create: {
                    fileUrl: dto.attachment,
                    category: 'SALES_EVIDENCE',
                    uploadedById: userId,
                  },
                },
              }
            : {}),
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: status,
              action: isDraft ? 'DRAFT_CREATED' : 'SUBMITTED_TO_PLANT_HEAD',
              actorId: userId,
              remarks: dto.salesRemarks || 'Customer complaint created',
            },
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
      if (
        st === 'SUBMITTED' ||
        st === 'PENDING' ||
        st === 'PLANT_HEAD_PENDING' ||
        st === 'PENDING_PLANT_HEAD'
      ) {
        where.status = {
          in: [
            ComplaintStatus.PLANT_HEAD_PENDING,
            ComplaintStatus.PENDING_PLANT_HEAD,
            ComplaintStatus.PENDING_SUPER_ADMIN,
            ComplaintStatus.SUBMITTED,
          ],
        };
      } else if (st === 'DISPATCH_PENDING' || st === 'PLANT_HEAD_APPROVED') {
        where.status = {
          in: [
            ComplaintStatus.DISPATCH_PENDING,
            ComplaintStatus.PLANT_HEAD_APPROVED,
          ],
        };
      } else if (st === 'FINANCE_PENDING' || st === 'DISPATCH_COMPLETED') {
        where.status = {
          in: [
            ComplaintStatus.FINANCE_PENDING,
            ComplaintStatus.DISPATCH_COMPLETED,
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
        'Only draft or rejected complaints can be modified by salesperson',
      );
    }

    const itemsDto = dto.items || [];
    const isSubmit =
      String(dto.status || '').toUpperCase() === 'SUBMIT' ||
      String(dto.status || '').toUpperCase() === 'PLANT_HEAD_PENDING' ||
      String(dto.status || '').toUpperCase() === 'SUBMITTED';

    const newStatus = isSubmit
      ? ComplaintStatus.PLANT_HEAD_PENDING
      : existing.status;

    return this.prisma.$transaction(async (tx) => {
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

      if (isSubmit) {
        await tx.complaintStatusHistory.create({
          data: {
            complaintId: id,
            fromStatus: existing.status,
            toStatus: newStatus,
            action: 'SUBMITTED_TO_PLANT_HEAD',
            actorId: userId,
            remarks: dto.salesRemarks || 'Complaint submitted to Plant Head',
          },
        });
      }

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
    const existing = await this.findSales(id, userId, role);
    if (existing.status !== ComplaintStatus.DRAFT) {
      throw new BadRequestException('Only draft complaints can be deleted');
    }
    await this.prisma.customerComplaint.delete({ where: { id } });
    return { success: true, message: 'Draft complaint removed' };
  }

  async resubmit(id: string, userId: string, role?: string) {
    const complaint = await this.findSales(id, userId, role);
    if (
      complaint.status !== ComplaintStatus.REJECTED &&
      complaint.status !== ComplaintStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Only rejected or draft complaints can be submitted',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.customerComplaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.PLANT_HEAD_PENDING,
          submittedBy: userId,
          submittedAt: new Date(),
          rejectedBy: null,
          rejectedAt: null,
          rejectionReason: null,
          updatedBy: userId,
        },
        include: includeRelations,
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          fromStatus: complaint.status,
          toStatus: ComplaintStatus.PLANT_HEAD_PENDING,
          action: 'SUBMITTED_TO_PLANT_HEAD',
          actorId: userId,
          remarks: 'Resubmitted to Plant Head for review',
        },
      });

      return updated;
    });
  }

  // ─── Plant Head Operations ───

  async listPlantHead(query: any = {}) {
    const where: Prisma.CustomerComplaintWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      const st = String(query.status).toUpperCase();
      if (
        st === 'PENDING' ||
        st === 'PENDING_PLANT_HEAD' ||
        st === 'PLANT_HEAD_PENDING'
      ) {
        where.status = {
          in: [
            ComplaintStatus.PLANT_HEAD_PENDING,
            ComplaintStatus.PENDING_PLANT_HEAD,
            ComplaintStatus.PENDING_SUPER_ADMIN,
            ComplaintStatus.SUBMITTED,
          ],
        };
      } else if (st === 'HISTORY') {
        where.status = {
          in: [
            ComplaintStatus.RESOLVED,
            ComplaintStatus.REJECTED,
            ComplaintStatus.CLOSED,
          ],
        };
      } else {
        where.status = st as any;
      }
    } else if (!query.status) {
      where.status = {
        in: [
          ComplaintStatus.PLANT_HEAD_PENDING,
          ComplaintStatus.PENDING_PLANT_HEAD,
          ComplaintStatus.PENDING_SUPER_ADMIN,
          ComplaintStatus.SUBMITTED,
        ],
      };
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
   * Plant Head APPROVE:
   * Transitions PLANT_HEAD_PENDING -> DISPATCH_PENDING.
   * Sends complaint to Dispatch for physical return/quality inspection.
   * NOTE: Does NOT mark SalesOrder as LOST!
   */
  async approve(id: string, userId: string, adminRemarks?: string) {
    return this.prisma.$transaction(async (tx) => {
      const c = await tx.customerComplaint.findUnique({
        where: { id },
        include: includeRelations,
      });

      if (!c) {
        throw new NotFoundException('Complaint not found');
      }

      const isPending =
        c.status === ComplaintStatus.PLANT_HEAD_PENDING ||
        c.status === ComplaintStatus.PENDING_PLANT_HEAD ||
        c.status === ComplaintStatus.PENDING_SUPER_ADMIN ||
        c.status === ComplaintStatus.SUBMITTED;

      if (!isPending) {
        throw new BadRequestException(
          'Only complaints pending Plant Head review can be approved',
        );
      }

      const now = new Date();

      // Update complaint status -> DISPATCH_PENDING
      const approvedComplaint = await tx.customerComplaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.DISPATCH_PENDING,
          approvedBy: userId,
          approvedAt: now,
          plantHeadDecisionAt: now,
          adminRemarks: adminRemarks ?? c.adminRemarks,
          updatedBy: userId,
        },
        include: includeRelations,
      });

      // Status history record
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          fromStatus: c.status,
          toStatus: ComplaintStatus.DISPATCH_PENDING,
          action: 'PLANT_HEAD_APPROVED',
          actorId: userId,
          remarks:
            adminRemarks ||
            'Approved by Plant Head and forwarded to Dispatch for verification',
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'COMPLAINT_APPROVED_PLANT_HEAD',
          entityType: 'CustomerComplaint',
          entityId: c.id,
          after: {
            complaintNo: c.complaintNo,
            status: 'DISPATCH_PENDING',
            approvedBy: userId,
          },
        },
      });

      return approvedComplaint;
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
      c.status === ComplaintStatus.PLANT_HEAD_PENDING ||
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

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          fromStatus: c.status,
          toStatus: ComplaintStatus.REJECTED,
          action: 'PLANT_HEAD_REJECTED',
          actorId: userId,
          remarks: rejectionReason,
        },
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

  // ─── Dispatch Operations ───

  async listDispatch(query: any = {}) {
    const where: Prisma.CustomerComplaintWhereInput = {};

    if (query.all === 'true' || query.all === true || query.status === 'ALL') {
      // Return all dispatch-relevant complaints without status restriction
    } else if (query.status) {
      const st = String(query.status).toUpperCase();
      if (st === 'PENDING' || st === 'DISPATCH_PENDING') {
        where.status = {
          in: [
            ComplaintStatus.DISPATCH_PENDING,
            ComplaintStatus.PLANT_HEAD_APPROVED,
          ],
        };
      } else {
        where.status = st as any;
      }
    } else {
      where.status = {
        in: [
          ComplaintStatus.DISPATCH_PENDING,
          ComplaintStatus.PLANT_HEAD_APPROVED,
        ],
      };
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

  async completeDispatch(
    id: string,
    userId: string,
    dto: CompleteDispatchDto,
  ) {
    const finalEvidence = (dto.evidenceUrl || dto.dispatchEvidence || '').trim();
    const finalRemarks = (dto.remarks || dto.dispatchRemarks || '').trim();

    if (!finalEvidence) {
      throw new BadRequestException(
        'Complaint completion evidence image is required from Dispatch',
      );
    }

    const complaint = await this.get(id);
    const isDispatchPending =
      complaint.status === ComplaintStatus.DISPATCH_PENDING ||
      complaint.status === ComplaintStatus.PLANT_HEAD_APPROVED;

    if (!isDispatchPending) {
      throw new BadRequestException(
        'Only complaints pending dispatch inspection can be marked done',
      );
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. Create DISPATCH_EVIDENCE attachment record
      await tx.complaintAttachment.create({
        data: {
          complaintId: id,
          fileUrl: finalEvidence,
          category: 'DISPATCH_EVIDENCE',
          uploadedById: userId,
          uploadedAt: now,
        },
      });

      // 2. Advance status to FINANCE_PENDING
      const updated = await tx.customerComplaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.FINANCE_PENDING,
          dispatchCompletedAt: now,
          dispatchCompletedBy: userId,
          dispatchRemarks:
            finalRemarks || 'Physical inspection and photo evidence captured',
          dispatchEvidence: finalEvidence,
          updatedBy: userId,
        },
        include: includeRelations,
      });

      // 3. Record status history
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          fromStatus: complaint.status,
          toStatus: ComplaintStatus.FINANCE_PENDING,
          action: 'DISPATCH_COMPLETED',
          actorId: userId,
          remarks:
            finalRemarks ||
            'Dispatch completed physical check and sent to Finance',
          metadata: {
            evidenceUrl: finalEvidence,
            dispatchCompletedAt: now,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'COMPLAINT_DISPATCH_COMPLETED',
          entityType: 'CustomerComplaint',
          entityId: id,
          after: {
            complaintNo: complaint.complaintNo,
            status: 'FINANCE_PENDING',
            evidenceUrl: dto.evidenceUrl,
          },
        },
      });

      return updated;
    });
  }

  // ─── Finance Operations ───

  async listFinance(query: any = {}) {
    const where: Prisma.CustomerComplaintWhereInput = {};

    if (query.all === 'true' || query.all === true || query.status === 'ALL') {
      // Return all finance-relevant complaints without status restriction
    } else if (query.status) {
      const st = String(query.status).toUpperCase();
      if (st === 'PENDING' || st === 'FINANCE_PENDING') {
        where.status = ComplaintStatus.FINANCE_PENDING;
      } else {
        where.status = st as any;
      }
    } else {
      where.status = ComplaintStatus.FINANCE_PENDING;
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

  /**
   * Finance RESOLVE Transaction:
   * 1. Validates complaint is in FINANCE_PENDING
   * 2. Validates approvedReturnAmount: 0 <= return <= originalOrderAmount
   * 3. Validates mandatory financeRemarks
   * 4. Idempotency Check: Guaranteed via complaintFinancialAdjustment uniqueness
   * 5. Creates ComplaintFinancialAdjustment (keeps SalesOrder.totalAmount permanently intact)
   * 6. Updates CustomerComplaint -> RESOLVED
   * 7. Records audit history
   */
  async resolveFinance(id: string, userId: string, dto: ResolveFinanceDto) {
    if (
      dto.approvedReturnAmount === undefined ||
      dto.approvedReturnAmount === null
    ) {
      throw new BadRequestException('Approved return amount is required');
    }
    const approvedReturnAmount = Number(dto.approvedReturnAmount);
    if (isNaN(approvedReturnAmount) || approvedReturnAmount < 0) {
      throw new BadRequestException(
        'Approved return amount must be a valid non-negative number',
      );
    }
    if (!dto.financeRemarks || !dto.financeRemarks.trim()) {
      throw new BadRequestException(
        'Return Reason / Finance Remarks is required',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const complaint = await tx.customerComplaint.findUnique({
        where: { id },
        include: {
          order: true,
          financeAdjustment: true,
        },
      });

      if (!complaint) {
        throw new NotFoundException('Complaint not found');
      }

      if (complaint.status !== ComplaintStatus.FINANCE_PENDING) {
        throw new BadRequestException(
          `Invalid status for finance resolution. Current status: ${complaint.status}. Expected: FINANCE_PENDING`,
        );
      }

      if (!complaint.order) {
        throw new BadRequestException(
          'Complaint is not linked to a valid Sales Order',
        );
      }

      // Idempotency guard: Prevent duplicate financial adjustment
      if (complaint.financeAdjustment) {
        throw new BadRequestException(
          `DUPLICATE_DEDUCTION_PREVENTED: Complaint ${complaint.complaintNo} has already been deducted via ${complaint.financeAdjustment.referenceNumber}`,
        );
      }

      const existingAdj = await tx.complaintFinancialAdjustment.findUnique({
        where: { complaintId: id },
      });
      if (existingAdj) {
        throw new BadRequestException(
          `DUPLICATE_DEDUCTION_PREVENTED: A financial adjustment already exists for complaint ${complaint.complaintNo}`,
        );
      }

      const originalOrderAmount = Number(complaint.order.totalAmount || 0);
      if (approvedReturnAmount > originalOrderAmount) {
        throw new BadRequestException(
          `Approved return amount (₹${approvedReturnAmount}) cannot exceed original order bill (₹${originalOrderAmount})`,
        );
      }

      const netOrderAmount = Math.max(
        0,
        originalOrderAmount - approvedReturnAmount,
      );
      const referenceNumber = `ADJ-${complaint.complaintNo.replace(/\//g, '-')}`;
      const now = new Date();

      // 1. Create ComplaintFinancialAdjustment (Permanent auditable record, original SalesOrder untouched!)
      const adjustment = await tx.complaintFinancialAdjustment.create({
        data: {
          complaintId: id,
          salesOrderId: complaint.order.id,
          customerId: complaint.customerId,
          salesExecutiveId:
            complaint.order.salesExecutiveId ||
            complaint.order.createdById ||
            complaint.salesExecutiveId,
          referenceNumber,
          originalOrderAmount,
          calculatedReturnAmount: Number(
            complaint.calculatedComplaintAmount || approvedReturnAmount,
          ),
          approvedReturnAmount,
          netOrderAmount,
          adjustmentType: 'RETURN_ADJUSTMENT',
          status: 'APPLIED',
          remarks: dto.financeRemarks.trim(),
          createdById: userId,
        },
      });

      // 2. Update CustomerComplaint status -> RESOLVED
      const resolvedComplaint = await tx.customerComplaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.RESOLVED,
          financeApprovedReturnAmount: approvedReturnAmount,
          originalBillAmount: originalOrderAmount,
          netOrderValue: netOrderAmount,
          financeRemarks: dto.financeRemarks.trim(),
          financeResolvedAt: now,
          financeResolvedBy: userId,
          updatedBy: userId,
        },
        include: includeRelations,
      });

      // 3. Recalculate SalesOrder outstandingAmount and paymentStatus
      const currentPaid = Number(complaint.order.paidAmount || 0);
      const newOutstanding = Math.max(0, netOrderAmount - currentPaid);
      const isFullPaid = newOutstanding <= 0 && netOrderAmount > 0;
      const isZeroOrderPaid = netOrderAmount === 0 && originalOrderAmount > 0;

      await tx.salesOrder.update({
        where: { id: complaint.order.id },
        data: {
          outstandingAmount: newOutstanding,
          ...(isFullPaid || isZeroOrderPaid ? { paymentStatus: 'FULLY_PAID' } : {}),
        },
      });

      // 4. Status History record
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          fromStatus: ComplaintStatus.FINANCE_PENDING,
          toStatus: ComplaintStatus.RESOLVED,
          action: 'FINANCE_APPROVED',
          actorId: userId,
          remarks: dto.financeRemarks.trim(),
          metadata: {
            referenceNumber,
            originalOrderAmount,
            approvedReturnAmount,
            netOrderAmount,
            financeResolvedAt: now,
          },
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'COMPLAINT_FINANCE_RESOLVED',
          entityType: 'CustomerComplaint',
          entityId: id,
          after: {
            complaintNo: complaint.complaintNo,
            status: 'RESOLVED',
            referenceNumber,
            approvedReturnAmount,
            netOrderAmount,
          },
        },
      });

      return {
        ...resolvedComplaint,
        financeAdjustment: adjustment,
      };
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
