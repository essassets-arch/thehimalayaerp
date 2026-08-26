'use client';

import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import { normalizeQuotation } from '../../../services/sales/quotationNormalizer';

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
          specification: item.productDetails || item.specification || item.description || '',
          quantity,
          unitPrice,
          discount,
          tax,
        };
      });

      const payload = {
        leadId: qData.leadId,
        customerId: qData.customerId,
        customerName: qData.customerName,
        groupName: qData.groupName,
        gstName: qData.gstName,
        gstNumber: qData.gstNumber,
        validUntil: qData.validTill || qData.validUntil,
        remarks: qData.notes !== undefined ? qData.notes : qData.remarks,
        paymentTerms: qData.paymentTerms,
        paymentTermDays: qData.paymentTermDays,
        expectedTransportationCost: Number(qData.expectedTransportationCost ?? qData.transportCharge ?? 0),
        transportCharge: Number(qData.transportCharge ?? qData.expectedTransportationCost ?? 0),
        items,
        selectedTerms: qData.selectedTerms !== undefined ? qData.selectedTerms : qData.terms,
        terms: qData.selectedTerms !== undefined ? qData.selectedTerms : qData.terms,
        selectedTermIds: qData.selectedTermIds,
      };

      const created = await backendFetch('/api/backend/crm/quotations', {
        method: 'POST',
        body: payload,
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
        const rawItems = Array.isArray(updatedData.detailedItems) && updatedData.detailedItems.length > 0
          ? updatedData.detailedItems
          : Array.isArray(updatedData.items)
          ? updatedData.items
          : [];

        const mappedItems = rawItems.map((item) => {
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
            specification: item.productDetails || item.specification || item.description || '',
            quantity,
            unitPrice,
            discount,
            tax,
          };
        });

        const patchPayload = {
          ...updatedData,
          customerName: updatedData.customerName,
          groupName: updatedData.groupName,
          gstName: updatedData.gstName,
          gstNumber: updatedData.gstNumber,
          validUntil: updatedData.validTill || updatedData.validUntil,
          remarks: updatedData.notes !== undefined ? updatedData.notes : updatedData.remarks,
          paymentTerms: updatedData.paymentTerms,
          paymentTermDays: updatedData.paymentTermDays,
          expectedTransportationCost: Number(updatedData.expectedTransportationCost ?? updatedData.transportCharge ?? 0),
          transportCharge: Number(updatedData.transportCharge ?? updatedData.expectedTransportationCost ?? 0),
          items: mappedItems,
          selectedTerms: updatedData.selectedTerms !== undefined ? updatedData.selectedTerms : updatedData.terms,
          terms: updatedData.selectedTerms !== undefined ? updatedData.selectedTerms : updatedData.terms,
          selectedTermIds: updatedData.selectedTermIds,
        };

        await backendFetch(`/api/backend/crm/quotations/${quotationId}`, {
          method: 'PATCH',
          body: patchPayload,
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
      showToast?.(`Order ${order.orderNumber || order.orderId || order.id || ''} created successfully.`);
      return { success: true, data: order, orderId: order.id, id: order.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Swal.fire({ icon: 'error', title: 'Order Conversion Failed', text: message });
      return { success: false, error: message };
    }
  }, [loadQuotations, showToast]);

  return { quotations, createQuotation, updateQuotation, confirmOrder, loadQuotations };
}
