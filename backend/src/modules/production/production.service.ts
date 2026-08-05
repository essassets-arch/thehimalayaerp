import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { getAdvancedScope } from '../../common/utils/rbac.util';

@Injectable()
export class ProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listPlans(userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      PRODUCTION: { assignedToId: userId },
      SALES: { salesOrder: { createdById: userId } },
    });
    return this.prisma.productionPlan.findMany({
      where: scope,
      include: {
        salesOrder: { include: { customer: true } },
        _count: {
          select: { workOrders: true },
        },
        workflowState: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlan(id: string, userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      PRODUCTION: { assignedToId: userId },
      SALES: { salesOrder: { createdById: userId } },
    });
    const plan = await this.prisma.productionPlan.findFirst({
      where: { id, ...scope },
      include: {
        salesOrder: {
          include: { items: true, customer: true },
        },
        workOrders: true,
        workflowState: true,
      },
    });
    if (!plan) throw new NotFoundException('Production Plan not found');
    return plan;
  }

  async createPlan(
    dto: {
      salesOrderId: string;
      plannedStartDate?: string;
      plannedEndDate?: string;
      productionLine?: string;
    },
    userId?: string,
    role?: string,
  ) {
    const existingPlan = await this.prisma.productionPlan.findFirst({
      where: { salesOrderId: dto.salesOrderId, status: { not: 'CANCELLED' } },
    });
    if (existingPlan) {
      throw new BadRequestException(
        `A production plan already exists for Sales Order ${dto.salesOrderId}.`,
      );
    }

    const initialState =
      await this.workflowService.getInitialState('PRODUCTION_PLAN');
    const count = await this.prisma.productionPlan.count();
    const planNumber = `PP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.productionPlan.create({
      data: {
        planNumber,
        salesOrderId: dto.salesOrderId,
        plannedStartDate: dto.plannedStartDate
          ? new Date(dto.plannedStartDate)
          : null,
        plannedEndDate: dto.plannedEndDate
          ? new Date(dto.plannedEndDate)
          : null,
        productionLine: dto.productionLine,
        status: 'DRAFT',
        workflowStateId: initialState.id,
        assignedToId: userId,
      },
    });
  }

  async updatePlan(
    id: string,
    dto: {
      plannedStartDate?: string;
      plannedEndDate?: string;
      productionLine?: string;
    },
    userId?: string,
    role?: string,
  ) {
    const plan = await this.getPlan(id, userId, role);

    return this.prisma.productionPlan.update({
      where: { id },
      data: {
        ...(dto.plannedStartDate !== undefined
          ? {
              plannedStartDate: dto.plannedStartDate
                ? new Date(dto.plannedStartDate)
                : null,
            }
          : {}),
        ...(dto.plannedEndDate !== undefined
          ? {
              plannedEndDate: dto.plannedEndDate
                ? new Date(dto.plannedEndDate)
                : null,
            }
          : {}),
        ...(dto.productionLine !== undefined
          ? { productionLine: dto.productionLine }
          : {}),
      },
      include: {
        salesOrder: { include: { items: true, customer: true } },
        workflowState: true,
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
    const plan = await this.getPlan(id, userId, role);
    return this.prisma.$transaction(async (tx) => {
      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'PRODUCTION_PLAN',
          workflowCode: 'PRODUCTION_PLAN',
          currentStateId: plan.workflowStateId!,
          actionName,
          userId: userId || 'SYSTEM',
          remarks,
        },
        tx,
      );

      const updated = await tx.productionPlan.update({
        where: { id },
        data: {
          workflowStateId: result.nextStateId,
          status: {
            SUBMIT: 'UNDER_REVIEW',
            APPROVE: 'APPROVED',
            RELEASE: 'RELEASED',
            START: 'IN_PROGRESS',
            COMPLETE: 'COMPLETED',
            CANCEL: 'CANCELLED',
            REJECT: 'CANCELLED',
          }[actionName] as any,
        },
        include: { salesOrder: { include: { items: true } } },
      });

      // If released, automatically generate Work Orders based on the sales order items
      if (actionName === 'RELEASE') {
        const initialWOState = await this.workflowService.getInitialState(
          'WORK_ORDER',
          tx,
        );
        const existing = await tx.workOrder.count({
          where: { productionPlanId: id },
        });
        if (existing) return updated;
        const count = await tx.workOrder.count();

        for (let i = 0; i < updated.salesOrder.items.length; i++) {
          const item = updated.salesOrder.items[i];
          await tx.workOrder.create({
            data: {
              workOrderNumber: `WO-${new Date().getFullYear()}-${String(count + i + 1).padStart(5, '0')}`,
              productionPlanId: id,
              salesOrderItemId: item.id,
              quantity: item.orderedQuantity,
              workflowStateId: initialWOState.id,
              status: 'CREATED',
            },
          });
        }
      }

      return updated;
    });
  }
}
