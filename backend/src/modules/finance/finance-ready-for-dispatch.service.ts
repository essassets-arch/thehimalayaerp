import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { isTradingProduct, isPureTradingOrder } from '../../common/utils/trading-product.util';

export class ReadyForDispatchQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
}

@Injectable()
export class FinanceReadyForDispatchService {
  private readonly logger = new Logger(FinanceReadyForDispatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve authoritative tenant context.
   * Super Admins can filter or switch tenant; other users are strictly restricted to their companyId.
   */
  resolveTenant(user: any, requestedCompanyId?: string): string {
    const role = String(user?.role || '').toUpperCase();
    const isSuperAdmin =
      role === 'SUPER_ADMIN' ||
      role === 'SUPERADMIN' ||
      role.includes('SUPER_ADMIN');

    const companyId = isSuperAdmin && requestedCompanyId?.trim()
      ? requestedCompanyId.trim()
      : user?.companyId;

    if (!companyId || !String(companyId).trim()) {
      throw new UnauthorizedException(
        'An authenticated tenant context is required to access Ready for Dispatch records.',
      );
    }
    return companyId;
  }

  /**
   * Retrieve production orders sent to dispatch for Finance view.
   * Read-only integration reflecting actual persisted database records.
   */
  async getReadyForDispatchOrders(
    user: any,
    query: ReadyForDispatchQueryDto = {},
  ) {
    const companyId = this.resolveTenant(user, query.companyId);

    // Tenant isolation clause for WorkOrder
    const tenantScope = {
      OR: [
        { salesOrderItem: { product: { companyId } } },
        { salesOrderItem: { salesOrder: { customer: { companyId } } } },
        { productionPlan: { salesOrder: { customer: { companyId } } } },
      ],
    };

    // Lookup company name for context display
    const companyRecord = await this.prisma.company
      .findUnique({
        where: { id: companyId },
        select: { id: true, name: true, publicId: true },
      })
      .catch(() => null);

    const defaultCompanyName =
      companyRecord?.name || 'Himalaya FRP & Construction Products';

    // Query all work orders sent to dispatch (productionStatus === 'DISPATCHED' or sentToDispatchAt != null)
    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        AND: [
          {
            OR: [
              { productionStatus: 'DISPATCHED' },
              { status: 'DISPATCHED' },
              { sentToDispatchAt: { not: null } },
            ],
          },
          tenantScope,
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        productionPlan: {
          include: {
            salesOrder: {
              include: {
                customer: true,
                salesExecutive: {
                  select: { id: true, name: true, email: true },
                },
                quotation: {
                  include: {
                    lead: true,
                    items: {
                      include: {
                        product: true,
                      },
                    },
                    workflowState: true,
                    selectedTerms: { orderBy: { sortOrder: 'asc' } },
                  },
                },
                sourceQuotation: {
                  include: {
                    lead: true,
                    items: {
                      include: {
                        product: true,
                      },
                    },
                    workflowState: true,
                    selectedTerms: { orderBy: { sortOrder: 'asc' } },
                  },
                },
                items: {
                  include: {
                    product: true,
                  },
                },
                dispatches: {
                  include: {
                    items: true,
                  },
                  orderBy: { updatedAt: 'desc' },
                },
                workflowState: true,
              },
            },
          },
        },
        salesOrderItem: {
          include: {
            product: true,
            salesOrder: {
              include: {
                customer: true,
                salesExecutive: {
                  select: { id: true, name: true, email: true },
                },
                quotation: {
                  include: {
                    lead: true,
                    items: {
                      include: {
                        product: true,
                      },
                    },
                    workflowState: true,
                    selectedTerms: { orderBy: { sortOrder: 'asc' } },
                  },
                },
                sourceQuotation: {
                  include: {
                    lead: true,
                    items: {
                      include: {
                        product: true,
                      },
                    },
                    workflowState: true,
                    selectedTerms: { orderBy: { sortOrder: 'asc' } },
                  },
                },
                items: {
                  include: {
                    product: true,
                  },
                },
                dispatches: {
                  include: {
                    items: true,
                  },
                  orderBy: { updatedAt: 'desc' },
                },
                workflowState: true,
              },
            },
          },
        },
        qcInspections: {
          orderBy: { createdAt: 'desc' },
        },
        FinishedGoods: true,
      },
    });

