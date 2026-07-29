import { NextRequest } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

const forward = (request: NextRequest) => forwardBackendRequest({
  path: '/hr/recruitment-requests',
  method: request.method as 'GET' | 'POST',
  query: new URL(request.url).searchParams,
  body: request.method === 'POST' ? request.json() : undefined,
  token: request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
  idempotencyKey: request.headers.get('idempotency-key') || undefined,
  requestId: request.headers.get('x-request-id') || undefined,
});

export const GET = forward;
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => undefined);
  return forwardBackendRequest({
    path: '/hr/recruitment-requests', method: 'POST', body,
    token: request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
    idempotencyKey: request.headers.get('idempotency-key') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  });
}
