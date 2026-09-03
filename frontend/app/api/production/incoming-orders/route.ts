import { NextRequest, NextResponse } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const cookieToken =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('himalaya_token')?.value;
  const token = authorization?.replace(/^Bearer\s+/i, '') || cookieToken;

  try {
    const res = await forwardBackendRequest({
      path: '/production/incoming-orders',
      method: 'GET',
      token,
      headers: {
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
        Vary: 'Cookie, Authorization',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch incoming orders', data: [] },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}
