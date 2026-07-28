import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService
  ) {}

  async listWorkOrders() {
    return this.prisma.workOrder.findMany({
      include: {
        productionPlan: {
          include: { salesOrder: { include: { customer: true } } }
        },
        workflowState: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getWorkOrder(id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        productionPlan: true,
        workflowState: true,
        productionBatches: true
      }
    });
    if (!wo) throw new NotFoundException('Work Order not found');
    return wo;
  }

  async processAction(id: string, actionName: string, remarks?: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.findUnique({ where: { id } });
    if (!wo) throw new NotFoundException('Work Order not found');

    const result = await this.workflowService.processAction({
      entityId: id,
      entityType: 'WORK_ORDER',
      workflowCode: 'WORK_ORDER',
      currentStateId: wo.workflowStateId!,
      actionName,
      userId: userId || 'SYSTEM',
      remarks
    }, tx);

    const updated = await tx.workOrder.update({
      where: { id },
      data: {
        workflowStateId: result.nextStateId,
        status: actionName === 'START'
          ? 'STARTED'
          : actionName === 'COMPLETE'
            ? 'COMPLETED'
            : actionName === 'REQUEST_MATERIALS'
              ? 'MATERIAL_PENDING'
              : actionName === 'ISSUE_MATERIALS'
                ? 'READY'
                : actionName === 'LOG_BATCH'
                  ? 'PARTIALLY_COMPLETED'
                  : undefined,
      }
    });

    if (actionName === 'COMPLETE') {
      const initialQCState = await this.workflowService.getInitialState('QC_INSPECTION', tx);
      const existingInspection = await tx.qCInspection.findFirst({ where: { workOrderId: id } });
      if (!existingInspection) await tx.qCInspection.create({
        data: {
          workOrderId: id,
          status: 'PENDING',
          workflowStateId: initialQCState.id
        }
      });
    }

    return updated;
    });
  }
}