    // Filter out pure trading items as per existing production workflow logic
    const eligibleWorkOrders = (Array.isArray(workOrders) ? workOrders : []).filter(
      (wo: any) => {
        if (
          isTradingProduct(wo.salesOrderItem?.product, wo.salesOrderItem)
        )
          return false;
        if (
          wo.productionPlan?.salesOrder &&
          isPureTradingOrder(wo.productionPlan.salesOrder)
        )
          return false;
        return true;
      },
    );

    // Group work orders by Sales Order
    const groupedMap: Map<string, any> = new Map();

    for (const rawJob of eligibleWorkOrders) {
      const job: any = rawJob;
      const so: any = job.productionPlan?.salesOrder || job.salesOrderItem?.salesOrder;
      const rawSoNo = so?.orderNumber || '';
      const orderKey =
        rawSoNo ||
        `ORD-${(job.workOrderNumber || job.id).replace(/\D/g, '').slice(-5) || job.id.slice(0, 8)}`;

      const customerObj: any =
        so?.customer || job.salesOrderItem?.salesOrder?.customer || {};
      const leadObj: any =
        so?.quotation?.lead ||
        so?.sourceQuotation?.lead ||
        so?.lead ||
        {};

      const customerName =
        (leadObj?.groupName && String(leadObj.groupName).trim()) ||
        customerObj.companyName ||
        customerObj.name ||
        leadObj?.companyName ||
        leadObj?.projectName ||
        leadObj?.customerName ||
        so?.customerName ||
        'Consignee Client';

      const customerCode = customerObj.customerCode || customerObj.id || null;
      const customerGstin =
        customerObj.gstin ||
        customerObj.gst ||
        customerObj.taxId ||
        so?.customerGstin ||
        null;

      const quotation = so?.quotation || so?.sourceQuotation || null;
      const quotationNumber = quotation?.quotationNumber || null;
      const quotationId = quotation?.id || so?.quotationId || so?.sourceQuotationId || null;

      const orderDate = so?.orderDate || so?.createdAt || job.createdAt;
      const dispatchReadyDate =
        job.sentToDispatchAt || job.completedAt || job.updatedAt;

      const orderAmount =
        so?.totalAmount !== undefined && so?.totalAmount !== null
          ? Number(so.totalAmount)
          : null;

      // Determine authoritative persisted dispatch status:
      // If order has records in Dispatch table, derive status from latest dispatch record
      const dispatchesList = Array.isArray(so?.dispatches) ? so.dispatches : [];
      let resolvedDispatchStatus = 'STAGED'; // Staged for Dispatch
      let latestDispatchRef: string | null = null;
      let physicalDispatchedAt: Date | string | null = null;

      if (dispatchesList.length > 0) {
        const latestDispatch = dispatchesList[0];
        latestDispatchRef = latestDispatch.dispatchNo || null;
        physicalDispatchedAt =
          latestDispatch.dispatchedAt || latestDispatch.createdAt || null;
        const dStat = String(latestDispatch.status || '').toUpperCase();
        if (dStat === 'DELIVERED') resolvedDispatchStatus = 'DELIVERED';
        else if (dStat === 'IN_TRANSIT') resolvedDispatchStatus = 'IN_TRANSIT';
        else if (dStat === 'DISPATCHED') resolvedDispatchStatus = 'DISPATCHED';
        else if (dStat === 'READY') resolvedDispatchStatus = 'READY_TO_SHIP';
        else resolvedDispatchStatus = dStat || 'STAGED';
      } else if (job.dispatchedAt) {
        resolvedDispatchStatus = 'DISPATCHED';
        physicalDispatchedAt = job.dispatchedAt;
      } else if (job.productionStatus === 'DISPATCHED') {
        resolvedDispatchStatus = 'STAGED'; // Sent to Dispatch (Staged)
      } else {
        resolvedDispatchStatus = 'READY_FOR_DISPATCH';
      }

      if (!groupedMap.has(orderKey)) {
        groupedMap.set(orderKey, {
          id: so?.id || job.id,
          orderKey,
          salesOrderNumber: rawSoNo || orderKey,
          salesOrderId: so?.id || null,
          salesOrderStatus: so?.status || 'CONFIRMED',
          productionPlanNumber: job.productionPlan?.planNumber || null,
          productionPlanId: job.productionPlan?.id || null,
          customerName,
          customerCode,
          customerGst: customerGstin,
          customerPhone: customerObj.phone || customerObj.mobile || null,
          customerEmail: customerObj.email || null,
          customerAddress: this.formatAddress(
            customerObj.billingAddress ||
              customerObj.shippingAddress ||
              customerObj.address ||
              so?.billingAddress ||
              so?.shippingAddress,
          ),
          companyId,
          companyName: defaultCompanyName,
          companyCode: companyRecord?.publicId || null,
          quotationNumber,
          quotationId,
          quotation: quotation
            ? {
                id: quotation.id,
                quotationNumber: quotation.quotationNumber,
                createdAt: quotation.createdAt,
                validUntil: quotation.validUntil,
                subtotal: quotation.subtotal !== null ? Number(quotation.subtotal) : null,
                discount: quotation.discount !== null ? Number(quotation.discount) : null,
                tax: quotation.tax !== null ? Number(quotation.tax) : null,
                total: quotation.total !== null ? Number(quotation.total) : null,
                paymentTerms: quotation.paymentTerms || null,
                paymentTermDays: quotation.paymentTermDays || null,
                status:
                  quotation.workflowState?.name ||
                  quotation.workflowState?.code ||
                  'Approved',
                items: Array.isArray(quotation.items)
                  ? quotation.items.map((qi: any) => ({
                      id: qi.id,
                      productName: qi.product?.name || qi.description || 'Quoted Item',
                      productCode: qi.product?.sku || qi.product?.code || '',
                      description: qi.description || '',
                      quantity: Number(qi.quantity || 1),
                      unitPrice: Number(qi.unitPrice || 0),
                      discount: Number(qi.discount || 0),
                      tax: Number(qi.tax || 0),
                      lineTotal: Number(qi.lineTotal || 0),
                    }))
                  : [],
                terms: Array.isArray(quotation.selectedTerms)
                  ? quotation.selectedTerms.map((t: any) => t.termText || t.title)
                  : [],
              }
            : null,
          orderDate,
          dispatchReadyDate,
          orderAmount,
          currency: so?.currency || 'INR',
          paymentTerms: so?.paymentTerms || null,
          deliveryTerms: so?.deliveryTerms || null,
          dispatchStatus: resolvedDispatchStatus,
          dispatchReference: latestDispatchRef,
          physicalDispatchedAt,
          workOrderNumbers: [],
          workOrders: [],
          orderItems: [],
          dispatches: dispatchesList.map((d: any) => ({
            id: d.id,
            dispatchNo: d.dispatchNo,
            status: d.status,
            vehicleNumber: d.vehicleNumber,
            driverName: d.driverName,
            driverPhone: d.driverPhone,
            transporterName: d.transporterName,
            dispatchedAt: d.dispatchedAt,
            deliveredAt: d.deliveredAt,
          })),
          totalQuantity: 0,
          rawSalesOrder: so || null,
        });
      }

      const group = groupedMap.get(orderKey);

      // Add work order details
      if (job.workOrderNumber && !group.workOrderNumbers.includes(job.workOrderNumber)) {
        group.workOrderNumbers.push(job.workOrderNumber);
      }

      const prodName =
        (job.productName && job.productName !== 'FRP High Grade Product'
          ? job.productName
          : null) ||
        job.salesOrderItem?.productNameSnapshot ||
        job.salesOrderItem?.product?.name ||
        job.FinishedGoods?.product?.name ||
        'Production Finished Good';

      const prodSku =
        job.productCode ||
        job.salesOrderItem?.productCodeSnapshot ||
        job.salesOrderItem?.product?.sku ||
        '';

      const woQty = Number(job.quantity || 1);
      group.totalQuantity += woQty;

      group.workOrders.push({
        id: job.id,
        workOrderNumber: job.workOrderNumber || '—',
        quantity: woQty,
        productName: prodName,
        productSku: prodSku,
        productionStatus: job.productionStatus || 'DISPATCHED',
        qcResult: job.qcResult || (job.qcInspections?.[0]?.status === 'PASSED' ? 'PASS' : 'PASS'),
        qcRemarks: job.qcRemarks || null,
        reworkCount: Number(job.reworkCount || 0),
        sentToDispatchAt: job.sentToDispatchAt,
        completedAt: job.completedAt,
        qcTimestamp: job.qcTimestamp,
      });

      // Keep dispatchReadyDate as latest
      if (
        job.sentToDispatchAt &&
        (!group.dispatchReadyDate ||
          new Date(job.sentToDispatchAt) > new Date(group.dispatchReadyDate))
      ) {
        group.dispatchReadyDate = job.sentToDispatchAt;
      }
    }

