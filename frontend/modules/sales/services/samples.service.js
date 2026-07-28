/**
 * Samples Service — Business logic for the Samples feature.
 */
import { samplesRepository } from '../api/sales.repository.js';
import { ERPSuccess, ERPError } from '../../../engine/utils/errors.js';

export const samplesService = {
  /**
   * Update a sample's status (e.g. "Approved", "Rejected", "Dispatched").
   */
  updateStatus: async (sampleId, status) => {
    try {
      const data = await samplesRepository.update(sampleId, { status });
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },

  /**
   * Create a new sample request.
   */
  create: async (sampleData) => {
    
    try {
      const data = await samplesRepository.create(sampleData);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'CREATE_ERROR');
    }
  },

  /**
   * Update full sample details (edit form submission).
   */
  update: async (sampleId, updatedData) => {
    try {
      const data = await samplesRepository.update(sampleId, updatedData);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },
};
