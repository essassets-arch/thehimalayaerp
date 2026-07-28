import { NextRequest } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const method = request.method as 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  const authorization = request.headers.get('authorization');
  const body = method === 'GET' || method === 'DELETE'
    ? undefined
    : await request.json().catch(() => undefined);

  return forwardBackendRequest({
    path: `/${path.join('/')}`,
    method,
    body,
    query: new URL(request.url).searchParams,
    token: authorization?.replace(/^Bearer\s+/i, ''),
    idempotencyKey: request.headers.get('idempotency-key') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const PUT = proxy;
