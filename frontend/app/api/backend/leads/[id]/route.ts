import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';
import { bridgePolicies } from '@/lib/server/backendBridgePolicy';

function extractToken(req: import("next/server").NextRequest): string | undefined {
  const a = req.headers.get('Authorization');
  return a ? a.split(' ')[1] : undefined;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = encodeURIComponent(id);

  return forwardBackendRequest({
    path: `/leads/${safeId}`,
    method: 'GET',
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = encodeURIComponent(id);

  const policy = bridgePolicies.updateLead;
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
    path: `/leads/${safeId}`,
    method: 'PATCH',
    body,
    idempotencyKey: idempotencyKey!,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = encodeURIComponent(id);

  const policy = bridgePolicies.deleteLead;
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

  return forwardBackendRequest({
    path: `/leads/${safeId}`,
    method: 'DELETE',
    idempotencyKey: idempotencyKey!,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
