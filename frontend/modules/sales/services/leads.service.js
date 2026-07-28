/**
 * Leads Service — Business logic for the Leads feature.
 *
 * Rules:
 *  - Uses leadsRepository for HTTP.
 *  - Returns { success, data } or { success: false, error }.
 *  - Never touches React state directly — callers own state.
 */
import { leadsRepository, samplesRepository, quotationsRepository } from '../api/sales.repository.js';
import { ERPSuccess, ERPError } from '../../../engine/utils/errors.js';

export const leadsService = {
  /**
   * Fetch all leads.
   */
  fetchAll: async () => {
    try {
      const data = await leadsRepository.getAll();
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'FETCH_ERROR');
    }
  },

  /**
   * Register a new lead.
   * If `autoGenerateQuotation` is true, also creates a linked quotation.
   */
  create: async (leadData) => {
    const { autoGenerateQuotation, quotationData, ...leadOnlyData } = leadData;
    try {
      const result = await leadsRepository.create(leadOnlyData);

      if (result && result.success === false && result.duplicateLead) {
        return {
          success: false,
          duplicateLead: true,
          leadNo: result.leadNo,
          leadId: result.leadId,
          customerName: result.customerName,
          status: result.status,
          message: result.message
        };
      }

      if (autoGenerateQuotation && quotationData) {
        try {
          await quotationsRepository.create(quotationData);
        } catch (quoteErr) {
          // Lead was created — report partial success, surface quotation warning
          return ERPSuccess(result, {
            warning: `Lead saved, but quotation failed: ${quoteErr.message}`,
            autoQuotationFailed: true,
          });
        }
      }

      return ERPSuccess(result, { autoGenerateQuotation: !!autoGenerateQuotation });
    } catch (err) {
      return ERPError(err.message, 'CREATE_ERROR');
    }
  },

  /**
   * Update lead status (e.g. "Lost", "Converted", "Active").
   * Appends a reason to notes when marking as Lost.
   */
  updateStatus: async (leadId, status, reason) => {
    const payload = { status };
    if (status === 'Lost' && reason) {
      payload.notes = `Marked Lost. Reason: ${reason}`;
      payload.lossReason = reason;
    }
    try {
      const data = await leadsRepository.update(leadId, payload);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },

  /**
   * Append a follow-up entry to the lead's timeline.
   */
  addFollowup: async (lead, text) => {
    const updatedTimeline = [
      ...(lead.timeline || []),
      {
        stage: 'Follow-up',
        text,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
      },
    ];
    try {
      const data = await leadsRepository.update(lead.id, {
        timeline: updatedTimeline,
        notes: text,
      });
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },

  /**
   * Convert a lead to a sample request.
   * Creates the sample then marks the lead as Converted.
   */
  convertToSample: async (lead, customDetails) => {
    try {
      const sample = await samplesRepository.create({
        leadId: lead.id,
        leadName: lead.companyName || customDetails?.leadName || lead.projectName || 'Lead Customer',
        customer: lead.companyName || customDetails?.leadName || lead.projectName || 'Lead Customer',
        product:
          customDetails?.product ||
          lead.productInterested ||
          lead.requirements ||
          'Sample Product',
        quantity: customDetails?.quantity || lead.estimatedQuantity || 1,
        products: customDetails?.products || [],
        transportationCost: Number(customDetails?.transportationCost ?? customDetails?.transportCost ?? lead.expectedTransportationCost ?? 0),
        transportCost: Number(customDetails?.transportationCost ?? customDetails?.transportCost ?? lead.expectedTransportationCost ?? 0),
        expectedDeliveryDate: customDetails?.expectedDeliveryDate || '',
        ...customDetails
      });

      return ERPSuccess(sample);
    } catch (err) {
      return ERPError(err.message, 'CONVERT_ERROR');
    }
  },

  /**
   * Update full lead details (edit form).
   */
  update: async (leadId, updatedData) => {
    try {
      const data = await leadsRepository.update(leadId, updatedData);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },

  /**
   * Soft-delete a lead with an optional reason.
   */
  remove: async (leadId, reason) => {
    try {
      const data = await leadsRepository.remove(leadId, reason);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'DELETE_ERROR');
    }
  },
};
