import { backendFetch } from '@/lib/backendFetch';

/**
 * SAMPLE TRACKER — BACK OFFICE MANUAL REGISTER SERVICE
 *
 * 100% manual register. Zero derivation or side-effects with core ERP modules.
 */

export interface SampleTrackerQuery {
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  status?: string;
  transportMode?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number | string;
  exportAll?: boolean;
}

export interface SampleTrackerEntryDto {
  id?: string;
  srNo?: number;
  dispatchDate: string;
  partyName: string;
  station?: string;
  contactPerson?: string;
  contactNumber?: string;
  sampleDetails?: string;
  referancePerson?: string;
  referaceNumber?: string;
  materialManually?: string;
  transportMode: 'BY HAND' | 'AIR' | 'BUS' | 'DELIVERY' | 'CONTAINER' | 'TRANSPORT' | string;
  transportAmount: number | string;
  status: 'SAMPLE GIVEN' | 'APPROVAL AWAITED' | 'APPROVED' | 'REJECTED' | 'ORDER RECEIVED' | string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchSampleTrackerEntries(params: SampleTrackerQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/back-office/sample-tracker${queryString ? `?${queryString}` : ''}`;
  return backendFetch(endpoint);
}

export async function createSampleTrackerEntry(data: SampleTrackerEntryDto) {
  return backendFetch('/back-office/sample-tracker', {
    method: 'POST',
    body: data,
  });
}

export async function updateSampleTrackerEntry(id: string, data: Partial<SampleTrackerEntryDto>) {
  return backendFetch(`/back-office/sample-tracker/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function archiveSampleTrackerEntry(id: string) {
  return backendFetch(`/back-office/sample-tracker/${id}`, {
    method: 'DELETE',
  });
}
