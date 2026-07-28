import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.BACKEND_API_URL?.replace(/\/$/, '') ??
  'http://127.0.0.1:4000/api/v1';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Determine the exact URL. If BACKEND_API_URL already contains /api/v1, we shouldn't append it again.
    // Given .env.local has http://localhost:4000/api/v1
    const backendUrl = `${BACKEND_API_URL}/auth/login`;

    console.log('[Backend login bridge]', {
      backendUrl,
      email: body?.email,
    });

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const responseText = await response.text();

    let responseBody: unknown;

    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseBody = {
        message: responseText || 'Backend returned an invalid response',
      };
    }

    const nextResponse = NextResponse.json(responseBody, {
      status: response.status,
    });

    // Forward the Set-Cookie header from NestJS back to the browser
    const setCookieHeader = response.headers.get('Set-Cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('[Backend login bridge unavailable]', {
      backendUrl: BACKEND_API_URL,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              cause: error.cause,
              stack: error.stack,
            }
          : error,
    });

    const isTimeout =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');

    return NextResponse.json(
      {
        code: isTimeout ? 'BACKEND_TIMEOUT' : 'BACKEND_UNAVAILABLE',
        message: isTimeout
          ? 'Backend service timed out.'
          : 'Backend service is unavailable.',
        backendUrl:
          process.env.NODE_ENV === 'development'
            ? BACKEND_API_URL
            : undefined,
      },
      {
        status: 503,
      },
    );
  }
}
