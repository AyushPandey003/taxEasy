import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitOutcome = await rateLimit('api', request);
  
  // If rate limit is exceeded, return the rate limit response
  if (rateLimitOutcome instanceof NextResponse) {
    console.log('Rate limit exceeded:', rateLimitOutcome.status);
    return rateLimitOutcome;
  }

  // Add rate limit headers to the response
  const response = NextResponse.json({
    message: 'This is a test endpoint for rate limiting',
    timestamp: new Date().toISOString(),
    rateLimitInfo: {
      remaining: rateLimitOutcome?.remainingPoints,
      reset: rateLimitOutcome?.msBeforeNext,
      limit: 5, // Hardcoded for testing
    }
  });

  // Add rate limit headers if available
  if (rateLimitOutcome?.headers) {
    rateLimitOutcome.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
  }

  console.log('Request allowed:', {
    remaining: rateLimitOutcome?.remainingPoints,
    reset: rateLimitOutcome?.msBeforeNext
  });

  return response;
} 