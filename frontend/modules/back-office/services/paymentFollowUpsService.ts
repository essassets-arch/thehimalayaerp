import { backendFetch } from '@/lib/backendFetch';

/**
 * PAYMENT FOLLOW UPS — BACK OFFICE MANUAL REGISTER SERVICE
 *
 * 100% manual register. Zero derivation or side-effects with core ERP modules.
 */

export interface PaymentFollowUpsQuery {
  search?: string;
  salesPerson?: string;
  minAmount?: number | string;
  maxAmount?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number | string;
  exportAll?: boolean;
}

export interface PaymentFollowUpEntryDto {
  id?: string;
  srNo?: number;
  partyName: string;
  duePaymentAmount: number | string;
  salesPerson?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchPaymentFollowUpEntries(params: PaymentFollowUpsQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/back-office/payment-follow-ups${queryString ? `?${queryString}` : ''}`;
  return backendFetch(endpoint);
}

export async function createPaymentFollowUpEntry(data: PaymentFollowUpEntryDto) {
  return backendFetch('/back-office/payment-follow-ups', {
    method: 'POST',
    body: data,
  });
}

export async function updatePaymentFollowUpEntry(id: string, data: Partial<PaymentFollowUpEntryDto>) {
  return backendFetch(`/back-office/payment-follow-ups/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function archivePaymentFollowUpEntry(id: string) {
  return backendFetch(`/back-office/payment-follow-ups/${id}`, {
    method: 'DELETE',
  });
}
