/**
 * backendFetch — thin wrapper around fetch that automatically injects
 * the Authorization Bearer token from the in-memory auth store.
 *
 * This is the ONLY place in the frontend that reads authStore.accessToken
 * for attaching to /api/backend/* requests.
 */

import { useAuthStore } from '@/store/authStore';

type BackendFetchInit = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
  idempotencyKey?: string;
  requestId?: string;
};

function getAuthHeaders(extra: BackendFetchInit): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Grab the in-memory access token (never persisted to localStorage)
  const token = useAuthStore.getState().accessToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (extra.idempotencyKey) {
    headers['idempotency-key'] = extra.idempotencyKey;
  }
  if (extra.requestId) {
    headers['x-request-id'] = extra.requestId;
  }

  return headers;
}

export async function backendFetch<T = unknown>(
  url: string,
  opts: BackendFetchInit = {},
): Promise<T> {
  const method = opts.method || 'GET';
  const headers = getAuthHeaders(opts);

  const fetchOpts: RequestInit = { method, headers };
  if (opts.body !== undefined && method !== 'GET') {
    fetchOpts.body = JSON.stringify(opts.body);
  }

  let res = await fetch(url, fetchOpts);

  // If 401 — attempt silent token refresh once, then retry
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders = getAuthHeaders(opts);
      const retryOpts: RequestInit = { method, headers: retryHeaders };
      if (opts.body !== undefined && method !== 'GET') {
        retryOpts.body = JSON.stringify(opts.body);
      }
      res = await fetch(url, retryOpts);
    }
  }

  // If still 401, or 403 Forbidden, force logout by clearing token
  if (res.status === 401 || res.status === 403) {
    useAuthStore.getState().logout?.();
  }

  const responseText = await res.text();
  let envelope: any;

  if (responseText) {
    try {
      envelope = JSON.parse(responseText);
    } catch {
      console.error('Invalid JSON returned by backend bridge', {
        url,
        status: res.status,
        response: responseText.slice(0, 1000),
      });
      const error = new Error(`Invalid JSON returned by backend bridge (${res.status})`);
      (error as any).status = res.status;
      throw error;
    }
  }

  if (!res.ok) {
    const error = new Error(envelope?.message || `Request failed: ${res.status}`);
    (error as any).status = res.status;
    (error as any).code = envelope?.code;
    throw error;
  }

  if (!responseText) {
    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }
    throw new Error(`Empty response returned by backend bridge (${res.status})`);
  }

  if (envelope && !envelope.success) {
    throw new Error(envelope.message || 'Operation failed.');
  }

  return (envelope?.data ?? envelope) as T;
}

export async function ensureAccessToken(): Promise<string | null> {
  const current = useAuthStore.getState().accessToken;
  if (current) return current;
  return (await tryRefreshToken()) ? useAuthStore.getState().accessToken : null;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/backend/auth/refresh', { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      const newToken = json.data?.accessToken;
      if (newToken) {
        useAuthStore.getState().setAccessToken(newToken);
        return true;
      }
    }
  } catch {
    // Silently fail — caller will handle the 401
  }
  return false;
}
