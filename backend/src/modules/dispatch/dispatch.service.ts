import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { CreditService } from '../finance/credit.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Decimal } from '@prisma/client/runtime/library';
import { getAdvancedScope, getSalesScope } from '../../common/utils/rbac.util';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';

import { NotificationsService } from '../notifications/notifications.service';
import {
  isTradingProduct,
  isPureTradingOrder,
  hasManufacturingItems,
} from '../../common/utils/trading-product.util';

function normalizeDispatchCategory(cat?: string | null): 'D1' | 'D2' | null {
  if (!cat) return null;
  const s = String(cat).trim().toUpperCase();
  if (['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'CAT 1', 'CAT_1', '1'].includes(s)) {
    return 'D1';
  }
  if (['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'CAT 2', 'CAT_2', '2'].includes(s)) {
    return 'D2';
  }
  return null;
}

const tradingProductFilter = {
  OR: [
    { isTrading: true },
    { dispatchCategory: { in: ['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'Category 2', 'CAT 2', 'CAT_2', '2'] } },
    { productType: 'TRADING' },
  ],
};

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly creditService: CreditService,
    private readonly sequenceService: SequenceService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  private getWorkOrderTenantScope(companyId: string) {
    return {
      OR: [
        { salesOrderItem: { product: { companyId } } },
        { salesOrderItem: { salesOrder: { customer: { companyId } } } },
        { productionPlan: { salesOrder: { customer: { companyId } } } },
      ],
    };
  }

  private formatAddressValue(value?: any): string {
    if (!value) return '';
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (
        !trimmed ||
        trimmed === 'null' ||
        trimmed === 'undefined' ||
        trimmed === 'N/A' ||
        trimmed === 'Factory Staging Area' ||
        trimmed === 'Customer Designated Delivery Site'
      ) {
        return '';
      }
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return this.formatAddressValue(parsed);
        } catch {
          return trimmed;
        }
      }
      return trimmed;
    }

    if (typeof value === 'object') {
      if (value.formattedAddress && typeof value.formattedAddress === 'string') {
        return value.formattedAddress.trim();
      }
      if (value.fullAddress && typeof value.fullAddress === 'string') {
        return value.fullAddress.trim();
      }
      if (value.address && typeof value.address === 'string') {
        return value.address.trim();
      }

      const streetParts = [
        value.plotNo || value.plotNumber || value.doorNo,
        value.building || value.buildingName || value.premises,
        value.line1 || value.addressLine1 || value.street || value.street1 || value.streetAddress,
        value.line2 || value.addressLine2 || value.street2 || value.landmark || value.area,
        value.line3 || value.addressLine3 || value.locality || value.sector,
      ].filter((p): p is string => Boolean(p && String(p).trim()));

      const city = value.city || value.town || value.district || value.taluka;
      const state = value.state || value.province || value.region;
      const pin = value.postalCode || value.pincode || value.pinCode || value.zipCode || value.zip;
      const country = value.country || value.nation;

      const parts = [
        streetParts.join(', '),
        city,
        state,
        pin,
        country && String(country).toLowerCase() !== 'india' ? country : null,
      ].filter((p): p is string => Boolean(p && String(p).trim()));

      return parts.join(', ');
    }

    return '';
  }

  private isRealCustomerName(name?: any): boolean {
    if (!name || typeof name !== 'string') return false;
    const s = name.trim();
    if (!s) return false;
    const lower = s.toLowerCase();

    if (
      s === '—' ||
      s === '-' ||
      s === 'N/A' ||
      s === 'null' ||
      s === 'undefined' ||
      lower === 'consignee client' ||
      lower === 'client consignee' ||
      lower === 'customer designated delivery site' ||
      lower === 'customer delivery site' ||
      lower === 'customer' ||
      lower === 'consignee' ||
      lower === 'client' ||
      lower === 'client order' ||
      lower.startsWith('client order') ||
      lower === 'production dispatch' ||
      lower === 'factory finished goods' ||
      lower === 'factory staging area' ||
      lower === 'driver assigned' ||
      lower === 'driver' ||
      lower === 'site engineer' ||
      lower === 'site incharge' ||
      lower === 'site supervisor' ||
      lower === 'supervisor' ||
      lower === 'engineer' ||
      lower === 'mth' ||
      lower === 'tl' ||
      lower === 'in-house transport' ||
      lower === 'in house transport'
    ) {
      return false;
    }

    if (s.startsWith('usr_') || s.startsWith('user_') || s.startsWith('USR-')) return false;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return false;
    if (s.replace(/[^a-zA-Z0-9]/g, '').length < 2) return false;

    return true;
  }

  private enrichDispatchCustomer(d: any) {
    if (!d) return d;
    const so = d.salesOrder;
    const lead = so?.quotation?.lead || so?.sourceQuotation?.lead;
    const cust = so?.customer;

    const candidates = [
      cust?.companyName,
      cust?.name,
      lead?.companyName,
      lead?.groupName,
      lead?.projectName,
      lead?.gstName,
      lead?.name,
      so?.customerName,
      d.customerName,
      cust?.contactPerson,
      lead?.contactPerson,
    ];

    let resolvedCustomerName = '';
    for (const c of candidates) {
      if (this.isRealCustomerName(c)) {
        resolvedCustomerName = String(c).trim();
        break;
      }
    }

    if (!resolvedCustomerName) {
      const addrs = [so?.shippingAddress, so?.billingAddress, cust?.shippingAddress, cust?.billingAddress];
      for (const a of addrs) {
        if (a && typeof a === 'object') {
          const cand = (a as any).companyName || (a as any).customerName || (a as any).name;
          if (this.isRealCustomerName(cand)) {
            resolvedCustomerName = String(cand).trim();
            break;
          }
        } else if (a && typeof a === 'string' && a.startsWith('{')) {
          try {
            const p = JSON.parse(a);
            const cand = p.companyName || p.customerName || p.name;
            if (this.isRealCustomerName(cand)) {
              resolvedCustomerName = String(cand).trim();
              break;
            }
          } catch {}
        }
      }
    }

    if (!resolvedCustomerName) {
      resolvedCustomerName = so?.orderNumber ? `Client Order (${so.orderNumber.trim()})` : 'Client Order';
    }

    const cleanDeliveryAddress = this.formatAddressValue(d.deliveryAddress) || d.deliveryAddress;

    return {
      ...d,
      customerName: resolvedCustomerName,
      deliveryAddress: cleanDeliveryAddress,
      salesOrder: so
        ? {
            ...so,
            customerName: resolvedCustomerName,
            customer: cust
              ? { ...cust, companyName: cust.companyName || resolvedCustomerName }
              : { companyName: resolvedCustomerName, contactPerson: resolvedCustomerName },
          }
        : so,
    };
  }

  private readonly dispatchListSelect = {
    id: true,
    dispatchNo: true,
    salesOrderId: true,
    dispatchCategory: true,
    status: true,
    isSubmitted: true,
    deliveryAddress: true,
    specialInstructions: true,
    packageCount: true,
    packageType: true,
    totalWeight: true,
    transporterName: true,
    vehicleNumber: true,
    vehicleType: true,
    driverName: true,
    driverPhone: true,
    lrNumber: true,
    freightType: true,
    freightAmount: true,
    trackingRef: true,
    documentChecklist: true,
    dispatchedAt: true,
    dispatchedById: true,
    gateOutAt: true,
    gatePassNumber: true,
    invoiceNumber: true,
    ewayBillNumber: true,
    currentLocation: true,
    eta: true,
    transitCondition: true,
    transitRemarks: true,
    outForDeliveryAt: true,
    deliveredAt: true,
    deliveredQuantity: true,
    shortQuantity: true,
    damagedQuantity: true,
    receivedBy: true,
    receiverDesignation: true,
    receiverPhone: true,
    deliveryRemarks: true,
    deliveryPhotoUrl: true,
    signatureUrl: true,
    podUrl: true,
    podReceivedAt: true,
    podStatus: true,
    closedAt: true,
    deliveredById: true,
    createdById: true,
    createdAt: true,
    updatedAt: true,
    workflowState: {
      select: { id: true, code: true, name: true },
    },
    salesOrder: {
      select: {
        id: true,
        orderNumber: true,
        status: true,
        orderDate: true,
        createdAt: true,
        customerId: true,
        salesExecutiveId: true,
        shippingAddress: true,
        billingAddress: true,
        freightAmount: true,
        totalAmount: true,
        requestedDeliveryDate: true,
        remarks: true,
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            phone: true,
            shippingAddress: true,
            billingAddress: true,
          },
        },
        salesExecutive: {
          select: { id: true, name: true, email: true },
        },
        sourceQuotation: {
          select: {
            id: true,
            quotationNumber: true,
            lead: {
              select: {
                companyName: true,
                groupName: true,
                projectName: true,
                gstName: true,
                contactPerson: true,
              },
            },
          },
        },
      },
    },
    items: {
      select: {
        id: true,
        dispatchId: true,
        salesOrderItemId: true,
        quantity: true,
        createdAt: true,
        salesOrderItem: {
          select: {
            id: true,
            productId: true,
            productNameSnapshot: true,
            productCodeSnapshot: true,
            orderedQuantity: true,
            unit: true,
            unitPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                publicId: true,
                category: true,
                productType: true,
                dispatchCategory: true,
                unit: true,
                isTrading: true,
                weight: true,
              },
            },
          },
        },
      },
    },
  } as const;

  private async resolveCategoryScope(
    userId?: string,
    role?: string,
    category?: string,
  ): Promise<{ effectiveCat: 'D1' | 'D2' | null; categoryWhere: any }> {
    const normalizedRole = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');
    const d2CategoryValues = ['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'Category 2'];

    let effectiveCat: 'D1' | 'D2' | null = normalizeDispatchCategory(category);
    if (!effectiveCat) {
      if (normalizedRole === 'DISPATCH_1') effectiveCat = 'D1';
      else if (normalizedRole === 'DISPATCH_2') effectiveCat = 'D2';
      else if (
        userId &&
        (normalizedRole === 'DISPATCH_EXECUTIVE' || normalizedRole.includes('DISPATCH'))
      ) {
        const user: any = this.prisma.user?.findUnique
          ? await this.prisma.user.findUnique({
              where: { id: userId },
              select: { id: true, email: true, dispatchCategory: true },
            })
          : null;
        const userEmail = String(user?.email || '').toLowerCase();
        let resolvedCat = user?.dispatchCategory;
        if (!resolvedCat) {
          if (userEmail.includes('sahad')) resolvedCat = 'D2';
          else if (userEmail.includes('ravikant')) resolvedCat = 'D1';
        }
        if (resolvedCat && !['ALL', 'ALL CATEGORIES', 'SUPER'].includes(String(resolvedCat).toUpperCase())) {
          effectiveCat = normalizeDispatchCategory(resolvedCat);
        }
      }
    }

    if (effectiveCat === 'D1') {
      return {
        effectiveCat,
        categoryWhere: {
          AND: [
            { dispatchCategory: { notIn: d2CategoryValues } },
            {
              items: {
                none: {
                  salesOrderItem: {
                    product: tradingProductFilter,
                  },
                },
              },
            },
          ],
        },
      };
    }
    if (effectiveCat === 'D2') {
      return {
        effectiveCat,
        categoryWhere: {
          OR: [
            { dispatchCategory: { in: d2CategoryValues } },
            {
              items: {
                some: {
                  salesOrderItem: {
                    product: tradingProductFilter,
                  },
                },
              },
            },
          ],
        },
      };
    }
    return { effectiveCat: null, categoryWhere: {} };
  }

  async listDispatches(
    userId?: string,
    role?: string,
    status?: string,
    category?: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      salesOrderId?: string;
      dateFrom?: string;
      dateTo?: string;
      compact?: boolean;
    },
  ) {
    const scope = getSalesScope(userId, role, 'Dispatch');
    const { categoryWhere } = await this.resolveCategoryScope(userId, role, category);

    const andConditions: any[] = [];
    if (scope && Object.keys(scope).length > 0) {
      andConditions.push(scope);
    }
    if (categoryWhere && Object.keys(categoryWhere).length > 0) {
      andConditions.push(categoryWhere);
    }

    if (status) {
      if (typeof status === 'string' && status.includes(',')) {
        const statuses = status.split(',').map((s: string) => s.trim()).filter(Boolean);
        andConditions.push({ status: { in: statuses } });
      } else {
        andConditions.push({ status });
      }
    }

    if (options?.salesOrderId) {
      const ref = options.salesOrderId;
      andConditions.push({
        OR: [
          { salesOrderId: ref },
          { salesOrder: { orderNumber: { equals: ref, mode: 'insensitive' } } },
        ],
      });
    }

    if (options?.dateFrom || options?.dateTo) {
      const range: any = {};
      if (options.dateFrom) range.gte = new Date(options.dateFrom);
      if (options.dateTo) {
        const end = new Date(options.dateTo);
        if (options.dateTo.length <= 10) end.setUTCHours(23, 59, 59, 999);
        range.lte = end;
      }
      andConditions.push({
        OR: [{ deliveredAt: range }, { dispatchedAt: range }, { createdAt: range }],
      });
    }

    if (options?.search) {
      const q = options.search.trim();
      if (q) {
        andConditions.push({
          OR: [
            { dispatchNo: { contains: q, mode: 'insensitive' } },
            { invoiceNumber: { contains: q, mode: 'insensitive' } },
            { gatePassNumber: { contains: q, mode: 'insensitive' } },
            { ewayBillNumber: { contains: q, mode: 'insensitive' } },
            { vehicleNumber: { contains: q, mode: 'insensitive' } },
            { transporterName: { contains: q, mode: 'insensitive' } },
            { driverName: { contains: q, mode: 'insensitive' } },
            { receivedBy: { contains: q, mode: 'insensitive' } },
            { salesOrder: { orderNumber: { contains: q, mode: 'insensitive' } } },
            { salesOrder: { customer: { companyName: { contains: q, mode: 'insensitive' } } } },
            { salesOrder: { customer: { contactPerson: { contains: q, mode: 'insensitive' } } } },
            {
              items: {
                some: {
                  OR: [
                    { salesOrderItem: { productNameSnapshot: { contains: q, mode: 'insensitive' } } },
                    { salesOrderItem: { product: { name: { contains: q, mode: 'insensitive' } } } },
                    { salesOrderItem: { product: { sku: { contains: q, mode: 'insensitive' } } } },
                  ],
                },
              },
            },
          ],
        });
      }
    }

    const where: any = andConditions.length === 1 ? andConditions[0] : andConditions.length > 1 ? { AND: andConditions } : {};

    const isPaginated = options?.page !== undefined;
    const page = options?.page ?? 1;
    const limit = options?.limit ?? (isPaginated ? 25 : undefined);
    const skip = isPaginated && limit ? (page - 1) * limit : undefined;

    if (isPaginated && limit) {
      const [dispatches, total] = await Promise.all([
        this.prisma.dispatch.findMany({
          where,
          select: this.dispatchListSelect as any,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.dispatch.count({ where }),
      ]);

      const enriched = dispatches.map((d: any) => this.enrichDispatchCustomer(d));
      return {
        data: enriched,
        items: enriched,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }

    const dispatches = await this.prisma.dispatch.findMany({
      where,
      select: this.dispatchListSelect as any,
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });

    return dispatches.map((d: any) => this.enrichDispatchCustomer(d));
  }

  async getDashboardSummary(
    userId?: string,
    role?: string,
    companyId?: string,
    category?: string,
  ) {
    const scope = getSalesScope(userId, role, 'Dispatch');
    const { effectiveCat, categoryWhere } = await this.resolveCategoryScope(userId, role, category);

    const baseAnd: any[] = [];
    if (scope && Object.keys(scope).length > 0) baseAnd.push(scope);
    if (categoryWhere && Object.keys(categoryWhere).length > 0) baseAnd.push(categoryWhere);
    const baseWhere: any = baseAnd.length === 1 ? baseAnd[0] : baseAnd.length > 1 ? { AND: baseAnd } : {};

    // IST start of today
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIst = new Date(Date.now() + IST_OFFSET_MS);
    const startOfTodayUtc = new Date(
      Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate(), 0, 0, 0, 0) - IST_OFFSET_MS,
    );

    const [
      totalDispatches,
      inTransitCount,
      deliveredCount,
      deliveredTodayCount,
      dispatchedTodayCount,
      recentDispatches,
      queueResult,
      returnsCount,
      replacementsCount,
    ] = await Promise.all([
      this.prisma.dispatch.count({ where: baseWhere }),
      this.prisma.dispatch.count({
        where: {
          AND: [
            baseWhere,
            { status: { in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DISPATCHED', 'READY_FOR_PICKUP', 'LOADING_IN_PROGRESS'] } },
          ],
        },
      }),
      this.prisma.dispatch.count({
        where: {
          AND: [
            baseWhere,
            { status: { in: ['DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED'] } },
          ],
        },
      }),
      this.prisma.dispatch.count({
        where: {
          AND: [
            baseWhere,
            { status: { in: ['DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED'] } },
            { deliveredAt: { gte: startOfTodayUtc } },
          ],
        },
      }),
      this.prisma.dispatch.count({
        where: {
          AND: [
            baseWhere,
            {
              OR: [
                { dispatchedAt: { gte: startOfTodayUtc } },
                { createdAt: { gte: startOfTodayUtc } },
              ],
            },
          ],
        },
      }),
      this.prisma.dispatch.findMany({
        where: baseWhere,
        select: this.dispatchListSelect as any,
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      companyId
        ? this.getDispatchQueue(userId || '', role || '', companyId, effectiveCat || category, {
            page: 1,
            limit: 10,
          }).catch(() => ({ data: [], pagination: { total: 0 }, summary: { totalOrders: 0, totalPartialOrders: 0, totalRemainingQty: 0 } }))
        : Promise.resolve({ data: [], pagination: { total: 0 }, summary: { totalOrders: 0, totalPartialOrders: 0, totalRemainingQty: 0 } }),
      (this.prisma as any).salesReturn?.count
        ? (this.prisma as any).salesReturn.count().catch(() => 0)
        : Promise.resolve(0),
      (this.prisma as any).replacementRequest?.count
        ? (this.prisma as any).replacementRequest.count().catch(() => 0)
        : Promise.resolve(0),
    ]);

    const queueSummary = (queueResult as any)?.summary || {};
    const queueList = Array.isArray(queueResult) ? queueResult : (queueResult as any)?.data || [];
    const pendingQueueCount = Array.isArray(queueResult)
      ? queueResult.length
      : Number((queueResult as any)?.pagination?.total ?? queueSummary.totalOrders ?? 0);

    return {
      category: effectiveCat || category || 'ALL',
      counts: {
        totalDispatches,
        pendingQueue: pendingQueueCount,
        partialRemaining: Number(queueSummary.totalPartialOrders ?? 0),
        totalRemainingQty: Number(queueSummary.totalRemainingQty ?? 0),
        inTransit: inTransitCount,
        delivered: deliveredCount,
        deliveredToday: deliveredTodayCount,
        dispatchedToday: dispatchedTodayCount,
        returns: returnsCount,
        replacements: replacementsCount,
      },
      recentDispatches: recentDispatches.map((d: any) => this.enrichDispatchCustomer(d)),
      recentQueue: queueList.slice(0, 10),
    };
  }

  async getCreateContext(
    userId: string,
    role: string,
    companyId: string,
    params: {
      category?: string;
      salesOrderId?: string;
      orderNumber?: string;
      workOrderId?: string;
      workOrderIds?: string[];
    },
  ) {
    const [queueItems, invoiceMeta, directSo] = await Promise.all([
      this.getDispatchQueue(userId, role, companyId, params.category),
      this.getNextInvoiceNumber().catch(() => ({ nextInvoiceNumber: '', existingInvoices: [] })),
      params.salesOrderId || params.orderNumber
        ? this.prisma.salesOrder.findFirst({
            where: {
              deletedAt: null,
              OR: [
                ...(params.salesOrderId ? [{ id: params.salesOrderId }, { orderNumber: { equals: params.salesOrderId, mode: 'insensitive' as any } }] : []),
                ...(params.orderNumber ? [{ orderNumber: { equals: params.orderNumber, mode: 'insensitive' as any } }] : []),
              ],
            },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              orderDate: true,
              createdAt: true,
              shippingAddress: true,
              billingAddress: true,
              freightAmount: true,
              totalAmount: true,
              requestedDeliveryDate: true,
              remarks: true,
              customer: {
                select: {
                  id: true,
                  companyName: true,
                  contactPerson: true,
                  phone: true,
                  shippingAddress: true,
                  billingAddress: true,
                },
              },
              salesExecutive: { select: { id: true, name: true, email: true } },
              sourceQuotation: {
                select: {
                  id: true,
                  quotationNumber: true,
                  lead: {
                    select: {
                      companyName: true,
                      groupName: true,
                      projectName: true,
                      contactPerson: true,
                      address: true,
                    },
                  },
                },
              },
              items: {
                select: {
                  id: true,
                  productId: true,
                  productNameSnapshot: true,
                  productCodeSnapshot: true,
                  orderedQuantity: true,
                  unit: true,
                  unitPrice: true,
                  product: {
                    select: {
                      id: true,
                      name: true,
                      sku: true,
                      publicId: true,
                      category: true,
                      productType: true,
                      dispatchCategory: true,
                      unit: true,
                      isTrading: true,
                      weight: true,
                      coverUnitWeight: true,
                      coversPerSet: true,
                      frameUnitWeight: true,
                      framesPerSet: true,
                    },
                  },
                  workOrders: {
                    select: {
                      id: true,
                      workOrderNumber: true,
                      status: true,
                      productionStatus: true,
                      quantity: true,
                      sentToDispatchAt: true,
                      dispatchedAt: true,
                    },
                  },
                  dispatchItems: {
                    select: {
                      quantity: true,
                      dispatch: { select: { id: true, status: true } },
                    },
                  },
                },
              },
            },
          })
        : Promise.resolve(null),
    ]);

    const queueArray = Array.isArray(queueItems) ? queueItems : (queueItems as any)?.data || [];
    return {
      queue: queueArray,
      directSalesOrder: directSo,
      invoiceMeta,
    };
  }

  async getDispatch(id: string, userId?: string, role?: string) {
    let scope = getSalesScope(userId, role, 'Dispatch');
    const normalizedRole = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');

    const d1CategoryValues = ['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'Category 1'];
    const d2CategoryValues = ['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'Category 2'];

    if (normalizedRole === 'DISPATCH_1') {
      scope = {
        ...scope,
        AND: [
          { dispatchCategory: { notIn: d2CategoryValues } },
          {
            items: {
              none: {
                salesOrderItem: {
                  product: tradingProductFilter,
                },
              },
            },
          },
        ],
      };
    } else if (normalizedRole === 'DISPATCH_2') {
      scope = {
        ...scope,
        OR: [
          { dispatchCategory: { in: d2CategoryValues } },
          {
            items: {
              some: {
                salesOrderItem: {
                  product: tradingProductFilter,
                },
              },
            },
          },
        ],
      };
    } else if (
      userId &&
      (normalizedRole === 'DISPATCH_EXECUTIVE' || normalizedRole.includes('DISPATCH'))
    ) {
      const user: any = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const userEmail = String(user?.email || '').toLowerCase();
      let resolvedCat = user?.dispatchCategory;
      if (!resolvedCat) {
        if (userEmail.includes('sahad')) resolvedCat = 'D2';
        else if (userEmail.includes('ravikant')) resolvedCat = 'D1';
      }

      if (resolvedCat && !['ALL', 'ALL CATEGORIES', 'SUPER'].includes(String(resolvedCat).toUpperCase())) {
        const norm = normalizeDispatchCategory(resolvedCat);
        if (norm === 'D1') {
          scope = {
            ...scope,
            AND: [
              { dispatchCategory: { notIn: d2CategoryValues } },
              {
                items: {
                  none: {
                    salesOrderItem: {
                      product: tradingProductFilter,
                    },
                  },
                },
              },
            ],
          };
        } else if (norm === 'D2') {
          scope = {
            ...scope,
            OR: [
              { dispatchCategory: { in: d2CategoryValues } },
              {
                items: {
                  some: {
                    salesOrderItem: {
                      product: tradingProductFilter,
                    },
                  },
                },
              },
            ],
          };
        }
      }
    }

    const dispatch = await this.prisma.dispatch.findFirst({
      where: {
        AND: [
          scope,
          {
            OR: [
              { id },
              { dispatchNo: id },
              { dispatchNo: { contains: id, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        salesOrder: {
          include: {
            customer: true,
            salesExecutive: { select: { id: true, name: true, email: true } },
            sourceQuotation: { select: { id: true, quotationNumber: true, lead: true } },
            quotation: { select: { id: true, quotationNumber: true, lead: true } },
          },
        },
        items: {
          include: {
            salesOrderItem: {
              include: {
                product: true,
              },
            },
          },
        },
        workflowState: true,
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    return this.enrichDispatchCustomer(dispatch);
  }

  async getNextInvoiceNumber(): Promise<{ nextInvoiceNumber: string; existingInvoices: string[] }> {
    const currentYear = new Date().getFullYear();
    const dispatches = await this.prisma.dispatch.findMany({
      where: {
        invoiceNumber: { not: null },
      },
      select: { invoiceNumber: true },
    });
    const invoices = await this.prisma.salesInvoice.findMany({
      where: {
        invoiceNumber: { not: '' },
        status: { notIn: ['CANCELLED', 'VOID'] },
      },
      select: { invoiceNumber: true },
    });

    const set = new Set<string>();
    const allNums: number[] = [];

    const processNum = (inv?: string | null) => {
      if (!inv) return;
      const clean = inv.trim();
      set.add(clean.toLowerCase());
      const match = clean.match(/(\d+)$/);
      if (match) {
        allNums.push(parseInt(match[1], 10));
      }
    };

    dispatches.forEach((d) => processNum(d.invoiceNumber));
    invoices.forEach((i) => processNum(i.invoiceNumber));

    let nextNum = (allNums.length > 0 ? Math.max(...allNums) : 0) + 1;
    let candidate = `INV-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    while (set.has(candidate.toLowerCase())) {
      nextNum++;
      candidate = `INV-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    }

    return {
      nextInvoiceNumber: candidate,
      existingInvoices: Array.from(set),
    };
  }

  async createDispatch(dto: CreateDispatchDto, userId?: string) {
    if (!dto.items?.length)
      throw new BadRequestException('At least one dispatch item is required');
    if (dto.items.some((item) => Number(item.quantity) <= 0)) {
      throw new BadRequestException(
        'Dispatch quantities must be greater than zero',
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        console.log('[DISPATCH 01] Load sales order:', dto.salesOrderId);
        let so = await tx.salesOrder.findUnique({
          where: { id: dto.salesOrderId },
          include: {
            customer: true,
            items: {
              include: {
                dispatchItems: {
                  include: { dispatch: true },
                },
              },
            },
            workflowState: true,
          },
        });
        if (!so) {
          const ordNo = (dto as any).orderNumber ? String((dto as any).orderNumber).trim() : '';
          const soKey = String(dto.salesOrderId || '').trim();
          so = await tx.salesOrder.findFirst({
            where: {
              OR: [
                { id: soKey },
                { orderNumber: soKey },
                { orderNumber: { equals: soKey, mode: 'insensitive' } },
                ...(ordNo ? [{ orderNumber: ordNo }, { orderNumber: { equals: ordNo, mode: 'insensitive' as any } }] : []),
              ],
            },
            include: {
              customer: true,
              salesExecutive: { select: { id: true, name: true, email: true } },
              items: {
                include: {
                  dispatchItems: {
                    include: { dispatch: true },
                  },
                },
              },
              workflowState: true,
            },
          });
        }
        if (!so) throw new NotFoundException('Sales Order not found');

        // Database-level row lock to serialize concurrent dispatch creation
        await tx.$queryRaw`
          SELECT id FROM "SalesOrder"
          WHERE id = ${so.id}
          FOR UPDATE
        `;

        // Lock SalesOrderItems in deterministic sorted order to prevent deadlocks
        const itemIdsToLock = so.items.map((i) => i.id).sort();
        for (const itemId of itemIdsToLock) {
          await tx.$queryRaw`
            SELECT id FROM "SalesOrderItem"
            WHERE id = ${itemId}
            FOR UPDATE
          `;
        }

        // Reload fresh items state inside lock to get authoritative dispatch state
        const freshItems = await tx.salesOrderItem.findMany({
          where: { salesOrderId: so.id },
          include: {
            dispatchItems: {
              include: { dispatch: true },
            },
          },
        });
        so.items = freshItems;

        console.log('[DISPATCH 02] Generate dispatch sequence number');
        const dispatchNo = await this.sequenceService.generateNextWithTx(
          tx,
          'dispatch_number',
          `DISP - ${new Date().getFullYear()} -`,
        );

        let invoiceSubtotal = new Decimal(0);
        let invoiceDiscount = new Decimal(0);
        let invoiceTaxable = new Decimal(0);
        let invoiceTax = new Decimal(0);
        const soItemsMap = new Map(so.items.map((item) => [item.id, item]));
        const invoiceLines: any[] = [];

        // Pre-fetch warehouse, products, workOrders, finishedGoods & allocations once outside the item loop
        const allProductIds = Array.from(
          new Set(so.items.map((si) => si.productId).filter(Boolean)),
        );
        const allSoItemIds = so.items.map((si) => si.id);
        const [
          fgWarehouse,
          fallbackWarehouse,
          prefetchedProducts,
          prefetchedWorkOrders,
          prefetchedAllocations,
        ] = await Promise.all([
          tx.warehouse.findFirst({
            where: { companyId: so.customer.companyId, name: 'Finished Goods' },
            select: { id: true },
          }),
          tx.warehouse.findFirst({
            where: { companyId: so.customer.companyId },
            select: { id: true },
          }),
          allProductIds.length > 0
            ? tx.product.findMany({
                where: { id: { in: allProductIds } },
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  unit: true,
                  dispatchCategory: true,
                  productType: true,
                  isTrading: true,
                  category: true,
                },
              })
            : Promise.resolve([]),
          allSoItemIds.length > 0
            ? tx.workOrder.findMany({
                where: { salesOrderItemId: { in: allSoItemIds } },
                include: {
                  qcInspections: { where: { status: 'APPROVED' } },
                },
              })
            : Promise.resolve([]),
          allSoItemIds.length > 0
            ? tx.salesOrderAllocation.findMany({
                where: {
                  salesOrderItemId: { in: allSoItemIds },
                  allocationType: 'FINISHED_GOODS_RESERVATION',
                  reservedQuantity: { gt: 0 },
                },
              })
            : Promise.resolve([]),
        ]);
        const resolvedWarehouse = fgWarehouse || fallbackWarehouse;
        const productById = new Map<string, any>(
          (prefetchedProducts as any[]).map((p: any) => [p.id, p]),
        );
        const wosBySoItemId = new Map<string, any[]>();
        for (const wo of prefetchedWorkOrders as any[]) {
          if (!wo.salesOrderItemId) continue;
          const list = wosBySoItemId.get(wo.salesOrderItemId) || [];
          list.push(wo);
          wosBySoItemId.set(wo.salesOrderItemId, list);
        }
        const allocsBySoItemId = new Map<string, any[]>();
        for (const alloc of prefetchedAllocations as any[]) {
          const list = allocsBySoItemId.get(alloc.salesOrderItemId) || [];
          list.push(alloc);
          allocsBySoItemId.set(alloc.salesOrderItemId, list);
        }

        for (const item of dto.items) {
          let soItem = soItemsMap.get(item.salesOrderItemId);
          if (!soItem && item.productId) {
            soItem = so.items.find((si) => si.productId === item.productId);
          }
          if (!soItem && so.items.length === 1) {
            soItem = so.items[0];
          }
          if (!soItem) {
            soItem = so.items.find(
              (si) =>
                si.id.toLowerCase() === String(item.salesOrderItemId).toLowerCase() ||
                String(item.salesOrderItemId).toLowerCase().includes(si.id.toLowerCase()),
            );
          }
          if (!soItem) {
            throw new BadRequestException(
              `Order item ${item.salesOrderItemId} does not belong to this order`,
            );
          }

          const validDispatchItems = (soItem.dispatchItems || []).filter(
            (di: any) =>
              !di.dispatch ||
              !['CANCELLED', 'REJECTED'].includes(di.dispatch.status),
          );
          const alreadyDispatched = validDispatchItems.reduce(
            (sum: number, di: any) => sum + Number(di.quantity || 0),
            0,
          );

          let requestedQty = Number(item.quantity);
          if (requestedQty <= 0) {
            throw new BadRequestException(
              'Dispatch quantity must be greater than zero',
            );
          }

          const remainingOrderQty = Math.max(
            0,
            Number(soItem.orderedQuantity || 0) - alreadyDispatched,
          );

          if (remainingOrderQty <= 0) {
            throw new BadRequestException(
              `Order item ${soItem.productNameSnapshot || soItem.id} has already been fully dispatched (Remaining: 0)`,
            );
          }

          if (requestedQty > remainingOrderQty) {
            throw new BadRequestException(
              `Requested dispatch quantity (${requestedQty}) exceeds remaining order quantity (${remainingOrderQty}) for ${soItem.productNameSnapshot || soItem.id}`,
            );
          }

          // 2. Validate against QC approved quantity (using pre-fetched map)
          const wos = wosBySoItemId.get(item.salesOrderItemId) || wosBySoItemId.get(soItem.id) || [];
          const totalQcApproved = wos.reduce((sum, wo) => {
            const approved =
              wo.qcInspections.length > 0
                ? wo.qcInspections.reduce(
                    (s, qc) =>
                      s + Number(qc.approvedQuantity ?? wo.quantity ?? 0),
                    0,
                  )
                : Number(wo.quantity || 0);
            return sum + approved;
          }, 0);

          if (alreadyDispatched + requestedQty > totalQcApproved) {
            console.warn(
              `QC Warning: Dispatch quantity(${requestedQty}) + already dispatched(${alreadyDispatched}) exceeds QC - approved quantity(${totalQcApproved}) for product ${soItem.productNameSnapshot}. Allowing dispatch to proceed.`,
            );
          }

          // Validate Finished Goods Stock in Database
          let fgRecords = await tx.finishedGoods.findMany({
            where: { productId: soItem.productId },
          });

          if (!fgRecords.length) {
            const prod = productById.get(soItem.productId);
            if (prod) {
              fgRecords = await tx.finishedGoods.findMany({
                where: {
                  OR: [
                    { productId: prod.id },
                    { product: { sku: prod.sku } },
                    {
                      product: {
                        name: { equals: prod.name, mode: 'insensitive' },
                      },
                    },
                  ],
                },
              });
            }
          }

          const allocations = allocsBySoItemId.get(item.salesOrderItemId) || allocsBySoItemId.get(soItem.id) || [];
          const reservedQty = allocations.reduce(
            (sum, r) => sum + Number(r.reservedQuantity),
            0,
          );

          const fromRes = Math.min(requestedQty, reservedQty);
          const fromAvail = Math.max(0, requestedQty - reservedQty);

          // Calculate current total stocks across fgRecords
          const totalFgPhysical = fgRecords.reduce(
            (sum, r) => sum + Number(r.quantity || 0),
            0,
          );
          const totalFgAvailable = fgRecords.reduce(
            (sum, r) => sum + Number(r.availableQuantity || 0),
            0,
          );
          const totalFgReserved = fgRecords.reduce(
            (sum, r) => sum + Number(r.reservedQuantity || 0),
            0,
          );

          // Auto-provision finished goods batch if stock records are uninitialized or insufficient
          const physicalShortage = Math.max(0, requestedQty - totalFgPhysical);
          const availShortage = Math.max(0, fromAvail - totalFgAvailable);
          const resShortage = Math.max(0, fromRes - totalFgReserved);

          if (!fgRecords.length || physicalShortage > 0 || availShortage > 0 || resShortage > 0) {
            let primaryFg = fgRecords[0];
            if (!primaryFg) {
              let targetWoId = wos[0]?.id;
              if (!targetWoId) {
                const plan =
                  (await tx.productionPlan.findFirst({
                    where: { salesOrderId: so.id },
                  })) ||
                  (await tx.productionPlan.create({
                    data: {
                      planNumber: `PLAN-${Date.now().toString().slice(-6)}`,
                      salesOrderId: so.id,
                      status: 'APPROVED',
                    },
                  }));
                const createdWo = await tx.workOrder.create({
                  data: {
                    workOrderNumber: `WO-${Date.now().toString().slice(-6)}`,
                    productionPlanId: plan.id,
                    salesOrderItemId: soItem.id,
                    quantity: requestedQty,
                    status: 'READY_FOR_DISPATCH',
                  },
                });
                targetWoId = createdWo.id;
              }

              primaryFg = await tx.finishedGoods.create({
                data: {
                  workOrderId: targetWoId,
                  productId: soItem.productId,
                  quantity: requestedQty,
                  availableQuantity: fromAvail,
                  reservedQuantity: fromRes,
                  unit: productById.get(soItem.productId)?.unit || 'PCS',
                  status: 'AVAILABLE',
                  salesOrderId: so.id,
                },
              });
              fgRecords = [primaryFg];
            } else {
              const dataToUpdate: any = {};
              if (physicalShortage > 0) {
                dataToUpdate.quantity = { increment: physicalShortage };
                primaryFg.quantity = ((Number(primaryFg.quantity) || 0) + physicalShortage) as any;
              }
              if (availShortage > 0) {
                dataToUpdate.availableQuantity = { increment: availShortage };
                primaryFg.availableQuantity = ((Number(primaryFg.availableQuantity) || 0) + availShortage) as any;
              }
              if (resShortage > 0) {
                dataToUpdate.reservedQuantity = { increment: resShortage };
                primaryFg.reservedQuantity = ((Number(primaryFg.reservedQuantity) || 0) + resShortage) as any;
              }

              if (Object.keys(dataToUpdate).length > 0) {
                await tx.finishedGoods.update({
                  where: { id: primaryFg.id },
                  data: dataToUpdate,
                });
              }
            }
          }

          // Deduct from reserves (physical stock and reservation)
          if (fromRes > 0) {
            let remainingFromRes = fromRes;
            for (const fg of fgRecords) {
              if (remainingFromRes <= 0) break;
              const currentQty = Number(fg.quantity || 0);
              if (currentQty <= 0) continue;

              const deduct = Math.min(currentQty, remainingFromRes);

              await tx.finishedGoods.update({
                where: { id: fg.id },
                data: {
                  quantity: { decrement: deduct },
                  reservedQuantity: {
                    decrement: Math.min(Number(fg.reservedQuantity || 0), deduct),
                  },
                },
              });

              remainingFromRes -= deduct;
            }

            // Decrement reservedQuantity on allocations
            let remainingAllocationToDeduct = fromRes;
            for (const alloc of allocations) {
              if (remainingAllocationToDeduct <= 0) break;
              const currentReserved = Number(alloc.reservedQuantity || 0);
              const deduct = Math.min(
                currentReserved,
                remainingAllocationToDeduct,
              );

              await tx.salesOrderAllocation.update({
                where: { id: alloc.id },
                data: {
                  reservedQuantity: { decrement: deduct },
                },
              });

              remainingAllocationToDeduct -= deduct;
            }
          }

          // Deduct from available stock (both physical and available)
          if (fromAvail > 0) {
            let remainingFromAvail = fromAvail;
            for (const fg of fgRecords) {
              if (remainingFromAvail <= 0) break;
              const currentAvail = Number(fg.availableQuantity || 0);
              if (currentAvail <= 0) continue;

              const deduct = Math.min(currentAvail, remainingFromAvail);

              await tx.finishedGoods.update({
                where: { id: fg.id },
                data: {
                  availableQuantity: { decrement: deduct },
                  quantity: { decrement: Math.min(Number(fg.quantity || 0), deduct) },
                },
              });

              remainingFromAvail -= deduct;
            }
          }

          // Record Inventory Transaction for Audit Trail (hoisted warehouse)
          if (resolvedWarehouse) {
            await tx.inventoryTransaction.create({
              data: {
                companyId: so.customer.companyId,
                productId: soItem.productId,
                warehouseId: resolvedWarehouse.id,
                type: 'OUT',
                quantity: requestedQty,
                referenceType: 'FINISHED_GOODS_DISPATCH',
                referenceId: dispatchNo,
              },
            });
          }

          const qty = new Decimal(item.quantity);
          const unitPrice = soItem.unitPrice;
          const lineTotal = qty.mul(unitPrice);

          let lineDiscount = new Decimal(0);
          if (soItem.discountAmount) {
            lineDiscount = soItem.discountAmount;
          }

          const taxable = lineTotal.sub(lineDiscount);
          const tax = taxable.mul(soItem.taxRate || 0).div(100);

          invoiceSubtotal = invoiceSubtotal.add(lineTotal);
          invoiceDiscount = invoiceDiscount.add(lineDiscount);
          invoiceTaxable = invoiceTaxable.add(taxable);
          invoiceTax = invoiceTax.add(tax);

          invoiceLines.push({
            salesOrderItemId: item.salesOrderItemId,
            quantity: item.quantity,
            unitPrice: soItem.unitPrice,
            discountAmount: lineDiscount,
            taxableAmount: taxable,
            taxRate: soItem.taxRate,
            taxAmount: tax,
            lineTotal: taxable.add(tax),
            amount: taxable.add(tax),
          });
        }

        const invoiceFreight = new Decimal(dto.freightAmount || 0);
        const invoiceTotal = invoiceTaxable.add(invoiceTax).add(invoiceFreight);

        // Check credit
        const creditCheck = await this.creditService.checkCreditLimit(
          so.customerId,
          invoiceTotal.toNumber(),
          'DISPATCH',
        );
        if (!creditCheck.allowed) {
          throw new BadRequestException(
            `Credit limit exceeded.Limit: ${creditCheck.creditLimit}, Projected: ${creditCheck.projectedBalance}. Dispatch blocked.`,
          );
        }

        // Determine routing classification using pre-fetched products map (zero extra queries)
        let hasAnyTrading = false;
        let hasAnyManufacturing = false;
        for (const item of dto.items) {
          const soItem = soItemsMap.get(item.salesOrderItemId);
          if (soItem?.productId) {
            const prod = productById.get(soItem.productId);
            if (prod && isTradingProduct(prod, soItem)) {
              hasAnyTrading = true;
            } else {
              hasAnyManufacturing = true;
            }
          }
        }

        const detectedCategory: 'D1' | 'D2' = hasAnyTrading && !hasAnyManufacturing ? 'D2' : 'D1';
        const requestedCat = normalizeDispatchCategory(dto.dispatchCategory);

        // Hard Invariant: Dispatch 1 cannot dispatch Category 2, Dispatch 2 cannot dispatch Category 1
        if (requestedCat === 'D1' && hasAnyTrading) {
          throw new BadRequestException('Dispatch 1 (Cat 1) cannot dispatch Trading / Category 2 products.');
        }
        if (requestedCat === 'D2' && hasAnyManufacturing) {
          throw new BadRequestException('Dispatch 2 (Cat 2) cannot dispatch Manufacturing / Category 1 products.');
        }

        if (userId) {
          const userRecord = await tx.user.findUnique({
            where: { id: userId },
            include: { role: true },
          });
          const normalizedRole = String(userRecord?.role?.code || '').toUpperCase().replace(/[\s-]+/g, '_');
          const userCat = normalizeDispatchCategory(userRecord?.dispatchCategory);
          if ((normalizedRole === 'DISPATCH_1' || userCat === 'D1') && hasAnyTrading) {
            throw new BadRequestException('Dispatch 1 (Cat 1) cannot dispatch Trading / Category 2 products.');
          }
          if ((normalizedRole === 'DISPATCH_2' || userCat === 'D2') && hasAnyManufacturing) {
            throw new BadRequestException('Dispatch 2 (Cat 2) cannot dispatch Manufacturing / Category 1 products.');
          }
        }

        const finalDispatchCategory = requestedCat || detectedCategory;

        // Validate Invoice Number Uniqueness across both dispatches and invoices
        if (dto.invoiceNumber?.trim()) {
          const trimmedInv = dto.invoiceNumber.trim();
          const existingDisp = await tx.dispatch.findFirst({
            where: {
              invoiceNumber: { equals: trimmedInv, mode: 'insensitive' },
            },
            select: { id: true, dispatchNo: true },
          });
          if (existingDisp) {
            throw new BadRequestException('This invoice is already exist.');
          }

          const existingInv = await tx.salesInvoice.findFirst({
            where: {
              invoiceNumber: { equals: trimmedInv, mode: 'insensitive' },
              status: { notIn: ['CANCELLED', 'VOID'] },
            },
            select: { id: true },
          });
          if (existingInv) {
            throw new BadRequestException('This invoice is already exist.');
          }
        }

        // Create Dispatch record starting directly as IN_TRANSIT
        const dispatch = await tx.dispatch.create({
          data: {
            dispatchNo,
            salesOrderId: so.id,
            dispatchCategory: finalDispatchCategory,
            status: 'IN_TRANSIT',
            isSubmitted: false,
            createdById: userId,
            deliveryAddress: dto.deliveryAddress,
            totalWeight: dto.totalWeight,
            transporterName: dto.transporterName,
            vehicleNumber: dto.vehicleNumber,
            driverName: dto.driverName,
            driverPhone: dto.driverPhone,
            transitRemarks: dto.dispatchRemarks,
            freightAmount: dto.freightAmount,
            eta: dto.expectedDeliveryDate
              ? new Date(dto.expectedDeliveryDate)
              : null,
            invoiceNumber: dto.invoiceNumber,
            gatePassNumber: dto.challanNumber,
            ewayBillNumber: dto.ewayBillNumber,
            lrNumber: dto.lrNumber || dto.ewayBillNumber,
            podUrl: dto.documentUrl || dto.dispatchDocumentUrl || null,
            dispatchedAt: new Date(),
            documentChecklist: {
              challanNumber: dto.challanNumber,
              invoiceNumber: dto.invoiceNumber,
              ewayBillNumber: dto.ewayBillNumber,
              lrNumber: dto.lrNumber || dto.ewayBillNumber,
              driverName: dto.driverName,
              driverPhone: dto.driverPhone,
              vehicleNumber: dto.vehicleNumber,
              transporterName: dto.transporterName,
              dispatchRemarks: dto.dispatchRemarks,
              totalWeight: dto.totalWeight,
              expectedDeliveryDate: dto.expectedDeliveryDate,
              fetchedTransportationCost: dto.fetchedTransportationCost,
              toBePaid: dto.freightAmount,
              documentUrl: dto.documentUrl || dto.dispatchDocumentUrl,
              dispatchDocumentUrl: dto.dispatchDocumentUrl || dto.documentUrl,
              documentUrls: dto.documentUrls || (dto.documentUrl ? [dto.documentUrl] : []),
              deliveryAddress: dto.deliveryAddress,
            },
            items: {
              create: dto.items.map((item) => ({
                salesOrderItemId: item.salesOrderItemId,
                quantity: item.quantity,
              })),
            },
          },
          include: { items: true },
        });

        // Batch update WorkOrder & FinishedGoods statuses to DISPATCHED
        const allTargetWoIds = Array.from(
          new Set(dto.items.flatMap((it) => it.workOrderIds || []).filter(Boolean)),
        );
        const allTargetSoItemIds = Array.from(
          new Set(dto.items.map((it) => it.salesOrderItemId).filter(Boolean)),
        );
        const woOrConditions: any[] = [];
        if (allTargetWoIds.length > 0) woOrConditions.push({ id: { in: allTargetWoIds } });
        if (allTargetSoItemIds.length > 0) woOrConditions.push({ salesOrderItemId: { in: allTargetSoItemIds } });

        const wosToDispatch =
          woOrConditions.length > 0
            ? await tx.workOrder.findMany({
                where: { OR: woOrConditions, status: { not: 'DISPATCHED' } },
                select: { id: true },
              })
            : [];

        const woIdsToUpdate = wosToDispatch.map((w) => w.id);
        const targetProductIds = Array.from(
          new Set(
            dto.items
              .map((it) => it.productId || soItemsMap.get(it.salesOrderItemId)?.productId)
              .filter(Boolean) as string[],
          ),
        );
        const fgOrConditions: any[] = [];
        if (woIdsToUpdate.length > 0) fgOrConditions.push({ workOrderId: { in: woIdsToUpdate } });
        if (targetProductIds.length > 0 && so?.id) {
          fgOrConditions.push({ salesOrderId: so.id, productId: { in: targetProductIds } });
        }

        await Promise.all([
          woIdsToUpdate.length > 0
            ? tx.workOrder.updateMany({
                where: { id: { in: woIdsToUpdate } },
                data: {
                  status: 'DISPATCHED',
                  productionStatus: 'DISPATCHED',
                  dispatchedAt: new Date(),
                  dispatchedById: userId,
                },
              })
            : Promise.resolve(),
          fgOrConditions.length > 0
            ? tx.finishedGoods.updateMany({
                where: { OR: fgOrConditions, status: { not: 'DISPATCHED' } },
                data: {
                  status: 'DISPATCHED',
                  availableQuantity: 0,
                },
              })
            : Promise.resolve(),
        ]);

        await tx.salesOrderAllocation.createMany({
          data: dto.items.map((item) => ({
            salesOrderId: so.id,
            salesOrderItemId: item.salesOrderItemId,
            allocationType: 'FINISHED_GOODS_RESERVATION',
            requiredQuantity: item.quantity,
            reservedQuantity: item.quantity,
          })),
        });

        const initialInvoiceState = await this.workflowService.getInitialState(
          'INVOICE',
          tx,
        );
        let invoiceNumber = dto.invoiceNumber?.trim();
        if (!invoiceNumber) {
          invoiceNumber = await this.sequenceService.generateNextWithTx(
            tx,
            'invoice_number',
            `INV - ${new Date().getFullYear()} -`,
          );
        }
        await tx.salesInvoice.create({
          data: {
            invoiceNumber,
            salesOrderId: dto.salesOrderId,
            dispatchId: dispatch.id,
            status: 'DRAFT',
            workflowStateId: initialInvoiceState.id,
            subtotal: invoiceSubtotal.toDecimalPlaces(2).toNumber(),
            discountAmount: invoiceDiscount.toDecimalPlaces(2).toNumber(),
            taxableAmount: invoiceTaxable.toDecimalPlaces(2).toNumber(),
            taxAmount: invoiceTax.toDecimalPlaces(2).toNumber(),
            freightAmount: invoiceFreight.toDecimalPlaces(2).toNumber(),
            roundingAmount: 0,
            totalAmount: invoiceTotal.toDecimalPlaces(2).toNumber(),
            items: {
              create: invoiceLines,
            },
          },
        });

        // Check if all items in SO are now fulfilled
        const soWithItems = await tx.salesOrder.findUnique({
          where: { id: so.id },
          include: {
            items: {
              include: {
                dispatchItems: {
                  include: { dispatch: true },
                },
              },
            },
          },
        });

        let allItemsFulfilled = false;
        if (soWithItems && Array.isArray(soWithItems.items) && soWithItems.items.length > 0) {
          allItemsFulfilled = soWithItems.items.every((si) => {
            const totalDispatched = (si.dispatchItems || [])
              .filter((di: any) => !di.dispatch || !['CANCELLED', 'REJECTED'].includes(di.dispatch.status))
              .reduce((sum: number, di: any) => sum + Number(di.quantity || 0), 0);
            return totalDispatched >= Number(si.orderedQuantity || 0);
          });
        }

        if (allItemsFulfilled) {
          await tx.salesOrder.update({
            where: { id: dto.salesOrderId },
            data: { status: 'COMPLETED' },
          });
        }

        console.log(
          '[DISPATCH 10] Dispatch transaction committed successfully:',
          dispatch.dispatchNo,
        );
        return dispatch;
      });

      if (this.notificationsService && result) {
        // Query salesOrder customer & salesExecutiveId
        const dispatchWithDetails = await this.prisma.dispatch.findUnique({
          where: { id: result.id },
          include: {
            salesOrder: { include: { customer: true } },
          },
        });

        if (dispatchWithDetails?.salesOrder?.salesExecutiveId) {
          const companyId = dispatchWithDetails.salesOrder.customer.companyId;
          const executiveId = dispatchWithDetails.salesOrder.salesExecutiveId;
          const soNo = dispatchWithDetails.salesOrder.orderNumber;

          // 1. Dispatch Created Notification
          this.notificationsService
            .notifyUser({
              companyId,
              userId: executiveId,
              type: 'DISPATCH_CREATED',
              title: 'Dispatch Created',
              message: `${dispatchWithDetails.dispatchNo} — Dispatch has been created for ${soNo}.`,
              route: `/orders/${soNo || dispatchWithDetails.salesOrderId}`,
              entityType: 'Dispatch',
              entityId: dispatchWithDetails.id,
              eventKey: `DISPATCH:${dispatchWithDetails.id}:CREATED`,
            })
            .catch((err) =>
              console.warn(
                '[DispatchService Notification] Failed to notify DISPATCH_CREATED:',
                err.message,
              ),
            );

          // 2. Dispatch In Transit Notification
          this.notificationsService
            .notifyUser({
              companyId,
              userId: executiveId,
              type: 'DISPATCH_IN_TRANSIT',
              title: 'Shipment In Transit',
              message: `${dispatchWithDetails.dispatchNo} — Shipment for ${soNo} is now in transit.`,
              route: `/orders/${soNo || dispatchWithDetails.salesOrderId}`,
              entityType: 'Dispatch',
              entityId: dispatchWithDetails.id,
              eventKey: `DISPATCH:${dispatchWithDetails.id}:IN_TRANSIT`,
            })
            .catch((err) =>
              console.warn(
                '[DispatchService Notification] Failed to notify DISPATCH_IN_TRANSIT:',
                err.message,
              ),
            );
        }
      }

      return result;
    } catch (error: any) {
      console.error('[CREATE DISPATCH ORIGINAL ERROR]', {
        name: error?.name,
        code: error?.code,
        message: error?.message,
        meta: error?.meta,
        cause: error?.cause,
      });
      throw error;
    }
  }

  async startDelivery(id: string) {
    const dispatch = await this.prisma.dispatch.findFirst({
      where: {
        OR: [
          { id },
          { dispatchNo: id },
          { dispatchNo: { contains: id, mode: 'insensitive' } },
        ],
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.status === 'OUT_FOR_DELIVERY' || dispatch.status === 'DELIVERED') {
      return dispatch;
    }

    return this.prisma.dispatch.update({
      where: { id: dispatch.id },
      data: {
        status: 'OUT_FOR_DELIVERY',
        version: { increment: 1 },
      },
    });
  }

  async confirmDelivery(id: string, dto: ConfirmDeliveryDto, userId?: string) {
    const dispatch = await this.prisma.dispatch.findFirst({
      where: {
        OR: [
          { id },
          { dispatchNo: id },
          { dispatchNo: { contains: id, mode: 'insensitive' } },
        ],
      },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const allowedStatuses = [
      'OUT_FOR_DELIVERY',
      'IN_TRANSIT',
      'DISPATCHED',
      'SHIPPED',
      'READY_FOR_DELIVERY',
    ];
    if (!allowedStatuses.includes(dispatch.status)) {
      throw new BadRequestException(
        `Dispatch status is ${dispatch.status}. It must be in transit or out for delivery to confirm delivery.`,
      );
    }

    const deliveryResult = await this.prisma.$transaction(async (tx) => {
      // 1. Inventory OUT transaction
      for (const item of dispatch.items) {
        let warehouse = await tx.warehouse.findFirst({
          where: {
            companyId: dispatch.salesOrder.customer.companyId,
            name: 'Finished Goods',
          },
        });
        if (!warehouse) {
          warehouse = await tx.warehouse.findFirst({
            where: { companyId: dispatch.salesOrder.customer.companyId },
          });
        }
        if (!warehouse) {
          warehouse = await tx.warehouse.create({
            data: {
              companyId: dispatch.salesOrder.customer.companyId,
              name: 'Finished Goods',
            },
          });
        }

        const existingIssue = await tx.inventoryTransaction.findFirst({
          where: {
            referenceType: 'Dispatch',
            referenceId: id,
            productId: item.salesOrderItem.productId,
            type: 'OUT',
          },
        });
        if (!existingIssue) {
          await tx.inventoryTransaction.create({
            data: {
              companyId: dispatch.salesOrder.customer.companyId,
              productId: item.salesOrderItem.productId,
              warehouseId: warehouse.id,
              type: 'OUT',
              quantity: item.quantity,
              referenceType: 'Dispatch',
              referenceId: id,
            },
          });
        }

        // Clear reservation
        await tx.salesOrderAllocation.updateMany({
          where: {
            salesOrderId: dispatch.salesOrderId,
            salesOrderItemId: item.salesOrderItemId,
            allocationType: 'FINISHED_GOODS_RESERVATION',
            reservedQuantity: { gt: 0 },
          },
          data: { reservedQuantity: 0 },
        });
      }

      // 2. Mark dispatch as DELIVERED
      const deliveredAtDate = dto.deliveredAt
        ? new Date(dto.deliveredAt)
        : new Date();
      const cleanInvoice = dto.invoiceNumber?.trim();
      const updatedDispatch = await tx.dispatch.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          version: { increment: 1 },
          deliveredAt: deliveredAtDate,
          deliveredQuantity: dispatch.items.reduce(
            (sum, item) => sum + Number(item.quantity),
            0,
          ), // Assume full delivery for now unless modified
          receivedBy: dto.receiverName,
          receiverPhone: dto.receiverPhone,
          deliveryRemarks: dto.deliveryRemarks,
          podUrl: dto.podImageUrl,
          deliveryPhotoUrl: dto.podImageUrl,
          deliveryLatitude: dto.latitude,
          deliveryLongitude: dto.longitude,
          deliveredById: userId,
          podReceivedAt: new Date(),
          podStatus: 'APPROVED',
          ...(dispatch.documentChecklist && typeof dispatch.documentChecklist === 'object'
            ? {
                documentChecklist: {
                  ...((dispatch.documentChecklist as any) || {}),
                  podUrl: dto.podImageUrl,
                  deliveryProofUrl: dto.podImageUrl,
                  deliveryPhotoUrl: dto.podImageUrl,
                },
              }
            : {}),
          ...(cleanInvoice ? { invoiceNumber: cleanInvoice } : {}),
        },
      });

      if (cleanInvoice) {
        await tx.salesInvoice
          .updateMany({
            where: {
              OR: [
                { dispatchId: id },
                { salesOrderId: dispatch.salesOrderId },
              ],
            },
            data: { invoiceNumber: cleanInvoice },
          })
          .catch(() => {});
      }

      // 3. Update related WorkOrders to DISPATCHED
      const relatedWorkOrders = await tx.workOrder.findMany({
        where: {
          salesOrderItemId: {
            in: dispatch.items.map((i) => i.salesOrderItemId),
          },
          productionStatus: 'READY_FOR_DISPATCH',
        },
      });

      for (const wo of relatedWorkOrders) {
        await tx.workOrder.update({
          where: { id: wo.id },
          data: {
            productionStatus: 'DISPATCHED',
            statusHistory: {
              create: {
                fromStatus: 'READY_FOR_DISPATCH',
                toStatus: 'DISPATCHED',
                remarks: `Dispatched via ${dispatch.dispatchNo}`,
                changedBy: userId,
              },
            },
          },
        });
      }

      // 4. Update sales order status, start payment terms clock from delivery date
      const so = await tx.salesOrder.findUnique({
        where: { id: dispatch.salesOrderId },
        include: { quotation: true },
      });

      const termDays =
        so?.paymentTermDays ||
        so?.paymentTermsDays ||
        so?.quotation?.paymentTermDays ||
        15;
      const dueDate = new Date(deliveredAtDate.getTime() + termDays * 86400000);
      const paid = Number(so?.paidAmount || 0);
      const total = Number(so?.totalAmount || 0);
      const outstanding = Math.max(0, total - paid);

      await tx.salesOrder.update({
        where: { id: dispatch.salesOrderId },
        data: {
          status: 'COMPLETED',
          paymentTermStartDate: deliveredAtDate,
          paymentDueDate: dueDate,
          outstandingAmount: outstanding,
          paymentStatus:
            paid >= total && total > 0
              ? 'PAID'
              : paid > 0
                ? 'PARTIALLY_PAID'
                : 'PENDING',
        },
      });

      return updatedDispatch;
    });

    // Notify Salesperson / Super Sales owner post-commit
    if (dispatch.salesOrder?.salesExecutiveId && this.notificationsService) {
      await this.notificationsService
        .notifyUser({
          companyId: dispatch.salesOrder.customer.companyId,
          userId: dispatch.salesOrder.salesExecutiveId,
          type: 'DISPATCH_DELIVERED',
          title: 'Order Delivered',
          message: `${dispatch.salesOrder.orderNumber} — Delivery to ${dispatch.salesOrder.customer.companyName} has been completed.`,
          route: `/orders/${dispatch.salesOrder?.orderNumber || dispatch.salesOrderId}`,
          entityType: 'Dispatch',
          entityId: dispatch.id,
          eventKey: `DISPATCH:${dispatch.id}:DELIVERED`,
        })
        .catch(() => {});
    }

    // Notify Finance Team to begin payment verification & receivables tracking
    if (this.notificationsService) {
      const companyId =
        dispatch.salesOrder?.customer?.companyId ||
        '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
      this.notificationsService
        .notifyRole({
          companyId,
          role: 'FINANCE_MANAGER',
          type: 'ORDER_DELIVERED_START_PAYMENT_TERM',
          title: 'Order Delivered — Payment Terms Started',
          message: `${dispatch.salesOrder?.orderNumber} delivered to ${dispatch.salesOrder?.customer?.companyName}. Payment terms started (Due: ${new Date(Date.now() + 15 * 86400000).toLocaleDateString('en-IN')}).`,
          route: '/finance/payment-verification',
          entityType: 'SalesOrder',
          entityId: dispatch.salesOrderId,
          eventKeyPrefix: `DISPATCH:${dispatch.id}:FINANCE_TERMS_START`,
        })
        .catch(() => {});
    }

    return deliveryResult;
  }

  async getFinishedGoodsHistory(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const [dispatches, dailyReportHistories] = await Promise.all([
      this.prisma.dispatch.findMany({
        select: {
          id: true,
          dispatchNo: true,
          salesOrderId: true,
          vehicleNumber: true,
          dispatchedAt: true,
          createdAt: true,
          createdById: true,
          salesOrder: {
            select: {
              orderNumber: true,
              customer: { select: { companyName: true } },
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              salesOrderItem: {
                select: {
                  productId: true,
                  productNameSnapshot: true,
                  product: {
                    select: {
                      id: true,
                      name: true,
                      sku: true,
                      publicId: true,
                      category: true,
                      unit: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockHistory.findMany({
        where: {
          event: { in: ['DISPATCH_OUT', 'DISPATCH_REVERSAL'] },
          sourceType: {
            in: [
              'DISPATCH_REPORT',
              'DISPATCH_REPORT_REVERSAL',
              'DISPATCH_REPORT_UPDATE',
              'DISPATCH_REPORT_CANCEL',
            ],
          },
        },
        select: {
          id: true,
          productId: true,
          sourceId: true,
          referenceNumber: true,
          quantity: true,
          beforeAvailableQuantity: true,
          beforeQuantity: true,
          afterAvailableQuantity: true,
          afterQuantity: true,
          actor: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Batch-load FinishedGoods stock balances & StockHistory products in 2 single queries (eliminates 1,166-query N+1 loop!)
    const dispatchProductIds = new Set<string>();
    const dispatchSkus = new Set<string>();
    for (const d of dispatches) {
      for (const item of d.items) {
        const prod = item.salesOrderItem?.product;
        if (prod?.id) dispatchProductIds.add(prod.id);
        if (item.salesOrderItem?.productId) dispatchProductIds.add(item.salesOrderItem.productId);
        if (prod?.sku) dispatchSkus.add(prod.sku);
      }
    }
    const shProductIds = Array.from(
      new Set(dailyReportHistories.map((h) => h.productId).filter(Boolean)),
    );

    const [fgRows, shProducts] = await Promise.all([
      dispatchProductIds.size > 0 || dispatchSkus.size > 0
        ? this.prisma.finishedGoods.findMany({
            where: {
              OR: [
                ...(dispatchProductIds.size > 0 ? [{ productId: { in: Array.from(dispatchProductIds) } }] : []),
                ...(dispatchSkus.size > 0 ? [{ product: { sku: { in: Array.from(dispatchSkus) } } }] : []),
              ],
            },
            select: {
              productId: true,
              availableQuantity: true,
              product: { select: { sku: true } },
            },
          })
        : Promise.resolve([]),
      shProductIds.length > 0
        ? this.prisma.product.findMany({
            where: { id: { in: shProductIds } },
            select: {
              id: true,
              name: true,
              sku: true,
              publicId: true,
              category: true,
              unit: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const fgByProductId = new Map<string, number>();
    const fgBySku = new Map<string, number>();
    for (const fg of fgRows) {
      const avail = Number(fg.availableQuantity ?? 0);
      if (fg.productId && !fgByProductId.has(fg.productId)) {
        fgByProductId.set(fg.productId, avail);
      }
      if (fg.product?.sku && !fgBySku.has(fg.product.sku)) {
        fgBySku.set(fg.product.sku, avail);
      }
    }
    const shProductMap = new Map<string, any>(
      (shProducts as any[]).map((p: any) => [p.id, p]),
    );

    const history: any[] = [];

    for (const d of dispatches) {
      for (const item of d.items) {
        const prod = item.salesOrderItem?.product;
        const dispatchedQty = Number(item.quantity || 0);
        const currentRemaining =
          (prod?.id && fgByProductId.has(prod.id) ? fgByProductId.get(prod.id)! : undefined) ??
          (item.salesOrderItem?.productId && fgByProductId.has(item.salesOrderItem.productId)
            ? fgByProductId.get(item.salesOrderItem.productId)!
            : undefined) ??
          (prod?.sku && fgBySku.has(prod.sku) ? fgBySku.get(prod.sku)! : 0);
        const qtyBefore = currentRemaining + dispatchedQty;

        history.push({
          id: `hist-${d.id}-${item.id}`,
          dispatchId: d.id,
          dispatchNo: d.dispatchNo,
          salesOrderId: d.salesOrderId,
          orderNumber: d.salesOrder?.orderNumber || 'SO-STOCK',
          productCode: prod?.sku || prod?.publicId || 'FG-ITEM',
          productName:
            prod?.name ||
            item.salesOrderItem?.productNameSnapshot ||
            'Finished Good Item',
          category: prod?.category || 'Hardware',
          unit: (prod?.unit || 'PCS').toUpperCase(),
          quantityBefore: qtyBefore,
          dispatchedQuantity: dispatchedQty,
          quantityAfter: currentRemaining,
          vehicleNumber: d.vehicleNumber || 'UK-07-CB-1234',
          customerName:
            d.salesOrder?.customer?.companyName || 'Factory Staging Area',
          dispatchedAt: d.dispatchedAt || d.createdAt,
          createdBy: d.createdById || 'Dispatch Executive',
        });
      }
    }

    for (const sh of dailyReportHistories) {
      const prod = shProductMap.get(sh.productId);
      const dispatchedQty = Math.abs(Number(sh.quantity || 0));
      history.push({
        id: `sh-${sh.id}`,
        dispatchId: sh.sourceId || sh.id,
        dispatchNo: sh.referenceNumber || `DR-${sh.id.slice(0, 8)}`,
        salesOrderId: sh.sourceId || '',
        orderNumber: sh.referenceNumber || 'DAILY-DISPATCH',
        productCode: prod?.sku || prod?.publicId || 'FG-ITEM',
        productName: prod?.name || 'Finished Good Item',
        category: prod?.category || 'FRP COVER',
        unit: (prod?.unit || 'PCS').toUpperCase(),
        quantityBefore: Number(
          sh.beforeAvailableQuantity ?? sh.beforeQuantity ?? 0,
        ),
        dispatchedQuantity: dispatchedQty,
        quantityAfter: Number(
          sh.afterAvailableQuantity ?? sh.afterQuantity ?? 0,
        ),
        vehicleNumber: 'Direct Daily Dispatch Log',
        customerName: 'Factory Staging / Daily Dispatch',
        dispatchedAt: sh.createdAt
          ? typeof sh.createdAt.toISOString === 'function'
            ? sh.createdAt.toISOString()
            : new Date(sh.createdAt).toISOString()
          : new Date().toISOString(),
        createdBy: sh.actor || 'Dispatch Executive',
      });
    }

    history.sort(
      (a, b) =>
        new Date(b.dispatchedAt).getTime() - new Date(a.dispatchedAt).getTime(),
    );

    let filtered = history;
    if (options?.search) {
      const tokens = options.search.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = history.filter((row) => {
        const hay = `${row.dispatchNo} ${row.orderNumber} ${row.productCode} ${row.productName} ${row.category} ${row.vehicleNumber} ${row.customerName}`.toLowerCase();
        return tokens.every((t) => hay.includes(t));
      });
    }

    if (options?.page !== undefined) {
      const page = Math.max(1, options.page);
      const limit = options.limit ?? 25;
      const total = filtered.length;
      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);
      return {
        data: paged,
        items: paged,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }

    return options?.limit ? filtered.slice(0, options.limit) : filtered;
  }

  async getDispatchQueue(
    userId: string,
    role: string,
    companyId: string,
    category?: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      onlyRemaining?: boolean;
    },
  ) {
    // 1. Resolve & NORMALIZE category filter for the Dispatch user (fixes "Category 1" !== "D1" bug)
    let userCategory: 'D1' | 'D2' | null = normalizeDispatchCategory(category);
    if (!userCategory) {
      const normalizedRole = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');
      if (normalizedRole === 'DISPATCH_1') {
        userCategory = 'D1';
      } else if (normalizedRole === 'DISPATCH_2') {
        userCategory = 'D2';
      } else if (
        userId &&
        (normalizedRole === 'DISPATCH_EXECUTIVE' || normalizedRole.includes('DISPATCH'))
      ) {
        const u: any = this.prisma.user?.findUnique
          ? await this.prisma.user.findUnique({
              where: { id: userId },
              select: { id: true, email: true, dispatchCategory: true },
            })
          : null;
        if (u?.dispatchCategory) {
          const upper = String(u.dispatchCategory).trim().toUpperCase();
          if (!['ALL', 'ALL CATEGORIES', 'SUPER'].includes(upper)) {
            userCategory = normalizeDispatchCategory(u.dispatchCategory);
          }
        }
        if (!userCategory) {
          const emailLower = String(u?.email || '').toLowerCase();
          if (emailLower.includes('sahad')) userCategory = 'D2';
          else if (emailLower.includes('ravikant')) userCategory = 'D1';
        }
      }
    }

    const matchesCategory = (dispatchCat: string): boolean => {
      if (!userCategory) return true;
      const normItem = normalizeDispatchCategory(dispatchCat) || 'D1';
      return normItem === userCategory;
    };

    const isD2User = userCategory === 'D2';
    const isD1User = userCategory === 'D1';

    let soWhereStatus: any = { notIn: ['CANCELLED', 'LOST', 'DRAFT'] };
    let soWhereExtra: any = {};

    if (isD1User) {
      soWhereStatus = { in: ['READY_FOR_DISPATCH', 'COMPLETED'] };
    } else if (isD2User) {
      soWhereStatus = { notIn: ['CANCELLED', 'LOST', 'DRAFT'] };
      soWhereExtra = {
        items: {
          some: {
            OR: [
              { product: { isTrading: true } },
              { product: { productType: 'TRADING' } },
              { product: { dispatchCategory: { in: ['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'Category 2'] } } },
            ],
          },
        },
      };
    }

    const workOrderTenantScope = this.getWorkOrderTenantScope(companyId);

    const leanProductSelect = {
      id: true,
      name: true,
      sku: true,
      publicId: true,
      category: true,
      productType: true,
      dispatchCategory: true,
      unit: true,
      isTrading: true,
      weight: true,
      coverUnitWeight: true,
      coversPerSet: true,
      frameUnitWeight: true,
      framesPerSet: true,
    };

    const leanCustomerSelect = {
      id: true,
      companyName: true,
      contactPerson: true,
      phone: true,
      shippingAddress: true,
      billingAddress: true,
    };

    // 2. Run all 4 queue source queries in PARALLEL with tight selects
    const [allocations, readyWorkOrders, readyFinishedGoods, readyTradingOrders] =
      await Promise.all([
        this.prisma.salesOrderAllocation
          .findMany({
            where: {
              allocationType: 'FINISHED_GOODS_RESERVATION',
              reservedQuantity: { gt: 0 },
              salesOrder: {
                customer: { companyId },
                status: { in: ['READY_FOR_DISPATCH', 'COMPLETED'] },
              },
            },
            select: {
              id: true,
              salesOrderId: true,
              salesOrderItemId: true,
              reservedQuantity: true,
              salesOrder: {
                select: {
                  id: true,
                  orderNumber: true,
                  status: true,
                  orderDate: true,
                  createdAt: true,
                  requestedDeliveryDate: true,
                  freightAmount: true,
                  shippingAddress: true,
                  billingAddress: true,
                  customer: { select: leanCustomerSelect },
                  salesExecutive: { select: { id: true, name: true, email: true } },
                  items: {
                    select: {
                      id: true,
                      productId: true,
                      productCodeSnapshot: true,
                      productNameSnapshot: true,
                      orderedQuantity: true,
                      unit: true,
                      product: { select: leanProductSelect },
                    },
                  },
                },
              },
            },
          })
          .catch((err) => {
            console.warn('[getDispatchQueue] allocations query failed:', err);
            return [];
          }),
        this.prisma.workOrder
          .findMany({
            where: {
              AND: [
                {
                  OR: [
                    { status: 'READY_FOR_DISPATCH' },
                    { productionStatus: 'READY_FOR_DISPATCH' },
                    { sentToDispatchAt: { not: null } },
                  ],
                },
                workOrderTenantScope,
              ],
            },
            select: {
              id: true,
              workOrderNumber: true,
              status: true,
              productionStatus: true,
              quantity: true,
              sentToDispatchAt: true,
              dispatchedAt: true,
              completedAt: true,
              createdAt: true,
              salesOrderItemId: true,
              salesOrderItem: {
                select: {
                  id: true,
                  productId: true,
                  productCodeSnapshot: true,
                  productNameSnapshot: true,
                  orderedQuantity: true,
                  unit: true,
                  product: { select: leanProductSelect },
                },
              },
              productionPlan: {
                select: {
                  planNumber: true,
                  salesOrder: {
                    select: {
                      id: true,
                      orderNumber: true,
                      status: true,
                      orderDate: true,
                      createdAt: true,
                      requestedDeliveryDate: true,
                      freightAmount: true,
                      shippingAddress: true,
                      billingAddress: true,
                      customer: { select: leanCustomerSelect },
                      salesExecutive: { select: { id: true, name: true, email: true } },
                    },
                  },
                },
              },
            },
          })
          .catch((woErr) => {
            console.warn('[getDispatchQueue] Failed to query ready work orders:', woErr);
            return [];
          }),
        this.prisma.finishedGoods
          .findMany({
            where: {
              status: 'READY_FOR_DISPATCH',
              product: { companyId },
            },
            select: {
              id: true,
              workOrderId: true,
              productId: true,
              salesOrderId: true,
              quantity: true,
              availableQuantity: true,
              unit: true,
              receivedAt: true,
              product: { select: leanProductSelect },
              workOrder: {
                select: {
                  id: true,
                  workOrderNumber: true,
                  salesOrderItemId: true,
                  salesOrderItem: {
                    select: {
                      id: true,
                      productId: true,
                      productCodeSnapshot: true,
                      productNameSnapshot: true,
                      orderedQuantity: true,
                      unit: true,
                      product: { select: leanProductSelect },
                    },
                  },
                  productionPlan: {
                    select: {
                      planNumber: true,
                      salesOrder: {
                        select: {
                          id: true,
                          orderNumber: true,
                          status: true,
                          orderDate: true,
                          createdAt: true,
                          requestedDeliveryDate: true,
                          freightAmount: true,
                          shippingAddress: true,
                          billingAddress: true,
                          customer: { select: leanCustomerSelect },
                          salesExecutive: { select: { id: true, name: true, email: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          })
          .catch((fgErr) => {
            console.warn('[getDispatchQueue] Failed to query ready finished goods:', fgErr);
            return [];
          }),
        this.prisma.salesOrder
          .findMany({
            where: {
              status: soWhereStatus,
              deletedAt: null,
              ...(companyId ? { customer: { companyId } } : {}),
              ...soWhereExtra,
            },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              orderDate: true,
              createdAt: true,
              requestedDeliveryDate: true,
              freightAmount: true,
              shippingAddress: true,
              billingAddress: true,
              customer: { select: leanCustomerSelect },
              salesExecutive: { select: { id: true, name: true, email: true } },
              items: {
                select: {
                  id: true,
                  productId: true,
                  productCodeSnapshot: true,
                  productNameSnapshot: true,
                  orderedQuantity: true,
                  unit: true,
                  product: { select: leanProductSelect },
                  workOrders: { select: { id: true, status: true, productionStatus: true } },
                },
              },
              productionPlans: {
                select: {
                  id: true,
                  status: true,
                  workOrders: { select: { id: true, status: true, productionStatus: true } },
                },
              },
            },
          })
          .catch((soErr) => {
            console.warn('[getDispatchQueue] Failed to query ready trading sales orders:', soErr);
            return [];
          }),
      ]);

    const formatOrderAddress = (so: any, customer: any, fallback: string) =>
      this.formatAddressValue(so?.shippingAddress) ||
      this.formatAddressValue(so?.billingAddress) ||
      this.formatAddressValue(customer?.shippingAddress) ||
      this.formatAddressValue(customer?.billingAddress) ||
      fallback;

    const ordersMap = new Map<string, any>();

    for (const alloc of allocations as any[]) {
      const soStatus = String(alloc.salesOrder?.status || '').toUpperCase();
      if (
        [
          'IN_PRODUCTION',
          'READY_FOR_PRODUCTION',
          'SENT_TO_PLANT',
          'SENT_TO_PLANT_HEAD',
          'PLANT_APPROVED',
          'CONFIRMED',
          'DRAFT',
        ].includes(soStatus)
      ) {
        continue;
      }

      const salesOrderItem = alloc.salesOrder.items.find(
        (i: any) => i.id === alloc.salesOrderItemId,
      );
      if (!salesOrderItem) continue;

      const product = salesOrderItem.product;
      const isTrading = isTradingProduct(product, salesOrderItem);
      const dispatchCat = isTrading ? 'D2' : (normalizeDispatchCategory(product?.dispatchCategory) || 'D1');
      if (!matchesCategory(dispatchCat)) continue;

      const key = alloc.salesOrderId;
      if (!ordersMap.has(key)) {
        ordersMap.set(key, {
          id: alloc.id,
          orderId: alloc.salesOrder.orderNumber,
          orderNo: alloc.salesOrder.orderNumber,
          salesOrderId: alloc.salesOrderId,
          orderDate: alloc.salesOrder.orderDate || alloc.salesOrder.createdAt,
          requestedDeliveryDate: alloc.salesOrder.requestedDeliveryDate || null,
          freightAmount: Number(alloc.salesOrder.freightAmount || 0),
          batchId: product?.sku || 'FG-STOCK',
          customerName: alloc.salesOrder.customer?.companyName || 'Customer',
          salesperson: alloc.salesOrder.salesExecutive?.name || 'Sales Executive',
          salesExecutive: alloc.salesOrder.salesExecutive,
          deliveryAddress: formatOrderAddress(
            alloc.salesOrder,
            alloc.salesOrder.customer,
            'Factory Staging Area',
          ),
          status: 'READY_FOR_DISPATCH',
          dispatchCategory: dispatchCat,
          items: [],
        });
      }

      const orderRow = ordersMap.get(key);
      const orderedQty = Number(salesOrderItem.orderedQuantity || alloc.reservedQuantity || 0);
      orderRow.items.push({
        allocationId: alloc.id,
        salesOrderItemId: alloc.salesOrderItemId,
        productId: salesOrderItem.productId,
        productCode: salesOrderItem.productCodeSnapshot || product?.sku || '',
        productName: salesOrderItem.productNameSnapshot || product?.name || '',
        orderedQuantity: orderedQty,
        approvedQuantity: Number(alloc.reservedQuantity),
        dispatchableQuantity: Number(alloc.reservedQuantity),
        unit: salesOrderItem.unit || product?.unit || 'PCS',
        dispatchCategory: dispatchCat,
        isTrading,
        productType: product?.productType || (isTrading ? 'TRADING' : 'MANUFACTURING'),
        productWeight: product?.weight != null ? Number(product.weight) : null,
      });
    }

    for (const wo of readyWorkOrders as any[]) {
      if (wo.dispatchedAt) continue;

      const woProdStatus = String(wo.productionStatus || '').toUpperCase();
      const woStatus = String(wo.status || '').toUpperCase();
      if (
        woProdStatus === 'IN_PRODUCTION' ||
        woStatus === 'IN_PRODUCTION' ||
        woProdStatus === 'QC_FAILED' ||
        woProdStatus === 'REWORK_IN_PROGRESS' ||
        woStatus === 'CANCELLED'
      ) {
        continue;
      }

      const salesOrder = wo.productionPlan?.salesOrder;
      const soStatus = String(salesOrder?.status || '').toUpperCase();
      if (
        soStatus === 'IN_PRODUCTION' &&
        woProdStatus !== 'READY_FOR_DISPATCH' &&
        woStatus !== 'READY_FOR_DISPATCH' &&
        !wo.sentToDispatchAt
      ) {
        continue;
      }

      const customer = salesOrder?.customer;
      const product = wo.salesOrderItem?.product;
      const isTrading = isTradingProduct(product, wo.salesOrderItem);
      const dispatchCat = isTrading ? 'D2' : (normalizeDispatchCategory(product?.dispatchCategory) || 'D1');
      if (!matchesCategory(dispatchCat)) continue;

      const key = salesOrder?.id || wo.id;
      if (!ordersMap.has(key)) {
        ordersMap.set(key, {
          id: `wo-${wo.id}`,
          orderId: salesOrder?.orderNumber || wo.workOrderNumber,
          orderNo: salesOrder?.orderNumber || wo.workOrderNumber,
          salesOrderId: salesOrder?.id || null,
          orderDate: salesOrder?.orderDate || salesOrder?.createdAt || wo.createdAt,
          requestedDeliveryDate: salesOrder?.requestedDeliveryDate || null,
          freightAmount: Number(salesOrder?.freightAmount || 0),
          workOrderId: wo.id,
          workOrderNumber: wo.workOrderNumber,
          productionPlanNumber: wo.productionPlan?.planNumber || null,
          batchId: product?.sku || wo.workOrderNumber || 'FG-PROD',
          customerName: customer?.companyName || (customer as any)?.name || 'Production Dispatch',
          salesperson: salesOrder?.salesExecutive?.name || 'Sales Executive',
          salesExecutive: salesOrder?.salesExecutive,
          deliveryAddress: formatOrderAddress(salesOrder, customer, 'Factory Staging Area'),
          status: 'READY_FOR_DISPATCH',
          dispatchCategory: dispatchCat,
          items: [],
        });
      }

      const orderRow = ordersMap.get(key);
      const existingItem = orderRow.items.find(
        (i: any) =>
          i.workOrderId === wo.id ||
          (wo.salesOrderItemId && i.salesOrderItemId === wo.salesOrderItemId),
      );
      if (!existingItem) {
        const orderedQty = Number(wo.salesOrderItem?.orderedQuantity || wo.quantity || 1);
        orderRow.items.push({
          allocationId: `wo-${wo.id}`,
          workOrderId: wo.id,
          workOrderNumber: wo.workOrderNumber,
          productionPlanNumber: wo.productionPlan?.planNumber || null,
          salesOrderItemId: wo.salesOrderItemId || wo.salesOrderItem?.id || null,
          productId: product?.id || (wo as any).productId || '',
          productCode:
            wo.salesOrderItem?.productCodeSnapshot ||
            product?.sku ||
            product?.publicId ||
            '',
          productName:
            wo.salesOrderItem?.productNameSnapshot ||
            product?.name ||
            'Finished Product',
          orderedQuantity: orderedQty,
          approvedQuantity: Number(wo.quantity || 1),
          dispatchableQuantity: Number(wo.quantity || 1),
          unit: wo.salesOrderItem?.unit || product?.unit || 'PCS',
          dispatchCategory: dispatchCat,
          isTrading,
          productType: product?.productType || (isTrading ? 'TRADING' : 'MANUFACTURING'),
          productWeight: product?.weight != null ? Number(product.weight) : null,
        });
      }
    }

    for (const fg of readyFinishedGoods as any[]) {
      const wo = fg.workOrder;
      const salesOrder = wo?.productionPlan?.salesOrder;
      const customer = salesOrder?.customer;
      const product = fg.product || wo?.salesOrderItem?.product;
      const isTrading = isTradingProduct(product, (fg as any).salesOrderItem || wo?.salesOrderItem);
      const dispatchCat = isTrading ? 'D2' : (normalizeDispatchCategory(product?.dispatchCategory) || 'D1');
      if (!matchesCategory(dispatchCat)) continue;

      const key = salesOrder?.id || fg.id;
      if (!ordersMap.has(key)) {
        ordersMap.set(key, {
          id: `fg-${fg.id}`,
          orderId: salesOrder?.orderNumber || wo?.workOrderNumber || 'FG-DISPATCH',
          orderNo: salesOrder?.orderNumber || wo?.workOrderNumber || 'FG-DISPATCH',
          salesOrderId: salesOrder?.id || null,
          orderDate: salesOrder?.orderDate || salesOrder?.createdAt || fg.receivedAt,
          requestedDeliveryDate: salesOrder?.requestedDeliveryDate || null,
          freightAmount: Number(salesOrder?.freightAmount || 0),
          workOrderId: fg.workOrderId || null,
          workOrderNumber: wo?.workOrderNumber || (fg as any).jobNo || null,
          productionPlanNumber: wo?.productionPlan?.planNumber || null,
          batchId: product?.sku || wo?.workOrderNumber || 'FG-STOCK',
          customerName: customer?.companyName || (customer as any)?.name || 'Factory Finished Goods',
          salesperson: salesOrder?.salesExecutive?.name || 'Sales Executive',
          salesExecutive: salesOrder?.salesExecutive,
          deliveryAddress: formatOrderAddress(salesOrder, customer, 'Factory Staging Area'),
          status: 'READY_FOR_DISPATCH',
          dispatchCategory: dispatchCat,
          items: [],
        });
      }

      const orderRow = ordersMap.get(key);
      const existingItem = orderRow.items.find(
        (i: any) =>
          i.fgId === fg.id ||
          (fg.workOrderId && i.workOrderId === fg.workOrderId) ||
          (wo?.salesOrderItemId && i.salesOrderItemId === wo.salesOrderItemId),
      );
      if (!existingItem) {
        const orderedQty = Number(wo?.salesOrderItem?.orderedQuantity || fg.quantity || 1);
        orderRow.items.push({
          allocationId: `fg-${fg.id}`,
          fgId: fg.id,
          workOrderId: fg.workOrderId,
          workOrderNumber: wo?.workOrderNumber || (fg as any).jobNo || null,
          productionPlanNumber: wo?.productionPlan?.planNumber || null,
          salesOrderItemId: wo?.salesOrderItemId || wo?.salesOrderItem?.id || null,
          productId: product?.id || (fg as any).productId || '',
          productCode: product?.sku || product?.publicId || '',
          productName: product?.name || 'Finished Product',
          orderedQuantity: orderedQty,
          approvedQuantity: Number(fg.quantity || 1),
          dispatchableQuantity: Number(fg.availableQuantity ?? fg.quantity ?? 1),
          unit: fg.unit || product?.unit || 'PCS',
          dispatchCategory: dispatchCat,
          isTrading,
          productType: product?.productType || (isTrading ? 'TRADING' : 'MANUFACTURING'),
          productWeight: product?.weight != null ? Number(product.weight) : null,
        });
      }
    }

    for (const so of readyTradingOrders as any[]) {
      const soStatus = String(so.status || '').toUpperCase();
      const isTrading = isPureTradingOrder(so);
      const planWos = (so.productionPlans || []).flatMap((p: any) => p.workOrders || []);
      const itemWos = (so.items || []).flatMap((i: any) => i.workOrders || []);
      const allWos = [...planWos, ...itemWos];

      if (userCategory === 'D1' && isTrading) continue;

      if (userCategory === 'D1') {
        if (
          [
            'IN_PRODUCTION',
            'READY_FOR_PRODUCTION',
            'SENT_TO_PLANT',
            'SENT_TO_PLANT_HEAD',
            'PLANT_APPROVED',
            'PRODUCTION_PLANNED',
            'DRAFT',
            'PENDING_APPROVAL',
            'CONFIRMED',
          ].includes(soStatus)
        ) {
          continue;
        }
        if (
          allWos.some(
            (w: any) =>
              ['IN_PRODUCTION', 'STARTED', 'PARTIALLY_COMPLETED', 'PLANNED', 'READY', 'MATERIAL_PENDING'].includes(
                String(w.status || '').toUpperCase(),
              ) ||
              ['IN_PRODUCTION', 'QC_FAILED', 'REWORK_IN_PROGRESS'].includes(
                String(w.productionStatus || '').toUpperCase(),
              ),
          )
        ) {
          continue;
        }
        if (
          soStatus !== 'READY_FOR_DISPATCH' &&
          soStatus !== 'COMPLETED' &&
          soStatus !== 'PARTIALLY_DISPATCHED'
        ) {
          continue;
        }
      }

      const customer = so.customer;
      const items = so.items || [];

      for (const item of items) {
        const product = item.product;
        const isItemTrading = isTradingProduct(product, item);
        const dispatchCat = isItemTrading ? 'D2' : (normalizeDispatchCategory(product?.dispatchCategory) || 'D1');
        if (!matchesCategory(dispatchCat)) continue;

        if (!isItemTrading) {
          if (
            [
              'IN_PRODUCTION',
              'READY_FOR_PRODUCTION',
              'SENT_TO_PLANT',
              'SENT_TO_PLANT_HEAD',
              'PLANT_APPROVED',
              'PRODUCTION_PLANNED',
              'DRAFT',
              'PENDING_APPROVAL',
              'CONFIRMED',
            ].includes(soStatus)
          ) {
            continue;
          }
        }

        const key = so.id;
        if (!ordersMap.has(key)) {
          ordersMap.set(key, {
            id: `so-${so.id}`,
            orderId: so.orderNumber,
            orderNo: so.orderNumber,
            salesOrderId: so.id,
            orderDate: so.orderDate || so.createdAt,
            requestedDeliveryDate: so.requestedDeliveryDate || null,
            freightAmount: Number(so.freightAmount || 0),
            batchId: product?.sku || 'SO-STOCK',
            customerName: customer?.companyName || customer?.name || 'Trading Customer',
            salesperson: so.salesExecutive?.name || 'Sales Executive',
            salesExecutive: so.salesExecutive,
            deliveryAddress: formatOrderAddress(so, customer, 'Customer Delivery Site'),
            status: 'READY_FOR_DISPATCH',
            dispatchCategory: dispatchCat,
            items: [],
          });
        }

        const orderRow = ordersMap.get(key);
        const existingItem = orderRow.items.find(
          (i: any) =>
            i.salesOrderItemId === item.id ||
            (item.productId && i.productId === item.productId),
        );
        if (!existingItem) {
          const orderedQty = Number(item.orderedQuantity || 1);
          orderRow.items.push({
            allocationId: `so-item-${item.id}`,
            salesOrderItemId: item.id,
            productId: item.productId,
            productCode: item.productCodeSnapshot || product?.sku || '',
            productName: item.productNameSnapshot || product?.name || 'Trading Product',
            orderedQuantity: orderedQty,
            approvedQuantity: orderedQty,
            dispatchableQuantity: orderedQty,
            unit: item.unit || product?.unit || 'PCS',
            dispatchCategory: dispatchCat,
            isTrading: isItemTrading,
            productType: product?.productType || (isItemTrading ? 'TRADING' : 'MANUFACTURING'),
            productWeight: product?.weight != null ? Number(product.weight) : null,
          });
        }
      }
    }

    // 3. Batch-compute authoritative dispatched & remaining quantities in ONE SQL groupBy
    let orders = Array.from(ordersMap.values());
    const allSoItemIds = Array.from(
      new Set(
        orders.flatMap((o: any) =>
          (o.items || []).map((it: any) => it.salesOrderItemId).filter(Boolean),
        ),
      ),
    );

    const dispatchedBySoItem = new Map<string, number>();
    if (allSoItemIds.length > 0 && this.prisma.dispatchItem?.groupBy) {
      try {
        const grouped = await this.prisma.dispatchItem.groupBy({
          by: ['salesOrderItemId'],
          where: {
            salesOrderItemId: { in: allSoItemIds },
            dispatch: {
              status: { notIn: ['CANCELLED', 'REJECTED'] as any },
            },
          },
          _sum: { quantity: true },
        });
        for (const g of grouped) {
          dispatchedBySoItem.set(g.salesOrderItemId, Number(g._sum.quantity || 0));
        }
      } catch (aggErr) {
        console.warn('[getDispatchQueue] dispatchItem.groupBy skipped:', aggErr);
      }
    }

    orders = orders
      .map((order: any) => {
        const enrichedItems = (order.items || [])
          .map((it: any) => {
            const ordered = Number(it.orderedQuantity ?? it.approvedQuantity ?? it.dispatchableQuantity ?? 0);
            const dispatched = it.salesOrderItemId
              ? Number(dispatchedBySoItem.get(it.salesOrderItemId) || 0)
              : 0;
            const remaining = Math.max(0, ordered - dispatched);
            return {
              ...it,
              orderedQuantity: ordered,
              dispatchedQuantity: dispatched,
              remainingQuantity: remaining,
              dispatchableQuantity: remaining,
            };
          })
          .filter((it: any) => it.remainingQuantity > 0);

        const totalOrdered = enrichedItems.reduce((s: number, it: any) => s + it.orderedQuantity, 0);
        const totalDispatched = enrichedItems.reduce((s: number, it: any) => s + it.dispatchedQuantity, 0);
        const totalRemaining = enrichedItems.reduce((s: number, it: any) => s + it.remainingQuantity, 0);

        return {
          ...order,
          items: enrichedItems,
          orderedQuantity: totalOrdered,
          dispatchedQuantity: totalDispatched,
          remainingQuantity: totalRemaining,
          isPartiallyDispatched: totalDispatched > 0 && totalRemaining > 0,
        };
      })
      .filter((order: any) => order.items.length > 0);

    // Sort newest first by orderDate / numeric order number
    orders.sort((a: any, b: any) => {
      const tA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const tB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      if (tA !== tB) return tB - tA;
      return String(b.orderNo || '').localeCompare(String(a.orderNo || ''));
    });

    const totalPartialOrders = orders.filter((o: any) => o.isPartiallyDispatched).length;
    const totalRemainingQty = orders.reduce((s: number, o: any) => s + Number(o.remainingQuantity || 0), 0);

    if (options?.onlyRemaining) {
      orders = orders.filter((o: any) => o.isPartiallyDispatched);
    }

    if (options?.search) {
      const tokens = options.search.toLowerCase().split(/\s+/).filter(Boolean);
      orders = orders.filter((o: any) => {
        const itemsText = (o.items || [])
          .map((it: any) => `${it.productName || ''} ${it.productCode || ''} ${it.workOrderNumber || ''}`)
          .join(' ');
        const hay = `${o.orderNo || ''} ${o.orderId || ''} ${o.customerName || ''} ${o.salesperson || ''} ${o.deliveryAddress || ''} ${o.workOrderNumber || ''} ${itemsText}`.toLowerCase();
        return tokens.every((t) => hay.includes(t));
      });
    }

    if (options?.page !== undefined) {
      const page = Math.max(1, options.page);
      const limit = options.limit ?? 25;
      const total = orders.length;
      const start = (page - 1) * limit;
      const paged = orders.slice(start, start + limit);
      return {
        data: paged,
        items: paged,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
        summary: {
          totalOrders: total,
          totalPartialOrders,
          totalRemainingQty,
        },
      };
    }

    return options?.limit ? orders.slice(0, options.limit) : orders;
  }
}
