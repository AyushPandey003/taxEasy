import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  points: number;
  duration: number;
}

const rateLimiters: Record<string, RateLimitConfig> = {
  payment: { points: 5, duration: 60 },
  api: { points: 5, duration: 60 },
  auth: { points: 10, duration: 60 },
  gemini: { points: 10, duration: 60 },
  newsApi: { points: 10, duration: 60 },
};

export async function rateLimit(
  type: keyof typeof rateLimiters,
  request?: NextRequest,
  identifier?: string
) {
  try {
    // Check Redis connection
    try {
      await kv.ping();
    } catch (error) {
      console.error('Redis connection error:', error);
      throw new Error('Rate limiter service unavailable');
    }

    let keyInput: string;

    if (request) {
      // Try to get x-forwarded-for, then fallback to a default IP
      keyInput = 
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
        '127.0.0.1';
    } else if (identifier) {
      keyInput = identifier;
    } else {
      keyInput = `global_${type}`;
    }
    const key = `rate_limit:${type}:${keyInput}`;

    // Get the rate limiter config
    const config = rateLimiters[type];
    if (!config) {
      console.warn(`Rate limiter type "${type}" not found. Skipping rate limit.`);
      return undefined;
    }

    // Get current count
    const currentCount = await kv.get<number>(key) || 0;

    // If we're at or over the limit, return rate limit error
    if (currentCount >= config.points) {
      const responseHeaders = new Headers();
      responseHeaders.set('X-RateLimit-Limit', String(config.points));
      responseHeaders.set('X-RateLimit-Remaining', '0');
      responseHeaders.set('X-RateLimit-Reset', String(config.duration));
      responseHeaders.set('Retry-After', String(config.duration));
      responseHeaders.set('Content-Type', 'application/json');

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded for ${type}. Please try again in ${config.duration} seconds.`,
          retryAfter: config.duration,
        },
        {
          status: 429,
          headers: responseHeaders,
        }
      );
    }

    // Increment the counter and set expiry in a single operation
    const newCount = await kv.incr(key);
    if (newCount === 1) {
      await kv.expire(key, config.duration);
    }

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(config.points));
    headers.set('X-RateLimit-Remaining', String(Math.max(0, config.points - newCount)));
    headers.set('X-RateLimit-Reset', String(config.duration));

    return { headers, remainingPoints: Math.max(0, config.points - newCount), msBeforeNext: config.duration * 1000 };
  } catch (error) {
    // Handle Redis connection errors
    if (error instanceof Error && error.message === 'Rate limiter service unavailable') {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message: 'Rate limiting service is currently unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Error during rate limiting:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during rate limiting.',
      },
      { status: 500 }
    );
  }
}

// Helper function to check if a response is a rate limit error
export function isRateLimitError(response: Response): boolean {
  return response.status === 429;
}

// Helper function to get retry after time from response
export async function getRetryAfter(response: Response): Promise<number> {
  const data = await response.json();
  return data.retryAfter || 60;
} 