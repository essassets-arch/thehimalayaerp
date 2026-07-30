import { procurementRequest } from './procurementClient';

export const purchaseOrderService = {
  list: (query?: Record<string, any>) => procurementRequest('purchase-orders', 'GET', undefined, { query }),
  createFromIndent: (indentId: string, data: unknown) => procurementRequest(`purchase-orders/from-indent/${indentId}`, 'POST', data),
  action: (id: string, action: string, data: any = {}, version?: number) =>
    procurementRequest(`purchase-orders/${id}/${action}`, 'POST', data, { version }),
  closureStatus: (id: string) => procurementRequest(`purchase-orders/${id}/closure-status`, 'GET'),
  evaluateClosure: (id: string) => procurementRequest(`purchase-orders/${id}/evaluate-closure`, 'POST'),
  close: (id: string, reason: string) => procurementRequest(`purchase-orders/${id}/close`, 'POST', { reason }),
  history: (id: string) => procurementRequest(`purchase-orders/${id}/history`, 'GET')
};
