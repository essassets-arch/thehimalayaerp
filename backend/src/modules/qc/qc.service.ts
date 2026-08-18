import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QcService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly notificationsService?: NotificationsService,
  ) { }

  async listInspections(companyId: string) {
    return this.prisma.qCInspection.findMany({
      where: {
        workOrder: {
          productionPlan: {
            salesOrder: {
              customer: { companyId },
            },
          },
        },
      },
      include: {
        workOrder: {
          include: {
            productionPlan: {
              include: { salesOrder: { include: { customer: true } } },
            },
            salesOrderItem: true,
          },
        },
        workflowState: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInspection(id: string) {
    const inspection = await this.prisma.qCInspection.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            productionPlan: {
              include: {
                salesOrder: { include: { items: true, customer: true } },
              },
            },
            productionBatches: true,
          },
        },
        workflowState: true,
      },
    });
    if (!inspection) throw new NotFoundException('QC Inspection not found');
    return inspection;
  }

  async processAction(
    id: string,
    actionName: string,
    remarks?: string,
    userId?: string,
    extraData?: any,
  ) {
    const inspection = await this.prisma.qCInspection.findUnique({
      where: { id },
      include: {
        workflowState: true,
        workOrder: {
          include: {
            salesOrderItem: true,
            productionPlan: {
              include: {
                workflowState: true,
                salesOrder: { include: { customer: true } },
                workOrders: {
                  include: {
                    qcInspections: { include: { workflowState: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!inspection) throw new NotFoundException('QC Inspection not found');

    const inspectionResult = await this.prisma.$transaction(async (tx) => {

      if (
        extraData?.expectedVersion &&
        inspection.version !== extraData.expectedVersion
      ) {
        throw new ConflictException(
          'Concurrency Error: The record has been modified by another user. Please refresh and try again.',
        );
      }

      let currentStateId = inspection.workflowStateId!;
      if (
        actionName === 'APPROVE' &&
        inspection.workflowState?.code === 'PENDING'
      ) {
        const startResult = await this.workflowService.processAction(
          {
            entityId: id,
            entityType: 'QC_INSPECTION',
            workflowCode: 'QC_INSPECTION',
            currentStateId: currentStateId,
            actionName: 'START',
            userId: userId || 'SYSTEM',
            remarks: 'Auto-started for immediate approval',
          },
          tx,
        );
        currentStateId = startResult.nextStateId;
        await tx.qCInspection.update({
          where: { id },
          data: { workflowStateId: currentStateId },
        });
      }

      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'QC_INSPECTION',
          workflowCode: 'QC_INSPECTION',
          currentStateId,
          actionName,
          userId: userId || 'SYSTEM',
          remarks,
        },
        tx,
      );

      const updateData: any = {
        workflowStateId: result.nextStateId,
      };

      if (actionName === 'APPROVE') {
        const wo = await tx.workOrder.findUnique({
          where: { id: inspection.workOrderId },
        });
        if (wo?.completedById === userId) {
          if (extraData?.overrideSod) {
            if (!remarks?.trim()) {
              throw new BadRequestException(
                'Remarks are mandatory when overriding Segregation of Duties',
              );
            }
          } else {
            throw new ConflictException(
              'Segregation of Duties: You cannot approve QC for a Work Order you completed. Override permission required.',
            );
          }
        }
        updateData.status = 'APPROVED';
        updateData.approvedAt = new Date();
        updateData.inspectorId = userId || 'SYSTEM';
        if (extraData?.approvedQuantity !== undefined)
          updateData.approvedQuantity = extraData.approvedQuantity;
        if (extraData?.rejectedQuantity !== undefined)
          updateData.rejectedQuantity = extraData.rejectedQuantity;
        if (remarks) updateData.remarks = remarks;

        // Move WorkOrder to QC_APPROVED status as part of QC Approval
        await tx.workOrder.update({
          where: { id: inspection.workOrderId },
          data: {
            status: 'QC_APPROVED',
            productionStatus: 'READY_FOR_DISPATCH',
            qcResult: 'PASS',
            qcRemarks: remarks ?? null,
            qcTimestamp: new Date(),
            qcCheckedById: userId || 'SYSTEM',
          },
        });
      } else if (actionName === 'REJECT') {
        updateData.status = 'FAILED';
      } else if (actionName === 'REWORK') {
        updateData.status = 'REWORK';
      }

      updateData.version = { increment: 1 };

      const updated = await tx.qCInspection.update({
        where: { id, version: inspection.version },
        data: updateData,
      });

      if (actionName === 'APPROVE') {
        const orderItem = inspection.workOrder.salesOrderItem;
        if (!orderItem)
          throw new NotFoundException(
            'Work order is not linked to a sales-order item',
          );
        const companyId =
          inspection.workOrder.productionPlan.salesOrder.customer.companyId;
        let warehouse = await tx.warehouse.findFirst({
          where: { companyId, name: 'Finished Goods' },
        });
        if (!warehouse) {
          warehouse = await tx.warehouse.create({
            data: { companyId, name: 'Finished Goods', location: 'Production' },
          });
        }
        const product = await tx.product.findUnique({
          where: { id: orderItem.productId },
        });
        const productUnit = product?.unit || 'PCS';

        const existingReceipt = await tx.inventoryTransaction.findFirst({
          where: { referenceType: 'QCInspection', referenceId: id, type: 'IN' },
        });
        if (!existingReceipt) {
          await tx.inventoryTransaction.create({
            data: {
              companyId,
              productId: orderItem.productId,
              warehouseId: warehouse.id,
              type: 'IN',
              quantity: inspection.workOrder.quantity,
              referenceType: 'QCInspection',
              referenceId: id,
            },
          });
        }
        await tx.finishedGoods.upsert({
          where: { workOrderId: inspection.workOrderId },
          create: {
            workOrderId: inspection.workOrderId,
            productId: orderItem.productId,
            salesOrderId: inspection.workOrder.productionPlan?.salesOrderId || '',
            quantity: inspection.workOrder.quantity,
            availableQuantity: inspection.workOrder.quantity,
            unit: productUnit,
            status: 'AVAILABLE',
            receivedAt: new Date(),
            receivedById: userId || 'SYSTEM',
          },
          update: {
            quantity: inspection.workOrder.quantity,
            availableQuantity: inspection.workOrder.quantity,
            unit: productUnit,
            status: 'AVAILABLE',
            receivedAt: new Date(),
            receivedById: userId || 'SYSTEM',
          },
        });


        const planId = inspection.workOrder.productionPlanId;
        const planWorkOrders = await tx.workOrder.findMany({
          where: { productionPlanId: planId },
          include: { qcInspections: { include: { workflowState: true } } },
        });
        const allApproved =
          planWorkOrders.length > 0 &&
          planWorkOrders.every((workOrder) =>
            workOrder.qcInspections.some(
              (qc) => qc.id === id || qc.workflowState?.code === 'APPROVED',
            ),
          );
        if (allApproved) {
          const plan = await tx.productionPlan.findUnique({
            where: { id: planId },
            include: { workflowState: true },
          });
          if (plan?.workflowState?.code === 'RELEASED') {
            const started = await this.workflowService.processAction(
              {
                entityId: plan.id,
                entityType: 'PRODUCTION_PLAN',
                workflowCode: 'PRODUCTION_PLAN',
                currentStateId: plan.workflowStateId!,
                actionName: 'START',
                userId: userId || 'SYSTEM',
                remarks: 'Automatically started from released work orders',
              },
              tx,
            );
            const completed = await this.workflowService.processAction(
              {
                entityId: plan.id,
                entityType: 'PRODUCTION_PLAN',
                workflowCode: 'PRODUCTION_PLAN',
                currentStateId: started.nextStateId,
                actionName: 'COMPLETE',
                userId: userId || 'SYSTEM',
                remarks:
                  'Automatically completed after all work orders passed QC',
              },
              tx,
            );
            await tx.productionPlan.update({
              where: { id: plan.id },
              data: {
                workflowStateId: completed.nextStateId,
                status: 'COMPLETED',
              },
            });
          }
        }
      }

      return updated;
    });

    // Notify Production / Plant Head post-commit
    const companyId = inspection?.workOrder?.productionPlan?.salesOrder?.customer?.companyId;
    const woNumber = inspection?.workOrder?.workOrderNumber || id;
    if (companyId && this.notificationsService) {
      if (actionName === 'APPROVE') {
        // Notify Production Manager/Planner
        await this.notificationsService.notifyRole({
          companyId,
          role: 'PRODUCTION_PLANNER',
          type: 'QC_PASSED',
          title: 'QC Passed',
          message: `${woNumber} — Quality inspection passed successfully.`,
          route: '/production/work-orders',
          entityType: 'QCInspection',
          entityId: id,
          eventKeyPrefix: `QC_INSPECTION:${id}:PASSED_PM`,
        }).catch(() => { });

        // Notify Plant Head
        await this.notificationsService.notifyRole({
          companyId,
          role: 'PLANT_HEAD',
          type: 'QC_PASSED',
          title: 'QC Passed',
          message: `${woNumber} — Quality inspection passed successfully.`,
          route: '/plant-head/planning',
          entityType: 'QCInspection',
          entityId: id,
          eventKeyPrefix: `QC_INSPECTION:${id}:PASSED_PH`,
        }).catch(() => { });
      } else if (actionName === 'REJECT') {
        // Notify Production Manager/Planner
        await this.notificationsService.notifyRole({
          companyId,
          role: 'PRODUCTION_PLANNER',
          type: 'QC_FAILED',
          title: 'QC Failed — Rework Required',
          message: `${woNumber} — Quality inspection failed and requires rework.`,
          route: '/production/rework',
          entityType: 'QCInspection',
          entityId: id,
          eventKeyPrefix: `QC_INSPECTION:${id}:FAILED_PM`,
        }).catch(() => { });

        // Notify Plant Head
        await this.notificationsService.notifyRole({
          companyId,
          role: 'PLANT_HEAD',
          type: 'QC_FAILED',
          title: 'QC Failed — Rework Required',
          message: `${woNumber} — Quality inspection failed and requires rework.`,
          route: '/plant-head/qc-failures',
          entityType: 'QCInspection',
          entityId: id,
          eventKeyPrefix: `QC_INSPECTION:${id}:FAILED_PH`,
        }).catch(() => { });
      }
    }

    return inspectionResult;
  }
}
