import { apiClient } from '../lib/apiClient';

export const financeService = {
  receivePayment: async (state, invoice, paymentDetails, dispatch, currentUser) => {
    const payload = {
      invoice_id: invoice.id,
      amount_paid: Number(paymentDetails.amount),
      payment_mode: paymentDetails.mode || 'NEFT',
      transaction_reference: paymentDetails.refNo || `TXN-${Date.now()}`,
      notes: paymentDetails.notes || 'Payment proof logged',
      payment_date: paymentDetails.date || new Date().toISOString().split('T')[0]
    };

    const res = await apiClient.post('/finance/payments', payload);
    return { success: true, data: res };
  },

  verifyPayment: async (state, paymentId, amountVerified, order, dispatch, currentUser) => {
    const res = await apiClient.post(`/finance/payments/${paymentId}/verify`, {
      status: 'Approved'
    });
    return { success: true, data: res };
  },

  closeOrder: async (state, order, dispatch, currentUser) => {
    const orderId = order.id;
    const res = await apiClient.patch(`/sales/orders/${orderId}/status`, {
      status: 'Closed'
    });
    return { success: true, data: res };
  },

  recordExpense: async (state, expenseData, dispatch, currentUser) => {
    try {
      const res = await apiClient.post('/expenses', {
        expenseName: expenseData.item,
        amount: Number(expenseData.amount),
        expenseDate: new Date().toISOString()
      });

      // Also update local state so the expense shows immediately
      dispatch({
        type: 'RECORD_EXPENSE',
        payload: {
          id: res.data?.id || 'EXP-' + Math.floor(1000 + Math.random() * 9000),
          item: expenseData.item,
          amount: expenseData.amount,
          category: expenseData.category || 'Operations',
          date: new Date().toISOString().split('T')[0]
        }
      });

      return { success: true, data: res };
    } catch (err) {
      // Fallback: still record locally even if backend fails
      dispatch({
        type: 'RECORD_EXPENSE',
        payload: {
          id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
          item: expenseData.item,
          amount: expenseData.amount,
          category: expenseData.category || 'Operations',
          date: new Date().toISOString().split('T')[0]
        }
      });
      return { success: true }; // Don't block UX on expense recording failure
    }
  }
};
