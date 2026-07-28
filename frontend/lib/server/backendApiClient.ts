import 'server-only';
import crypto from 'crypto';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';

function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

export type ForwardBackendRequestOptions = {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
  query?: URLSearchParams;
  idempotencyKey?: string;
  requestId?: string;
  token?: string;
};

export async function forwardBackendRequest(
  options: ForwardBackendRequestOptions,
): Promise<Response> {
  const { path, method, body, query, idempotencyKey, requestId: incomingRequestId, token } = options;

  const requestId = isValidUuid(incomingRequestId) ? incomingRequestId! : crypto.randomUUID();

  const makeAttempt = async () => {
    const url = new URL(BACKEND_API_URL + (path.startsWith('/') ? path : '/' + path));
    if (query) {
      query.forEach((val, key) => {
        url.searchParams.append(key, val);
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    };

    if (idempotencyKey) {
      headers['idempotency-key'] = idempotencyKey;
    }

    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body !== undefined && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const res = await fetch(url.toString(), fetchOptions);
      return { res, timeout };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  try {
    const { res, timeout } = await makeAttempt();
    clearTimeout(timeout);
    return res;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'AbortError') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Backend request timed out.',
          code: 'TIMEOUT',
        }),
        {
          status: 504,
          headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: (err as Error).message || 'Backend service unavailable.',
        code: 'SERVICE_UNAVAILABLE',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
      },
    );
  }
}
