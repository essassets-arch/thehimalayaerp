import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  getSalesScope,
  isRestrictedRole,
  canAssignSalesOwner,
} from '../../common/utils/rbac.util';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listLeads(
    companyId?: string,
    search?: string,
    userId?: string,
    role?: string,
    includeDeleted?: boolean,
  ) {
    const scope = getSalesScope(userId, role, 'Lead');
    return this.prisma.lead.findMany({
      where: {
        ...scope,
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(companyId ? { companyId } : {}),
        ...(search
          ? {
              OR: [
                { leadNumber: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { contactPerson: { contains: search, mode: 'insensitive' } },
                { projectName: { contains: search, mode: 'insensitive' } },
                { groupName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { gstNumber: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        workflowState: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        quotations: {
          include: { workflowState: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLead(
    id: string,
    companyId?: string,
    userId?: string,
    role?: string,
  ) {
    const scope = getSalesScope(userId, role, 'Lead');
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        ...scope,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        workflowState: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        quotations: {
          include: { workflowState: true, items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found or access denied');
    return lead;
  }

  private validateCoordinates(
    lat?: number | null,
    lng?: number | null,
    acc?: number | null,
  ) {
    if (lat !== undefined && lat !== null) {
      const numLat = Number(lat);
      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        throw new BadRequestException(
          'Invalid latitude. Must be between -90 and 90.',
        );
      }
    }
    if (lng !== undefined && lng !== null) {
      const numLng = Number(lng);
      if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        throw new BadRequestException(
          'Invalid longitude. Must be between -180 and 180.',
        );
      }
    }
    if (acc !== undefined && acc !== null) {
      const numAcc = Number(acc);
      if (isNaN(numAcc) || numAcc < 0) {
        throw new BadRequestException(
          'Invalid accuracy. Must be greater than or equal to 0.',
        );
      }
    }
  }

  private processLeadAddress(dto: any) {
    if (
      !dto.address &&
      !dto.deliveryAddress &&
      dto.deliveryLatitude === undefined &&
      dto.deliveryLongitude === undefined
    ) {
      return dto.address || undefined;
    }
    const rawAddr = dto.address || {};
    const deliveryLatitude =
      dto.deliveryLatitude !== undefined && dto.deliveryLatitude !== null
        ? Number(dto.deliveryLatitude)
        : rawAddr.deliveryLatitude !== undefined &&
            rawAddr.deliveryLatitude !== null
          ? Number(rawAddr.deliveryLatitude)
          : null;
    const deliveryLongitude =
      dto.deliveryLongitude !== undefined && dto.deliveryLongitude !== null
        ? Number(dto.deliveryLongitude)
        : rawAddr.deliveryLongitude !== undefined &&
            rawAddr.deliveryLongitude !== null
          ? Number(rawAddr.deliveryLongitude)
          : null;
    const deliveryAccuracy =
      dto.deliveryAccuracy !== undefined && dto.deliveryAccuracy !== null
        ? Number(dto.deliveryAccuracy)
        : rawAddr.deliveryAccuracy !== undefined &&
            rawAddr.deliveryAccuracy !== null
          ? Number(rawAddr.deliveryAccuracy)
          : null;
    const deliveryAddress =
      dto.deliveryAddress || rawAddr.deliveryAddress || '';
    const deliveryPlaceId =
      dto.deliveryPlaceId || rawAddr.deliveryPlaceId || '';

    this.validateCoordinates(
      deliveryLatitude,
      deliveryLongitude,
      deliveryAccuracy,
    );

    return {
      line1: rawAddr.line1 || rawAddr.addressLine1 || '',
      city: rawAddr.city || '',
      state: rawAddr.state || rawAddr.stateName || '',
      country: rawAddr.country || 'India',
      pincode: rawAddr.pincode || '',
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      deliveryAccuracy,
      deliveryPlaceId,
    };
  }

  async createLead(
    dto: any,
    userId: string,
    companyId?: string,
    role?: string,
  ) {
    const initialState = await this.workflowService.getInitialState('LEAD');
    const resolvedCompanyId =
      companyId ||
      dto.companyId ||
      (await this.prisma.company.findFirst({ select: { id: true } }))?.id;
    if (!resolvedCompanyId) throw new NotFoundException('Company not found');
    const leadDate = dto.leadDate ? new Date(dto.leadDate) : new Date();
    const leadNumber = await this.sequenceService.generateLeadNumber(leadDate);

    const isManager = canAssignSalesOwner(role);
    const assignedId = isManager ? dto.assignedToId || userId : userId;
    const salesExecutiveId = isManager
      ? dto.salesExecutiveId || assignedId
      : userId;

    const processedAddress = this.processLeadAddress(dto);

    return this.prisma.lead.create({
      data: {
        leadNumber,
        leadDate,
        companyName: dto.companyName,
        groupName: dto.groupName,
        projectName: dto.projectName,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        gstName: dto.gstName || dto.companyName,
        gstNumber: dto.gstNumber,
        address: processedAddress,
        source: dto.source || 'OTHER',
        productInterest: dto.productInterest || dto.productInterested,
        detailedItems: Array.isArray(dto.detailedItems)
          ? dto.detailedItems
          : undefined,
        estimatedQuantity:
          dto.estimatedQuantity !== undefined &&
          dto.estimatedQuantity !== null &&
          dto.estimatedQuantity !== ''
            ? Number(dto.estimatedQuantity)
            : null,
        unit: dto.unit,
        assignedToId: assignedId,
        salesExecutiveId: salesExecutiveId,
        remarks: dto.remarks || dto.notes,
        companyId: resolvedCompanyId,
        workflowStateId: initialState.id,
        createdById: userId,
      },
      include: {
        workflowState: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateLead(
    id: string,
    dto: any,
    userId: string,
    companyId?: string,
    role?: string,
  ) {
    // 1. Verify existence and authorization
    await this.getLead(id, companyId, userId, role);

    const allowed = [
      'leadDate',
      'companyName',
      'groupName',
      'projectName',
      'contactPerson',
      'email',
      'phone',
      'gstName',
      'gstNumber',
      'address',
      'source',
      'productInterest',
      'detailedItems',
      'estimatedQuantity',
      'unit',
      'assignedToId',
      'nextReminder',
      'lostReason',
      'remarks',
    ];

    // Filter only explicitly provided (non-undefined) values
    const data = Object.fromEntries(
      Object.entries(dto).filter(
        ([key, val]) => allowed.includes(key) && val !== undefined,
      ),
    ) as any;

    if (data.nextReminder) {
      data.nextReminder = new Date(data.nextReminder);
    }

    if (data.leadDate) {
      data.leadDate = new Date(data.leadDate);
    }

    if (data.estimatedQuantity !== undefined) {
      data.estimatedQuantity =
        data.estimatedQuantity !== null && data.estimatedQuantity !== ''
          ? Number(data.estimatedQuantity)
          : null;
    }

    if (
      dto.address !== undefined ||
      dto.deliveryAddress !== undefined ||
      dto.deliveryLatitude !== undefined ||
      dto.deliveryLongitude !== undefined
    ) {
      data.address = this.processLeadAddress(dto);
    }

    // Prevent unauthorized reassignment for salesperson roles
    if (isRestrictedRole(role)) {
      delete data.assignedToId;
      delete data.salesExecutiveId;
    }

    // Safeguard: Protect detailedItems from accidental empty array deletion unless explicitly allowed
    if (
      Array.isArray(dto.detailedItems) &&
      dto.detailedItems.length === 0 &&
      dto.allowClearItems !== true
    ) {
      delete data.detailedItems;
    }

    await this.prisma.lead.update({
      where: { id },
      data: { ...data, updatedById: userId, version: { increment: 1 } },
    });

    // 2. Refetch complete lead from PostgreSQL after update
    return this.getLead(id, companyId, userId, role);
  }

  async getTimeline(id: string, userId?: string, role?: string) {
    await this.getLead(id, undefined, userId, role);
    const [workflow, activities] = await Promise.all([
      this.prisma.workflowHistory.findMany({
        where: { entityType: 'LEAD', entityId: id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leadActivity.findMany({
        where: { leadId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return [...workflow, ...activities].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async addActivity(
    id: string,
    dto: { activityType: string; notes?: string; scheduledAt?: string },
    userId: string,
    role?: string,
  ) {
    const lead = await this.getLead(id, undefined, userId, role);

    return this.prisma.leadActivity.create({
      data: {
        leadId: id,
        activityType: dto.activityType,
        notes: dto.notes,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        createdById: userId,
      },
    });
  }

  async processAction(
    id: string,
    actionName: string,
    remarks?: string,
    userId?: string,
    role?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.getLead(id, undefined, userId, role);
      const lead = await tx.lead.findUnique({
        where: { id },
        include: { workflowState: true },
      });
      if (!lead) throw new NotFoundException('Lead not found');

      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'LEAD',
          workflowCode: 'LEAD',
          currentStateId: lead.workflowStateId!,
          actionName,
          userId: userId || 'SYSTEM',
          remarks,
        },
        tx,
      );

      const updatedLead = await tx.lead.update({
        where: { id },
        data: { workflowStateId: result.nextStateId },
        include: { workflowState: true },
      });

      // Handle Conversion Logic on WON
      if (actionName === 'WON') {
        let customerId = lead.customerId;

        // Search for existing customer
        const companyId =
          lead.companyId ||
          (await tx.company.findFirst({ select: { id: true } }))?.id;
        if (!companyId) throw new NotFoundException('Company not found');
        const cleanGstin = lead.gstNumber?.trim()
          ? lead.gstNumber.trim()
          : null;
        const isGenericEmail = (email?: string | null) => {
          if (!email) return true;
          const lower = email.trim().toLowerCase();
          return (
            lower === 'info@thehimalaya.co.in' ||
            lower.endsWith('@thehimalaya.co.in') ||
            lower.endsWith('@himalayaerp.com') ||
            lower.startsWith('info@') ||
            lower.startsWith('sales@') ||
            lower.startsWith('support@') ||
            lower.startsWith('admin@') ||
            lower.startsWith('contact@')
          );
        };

        let existingCustomer: any = null;

        // 1. Strict match by GSTIN if valid
        if (cleanGstin && cleanGstin.length >= 10) {
          existingCustomer = await tx.customer.findFirst({
            where: {
              companyId,
              deletedAt: null,
              gstin: cleanGstin,
            },
          });
        }

        // 2. Strict match by Company Name (case-insensitive)
        if (!existingCustomer && lead.companyName?.trim()) {
          existingCustomer = await tx.customer.findFirst({
            where: {
              companyId,
              deletedAt: null,
              companyName: {
                equals: lead.companyName.trim(),
                mode: 'insensitive' as const,
              },
            },
          });
        }

        // 3. Match by specific non-generic email only
        if (!existingCustomer && lead.email && !isGenericEmail(lead.email)) {
          existingCustomer = await tx.customer.findFirst({
            where: {
              companyId,
              deletedAt: null,
              email: lead.email.trim().toLowerCase(),
            },
          });
        }

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Create new customer
          const customerCode = await this.sequenceService.generateNextWithTx(
            tx,
            'customer_number',
            'CUST-',
          );

          try {
            const newCustomer = await tx.customer.create({
              data: {
                customerCode,
                companyName: lead.companyName,
                contactPerson: lead.contactPerson,
                email: lead.email,
                phone: lead.phone,
                gstin: cleanGstin,
                status: 'ACTIVE',
                companyId,
                createdById: userId,
              },
            });
            customerId = newCustomer.id;
          } catch (err: any) {
            if (err.code === 'P2002') {
              const fallbackCustomer = await tx.customer.findFirst({
                where: {
                  companyId,
                  deletedAt: null,
                  OR: [
                    ...(cleanGstin ? [{ gstin: cleanGstin }] : []),
                    { customerCode },
                    {
                      companyName: {
                        equals: lead.companyName,
                        mode: 'insensitive' as const,
                      },
                    },
                  ],
                },
              });
              if (fallbackCustomer) {
                customerId = fallbackCustomer.id;
              } else {
                throw err;
              }
            } else {
              throw err;
            }
          }
        }

        await tx.lead.update({
          where: { id },
          data: {
            convertedCustomerId: customerId,
            convertedAt: new Date(),
            convertedById: userId,
            customerId,
          },
        });
        await tx.quotation.updateMany({
          where: { leadId: id, customerId: null },
          data: { customerId },
        });
      }

      return tx.lead.findUnique({
        where: { id },
        include: { workflowState: true },
      });
    });
  }

  async restoreLead(
    id: string,
    userId: string,
    companyId?: string,
    role?: string,
  ) {
    const scope = getSalesScope(userId, role, 'Lead');
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        ...scope,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        quotations: true,
      },
    });
    if (!lead) throw new NotFoundException('Lead not found or access denied');

    const initialState = await this.workflowService.getInitialState('LEAD');

    return this.prisma.$transaction(async (tx) => {
      const quotationIds = (lead.quotations || []).map((q) => q.id);

      // Restore associated quotations
      if (quotationIds.length > 0) {
        await tx.quotation.updateMany({
          where: { id: { in: quotationIds } },
          data: {
            deletedAt: null,
            updatedById: userId,
          },
        });

        // Restore associated sales orders
        await tx.salesOrder.updateMany({
          where: {
            OR: [
              { quotationId: { in: quotationIds } },
              { sourceQuotationId: { in: quotationIds } },
            ],
          },
          data: {
            deletedAt: null,
            status: 'DRAFT',
            updatedById: userId,
          },
        });
      }

      // Restore sample requests
      await tx.sampleRequest.updateMany({
        where: { leadId: id },
        data: {
          deletedAt: null,
          updatedById: userId,
        },
      });

      // Restore lead
      return tx.lead.update({
        where: { id },
        data: {
          deletedAt: null,
          lostAt: null,
          lostReason: null,
          workflowStateId: initialState.id,
          updatedById: userId,
          version: { increment: 1 },
        },
        include: { workflowState: true },
      });
    });
  }

  async deleteLead(
    id: string,
    reason?: string,
    userId?: string,
    companyId?: string,
    role?: string,
  ) {
    const scope = getSalesScope(userId, role, 'Lead');
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        ...scope,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        quotations: {
          where: { deletedAt: null },
          include: {
            salesOrder: true,
            sourceSalesOrders: true,
          },
        },
        sampleRequests: {
          where: { deletedAt: null },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found or access denied');
    }

    const now = new Date();
    const deleteReason = reason?.trim() || 'Deleted by user';

    return this.prisma.$transaction(async (tx) => {
      // 1. Gather all Quotations linked to this Lead
      const quotationIds = (lead.quotations || []).map((q) => q.id);

      // 2. Gather all SalesOrders linked to these Quotations
      const salesOrderIds = new Set<string>();
      for (const q of lead.quotations || []) {
        if (q.salesOrder?.id) salesOrderIds.add(q.salesOrder.id);
        if (Array.isArray(q.sourceSalesOrders)) {
          for (const s of q.sourceSalesOrders) {
            salesOrderIds.add(s.id);
          }
        }
      }

      if (quotationIds.length > 0) {
        const directOrders = await tx.salesOrder.findMany({
          where: {
            OR: [
              { quotationId: { in: quotationIds } },
              { sourceQuotationId: { in: quotationIds } },
            ],
            deletedAt: null,
          },
          select: { id: true },
        });
        for (const o of directOrders) {
          salesOrderIds.add(o.id);
        }
      }

      const orderIdsArray = Array.from(salesOrderIds);

      // 3. Soft-delete SalesOrders
      if (orderIdsArray.length > 0) {
        await tx.salesOrder.updateMany({
          where: { id: { in: orderIdsArray } },
          data: {
            deletedAt: now,
            status: 'CANCELLED',
            remarks: `Cancelled: Associated Lead ${lead.leadNumber || lead.id} deleted (${deleteReason})`,
            updatedById: userId,
          },
        });
      }

      // 4. Soft-delete Quotations
      if (quotationIds.length > 0) {
        await tx.quotation.updateMany({
          where: { id: { in: quotationIds } },
          data: {
            deletedAt: now,
            remarks: `Associated Lead ${lead.leadNumber || lead.id} deleted (${deleteReason})`,
            updatedById: userId,
          },
        });
      }

      // 5. Soft-delete SampleRequests
      await tx.sampleRequest.updateMany({
        where: { leadId: id, deletedAt: null },
        data: {
          deletedAt: now,
          updatedById: userId,
        },
      });

      // 6. Soft-delete the Lead (preserve LeadActivity and FollowUp so they remain intact upon restore)
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          deletedAt: now,
          remarks: `Deleted (${deleteReason})`,
          lostReason: null,
          lostAt: null,
          updatedById: userId,
          version: { increment: 1 },
        },
      });

      return {
        success: true,
        message: 'Lead and associated orders and quotations deleted successfully',
        deletedLeadId: id,
        deletedQuotationsCount: quotationIds.length,
        deletedOrdersCount: orderIdsArray.length,
        lead: updatedLead,
      };
    });
  }
}
