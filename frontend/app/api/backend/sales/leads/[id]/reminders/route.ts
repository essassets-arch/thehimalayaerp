import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const idempotencyKey = request.headers.get('Idempotency-Key');

  const body = await request.json().catch(() => ({}));

  return forwardBackendRequest({
    token,
    path: `/sales/leads/${id}/reminders`,
    method: 'POST',
    body,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
