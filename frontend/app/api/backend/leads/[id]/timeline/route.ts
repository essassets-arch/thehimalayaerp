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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = encodeURIComponent(id);

  const policy = bridgePolicies.leadTimeline;

  return forwardBackendRequest({
    token: extractToken(request),
    path: `/leads/${safeId}/timeline`,
    method: 'GET',
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
