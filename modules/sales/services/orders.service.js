/**
 * Orders Service — Business logic for the Orders feature.
 */
import { ordersRepository } from '../api/sales.repository.js';
import { ERPSuccess, ERPError } from '../../../engine/utils/errors.js';

export const ordersService = {
  /**
   * Create a direct order (bypassing the quotation flow).
   */
  createDirect: async (orderData, currentUser) => {
    try {
      const result = await ordersRepository.createDirect(orderData, currentUser?.id);
      return ERPSuccess({ orderNo: result.orderId || result.id, ...result });
    } catch (err) {
      return ERPError(err.message, 'CREATE_ERROR');
    }
  },

  /**
   * Fetch orders that have been delivered but not yet marked as paid.
   */
  fetchPendingPayment: async () => {
    try {
      const data = await ordersRepository.getPendingPayment();
      return ERPSuccess(Array.isArray(data) ? data : []);
    } catch (err) {
      return ERPError(err.message, 'FETCH_ERROR');
    }
  },

  /**
   * Update follow-up notes and next-call date for an order.
   */
  updateFollowup: async (orderId, text, nextDate) => {
    try {
      const data = await ordersRepository.updateFollowup(orderId, text, nextDate);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },
};
