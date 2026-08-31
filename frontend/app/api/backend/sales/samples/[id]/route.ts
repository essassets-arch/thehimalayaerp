import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;

  return forwardBackendRequest({
    token,
    path: `/sales/samples/${id}`,
    method: 'GET',
    query: url.searchParams,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const idempotencyKey = request.headers.get('Idempotency-Key');

  const body = await request.json().catch(() => ({}));

  return forwardBackendRequest({
    token,
    path: `/sales/samples/${id}`,
    method: 'PATCH',
    body,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
