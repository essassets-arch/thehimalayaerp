import { NextRequest, NextResponse } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const method = request.method as 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  const authorization = request.headers.get('authorization');
  const requestedPath = `/${path.join('/')}`;

  // Keep older Dispatch dashboard bundles working after the replacement API
  // was promoted from the logistics namespace to its canonical endpoint.
  const backendPathAliases: Record<string, string> = {
    '/logistics/dispatches/replacements': '/replacements',
    '/reports/inventory/stock-levels': '/inventory/stock-levels',
    '/store/material-requests': '/material-requests',
  };
  const backendPath = backendPathAliases[requestedPath] || requestedPath;

  // Global in-memory state for sample dispatch so we can mock all actions
  const globalAny = global as any;
  if (!globalAny.mockDispatch) {
    globalAny.mockDispatch = {
      id: 'sample-dispatch-detail',
      dispatchNo: 'DISP-2026-000',
      status: 'IN_TRANSIT',
      isSubmitted: true,
      deliveryAddress: '123 Sample Street, Tech Park, Bangalore',
      totalWeight: 450.5,
      packageCount: 12,
      packageType: 'Pallets',
      transporterName: 'Express Logistics',
      driverName: 'Ramesh Kumar',
      driverPhone: '9876543210',
      vehicleNumber: 'KA-01-AB-1234',
      vehicleType: '10 Ton Lorry',
      currentLocation: 'Factory Gate',
      transitCondition: 'ON_SCHEDULE',
      createdAt: new Date().toISOString(),
      transitLogs: [],
      items: [
        {
          id: 'mock-item-1',
          quantity: 10,
          salesOrderItem: {
            productId: 'mock-prod-1',
            productNameSnapshot: 'Sample Product A',
            unit: 'BOX'
          }
        }
      ]
    };
  }
  const contentType = request.headers.get('content-type') || '';
  const body = method === 'GET' || method === 'DELETE'
    ? undefined
    : contentType.includes('multipart/form-data')
      ? await request.formData()
      : await request.json().catch(() => undefined);

  // Intercept all requests to the sample dispatch
  if (requestedPath.startsWith('/logistics/dispatches/sample-dispatch-detail')) {
    if (method === 'GET') {
      return NextResponse.json({ success: true, data: globalAny.mockDispatch });
    }
    
    if (method === 'POST') {
      const action = requestedPath.split('/').pop();
      
      switch (action) {
        case 'submit':
          globalAny.mockDispatch.isSubmitted = true;
          break;
        case 'approve':
          globalAny.mockDispatch.status = 'DISPATCH_APPROVED';
          break;
        case 'reject':
          globalAny.mockDispatch.status = 'DISPATCH_DRAFT';
          globalAny.mockDispatch.isSubmitted = false;
          break;
        case 'mark-ready':
          globalAny.mockDispatch.status = 'READY_FOR_PICKUP';
          break;
        case 'assign-vehicle':
          globalAny.mockDispatch.status = 'VEHICLE_ASSIGNED';
          if (body) {
            Object.assign(globalAny.mockDispatch, body);
          }
          break;
        case 'start-loading':
          globalAny.mockDispatch.status = 'LOADING_IN_PROGRESS';
          break;
        case 'complete-loading':
          globalAny.mockDispatch.loadingCompletedAt = new Date().toISOString();
          if (body) Object.assign(globalAny.mockDispatch, body);
          break;
        case 'gate-out':
          globalAny.mockDispatch.status = 'DISPATCHED';
          globalAny.mockDispatch.gateOutAt = new Date().toISOString();
          break;
        case 'transit-update':
          globalAny.mockDispatch.status = 'IN_TRANSIT';
          if (body) {
            globalAny.mockDispatch.currentLocation = body.currentLocation;
            globalAny.mockDispatch.transitCondition = body.transitCondition;
            globalAny.mockDispatch.transitLogs.push({
              location: body.currentLocation,
              condition: body.transitCondition,
              remarks: body.remarks,
              timestamp: new Date().toISOString()
            });
          }
          break;
        case 'out-for-delivery':
          globalAny.mockDispatch.status = 'OUT_FOR_DELIVERY';
          break;
        case 'deliver':
          globalAny.mockDispatch.status = 'DELIVERED';
          if (body) Object.assign(globalAny.mockDispatch, body);
          break;
        case 'upload-pod':
          globalAny.mockDispatch.status = 'POD_RECEIVED';
          globalAny.mockDispatch.podStatus = 'PENDING';
          if (body) globalAny.mockDispatch.podUrl = body.podUrl;
          break;
        case 'pod-action':
          if (body?.action === 'ACCEPT') {
            globalAny.mockDispatch.podStatus = 'APPROVED';
          } else {
            globalAny.mockDispatch.status = 'DELIVERED';
            globalAny.mockDispatch.podUrl = null;
          }
          break;
        case 'close':
          globalAny.mockDispatch.status = 'DISPATCH_CLOSED';
          globalAny.mockDispatch.closedAt = new Date().toISOString();
          globalAny.mockDispatch.transitDuration = 48; // Mock duration
          break;
      }
      
      return NextResponse.json({ success: true, data: globalAny.mockDispatch });
    }
  }

  const cookieToken = request.cookies.get('accessToken')?.value;
  const token = authorization?.replace(/^Bearer\s+/i, '') || cookieToken;

  return forwardBackendRequest({
    path: backendPath,
    method,
    body,
    query: new URL(request.url).searchParams,
    token,
    idempotencyKey: request.headers.get('idempotency-key') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
    headers: {
      ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
      ...(request.headers.get('x-company-id') ? { 'x-company-id': request.headers.get('x-company-id')! } : {})
    }
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const PUT = proxy;
