'use client';

/**
 * useSamples — Sample operations for components.
 */
import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP } from '../../../shared/context/ERPContext.jsx';
import { samplesService } from '../services/samples.service.js';

/**
 * @param {Function} showToast
 */
export function useSamples(showToast) {
  const { state, syncData } = useERP();
  const navigate = useRouter();

  const samples = state.sales?.samples || [];

  /** Update a sample's workflow status. */
  const updateSampleStatus = useCallback(
    async (sampleId, status) => {
      const res = await samplesService.updateStatus(sampleId, status);
      if (res.success) {
        showToast(`Sample status set to ${status}`);
        await syncData();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
      }
    },
    [showToast, syncData]
  );

  /** Save edited sample details. */
  const updateSample = useCallback(
    async (sampleId, updatedData) => {
      const res = await samplesService.update(sampleId, updatedData);
      if (res.success) {
        showToast('Sample details updated successfully.');
        await syncData();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
      }
    },
    [showToast, syncData]
  );

  /** Create a replacement sample request. */
  const createReplacementSample = useCallback(
    async (sample) => {
      const res = await samplesService.create({
        customer_id: sample.customer_id,
        product_id: sample.product_id,
        quantity: sample.quantity,
        status: 'Requested',
        plant_approval_notes: JSON.stringify({
          testing_parameters: sample.testing_parameters || '',
          shipping_address: sample.shipping_address || '',
          transporter: sample.transporter || '',
          remarks: `Replacement for Sample ${sample.sample_number || sample.id}`
        })
      });
      if (res.success) {
        showToast('Replacement sample requested successfully.');
        await syncData();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
      }
    },
    [showToast, syncData]
  );

  return {
    samples,
    updateSampleStatus,
    updateSample,
    createReplacementSample
  };
}
