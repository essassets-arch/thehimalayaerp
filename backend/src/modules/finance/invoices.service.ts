import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService
  ) {}

  async listInvoices() {
    return this.prisma.salesInvoice.findMany({
      include: {
        salesOrder: { include: { customer: true } },
        workflowState: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.salesInvoice.findUnique({
      where: { id },
      include: {
        salesOrder: { include: { customer: true } },
        dispatch: true,
        items: { include: { salesOrderItem: true } },
        paymentAllocations: { include: { payment: true } },
        workflowState: true
      }
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async processAction(id: string, actionName: string, remarks?: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
    const invoice = await tx.salesInvoice.findUnique({ where: { id }, include: { salesOrder: true, items: true } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const result = await this.workflowService.processAction({
      entityId: id,
      entityType: 'INVOICE',
      workflowCode: 'INVOICE',
      currentStateId: invoice.workflowStateId!,
      actionName,
      userId: userId || 'SYSTEM',
      remarks
    }, tx);

    const statusByAction: Record<string, any> = {
      POST: 'POSTED', PARTIAL: 'PARTIALLY_PAID', PAY: 'PAID', VOID: 'VOID', CANCEL: 'CANCELLED',
    };
    const updated = await tx.salesInvoice.update({
      where: { id },
      data: { workflowStateId: result.nextStateId, ...(statusByAction[actionName] ? { status: statusByAction[actionName] } : {}) }
    });

    if (actionName === 'POST') {
      const totalAmount = Number(invoice.totalAmount);
      
      // Validation: Ensure invoice has items
      if (invoice.items.length === 0) {
        throw new BadRequestException('Cannot post an empty invoice');
      }

      const existingPosting = await tx.customerLedger.findFirst({
        where: { referenceId: invoice.id, referenceType: 'SalesInvoice', type: 'INVOICE' },
      });
      if (!existingPosting) await tx.customerLedger.create({
        data: {
          customerId: invoice.salesOrder.customerId,
          type: 'INVOICE',
          referenceType: 'SalesInvoice',
          referenceId: invoice.id,
          amount: totalAmount,
          debit: totalAmount,
          description: `Invoice generated for Order ${invoice.salesOrder.orderNumber}`,
          createdById: userId || 'SYSTEM'
        }
      });
    }

    if (actionName === 'VOID' || actionName === 'CANCEL') {
      // Create reversal entry if it was posted
      const existingLedger = await tx.customerLedger.findFirst({
        where: { referenceId: invoice.id, type: 'INVOICE' }
      });

      if (existingLedger) {
        const existingReversal = await tx.customerLedger.findFirst({ where: { reversalOfId: existingLedger.id } });
        if (!existingReversal) await tx.customerLedger.create({
          data: {
            customerId: invoice.salesOrder.customerId,
            type: 'REVERSAL',
            referenceType: 'SalesInvoice',
            referenceId: invoice.id,
            reversalOfId: existingLedger.id,
            amount: existingLedger.amount,
            credit: existingLedger.amount, // Credit to reverse the debit
            description: `Reversal of Invoice ${invoice.id.slice(0,8)}`,
            createdById: userId || 'SYSTEM'
          }
        });
      }
    }

    return updated;
    });
  }
}
