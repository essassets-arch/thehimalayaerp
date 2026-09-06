import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { DomainErrorCodes } from '../../common/errors/domain-errors';
import { ListSalesOrdersQueryDto } from './dto/list-sales-orders-query.dto';
import { SalesOrderListResponseDto } from './dto/sales-order-list-response.dto';
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';
import { mapSalesOrder } from './mappers/sales-order.mapper';
import { Prisma, SalesOrderStatus } from '@prisma/client';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { ConvertQuotationToOrderDto } from './dto/convert-quotation-to-order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { WorkflowService } from '../workflow/workflow.service';
import { CreditService } from '../finance/credit.service';
import {
  getOrderSalesScope,
  getQuotationSalesScope,
  getSalesScope,
  isSalespersonScopedRole,
  canAssignSalesOwner,
} from '../../common/utils/rbac.util';
import { NotificationsService } from '../notifications/notifications.service';

const HISTORICAL_DISPATCH_INVOICES: Record<string, string> = {
  "HCPPL/2627/0088": "588",
  "fe7e13d2-8dd4-4ab2-ac7d-1997b12569ba": "588",
  "0088": "588",
  "88": "588",
  "HCPPL/2627/0089": "585",
  "7af1407b-b81d-4011-bf8f-e96611de1581": "585",
  "0089": "585",
  "89": "585",
  "HCPPL/2627/0141": "875",
  "a967bc13-bb9f-4b0a-bb4d-a18e74604750": "875",
  "HCPPL/2627/0008": "959",
  "34015f62-fafe-4d7c-87d5-db22fb39116e": "959",
  "HCPPL/2627/0005": "993",
  "7f6bf38b-d74a-4ba4-9721-7299a9b6ffbc": "993",
  "HCPPL/2627/0007": "906",
  "c63c7e7b-c3ae-4322-9e8c-85a7304193b2": "906",
  "HCPPL/2627/0006": "917",
  "182b8b9f-68ae-4fc2-a4f6-7b2ba7d4a1aa": "917",
  "HCPPL/2627/0009": "1004",
  "d0935574-e826-47b1-ba2c-29b6e828fcb0": "1004",
  "HCPPL/2627/0003": "987",
  "922e4fa7-5487-4340-9ce8-71e194883ea6": "987",
  "HCPPL/2627/0010": "599",
  "6db81226-f7ee-45a9-a931-f13887019803": "599",
  "HCPPL/2627/0014": "896",
  "5db841f3-4e4b-4c28-98e6-127e289bf653": "896",
  "HCPPL/2627/0015": "870",
  "0eefbb5c-41ad-46e3-a616-e41416e792c3": "870",
  "HCPPL/2627/0018": "550",
  "3fa0ec33-c87d-417d-8ae5-be75c0cb1fbb": "550",
  "HCPPL/2627/0021": "748",
  "fe59d9c2-b364-44df-9118-05b106be0944": "748",
  "HCPPL/2627/0026": "739",
  "a38e8be3-441d-4001-8319-ca2c12513470": "739",
  "HCPPL/2627/0025": "683",
  "7ba5411a-1d57-4180-8774-c0fa21eeb4df": "683",
  "HCPPL/2627/0022": "835",
  "eaae8182-3645-4228-a55d-3571d87e0ce3": "835",
  "HCPPL/2627/0013": "902",
  "7baef5ea-98cb-4e92-af0f-547df5d49008": "902",
  "HCPPL/2627/0031": "507",
  "2d338879-1116-43cf-bf2f-0498b8969e6b": "507",
  "HCPPL/2627/0033": "588",
  "d1c67d3d-c124-4f05-b1a3-29cebbdd0465": "588",
  "HCPPL/2627/0012": "903",
  "75ff6ff1-a9f4-41d4-8d48-cbdbef9df951": "903",
  "HCPPL/2627/0035": "58",
  "e5c0101b-c128-44d4-9d56-fb937db87556": "58",
  "HCPPL/2627/0040": "611",
  "93eb8364-c7ef-4ee3-be0e-7be1a80436d4": "611",
  "HCPPL/2627/0043": "19",
  "76ee3b73-c15c-43f6-95ff-4aa65cc8d6eb": "19",
  "HCPPL/2627/0046": "245",
  "f10134bc-0fe2-4be7-975a-694e910fae13": "245",
  "HCPPL/2627/0052": "246",
  "340a583e-9086-455b-8006-2ee910014a42": "246",
  "HCPPL/2627/0090": "279",
  "ca06a8f1-8cb5-46ff-b97c-9aa965bb6d0f": "279",
  "HCPPL/2627/0122": "775",
  "77ba4fa5-feea-4d8b-967b-232fbddc3b28": "775",
  "HCPPL/2627/0104": "411",
  "ef8a2610-d86b-47e2-8947-6953d10091ca": "411",
  "HCPPL/2627/0103": "440",
  "38f5379e-4e4c-473d-82d2-8be096898b1a": "440",
  "HCPPL/2627/0102": "376",
  "0eb2ff49-74d7-4632-9df7-d77ea41829e0": "376",
  "HCPPL/2627/0107": "585",
  "c8f00030-cf2f-4881-8078-d5e8ff7f2a74": "585",
  "HCPPL/2627/0113": "554",
  "6db81180-2db4-469b-9ef1-4be3fc5ff3ee": "554",
  "HCPPL/2627/0119": "813",
  "f47d9697-d862-42ad-b6f7-c299c08643ba": "813",
  "HCPPL/2627/0138": "852",
  "a8ca46c0-6d80-4965-9856-11eb063b4699": "852",
  "HCPPL/2627/0143": "895",
  "fa32a0d9-74e2-4db1-9be9-1c9f4c39f032": "895",
  "HCPPL/2627/0139": "868",
  "409f61b7-b080-466a-bdf8-6c84c787dd2a": "868",
  "HCPPL/2627/0145": "958",
  "fc39ca82-df75-4309-8be7-59d435f11a43": "958",
  "HCPPL/2627/0142": "944",
  "4fa6fe0e-3b2d-4b9d-9cf3-01fc8ff3d100": "944"
};

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
    private readonly workflowService: WorkflowService,
    private readonly creditService: CreditService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  async listOrders(
    query: ListSalesOrdersQueryDto,
    userId?: string,
    role?: string,
  ): Promise<SalesOrderListResponseDto> {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || query.limit || 100);
    const { search, status } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const normalizedRole = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');
    const isOperationalScope =
      normalizedRole.includes('DISPATCH') ||
      normalizedRole === 'DISPATCH_EXECUTIVE' ||
      normalizedRole === 'DISPATCH_2' ||
      normalizedRole === 'DISPATCH_1' ||
      normalizedRole === 'SUPER_ADMIN' ||
      normalizedRole === 'ADMIN' ||
      normalizedRole === 'PLANT_HEAD' ||
      normalizedRole === 'FINANCE_MANAGER' ||
      normalizedRole === 'FINANCE_EXECUTIVE' ||
      !isSalespersonScopedRole(role);
    const scope = isOperationalScope ? {} : getOrderSalesScope(userId, role);
    const where: Prisma.SalesOrderWhereInput = { ...scope, deletedAt: null };

    if (status) {
      if (status.includes(',')) {
        const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
        where.OR = [
          { status: { in: statuses as any } },
          { workflowState: { code: { in: statuses } } },
        ];
      } else {
        where.OR = [{ status: status as any }, { workflowState: { code: status } }];
      }
    }

    if (search) {
      const searchOR: Prisma.SalesOrderWhereInput[] = [
        {
          orderNumber: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
        {
          customerPurchaseOrderNo: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          customer: {
            companyName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const [total, records] = await this.prisma.$transaction([
      this.prisma.salesOrder.count({ where }),
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          quotation: {
            include: {
              lead: true,
            },
          },
          sourceQuotation: {
            include: {
              lead: true,
            },
          },
          salesExecutive: { select: { id: true, name: true, email: true } },
          items: { include: { product: true, dispatchItems: true } },
          workflowState: true,
          productionPlans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { workOrders: true },
          },
          dispatches: {
            include: { items: true },
            orderBy: { updatedAt: 'desc' },
          },
          returns: {
            include: { items: true },
            orderBy: { requestedAt: 'desc' },
          },
          replacementRequests: {
            include: { items: true },
            orderBy: { requestedAt: 'desc' },
          },
          customerPayments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    const resolvedCompanyId =
      (await this.prisma.company.findFirst())?.id ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const mapped = await this.mapSalesOrdersWithFulfillment(
      records,
      resolvedCompanyId,
    );
    return {
      data: mapped,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getOrder(id: string, userId?: string, role?: string) {
    const normalizedRole = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');
    const isOperationalScope =
      normalizedRole.includes('DISPATCH') ||
      normalizedRole === 'DISPATCH_EXECUTIVE' ||
      normalizedRole === 'DISPATCH_2' ||
      normalizedRole === 'DISPATCH_1' ||
      normalizedRole === 'SUPER_ADMIN' ||
      normalizedRole === 'ADMIN' ||
      normalizedRole === 'PLANT_HEAD' ||
      normalizedRole === 'FINANCE_MANAGER' ||
      normalizedRole === 'FINANCE_EXECUTIVE' ||
      !isSalespersonScopedRole(role);
    const scope = isOperationalScope ? {} : getOrderSalesScope(userId, role);
    const rawId = String(id || '').trim();
    let decodedId = rawId;
    try {
      decodedId = decodeURIComponent(rawId);
    } catch {
      decodedId = rawId;
    }
    const cleanId = decodedId.replace(/^#/, '').trim();

    const orConditions: any[] = [
      { id: decodedId },
      { id: rawId },
      { id: cleanId },
      { orderNumber: decodedId },
      { orderNumber: rawId },
      { orderNumber: cleanId },
      { orderNumber: `#${cleanId}` },
      { orderNumber: `ORD-${cleanId}` },
      { orderNumber: { equals: cleanId, mode: 'insensitive' } },
      { orderNumber: { equals: decodedId, mode: 'insensitive' } },
    ];

    if (cleanId.includes('/')) {
      orConditions.push({ orderNumber: cleanId.replace(/\//g, '-') });
      orConditions.push({ orderNumber: cleanId.replace(/\//g, ' ') });
    }
    if (cleanId.includes('-')) {
      orConditions.push({ orderNumber: cleanId.replace(/-/g, '/') });
    }

    const order = await this.prisma.salesOrder.findFirst({
      where: {
        AND: [
          {
            OR: orConditions,
          },
          scope,
          { deletedAt: null },
        ],
      },
      include: {
        customer: true,
        quotation: {
          include: {
            lead: true,
          },
        },
        sourceQuotation: {
          include: {
            lead: true,
          },
        },
        salesExecutive: { select: { id: true, name: true, email: true } },
        items: true,
        workflowState: true,
        productionPlans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { workOrders: true },
        },
        dispatches: {
          include: { items: true },
          orderBy: { updatedAt: 'desc' },
        },
        returns: { include: { items: true }, orderBy: { requestedAt: 'desc' } },
        replacementRequests: {
          include: { items: true },
          orderBy: { requestedAt: 'desc' },
        },
        customerPayments: true,
      },
    });
    if (!order)
      throw new NotFoundException(`SalesOrder with ID ${id} not found`);

    let availableActions: any[] = [];
    if (order.workflowStateId) {
      availableActions = await this.workflowService.getAvailableActions(
        'SALES_ORDER_FLOW',
        order.workflowStateId,
      );
    }

    const mappedOrder = await this.mapSalesOrderWithFulfillment(
      order,
      order.customer.companyId,
    );
    return {
      ...mappedOrder,
      availableActions,
    };
  }

  async listDeliveredPendingPayment(userId?: string, role?: string) {
    const normalizedRole = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');
    const isUnrestrictedSales =
      normalizedRole === 'SUPER_SALES' ||
      normalizedRole === 'SUPER_ADMIN' ||
      normalizedRole === 'ADMIN' ||
      normalizedRole === 'SALES_MANAGER' ||
      normalizedRole === 'FINANCE_MANAGER' ||
      normalizedRole === 'FINANCE_EXECUTIVE';

    const scope = isUnrestrictedSales
      ? {}
      : (isSalespersonScopedRole(role) && userId ? getOrderSalesScope(userId, role) : {});

    // Fetch real dispatch invoices from Postgres to link any dispatches created by dispatch user
    const [dispatchesWithInvoice, salesInvoicesWithInvoice] = await Promise.all([
      this.prisma.dispatch.findMany({
        where: {
          invoiceNumber: { not: null },
        },
        select: {
          id: true,
          salesOrderId: true,
          invoiceNumber: true,
          salesOrder: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
          items: {
            select: {
              salesOrderItem: {
                select: {
                  salesOrderId: true,
                  salesOrder: {
                    select: {
                      id: true,
                      orderNumber: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      this.prisma.salesInvoice.findMany({
        where: {
          invoiceNumber: { not: '' },
        },
        select: {
          salesOrderId: true,
          invoiceNumber: true,
          salesOrder: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
    ]);

    const dispatchInvByOrderId = new Map<string, string>();
    const registerHelper = (raw: string | null | undefined, inv: string) => {
      if (!raw || !inv) return;
      const s = String(raw).trim().toLowerCase();
      if (!s) return;
      if (!dispatchInvByOrderId.has(s)) dispatchInvByOrderId.set(s, inv);
      const norm = s.replace(/[^a-z0-9]/g, '');
      if (norm && !dispatchInvByOrderId.has(norm)) dispatchInvByOrderId.set(norm, inv);
      const numMatch = s.match(/\d{3,4}$/);
      if (numMatch) {
        if (!dispatchInvByOrderId.has(numMatch[0])) {
          dispatchInvByOrderId.set(numMatch[0], inv);
        }
        const noZero = numMatch[0].replace(/^0+/, '');
        if (noZero && !dispatchInvByOrderId.has(noZero)) {
          dispatchInvByOrderId.set(noZero, inv);
        }
      }
    };

    for (const d of dispatchesWithInvoice) {
      const inv = d.invoiceNumber?.trim();
      if (!inv || inv === '-') continue;
      registerHelper((d as any).id, inv);
      registerHelper((d as any).dispatchNo, inv);
      registerHelper(d.salesOrderId, inv);
      registerHelper(d.salesOrder?.id, inv);
      registerHelper(d.salesOrder?.orderNumber, inv);
      if (Array.isArray(d.items)) {
        for (const it of d.items) {
          registerHelper(it.salesOrderItem?.salesOrderId, inv);
          registerHelper(it.salesOrderItem?.salesOrder?.id, inv);
          registerHelper(it.salesOrderItem?.salesOrder?.orderNumber, inv);
        }
      }
    }

    for (const si of salesInvoicesWithInvoice) {
      const inv = si.invoiceNumber?.trim();
      if (!inv || inv === '-') continue;
      registerHelper(si.salesOrderId, inv);
      registerHelper(si.salesOrder?.id, inv);
      registerHelper(si.salesOrder?.orderNumber, inv);
    }

    const orders = await this.prisma.salesOrder.findMany({
      where: {
        deletedAt: null,
        status: { not: 'CANCELLED' },
        ...scope,
      },
      include: {
        customer: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        quotation: { select: { paymentTerms: true, paymentTermDays: true } },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            createdAt: true,
            totalAmount: true,
            status: true,
          },
        },
        customerPayments: {
          select: {
            id: true,
            paymentNo: true,
            amount: true,
            status: true,
            receivedAt: true,
            verifiedAt: true,
          },
        },
        dispatches: {
          select: {
            id: true,
            dispatchNo: true,
            status: true,
            deliveredAt: true,
            dispatchedAt: true,
            podUrl: true,
            invoiceNumber: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => {
      const verifiedPaidAmount = (order.customerPayments || [])
        .filter((p) =>
          [
            'VERIFIED',
            'FINANCE_VERIFIED',
            'PARTIALLY_ALLOCATED',
            'ALLOCATED',
          ].includes(String(p.status || '').toUpperCase()),
        )
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const totalAmount = Number(order.totalAmount || 0);
      const balanceAmount = Math.max(0, totalAmount - verifiedPaidAmount);

      const deliveredDispatches = (order.dispatches || []).filter(
        (d) =>
          ['DELIVERED', 'COMPLETED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'POD_RECEIVED', 'DISPATCH_CLOSED', 'DISPATCH_APPROVED'].includes(
            String(d.status || '').toUpperCase(),
          ) || Boolean(d.deliveredAt || d.dispatchedAt),
      );
      const deliveredAtDate =
        deliveredDispatches
          .map((d) => d.deliveredAt || d.dispatchedAt || d.createdAt)
          .filter((date): date is Date => Boolean(date))
          .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ||
        (order as any).deliveredAt ||
        order.paymentTermStartDate ||
        (order.dispatches || [])
          .map((d: any) => d.deliveredAt || d.dispatchedAt || d.createdAt)
          .filter(Boolean)[0] ||
        order.createdAt;

      const deliveredAt = deliveredAtDate ? new Date(deliveredAtDate) : null;

      const orderKey = String(order.id || '').trim().toLowerCase();
      const orderNumKey = String(order.orderNumber || '').trim().toLowerCase();
      const orderKeyNorm = orderKey.replace(/[^a-z0-9]/g, '');
      const orderNumKeyNorm = orderNumKey.replace(/[^a-z0-9]/g, '');
      const orderSuffixMatch = orderNumKey.match(/\d{3,4}$/);
      const orderSuffix = orderSuffixMatch ? orderSuffixMatch[0] : '';
      const orderSuffixNoZero = orderSuffix ? orderSuffix.replace(/^0+/, '') : '';

      const directDispatchInvoice =
        dispatchInvByOrderId.get(orderKey) ||
        dispatchInvByOrderId.get(orderNumKey) ||
        dispatchInvByOrderId.get(orderKeyNorm) ||
        dispatchInvByOrderId.get(orderNumKeyNorm) ||
        (orderSuffix ? dispatchInvByOrderId.get(orderSuffix) : undefined) ||
        (orderSuffixNoZero ? dispatchInvByOrderId.get(orderSuffixNoZero) : undefined);

      const latestDispatchInvoice = (order.dispatches || []).find(
        (d) => Boolean(d.invoiceNumber && typeof d.invoiceNumber === 'string' && d.invoiceNumber.trim() && d.invoiceNumber.trim() !== '-')
      )?.invoiceNumber?.trim();
      const latestOrderInvoice = (order.invoices || []).find(
        (inv) => Boolean(inv.invoiceNumber && typeof inv.invoiceNumber === 'string' && inv.invoiceNumber.trim() && inv.invoiceNumber.trim() !== '-')
      )?.invoiceNumber?.trim();
      const historicalDispatchInv =
        HISTORICAL_DISPATCH_INVOICES[order.id] ||
        (order.orderNumber ? HISTORICAL_DISPATCH_INVOICES[order.orderNumber] : undefined) ||
        (order.orderNumber ? HISTORICAL_DISPATCH_INVOICES[order.orderNumber.trim()] : undefined) ||
        (orderSuffix ? HISTORICAL_DISPATCH_INVOICES[orderSuffix] : undefined) ||
        (orderSuffixNoZero ? HISTORICAL_DISPATCH_INVOICES[orderSuffixNoZero] : undefined);

      const resolvedInvoiceNo =
        latestDispatchInvoice ||
        directDispatchInvoice ||
        latestOrderInvoice ||
        historicalDispatchInv ||
        null;

      const isActualInvoice = Boolean(resolvedInvoiceNo);

      return {
        id: order.id,
        order_number: order.orderNumber,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customer_name: order.customer?.companyName || 'Customer',
        customerName: order.customer?.companyName || 'Customer',
        salesperson: order.salesExecutive?.name || 'Sales Executive',
        grand_total: totalAmount,
        grandTotal: totalAmount,
        totalAmount,
        verified_paid_amount: verifiedPaidAmount,
        verifiedPaidAmount,
        balance_amount: balanceAmount,
        balanceAmount,
        invoice_number: resolvedInvoiceNo,
        invoiceNumber: resolvedInvoiceNo,
        invoiceNo: resolvedInvoiceNo,
        isActualInvoice,
        hasRealInvoice: isActualInvoice,
        dispatches: order.dispatches || [],
        invoices: order.invoices || [],
        delivered_at: deliveredAt ? deliveredAt.toISOString() : undefined,
        deliveredAt: deliveredAt ? deliveredAt.toISOString() : undefined,
        deliveryDate: deliveredAt ? deliveredAt.toISOString() : undefined,
        delivery_date: deliveredAt ? deliveredAt.toISOString() : undefined,
        paymentTerms:
          order.paymentTerms || `${order.paymentTermDays || 15} Days`,
        paymentDueDate: order.paymentDueDate?.toISOString(),
        paymentStatus:
          balanceAmount <= 0 && totalAmount > 0
            ? 'PAID'
            : verifiedPaidAmount > 0
              ? 'PARTIALLY_PAID'
              : 'PENDING',
      };
    });
  }

  async updateInvoiceNumber(
    orderIdOrNumber: string,
    invoiceNumber: string,
    userId?: string,
  ) {
    const cleanInv = String(invoiceNumber || '').trim();
    if (!cleanInv) {
      throw new BadRequestException('Invoice number cannot be empty');
    }

    const orderTarget = String(orderIdOrNumber || '').trim();
    const orderNoClean = orderTarget.replace(/^#/, '');

    const order = await this.prisma.salesOrder.findFirst({
      where: {
        OR: [
          { id: orderTarget },
          { orderNumber: orderTarget },
          { orderNumber: orderNoClean },
          { orderNumber: { equals: orderNoClean, mode: 'insensitive' } },
        ],
      },
      include: {
        dispatches: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Sales order '${orderIdOrNumber}' not found`);
    }

    // Update or link dispatches
    if (order.dispatches && order.dispatches.length > 0) {
      for (const d of order.dispatches) {
        await this.prisma.dispatch
          .update({
            where: { id: d.id },
            data: { invoiceNumber: cleanInv },
          })
          .catch(() => {});
      }
    } else {
      await this.prisma.dispatch
        .create({
          data: {
            dispatchNo: `DSP-${Date.now().toString().slice(-6)}`,
            salesOrderId: order.id,
            status: 'DELIVERED',
            invoiceNumber: cleanInv,
            deliveredAt: (order as any).deliveredAt || new Date(),
          },
        })
        .catch(() => {});
    }

    // Update or link SalesInvoice
    if (order.invoices && order.invoices.length > 0) {
      for (const inv of order.invoices) {
        await this.prisma.salesInvoice
          .update({
            where: { id: inv.id },
            data: { invoiceNumber: cleanInv },
          })
          .catch(() => {});
      }
    }

    // Update in-memory registry for instantaneous synchronization
    HISTORICAL_DISPATCH_INVOICES[order.id] = cleanInv;
    if (order.orderNumber) {
      HISTORICAL_DISPATCH_INVOICES[order.orderNumber] = cleanInv;
      HISTORICAL_DISPATCH_INVOICES[order.orderNumber.trim()] = cleanInv;
      HISTORICAL_DISPATCH_INVOICES[order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')] = cleanInv;
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      invoiceNumber: cleanInv,
      isActualInvoice: true,
    };
  }

  private calculateTotals(items: any[]) {
    let subtotal = new Decimal(0);
    let taxableAmountTotal = new Decimal(0);
    let taxAmountTotal = new Decimal(0);
    let discountAmountTotal = new Decimal(0);

    const processedItems = items.map((item) => {
      const qty = new Decimal(item.orderedQuantity);
      const price = new Decimal(item.unitPrice);
      const discount = new Decimal(item.discountAmount || 0);
      const taxRate = new Decimal(item.taxRate || 0);

      const grossAmount = qty.mul(price);
      const taxableAmount = grossAmount.sub(discount);
      const taxAmount = taxableAmount.mul(taxRate).div(100);
      const lineTotal = taxableAmount.add(taxAmount);

      subtotal = subtotal.add(grossAmount);
      discountAmountTotal = discountAmountTotal.add(discount);
      taxableAmountTotal = taxableAmountTotal.add(taxableAmount);
      taxAmountTotal = taxAmountTotal.add(taxAmount);

      return {
        ...item,
        lineTotal: lineTotal.toNumber(),
        taxableAmount: taxableAmount.toNumber(),
      };
    });

    const totalAmount = taxableAmountTotal.add(taxAmountTotal);

    return {
      subtotal: subtotal.toNumber(),
      discountAmount: discountAmountTotal.toNumber(),
      taxableAmount: taxableAmountTotal.toNumber(),
      taxAmount: taxAmountTotal.toNumber(),
      totalAmount: totalAmount.toNumber(),
      processedItems,
    };
  }

  async createOrder(
    dto: CreateSalesOrderDto,
    userId: string,
    role?: string,
  ): Promise<SalesOrderResponseDto> {
    const initialState =
      await this.workflowService.getInitialState('SALES_ORDER');

    return this.prisma.$transaction(async (tx) => {
      const { processedItems, ...totals } = this.calculateTotals(dto.items);
      const orderDate = dto.orderDate ? new Date(dto.orderDate) : new Date();
      const orderNumber = await this.sequenceService.generateSalesOrderNumber(
        orderDate,
        tx,
      );

      const products = await tx.product.findMany({
        where: { id: { in: processedItems.map((item) => item.productId) } },
        select: { id: true, name: true, sku: true },
      });
      const productById = new Map(
        products.map((product) => [product.id, product]),
      );
      let quotationSalesExecutiveId: string | null = null;
      let quotationPaymentTerms: string | null = null;
      let quotationPaymentTermDays: number | null = null;
      let quotationPaymentTermStartDate: Date | null = null;
      if (dto.quotationId) {
        const quoteObj = await tx.quotation.findFirst({
          where: {
            id: dto.quotationId,
            ...getQuotationSalesScope(userId, role),
          },
          select: {
            salesExecutiveId: true,
            createdById: true,
            paymentTerms: true,
            paymentTermDays: true,
            createdAt: true,
          },
        });
        if (!quoteObj && isSalespersonScopedRole(role)) {
          throw new NotFoundException('Quotation not found');
        }
        if (quoteObj) {
          quotationSalesExecutiveId =
            quoteObj.salesExecutiveId || quoteObj.createdById;
          quotationPaymentTerms = quoteObj.paymentTerms;
          quotationPaymentTermDays = quoteObj.paymentTermDays;
          quotationPaymentTermStartDate =
            (quoteObj as any).paymentTermStartDate || quoteObj.createdAt;
        }
      }
      const isManager = canAssignSalesOwner(role);
      const resolvedSalesExecutiveId = isManager
        ? (dto as any).salesExecutiveId || quotationSalesExecutiveId || userId
        : quotationSalesExecutiveId || userId;

      const resolvedTermDays =
        dto.paymentTermsDays ||
        quotationPaymentTermDays ||
        (quotationPaymentTerms
          ? parseInt(
              String(quotationPaymentTerms).match(/\d+/)?.[0] || '15',
              10,
            )
          : 15);
      const resolvedPaymentTerms =
        (dto as any).paymentTerms ||
        quotationPaymentTerms ||
        `${resolvedTermDays} Days`;
      const resolvedStartDate = (dto as any).paymentTermStartDate
        ? new Date((dto as any).paymentTermStartDate)
        : quotationPaymentTermStartDate ||
          (dto.orderDate ? new Date(dto.orderDate) : new Date());
      const resolvedDueDate = (dto as any).paymentDueDate
        ? new Date((dto as any).paymentDueDate)
        : new Date(resolvedStartDate.getTime() + resolvedTermDays * 86400000);

      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          quotationId: dto.quotationId,
          salesExecutiveId: resolvedSalesExecutiveId,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          customerPurchaseOrderNo: dto.customerPurchaseOrderNo,
          workflowStateId: initialState.id,
          paymentTerms: resolvedPaymentTerms,
          paymentTermDays: resolvedTermDays,
          paymentTermsDays: resolvedTermDays,
          paymentTermStartDate: resolvedStartDate,
          paymentDueDate: resolvedDueDate,
          paidAmount: 0,
          outstandingAmount: totals.totalAmount,
          paymentStatus: 'PENDING',
          // Single unified status — roll-up status fields were removed in the modular refactor.
          // Production, dispatch, invoice, payment summaries are computed from child documents.
          status: SalesOrderStatus.DRAFT,
          subtotal: totals.subtotal,
          taxableAmount: totals.taxableAmount,
          taxAmount: totals.taxAmount,
          freightAmount: 0,
          discountAmount: totals.discountAmount,
          totalAmount: totals.totalAmount,
          createdById: userId,
          items: {
            create: processedItems.map((item) => ({
              productId: item.productId,
              orderedQuantity: item.orderedQuantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              taxableAmount: item.taxableAmount,
              lineTotal: item.lineTotal,
              productNameSnapshot:
                productById.get(item.productId)?.name || 'Unknown Product',
              productCodeSnapshot: productById.get(item.productId)?.sku,
            })),
          },
        },
        include: {
          customer: true,
          salesExecutive: { select: { id: true, name: true, email: true } },
          items: true,
          workflowState: true,
          productionPlans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { workOrders: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'SALES_ORDER_CREATED',
          entityType: 'SalesOrder',
          entityId: order.id,
          actorUserId: userId,
          after: JSON.parse(JSON.stringify(order)),
        },
      });
      const mappedOrder = await this.mapSalesOrderWithFulfillment(
        order,
        order.customer.companyId,
      );
      if (!mappedOrder)
        throw new BadRequestException('Failed to map created order.');
      return mappedOrder;
    });
  }

  async processAction(
    id: string,
    dto: { action?: string; remarks?: string; orderId?: string; id?: string; expectedVersion?: number },
    userId: string,
    role?: string,
  ) {
    const rawId = String(id || dto?.orderId || dto?.id || '').trim();
    let decodedOrderReference = rawId;
    try {
      decodedOrderReference = decodeURIComponent(rawId).trim();
    } catch {
      // Keep the original value when a malformed URI is supplied.
    }
    const cleanId = decodedOrderReference;
    const actionName = dto.action || 'SEND_TO_PLANT';

    const normalizedRole = String(role || '').toUpperCase().replace(/[\s-]+/g, '_');
    const isOperationalScope =
      normalizedRole.includes('DISPATCH') ||
      normalizedRole === 'DISPATCH_EXECUTIVE' ||
      normalizedRole === 'DISPATCH_2' ||
      normalizedRole === 'DISPATCH_1' ||
      normalizedRole === 'SUPER_ADMIN' ||
      normalizedRole === 'ADMIN' ||
      normalizedRole === 'PLANT_HEAD' ||
      normalizedRole === 'FINANCE_MANAGER' ||
      normalizedRole === 'FINANCE_EXECUTIVE' ||
      !isSalespersonScopedRole(role);
    const scope = isOperationalScope ? {} : getSalesScope(userId, role, 'SalesOrder');

    const result = await this.prisma.$transaction(async (tx) => {
      const orConditions: Prisma.SalesOrderWhereInput[] = [
        { id: rawId },
        { id: decodedOrderReference },
        { orderNumber: rawId },
        { orderNumber: decodedOrderReference },
        { orderNumber: { contains: cleanId, mode: Prisma.QueryMode.insensitive } },
        { customerPurchaseOrderNo: rawId },
        { customerPurchaseOrderNo: decodedOrderReference },
      ];
      if (cleanId.includes('/')) {
        orConditions.push({ orderNumber: cleanId.replace(/\//g, '-') });
        orConditions.push({ orderNumber: cleanId.replace(/\//g, ' ') });
        orConditions.push({ orderNumber: cleanId.replace(/\s+/g, '') });
      }
      if (cleanId.includes('-')) {
        orConditions.push({ orderNumber: cleanId.replace(/-/g, '/') });
      }
      if (cleanId.includes(' ')) {
        orConditions.push({ orderNumber: cleanId.replace(/\s+/g, '/') });
        orConditions.push({ orderNumber: cleanId.replace(/\s+/g, '') });
        orConditions.push({ orderNumber: cleanId.replace(/\s+/g, '-') });
      }

      const order = await tx.salesOrder.findFirst({
        where: {
          AND: [
            { OR: orConditions },
            scope,
            { deletedAt: null },
          ],
        },
        include: { items: true },
      });
      if (!order) throw new NotFoundException(`Sales Order ${cleanId} not found`);

      if (actionName === 'SUBMIT') {
        const orderTotal = order.items.reduce(
          (sum, item) => sum + Number(item.lineTotal),
          0,
        );
        const creditCheck = await this.creditService.checkCreditLimit(
          order.customerId,
          orderTotal,
          'SALES_ORDER',
        );

        if (!creditCheck.allowed && creditCheck.requiresApproval) {
          // We will allow submission but the state will naturally move to PENDING_APPROVAL and require an authorized user.
          // For strictness, if we wanted to block it:
          // throw new BadRequestException(`Credit limit exceeded. Current Balance: ${creditCheck.currentBalance}, Limit: ${creditCheck.creditLimit}`);
        }
      }

      let nextStateId = order.workflowStateId!;
      const result = await this.workflowService.processAction(
        {
          entityId: order.id,
          entityType: 'SALES_ORDER',
          workflowCode: 'SALES_ORDER',
          currentStateId: order.workflowStateId!,
          actionName,
          userId,
          remarks: dto.remarks,
        },
        tx,
      );
      if (result?.nextStateId) nextStateId = result.nextStateId;

      const statusByAction: Partial<Record<string, SalesOrderStatus>> = {
        SUBMIT: SalesOrderStatus.PENDING_APPROVAL,
        CONFIRM: SalesOrderStatus.CONFIRMED,
        SEND_TO_PLANT: SalesOrderStatus.SENT_TO_PLANT_HEAD,
        PLANT_APPROVE: SalesOrderStatus.PLANT_APPROVED,
        PLAN_PRODUCTION: SalesOrderStatus.READY_FOR_PRODUCTION,
        START_PRODUCTION: SalesOrderStatus.IN_PRODUCTION,
        MARK_READY: SalesOrderStatus.READY_FOR_DISPATCH,
        COMPLETE: SalesOrderStatus.COMPLETED,
        CANCEL: SalesOrderStatus.CANCELLED,
      };
      const updated = await tx.salesOrder.update({
        where: { id: order.id },
        data: {
          workflowStateId: nextStateId,
          ...(statusByAction[actionName]
            ? { status: statusByAction[actionName] }
            : {}),
          ...(actionName === 'CONFIRM' ? { confirmedAt: new Date() } : {}),
          ...(dto.remarks ? { remarks: dto.remarks } : {}),
          version: { increment: 1 },
        },
        include: {
          customer: true,
          items: true,
          workflowState: true,
          productionPlans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { workOrders: true },
          },
        },
      });

      if (actionName === 'SEND_TO_PLANT') {
        if (order.sourceQuotationId) {
          const convertedState = await tx.workflowState.findFirst({
            where: { workflow: { code: 'QUOTATION' }, code: 'CONVERTED_TO_SO' },
          });
          if (convertedState) {
            await tx.quotation.update({
              where: { id: order.sourceQuotationId },
              data: { workflowStateId: convertedState.id },
            });
          }
        }

        const productIds = order.items.map((i) => i.productId).filter(Boolean);
        const orderProducts = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, category: true, productType: true, dispatchCategory: true, sku: true, name: true },
        });

        const isItemTrading = (item: any) => {
          const p = orderProducts.find((prod) => prod.id === item.productId);
          const pType = String(p?.productType || item?.productType || '').toUpperCase();
          if (pType === 'TRADING') return true;
          if (pType === 'MANUFACTURING') return false;

          const dCat = String(p?.dispatchCategory || item?.dispatchCategory || '').toUpperCase();
          if (dCat === 'D2' || dCat.includes('2')) return true;

          const cat = String(p?.category || item?.category || '').toUpperCase();
          if (['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(cat)) return true;
          if (['FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING'].includes(cat)) return false;

          const skuOrName = String(p?.sku || p?.name || item?.productCodeSnapshot || item?.productNameSnapshot || '').toUpperCase();
          if (
            skuOrName.startsWith('WCB') ||
            skuOrName.startsWith('PCB') ||
            skuOrName.startsWith('HTCB') ||
            skuOrName.startsWith('DTCB') ||
            skuOrName.startsWith('MCB') ||
            skuOrName.startsWith('BTCB') ||
            skuOrName.startsWith('FRCCP') ||
            skuOrName.startsWith('FRCT') ||
            skuOrName.startsWith('FRCSQRC') ||
            skuOrName.startsWith('FRC') ||
            skuOrName.startsWith('RCC') ||
            skuOrName.includes('COVERBLOCK') ||
            skuOrName.includes('COVER BLOCK') ||
            skuOrName.includes('FRC COVER') ||
            skuOrName.includes('RCC PIPE')
          ) {
            return true;
          }
          return false;
        };

        const hasManufacturingProduct = order.items.some((item) => !isItemTrading(item));

        if (hasManufacturingProduct) {
          // Manufacturing order -> Route to Plant Head & Factory Production Planning
          if (updated.productionPlans.length === 0) {
            const [initialPlanState, plantHead, planNumber] = await Promise.all(
              [
                this.workflowService.getInitialState('PRODUCTION_PLAN', tx),
                tx.user.findFirst({
                  where: {
                    isActive: true,
                    deletedAt: null,
                    role: { code: 'PLANT_HEAD' },
                  },
                  select: { id: true },
                  orderBy: { createdAt: 'asc' },
                }),
                this.sequenceService.generateNextWithTx(
                  tx,
                  'production_plan_number',
                  'PP-',
                ),
              ],
            );
            await tx.productionPlan.create({
              data: {
                planNumber,
                salesOrderId: order.id,
                status: 'PENDING_PLANNING',
                assignedToId: plantHead?.id,
                workflowStateId: initialPlanState.id,
              },
            });
          }
        } else {
          // 100% Trading order -> Bypass Plant Head factory production & route directly to Dispatch 2 (Sahad Dispatch)
          const readyDispatchState = await tx.workflowState.findFirst({
            where: {
              workflow: { code: 'SALES_ORDER' },
              code: 'READY_FOR_DISPATCH',
            },
          });
          await tx.salesOrder.update({
            where: { id: order.id },
            data: {
              status: SalesOrderStatus.READY_FOR_DISPATCH,
              ...(readyDispatchState
                ? { workflowStateId: readyDispatchState.id }
                : {}),
            },
          });
        }
      }

      const orderWithPlan = await tx.salesOrder.findUniqueOrThrow({
        where: { id },
        include: {
          customer: true,
          salesExecutive: { select: { id: true, name: true, email: true } },
          items: true,
          workflowState: true,
          productionPlans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { workOrders: true },
          },
        },
      });

      const mappedOrder = await this.mapSalesOrderWithFulfillment(
        orderWithPlan,
        orderWithPlan.customer.companyId,
      );
      return {
        success: true,
        message: `Action ${dto.action} processed successfully. New state: ${updated.workflowState?.name || updated.status}`,
        order: mappedOrder,
        originalOrder: orderWithPlan,
      };
    });

    const notificationsService = this.notificationsService;
    if (notificationsService && result?.originalOrder) {
      const order = result.originalOrder;
      const companyId = order.customer.companyId;

      if (dto.action === 'SEND_TO_PLANT') {
        const productIds = order.items.map((i: any) => i.productId).filter(Boolean);
        const orderProducts = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, category: true, productType: true, dispatchCategory: true, sku: true, name: true },
        });

        const isItemTrading = (item: any) => {
          const p = orderProducts.find((prod) => prod.id === item.productId);
          const pType = String(p?.productType || item?.productType || '').toUpperCase();
          if (pType === 'TRADING') return true;
          if (pType === 'MANUFACTURING') return false;
          const dCat = String(p?.dispatchCategory || item?.dispatchCategory || '').toUpperCase();
          if (dCat === 'D2' || dCat.includes('2')) return true;
          const cat = String(p?.category || item?.category || '').toUpperCase();
          if (['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(cat)) return true;
          if (['FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING'].includes(cat)) return false;
          const skuOrName = String(p?.sku || p?.name || item?.productCodeSnapshot || item?.productNameSnapshot || '').toUpperCase();
          return (
            skuOrName.startsWith('WCB') ||
            skuOrName.startsWith('PCB') ||
            skuOrName.startsWith('HTCB') ||
            skuOrName.startsWith('DTCB') ||
            skuOrName.startsWith('MCB') ||
            skuOrName.startsWith('BTCB') ||
            skuOrName.startsWith('FRCCP') ||
            skuOrName.startsWith('FRCT') ||
            skuOrName.startsWith('FRCSQRC') ||
            skuOrName.startsWith('FRC') ||
            skuOrName.startsWith('RCC') ||
            skuOrName.includes('COVERBLOCK') ||
            skuOrName.includes('COVER BLOCK') ||
            skuOrName.includes('FRC COVER') ||
            skuOrName.includes('RCC PIPE')
          );
        };

        const hasManufacturing = order.items.some((item: any) => !isItemTrading(item));

        if (!hasManufacturing) {
          notificationsService
            .notifyRole({
              companyId,
              role: 'DISPATCH_2',
              type: 'SALES_ORDER_READY_FOR_DISPATCH_2',
              title: 'New Trading Order Ready for Dispatch',
              message: `${order.orderNumber} — ${order.customer.companyName} is ready for Sahad Dispatch (Dispatch 2).`,
              route: '/dispatch-2/orders',
              entityType: 'SalesOrder',
              entityId: order.id,
              eventKeyPrefix: `SALES_ORDER:${order.id}:READY_FOR_DISPATCH_2`,
            })
            .catch((err) =>
              console.warn(
                '[SalesService Notification] Failed to notify DISPATCH_2:',
                err.message,
              ),
            );
        } else {
          notificationsService
            .notifyRole({
              companyId,
              role: 'PLANT_HEAD',
              type: 'SALES_ORDER_PENDING_PLANT_HEAD',
              title: 'New Order Awaiting Review',
              message: `${order.orderNumber} — ${order.customer.companyName} is awaiting Plant Head acceptance.`,
              route: '/plant-head/incoming-orders',
              entityType: 'SalesOrder',
              entityId: order.id,
              eventKeyPrefix: `SALES_ORDER:${order.id}:PENDING_PLANT_HEAD`,
            })
            .catch((err) =>
              console.warn(
                '[SalesService Notification] Failed to notify PLANT_HEAD:',
                err.message,
              ),
            );
        }
      } else if (dto.action === 'PLANT_APPROVE' || dto.action === 'PLAN_PRODUCTION') {
        // 1. Notify Production Team of new incoming approved order
        notificationsService
          .notifyRole({
            companyId,
            roles: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION'],
            type: 'SALES_ORDER_PLANT_APPROVED_INCOMING',
            title: 'New Incoming Production Order',
            message: `${order.orderNumber} — Plant Head has approved and scheduled order for production planning.`,
            route: '/production/incoming-orders',
            entityType: 'SalesOrder',
            entityId: order.id,
            eventKeyPrefix: `SALES_ORDER:${order.id}:PLANT_APPROVED_PROD`,
          })
          .catch((err) =>
            console.warn(
              '[SalesService Notification] Failed to notify Production Team:',
              err.message,
            ),
          );

        // 2. Notify Sales Executive
        const recipientId = order.salesExecutiveId || order.createdById;
        if (recipientId) {
          this.prisma.user
            .findUnique({
              where: { id: recipientId },
              include: { role: true },
            })
            .then((recipient) => {
              if (recipient) {
                const isSuperSales = recipient.role?.code === 'SUPER_SALES';
                const route = isSuperSales
                  ? `/supersales/orders/${order.id}`
                  : `/sales/orders/${order.id}`;

                notificationsService
                  .notifyUser({
                    companyId,
                    userId: recipient.id,
                    type: 'SALES_ORDER_PLANT_ACCEPTED',
                    title: 'Order Accepted by Plant Head',
                    message: `${order.orderNumber} — Plant Head has accepted the order.`,
                    route,
                    entityType: 'SalesOrder',
                    entityId: order.id,
                    eventKey: `SALES_ORDER:${order.id}:PLANT_ACCEPTED`,
                  })
                  .catch((err) =>
                    console.warn(
                      '[SalesService Notification] Failed to notify Sales Executive/Owner:',
                      err.message,
                    ),
                  );
              }
            })
            .catch((err) => {
              console.warn(
                '[SalesService Notification] Failed to fetch recipient details:',
                err.message,
              );
            });
        }
      } else if (dto.action === 'PLANT_REJECT') {
        const recipientId = order.salesExecutiveId || order.createdById;
        if (recipientId) {
          this.prisma.user
            .findUnique({
              where: { id: recipientId },
              include: { role: true },
            })
            .then((recipient) => {
              if (recipient) {
                const isSuperSales = recipient.role?.code === 'SUPER_SALES';
                const route = isSuperSales
                  ? `/supersales/orders/${order.id}`
                  : `/sales/orders/${order.id}`;

                notificationsService
                  .notifyUser({
                    companyId,
                    userId: recipient.id,
                    type: 'SALES_ORDER_RETURNED',
                    title: 'Order Requires Sales Action',
                    message: `${order.orderNumber} — Plant Head returned the order for correction/review.`,
                    route,
                    entityType: 'SalesOrder',
                    entityId: order.id,
                    eventKey: `SALES_ORDER:${order.id}:RETURNED`,
                  })
                  .catch((err) =>
                    console.warn(
                      '[SalesService Notification] Failed to notify Sales Executive/Owner:',
                      err.message,
                    ),
                  );
              }
            })
            .catch((err) => {
              console.warn(
                '[SalesService Notification] Failed to fetch recipient details:',
                err.message,
              );
            });
        }
      } else if (dto.action === 'PLAN_PRODUCTION') {
        const targetDateStr = order.productionPlans?.[0]?.plannedEndDate
          ? new Date(
              order.productionPlans[0].plannedEndDate,
            ).toLocaleDateString('en-GB')
          : 'not set';
        notificationsService
          .notifyRole({
            companyId,
            role: 'PRODUCTION_MANAGER',
            type: 'ORDER_RELEASED_TO_PRODUCTION',
            title: 'Order Released to Production',
            message: `${order.orderNumber} — Production target date is ${targetDateStr} and the order is ready for planning/execution.`,
            route: '/production/incoming-orders',
            entityType: 'SalesOrder',
            entityId: order.id,
            eventKeyPrefix: `SALES_ORDER:${order.id}:RELEASED_TO_PRODUCTION`,
          })
          .catch((err) =>
            console.warn(
              '[SalesService Notification] Failed to notify PRODUCTION_MANAGER:',
              err.message,
            ),
          );
      }
    }

    return {
      success: result.success,
      message: result.message,
      order: result.order,
    };
  }

  async convertQuotationToOrder(
    dto: ConvertQuotationToOrderDto,
    userId: string,
    role?: string,
  ): Promise<SalesOrderResponseDto> {
    const scope = getSalesScope(userId, role, 'Quotation');
    const quotation = await this.prisma.quotation.findFirst({
      where: { id: dto.quotationId, ...scope },
    });
    throw new BadRequestException({
      code: DomainErrorCodes.QUOTATION_NOT_ACCEPTED,
      message: 'Quotations not implemented in prototype',
    });
  }

  private async getFulfillmentData(orders: any[], companyId: string) {
    const allItemIds = orders.flatMap((o) => o.items?.map((i) => i.id) || []);
    const allProductIds = Array.from(
      new Set(orders.flatMap((o) => o.items?.map((i) => i.productId) || [])),
    );

    const fgRecords = await this.prisma.finishedGoods.findMany({
      where: {
        productId: { in: allProductIds },
      },
    });

    const dispatchItems = await this.prisma.dispatchItem.findMany({
      where: {
        salesOrderItemId: { in: allItemIds },
      },
    });

    const allocations = await this.prisma.salesOrderAllocation.findMany({
      where: {
        salesOrderItemId: { in: allItemIds },
      },
    });

    const fgMap = new Map<string, number>();
    for (const fg of fgRecords) {
      fgMap.set(
        fg.productId,
        (fgMap.get(fg.productId) || 0) + Number(fg.availableQuantity),
      );
    }

    const dispatchMap = new Map<string, number>();
    for (const d of dispatchItems) {
      dispatchMap.set(
        d.salesOrderItemId,
        (dispatchMap.get(d.salesOrderItemId) || 0) + Number(d.quantity),
      );
    }

    const allocationMap = new Map<
      string,
      { reserved: number; production: number }
    >();
    for (const a of allocations) {
      const current = allocationMap.get(a.salesOrderItemId) || {
        reserved: 0,
        production: 0,
      };
      if (a.allocationType === 'FINISHED_GOODS_RESERVATION') {
        current.reserved += Number(a.reservedQuantity);
      } else if (a.allocationType === 'PRODUCTION_REQUIRED') {
        current.production += Number(a.productionQuantity);
      }
      allocationMap.set(a.salesOrderItemId, current);
    }

    return { fgMap, dispatchMap, allocationMap };
  }

  private async mapSalesOrdersWithFulfillment(
    orders: any[],
    companyId: string,
  ) {
    if (!orders || orders.length === 0) return [];
    const fulfillmentData = await this.getFulfillmentData(orders, companyId);
    return orders.map((order) => mapSalesOrder(order, fulfillmentData));
  }

  private async mapSalesOrderWithFulfillment(order: any, companyId: string) {
    if (!order) return null;
    const fulfillmentData = await this.getFulfillmentData([order], companyId);
    return mapSalesOrder(order, fulfillmentData);
  }
}
