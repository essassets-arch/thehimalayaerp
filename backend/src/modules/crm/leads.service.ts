import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listLeads(companyId?: string, search?: string) {
    return this.prisma.lead.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
        ...(search ? {
          OR: [
            { leadNumber: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { contactPerson: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        workflowState: true,
        activities: { orderBy: { createdAt: 'desc' } },
        quotations: { include: { workflowState: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLead(id: string, companyId?: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null, ...(companyId ? { companyId } : {}) },
      include: {
        workflowState: true,
        activities: { orderBy: { createdAt: 'desc' } },
        quotations: { include: { workflowState: true, items: true }, orderBy: { createdAt: 'desc' } },
      }
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async createLead(dto: any, userId: string, companyId?: string) {
    const initialState = await this.workflowService.getInitialState('LEAD');
    const resolvedCompanyId = companyId || dto.companyId || (await this.prisma.company.findFirst({ select: { id: true } }))?.id;
    if (!resolvedCompanyId) throw new NotFoundException('Company not found');
    const leadNumber = await this.sequenceService.generateNext('lead_number', `LD-${new Date().getFullYear()}-`);

    return this.prisma.lead.create({
      data: {
        leadNumber,
        companyName: dto.companyName,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        source: dto.source || 'OTHER',
        productInterest: dto.productInterest,
        estimatedQuantity: dto.estimatedQuantity,
        unit: dto.unit,
        assignedToId: dto.assignedToId,
        remarks: dto.remarks,
        companyId: resolvedCompanyId,
        workflowStateId: initialState.id,
        createdById: userId
      },
      include: { workflowState: true }
    });
  }

  async updateLead(id: string, dto: any, userId: string, companyId?: string) {
    await this.getLead(id, companyId);
    const allowed = [
      'companyName', 'contactPerson', 'email', 'phone', 'source',
      'productInterest', 'estimatedQuantity', 'unit', 'assignedToId',
      'nextReminderAt', 'lostReason', 'remarks',
    ];
    const data = Object.fromEntries(
      Object.entries(dto).filter(([key]) => allowed.includes(key)),
    ) as any;
    if (data.nextReminderAt) data.nextReminderAt = new Date(data.nextReminderAt);
    return this.prisma.lead.update({
      where: { id },
      data: { ...data, updatedById: userId, version: { increment: 1 } },
      include: { workflowState: true, activities: true, quotations: true },
    });
  }

  async getTimeline(id: string) {
    await this.getLead(id);
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

  async addActivity(id: string, dto: { activityType: string, notes?: string, scheduledAt?: string }, userId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.leadActivity.create({
      data: {
        leadId: id,
        activityType: dto.activityType,
        notes: dto.notes,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        createdById: userId
      }
    });
  }

  async processAction(id: string, actionName: string, remarks?: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id }, include: { workflowState: true } });
      if (!lead) throw new NotFoundException('Lead not found');

      const result = await this.workflowService.processAction({
        entityId: id,
        entityType: 'LEAD',
        workflowCode: 'LEAD',
        currentStateId: lead.workflowStateId!,
        actionName,
        userId: userId || 'SYSTEM',
        remarks
      }, tx);

      const updatedLead = await tx.lead.update({
        where: { id },
        data: { workflowStateId: result.nextStateId },
        include: { workflowState: true }
      });

      // Handle Conversion Logic on WON
      if (actionName === 'WON') {
        let customerId = lead.customerId;
        
        // Search for existing customer
        const companyId = lead.companyId || (await tx.company.findFirst({ select: { id: true } }))?.id;
        if (!companyId) throw new NotFoundException('Company not found');
        const duplicateFilters = [
          ...(lead.email ? [{ email: lead.email }] : []),
          ...(lead.phone ? [{ phone: lead.phone }] : []),
          { companyName: { equals: lead.companyName, mode: 'insensitive' as const } },
        ];
        const existingCustomer = await tx.customer.findFirst({
          where: {
            companyId,
            deletedAt: null,
            OR: duplicateFilters,
          }
        });

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Create new customer
          const customerCode = await this.sequenceService.generateNextWithTx(tx, 'customer_number', 'CUST-');
          
          const newCustomer = await tx.customer.create({
            data: {
              customerCode,
              companyName: lead.companyName,
              contactPerson: lead.contactPerson,
              email: lead.email,
              phone: lead.phone,
              status: 'ACTIVE',
              companyId,
              createdById: userId,
            }
          });
          customerId = newCustomer.id;
        }

        await tx.lead.update({
          where: { id },
          data: {
            convertedCustomerId: customerId,
            convertedAt: new Date(),
            convertedById: userId,
            customerId,
          }
        });
        await tx.quotation.updateMany({
          where: { leadId: id, customerId: null },
          data: { customerId },
        });
      }

      return tx.lead.findUnique({ where: { id }, include: { workflowState: true } });
    });
  }
}
