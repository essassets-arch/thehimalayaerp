/**
 * Quotations Service — Business logic for the Quotations feature.
 *
 * Rules:
 *  - Uses quotationsRepository for HTTP.
 *  - Returns { success, data } or { success: false, error }.
 *  - confirmOrder coordinates quotation → order conversion atomically.
 */
import { quotationsRepository, ordersRepository } from '../api/sales.repository.js';
import { ERPSuccess, ERPError } from '../../../engine/utils/errors.js';

export const quotationsService = {
  /**
   * Create a new quotation.
   */
  create: async (qData) => {
    try {
      const data = await quotationsRepository.create(qData);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'CREATE_ERROR');
    }
  },

  /**
   * Update an existing quotation.
   */
  update: async (qId, updatedData) => {
    try {
      const data = await quotationsRepository.update(qId, updatedData);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },

  /**
   * Convert a quotation into a confirmed sales order.
   *
   * @param {object} quotation   - The quotation object from state.
   * @param {Array}  customers   - Current customers list from state (for customer_id lookup).
   * @param {object} currentUser - Logged-in user (for idempotency key).
   */
  confirmOrder: async (quotation, customers = [], currentUser) => {
    try {
      const existingCustomer = customers.find(
        (c) => c.name?.toLowerCase() === quotation.customerName?.toLowerCase()
      );

      const result = await ordersRepository.createFromQuotation(
        quotation,
        existingCustomer?.id || null,
        currentUser?.id
      );

      return ERPSuccess({
        orderNo: result.orderId || result.id,
        ...result,
      });
    } catch (err) {
      return ERPError(err.message, 'CONFIRM_ORDER_ERROR');
    }
  },
};
