import { SalesWriteRepository, WriteRequestOptions } from './salesWriteRepository';
import { apiClient } from '../../lib/apiClient';

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
    const res = await apiClient.post(`/sales/orders/${orderId}/customer-po`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async runCreditCheck(orderId, input, options) {
    const res = await apiClient.post(`/sales/orders/${orderId}/credit-check`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async approveCreditException(orderId, input, options) {
    const res = await apiClient.post(`/sales/orders/${orderId}/credit-exception/approve`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async confirmOrder(orderId, input, options) {
    const res = await apiClient.post(`/sales/orders/${orderId}/confirm`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async sendToPlantHead(orderId, input, options) {
    const res = await apiClient.post(`/sales/orders/${orderId}/send-to-plant-head`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async cancelOrder(orderId, input, options) {
    const res = await apiClient.post(`/sales/orders/${orderId}/cancel`, input, {
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
    const res = await apiClient.post(`/sales-returns`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },

  async requestReplacement(input, options) {
    const res = await apiClient.post(`/replacements`, input, {
      headers: { 'Idempotency-Key': options.idempotencyKey },
    });
    return res.data;
  },
};
