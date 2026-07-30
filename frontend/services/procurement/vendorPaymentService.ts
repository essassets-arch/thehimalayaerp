import { procurementRequest } from './procurementClient';

export const vendorPaymentService = {
  list: (query?: Record<string, any>) => procurementRequest('vendor-payments', 'GET', undefined, { query }),
  create: (data: unknown) => procurementRequest('vendor-payments', 'POST', data),
  action: (id: string, action: string, data: any = {}, version?: number) =>
    procurementRequest(`vendor-payments/${id}/${action}`, 'POST', data, { version }),
  history: (id: string) => procurementRequest(`vendor-payments/${id}/history`, 'GET')
};
