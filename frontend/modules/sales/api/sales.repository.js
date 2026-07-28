/**
 * Sales Repository — Pure HTTP transport layer.
 *
 * Rules:
 *  - NO business logic here. Only HTTP calls.
 *  - Calls client directly (new pattern) — data is auto-unwrapped by responseInterceptor.
 *  - Every method returns raw API data or throws an ApiError.
 *  - Service layer is responsible for transforming / validating results.
 */
import { apiClient as client } from '../../../lib/apiClient.js';
import { ENDPOINTS } from '../../../shared/api/endpoints.js';
import { generateUniqueId } from '../../../engine/utils/idGenerator.js';

// ── Leads ────────────────────────────────────────────────────────────────────

export const leadsRepository = {
  getAll: () => client.get(ENDPOINTS.SALES.LEADS),

  create: (leadData) => client.post(ENDPOINTS.SALES.LEADS, leadData),

  update: (leadId, data) => client.put(`${ENDPOINTS.SALES.LEADS}/${leadId}`, data),

  remove: (leadId, reason = '') =>
    client.delete(`${ENDPOINTS.SALES.LEADS}/${leadId}?reason=${encodeURIComponent(reason)}`),
};

// ── Samples ──────────────────────────────────────────────────────────────────

export const samplesRepository = {
  getAll: () => client.get(ENDPOINTS.SALES.SAMPLES),

  create: (sampleData) => client.post(ENDPOINTS.SALES.SAMPLES, sampleData),

  update: (sampleId, data) => client.put(`${ENDPOINTS.SALES.SAMPLES}/${sampleId}`, data),
};

// ── Quotations ───────────────────────────────────────────────────────────────

export const quotationsRepository = {
  getAll: () => client.get(ENDPOINTS.SALES.QUOTATIONS),

  create: (qData) => client.post(ENDPOINTS.SALES.QUOTATIONS, qData),

  update: (qId, data) => client.put(`${ENDPOINTS.SALES.QUOTATIONS}/${qId}`, data),
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const ordersRepository = {
  getAll: () => client.get(ENDPOINTS.SALES.ORDERS),

  /** Orders delivered but awaiting payment confirmation */
  getPendingPayment: () => client.get('/sales/orders/delivered/pending-payment'),

  /**
   * Converts a quotation into a confirmed sales order.
   * The idempotency key prevents duplicate submissions.
   */
  createFromQuotation: (quotation, customerId, currentUserId) => {
    const body = {
      public_id: generateUniqueId('ORD'),
      customer_id: customerId || null,
      customer_name: quotation.customerName,
      grand_total: Number(quotation.grandTotal ?? quotation.totalAmount ?? quotation.totalValue ?? 0) || 0,
      total_amount: Number(quotation.totalAmount ?? quotation.grandTotal ?? quotation.totalValue ?? 0) || 0,
      total_tonnage: quotation.quantity || 1,
      discount_percent: quotation.discount || 0,
      gst_rate: quotation.tax || 18,
      idempotency_key: `QTN-${quotation.id}-${currentUserId || 'anon'}-${Date.now()}`,
      items: (quotation.detailedItems || []).map((item) => ({
        product_id: item.productId || item.code || null,
        product_name: item.productName || item.name,
        quantity: item.quantity || item.qty || 1,
        price: item.unitPrice || item.rate || 0,
        discount_percent: item.discount || 0,
        gst_rate: item.tax || 18,
      })),
      source_quotation_ref: String(quotation.id),
      quotationId: quotation.id,
      expectedTransportationCost: Number(quotation.expectedTransportationCost ?? quotation.transportCharge ?? 0) || 0,
      transportCharge: Number(quotation.transportCharge ?? 0) || 0,
      delivery_address: quotation.deliveryAddress || quotation.delivery_address || quotation.shippingAddress || '',
      expected_delivery_date: quotation.deliveryDate || quotation.expectedDeliveryDate || quotation.validTill || '',
      workflowStatus: 'SALES_ORDER',
      status: 'SALES_ORDER',
    };
    return client.post(ENDPOINTS.SALES.ORDERS, body);
  },

  /** Creates a direct order (no quotation step) */
  createDirect: (orderData, currentUserId) => {
    const body = {
      public_id: generateUniqueId('ORD'),
      customer_name: orderData.customerName,
      customer_id: null,
      total_tonnage: Number(orderData.quantity) || 0,
      discount_percent: 0,
      gst_rate: 18,
      idempotency_key: `DIRECT-${currentUserId || 'anon'}-${Date.now()}`,
      items: [{
        product_name: orderData.productName,
        quantity: Number(orderData.quantity) || 1,
        price: orderData.price || 15000,
        discount_percent: 0,
        gst_rate: 18,
      }],
      workflowStatus: 'SALES_ORDER',
      status: 'SALES_ORDER',
    };
    return client.post(ENDPOINTS.SALES.ORDERS, body);
  },

  /** Update payment follow-up notes and scheduled date */
  updateFollowup: (orderId, text, nextDate) =>
    client.patch(`${ENDPOINTS.SALES.ORDERS}/${orderId}/followup`, { text, nextDate }),
};
