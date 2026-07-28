'use client';

/**
 * useSamples — Sample operations for components.
 */
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useSalesBackend } from '../../../shared/context/ERPContext.jsx';

/**
 * @param {Function} showToast
 */
export function useSamples(showToast) {
  const { 
    samples, 
    samplesPagination, 
    loading: { samples: loadingSamples }, 
    refreshSamples, 
    createSample, 
    updateSample: backendUpdateSample, 
    updateSampleStatus: backendUpdateStatus 
  } = useSalesBackend();
  const navigate = useRouter();

  /** Update a sample's workflow status. */
  const updateSampleStatus = useCallback(
    async (sampleId, status, expectedVersion) => {
      try {
        await backendUpdateStatus(sampleId, status, expectedVersion);
        showToast(`Sample status set to ${status}`);
        await refreshSamples();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error?.message || String(error) });
      }
    },
    [showToast, refreshSamples, backendUpdateStatus]
  );

  /** Save edited sample details. */
  const updateSample = useCallback(
    async (sampleId, updatedData) => {
      try {
        await backendUpdateSample(sampleId, updatedData);
        showToast('Sample details updated successfully.');
        await refreshSamples();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error?.message || String(error) });
      }
    },
    [showToast, refreshSamples, backendUpdateSample]
  );

  /** Create a replacement sample request. */
  const createReplacementSample = useCallback(
    async (sample) => {
      try {
        await createSample({
          customerId: sample.customerId || sample.customer_id,
          expectedDeliveryDate: null,
          items: [{
            productId: sample.productId || sample.product_id || sample.items?.[0]?.productId,
            quantity: sample.quantity || sample.items?.[0]?.quantity,
            specifications: `Replacement for Sample ${sample.sampleNumber || sample.id}`
          }]
        });
        showToast('Replacement sample requested successfully.');
        await refreshSamples();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error?.message || String(error) });
      }
    },
    [showToast, refreshSamples, createSample]
  );

  return {
    samples,
    samplesPagination,
    loadingSamples,
    updateSampleStatus,
    updateSample,
    createReplacementSample
  };
}
