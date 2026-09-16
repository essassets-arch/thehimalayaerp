import { backendFetch } from '@/lib/backendFetch';

/**
 * Back Office AR Service
 * Purely additive, local-only reporting service for APPL AR and HCPPL AR sheets.
 */

// --- APPL AR Functions ---

export async function fetchApplArRegister(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/back-office/appl-ar${queryString ? `?${queryString}` : ''}`;
  return backendFetch(endpoint);
}

export async function createApplArInvoice(data) {
  return backendFetch('/back-office/appl-ar', {
    method: 'POST',
    body: data
  });
}

export async function updateApplArInvoice(id, data) {
  return backendFetch(`/back-office/appl-ar/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteApplArInvoice(id) {
  return backendFetch(`/back-office/appl-ar/${id}`, {
    method: 'DELETE'
  });
}

// --- HCPPL AR Functions ---

export async function fetchHcpplArSummary() {
  return backendFetch('/back-office/hcppl-ar');
}

export async function fetchHcpplArEntries(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/back-office/hcppl-ar/entries${queryString ? `?${queryString}` : ''}`;
  return backendFetch(endpoint);
}

export async function createHcpplArEntry(data) {
  return backendFetch('/back-office/hcppl-ar/entry', {
    method: 'POST',
    body: data
  });
}

export async function updateHcpplArEntry(id, data) {
  return backendFetch(`/back-office/hcppl-ar/entry/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteHcpplArEntry(id) {
  return backendFetch(`/back-office/hcppl-ar/entry/${id}`, {
    method: 'DELETE'
  });
}
