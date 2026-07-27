import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';
import { bridgePolicies } from '@/lib/server/backendBridgePolicy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

function extractToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('Authorization');
  return authHeader ? authHeader.split(' ')[1] : undefined;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = encodeURIComponent(id);

  const policy = bridgePolicies.restoreCustomer;
  const idempotencyKey = request.headers.get('idempotency-key');

  if (policy.requireIdempotencyKey && !isValidUuid(idempotencyKey)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'A valid UUID Idempotency-Key header is required for this operation.',
        code: 'BAD_REQUEST',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await request.json();
  return forwardBackendRequest({
    token: extractToken(request),
    path: `/customers/${safeId}/restore`,
    method: 'POST',
    body,
    idempotencyKey: idempotencyKey!,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
