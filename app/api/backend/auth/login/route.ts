import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const json = await res.json();
    
    // Pass the response body through exactly as it is
    const nextResponse = NextResponse.json(json, { status: res.status });

    // Forward the Set-Cookie header from NestJS back to the browser
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
