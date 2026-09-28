import { NextRequest } from 'next/server';
import '@/lib/server/backendFeatureConfig';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;

  return forwardBackendRequest({
    token,
    path: `/crm/quotations/${resolvedParams.id}`,
    method: 'GET',
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('himalaya_token')?.value;
  const body = await request.json();

  return forwardBackendRequest({
    token,
    path: `/crm/quotations/${id}`,
    method: 'PATCH',
    body,
    idempotencyKey: request.headers.get('idempotency-key') ?? undefined,
    requestId: request.headers.get('x-request-id') ?? undefined,
    headers: {
      ...(request.headers.get('x-company-id') ? { 'x-company-id': request.headers.get('x-company-id')! } : {}),
    },
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const url = new URL(request.url);
  const reason = url.searchParams.get('reason') || '';

  return forwardBackendRequest({
    token,
    path: `/crm/quotations/${resolvedParams.id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`,
    method: 'DELETE',
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}
