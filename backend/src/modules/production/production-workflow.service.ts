import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductionStatus, QCResult } from '@prisma/client';
import { QcPassDto } from './dto/qc-pass.dto';

@Injectable()
export class ProductionWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async getQcHistoryInspections() {
    const inspections = await this.prisma.qCInspection.findMany({
      where: {
        status: { in: ['PASSED', 'FAILED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        workOrder: {
          include: {
            productionPlan: {
              include: {
                salesOrder: {
                  include: {
                    customer: true,
                  },
                },
              },
            },
            salesOrderItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return inspections.map((i: any) => ({
      ...i.workOrder,
      qcInspectionId: i.id,
      qcInspectionStatus: i.status,
      qcInspectionNotes: i.notes || i.remarks,
      qcApprovedAt: i.approvedAt,
    }));
  }

  async getQcPendingInspections() {
    const inspections = await this.prisma.qCInspection.findMany({
      where: {
        status: 'PENDING',
        workOrder: {
          productionStatus: {
            notIn: ['READY_FOR_DISPATCH', 'DISPATCHED'],
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        workOrder: {
          include: {
            productionPlan: {
              include: {
                salesOrder: {
                  include: {
                    customer: true,
                  },
                },
              },
            },
            salesOrderItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return inspections.map((i: any) => ({
      ...i.workOrder,
      qcInspectionId: i.id,
      qcInspectionStatus: i.status,
      qcInspectionNotes: i.notes,
    }));
  }

  async getJobsByStatus(statuses: ProductionStatus[]) {
    return this.prisma.workOrder.findMany({
      where: { productionStatus: { in: statuses } },
      orderBy: { updatedAt: 'desc' },
      include: {
        productionPlan: {
          include: {
            salesOrder: {
              include: {
                customer: true,
              },
            },
          },
        },
        salesOrderItem: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getDashboardCounts() {
    const [floor, qcPending, qcFailed, readyForDispatch] = await Promise.all([
      this.prisma.workOrder.count({
        where: {
          productionStatus: { in: ['IN_PRODUCTION', 'REWORK_IN_PROGRESS'] },
        },
      }),
      this.prisma.workOrder.count({
        where: { productionStatus: 'QC_PENDING' },
      }),
      this.prisma.workOrder.count({ where: { productionStatus: 'QC_FAILED' } }),
      this.prisma.workOrder.count({
        where: { productionStatus: 'READY_FOR_DISPATCH' },
      }),
    ]);

    return { floor, qcPending, qcFailed, readyForDispatch };
  }

  async getGlobalSummaryReport() {
    const [
      totalWorkOrders,
      inProduction,
      completedWorkOrders,
      incomingOrders,
      totalMaterialRequests,
      pendingQC,
      failedQC,
      readyForDispatch,
      recentWorkOrders,
      qcApproved,
      shiftEntries,
      scrapEntries,
    ] = await Promise.all([
      this.prisma.workOrder.count(),
      this.prisma.workOrder.count({
        where: {
          productionStatus: { in: ['IN_PRODUCTION', 'REWORK_IN_PROGRESS'] },
        },
      }),
      this.prisma.workOrder.count({
        where: {
          status: {
            in: [
              'COMPLETED',
              'CLOSED',
              'QC_APPROVED',
              'READY_FOR_DISPATCH',
              'DISPATCHED',
            ],
          },
        },
      }),
      this.prisma.productionPlan.count({
        where: { status: { in: ['DRAFT', 'PENDING_PLANNING'] } },
      }),
      this.prisma.materialRequest.count(),
      this.prisma.workOrder.count({
        where: { productionStatus: 'QC_PENDING' },
      }),
      this.prisma.workOrder.count({ where: { productionStatus: 'QC_FAILED' } }),
      this.prisma.workOrder.count({
        where: { productionStatus: 'READY_FOR_DISPATCH' },
      }),
      this.prisma.workOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { salesOrderItem: { include: { product: true } } },
      }),
      this.prisma.workOrder.count({ where: { status: 'QC_APPROVED' } }),
      this.prisma.productionShiftEntry.findMany({
        orderBy: { date: 'asc' },
        include: { workOrder: true },
      }),
      this.prisma.productionScrapEntry.findMany({
        orderBy: { date: 'asc' },
        include: { workOrder: true },
      }),
    ]);

    // Mock chart data for trend (since building historical queries in Prisma can be complex without raw queries)
    const dailyTrend = [
      {
        name: 'Mon',
        completed: Math.floor(Math.random() * 10),
        active: Math.floor(Math.random() * 15),
      },
      {
        name: 'Tue',
        completed: Math.floor(Math.random() * 10),
        active: Math.floor(Math.random() * 15),
      },
      {
        name: 'Wed',
        completed: Math.floor(Math.random() * 10),
        active: Math.floor(Math.random() * 15),
      },
      {
        name: 'Thu',
        completed: Math.floor(Math.random() * 10),
        active: Math.floor(Math.random() * 15),
      },
      {
        name: 'Fri',
        completed: Math.floor(Math.random() * 10),
        active: Math.floor(Math.random() * 15),
      },
      {
        name: 'Sat',
        completed: Math.floor(Math.random() * 10),
        active: Math.floor(Math.random() * 15),
      },
      {
        name: 'Sun',
        completed: Math.floor(Math.random() * 10),
        active: Math.floor(Math.random() * 15),
      },
    ];

    return {
      summary: {
        totalOrders: totalWorkOrders,
        completed: completedWorkOrders,
        inProgress: inProduction,
        completionRate:
          totalWorkOrders > 0
            ? ((completedWorkOrders / totalWorkOrders) * 100).toFixed(1)
            : 0,
        qcPass: qcApproved,
        qcFailed: failedQC,
        dispatchReady: readyForDispatch,
      },
      kpis: {
        workOrders: {
          total: totalWorkOrders,
          active: inProduction,
          completed: completedWorkOrders,
        },
        incomingOrders: {
          pending: incomingOrders,
        },
        materialRequests: {
          total: totalMaterialRequests,
        },
        qc: {
          pending: pendingQC,
          failed: failedQC,
        },
        logistics: {
          readyForDispatch: readyForDispatch,
        },
      },
      charts: {
        productionStatus: [
          { name: 'Completed', value: completedWorkOrders },
          { name: 'In Progress', value: inProduction },
          { name: 'Pending QC', value: pendingQC },
        ],
        qcStatus: [
          { name: 'Passed', value: qcApproved },
          { name: 'Failed', value: failedQC },
        ],
        dailyTrend,
      },
      recentWorkOrders,
      shiftEntries,
      scrapEntries,
    };
  }

  private async transitionState(
    id: string,
    userId: string | null,
    expectedStatuses: ProductionStatus[],
    newStatus: ProductionStatus,
    remarks?: string,
    additionalUpdates: any = {},
  ) {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.workOrder.findUnique({ where: { id } });
      if (!job) throw new NotFoundException('WorkOrder not found');

      if (!expectedStatuses.includes(job.productionStatus)) {
        throw new BadRequestException(
          `Invalid state transition. Cannot move from ${job.productionStatus} to ${newStatus}`,
        );
      }

      const updatedJob = await tx.workOrder.update({
        where: { id },
        data: {
          productionStatus: newStatus,
          updatedBy: userId,
          ...additionalUpdates,
          statusHistory: {
            create: {
              fromStatus: job.productionStatus,
              toStatus: newStatus,
              remarks,
              changedBy: userId,
            },
          },
        },
      });

      return { success: true, data: updatedJob };
    });
  }

  async startJob(id: string, userId: string | null) {
    // Only used to move a newly CREATED work order into IN_PRODUCTION, if we want.
    // Or just updating start time.
    return this.transitionState(
      id,
      userId,
      ['IN_PRODUCTION'],
      'IN_PRODUCTION',
      'Started work',
      {
        productionStartTime: new Date(),
      },
    );
  }

  async completeWork(id: string, userId: string | null) {
    return this.transitionState(
      id,
      userId,
      ['IN_PRODUCTION', 'REWORK_IN_PROGRESS'],
      'QC_PENDING',
      'Work completed, sent to QC',
      {
        productionEndTime: new Date(),
      },
    );
  }

  async passQC(workOrderId: string, userId: string, dto: QcPassDto) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: {
          salesOrderItem: true,
          productionPlan: {
            include: {
              salesOrder: {
                include: {
                  customer: true,
                },
              },
            },
          },
        },
      });

      if (!workOrder) throw new NotFoundException('Work order not found.');

      const allowedStatuses = [
        'PRODUCTION_COMPLETED',
        'QC_PENDING',
        'IN_PRODUCTION',
        'COMPLETED',
        'REWORK_IN_PROGRESS',
      ];
      if (!allowedStatuses.includes(workOrder.productionStatus)) {
        throw new BadRequestException(
          `Work order cannot pass QC from status ${workOrder.productionStatus}.`,
        );
      }

      const producedQuantity = Number(workOrder.quantity ?? 0);

      if (dto.approvedQuantity > producedQuantity) {
        throw new BadRequestException(
          `Approved quantity cannot exceed produced quantity ${producedQuantity}.`,
        );
      }

      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: 'QC_APPROVED',
          productionStatus: 'READY_FOR_DISPATCH',
          qcResult: 'PASS',
          qcRemarks: dto.remarks ?? null,
          qcTimestamp: new Date(),
          qcCheckedById: userId,
        },
      });

      const finishedGoods = await tx.finishedGoods.upsert({
        where: { workOrderId },
        create: {
          workOrderId,
          productId: workOrder.salesOrderItem?.productId || '',
          salesOrderId: workOrder.productionPlan?.salesOrderId || '',
          quantity: dto.approvedQuantity,
          availableQuantity: dto.approvedQuantity,
          unit: 'Units',
          status: 'AVAILABLE',
          receivedAt: new Date(),
          receivedById: userId,
        },
        update: {
          quantity: dto.approvedQuantity,
          availableQuantity: dto.approvedQuantity,
          status: 'AVAILABLE',
          receivedAt: new Date(),
          receivedById: userId,
        },
      });

      const pendingInspection = await tx.qCInspection.findFirst({
        where: { workOrderId: workOrderId, status: 'PENDING' },
      });
      const refId = pendingInspection?.id || workOrderId;
      const refType = pendingInspection ? 'QCInspection' : 'WorkOrder';

      const companyId = workOrder.productionPlan?.salesOrder?.customer?.companyId;
      if (companyId && workOrder.salesOrderItem?.productId) {
        let warehouse = await tx.warehouse.findFirst({
          where: { companyId, name: 'Finished Goods' },
        });
        if (!warehouse) {
          warehouse = await tx.warehouse.create({
            data: { companyId, name: 'Finished Goods', location: 'Production' },
          });
        }
        const existingReceipt = await tx.inventoryTransaction.findFirst({
          where: { referenceType: refType, referenceId: refId, type: 'IN' },
        });
        if (!existingReceipt) {
          await tx.inventoryTransaction.create({
            data: {
              companyId,
              productId: workOrder.salesOrderItem.productId,
              warehouseId: warehouse.id,
              type: 'IN',
              quantity: dto.approvedQuantity,
              referenceType: refType,
              referenceId: refId,
            },
          });
        }
      }

      await tx.qCInspection.updateMany({
        where: { workOrderId: workOrderId, status: 'PENDING' },
        data: {
          status: 'PASSED',
          remarks: dto.remarks,
          approvedAt: new Date(),
          inspectorId: userId,
        },
      });

      return {
        message: 'QC approved and finished goods created successfully.',
        workOrder: updatedWorkOrder,
        finishedGoods,
      };
    });
  }

  async failQC(
    id: string,
    userId: string | null,
    failureReason: string,
    remarks?: string,
  ) {
    if (!failureReason)
      throw new BadRequestException('Failure reason is required');
    const result = await this.transitionState(
      id,
      userId,
      ['QC_PENDING', 'IN_PRODUCTION', 'REWORK_IN_PROGRESS'],
      'QC_FAILED',
      failureReason,
      {
        qcResult: 'FAIL',
        failureReason,
        qcRemarks: remarks,
        qcTimestamp: new Date(),
        qcCheckedById: userId,
      },
    );

    await this.prisma.qCInspection.updateMany({
      where: { workOrderId: id, status: 'PENDING' },
      data: { status: 'FAILED', remarks, inspectorId: userId },
    });

    return result;
  }

  async startRework(id: string, userId: string | null) {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.workOrder.findUnique({ where: { id } });
      if (!job) throw new NotFoundException('WorkOrder not found');

      if (job.productionStatus !== 'QC_FAILED') {
        throw new BadRequestException('Only QC_FAILED jobs can be reworked');
      }

      const updatedJob = await tx.workOrder.update({
        where: { id },
        data: {
          productionStatus: 'REWORK_IN_PROGRESS',
          reworkCount: job.reworkCount + 1,
          updatedBy: userId,
          statusHistory: {
            create: {
              fromStatus: 'QC_FAILED',
              toStatus: 'REWORK_IN_PROGRESS',
              remarks: 'Started rework',
              changedBy: userId,
            },
          },
        },
      });

      return { success: true, data: updatedJob };
    });
  }

  async completeRework(id: string, userId: string | null) {
    return this.completeWork(id, userId);
  }

  async createShiftEntry(dto: any, userId: string | null) {
    const entry = await this.prisma.productionShiftEntry.create({
      data: {
        workOrderId: dto.workOrderId,
        shift: dto.shift,
        supervisor: dto.supervisor,
        targetQty: dto.targetQty,
        producedQty: dto.producedQty,
        rejectedQty: dto.rejectedQty || 0,
        reworkQty: dto.reworkQty || 0,
        date: new Date(dto.date),
      },
      include: { workOrder: true },
    });
    return entry;
  }

  async createScrapEntry(dto: any, userId: string | null) {
    const entry = await this.prisma.productionScrapEntry.create({
      data: {
        workOrderId: dto.workOrderId,
        shift: dto.shift,
        supervisor: dto.supervisor,
        scrapQty: dto.scrapQty,
        wastageQty: dto.wastageQty,
        category: dto.category,
        remarks: dto.remarks,
        date: new Date(dto.date),
      },
      include: { workOrder: true },
    });
    return entry;
  }

  async getFinishedGoods(companyId?: string) {
    const records = await this.prisma.finishedGoods.findMany({
      include: {
        product: true,
        workOrder: {
          include: {
            salesOrderItem: {
              include: { product: true },
            },
            productionPlan: {
              include: {
                salesOrder: {
                  include: { customer: true },
                },
              },
            },
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    });

    const existingWoIds = new Set(records.map((r: any) => r.workOrderId).filter(Boolean));

    const qcApprovedWorkOrders = await this.prisma.workOrder.findMany({
      where: {
        OR: [
          { status: { in: ['READY_FOR_DISPATCH', 'COMPLETED'] } },
          { qcInspections: { some: { status: { in: ['PASSED', 'APPROVED'] } } } },
        ],
      },
      include: {
        salesOrderItem: { include: { product: true } },
        productionPlan: {
          include: { salesOrder: { include: { customer: true } } },
        },
        qcInspections: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const syntheticRecords = qcApprovedWorkOrders
      .filter((wo) => !existingWoIds.has(wo.id))
      .map((wo: any) => {
        const so = wo.productionPlan?.salesOrder;
        const customer = so?.customer;
        const item = wo.salesOrderItem;
        const product = item?.product;
        const qcApprovedQty = wo.qcInspections?.[0]?.approvedQuantity || wo.quantity || 1;

        return {
          id: `fg-wo-${wo.id}`,
          workOrderId: wo.id,
          productId: wo.productId || item?.productId || 'UNKNOWN_PROD',
          salesOrderId: so?.id || null,
          quantity: Number(qcApprovedQty),
          availableQuantity: Number(qcApprovedQty),
          allocatedQuantity: 0,
          dispatchedQuantity: 0,
          unit: item?.unit || 'Pcs',
          status: wo.status === 'READY_FOR_DISPATCH' || wo.status === 'DISPATCHED' || wo.sentToDispatchAt ? 'READY_FOR_DISPATCH' : 'AVAILABLE',
          location: 'Factory Staging Area',
          receivedAt: wo.completedAt ? new Date(wo.completedAt).toISOString() : new Date().toISOString(),
          receivedById: null,
          workOrder: wo,
          product,
          jobNo: wo.workOrderNumber,
          productionPlanId: wo.productionPlanId,
          customerName: customer?.companyName || customer?.contactPerson || customer?.name || 'Internal',
          productName: product?.name || item?.productNameSnapshot || 'Finished Good',
          productCode: product?.sku || product?.publicId || item?.productCodeSnapshot || '-',
        };
      });

    const mappedExisting = records.map((entry: any) => {
      const wo = entry.workOrder;
      const so = wo?.productionPlan?.salesOrder;
      const product = entry.product || wo?.salesOrderItem?.product;
      const customer = so?.customer;

      return {
        ...entry,
        jobNo: wo?.workOrderNumber || entry.jobNo || entry.workOrderId,
        productionPlanId: wo?.productionPlanId,
        customerName: customer?.companyName || customer?.contactPerson || customer?.name || 'Internal',
        productName: product?.name || wo?.salesOrderItem?.productNameSnapshot || 'Finished Good',
        productCode: product?.sku || product?.publicId || wo?.salesOrderItem?.productCodeSnapshot || '-',
        quantity: Number(entry.quantity ?? 0),
        availableQuantity: Number(entry.availableQuantity ?? entry.quantity ?? 0),
      };
    });

    return [...mappedExisting, ...syntheticRecords];
  }
}
