import { procurementRequest } from './procurementClient';

export const grnService = {
  list: (query?: Record<string, any>) => procurementRequest('grns', 'GET', undefined, { query }),
  deliveryHistory: (query?: Record<string, any>) => procurementRequest('store/deliveries', 'GET', undefined, { query }),
  create: (data: unknown) => procurementRequest('grns', 'POST', data),
  action: (id: string, action: string, data: any = {}, version?: number) =>
    procurementRequest(`grns/${id}/${action}`, 'POST', data, { version }),
  history: (id: string) => procurementRequest(`grns/${id}/history`, 'GET')
};
