import { SalesOrderResponseDto } from '../dto/sales-order-response.dto';
import { Prisma } from '@prisma/client';

type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: {
    items: true;
    customer: true;
    workflowState: true;
    productionPlans: {
      include: {
        workOrders: true;
      };
    };
  };
}> & {
  salesExecutive?: { id: string; name?: string; email?: string } | any;
  dispatches?: Prisma.DispatchGetPayload<{ include: { items: true } }>[];
  returns?: Prisma.SalesReturnGetPayload<{ include: { items: true } }>[];
  replacementRequests?: Prisma.ReplacementRequestGetPayload<{
    include: { items: true };
  }>[];
  customerPayments?: Prisma.CustomerPaymentGetPayload<Record<string, never>>[];
};

export function mapSalesOrder(
  order: SalesOrderWithRelations,
  fulfillmentData?: {
    fgMap: Map<string, number>;
    dispatchMap: Map<string, number>;
    allocationMap: Map<string, { reserved: number; production: number }>;
  },
): SalesOrderResponseDto {
  const productionPlan = order.productionPlans[0];
  
  const workOrders = productionPlan?.workOrders ?? [];
  let calculatedProductionStatus: string | null = productionPlan?.status ?? null;
  let calculatedQcStatus = 'NOT_READY';

  if (workOrders.length > 0) {
    const statuses = workOrders.map((wo) => String(wo.status).toUpperCase());
    if (statuses.some(s => ['DISPATCHED', 'READY_FOR_DISPATCH', 'QC_APPROVED'].includes(s))) {
      calculatedProductionStatus = 'QC_APPROVED';
      calculatedQcStatus = 'QC_APPROVED';
    } else if (statuses.some(s => ['QC_PENDING', 'COMPLETED'].includes(s))) {
      calculatedProductionStatus = 'QC';
      calculatedQcStatus = 'QC_PENDING';
    } else if (statuses.some(s => ['STARTED', 'PARTIALLY_COMPLETED'].includes(s))) {
      calculatedProductionStatus = 'IN_PRODUCTION';
      calculatedQcStatus = 'PENDING';
    } else if (statuses.some(s => ['CREATED', 'MATERIAL_PENDING', 'READY'].includes(s))) {
      calculatedProductionStatus = 'PLANNED';
      calculatedQcStatus = 'PENDING';
    }
  }

  const workflowStatus = order.workflowState?.code as
    typeof order.status | undefined;
  const effectiveStatus =
    order.status && order.status !== 'DRAFT'
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
    orderNumber: order.orderNumber,
    orderNo: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customer.companyName,
    customerCode: order.customer.customerCode,
    customer: {
      id: order.customer.id,
      name: order.customer.companyName,
      companyName: order.customer.companyName,
      customerCode: order.customer.customerCode,
    },
    salesExecutiveId: (order as any).salesExecutiveId,
    salesExecutive: (order as any).salesExecutive
      ? {
          id: (order as any).salesExecutive.id,
          name: (order as any).salesExecutive.name,
          email: (order as any).salesExecutive.email,
        }
      : null,
    remarks: order.remarks ?? undefined,

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

      const fgMap = fulfillmentData?.fgMap;
      const dispatchMap = fulfillmentData?.dispatchMap;
      const allocationMap = fulfillmentData?.allocationMap;

      const isTrading =
        ((item as any).product?.productType || (item as any).productType || '').toUpperCase() === 'TRADING' ||
        ((item as any).product?.category || '').toUpperCase().includes('TRADING');

      const orderedQty = Number(item.orderedQuantity);
      const alreadyDispatchedQty = dispatchMap ? (dispatchMap.get(item.id) || 0) : 0;
      const activeReservedQty = allocationMap ? (allocationMap.get(item.id)?.reserved || 0) : 0;
      const activeProductionCommittedQty = allocationMap ? (allocationMap.get(item.id)?.production || 0) : 0;

      const remainingUnallocatedQty = Math.max(0, orderedQty - alreadyDispatchedQty - activeReservedQty - activeProductionCommittedQty);
      const availableFG = fgMap ? (fgMap.get(item.productId) || 0) : 0;
      
      // Trading products never require factory floor manufacturing
      const fgAllocatableQty = isTrading ? remainingUnallocatedQty : Math.min(availableFG, remainingUnallocatedQty);
      const productionRequiredQty = isTrading ? 0 : Math.max(0, remainingUnallocatedQty - fgAllocatableQty);

      const pendingDirectDispatchQty = isTrading ? remainingUnallocatedQty : fgAllocatableQty;
      const pendingProductionQty = isTrading ? 0 : productionRequiredQty;

      let fulfillmentState = 'PENDING_DECISION';
      if (pendingDirectDispatchQty === 0 && pendingProductionQty === 0) {
        if (alreadyDispatchedQty >= orderedQty) {
          fulfillmentState = 'FULFILLED';
        } else if (activeReservedQty > 0) {
          fulfillmentState = 'READY_FOR_DISPATCH';
        } else if (activeProductionCommittedQty > 0) {
          fulfillmentState = 'FULFILLED';
        } else {
          fulfillmentState = 'FULFILLED';
        }
      }

      const fulfillment = {
        orderedQty,
        availableFG,
        fgAllocatableQty,
        productionRequiredQty,
        activeReservedQty,
        productionCommittedQty: activeProductionCommittedQty,
        alreadyDispatchedQty,
        pendingDirectDispatchQty,
        pendingProductionQty,
        fulfillmentState,
        isTrading,
      };

      return {
        id: item.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        productCode: item.productCodeSnapshot,
        productType: (item as any).product?.productType || (isTrading ? 'TRADING' : 'MANUFACTURING'),
        isTrading,
        orderedQuantity: Number(item.orderedQuantity),
        deliveredQuantity,
        returnedQuantity,
        replacedQuantity,
        availableForReturn,
        availableForReplacement,
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        fulfillment,
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
    sentToPlantHead: Boolean(
      order.status === 'SENT_TO_PLANT_HEAD' ||
      order.status === 'PLANT_APPROVED' ||
      order.status === 'READY_FOR_PRODUCTION' ||
      order.status === 'IN_PRODUCTION' ||
      order.status === 'READY_FOR_DISPATCH' ||
      order.status === 'COMPLETED' ||
      productionPlan?.id
    ),
    sentToPlantHeadAt: (order.status === 'SENT_TO_PLANT_HEAD' || order.status === 'PLANT_APPROVED') ? order.updatedAt?.toISOString() : undefined,
    planningStatus: (order.status === 'SENT_TO_PLANT_HEAD')
      ? 'PENDING_ACCEPTANCE'
      : (order.status === 'PLANT_APPROVED')
        ? 'PLANT_HEAD_ACCEPTED'
        : productionPlan?.id
          ? 'PRODUCTION_PLANNED'
          : 'NOT_SENT',
    dispatchStatus,
    deliveredAt: deliveredAt?.toISOString(),
    podUrl: podUrl ?? undefined,
    returnStatus,
    replacementStatus,
    productionPlanId: productionPlan?.id ?? null,
    productionStatus: calculatedProductionStatus,
    productionAssignedToId: productionPlan?.assignedToId ?? null,
    qcStatus: calculatedQcStatus,
    targetDate: productionPlan?.plannedEndDate?.toISOString().split('T')[0] ?? null,
    priority: (productionPlan as any)?.priority ?? null,

    workflowStateId: order.workflowStateId,
    workflowStateCode: order.workflowState?.code,
    workflowStateName: order.workflowState?.name,

    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    version: order.version,
  };
}
