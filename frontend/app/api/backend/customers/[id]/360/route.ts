import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return forwardBackendRequest({
    token,
    path: `/customers/${encodeURIComponent(id)}/360`,
    method: 'GET',
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
