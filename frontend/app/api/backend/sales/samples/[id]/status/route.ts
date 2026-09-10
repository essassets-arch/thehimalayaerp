import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token =
    authHeader?.replace(/^Bearer\s+/i, '') ||
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('himalaya_token')?.value;
  const idempotencyKey = request.headers.get('Idempotency-Key') || request.headers.get('idempotency-key');

  const body = await request.json().catch(() => ({}));

  return forwardBackendRequest({
    token,
    path: `/sales/samples/${id}/status`,
    method: 'POST',
    body,
    headers: {
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...(request.headers.get('x-company-id') ? { 'x-company-id': request.headers.get('x-company-id')! } : {}),
    },
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
