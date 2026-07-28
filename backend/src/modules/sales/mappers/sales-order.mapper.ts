import { SalesOrderResponseDto } from '../dto/sales-order-response.dto';
import { Prisma } from '@prisma/client';

type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: {
    items: true;
    customer: true;
    workflowState: true;
    productionPlans: true;
  };
}>;

export function mapSalesOrder(
  order: SalesOrderWithRelations,
): SalesOrderResponseDto {
  const productionPlan = order.productionPlans[0];
  const workflowStatus = order.workflowState?.code as typeof order.status | undefined;
  const effectiveStatus =
    order.status === 'SENT_TO_PLANT_HEAD'
      ? order.status
      : workflowStatus ?? order.status;
  return {
    id: order.id,
    orderId: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customer.companyName,
    customerCode: order.customer.customerCode,

    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      productCode: item.productCodeSnapshot,
      orderedQuantity: Number(item.orderedQuantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      // deliveredQuantity, returnedQuantity, replacedQuantity are now computed
      // from DispatchItem, SalesReturnItem, ReplacementOrderItem respectively.
      // They are not stored on SalesOrderItem; services can pass them as computed props.
    })),

    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),

    // Unified lifecycle status
    status: effectiveStatus,
    productionPlanId: productionPlan?.id ?? null,
    productionStatus: productionPlan?.status ?? null,
    productionAssignedToId: productionPlan?.assignedToId ?? null,

    workflowStateId: order.workflowStateId,
    workflowStateCode: order.workflowState?.code,
    workflowStateName: order.workflowState?.name,

    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    version: order.version,
  };
}
