'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP, useERPStore } from '../../../shared/context/ERPContext.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import { leadsWriteRepository } from '../../../services/leads/leadsWriteRepository';
import { leadsService } from '../services/leads.service.js';

const useBackendWrite = process.env.NEXT_PUBLIC_BACKEND_LEADS_WRITE === 'true';

const handleBackendError = (err, refreshCallback) => {
  const status = err.response?.status || err.status || err.statusCode || 500;
  if (status === 409) {
    Swal.fire({
      icon: 'warning',
      title: 'Version Conflict',
      text: 'This record was updated by another user. Reloading the latest data.',
      confirmButtonText: 'Refresh',
    }).then(() => {
      if (refreshCallback) refreshCallback();
    });
  } else if (status === 403) {
    Swal.fire({ icon: 'error', title: 'Forbidden', text: "You don't have permission to perform this action." });
  } else if (status === 400) {
    Swal.fire({ icon: 'error', title: 'Validation Error', text: err.message || 'Invalid input.' });
  } else if (status === 503 || status === 504) {
    Swal.fire({ icon: 'error', title: 'Service Unavailable', text: 'Backend service is currently unreachable. Please try again later.' });
  } else {
    Swal.fire({ icon: 'error', title: 'Operation Failed', text: err.message || 'An error occurred.' });
  }
};

const generateIdempotencyKey = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);

