import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';
import { bridgePolicies } from '@/lib/server/backendBridgePolicy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const policy = bridgePolicies.checkCustomerDuplicates;
  const body = await request.json();

  return forwardBackendRequest({
    token,
    path: '/customers/check-duplicates',
    method: 'POST',
    body,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
