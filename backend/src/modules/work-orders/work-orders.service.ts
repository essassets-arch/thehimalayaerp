import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService
  ) {}

  async listWorkOrders(statuses?: string[]) {
    const where: any = {};
    if (statuses && statuses.length > 0) {
      where.status = { in: statuses };
    }
    return this.prisma.workOrder.findMany({
      where,
      include: {
        productionPlan: {
          include: { salesOrder: { include: { customer: true, items: true } } }
        },
        salesOrderItem: true,
        workflowState: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getWorkOrder(id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        productionPlan: {
          include: {
            salesOrder: {
              include: { customer: true, items: true }
            }
          }
        },
        salesOrderItem: true,
        workflowState: true,
        productionBatches: true
      }
    });
    if (!wo) throw new NotFoundException('Work Order not found');
    return wo;
  }

  async processAction(id: string, actionName: string, remarks?: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.findUnique({
      where: { id },
      include: { workflowState: true },
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    if (actionName === 'ACCEPT' || actionName === 'REJECT') {
      const targetCode = actionName === 'ACCEPT' ? 'READY' : 'CANCELLED';
      const targetStatus = actionName === 'ACCEPT' ? 'READY' : 'CANCELLED';

      // Idempotent retries are successful instead of failing after a double click
      // or a partially completed grouped-order request.
      if (wo.workflowState?.code === targetCode || wo.status === targetStatus) {
        return wo;
      }
      if (wo.workflowState?.code !== 'CREATED') {
        throw new BadRequestException(
          `Work order ${wo.workOrderNumber} is already ${wo.workflowState?.name || wo.status} and cannot be ${actionName.toLowerCase()}ed.`,
        );
      }

      const targetState = await tx.workflowState.findFirst({
        where: {
          workflow: { code: 'WORK_ORDER' },
          code: targetCode,
        },
      });
      if (!targetState) {
        throw new NotFoundException(`WORK_ORDER state ${targetCode} not found`);
      }

      const updatedDecision = await tx.workOrder.update({
        where: { id },
        data: {
          workflowStateId: targetState.id,
          status: targetStatus,
        },
        include: {
          workflowState: true,
          productionPlan: {
            include: { salesOrder: { include: { customer: true, items: true } } },
          },
        },
      });
      await tx.workflowHistory.create({
        data: {
          entityId: id,
          entityType: 'WORK_ORDER',
          fromStatus: wo.workflowState.name,
          toStatus: targetState.name,
          action: actionName,
          userId: userId || 'SYSTEM',
          remarks,
        },
      });
      return updatedDecision;
    }

    const result = await this.workflowService.processAction({
      entityId: id,
      entityType: 'WORK_ORDER',
      workflowCode: 'WORK_ORDER',
      currentStateId: wo.workflowStateId!,
      actionName,
      userId: userId || 'SYSTEM',
      remarks
    }, tx);

    let nextStatus: any = undefined;
    if (actionName === 'ACCEPT') nextStatus = 'READY';
    else if (actionName === 'REJECT') nextStatus = 'CANCELLED';
    else if (actionName === 'START') nextStatus = 'STARTED';
    else if (actionName === 'COMPLETE') nextStatus = 'COMPLETED';
    else if (actionName === 'REQUEST_MATERIALS') nextStatus = 'MATERIAL_PENDING';
    else if (actionName === 'ISSUE_MATERIALS') nextStatus = 'READY';
    else if (actionName === 'LOG_BATCH') nextStatus = 'PARTIALLY_COMPLETED';

    const updateData: any = {
      workflowStateId: result.nextStateId,
    };
    if (nextStatus) updateData.status = nextStatus;

    if (actionName === 'START') {
      updateData.startedAt = new Date();
      updateData.startedById = userId;
    } else if (actionName === 'COMPLETE') {
      updateData.completedAt = new Date();
      updateData.completedById = userId;
      if (wo.startedAt) {
        updateData.duration = Math.floor((new Date().getTime() - new Date(wo.startedAt).getTime()) / 60000);
      }
    }

    const updated = await tx.workOrder.update({
      where: { id },
      data: updateData
    });

    if (actionName === 'COMPLETE') {
      const initialQCState = await this.workflowService.getInitialState('QC_INSPECTION', tx);
      const existingInspection = await tx.qCInspection.findFirst({ where: { workOrderId: id } });
      if (!existingInspection) {
        await tx.qCInspection.create({
          data: {
            workOrderId: id,
            status: 'PENDING',
            workflowStateId: initialQCState.id
          }
        });
      }
    }

    return updated;
    });
  }

  async sendToDispatch(id: string, userId: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!wo) throw new NotFoundException('WorkOrder not found');
    if (wo.status !== 'QC_APPROVED') {
      throw new BadRequestException('WorkOrder must be QC_APPROVED to send to dispatch');
    }
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        status: 'READY_FOR_DISPATCH',
        sentToDispatchAt: new Date(),
        sentToDispatchById: userId
      }
    });
  }

  async dispatchOrder(id: string, userId: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!wo) throw new NotFoundException('WorkOrder not found');
    if (wo.status !== 'READY_FOR_DISPATCH') {
      throw new BadRequestException('WorkOrder must be READY_FOR_DISPATCH to dispatch');
    }
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
        dispatchedById: userId
      }
    });
  }
}
