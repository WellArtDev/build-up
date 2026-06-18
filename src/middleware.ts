import { NextRequest, NextResponse } from 'next/server';
import { securityHeaders } from '@/lib/security/headers';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rateLimit';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const response = NextResponse.next();

  // Security headers
  const headers = securityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  // Rate limiting
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(req);

    let rateLimit: { maxRequests: number; windowMs: number } = RATE_LIMITS.API;
    if (pathname === '/api/tenants/public' || pathname.startsWith('/api/t/')) {
      rateLimit = RATE_LIMITS.PUBLIC;
    } else if (pathname.startsWith('/api/auth/')) {
      rateLimit = RATE_LIMITS.AUTH;
    } else if (pathname.includes('/upload')) {
      rateLimit = RATE_LIMITS.UPLOAD;
    } else {
      rateLimit = RATE_LIMITS.API;
    }

    const result = checkRateLimit(key, rateLimit);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many requests. Coba lagi nanti.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)) } },
      );
    }

    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.resetAt));
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
