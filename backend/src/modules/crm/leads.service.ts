import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getSalesScope, isRestrictedRole, canAssignSalesOwner } from '../../common/utils/rbac.util';
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
  ) {
    const scope = getSalesScope(userId, role, 'Lead');
    return this.prisma.lead.findMany({
      where: {
        ...scope,
        deletedAt: null,
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
    const assignedId = isManager ? (dto.assignedToId || userId) : userId;
    const salesExecutiveId = isManager ? (dto.salesExecutiveId || assignedId) : userId;

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
        address: dto.address,
        source: dto.source || 'OTHER',
        productInterest: dto.productInterest || dto.productInterested,
        detailedItems: Array.isArray(dto.detailedItems)
          ? dto.detailedItems
          : undefined,
        estimatedQuantity: dto.estimatedQuantity,
        unit: dto.unit,
        assignedToId: assignedId,
        salesExecutiveId: salesExecutiveId,
        remarks: dto.remarks || dto.notes,
        companyId: resolvedCompanyId,
        workflowStateId: initialState.id,
        createdById: userId,
      },
      include: { workflowState: true, salesExecutive: { select: { id: true, name: true, email: true } } },
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
      Object.entries(dto).filter(([key, val]) => allowed.includes(key) && val !== undefined),
    ) as any;

    if (data.nextReminder) {
      data.nextReminder = new Date(data.nextReminder);
    }

    if (data.leadDate) {
      data.leadDate = new Date(data.leadDate);
    }
    
    // Prevent unauthorized reassignment for salesperson roles
    if (isRestrictedRole(role)) {
      delete data.assignedToId;
      delete data.salesExecutiveId;
    }

    // Safeguard: Protect detailedItems from accidental empty array deletion unless explicitly allowed
    if (Array.isArray(dto.detailedItems) && dto.detailedItems.length === 0 && dto.allowClearItems !== true) {
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
        const duplicateFilters = [
          ...(lead.email ? [{ email: lead.email }] : []),
          ...(lead.phone ? [{ phone: lead.phone }] : []),
          ...(cleanGstin ? [{ gstin: cleanGstin }] : []),
          {
            companyName: {
              equals: lead.companyName,
              mode: 'insensitive' as const,
            },
          },
        ];
        const existingCustomer = await tx.customer.findFirst({
          where: {
            companyId,
            deletedAt: null,
            OR: duplicateFilters,
          },
        });

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
    await this.getLead(id, companyId, userId, role);
    const initialState = await this.workflowService.getInitialState('LEAD');
    return this.prisma.lead.update({
      where: { id },
      data: {
        workflowStateId: initialState.id,
        lostReason: null,
        updatedById: userId,
        version: { increment: 1 },
      },
      include: { workflowState: true },
    });
  }
}
