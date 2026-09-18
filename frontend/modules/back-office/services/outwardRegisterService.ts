import { backendFetch } from '@/lib/backendFetch';

/**
 * OUTWARD REGISTER — BACK OFFICE MANUAL REGISTER SERVICE
 *
 * 100% manual register. Zero derivation or side-effects with core ERP modules.
 */

export interface OutwardRegisterQuery {
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  transporterName?: string;
  salesPerson?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number | string;
  exportAll?: boolean;
}

export interface OutwardRegisterEntryDto {
  id?: string;
  srNo?: number;
  outwardDate: string;
  transporterName: string;
  vehicleNo?: string;
  material: string;
  quantity: number | string;
  partyName: string;
  salesPerson?: string;
  invoiceNo?: string;
  receivingManually?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchOutwardRegisterEntries(params: OutwardRegisterQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/back-office/outward-register${queryString ? `?${queryString}` : ''}`;
  return backendFetch(endpoint);
}

export async function createOutwardRegisterEntry(data: OutwardRegisterEntryDto) {
  return backendFetch('/back-office/outward-register', {
    method: 'POST',
    body: data,
  });
}

export async function updateOutwardRegisterEntry(id: string, data: Partial<OutwardRegisterEntryDto>) {
  return backendFetch(`/back-office/outward-register/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function archiveOutwardRegisterEntry(id: string) {
  return backendFetch(`/back-office/outward-register/${id}`, {
    method: 'DELETE',
  });
}
