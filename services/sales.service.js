/**
 * Sales Service — Real API layer.
 *
 * Replaces the old mock-based orderOrchestrator approach.
 * All mutations go to the backend; state is synced via ERPContext.syncData().
 */
import { apiClient } from '../lib/apiClient';
import { ERPSuccess, ERPError } from '../engine/utils/errors';
import { generateUniqueId } from '../engine/utils/idGenerator';

export const salesService = {
  /**
   * Register a new lead — calls the backend API.
   */
  addLead: async (_state, leadData, _dispatch, _currentUser) => {
    try {
      const result = await apiClient.post('/sales/leads', leadData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Update lead details/status — calls the backend API.
   */
  updateLead: async (_state, leadId, updatedData, _dispatch, _currentUser) => {
    try {
      const result = await apiClient.put(`/sales/leads/${leadId}`, updatedData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Delete a lead — calls the backend API.
   */
  deleteLead: async (_state, leadId, reason, _dispatch, _currentUser) => {
    try {
      const result = await apiClient.delete(`/sales/leads/${leadId}?reason=${encodeURIComponent(reason || '')}`);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Request a sample — calls the backend API.
   */
  requestSample: async (_state, sampleData, _dispatch, _currentUser) => {
    try {
      const result = await apiClient.post('/sales/samples', sampleData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Update sample status/details — calls the backend API.
   */
  updateSample: async (_state, sampleId, updatedData, _dispatch, _currentUser) => {
    try {
      const result = await apiClient.put(`/sales/samples/${sampleId}`, updatedData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Create a quotation — calls the backend API.
   */
  createQuotation: async (_state, qData, _dispatch, _currentUser) => {
    try {
      const result = await apiClient.post('/sales/quotations', qData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Update quotation status/details — calls the backend API.
   */
  updateQuotation: async (_state, qId, updatedData, _dispatch, _currentUser) => {
    try {
      const result = await apiClient.put(`/sales/quotations/${qId}`, updatedData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Convert a quotation to an order — calls the REAL backend.
   * On success, the ERPContext 10s sync will refresh the order list.
   */
  confirmOrder: async (state, qtn, dispatch, currentUser) => {
    try {
      const idempotency_key = `QTN-${qtn.id}-${currentUser?.id || 'anon'}-${Date.now()}`;

      // Resolve customer_id from state customers or create a placeholder
      const existingCustomer = (state.customers || []).find(
        c => c.name?.toLowerCase() === qtn.customerName?.toLowerCase()
      );

      const body = {
        public_id: generateUniqueId('ORD'),
        customer_id: existingCustomer?.id || null,
        customer_name: qtn.customerName,    // backend can use this if no customer_id
        total_tonnage: qtn.quantity || 1,
        discount_percent: qtn.discount || 0,
        gst_rate: qtn.tax || 18,
        idempotency_key,
        items: (qtn.detailedItems || []).map(item => ({
          product_id: item.productId || item.code || null,
          product_name: item.productName || item.name,
          quantity: item.quantity || item.qty || 1,
          price: item.unitPrice || item.rate || 0,
          discount_percent: item.discount || 0,
          gst_rate: item.tax || 18,
        })),
        source_quotation_ref: String(qtn.id),
      };

      const result = await apiClient.post('/sales/orders', body);

      // Optimistically update quotation status in local state
      dispatch({ type: 'UPDATE_QUOTATION', payload: { id: qtn.id, status: 'Converted' } });

      return ERPSuccess({ orderNo: result.orderId || result.id, ...result });
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Create a direct order (bypassing quotation) — calls the REAL backend.
   */
  createOrder: async (_state, orderData, _dispatch, currentUser) => {
    try {
      const idempotency_key = `DIRECT-${currentUser?.id || 'anon'}-${Date.now()}`;

      const body = {
        public_id: generateUniqueId('ORD'),
        customer_name: orderData.customerName,
        customer_id: null,
        total_tonnage: Number(orderData.quantity) || 0,
        discount_percent: 0,
        gst_rate: 18,
        idempotency_key,
        items: [{
          product_name: orderData.productName,
          quantity: Number(orderData.quantity) || 1,
          price: 15000,
          discount_percent: 0,
          gst_rate: 18,
        }],
      };

      const result = await apiClient.post('/sales/orders', body);

      return ERPSuccess({ orderNo: result.orderId || result.id, ...result });
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Update payment follow-up details (notes & next date) — calls the backend API.
   */
  updateFollowup: async (orderId, text, nextDate) => {
    try {
      const result = await apiClient.patch(`/sales/orders/${orderId}/followup`, { text, nextDate });
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  }
};
