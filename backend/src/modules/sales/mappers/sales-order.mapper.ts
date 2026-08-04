import { SalesOrderResponseDto } from '../dto/sales-order-response.dto';
import { Prisma } from '@prisma/client';

type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: {
    items: true;
    customer: true;
    workflowState: true;
    productionPlans: true;
  };
}> & {
  dispatches?: Prisma.DispatchGetPayload<{ include: { items: true } }>[];
  returns?: Prisma.SalesReturnGetPayload<{ include: { items: true } }>[];
  replacementRequests?: Prisma.ReplacementRequestGetPayload<{
    include: { items: true };
  }>[];
  customerPayments?: Prisma.CustomerPaymentGetPayload<Record<string, never>>[];
};

export function mapSalesOrder(
  order: SalesOrderWithRelations,
): SalesOrderResponseDto {
  const productionPlan = order.productionPlans[0];
  const workflowStatus = order.workflowState?.code as
    typeof order.status | undefined;
  const effectiveStatus =
    order.status === 'SENT_TO_PLANT_HEAD'
      ? order.status
      : (workflowStatus ?? order.status);
  const completedDispatchStatuses = new Set([
    'DELIVERED',
    'POD_RECEIVED',
    'DISPATCH_CLOSED',
  ]);
  const dispatches = order.dispatches ?? [];
  const dispatchStatus =
    dispatches.length > 0 &&
    dispatches.every((dispatch) =>
      completedDispatchStatuses.has(dispatch.status),
    )
      ? 'DELIVERED'
      : dispatches[0]?.status;
  const deliveredAt = dispatches
    .filter((dispatch) => completedDispatchStatuses.has(dispatch.status))
    .map((dispatch) => dispatch.deliveredAt)
    .filter((date): date is Date => date !== null)
    .sort((left, right) => right.getTime() - left.getTime())[0];
  const podUrl = dispatches.find(
    (dispatch) =>
      completedDispatchStatuses.has(dispatch.status) && dispatch.podUrl,
  )?.podUrl;
  const latestReturn = order.returns?.[0];
  const latestReplacement = order.replacementRequests?.[0];
  const financeApprovedStatuses = new Set([
    'VERIFIED',
    'PARTIALLY_ALLOCATED',
    'ALLOCATED',
  ]);
  const verifiedPaidAmount = (order.customerPayments ?? [])
    .filter((payment) => financeApprovedStatuses.has(payment.status))
    .reduce((total, payment) => total + Number(payment.amount), 0);
  const balanceAmount = Math.max(
    0,
    Number(order.totalAmount) - verifiedPaidAmount,
  );
  const paymentStatus =
    verifiedPaidAmount >= Number(order.totalAmount)
      ? 'FULLY_PAID'
      : verifiedPaidAmount > 0
        ? 'PARTIALLY_PAID'
        : (order.customerPayments ?? []).some((payment) =>
              ['SUBMITTED', 'UNDER_VERIFICATION', 'RECEIVED'].includes(
                payment.status,
              ),
            )
          ? 'FINANCE_VERIFICATION_PENDING'
          : 'NOT_DUE';
  const returnStatus = latestReturn
    ? latestReturn.status === 'CLOSED'
      ? 'COMPLETED'
      : latestReturn.status
    : undefined;
  const replacementStatus = latestReplacement
    ? latestReplacement.dispatchStatus === 'DELIVERED'
      ? 'COMPLETED'
      : (latestReplacement.dispatchStatus ?? latestReplacement.status)
    : undefined;
  return {
    id: order.id,
    orderId: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customer.companyName,
    customerCode: order.customer.customerCode,

    items: order.items.map((item) => {
      const deliveredQuantity = dispatches
        .filter((dispatch) => completedDispatchStatuses.has(dispatch.status))
        .flatMap((dispatch) => dispatch.items)
        .filter((dispatchItem) => dispatchItem.salesOrderItemId === item.id)
        .reduce(
          (total, dispatchItem) => total + Number(dispatchItem.quantity),
          0,
        );

      const returnedQuantity = (order.returns ?? [])
        .filter((r) => r.status !== 'REJECTED' && r.status !== 'CANCELLED')
        .flatMap((r) => r.items)
        .filter((rItem) => rItem.salesOrderItemId === item.id)
        .reduce(
          (total, rItem) => total + Number(rItem.requestedQuantity || 0),
          0,
        );

      const replacedQuantity = (order.replacementRequests ?? [])
        .filter((r) => r.status !== 'REJECTED')
        .flatMap((r) => r.items)
        .filter((rItem) => rItem.salesOrderItemId === item.id)
        .reduce(
          (total, rItem) => total + Number(rItem.requestedQuantity || 0),
          0,
        );

      const availableForReturn = Math.max(
        0,
        deliveredQuantity - returnedQuantity - replacedQuantity,
      );
      const availableForReplacement = Math.max(
        0,
        deliveredQuantity - returnedQuantity - replacedQuantity,
      );

      return {
        id: item.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        productCode: item.productCodeSnapshot,
        orderedQuantity: Number(item.orderedQuantity),
        deliveredQuantity,
        returnedQuantity,
        replacedQuantity,
        availableForReturn,
        availableForReplacement,
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      };
    }),

    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    freightAmount: Number(order.freightAmount || 0),
    totalAmount: Number(order.totalAmount),
    verifiedPaidAmount,
    balanceAmount,
    paymentStatus,

    // Unified lifecycle status
    status: effectiveStatus,
    dispatchStatus,
    deliveredAt: deliveredAt?.toISOString(),
    podUrl: podUrl ?? undefined,
    returnStatus,
    replacementStatus,
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
