import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { getAdvancedScope } from '../../common/utils/rbac.util';
import {
  parsePaginationParams,
  formatPaginatedResult,
} from '../../common/utils/pagination.util';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
  ) {}

  async listInvoices(
    userId?: string,
    role?: string,
    paginationQuery?: { page?: string | number; limit?: string | number; pageSize?: string | number },
  ) {
    const scope = getAdvancedScope(userId, role, {
      FINANCE: { createdById: userId },
      SALES: { salesOrder: { createdById: userId } },
    });
    const pagination = parsePaginationParams(paginationQuery, 50, 100);
    const [items, total] = await Promise.all([
      this.prisma.salesInvoice.findMany({
        where: scope,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          salesOrder: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              customerId: true,
              customer: {
                select: { id: true, companyName: true, gstin: true, phone: true },
              },
            },
          },
          workflowState: { select: { id: true, code: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      pagination.hasExplicitPagination
        ? this.prisma.salesInvoice.count({ where: scope })
        : Promise.resolve(0),
    ]);
    return formatPaginatedResult(items, total || items.length, pagination);
  }

  async getInvoice(id: string, userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      FINANCE: { createdById: userId },
      SALES: { salesOrder: { createdById: userId } },
    });
    const invoice = await this.prisma.salesInvoice.findUnique({
      where: { id, ...scope },
      include: {
        salesOrder: { include: { customer: true } },
        dispatch: true,
        items: { include: { salesOrderItem: true } },
        paymentAllocations: { include: { payment: true } },
        workflowState: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async processAction(
    id: string,
    actionName: string,
    remarks?: string,
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.salesInvoice.findUnique({
        where: { id },
        include: { salesOrder: true, items: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');

      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'INVOICE',
          workflowCode: 'INVOICE',
          currentStateId: invoice.workflowStateId!,
          actionName,
          userId: userId || 'SYSTEM',
          remarks,
        },
        tx,
      );

      const statusByAction: Record<string, any> = {
        POST: 'POSTED',
        PARTIAL: 'PARTIALLY_PAID',
        PAY: 'PAID',
        VOID: 'VOID',
        CANCEL: 'CANCELLED',
      };
      const updated = await tx.salesInvoice.update({
        where: { id },
        data: {
          workflowStateId: result.nextStateId,
          ...(statusByAction[actionName]
            ? { status: statusByAction[actionName] }
            : {}),
        },
      });

      if (actionName === 'POST') {
        const totalAmount = Number(invoice.totalAmount);

        // Validation: Ensure invoice has items
        if (invoice.items.length === 0) {
          throw new BadRequestException('Cannot post an empty invoice');
        }

        const existingPosting = await tx.customerLedger.findFirst({
          where: {
            referenceId: invoice.id,
            referenceType: 'SalesInvoice',
            type: 'INVOICE',
          },
        });
        if (!existingPosting)
          await tx.customerLedger.create({
            data: {
              customerId: invoice.salesOrder.customerId,
              type: 'INVOICE',
              referenceType: 'SalesInvoice',
              referenceId: invoice.id,
              amount: totalAmount,
              debit: totalAmount,
              description: `Invoice generated for Order ${invoice.salesOrder.orderNumber}`,
              createdById: userId || 'SYSTEM',
            },
          });
      }

      if (actionName === 'VOID' || actionName === 'CANCEL') {
        // Create reversal entry if it was posted
        const existingLedger = await tx.customerLedger.findFirst({
          where: { referenceId: invoice.id, type: 'INVOICE' },
        });

        if (existingLedger) {
          const existingReversal = await tx.customerLedger.findFirst({
            where: { reversalOfId: existingLedger.id },
          });
          if (!existingReversal)
            await tx.customerLedger.create({
              data: {
                customerId: invoice.salesOrder.customerId,
                type: 'REVERSAL',
                referenceType: 'SalesInvoice',
                referenceId: invoice.id,
                reversalOfId: existingLedger.id,
                amount: existingLedger.amount,
                credit: existingLedger.amount, // Credit to reverse the debit
                description: `Reversal of Invoice ${invoice.id.slice(0, 8)}`,
                createdById: userId || 'SYSTEM',
              },
            });
        }
      }

      return updated;
    });
  }
}
