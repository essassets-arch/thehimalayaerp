'use client';

import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';

const statusLabel = (code) => {
  const value = String(code || 'DRAFT').toUpperCase();
  if (value === 'CONVERTED_TO_SO') return 'Converted';
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ');
};

const normalizeQuotation = (quotation) => ({
  ...quotation,
  id: quotation.id,
  quotationNo: quotation.quotationNumber,
  customerName: quotation.lead?.companyName || quotation.customer?.companyName || '',
  groupName: quotation.lead?.groupName || '',
  gstName: quotation.lead?.gstName || quotation.lead?.companyName || '',
  gstNumber: quotation.lead?.gstNumber || '',
  status: statusLabel(quotation.workflowState?.code),
  validTill: quotation.validUntil,
  totalAmount: Number(quotation.total || 0),
  grandTotal: Number(quotation.total || 0),
  detailedItems: (quotation.items || []).map((item) => ({
    productId: item.productId,
    productName: item.product?.name || item.description || 'Product',
    productDetails: item.description || item.product?.description || '',
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    discountAmount: Number(item.discount || 0),
    taxAmount: Number(item.tax || 0),
  })),
});

export function useQuotations(showToast, autoLoad = true) {
  const [quotations, setQuotations] = useState([]);

  const loadQuotations = useCallback(async () => {
    try {
      const result = await backendFetch('/api/backend/crm/quotations');
      setQuotations((Array.isArray(result) ? result : result?.data || []).map(normalizeQuotation));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Swal.fire({ icon: 'error', title: 'Unable to Load Quotations', text: message });
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      void loadQuotations();
    }
  }, [autoLoad, loadQuotations]);

  const createQuotation = useCallback(async (qData) => {
    try {
      const rawItems = Array.isArray(qData.detailedItems) && qData.detailedItems.length > 0
        ? qData.detailedItems
        : Array.isArray(qData.items)
        ? qData.items
        : [];

      const items = rawItems.map((item) => {
        const quantity = Number(item.quantity || item.qty || 0);
        const unitPrice = Number(item.unitPrice || item.rate || item.price || 0);
        const gross = quantity * unitPrice;
        const discPct = Number(item.discount || 0);
        const taxPct = item.tax !== undefined ? Number(item.tax) : 18;
        const discount = gross * (discPct / 100);
        const tax = (gross - discount) * (taxPct / 100);
        return {
          productId: item.productId || item.productCode || item.code || undefined,
          productName: item.productName || item.name || 'Custom Product',
          productCode: item.productCode || item.code || undefined,
          description: item.productDetails || item.specification || item.description || item.productName || item.name || '',
          quantity,
          unitPrice,
          discount,
          tax,
        };
      });

      const created = await backendFetch('/api/backend/crm/quotations', {
        method: 'POST',
        body: {
          leadId: qData.leadId,
          customerId: qData.customerId,
          validUntil: qData.validTill,
          remarks: qData.notes,
          items,
        },
      });
      showToast?.('Quotation created and saved to database.');
      await loadQuotations();
      return { success: true, data: created, id: created.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Swal.fire({ icon: 'error', title: 'Quotation Save Failed', text: message });
      return { success: false, error: message };
    }
  }, [loadQuotations, showToast]);

  const updateQuotation = useCallback(async (quotationId, updatedData) => {
    try {
      const status = String(updatedData?.status || '');
      if (status) {
        const currentQuotation = quotations.find((quotation) => quotation.id === quotationId);
        const currentStatus = String(currentQuotation?.status || '').toUpperCase().replaceAll(' ', '_');
        const terminalStatuses = ['CONVERTED', 'CONVERTED_TO_SO', 'SUPERSEDED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
        if (terminalStatuses.includes(currentStatus)) {
          throw new Error(`Quotation is already ${currentQuotation.status} and cannot be updated.`);
        }
        if (status === 'Sent' && !['DRAFT', 'INTERNAL_REVIEW', 'NEW', 'CREATED', 'PENDING'].includes(currentStatus)) {
          throw new Error(`Quotation cannot be sent from ${currentQuotation?.status || 'its current state'}.`);
        }
        const actionByStatus = {
          Sent: 'SEND',
          Approved: 'APPROVE',
          Rejected: 'REJECT',
        };
        const action = actionByStatus[status];
        if (action) {
          await backendFetch(`/api/backend/crm/quotations/${quotationId}/action`, {
            method: 'POST',
            body: { action },
          });
        }
      } else {
        await backendFetch(`/api/backend/crm/quotations/${quotationId}`, {
          method: 'PATCH',
          body: updatedData,
        });
      }
      await loadQuotations();
      showToast?.('Quotation updated.');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Swal.fire({ icon: 'error', title: 'Quotation Update Failed', text: message });
      return { success: false, error: message };
    }
  }, [loadQuotations, quotations, showToast]);

  const confirmOrder = useCallback(async (quotation) => {
    try {
      const order = await backendFetch(`/api/backend/crm/quotations/${quotation.id}/convert`, {
        method: 'POST',
        body: {},
      });
      await loadQuotations();
      showToast?.(`Order ${order.orderNumber || order.orderId || order.id || ''} created in database.`);
      return { success: true, data: order, orderId: order.id, id: order.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Swal.fire({ icon: 'error', title: 'Order Conversion Failed', text: message });
      return { success: false, error: message };
    }
  }, [loadQuotations, showToast]);

  return { quotations, createQuotation, updateQuotation, confirmOrder, loadQuotations };
}
