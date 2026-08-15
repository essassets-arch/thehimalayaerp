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
  body?: unknown | FormData;
  idempotencyKey?: string;
  requestId?: string;
  cacheTtlMs?: number;
};

const pendingReads = new Map<string, Promise<unknown>>();
const readCache = new Map<string, { data: unknown; expiresAt: number }>();

function getAuthHeaders(extra: BackendFetchInit): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!(extra.body instanceof FormData)) headers['Content-Type'] = 'application/json';

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

async function performBackendFetch<T = unknown>(
  url: string,
  opts: BackendFetchInit = {},
): Promise<T> {
  const targetUrl = (url.startsWith('/') && !url.startsWith('/api/backend'))
    ? `/api/backend${url}`
    : url;
  const method = opts.method || 'GET';
  const headers = getAuthHeaders(opts);

  const fetchOpts: RequestInit = { method, headers };
  if (opts.body !== undefined && method !== 'GET') {
    fetchOpts.body = opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body);
  }

  let res = await fetch(targetUrl, fetchOpts);

  // Development backend restarts can briefly interrupt the Next.js bridge.
  // Retry only safe read requests and keep write operations single-attempt.
  if (method === 'GET') {
    const retryDelays = [300, 700];
    for (const delay of retryDelays) {
      if (![502, 503, 504].includes(res.status)) break;
      await new Promise((resolve) => setTimeout(resolve, delay));
      res = await fetch(url, fetchOpts);
    }
  }

  // If 401 — attempt silent token refresh once, then retry
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders = getAuthHeaders(opts);
      const retryOpts: RequestInit = { method, headers: retryHeaders };
      if (opts.body !== undefined && method !== 'GET') {
        retryOpts.body = opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body);
      }
      res = await fetch(url, retryOpts);
    }
  }

  // If still 401, force logout by clearing token, wiping cache & redirecting to login
  if (res.status === 401) {
    readCache.clear();
    pendingReads.clear();
    useAuthStore.getState().logout?.();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
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
    const message = Array.isArray(envelope?.message)
      ? envelope.message.join(", ")
      : envelope?.error?.message ||
        envelope?.message ||
        envelope?.error ||
        `Request failed with status ${res.status}`;

    const error = new Error(message) as Error & {
      status?: number;
      details?: unknown;
      code?: string;
      field?: string;
    };

    error.status = res.status;
    error.code = envelope?.error?.code || envelope?.code;
    error.details = envelope?.error?.details || envelope; // Attach the full envelope as details for logging
    error.field = envelope?.error?.field;

    if (process.env.NODE_ENV !== 'production') {
      console.error('[backendFetch] Request failed', {
        method,
        url: targetUrl,
        status: res.status,
        response: envelope,
      });
    }

    throw error;
  }

  if (!responseText) {
    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }
    throw new Error(`Empty response returned by backend bridge (${res.status})`);
  }

  if (envelope && !envelope.success) {
    throw new Error(envelope?.error?.message || envelope.message || 'Operation failed.');
  }

  return (envelope?.data ?? envelope) as T;
}

export function backendFetch<T = unknown>(
  url: string,
  opts: BackendFetchInit = {},
): Promise<T> {
  const method = opts.method || 'GET';
  if (method !== 'GET') {
    readCache.clear();
    return performBackendFetch<T>(url, opts);
  }

  const cacheTtlMs = opts.cacheTtlMs ?? 30_000;
  const cached = readCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data as T);
  }
  if (cached) readCache.delete(url);

  const existing = pendingReads.get(url);
  if (existing) return existing as Promise<T>;

  const request = performBackendFetch<T>(url, opts)
    .then((data) => {
      if (cacheTtlMs > 0) {
        readCache.set(url, { data, expiresAt: Date.now() + cacheTtlMs });
      }
      return data;
    })
    .finally(() => {
      pendingReads.delete(url);
    });
  pendingReads.set(url, request);
  return request;
}

export async function ensureAccessToken(): Promise<string | null> {
  const current = useAuthStore.getState().accessToken;
  if (current) return current;
  return (await tryRefreshToken()) ? useAuthStore.getState().accessToken : null;
}

let refreshingPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const current = useAuthStore.getState().accessToken;
  if (current?.startsWith('demo-token-')) {
    return false;
  }

  if (refreshingPromise) {
    return refreshingPromise;
  }

  refreshingPromise = (async () => {
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
      // Silently fail
    } finally {
      refreshingPromise = null;
    }
    return false;
  })();

  return refreshingPromise;
}
