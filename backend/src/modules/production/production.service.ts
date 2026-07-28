import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class ProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService
  ) {}

  async listPlans() {
    return this.prisma.productionPlan.findMany({
      include: {
        salesOrder: {
          include: { customer: true }
        },
        _count: {
          select: { workOrders: true }
        },
        workflowState: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPlan(id: string) {
    const plan = await this.prisma.productionPlan.findUnique({
      where: { id },
      include: {
        salesOrder: {
          include: { items: true, customer: true }
        },
        workOrders: true,
        workflowState: true
      }
    });
    if (!plan) throw new NotFoundException('Production Plan not found');
    return plan;
  }

  async createPlan(dto: { salesOrderId: string, plannedStartDate?: string, plannedEndDate?: string, productionLine?: string }) {
    const initialState = await this.workflowService.getInitialState('PRODUCTION_PLAN');
    const count = await this.prisma.productionPlan.count();
    const planNumber = `PP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.productionPlan.create({
      data: {
        planNumber,
        salesOrderId: dto.salesOrderId,
        plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : null,
        plannedEndDate: dto.plannedEndDate ? new Date(dto.plannedEndDate) : null,
        productionLine: dto.productionLine,
        status: 'DRAFT',
        workflowStateId: initialState.id,
      }
    });
  }

  async processAction(id: string, actionName: string, remarks?: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
    const plan = await tx.productionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    const result = await this.workflowService.processAction({
      entityId: id,
      entityType: 'PRODUCTION_PLAN',
      workflowCode: 'PRODUCTION_PLAN',
      currentStateId: plan.workflowStateId!,
      actionName,
      userId: userId || 'SYSTEM',
      remarks
    }, tx);

    const updated = await tx.productionPlan.update({
      where: { id },
      data: { workflowStateId: result.nextStateId },
      include: { salesOrder: { include: { items: true } } }
    });

    // If released, automatically generate Work Orders based on the sales order items
    if (actionName === 'RELEASE') {
      const initialWOState = await this.workflowService.getInitialState('WORK_ORDER', tx);
      const existing = await tx.workOrder.count({ where: { productionPlanId: id } });
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
            status: 'CREATED'
          }
        });
      }
    }

    return updated;
    });
  }
}
