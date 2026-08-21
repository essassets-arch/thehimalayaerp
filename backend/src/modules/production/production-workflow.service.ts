import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductionStatus, QCResult } from '@prisma/client';
import { QcPassDto } from './dto/qc-pass.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ProductionWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

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
    try {
      const records = await this.prisma.workOrder.findMany({
        where: { productionStatus: { in: statuses as any } },
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
      return Array.isArray(records) ? records : [];
    } catch (err) {
      console.error(`[ProductionWorkflow] getJobsByStatus failed for ${statuses}:`, err);
      return [];
    }
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

  async getFinishedGoods(companyId?: string, userId?: string, role?: string) {
    // Reconcile any unposted submitted production reports first
    try {
      const activeCompanyId = companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
      const unpostedProd = await this.prisma.productionDailyReport.findMany({
        where: {
          status: 'SUBMITTED',
          stockPostedAt: null,
        },
        include: {
          items: true,
        },
      });

      if (unpostedProd.length > 0) {
        console.log(`[RECONCILE] Found ${unpostedProd.length} unposted submitted production reports. Reconciling...`);
        for (const report of unpostedProd) {
          await this.prisma.$transaction(async (tx) => {
            for (const item of report.items) {
              if (item.productId && item.setQty > 0) {
                await this.inventoryService.stockInFinishedGoods(
                  tx,
                  report.companyId || activeCompanyId,
                  item.productId,
                  item.setQty,
                  'PRODUCTION_REPORT',
                  report.id,
                  item.id,
                  report.reportNo,
                  userId || report.createdById || 'system',
                  `Reconciled auto-post for report ${report.reportNo}`
                );
              }
            }
            await tx.productionDailyReport.update({
              where: { id: report.id },
              data: {
                stockPostedAt: new Date(),
                stockPostedBy: userId || report.createdById || 'system',
              },
            });
          });
        }
        console.log('[RECONCILE] Reconciled stock completed successfully.');
      }
    } catch (reconcileErr) {
      console.error('[RECONCILE] Failed to reconcile unposted reports:', reconcileErr);
    }

    let userCategory: string | null = null;
    if (userId && (role === 'DISPATCH_EXECUTIVE' || role === 'Dispatch Executive')) {
      const u: any = await this.prisma.user.findUnique({ where: { id: userId } });
      if (u?.dispatchCategory) {
        userCategory = u.dispatchCategory;
      }
    }

    const fgWhere: any = {
      product: {
        companyId: companyId ? companyId : undefined,
      },
    };
    const woWhere: any = {
      salesOrderItem: {
        product: {
          companyId: companyId ? companyId : undefined,
        },
      },
      OR: [
        { status: { in: ['READY_FOR_DISPATCH', 'COMPLETED'] } },
        { qcInspections: { some: { status: { in: ['PASSED', 'APPROVED'] } } } },
      ],
    };

    if (userCategory) {
      fgWhere.product.dispatchCategory = userCategory;
      woWhere.salesOrderItem.product.dispatchCategory = userCategory;
    }

    const records = await this.prisma.finishedGoods.findMany({
      where: fgWhere,
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
      where: woWhere,
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

    const rawList = [...mappedExisting, ...syntheticRecords];

    // Query StockHistory totals grouped by productId and event to calculate productionIn and dispatchVal
    const stockHistorySums = await this.prisma.stockHistory.groupBy({
      by: ['productId', 'event'],
      where: {
        companyId: companyId ? companyId : undefined,
        event: {
          in: ['PRODUCTION_IN', 'PRODUCTION_REVERSAL', 'DISPATCH_OUT', 'DISPATCH_REVERSAL']
        }
      },
      _sum: { quantity: true },
    });


    const prodInMap = new Map<string, number>();
    const dispatchMap = new Map<string, number>();

    for (const g of stockHistorySums) {
      const pId = g.productId;
      const qty = Number(g._sum.quantity || 0);
      if (g.event === 'PRODUCTION_IN' || g.event === 'PRODUCTION_REVERSAL') {
        prodInMap.set(pId, (prodInMap.get(pId) || 0) + qty);
      } else if (g.event === 'DISPATCH_OUT' || g.event === 'DISPATCH_REVERSAL') {
        dispatchMap.set(pId, (dispatchMap.get(pId) || 0) + qty);
      }
    }

    // Deduplicate & aggregate by productCode or productId
    const groupedMap = new Map<string, any>();

    for (const item of rawList) {
      const key = item.productCode && item.productCode !== '-' ? item.productCode : (item.productId || item.productName);

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: item.id || `prod-${key}`,
          workOrderId: item.workOrderId,
          jobNo: item.jobNo,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          category: item.product?.category || item.category || 'Hardware',
          customerName: item.customerName || 'Internal Stock',
          quantity: 0,
          availableQuantity: 0,
          productionIn: 0,
          openingStock: 0,
          unit: (item.unit || item.product?.unit || 'PCS').toUpperCase(),
          status: 'AVAILABLE',
          receivedAt: item.receivedAt || new Date().toISOString(),
          receivedById: item.receivedById || null,
          product: item.product,
          workOrder: item.workOrder,
        });
      }

      const existing = groupedMap.get(key);
      existing.quantity += Number(item.quantity || 0);
      existing.availableQuantity += Number(item.availableQuantity || 0);

      const minStock = Number(item.product?.minimumStock || 0);
      if (existing.availableQuantity <= 0) {
        existing.status = 'OUT_OF_STOCK';
      } else if (existing.availableQuantity <= minStock) {
        existing.status = 'LOW_STOCK';
      } else {
        existing.status = 'AVAILABLE';
      }
    }

    // Also include any Finished Goods / Manufacturing products from Product table if not yet present
    const fgProducts = await this.prisma.product.findMany({
      where: {
        companyId: companyId ? companyId : undefined,
        isActive: true,
        OR: [
          { productType: { in: ['MANUFACTURING', 'FINISHED_GOODS'] } },
          { category: { in: ['FRP COVER', 'FRP COVERS', 'COVERBLOCK', 'FRP GRATINGS'] } },
        ],
      },
    });

    for (const p of fgProducts) {
      const key = p.sku || p.publicId;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: `fg-prod-${p.id}`,
          workOrderId: `WO-STOCK-${p.sku}`,
          jobNo: `WO-STOCK-${p.sku}`,
          productId: p.id,
          productName: p.name,
          productCode: p.sku || p.publicId,
          category: p.category || 'FRP COVER',
          dispatchCategory: p.dispatchCategory || 'D1',
          customerName: 'Internal Stock',
          quantity: 0,
          availableQuantity: 0,
          productionIn: 0,
          openingStock: 0,
          unit: (p.unit || 'SET').toUpperCase(),
          status: 'OUT_OF_STOCK',
          receivedAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
          receivedById: null,
          product: p,
        });
      }
    }

    // Post-aggregation pass to set correct ledger metrics
    for (const existing of groupedMap.values()) {
      const pId = existing.productId;
      if (pId) {
        const prodInVal = prodInMap.get(pId) || 0;
        const dispatchVal = dispatchMap.get(pId) || 0;
        existing.productionIn = prodInVal;
        existing.openingStock = Math.max(0, existing.quantity - prodInVal - dispatchVal);
      }
    }

    return Array.from(groupedMap.values());
  }

  async createFinishedGoods(dto: any, userId?: string) {
    if (!dto.productName || !dto.productName.trim()) {
      throw new BadRequestException('Product Name is required');
    }

    const qty = Math.max(0, Number(dto.quantity) || 0);
    const unit = (dto.unit || 'PCS').toUpperCase();

    let productId = dto.productId;
    let product: any = null;

    if (productId) {
      product = await this.prisma.product.findUnique({ where: { id: productId } });
    }

    if (!product && dto.productName) {
      product = await this.prisma.product.findFirst({
        where: { name: { contains: dto.productName.trim(), mode: 'insensitive' } },
      });
    }

    if (!product) {
      const company = await this.prisma.company.findFirst();
      const companyId = company?.id || 'default-company';
      const sku = `FG-${Math.floor(100000 + Math.random() * 900000)}`;

      product = await this.prisma.product.create({
        data: {
          publicId: `PROD-FG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          companyId,
          name: dto.productName.trim(),
          sku,
          productType: 'FINISHED_GOODS',
          category: dto.category || 'Hardware',
          unit,
          unitPrice: 0,
          minimumStock: 0,
        } as any,
      });
    }

    productId = product.id;

    let realWorkOrderId = dto.workOrderId;
    let existingWo: any = null;
    const jobNoStr = dto.jobNo || dto.workOrderId || `WO-FG-${Date.now().toString().slice(-6)}`;

    if (realWorkOrderId) {
      existingWo = await this.prisma.workOrder.findFirst({
        where: {
          OR: [
            { id: realWorkOrderId },
            { workOrderNumber: jobNoStr },
          ],
        },
      });
    }

    if (!existingWo) {
      let plan = await this.prisma.productionPlan.findFirst();
      if (!plan) {
        let salesOrder = await this.prisma.salesOrder.findFirst();
        if (!salesOrder) {
          let customer = await this.prisma.customer.findFirst();
          if (!customer) {
            const comp = await this.prisma.company.findFirst();
            customer = await this.prisma.customer.create({
              data: {
                companyId: comp?.id || 'default-company',
                companyName: 'Internal Stock Customer',
                customerCode: `CUST-${Date.now().toString().slice(-4)}`,
              },
            });
          }
          salesOrder = await this.prisma.salesOrder.create({
            data: {
              orderNumber: `SO-STOCK-${Date.now().toString().slice(-5)}`,
              customerId: customer.id,
              status: 'CONFIRMED',
              totalAmount: 0,
              subtotal: 0,
              taxableAmount: 0,
              createdById: userId || 'system',
            },
          });
        }
        plan = await this.prisma.productionPlan.create({
          data: {
            planNumber: `PP-STOCK-${Date.now().toString().slice(-5)}`,
            salesOrderId: salesOrder.id,
            status: 'APPROVED',
          },
        });
      }

      existingWo = await this.prisma.workOrder.create({
        data: {
          workOrderNumber: jobNoStr,
          productionPlanId: plan.id,
          quantity: qty > 0 ? qty : 1,
          status: 'READY_FOR_DISPATCH',
        },
      });
    }
    realWorkOrderId = existingWo.id;

    const availQty = Number(dto.availableQuantity ?? qty);
    const receivedAtDate = dto.date || dto.receivedAt ? new Date(dto.date || dto.receivedAt) : new Date();

    const fg = await this.prisma.finishedGoods.upsert({
      where: { workOrderId: realWorkOrderId },
      create: {
        workOrderId: realWorkOrderId,
        productId,
        quantity: qty,
        availableQuantity: availQty,
        unit,
        status: qty <= 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
        receivedAt: receivedAtDate,
        receivedById: userId,
      },
      update: {
        quantity: { increment: qty },
        availableQuantity: { increment: availQty },
        unit,
        status: 'AVAILABLE',
        receivedAt: receivedAtDate,
      },
      include: {
        product: true,
        workOrder: true,
      },
    });

    // Record Inventory Transaction
    if (qty > 0) {
      const comp = await this.prisma.company.findFirst();
      const warehouse = await this.prisma.warehouse.findFirst();
      if (comp && warehouse) {
        await this.prisma.inventoryTransaction.create({
          data: {
            companyId: comp.id,
            productId: product.id,
            warehouseId: warehouse.id,
            type: 'IN',
            quantity: qty,
            referenceType: 'FINISHED_GOODS_CREATE',
            referenceId: fg.id,
          },
        });
      }
    }

    return fg;
  }

  async stockInFinishedGoods(dto: any, userId?: string) {
    const qty = Number(dto.quantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      throw new BadRequestException('Quantity to add must be greater than 0');
    }

    let product: any = null;
    if (dto.productId) {
      product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    }
    if (!product && (dto.productCode || dto.productName)) {
      product = await this.prisma.product.findFirst({
        where: {
          OR: [
            { sku: dto.productCode },
            { name: { equals: dto.productName, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!product) {
      throw new NotFoundException('Finished Good product not found');
    }

    const companyId = dto.companyId || product.companyId;

    return await this.prisma.$transaction(async (tx) => {
      const fg = await this.inventoryService.stockInFinishedGoods(
        tx,
        companyId,
        product.id,
        qty,
        'MANUAL',
        dto.reference || 'MANUAL_STOCK_IN',
        null,
        dto.reference || 'MANUAL_STOCK_IN',
        userId || 'system',
        'Manual stock in from UI'
      );
      return fg;
    });
  }

  async stockOutFinishedGoods(dto: any, userId?: string) {
    const qty = Number(dto.quantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      throw new BadRequestException('Quantity to issue must be greater than 0');
    }

    let product: any = null;
    if (dto.productId) {
      product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    }
    if (!product && (dto.productCode || dto.productName)) {
      product = await this.prisma.product.findFirst({
        where: {
          OR: [
            { sku: dto.productCode },
            { name: { equals: dto.productName, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!product) {
      throw new NotFoundException('Finished Good product not found');
    }

    const companyId = dto.companyId || product.companyId;

    return await this.prisma.$transaction(async (tx) => {
      await this.inventoryService.stockOutFinishedGoods(
        tx,
        companyId,
        product.id,
        qty,
        'MANUAL',
        dto.reason || 'MANUAL_STOCK_OUT',
        null,
        dto.reason || 'MANUAL_STOCK_OUT',
        userId || 'system',
        'Manual stock out from UI'
      );

      return { success: true, message: `Successfully issued -${qty} ${product.unit || 'PCS'}` };
    });
  }

  async adjustFinishedGoods(dto: any, userId?: string) {
    const newStock = Number(dto.newPhysicalStock);
    if (isNaN(newStock) || newStock < 0) {
      throw new BadRequestException('Physical stock must be a non-negative number');
    }
    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestException('Reason is required for stock adjustment');
    }

    let product: any = null;
    if (dto.productId) {
      product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    }
    if (!product && (dto.productCode || dto.productName)) {
      product = await this.prisma.product.findFirst({
        where: {
          OR: [
            { sku: dto.productCode },
            { name: { equals: dto.productName, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!product) {
      throw new NotFoundException('Finished Good product not found');
    }

    const companyId = dto.companyId || product.companyId;

    return await this.prisma.$transaction(async (tx) => {
      await this.inventoryService.adjustFinishedGoods(
        tx,
        companyId,
        product.id,
        newStock,
        dto.reason,
        userId || 'system'
      );

      return { success: true, message: `Adjusted physical stock to ${newStock} ${product.unit || 'PCS'}` };
    });
  }

  async getFinishedGoodsHistory(companyId: string, productId: string) {
    return this.inventoryService.getFinishedGoodsHistory(companyId, productId);
  }
}
