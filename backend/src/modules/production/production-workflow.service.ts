import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductionStatus, QCResult } from '@prisma/client';
import { QcPassDto } from './dto/qc-pass.dto';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductionWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly notificationsService?: NotificationsService,
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

  async getIncomingOrders() {
    try {
      const workOrders = await this.prisma.workOrder.findMany({
        where: {
          NOT: {
            status: { in: ['COMPLETED', 'CANCELLED', 'CLOSED'] as any },
          },
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          workflowState: true,
          productionPlan: {
            include: {
              salesOrder: {
                include: {
                  customer: true,
                  quotation: { include: { lead: true } },
                  sourceQuotation: { include: { lead: true } },
                  items: {
                    include: {
                      product: true,
                    },
                  },
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

      const grouped = new Map<string, any>();

      for (const wo of workOrders) {
        const woAny = wo as any;
        const plan = woAny.productionPlan || {};
        const salesOrder = plan.salesOrder || {};
        const orderId = salesOrder.id || plan.salesOrderId || woAny.id;
        const lead = salesOrder.sourceQuotation?.lead || salesOrder.quotation?.lead;
        const leadCustomer =
          lead?.companyName ||
          lead?.customerName ||
          lead?.name ||
          lead?.projectName ||
          lead?.contactPerson;
        const directCustomer =
          salesOrder.customer?.companyName ||
          salesOrder.customer?.name ||
          salesOrder.customer?.contactPerson;
        const resolvedCustomer =
          salesOrder.customerName ||
          salesOrder.customer_name ||
          (salesOrder.quotationId || salesOrder.sourceQuotationId
            ? leadCustomer || directCustomer
            : directCustomer || leadCustomer) ||
          salesOrder.companyName ||
          salesOrder.clientName ||
          'N/A';

        const existing = grouped.get(orderId) || {
          id: salesOrder.id || orderId,
          orderNo: salesOrder.orderNumber || salesOrder.orderNo || orderId,
          customerName: resolvedCustomer,
          detailedItems: [],
          products: '',
          estimatedQuantity: 0,
          totalQuantity: 0,
          targetDate: plan.plannedEndDate || salesOrder.requestedDeliveryDate || salesOrder.requiredDeliveryDate || '',
          priority: plan.priority || 'Medium',
          status: plan.status || woAny.productionStatus || 'RELEASED',
          workflowStatus: woAny.workflowState?.code || plan.workflowState?.code || 'RELEASED',
          productionPlanId: plan.id,
          workOrderIds: [],
          hasBackendWorkOrder: true,
          createdAt: woAny.createdAt || plan.createdAt || salesOrder.createdAt,
        };

        const salesItem = salesOrder.items?.find((item: any) => item.id === woAny.salesOrderItemId) || woAny.salesOrderItem;
        const productName = salesItem?.productNameSnapshot || salesItem?.product?.name || woAny.salesOrderItem?.product?.name || 'Production Item';
        const itemQuantity = Number(woAny.quantity || salesItem?.orderedQuantity || 0);

        existing.detailedItems.push({
          productName,
          quantity: itemQuantity,
          unit: salesItem?.unit || 'Units',
        });
        existing.products = [...new Set(existing.detailedItems.map((item: any) => item.productName))].join(', ');
        existing.estimatedQuantity += itemQuantity;
        existing.totalQuantity += itemQuantity;
        existing.workOrderIds.push(woAny.id);
        grouped.set(orderId, existing);
      }

      const activePlans = await this.prisma.productionPlan.findMany({
        where: {
          NOT: {
            status: { in: ['COMPLETED', 'CANCELLED'] as any },
          },
        },
        include: {
          salesOrder: {
            include: {
              customer: true,
              quotation: { include: { lead: true } },
              sourceQuotation: { include: { lead: true } },
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          workOrders: true,
        },
      });

      for (const plan of activePlans) {
        const soAny = (plan as any).salesOrder;
        if (!soAny) continue;
        const orderId = soAny.id || plan.salesOrderId || plan.id;
        if (!grouped.has(orderId) && !grouped.has(soAny.orderNumber)) {
          const lead = soAny.sourceQuotation?.lead || soAny.quotation?.lead;
          const leadCustomer =
            lead?.companyName ||
            lead?.customerName ||
            lead?.name ||
            lead?.projectName ||
            lead?.contactPerson;
          const directCustomer =
            soAny.customer?.companyName ||
            soAny.customer?.name ||
            soAny.customer?.contactPerson;
          const resolvedCustomer =
            soAny.customerName ||
            soAny.customer_name ||
            (soAny.quotationId || soAny.sourceQuotationId
              ? leadCustomer || directCustomer
              : directCustomer || leadCustomer) ||
            soAny.companyName ||
            soAny.clientName ||
            'N/A';

          const items = Array.isArray(soAny.items) ? soAny.items : [];
          const detailedItems = items.map((i: any) => ({
            productName: i.productNameSnapshot || i.product?.name || 'Item',
            quantity: Number(i.orderedQuantity ?? i.quantity ?? 1),
            unit: i.unit || 'Units',
          }));
          const totalQuantity = detailedItems.reduce((sum: number, it: any) => sum + it.quantity, 0);

          grouped.set(orderId, {
            id: soAny.id,
            orderNo: soAny.orderNumber || soAny.orderNo || soAny.id,
            customerName: resolvedCustomer,
            detailedItems,
            products: detailedItems.map((it: any) => it.productName).join(', ') || 'Custom Engineered Product',
            estimatedQuantity: totalQuantity,
            totalQuantity: totalQuantity,
            targetDate: plan.plannedEndDate || soAny.requestedDeliveryDate || soAny.requiredDeliveryDate || '',
            priority: plan.priority || 'Medium',
            status: plan.status || soAny.workflowState?.code || soAny.status || 'PRODUCTION_PLANNED',
            workflowStatus: plan.status || soAny.workflowState?.code || soAny.status || 'PRODUCTION_PLANNED',
            productionPlanId: plan.id,
            workOrderIds: plan.workOrders?.map((w: any) => w.id) || [],
            hasBackendWorkOrder: (plan.workOrders?.length || 0) > 0,
            createdAt: plan.createdAt || soAny.createdAt,
          });
        }
      }

      const assignedSalesOrders: any[] = await this.prisma.salesOrder.findMany({
        where: {
          deletedAt: null,
          NOT: {
            status: { in: ['COMPLETED', 'CANCELLED', 'LOST'] as any },
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          quotation: { include: { lead: true } },
          sourceQuotation: { include: { lead: true } },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      for (const so of assignedSalesOrders) {
        const soAny = so as any;
        if (!grouped.has(soAny.id) && !grouped.has(soAny.orderNumber)) {
          const lead = soAny.sourceQuotation?.lead || soAny.quotation?.lead;
          const leadCustomer =
            lead?.companyName ||
            lead?.customerName ||
            lead?.name ||
            lead?.projectName ||
            lead?.contactPerson;
          const directCustomer =
            soAny.customer?.companyName ||
            soAny.customer?.name ||
            soAny.customer?.contactPerson;
          const resolvedCustomer =
            soAny.customerName ||
            soAny.customer_name ||
            (soAny.quotationId || soAny.sourceQuotationId
              ? leadCustomer || directCustomer
              : directCustomer || leadCustomer) ||
            soAny.companyName ||
            soAny.clientName ||
            'N/A';

          const items = Array.isArray(soAny.items) ? soAny.items : [];
          const detailedItems = items.map((i: any) => ({
            productName: i.productNameSnapshot || i.product?.name || 'Item',
            quantity: Number(i.orderedQuantity ?? i.quantity ?? 1),
            unit: i.unit || 'Units',
          }));
          const totalQuantity = detailedItems.reduce((sum: number, it: any) => sum + it.quantity, 0);

          grouped.set(soAny.id, {
            id: soAny.id,
            orderNo: soAny.orderNumber || soAny.orderNo || soAny.id,
            customerName: resolvedCustomer,
            detailedItems,
            products: detailedItems.map((it: any) => it.productName).join(', ') || 'Custom Engineered Product',
            estimatedQuantity: totalQuantity,
            totalQuantity: totalQuantity,
            targetDate: soAny.requestedDeliveryDate || soAny.requiredDeliveryDate || '',
            priority: 'Medium',
            status: soAny.workflowState?.code || soAny.status || 'PRODUCTION_PLANNED',
            workflowStatus: soAny.workflowState?.code || soAny.status || 'PRODUCTION_PLANNED',
            workOrderIds: [],
            hasBackendWorkOrder: false,
            createdAt: soAny.createdAt,
          });
        }
      }

      return Array.from(grouped.values())
        .map((item) => ({
          ...item,
          _source: 'LIVE_DATABASE',
        }))
        .sort((a: any, b: any) => {
          const numA = parseInt(String(a.orderNo || a.id || '').replace(/\D/g, '')) || 0;
          const numB = parseInt(String(b.orderNo || b.id || '').replace(/\D/g, '')) || 0;
          if (numA && numB && numA !== numB) return numB - numA;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
    } catch (err) {
      console.error('[ProductionWorkflow] getIncomingOrders failed:', err);
      return [];
    }
  }

  async getJobsByStatus(statuses: ProductionStatus[]) {
    try {
      const isQcFailedQuery = statuses.includes('QC_FAILED' as any);
      const whereClause: any = isQcFailedQuery
        ? {
            OR: [
              { productionStatus: { in: statuses as any } },
              { qcResult: 'FAIL' },
            ],
          }
        : { productionStatus: { in: statuses as any } };

      const records = await this.prisma.workOrder.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        include: {
          productionPlan: {
            include: {
              salesOrder: {
                include: {
                  customer: true,
                  quotation: { include: { lead: true } },
                  sourceQuotation: { include: { lead: true } },
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
      console.error(
        `[ProductionWorkflow] getJobsByStatus failed for ${statuses}:`,
        err,
      );
      return [];
    }
  }

  async getQcFailedHistory() {
    try {
      const records = await this.prisma.workOrder.findMany({
        where: {
          OR: [
            { reworkCount: { gt: 0 } },
            { qcResult: 'FAIL' },
            { failureReason: { not: null } },
            { productionStatus: 'QC_FAILED' },
            { productionStatus: 'REWORK_IN_PROGRESS' },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          productionPlan: {
            include: {
              salesOrder: {
                include: {
                  customer: true,
                  quotation: { include: { lead: true } },
                  sourceQuotation: { include: { lead: true } },
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
      console.error('[ProductionWorkflow] getQcFailedHistory failed:', err);
      return [];
    }
  }

  async sendToDispatch(workOrderIds: string[], userId: string | null) {
    return this.prisma.$transaction(async (tx) => {
      const updatedList: any[] = [];
      for (const id of workOrderIds) {
        const wo = await tx.workOrder.findUnique({
          where: { id },
          include: {
            productionPlan: {
              include: {
                salesOrder: true,
              },
            },
            salesOrderItem: {
              include: {
                product: true,
              },
            },
          },
        });
        if (!wo) continue;

        const updated = await tx.workOrder.update({
          where: { id },
          data: {
            productionStatus: 'DISPATCHED',
            status: 'DISPATCHED',
            sentToDispatchAt: new Date(),
            completedAt: wo.completedAt || new Date(),
          },
        });

        // Update sales order status if applicable
        if (wo.productionPlan?.salesOrderId) {
          await tx.salesOrder
            .update({
              where: { id: wo.productionPlan.salesOrderId },
              data: {
                status: 'READY_FOR_DISPATCH',
              },
            })
            .catch(() => null);
        }

        // Upsert Finished Goods stock entry staged for dispatch
        const existingFg = await tx.finishedGoods.findFirst({
          where: { workOrderId: id },
        });

        const prodId =
          wo.salesOrderItem?.productId || (wo as any).productId;

        if (existingFg) {
          await tx.finishedGoods.update({
            where: { id: existingFg.id },
            data: {
              status: 'READY_FOR_DISPATCH',
              availableQuantity: Number(wo.quantity || 1),
            },
          });
        } else if (prodId) {
          await tx.finishedGoods
            .create({
              data: {
                workOrderId: id,
                productId: prodId,
                salesOrderId: wo.productionPlan?.salesOrderId || null,
                quantity: Number(wo.quantity || 1),
                availableQuantity: Number(wo.quantity || 1),
                status: 'READY_FOR_DISPATCH',
                unit: 'PCS',
              },
            })
            .catch((err) => {
              console.error(
                '[ProductionWorkflow] Create FinishedGoods staged failed:',
                err,
              );
            });
        }

        updatedList.push(updated);
      }

      if (this.notificationsService && updatedList.length > 0) {
        this.notificationsService
          .notifyRole({
            companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
            roles: ['DISPATCH_EXECUTIVE', 'DISPATCH_2', 'DISPATCH_1', 'DISPATCH'],
            type: 'DISPATCH_ORDER_READY',
            title: 'New Items Ready for Dispatch',
            message: `${updatedList.length} Work Order(s) finished production and are now queued for dispatch.`,
            route: '/dispatch/orders',
            entityType: 'WorkOrder',
            entityId: updatedList[0]?.id,
            eventKeyPrefix: `DISPATCH_READY:${Date.now()}`,
          })
          .catch((err) =>
            console.warn('[ProductionWorkflow Notification] Failed to notify Dispatch:', err),
          );
      }

      return { success: true, count: updatedList.length, data: updatedList };
    });
  }

  async getReadyForDispatchHistory() {
    try {
      const records = await this.prisma.workOrder.findMany({
        where: {
          OR: [
            { productionStatus: 'DISPATCHED' },
            { status: 'DISPATCHED' },
            { sentToDispatchAt: { not: null } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          productionPlan: {
            include: {
              salesOrder: {
                include: {
                  customer: true,
                  quotation: { include: { lead: true } },
                  sourceQuotation: { include: { lead: true } },
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
      console.error(
        '[ProductionWorkflow] getReadyForDispatchHistory failed:',
        err,
      );
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
    const result = await this.transitionState(
      id,
      userId,
      ['IN_PRODUCTION', 'REWORK_IN_PROGRESS', 'QC_FAILED'],
      'QC_PENDING',
      'Work completed, sent to QC',
      {
        productionEndTime: new Date(),
        completedAt: new Date(),
        completedById: userId,
        status: 'COMPLETED',
        qcResult: null,
      },
    );

    // Ensure QC Inspection is set to PENDING for re-inspection
    const existingInspection = await this.prisma.qCInspection.findFirst({
      where: { workOrderId: id },
    });
    if (existingInspection) {
      await this.prisma.qCInspection.update({
        where: { id: existingInspection.id },
        data: {
          status: 'PENDING',
          remarks: 'Completed on floor, ready for QC inspection',
          approvedQuantity: 0,
          rejectedQuantity: 0,
        },
      });
    } else {
      await this.prisma.qCInspection.create({
        data: {
          workOrderId: id,
          status: 'PENDING',
        },
      });
    }

    return result;
  }

  async startRework(id: string, userId: string | null) {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.workOrder.findFirst({
        where: {
          OR: [
            { id },
            { workOrderNumber: id },
            { salesOrderItemId: id },
          ],
        },
      });
      if (!job) throw new NotFoundException('WorkOrder not found');

      // Find WORK_ORDER workflow state for STARTED or READY
      const startedState = await tx.workflowState.findFirst({
        where: {
          workflow: { code: 'WORK_ORDER' },
          code: { in: ['STARTED', 'IN_PROGRESS', 'READY'] },
        },
      });

      const updatedJob = await tx.workOrder.update({
        where: { id: job.id },
        data: {
          productionStatus: 'REWORK_IN_PROGRESS',
          status: 'STARTED',
          startedAt: new Date(),
          startedById: userId,
          productionStartTime: new Date(),
          reworkCount: (job.reworkCount || 0) + 1,
          updatedBy: userId,
          ...(startedState ? { workflowStateId: startedState.id } : {}),
          statusHistory: {
            create: {
              fromStatus: job.productionStatus,
              toStatus: 'REWORK_IN_PROGRESS',
              remarks: 'Started rework on floor',
              changedBy: userId,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Work order moved to rework on the production floor.',
        data: updatedJob,
      };
    });
  }

  async completeRework(id: string, userId: string | null) {
    return this.completeWork(id, userId);
  }

  async passQC(workOrderId: string, userId: string, dto: QcPassDto) {
    return this.prisma.$transaction(async (tx) => {
      let workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: {
          salesOrderItem: { include: { product: true } },
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

      if (!workOrder) {
        workOrder = await tx.workOrder.findFirst({
          where: {
            OR: [
              { workOrderNumber: workOrderId },
              { qcInspections: { some: { id: workOrderId } } },
            ],
          },
          include: {
            salesOrderItem: { include: { product: true } },
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
      }

      if (!workOrder) throw new NotFoundException('Work order not found.');

      const producedQuantity = Number(workOrder.quantity ?? 0);
      const approvedQty = Number(
        dto.approvedQuantity > 0 ? dto.approvedQuantity : producedQuantity || 1,
      );

      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrder.id },
        data: {
          status: 'QC_APPROVED',
          productionStatus: 'READY_FOR_DISPATCH',
          qcResult: 'PASS',
          qcRemarks: dto.remarks ?? null,
          qcTimestamp: new Date(),
          qcCheckedById: userId,
        },
      });

      let resolvedProductId = workOrder.salesOrderItem?.productId;
      if (!resolvedProductId && workOrder.productionPlanId) {
        const planWithSo = await tx.productionPlan.findUnique({
          where: { id: workOrder.productionPlanId },
          include: { salesOrder: { include: { items: true } } },
        });
        resolvedProductId = planWithSo?.salesOrder?.items?.[0]?.productId;
      }
      if (!resolvedProductId) {
        const fallbackProd = await tx.product.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
        resolvedProductId = fallbackProd?.id;
      }

      let finishedGoods: any = null;
      if (resolvedProductId) {
        const product = await tx.product.findUnique({
          where: { id: resolvedProductId },
          select: { unit: true },
        });
        const unit = product?.unit || workOrder.salesOrderItem?.unit || 'Pcs';

        finishedGoods = await tx.finishedGoods.upsert({
          where: { workOrderId: workOrder.id },
          create: {
            workOrderId: workOrder.id,
            productId: resolvedProductId,
            salesOrderId: workOrder.productionPlan?.salesOrderId || null,
            quantity: approvedQty,
            availableQuantity: approvedQty,
            unit,
            status: 'AVAILABLE',
            receivedAt: new Date(),
            receivedById: userId,
          },
          update: {
            productId: resolvedProductId,
            quantity: approvedQty,
            availableQuantity: approvedQty,
            unit,
            status: 'AVAILABLE',
            receivedAt: new Date(),
            receivedById: userId,
          },
        });
      }

      const pendingInspection = await tx.qCInspection.findFirst({
        where: { workOrderId: workOrder.id, status: 'PENDING' },
      });
      const refId = pendingInspection?.id || workOrder.id;
      const refType = pendingInspection ? 'QCInspection' : 'WorkOrder';

      const companyId =
        workOrder.productionPlan?.salesOrder?.customer?.companyId;
      if (companyId && resolvedProductId) {
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
              productId: resolvedProductId,
              warehouseId: warehouse.id,
              type: 'IN',
              quantity: approvedQty,
              referenceType: refType,
              referenceId: refId,
            },
          });
        }
      }

      await tx.qCInspection.updateMany({
        where: { workOrderId: workOrder.id, status: 'PENDING' },
        data: {
          status: 'PASSED',
          approvedQuantity: approvedQty,
          rejectedQuantity: Number(dto.rejectedQuantity || 0),
          remarks: dto.remarks,
          approvedAt: new Date(),
          inspectorId: userId,
        },
      });

      const existingInspection = await tx.qCInspection.findFirst({
        where: { workOrderId: workOrder.id },
      });
      if (!existingInspection) {
        await tx.qCInspection.create({
          data: {
            workOrderId: workOrder.id,
            status: 'PASSED',
            approvedQuantity: approvedQty,
            rejectedQuantity: Number(dto.rejectedQuantity || 0),
            remarks: dto.remarks || 'QC Passed',
            approvedAt: new Date(),
            inspectorId: userId,
          },
        });
      }

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

    return this.prisma.$transaction(async (tx) => {
      const job = await tx.workOrder.findFirst({
        where: {
          OR: [
            { id },
            { workOrderNumber: id },
            { salesOrderItemId: id },
          ],
        },
      });
      if (!job) throw new NotFoundException(`Work order ${id} not found.`);

      // Find workflow state for QC_FAILED / REWORK_REQUIRED if available
      const failState = await tx.workflowState.findFirst({
        where: {
          code: { in: ['QC_FAILED', 'REWORK_REQUIRED', 'FAILED'] },
        },
      });

      const updatedJob = await tx.workOrder.update({
        where: { id: job.id },
        data: {
          productionStatus: 'QC_FAILED',
          qcResult: 'FAIL',
          failureReason,
          qcRemarks: remarks,
          qcTimestamp: new Date(),
          qcCheckedById: userId,
          updatedBy: userId,
          ...(failState ? { workflowStateId: failState.id } : {}),
          statusHistory: {
            create: {
              fromStatus: job.productionStatus,
              toStatus: 'QC_FAILED',
              remarks: remarks || failureReason,
              changedBy: userId,
            },
          },
        },
        include: {
          productionPlan: {
            include: {
              salesOrder: {
                include: { customer: true },
              },
            },
          },
          salesOrderItem: {
            include: { product: true },
          },
        },
      });

      const existingQc = await tx.qCInspection.findFirst({
        where: { workOrderId: job.id },
      });

      if (existingQc) {
        await tx.qCInspection.update({
          where: { id: existingQc.id },
          data: {
            status: 'FAILED',
            approvedQuantity: 0,
            rejectedQuantity: Number(job.quantity || 1),
            remarks: remarks || failureReason,
            inspectorId: userId,
          },
        });
      } else {
        await tx.qCInspection.create({
          data: {
            workOrderId: job.id,
            status: 'FAILED',
            approvedQuantity: 0,
            rejectedQuantity: Number(job.quantity || 1),
            remarks: remarks || failureReason,
            inspectorId: userId,
          },
        });
      }

      return {
        success: true,
        message: 'Work order marked as QC failed and queued for rework.',
        data: updatedJob,
      };
    });
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
      const activeCompanyId =
        companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
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
        console.log(
          `[RECONCILE] Found ${unpostedProd.length} unposted submitted production reports. Reconciling...`,
        );
        for (const report of unpostedProd) {
          await this.prisma.$transaction(async (tx) => {
            const productSetsMap = new Map<string, number>();
            for (const item of report.items) {
              if (item.productId && item.setQty > 0) {
                productSetsMap.set(
                  item.productId,
                  (productSetsMap.get(item.productId) || 0) +
                    Number(item.setQty || 0),
                );
              }
            }

            for (const [productId, setQty] of productSetsMap.entries()) {
              await this.inventoryService.stockInFinishedGoods(
                tx,
                report.companyId || activeCompanyId,
                productId,
                setQty,
                'PRODUCTION_REPORT',
                report.id,
                null,
                report.reportNo,
                userId || report.createdById || 'system',
                `Reconciled auto-post for report ${report.reportNo}`,
              );
            }
            await tx.productionDailyReport.update({
              where: { id: report.id },
              data: {
                stockPostedAt: new Date(),
                stockPostedBy: userId || report.createdById || 'system',
                stockTransactionId: report.reportNo,
              },
            });
          });
        }
        console.log(
          '[RECONCILE] Reconciled production stock completed successfully.',
        );
      }

      // Reconcile any unposted submitted dispatch reports
      const unpostedDispatch = await this.prisma.dispatchDailyReport.findMany({
        where: {
          status: 'SUBMITTED',
          stockPostedAt: null,
        },
        include: {
          items: true,
        },
      });

      if (unpostedDispatch.length > 0) {
        console.log(
          `[RECONCILE] Found ${unpostedDispatch.length} unposted submitted dispatch reports. Reconciling...`,
        );
        for (const report of unpostedDispatch) {
          try {
            await this.prisma.$transaction(async (tx) => {
              const productSetsMap = new Map<string, number>();
              for (const item of report.items) {
                if (item.productId && item.setQty > 0) {
                  productSetsMap.set(
                    item.productId,
                    (productSetsMap.get(item.productId) || 0) +
                      Number(item.setQty || 0),
                  );
                }
              }

              for (const [productId, setQty] of productSetsMap.entries()) {
                await this.inventoryService.stockOutFinishedGoods(
                  tx,
                  report.companyId || activeCompanyId,
                  productId,
                  setQty,
                  'DISPATCH_REPORT',
                  report.id,
                  null,
                  report.reportNo,
                  userId || report.createdById || 'system',
                  `Reconciled auto-deduct for dispatch report ${report.reportNo}`,
                );
              }

              await tx.dispatchDailyReport.update({
                where: { id: report.id },
                data: {
                  stockPostedAt: new Date(),
                  stockPostedBy: userId || report.createdById || 'system',
                  stockTransactionId: report.reportNo,
                },
              });
            });
          } catch (itemErr) {
            console.error(
              `[RECONCILE] Could not auto-post dispatch report ${report.reportNo}:`,
              itemErr,
            );
          }
        }
        console.log(
          '[RECONCILE] Reconciled dispatch stock completed successfully.',
        );
      }
    } catch (reconcileErr) {
      console.error(
        '[RECONCILE] Failed to reconcile unposted reports:',
        reconcileErr,
      );
    }

    let userCategory: string | null = null;
    if (
      userId &&
      (role === 'DISPATCH_EXECUTIVE' || role === 'Dispatch Executive')
    ) {
      const u: any = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (u?.dispatchCategory) {
        userCategory = u.dispatchCategory;
      }
    }

    const fgWhere: any = {};
    if (companyId) {
      fgWhere.OR = [
        { product: { companyId } },
        { product: { companyId: null } },
        { product: null },
      ];
    }

    const qcPassedInspections = await this.prisma.qCInspection.findMany({
      where: {
        status: { in: ['APPROVED', 'PASSED'] },
      },
      select: { workOrderId: true },
    });
    const extraWoIds = qcPassedInspections
      .map((i) => i.workOrderId)
      .filter(Boolean) as string[];

    const woWhere: any = {
      OR: [
        {
          status: {
            in: [
              'READY_FOR_DISPATCH',
              'COMPLETED',
              'QC_APPROVED',
              'QC_PASSED',
              'PASSED',
              'CLOSED',
            ],
          },
        },
        {
          productionStatus: {
            in: ['READY_FOR_DISPATCH', 'COMPLETED', 'QC_PASSED', 'FINISHED'],
          },
        },
        { qcResult: 'PASS' },
        {
          qcInspections: {
            some: { status: { in: ['APPROVED', 'PASSED'] } },
          },
        },
      ],
    };

    if (extraWoIds.length > 0) {
      woWhere.OR.push({ id: { in: extraWoIds } });
    }

    if (userCategory) {
      fgWhere.product = {
        ...(fgWhere.product || {}),
        dispatchCategory: userCategory,
      };
      woWhere.salesOrderItem = {
        product: { dispatchCategory: userCategory },
      };
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
                  include: {
                    customer: true,
                    quotation: { include: { lead: true } },
                    sourceQuotation: { include: { lead: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    });

    const existingWoIds = new Set(
      records.map((r: any) => r.workOrderId).filter(Boolean),
    );

    const qcApprovedWorkOrders = await this.prisma.workOrder.findMany({
      where: woWhere,
      include: {
        salesOrderItem: { include: { product: true } },
        productionPlan: {
          include: {
            salesOrder: {
              include: {
                customer: true,
                quotation: { include: { lead: true } },
                sourceQuotation: { include: { lead: true } },
              },
            },
          },
        },
        qcInspections: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const syntheticRecords = qcApprovedWorkOrders
      .filter((wo) => !existingWoIds.has(wo.id))
      .map((wo: any) => {
        const so = wo.productionPlan?.salesOrder;
        const customer = so?.customer;
        const leadCustomerName =
          so?.quotation?.lead?.companyName ||
          so?.quotation?.lead?.projectName ||
          so?.sourceQuotation?.lead?.companyName ||
          so?.sourceQuotation?.lead?.projectName;
        const item = wo.salesOrderItem;
        const product = item?.product;
        const qcApprovedQty =
          wo.qcInspections?.[0]?.approvedQuantity || wo.quantity || 1;

        return {
          id: `fg-wo-${wo.id}`,
          workOrderId: wo.id,
          productId: wo.productId || item?.productId || 'UNKNOWN_PROD',
          salesOrderId: so?.id || null,
          salesOrderNumber: so?.orderNumber || null,
          quantity: Number(qcApprovedQty),
          availableQuantity: Number(qcApprovedQty),
          allocatedQuantity: 0,
          dispatchedQuantity: 0,
          unit: item?.unit || 'Pcs',
          status:
            wo.status === 'READY_FOR_DISPATCH' ||
            wo.status === 'DISPATCHED' ||
            wo.sentToDispatchAt
              ? 'READY_FOR_DISPATCH'
              : 'AVAILABLE',
          location: 'Factory Staging Area',
          receivedAt: wo.completedAt
            ? new Date(wo.completedAt).toISOString()
            : new Date().toISOString(),
          receivedById: null,
          workOrder: wo,
          product,
          jobNo: wo.workOrderNumber,
          productionPlanId: wo.productionPlanId,
          customerName:
            leadCustomerName ||
            customer?.companyName ||
            customer?.contactPerson ||
            customer?.name ||
            'Internal',
          productName:
            product?.name || item?.productNameSnapshot || 'Finished Good',
          productCode:
            product?.sku ||
            product?.publicId ||
            item?.productCodeSnapshot ||
            '-',
        };
      });

    const mappedExisting = records.map((entry: any) => {
      const wo = entry.workOrder;
      const so = wo?.productionPlan?.salesOrder;
      const product = entry.product || wo?.salesOrderItem?.product;
      const customer = so?.customer;
      const leadCustomerName =
        so?.quotation?.lead?.companyName ||
        so?.quotation?.lead?.projectName ||
        so?.sourceQuotation?.lead?.companyName ||
        so?.sourceQuotation?.lead?.projectName;

      return {
        ...entry,
        jobNo: wo?.workOrderNumber || entry.jobNo || entry.workOrderId,
        productionPlanId: wo?.productionPlanId,
        salesOrderId: entry.salesOrderId || so?.id || null,
        salesOrderNumber: so?.orderNumber || (entry as any).salesOrderNumber || null,
        customerName:
          leadCustomerName ||
          customer?.companyName ||
          customer?.contactPerson ||
          customer?.name ||
          'Internal',
        productName:
          product?.name ||
          wo?.salesOrderItem?.productNameSnapshot ||
          'Finished Good',
        productCode:
          product?.sku ||
          product?.publicId ||
          wo?.salesOrderItem?.productCodeSnapshot ||
          '-',
        quantity: Number(entry.quantity ?? 0),
        availableQuantity: Number(
          entry.availableQuantity ?? entry.quantity ?? 0,
        ),
      };
    });

    const existingSoIds = new Set(
      [
        ...records.map((r: any) => r.salesOrderId),
        ...qcApprovedWorkOrders.map((w: any) => w.productionPlan?.salesOrderId),
      ].filter(Boolean),
    );

    const readySalesOrders = await this.prisma.salesOrder.findMany({
      where: {
        customer: companyId ? { companyId } : undefined,
        status: { in: ['READY_FOR_DISPATCH', 'CONFIRMED', 'PLANT_APPROVED'] },
      },
      include: {
        customer: true,
        quotation: { include: { lead: true } },
        sourceQuotation: { include: { lead: true } },
        items: { include: { product: true } },
      },
    });

    const soSyntheticRecords: any[] = [];
    for (const so of readySalesOrders as any[]) {
      if (existingSoIds.has(so.id)) continue;
      const soLeadName =
        so.quotation?.lead?.companyName ||
        so.quotation?.lead?.projectName ||
        so.sourceQuotation?.lead?.companyName ||
        so.sourceQuotation?.lead?.projectName;
      for (const item of so.items || []) {
        soSyntheticRecords.push({
          id: `fg-so-${so.id}-${item.id}`,
          workOrderId: so.orderNumber,
          productId: item.productId,
          salesOrderId: so.id,
          salesOrderNumber: so.orderNumber,
          quantity: Number(item.orderedQuantity || 1),
          availableQuantity: Number(item.orderedQuantity || 1),
          allocatedQuantity: 0,
          dispatchedQuantity: 0,
          unit: item.unit || 'Pcs',
          status: 'READY_FOR_DISPATCH',
          location: 'Factory Staging Area',
          receivedAt: so.confirmedAt
            ? new Date(so.confirmedAt).toISOString()
            : new Date(so.createdAt).toISOString(),
          receivedById: null,
          workOrder: {
            id: so.id,
            workOrderNumber: so.orderNumber,
            productionStatus: 'READY_FOR_DISPATCH',
            duration: null,
            startedAt: null,
            completedAt: so.confirmedAt
              ? new Date(so.confirmedAt).toISOString()
              : new Date(so.createdAt).toISOString(),
            status: 'READY_FOR_DISPATCH',
            productionPlan: { salesOrder: so },
          },
          salesOrder: so,
          product: item.product,
          jobNo: so.orderNumber,
          customerName:
            soLeadName ||
            so.customer?.companyName ||
            so.customer?.contactPerson ||
            so.customer?.name ||
            'Customer',
          productName:
            item.product?.name ||
            item.productNameSnapshot ||
            'Finished Product',
          productCode:
            item.product?.sku ||
            item.product?.publicId ||
            item.productCodeSnapshot ||
            '-',
        });
      }
    }

    const isCatalogProduct = (item: any) => {
      const origType = String(
        item?.productType ||
          item?.product_type ||
          item?.product?.productType ||
          item?.product?.product_type ||
          '',
      ).toUpperCase();
      const family = String(
        item?.category ||
          item?.product_family ||
          item?.product?.category ||
          item?.product?.product_family ||
          '',
      ).toLowerCase();
      const code = String(
        item?.sku ||
          item?.productCode ||
          item?.product_code ||
          item?.publicId ||
          item?.product?.sku ||
          item?.product?.publicId ||
          '',
      ).toUpperCase();
      const name = String(
        item?.name ||
          item?.productName ||
          item?.product_name ||
          item?.product?.name ||
          item?.product?.product_name ||
          '',
      ).toLowerCase();

      if (origType === 'RAW_MATERIAL' || origType === 'HARDWARE') {
        return false;
      }
      if (
        [
          'raw material',
          'hardware',
          'electric',
          'consumables',
          'consumable',
        ].includes(family)
      ) {
        return false;
      }
      if (
        code.startsWith('HCPPL') ||
        code.startsWith('RM-') ||
        code.startsWith('HM')
      ) {
        return false;
      }
      const rawKeywords = [
        'cement',
        'sand',
        'aggregate',
        'gravel',
        'stone',
        'pigment',
        'powder',
        'water paper',
        'brush',
        'welcor',
        'haksaw',
        'drill',
        'thappi',
        'chisel',
        'clamp',
        'hammer',
        'bucket',
        'ghamela',
        'carbon',
        'pva',
        'wax',
        'polish',
        'resin',
        'cobalt',
        'catalyst',
        'fly ash',
        'admixture',
      ];
      if (rawKeywords.some((keyword) => name.includes(keyword))) {
        return false;
      }
      return true;
    };

    const allProductsWhere: any = {
      isActive: true,
    };
    if (companyId) {
      allProductsWhere.companyId = companyId;
    }
    if (userCategory) {
      allProductsWhere.dispatchCategory = userCategory;
    }

    const allCatalogProducts = await this.prisma.product.findMany({
      where: allProductsWhere,
      orderBy: { name: 'asc' },
    });

    const validCatalogProducts = allCatalogProducts.filter(isCatalogProduct);

    const coveredProductIds = new Set<string>();
    for (const r of mappedExisting) {
      if (r.productId) coveredProductIds.add(String(r.productId));
      if (r.product?.id) coveredProductIds.add(String(r.product.id));
    }
    for (const r of syntheticRecords) {
      if (r.productId) coveredProductIds.add(String(r.productId));
      if (r.product?.id) coveredProductIds.add(String(r.product.id));
    }
    for (const r of soSyntheticRecords) {
      if (r.productId) coveredProductIds.add(String(r.productId));
      if (r.product?.id) coveredProductIds.add(String(r.product.id));
    }

    const catalogSyntheticRecords: any[] = [];
    for (const prod of validCatalogProducts) {
      if (!coveredProductIds.has(String(prod.id))) {
        catalogSyntheticRecords.push({
          id: `fg-prod-${prod.id}`,
          workOrderId: 'STOCK-CATALOG',
          productId: prod.id,
          salesOrderId: null,
          quantity: 0,
          availableQuantity: 0,
          allocatedQuantity: 0,
          dispatchedQuantity: 0,
          unit: prod.unit || 'PCS',
          status: 'AVAILABLE',
          location: 'Factory Staging Area',
          receivedAt: prod.createdAt
            ? new Date(prod.createdAt).toISOString()
            : new Date().toISOString(),
          receivedById: null,
          workOrder: null,
          product: prod,
          jobNo: 'STOCK-CATALOG',
          productionPlanId: null,
          customerName: 'Internal Stock',
          productName: prod.name,
          productCode: prod.sku || prod.publicId || '-',
        });
      }
    }

    const passedQcInspections = await this.prisma.qCInspection.findMany({
      where: {
        status: { in: ['APPROVED', 'PASSED'] },
      },
      include: {
        workOrder: {
          include: {
            salesOrderItem: { include: { product: true } },
            productionPlan: {
              include: {
                salesOrder: {
                  include: {
                    customer: true,
                    quotation: { include: { lead: true } },
                    sourceQuotation: { include: { lead: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const coveredWoIds = new Set([
      ...records.map((r: any) => r.workOrderId),
      ...qcApprovedWorkOrders.map((w: any) => w.id),
    ].filter(Boolean));

    const qcInspectionRecords: any[] = [];
    for (const insp of passedQcInspections) {
      const wo = insp.workOrder;
      if (!wo) continue;
      if (coveredWoIds.has(wo.id)) continue;
      coveredWoIds.add(wo.id);

      const so = wo.productionPlan?.salesOrder;
      const customer = so?.customer;
      const leadCustomerName =
        so?.quotation?.lead?.companyName ||
        so?.quotation?.lead?.projectName ||
        so?.sourceQuotation?.lead?.companyName ||
        so?.sourceQuotation?.lead?.projectName;
      const item = wo.salesOrderItem;
      const product = item?.product;
      const qcApprovedQty = Number(insp.approvedQuantity || wo.quantity || 1);

      qcInspectionRecords.push({
        id: `fg-qc-${insp.id}`,
        workOrderId: wo.id,
        productId: (wo as any).productId || item?.productId || product?.id || 'UNKNOWN_PROD',
        salesOrderId: so?.id || null,
        salesOrderNumber: so?.orderNumber || null,
        quantity: qcApprovedQty,
        availableQuantity: qcApprovedQty,
        allocatedQuantity: 0,
        dispatchedQuantity: 0,
        unit: item?.unit || product?.unit || 'Pcs',
        status:
          wo.status === 'READY_FOR_DISPATCH' ||
          wo.status === 'DISPATCHED' ||
          wo.sentToDispatchAt
            ? 'READY_FOR_DISPATCH'
            : 'AVAILABLE',
        location: 'Factory Staging Area',
        receivedAt: (insp.approvedAt || insp.createdAt || new Date()).toISOString(),
        receivedById: insp.inspectorId || null,
        workOrder: wo,
        product,
        jobNo: wo.workOrderNumber,
        productionPlanId: wo.productionPlanId,
        customerName:
          leadCustomerName ||
          customer?.companyName ||
          customer?.contactPerson ||
          'Internal',
        productName:
          product?.name || (item as any)?.productNameSnapshot || (wo as any).productName || 'Finished Good',
        productCode:
          product?.sku ||
          product?.publicId ||
          (item as any)?.productCodeSnapshot ||
          (wo as any).productCode ||
          '-',
      });
    }

    const rawList = [
      ...mappedExisting,
      ...syntheticRecords,
      ...qcInspectionRecords,
      ...soSyntheticRecords,
      ...catalogSyntheticRecords,
    ];

    const enrichedList = rawList.map((item: any) => {
      const pId = item.productId || item.product?.id || item.id;
      const cleanPId = pId
        ? String(pId)
            .replace(/^fg-prod-/, '')
            .replace(/^fg-wo-/, '')
            .replace(/^fg-so-/, '')
            .replace(/^fg-qc-/, '')
        : '';

      const finalQuantity = Number(item.quantity ?? 0);
      const finalAvailable = Number(item.availableQuantity ?? item.quantity ?? 0);

      return {
        ...item,
        productId: cleanPId || item.productId,
        quantity: finalQuantity,
        availableQuantity: finalAvailable,
        productionIn: finalQuantity,
        extraCover: 0,
        extraFrame: 0,
        dispatchOut: 0,
        openingStock: finalQuantity,
      };
    });

    return enrichedList;
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
      product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
    }

    if (!product && dto.productName) {
      product = await this.prisma.product.findFirst({
        where: {
          name: { contains: dto.productName.trim(), mode: 'insensitive' },
        },
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
    const jobNoStr =
      dto.jobNo ||
      dto.workOrderId ||
      `WO-FG-${Date.now().toString().slice(-6)}`;

    if (realWorkOrderId) {
      existingWo = await this.prisma.workOrder.findFirst({
        where: {
          OR: [{ id: realWorkOrderId }, { workOrderNumber: jobNoStr }],
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
    const receivedAtDate =
      dto.date || dto.receivedAt
        ? new Date(dto.date || dto.receivedAt)
        : new Date();

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

  private async resolveProduct(dto: any) {
    let cleanId = dto.productId
      ? String(dto.productId)
          .replace(/^fg-prod-/, '')
          .replace(/^fg-wo-/, '')
          .replace(/^fg-so-/, '')
      : null;

    let product: any = null;
    if (cleanId && cleanId !== 'UNKNOWN_PROD') {
      product = await this.prisma.product.findUnique({
        where: { id: cleanId },
      });
      if (!product) {
        const fg = await this.prisma.finishedGoods.findUnique({
          where: { id: cleanId },
          include: { product: true },
        });
        if (fg?.product) product = fg.product;
        else if (fg?.productId) {
          product = await this.prisma.product.findUnique({
            where: { id: fg.productId },
          });
        }
      }
      if (!product) {
        product = await this.prisma.product.findFirst({
          where: {
            OR: [{ publicId: cleanId }, { sku: cleanId }],
          },
        });
      }
    }

    if (!product && (dto.productCode || dto.productName)) {
      const code = dto.productCode ? String(dto.productCode).trim() : '';
      const name = dto.productName ? String(dto.productName).trim() : '';
      product = await this.prisma.product.findFirst({
        where: {
          OR: [
            ...(code
              ? [
                  { sku: { equals: code, mode: 'insensitive' as const } },
                  { publicId: { equals: code, mode: 'insensitive' as const } },
                ]
              : []),
            ...(name
              ? [
                  { name: { equals: name, mode: 'insensitive' as const } },
                  { name: { contains: name, mode: 'insensitive' as const } },
                ]
              : []),
          ],
        },
      });
    }

    if (!product) {
      const comp = await this.prisma.company.findFirst();
      const companyId =
        dto.companyId || comp?.id || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
      const sku =
        (dto.productCode ? String(dto.productCode).trim() : '') ||
        `FG-${Date.now().toString().slice(-6)}`;
      const name =
        (dto.productName ? String(dto.productName).trim() : '') || sku;
      product = await this.prisma.product.create({
        data: {
          companyId,
          name,
          sku,
          unit: dto.unit || 'PCS',
          unitPrice: 0,
          publicId: `PRD-${Date.now().toString().slice(-6)}`,
          category: 'Finished Goods',
          productType: 'FINISHED_GOODS',
        },
      });
    }

    return product;
  }

  async stockInFinishedGoods(dto: any, userId?: string) {
    const qty = Number(dto.quantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      throw new BadRequestException('Quantity to add must be greater than 0');
    }

    const product = await this.resolveProduct(dto);
    const companyId =
      dto.companyId ||
      product.companyId ||
      '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

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
        dto.remarks || 'Manual stock in from UI',
      );
      return fg;
    });
  }

  async stockOutFinishedGoods(dto: any, userId?: string) {
    const qty = Number(dto.quantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      throw new BadRequestException('Quantity to issue must be greater than 0');
    }

    const product = await this.resolveProduct(dto);
    const companyId =
      dto.companyId ||
      product.companyId ||
      '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

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
        dto.remarks || dto.reason || 'Manual stock out from UI',
      );

      return {
        success: true,
        message: `Successfully issued -${qty} ${product.unit || 'PCS'}`,
      };
    });
  }

  async adjustFinishedGoods(dto: any, userId?: string) {
    const newStock = Number(dto.newPhysicalStock);
    if (isNaN(newStock) || newStock < 0) {
      throw new BadRequestException(
        'Physical stock must be a non-negative number',
      );
    }
    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestException('Reason is required for stock adjustment');
    }

    const product = await this.resolveProduct(dto);
    const companyId =
      dto.companyId ||
      product.companyId ||
      '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

    return await this.prisma.$transaction(async (tx) => {
      await this.inventoryService.adjustFinishedGoods(
        tx,
        companyId,
        product.id,
        newStock,
        dto.reason,
        userId || 'system',
      );

      return {
        success: true,
        message: `Adjusted physical stock to ${newStock} ${product.unit || 'PCS'}`,
      };
    });
  }

  async getFinishedGoodsHistory(companyId: string, productId: string) {
    let cleanId = productId
      ? String(productId)
          .replace(/^fg-prod-/, '')
          .replace(/^fg-wo-/, '')
          .replace(/^fg-so-/, '')
      : '';

    let prod = await this.prisma.product.findUnique({
      where: { id: cleanId },
    });
    if (!prod) {
      const fg = await this.prisma.finishedGoods.findUnique({
        where: { id: cleanId },
      });
      if (fg?.productId) {
        cleanId = fg.productId;
      }
    }

    return this.inventoryService.getFinishedGoodsHistory(companyId, cleanId);
  }
}
