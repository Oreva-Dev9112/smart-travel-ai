import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 10; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get client IP
  const ip = request.ip ?? '127.0.0.1';

  // Check rate limit
  const now = Date.now();
  const rateLimitInfo = rateLimit.get(ip);

  if (rateLimitInfo) {
    if (now - rateLimitInfo.timestamp > RATE_LIMIT_WINDOW) {
      // Reset if window has passed
      rateLimit.set(ip, { count: 1, timestamp: now });
    } else if (rateLimitInfo.count >= RATE_LIMIT) {
      // Rate limit exceeded
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    } else {
      // Increment count
      rateLimitInfo.count++;
    }
  } else {
    // First request
    rateLimit.set(ip, { count: 1, timestamp: now });
  }

  // Validate request body for generate-itinerary endpoint
  if (request.nextUrl.pathname === '/api/generate-itinerary') {
    try {
      const body = request.body;
      if (!body) {
        return NextResponse.json(
          { error: 'Request body is required' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 