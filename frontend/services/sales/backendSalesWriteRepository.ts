import { SalesWriteRepository, WriteRequestOptions } from './salesWriteRepository';
import { apiClient } from '../../lib/apiClient';
import { backendFetch } from '../../lib/backendFetch';

export const backendSalesWriteRepository: SalesWriteRepository = {
  async createOrder(input, options) {
    const res = await apiClient.post('/sales/orders', input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async convertQuotationToOrder(input, options) {
    const res = await apiClient.post('/sales/orders/from-quotation', input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async attachCustomerPo(orderId, input, options) {
    const encodedId = encodeURIComponent(String(orderId || ''));
    const res = await apiClient.post(`/sales/orders/${encodedId}/customer-po`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async runCreditCheck(orderId, input, options) {
    const encodedId = encodeURIComponent(String(orderId || ''));
    const res = await apiClient.post(`/sales/orders/${encodedId}/credit-check`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async approveCreditException(orderId, input, options) {
    const encodedId = encodeURIComponent(String(orderId || ''));
    const res = await apiClient.post(`/sales/orders/${encodedId}/credit-exception/approve`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async confirmOrder(orderId, input, options) {
    const encodedId = encodeURIComponent(String(orderId || ''));
    const res = await apiClient.post(`/sales/orders/${encodedId}/confirm`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async sendToPlantHead(orderId, input, options) {
    try {
      const res = await apiClient.post(`/sales/orders/send-to-plant-head`, {
        ...input,
        orderId,
        id: orderId,
      }, {
        headers: { 'Idempotency-Key': options.idempotencyKey },
      });
      return res.data;
    } catch (err) {
      const encodedId = encodeURIComponent(String(orderId || ''));
      const res = await apiClient.post(`/sales/orders/${encodedId}/send-to-plant-head`, {
        ...input,
        orderId,
        id: orderId,
      }, {
        headers: { 'Idempotency-Key': options.idempotencyKey },
      });
      return res.data;
    }
  },

  async cancelOrder(orderId, input, options) {
    const encodedId = encodeURIComponent(String(orderId || ''));
    const res = await apiClient.post(`/sales/orders/${encodedId}/cancel`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async raiseCustomerComplaint(input, options) {
    const res = await apiClient.post(`/customer-complaints`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async requestReturn(input, options) {
    return backendFetch('/api/backend/sales-returns', {
      method: 'POST',
      body: input,
      idempotencyKey: options.idempotencyKey,
    });
  },

  async requestReplacement(input, options) {
    return backendFetch('/api/backend/replacements', {
      method: 'POST',
      body: input,
      idempotencyKey: options.idempotencyKey,
    });
  },
};
