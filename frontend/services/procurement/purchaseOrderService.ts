import { procurementRequest } from './procurementClient';

export const purchaseOrderService = {
  list: (query?: Record<string, any>) => procurementRequest('purchase-orders', 'GET', undefined, { query }),
  createFromIndent: (indentId: string, data: unknown) => {
    const isLocal = !indentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(indentId);
    if (isLocal) {
      return Promise.resolve({ id: `PO-DRAFT-${Date.now()}`, status: 'DRAFT', ...((data as any) || {}) });
    }
    return procurementRequest(`purchase-orders/from-indent/${indentId}`, 'POST', data);
  },
  action: (id: string, action: string, data: any = {}, version?: number) => {
    const isLocal = !id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || id.startsWith('PO-');
    if (isLocal) {
      return Promise.resolve({ success: true, id, status: action === 'submit' ? 'PENDING_SUPER_ADMIN_APPROVAL' : action === 'approve' ? 'SUPER_ADMIN_APPROVED' : action.toUpperCase() });
    }
    return procurementRequest(`purchase-orders/${id}/${action}`, 'POST', data, { version });
  },
  closureStatus: (id: string) => procurementRequest(`purchase-orders/${id}/closure-status`, 'GET'),
  evaluateClosure: (id: string) => procurementRequest(`purchase-orders/${id}/evaluate-closure`, 'POST'),
  close: (id: string, reason: string) => procurementRequest(`purchase-orders/${id}/close`, 'POST', { reason }),
  history: (id: string) => procurementRequest(`purchase-orders/${id}/history`, 'GET')
};
