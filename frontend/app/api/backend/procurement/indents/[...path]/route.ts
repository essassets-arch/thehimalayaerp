import { NextRequest } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

async function forward(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  const body = request.method === 'GET' ? undefined : await request.json().catch(() => undefined);
  return forwardBackendRequest({ path: `/procurement/indents/${path.join('/')}`, method: request.method as any, body, query: request.nextUrl.searchParams, token: request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''), idempotencyKey: request.headers.get('idempotency-key') || undefined, requestId: request.headers.get('x-request-id') || undefined, headers: request.headers.get('if-match') ? { 'If-Match': request.headers.get('if-match')! } : undefined });
}
export const GET = forward; export const POST = forward; export const PATCH = forward;
