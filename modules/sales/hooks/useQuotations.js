/**
 * useQuotations — Quotation operations for components.
 */
import { useCallback } from 'react';
import Swal from 'sweetalert2';
import { useERP } from '../../../shared/context/ERPContext.jsx';
import { useERPStore } from '../../../store/erpStore';
import { useAuth } from '../../../shared/context/AuthContext.jsx';

/**
 * @param {Function} showToast
 */
export function useQuotations(showToast) {
  const { state } = useERP();
  const { user } = useAuth();

  const quotations = state.sales?.quotations || [];

  /** Create a new quotation. */
  const createQuotation = useCallback(
    async (qData) => {
      try {
        const id = useERPStore.getState().createQuotation(qData, user?.name || 'Sales User');
        showToast('Quotation created successfully.');
        return { success: true, data: { id } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Swal.fire({ icon: 'error', title: 'Error', text: message });
        return { success: false, error: message };
      }
    },
    [showToast, user]
  );

  /** Update quotation details. */
  const updateQuotation = useCallback(
    async (qId, updatedData) => {
      const current = useERPStore.getState();
      const quotation = current.sales?.quotations?.find((item) => item.id === qId);
      if (!quotation) return { success: false, error: 'Quotation not found' };
      const nextState = {
        ...current,
        sales: {
          ...current.sales,
          quotations: current.sales.quotations.map((item) =>
            item.id === qId ? { ...item, ...updatedData, id: qId } : item
          ),
        },
      };
      useERPStore.setState(nextState);
      showToast('Quotation updated.');
      return { success: true, data: nextState.sales.quotations.find((item) => item.id === qId) };
    },
    [showToast]
  );

  const convertQuotationToOrder = useERPStore(s => s.salesActions?.convertQuotationToOrder);

  /**
   * Convert a quotation to a confirmed order.
   */
  const confirmOrder = useCallback(
    async (quotation) => {
      try {
        if (!convertQuotationToOrder) throw new Error("ERP Actions not initialized");
        
        // This natively mutates the centralized store, converts quotation, creates order, and persists!
        const orderId = convertQuotationToOrder(quotation.id, user?.name);
        showToast(`Order ${orderId} confirmed!`);
        return { success: true, data: { orderNo: orderId } };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Swal.fire({ icon: 'error', title: 'Order Failed', text: message });
        return { success: false, error: message };
      }
    },
    [convertQuotationToOrder, user, showToast]
  );

  return {
    quotations,
    createQuotation,
    updateQuotation,
    confirmOrder,
  };
}