export function useLeads(showToast) {
  const { state, syncData, salesActions } = useERP();
  const { user } = useAuth();
  const router = useRouter();

  // Return the leads list (already correctly isolated in ERPContext state mapping)
  const leads = state.sales?.leads || [];

  const addLead = useCallback(
    async (newLeadData) => {
      showToast('Sales: Registering lead...');
      try {
        if (useBackendWrite) {
          const idempotencyKey = generateIdempotencyKey();
          const result = await leadsWriteRepository.create(newLeadData, { idempotencyKey });
          useERPStore.getState().upsertServerLead(result);
          showToast('Lead Created Successfully');
          await syncData();
          router.push('/sales/leads');
          return { id: result.id, leadId: result.id };
        } else {
          // Legacy mode
          const leadId = salesActions?.createLead(newLeadData, user?.name || 'Sales User');
          if (!leadId) throw new Error('Lead creation returned no ID');
          showToast('Lead Created Successfully');
          await syncData();
          router.push('/sales/leads');
          return { id: leadId, leadId };
        }
      } catch (err) {
        if (useBackendWrite) {
          handleBackendError(err, syncData);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'CRM Validation Error',
            text: err.message || 'Failed to create lead',
          });
        }
      }
    },
    [showToast, router, syncData, salesActions, user]
  );

  const generateQuotationFromLead = useCallback(
    async (leadData) => {
      try {
        showToast('Saving lead and creating quotation draft…');
        let resolvedLeadId = leadData.id || leadData.leadId;
        
        if (!resolvedLeadId) {
          try {
            if (useBackendWrite) {
              const idempotencyKey = generateIdempotencyKey();
              const result = await leadsWriteRepository.create(leadData, { idempotencyKey });
              useERPStore.getState().upsertServerLead(result);
              resolvedLeadId = result.id;
            } else {
              resolvedLeadId = salesActions?.createLead(leadData, user?.name || 'Sales User');
              if (!resolvedLeadId) throw new Error('Lead creation returned no ID');
            }
          } catch (err) {
            if (useBackendWrite) {
              handleBackendError(err, syncData);
            } else {
              Swal.fire({ icon: 'error', title: 'Lead Save Failed', text: err.message || 'Failed to create lead' });
            }
            return;
          }
          showToast('Lead Created Successfully');
        }

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
    [showToast, router, syncData, salesActions, user]
  );

  const updateLeadStatus = useCallback(
    async (leadId, status, reason) => {
      try {
        if (useBackendWrite) {
          const idempotencyKey = generateIdempotencyKey();
          const existingLead = leads.find(l => l.id === leadId);
          const expectedVersion = existingLead ? existingLead.version || 1 : 1;
          
          let result;
          if (status === 'QUALIFIED') {
            result = await leadsWriteRepository.qualify(leadId, { expectedVersion, notes: reason }, { idempotencyKey });
          } else if (status === 'LOST') {
            result = await leadsWriteRepository.markLost(leadId, { expectedVersion, reason: reason || 'Marked Lost', notes: reason }, { idempotencyKey });
          } else {
            // Basic restore or other status
            result = await leadsWriteRepository.restore(leadId, { expectedVersion, restoreToStatus: status }, { idempotencyKey });
          }
          useERPStore.getState().upsertServerLead(result);
          showToast(`Lead status updated to ${status}`);
          await syncData();
        } else {
          // Legacy
          const res = await leadsService.updateStatus(leadId, status, reason);
          if (res.success) {
            showToast(`Lead status updated to ${status}`);
            await syncData();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
          }
        }
      } catch (err) {
        if (useBackendWrite) {
          handleBackendError(err, syncData);
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
      }
    },
    [showToast, syncData, leads]
  );

  const addFollowup = useCallback(
    async (leadId, text) => {
      try {
        if (useBackendWrite) {
          const idempotencyKey = generateIdempotencyKey();
          const existingLead = leads.find(l => l.id === leadId);
          const expectedVersion = existingLead ? existingLead.version || 1 : 1;
          // Set nextReminderAt to some future date or just add to timeline. 
          // The backend leadsWriteRepository has setReminder, but maybe just generic update works too if timeline isn't directly exposed for writes.
          // In the NestJS API, timeline entries are added via a specific endpoint, or update?
          // For now, we will use update to patch notes/timeline or setReminder. Let's patch notes.
          const payload = { notes: text };
          const result = await leadsWriteRepository.update(leadId, payload, { idempotencyKey });
          useERPStore.getState().upsertServerLead(result);
          showToast('Followup recorded.');
          await syncData();
        } else {
          const lead = leads.find((l) => l.id === leadId);
          if (!lead) return;
          const res = await leadsService.addFollowup(lead, text);
          if (res.success) {
            showToast('Followup recorded.');
            await syncData();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
          }
        }
      } catch (err) {
        if (useBackendWrite) {
          handleBackendError(err, syncData);
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
      }
    },
    [leads, showToast, syncData]
  );

  const convertToSample = useCallback(
    async (lead, customDetails) => {
      if (!customDetails) {
        router.push('/sales/create-sample?leadId=' + lead.id);
        return { success: true };
      }
      showToast('Sales: Creating sample dispatch request…');
      // convertToSample touches samplesRepository. For now, leave it using leadsService, 
      // but if NEXT_PUBLIC_BACKEND_LEADS_WRITE is true, we should qualify the lead too.
      const res = await leadsService.convertToSample(lead, customDetails);

      if (res.success) {
        if (useBackendWrite) {
           const idempotencyKey = generateIdempotencyKey();
           const expectedVersion = lead.version || 1;
           const result = await leadsWriteRepository.qualify(lead.id, { expectedVersion, notes: 'Converted to Sample' }, { idempotencyKey });
           useERPStore.getState().upsertServerLead(result);
        }
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

  const updateLead = useCallback(
    async (leadId, updatedData) => {
      try {
        if (useBackendWrite) {
          const idempotencyKey = generateIdempotencyKey();
          const result = await leadsWriteRepository.update(leadId, updatedData, { idempotencyKey });
          useERPStore.getState().upsertServerLead(result);
          showToast('Lead details updated successfully.');
          await syncData();
          router.push('/sales/leads');
        } else {
          const res = await leadsService.update(leadId, updatedData);
          if (res.success) {
            showToast('Lead details updated successfully.');
            await syncData();
            router.push('/sales/leads');
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
          }
        }
      } catch (err) {
        if (useBackendWrite) {
          handleBackendError(err, syncData);
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
      }
    },
    [showToast, router, syncData]
  );

  const deleteLead = useCallback(
    async (leadId, options = {}) => {
      try {
        if (useBackendWrite) {
          const idempotencyKey = generateIdempotencyKey();
          const existingLead = leads.find(l => l.id === leadId);
          const expectedVersion = existingLead ? existingLead.version || 1 : 1;
          const result = await leadsWriteRepository.delete(leadId, { expectedVersion }, { idempotencyKey });
          useERPStore.getState().upsertServerLead(result); // Using upsert with DELETED status or we can just removeServerLead
          useERPStore.getState().removeServerLead(leadId);
          showToast('Lead deleted successfully.');
          await syncData();
          if (options.navigate !== false) router.push('/sales/leads');
          return { success: true, data: result };
        } else {
          const res = await leadsService.remove(leadId, options.reason || 'Deleted from leads directory');
          if (res.success) {
            showToast('Lead deleted successfully.');
            await syncData();
            if (options.navigate !== false) router.push('/sales/leads');
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
          }
          return res;
        }
      } catch (err) {
        if (useBackendWrite) {
          handleBackendError(err, syncData);
          return { success: false, error: err };
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: err.message });
          return { success: false, error: err };
        }
      }
    },
    [showToast, router, syncData, leads]
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

