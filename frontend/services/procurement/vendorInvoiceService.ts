import { procurementRequest } from './procurementClient';

export const vendorInvoiceService = {
  list: (query?: Record<string, any>) => procurementRequest('vendor-invoices', 'GET', undefined, { query }),
  create: (data: unknown) => procurementRequest('vendor-invoices', 'POST', data),
  action: (id: string, action: string, data: any = {}, version?: number) =>
    procurementRequest(`vendor-invoices/${id}/${action}`, 'POST', data, { version }),
  history: (id: string) => procurementRequest(`vendor-invoices/${id}/history`, 'GET')
};
