export function getProductionWorkOrders(state: any) {
  const workOrders = Array.isArray(state?.production?.workOrders)
    ? state.production.workOrders
    : [];

  return workOrders.filter((order: any) => {
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
