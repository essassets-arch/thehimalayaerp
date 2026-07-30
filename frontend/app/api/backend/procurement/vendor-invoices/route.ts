import { NextRequest } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

async function handler(request: NextRequest) {
  const body = request.method === 'GET' ? undefined : await request.json().catch(() => undefined);
  return forwardBackendRequest({
    path: '/procurement/vendor-invoices',
    method: request.method as any,
    body,
    query: request.nextUrl.searchParams,
    token: request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
    idempotencyKey: request.headers.get('idempotency-key') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
