import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const D = (v: unknown) => new Prisma.Decimal((v as Prisma.Decimal.Value) || 0);
type Blocker = {
  code: string;
  message: string;
  entityType?: string;
  entityId?: string;
};

@Injectable()
export class ProcurementClosureService {
  constructor(private readonly prisma: PrismaService) {}
  async evaluate(purchaseOrderId: string) {
    try {
      const po = await this.prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: {
          items: true,
          purchaseIndent: true,
          grns: { include: { items: true } },
          invoices: { include: { payments: true } },
        },
      });
      if (!po) throw new NotFoundException('Purchase order was not found');
      const blockers: Blocker[] = [];
      const ordered = po.items.reduce((n, i) => n.add(D(i.quantity)), D(0));
      const received = po.grns.reduce(
        (n, g) =>
          n.add(g.items.reduce((s, i) => s.add(D(i.receivedQuantity)), D(0))),
        D(0),
      );
      const accepted = po.grns
        .filter((g) => g.status === 'FINANCE_AUDIT_APPROVED')
        .reduce(
          (n, g) =>
            n.add(g.items.reduce((s, i) => s.add(D(i.acceptedQuantity)), D(0))),
          D(0),
        );
      const rejected = po.grns.reduce(
        (n, g) =>
          n.add(g.items.reduce((s, i) => s.add(D(i.rejectedQuantity)), D(0))),
        D(0),
      );
      if (po.status === 'PO_CLOSED')
        return {
          eligible: true,
          purchaseOrderId: po.id,
          currentPoStatus: po.status,
          resultingPoStatus: 'PO_CLOSED',
          resultingIndentStatus: po.purchaseIndent?.status,
          blockers,
          totals: {
            orderedQuantity: ordered.toString(),
            receivedQuantity: received.toString(),
            acceptedQuantity: accepted.toString(),
            rejectedQuantity: rejected.toString(),
            unresolvedRejectedQuantity: '0',
            eligibleInvoiceAmount: po.totalAmount.toString(),
            verifiedInvoiceAmount: po.totalAmount.toString(),
            paidAmount: po.totalAmount.toString(),
            outstandingAmount: '0',
          },
        };
      if (['PO_CANCELLED', 'SUPER_ADMIN_REJECTED'].includes(po.status))
        blockers.push({
          code: 'INDENT_NOT_ELIGIBLE',
          message: 'Cancelled or rejected purchase orders cannot close.',
          entityType: 'PurchaseOrder',
          entityId: po.id,
        });
      if (
        !po.purchaseIndent ||
        ['INDENT_CANCELLED', 'PLANT_HEAD_REJECTED'].includes(
          po.purchaseIndent.status,
        )
      )
        blockers.push({
          code: 'INDENT_NOT_ELIGIBLE',
          message: 'The linked indent is not eligible for completion.',
          entityType: 'PurchaseIndent',
          entityId: po.purchaseIndentId || undefined,
        });
      if (accepted.lt(ordered))
        blockers.push({
          code: 'PO_QUANTITY_OUTSTANDING',
          message: `${ordered.sub(accepted).toString()} units are still awaiting accepted delivery.`,
        });
      for (const grn of po.grns) {
        if (grn.status === 'PENDING_FINANCE_AUDIT')
          blockers.push({
            code: 'GRN_PENDING_AUDIT',
            message: `GRN ${grn.publicId} is awaiting Finance audit.`,
            entityType: 'GoodsReceiptNote',
            entityId: grn.id,
          });
        if (grn.status === 'RETURNED_TO_STORE')
          blockers.push({
            code: 'GRN_RETURNED_TO_STORE',
            message: `GRN ${grn.publicId} was returned to Store.`,
            entityType: 'GoodsReceiptNote',
            entityId: grn.id,
          });
        if (grn.status === 'FINANCE_AUDIT_APPROVED' && !grn.inventoryPostedAt)
          blockers.push({
            code: 'GRN_ACCEPTED_STOCK_NOT_POSTED',
            message: `GRN ${grn.publicId} has accepted stock awaiting posting.`,
            entityType: 'GoodsReceiptNote',
            entityId: grn.id,
          });
      }
      if (rejected.gt(0))
        blockers.push({
          code: 'REJECTED_QUANTITY_UNRESOLVED',
          message: `${rejected.toString()} rejected units require resolution.`,
        });
      const active = po.invoices.filter((i) => i.status !== 'CANCELLED');
      const verified = active.filter((i) =>
        [
          'VERIFIED',
          'PAYMENT_APPROVAL_PENDING',
          'PARTIALLY_PAID',
          'PAID',
        ].includes(i.status),
      );
      const verifiedAmount = verified.reduce(
        (n, i) => n.add(D(i.totalAmount || 0)),
        D(0),
      );
      const paid = active.reduce((n, i) => n.add(D(i.paidAmount || 0)), D(0));
      const outstanding = active.reduce(
        (n, i) => n.add(D(i.totalAmount || 0).sub(D(i.paidAmount || 0))),
        D(0),
      );
      if (outstanding.gt(0)) {
        blockers.push({
          code: 'INVOICE_AMOUNT_OUTSTANDING',
          message: `${outstanding.toString()} in invoice amounts remain unpaid.`,
        });
      }
      return {
        eligible: blockers.length === 0,
        purchaseOrderId: po.id,
        purchaseIndentId: po.purchaseIndentId,
        currentPoStatus: po.status,
        resultingPoStatus: blockers.length
          ? 'PROCUREMENT_IN_PROGRESS'
          : 'PO_CLOSED',
        resultingIndentStatus: blockers.length
          ? po.purchaseIndent?.status
          : 'CLOSED',
        blockers,
        totals: {
          orderedQuantity: ordered.toString(),
          receivedQuantity: received.toString(),
          acceptedQuantity: accepted.toString(),
          rejectedQuantity: rejected.toString(),
          unresolvedRejectedQuantity: rejected.toString(),
          eligibleInvoiceAmount: po.totalAmount.toString(),
          verifiedInvoiceAmount: verifiedAmount.toString(),
          paidAmount: paid.toString(),
          outstandingAmount: outstanding.toString(),
        },
      };
    } catch (err) {
      console.error('PROCURMENT EVALUATE ERROR:', err);
      throw err;
    }
  }
  async close(purchaseOrderId: string, actorUserId?: string, reason?: string) {
    const status = await this.evaluate(purchaseOrderId);
    if (!status.eligible)
      throw new ConflictException({
        code: 'PO_CLOSURE_BLOCKED',
        message: 'Purchase Order cannot be closed.',
        blockers: status.blockers,
      });
    if (status.currentPoStatus === 'PO_CLOSED') return status;
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: 'PO_CLOSED', version: { increment: 1 } },
      });
      const indentIdToUpdate = po.purchaseIndentId || status.purchaseIndentId;
      if (indentIdToUpdate)
        await tx.purchaseIndent.update({
          where: { id: indentIdToUpdate },
          data: { status: 'CLOSED', version: { increment: 1 } },
        });
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'PURCHASE_ORDER_CLOSED',
          entityType: 'PurchaseOrder',
          entityId: po.id,
          after: { reason, totals: status.totals },
        },
      });
      return {
        ...status,
        currentPoStatus: po.status,
        resultingPoStatus: po.status,
      };
    });
  }
}
