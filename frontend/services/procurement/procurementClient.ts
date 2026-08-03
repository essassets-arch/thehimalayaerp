import { useAuthStore } from '../../store/authStore';
import { ensureAccessToken } from '../../lib/backendFetch';

export type ProcurementApiError = {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
};

export class ProcurementError extends Error implements ProcurementApiError {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ProcurementError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'req-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
};

export async function procurementRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
  options?: {
    query?: Record<string, any>;
    idempotencyKey?: string;
    version?: number;
    signal?: AbortSignal;
  }
): Promise<T> {
  let url = `/api/backend/procurement/${path}`;
  if (options?.query) {
    const qParams = new URLSearchParams();
    Object.entries(options.query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        qParams.append(k, String(v));
      }
    });
    const queryString = qParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': generateUUID(),
  };

  if (method !== 'GET') {
    headers['Idempotency-Key'] = options?.idempotencyKey || generateUUID();
  }

  if (options?.version !== undefined) {
    headers['If-Match'] = String(options.version);
  }

  // The access token lives in memory only (never persisted to sessionStorage/localStorage).
  // Ensure access token is loaded/refreshed before sending request.
  let token = typeof window !== 'undefined' ? (useAuthStore.getState().accessToken || (await ensureAccessToken())) : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody = body;
  if (options?.version !== undefined && requestBody && typeof requestBody === 'object') {
    requestBody = { ...(requestBody as any), version: options.version };
  }

  let response = await fetch(url, {
    method,
    headers,
    body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
    signal: options?.signal,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshedToken = await ensureAccessToken();
    if (refreshedToken) {
      headers.Authorization = `Bearer ${refreshedToken}`;
      response = await fetch(url, {
        method,
        headers,
        body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
        signal: options?.signal,
      });
    }
    if (response.status === 401) {
      useAuthStore.getState().logout?.();
    }
  }

  let payload: any;
  const rawText = await response.text();
  try {
    payload = JSON.parse(rawText);
  } catch (e) {
    payload = {};
  }

  if (!response.ok) {
    const errorMsg = payload?.error?.message || payload?.message || `Procurement request failed (${response.status})`;
    const errorCode = payload?.error?.code || payload?.code || String(response.status);
    console.warn(`[procurementRequest] Request to "${path}" returned status ${response.status}: ${errorMsg}`);
    throw new ProcurementError(
      response.status,
      errorMsg,
      errorCode,
      payload?.error?.details || payload?.details || payload
    );
  }

  return payload.data !== undefined ? payload.data : payload;
}
