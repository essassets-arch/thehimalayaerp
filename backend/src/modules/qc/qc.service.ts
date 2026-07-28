import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class QcService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService
  ) {}

  async listInspections() {
    return this.prisma.qCInspection.findMany({
      include: {
        workOrder: {
          include: { productionPlan: { include: { salesOrder: { include: { customer: true } } } } }
        },
        workflowState: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getInspection(id: string) {
    const inspection = await this.prisma.qCInspection.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: { productionPlan: { include: { salesOrder: { include: { items: true, customer: true } } } }, productionBatches: true }
        },
        workflowState: true
      }
    });
    if (!inspection) throw new NotFoundException('QC Inspection not found');
    return inspection;
  }

  async processAction(id: string, actionName: string, remarks?: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
    const inspection = await tx.qCInspection.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            salesOrderItem: true,
            productionPlan: {
              include: {
                workflowState: true,
                salesOrder: { include: { customer: true } },
                workOrders: { include: { qcInspections: { include: { workflowState: true } } } },
              },
            },
          },
        },
      },
    });
    if (!inspection) throw new NotFoundException('QC Inspection not found');

    const result = await this.workflowService.processAction({
      entityId: id,
      entityType: 'QC_INSPECTION',
      workflowCode: 'QC_INSPECTION',
      currentStateId: inspection.workflowStateId!,
      actionName,
      userId: userId || 'SYSTEM',
      remarks
    }, tx);

    const updated = await tx.qCInspection.update({
      where: { id },
      data: {
        workflowStateId: result.nextStateId,
        status: actionName === 'APPROVE'
          ? 'APPROVED'
          : actionName === 'REJECT'
            ? 'FAILED'
            : actionName === 'REWORK'
              ? 'REWORK'
              : undefined,
      }
    });

    if (actionName === 'APPROVE') {
      const orderItem = inspection.workOrder.salesOrderItem;
      if (!orderItem) throw new NotFoundException('Work order is not linked to a sales-order item');
      const companyId = inspection.workOrder.productionPlan.salesOrder.customer.companyId;
      let warehouse = await tx.warehouse.findFirst({
        where: { companyId, name: 'Finished Goods' },
      });
      if (!warehouse) {
        warehouse = await tx.warehouse.create({
          data: { companyId, name: 'Finished Goods', location: 'Production' },
        });
      }
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
      const planId = inspection.workOrder.productionPlanId;
      const planWorkOrders = await tx.workOrder.findMany({
        where: { productionPlanId: planId },
        include: { qcInspections: { include: { workflowState: true } } },
      });
      const allApproved = planWorkOrders.length > 0 && planWorkOrders.every(
        (workOrder) => workOrder.qcInspections.some(
          (qc) => qc.id === id || qc.workflowState?.code === 'APPROVED',
        ),
      );
      if (allApproved) {
        const plan = await tx.productionPlan.findUnique({
          where: { id: planId },
          include: { workflowState: true },
        });
        if (plan?.workflowState?.code === 'RELEASED') {
          const started = await this.workflowService.processAction({
            entityId: plan.id,
            entityType: 'PRODUCTION_PLAN',
            workflowCode: 'PRODUCTION_PLAN',
            currentStateId: plan.workflowStateId!,
            actionName: 'START',
            userId: userId || 'SYSTEM',
            remarks: 'Automatically started from released work orders',
          }, tx);
          const completed = await this.workflowService.processAction({
            entityId: plan.id,
            entityType: 'PRODUCTION_PLAN',
            workflowCode: 'PRODUCTION_PLAN',
            currentStateId: started.nextStateId,
            actionName: 'COMPLETE',
            userId: userId || 'SYSTEM',
            remarks: 'Automatically completed after all work orders passed QC',
          }, tx);
          await tx.productionPlan.update({
            where: { id: plan.id },
            data: { workflowStateId: completed.nextStateId, status: 'COMPLETED' },
          });
        }
      }
    }

    return updated;
    });
  }
}
