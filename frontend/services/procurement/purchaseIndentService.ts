import { procurementRequest } from './procurementClient';

export const purchaseIndentService = {
  list: (query?: Record<string, any>) => procurementRequest('indents', 'GET', undefined, { query }),
  create: (data: unknown) => procurementRequest('indents', 'POST', data),
  action: (id: string, action: string, data: any = {}, version?: number) =>
    procurementRequest(`indents/${id}/${action}`, 'POST', data, { version }),
  history: (id: string) => procurementRequest(`indents/${id}/history`, 'GET')
};
