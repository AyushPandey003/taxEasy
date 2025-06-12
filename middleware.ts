import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';
type RateLimitType = Parameters<typeof rateLimit>[0];

const ROUTE_CONFIGS: { pathPrefix: string, type: RateLimitType }[] = [
  { pathPrefix: '/api/payment', type: 'payment' },
  { pathPrefix: '/api/auth', type: 'auth' },
  { pathPrefix: '/api/tax-returns', type: 'api' },
  { pathPrefix: '/api/documents', type: 'api' },
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip rate limiting for static files and images
  if (path.startsWith('/_next/') || path === '/favicon.ico') {
    return NextResponse.next();
  }

  // Find matching route config
  const config = ROUTE_CONFIGS.find(conf => path.startsWith(conf.pathPrefix));
  if (!config) {
    return NextResponse.next();
  }

  try {
    const rateLimitOutcome = await rateLimit(config.type, request);

    if (rateLimitOutcome instanceof NextResponse) {
      // Request is blocked by the rate limiter
      return rateLimitOutcome;
    }

    // Request is allowed, add rate limit headers
    const response = NextResponse.next();
    if (rateLimitOutcome?.headers) {
      rateLimitOutcome.headers.forEach((value, key) => {
        response.headers.set(key, value);
      });
    }
    return response;
  } catch (error) {
    console.error('Middleware rate limiting error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during rate limiting.',
      },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};