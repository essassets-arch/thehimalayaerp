import { NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, '') ??
  process.env.BACKEND_API_URL?.replace(/\/$/, '') ??
  'http://127.0.0.1:4000/api/v1';

export async function POST(request: Request) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const incomingCookie = request.headers.get('Cookie');
    if (incomingCookie) {
      headers['Cookie'] = incomingCookie;
    }

    const res = await fetch(`${BACKEND_API_URL}/auth/logout`, {
      method: 'POST',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Always return a clean success response and expire all auth cookies
    const nextResponse = NextResponse.json({ success: true }, { status: 200 });

    const cookiesToClear = ['accessToken', 'token', 'himalaya_token', 'refreshToken', 'role', 'erpUser'];
    cookiesToClear.forEach((name) => {
      nextResponse.cookies.set(name, '', { path: '/', expires: new Date(0), maxAge: 0, sameSite: 'lax' });
      nextResponse.cookies.set(name, '', { path: '/auth/refresh', expires: new Date(0), maxAge: 0, sameSite: 'lax' });
    });

    return nextResponse;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'AbortError') {
      return NextResponse.json(
        { success: false, message: 'Backend request timed out.', code: 'TIMEOUT' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, message: (err as Error).message || 'Backend service unavailable.', code: 'SERVICE_UNAVAILABLE' },
      { status: 503 }
    );
  }
}
