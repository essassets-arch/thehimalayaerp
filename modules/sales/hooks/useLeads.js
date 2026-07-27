'use client';

/**
 * useLeads — All lead-related operations for components.
 *
 * Bridges ERPContext state + leadsService, surfacing:
 *  - The leads array (from global ERP state)
 *  - Mutation helpers (each calls the service then syncs state)
 */
import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP, useERPStore } from '../../../shared/context/ERPContext.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import { leadsService } from '../services/leads.service.js';

/**
 * @param {Function} showToast — toast notification callback from outlet context
 */
export function useLeads(showToast) {
  const { state, syncData, salesActions } = useERP();
  const { user } = useAuth();
  const router = useRouter();

  const leads = state.sales?.leads || [];

  // ── Mutations ────────────────────────────────────────────────────────────

  /** Create a new lead, then navigate to leads list. */
  const addLead = useCallback(
    async (newLeadData) => {
      showToast('Sales: Registering lead...');
      try {
        const leadId = salesActions?.createLead(newLeadData, user?.name || 'Sales User');
        if (!leadId) throw new Error('Lead creation returned no ID');
        showToast('Lead Created Successfully');
        await syncData();
        router.push('/sales/leads');
        return { id: leadId, leadId };
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'CRM Validation Error',
          text: err.message || 'Failed to create lead',
        });
      }
    },
    [showToast, router, syncData, salesActions, user]
  );

  /**
   * Save lead first, then persist a Draft quotation on the backend,
   * seed ERPStore, and navigate to /sales/create-quotation.
   * Idempotent: clicking Generate Quotation again for the same lead
   * reuses the existing Draft row.
   */
  const generateQuotationFromLead = useCallback(
    async (leadData) => {
      try {
        showToast('Saving lead and creating quotation draft…');

        // 1. If this is a NEW lead (no id yet), save it first
        let resolvedLeadId = leadData.id || leadData.leadId;
        if (!resolvedLeadId) {
          try {
            resolvedLeadId = salesActions?.createLead(leadData, user?.name || 'Sales User');
            if (!resolvedLeadId) throw new Error('Lead creation returned no ID');
          } catch (err) {
            Swal.fire({ icon: 'error', title: 'Lead Save Failed', text: err.message || 'Failed to create lead' });
            return;
          }
          showToast('Lead Created Successfully');
        }

        // 2. Map lead detailedItems → quotation items format
        const detailedItems = (leadData.detailedItems || []).map(item => ({
          productName: item.productName || item.name || '',
          specification: item.specification || item.description || '',
          quantity: item.quantity || item.qty || 1,
          unitPrice: item.unitPrice || item.rate || 0,
          discount: item.discount || 0,
          tax: item.tax || 18,
          additionalCharges: item.additionalCharges || 0,
        }));

        const grandTotal = detailedItems.reduce((sum, it) => {
          const sub = it.quantity * it.unitPrice;
          const disc = sub * (it.discount / 100);
          const gst = (sub - disc) * (it.tax / 100);
          return sum + sub - disc + gst + (it.additionalCharges || 0);
        }, 0);

        // 3. Build an in-memory form draft. The quotation itself is written
        // only when the canonical createQuotation action is submitted.
        const serverDraft = {
          leadId: resolvedLeadId,
          customerName: leadData.companyName || leadData.customerName || '',
          companyName: leadData.companyName || '',
          gstName: leadData.gstName || leadData.companyName || '',
          gstNumber: leadData.gstNumber || '',
          groupName: leadData.groupName || '',
          contactPerson: leadData.contactPerson || leadData.siteInchargeName || '',
          phone: leadData.phone || leadData.siteInchargeMobile || '',
          email: leadData.email || '',
          address: leadData.address || '',
          remarks: leadData.notes || leadData.remarks || '',
          grandTotal,
          detailedItems,
        };

        // 4. Seed only the non-transactional quotation form draft.
        useERPStore.getState().setQuotationDraft({
          customer: serverDraft.customerName || serverDraft.companyName || leadData.companyName || leadData.customerName || '',
          company: serverDraft.companyName || leadData.companyName || '',
          gstName: serverDraft.gstName || serverDraft.companyName || leadData.gstName || leadData.companyName || '',
          gstNumber: serverDraft.gstNumber || leadData.gstNumber || '',
          groupName: serverDraft.groupName || leadData.groupName || '',
          contactPerson: serverDraft.contactPerson || leadData.contactPerson || '',
          phone: serverDraft.phone || leadData.phone || '',
          email: serverDraft.email || leadData.email || '',
          address: serverDraft.address || leadData.address || '',
          notes: serverDraft.remarks || leadData.notes || '',
          leadId: resolvedLeadId,
          source: 'LEAD',
          sourceId: resolvedLeadId,
          items: (serverDraft.items || serverDraft.detailedItems || detailedItems).map((it, idx) => ({
            id: idx + 1,
            name: it.productName || it.name || '',
            description: it.specification || it.description || '',
            qty: it.quantity || it.qty || 1,
            rate: it.unitPrice || it.rate || 0,
            discount: it.discount || 0,
            tax: it.tax !== undefined ? it.tax : 18,
            amount: (it.quantity || it.qty || 1) * (it.unitPrice || it.rate || 0),
          })),
        });

        // 5. Sync leads to reflect new lead + 'Quotation Draft' status
        await syncData();
        router.push('/sales/create-quotation');
      } catch (err) {
        console.error('Error generating quotation from lead:', err);
        Swal.fire({
          icon: 'error',
          title: 'Operation Failed',
          text: err.message || 'An error occurred while generating the quotation.'
        });
      }
    },
    [showToast, router, syncData]
  );

  /** Update a lead's status (e.g. "Active" → "Lost"). */
  const updateLeadStatus = useCallback(
    async (leadId, status, reason) => {
      const res = await leadsService.updateStatus(leadId, status, reason);
      if (res.success) {
        showToast(`Lead status updated to ${status}`);
        await syncData();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
      }
    },
    [showToast, syncData]
  );

  /** Append a follow-up note to the lead's timeline. */
  const addFollowup = useCallback(
    async (leadId, text) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;

      const res = await leadsService.addFollowup(lead, text);
      if (res.success) {
        showToast('Followup recorded.');
        await syncData();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
      }
    },
    [leads, showToast, syncData]
  );

  /** Convert a lead to a sample request, then navigate to samples view. */
  const convertToSample = useCallback(
    async (lead, customDetails) => {
      if (!customDetails) {
        router.push('/sales/create-sample?leadId=' + lead.id);
        return { success: true };
      }
      showToast('Sales: Creating sample dispatch request…');
      const res = await leadsService.convertToSample(lead, customDetails);

      if (res.success) {
        showToast('Sample dispatch request created for ' + lead.companyName + '!');
        await syncData();
        router.push('/dispatch/sample-dispatch');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Sample Request Failed',
          text: res.error?.message || res.error,
        });
      }
      return res;
    },
    [showToast, router, syncData]
  );

  /** Update full lead details (edit form). */
  const updateLead = useCallback(
    async (leadId, updatedData) => {
      const res = await leadsService.update(leadId, updatedData);
      if (res.success) {
        showToast('Lead details updated successfully.');
        await syncData();
        router.push('/sales/leads');
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
      }
    },
    [showToast, router, syncData]
  );

  /** Soft-delete a lead. */
  const deleteLead = useCallback(
    async (leadId, options = {}) => {
      const res = await leadsService.remove(leadId, options.reason || 'Deleted from leads directory');
      if (res.success) {
        showToast('Lead deleted successfully.');
        await syncData();
        if (options.navigate !== false) router.push('/sales/leads');
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
      }
      return res;
    },
    [showToast, router, syncData]
  );

  return {
    leads,
    addLead,
    generateQuotationFromLead,
    updateLeadStatus,
    addFollowup,
    convertToSample,
    updateLead,
    deleteLead,
  };
}
