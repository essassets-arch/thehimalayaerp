import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('Authorization');
  return authHeader ? authHeader.split(' ')[1] : undefined;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const safeId = encodeURIComponent(id);
  const idempotencyKey = request.headers.get('idempotency-key') || request.headers.get('Idempotency-Key');
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));

  return forwardBackendRequest({
    token: extractToken(request),
    path: `/sales/leads/${safeId}/delete`,
    method: 'POST',
    body,
    query: url.searchParams,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
