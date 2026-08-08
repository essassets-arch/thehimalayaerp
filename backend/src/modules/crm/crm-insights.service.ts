import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getSalesScope } from '../../common/utils/rbac.util';

@Injectable()
export class CrmInsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async customer360(
    customerId: string,
    companyId?: string,
    userId?: string,
    role?: string,
  ) {
    const scope = getSalesScope(userId, role, 'createdById');
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
        ...scope,
        ...(companyId ? { companyId } : {}),
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const [leads, quotations, orders, invoices, payments, ledger] =
      await Promise.all([
        this.prisma.lead.findMany({
          where: { OR: [{ customerId }, { convertedCustomerId: customerId }] },
          include: { workflowState: true, activities: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.quotation.findMany({
          where: {
            OR: [
              { customerId },
              {
                lead: {
                  OR: [{ customerId }, { convertedCustomerId: customerId }],
                },
              },
            ],
          },
          include: { workflowState: true, items: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.salesOrder.findMany({
          where: { customerId, deletedAt: null },
          include: { workflowState: true, items: true, dispatches: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.salesInvoice.findMany({
          where: { salesOrder: { customerId } },
          include: {
            workflowState: true,
            items: true,
            paymentAllocations: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.customerPayment.findMany({
          where: { customerId },
          include: { workflowState: true, allocations: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.customerLedger.findMany({
          where: { customerId },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    let outstandingBalance = 0;
    const ledgerWithBalance = ledger.map((entry) => {
      outstandingBalance += Number(entry.debit) - Number(entry.credit);
      return { ...entry, balance: outstandingBalance };
    });
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const entityIds = [
      ...leads.map((record) => record.id),
      ...quotations.map((record) => record.id),
      ...orders.map((record) => record.id),
      ...invoices.map((record) => record.id),
      ...payments.map((record) => record.id),
    ];
    const workflowHistory = entityIds.length
      ? await this.prisma.workflowHistory.findMany({
          where: { entityId: { in: entityIds } },
          orderBy: { createdAt: 'desc' },
        })
      : [];
    const activities = leads.flatMap((lead) =>
      lead.activities.map((activity) => ({
        ...activity,
        entityType: 'LEAD',
        entityId: lead.id,
      })),
    );
    const timeline = [...workflowHistory, ...activities].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return {
      customer,
      overview: {
        totalSales,
        outstandingBalance,
        creditLimit: Number(customer.creditLimit || 0),
        availableCredit: Number(customer.creditLimit || 0) - outstandingBalance,
        creditStatus: customer.creditStatus,
        paymentStatus: outstandingBalance > 0 ? 'OUTSTANDING' : 'CURRENT',
      },
      crm: { leads, activities, quotations },
      sales: {
        orders,
        deliveries: orders.flatMap((order) => order.dispatches),
      },
      finance: { invoices, payments, ledger: ledgerWithBalance },
      timeline,
    };
  }

  async salesDashboard(companyId?: string, userId?: string, role?: string) {
    const companyFilter = companyId ? { companyId } : {};
    const leadScope = getSalesScope(userId, role, 'Lead');
    const quotationScope = getSalesScope(userId, role, 'Quotation');
    const orderScope = getSalesScope(userId, role, 'SalesOrder');

    const [
      leadStates,
      quotationStates,
      leads,
      quotations,
      orders,
      ledger,
      users,
    ] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['workflowStateId'],
        where: { deletedAt: null, ...companyFilter, ...leadScope },
        _count: { _all: true },
      }),
      this.prisma.quotation.groupBy({
        by: ['workflowStateId'],
        where: { deletedAt: null, ...companyFilter, ...quotationScope },
        _count: { _all: true },
      }),
      this.prisma.lead.findMany({
        where: { deletedAt: null, ...companyFilter, ...leadScope },
        select: {
          id: true,
          assignedToId: true,
          convertedAt: true,
          workflowStateId: true,
        },
      }),
      this.prisma.quotation.findMany({
        where: { deletedAt: null, ...companyFilter, ...quotationScope },
        select: { id: true, total: true, workflowStateId: true },
      }),
      this.prisma.salesOrder.findMany({
        where: {
          deletedAt: null,
          ...(companyId ? { customer: { companyId } } : {}),
          ...orderScope,
        },
        select: { totalAmount: true, createdById: true },
      }),
      this.prisma.customerLedger.findMany({
        where: {
          ...(companyId ? { customer: { companyId } } : {}),
          ...(Object.keys(orderScope).length > 0 ? { createdById: userId } : {}),
        },
        select: { debit: true, credit: true },
      }),
      this.prisma.user.findMany({
        where: companyId ? { companyId } : {},
        select: { id: true, name: true },
      }),
    ]);
    const stateIds = [
      ...leadStates.map((row) => row.workflowStateId),
      ...quotationStates.map((row) => row.workflowStateId),
    ].filter((value): value is string => Boolean(value));
    const states = await this.prisma.workflowState.findMany({
      where: { id: { in: stateIds } },
      select: { id: true, code: true, name: true },
    });
    const stateById = new Map(states.map((state) => [state.id, state]));
    const acceptedStateIds = new Set(
      states
        .filter((state) => ['APPROVED', 'CONVERTED_TO_SO'].includes(state.code))
        .map((state) => state.id),
    );
    const wonLeads = leads.filter((lead) => lead.convertedAt).length;
    const acceptedQuotations = quotations.filter(
      (quotation) =>
        quotation.workflowStateId &&
        acceptedStateIds.has(quotation.workflowStateId),
    ).length;
    const salespersonPerformance = users.map((user) => ({
      userId: user.id,
      name: user.name,
      leads: leads.filter((lead) => lead.assignedToId === user.id).length,
      won: leads.filter(
        (lead) => lead.assignedToId === user.id && lead.convertedAt,
      ).length,
      revenue: orders
        .filter((order) => order.createdById === user.id)
        .reduce((sum, order) => sum + Number(order.totalAmount), 0),
    }));

    return {
      pipeline: leadStates.map((row) => ({
        state: row.workflowStateId
          ? stateById.get(row.workflowStateId)?.code
          : 'UNASSIGNED',
        label: row.workflowStateId
          ? stateById.get(row.workflowStateId)?.name
          : 'Unassigned',
        count: row._count._all,
      })),
      quotationPipeline: quotationStates.map((row) => ({
        state: row.workflowStateId
          ? stateById.get(row.workflowStateId)?.code
          : 'UNASSIGNED',
        count: row._count._all,
      })),
      metrics: {
        totalLeads: leads.length,
        leadConversionRate: leads.length ? (wonLeads / leads.length) * 100 : 0,
        quotationAcceptanceRate: quotations.length
          ? (acceptedQuotations / quotations.length) * 100
          : 0,
        salesRevenue: orders.reduce(
          (sum, order) => sum + Number(order.totalAmount),
          0,
        ),
        outstandingAmount: ledger.reduce(
          (sum, entry) => sum + Number(entry.debit) - Number(entry.credit),
          0,
        ),
        forecastRevenue: quotations
          .filter(
            (quotation) =>
              !quotation.workflowStateId ||
              !acceptedStateIds.has(quotation.workflowStateId),
          )
          .reduce((sum, quotation) => sum + Number(quotation.total), 0),
      },
      salespersonPerformance,
    };
  }
}
