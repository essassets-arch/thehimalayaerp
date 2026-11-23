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
    path: `/sales/orders/${encodeURIComponent(resolvedParams.id)}`,
    method: 'GET',
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const idempotencyKey = request.headers.get('Idempotency-Key') || request.headers.get('idempotency-key');
  const body = await request.json().catch(() => ({}));

  return forwardBackendRequest({
    token,
    path: `/sales/orders/${encodeURIComponent(resolvedParams.id)}`,
    method: 'PATCH',
    body,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PATCH(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const url = new URL(request.url);
  const reason = url.searchParams.get('reason') || '';

  return forwardBackendRequest({
    token,
    path: `/sales/orders/${encodeURIComponent(resolvedParams.id)}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`,
    method: 'DELETE',
    requestId: request.headers.get('x-request-id') ?? undefined,
  });
}

