import { LegacySalesOrderInput } from './types';

export function validateLegacyOrder(order: any): { valid: boolean; normalized?: LegacySalesOrderInput; errors: string[] } {
  const errors: string[] = [];
  
  if (!order) {
    return { valid: false, errors: ['Order is null or undefined'] };
  }

  const legacyId = order.id || order.orderNo || order.orderNumber;
  if (!legacyId) {
    errors.push('Missing legacy ID or Order Number');
  }

  if (!order.customerName && !order.customer && !order.customerId) {
    errors.push('Missing customer resolution fields');
  }

  let normalizedItems = [];
  
  if (Array.isArray(order.items) && order.items.length > 0) {
    normalizedItems = order.items;
  } else if (Array.isArray(order.detailedItems) && order.detailedItems.length > 0) {
    normalizedItems = order.detailedItems;
  } else if (order.products && typeof order.products === 'string') {
    // Some legacy records have `products: "Product Name"` and `quantity: 100`
    normalizedItems = [
      {
        productName: order.products,
        quantity: order.quantity || 1,
        unitPrice: order.unitPrice || 0,
      }
    ];
  } else {
    errors.push('Missing or invalid items array');
  }

  // Check if items have valid shapes
  if (normalizedItems.length > 0) {
    for (const item of normalizedItems) {
      if (!item.productName && !item.name && !item.productId) {
        errors.push('Item missing product name or ID');
        break;
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const normalized: LegacySalesOrderInput = {
    legacyId,
    orderNumber: order.orderNo || order.orderNumber || legacyId,
    customerName: order.customerName || order.customer?.name,
    customerId: order.customerId || order.customer?.id,
    items: normalizedItems,
    totalAmount: order.totalAmount ?? order.totalValue ?? order.grandTotal ?? 0,
    orderDate: order.date || order.createdAt || order.orderDate,
    status: order.status || order.workflowStatus || order.orderStatus,
    dispatchStatus: order.dispatchStatus,
    productionStatus: order.productionStatus,
    paymentStatus: order.paymentStatus,
  };

  return { valid: true, normalized, errors: [] };
}
