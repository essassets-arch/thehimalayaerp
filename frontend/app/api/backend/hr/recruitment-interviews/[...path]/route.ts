import { NextRequest } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const method = request.method as 'GET' | 'POST' | 'PATCH';
  const body = method === 'GET' ? undefined : await request.json().catch(() => undefined);
  return forwardBackendRequest({
    path: `/hr/recruitment-interviews/${path.join('/')}`,
    method,
    query: new URL(request.url).searchParams,
    body,
    token: request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
    idempotencyKey: request.headers.get('idempotency-key') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
