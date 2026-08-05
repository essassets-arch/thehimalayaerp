'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useSalesBackend } from '../../../shared/context/ERPContext.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';

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
  const { user } = useAuth();
  const router = useRouter();
  
  const {
    leads,
    leadsPagination,
    loading,
    errors,
    loadLeads,
    refreshLeads,
    createLead: backendCreateLead,
    updateLead: backendUpdateLead,
    qualifyLead: backendQualifyLead,
    addLeadFollowup: backendAddFollowup,
    addLeadReminder: backendAddReminder,
    markLeadLost: backendMarkLost,
    restoreLead: backendRestoreLead,
  } = useSalesBackend();

  const addLead = useCallback(
    async (newLeadData) => {
      if (showToast) showToast('Sales: Registering lead...');
      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await backendCreateLead(newLeadData, { idempotencyKey });
        if (showToast) showToast('Lead Created Successfully');
        await refreshLeads();
        router.push('/sales/leads');
        return result;
      } catch (err) {
        handleBackendError(err, refreshLeads);
        throw err;
      }
    },
    [showToast, router, refreshLeads, backendCreateLead]
  );

  const editLead = useCallback(
    async (leadId, updateData, expectedVersion) => {
      if (showToast) showToast('Sales: Updating lead...');
      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await backendUpdateLead(leadId, { ...updateData, expectedVersion }, { idempotencyKey });
        if (showToast) showToast('Lead Updated Successfully');
        await refreshLeads();
        return result;
      } catch (err) {
        handleBackendError(err, refreshLeads);
        throw err;
      }
    },
    [showToast, refreshLeads, backendUpdateLead]
  );

  const qualifyLead = useCallback(
    async (leadId, expectedVersion, remarks, qualificationStatus) => {
      if (showToast) showToast('Sales: Qualifying lead...');
      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await backendQualifyLead(leadId, { expectedVersion, remarks, qualificationStatus }, { idempotencyKey });
        if (showToast) showToast('Lead Qualified Successfully');
        await refreshLeads();
        return result;
      } catch (err) {
        handleBackendError(err, refreshLeads);
        throw err;
      }
    },
    [showToast, refreshLeads, backendQualifyLead]
  );

  const addFollowup = useCallback(
    async (leadId, expectedVersion, followupType, notes, nextActionAt) => {
      if (showToast) showToast('Sales: Adding follow-up...');
      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await backendAddFollowup(leadId, { followupType, notes, nextActionAt, expectedVersion }, { idempotencyKey });
        if (showToast) showToast('Follow-up Added Successfully');
        await refreshLeads();
        return result;
      } catch (err) {
        handleBackendError(err, refreshLeads);
        throw err;
      }
    },
    [showToast, refreshLeads, backendAddFollowup]
  );

  const addReminder = useCallback(
    async (leadId, expectedVersion, reminderAt, message) => {
      if (showToast) showToast('Sales: Adding reminder...');
      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await backendAddReminder(leadId, { reminderAt, message, expectedVersion }, { idempotencyKey });
        if (showToast) showToast('Reminder Added Successfully');
        await refreshLeads();
        return result;
      } catch (err) {
        handleBackendError(err, refreshLeads);
        throw err;
      }
    },
    [showToast, refreshLeads, backendAddReminder]
  );

  const markLost = useCallback(
    async (leadId, expectedVersion, lostReason) => {
      if (showToast) showToast('Sales: Marking lead as lost...');
      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await backendMarkLost(leadId, { lostReason, expectedVersion }, { idempotencyKey });
        if (showToast) showToast('Lead Marked Lost');
        await refreshLeads();
        return result;
      } catch (err) {
        handleBackendError(err, refreshLeads);
        throw err;
      }
    },
    [showToast, refreshLeads, backendMarkLost]
  );

  const restoreLead = useCallback(
    async (leadId, expectedVersion, remarks) => {
      if (showToast) showToast('Sales: Restoring lead...');
      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await backendRestoreLead(leadId, { remarks, expectedVersion }, { idempotencyKey });
        if (showToast) showToast('Lead Restored Successfully');
        await refreshLeads();
        return result;
      } catch (err) {
        handleBackendError(err, refreshLeads);
        throw err;
      }
    },
    [showToast, refreshLeads, backendRestoreLead]
  );

  const updateLeadStatus = useCallback(
    async (leadId, status, remarks, expectedVersion) => {
      if (status === 'Lost') {
        return markLost(leadId, expectedVersion, remarks);
      } else if (status === 'New') {
        return restoreLead(leadId, expectedVersion, remarks);
      } else {
        throw new Error(`Unsupported status update: ${status}`);
      }
    },
    [markLost, restoreLead]
  );

  // Return the new structure
  return {
    leads,
    leadsPagination,
    loading: loading?.leads,
    error: errors?.leads,
    loadLeads,
    refreshLeads,
    
    // Commands
    addLead,
    editLead,
    updateLead: editLead,
    qualifyLead,
    addFollowup,
    addReminder,
    markLost,
    deleteLead: markLost,
    restoreLead,
    updateLeadStatus,
    generateQuotationFromLead: (leadId) => router.push(`/sales/quotations/create?leadId=${leadId}`),
  };
}
