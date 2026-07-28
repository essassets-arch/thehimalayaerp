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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const policy = bridgePolicies.listLeads;
  const url = new URL(request.url);

  return forwardBackendRequest({
    token,
    path: '/leads',
    method: 'GET',
    query: url.searchParams,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

export async function POST(request: NextRequest) {
  const policy = bridgePolicies.createLead;
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
    path: '/leads',
    method: 'POST',
    body,
    idempotencyKey: idempotencyKey!,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
