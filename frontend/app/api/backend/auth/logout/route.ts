import { NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, '') ??
  process.env.BACKEND_API_URL?.replace(/\/$/, '') ??
  'http://backend:4000/api/v1';

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

    // NestJS logout returns 204 No Content
    const nextResponse = new NextResponse(null, { status: res.status });

    const setCookieHeader = res.headers.get('Set-Cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

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
