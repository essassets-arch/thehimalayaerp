import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { getAdvancedScope, getSalesScope } from '../../common/utils/rbac.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly sequenceService: SequenceService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  async listPlans(userId?: string, role?: string) {
    const scope = getSalesScope(userId, role, 'ProductionPlan');
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
    const scope = getSalesScope(userId, role, 'ProductionPlan');
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
      return this.prisma.productionPlan.update({
        where: { id: existingPlan.id },
        data: {
          plannedStartDate: dto.plannedStartDate
            ? new Date(dto.plannedStartDate)
            : existingPlan.plannedStartDate,
          plannedEndDate: dto.plannedEndDate
            ? new Date(dto.plannedEndDate)
            : existingPlan.plannedEndDate,
          productionLine: dto.productionLine || existingPlan.productionLine,
        },
      });
    }

    const initialState =
      await this.workflowService.getInitialState('PRODUCTION_PLAN');
    const planNumber = await this.sequenceService.generateNext(
      'production_plan_number',
      'PP-',
    );

    const plan = await this.prisma.productionPlan.create({
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
      include: {
        salesOrder: { include: { customer: true } }
      }
    });

    if (this.notificationsService && plan.salesOrder?.customer?.companyId) {
      this.notificationsService.notifyRole({
        companyId: plan.salesOrder.customer.companyId,
        role: 'PRODUCTION_MANAGER',
        type: 'PRODUCTION_PLAN_CREATED',
        title: 'Production Plan Created',
        message: `${plan.planNumber} — Production plan for ${plan.salesOrder.orderNumber} has been created.`,
        route: '/production/incoming-orders',
        entityType: 'ProductionPlan',
        entityId: plan.id,
        eventKeyPrefix: `PRODUCTION_PLAN:${plan.id}:CREATED`
      }).catch((err) =>
        console.warn('[ProductionService Notification] Failed to notify PRODUCTION_MANAGER:', err.message)
      );
    }

    return plan;
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
    const result = await this.prisma.$transaction(async (tx) => {
      const workflowResult = await this.workflowService.processAction(
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
          workflowStateId: workflowResult.nextStateId,
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

          // Calculate reservations of type FINISHED_GOODS_RESERVATION for this item
          const reservations = await tx.salesOrderAllocation.findMany({
            where: {
              salesOrderItemId: item.id,
              allocationType: 'FINISHED_GOODS_RESERVATION',
            },
          });
          const reservedQty = reservations.reduce((sum, r) => sum + Number(r.reservedQuantity), 0);
          const workOrderQty = Math.max(0, Number(item.orderedQuantity) - reservedQty);

          if (workOrderQty > 0) {
            const wo = await tx.workOrder.create({
              data: {
                workOrderNumber: `WO-${new Date().getFullYear()}-${String(count + i + 1).padStart(5, '0')}`,
                productionPlanId: id,
                salesOrderItemId: item.id,
                quantity: workOrderQty,
                workflowStateId: initialWOState.id,
                status: 'CREATED',
              },
            });

            // Create SalesOrderAllocation of type PRODUCTION_REQUIRED
            await tx.salesOrderAllocation.create({
              data: {
                salesOrderId: updated.salesOrderId,
                salesOrderItemId: item.id,
                allocationType: 'PRODUCTION_REQUIRED',
                requiredQuantity: workOrderQty,
                productionQuantity: workOrderQty,
                workOrderId: wo.id,
              },
            });
          }
        }
      }

      return updated;
    });

    if (this.notificationsService && result && actionName === 'RELEASE') {
      const planWithOrder = await this.prisma.productionPlan.findUnique({
        where: { id: result.id },
        include: {
          salesOrder: { include: { customer: true } },
          workOrders: true,
        },
      });
      if (planWithOrder?.salesOrder?.customer?.companyId) {
        const companyId = planWithOrder.salesOrder.customer.companyId;
        for (const wo of planWithOrder.workOrders) {
          this.notificationsService.notifyRole({
            companyId,
            role: 'PRODUCTION_MANAGER',
            type: 'WORK_ORDER_CREATED',
            title: 'New Work Order',
            message: `${wo.workOrderNumber} — Work Order for ${planWithOrder.salesOrder.orderNumber} is ready for production.`,
            route: '/production/work-orders',
            entityType: 'WorkOrder',
            entityId: wo.id,
            eventKeyPrefix: `WORK_ORDER:${wo.id}:CREATED`,
          }).catch((err) =>
            console.warn('[ProductionService Notification] Failed to notify WORK_ORDER_CREATED:', err.message),
          );
        }
      }
    }

    return result;
  }
}
