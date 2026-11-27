import { NextRequest, NextResponse } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const method = request.method as 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  const authorization = request.headers.get('authorization');
  const requestedPath = `/${path.join('/')}`;

  // Keep older Dispatch dashboard bundles working after API alias promotions
  const backendPathAliases: Record<string, string> = {
    '/employees': '/hr/employees',
    '/logistics/dispatches/replacements': '/replacements',
    '/logistics/dispatches/remaining': '/logistics/dispatches',
    '/sales/sales-returns': '/sales-returns',
    '/reports/inventory/stock-levels': '/inventory/stock-levels',
    '/store/material-requests': '/material-requests',
    '/v1/plant-head/qc-failures': '/plant-head/qc-failures',
    '/brand-analysis-requests': '/brand-analysis/my-requests',
    '/purchase-orders': '/procurement/purchase-orders',
    '/store/deliveries/verify': '/procurement/store/deliveries/verify',
  };
  
  let finalMethod = method;
  let backendPath = backendPathAliases[requestedPath] || requestedPath;

  if (backendPath.startsWith('/backend/backend/')) {
    backendPath = backendPath.replace('/backend/backend/', '/backend/');
  }

  if (backendPath.startsWith('/api/')) {
    backendPath = backendPath.replace(/^\/api\//, '/');
  }

  if (backendPath.startsWith('/backend/sales-targets')) {
    backendPath = backendPath.replace('/backend/sales-targets', '/sales-targets');
  } else if (backendPath.startsWith('/backend/production-targets')) {
    backendPath = backendPath.replace('/backend/production-targets', '/production-targets');
  } else if (backendPath.startsWith('/backend/dispatch-targets')) {
    backendPath = backendPath.replace('/backend/dispatch-targets', '/dispatch-targets');
  } else if (backendPath.startsWith('/backend/users')) {
    backendPath = backendPath.replace('/backend/users', '/users');
  } else if (backendPath.startsWith('/admin/companies')) {
    backendPath = backendPath.replace('/admin/companies', '/super-admin/companies');
  } else if (backendPath.startsWith('/admin/users')) {
    backendPath = backendPath.replace('/admin/users', '/users');
  } else if (backendPath.startsWith('/admin/employees')) {
    backendPath = backendPath.replace('/admin/employees', '/hr/employees');
    if (finalMethod === 'PUT') finalMethod = 'PATCH';
  } else if (backendPath.startsWith('/employees')) {
    backendPath = backendPath.replace('/employees', '/hr/employees');
  } else if (backendPath.startsWith('/admin/roles')) {
    backendPath = backendPath.replace('/admin/roles', '/super-admin/roles');
  }

  const contentType = request.headers.get('content-type') || '';
  let body = method === 'GET' || method === 'DELETE'
    ? undefined
    : contentType.includes('multipart/form-data')
      ? await request.formData()
      : await request.json().catch(() => undefined);

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // keep raw string
    }
  }

  const cookieToken =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('himalaya_token')?.value;
  // Never accept JWTs in URL query strings (?token=)
  const token =
    authorization?.replace(/^Bearer\s+/i, '') ||
    cookieToken;

  const clientRole = decodeURIComponent(request.cookies.get('role')?.value || '').toUpperCase();
  const isSuperAdminRole = clientRole.includes('SUPER_ADMIN') || clientRole.includes('SUPERADMIN') || clientRole === 'ADMIN';

  console.log(`[NEXT_API_PROXY] ${method} ${requestedPath} -> NestJS: ${backendPath}`);

  try {
    const res = await forwardBackendRequest({
      path: backendPath,
      method: finalMethod,
      body,
      query: request.nextUrl?.searchParams || new URL(request.url).searchParams,
      token,
      idempotencyKey: request.headers.get('idempotency-key') || undefined,
      requestId: request.headers.get('x-request-id') || undefined,
      headers: {
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
        ...(isSuperAdminRole && request.headers.get('x-company-id') ? { 'x-company-id': request.headers.get('x-company-id')! } : {}),
        ...(request.headers.get('x-forwarded-for') ? { 'x-forwarded-for': request.headers.get('x-forwarded-for')! } : {}),
        ...(request.headers.get('x-real-ip') ? { 'x-real-ip': request.headers.get('x-real-ip')! } : {}),
        ...(request.headers.get('user-agent') ? { 'user-agent': request.headers.get('user-agent')!, 'x-client-user-agent': request.headers.get('user-agent')! } : {}),
      }
    });
    console.log(`[NEXT_API_PROXY_SUCCESS] ${method} ${requestedPath} -> NestJS: ${backendPath} - Status: ${res.status}`);
    return res;
  } catch (err: any) {
    console.error(`[NEXT_API_PROXY_ERROR] ${method} ${requestedPath} -> NestJS: ${backendPath}:`, err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Upstream backend service error.',
        code: 'BACKEND_PROXY_ERROR',
      },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const PUT = proxy;
