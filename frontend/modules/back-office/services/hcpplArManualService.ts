import { backendFetch } from '@/lib/backendFetch';

/**
 * HCPPL AR Manual Register Service
 *
 * Dedicated manual entry service for Back Office.
 * Communicates with /back-office/hcppl-ar/manual endpoints.
 */

export interface HcpplArManualQuery {
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  managementStatus?: string;
  ageingBucket?: string;
  dueStatus?: string;
  paymentStatus?: string;
  salesPerson?: string;
  salesType?: string;
  page?: number;
  limit?: number;
  exportAll?: boolean;
}

export interface HcpplArManualEntryDto {
  id?: string;
  invoiceNo: string;
  invoiceDate: string;
  basicAmount: number | string;
  invoiceGstAmount: number | string;
  partyName: string;
  siteName?: string;
  salesType?: string;
  salesPerson?: string;
  paymentTerm?: string;
  ageingDays?: number | string | null;
  managementStatus: 'MGMT' | 'NMGMT';
  ageingBucket: '7 DAYS' | '30 DAYS' | 'MANUALLY';
  dueStatus: 'DUE' | 'YET TO DUE' | 'DUE DAYS';
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTLY PAID' | 'CANCELLED';
}

export async function fetchHcpplArManualEntries(params: HcpplArManualQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/back-office/hcppl-ar/manual${queryString ? `?${queryString}` : ''}`;
  return backendFetch(endpoint);
}

export async function createHcpplArManualEntry(data: HcpplArManualEntryDto) {
  return backendFetch('/back-office/hcppl-ar/manual', {
    method: 'POST',
    body: data,
  });
}

export async function updateHcpplArManualEntry(id: string, data: Partial<HcpplArManualEntryDto>) {
  return backendFetch(`/back-office/hcppl-ar/manual/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function archiveHcpplArManualEntry(id: string) {
  return backendFetch(`/back-office/hcppl-ar/manual/${id}`, {
    method: 'DELETE',
  });
}