    let allOrders = Array.from(groupedMap.values());

    // Populate orderItems from salesOrder or workOrders
    for (const ord of allOrders) {
      if (ord.rawSalesOrder?.items?.length) {
        ord.orderItems = ord.rawSalesOrder.items.map((it: any) => ({
          id: it.id,
          productName: it.productNameSnapshot || it.product?.name || 'Order Item',
          productSku: it.product?.sku || it.productCodeSnapshot || '',
          quantity: Number(it.quantity || 1),
          unitPrice: Number(it.unitPrice || 0),
          tax: Number(it.taxAmount || 0),
          lineTotal: Number(it.totalAmount || 0),
        }));
      } else {
        ord.orderItems = ord.workOrders.map((wo: any) => ({
          id: wo.id,
          productName: wo.productName,
          productSku: wo.productSku,
          quantity: wo.quantity,
          unitPrice: null,
          tax: null,
          lineTotal: null,
        }));
      }
      delete ord.rawSalesOrder; // Keep clean JSON payload
    }

    // Apply Filters
    if (query.search?.trim()) {
      const q = query.search.toLowerCase().trim();
      allOrders = allOrders.filter((ord) => {
        const matchSo = ord.salesOrderNumber.toLowerCase().includes(q);
        const matchCust = ord.customerName.toLowerCase().includes(q);
        const matchQuote = ord.quotationNumber
          ? ord.quotationNumber.toLowerCase().includes(q)
          : false;
        const matchWo = ord.workOrderNumbers.some((woNo: string) =>
          woNo.toLowerCase().includes(q),
        );
        const matchPlan = ord.productionPlanNumber
          ? ord.productionPlanNumber.toLowerCase().includes(q)
          : false;
        return matchSo || matchCust || matchQuote || matchWo || matchPlan;
      });
    }

