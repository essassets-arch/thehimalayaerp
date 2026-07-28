import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';
import { bridgePolicies } from '@/lib/server/backendBridgePolicy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const url = new URL(request.url);

  return forwardBackendRequest({
    token,
    path: '/customers/check-duplicates',
    method: 'GET',
    query: url.searchParams,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
