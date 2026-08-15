import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;

  return forwardBackendRequest({
    token,
    path: '/sales/reminders/daily',
    method: 'GET',
    query: url.searchParams,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
