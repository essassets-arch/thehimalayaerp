import { Injectable } from '@nestjs/common';
import { DateRangePreset } from './dto/finance-sales-analytics-query.dto';

export type AttributionSource =
  | 'LEAD_OWNER'
  | 'QUOTATION_CREATOR'
  | 'ORDER_CREATOR'
  | 'CUSTOMER_OWNER'
  | 'UNASSIGNED';

export interface SalespersonAttribution {
  salespersonId: string | null;
  attributionSource: AttributionSource;
}

@Injectable()
export class FinanceSalesAnalyticsMetricService {
  // Canonical Prisma Status Enums
  public readonly ELIGIBLE_PAYMENT_STATUSES = [
    'VERIFIED',
    'RECEIVED',
    'PARTIALLY_ALLOCATED',
    'ALLOCATED',
  ];

  public readonly EXCLUDED_PAYMENT_STATUSES = [
    'SUBMITTED',
    'UNDER_VERIFICATION',
    'REJECTED',
    'BOUNCED',
  ];

  public readonly ELIGIBLE_ORDER_STATUSES = [
    'CONFIRMED',
    'SENT_TO_PLANT',
    'SENT_TO_PLANT_HEAD',
    'PLANT_APPROVED',
    'READY_FOR_PRODUCTION',
    'IN_PRODUCTION',
    'READY_FOR_DISPATCH',
    'COMPLETED',
  ];

  public readonly EXCLUDED_ORDER_STATUSES = [
    'DRAFT',
    'CANCELLED',
    'PENDING_APPROVAL',
  ];

  public readonly ELIGIBLE_INVOICE_STATUSES = ['POSTED', 'PARTIALLY_PAID', 'PAID'];

  public readonly EXCLUDED_INVOICE_STATUSES = ['DRAFT', 'VOID', 'CANCELLED'];

  /**
   * Derive originating salesperson following the strict chain:
   * Lead.assignedToId -> Quotation.createdById -> SalesOrder.createdById -> Customer.createdById -> Unassigned
   */
  getSalespersonAttribution(entity: {
    salesOrderCreatedById?: string | null;
    quotationCreatedById?: string | null;
    leadAssignedToId?: string | null;
    customerCreatedById?: string | null;
  }): SalespersonAttribution {
    if (entity.leadAssignedToId) {
      return {
        salespersonId: entity.leadAssignedToId,
        attributionSource: 'LEAD_OWNER',
      };
    }
    if (entity.quotationCreatedById) {
      return {
        salespersonId: entity.quotationCreatedById,
        attributionSource: 'QUOTATION_CREATOR',
      };
    }
    if (entity.salesOrderCreatedById) {
      return {
        salespersonId: entity.salesOrderCreatedById,
        attributionSource: 'ORDER_CREATOR',
      };
    }
    if (entity.customerCreatedById) {
      return {
        salespersonId: entity.customerCreatedById,
        attributionSource: 'CUSTOMER_OWNER',
      };
    }
    return {
      salespersonId: null,
      attributionSource: 'UNASSIGNED',
    };
  }

  /**
   * Date range boundaries according to business presets
   */
  getDateRangeBoundary(
    preset?: DateRangePreset,
    customFrom?: string,
    customTo?: string,
  ): { startDate: Date | null; endDate: Date | null } {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (preset === DateRangePreset.CUSTOM && (customFrom || customTo)) {
      if (customFrom) startDate = new Date(customFrom);
      if (customTo) endDate = new Date(customTo);
      return { startDate, endDate };
    }

    switch (preset) {
      case DateRangePreset.TODAY: {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      }
      case DateRangePreset.YESTERDAY: {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        startDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
        endDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59);
        break;
      }
      case DateRangePreset.LAST_7_DAYS: {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        break;
      }
      case DateRangePreset.LAST_30_DAYS: {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        break;
      }
      case DateRangePreset.THIS_MONTH: {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now);
        break;
      }
      case DateRangePreset.PREVIOUS_MONTH: {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      }
      case DateRangePreset.THIS_QUARTER: {
        const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), currentQuarterMonth, 1, 0, 0, 0);
        endDate = new Date(now);
        break;
      }
      case DateRangePreset.THIS_FY: {
        // Indian FY starts April 1st
        const fyYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        startDate = new Date(fyYear, 3, 1, 0, 0, 0);
        endDate = new Date(now);
        break;
      }
      default:
        if (customFrom) startDate = new Date(customFrom);
        if (customTo) endDate = new Date(customTo);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Decimal-safe collection efficiency calculation
   */
  calculateCollectionEfficiency(collected: number, eligibleReceivable: number): number {
    if (!eligibleReceivable || eligibleReceivable <= 0) return 0;
    const eff = (collected / eligibleReceivable) * 100;
    return Math.min(Math.round(eff * 100) / 100, 100);
  }

  /**
   * Safe conversion rate calculation with threshold minimum check
   */
  calculateConversionRate(
    numerator: number,
    denominator: number,
    minThreshold: number = 1,
  ): number | null {
    if (!denominator || denominator < minThreshold) return null;
    const rate = (numerator / denominator) * 100;
    return Math.min(Math.round(rate * 100) / 100, 100);
  }
}
