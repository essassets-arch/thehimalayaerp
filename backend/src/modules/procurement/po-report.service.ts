import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class POReportService {
  private readonly logger = new Logger(POReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPOReport(companyId: string) {
    const pos = await this.prisma.purchaseOrder.findMany({
      where: { companyId },
      include: {
        supplier: true,
        items: true,
        grns: {
          include: { items: true }
        },
        materialRejections: {
          include: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return pos.map(po => {
      let totalOrderedQty = 0;
      let totalReceivedQty = 0;
      let totalRejectedQty = 0;
      let totalReplacementQty = 0;

      // Ordered
      po.items.forEach(item => {
        totalOrderedQty += Number(item.quantity) || 0;
      });

      // Received and Replacement (from GRNs)
      po.grns.forEach(grn => {
        if (grn.status === 'FINANCE_AUDIT_APPROVED' || grn.status === 'APPROVED' || grn.status === 'INVENTORY_UPDATED' || grn.status === 'CLOSED') {
          // Check if it's a replacement using snapshot metadata
          const isReplacement = grn.snapshot && (grn.snapshot as any).isReplacement;
          
          grn.items.forEach(item => {
            if (isReplacement) {
              totalReplacementQty += Number(item.acceptedQuantity) || 0;
            } else {
              totalReceivedQty += Number(item.acceptedQuantity) || 0;
            }
          });
        }
      });

      // Rejected
      po.materialRejections.forEach(rej => {
        rej.items.forEach(item => {
          totalRejectedQty += Number(item.quantity) || 0;
        });
      });

      // User's formula: Pending Qty = Ordered - Received + Rejected - Replacement
      const totalPendingQty = Math.max(0, totalOrderedQty - totalReceivedQty + totalRejectedQty - totalReplacementQty);

      // Status Rules from user:
      // No GRNs => OPEN
      // Partial receipts => PARTIALLY_RECEIVED
      // Pending replacement => REPLACEMENT_PENDING
      // Replacement under audit => REPLACEMENT_UNDER_REVIEW
      // Pending Qty = 0 => COMPLETED
      // Completed and closed => CLOSED

      let derivedStatus = 'OPEN';
      
      const hasGRNs = po.grns.length > 0;
      const hasReplacementsUnderReview = po.grns.some(g => (g.snapshot as any)?.isReplacement && (g.status === 'PENDING_FINANCE_AUDIT' || g.status === 'SUBMITTED_FOR_FINANCE_AUDIT'));
      const hasPendingRejections = po.materialRejections.some(r => r.status === 'REPLACEMENT_EXPECTED' || r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW');

      if (po.status === 'CLOSED' || po.status === 'PO_CLOSED') {
        derivedStatus = 'CLOSED';
      } else if (totalPendingQty === 0) {
        derivedStatus = 'COMPLETED';
      } else if (hasReplacementsUnderReview) {
        derivedStatus = 'REPLACEMENT_UNDER_REVIEW';
      } else if (hasPendingRejections) {
        derivedStatus = 'REPLACEMENT_PENDING';
      } else if (totalReceivedQty > 0) {
        derivedStatus = 'PARTIALLY_RECEIVED';
      }

      return {
        id: po.id,
        poNumber: po.poNumber,
        orderedAt: po.createdAt,
        expectedDeliveryDate: po.expectedDeliveryDate,
        supplierName: po.supplier?.name || 'Unknown',
        totalAmount: po.totalAmount,
        orderedQty: totalOrderedQty,
        receivedQty: totalReceivedQty,
        rejectedQty: totalRejectedQty,
        replacementQty: totalReplacementQty,
        pendingQty: totalPendingQty,
        status: derivedStatus,
        rawStatus: po.status
      };
    });
  }
}