    if (query.status?.trim() && query.status.toUpperCase() !== 'ALL') {
      const s = query.status.toUpperCase().trim();
      allOrders = allOrders.filter(
        (ord) => ord.dispatchStatus.toUpperCase() === s,
      );
    }

    if (query.dateFrom?.trim()) {
      const from = new Date(query.dateFrom);
      allOrders = allOrders.filter((ord) => {
        const d = ord.dispatchReadyDate || ord.orderDate;
        return d ? new Date(d) >= from : false;
      });
    }

    if (query.dateTo?.trim()) {
      const to = new Date(query.dateTo);
      to.setHours(23, 59, 59, 999);
      allOrders = allOrders.filter((ord) => {
        const d = ord.dispatchReadyDate || ord.orderDate;
        return d ? new Date(d) <= to : false;
      });
    }

    // Sort by dispatchReadyDate descending
    allOrders.sort((a, b) => {
      const dateA = a.dispatchReadyDate ? new Date(a.dispatchReadyDate).getTime() : 0;
      const dateB = b.dispatchReadyDate ? new Date(b.dispatchReadyDate).getTime() : 0;
      return dateB - dateA;
    });

    // Operational summary calculations
    const summary = {
      totalOrders: allOrders.length,
      totalUnits: allOrders.reduce((sum, o) => sum + o.totalQuantity, 0),
      stagedCount: allOrders.filter((o) => o.dispatchStatus === 'STAGED').length,
      dispatchedCount: allOrders.filter((o) => o.dispatchStatus === 'DISPATCHED').length,
      inTransitCount: allOrders.filter((o) => o.dispatchStatus === 'IN_TRANSIT').length,
      deliveredCount: allOrders.filter((o) => o.dispatchStatus === 'DELIVERED').length,
    };

    // Pagination
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 25));
    const totalItems = allOrders.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = allOrders.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedOrders,
      items: paginatedOrders,
      summary,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  /**
   * Helper to format complex address structures into clean strings
   */
  private formatAddress(addr: any): string {
    if (!addr) return '—';
    if (typeof addr === 'string') {
      const trimmed = addr.trim();
      return trimmed || '—';
    }
    if (typeof addr === 'object') {
      const parts = [
        addr.line1 || addr.addressLine1 || addr.street,
        addr.line2 || addr.addressLine2,
        addr.city,
        addr.state,
        addr.pincode || addr.pinCode || addr.postalCode,
        addr.country,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : '—';
    }
    return '—';
  }
}
