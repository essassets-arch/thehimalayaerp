import { SalesOrderResponseDto } from '../dto/sales-order-response.dto';
import { Prisma } from '@prisma/client';

type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: {
    items: true;
    customer: true;
  };
}>;

export function mapSalesOrder(
  order: SalesOrderWithRelations,
): SalesOrderResponseDto {
  return {
    id: order.id,
    orderId: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customer.companyName,
    customerCode: order.customer.publicId,

    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      productCode: item.productCodeSnapshot,
      orderedQuantity: Number(item.orderedQuantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      deliveredQuantity: Number(item.deliveredQuantity),
      returnedQuantity: Number(item.returnedQuantity),
      replacedQuantity: Number(item.replacedQuantity),
    })),

    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),

    orderStatus: order.orderStatus,
    creditStatus: order.creditStatus,
    allocationStatus: order.allocationStatus,
    productionStatus: order.productionStatus,
    qcStatus: order.qcStatus,
    dispatchStatus: order.dispatchStatus,
    invoiceStatus: order.invoiceStatus,
    paymentStatus: order.paymentStatus,
    closureStatus: order.closureStatus,

    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    version: order.version,
  };
}
