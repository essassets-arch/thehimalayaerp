import { backendFetch } from '@/lib/backendFetch';

/**
 * Back Office Confirmed Dispatches Service
 * Read-only service for fetching confirmed deliveries for Dispatch 1 & Dispatch 2.
 */
export async function fetchConfirmedDispatches(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/back-office/dispatches${queryString ? `?${queryString}` : ''}`;

  return backendFetch(endpoint);
}
