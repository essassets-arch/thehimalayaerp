import { NextRequest } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => undefined);
  return forwardBackendRequest({
    path: `/hr/recruitment-requests/${id}/pending`,
    method: 'POST',
    body,
    token: request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
    idempotencyKey: request.headers.get('idempotency-key') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  });
}
