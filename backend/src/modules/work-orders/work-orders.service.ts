import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { getSalesScope } from '../../common/utils/rbac.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  async listWorkOrders(statuses?: string[], userId?: string, role?: string) {
    const scope = getSalesScope(userId, role, 'WorkOrder');
    const where: any = { ...scope };
    if (statuses && statuses.length > 0) {
      where.status = { in: statuses };
    }

    if (userId && (role === 'DISPATCH_EXECUTIVE' || role === 'Dispatch Executive')) {
      const user: any = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.dispatchCategory) {
        where.salesOrderItem = {
          product: {
            dispatchCategory: user.dispatchCategory,
          },
        };
      }
    }

    return this.prisma.workOrder.findMany({
      where,
      include: {
        productionPlan: {
          include: { salesOrder: { include: { customer: true, items: { include: { product: true } }, sourceQuotation: true } } },
        },
        salesOrderItem: {
          include: { dispatchItems: true, product: true },
        },
        qcInspections: {
          where: { status: 'APPROVED' },
          orderBy: [{ approvedAt: 'desc' }, { createdAt: 'desc' }],
        },
        workflowState: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkOrder(id: string, userId?: string, role?: string) {
    const scope = getSalesScope(userId, role, 'WorkOrder');
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, ...scope },
      include: {
        productionPlan: {
          include: {
            salesOrder: {
              include: { customer: true, items: { include: { product: true } }, sourceQuotation: true },
            },
          },
        },
        salesOrderItem: {
          include: { product: true },
        },
        workflowState: true,
        productionBatches: true,
      },
    });
    if (!wo) throw new NotFoundException('Work Order not found');
    return wo;
  }

  async processAction(
    id: string,
    actionName: string,
    remarks?: string,
    userId?: string,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
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
        if (
          wo.workflowState?.code === targetCode ||
          wo.status === targetStatus
        ) {
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
          throw new NotFoundException(
            `WORK_ORDER state ${targetCode} not found`,
          );
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
              include: {
                salesOrder: { include: { customer: true, items: true } },
              },
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

      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'WORK_ORDER',
          workflowCode: 'WORK_ORDER',
          currentStateId: wo.workflowStateId!,
          actionName,
          userId: userId || 'SYSTEM',
          remarks,
        },
        tx,
      );

      let nextStatus: any = undefined;
      if (actionName === 'ACCEPT') nextStatus = 'READY';
      else if (actionName === 'REJECT') nextStatus = 'CANCELLED';
      else if (actionName === 'START') nextStatus = 'STARTED';
      else if (actionName === 'COMPLETE') nextStatus = 'COMPLETED';
      else if (actionName === 'REQUEST_MATERIALS')
        nextStatus = 'MATERIAL_PENDING';
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
          updateData.duration = Math.floor(
            (new Date().getTime() - new Date(wo.startedAt).getTime()) / 60000,
          );
        }
      }

      const updated = await tx.workOrder.update({
        where: { id },
        data: updateData,
      });

      if (actionName === 'COMPLETE') {
        const initialQCState = await this.workflowService.getInitialState(
          'QC_INSPECTION',
          tx,
        );
        const existingInspection = await tx.qCInspection.findFirst({
          where: { workOrderId: id },
        });
        if (!existingInspection) {
          await tx.qCInspection.create({
            data: {
              workOrderId: id,
              status: 'PENDING',
              workflowStateId: initialQCState.id,
            },
          });
        }
      }

      return updated;
    });

    if (this.notificationsService && result) {
      const woWithDetails = await this.prisma.workOrder.findUnique({
        where: { id: result.id },
        include: {
          productionPlan: {
            include: {
              salesOrder: { include: { customer: true } },
            },
          },
        },
      });

      const companyId = woWithDetails?.productionPlan?.salesOrder?.customer?.companyId;
      const orderNumber = woWithDetails?.productionPlan?.salesOrder?.orderNumber || 'SO';

      if (companyId) {
        if (actionName === 'START') {
          this.notificationsService.notifyRole({
            companyId,
            role: 'PLANT_HEAD',
            type: 'PRODUCTION_STARTED',
            title: 'Production Started',
            message: `${woWithDetails.workOrderNumber} — Production has started for ${orderNumber}.`,
            route: '/plant-head/planning',
            entityType: 'WorkOrder',
            entityId: woWithDetails.id,
            eventKeyPrefix: `WORK_ORDER:${woWithDetails.id}:STARTED`,
          }).catch((err) =>
            console.warn('[WorkOrdersService Notification] Failed to notify PLANT_HEAD:', err.message),
          );
        } else if (actionName === 'COMPLETE') {
          this.notificationsService.notifyRole({
            companyId,
            role: 'QC_INSPECTOR',
            type: 'QC_REQUIRED',
            title: 'QC Inspection Required',
            message: `${woWithDetails.workOrderNumber} — Production is complete and ready for QC inspection.`,
            route: '/qc/pending',
            entityType: 'WorkOrder',
            entityId: woWithDetails.id,
            eventKeyPrefix: `WORK_ORDER:${woWithDetails.id}:QC_REQUIRED`,
          }).catch((err) =>
            console.warn('[WorkOrdersService Notification] Failed to notify QC_INSPECTOR:', err.message),
          );
        }
      }
    }

    return result;
  }

  async sendToDispatch(id: string, userId: string) {
    const rawId = String(id || '').trim();
    const cleanId = rawId.replace(/^fg-wo-/, '').replace(/^fg-so-/, '').split('-')[0] || rawId;

    // 1. Try finding WorkOrder by direct ID, cleanId, or workOrderNumber
    const wo = await this.prisma.workOrder.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id: cleanId },
          { workOrderNumber: rawId },
          { workOrderNumber: cleanId },
          { productionPlan: { salesOrderId: rawId } },
          { productionPlan: { salesOrderId: cleanId } },
          { salesOrderItem: { salesOrderId: rawId } },
          { salesOrderItem: { salesOrderId: cleanId } },
        ],
      },
    });

    if (wo) {
      await this.prisma.finishedGoods.updateMany({
        where: { workOrderId: wo.id },
        data: { status: 'READY_FOR_DISPATCH' },
      });

      return this.prisma.workOrder.update({
        where: { id: wo.id },
        data: {
          status: 'READY_FOR_DISPATCH',
          productionStatus: 'READY_FOR_DISPATCH',
          sentToDispatchAt: new Date(),
          sentToDispatchById: userId,
        },
      });
    }

    // 2. Try finding SalesOrder by direct ID or cleanId
    const so = await this.prisma.salesOrder.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id: cleanId },
          { orderNumber: rawId },
          { orderNumber: cleanId },
        ],
      },
    });

    if (so) {
      await this.prisma.finishedGoods.updateMany({
        where: { salesOrderId: so.id },
        data: { status: 'READY_FOR_DISPATCH' },
      });

      await this.prisma.workOrder.updateMany({
        where: {
          OR: [
            { productionPlan: { salesOrderId: so.id } },
            { salesOrderItem: { salesOrderId: so.id } },
          ],
        },
        data: {
          status: 'READY_FOR_DISPATCH',
          productionStatus: 'READY_FOR_DISPATCH',
          sentToDispatchAt: new Date(),
          sentToDispatchById: userId,
        },
      });

      await this.prisma.salesOrder.update({
        where: { id: so.id },
        data: { status: 'READY_FOR_DISPATCH' },
      });

      return {
        id: so.id,
        salesOrderId: so.id,
        orderNumber: so.orderNumber,
        status: 'READY_FOR_DISPATCH',
        productionStatus: 'READY_FOR_DISPATCH',
        sentToDispatchAt: new Date(),
      };
    }

    // 3. Try finding FinishedGoods by ID
    const fg = await this.prisma.finishedGoods.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id: cleanId },
        ],
      },
    });

    if (fg) {
      return this.prisma.finishedGoods.update({
        where: { id: fg.id },
        data: { status: 'READY_FOR_DISPATCH' },
      });
    }

    throw new NotFoundException('WorkOrder or SalesOrder not found');
  }

  async dispatchOrder(id: string, userId: string) {
    const rawId = String(id || '').trim();
    const cleanId = rawId.replace(/^fg-wo-/, '').replace(/^fg-so-/, '').split('-')[0] || rawId;

    const wo = await this.prisma.workOrder.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id: cleanId },
          { workOrderNumber: rawId },
          { workOrderNumber: cleanId },
          { productionPlan: { salesOrderId: rawId } },
          { productionPlan: { salesOrderId: cleanId } },
          { salesOrderItem: { salesOrderId: rawId } },
          { salesOrderItem: { salesOrderId: cleanId } },
        ],
      },
    });

    if (wo) {
      await this.prisma.finishedGoods.updateMany({
        where: { workOrderId: wo.id },
        data: { status: 'DISPATCHED' },
      });

      return this.prisma.workOrder.update({
        where: { id: wo.id },
        data: {
          status: 'DISPATCHED',
          productionStatus: 'DISPATCHED',
          dispatchedAt: new Date(),
          dispatchedById: userId,
        },
      });
    }

    const so = await this.prisma.salesOrder.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id: cleanId },
          { orderNumber: rawId },
          { orderNumber: cleanId },
        ],
      },
    });

    if (so) {
      await this.prisma.finishedGoods.updateMany({
        where: { salesOrderId: so.id },
        data: { status: 'DISPATCHED' },
      });

      await this.prisma.workOrder.updateMany({
        where: {
          OR: [
            { productionPlan: { salesOrderId: so.id } },
            { salesOrderItem: { salesOrderId: so.id } },
          ],
        },
        data: {
          status: 'DISPATCHED',
          productionStatus: 'DISPATCHED',
          dispatchedAt: new Date(),
          dispatchedById: userId,
        },
      });

      await this.prisma.salesOrder.update({
        where: { id: so.id },
        data: { status: 'COMPLETED' },
      });

      return {
        id: so.id,
        salesOrderId: so.id,
        orderNumber: so.orderNumber,
        status: 'DISPATCHED',
        productionStatus: 'DISPATCHED',
        dispatchedAt: new Date(),
      };
    }

    throw new NotFoundException('WorkOrder or SalesOrder not found');
  }
}
