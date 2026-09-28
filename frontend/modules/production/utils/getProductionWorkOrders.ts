import { isTradingProduct, isPureTradingOrder } from '../../../shared/utils/dispatchCategory';

export function getProductionWorkOrders(state: any) {
  const workOrders = Array.isArray(state?.production?.workOrders)
    ? state.production.workOrders
    : [];

  return workOrders.filter((order: any) => {
    if (isPureTradingOrder(order?.salesOrder || order?.productionPlan?.salesOrder)) {
      return false;
    }
    if (isTradingProduct(order) || isTradingProduct(order?.product) || isTradingProduct(order?.salesOrderItem?.product, order?.salesOrderItem)) {
      return false;
    }

    const status = String(order.status || '')
      .trim()
      .toLowerCase();

    return ![
      'qc approved',
      'dispatched',
      'delivered',
      'closed',
      'cancelled',
    ].includes(status);
  });
}
